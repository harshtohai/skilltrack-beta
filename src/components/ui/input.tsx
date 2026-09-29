import * as React from "react";

import { cn } from "~/lib/utils";

/**
 * Input per design §4.2 CONTROL base: h-9 rounded-lg border-input bg-card,
 * hover/focus/invalid/disabled states per §4.0. Sizes sm h-8 / default h-9 /
 * lg h-11 (auth + mobile). Mobile: 16px font at <md to prevent iOS zoom.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full rounded-lg border border-input bg-card px-3 py-1 text-body-sm text-foreground placeholder:text-muted-foreground transition-colors duration-150 hover:border-ring/50 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-body-sm max-md:text-title",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
