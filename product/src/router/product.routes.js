const express = require("express");
const { CreateAuthMiddleware } = require("../middleware/auth.middleware");
const multer = require("multer");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
} = require("../controller/product.controller");
const {
  createProductValidation,
} = require("../middleware/validator.middleware");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/products/

router.post(
  "/",
  CreateAuthMiddleware(["admin", "seller"]),
  upload.array("images", 5),
  createProductValidation,
  createProduct,
);

router.get("/", getProducts);

router.patch("/:id", CreateAuthMiddleware(["seller"]), updateProduct);

router.delete("/:id", CreateAuthMiddleware(["seller"]), deleteProduct);

router.get("/seller", CreateAuthMiddleware(["seller"]), getProductsBySeller);

router.get("/:id", getProductById);
module.exports = router;
