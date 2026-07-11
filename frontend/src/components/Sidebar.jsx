import { useEffect, useState, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import SidebarUserItem from "./SidebarUserItem";
import { Users, Search, MessageCircle, X } from "lucide-react";
import { normalizeId } from "../lib/utils";

const Sidebar = ({ className = "" }) => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    unreadCounts,
  } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const onlineUserIds = useMemo(() => new Set(onlineUsers), [onlineUsers]);

  const filteredUsers = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return users.filter((user) => {
      if (showOnlineOnly && !onlineUserIds.has(user._id)) return false;
      return user.fullName.toLowerCase().includes(query);
    });
  }, [users, showOnlineOnly, onlineUserIds, debouncedSearch]);

  const activeCount = onlineUserIds.has(authUser?._id)
    ? Math.max(onlineUsers.length - 1, 0)
    : onlineUsers.length;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside
      className={`h-full w-full lg:w-80 shrink-0 border-r border-base-300 flex flex-col overflow-hidden transition-all duration-300 bg-base-100/50 backdrop-blur-sm ${className}`}
    >
      <div className="border-b border-base-300 w-full p-4 lg:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <MessageCircle className="size-5 text-primary" />
            </div>
            <h2 className="font-semibold text-lg">Connections</h2>
          </div>

          <div>
            <span className="badge badge-primary">{activeCount} active now</span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Find people..."
              aria-label="Find people"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-sm input-bordered w-full pl-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors duration-200 hover:bg-base-200"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-start gap-2">
            <label className="cursor-pointer flex items-center gap-2 rounded-full px-2 py-1 transition-colors duration-200 bg-base-200 hover:bg-base-300">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="toggle toggle-sm toggle-primary"
              />
              <span className="text-sm">Show active only</span>
            </label>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto overflow-x-hidden w-full py-3 pr-2 flex-1 min-h-0 scrollbar-thin">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <SidebarUserItem
              key={user._id}
              user={user}
              isSelected={selectedUser?._id === user._id}
              isOnline={onlineUserIds.has(user._id)}
              unread={unreadCounts[normalizeId(user._id)] || 0}
              onSelect={setSelectedUser}
            />
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
