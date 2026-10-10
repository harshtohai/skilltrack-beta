import { describe, expect, it } from "vitest";

import { isDbOutage, routeErrorResponse } from "./_utils";

describe("isDbOutage", () => {
  it("detects Prisma connection-outage codes", () => {
    expect(isDbOutage({ code: "P1001" })).toBe(true);
    expect(isDbOutage({ code: "P1002" })).toBe(true);
    expect(isDbOutage({ code: "P2024" })).toBe(true);
  });

  it("detects the transient socket-failure message without a code", () => {
    expect(isDbOutage(new Error("Can't reach database server at db.host:5432"))).toBe(true);
  });

  it("does not flag non-outage errors", () => {
    expect(isDbOutage(new Error("Invalid `prisma.trainee.findMany()` invocation"))).toBe(false);
    expect(isDbOutage({ code: "P2002" })).toBe(false);
    expect(isDbOutage(null)).toBe(false);
  });
});

describe("routeErrorResponse", () => {
  it("returns a clean 503 with Retry-After on a DB outage", async () => {
    const res = routeErrorResponse("Failed to fetch X", { code: "P1001" });
    expect(res.status).toBe(503);
    expect(res.headers.get("Retry-After")).toBe("30");
    const body = (await res.json()) as { error: { code: string; message: string } };
    expect(body.error.code).toBe("SERVICE_UNAVAILABLE");
  });

  it("keeps the 500 INTERNAL_ERROR semantics for non-outage errors", async () => {
    const res = routeErrorResponse("Failed to fetch X", new Error("something else"));
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("INTERNAL_ERROR");
  });
});
