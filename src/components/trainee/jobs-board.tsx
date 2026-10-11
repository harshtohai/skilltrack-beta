"use client";

import { useState, useEffect, useCallback } from "react";
import { Briefcase, HelpCircle, SearchX } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { toast } from "sonner";
import { EmptyState } from "~/components/patterns/empty-state";
import { ErrorState } from "~/components/patterns/error-state";
import { Skeleton } from "~/components/patterns/skeleton";
import { matchesFilters, type JobFilter } from "~/server/job-relevance";
import { JobCard } from "~/components/trainee/job-card";
import { JobsFilters } from "~/components/trainee/jobs-filters";
import {
  MyApplicationsTab,
  WithdrawApplicationDialog,
} from "~/components/trainee/my-applications-tab";
import { JobSeekSignalDialog } from "~/components/trainee/job-seek-signal-dialog";
import type {
  MyApplication,
  PublicJob,
  TraineeJobsResponse,
  MyApplicationsResponse,
} from "~/lib/job-board-contracts";

function JobsBoardSkeleton() {
  return (
    <div>
      <Skeleton className="mb-4 h-24 w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  );
}

export function TraineeJobsBoard() {
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [withdrawTarget, setWithdrawTarget] = useState<MyApplication | null>(
    null,
  );
  const [withdrawing, setWithdrawing] = useState(false);
  const [signalOpen, setSignalOpen] = useState(false);
  const [filters, setFilters] = useState<JobFilter>({
    district: "",
    workMode: "",
    employmentType: "",
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsRes, applicationsRes] = await Promise.all([
        fetch("/api/v1/trainee/jobs"),
        fetch("/api/v1/trainee/applications"),
      ]);
      if (!jobsRes.ok || !applicationsRes.ok)
        throw new Error("Failed to load jobs");
      const jobsData = (await jobsRes.json()) as TraineeJobsResponse;
      const applicationsData =
        (await applicationsRes.json()) as MyApplicationsResponse;
      setJobs(jobsData.jobs);
      setApplications(applicationsData.applications);
      setError(null);
    } catch (err) {
      console.error("Jobs board load error:", err);
      setError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const handleApply = async (jobId: string) => {
    if (applyingId) return;
    setApplyingId(jobId);
    try {
      const res = await fetch(`/api/v1/trainee/jobs/${jobId}/apply`, {
        method: "POST",
      });
      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === jobId
              ? { ...j, applied: true, appliedAt: new Date().toISOString() }
              : j,
          ),
        );
        toast.success("Application sent", {
          description: "The employer can now see your profile.",
        });
        // Refetch from the server's truth so the My Applications tab is fresh
        // (the optimistic jobs update above only flips this job's badge).
        void fetchAll();
      } else {
        const json = (await res.json()) as {
          error?: { code?: string; message?: string };
        };
        if (json.error?.code === "DUPLICATE_APPLICATION") {
          toast("Already applied", {
            description: "You have already applied to this job.",
          });
        } else {
          toast.error("Could not apply", {
            description: json.error?.message ?? "Something went wrong",
          });
        }
      }
    } catch {
      toast.error("Could not apply", { description: "Something went wrong" });
    } finally {
      setApplyingId(null);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawTarget || withdrawing) return;
    setWithdrawing(true);
    try {
      const res = await fetch(
        `/api/v1/trainee/applications/${withdrawTarget.id}/withdraw`,
        {
          method: "POST",
        },
      );
      if (res.ok) {
        const withdrawn = withdrawTarget;
        setApplications((prev) =>
          prev.map((a) =>
            a.id === withdrawn.id ? { ...a, status: "WITHDRAWN" as const } : a,
          ),
        );
        // WITHDRAWN does not count as applied — the trainee can re-apply.
        setJobs((prev) =>
          prev.map((j) =>
            j.id === withdrawn.jobPostingId
              ? { ...j, applied: false, appliedAt: null }
              : j,
          ),
        );
        toast.success("Application withdrawn");
      } else {
        const json = (await res.json()) as { error?: { message?: string } };
        toast.error("Could not withdraw", {
          description: json.error?.message ?? "Something went wrong",
        });
      }
    } catch {
      toast.error("Could not withdraw", {
        description: "Something went wrong",
      });
    } finally {
      setWithdrawing(false);
      setWithdrawTarget(null);
    }
  };

  const districtOptions = [...new Set(jobs.map((j) => j.district))].sort();
  const filteredJobs = jobs.filter((j) => matchesFilters(j, filters));

  const openSignal = () => setSignalOpen(true);

  if (loading && jobs.length === 0 && applications.length === 0) {
    return <JobsBoardSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="Couldn't load jobs"
        description="The board didn't arrive. Check your connection and retry."
        onRetry={() => void fetchAll()}
      />
    );
  }

  return (
    <div className="mb-8">
      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <JobsFilters
            filters={filters}
            onFiltersChange={setFilters}
            districtOptions={districtOptions}
          />

          {filteredJobs.length === 0 ? (
            <EmptyState
              icon={jobs.length === 0 ? <Briefcase /> : <SearchX />}
              title={
                jobs.length === 0
                  ? "No open jobs right now"
                  : "No jobs match your filters"
              }
              description={
                jobs.length === 0
                  ? "New jobs appear here as employers post them."
                  : "Try widening your filters to see more openings."
              }
              action={
                jobs.length === 0 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openSignal}
                    className="gap-2"
                  >
                    <HelpCircle className="h-4 w-4" /> {`Can't find a job?`}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFilters({
                        district: "",
                        workMode: "",
                        employmentType: "",
                      })
                    }
                  >
                    Clear all filters
                  </Button>
                )
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  applying={applyingId === job.id}
                  onApply={(jobId) => void handleApply(jobId)}
                />
              ))}
            </div>
          )}

          {jobs.length > 0 && (
            <div className="mt-6 text-center">
              <Button variant="outline" onClick={openSignal} className="gap-2">
                <HelpCircle className="h-4 w-4" /> {`Can't find a job?`}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications">
          <MyApplicationsTab
            applications={applications}
            onWithdraw={setWithdrawTarget}
          />
        </TabsContent>
      </Tabs>

      <WithdrawApplicationDialog
        target={withdrawTarget}
        busy={withdrawing}
        onCancel={() => setWithdrawTarget(null)}
        onConfirm={() => void handleWithdraw()}
      />

      <JobSeekSignalDialog open={signalOpen} onOpenChange={setSignalOpen} />
    </div>
  );
}
