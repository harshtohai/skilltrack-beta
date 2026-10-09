import * as React from "react";

import { cn } from "~/lib/utils";

/**
 * PageHeader per design §3.4 / CL-07: title `text-h1 font-medium` left with
 * optional caption under it; actions right (`flex items-center gap-2`); wraps
 * below title at base. Max one primary button in actions (CL-05).
 */
function PageHeader({
  title,
  caption,
  actions,
  className,
}: {
  title: React.ReactNode;
  caption?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-h1 font-medium tracking-tight">{title}</h1>
        {caption ? (
          <p className="mt-1 text-body-sm text-muted-foreground">{caption}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export { PageHeader };
