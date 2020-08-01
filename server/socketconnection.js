const { addUser, removeUser, getUser, addNotice } = require("./users");
const { use } = require("passport");

const socketConnection = (socket, io) => {
  console.log("we have a new connection");
  socket.on("join", ({ name, room }, callback) => {
    console.log(name, room);
    const { error, user, active_users } = addUser({
      id: socket.id,
      name: name,
      room: room,
    });
    if (error) return callback(error);
    socket.emit("active_users", { active_users });
    socket.broadcast.to(user.room).emit("add_active_users", { name });
    socket.join(user.room);
  });

  socket.on("sendNotice", (massage, callback) => {
    const user = getUser(socket.id);
    addNotice(massage, user.id);
    socket.broadcast
      .to(user.room)
      .emit("notice", { user: user.name, text: massage });
  });

  socket.on("sendMassage", (masssage, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("massage", { user: user.name, text: masssage });

    callback();
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("massage", {
        user: "admin",
        text: `${user.name} has left`,
      });
    }
    console.log("User has disconnected");
  });
};

module.exports = socketConnection;
