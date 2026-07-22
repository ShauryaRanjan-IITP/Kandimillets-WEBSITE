"use client";

/**
 * Payment Status Distribution — donut chart (docs/DASHBOARD.md §5). Pure
 * rendering only. Colors match PaymentStatusBadge.tsx exactly (see
 * ./chartTheme.ts) so the chart and the Sales Register's status pills
 * read as the same visual language.
 */
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { STATUS_COLORS, STATUS_LABELS, TOOLTIP_CONTENT_STYLE } from "./chartTheme";
import type { PaymentStatusDistributionPoint } from "@/lib/dashboard/chartQueries";

const rupee = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

interface StatusDonutChartProps {
  data: PaymentStatusDistributionPoint[];
}

export default function StatusDonutChart({ data }: StatusDonutChartProps) {
  const chartData = data.map((point) => ({
    name: STATUS_LABELS[point.status],
    status: point.status,
    count: point.count,
    amount: point.amount,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="name"
          innerRadius="55%"
          outerRadius="85%"
          paddingAngle={2}
          stroke="none"
        >
          {chartData.map((entry) => (
            <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={TOOLTIP_CONTENT_STYLE}
          formatter={(value, _name, item) => {
            const count = Number(value);
            const payload = item?.payload as { amount?: number; name?: string } | undefined;
            const amount = payload?.amount ?? 0;
            return [`${count} sale${count === 1 ? "" : "s"} · ₹${rupee.format(amount)}`, payload?.name ?? ""];
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={32}
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => <span className="text-xs text-brown-600">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
