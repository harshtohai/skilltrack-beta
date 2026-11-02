/**
 * Center-scope (INST-01) E2E harness — run against a server whose
 * INSTITUTE_CENTER_CODE is set (sign-in maps the institute to that center;
 * the login form does NOT choose it):
 *
 *   BASE=http://localhost:3001 npx tsx scripts/verify-center-scope.ts
 *
 * Proves an institute can only see/touch its OWN center's cohorts:
 * list scoping, cohort detail 404 for another center (API + page), no
 * follow-up trigger on another center, and that the detail payload never
 * ships the phone ciphertext/hash. Admin still sees everything.
 *
 * The institute's center is taken from the scoped list response itself, so
 * the script does not need to know INSTITUTE_CENTER_CODE.
 */
import { db as prisma } from "~/server/db";

const BASE = process.env.BASE ?? "http://localhost:3000";

let failed = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) console.log(`  ✅ ${name}`);
  else {
    failed++;
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function cookieJar(role: "institute" | "admin"): Promise<string> {
  const jar: string[] = [];
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  for (const raw of csrfRes.headers.getSetCookie()) jar.push(raw.split(";")[0] ?? "");
  const csrf = (await csrfRes.json()) as { csrfToken: string };
  const creds =
    role === "admin"
      ? { email: "admin@skilltrack.in", password: "admin123" }
      : { email: "institute@skilltrack.in", password: "institute123" };
  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: jar.join("; ") },
    body: new URLSearchParams({
      csrfToken: csrf.csrfToken,
      email: creds.email,
      password: creds.password,
      role,
    }),
  });
  if (loginRes.status !== 302) throw new Error(`login (${role}) failed: ${loginRes.status}`);
  for (const raw of loginRes.headers.getSetCookie()) jar.push(raw.split(";")[0] ?? "");
  return jar.join("; ");
}

async function main() {
  console.log(`\nCenter-scope E2E → ${BASE}\n`);

  const health = await fetch(`${BASE}/api/v1/health`);
  check("health endpoint", health.ok);
  if (!health.ok) process.exit(1);

  const cookie = await cookieJar("institute");

  // ── List: one center only ────────────────────────────────────────────────
  const listRes = await fetch(`${BASE}/api/v1/cohorts`, { headers: { Cookie: cookie } });
  const list = (await listRes.json()) as {
    data?: Array<{ id: string; name: string; programmeId: string; trainingCenterId: string }>;
  };
  const rows = list.data ?? [];
  check("cohort list → 200", listRes.status === 200, `got ${listRes.status}`);
  const ownCohort = rows[0];
  check("cohort list is not empty (seeded center)", Boolean(ownCohort));
  if (!ownCohort) process.exit(1);

  const ownCenterId = ownCohort.trainingCenterId;
  check("listed cohorts carry a center id", Boolean(ownCenterId));
  if (!ownCenterId) process.exit(1);
  check(
    "every listed cohort belongs to ONE center",
    rows.every((c) => c.trainingCenterId === ownCenterId),
    `${rows.filter((c) => c.trainingCenterId !== ownCenterId).length} foreign row(s)`,
  );

  const ownCount = await prisma.cohort.count({ where: { trainingCenterId: ownCenterId } });
  check(`list count matches that center (${ownCount})`, rows.length === ownCount, `got ${rows.length}`);

  const otherCenter = await prisma.trainingCenter.findFirst({
    where: { id: { not: ownCenterId }, cohorts: { some: {} } },
    select: { id: true, cohorts: { select: { id: true, name: true, programmeId: true }, take: 1 } },
  });
  check("a different center with a cohort exists", Boolean(otherCenter?.cohorts[0]));
  const otherCohort = otherCenter?.cohorts[0];
  if (!otherCohort) process.exit(1);

  check("other center's cohort id is not listed", rows.every((c) => c.id !== otherCohort.id));

  // Same with a programme filter pointing at the other center's programme.
  const filteredRes = await fetch(`${BASE}/api/v1/cohorts?programmeId=${otherCohort.programmeId}`, {
    headers: { Cookie: cookie },
  });
  const filtered = (await filteredRes.json()) as { data?: Array<{ trainingCenterId: string }> };
  check(
    "programme filter cannot reach another center",
    (filtered.data ?? []).every((c) => c.trainingCenterId === ownCenterId),
    `${(filtered.data ?? []).length} row(s) returned`,
  );

  // ── Detail: own works, other is a 404 ────────────────────────────────────
  const ownRes = await fetch(`${BASE}/api/v1/cohorts/${ownCohort.id}`, { headers: { Cookie: cookie } });
  const ownBody = (await ownRes.json()) as { cohort?: { id: string } };
  check("own cohort detail → 200", ownRes.status === 200, `got ${ownRes.status}`);
  check("own cohort detail returns the cohort", ownBody.cohort?.id === ownCohort.id);

  const otherRes = await fetch(`${BASE}/api/v1/cohorts/${otherCohort.id}`, { headers: { Cookie: cookie } });
  const otherBody = (await otherRes.json()) as { error?: { code?: string } };
  check("other center cohort detail → 404", otherRes.status === 404, `got ${otherRes.status}`);
  check("…as NOT_FOUND", otherBody.error?.code === "NOT_FOUND", JSON.stringify(otherBody));

  // ── Detail payload: no phone ciphertext/hash ─────────────────────────────
  const payload = JSON.stringify(ownBody);
  check("detail payload has no phoneEncrypted", !payload.includes("phoneEncrypted"));
  check("detail payload has no phoneHash", !payload.includes("phoneHash"));

  // ── Follow-up trigger: other center is a 404 ─────────────────────────────
  const triggerRes = await fetch(`${BASE}/api/v1/cohorts/${otherCohort.id}/followups/trigger`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ checkpointDays: 30 }),
  });
  check("follow-up trigger on another center → 404", triggerRes.status === 404, `got ${triggerRes.status}`);

  // ── Pages: own 200, other 404 ────────────────────────────────────────────
  const ownPage = await fetch(`${BASE}/cohorts/${ownCohort.id}`, { headers: { Cookie: cookie }, redirect: "manual" });
  check("own cohort page → 200", ownPage.status === 200, `got ${ownPage.status}`);

  const otherPage = await fetch(`${BASE}/cohorts/${otherCohort.id}`, { headers: { Cookie: cookie }, redirect: "manual" });
  const otherHtml = await otherPage.text();
  check("other center cohort page → 404", otherPage.status === 404, `got ${otherPage.status}`);
  check("…with the in-shell not-found copy", otherHtml.includes("Cohort not found"));
  check("…and no trainee data", !otherHtml.includes("phoneE164") && !otherHtml.includes(otherCohort.name));

  // ── Admin is global ──────────────────────────────────────────────────────
  const adminCookie = await cookieJar("admin");
  const adminRes = await fetch(`${BASE}/api/v1/cohorts/${otherCohort.id}`, { headers: { Cookie: adminCookie } });
  check("admin can read another center's cohort → 200", adminRes.status === 200, `got ${adminRes.status}`);

  console.log(failed === 0 ? "\nAll checks passed.\n" : `\n${failed} check(s) failed.\n`);
  process.exit(failed === 0 ? 0 : 1);
}

void main();
