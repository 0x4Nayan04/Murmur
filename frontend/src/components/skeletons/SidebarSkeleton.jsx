import { MessageCircle } from "lucide-react";

const SidebarSkeleton = () => {
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside className="flex h-full w-full shrink-0 flex-col overflow-hidden border-r border-base-300 bg-base-100/50 backdrop-blur-sm transition-all duration-300 lg:w-80">
      <div className="w-full border-b border-base-300 p-4 lg:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <MessageCircle className="size-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Connections</h2>
          </div>
          <div className="skeleton h-5 w-24 rounded-full" />
        </div>

        <div className="mt-4 space-y-2">
          <div className="skeleton h-8 w-full rounded-lg" />
          <div className="skeleton h-7 w-36 rounded-full" />
        </div>
      </div>

      <div className="min-h-0 w-full flex-1 overflow-y-auto py-3 pr-2">
        {skeletonContacts.map((_, idx) => (
          <div key={idx} className="flex w-full items-center gap-3 p-3">
            <div className="skeleton mx-auto size-12 shrink-0 rounded-full lg:mx-0" />
            <div className="hidden min-w-0 flex-1 lg:block">
              <div className="skeleton mb-2 h-4 w-32" />
              <div className="skeleton h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
