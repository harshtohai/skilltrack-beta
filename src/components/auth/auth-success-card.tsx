"use client";

import type { ReactNode } from "react";
import { CheckCircle } from "lucide-react";

/**
 * Full-screen success interstitial for the auth flows: centered card with the
 * success check + title, then flow-specific children (copy, alerts, CTA).
 */
export function AuthSuccessCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-svh place-items-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 text-center">
        <span className="mx-auto grid size-10 place-items-center rounded-full bg-success-soft text-success-text [&_svg]:size-5">
          <CheckCircle aria-hidden />
        </span>
        <h2 className="mt-3 text-h2 font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
}
