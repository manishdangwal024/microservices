const mongoose = require("mongoose");

function connectToDb() {
  mongoose.connect(process.env.MONGODB_URI)
  .then(()=>{
    console.log("Connected to the database");
  })
  .catch((error)=>{
    console.log("Error in connecting the database",error);
  });
}

module.exports=connectToDb