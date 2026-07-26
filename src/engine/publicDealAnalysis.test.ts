import { describe, expect, it } from 'vitest';
import {
  analyzePublicLtrDeal,
  PUBLIC_LTR_DEAL_DEFAULTS,
  solvePublicMaxPurchasePrice,
} from './publicDealAnalysis';

describe('analyzePublicLtrDeal', () => {
  it('keeps lender DSCR separate from negative default Track 2 investor cash flow', () => {
    const analysis = analyzePublicLtrDeal(PUBLIC_LTR_DEAL_DEFAULTS);

    expect(analysis.lenderDscr).toBeGreaterThan(1);
    expect(analysis.track2Dscr).toBeLessThan(1);
    expect(analysis.investorCashFlowMonthly).toBeLessThan(0);
  });

  it('gives Deal Analyzer and DSCR Calculator parity through the shared defaults and helper', () => {
    const dealAnalyzerAnalysis = analyzePublicLtrDeal({ ...PUBLIC_LTR_DEAL_DEFAULTS });
    const calculatorAnalysis = analyzePublicLtrDeal({ ...PUBLIC_LTR_DEAL_DEFAULTS });

    expect(dealAnalyzerAnalysis).toEqual(calculatorAnalysis);
  });

  it('includes HOA in lender debt service and investor cash flow', () => {
    const withoutHoa = analyzePublicLtrDeal(PUBLIC_LTR_DEAL_DEFAULTS);
    const withHoa = analyzePublicLtrDeal({ ...PUBLIC_LTR_DEAL_DEFAULTS, monthlyHoa: 250 });

    expect(withHoa.pitiaMonthly).toBeCloseTo(withoutHoa.pitiaMonthly + 250, 8);
    expect(withHoa.investorCashFlowMonthly).toBeCloseTo(withoutHoa.investorCashFlowMonthly - 250, 8);
  });

  it('uses HOA in the public max-purchase lender DSCR calculation', () => {
    const withoutHoa = solvePublicMaxPurchasePrice({
      monthlyRent: 3_000,
      targetLenderDscr: 1.1,
      downPaymentPct: 25,
      annualRatePct: 7,
      annualTaxes: 5_000,
      annualInsurance: 2_000,
    });
    const withHoa = solvePublicMaxPurchasePrice({
      monthlyRent: 3_000,
      targetLenderDscr: 1.1,
      downPaymentPct: 25,
      annualRatePct: 7,
      annualTaxes: 5_000,
      annualInsurance: 2_000,
      monthlyHoa: 250,
    });

    expect(withHoa.maxPurchasePrice).toBeLessThan(withoutHoa.maxPurchasePrice);
  });
});
