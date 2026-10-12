"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import type { EmployerRegisterResponse } from "~/lib/job-board-contracts";
import { EmployerOptionalFields } from "./employer-optional-fields";
import { EmployerRequiredFields } from "./employer-required-fields";
import { employerRegisterSchema, type EmployerRegisterValues } from "./register-schema";

/**
 * Employer registration form (§9.3): the 5 required API fields plus an
 * optional-extras panel (§4.4). Success hands the registered employer to
 * the page for the verification-pending interstitial.
 */
export function EmployerRegisterForm({
  onRegistered,
}: {
  onRegistered: (employer: EmployerRegisterResponse["employer"]) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const form = useForm<EmployerRegisterValues>({
    resolver: zodResolver(employerRegisterSchema),
    defaultValues: {
      companyName: "",
      contactEmail: "",
      password: "",
      sector: "",
      district: "",
      registrationNo: "",
      hiringNeeds: "",
      employeeCount: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setSubmitError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/employer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: data.companyName.trim(),
          contactEmail: data.contactEmail.trim(),
          password: data.password,
          sector: data.sector.trim(),
          district: data.district,
          ...(data.registrationNo?.trim() ? { registrationNo: data.registrationNo.trim() } : {}),
          ...(data.hiringNeeds?.trim() ? { hiringNeeds: data.hiringNeeds.trim() } : {}),
          ...(data.employeeCount?.trim() ? { employeeCount: data.employeeCount.trim() } : {}),
        }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } };
        throw new Error(json.error?.message ?? "Failed to register");
      }
      const json = (await res.json()) as EmployerRegisterResponse;
      onRegistered(json.employer);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  });

  return (
    <>
      {submitError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      <Form {...form}>
        <form onSubmit={onSubmit} className="grid gap-4">
          <EmployerRequiredFields form={form} loading={loading} />

          {/* Optional extras — bg-muted panel (§4.4) */}
          <EmployerOptionalFields form={form} loading={loading} />

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
      </Form>
    </>
  );
}
