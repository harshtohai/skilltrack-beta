"use client";

import * as React from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "~/lib/utils";
import { Button, buttonVariants } from "~/components/ui/button";

/**
 * Calendar per design §4.2: day cells size-9 rounded-md; today bg-accent;
 * selected bg-primary text-primary-foreground; range middle bg-primary-soft.
 * Used inside a Popover (p-0) as the date-picker trigger content.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  buttonVariant = "ghost",
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-card p-3 [--rdp-accent-color:var(--primary)] [--rdp-accent-background-color:var(--primary-soft)] [--rdp-day-height:2.25rem] [--rdp-day-width:2.25rem] [--rdp-day_button-border-radius:calc(var(--radius)-2px)] [--rdp-selected-border:2px]",
        className,
      )}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 sm:flex-row", defaultClassNames.months),
        month: cn("relative flex flex-col gap-3", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant, size: "icon-sm" }),
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant, size: "icon-sm" }),
          defaultClassNames.button_next,
        ),
        month_caption: cn("flex h-8 items-center justify-center px-8", defaultClassNames.month_caption),
        caption_label: cn("text-body-sm font-medium", defaultClassNames.caption_label),
        month_grid: cn("mt-3", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex size-9 items-center justify-center rounded-md text-caption font-medium text-muted-foreground",
          defaultClassNames.weekday,
        ),
        week: cn("flex w-full", defaultClassNames.week),
        day: cn(
          "relative flex size-9 items-center justify-center text-body-sm",
          defaultClassNames.day,
        ),
        day_button: cn(
          "flex size-9 items-center justify-center rounded-md text-body-sm font-normal transition-colors duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
          defaultClassNames.day_button,
        ),
        today: cn("bg-accent text-foreground", defaultClassNames.today),
        selected: cn(
          "bg-primary text-primary-foreground hover:bg-primary",
          defaultClassNames.selected,
        ),
        range_middle: cn(
          "!bg-primary-soft !text-primary-strong rounded-none",
          defaultClassNames.range_middle,
        ),
        range_start: cn("!rounded-r-none", defaultClassNames.range_start),
        range_end: cn("!rounded-l-none", defaultClassNames.range_end),
        outside: cn("text-muted-foreground opacity-50", defaultClassNames.outside),
        disabled: cn("opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        chevron: cn("size-4 opacity-60", defaultClassNames.chevron),
      }}
      {...props}
    />
  );
}

export { Calendar };
