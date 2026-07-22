/**
 * Top Retailers chart card — async Server Component, follows the Global
 * Date Filter (docs/DASHBOARD.md §5/§6).
 */
import { getTopRetailers } from "@/lib/dashboard/chartQueries";
import type { DashboardDateRange } from "@/lib/dashboard/dateRange";
import ChartCard from "./ChartCard";
import EmptyState from "./EmptyState";
import RankedBarChart from "./charts/RankedBarChart";
import { RankListIcon } from "./icons";

interface TopRetailersCardProps {
  range: DashboardDateRange;
}

export default async function TopRetailersCard({ range }: TopRetailersCardProps) {
  const chrome = {
    title: "Top Retailers",
    description: "Highest-revenue retailers, for the selected range.",
    icon: <RankListIcon />,
  };

  let data: Awaited<ReturnType<typeof getTopRetailers>> | null = null;
  try {
    data = await getTopRetailers(range);
  } catch (error) {
    console.error("TopRetailersCard failed to load:", error);
  }

  if (data === null) {
    return (
      <ChartCard {...chrome}>
        <EmptyState icon={<RankListIcon className="h-6 w-6" />} title="Couldn't load this chart" message="Try refreshing the page." />
      </ChartCard>
    );
  }

  if (data.length === 0) {
    return (
      <ChartCard {...chrome}>
        <EmptyState
          icon={<RankListIcon className="h-6 w-6" />}
          title="No retailers purchased in this period"
          message="The highest-revenue retailers for the selected range will appear here."
        />
      </ChartCard>
    );
  }

  return (
    <ChartCard {...chrome}>
      <RankedBarChart
        data={data.map((retailer) => ({ label: retailer.name, value: retailer.revenue }))}
        barColor="var(--color-brown-500)"
      />
    </ChartCard>
  );
}
