import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { getSocketUrl } from "../lib/config.js";
import { getApiErrorMessage, showApiError } from "../lib/utils.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useChatStore } from "./useChatStore.js";

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
  isSocketConnected: false,

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
      return { success: true, fieldErrors: {} };
    } catch (error) {
      const { fieldErrors, message } = showApiError(error, "Failed to sign up");
      if (message) toast.error(message);
      return { success: false, fieldErrors };
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
      return { success: true, fieldErrors: {} };
    } catch (error) {
      const { fieldErrors, message } = showApiError(error, "Failed to log in");
      if (message) toast.error(message);
      return { success: false, fieldErrors };
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
      if (error.response?.status !== 401) {
        toast.error(getApiErrorMessage(error, "Failed to log out"));
      }
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
      return { success: true, fieldErrors: {} };
    } catch (error) {
      const { fieldErrors, message } = showApiError(
        error,
        "Failed to update profile",
      );
      if (message) toast.error(message);
      return { success: false, fieldErrors };
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket) return;

    const newSocket = io(getSocketUrl(), {
      withCredentials: true,
    });

    set({ socket: newSocket });

    newSocket.on("connect", () => {
      set({ isSocketConnected: true });
      useChatStore.getState().subscribeToMessages();
    });

    newSocket.on("disconnect", () => {
      set({ isSocketConnected: false });
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    newSocket.on("connect_error", (error) => {
      set({ isSocketConnected: false });
      console.error("Socket connection error:", error.message);
      toast.error("Connection lost. Retrying…");
    });
  },
  disconnectSocket: () => {
    useChatStore.getState().unsubscribeFromMessages();
    get().socket?.disconnect();
    set({ socket: null, onlineUsers: [], isSocketConnected: false });
  },
}));
