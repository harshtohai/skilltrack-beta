"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ErrorState } from "~/components/patterns/error-state";
import { Skeleton } from "~/components/patterns/skeleton";
import { TraineeProfileView } from "./trainee-profile-view";
import { VerifyCodeForm } from "./verify-code-form";
import type { TraineeProfile } from "./profile-types";

/**
 * Trainee magic-link portal (§9.10 "Profile (user)"): verifies the one-time
 * token from the enrollment email, then renders the profile portal. A
 * missing/invalid/expired/used token falls back to the 6-digit OTP recovery
 * form; network and 5xx failures get a retryable ErrorState.
 */

function PortalSkeleton() {
  return (
    <div className="space-y-6" aria-busy>
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-56 w-full rounded-2xl" />
    </div>
  );
}

export default function TraineeAuthPage() {
  const params = useParams();
  const token = Array.isArray(params.token) ? (params.token[0] ?? "") : (params.token ?? "");
  const [profile, setProfile] = useState<TraineeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifyNonce, setVerifyNonce] = useState(0);
  // Invalid/expired/used token → the OTP recovery form; anything else
  // (network, 5xx) → the existing hard-failure ErrorState.
  const [recoverable, setRecoverable] = useState(false);
  // StrictMode double-fires effects in dev — guard so each token/nonce pair
  // verifies exactly once (the token is one-time server-side; a second POST
  // would hit TOKEN_USED and wrongly flip the loaded profile to the error state).
  const verifiedKeysRef = useRef(new Set<string>());

  useEffect(() => {
    if (!token) {
      // No token in the URL — the OTP form is the primary path (§9.10).
      setLoading(false);
      setRecoverable(true);
      setError("This link is incomplete — enter the code from your email.");
      return;
    }
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      // Garbage token (can never match the sha256 token shape) — skip the API
      // round-trip and its raw Zod error; go straight to the recovery form.
      setLoading(false);
      setRecoverable(true);
      setError("This link is invalid or has expired.");
      return;
    }
    const key = `${token}:${verifyNonce}`;
    if (verifiedKeysRef.current.has(key)) return;
    verifiedKeysRef.current.add(key);
    void (async function verifyToken() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/auth/trainee/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) {
          const data = (await res.json()) as {
            error?: { code?: string; message?: string };
          };
          setRecoverable(
            data.error?.code === "INVALID_TOKEN" ||
              data.error?.code === "TOKEN_USED" ||
              data.error?.code === "TOKEN_EXPIRED",
          );
          throw new Error(data.error?.message ?? "Invalid or expired link");
        }
        const data = (await res.json()) as { trainee: TraineeProfile };
        setProfile(data.trainee);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verification failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, verifyNonce]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <PortalSkeleton />
      </div>
    );
  }

  if (error && !recoverable) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <ErrorState
          title="Couldn't verify your link"
          description={error || "This magic link is invalid or has expired."}
          onRetry={() => setVerifyNonce((n) => n + 1)}
        />
        <div className="text-center">
          <Link
            href="/login"
            className="text-body-sm text-muted-foreground underline hover:text-foreground"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  // Token invalid/expired/used (or missing) — the 6-digit code from
  // the enrollment email is the recovery path (§9.10 email verification).
  if (!profile) {
    return (
      <VerifyCodeForm
        error={error}
        onVerified={(trainee) => {
          setProfile(trainee);
          setError("");
        }}
      />
    );
  }

  return <TraineeProfileView profile={profile} />;
}
