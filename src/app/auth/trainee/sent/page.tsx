"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { GraduationCap, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function MagicLinkSentPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "your email";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <GraduationCap className="h-10 w-10 text-primary" />
          <span className="text-2xl font-bold text-primary-foreground">OutcomeTrack</span>
        </Link>

        <Card>
          <CardHeader>
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
                <div className="h-5 w-5 text-muted-foreground" aria-hidden="true">✉</div>
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

            <Button className="w-full" onClick={() => void window.location.reload()}>
              Resend Link
            </Button>

            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive the email?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Try a different email
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          By continuing, you agree to our <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}