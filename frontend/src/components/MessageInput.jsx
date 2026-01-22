import { Image, Send, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";
import { uploadToCloudinary } from "../lib/cloudinary";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { sendMessage, selectedUser, emitTyping, emitStopTyping } = useChatStore();

  // Handle typing indicator
  const handleTextChange = (e) => {
    setText(e.target.value);

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

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Check file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Store the file for later upload
    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      setIsUploading(true);

      // Stop typing indicator
      if (selectedUser) {
        emitStopTyping(selectedUser._id);
      }

      let imageUrl = null;

      // Upload image to Cloudinary if present
      if (imageFile) {
        try {
          imageUrl = await uploadToCloudinary(imageFile);
        } catch (uploadError) {
          toast.error(uploadError.message || "Failed to upload image");
          setIsUploading(false);
          return;
        }
      }

      // Send message with text and/or image URL
      await sendMessage({
        text: text.trim() || undefined,
        image: imageUrl || undefined,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsUploading(false);
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
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-base-200 hover:bg-base-300
              flex items-center justify-center shadow-md transition-colors duration-200"
              type="button"
              disabled={isUploading}
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
              className={`btn btn-circle btn-sm bg-base-100
                    ${
                      imagePreview
                        ? "text-emerald-500"
                        : "text-base-content/70 hover:text-base-content"
                    }`}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Image size={18} />
            </button>
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Check file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Store the file for later upload
    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      setIsUploading(true);
      let imageUrl = null;

      // Upload image to Cloudinary if present
      if (imageFile) {
        try {
          imageUrl = await uploadToCloudinary(imageFile);
        } catch (uploadError) {
          toast.error(uploadError.message || "Failed to upload image");
          setIsUploading(false);
          return;
        }
      }

      // Send message with text and/or image URL
      await sendMessage({
        text: text.trim() || undefined,
        image: imageUrl || undefined,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsUploading(false);
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
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-base-200 hover:bg-base-300
              flex items-center justify-center shadow-md transition-colors duration-200"
              type="button"
              disabled={isUploading}
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
            onChange={(e) => setText(e.target.value)}
            disabled={isUploading}
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              className={`btn btn-circle btn-sm bg-base-100
                    ${
                      imagePreview
                        ? "text-emerald-500"
                        : "text-base-content/70 hover:text-base-content"
                    }`}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Image size={18} />
            </button>
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
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
