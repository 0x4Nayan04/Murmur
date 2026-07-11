import { Loader } from "lucide-react";
import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import ProfilePage from "../pages/ProfilePage";
import SignUpPage from "../pages/SignUpPage";

export const AuthLoadingScreen = () => (
  <div
    className="flex items-center justify-center h-screen"
    role="status"
    aria-live="polite"
    aria-label="Checking authentication"
  >
    <Loader className="size-10 animate-spin" aria-hidden="true" />
  </div>
);

export const AppRoutes = ({ authUser }) => (
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
      element={authUser ? <ProfilePage /> : <Navigate to="/login" replace />}
    />
    <Route
      path="*"
      element={<Navigate to={authUser ? "/" : "/login"} replace />}
    />
  </Routes>
);
