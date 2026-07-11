import Message from "../models/message.model.js";

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

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("data:")) {
    const uploadResponse = await cloudinary.uploader.upload(image);
    return uploadResponse.secure_url;
  }

  return null;
};
