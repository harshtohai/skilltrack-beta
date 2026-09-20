"use client";

import { useState, useEffect } from "react";
import { Filter, ChevronLeft, ChevronRight, Database, User, Building2, Cpu, X } from "lucide-react";
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
/* eslint-disable react-hooks/exhaustive-deps */

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

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    entityType: "",
    action: "",
    actorType: "",
    fromDate: "",
    toDate: "",
  });
  const [availableFilters, setAvailableFilters] = useState({ entityTypes: [] as string[], actions: [] as string[] });
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`/api/v1/audit-logs?${params}`);
      const data = await res.json();
      setLogs(data.data || []);
      setAvailableFilters(data.filters || { entityTypes: [], actions: [] });
      setPagination(data.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 });
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filters.entityType, filters.action, filters.actorType, filters.fromDate, filters.toDate]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ entityType: "", action: "", actorType: "", fromDate: "", toDate: "" });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const getActorIcon = (type: string) => {
    switch (type) {
      case "ADMIN": return <Database className="h-4 w-4" />;
      case "TRAINEE": return <User className="h-4 w-4" />;
      case "EMPLOYER": return <Building2 className="h-4 w-4" />;
      case "SYSTEM": return <Cpu className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getActorBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline" | "success"> = {
      ADMIN: "default",
      TRAINEE: "success",
      EMPLOYER: "secondary",
      SYSTEM: "outline",
    };
    return <Badge variant={variants[type] || "outline"}>{type}</Badge>;
  };

  const hasActiveFilters = Object.values(filters).some((v) => v);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Audit Log Viewer</h1>
          <p className="text-muted-foreground">
            Immutable log of all state changes in the system
          </p>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
              />
              <Input
                type="datetime-local"
                value={filters.toDate}
                onChange={(e) => handleFilterChange("toDate", e.target.value)}
                placeholder="To date"
                className="flex-1"
              />
            </div>

            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p>Loading audit logs...</p>
          </CardContent>
        </Card>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">No audit logs found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or check back later.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs ({pagination.total})</CardTitle>
              <CardDescription>
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                          <p className="text-sm font-mono">{format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getActorIcon(log.actorType)}
                            {getActorBadge(log.actorType)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{log.action}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{log.entityType}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{log.entityId.slice(0, 8)}...</span>
                        </TableCell>
                        <TableCell>
                          <pre className="text-xs text-muted-foreground max-h-24 overflow-auto font-mono p-2 bg-muted/50 rounded">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
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