import { NextResponse } from "next/server";
import { dbDirect } from "~/server/db-direct";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbDirect.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: "error", timestamp: new Date().toISOString() }, { status: 500 });
  }
}