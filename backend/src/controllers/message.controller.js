import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import {
  findSenderMessage,
  MessageForbiddenError,
  MessageNotFoundError,
  resolveMessageImageUrl,
} from "../lib/messageHelpers.js";
import { emitToUser } from "../lib/socket.js";

const sendMessageAccessError = (error, res) => {
  if (error instanceof MessageNotFoundError) {
    res.status(404).json({ error: error.message });
    return true;
  }

  if (error instanceof MessageForbiddenError) {
    res.status(403).json({ error: error.message });
    return true;
  }

  return false;
};

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    };

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const sortedMessages = messages.reverse();

    const totalCount = await Message.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        messages: sortedMessages,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalMessages: totalCount,
          hasMore: skip + messages.length < totalCount,
        },
      },
    });
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text?.trim() && !image) {
      return res.status(400).json({
        error: "Message must contain text or an image",
      });
    }

    const imageUrl = await resolveMessageImageUrl(image, cloudinary);
    if (image && imageUrl === null) {
      return res.status(400).json({
        error: "Invalid image format. Expected URL or base64 data.",
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: text?.trim() || undefined,
      image: imageUrl,
    });

    await newMessage.save();

    emitToUser(receiverId, "newMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const receiverId = req.user._id;

    const result = await Message.updateMany(
      {
        senderId: senderId,
        receiverId: receiverId,
        isRead: false,
        isDeleted: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
    );

    emitToUser(senderId, "messagesRead", {
      readBy: receiverId,
      count: result.modifiedCount,
    });

    res.status(200).json({
      success: true,
      data: { markedCount: result.modifiedCount },
    });
  } catch (error) {
    console.error("Error in markMessagesAsRead: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllUnreadCounts = async (req, res) => {
  try {
    const myId = req.user._id;

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: myId,
          isRead: false,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
        },
      },
    ]);

    const countsMap = {};
    unreadCounts.forEach((item) => {
      countsMap[item._id.toString()] = item.count;
    });

    res.status(200).json({ success: true, data: countsMap });
  } catch (error) {
    console.error("Error in getAllUnreadCounts: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text?.trim()) {
      return res.status(400).json({
        error: "Message text cannot be empty",
      });
    }

    const message = await findSenderMessage(messageId, userId, "edit");

    if (message.isDeleted) {
      return res.status(400).json({
        error: "Cannot edit deleted message",
      });
    }

    message.text = text.trim();
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();

    emitToUser(message.receiverId.toString(), "messageEdited", message);

    res.status(200).json({ success: true, data: message });
  } catch (error) {
    if (sendMessageAccessError(error, res)) return;

    console.error("Error in editMessage: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await findSenderMessage(messageId, userId, "delete");

    if (message.isDeleted) {
      return res.status(400).json({
        error: "Message already deleted",
      });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.text = null;
    message.image = null;

    await message.save();

    emitToUser(message.receiverId.toString(), "messageDeleted", { messageId });

    res.status(200).json({ success: true, data: message });
  } catch (error) {
    if (sendMessageAccessError(error, res)) return;

    console.error("Error in deleteMessage: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
