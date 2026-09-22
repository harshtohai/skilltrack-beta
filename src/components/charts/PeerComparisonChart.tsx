"use client";

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { cn } from "~/lib/utils";

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
  color = "#3b82f6",
  showAverage = true,
  averageValue,
}: PeerComparisonChartProps) {
  if (!data.length) {
    return (
      <div className={cn("flex items-center justify-center h-64 text-muted-foreground", className)}>
        <p>No data available</p>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => b.value - a.value);
  const maxValue = Math.max(...sortedData.map((d) => d.value));
  const avg = averageValue ?? (sortedData.reduce((sum, d) => sum + d.value, 0) / sortedData.length);

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={sortedData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            domain={[0, maxValue > 0 ? maxValue * 1.3 : 100]}
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
          <Legend
            wrapperStyle={{ paddingRight: 20 }}
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconSize={10}
            iconType="square"
          />
          <Bar dataKey="value" name={showAverage ? "Institute" : "Value"} radius={[4, 4, 0, 0]}>
            {sortedData.map((entry, index) => (
              <Cell
                key={`${xKey}-${index}`}
                fill={entry.isCurrent ? color : "#d1d5db"}
              />
            ))}
          </Bar>
          {showAverage && (
            <>
              <Bar dataKey="average" name="Average" radius={[4, 4, 0, 0]} fill="#f59e0b" opacity={0.3}>
                {sortedData.map((_, index) => (
                  <Cell key={`avg-${index}`} fill="#f59e0b" opacity={0.3} />
                ))}
              </Bar>
            </>
          )}
        </RechartsBarChart>
      </ResponsiveContainer>
      {showAverage && (
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
            <span>Your Institute</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#f59e0b", opacity: 0.3 }} />
            <span>Peer Average: {avg.toFixed(1)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}