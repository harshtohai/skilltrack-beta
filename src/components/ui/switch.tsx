"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "~/lib/utils";

/**
 * Switch per design §4.2: track h-5 w-9 rounded-full, thumb size-4
 * bg-background. Instant on/off (no submit) — MUST apply immediately + toast;
 * if it requires Save, use Checkbox. Label left, switch right (settings rows).
 */
function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-input data-[state=checked]:bg-primary",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 rounded-full bg-background shadow-sm ring-0 transition-transform data-[state=unchecked]:translate-x-0.5 data-[state=checked]:translate-x-[1.125rem]"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
