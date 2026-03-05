const express = require("express");

const router = express.Router();
const {createAuthMidlleware}= require("../middleware/auth.middleware");
const { createPayment, verifyPayment } = require("../controllers/payment.controller");

router.post("/create/:orderId",createAuthMidlleware(["user"]),createPayment)

router.post("/verify",createAuthMidlleware(["user"]),verifyPayment)

module.exports=router;