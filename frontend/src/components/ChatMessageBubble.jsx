import { Check, CheckCheck, Loader } from "lucide-react";
import { formatMessageTime, normalizeId } from "../lib/utils";

const MessageMeta = ({ createdAt, isOwnMessage, message }) => (
  <div className="text-right text-[10px] opacity-70 flex gap-1 items-center justify-end mt-0.5">
    <time dateTime={createdAt}>{formatMessageTime(createdAt)}</time>
    {isOwnMessage &&
      (message.isPending ? (
        <Loader size={12} className="animate-spin" />
      ) : message.isRead ? (
        <CheckCheck size={12} />
      ) : (
        <Check size={12} />
      ))}
  </div>
);

const MessageBody = ({ message, showStatus }) => (
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
    {message.text && <p className="break-words text-sm">{message.text}</p>}
    {message.isDeleted && (
      <p className="break-words text-sm italic opacity-70">Message deleted</p>
    )}
    <MessageMeta
      createdAt={message.createdAt}
      isOwnMessage={showStatus}
      message={message}
    />
  </>
);

const ChatMessageBubble = ({
  message,
  authUserId,
  selectedUser,
  isFirstInGroup,
}) => {
  const isOwnMessage =
    normalizeId(message.senderId) === normalizeId(authUserId);
  const showAvatar = !isOwnMessage && isFirstInGroup;
  const bubbleClasses = `max-w-[85%] md:max-w-[320px] px-3 py-2 shadow-md ${
    isOwnMessage
      ? "bg-primary text-primary-content rounded-2xl rounded-bl-md"
      : "bg-base-200 rounded-2xl rounded-br-md"
  } ${message.isPending ? "opacity-60" : ""}`;

  return (
    <div
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
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt="profile pic"
                  className="size-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="w-8 flex-shrink-0" />
          )}
          <div className={bubbleClasses}>
            <MessageBody message={message} showStatus={false} />
          </div>
        </div>
      ) : (
        <div className={bubbleClasses}>
          <MessageBody message={message} showStatus />
        </div>
      )}
    </div>
  );
};

export default ChatMessageBubble;
