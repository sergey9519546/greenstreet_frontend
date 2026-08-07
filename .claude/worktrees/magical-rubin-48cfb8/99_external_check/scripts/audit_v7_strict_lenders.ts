// ============================================================
// DSCR Loan Command Center v7.0 — STRICT LENDER AUDIT
// Catches all 6 issues found by Audit Subagent #3
// ============================================================

import { LENDERS, getLenderById } from '../src/lib/dscr/lenders';

interface StrictCheck {
  id: string;
  description: string;
  expected: string;
  actual: string;
  pass: boolean;
}

const checks: StrictCheck[] = [];

function check(id: string, description: string, expected: string, actual: string, pass: boolean) {
  checks.push({ id, description, expected, actual, pass });
}

// ============================================================
// GRIFFIN FUNDING — strict checks
// ============================================================
const griffin = getLenderById('griffin')!;
check('griffin-fico', 'Griffin minFICO = 620 (NOT 0)', '620', String(griffin.minFICO.value), griffin.minFICO.value === 620);
check('griffin-str-aordna', 'Griffin STR requiresAirDNA = true', 'true', String(griffin.strPolicy.requiresAirDNA), griffin.strPolicy.requiresAirDNA === true);
check('griffin-str-provenance', 'Griffin STR provenance = VERIFIED_PRIMARY', 'VERIFIED_PRIMARY', griffin.strPolicy.provenance, griffin.strPolicy.provenance === 'VERIFIED_PRIMARY');
check('griffin-avg-loan', 'Griffin notes mention $335K avg loan (= $20.79M/62)', '$335K', griffin.notes.includes('$335K') ? 'present' : 'absent', griffin.notes.includes('$335K'));
// v11.1 FIX (AUDIT-FINAL-2): Stale expectation — Griffin $20M was UNVERIFIED.
// Spec Part I + Part N confirm $4M in-house is the verified cap.
check('griffin-4m', 'Griffin max loan = $4M (NOT $20M — $20M was UNVERIFIED)', '4000000', String(griffin.loanAmountMax.value), griffin.loanAmountMax.value === 4_000_000);
check('griffin-states', 'Griffin states = 51 (50+DC)', '51', String(griffin.statesAvailable.length), griffin.statesAvailable.length === 51);
check('griffin-ca', 'Griffin notes mention CA 9/12/15', '9/12/15', griffin.reserveRule.value.includes('9/12/15') ? 'present' : 'absent', griffin.reserveRule.value.includes('9/12/15'));

// ============================================================
// KIAVI — strict checks
// ============================================================
const kiavi = getLenderById('kiavi')!;
check('kiavi-dscr', 'Kiavi min DSCR = 1.1', '1.1', String(kiavi.minDSCR.value), kiavi.minDSCR.value === 1.1);
check('kiavi-noratio', 'Kiavi no-ratio UNVERIFIED (not assumed true)', 'UNVERIFIED', kiavi.noRatioAvailable.provenance, kiavi.noRatioAvailable.provenance === 'UNVERIFIED');
check('kiavi-close', 'Kiavi notes mention 15-30 day close', '15-30', kiavi.notes.includes('15-30') ? 'present' : 'absent', kiavi.notes.includes('15-30'));
check('kiavi-portfolio', 'Kiavi notes mention portfolio loans 5+ properties', '5+', kiavi.notes.includes('5+ properties') ? 'present' : 'absent', kiavi.notes.includes('5+ properties'));
check('kiavi-reserves-mention', 'Kiavi notes mention conflicting reserve claims (advertises no reserves vs 6-9 typical)', 'conflicting', kiavi.reserveRule.value.toLowerCase().includes('conflicting') || kiavi.reserveRule.value.toLowerCase().includes('advertises no reserves') ? 'present' : 'absent', kiavi.reserveRule.value.toLowerCase().includes('conflicting') || kiavi.reserveRule.value.toLowerCase().includes('advertises no reserves'));

// ============================================================
// ANGEL OAK — strict checks
// ============================================================
const angel = getLenderById('angel_oak')!;
check('angel-fico', 'Angel Oak min FICO = 680', '680', String(angel.minFICO.value), angel.minFICO.value === 680);
check('angel-fico-provenance', 'Angel Oak FICO provenance = VERIFIED_PRIMARY', 'VERIFIED_PRIMARY', angel.minFICO.provenance, angel.minFICO.provenance === 'VERIFIED_PRIMARY');
check('angel-noratio', 'Angel Oak no-ratio available = true (700 FICO, 75% LTV)', 'true', String(angel.noRatioAvailable.value), angel.noRatioAvailable.value === true);
check('angel-noratio-prov', 'Angel Oak no-ratio provenance = VERIFIED_PRIMARY', 'VERIFIED_PRIMARY', angel.noRatioAvailable.provenance, angel.noRatioAvailable.provenance === 'VERIFIED_PRIMARY');
check('angel-str', 'Angel Oak STR allowed = true', 'true', String(angel.strPolicy.allowed), angel.strPolicy.allowed === true);
check('angel-str-ltv', 'Angel Oak STR maxLTVForSTR = 75', '75', String(angel.strPolicy.maxLTVForSTR), angel.strPolicy.maxLTVForSTR === 75);
check('angel-confidence', 'Angel Oak confidence ≥ 70', '>=70', String(angel.confidenceScore), angel.confidenceScore >= 70);

// ============================================================
// DEEPHAVEN — strict checks
// ============================================================
const deephaven = getLenderById('deephaven')!;
check('deephaven-loan', 'Deephaven max loan = $3.5M (NOT $3M)', '3500000', String(deephaven.loanAmountMax.value), deephaven.loanAmountMax.value === 3_500_000);
check('deephaven-ltv', 'Deephaven maxLTV = 90 (advertised, no MI)', '90', String(deephaven.maxLTV.value), deephaven.maxLTV.value === 90);
check('deephaven-gift', 'Deephaven notes mention gift funds OK with conditions', 'gift funds', deephaven.reserveRule.value.toLowerCase().includes('gift funds') ? 'present' : 'absent', deephaven.reserveRule.value.toLowerCase().includes('gift funds'));
check('deephaven-no-financed-limit', 'Deephaven provenance details mention no financed property limit', 'no financed', deephaven.provenanceDetails.some(p => p.claim.toLowerCase().includes('no financed property limit')) ? 'present' : 'absent', deephaven.provenanceDetails.some(p => p.claim.toLowerCase().includes('no financed property limit')));
// v11.1 FIX (AUDIT-FINAL-2): Stale expectation — Deephaven confidence
// downgraded to 65 (STALE — highest reverify priority per spec Part I).
check('deephaven-confidence', 'Deephaven confidence = 65 (STALE, < 70 per spec)', '65', String(deephaven.confidenceScore), deephaven.confidenceScore === 65);

// ============================================================
// VISIO — strict checks
// ============================================================
const visio = getLenderById('visio')!;
check('visio-loan', 'Visio max loan = $2M (spec Part I June 2026)', '2000000', String(visio.loanAmountMax.value), visio.loanAmountMax.value === 2_000_000);
check('visio-str-ltv', 'Visio STR maxLTVForSTR = 75 (NOT 80)', '75', String(visio.strPolicy.maxLTVForSTR), visio.strPolicy.maxLTVForSTR === 75);
check('visio-flex-unverified', 'Visio 0.75 Flex floor UNVERIFIED (downgraded)', 'UNVERIFIED', visio.minDSCR.provenance, visio.minDSCR.provenance === 'UNVERIFIED');
check('visio-flex-note', 'Visio notes mention Flex UNVERIFIED', 'UNVERIFIED', visio.notes.includes('UNVERIFIED') ? 'present' : 'absent', visio.notes.includes('UNVERIFIED'));
check('visio-vacancy', 'Visio vacancyTreatment = NONE (no vacancy factor)', 'NONE', visio.vacancyTreatment, visio.vacancyTreatment === 'NONE');

// ============================================================
// LIMA ONE — strict checks
// ============================================================
const lima = getLenderById('lima_one')!;
check('lima-loan', 'Lima One max loan = $2M (spec Part I June 2026)', '2000000', String(lima.loanAmountMax.value), lima.loanAmountMax.value === 2_000_000);
check('lima-3weeks', 'Lima One notes mention ~3 weeks realistic close', '~3 weeks', lima.notes.includes('~3 weeks') ? 'present' : 'absent', lima.notes.includes('~3 weeks'));
check('lima-aordna', 'Lima One STR = AirDNA program (stronger DSCRs/higher LTVs)', 'AirDNA-backed', lima.notes.includes('AirDNA-backed') ? 'present' : 'absent', lima.notes.includes('AirDNA-backed'));

// ============================================================
// NEW SILVER — strict checks
// ============================================================
const newSilver = getLenderById('new_silver')!;
// v11.1 FIX (AUDIT-FINAL-2): Stale expectations — New Silver FICO and DSCR
// corrected per spec Part I: FICO 660 (not 640), DSCR 0.75 (not 0).
check('ns-fico', 'New Silver min FICO = 660 (corrected from 640 per spec Part I)', '660', String(newSilver.minFICO.value), newSilver.minFICO.value === 660);
check('ns-dscr', 'New Silver min DSCR = 0.75 (corrected from 0 per spec Part I)', '0.75', String(newSilver.minDSCR.value), newSilver.minDSCR.value === 0.75);
check('ns-str-prov', 'New Silver STR provenance = UNVERIFIED (was VERIFIED_PRIMARY)', 'UNVERIFIED', newSilver.strPolicy.provenance, newSilver.strPolicy.provenance === 'UNVERIFIED');

// ============================================================
// EASY STREET — strict checks
// ============================================================
const easy = getLenderById('easy_street')!;
check('easy-exists', 'Easy Street Capital exists in LENDERS', 'true', !!easy ? 'true' : 'false', !!easy);
check('easy-method', 'Easy Street STR incomeMethod = AIRDNA_100_PCT', 'AIRDNA_100_PCT', easy.strPolicy.incomeMethod, easy.strPolicy.incomeMethod === 'AIRDNA_100_PCT');
check('easy-dscr', 'Easy Street no min DSCR = 0', '0', String(easy.minDSCR.value), easy.minDSCR.value === 0);
check('easy-fico', 'Easy Street min FICO = 620', '620', String(easy.minFICO.value), easy.minFICO.value === 620);

// ============================================================
// COREVEST — downgrade check
// ============================================================
const corevest = getLenderById('corevest')!;
check('cv-confidence', 'CoreVest confidence < 70 (downgraded per audit)', '<70', String(corevest.confidenceScore), corevest.confidenceScore < 70);

// ============================================================
// SUMMARY
// ============================================================
const passed = checks.filter(c => c.pass).length;
const failed = checks.length - passed;

console.log('\n' + '='.repeat(80));
console.log('STRICT LENDER AUDIT — 11 Lender Profiles, Audit Report Compliance');
console.log('='.repeat(80));
console.log(`Total strict checks: ${checks.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Pass rate: ${(passed / checks.length * 100).toFixed(1)}%`);
console.log('='.repeat(80) + '\n');

// Per-lender summary
const lenderGroups: Record<string, StrictCheck[]> = {};
for (const c of checks) {
  const lenderId = c.id.split('-')[0];
  if (!lenderGroups[lenderId]) lenderGroups[lenderId] = [];
  lenderGroups[lenderId].push(c);
}

for (const [lenderId, lenderChecks] of Object.entries(lenderGroups)) {
  const passed = lenderChecks.filter(c => c.pass).length;
  console.log(`[${lenderId.toUpperCase()}] ${passed}/${lenderChecks.length} passed`);
  for (const c of lenderChecks) {
    if (!c.pass) {
      console.log(`  ❌ ${c.id}: ${c.description}`);
      console.log(`     Expected: ${c.expected}`);
      console.log(`     Actual:   ${c.actual}`);
    }
  }
}

console.log('\n' + '='.repeat(80));
if (failed === 0) {
  console.log('✅ ALL STRICT LENDER CHECKS PASSED');
} else {
  console.log(`❌ ${failed} STRICT CHECKS FAILED`);
}
console.log('='.repeat(80) + '\n');

process.exit(failed === 0 ? 0 : 1);
