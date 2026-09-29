"use client";

import { toast as sonnerToast } from "sonner";

/**
 * Backwards-compatible adapter over Sonner (design §4.9 — Sonner replaces the
 * Radix toast). Keeps the legacy `toast({ title, description, variant, action })`
 * call signature so existing pages render through the global Toaster.
 * Migrate call sites to `import { toast } from "sonner"` when touching a page.
 */

type LegacyToast = {
  title?: string;
  description?: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  action?: { label: string; onClick: () => void };
};

function toast(props: LegacyToast) {
  const { title, description, variant, action } = props;
  const fn =
    variant === "destructive"
      ? sonnerToast.error
      : variant === "success"
        ? sonnerToast.success
        : variant === "warning"
          ? sonnerToast.warning
          : variant === "info"
            ? sonnerToast.info
            : sonnerToast;
  fn(title ?? "", {
    description,
    action: action
      ? { label: action.label, onClick: action.onClick }
      : undefined,
  });
}

export { toast };
