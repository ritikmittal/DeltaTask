const { use } = require("./routes/route");
const User = require("./models/User.js");
const ACTIVE_USERS = [];

const addUser = ({ id, name, room }) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();
  let UserExist = ACTIVE_USERS.find(
    (user) => user.name === name && user.room === room
  );

  if (UserExist) {
    return { error: "User already exists" };
  }

  const user = { id: id, name: name, room: room };

  ACTIVE_USERS.push(user);
  let active_users = ACTIVE_USERS.filter((user) => user.room === room);
  active_users = active_users.map((user) => user.name);
  return { user, active_users };
};

const addNotice = (notice, room_id) => {
  const update = { $push: { notices: notice } };
  Room.findOneAndUpdate({ room_id: room_id }, update).exec((err, room) => {
    if (room) {
      console.log(notice);
    } else {
      console.log(err);
    }
  });
};

const removeUser = (id) => {
  const index = ACTIVE_USERS.findIndex((user) => user.id === id);
  if (index !== -1) {
    return ACTIVE_USERS.splice(index, 1)[0];
  }
  return;
};

const getUser = (id) => ACTIVE_USERS.find((user) => user.id === id);

module.exports = { addUser, removeUser, getUser, addNotice };
