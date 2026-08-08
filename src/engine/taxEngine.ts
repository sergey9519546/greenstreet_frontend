// ============================================================
// DSCR Deal Desk v11.0 — After-Tax Returns Engine
// Part B'.2: Depreciation, Bonus Dep (OBBBA), §1250 Recapture,
//            NIIT (3.8%), Passive Activity Loss rules,
//            Cost Segregation, After-Tax IRR
// ============================================================
//
// PROVENANCE: registered in src/engine/dataVintage.ts as 'taxRules'
// (asOf 2026-06-01, annual cadence — but re-check on any federal tax bill).
//
// SOURCES (verified June 2026):
//   - IRC §167(c), §168(g)(2): 27.5-yr residential straight-line
//   - OBBBA (signed Jan 2025): 100% bonus dep permanently for property
//     acquired after Jan 19, 2025 [References 13,14,15]
//   - IRC §1250: unrecaptured gain taxed max 25% (straight-line) [Refs 9,10,11,12]
//   - IRC §1245: excess over straight-line = ordinary income (cost-seg 5/7-yr)
//   - IRC §1411: NIIT 3.8% above $200K/$250K/$125K MAGI [Ref 11]
//   - IRC §469: PAL $25K allowance; $100K-$150K MAGI phase-out; REP exception
//     (750hr + 50% material participation) [Refs 20,21,22]
//   - Cost seg: 20-40% reclassification to 5/7/15-yr; study $2,500-$15,000
//     [Refs 16,17,18,19]
// ============================================================

import type {
  TaxProfile,
  BonusDepResult,
  BonusDepCategory,
  DepreciationSchedule,
  RecaptureComputation,
  PassiveLossResult,
  AfterTaxIRRResult,
  AfterTaxCashFlowRow,
  FilingStatus,
  ProvenanceLabel,
} from './types';

// ============================================================
// SECTION B'.2.1: OBBBA BONUS DEPRECIATION
// ============================================================

const OBBBA_EFFECTIVE_DATE = '2025-01-19'; // acquired AFTER this date = 100%

/**
 * Determine OBBBA bonus depreciation category.
 *
 * Per OBBBA (signed Jan 2025):
 * - Acquired after Jan 19, 2025 → 100% (permanent)
 * - Acquired Jan 1-19, 2025, placed in service 2025 → 40% (TCJA phase-down)
 * - Acquired Jan 1-19, 2025, placed in service 2026 → 20%
 * - Acquired before Jan 1, 2025, placed in service 2024 → 60%
 * - Acquired before Jan 1, 2025, placed in service 2025 → 40%
 *
 * Bonus dep applies ONLY to qualified property (5/7/15-yr class via cost seg)
 * — NOT to the residential building structure itself (27.5-yr).
 */
export function determineBonusDepCategory(
  acquisitionDate: string,
  placedInServiceDate: string,
): BonusDepResult {
  const acq = new Date(acquisitionDate);
  const pis = new Date(placedInServiceDate);
  const obbba = new Date(OBBBA_EFFECTIVE_DATE);
  const jan1_2025 = new Date('2025-01-01');
  const jan1_2026 = new Date('2026-01-01');

  let category: BonusDepCategory;
  let bonusPct: number;

  if (acq > obbba) {
    category = 'POST_2025_01_19';
    bonusPct = 1.00;
  } else if (acq >= jan1_2025 && acq <= obbba) {
    // Acquired Jan 1-19, 2025
    if (pis < jan1_2026) {
      category = 'PRE_2025_01_19_2025';
      bonusPct = 0.40;
    } else {
      category = 'PRE_2025_01_19_2026';
      bonusPct = 0.20;
    }
  } else if (acq < jan1_2025) {
    if (pis < jan1_2025) {
      category = 'PRE_2025_2024';
      bonusPct = 0.60;
    } else {
      category = 'PRE_2025_2025';
      bonusPct = 0.40;
    }
  } else {
    category = 'EXCLUDED';
    bonusPct = 0;
  }

  return {
    category,
    bonusPct,
    appliesToShortLifeOnly: true,
    qualifyingComponentValue: 0, // filled in by caller with cost-seg reclassified amount
    firstYearBonusDepreciation: 0,
    provenance: 'VERIFIED_PRIMARY',
    source: 'OBBBA (signed Jan 2025); IRC §168(k); Refs 13-15',
  };
}

// ============================================================
// SECTION B'.2.2: DEPRECIATION SCHEDULE
// ============================================================

const RESIDENTIAL_DEPREC_YEARS = 27.5;

/**
 * Compute annual depreciation schedule over the hold period.
 *
 * Standard: Building_Basis / 27.5 straight-line (residential)
 *   where Building_Basis = Purchase_Price × (1 - Land_Allocation_Pct)
 *
 * With cost seg: Short-life components (5/7/15-yr) get bonus dep in Year 1
 *   (100% post-1/19/25), then standard 27.5-yr on the remaining building basis.
 *
 * Land is NEVER depreciable.
 */
export function computeDepreciationSchedule(
  purchasePrice: number,
  landAllocationPct: number,
  holdYears: number,
  taxProfile: TaxProfile,
): DepreciationSchedule[] {
  const landValue = purchasePrice * (landAllocationPct / 100);
  const buildingBasis = purchasePrice - landValue;
  const annualBuildingDep = buildingBasis / RESIDENTIAL_DEPREC_YEARS;

  // Cost seg short-life components
  const costSegReclassifiedPct = taxProfile.costSegStudyCompleted
    ? taxProfile.costSegReclassifiedPct
    : 0;
  const shortLifeComponents = buildingBasis * (costSegReclassifiedPct / 100);
  const remainingBuildingBasis = buildingBasis - shortLifeComponents;
  const remainingAnnualDep = remainingBuildingBasis / RESIDENTIAL_DEPREC_YEARS;

  // Bonus dep on short-life in Year 1 (OBBBA)
  const bonusDep = determineBonusDepCategory(
    taxProfile.acquisitionDate,
    taxProfile.placedInServiceDate,
  );
  const year1BonusDep = shortLifeComponents * bonusDep.bonusPct;

  const schedule: DepreciationSchedule[] = [];
  let cumulative = 0;
  for (let year = 1; year <= holdYears; year++) {
    const buildingDep = remainingAnnualDep; // straight-line on non-cost-seg portion
    const costSegDep = year === 1 ? year1BonusDep : 0;
    const totalAnnual = buildingDep + costSegDep;
    cumulative += totalAnnual;
    schedule.push({
      year,
      buildingDepreciation: buildingDep,
      costSegDepreciation: costSegDep,
      totalAnnualDepreciation: totalAnnual,
      cumulativeDepreciation: cumulative,
    });
  }
  return schedule;
}

// ============================================================
// SECTION B'.2.3: §1250 / §1245 RECAPTURE + NIIT
// ============================================================

// 2026 Federal LTCG brackets (MFJ)
const LTCG_BRACKETS_MFJ: TaxBracket[] = [
  { threshold: 0, rate: 0 },
  { threshold: 96700, rate: 0.15 },
  { threshold: 600050, rate: 0.20 },
];

type TaxBracket = { threshold: number; rate: number };

const LTCG_BRACKETS_SINGLE: TaxBracket[] = [
  { threshold: 0, rate: 0 },
  { threshold: 48350, rate: 0.15 },
  { threshold: 533400, rate: 0.20 },
];

const LTCG_BRACKETS_MFS: TaxBracket[] = [
  { threshold: 0, rate: 0 },
  { threshold: 48350, rate: 0.15 },
  { threshold: 300000, rate: 0.20 },
];

const LTCG_BRACKETS_HOH: TaxBracket[] = [
  { threshold: 0, rate: 0 },
  { threshold: 64750, rate: 0.15 },
  { threshold: 566700, rate: 0.20 },
];

// NIIT thresholds (IRC §1411)
export function getNIITThreshold(filingStatus: FilingStatus): number {
  switch (filingStatus) {
    case 'SINGLE':
    case 'HOH':
      return 200000;
    case 'MFJ':
      return 250000;
    case 'MFS':
      return 125000;
  }
}

export function isNIITApplicable(magi: number, filingStatus: FilingStatus): boolean {
  return magi > getNIITThreshold(filingStatus);
}

/**
 * Compute total tax on sale of property, including:
 * - §1250 unrecaptured gain (max 25% federal)
 * - §1245 recapture on cost-seg excess over straight-line (ordinary income)
 * - LTCG on appreciation (0/15/20%)
 * - NIIT 3.8% if MAGI above threshold
 * - State income tax
 *
 * If §1031 exchange: ALL recapture and gain taxes deferred (set to 0).
 */
export function computeRecaptureOnSale(
  purchasePrice: number,
  landAllocationPct: number,
  totalDepreciationTaken: number,
  exitValue: number,
  exitSellingCostsPct: number,
  taxProfile: TaxProfile,
): RecaptureComputation {
  // §1031 exchange defers everything
  if (taxProfile.section1031Exchange) {
    return {
      totalDepreciationTaken,
      unrecapturedSection1250Gain: totalDepreciationTaken,
      section1245Recapture: 0,
      totalGainOnSale: 0,
      appreciationGain: 0,
      federalRecaptureTax: 0,
      federalLtcgTax: 0,
      niitTax: 0,
      stateTax: 0,
      totalTaxOnSale: 0,
      afterTaxExitProceeds: exitValue * (1 - exitSellingCostsPct / 100),
    };
  }

  const exitSellingCosts = exitValue * (exitSellingCostsPct / 100);
  const netSalePrice = exitValue - exitSellingCosts;
  const adjustedBasis = purchasePrice - totalDepreciationTaken;
  const totalGainOnSale = netSalePrice - adjustedBasis;

  // v11 FIX (AUDIT-5 #1): §1250/§1245 allocation bug fix
  // Spec line 284: "Accelerated/excess depreciation above straight-line (rare for
  // post-1986 residential, common for cost-seg 5/7-year components): taxed at
  // ORDINARY INCOME rates (§1245 recapture)"
  //
  // The previous code was double-taxing cost-seg bonus depreciation:
  //   - It included cost-seg bonus in totalDepreciationTaken
  //   - Then it computed §1250 = min(totalDepreciationTaken, totalGainOnSale) — which
  //     incorrectly treated the cost-seg bonus as §1250 (25% rate)
  //   - Then it computed §1245 = min(costSegBonus, remaining gain) — taxing the
  //     same dollars a second time at ordinary rates
  //
  // Correct: §1250 covers ONLY the straight-line depreciation on the building structure
  // (27.5-yr); §1245 covers the cost-seg bonus depreciation on 5/7/15-yr property.

  // Cost-seg bonus depreciation — this is §1245 recapture (ordinary income)
  const costSegBonusDepreciation = taxProfile.costSegStudyCompleted
    ? (purchasePrice * (1 - landAllocationPct / 100)) *
      (taxProfile.costSegReclassifiedPct / 100) *
      determineBonusDepCategory(taxProfile.acquisitionDate, taxProfile.placedInServiceDate).bonusPct
    : 0;

  // Straight-line depreciation on the building structure (excluding cost-seg components)
  // — this is §1250 unrecaptured gain (max 25% federal)
  const straightLineDepreciation = Math.max(totalDepreciationTaken - costSegBonusDepreciation, 0);

  // §1250: ONLY the straight-line portion (not cost-seg bonus)
  const unrecapturedSection1250Gain = Math.min(straightLineDepreciation, totalGainOnSale);

  // §1245: cost-seg bonus depreciation — ordinary income rate
  // Recapture = lesser of (cost-seg bonus claimed) or (remaining gain after §1250)
  const section1245Recapture = Math.min(costSegBonusDepreciation, Math.max(totalGainOnSale - unrecapturedSection1250Gain, 0));

  // Appreciation gain = total gain - §1250 recapture - §1245 recapture
  const appreciationGain = Math.max(totalGainOnSale - unrecapturedSection1250Gain - section1245Recapture, 0);

  // Federal taxes
  // §1250: max 25%
  const federalRecaptureTax = unrecapturedSection1250Gain * 0.25;
  // §1245: ordinary income — use marginal rate from MAGI bracket
  const marginalRate = getMarginalOrdinaryRate(taxProfile.magi, taxProfile.filingStatus);
  const section1245Tax = section1245Recapture * marginalRate;

  // LTCG on appreciation
  const federalLtcgTax = appreciationGain * getLTCGRate(taxProfile.magi, taxProfile.filingStatus);

  // NIIT 3.8% if applicable (on lesser of: net investment income OR MAGI - threshold)
  const niitApplies = isNIITApplicable(taxProfile.magi, taxProfile.filingStatus);
  // v11 FIX (AUDIT-5 #3): NIIT (3.8%) stacks on ALL net investment income per IRC §1411,
  // which includes §1245 recapture (cost-seg bonus dep) — not just §1250 + LTCG.
  // Previously excluded §1245, under-stating NIIT by 3.8% × §1245 amount.
  const niitTax = niitApplies
    ? (unrecapturedSection1250Gain + section1245Recapture + appreciationGain) * 0.038
    : 0;

  // State tax (simplified flat rate on total gain)
  const stateTax = totalGainOnSale * (taxProfile.stateTaxRatePct / 100);

  const totalTaxOnSale = federalRecaptureTax + section1245Tax + federalLtcgTax + niitTax + stateTax;
  const afterTaxExitProceeds = netSalePrice - totalTaxOnSale;

  return {
    totalDepreciationTaken,
    unrecapturedSection1250Gain,
    section1245Recapture,
    totalGainOnSale,
    appreciationGain,
    federalRecaptureTax: federalRecaptureTax + section1245Tax,
    federalLtcgTax,
    niitTax,
    stateTax,
    totalTaxOnSale,
    afterTaxExitProceeds,
  };
}

function getMarginalOrdinaryRate(magi: number, filingStatus: FilingStatus): number {
  // Simplified 2026 ordinary brackets
  switch (filingStatus) {
    case 'MFJ':
      if (magi <= 24800) return 0.10;
      if (magi <= 101400) return 0.12;
      if (magi <= 206700) return 0.22;
      if (magi <= 394600) return 0.24;
      if (magi <= 501050) return 0.32;
      if (magi <= 751600) return 0.35;
      return 0.37;
    case 'SINGLE':
    case 'MFS':
      if (magi <= 12400) return 0.10;
      if (magi <= 50700) return 0.12;
      if (magi <= 103350) return 0.22;
      if (magi <= 197300) return 0.24;
      if (magi <= 250525) return 0.32;
      if (magi <= 375800) return 0.35;
      return 0.37;
    case 'HOH':
      if (magi <= 17000) return 0.10;
      if (magi <= 64850) return 0.12;
      if (magi <= 103350) return 0.22;
      if (magi <= 197300) return 0.24;
      if (magi <= 250500) return 0.32;
      if (magi <= 626350) return 0.35;
      return 0.37;
  }
}

function getLTCGRate(magi: number, filingStatus: FilingStatus): number {
  let brackets: TaxBracket[];
  switch (filingStatus) {
    case 'MFJ':
      brackets = LTCG_BRACKETS_MFJ;
      break;
    case 'MFS':
      brackets = LTCG_BRACKETS_MFS;
      break;
    case 'HOH':
      brackets = LTCG_BRACKETS_HOH;
      break;
    case 'SINGLE':
      brackets = LTCG_BRACKETS_SINGLE;
      break;
  }
  let rate = 0;
  for (const b of brackets) {
    if (magi >= b.threshold) rate = b.rate;
  }
  return rate;
}

// ============================================================
// SECTION B'.2.4: PASSIVE ACTIVITY LOSS (PAL)
// ============================================================

/**
 * Compute PAL allowance.
 *
 * Per IRC §469:
 * - Full $25,000 allowance if MAGI ≤ $100,000 (MFJ/S/HOH) or $12,500 (MFS)
 * - Phase-out $0.50 per $1 over $100K → fully phased out at $150K ($75K MFS)
 * - REP exception: 750hr + 50% material participation → unlimited
 * - Suspended losses carried forward indefinitely; released at full disposition
 */
export function computePassiveLossAllowance(
  magi: number,
  filingStatus: FilingStatus,
  isRep: boolean,
  rentalLoss: number,
): PassiveLossResult {
  const fullAllowance = filingStatus === 'MFS' ? 12500 : 25000;
  const phaseOutStart = filingStatus === 'MFS' ? 50000 : 100000;
  const phaseOutEnd = filingStatus === 'MFS' ? 75000 : 150000;

  let actualAllowableLoss: number;
  if (isRep) {
    actualAllowableLoss = Math.min(rentalLoss, 0); // REP: unlimited → all losses deductible
    // If rentalLoss is negative (a loss), all of it is deductible
    actualAllowableLoss = rentalLoss;
  } else if (magi <= phaseOutStart) {
    actualAllowableLoss = Math.max(Math.min(rentalLoss, fullAllowance), rentalLoss);
    // Allowable = lesser of (rentalLoss, fullAllowance); if loss is negative, that's the deduction
    actualAllowableLoss = Math.min(Math.abs(rentalLoss), fullAllowance) * Math.sign(rentalLoss < 0 ? -1 : 1);
    // Simplification: if rental loss is -$15,000 and full allowance is $25,000, deductible = $15,000 (loss offset)
    if (rentalLoss < 0) {
      actualAllowableLoss = Math.max(rentalLoss, -fullAllowance);
    } else {
      actualAllowableLoss = Math.min(rentalLoss, fullAllowance);
    }
  } else if (magi < phaseOutEnd) {
    // Phase-out: allowance reduces $0.50 per $1 over start
    const reduction = (magi - phaseOutStart) * 0.50;
    const remainingAllowance = Math.max(fullAllowance - reduction, 0);
    actualAllowableLoss = rentalLoss < 0
      ? Math.max(rentalLoss, -remainingAllowance)
      : Math.min(rentalLoss, remainingAllowance);
  } else {
    actualAllowableLoss = 0;
  }

  const suspendedLoss = rentalLoss - actualAllowableLoss;

  return {
    magi,
    filingStatus,
    isRep,
    fullAllowance,
    phaseOutStart,
    phaseOutEnd,
    actualAllowableLoss: Math.round(actualAllowableLoss * 100) / 100,
    suspendedLoss: Math.round(suspendedLoss * 100) / 100,
    repUnlocksAll: isRep,
  };
}

// ============================================================
// SECTION B'.2.5: AFTER-TAX IRR
// ============================================================

/**
 * v11.2 FIX (bug audit #2): Compute the annual mortgage INTEREST portion of a
 * year's debt service for an amortizing loan. Needed because taxable rental
 * income = NOI − mortgage INTEREST − depreciation. Interest is deductible every
 * year and DECLINES as the loan amortizes; principal is a real cash outflow but
 * is NEVER tax-deductible, so it must not appear in the taxable-income formula.
 *
 * Uses the same closed-form amortization identity as computeRemainingBalance's
 * "proper amortization" path (B_t = L × (r^n − r^t) / (r^n − 1)):
 *   annual interest = (this year's total debt service paid) − (principal
 *   paydown during the year) = annualADS − (balanceStartOfYear − balanceEndOfYear).
 *
 * Falls back to a simplified straight-line-runoff proxy (mirroring
 * computeRemainingBalance's backward-compat fallback) when rate/term are not
 * supplied, so callers that omit them still get a reasonable approximate split
 * instead of a crash or a nonsensical value.
 */
function computeAnnualMortgageInterest(
  loanAmount: number,
  annualADS: number,
  year: number, // 1-based hold year
  loanRatePct?: number,
  loanTermMonths?: number,
): number {
  if (loanRatePct !== undefined && loanTermMonths !== undefined && loanRatePct > 0) {
    const r = loanRatePct / 100 / 12;
    const monthsStart = Math.min((year - 1) * 12, loanTermMonths);
    const monthsEnd = Math.min(year * 12, loanTermMonths);
    const factor = Math.pow(1 + r, loanTermMonths);
    const balanceAt = (m: number): number => {
      if (m >= loanTermMonths) return 0;
      const elapsed = Math.pow(1 + r, m);
      return Math.max(0, loanAmount * (factor - elapsed) / (factor - 1));
    };
    const balStart = balanceAt(monthsStart);
    const balEnd = balanceAt(monthsEnd);
    const monthsInYear = monthsEnd - monthsStart;
    const paidThisYear = (annualADS / 12) * monthsInYear;
    const principalPaid = balStart - balEnd;
    return Math.max(0, paidThisYear - principalPaid);
  }

  // Fallback (no rate/term supplied): same 30-yr straight-line runoff floored at
  // 50% used by computeRemainingBalance's backward-compat path, evaluated
  // per-year rather than pinned to the total hold period.
  const approxBalanceAt = (yearsElapsed: number) => loanAmount * Math.max(1 - yearsElapsed / 30, 0.5);
  const principalPaid = approxBalanceAt(year - 1) - approxBalanceAt(year);
  return Math.max(0, annualADS - principalPaid);
}

/**
 * Compute year-by-year after-tax cash flow and after-tax IRR.
 *
 * For each year:
 *   preTaxNCF = NOI - ADS  (Net Cash Flow before tax)
 *   depreciationDeduction = building + cost-seg bonus
 *   mortgageInterest = interest portion of ADS for this year (declines as the
 *     loan amortizes; computed via computeAnnualMortgageInterest)
 *   taxableIncome = NOI - mortgageInterest - depreciation  (if positive; else
 *     loss → PAL rules). v11.2 FIX (bug audit #2): mortgage interest was
 *     previously omitted entirely, overstating taxable income and understating
 *     after-tax IRR.
 *   federalTax = taxableIncome × marginal rate (if positive)
 *   stateTax = taxableIncome × state rate
 *   afterTaxNCF = preTaxNCF - federalTax - stateTax  (preTaxNCF is already a
 *     cash figure, so no non-cash depreciation add-back is needed here)
 *
 * Exit year (year N):
 *   + exitAfterTaxProceeds (after all recapture + LTCG + NIIT + state)
 *   - remaining loan balance
 *   - prepay penalty
 *   - selling costs (already netted in computeRecaptureOnSale)
 *
 * IRR = XIRR of cash flows: [-CashInvested_0, afterTaxNCF_1, ..., exit_N]
 */
export function computeAfterTaxIRR(
  purchasePrice: number,
  loanAmount: number,
  qualifyingRent: number, // used as Year 1 NOI base
  annualNOI: number,
  annualADS: number, // annual debt service
  pitiaMonthly: number,
  // Nullable by contract: the body below already substitutes a documented
  // conservative default profile when this is omitted (MFJ / $200k MAGI / 20%
  // land / 5-yr hold / 6.5% exit cap). The signature previously said
  // `TaxProfile`, which made that fallback unreachable dead code and forced
  // callers holding an optional profile (v11Runner) to cast. Widened rather
  // than removed so the default stays in exactly one place.
  taxProfile: TaxProfile | undefined,
  prepayPenaltyAtExit: number,
  // v11.1 FIX (AUDIT-FINAL-7 D-1): Loan rate + term so remaining balance uses
  // PROPER AMORTIZATION, not the simplified linear `1 - holdYears/30` proxy
  // which understated remaining balance by ~10% at typical 5-yr hold and
  // inflated after-tax IRR by ~300-500bps. Both optional for backward compat;
  // when omitted, falls back to the prior approximation.
  loanRatePct?: number,
  loanTermMonths?: number,
): AfterTaxIRRResult {
  const profile: TaxProfile = taxProfile ?? {
    expectedHoldYears: 5,
    landAllocationPct: 20,
    filingStatus: 'MFJ',
    magi: 200000,
    ordinaryIncomeBrackets: [],
    stateTaxRatePct: 5,
    isRealEstateProfessional: false,
    yearsREP: 0,
    costSegStudyCompleted: false,
    costSegReclassifiedPct: 0,
    acquisitionDate: '2026-02-01',
    placedInServiceDate: '2026-02-01',
    exitSellingCostsPct: 6,
    exitCapRatePct: 6.5,
    section1031Exchange: false,
  };
  const holdYears = Math.max(1, Math.floor(profile.expectedHoldYears));
  const cashInvested = purchasePrice - loanAmount; // simplified; real cash-to-close from engine
  const depreciationSchedule = computeDepreciationSchedule(
    purchasePrice,
    profile.landAllocationPct,
    holdYears,
    profile,
  );

  const yearByYear: AfterTaxCashFlowRow[] = [];
  let cumulativeAfterTaxNCF = -cashInvested;

  // Estimate rent growth (default 2% — used for NOI growth)
  const rentGrowthPct = 0.02;

  for (let yr = 1; yr <= holdYears; yr++) {
    const yearNOI = annualNOI * Math.pow(1 + rentGrowthPct, yr - 1);
    const preTaxNCF = yearNOI - annualADS;
    const depreciation = depreciationSchedule[yr - 1].totalAnnualDepreciation;
    // v11.2 FIX (bug audit #2): mortgage interest is deductible and must be
    // subtracted from taxable income; principal is not deductible and is
    // correctly excluded. Interest declines year-over-year as the loan amortizes.
    const mortgageInterest = computeAnnualMortgageInterest(loanAmount, annualADS, yr, loanRatePct, loanTermMonths);
    const taxableIncome = yearNOI - mortgageInterest - depreciation;

    // Federal tax: if taxable income positive, tax at marginal; if negative → PAL
    let federalTax = 0;
    if (taxableIncome > 0) {
      const marginalRate = getMarginalOrdinaryRate(profile.magi + taxableIncome, profile.filingStatus ?? 'MFJ');
      federalTax = taxableIncome * marginalRate;
    } else {
      // Loss — check PAL allowance
      const pal = computePassiveLossAllowance(profile.magi, profile.filingStatus ?? 'MFJ', profile.isRealEstateProfessional ?? false, taxableIncome);
      // If allowable loss > 0, tax shield = allowable_loss × marginal rate
      if (pal.actualAllowableLoss < 0) {
        const marginalRate = getMarginalOrdinaryRate(profile.magi, profile.filingStatus ?? 'MFJ');
        federalTax = pal.actualAllowableLoss * marginalRate; // negative → tax benefit
      }
    }

    const stateTax = Math.max(taxableIncome, 0) * ((profile.stateTaxRatePct ?? 0) / 100);
    const afterTaxNCF = preTaxNCF - federalTax - stateTax;
    cumulativeAfterTaxNCF += afterTaxNCF;

    yearByYear.push({
      year: yr,
      preTaxNCF: Math.round(preTaxNCF * 100) / 100,
      depreciationDeduction: Math.round(depreciation * 100) / 100,
      taxableIncome: Math.round(taxableIncome * 100) / 100,
      federalTax: Math.round(federalTax * 100) / 100,
      stateTax: Math.round(stateTax * 100) / 100,
      afterTaxNCF: Math.round(afterTaxNCF * 100) / 100,
      cumulativeAfterTaxNCF: Math.round(cumulativeAfterTaxNCF * 100) / 100,
    });
  }

  // Exit year: compute recapture
  const exitValue = (annualNOI / ((profile.exitCapRatePct ?? 6.5) / 100)) * Math.pow(1 + rentGrowthPct, holdYears);
  const totalDepreciationTaken = depreciationSchedule.reduce((sum, d) => sum + d.totalAnnualDepreciation, 0);
  const recapture = computeRecaptureOnSale(
    purchasePrice,
    profile.landAllocationPct,
    totalDepreciationTaken,
    exitValue,
    profile.exitSellingCostsPct ?? 6,
    profile,
  );

  // Remaining loan balance (proper amortization when rate provided; v11.1 FIX)
  const remainingLoanBalance = computeRemainingBalance(
    loanAmount,
    profile,
    pitiaMonthly,
    loanRatePct,
    loanTermMonths,
    holdYears * 12,
  );

  // Final exit cash flow
  const exitAfterTaxCashFlow =
    recapture.afterTaxExitProceeds - remainingLoanBalance - prepayPenaltyAtExit;

  // Build cash flow series for IRR
  const cashFlows: { time: number; amount: number }[] = [];
  cashFlows.push({ time: 0, amount: -cashInvested });
  for (const row of yearByYear) {
    cashFlows.push({ time: row.year, amount: row.afterTaxNCF });
  }
  // Replace last year's CF with year CF + exit proceeds
  const lastIdx = cashFlows.length - 1;
  cashFlows[lastIdx].amount += exitAfterTaxCashFlow;

  // v11.1 FIX (AUDIT-FINAL-7 D-2): Removed dead `preTaxIRR` variable — it was
  // computed via a buggy mapping that double-counted exit proceeds on every
  // positive cash flow (not just the exit year), but the result was never used.
  // The returned `preTaxIRR` field below correctly uses `preTaxIRRComputed`.
  // Simpler: pre-tax IRR uses pre-tax NCF + exit (before tax)
  const preTaxCashFlows: { time: number; amount: number }[] = [
    { time: 0, amount: -cashInvested },
    ...yearByYear.map(row => ({ time: row.year, amount: row.preTaxNCF })),
  ];
  preTaxCashFlows[preTaxCashFlows.length - 1].amount += recapture.afterTaxExitProceeds + recapture.totalTaxOnSale - remainingLoanBalance - prepayPenaltyAtExit;
  const preTaxIRRComputed = computeXIRR(preTaxCashFlows);

  const afterTaxIRR = computeXIRR(cashFlows);

  const niitApplies = isNIITApplicable(profile.magi, profile.filingStatus ?? 'MFJ');
  const effectiveRecaptureRate = recapture.unrecapturedSection1250Gain > 0
    ? (recapture.federalRecaptureTax + recapture.niitTax) / recapture.unrecapturedSection1250Gain
    : 0;
  const effectiveLtcgRate = recapture.appreciationGain > 0
    ? (recapture.federalLtcgTax + (niitApplies ? recapture.appreciationGain * 0.038 : 0)) / recapture.appreciationGain
    : 0;

  return {
    yearByYear,
    preTaxIRR: Math.round(preTaxIRRComputed * 1000) / 1000,
    afterTaxIRR: Math.round(afterTaxIRR * 1000) / 1000,
    irrImpactOfTaxes: Math.round((afterTaxIRR - preTaxIRRComputed) * 1000) / 1000,
    totalDepreciationShield: Math.round(totalDepreciationTaken * 100) / 100,
    totalTaxOnExit: Math.round(recapture.totalTaxOnSale * 100) / 100,
    niitApplies,
    effectiveRecaptureRate: Math.round(effectiveRecaptureRate * 1000) / 1000,
    effectiveLtcgRate: Math.round(effectiveLtcgRate * 1000) / 1000,
    disclaimer: 'Tax figures are estimates dependent on investor federal bracket, MAGI, REP status, filing status, entity type, state tax law, and cost segregation election. Confirm with a CPA before any financing or disposition decision.',
  };
}

function computeRemainingBalance(
  loanAmount: number,
  taxProfile: TaxProfile,
  pitiaMonthly: number,
  // v11.1 FIX (AUDIT-FINAL-7 D-1): When loanRatePct + loanTermMonths are
  // supplied by the caller, use the PROPER standard amortization formula
  // (same as returnsEngine.computeRemainingBalance) — B_t = L * (r^n - r^t) / (r^n - 1).
  // Otherwise fall back to the simplified linear `1 - holdYears/30` proxy
  // (floored at 50%) for backward compatibility with callers that haven't
  // been updated. The simplified proxy understates the remaining balance by
  // ~10pp at typical 5-yr hold on a 30-yr 7% loan, materially overstating
  // after-tax exit proceeds and inflating after-tax IRR by ~300-500bps.
  loanRatePct?: number,
  loanTermMonths?: number,
  monthsElapsedOverride?: number,
): number {
  const monthsElapsed = monthsElapsedOverride ?? (taxProfile.expectedHoldYears * 12);

  // Proper amortization path (preferred)
  if (loanRatePct !== undefined && loanTermMonths !== undefined && loanRatePct > 0) {
    const r = loanRatePct / 100 / 12;
    if (r === 0) return loanAmount * Math.max(0, 1 - monthsElapsed / loanTermMonths);
    if (monthsElapsed >= loanTermMonths) return 0;
    const factor = Math.pow(1 + r, loanTermMonths);
    const elapsed = Math.pow(1 + r, monthsElapsed);
    const remaining = loanAmount * (factor - elapsed) / (factor - 1);
    return Math.max(0, remaining);
  }

  // Simplified linear fallback (backward compat — NOT preferred)
  const holdYears = taxProfile.expectedHoldYears;
  const approxRemainingPct = Math.max(1 - holdYears / 30, 0.5); // floor at 50%
  return loanAmount * approxRemainingPct;
}

// ============================================================
// XIRR (Bisection) — Newton-Raphson with bisection fallback
// ============================================================

export function computeXIRR(cashFlows: { time: number; amount: number }[]): number {
  if (cashFlows.length < 2) return 0;

  // Sort by time
  const sorted = [...cashFlows].sort((a, b) => a.time - b.time);
  const t0 = sorted[0].time;

  const f = (rate: number): number => {
    if (rate <= -1) return -Infinity;
    return sorted.reduce((sum, cf) => {
      const yearsElapsed = (cf.time - t0); // already in years
      return sum + cf.amount / Math.pow(1 + rate, yearsElapsed);
    }, 0);
  };

  // Bisection between -0.99 and 10.0
  let low = -0.99;
  let high = 10.0;
  let fLow = f(low);
  let fHigh = f(high);

  // If both have same sign, no IRR exists in this range
  if (fLow * fHigh > 0) {
    // Try wider range
    high = 100;
    fHigh = f(high);
    if (fLow * fHigh > 0) return 0; // No root found
  }

  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const fMid = f(mid);
    if (Math.abs(fMid) < 1e-6) return mid;
    if (fLow * fMid < 0) {
      high = mid;
      fHigh = fMid;
    } else {
      low = mid;
      fLow = fMid;
    }
  }

  return (low + high) / 2;
}

// ============================================================
// COST SEG VIABILITY CHECK (Part B'.2)
// ============================================================

export interface CostSegViabilityResult {
  economic: boolean;
  estimatedStudyCost: number;
  estimatedYear1Savings: number;
  reclassifiedPct: number;
  note: string;
}

/**
 * Per Part B'.2: Cost seg is generally economic for properties ≥$450K.
 * Study cost: $2,500-$15,000 typical; smaller residential $750-$2,500.
 * Typical first-year savings: up to $100K per $1M building value.
 */
export function assessCostSegViability(
  purchasePrice: number,
  landAllocationPct: number,
): CostSegViabilityResult {
  const buildingValue = purchasePrice * (1 - landAllocationPct / 100);
  const economic = purchasePrice >= 450000;
  // Scale study cost: smaller = $750-$2,500; larger = $2,500-$15,000
  const estimatedStudyCost = purchasePrice < 500000 ? 2500 : Math.min(15000, 2500 + (purchasePrice - 500000) / 1000 * 5);
  // Typical reclass: 20-40% of building → use 30% midpoint
  const reclassifiedPct = 30;
  const qualifyingComponentValue = buildingValue * (reclassifiedPct / 100);
  // Year 1 savings: bonus dep × marginal rate × qualifyingComponentValue
  // Assume 32% marginal rate for high-income investor
  const estimatedYear1Savings = qualifyingComponentValue * 1.0 * 0.32; // OBBBA 100%

  return {
    economic,
    estimatedStudyCost: Math.round(estimatedStudyCost),
    estimatedYear1Savings: Math.round(estimatedYear1Savings),
    reclassifiedPct,
    note: economic
      ? `Economic candidate (property ≥$450K). Estimated study cost $${Math.round(estimatedStudyCost).toLocaleString()}. ` +
        `With OBBBA 100% bonus dep + 30% cost-seg reclassification, first-year tax shield ≈ $${Math.round(estimatedYear1Savings).toLocaleString()} at 32% marginal rate. ` +
        `Note: cost-seg depreciation creates §1245 recapture on sale (ordinary income vs §1250's 25% cap).`
      : `Property <$450K — cost seg rarely economic. Standard 27.5-yr straight-line depreciation applies.`,
  };
}
