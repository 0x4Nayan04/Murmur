import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, Circle, MessageCircle, X } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Filter users based on online status and search query
  const filteredUsers = users
    .filter((user) => !showOnlineOnly || onlineUsers.includes(user._id))
    .filter((user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-80 border-r border-base-300 flex flex-col transition-all duration-300 bg-base-100/50 backdrop-blur-sm">
      {/* Header */}
      <div className="border-b border-base-300 w-full p-4 lg:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <MessageCircle className="size-5 text-primary" />
            </div>
            <h2 className="font-semibold text-lg hidden lg:block">
              Connections
            </h2>
          </div>

          <div className="hidden lg:block">
            <span className="badge badge-primary">
              {onlineUsers.length - 1} active now
            </span>
          </div>
        </div>

        {/* Search and filter */}
        <div className="mt-4 space-y-2">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Find people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-sm input-bordered w-full pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-base-200">
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-2">
            <label className="cursor-pointer flex items-center gap-2 rounded-full px-2 py-1 lg:bg-base-200 transition-colors">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="toggle toggle-xs lg:toggle-sm toggle-primary"
              />
              <span className="text-xs lg:text-sm hidden lg:inline">
                Show active only
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* User list */}
      <div className="overflow-y-auto w-full py-3 flex-1 scrollbar-thin">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`
                w-full p-2 lg:p-3 flex items-center gap-3 mb-1 mx-1 lg:mx-2 rounded-xl
                hover:bg-base-200 transition-all duration-200
                ${
                  selectedUser?._id === user._id
                    ? "bg-primary/10 border border-primary/20"
                    : "border border-transparent"
                }
              `}>
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="size-11 lg:size-12 object-cover rounded-full shadow-sm"
                />
                {onlineUsers.includes(user._id) && (
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <span className="relative size-3 bg-green-500 rounded-full ring-2 ring-base-100"></span>
                  </div>
                )}
              </div>
              {/* User info - only visible on larger screens */}
              <div className="hidden lg:block text-left min-w-0 flex-1">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="flex items-center gap-1 text-sm">
                  {onlineUsers.includes(user._id) ? (
                    <>
                      <Circle className="size-2 fill-green-500 text-green-500" />
                      <span className="text-green-600">Online</span>
                    </>
                  ) : (
                    <span className="text-zinc-400">Offline</span>
                  )}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-zinc-500">
            <Users className="size-10 opacity-20 mb-2" />
            <p className="text-center px-4">
              {showOnlineOnly
                ? "No one is active right now"
                : searchQuery
                ? "No matching connections found"
                : "You don't have any contacts yet"}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
