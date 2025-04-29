import { Phone, Video, X, Circle, MoreVertical } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="p-3 md:p-4 border-b border-base-300 bg-base-100/70 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full relative border border-base-300">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
                className="object-cover"
              />
              {isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5">
                  <span className="absolute size-3 animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative size-3 bg-green-500 rounded-full ring-2 ring-base-100"></span>
                </div>
              )}
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium text-base md:text-lg">
              {selectedUser.fullName}
            </h3>
            <div className="flex items-center gap-1 text-xs md:text-sm">
              {isOnline ? (
                <>
                  <Circle className="size-2 fill-green-500 text-green-500" />
                  <span className="text-green-600">Online</span>
                </>
              ) : (
                <span className="text-zinc-400">Offline</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {/* Close button */}
          <button
            onClick={() => setSelectedUser(null)}
            className="btn btn-sm btn-circle btn-ghost hover:bg-base-300">
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;
