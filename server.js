const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const socket = require("./socket");

const app = require("./App");

mongoose
  .connect(process.env.DATABASE_URL)
  .then((connect) => {
    const server = app.listen(process.env.PORT, (result) => {
      console.log(
        `Server running at port ${process.env.PORT} with the database connected`
      );
    });
    const io = socket.init(server);
    io.on("connection", (connect) => {
      console.log("a user is connected");
    });
  })
  .catch((err) => {
    console.log(err);
  });

// process.on("unhandledRejection", (err) => {
//   process.exit(1);
// });
