"use client";

import { cn } from "~/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; label: string };
  icon?: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  className,
  variant = "default",
}: MetricCardProps) {
  const trendColor = trend
    ? trend.value > 0
      ? "text-green-600"
      : trend.value < 0
      ? "text-red-600"
      : "text-gray-500"
    : "";

  const trendIcon = trend
    ? trend.value > 0
      ? <TrendingUp className="h-4 w-4" />
      : trend.value < 0
      ? <TrendingDown className="h-4 w-4" />
      : <Minus className="h-4 w-4" />
    : null;

  const variantColors = {
    default: "bg-white border-gray-200",
    success: "bg-green-50 border-green-200",
    warning: "bg-yellow-50 border-yellow-200",
    danger: "bg-red-50 border-red-200",
  };

  return (
    <div className={cn("rounded-xl border p-5 transition-shadow hover:shadow-md", variantColors[variant], className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span className={cn("text-sm font-medium", trendColor)}>
            {trendIcon} {trend.value > 0 ? "+" : ""}{trend.value.toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
}