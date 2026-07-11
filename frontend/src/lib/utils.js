export const normalizeId = (id) => (id == null ? "" : String(id));

export const getApiErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  fallback;

export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function groupMessagesByDate(messages) {
  if (!Array.isArray(messages)) return {};

  return messages.reduce((groups, message) => {
    const messageDate = new Date(message.createdAt);
    const dateKey = [
      messageDate.getFullYear(),
      String(messageDate.getMonth() + 1).padStart(2, "0"),
      String(messageDate.getDate()).padStart(2, "0"),
    ].join("-");

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
    return groups;
  }, {});
}

export function formatDateDivider(dateKey) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
