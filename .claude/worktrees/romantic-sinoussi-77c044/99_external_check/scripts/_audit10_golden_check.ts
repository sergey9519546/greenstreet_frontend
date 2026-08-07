// Standalone golden-values verifier for AUDIT-FINAL-10
// Verifies items 5-11 of the audit spec using canonical engine.ts functions.
import {
  calculatePaymentFactor,
  calculatePI,
  calculatePITIA,
  solveDealBreakRate,
} from '../src/lib/dscr/engine';

function approx(actual: number, expected: number, tol: number): boolean {
  return Math.abs(actual - expected) < tol;
}

interface Check {
  id: string;
  name: string;
  expected: number;
  actual: number;
  pass: boolean;
}

const checks: Check[] = [];

// 5. Payment factor @ 8.25% = 0.0075127 (30yr amortizing)
const pf825 = calculatePaymentFactor(8.25, 360);
checks.push({
  id: '5',
  name: 'Payment factor @ 8.25% (30yr)',
  expected: 0.0075127,
  actual: Math.round(pf825 * 1e7) / 1e7,
  pass: approx(pf825, 0.0075127, 1e-6),
});

// 6. Payment factor @ 7.00% = 0.006653
const pf7 = calculatePaymentFactor(7.0, 360);
checks.push({
  id: '6',
  name: 'Payment factor @ 7.00% (30yr)',
  expected: 0.006653,
  actual: Math.round(pf7 * 1e7) / 1e7,
  pass: approx(pf7, 0.006653, 1e-6),
});

// 7. P&I on $300K @ 8.25% = $2,254/mo (per engine.ts:884-886)
const pi300k = calculatePI(300000, 8.25, 360);
checks.push({
  id: '7',
  name: 'P&I on $300K @ 8.25%',
  expected: 2254,
  actual: Math.round(pi300k),
  pass: approx(pi300k, 2254, 2),
});

// 8. PITIA @ 8.25% ($318,750 loan, tax $5K/yr=$417/mo, ins $2K/yr=$167/mo, HOA $150) = $3,129
const pitia825 = calculatePITIA(318750, 8.25, 30, 'NONE', 5000, 2000, 150);
checks.push({
  id: '8',
  name: 'PITIA @ 8.25% ($318,750, tax 417 + ins 167 + HOA 150)',
  expected: 3129,
  actual: Math.round(pitia825.total),
  pass: approx(pitia825.total, 3129, 3),
});

// 9. Track 1 DSCR @ 8.25% on $3,000 rent = 0.96
const dscr825 = 3000 / pitia825.total;
checks.push({
  id: '9',
  name: 'Track 1 DSCR @ 8.25% on $3,000 rent',
  expected: 0.96,
  actual: Math.round(dscr825 * 1000) / 1000,
  pass: approx(dscr825, 0.96, 0.01),
});

// 10. Track 1 DSCR @ 7.00% = 1.051 (verify_v11 spec uses 1.05 tol ±0.01)
const pitia7 = calculatePITIA(318750, 7.00, 30, 'NONE', 5000, 2000, 150);
const dscr7 = 3000 / pitia7.total;
checks.push({
  id: '10',
  name: 'Track 1 DSCR @ 7.00% on $3,000 rent',
  expected: 1.051,
  actual: Math.round(dscr7 * 1000) / 1000,
  pass: approx(dscr7, 1.051, 0.01),
});

// 11. Deal-break rate = 7.67% (solveDealBreakRate signature uses term YEARS)
const dbr = solveDealBreakRate(3000, 318750, 30, 'NONE', 5000, 2000, 150);
checks.push({
  id: '11',
  name: 'Deal-break rate ($3,000 rent, $318,750 loan, 30yr)',
  expected: 7.67,
  actual: Math.round(dbr * 100) / 100,
  pass: approx(dbr, 7.67, 0.1),
});

console.log('═══════════════════════════════════════════════════════════════');
console.log('  GOLDEN VALUES VERIFICATION — AUDIT-FINAL-10 items 5-11');
console.log('═══════════════════════════════════════════════════════════════');
let pass = 0;
for (const c of checks) {
  const mark = c.pass ? '✓' : '✗';
  console.log(`  ${mark} [${c.id}] ${c.name}`);
  console.log(`       expected=${c.expected}, actual=${c.actual}`);
  if (c.pass) pass++;
}
console.log('═══════════════════════════════════════════════════════════════');
console.log(`  GOLDEN VALUES RESULT: ${pass}/${checks.length} PASS`);
console.log('═══════════════════════════════════════════════════════════════');
