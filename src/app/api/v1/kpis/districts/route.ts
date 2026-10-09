import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { createErrorResponse } from "../../_utils";

export const dynamic = "force-dynamic";

/** District-level trainee distribution for the dashboard side card (§9.1). */
export async function GET() {
  try {
    const districts = await db.trainee.groupBy({
      by: ["district"],
      _count: { _all: true },
      orderBy: { _count: { district: "desc" } },
    });

    return NextResponse.json({
      districts: districts.map((d) => ({
        district: d.district,
        count: d._count._all,
      })),
    });
  } catch (error) {
    console.error("GET /api/v1/kpis/districts error:", error);
    return createErrorResponse("INTERNAL_ERROR", "Failed to fetch district distribution", 500);
  }
}
