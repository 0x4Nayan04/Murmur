import { Image, Send, X } from "lucide-react";
import { useRef, useReducer, useEffect } from "react";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";
import {
  MAX_IMAGE_SIZE,
  VALID_IMAGE_TYPES,
  uploadToCloudinary,
} from "../lib/cloudinary";

const initialInputState = {
  text: "",
  imagePreview: null,
  isUploading: false,
};

const inputReducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return initialInputState;
    case "SET_TEXT":
      return { ...state, text: action.payload };
    case "SET_IMAGE_PREVIEW":
      return { ...state, imagePreview: action.payload };
    case "SET_UPLOADING":
      return { ...state, isUploading: action.payload };
    case "CLEAR_SENT":
      return { ...state, text: "", imagePreview: null };
    case "CLEAR_IMAGE":
      return { ...state, imagePreview: null };
    default:
      return state;
  }
};

const MessageInput = () => {
  const [inputState, dispatch] = useReducer(inputReducer, initialInputState);
  const { text, imagePreview, isUploading } = inputState;
  const imageFileRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const uploadOperationRef = useRef(null);
  const { sendMessage, selectedUser, emitTyping, emitStopTyping } =
    useChatStore();
  const selectedUserIdRef = useRef(selectedUser?._id);
  selectedUserIdRef.current = selectedUser?._id;

  // Reset form state when selected user changes (BUG FIX: image showing on wrong user)
  useEffect(() => {
    dispatch({ type: "RESET" });
    imageFileRef.current = null;
    uploadOperationRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [selectedUser?._id]); // Only trigger when user ID changes

  // Handle typing indicator
  const handleTextChange = (e) => {
    dispatch({ type: "SET_TEXT", payload: e.target.value });

    if (!selectedUser) return;

    // Emit typing event
    emitTyping(selectedUser._id);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(selectedUser._id);
    }, 2000);
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (selectedUser) {
        emitStopTyping(selectedUser._id);
      }
    };
  }, [selectedUser, emitStopTyping]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const conversationId = selectedUser?._id;

    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPEG, PNG, GIF, and WebP images are allowed");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image size must be less than 5MB");
      e.target.value = "";
      return;
    }

    // Store the file for later upload
    imageFileRef.current = file;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (selectedUserIdRef.current === conversationId) {
        dispatch({ type: "SET_IMAGE_PREVIEW", payload: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    dispatch({ type: "CLEAR_IMAGE" });
    imageFileRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    const receiverId = selectedUser?._id;
    if (!receiverId) return;

    const operationId = Symbol("message-upload");
    uploadOperationRef.current = operationId;
    const messageText = text.trim();

    try {
      dispatch({ type: "SET_UPLOADING", payload: true });

      emitStopTyping(receiverId);

      let imageUrl = null;

      // Upload image to Cloudinary if present
      if (imageFileRef.current) {
        try {
          imageUrl = await uploadToCloudinary(imageFileRef.current);
        } catch (uploadError) {
          toast.error(uploadError.message || "Failed to upload image");
          return;
        }
      }

      // Send message with text and/or image URL
      const sent = await sendMessage(
        {
          text: messageText || undefined,
          image: imageUrl || undefined,
        },
        receiverId,
      );

      if (sent && selectedUserIdRef.current === receiverId) {
        dispatch({ type: "CLEAR_SENT" });
        imageFileRef.current = null;
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      if (uploadOperationRef.current === operationId) {
        uploadOperationRef.current = null;
        dispatch({ type: "SET_UPLOADING", payload: false });
      }
    }
  };

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
            !text.trim() && !imagePreview
              ? "btn-neutral opacity-50"
              : "btn-primary text-primary-content"
          }`}
          disabled={(!text.trim() && !imagePreview) || isUploading}
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
