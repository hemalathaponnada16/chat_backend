
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper: Remove sensitive fields
const sanitizeUser = (user) => {
  const { password, ...safeUser } = user._doc;
  return safeUser;
};

// Register user
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User created", user: sanitizeUser(user) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // shorter access token
    });

    res.status(200).json({ message: "Login successful", user: sanitizeUser(user), token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };

// const User = require("../models/User"); // adjust file name if needed
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// // Register user
// const registerUser = async (req, res) => {
//   const { username, email, password } = req.body;

//   try {
//     const userExists = await User.findOne({ email });
//     if (userExists) return res.status(400).json({ message: "User already exists" });

//     // 🔹 Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       username,
//       email,
//       password: hashedPassword,
//     });

//     res.status(201).json({ message: "User created", user });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // Login user
// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "User not found" });

//     // 🔹 Compare hashed password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//     // Optional: create JWT token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });

//     res.status(200).json({ message: "Login successful", user, token });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = { registerUser, loginUser };
// controllers/authController.js
// const User = require("../models/User"); // adjust file name if needed

// TEMPORARY plain login
// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "User not found" });
//     }

//     // 🔹 Plain password check
//     if (user.password !== password) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     res.status(200).json({ message: "Login successful", user });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = { loginUser };