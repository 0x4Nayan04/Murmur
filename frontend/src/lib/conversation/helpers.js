import { normalizeId } from "../utils.js";

export const createOptimisticMessage = (authUser, targetUserId, messageData) => ({
  _id: `temp-${Date.now()}-${Math.random()}`,
  senderId: authUser._id,
  receiverId: targetUserId,
  text: messageData.text || "",
  image: messageData.image || "",
  createdAt: new Date().toISOString(),
  isPending: true,
});

const replaceOptimisticMessage = (messages, optimisticId, serverMessage) => {
  const hasOptimistic = messages.some(
    (message) => message._id === optimisticId,
  );

  return hasOptimistic
    ? messages.map((message) =>
        message._id === optimisticId ? serverMessage : message,
      )
    : [...messages, serverMessage];
};

const removeOptimisticMessage = (messages, optimisticId) =>
  messages.filter((message) => message._id !== optimisticId);

export const mergeOlderMessages = (existingMessages, olderMessages) => {
  const existingIds = new Set(existingMessages.map((message) => message._id));
  return [
    ...olderMessages.filter((message) => !existingIds.has(message._id)),
    ...existingMessages,
  ];
};

export const isStaleConversationRequest = (
  requestId,
  activeRequestId,
  selectedUserId,
  expectedUserId,
) =>
  requestId !== activeRequestId ||
  normalizeId(selectedUserId) !== normalizeId(expectedUserId);

const toMessageList = (value) => (Array.isArray(value) ? value : []);

const readMessagesFromResponse = (responseData) => {
  const nested = responseData?.data;
  if (nested?.messages) return toMessageList(nested.messages);
  if (responseData?.messages) return toMessageList(responseData.messages);
  return toMessageList(responseData);
};

const readPaginationFromResponse = (responseData) => {
  const pagination = responseData?.data?.pagination;
  return {
    currentPage: pagination?.currentPage || 1,
    hasMore: Boolean(pagination?.hasMore),
  };
};

export const markMessagesRead = async (axiosInstance, userId) => {
  try {
    await axiosInstance.put(`/messages/read/${userId}`);
  } catch {
    // Read receipts are best-effort and should not interrupt the conversation.
  }
};

export const parseMessagesResponse = (responseData) => ({
  messages: readMessagesFromResponse(responseData),
  pagination: readPaginationFromResponse(responseData),
});

const handleIncomingMessage = (get, set, newMessage, axiosInstance) => {
  const selectedUserId = get().selectedUser?._id;
  const senderId = normalizeId(newMessage.senderId);

  if (selectedUserId && senderId === normalizeId(selectedUserId)) {
    const currentMessages = get().messages;
    const messageExists = currentMessages.some(
      (message) => message._id === newMessage._id,
    );

    if (!messageExists) {
      set({ messages: [...currentMessages, newMessage] });
    }

    get().clearUnreadForUser(selectedUserId);
    void markMessagesRead(axiosInstance, selectedUserId);
    return;
  }

  if (!senderId) return;

  set((state) => ({
    unreadCounts: {
      ...state.unreadCounts,
      [senderId]: (state.unreadCounts[senderId] || 0) + 1,
    },
  }));
};

export const registerChatSocketHandlers = (socket, get, set, axiosInstance) => {
  socket.on("newMessage", (newMessage) =>
    handleIncomingMessage(get, set, newMessage, axiosInstance),
  );

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
};

export const unregisterChatSocketHandlers = (socket) => {
  socket.off("newMessage");
  socket.off("userTyping");
  socket.off("messagesRead");
  socket.off("messageEdited");
  socket.off("messageDeleted");
};

export const appendOptimisticMessage = (
  set,
  messages,
  selectedUserId,
  targetUserId,
  optimisticMessage,
) => {
  if (selectedUserId !== targetUserId) return;
  set({ messages: [...messages, optimisticMessage] });
};

export const commitSentMessage = (
  get,
  set,
  targetUserId,
  optimisticId,
  serverMessage,
) => {
  if (get().selectedUser?._id !== targetUserId) return;
  set({
    messages: replaceOptimisticMessage(
      get().messages,
      optimisticId,
      serverMessage,
    ),
  });
};

export const rollbackSentMessage = (get, set, targetUserId, optimisticId) => {
  if (get().selectedUser?._id !== targetUserId) return;
  set({
    messages: removeOptimisticMessage(get().messages, optimisticId),
  });
};

export const fetchOlderMessagesPage = async (axiosInstance, userId, nextPage) => {
  const res = await axiosInstance.get(`/messages/${userId}`, {
    params: { page: nextPage },
  });

  return {
    olderMessages: res.data?.data?.messages || [],
    pagination: res.data?.data?.pagination,
  };
};
