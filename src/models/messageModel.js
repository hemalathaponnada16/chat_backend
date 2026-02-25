const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },

    // 🔥 ADD THIS
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);

// const mongoose = require("mongoose");

// const messageSchema = new mongoose.Schema(
//   {
//     room: {
//       type: String,
//       required: true,
//     },
//     author: {
//       type: String,
//       required: true,
//     },
//     message: {
//       type: String,
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Message", messageSchema);