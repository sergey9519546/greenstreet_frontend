// ============================================================
// v11 Golden Test Verification Script
// Confirms all golden math values reproduce + new modules run
// ============================================================

import { solveDSCR, verifyGoldenValues, calculatePI, calculatePaymentFactor, calculatePITIA } from '../src/lib/dscr/engine';
import { computeReassessedTax, STATE_REASSESSMENT_RULES, getReassessmentRule } from '../src/lib/dscr/reassessmentEngine';
import { determineBonusDepCategory, computeDepreciationSchedule, computeRecaptureOnSale, computePassiveLossAllowance, isNIITApplicable, getNIITThreshold, assessCostSegViability } from '../src/lib/dscr/taxEngine';
import { computeARMReset, CURRENT_MARKET_SNAPSHOT, DEFAULT_ARM_PROGRAMS, computeRemainingBalanceAtReset } from '../src/lib/dscr/armResetEngine';
import { computeReturns, computeHoldMatrix } from '../src/lib/dscr/returnsEngine';
import { computeAEY, COUNTERPARTY_RISK, enforceTwoQuoteRule } from '../src/lib/dscr/trueCostEngine';
import { checkPPPWithBranching, getMnHf3437Status, getIndexedThreshold } from '../src/lib/dscr/statePppLaws';
import { computeVerdict, computeReturnGrade } from '../src/lib/dscr/decisionSupport';
import type { PropertyInputs, BorrowerProfile, LoanStructure, TaxProfile, LenderRankingEntry } from '../src/lib/dscr/types';

console.log('═══════════════════════════════════════════════════════════');
console.log('DSCR Deal Desk v11.14 — GOLDEN VALUE + MODULE VERIFICATION');
console.log('═══════════════════════════════════════════════════════════\n');

let totalPass = 0;
let totalFail = 0;

function check(name: string, expected: any, actual: any, tolerance: number = 0.01): boolean {
  let pass: boolean;
  if (typeof expected === 'string' || typeof actual === 'string') {
    pass = expected === actual;
  } else if (typeof expected === 'boolean') {
    pass = expected === actual;
  } else {
    pass = Math.abs(actual - expected) <= tolerance;
  }
  const sign = pass ? '✓' : '✗';
  console.log(`  ${sign} ${name}: expected ${expected}, actual ${actual}`);
  pass ? totalPass++ : totalFail++;
  return pass;
}

// ============================================================
// SECTION 1: GOLDEN MATH (Part A.2)
// ============================================================
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('SECTION 1: GOLDEN MATH VERIFICATION (Part A.2)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const golden = verifyGoldenValues();
console.log('\nGolden verification result:', golden.pass ? '✓ ALL PASS' : '✗ FAILURES');
for (const [key, val] of Object.entries(golden.results)) {
  check(key, val.expected, val.actual, key.includes('factor') ? 0.00001 : (key.includes('DSCR') || key.includes('breakpoint') ? 0.05 : 2));
}

// ============================================================
// SECTION 2: REASSESSMENT ENGINE (Part B'.1)
// ============================================================
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('SECTION 2: REASSESSMENT ENGINE (Part B\'.1 — CA Prop 13)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// CA Prop 13 example: $800K purchase, seller was paying on $200K assessed
const caReassessment = computeReassessedTax(800000, 'CA', 2000);
console.log('\n  CA Prop 13 (purchase $800K, seller paid $2K/yr on $200K basis):');
console.log(`    Reassessed annual tax: $${caReassessment.reassessedAnnualTax}`);
console.log(`    Tax delta annual: $${caReassessment.deltaAnnual}`);
console.log(`    Supplemental bill estimate: $${caReassessment.supplementalBillEstimate}`);
console.log(`    Rule: ${caReassessment.rule.rule}`);
console.log(`    Note: ${caReassessment.note.substring(0, 200)}...`);

check('CA reassessed tax ($800K × 1.25%)', 10000, caReassessment.reassessedAnnualTax, 100);
check('CA supplemental bill (>0)', true, caReassessment.supplementalBillEstimate > 0, 1);

// TX
const txReassessment = computeReassessedTax(425000, 'TX', 5000);
console.log('\n  TX (purchase $425K, seller paid $5K/yr):');
console.log(`    Reassessed annual tax: $${txReassessment.reassessedAnnualTax}`);
check('TX reassessed tax ($425K × 1.7%)', 7225, txReassessment.reassessedAnnualTax, 100);

// FL
const flReassessment = computeReassessedTax(425000, 'FL', 4000);
check('FL reassessed tax ($425K × 0.89%)', 3783, flReassessment.reassessedAnnualTax, 100);

// ============================================================
// SECTION 3: TAX ENGINE (Part B'.2)
// ============================================================
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('SECTION 3: TAX ENGINE (Part B\'.2 — Depreciation, OBBBA, §1250, NIIT)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// OBBBA bonus dep — acquired after 1/19/25 → 100%
const postObbba = determineBonusDepCategory('2026-01-15', '2026-02-01');
console.log('\n  OBBBA (acquired 2026-01-15, PIS 2026-02-01):');
console.log(`    Category: ${postObbba.category}`);
console.log(`    Bonus %: ${postObbba.bonusPct * 100}%`);
check('OBBBA post-1/19/25 bonus %', 1.0, postObbba.bonusPct, 0.001);

// Pre-OBBBA (Jan 1-19, 2025, PIS 2025)
const preObbba2025 = determineBonusDepCategory('2025-01-10', '2025-06-01');
check('OBBBA pre-1/19/25 PIS-2025 bonus %', 0.40, preObbba2025.bonusPct, 0.001);

// Pre-OBBBA (Jan 1-19, 2025, PIS 2026)
const preObbba2026 = determineBonusDepCategory('2025-01-10', '2026-03-01');
check('OBBBA pre-1/19/25 PIS-2026 bonus %', 0.20, preObbba2026.bonusPct, 0.001);

// 27.5-yr depreciation
const taxProfile: TaxProfile = {
  ordinaryIncomeBrackets: [],
  magi: 200000,
  filingStatus: 'MFJ',
  stateTaxRatePct: 5,
  isRealEstateProfessional: false,
  yearsREP: 0,
  landAllocationPct: 20,
  costSegStudyCompleted: false,
  costSegReclassifiedPct: 0,
  acquisitionDate: '2026-01-15',
  placedInServiceDate: '2026-02-01',
  expectedHoldYears: 5,
  exitSellingCostsPct: 6,
  exitCapRatePct: 6.5,
  section1031Exchange: false,
};

const dep = computeDepreciationSchedule(425000, 20, 5, taxProfile);
console.log('\n  Depreciation (purchase $425K, 20% land, 5yr hold):');
console.log(`    Building basis: $${425000 * 0.8} = $${340000}`);
console.log(`    Year 1 depreciation: $${dep[0].totalAnnualDepreciation.toFixed(2)}`);
console.log(`    Expected ($340K / 27.5): $${(340000 / 27.5).toFixed(2)}`);
check('Year 1 depreciation ($340K/27.5)', 340000 / 27.5, dep[0].totalAnnualDepreciation, 1);

// NIIT thresholds
check('NIIT threshold MFJ', 250000, getNIITThreshold('MFJ'), 0);
check('NIIT threshold Single', 200000, getNIITThreshold('SINGLE'), 0);
check('NIIT threshold MFS', 125000, getNIITThreshold('MFS'), 0);
check('NIIT applicable at $300K MFJ', true, isNIITApplicable(300000, 'MFJ'), 0);
check('NIIT NOT applicable at $150K MFJ', false, isNIITApplicable(150000, 'MFJ'), 0);

// PAL
const pal = computePassiveLossAllowance(120000, 'MFJ', false, -15000);
console.log('\n  PAL (MAGI $120K MFJ, $15K loss, not REP):');
console.log(`    Actual allowable: $${pal.actualAllowableLoss}`);
console.log(`    Suspended: $${pal.suspendedLoss}`);
check('PAL allowance at $120K MFJ (full)', -15000, pal.actualAllowableLoss, 100);

const palPhaseOut = computePassiveLossAllowance(125000, 'MFJ', false, -15000);
console.log(`\n  PAL (MAGI $125K, phase-out active):`);
console.log(`    Actual allowable: $${palPhaseOut.actualAllowableLoss} (should be ~-$12,500)`);
check('PAL allowance at $125K MFJ (phase-out)', -12500, palPhaseOut.actualAllowableLoss, 200);

// Cost seg viability
const costSeg = assessCostSegViability(800000, 20);
console.log('\n  Cost seg viability ($800K property):');
console.log(`    Economic: ${costSeg.economic}`);
console.log(`    Study cost: $${costSeg.estimatedStudyCost}`);
console.log(`    Year 1 savings estimate: $${costSeg.estimatedYear1Savings}`);
check('Cost seg economic for $800K', true, costSeg.economic, 0);

// ============================================================
// SECTION 4: ARM RESET ENGINE (Part B")
// ============================================================
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('SECTION 4: ARM RESET ENGINE (Part B" — SOFR + margin)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log('\n  Current market snapshot (June 17, 2026):');
console.log(`    10yr Treasury: ${CURRENT_MARKET_SNAPSHOT.treasury10Y}%`);
console.log(`    5yr Treasury: ${CURRENT_MARKET_SNAPSHOT.treasury5Y}%`);
console.log(`    30-day SOFR: ${CURRENT_MARKET_SNAPSHOT.sofr30Day}%`);
console.log(`    Fed Funds target: ${CURRENT_MARKET_SNAPSHOT.fedFundsTargetLower}-${CURRENT_MARKET_SNAPSHOT.fedFundsTargetUpper}%`);

check('10yr Treasury ≈ 4.44-4.47%', 4.45, CURRENT_MARKET_SNAPSHOT.treasury10Y, 0.05);
check('5yr Treasury ≈ 4.26%', 4.26, CURRENT_MARKET_SNAPSHOT.treasury5Y, 0.01);
check('30-day SOFR ≈ 3.59%', 3.59, CURRENT_MARKET_SNAPSHOT.sofr30Day, 0.01);

// 5/6 ARM on flagship deal
const armTerms = DEFAULT_ARM_PROGRAMS['5_6_ARM'];
const loanAmountFlagship = 318750;
const remainingBalanceAtReset = computeRemainingBalanceAtReset(loanAmountFlagship, 7.0, 360, 60);
console.log('\n  5/6 ARM on flagship ($318,750 @ 7.0%, 5yr reset):');
console.log(`    Initial rate: ${armTerms.initialRate}%`);
console.log(`    Margin: ${armTerms.marginPct}%`);
console.log(`    Remaining balance at reset (year 5): $${remainingBalanceAtReset.toFixed(0)}`);

const armReset = computeARMReset(
  armTerms,
  remainingBalanceAtReset,
  300,  // remaining term months (360-60)
  3000, // qualifying rent
  417 + 167 + 150,  // fixed expenses (tax + ins + HOA)
  0,
);

console.log(`    Reset rate @ current SOFR ${CURRENT_MARKET_SNAPSHOT.sofr30Day}%: ${armReset.resetRateAtCurrentIndex}%`);
console.log(`    Reset rate @ stress SOFR 5.0%: ${armReset.resetRateAtStressIndex}%`);
console.log(`    Track 1 DSCR @ current reset: ${armReset.track1DSCRAtCurrentReset}`);
console.log(`    Track 1 DSCR @ stress reset: ${armReset.track1DSCRAtStressReset}`);
console.log(`    Deal-break rate at reset: ${armReset.dealBreakRate}%`);
console.log(`    Cushion at stress: ${armReset.cushionBpsAtStress} bps`);

// Sanity check: SOFR 3.59% + margin 2.75% = 6.34% — but floor = 5.125%, so reset = max(6.34, 5.125) = 6.34
check('Reset rate @ current SOFR (3.59% + 2.75% margin)', 6.34, armReset.resetRateAtCurrentIndex, 0.05);
// Stress: 5.0% + 2.75% = 7.75%, capped at lifetime (5.125 + 5.0 = 10.125) → 7.75
check('Reset rate @ stress SOFR 5.0%', 7.75, armReset.resetRateAtStressIndex, 0.05);

// ============================================================
// SECTION 5: RETURNS ENGINE (Part B)
// ============================================================
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('SECTION 5: RETURNS ENGINE (Part B — Pre-tax IRR + Exit Model)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const property: PropertyInputs = {
  purchasePrice: 425000,
  leaseRent: 3000,
  marketRent: 3000,
  strProjectedRent: 4500,
  strDocumentedRent: 4000,
  hoa: 150,
  annualTaxes: 5000,
  annualInsurance: 2000,
  floodInsurance: 0,
  propertyType: 'SFR',
  state: 'TX',
  unitCount: 1,
  sqft: 1800,
  yearBuilt: 2000,
  isCondotel: false,
  isNonWarrantable: false,
  isRural: false,
  isDecliningMarket: false,
  hoaSTRPolicy: 'SILENT',
};

const loan: LoanStructure = {
  ltv: 75,
  term: '30_YR',
  ioPeriod: 'NONE',
  armType: 'FIXED',
  prepayPreference: '54321',
  purpose: 'PURCHASE',
  expectedHoldYears: 5,
  points: 0,
  lenderFees: 1500,
  brokerFees: 0,
  rateLockCost: 0,
};

const returns = computeReturns(property, loan, 3000, 'LTR', 7.0);
console.log('\n  Returns on flagship deal ($425K, 75% LTV, 7%, $3K rent, 5yr hold):');
console.log(`    Entry cap rate: ${returns.entryCapRate}%`);
console.log(`    Year 1 CoC: ${returns.year1CashOnCash}%`);
console.log(`    Debt yield: ${returns.debtYield}%`);
console.log(`    Break-even occupancy: ${returns.breakEvenOccupancy}%`);
console.log(`    Levered IRR (5yr): ${returns.leveredIRR}%`);
console.log(`    Equity multiple: ${returns.equityMultiple}x`);
console.log(`    Net exit proceeds: $${returns.netExitProceeds.toLocaleString()}`);

// NOI should be ~ $3000*12 - opex
// GPR = $3000*12 = $36,000
// Vacancy 8% → EGI = $33,120
// OpEx: mgmt 8% = $2,880, maint 5% = $1,800, turnover 2% = $720, tax $5K, ins $2K, HOA $1,800 = $14,200
// NOI = $33,120 - $14,200 = $18,920
// Cap = $18,920 / $425,000 = 4.45%
check('Entry cap rate (NOI/Price)', 4.45, returns.entryCapRate, 0.3);

// ============================================================
// SECTION 6: TRUE COST / AEY (Part D)
// ============================================================
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('SECTION 6: TRUE COST / AEY (Part D — XIRR Lender Ranking)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Two lender quotes: Griffin 6.5% par, vs New Silver 7.5% + 1 point
const griffinAey = computeAEY(318750, 6.5, 360, 60, 0, 1500, 0, 0, 0, 6.5);
const newSilverAey = computeAEY(318750, 7.0, 360, 60, 1.0, 1500, 0, 0, 0, 6.5);

console.log('\n  AEY comparison (5yr hold, $318,750 loan):');
console.log(`    Griffin @ 6.5% par, 0 pts: AEY = ${griffinAey.aey}%`);
console.log(`    New Silver @ 7.0%, 1 pt: AEY = ${newSilverAey.aey}%`);
console.log(`    60mo total cost: Griffin $${griffinAey.totalCost60mo.toLocaleString()} vs NS $${newSilverAey.totalCost60mo.toLocaleString()}`);

// AEY should be slightly above stated rate when fees are present ($1500 lender fee)
check('Griffin AEY (near par, $1500 fee adds ~8bps)', 6.5, griffinAey.aey, 0.15);
// New Silver AEY should be > 7.0% because of the 1 point fee
const isNsHigher = newSilverAey.aey > griffinAey.aey;
check('New Silver AEY > Griffin AEY (1pt fee increases cost)', true, isNsHigher, 0);

// ============================================================
// SECTION 7: PPP BUSINESS-PURPOSE BRANCH (Part E.1)
// ============================================================
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('SECTION 7: PPP BUSINESS-PURPOSE BRANCH (Part E.1)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// MN business-purpose LLC → HF 3437 applies → PPP allowed
const mnBusiness = checkPPPWithBranching({
  state: 'MN',
  entityType: 'LLC',
  isBusinessPurpose: true,
  isBankLender: false,
  isArmLoan: false,
  loanAmount: 318750,
  unitCount: 1,
  aprPct: 7.0,
});
console.log('\n  MN LLC business-purpose DSCR loan:');
console.log(`    Allowed: ${mnBusiness.allowed}`);
console.log(`    Branch: ${mnBusiness.branch}`);
console.log(`    HF 3437 applicable: ${mnBusiness.mnHf3437Applicable}`);
check('MN business-purpose LLC PPP allowed (HF 3437)', true, mnBusiness.allowed, 0);
check('MN HF 3437 flagged', true, mnBusiness.mnHf3437Applicable, 0);

// MN individual consumer-purpose → bank lender check fires first
const mnConsumer = checkPPPWithBranching({
  state: 'MN',
  entityType: 'INDIVIDUAL',
  isBusinessPurpose: false,
  isBankLender: true,
  isArmLoan: false,
  loanAmount: 318750,
  unitCount: 1,
  aprPct: 7.0,
});
console.log('\n  MN individual consumer-purpose loan (bank lender):');
console.log(`    Allowed: ${mnConsumer.allowed}`);
console.log(`    Branch: ${mnConsumer.branch}`);
// Bank lender + individual vesting → BANK_LENDER branch fires first (stricter consumer rules)
check('MN individual bank loan: branch = BANK_LENDER', 'BANK_LENDER', mnConsumer.branch, 0);

// MN individual consumer, NON-bank lender → consumer statute matrix
const mnConsumerNonBank = checkPPPWithBranching({
  state: 'MN',
  entityType: 'INDIVIDUAL',
  isBusinessPurpose: false,
  isBankLender: false,
  isArmLoan: false,
  loanAmount: 318750,
  unitCount: 1,
  aprPct: 7.0,
});
console.log('\n  MN individual consumer-purpose loan (non-bank):');
console.log(`    Allowed: ${mnConsumerNonBank.allowed}`);
console.log(`    Branch: ${mnConsumerNonBank.branch}`);
check('MN individual non-bank: branch = CONSUMER_STATUTE', 'CONSUMER_STATUTE', mnConsumerNonBank.branch, 0);

// NJ LLC → entity OK but lender split warning
const njLLC = checkPPPWithBranching({
  state: 'NJ',
  entityType: 'LLC',
  isBusinessPurpose: true,
  isBankLender: false,
  isArmLoan: false,
  loanAmount: 318750,
  unitCount: 1,
  aprPct: 7.0,
});
console.log('\n  NJ LLC business-purpose DSCR loan:');
console.log(`    Allowed: ${njLLC.allowed}`);
console.log(`    Branch: ${njLLC.branch}`);
console.log(`    NJ lender split warning: ${njLLC.njLenderSplitWarning}`);
check('NJ LLC PPP allowed', true, njLLC.allowed, 0);
check('NJ lender split warning flag', true, njLLC.njLenderSplitWarning, 0);

// WI ARM → ARM_RESTRICTED
const wiArm = checkPPPWithBranching({
  state: 'WI',
  entityType: 'LLC',
  isBusinessPurpose: true,
  isBankLender: false,
  isArmLoan: true,
  loanAmount: 318750,
  unitCount: 1,
  aprPct: 7.0,
});
console.log('\n  WI LLC business-purpose ARM loan:');
console.log(`    Allowed: ${wiArm.allowed}`);
console.log(`    Branch: ${wiArm.branch}`);
check('WI ARM PPP not allowed', false, wiArm.allowed, 0);
check('WI ARM branch = ARM_RESTRICTED', 'ARM_RESTRICTED', wiArm.branch, 0);

// OH penalty base = ORIGINAL_PRINCIPAL
const ohBusiness = checkPPPWithBranching({
  state: 'OH',
  entityType: 'LLC',
  isBusinessPurpose: true,
  isBankLender: false,
  isArmLoan: false,
  loanAmount: 318750,
  unitCount: 1,
  aprPct: 7.0,
});
console.log('\n  OH LLC business-purpose DSCR loan:');
console.log(`    Allowed: ${ohBusiness.allowed}`);
console.log(`    Penalty base: ${ohBusiness.penaltyBase}`);
check('OH penalty base = ORIGINAL_PRINCIPAL', 'ORIGINAL_PRINCIPAL', ohBusiness.penaltyBase, 0);

// MN HF 3437 status
const hf3437 = getMnHf3437Status();
console.log('\n  MN HF 3437 status:');
console.log(`    Enacted: ${hf3437.enacted}`);
console.log(`    Effective date: ${hf3437.effectiveDate}`);
console.log(`    Summary: ${hf3437.summary}`);
check('HF 3437 enacted', true, hf3437.enacted, 0);

// Indexed threshold
const paThreshold = getIndexedThreshold('PA', 2026);
console.log(`\n  PA PPP threshold (2026): $${paThreshold.threshold.toLocaleString()}`);
check('PA threshold 2026 = $329,411', 329411, paThreshold.threshold, 0);
check('PA needs January reconfirm', true, paThreshold.needsJanuaryReconfirm, 0);

const ohThreshold = getIndexedThreshold('OH', 2026);
check('OH threshold 2026 = $116,356', 116356, ohThreshold.threshold, 0);

// ============================================================
// SECTION 8: VERDICT + RETURN GRADE (Part J)
// ============================================================
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('SECTION 8: VERDICT + RETURN GRADE (Part J)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Return Grade computation
check('Return Grade A (15% IRR + T2 1.10)', 'A', computeReturnGrade(0.16, 1.15), 0);
check('Return Grade B (12% IRR + T2 1.0)', 'B', computeReturnGrade(0.13, 1.05), 0);
check('Return Grade C (10% IRR + T2 0.95)', 'C', computeReturnGrade(0.10, 0.95), 0);
check('Return Grade D (5% IRR)', 'D', computeReturnGrade(0.05, 0.90), 0);
check('Return Grade F (negative IRR)', 'F', computeReturnGrade(-0.05, 1.0), 0);

// ============================================================
// SUMMARY
// ============================================================
console.log('\n═══════════════════════════════════════════════════════════');
console.log('VERIFICATION SUMMARY');
console.log('═══════════════════════════════════════════════════════════');
console.log(`  Total checks: ${totalPass + totalFail}`);
console.log(`  Passed: ${totalPass}`);
console.log(`  Failed: ${totalFail}`);
console.log(`  Result: ${totalFail === 0 ? '✓ ALL PASS' : '✗ FAILURES DETECTED'}`);
console.log('');

if (totalFail > 0) {
  process.exit(1);
}
