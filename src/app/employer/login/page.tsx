"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { GraduationCap } from "lucide-react";

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

/** Employer login per design §9.2 — Shell S4, single role (no role picker). */

const employerLoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type EmployerLoginValues = z.infer<typeof employerLoginSchema>;

function EmployerLoginPageContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const redirect = searchParams.get("redirect") ?? "";
  const urlError = searchParams.get("error") ?? "";
  const urlErrorMessage =
    urlError === "unauthorized"
      ? "Unauthorized access. Please log in with an employer account."
      : urlError;
  const bannerError = formError || urlErrorMessage;

  const form = useForm<EmployerLoginValues>({
    resolver: zodResolver(employerLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setFormError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        role: "employer",
        redirect: false,
      });
      if (!result?.ok) {
        throw new Error("Invalid email or password");
      }
      // Only honor the redirect param if an employer may access it; otherwise
      // fall back to the employer home (login lockout loop guard).
      const targetUrl =
        redirect?.startsWith("/employer")
          ? redirect
          : "/employer/dashboard";
      window.location.assign(targetUrl);
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
            <h2 className="text-h2 font-semibold">Employer sign in</h2>
            <p className="text-caption text-muted-foreground">
              Verify employment claims and track retention
            </p>
          </div>

          {bannerError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{bannerError}</AlertDescription>
            </Alert>
          ) : null}

          <Form {...form}>
            <form onSubmit={onSubmit} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Work email <span className="text-danger-text">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="hr@company.com"
                        autoComplete="email"
                        className="h-11"
                        required
                        disabled={loading}
                        aria-required="true"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        Demo: <span className="font-mono">hr@company.com / employer123</span>
                      </FormDescription>
                    )}
                  </FormItem>
                )}
              />

              <Button type="submit" className="mt-2 w-full" size="lg" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </div>

        {/* Footer links below card (§9.2) */}
        <p className="mt-6 text-center text-caption text-muted-foreground">
          Are you a trainee or institute?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function EmployerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-svh place-items-center bg-background">
          <p className="text-body-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <EmployerLoginPageContent />
    </Suspense>
  );
}
