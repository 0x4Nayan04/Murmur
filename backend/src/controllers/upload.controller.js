import cloudinary from "../lib/cloudinary.js";

/**
 * Generate a signature for direct Cloudinary uploads from frontend
 * This allows clients to upload directly to Cloudinary without going through our server
 */
export const getUploadSignature = async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Parameters for the upload - only include folder (no preset required for signed uploads)
    const folder = "chat_images";

    // Generate signature using Cloudinary SDK
    // For signed uploads, we only need timestamp and folder
    const paramsToSign = {
      timestamp: timestamp,
      folder: folder,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET,
    );

    res.status(200).json({
      success: true,
      data: {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder: folder,
      },
    });
  } catch (error) {
    console.error("Error generating upload signature:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
