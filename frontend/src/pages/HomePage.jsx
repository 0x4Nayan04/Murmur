import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import ConnectionBanner from "../components/ConnectionBanner";

const HomePage = () => {
  const { selectedUser, subscribeToMessages, unsubscribeFromMessages } =
    useChatStore();
  const { socket } = useAuthStore();

  useEffect(() => {
    if (!socket) return;
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, subscribeToMessages, unsubscribeFromMessages]);

  return (
    <main
      id="main-content"
      className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-base-200 pt-16"
    >
      <ConnectionBanner />
      <div className="flex h-full min-h-0 flex-1 overflow-hidden">
        <Sidebar className={selectedUser ? "hidden lg:flex" : "flex"} />
        {selectedUser ? (
          <ChatContainer />
        ) : (
          <NoChatSelected className="hidden flex-1 lg:flex" />
        )}
      </div>
    </main>
  );
};
export default HomePage;
