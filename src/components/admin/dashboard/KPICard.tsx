/**
 * A single KPI tile — docs/DASHBOARD.md §4. Phase 3B: presentational only,
 * `value`/`subtitle` are placeholder strings, never a live query result.
 */

interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  loading?: boolean;
}

export default function KPICard({ title, value, subtitle, icon, loading = false }: KPICardProps) {
  if (loading) {
    return (
      <div className="premium-card p-4" aria-busy="true" aria-label={`Loading ${title}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-8 rounded-lg bg-warm-200" />
          <div className="h-3 w-3/4 rounded bg-warm-200" />
          <div className="h-5 w-1/2 rounded bg-warm-200" />
        </div>
      </div>
    );
  }

  return (
    <div
      tabIndex={0}
      className="premium-card group p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 transition-colors duration-200 group-hover:bg-green-100">
        {icon}
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-brown-500">{title}</p>
      <p className="mt-1 font-heading text-xl font-bold text-brown-900">{value}</p>
      <p className="mt-0.5 text-xs text-brown-400">{subtitle}</p>
    </div>
  );
}
