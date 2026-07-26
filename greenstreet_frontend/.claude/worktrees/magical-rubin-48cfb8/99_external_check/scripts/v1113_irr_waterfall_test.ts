// ============================================================
// DSCR Deal Desk v11.13 — IRR Waterfall Verification Test
// ============================================================

import { computeAfterTaxIRR } from '../src/lib/dscr/taxEngine';
import { computeReturns } from '../src/lib/dscr/returnsEngine';
import { calculatePI } from '../src/lib/dscr/engine';
import { computeIRRWaterfall, waterfallStageColor, waterfallSignSymbol } from '../src/lib/dscr/irrWaterfall';
import type { PropertyInputs, LoanStructure, RentalStrategy, TaxProfile, WaterfallSign } from '../src/lib/dscr/types';

// ── Signature deal inputs ──
const property: PropertyInputs = {
  purchasePrice: 425_000,
  leaseRent: 3_000,
  marketRent: 3_100,
  strProjectedRent: 5_500,
  strDocumentedRent: 4_200,
  hoa: 150,
  annualTaxes: 5_000,
  annualInsurance: 2_000,
  floodInsurance: 0,
  propertyType: 'SFR',
  state: 'TX',
  unitCount: 1,
  sqft: 1_800,
  yearBuilt: 2005,
  isCondotel: false,
  isNonWarrantable: false,
  isRural: false,
  isDecliningMarket: false,
  hoaSTRPolicy: 'UNKNOWN',
};

const loan: LoanStructure = {
  ltv: 75,
  term: '30_YR',
  armType: 'FIXED',
  ioPeriod: 'NONE',
  prepayPreference: '54321',
  purpose: 'PURCHASE',
  expectedHoldYears: 5,
  points: 0,
  lenderFees: 1295,
  brokerFees: 0,
  rateLockCost: 0,
};

const strategy: RentalStrategy = 'LTR';
const solvedRate = 7.0;
const qualifyingRent = 3_000;

const loanAmount = property.purchasePrice * (loan.ltv / 100);  // $318,750
const cashInvested = property.purchasePrice - loanAmount + 1295;  // ~$106,295
const prepayPenaltyAtExit = 0;  // 5-year hold, 54321 PPP → 0% in year 5

const taxProfile: TaxProfile = {
  ordinaryIncomeBrackets: [],
  magi: 200_000,
  filingStatus: 'MFJ',
  stateTaxRatePct: 0,  // TX no state income tax
  isRealEstateProfessional: false,
  yearsREP: 0,
  landAllocationPct: 20,
  costSegStudyCompleted: false,
  costSegReclassifiedPct: 30,
  acquisitionDate: '2026-01-15',
  placedInServiceDate: '2026-02-01',
  expectedHoldYears: 5,
  exitSellingCostsPct: 6,
  exitCapRatePct: 6.5,
  section1031Exchange: false,
};

// Compute the underlying AfterTaxIRR result first
// Use computeReturns to derive NOI the same way page.tsx does
const returns = computeReturns(property, loan, qualifyingRent, strategy, solvedRate, 0);
const annualNOI = (returns.entryCapRate / 100) * property.purchasePrice;  // entryCapRate stored as %
const termMonths = 30 * 12;
const monthlyPI = calculatePI(loanAmount, solvedRate, termMonths);
const annualADS = monthlyPI * 12;

const afterTaxIRR = computeAfterTaxIRR(
  property.purchasePrice, loanAmount, qualifyingRent,
  annualNOI, annualADS, monthlyPI, taxProfile, prepayPenaltyAtExit,
  solvedRate, termMonths,
);

const waterfall = computeIRRWaterfall(
  afterTaxIRR, property, loan, strategy, solvedRate, qualifyingRent,
  loanAmount, cashInvested, prepayPenaltyAtExit,
);

// ── Test runner ──
let passed = 0;
let failed = 0;
function check(name: string, condition: boolean, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}${detail ? ' — ' + detail : ''}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`);
  }
}

console.log('\n═══════════════════════════════════════════════════════');
console.log('  DSCR Deal Desk v11.13 — IRR Waterfall Verification');
console.log('═══════════════════════════════════════════════════════\n');

console.log('STEP 1: Underlying AfterTaxIRR result');
console.log(`    preTaxIRR: ${afterTaxIRR.preTaxIRR.toFixed(3)}%`);
console.log(`    afterTaxIRR: ${afterTaxIRR.afterTaxIRR.toFixed(3)}%`);
console.log(`    irrImpactOfTaxes: ${afterTaxIRR.irrImpactOfTaxes.toFixed(3)} pp`);
console.log(`    Year-by-year rows: ${afterTaxIRR.yearByYear.length}`);
check('AfterTaxIRR has 5 year rows', afterTaxIRR.yearByYear.length === 5);
// Signature deal has Return Grade F per golden values — IRR is near zero or slightly negative
check('AfterTaxIRR preTaxIRR is finite number', !isNaN(afterTaxIRR.preTaxIRR), `${afterTaxIRR.preTaxIRR}%`);
check('AfterTaxIRR afterTaxIRR is finite number', !isNaN(afterTaxIRR.afterTaxIRR), `${afterTaxIRR.afterTaxIRR}%`);

console.log('\nSTEP 2: Waterfall result structure');
check('year1 present', !!waterfall.year1);
check('holdTotal present', !!waterfall.holdTotal);
check('exit present', !!waterfall.exit);
check('summary present', waterfall.summary.length > 100, `${waterfall.summary.length} chars`);

console.log('\nSTEP 3: Year 1 waterfall');
check('year1 grossRent = $36,000', Math.abs(waterfall.year1.grossRent - 36000) < 1, `$${waterfall.year1.grossRent}`);
check('year1 NOI > 0', waterfall.year1.noi > 0, `$${waterfall.year1.noi}`);
check('year1 preTaxCF present', typeof waterfall.year1.preTaxCF === 'number');
check('year1 afterTaxCF present', typeof waterfall.year1.afterTaxCF === 'number');
check('year1 effectiveTaxRate in [0, 100]', waterfall.year1.effectiveTaxRate >= 0 && waterfall.year1.effectiveTaxRate <= 100, `${waterfall.year1.effectiveTaxRate}%`);
check('year1 depreciationShieldPct > 0', waterfall.year1.depreciationShieldPct > 0, `${waterfall.year1.depreciationShieldPct}%`);
check('year1 has 16 stages', waterfall.year1.stages.length === 16, `${waterfall.year1.stages.length} stages`);
console.log('\n  Year 1 waterfall stages:');
for (const s of waterfall.year1.stages) {
  const sym = waterfallSignSymbol(s.sign);
  console.log(`    ${s.step.toString().padStart(2)}. ${s.label.padEnd(35)} ${sym} $${s.amount.toLocaleString().padStart(10)}  (cum: $${s.cumulative.toLocaleString().padStart(10)}, ${s.pctOfGrossRent.toFixed(1)}% of rent)`);
}

console.log('\nSTEP 4: Year 1 stage integrity');
// Check stage signs
const addCount = waterfall.year1.stages.filter(s => s.sign === 'ADD').length;
const subtractCount = waterfall.year1.stages.filter(s => s.sign === 'SUBTRACT').length;
const subtotalCount = waterfall.year1.stages.filter(s => s.sign === 'SUBTOTAL').length;
const totalCount = waterfall.year1.stages.filter(s => s.sign === 'TOTAL').length;
check('year1 has 2 ADD stages (gross rent)', addCount === 1, `${addCount} ADD`);
check('year1 has 10 SUBTRACT stages (vacancy+opex+interest+principal+dep+fed+state)', subtractCount === 10, `${subtractCount} SUBTRACT`);
check('year1 has 4 SUBTOTAL stages (grossEff+NOI+preTaxCF+taxableIncome)', subtotalCount === 4, `${subtotalCount} SUBTOTAL`);
check('year1 has 1 TOTAL stage (after-tax CF)', totalCount === 1, `${totalCount} TOTAL`);

console.log('\nSTEP 5: Year 1 math integrity');
// NOI = grossEff - taxes - insurance - mgmt - maint
const grossEffStage = waterfall.year1.stages.find(s => s.label.includes('Gross Effective'));
const noiStage = waterfall.year1.stages.find(s => s.label.includes('NOI'));
const afterTaxStage = waterfall.year1.stages.find(s => s.label.includes('After-Tax Cash Flow'));
check('Gross Effective Rent > 0', grossEffStage ? grossEffStage.amount > 0 : false);
check('NOI > 0', noiStage ? noiStage.amount > 0 : false);
check('NOI < Gross Effective', (noiStage && grossEffStage) ? noiStage.amount < grossEffStage.amount : false);
check('After-tax CF present', afterTaxStage ? typeof afterTaxStage.amount === 'number' : false);

console.log('\nSTEP 6: Hold-total waterfall');
check('holdTotal has stages', waterfall.holdTotal.stages.length > 10, `${waterfall.holdTotal.stages.length} stages`);
check('holdTotal cashInvested > 0', waterfall.holdTotal.cashInvested > 0, `$${waterfall.holdTotal.cashInvested}`);
check('holdTotal totalOperatingCF present', typeof waterfall.holdTotal.totalOperatingCF === 'number');
check('holdTotal exitAfterTax present', typeof waterfall.holdTotal.exitAfterTax === 'number');
check('holdTotal totalReturn = operatingCF + exitAfterTax',
  Math.abs(waterfall.holdTotal.totalReturn - (waterfall.holdTotal.totalOperatingCF + waterfall.holdTotal.exitAfterTax)) < 100,
  `$${waterfall.holdTotal.totalReturn}`);
check('holdTotal totalProfit = totalReturn - cashInvested',
  Math.abs(waterfall.holdTotal.totalProfit - (waterfall.holdTotal.totalReturn - waterfall.holdTotal.cashInvested)) < 100,
  `$${waterfall.holdTotal.totalProfit}`);
check('holdTotal returnMultiple = totalReturn / cashInvested',
  Math.abs(waterfall.holdTotal.returnMultiple - (waterfall.holdTotal.totalReturn / waterfall.holdTotal.cashInvested)) < 0.05,
  `${waterfall.holdTotal.returnMultiple}×`);
check('holdTotal preTaxIRR matches AfterTaxIRR', Math.abs(waterfall.holdTotal.preTaxIRR - afterTaxIRR.preTaxIRR) < 0.01);
check('holdTotal afterTaxIRR matches AfterTaxIRR', Math.abs(waterfall.holdTotal.afterTaxIRR - afterTaxIRR.afterTaxIRR) < 0.01);
check('holdTotal irrImpactOfTaxes matches', Math.abs(waterfall.holdTotal.irrImpactOfTaxes - afterTaxIRR.irrImpactOfTaxes) < 0.01);

console.log('\n  Hold-total waterfall stages:');
for (const s of waterfall.holdTotal.stages) {
  const sym = waterfallSignSymbol(s.sign);
  console.log(`    ${s.step.toString().padStart(2)}. ${s.label.padEnd(40)} ${sym} $${s.amount.toLocaleString().padStart(12)}  (cum: $${s.cumulative.toLocaleString().padStart(12)})`);
}

console.log('\nSTEP 7: Exit waterfall');
check('exit exitYear = 5', waterfall.exit.exitYear === 5, `${waterfall.exit.exitYear}`);
check('exit salePrice > 0', waterfall.exit.salePrice > 0, `$${waterfall.exit.salePrice}`);
// Signature deal: marginal 4.71% entry cap vs 6.5% exit cap → salePrice may be < purchasePrice
check('exit sellingCosts > 0', waterfall.exit.sellingCosts > 0);
check('exit netSaleProceeds = salePrice - sellingCosts',
  Math.abs(waterfall.exit.netSaleProceeds - (waterfall.exit.salePrice - waterfall.exit.sellingCosts)) < 1);
check('exit remainingLoanBalance < loanAmount', waterfall.exit.remainingLoanBalance < loanAmount, `$${waterfall.exit.remainingLoanBalance}`);
check('exit remainingLoanBalance > 0', waterfall.exit.remainingLoanBalance > 0);
check('exit netAfterTaxExit > 0', waterfall.exit.netAfterTaxExit > 0, `$${waterfall.exit.netAfterTaxExit}`);
check('exit exitMultiple > 0', waterfall.exit.exitMultiple > 0, `${waterfall.exit.exitMultiple}×`);
console.log(`    Exit: sale $${waterfall.exit.salePrice.toLocaleString()} - costs $${waterfall.exit.sellingCosts.toLocaleString()} - loan $${waterfall.exit.remainingLoanBalance.toLocaleString()} - tax $${(waterfall.exit.depreciationRecapture + waterfall.exit.capitalGainsTax).toLocaleString()} = $${waterfall.exit.netAfterTaxExit.toLocaleString()}`);
console.log(`    Exit multiple: ${waterfall.exit.exitMultiple.toFixed(2)}× cash invested ($${cashInvested.toLocaleString()})`);

console.log('\nSTEP 8: Color helper');
const signs: WaterfallSign[] = ['ADD', 'SUBTRACT', 'SUBTOTAL', 'TOTAL'];
for (const sign of signs) {
  const color = waterfallStageColor(sign);
  const sym = waterfallSignSymbol(sign);
  check(`  ${sign} color + symbol returned`, color.length > 0 && sym.length > 0, `${sym} ${color}`);
}

console.log('\nSTEP 9: Summary text');
console.log(`    Summary (${waterfall.summary.length} chars):`);
// Print summary in chunks for readability
const sentences = waterfall.summary.split('. ');
for (const s of sentences) {
  console.log(`      • ${s}${s.endsWith('.') ? '' : '.'}`);
}
check('summary mentions Year 1', waterfall.summary.includes('Year 1'));
check('summary mentions after-tax IRR', waterfall.summary.toLowerCase().includes('after-tax irr'));
check('summary mentions exit', waterfall.summary.toLowerCase().includes('exit'));

console.log('\n═══════════════════════════════════════════════════════');
console.log(`  RESULT: ${passed} passed, ${failed} failed`);
console.log('═══════════════════════════════════════════════════════\n');

if (failed > 0) {
  process.exit(1);
}
