import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { getApiErrorMessage, normalizeId } from "../lib/utils";

let messagesRequestId = 0;

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isOlderMessagesLoading: false,
  messagePagination: { currentPage: 1, hasMore: false },
  typingUsers: {}, // Track typing status: { userId: true/false }
  unreadCounts: {}, // { userId: count }
  isSubscribedToMessages: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
      get().fetchUnreadCounts();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load users"));
    } finally {
      set({ isUsersLoading: false });
    }
  },

  fetchUnreadCounts: async () => {
    try {
      const res = await axiosInstance.get("/messages/unread/all");
      const counts = res.data?.data || {};
      set({ unreadCounts: counts });
    } catch {
      // Non-blocking — sidebar badges are best-effort
    }
  },

  clearUnreadForUser: (userId) => {
    const id = normalizeId(userId);
    if (!id) return;
    set((state) => {
      if (!state.unreadCounts[id]) return state;
      const next = { ...state.unreadCounts };
      delete next[id];
      return { unreadCounts: next };
    });
  },

  getMessages: async (userId) => {
    const requestId = ++messagesRequestId;
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      const messagesData =
        res.data?.data?.messages || res.data?.messages || res.data;
      const pagination = res.data?.data?.pagination;

      if (
        requestId !== messagesRequestId ||
        get().selectedUser?._id !== userId
      ) {
        return;
      }

      set({
        messages: Array.isArray(messagesData) ? messagesData : [],
        messagePagination: {
          currentPage: pagination?.currentPage || 1,
          hasMore: Boolean(pagination?.hasMore),
        },
      });
      get().clearUnreadForUser(userId);
      axiosInstance.put(`/messages/read/${userId}`).catch(() => {});
    } catch (error) {
      if (requestId === messagesRequestId) {
        toast.error(getApiErrorMessage(error, "Failed to load messages"));
        set({ messages: [] });
      }
    } finally {
      if (requestId === messagesRequestId) {
        set({ isMessagesLoading: false });
      }
    }
  },

  loadOlderMessages: async () => {
    const { selectedUser, messagePagination, isOlderMessagesLoading } = get();
    if (
      !selectedUser ||
      !messagePagination.hasMore ||
      isOlderMessagesLoading
    ) {
      return false;
    }

    const userId = selectedUser._id;
    const nextPage = messagePagination.currentPage + 1;
    const requestId = messagesRequestId;
    set({ isOlderMessagesLoading: true });

    try {
      const res = await axiosInstance.get(`/messages/${userId}`, {
        params: { page: nextPage },
      });
      const olderMessages = res.data?.data?.messages || [];
      const pagination = res.data?.data?.pagination;

      if (
        requestId !== messagesRequestId ||
        get().selectedUser?._id !== userId
      ) {
        return false;
      }

      set((state) => {
        const existingIds = new Set(
          state.messages.map((message) => message._id),
        );
        return {
          messages: [
            ...olderMessages.filter(
              (message) => !existingIds.has(message._id),
            ),
            ...state.messages,
          ],
          messagePagination: {
            currentPage: pagination?.currentPage || nextPage,
            hasMore: Boolean(pagination?.hasMore),
          },
        };
      });
      return true;
    } catch (error) {
      if (requestId === messagesRequestId) {
        toast.error(
          getApiErrorMessage(error, "Failed to load older messages"),
        );
      }
      return false;
    } finally {
      if (requestId === messagesRequestId) {
        set({ isOlderMessagesLoading: false });
      }
    }
  },

  sendMessage: async (messageData, receiverId) => {
    const { selectedUser, messages } = get();
    const authUser = useAuthStore.getState().authUser;
    const targetUserId = receiverId || selectedUser?._id;

    if (!authUser || !targetUserId) {
      toast.error("Select a conversation before sending a message");
      return false;
    }

    const isActiveConversation = selectedUser?._id === targetUserId;
    const currentMessages = Array.isArray(messages) ? messages : [];

    const optimisticMessage = {
      _id: `temp-${Date.now()}-${Math.random()}`,
      senderId: authUser._id,
      receiverId: targetUserId,
      text: messageData.text || "",
      image: messageData.image || "",
      createdAt: new Date().toISOString(),
      isPending: true,
    };

    if (isActiveConversation) {
      set({ messages: [...currentMessages, optimisticMessage] });
    }

    try {
      const res = await axiosInstance.post(
        `/messages/send/${targetUserId}`,
        messageData,
      );

      if (get().selectedUser?._id === targetUserId) {
        const updatedMessages = Array.isArray(get().messages)
          ? get().messages
          : [];
        const hasOptimisticMessage = updatedMessages.some(
          (message) => message._id === optimisticMessage._id,
        );

        set({
          messages: hasOptimisticMessage
            ? updatedMessages.map((message) =>
                message._id === optimisticMessage._id ? res.data : message,
              )
            : [...updatedMessages, res.data],
        });
      }
      return true;
    } catch (error) {
      if (get().selectedUser?._id === targetUserId) {
        const updatedMessages = get().messages;
        set({
          messages: Array.isArray(updatedMessages)
            ? updatedMessages.filter(
                (message) => message._id !== optimisticMessage._id,
              )
            : [],
        });
      }
      toast.error(getApiErrorMessage(error, "Failed to send message"));
      return false;
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
    const socket = useAuthStore.getState().socket;
    if (!socket || get().isSubscribedToMessages) return;

    socket.on("newMessage", (newMessage) => {
      const selectedUserId = get().selectedUser?._id;
      const senderId = normalizeId(newMessage.senderId);

      if (selectedUserId && senderId === normalizeId(selectedUserId)) {
        const currentMessages = Array.isArray(get().messages)
          ? get().messages
          : [];

        const messageExists = currentMessages.some(
          (msg) => msg._id === newMessage._id,
        );

        if (!messageExists) {
          set({
            messages: [...currentMessages, newMessage],
          });
        }

        get().clearUnreadForUser(selectedUserId);
        axiosInstance.put(`/messages/read/${selectedUserId}`).catch(() => {});
        return;
      }

      // Background conversation — bump sidebar unread badge
      if (!senderId) return;
      set((state) => ({
        unreadCounts: {
          ...state.unreadCounts,
          [senderId]: (state.unreadCounts[senderId] || 0) + 1,
        },
      }));
    });

    socket.on("userTyping", ({ senderId, isTyping }) => {
      set((state) => ({
        typingUsers: {
          ...state.typingUsers,
          [senderId]: isTyping,
        },
      }));
    });

    socket.on("messagesRead", ({ readBy }) => {
      const readById = normalizeId(readBy);
      set((state) => ({
        messages: state.messages.map((message) =>
          normalizeId(message.receiverId) === readById
            ? { ...message, isRead: true }
            : message,
        ),
      }));
    });

    socket.on("messageEdited", (editedMessage) => {
      set((state) => ({
        messages: state.messages.map((message) =>
          message._id === editedMessage._id ? editedMessage : message,
        ),
      }));
    });

    socket.on("messageDeleted", ({ messageId }) => {
      set((state) => ({
        messages: state.messages.map((message) =>
          message._id === messageId
            ? { ...message, text: null, image: null, isDeleted: true }
            : message,
        ),
      }));
    });

    set({ isSubscribedToMessages: true });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("userTyping");
      socket.off("messagesRead");
      socket.off("messageEdited");
      socket.off("messageDeleted");
    }
    set({ isSubscribedToMessages: false });
  },

  // Reset messages and clear typing state when switching users
  setSelectedUser: (selectedUser) => {
    messagesRequestId += 1;
    if (selectedUser?._id) {
      get().clearUnreadForUser(selectedUser._id);
    }
    set({
      selectedUser,
      messages: [],
      typingUsers: {},
      isMessagesLoading: false,
      isOlderMessagesLoading: false,
      messagePagination: { currentPage: 1, hasMore: false },
    });
  },

  resetChat: () => {
    messagesRequestId += 1;
    get().unsubscribeFromMessages();
    set({
      messages: [],
      users: [],
      selectedUser: null,
      isUsersLoading: false,
      isMessagesLoading: false,
      isOlderMessagesLoading: false,
      messagePagination: { currentPage: 1, hasMore: false },
      typingUsers: {},
      unreadCounts: {},
    });
  },
}));
