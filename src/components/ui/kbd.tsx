import * as React from "react";

import { cn } from "~/lib/utils";

/**
 * Kbd per design §4.10: rounded-sm border bg-muted px-1.5 text-caption font-mono.
 */
function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex items-center rounded-sm border bg-muted px-1.5 text-caption font-mono text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Kbd };
