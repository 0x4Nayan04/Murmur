import UserAvatar from "./UserAvatar";
import OnlineStatus from "./OnlineStatus";

const formatUnreadCount = (count) => (count > 99 ? "99+" : String(count));

const SidebarUserItem = ({ user, isSelected, isOnline, unread, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(user)}
    className={
      isSelected
        ? "w-[calc(100%_-_1rem)] p-3 flex flex-row items-center gap-3 mb-1 mx-2 rounded-xl border bg-primary/10 border-primary/20 transition-colors duration-200 hover:bg-primary/15 hover:border-primary/25"
        : "w-[calc(100%_-_1rem)] p-3 flex flex-row items-center gap-3 mb-1 mx-2 rounded-xl border border-transparent transition-colors duration-200 hover:bg-base-200"
    }
    aria-current={isSelected ? "true" : undefined}
    aria-label={
      unread > 0 ? `${user.fullName}, ${unread} unread` : user.fullName
    }
  >
    <UserAvatar
      profilePic={user.profilePic}
      size="lg"
      showOnlineDot={isOnline}
    />
    <div className="flex text-left min-w-0 flex-1 items-center gap-2">
      <div className="min-w-0 flex-1">
        <div className="font-medium truncate">{user.fullName}</div>
        <OnlineStatus isOnline={isOnline} className="text-sm" />
      </div>
      {unread > 0 && (
        <span className="badge badge-primary badge-sm shrink-0">
          {formatUnreadCount(unread)}
        </span>
      )}
    </div>
  </button>
);

export default SidebarUserItem;
