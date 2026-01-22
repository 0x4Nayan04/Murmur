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
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const authUser = useAuthStore.getState().authUser;

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
    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );

      // Replace optimistic message with real message from server
      set({
        messages: get().messages.map((msg) =>
          msg._id === optimisticMessage._id ? res.data : msg,
        ),
      });
    } catch (error) {
      // Remove optimistic message on error
      set({
        messages: get().messages.filter(
          (msg) => msg._id !== optimisticMessage._id,
        ),
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

      // Check if message already exists (to prevent duplicates from optimistic updates)
      const messageExists = get().messages.some(
        (msg) => msg._id === newMessage._id,
      );

      if (!messageExists) {
        set({
          messages: [...get().messages, newMessage],
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

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
