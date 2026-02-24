const mongoose = require("mongoose");
function connectTodb() {
  mongoose
    .connect(process.env.MongoDB_URI)
    .then(() => {
      console.log("Database is connected");
    })
    .catch((error) => {
      console.log("Error in connecting the database", error);
    });
}

module.exports = connectTodb;
