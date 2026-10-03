// Feature-set (feat/auth-institute) DOM-dump harness for the CHANGED/NEW
// surfaces' interactive states (throwaway/dev tool, shot-auth.mjs pattern).
// Usage: STATE=<state> THEME=light node scripts/shot-featset.mjs
// States: signup-selfdescribe | login-needsverification | login-429 |
//         sent-fresh | sent-resend | detail-move | detail-drop | add-duplicate
// Requires the dev server on :3000. Chromium from /opt/google/chrome/chrome.
// Smoke identifiers come from scripts/verify-feature-set.ts's latest run
// (override via SMOKE_UNV / SMOKE_VER / SMOKE_MOVE / SMOKE_DROP env vars).
import { chromium } from "playwright-core";

const BASE = "http://localhost:3000";
const state = process.env.STATE ?? "signup-selfdescribe";
const theme = process.env.THEME ?? "light";
const width = parseInt(process.env.WIDTH ?? "1440", 10);
const SMOKE_UNV = process.env.SMOKE_UNV ?? "smoke-unv-1790982235459@company.com";
const SMOKE_VER = process.env.SMOKE_VER ?? "smoke-ver-1790982235459@company.com";
const SMOKE_MOVE = process.env.SMOKE_MOVE ?? "TRN-SMK-MURKL5D8-47"; // ACTIVE, zero followups
const SMOKE_DROP = process.env.SMOKE_DROP ?? "TRN-SMK-MURKL17D-17"; // DROPPED_OUT (timeline node)
const executablePath = process.env.CHROME_PATH ?? "/opt/google/chrome/chrome";

const INSTITUTE = { radio: "Training Institute", email: "institute@pmkvy.gov.in", password: "institute123" };

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
const page = await context.newPage();

if (theme === "dark") {
  await page.addInitScript(() => {
    try { localStorage.setItem("theme", "dark"); } catch {}
  });
}

async function loginInstitute() {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 30000 });
  await page.getByRole("radio", { name: INSTITUTE.radio }).click();
  await page.fill('input[name="email"]', INSTITUTE.email);
  await page.fill('input[name="password"]', INSTITUTE.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/analytics", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
}

const shot = async (name) => {
  const out = `shots/featset-${name}-${theme}-${width}.png`;
  await page.screenshot({ path: out, fullPage: process.env.FULL_PAGE === "1" });
  console.log(out);
};

if (state === "signup-selfdescribe") {
  // Gender Select + the self-describe reveal (AUTH-02 §9.3 rework).
  await page.goto(`${BASE}/signup`, { waitUntil: "networkidle", timeout: 30000 });
  await page.getByRole("combobox").nth(0).click(); // district select is [0]? open both to be sure
  await page.keyboard.press("Escape");
  await page.getByRole("combobox").nth(1).click();
  await page.getByRole("option", { name: "Prefer to self-describe" }).click();
  await page.waitForTimeout(800);
  await shot("signup-selfdescribe");
} else if (state === "login-needsverification") {
  // Submit an unverified trainee's email → the needs-verification alert (CL-31).
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 30000 });
  await page.fill('input[name="email"]', SMOKE_UNV);
  await page.click('button[type="submit"]');
  await page.getByText("Verify your enrollment first").waitFor({ timeout: 20000 });
  await page.waitForTimeout(500);
  await shot("login-needsverification");
} else if (state === "login-429") {
  // Double-submit: first send succeeds (200 → /sent), back → again within 30s
  // → 429 → the destructive error banner. This is the magic-link error state.
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 30000 });
  await page.fill('input[name="email"]', SMOKE_VER);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/auth/trainee/sent**", { timeout: 20000 }).catch(() => {});
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 30000 });
  await page.fill('input[name="email"]', SMOKE_VER);
  await page.click('button[type="submit"]');
  await page.getByText("Too many requests").waitFor({ timeout: 30000 });
  await page.waitForTimeout(500);
  await shot("login-magic-link-429");
} else if (state === "sent-fresh") {
  // Fresh sent page: conditional copy + the 30s resend countdown on mount.
  await page.goto(`${BASE}/auth/trainee/sent?email=${encodeURIComponent(SMOKE_VER)}`, {
    waitUntil: "networkidle", timeout: 30000,
  });
  await page.waitForTimeout(800);
  await shot("sent-fresh-countdown");
} else if (state === "sent-resend") {
  // Wait out the mount countdown, hit Resend → success toast + cooldown reset.
  await page.goto(`${BASE}/auth/trainee/sent?email=${encodeURIComponent(SMOKE_VER)}`, {
    waitUntil: "networkidle", timeout: 30000,
  });
  await page.waitForTimeout(31000); // countdown 30s → button enabled
  await page.getByRole("button", { name: "Resend link" }).click();
  await page.waitForTimeout(2500); // POST resolves (200 or 429), toast + cooldown visible
  await shot("sent-resend-after");
} else if (state === "detail-move") {
  // Trainee detail as the institute: the Move-to-cohort Dialog (INST-03).
  await loginInstitute();
  await page.goto(`${BASE}/trainees/${SMOKE_MOVE}`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: "Move to cohort…" }).click();
  await page.getByRole("dialog").waitFor({ timeout: 10000 });
  await page.waitForTimeout(500);
  await shot("trainee-detail-move-dialog");
} else if (state === "detail-drop") {
  // The kebab's "Mark as dropped out" → the AlertDialog (CL-18). Screenshot
  // only — never confirm (that would actually drop the trainee).
  await loginInstitute();
  await page.goto(`${BASE}/trainees/${SMOKE_MOVE}`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("menuitem", { name: "Mark as dropped out" }).click();
  await page.getByRole("alertdialog").waitFor({ timeout: 10000 });
  await page.waitForTimeout(500);
  await shot("trainee-detail-dropout-alert");
} else if (state === "add-duplicate") {
  // Add-trainee: fill with a phone that already exists → 409 PHONE_EXISTS
  // inline on the field + "Sign in instead" link (INST-02). The programme is
  // picked by name from the center-standing API (the first alphabetical
  // programme may have no cohorts at this center — its cohort select renders
  // only the disabled "No cohorts" item).
  const phone = process.env.PHONE10 ?? "9526041908"; // smoke-signup trainee's mobile
  const email = `smoke-dupform-${Date.now()}@company.com`;
  await loginInstitute();
  const standingRes = await context.request.get(`${BASE}/api/v1/kpis/center-standing`);
  const standing = await standingRes.json();
  const programmeName = standing.cohorts?.[0]?.programme ?? "";
  await page.goto(`${BASE}/trainees/add`, { waitUntil: "networkidle", timeout: 30000 });
  await page.getByRole("button", { name: "Add trainee" }).waitFor({ timeout: 20000 });
  await page.getByPlaceholder("e.g. Priya Sharma").fill("Smoke Dup Form");
  await page.getByPlaceholder("9876543210").fill(phone);
  await page.getByPlaceholder("trainee@email.com").fill(email);
  // Dependent Selects: pick the programme → cohort select enables.
  await page.locator('button[role="combobox"]', { hasText: "Select programme" }).click();
  await page.getByRole("option", { name: programmeName }).click();
  await page.waitForTimeout(400);
  await page.locator('button[role="combobox"]', { hasText: "Select cohort" }).click();
  await page.locator('[role="option"]:not([data-disabled])').first().click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: "Add trainee" }).click();
  await page.getByText("An account with this phone number already exists").waitFor({ timeout: 20000 });
  await page.waitForTimeout(500);
  await shot("add-trainee-duplicate-error");
} else {
  console.error(`Unknown STATE: ${state}`);
  await browser.close();
  process.exit(1);
}

await browser.close();
