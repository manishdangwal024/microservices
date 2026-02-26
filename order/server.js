require("dotenv").config();
const app = require("./src/app");
const ConnectToDb = require("./src/db/db");
ConnectToDb();
app.listen(3003, () => {
  console.log("Server is running on the port 3003");
});
