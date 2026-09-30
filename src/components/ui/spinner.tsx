import { Loader2 } from "lucide-react";

import { cn } from "~/lib/utils";

/**
 * Spinner per design §4: Loader2 animate-spin; sizes 16/24/32. Inline in
 * buttons; full-section spinners only if skeleton is impossible.
 */

const SIZES: Record<16 | 24 | 32, string> = {
  16: "size-4",
  24: "size-6",
  32: "size-8",
};

function Spinner({
  size = 16,
  className,
}: {
  size?: 16 | 24 | 32;
  className?: string;
}) {
  return (
    <Loader2
      aria-hidden
      className={cn(SIZES[size], "animate-spin text-muted-foreground", className)}
    />
  );
}

export { Spinner };
