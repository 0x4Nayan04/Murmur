import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { getApiErrorMessage, normalizeId } from "../lib/utils";
import {
  appendOptimisticMessage,
  commitSentMessage,
  createOptimisticMessage,
  fetchOlderMessagesPage,
  isStaleConversationRequest,
  markMessagesRead,
  mergeOlderMessages,
  parseMessagesResponse,
  registerChatSocketHandlers,
  rollbackSentMessage,
  unregisterChatSocketHandlers,
} from "../lib/conversation/helpers.js";

let messagesRequestId = 0;

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isOlderMessagesLoading: false,
  messagePagination: { currentPage: 1, hasMore: false },
  typingUsers: {},
  unreadCounts: {},
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
      if (
        isStaleConversationRequest(
          requestId,
          messagesRequestId,
          get().selectedUser?._id,
          userId,
        )
      ) {
        return;
      }

      const { messages, pagination } = parseMessagesResponse(res.data);
      set({ messages, messagePagination: pagination });
      get().clearUnreadForUser(userId);
      void markMessagesRead(axiosInstance, userId);
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
      const { olderMessages, pagination } = await fetchOlderMessagesPage(
        axiosInstance,
        userId,
        nextPage,
      );
      if (
        isStaleConversationRequest(
          requestId,
          messagesRequestId,
          get().selectedUser?._id,
          userId,
        )
      ) {
        return false;
      }

      set((state) => ({
        messages: mergeOlderMessages(state.messages, olderMessages),
        messagePagination: {
          currentPage: pagination?.currentPage || nextPage,
          hasMore: Boolean(pagination?.hasMore),
        },
      }));
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

    const optimisticMessage = createOptimisticMessage(
      authUser,
      targetUserId,
      messageData,
    );
    appendOptimisticMessage(
      set,
      messages,
      selectedUser?._id,
      targetUserId,
      optimisticMessage,
    );

    try {
      const res = await axiosInstance.post(
        `/messages/send/${targetUserId}`,
        messageData,
      );
      commitSentMessage(
        get,
        set,
        targetUserId,
        optimisticMessage._id,
        res.data,
      );
      return true;
    } catch (error) {
      rollbackSentMessage(get, set, targetUserId, optimisticMessage._id);
      toast.error(getApiErrorMessage(error, "Failed to send message"));
      return false;
    }
  },

  emitTyping: (receiverId) => {
    const socket = useAuthStore.getState().socket;
    socket?.emit("typing", { receiverId });
  },

  emitStopTyping: (receiverId) => {
    const socket = useAuthStore.getState().socket;
    socket?.emit("stopTyping", { receiverId });
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket || get().isSubscribedToMessages) return;

    registerChatSocketHandlers(socket, get, set, axiosInstance);
    set({ isSubscribedToMessages: true });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      unregisterChatSocketHandlers(socket);
    }
    set({ isSubscribedToMessages: false });
  },

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
