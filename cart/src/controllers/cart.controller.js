const cartModel = require("../models/cart.model");

async function addItemToCart(req, res) {
  const { productId, qty } = req.body;
  const user = req.user;

  let cart = await cartModel.findOne({ user: user.id });
  if (!cart) {
    cart = new cartModel({ user: user.id, items: [] });
  }
  const existingItemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId,
  );
  if (existingItemIndex >= 0) {
    cart.items[existingItemIndex].quantity += qty;
  } else {
    cart.items.push({ productId, quantity: qty });
  }
  await cart.save();
  res.status(200).json({
    message: "Items add to cart",
    cart,
  });
}

async function updateItemQuantity(req, res) {
  const { productId } = req.params;
  const { qty } = req.body;
  const user = req.user;

  const cart = await cartModel.findOne({ user: user.id });

  if (!cart) {
    return res.staus(404).json({
      message: "cart not found",
    });
  }
  const checkProductIdIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId,
  );
  if (checkProductIdIndex >= 0) {
    cart.items[checkProductIdIndex].quantity += qty;
  } else {
    return res.status(404).json({
      message: "Add item to cart first",
    });
  }
  await cart.save();
  res.status(200).json({
    message: "cart updated successfully",
    cart: cart,
  });
}

async function getCart(req, res) {
  try {
    const user = req.user;
  
    let cart = await cartModel.findOne({ user: user.id });
    if (!cart) {
      cart = new cartModel({ user: user.id, items: [] });
      await cart.save();
    }
    res.status(200).json({
      cart,
      total: {
        itemCount: cart.items.length,
        totalQunatity: cart.items.reduce((sum, item) => sum + item.quantity,0),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message:"Internal server error",
      error:error.message
    })
  }
}

async function deleteProduct(req, res) {
  try {
    const { productId } = req.params;
    const user = req.user;
    const cart = await cartModel.findOne({ user: user.id });
    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }
    // Remove from the cart

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );
    await cart.save()
    return res.status(200).json({
      message:"Product removed sucesfully!"
    })
  } catch (error) {
    return res.status(500).json({
      message: "something went wrong",
      error:error.message
    });
  }
}

async function deleteCart(req,res) {
  try {
    const user = req.user;
    const cart = await cartModel.findOneAndDelete({user:user.id});
    if(!cart){
      return res.status(404).json({
        message:"no cart found" 
      })
    }
    return res.status(200).json({
      message:"Cart deleted sucessfully"
    })
  } catch (error) {
    return res.status(500).json({
      message:"Internal server error",
      error:error.message

    })
  }
}
module.exports = { addItemToCart, updateItemQuantity, getCart, deleteProduct,deleteCart };
