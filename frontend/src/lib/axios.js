import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Crucial for sending cookies with cross-origin requests
  headers: {
    "Content-Type": "application/json",
  },
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
    }
    return Promise.reject(error);
  },
);
