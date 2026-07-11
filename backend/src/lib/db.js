import mongoose from "mongoose";
import { logger } from "./logger.js";

export const isDbConnected = () => mongoose.connection.readyState === 1;

export const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  logger.info("MongoDB connected", { host: conn.connection.host });
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected");
  }
};
