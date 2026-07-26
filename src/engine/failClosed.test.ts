import { describe, expect, it } from 'vitest';
import { computeJointAppraisalRisk } from './sensitivity';
import { checkPPPLegal, PPP_STATE_LAWS } from './statePppLaws';

const RISK_RANK = {
  LOW: 0,
  MODERATE: 1,
  HIGH: 2,
  CRITICAL: 3,
} as const;

function appraisalRisk(qualifyingRent: number) {
  return computeJointAppraisalRisk(
    qualifyingRent,
    2_546,
    425_000,
    75,
    318_750,
    6.25,
    30,
    5_000,
    2_000,
    0,
    0,
  );
}

describe('joint appraisal risk invariants', () => {
  it('does not increase risk when the rent cushion improves', () => {
    const results = [2_400, 2_500, 2_600, 2_700, 2_800, 3_000, 3_300]
      .map(appraisalRisk);

    for (let index = 1; index < results.length; index += 1) {
      const prior = results[index - 1];
      const current = results[index];

      expect(current.rentDropPercent).toBeGreaterThan(prior.rentDropPercent);
      expect(RISK_RANK[current.combinedRiskRating])
        .toBeLessThanOrEqual(RISK_RANK[prior.combinedRiskRating]);
    }
  });

  it('reports a well-cushioned deal as LOW when the combined stress is LOW', () => {
    const result = appraisalRisk(3_000);

    expect(result.rentDropPercent).toBeGreaterThanOrEqual(15);
    expect(result.combinedStressTest.impliedRating).toBe('LOW');
    expect(result.combinedRiskRating).toBe('LOW');
    expect(result.bindingConstraint).toBe('NEITHER');
  });

  it('never reports a final rating below the combined-stress rating', () => {
    for (const rent of [2_400, 2_500, 2_600, 2_700, 2_800, 3_000, 3_300]) {
      const result = appraisalRisk(rent);
      expect(RISK_RANK[result.combinedRiskRating])
        .toBeGreaterThanOrEqual(RISK_RANK[result.combinedStressTest.impliedRating]);
    }
  });

  it('treats a deal already below its rent break-even as CRITICAL', () => {
    const result = appraisalRisk(2_500);

    expect(result.rentDropPercent).toBeLessThanOrEqual(0);
    expect(result.combinedRiskRating).toBe('CRITICAL');
    expect(result.bindingConstraint).toBe('RENT');
  });
});

describe('unknown PPP jurisdictions fail closed', () => {
  it.each(['ZZ', 'TEXAS', '', '  zz  '])(
    'returns UNKNOWN/verify for %j',
    (state) => {
      const result = checkPPPLegal(state, 'LLC', 400_000, 1, 'FIXED');

      expect(result.allowed).toBe(false);
      expect(result.status).toBe('UNKNOWN');
      expect(result.adjustedOptions).toEqual(['NONE']);
      expect(result.reason).toMatch(/not a recognized jurisdiction/i);
      expect(result.legalWarning).toMatch(/do not quote or recommend/i);
    },
  );

  it('keeps every jurisdiction in the governed matrix out of UNKNOWN', () => {
    for (const state of Object.keys(PPP_STATE_LAWS)) {
      const result = checkPPPLegal(state, 'LLC', 400_000, 1, 'FIXED');

      expect(result.status).not.toBe('UNKNOWN');
    }
  });
});
