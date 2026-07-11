import express from "express";
import {
  checkAuth,
  login,
  logout,
  signup,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import {
  signupSchema,
  loginSchema,
  updateProfileSchema,
} from "../lib/validation.js";
import { authRateLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.post("/signup", authRateLimiter, validate(signupSchema), signup);
router.post("/login", authRateLimiter, validate(loginSchema), login);
router.post("/logout", protectRoute, logout);

router.put(
  "/update-profile",
  protectRoute,
  validate(updateProfileSchema),
  updateProfile,
);

router.get("/check", protectRoute, checkAuth);

export default router;
