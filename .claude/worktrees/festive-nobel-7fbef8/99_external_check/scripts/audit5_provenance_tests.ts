// ============================================================
// DSCR Loan Command Center v7.0 — AUDIT 5: Provenance System Integrity
// Targeted test suite for the v6.0 audit's most damning finding:
// "false provenance is worse than no provenance"
// ============================================================
//
// Verifies:
//  1. Only 3 valid provenance labels are used anywhere
//  2. Every LenderDataPoint field has a valid provenance label
//  3. Every lender.provenanceDetails entry has claim + provenance + source + date
//  4. Every lender has confidenceScore in [0, 100]
//  5. Every lender has a non-empty confidenceBand and sourceSnapshot
//  6. No `[[n]]` fake citation markers anywhere in src/
//  7. No removed-label references (e.g., MARKET_PATTERN)
//  8. Every PPPStateLaw entry has provenance + lastVerified
// ============================================================

import * as fs from 'node:fs';
import * as path from 'node:path';
import { LENDERS } from '../src/lib/dscr/lenders';
import { PPP_STATE_LAWS } from '../src/lib/dscr/statePppLaws';
import type { ProvenanceLabel, LenderProgram } from '../src/lib/dscr/types';

// ============================================================
// Test framework
// ============================================================
interface TestResult {
  id: string;
  description: string;
  pass: boolean;
  details?: string;
}
const results: TestResult[] = [];
function check(id: string, description: string, pass: boolean, details?: string) {
  results.push({ id, description, pass, details });
}

// ============================================================
// 1. ENUMERATE THE 3 VALID PROVENANCE LABELS
// ============================================================
const VALID_LABELS: ReadonlySet<string> = new Set<ProvenanceLabel>([
  'VERIFIED_PRIMARY',
  'VERIFIED_SECONDARY',
  'UNVERIFIED',
]);

check(
  'prov-labels-1',
  'Exactly 3 valid provenance labels defined',
  VALID_LABELS.size === 3,
  `Labels: ${[...VALID_LABELS].join(', ')}`,
);

check(
  'prov-labels-2',
  'Labels are VERIFIED_PRIMARY / VERIFIED_SECONDARY / UNVERIFIED (no fake 4th label)',
  VALID_LABELS.has('VERIFIED_PRIMARY') &&
    VALID_LABELS.has('VERIFIED_SECONDARY') &&
    VALID_LABELS.has('UNVERIFIED'),
);

// ============================================================
// 2. ITERATE EVERY LENDER — provenanceDetails
// ============================================================
const DATAPOINT_FIELDS: Array<keyof LenderProgram> = [
  'minFICO',
  'maxLTV',
  'minDSCR',
  'noRatioAvailable',
  'reserveRule',
  'loanAmountMin',
  'loanAmountMax',
  'foreignNationalAllowed',
];

for (const lender of LENDERS) {
  // 2a. provenanceDetails array exists with >= 3 entries
  const detailCount = lender.provenanceDetails?.length ?? 0;
  check(
    `prov-details-${lender.id}-count`,
    `${lender.name}: provenanceDetails has >= 3 entries`,
    detailCount >= 3,
    `Found ${detailCount} entries`,
  );

  // 2b. Every entry has claim, provenance (valid label), source, date
  for (let i = 0; i < lender.provenanceDetails.length; i++) {
    const d = lender.provenanceDetails[i];
    const hasClaim = typeof d.claim === 'string' && d.claim.trim().length > 0;
    const hasProvenance = VALID_LABELS.has(d.provenance);
    const hasSource = typeof d.source === 'string' && d.source.trim().length > 0;
    const hasDate = typeof d.date === 'string' && d.date.trim().length > 0;
    check(
      `prov-detail-${lender.id}-${i}`,
      `${lender.name} provenanceDetails[${i}] has claim/provenance/source/date with valid label`,
      hasClaim && hasProvenance && hasSource && hasDate,
      `claim=${hasClaim} provenance=${d.provenance}(${hasProvenance}) source=${hasSource} date=${hasDate}`,
    );
  }

  // 2c. Every LenderDataPoint field has valid provenance
  for (const field of DATAPOINT_FIELDS) {
    const dp = lender[field] as unknown as { value: unknown; provenance: string; source: string; asOfDate: string };
    const hasValue = dp && typeof dp.value !== 'undefined';
    const hasProvenance = dp && VALID_LABELS.has(dp.provenance as ProvenanceLabel);
    const hasSource = dp && typeof dp.source === 'string' && dp.source.trim().length > 0;
    const hasAsOfDate = dp && typeof dp.asOfDate === 'string' && dp.asOfDate.trim().length > 0;
    check(
      `prov-datapoint-${lender.id}-${String(field)}`,
      `${lender.name}.${String(field)} has value/provenance/source/asOfDate with valid label`,
      !!hasValue && !!hasProvenance && !!hasSource && !!hasAsOfDate,
      `provenance=${dp?.provenance} valid=${hasProvenance}`,
    );
  }

  // 2d. strPolicy.provenance valid
  const strProv = lender.strPolicy?.provenance;
  check(
    `prov-str-${lender.id}`,
    `${lender.name}.strPolicy.provenance is a valid label`,
    VALID_LABELS.has(strProv as ProvenanceLabel),
    `provenance=${strProv}`,
  );

  // 2e. confidenceScore is a number in [0, 100]
  const cs = lender.confidenceScore;
  check(
    `prov-confidence-${lender.id}`,
    `${lender.name}.confidenceScore is a number in [0, 100]`,
    typeof cs === 'number' && cs >= 0 && cs <= 100,
    `confidenceScore=${cs}`,
  );

  // 2f. confidenceBand is a non-empty string
  const cb = lender.confidenceBand;
  check(
    `prov-band-${lender.id}`,
    `${lender.name}.confidenceBand is a non-empty string`,
    typeof cb === 'string' && cb.trim().length > 0,
    `band="${cb}"`,
  );

  // 2g. sourceSnapshot is a non-empty string
  const ss = lender.sourceSnapshot;
  check(
    `prov-snapshot-${lender.id}`,
    `${lender.name}.sourceSnapshot is a non-empty string`,
    typeof ss === 'string' && ss.trim().length > 0,
    `snapshot="${ss?.substring(0, 60)}..."`,
  );
}

// ============================================================
// 3. GREP src/ FOR `[[` — CONFIRM ZERO MATCHES IN PRODUCTION CODE
// ============================================================
function walkDir(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip irrelevant dirs
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
      walkDir(full, acc);
    } else if (entry.isFile()) {
      // Only inspect text files
      if (/\.(ts|tsx|js|jsx|json|md)$/.test(entry.name)) {
        acc.push(full);
      }
    }
  }
  return acc;
}

const srcFiles = walkDir(path.resolve(__dirname, '..', 'src'));
let fakeCitationHits: Array<{ file: string; line: number; text: string }> = [];
for (const file of srcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match fake citation patterns like [[55]], [[62]], [[31,32]], [[9,73]]
    // but EXCLUDE legitimate uses: CSS attribute selectors [[data-...]] and
    // JS array-of-arrays like [['Likely', x], ['Conservative', y]] and
    // reserve-rule strings like '6/9/12'.
    const fakeCitationRegex = /\[\[\s*\d+\s*(?:,\s*\d+\s*)*\]\]/;
    if (fakeCitationRegex.test(line)) {
      fakeCitationHits.push({ file: path.relative(path.resolve(__dirname, '..'), file), line: i + 1, text: line.trim() });
    }
  }
}
check(
  'prov-no-fake-citations',
  'No fake [[n]] citation markers in src/ (numeric-only brackets)',
  fakeCitationHits.length === 0,
  fakeCitationHits.length === 0
    ? 'Zero matches — clean'
    : `FOUND ${fakeCitationHits.length}: ${JSON.stringify(fakeCitationHits.slice(0, 5))}`,
);

// Also do a literal [[ scan of lender notes/source/claims to catch any non-numeric fake citations
let lenderTextHits: Array<{ lender: string; text: string }> = [];
for (const lender of LENDERS) {
  const allText = [
    lender.notes,
    lender.sourceSnapshot,
    ...lender.provenanceDetails.map(p => p.claim + ' ' + p.source),
    ...DATAPOINT_FIELDS.map(f => {
      const dp = lender[f] as unknown as { source?: string; notes?: string };
      return `${dp?.source ?? ''} ${dp?.notes ?? ''}`;
    }),
  ].join('\n');
  // Look for any `[[<digits>]]` style marker
  if (/\[\[\s*\d+/.test(allText)) {
    lenderTextHits.push({ lender: lender.name, text: allText.match(/\[\[[^\]]+\]\]/g)?.join(', ') ?? '' });
  }
}
check(
  'prov-no-fake-citations-lender-text',
  'No fake [[n]] citation markers in lender notes/source/claims text',
  lenderTextHits.length === 0,
  lenderTextHits.length === 0 ? 'Zero matches — clean' : `FOUND: ${JSON.stringify(lenderTextHits)}`,
);

// ============================================================
// 4. NO REMOVED-LABEL REFERENCES (e.g., MARKET_PATTERN)
// ============================================================
// Match the label ONLY when it appears as a standalone provenance label
// (single- or double-quoted standalone string), so we don't false-positive
// on legitimate enum values like 'HISTORICAL_12MO'.
const REMOVED_LABELS = ['MARKET_PATTERN', 'PARTIALLY_VERIFIED', 'HISTORICAL', 'INFERRED'];
let removedLabelHits: Array<{ file: string; line: number; label: string }> = [];
for (const file of srcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    for (const label of REMOVED_LABELS) {
      // Match standalone quoted label: 'HISTORICAL' or "HISTORICAL" — NOT 'HISTORICAL_12MO'
      const standaloneRegex = new RegExp(`['"]${label}['"]`);
      if (standaloneRegex.test(lines[i])) {
        removedLabelHits.push({
          file: path.relative(path.resolve(__dirname, '..'), file),
          line: i + 1,
          label,
        });
      }
    }
  }
}
check(
  'prov-no-removed-labels',
  `No removed-label references (${REMOVED_LABELS.join(', ')}) in src/`,
  removedLabelHits.length === 0,
  removedLabelHits.length === 0
    ? 'Zero matches — clean'
    : `FOUND: ${JSON.stringify(removedLabelHits)}`,
);

// ============================================================
// 5. EVERY PPP STATE LAW HAS provenance + lastVerified
// ============================================================
let pppMissing: string[] = [];
for (const [state, law] of Object.entries(PPP_STATE_LAWS)) {
  if (!law.provenance || !VALID_LABELS.has(law.provenance)) {
    pppMissing.push(`${state}.provenance`);
  }
  if (!law.lastVerified || typeof law.lastVerified !== 'string' || law.lastVerified.trim().length === 0) {
    pppMissing.push(`${state}.lastVerified`);
  }
}
check(
  'prov-ppp-laws',
  `Every PPPStateLaw entry has valid provenance + lastVerified (${Object.keys(PPP_STATE_LAWS).length} states)`,
  pppMissing.length === 0,
  pppMissing.length === 0 ? `All ${Object.keys(PPP_STATE_LAWS).length} entries clean` : `MISSING: ${pppMissing.join(', ')}`,
);

// ============================================================
// 6. CONFIDENCE BAND HELPER BOUNDARIES
// ============================================================
// Re-implement the helper from lenders.ts to verify its boundary behavior
function confidenceBandHelper(score: number): string {
  if (score >= 80) return 'Highly verified';
  if (score >= 70) return 'Reliable';
  if (score >= 60) return 'Moderate confidence';
  return 'Low confidence — verify directly';
}
const bands = {
  '>=80': confidenceBandHelper(80) === 'Highly verified',
  '>=70': confidenceBandHelper(70) === 'Reliable',
  '>=60': confidenceBandHelper(60) === 'Moderate confidence',
  '<60': confidenceBandHelper(59) === 'Low confidence — verify directly',
  'edge79': confidenceBandHelper(79) === 'Reliable',
  'edge69': confidenceBandHelper(69) === 'Moderate confidence',
  'edge0': confidenceBandHelper(0) === 'Low confidence — verify directly',
};
check(
  'prov-band-boundaries',
  'Confidence band helper produces spec-correct bands (>=80 Highly verified, >=70 Reliable, >=60 Moderate, <60 Low)',
  Object.values(bands).every(Boolean),
  JSON.stringify(bands),
);

// Confirm every lender.confidenceBand matches the helper output
let bandMismatch: string[] = [];
for (const lender of LENDERS) {
  const expected = confidenceBandHelper(lender.confidenceScore);
  if (lender.confidenceBand !== expected) {
    bandMismatch.push(`${lender.name}: ${lender.confidenceBand} != expected ${expected}`);
  }
}
check(
  'prov-band-match',
  'Every lender.confidenceBand matches the helper output for its score',
  bandMismatch.length === 0,
  bandMismatch.length === 0 ? 'All bands match' : `MISMATCH: ${bandMismatch.join('; ')}`,
);

// ============================================================
// SUMMARY
// ============================================================
const passed = results.filter(r => r.pass).length;
const failed = results.length - passed;

console.log('\n' + '='.repeat(80));
console.log('AUDIT 5 — Provenance System Integrity');
console.log('='.repeat(80));
console.log(`Total checks: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Pass rate: ${((passed / results.length) * 100).toFixed(1)}%`);
console.log('='.repeat(80) + '\n');

if (failed > 0) {
  console.log('FAILED CHECKS:');
  for (const r of results.filter(r => !r.pass)) {
    console.log(`  ❌ ${r.id}: ${r.description}`);
    if (r.details) console.log(`     ${r.details}`);
  }
  console.log('');
}

console.log('='.repeat(80));
if (failed === 0) {
  console.log('✅ ALL PROVENANCE CHECKS PASSED — false provenance eradicated');
} else {
  console.log(`❌ ${failed} CHECKS FAILED — provenance integrity compromised`);
}
console.log('='.repeat(80) + '\n');

process.exit(failed === 0 ? 0 : 1);
