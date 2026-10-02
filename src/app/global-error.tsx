"use client";

import "~/styles/globals.css";
// Fontsource fallback per Idea Bag #2 (build env cannot reach fonts.gstatic.com)
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "~/components/ui/button";

/**
 * Global error (500) per design §9.10: S4 centered card — AlertTriangle chip
 * in danger-soft, H2 "Something went wrong", [Try again] PRIMARY (reset),
 * incident id as code caption. Replaces the root layout, so it defines its
 * own html/body and imports globals + fonts itself.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme awareness without the Providers tree (this file replaces the
        root layout): mirror next-themes' localStorage key so the crash
        screen follows the user's light/dark preference. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}",
          }}
        />
      </head>
      <body className="antialiased">
        <div className="grid min-h-svh place-items-center bg-background p-4 text-foreground">
          <div className="w-full max-w-sm rounded-2xl border bg-card p-8 text-center">
            <span className="mx-auto grid size-10 place-items-center rounded-full bg-danger-soft text-danger-text [&_svg]:size-5">
              <AlertTriangle />
            </span>
            <h2 className="mt-4 text-h2 font-semibold tracking-tight">Something went wrong</h2>
            <p className="mt-2 text-body-sm text-muted-foreground">
              The page failed to load. Your data is safe — try again in a moment.
            </p>
            <Button onClick={reset} className="mt-6 w-full gap-2">
              <RotateCw />
              Try again
            </Button>
            {error.digest ? (
              <p className="mt-4 text-caption text-muted-foreground">
                Incident ID: <code className="font-mono">{error.digest}</code>
              </p>
            ) : null}
          </div>
        </div>
      </body>
    </html>
  );
}
