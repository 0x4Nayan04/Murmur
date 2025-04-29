import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, Smile, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
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
              type="button">
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
            placeholder="Write your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
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
              onClick={() => fileInputRef.current?.click()}>
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
        />

        <button
          type="submit"
          className={`btn btn-sm btn-circle ${
            !text.trim() && !imagePreview
              ? "btn-neutral opacity-50"
              : "btn-primary text-primary-content"
          }`}
          disabled={!text.trim() && !imagePreview}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
