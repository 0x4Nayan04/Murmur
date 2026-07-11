import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUploadSignature } from "../controllers/upload.controller.js";
import { uploadSignatureRateLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.get(
  "/signature",
  uploadSignatureRateLimiter,
  protectRoute,
  getUploadSignature,
);

export default router;
