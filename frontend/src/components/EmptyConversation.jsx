import { MessageCircle } from "lucide-react";
import EmptyState from "./ui/EmptyState";

const EmptyConversation = ({ fullName }) => (
  <EmptyState
    icon={MessageCircle}
    title="Start a new conversation"
    description={`Be the first to message ${fullName}`}
    className="py-20 text-base-content/50"
  />
);

export default EmptyConversation;
