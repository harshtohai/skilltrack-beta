"use client";

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { cn } from "~/lib/utils";
import { EmptyState } from "~/components/patterns/empty-state";

/**
 * Peer-comparison bar chart per design §4.11: current entry filled with the
 * series color, peers in dot-empty grey, dashed peer-average ReferenceLine
 * (fixes the previous zero-height fake Bar). Horizontal-only dashed grid,
 * popover tooltip, legend above right.
 */

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  padding: "12px",
  color: "var(--foreground)",
};

interface PeerData {
  name: string;
  value: number;
  isCurrent: boolean;
}

interface PeerComparisonChartProps {
  data: PeerData[];
  xKey: string;
  height?: number;
  yAxisLabel?: string;
  className?: string;
  color?: string;
  showAverage?: boolean;
  averageValue?: number;
}

export function PeerComparisonChart({
  data,
  xKey,
  height = 300,
  yAxisLabel,
  className,
  color = "var(--chart-3)",
  showAverage = true,
  averageValue,
}: PeerComparisonChartProps) {
  if (!data.length) {
    return (
      <EmptyState
        title="No data for this range"
        description="Try changing the time window or filters."
        className={cn("h-64 justify-center", className)}
      />
    );
  }

  const sortedData = [...data].sort((a, b) => b.value - a.value);
  const maxValue = Math.max(...sortedData.map((d) => d.value));
  const avg = averageValue ?? (sortedData.reduce((sum, d) => sum + d.value, 0) / sortedData.length);

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={sortedData} margin={{ top: 8, right: 10, left: 0, bottom: 5 }} maxBarSize={32}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            tickCount={5}
            domain={[0, maxValue > 0 ? maxValue * 1.3 : 100]}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft", offset: 10, fill: "var(--muted-foreground)", fontSize: 11 } : undefined}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ fontWeight: 500, color: "var(--foreground)" }}
            itemStyle={{ padding: "4px 0" }}
            cursor={{ fill: "var(--muted)", opacity: 0.5 }}
            formatter={(value: unknown) => [typeof value === "number" ? value.toFixed(1) : "0.0", ""]}
          />
          <Legend
            layout="horizontal"
            align="right"
            verticalAlign="top"
            iconSize={8}
            iconType="circle"
            wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)", paddingBottom: 8 }}
          />
          <Bar dataKey="value" name="Institute" radius={[4, 4, 0, 0]}>
            {sortedData.map((entry, index) => (
              <Cell
                key={`${xKey}-${index}`}
                fill={entry.isCurrent ? color : "var(--dot-empty)"}
              />
            ))}
          </Bar>
          {showAverage && (
            <ReferenceLine
              y={avg}
              stroke="var(--muted-foreground)"
              strokeDasharray="3 3"
              label={{
                value: `Peer avg ${avg.toFixed(1)}%`,
                position: "insideTopRight",
                fontSize: 11,
                fill: "var(--muted-foreground)",
              }}
            />
          )}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
