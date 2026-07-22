/**
 * Suspense fallback for each chart card — docs/DASHBOARD.md §12. Shown
 * while that specific chart's data query resolves; siblings are
 * unaffected (each chart has its own Suspense boundary — see
 * ChartsSection.tsx).
 */

interface ChartCardSkeletonProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function ChartCardSkeleton({ title, description, icon }: ChartCardSkeletonProps) {
  return (
    <div className="premium-card p-5" aria-busy="true" aria-label={`Loading ${title} chart`}>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-100 text-brown-700">
          {icon}
        </div>
        <div>
          <h3 className="font-heading text-sm font-semibold text-brown-900">{title}</h3>
          <p className="mt-0.5 text-xs text-brown-500">{description}</p>
        </div>
      </div>

      <div className="mt-4 flex h-64 items-end gap-2 rounded-xl border border-dashed border-warm-300 bg-warm-50 p-4">
        {[40, 65, 50, 80, 35, 60, 45].map((h, i) => (
          <div key={i} className="flex-1 animate-pulse rounded-t-md bg-warm-200" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}
