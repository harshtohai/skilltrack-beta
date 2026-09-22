"use client";

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { cn } from "~/lib/utils";

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
  colors = { actual: "#3b82f6", expected: "#94a3b8" },
}: ComparisonChartProps) {
  if (!data.length) {
    return (
      <div className={cn("flex items-center justify-center h-64 text-muted-foreground", className)}>
        <p>No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.flatMap((d) => [d.actual, d.expected]));

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 5, right: showLegend ? 120 : 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            domain={[0, maxValue > 0 ? maxValue * 1.2 : 100]}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft", offset: 10, fill: "#6b7280", fontSize: 11 } : undefined}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              padding: "12px",
            }}
            labelStyle={{ fontWeight: 600, color: "#111827" }}
            itemStyle={{ padding: "4px 0" }}
            formatter={(value: unknown) => [typeof value === "number" ? value.toFixed(1) : "0.0", ""]}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingRight: 20 }}
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconSize={10}
              iconType="square"
            />
          )}
          <Bar dataKey="actual" name="Actual" radius={[4, 4, 0, 0]} fill={colors.actual}>
            {data.map((_, index) => (
              <Cell key={`actual-${index}`} fill={colors.actual} />
            ))}
          </Bar>
          <Bar dataKey="expected" name="Expected" radius={[4, 4, 0, 0]} fill={colors.expected}>
            {data.map((_, index) => (
              <Cell key={`expected-${index}`} fill={colors.expected} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}