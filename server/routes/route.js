const Router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User.js");
const Room = require("../models/Room.js");
const mongoose = require("mongoose");

Router.get("/profile", async (req, res) => {
  try {
    const token = jwt.verify(req.header("auth-token"), "secret");
    User.findById(token.id).exec((err, user) => {
      if (user.room === undefined) res.status(400).send("create-room");
      else
        Room.findOne({ room_id: user.room }).exec((err, room) => {
          let username = user.username;
          res.json({ room, username });
        });
    });
  } catch (err) {
    console.log(err);
  }
});

Router.post("/join", (req, res) => {
  try {
    const roomKey = req.body.roomKey;
    const token = jwt.verify(req.header("auth-token"), "secret");
    const update = { $push: { users: token.id } };
    Room.findOneAndUpdate({ room_id: roomKey }, update).exec((err, room) => {
      if (!room) resstatus(400).send("room does not exist");
      else {
        User.findByIdAndUpdate(token.id, { room: roomKey }).exec(
          (err, user) => {
            if (!user) res.status(400).send("failed-to-join");
            else res.status(200).send("success");
          }
        );
      }
    });
  } catch (err) {
    console.log(err);
    res.status(401).send("login-again");
  }
});

Router.post("/login", async (req, res) => {
  console.log(req.body);
  const username = req.body.username;
  const password = req.body.password;
  await User.findOne({ username: username }).exec((err, user) => {
    if (!user) res.status(400).send("user-not-found");
    else {
      bcrypt.compare(password, user.password, (err, hash) => {
        if (err) console.log(err);
        else {
          const token = jwt.sign({ id: user._id }, "secret");
          res.header("auth-token", token).status(200).send(token);
        }
      });
    }
  });
});

Router.post("/create_room", async (req, res) => {
  try {
    const token = jwt.verify(req.header("auth-token"), "secret");
    const update = { room: token.id };

    await User.findByIdAndUpdate(token.id, update).exec((err, user) => {
      if (!user) res.status(401).send("not-authorised");
      else {
        const roomObj = {
          room_id: token.id,
          users: [mongoose.Types.ObjectId(token.id)],
          notices: [`Room created by ${user.username}`],
        };
        const room = new Room(roomObj);
        room.save();
        res.send(`success ${token.id}`);
      }
    });
  } catch (err) {
    res.status(400).send("user-not-verified");
  }
});

// Router.post("/notify", async (req, res) => {
//   try {
//     const token = jwt.verify(req.header("auth-token"), "secret");
//     const update = { $push: { notices: req.body.notice } };

//     await User.findById(token.id).exec((err, user) => {
//       if (!user) res.status(400).send("login-again");
//       else {
//         Room.findOneAndUpdate({ room_id: user.room }, update).exec(
//           (err, room) => {
//             if (room) {
//               console.log(room);
//               res.status(200).send(req.body.notice);
//             } else {
//               console.log(err);
//             }
//           }
//         );
//       }
//     });
//   } catch (err) {
//     res.status(400).send("user-not-verified");
//   }
// });

Router.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ username: username }).exec((err, user) => {
    if (user) res.status(400).send("already-exist");
    else {
      bcrypt.genSalt(12, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
          const userObj = { username: username, password: hash };
          const user = new User(userObj);
          user.save();
          const token = jwt.sign({ id: user._id }, "secret");
          res.status(200).send(token);
        });
      });
    }
  });
});

module.exports = Router;
