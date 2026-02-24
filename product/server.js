require("dotenv").config();
const app = require("./src/app");
const connectToDb = require("./src/db/db");
connectToDb();
app.listen(3001, () => {
  console.log("Server is running on the port 3001");
});
