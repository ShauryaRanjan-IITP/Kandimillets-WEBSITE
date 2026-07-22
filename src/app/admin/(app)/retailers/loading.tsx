/**
 * Next.js file-based loading UI for the /admin/retailers segment — shown
 * automatically during server-side navigation/data fetching for this
 * route (search, sort, pagination), satisfying this task's explicit
 * "Loading state" requirement without any client-side spinner logic.
 */
function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-warm-200 ${className}`} />;
}

export default function RetailersLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading retailers">
      <div className="border-b border-warm-200 pb-6">
        <SkeletonBlock className="h-7 w-40" />
        <SkeletonBlock className="mt-2 h-4 w-72" />
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <SkeletonBlock className="h-10 w-full max-w-sm" />
          <SkeletonBlock className="h-10 w-36" />
        </div>
        <div className="premium-card space-y-3 p-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-10" />
          ))}
        </div>
      </div>
    </div>
  );
}
