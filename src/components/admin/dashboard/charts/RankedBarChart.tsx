"use client";

/**
 * Horizontal ranked bar list — reused for both Top Products and Top
 * Retailers (docs/DASHBOARD.md §5), since both are structurally the same
 * "name + ₹ revenue, ranked" shape. `barColor` lets the two callers use a
 * subtly different accent without forking the component.
 */
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_TICK_STYLE, TOOLTIP_CONTENT_STYLE } from "./chartTheme";

const rupee = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export interface RankedBarChartItem {
  label: string;
  value: number;
  secondary?: string;
}

interface RankedBarChartProps {
  data: RankedBarChartItem[];
  barColor: string;
}

export default function RankedBarChart({ data, barColor }: RankedBarChartProps) {
  // Recharts draws top-to-bottom in array order — reverse so the highest
  // value renders at the top, matching a "#1 first" reading order.
  const chartData = [...data].reverse();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
        barCategoryGap="20%"
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          tick={AXIS_TICK_STYLE}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip
          contentStyle={TOOLTIP_CONTENT_STYLE}
          formatter={(value) => [`₹${rupee.format(Number(value))}`, "Revenue"]}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
          {chartData.map((entry) => (
            <Cell key={entry.label} fill={barColor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
