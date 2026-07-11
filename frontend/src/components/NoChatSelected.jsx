import { MessageSquare } from "lucide-react";
import EmptyState from "./ui/EmptyState";

const NoChatSelected = ({ className = "" }) => (
  <div
    className={`flex w-full flex-1 flex-col items-center justify-center bg-base-100/50 p-16 ${className}`}
  >
    <div className="max-w-md space-y-6 text-center">
      <div className="mb-4 flex justify-center">
        <div className="flex size-16 animate-ease-out-float items-center justify-center rounded-2xl bg-primary/10">
          <MessageSquare className="size-8 text-primary" />
        </div>
      </div>
      <EmptyState
        title="Welcome to Murmur!"
        description="Select a contact to start a conversation"
      />
    </div>
  </div>
);

export default NoChatSelected;
