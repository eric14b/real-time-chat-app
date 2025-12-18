require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const app = express();
const port = 3000;


app.use(express.json());

// Connect to MongoDB Atlas
connectDB();

// User registration
const crypt = require("bcrypt");
const User = require("./models/User");

app.post("/auth/register", async (req, res) => {
  // receives email and password from user
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing credentials"});
  }

  // prevent duplicate users
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({error: "User already exists!"});
  }

  const passwordHash = await bcrypt.hash(password, 10);
  
  await User.create({ email, passwordHash });
  
  res.status(201).json({ message: "User created" });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
