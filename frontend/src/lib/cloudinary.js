import { axiosInstance } from "./axios";

/**
 * Upload image directly to Cloudinary
 * This bypasses our backend for better performance
 * @param {File} file - Image file to upload
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<string>} - Cloudinary image URL
 */
export const uploadToCloudinary = async (file, onProgress) => {
  try {
    // Validate file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      throw new Error("Image size must be less than 5MB");
    }

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      throw new Error(
        "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed",
      );
    }

    // Step 1: Get upload signature from our backend
    const { data: signatureData } =
      await axiosInstance.get("/upload/signature");

    if (!signatureData.success) {
      throw new Error("Failed to get upload signature");
    }

    const { signature, timestamp, cloudName, apiKey, folder } =
      signatureData.data;

    // Step 2: Prepare form data for Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("signature", signature);
    formData.append("timestamp", timestamp);
    formData.append("api_key", apiKey);
    formData.append("folder", folder);

    // Step 3: Upload directly to Cloudinary
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

    // Return the secure URL of the uploaded image
    return uploadResult.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

/**
 * Convert file to base64 (fallback for old upload method)
 * @param {File} file - Image file
 * @returns {Promise<string>} - Base64 string
 */
export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
