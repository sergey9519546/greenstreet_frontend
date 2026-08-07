// ============================================================
// DSCR Deal Desk v11.11 — Lender Match Score Verification Test
// Tests the new scoreLenderMatch() engine with signature deal inputs
// ============================================================

import { matchLenders } from '../src/lib/dscr/lenders';
import { scoreLenderMatch, FACTOR_WEIGHTS } from '../src/lib/dscr/lenderMatchScore';
import type { PropertyInputs, BorrowerProfile, LoanStructure, RentalStrategy } from '../src/lib/dscr/types';

// ── Signature deal inputs (matching v11_e2e_test golden values) ──
const property: PropertyInputs = {
  purchasePrice: 425_000,
  leaseRent: 3_000,
  marketRent: 3_100,
  strProjectedRent: 5_500,
  strDocumentedRent: 4_200,
  hoa: 150,
  annualTaxes: 5_000,        // TX pre-reassessment
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

const borrower: BorrowerProfile = {
  ficoScore: 729,
  experience: 'EXPERIENCED',
  existingFinancedProperties: 2,
  entityType: 'LLC',
  isUSCitizenOrPR: true,
  availableReserves: 75_000,
  reserveAssets: [
    { type: 'CHECKING', value: 30_000 },
    { type: 'SAVINGS', value: 25_000 },
    { type: 'BROKERAGE', value: 20_000 },
  ],
  isFirstResponder: false,
  isForeignNational: false,
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

// ── Run matchLenders + scoreLenderMatch ──
const solvedRate = 7.0;  // matches golden value
const fitResults = matchLenders(property, borrower, loan, strategy, solvedRate);
const scoreResult = scoreLenderMatch(fitResults, loan, borrower, strategy);

// ── Test checks ──
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
console.log('  DSCR Deal Desk v11.11 — Lender Match Score Verification');
console.log('═══════════════════════════════════════════════════════\n');

console.log('STEP 1: scoreLenderMatch() returns well-formed result');
check('scores array populated', scoreResult.scores.length > 0, `${scoreResult.scores.length} lenders scored`);
check('fieldCount matches eligible count', scoreResult.fieldCount === fitResults.filter(r => r.eligible).length, `${scoreResult.fieldCount} eligible`);
check('topPicks has ≤3 entries', scoreResult.topPicks.length <= 3, `${scoreResult.topPicks.length} picks`);
check('summary is non-empty', scoreResult.summary.length > 0);
check('marketRateBenchmark > 0', scoreResult.marketRateBenchmark > 0, `${scoreResult.marketRateBenchmark.toFixed(3)}%`);

console.log('\nSTEP 2: Factor weights sum to 1.0');
const totalWeight = Object.values(FACTOR_WEIGHTS).reduce((a, b) => a + b, 0);
check('weights sum to 1.0', Math.abs(totalWeight - 1.0) < 0.001, `sum = ${totalWeight}`);

console.log('\nSTEP 3: Top pick structure');
if (scoreResult.topPicks.length > 0) {
  const top = scoreResult.topPicks[0];
  check('top pick has lenderId', !!top.lenderId);
  check('top pick has lenderName', !!top.lenderName);
  check('top pick is eligible', top.eligible === true);
  check('top pick totalScore in [0,100]', top.totalScore >= 0 && top.totalScore <= 100, `${top.totalScore}`);
  check('top pick has 6 factors', top.factors.length === 6, `${top.factors.length} factors`);
  check('top pick has rankAmongEligible = 1', top.rankAmongEligible === 1, `rank = ${top.rankAmongEligible}`);
  check('top pick has tier set', ['TOP_PICK', 'STRONG', 'VIABLE', 'WEAK'].includes(top.tier), `tier = ${top.tier}`);
  check('top pick has topReasons', top.topReasons.length > 0, `${top.topReasons.length} reasons`);
  check('top pick has recommendationText', top.recommendationText.length > 0);

  console.log('\nSTEP 4: Factor breakdown for top pick');
  console.log(`    Top pick: ${top.lenderName} — score ${top.totalScore}/100 (${top.tier})`);
  for (const f of top.factors) {
    check(`  factor ${f.label} weight=${f.weight} raw=${f.rawScore} weighted=${f.weightedScore}`,
      f.weightedScore === Math.round(f.rawScore * f.weight * 10) / 10,
      `${f.detail}`);
  }

  console.log('\nSTEP 5: Top reasons & concerns');
  console.log('    Reasons:');
  for (const r of top.topReasons) console.log(`      • ${r}`);
  console.log('    Concerns:');
  for (const c of top.topConcerns) console.log(`      • ${c}`);
}

console.log('\nSTEP 6: All eligible lenders ranked');
const eligibleScores = scoreResult.scores.filter(s => s.eligible);
let prevScore = Infinity;
let rankOk = true;
for (let i = 0; i < eligibleScores.length; i++) {
  const s = eligibleScores[i];
  if (s.totalScore > prevScore + 0.01) {
    rankOk = false;
    console.log(`    ✗ Rank order broken at index ${i}: ${s.lenderName} score ${s.totalScore} > prev ${prevScore}`);
  }
  if (s.rankAmongEligible !== i + 1) {
    rankOk = false;
    console.log(`    ✗ Rank mismatch at index ${i}: ${s.lenderName} rank=${s.rankAmongEligible} expected ${i + 1}`);
  }
  prevScore = s.totalScore;
}
check('eligible lenders sorted by score desc', rankOk);
check('eligible rankAmongEligible is 1..N', eligibleScores.every((s, i) => s.rankAmongEligible === i + 1));

console.log('\nSTEP 7: Ineligible lenders handled correctly');
const ineligibleScores = scoreResult.scores.filter(s => !s.eligible);
check('ineligible totalScore = 0', ineligibleScores.every(s => s.totalScore === 0), `${ineligibleScores.length} ineligible`);
check('ineligible rankAmongEligible = null', ineligibleScores.every(s => s.rankAmongEligible === null));
check('ineligible tier = WEAK', ineligibleScores.every(s => s.tier === 'WEAK'));

console.log('\nSTEP 8: Tier classification thresholds');
for (const s of eligibleScores) {
  let expectedTier: string;
  if (s.totalScore >= 80) expectedTier = 'TOP_PICK';
  else if (s.totalScore >= 65) expectedTier = 'STRONG';
  else if (s.totalScore >= 50) expectedTier = 'VIABLE';
  else expectedTier = 'WEAK';
  check(`  ${s.lenderName} score ${s.totalScore} → tier ${s.tier}`,
    s.tier === expectedTier,
    `expected ${expectedTier}`);
}

console.log('\nSTEP 9: Weighted score sum = totalScore');
for (const s of eligibleScores) {
  const sum = s.factors.reduce((acc, f) => acc + f.weightedScore, 0);
  const rounded = Math.round(sum * 10) / 10;
  check(`  ${s.lenderName} weighted sum ${rounded.toFixed(1)} = total ${s.totalScore}`,
    Math.abs(rounded - s.totalScore) < 0.1);
}

console.log('\n═══════════════════════════════════════════════════════');
console.log(`  RESULT: ${passed} passed, ${failed} failed`);
console.log('═══════════════════════════════════════════════════════\n');

if (failed > 0) {
  process.exit(1);
}
