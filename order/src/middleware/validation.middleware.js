const { body, validationResult } = require("express-validator");

const respondWithValidationError = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};



const userAddressUserValidation = [
  body("shippingAddress.street")
    .isString()
    .withMessage("Street must be String")
    .notEmpty()
    .withMessage("Street is required"),

  body("shippingAddress.city")
    .isString()
    .withMessage("city must be String")
    .notEmpty()
    .withMessage("city is required"),

  body("shippingAddress.state")
    .isString()
    .withMessage("state must be String")
    .notEmpty()
    .withMessage("state is required"),

  body("shippingAddress.zip")
    .isString()
    .withMessage("zip must be String")
    .notEmpty()
    .withMessage("zip is required"),

  body("shippingAddress.country")
    .isString()
    .withMessage("country must be String")
    .notEmpty()
    .withMessage("country is required"),


  respondWithValidationError,
];





module.exports={userAddressUserValidation}