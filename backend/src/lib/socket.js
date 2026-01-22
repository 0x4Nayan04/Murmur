import { Server } from "socket.io";
import http from "http";
import express from "express";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;

  // Validate userId exists and is not undefined
  if (!userId || userId === "undefined") {
    console.warn("Socket connection rejected: missing or invalid userId");
    socket.disconnect(true);
    return;
  }

  userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle typing indicator events
  socket.on("typing", (data) => {
    const { receiverId } = data;
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", {
        senderId: userId,
        isTyping: true,
      });
    }
  });

  socket.on("stopTyping", (data) => {
    const { receiverId } = data;
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", {
        senderId: userId,
        isTyping: false,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    // Get userId from handshake to prevent undefined error
    const userId = socket.handshake.query.userId;
    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { io, app, server };
