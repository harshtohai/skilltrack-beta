import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { createErrorResponse, handleZodError } from "~/app/api/v1/_utils";
import crypto from "crypto";

const verifySchema = z.object({
  token: z.string().min(32).max(64),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = verifySchema.parse(body);

    const tokenHash = crypto.createHash("sha256").update(data.token).digest("hex");

    const loginToken = await db.traineeLoginToken.findUnique({
      where: { tokenHash },
      include: {
        trainee: {
          include: {
            certificates: { orderBy: { issueDate: "desc" } },
            employmentHistory: { orderBy: { startDate: "desc" } },
            outcomeEvents: {
              orderBy: { createdAt: "desc" },
              include: { employmentClaim: true },
            },
            followupEvents: { orderBy: { checkpointDays: "asc" } },
          },
        },
      },
    });

    if (!loginToken) {
      return createErrorResponse("INVALID_TOKEN", "Invalid or expired magic link", 401);
    }

    if (loginToken.usedAt) {
      return createErrorResponse("TOKEN_USED", "This magic link has already been used", 401);
    }

    if (loginToken.expiresAt < new Date()) {
      return createErrorResponse("TOKEN_EXPIRED", "This magic link has expired", 401);
    }

    await db.traineeLoginToken.update({
      where: { id: loginToken.id },
      data: { usedAt: new Date() },
    });

    await db.auditEvent.create({
      data: {
        entityType: "trainee_login_token",
        entityId: loginToken.id,
        action: "LOGIN_USED",
        actorType: "TRAINEE",
        actorId: loginToken.traineeId,
        metadata: { traineeId: loginToken.traineeId },
      },
    });

    const trainee = loginToken.trainee;
    return NextResponse.json({
      trainee: {
        id: trainee.id,
        publicId: trainee.publicId,
        fullName: trainee.fullName,
        phoneE164: trainee.phoneE164,
        email: trainee.email,
        district: trainee.district,
        language: trainee.language,
        consentGiven: trainee.consentGiven,
        consentGivenAt: trainee.consentGivenAt?.toISOString() ?? null,
        consentMethod: trainee.consentMethod,
        certificates: trainee.certificates.map((c) => ({
          id: c.id,
          name: c.name,
          issuer: c.issuer,
          issueDate: c.issueDate.toISOString(),
          expiryDate: c.expiryDate?.toISOString() ?? null,
          fileUrl: c.fileUrl,
        })),
        employmentHistory: trainee.employmentHistory.map((e) => ({
          id: e.id,
          employer: e.employer,
          role: e.role,
          salaryBand: e.salaryBand,
          startDate: e.startDate.toISOString(),
          endDate: e.endDate?.toISOString() ?? null,
          isCurrent: e.isCurrent,
        })),
        outcomeEvents: trainee.outcomeEvents.map((o) => ({
          id: o.id,
          checkpointDays: o.checkpointDays,
          outcomeStatus: o.outcomeStatus,
          verificationStatus: o.verificationStatus,
          source: o.source,
          evidenceLevel: o.evidenceLevel,
          createdAt: o.createdAt.toISOString(),
          employmentClaim: o.employmentClaim
            ? {
                employerName: o.employmentClaim.employerName,
                role: o.employmentClaim.role,
                salaryBand: o.employmentClaim.salaryBand,
              }
            : null,
        })),
        followupEvents: trainee.followupEvents.map((f) => ({
          id: f.id,
          checkpointDays: f.checkpointDays,
          status: f.status,
          channel: f.channel,
          sentAt: f.sentAt?.toISOString() ?? null,
          respondedAt: f.respondedAt?.toISOString() ?? null,
        })),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/auth/trainee/verify error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to verify token", 500);
  }
}