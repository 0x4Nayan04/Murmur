import { z } from "zod";

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

export const updateProfileSchema = z.object({
  body: z.object({
    profilePic: z.string().url("Invalid image URL").optional(),
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
    id: z.string().min(1, "Receiver ID is required"),
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
    messageId: z.string().min(1, "Message ID is required"),
  }),
});

export const deleteMessageSchema = z.object({
  params: z.object({
    messageId: z.string().min(1, "Message ID is required"),
  }),
});

export const markMessagesAsReadSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Sender ID is required"),
  }),
});

export const getMessagesSchema = z.object({
  params: z.object({
    id: z.string().min(1, "User ID is required"),
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
