const express = require("express")
const cookieParser= require("cookie-parser")
const router = require("./routes/order.routes")

const app= express()

app.use(express.json())
app.use(cookieParser())
app.use("/api/order",router)

module.exports=app;