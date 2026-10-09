// Empty-space sweep for the Merivo reskin (dev tool).
// Usage: node scripts/sweep-space.mjs [width]
// Default suite: main pages at 1440x900 + a 420px mobile pass on the
// placement-band pages. With a width arg, every page runs at that width.
// Per page measures: document scrollHeight vs viewport height (unwanted page
// scroll), dead space below the last content element, oversized empty
// containers (asymmetric gaps only — centered shells are designed), and
// internally clipped/overflowing sections. Prints a compact offender list.
// Authed pages log in per role (pattern reused from shot-auth.mjs). Requires
// the dev server on :3000. Chromium from /opt/google/chrome/chrome.
import { chromium } from "playwright-core";

const [, , widthArg] = process.argv;
const BASE = "http://localhost:3000";
const executablePath = process.env.CHROME_PATH ?? "/opt/google/chrome/chrome";

// Public pages; the three carrying the placement band also get the mobile pass.
const PUBLIC = ["/", "/signup", "/login", "/employer/register"];
const MOBILE_PASS = ["/", "/signup", "/employer/register"];
// Authed pages per role (one login per role, then each page in the session).
const AUTHED = [
  { role: "admin", pages: ["/dashboard", "/trainees"] },
  { role: "institute", pages: ["/dashboard", "/institute/analytics"] },
];
// Centered/split auth shells (S4/S5) must fit 100svh — scroll there is an offender.
const AUTH_PATHS = new Set(["/signup", "/login", "/employer/register"]);

const DEMO_USERS = {
  admin: { radio: "Government Admin", email: "admin@maharashtra.gov.in", password: "admin123" },
  institute: { radio: "Training Institute", email: "institute@pmkvy.gov.in", password: "institute123" },
  employer: { radio: "Employer", email: "hr@company.com", password: "employer123" },
};

// Runs in the page: measures scroll, dead space, empty containers, clipped sections.
function measure() {
  const vh = window.innerHeight;
  const docH = document.documentElement.scrollHeight;

  const isVisible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none") return false;
    if (s.position === "fixed") return false; // toasts/floating layers aren't page content
    return true;
  };
  const isContent = (el) => {
    const hasText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
    const t = el.tagName;
    return hasText || t === "IMG" || t === "SVG" || t === "CANVAS" || t === "VIDEO" ||
      t === "BUTTON" || t === "INPUT" || t === "SELECT" || t === "TEXTAREA" || t === "A";
  };
  const desc = (el) => {
    const raw = typeof el.className === "string" ? el.className : el.className?.baseVal ?? "";
    const slot = el.getAttribute?.("data-slot");
    const name = slot ?? raw.trim().split(/\s+/).slice(0, 4).join(".");
    return `${el.tagName.toLowerCase()}${name ? `.${name}` : ""}`;
  };

  const isClipped = (el) => {
    // box visually clipped by an overflow-hidden ancestor (e.g. sr-only tables,
    // decorative sections) — not page content, must not drive measurements
    const r = el.getBoundingClientRect();
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (s.overflow === "hidden" || s.overflow === "clip" || s.overflowY === "hidden") {
        const ar = a.getBoundingClientRect();
        if (r.bottom > ar.bottom + 1 || r.top < ar.top - 1 || r.right > ar.right + 1) return true;
      }
    }
    return false;
  };

  // 1. last content element on the page
  let lastBottom = 0;
  let lastEl = null;
  for (const el of document.querySelectorAll("body *")) {
    if (!isVisible(el) || !isContent(el) || isClipped(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.bottom > lastBottom) {
      lastBottom = r.bottom;
      lastEl = el;
    }
  }

  // 2. oversized empty containers: filled/bordered boxes >= 160px tall whose
  //    content leaves an asymmetric gap larger than one spacing step (48px)
  //    above their bottom edge. Centered (symmetric) space is designed — skip.
  const empties = [];
  for (const el of document.querySelectorAll("body *")) {
    if (!isVisible(el)) continue;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.height < 160 || r.height >= vh - 1) continue; // page-level shells report via deadSpace
    if (parseFloat(s.paddingBottom) > 48) continue; // designed marketing rhythm (py-24)
    const filled = s.backgroundColor !== "rgba(0, 0, 0, 0)" || s.borderTopWidth !== "0px" || s.borderBottomWidth !== "0px";
    if (!filled) continue;
    let childBottom = 0;
    let childTop = Infinity;
    for (const c of el.querySelectorAll("*")) {
      if (!isVisible(c) || !isContent(c) || isClipped(c)) continue;
      const cr = c.getBoundingClientRect();
      if (cr.bottom > childBottom) childBottom = cr.bottom;
      if (cr.top < childTop) childTop = cr.top;
    }
    if (childBottom === 0 || childTop === Infinity) continue;
    const padT = parseFloat(s.paddingTop) || 0;
    const padB = parseFloat(s.paddingBottom) || 0;
    const gapBelow = r.bottom - padB - childBottom;
    const gapAbove = childTop - (r.top + padT);
    if (gapBelow > 48 && Math.abs(gapBelow - gapAbove) > 8) {
      empties.push({ el: desc(el), h: Math.round(r.height), gap: Math.round(gapBelow) });
    }
  }
  empties.sort((a, b) => b.gap - a.gap);

  // 3. internally clipped/overflowing sections (content taller than the box),
  //    excluding designed scroll containers (ScrollArea / native overflow-y)
  const clipped = [];
  for (const el of document.querySelectorAll("body *")) {
    if (!isVisible(el)) continue;
    if (el.matches('[data-slot="scroll-area"], .sr-only')) continue;
    const s = getComputedStyle(el);
    if (s.overflowY === "auto" || s.overflowY === "scroll") continue;
    if (el.scrollHeight > el.clientHeight + 8 && el.clientHeight > 0) {
      clipped.push({ el: desc(el), scroll: el.scrollHeight, client: el.clientHeight });
    }
  }
  clipped.sort((a, b) => b.scroll - b.client - (a.scroll - a.client));

  return {
    vh,
    docH: Math.round(docH),
    overflow: Math.round(docH - vh),
    deadSpace: Math.round(docH - lastBottom),
    last: lastEl ? desc(lastEl) : "none",
    empties: empties.slice(0, 3),
    clipped: clipped.slice(0, 3),
  };
}

async function login(page, role) {
  const user = DEMO_USERS[role];
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 30000 });
  await page.getByRole("radio", { name: user.radio }).click();
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/analytics", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
}

async function sweepEntry(browser, { width, role, pages }) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const out = [];
  try {
    if (role) {
      await login(page, role);
      if (page.url().includes("/login")) throw new Error("login did not complete");
    }
    for (const path of pages) {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 30000 }).catch(async () => {
        await page.goto(`${BASE}${path}`, { waitUntil: "load", timeout: 30000 });
      });
      // wait until real content (cards/tables) rendered — the pooler can be slow
      if (role) {
        await page.waitForSelector('main [data-slot="card"], main table', { timeout: 30000 }).catch(() => {});
      }
      await page.waitForTimeout(role ? 3000 : 1500);
      out.push({ path, ...(await page.evaluate(measure)) });
    }
  } finally {
    await context.close();
  }
  return out;
}

const label = (e) => `${e.pages.join("+")} @${e.width}${e.role ? ` as ${e.role}` : ""}`;

// Default suite: 1440x900 everywhere + 420 mobile pass on the touched pages.
// With a width arg: every page at that single width (extra verification).
const suite = [];
if (widthArg) {
  const width = parseInt(widthArg, 10);
  suite.push({ width, role: null, pages: PUBLIC });
  for (const run of AUTHED) suite.push({ width, ...run });
} else {
  suite.push({ width: 1440, role: null, pages: PUBLIC });
  for (const run of AUTHED) suite.push({ width: 1440, ...run });
  suite.push({ width: 420, role: null, pages: MOBILE_PASS });
}
const widths = widthArg ? [parseInt(widthArg, 10)] : [1440, 420];

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const results = [];
const failures = [];
for (const entry of suite) {
  let rows;
  try {
    rows = await sweepEntry(browser, entry);
  } catch (e) {
    console.error(`# retrying ${label(entry)} after: ${String(e).split("\n")[0]}`);
    try {
      rows = await sweepEntry(browser, entry);
    } catch (e2) {
      failures.push(`${label(entry)}: ${String(e2).split("\n")[0]}`);
      continue;
    }
  }
  for (const row of rows) results.push({ ...row, width: entry.width, role: entry.role });
}
await browser.close();

console.log(`== empty-space sweep (${widths.map((w) => `${w}x900`).join(", ")}) ==`);
let offenderCount = 0;
for (const r of results) {
  const tag = `${r.path} @${r.width}${r.role ? ` as ${r.role}` : ""}`;
  const flags = [];
  if (AUTH_PATHS.has(r.path) && r.overflow > 0) {
    flags.push(`page scrolls: doc ${r.docH} > vh ${r.vh} (auth shells must fit 100svh)`);
  }
  if (flags.length === 0) {
    console.log(`ok        ${tag}  doc=${r.docH}/vh=${r.vh} dead=${r.deadSpace} last=${r.last}`);
    if (r.empties.length || r.clipped.length) {
      for (const e of r.empties) console.log(`          · empty container ${e.el} h=${e.h} gap=${e.gap}px`);
      for (const c of r.clipped) console.log(`          · clipped ${c.el} scroll=${c.scroll} client=${c.client}`);
      offenderCount++;
    }
  } else {
    offenderCount++;
    console.log(`OFFENDER  ${tag}  doc=${r.docH}/vh=${r.vh} dead=${r.deadSpace} last=${r.last}`);
    for (const f of flags) console.log(`          - ${f}`);
    for (const e of r.empties) console.log(`          · empty container ${e.el} h=${e.h} gap=${e.gap}px`);
    for (const c of r.clipped) console.log(`          · clipped ${c.el} scroll=${c.scroll} client=${c.client}`);
  }
}
console.log(offenderCount === 0 ? "no offenders" : `${offenderCount} page(s) with findings`);
if (failures.length) {
  console.log("FAILURES:");
  for (const f of failures) console.log(`   - ${f}`);
  process.exitCode = 1;
}
