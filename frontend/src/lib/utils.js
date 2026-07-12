export const normalizeId = (id) => {
  if (id == null) return "";
  if (typeof id === "object") {
    if (id._id != null) return String(id._id);
    if (
      typeof id.toString === "function" &&
      id.constructor?.name === "ObjectId"
    ) {
      return id.toString();
    }
  }
  return String(id);
};

const VALIDATION_FIELD_KEYS = {
  "body.email": "email",
  "body.password": "password",
  "body.fullName": "fullName",
  "body.profilePic": "profilePic",
  "body.text": "text",
  "body.image": "image",
};

export const parseApiFieldErrors = (error) => {
  const details = error?.response?.data?.details;
  if (!Array.isArray(details)) return {};

  return details.reduce((acc, { field, message }) => {
    const key = VALIDATION_FIELD_KEYS[field] || field.split(".").pop() || field;
    if (!acc[key]) acc[key] = message;
    return acc;
  }, {});
};

export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong",
) => {
  if (!error) return fallback;

  if (error.code === "ECONNABORTED") {
    return "The server took too long to respond. Please try again.";
  }

  const status = error.response?.status;

  if (status === 429) {
    return (
      error.response?.data?.message ||
      "Too many attempts. Please wait a few minutes and try again."
    );
  }

  if (status === 504) {
    return (
      error.response?.data?.message ||
      "The server took too long to respond. Please try again."
    );
  }

  if (status === 503) {
    return (
      error.response?.data?.message ||
      "Service temporarily unavailable. Please try again shortly."
    );
  }

  const data = error.response?.data;
  if (data?.details?.length) {
    return data.details[0].message;
  }

  return data?.message || data?.error || fallback;
};

export const showApiError = (error, fallback) => {
  const fieldErrors = parseApiFieldErrors(error);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, message: null };
  }

  return {
    fieldErrors: {},
    message: getApiErrorMessage(error, fallback),
  };
};

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
