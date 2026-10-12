"use client";

import { DotSparkline } from "~/components/viz/dot-sparkline";

/** Dot-matrix spark data for the brand panel (§9.3). */
const BRAND_SPARK = Array.from({ length: 48 }, (_, i) =>
  Math.round(6 + 30 * (i / 47) + (i % 5 === 0 ? 8 : 0)),
);

/**
 * Right column of the split auth shell (§9.3): bg-muted brand panel with the
 * dot-matrix placement-trends art + one testimonial. Only the quote and
 * attribution vary per page; the chrome is fixed.
 */
export function AuthBrandPanel({
  quote,
  attribution,
}: {
  quote: string;
  attribution: string;
}) {
  return (
    <div className="hidden lg:flex flex-col justify-center gap-10 bg-muted p-10">
      <div className="flex items-center justify-between gap-4">
        <span className="text-title font-medium text-foreground">Placement trends</span>
        <div className="w-36 shrink-0">
          <DotSparkline
            data={BRAND_SPARK}
            color="var(--chart-1)"
            ariaLabel="Placement trends"
          />
        </div>
      </div>
      <figure className="mx-auto max-w-sm space-y-3">
        <blockquote className="text-h2 font-semibold tracking-tight text-foreground">
          &ldquo;{quote}&rdquo;
        </blockquote>
        <figcaption className="text-caption text-muted-foreground">
          {attribution}
        </figcaption>
      </figure>
    </div>
  );
}
