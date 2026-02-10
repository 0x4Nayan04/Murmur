import axios from "axios";

// Use environment variable for API URL, fallback to localhost for development
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:5001/api";

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
      console.log("Unauthorized access - you may need to log in again");
    } else if (error.response?.status === 500) {
      console.error("Server error - please try again later");
    } else if (!error.response) {
      console.error("Network error - check your internet connection");
    }
    return Promise.reject(error);
  },
);
