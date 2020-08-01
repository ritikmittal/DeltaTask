const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const router = require("./routes/route.js");
const socketConnection = require("./socketconnection.js");
const socketio = require("socket.io");
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => socketConnection(socket, io));
mongoose.connect("mongodb://db/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.set("useFindAndModify", false);

server.listen(PORT, () =>
  console.log("Server is up and running on port", PORT)
);
