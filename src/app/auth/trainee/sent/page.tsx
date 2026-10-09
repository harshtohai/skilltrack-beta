"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle, Clock, Mail, RefreshCw, ShieldCheck } from "lucide-react";

import { Button } from "~/components/ui/button";

/**
 * Magic-link sent per design §9.2 — Shell S4. Sonner toasts for resend
 * feedback (§4.9); info rows in a bg-muted panel (§4.4).
 */

/** Matches the server-side 30s token cooldown in the magic-link route. */
const RESEND_COOLDOWN_S = 30;

function MagicLinkSentContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "your email";
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);

  const cooldownActive = cooldown > 0;

  // Live countdown; interval only runs while cooling down, cleanup on unmount.
  useEffect(() => {
    if (!cooldownActive) return;
    const timer = setInterval(() => {
      setCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownActive]);

  const handleResend = async () => {
    setCooldown(RESEND_COOLDOWN_S);
    setResending(true);
    try {
      const res = await fetch("/api/v1/trainee/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, channel: "EMAIL" }),
      });
      if (!res.ok) {
        const json = (await res.json()) as {
          error?: { message?: string; retryAfter?: number };
        };
        if (res.status === 429 && typeof json.error?.retryAfter === "number") {
          setCooldown(json.error.retryAfter);
        }
        throw new Error(json.error?.message ?? "Failed to resend magic link");
      }
      toast.success("Magic link resent", {
        description: "Check your inbox — it can take a minute to arrive.",
      });
    } catch (err) {
      toast.error("Could not resend", {
        description: err instanceof Error ? err.message : "Please try again in a moment.",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="grid min-h-svh place-items-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Logo above card (§9.2) */}
        <div className="mb-8 flex justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="size-4" aria-hidden />
            </span>
            <span className="text-title font-semibold text-foreground">
              SkillsTrack
            </span>
          </Link>
        </div>

        <div className="rounded-2xl border bg-card p-8">
          <div className="space-y-3 text-center">
            <span className="mx-auto grid size-10 place-items-center rounded-full bg-success-soft text-success-text [&_svg]:size-5">
              <CheckCircle aria-hidden />
            </span>
            <div className="space-y-1">
              <h2 className="text-h2 font-semibold">Check your inbox</h2>
              <p className="text-caption text-muted-foreground">
                If an account exists for{" "}
                <span className="font-mono text-foreground">{email}</span>,
                we’ve sent a login link.
              </p>
            </div>
          </div>

          {/* Info rows — bg-muted panel (§4.4) */}
          <div className="mt-6 grid gap-3 rounded-lg bg-muted p-3 text-left">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              <div className="space-y-0.5">
                <p className="text-body-sm font-medium">Check your inbox</p>
                <p className="text-caption text-muted-foreground">
                  Look for an email from SkillsTrack
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              <div className="space-y-0.5">
                <p className="text-body-sm font-medium">Link expires in 30 minutes</p>
                <p className="text-caption text-muted-foreground">
                  For security, the link is single-use
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RefreshCw className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              <div className="space-y-0.5">
                <p className="text-body-sm font-medium">No email?</p>
                <p className="text-caption text-muted-foreground">
                  Check the spam folder or request a new link
                </p>
              </div>
            </div>
          </div>

          <Button
            className="mt-6 w-full"
            size="lg"
            onClick={handleResend}
            disabled={resending || cooldownActive}
          >
            <RefreshCw className={resending ? "animate-spin" : undefined} aria-hidden />
            Resend link
          </Button>
          {cooldownActive ? (
            <p className="mt-1.5 text-caption tabular-nums text-muted-foreground">
              You can request a new link in {cooldown}s
            </p>
          ) : null}
        </div>

        {/* Footer links below card (§9.2) */}
        <p className="mt-6 text-center text-caption text-muted-foreground">
          Didn’t receive the email?{" "}
          <Link href="/login" className="text-primary-strong hover:underline">
            Try a different email
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function MagicLinkSentPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-svh place-items-center bg-background">
          <p className="text-body-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <MagicLinkSentContent />
    </Suspense>
  );
}
