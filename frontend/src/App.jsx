import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";
import { AppRoutes, AuthLoadingScreen } from "./components/AppRoutes";

import { useLocation } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useChatStore } from "./store/useChatStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";
import { onUnauthorized } from "./lib/sessionEvents";

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
    return onUnauthorized(() => {
      const { authUser: currentUser, disconnectSocket } =
        useAuthStore.getState();
      if (!currentUser) return;

      useAuthStore.setState({ authUser: null });
      disconnectSocket();
      useChatStore.getState().resetChat();
    });
  }, []);

  useEffect(() => {
    if (!authUser && !isCheckingAuth) resetChat();
  }, [authUser, isCheckingAuth, resetChat]);

  if (isCheckingAuth && !authUser) {
    return <AuthLoadingScreen />;
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-content"
      >
        Skip to main content
      </a>
      {!isAuthRoute && <Navbar />}
      <ErrorBoundary>
        <AppRoutes authUser={authUser} />
      </ErrorBoundary>
      <Toaster
        position="top-center"
        toastOptions={{
          className:
            "!bg-base-100 !text-base-content !border !border-base-300 !shadow-lg",
          duration: 4000,
        }}
      />
    </>
  );
};
export default App;
