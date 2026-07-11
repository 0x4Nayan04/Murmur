import { axiosInstance } from "./axios";

export const VALID_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const validateImageFile = (file) => {
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    return "Only JPEG, PNG, GIF, and WebP images are allowed";
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return "Image size must be less than 5MB";
  }
  return null;
};

export const uploadToCloudinary = async (file) => {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const { data: signatureData } =
    await axiosInstance.get("/upload/signature");

  if (!signatureData.success) {
    throw new Error("Failed to get upload signature");
  }

  const { signature, timestamp, cloudName, apiKey, folder } =
    signatureData.data;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("signature", signature);
  formData.append("timestamp", timestamp);
  formData.append("api_key", apiKey);
  formData.append("folder", folder);

  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const response = await fetch(cloudinaryUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Upload failed");
  }

  const uploadResult = await response.json();
  return uploadResult.secure_url;
};
