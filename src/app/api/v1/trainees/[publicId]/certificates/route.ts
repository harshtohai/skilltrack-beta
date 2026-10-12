import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { getSessionScope } from "~/server/scope";
import { createErrorResponse, routeErrorResponse } from "~/app/api/v1/_utils";
import { CertificateActionError, issueCertificate } from "~/server/certificate-actions";

export const dynamic = "force-dynamic";

const textField = z.string().trim().min(1).max(200);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
const issueSchema = z.object({
  name: textField,
  issuer: textField,
  issueDate: isoDate,
  expiryDate: isoDate.optional(),
});

/**
 * T3 (spec #102): institute/admin certificate surface for one trainee.
 * GET lists the trainee's certificates (institute: own center's trainees only,
 * INST-01). POST issues an ad-hoc ISSUED certificate — born VERIFIED per
 * ADR-002 — with an optional file obeying the same upload rules as trainees.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return createErrorResponse("UNAUTHORIZED", "Session required", 401);
    const scope = await getSessionScope();
    if (scope.role !== "admin" && scope.role !== "institute") {
      return createErrorResponse("FORBIDDEN", "Admin or institute role required", 403);
    }

    const { publicId } = await params;
    const trainee = await db.trainee.findUnique({
      where: { publicId },
      include: { enrolments: { include: { cohort: true } } },
    });
    if (!trainee) return createErrorResponse("NOT_FOUND", "Trainee not found", 404);
    if (scope.role === "institute") {
      const inScope = trainee.enrolments.some((e) => e.cohort.trainingCenterId === scope.centerId);
      if (!inScope) return createErrorResponse("FORBIDDEN", "This trainee is not enrolled in your center's cohorts", 403);
    }

    const certificates = await db.certificate.findMany({
      where: { traineeId: trainee.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, issuer: true, issueDate: true, expiryDate: true,
        source: true, status: true, rejectionReason: true, reviewedAt: true, fileUrl: true, fileKey: true,
      },
    });

    return NextResponse.json({
      certificates: certificates.map((c) => ({
        id: c.id,
        name: c.name,
        issuer: c.issuer,
        issueDate: c.issueDate,
        expiryDate: c.expiryDate,
        source: c.source,
        status: c.status,
        rejectionReason: c.rejectionReason,
        reviewedAt: c.reviewedAt,
        fileUrl: c.fileUrl,
        hasFile: Boolean(c.fileKey),
      })),
    });
  } catch (error) {
    console.error("GET /api/v1/trainees/[publicId]/certificates error:", error);
    return routeErrorResponse("Failed to load certificates", error);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return createErrorResponse("UNAUTHORIZED", "Session required", 401);
    const scope = await getSessionScope();
    if (scope.role !== "admin" && scope.role !== "institute") {
      return createErrorResponse("FORBIDDEN", "Admin or institute role required", 403);
    }

    const { publicId } = await params;
    const trainee = await db.trainee.findUnique({
      where: { publicId },
      include: { enrolments: { include: { cohort: true } } },
    });
    if (!trainee) return createErrorResponse("NOT_FOUND", "Trainee not found", 404);
    if (scope.role === "institute") {
      const inScope = trainee.enrolments.some((e) => e.cohort.trainingCenterId === scope.centerId);
      if (!inScope) return createErrorResponse("FORBIDDEN", "This trainee is not enrolled in your center's cohorts", 403);
    }

    const form = await request.formData();
    const expiryRaw = form.get("expiryDate");
    const parsed = issueSchema.safeParse({
      name: form.get("name"),
      issuer: form.get("issuer"),
      issueDate: form.get("issueDate"),
      expiryDate: typeof expiryRaw === "string" && expiryRaw.length > 0 ? expiryRaw : undefined,
    });
    if (!parsed.success) {
      return createErrorResponse("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    const file = form.get("file");
    const fileBytes = file instanceof File && file.size > 0
      ? { bytes: Buffer.from(await file.arrayBuffer()), mimeType: file.type }
      : null;

    const certificate = await issueCertificate({
      traineeId: trainee.id,
      name: parsed.data.name,
      issuer: parsed.data.issuer,
      issueDate: new Date(parsed.data.issueDate),
      expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : null,
      file: fileBytes,
      actorRole: scope.role,
      actorId: session.user.id,
    });

    return NextResponse.json({ certificate: { id: certificate.id, status: certificate.status } }, { status: 201 });
  } catch (error) {
    if (error instanceof CertificateActionError) {
      return createErrorResponse(error.code, error.message, error.status);
    }
    console.error("POST /api/v1/trainees/[publicId]/certificates error:", error);
    return routeErrorResponse("Failed to issue certificate", error);
  }
}
