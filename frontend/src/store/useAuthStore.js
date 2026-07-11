import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const CONFIGURED_API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5001" : window.location.origin);
const BASE_URL = CONFIGURED_API_URL.replace(/\/api\/?$/, "").replace(/\/+$/, "");

const toSafeUser = (user) => {
  if (!user) return null;
  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
};

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // action

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: toSafeUser(res.data) });
      get().connectSocket();
    } catch {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  refreshAuthUser: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: toSafeUser(res.data) });
    } catch {
      set({ authUser: null });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: toSafeUser(res.data) });
      await get().refreshAuthUser();
      toast.success("Account created successfully");
      get().connectSocket();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to sign up");
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: toSafeUser(res.data) });
      await get().refreshAuthUser();
      toast.success("Logged in successfully");
      get().connectSocket();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to log in");
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to log out");
      set({ authUser: null });
      get().disconnectSocket();
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data, {
        timeout: 60000,
      });
      set({ authUser: toSafeUser(res.data) });
      toast.success("Profile updated successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket) return;

    // Identity comes from the httpOnly JWT cookie — do not send userId in the query
    const newSocket = io(BASE_URL, {
      withCredentials: true,
    });

    set({ socket: newSocket });

    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });
  },
  disconnectSocket: () => {
    get().socket?.disconnect();
    set({ socket: null, onlineUsers: [] });
  },
}));