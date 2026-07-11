import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const API_ORIGIN =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5001" : window.location.origin);
const NORMALIZED_API_ORIGIN = API_ORIGIN.replace(/\/+$/, "");
const BASE_URL = NORMALIZED_API_ORIGIN.endsWith("/api")
  ? NORMALIZED_API_ORIGIN
  : `${NORMALIZED_API_ORIGIN}/api`;

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Crucial for sending cookies with cross-origin requests
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to handle common request setup
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add any common request handling here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";
      const isAuthCheck = requestUrl.includes("/auth/check");

      if (!isAuthCheck && useAuthStore.getState().authUser) {
        useAuthStore.setState({ authUser: null });
        useAuthStore.getState().disconnectSocket();
        useChatStore.getState().resetChat();
      }
    } else if (error.response?.status === 500) {
      console.error("Server error - please try again later");
    } else if (!error.response) {
      console.error("Network error - check your internet connection");
    }
    return Promise.reject(error);
  },
);
