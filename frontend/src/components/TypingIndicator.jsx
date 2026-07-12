import UserAvatar from "./UserAvatar";

const TypingIndicator = ({ selectedUser }) => (
  <div
    className="flex justify-start mt-2"
    role="status"
    aria-live="polite"
    aria-label={`${selectedUser.fullName} is typing`}
    data-typing-indicator="true"
  >
    <div className="flex items-end gap-2">
      <UserAvatar
        profilePic={selectedUser.profilePic}
        alt=""
        size="sm"
        className="pb-0.5 border border-base-300 overflow-hidden rounded-full"
        imageClassName="shadow-none"
      />
      <div className="bg-base-200 rounded-2xl rounded-br-md px-3 py-2 flex items-center gap-1.5">
        <span className="w-2 h-2 bg-base-content/40 rounded-full animate-ease-out-dot" />
        <span
          className="w-2 h-2 bg-base-content/40 rounded-full animate-ease-out-dot"
          style={{ animationDelay: "0.2s" }}
        />
        <span
          className="w-2 h-2 bg-base-content/40 rounded-full animate-ease-out-dot"
          style={{ animationDelay: "0.4s" }}
        />
      </div>
    </div>
  </div>
);

export default TypingIndicator;
