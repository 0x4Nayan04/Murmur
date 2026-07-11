import Navbar from "./components/Navbar";
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
      {!isAuthRoute && <Navbar />}
      <AppRoutes authUser={authUser} />
      <Toaster />
    </>
  );
};
export default App;
