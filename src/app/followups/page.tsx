"use client";

import { useState, useEffect } from "react";
import { Filter, ChevronLeft, ChevronRight, X, RefreshCw, Send, Clock, CheckCircle, AlertTriangle, XCircle, FastForward } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "~/components/ui/table";
import { ScrollArea } from "~/components/ui/scroll-area";
import { format } from "date-fns";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

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

export default function FollowupsPage() {
  const [followups, setFollowups] = useState<FollowupEvent[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  const fetchFollowups = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`/api/v1/followups?${params}`);
      const data = await res.json();
      setFollowups(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      console.error("Failed to fetch follow-ups:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCohortsAndProgrammes = async () => {
    try {
      const cohortsRes = await fetch("/api/v1/cohorts?limit=100");
      const cohortsData = await cohortsRes.json();
      const cohortsList = cohortsData.data || [];
      setCohorts(cohortsList.map((c: any) => ({ id: c.id, name: c.name })));
      
      // Extract unique programmes
      const programmeMap = new Map();
      cohortsList.forEach((c: any) => {
        if (c.programme) {
          programmeMap.set(c.programme.id, c.programme.name);
        }
      });
      setProgrammes(Array.from(programmeMap.entries()).map(([id, name]) => ({ id, name })));
    } catch (err) {
      console.error("Failed to fetch cohorts/programmes:", err);
    }
  };

  useEffect(() => {
    fetchCohortsAndProgrammes();
    fetchFollowups();
  }, [pagination.page, filters.status, filters.checkpointDays, filters.cohortId, filters.programmeId, filters.traineeSearch, filters.fromDate, filters.toDate]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ status: "", checkpointDays: "", cohortId: "", programmeId: "", traineeSearch: "", fromDate: "", toDate: "" });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = Object.values(filters).some((v) => v);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline" | "success"> = {
      SCHEDULED: "secondary",
      SENT: "default",
      RESPONDED: "success",
      FAILED: "destructive",
      EXPIRED: "destructive",
    };
    const icons: Record<string, React.ReactNode> = {
      SCHEDULED: <Clock className="h-3 w-3" />,
      SENT: <Send className="h-3 w-3" />,
      RESPONDED: <CheckCircle className="h-3 w-3" />,
      FAILED: <AlertTriangle className="h-3 w-3" />,
      EXPIRED: <XCircle className="h-3 w-3" />,
    };
    return (
      <Badge variant={variants[status] || "outline"} className="gap-1">
        {icons[status] || null}
        {status}
      </Badge>
    );
  };

  const getBotSessionState = (sessions: FollowupEvent["botSessions"]) => {
    if (!sessions?.[0]) return null;
    const state = sessions[0].state;
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline" | "success"> = {
      AWAITING_STATUS: "secondary",
      AWAITING_EMPLOYER_NAME: "default",
      AWAITING_ROLE: "default",
      AWAITING_SALARY_BAND: "default",
      AWAITING_NON_PLACEMENT_REASON: "default",
      AWAITING_RETENTION_STATUS: "secondary",
      AWAITING_RETENTION_SALARY_BAND: "default",
      DONE: "success",
    };
    return (
      <Badge variant={variants[state] || "outline"} className="gap-1">
        {state.replace(/_/g, " ")}
      </Badge>
    );
  };

  const advanceClock = async () => {
    const days = prompt("How many days to advance? (default: 1)", "1");
    if (days === null) return;
    const d = parseInt(days, 10);
    if (isNaN(d) || d < 1) {
      alert("Please enter a valid number of days");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/v1/demo/advance-clock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: d }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchFollowups();
      } else {
        alert("Failed to advance clock: " + (data.error?.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Failed to advance clock:", err);
      alert("Failed to advance clock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Follow-up Operations</h1>
          <p className="text-muted-foreground">
            Monitor and manage all follow-up events across cohorts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={advanceClock} disabled={loading} className="gap-2">
            <FastForward className="h-4 w-4" />
            Advance Clock
          </Button>
          <Button variant="outline" onClick={fetchFollowups} disabled={loading} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          </div>

          <div className="grid gap-4 md:grid-cols-3 mt-4">
            <Input
              placeholder="Search trainee (name, ID, phone)"
              value={filters.traineeSearch}
              onChange={(e) => handleFilterChange("traineeSearch", e.target.value)}
              className="md:col-span-2"
            />
            <div className="flex gap-2">
              <Input
                type="datetime-local"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                placeholder="From date"
              />
              <Input
                type="datetime-local"
                value={filters.toDate}
                onChange={(e) => handleFilterChange("toDate", e.target.value)}
                placeholder="To date"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4">
              <Button variant="outline" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear all filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Follow-ups Table */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p>Loading follow-ups...</p>
          </CardContent>
        </Card>
      ) : followups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Send className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">No follow-ups found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or trigger a new follow-up.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Follow-up Events ({pagination.total})</CardTitle>
              <CardDescription>
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} events
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                              <p className="text-xs text-muted-foreground">{fu.trainee.publicId}</p>
                              <p className="text-xs text-muted-foreground">{fu.trainee.district}</p>
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
                                <p className="text-xs text-muted-foreground">{fu.cohort.programme.name}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{fu.checkpointDays}-day</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(fu.status)}</TableCell>
                        <TableCell>{getBotSessionState(fu.botSessions)}</TableCell>
                        <TableCell>
                          {fu.sentAt ? format(new Date(fu.sentAt), "yyyy-MM-dd HH:mm") : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {fu.respondedAt ? format(new Date(fu.respondedAt), "yyyy-MM-dd HH:mm") : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{format(new Date(fu.createdAt), "yyyy-MM-dd HH:mm")}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}