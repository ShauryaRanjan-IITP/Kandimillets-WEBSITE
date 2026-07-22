/**
 * The 5 dashboard charts — docs/DASHBOARD.md §5. Layout/composition only:
 * each chart is its own async Server Component (Monthly Revenue, Revenue
 * Trend, Payment Status, Top Products, Top Retailers), each inside its
 * own <Suspense> boundary so a slow or failing chart never blocks or
 * breaks its siblings (this task's Error Handling/Performance
 * requirements).
 */
import { Suspense } from "react";
import type { DashboardDateRange } from "@/lib/dashboard/dateRange";
import DashboardGrid from "./DashboardGrid";
import ChartCardSkeleton from "./ChartCardSkeleton";
import MonthlyRevenueCard from "./MonthlyRevenueCard";
import RevenueTrendCard from "./RevenueTrendCard";
import PaymentStatusCard from "./PaymentStatusCard";
import TopProductsCard from "./TopProductsCard";
import TopRetailersCard from "./TopRetailersCard";
import { ChartBarIcon, ChartLineIcon, ChartPieIcon, RankListIcon } from "./icons";

interface ChartsSectionProps {
  range: DashboardDateRange;
  /** Forces each date-scoped chart's Suspense boundary to show its
   * skeleton again when the Global Date Filter changes, rather than
   * leaving a stale chart visible during the transition — same technique
   * used for the KPI cards (see DashboardView.tsx). */
  suspenseKey: string;
}

export default function ChartsSection({ range, suspenseKey }: ChartsSectionProps) {
  return (
    <section aria-labelledby="dashboard-charts-heading">
      <h2 id="dashboard-charts-heading" className="font-heading text-lg font-bold text-brown-900">
        Charts
      </h2>
      <div className="mt-4">
        <DashboardGrid variant="charts">
          <Suspense
            fallback={
              <ChartCardSkeleton title="Monthly Revenue" description="This year's revenue, month by month." icon={<ChartBarIcon />} />
            }
          >
            <MonthlyRevenueCard />
          </Suspense>

          <Suspense
            fallback={
              <ChartCardSkeleton
                title="Payment Status Distribution"
                description="Paid vs. pending vs. partial vs. cancelled, for the selected range."
                icon={<ChartPieIcon />}
              />
            }
            key={`status-${suspenseKey}`}
          >
            <PaymentStatusCard range={range} />
          </Suspense>

          <Suspense
            fallback={
              <ChartCardSkeleton title="Top Products" description="Best-selling products by revenue, for the selected range." icon={<RankListIcon />} />
            }
            key={`products-${suspenseKey}`}
          >
            <TopProductsCard range={range} />
          </Suspense>

          <Suspense
            fallback={
              <ChartCardSkeleton title="Top Retailers" description="Highest-revenue retailers, for the selected range." icon={<RankListIcon />} />
            }
            key={`retailers-${suspenseKey}`}
          >
            <TopRetailersCard range={range} />
          </Suspense>

          <Suspense
            fallback={
              <ChartCardSkeleton title="Revenue Trend" description="Full recorded history — always shows the long-run trend." icon={<ChartLineIcon />} />
            }
          >
            <RevenueTrendCard />
          </Suspense>
        </DashboardGrid>
      </div>
    </section>
  );
}
