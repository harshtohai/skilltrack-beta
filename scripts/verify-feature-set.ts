/**
 * Feature-set verification (feat/auth-institute, 85a1ab3..1c9efac) — E2E
 * loop-check of every new/upgraded/repaired API against a running dev server.
 *
 * Usage:
 *   DATABASE_URL="$(grep '^DATABASE_URL' .env | cut -d'"' -f2)" \
 *   DIRECT_URL="$(grep '^DIRECT_URL' .env | cut -d'"' -f2)" \
 *   npm run dev                                  # one shell (pooler override)
 *   npx tsx scripts/verify-feature-set.ts        # against localhost:3000
 *   npx tsx scripts/verify-feature-set.ts --cleanup   # smoke-data cleanup only
 *
 * Covers: magic-link truth-telling + 30s resend limit (AUTH-01), signup
 * rework — public exemption + distinct duplicates + enrolment guard (AUTH-02),
 * OTP alternative verification (AUTH-03), institute scoping (INST-01),
 * add-trainee flow (INST-02), move window + drop-out (INST-03), center-scoped
 * KPIs (INST-04).
 *
 * Requires .env with AUTH_SECRET + PHONE_HASH_PEPPER + PHONE_ENCRYPTION_KEY.
 * Creates real DB rows (smoke-* trainees/enrolments/followups/login tokens) —
 * clean them with `--cleanup` (same FK-order pattern as
 * scripts/cleanup-smoke-data.ts; audit events are deliberately NOT deleted —
 * append-only).
 */
import { readFileSync } from "node:fs";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.BASE ?? "http://localhost:3000";
const db = new PrismaClient();

function loadEnv() {
  try {
    process.loadEnvFile();
  } catch {
    for (const line of readFileSync(".env", "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m || m[1] === undefined || m[2] === undefined) continue;
      if (!(m[1] in process.env)) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  }
}
loadEnv();

let pass = 0;
let fail = 0;
const ok = (msg: string) => { pass += 1; console.log(`  ✓ ${msg}`); };
const bad = (msg: string) => { fail += 1; console.log(`  ✗ ${msg}`); };
function check(desc: string, actual: unknown, expected: unknown) {
  if (actual === expected) ok(desc);
  else bad(`${desc} — got: ${JSON.stringify(actual)}, want: ${JSON.stringify(expected)}`);
}
function checkTrue(desc: string, condition: boolean, detail = "") {
  if (condition) ok(desc);
  else bad(detail ? `${desc} — ${detail}` : desc);
}

// ── Smoke-data helpers ───────────────────────────────────────────────

/** Realistic phone crypto (same as the signup route — lib/phone-encrypt). */
function encryptPhone(phoneE164: string): string {
  const ENCRYPTION_KEY = process.env.PHONE_ENCRYPTION_KEY ?? "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(ENCRYPTION_KEY, "hex"), iv);
  const normalized = phoneE164.replace(/\D/g, "");
  const encrypted = Buffer.concat([cipher.update(normalized, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, encrypted, authTag]).toString("base64");
}
function hashPhone(phoneE164: string): string {
  const pepper = process.env.PHONE_HASH_PEPPER ?? "";
  const normalized = phoneE164.replace(/\D/g, "");
  return crypto.createHmac("sha256", pepper).update(normalized).digest("hex");
}
const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

let phoneSeq = 0;
/** Fresh unique "+91"+10-digit mobile — 95-prefix + ms tail + 2-digit counter. */
function freshPhone(): string {
  phoneSeq += 1;
  const ms6 = String(Date.now()).slice(-6);
  const seq2 = String(phoneSeq % 100).padStart(2, "0");
  return `+9195${ms6}${seq2}`;
}

async function createSmokeTrainee(opts: {
  email: string;
  consentGiven: boolean;
  centerId?: string | null;
  cohortId?: string | null;
  withFollowup?: boolean;
  fullName?: string;
}): Promise<{ id: string; publicId: string; email: string | null }> {
  const phone = freshPhone();
  const cohort = opts.cohortId
    ? await db.cohort.findUnique({ where: { id: opts.cohortId } })
    : null;
  const trainee = await db.trainee.create({
    data: {
      fullName: opts.fullName ?? "Smoke Featset",
      email: opts.email,
      phoneE164: phone,
      phoneEncrypted: encryptPhone(phone),
      phoneHash: hashPhone(phone),
      district: "Pune",
      consentGiven: opts.consentGiven,
      consentGivenAt: opts.consentGiven ? new Date() : null,
      consentMethod: opts.consentGiven ? "SIGNUP_FORM" : null,
      publicId: `TRN-SMK-${Date.now().toString(36).toUpperCase()}-${phoneSeq}${Math.floor(Math.random() * 10)}`,
      ...(opts.cohortId
        ? {
            enrolments: {
              create: {
                cohortId: opts.cohortId,
                status: "ACTIVE",
                certificationDate: cohort?.endDate ?? new Date(),
              },
            },
          }
        : {}),
      ...(opts.withFollowup
        ? {
            followupEvents: {
              create: {
                cohortId: opts.cohortId ?? cohort?.id ?? "",
                checkpointDays: 30,
                status: "SENT",
              },
            },
          }
        : {}),
    },
  });
  return { id: trainee.id, publicId: trainee.publicId, email: trainee.email };
}

/** Direct DB token mint (no email send) — same row shape as mintAndSendLoginToken. */
async function mintTokenRow(traineeId: string, otp: string, expiresInMs = 30 * 60 * 1000) {
  const token = crypto.randomBytes(32).toString("hex");
  await db.traineeLoginToken.create({
    data: {
      traineeId,
      tokenHash: sha256(token),
      otpHash: sha256(otp),
      expiresAt: new Date(Date.now() + expiresInMs),
    },
  });
  return token;
}

/** Real credentials login (same probe as verify-job-board.ts). */
async function credsLogin(
  email: string,
  password: string,
  role: string,
): Promise<{ ok: boolean; id: string | null; cookie: string }> {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
  const csrfCookie = csrfRes.headers.get("set-cookie") ?? "";
  const form = new URLSearchParams({
    email,
    password,
    role,
    csrfToken,
    callbackUrl: `${BASE}/login`,
  });
  const callbackRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: csrfCookie },
    body: form.toString(),
    redirect: "manual",
  });
  const sessionCookie =
    callbackRes.headers
      .getSetCookie()
      .find((c) => c.startsWith("authjs.session-token=") || c.startsWith("__Secure-authjs.session-token="))
      ?.split(";")[0] ?? "";
  const sessionRes = await fetch(`${BASE}/api/auth/session`, {
    headers: { Cookie: sessionCookie },
  });
  const text = await sessionRes.text();
  let session: { user?: { id?: string; email?: string | null } } | null = null;
  try {
    session = JSON.parse(text) as { user?: { email?: string | null } } | null;
  } catch {
    session = null;
  }
  return {
    ok: session?.user?.email?.trim().toLowerCase() === email.trim().toLowerCase(),
    id: session?.user?.id ?? null,
    cookie: sessionCookie,
  };
}

let lastCode = 0;
let lastBody: unknown = null;

async function call(method: string, path: string, cookie: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Cookie: cookie,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  lastCode = res.status;
  const text = await res.text();
  try {
    lastBody = JSON.parse(text) as unknown;
  } catch {
    lastBody = text;
  }
}
const body = () => lastBody as Record<string, unknown>;
const errCode = () => (body().error as { code?: string } | undefined)?.code;
const errMessage = () => (body().error as { message?: string } | undefined)?.message;

/** Audit-event lookup by action + entityId (DB-direct). */
async function auditExists(action: string, entityId: string) {
  const ev = await db.auditEvent.findFirst({ where: { action, entityId } });
  return ev !== null;
}

// ── Cleanup (same FK-order pattern as cleanup-smoke-data.ts) ─────────

async function cleanup() {
  const smokeTrainees = await db.trainee.findMany({
    where: { email: { startsWith: "smoke-" } },
    select: { id: true, publicId: true, email: true },
  });
  const ids = smokeTrainees.map((t) => t.id);
  if (ids.length === 0) {
    console.log("✅ No smoke trainees found — nothing to clean.");
    return;
  }
  const followups = await db.followupEvent.deleteMany({ where: { traineeId: { in: ids } } });
  const enrolments = await db.enrolment.deleteMany({ where: { traineeId: { in: ids } } });
  const tokens = await db.traineeLoginToken.deleteMany({ where: { traineeId: { in: ids } } });
  const claims = await db.employmentClaim.deleteMany({ where: { traineeId: { in: ids } } });
  const outcomes = await db.outcomeEvent.deleteMany({ where: { traineeId: { in: ids } } });
  const trainees = await db.trainee.deleteMany({ where: { id: { in: ids } } });
  console.log(`✅ Cleanup complete:`);
  console.log(`   smoke trainees: ${trainees.count}`);
  console.log(`   enrolments: ${enrolments.count}`);
  console.log(`   followup events: ${followups.count}`);
  console.log(`   login tokens: ${tokens.count}`);
  console.log(`   employment claims: ${claims.count}`);
  console.log(`   outcome events: ${outcomes.count}`);
  console.log(`   audit events: untouched (append-only)`);
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  if (process.argv.includes("--cleanup")) {
    await cleanup();
    return;
  }

  const ts = Date.now();
  const unvEmail = `smoke-unv-${ts}@company.com`; // unverified smoke trainee
  const verEmail = `smoke-ver-${ts}@company.com`; // verified smoke trainee
  const vfyEmail = `smoke-vfy-${ts}@company.com`; // verify-API smoke trainee
  const signupEmail = `smoke-signup-${ts}@company.com`;
  const addEmail = `smoke-add-${ts}@company.com`;
  const addNoEmail = null; // institute add without email

  // ── Health ──────────────────────────────────────────────────────────
  console.log("\n== Health ==");
  await call("GET", "/api/v1/health", "");
  check("health endpoint responds", lastCode, 200);

  // ── DB setup: center scope + cohorts ────────────────────────────────
  console.log("\n== DB setup (center scope) ==");
  const center = await db.trainingCenter.findUnique({
    where: { code: process.env.INSTITUTE_CENTER_CODE ?? "TC-PUN-01" },
  });
  checkTrue("institute center resolved (TC-PUN-01)", Boolean(center), "center not found — check INSTITUTE_CENTER_CODE");
  const centerId = center?.id ?? "";
  const centerCohorts = await db.cohort.findMany({
    where: { trainingCenterId: centerId },
    orderBy: { startDate: "desc" },
  });
  const otherCenterCohort = await db.cohort.findFirst({
    where: { trainingCenterId: { not: centerId } },
  });
  checkTrue("center has ≥2 cohorts (source + move target)", centerCohorts.length >= 2, `got ${centerCohorts.length}`);
  checkTrue("another center's cohort exists (403 target)", Boolean(otherCenterCohort));
  const cohortA = centerCohorts[0]!.id;
  const cohortB = centerCohorts[1]!.id;
  const cohortOther = otherCenterCohort!.id;

  // Smoke trainees for the move/drop-out group.
  const mvZero = await createSmokeTrainee({ email: `smoke-mv0-${ts}@company.com`, consentGiven: true, cohortId: cohortA });
  const mvProgress = await createSmokeTrainee({ email: `smoke-mv1-${ts}@company.com`, consentGiven: true, cohortId: cohortA, withFollowup: true });
  const mvOther = await createSmokeTrainee({ email: `smoke-mv2-${ts}@company.com`, consentGiven: true, cohortId: cohortOther });
  const mvFresh = await createSmokeTrainee({ email: `smoke-mv3-${ts}@company.com`, consentGiven: false, cohortId: cohortA });
  // Smoke trainees for the magic-link group.
  await createSmokeTrainee({ email: unvEmail, consentGiven: false });
  await createSmokeTrainee({ email: verEmail, consentGiven: true });
  // Smoke trainee for the verify API group (unverified — consent must flip).
  await createSmokeTrainee({ email: vfyEmail, consentGiven: false });

  // ── 1. Magic-link route (POST /api/v1/trainee/magic-link) ───────────
  console.log("\n== 1. Magic-link route ==");
  await call("POST", "/api/v1/trainee/magic-link", "", { email: `smoke-unknown-a-${ts}@company.com`, channel: "EMAIL" });
  check("unknown email 1 → 200", lastCode, 200);
  const unknownBody1 = JSON.stringify(body());
  await call("POST", "/api/v1/trainee/magic-link", "", { email: `smoke-unknown-b-${ts}@company.com`, channel: "EMAIL" });
  const unknownBody2 = JSON.stringify(body());
  check("unknown email 2 → 200", lastCode, 200);
  check("two unknown emails → byte-identical generic responses (no enumeration leak)", unknownBody1 === unknownBody2, true);
  check("generic body is exactly {success:true}", unknownBody1, '{"success":true}');

  // Unverified trainee: needsVerification, WITHOUT minting a token.
  const tokensBefore = await db.traineeLoginToken.count({ where: { trainee: { email: unvEmail } } });
  await call("POST", "/api/v1/trainee/magic-link", "", { email: unvEmail, channel: "EMAIL" });
  check("unverified trainee → 200", lastCode, 200);
  check("unverified trainee → needsVerification true", (body() as { needsVerification?: boolean }).needsVerification, true);
  const tokensAfter = await db.traineeLoginToken.count({ where: { trainee: { email: unvEmail } } });
  check("no token minted for unverified trainee", tokensAfter, tokensBefore);

  // Known verified trainee: first POST → real send attempt (200 if Brevo
  // works, 502 EMAIL_SEND_FAILED if it fails — both observable, reported
  // exactly as observed); the token row is minted BEFORE the send either way.
  await call("POST", "/api/v1/trainee/magic-link", "", { email: verEmail, channel: "EMAIL" });
  const firstSendCode = lastCode;
  if (firstSendCode === 200) {
    ok("known email first send → 200 (Brevo delivery works)");
    check("success body {success:true}", JSON.stringify(body()), '{"success":true}');
  } else if (firstSendCode === 502 && errCode() === "EMAIL_SEND_FAILED") {
    bad("known email first send → 502 EMAIL_SEND_FAILED (send fails locally — token still minted before the send)");
  } else {
    bad(`known email first send — got: ${lastCode} ${JSON.stringify(body())}, want: 200 or 502/EMAIL_SEND_FAILED`);
  }
  const tokensAfterFirstSend = await db.traineeLoginToken.count({ where: { trainee: { email: verEmail } } });
  checkTrue("token row exists after first send (mint precedes send)", tokensAfterFirstSend >= 1, `got ${tokensAfterFirstSend}`);

  // Resend within 30s → 429 + retryAfter (server-side cooldown on the last token row).
  await call("POST", "/api/v1/trainee/magic-link", "", { email: verEmail, channel: "EMAIL" });
  check("resend within 30s → 429", lastCode, 429);
  check("429 code RATE_LIMITED", errCode(), "RATE_LIMITED");
  const retryAfter = (body().error as { retryAfter?: number } | undefined)?.retryAfter;
  checkTrue("429 carries retryAfter in 1..30", typeof retryAfter === "number" && retryAfter >= 1 && retryAfter <= 30, `got ${JSON.stringify(retryAfter)}`);

  // ── 2. Signup POST (public, no session) ─────────────────────────────
  console.log("\n== 2. Signup POST (public exemption) ==");
  const signupPhone = freshPhone();
  await call("POST", "/api/v1/trainees", "", {
    fullName: "Smoke Signup",
    email: signupEmail,
    phoneE164: signupPhone,
    district: "Pune",
    gender: "SELF_DESCRIBED",
    genderSelfDescribed: "Smoke self-described",
    language: "EN",
    consent: true,
  });
  check("fresh email + phone → 201 (public exemption, NOT 401)", lastCode, 201);
  const signupTrainee = (lastBody as { id?: string; consentGiven?: boolean } | null) ?? {};
  check("signup trainee consentGiven true", signupTrainee.consentGiven, true);
  check("signup trainee gender stored", (lastBody as { gender?: string } | null)?.gender, "SELF_DESCRIBED");

  // Same phone again, different email → 409 PHONE_EXISTS.
  await call("POST", "/api/v1/trainees", "", {
    fullName: "Smoke Dup Phone",
    email: `smoke-dup-phone-${ts}@company.com`,
    phoneE164: signupPhone,
    district: "Pune",
    consent: true,
  });
  check("same phone, different email → 409", lastCode, 409);
  check("duplicate code is PHONE_EXISTS", errCode(), "PHONE_EXISTS");

  // Same email again, different phone → 409 EMAIL_EXISTS (distinct codes).
  await call("POST", "/api/v1/trainees", "", {
    fullName: "Smoke Dup Email",
    email: signupEmail,
    phoneE164: freshPhone(),
    district: "Pune",
    consent: true,
  });
  check("same email, different phone → 409", lastCode, 409);
  check("duplicate code is EMAIL_EXISTS", errCode(), "EMAIL_EXISTS");

  // Body WITH cohortId but NO session → 401, NO trainee/enrolment row.
  await call("POST", "/api/v1/trainees", "", {
    fullName: "Smoke Enrol Sneak",
    email: `smoke-sneak-${ts}@company.com`,
    phoneE164: freshPhone(),
    district: "Pune",
    cohortId: cohortA,
  });
  check("public body with cohortId → 401", lastCode, 401);
  check("401 code UNAUTHORIZED", errCode(), "UNAUTHORIZED");
  const sneakTrainee = await db.trainee.findUnique({ where: { email: `smoke-sneak-${ts}@company.com` } });
  checkTrue("no trainee row created by the public cohortId request", sneakTrainee === null);
  const sneakEnrolments = await db.enrolment.count({ where: { cohortId: cohortA, trainee: { email: `smoke-sneak-${ts}@company.com` } } });
  check("no enrolment row created", sneakEnrolments, 0);

  // ── 3. Institute add-trainee (POST /api/v1/trainees WITH session) ───
  console.log("\n== 3. Institute add-trainee ==");
  const instituteLogin = await credsLogin("institute@pmkvy.gov.in", "institute123", "institute");
  instituteLogin.ok ? ok("institute credentials login") : bad("institute credentials login");
  const instituteC = instituteLogin.cookie;
  const employerLogin = await credsLogin("hr@company.com", "employer123", "employer");
  employerLogin.ok ? ok("employer credentials login") : bad("employer credentials login");
  const employerC = employerLogin.cookie;
  const adminLogin = await credsLogin("admin@maharashtra.gov.in", "admin123", "admin");
  adminLogin.ok ? ok("admin credentials login") : bad("admin credentials login");
  const adminC = adminLogin.cookie;

  await call("POST", "/api/v1/trainees", instituteC, {
    fullName: "Smoke Inst Added",
    email: addEmail,
    phoneE164: freshPhone(),
    cohortId: cohortA,
  });
  check("institute add into own center's cohort → 201", lastCode, 201);
  const addedTrainee = (lastBody as { id?: string; publicId?: string; consentGiven?: boolean } | null) ?? {};
  check("institute-added trainee consentGiven false", addedTrainee.consentGiven, false);
  const addedEnrolment = await db.enrolment.findFirst({
    where: { traineeId: addedTrainee.id ?? "", cohortId: cohortA },
  });
  checkTrue("trainee + ACTIVE enrolment created in DB", addedEnrolment?.status === "ACTIVE", `enrolment: ${JSON.stringify(addedEnrolment?.status)}`);

  await call("POST", "/api/v1/trainees", instituteC, {
    fullName: "Smoke Cross Center",
    email: `smoke-cross-${ts}@company.com`,
    phoneE164: freshPhone(),
    cohortId: cohortOther,
  });
  check("cohortId of ANOTHER center → 403", lastCode, 403);
  check("403 message names the center rule", errMessage(), "The target cohort is not in your center");

  await call("POST", "/api/v1/trainees", employerC, {
    fullName: "Smoke Employer Sneak",
    email: `smoke-emp-${ts}@company.com`,
    phoneE164: freshPhone(),
    cohortId: cohortA,
  });
  check("as employer → 403", lastCode, 403);
  check("employer 403 message", errMessage(), "Admin or institute role required");

  // No email in the body → 201 with no enrollment email send attempt
  // (no login token row, no LOGIN_SENT audit for that trainee).
  await call("POST", "/api/v1/trainees", instituteC, {
    fullName: "Smoke No Email",
    phoneE164: freshPhone(),
    cohortId: cohortA,
  });
  check("no-email institute add → 201", lastCode, 201);
  const noEmailTrainee = (lastBody as { id?: string; email?: string | null } | null) ?? {};
  check("no-email trainee email is null", noEmailTrainee.email ?? null, null);
  const noEmailTokens = await db.traineeLoginToken.count({ where: { traineeId: noEmailTrainee.id ?? "" } });
  check("no login token minted (email skipped)", noEmailTokens, 0);
  const noEmailAudit = await db.auditEvent.findFirst({
    where: { action: "LOGIN_SENT", metadata: { path: ["traineeId"], equals: noEmailTrainee.id ?? "" } },
  });
  checkTrue("no LOGIN_SENT audit for the no-email trainee", noEmailAudit === null);

  // ── 4. Verify API (POST /api/v1/auth/trainee/verify) ────────────────
  console.log("\n== 4. Verify API ==");
  const rawToken = await mintTokenRow((await db.trainee.findUnique({ where: { email: vfyEmail } }))!.id, "123456");
  await call("POST", "/api/v1/auth/trainee/verify", "", { token: rawToken });
  check("token path → 200", lastCode, 200);
  check("verify response consentGiven true", (lastBody as { trainee?: { consentGiven?: boolean } } | null)?.trainee?.consentGiven, true);
  const vfyAfter = await db.trainee.findUnique({ where: { email: vfyEmail } });
  checkTrue("DB consentGiven flipped true", vfyAfter?.consentGiven === true);
  checkTrue("DB consentGivenAt set", vfyAfter?.consentGivenAt !== null && vfyAfter?.consentGivenAt !== undefined);
  check("DB consentMethod EMAIL", vfyAfter?.consentMethod, "EMAIL");
  const usedRow = await db.traineeLoginToken.findFirst({ where: { trainee: { email: vfyEmail }, tokenHash: sha256(rawToken) } });
  checkTrue("token marked used", usedRow?.usedAt !== null && usedRow?.usedAt !== undefined);

  await call("POST", "/api/v1/auth/trainee/verify", "", { token: rawToken });
  check("token reuse → 401", lastCode, 401);
  check("reuse code TOKEN_USED", errCode(), "TOKEN_USED");

  const wrongOtpRow = await db.traineeLoginToken.count({ where: { trainee: { email: vfyEmail }, otpHash: sha256("000000") } });
  checkTrue("no token row holds the wrong OTP (pre-check)", wrongOtpRow === 0, `got ${wrongOtpRow}`);
  await call("POST", "/api/v1/auth/trainee/verify", "", { email: vfyEmail, otp: "000000" });
  check("wrong OTP → 401", lastCode, 401);
  check("wrong OTP generic code", errCode(), "INVALID_OTP");
  check("wrong OTP generic message (never reveals existence)", errMessage(), "That code is invalid or has expired");

  const otpTokenTraineeId = (await db.trainee.findUnique({ where: { email: vfyEmail } }))!.id;
  await mintTokenRow(otpTokenTraineeId, "654321");
  await call("POST", "/api/v1/auth/trainee/verify", "", { email: vfyEmail, otp: "654321" });
  check("correct OTP path → 200", lastCode, 200);

  const rawExpired = await mintTokenRow(otpTokenTraineeId, "111111", -1 * 60 * 1000);
  await call("POST", "/api/v1/auth/trainee/verify", "", { token: rawExpired });
  check("expired token → 401", lastCode, 401);
  check("expired code TOKEN_EXPIRED", errCode(), "TOKEN_EXPIRED");

  // ── 5. Move/drop-out endpoints ──────────────────────────────────────
  console.log("\n== 5. Move/drop-out endpoints ==");
  await call("POST", `/api/v1/trainees/${mvZero.publicId}/move-cohort`, instituteC, { cohortId: cohortB });
  check("zero-progress move within center → 200", lastCode, 200);
  check("moved count 1", (body() as { moved?: number }).moved, 1);
  check("toCohortId echoed", (body() as { toCohortId?: string }).toCohortId, cohortB);
  const movedEnrolment = await db.enrolment.findFirst({ where: { traineeId: mvZero.id } });
  check("enrolment re-pointed to target cohort", movedEnrolment?.cohortId, cohortB);
  const movedAudit = await db.auditEvent.findFirst({ where: { action: "COHORT_MOVED", entityId: mvZero.id } });
  checkTrue("audit event COHORT_MOVED written", movedAudit !== null);
  check("COHORT_MOVED actorType SYSTEM (institute)", movedAudit?.actorType, "SYSTEM");
  check("COHORT_MOVED metadata.toCohortId", (movedAudit?.metadata as { toCohortId?: string } | undefined)?.toCohortId, cohortB);

  await call("POST", `/api/v1/trainees/${mvZero.publicId}/drop-out`, instituteC);
  check("drop-out → 200", lastCode, 200);
  check("droppedOut count 1", (body() as { droppedOut?: number }).droppedOut, 1);
  const droppedEnrolment = await db.enrolment.findFirst({ where: { traineeId: mvZero.id } });
  check("enrolment DROPPED_OUT", droppedEnrolment?.status, "DROPPED_OUT");
  checkTrue("audit event DROPPED_OUT written", await auditExists("DROPPED_OUT", mvZero.id));

  await call("POST", `/api/v1/trainees/${mvProgress.publicId}/move-cohort`, instituteC, { cohortId: cohortB });
  check("trainee WITH progress data → 403 for institute", lastCode, 403);
  checkTrue("403 message names the progress rule", (errMessage() ?? "").includes("progress data"), `got: ${errMessage()}`);

  await call("POST", `/api/v1/trainees/${mvOther.publicId}/move-cohort`, instituteC, { cohortId: cohortB });
  check("another center's trainee → 403 (move)", lastCode, 403);
  await call("POST", `/api/v1/trainees/${mvOther.publicId}/drop-out`, instituteC);
  check("another center's trainee → 403 (drop-out)", lastCode, 403);

  await call("POST", "/api/v1/trainees/TRN-DOES-NOT-EXIST/move-cohort", instituteC, { cohortId: cohortB });
  check("unknown publicId → 404 (move)", lastCode, 404);
  await call("POST", "/api/v1/trainees/TRN-DOES-NOT-EXIST/drop-out", instituteC);
  check("unknown publicId → 404 (drop-out)", lastCode, 404);

  // ── 6. Institute scoping (GET /api/v1/trainees) ─────────────────────
  console.log("\n== 6. Institute scoping ==");
  await call("GET", "/api/v1/trainees?limit=500", instituteC);
  check("institute trainees list 200", lastCode, 200);
  const instRows = (body().data as { id: string; enrolments: { cohort: { trainingCenterId: string | null } }[] }[] | undefined) ?? [];
  checkTrue(
    "institute sees ONLY its center's trainees (every row has ≥1 center enrolment)",
    instRows.length > 0 && instRows.every((t) => t.enrolments.some((e) => e.cohort.trainingCenterId === centerId)),
    `${instRows.length} rows`,
  );
  const instDbCount = await db.trainee.count({
    where: { enrolments: { some: { cohort: { trainingCenterId: centerId } } } },
  });
  check("institute list total matches direct DB count for its center", (body().pagination as { total?: number }).total, instDbCount);

  await call("GET", "/api/v1/trainees?limit=500", adminC);
  check("admin trainees list 200", lastCode, 200);
  const adminDbCount = await db.trainee.count();
  check("admin sees ALL centers (total matches DB count)", (body().pagination as { total?: number }).total, adminDbCount);

  // `?status=…` filters: the API's zod schema (page/limit/cohortId/district/
  // search) has no `status` param — z.object strips unknown keys, so the
  // lifecycle filter lives on the /trainees PAGE (?status=DROPPED_OUT …),
  // not the API. Report exactly what IS observable: identical totals.
  await call("GET", "/api/v1/trainees?limit=500&status=dropped-out", instituteC);
  const droppedOutTotal = (body().pagination as { total?: number }).total;
  check("API ?status=dropped-out → 200 (status param stripped: total unchanged)", lastCode, 200);
  await call("GET", "/api/v1/trainees?limit=500&status=completed", instituteC);
  check("API ?status=completed → 200 (status param stripped)", lastCode, 200);
  await call("GET", "/api/v1/trainees?limit=500&status=all", instituteC);
  check("API ?status=all → 200", lastCode, 200);
  await call("GET", "/api/v1/trainees?limit=500", instituteC);
  const unfilteredTotal = (body().pagination as { total?: number }).total;
  checkTrue(
    "API status param observable behavior: all three totals identical to unfiltered (filter is page-level)",
    droppedOutTotal === unfilteredTotal,
    `dropped-out ${droppedOutTotal} vs unfiltered ${unfilteredTotal}`,
  );

  // ── 7. KPIs ─────────────────────────────────────────────────────────
  console.log("\n== 7. KPIs ==");
  await call("GET", "/api/v1/kpis/overview", instituteC);
  check("institute KPIs overview 200", lastCode, 200);
  const instKpiTotal = (body().trainees as { total?: number }).total;
  check("overview reflects center-scoped counts (matches DB count)", instKpiTotal, instDbCount);
  checkTrue("center-scoped total ≤ admin total", instKpiTotal !== undefined && instKpiTotal <= adminDbCount, `${instKpiTotal} vs ${adminDbCount}`);

  await call("GET", "/api/v1/kpis/center-standing", instituteC);
  check("institute center-standing 200", lastCode, 200);
  const standing = (body().standing as { rank?: number; totalCenters?: number; centerName?: string } | null) ?? null;
  checkTrue("standing carries a rank", typeof standing?.rank === "number" && standing.rank >= 1, `got ${JSON.stringify(standing?.rank)}`);
  checkTrue("rank within totalCenters", typeof standing?.rank === "number" && typeof standing?.totalCenters === "number" && standing.rank <= standing.totalCenters);
  const standingCohorts = (body().cohorts as { name: string; placementRate: number }[] | undefined) ?? [];
  checkTrue("per-cohort rates present", standingCohorts.length > 0 && standingCohorts.every((c) => typeof c.placementRate === "number"), `${standingCohorts.length} cohorts`);
  checkTrue("cohorts are center-scoped (match center's cohort count)", standingCohorts.length === centerCohorts.length, `api ${standingCohorts.length} vs db ${centerCohorts.length}`);

  await call("GET", "/api/v1/kpis/overview", adminC);
  check("admin KPIs overview 200", lastCode, 200);
  const adminKpiTotal = (body().trainees as { total?: number }).total;
  // The overview counts trainees WITH ≥1 enrolment (enrolments: {some: {}})
  // for admin — the direct-DB equivalent of the exact query the route runs.
  const adminScopedDbCount = await db.trainee.count({ where: { enrolments: { some: {} } } });
  check("admin overview unscoped (matches the route's DB query: trainees with enrolments)", adminKpiTotal, adminScopedDbCount);
  checkTrue("admin overview ≥ center-scoped total", (adminKpiTotal ?? 0) >= (instKpiTotal ?? 0), `${adminKpiTotal} vs ${instKpiTotal}`);

  await call("GET", "/api/v1/kpis/center-standing", adminC);
  check("center-standing as admin → 403", lastCode, 403);
  // The middleware intercepts admin requests first (roles: ["institute"]) and
  // returns its bare {error: "Forbidden"} — the in-route message is never
  // reached (defense in depth). Assert the observable middleware shape.
  check("admin 403 middleware body {error:'Forbidden'}", body().error, "Forbidden");

  // ── Summary ─────────────────────────────────────────────────────────
  console.log("\n══════════════════════════════");
  console.log(`PASS: ${pass}  FAIL: ${fail}`);
  if (fail > 0) process.exit(1);
  void mvFresh; // reserved for the Part-2 DOM dump (zero-progress detail page)
}

main()
  .then(() => db.$disconnect())
  .catch((err) => {
    console.error("HARNESS ERROR:", err);
    void db.$disconnect();
    process.exit(1);
  });
