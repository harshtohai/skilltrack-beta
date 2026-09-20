"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, AlertCircle, Building2, User, MapPin, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "~/components/ui/table";
import { ScrollArea } from "~/components/ui/scroll-area";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable react-hooks/exhaustive-deps */

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

export default function ConflictsPage() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCohortId, setSelectedCohortId] = useState("");
  const [cohorts, setCohorts] = useState<Array<{ id: string; name: string }>>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  const fetchConflicts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (selectedCohortId) params.append("cohortId", selectedCohortId);

      const res = await fetch(`/api/v1/conflicts?${params}`);
      const data = await res.json();
      setConflicts(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      console.error("Failed to fetch conflicts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCohorts = async () => {
    try {
      const res = await fetch("/api/v1/cohorts?limit=100");
      const data = await res.json();
      setCohorts(data.data || []);
    } catch (err) {
      console.error("Failed to fetch cohorts:", err);
    }
  };

  useEffect(() => {
    fetchCohorts();
    fetchConflicts();
  }, [pagination.page, selectedCohortId]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline" | "success"> = {
      EMPLOYED: "success",
      SELF_EMPLOYED: "success",
      APPRENTICE: "success",
      LOOKING: "secondary",
      NOT_WORKING: "destructive",
      UNKNOWN: "outline",
      CONFLICT: "destructive",
    };
    return (
      <Badge variant={variants[status] || "outline"}>{status.replace("_", " ")}</Badge>
    );
  };

  const getEvidenceBadge = (level: number) => {
    const labels: Record<number, string> = {
      0: "UNKNOWN",
      1: "SELF_REPORTED",
      2: "PROVIDER_CONFIRMED",
      3: "EMPLOYER_CONFIRMED",
      4: "DOCUMENT_VERIFIED",
      5: "SYSTEM_VERIFIED",
    };
    const variants: Record<number, "default" | "secondary" | "destructive" | "outline" | "success"> = {
      0: "outline",
      1: "secondary",
      2: "default",
      3: "success",
      4: "success",
      5: "success",
    };
    return (
      <Badge variant={variants[level] || "outline"}>
        Level {level}: {labels[level] || "UNKNOWN"}
      </Badge>
    );
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Conflict Queue</h1>
          <p className="text-muted-foreground">
            Employment claims where trainee and employer sources disagree
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedCohortId} onValueChange={setSelectedCohortId}>
            <SelectTrigger className="w-[200px]">
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
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p>Loading conflicts...</p>
          </CardContent>
        </Card>
      ) : conflicts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">No conflicts found</h3>
            <p className="text-muted-foreground">
              All employer verifications are either confirmed or pending.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Conflicts ({pagination.total})</CardTitle>
              <CardDescription>
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} conflicts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[80px]">Trainee</TableHead>
                      <TableHead className="w-[150px]">Cohort</TableHead>
                      <TableHead className="w-[100px]">Checkpoint</TableHead>
                      <TableHead className="w-[200px]">Trainee Says</TableHead>
                      <TableHead className="w-[200px]">Employer Says</TableHead>
                      <TableHead className="w-[100px]">Evidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conflicts.map((conflict) => (
                      <TableRow key={conflict.id} className="border-t hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <p className="font-medium">{conflict.trainee.fullName}</p>
                            <p className="text-xs text-muted-foreground">{conflict.trainee.publicId}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {conflict.trainee.district}
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
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{getStatusBadge(conflict.traineeSource?.outcomeStatus || "UNKNOWN")}</span>
                            </div>
                            {conflict.claim.employerName && (
                              <p className="text-xs text-muted-foreground ml-6 flex items-center gap-1">
                                <Building2 className="h-3 w-3" /> {conflict.claim.employerName}
                              </p>
                            )}
                            {conflict.claim.role && (
                              <p className="text-xs text-muted-foreground ml-6">{conflict.claim.role}</p>
                            )}
                            {conflict.claim.salaryBand && (
                              <p className="text-xs text-muted-foreground ml-6 flex items-center gap-1">
                                <DollarSign className="h-3 w-3" /> {conflict.claim.salaryBand.replace("_", " ")}
                              </p>
                            )}
                            {conflict.claim.nonPlacementReason && (
                              <p className="text-xs text-muted-foreground ml-6">{conflict.claim.nonPlacementReason.replace("_", " ")}</p>
                            )}
                            <div className="ml-6">
                              {getEvidenceBadge(conflict.traineeSource?.evidenceLevel || 0)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-destructive" />
                              <span className="font-medium text-sm text-destructive">REJECTED</span>
                            </div>
                            {conflict.employerSource?.rejectionReason && (
                              <p className="text-xs text-destructive ml-6">
                                Reason: {conflict.employerSource.rejectionReason}
                              </p>
                            )}
                            <div className="ml-6">
                              {getEvidenceBadge(conflict.employerSource?.evidenceLevel || 0)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">
                              Trainee: {getEvidenceBadge(conflict.traineeSource?.evidenceLevel || 0)}
                            </p>
                            <p className="text-sm font-medium text-destructive">
                              Employer: {getEvidenceBadge(conflict.employerSource?.evidenceLevel || 0)}
                            </p>
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              CONFLICT
                            </Badge>
                          </div>
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