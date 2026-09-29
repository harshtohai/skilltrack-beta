/**
 * JOB-06 E2E smoke — full Job Board flow against a running dev server.
 *
 * Usage:
 *   npm run dev            # in one shell
 *   npx tsx scripts/verify-job-board.ts            # against localhost:3000
 *   BASE=https://skilltrack-cyan.vercel.app npx tsx scripts/verify-job-board.ts
 *
 * Requires .env with AUTH_SECRET (JWTs are minted directly, same encode()
 * the trainee verify route uses — no browser needed). Creates real DB rows
 * (SmokeTest employer/jobs/applications/signal) — that's the point: the
 * hire must land in the outcomes pipeline and move the gov analytics.
 */
import { encode } from "next-auth/jwt";
import { readFileSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3000";
const TRAINEE_ID = "622be85f-ac10-409b-b493-0c8e9592d75a"; // Chandrapur test trainee

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

if (!process.env.AUTH_SECRET) {
  console.error("AUTH_SECRET missing in .env");
  process.exit(1);
}

let pass = 0;
let fail = 0;
const ok = (msg: string) => { pass += 1; console.log(`  ✓ ${msg}`); };
const bad = (msg: string) => { fail += 1; console.log(`  ✗ ${msg}`); };
function check(desc: string, actual: unknown, expected: unknown) {
  if (actual === expected) ok(desc);
  else bad(`${desc} — got: ${JSON.stringify(actual)}, want: ${JSON.stringify(expected)}`);
}

/** Session cookie for a role, minted directly (mirrors trainee verify route). */
async function mint(sub: string, role: string, email: string | null = null) {
  const token = await encode({
    secret: process.env.AUTH_SECRET!,
    salt: "authjs.session-token",
    maxAge: 60 * 60 * 24 * 30,
    token: { sub, role, email, name: "" },
  });
  return `authjs.session-token=${token}`;
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

/** Real credentials login (tests the scrypt rewrite in authorize()). */
async function credsLogin(email: string, password: string, role: string): Promise<boolean> {
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
  // The callback response carries the session cookie — probe the session
  // endpoint with it. undici joins multiple Set-Cookie headers, so pick the
  // session-token one explicitly. /api/auth/session returns a bare `null`
  // body when unauthenticated, so guard the parse.
  const sessionCookie =
    callbackRes.headers
      .getSetCookie()
      .find((c) => c.startsWith("authjs.session-token=") || c.startsWith("__Secure-authjs.session-token="))
      ?.split(";")[0] ?? "";
  const sessionRes = await fetch(`${BASE}/api/auth/session`, {
    headers: { Cookie: sessionCookie },
  });
  const text = await sessionRes.text();
  let session: { user?: { email?: string | null } } | null = null;
  try {
    session = JSON.parse(text) as { user?: { email?: string | null } } | null;
  } catch {
    session = null;
  }
  return session?.user?.email?.trim().toLowerCase() === email.trim().toLowerCase();
}

async function main() {
  const ts = Date.now();
  const smokeEmail = `smoke-${ts}@company.com`;

  // ── Health ──────────────────────────────────────────────────────────
  console.log("\n== Health ==");
  await call("GET", "/api/v1/health", "");
  check("health endpoint responds", lastCode, 200);

  // ── Unlisted employer signup (public) ───────────────────────────────
  console.log("\n== Unlisted employer signup ==");
  await call("POST", "/api/v1/employer/register", "", {
    companyName: "SmokeTest Corp",
    contactEmail: smokeEmail,
    password: "smokepass123",
    sector: "IT",
    district: "Chandrapur",
    registrationNo: "27SMOKE1234A1Z5",
    hiringNeeds: "Smoke testing",
    employeeCount: 10,
  });
  check("register returns 201", lastCode, 201);
  const newEmpId = body().employer ? (body().employer as { id: string }).id : "";
  check("verificationStatus PENDING", (body().employer as { verificationStatus?: string })?.verificationStatus, "PENDING");
  await call("POST", "/api/v1/employer/register", "", {
    companyName: "Dup Corp",
    contactEmail: smokeEmail,
    password: "smokepass123",
    sector: "IT",
    district: "Chandrapur",
  });
  check("duplicate contactEmail → 409", lastCode, 409);

  // ── Credentials logins (scrypt rewrite) ─────────────────────────────
  console.log("\n== Credentials logins ==");
  (await credsLogin("admin@maharashtra.gov.in", "admin123", "admin"))
    ? ok("admin login") : bad("admin login");
  (await credsLogin("hr@company.com", "employer123", "employer"))
    ? ok("demo employer login (TechCorp, scrypt)") : bad("demo employer login (TechCorp, scrypt)");
  (await credsLogin(smokeEmail, "smokepass123", "employer"))
    ? ok("PENDING employer can log in") : bad("PENDING employer can log in");

  const adminC = await mint("admin-001", "admin", "admin@maharashtra.gov.in");
  // Employer cookies must carry the REAL Employers row id — the routes
  // resolve db.employer.findUnique({ where: { id: session.user.id } }).
  const TECHCORP_ID = "b69dd1d4-d722-4519-92e7-a4524c9a5c14"; // seeded demo employer
  const demoC = await mint(TECHCORP_ID, "employer", "hr@company.com");
  const newC = await mint(newEmpId, "employer", smokeEmail);
  const trainC = await mint(TRAINEE_ID, "trainee");

  // Resolve the real employer ids for scoped calls (admin queue is the
  // source of truth; the demo employer's id comes from its jobs list).
  await call("GET", "/api/v1/employer/jobs", demoC);
  const demoEmpId = (body().employer as { id?: string })?.id ?? "";

  // ── PENDING employer cannot post ────────────────────────────────────
  console.log("\n== PENDING employer blocked from posting ==");
  await call("POST", "/api/v1/employer/jobs", newC, {
    title: "Blocked Role",
    description: "Should be rejected while pending.",
    employmentType: "FULL_TIME",
    workMode: "ONSITE",
    district: "Chandrapur",
    skillsRequired: ["Testing"],
  });
  check("PENDING post → 403", lastCode, 403);

  // ── Admin verification queue ────────────────────────────────────────
  console.log("\n== Admin verification queue ==");
  await call("GET", "/api/v1/admin/employers/pending", adminC);
  check("queue responds 200", lastCode, 200);
  const pendingNames = (body().employers as { companyName: string }[] | undefined)?.map((e) => e.companyName) ?? [];
  check("queue contains SmokeTest Corp", pendingNames.includes("SmokeTest Corp"), true);
  await call("POST", `/api/v1/admin/employers/${newEmpId}/verify`, adminC, { decision: "VERIFIED" });
  check("verify → 200 VERIFIED", (body().employer as { verificationStatus?: string })?.verificationStatus, "VERIFIED");

  // ── Employer job CRUD ───────────────────────────────────────────────
  console.log("\n== Employer job CRUD ==");
  await call("POST", "/api/v1/employer/jobs", newC, {
    title: "Smoke Test Role",
    description: "Automated smoke test position for verification.",
    employmentType: "FULL_TIME",
    workMode: "ONSITE",
    district: "Chandrapur",
    skillsRequired: ["Testing"],
    openings: 1,
  });
  check("VERIFIED post → 201", lastCode, 201);
  // POST returns { job: … } (employerJobSchema wrapped).
  const job1 = (body().job as { id?: string } | undefined)?.id ?? "";
  await call("GET", "/api/v1/employer/jobs", demoC);
  check("demo employer jobs list 200", lastCode, 200);
  check("TechCorp verificationStatus VERIFIED", (body().employer as { verificationStatus?: string })?.verificationStatus, "VERIFIED");
  await call("POST", "/api/v1/employer/jobs", demoC, {
    title: "Demo QA Role",
    description: "Second smoke test position for withdraw flow.",
    employmentType: "CONTRACT",
    workMode: "REMOTE",
    district: "Chandrapur",
    skillsRequired: ["QA"],
    openings: 1,
    salaryBand: "B_10_20K",
  });
  check("demo employer post → 201", lastCode, 201);
  const job2 = (body().job as { id?: string } | undefined)?.id ?? "";
  await call("PATCH", `/api/v1/employer/jobs/${job2}`, demoC, { status: "CLOSED" });
  check("close job → CLOSED", (body().job as { status?: string } | undefined)?.status, "CLOSED");
  await call("PATCH", `/api/v1/employer/jobs/${job2}`, demoC, { status: "OPEN" });
  check("re-open job → OPEN", (body().job as { status?: string } | undefined)?.status, "OPEN");

  // ── Trainee browse + relevance sort ─────────────────────────────────
  console.log("\n== Trainee browse + relevance sort ==");
  await call("GET", "/api/v1/trainee/jobs", trainC);
  check("trainee jobs 200", lastCode, 200);
  const jobs = (body().jobs as { id: string; district: string; retention: { hires: number } }[] | undefined) ?? [];
  // Contains-based: leftover smoke jobs from earlier runs may also be visible.
  check("both new jobs visible", jobs.some((j) => j.id === job1) && jobs.some((j) => j.id === job2), true);
  check("same district (Chandrapur) first", jobs[0]?.district, "Chandrapur");
  check("retention hires field present", typeof jobs[0]?.retention?.hires === "number", true);

  // ── Apply + duplicate guard ─────────────────────────────────────────
  console.log("\n== Apply ==");
  await call("POST", `/api/v1/trainee/jobs/${job1}/apply`, trainC);
  check("apply → 201 APPLIED", (body().application as { status?: string })?.status, "APPLIED");
  await call("POST", `/api/v1/trainee/jobs/${job1}/apply`, trainC);
  check("duplicate apply → 409", lastCode, 409);

  // ── Applicants + contact reveal + hire ──────────────────────────────
  console.log("\n== Applicants + contact reveal + hire ==");
  await call("GET", `/api/v1/employer/jobs/${job1}/applicants`, newC);
  check("applicants list 200", lastCode, 200);
  const applicant = (body().applicants as {
    applicationId: string;
    phoneMasked: string;
    phone?: string;
  }[] | undefined)?.[0];
  check("phone masked before shortlist", /\*{4,}[0-9]{4}$/.test(applicant?.phoneMasked ?? ""), true);
  check("full phone hidden before shortlist", Boolean(applicant?.phone), false);
  await call("POST", `/api/v1/employer/jobs/${job1}/applicants/${applicant?.applicationId}/shortlist`, newC);
  check("shortlist → 200 SHORTLISTED", (body().application as { status?: string })?.status, "SHORTLISTED");
  await call("GET", `/api/v1/employer/jobs/${job1}/applicants`, newC);
  const shortlistedApplicant = (body().applicants as { phone?: string }[] | undefined)?.[0];
  check("full phone revealed after shortlist", Boolean(shortlistedApplicant?.phone), true);
  await call("POST", `/api/v1/employer/jobs/${job1}/applicants/${applicant?.applicationId}/hire`, newC);
  check("hire → 200 HIRED", (body().application as { status?: string })?.status, "HIRED");
  check("auto-close when openings filled", (body() as { jobClosed?: boolean }).jobClosed, true);

  // ── Auto-closed job hidden from trainees ────────────────────────────
  console.log("\n== Auto-closed hidden from trainees ==");
  await call("GET", "/api/v1/trainee/jobs", trainC);
  const remainingJobs = (body().jobs as { id: string }[] | undefined) ?? [];
  check("hired job no longer listed", remainingJobs.some((j) => j.id === job1), false);

  // ── My applications + employer contact ──────────────────────────────
  console.log("\n== My applications ==");
  await call("GET", "/api/v1/trainee/applications", trainC);
  check("applications list 200", lastCode, 200);
  const apps = (body().applications as {
    jobPostingId: string;
    status: string;
    employerContactEmail: string | null;
  }[] | undefined) ?? [];
  const hiredApp = apps.find((a) => a.jobPostingId === job1);
  check("hire visible with employer contact", Boolean(hiredApp?.employerContactEmail), true);
  check("hire status HIRED", hiredApp?.status, "HIRED");

  // ── Withdraw + re-apply ─────────────────────────────────────────────
  console.log("\n== Withdraw + re-apply ==");
  await call("POST", `/api/v1/trainee/jobs/${job2}/apply`, trainC);
  check("apply to second job → 201", lastCode, 201);
  const app2 = (body().application as { id?: string } | undefined)?.id ?? "";
  await call("POST", `/api/v1/trainee/applications/${app2}/withdraw`, trainC);
  check("withdraw → 200 WITHDRAWN", (body().application as { status?: string })?.status, "WITHDRAWN");
  await call("POST", `/api/v1/trainee/jobs/${job2}/apply`, trainC);
  check("re-apply after withdraw → 201", lastCode, 201);

  // ── Job seek signal ─────────────────────────────────────────────────
  console.log("\n== Job seek signal ==");
  await call("POST", "/api/v1/trainee/job-seek-signal", trainC, { reason: "NO_JOBS" });
  check("signal → 201 with district", (body().signal as { district?: string })?.district, "Chandrapur");

  // ── Gov marketplace analytics ───────────────────────────────────────
  console.log("\n== Gov marketplace analytics ==");
  await call("GET", "/api/v1/outcomes/government", adminC);
  check("gov analytics 200", lastCode, 200);
  const gov = body() as Record<string, unknown>;
  check("jobMarketplace section present", "jobMarketplace" in gov, true);
  const marketplace = gov.jobMarketplace as {
    hires: number;
    hireRate: number | null;
    demandGaps: { district: string }[];
    employerReliability: unknown[];
  } | undefined;
  check("hires ≥ 1", (marketplace?.hires ?? 0) >= 1, true);
  check("hireRate not null", marketplace?.hireRate !== null && marketplace?.hireRate !== undefined, true);
  check(
    "demandGaps include Chandrapur",
    marketplace?.demandGaps?.some((g) => g.district === "Chandrapur"),
    true,
  );
  check("employerReliability present", (marketplace?.employerReliability?.length ?? 0) >= 1, true);
  check("existing fields intact (monthlyData)", "monthlyData" in gov, true);

  // ── Suspend lever ───────────────────────────────────────────────────
  console.log("\n== Suspend lever ==");
  // Give the smoke employer a fresh open job, then suspend it — its open
  // jobs must vanish from the trainee view (job2 belongs to TechCorp).
  await call("POST", "/api/v1/employer/jobs", newC, {
    title: "Suspend Bait Role",
    description: "Open job that must disappear once the employer is suspended.",
    employmentType: "PART_TIME",
    workMode: "ONSITE",
    district: "Chandrapur",
    skillsRequired: ["Testing"],
    openings: 1,
  });
  check("third job posted → 201", lastCode, 201);
  const job3 = (body().job as { id?: string } | undefined)?.id ?? "";
  await call("POST", `/api/v1/admin/employers/${newEmpId}/suspend`, adminC, { reason: "Smoke test suspension" });
  check("suspend → 200 SUSPENDED", (body().employer as { verificationStatus?: string })?.verificationStatus, "SUSPENDED");
  await call("GET", "/api/v1/trainee/jobs", trainC);
  const afterSuspend = (body().jobs as { id: string }[] | undefined) ?? [];
  check("suspended employer's open jobs hidden", afterSuspend.some((j) => j.id === job3), false);

  // ── Audit trail ─────────────────────────────────────────────────────
  console.log("\n== Audit trail ==");
  await call("GET", "/api/v1/audit-logs?limit=100", adminC);
  check("audit-logs 200", lastCode, 200);
  const actions = ((body().data as { action: string }[] | undefined) ?? []).map((a) => a.action);
  check("VERIFY_EMPLOYER audited", actions.includes("VERIFY_EMPLOYER"), true);
  check("SUSPEND_EMPLOYER audited", actions.includes("SUSPEND_EMPLOYER"), true);

  console.log("\n══════════════════════════════");
  console.log(`PASS: ${pass}  FAIL: ${fail}`);
  if (fail > 0) process.exit(1);
  void demoEmpId;
}

main().catch((err) => {
  console.error("HARNESS ERROR:", err);
  process.exit(1);
});
