"use client";

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { cn } from "~/lib/utils";
import { EmptyState } from "~/components/patterns/empty-state";

/**
 * Line chart per design §4.11 shared rules: horizontal-only dashed grid
 * stroke-border, no axis lines, ticks fill-muted-foreground (caption size),
 * popover-surface tooltip, legend above plot right-aligned. Line colors
 * default to chart tokens (chart-1..5) — pages may override per series.
 */

/** Chart color order per §4.11: orange → purple → blue → green → yellow. */
export const CHART_TOKENS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  padding: "12px",
  color: "var(--foreground)",
};

interface LineChartData {
  name: string;
  [key: string]: string | number;
}

interface LineChartProps {
  data: LineChartData[];
  lines: { key: string; label: string; color?: string; strokeDasharray?: string }[];
  xKey: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  yAxisLabel?: string;
  className?: string;
}

export function LineChart({
  data,
  lines,
  xKey,
  height = 300,
  showLegend = true,
  showGrid = true,
  yAxisLabel,
  className,
}: LineChartProps) {
  if (!data.length) {
    return (
      <EmptyState
        title="No data for this range"
        description="Try changing the time window or filters."
        className={cn("h-64 justify-center", className)}
      />
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 8, right: 10, left: 0, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />}
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            tickCount={5}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft", offset: 10, fill: "var(--muted-foreground)", fontSize: 11 } : undefined}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ fontWeight: 500, color: "var(--foreground)" }}
            itemStyle={{ padding: "4px 0" }}
            cursor={{ stroke: "var(--border)" }}
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
          {lines.map((line, index) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.label}
              stroke={line.color ?? CHART_TOKENS[index % CHART_TOKENS.length]}
              strokeWidth={2}
              strokeDasharray={line.strokeDasharray}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2, fill: line.color ?? CHART_TOKENS[index % CHART_TOKENS.length] }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
