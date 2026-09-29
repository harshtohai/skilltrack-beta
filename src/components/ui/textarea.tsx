import * as React from "react";

import { cn } from "~/lib/utils";

/**
 * Textarea per design §4.2: CONTROL base minus fixed height, min-h-20 py-2
 * resize-y. Char counter is a page-level concern (`text-caption` bottom-right).
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-lg border border-input bg-card px-3 py-2 text-body-sm text-foreground placeholder:text-muted-foreground transition-colors duration-150 hover:border-ring/50 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
