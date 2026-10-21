import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { getSessionScope } from "~/server/scope";
import { createErrorResponse, routeErrorResponse } from "~/app/api/v1/_utils";
import { CertificateActionError, issueCertificate } from "~/server/certificate-actions";

export const dynamic = "force-dynamic";

const MAX_ROWS = 500;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export interface ImportRowResult {
  row: number;
  publicId: string;
  status: "created" | "skipped" | "error";
  message?: string;
}

/** Minimal quote-aware CSV line splitter ("Issuer, Inc." stays one field). */
function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

/**
 * Bulk CSV certificate import (issue #114): one row per certificate —
 * `publicId,name,issuer,issueDate[,expiryDate]`. Institute is center-scoped
 * (INST-01): rows naming trainees outside the center's cohorts are row
 * errors, never silent creations. Rows whose (trainee, name, issuer, issue
 * date) already exist are skipped, making re-uploads idempotent. Created
 * certificates are ISSUED (born VERIFIED, ADR-003) with the per-certificate
 * audit trail of the single-issuance path.
 *
 * NOTE: the middleware treats POST /api/v1/trainees* as public (self-signup
 * exemption), so the session + role check below is the real gate.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return createErrorResponse("UNAUTHORIZED", "Session required", 401);
    const scope = await getSessionScope();
    if (scope.role !== "admin" && scope.role !== "institute") {
      return createErrorResponse("FORBIDDEN", "Admin or institute role required", 403);
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return createErrorResponse("VALIDATION_ERROR", "Attach a CSV file", 400);
    }
    if (file.size > 1024 * 1024) {
      return createErrorResponse("VALIDATION_ERROR", "The CSV is larger than 1 MB", 400);
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      return createErrorResponse("VALIDATION_ERROR", "The CSV needs a header row and at least one data row", 400);
    }
    const dataLines = lines.slice(1);
    if (dataLines.length > MAX_ROWS) {
      return createErrorResponse("VALIDATION_ERROR", `The CSV has more than ${MAX_ROWS} data rows`, 400);
    }

    const publicIds = [...new Set(dataLines.map((l) => splitCsvLine(l)[0] ?? "").filter(Boolean))];
    const trainees = await db.trainee.findMany({
      where: { publicId: { in: publicIds } },
      include: { enrolments: { include: { cohort: true } } },
    });
    const traineeByPublicId = new Map(trainees.map((t) => [t.publicId, t]));
    const inScope = (publicId: string): boolean => {
      const t = traineeByPublicId.get(publicId);
      if (!t) return false;
      if (scope.role === "admin") return true;
      return t.enrolments.some((e) => e.cohort.trainingCenterId === scope.centerId);
    };

    const existing = await db.certificate.findMany({
      where: { traineeId: { in: trainees.map((t) => t.id) } },
      select: { traineeId: true, name: true, issuer: true, issueDate: true },
    });
    const existingKeys = new Set(
      existing.map((c) => `${c.traineeId}|${c.name}|${c.issuer}|${c.issueDate.toISOString().slice(0, 10)}`)
    );

    const results: ImportRowResult[] = [];
    let created = 0;
    let skipped = 0;

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      if (line === undefined) continue;
      const rowNumber = i + 2; // +1 for the header row
      const fields = splitCsvLine(line);
      const [publicId, name, issuer, issueDateRaw, expiryDateRaw] = fields;
      const fail = (message: string): void => {
        results.push({ row: rowNumber, publicId: publicId ?? "", status: "error", message });
      };

      if (!publicId || !name || !issuer || !issueDateRaw) {
        fail("Required columns: publicId, name, issuer, issueDate");
        continue;
      }
      const trainee = traineeByPublicId.get(publicId);
      if (!trainee) {
        fail(`No trainee with ID ${publicId}`);
        continue;
      }
      if (!inScope(publicId)) {
        fail("Trainee is not enrolled in your center's cohorts");
        continue;
      }
      if (!ISO_DATE.test(issueDateRaw) || Number.isNaN(new Date(issueDateRaw).getTime())) {
        fail("issueDate must be YYYY-MM-DD");
        continue;
      }
      if (expiryDateRaw && (!ISO_DATE.test(expiryDateRaw) || Number.isNaN(new Date(expiryDateRaw).getTime()))) {
        fail("expiryDate must be YYYY-MM-DD");
        continue;
      }
      const key = `${trainee.id}|${name}|${issuer}|${issueDateRaw}`;
      if (existingKeys.has(key)) {
        skipped++;
        results.push({ row: rowNumber, publicId, status: "skipped", message: "Already exists" });
        continue;
      }

      try {
        await issueCertificate({
          traineeId: trainee.id,
          name,
          issuer,
          issueDate: new Date(issueDateRaw),
          expiryDate: expiryDateRaw ? new Date(expiryDateRaw) : null,
          file: null,
          actorRole: scope.role,
          actorId: session.user.id,
        });
        existingKeys.add(key);
        created++;
        results.push({ row: rowNumber, publicId, status: "created" });
      } catch (error) {
        if (error instanceof CertificateActionError) {
          fail(error.message);
        } else {
          throw error;
        }
      }
    }

    await db.auditEvent.create({
      data: {
        entityType: "Certificate",
        entityId: session.user.id,
        action: "CERTIFICATES_IMPORTED",
        actorType: scope.role === "admin" ? "ADMIN" : "SYSTEM",
        actorId: session.user.id,
        metadata: { created, skipped, errors: results.filter((r) => r.status === "error").length, role: scope.role },
      },
    });

    return NextResponse.json({ created, skipped, results });
  } catch (error) {
    console.error("POST /api/v1/trainees/import-certificates error:", error);
    return routeErrorResponse("Failed to import certificates", error);
  }
}
