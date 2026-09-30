"use client";

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { cn } from "~/lib/utils";
import { EmptyState } from "~/components/patterns/empty-state";

/**
 * Grouped actual-vs-expected bar chart per design §4.11: bars radius [4,4,0,0],
 * width ≤ 32px, horizontal-only dashed grid, popover tooltip, legend above
 * right. Colors default to tokens — actual = chart-1 (orange, primary series),
 * expected = chart-2 (purple, secondary).
 */

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  padding: "12px",
  color: "var(--foreground)",
};

interface ComparisonData {
  name: string;
  actual: number;
  expected: number;
}

interface ComparisonChartProps {
  data: ComparisonData[];
  xKey: string;
  height?: number;
  showLegend?: boolean;
  yAxisLabel?: string;
  className?: string;
  colors?: { actual: string; expected: string };
}

export function ComparisonChart({
  data,
  xKey,
  height = 300,
  showLegend = true,
  yAxisLabel,
  className,
  colors = { actual: "var(--chart-1)", expected: "var(--chart-2)" },
}: ComparisonChartProps) {
  if (!data.length) {
    return (
      <EmptyState
        title="No data for this range"
        description="Try changing the time window or filters."
        className={cn("h-64 justify-center", className)}
      />
    );
  }

  const maxValue = Math.max(...data.flatMap((d) => [d.actual, d.expected]));

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 8, right: 10, left: 0, bottom: 5 }} barCategoryGap="25%" maxBarSize={32}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            tickCount={5}
            domain={[0, maxValue > 0 ? maxValue * 1.2 : 100]}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft", offset: 10, fill: "var(--muted-foreground)", fontSize: 11 } : undefined}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ fontWeight: 500, color: "var(--foreground)" }}
            itemStyle={{ padding: "4px 0" }}
            cursor={{ fill: "var(--muted)", opacity: 0.5 }}
            formatter={(value: unknown) => [typeof value === "number" ? value.toFixed(1) : "0.0", ""]}
          />
          {showLegend && (
            <Legend
              layout="horizontal"
              align="right"
              verticalAlign="top"
              iconSize={8}
              iconType="circle"
              wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)", paddingBottom: 8 }}
            />
          )}
          <Bar dataKey="actual" name="Actual" radius={[4, 4, 0, 0]} fill={colors.actual} />
          <Bar dataKey="expected" name="Expected" radius={[4, 4, 0, 0]} fill={colors.expected} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
