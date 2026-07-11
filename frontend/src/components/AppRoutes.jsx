import { lazy, Suspense } from "react";
import { Loader } from "lucide-react";
import { Navigate, Route, Routes } from "react-router-dom";

const HomePage = lazy(() => import("../pages/HomePage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const SignUpPage = lazy(() => import("../pages/SignUpPage"));

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
  <Suspense fallback={<AuthLoadingScreen />}>
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
  </Suspense>
);
