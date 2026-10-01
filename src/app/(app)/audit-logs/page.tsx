"use client";

import { useState, useEffect, useCallback } from "react";
import { Database, User, Building2, Cpu, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { PageHeader } from "~/components/patterns/page-header";
import { FilterBar } from "~/components/patterns/filter-bar";
import { EmptyState } from "~/components/patterns/empty-state";
import { ErrorState } from "~/components/patterns/error-state";
import { Skeleton } from "~/components/patterns/skeleton";
import { Input } from "~/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "~/components/ui/table";
import { ScrollArea } from "~/components/ui/scroll-area";
import { datetime } from "~/lib/format";

interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorType: "ADMIN" | "TRAINEE" | "EMPLOYER" | "SYSTEM";
  actorId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface AuditLogsResponse {
  data?: AuditLog[];
  filters?: { entityTypes: string[]; actions: string[] };
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

const EMPTY_PAGINATION = { page: 1, limit: 50, total: 0, totalPages: 0 };

/** Actor types are not domain statuses — icon + neutral Badge (§4.10 note). */
function ActorBadge({ type }: { type: string }) {
  const icon =
    type === "ADMIN" ? <Database className="size-3.5" /> :
    type === "TRAINEE" ? <User className="size-3.5" /> :
    type === "EMPLOYER" ? <Building2 className="size-3.5" /> :
    type === "SYSTEM" ? <Cpu className="size-3.5" /> :
    <Database className="size-3.5" />;
  return (
    <Badge variant="secondary" className="gap-1">
      {icon}
      {type}
    </Badge>
  );
}

/**
 * Audit log viewer per design §9.4 — Shell S1. FilterBar (entity type /
 * action / actor type / date range), server-paginated table in a ScrollArea.
 */
export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filters, setFilters] = useState({
    entityType: "",
    action: "",
    actorType: "",
    fromDate: "",
    toDate: "",
  });
  const [availableFilters, setAvailableFilters] = useState({ entityTypes: [] as string[], actions: [] as string[] });
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);

  const fetchLogs = useCallback(async () => {
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

      const res = await fetch(`/api/v1/audit-logs?${params}`);
      const data = (await res.json()) as AuditLogsResponse;
      setLogs(data.data ?? []);
      setAvailableFilters(data.filters ?? { entityTypes: [], actions: [] });
      setPagination(data.pagination ?? EMPTY_PAGINATION);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ entityType: "", action: "", actorType: "", fromDate: "", toDate: "" });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = Object.values(filters).some((v) => v);

  return (
    <div>
      <PageHeader
        title="Audit Log Viewer"
        caption="Immutable log of all state changes in the system"
      />

      <FilterBar className="mb-6" onClear={hasActiveFilters ? clearFilters : undefined}>
        <Select value={filters.entityType} onValueChange={(v) => handleFilterChange("entityType", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Entity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All entity types</SelectItem>
            {availableFilters.entityTypes.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.action} onValueChange={(v) => handleFilterChange("action", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All actions</SelectItem>
            {availableFilters.actions.map((action) => (
              <SelectItem key={action} value={action}>{action}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.actorType} onValueChange={(v) => handleFilterChange("actorType", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Actor type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All actor types</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="TRAINEE">Trainee</SelectItem>
            <SelectItem value="EMPLOYER">Employer</SelectItem>
            <SelectItem value="SYSTEM">System</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
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
            <CardTitle>Loading audit logs…</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <div className="space-y-4">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-full flex-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="p-5">
          <ErrorState
            title="Could not load audit logs"
            description="Check your connection and try again."
            onRetry={fetchLogs}
          />
        </Card>
      ) : logs.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon={<Database />}
            title="No audit logs found"
            description="Try adjusting your filters or check back later."
          />
        </Card>
      ) : (
        <Card className="p-5">
          <CardHeader className="p-0">
            <CardTitle>Audit logs ({pagination.total})</CardTitle>
            <CardDescription>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <ScrollArea className="h-[600px] w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[160px]">Timestamp</TableHead>
                    <TableHead className="w-[120px]">Actor</TableHead>
                    <TableHead className="w-[140px]">Action</TableHead>
                    <TableHead className="w-[140px]">Entity Type</TableHead>
                    <TableHead className="w-[160px]">Entity ID</TableHead>
                    <TableHead>Metadata</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="border-t hover:bg-muted/50">
                      <TableCell>
                        <p className="text-body-sm font-mono tabular-nums">{datetime(log.createdAt)}</p>
                      </TableCell>
                      <TableCell>
                        <ActorBadge type={log.actorType} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.action}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-body-sm">{log.entityType}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-body-sm">{log.entityId.slice(0, 8)}…</span>
                      </TableCell>
                      <TableCell>
                        <pre className="text-caption text-muted-foreground max-h-24 overflow-auto font-mono p-2 bg-muted/50 rounded">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
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
