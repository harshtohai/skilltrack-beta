"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { GraduationCap, Building2, User, Shield } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription } from "~/components/ui/alert";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

type UserType = "trainee" | "employer" | "institute" | "admin";

const userTypes: { value: UserType; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    value: "trainee",
    label: "Trainee",
    description: "Access your profile, update employment, upload certificates, view outcomes",
    icon: User,
  },
  {
    value: "employer",
    label: "Employer",
    description: "Verify employment claims, confirm trainee details, manage verification requests",
    icon: Building2,
  },
  {
    value: "institute",
    label: "Training Institute",
    description: "Manage cohorts, track placement rates, view analytics, export reports",
    icon: GraduationCap,
  },
  {
    value: "admin",
    label: "Government Admin",
    description: "District/state analytics, policy insights, provider accountability, SIDH exports",
    icon: Shield,
  },
];

const roleEndpoints: Record<UserType, string> = {
  trainee: "/api/v1/trainee/magic-link",
  employer: "/api/v1/auth/employer/login",
  institute: "/api/v1/auth/institute/login",
  admin: "/api/v1/auth/admin/login",
};

const roleRedirects: Record<UserType, string> = {
  trainee: "/auth/trainee/sent",
  employer: "/employer/analytics",
  institute: "/institute/analytics",
  admin: "/admin/analytics",
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedType, setSelectedType] = useState<UserType>("trainee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirect = searchParams.get("redirect") ?? "";
  const urlError = searchParams.get("error") ?? "";

  if (urlError && !error) {
    setError(urlError === "unauthorized" ? "Unauthorized access. Please log in with the correct role." : urlError);
  }

  const currentType = userTypes.find((t) => t.value === selectedType)!;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (selectedType === "trainee") {
        const res = await fetch("/api/v1/trainee/magic-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, channel: "EMAIL" }),
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? "Failed to send magic link");
        }
        router.push(`/auth/trainee/sent?email=${encodeURIComponent(email)}`);
      } else {
        if (!password) {
          throw new Error("Password is required");
        }
        const res = await fetch(roleEndpoints[selectedType], {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? "Login failed");
        }
        const userData = await res.json();
        document.cookie = `outcometrack_auth=${userData.user.role}; path=/; max-age=${60 * 60 * 24 * 7}`;
        const targetUrl = redirect || roleRedirects[selectedType];
        router.push(targetUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <GraduationCap className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold text-primary-foreground">OutcomeTrack</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Sign In to OutcomeTrack</h1>
          <p className="mt-2 text-muted-foreground">Choose your role to continue</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {userTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                selectedType === type.value
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/10 ring-2 ring-primary/20"
                  : "border-input hover:border-primary/50 hover:bg-accent hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  selectedType === type.value ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                }`}>
                  <type.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs text-muted-foreground">{type.description}</div>
                </div>
              </div>
              {selectedType === type.value && (
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-lg">
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mb-6 p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
          <p className="text-sm font-medium text-primary">
            Selected: <span className="capitalize">{selectedType}</span>
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle>{currentType.label} Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={selectedType === "trainee" ? "your@email.com" : "admin@organization.gov.in"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                {selectedType === "trainee" && (
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll send a magic link to your email &mdash; no password needed.
                  </p>
                )}
              </div>

              {selectedType !== "trainee" && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                    Demo: {selectedType === "admin" ? "admin@maharashtra.gov.in / admin123" : selectedType === "institute" ? "institute@pmkvy.gov.in / institute123" : "hr@company.com / employer123"}
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading || !email}>
                {loading ? "Sending..." : selectedType === "trainee" ? "Send Magic Link" : "Sign In"}
              </Button>
            </form>

            <Separator className="my-6" />
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>By continuing, you agree to our <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link></p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}