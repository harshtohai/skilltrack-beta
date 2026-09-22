"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useState } from "react";
import { GraduationCap, CheckCircle, Clock, Loader2, Mail, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";

function MagicLinkSentContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "your email";
  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResend = async () => {
    setResending(true);
    setResendError("");
    try {
      const res = await fetch("/api/v1/trainee/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, channel: "EMAIL" }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to resend magic link");
      }
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err) {
      setResendError(err instanceof Error ? err.message : "Failed to resend");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <GraduationCap className="h-10 w-10 text-primary" />
          <span className="text-2xl font-bold text-primary-foreground">OutcomeTrack</span>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Magic Link Sent!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-lg">We&apos;ve sent a magic link to</p>
              <p className="font-mono text-primary">{email}</p>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-3 text-left">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Check your inbox</p>
                  <p className="text-sm text-muted-foreground">Look for an email from OutcomeTrack</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Link expires in 30 minutes</p>
                  <p className="text-sm text-muted-foreground">For security, the link is single-use</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">No email?</p>
                  <p className="text-sm text-muted-foreground">Check spam folder or request a new link</p>
                </div>
              </div>
            </div>

            {resendError && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>{resendError}</AlertDescription>
              </Alert>
            )}

            {resendSuccess && (
              <Alert className="mb-4" variant="default">
                <AlertDescription>Magic link resent! Check your inbox.</AlertDescription>
              </Alert>
            )}

            <Button className="w-full" onClick={handleResend} disabled={resending}>
              {resending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Link
                </>
              )}
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Didn&apos;t receive the email?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Try a different email
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

export default function MagicLinkSentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <MagicLinkSentContent />
    </Suspense>
  );
}