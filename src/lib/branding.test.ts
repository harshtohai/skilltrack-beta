import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Flavor mechanism check: NEXT_PUBLIC_BRANDING = "maharashtra" must patch the
 * neutral bot templates back to the MSSDS/PMKVY copy (harvested from the
 * de-branding diff), and warn on a replacement that matches nothing.
 */

describe("branding flavors", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("default flavor serves neutral copy (no MSSDS/PMKVY)", async () => {
    delete process.env.NEXT_PUBLIC_BRANDING;
    const { T } = await import("~/lib/bot/messages");
    expect(T.en.welcome).not.toContain("MSSDS");
    expect(T.en.welcome).toContain("official placement tracking & career guidance platform.");
    expect(T.en.recommendations).toContain("Your Suggestions for the Programme");
  });

  it("maharashtra flavor restores the MSSDS/PMKVY copy in all 3 languages", async () => {
    process.env.NEXT_PUBLIC_BRANDING = "maharashtra";
    const { T } = await import("~/lib/bot/messages");
    expect(T.en.welcome).toContain("Maharashtra State Skill Development Society (MSSDS)");
    expect(T.en.complete).toContain("— Team SkillsTrack (MSSDS / PMKVY)");
    expect(T.hi.complete).toContain("महाराष्ट्र");
    expect(T.hi.relevanceJob).toContain("PMKVY ट्रेनिंग");
    expect(T.mr.welcome).toContain("महाराष्ट्र राज्य कौशल्य विकास सोसायटी");
    expect(T.mr.complete).toContain("(MSSDS / PMKVY)");
  });

  it("web strings follow the flavor", async () => {
    delete process.env.NEXT_PUBLIC_BRANDING;
    let { branding } = await import("~/lib/branding");
    expect(branding.heroBadge).toBe("Consent-based skilling outcomes platform");

    vi.resetModules();
    process.env.NEXT_PUBLIC_BRANDING = "maharashtra";
    ({ branding } = await import("~/lib/branding"));
    expect(branding.heroBadge).toContain("SIH 2026");
    expect(branding.demoAdmin).toContain("maharashtra.gov.in");
  });
});
