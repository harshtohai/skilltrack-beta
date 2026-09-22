import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

const auditLogsQuerySchema = z.object({
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  action: z.string().optional(),
  actorType: z.enum(["ADMIN", "TRAINEE", "EMPLOYER", "SYSTEM"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = auditLogsQuerySchema.parse(Object.fromEntries(searchParams));

    const where: Record<string, unknown> = {};

    if (query.entityType) where.entityType = query.entityType;
    if (query.entityId) where.entityId = query.entityId;
    if (query.action) where.action = query.action;
    if (query.actorType) where.actorType = query.actorType;
    if (query.fromDate || query.toDate) {
      where.createdAt = {};
      if (query.fromDate) (where.createdAt as Record<string, Date>).gte = new Date(query.fromDate);
      if (query.toDate) (where.createdAt as Record<string, Date>).lte = new Date(query.toDate);
    }

    const [auditLogs, total] = await Promise.all([
      db.auditEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      db.auditEvent.count({ where }),
    ]);

    // Get unique entity types and actions for filter dropdowns
    const [entityTypes, actions] = await Promise.all([
      db.auditEvent.groupBy({ by: ["entityType"], orderBy: { entityType: "asc" } }),
      db.auditEvent.groupBy({ by: ["action"], orderBy: { action: "asc" } }),
    ]);

    return NextResponse.json({
      data: auditLogs,
      filters: {
        entityTypes: entityTypes.map((e) => e.entityType),
        actions: actions.map((a) => a.action),
      },
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("GET /api/v1/audit-logs error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch audit logs", 500);
  }
}