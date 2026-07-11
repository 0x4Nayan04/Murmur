import { z } from "zod";
import mongoose from "mongoose";

export const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value) &&
  String(new mongoose.Types.ObjectId(value)) === value;

const objectIdParam = (label) =>
  z
    .string()
    .min(1, `${label} is required`)
    .refine(isValidObjectId, { message: `Invalid ${label} format` });

// ==================== AUTH VALIDATION SCHEMAS ====================

export const signupSchema = z.object({
  body: z.object({
    fullName: z
      .string({
        required_error: "Full name is required",
      })
      .min(1, "Full name cannot be empty")
      .max(100, "Full name is too long"),
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Invalid email format")
      .toLowerCase(),
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(6, "Password must be at least 6 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Invalid email format")
      .toLowerCase(),
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(1, "Password is required"),
  }),
});

const base64ImageSchema = z
  .string()
  .min(1, "Profile pic is required")
  .refine(
    (value) => /^data:image\/(jpeg|jpg|png|gif|webp);base64,/i.test(value),
    "Profile picture must be a valid base64 image",
  );

export const updateProfileSchema = z.object({
  body: z.object({
    profilePic: base64ImageSchema,
  }),
});

// ==================== MESSAGE VALIDATION SCHEMAS ====================

export const sendMessageSchema = z.object({
  body: z
    .object({
      text: z.string().optional(),
      image: z.string().optional(),
    })
    .refine((data) => data.text || data.image, {
      message: "Message must contain either text or image",
    }),
  params: z.object({
    id: objectIdParam("Receiver ID"),
  }),
});

export const editMessageSchema = z.object({
  body: z.object({
    text: z
      .string({
        required_error: "Text is required",
      })
      .min(1, "Message text cannot be empty"),
  }),
  params: z.object({
    messageId: objectIdParam("Message ID"),
  }),
});

export const deleteMessageSchema = z.object({
  params: z.object({
    messageId: objectIdParam("Message ID"),
  }),
});

export const markMessagesAsReadSchema = z.object({
  params: z.object({
    id: objectIdParam("Sender ID"),
  }),
});

export const getMessagesSchema = z.object({
  params: z.object({
    id: objectIdParam("User ID"),
  }),
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => val > 0, "Page must be greater than 0"),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 20))
      .refine(
        (val) => val > 0 && val <= 100,
        "Limit must be between 1 and 100",
      ),
  }),
});
