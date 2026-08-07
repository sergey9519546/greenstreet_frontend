// ============================================================
// DSCR Loan Command Center v7.0 — AUDIT-6 RESERVE ENGINE TESTS
// Audit Subagent #6 — Reserve Engine Verification
// Verifies three-scenario output, tiered/capped/geography overlays, asset haircuts
// ============================================================

import { computeReserveScenarios, applyAssetHaircuts, getGeographyOverlay } from '../src/lib/dscr/reserveEngine';
import type { BorrowerProfile, LoanStructure, ReserveAsset, ReserveAssetType } from '../src/lib/dscr/types';

interface TestResult {
  name: string;
  expected: string;
  actual: string;
  pass: boolean;
  details?: string;
}

const results: TestResult[] = [];

function check(name: string, expected: string, actual: string, pass: boolean, details?: string) {
  results.push({ name, expected, actual, pass, details });
}

// --- Default test borrower (experienced, 720 FICO, US citizen) ---
function defaultBorrower(overrides: Partial<BorrowerProfile> = {}): BorrowerProfile {
  return {
    ficoScore: 720,
    experience: 'EXPERIENCED',
    existingFinancedProperties: 3,
    entityType: 'LLC',
    isUSCitizenOrPR: true,
    availableReserves: 80_000,
    reserveAssets: [],
    isFirstResponder: false,
    isForeignNational: false,
    ...overrides,
  };
}

// --- Default test loan (75% LTV, 30yr fixed, purchase) ---
function defaultLoan(overrides: Partial<LoanStructure> = {}): LoanStructure {
  return {
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
    ...overrides,
  };
}

const MONTHLY_PITIA = 2_854; // flagship PITIA @ 7%
const NO_ASSETS: ReserveAsset[] = [];

// ============================================================
// TEST 1: DSCR 1.30 (STRONG tier) — likely 3, conservative 6, stress 9
// ============================================================
{
  const r = computeReserveScenarios(1.30, MONTHLY_PITIA, 'LTR', defaultBorrower(), defaultLoan(), 'TN', NO_ASSETS);
  check(
    '1a. DSCR 1.30 STRONG — Likely = 3 months',
    '3',
    String(r.likely.totalMonths),
    r.likely.totalMonths === 3,
    `baseMonths=${r.likely.baseMonths}`
  );
  check(
    '1b. DSCR 1.30 STRONG — Conservative = 6 months',
    '6',
    String(r.conservative.totalMonths),
    r.conservative.totalMonths === 6,
    `baseMonths=${r.conservative.baseMonths}`
  );
  check(
    '1c. DSCR 1.30 STRONG — Stress = 9 months',
    '9',
    String(r.stress.totalMonths),
    r.stress.totalMonths === 9,
    `baseMonths=${r.stress.baseMonths}`
  );
  check(
    '1d. DSCR 1.30 — Three scenarios DISTINCT',
    '3 != 6 != 9',
    `${r.likely.totalMonths}/${r.conservative.totalMonths}/${r.stress.totalMonths}`,
    r.likely.totalMonths !== r.conservative.totalMonths &&
      r.conservative.totalMonths !== r.stress.totalMonths &&
      r.likely.totalMonths !== r.stress.totalMonths
  );
}

// ============================================================
// TEST 2: DSCR 1.10 (STANDARD tier) — likely 6, conservative 9, stress 12
// ============================================================
{
  const r = computeReserveScenarios(1.10, MONTHLY_PITIA, 'LTR', defaultBorrower(), defaultLoan(), 'TN', NO_ASSETS);
  check(
    '2a. DSCR 1.10 STANDARD — Likely = 6 months',
    '6',
    String(r.likely.totalMonths),
    r.likely.totalMonths === 6,
    `baseMonths=${r.likely.baseMonths}`
  );
  check(
    '2b. DSCR 1.10 STANDARD — Conservative = 9 months',
    '9',
    String(r.conservative.totalMonths),
    r.conservative.totalMonths === 9,
    `baseMonths=${r.conservative.baseMonths}`
  );
  check(
    '2c. DSCR 1.10 STANDARD — Stress = 12 months',
    '12',
    String(r.stress.totalMonths),
    r.stress.totalMonths === 12,
    `baseMonths=${r.stress.baseMonths}`
  );
  check(
    '2d. DSCR 1.10 — Three scenarios DISTINCT',
    '6 != 9 != 12',
    `${r.likely.totalMonths}/${r.conservative.totalMonths}/${r.stress.totalMonths}`,
    r.likely.totalMonths !== r.conservative.totalMonths &&
      r.conservative.totalMonths !== r.stress.totalMonths &&
      r.likely.totalMonths !== r.stress.totalMonths
  );
}

// ============================================================
// TEST 3: DSCR 0.90 (PREMIUM/SPECIALIST) — likely 9, conservative 12, stress 12 (capped)
// ============================================================
{
  const r = computeReserveScenarios(0.90, MONTHLY_PITIA, 'LTR', defaultBorrower(), defaultLoan(), 'TN', NO_ASSETS);
  check(
    '3a. DSCR 0.90 PREMIUM — Likely = 9 months',
    '9',
    String(r.likely.totalMonths),
    r.likely.totalMonths === 9,
    `baseMonths=${r.likely.baseMonths}`
  );
  check(
    '3b. DSCR 0.90 PREMIUM — Conservative = 12 months',
    '12',
    String(r.conservative.totalMonths),
    r.conservative.totalMonths === 12,
    `baseMonths=${r.conservative.baseMonths}`
  );
  check(
    '3c. DSCR 0.90 PREMIUM — Stress = 12 months (capped)',
    '12',
    String(r.stress.totalMonths),
    r.stress.totalMonths === 12,
    `baseMonths=${r.stress.baseMonths} (would exceed cap if not capped)`
  );
  check(
    '3d. DSCR 0.90 — Stress does NOT exceed 12-month cap',
    '<=12',
    String(r.stress.totalMonths),
    r.stress.totalMonths <= 12
  );
}

// ============================================================
// TEST 4: DSCR 0.70 (NO_RATIO) — likely 12, conservative 12, stress 12 (all capped)
// ============================================================
{
  const r = computeReserveScenarios(0.70, MONTHLY_PITIA, 'LTR', defaultBorrower(), defaultLoan(), 'TN', NO_ASSETS);
  check(
    '4a. DSCR 0.70 NO_RATIO — Likely = 12 months',
    '12',
    String(r.likely.totalMonths),
    r.likely.totalMonths === 12,
    `baseMonths=${r.likely.baseMonths}`
  );
  check(
    '4b. DSCR 0.70 NO_RATIO — Conservative = 12 months',
    '12',
    String(r.conservative.totalMonths),
    r.conservative.totalMonths === 12,
    `baseMonths=${r.conservative.baseMonths}`
  );
  check(
    '4c. DSCR 0.70 NO_RATIO — Stress = 12 months (capped)',
    '12',
    String(r.stress.totalMonths),
    r.stress.totalMonths === 12,
    `baseMonths=${r.stress.baseMonths}`
  );
  check(
    '4d. DSCR 0.70 — Stress does NOT exceed 12-month cap',
    '<=12',
    String(r.stress.totalMonths),
    r.stress.totalMonths <= 12
  );
}

// ============================================================
// TEST 5: 12-month cap enforcement across ALL scenarios
// ============================================================
{
  const dscrs = [1.50, 1.30, 1.10, 0.95, 0.85, 0.70, 0.50];
  let allCapped = true;
  let violations: string[] = [];
  for (const dscr of dscrs) {
    const r = computeReserveScenarios(dscr, MONTHLY_PITIA, 'LTR', defaultBorrower(), defaultLoan(), 'TN', NO_ASSETS);
    if (r.likely.totalMonths > 12) violations.push(`DSCR ${dscr} likely=${r.likely.totalMonths}`);
    if (r.conservative.totalMonths > 12) violations.push(`DSCR ${dscr} conservative=${r.conservative.totalMonths}`);
    if (r.stress.totalMonths > 12) violations.push(`DSCR ${dscr} stress=${r.stress.totalMonths}`);
  }
  if (violations.length > 0) allCapped = false;
  check(
    '5. 12-month cap enforced on ALL scenarios across DSCR range',
    'all <= 12',
    violations.length === 0 ? 'all <= 12' : violations.join('; '),
    allCapped
  );
}

// ============================================================
// TEST 6: Geography overlay — CA properties get bumped
// Audit spec: CA 9/12/15 (3/6/9 + 6 months)
// ============================================================
{
  // For DSCR 1.30 STRONG (likely=3, conservative=6, stress=9):
  //   CA adds +6 → likely=9, conservative=12, stress=12 (capped from 15)
  const ca = computeReserveScenarios(1.30, MONTHLY_PITIA, 'LTR', defaultBorrower(), defaultLoan(), 'CA', NO_ASSETS);
  const tn = computeReserveScenarios(1.30, MONTHLY_PITIA, 'LTR', defaultBorrower(), defaultLoan(), 'TN', NO_ASSETS);

  check(
    '6a. Geography overlay active for CA',
    'non-null',
    ca.geographyOverlay ? ca.geographyOverlay.state : 'null',
    ca.geographyOverlay !== null && ca.geographyOverlay.state === 'CA'
  );
  check(
    '6b. Geography overlay NULL for non-CA',
    'null',
    tn.geographyOverlay === null ? 'null' : tn.geographyOverlay.state,
    tn.geographyOverlay === null
  );
  check(
    '6c. CA schedule string = "9/12/15"',
    '9/12/15',
    ca.geographyOverlay?.schedule ?? '',
    ca.geographyOverlay?.schedule === '9/12/15'
  );
  check(
    '6d. CA Likely bumped vs TN (3 → 9)',
    '9',
    String(ca.likely.totalMonths),
    ca.likely.totalMonths === 9 && ca.likely.totalMonths > tn.likely.totalMonths,
    `TN likely=${tn.likely.totalMonths}, CA likely=${ca.likely.totalMonths}`
  );
  check(
    '6e. CA Conservative bumped (6 → 12, capped)',
    '12',
    String(ca.conservative.totalMonths),
    ca.conservative.totalMonths === 12 && ca.conservative.totalMonths > tn.conservative.totalMonths,
    `TN conservative=${tn.conservative.totalMonths}, CA conservative=${ca.conservative.totalMonths}`
  );
  check(
    '6f. CA Stress bumped but capped at 12',
    '12',
    String(ca.stress.totalMonths),
    ca.stress.totalMonths === 12,
    `TN stress=${tn.stress.totalMonths}, CA stress=${ca.stress.totalMonths} (capped from 15)`
  );
  // Verify a CA geography adjustment was applied to conservative
  const caGeoAdj = ca.conservative.adjustments.find(a => a.factor.includes('Geography'));
  check(
    '6g. CA overlay adjustment recorded on Conservative scenario',
    'present',
    caGeoAdj ? `${caGeoAdj.factor}: +${caGeoAdj.monthsAdded}` : 'absent',
    !!caGeoAdj && caGeoAdj.monthsAdded >= 3,
    `full adj list: ${ca.conservative.adjustments.map(a => `${a.factor}(+${a.monthsAdded})`).join(', ')}`
  );
}

// ============================================================
// TEST 7: Asset haircut — $100K in 401k → ~$60K-70K eligible (60-70% eligible, 30-40% haircut)
// ============================================================
{
  const assets401k: ReserveAsset[] = [
    { type: 'RETIREMENT_401K', value: 100_000 },
  ];
  const haircuts = applyAssetHaircuts(assets401k);
  const eligible = haircuts[0].eligibleAmount;
  const haircutPct = haircuts[0].haircutPct;

  check(
    '7a. 401k tier = 2 (per audit: Tier 2 retirement)',
    '2',
    String(haircuts[0].tier),
    haircuts[0].tier === 2,
    `actual tier=${haircuts[0].tier}`
  );
  check(
    '7b. 401k eligible in $60K-$70K range (60-70% eligible)',
    '$60,000 - $70,000',
    `$${eligible.toFixed(0)} (${(eligible / 100_000 * 100).toFixed(0)}% eligible)`,
    eligible >= 60_000 && eligible <= 70_000,
    `haircut=${haircutPct}%`
  );
  check(
    '7c. 401k haircut in 30-40% range',
    '30-40%',
    `${haircutPct}%`,
    haircutPct >= 30 && haircutPct <= 40
  );
}

// ============================================================
// TEST 8: Asset tiering hierarchy — Tier1/2/3/EXCLUDED per audit spec
// ============================================================
{
  const assets: ReserveAsset[] = [
    { type: 'CHECKING', value: 10_000 },                    // Tier 1
    { type: 'BROKERAGE', value: 10_000 },                   // Tier 1 (per audit: cash/brokerage)
    { type: 'RETIREMENT_401K', value: 10_000 },             // Tier 2
    { type: 'GIFT_FUNDS', value: 10_000 },                  // Tier 3
    { type: 'BUSINESS_ACCOUNT', value: 10_000 },            // Tier 3
    { type: 'UNSECURED_BORROWED', value: 10_000 },          // EXCLUDED
  ];
  const h = applyAssetHaircuts(assets);
  const byType: Record<string, { tier: any; eligible: number; haircut: number }> = {};
  for (const r of h) byType[r.assetType] = { tier: r.tier, eligible: r.eligibleAmount, haircut: r.haircutPct };

  check(
    '8a. CHECKING tier = 1',
    '1', String(byType['CHECKING'].tier), byType['CHECKING'].tier === 1
  );
  check(
    '8b. BROKERAGE tier = 1 (per audit: cash/brokerage are Tier 1)',
    '1', String(byType['BROKERAGE'].tier), byType['BROKERAGE'].tier === 1,
    `actual tier=${byType['BROKERAGE'].tier}`
  );
  check(
    '8c. RETIREMENT_401K tier = 2 (per audit: retirement is Tier 2)',
    '2', String(byType['RETIREMENT_401K'].tier), byType['RETIREMENT_401K'].tier === 2,
    `actual tier=${byType['RETIREMENT_401K'].tier}`
  );
  check(
    '8d. GIFT_FUNDS tier = 3 (per audit: gift/business are Tier 3, NOT EXCLUDED)',
    '3', String(byType['GIFT_FUNDS'].tier), byType['GIFT_FUNDS'].tier === 3,
    `actual tier=${byType['GIFT_FUNDS'].tier}, haircut=${byType['GIFT_FUNDS'].haircut}%`
  );
  check(
    '8e. BUSINESS_ACCOUNT tier = 3',
    '3', String(byType['BUSINESS_ACCOUNT'].tier), byType['BUSINESS_ACCOUNT'].tier === 3
  );
  check(
    '8f. UNSECURED_BORROWED tier = EXCLUDED (100% haircut)',
    'EXCLUDED',
    String(byType['UNSECURED_BORROWED'].tier),
    byType['UNSECURED_BORROWED'].tier === 'EXCLUDED' && byType['UNSECURED_BORROWED'].haircut === 100,
    `actual: tier=${byType['UNSECURED_BORROWED'].tier}, haircut=${byType['UNSECURED_BORROWED'].haircut}%`
  );
  check(
    '8g. GIFT_FUNDS eligible > 0 (NOT excluded from reserves)',
    '>0',
    `$${byType['GIFT_FUNDS'].eligible}`,
    byType['GIFT_FUNDS'].eligible > 0,
    `Deephaven accepts gift funds per v6.0 audit — must be Tier 3, not EXCLUDED`
  );
}

// ============================================================
// TEST 9: STR strategy overlay — +3 months
// ============================================================
{
  const str = computeReserveScenarios(1.30, MONTHLY_PITIA, 'STR', defaultBorrower(), defaultLoan(), 'TN', NO_ASSETS);
  const ltr = computeReserveScenarios(1.30, MONTHLY_PITIA, 'LTR', defaultBorrower(), defaultLoan(), 'TN', NO_ASSETS);

  const strAdj = str.conservative.adjustments.find(a => a.factor.includes('STR'));
  check(
    '9a. STR strategy adjustment recorded',
    'STR Strategy: +3',
    strAdj ? `${strAdj.factor}: +${strAdj.monthsAdded}` : 'absent',
    !!strAdj && strAdj.monthsAdded === 3
  );
  check(
    '9b. STR Conservative months > LTR Conservative months (by 3)',
    `LTR=${ltr.conservative.totalMonths}, STR=${ltr.conservative.totalMonths + 3}`,
    `LTR=${ltr.conservative.totalMonths}, STR=${str.conservative.totalMonths}`,
    str.conservative.totalMonths === ltr.conservative.totalMonths + 3
  );
}

// ============================================================
// TEST 10: Borrower overlays — first-time investor +3, foreign national +6
// ============================================================
{
  // First-time investor (+3) — base DSCR 1.30, conservative base = 6, +3 = 9
  const firstTime = computeReserveScenarios(
    1.30, MONTHLY_PITIA, 'LTR',
    defaultBorrower({ experience: 'FIRST_TIME' }),
    defaultLoan(), 'TN', NO_ASSETS
  );
  const ftAdj = firstTime.conservative.adjustments.find(a => a.factor.includes('First-Time'));
  check(
    '10a. First-time investor adjustment = +3',
    '+3',
    ftAdj ? `+${ftAdj.monthsAdded}` : 'absent',
    !!ftAdj && ftAdj.monthsAdded === 3
  );

  // Foreign national (+6) — base DSCR 1.30, conservative base = 6, +6 = 12
  const foreign = computeReserveScenarios(
    1.30, MONTHLY_PITIA, 'LTR',
    defaultBorrower({ isForeignNational: true }),
    defaultLoan(), 'TN', NO_ASSETS
  );
  const fnAdj = foreign.conservative.adjustments.find(a => a.factor.includes('Foreign'));
  check(
    '10b. Foreign national adjustment = +6',
    '+6',
    fnAdj ? `+${fnAdj.monthsAdded}` : 'absent',
    !!fnAdj && fnAdj.monthsAdded === 6
  );
}

// ============================================================
// TEST 11: LTV overlay — LTV > 80% adds +1 month
// ============================================================
{
  const highLtv = computeReserveScenarios(
    1.30, MONTHLY_PITIA, 'LTR', defaultBorrower(),
    defaultLoan({ ltv: 85 }), 'TN', NO_ASSETS
  );
  const lowLtv = computeReserveScenarios(
    1.30, MONTHLY_PITIA, 'LTR', defaultBorrower(),
    defaultLoan({ ltv: 75 }), 'TN', NO_ASSETS
  );
  const ltvAdj = highLtv.conservative.adjustments.find(a => a.factor.includes('LTV'));
  check(
    '11a. LTV > 80% adjustment recorded (+1 month)',
    '+1',
    ltvAdj ? `+${ltvAdj.monthsAdded}` : 'absent',
    !!ltvAdj && ltvAdj.monthsAdded === 1
  );
  check(
    '11b. LTV <= 80% does NOT trigger overlay',
    'absent',
    lowLtv.conservative.adjustments.find(a => a.factor.includes('LTV')) ? 'present' : 'absent',
    !lowLtv.conservative.adjustments.find(a => a.factor.includes('LTV'))
  );
}

// ============================================================
// TEST 12: Shortfall calculation
// shortfall = max(0, totalDollars - totalEligibleReserves)
// ============================================================
{
  // $100K in 401k → ~$70K eligible. Conservative months for DSCR 1.30 = 6, PITIA = $2,854
  // totalDollars = 6 × 2854 = $17,124. shortfall = max(0, 17124 - 70000) = 0
  const sufficient = computeReserveScenarios(
    1.30, MONTHLY_PITIA, 'LTR', defaultBorrower(),
    defaultLoan(), 'TN', [{ type: 'RETIREMENT_401K', value: 100_000 }]
  );
  check(
    '12a. Shortfall = 0 when eligible reserves cover requirement',
    '0',
    `$${sufficient.conservative.shortfall.toFixed(0)}`,
    sufficient.conservative.shortfall === 0,
    `totalDollars=$${sufficient.conservative.totalDollars.toFixed(0)}, eligible=$${sufficient.conservative.totalEligibleReserves.toFixed(0)}`
  );

  // Insufficient: $5K in checking, conservative=6 months × $2,854 = $17,124 needed, $5K available → shortfall = $12,124
  const insufficient = computeReserveScenarios(
    1.30, MONTHLY_PITIA, 'LTR', defaultBorrower(),
    defaultLoan(), 'TN', [{ type: 'CHECKING', value: 5_000 }]
  );
  const expectedShortfall = Math.max(0, 6 * 2854 - 5000);
  check(
    '12b. Shortfall > 0 when eligible reserves insufficient',
    `$${expectedShortfall.toFixed(0)}`,
    `$${insufficient.conservative.shortfall.toFixed(0)}`,
    Math.abs(insufficient.conservative.shortfall - expectedShortfall) < 1,
    `totalDollars=$${insufficient.conservative.totalDollars.toFixed(0)}, eligible=$${insufficient.conservative.totalEligibleReserves.toFixed(0)}`
  );
  check(
    '12c. Shortfall never negative (clamped to 0)',
    '>=0',
    String(insufficient.conservative.shortfall >= 0),
    insufficient.conservative.shortfall >= 0
  );
}

// ============================================================
// TEST 13: Tier escalation monotonicity
// As DSCR decreases, required reserves should monotonically increase
// ============================================================
{
  const tiers = [
    { dscr: 1.50, expectedLikely: 3 },
    { dscr: 1.30, expectedLikely: 3 },
    { dscr: 1.10, expectedLikely: 6 },
    { dscr: 0.95, expectedLikely: 9 },
    { dscr: 0.85, expectedLikely: 9 },
    { dscr: 0.70, expectedLikely: 12 },
    { dscr: 0.50, expectedLikely: 12 },
  ];
  let allEscalate = true;
  let prev = 0;
  let failures: string[] = [];
  for (const t of tiers) {
    const r = computeReserveScenarios(t.dscr, MONTHLY_PITIA, 'LTR', defaultBorrower(), defaultLoan(), 'TN', NO_ASSETS);
    if (r.likely.totalMonths < prev) {
      allEscalate = false;
      failures.push(`DSCR ${t.dscr}: likely=${r.likely.totalMonths} < prev ${prev}`);
    }
    if (r.likely.totalMonths !== t.expectedLikely) {
      failures.push(`DSCR ${t.dscr}: likely=${r.likely.totalMonths}, expected ${t.expectedLikely}`);
    }
    prev = r.likely.totalMonths;
  }
  check(
    '13. Tier escalation monotonic (lower DSCR → >= reserves)',
    'monotonic non-decreasing',
    failures.length === 0 ? 'monotonic' : failures.join('; '),
    allEscalate && failures.length === 0
  );
}

// ============================================================
// SUMMARY
// ============================================================
const passed = results.filter(r => r.pass).length;
const failed = results.length - passed;

console.log('\n' + '='.repeat(80));
console.log('AUDIT-6: RESERVE ENGINE VERIFICATION');
console.log('='.repeat(80));
console.log(`Total checks: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Pass rate: ${(passed / results.length * 100).toFixed(1)}%`);
console.log('='.repeat(80) + '\n');

for (const r of results) {
  const mark = r.pass ? '✓' : '✗';
  console.log(`${mark} ${r.name}`);
  if (!r.pass) {
    console.log(`    Expected: ${r.expected}`);
    console.log(`    Actual:   ${r.actual}`);
    if (r.details) console.log(`    Details:  ${r.details}`);
  }
}

console.log('\n' + '='.repeat(80));
if (failed === 0) {
  console.log('✅ ALL AUDIT-6 RESERVE ENGINE CHECKS PASSED');
} else {
  console.log(`❌ ${failed} CHECKS FAILED — see details above`);
}
console.log('='.repeat(80) + '\n');

process.exit(failed === 0 ? 0 : 1);
