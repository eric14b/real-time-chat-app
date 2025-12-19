require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const cors = require("cors");

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
connectDB();

// User registration
const bcrypt = require("bcrypt");
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


// User login
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Checks JWT validity of user
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Format: "Bearer <token>"
  const token = authHeader.split(" ")[1];
  try {
    // verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid JWT token" });
  }
};

app.get("/me", authMiddleware, (req, res) => {
  // proected route that returns current authenticated user
  res.json({ userId: req.userId });
})

app.post("/auth/login", async (req, res) => {
  const { email, password} = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: "User with this email does not exist!"});
  }

  const validPw = await bcrypt.compare(password, user.passwordHash);
  if (!validPw) {
    return res.status(401).json({ error: "Invalid password. Try again!"});
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
})



app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
