/**
 * Chart card chrome — docs/DASHBOARD.md §5. Presentational only: title,
 * description, icon, and a reserved area rendering whatever `children` is
 * (the live chart, an error state, or an empty state) — the async chart
 * components (MonthlyRevenueCard, etc.) decide which.
 */

interface ChartCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export default function ChartCard({ title, description, icon, children }: ChartCardProps) {
  return (
    <div className="premium-card p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-100 text-brown-700">
          {icon}
        </div>
        <div>
          <h3 className="font-heading text-sm font-semibold text-brown-900">{title}</h3>
          <p className="mt-0.5 text-xs text-brown-500">{description}</p>
        </div>
      </div>

      <div className="mt-4 h-64">{children}</div>
    </div>
  );
}
