import { describe, expect, it } from "vitest";
import {
  recommendCourses,
  recommendEmployers,
  type CourseInfo,
  type TraineeProfileInfo,
  type EmployerRetentionInfo,
} from "./recommendations";

const course = (over: Partial<CourseInfo>): CourseInfo => ({
  id: "c1",
  name: "Field Technician",
  category: "Electronics",
  skills: ["mobile repair", "soldering"],
  durationWeeks: 8,
  level: "Entry",
  provider: "Skill Center",
  ...over,
});

const trainee = (over: Partial<TraineeProfileInfo>): TraineeProfileInfo => ({
  skillGaps: ["mobile repair"],
  employed: false,
  district: "Mumbai",
  ...over,
});

describe("recommendCourses", () => {
  it("ranks courses matching skill gaps highest", () => {
    const recs = recommendCourses(
      trainee({ skillGaps: ["mobile repair"] }),
      [course({ name: "Unrelated", skills: ["welding"] }), course({})]
    );
    expect(recs[0]?.courseName).toBe("Field Technician");
  });

  it("includes a reason mentioning the matched gap", () => {
    const recs = recommendCourses(trainee({ skillGaps: ["mobile repair"] }), [course({})]);
    expect(recs[0]?.reason).toContain("mobile repair");
  });

  it("excludes courses with no match signal (score 0)", () => {
    const recs = recommendCourses(trainee({ skillGaps: ["mobile repair"] }), [
      course({ name: "Unrelated", skills: ["welding"], provider: "Far Center", durationWeeks: 26 }),
    ]);
    expect(recs).toEqual([]);
  });

  it("boosts short-duration courses for unemployed trainees", () => {
    const short = course({ name: "Short", skills: ["mobile repair"], durationWeeks: 8 });
    const long = course({ name: "Long", skills: ["mobile repair"], durationWeeks: 26 });
    const recs = recommendCourses(trainee({ employed: false }), [long, short]);
    expect(recs[0]?.courseName).toBe("Short");
  });

  it("does not apply the duration boost for employed trainees", () => {
    const short = course({ name: "Short", skills: ["mobile repair"], durationWeeks: 8 });
    const long = course({ name: "Long", skills: ["mobile repair"], durationWeeks: 26 });
    const recs = recommendCourses(trainee({ employed: true }), [long, short]);
    expect(recs[0]?.score).toBe(recs[1]?.score);
  });

  it("matches skill gaps case-insensitively", () => {
    const recs = recommendCourses(trainee({ skillGaps: ["MOBILE REPAIR"] }), [course({})]);
    expect(recs).toHaveLength(1);
  });

  it("respects the limit", () => {
    const courses = [1, 2, 3, 4, 5, 6, 7].map((i) =>
      course({ id: `c${i}`, name: `Course ${i}`, skills: ["mobile repair"] })
    );
    const recs = recommendCourses(trainee({}), courses, 5);
    expect(recs).toHaveLength(5);
  });

  it("matches category against skill gaps", () => {
    const recs = recommendCourses(trainee({ skillGaps: ["electronics"] }), [
      course({ name: "Electronics Course", skills: ["other"], category: "Electronics" }),
    ]);
    expect(recs[0]?.courseName).toBe("Electronics Course");
  });
});

describe("recommendEmployers", () => {
  const employer = (over: Partial<EmployerRetentionInfo>): EmployerRetentionInfo => ({
    employerName: "Acme Corp",
    retentionScore: 80,
    claimCount: 3,
    ...over,
  });

  it("ranks employers by retention score descending", () => {
    const recs = recommendEmployers([
      employer({ employerName: "Low", retentionScore: 55 }),
      employer({ employerName: "High", retentionScore: 90 }),
    ]);
    expect(recs.map((r) => r.employerName)).toEqual(["High", "Low"]);
  });

  it("excludes employers below 50% retention", () => {
    const recs = recommendEmployers([
      employer({ employerName: "Bad", retentionScore: 49 }),
      employer({ employerName: "Good", retentionScore: 60 }),
    ]);
    expect(recs.map((r) => r.employerName)).toEqual(["Good"]);
  });

  it("excludes employers with null retention (insufficient evidence)", () => {
    const recs = recommendEmployers([
      employer({ employerName: "Unknown", retentionScore: null }),
      employer({ employerName: "Good", retentionScore: 60 }),
    ]);
    expect(recs.map((r) => r.employerName)).toEqual(["Good"]);
  });

  it("excludes employers with exactly 0 claims", () => {
    const recs = recommendEmployers([employer({ claimCount: 0, retentionScore: 100 })]);
    expect(recs).toEqual([]);
  });

  it("breaks score ties by claim count descending", () => {
    const recs = recommendEmployers([
      employer({ employerName: "Few", retentionScore: 70, claimCount: 2 }),
      employer({ employerName: "Many", retentionScore: 70, claimCount: 9 }),
    ]);
    expect(recs[0]?.employerName).toBe("Many");
  });

  it("respects the limit", () => {
    const employers = [60, 65, 70, 75, 80, 85, 90].map((score, i) =>
      employer({ employerName: `E${i}`, retentionScore: score, claimCount: 1 })
    );
    const recs = recommendEmployers(employers, 5);
    expect(recs).toHaveLength(5);
  });
});
