import { describe, expect, it } from "vitest";
import { humanizeSkill, isValidLevel, latestBySkill, SKILL_LEVELS } from "./skills";

describe("humanizeSkill", () => {
  it("turns slugs into readable labels", () => {
    expect(humanizeSkill("data-analysis")).toBe("Data analysis");
    expect(humanizeSkill("tally")).toBe("Tally");
    expect(humanizeSkill("ms_excel")).toBe("Ms excel");
  });

  it("handles empty slugs", () => {
    expect(humanizeSkill("")).toBe("");
  });
});

describe("latestBySkill", () => {
  it("keeps the most recent assessment per skill", () => {
    const map = latestBySkill([
      { skill: "tally", level: 2, assessedAt: new Date("2026-09-01") },
      { skill: "tally", level: 4, assessedAt: new Date("2026-10-01") },
      { skill: "gst", level: 3, assessedAt: new Date("2026-10-02") },
    ]);
    expect(map.get("tally")).toEqual({ level: 4, assessedAt: new Date("2026-10-01") });
    expect(map.get("gst")?.level).toBe(3);
  });

  it("out-of-order input still picks the newest timestamp", () => {
    const map = latestBySkill([
      { skill: "excel", level: 5, assessedAt: new Date("2026-10-05") },
      { skill: "excel", level: 1, assessedAt: new Date("2026-10-01") },
    ]);
    expect(map.get("excel")?.level).toBe(5);
  });
});

describe("SKILL_LEVELS", () => {
  it("covers 1–5 with distinct labels", () => {
    expect(SKILL_LEVELS.map((l) => l.value)).toEqual([1, 2, 3, 4, 5]);
    expect(new Set(SKILL_LEVELS.map((l) => l.label)).size).toBe(5);
  });
});

describe("isValidLevel", () => {
  it("accepts integers 1–5 only", () => {
    expect(isValidLevel(1)).toBe(true);
    expect(isValidLevel(5)).toBe(true);
    expect(isValidLevel(0)).toBe(false);
    expect(isValidLevel(6)).toBe(false);
    expect(isValidLevel(3.5)).toBe(false);
    expect(isValidLevel("4")).toBe(false);
  });
});
