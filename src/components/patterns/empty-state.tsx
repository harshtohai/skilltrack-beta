import * as React from "react";

import { cn } from "~/lib/utils";

/**
 * Empty state per design §4.9: centered, icon chip, title, one-sentence
 * description, ONE primary action (or secondary link). Required for every
 * list/table/chart (CL-16).
 */
function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground [&_svg]:size-5">
          {icon}
        </span>
      ) : null}
      <div className="space-y-1">
        <p className="text-title font-medium">{title}</p>
        {description ? (
          <p className="max-w-sm text-body-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
