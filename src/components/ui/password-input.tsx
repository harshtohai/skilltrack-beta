"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

/**
 * Password input per design §4.2: CONTROL + show/hide ghost icon-xs inside,
 * `pr-10`. Toggle is type="button" so it never submits the form.
 */
function PasswordInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-3 grid place-items-center rounded-sm text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 [&_svg]:size-4"
      >
        {visible ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
      </button>
    </div>
  );
}

export { PasswordInput };
