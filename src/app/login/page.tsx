"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Building2, User, Shield } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription } from "~/components/ui/alert";

type UserType = "trainee" | "employer" | "institute" | "admin";

const userTypes: { value: UserType; label: string; description: string; icon: React.ComponentType<{ className?: string }>; href: string }[] = [
  {
    value: "trainee",
    label: "Trainee",
    description: "Access your profile, update employment, upload certificates, view outcomes",
    icon: User,
    href: "/auth/trainee/login",
  },
  {
    value: "employer",
    label: "Employer",
    description: "Verify employment claims, confirm trainee details, manage verification requests",
    icon: Building2,
    href: "/employer/login",
  },
  {
    value: "institute",
    label: "Training Institute",
    description: "Manage cohorts, track placement rates, view analytics, export reports",
    icon: GraduationCap,
    href: "/institute/login",
  },
  {
    value: "admin",
    label: "Government Admin",
    description: "District/state analytics, policy insights, provider accountability, SIDH exports",
    icon: Shield,
    href: "/admin/login",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<UserType>("trainee");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentType = userTypes.find(t => t.value === selectedType)!;

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
        router.push(currentType.href);
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
              className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                selectedType === type.value
                  ? "border-primary bg-primary/5"
                  : "border-input hover:border-primary/50 hover:bg-accent"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <type.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs text-muted-foreground">{type.description}</div>
                </div>
              </div>
              {selectedType === type.value && (
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
            </button>
          ))}
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
                    required
                    disabled={loading}
                  />
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