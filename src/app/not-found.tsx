import Link from "next/link";
import { Button } from "~/components/ui/button";

/**
 * 404 per design §9.10: S4 centered card — display "404" in
 * text-display font-semibold text-muted-foreground, H2 "Page not found",
 * [Go to dashboard] PRIMARY, secondary link below. Renders inside whichever
 * layout matches the bad URL (root or (app) S1 shell).
 */
export default function NotFound() {
  return (
    <div className="grid min-h-svh place-items-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 text-center">
        <p className="text-display font-semibold text-muted-foreground">404</p>
        <h2 className="mt-2 text-h2 font-semibold tracking-tight">Page not found</h2>
        <p className="mt-2 text-body-sm text-muted-foreground">
          The page you’re looking for doesn’t exist or may have moved.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
        <div className="mt-4">
          <Link
            href="/"
            className="rounded-sm text-body-sm text-muted-foreground underline transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
