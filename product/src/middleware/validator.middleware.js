const { body, validationResult } = require("express-validator");

function handleValidationErrors(req, res, next) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({
      message: "validation error",
      error: error.array(),
    });
  }
  next();
}

const createProductValidation = [
  body("title").isString().trim().notEmpty().withMessage("Title is required!"),

  body("description")
    .optional()
    .isString()
    .withMessage("description must be a string")
    .trim()
    .isLength({ max: 500 })
    .withMessage("description max length is 500 characters"),

  body("priceAmount")
    .exists()
    .withMessage("Amount price must be a number >0")
    .bail()
    .isFloat({ gt: 0 })
    .withMessage("Price amount must be number >0"),

  body("priceCurrency")
    .optional()
    .isIn(["USD", "INR"])
    .withMessage("price currency must be USD or INR"),

  handleValidationErrors,
];

module.exports = { createProductValidation };
