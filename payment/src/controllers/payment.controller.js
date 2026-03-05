const paymentModel = require("../models/payment.model");
const axios = require("axios");

const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createPayment(req, res) {
  const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];
  try {
    const orderId = req.params.orderId;
    const orderResponse = await axios.get(
      `http://localhost:3003/api/order/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const price = orderResponse.data.order.totalPrice;
    const ordeR = await razorpay.orders.create(price);

    const payment = await paymentModel.create({
      order: orderId,
      razorpayOrderId: ordeR.id,
      user: req.user.id,
      price: {
        amount: ordeR.amount,
        currency: ordeR.currency,
      },
    });
    return res.status(201).json({
      message: "Payment initiated",
      payment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}


async function verifyPayment(req, res) {
  const { razorpayOrderId, paymentId, signature } = req.body;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  try {
    const {
      validatePaymentVerification,
    } = require("../../node_modules/razorpay/dist/utils/razorpay-utils");

    const isValid = validatePaymentVerification(
      {
        order_id: razorpayOrderId,
        payment_id: paymentId,
      },
      signature,
      secret,
    );
    if (!isValid) {
      return res.status(400).json({
        message: "Invalid signature",
      });
    }
    const payment = await paymentModel.findOne({
      razorpayOrderId,
      status: "PENDING",
    });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    payment.paymentId = paymentId;
    payment.signature = signature;
    payment.status = "COMPLETED";

    await payment.save();

    res.status(200).json({
      message: "Payment verified sucessfully",
      payment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
}

module.exports = { createPayment, verifyPayment };
