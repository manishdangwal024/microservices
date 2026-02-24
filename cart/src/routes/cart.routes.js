const express = require("express");

const createAuthMiddleware = require("../middleware/auth.middleware");

const cartController = require("../controllers/cart.controller");

const {
  validationAddItemToCart,
  validateUpdateCartItem,
  validateProductId,
} = require("../middleware/validation.middleware");

const router = express.Router();

router.get("/", createAuthMiddleware(["user"]), cartController.getCart);

router.post(
  "/items",
  createAuthMiddleware(["user"]),
  validationAddItemToCart,
  cartController.addItemToCart,
);

router.patch(
  "/items/:productId",
  createAuthMiddleware(["user"]),
  validateUpdateCartItem,
  cartController.updateItemQuantity,
);

router.delete(
  "/item/:productId",
  createAuthMiddleware["user"],
  validateProductId,
  cartController.deleteProduct,
);

router.delete("/", createAuthMiddleware["user"], cartController.deleteCart);

module.exports = router;
