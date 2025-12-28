const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },

  // Optional avatarUrl
  avatarUrl: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model("User", userSchema);
