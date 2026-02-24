const express = require("express");
const cookieParser = require("cookie-parser");
const router = require("./router/product.routes");

const app= express();
app.use(cookieParser());
app.use(express.json());
app.use('/api/products',router)

module.exports=app;