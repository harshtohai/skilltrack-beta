// Auth-aware screenshot harness for the Merivo reskin (throwaway/dev tool).
// Usage: node scripts/shot-auth.mjs <path> [theme] [width] [outName]
// Logs in as the government admin demo user, then screenshots <path>.
// Theme: light | dark. Width: viewport width (default 1440).
// Requires the dev server on :3000. Chromium from /opt/google/chrome/chrome.
import { chromium } from "playwright-core";

const [, , urlPath = "/dashboard", themeArg = "light", widthArg = "1440", outArg] = process.argv;
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

// Log in as government admin (demo creds shown on the login page itself)
await page.goto("http://localhost:3000/login", { waitUntil: "networkidle", timeout: 30000 });
await page.getByRole("radio", { name: /Government Admin/ }).click();
await page.fill('input[name="email"]', "admin@maharashtra.gov.in");
await page.fill('input[name="password"]', "admin123");
await page.click('button[type="submit"]');
await page.waitForURL("**/admin/analytics", { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(1500);

// Navigate to the target path
await page.goto(`http://localhost:3000${urlPath}`, { waitUntil: "networkidle", timeout: 30000 }).catch(async () => {
  await page.goto(`http://localhost:3000${urlPath}`, { waitUntil: "load", timeout: 30000 });
});
await page.waitForTimeout(1200);

await page.screenshot({ path: out, fullPage: process.env.FULL_PAGE === "1" });
console.log(out);
await browser.close();
