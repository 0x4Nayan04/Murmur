const BASE64_IMAGE_REGEX =
  /^data:image\/(jpeg|jpg|png|gif|webp);base64,/i;

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const isBase64Image = (value) => BASE64_IMAGE_REGEX.test(value);

export const getBase64PayloadSize = (base64String) => {
  const payload = base64String.split(",")[1] || "";
  return Math.ceil((payload.length * 3) / 4);
};

export const assertBase64ImageSize = (base64String) => {
  const size = getBase64PayloadSize(base64String);
  if (size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Image size must be less than 5MB");
  }
};

export const extractCloudinaryPublicId = (url) => {
  try {
    const parsed = new URL(url);
    const uploadMarker = "/upload/";
    const uploadIndex = parsed.pathname.indexOf(uploadMarker);
    if (uploadIndex === -1) return null;

    let publicId = parsed.pathname.slice(uploadIndex + uploadMarker.length);
    publicId = publicId.replace(/^v\d+\//, "");
    publicId = publicId.replace(/\.[^/.]+$/, "");
    return publicId || null;
  } catch {
    return null;
  }
};

export const isCloudinaryUrl = (url) => {
  try {
    const parsed = new URL(url);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (
      parsed.protocol !== "https:" ||
      parsed.hostname !== "res.cloudinary.com" ||
      !cloudName
    ) {
      return false;
    }

    return parsed.pathname.startsWith(`/${cloudName}/`);
  } catch {
    return false;
  }
};
