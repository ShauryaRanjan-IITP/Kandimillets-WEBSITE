"use client";

/**
 * Revenue Trend — full-history line chart (docs/DASHBOARD.md §5). Pure
 * rendering only, same contract as RevenueBarChart.
 */
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { monthName } from "@/components/admin/sales/dateFilterUtils";
import { AXIS_TICK_STYLE, GRID_STROKE, TOOLTIP_CONTENT_STYLE, TOOLTIP_LABEL_STYLE } from "./chartTheme";
import type { MonthlyRevenuePoint } from "@/lib/dashboard/chartQueries";

const rupee = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

interface RevenueLineChartProps {
  data: MonthlyRevenuePoint[];
}

export default function RevenueLineChart({ data }: RevenueLineChartProps) {
  const chartData = data.map((point) => ({
    label: `${monthName(point.month).slice(0, 3)} ${String(point.year).slice(2)}`,
    total: point.total,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK_STYLE} axisLine={{ stroke: GRID_STROKE }} tickLine={false} minTickGap={16} />
        <YAxis
          tick={AXIS_TICK_STYLE}
          axisLine={false}
          tickLine={false}
          width={48}
          tickFormatter={(value: number) => `₹${rupee.format(value)}`}
        />
        <Tooltip
          contentStyle={TOOLTIP_CONTENT_STYLE}
          labelStyle={TOOLTIP_LABEL_STYLE}
          formatter={(value) => [`₹${rupee.format(Number(value))}`, "Revenue"]}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="var(--color-green-600)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "var(--color-green-600)" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
