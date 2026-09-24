import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { createErrorResponse, handleZodError } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

const DISTRICTS = [
  "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad",
  "Solapur", "Amravati", "Kolhapur", "Sangli", "Satara",
  "Ahmednagar", "Jalgaon", "Latur", "Dhule", "Akola",
  "Wardha", "Chandrapur", "Yavatmal", "Buldhana", "Hingoli",
];

const patchSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  email: z.string().email().max(200).nullable().optional(),
  district: z.string().max(60).optional(),
  language: z.enum(["EN", "HI"]).optional(),
});

async function requireTrainee() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "trainee") return null;
  const trainee = await db.trainee.findUnique({
    where: { id: session.user.id },
    include: {
      certificates: { orderBy: { issueDate: "desc" } },
      employmentHistory: { orderBy: { startDate: "desc" } },
      outcomeEvents: {
        orderBy: { createdAt: "desc" },
        include: { employmentClaim: true },
      },
      followupEvents: { orderBy: { checkpointDays: "asc" } },
    },
  });
  return trainee;
}

export async function GET() {
  try {
    const trainee = await requireTrainee();
    if (!trainee) {
      return createErrorResponse("UNAUTHORIZED", "Trainee session required", 401);
    }

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
            ? { employerName: o.employmentClaim.employerName, role: o.employmentClaim.role, salaryBand: o.employmentClaim.salaryBand }
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
      districts: DISTRICTS,
    });
  } catch (error) {
    console.error("GET /api/v1/trainee/me error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch profile", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "trainee") {
      return createErrorResponse("UNAUTHORIZED", "Trainee session required", 401);
    }

    const body = (await request.json()) as unknown;
    const data = patchSchema.parse(body);

    // Only name/email/district/language are editable; phone, consent,
    // publicId and outcome data are locked.
    const update: {
      fullName?: string;
      email?: string | null;
      district?: string;
      language?: "EN" | "HI";
    } = {};
    if (data.fullName !== undefined) update.fullName = data.fullName.trim();
    if (data.email !== undefined) update.email = data.email?.toLowerCase().trim() ?? null;
    if (data.district !== undefined) update.district = data.district.trim();
    if (data.language !== undefined) update.language = data.language;

    if (Object.keys(update).length === 0) {
      return createErrorResponse("VALIDATION_ERROR", "No editable fields provided", 400);
    }

    const updated = await db.trainee.update({
      where: { id: session.user.id },
      data: update,
      select: { id: true, publicId: true, fullName: true, email: true, district: true, language: true },
    });

    return NextResponse.json({ trainee: updated });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("PATCH /api/v1/trainee/me error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to update profile", 500);
  }
}
