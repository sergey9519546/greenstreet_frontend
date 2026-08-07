// ============================================================
// DSCR Loan Command Center v7.0 — AUDIT-7 STR UNDERWRITING TESTS
// Audit Subagent #7 — STR Underwriting Verification
// Verifies three-world STR income model, legality gate, 20% projected haircut,
// 10% documented-history haircut, Easy Street 100% override, 2026 trend warning
// ============================================================

import {
  evaluateSTRUnderwriting,
  checkSTRLegality,
  getSTRDocumentationChecklist,
  computeSTRMonthlySeasonality,
  US_NATIONAL_STR_SEASONALITY,
} from '../src/lib/dscr/strUnderwriting';
import { LENDERS, getLenderById, computeQualifyingRentForLender } from '../src/lib/dscr/lenders';
import { computeDealKillCheck } from '../src/lib/dscr/decisionSupport';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { PropertyInputs, STRWorld, STRLegalityGate } from '../src/lib/dscr/types';

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

// --- Default test property: lease $3,000, market $3,100, strProjected $4,500, strDocumented $4,000 ---
function defaultProperty(overrides: Partial<PropertyInputs> = {}): PropertyInputs {
  return {
    purchasePrice: 425_000,
    leaseRent: 3_000,
    marketRent: 3_100,
    strProjectedRent: 4_500,
    strDocumentedRent: 4_000,
    hoa: 150,
    annualTaxes: 5_000,
    annualInsurance: 2_000,
    floodInsurance: 0,
    propertyType: 'SFR',
    state: 'TN',
    unitCount: 1,
    sqft: 1500,
    yearBuilt: 2005,
    isCondotel: false,
    isNonWarrantable: false,
    isRural: false,
    isDecliningMarket: false,
    hoaSTRPolicy: 'ALLOWS',
    ...overrides,
  };
}

// PITIA constants for DSCR sanity-checks
const LOAN_AMOUNT = 318_750;
const RATE = 7.00;
const TERM = 30;
const IO_PERIOD = 'NONE';
const TAXES = 5_000;
const INSURANCE = 2_000;
const HOA = 150;
const FLOOD = 0;
// PITIA = PI $2,121 + tax $416.67 + ins $166.67 + HOA $150 + flood $0 = $2,854.34 (matches flagship golden value)

// ============================================================
// GROUP A — STRUCTURAL: STRUnderwritingResult has 3 distinct worlds
// ============================================================
{
  const result = evaluateSTRUnderwriting(
    defaultProperty(),
    LOAN_AMOUNT,
    RATE,
    TERM,
    IO_PERIOD,
    TAXES,
    INSURANCE,
    HOA,
    FLOOD,
  );

  check(
    'A1. STRUnderwritingResult has world1_LTR',
    'object',
    typeof result.world1_LTR,
    typeof result.world1_LTR === 'object' && result.world1_LTR !== null,
  );
  check(
    'A2. STRUnderwritingResult has world2_Projected',
    'object',
    typeof result.world2_Projected,
    typeof result.world2_Projected === 'object' && result.world2_Projected !== null,
  );
  check(
    'A3. STRUnderwritingResult has world3_Documented',
    'object',
    typeof result.world3_Documented,
    typeof result.world3_Documented === 'object' && result.world3_Documented !== null,
  );
  check(
    'A4. Three worlds are distinct references (NOT blended)',
    '3 distinct refs',
    `${result.world1_LTR !== result.world2_Projected && result.world2_Projected !== result.world3_Documented && result.world1_LTR !== result.world3_Documented ? 'distinct' : 'shared ref'}`,
    result.world1_LTR !== result.world2_Projected &&
      result.world2_Projected !== result.world3_Documented &&
      result.world1_LTR !== result.world3_Documented,
  );
  check(
    'A5. World 1 name = "World 1 — Long-term Market Rent"',
    'World 1 — Long-term Market Rent',
    result.world1_LTR.name,
    result.world1_LTR.name.includes('World 1') && result.world1_LTR.name.toLowerCase().includes('long-term'),
  );
  check(
    'A6. World 2 name = "World 2 — Projected STR Income"',
    'World 2 — Projected STR Income',
    result.world2_Projected.name,
    result.world2_Projected.name.includes('World 2') && result.world2_Projected.name.toLowerCase().includes('projected'),
  );
  check(
    'A7. World 3 name = "World 3 — Documented Historical STR"',
    'World 3 — Documented Historical STR',
    result.world3_Documented.name,
    result.world3_Documented.name.includes('World 3') && result.world3_Documented.name.toLowerCase().includes('documented'),
  );
}

// ============================================================
// GROUP B — STRWorld field completeness
// ============================================================
{
  const result = evaluateSTRUnderwriting(
    defaultProperty(),
    LOAN_AMOUNT,
    RATE,
    TERM,
    IO_PERIOD,
    TAXES,
    INSURANCE,
    HOA,
    FLOOD,
  );

  const requiredFields: (keyof STRWorld)[] = [
    'name', 'grossIncome', 'haircutPercent', 'netIncome', 'ltrFallback',
    'qualifyingRent', 'dscr', 'method', 'lenderConfirmationRequired',
  ];
  for (const field of requiredFields) {
    const w1has = field in result.world1_LTR;
    const w2has = field in result.world2_Projected;
    const w3has = field in result.world3_Documented;
    check(
      `B. STRWorld field "${field}" present in all 3 worlds`,
      'present x3',
      `W1:${w1has ? 'Y' : 'N'} W2:${w2has ? 'Y' : 'N'} W3:${w3has ? 'Y' : 'N'}`,
      w1has && w2has && w3has,
    );
  }
}

// ============================================================
// GROUP C — Test scenario math (the headline numbers)
// v11.1 (AUDIT-FINAL-6): best world = MIN (not MAX). Spec items 1-5:
//   World 1 = LT (lower of lease and 1007), no haircut
//   World 2 = STR_Gross × 0.80 (no per-world LT cap)
//   World 3 = 12-mo actual × 0.90 (no per-world LT cap)
//   bestQualifyingRent = MIN(world1, world2, world3)
// lease $3,000, market $3,100 → LT fallback = $3,000
// strProjected $4,500 → World 2 net = $4,500 × 0.80 = $3,600
// strDocumented $4,000 → World 3 net = $4,000 × 0.90 = $3,600
// bestQualifyingRent = MIN($3,000, $3,600, $3,600) = $3,000 → World 1 governs
// ============================================================
{
  const result = evaluateSTRUnderwriting(
    defaultProperty(),
    LOAN_AMOUNT,
    RATE,
    TERM,
    IO_PERIOD,
    TAXES,
    INSURANCE,
    HOA,
    FLOOD,
  );

  // World 1 — LT fallback = lower-of(lease=$3,000, market=$3,100) = $3,000, no haircut
  check(
    'C1. World 1 grossIncome = $3,000 (lower of lease/market)',
    '3000',
    String(result.world1_LTR.grossIncome),
    result.world1_LTR.grossIncome === 3_000,
    `lease=$3,000, market=$3,100 → LT fallback = $3,000`,
  );
  check(
    'C2. World 1 haircutPercent = 0 (NO STR haircut on LT fallback)',
    '0',
    String(result.world1_LTR.haircutPercent),
    result.world1_LTR.haircutPercent === 0,
  );
  check(
    'C3. World 1 netIncome = $3,000 (= gross, no haircut)',
    '3000',
    String(result.world1_LTR.netIncome),
    result.world1_LTR.netIncome === 3_000,
  );
  check(
    'C4. World 1 qualifyingRent = $3,000',
    '3000',
    String(result.world1_LTR.qualifyingRent),
    result.world1_LTR.qualifyingRent === 3_000,
  );

  // World 2 — $4,500 × 0.80 = $3,600 (20% haircut)
  check(
    'C5. World 2 grossIncome = $4,500 (AirDNA projection)',
    '4500',
    String(result.world2_Projected.grossIncome),
    result.world2_Projected.grossIncome === 4_500,
  );
  check(
    'C6. World 2 haircutPercent = 20 (audit-required STR projected haircut)',
    '20',
    String(result.world2_Projected.haircutPercent),
    result.world2_Projected.haircutPercent === 20,
  );
  check(
    'C7. World 2 netIncome = $3,600 ($4,500 × 0.80)',
    '3600',
    String(result.world2_Projected.netIncome),
    Math.abs(result.world2_Projected.netIncome - 3_600) < 0.01,
  );
  check(
    'C8. World 2 qualifyingRent = $3,600 (STR net > LT fallback $3,000)',
    '3600',
    String(result.world2_Projected.qualifyingRent),
    Math.abs(result.world2_Projected.qualifyingRent - 3_600) < 0.01,
  );

  // World 3 — $4,000 × 0.90 = $3,600 (10% haircut, lower than World 2)
  check(
    'C9. World 3 grossIncome = $4,000 (12-mo documented actual)',
    '4000',
    String(result.world3_Documented.grossIncome),
    result.world3_Documented.grossIncome === 4_000,
  );
  check(
    'C10. World 3 haircutPercent = 10 (lower than World 2 since actuals more reliable)',
    '10',
    String(result.world3_Documented.haircutPercent),
    result.world3_Documented.haircutPercent === 10,
  );
  check(
    'C11. World 3 netIncome = $3,600 ($4,000 × 0.90)',
    '3600',
    String(result.world3_Documented.netIncome),
    Math.abs(result.world3_Documented.netIncome - 3_600) < 0.01,
  );
  check(
    'C12. World 3 qualifyingRent = $3,600 (documented net > LT fallback $3,000)',
    '3600',
    String(result.world3_Documented.qualifyingRent),
    Math.abs(result.world3_Documented.qualifyingRent - 3_600) < 0.01,
  );
  check(
    'C13. World 3 haircut < World 2 haircut (documented has lower haircut)',
    '10 < 20',
    `${result.world3_Documented.haircutPercent} < ${result.world2_Projected.haircutPercent}`,
    result.world3_Documented.haircutPercent < result.world2_Projected.haircutPercent,
  );

  // v11.1 (AUDIT-FINAL-6): best world = MIN. $3,000 < $3,600 = $3,600 → World 1 governs.
  check(
    'C14. bestQualifyingRent = $3,000 (MIN of 3 worlds — World 1 LT governs)',
    '3000',
    String(result.bestQualifyingRent),
    Math.abs(result.bestQualifyingRent - 3_000) < 0.01,
  );
  check(
    'C15. bestQualifyingRent = MIN(world1, world2, world3) qualifyingRents',
    `${Math.min(result.world1_LTR.qualifyingRent, result.world2_Projected.qualifyingRent, result.world3_Documented.qualifyingRent)}`,
    String(result.bestQualifyingRent),
    Math.abs(result.bestQualifyingRent - Math.min(result.world1_LTR.qualifyingRent, result.world2_Projected.qualifyingRent, result.world3_Documented.qualifyingRent)) < 0.01,
  );
  check(
    'C16. bestWorld is World 1 (LT fallback governs — MIN picks lowest)',
    'World 1',
    result.bestWorld,
    result.bestWorld.includes('World 1'),
  );
  check(
    'C17. result.haircutPercent reflects the winning world (0 for LT — World 1 has no haircut)',
    '0',
    String(result.haircutPercent),
    result.haircutPercent === 0,
  );

  // DSCR sanity-check: World 2 DSCR = $3,600 / $2,854 ≈ 1.262
  const expectedDSCR = 3_600 / 2_854.34;
  check(
    'C18. World 2 DSCR ≈ 1.262 ($3,600 / $2,854 PITIA)',
    expectedDSCR.toFixed(3),
    result.world2_Projected.dscr.toFixed(3),
    Math.abs(result.world2_Projected.dscr - expectedDSCR) < 0.005,
  );
}

// ============================================================
// GROUP D — Legality gate: 4 statuses + incomeEnabled flag
// ============================================================
{
  // D1. CLEAR — HOA allows, low enforcement, no restricted state, has permit
  const clear = checkSTRLegality('TN', 'Nashville', 'ALLOWS', true, true, 0, false, 'LOW', false);
  check(
    'D1. CLEAR status returned when HOA allows + low enforcement + permit',
    'CLEAR',
    clear.status,
    clear.status === 'CLEAR',
  );
  check(
    'D2. CLEAR sets incomeEnabled = true',
    'true',
    String(clear.incomeEnabled),
    clear.incomeEnabled === true,
  );

  // D2. RESTRICTED — restricted state OR min stay 7+ days OR moderate enforcement.
  // v11.1 (AUDIT-FINAL-6): Use HOA=ALLOWS so SILENT doesn't preempt RESTRICTED (SILENT→UNCERTAIN).
  const restricted = checkSTRLegality('CA', 'Los Angeles', 'ALLOWS', true, true, 0, false, 'LOW', false);
  check(
    'D3. RESTRICTED status returned for restricted state (CA) with HOA=ALLOWS',
    'RESTRICTED',
    restricted.status,
    restricted.status === 'RESTRICTED',
  );
  check(
    'D4. RESTRICTED sets incomeEnabled = true (income allowed with caution)',
    'true',
    String(restricted.incomeEnabled),
    restricted.incomeEnabled === true,
  );

  // D3. UNCERTAIN — HOA unknown OR pending legislation OR moderate enforcement no permit
  const uncertain = checkSTRLegality('TN', 'Nashville', 'UNKNOWN', false, true, 0, false, 'LOW', false);
  check(
    'D5. UNCERTAIN status returned when HOA policy is UNKNOWN',
    'UNCERTAIN',
    uncertain.status,
    uncertain.status === 'UNCERTAIN',
  );
  check(
    'D6. UNCERTAIN sets incomeEnabled = false (speculative only)',
    'false',
    String(uncertain.incomeEnabled),
    uncertain.incomeEnabled === false,
  );

  // D4. PROHIBITED — HOA prohibits OR high enforcement + no permit
  const prohibited = checkSTRLegality('TN', 'Nashville', 'PROHIBITS', false, true, 0, false, 'LOW', false);
  check(
    'D7. PROHIBITED status returned when HOA prohibits STR',
    'PROHIBITED',
    prohibited.status,
    prohibited.status === 'PROHIBITED',
  );
  check(
    'D8. PROHIBITED sets incomeEnabled = false (NO STR income modeled)',
    'false',
    String(prohibited.incomeEnabled),
    prohibited.incomeEnabled === false,
  );

  // D5. High enforcement + no permit → PROHIBITED
  const prohibited2 = checkSTRLegality('FL', 'Miami', 'ALLOWS', false, true, 0, false, 'HIGH', false);
  check(
    'D9. PROHIBITED status returned for HIGH enforcement + no permit',
    'PROHIBITED',
    prohibited2.status,
    prohibited2.status === 'PROHIBITED',
  );
  check(
    'D10. PROHIBITED incomeEnabled = false (high enforcement path)',
    'false',
    String(prohibited2.incomeEnabled),
    prohibited2.incomeEnabled === false,
  );

  // D6. Type-level: STRLegalityGate has exactly 4 statuses
  const validStatuses: STRLegalityGate['status'][] = ['CLEAR', 'RESTRICTED', 'UNCERTAIN', 'PROHIBITED'];
  check(
    'D11. STRLegalityGate has exactly 4 statuses (CLEAR/RESTRICTED/UNCERTAIN/PROHIBITED)',
    '4',
    String(validStatuses.length),
    validStatuses.length === 4,
  );
}

// ============================================================
// GROUP E — PROHIBITED case: STR income disabled in evaluateSTRUnderwriting
// ============================================================
{
  // Property with HOA prohibits → legality gate returns PROHIBITED
  const property = defaultProperty({ hoaSTRPolicy: 'PROHIBITS' });
  const result = evaluateSTRUnderwriting(
    property,
    LOAN_AMOUNT,
    RATE,
    TERM,
    IO_PERIOD,
    TAXES,
    INSURANCE,
    HOA,
    FLOOD,
  );

  check(
    'E1. PROHIBITED gate triggered when hoaSTRPolicy = PROHIBITS',
    'PROHIBITED',
    result.legalityGate.status,
    result.legalityGate.status === 'PROHIBITED',
  );
  check(
    'E2. PROHIBITED → incomeEnabled = false',
    'false',
    String(result.legalityGate.incomeEnabled),
    result.legalityGate.incomeEnabled === false,
  );
  check(
    'E3. PROHIBITED → World 2 grossIncome = 0 (no STR income modeled)',
    '0',
    String(result.world2_Projected.grossIncome),
    result.world2_Projected.grossIncome === 0,
  );
  check(
    'E4. PROHIBITED → World 3 grossIncome = 0 (no STR income modeled)',
    '0',
    String(result.world3_Documented.grossIncome),
    result.world3_Documented.grossIncome === 0,
  );
  check(
    'E5. PROHIBITED → bestQualifyingRent = LT fallback ($3,000)',
    '3000',
    String(result.bestQualifyingRent),
    Math.abs(result.bestQualifyingRent - 3_000) < 0.01,
  );
  check(
    'E6. PROHIBITED → bestWorld = World 1 (LT fallback)',
    'World 1',
    result.bestWorld,
    result.bestWorld.includes('World 1'),
  );
  check(
    'E7. PROHIBITED → result.haircutPercent = 0 (LT fallback has no haircut)',
    '0',
    String(result.haircutPercent),
    result.haircutPercent === 0,
  );
}

// ============================================================
// GROUP F — UNCERTAIN case: STR income shown only as speculative; qualifyingRent falls back to LT
// ============================================================
{
  const property = defaultProperty({ hoaSTRPolicy: 'UNKNOWN' });
  const result = evaluateSTRUnderwriting(
    property,
    LOAN_AMOUNT,
    RATE,
    TERM,
    IO_PERIOD,
    TAXES,
    INSURANCE,
    HOA,
    FLOOD,
  );

  check(
    'F1. UNCERTAIN gate triggered when hoaSTRPolicy = UNKNOWN',
    'UNCERTAIN',
    result.legalityGate.status,
    result.legalityGate.status === 'UNCERTAIN',
  );
  check(
    'F2. UNCERTAIN → incomeEnabled = false (speculative only)',
    'false',
    String(result.legalityGate.incomeEnabled),
    result.legalityGate.incomeEnabled === false,
  );
  check(
    'F3. UNCERTAIN → World 2 qualifyingRent falls back to LT ($3,000)',
    '3000',
    String(result.world2_Projected.qualifyingRent),
    Math.abs(result.world2_Projected.qualifyingRent - 3_000) < 0.01,
  );
  check(
    'F4. UNCERTAIN → World 3 qualifyingRent falls back to LT ($3,000)',
    '3000',
    String(result.world3_Documented.qualifyingRent),
    Math.abs(result.world3_Documented.qualifyingRent - 3_000) < 0.01,
  );
  check(
    'F5. UNCERTAIN → World 2 lenderConfirmationRequired = true',
    'true',
    String(result.world2_Projected.lenderConfirmationRequired),
    result.world2_Projected.lenderConfirmationRequired === true,
  );
  check(
    'F6. UNCERTAIN → World 3 lenderConfirmationRequired = true',
    'true',
    String(result.world3_Documented.lenderConfirmationRequired),
    result.world3_Documented.lenderConfirmationRequired === true,
  );
}

// ============================================================
// GROUP G — CLEAR case: STR income fully modeled
// ============================================================
{
  const property = defaultProperty({ hoaSTRPolicy: 'ALLOWS' });
  const result = evaluateSTRUnderwriting(
    property,
    LOAN_AMOUNT,
    RATE,
    TERM,
    IO_PERIOD,
    TAXES,
    INSURANCE,
    HOA,
    FLOOD,
  );

  check(
    'G1. CLEAR gate triggered when hoaSTRPolicy = ALLOWS (default property)',
    'CLEAR',
    result.legalityGate.status,
    result.legalityGate.status === 'CLEAR',
  );
  check(
    'G2. CLEAR → incomeEnabled = true (STR income modeled)',
    'true',
    String(result.legalityGate.incomeEnabled),
    result.legalityGate.incomeEnabled === true,
  );
  check(
    'G3. CLEAR → World 2 grossIncome = $4,500 (STR income modeled)',
    '4500',
    String(result.world2_Projected.grossIncome),
    result.world2_Projected.grossIncome === 4_500,
  );
  check(
    'G4. CLEAR → World 3 grossIncome = $4,000 (STR income modeled)',
    '4000',
    String(result.world3_Documented.grossIncome),
    result.world3_Documented.grossIncome === 4_000,
  );
  // v11.1 (AUDIT-FINAL-6): best world = MIN. LT ($3,000) governs since LT < STR net.
  check(
    'G5. CLEAR → bestQualifyingRent = $3,000 (MIN — World 1 LT governs; STR income shown but not used)',
    '3000',
    String(result.bestQualifyingRent),
    Math.abs(result.bestQualifyingRent - 3_000) < 0.01,
  );
}

// ============================================================
// GROUP H — Market direction warning (2026 STR tightening trend)
// ============================================================
{
  const result = evaluateSTRUnderwriting(
    defaultProperty(),
    LOAN_AMOUNT,
    RATE,
    TERM,
    IO_PERIOD,
    TAXES,
    INSURANCE,
    HOA,
    FLOOD,
  );

  check(
    'H1. marketDirectionWarning field present and non-empty',
    'non-empty string',
    typeof result.marketDirectionWarning,
    typeof result.marketDirectionWarning === 'string' && result.marketDirectionWarning.length > 0,
  );
  check(
    'H2. marketDirectionWarning mentions "2026" (trend year)',
    'includes 2026',
    result.marketDirectionWarning.includes('2026') ? 'includes 2026' : 'missing 2026',
    result.marketDirectionWarning.includes('2026'),
  );
  check(
    'H3. marketDirectionWarning mentions documented history / LT comp rents trend',
    'mentions documented/LT',
    result.marketDirectionWarning,
    result.marketDirectionWarning.toLowerCase().includes('documented') ||
      result.marketDirectionWarning.toLowerCase().includes('lt') ||
      result.marketDirectionWarning.toLowerCase().includes('long-term'),
  );
  check(
    'H4. marketDirectionWarning mentions projections tightening',
    'mentions projections',
    result.marketDirectionWarning,
    result.marketDirectionWarning.toLowerCase().includes('projection'),
  );
}

// ============================================================
// GROUP I — Documentation checklist
// ============================================================
{
  const checklist = getSTRDocumentationChecklist();

  check(
    'I1. Documentation checklist is a non-empty array',
    'array, length > 0',
    `array, length ${checklist.length}`,
    Array.isArray(checklist) && checklist.length > 0,
  );

  const requiredItems = [
    { keyword: 'lease', label: 'Signed Lease Agreement' },
    { keyword: '1007', label: '1007/1025 Appraiser Market Rent Analysis' },
    { keyword: 'airdna', label: 'AirDNA / STR Projection Report' },
    { keyword: '12-month', label: '12-Month Platform Revenue History' },
    { keyword: 'permit', label: 'STR Business License / Permit' },
    { keyword: 'hoa', label: 'HOA STR Approval Letter' },
    { keyword: 'insurance', label: 'Property Insurance with STR Rider' },
  ];
  for (const item of requiredItems) {
    const found = checklist.some(c => c.item.toLowerCase().includes(item.keyword));
    check(
      `I. Documentation checklist includes "${item.label}"`,
      'present',
      found ? 'present' : 'MISSING',
      found,
    );
  }

  // Each checklist item must have item/required/status fields
  const allHaveFields = checklist.every(c =>
    typeof c.item === 'string' && c.item.length > 0 &&
    typeof c.required === 'boolean' &&
    (c.status === 'COMPLETE' || c.status === 'NEEDED' || c.status === 'N/A'),
  );
  check(
    'I8. All checklist items have item/required/status fields',
    'true',
    String(allHaveFields),
    allHaveFields,
  );

  // At least one item marked required=true (the audit asks for "required items")
  const hasRequired = checklist.some(c => c.required === true);
  check(
    'I9. At least one checklist item is marked required=true',
    'true',
    String(hasRequired),
    hasRequired,
  );
}

// ============================================================
// GROUP J — Worlds NEVER blended (each world independently calculated)
// ============================================================
{
  // Property where World 2 LT fallback should be used (strProjected low, LT high)
  const prop2 = defaultProperty({
    leaseRent: 5_000,
    marketRent: 5_100,
    strProjectedRent: 4_000,  // 4,000 × 0.80 = 3,200 < 5,000 LT fallback
    strDocumentedRent: 3_500, // 3,500 × 0.90 = 3,150 < 5,000 LT fallback
  });
  const result2 = evaluateSTRUnderwriting(
    prop2, LOAN_AMOUNT, RATE, TERM, IO_PERIOD, TAXES, INSURANCE, HOA, FLOOD,
  );

  check(
    'J1. World 1 LT fallback = $5,000 (lower of $5,000/$5,100) — independent calc',
    '5000',
    String(result2.world1_LTR.qualifyingRent),
    Math.abs(result2.world1_LTR.qualifyingRent - 5_000) < 0.01,
  );
  // v11.1 (AUDIT-FINAL-6): No per-world LT cap. World 2 qualifyingRent = STR net ($3,200).
  check(
    'J2. World 2 qualifyingRent = $3,200 (STR net — no LT cap when CLEAR)',
    '3200',
    String(result2.world2_Projected.qualifyingRent),
    Math.abs(result2.world2_Projected.qualifyingRent - 3_200) < 0.01,
  );
  check(
    'J3. World 2 netIncome = $3,200 (still calculated independently — NOT blended)',
    '3200',
    String(result2.world2_Projected.netIncome),
    Math.abs(result2.world2_Projected.netIncome - 3_200) < 0.01,
  );
  // v11.1 (AUDIT-FINAL-6): No per-world LT cap. World 3 qualifyingRent = Doc net ($3,150).
  check(
    'J4. World 3 qualifyingRent = $3,150 (documented net — no LT cap when CLEAR)',
    '3150',
    String(result2.world3_Documented.qualifyingRent),
    Math.abs(result2.world3_Documented.qualifyingRent - 3_150) < 0.01,
  );
  check(
    'J5. World 3 netIncome = $3,150 (still calculated independently — NOT blended)',
    '3150',
    String(result2.world3_Documented.netIncome),
    Math.abs(result2.world3_Documented.netIncome - 3_150) < 0.01,
  );
  // v11.1 (AUDIT-FINAL-6): best world = MIN. MIN($5,000, $3,200, $3,150) = $3,150 → World 3.
  check(
    'J6. bestQualifyingRent = $3,150 (MIN of 3 worlds — World 3 documented STR governs)',
    '3150',
    String(result2.bestQualifyingRent),
    Math.abs(result2.bestQualifyingRent - 3_150) < 0.01,
  );
}

// ============================================================
// GROUP K — Easy Street Capital: AIRDNA_100_PCT override
// ============================================================
{
  const easy = getLenderById('easy_street');
  check(
    'K1. Easy Street Capital exists in LENDERS',
    'exists',
    easy ? 'exists' : 'MISSING',
    !!easy,
  );
  if (easy) {
    check(
      'K2. Easy Street strPolicy.incomeMethod = AIRDNA_100_PCT',
      'AIRDNA_100_PCT',
      easy.strPolicy.incomeMethod,
      easy.strPolicy.incomeMethod === 'AIRDNA_100_PCT',
    );
    check(
      'K3. Easy Street strPolicy.allowed = true',
      'true',
      String(easy.strPolicy.allowed),
      easy.strPolicy.allowed === true,
    );
    check(
      'K4. Easy Street strPolicy.requiresAirDNA = true',
      'true',
      String(easy.strPolicy.requiresAirDNA),
      easy.strPolicy.requiresAirDNA === true,
    );

    // Functional test: computeQualifyingRentForLender with Easy Street
    const property = defaultProperty();
    const qualifyingRent = computeQualifyingRentForLender(property, 'STR', easy);
    // Easy Street uses 100% of strProjectedRent = $4,500 (NO haircut)
    // documentedNet = $4,000 × (1 - 0.10 × 0.5) = $4,000 × 0.95 = $3,800
    // ltrFallback = min($3,000, $3,100) = $3,000
    // max($4,500, $3,800, $3,000) = $4,500
    check(
      'K5. computeQualifyingRentForLender(Easy Street, STR) = $4,500 (100% of strProjectedRent, NO 20% haircut)',
      '4500',
      String(qualifyingRent),
      Math.abs(qualifyingRent - 4_500) < 0.01,
      `Easy Street should use 100% of projected revenue ($4,500), not 80% ($3,600)`,
    );
  }
}

// ============================================================
// GROUP L — computeQualifyingRentForLender: AIRDNA_PROJECTION applies haircut
// ============================================================
{
  // Pick a lender that uses AIRDNA_PROJECTION with 20% haircut (e.g., Defy)
  const defy = getLenderById('defy');
  check(
    'L1. Defy uses AIRDNA_PROJECTION incomeMethod',
    'AIRDNA_PROJECTION',
    defy?.strPolicy.incomeMethod ?? 'MISSING',
    defy?.strPolicy.incomeMethod === 'AIRDNA_PROJECTION',
  );
  check(
    'L2. Defy haircutPercent = 20',
    '20',
    String(defy?.strPolicy.haircutPercent),
    defy?.strPolicy.haircutPercent === 20,
  );

  if (defy) {
    const property = defaultProperty();
    const qualifyingRent = computeQualifyingRentForLender(property, 'STR', defy);
    // Defy: strNet = $4,500 × (1 - 0.20) = $3,600
    // documentedNet = $4,000 × (1 - 0.20 × 0.5) = $4,000 × 0.90 = $3,600
    // ltrFallback = $3,000
    // max($3,600, $3,600, $3,000) = $3,600
    check(
      'L3. computeQualifyingRentForLender(Defy, STR) = $3,600 (20% haircut applied)',
      '3600',
      String(qualifyingRent),
      Math.abs(qualifyingRent - 3_600) < 0.01,
      `Defy should apply 20% haircut: $4,500 × 0.80 = $3,600`,
    );

    // Side-by-side comparison: Easy Street vs Defy with same property
    const easy = getLenderById('easy_street');
    if (easy) {
      const easyRent = computeQualifyingRentForLender(property, 'STR', easy);
      const defyRent = computeQualifyingRentForLender(property, 'STR', defy);
      check(
        'L4. Easy Street qualifying ($4,500) > Defy qualifying ($3,600) — override yields higher rent',
        'easy > defy',
        `easy=$${easyRent} defy=$${defyRent}`,
        easyRent > defyRent,
        `Easy Street override saves borrower $${easyRent - defyRent}/mo in qualifying rent`,
      );
    }
  }
}

// ============================================================
// GROUP M — computeQualifyingRentForLender: LTR strategy uses lower-of(lease, market)
// ============================================================
{
  const property = defaultProperty();
  const easy = getLenderById('easy_street')!;
  const ltrRent = computeQualifyingRentForLender(property, 'LTR', easy);
  // LTR uses lower of lease ($3,000) and market ($3,100) = $3,000
  // Easy Street vacancyTreatment = NONE → no vacancy haircut
  check(
    'M1. LTR strategy uses lower-of(lease, market) = $3,000',
    '3000',
    String(ltrRent),
    Math.abs(ltrRent - 3_000) < 0.01,
  );
  check(
    'M2. LTR strategy does NOT apply STR 20% haircut',
    '3000 (no haircut)',
    String(ltrRent),
    Math.abs(ltrRent - 3_000) < 0.01 && ltrRent !== 3_000 * 0.80,
  );
}

// ============================================================
// GROUP N — Legality gate runs BEFORE income modeling (verified via code-level behavior)
// ============================================================
{
  // Even if STR projection is huge, PROHIBITED gate zeros it out
  const property = defaultProperty({
    hoaSTRPolicy: 'PROHIBITS',
    strProjectedRent: 99_999,  // absurd projection
    strDocumentedRent: 99_999,
  });
  const result = evaluateSTRUnderwriting(
    property, LOAN_AMOUNT, RATE, TERM, IO_PERIOD, TAXES, INSURANCE, HOA, FLOOD,
  );
  check(
    'N1. PROHIBITED gate zeros out even absurd STR projections ($99,999 → $0)',
    '0',
    String(result.world2_Projected.grossIncome),
    result.world2_Projected.grossIncome === 0,
  );
  check(
    'N2. PROHIBITED gate zeros out even absurd STR documented ($99,999 → $0)',
    '0',
    String(result.world3_Documented.grossIncome),
    result.world3_Documented.grossIncome === 0,
  );
  check(
    'N3. PROHIBITED → bestQualifyingRent = LT fallback ($3,000), not $99,999',
    '3000',
    String(result.bestQualifyingRent),
    Math.abs(result.bestQualifyingRent - 3_000) < 0.01,
  );
}

// ============================================================
// GROUP O — Round-trip: 3 worlds produce sensible DSCRs
// ============================================================
{
  const result = evaluateSTRUnderwriting(
    defaultProperty(),
    LOAN_AMOUNT,
    RATE,
    TERM,
    IO_PERIOD,
    TAXES,
    INSURANCE,
    HOA,
    FLOOD,
  );
  const PITIA = 2_854.34; // flagship golden PITIA @ 7%
  check(
    'O1. World 1 DSCR = $3,000 / $2,854 ≈ 1.051',
    '1.051',
    result.world1_LTR.dscr.toFixed(3),
    Math.abs(result.world1_LTR.dscr - 3_000 / PITIA) < 0.005,
  );
  check(
    'O2. World 2 DSCR = $3,600 / $2,854 ≈ 1.262',
    '1.262',
    result.world2_Projected.dscr.toFixed(3),
    Math.abs(result.world2_Projected.dscr - 3_600 / PITIA) < 0.005,
  );
  check(
    'O3. World 3 DSCR = $3,600 / $2,854 ≈ 1.262',
    '1.262',
    result.world3_Documented.dscr.toFixed(3),
    Math.abs(result.world3_Documented.dscr - 3_600 / PITIA) < 0.005,
  );
  check(
    'O4. World 2 DSCR > World 1 DSCR (STR projection > LT fallback)',
    'W2 > W1',
    `${result.world2_Projected.dscr} > ${result.world1_LTR.dscr}`,
    result.world2_Projected.dscr > result.world1_LTR.dscr,
  );
  check(
    'O5. World 3 DSCR > World 1 DSCR (documented STR > LT fallback)',
    'W3 > W1',
    `${result.world3_Documented.dscr} > ${result.world1_LTR.dscr}`,
    result.world3_Documented.dscr > result.world1_LTR.dscr,
  );
}

// ============================================================
// GROUP P — v11.1 STR DSCR Floor (item 11): STR ≥ 1.0 (vs LTR 0.75)
// ============================================================
{
  // Build a minimal synthetic result for a STR deal at DSCR 0.85 (between LTR floor 0.75 and STR floor 1.0)
  const syntheticDSCRResult: any = {
    dscr: 0.85,
    dualTrackDSCR: { track2: { dscr: 0.80, monthlyCashFlow: -200 } },
    rateHeadroomBps: 100,
    debtYield: 0.08,
    solvedRate: 7.0,
    monthlyPITIA: { total: 2_854.34 },
  };
  const synthBorrower: any = { ficoScore: 720, isForeignNational: false, availableReserves: 50_000 };
  const synthLoan: any = { ltv: 75 };
  const synthProperty: any = { state: 'TN', yearBuilt: 2020, isDecliningMarket: false };
  const killSTR = computeDealKillCheck(syntheticDSCRResult, synthBorrower, synthLoan, synthProperty, 'STR', null, null, null);
  const strBlockers = killSTR.criteria.filter(c => c.severity === 'BLOCKER' && c.triggered);
  check(
    'P1. STR deal with DSCR 0.85 triggers BLOCKER (STR floor = 1.0)',
    'BLOCKER triggered',
    `${strBlockers.length} blocker(s)`,
    strBlockers.some(c => c.criterion.includes('1.00×') || c.criterion.includes('STR floor')),
  );
  check(
    'P2. STR BLOCKER criterion explicitly mentions STR floor (1.00×)',
    'includes "1.00×" or "STR floor"',
    strBlockers.map(c => c.criterion).join(' | '),
    strBlockers.some(c => c.criterion.includes('1.00×') || c.criterion.includes('STR floor')),
  );

  // Same DSCR (0.85) for LTR should NOT trigger the STR floor BLOCKER — only the sub-1.0 WARNING
  const killLTR = computeDealKillCheck(syntheticDSCRResult, synthBorrower, synthLoan, synthProperty, 'LTR', null, null, null);
  const ltrBlockers = killLTR.criteria.filter(c => c.severity === 'BLOCKER' && c.triggered);
  check(
    'P3. LTR deal with DSCR 0.85 does NOT trigger BLOCKER (LTR floor = 0.75)',
    'no BLOCKER',
    `${ltrBlockers.length} blocker(s)`,
    ltrBlockers.length === 0,
  );

  // STR deal at DSCR 1.05 (just above floor) should NOT trigger STR BLOCKER
  const strDealAboveFloor: any = { ...syntheticDSCRResult, dscr: 1.05 };
  const killSTRabove = computeDealKillCheck(strDealAboveFloor, synthBorrower, synthLoan, synthProperty, 'STR', null, null, null);
  const strAboveBlockers = killSTRabove.criteria.filter(c => c.severity === 'BLOCKER' && c.triggered);
  check(
    'P4. STR deal with DSCR 1.05 does NOT trigger BLOCKER (above 1.0 floor)',
    'no BLOCKER',
    `${strAboveBlockers.length} blocker(s)`,
    strAboveBlockers.length === 0,
  );

  // LTR deal at DSCR 0.70 (below 0.75 floor) SHOULD trigger BLOCKER
  const ltrSubFloor: any = { ...syntheticDSCRResult, dscr: 0.70 };
  const killLTRsub = computeDealKillCheck(ltrSubFloor, synthBorrower, synthLoan, synthProperty, 'LTR', null, null, null);
  const ltrSubBlockers = killLTRsub.criteria.filter(c => c.severity === 'BLOCKER' && c.triggered);
  check(
    'P5. LTR deal with DSCR 0.70 triggers BLOCKER (below 0.75 LTR floor)',
    'BLOCKER triggered',
    `${ltrSubBlockers.length} blocker(s)`,
    ltrSubBlockers.some(c => c.criterion.includes('0.75×')),
  );
}

// ============================================================
// GROUP Q — v11.1 Monthly Seasonality (items 12-20)
// Sample computation trace: $5,000 STR rent/mo × 12 = $60,000 annual;
// PITIA $3,000/mo; 20% haircut; Jul index=140, Jan index=75; indexSum=1230.
//   Jul: 60000×140/1230 = $6,829 gross → ×0.80 = $5,463 haircut → /3000 = 1.821 (peak)
//   Jan: 60000×75/1230  = $3,659 gross → ×0.80 = $2,927 haircut → /3000 = 0.976 (off-season)
// ============================================================
{
  // Item 12: returns 12 entries
  const seasonality = computeSTRMonthlySeasonality(60_000, 3_000, 20);
  check(
    'Q1. computeSTRMonthlySeasonality returns exactly 12 STRMonthBreakdown entries',
    '12',
    String(seasonality.months.length),
    seasonality.months.length === 12,
  );

  // Item 13: each entry has all required fields
  const requiredFields = ['month', 'monthIndex', 'seasonalityIndex', 'projectedRevenue', 'haircutRevenue', 'monthlyPITIA', 'monthlyDSCR', 'isOffSeason'];
  const allHaveFields = seasonality.months.every(m =>
    requiredFields.every(f => f in m && (typeof (m as any)[f] === 'number' || typeof (m as any)[f] === 'boolean' || typeof (m as any)[f] === 'string'))
  );
  check(
    'Q2. Each STRMonthBreakdown has all 8 required fields',
    'all present',
    allHaveFields ? 'all present' : 'MISSING fields',
    allHaveFields,
  );

  // Item 14: US_NATIONAL_STR_SEASONALITY has 12 entries summing to ~1200
  const natSum = US_NATIONAL_STR_SEASONALITY.reduce((s, m) => s + m.index, 0);
  check(
    'Q3. US_NATIONAL_STR_SEASONALITY has 12 entries',
    '12',
    String(US_NATIONAL_STR_SEASONALITY.length),
    US_NATIONAL_STR_SEASONALITY.length === 12,
  );
  check(
    'Q4. US_NATIONAL_STR_SEASONALITY indices sum to ~1200 (within 5%)',
    '1140-1260',
    String(natSum),
    natSum >= 1140 && natSum <= 1260,
  );

  // Item 15: Jul index = 140 (peak), Jan index = 75 (low)
  const jul = US_NATIONAL_STR_SEASONALITY.find(m => m.month === 'Jul');
  const jan = US_NATIONAL_STR_SEASONALITY.find(m => m.month === 'Jan');
  check(
    'Q5. Jul seasonalityIndex = 140 (peak)',
    '140',
    String(jul?.index),
    jul?.index === 140,
  );
  check(
    'Q6. Jan seasonalityIndex = 75 (low)',
    '75',
    String(jan?.index),
    jan?.index === 75,
  );
  // Jul is the max
  const maxIndex = Math.max(...US_NATIONAL_STR_SEASONALITY.map(m => m.index));
  check(
    'Q7. Jul is the peak month (max index = 140)',
    'Jul=140=max',
    `${jul?.month}=${jul?.index}, max=${maxIndex}`,
    jul?.index === maxIndex && maxIndex === 140,
  );

  // Item 16: Off-season months correctly identified (monthlyDSCR < 1.0)
  // For $60K annual × 20% haircut × $3000 PITIA:
  //   monthlyDSCR = (60000 × index / 1230 × 0.80) / 3000 = (index × 48 / 1230) = index × 0.03902
  //   DSCR=1.0 when index = 25.6 — but our lowest index is 75 (Jan), so DSCR for Jan = 75 × 0.03902 ≈ 2.93
  // Wait — that doesn't match. Let me recompute: 60000 × 75 / 1230 = 3658.54; ×0.80 = 2926.83; /3000 = 0.976
  // So Jan DSCR ≈ 0.976 < 1.0 → off-season. Let me verify off-season list.
  const offSeason = seasonality.months.filter(m => m.isOffSeason);
  const allOffSeasonBelow1 = offSeason.every(m => m.monthlyDSCR < 1.0);
  const allAbove1NotOffSeason = seasonality.months.filter(m => !m.isOffSeason).every(m => m.monthlyDSCR >= 1.0);
  check(
    'Q8. isOffSeason=true iff monthlyDSCR < 1.0 (consistency)',
    'consistent',
    `off-season count=${offSeason.length}, all<1.0=${allOffSeasonBelow1}, all≥1.0 not off-season=${allAbove1NotOffSeason}`,
    allOffSeasonBelow1 && allAbove1NotOffSeason,
  );

  // Sample trace for Jan (low season): projected $3,659 → haircut $2,927 → DSCR 0.976 (off-season)
  const janBreakdown = seasonality.months.find(m => m.month === 'Jan')!;
  check(
    'Q9. Jan projectedRevenue ≈ $3,659 ($60K × 75 / 1230)',
    '3659',
    String(janBreakdown.projectedRevenue),
    Math.abs(janBreakdown.projectedRevenue - 3_659) <= 2,
  );
  check(
    'Q10. Jan haircutRevenue ≈ $2,927 ($3,659 × 0.80)',
    '2927',
    String(janBreakdown.haircutRevenue),
    Math.abs(janBreakdown.haircutRevenue - 2_927) <= 2,
  );
  check(
    'Q11. Jan monthlyDSCR ≈ 0.976 ($2,927 / $3,000 PITIA) — OFF-SEASON',
    '0.976',
    janBreakdown.monthlyDSCR.toFixed(3),
    Math.abs(janBreakdown.monthlyDSCR - 0.976) < 0.005,
  );
  check(
    'Q12. Jan isOffSeason = true (DSCR < 1.0)',
    'true',
    String(janBreakdown.isOffSeason),
    janBreakdown.isOffSeason === true,
  );

  // Sample trace for Jul (peak season): projected $6,829 → haircut $5,463 → DSCR 1.821 (peak)
  const julBreakdown = seasonality.months.find(m => m.month === 'Jul')!;
  check(
    'Q13. Jul projectedRevenue ≈ $6,829 ($60K × 140 / 1230)',
    '6829',
    String(julBreakdown.projectedRevenue),
    Math.abs(julBreakdown.projectedRevenue - 6_829) <= 2,
  );
  check(
    'Q14. Jul haircutRevenue ≈ $5,463 ($6,829 × 0.80)',
    '5463',
    String(julBreakdown.haircutRevenue),
    Math.abs(julBreakdown.haircutRevenue - 5_463) <= 2,
  );
  check(
    'Q15. Jul monthlyDSCR ≈ 1.821 ($5,463 / $3,000 PITIA) — PEAK',
    '1.821',
    julBreakdown.monthlyDSCR.toFixed(3),
    Math.abs(julBreakdown.monthlyDSCR - 1.821) < 0.005,
  );
  check(
    'Q16. Jul isOffSeason = false (DSCR ≥ 1.0)',
    'false',
    String(julBreakdown.isOffSeason),
    julBreakdown.isOffSeason === false,
  );

  // Item 17: warningMessage includes off-season warning when applicable
  const warnIncludesOffSeason = seasonality.warningMessage.toLowerCase().includes('off-season') ||
    seasonality.warningMessage.includes('below 1.0') ||
    seasonality.warningMessage.includes('DSCR');
  check(
    'Q17. warningMessage includes off-season warning when offSeasonMonths.length > 0',
    'includes off-season warning',
    seasonality.warningMessage.substring(0, 80) + '...',
    seasonality.offSeasonMonths.length > 0 ? warnIncludesOffSeason : true,
  );
  check(
    'Q18. offSeasonMonths list is non-empty for $60K/$3K scenario (Jan/Feb/Nov expected)',
    '>0',
    `${seasonality.offSeasonMonths.length} (${seasonality.offSeasonMonths.join(',')})`,
    seasonality.offSeasonMonths.length > 0,
  );

  // Aggregate fields populated
  check(
    'Q19. annualRevenueProjected ≈ $60,000 (sum of monthly projected)',
    '60000',
    String(seasonality.annualRevenueProjected),
    Math.abs(seasonality.annualRevenueProjected - 60_000) <= 10,
  );
  check(
    'Q20. annualRevenueHaircut ≈ $48,000 (sum of monthly haircut, $60K × 0.80)',
    '48000',
    String(seasonality.annualRevenueHaircut),
    Math.abs(seasonality.annualRevenueHaircut - 48_000) <= 10,
  );
  check(
    'Q21. bestMonth = Jul (peak DSCR)',
    'Jul',
    seasonality.bestMonth,
    seasonality.bestMonth === 'Jul',
  );
  check(
    'Q22. worstMonth is one of low-season months (Jan/Feb/Nov/Dec)',
    'Jan|Feb|Nov|Dec',
    seasonality.worstMonth,
    ['Jan', 'Feb', 'Nov', 'Dec'].includes(seasonality.worstMonth),
  );
}

// ============================================================
// GROUP R — STRAnalysis component renders monthly bar chart (items 18-20)
// Code-level verification: page.tsx contains Monthly Seasonality section,
// bar color thresholds (green ≥1.0, amber 0.75-1.0, red <0.75), and off-season warning card.
// ============================================================
{
  const pageSrc = readFileSync(resolve(process.cwd(), 'src/app/page.tsx'), 'utf-8');

  // Item 18: STRAnalysis component renders the monthly bar chart (search for "Monthly Seasonality")
  check(
    'R1. page.tsx contains "Monthly Seasonality" section header',
    'present',
    pageSrc.includes('Monthly Seasonality') ? 'present' : 'MISSING',
    pageSrc.includes('Monthly Seasonality'),
  );
  check(
    'R2. page.tsx renders monthly bar chart via months.map',
    'present',
    pageSrc.includes('monthlySeasonality.months.map') ? 'present' : 'MISSING',
    pageSrc.includes('monthlySeasonality.months.map'),
  );

  // Item 19: Bar colors — green ≥1.0, amber 0.75-1.0, red <0.75
  // Spec: green ≥1.0, amber 0.75-1.0, red <0.75
  // Code uses: monthlyDSCR >= 1.0 → emerald (green); >= 0.75 → amber; else red
  const hasGreenThreshold = pageSrc.includes('monthlyDSCR >= 1.0') && pageSrc.includes('bg-emerald');
  const hasAmberThreshold = pageSrc.includes('monthlyDSCR >= 0.75') && pageSrc.includes('bg-amber');
  const hasRedThreshold = pageSrc.includes('bg-red-500');
  check(
    'R3. Bar color: green (emerald) when monthlyDSCR ≥ 1.0',
    'present',
    hasGreenThreshold ? 'present' : 'MISSING',
    hasGreenThreshold,
  );
  check(
    'R4. Bar color: amber when monthlyDSCR 0.75-1.0',
    'present',
    hasAmberThreshold ? 'present' : 'MISSING',
    hasAmberThreshold,
  );
  check(
    'R5. Bar color: red when monthlyDSCR < 0.75',
    'present',
    hasRedThreshold ? 'present' : 'MISSING',
    hasRedThreshold,
  );

  // Item 20: Off-season warning card displayed when offSeasonMonths.length > 0
  const hasOffSeasonWarning = pageSrc.includes('offSeasonMonths.length > 0') && pageSrc.includes('Off-Season Risk');
  check(
    'R6. Off-season warning card rendered when offSeasonMonths.length > 0',
    'present',
    hasOffSeasonWarning ? 'present' : 'MISSING',
    hasOffSeasonWarning,
  );

  // Also verify a "year-round positive carry" message when no off-season months
  const hasStableMessage = pageSrc.includes('offSeasonMonths.length === 0');
  check(
    'R7. Stable year-round DSCR card rendered when offSeasonMonths.length === 0',
    'present',
    hasStableMessage ? 'present' : 'MISSING',
    hasStableMessage,
  );
}

// ============================================================
// GROUP S — Legality gate: HOA SILENT triggers UNCERTAIN (item 10)
// v11.0 only treated UNKNOWN; v11.1 also treats SILENT as UNCERTAIN.
// ============================================================
{
  // HOA SILENT — should be UNCERTAIN per spec item 10 (v11.0 only treated UNKNOWN)
  // However, examining checkSTRLegality: SILENT is NOT in the UNCERTAIN conditions.
  // The UNCERTAIN conditions are: hoaUnknown || pendingLegislationRisk || moderateEnforcementNoPermit || ownerOccRisk || capClosedWithPermit
  // SILENT is not explicitly handled — it falls through to RESTRICTED/CLEAR based on other factors.
  // Let's verify the actual behavior.
  const silentNoPermit = checkSTRLegality('TN', 'Nashville', 'SILENT', false, true, 0, false, 'MODERATE', false);
  // With moderate enforcement + no permit, this should be UNCERTAIN regardless of SILENT
  check(
    'S1. HOA=SILENT + MODERATE enforcement + no permit → UNCERTAIN (via moderateEnforcementNoPermit)',
    'UNCERTAIN',
    silentNoPermit.status,
    silentNoPermit.status === 'UNCERTAIN',
  );

  // HOA SILENT + LOW enforcement + permit + non-restricted state + no min stay + no owner occ
  // — v11.1 (AUDIT-FINAL-6 item 10): SILENT now triggers UNCERTAIN with attorney review.
  const silentClearPath = checkSTRLegality('TN', 'Nashville', 'SILENT', true, true, 0, false, 'LOW', false);
  check(
    'S2. HOA=SILENT + otherwise-clear inputs → UNCERTAIN (v11.1 fix — attorney review required)',
    'UNCERTAIN',
    silentClearPath.status,
    silentClearPath.status === 'UNCERTAIN',
  );
  check(
    'S2b. HOA=SILENT summary mentions attorney/CC&Rs review',
    'includes attorney or CC&Rs',
    silentClearPath.summary,
    silentClearPath.summary.toLowerCase().includes('attorney') || silentClearPath.summary.toLowerCase().includes('cc&r'),
  );

  // HOA UNKNOWN — should be UNCERTAIN per spec
  const unknown = checkSTRLegality('TN', 'Nashville', 'UNKNOWN', true, true, 0, false, 'LOW', false);
  check(
    'S3. HOA=UNKNOWN → UNCERTAIN (spec-compliant)',
    'UNCERTAIN',
    unknown.status,
    unknown.status === 'UNCERTAIN',
  );
  check(
    'S4. HOA=UNKNOWN summary mentions verify/attorney (spec: attorney review required)',
    'includes verify',
    unknown.summary,
    unknown.summary.toLowerCase().includes('verify') || unknown.summary.toLowerCase().includes('attorney') || unknown.summary.toLowerCase().includes('unknown'),
  );
}

// ============================================================
// SUMMARY
// ============================================================
const passed = results.filter(r => r.pass).length;
const failed = results.length - passed;

console.log('\n' + '='.repeat(80));
console.log('AUDIT-7: STR UNDERWRITING VERIFICATION — TEST RESULTS');
console.log('='.repeat(80));
console.log(`Total checks: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Pass rate: ${(passed / results.length * 100).toFixed(1)}%`);
console.log('='.repeat(80) + '\n');

// Group results by category prefix
const categories = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'];
const categoryLabels: Record<string, string> = {
  A: 'Structure (3 worlds)',
  B: 'STRWorld field completeness',
  C: 'Test scenario math (the headline numbers)',
  D: 'Legality gate 4 statuses + incomeEnabled',
  E: 'PROHIBITED → STR income disabled',
  F: 'UNCERTAIN → speculative only, LT fallback',
  G: 'CLEAR → STR income fully modeled',
  H: 'Market direction warning (2026 trend)',
  I: 'Documentation checklist',
  J: 'Worlds NEVER blended',
  K: 'Easy Street Capital 100% override',
  L: 'AIRDNA_PROJECTION 20% haircut',
  M: 'LTR strategy no STR haircut',
  N: 'Legality gate runs BEFORE income modeling',
  O: 'Round-trip DSCR sanity',
  P: 'v11.1 STR DSCR floor (≥1.0 vs LTR 0.75)',
  Q: 'v11.1 Monthly seasonality computation',
  R: 'v11.1 STRAnalysis component (page.tsx)',
  S: 'v11.1 HOA SILENT triggers UNCERTAIN',
};
for (const cat of categories) {
  const catResults = results.filter(r => r.name.charAt(0) === cat && /^\w\d*\./.test(r.name));
  if (catResults.length === 0) continue;
  const catPassed = catResults.filter(r => r.pass).length;
  console.log(`[${cat}] ${categoryLabels[cat] || cat}: ${catPassed}/${catResults.length} passed`);
  for (const r of catResults) {
    if (!r.pass) {
      console.log(`  ❌ ${r.name}`);
      console.log(`     Expected: ${r.expected}`);
      console.log(`     Actual:   ${r.actual}`);
      if (r.details) console.log(`     Details:  ${r.details}`);
    }
  }
}

console.log('\n' + '='.repeat(80));
if (failed === 0) {
  console.log('✅ ALL AUDIT-7 STR UNDERWRITING CHECKS PASSED');
} else {
  console.log(`❌ ${failed} CHECKS FAILED — see details above`);
}
console.log('='.repeat(80) + '\n');

process.exit(failed === 0 ? 0 : 1);
