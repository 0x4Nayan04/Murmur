import cloudinary from "../lib/cloudinary.js";

/**
 * Generate a signature for direct Cloudinary uploads from frontend
 * This allows clients to upload directly to Cloudinary without going through our server
 */
export const getUploadSignature = async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Parameters for the upload
    const uploadParams = {
      timestamp: timestamp,
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || "chat_app", // Optional: configure in Cloudinary
      folder: "chat_images", // Organize uploads in a folder
    };

    // Generate signature using Cloudinary SDK
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET,
    );

    res.status(200).json({
      success: true,
      data: {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        uploadPreset: uploadParams.upload_preset,
        folder: uploadParams.folder,
      },
    });
  } catch (error) {
    console.error("Error generating upload signature:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
