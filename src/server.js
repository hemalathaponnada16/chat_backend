const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const socketHandler = require("./socket/socketHandler");

dotenv.config();
connectDB();

const app = express();

// 🔹 Helmet for security headers
app.use(helmet());

// 🔹 CORS - restrict to your frontend
// app.use(cors({
//   origin: process.env.FRONTEND_URL || "http://localhost:5173",
//   credentials: true,
// }));
// app.use(cors({
//   origin: [
//     "http://localhost:5173",
//     "https://chat-frontend-an4r.vercel.app"
//   ],
//   credentials: true
// }))
import cors from "cors";

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://chat-frontend-an4r.vercel.app",
    "https://chat-frontend-an4r-git-main-hemalathaponnada16s-projects.vercel.app"
  ],
  credentials: true
}));

// 🔹 Body parser
app.use(express.json());

// 🔹 Rate limiting for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5, 
  message: "Too many login attempts. Try again later."
});
app.use("/api/auth/login", loginLimiter);

// 🔹 Routes
app.use("/api/auth", require("./routes/authRoutes"));

app.get("/", (req, res) => {
  res.send("API Running...");
});

// 🔹 HTTP Server & Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

// 🔹 Initialize Socket Logic
socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const http = require("http");
// const { Server } = require("socket.io");

// const connectDB = require("./config/db");
// const socketHandler = require("./socket/socketHandler");

// dotenv.config();
// connectDB();

// const app = express();


// // Middlewares
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use("/api/auth", require("./routes/authRoutes"));

// app.get("/", (req, res) => {
//   res.send("API Running...");
// });

// // 🔥 Create HTTP Server (IMPORTANT)
// const server = http.createServer(app);

// // 🔥 Attach Socket.IO
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//   },
// });

// // 🔥 Initialize Socket Logic
// socketHandler(io);

// const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

