"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorState } from "~/components/patterns/error-state";

/**
 * Route-level error boundary (design §9.10, one level up from global-error):
 * a render error inside any (app) page keeps the sidebar/shell and shows a
 * retry that re-renders just that segment, instead of replacing the whole
 * document with the root crash screen.
 */
export default function AppError({
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
    <div className="mx-auto max-w-md">
      <ErrorState
        title="This page didn't load"
        description="Your data is safe. Try again — if it keeps happening, the incident ID below helps us find it."
        onRetry={reset}
        retryLabel="Try again"
      />
      {error.digest ? (
        <p className="text-center text-caption text-muted-foreground">
          Incident ID: <code className="font-mono">{error.digest}</code>
        </p>
      ) : null}
    </div>
  );
}
