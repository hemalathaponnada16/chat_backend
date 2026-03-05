const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");
const User = require("../models/User.js");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Protected route example
router.get("/profile", verifyToken, (req, res) => {
  res.status(200).json({
    message: "Access granted",
    user: req.user,
  });
});
router.get("/all-users", async (req, res) => {
  try {
    const users = await User.find().select("username");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});
module.exports = router;
