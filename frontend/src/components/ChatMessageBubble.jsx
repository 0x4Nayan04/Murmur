import { useState } from "react";
import {
  Check,
  CheckCheck,
  Loader,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatMessageTime, normalizeId } from "../lib/utils";
import { getAvatarSrc } from "../lib/avatar";
import { useChatStore } from "../store/useChatStore";
import ConfirmDialog from "./ui/ConfirmDialog";
import ImageLightbox from "./ui/ImageLightbox";

const MessageMeta = ({ createdAt, isOwnMessage, message, partnerHasRead }) => {
  const isRead = message.isRead || partnerHasRead;

  return (
    <div className="mt-0.5 flex items-center justify-end gap-1 text-right text-[10px] opacity-70">
      {message.isEdited && !message.isDeleted && (
        <span className="italic">edited</span>
      )}
      <time dateTime={createdAt}>{formatMessageTime(createdAt)}</time>
      {isOwnMessage &&
        !message.isDeleted &&
        (message.isPending ? (
          <Loader
            size={12}
            className="animate-spin"
            aria-label="Sending"
            data-message-status="sending"
          />
        ) : isRead ? (
          <CheckCheck
            size={12}
            className="text-primary-content"
            aria-label="Read"
            data-message-status="read"
          />
        ) : (
          <Check
            size={12}
            className="text-primary-content/60"
            aria-label="Sent"
            data-message-status="sent"
          />
        ))}
    </div>
  );
};

const MessageBody = ({ message, showStatus, onImageClick, partnerHasRead }) => {
  if (message.isDeleted) {
    return (
      <>
        <p className="break-words text-sm italic opacity-70">Message deleted</p>
        <MessageMeta
          createdAt={message.createdAt}
          isOwnMessage={showStatus}
          message={message}
          partnerHasRead={partnerHasRead}
        />
      </>
    );
  }

  return (
    <>
      {message.image && (
        <button
          type="button"
          className="mb-1.5 block cursor-zoom-in"
          onClick={() => onImageClick(message.image)}
          aria-label="View image attachment"
        >
          <img
            src={message.image}
            alt="Attachment"
            className="max-w-[200px] rounded-md object-cover"
            loading="lazy"
          />
        </button>
      )}
      {message.text && <p className="break-words text-sm">{message.text}</p>}
      <MessageMeta
        createdAt={message.createdAt}
        isOwnMessage={showStatus}
        message={message}
        partnerHasRead={partnerHasRead}
      />
    </>
  );
};

const MessageActions = ({ onEdit, onDelete, canEdit }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className={`btn btn-ghost btn-xs btn-circle transition-opacity opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 lg:focus-visible:opacity-100 ${open ? "lg:!opacity-100" : ""}`}
        aria-label="Message options"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreVertical size={14} />
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-label="Close message options"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 top-full z-20 mt-1 min-w-[120px] overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-lg"
          >
            {canEdit && (
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-base-200"
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
              >
                <Pencil size={14} />
                Edit
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-error transition-colors hover:bg-error/10"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const ChatMessageBubble = ({
  message,
  authUserId,
  selectedUser,
  isFirstInGroup,
}) => {
  const { editMessage, deleteMessage, readByPartners } = useChatStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || "");
  const [isSaving, setIsSaving] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOwnMessage =
    normalizeId(message.senderId) === normalizeId(authUserId);
  const showAvatar = !isOwnMessage && isFirstInGroup;
  const canManage = isOwnMessage && !message.isPending && !message.isDeleted;
  const canEdit = canManage && Boolean(message.text);
  const partnerHasRead = Boolean(
    readByPartners?.[normalizeId(message.receiverId)],
  );

  const bubbleClasses = `relative max-w-[85%] md:max-w-[320px] px-3 py-2 shadow-md ${
    isOwnMessage
      ? "bg-primary text-primary-content rounded-2xl rounded-bl-md"
      : "bg-base-200 rounded-2xl rounded-br-md"
  } ${message.isPending ? "opacity-60" : ""}`;

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    setIsSaving(true);
    const saved = await editMessage(message._id, editText);
    setIsSaving(false);
    if (saved) setIsEditing(false);
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    await deleteMessage(message._id);
  };

  return (
    <>
      <div
        className={`animate-message-enter flex ${isOwnMessage ? "justify-end" : "justify-start"} ${
          isFirstInGroup ? "mt-2" : "mt-1"
        }`}
      >
        {!isOwnMessage ? (
          <div className="flex min-w-0 max-w-[85%] items-end gap-2 md:max-w-[calc(320px+2rem)]">
            {showAvatar ? (
              <div className="shrink-0 pb-0.5">
                <div className="size-8 overflow-hidden rounded-full border border-base-300">
                  <img
                    src={getAvatarSrc(selectedUser.profilePic)}
                    alt={selectedUser.fullName}
                    className="size-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="w-8 shrink-0" />
            )}
            <div className={bubbleClasses}>
              <MessageBody
                message={message}
                showStatus={false}
                onImageClick={setLightboxSrc}
                partnerHasRead={false}
              />
            </div>
          </div>
        ) : (
          <div className="group flex items-start gap-1">
            {canManage && !isEditing && (
              <MessageActions
                onEdit={() => {
                  setEditText(message.text || "");
                  setIsEditing(true);
                }}
                onDelete={() => setShowDeleteConfirm(true)}
                canEdit={canEdit}
              />
            )}
            <div className={bubbleClasses}>
              {isEditing ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSaveEdit();
                  }}
                  className="space-y-2"
                >
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="input input-xs w-full bg-primary-content/10 text-primary-content"
                    autoFocus
                    disabled={isSaving}
                    aria-label="Edit message"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-xs bg-primary-content text-primary"
                      disabled={isSaving || !editText.trim()}
                    >
                      {isSaving ? "Saving…" : "Save"}
                    </button>
                  </div>
                </form>
              ) : (
                <MessageBody
                  message={message}
                  showStatus
                  onImageClick={setLightboxSrc}
                  partnerHasRead={partnerHasRead}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete message?"
        message="This message will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={() => void handleDelete()}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

export default ChatMessageBubble;
