import { normalizeId } from "../utils.js";

export const deriveReadByPartnersFromMessages = (messages, authUserId) => {
  const authId = normalizeId(authUserId);
  if (!authId || !Array.isArray(messages)) return {};

  return messages.reduce((acc, message) => {
    if (
      normalizeId(message.senderId) === authId &&
      message.isRead &&
      !message.isDeleted
    ) {
      const partnerId = normalizeId(message.receiverId);
      if (partnerId) acc[partnerId] = true;
    }
    return acc;
  }, {});
};
