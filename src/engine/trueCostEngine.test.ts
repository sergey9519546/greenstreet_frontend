import { describe, expect, it } from 'vitest';
import { computeAEY, rankLendersByAEY, resolvePrepayPenaltyAtExit } from './trueCostEngine';

describe('computeAEY exact hold timing', () => {
  it('places a sub-one-year balloon on the exact exit month', () => {
    const result = computeAEY(300000, 7.5, 360, 6, 1, 1500, 0, 0, 6000, 7.5);
    expect(result.cashFlows).toHaveLength(7);
    expect(result.cashFlows.at(-1)?.month).toBe(6);
    expect(Number.isFinite(result.aey)).toBe(true);
    expect(result.aey).toBeGreaterThan(0);
  });
});

describe('prepayment penalty applicability', () => {
  it('includes the quoted penalty when PPP is allowed', () => {
    expect(resolvePrepayPenaltyAtExit(true, 12000)).toBe(12000);
  });

  it('removes the quoted penalty when PPP is not allowed', () => {
    expect(resolvePrepayPenaltyAtExit(false, 12000)).toBe(0);
  });
});

describe('lender ranking unavailable AEY', () => {
  it('does not present an ineligible quote as zero-cost financing', () => {
    const ranking = rankLendersByAEY([{
      lender: {
        id: 'ineligible',
        name: 'Ineligible lender',
        sourceType: 'LENDER_PUBLISHED',
        confidenceScore: 80,
        sourceSnapshot: 'test',
      },
      estimatedRate: 7.5,
      eligible: false,
      ineligibleReasons: ['Program mismatch'],
      fitTier: 'DOES_NOT_MEET',
      pppAllowed: false,
      pppStructure: 'None',
      loanAmount: 300000,
      termMonths: 360,
      holdMonths: 36,
      parRate: 7.5,
      prepayPenaltyAtExit: 0,
      provenanceWarnings: [],
    } as any]);

    expect(ranking[0].aey).toBe(Infinity);
  });
});
