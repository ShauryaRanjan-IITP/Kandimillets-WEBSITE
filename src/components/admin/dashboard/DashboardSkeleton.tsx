/**
 * Full-page skeleton — docs/DASHBOARD.md §12 ("skeletons, not spinners,
 * for the initial page load"). Not wired to a Suspense boundary yet (no
 * async data exists in Phase 3B) — reserved for the streaming-per-widget
 * loading strategy §12 describes, once real queries land.
 */

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-warm-200 ${className}`} />;
}

export default function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading dashboard">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <SkeletonBlock className="h-7 w-48" />
          <SkeletonBlock className="h-4 w-64" />
        </div>
        <SkeletonBlock className="h-10 w-40" />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-24" />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-64" />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-72" />
        ))}
      </div>
    </div>
  );
}
