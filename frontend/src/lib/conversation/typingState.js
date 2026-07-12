import { normalizeId } from "../utils.js";

export const isPartnerTyping = (typingUsers, userId) =>
  Boolean(typingUsers?.[normalizeId(userId)]);
