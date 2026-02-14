const { body, validationResult } = require("express-validator");

const respondWithValidationError = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerUserValidation = [
  body("username")
    .isString()
    .withMessage("Username must be a string")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 character long"),

  body("email").isEmail().withMessage("Invalid Emailaddress"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be atleast 6 characters long"),

  body("fullName.firstName")
    .isString()
    .withMessage("First name must be String")
    .notEmpty()
    .withMessage("First name is required"),

  body("fullName.lastName")
    .isString()
    .withMessage("last name must be String")
    .notEmpty()
    .withMessage("last name is required"),

  body("role")
    .optional()
    .isIn(["user", "seller"])
    .withMessage("Role musr be either 'user and 'seller'"),

  respondWithValidationError,
];

const loginUserValidations = [
  body("email").optional().isEmail().withMessage("Invalid Email address"),

  body("username").optional().isString().withMessage("Username must be string"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be 6 character long"),

  respondWithValidationError,
];

const userAddressUserValidation = [
  body("street")
    .isString()
    .withMessage("Street must be String")
    .notEmpty()
    .withMessage("Street is required"),

  body("city")
    .isString()
    .withMessage("city must be String")
    .notEmpty()
    .withMessage("city is required"),

  body("state")
    .isString()
    .withMessage("state must be String")
    .notEmpty()
    .withMessage("state is required"),

  body("zip")
    .isString()
    .withMessage("zip must be String")
    .notEmpty()
    .withMessage("zip is required"),

  body("country")
    .isString()
    .withMessage("country must be String")
    .notEmpty()
    .withMessage("country is required"),

  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be boolean"),

  respondWithValidationError,
];

module.exports = {
  registerUserValidation,
  loginUserValidations,
  userAddressUserValidation,
};
