"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Skeleton } from "~/components/patterns/skeleton";
import { PageHeader } from "~/components/patterns/page-header";
import { EmployerVerificationBanner } from "~/components/employer/verification-banner";
import { PostJobForm } from "./post-job-form";
import type {
  EmployerJobsResponse,
  EmployerVerificationStatus,
} from "~/lib/job-board-contracts";

/**
 * Post Job (F25) per design §9.6 — Shell S1 page, `max-w-2xl`. The dashboard
 * keeps a single "Post Job" button that navigates here. Same verification
 * gate as the dashboard: PENDING/SUSPENDED/REJECTED employers see the banner
 * only. On success it returns to the dashboard, where the new posting
 * appears in the list.
 */
export default function PostJobPage() {
  const router = useRouter();
  const [status, setStatus] = useState<EmployerVerificationStatus | null>(null);
  const [checking, setChecking] = useState(true);
  const [gateError, setGateError] = useState("");
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/v1/employer/jobs");
        if (!active) return;
        if (res.status === 401) {
          router.push("/employer/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to load employer profile");
        const json = (await res.json()) as EmployerJobsResponse;
        setStatus(json.employer.verificationStatus);
      } catch (err) {
        console.error("Post-job gate error:", err);
        if (active) setGateError("Failed to load employer profile");
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  if (checking) {
    return (
      <div>
        <Skeleton className="mb-6 h-14 w-72" />
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  if (gateError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{gateError}</AlertDescription>
      </Alert>
    );
  }

  // Same verification gate as the dashboard: banner only for non-verified.
  if (status === "PENDING" || status === "SUSPENDED" || status === "REJECTED") {
    return <EmployerVerificationBanner status={status} />;
  }

  if (posted) {
    return (
      <Alert variant="success">
        <AlertTitle>Job posted</AlertTitle>
        <AlertDescription>
          Your posting is live on the trainee job board. Returning to the
          dashboard…
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <PageHeader
        title="Post a job"
        caption="Describe the role — it goes live on the trainee job board once posted."
      />

      <PostJobForm
        onPosted={() => {
          setPosted(true);
          // Let the success state register, then return to the dashboard where
          // the new posting heads the list.
          setTimeout(() => router.push("/employer/dashboard"), 1500);
        }}
      />
    </div>
  );
}
