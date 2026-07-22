/**
 * Payment Status Distribution chart card — async Server Component,
 * follows the Global Date Filter (docs/DASHBOARD.md §5/§6).
 */
import { getPaymentStatusDistribution } from "@/lib/dashboard/chartQueries";
import type { DashboardDateRange } from "@/lib/dashboard/dateRange";
import ChartCard from "./ChartCard";
import EmptyState from "./EmptyState";
import StatusDonutChart from "./charts/StatusDonutChart";
import { ChartPieIcon } from "./icons";

interface PaymentStatusCardProps {
  range: DashboardDateRange;
}

export default async function PaymentStatusCard({ range }: PaymentStatusCardProps) {
  const chrome = {
    title: "Payment Status Distribution",
    description: "Paid vs. pending vs. partial vs. cancelled, for the selected range.",
    icon: <ChartPieIcon />,
  };

  let data: Awaited<ReturnType<typeof getPaymentStatusDistribution>> | null = null;
  try {
    data = await getPaymentStatusDistribution(range);
  } catch (error) {
    console.error("PaymentStatusCard failed to load:", error);
  }

  if (data === null) {
    return (
      <ChartCard {...chrome}>
        <EmptyState icon={<ChartPieIcon className="h-6 w-6" />} title="Couldn't load this chart" message="Try refreshing the page." />
      </ChartCard>
    );
  }

  const totalCount = data.reduce((sum, point) => sum + point.count, 0);
  if (totalCount === 0) {
    return (
      <ChartCard {...chrome}>
        <EmptyState
          icon={<ChartPieIcon className="h-6 w-6" />}
          title="No sales in this period"
          message="Payment status breakdown will appear once sales exist for the selected range."
        />
      </ChartCard>
    );
  }

  return (
    <ChartCard {...chrome}>
      <StatusDonutChart data={data} />
    </ChartCard>
  );
}
