/**
 * GreenStreet Finance — Uncovered Audit Test Suite
 *
 * Verifies edge cases and capabilities discovered during deep audit:
 * - BRRRR Delayed Financing vs 6-12mo vs 12+mo Seasoning caps
 * - Non-Warrantable Condo & Condotel TCO haircuts
 * - Refinance proceeds gap calculations under LTV vs DSCR constraints
 */

import { describe, it, expect } from 'vitest';
import { computeBRRRRSeasoningCap, computeRefiProceedsGap } from './refiProceeds';
import { BASE_TCO_RATES, computeTcoRate } from './tcoDscr';

describe('Uncovered Deep Audit — Edge Cases & Advanced Engine Logic', () => {

  // ── 1. BRRRR SEASONING & DELAYED FINANCING CAPS ──
  describe('BRRRR Seasoning Engine', () => {
    it('applies Delayed Financing basis cap for <6 months seasoning', () => {
      const res = computeBRRRRSeasoningCap({
        seasoningMonths: 3,
        purchasePrice: 200000,
        documentedRehabCost: 50000,
        newAppraisedValue: 350000, // Appraised high ($350k), but basis is $250k
        purpose: 'CASH_OUT',
      });

      expect(res.seasoningTier).toBe('<6_MONTHS_DELAYED_FINANCING');
      expect(res.eligibleMaxBasis).toBe(250000); // capped at $200k + $50k
      expect(res.maxLoanAmount).toBe(187500);     // 75% of $250k
      expect(res.restrictionNote).toContain('Delayed Financing Rule');
    });

    it('applies 70% LTV cash-out cap for 6-12 months seasoning', () => {
      const res = computeBRRRRSeasoningCap({
        seasoningMonths: 9,
        purchasePrice: 200000,
        documentedRehabCost: 50000,
        newAppraisedValue: 350000,
        purpose: 'CASH_OUT',
      });

      expect(res.seasoningTier).toBe('6_TO_12_MONTHS');
      expect(res.allowedMaxLtvPct).toBe(70);
      expect(res.eligibleMaxBasis).toBe(350000);
      expect(res.maxLoanAmount).toBe(245000); // 70% of $350k
    });

    it('allows full 75% LTV on new appraisal for 12+ months seasoning', () => {
      const res = computeBRRRRSeasoningCap({
        seasoningMonths: 14,
        purchasePrice: 200000,
        documentedRehabCost: 50000,
        newAppraisedValue: 350000,
        purpose: 'CASH_OUT',
      });

      expect(res.seasoningTier).toBe('FULL_SEASONED_12_PLUS');
      expect(res.allowedMaxLtvPct).toBe(75);
      expect(res.maxLoanAmount).toBe(262500); // 75% of $350k
    });
  });

  // ── 2. CONDOTEL & MULTI-FAMILY TCO HAIRCUTS ──
  describe('Property-Type TCO Haircut Escalations', () => {
    it('applies elevated 63% TCO haircut for Condotel strategy', () => {
      const rates = BASE_TCO_RATES.CONDOTEL;
      expect(rates.management).toBe(0.25);
      expect(rates.maintenance).toBe(0.10);
      expect(rates.capex).toBe(0.08);
      expect(rates.vacancy).toBe(0.20);
      
      const totalTcoPct = rates.management + rates.maintenance + rates.capex + rates.vacancy;
      expect(totalTcoPct).toBeCloseTo(0.63, 2);
    });

    it('computes scale efficiency for multi-family management vs SFR', () => {
      const sfr = computeTcoRate({ propertyType: 'SFR' });
      const multi = computeTcoRate({ propertyType: 'SMALL_MULTI' });
      const condotel = computeTcoRate({ propertyType: 'CONDOTEL' });
      
      // Multi-family achieves management scale efficiency (27% vs 28% total opex)
      expect(multi.total).toBeLessThan(sfr.total);
      // Condotel experiences massive STR operating haircut (63% total opex)
      expect(condotel.total).toBeGreaterThan(sfr.total);
    });
  });

  // ── 3. REFINANCE PROCEEDS GAP UNDER DUAL CONSTRAINTS ──
  describe('Refinance Proceeds Gap', () => {
    it('identifies cash required when DSCR ceiling is lower than balance', () => {
      const res = computeRefiProceedsGap({
        propertyValue: 500000,
        currentBalance: 360000,
        qualifyingRent: 2500, // low rent relative to balance
        escrowsMonthly: 600,
        newRate: 7.5,
        maxLtvPct: 75,
        minDscr: 1.25,
      });

      expect(res.bindingConstraint).toBe('DSCR');
      expect(res.canRetireBalance).toBe(false);
      expect(res.proceedsGap).toBeGreaterThan(0);
    });
  });
});
