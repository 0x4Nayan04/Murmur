import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import { Check, CheckCheck } from "lucide-react";

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
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

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
              const showAvatar =
                index === 0 ||
                dateMessages[index - 1].senderId !== message.senderId;

              return (
                <div
                  key={message._id}
                  className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}
                  ref={
                    index === dateMessages.length - 1 &&
                    date === Object.keys(groupedMessages).slice(-1)[0]
                      ? messageEndRef
                      : null
                  }>
                  {showAvatar && (
                    <div className="chat-image avatar">
                      <div className="size-8 md:size-9 rounded-full border border-base-300">
                        <img
                          src={
                            isOwnMessage
                              ? authUser.profilePic || "/avatar.png"
                              : selectedUser.profilePic || "/avatar.png"
                          }
                          alt="profile pic"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}

                  <div
                    className={`chat-bubble ${
                      isOwnMessage
                        ? "bg-primary/90 text-primary-content"
                        : "bg-base-200"
                    } flex flex-col px-3 py-2 shadow-sm`}>
                    {message.image && (
                      <a
                        href={message.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mb-1.5">
                        <img
                          src={message.image}
                          alt="Attachment"
                          className="max-w-[200px] rounded-md object-cover"
                          loading="lazy"
                        />
                      </a>
                    )}

                    {message.text && (
                      <p className="break-words">{message.text}</p>
                    )}

                    <div className="text-right text-[10px] opacity-70 flex gap-0.5 items-center justify-end">
                      <time className="ml-1">
                        {formatMessageTime(message.createdAt)}
                      </time>
                      {isOwnMessage &&
                        (message.read ? (
                          <CheckCheck size={12} />
                        ) : (
                          <Check size={12} />
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-base-content/50 py-20">
            <div className="w-16 h-16 rounded-full bg-base-200 mb-4 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 opacity-50">
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
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
