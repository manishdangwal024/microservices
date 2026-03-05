const mongoose = require("mongoose");

async function connectToDb() {
  try {
   await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to the database");
  } catch (error) {
    console.log("Error in connecting to the database", error.message);
  }
}

module.exports = connectToDb;
