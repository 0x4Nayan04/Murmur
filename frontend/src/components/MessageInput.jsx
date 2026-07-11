import { Image, Send, X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useMessageComposer } from "../hooks/useMessageComposer";

const MessageInput = () => {
  const { sendMessage, selectedUser, emitTyping, emitStopTyping } =
    useChatStore();
  const {
    text,
    imagePreview,
    isUploading,
    fileInputRef,
    canSend,
    handleTextChange,
    handleImageChange,
    removeImage,
    handleSendMessage,
  } = useMessageComposer({
    selectedUser,
    sendMessage,
    emitTyping,
    emitStopTyping,
  });

  return (
    <div className="p-4 bg-base-100/50 backdrop-blur-sm border-t border-base-300">
      {imagePreview && (
        <div className="mb-3 relative group">
          <div className="max-w-[200px]">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-auto object-cover rounded-lg border border-base-300 shadow-sm"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-base-200 shadow-md transition-colors duration-200 hover:bg-base-300"
              type="button"
              disabled={isUploading}
              aria-label="Remove image attachment"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            className="w-full input input-bordered rounded-full input-sm sm:input-md pl-5 pr-24"
            placeholder={
              imagePreview
                ? "Add a caption (optional)..."
                : "Write your message..."
            }
            value={text}
            onChange={handleTextChange}
            disabled={isUploading}
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              className={`btn btn-circle btn-sm bg-base-100 transition-colors duration-200 ${
                imagePreview
                  ? "text-emerald-500 hover:bg-base-200"
                  : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
              }`}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              aria-label="Attach an image"
            >
              <Image size={18} />
            </button>
          </div>
        </div>

        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
          disabled={isUploading}
        />

        <button
          type="submit"
          className={`btn btn-sm btn-circle ${
            canSend
              ? "btn-primary text-primary-content"
              : "btn-neutral opacity-50"
          }`}
          disabled={!canSend || isUploading}
          aria-label="Send message"
        >
          {isUploading ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
