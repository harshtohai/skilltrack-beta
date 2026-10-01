// Auth-aware screenshot harness for the Merivo reskin (throwaway/dev tool).
// Usage: USER=institute node scripts/shot-auth.mjs <path> [theme] [width] [outName] [clickTab]
// Logs in as a demo user (USER env var: admin default | institute | employer),
// then screenshots <path>.
// Theme: light | dark. Width: viewport width (default 1440).
// Requires the dev server on :3000. Chromium from /opt/google/chrome/chrome.
import { chromium } from "playwright-core";

const [, , urlPath = "/dashboard", themeArg = "light", widthArg = "1440", outArg, clickTab] = process.argv;
const width = parseInt(widthArg, 10);
const out = outArg ?? `shots/auth_${urlPath.replace(/\//g, "_") || "root"}-${themeArg}-${width}.png`;

const executablePath = process.env.CHROME_PATH ?? "/opt/google/chrome/chrome";

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const context = await browser.newContext({
  viewport: { width, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

// Set theme before load (next-themes reads localStorage "theme")
if (themeArg === "dark") {
  await page.addInitScript(() => {
    try { localStorage.setItem("theme", "dark"); } catch {}
  });
}

// Log in as a demo user (creds shown on the login page itself). USER env var
// selects the role: admin (default) | institute | employer | none (skip login —
// for public/unauthenticated pages like the magic-link portal).
const DEMO_USERS = {
  admin: { radio: "Government Admin", email: "admin@maharashtra.gov.in", password: "admin123" },
  institute: { radio: "Training Institute", email: "institute@pmkvy.gov.in", password: "institute123" },
  employer: { radio: "Employer", email: "hr@company.com", password: "employer123" },
};
if (process.env.USER !== "none") {
  const user = DEMO_USERS[process.env.USER in DEMO_USERS ? process.env.USER : "admin"];
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle", timeout: 30000 });
  await page.getByRole("radio", { name: user.radio }).click();
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/analytics", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
}

// Optional: mint a trainee session first by consuming a magic-link token
// (the verify POST sets the session cookie), then navigate to the target path.
if (process.env.TRAINEE_TOKEN) {
  await page
    .goto(`http://localhost:3000/auth/trainee/${process.env.TRAINEE_TOKEN}`, {
      waitUntil: "networkidle",
      timeout: 30000,
    })
    .catch(() => {});
  // Wait until verification actually completes: the "Edit profile" button
  // only renders once the profile loaded (cookie is set by then).
  await page
    .getByRole("button", { name: "Edit profile" })
    .waitFor({ timeout: 20000 })
    .catch(() => {});
  await page.waitForTimeout(1500);
}

// Navigate to the target path
await page.goto(`http://localhost:3000${urlPath}`, { waitUntil: "networkidle", timeout: 30000 }).catch(async () => {
  await page.goto(`http://localhost:3000${urlPath}`, { waitUntil: "load", timeout: 30000 });
});
await page.waitForTimeout(parseInt(process.env.WAIT_MS ?? "6000", 10));

// Optional: open a tab (e.g. "Verification Queue") before the shot
if (clickTab) {
  await page.getByRole("tab", { name: clickTab }).click();
  await page.waitForTimeout(3000);
}

await page.screenshot({ path: out, fullPage: process.env.FULL_PAGE === "1" });
console.log(out);
await browser.close();
