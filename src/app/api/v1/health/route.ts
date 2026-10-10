import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { isDbOutage } from "~/app/api/v1/_utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch (error) {
    // A DB outage is a transient infra failure, not a bug — load balancers key
    // on this endpoint, so an outage must read as retryable (503), not
    // "our code is broken" (500).
    return NextResponse.json(
      { status: "error", timestamp: new Date().toISOString() },
      { status: isDbOutage(error) ? 503 : 500 },
    );
  }
}