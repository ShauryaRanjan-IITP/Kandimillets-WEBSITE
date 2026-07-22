/**
 * The 8 KPI cards — docs/DASHBOARD.md §4. Phase 3C: live data. An async
 * Server Component that calls the Phase 3A query functions in
 * src/lib/dashboard/kpiQueries.ts exactly as implemented — no aggregation
 * logic is duplicated here, only formatting/presentation.
 *
 * Rendered inside a <Suspense> boundary (see src/app/admin/dashboard/page.tsx)
 * so changing the Global Date Filter shows KPICardsSectionSkeleton while
 * this component re-fetches, rather than flashing stale or incorrect
 * values (docs/DASHBOARD.md §12).
 */
import {
  getActiveRetailersCount,
  getCancelledSalesCount,
  getOutstandingAmount,
  getPendingPaymentsCount,
  getProductsSoldCount,
  getRevenueForRange,
  getSalesCount,
  getTodaysRevenue,
} from "@/lib/dashboard/kpiQueries";
import type { DashboardDateRange } from "@/lib/dashboard/dateRange";
import DashboardGrid from "./DashboardGrid";
import KPICard from "./KPICard";
import EmptyState from "./EmptyState";
import { DASHBOARD_DATE_RANGE_OPTIONS } from "./types";
import {
  BoxIcon,
  CalendarIcon,
  ClockAlertIcon,
  ReceiptIcon,
  RevenueIcon,
  StoreIcon,
  WalletIcon,
  XCircleIcon,
} from "./icons";

const rupee = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

function formatCurrency(value: number): string {
  return `₹${rupee.format(value)}`;
}

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function rangeLabel(range: DashboardDateRange): string {
  return DASHBOARD_DATE_RANGE_OPTIONS.find((o) => o.key === range.key)?.label ?? "selected range";
}

interface KPICardsSectionProps {
  range: DashboardDateRange;
}

export default async function KPICardsSection({ range }: KPICardsSectionProps) {
  let kpis: {
    todaysRevenue: { total: number; count: number };
    revenueForRange: { total: number; count: number };
    outstanding: { total: number };
    pending: { count: number; overdueCount: number };
    retailers: number;
    products: number;
    salesCount: number;
    cancelledCount: number;
  } | null = null;
  let failed = false;

  try {
    const [todaysRevenue, revenueForRange, outstanding, pending, retailers, products, salesCount, cancelledCount] =
      await Promise.all([
        getTodaysRevenue(),
        getRevenueForRange(range),
        getOutstandingAmount(),
        getPendingPaymentsCount(),
        getActiveRetailersCount(range),
        getProductsSoldCount(range),
        getSalesCount(range),
        getCancelledSalesCount(range),
      ]);
    kpis = { todaysRevenue, revenueForRange, outstanding, pending, retailers, products, salesCount, cancelledCount };
  } catch (error) {
    // Database unavailable / unexpected query failure — logged
    // server-side only, per docs/DASHBOARD.md §13 / docs/API.md §4.
    console.error("KPICardsSection failed to load dashboard KPIs:", error);
    failed = true;
  }

  if (failed || !kpis) {
    return (
      <section aria-labelledby="dashboard-kpi-heading">
        <h2 id="dashboard-kpi-heading" className="sr-only">
          Key business metrics
        </h2>
        <div className="premium-card">
          <EmptyState
            icon={<WalletIcon className="h-6 w-6" />}
            title="Couldn't load business metrics"
            message="Something went wrong while loading the dashboard's numbers. Try refreshing the page — if this keeps happening, the database may be temporarily unavailable."
          />
        </div>
      </section>
    );
  }

  const label = rangeLabel(range);

  const cards = [
    {
      title: "Today's Revenue",
      value: formatCurrency(kpis.todaysRevenue.total),
      subtitle: plural(kpis.todaysRevenue.count, "sale") + " today",
      icon: <RevenueIcon />,
    },
    {
      title: "This Month Revenue",
      value: formatCurrency(kpis.revenueForRange.total),
      subtitle: plural(kpis.revenueForRange.count, "sale") + `, ${label.toLowerCase()}`,
      icon: <CalendarIcon />,
    },
    {
      title: "Outstanding Amount",
      value: formatCurrency(kpis.outstanding.total),
      subtitle: kpis.outstanding.total === 0 ? "Nothing outstanding" : "Owed right now, across all time",
      icon: <WalletIcon />,
    },
    {
      title: "Pending Payments",
      value: String(kpis.pending.count),
      subtitle:
        kpis.pending.count === 0
          ? "Nothing to chase today"
          : kpis.pending.overdueCount === 0
            ? "None overdue"
            : `${plural(kpis.pending.overdueCount, "invoice")} overdue`,
      icon: <ClockAlertIcon />,
    },
    {
      title: "Retailers",
      value: String(kpis.retailers),
      subtitle: `Active, ${label.toLowerCase()}`,
      icon: <StoreIcon />,
    },
    {
      title: "Products Sold",
      value: String(kpis.products),
      subtitle: `Distinct, ${label.toLowerCase()}`,
      icon: <BoxIcon />,
    },
    {
      title: "Sales This Month",
      value: String(kpis.salesCount),
      subtitle: `Transactions, ${label.toLowerCase()}`,
      icon: <ReceiptIcon />,
    },
    {
      title: "Cancelled Sales",
      value: String(kpis.cancelledCount),
      subtitle: kpis.cancelledCount === 0 ? `Clean, ${label.toLowerCase()}` : `${label}`,
      icon: <XCircleIcon />,
    },
  ];

  return (
    <section aria-labelledby="dashboard-kpi-heading">
      <h2 id="dashboard-kpi-heading" className="sr-only">
        Key business metrics
      </h2>
      <DashboardGrid variant="kpi">
        {cards.map((card) => (
          <KPICard key={card.title} title={card.title} value={card.value} subtitle={card.subtitle} icon={card.icon} />
        ))}
      </DashboardGrid>
    </section>
  );
}
