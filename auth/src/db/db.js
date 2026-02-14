const mongoose = require("mongoose");

async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Database connected successfully")
    } catch (error) {
        console.log("Database connection failed",error);
    }
}

module.exports=connectToDB