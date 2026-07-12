import { Server } from "socket.io";
import http from "http";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { logger } from "./logger.js";
import { isValidObjectId } from "./validation.js";

dotenv.config();

const app = express();
app.use(cookieParser());

const server = http.createServer(app);

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
    logger.warn("Socket auth failed", { error: error.message });
    next(new Error("Unauthorized - Invalid Token"));
  }
});

// Process-local presence map. Single-instance only; use @socket.io/redis-adapter
// when running multiple replicas. Each user can have multiple socket IDs (tabs).
const userSocketMap = {};

const TYPING_RATE_LIMIT = 20;
const TYPING_RATE_WINDOW_MS = 10_000;
const typingRateLimits = new Map();

const addUserSocket = (userId, socketId) => {
  if (!userSocketMap[userId]) {
    userSocketMap[userId] = new Set();
  }
  userSocketMap[userId].add(socketId);
};

const removeUserSocket = (userId, socketId) => {
  const sockets = userSocketMap[userId];
  if (!sockets) return;

  sockets.delete(socketId);
  if (sockets.size === 0) {
    delete userSocketMap[userId];
  }
};

const getOnlineUserIds = () => Object.keys(userSocketMap);

const isTypingRateLimited = (socketId) => {
  const now = Date.now();
  let entry = typingRateLimits.get(socketId);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + TYPING_RATE_WINDOW_MS };
    typingRateLimits.set(socketId, entry);
  }

  entry.count += 1;
  return entry.count > TYPING_RATE_LIMIT;
};

const isValidTypingTarget = (senderId, receiverId) => {
  const receiverIdStr =
    receiverId == null ? "" : String(receiverId).trim();

  if (!receiverIdStr || !isValidObjectId(receiverIdStr)) {
    return false;
  }

  return receiverIdStr !== senderId;
};

const handleTypingEvent = (socket, receiverId, isTyping) => {
  const userId = socket.userId;
  const receiverIdStr =
    receiverId == null ? "" : String(receiverId).trim();

  if (isTypingRateLimited(socket.id)) {
    return;
  }

  if (!isValidTypingTarget(userId, receiverIdStr)) {
    return;
  }

  emitToUser(receiverIdStr, "userTyping", {
    senderId: userId,
    isTyping,
  });
};

export function getReceiverSocketId(userId) {
  const sockets = userSocketMap[userId];
  if (!sockets || sockets.size === 0) return null;
  return [...sockets][0];
}

export function emitToUser(userId, event, payload) {
  const sockets = userSocketMap[String(userId)];
  if (!sockets) return;

  for (const socketId of sockets) {
    io.to(socketId).emit(event, payload);
  }
}

io.on("connection", (socket) => {
  logger.info("Socket connected", { socketId: socket.id });

  const userId = socket.userId;

  if (!userId) {
    logger.warn("Socket connection rejected: missing authenticated userId");
    socket.disconnect(true);
    return;
  }

  addUserSocket(userId, socket.id);
  io.emit("getOnlineUsers", getOnlineUserIds());

  socket.on("typing", (data) => {
    handleTypingEvent(socket, data?.receiverId, true);
  });

  socket.on("stopTyping", (data) => {
    handleTypingEvent(socket, data?.receiverId, false);
  });

  socket.on("disconnect", () => {
    logger.info("Socket disconnected", { socketId: socket.id, userId });
    typingRateLimits.delete(socket.id);
    removeUserSocket(userId, socket.id);
    io.emit("getOnlineUsers", getOnlineUserIds());
  });
});

export { io, app, server };
