import { X, ChevronLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import UserAvatar from "./UserAvatar";
import OnlineStatus from "./OnlineStatus";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="p-3 md:p-4 border-b border-base-300 bg-base-100/70 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar
            profilePic={selectedUser.profilePic}
            alt={selectedUser.fullName}
            size="md"
            showOnlineDot={isOnline}
            animatedDot={isOnline}
            imageClassName="border border-base-300 shadow-none"
          />

          <div>
            <h3 className="font-medium text-base md:text-lg">
              {selectedUser.fullName}
            </h3>
            <OnlineStatus isOnline={isOnline} className="text-xs md:text-sm" />
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <button
            type="button"
            onClick={() => setSelectedUser(null)}
            className="icon-btn-focus btn btn-sm btn-circle btn-ghost transition-colors duration-200 hover:bg-base-200 lg:btn-circle"
            aria-label="Close conversation"
          >
            <ChevronLeft size={20} className="lg:hidden" />
            <X size={20} className="hidden lg:block" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;
