"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Building2, Check, GraduationCap, Shield, User } from "lucide-react";

import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { PasswordInput } from "~/components/ui/password-input";
import { isPathAllowedForRole } from "~/lib/protected-routes";
import { cn } from "~/lib/utils";

type UserType = "trainee" | "employer" | "institute" | "admin";

/** Card-style radio rows per §4.2 — icon chip + label, no long copy (CL-31). */
const userTypes: {
  value: UserType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "trainee", label: "Trainee", icon: User },
  { value: "employer", label: "Employer", icon: Building2 },
  { value: "institute", label: "Training Institute", icon: GraduationCap },
  { value: "admin", label: "Government Admin", icon: Shield },
];

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

const magicLinkEndpoint = "/api/v1/trainee/magic-link";

const roleRedirects: Record<UserType, string> = {
  trainee: "/auth/trainee/sent",
  employer: "/employer/dashboard",
  institute: "/institute/analytics",
  admin: "/admin/analytics",
};

const demoCreds: Partial<Record<UserType, string>> = {
  admin: "admin@maharashtra.gov.in / admin123",
  institute: "institute@pmkvy.gov.in / institute123",
  employer: "hr@company.com / employer123",
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedType, setSelectedType] = useState<UserType>("trainee");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const redirect = searchParams.get("redirect") ?? "";
  const urlError = searchParams.get("error") ?? "";
  const urlErrorMessage =
    urlError === "unauthorized"
      ? "Unauthorized access. Please log in with the correct role."
      : urlError;
  const bannerError = formError || urlErrorMessage;

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    if (selectedType !== "trainee" && !data.password) {
      form.setError("password", { message: "Password is required" });
      return;
    }
    setFormError("");
    setLoading(true);

    try {
      if (selectedType === "trainee") {
        const res = await fetch(magicLinkEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email, channel: "EMAIL" }),
        });
        if (!res.ok) {
          const json = (await res.json()) as { error?: { message?: string } };
          throw new Error(json.error?.message ?? "Failed to send magic link");
        }
        router.push(`/auth/trainee/sent?email=${encodeURIComponent(data.email)}`);
      } else {
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password ?? "",
          role: selectedType,
          redirect: false,
        });
        if (!result?.ok) {
          const code = result?.error ?? "CredentialsSignin";
          throw new Error(
            code === "CredentialsSignin" || code.includes("credentials")
              ? "Invalid email or password"
              : "Login failed",
          );
        }
        // Only honor the redirect param if the logged-in role may access it —
        // otherwise a stale ?redirect=/trainee/profile bounces non-trainee
        // roles back to /login forever (login lockout loop). Hard navigation
        // re-reads the fresh session cookie server-side (§9.2 → S1).
        const targetUrl =
          redirect && isPathAllowedForRole(redirect, selectedType)
            ? redirect
            : roleRedirects[selectedType];
        window.location.assign(targetUrl);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  });

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
              <GraduationCap className="size-4" aria-hidden />
            </span>
            <span className="text-title font-semibold text-foreground">
              OutcomeTrack
            </span>
          </Link>
        </div>

        <div className="rounded-2xl border bg-card p-8">
          {/* Card header — center (§3.6 auth) */}
          <div className="mb-6 space-y-1 text-center">
            <h2 className="text-h2 font-semibold">Welcome back</h2>
            <p className="text-caption text-muted-foreground">
              Sign in to continue
            </p>
          </div>

          {bannerError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{bannerError}</AlertDescription>
            </Alert>
          ) : null}

          {/* Role picker — card-style radios (§4.2), chip + gap-3 rows */}
          <div
            role="radiogroup"
            aria-label="Account type"
            className="mb-6 grid gap-2"
          >
            {userTypes.map((type) => {
              const selected = selectedType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setSelectedType(type.value)}
                  className={cn(
                    "flex h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                    selected
                      ? "border-primary bg-primary-soft"
                      : "hover:border-ring/50 hover:bg-accent",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-md",
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary-soft text-primary-strong",
                    )}
                  >
                    <type.icon className="size-4" aria-hidden />
                  </span>
                  <span className="flex-1 text-body-sm font-medium">
                    {type.label}
                  </span>
                  {selected ? (
                    <Check className="size-4 shrink-0 text-primary-strong" aria-hidden />
                  ) : null}
                </button>
              );
            })}
          </div>

          <Form {...form}>
            <form onSubmit={onSubmit} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>
                      Email <span className="text-danger-text">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={
                          selectedType === "trainee"
                            ? "your@email.com"
                            : "admin@organization.gov.in"
                        }
                        autoComplete="email"
                        className="h-11"
                        required
                        disabled={loading}
                        aria-required="true"
                        {...field}
                      />
                    </FormControl>
                    {fieldState.error ? null : (
                      <FormDescription>
                        {selectedType === "trainee"
                          ? "We’ll send a magic link — no password needed."
                          : "Use your work or government email."}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedType !== "trainee" ? (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>
                        Password <span className="text-danger-text">*</span>
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          className="h-11"
                          required
                          disabled={loading}
                          aria-required="true"
                          {...field}
                        />
                      </FormControl>
                      {fieldState.error ? (
                        <FormMessage />
                      ) : (
                        <FormDescription>
                          Demo:{" "}
                          <span className="font-mono">
                            {demoCreds[selectedType]}
                          </span>
                        </FormDescription>
                      )}
                    </FormItem>
                  )}
                />
              ) : null}

              <Button
                type="submit"
                className="mt-2 w-full"
                size="lg"
                disabled={loading}
              >
                {loading
                  ? "Sending..."
                  : selectedType === "trainee"
                    ? "Send magic link"
                    : "Sign In"}
              </Button>
            </form>
          </Form>
        </div>

        {/* Footer links below card (§9.2) */}
        <p className="mt-6 text-center text-caption text-muted-foreground">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-primary-strong hover:underline">
            Sign up
          </Link>
        </p>
        <p className="mt-2 text-center text-caption text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-primary-strong hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary-strong hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-svh place-items-center bg-background">
          <p className="text-body-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
