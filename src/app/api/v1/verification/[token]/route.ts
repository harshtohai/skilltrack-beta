import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { createErrorResponse, handleZodError } from "~/app/api/v1/_utils";
import crypto from "crypto";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const verifySchema = z.object({
  action: z.enum(["confirm", "reject"]),
  reason: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token || token.length < 32) {
      return createErrorResponse("INVALID_TOKEN", "Invalid verification token", 400);
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const verificationRequest = await db.verificationRequest.findUnique({
      where: { tokenHash },
      include: {
        employmentClaim: {
          include: {
            trainee: true,
            followupEvent: true,
          },
        },
      },
    });

    if (!verificationRequest) {
      return createErrorResponse("NOT_FOUND", "Verification link not found", 404);
    }

    if (verificationRequest.usedAt) {
      return createErrorResponse("EXPIRED", "This verification link has already been used", 410);
    }

    if (new Date() > verificationRequest.expiresAt) {
      return createErrorResponse("EXPIRED", "This verification link has expired", 410);
    }

    const claim = verificationRequest.employmentClaim;
    const trainee = claim.trainee;

    return NextResponse.json({
      token: token, // Only return token for frontend to use in POST
      claim: {
        id: claim.id,
        traineeFirstName: trainee.fullName.split(" ")[0],
        employerName: claim.employerName,
        role: claim.role,
        startDate: claim.followupEvent?.createdAt ? claim.followupEvent.createdAt.toISOString().split("T")[0] : null,
        salaryBand: claim.salaryBand,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("GET /api/v1/verification/[token] error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch verification details", 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const data = verifySchema.parse(body);

    if (!token || token.length < 32) {
      return createErrorResponse("INVALID_TOKEN", "Invalid verification token", 400);
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const verificationRequest = await db.verificationRequest.findUnique({
      where: { tokenHash },
      include: {
        employmentClaim: {
          include: { trainee: true, followupEvent: true },
        },
      },
    });

    if (!verificationRequest) {
      return createErrorResponse("NOT_FOUND", "Verification link not found", 404);
    }

    if (verificationRequest.usedAt) {
      return createErrorResponse("EXPIRED", "This verification link has already been used", 410);
    }

    if (new Date() > verificationRequest.expiresAt) {
      return createErrorResponse("EXPIRED", "This verification link has expired", 410);
    }

    const claim = verificationRequest.employmentClaim;
    const now = new Date();

    if (data.action === "confirm") {
      await db.$transaction(async (tx) => {
        await tx.employmentClaim.update({
          where: { id: claim.id },
          data: {
            verificationStatus: "EMPLOYER_CONFIRMED",
            evidenceLevel: 3,
          },
        });

        // Infer outcomeStatus from claim data
        const inferredOutcomeStatus = claim.employerName
          ? "EMPLOYED"
          : claim.nonPlacementReason
            ? "NOT_WORKING"
            : "UNKNOWN";

        await tx.outcomeEvent.create({
          data: {
            traineeId: claim.traineeId,
            employmentClaimId: claim.id,
            checkpointDays: claim.followupEvent?.checkpointDays || 30,
            outcomeStatus: inferredOutcomeStatus as any,
            verificationStatus: "EMPLOYER_CONFIRMED",
            source: "EMPLOYER",
            evidenceLevel: 3,
          },
        });

        await tx.verificationRequest.update({
          where: { id: verificationRequest.id },
          data: {
            usedAt: now,
            action: "CONFIRMED",
          },
        });

        await tx.auditEvent.create({
          data: {
            entityType: "employment_claim",
            entityId: claim.id,
            action: "EMPLOYER_CONFIRMED",
            actorType: "EMPLOYER",
            metadata: { verificationRequestId: verificationRequest.id },
          },
        });
      });

      return NextResponse.json({ success: true, status: "confirmed" });
    } else {
      await db.$transaction(async (tx) => {
        await tx.employmentClaim.update({
          where: { id: claim.id },
          data: {
            verificationStatus: "CONFLICT",
            evidenceLevel: 3,
          },
        });

        // Infer outcomeStatus from claim data
        const inferredOutcomeStatus = claim.employerName
          ? "EMPLOYED"
          : claim.nonPlacementReason
            ? "NOT_WORKING"
            : "UNKNOWN";

        await tx.outcomeEvent.create({
          data: {
            traineeId: claim.traineeId,
            employmentClaimId: claim.id,
            checkpointDays: claim.followupEvent?.checkpointDays || 30,
            outcomeStatus: inferredOutcomeStatus as any,
            verificationStatus: "CONFLICT",
            source: "EMPLOYER",
            evidenceLevel: 3,
          },
        });

        await tx.verificationRequest.update({
          where: { id: verificationRequest.id },
          data: {
            usedAt: now,
            action: "REJECTED",
            rejectionReason: data.reason,
          },
        });

        await tx.auditEvent.create({
          data: {
            entityType: "employment_claim",
            entityId: claim.id,
            action: "EMPLOYER_REJECTED",
            actorType: "EMPLOYER",
            metadata: { verificationRequestId: verificationRequest.id, reason: data.reason },
          },
        });
      });

      return NextResponse.json({ success: true, status: "rejected" });
    }
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/verification/[token] error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to process verification", 500);
  }
}