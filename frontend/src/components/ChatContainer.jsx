import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useCallback } from "react";

import ChatHeader from "./ChatHeader";
import ChatMessageBubble from "./ChatMessageBubble";
import EmptyConversation from "./EmptyConversation";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import TypingIndicator from "./TypingIndicator";
import { useAuthStore } from "../store/useAuthStore";
import { formatDateDivider, groupMessagesByDate } from "../lib/utils";
import { isPartnerTyping } from "../lib/conversation/typingState";
import { AlertCircle, RefreshCw } from "lucide-react";

const ChatContainer = () => {
  // Subscribe with per-field selectors so typing/read socket updates re-render reliably.
  const messages = useChatStore((state) => state.messages);
  const getMessages = useChatStore((state) => state.getMessages);
  const isMessagesLoading = useChatStore((state) => state.isMessagesLoading);
  const messagesError = useChatStore((state) => state.messagesError);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const loadOlderMessages = useChatStore((state) => state.loadOlderMessages);
  const isOlderMessagesLoading = useChatStore(
    (state) => state.isOlderMessagesLoading,
  );
  const messagePagination = useChatStore((state) => state.messagePagination);
  const isTyping = useChatStore(
    (state) =>
      Boolean(state.selectedUser) &&
      isPartnerTyping(state.typingUsers, state.selectedUser._id),
  );
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const isLoadingOlderRef = useRef(false);
  const groupedMessages = groupMessagesByDate(messages);

  const messagesPanelClassName =
    "flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-base-100/20 to-base-100/40 p-2 md:p-4";

  const renderConversationFooter = () => (
    <>
      {isTyping && <TypingIndicator selectedUser={selectedUser} />}
      <div ref={messageEndRef} />
    </>
  );

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

  const handleLoadOlderMessages = useCallback(async () => {
    const container = messagesContainerRef.current;
    if (!container || isLoadingOlderRef.current) return;

    const previousScrollHeight = container.scrollHeight;
    const previousScrollTop = container.scrollTop;
    isLoadingOlderRef.current = true;
    await loadOlderMessages();

    requestAnimationFrame(() => {
      container.scrollTop =
        previousScrollTop + (container.scrollHeight - previousScrollHeight);
      isLoadingOlderRef.current = false;
    });
  }, [loadOlderMessages]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    const container = messagesContainerRef.current;
    if (!sentinel || !container || !messagePagination.hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          !isOlderMessagesLoading &&
          !isLoadingOlderRef.current
        ) {
          void handleLoadOlderMessages();
        }
      },
      { root: container, rootMargin: "80px", threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    messagePagination.hasMore,
    isOlderMessagesLoading,
    handleLoadOlderMessages,
    selectedUser?._id,
  ]);

  if (isMessagesLoading) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <ChatHeader />
        <div className={messagesPanelClassName}>
          <MessageSkeleton />
          {renderConversationFooter()}
        </div>
        <MessageInput />
      </div>
    );
  }

  if (messagesError) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <ChatHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <AlertCircle className="size-10 text-error/70" aria-hidden="true" />
          <div>
            <p className="font-medium">Could not load messages</p>
            <p className="mt-1 text-sm text-base-content/60">{messagesError}</p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm gap-2"
            onClick={() => getMessages(selectedUser._id)}
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
        </div>
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ChatHeader />

      <div ref={messagesContainerRef} className={messagesPanelClassName}>
        {messagePagination.hasMore && (
          <div
            ref={loadMoreRef}
            className="flex justify-center py-2"
            aria-hidden="true"
          >
            {isOlderMessagesLoading && (
              <span className="loading loading-spinner loading-xs" />
            )}
          </div>
        )}

        {Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
          <div key={dateKey} className="space-y-3">
            <div className="divider my-2 text-xs text-base-content/50">
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

        {renderConversationFooter()}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
