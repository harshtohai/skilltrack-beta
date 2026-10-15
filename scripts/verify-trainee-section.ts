/**
 * Trainee-section E2E harness (spec #102 Testing Decisions) — the scripted
 * counterpart of the manual smoke: certificates (issue → review → immutability
 * → cohort idempotency), the trainee file routes' ownership check, the OTP
 * guards (EMAIL_SAME / SAME_PHONE / enumeration-safe phone-otp) and the
 * auth-walled endpoints. Run against a dev/prod server:
 *
 *   npx tsx scripts/verify-trainee-section.ts            # BASE from env/.env
 *   BASE=http://localhost:3001 npx tsx scripts/verify-trainee-section.ts
 *
 * Requires INSTITUTE_CENTER_CODE + institute demo credentials in env (defaults
 * match the seeded demo). Writes real rows to the target DB (a PENDING cert on
 * one trainee; cohort issuance flips demo enrolments) — run
 * scripts/cleanup-smoke-data.ts afterwards if the target is production-like.
 */
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Load .env into process.env (auth secret needed only if extended).
try {
  const fs = await import("node:fs");
  for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
    const m = /^([A-Z_]+)="(.*)"$/.exec(line);
    if (m?.[1] && m[2] && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
} catch {
  // .env is optional when every needed var is already exported.
}

const BASE = process.env.BASE ?? "http://localhost:3000";

let passed = 0;
let failed = 0;

function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
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
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: jar.join("; "),
    },
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

async function main() {
  console.log(`\nTrainee-section E2E → ${BASE}\n`);
  const health = await fetch(`${BASE}/api/v1/health`);
  check("health endpoint", health.ok);
  if (!health.ok) {
    console.log("Server not reachable — aborting.");
    process.exit(1);
  }

  // ── Institute session ────────────────────────────────────────────────────
  const cookie = await instituteCookieJar();
  const authed = await fetch(`${BASE}/api/v1/trainees?limit=1`, { headers: { Cookie: cookie } });
  check("institute login + scoped trainees list", authed.ok);
  const authedBody = await authed.json() as { data?: Array<{ publicId: string }> };
  const trainee = authedBody.data?.[0];
  check("seeded trainee available", Boolean(trainee?.publicId));
  if (!trainee?.publicId) process.exit(1);
  const H = { Cookie: cookie };

  // ── Ad-hoc issuance (born VERIFIED) ─────────────────────────────────────
  const issue = await fetch(`${BASE}/api/v1/trainees/${trainee.publicId}/certificates`, {
    method: "POST",
    headers: { Cookie: cookie },
    body: (() => {
      const form = new FormData();
      form.set("name", "Harness Cert");
      form.set("issuer", "MSSDS");
      form.set("issueDate", "2026-10-13");
      return form;
    })(),
  });
  check("issue ad-hoc certificate → 201 VERIFIED", issue.status === 201);
  const issueBody = (await issue.json()) as { certificate?: { id: string } };
  const issuedId = issueBody.certificate?.id;
  check("issued certificate id returned", Boolean(issuedId));
  const list = await fetch(`${BASE}/api/v1/trainees/${trainee.publicId}/certificates`, { headers: H });
  const listed = (await list.json() as { certificates: Array<{ id: string; source: string; status: string }> }).certificates;
  const issued = listed.find((c) => c.id === issuedId);
  check("issued certificate is ISSUED/VERIFIED", issued?.source === "ISSUED" && issued?.status === "VERIFIED");

  // ── Review lifecycle (append-only) ──────────────────────────────────────
  // ADR-003: the review model is REMOVED — self-reported certificates are
  // born VERIFIED, editable/deletable by their owner; ISSUED are immutable;
  // the review route is gone.
  const pendingTraineeRow = await prisma.trainee.findUniqueOrThrow({ where: { publicId: trainee.publicId } });
  const reviewRoute = await fetch(`${BASE}/api/v1/trainees/${trainee.publicId}/certificates/${crypto.randomUUID()}`, {
    method: "PATCH",
    headers: { ...H, "Content-Type": "application/json" },
    body: JSON.stringify({ decision: "VERIFIED" }),
  });
  check("review route removed (404/405)", reviewRoute.status === 404 || reviewRoute.status === 405);
  const issuedCount = listed.filter((c) => c.source === "ISSUED").length;
  check("provenance labels present on institute view", listed.every((c) => c.source === "ISSUED" || c.source === "SELF_REPORTED"));

  // ── Cohort bulk issuance + idempotency ──────────────────────────────────
  const centerCode = process.env.INSTITUTE_CENTER_CODE ?? "";
  const center = centerCode
    ? await prisma.trainingCenter.findUnique({ where: { code: centerCode }, select: { id: true } })
    : null;
  const cohort = center
    ? await prisma.cohort.findFirst({
        where: { trainingCenterId: center.id, enrolments: { some: { status: "ACTIVE" } } },
        select: { id: true },
      })
    : null;
  if (cohort) {
    const bulk = await fetch(`${BASE}/api/v1/cohorts/${cohort.id}/certificates`, {
      method: "POST",
      headers: { ...H, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const bulkBody = bulk.ok ? await bulk.json() as { issued: number } : null;
    check("cohort bulk issuance", bulk.ok && (bulkBody?.issued ?? 0) > 0, `status ${bulk.status}`);
    const rerun = await fetch(`${BASE}/api/v1/cohorts/${cohort.id}/certificates`, {
      method: "POST",
      headers: { ...H, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    check("cohort re-run idempotent → 409 NOTHING_TO_ISSUE", rerun.status === 409);
  } else {
    check("cohort bulk issuance (skipped — no active cohort)", true);
  }

  // ── Trainee session via magic-link token + file ownership ───────────────
  const target = await prisma.trainee.findFirst({
    where: { certificates: { some: { fileUrl: { not: null } } } },
    include: { certificates: { where: { fileUrl: { not: null } }, take: 1 } },
  });
  if (target) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.traineeLoginToken.create({
      data: {
        traineeId: target.id,
        tokenHash: crypto.createHash("sha256").update(token).digest("hex"),
        purpose: "LOGIN",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });
    const jar: string[] = [];
    const verify = await fetch(`${BASE}/api/v1/auth/trainee/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: jar.join("; ") },
      body: JSON.stringify({ token }),
    });
    for (const raw of verify.headers.getSetCookie()) jar.push(raw.split(";")[0] ?? "");
    const verifyBody = await verify.json() as { trainee?: { training?: unknown[]; certificates?: Array<{ source?: string; status?: string }> } };
    check("magic-link token verify → session + profile", verify.ok && Boolean(verifyBody.trainee));
    check("verify payload carries certificate source/status", verifyBody.trainee?.certificates?.every((c) => Boolean(c.source && c.status)) === true);
    check("verify payload carries the training chain", Array.isArray(verifyBody.trainee?.training) && (verifyBody.trainee?.training?.length ?? 0) > 0);

    const mine = target.certificates[0];
    if (!mine) {
      check("own certificate file → 302 signed/external link", false, "no fileUrl certificate on target");
    } else {
      const fileMine = await fetch(`${BASE}/api/v1/trainee/certificates/${mine.id}/file`, { headers: { Cookie: jar.join("; ") }, redirect: "manual" });
      check("own certificate file → 302 signed/external link", fileMine.status === 302);
    }

    // ADR-003: ISSUED certificates are immutable to the trainee even post-review-removal.
    const issuedOfTarget = await prisma.certificate.findFirst({ where: { traineeId: target.id, source: "ISSUED" }, select: { id: true } });
    if (issuedOfTarget) {
      const patchIssued = await fetch(`${BASE}/api/v1/trainee/certificates/${issuedOfTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Cookie: jar.join("; ") },
        body: JSON.stringify({ name: "Tampered" }),
      });
      check("ISSUED certificate immutable to trainee → 409", patchIssued.status === 409);
    } else {
      check("ISSUED certificate immutability (skipped — no ISSUED cert on target trainee)", true);
    }

    const foreign = await prisma.certificate.findFirst({ where: { traineeId: { not: target.id } }, select: { id: true } });
    if (foreign) {
      const fileForeign = await fetch(`${BASE}/api/v1/trainee/certificates/${foreign.id}/file`, { headers: { Cookie: jar.join("; ") }, redirect: "manual" });
      check("foreign certificate file → 404", fileForeign.status === 404);
    }

    // ── OTP guards (no sends — same-value guards) ─────────────────────────
    const emailSame = await fetch(`${BASE}/api/v1/trainee/me/email-change`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: jar.join("; ") },
      body: JSON.stringify({ newEmail: target.email ?? "unused@example.com" }),
    });
    check("email-change SAME guard", emailSame.status === 400 || (target.email === null && emailSame.ok));
    const phoneSame = await fetch(`${BASE}/api/v1/trainee/me/phone-change`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: jar.join("; ") },
      body: JSON.stringify({ newPhone: target.phoneE164.replace("+91", "") }),
    });
    check("phone-change SAME guard", phoneSame.status === 400);

    // ── Skills self-assessment (bag #44) ────────────────────────────────────
    const skillsGet = await fetch(`${BASE}/api/v1/trainee/skills`, { headers: { Cookie: jar.join("; ") } });
    const skillsBody = skillsGet.ok
      ? await skillsGet.json() as { course: { name: string } | null; skills: Array<{ skill: string; level: number | null }> }
      : null;
    check("skills endpoint returns a course-linked skill list", skillsGet.ok && skillsBody?.course !== null && (skillsBody?.skills.length ?? 0) > 0);
    const ratedSkills = (skillsBody?.skills ?? []).slice(0, 2).map((s) => ({ skill: s.skill, level: 3 }));
    if (ratedSkills.length > 0) {
      const skillsPost = await fetch(`${BASE}/api/v1/trainee/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: jar.join("; ") },
        body: JSON.stringify({ levels: ratedSkills }),
      });
      check("skills POST → saved", skillsPost.ok);
      const skillsRe = await fetch(`${BASE}/api/v1/trainee/skills`, { headers: { Cookie: jar.join("; ") } });
      const skillsReBody = await skillsRe.json() as { skills: Array<{ skill: string; level: number | null }> };
      check("skills GET reflects the saved levels", ratedSkills.every((r) => skillsReBody.skills.find((s) => s.skill === r.skill)?.level === 3));
      const badSkill = await fetch(`${BASE}/api/v1/trainee/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: jar.join("; ") },
        body: JSON.stringify({ levels: [{ skill: "made-up-skill", level: 5 }] }),
      });
      check("fabricated skill rejected → 400", badSkill.status === 400);
    } else {
      check("skills POST (skipped — no skills on the course)", true);
    }
  }

  // ── Enumeration safety: unknown phone never leaks registration ──────────
  const unknownPhone = await fetch(`${BASE}/api/v1/auth/trainee/phone-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: "9000000000" }),
  });
  check("phone-otp unknown number → enumeration-safe success", unknownPhone.ok);

  // ── Auth walls ──────────────────────────────────────────────────────────
  const anonMe = await fetch(`${BASE}/api/v1/trainee/me`);
  check("unauthenticated /trainee/me → 401", anonMe.status === 401);
  const anonCerts = await fetch(`${BASE}/api/v1/trainee/certificates`);
  check("unauthenticated certificates → 401", anonCerts.status === 401);

  // ── Removal + CSV import (#112/#114) ────────────────────────────────────
  const removalTrainee = await prisma.trainee.findUniqueOrThrow({ where: { publicId: trainee.publicId } });
  const removalCert = await prisma.certificate.create({
    data: {
      traineeId: removalTrainee.id,
      name: "Harness Removal Cert",
      issuer: "Some Academy",
      issueDate: new Date("2026-09-01"),
      source: "SELF_REPORTED",
      status: "VERIFIED",
    },
  });
  const removeRes = await fetch(`${BASE}/api/v1/trainees/${trainee.publicId}/certificates/${removalCert.id}`, {
    method: "DELETE",
    headers: { ...H, "Content-Type": "application/json" },
    body: JSON.stringify({ reason: "harness" }),
  });
  check("institute removes SELF_REPORTED cert → 200", removeRes.ok);
  const gone = await prisma.certificate.findUnique({ where: { id: removalCert.id } });
  check("removed certificate is gone from the DB", gone === null);

  const csv = "publicId,name,issuer,issueDate,expiryDate\n"
    + `${trainee.publicId},Harness Import Cert,MSSDS,2026-10-13,\n`
    + `${trainee.publicId},Harness Import Cert,MSSDS,2026-10-13,\n`
    + "TRN-UNKNOWN-0000,Ghost Cert,MSSDS,2026-10-13,\n";
  const importForm = new FormData();
  importForm.set("file", new Blob([csv], { type: "text/csv" }), "harness.csv");
  const importRes = await fetch(`${BASE}/api/v1/trainees/import-certificates`, { method: "POST", headers: { Cookie: cookie }, body: importForm });
  const importBody = importRes.ok ? await importRes.json() as { created: number; skipped: number; results: Array<{ status: string }> } : null;
  check(
    "CSV import → created 1, skipped 1, error 1",
    importRes.ok && importBody?.created === 1 && importBody?.skipped === 1 && importBody?.results.filter((r) => r.status === "error").length === 1,
    importRes.ok ? JSON.stringify(importBody) : `status ${importRes.status}`,
  );
  const importCleanup = await prisma.certificate.deleteMany({ where: { name: "Harness Import Cert" } });
  check("import cleanup", importCleanup.count === 1);

  console.log(`\n${passed} passed · ${failed} failed\n`);
  await prisma.$disconnect();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
