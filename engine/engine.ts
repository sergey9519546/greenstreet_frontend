// ============================================================
// DSCR Loan Command Center v7.0 — Core Qualification Engine
// Dual-Track, Math-Verified, Provenance-Honest
//
// GOLDEN TEST VALUES (must reproduce):
//   factor 0.0075127 @ 8.25%, 30yr  ← STRESS-LEVEL rate (NOT market typical)
//   factor 0.006653  @ 7.00%, 30yr  ← TYPICAL market rate (June 2026)
//   Flagship Track 1: 1.05 @ 7.00%, 0.96 @ 8.25% (8.25% = stress case)
//   Rent breakpoint: 4.9% below $3,000
//   Deal-break rate: 7.67%
//
// RATE CALIBRATION NOTE (AUDIT-FINAL-4):
//   The 8.25% "working example" rate is a STRESS-LEVEL scenario used to
//   demonstrate DSCR failure (Track 1 drops to 0.96). It is NOT a market-
//   typical rate. June 2026 typical 30-yr fixed DSCR range = 6.125%–7.50%.
//   Full-market range (with adverse selection) extends to ~10.75%.
//   ARM range = 5.125%–6.125% (5/6, 7/6, 10/6).
// ============================================================

import type {
  PropertyInputs,
  BorrowerProfile,
  LoanStructure,
  RentalStrategy,
  DSCRResult,
  DSCRTrack,
  DualTrackDSCR,
  DualTrackVerdict,
  DSCRGradient,
  DSCRTier,
  PITIABreakdown,
  CashToCloseStack,
  TripleRate,
  DSCRFormulaMethod,
} from './types';

// ============================================================
// SECTION 5.2: CORRECTED PAYMENT FACTOR CALCULATION
// Formula: factor = r(1+r)^n / ((1+r)^n - 1)
// r = rate/12, n = term_months
//
// Verified: (1.006875)^360 = 11.781 (NOT 10.935 as in v5.0)
// $300,000 × 0.0075127 = $2,254 (v5.0 wrongly computed $2,270)
// ============================================================

export function calculatePaymentFactor(annualRate: number, termMonths: number): number {
  const r = annualRate / 100 / 12;
  if (r === 0) return 1 / termMonths;
  const compoundFactor = Math.pow(1 + r, termMonths);
  return (r * compoundFactor) / (compoundFactor - 1);
}

export function calculatePI(loanAmount: number, annualRate: number, termMonths: number): number {
  const factor = calculatePaymentFactor(annualRate, termMonths);
  return loanAmount * factor;
}

export function calculateIOPayment(loanAmount: number, annualRate: number): number {
  return loanAmount * (annualRate / 100 / 12);
}

// ============================================================
// SECTION 6: RATE CALIBRATION — JUNE 2026 (verified 2026-06-17)
// Anchor: 6.125% par at 740 FICO / 70% LTV
// Competitive: 6.125%–6.49%
// Typical: 6.50%–7.50%
// Full-Market: up to ~10.75% (capped at 12.00% usury red-line)
// ARM: 5.125%–6.125% (5/6, 7/6, 10/6)
//
// LENDER FICO OVERLAY WARNING (AUDIT-FINAL-4 #10):
//   The base ficoAdjustment matrix below allows pricing down to 620 FICO.
//   However, the MAJORITY of DSCR lenders impose a 660/680 FICO floor as
//   an overlay even when the base engine allows 620. As of June 2026:
//     - 620 FICO floor: Griffin, Easy Street (rare exceptions)
//     - 640 FICO floor: Defy
//     - 660 FICO floor: Kiavi, Lima One, New Silver, Deephaven, CoreVest,
//                      American Heritage, RCN Capital
//     - 680 FICO floor: Visio, Angel Oak
//   Borrowers below 660 should be flagged "specialist lenders only".
//   Borrowers below 620 are ineligible for all DSCR programs.
//   See lenders.ts minFICO field for per-lender verification.
// ============================================================

const BASE_RATE_ANCHOR = 6.125; // June 2026 competitive anchor
const TYPICAL_SPREAD = 0.875;   // 7.00% typical = 6.125% + 0.875%
const FULL_MARKET_SPREAD = 4.625; // ~10.75%

// Hard bounds on any quoted rate (AUDIT-FINAL-4):
//   - 5.000% floor: sub-SOFR (3.59%) is economically impossible for a DSCR loan
//   - 12.000% cap: usury red-line; full-market ceiling
const RATE_FLOOR_PCT = 5.0;
const RATE_CEILING_PCT = 12.0;

// --- Pricing Matrix Adjustments (basis points) ---

function ficoAdjustment(fico: number): number {
  if (fico >= 760) return -12.5;
  if (fico >= 740) return 0;       // base tier
  if (fico >= 720) return 25;
  if (fico >= 700) return 50;
  if (fico >= 680) return 75;
  if (fico >= 660) return 125;
  if (fico >= 640) return 175;
  if (fico >= 620) return 250;
  return 350;
}

function ltvAdjustment(ltv: number): number {
  if (ltv <= 60) return -50;
  if (ltv <= 65) return -37.5;
  if (ltv <= 70) return -25;
  if (ltv <= 75) return 0;         // base tier
  if (ltv <= 80) return 50;
  if (ltv <= 85) return 125;
  return 200;
}

function dscrTierAdjustment(dscr: number): number {
  // AUDIT-FINAL-4 #6: 1.0 vs 1.5+ DSCR spread must be 37.5–50 bps (market-realistic).
  // Previous matrix had 100 bps spread (75 - (-25)) — 2x too wide.
  // Compressed matrix: 1.5+ vs 1.0 = 50 bps spread (within audit spec).
  if (dscr >= 1.50) return -25;
  if (dscr >= 1.25) return 0;      // STRONG tier = base
  if (dscr >= 1.10) return 12.5;
  if (dscr >= 1.00) return 25;     // 1.0 vs 1.5+ = 50 bps ✓
  if (dscr >= 0.85) return 75;     // specialist territory
  return 150;                      // NO_RATIO
}

function propertyTypeAdjustment(pt: string): number {
  switch (pt) {
    case 'SFR': return 0;
    case '2-4_UNIT': return 25;
    case 'CONDO_WARRANTABLE': return 25;
    case 'CONDO_NON_WARRANTABLE': return 75;
    case 'CONDOTEL': return 100;
    case 'RURAL': return 50;
    case '5+_UNIT': return 50;
    case 'MIXED_USE': return 75;
    default: return 0;
  }
}

function loanPurposeAdjustment(purpose: string): number {
  switch (purpose) {
    case 'PURCHASE': return 0;
    case 'RATE_TERM': return 25;
    case 'CASH_OUT': return 50;
    default: return 0;
  }
}

function armRateAdjustment(armType: string): number {
  switch (armType) {
    case 'FIXED': return 0;
    case '5_6_ARM': return -100;
    case '7_6_ARM': return -75;
    case '10_6_ARM': return -50;
    default: return 0;
  }
}

function ioRateAdjustment(ioPeriod: string): number {
  switch (ioPeriod) {
    case 'NONE': return 0;
    case '5_YR': return 50;
    case '7_YR': return 50;
    case '10_YR': return 50;
    default: return 0;
  }
}

function termAdjustment(term: string): number {
  switch (term) {
    case '30_YR': return 0;
    case '40_YR': return 25;
    case '15_YR': return -25;
    default: return 0;
  }
}

function nonUsInvestorAdjustment(isNonUsInvestor: boolean): number {
  return isNonUsInvestor ? 75 : 0;
}

function decliningMarketAdjustment(isDecliningMarket: boolean): number {
  return isDecliningMarket ? 25 : 0;
}

// ============================================================
// DSCR GRADIENT (6 tiers)
// ============================================================

export function getDSCRGradient(dscr: number): DSCRGradient {
  if (dscr >= 1.50) {
    return { tier: 'ELITE', label: 'Elite Pricing Tier', range: '≥1.50', color: 'emerald', bgClass: 'bg-emerald-500/20', textClass: 'text-emerald-400', borderClass: 'border-emerald-500/50', emoji: '🚀' };
  }
  if (dscr >= 1.25) {
    return { tier: 'STRONG', label: 'Best Pricing Tier', range: '1.25–1.49', color: 'cyan', bgClass: 'bg-cyan-500/20', textClass: 'text-cyan-400', borderClass: 'border-cyan-500/50', emoji: '💎' };
  }
  if (dscr >= 1.10) {
    return { tier: 'STANDARD', label: 'Standard Approval', range: '1.10–1.24', color: 'green', bgClass: 'bg-green-500/20', textClass: 'text-green-400', borderClass: 'border-green-500/50', emoji: '🟢' };
  }
  if (dscr >= 1.00) {
    return { tier: 'PREMIUM', label: 'Approval Likely w/ Premium', range: '1.00–1.09', color: 'yellow', bgClass: 'bg-yellow-500/20', textClass: 'text-yellow-400', borderClass: 'border-yellow-500/50', emoji: '🟡' };
  }
  if (dscr >= 0.85) {
    return { tier: 'SPECIALIST', label: 'Flex/Specialist Lenders Only', range: '0.85–0.99', color: 'orange', bgClass: 'bg-orange-500/20', textClass: 'text-orange-400', borderClass: 'border-orange-500/50', emoji: '🟠' };
  }
  if (dscr >= 0.75) {
    return { tier: 'SPECIALIST', label: 'Deep Flex / No-Ratio Programs', range: '0.75–0.84', color: 'orange', bgClass: 'bg-orange-500/20', textClass: 'text-orange-400', borderClass: 'border-orange-500/50', emoji: '🟠' };
  }
  return { tier: 'NO_RATIO', label: 'No-Ratio Programs Only', range: '<0.75', color: 'red', bgClass: 'bg-red-500/20', textClass: 'text-red-400', borderClass: 'border-red-500/50', emoji: '🔴' };
}

// ============================================================
// SECTION 2: DUAL-TRACK PRINCIPLE — THE CORE CORRECTION
//
// Track 1 (Lender Qualification): Qualifying_Rent / PITIA
//   - LTR 1-4 unit: NO vacancy haircut by default
//   - Lower of lease and 1007 market rent
//   - STR: ~20% standardized haircut on STR gross income
//   - Program toggle: some lenders haircut 0-5% on 2-4 unit
//
// Track 2 (Investor Survival):
//   (Gross × (1-Vacancy) - Management - Maintenance) / PITIA
//   - LTR vacancy: 8%, STR vacancy: 8%, MTR: 8% (standardized to 8%)
//   - Management: 8% of gross
//   - Maintenance: 5% of gross
//
// NEVER blend. ALWAYS display side-by-side.
// ============================================================

// Track 2 default expense rates
const TRACK2_LT_VACANCY_PCT = 8;
const TRACK2_STR_VACANCY_PCT = 8;
const TRACK2_MTR_VACANCY_PCT = 8;
const TRACK2_MANAGEMENT_PCT = 8;
const TRACK2_MAINTENANCE_PCT = 5;

// STR haircut for Track 1 qualification
const STR_QUALIFYING_HAIRCUT_PCT = 20; // ~20% standard haircut

/**
 * Compute qualifying rent for Track 1 (Lender Qualification)
 *
 * LTR: lower of leaseRent and marketRent, NO vacancy deduction
 * STR: STR_Gross × 0.80 (standard ~20% haircut)
 * MTR: STR_Gross × 0.88 (12% haircut)
 */
function computeQualifyingRent(
  property: PropertyInputs,
  strategy: RentalStrategy,
  vacancyHaircutEnabled: boolean = false,  // program toggle
  vacancyHaircutPct: number = 0
): { rent: number; source: string; haircutApplied: number } {
  if (strategy === 'STR') {
    // STR Track 1: ~20% standardized haircut on STR gross income
    const strNet = property.strProjectedRent * (1 - STR_QUALIFYING_HAIRCUT_PCT / 100);
    const ltrFallback = Math.min(property.leaseRent, property.marketRent);
    const qualifying = Math.max(strNet, ltrFallback); // Use whichever is higher (STR with haircut vs LT fallback)
    return {
      rent: qualifying,
      source: qualifying === strNet
        ? `STR Income × ${(100 - STR_QUALIFYING_HAIRCUT_PCT)}% (${STR_QUALIFYING_HAIRCUT_PCT}% haircut) — $${property.strProjectedRent} → $${strNet.toFixed(0)}`
        : 'LT Market Rent Fallback (higher than STR after haircut)',
      haircutApplied: qualifying === strNet ? STR_QUALIFYING_HAIRCUT_PCT : 0,
    };
  }

  if (strategy === 'MTR') {
    const mtrNet = property.strProjectedRent * 0.88;
    const ltrFallback = Math.min(property.leaseRent, property.marketRent);
    const qualifying = Math.max(mtrNet, ltrFallback);
    return {
      rent: qualifying,
      source: qualifying === mtrNet ? 'MTR Income (12% haircut)' : 'LT Market Rent Fallback',
      haircutApplied: qualifying === mtrNet ? 12 : 0,
    };
  }

  // LTR: lower of lease and 1007 market rent — NO vacancy haircut
  const lowerRent = Math.min(property.leaseRent, property.marketRent);
  let qualifyingRent = lowerRent;
  let haircut = 0;

  // Program toggle: some lenders apply 0-5% vacancy on 2-4 unit
  if (vacancyHaircutEnabled && property.unitCount > 1 && vacancyHaircutPct > 0) {
    qualifyingRent = lowerRent * (1 - vacancyHaircutPct / 100);
    haircut = vacancyHaircutPct;
  }

  return {
    rent: qualifyingRent,
    source: property.leaseRent <= property.marketRent
      ? `Lease Rent (lower of lease/market)${haircut > 0 ? ` — ${haircut}% haircut applied` : ''}`
      : `1007 Market Rent (lower of lease/market)${haircut > 0 ? ` — ${haircut}% haircut applied` : ''}`,
    haircutApplied: haircut,
  };
}

/**
 * Build Track 1 — Lender Qualification DSCR
 */
function buildTrack1(
  qualifyingRent: number,
  rentSource: string,
  pitia: number,
  formulaMethod: DSCRFormulaMethod,
  ioPayment: number | null,
  haircutApplied: number,
  piOnly: number, // P&I payment only (excludes taxes, insurance, HOA, flood, MI)
): DSCRTrack {
  const denominator = formulaMethod === 'GROSS_ITIA' && ioPayment
    ? ioPayment
    : formulaMethod === 'NOI_PI'
    // NOI/P&I: denominator is P&I only. Previously used (pitia - fixedExpenses) which
    // accidentally included mortgageInsurance when MI > 0. Using piOnly is exact.
    ? piOnly
    : pitia;

  const dscr = denominator > 0 ? qualifyingRent / denominator : 0;
  const monthlyCashFlow = qualifyingRent - pitia;

  return {
    label: 'Track 1 — Lender Qualification',
    dscr: Math.round(dscr * 1000) / 1000,
    gradient: getDSCRGradient(dscr),
    qualifyingRent,
    rentSource,
    formulaMethod,
    vacancyApplied: haircutApplied,
    managementApplied: 0,
    maintenanceApplied: 0,
    netRentAfterDeductions: qualifyingRent,
    monthlyCashFlow,
    passes: dscr >= 1.0,
  };
}

/**
 * Build Track 2 — Investor Survival DSCR
 */
function buildTrack2(
  grossRent: number,
  pitia: number,
  strategy: RentalStrategy,
): DSCRTrack {
  const vacancyPct = strategy === 'STR'
    ? TRACK2_STR_VACANCY_PCT
    : strategy === 'MTR'
    ? TRACK2_MTR_VACANCY_PCT
    : TRACK2_LT_VACANCY_PCT;

  const afterVacancy = grossRent * (1 - vacancyPct / 100);
  const management = grossRent * (TRACK2_MANAGEMENT_PCT / 100);
  const maintenance = grossRent * (TRACK2_MAINTENANCE_PCT / 100);
  const netIncome = afterVacancy - management - maintenance;
  const dscr = pitia > 0 ? netIncome / pitia : 0;
  const monthlyCashFlow = netIncome - pitia;

  return {
    label: 'Track 2 — Investor Survival',
    dscr: Math.round(dscr * 1000) / 1000,
    gradient: getDSCRGradient(dscr),
    qualifyingRent: grossRent,
    rentSource: `Gross less ${vacancyPct}% vacancy, ${TRACK2_MANAGEMENT_PCT}% mgmt, ${TRACK2_MAINTENANCE_PCT}% maint`,
    formulaMethod: 'GROSS_PITIA',
    vacancyApplied: vacancyPct,
    managementApplied: TRACK2_MANAGEMENT_PCT,
    maintenanceApplied: TRACK2_MAINTENANCE_PCT,
    netRentAfterDeductions: netIncome,
    monthlyCashFlow,
    passes: dscr >= 1.0,
  };
}

/**
 * Build dual-track verdict
 */
function buildVerdict(track1: DSCRTrack, track2: DSCRTrack): DualTrackVerdict {
  const track1Passes = track1.dscr >= 1.0;
  const track2Passes = track2.dscr >= 1.0;

  let summary: string;
  let warningRequired = false;

  if (track1Passes && track2Passes) {
    summary = 'Deal qualifies and cash flows after expenses.';
  } else if (track1Passes && !track2Passes) {
    summary = `This deal gets approved. It does not cash flow. Track 2 shows -$${Math.abs(track2.monthlyCashFlow).toFixed(0)}/month negative carry. Proceed only if appreciation/tax strategy justifies negative carry.`;
    warningRequired = true;
  } else if (!track1Passes && track2Passes) {
    summary = 'Deal cash flows as an investment but may not qualify for lender DSCR floor. Rescue engine needed.';
  } else {
    summary = 'Deal fails both qualification and cash flow. Rescue engine needed.';
  }

  return { track1Passes, track2Passes, summary, warningRequired };
}

// ============================================================
// PITIA CALCULATION (Section 5.3)
// ============================================================

export function calculatePITIA(
  loanAmount: number,
  rate: number,
  termYears: number,
  ioPeriod: string,
  annualTaxes: number,
  annualInsurance: number,
  hoa: number,
  floodInsurance: number = 0,
  mortgageInsurance: number = 0,
): PITIABreakdown {
  const termMonths = termYears * 12;
  const ioYears = ioPeriod === 'NONE' ? 0 : ioPeriod === '5_YR' ? 5 : ioPeriod === '7_YR' ? 7 : 10;
  const isInterestOnly = ioYears > 0;

  let pi: number;
  let ioPayment: number | undefined;

  if (isInterestOnly) {
    pi = calculateIOPayment(loanAmount, rate);
    ioPayment = pi;
  } else {
    pi = calculatePI(loanAmount, rate, termMonths);
  }

  const taxes = annualTaxes / 12;
  const insurance = annualInsurance / 12;
  const flood = floodInsurance / 12;
  const mi = mortgageInsurance;

  const total = pi + taxes + insurance + hoa + flood + mi;
  const itia = isInterestOnly ? pi + taxes + insurance + hoa + flood + mi : undefined;

  return {
    principalAndInterest: pi,
    taxes,
    insurance,
    hoa,
    floodInsurance: flood,
    mortgageInsurance: mi,
    total,
    isInterestOnly,
    interestOnlyPayment: ioPayment,
    itia,
  };
}

// ============================================================
// SECTION 5.9: DEAL-BREAK RATE SOLVER
// Find rate where Track 1 DSCR = 1.0
// i.e., P&I(rate) = Qualifying_Income - Fixed_Expenses
// ============================================================

export function solveDealBreakRate(
  qualifyingRent: number,
  loanAmount: number,
  termYears: number,
  ioPeriod: string,
  annualTaxes: number,
  annualInsurance: number,
  hoa: number,
  floodInsurance: number = 0,
): number {
  // Target: P&I = qualifyingRent - fixedExpenses (for DSCR = 1.0)
  const fixedExpenses = annualTaxes / 12 + annualInsurance / 12 + hoa + floodInsurance / 12;
  const targetPI = qualifyingRent - fixedExpenses;

  if (targetPI <= 0) return 0; // Impossible: fixed expenses exceed income

  const termMonths = termYears * 12;
  const ioYears = ioPeriod === 'NONE' ? 0 : parseInt(ioPeriod) || 0;

  if (ioYears > 0) {
    // IO: targetPI = loanAmount * rate/12 → rate = targetPI * 12 / loanAmount * 100
    return (targetPI * 12 / loanAmount) * 100;
  }

  // Amortizing: bisection
  let lowRate = 2.0;
  let highRate = 15.0;

  for (let i = 0; i < 50; i++) {
    const midRate = (lowRate + highRate) / 2;
    const pi = calculatePI(loanAmount, midRate, termMonths);
    if (pi > targetPI) {
      highRate = midRate;
    } else {
      lowRate = midRate;
    }
  }

  return Math.round((lowRate + highRate) / 2 * 100) / 100;
}

// ============================================================
// SECTION 5.7-5.8: MAX PURCHASE PRICE / MIN DOWN PAYMENT
// ============================================================

export function solveMaxPurchasePrice(
  qualifyingRent: number,
  ltv: number,
  rate: number,
  termYears: number,
  ioPeriod: string,
  annualTaxes: number,
  annualInsurance: number,
  hoa: number,
  floodInsurance: number = 0,
  targetDSCR: number = 1.0,
): number {
  // Max PITIA = qualifyingRent / targetDSCR
  const maxPITIA = qualifyingRent / targetDSCR;
  const fixedExpenses = annualTaxes / 12 + annualInsurance / 12 + hoa + floodInsurance / 12;
  const maxPI = maxPITIA - fixedExpenses;

  if (maxPI <= 0) return 0;

  const termMonths = termYears * 12;
  const factor = calculatePaymentFactor(rate, termMonths);
  const maxLoan = maxPI / factor;
  const maxPrice = maxLoan / (ltv / 100);

  return Math.round(maxPrice);
}

export function solveMinDownPayment(
  purchasePrice: number,
  qualifyingRent: number,
  ltv: number,
  rate: number,
  termYears: number,
  ioPeriod: string,
  annualTaxes: number,
  annualInsurance: number,
  hoa: number,
  floodInsurance: number = 0,
  targetDSCR: number = 1.0,
): { minDown: number; additionalDown: number } {
  const maxPrice = solveMaxPurchasePrice(
    qualifyingRent, ltv, rate, termYears, ioPeriod,
    annualTaxes, annualInsurance, hoa, floodInsurance, targetDSCR
  );
  const maxLoan = maxPrice * (ltv / 100);
  const minDown = purchasePrice - maxLoan;
  const currentDown = purchasePrice * (1 - ltv / 100);
  return { minDown: Math.max(minDown, 0), additionalDown: Math.max(minDown - currentDown, 0) };
}

// ============================================================
// SECTION 5.6: REQUIRED GROSS RENT FOR TARGET DSCR
// ============================================================

export function solveRequiredRent(
  targetDSCR: number,
  pitia: number,
  incomeFactor: number = 1.0 // 1.0 = no haircut; 0.80 = 20% STR haircut
): number {
  return (targetDSCR * pitia) / incomeFactor;
}

// ============================================================
// CASH-TO-CLOSE (Section 5.10)
// ============================================================

export function calculateCashToClose(
  purchasePrice: number,
  loanAmount: number,
  loan: LoanStructure,
  reserveMonthsLikely: number,
  reserveMonthsConservative: number,
  monthlyPITIA: number,
  furnishingBudget: number = 0,
  sellerCredits: number = 0,
): CashToCloseStack {
  const downPayment = purchasePrice - loanAmount;
  const closingCosts = loanAmount * 0.03; // 3% default
  const points = loanAmount * (loan.points / 100);
  const lenderFees = loan.lenderFees;
  const brokerFees = loan.brokerFees;
  const rateLockCost = loan.rateLockCost;
  const reservesLikely = reserveMonthsLikely * monthlyPITIA;
  const reservesConservative = reserveMonthsConservative * monthlyPITIA;

  const base = downPayment + closingCosts + points + lenderFees + brokerFees + rateLockCost;
  const total = base + reservesLikely + furnishingBudget - sellerCredits;
  const totalConservative = base + reservesConservative + furnishingBudget - sellerCredits;
  const totalStress = base + (Math.min(reserveMonthsConservative * 1.5, 12) * monthlyPITIA) + furnishingBudget - sellerCredits;

  return {
    downPayment,
    closingCosts,
    points,
    lenderFees,
    brokerFees,
    rateLockCost,
    reserveRequirement: reservesLikely,
    reserveConservative: reservesConservative,
    furnishingBudget,
    credits: sellerCredits,
    total: Math.round(total),
    totalConservative: Math.round(totalConservative),
    totalStress: Math.round(totalStress),
  };
}

// ============================================================
// RATE ESTIMATION (Iterative Rate-DSCR Solver)
// ============================================================

export function estimateRate(
  borrower: BorrowerProfile,
  loan: LoanStructure,
  dscrTier: number,
  propertyType: string,
  isDecliningMarket: boolean,
): number {
  const totalBps =
    ficoAdjustment(borrower.ficoScore) +
    ltvAdjustment(loan.ltv) +
    dscrTierAdjustment(dscrTier) +
    propertyTypeAdjustment(propertyType) +
    loanPurposeAdjustment(loan.purpose) +
    armRateAdjustment(loan.armType) +
    ioRateAdjustment(loan.ioPeriod) +
    termAdjustment(loan.term) +
    nonUsInvestorAdjustment(borrower.isNonUsInvestor) +
    decliningMarketAdjustment(isDecliningMarket);

  const rate = BASE_RATE_ANCHOR + totalBps / 100;
  // AUDIT-FINAL-4: enforce hard bounds — floor 5.0% (sub-SOFR impossible),
  // ceiling 12.0% (usury red-line). Previous floor of 3.5% was sub-SOFR.
  return Math.min(Math.max(rate, RATE_FLOOR_PCT), RATE_CEILING_PCT);
}

export function computeTripleRate(solvedRate: number): TripleRate {
  return {
    competitive: Math.max(Math.round((solvedRate - 0.875) * 1000) / 1000, 5.125),
    typical: Math.round(solvedRate * 1000) / 1000,
    fullMarket: Math.round(Math.min(solvedRate + FULL_MARKET_SPREAD, 12.0) * 1000) / 1000,
    dateStamp: 'June 2026',
    treasurySpread: '10yr + ~200-225 bps',
  };
}

// ============================================================
// APPRAISAL BREAKPOINT (Section 8.1)
// ============================================================

function computeAppraisalBreakpoint(qualifyingRent: number, pitia: number): {
  rent: number;
  percentBelow: number;
} {
  const breakpointRent = pitia * 1.0; // DSCR = 1.0 → rent = PITIA
  const percentBelow = qualifyingRent > 0
    ? ((qualifyingRent - breakpointRent) / qualifyingRent) * 100
    : 0;
  return { rent: Math.round(breakpointRent), percentBelow: Math.round(percentBelow * 10) / 10 };
}

// ============================================================
// QUICK DSCR ESTIMATE — shared helper for lightweight callers
// (e.g. QualifyModal inline calculator)
//
// Parameters mirror the modal's own assumptions so both surfaces
// agree on the same number. The modal currently uses 0.35%/yr
// insurance; the engine default is 0.5%/yr. Callers should pass
// annualInsuranceRate=0.005 to match the engine, or 0.0035 to
// reproduce the original modal result.
//
// Qualification tier returned:
//   dscr ≥ 1.25  → "LIKELY_QUALIFIES"        (strong buffer)
//   dscr ≥ 1.00  → "BORDERLINE"               (meets minimum, verify)
//   dscr ≥ 0.85  → "SPECIALIST_REQUIRED"      (flex programs only)
//   dscr  < 0.85  → "UNLIKELY"                 (deal-break territory)
//
// NOTE: This is a PRELIMINARY ESTIMATE — not a pre-approval.
// Always cross-check with solveDSCR for the full iterative model.
// ============================================================

export type QuickDscrTier =
  | 'LIKELY_QUALIFIES'      // DSCR ≥ 1.25 — strong buffer, standard programs
  | 'BORDERLINE'            // 1.00–1.24 — meets minimum, lender confirmation required
  | 'SPECIALIST_REQUIRED'   // 0.85–0.99 — flex/specialist lenders only
  | 'UNLIKELY';             // < 0.85 — does not meet standard DSCR thresholds

export interface QuickDscrEstimate {
  dscr: number;
  tier: QuickDscrTier;
  label: string;
  pitia: number;
  /** Always "PRELIMINARY ESTIMATE — not a pre-approval or guarantee." */
  disclaimer: string;
  /** True when any input was missing/invalid; dscr and tier are not reliable. */
  needsReview: boolean;
  needsReviewReason?: string;
}

/**
 * Lightweight DSCR estimate for quick-calculator surfaces.
 *
 * Formula: rent / PITIA (Track 1, no vacancy, 30-yr amortization)
 * where PITIA = P&I + taxes + insurance (no HOA or flood in this simplified form).
 *
 * @param propertyValue   Purchase price or appraised value ($)
 * @param monthlyRent     Gross monthly rent ($)
 * @param annualRatePct   Annual interest rate (%)
 * @param ltv             LTV fraction (default 0.75)
 * @param annualTaxRate   Annual tax as % of value (default 0.012 = 1.2%)
 * @param annualInsRate   Annual insurance as % of value (default 0.005 = 0.5%)
 * @param termMonths      Amortization term in months (default 360 = 30yr)
 */
export function quickDscrEstimate(
  propertyValue: number,
  monthlyRent: number,
  annualRatePct: number,
  ltv: number = 0.75,
  annualTaxRate: number = 0.012,
  annualInsRate: number = 0.005,
  termMonths: number = 360,
): QuickDscrEstimate {
  // Input validation — return needs-review state on bad data
  if (
    !Number.isFinite(propertyValue) || propertyValue <= 0 ||
    !Number.isFinite(monthlyRent) || monthlyRent <= 0 ||
    !Number.isFinite(annualRatePct) || annualRatePct <= 0
  ) {
    return {
      dscr: 0,
      tier: 'UNLIKELY',
      label: 'Insufficient data',
      pitia: 0,
      disclaimer: 'PRELIMINARY ESTIMATE — not a pre-approval or guarantee.',
      needsReview: true,
      needsReviewReason: 'One or more required inputs (property value, rent, rate) are missing or invalid.',
    };
  }

  const loanAmount = propertyValue * ltv;
  const pi = calculatePI(loanAmount, annualRatePct, termMonths);
  const taxesMo = (propertyValue * annualTaxRate) / 12;
  const insMo = (propertyValue * annualInsRate) / 12;
  const pitia = pi + taxesMo + insMo;

  const dscr = pitia > 0 ? Math.round((monthlyRent / pitia) * 1000) / 1000 : 0;

  let tier: QuickDscrTier;
  let label: string;
  if (dscr >= 1.25) {
    tier = 'LIKELY_QUALIFIES';
    label = 'Likely qualifies — strong DSCR buffer';
  } else if (dscr >= 1.00) {
    tier = 'BORDERLINE';
    label = 'Borderline — meets minimum; lender review required';
  } else if (dscr >= 0.85) {
    tier = 'SPECIALIST_REQUIRED';
    label = 'Specialist lenders only — below standard threshold';
  } else {
    tier = 'UNLIKELY';
    label = 'Unlikely — DSCR below typical program minimums';
  }

  return {
    dscr,
    tier,
    label,
    pitia: Math.round(pitia),
    disclaimer: 'PRELIMINARY ESTIMATE — not a pre-approval or guarantee.',
    needsReview: false,
  };
}

// ============================================================
// MAIN SOLVER: DUAL-TRACK DSCR WITH ITERATIVE RATE
// ============================================================

export function solveDSCR(
  property: PropertyInputs,
  borrower: BorrowerProfile,
  loan: LoanStructure,
  strategy: RentalStrategy,
  vacancyHaircutEnabled: boolean = false,
  vacancyHaircutPct: number = 0,
  formulaMethod: DSCRFormulaMethod = 'GROSS_PITIA',
  /**
   * v11 FIX (AUDIT-8 #1): When provided, this OVERRIDES property.annualTaxes
   * with the reassessed tax (per Part B'.1). PITIA MUST use reassessed tax,
   * NOT the seller's current bill. This is the same failure mode as the
   * vacancy haircut — using the wrong number silently overstates DSCR.
   */
  reassessedAnnualTaxOverride?: number,
): DSCRResult {
  // ── Input guard: clamp / sanitise key numbers before any math ──────────────
  // Returns a safe zero-DSCR "needs review" result rather than NaN/Infinity.
  if (
    !Number.isFinite(property.purchasePrice) || property.purchasePrice <= 0 ||
    !Number.isFinite(property.leaseRent) || property.leaseRent < 0 ||
    !Number.isFinite(loan.ltv) || loan.ltv <= 0 || loan.ltv > 100
  ) {
    const zeroPITIA: PITIABreakdown = {
      principalAndInterest: 0, taxes: 0, insurance: 0, hoa: 0,
      floodInsurance: 0, mortgageInsurance: 0, total: 0,
      isInterestOnly: false,
    };
    const noRatioGradient = getDSCRGradient(0);
    const stub: DSCRTrack = {
      label: 'Track 1 — Lender Qualification',
      dscr: 0, gradient: noRatioGradient, qualifyingRent: 0,
      rentSource: 'NEEDS_REVIEW — missing or invalid inputs',
      formulaMethod: 'GROSS_PITIA', vacancyApplied: 0, managementApplied: 0,
      maintenanceApplied: 0, netRentAfterDeductions: 0, monthlyCashFlow: 0, passes: false,
    };
    const stub2: DSCRTrack = { ...stub, label: 'Track 2 — Investor Survival' };
    return {
      dualTrackDSCR: {
        track1: stub, track2: stub2,
        verdict: { track1Passes: false, track2Passes: false,
          summary: 'NEEDS_REVIEW — one or more required inputs are missing or invalid. Provide purchase price, rent, and LTV before qualifying.',
          warningRequired: true },
      },
      qualifyingRent: 0, rentSource: 'NEEDS_REVIEW',
      monthlyPITIA: zeroPITIA, dscr: 0, dscrGradient: noRatioGradient,
      solvedRate: 0, tripleRate: { competitive: 0, typical: 0, fullMarket: 0, dateStamp: 'June 2026', treasurySpread: '' },
      loanAmount: 0, debtYield: 0,
      cashToClose: { downPayment: 0, closingCosts: 0, points: 0, lenderFees: 0, brokerFees: 0, rateLockCost: 0, reserveRequirement: 0, reserveConservative: 0, furnishingBudget: 0, credits: 0, total: 0, totalConservative: 0, totalStress: 0 },
      appraisalBreakpointRent: 0, appraisalBreakpointPercent: 0,
      dealBreakRate: 0, rateHeadroomBps: 0,
      maxPurchaseAtDSCR1: 0, minDownPayment: 0, additionalDownNeeded: 0,
    };
  }

  // v11 FIX: Use reassessed tax if provided; otherwise fall back to seller's bill
  const annualTaxes = reassessedAnnualTaxOverride ?? property.annualTaxes;
  const loanAmount = property.purchasePrice * (loan.ltv / 100);
  const termYears = loan.term === '30_YR' ? 30 : loan.term === '40_YR' ? 40 : 15;

  // --- Iterative Rate-DSCR Solver ---
  let assumedDSCR = 1.25;
  let solvedRate = 0;
  let iterations = 0;
  const maxIterations = 10;
  const tolerance = 0.001;

  let pitia: PITIABreakdown;
  let dscr = 0;
  const { rent: qualifyingRent, source: rentSource, haircutApplied } = computeQualifyingRent(
    property, strategy, vacancyHaircutEnabled, vacancyHaircutPct
  );

  for (let i = 0; i < maxIterations; i++) {
    iterations++;
    solvedRate = estimateRate(borrower, loan, assumedDSCR, property.propertyType, property.isDecliningMarket);

    pitia = calculatePITIA(
      loanAmount, solvedRate, termYears, loan.ioPeriod,
      annualTaxes, property.annualInsurance, property.hoa,
      property.floodInsurance
    );

    const denominator = formulaMethod === 'GROSS_ITIA' && pitia.itia
      ? pitia.itia
      : formulaMethod === 'NOI_PI'
      ? pitia.principalAndInterest
      : pitia.total;

    dscr = denominator > 0 ? qualifyingRent / denominator : 0;

    const newRate = estimateRate(borrower, loan, dscr, property.propertyType, property.isDecliningMarket);
    if (Math.abs(newRate - solvedRate) < tolerance) {
      solvedRate = newRate;
      pitia = calculatePITIA(
        loanAmount, solvedRate, termYears, loan.ioPeriod,
        annualTaxes, property.annualInsurance, property.hoa,
        property.floodInsurance
      );
      const d2 = formulaMethod === 'GROSS_ITIA' && pitia.itia ? pitia.itia : formulaMethod === 'NOI_PI' ? pitia.principalAndInterest : pitia.total;
      dscr = d2 > 0 ? qualifyingRent / d2 : 0;
      break;
    }
    assumedDSCR = dscr;
  }

  // Final PITIA
  pitia = calculatePITIA(
    loanAmount, solvedRate, termYears, loan.ioPeriod,
    annualTaxes, property.annualInsurance, property.hoa,
    property.floodInsurance
  );

  const pitiaDenom = formulaMethod === 'GROSS_ITIA' && pitia.itia
    ? pitia.itia
    : formulaMethod === 'NOI_PI'
    ? pitia.principalAndInterest
    : pitia.total;

  dscr = pitiaDenom > 0 ? qualifyingRent / pitiaDenom : 0;

  // Build dual-track
  //
  // FIX (bug audit): buildTrack1 now receives pitia.principalAndInterest directly
  // instead of (pitia.total - fixedExpenses). The old form incorrectly included
  // mortgageInsurance in the NOI/P&I denominator when MI > 0.
  //
  // FIX (bug audit): For STR, Track2 must use the RAW strProjectedRent as grossRent,
  // not qualifyingRent (which already has the 20% lender haircut applied for Track1).
  // Track2 models actual investor cash flow, so the pre-haircut gross is correct.
  // LTR/MTR: qualifyingRent = min(lease, market) = actual income → correct as-is.
  const track2GrossRent = strategy === 'STR'
    ? property.strProjectedRent  // raw STR gross before any haircut
    : strategy === 'MTR'
    ? property.strProjectedRent  // raw MTR gross before 12% haircut
    : qualifyingRent;            // LTR: min(lease, market) = actual income

  const track1 = buildTrack1(qualifyingRent, rentSource, pitia.total, formulaMethod, pitia.itia ?? null, haircutApplied, pitia.principalAndInterest);
  const track2 = buildTrack2(track2GrossRent, pitia.total, strategy);
  const verdict = buildVerdict(track1, track2);
  const dualTrackDSCR: DualTrackDSCR = { track1, track2, verdict };

  // Solvers
  const dealBreakRate = solveDealBreakRate(
    qualifyingRent, loanAmount, termYears, loan.ioPeriod,
    annualTaxes, property.annualInsurance, property.hoa, property.floodInsurance
  );
  const rateHeadroomBps = Math.round((dealBreakRate - solvedRate) * 100);

  const maxPurchaseAtDSCR1 = solveMaxPurchasePrice(
    qualifyingRent, loan.ltv, solvedRate, termYears, loan.ioPeriod,
    annualTaxes, property.annualInsurance, property.hoa, property.floodInsurance
  );

  const { minDown: minDownPayment, additionalDown: additionalDownNeeded } = solveMinDownPayment(
    property.purchasePrice, qualifyingRent, loan.ltv, solvedRate, termYears, loan.ioPeriod,
    annualTaxes, property.annualInsurance, property.hoa, property.floodInsurance
  );

  // Reserve estimation (simplified — full engine in reserveEngine.ts)
  const reserveMonths = estimateReserveMonths(dscr, strategy, borrower, loan);
  const reserveMonthsConservative = Math.min(reserveMonths + 3, 12);
  const furnishingBudget = strategy === 'STR' ? 5000 : 0;
  const closingCostPct = 0.03;

  const cashToClose = calculateCashToClose(
    property.purchasePrice, loanAmount, loan,
    reserveMonths, reserveMonthsConservative, pitia.total,
    furnishingBudget
  );

  const tripleRate = computeTripleRate(solvedRate);
  const appraisalBP = computeAppraisalBreakpoint(qualifyingRent, pitia.total);
  const debtYield = loanAmount > 0 ? (qualifyingRent * 12) / loanAmount : 0;

  return {
    dualTrackDSCR,
    qualifyingRent,
    rentSource,
    monthlyPITIA: pitia,
    dscr: Math.round(dscr * 1000) / 1000,
    dscrGradient: getDSCRGradient(dscr),
    solvedRate,
    tripleRate,
    loanAmount,
    debtYield,
    cashToClose,
    appraisalBreakpointRent: appraisalBP.rent,
    appraisalBreakpointPercent: appraisalBP.percentBelow,
    dealBreakRate,
    rateHeadroomBps,
    maxPurchaseAtDSCR1,
    minDownPayment,
    additionalDownNeeded,
  };
}

// ============================================================
// RESERVE ESTIMATION (simplified — full in reserveEngine.ts)
// ============================================================

function estimateReserveMonths(
  dscr: number,
  strategy: RentalStrategy,
  borrower: BorrowerProfile,
  loan: LoanStructure,
): number {
  let months = 6;
  if (dscr >= 1.25) months = 3;
  else if (dscr >= 1.0) months = 6;
  else if (dscr >= 0.75) months = 9;
  else months = 12;

  // Overlays
  if (strategy === 'STR') months += 3;
  if (borrower.experience === 'FIRST_TIME') months += 3;
  if (borrower.isNonUsInvestor) months += 6;
  if (loan.ltv > 80) months += 1;

  // Cap at 12 (15 is stress ceiling only)
  return Math.min(months, 12);
}

// ============================================================
// GOLDEN VALUE VERIFICATION (run in dev/test)
// Flagship: $425K, 75% LTV, $318,750 loan, $3,000 rent
// Taxes $5K/yr, Insurance $2K/yr, HOA $150/mo
// ============================================================

export function verifyGoldenValues(): { pass: boolean; results: Record<string, { expected: number; actual: number; pass: boolean }> } {
  const results: Record<string, { expected: number; actual: number; pass: boolean }> = {};

  // Factor @ 7.00%
  const factor7 = calculatePaymentFactor(7.00, 360);
  results['factor_7.00'] = { expected: 0.006653, actual: Math.round(factor7 * 10000000) / 10000000, pass: Math.abs(factor7 - 0.006653) < 0.00001 };

  // Factor @ 8.25%
  const factor825 = calculatePaymentFactor(8.25, 360);
  results['factor_8.25'] = { expected: 0.0075127, actual: Math.round(factor825 * 10000000) / 10000000, pass: Math.abs(factor825 - 0.0075127) < 0.00001 };

  // P&I $318,750 @ 7.00%
  const pi7 = calculatePI(318750, 7.00, 360);
  results['PI_318750_7.00'] = { expected: 2121, actual: Math.round(pi7), pass: Math.abs(pi7 - 2121) < 2 };

  // P&I $318,750 @ 8.25%
  const pi825 = calculatePI(318750, 8.25, 360);
  results['PI_318750_8.25'] = { expected: 2395, actual: Math.round(pi825), pass: Math.abs(pi825 - 2395) < 2 };

  // PITIA @ 7.00%: $2,121 + $417 + $167 + $150 = $2,855
  const pitia7 = calculatePITIA(318750, 7.00, 30, 'NONE', 5000, 2000, 150);
  results['PITIA_7.00'] = { expected: 2855, actual: Math.round(pitia7.total), pass: Math.abs(pitia7.total - 2855) < 3 };

  // PITIA @ 8.25%: $2,395 + $417 + $167 + $150 = $3,129
  const pitia825 = calculatePITIA(318750, 8.25, 30, 'NONE', 5000, 2000, 150);
  results['PITIA_8.25'] = { expected: 3129, actual: Math.round(pitia825.total), pass: Math.abs(pitia825.total - 3129) < 3 };

  // Track 1 DSCR @ 7.00%: $3,000 / $2,855 = 1.05
  results['DSCR_track1_7.00'] = { expected: 1.05, actual: Math.round(3000 / pitia7.total * 1000) / 1000, pass: Math.abs(3000 / pitia7.total - 1.05) < 0.01 };

  // Track 1 DSCR @ 8.25%: $3,000 / $3,129 = 0.96
  results['DSCR_track1_8.25'] = { expected: 0.96, actual: Math.round(3000 / pitia825.total * 1000) / 1000, pass: Math.abs(3000 / pitia825.total - 0.96) < 0.01 };

  // Rent breakpoint: 4.9%
  const bpPercent = ((3000 - pitia7.total) / 3000) * 100;
  results['rent_breakpoint_pct'] = { expected: 4.9, actual: Math.round(bpPercent * 10) / 10, pass: Math.abs(bpPercent - 4.9) < 0.5 };

  // Deal-break rate ≈ 7.67%
  const dbr = solveDealBreakRate(3000, 318750, 30, 'NONE', 5000, 2000, 150);
  results['deal_break_rate'] = { expected: 7.67, actual: dbr, pass: Math.abs(dbr - 7.67) < 0.1 };

  // $300,000 @ 8.25% = $2,254
  const pi300k = calculatePI(300000, 8.25, 360);
  results['PI_300000_8.25'] = { expected: 2254, actual: Math.round(pi300k), pass: Math.abs(pi300k - 2254) < 2 };

  const allPass = Object.values(results).every(r => r.pass);
  return { pass: allPass, results };
}
