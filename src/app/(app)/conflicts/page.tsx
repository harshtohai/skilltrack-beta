"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Building2, User, MapPin, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { PageHeader } from "~/components/patterns/page-header";
import { EmptyState } from "~/components/patterns/empty-state";
import { ErrorState } from "~/components/patterns/error-state";
import { Skeleton } from "~/components/patterns/skeleton";
import { StatusBadge, type StatusKey } from "~/components/patterns/status-badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "~/components/ui/table";
import { ScrollArea } from "~/components/ui/scroll-area";

interface Conflict {
  id: string;
  trainee: {
    id: string;
    publicId: string;
    fullName: string;
    phoneE164: string;
    district: string;
  };
  cohort: { id: string; name: string } | null;
  checkpointDays: number;
  claim: {
    employerName: string | null;
    role: string | null;
    salaryBand: string | null;
    nonPlacementReason: string | null;
    verificationStatus: string;
    evidenceLevel: number;
    createdAt: string;
  };
  traineeSource: {
    outcomeStatus: string;
    verificationStatus: string;
    evidenceLevel: number;
    createdAt: string;
  } | null;
  employerSource: {
    outcomeStatus: string;
    verificationStatus: string;
    evidenceLevel: number;
    rejectionReason: string | null;
    createdAt: string;
  } | null;
}

interface ConflictsResponse {
  data?: Conflict[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

/**
 * Conflict queue per design §9.4 — Shell S1. Server-paginated table in a
 * ScrollArea; statuses and evidence render through StatusBadge (§4.10/CL-12).
 */
export default function ConflictsPage() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedCohortId, setSelectedCohortId] = useState("");
  const [cohorts, setCohorts] = useState<Array<{ id: string; name: string }>>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  const fetchConflicts = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (selectedCohortId) params.append("cohortId", selectedCohortId);

      const res = await fetch(`/api/v1/conflicts?${params}`);
      const data = (await res.json()) as ConflictsResponse;
      setConflicts(data.data ?? []);
      setPagination(data.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, selectedCohortId]);

  const fetchCohorts = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/cohorts?limit=100");
      const data = (await res.json()) as { data?: Array<{ id: string; name: string }> };
      setCohorts(data.data ?? []);
    } catch {
      // non-critical — the cohort filter just stays empty
    }
  }, []);

  useEffect(() => {
    void fetchCohorts();
  }, [fetchCohorts]);

  useEffect(() => {
    void fetchConflicts();
  }, [fetchConflicts]);

  return (
    <div>
      <PageHeader
        title="Conflict queue"
        caption="Employment claims where trainee and employer sources disagree"
        actions={
          <Select value={selectedCohortId} onValueChange={setSelectedCohortId}>
            <SelectTrigger className="w-col-2xl">
              <SelectValue placeholder="All cohorts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All cohorts</SelectItem>
              {cohorts.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {loading ? (
        <Card className="p-5">
          <CardHeader className="p-0">
            <CardTitle>Loading conflicts…</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <div className="space-y-4">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="p-5">
          <ErrorState
            title="Could not load conflicts"
            description="Check your connection and try again."
            onRetry={fetchConflicts}
          />
        </Card>
      ) : conflicts.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon={<AlertTriangle />}
            title="No conflicts found"
            description="All employer verifications are either confirmed or pending."
          />
        </Card>
      ) : (
        <Card className="p-5">
          <CardHeader className="p-0">
            <CardTitle>Conflicts ({pagination.total})</CardTitle>
            <CardDescription>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} conflicts
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <ScrollArea className="h-list w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-col-xs">Trainee</TableHead>
                    <TableHead className="w-col-lg">Cohort</TableHead>
                    <TableHead className="w-col-sm">Checkpoint</TableHead>
                    <TableHead className="w-col-2xl">Trainee says</TableHead>
                    <TableHead className="w-col-2xl">Employer says</TableHead>
                    <TableHead className="w-col-sm">Evidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conflicts.map((conflict) => (
                    <TableRow key={conflict.id} className="border-t hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{conflict.trainee.fullName}</p>
                          <p className="text-caption text-muted-foreground">{conflict.trainee.publicId}</p>
                          <p className="text-caption text-muted-foreground flex items-center gap-1">
                            <MapPin className="size-3" /> {conflict.trainee.district}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {conflict.cohort ? (
                          <span className="font-medium">{conflict.cohort.name}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{conflict.checkpointDays}-day</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="size-4 text-muted-foreground" />
                            <StatusBadge status={(conflict.traineeSource?.outcomeStatus ?? "UNKNOWN") as StatusKey} />
                          </div>
                          {conflict.claim.employerName && (
                            <p className="text-caption text-muted-foreground ml-6 flex items-center gap-1">
                              <Building2 className="size-3" /> {conflict.claim.employerName}
                            </p>
                          )}
                          {conflict.claim.role && (
                            <p className="text-caption text-muted-foreground ml-6">{conflict.claim.role}</p>
                          )}
                          {conflict.claim.salaryBand && (
                            <p className="text-caption text-muted-foreground ml-6 flex items-center gap-1">
                              <DollarSign className="size-3" /> {conflict.claim.salaryBand.replace("_", " ")}
                            </p>
                          )}
                          {conflict.claim.nonPlacementReason && (
                            <p className="text-caption text-muted-foreground ml-6">{conflict.claim.nonPlacementReason.replace("_", " ")}</p>
                          )}
                          <div className="ml-6">
                            <StatusBadge evidence={conflict.traineeSource?.evidenceLevel ?? 0} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Building2 className="size-4 text-danger-text" />
                            <StatusBadge status="REJECTED" />
                          </div>
                          {conflict.employerSource?.rejectionReason && (
                            <p className="text-caption text-danger-text ml-6">
                              Reason: {conflict.employerSource.rejectionReason}
                            </p>
                          )}
                          <div className="ml-6">
                            <StatusBadge evidence={conflict.employerSource?.evidenceLevel ?? 0} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-body-sm font-medium">Trainee</span>
                            <StatusBadge evidence={conflict.traineeSource?.evidenceLevel ?? 0} />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-body-sm font-medium text-danger-text">Employer</span>
                            <StatusBadge evidence={conflict.employerSource?.evidenceLevel ?? 0} />
                          </div>
                          <StatusBadge status="CONFLICT" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            {/* Pagination (§4.5 footer pattern) */}
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-caption text-muted-foreground">
                <span className="tabular-nums">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
