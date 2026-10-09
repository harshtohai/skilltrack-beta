import * as React from "react";
import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "~/lib/utils";
import { percent } from "~/lib/format";
import { Button } from "~/components/ui/button";

/**
 * Stat card per design §4.4: icon chip + title (left) · corner arrow (right) ·
 * big number · delta · DotSparkline slot. Delta per CL-13: up-good green with
 * ▲/TrendingUp, down-bad red with ▼ — INVERT color (not arrow) when
 * direction-is-bad via `goodDirection`.
 */
const chipVariants = {
  brand: "bg-primary-soft text-primary-strong",
  purple: "bg-chip-purple text-chip-purple-fg",
  blue: "bg-chip-blue text-chip-blue-fg",
} as const;

function StatCard({
  title,
  value,
  delta,
  deltaLabel,
  icon,
  sparkline,
  chip = "brand",
  goodDirection = "up",
  href,
  className,
}: {
  title: string;
  value: React.ReactNode;
  /** Numeric delta in percent points, e.g. 4.02 for +4.02%. */
  delta?: number;
  /** Context line beside the delta, e.g. "vs last week". */
  deltaLabel?: string;
  icon?: React.ReactNode;
  /** DotSparkline node (viz layer) rendered at the card's right edge. */
  sparkline?: React.ReactNode;
  chip?: keyof typeof chipVariants;
  goodDirection?: "up" | "down";
  /** Whole-card link target — renders the corner ArrowUpRight as a link. */
  href?: string;
  className?: string;
}) {
  const deltaIsUp = (delta ?? 0) >= 0;
  const deltaIsGood = goodDirection === "up" ? deltaIsUp : !deltaIsUp;
  const deltaColor = delta === undefined ? "" : deltaIsGood ? "text-success-text" : "text-danger-text";
  const TrendIcon = deltaIsUp ? TrendingUp : TrendingDown;

  return (
    <div
      data-slot="stat-card"
      className={cn(
        "rounded-xl border bg-card p-5 text-card-foreground",
        href && "transition-shadow duration-150 hover:shadow-xs hover:border-ring/40 focus-within:ring-3 focus-within:ring-ring/40",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon ? (
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-md [&_svg]:size-4",
                chipVariants[chip],
              )}
            >
              {icon}
            </span>
          ) : null}
          <p className="ml-2 text-body-sm font-medium text-muted-foreground">{title}</p>
        </div>
        {href ? (
          <Button variant="ghost" size="icon-xs" asChild aria-label={`Open ${title}`}>
            <a href={href}>
              <ArrowUpRight />
            </a>
          </Button>
        ) : null}
      </div>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-stat font-semibold tabular-nums tracking-tight">{value}</p>
          {delta !== undefined ? (
            <p className="mt-1 flex items-center gap-1 text-caption">
              <span className={cn("inline-flex items-center gap-0.5", deltaColor)}>
                <TrendIcon className="size-3.5" />
                {percent(delta)}
              </span>
              {deltaLabel ? (
                <span className="text-muted-foreground">{deltaLabel}</span>
              ) : null}
            </p>
          ) : null}
        </div>
        {sparkline ? <div className="w-36 shrink-0">{sparkline}</div> : null}
      </div>
    </div>
  );
}

export { StatCard };
