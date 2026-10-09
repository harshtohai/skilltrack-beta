"use client";

import { cn } from "~/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { percent } from "~/lib/format";

/**
 * Metric card per design §4.4/§4.11: tokenized surfaces + status variants,
 * stat-type value, delta per CL-13 (sign + 2 decimals). The StatCard pattern
 * (with DotSparkline) supersedes this in re-skinned pages; kept tokenized for
 * pages not yet migrated.
 */

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
  const trendIsUp = (trend?.value ?? 0) > 0;
  const trendIsDown = (trend?.value ?? 0) < 0;
  const trendColor = !trend
    ? ""
    : trendIsUp
      ? "text-success-text"
      : trendIsDown
        ? "text-danger-text"
        : "text-muted-foreground";

  const trendIcon = !trend
    ? null
    : trendIsUp
      ? <TrendingUp className="size-4" />
      : trendIsDown
        ? <TrendingDown className="size-4" />
        : <Minus className="size-4" />;

  const variantColors = {
    default: "bg-card border-border",
    success: "bg-success-soft border-success/30",
    warning: "bg-warning-soft border-warning/30",
    danger: "bg-danger-soft border-danger/30",
  };

  return (
    <div className={cn("rounded-xl border p-5 transition-shadow duration-150 hover:shadow-xs", variantColors[variant], className)}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-body-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-stat font-semibold tabular-nums tracking-tight text-foreground">{value}</p>
          {subtitle && <p className="mt-1 text-body-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {icon && <div className="shrink-0 text-muted-foreground [&_svg]:size-5">{icon}</div>}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span className={cn("inline-flex items-center gap-0.5 text-caption font-medium", trendColor)}>
            {trendIcon} {percent(trend.value)}
          </span>
          <span className="text-caption text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
