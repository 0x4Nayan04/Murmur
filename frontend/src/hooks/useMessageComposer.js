import { useRef, useReducer, useEffect } from "react";
import toast from "react-hot-toast";
import {
  uploadToCloudinary,
  validateImageFile,
} from "../lib/cloudinary";
import { getApiErrorMessage } from "../lib/utils";

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

const uploadMessageImage = async (imageFile) => {
  if (!imageFile) return null;
  return uploadToCloudinary(imageFile);
};

const submitMessage = async ({
  receiverId,
  messageText,
  imageFileRef,
  sendMessage,
  emitStopTyping,
  clearSentState,
}) => {
  emitStopTyping(receiverId);
  const imageUrl = await uploadMessageImage(imageFileRef.current);
  const sent = await sendMessage(
    {
      text: messageText || undefined,
      image: imageUrl || undefined,
    },
    receiverId,
  );

  if (sent) clearSentState(receiverId);
};

export const useMessageComposer = ({
  selectedUser,
  sendMessage,
  emitTyping,
  emitStopTyping,
}) => {
  const [inputState, dispatch] = useReducer(inputReducer, initialInputState);
  const { text, imagePreview, isUploading } = inputState;
  const imageFileRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const uploadOperationRef = useRef(null);
  const selectedUserIdRef = useRef(selectedUser?._id);
  selectedUserIdRef.current = selectedUser?._id;

  useEffect(() => {
    dispatch({ type: "RESET" });
    imageFileRef.current = null;
    uploadOperationRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [selectedUser?._id]);

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

  const handleTextChange = (e) => {
    dispatch({ type: "SET_TEXT", payload: e.target.value });
    if (!selectedUser) return;

    emitTyping(selectedUser._id);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(selectedUser._id);
    }, 2000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const conversationId = selectedUser?._id;

    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      e.target.value = "";
      return;
    }

    imageFileRef.current = file;

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

  const clearSentState = (receiverId) => {
    if (selectedUserIdRef.current !== receiverId) return;
    dispatch({ type: "CLEAR_SENT" });
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
      await submitMessage({
        receiverId,
        messageText,
        imageFileRef,
        sendMessage,
        emitStopTyping,
        clearSentState,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(
        getApiErrorMessage(error, error.message || "Failed to send message"),
      );
    } finally {
      if (uploadOperationRef.current === operationId) {
        uploadOperationRef.current = null;
        dispatch({ type: "SET_UPLOADING", payload: false });
      }
    }
  };

  return {
    text,
    imagePreview,
    isUploading,
    fileInputRef,
    canSend: Boolean(text.trim() || imagePreview),
    handleTextChange,
    handleImageChange,
    removeImage,
    handleSendMessage,
  };
};
