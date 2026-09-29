import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

/**
 * Alert / banner per design §4.9: rounded-lg border p-4 flex gap-3, icon
 * size-4 mt-0.5, title text-body-sm font-medium, body text-body-sm. Variants
 * per status map. Page-level banner sits above the page header, full width.
 */
const alertVariants = cva(
  "relative flex w-full flex-col gap-1 rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:size-4 [&>svg]:mt-0.5 [&>svg]:shrink-0 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        info: "bg-info-soft border-info/30 text-info-text [&>svg]:text-info",
        success: "bg-success-soft border-success/30 text-success-text [&>svg]:text-success",
        warning: "bg-warning-soft border-warning/30 text-warning-text [&>svg]:text-warning",
        danger: "bg-danger-soft border-danger/30 text-danger-text [&>svg]:text-danger",
        destructive: "bg-danger-soft border-danger/30 text-danger-text [&>svg]:text-danger",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("text-body-sm font-medium min-h-4", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-body-sm", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
