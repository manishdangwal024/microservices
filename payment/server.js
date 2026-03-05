require("dotenv").config();
const app = require("./src/app");
const connectToDb = require("./src/db/db");

connectToDb();

app.listen(3004, () => {
  console.log("Payment service is running on the port 3004");
});
