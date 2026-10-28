/**
 * Add-trainee v2 E2E harness — run against a dev server:
 *
 *   npx tsx scripts/verify-add-trainee.ts          # BASE defaults to :3000
 *   BASE=http://localhost:3001 npx tsx scripts/verify-add-trainee.ts
 *
 * Covers: global lookup (publicId/phone/unknown/unauthenticated), link-enrol
 * (confirmation required, null-only fills, ALREADY_ENROLLED, wrong-center
 * cohort), and the manual add with the new required fields. Cleans up after
 * itself (restores fills, deletes created rows + audit noise).
 */
import crypto from "crypto";
import { db as prisma } from "~/server/db";
import { encryptPhone, hashPhone } from "~/lib/phone-encrypt";

const BASE = process.env.BASE ?? "http://localhost:3000";

let failed = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) console.log(`  ✅ ${name}`);
  else {
    failed++;
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function instituteCookieJar(): Promise<string> {
  const jar: string[] = [];
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  for (const raw of csrfRes.headers.getSetCookie()) jar.push(raw.split(";")[0] ?? "");
  const csrf = (await csrfRes.json()) as { csrfToken: string };
  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: jar.join("; ") },
    body: new URLSearchParams({
      csrfToken: csrf.csrfToken,
      email: process.env.INSTITUTE_EMAIL ?? "institute@skilltrack.in",
      password: process.env.INSTITUTE_PASSWORD ?? "institute123",
      centerCode: process.env.INSTITUTE_CENTER_CODE ?? "",
    }),
  });
  for (const raw of loginRes.headers.getSetCookie()) jar.push(raw.split(";")[0] ?? "");
  return jar.join("; ");
}

const uniq = (n: number) => `${n}${Date.now().toString().slice(-6)}`.slice(0, 10);

async function main() {
  console.log(`\nAdd-trainee v2 E2E → ${BASE}\n`);
  const startedAt = new Date();

  const health = await fetch(`${BASE}/api/v1/health`);
  check("health endpoint", health.ok);
  if (!health.ok) process.exit(1);

  const cookie = await instituteCookieJar();

  // ── Lookup: global, both keys ────────────────────────────────────────────
  const anyTrainee = await prisma.trainee.findFirst({
    where: { enrolments: { some: {} } },
    select: { id: true, publicId: true, phoneE164: true },
    orderBy: { createdAt: "desc" },
  });
  check("seeded trainee available", Boolean(anyTrainee));
  if (!anyTrainee) process.exit(1);

  const unauth = await fetch(`${BASE}/api/v1/trainees/lookup?q=${anyTrainee.publicId}`);
  check("lookup unauthenticated → 401", unauth.status === 401, `got ${unauth.status}`);

  const byId = await fetch(`${BASE}/api/v1/trainees/lookup?q=${encodeURIComponent(anyTrainee.publicId)}`, {
    headers: { Cookie: cookie },
  });
  const byIdBody = (await byId.json()) as {
    profile?: { publicId: string; id: string };
    enrolments?: unknown[];
    missing?: string[];
  };
  check("lookup by SkillID → 200 + profile + enrolments", byId.ok && byIdBody.profile?.publicId === anyTrainee.publicId && Array.isArray(byIdBody.enrolments));

  const byPhone = await fetch(`${BASE}/api/v1/trainees/lookup?q=${anyTrainee.phoneE164.replace("+91", "")}`, {
    headers: { Cookie: cookie },
  });
  const byPhoneBody = (await byPhone.json()) as { profile?: { publicId: string } };
  check("lookup by phone → 200 same trainee", byPhone.ok && byPhoneBody.profile?.publicId === anyTrainee.publicId);

  const unknown = await fetch(`${BASE}/api/v1/trainees/lookup?q=TRN-ZZZZZZ-9999`, { headers: { Cookie: cookie } });
  check("lookup unknown SkillID → 404", unknown.status === 404, `got ${unknown.status}`);

  // ── Link-enrol: a trainee NOT in the target cohort ───────────────────────
  const centerCode = process.env.INSTITUTE_CENTER_CODE ?? "";
  const center = centerCode
    ? await prisma.trainingCenter.findUnique({ where: { code: centerCode }, select: { id: true } })
    : await prisma.trainingCenter.findFirst({ select: { id: true } });
  check("center resolved", Boolean(center));
  if (!center) process.exit(1);

  const cohort = await prisma.cohort.findFirst({
    where: { trainingCenterId: center.id },
    select: { id: true, endDate: true },
  });
  check("center cohort available", Boolean(cohort));
  if (!cohort) process.exit(1);

  const target = await prisma.trainee.findFirst({
    where: { enrolments: { none: { cohortId: cohort.id } }, email: { not: null } },
    select: { id: true, publicId: true, email: true, dateOfBirth: true, address: true, educationLevel: true },
  });
  check("link target trainee found (not in cohort)", Boolean(target));
  if (!target) process.exit(1);

  // Confirmation is mandatory — no checkbox, no link.
  const noConfirm = await fetch(`${BASE}/api/v1/trainees/link-enrol`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ traineeId: target.id, cohortId: cohort.id }),
  });
  check("link without confirmed → 400", noConfirm.status === 400, `got ${noConfirm.status}`);

  // Filling an email that belongs to a DIFFERENT trainee row must name that
  // row's SkillID (duplicate-human trap) — never a bare P2002 dead end.
  const otherEmailTrainee = await prisma.trainee.findFirst({
    where: { email: { not: null }, NOT: { id: target.id } },
    select: { id: true, email: true, publicId: true },
  });
  if (otherEmailTrainee?.email) {
    const clash = await fetch(`${BASE}/api/v1/trainees/link-enrol`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        traineeId: target.id,
        cohortId: cohort.id,
        confirmed: true,
        updates: { email: otherEmailTrainee.email },
      }),
    });
    const clashBody = (await clash.json()) as { error?: { code?: string }; otherTraineePublicId?: string };
    check(
      "email owned by another row → 409 EMAIL_ON_OTHER_SKILLID + that SkillID",
      clash.status === 409 && clashBody.error?.code === "EMAIL_ON_OTHER_SKILLID" && clashBody.otherTraineePublicId === otherEmailTrainee.publicId,
      `got ${clash.status} ${JSON.stringify(clashBody)}`,
    );
  }

  const linkRes = await fetch(`${BASE}/api/v1/trainees/link-enrol`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      traineeId: target.id,
      cohortId: cohort.id,
      confirmed: true,
      updates: {
        // dateOfBirth/address/education fill nulls; email is pre-existing so
        // this value must be IGNORED (never overwrite).
        email: `hijack-${uniq(9)}@example.com`,
        dateOfBirth: "2000-06-15",
        address: "12 Smoke Lane, Pune",
        educationLevel: "GRADUATE",
      },
    }),
  });
  const linkBody = (await linkRes.json()) as { success?: boolean; traineePublicId?: string };
  check("link-enrol success → 201", linkRes.status === 201 && linkBody.success === true, `got ${linkRes.status}`);

  const after = await prisma.trainee.findUnique({
    where: { id: target.id },
    select: { email: true, dateOfBirth: true, address: true, educationLevel: true },
  });
  check("nulls filled (dob/address/education)", after?.dateOfBirth !== null && after?.address === "12 Smoke Lane, Pune" && after?.educationLevel === "GRADUATE");
  check("existing email NOT overwritten", after?.email === target.email, `got ${after?.email}`);

  const enrolmentRow = await prisma.enrolment.findFirst({
    where: { traineeId: target.id, cohortId: cohort.id },
    select: { id: true, status: true, certificationDate: true },
  });
  check("ACTIVE enrolment created (cert = cohort end)", enrolmentRow?.status === "ACTIVE" && enrolmentRow.certificationDate.toISOString().slice(0, 10) === cohort.endDate.toISOString().slice(0, 10));

  const repeat = await fetch(`${BASE}/api/v1/trainees/link-enrol`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ traineeId: target.id, cohortId: cohort.id, confirmed: true }),
  });
  const repeatBody = (await repeat.json()) as { error?: { code?: string } };
  check("re-link same cohort → 409 ALREADY_ENROLLED", repeat.status === 409 && repeatBody.error?.code === "ALREADY_ENROLLED", `got ${repeat.status}`);

  // ── Manual add: new required fields ─────────────────────────────────────
  const missingDob = await fetch(`${BASE}/api/v1/trainees`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      fullName: "Smoke Manual",
      email: `manual-${uniq(9)}@example.com`,
      phoneE164: `+91${uniq(9)}`,
      address: "12 Smoke Lane",
      educationLevel: "TENTH",
      cohortId: cohort.id,
    }),
  });
  check("manual add without DOB → 400", missingDob.status === 400, `got ${missingDob.status}`);

  const noEmail = await fetch(`${BASE}/api/v1/trainees`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      fullName: "Smoke Manual",
      phoneE164: `+91${uniq(9)}`,
      dateOfBirth: "2001-03-10",
      address: "12 Smoke Lane",
      educationLevel: "TENTH",
      cohortId: cohort.id,
    }),
  });
  check("manual add without email → 400", noEmail.status === 400, `got ${noEmail.status}`);

  const manualPhone = `+91${uniq(9)}`;
  const manual = await fetch(`${BASE}/api/v1/trainees`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      fullName: "Smoke Manual",
      email: `manual-${uniq(9)}@example.com`,
      phoneE164: manualPhone,
      dateOfBirth: "2001-03-10",
      gender: "MALE",
      language: "HI",
      address: "12 Smoke Lane, Pune",
      educationLevel: "TENTH",
      cohortId: cohort.id,
    }),
  });
  const manualBody = (await manual.json()) as { id?: string; dateOfBirth?: string; educationLevel?: string };
  check("manual add with full record → 201", manual.status === 201 && Boolean(manualBody.id), `got ${manual.status}`);
  check("manual add persists new fields", manualBody.educationLevel === "TENTH" && Boolean(manualBody.dateOfBirth));

  if (manualBody.id) {
    const created = await prisma.trainee.findUnique({ where: { id: manualBody.id }, select: { phoneE164: true } });
    check("manual add phone normalized to +91", created?.phoneE164 === manualPhone);
  }

  // ── Cleanup ──────────────────────────────────────────────────────────────
  await prisma.trainee.update({
    where: { id: target.id },
    data: {
      dateOfBirth: target.dateOfBirth,
      address: target.address,
      educationLevel: target.educationLevel,
    },
  });
  await prisma.enrolment.deleteMany({ where: { traineeId: target.id, cohortId: cohort.id } });
  await prisma.auditEvent.deleteMany({
    where: { entityId: target.id, action: "TRAINEE_ENROLLED", createdAt: { gte: startedAt } },
  });
  if (manualBody.id) {
    // FK order: enrolments + login tokens first, then the trainee row.
    await prisma.enrolment.deleteMany({ where: { traineeId: manualBody.id } });
    await prisma.traineeLoginToken.deleteMany({ where: { traineeId: manualBody.id } });
    await prisma.trainee.delete({ where: { id: manualBody.id } }).catch(() => {});
  }
  const restored = await prisma.trainee.findUnique({ where: { id: target.id }, select: { dateOfBirth: true, address: true, educationLevel: true } });
  check(
    "cleanup: target fields restored",
    restored?.address === target.address && restored?.educationLevel === target.educationLevel &&
      (restored?.dateOfBirth?.toISOString() ?? null) === (target.dateOfBirth?.toISOString() ?? null),
  );

  console.log(failed === 0 ? "\nAll checks passed.\n" : `\n${failed} check(s) failed.\n`);
  process.exit(failed === 0 ? 0 : 1);
}

void main();
