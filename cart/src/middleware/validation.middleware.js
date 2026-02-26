const { body, validationResult,param} = require("express-validator");
const mongoose = require("mongoose");
function cartValidationResult(req, res, next) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({
      message: "Validation error",
      error: error.array(),
    });
  }
  next();
}

const validationAddItemToCart = [
  body("productId")
    .isString()
    .withMessage("Product ID must be a String")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid product id format"),

  body("qty")
    .isInt({ gt: 0 })
    .withMessage("Quantity must be a positive integer"),
  cartValidationResult,
];

const validateUpdateCartItem = [
  param("productId")
    .isString()
    .withMessage("Product ID must be string")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid Product ID format"),

    body('qty')
    .isInt({gt:0})
    .withMessage('Quantity must be a positive intiger'),

    cartValidationResult
];

const validateProductId=[
  param("productId")
    .isString()
    .withMessage("Product ID must be string")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid Product ID format"),
    cartValidationResult
]
module.exports = { validationAddItemToCart,validateUpdateCartItem,validateProductId };
