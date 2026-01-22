import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

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

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Query to find messages between two users
    const query = {
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    };

    // Fetch messages with pagination (newest first, then reverse)
    const messages = await Message.find(query)
      .sort({ createdAt: -1 }) // Newest first for pagination
      .skip(skip)
      .limit(limit);

    // Reverse to show oldest first in UI
    const sortedMessages = messages.reverse();

    // Get total count for pagination metadata
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

    // Validate: must have either text or image
    if (!text?.trim() && !image) {
      return res.status(400).json({
        error: "Message must contain text or an image",
      });
    }

    let imageUrl;
    if (image) {
      // Check if it's already a URL (from direct Cloudinary upload) or base64
      if (image.startsWith("http://") || image.startsWith("https://")) {
        // Already a URL, use directly
        imageUrl = image;
      } else if (image.startsWith("data:")) {
        // Base64 image - upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      } else {
        return res.status(400).json({
          error: "Invalid image format. Expected URL or base64 data.",
        });
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: text?.trim() || undefined,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { id: senderId } = req.params; // Messages from this user
    const receiverId = req.user._id; // Current user

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

    // Emit socket event to sender
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", {
        readBy: receiverId,
        count: result.modifiedCount,
      });
    }

    res.status(200).json({
      success: true,
      data: { markedCount: result.modifiedCount },
    });
  } catch (error) {
    console.error("Error in markMessagesAsRead: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get unread count for all conversations
export const getAllUnreadCounts = async (req, res) => {
  try {
    const myId = req.user._id;

    // Aggregate unread counts by sender
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

    // Convert to object: { userId: count }
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

// Edit message
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

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        error: "Message not found",
      });
    }

    // Only sender can edit
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        error: "Not authorized to edit this message",
      });
    }

    // Cannot edit deleted messages
    if (message.isDeleted) {
      return res.status(400).json({
        error: "Cannot edit deleted message",
      });
    }

    message.text = text.trim();
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();

    // Emit socket event to receiver
    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageEdited", message);
    }

    res.status(200).json({ success: true, data: message });
  } catch (error) {
    console.error("Error in editMessage: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete message (soft delete)
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        error: "Message not found",
      });
    }

    // Only sender can delete
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        error: "Not authorized to delete this message",
      });
    }

    // Already deleted
    if (message.isDeleted) {
      return res.status(400).json({
        error: "Message already deleted",
      });
    }

    // Soft delete
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.text = null; // Clear content
    message.image = null; // Clear image

    await message.save();

    // Emit socket event to receiver
    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId });
    }

    res.status(200).json({ success: true, data: message });
  } catch (error) {
    console.error("Error in deleteMessage: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
