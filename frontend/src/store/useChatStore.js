import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  typingUsers: {}, // Track typing status: { userId: true/false }

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      // Handle both old format (array) and new format (object with data.messages)
      const messagesData =
        res.data?.data?.messages || res.data?.messages || res.data;
      set({ messages: Array.isArray(messagesData) ? messagesData : [] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
      set({ messages: [] }); // Reset to empty array on error
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const authUser = useAuthStore.getState().authUser;

    // Ensure messages is an array
    const currentMessages = Array.isArray(messages) ? messages : [];

    // Create optimistic message
    const optimisticMessage = {
      _id: `temp-${Date.now()}-${Math.random()}`,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text || "",
      image: messageData.image || "",
      createdAt: new Date().toISOString(),
      isPending: true, // Flag for UI to show pending state
    };

    // Add optimistically to UI
    set({ messages: [...currentMessages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );

      // Replace optimistic message with real message from server
      const updatedMessages = get().messages;
      set({
        messages: Array.isArray(updatedMessages)
          ? updatedMessages.map((msg) =>
              msg._id === optimisticMessage._id ? res.data : msg,
            )
          : [res.data],
      });
    } catch (error) {
      // Remove optimistic message on error
      const updatedMessages = get().messages;
      set({
        messages: Array.isArray(updatedMessages)
          ? updatedMessages.filter((msg) => msg._id !== optimisticMessage._id)
          : [],
      });
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  // Typing indicator functions
  emitTyping: (receiverId) => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("typing", { receiverId });
    }
  },

  emitStopTyping: (receiverId) => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.emit("stopTyping", { receiverId });
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return; // Add null check

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      // Ensure messages is an array
      const currentMessages = Array.isArray(get().messages)
        ? get().messages
        : [];

      // Check if message already exists (to prevent duplicates from optimistic updates)
      const messageExists = currentMessages.some(
        (msg) => msg._id === newMessage._id,
      );

      if (!messageExists) {
        set({
          messages: [...currentMessages, newMessage],
        });
      }
    });

    // Listen for typing indicators
    socket.on("userTyping", ({ senderId, isTyping }) => {
      set((state) => ({
        typingUsers: {
          ...state.typingUsers,
          [senderId]: isTyping,
        },
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      // Add null check
      socket.off("newMessage");
      socket.off("userTyping");
    }
  },

  // Reset messages and clear typing state when switching users
  setSelectedUser: (selectedUser) => {
    // Clear messages immediately when switching users to avoid showing old messages
    set({
      selectedUser,
      messages: [], // Reset messages when switching users
      typingUsers: {}, // Clear typing indicators
    });
  },
}));
