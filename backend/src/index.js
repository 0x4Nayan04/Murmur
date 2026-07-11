import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import { connectDB, disconnectDB, isDbConnected } from "./lib/db.js";
import { validateEnv } from "./lib/validateEnv.js";
import { logger } from "./lib/logger.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import uploadRoutes from "./routes/upload.route.js";
import {
  requestTimeout,
  slowRequestLogger,
} from "./middleware/requestLogging.middleware.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";
import { app, server } from "./lib/socket.js";

dotenv.config();
validateEnv();

const PORT = process.env.PORT || 5001;
const SHUTDOWN_TIMEOUT_MS = 10_000;

app.set("trust proxy", 1);

app.use(helmet());

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [process.env.FRONTEND_URL]
    : [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
      ];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(requestTimeout);
app.use(slowRequestLogger);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/api/health", (req, res) => {
  const dbConnected = isDbConnected();

  const payload = {
    status: dbConnected ? "ok" : "degraded",
    message: dbConnected ? "Server is running" : "Database unavailable",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      connected: dbConnected,
    },
  };

  res.status(dbConnected ? 200 : 503).json(payload);
});

app.use(notFoundHandler);
app.use(errorHandler);

const shutdown = (signal) => {
  logger.info("Shutdown signal received", { signal });

  server.close(async () => {
    try {
      await disconnectDB();
      process.exit(0);
    } catch (error) {
      logger.error("Error during shutdown", { error: error.message });
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      logger.info("Server started", { port: PORT });
    });
  } catch (error) {
    logger.error("Failed to start server", { error: error.message });
    process.exit(1);
  }
};

startServer();
