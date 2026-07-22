/**
 * Top Products chart card — async Server Component, follows the Global
 * Date Filter (docs/DASHBOARD.md §5/§6).
 */
import { getTopProducts } from "@/lib/dashboard/chartQueries";
import type { DashboardDateRange } from "@/lib/dashboard/dateRange";
import ChartCard from "./ChartCard";
import EmptyState from "./EmptyState";
import RankedBarChart from "./charts/RankedBarChart";
import { RankListIcon } from "./icons";

interface TopProductsCardProps {
  range: DashboardDateRange;
}

export default async function TopProductsCard({ range }: TopProductsCardProps) {
  const chrome = {
    title: "Top Products",
    description: "Best-selling products by revenue, for the selected range.",
    icon: <RankListIcon />,
  };

  let data: Awaited<ReturnType<typeof getTopProducts>> | null = null;
  try {
    data = await getTopProducts(range);
  } catch (error) {
    console.error("TopProductsCard failed to load:", error);
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
          title="No products sold in this period"
          message="The best-selling products for the selected range will appear here."
        />
      </ChartCard>
    );
  }

  return (
    <ChartCard {...chrome}>
      <RankedBarChart
        data={data.map((product) => ({ label: product.name, value: product.revenue }))}
        barColor="var(--color-green-600)"
      />
    </ChartCard>
  );
}
