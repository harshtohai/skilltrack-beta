// Headless flow: login as admin → dashboard → theme toggle → sidebar toggle.
// Captures screenshots at each step. Throwaway/dev verification tool.
import { chromium } from "playwright-core";

const executablePath = process.env.CHROME_PATH ?? "/opt/google/chrome/chrome";
const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const errors = [];
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text().slice(0, 200)); });
page.on("pageerror", (err) => errors.push(`PAGEERROR: ${String(err).slice(0, 200)}`));

// 1. Login as admin (role picker: 4th card = Government Admin)
await page.goto("http://localhost:3000/login", { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(800);
// Click the "Government Admin" role card
await page.getByText("Government Admin", { exact: false }).first().click().catch((e) => errors.push(`role click: ${e.message.slice(0, 100)}`));
await page.waitForTimeout(500);
await page.fill('input[type="email"]', "admin@maharashtra.gov.in").catch((e) => errors.push(`email fill: ${e.message.slice(0, 100)}`));
await page.fill('input[type="password"]', "admin123").catch((e) => errors.push(`pw fill: ${e.message.slice(0, 100)}`));
await page.waitForTimeout(300);
await page.screenshot({ path: "shots/flow-before-submit.png" });
await page.click('button[type="submit"]').catch(async (e) => {
  errors.push(`submit: ${e.message.slice(0, 100)}`);
  await page.getByRole("button", { name: /sign in/i }).first().click().catch((e2) => errors.push(`submit2: ${e2.message.slice(0, 100)}`));
});
await page.waitForTimeout(25000);
console.log("after-login url:", page.url());
console.log("action errors:", errors.length ? errors : "none");
await page.screenshot({ path: "shots/flow-dashboard-light.png" });

// 2. Toggle theme to dark via the user menu (sidebar footer)
const userMenu = page.getByLabel("Open user menu").first();
if (await userMenu.isVisible().catch(() => false)) {
  await userMenu.click();
  await page.waitForTimeout(500);
  await page.getByText("Dark", { exact: true }).first().click().catch((e) => errors.push(`dark click: ${e.message.slice(0, 100)}`));
  await page.waitForTimeout(1000);
} else {
  errors.push("user menu not visible");
}
await page.screenshot({ path: "shots/flow-dashboard-dark.png" });

// 3. Toggle the sidebar (collapsed state)
const trigger = page.getByLabel("Toggle sidebar").first();
if (await trigger.isVisible().catch(() => false)) {
  await trigger.click();
  await page.waitForTimeout(800);
} else {
  errors.push("sidebar trigger not visible");
}
await page.screenshot({ path: "shots/flow-dashboard-dark-collapsed.png" });

// 4. Toggle back to expanded + light, verify cookie
const trigger2 = page.getByLabel("Toggle sidebar").first();
await trigger2.click().catch(() => {});
await page.waitForTimeout(800);
const cookie = (await context.cookies()).find((c) => c.name === "sidebar:state");
console.log("sidebar cookie:", cookie?.value);
await page.screenshot({ path: "shots/flow-dashboard-light2.png" });

console.log("console errors:", errors.length ? errors.slice(0, 8) : "none");
await browser.close();
