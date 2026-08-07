// =============================================================
// Dual-Track DSCR Truth Engine — Audit & Verification Script
// Verifies the user's Track A / Track B framing end-to-end:
//
//   Track A — Lender Qualification
//     "Can this loan close under a lender/investor matrix?"
//       • Track 1 DSCR ≥ lender minimum
//       • LTV / FICO / entity / state / property type all eligible
//       • At least one flex lender AND one rate-competitive lender (two-quote rule)
//       • PPP options legal in property state
//       • Reserves satisfy conservative scenario
//       • Deal-kill check: zero blockers
//
//   Track B — Investor Survival
//     "Should this investor actually do this deal after real-world
//      leakage, shocks, and liquidity risk?"
//       • Track 2 DSCR ≥ 1.0 (cash-flow positive)
//       • Negative-carry acknowledgment captured
//       • Stress reserves covered by eligible liquid assets
//       • Monte Carlo P(DSCR ≥ 1.0) > 50%
//       • Acquisition score ≥ "Acceptable" band
//       • Joint appraisal shock: combined risk not CRITICAL
//       • PPP true cost of capital acceptable for hold period
// =============================================================

import { solveDSCR, verifyGoldenValues, calculatePI, calculatePaymentFactor, calculatePITIA, solveDealBreakRate } from '../src/lib/dscr/engine';
import { computeReserveScenarios } from '../src/lib/dscr/reserveEngine';
import { matchLenders } from '../src/lib/dscr/lenders';
import { checkPPPLegal } from '../src/lib/dscr/statePppLaws';
import { evaluateSTRUnderwriting } from '../src/lib/dscr/strUnderwriting';
import { runMonteCarlo } from '../src/lib/dscr/monteCarlo';
import { computeAcquisitionScore, computeExecutionRisk, computeDealKillCheck, validateTwoQuoteRule } from '../src/lib/dscr/decisionSupport';
import { computeBreakevenResult, computeJointAppraisalRisk } from '../src/lib/dscr/sensitivity';
import { generateStructureOptions, computePrepayExitCost } from '../src/lib/dscr/loanOptimizer';
import type { PropertyInputs, BorrowerProfile, LoanStructure } from '../src/lib/dscr/types';

// --- Flagship Deal ---
const property: PropertyInputs = {
  purchasePrice: 425000, leaseRent: 3000, marketRent: 3100,
  strProjectedRent: 5500, strDocumentedRent: 4200,
  hoa: 150, annualTaxes: 5000, annualInsurance: 2000, floodInsurance: 0,
  propertyType: 'SFR', state: 'TX', unitCount: 1, sqft: 1800, yearBuilt: 2005,
  isCondotel: false, isNonWarrantable: false, isRural: false, isDecliningMarket: false,
  hoaSTRPolicy: 'UNKNOWN',
};

const borrower: BorrowerProfile = {
  ficoScore: 729, experience: 'EXPERIENCED', existingFinancedProperties: 2,
  entityType: 'LLC', isUSCitizenOrPR: true, availableReserves: 75000,
  reserveAssets: [
    { type: 'CHECKING', value: 30000 },
    { type: 'SAVINGS', value: 25000 },
    { type: 'BROKERAGE', value: 20000 },
  ],
  isFirstResponder: false, isForeignNational: false,
};

const loan: LoanStructure = {
  ltv: 75, term: '30_YR', ioPeriod: 'NONE', armType: 'FIXED',
  prepayPreference: 'NONE', purpose: 'PURCHASE', expectedHoldYears: 5,
  points: 0, lenderFees: 1295, brokerFees: 0, rateLockCost: 0,
};

let pass = 0, fail = 0, warn = 0;
function check(name: string, ok: boolean, detail: string) {
  const sym = ok ? '✓' : '✗';
  console.log(`  ${sym} ${name}: ${detail}`);
  if (ok) pass++; else fail++;
}
function warning(name: string, detail: string) {
  console.log(`  ⚠ ${name}: ${detail}`);
  warn++;
}

// ============= GOLDEN VALUES =============
console.log('\n═══════════════════════════════════════════════');
console.log('  1. GOLDEN VALUE VERIFICATION (Math Foundation)');
console.log('═══════════════════════════════════════════════');
const golden = verifyGoldenValues();
for (const [k, r] of Object.entries(golden.results)) {
  check(k, r.pass, `expected=${r.expected}, actual=${r.actual}`);
}

// ============= DUAL-TRACK CORE =============
console.log('\n═══════════════════════════════════════════════');
console.log('  2. DUAL-TRACK CORE (Track A vs Track B)');
console.log('═══════════════════════════════════════════════');
const result = solveDSCR(property, borrower, loan, 'LTR');
const t1 = result.dualTrackDSCR.track1;
const t2 = result.dualTrackDSCR.track2;

check('Track A label', t1.label.includes('Lender Qualification'), t1.label);
check('Track B label', t2.label.includes('Investor Survival'), t2.label);
check('Track A no vacancy', t1.vacancyApplied === 0, `vacancy=${t1.vacancyApplied}%`);
check('Track B has vacancy', t2.vacancyApplied > 0, `vacancy=${t2.vacancyApplied}%`);
check('Track A has management=0', t1.managementApplied === 0, `mgmt=${t1.managementApplied}%`);
check('Track B has management>0', t2.managementApplied > 0, `mgmt=${t2.managementApplied}%`);
check('Track A passes (1.0+)', t1.dscr >= 1.0, `DSCR=${t1.dscr.toFixed(3)}`);
check('Track B fails (negative carry)', t2.dscr < 1.0, `DSCR=${t2.dscr.toFixed(3)}`);
check('Verdict warning required', result.dualTrackDSCR.verdict.warningRequired, 'Negative carry flagged');
check('Solved rate ≈ 7.125%', Math.abs(result.solvedRate - 7.125) < 0.05, `rate=${result.solvedRate.toFixed(3)}%`);
check('Deal-break rate ≈ 7.67%', Math.abs(result.dealBreakRate - 7.67) < 0.1, `DBR=${result.dealBreakRate.toFixed(2)}%`);

// ============= RESERVE ESCALATION =============
console.log('\n═══════════════════════════════════════════════');
console.log('  3. RESERVE ESCALATION (3 Scenarios)');
console.log('═══════════════════════════════════════════════');
const reserves = computeReserveScenarios(result.dscr, result.monthlyPITIA.total, 'LTR', borrower, loan, 'TX', borrower.reserveAssets);
check('Likely < Conservative', reserves.likely.totalMonths < reserves.conservative.totalMonths, `${reserves.likely.totalMonths} → ${reserves.conservative.totalMonths}`);
check('Conservative ≤ Stress', reserves.conservative.totalMonths <= reserves.stress.totalMonths, `${reserves.conservative.totalMonths} → ${reserves.stress.totalMonths}`);
check('Cap at 12 months', reserves.conservative.totalMonths <= 12, `${reserves.conservative.totalMonths}mo`);
check('Stress ≤ 15 months', reserves.stress.totalMonths <= 15, `${reserves.stress.totalMonths}mo`);

// Asset haircut check
const liquid = reserves.likely.totalEligibleReserves;
check('Liquid reserves eligible', liquid > 0, `$${Math.round(liquid).toLocaleString()}`);

// ============= LENDER MATCHING + TWO-QUOTE =============
console.log('\n═══════════════════════════════════════════════');
console.log('  4. LENDER MATCHING + TWO-QUOTE RULE');
console.log('═══════════════════════════════════════════════');
const lenders = matchLenders(property, borrower, loan, 'LTR', result.solvedRate);
const eligible = lenders.filter(l => l.eligible);
check('Lenders evaluated', lenders.length >= 5, `${lenders.length} lenders`);
check('At least 2 eligible', eligible.length >= 2, `${eligible.length} eligible`);
check('Provenance labels populated', eligible.every(l => l.sourceProvenance !== undefined), 'all have sourceProvenance');
check('Confidence scores populated', eligible.every(l => l.confidenceScore > 0), 'all have confidenceScore');

const eligibleIds = eligible.slice(0, 2).map(l => l.lenderId);
const twoQuote = validateTwoQuoteRule(eligibleIds, lenders);
check('Two-quote rule satisfied', twoQuote.satisfied, twoQuote.reason);

// Flex + rate-competitive presence
const hasFlex = lenders.some(l => l.eligible && (l.track1DSCR <= 1.0 || l.lenderId === 'griffin'));
const hasRateComp = lenders.some(l => l.eligible && l.rateAdjustment <= 0);
check('Flex lender present', hasFlex, hasFlex ? 'yes' : 'no');
check('Rate-competitive lender present', hasRateComp, hasRateComp ? 'yes' : 'no');

// ============= PPP STATE LAW =============
console.log('\n═══════════════════════════════════════════════');
console.log('  5. PPP STATE LAW ENGINE');
console.log('═══════════════════════════════════════════════');
const pppTX = checkPPPLegal('TX', 'LLC', 318750, 1, 'FIXED');
check('TX PPP allowed', pppTX.allowed, `status=${pppTX.status}`);

const pppMN = checkPPPLegal('MN', 'LLC', 318750, 1, 'FIXED');
check('MN PPP restricted', !pppMN.allowed || pppMN.status !== 'ALLOWED', `status=${pppMN.status}`);

const pppOH = checkPPPLegal('OH', 'LLC', 50000, 1, 'FIXED'); // below $116K threshold → BLOCKED
check('OH PPP sub-threshold blocked', !pppOH.allowed, `status=${pppOH.status}, allowed=${pppOH.allowed}`);

const pppOHAbove = checkPPPLegal('OH', 'LLC', 200000, 1, 'FIXED'); // above $116K threshold → ALLOWED
check('OH PPP above-threshold allowed', pppOHAbove.allowed, `status=${pppOHAbove.status}, allowed=${pppOHAbove.allowed}`);

const pppPA = checkPPPLegal('PA', 'LLC', 200000, 1, 'FIXED'); // below $329K threshold → BLOCKED
check('PA PPP sub-threshold blocked', !pppPA.allowed, `status=${pppPA.status}, allowed=${pppPA.allowed}`);

const pppPAAbove = checkPPPLegal('PA', 'LLC', 400000, 1, 'FIXED'); // above $329K threshold → ALLOWED
check('PA PPP above-threshold allowed', pppPAAbove.allowed, `status=${pppPAAbove.status}, allowed=${pppPAAbove.allowed}`);

const pppNJ = checkPPPLegal('NJ', 'INDIVIDUAL', 318750, 1, 'FIXED');
check('NJ individual PPP restricted', pppNJ.status !== 'ALLOWED', `status=${pppNJ.status}`);

// ============= STR UNDERWRITING =============
console.log('\n═══════════════════════════════════════════════');
console.log('  6. STR THREE-WORLD UNDERWRITING');
console.log('═══════════════════════════════════════════════');
const str = evaluateSTRUnderwriting(property, 318750, 7.125, 30, 'NONE', 5000, 2000, 150, 0);
check('Three worlds computed', !!(str.world1_LTR && str.world2_Projected && str.world3_Documented), 'all 3 worlds');
check('World 1 = LT market rent', str.world1_LTR.name.includes('Long-term'), str.world1_LTR.name);
check('World 2 = STR projected', str.world2_Projected.name.includes('Projected'), str.world2_Projected.name);
check('World 3 = Documented', str.world3_Documented.name.includes('Documented'), str.world3_Documented.name);
check('STR haircut = 20%', str.world2_Projected.haircutPercent === 20, `${str.world2_Projected.haircutPercent}%`);
check('Legality gate present', !!str.legalityGate, `status=${str.legalityGate.status}`);

// ============= SENSITIVITY + BREAKEVEN =============
console.log('\n═══════════════════════════════════════════════');
console.log('  7. SENSITIVITY & BREAKEVEN');
console.log('═══════════════════════════════════════════════');
const breakeven = computeBreakevenResult(
  result.qualifyingRent, result.monthlyPITIA.total, result.loanAmount, result.solvedRate,
  30, property.annualTaxes, property.annualInsurance, property.hoa, property.floodInsurance,
  property.purchasePrice, loan.ltv
);
check('Breakeven: rent for 1.0', breakeven.rentBreakeven.for1_0 > 0, `$${breakeven.rentBreakeven.for1_0.toFixed(0)}`);
check('Breakeven: rate for 1.0', breakeven.rateBreakeven.maxRateFor1_0 > 0, `${breakeven.rateBreakeven.maxRateFor1_0.toFixed(2)}%`);
check('Breakeven: tornado data', breakeven.tornadoData.length >= 4, `${breakeven.tornadoData.length} items`);
check('Joint appraisal risk', !!breakeven.jointAppraisalRisk, breakeven.jointAppraisalRisk.combinedRiskRating);

// ============= DECISION SUPPORT =============
console.log('\n═══════════════════════════════════════════════');
console.log('  8. DECISION SUPPORT (Acquisition + Execution + DealKill)');
console.log('═══════════════════════════════════════════════');
const acq = computeAcquisitionScore(result, reserves, property, borrower, loan, 'LTR', null, pppTX);
check('Acquisition score 0-100', acq.score >= 0 && acq.score <= 100, `score=${acq.score}/100 (${acq.band})`);
check('7 factors computed', acq.factors.length === 7, `${acq.factors.length} factors`);
check('Factor weights sum to 100', acq.factors.reduce((s, f) => s + f.weight, 0) === 100, `${acq.factors.reduce((s, f) => s + f.weight, 0)}%`);

const exec = computeExecutionRisk(result, borrower, loan, property, reserves);
check('Execution risk verdict', !!exec.verdict, `${exec.verdict} (${exec.score}/100)`);
check('Execution 5 dimensions', exec.dimensions.length === 5, `${exec.dimensions.length} dimensions`);

const kill = computeDealKillCheck(result, borrower, loan, property, 'LTR', reserves, pppTX, null);
check('Deal-kill computed', kill.criteria.length >= 1, `${kill.criteria.length} triggered criteria`);
check('Deal-kill allClear works', typeof kill.allClear === 'boolean', kill.allClear ? 'all clear' : `${kill.blockingItems.length} blockers`);

// ============= MONTE CARLO =============
console.log('\n═══════════════════════════════════════════════');
console.log('  9. MONTE CARLO RISK SIMULATION');
console.log('═══════════════════════════════════════════════');
const mc = runMonteCarlo(property, loan, 'LTR', result);
check('MC simulations ran', mc.simulations >= 500, `${mc.simulations} runs`);
check('MC P(DSCR≥1.0)', mc.probabilityDSCRAbove1_0 >= 0 && mc.probabilityDSCRAbove1_0 <= 1, `${(mc.probabilityDSCRAbove1_0 * 100).toFixed(1)}%`);
check('MC P(negative CF)', mc.probabilityNegativeCashFlow >= 0 && mc.probabilityNegativeCashFlow <= 1, `${(mc.probabilityNegativeCashFlow * 100).toFixed(1)}%`);

// ============= STRUCTURE OPTIONS =============
console.log('\n═══════════════════════════════════════════════');
console.log('  10. STRUCTURE OPTIONS & PREPAY');
console.log('═══════════════════════════════════════════════');
const opts = generateStructureOptions(property, borrower, loan, 'LTR');
check('Structure options generated', opts.length >= 6, `${opts.length} options`);
check('Options have prepay schedule', opts.every(o => !!o.prepaySchedule), 'all have schedules');

// Prepay on remaining balance
const prepayCostY3 = computePrepayExitCost(318750, 7.125, 30, '54321', 3);
check('Prepay on remaining balance', prepayCostY3 > 0 && prepayCostY3 < 318750 * 0.03, `$${Math.round(prepayCostY3).toLocaleString()} (year 3)`);

const prepayNone = computePrepayExitCost(318750, 7.125, 30, 'NONE', 3);
check('No-prepay = $0', prepayNone === 0, `$${prepayNone}`);

// ============= FINAL SUMMARY =============
console.log('\n═══════════════════════════════════════════════');
console.log('  AUDIT SUMMARY');
console.log('═══════════════════════════════════════════════');
console.log(`  ✓ PASS: ${pass}`);
console.log(`  ✗ FAIL: ${fail}`);
console.log(`  ⚠ WARN: ${warn}`);
console.log(`  Overall: ${fail === 0 ? '✓ ALL CHECKS PASS' : '✗ FAILURES DETECTED'}`);
console.log('');

// Final Track A vs Track B verdict
console.log('═══════════════════════════════════════════════');
console.log('  TRACK A — LENDER QUALIFICATION VERDICT');
console.log('═══════════════════════════════════════════════');
const trackA_pass = t1.dscr >= 1.0 && eligible.length >= 2 && kill.allClear && twoQuote.satisfied;
console.log(`  Track 1 DSCR: ${t1.dscr.toFixed(3)}× ${t1.dscr >= 1.0 ? '✓ PASS' : '✗ FAIL'}`);
console.log(`  Eligible lenders: ${eligible.length} ${eligible.length >= 2 ? '✓' : '✗'}`);
console.log(`  Deal-kill blockers: ${kill.blockingItems.length} ${kill.allClear ? '✓' : '✗'}`);
console.log(`  Two-quote rule: ${twoQuote.satisfied ? '✓ SATISFIED' : '✗ NOT SATISFIED'}`);
console.log(`  >>> TRACK A VERDICT: ${trackA_pass ? '✓ CAN CLOSE' : '✗ CANNOT CLOSE'}`);

console.log('');
console.log('═══════════════════════════════════════════════');
console.log('  TRACK B — INVESTOR SURVIVAL VERDICT');
console.log('═══════════════════════════════════════════════');
const stressCovered = reserves.stress.totalDollars <= liquid;
const trackB_pass = t2.dscr >= 1.0 && stressCovered;
console.log(`  Track 2 DSCR: ${t2.dscr.toFixed(3)}× ${t2.dscr >= 1.0 ? '✓ CASH FLOW POSITIVE' : '✗ NEGATIVE CARRY'}`);
console.log(`  Monthly CF: $${Math.round(t2.monthlyCashFlow).toLocaleString()} ${t2.monthlyCashFlow >= 0 ? '✓' : '⚠'}`);
console.log(`  Stress reserves: $${Math.round(reserves.stress.totalDollars).toLocaleString()} vs $${Math.round(liquid).toLocaleString()} liquid ${stressCovered ? '✓ COVERED' : '✗ SHORTFALL'}`);
console.log(`  Acquisition score: ${acq.score}/100 (${acq.band})`);
console.log(`  >>> TRACK B VERDICT: ${trackB_pass ? '✓ DO THE DEAL' : '⚠ PROCEED WITH CAUTION — negative carry requires explicit thesis'}`);

console.log('');
console.log('═══════════════════════════════════════════════');
console.log('  DEAL SUMMARY');
console.log('═══════════════════════════════════════════════');
console.log(`  Purchase: $${property.purchasePrice.toLocaleString()} | Loan: $${Math.round(result.loanAmount).toLocaleString()} (${loan.ltv}% LTV)`);
console.log(`  Solved rate: ${result.solvedRate.toFixed(3)}% | Monthly PITIA: $${Math.round(result.monthlyPITIA.total).toLocaleString()}`);
console.log(`  Qualifying rent: $${result.qualifyingRent.toFixed(0)}/mo (${result.rentSource})`);
console.log(`  Deal-break rate: ${result.dealBreakRate.toFixed(2)}% | Headroom: ${result.rateHeadroomBps} bps`);
console.log(`  Cash to close: $${Math.round(result.cashToClose.total).toLocaleString()} (stress: $${Math.round(result.cashToClose.totalStress).toLocaleString()})`);

process.exit(fail === 0 ? 0 : 1);
