import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import ChatMessageBubble from "./ChatMessageBubble";
import EmptyConversation from "./EmptyConversation";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import TypingIndicator from "./TypingIndicator";
import { useAuthStore } from "../store/useAuthStore";
import { formatDateDivider, groupMessagesByDate } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    loadOlderMessages,
    isOlderMessagesLoading,
    messagePagination,
    typingUsers,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isLoadingOlderRef = useRef(false);

  const isTyping = selectedUser && typingUsers[selectedUser._id];
  const groupedMessages = groupMessagesByDate(messages);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages]);

  useEffect(() => {
    if (messageEndRef.current && !isLoadingOlderRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleLoadOlderMessages = async () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const previousScrollHeight = container.scrollHeight;
    const previousScrollTop = container.scrollTop;
    isLoadingOlderRef.current = true;
    await loadOlderMessages();

    requestAnimationFrame(() => {
      container.scrollTop =
        previousScrollTop + (container.scrollHeight - previousScrollHeight);
      isLoadingOlderRef.current = false;
    });
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ChatHeader />

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-2 md:p-4 space-y-4 bg-gradient-to-b from-base-100/20 to-base-100/40"
      >
        {messagePagination.hasMore && (
          <div className="flex justify-center">
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={handleLoadOlderMessages}
              disabled={isOlderMessagesLoading}
            >
              {isOlderMessagesLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  Loading…
                </>
              ) : (
                "Load older messages"
              )}
            </button>
          </div>
        )}

        {Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
          <div key={dateKey} className="space-y-3">
            <div className="divider text-xs text-base-content/50 my-2">
              {formatDateDivider(dateKey)}
            </div>

            {dateMessages.map((message, index) => (
              <ChatMessageBubble
                key={message._id}
                message={message}
                authUserId={authUser._id}
                selectedUser={selectedUser}
                isFirstInGroup={
                  index === 0 ||
                  dateMessages[index - 1].senderId !== message.senderId
                }
              />
            ))}
          </div>
        ))}

        {messages.length === 0 && (
          <EmptyConversation fullName={selectedUser.fullName} />
        )}

        {isTyping && <TypingIndicator selectedUser={selectedUser} />}

        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
