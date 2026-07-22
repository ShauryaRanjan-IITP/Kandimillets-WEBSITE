/**
 * Revenue Trend chart card — async Server Component, full recorded
 * history, never scoped by the Global Date Filter (docs/DASHBOARD.md
 * §5/§6). Same fetch/empty/error contract as MonthlyRevenueCard.
 */
import { getRevenueTrend } from "@/lib/dashboard/chartQueries";
import ChartCard from "./ChartCard";
import EmptyState from "./EmptyState";
import RevenueLineChart from "./charts/RevenueLineChart";
import { ChartLineIcon } from "./icons";

export default async function RevenueTrendCard() {
  const chrome = {
    title: "Revenue Trend",
    description: "Full recorded history — always shows the long-run trend.",
    icon: <ChartLineIcon />,
  };

  let data: Awaited<ReturnType<typeof getRevenueTrend>> | null = null;
  try {
    data = await getRevenueTrend();
  } catch (error) {
    console.error("RevenueTrendCard failed to load:", error);
  }

  if (data === null) {
    return (
      <ChartCard {...chrome}>
        <EmptyState icon={<ChartLineIcon className="h-6 w-6" />} title="Couldn't load this chart" message="Try refreshing the page." />
      </ChartCard>
    );
  }

  if (data.length === 0) {
    return (
      <ChartCard {...chrome}>
        <EmptyState
          icon={<ChartLineIcon className="h-6 w-6" />}
          title="No history yet"
          message="Once sales span more than one month, the long-run trend will appear here."
        />
      </ChartCard>
    );
  }

  return (
    <ChartCard {...chrome}>
      <RevenueLineChart data={data} />
    </ChartCard>
  );
}
