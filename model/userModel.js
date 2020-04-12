const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullname: String,
  phone: {
    type: String,
    required: true,
  },
  birthday: String,
  avatar: String,
});

const Users = mongoose.model("users", UserSchema);
module.exports = Users;
