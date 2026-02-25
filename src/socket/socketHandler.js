// const Message = require("../models/messageModel");
// const jwt = require("jsonwebtoken");
// const sanitizeHtml = require("sanitize-html");

// const onlineUsers = new Map();

// const socketHandler = (io) => {
//   // 🔹 Authenticate socket connections
//   io.use((socket, next) => {
//     const token = socket.handshake.auth?.token;
//     if (!token) return next(new Error("Authentication error"));

//     try {
//       const user = jwt.verify(token, process.env.JWT_SECRET);
//       socket.user = user;
//       next();
//     } catch {
//       next(new Error("Authentication error"));
//     }
//   });

//   io.on("connection", (socket) => {
//     console.log("User connected:", socket.id);

//     // 🔹 Join Room
//     socket.on("join_room", async ({ room }) => {
//       if (!room || !socket.user?.id) return;

//       socket.join(room);
//       onlineUsers.set(socket.user.id, socket.id);
//       io.emit("online_users", Array.from(onlineUsers.keys()));

//       try {
//         await Message.updateMany(
//           { room, author: { $ne: socket.user.id }, status: { $ne: "read" } },
//           { status: "read" }
//         );

//         io.to(room).emit("messages_read", socket.user.id);

//         const messages = await Message.find({ room }).sort({ createdAt: 1 });
//         socket.emit("previous_messages", messages);
//       } catch (err) {
//         console.error("Join room error:", err);
//       }
//     });

//     // 🔹 Send Message
//     socket.on("send_message", async ({ room, message }) => {
//       if (!room || !message || !socket.user?.id) return;

//       const safeMessage = sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} });

//       try {
//         const newMessage = await Message.create({
//           room,
//           author: socket.user.id,
//           message: safeMessage,
//         });

//         io.to(room).emit("receive_message", newMessage);
//         socket.emit("message_delivered", newMessage._id);
//       } catch (err) {
//         console.error("Error saving message:", err);
//       }
//     });

//     // 🔹 Typing
//     socket.on("typing", ({ room }) => {
//       if (!room) return;
//       socket.to(room).emit("user_typing", socket.user.id);
//     });

//     socket.on("stop_typing", ({ room }) => {
//       if (!room) return;
//       socket.to(room).emit("stop_typing", socket.user.id);
//     });

//     // 🔹 Disconnect
//     socket.on("disconnect", () => {
//       onlineUsers.delete(socket.user?.id);
//       io.emit("online_users", Array.from(onlineUsers.keys()));
//       console.log(`${socket.user?.id || "Unknown"} disconnected`);
//     });
//   });
// };

// module.exports = socketHandler;

const Message = require("../models/messageModel");

const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // 🔹 Join Room
socket.on("join_room", async ({ room, author }) => {
  if (!room || !author) return;

  socket.join(room);

  onlineUsers.set(author, socket.id);
  const users = Array.from(onlineUsers.keys());
  io.emit("online_users", users);

  try {
    // 🔥 Mark messages as READ (not written by this user)
    await Message.updateMany(
      {
        room,
        author: { $ne: author },
        status: { $ne: "read" },
      },
      { status: "read" }
    );

    // 🔥 Notify sender that messages were read
    io.to(room).emit("messages_read", author);

    // Send old messages
    const messages = await Message.find({ room }).sort({ createdAt: 1 });
    socket.emit("previous_messages", messages);

  } catch (err) {
    console.error("Join room error:", err);
  }

  console.log(`${author} joined room ${room}`);
});
    // socket.on("join_room", async ({ room, author }) => {
    //   if (!room || !author) return;

    //   socket.join(room);

    //   //onlineUsers.set(author, { socketId: socket.id, name: author });
    //   onlineUsers.set(author, socket.id);
    //   const users = Array.from(onlineUsers.keys());
    //   io.emit("online_users", users);
    //   // const users = Array.from(onlineUsers.values()).map(u => u.name);
    //   // io.emit("online_users", users);

    //   // Send old messages
    //   const messages = await Message.find({ room }).sort({ createdAt: 1 });
    //   socket.emit("previous_messages", messages);

    //   console.log(`${author} joined room ${room}`);
    // });

    // 🔹 Send Message
socket.on("send_message", async ({ room, author, message }) => {
  if (!room || !author || !message) {
    console.log("Invalid message data:", { room, author, message });
    return;
  }

  try {
    // status defaults to "sent"
    const newMessage = await Message.create({ room, author, message });

    // Send message to room
    io.to(room).emit("receive_message", newMessage);

    // 🔥 Emit delivered (to sender only)
    socket.emit("message_delivered", newMessage._id);

  } catch (err) {
    console.error("Error saving message:", err);
  }
});

    // 🔹 Typing Indicator
    socket.on("typing", ({ room, author }) => {
      if (!room || !author) return;
      socket.to(room).emit("user_typing", author);
    });

    socket.on("stop_typing", ({ room, author }) => {
      if (!room || !author) return;
      socket.to(room).emit("stop_typing", author);
    });

    // 🔹 Disconnect
    socket.on("disconnect", () => {
      let disconnectedUser = null;

      for (let [user, id] of onlineUsers.entries()) {
        if (id === socket.id) {
          disconnectedUser = user;
          break;
        }
      }
     
      if (disconnectedUser) {
        onlineUsers.delete(disconnectedUser);
        console.log(`${disconnectedUser} disconnected`);
      } else {
        console.log(`Unknown user disconnected: ${socket.id}`);
      }
      const users = Array.from(onlineUsers.keys());
      io.emit("online_users", users);
      // const users = Array.from(onlineUsers.values()).map(u => u.name);
      // io.emit("online_users", users);
    });
  });
};

module.exports = socketHandler;
