const getConfiguredOrigin = () =>
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5001" : window.location.origin);

const normalizeOrigin = (url) => url.replace(/\/+$/, "");

export const getApiBaseUrl = () => {
  const origin = normalizeOrigin(getConfiguredOrigin());
  return origin.endsWith("/api") ? origin : `${origin}/api`;
};

export const getSocketUrl = () => {
  const origin = normalizeOrigin(getConfiguredOrigin());
  return origin.replace(/\/api\/?$/, "");
};
