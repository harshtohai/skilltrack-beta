"use client";

import * as React from "react";

import { cn } from "~/lib/utils";

/**
 * Skeleton per design §4.9: animate-pulse rounded-md bg-muted; MUST match
 * final layout dimensions. Shows after a 200ms delay to avoid flash; no
 * spinner+skeleton combos.
 */
function Skeleton({
  className,
  delay = true,
  ...props
}: React.ComponentProps<"div"> & { delay?: boolean }) {
  const [visible, setVisible] = React.useState(!delay);
  React.useEffect(() => {
    if (!delay) return;
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, [delay]);
  if (!visible) return null;
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
