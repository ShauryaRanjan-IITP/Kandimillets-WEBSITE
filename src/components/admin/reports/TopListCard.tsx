/**
 * Generic ranked-list card — reused for all four Top Lists (this task's
 * §5: Top Products, Top Retailers, Highest Revenue Products, Highest
 * Revenue Retailers), the same plain ordered-list presentation already
 * used by ProductTopRetailers.tsx rather than a chart — this task's DO
 * NOT IMPLEMENT list excludes new charts.
 */
import EmptyState from "@/components/admin/dashboard/EmptyState";
import { RankListIcon } from "@/components/admin/dashboard/icons";

interface TopListItem {
  key: string;
  label: string;
  sublabel?: string;
  value: string;
}

interface TopListCardProps {
  title: string;
  description: string;
  items: TopListItem[];
  emptyMessage: string;
}

export default function TopListCard({ title, description, items, emptyMessage }: TopListCardProps) {
  return (
    <div className="premium-card p-5">
      <h3 className="font-heading text-sm font-semibold text-brown-900">{title}</h3>
      <p className="mt-0.5 text-xs text-brown-500">{description}</p>

      {items.length === 0 ? (
        <EmptyState icon={<RankListIcon className="h-6 w-6" />} title="No data" message={emptyMessage} className="px-0 py-6" />
      ) : (
        <ol className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li key={item.key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-warm-100 text-xs font-semibold text-brown-600">
                  {index + 1}
                </span>
                <div>
                  <span className="text-sm font-medium text-brown-800">{item.label}</span>
                  {item.sublabel && <span className="ml-1.5 text-xs text-brown-400">{item.sublabel}</span>}
                </div>
              </div>
              <span className="text-sm font-semibold text-brown-900">{item.value}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
