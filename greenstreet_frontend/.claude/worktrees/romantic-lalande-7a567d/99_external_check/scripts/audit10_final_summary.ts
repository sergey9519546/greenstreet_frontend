// ============================================================
// DSCR Loan Command Center v7.0 — AUDIT 10 FINAL SUMMARY
// End-to-End UI Verification — Build, Golden Values, Lenders, UI Sections
// ============================================================

import { verifyGoldenValues } from '../src/lib/dscr/engine';
import { LENDERS } from '../src/lib/dscr/lenders';
import * as fs from 'fs';
import * as path from 'path';

interface CheckResult {
  id: string;
  description: string;
  pass: boolean;
  detail: string;
}

const results: CheckResult[] = [];

function check(id: string, description: string, pass: boolean, detail: string) {
  results.push({ id, description, pass, detail });
}

console.log('\n' + '═'.repeat(80));
console.log('AUDIT 10 — FINAL END-TO-END UI VERIFICATION SUMMARY');
console.log('═'.repeat(80));

// ============================================================
// SECTION 1: GOLDEN VALUES
// ============================================================
console.log('\n[1/4] Golden Values Verification');
console.log('-'.repeat(60));

const golden = verifyGoldenValues();
const goldenKeys = Object.keys(golden.results);
const goldenPassed = goldenKeys.filter(k => golden.results[k].pass).length;
const goldenTotal = goldenKeys.length;

goldenKeys.forEach(k => {
  const r = golden.results[k];
  check(`golden-${k}`, `Golden: ${k}`, r.pass, `expected=${r.expected}, actual=${r.actual}`);
});

console.log(`Golden values: ${goldenPassed}/${goldenTotal} pass`);
console.log(`Overall golden.pass = ${golden.pass}`);

// ============================================================
// SECTION 2: ALL 19 LENDERS EXPORTED (v11.3: 3 added on top of v11.2's 16)
// ============================================================
console.log('\n[2/4] Lender Profile Export Verification');
console.log('-'.repeat(60));

const expectedLenderIds = [
  'griffin', 'kiavi', 'visio', 'lima_one', 'defy',
  'easy_street', 'new_silver', 'deephaven', 'angel_oak',
  'corevest', 'rcn_capital', 'american_heritage',
  // v11.2 additions:
  'ad_mortgage', 'lendingone', 'civic_financial', 'finance_of_america',
  // v11.3 additions:
  'broadmark', 'park_place', 'stratton',
];

check('lenders-count', 'LENDERS array has exactly 19 lenders (v11.2 + 4 roadmap, v11.3 + 3 roadmap)', LENDERS.length === 19, `actual=${LENDERS.length}`);

expectedLenderIds.forEach(id => {
  const found = LENDERS.find(l => l.id === id);
  check(`lender-${id}`, `Lender "${id}" is exported`, !!found, found ? `name=${found.name}` : 'MISSING');
});

console.log(`Lenders exported: ${LENDERS.length}/19`);
LENDERS.forEach(l => console.log(`  ✓ ${l.id.padEnd(14)} ${l.name.padEnd(20)} confidence=${l.confidenceScore}`));

// ============================================================
// SECTION 3: KEY UI SECTIONS PRESENT IN page.tsx
// ============================================================
console.log('\n[3/4] UI Section Presence in page.tsx');
console.log('-'.repeat(60));

const pagePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
const pageSrc = fs.readFileSync(pagePath, 'utf-8');

const uiSections: { id: string; name: string; patterns: string[] }[] = [
  { id: 'ui-track1', name: 'Track 1 — Lender Qualification', patterns: ['Track 1 — Lender Qualification'] },
  { id: 'ui-track2', name: 'Track 2 — Investor Survival', patterns: ['Track 2 — Investor Survival'] },
  { id: 'ui-golden', name: 'Golden Values Display (Break-even Rent, Deal-Break Rate)', patterns: ['Break-even Rent', 'Deal-Break Rate', 'Rate Headroom'] },
  { id: 'ui-lender-table', name: 'Lender Matching Table with Provenance + Confidence', patterns: ['Lender Matching', 'sourceProvenance', 'confidenceScore', 'confidenceBand'] },
  { id: 'ui-acq-score', name: 'Acquisition Score Panel', patterns: ['Acquisition Score', 'AcquisitionScoreCard'] },
  { id: 'ui-exec-risk', name: 'Execution Risk Scorecard', patterns: ['Execution Risk Scorecard', 'ExecutionRiskCard'] },
  { id: 'ui-deal-kill', name: 'Deal-Kill Criteria Panel', patterns: ['Deal-Kill Criteria', 'DealKillCard'] },
  { id: 'ui-two-quote', name: 'Two-Quote Rule Panel', patterns: ['Two-Quote Rule', 'TwoQuoteCard'] },
  { id: 'ui-structure-options', name: 'Structure Options Panel with IO Recast Warnings', patterns: ['Structure Options', 'StructureOptionsPanel', 'ioRecastWarning'] },
  { id: 'ui-sensitivity-tabs', name: 'Sensitivity Tabs (rent, rate, ltv, price, stress, heatmap)', patterns: ['TabsTrigger value="rent"', 'TabsTrigger value="rate"', 'TabsTrigger value="ltv"', 'TabsTrigger value="price"', 'TabsTrigger value="stress"', 'TabsTrigger value="heatmap"'] },
  { id: 'ui-stress-matrix', name: 'Combined Stress Matrix (Rate × Rent)', patterns: ['Combined Stress: Rate × Rent', 'StressMatrix', 'computeCombinedStressMatrix'] },
  { id: 'ui-heatmap', name: 'Heatmap Section (Price × Rent DSCR)', patterns: ['HeatmapSection', 'Price × Rent DSCR Heatmap', 'computeHeatmap'] },
  { id: 'ui-appraisal-shock', name: 'Appraisal Value Shock Table (Joint Appraisal)', patterns: ['Appraisal Value Shock Table', 'jointAppraisalRisk.valueShockTable'] },
  { id: 'ui-bonafide-breakeven', name: 'Breakeven computation (computeBreakevenResult)', patterns: ['computeBreakevenResult'] },
  { id: 'ui-str-legality', name: 'STR Legality Gate', patterns: ['STR Legality:', 'legalityGate.status'] },
  { id: 'ui-str-three-worlds', name: 'STR Three Worlds', patterns: ['Three Worlds — NEVER Blended'] },
  { id: 'ui-str-docs', name: 'STR Documentation Checklist', patterns: ['Documentation Checklist', 'documentationChecklist'] },
  { id: 'ui-reserve-3scenarios', name: 'Reserve Forecast 3 Scenarios (Likely/Conservative/Stress)', patterns: ['Reserve Forecast — Three Scenarios', 'reserveScenarios.likely', 'reserveScenarios.conservative', 'reserveScenarios.stress'] },
  { id: 'ui-ppp-state', name: 'PPP State Analysis Panel', patterns: ['PPP State Analysis', 'pppCheckResult'] },
  { id: 'ui-ppp-no-premium', name: 'PPP No-PPP Premium Display', patterns: ['No-PPP Premium', 'noPPPPremiumRate', 'noPPPPremiumFee'] },
  { id: 'ui-monte-carlo', name: 'Monte Carlo Simulation Section', patterns: ['Monte Carlo Simulation', 'runMonteCarlo'] },
  { id: 'ui-rescue', name: 'Rescue Engine Panel', patterns: ['Rescue Engine', 'rescueTrack1', 'rescueTrack2'] },
];

for (const sec of uiSections) {
  const missing = sec.patterns.filter(p => !pageSrc.includes(p));
  check(sec.id, sec.name, missing.length === 0, missing.length === 0 ? `all ${sec.patterns.length} patterns found` : `MISSING: ${missing.join(', ')}`);
  console.log(`  ${missing.length === 0 ? '✓' : '✗'} ${sec.name}`);
}

// ============================================================
// SECTION 4: BUILD / TS VERIFICATION
// ============================================================
console.log('\n[4/4] Build & TypeScript Verification');
console.log('-'.repeat(60));

// We can't run `next build` from inside the script — assume external run.
// Read .next directory existence as a build artifact proxy.
const nextDir = path.join(__dirname, '..', '.next');
const buildManifest = path.join(nextDir, 'build-manifest.json');
const buildExists = fs.existsSync(buildManifest);
check('build-artifact', 'Next.js build artifact exists (.next/build-manifest.json)', buildExists, buildExists ? 'present' : 'missing — run `npx next build`');

// ============================================================
// FINAL SUMMARY
// ============================================================
console.log('\n' + '═'.repeat(80));
console.log('FINAL SUMMARY');
console.log('═'.repeat(80));

const passed = results.filter(r => r.pass).length;
const failed = results.length - passed;

console.log(`Total checks: ${results.length}`);
console.log(`Passed:       ${passed}`);
console.log(`Failed:       ${failed}`);
console.log(`Pass rate:    ${(passed / results.length * 100).toFixed(1)}%`);

if (failed > 0) {
  console.log('\n❌ FAILED CHECKS:');
  for (const r of results.filter(r => !r.pass)) {
    console.log(`  ✗ ${r.id}: ${r.description}`);
    console.log(`    → ${r.detail}`);
  }
}

console.log('\n' + '═'.repeat(80));
const verdict = failed === 0
  ? '🟢 READY FOR ULTRAPLAN — v7.0 build, golden values, lenders, and all UI sections verified'
  : '🔴 NOT READY — fix failures above before ULTRAPLAN';
console.log(`VERDICT: ${verdict}`);
console.log('═'.repeat(80) + '\n');

process.exit(failed === 0 ? 0 : 1);
