/** Suspense fallback for RecentActivityWidget — docs/DASHBOARD.md §12. */
export default function RecentActivityWidgetSkeleton() {
  return (
    <div className="premium-card p-5" aria-busy="true" aria-label="Loading recent activity">
      <div className="h-4 w-36 animate-pulse rounded bg-warm-200" />
      <div className="mt-2 h-3 w-64 animate-pulse rounded bg-warm-100" />
      <div className="mt-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-6 w-6 shrink-0 animate-pulse rounded-full bg-warm-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 animate-pulse rounded bg-warm-200" />
              <div className="h-2.5 w-1/3 animate-pulse rounded bg-warm-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
