const express = require("express");
const createAuthMiddleware = require("../middleware/auth.middleware");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrderById,
  updateOrderAddress,
} = require("../controllers/order.controller");
const {
  userAddressUserValidation,
} = require("../middleware/validation.middleware");

const router = express.Router();

// creating a order
router.post(
  "/",
  createAuthMiddleware(["user"]),
  userAddressUserValidation,
  createOrder,
);

// get my order
router.get("/me", createAuthMiddleware(["user"]), getMyOrders);

router.get("/:id", createAuthMiddleware(["user", "admin"]), getOrderById);

router.post("/:id/cancel", createAuthMiddleware(["user"]), cancelOrderById);

router.patch(
  "/orders/:id/address",
  createAuthMiddleware(["user"]),
  userAddressUserValidation,
  updateOrderAddress,
);
module.exports = router;
