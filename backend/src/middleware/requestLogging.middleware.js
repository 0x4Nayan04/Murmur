import { logger } from "../lib/logger.js";

const REQUEST_TIMEOUT_MS = 30_000;
const SLOW_REQUEST_THRESHOLD_MS = 5_000;

export const requestTimeout = (req, res, next) => {
  res.setTimeout(REQUEST_TIMEOUT_MS, () => {
    if (!res.headersSent) {
      logger.warn("Request timeout", {
        method: req.method,
        path: req.originalUrl,
      });
      res.status(504).json({ message: "Request timeout" });
    }
  });
  next();
};

export const slowRequestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (duration >= SLOW_REQUEST_THRESHOLD_MS) {
      logger.warn("Slow request", {
        method: req.method,
        path: req.originalUrl,
        durationMs: duration,
      });
    }
  });

  next();
};
