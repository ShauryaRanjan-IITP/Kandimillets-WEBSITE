/**
 * Quick Actions — docs/DASHBOARD.md §10. Add Sale and View Sales Register
 * are real, already-implemented destinations (Sales Register, Phase 2C).
 * The other five are documented as future/not-yet-implemented in
 * docs/DASHBOARD.md §10's table, so they render disabled with a "Coming
 * Soon" tooltip/badge rather than as dead links.
 */
import { PlusIcon } from "./icons";

interface QuickAction {
  label: string;
  href?: string;
  enabled: boolean;
}

const ACTIONS: QuickAction[] = [
  { label: "Add Sale", href: "/admin/sales", enabled: true },
  { label: "View Sales Register", href: "/admin/sales", enabled: true },
  { label: "Retailers", href: "/admin/retailers", enabled: true },
  { label: "Products", href: "/admin/products", enabled: true },
  { label: "Inventory", href: "/admin/inventory", enabled: true },
  { label: "Reports", href: "/admin/reports", enabled: true },
  { label: "Export", enabled: false },
  { label: "Users", enabled: false },
];

interface QuickActionsProps {
  className?: string;
}

export default function QuickActions({ className = "" }: QuickActionsProps) {
  return (
    <section aria-labelledby="dashboard-quick-actions-heading" className={className}>
      <h2 id="dashboard-quick-actions-heading" className="font-heading text-lg font-bold text-brown-900">
        Quick Actions
      </h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {ACTIONS.map((action) =>
          action.enabled ? (
            <a
              key={action.label}
              href={action.href}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-green-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40"
            >
              {action.label === "Add Sale" && <PlusIcon />}
              {action.label}
            </a>
          ) : (
            <button
              key={action.label}
              type="button"
              disabled
              title="Coming Soon"
              aria-disabled="true"
              className="group relative inline-flex items-center gap-2 rounded-xl border border-warm-300 bg-warm-100 px-4 py-2.5 text-sm font-semibold text-brown-400 disabled:cursor-not-allowed"
            >
              {action.label}
              <span className="rounded-full bg-warm-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brown-500">
                Coming Soon
              </span>
            </button>
          )
        )}
      </div>
    </section>
  );
}
