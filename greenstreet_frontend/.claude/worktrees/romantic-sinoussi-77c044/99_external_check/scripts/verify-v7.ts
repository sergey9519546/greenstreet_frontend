// Quick verification of golden values + new modules
import { verifyGoldenValues, solveDSCR } from '../src/lib/dscr/engine';
import { computeAcquisitionScore, computeExecutionRisk, computeDealKillCheck } from '../src/lib/dscr/decisionSupport';
import { computeReserveScenarios } from '../src/lib/dscr/reserveEngine';
import { checkPPPLegal } from '../src/lib/dscr/statePppLaws';

const property = {
  purchasePrice: 425000,
  leaseRent: 3000,
  marketRent: 3100,
  strProjectedRent: 5500,
  strDocumentedRent: 4200,
  hoa: 150,
  annualTaxes: 5000,
  annualInsurance: 2000,
  floodInsurance: 0,
  propertyType: 'SFR' as const,
  state: 'TX',
  unitCount: 1,
  sqft: 1800,
  yearBuilt: 2005,
  isCondotel: false,
  isNonWarrantable: false,
  isRural: false,
  isDecliningMarket: false,
  hoaSTRPolicy: 'UNKNOWN' as const,
};

const borrower = {
  ficoScore: 729,
  experience: 'EXPERIENCED' as const,
  existingFinancedProperties: 2,
  entityType: 'LLC' as const,
  isUSCitizenOrPR: true,
  availableReserves: 75000,
  reserveAssets: [
    { type: 'CHECKING' as const, value: 30000 },
    { type: 'SAVINGS' as const, value: 25000 },
    { type: 'BROKERAGE' as const, value: 20000 },
  ],
  isFirstResponder: false,
  isForeignNational: false,
};

const loan = {
  ltv: 75,
  term: '30_YR' as const,
  ioPeriod: 'NONE' as const,
  armType: 'FIXED' as const,
  prepayPreference: 'NONE' as const,
  purpose: 'PURCHASE' as const,
  expectedHoldYears: 5,
  points: 0,
  lenderFees: 1295,
  brokerFees: 0,
  rateLockCost: 0,
};

console.log('=== GOLDEN VALUES ===');
const v = verifyGoldenValues();
let pass = 0, fail = 0;
for (const [k, r] of Object.entries(v.results)) {
  const ok = r.pass ? '✓' : '✗';
  console.log(`  ${ok} ${k}: expected=${r.expected}, actual=${r.actual}`);
  if (r.pass) pass++; else fail++;
}
console.log(`\nGolden values: ${pass} pass, ${fail} fail — overall: ${v.pass ? 'PASS' : 'FAIL'}`);

console.log('\n=== DUAL-TRACK SOLVE ===');
const result = solveDSCR(property, borrower, loan, 'LTR');
console.log(`  Solved Rate: ${result.solvedRate.toFixed(3)}%`);
console.log(`  Track 1 DSCR: ${result.dualTrackDSCR.track1.dscr.toFixed(3)}`);
console.log(`  Track 2 DSCR: ${result.dualTrackDSCR.track2.dscr.toFixed(3)}`);
console.log(`  Deal-Break Rate: ${result.dealBreakRate.toFixed(2)}%`);
console.log(`  Rate Headroom: ${result.rateHeadroomBps} bps`);
console.log(`  Loan Amount: $${Math.round(result.loanAmount).toLocaleString()}`);
console.log(`  Monthly PITIA: $${Math.round(result.monthlyPITIA.total).toLocaleString()}`);
console.log(`  Max Purchase @1.0: $${Math.round(result.maxPurchaseAtDSCR1).toLocaleString()}`);

console.log('\n=== RESERVES ===');
const reserves = computeReserveScenarios(
  result.dscr, result.monthlyPITIA.total, 'LTR', borrower, loan,
  'TX', borrower.reserveAssets
);
console.log(`  Likely: ${reserves.likely.totalMonths} months = $${Math.round(reserves.likely.totalDollars).toLocaleString()}`);
console.log(`  Conservative: ${reserves.conservative.totalMonths} months = $${Math.round(reserves.conservative.totalDollars).toLocaleString()}`);
console.log(`  Stress: ${reserves.stress.totalMonths} months = $${Math.round(reserves.stress.totalDollars).toLocaleString()}`);

console.log('\n=== PPP CHECK (TX) ===');
const ppp = checkPPPLegal('TX', 'LLC', 318750, 1, 'FIXED');
console.log(`  Status: ${ppp.status}`);
console.log(`  Allowed: ${ppp.allowed}`);

console.log('\n=== DECISION SUPPORT ===');
const acq = computeAcquisitionScore(result, reserves, property, borrower, loan, 'LTR', null, ppp);
console.log(`  Acquisition Score: ${acq.score}/100 (${acq.band})`);
for (const f of acq.factors) {
  console.log(`    - ${f.name} (${f.weight}%): contribution ${f.contribution.toFixed(1)}`);
}

const exec = computeExecutionRisk(result, borrower, loan, property, reserves);
console.log(`  Execution Risk: ${exec.verdict} (${exec.score}/100)`);

const kill = computeDealKillCheck(result, borrower, loan, property, 'LTR', reserves, ppp, null);
console.log(`  Deal-Kill: ${kill.allClear ? 'ALL CLEAR' : `${kill.blockingItems.length} BLOCKERS`}`);
for (const c of kill.criteria.filter(c => c.triggered)) {
  console.log(`    - [${c.severity}] ${c.criterion}`);
}
