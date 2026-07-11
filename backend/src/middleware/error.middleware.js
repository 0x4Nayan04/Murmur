import mongoose from "mongoose";
import { logger } from "../lib/logger.js";

export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: "Not found" });
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  logger.error("Unhandled request error", {
    method: req.method,
    path: req.originalUrl,
    error: err.message,
  });

  res.status(err.status || 500).json({ error: "Internal server error" });
};
