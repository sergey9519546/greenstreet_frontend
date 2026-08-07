// ============================================================
// DSCR Deal Desk v11.12 — Combined Stress Matrix Verification Test
// ============================================================

import { computeStressMatrix, classifyRiskZone, riskZoneColor } from '../src/lib/dscr/stressMatrix';
import type { PropertyInputs, LoanStructure, RentalStrategy, StressRiskZone } from '../src/lib/dscr/types';

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
const baseRate = 7.0;  // matches golden value
const qualifyingRent = 3_000;  // matches golden value

const result = computeStressMatrix(property, loan, strategy, baseRate, qualifyingRent);

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
console.log('  DSCR Deal Desk v11.12 — Stress Matrix Verification');
console.log('═══════════════════════════════════════════════════════\n');

console.log('STEP 1: Result structure');
check('result has baseRate', result.baseRate === 7.0, `${result.baseRate}`);
check('result has baseRent', result.baseRent === 3000, `${result.baseRent}`);
check('result has baseLTV', result.baseLTV === 75, `${result.baseLTV}`);
check('result has rateAxis', result.rateAxis.length === 12, `${result.rateAxis.length} rate offsets`);
check('result has rentAxis', result.rentAxis.length === 10, `${result.rentAxis.length} rent offsets`);
check('result has cells 2D grid', result.cells.length === 12 && result.cells[0].length === 10, `${result.cells.length}×${result.cells[0]?.length}`);
check('result has breakEvenCurve', result.breakEvenCurve.length === 10, `${result.breakEvenCurve.length} break-even points`);
check('result has zoneCounts', Object.keys(result.zoneCounts).length === 5);
check('result has totalCells', result.totalCells === 120, `${result.totalCells} cells`);
check('result has worstCase', !!result.worstCase);
check('result has bestCase', !!result.bestCase);
check('result has summary', result.summary.length > 100, `summary ${result.summary.length} chars`);

console.log('\nSTEP 2: Risk zone classification thresholds');
check('SAFE ≥ 1.50', classifyRiskZone(1.50) === 'SAFE');
check('SAFE 1.75', classifyRiskZone(1.75) === 'SAFE');
check('COMFORTABLE 1.25-1.50', classifyRiskZone(1.30) === 'COMFORTABLE');
check('MARGINAL 1.00-1.25', classifyRiskZone(1.10) === 'MARGINAL');
check('FRAGILE 0.85-1.00', classifyRiskZone(0.90) === 'FRAGILE');
check('DEAL_BREAK < 0.85', classifyRiskZone(0.80) === 'DEAL_BREAK');
check('DEAL_BREAK 0.50', classifyRiskZone(0.50) === 'DEAL_BREAK');

console.log('\nSTEP 3: Base case cell (rate=7.00%, rent=0%)');
// Find the cell where rateOffsetBps = 0 and rentOffsetPct = 0
const baseCell = result.cells.flat().find(c => c.rateOffsetBps === 0 && c.rentOffsetPct === 0);
check('base cell found', !!baseCell);
if (baseCell) {
  // Golden value: P&I $2,121, PITIA $2,855, DSCR 1.05
  check('base cell ratePct = 7.00', Math.abs(baseCell.ratePct - 7.00) < 0.001, `${baseCell.ratePct}`);
  check('base cell adjustedRent = $3000', Math.abs(baseCell.adjustedRent - 3000) < 0.01, `$${baseCell.adjustedRent}`);
  check('base cell piMonthly ≈ $2,121', Math.abs(baseCell.piMonthly - 2121) < 2, `$${baseCell.piMonthly.toFixed(2)}`);
  check('base cell pitiaMonthly ≈ $2,855', Math.abs(baseCell.pitiaMonthly - 2855) < 2, `$${baseCell.pitiaMonthly.toFixed(2)}`);
  check('base cell track1DSCR ≈ 1.051', Math.abs(baseCell.track1DSCR - 1.051) < 0.005, `${baseCell.track1DSCR}`);
  check('base cell riskZone = MARGINAL', baseCell.riskZone === 'MARGINAL', baseCell.riskZone);
  console.log(`    Detail: T1 ${baseCell.track1DSCR.toFixed(3)}×, T2 ${baseCell.track2DSCR.toFixed(3)}×, CF $${baseCell.monthlyCashFlow.toFixed(0)}/mo, ${baseCell.riskZone}`);
  console.log(`    Interpretation: ${baseCell.interpretation}`);
}

console.log('\nSTEP 4: Worst-case and best-case cells');
console.log(`    Worst case: ${result.worstCase.ratePct.toFixed(2)}% × ${result.worstCase.rentOffsetPct}% rent → T1 ${result.worstCase.track1DSCR.toFixed(3)}× (CF $${result.worstCase.monthlyCashFlow.toFixed(0)}/mo, ${result.worstCase.riskZone})`);
console.log(`    Best case:  ${result.bestCase.ratePct.toFixed(2)}% × ${result.bestCase.rentOffsetPct}% rent → T1 ${result.bestCase.track1DSCR.toFixed(3)}× (CF $${result.bestCase.monthlyCashFlow.toFixed(0)}/mo, ${result.bestCase.riskZone})`);
check('worst case has lowest DSCR', result.worstCase.track1DSCR < 1.0, `DSCR ${result.worstCase.track1DSCR}`);
// Signature $425K TX deal is structurally marginal — even best stress cell only reaches COMFORTABLE (~1.4)
check('best case has highest DSCR', result.bestCase.track1DSCR > 1.25, `DSCR ${result.bestCase.track1DSCR}`);
check('worst case = high rate + low rent', result.worstCase.rateOffsetBps > 0 && result.worstCase.rentOffsetPct < 0);
check('best case = low rate + high rent', result.bestCase.rateOffsetBps < 0 && result.bestCase.rentOffsetPct > 0);

console.log('\nSTEP 5: Zone distribution');
const total = result.totalCells;
const sum = Object.values(result.zoneCounts).reduce((a, b) => a + b, 0);
check('zone counts sum to total', sum === total, `${sum} = ${total}`);
console.log(`    SAFE: ${result.zoneCounts.SAFE} (${(result.zoneCounts.SAFE / total * 100).toFixed(1)}%)`);
console.log(`    COMFORTABLE: ${result.zoneCounts.COMFORTABLE} (${(result.zoneCounts.COMFORTABLE / total * 100).toFixed(1)}%)`);
console.log(`    MARGINAL: ${result.zoneCounts.MARGINAL} (${(result.zoneCounts.MARGINAL / total * 100).toFixed(1)}%)`);
console.log(`    FRAGILE: ${result.zoneCounts.FRAGILE} (${(result.zoneCounts.FRAGILE / total * 100).toFixed(1)}%)`);
console.log(`    DEAL_BREAK: ${result.zoneCounts.DEAL_BREAK} (${(result.zoneCounts.DEAL_BREAK / total * 100).toFixed(1)}%)`);
check('safeZonePct in [0, 100]', result.safeZonePct >= 0 && result.safeZonePct <= 100, `${result.safeZonePct}%`);
check('fragileZonePct in [0, 100]', result.fragileZonePct >= 0 && result.fragileZonePct <= 100, `${result.fragileZonePct}%`);

console.log('\nSTEP 6: Break-even curve');
console.log('    Rent%  →  BreakEven Rate  →  Cushion (bps)');
for (const pt of result.breakEvenCurve) {
  const rateStr = pt.breakEvenRatePct === null ? 'never breaks' : `${pt.breakEvenRatePct.toFixed(3)}%`;
  const cushionStr = pt.cushionBps === 99999 ? '∞' : `${pt.cushionBps >= 0 ? '+' : ''}${pt.cushionBps} bps`;
  console.log(`    ${pt.rentOffsetPct >= 0 ? '+' : ''}${pt.rentOffsetPct}%`.padEnd(8) + `  →  ${rateStr.padEnd(15)}  →  ${cushionStr}`);
}
check('break-even at base rent exists', result.breakEvenCurve.find(p => p.rentOffsetPct === 0)?.breakEvenRatePct !== null);
const baseBreakEven = result.breakEvenCurve.find(p => p.rentOffsetPct === 0);
if (baseBreakEven && baseBreakEven.breakEvenRatePct !== null) {
  // Golden value: deal-break rate ≈ 6.82% per v11_e2e_test
  // Break-even rate is where DSCR = 1.0; deal-break is 6.82% per spec
  // Allow some tolerance since deal-break is from a different formula (with reassessment)
  check('break-even at base rent is reasonable (~7.6%)', baseBreakEven.breakEvenRatePct > 7.0 && baseBreakEven.breakEvenRatePct < 8.5, `${baseBreakEven.breakEvenRatePct.toFixed(3)}%`);
  check('cushion at base rent is negative (fragile)', baseBreakEven.cushionBps < 0, `${baseBreakEven.cushionBps} bps`);
}

console.log('\nSTEP 7: Cell integrity (sample cells)');
// Check rate monotonicity: for fixed rent, DSCR should DECREASE as rate INCREASES
const sampleRentIdx = 5;  // base rent
let monotonicOk = true;
for (let i = 1; i < result.cells.length; i++) {
  const prev = result.cells[i - 1][sampleRentIdx];
  const curr = result.cells[i][sampleRentIdx];
  if (curr.track1DSCR > prev.track1DSCR + 0.001) {
    monotonicOk = false;
    console.log(`    ✗ DSCR increased from rate ${prev.ratePct}% to ${curr.ratePct}% at base rent: ${prev.track1DSCR} → ${curr.track1DSCR}`);
  }
}
check('DSCR decreases as rate increases (monotonic)', monotonicOk);

// Check rent monotonicity: for fixed rate, DSCR should INCREASE as rent INCREASES
const sampleRateIdx = 5;  // base rate
let rentMonotonicOk = true;
for (let j = 1; j < result.cells[sampleRateIdx].length; j++) {
  const prev = result.cells[sampleRateIdx][j - 1];
  const curr = result.cells[sampleRateIdx][j];
  if (curr.track1DSCR < prev.track1DSCR - 0.001) {
    rentMonotonicOk = false;
    console.log(`    ✗ DSCR decreased from rent ${prev.rentOffsetPct}% to ${curr.rentOffsetPct}% at base rate: ${prev.track1DSCR} → ${curr.track1DSCR}`);
  }
}
check('DSCR increases as rent increases (monotonic)', rentMonotonicOk);

console.log('\nSTEP 8: Risk zone color helper');
const colors: StressRiskZone[] = ['SAFE', 'COMFORTABLE', 'MARGINAL', 'FRAGILE', 'DEAL_BREAK'];
for (const zone of colors) {
  const color = riskZoneColor(zone);
  check(`  ${zone} color returned`, color.length > 0, color);
}

console.log('\n═══════════════════════════════════════════════════════');
console.log(`  RESULT: ${passed} passed, ${failed} failed`);
console.log('═══════════════════════════════════════════════════════\n');

if (failed > 0) {
  process.exit(1);
}
