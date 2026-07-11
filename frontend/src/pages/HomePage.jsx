import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

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
    <main className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-16">
        <div className="w-full h-[calc(100vh-64px)]">
          <div className="flex h-full overflow-hidden">
            <Sidebar
              className={selectedUser ? "hidden lg:flex" : "flex"}
            />
            {selectedUser ? (
              <ChatContainer />
            ) : (
              <NoChatSelected className="hidden lg:flex flex-1" />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
export default HomePage;
