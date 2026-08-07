// ============================================================
// DSCR Loan Command Center v7.0 — AUDIT 8
// Sensitivity & Breakeven Engine Verification
// Audits all 9 breakeven types, tornado levers, joint appraisal risk,
// combined stress matrix, and heatmap output.
// ============================================================

import {
  computeBreakevenResult,
  computeJointAppraisalRisk,
  computeTornado,
  computeCombinedStressMatrix,
  computeHeatmap,
  computeRentSensitivity,
  computeRateSensitivity,
  computeLTVSensitivity,
  computePriceSensitivity,
} from '../src/lib/dscr/sensitivity';
import {
  calculatePITIA,
  calculatePI,
  solveDealBreakRate,
} from '../src/lib/dscr/engine';
import type { BreakevenResult, JointAppraisalRisk, TornadoItem, ValueShockRow } from '../src/lib/dscr/types';

interface AuditCheck {
  id: string;
  description: string;
  expected: string;
  actual: string;
  pass: boolean;
}

const checks: AuditCheck[] = [];
function check(id: string, description: string, expected: string, actual: string, pass: boolean) {
  checks.push({ id, description, expected, actual, pass });
}

// ============================================================
// FLAGSHIP TEST CASE
// $425K, 75% LTV, $318,750 loan @ 7.00%, $3,000 rent,
// $5K taxes / $2K ins / $150 HOA / $0 flood
// ============================================================

const PURCHASE_PRICE = 425_000;
const LTV = 75;
const LOAN_AMOUNT = PURCHASE_PRICE * (LTV / 100); // $318,750
const RATE = 7.00;
const TERM_YEARS = 30;
const QUALIFYING_RENT = 3_000;
const ANNUAL_TAXES = 5_000;
const ANNUAL_INSURANCE = 2_000;
const HOA = 150;
const FLOOD_INSURANCE = 0;

const pitiaBreakdown = calculatePITIA(LOAN_AMOUNT, RATE, TERM_YEARS, 'NONE', ANNUAL_TAXES, ANNUAL_INSURANCE, HOA, FLOOD_INSURANCE);
const PITIA = pitiaBreakdown.total;

console.log('═══════════════════════════════════════════════');
console.log('  AUDIT 8 — SENSITIVITY & BREAKEVEN VERIFICATION');
console.log('═══════════════════════════════════════════════');
console.log(`Flagship: $${PURCHASE_PRICE.toLocaleString()} @ ${LTV}% LTV, loan $${LOAN_AMOUNT.toLocaleString()}, rate ${RATE}%, rent $${QUALIFYING_RENT}/mo`);
console.log(`PITIA = $${PITIA.toFixed(2)} (P&I $${pitiaBreakdown.principalAndInterest.toFixed(2)} + taxes $${pitiaBreakdown.taxes.toFixed(2)} + ins $${pitiaBreakdown.insurance.toFixed(2)} + HOA $${HOA})`);
console.log('');

// Compute the full breakeven result
const breakeven: BreakevenResult = computeBreakevenResult(
  QUALIFYING_RENT, PITIA, LOAN_AMOUNT, RATE, TERM_YEARS,
  ANNUAL_TAXES, ANNUAL_INSURANCE, HOA, FLOOD_INSURANCE,
  PURCHASE_PRICE, LTV,
);

// ============================================================
// A. BreakevenResult has all 7+ sub-objects
// ============================================================
console.log('── A. BreakevenResult structure ──────────────────');
check('A1', 'rentBreakeven present', 'object', typeof breakeven.rentBreakeven, !!breakeven.rentBreakeven && typeof breakeven.rentBreakeven === 'object');
check('A2', 'priceBreakeven present', 'object', typeof breakeven.priceBreakeven, !!breakeven.priceBreakeven && typeof breakeven.priceBreakeven === 'object');
check('A3', 'ltvBreakeven present', 'object', typeof breakeven.ltvBreakeven, !!breakeven.ltvBreakeven && typeof breakeven.ltvBreakeven === 'object');
check('A4', 'rateBreakeven present', 'object', typeof breakeven.rateBreakeven, !!breakeven.rateBreakeven && typeof breakeven.rateBreakeven === 'object');
check('A5', 'structureBreakeven present', 'object', typeof breakeven.structureBreakeven, !!breakeven.structureBreakeven && typeof breakeven.structureBreakeven === 'object');
check('A6', 'taxInsuranceBreakeven present', 'object', typeof breakeven.taxInsuranceBreakeven, !!breakeven.taxInsuranceBreakeven && typeof breakeven.taxInsuranceBreakeven === 'object');
check('A7', 'pathTo1_25 present', 'object', typeof breakeven.pathTo1_25, !!breakeven.pathTo1_25 && typeof breakeven.pathTo1_25 === 'object');
check('A8', 'tornadoData present (array)', 'array', Array.isArray(breakeven.tornadoData) ? `array(${breakeven.tornadoData.length})` : typeof breakeven.tornadoData, Array.isArray(breakeven.tornadoData));
check('A9', 'jointAppraisalRisk present', 'object', typeof breakeven.jointAppraisalRisk, !!breakeven.jointAppraisalRisk && typeof breakeven.jointAppraisalRisk === 'object');

const subObjectCount = ['rentBreakeven','priceBreakeven','ltvBreakeven','rateBreakeven','structureBreakeven','taxInsuranceBreakeven','pathTo1_25','tornadoData','jointAppraisalRisk']
  .filter(k => (breakeven as any)[k] !== undefined).length;
check('A10', 'All 9 sub-objects present (7 breakevens + tornado + joint appraisal)', '9', String(subObjectCount), subObjectCount === 9);

// ============================================================
// B. Rent breakeven: gross rent required for DSCR 1.0, 1.10, 1.25
// ============================================================
console.log('── B. Rent breakeven ─────────────────────────────');
console.log(`  for1_0  = $${breakeven.rentBreakeven.for1_0}  (expected ~$2,855 = PITIA)`);
console.log(`  for1_10 = $${breakeven.rentBreakeven.for1_10}`);
console.log(`  for1_25 = $${breakeven.rentBreakeven.for1_25}`);
check('B1', 'rentBreakeven.for1_0 ≈ PITIA ($2,855 ±5)', '2855±5', String(breakeven.rentBreakeven.for1_0), Math.abs(breakeven.rentBreakeven.for1_0 - 2855) <= 5);
check('B2', 'rentBreakeven.for1_0 equals PITIA rounded', String(Math.round(PITIA)), String(breakeven.rentBreakeven.for1_0), breakeven.rentBreakeven.for1_0 === Math.round(PITIA));
check('B3', 'rentBreakeven.for1_10 = PITIA × 1.10', String(Math.round(PITIA * 1.10)), String(breakeven.rentBreakeven.for1_10), breakeven.rentBreakeven.for1_10 === Math.round(PITIA * 1.10));
check('B4', 'rentBreakeven.for1_25 = PITIA × 1.25', String(Math.round(PITIA * 1.25)), String(breakeven.rentBreakeven.for1_25), breakeven.rentBreakeven.for1_25 === Math.round(PITIA * 1.25));
check('B5', 'for1_0 < for1_10 < for1_25 (monotonic)', 'for1_0 < for1_10 < for1_25', `${breakeven.rentBreakeven.for1_0} < ${breakeven.rentBreakeven.for1_10} < ${breakeven.rentBreakeven.for1_25}`, breakeven.rentBreakeven.for1_0 < breakeven.rentBreakeven.for1_10 && breakeven.rentBreakeven.for1_10 < breakeven.rentBreakeven.for1_25);

// ============================================================
// C. Price breakeven: max purchase price at target DSCR
// ============================================================
console.log('── C. Price breakeven ────────────────────────────');
console.log(`  for1_0  = $${breakeven.priceBreakeven.for1_0.toLocaleString()}`);
console.log(`  for1_10 = $${breakeven.priceBreakeven.for1_10.toLocaleString()}`);
console.log(`  for1_25 = $${breakeven.priceBreakeven.for1_25.toLocaleString()}`);
check('C1', 'priceBreakeven.for1_0 > 0', '>0', String(breakeven.priceBreakeven.for1_0), breakeven.priceBreakeven.for1_0 > 0);
check('C2', 'priceBreakeven.for1_0 > current price ($425K) — deal passes at 1.0', '>425000', String(breakeven.priceBreakeven.for1_0), breakeven.priceBreakeven.for1_0 > PURCHASE_PRICE);
check('C3', 'priceBreakeven monotonic (for1_0 > for1_10 > for1_25)', 'for1_0 > for1_10 > for1_25', `${breakeven.priceBreakeven.for1_0} > ${breakeven.priceBreakeven.for1_10} > ${breakeven.priceBreakeven.for1_25}`, breakeven.priceBreakeven.for1_0 > breakeven.priceBreakeven.for1_10 && breakeven.priceBreakeven.for1_10 > breakeven.priceBreakeven.for1_25);

// ============================================================
// D. LTV breakeven: max LTV at target DSCR + additional down payment needed
// ============================================================
console.log('── D. LTV breakeven ──────────────────────────────');
console.log(`  for1_0  LTV = ${breakeven.ltvBreakeven.for1_0}%`);
console.log(`  for1_10 LTV = ${breakeven.ltvBreakeven.for1_10}%`);
console.log(`  for1_25 LTV = ${breakeven.ltvBreakeven.for1_25}%`);
console.log(`  additionalDown for1_25 = $${breakeven.ltvBreakeven.additionalDown.for1_25.toLocaleString()}`);
check('D1', 'ltvBreakeven.for1_0 > current 75% (deal passes at 1.0)', '>75', String(breakeven.ltvBreakeven.for1_0), breakeven.ltvBreakeven.for1_0 > LTV);
check('D2', 'ltvBreakeven monotonic (for1_0 > for1_10 > for1_25)', 'for1_0 > for1_10 > for1_25', `${breakeven.ltvBreakeven.for1_0} > ${breakeven.ltvBreakeven.for1_10} > ${breakeven.ltvBreakeven.for1_25}`, breakeven.ltvBreakeven.for1_0 > breakeven.ltvBreakeven.for1_10 && breakeven.ltvBreakeven.for1_10 > breakeven.ltvBreakeven.for1_25);
check('D3', 'additionalDown sub-object has for1_0/for1_10/for1_25', '3 fields', Object.keys(breakeven.ltvBreakeven.additionalDown).join(','), ['for1_0','for1_10','for1_25'].every(k => (breakeven.ltvBreakeven.additionalDown as any)[k] !== undefined));
check('D4', 'additionalDown.for1_25 >= 0', '>=0', String(breakeven.ltvBreakeven.additionalDown.for1_25), breakeven.ltvBreakeven.additionalDown.for1_25 >= 0);

// ============================================================
// E. Rate breakeven: max rate for DSCR 1.0, 1.10, 1.25 (deal-break rate is 1.0 case)
// ============================================================
console.log('── E. Rate breakeven (deal-break rate) ───────────');
console.log(`  maxRateFor1_0  = ${breakeven.rateBreakeven.maxRateFor1_0}% (deal-break rate)`);
console.log(`  maxRateFor1_10 = ${breakeven.rateBreakeven.maxRateFor1_10}%`);
console.log(`  maxRateFor1_25 = ${breakeven.rateBreakeven.maxRateFor1_25}%`);

// Compute deal-break rate directly
const dealBreakRate = solveDealBreakRate(QUALIFYING_RENT, LOAN_AMOUNT, TERM_YEARS, 'NONE', ANNUAL_TAXES, ANNUAL_INSURANCE, HOA, FLOOD_INSURANCE);
console.log(`  direct solveDealBreakRate() = ${dealBreakRate}%`);
check('E1', 'rateBreakeven.maxRateFor1_0 ≈ 7.67% (deal-break rate)', '7.67±0.1', String(breakeven.rateBreakeven.maxRateFor1_0), Math.abs(breakeven.rateBreakeven.maxRateFor1_0 - 7.67) <= 0.1);
check('E2', 'rateBreakeven.maxRateFor1_0 == solveDealBreakRate() (deal-break rate)', String(dealBreakRate), String(breakeven.rateBreakeven.maxRateFor1_0), breakeven.rateBreakeven.maxRateFor1_0 === dealBreakRate);
check('E3', 'maxRateFor1_0 > current 7.00% (deal passes at 1.0)', '>7.00', String(breakeven.rateBreakeven.maxRateFor1_0), breakeven.rateBreakeven.maxRateFor1_0 > RATE);
check('E4', 'rateBreakeven monotonic (1_0 > 1_10 > 1_25)', '1_0 > 1_10 > 1_25', `${breakeven.rateBreakeven.maxRateFor1_0} > ${breakeven.rateBreakeven.maxRateFor1_10} > ${breakeven.rateBreakeven.maxRateFor1_25}`, breakeven.rateBreakeven.maxRateFor1_0 > breakeven.rateBreakeven.maxRateFor1_10 && breakeven.rateBreakeven.maxRateFor1_10 > breakeven.rateBreakeven.maxRateFor1_25);

// ============================================================
// F. Structure breakeven: DSCR with IO vs 40yr, IO recast payment + DSCR at recast
// ============================================================
console.log('── F. Structure breakeven (IO vs 40yr) ───────────');
console.log(`  dscrWithIO       = ${breakeven.structureBreakeven.dscrWithIO}`);
console.log(`  dscrWith40yr     = ${breakeven.structureBreakeven.dscrWith40yr}`);
console.log(`  monthlySavingsIO = $${breakeven.structureBreakeven.monthlySavingsIO}`);
console.log(`  ioRecastPayment  = $${breakeven.structureBreakeven.ioRecastPayment}`);
console.log(`  ioRecastDSCR     = ${breakeven.structureBreakeven.ioRecastDSCR}`);
check('F1', 'structureBreakeven.dscrWithIO > dscrWith40yr (IO has lower P&I)', 'IO > 40yr', `${breakeven.structureBreakeven.dscrWithIO} > ${breakeven.structureBreakeven.dscrWith40yr}`, breakeven.structureBreakeven.dscrWithIO > breakeven.structureBreakeven.dscrWith40yr);
check('F2', 'ioRecastPayment present and > 0', '>0', String(breakeven.structureBreakeven.ioRecastPayment), breakeven.structureBreakeven.ioRecastPayment > 0);
check('F3', 'ioRecastDSCR present (Track 1 DSCR after IO expires)', 'number', String(breakeven.structureBreakeven.ioRecastDSCR), typeof breakeven.structureBreakeven.ioRecastDSCR === 'number');
check('F4', 'ioRecastDSCR < dscrWithIO (recast is worse than IO period)', 'recast < IO', `${breakeven.structureBreakeven.ioRecastDSCR} < ${breakeven.structureBreakeven.dscrWithIO}`, breakeven.structureBreakeven.ioRecastDSCR < breakeven.structureBreakeven.dscrWithIO);
check('F5', 'ioRecastDSCR ≈ 0.94 (recast over 20yr after 10yr IO)', '0.93-0.95', String(breakeven.structureBreakeven.ioRecastDSCR), breakeven.structureBreakeven.ioRecastDSCR >= 0.93 && breakeven.structureBreakeven.ioRecastDSCR <= 0.95);
check('F6', 'monthlySavingsIO > 0 (IO payment < amortizing)', '>0', String(breakeven.structureBreakeven.monthlySavingsIO), breakeven.structureBreakeven.monthlySavingsIO > 0);

// ============================================================
// G. Tax/insurance breakeven: tax appeal needed, insurance reshop needed
// ============================================================
console.log('── G. Tax/Insurance breakeven ────────────────────');
console.log(`  taxAppealNeeded        = $${breakeven.taxInsuranceBreakeven.taxAppealNeeded}`);
console.log(`  insuranceReshopNeeded  = $${breakeven.taxInsuranceBreakeven.insuranceReshopNeeded}`);
check('G1', 'taxAppealNeeded >= 0', '>=0', String(breakeven.taxInsuranceBreakeven.taxAppealNeeded), breakeven.taxInsuranceBreakeven.taxAppealNeeded >= 0);
check('G2', 'insuranceReshopNeeded >= 0', '>=0', String(breakeven.taxInsuranceBreakeven.insuranceReshopNeeded), breakeven.taxInsuranceBreakeven.insuranceReshopNeeded >= 0);

// ============================================================
// H. Path to 1.25: required rent increase / price reduction / additional down / rate buydown
// ============================================================
console.log('── H. Path to 1.25 ───────────────────────────────');
console.log(`  requiredRentIncrease     = $${breakeven.pathTo1_25.requiredRentIncrease}/mo`);
console.log(`  requiredPriceReduction   = $${breakeven.pathTo1_25.requiredPriceReduction.toLocaleString()}`);
console.log(`  requiredAdditionalDown   = $${breakeven.pathTo1_25.requiredAdditionalDown.toLocaleString()}`);
console.log(`  requiredRateBuydown      = ${breakeven.pathTo1_25.requiredRateBuydown}%`);
console.log(`  bestSingleFix.action     = ${breakeven.pathTo1_25.bestSingleFix.action}`);
console.log(`  bestCombination.actions  = ${breakeven.pathTo1_25.bestCombination.actions.join('; ')}`);
check('H1', 'pathTo1_25.targetDSCR = 1.25', '1.25', String(breakeven.pathTo1_25.targetDSCR), breakeven.pathTo1_25.targetDSCR === 1.25);
check('H2', 'requiredRentIncrease = PITIA × 1.25 − rent', String(Math.round(PITIA * 1.25 - QUALIFYING_RENT)), String(breakeven.pathTo1_25.requiredRentIncrease), breakeven.pathTo1_25.requiredRentIncrease === Math.round(PITIA * 1.25 - QUALIFYING_RENT));
check('H3', 'requiredRentIncrease > 0 (current DSCR < 1.25)', '>0', String(breakeven.pathTo1_25.requiredRentIncrease), breakeven.pathTo1_25.requiredRentIncrease > 0);
check('H4', 'requiredPriceReduction > 0', '>0', String(breakeven.pathTo1_25.requiredPriceReduction), breakeven.pathTo1_25.requiredPriceReduction > 0);
check('H5', 'requiredAdditionalDown > 0', '>0', String(breakeven.pathTo1_25.requiredAdditionalDown), breakeven.pathTo1_25.requiredAdditionalDown > 0);
check('H6', 'requiredRateBuydown > 0', '>0', String(breakeven.pathTo1_25.requiredRateBuydown), breakeven.pathTo1_25.requiredRateBuydown > 0);
check('H7', 'bestSingleFix has action/amount/cost', '3 fields', Object.keys(breakeven.pathTo1_25.bestSingleFix).join(','), ['action','amount','cost'].every(k => (breakeven.pathTo1_25.bestSingleFix as any)[k] !== undefined));
check('H8', 'bestCombination has actions[] and totalCost', '2 fields', Object.keys(breakeven.pathTo1_25.bestCombination).join(','), ['actions','totalCost'].every(k => (breakeven.pathTo1_25.bestCombination as any)[k] !== undefined));

// ============================================================
// I. Tornado diagram: lever, current/low/high values, DSCR at low/high, impact
// ============================================================
console.log('── I. Tornado diagram ────────────────────────────');
console.log(`  ${breakeven.tornadoData.length} levers (sorted by impact):`);
for (const t of breakeven.tornadoData) {
  console.log(`    ${t.lever.padEnd(18)} current=${t.currentValue}  low=${t.lowValue}  high=${t.highValue}  DSCR@low=${t.dscrAtLow}  DSCR@high=${t.dscrAtHigh}  impact=${t.impact}`);
}
check('I1', 'Tornado has ≥6 levers (rent, rate, LTV, price, taxes, insurance)', '>=6', String(breakeven.tornadoData.length), breakeven.tornadoData.length >= 6);
const leverNames = breakeven.tornadoData.map(t => t.lever);
check('I2', 'Tornado includes Rent lever', 'Rent', String(leverNames.includes('Rent')), leverNames.includes('Rent'));
check('I3', 'Tornado includes Rate lever', 'Rate', String(leverNames.includes('Rate')), leverNames.includes('Rate'));
check('I4', 'Tornado includes LTV lever', 'LTV', String(leverNames.includes('LTV')), leverNames.includes('LTV'));
check('I5', 'Tornado includes Price lever', 'Price', String(leverNames.includes('Price')), leverNames.includes('Price'));
check('I6', 'Tornado includes Taxes lever', 'Taxes', String(leverNames.includes('Taxes')), leverNames.includes('Taxes'));
check('I7', 'Tornado includes Insurance lever', 'Insurance', String(leverNames.includes('Insurance')), leverNames.includes('Insurance'));
check('I8', 'Tornado also includes HOA lever (since HOA=$150>0)', 'HOA', String(leverNames.includes('HOA')), leverNames.includes('HOA'));
check('I9', 'Each TornadoItem has all 7 fields (lever, currentValue, lowValue, highValue, dscrAtLow, dscrAtHigh, impact)', '7 fields', breakeven.tornadoData.map(t => Object.keys(t).length).join(','), breakeven.tornadoData.every(t => ['lever','currentValue','lowValue','highValue','dscrAtLow','dscrAtHigh','impact'].every(k => (t as any)[k] !== undefined)));
check('I10', 'Tornado sorted by impact descending', 'descending', breakeven.tornadoData.map(t => t.impact).join(','), breakeven.tornadoData.every((t, i) => i === 0 || breakeven.tornadoData[i - 1].impact >= t.impact));
// Verify LTV lever math: LTV -5% → lower loan → lower P&I → higher DSCR; LTV +5% → higher loan → higher P&I → lower DSCR
const ltvLever = breakeven.tornadoData.find(t => t.lever === 'LTV');
if (ltvLever) {
  check('I11', 'LTV lever: dscrAtHigh (lower LTV) > dscrAtLow (higher LTV)', 'dscrAtHigh > dscrAtLow', `${ltvLever.dscrAtHigh} > ${ltvLever.dscrAtLow}`, ltvLever.dscrAtHigh > ltvLever.dscrAtLow);
}
const priceLever = breakeven.tornadoData.find(t => t.lever === 'Price');
if (priceLever) {
  check('I12', 'Price lever: dscrAtHigh (lower price) > dscrAtLow (higher price)', 'dscrAtHigh > dscrAtLow', `${priceLever.dscrAtHigh} > ${priceLever.dscrAtLow}`, priceLever.dscrAtHigh > priceLever.dscrAtLow);
}

// ============================================================
// J. Joint appraisal risk: rent breakpoint, value shock table, combined risk rating
// ============================================================
console.log('── J. Joint appraisal risk ───────────────────────');
const jar: JointAppraisalRisk = breakeven.jointAppraisalRisk;
console.log(`  rentBreakpoint      = $${jar.rentBreakpoint}`);
console.log(`  rentDropPercent     = ${jar.rentDropPercent}%`);
console.log(`  combinedRiskRating  = ${jar.combinedRiskRating}`);
console.log(`  bindingConstraint   = ${jar.bindingConstraint}`);
console.log(`  valueShockTable (${jar.valueShockTable.length} rows):`);
for (const row of jar.valueShockTable) {
  console.log(`    value=$${row.appraisedValue.toLocaleString()}  maxLoan=$${row.maxLoan.toLocaleString()}  cashGap=$${row.cashGap.toLocaleString()}  dscrAtMaxLoan=${row.dscrAtMaxLoan}`);
}
check('J1', 'rentBreakpoint ≈ PITIA (rent at DSCR 1.0)', String(Math.round(PITIA)), String(jar.rentBreakpoint), jar.rentBreakpoint === Math.round(PITIA));
check('J2', 'rentDropPercent > 0 (deal has rent cushion)', '>0', String(jar.rentDropPercent), jar.rentDropPercent > 0);
check('J3', 'rentDropPercent ≈ 4.8% (flagship)', '4.5-5.5', String(jar.rentDropPercent), jar.rentDropPercent >= 4.5 && jar.rentDropPercent <= 5.5);
check('J4', 'valueShockTable has 6 rows (0, -2, -4, -6, -8, -10%)', '6', String(jar.valueShockTable.length), jar.valueShockTable.length === 6);
check('J5', 'ValueShockRow has appraisedValue/maxLoan/cashGap/dscrAtMaxLoan', '4 fields', Object.keys(jar.valueShockTable[0]).join(','), ['appraisedValue','maxLoan','cashGap','dscrAtMaxLoan'].every(k => (jar.valueShockTable[0] as any)[k] !== undefined));
check('J6', 'First row (0% shock) matches current deal', `value=$${PURCHASE_PRICE}, maxLoan=$${LOAN_AMOUNT}`, `value=$${jar.valueShockTable[0].appraisedValue}, maxLoan=$${jar.valueShockTable[0].maxLoan}`, jar.valueShockTable[0].appraisedValue === PURCHASE_PRICE && jar.valueShockTable[0].maxLoan === LOAN_AMOUNT);
check('J7', 'combinedRiskRating is one of LOW/MODERATE/HIGH/CRITICAL', 'LOW|MODERATE|HIGH|CRITICAL', jar.combinedRiskRating, ['LOW','MODERATE','HIGH','CRITICAL'].includes(jar.combinedRiskRating));
check('J8', 'bindingConstraint is one of RENT/VALUE/BOTH/NEITHER', 'RENT|VALUE|BOTH|NEITHER', jar.bindingConstraint, ['RENT','VALUE','BOTH','NEITHER'].includes(jar.bindingConstraint));
check('J9', 'summary string present and non-empty', 'non-empty', `${jar.summary.slice(0,60)}...`, typeof jar.summary === 'string' && jar.summary.length > 0);

// Combined stress test (rent -10% × value -10%)
console.log('── J-2. Combined stress test (-10% rent × -10% value) ──');
const cst = jar.combinedStressTest;
if (cst) {
  console.log(`  stressedRent      = $${cst.stressedRent}`);
  console.log(`  stressedValue     = $${cst.stressedValue.toLocaleString()}`);
  console.log(`  stressedMaxLoan   = $${cst.stressedMaxLoan.toLocaleString()}`);
  console.log(`  stressedPITIA     = $${cst.stressedPITIA}`);
  console.log(`  stressedDSCR      = ${cst.stressedDSCR}`);
  console.log(`  impliedRating     = ${cst.impliedRating}`);
  check('J10', 'combinedStressTest field present on JointAppraisalRisk', 'present', 'present', !!cst);
  check('J11', 'stressedRent = $2,700 (rent × 0.90)', '2700', String(cst.stressedRent), cst.stressedRent === 2700);
  check('J12', 'stressedValue = $382,500 (price × 0.90)', '382500', String(cst.stressedValue), cst.stressedValue === 382500);
  check('J13', 'stressedMaxLoan = $286,875 (value × 75%)', '286875', String(cst.stressedMaxLoan), cst.stressedMaxLoan === 286875);
  check('J14', 'stressedDSCR ≈ 1.02 (marginally above 1.0)', '1.0-1.1', String(cst.stressedDSCR), cst.stressedDSCR >= 1.0 && cst.stressedDSCR <= 1.1);
  check('J15', 'impliedRating is MODERATE (DSCR 1.0–1.10)', 'MODERATE', cst.impliedRating, cst.impliedRating === 'MODERATE');
  check('J16', 'impliedRating is one of LOW/MODERATE/HIGH/CRITICAL', 'LOW|MODERATE|HIGH|CRITICAL', cst.impliedRating, ['LOW','MODERATE','HIGH','CRITICAL'].includes(cst.impliedRating));
} else {
  check('J10', 'combinedStressTest field present on JointAppraisalRisk', 'present', 'MISSING', false);
}

// ============================================================
// K. Combined stress matrix output (rent × rate grid)
// ============================================================
console.log('── K. Combined stress matrix (rent × rate) ───────');
const matrix = computeCombinedStressMatrix(
  LOAN_AMOUNT, RATE, QUALIFYING_RENT,
  ANNUAL_TAXES, ANNUAL_INSURANCE, HOA, FLOOD_INSURANCE,
  TERM_YEARS,
);
console.log(`  Matrix: ${matrix.length} rate rows × ${matrix[0].rentPcts.length} rent cols`);
console.log(`  Sample: rate=${matrix[0].rateLabel} (lowest) → ${matrix[0].rentPcts.map(r => `${r.label}=${r.dscr}`).join(', ')}`);
// Find the rent -10% × rate +100bps cell
const ratePlus100Row = matrix.find(r => r.rate === RATE + 1.00);
const rentMinus10Cell = ratePlus100Row?.rentPcts.find(p => p.label === '-10%');
console.log(`  Target cell: rent -10% × rate +100bps → DSCR = ${rentMinus10Cell?.dscr ?? 'NOT FOUND'}`);
check('K1', 'Combined stress matrix has 11 rate rows (−1.50 to +1.50)', '11', String(matrix.length), matrix.length === 11);
check('K2', 'Each row has 9 rent pct columns (−20 to +20)', '9', String(matrix[0]?.rentPcts.length), matrix[0]?.rentPcts.length === 9);
check('K3', 'Matrix includes rate +100bps row', 'present', ratePlus100Row ? 'present' : 'MISSING', !!ratePlus100Row);
check('K4', 'Matrix includes rent -10% column', 'present', rentMinus10Cell ? 'present' : 'MISSING', !!rentMinus10Cell);
check('K5', 'Rent -10% × rate +100bps cell DSCR < base (1.05)', '<1.05', String(rentMinus10Cell?.dscr), (rentMinus10Cell?.dscr ?? 99) < 1.05);
check('K6', 'Base cell (rate=7%, rent=0%) DSCR ≈ 1.05', '1.05±0.02', String(matrix.find(r => r.rate === RATE)?.rentPcts.find(p => p.label === 'Base')?.dscr), Math.abs((matrix.find(r => r.rate === RATE)?.rentPcts.find(p => p.label === 'Base')?.dscr ?? 0) - 1.05) <= 0.02);

// ============================================================
// L. Heatmap output (rent × price grid with DSCR per cell)
// ============================================================
console.log('── L. Heatmap (rent × price grid) ────────────────');
const rentSteps = [2400, 2700, 2855, 3000, 3188, 3300, 3569, 3900, 4200];
const priceSteps = [380000, 400000, 415000, 425000, 440000, 460000, 480000];
const heatmap = computeHeatmap(
  rentSteps, priceSteps, LTV, RATE, TERM_YEARS,
  ANNUAL_TAXES, ANNUAL_INSURANCE, HOA, FLOOD_INSURANCE,
);
console.log(`  Heatmap: ${heatmap.length} cells (${priceSteps.length} prices × ${rentSteps.length} rents)`);
console.log(`  Sample cells (price=$425K row):`);
for (const cell of heatmap.filter(c => c.price === 425000)) {
  console.log(`    rent=$${cell.rent}  dscr=${cell.dscr}  gradient=${cell.gradient.label ?? cell.gradient.color}`);
}
check('L1', 'Heatmap has rent × price cells = 7 × 9 = 63', '63', String(heatmap.length), heatmap.length === priceSteps.length * rentSteps.length);
check('L2', 'Each HeatmapCell has rent/price/dscr/gradient', '4 fields', Object.keys(heatmap[0]).join(','), ['rent','price','dscr','gradient'].every(k => (heatmap[0] as any)[k] !== undefined));
check('L3', 'Heatmap base cell (rent=$3,000, price=$425K) DSCR ≈ 1.05', '1.05±0.02', String(heatmap.find(c => c.rent === 3000 && c.price === 425000)?.dscr), Math.abs((heatmap.find(c => c.rent === 3000 && c.price === 425000)?.dscr ?? 0) - 1.05) <= 0.02);
check('L4', 'Heatmap DSCR increases with rent (same price)', 'increasing', 'verified', heatmap.filter(c => c.price === 425000).every((c, i, arr) => i === 0 || c.dscr >= arr[i - 1].dscr));
check('L5', 'Heatmap DSCR decreases with price (same rent)', 'decreasing', 'verified', heatmap.filter(c => c.rent === 3000).every((c, i, arr) => i === 0 || c.dscr <= arr[i - 1].dscr));

// ============================================================
// M. Standalone computeTornado call (verify signature accepts purchasePrice + ltv)
// ============================================================
console.log('── M. Standalone computeTornado call ────────────');
const tornadoDirect = computeTornado(
  QUALIFYING_RENT, PITIA, LOAN_AMOUNT, RATE, TERM_YEARS,
  ANNUAL_TAXES, ANNUAL_INSURANCE, HOA, FLOOD_INSURANCE,
  PURCHASE_PRICE, LTV,
);
const leverNamesDirect = tornadoDirect.map(t => t.lever);
console.log(`  Levers: ${leverNamesDirect.join(', ')}`);
check('M1', 'Standalone computeTornado returns ≥6 levers', '>=6', String(tornadoDirect.length), tornadoDirect.length >= 6);
check('M2', 'Standalone tornado includes LTV and Price', 'LTV+Price', leverNamesDirect.filter(n => n === 'LTV' || n === 'Price').join(','), leverNamesDirect.includes('LTV') && leverNamesDirect.includes('Price'));

// Verify backward compatibility: computeTornado without purchasePrice/ltv still works (returns 5 levers)
const tornadoLegacy = computeTornado(
  QUALIFYING_RENT, PITIA, LOAN_AMOUNT, RATE, TERM_YEARS,
  ANNUAL_TAXES, ANNUAL_INSURANCE, HOA, FLOOD_INSURANCE,
);
check('M3', 'computeTornado backward-compat (no price/ltv) still returns levers', '>=4', String(tornadoLegacy.length), tornadoLegacy.length >= 4);

// ============================================================
// N. Standalone computeJointAppraisalRisk call (verify signature)
// ============================================================
console.log('── N. Standalone computeJointAppraisalRisk ───────');
const jarDirect = computeJointAppraisalRisk(
  QUALIFYING_RENT, PITIA, PURCHASE_PRICE, LTV, LOAN_AMOUNT, RATE, TERM_YEARS,
  ANNUAL_TAXES, ANNUAL_INSURANCE, HOA, FLOOD_INSURANCE,
);
console.log(`  combinedRiskRating = ${jarDirect.combinedRiskRating}`);
console.log(`  bindingConstraint  = ${jarDirect.bindingConstraint}`);
console.log(`  combinedStressTest.stressedDSCR = ${jarDirect.combinedStressTest.stressedDSCR}`);
check('N1', 'Direct computeJointAppraisalRisk returns valid JointAppraisalRisk', 'valid', jarDirect.combinedRiskRating, ['LOW','MODERATE','HIGH','CRITICAL'].includes(jarDirect.combinedRiskRating));
check('N2', 'Direct jar.combinedStressTest present', 'present', 'present', !!jarDirect.combinedStressTest);

// ============================================================
// O. Individual sensitivity functions (sanity check exports)
// ============================================================
console.log('── O. Individual sensitivity functions ──────────');
const rentSens = computeRentSensitivity(QUALIFYING_RENT, PITIA);
const rateSens = computeRateSensitivity(LOAN_AMOUNT, ANNUAL_TAXES, ANNUAL_INSURANCE, HOA, FLOOD_INSURANCE, QUALIFYING_RENT, TERM_YEARS);
const ltvSens = computeLTVSensitivity(PURCHASE_PRICE, RATE, QUALIFYING_RENT, TERM_YEARS, ANNUAL_TAXES, ANNUAL_INSURANCE, HOA, FLOOD_INSURANCE);
const priceSens = computePriceSensitivity(PURCHASE_PRICE, LTV, RATE, QUALIFYING_RENT, TERM_YEARS, ANNUAL_TAXES, ANNUAL_INSURANCE, HOA, FLOOD_INSURANCE);
console.log(`  rentSens: ${rentSens.length} rows, first DSCR = ${rentSens[0].track1DSCR}`);
console.log(`  rateSens: ${rateSens.length} rows, first DSCR = ${rateSens[0].track1DSCR}`);
console.log(`  ltvSens: ${ltvSens.length} rows, first DSCR = ${ltvSens[0].dscr}`);
console.log(`  priceSens: ${priceSens.length} rows, first DSCR = ${priceSens[0].dscr}`);
check('O1', 'computeRentSensitivity returns rows with track1DSCR + track2DSCR', 'has both', 'verified', rentSens.every(r => typeof r.track1DSCR === 'number' && typeof r.track2DSCR === 'number'));
check('O2', 'computeRateSensitivity returns rows with pi/pitia/track1DSCR', 'has all', 'verified', rateSens.every(r => typeof r.pi === 'number' && typeof r.pitia === 'number' && typeof r.track1DSCR === 'number'));
check('O3', 'computeLTVSensitivity returns rows with ltv/loan/down/pitia/dscr', 'has all', 'verified', ltvSens.every(r => typeof r.ltv === 'number' && typeof r.loan === 'number' && typeof r.down === 'number' && typeof r.dscr === 'number'));
check('O4', 'computePriceSensitivity returns rows with price/loan/pitia/dscr', 'has all', 'verified', priceSens.every(r => typeof r.price === 'number' && typeof r.loan === 'number' && typeof r.dscr === 'number'));

// ============================================================
// SUMMARY
// ============================================================
const passed = checks.filter(c => c.pass).length;
const failed = checks.length - passed;

console.log('');
console.log('═'.repeat(80));
console.log('AUDIT 8 — SENSITIVITY & BREAKEVEN VERIFICATION SUMMARY');
console.log('═'.repeat(80));
console.log(`Total checks: ${checks.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Pass rate: ${(passed / checks.length * 100).toFixed(1)}%`);
console.log('═'.repeat(80));
if (failed > 0) {
  console.log('\nFAILED CHECKS:');
  for (const c of checks.filter(c => !c.pass)) {
    console.log(`  ❌ ${c.id}: ${c.description}`);
    console.log(`     Expected: ${c.expected}`);
    console.log(`     Actual:   ${c.actual}`);
  }
}
console.log('');
process.exit(failed === 0 ? 0 : 1);
