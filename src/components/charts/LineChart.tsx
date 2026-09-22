"use client";

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { cn } from "~/lib/utils";

interface LineChartData {
  name: string;
  [key: string]: string | number;
}

interface LineChartProps {
  data: LineChartData[];
  lines: { key: string; label: string; color: string; strokeDasharray?: string }[];
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
      <div className={cn("flex items-center justify-center h-64 text-muted-foreground", className)}>
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 5, right: showLegend ? 120 : 10, left: 0, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />}
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
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
              iconType="line"
            />
          )}
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.label}
              stroke={line.color}
              strokeWidth={2}
              strokeDasharray={line.strokeDasharray}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}