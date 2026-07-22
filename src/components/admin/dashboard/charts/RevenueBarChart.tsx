"use client";

/**
 * Monthly Revenue — vertical bar chart (docs/DASHBOARD.md §5). Pure
 * rendering: the parent (MonthlyRevenueCard, a Server Component) fetches
 * the data via src/lib/dashboard/chartQueries.ts and passes it in as a
 * plain-JSON prop — this component only knows how to draw it.
 */
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { monthName } from "@/components/admin/sales/dateFilterUtils";
import { AXIS_TICK_STYLE, GRID_STROKE, TOOLTIP_CONTENT_STYLE, TOOLTIP_LABEL_STYLE } from "./chartTheme";
import type { MonthlyRevenuePoint } from "@/lib/dashboard/chartQueries";

const rupee = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

interface RevenueBarChartProps {
  data: MonthlyRevenuePoint[];
}

export default function RevenueBarChart({ data }: RevenueBarChartProps) {
  const chartData = data.map((point) => ({
    label: monthName(point.month).slice(0, 3),
    total: point.total,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK_STYLE} axisLine={{ stroke: GRID_STROKE }} tickLine={false} />
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
        <Bar dataKey="total" fill="var(--color-green-600)" radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
