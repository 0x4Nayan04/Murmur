import axios from "axios";
import { getApiBaseUrl } from "./config.js";
import { emitUnauthorized } from "./sessionEvents.js";

export const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

const logResponseError = (status) => {
  if (status >= 500) {
    console.error("Server error - please try again later");
  }
};

const logNetworkError = (error) => {
  if (error.code === "ECONNABORTED") {
    console.error("Request timed out - server took too long to respond");
    return;
  }

  console.error("Network error - check your internet connection");
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";
      emitUnauthorized({ isAuthCheck: requestUrl.includes("/auth/check") });
    } else if (error.response) {
      logResponseError(error.response.status);
    } else {
      logNetworkError(error);
    }
    return Promise.reject(error);
  },
);
