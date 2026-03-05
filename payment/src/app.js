const express= require("express");
const cookieParser= require("cookie-parser");
const router = require("./router/payment.routes");

const app= express();

app.use(express.json())
app.use(cookieParser())
app.use("/api/payments",router)

module.exports=app;