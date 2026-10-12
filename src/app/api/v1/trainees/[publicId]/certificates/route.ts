import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { getSessionScope } from "~/server/scope";
import { createErrorResponse, routeErrorResponse } from "~/app/api/v1/_utils";
import { CertificateActionError, issueCertificate, getTraineeInCertificateScope } from "~/server/certificate-actions";

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
    const trainee = await getTraineeInCertificateScope(publicId, scope.role, scope.centerId);

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
        hasFile: c.fileKey !== null || c.fileUrl !== null,
      })),
    });
  } catch (error) {
    if (error instanceof CertificateActionError) {
      return createErrorResponse(error.code, error.message, error.status);
    }
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
    const trainee = await getTraineeInCertificateScope(publicId, scope.role, scope.centerId);

    const form = await request.formData();
    const rawExpiry = form.get("expiryDate");
    const parsed = issueSchema.safeParse({
      name: form.get("name"),
      issuer: form.get("issuer"),
      issueDate: form.get("issueDate"),
      expiryDate: typeof rawExpiry === "string" && rawExpiry ? rawExpiry : undefined,
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
