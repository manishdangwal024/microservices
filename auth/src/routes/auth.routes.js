const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  getUserAddresses,
  addUserAddress,
  deleteUserAddress,
} = require("../controller/auth.controller");

const {
  registerUserValidation,
  loginUserValidations,
  userAddressUserValidation,
} = require("../middlewares/validator.middleware");

const { authMiddleware } = require("../middlewares/auth.middleware");




// POST /api/auth/register
router.post("/register", registerUserValidation, registerUser);

// POST /api/auth/login
router.post("/login", loginUserValidations, loginUser);

// POST /api/auth/me
router.get("/me", authMiddleware, getCurrentUser);

// POST /api/auth/logout
router.get('/logout',logoutUser);

// GET /api/auth/users/me/addresses ==> List saved addresses:mark default
router.get("/users/me/addresses",authMiddleware,getUserAddresses)

// POST /api/auth/users/me/addresses
router.post("/users/me/addresses",userAddressUserValidation,authMiddleware,addUserAddress)

//DELETE /api/auth/users/me/addresses/:addressId
router.delete("/users/me/addresses/:addressId",authMiddleware,deleteUserAddress)

module.exports = router;
