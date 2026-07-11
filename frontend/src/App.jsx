import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useChatStore } from "./store/useChatStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { resetChat } = useChatStore();
  useThemeStore(); // initialize theme on <html> via store
  const location = useLocation();
  const isAuthRoute = ["/login", "/signup"].includes(location.pathname);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authUser && !isCheckingAuth) resetChat();
  }, [authUser, isCheckingAuth, resetChat]);

  if (isCheckingAuth && !authUser)
    return (
      <div
        className="flex items-center justify-center h-screen"
        role="status"
        aria-live="polite"
        aria-label="Checking authentication"
      >
        <Loader className="size-10 animate-spin" aria-hidden="true" />
      </div>
    );

  return (
    <>
      {!isAuthRoute && <Navbar />}

      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/profile"
          element={
            authUser ? <ProfilePage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="*"
          element={<Navigate to={authUser ? "/" : "/login"} replace />}
        />
      </Routes>

      <Toaster />
    </>
  );
};
export default App;
