import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
  markMessagesAsRead,
  getAllUnreadCounts,
  editMessage,
  deleteMessage,
} from "../controllers/message.controller.js";
import { validate } from "../middleware/validation.middleware.js";
import {
  sendMessageSchema,
  editMessageSchema,
  deleteMessageSchema,
  markMessagesAsReadSchema,
  getMessagesSchema,
} from "../lib/validation.js";

const router = express.Router();

// Static routes MUST come before dynamic routes to avoid conflicts
router.get("/users", protectRoute, getUsersForSidebar);

// Unread counts - MUST be before /:id to avoid being caught by it
router.get("/unread/all", protectRoute, getAllUnreadCounts);

// Dynamic routes with :id parameter
router.get("/:id", protectRoute, validate(getMessagesSchema), getMessages);

router.post(
  "/send/:id",
  protectRoute,
  validate(sendMessageSchema),
  sendMessage,
);

// Read status routes
router.put(
  "/read/:id",
  protectRoute,
  validate(markMessagesAsReadSchema),
  markMessagesAsRead,
);

// Edit and delete routes
router.put(
  "/edit/:messageId",
  protectRoute,
  validate(editMessageSchema),
  editMessage,
);
router.delete(
  "/:messageId",
  protectRoute,
  validate(deleteMessageSchema),
  deleteMessage,
);

export default router;
