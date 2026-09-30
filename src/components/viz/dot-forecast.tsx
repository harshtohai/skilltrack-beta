"use client";

import * as React from "react";

import { cn } from "~/lib/utils";

/**
 * DotForecast per design §4.14 (SIGNATURE): hero trend chart made of dots.
 * Column = time bucket; column height = value; 8px dots, 3px gap (pitch 11px).
 * Band semantics (interpretation — see idea bag): each column is classified
 * by its ratio to the target — below (< 90% of target) renders dot-below
 * yellow, on track (90–110%) renders dot-track orange, above (> 110%) renders
 * dot-above green. Future columns render all dot-empty grey.
 * Today marker: 1px vertical line + growth pill; legend top-right; a11y via
 * role="img" + sr-only table.
 */

const DOT = 8;
const GAP = 3;
const PITCH = DOT + GAP; // 11px
const ROWS = 12;

export type ForecastPoint = {
  label: string;
  value: number;
  isFuture?: boolean;
};

type Band = "above" | "track" | "below";

const BAND_COLOR: Record<Band, string> = {
  above: "var(--dot-above)",
  track: "var(--dot-track)",
  below: "var(--dot-below)",
};

function bandFor(value: number, target: number): Band {
  if (target <= 0) return "track";
  const ratio = value / target;
  if (ratio < 0.9) return "below";
  if (ratio > 1.1) return "above";
  return "track";
}

function DotForecast({
  data,
  target,
  todayIndex,
  height = 208,
  growthPill,
  ariaLabel,
  className,
}: {
  data: ForecastPoint[];
  /** Target value per column — defines the band classification. */
  target: number;
  /** Index of the "today" column; columns after it render empty. */
  todayIndex?: number;
  height?: number;
  /** Pill above the today marker: { value, label } — e.g. "+16.03% Growth projected". */
  growthPill?: { value: string; label: string };
  ariaLabel: string;
  className?: string;
}) {
  const columns = data.length;
  const actualValues = data.filter((d) => !d.isFuture).map((d) => d.value);
  const max = Math.max(...actualValues, target, 1);
  const fills = data.map((d) =>
    d.isFuture ? 0 : Math.min(ROWS, Math.max(1, Math.round((d.value / max) * ROWS))),
  );
  const bands = data.map((d) => (d.isFuture ? null : bandFor(d.value, target)));

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        {/* Legend: 3 items, dot 8px, gap 16px (§4.14) */}
        <div className="mb-4 flex items-center justify-end gap-4 text-caption text-muted-foreground">
          {(["above", "track", "below"] as const).map((band) => (
            <span key={band} className="inline-flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: BAND_COLOR[band] }}
                aria-hidden
              />
              {band === "above" ? "Above target" : band === "track" ? "On track" : "Below target"}
            </span>
          ))}
        </div>

        <div className="relative" style={{ height }}>
          <svg
            viewBox={`0 0 ${Math.max(columns, 1) * PITCH} ${ROWS * PITCH}`}
            width="100%"
            height={height}
            preserveAspectRatio="none"
            aria-hidden
          >
            {Array.from({ length: columns }, (_, i) => {
              const isFuture = data[i]?.isFuture === true || (todayIndex !== undefined && i > todayIndex);
              const fillCount = isFuture ? 0 : fills[i] ?? 0;
              const x = i * PITCH + DOT / 2;
              return (
                <g
                  key={i}
                  className="animate-in fade-in-0 duration-200"
                  style={{ animationDelay: `${i * 8}ms`, animationFillMode: "both" }}
                >
                  {/* empty track above filled dots */}
                  {Array.from({ length: ROWS - fillCount }, (_, j) => {
                    const y = height - ((fillCount + j + 1) * PITCH * height) / (ROWS * PITCH) + DOT / 2;
                    return (
                      <circle
                        key={`e${j}`}
                        cx={x}
                        cy={y}
                        r={DOT / 2}
                        fill="var(--dot-empty)"
                      />
                    );
                  })}
                  {/* filled dots from the bottom, colored by band */}
                  {Array.from({ length: fillCount }, (_, j) => {
                    const y = height - ((j + 1) * PITCH * height) / (ROWS * PITCH) + DOT / 2;
                    return (
                      <circle
                        key={`f${j}`}
                        cx={x}
                        cy={y}
                        r={DOT / 2}
                        fill={isFuture ? "var(--dot-empty)" : BAND_COLOR[bands[i] ?? "track"]}
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>

          {/* Today marker: 1px vertical line + dot at top */}
          {todayIndex !== undefined && (
            <div
              className="pointer-events-none absolute inset-y-0 w-px bg-foreground"
              style={{
                left: `${((todayIndex * PITCH + DOT / 2) / (Math.max(columns, 1) * PITCH)) * 100}%`,
              }}
            >
              <span className="absolute -top-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-foreground" />
            </div>
          )}

          {/* Growth pill above-right of the today marker */}
          {growthPill ? (
            <div className="absolute right-0 top-0 flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-caption shadow-xs">
              <span className="font-semibold tabular-nums text-foreground">
                {growthPill.value}
              </span>
              <span className="text-muted-foreground">{growthPill.label}</span>
            </div>
          ) : null}
        </div>

        {/* X axis: date labels below, first/last aligned to edges */}
        <div className="mt-2 flex items-center justify-between text-caption text-muted-foreground">
          {data.map((d, i) => (
            <span
              key={i}
              className={cn(
                i === todayIndex && "font-semibold text-foreground",
                data.length > 8 && i !== 0 && i !== data.length - 1 && i !== todayIndex && "hidden sm:inline",
              )}
            >
              {d.label}
            </span>
          ))}
        </div>
      </div>

      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <th scope="row">{d.label}</th>
              <td className="tabular-nums">{d.isFuture ? "—" : d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { DotForecast };
