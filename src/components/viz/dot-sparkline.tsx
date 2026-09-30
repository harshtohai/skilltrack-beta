"use client";

import * as React from "react";

import { cn } from "~/lib/utils";
import { useDotColumns } from "~/components/viz/use-dot-columns";

/**
 * DotSparkline per design §4.14 (SIGNATURE): stat-card trend rendered as dots,
 * not lines. 4px dots, 2px gap (pitch 6px), 8 rows (48px tall); column count
 * adapts to container width ÷ pitch (ResizeObserver) — dot size never scales,
 * count does. Each column fills round(value / max × rows) dots from the
 * bottom; empty track dots fill-dot-empty at 60% opacity. Hover raises the
 * column's opacity and shows the numeric value as a tooltip. Columns fade in
 * left→right, 8ms stagger, ≤600ms; reduced-motion disables animation.
 * a11y: role="img" + aria-label + sr-only data table fallback.
 */

const DOT = 4;
const GAP = 2;
const PITCH = DOT + GAP; // 6px
const ROWS = 8;
const FALLBACK_COLUMNS = 24; // 144px — the stat-card sparkline slot width

function DotSparkline({
  data,
  color = "var(--chart-2)",
  ariaLabel,
  className,
}: {
  data: number[];
  /** Series color token — chart-2 purple / chart-1 orange / chart-3 blue in stat cards. */
  color?: string;
  ariaLabel: string;
  className?: string;
}) {
  const { ref, columns } = useDotColumns(PITCH, FALLBACK_COLUMNS);
  const shown = Math.min(data.length, Math.max(1, columns));
  const points = data.slice(-shown);
  const max = Math.max(...points, 1);
  const fills = points.map((v) => Math.round((v / max) * ROWS));

  return (
    <div
      ref={ref}
      role="img"
      aria-label={ariaLabel}
      className={cn("w-full", className)}
    >
      <svg
        viewBox={`0 0 ${shown * PITCH} ${ROWS * PITCH}`}
        width={shown * PITCH}
        height={ROWS * PITCH}
        aria-hidden
      >
        {Array.from({ length: shown }, (_, i) => {
          const fillCount = Math.min(fills[i] ?? 0, ROWS);
          const x = i * PITCH + DOT / 2;
          return (
            <g
              key={i}
              className="group/col animate-in fade-in-0 duration-200"
              style={{ animationDelay: `${i * 8}ms`, animationFillMode: "both" }}
            >
              <title>{points[i]}</title>
              {/* empty track above the filled dots */}
              {Array.from({ length: ROWS - fillCount }, (_, j) => {
                const y = ROWS * PITCH - (fillCount + j + 1) * PITCH + DOT / 2;
                return (
                  <circle
                    key={`e${j}`}
                    cx={x}
                    cy={y}
                    r={DOT / 2}
                    className="opacity-60 transition-opacity duration-150 group-hover/col:opacity-100"
                    style={{ fill: "var(--dot-empty)" }}
                  />
                );
              })}
              {/* filled dots from the bottom */}
              {Array.from({ length: fillCount }, (_, j) => {
                const y = ROWS * PITCH - (j + 1) * PITCH + DOT / 2;
                return (
                  <circle
                    key={`f${j}`}
                    cx={x}
                    cy={y}
                    r={DOT / 2}
                    style={{ fill: color }}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <tbody>
          {points.map((v, i) => (
            <tr key={i}>
              <th scope="row">Point {i + 1}</th>
              <td className="tabular-nums">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { DotSparkline };
