/** Suspense fallback for LowStockWidget — mirrors PendingPaymentsWidgetSkeleton.tsx. */
export default function LowStockWidgetSkeleton() {
  return (
    <div className="premium-card overflow-hidden" aria-busy="true" aria-label="Loading low stock products">
      <div className="border-b border-warm-200 px-5 py-4">
        <div className="h-4 w-32 animate-pulse rounded bg-warm-200" />
        <div className="mt-2 h-3 w-56 animate-pulse rounded bg-warm-100" />
      </div>
      <div className="space-y-3 p-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-warm-100" />
        ))}
      </div>
    </div>
  );
}
