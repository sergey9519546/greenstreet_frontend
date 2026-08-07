/**
 * GreenStreet Finance — APEX Godmode QA Comprehensive Test Suite
 *
 * Stress-tests extreme edge cases, boundary conditions, state law coverage,
 * ARM rate shocks, STR micro-markets, FIRPTA withholding, XSS sanitization,
 * and portfolio reserve scaling across the financial engine.
 */

import { describe, it, expect } from 'vitest';
import { solveDSCR, calculatePI, calculatePaymentFactor } from './engine';
import { checkPPPLegal } from './statePppLaws';
import { computeReassessedTax } from './reassessmentEngine';
import { computeARMReset, DEFAULT_ARM_PROGRAMS, CURRENT_MARKET_SNAPSHOT } from './armResetEngine';
import { computeSTRMonthlySeasonality, FLORIDA_SNOWBIRD_STR_SEASONALITY, MOUNTAIN_RESORT_STR_SEASONALITY } from './strUnderwriting';
import { calculateFIRPTAImpact } from './firpta';
import { buildICMemo, computeVerdict } from './decisionSupport';
import { computeReserveScenarios } from './reserveEngine';
import type { PropertyInputs, BorrowerProfile, LoanStructure } from './types';

describe('APEX Godmode QA — Boundary & Edge Case Audit', () => {

  // ── 1. ZERO & EXTREME INPUT RESISTANCE ──
  describe('Boundary & Coercion Resistance', () => {
    it('handles $0 loan amount gracefully without division by zero', () => {
      const pi = calculatePI(0, 7.0, 360);
      expect(pi).toBe(0);
      expect(Number.isNaN(pi)).toBe(false);
    });

    it('handles 0% interest rate amortization factor (1/n)', () => {
      const factor = calculatePaymentFactor(0, 360);
      expect(factor).toBeCloseTo(1 / 360, 6);
    });

    it('handles extreme 25% interest rate without overflow', () => {
      const pi = calculatePI(300000, 25.0, 360);
      expect(pi).toBeGreaterThan(0);
      expect(Number.isFinite(pi)).toBe(true);
    });
  });

  // ── 2. 50-STATE PPP STATUTORY COVERAGE ──
  describe('50-State Statutory PPP Legal Map', () => {
    it('validates all 50 US states have explicit statutory rules defined', () => {
      const US_STATES = [
        'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
        'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
        'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
        'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
        'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
      ];

      for (const st of US_STATES) {
        const rule = checkPPPLegal(st, 'LLC', 400000, 1, 'FIXED');
        expect(rule).toBeDefined();
        expect(rule.status).toBeDefined();
        expect(rule.reason.length).toBeGreaterThan(5);
      }
    });

    it('correctly handles Minnesota HF 3437 (enacted April 23, 2026)', () => {
      const mn = checkPPPLegal('MN', 'LLC', 400000, 1, 'FIXED');
      expect(mn.allowed).toBe(true);
      expect(mn.reason).toContain('HF 3437');
    });
  });

  // ── 3. STATE TAX REASSESSMENT BOUNDARIES ──
  describe('State Tax Reassessment Boundaries', () => {
    it('handles unknown state code by falling back safely to standard rate', () => {
      const res = computeReassessedTax(400000, 'XX', 4000);
      expect(res).toBeDefined();
      expect(res.reassessedAnnualTax).toBeGreaterThan(0);
    });

    it('reassesses California property tax under Prop 13 (1.25% base rate)', () => {
      const ca = computeReassessedTax(1000000, 'CA', 4000);
      expect(ca.reassessedAnnualTax).toBe(12500); // 1.25% of $1M
      expect(ca.deltaAnnual).toBe(8500);
    });
  });

  // ── 4. ARM RESET RATE SHOCK STRESS TEST ──
  describe('ARM Reset & Shock Stress Testing', () => {
    it('computes 5/1 ARM reset under +500 bps market shock', () => {
      const arm51 = DEFAULT_ARM_PROGRAMS['5_6_ARM'];
      const reset = computeARMReset(arm51, 300000, 300, 3500, 500, 0, CURRENT_MARKET_SNAPSHOT);
      
      expect(reset).toBeDefined();
      expect(reset.paymentAtCurrentReset).toBeGreaterThan(0);
      expect(reset.paymentAtStressReset).toBeGreaterThan(0);
      expect(reset.cushionBpsAtStress).toBeDefined();
    });
  });

  // ── 5. STR MICRO-MARKET SEASONALITY ──
  describe('STR Micro-Market Seasonality Profiles', () => {
    it('evaluates Florida Snowbird profile (winter peak vs summer lull)', () => {
      const fl = computeSTRMonthlySeasonality(100000, 3000, 20, FLORIDA_SNOWBIRD_STR_SEASONALITY);
      expect(fl.months.length).toBe(12);
      // Jan (snowbird peak) revenue > Jul (summer heat lull) revenue
      const jan = fl.months.find(m => m.month === 'Jan')!;
      const jul = fl.months.find(m => m.month === 'Jul')!;
      expect(jan.projectedRevenue).toBeGreaterThan(jul.projectedRevenue);
    });

    it('evaluates Mountain Resort profile (winter ski & summer peak)', () => {
      const mountain = computeSTRMonthlySeasonality(120000, 3500, 20, MOUNTAIN_RESORT_STR_SEASONALITY);
      expect(mountain.months.length).toBe(12);
      // Dec (ski peak) revenue > May (mud season) revenue
      const dec = mountain.months.find(m => m.month === 'Dec')!;
      const may = mountain.months.find(m => m.month === 'May')!;
      expect(dec.projectedRevenue).toBeGreaterThan(may.projectedRevenue);
    });
  });

  // ── 6. FIRPTA FOREIGN INVESTOR WITHHOLDING ──
  describe('FIRPTA Foreign Investor Tax Withholding', () => {
    it('applies 15% FIRPTA withholding on $2M property sale by non-US seller', () => {
      const firpta = calculateFIRPTAImpact({ salePrice: 2000000, adjustedBasis: 1000000, state: 'TX', isUsResident: false });
      expect(firpta.federalWithholdingRate).toBe(0.15);
      expect(firpta.federalWithholdingAmount).toBe(300000);
    });

    it('applies 15% gross withholding for non-US sellers', () => {
      const firpta = calculateFIRPTAImpact({ salePrice: 500000, adjustedBasis: 300000, state: 'TX', isUsResident: false });
      expect(firpta.federalWithholdingRate).toBe(0.15);
      expect(firpta.federalWithholdingAmount).toBe(75000);
    });
  });

  // ── 7. IC MEMO SECURITY XSS SANITIZATION ──
  describe('IC Memo XSS Sanitization', () => {
    it('escapes malicious HTML/JS tags in property address and entity name', () => {
      const mockDSCR = solveDSCR(
        { purchasePrice: 400000, leaseRent: 3500, annualTaxes: 4000, annualInsurance: 1800, hoa: 0 } as PropertyInputs,
        { ficoScore: 740, experience: 'EXPERIENCED' } as BorrowerProfile,
        // '30_YR_FIXED' was not a valid LoanTerm (the enum is 30_YR/40_YR/15_YR)
        // and ioPeriod was missing entirely, which now trips engine.ioPeriodYears'
        // fail-closed guard on unknown IO periods. Fixture corrected to a valid
        // no-IO 30-year loan; the guard itself is intentionally left strict.
        { ltv: 75, term: '30_YR', ioPeriod: 'NONE' } as unknown as LoanStructure,
        'LTR', false, 0, 'GROSS_PITIA', 4000
      );

      const maliciousInput = {
        propertyAddress: "<script>alert('XSS')</script> 123 Main St",
        entityType: '" onload="alert(1)"',
        verdict: computeVerdict({
          track1DSCR: 1.25,
          track2DSCR: 1.15,
          lenderMinDSCR: 1.0,
          rateHeadroomBps: 150,
          dealBreakRate: 8.5,
          afterTaxIRR: 0.14,
          costSegViability: { viable: true } as any,
          insuranceGate: { verdict: 'CLEAR', zone: 'STANDARD' } as any,
          brrrrGate: { applies: false } as any,
          armReset: null,
          killCriteriaOverride: [],
          lenderRanking: [],
        } as any),
        track1DSCR: 1.25,
        lenderMinDSCR: 1.0,
        debtYield: 9.5,
        ltv: 75,
        ltvCap: 80,
        dealBreakRate: 8.5,
        cushionBps: 150,
        entryCapRate: 7.0,
        year1CoC: 9.0,
        preTaxIRR: 16.0,
        preTaxP10: 12.0,
        preTaxP90: 20.0,
        afterTaxIRR: 0.14,
        equityMultiple: 1.8,
        sellerAnnualTax: 4000,
        reassessedAnnualTax: 4000,
        bindingRisk: 'Rent',
        pDSCRLessThan1: 0.05,
        fifthPctDSCR: 0.95,
        heatmapSummary: 'Low risk',
        armReset: null,
        lenderRanking: [],
        insuranceStatus: 'CLEAR',
        strLegality: 'CLEAR',
        reserves: { likely: 3, conservative: 6, stress: 9, portfolioStack: 0 },
        prepaySchedule: '5-4-3-2-1',
        assumptions: [],
        sourceDates: [],
      } as any;

      const memo = buildICMemo(maliciousInput);
      expect(memo.propertyAddress).not.toContain('<script>');
      expect(memo.propertyAddress).toContain('&lt;script&gt;');
      expect(memo.entityType).not.toContain('"');
      expect(memo.entityType).toContain('&quot;');
    });
  });

  // ── 8. PORTFOLIO RESERVE SCALING ──
  describe('Portfolio Property Reserve Scaling', () => {
    it('scales reserve requirements for investors with >4 properties (+1mo per unit >4)', () => {
      const borrowerBase: BorrowerProfile = {
        ficoScore: 740,
        experience: 'EXPERIENCED',
        existingFinancedProperties: 2,
        entityType: 'LLC',
        isUSCitizenOrPR: true,
        availableReserves: 50000,
        reserveAssets: [],
        isFirstResponder: false,
        isNonUsInvestor: false,
      };

      const resBase = computeReserveScenarios(1.25, 2000, 'LTR', borrowerBase, { ltv: 75 } as LoanStructure, 'TX', []);
      
      const borrowerLarge: BorrowerProfile = {
        ...borrowerBase,
        existingFinancedProperties: 6, // 6 properties > 4 → +2 months
      };
      
      const resLarge = computeReserveScenarios(1.25, 2000, 'LTR', borrowerLarge, { ltv: 75 } as LoanStructure, 'TX', []);

      // Large portfolio should require extra reserve months
      expect(resLarge.conservative.totalMonths).toBeGreaterThan(resBase.conservative.totalMonths);
    });
  });
});
