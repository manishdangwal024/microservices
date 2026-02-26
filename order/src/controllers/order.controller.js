const orderModel = require("../model/order.model");
const axios = require("axios");

async function createOrder(req, res) {
  const user = req.user;
  const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];
  try {
    // fetch user cart from cart service
    const cartResponse = await axios.get(`http://localhost:3002/api/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const products = await Promise.all(
      cartResponse.data.cart.items.map(async (item) => {
        return (
          await axios.get(
            `http://localhost:3001/api/products/${item.productId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
        ).data.product;
      }),
    );

    let priceAmount = 0;
    const orderItems = cartResponse.data.cart.items.map((item, index) => {
      const product = products.find((p) => p._id === item.productId);

      // if not in the stock, does not  allow order creation
      if (!product.stock || product.stock < item.quantity) {
        throw new Error(
          `Product ${product.title} is out of stock or insufficient stock`,
        );
      }
      const itemTotal = product.price.amount * item.quantity;
      priceAmount += itemTotal;
      return {
        product: item.productId,
        quantity: item.quantity,
        prices: {
          amount: itemTotal,
          currency: product.price.currency,
        },
      };
    });
    const order = await orderModel.create({
      user: user.id,
      items: orderItems,
      status: "PENDING",
      totalPrice: {
        amount: priceAmount,
        currency: "INR",
      },
      shippingAddress: req.body.shippingAddress,
    });
    res.status(201).json({
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function getMyOrders(req, res) {
  const user = req.user;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const order = await orderModel.find({ user: user.id });
    if (!order) {
      return res.status(200).json({
        message: "No order is made till now",
      });
    }
    const totalOrder = await orderModel.countDocuments({ user: user.id });
    res.status(200).json({
      order,
      meta: {
        total: totalOrder,
        page,
        limit,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function getOrderById(req, res) {
  const user = req.user;
  const orderId = req.params.id;
  try {
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        message: "Order not found!",
      });
    }

    if (order.user.toString() !== user.id) {
      return res.status(403).json({
        message: "Forbidden :You do not have access",
      });
    }
    return res.status(200).json({
      message: "Order fetched successfull",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function cancelOrderById(req, res) {
  const OrderId = req.params.id;
  const user = req.user;

  try {
    const order = await orderModel.findById(OrderId);
    if (!order) {
      return res.status(404).json({
        message: "Order not found!",
      });
    }
    if (order.user.toString() !== user.id) {
      return res.status(403).json({
        message: "Forbidden:You not have sufficient permissions",
      });
    }
    // only "PENDING" oreders can be cancelled
    if (order.status !== "PENDING") {
      return res.status(409).json({
        message: "Order can not be cancelled at this moment",
      });
    }
    order.status = "CANCELLED";
    await order.save();
    res.status(200).json({ order });
  } catch (error) {
    return res.status(500).json({
      message: "Internala server error",
    });
  }
}

async function updateOrderAddress(req, res) {
  const user = req.user;
  const orderId = req.params.id;
  try {
    const order = await orderModel.findById(orderId);
    if(!order){
      return res.status(404).json({
        message:"Order not found"
      })
    }
    if(order.user.toString()!==user.id){
      return res.status(403).json({
        message:"forbidden:you do not have access"
      })
    }
    // Only "PENDING" orders can have the address updated

    if(order.status!=="PENDING"){
      return res.status(409).json({message:"Order address cannot be updated"})
    }
    order.shippingAddress={
      street:req.body.shippingAddress.street,
      city:req.body.shippingAddress.city,
      state:req.body.shippingAddress.state,
      zip:req.body.shippingAddress.zip,
      country:req.body.shippingAddress.country
    }
    await order.save();

    res.status(200).json({
      order
    })
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrderById,
  updateOrderAddress,
};
