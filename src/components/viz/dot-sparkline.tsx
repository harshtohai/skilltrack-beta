"use client";

import * as React from "react";

import { cn } from "~/lib/utils";

/**
 * DotSparkline per design §4.14 (SIGNATURE): stat-card trend rendered as dots,
 * not lines. 144×56px, 4px dots, 2px gap (pitch 6px), 8 rows; each column
 * fills round(value / max * rows) dots from the bottom; unfilled dots
 * fill-dot-empty at 50% opacity visible above. Columns fade in left→right,
 * 8ms stagger, ≤600ms; reduced-motion disables animation.
 * a11y: role="img" + aria-label + sr-only data table fallback.
 */

const DOT = 4;
const GAP = 2;
const PITCH = DOT + GAP; // 6px
const ROWS = 8;

function DotSparkline({
  data,
  color = "var(--chart-2)",
  width = 144,
  height = 56,
  ariaLabel,
  className,
}: {
  data: number[];
  /** Series color token — chart-2 purple / chart-1 orange / chart-3 blue in stat cards. */
  color?: string;
  width?: number;
  height?: number;
  ariaLabel: string;
  className?: string;
}) {
  const columns = Math.min(data.length, Math.max(1, Math.floor(width / PITCH)));
  const points = data.slice(-columns);
  const max = Math.max(...points, 1);
  const fills = points.map((v) => Math.round((v / max) * ROWS));

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn("w-full", className)}
      style={{ maxWidth: width }}
    >
      <svg
        viewBox={`0 0 ${columns * PITCH} ${ROWS * PITCH}`}
        width="100%"
        height={height}
        preserveAspectRatio="xMidYMax meet"
        aria-hidden
      >
        {Array.from({ length: columns }, (_, i) => {
          const fillCount = Math.min(fills[i] ?? 0, ROWS);
          const x = i * PITCH + DOT / 2;
          return (
            <g
              key={i}
              className="animate-in fade-in-0 duration-200"
              style={{ animationDelay: `${i * 8}ms`, animationFillMode: "both" }}
            >
              {/* empty track above the filled dots */}
              {Array.from({ length: ROWS - fillCount }, (_, j) => {
                const y = height - (fillCount + j + 1) * PITCH + DOT / 2;
                return (
                  <circle
                    key={`e${j}`}
                    cx={x}
                    cy={y}
                    r={DOT / 2}
                    fill="var(--dot-empty)"
                    opacity={0.5}
                  />
                );
              })}
              {/* filled dots from the bottom */}
              {Array.from({ length: fillCount }, (_, j) => {
                const y = height - (j + 1) * PITCH + DOT / 2;
                return (
                  <circle
                    key={`f${j}`}
                    cx={x}
                    cy={y}
                    r={DOT / 2}
                    fill={color}
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
