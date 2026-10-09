import * as React from "react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { RotateCw } from "lucide-react";

/**
 * FilterBar: card-based filter panel for list pages (§9.4 toolbar row).
 * Slots are selects/inputs in a responsive grid; "Clear all" resets. Kept
 * card-based (matches current UX); Sheet-with-Apply for 6+ filters is noted
 * in the idea bag.
 */
function FilterBar({
  children,
  onClear,
  className,
  compact = true,
}: {
  children: React.ReactNode;
  onClear?: () => void;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground",
        compact ? "p-4" : "p-5",
        className,
      )}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
      {onClear ? (
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClear}>
            <RotateCw />
            Clear all filters
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export { FilterBar };
