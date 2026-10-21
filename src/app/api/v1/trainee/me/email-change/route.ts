import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";
import { routeErrorResponse, createErrorResponse, handleZodError } from "~/app/api/v1/_utils";
import { EmailSendError } from "~/server/magic-link";
import { mintAndSendEmailChangeOtp } from "~/server/email-change";

export const dynamic = "force-dynamic";

/* Start a verified email change (T5): { newEmail } mints an EMAIL_CHANGE
 * login token with a 6-digit OTP sent to the NEW address. The change itself
 * only lands after POST .../email-change/verify. Trainee session required.
 * Response is generic success so the endpoint never confirms which emails
 * exist beyond the caller's own account. */
const emailChangeSchema = z.object({
  newEmail: z.string().trim().toLowerCase().email().max(200),
});

const RESEND_COOLDOWN_MS = 30 * 1000;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "trainee") {
      return createErrorResponse("UNAUTHORIZED", "Trainee session required", 401);
    }
    const trainee = await db.trainee.findUnique({
      where: { id: session.user.id },
      select: { id: true, fullName: true, email: true },
    });
    if (!trainee) {
      return createErrorResponse("NOT_FOUND", "Trainee not found", 404);
    }

    const body = (await request.json()) as unknown;
    const data = emailChangeSchema.parse(body);

    // No-op guard: re-entering the current email would mint a token just to
    // "change" the email to itself.
    if (trainee.email?.toLowerCase() === data.newEmail) {
      return createErrorResponse("EMAIL_SAME", "That is already your current email", 400);
    }

    // Case-insensitive EMAIL_TAKEN: emails are stored lowercase everywhere
    // (login, signup and profile PATCH lowercase before write), so an exact
    // findUnique on the lowercased input is the existing uniqueness pattern.
    // The same-email guard above means any clash is another trainee's.
    const clash = await db.trainee.findUnique({
      where: { email: data.newEmail },
      select: { id: true },
    });
    if (clash) {
      return createErrorResponse("EMAIL_TAKEN", "That email is already in use", 409);
    }

    // Server-side 30s resend cooldown via the most recent EMAIL_CHANGE token
    // (§7 rate pattern, same as the magic-link route).
    const lastToken = await db.traineeLoginToken.findFirst({
      where: { traineeId: trainee.id, purpose: "EMAIL_CHANGE" },
      orderBy: { createdAt: "desc" },
    });

    if (lastToken) {
      const retryAfter = Math.ceil(
        (RESEND_COOLDOWN_MS - (Date.now() - lastToken.createdAt.getTime())) / 1000,
      );
      if (retryAfter > 0) {
        return NextResponse.json(
          {
            error: {
              code: "RATE_LIMITED",
              message: `Too many requests. Try again in ${retryAfter}s.`,
              retryAfter,
            },
          },
          { status: 429 },
        );
      }
    }

    try {
      await mintAndSendEmailChangeOtp(trainee, data.newEmail);
    } catch (sendError) {
      if (sendError instanceof EmailSendError) {
        return createErrorResponse(
          "EMAIL_SEND_FAILED",
          "Couldn't send the email. Try again in a moment.",
          502,
        );
      }
      throw sendError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    console.error("POST /api/v1/trainee/me/email-change error:", error);
    return routeErrorResponse("Failed to start email change", error);
  }
}
