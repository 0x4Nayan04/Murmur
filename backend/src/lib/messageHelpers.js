import Message from "../models/message.model.js";
import { isBase64Image, isCloudinaryUrl, assertBase64ImageSize } from "./imageValidation.js";

export class MessageNotFoundError extends Error {
  constructor() {
    super("Message not found");
    this.name = "MessageNotFoundError";
  }
}

export class MessageForbiddenError extends Error {
  constructor(action) {
    super(`Not authorized to ${action} this message`);
    this.name = "MessageForbiddenError";
  }
}

export class InvalidImageError extends Error {
  constructor(message = "Invalid image format") {
    super(message);
    this.name = "InvalidImageError";
  }
}

export const findSenderMessage = async (messageId, userId, action) => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new MessageNotFoundError();
  }

  if (message.senderId.toString() !== userId.toString()) {
    throw new MessageForbiddenError(action);
  }

  return message;
};

export const resolveMessageImageUrl = async (image, cloudinary) => {
  if (!image) return undefined;

  if (image.startsWith("data:")) {
    if (!isBase64Image(image)) {
      throw new InvalidImageError(
        "Invalid image format. Expected a supported base64 image.",
      );
    }

    try {
      assertBase64ImageSize(image);
    } catch (error) {
      throw new InvalidImageError(error.message);
    }

    const uploadResponse = await cloudinary.uploader.upload(image);
    return uploadResponse.secure_url;
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    if (!isCloudinaryUrl(image)) {
      throw new InvalidImageError(
        "Only Cloudinary image URLs are allowed.",
      );
    }

    return image;
  }

  return null;
};
