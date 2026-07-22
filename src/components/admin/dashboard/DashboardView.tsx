/**
 * Composes the full Dashboard page — docs/DASHBOARD.md §3. This is the
 * final implementation phase: KPI cards, all 5 charts, Pending Payments,
 * Recent Sales, and Recent Activity are all live; only Quick Actions'
 * five future buttons remain intentionally disabled (docs/DASHBOARD.md
 * §10, this task's explicit scope).
 *
 * Every data-bearing section is its own async Server Component inside its
 * own <Suspense> boundary — a slow or failing widget/chart shows its own
 * skeleton/error state and never blocks or breaks the rest of the page
 * (this task's Error Handling/Performance requirements). This component
 * itself stays a Server Component; the only client-side piece anywhere in
 * this tree is DashboardDateFilterControl, per docs/DASHBOARD.md §15's
 * "minimal client state" principle.
 */
import { Suspense } from "react";
import type { DashboardDateRange } from "@/lib/dashboard/dateRange";
import LogoutButton from "@/components/admin/LogoutButton";
import DashboardHeader from "./DashboardHeader";
import DashboardDateFilterControl from "./DashboardDateFilterControl";
import KPICardsSection from "./KPICardsSection";
import KPICardsSectionSkeleton from "./KPICardsSectionSkeleton";
import ChartsSection from "./ChartsSection";
import PendingPaymentsWidget from "./PendingPaymentsWidget";
import PendingPaymentsWidgetSkeleton from "./PendingPaymentsWidgetSkeleton";
import RecentSalesWidget from "./RecentSalesWidget";
import RecentSalesWidgetSkeleton from "./RecentSalesWidgetSkeleton";
import RecentActivityWidget from "./RecentActivityWidget";
import RecentActivityWidgetSkeleton from "./RecentActivityWidgetSkeleton";
import LowStockWidget from "./LowStockWidget";
import LowStockWidgetSkeleton from "./LowStockWidgetSkeleton";
import QuickActions from "./QuickActions";
import DashboardGrid from "./DashboardGrid";
import type { DashboardDateSelection } from "./types";

interface DashboardViewProps {
  userLabel: string;
  initialSelection: DashboardDateSelection;
  /** True when the URL described an invalid/unparseable date range and
   * the server substituted the default (This Month) — docs/DASHBOARD.md
   * §13's "Invalid date range" case. */
  dateRangeInvalid?: boolean;
  range: DashboardDateRange;
}

export default function DashboardView({
  userLabel,
  initialSelection,
  dateRangeInvalid = false,
  range,
}: DashboardViewProps) {
  // Forces every date-scoped Suspense boundary to show its skeleton again
  // when the Global Date Filter changes, rather than leaving stale
  // numbers/charts visible during the transition.
  const suspenseKey = `${initialSelection.key}-${initialSelection.customFrom}-${initialSelection.customTo}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-warm-200 pb-6">
        <DashboardHeader userLabel={userLabel} />
        <div className="flex flex-wrap items-center gap-3">
          <DashboardDateFilterControl
            key={`filter-${suspenseKey}`}
            initialSelection={initialSelection}
          />
          <LogoutButton />
        </div>
      </header>

      {dateRangeInvalid && (
        <div role="status" className="mt-4 rounded-xl bg-warm-100 px-4 py-3 text-sm text-brown-600">
          The selected date range wasn&apos;t valid — showing <strong>This Month</strong> instead.
        </div>
      )}

      {/* Quick Actions duplicated near the top on mobile only —
          docs/DASHBOARD.md §14. */}
      <QuickActions className="mt-6 lg:hidden" />

      <div className="mt-8">
        <Suspense key={`kpi-${suspenseKey}`} fallback={<KPICardsSectionSkeleton />}>
          <KPICardsSection range={range} />
        </Suspense>
      </div>

      <div className="mt-8">
        <ChartsSection range={range} suspenseKey={suspenseKey} />
      </div>

      <section aria-labelledby="dashboard-widgets-heading" className="mt-8">
        <h2 id="dashboard-widgets-heading" className="sr-only">
          Pending payments and recent activity
        </h2>
        <DashboardGrid variant="widgets">
          <Suspense fallback={<PendingPaymentsWidgetSkeleton />}>
            <PendingPaymentsWidget />
          </Suspense>
          <Suspense fallback={<RecentSalesWidgetSkeleton />}>
            <RecentSalesWidget />
          </Suspense>
        </DashboardGrid>
        <div className="mt-6">
          <Suspense fallback={<RecentActivityWidgetSkeleton />}>
            <RecentActivityWidget />
          </Suspense>
        </div>
        <div className="mt-6">
          <Suspense fallback={<LowStockWidgetSkeleton />}>
            <LowStockWidget />
          </Suspense>
        </div>
      </section>

      <div className="mt-8">
        <QuickActions />
      </div>
    </div>
  );
}
