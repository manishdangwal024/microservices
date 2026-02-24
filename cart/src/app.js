const express = require("express");
const cookirParser = require("cookie-parser");
const router = require("./routes/cart.routes");

const app = express();
app.use(express.json());
app.use(cookirParser());
app.use("/api/cart", router);
module.exports = app;
