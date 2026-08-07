import { describe, it, expect } from 'vitest';
import { calculateFIRPTAImpact, nraEstateTaxNote } from './firpta';

describe('calculateFIRPTAImpact', () => {
  it('exempts US residents (Non-Foreign Status Affidavit path)', () => {
    const r = calculateFIRPTAImpact({ salePrice: 500_000, adjustedBasis: 300_000, state: 'FL', isUsResident: true });
    expect(r.federalWithholdingAmount).toBe(0);
    expect(r.stateWithholdingAmount).toBe(0);
    expect(r.totalWithholding).toBe(0);
    expect(r.withholdingCertificateRecommended).toBe(false);
    expect(r.gain).toBe(200_000); // gain still surfaced
    expect(r.note).toMatch(/does not apply/i);
  });

  it('withholds 15% of GROSS sale price for foreign sellers (no-state)', () => {
    const r = calculateFIRPTAImpact({ salePrice: 500_000, adjustedBasis: 300_000, state: '', isUsResident: false });
    expect(r.gain).toBe(200_000);
    expect(r.federalWithholdingRate).toBe(0.15);
    expect(r.federalWithholdingAmount).toBe(75_000); // 15% of GROSS, not gain
    expect(r.stateWithholdingAmount).toBe(0);
    expect(r.estimatedTaxOnGain).toBe(40_000); // 20% of gain
    // 75,000 > 40,000 * 1.5 (60,000) → certificate recommended
    expect(r.withholdingCertificateRecommended).toBe(true);
    expect(r.potentialRefund).toBe(35_000);
  });

  it('adds state gain withholding for states that impose it (NY 10.9%)', () => {
    const r = calculateFIRPTAImpact({ salePrice: 500_000, adjustedBasis: 300_000, state: 'ny', isUsResident: false });
    expect(r.stateWithholdingRate).toBe(0.109);
    expect(r.stateWithholdingAmount).toBe(Math.round(200_000 * 0.109)); // 21,800
    expect(r.totalWithholding).toBe(75_000 + 21_800);
  });

  it('floors gain at zero for a loss sale', () => {
    const r = calculateFIRPTAImpact({ salePrice: 250_000, adjustedBasis: 300_000, state: '', isUsResident: false });
    expect(r.gain).toBe(0);
    expect(r.estimatedTaxOnGain).toBe(0);
  });
});

describe('nraEstateTaxNote', () => {
  it('exposes US-situs value above the $60K NRA exemption at 40%', () => {
    const n = nraEstateTaxNote(1_000_000);
    expect(n.exposedValue).toBe(940_000);
    expect(n.estTaxAt40).toBe(376_000);
  });

  it('floors exposure at zero below the exemption', () => {
    const n = nraEstateTaxNote(40_000);
    expect(n.exposedValue).toBe(0);
    expect(n.estTaxAt40).toBe(0);
  });
});
