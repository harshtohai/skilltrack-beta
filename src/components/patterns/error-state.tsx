"use client";

import * as React from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

/**
 * Error state per design §4.9: same layout as Empty with AlertTriangle in
 * danger-soft; title states what failed in plain words; description says what
 * to do; actions: Retry (primary) + optional support link (CL-31 copy tone).
 */
function ErrorState({
  title = "Something went wrong",
  description = "Check your connection and try again.",
  onRetry,
  retryLabel = "Retry",
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 py-12 text-center",
        className,
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-danger-soft text-danger-text [&_svg]:size-5">
        <AlertTriangle />
      </span>
      <div className="space-y-1">
        <p className="text-title font-medium">{title}</p>
        {description ? (
          <p className="max-w-sm text-body-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {onRetry ? (
        <Button size="sm" onClick={onRetry} className="mt-1">
          <RotateCw />
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}

export { ErrorState };
