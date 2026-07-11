import { useAuthStore } from "../store/useAuthStore";
import { WifiOff } from "lucide-react";

const ConnectionBanner = () => {
  const { socket, isSocketConnected, authUser } = useAuthStore();

  if (!authUser || !socket || isSocketConnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 border-b border-warning/30 bg-warning/10 px-4 py-2 text-sm text-warning-content"
    >
      <WifiOff className="size-4 shrink-0" aria-hidden="true" />
      <span>Reconnecting to live updates…</span>
    </div>
  );
};

export default ConnectionBanner;
