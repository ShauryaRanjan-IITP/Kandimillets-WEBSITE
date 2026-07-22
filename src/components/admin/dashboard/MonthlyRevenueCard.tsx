/**
 * Monthly Revenue chart card — async Server Component. Fetches via
 * src/lib/dashboard/chartQueries.ts (Phase 3A, unmodified) and renders
 * either the live chart, an empty state, or a friendly error state — a
 * failure here never breaks the rest of the dashboard (see
 * docs/DASHBOARD.md §13, this task's Error Handling requirement).
 */
import { getMonthlyRevenue } from "@/lib/dashboard/chartQueries";
import ChartCard from "./ChartCard";
import EmptyState from "./EmptyState";
import RevenueBarChart from "./charts/RevenueBarChart";
import { ChartBarIcon } from "./icons";

export default async function MonthlyRevenueCard() {
  const chrome = {
    title: "Monthly Revenue",
    description: "This year's revenue, month by month.",
    icon: <ChartBarIcon />,
  };

  let data: Awaited<ReturnType<typeof getMonthlyRevenue>> | null = null;
  try {
    data = await getMonthlyRevenue();
  } catch (error) {
    console.error("MonthlyRevenueCard failed to load:", error);
  }

  if (data === null) {
    return (
      <ChartCard {...chrome}>
        <EmptyState icon={<ChartBarIcon className="h-6 w-6" />} title="Couldn't load this chart" message="Try refreshing the page." />
      </ChartCard>
    );
  }

  const hasRevenue = data.some((point) => point.total > 0);
  if (!hasRevenue) {
    return (
      <ChartCard {...chrome}>
        <EmptyState
          icon={<ChartBarIcon className="h-6 w-6" />}
          title="No revenue yet this year"
          message="Once sales are recorded, this year's monthly revenue will appear here."
        />
      </ChartCard>
    );
  }

  return (
    <ChartCard {...chrome}>
      <RevenueBarChart data={data} />
    </ChartCard>
  );
}
