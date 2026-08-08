import { describe, it, expect } from "vitest";
import {
  computeBreakEvenVacancy,
  computeDualTrackDSCR,
  computeShockWaterfall,
  classifyRiskZone,
  buildStressBaseScenario,
  computeStressCell,
  computeStressMatrix,
  computeStressMatrixFromBase,
} from "./stressMatrix";
import type { PropertyInputs, LoanStructure, StressRiskZone } from "./types";
import { buildAmortizationSchedule, paymentAtMonth } from "./amortization";

// Validation cases from the DSCR improvement spec (Break-Even Vacancy, [High]).
describe("computeBreakEvenVacancy", () => {
  it("normal deal: rent 3000 / PITIA 2000 → 33.3% break-even vacancy", () => {
    const r = computeBreakEvenVacancy(3000, 2000);
    expect(r.structurallyNegative).toBe(false);
    expect(r.vacancyPct).toBeCloseTo(33.3, 1); // 1 - 2000/3000
  });

  it("strong deal: break-even vacancy is between 0 and 100", () => {
    const r = computeBreakEvenVacancy(4000, 2200);
    expect(r.structurallyNegative).toBe(false);
    expect(r.vacancyPct).toBeGreaterThan(0);
    expect(r.vacancyPct).toBeLessThan(100);
  });

  it("structural failure: rent below PITIA at full occupancy → 0% + flagged (guard clause)", () => {
    const r = computeBreakEvenVacancy(1800, 2000);
    expect(r.structurallyNegative).toBe(true);
    expect(r.vacancyPct).toBe(0); // never a negative/>1 break-even
  });

  it("boundary: rent exactly equals PITIA → 0% break-even, flagged", () => {
    const r = computeBreakEvenVacancy(2000, 2000);
    expect(r.vacancyPct).toBe(0);
    expect(r.structurallyNegative).toBe(true);
  });

  it("degenerate inputs are guarded (no NaN/negative)", () => {
    expect(computeBreakEvenVacancy(0, 2000)).toEqual({ vacancyPct: 0, structurallyNegative: true });
    expect(computeBreakEvenVacancy(3000, 0).vacancyPct).toBe(0);
  });
});

// "Qualifies but Dangerous" — the lender approves a deal that loses money.
describe("computeDualTrackDSCR", () => {
  it("trap: lender qualifies (Track1≥1.0) but investor loses money (Track2<1.0) → flagged", () => {
    // rent 2400 / PITIA 2300 → Track1 1.043; Track2 = 2400*(1-0.28 TCO)/2300 = 0.751; delta 0.292 > 0.2
    const r = computeDualTrackDSCR(2400, 2300);
    expect(r.track1).toBeGreaterThanOrEqual(1.0);
    expect(r.track2).toBeLessThan(1.0);
    expect(r.delta).toBeGreaterThan(0.2);
    expect(r.qualifiesButDangerous).toBe(true);
  });

  it("safe deal: both tracks clear → not dangerous", () => {
    const r = computeDualTrackDSCR(3500, 2000); // T1 1.75, T2 1.3825
    expect(r.track2).toBeGreaterThanOrEqual(1.0);
    expect(r.qualifiesButDangerous).toBe(false);
  });

  it("does not qualify at all (Track1<1.0) → not the trap (lender declines)", () => {
    const r = computeDualTrackDSCR(1800, 2000); // T1 0.9
    expect(r.track1).toBeLessThan(1.0);
    expect(r.qualifiesButDangerous).toBe(false);
  });

  it("Track 2 uses the TCO haircut (SFR 28% default, incl CapEx)", () => {
    const r = computeDualTrackDSCR(3000, 2000);
    expect(r.track1).toBeCloseTo(1.5, 3);          // 3000/2000
    expect(r.track2).toBeCloseTo(1.08, 3);         // 3000*(1-0.28)/2000
  });

  it("vacancy override (Stress Matrix slider) raises the TCO haircut", () => {
    // vacancy 15% + SFR mgmt8+maint8+capex5 (21%) = 36% → Track2 = 3000*0.64/2000
    const r = computeDualTrackDSCR(3000, 2000, { vacancyPct: 15 });
    expect(r.track2).toBeCloseTo(0.96, 2);
  });

  it("degenerate inputs guarded", () => {
    expect(computeDualTrackDSCR(0, 2000).qualifiesButDangerous).toBe(false);
    expect(computeDualTrackDSCR(3000, 0).track1).toBe(0);
  });
});

// Multi-shock waterfall (Edge §7) — each shock's marginal DSCR bite.
describe("computeShockWaterfall", () => {
  // Edge §7 canonical: base $2800 rent / $2546 PITIA → 1.100, then
  // ARM +$265, tax +$200, insurance +$300, rent −10%.
  const r = computeShockWaterfall(2800, 2546, [
    { label: "ARM reset +1.5%", pitiaDelta: 265 },
    { label: "Tax reassessment", pitiaDelta: 200 },
    { label: "Insurance surge", pitiaDelta: 300 },
    { label: "Rent −10%", rentMultiplier: 0.9 },
  ]);

  it("base and final DSCR match the worked example", () => {
    expect(r.baseDSCR).toBeCloseTo(1.1, 2);
    expect(r.finalDSCR).toBeCloseTo(0.761, 2); // 2520 / 3311
  });

  it("marginal deltas sum to total destruction", () => {
    const sum = r.steps.reduce((s, st) => s + st.marginalDelta, 0);
    expect(sum).toBeCloseTo(-(r.totalDelta), 2); // steps are negative; total is positive
    expect(r.totalDelta).toBeCloseTo(0.339, 2);
  });

  it("first ARM shock alone pushes below 1.0", () => {
    expect(r.steps[0].dscrAfter).toBeLessThan(1.0);
    expect(r.steps[0].marginalDelta).toBeLessThan(0);
  });

  it("guards divide-by-zero", () => {
    expect(computeShockWaterfall(2800, 0, []).baseDSCR).toBe(0);
  });
});

// ============================================================
// GATE ITEM 1 — "One canonical base scenario shared by every stress"
// GATE ITEM 2 — "Documented rent, vacancy, expense, and rate shocks"
// GATE ITEM 3 — "Monotonicity and boundary tests for every risk classification"
// ============================================================
//
// Fixture deal, independently re-derived (node, standard amortization
// formula) so the assertions below check the engine against arithmetic done
// OUTSIDE the engine, not against itself:
//   loanAmount 400,000 × 75% LTV = 300,000
//   PI(300000, 7.00%, 360mo)     = 1995.9074855...
//   monthlyTaxesInsurance = 6000/12 + 1800/12                = 650
//   monthlyHoaFlood       = 50 + 25                           = 75
//   monthlyFixed          = 725
//   basePITIA             = 1995.9074855... + 725 = 2720.9074855...
//   baseTrack1DSCR        = 3000 / 2720.9074855...  = 1.1025733...
//   SFR TCO total (defaults) = .08+.08+.05+.07 = .28
//   baseNOI               = 3000 * .72 = 2160
//   baseTrack2DSCR        = 2160 / 2720.9074855... = 0.7938528...
const FIXTURE_PROPERTY: PropertyInputs = {
  purchasePrice: 400_000, leaseRent: 3000, marketRent: 3000,
  strProjectedRent: 0, strDocumentedRent: 0,
  hoa: 50, annualTaxes: 6000, annualInsurance: 1800, floodInsurance: 25,
  propertyType: "SFR", state: "TX", unitCount: 1, sqft: 1500, yearBuilt: 2010,
  isCondotel: false, isNonWarrantable: false, isRural: false,
  isDecliningMarket: false, hoaSTRPolicy: "UNKNOWN",
};
const FIXTURE_LOAN: LoanStructure = {
  ltv: 75, term: "30_YR", ioPeriod: "NONE",
  armType: "FIXED", prepayPreference: "NONE", purpose: "PURCHASE",
  expectedHoldYears: 5, points: 0, lenderFees: 0, brokerFees: 0, rateLockCost: 0,
};
const BASE_RATE = 7.0;
const QUALIFYING_RENT = 3000;

function fixtureBase() {
  return buildStressBaseScenario(FIXTURE_PROPERTY, FIXTURE_LOAN, "LTR", BASE_RATE, QUALIFYING_RENT);
}

describe("buildStressBaseScenario — the one canonical base (gate 1)", () => {
  it("matches an independently-derived amortization + PITIA + dual-track calculation", () => {
    const base = fixtureBase();
    expect(base.loanAmount).toBe(300_000);
    expect(base.monthlyTaxesInsurance).toBeCloseTo(650, 6);
    expect(base.monthlyHoaFlood).toBeCloseTo(75, 6);
    expect(base.monthlyFixed).toBeCloseTo(725, 6);
    expect(base.basePI).toBeCloseTo(1995.907486, 4);
    expect(base.basePITIA).toBeCloseTo(2720.907486, 4);
    expect(base.baseTrack1DSCR).toBeCloseTo(1.102573, 3);
    expect(base.baseTrack2DSCR).toBeCloseTo(0.793853, 3);
  });

  it("is deterministic — identical inputs never produce two different bases", () => {
    const a = fixtureBase();
    const b = fixtureBase();
    expect(a).toEqual(b);
  });

  it.each([
    ["purchasePrice = 0", { ...FIXTURE_PROPERTY, purchasePrice: 0 }, FIXTURE_LOAN, BASE_RATE, QUALIFYING_RENT],
    ["purchasePrice = NaN", { ...FIXTURE_PROPERTY, purchasePrice: NaN }, FIXTURE_LOAN, BASE_RATE, QUALIFYING_RENT],
    ["negative purchasePrice", { ...FIXTURE_PROPERTY, purchasePrice: -1 }, FIXTURE_LOAN, BASE_RATE, QUALIFYING_RENT],
  ] as const)("fails closed on %s — throws rather than silently computing garbage", (_label, property, loan, rate, rent) => {
    expect(() => buildStressBaseScenario(property, loan, "LTR", rate, rent)).toThrow();
  });

  it("fails closed on an invalid LTV (0 and >100)", () => {
    expect(() => buildStressBaseScenario(FIXTURE_PROPERTY, { ...FIXTURE_LOAN, ltv: 0 }, "LTR", BASE_RATE, QUALIFYING_RENT)).toThrow();
    expect(() => buildStressBaseScenario(FIXTURE_PROPERTY, { ...FIXTURE_LOAN, ltv: 101 }, "LTR", BASE_RATE, QUALIFYING_RENT)).toThrow();
  });

  it("fails closed on a non-finite base rate or qualifying rent — never substitutes a default", () => {
    expect(() => buildStressBaseScenario(FIXTURE_PROPERTY, FIXTURE_LOAN, "LTR", NaN, QUALIFYING_RENT)).toThrow();
    expect(() => buildStressBaseScenario(FIXTURE_PROPERTY, FIXTURE_LOAN, "LTR", -1, QUALIFYING_RENT)).toThrow();
    expect(() => buildStressBaseScenario(FIXTURE_PROPERTY, FIXTURE_LOAN, "LTR", BASE_RATE, NaN)).toThrow();
  });
});

describe("computeStressMatrixFromBase — every cell shares the SAME base object (gate 1)", () => {
  it("the zero-shock cell (0 bps, 0% rent) matches the base scenario's own fields exactly — no second derivation", () => {
    const base = fixtureBase();
    const result = computeStressMatrixFromBase(base);
    const zeroCell = result.cells.find(row => row.some(c => c.rateOffsetBps === 0 && c.rentOffsetPct === 0))!
      .find(c => c.rateOffsetBps === 0 && c.rentOffsetPct === 0)!;
    expect(zeroCell.piMonthly).toBeCloseTo(base.basePI, 2);
    expect(zeroCell.pitiaMonthly).toBeCloseTo(base.basePITIA, 2);
    expect(zeroCell.track1DSCR).toBeCloseTo(base.baseTrack1DSCR, 3);
    expect(zeroCell.track2DSCR).toBeCloseTo(base.baseTrack2DSCR, 3);
    expect(zeroCell.adjustedRent).toBeCloseTo(base.qualifyingRent, 2);
    // And the result's own top-level "base case" fields (used by the page's
    // summary strip) must be THE SAME numbers — not an independent re-run of
    // calculatePI + a second PITIA sum, which is the exact defect this gate
    // exists to catch.
    expect(result.baseTrack1DSCR).toBe(base.baseTrack1DSCR);
    expect(result.baseTrack2DSCR).toBe(base.baseTrack2DSCR);
  });

  it("no cell disagrees about the unshocked fixed cost — pitiaMonthly minus piMonthly equals base.monthlyFixed for every one of the 120 cells", () => {
    const base = fixtureBase();
    const result = computeStressMatrixFromBase(base);
    for (const row of result.cells) {
      for (const cell of row) {
        expect(cell.pitiaMonthly - cell.piMonthly).toBeCloseTo(base.monthlyFixed, 2);
      }
    }
  });

  it("computeStressCell(base, coords) called directly reproduces the matrix's own cell at those coords bit-for-bit", () => {
    const base = fixtureBase();
    const result = computeStressMatrixFromBase(base);
    const samples: Array<[number, number]> = [
      [0, 0], [100, -10], [-150, 20], [200, -25], [50, 5],
    ];
    for (const [rateOffsetBps, rentOffsetPct] of samples) {
      const rowIdx = result.cells.findIndex(row => row[0].rateOffsetBps === rateOffsetBps);
      const colIdx = result.cells[rowIdx].findIndex(c => c.rentOffsetPct === rentOffsetPct);
      const matrixCell = result.cells[rowIdx][colIdx];
      const directCell = computeStressCell(base, { rateOffsetBps, rentOffsetPct });
      expect(directCell).toEqual(matrixCell);
    }
  });

  it("computeStressMatrix() (the property/loan convenience wrapper) agrees exactly with buildStressBaseScenario() called separately on the same inputs", () => {
    const base = buildStressBaseScenario(FIXTURE_PROPERTY, FIXTURE_LOAN, "LTR", BASE_RATE, QUALIFYING_RENT);
    const viaWrapper = computeStressMatrix(FIXTURE_PROPERTY, FIXTURE_LOAN, "LTR", BASE_RATE, QUALIFYING_RENT);
    const viaBase = computeStressMatrixFromBase(base);
    expect(viaWrapper).toEqual(viaBase);
  });
});

describe("Gate 2 — RATE shock is a rateSteps entry through the shared amortization kernel", () => {
  it("a +100bps rate shock's piMonthly matches an independently-derived PI AND the amortization kernel's own schedule at that rate", () => {
    const base = fixtureBase();
    const cell = computeStressCell(base, { rateOffsetBps: 100 });
    // Independently derived (node, standard formula): PI(300000, 8.00%, 360) = 2201.293721638134
    expect(cell.piMonthly).toBeCloseTo(2201.29, 1);
    // Cross-check against the amortization kernel directly, built completely
    // independently of computeStressCell's own call — proves the rate shock
    // routes through the SAME shared kernel every other tool in this codebase
    // uses, not a re-derived PI formula.
    const independentSchedule = buildAmortizationSchedule({
      principal: base.loanAmount, annualRatePct: 8.0, termMonths: base.termMonths, ioMonths: base.ioMonths,
    });
    expect(cell.piMonthly).toBeCloseTo(paymentAtMonth(independentSchedule, 1), 2);
  });

  it("rate floors at 0.5% nominal — a huge negative offset cannot drive the rate to zero or negative", () => {
    const base = fixtureBase();
    const cell = computeStressCell(base, { rateOffsetBps: -1000 });
    expect(cell.ratePct).toBe(0.5);
  });
});

describe("Gate 2 — RENT shock multiplies the base qualifying rent", () => {
  it("adjustedRent is exactly qualifyingRent * (1 + pct/100) for every offset", () => {
    const base = fixtureBase();
    for (const pct of [-25, -10, 0, 10, 20]) {
      const cell = computeStressCell(base, { rentOffsetPct: pct });
      expect(cell.adjustedRent).toBeCloseTo(QUALIFYING_RENT * (1 + pct / 100), 2);
    }
  });
});

describe("Gate 2 — VACANCY shock overrides only the TCO vacancy component, and only touches Track 2", () => {
  it("vacancyOverridePct=15 matches an independently-derived TCO total and Track 2 NOI", () => {
    const base = fixtureBase();
    const cell = computeStressCell(base, { vacancyOverridePct: 15 });
    // Independently derived: TCO total = .08 mgmt + .08 maint + .05 capex + .15 vacancy = .36
    // NOI = 3000 * (1 - .36) = 1920; Track2 = 1920 / 2720.9074855... = 0.7056469...
    expect(cell.track2DSCR).toBeCloseTo(0.705647, 3);
  });

  it("Track 1 (lender qualification) never moves for a vacancy-only shock — the lender qualifies on gross rent", () => {
    const base = fixtureBase();
    const withoutVacancy = computeStressCell(base, {});
    const withVacancy = computeStressCell(base, { vacancyOverridePct: 30 });
    expect(withVacancy.track1DSCR).toBe(withoutVacancy.track1DSCR);
    expect(withVacancy.pitiaMonthly).toBe(withoutVacancy.pitiaMonthly);
  });
});

describe("Gate 2 — EXPENSE shock hits taxes + insurance only, never HOA or flood", () => {
  it("expenseShockPct=25 matches an independently-derived stressed PITIA and Track 1", () => {
    const base = fixtureBase();
    const cell = computeStressCell(base, { expenseShockPct: 25 });
    // Independently derived: stressed taxes+ins = 650*1.25 = 812.5
    // pitia = 1995.9074855... + 812.5 + 75(hoa+flood) = 2883.4074855...
    // track1 = 3000 / 2883.4074855... = 1.0404356...
    expect(cell.pitiaMonthly).toBeCloseTo(2883.407486, 2);
    expect(cell.track1DSCR).toBeCloseTo(1.040436, 3);
  });

  it("doubling the expense shock (100%) moves PITIA by exactly one monthlyTaxesInsurance — HOA/flood pass through unchanged", () => {
    const base = fixtureBase();
    const unshocked = computeStressCell(base, {});
    const doubled = computeStressCell(base, { expenseShockPct: 100 });
    expect(doubled.pitiaMonthly - unshocked.pitiaMonthly).toBeCloseTo(base.monthlyTaxesInsurance, 2);
  });
});

describe("Gate 3 — classifyRiskZone: boundaries at the exact thresholds and either side of them", () => {
  it.each([
    [1.50, "SAFE"], [1.499999, "COMFORTABLE"], [1.500001, "SAFE"],
    [1.25, "COMFORTABLE"], [1.249999, "MARGINAL"], [1.250001, "COMFORTABLE"],
    [1.00, "MARGINAL"], [0.999999, "FRAGILE"], [1.000001, "MARGINAL"],
    [0.85, "FRAGILE"], [0.849999, "DEAL_BREAK"], [0.850001, "FRAGILE"],
  ] as const)("classifyRiskZone(%f) === %s", (dscr, expected) => {
    expect(classifyRiskZone(dscr)).toBe(expected as StressRiskZone);
  });

  it("extremes: very high DSCR is SAFE, zero/negative DSCR is DEAL_BREAK", () => {
    expect(classifyRiskZone(10)).toBe("SAFE");
    expect(classifyRiskZone(0)).toBe("DEAL_BREAK");
    expect(classifyRiskZone(-5)).toBe("DEAL_BREAK");
  });

  it("fails closed: a non-finite DSCR (missing/undefined data) never lands in a PASSING zone", () => {
    // NaN fails every `>=` comparison, falling through to the final, most
    // conservative return — DEAL_BREAK. Missing data must never present as
    // safe; this pins that behavior down explicitly.
    expect(classifyRiskZone(NaN)).toBe("DEAL_BREAK");
  });
});

describe("Gate 3 — monotonicity across the WHOLE grid, not one pair", () => {
  const ZONE_RANK: Record<StressRiskZone, number> = {
    DEAL_BREAK: 0, FRAGILE: 1, MARGINAL: 2, COMFORTABLE: 3, SAFE: 4,
  };

  it("within a fixed rate row, DSCR and zone rank never DECREASE as rent improves (rent axis ascending)", () => {
    const result = computeStressMatrixFromBase(fixtureBase());
    for (const row of result.cells) {
      for (let j = 1; j < row.length; j++) {
        expect(row[j].track1DSCR).toBeGreaterThanOrEqual(row[j - 1].track1DSCR);
        expect(ZONE_RANK[row[j].riskZone]).toBeGreaterThanOrEqual(ZONE_RANK[row[j - 1].riskZone]);
      }
    }
  });

  it("within a fixed rent column, DSCR and zone rank never IMPROVE as the rate shock worsens (rate axis ascending)", () => {
    const result = computeStressMatrixFromBase(fixtureBase());
    for (let colIdx = 0; colIdx < result.rentAxis.length; colIdx++) {
      for (let i = 1; i < result.cells.length; i++) {
        const prev = result.cells[i - 1][colIdx];
        const cur = result.cells[i][colIdx];
        expect(cur.track1DSCR).toBeLessThanOrEqual(prev.track1DSCR);
        expect(ZONE_RANK[cur.riskZone]).toBeLessThanOrEqual(ZONE_RANK[prev.riskZone]);
      }
    }
  });

  it("vacancy: Track 2 DSCR never improves as vacancyOverridePct worsens, swept across the whole 0-100 range", () => {
    const base = fixtureBase();
    const track2ByVacancy = Array.from({ length: 21 }, (_, i) => i * 5).map(
      vacancyOverridePct => computeStressCell(base, { vacancyOverridePct }).track2DSCR,
    );
    for (let i = 1; i < track2ByVacancy.length; i++) {
      expect(track2ByVacancy[i]).toBeLessThanOrEqual(track2ByVacancy[i - 1]);
    }
  });

  it("expense shock: Track 1 DSCR never improves as expenseShockPct worsens, swept across 0-100", () => {
    const base = fixtureBase();
    const track1ByExpense = Array.from({ length: 11 }, (_, i) => i * 10).map(
      expenseShockPct => computeStressCell(base, { expenseShockPct }).track1DSCR,
    );
    for (let i = 1; i < track1ByExpense.length; i++) {
      expect(track1ByExpense[i]).toBeLessThanOrEqual(track1ByExpense[i - 1]);
    }
  });

  it("rate: piMonthly and Track 1 DSCR move STRICTLY monotonically with the rate offset, swept across the full -150..+300bps range", () => {
    // Strict, not >=/<=: on this fixture (base 7.00%, none of the offsets hit
    // the 0.5% floor) every distinct rate must produce a distinct payment. A
    // non-strict check would pass even if a shock silently had zero effect —
    // exactly the mutant this test is meant to catch (verified: killed by
    // reverting the rate-shock's rateSteps entry to the base rate).
    const base = fixtureBase();
    const offsets = [-150, -100, -75, -50, -25, 0, 25, 50, 75, 100, 150, 200, 300];
    const cells = offsets.map(rateOffsetBps => computeStressCell(base, { rateOffsetBps }));
    for (let i = 1; i < cells.length; i++) {
      expect(cells[i].piMonthly).toBeGreaterThan(cells[i - 1].piMonthly);
      expect(cells[i].track1DSCR).toBeLessThan(cells[i - 1].track1DSCR);
    }
  });
});
