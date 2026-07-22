/**
 * Next.js file-based loading UI for the /admin/reports segment — shown
 * automatically during server-side navigation/data fetching for this
 * route (filters, sort, pagination), satisfying this task's implicit
 * loading-state expectation (consistent with every other admin list page
 * in this project) without any client-side spinner logic.
 */
function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-warm-200 ${className}`} />;
}

export default function ReportsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading reports">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-warm-200 pb-6">
        <div>
          <SkeletonBlock className="h-7 w-40" />
          <SkeletonBlock className="mt-2 h-4 w-72" />
        </div>
        <SkeletonBlock className="h-10 w-36" />
      </div>

      <div className="mt-6">
        <SkeletonBlock className="h-24 w-full" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-24" />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-48" />
        ))}
      </div>

      <div className="mt-8 space-y-4">
        <SkeletonBlock className="h-6 w-32" />
        <div className="premium-card space-y-3 p-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-10" />
          ))}
        </div>
      </div>
    </div>
  );
}
