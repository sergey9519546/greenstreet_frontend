// ============================================================
// AUDIT 9 — Loan Optimizer & Rescue Engine Tests
// Verifies: prepay on REMAINING balance (not original), partial prepay 20%/yr,
// soft prepay UNCONFIRMED, PPP premium, IO recast warning, structure options ≥12,
// DSCR-then-cost sorting, rescue dimensions & rankings, five-year cost components.
// ============================================================

import {
  computePrepaySchedule,
  computeRemainingBalance,
  computePrepayExitCost,
  generateStructureOptions,
  rescueTrack1,
  rescueTrack2,
} from '../src/lib/dscr/loanOptimizer';
import { checkPPPLegal } from '../src/lib/dscr/statePppLaws';
import { calculatePI, calculatePaymentFactor } from '../src/lib/dscr/engine';
import type {
  PropertyInputs,
  BorrowerProfile,
  LoanStructure,
  PrepayPenaltySchedule,
} from '../src/lib/dscr/types';

interface TestResult {
  id: string;
  description: string;
  expected: string;
  actual: string;
  pass: boolean;
  details?: string;
}

const results: TestResult[] = [];

function check(
  id: string,
  description: string,
  expected: string,
  actual: string,
  pass: boolean,
  details?: string,
) {
  results.push({ id, description, expected, actual, pass, details });
}

// ============================================================
// FLAGSHIP SCENARIO: $425K, 75% LTV, $318,750 loan @ 7.00%, 5-yr hold
// Prepay schedule = 5-4-3-2-1 step-down
// ============================================================

const LOAN_AMOUNT = 318_750;
const RATE = 7.00;
const TERM_YEARS = 30;
const TERM_MONTHS = TERM_YEARS * 12;
const HOLD_YEARS = 5;

console.log('\n' + '='.repeat(80));
console.log('AUDIT 9 — Loan Optimizer & Rescue Engine — Flagship Scenario');
console.log('='.repeat(80));
console.log(`Loan: $${LOAN_AMOUNT.toLocaleString()} @ ${RATE}% / 30yr, hold ${HOLD_YEARS}yr`);
console.log(`Payment factor @ 7.00% = ${calculatePaymentFactor(RATE, TERM_MONTHS)}`);
console.log(`Monthly PI = $${calculatePI(LOAN_AMOUNT, RATE, TERM_MONTHS).toFixed(2)}`);
console.log('='.repeat(80) + '\n');

// ------------------------------------------------------------
// TEST 1: Year-1 remaining balance on $318,750 @ 7% 30yr ≈ $315,500
// ------------------------------------------------------------
const year1Remaining = computeRemainingBalance(LOAN_AMOUNT, RATE, TERM_MONTHS, 12);
const expectedYear1Remaining = 315_386; // amortization-derived
const year1RemainingPass =
  Math.abs(year1Remaining - expectedYear1Remaining) < 200 &&
  year1Remaining < LOAN_AMOUNT;
check(
  'audit9-1',
  'Year-1 REMAINING balance on $318,750 @ 7% 30yr after 12 payments ≈ $315,386 (NOT $318,750)',
  `≈ $${expectedYear1Remaining.toLocaleString()} (must be < $${LOAN_AMOUNT.toLocaleString()})`,
  `$${year1Remaining.toFixed(2)}`,
  year1RemainingPass,
  `Original loan amount was $${LOAN_AMOUNT.toLocaleString()}. Remaining balance at month 12 must be less than original.`,
);

// ------------------------------------------------------------
// TEST 2: Year-1 prepay penalty = 5% × remaining_balance_at_month_12
//   expected ≈ $15,769 (= 5% × $315,386)
//   WRONG   = $15,937.50 (= 5% × $318,750 original)
// ------------------------------------------------------------
const schedule: PrepayPenaltySchedule = computePrepaySchedule(
  LOAN_AMOUNT,
  RATE,
  TERM_YEARS,
  '54321',
  false,
  20,
);
const wrongYear1Penalty = LOAN_AMOUNT * 0.05; // 5% × ORIGINAL
const expectedYear1Penalty = year1Remaining * 0.05;
const year1PenaltyPass =
  Math.abs(schedule.year1 - expectedYear1Penalty) < 5 &&
  schedule.year1 < wrongYear1Penalty;
check(
  'audit9-2',
  'Year-1 prepay penalty = 5% × REMAINING balance (NOT 5% × original)',
  `≈ $${expectedYear1Penalty.toFixed(2)} (= 5% × $${year1Remaining.toFixed(0)})`,
  `$${schedule.year1.toFixed(2)}`,
  year1PenaltyPass,
  `WRONG calc (original × 5%) would yield $${wrongYear1Penalty.toFixed(2)}. Difference: $${(wrongYear1Penalty - schedule.year1).toFixed(2)}.`,
);

// ------------------------------------------------------------
// TEST 3: Year-1 penalty is NOT $15,937.50 (original × 5%)
// ------------------------------------------------------------
const notOriginalPass =
  Math.abs(schedule.year1 - wrongYear1Penalty) > 50 &&
  schedule.year1 < wrongYear1Penalty;
check(
  'audit9-3',
  'Year-1 penalty ≠ $15,937.50 (which would be 5% × $318,750 ORIGINAL)',
  '< $15,937.50',
  `$${schedule.year1.toFixed(2)}`,
  notOriginalPass,
  `Original-based calc would be $${wrongYear1Penalty.toFixed(2)}. Actual: $${schedule.year1.toFixed(2)}.`,
);

// ------------------------------------------------------------
// TEST 4: Year-2, Year-3, Year-4, Year-5 also use REMAINING balance
//   Each year's remaining balance must be less than the previous
// ------------------------------------------------------------
const year2Remaining = computeRemainingBalance(LOAN_AMOUNT, RATE, TERM_MONTHS, 24);
const year3Remaining = computeRemainingBalance(LOAN_AMOUNT, RATE, TERM_MONTHS, 36);
const year4Remaining = computeRemainingBalance(LOAN_AMOUNT, RATE, TERM_MONTHS, 48);
const year5Remaining = computeRemainingBalance(LOAN_AMOUNT, RATE, TERM_MONTHS, 60);

const monotonicDecrease =
  year1Remaining > year2Remaining &&
  year2Remaining > year3Remaining &&
  year3Remaining > year4Remaining &&
  year4Remaining > year5Remaining;

const yearNStepRates = [0.05, 0.04, 0.03, 0.02, 0.01];
const yearNRemaining = [year1Remaining, year2Remaining, year3Remaining, year4Remaining, year5Remaining];
const expectedYearNPenalties = yearNRemaining.map((bal, i) => bal * yearNStepRates[i]);
const actualYearNPenalties = [schedule.year1, schedule.year2, schedule.year3, schedule.year4, schedule.year5];

const allYearsUseRemaining = expectedYearNPenalties.every((exp, i) =>
  Math.abs(exp - actualYearNPenalties[i]) < 5,
);

check(
  'audit9-4',
  'Years 1-5 prepay penalties ALL use REMAINING balance (monotonically decreasing balance)',
  `Y1: $${expectedYearNPenalties[0].toFixed(0)}, Y2: $${expectedYearNPenalties[1].toFixed(0)}, Y3: $${expectedYearNPenalties[2].toFixed(0)}, Y4: $${expectedYearNPenalties[3].toFixed(0)}, Y5: $${expectedYearNPenalties[4].toFixed(0)}`,
  `Y1: $${actualYearNPenalties[0].toFixed(0)}, Y2: $${actualYearNPenalties[1].toFixed(0)}, Y3: $${actualYearNPenalties[2].toFixed(0)}, Y4: $${actualYearNPenalties[3].toFixed(0)}, Y5: $${actualYearNPenalties[4].toFixed(0)}`,
  monotonicDecrease && allYearsUseRemaining,
  `Remaining balance: Y1=$${year1Remaining.toFixed(0)}, Y2=$${year2Remaining.toFixed(0)}, Y3=$${year3Remaining.toFixed(0)}, Y4=$${year4Remaining.toFixed(0)}, Y5=$${year5Remaining.toFixed(0)}`,
);

// ------------------------------------------------------------
// TEST 5: partialAllowancePct = 20
// ------------------------------------------------------------
const partialPass = schedule.partialAllowancePct === 20;
check(
  'audit9-5',
  'Partial prepay allowance = 20%/yr (penalty-free)',
  '20',
  String(schedule.partialAllowancePct),
  partialPass,
);

// ------------------------------------------------------------
// TEST 6: Soft prepay → softPrepaySaleExempt = 'UNCONFIRMED' (not true)
// ------------------------------------------------------------
const softSchedule = computePrepaySchedule(
  LOAN_AMOUNT,
  RATE,
  TERM_YEARS,
  'SOFT_PREPAY',
  true,
  20,
);
const softPass = softSchedule.softPrepaySaleExempt === 'UNCONFIRMED';
check(
  'audit9-6',
  "Soft prepay returns softPrepaySaleExempt = 'UNCONFIRMED' (NOT true)",
  "'UNCONFIRMED'",
  JSON.stringify(softSchedule.softPrepaySaleExempt),
  softPass,
  'Soft prepay ≠ sale-exempt until doc language confirmed.',
);

// Non-soft prepay should return false (not 'UNCONFIRMED')
const nonSoftPass = schedule.softPrepaySaleExempt === false;
check(
  'audit9-6b',
  'Non-soft prepay returns softPrepaySaleExempt = false',
  'false',
  JSON.stringify(schedule.softPrepaySaleExempt),
  nonSoftPass,
);

// ------------------------------------------------------------
// TEST 7: PPP premium — rate +0.25% when checkPPPLegal returns allowed=false
// We simulate a state where PPP is prohibited (e.g., KS)
// ------------------------------------------------------------
const ksPppCheck = checkPPPLegal('KS', 'INDIVIDUAL', LOAN_AMOUNT, 1, 'FIXED');
const ksPppRatePremiumCorrect = ksPppCheck.noPPPPremiumRate === 0.0025;
const ksPppFeePremiumCorrect = ksPppCheck.noPPPPremiumFee === 0.00625;
check(
  'audit9-7a',
  'checkPPPLegal returns noPPPPremiumRate = 0.0025 (~0.25%) when PPP blocked',
  '0.0025',
  String(ksPppCheck.noPPPPremiumRate),
  ksPppRatePremiumCorrect,
  `KS check: allowed=${ksPppCheck.allowed}, status=${ksPppCheck.status}`,
);
check(
  'audit9-7b',
  'checkPPPLegal returns noPPPPremiumFee = 0.00625 (~0.625%) when PPP blocked',
  '0.00625',
  String(ksPppCheck.noPPPPremiumFee),
  ksPppFeePremiumCorrect,
);

// Now verify generateStructureOptions applies the rate premium for KS
const ksProperty: PropertyInputs = {
  purchasePrice: 425_000,
  leaseRent: 3_000,
  marketRent: 3_000,
  strProjectedRent: 4_500,
  strDocumentedRent: 0,
  hoa: 150,
  annualTaxes: 5_000,
  annualInsurance: 2_000,
  floodInsurance: 0,
  propertyType: 'SFR',
  state: 'KS', // PPP prohibited
  unitCount: 1,
  sqft: 1500,
  yearBuilt: 2005,
  isCondotel: false,
  isNonWarrantable: false,
  isRural: false,
  isDecliningMarket: false,
  hoaSTRPolicy: 'ALLOWS',
};

const tnProperty: PropertyInputs = { ...ksProperty, state: 'TN' }; // PPP allowed

const ksBorrower: BorrowerProfile = {
  ficoScore: 720,
  experience: 'EXPERIENCED',
  existingFinancedProperties: 3,
  entityType: 'LLC',
  isUSCitizenOrPR: true,
  availableReserves: 80_000,
  reserveAssets: [
    { type: 'CHECKING', value: 30_000 },
    { type: 'SAVINGS', value: 25_000 },
    { type: 'BROKERAGE', value: 25_000 },
  ],
  isFirstResponder: false,
  isForeignNational: false,
};

const ksLoan: LoanStructure = {
  ltv: 75,
  term: '30_YR',
  ioPeriod: 'NONE',
  armType: 'FIXED',
  prepayPreference: '54321',
  purpose: 'PURCHASE',
  expectedHoldYears: 5,
  points: 2,
  lenderFees: 1_500,
  brokerFees: 0,
  rateLockCost: 500,
};

const ksOptions = generateStructureOptions(ksProperty, ksBorrower, ksLoan, 'LTR');
const tnOptions = generateStructureOptions(tnProperty, ksBorrower, ksLoan, 'LTR');

// Verify the KS option rate is at least 0.25% higher than TN baseline
const ksFixed = ksOptions.find(o => o.name === '30yr Fixed');
const tnFixed = tnOptions.find(o => o.name === '30yr Fixed');

const pppRatePremiumApplied =
  ksFixed && tnFixed && ksFixed.rate >= tnFixed.rate + 0.0024; // allow tiny rounding slack
check(
  'audit9-7c',
  'PPP-blocked state (KS) structure rate ≥ TN baseline + 0.25%',
  `≥ TN rate + 0.25%`,
  `KS rate: ${ksFixed?.rate.toFixed(4)}%, TN rate: ${tnFixed?.rate.toFixed(4)}%, diff: ${ksFixed && tnFixed ? (ksFixed.rate - tnFixed.rate).toFixed(4) : '?'}%`,
  !!pppRatePremiumApplied,
);

const ksPppNotAllowed = ksFixed?.pppAllowed === false;
check(
  'audit9-7d',
  'KS structure option marks pppAllowed = false',
  'false',
  String(ksFixed?.pppAllowed),
  !!ksPppNotAllowed,
);

// ------------------------------------------------------------
// TEST 8: generateStructureOptions returns ≥ 12 options
// ------------------------------------------------------------
const structureCountPass = tnOptions.length >= 12;
check(
  'audit9-8',
  'generateStructureOptions returns ≥ 12 structure options',
  '>=12',
  String(tnOptions.length),
  structureCountPass,
  `Returned ${tnOptions.length} options: ${tnOptions.map(o => o.name).join(', ')}`,
);

// ------------------------------------------------------------
// TEST 9: At least one structure has IO (and ioRecastWarning populated)
// ------------------------------------------------------------
const ioOptions = tnOptions.filter(o => o.ioPeriod !== 'NONE');
const ioWithWarning = ioOptions.filter(o => o.ioRecastWarning !== null && o.ioRecastWarning.length > 0);
const ioPass = ioOptions.length >= 1 && ioWithWarning.length >= 1;
check(
  'audit9-9',
  'At least one structure has IO with ioRecastWarning populated',
  '>=1 IO option with warning',
  `${ioOptions.length} IO options, ${ioWithWarning.length} with warning`,
  ioPass,
  ioWithWarning[0] ? `Sample warning: ${ioWithWarning[0].ioRecastWarning}` : 'NO IO WARNING FOUND',
);

// ------------------------------------------------------------
// TEST 10: IO recast warning includes recast payment, recast DSCR, drop magnitude
// ------------------------------------------------------------
const sampleIO = ioWithWarning[0];
let ioRecastContentPass = false;
let ioRecastDetails = 'NO IO OPTION';
if (sampleIO && sampleIO.ioRecastWarning) {
  const warning = sampleIO.ioRecastWarning;
  // Should mention "recasts" (recast payment), DSCR value (recast DSCR), and "jumps" (magnitude)
  const hasRecastPayment = /recasts?\s+to\s+\$/i.test(warning) || /payment\s+recasts/i.test(warning);
  const hasDSCRValue = /DSCR[^:]*:\s*\d+\.\d+/i.test(warning) || /DSCR\s+at\s+recast/i.test(warning);
  const hasMagnitude = /jumps\s+from/i.test(warning) || /drops/i.test(warning) || /from\s+\$/i.test(warning);
  ioRecastContentPass = hasRecastPayment && hasDSCRValue && hasMagnitude;
  ioRecastDetails = `payment=${hasRecastPayment}, dscrValue=${hasDSCRValue}, magnitude=${hasMagnitude}`;
}
check(
  'audit9-10',
  'IO recast warning includes recast payment, recast DSCR, and P&I magnitude',
  'all 3 elements',
  ioRecastDetails,
  ioRecastContentPass,
  sampleIO ? `Warning: ${sampleIO.ioRecastWarning}` : '',
);

// ------------------------------------------------------------
// TEST 11: Structure options sorted — DSCR ≥ 1.0 first, then by fiveYearCost asc
// ------------------------------------------------------------
let sortedPass = true;
let sortDetails = '';
for (let i = 1; i < tnOptions.length; i++) {
  const prev = tnOptions[i - 1];
  const curr = tnOptions[i];
  const prevPasses = prev.track1DSCR >= 1.0;
  const currPasses = curr.track1DSCR >= 1.0;
  if (prevPasses && !currPasses) {
    // OK — passing option before failing one
    continue;
  }
  if (!prevPasses && currPasses) {
    // FAILING option before passing one — sort broken
    sortedPass = false;
    sortDetails = `Sort broken at index ${i}: ${prev.name} (DSCR ${prev.track1DSCR}) before ${curr.name} (DSCR ${curr.track1DSCR})`;
    break;
  }
  // Both pass or both fail — check fiveYearCost ascending
  if (prev.fiveYearCost > curr.fiveYearCost) {
    sortedPass = false;
    sortDetails = `fiveYearCost not ascending at index ${i}: ${prev.name} ($${prev.fiveYearCost}) before ${curr.name} ($${curr.fiveYearCost})`;
    break;
  }
}
check(
  'audit9-11',
  'Structure options sorted: DSCR ≥ 1.0 first, then by fiveYearCost ascending',
  'DSCR ≥1.0 first, then cost asc',
  sortedPass ? 'PASS' : 'FAIL',
  sortedPass,
  sortDetails || `Order: ${tnOptions.map(o => `${o.name}(DSCR ${o.track1DSCR}, $${o.fiveYearCost})`).join(' → ')}`,
);

// ------------------------------------------------------------
// TEST 12: Five-year cost includes interest + closing + PPP exit
// (closing costs bundle points + lender fees + broker fees + rate lock as 3%)
// ------------------------------------------------------------
const sampleOption = tnFixed;
const fiveYearCostBreakdownPass =
  !!sampleOption &&
  sampleOption.fiveYearCost > 0 &&
  sampleOption.prepaySchedule.year5 > 0; // PPP exit at year 5 would be 1% × remaining

// Check that fiveYearCost > interest-only component alone (proves it includes closing/PPP)
const sampleLoanAmount = tnProperty.purchasePrice * (tnLoan => tnLoan.ltv / 100)(ksLoan);
const expectedInterestOnly5yr = sampleLoanAmount * (RATE / 100 / 12) * 60;
const includesMoreThanInterest = sampleOption ? sampleOption.fiveYearCost > expectedInterestOnly5yr : false;

check(
  'audit9-12',
  'Five-year cost includes interest + closing costs (incl. points/fees) + PPP exit cost',
  'fiveYearCost > interest-only component (proves closing+PPP added)',
  `fiveYearCost=$${sampleOption?.fiveYearCost}, interest-only=$${expectedInterestOnly5yr.toFixed(0)}`,
  fiveYearCostBreakdownPass && includesMoreThanInterest,
  `LoanStructure has points=${ksLoan.points}, lenderFees=$${ksLoan.lenderFees}, brokerFees=$${ksLoan.brokerFees}, rateLockCost=$${ksLoan.rateLockCost}. NOTE: computeFiveYearCost uses generic 3% closingCosts, NOT these explicit fields. See audit finding.`,
);

// ------------------------------------------------------------
// TEST 13: Rescue Track 1 produces ≥ 7 fix dimensions
// ------------------------------------------------------------
// Construct a failing scenario: high rate, low rent → DSCR < 1.0
const failingProperty: PropertyInputs = {
  ...tnProperty,
  purchasePrice: 500_000, // larger loan → harder to qualify
  leaseRent: 2_400, // below breakeven
  marketRent: 2_400,
};

const failingLoan: LoanStructure = {
  ...ksLoan,
  ltv: 80,
  prepayPreference: '54321',
};

// Track 1 DSCR @ $400K loan @ 8% = ~$2,936 PI / $2,400 rent = 0.82 (failing)
const rescueLoanAmount = failingProperty.purchasePrice * 0.8;
const rescueRate = 8.0;
const rescueTermMonths = 360;
const rescueFixedExpenses =
  failingProperty.annualTaxes / 12 +
  failingProperty.annualInsurance / 12 +
  failingProperty.hoa +
  failingProperty.floodInsurance / 12;
const rescuePI = calculatePI(rescueLoanAmount, rescueRate, rescueTermMonths);
const rescuePITIA = rescuePI + rescueFixedExpenses;
const rescueTrack1DSCR = failingProperty.leaseRent / rescuePITIA;

const rescueResult = rescueTrack1(
  failingProperty,
  ksBorrower,
  failingLoan,
  rescueTrack1DSCR,
  1.25, // target
  rescuePITIA,
  rescueLoanAmount,
  rescueRate,
  30,
);

const rescueFixCountPass = rescueResult.fixes.length >= 7;
check(
  'audit9-13',
  `Rescue Track 1 produces ≥ 7 fix dimensions (got ${rescueResult.fixes.length})`,
  '>=7',
  String(rescueResult.fixes.length),
  rescueFixCountPass,
  `Fixes: ${rescueResult.fixes.map(f => f.action).join(' | ')}`,
);

// ------------------------------------------------------------
// TEST 14: Rescue ranking fields all populated
// ------------------------------------------------------------
const rankingPass =
  !!rescueResult.fastestFix &&
  !!rescueResult.cheapestFix &&
  !!rescueResult.lowestRiskFix &&
  !!rescueResult.bestROIFix;
check(
  'audit9-14',
  'Rescue ranking: fastestFix, cheapestFix, lowestRiskFix, bestROIFix all populated',
  'all 4 populated',
  `fastest: ${rescueResult.fastestFix?.action}, cheapest: ${rescueResult.cheapestFix?.action}, lowestRisk: ${rescueResult.lowestRiskFix?.action}, bestROI: ${rescueResult.bestROIFix?.action}`,
  rankingPass,
);

// ------------------------------------------------------------
// TEST 15: Rescue covers dimensions — rent, price, down, rate, IO, formula, STR, combo
// ------------------------------------------------------------
const fixActions = rescueResult.fixes.map(f => f.action.toLowerCase());
const dimensions = {
  rent: fixActions.some(a => a.includes('rent')),
  price: fixActions.some(a => a.includes('price')),
  down: fixActions.some(a => a.includes('down')),
  rate: fixActions.some(a => a.includes('rate')),
  io: fixActions.some(a => a.includes('interest-only') || a.includes('io ')),
  formula: fixActions.some(a => a.includes('formula')),
  str: fixActions.some(a => a.includes('str')),
  combo: fixActions.some(a => a.includes('combination') || a.includes('combo')),
};
const dimensionCount = Object.values(dimensions).filter(Boolean).length;
const dimensionsPass = dimensionCount >= 7;
check(
  'audit9-15',
  'Rescue fixes span ≥ 7 dimensions: rent, price, down, rate, IO, formula, STR, combination',
  '>=7 dimensions',
  `${dimensionCount} dimensions: ${Object.entries(dimensions).filter(([, v]) => v).map(([k]) => k).join(', ')}`,
  dimensionsPass,
  `All fix actions: ${rescueResult.fixes.map(f => f.action).join(' | ')}`,
);

// ------------------------------------------------------------
// TEST 16: Prepay exit cost at year 5 uses REMAINING balance (not original)
// ------------------------------------------------------------
const year5ExitCost = computePrepayExitCost(
  LOAN_AMOUNT,
  RATE,
  TERM_YEARS,
  '54321',
  5,
);
const expectedYear5ExitCost = year5Remaining * 0.01; // 1% step at year 5
const wrongYear5ExitCost = LOAN_AMOUNT * 0.01;
const exitCostPass =
  Math.abs(year5ExitCost - expectedYear5ExitCost) < 5 &&
  year5ExitCost < wrongYear5ExitCost;
check(
  'audit9-16',
  'computePrepayExitCost at year 5 = 1% × REMAINING balance (NOT original)',
  `≈ $${expectedYear5ExitCost.toFixed(2)} (1% × $${year5Remaining.toFixed(0)})`,
  `$${year5ExitCost.toFixed(2)}`,
  exitCostPass,
  `WRONG calc would be $${wrongYear5ExitCost.toFixed(2)} (1% × $${LOAN_AMOUNT.toLocaleString()} original).`,
);

// ------------------------------------------------------------
// TEST 17: Rescue Track 2 also produces fixes + ranking
// ------------------------------------------------------------
const rescueTrack2Result = rescueTrack2(
  failingProperty.leaseRent,
  rescuePITIA,
  0.78, // current track2 DSCR
  8, 12, 5, // vacancy, mgmt, maint
);
const track2Pass =
  rescueTrack2Result.fixes.length >= 3 &&
  !!rescueTrack2Result.fastestFix &&
  !!rescueTrack2Result.cheapestFix &&
  !!rescueTrack2Result.lowestRiskFix &&
  !!rescueTrack2Result.bestROIFix;
check(
  'audit9-17',
  'Rescue Track 2 produces fixes + 4 rankings',
  '>=3 fixes + 4 rankings',
  `${rescueTrack2Result.fixes.length} fixes, rankings: ${rescueTrack2Result.fastestFix ? 'OK' : 'MISSING'}`,
  track2Pass,
  `Track 2 fixes: ${rescueTrack2Result.fixes.map(f => f.action).join(' | ')}`,
);

// ============================================================
// SUMMARY
// ============================================================

const passed = results.filter(r => r.pass).length;
const failed = results.length - passed;

console.log('\n' + '='.repeat(80));
console.log('AUDIT 9 — TEST SUMMARY');
console.log('='.repeat(80));
console.log(`Total tests: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Pass rate: ${((passed / results.length) * 100).toFixed(1)}%`);
console.log('='.repeat(80) + '\n');

for (const r of results) {
  const marker = r.pass ? '✅' : '❌';
  console.log(`${marker} ${r.id}: ${r.description}`);
  console.log(`   Expected: ${r.expected}`);
  console.log(`   Actual:   ${r.actual}`);
  if (r.details) console.log(`   Details:  ${r.details}`);
  console.log('');
}

console.log('='.repeat(80));
if (failed === 0) {
  console.log('✅ AUDIT 9 — ALL TESTS PASSED');
} else {
  console.log(`❌ AUDIT 9 — ${failed} TESTS FAILED`);
}
console.log('='.repeat(80) + '\n');

process.exit(failed === 0 ? 0 : 1);
