"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Send, FastForward } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { PageHeader } from "~/components/patterns/page-header";
import { FilterBar } from "~/components/patterns/filter-bar";
import { EmptyState } from "~/components/patterns/empty-state";
import { ErrorState } from "~/components/patterns/error-state";
import { Skeleton } from "~/components/patterns/skeleton";
import { StatusBadge } from "~/components/patterns/status-badge";
import { Input } from "~/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "~/components/ui/table";
import { ScrollArea } from "~/components/ui/scroll-area";
import { datetime } from "~/lib/format";

interface FollowupEvent {
  id: string;
  checkpointDays: number;
  status: "SCHEDULED" | "SENT" | "RESPONDED" | "FAILED" | "EXPIRED";
  channel: string;
  sentAt: string | null;
  respondedAt: string | null;
  createdAt: string;
  trainee: {
    id: string;
    publicId: string;
    fullName: string;
    phoneE164: string;
    district: string;
  } | null;
  cohort: {
    id: string;
    name: string;
    programmeId: string;
    programme: { id: string; name: string } | null;
  } | null;
  botSessions: Array<{
    id: string;
    state: string;
    createdAt: string;
  }>;
}

interface FollowupsResponse {
  data?: FollowupEvent[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

const EMPTY_PAGINATION = { page: 1, limit: 20, total: 0, totalPages: 0 };

/** Bot session states are workflow steps, not domain statuses — neutral Badge. */
function BotSessionBadge({ sessions }: { sessions: FollowupEvent["botSessions"] }) {
  const state = sessions?.[0]?.state;
  if (!state) return <span className="text-muted-foreground">—</span>;
  return (
    <Badge variant="secondary" className="gap-1">
      {state.replace(/_/g, " ")}
    </Badge>
  );
}

/**
 * Follow-up operations per design §9.4 — Shell S1. FilterBar (status /
 * checkpoint / cohort / programme / search / date range), server-paginated
 * table in a ScrollArea, statuses via StatusBadge (§4.10/CL-12).
 */
export default function FollowupsPage() {
  const [followups, setFollowups] = useState<FollowupEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    checkpointDays: "",
    cohortId: "",
    programmeId: "",
    traineeSearch: "",
    fromDate: "",
    toDate: "",
  });
  const [cohorts, setCohorts] = useState<Array<{ id: string; name: string }>>([]);
  const [programmes, setProgrammes] = useState<Array<{ id: string; name: string }>>([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [clockOpen, setClockOpen] = useState(false);
  const [clockDays, setClockDays] = useState("1");

  const fetchFollowups = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`/api/v1/followups?${params}`);
      const data = (await res.json()) as FollowupsResponse;
      setFollowups(data.data ?? []);
      setPagination(data.pagination ?? EMPTY_PAGINATION);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  const fetchCohortsAndProgrammes = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/cohorts?limit=100");
      const data = (await res.json()) as {
        data?: Array<{ id: string; name: string; programme?: { id: string; name: string } }>;
      };
      const cohortsList = data.data ?? [];
      setCohorts(cohortsList.map((c) => ({ id: c.id, name: c.name })));

      // Extract unique programmes
      const programmeMap = new Map<string, string>();
      cohortsList.forEach((c) => {
        if (c.programme) programmeMap.set(c.programme.id, c.programme.name);
      });
      setProgrammes(Array.from(programmeMap.entries()).map(([id, name]) => ({ id, name })));
    } catch {
      // non-critical — the filters just stay empty
    }
  }, []);

  useEffect(() => {
    void fetchCohortsAndProgrammes();
  }, [fetchCohortsAndProgrammes]);

  useEffect(() => {
    void fetchFollowups();
  }, [fetchFollowups]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ status: "", checkpointDays: "", cohortId: "", programmeId: "", traineeSearch: "", fromDate: "", toDate: "" });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = Object.values(filters).some((v) => v);

  const advanceClock = async () => {
    const d = parseInt(clockDays, 10);
    if (isNaN(d) || d < 1) {
      toast.error("Please enter a valid number of days");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/v1/demo/advance-clock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: d }),
      });
      const json = (await res.json()) as { success?: boolean; message?: string; error?: { message?: string } };
      if (json.success) {
        toast.success(json.message ?? "Clock advanced");
        setClockOpen(false);
        void fetchFollowups();
      } else {
        toast.error("Failed to advance clock: " + (json.error?.message ?? "Unknown error"));
      }
    } catch {
      toast.error("Failed to advance clock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Follow-up Operations"
        caption="Monitor and manage all follow-up events across cohorts"
        actions={
          <>
            <AlertDialog
              open={clockOpen}
              onOpenChange={(open) => {
                setClockOpen(open);
                if (open) setClockDays("1");
              }}
            >
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={loading}>
                  <FastForward />
                  Advance clock
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Advance the demo clock</AlertDialogTitle>
                  <AlertDialogDescription>
                    Fast-forwards the simulation clock to trigger scheduled follow-ups. This affects demo data only.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Input
                  type="number"
                  min={1}
                  value={clockDays}
                  onChange={(e) => setClockDays(e.target.value)}
                  aria-label="Days to advance"
                />
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      // stay open on validation failure; close on success
                      e.preventDefault();
                      void advanceClock();
                    }}
                  >
                    Advance
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="ghost" onClick={fetchFollowups} disabled={loading} aria-label="Refresh">
              <RefreshCw />
            </Button>
          </>
        }
      />

      <FilterBar
        className="mb-6"
        onClear={hasActiveFilters ? clearFilters : undefined}
      >
        <Select value={filters.status} onValueChange={(v) => handleFilterChange("status", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="RESPONDED">Responded</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.checkpointDays} onValueChange={(v) => handleFilterChange("checkpointDays", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Checkpoint" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All checkpoints</SelectItem>
            <SelectItem value="30">30-day</SelectItem>
            <SelectItem value="90">90-day</SelectItem>
            <SelectItem value="180">180-day</SelectItem>
            <SelectItem value="365">365-day</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.cohortId} onValueChange={(v) => handleFilterChange("cohortId", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Cohort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All cohorts</SelectItem>
            {cohorts.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.programmeId} onValueChange={(v) => handleFilterChange("programmeId", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Programme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All programmes</SelectItem>
            {programmes.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Search trainee (name, ID, phone)"
          value={filters.traineeSearch}
          onChange={(e) => handleFilterChange("traineeSearch", e.target.value)}
          className="lg:col-span-2"
          aria-label="Search trainees"
        />
        <div className="flex gap-2 lg:col-span-2">
          <Input
            type="datetime-local"
            value={filters.fromDate}
            onChange={(e) => handleFilterChange("fromDate", e.target.value)}
            placeholder="From date"
            className="flex-1"
            aria-label="From date"
          />
          <Input
            type="datetime-local"
            value={filters.toDate}
            onChange={(e) => handleFilterChange("toDate", e.target.value)}
            placeholder="To date"
            className="flex-1"
            aria-label="To date"
          />
        </div>
      </FilterBar>

      {loading ? (
        <Card className="p-5">
          <CardHeader className="p-0">
            <CardTitle>Loading follow-ups…</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <div className="space-y-4">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="p-5">
          <ErrorState
            title="Could not load follow-ups"
            description="Check your connection and try again."
            onRetry={fetchFollowups}
          />
        </Card>
      ) : followups.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon={<Send />}
            title="No follow-ups found"
            description="Try adjusting your filters or trigger a new follow-up."
          />
        </Card>
      ) : (
        <Card className="p-5">
          <CardHeader className="p-0">
            <CardTitle>Follow-up events ({pagination.total})</CardTitle>
            <CardDescription>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} events
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <ScrollArea className="h-[600px] w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[80px]">Trainee</TableHead>
                    <TableHead className="w-[150px]">Cohort / Programme</TableHead>
                    <TableHead className="w-[100px]">Checkpoint</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[140px]">Bot Session</TableHead>
                    <TableHead className="w-[160px]">Sent At</TableHead>
                    <TableHead className="w-[160px]">Responded At</TableHead>
                    <TableHead className="w-[160px]">Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {followups.map((fu) => (
                    <TableRow key={fu.id} className="border-t hover:bg-muted/50">
                      <TableCell>
                        {fu.trainee ? (
                          <div>
                            <p className="font-medium">{fu.trainee.fullName}</p>
                            <p className="text-caption text-muted-foreground">{fu.trainee.publicId}</p>
                            <p className="text-caption text-muted-foreground">{fu.trainee.district}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {fu.cohort ? (
                          <div>
                            <p className="font-medium">{fu.cohort.name}</p>
                            {fu.cohort.programme && (
                              <p className="text-caption text-muted-foreground">{fu.cohort.programme.name}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{fu.checkpointDays}-day</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={fu.status} />
                      </TableCell>
                      <TableCell>
                        <BotSessionBadge sessions={fu.botSessions} />
                      </TableCell>
                      <TableCell>
                        {fu.sentAt ? <span className="tabular-nums">{datetime(fu.sentAt)}</span> : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {fu.respondedAt ? <span className="tabular-nums">{datetime(fu.respondedAt)}</span> : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <span className="text-caption text-muted-foreground tabular-nums">{datetime(fu.createdAt)}</span>
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
