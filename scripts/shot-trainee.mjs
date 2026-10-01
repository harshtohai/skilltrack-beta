// Trainee-session screenshot harness (throwaway/dev tool).
// Usage: node scripts/shot-trainee.mjs <path> [theme] [width] [outName]
// Mints the trainee session cookie directly (same encode() the verify route
// uses — mirrors scripts/verify-job-board.ts), injects it, screenshots <path>.
// Requires .env with AUTH_SECRET and the dev server on :3000.
import { encode } from "next-auth/jwt";
import { readFileSync } from "node:fs";
import { chromium } from "playwright-core";

const [, , urlPath = "/dashboard", themeArg = "light", widthArg = "1440", outArg, clickTab] = process.argv;
const width = parseInt(widthArg, 10);
const out = outArg ?? `shots/trainee_${urlPath.replace(/\//g, "_") || "root"}-${themeArg}-${width}.png`;
const executablePath = process.env.CHROME_PATH ?? "/opt/google/chrome/chrome";

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

const TRAINEE_ID = "622be85f-ac10-409b-b493-0c8e9592d75a"; // Chandrapur test trainee
const COOKIE_NAME = "authjs.session-token"; // HTTP target (see verify-job-board.ts)

const token = await encode({
  secret: process.env.AUTH_SECRET,
  salt: COOKIE_NAME,
  token: { sub: TRAINEE_ID, role: "trainee", email: "", name: "" },
});

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const context = await browser.newContext({
  viewport: { width, height: 900 },
  deviceScaleFactor: 1,
});
await context.addCookies([
  { name: COOKIE_NAME, value: token, url: "http://localhost:3000" },
]);
const page = await context.newPage();

if (themeArg === "dark") {
  await page.addInitScript(() => {
    try { localStorage.setItem("theme", "dark"); } catch {}
  });
}

await page.goto(`http://localhost:3000${urlPath}`, { waitUntil: "networkidle", timeout: 30000 }).catch(async () => {
  await page.goto(`http://localhost:3000${urlPath}`, { waitUntil: "load", timeout: 30000 });
});
await page.waitForTimeout(6000);

// Optional: open a tab (e.g. "My Applications") before the shot
if (clickTab) {
  await page.getByRole("tab", { name: clickTab }).click();
  await page.waitForTimeout(2000);
}

await page.screenshot({ path: out, fullPage: process.env.FULL_PAGE === "1" });
console.log(out);
await browser.close();
