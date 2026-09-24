import { describe, expect, it } from "vitest";
import {
  computeCenterScores,
  computeEmployerRetention,
  normalizeEmployerName,
  computePeerStats,
  percentile75,
  type CenterInput,
  type EmployerClaimInput,
  type CategoryRates,
} from "./scoring";

describe("computeCenterScores", () => {
  const base: CenterInput = {
    centerId: "tc-1",
    centerName: "Pune Skills Academy",
    certifiedCount: 50,
    employedKnown: 50,
    employedVerified: 50,
    outcomesKnown: 50,
    certificatesPerTrainee: 2,
    trainingRelevanceAvg: 5,
  };

  it("gives placement 100 when every known outcome is verified-employed", () => {
    const [score] = computeCenterScores([base]);
    expect(score?.placementScore).toBe(100);
  });

  it("counts self-reported employment at half weight", () => {
    // 30 verified + 10 self-reported of 50 known outcomes:
    // (30 * 1 + 10 * 0.5) / 50 = 70%
    const [score] = computeCenterScores([
      { ...base, employedKnown: 40, employedVerified: 30 },
    ]);
    expect(score?.placementScore).toBe(70);
  });

  it("returns 0 placement (never NaN) with no known outcomes", () => {
    const [score] = computeCenterScores([
      { ...base, employedKnown: 0, employedVerified: 0, outcomesKnown: 0 },
    ]);
    expect(score?.placementScore).toBe(0);
    expect(Number.isNaN(score?.placementScore ?? 0)).toBe(false);
  });

  it("scores academic 100 with top relevance and 2 certificates per trainee", () => {
    const [score] = computeCenterScores([base]);
    expect(score?.academicScore).toBe(100);
  });

  it("falls back to certificate-only academic score when no survey data", () => {
    // 1 cert per trainee = half of the 2-cert benchmark = 50
    const [score] = computeCenterScores([
      { ...base, certificatesPerTrainee: 1, trainingRelevanceAvg: null },
    ]);
    expect(score?.academicScore).toBe(50);
  });

  it("scales volume relative to the largest center", () => {
    const scores = computeCenterScores([
      base,
      { ...base, centerId: "tc-2", centerName: "Solapur Skills Foundation", certifiedCount: 25 },
    ]);
    const pune = scores.find((s) => s.centerId === "tc-1");
    const solapur = scores.find((s) => s.centerId === "tc-2");
    expect(pune?.volumeScore).toBe(100);
    expect(solapur?.volumeScore).toBe(50);
  });

  it("weights overall score 50% placement, 30% academic, 20% volume", () => {
    const [score] = computeCenterScores([base]);
    // placement 100, academic 100, volume 100 (only center) => 100
    expect(score?.overallScore).toBe(100);
    // mixed: placement 70, academic 50, volume 50 => 35 + 15 + 10 = 60
    const [mixed] = computeCenterScores([
      {
        ...base,
        employedKnown: 40,
        employedVerified: 30,
        certificatesPerTrainee: 1,
        trainingRelevanceAvg: null,
        certifiedCount: 25,
      },
      base,
    ]);
    expect(mixed?.overallScore).toBe(60);
  });

  it("always returns numerator/denominator for trust display", () => {
    const [score] = computeCenterScores([{ ...base, employedVerified: 30, employedKnown: 40 }]);
    expect(score?.numerators).toMatchObject({
      employedKnown: 40,
      employedVerified: 30,
      outcomesKnown: 50,
      certifiedCount: 50,
    });
  });
});

describe("computeEmployerRetention", () => {
  const claim = (over: Partial<EmployerClaimInput>): EmployerClaimInput => ({
    employerName: "Acme Corp",
    confirmed: true,
    sustainedEmployment: true,
    ...over,
  });

  it("scores 100 when every confirmed claim shows sustained employment", () => {
    const r = computeEmployerRetention([claim({}), claim({})]);
    expect(r).toEqual({ score: 100, numerator: 2, denominator: 2 });
  });

  it("scores 25 when 1 of 4 confirmed claims sustained", () => {
    const r = computeEmployerRetention([
      claim({}),
      claim({ sustainedEmployment: false }),
      claim({ sustainedEmployment: false }),
      claim({ sustainedEmployment: false }),
    ]);
    expect(r).toEqual({ score: 25, numerator: 1, denominator: 4 });
  });

  it("ignores non-confirmed claims entirely", () => {
    const r = computeEmployerRetention([claim({}), claim({ confirmed: false, sustainedEmployment: false })]);
    expect(r).toEqual({ score: 100, numerator: 1, denominator: 1 });
  });

  it("ignores confirmed claims with no later checkpoint data", () => {
    const r = computeEmployerRetention([claim({ sustainedEmployment: null }), claim({})]);
    expect(r).toEqual({ score: 100, numerator: 1, denominator: 1 });
  });

  it("returns score null when no confirmed claim has later data (insufficient evidence)", () => {
    const r = computeEmployerRetention([claim({ sustainedEmployment: null })]);
    expect(r).toEqual({ score: null, numerator: 0, denominator: 0 });
  });
});

describe("normalizeEmployerName", () => {
  it("trims, collapses whitespace, and uppercases", () => {
    expect(normalizeEmployerName("  acme   corp ")).toBe("ACME CORP");
  });

  it("is idempotent", () => {
    expect(normalizeEmployerName(normalizeEmployerName(" Acme Corp "))).toBe("ACME CORP");
  });
});
describe("percentile75", () => {
  it("returns 0 for an empty array", () => {
    expect(percentile75([])).toBe(0);
  });

  it("returns the single value for one element", () => {
    expect(percentile75([42])).toBe(42);
  });

  it("returns the nearest-rank p75", () => {
    const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    expect(percentile75(values)).toBe(80);
  });

  it("is order-independent", () => {
    const values = [100, 10, 60, 30, 90, 20, 80, 40, 50, 70];
    expect(percentile75(values)).toBe(80);
  });
});

describe("computePeerStats", () => {
  const rates = (over: Partial<CategoryRates>): CategoryRates => ({
    placementRate: 50,
    retentionRate: 50,
    verifiedRate: 50,
    wageProgressionRate: 50,
    certificatesPerTrainee: 1,
    ...over,
  });

  it("averages each category across groups", () => {
    const stats = computePeerStats([rates({ placementRate: 60 }), rates({ placementRate: 80 })]);
    expect(stats.avg.placementRate).toBe(70);
    expect(stats.avg.retentionRate).toBe(50);
    expect(stats.avg.certificatesPerTrainee).toBe(1);
  });

  it("returns top-quartile (p75) values per category", () => {
    const stats = computePeerStats([
      rates({ placementRate: 30, retentionRate: 10 }),
      rates({ placementRate: 50, retentionRate: 30 }),
      rates({ placementRate: 70, retentionRate: 50 }),
      rates({ placementRate: 90, retentionRate: 70 }),
    ]);
    expect(stats.topQuartile.placementRate).toBe(70);
    expect(stats.topQuartile.retentionRate).toBe(50);
  });

  it("returns zeros when no groups exist", () => {
    const stats = computePeerStats([]);
    expect(stats.avg.placementRate).toBe(0);
    expect(stats.topQuartile.placementRate).toBe(0);
  });
});
