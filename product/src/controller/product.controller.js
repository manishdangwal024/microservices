const productModel = require("../models/product.model");
const uploadImage = require("../services/imagekit.service");

async function createProduct(req, res) {
  try {
    const { title, description, priceAmount, priceCurrency = "INR" } = req.body;
    const seller = req.user.id;
    const price = {
      amount: Number(priceAmount),
      currency: priceCurrency,
    };
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "At least one image is required",
      });
    }

    const images = await Promise.all(
      req.files.map((file) =>
        uploadImage({ buffer: file.buffer, folder: "/products" }),
      ),
    );

    const product = await productModel.create({
      title,
      description,
      price,
      seller,
      images,
    });
    return res.status(201).json({
      message: "Product created",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
}

async function getProducts(req, res) {
  try {
    const { q, minprice, maxprice, skip = 0, limit = 20 } = req.query;
    const filter = {};

    if (q) {
      filter.$text = { $search: q };
    }
    if (minprice) {
      filter["price.amount"] = {
        ...filter["price.amount"],
        $gte: Number(minprice),
      };
    }
    if (maxprice) {
      filter["price.amount"] = {
        ...filter["price.amount"],
        $lte: Number(minprice),
      };
    }

    const products = await productModel
      .find(filter)
      .skip(Number(skip))
      .limit(Math.min(Number(limit), 20));

    return res.status(200).json({
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    res.status(200).json({ product: product });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
}

async function updateProduct(req, res) {
  try {
    const { title, description, price } = req.body;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Inavlid product id",
      });
    }
    const updatesProduct = {};
    if (title) {
      updatesProduct.title = title;
    }
    if (description) {
      updatesProduct.description = description;
    }
    if (price?.amount) {
      updatesProduct["price.amount"] = price.amount;
    }
    if (price?.currency) {
      updatesProduct["price.currency"] = price.currency;
    }

    if (!Object.keys(updatesProduct).length) {
      return res.status(400).json({
        message: "No fields provided for updates",
      });
    }
    const product = await productModel.findOneAndUpdate(
      {
        _id: id,
        seller: req.user.id,
      },
      {
        $set: updatesProduct,
      },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product updated sucessfully",
      product: product,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }
    const product = await productModel.findOneAndDelete({
      _id: id,
      seller: req.user.id,
    });
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
}

async function getProductsBySeller(req, res) {
  try {
    const seller = req.user.id;
    const { skip = 0, limit = 20 } = req.query;
    const products = await productModel
      .find({ seller: seller })
      .skip(skip)
      .limit(Math.min(limit, 20));
      return res.status(200).json({
        data:products
      })
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong!",
      error: error.message,
    });
  }
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
};

// for (const file of req.files || []) {
//   const uploaded = await uploadImage({
//     buffer: file.buffer,
//     folder: "/products",
//   });
//   images.push(uploaded);
// }
