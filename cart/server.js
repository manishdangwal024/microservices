require("dotenv").config();
const app = require("./src/app");
const connectTodb = require("./src/db/db");
connectTodb();
app.listen(3002, () => {
  console.log(" cart service is running on the port 3002");
});
