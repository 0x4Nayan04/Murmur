import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import { Check, CheckCheck, Loader } from "lucide-react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    typingUsers,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Check if selected user is typing
  const isTyping = selectedUser && typingUsers[selectedUser._id];

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [
    selectedUser?._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Group messages by date - ensure messages is an array
  const groupedMessages = Array.isArray(messages)
    ? messages.reduce((groups, message) => {
        const date = new Date(message.createdAt).toLocaleDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(message);
        return groups;
      }, {})
    : {};

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

      <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-4 bg-gradient-to-b from-base-100/20 to-base-100/40">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="space-y-3">
            <div className="divider text-xs text-base-content/50 my-2">
              {new Date(date).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>

            {dateMessages.map((message, index) => {
              const isOwnMessage = message.senderId === authUser._id;
              const isFirstInGroup =
                index === 0 ||
                dateMessages[index - 1].senderId !== message.senderId;
              const showAvatar = !isOwnMessage && isFirstInGroup;

              const bubbleClasses = `max-w-[85%] md:max-w-[320px] px-3 py-2 shadow-md ${
                isOwnMessage
                  ? "bg-primary text-primary-content rounded-2xl rounded-bl-md"
                  : "bg-base-200 rounded-2xl rounded-br-md"
              } ${message.isPending ? "opacity-60" : ""}`;

              const metaRow = (
                <div className="text-right text-[10px] opacity-70 flex gap-1 items-center justify-end mt-0.5">
                  <time>{formatMessageTime(message.createdAt)}</time>
                  {isOwnMessage &&
                    (message.isPending ? (
                      <Loader size={12} className="animate-spin" />
                    ) : message.read ? (
                      <CheckCheck size={12} />
                    ) : (
                      <Check size={12} />
                    ))}
                </div>
              );

              const bubbleContent = (
                <>
                  {message.image && (
                    <a
                      href={message.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mb-1.5"
                    >
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="max-w-[200px] rounded-md object-cover"
                        loading="lazy"
                      />
                    </a>
                  )}
                  {message.text && (
                    <p className="break-words text-sm">{message.text}</p>
                  )}
                  {metaRow}
                </>
              );

              return (
                <div
                  key={message._id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} ${
                    isFirstInGroup ? "mt-2" : "mt-1"
                  }`}
                >
                  {!isOwnMessage ? (
                    <div className="flex items-end gap-2 min-w-0 max-w-[85%] md:max-w-[calc(320px+2rem)]">
                      {showAvatar ? (
                        <div className="flex-shrink-0 pb-0.5">
                          <div className="size-8 rounded-full overflow-hidden border border-base-300">
                            <img
                              src={
                                selectedUser.profilePic || "/avatar.png"
                              }
                              alt="profile pic"
                              className="size-full object-cover"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="w-8 flex-shrink-0" />
                      )}
                      <div className={bubbleClasses}>{bubbleContent}</div>
                    </div>
                  ) : (
                    <div className={bubbleClasses}>{bubbleContent}</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {Array.isArray(messages) && messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-base-content/50 py-20">
            <div className="w-16 h-16 rounded-full bg-base-200 mb-4 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 opacity-50"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                />
              </svg>
            </div>
            <p className="font-medium">Start a new conversation</p>
            <p className="text-sm">
              Be the first to message {selectedUser.fullName}
            </p>
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start mt-2">
            <div className="flex items-end gap-2">
              <div className="flex-shrink-0 pb-0.5">
                <div className="size-8 rounded-full overflow-hidden border border-base-300">
                  <img
                    src={selectedUser.profilePic || "/avatar.png"}
                    alt="profile pic"
                    className="size-full object-cover"
                  />
                </div>
              </div>
              <div className="bg-base-200 rounded-2xl rounded-br-md px-3 py-2 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce"></span>
                <span
                  className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></span>
                <span
                  className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
