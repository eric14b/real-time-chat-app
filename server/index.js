require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");


const app = express();
const port = 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173" // frontend port
  }
});
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


app.use(cors());
app.use(express.json());
// Connect to MongoDB Atlas
connectDB();

//// User registration + auto login
const bcrypt = require("bcrypt");
const User = require("./models/User");

app.post("/auth/register", async (req, res) => {
  try {
    // receives email and password from user
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    // prevent duplicate users
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists!" });
    }

    /* password rule enforcement
    - at least 1 uppercase
    - at least 1 lowercase
    - at least 1 number
    - minimum length: 8
    */
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters and include 1 uppercase, lowercase, and a number"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash });

    // auto-login after registering
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(201).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


//// User login
const jwt = require("jsonwebtoken");
// Authorizes user password with JWT.
// returns: JWT token
app.post("/auth/login", async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  // Find by username or email
  const user = await User.findOne({
    $or: [
      { email: identifier },
      { username: identifier }
    ]
  });

  if (!user) {
    return res.status(401).json({ error: "User with this email or username does not exist!" });
  }

  const validPw = await bcrypt.compare(password, user.passwordHash);
  if (!validPw) {
    return res.status(401).json({ error: "Invalid password. Try again!" });
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
})

//// JWT authentication to ensure current user
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

app.get("/me", authMiddleware, async (req, res) => {
  // Authenticate current user and returns response with userId and username
  const user = await User.findById(req.userId).select("username");
  res.json({ userId: req.userId, username: user.username });
})

//// Create a conversation with participant's username and returns its ID
const Conversation = require("./models/Conversation");

app.post("/conversations", authMiddleware, async (req, res) => {
  try {
    const { otherUsername } = req.body;
    if (!otherUsername) {
      return res.status(400).json({ error: "Username required" });
    }

    // 1. find the otherUsername
    const otherUser = await User.findOne({ username: otherUsername });
    if (!otherUser) {
      return res.status(404).json({ error: "User not found!" });
    }
    // 2. prevent chatting with oneself
    if (otherUser._id.equals(req.userId)) {
      return res.status(400).json({ error: "Cannot chat with oneself!" });
    }

    // Reuse existing conversation
    const existingConvo = await Conversation.findOne({
      participants: { $all: [req.userId, otherUser._id] }
    });
    if (existingConvo) {
      return res.json(existingConvo);
    }

    // Create new conversation
    const conversation = await Conversation.create({
      participants: [req.userId, otherUser._id]
    });

    res.status(201).json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error in creating conversation!" });
  }
});

app.get("/conversations", authMiddleware, async (req, res) => {
  // all conversations where user has participated in
  const conversations = await Conversation.find({
    participants: req.userId
  })
    .populate("participants", "username")
    .sort({ updatedAt: -1 });

  res.json(conversations);
});

//// Add message to conversation
const Message = require("./models/Message");
app.post("/messages", authMiddleware, async (req, res) => {
  const { conversationId, text } = req.body;

  if (!conversationId || !text) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const message = await Message.create({
    conversationId,
    senderId: req.userId,
    text
  });

  // broadcast message to conversation for real-time updates
  io.to(conversationId).emit("newMessage", message);

  res.status(201).json(message);
});

//// Fetch messages (load chat history)
app.get("/messages/:conversationId", authMiddleware, async (req, res) => {
  const { conversationId } = req.params;

  const messages = await Message.find({ conversationId })
    .populate("senderId", "username")
    .sort({ createdAt: 1 });

  res.json(messages);
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
