import { Circle } from "lucide-react";

const OnlineStatus = ({ isOnline, className = "" }) => (
  <div className={`flex items-center gap-1 ${className}`}>
    {isOnline ? (
      <>
        <Circle className="size-2 fill-green-500 text-green-500" />
        <span className="text-green-600">Online</span>
      </>
    ) : (
      <span className="text-base-content/50">Offline</span>
    )}
  </div>
);

export default OnlineStatus;
