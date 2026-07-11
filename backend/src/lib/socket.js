import { Server } from "socket.io";
import http from "http";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cookieParser());

const server = http.createServer(app);

// Configure CORS for socket.io to match the main app CORS settings
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [process.env.FRONTEND_URL]
    : [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
      ];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

const parseCookies = (cookieHeader = "") => {
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separatorIndex = part.indexOf("=");
        if (separatorIndex === -1) return [part, ""];
        const key = part.slice(0, separatorIndex);
        const value = part.slice(separatorIndex + 1);
        try {
          return [key, decodeURIComponent(value)];
        } catch {
          return [key, value];
        }
      }),
  );
};

// Authenticate every socket with the httpOnly JWT cookie — never trust query.userId
io.use((socket, next) => {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    const token = cookies.jwt;

    if (!token) {
      return next(new Error("Unauthorized - No Token Provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId) {
      return next(new Error("Unauthorized - Invalid Token"));
    }

    socket.userId = String(decoded.userId);
    next();
  } catch (error) {
    console.warn("Socket auth failed:", error.message);
    next(new Error("Unauthorized - Invalid Token"));
  }
});

const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export function emitToUser(userId, event, payload) {
  const socketId = getReceiverSocketId(userId);
  if (!socketId) return;

  io.to(socketId).emit(event, payload);
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.userId;

  if (!userId) {
    console.warn("Socket connection rejected: missing authenticated userId");
    socket.disconnect(true);
    return;
  }

  userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("typing", (data) => {
    const { receiverId } = data;
    emitToUser(receiverId, "userTyping", {
      senderId: userId,
      isTyping: true,
    });
  });

  socket.on("stopTyping", (data) => {
    const { receiverId } = data;
    emitToUser(receiverId, "userTyping", {
      senderId: userId,
      isTyping: false,
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userSocketMap[userId] === socket.id) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { io, app, server };
