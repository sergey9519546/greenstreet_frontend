import { describe, expect, it } from 'vitest';
import { computeReassessmentDSCRImpact } from './reassessmentEngine';
import { deriveSellerTaxBasePITIA, mapIRRUnits } from './v11Runner';

describe('v11 runner unit contracts', () => {
  it('reports reassessment from seller-tax PITIA without applying tax twice', () => {
    const solvedReassessedPITIA = 2_750;
    const sellerAnnualTax = 3_000;
    const reassessedAnnualTax = 6_000;
    const sellerTaxBasePITIA = deriveSellerTaxBasePITIA(
      solvedReassessedPITIA,
      sellerAnnualTax,
      reassessedAnnualTax,
    );

    const impact = computeReassessmentDSCRImpact(
      500_000,
      'CA',
      3_300,
      sellerTaxBasePITIA,
      sellerAnnualTax,
      reassessedAnnualTax,
    );

    expect(sellerTaxBasePITIA).toBe(2_500);
    expect(impact.pitiaBefore).toBe(2_500);
    expect(impact.pitiaAfter).toBe(solvedReassessedPITIA);
  });

  it('keeps 0.12 decimal for verdicts and presents it as 12% in the memo', () => {
    const units = mapIRRUnits(0.15, 0.12);

    expect(units.verdictPreTaxIRR).toBe(0.15);
    expect(units.verdictAfterTaxIRR).toBe(0.12);
    expect(units.memoPreTaxIRR).toBe(15);
    expect(units.memoAfterTaxIRR).toBe(12);
  });
});
