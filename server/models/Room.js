const mongoose = require("mongoose");
const roomSchema = mongoose.Schema({
  room_id: String,
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  notices: [String],
});
module.exports = mongoose.model("room", roomSchema);
