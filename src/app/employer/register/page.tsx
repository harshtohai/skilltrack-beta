"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Alert, AlertDescription } from "~/components/ui/alert";
import type { EmployerRegisterResponse } from "~/lib/job-board-contracts";

const DISTRICTS = [
  "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad",
  "Solapur", "Amravati", "Kolhapur", "Sangli", "Satara",
  "Ahmednagar", "Jalgaon", "Latur", "Dhule", "Akola",
  "Wardha", "Chandrapur", "Yavatmal", "Buldhana", "Hingoli",
];

const initialForm = {
  companyName: "",
  contactEmail: "",
  password: "",
  sector: "",
  district: "",
  registrationNo: "",
  hiringNeeds: "",
  employeeCount: "",
};

export default function EmployerRegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState<EmployerRegisterResponse["employer"] | null>(null);

  const update = (name: keyof typeof initialForm, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/employer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName.trim(),
          contactEmail: form.contactEmail.trim(),
          password: form.password,
          sector: form.sector.trim(),
          district: form.district,
          ...(form.registrationNo.trim() ? { registrationNo: form.registrationNo.trim() } : {}),
          ...(form.hiringNeeds.trim() ? { hiringNeeds: form.hiringNeeds.trim() } : {}),
          ...(form.employeeCount.trim() ? { employeeCount: form.employeeCount.trim() } : {}),
        }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } };
        throw new Error(json.error?.message ?? "Failed to register");
      }
      const json = (await res.json()) as EmployerRegisterResponse;
      setRegistered(json.employer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
            <div>
              <h1 className="text-2xl font-bold">Registration received</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {registered.companyName} is registered with{" "}
                <span className="font-mono">{registered.contactEmail}</span>.
              </p>
            </div>
            <Alert className="text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Verification pending — you can log in now, and will be able to post jobs once an
                admin verifies your account.
              </AlertDescription>
            </Alert>
            <Button asChild className="w-full" size="lg">
              <Link href="/employer/login">Go to Employer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Building2 className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold text-primary-foreground">OutcomeTrack</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Employer Registration</h1>
          <p className="mt-2 text-muted-foreground">
            Register to hire skilled trainees — job posting unlocks once your account is verified
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle>Company Details</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={form.companyName}
                  onChange={(e) => update("companyName", e.target.value)}
                  placeholder="e.g. TechCorp Industries"
                  maxLength={120}
                  required
                  minLength={2}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Work Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => update("contactEmail", e.target.value)}
                    placeholder="hr@company.com"
                    maxLength={254}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="Min 8 characters"
                    required
                    minLength={8}
                    maxLength={72}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector</Label>
                  <Input
                    id="sector"
                    value={form.sector}
                    onChange={(e) => update("sector", e.target.value)}
                    placeholder="e.g. Manufacturing"
                    maxLength={80}
                    required
                    minLength={2}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>District</Label>
                  <Select value={form.district} onValueChange={(v) => update("district", v)}>
                    <SelectTrigger className="w-full" disabled={loading}>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISTRICTS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationNo">Registration No. (GSTIN/CIN, optional)</Label>
                <Input
                  id="registrationNo"
                  value={form.registrationNo}
                  onChange={(e) => update("registrationNo", e.target.value)}
                  placeholder="e.g. 27AAPTU1234A1Z5"
                  maxLength={40}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hiringNeeds">Hiring Needs (optional)</Label>
                <Textarea
                  id="hiringNeeds"
                  value={form.hiringNeeds}
                  onChange={(e) => update("hiringNeeds", e.target.value)}
                  placeholder="Roles you plan to hire for, volumes, timelines…"
                  maxLength={500}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeCount">Employee Count (optional)</Label>
                <Input
                  id="employeeCount"
                  type="number"
                  value={form.employeeCount}
                  onChange={(e) => update("employeeCount", e.target.value)}
                  placeholder="e.g. 50"
                  min={1}
                  max={100000}
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading || !form.district}>
                {loading ? "Registering..." : "Register"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link href="/employer/login" className="text-primary hover:underline">
                Already registered? Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
