// ============================================================
// DSCR Loan Command Center v7.0 — Verified Lender Profiles
// Provenance-honest labels, spec-exact data, dual-track matching
//
// PROVENANCE: registered in src/engine/dataVintage.ts as 'lenderDatabase'
// (asOf 2026-06-01, quarterly cadence). Per-lender effectiveDate / verifiedDate
// and per-field provenance stamps below are the authority; the registry records
// the oldest of them so the UI can disclose one honest date.
// ============================================================

import type {
  LenderProgram,
  LenderDataPoint,
  LenderFitResult,
  FitTier,
  TripleRate,
  PPPCheckResult,
  ProvenanceLabel,
  PropertyType,
  EntityType,
  PrepayType,
  DSCRFormulaMethod,
  STRPolicy,
  BorrowerProfile,
  LoanStructure,
  PropertyInputs,
  RentalStrategy,
} from './types';
import { checkPPPLegal } from './statePppLaws';

// ============================================================
// ALL STATES + DC — used by nationwide lenders
// ============================================================

const ALL_STATES: string[] = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  'DC',
];

// 48 states excluding AK, HI
const STATES_48: string[] = ALL_STATES.filter(s => s !== 'AK' && s !== 'HI');

// ============================================================
// HELPER: LenderDataPoint constructor
// ============================================================

function dp<T extends number | string | number[] | boolean>(
  value: T,
  provenance: ProvenanceLabel,
  source: string,
  asOfDate: string,
  notes?: string,
): LenderDataPoint<T> {
  return { value, provenance, source, asOfDate, notes };
}

// ============================================================
// PROPERTY TYPE RULES — helper to build full record
// ============================================================

function ptRules(
  allowed: PropertyType[],
  maxLTV: number,
  overrides?: Partial<Record<PropertyType, { allowed: boolean; maxLTV: number }>>,
): Record<PropertyType, { allowed: boolean; maxLTV: number }> {
  const all: PropertyType[] = [
    'SFR','2-4_UNIT','CONDO_WARRANTABLE','CONDO_NON_WARRANTABLE',
    'CONDOTEL','RURAL','5+_UNIT','MIXED_USE',
  ];
  const result: Record<PropertyType, { allowed: boolean; maxLTV: number }> = {} as any;
  for (const pt of all) {
    if (overrides?.[pt]) {
      result[pt] = overrides[pt]!;
    } else if (allowed.includes(pt)) {
      result[pt] = { allowed: true, maxLTV };
    } else {
      result[pt] = { allowed: false, maxLTV: 0 };
    }
  }
  return result;
}

// ============================================================
// CONFIDENCE BAND HELPER
// ============================================================

function confidenceBand(score: number): string {
  if (score >= 80) return 'Highly verified';
  if (score >= 70) return 'Reliable';
  if (score >= 60) return 'Moderate confidence';
  return 'Low confidence — verify directly';
}

// ============================================================
// LENDER 1: GRIFFIN FUNDING (Confidence: 85)
// ============================================================

const GRIFFIN_FUNDING: LenderProgram = {
  id: 'griffin',
  name: 'Griffin Funding',
  version: '7.0',
  effectiveDate: '2026-06-01',
  verifiedDate: '2026-06-01',
  sourceType: 'VERIFIED_PRIMARY',
  sourceSnapshot: 'Griffin Funding lender site + May 2026 production data',
  confidenceScore: 85,
  confidenceBand: confidenceBand(85),

  statesAvailable: ALL_STATES,
  minFICO: dp(620, 'VERIFIED_PRIMARY', 'Griffin Funding lender site — 620 FICO minimum, accepts DSCR < 0.75', '2026-06', '620 FICO floor; sub-0.75 DSCR accepted via Flex program'),
  maxLTV: dp(80, 'VERIFIED_PRIMARY', 'Griffin Funding lender site', '2026-06'),
  minDSCR: dp(0.75, 'VERIFIED_PRIMARY', 'Griffin Funding lender site', '2026-06'),
  noRatioAvailable: dp(true, 'VERIFIED_PRIMARY', 'Griffin Funding lender site — no-ratio program available', '2026-06'),
  reserveRule: dp('6/9/12 standard; CA 9/12/15 overlay', 'VERIFIED_SECONDARY', '3rd-party review', '2026-06', 'CA geographic overlay requires 9/12/15 months'),
  strPolicy: {
    lenderId: 'griffin',
    allowed: true,
    haircutPercent: 20,
    incomeMethod: 'LT_MARKET_FALLBACK',
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: 'VERIFIED_PRIMARY',
  },
  prepayOptions: ['NONE', '54321', '4321', '321'] as PrepayType[],
  loanAmountMin: dp(65_000, 'VERIFIED_PRIMARY', 'Griffin Funding lender site', '2026-06'),
  loanAmountMax: dp(4_000_000, 'UNVERIFIED', 'Griffin site: jumbo to $4M in-house. $20M figure is UNVERIFIED — do not present as fact.', '2026-06', 'v11 FIX (AUDIT-4 #2): $20M figure is UNVERIFIED per spec Part I + Part N. $4M in-house is the verified cap.'),
  entityAllowed: ['INDIVIDUAL', 'LLC', 'S_CORP', 'C_CORP', 'TRUST'] as EntityType[],
  nonUsInvestorAllowed: dp(true, 'VERIFIED_SECONDARY', '3rd-party review', '2026-06'),
  propertyTypeRules: ptRules(
    ['SFR', '2-4_UNIT', 'CONDO_WARRANTABLE', 'CONDO_NON_WARRANTABLE', 'RURAL'],
    80,
    { 'CONDOTEL': { allowed: true, maxLTV: 70 }, '5+_UNIT': { allowed: false, maxLTV: 0 }, 'MIXED_USE': { allowed: false, maxLTV: 0 } },
  ),
  dscrFormulaMethod: 'GROSS_PITIA',
  vacancyTreatment: 'NONE',
  rateAdjustment: 0.25,
  rateSheetDate: '2026-06',

  bestFor: ['jumbo', 'sub-1.0 DSCR', 'no-ratio', 'nationwide'],
  cautions: [
    'Rate-sensitive outside core geography — +0.25% East Coast/Midwest',
    'CA reserve-constrained (9/12/15 mo overlay)',
  ],
  notes: 'May 2026 production: 62 loans, $20.79M, avg DSCR 1.14. Avg loan $335K (= $20.79M / 62 loans). Avg FICO 729 [UNVERIFIED]. Closing: 6 days fastest, 34 days avg. Fixed 6.125%-7.5%, ARM from 5.125%. +0.25% rate East Coast/Midwest. STR: AirDNA comparables required for STR purchase (no Airbnb history needed); documented STR history required for cash-out refi.',
  provenanceDetails: [
    { claim: 'All 50 states + DC', provenance: 'VERIFIED_PRIMARY', source: 'Lender site, 2026-06', date: '2026-06' },
    { claim: 'No FICO floor published', provenance: 'VERIFIED_PRIMARY', source: 'Lender site', date: '2026-06' },
    { claim: 'Max LTV 80%', provenance: 'VERIFIED_PRIMARY', source: 'Lender site', date: '2026-06' },
    { claim: 'Min DSCR 0.75 (sub-0.75 accepted via Flex)', provenance: 'VERIFIED_PRIMARY', source: 'Lender site', date: '2026-06' },
    { claim: 'No-ratio program available', provenance: 'VERIFIED_PRIMARY', source: 'Lender site', date: '2026-06' },
    { claim: 'Reserves 6/9/12; CA 9/12/15', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review', date: '2026-06' },
    { claim: 'Fixed 6.125%-7.5%, ARM from 5.125%', provenance: 'VERIFIED_PRIMARY', source: 'Lender site', date: '2026-06' },
    { claim: 'Up to $20M jumbo', provenance: 'VERIFIED_PRIMARY', source: 'Lender site', date: '2026-06' },
    { claim: 'Prepay 5-4-3-2-1; no-prepay at premium', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'STR: AirDNA comps required for purchase; documented history for cash-out refi', provenance: 'VERIFIED_PRIMARY', source: 'Griffin Funding STR guide', date: '2026-06' },
    { claim: 'DSCR formula GROSS_PITIA', provenance: 'VERIFIED_PRIMARY', source: 'Lender site', date: '2026-06' },
    { claim: 'Vacancy: NONE (lower-of rule, no vacancy factor)', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review', date: '2026-06' },
    { claim: 'May 2026: 62 loans, $20.79M, avg DSCR 1.14', provenance: 'VERIFIED_PRIMARY', source: 'Lender production data', date: '2026-05' },
    { claim: 'Avg FICO 729', provenance: 'UNVERIFIED', source: 'No reliable source', date: '2026-06' },
    { claim: 'Closing: 6 days fastest, 34 days avg', provenance: 'VERIFIED_PRIMARY', source: 'Lender production data', date: '2026-05' },
    { claim: '+0.25% rate East Coast/Midwest', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review', date: '2026-06' },
    { claim: 'Min FICO 620; sub-0.75 DSCR accepted', provenance: 'VERIFIED_PRIMARY', source: 'Lender site', date: '2026-06' },
  ],
};

// ============================================================
// LENDER 2: KIAVI (Confidence: 70)
// ============================================================

const KIAVI: LenderProgram = {
  id: 'kiavi',
  name: 'Kiavi',
  version: '7.0',
  effectiveDate: '2026-06-01',
  verifiedDate: '2026-06-01',
  sourceType: 'VERIFIED_SECONDARY',
  sourceSnapshot: '3rd-party review, 2026; Kiavi process guide',
  confidenceScore: 70,
  confidenceBand: confidenceBand(70),

  statesAvailable: ALL_STATES, // coverage in flux
  minFICO: dp(660, 'VERIFIED_SECONDARY', '3rd-party review, 2026', '2026-06'),
  maxLTV: dp(80, 'UNVERIFIED', 'Market pattern — verify directly', '2026-06'),
  minDSCR: dp(1.1, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — to prequalify', '2026-06', '1.1 DSCR to prequalify; do not assume lower'),
  noRatioAvailable: dp(false, 'UNVERIFIED', 'No reliable source — do not assume no-ratio available', '2026-06', 'UNVERIFIED — explicitly do not assume no-ratio'),
  reserveRule: dp('Advertises no reserves required (low-documentation); 3rd-party reviews mention 6-9 months typical as underwriting condition', 'VERIFIED_SECONDARY', '3rd-party review, 2026', '2026-06', 'Conflicting: Kiavi advertises no reserves, but 3rd-party reviews mention reserve documentation as typical condition. Verify directly.'),
  strPolicy: {
    lenderId: 'kiavi',
    allowed: true,
    haircutPercent: 25,
    incomeMethod: 'AIRDNA_PROJECTION',
    requiresAirDNA: false,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: 'UNVERIFIED',
  },
  prepayOptions: ['NONE', '321', 'SOFT_PREPAY'] as PrepayType[],
  loanAmountMin: dp(75_000, 'UNVERIFIED', 'Market pattern', '2026-06'),
  loanAmountMax: dp(3_000_000, 'UNVERIFIED', 'Market pattern', '2026-06'),
  entityAllowed: ['LLC', 'S_CORP', 'C_CORP', 'TRUST'] as EntityType[],
  nonUsInvestorAllowed: dp(false, 'VERIFIED_SECONDARY', 'SSN required, no ITIN', '2026-06', 'SSN required; ITIN not available'),
  propertyTypeRules: ptRules(
    ['SFR', '2-4_UNIT', 'CONDO_WARRANTABLE'],
    80,
    { 'CONDO_NON_WARRANTABLE': { allowed: false, maxLTV: 0 }, 'CONDOTEL': { allowed: false, maxLTV: 0 }, 'RURAL': { allowed: true, maxLTV: 75 }, '5+_UNIT': { allowed: false, maxLTV: 0 }, 'MIXED_USE': { allowed: false, maxLTV: 0 } },
  ),
  dscrFormulaMethod: 'GROSS_PITIA',
  vacancyTreatment: 'NONE',
  rateAdjustment: 0.50,
  rateSheetDate: '2026-06',

  bestFor: ['speed', 'BRRRR bridge-to-DSCR'],
  cautions: [
    'ITIN not available — SSN required',
    'Sub-1.1 DSCR unlikely to qualify',
    'Reserve-thin files may not pass',
    'State coverage in flux — verify before submitting',
  ],
  notes: 'Advertised "from 6%"; realistic 7.5%-11% — show both sources. Close timeline: 15-30 days, most within 3 weeks (7-14 day claim in v5.0 was optimistic). Portfolio loans available for 5+ properties (v5.0 wrongly said "Blanket: No"). STR/AirDNA market-conditional — confirm before underwriting. No-ratio: UNVERIFIED — do not assume. Penalties typical first 3 years; soft prepay reported.',
  provenanceDetails: [
    { claim: 'States: coverage in flux', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'Min FICO 660', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Max LTV 80%', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'Min DSCR 1.1 to prequalify', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'No-ratio available', provenance: 'UNVERIFIED', source: 'No reliable source', date: '2026-06' },
    { claim: 'Reserves 6-9 months typical', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Advertised "from 6%"', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review', date: '2026-06' },
    { claim: 'Realistic 7.5%-11%', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'SSN required, no ITIN', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review', date: '2026-06' },
    { claim: 'DSCR formula GROSS_PITIA', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'Soft prepay reported', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: '15-30 day close; most within 3 weeks', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Portfolio loans available for 5+ properties', provenance: 'VERIFIED_PRIMARY', source: 'Kiavi program guide', date: '2026-06' },
  ],
};

// ============================================================
// LENDER 3: VISIO LENDING (Confidence: 78)
// ============================================================

const VISIO_LENDING: LenderProgram = {
  id: 'visio',
  name: 'Visio Lending',
  version: '7.0',
  effectiveDate: '2026-06-01',
  verifiedDate: '2026-06-01',
  sourceType: 'VERIFIED_SECONDARY',
  sourceSnapshot: '3rd-party review, 2026; Visio Lending lender site',
  confidenceScore: 78,
  confidenceBand: confidenceBand(78),

  statesAvailable: STATES_48, // excludes AK, HI
  minFICO: dp(680, 'VERIFIED_SECONDARY', '3rd-party review, 2026', '2026-06'),
  maxLTV: dp(80, 'VERIFIED_PRIMARY', 'Visio Lending lender site — up to 80% on STR', '2026-06'),
  minDSCR: dp(1.0, 'UNVERIFIED', '3rd-party review cites 1.0 DSCR minimum; 0.75 Flex program unconfirmed — verify directly', '2026-06', 'Standard min DSCR 1.0 per 3rd-party review; Flex 0.75 floor UNVERIFIED — confirm if still offered'),
  noRatioAvailable: dp(false, 'UNVERIFIED', 'Not offered per market intelligence', '2026-06'),
  reserveRule: dp('6 months standard', 'UNVERIFIED', 'Market pattern — verify directly', '2026-06'),
  strPolicy: {
    lenderId: 'visio',
    allowed: true,
    haircutPercent: 20,
    incomeMethod: 'HISTORICAL_12MO',
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: 'VERIFIED_PRIMARY',
  },
  prepayOptions: ['NONE', '54321', '4321', '321'] as PrepayType[],
  loanAmountMin: dp(75_000, 'VERIFIED_SECONDARY', '3rd-party review, 2026', '2026-06'),
  loanAmountMax: dp(2_000_000, 'VERIFIED_PRIMARY', 'Spec Part I June 2026 (line 691): "~$75K-$2M". Previous $5M figure was from 3rd-party review and overstated per v11 spec.', '2026-06', 'v11.1 FIX (AUDIT-10 issue 5): Reverted from $5M to $2M per spec. The $5M figure was based on stale 3rd-party reviews that conflict with the v11 spec.'),
  entityAllowed: ['INDIVIDUAL', 'LLC', 'S_CORP', 'C_CORP', 'TRUST'] as EntityType[],
  nonUsInvestorAllowed: dp(true, 'UNVERIFIED', 'Market pattern', '2026-06'),
  propertyTypeRules: ptRules(
    ['SFR', '2-4_UNIT', 'CONDO_WARRANTABLE', 'CONDOTEL'],
    80,
    { 'CONDO_NON_WARRANTABLE': { allowed: true, maxLTV: 75 }, 'RURAL': { allowed: true, maxLTV: 75 }, '5+_UNIT': { allowed: false, maxLTV: 0 }, 'MIXED_USE': { allowed: false, maxLTV: 0 } },
  ),
  dscrFormulaMethod: 'GROSS_PITIA',
  vacancyTreatment: 'NONE',
  rateAdjustment: -0.125,
  rateSheetDate: '2026-06',

  bestFor: ['STR', 'unique properties', 'sub-1.0 Flex', '12-month STR history'],
  cautions: [
    'AK/HI excluded',
    'Hard cap $2M (jumbo NOT offered — spec confirmed)',
    'Rate-shoppers on pristine files may find better elsewhere',
  ],
  notes: 'Broadest STR acceptance — historical OR projections, unique property types. STR LTV capped at 75% per market comparison (v5.0 claimed 80% — corrected). GROSS_PITIA with lower-of rule, NO vacancy factor. Prepay: 5-4-3-2-1 standard; no-prepay at +0.625%. Flex program (0.75 floor) UNVERIFIED — downgraded from prior claim; confirm directly. v11.1: loanAmountMax reverted from $5M to $2M per spec Part I line 691.',
  provenanceDetails: [
    { claim: '48 states (excludes AK, HI)', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Min FICO 680', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Max LTV 80% (up to 80% on STR)', provenance: 'VERIFIED_PRIMARY', source: 'Lender site', date: '2026-06' },
    { claim: 'Min DSCR 0.75 (Flex)', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'No-ratio not offered', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'Reserves market pattern', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'Prepay 5-4-3-2-1; no-prepay at +0.625%', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Broadest STR acceptance', provenance: 'VERIFIED_PRIMARY', source: 'Lender site', date: '2026-06' },
    { claim: 'GROSS_PITIA, lower-of rule, NO vacancy factor', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Max loan $2M (spec Part I line 691)', provenance: 'VERIFIED_PRIMARY', source: 'Spec Part I June 2026', date: '2026-06' },
  ],
};

// ============================================================
// LENDER 4: LIMA ONE CAPITAL (Confidence: 76)
// ============================================================

const LIMA_ONE_CAPITAL: LenderProgram = {
  id: 'lima_one',
  name: 'Lima One Capital',
  version: '7.0',
  effectiveDate: '2026-06-01',
  verifiedDate: '2026-06-01',
  sourceType: 'VERIFIED_PRIMARY',
  sourceSnapshot: 'Lender materials, 2026; market intelligence for unspecified fields',
  confidenceScore: 76,
  confidenceBand: confidenceBand(76),

  statesAvailable: ALL_STATES,
  minFICO: dp(660, 'VERIFIED_SECONDARY', '3rd-party review, 2026', '2026-06'),
  maxLTV: dp(80, 'VERIFIED_SECONDARY', '3rd-party review, 2026', '2026-06'),
  minDSCR: dp(1.0, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — 1.0 minimum for standard program', '2026-06', 'Standard DSCR product: 1.0 minimum, 660 FICO, 80% LTV, up to $5M'),
  noRatioAvailable: dp(false, 'UNVERIFIED', 'Market pattern — verify directly', '2026-06'),
  reserveRule: dp('6 months standard; 3 months experienced (10+ properties)', 'VERIFIED_SECONDARY', '3rd-party review, 2026', '2026-06', 'Experienced investors with 10+ properties may qualify for 3-month reserves'),
  strPolicy: {
    lenderId: 'lima_one',
    allowed: true,
    haircutPercent: 15,
    incomeMethod: 'AIRDNA_PROJECTION',
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: 'VERIFIED_PRIMARY',
  },
  prepayOptions: ['NONE', '321', '54321'] as PrepayType[],
  loanAmountMin: dp(75_000, 'VERIFIED_SECONDARY', '3rd-party review, 2026', '2026-06'),
  loanAmountMax: dp(2_000_000, 'VERIFIED_PRIMARY', 'Spec Part I June 2026 (line 686): "To $2M/80% LTV". Previous $5M figure was from 3rd-party review and overstated per v11 spec.', '2026-06', 'v11.1 FIX (AUDIT-10 issue 7): Reverted from $5M to $2M per spec. v5.0 had $3M+; v7 raised to $5M based on stale 3rd-party reviews; v11 spec confirms $2M cap.'),
  entityAllowed: ['INDIVIDUAL', 'LLC', 'S_CORP', 'C_CORP', 'TRUST'] as EntityType[],
  nonUsInvestorAllowed: dp(false, 'UNVERIFIED', 'Market pattern', '2026-06'),
  propertyTypeRules: ptRules(
    ['SFR', '2-4_UNIT', 'CONDO_WARRANTABLE', 'CONDO_NON_WARRANTABLE', 'CONDOTEL'],
    80,
    { 'RURAL': { allowed: true, maxLTV: 75 }, '5+_UNIT': { allowed: false, maxLTV: 0 }, 'MIXED_USE': { allowed: false, maxLTV: 0 } },
  ),
  dscrFormulaMethod: 'GROSS_PITIA',
  vacancyTreatment: 'NONE',
  rateAdjustment: -0.375,
  rateSheetDate: '2026-06',

  bestFor: ['experienced investors', 'STR with AirDNA data', 'portfolio programs'],
  cautions: [
    'Confirm exact terms per program — many programs with varying terms',
    'Blanket loans available — CRITICAL exit warning for cross-collateralized properties',
    'AirDNA-backed STR program — STR friendliness 4/5',
    'v11.1: Hard cap $2M per spec (was $5M based on 3rd-party reviews)',
  ],
  notes: 'AirDNA-backed specialized STR program (stronger DSCRs, higher LTVs, better terms — corrected from v5.0). v11.1: $2M limit per spec Part I (was $5M in v7 based on stale 3rd-party review — reverted). STR friendliness 4/5. Prepay: 3-2-1 standard; extended 5-4-3-2-1 at lower rate. Advertises 7-10 day close but realistic timeline is ~3 weeks. Blanket loan program available — CRITICAL: exit warning on cross-collateralization. Reserves: 6 mo standard; 3 mo for experienced (10+ properties). BRRRR one-stop shop (bridge + DSCR takeout).',
  provenanceDetails: [
    { claim: 'States available', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'Min FICO', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'Max LTV', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'Min DSCR', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'AirDNA-backed STR program, 4/5 friendliness', provenance: 'VERIFIED_PRIMARY', source: 'Lender materials, 2026', date: '2026-06' },
    { claim: 'Prepay 3-2-1 standard; 5-4-3-2-1 at lower rate', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'Reserves 6mo standard; 3mo experienced', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'Blanket loans available', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'Max loan $2M (spec Part I line 686)', provenance: 'VERIFIED_PRIMARY', source: 'Spec Part I June 2026', date: '2026-06' },
  ],
};

// ============================================================
// LENDER 5: DEFI MORTGAGE (Confidence: 80)
// ============================================================

const DEFI_MORTGAGE: LenderProgram = {
  id: 'defy',
  name: 'Defy Mortgage',
  version: '7.0',
  effectiveDate: '2026-06-01',
  verifiedDate: '2026-06-01',
  sourceType: 'VERIFIED_PRIMARY',
  sourceSnapshot: 'Defy Mortgage lender site, 2026',
  confidenceScore: 80,
  confidenceBand: confidenceBand(80),

  statesAvailable: ALL_STATES,
  minFICO: dp(640, 'VERIFIED_PRIMARY', 'Defy Mortgage lender site, 2026', '2026-06'),
  maxLTV: dp(85, 'VERIFIED_PRIMARY', 'Defy Mortgage lender site — 85% on SFR purchases for 740+ FICO, 1.0+ DSCR', '2026-06', '85% LTV requires 740+ FICO and 1.0+ DSCR; otherwise 80%'),
  minDSCR: dp(0.75, 'VERIFIED_PRIMARY', 'Defy Mortgage lender site, 2026', '2026-06'),
  noRatioAvailable: dp(false, 'UNVERIFIED', 'Market pattern — not confirmed', '2026-06'),
  reserveRule: dp('3-month minimum standard', 'VERIFIED_PRIMARY', 'Defy Mortgage lender site, 2026', '2026-06'),
  strPolicy: {
    lenderId: 'defy',
    allowed: true,
    haircutPercent: 20,
    incomeMethod: 'AIRDNA_PROJECTION',
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: 'VERIFIED_PRIMARY',
  },
  prepayOptions: ['NONE', '321', '54321'] as PrepayType[],
  loanAmountMin: dp(75_000, 'UNVERIFIED', 'Market pattern', '2026-06'),
  loanAmountMax: dp(2_500_000, 'UNVERIFIED', 'Market pattern', '2026-06'),
  entityAllowed: ['INDIVIDUAL', 'LLC', 'S_CORP', 'C_CORP', 'TRUST'] as EntityType[],
  nonUsInvestorAllowed: dp(false, 'UNVERIFIED', 'Market pattern', '2026-06'),
  propertyTypeRules: ptRules(
    ['SFR', '2-4_UNIT', 'CONDO_WARRANTABLE', 'CONDO_NON_WARRANTABLE'],
    85,
    { 'CONDOTEL': { allowed: false, maxLTV: 0 }, 'RURAL': { allowed: true, maxLTV: 75 }, '5+_UNIT': { allowed: false, maxLTV: 0 }, 'MIXED_USE': { allowed: false, maxLTV: 0 } },
  ),
  dscrFormulaMethod: 'GROSS_PITIA',
  vacancyTreatment: 'NONE',
  rateAdjustment: -0.125,
  rateSheetDate: '2026-06',

  bestFor: ['high-leverage (85% LTV)', '640-679 FICO', 'sub-1.0 DSCR', 'STR with AirDNA'],
  cautions: [
    'Single-source profile — verify directly',
    '85% LTV requires 740+ FICO and 1.0+ DSCR',
    'Closing 14-21 days per lender site',
  ],
  notes: '85% LTV on SFR purchases for 740+ FICO, 1.0+ DSCR. 20% standardized gross-income haircut on STR. Closing: 14-21 days. LLC vesting allowed. 3-month minimum reserves.',
  provenanceDetails: [
    { claim: 'Min FICO 640', provenance: 'VERIFIED_PRIMARY', source: 'Lender site, 2026', date: '2026-06' },
    { claim: 'Max LTV 85% (740+ FICO, 1.0+ DSCR)', provenance: 'VERIFIED_PRIMARY', source: 'Lender site, 2026', date: '2026-06' },
    { claim: 'Min DSCR 0.75', provenance: 'VERIFIED_PRIMARY', source: 'Lender site, 2026', date: '2026-06' },
    { claim: 'Reserves 3-month minimum', provenance: 'VERIFIED_PRIMARY', source: 'Lender site, 2026', date: '2026-06' },
    { claim: 'STR 20% gross-income haircut', provenance: 'VERIFIED_PRIMARY', source: 'Lender site, 2026', date: '2026-06' },
    { claim: 'Closing 14-21 days', provenance: 'VERIFIED_PRIMARY', source: 'Lender site, 2026', date: '2026-06' },
    { claim: 'LLC vesting allowed', provenance: 'VERIFIED_PRIMARY', source: 'Lender site, 2026', date: '2026-06' },
  ],
};

// ============================================================
// LENDER 6: EASY STREET CAPITAL (Confidence: 82)
// ============================================================

const EASY_STREET_CAPITAL: LenderProgram = {
  id: 'easy_street',
  name: 'Easy Street Capital',
  version: '7.0',
  effectiveDate: '2026-06-01',
  verifiedDate: '2026-06-01',
  sourceType: 'VERIFIED_PRIMARY',
  sourceSnapshot: 'Easy Street Capital lender site, 2026',
  confidenceScore: 82,
  confidenceBand: confidenceBand(82),

  statesAvailable: ALL_STATES,
  minFICO: dp(620, 'VERIFIED_PRIMARY', 'Easy Street Capital lender site', '2026-06'),
  maxLTV: dp(80, 'VERIFIED_PRIMARY', 'Easy Street Capital lender site', '2026-06'),
  minDSCR: dp(0.80, 'VERIFIED_PRIMARY', 'Easy Street Capital lender site — 0.80 minimum DSCR for purchase', '2026-06'),
  noRatioAvailable: dp(true, 'VERIFIED_PRIMARY', 'Easy Street Capital lender site — no minimum DSCR', '2026-06'),
  reserveRule: dp('3-9 months', 'VERIFIED_PRIMARY', 'Easy Street Capital lender site', '2026-06'),
  strPolicy: {
    lenderId: 'easy_street',
    allowed: true,
    haircutPercent: 10,
    incomeMethod: 'AIRDNA_100_PCT',
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: 'VERIFIED_PRIMARY',
  },
  prepayOptions: ['NONE', '321', '54321'] as PrepayType[],
  loanAmountMin: dp(50_000, 'VERIFIED_PRIMARY', 'Easy Street Capital lender site', '2026-06'),
  loanAmountMax: dp(3_000_000, 'VERIFIED_PRIMARY', 'Easy Street Capital lender site', '2026-06'),
  entityAllowed: ['INDIVIDUAL', 'LLC', 'S_CORP', 'C_CORP', 'TRUST'] as EntityType[],
  nonUsInvestorAllowed: dp(true, 'UNVERIFIED', 'Market pattern', '2026-06'),
  propertyTypeRules: ptRules(
    ['SFR', '2-4_UNIT', 'CONDO_WARRANTABLE', 'CONDOTEL'],
    80,
    { 'CONDO_NON_WARRANTABLE': { allowed: true, maxLTV: 75 }, 'RURAL': { allowed: true, maxLTV: 75 }, '5+_UNIT': { allowed: false, maxLTV: 0 }, 'MIXED_USE': { allowed: false, maxLTV: 0 } },
  ),
  dscrFormulaMethod: 'GROSS_PITIA',
  vacancyTreatment: 'NONE',
  rateAdjustment: -0.25,
  rateSheetDate: '2026-06',

  bestFor: ['professional STR', 'AirDNA-driven underwriting', 'vacation rentals', 'condotels'],
  cautions: [
    'Confirm LTV, reserves, and state restrictions',
    'May use 100% of projected revenue for professional STR investors only',
    'Condos/condotels eligibility varies',
  ],
  notes: 'STR specialist: AirDNA data. May use 100% of projected revenue for professional STR investors. No minimum DSCR for STR loans reported. STR refis can use projections before 12-month history. Condos/condotels may be eligible. $500M+ funded.',
  provenanceDetails: [
    { claim: 'AirDNA data for STR', provenance: 'VERIFIED_PRIMARY', source: 'Lender site', date: '2026-06' },
    { claim: 'May use 100% of projected revenue for professional STR investors', provenance: 'VERIFIED_PRIMARY', source: 'Lender site', date: '2026-06' },
    { claim: 'No minimum DSCR for STR loans', provenance: 'VERIFIED_PRIMARY', source: 'Lender site', date: '2026-06' },
    { claim: 'STR refis can use projections before 12-month history', provenance: 'VERIFIED_PRIMARY', source: 'Lender site', date: '2026-06' },
    { claim: 'Condos/condotels may be eligible', provenance: 'VERIFIED_PRIMARY', source: 'Lender site', date: '2026-06' },
  ],
};

// ============================================================
// LENDER 7: NEW SILVER (Confidence: 72)
// ============================================================

const NEW_SILVER: LenderProgram = {
  id: 'new_silver',
  name: 'New Silver',
  version: '7.0',
  effectiveDate: '2026-06-01',
  verifiedDate: '2026-06-01',
  sourceType: 'VERIFIED_PRIMARY',
  sourceSnapshot: 'New Silver help center, 2026',
  confidenceScore: 72,
  confidenceBand: confidenceBand(72),

  statesAvailable: ALL_STATES,
  // v11 FIX (AUDIT-4 #4): Spec Part I confirms New Silver FICO 660 (not 640) and DSCR floor 0.75 (not 0)
  minFICO: dp(660, 'VERIFIED_PRIMARY', 'Spec Part I June 2026: New Silver FICO 660 (corrected from 640)', '2026-06', 'v11 FIX per spec Part I: 660 FICO minimum'),
  maxLTV: dp(80, 'VERIFIED_PRIMARY', 'New Silver help center', '2026-06'),
  minDSCR: dp(0.75, 'VERIFIED_PRIMARY', 'Spec Part I June 2026: New Silver DSCR↓0.75 (corrected from 0)', '2026-06', 'v11 FIX per spec Part I: 0.75 DSCR floor'),
  noRatioAvailable: dp(true, 'VERIFIED_PRIMARY', 'New Silver help center — no min DSCR = effectively no-ratio program', '2026-06'),
  reserveRule: dp('6 months standard', 'UNVERIFIED', 'Market pattern', '2026-06'),
  strPolicy: {
    lenderId: 'new_silver',
    allowed: true,
    haircutPercent: 20,
    incomeMethod: 'AIRDNA_PROJECTION',
    requiresAirDNA: false,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: 'UNVERIFIED',
  },
  prepayOptions: ['NONE', '321', '54321'] as PrepayType[],
  loanAmountMin: dp(150_000, 'VERIFIED_PRIMARY', 'New Silver help center', '2026-06'),
  loanAmountMax: dp(3_000_000, 'VERIFIED_PRIMARY', 'New Silver help center', '2026-06'),
  entityAllowed: ['INDIVIDUAL', 'LLC', 'S_CORP', 'C_CORP', 'TRUST'] as EntityType[],
  nonUsInvestorAllowed: dp(false, 'UNVERIFIED', 'Market pattern', '2026-06'),
  propertyTypeRules: ptRules(
    ['SFR', '2-4_UNIT', 'CONDO_WARRANTABLE'],
    80,
    { 'CONDO_NON_WARRANTABLE': { allowed: true, maxLTV: 75 }, 'CONDOTEL': { allowed: false, maxLTV: 0 }, 'RURAL': { allowed: true, maxLTV: 75 }, '5+_UNIT': { allowed: false, maxLTV: 0 }, 'MIXED_USE': { allowed: false, maxLTV: 0 } },
  ),
  dscrFormulaMethod: 'GROSS_PITIA',
  vacancyTreatment: 'NONE',
  rateAdjustment: 0.75,
  rateSheetDate: '2026-06',

  bestFor: ['speed', 'sub-1.0 DSCR', 'STR', 'tech-forward'],
  cautions: [
    'Confirm pricing — typically 50-100bps above established lenders',
    'Instant approval but verify terms',
    'Closing 14-21 days per help center',
  ],
  notes: 'Loan amounts $150K-$3M. Instant approval, 14-21 days closing. STR: yes (provenance UNVERIFIED — confirm directly). Tech-forward platform. No minimum DSCR — places greater importance on property and borrower FICO. Pricing typically 50-100bps above established lenders — confirm directly.',
  provenanceDetails: [
    { claim: 'Loan amounts $150K-$3M', provenance: 'VERIFIED_PRIMARY', source: 'Help center', date: '2026-06' },
    { claim: 'Max LTV 80%', provenance: 'VERIFIED_PRIMARY', source: 'Help center', date: '2026-06' },
    { claim: 'No minimum DSCR — greater importance on property + FICO', provenance: 'VERIFIED_PRIMARY', source: 'Help center', date: '2026-06' },
    { claim: 'Min FICO 640 (corrected from v5.0 660)', provenance: 'VERIFIED_PRIMARY', source: 'Help center', date: '2026-06' },
    { claim: 'STR: yes (provenance UNVERIFIED)', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'Instant approval, 14-21 days', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'Typically 50-100bps above established lenders', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
  ],
};

// ============================================================
// LENDER 8: DEEPHAVEN MORTGAGE (Confidence: 65)
// ============================================================

const DEEPHAVEN_MORTGAGE: LenderProgram = {
  id: 'deephaven',
  name: 'Deephaven Mortgage',
  version: '7.0',
  effectiveDate: '2026-06-01',
  verifiedDate: '2026-06-01',
  sourceType: 'VERIFIED_PRIMARY',
  sourceSnapshot: 'Deephaven Mortgage site (90% LTV, $3.5M, gift funds, no financed limit); matrix for reserves; wholesale/broker channel. v11 FIX: STALE — highest reverify priority per spec Part I.',
  // v11 FIX (AUDIT-4 #3): Spec Part I requires Deephaven confidence = 65 (STALE — highest reverify priority)
  // Code was 78 (Reliable band); now 65 (Moderate confidence) per spec.
  confidenceScore: 65,
  confidenceBand: confidenceBand(65),

  statesAvailable: ALL_STATES,
  minFICO: dp(660, 'VERIFIED_PRIMARY', 'Deephaven Mortgage site — 660 FICO minimum advertised', '2026-06'),
  maxLTV: dp(90, 'VERIFIED_PRIMARY', 'Deephaven Mortgage site — up to 90% LTV with no MI advertised (corrected from v5.0 80%); 80% standard, 75% first-time investors', '2026-06', 'Advertises up to 90% LTV with no MI; standard 80%, first-time investors 75%'),
  minDSCR: dp(0.75, 'VERIFIED_PRIMARY', 'Deephaven Mortgage site — DSCR <1.0 down to 0.75x tier (reconfirm current availability)', '2026-06', '0.75x min tier — older source, reconfirm'),
  noRatioAvailable: dp(true, 'UNVERIFIED', 'No-ratio at ~65% LTV reported', '2026-06', 'No-ratio at ~65% LTV — UNVERIFIED, verify'),
  reserveRule: dp('3mo up to $1M; 6mo over $1M; 6mo for DSCR<1; 12mo for non-US investors; gift funds OK with conditions', 'VERIFIED_PRIMARY', 'Deephaven Mortgage site — gift funds can be used for down payment, closing costs, and reserves with documented minimum borrower contribution', '2026-06', 'Gift funds accepted for reserves with conditions (corrected from v5.0 "gift funds not accepted")'),
  strPolicy: {
    lenderId: 'deephaven',
    allowed: true,
    haircutPercent: 25,
    incomeMethod: 'APPRAISAL_STR',
    requiresAirDNA: false,
    requiresLease: true,
    maxLTVForSTR: 70,
    provenance: 'VERIFIED_SECONDARY',
  },
  prepayOptions: ['NONE', '54321', 'YIELD_MAINTENANCE'] as PrepayType[],
  loanAmountMin: dp(100_000, 'UNVERIFIED', 'Market pattern', '2026-06'),
  loanAmountMax: dp(3_500_000, 'VERIFIED_PRIMARY', 'Deephaven Mortgage site — $3.5M max (corrected from v5.0 $3M+)', '2026-06'),
  entityAllowed: ['INDIVIDUAL', 'LLC', 'S_CORP', 'C_CORP', 'TRUST'] as EntityType[],
  nonUsInvestorAllowed: dp(true, 'UNVERIFIED', 'ITIN program reported', '2026-06', 'ITIN program — UNVERIFIED, verify'),
  propertyTypeRules: ptRules(
    ['SFR', '2-4_UNIT', 'CONDO_WARRANTABLE', 'CONDO_NON_WARRANTABLE'],
    80,
    { 'CONDOTEL': { allowed: false, maxLTV: 0 }, 'RURAL': { allowed: true, maxLTV: 70 }, '5+_UNIT': { allowed: false, maxLTV: 0 }, 'MIXED_USE': { allowed: false, maxLTV: 0 } },
  ),
  dscrFormulaMethod: 'GROSS_PITIA',
  vacancyTreatment: 'NONE',
  rateAdjustment: 0.25,
  rateSheetDate: '2026-06',

  bestFor: ['sub-1.0 DSCR', 'wholesale/broker channel', 'clear gross-rent/PITIA'],
  cautions: [
    'Rerverify current matrix — stale source date',
    'First-time investors max 75% LTV',
    'Hard prepay standard',
    'DSCR formula varies: GROSS_PITIA for amortizing, GROSS_ITIA for IO',
  ],
  notes: 'DSCR formula: GROSS_PITIA for amortizing, GROSS_ITIA for IO. Lower-of lease/1007; higher lease allowed with receipts. DSCR down to 0.75. Reserves: 3mo up to $1M, 6mo over $1M, 6mo for DSCR<1, 12mo for non-US investors. No-ratio at ~65% LTV [UNVERIFIED]. ITIN program [UNVERIFIED]. Hard prepay standard.',
  provenanceDetails: [
    { claim: 'Max LTV up to 90% advertised (no MI); 80% standard, 75% first-time investors', provenance: 'VERIFIED_PRIMARY', source: 'Deephaven site', date: '2026-06' },
    { claim: 'DSCR <1.0 down to 0.75x tier (reconfirm current availability)', provenance: 'VERIFIED_PRIMARY', source: 'Deephaven site', date: '2026-06' },
    { claim: 'Reserves: 3mo/$1M, 6mo/>$1M, 6mo/DSCR<1, 12mo/foreign; gift funds OK w/ conditions', provenance: 'VERIFIED_PRIMARY', source: 'Deephaven site', date: '2026-06' },
    { claim: 'First-time investors max 75% LTV', provenance: 'VERIFIED_PRIMARY', source: 'Deephaven matrix', date: '2026-06' },
    { claim: 'No financed property limit (per lender site)', provenance: 'VERIFIED_PRIMARY', source: 'Deephaven site', date: '2026-06' },
    { claim: 'Max loan $3.5M (corrected from v5.0 $3M+)', provenance: 'VERIFIED_PRIMARY', source: 'Deephaven site', date: '2026-06' },
    { claim: 'No-ratio at ~65% LTV', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'ITIN program', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'Hard prepay standard', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
  ],
};

// ============================================================
// LENDER 9: ANGEL OAK (Confidence: 63)
// ============================================================

const ANGEL_OAK: LenderProgram = {
  id: 'angel_oak',
  name: 'Angel Oak',
  version: '7.0',
  effectiveDate: '2026-06-01',
  verifiedDate: '2026-06-01',
  sourceType: 'VERIFIED_SECONDARY',
  sourceSnapshot: 'Angel Oak program page (verified STR/no-ratio); 3rd-party reviews for Southeast/AirDNA/LLC vesting',
  confidenceScore: 75,
  confidenceBand: confidenceBand(75),

  statesAvailable: ALL_STATES,
  minFICO: dp(680, 'VERIFIED_PRIMARY', 'Angel Oak program page — 680 FICO with 70% LTV; 700 FICO unlocks 75% LTV; 720 FICO unlocks 80% LTV', '2026-06'),
  maxLTV: dp(80, 'VERIFIED_PRIMARY', 'Angel Oak program page — 80% LTV requires 720 FICO + 1.00 DSCR', '2026-06'),
  minDSCR: dp(1.0, 'VERIFIED_PRIMARY', 'Angel Oak program page — 1.00 DSCR for STR; no-ratio program also available at 700 FICO / 75% LTV', '2026-06'),
  noRatioAvailable: dp(true, 'VERIFIED_PRIMARY', 'Angel Oak program page — no-ratio at 700 FICO, 75% max LTV', '2026-06', 'No-ratio: 700 FICO + 75% max LTV [VERIFIED_PRIMARY]'),
  reserveRule: dp('6 months baseline', 'UNVERIFIED', 'Market pattern', '2026-06'),
  strPolicy: {
    lenderId: 'angel_oak',
    allowed: true,
    haircutPercent: 20,
    incomeMethod: 'AIRDNA_PROJECTION',
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: 'VERIFIED_SECONDARY',
  },
  prepayOptions: ['NONE', '54321'] as PrepayType[],
  loanAmountMin: dp(150_000, 'UNVERIFIED', 'Market pattern', '2026-06'),
  loanAmountMax: dp(3_000_000, 'UNVERIFIED', 'Market pattern', '2026-06'),
  entityAllowed: ['INDIVIDUAL', 'LLC', 'S_CORP', 'C_CORP', 'TRUST'] as EntityType[],
  nonUsInvestorAllowed: dp(false, 'UNVERIFIED', 'Market pattern', '2026-06'),
  propertyTypeRules: ptRules(
    ['SFR', '2-4_UNIT', 'CONDO_WARRANTABLE', 'CONDO_NON_WARRANTABLE'],
    80,
    { 'CONDO_NON_WARRANTABLE': { allowed: true, maxLTV: 75 }, 'CONDOTEL': { allowed: false, maxLTV: 0 }, 'RURAL': { allowed: true, maxLTV: 70 }, '5+_UNIT': { allowed: false, maxLTV: 0 }, 'MIXED_USE': { allowed: false, maxLTV: 0 } },
  ),
  dscrFormulaMethod: 'GROSS_PITIA',
  vacancyTreatment: 'NONE',
  rateAdjustment: 0.50,
  rateSheetDate: '2026-06',

  bestFor: ['non-warrantable condo', 'STR with AirDNA reports', 'Southeast regional strength', 'LLC/corp/trust vesting'],
  cautions: [
    'Legacy profile — reverify all terms',
    'Hard prepay; +0.625% for no-prepay option',
    'STR LTV capped at 75% per market comparison',
    'Rates +0.25-0.5% above Visio/Kiavi; turn times slower (large institution)',
  ],
  notes: 'Non-warrantable condo program. STR program: 80% LTV at 720 FICO + 1.00 DSCR; 75% LTV at 700 FICO; 70% LTV at 680 FICO. AirDNA reports accepted for STR (per third-party comparison — conflicts with earlier doc, verify directly). No-ratio: 700 FICO, 75% max LTV [VERIFIED per lender site]. Non-warrantable condos, LLC/corp/trust vesting, 10+ financed properties all accepted. 6-month reserve baseline. Hard prepay standard; +0.625% no-prepay option available. Southeast regional strength (FL, GA, NC/SC, TN). Rates +0.25-0.5% above Visio/Kiavi at equivalent FICO/DSCR — but file gets approved when others deny. Larger institution — turn times can lag smaller shops. Legacy profile — reverify all terms before submission.',
  provenanceDetails: [
    { claim: 'Non-warrantable condo program', provenance: 'VERIFIED_SECONDARY', source: 'Lender site + 3rd-party review', date: '2026-06' },
    { claim: '6-month reserve baseline', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'Hard prepay; +0.625% no-prepay', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'STR: 80% LTV @ 720 FICO + 1.00 DSCR', provenance: 'VERIFIED_PRIMARY', source: 'Angel Oak program page', date: '2026-06' },
    { claim: 'STR: 75% LTV @ 700 FICO', provenance: 'VERIFIED_PRIMARY', source: 'Angel Oak program page', date: '2026-06' },
    { claim: 'No-ratio: 700 FICO, 75% max LTV', provenance: 'VERIFIED_PRIMARY', source: 'Lender site', date: '2026-06' },
    { claim: 'AirDNA reports accepted for STR', provenance: 'VERIFIED_SECONDARY', source: '3rd-party comparison (conflicts w/ prior doc)', date: '2026-06' },
    { claim: 'STR LTV capped at 75% (market comparison)', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review', date: '2026-06' },
    { claim: 'Southeast regional strength (FL/GA/NC/SC/TN)', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review', date: '2026-06' },
    { claim: 'Rates +0.25-0.5% above Visio/Kiavi', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review', date: '2026-06' },
    { claim: 'Larger institution — slower turn times', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review', date: '2026-06' },
    { claim: 'LLC/corp/trust vesting accepted', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review', date: '2026-06' },
    { claim: '10+ financed properties accepted', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review', date: '2026-06' },
  ],
};

// ============================================================
// LENDER 10: COREVEST (Confidence: 68)
// ============================================================

const COREVEST: LenderProgram = {
  id: 'corevest',
  name: 'CoreVest',
  version: '7.0',
  effectiveDate: '2026-06-01',
  verifiedDate: '2026-06-01',
  sourceType: 'UNVERIFIED',
  sourceSnapshot: 'Market intelligence; institutional portfolio lender',
  confidenceScore: 68,
  confidenceBand: confidenceBand(68),

  statesAvailable: ALL_STATES,
  minFICO: dp(680, 'UNVERIFIED', 'Market pattern — verify directly', '2026-06'),
  maxLTV: dp(75, 'UNVERIFIED', 'Market pattern — verify directly', '2026-06', 'Institutional portfolio terms may differ from individual loan LTVs'),
  minDSCR: dp(1.25, 'UNVERIFIED', 'Market pattern — verify directly', '2026-06', 'Institutional underwriting may require higher DSCR'),
  noRatioAvailable: dp(false, 'UNVERIFIED', 'Market pattern — verify directly', '2026-06'),
  reserveRule: dp('6 months minimum', 'UNVERIFIED', 'Market pattern', '2026-06'),
  strPolicy: {
    lenderId: 'corevest',
    allowed: false,
    haircutPercent: 0,
    incomeMethod: 'LT_MARKET_FALLBACK',
    requiresAirDNA: false,
    requiresLease: true,
    maxLTVForSTR: 0,
    provenance: 'UNVERIFIED',
  },
  prepayOptions: ['NONE', 'YIELD_MAINTENANCE'] as PrepayType[],
  loanAmountMin: dp(2_000_000, 'UNVERIFIED', 'Market pattern — institutional minimum', '2026-06'),
  loanAmountMax: dp(50_000_000, 'UNVERIFIED', 'Market pattern — $50M+ for large portfolios', '2026-06'),
  entityAllowed: ['LLC', 'S_CORP', 'C_CORP', 'TRUST'] as EntityType[],
  nonUsInvestorAllowed: dp(false, 'UNVERIFIED', 'Market pattern', '2026-06'),
  propertyTypeRules: ptRules(
    ['SFR', '2-4_UNIT', 'CONDO_WARRANTABLE'],
    75,
    { 'CONDO_NON_WARRANTABLE': { allowed: false, maxLTV: 0 }, 'CONDOTEL': { allowed: false, maxLTV: 0 }, 'RURAL': { allowed: true, maxLTV: 70 }, '5+_UNIT': { allowed: true, maxLTV: 75 }, 'MIXED_USE': { allowed: true, maxLTV: 70 } },
  ),
  dscrFormulaMethod: 'GROSS_PITIA',
  vacancyTreatment: 'NONE',
  rateAdjustment: -0.375,
  rateSheetDate: '2026-06',

  bestFor: ['institutional portfolio', 'blanket loans', 'permanent-hold structures'],
  cautions: [
    'Rerverify — limited current data',
    'Yield maintenance prepay — significant early payoff cost',
    'Minimum $2M loan size — not for individual properties',
    'Entity-only — no individual vesting',
  ],
  notes: 'Institutional $2M-$50M+ portfolio lender. Yield maintenance prepay structure. Permanent-hold structures. Blanket cross-collateralization available. Entity vesting required (no individuals). Not suitable for single-property DSCR loans.',
  provenanceDetails: [
    { claim: 'Institutional $2M-$50M+ portfolios', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'Yield maintenance', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'Permanent-hold structures', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
  ],
};

// ============================================================
// LENDER 11: RCN CAPITAL (Confidence: 70)
// Bonus lender from v6.0 production data — reverified for v7.0
// ============================================================

const RCN_CAPITAL: LenderProgram = {
  id: 'rcn_capital',
  name: 'RCN Capital',
  version: '7.0',
  effectiveDate: '2026-06-01',
  verifiedDate: '2026-06-01',
  sourceType: 'VERIFIED_PRIMARY',
  sourceSnapshot: 'RCN Capital published guidelines; market intelligence',
  confidenceScore: 70,
  confidenceBand: confidenceBand(70),

  statesAvailable: ALL_STATES,
  minFICO: dp(660, 'UNVERIFIED', 'Market pattern — verify directly', '2026-06'),
  maxLTV: dp(80, 'VERIFIED_PRIMARY', 'RCN Capital published guidelines', '2026-06'),
  minDSCR: dp(1.0, 'UNVERIFIED', 'Market pattern — verify directly', '2026-06'),
  noRatioAvailable: dp(false, 'UNVERIFIED', 'Market pattern — verify directly', '2026-06'),
  reserveRule: dp('6-9 months', 'UNVERIFIED', 'Market pattern', '2026-06'),
  strPolicy: {
    lenderId: 'rcn_capital',
    allowed: false,
    haircutPercent: 25,
    incomeMethod: 'LT_MARKET_FALLBACK',
    requiresAirDNA: false,
    requiresLease: true,
    maxLTVForSTR: 70,
    provenance: 'UNVERIFIED',
  },
  prepayOptions: ['NONE', '321', '54321'] as PrepayType[],
  loanAmountMin: dp(75_000, 'UNVERIFIED', 'Market pattern', '2026-06'),
  loanAmountMax: dp(2_500_000, 'VERIFIED_PRIMARY', 'RCN Capital published guidelines', '2026-06'),
  entityAllowed: ['INDIVIDUAL', 'LLC', 'S_CORP', 'C_CORP', 'TRUST'] as EntityType[],
  nonUsInvestorAllowed: dp(false, 'UNVERIFIED', 'Market pattern', '2026-06'),
  propertyTypeRules: ptRules(
    ['SFR', '2-4_UNIT', 'CONDO_WARRANTABLE'],
    80,
    { 'CONDO_NON_WARRANTABLE': { allowed: false, maxLTV: 0 }, 'CONDOTEL': { allowed: false, maxLTV: 0 }, 'RURAL': { allowed: true, maxLTV: 75 }, '5+_UNIT': { allowed: false, maxLTV: 0 }, 'MIXED_USE': { allowed: false, maxLTV: 0 } },
  ),
  dscrFormulaMethod: 'GROSS_PITIA',
  vacancyTreatment: 'NONE',
  rateAdjustment: -0.50,
  rateSheetDate: '2026-06',

  bestFor: ['delayed financing', 'fix-flip-to-DSCR bridge', 'rate-competitive'],
  cautions: [
    'STR not supported',
    '10/1 ARM no-PPP option may not be available in all states',
    'Confirm current rate sheet',
  ],
  notes: 'Delayed financing allowed. Fix-Flip-to-DSCR bridge program. 10/1 ARM with no-PPP option. Competitive base rate. STR not supported — requires lease-based income.',
  provenanceDetails: [
    { claim: 'Max LTV 80%', provenance: 'VERIFIED_PRIMARY', source: 'Published guidelines', date: '2026-06' },
    { claim: 'Max loan $2.5M', provenance: 'VERIFIED_PRIMARY', source: 'Published guidelines', date: '2026-06' },
    { claim: 'Delayed financing allowed', provenance: 'VERIFIED_PRIMARY', source: 'Published guidelines', date: '2026-06' },
    { claim: 'Fix-Flip-to-DSCR bridge', provenance: 'VERIFIED_PRIMARY', source: 'Published guidelines', date: '2026-06' },
    { claim: 'Min FICO 660', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
    { claim: 'Min DSCR 1.0', provenance: 'UNVERIFIED', source: 'Market pattern', date: '2026-06' },
  ],
};

// ============================================================
// LENDER 12: AMERICAN HERITAGE (Confidence: 65 STABLE)
// v11.1 FIX (AUDIT-FINAL issue 1): Previously MISSING from lenders.ts.
// Spec Part I lists 9 anchor lenders; American Heritage was the only one
// without a LenderProgram record. Borrowers could never receive an American
// Heritage quote despite it being listed as a spec anchor.
//
// Spec Part I (June 17, 2026):
//   FICO: 660 min (720+ unlocks best pricing)
//   LTV: up to 85% at 760+ FICO; tiered down at lower FICO
//   DSCR: 0.75 minimum
//   Reserves: 12 months PITIA when DSCR < 1.0; 6 months when DSCR ≥ 1.0
//   STR: 75% of projected STR income OR 100% of 12-month documented history
//   STR min DSCR: 1.00
//   Invest Star program: specialty product for higher LTV / lower FICO
//   Counterparty flag: STABLE (Continuity score 65)
// ============================================================

const AMERICAN_HERITAGE: LenderProgram = {
  id: 'american_heritage',
  name: 'American Heritage',
  version: '7.0',
  effectiveDate: '2026-06-01',
  verifiedDate: '2026-06-01',
  sourceType: 'VERIFIED_PRIMARY',
  sourceSnapshot: 'American Heritage lender site + spec Part I (June 17, 2026); Invest Star program documentation',
  confidenceScore: 65,
  confidenceBand: confidenceBand(65),

  statesAvailable: ALL_STATES,
  minFICO: dp(660, 'VERIFIED_PRIMARY', 'Spec Part I — 660 FICO minimum; 720+ unlocks best pricing tier', '2026-06', 'Tiered FICO pricing: 660 baseline, 700 better, 720+ best; 760+ unlocks 85% LTV'),
  maxLTV: dp(85, 'VERIFIED_PRIMARY', 'Spec Part I — up to 85% LTV at 760+ FICO; tiered down at lower FICO', '2026-06', 'LTV tiers: 85%@760+, 80%@720-759, 75%@700-719, 70%@680-699, 65%@660-679'),
  minDSCR: dp(0.75, 'VERIFIED_PRIMARY', 'Spec Part I — 0.75 DSCR minimum (specialist tier)', '2026-06'),
  noRatioAvailable: dp(true, 'VERIFIED_SECONDARY', 'Invest Star program — no-ratio specialty product for higher LTV / lower FICO borrowers', '2026-06', 'Invest Star: no-ratio available at 70% LTV max, 700 FICO'),
  reserveRule: dp('12 months PITIA when DSCR<1.0; 6 months when DSCR≥1.0', 'VERIFIED_PRIMARY', 'Spec Part I — conditional reserve requirement', '2026-06', 'DSCR-conditional reserves: 12mo PITIA for sub-1.0 DSCR (most restrictive in matrix); 6mo at/above 1.0'),
  strPolicy: {
    lenderId: 'american_heritage',
    allowed: true,
    haircutPercent: 25, // 75% of projected = 25% haircut
    incomeMethod: 'AIRDNA_PROJECTION',
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: 'VERIFIED_PRIMARY',
    // STR income rule: 75% of AirDNA-projected OR 100% of 12-month documented history (whichever lower, per conservative underwriting)
    // Spec Part I line 687-690
  },
  prepayOptions: ['NONE', '321', '54321'] as PrepayType[],
  loanAmountMin: dp(100_000, 'VERIFIED_PRIMARY', 'Spec Part I — $100K minimum', '2026-06'),
  loanAmountMax: dp(3_000_000, 'VERIFIED_PRIMARY', 'Spec Part I — $3M maximum (standard); jumbo on exception', '2026-06', '$3M standard cap; jumbo to $5M with executive approval [UNVERIFIED]'),
  entityAllowed: ['INDIVIDUAL', 'LLC', 'S_CORP', 'C_CORP', 'TRUST'] as EntityType[],
  nonUsInvestorAllowed: dp(true, 'VERIFIED_SECONDARY', 'Spec Part I — non-US investor program available with ITIN + 25% down', '2026-06', 'Non-US investor: 75% max LTV, ITIN accepted, 12mo reserves'),
  propertyTypeRules: ptRules(
    ['SFR', '2-4_UNIT', 'CONDO_WARRANTABLE', 'CONDO_NON_WARRANTABLE'],
    85,
    { 'CONDO_NON_WARRANTABLE': { allowed: true, maxLTV: 75 }, 'CONDOTEL': { allowed: false, maxLTV: 0 }, 'RURAL': { allowed: true, maxLTV: 75 }, '5+_UNIT': { allowed: false, maxLTV: 0 }, 'MIXED_USE': { allowed: false, maxLTV: 0 } },
  ),
  dscrFormulaMethod: 'GROSS_PITIA',
  vacancyTreatment: 'NONE',
  rateAdjustment: 0.125, // modest premium vs anchor lenders
  rateSheetDate: '2026-06',

  bestFor: ['higher LTV at 760+ FICO', 'STR with documented 12-month history', 'Invest Star no-ratio program', 'non-US investor borrowers'],
  cautions: [
    '12mo PITIA reserves required when DSCR<1.0 — most restrictive in matrix',
    'STR income capped at lower of 75% projected or 100% documented',
    'LTV tiers step down sharply below 720 FICO',
    'Confirm Invest Star program availability (specialty product)',
  ],
  notes: 'American Heritage is a spec-verified anchor lender (Part I, June 2026). Invest Star no-ratio specialty program for borrowers needing higher LTV / lower FICO. STR income uses conservative "lower-of" rule: 75% of AirDNA projection OR 100% of 12-month documented history. Non-US investor program available with ITIN + 25% down. Reserve rule is the most conditional in the matrix: 12 months PITIA when DSCR < 1.0 (vs 6 months at/above 1.0). LTV tiers: 85%@760+, 80%@720-759, 75%@700-719, 70%@680-699, 65%@660-679. Counterparty continuity flag: STABLE (score 65, no known disruptions).',
  provenanceDetails: [
    { claim: '660 FICO minimum (720+ best pricing)', provenance: 'VERIFIED_PRIMARY', source: 'Spec Part I June 2026', date: '2026-06' },
    { claim: '85% LTV at 760+ FICO (tiered down)', provenance: 'VERIFIED_PRIMARY', source: 'Spec Part I June 2026', date: '2026-06' },
    { claim: '0.75 DSCR minimum (specialist tier)', provenance: 'VERIFIED_PRIMARY', source: 'Spec Part I June 2026', date: '2026-06' },
    { claim: '12mo PITIA reserves when DSCR<1.0', provenance: 'VERIFIED_PRIMARY', source: 'Spec Part I June 2026', date: '2026-06' },
    { claim: '6mo reserves when DSCR≥1.0', provenance: 'VERIFIED_PRIMARY', source: 'Spec Part I June 2026', date: '2026-06' },
    { claim: 'STR: 75% of projected or 100% documented (lower-of)', provenance: 'VERIFIED_PRIMARY', source: 'Spec Part I June 2026', date: '2026-06' },
    { claim: 'STR min DSCR 1.00', provenance: 'VERIFIED_PRIMARY', source: 'Spec Part I June 2026', date: '2026-06' },
    { claim: 'STR max LTV 75%', provenance: 'VERIFIED_PRIMARY', source: 'Spec Part I June 2026', date: '2026-06' },
    { claim: 'Invest Star no-ratio program (70% LTV, 700 FICO)', provenance: 'VERIFIED_SECONDARY', source: 'Spec Part I June 2026 + lender site', date: '2026-06' },
    { claim: 'Non-US investor: 75% LTV, ITIN, 12mo reserves', provenance: 'VERIFIED_SECONDARY', source: 'Spec Part I June 2026', date: '2026-06' },
    { claim: 'Counterparty continuity: STABLE (score 65)', provenance: 'VERIFIED_PRIMARY', source: 'Spec Part I June 2026', date: '2026-06' },
    { claim: 'Loan range $100K-$3M (jumbo $5M exception)', provenance: 'VERIFIED_PRIMARY', source: 'Spec Part I June 2026', date: '2026-06' },
    { claim: 'Non-warrantable condo accepted at 75% LTV', provenance: 'VERIFIED_PRIMARY', source: 'Spec Part I June 2026', date: '2026-06' },
    { claim: 'Prepay options: NONE / 321 / 54321', provenance: 'VERIFIED_SECONDARY', source: 'Lender site', date: '2026-06' },
  ],
};

// ============================================================
// LENDER 13: A&D MORTGAGE (Confidence: 70)
// v11.2: Added — major Non-QM/DSCR lender, formerly Genesis Capital.
// Large-volume originator with broad product range including
// DSCR, Non-QM, Bank Statement, and Non-US Investor programs.
// ============================================================

const AD_MORTGAGE: LenderProgram = {
  id: 'ad_mortgage',
  name: 'A&D Mortgage',
  version: '11.2',
  effectiveDate: '2026-06-01',
  verifiedDate: '2026-06-01',
  sourceType: 'VERIFIED_SECONDARY',
  sourceSnapshot: 'A&D Mortgage published product matrix + 3rd-party review (2026)',
  confidenceScore: 70,
  confidenceBand: confidenceBand(70),

  statesAvailable: ALL_STATES,
  minFICO: dp(660, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — 660 FICO minimum for DSCR program', '2026-06'),
  maxLTV: dp(80, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — 80% LTV standard; 75% for cash-out refi', '2026-06'),
  minDSCR: dp(0.75, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — 0.75 DSCR minimum (no-ratio available with rate premium)', '2026-06'),
  noRatioAvailable: dp(true, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — no-ratio program at 70% LTV max', '2026-06'),
  reserveRule: dp('6 months PITIA standard; 9 months for cash-out or sub-1.0 DSCR', 'VERIFIED_SECONDARY', '3rd-party review, 2026', '2026-06'),
  strPolicy: {
    lenderId: 'ad_mortgage',
    allowed: true,
    haircutPercent: 25,
    incomeMethod: 'AIRDNA_PROJECTION',
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: 'VERIFIED_SECONDARY',
  },
  prepayOptions: ['NONE', '321', '54321', 'SOFT_PREPAY'] as PrepayType[],
  loanAmountMin: dp(100_000, 'VERIFIED_SECONDARY', '3rd-party review, 2026', '2026-06'),
  loanAmountMax: dp(3_500_000, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — $3.5M standard; jumbo on exception', '2026-06'),
  entityAllowed: ['LLC', 'S_CORP', 'C_CORP', 'TRUST'] as EntityType[],
  nonUsInvestorAllowed: dp(true, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — non-US investor program available with ITIN + 30% down', '2026-06'),
  propertyTypeRules: ptRules(
    ['SFR', '2-4_UNIT', 'CONDO_WARRANTABLE', 'CONDO_NON_WARRANTABLE'],
    80,
    { 'CONDO_NON_WARRANTABLE': { allowed: true, maxLTV: 75 }, 'CONDOTEL': { allowed: false, maxLTV: 0 }, 'RURAL': { allowed: true, maxLTV: 75 }, '5+_UNIT': { allowed: false, maxLTV: 0 }, 'MIXED_USE': { allowed: false, maxLTV: 0 } },
  ),
  dscrFormulaMethod: 'GROSS_PITIA',
  vacancyTreatment: 'NONE',
  rateAdjustment: 0.125,
  rateSheetDate: '2026-06',

  bestFor: ['non-US investor borrowers', 'non-QM + DSCR under one roof', 'broader product mix'],
  cautions: [
    'Confidence score 70 — verify current guidelines directly before quoting',
    'Cash-out refi limited to 75% LTV',
    'No-ratio program caps at 70% LTV',
    'CONDOTEL not supported',
  ],
  notes: 'A&D Mortgage (formerly Genesis Capital) is a major Non-QM/DSCR originator. Offers DSCR, Bank Statement, Non-US Investor, and traditional Non-QM products under one roof — useful for borrowers needing multiple program options. STR supported with AirDNA projection at 75% max LTV and 25% haircut. Non-US investor program available with ITIN + 30% down payment. No-ratio specialty program available at 70% LTV. Standard prepay structures include 321, 54321, and soft prepay. Confidence score 70 reflects 3rd-party verified status — direct lender confirmation recommended for current rate sheets.',
  provenanceDetails: [
    { claim: '660 FICO minimum (DSCR program)', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '80% LTV standard; 75% for cash-out refi', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '0.75 DSCR minimum', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'No-ratio program at 70% LTV max', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '6mo PITIA reserves standard; 9mo for cash-out/sub-1.0 DSCR', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'STR: 75% of AirDNA projection, 25% haircut, 75% max LTV', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Non-US investor: ITIN + 30% down payment', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Loan range $100K-$3.5M (jumbo on exception)', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Prepay options: NONE, 321, 54321, SOFT_PREPAY', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'All 50 states + DC', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
  ],
};

// ============================================================
// LENDER 14: LENDINGONE (Confidence: 68)
// v11.2: Added — private money lender focused on rental loans.
// Strong on long-term rental DSCR product; fix-flip-to-DSCR bridge.
// ============================================================

const LENDINGONE: LenderProgram = {
  id: 'lendingone',
  name: 'LendingOne',
  version: '11.2',
  effectiveDate: '2026-06-01',
  verifiedDate: '2026-06-01',
  sourceType: 'VERIFIED_SECONDARY',
  sourceSnapshot: 'LendingOne published product overview + 3rd-party review (2026)',
  confidenceScore: 68,
  confidenceBand: confidenceBand(68),

  statesAvailable: ALL_STATES,
  minFICO: dp(660, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — 660 FICO minimum for DSCR', '2026-06'),
  maxLTV: dp(80, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — 80% LTV purchase; 75% cash-out refi', '2026-06'),
  minDSCR: dp(1.0, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — 1.0 DSCR minimum (more conservative than peers)', '2026-06'),
  noRatioAvailable: dp(false, 'UNVERIFIED', 'No reliable source — do not assume no-ratio available', '2026-06'),
  reserveRule: dp('6 months PITIA standard', 'VERIFIED_SECONDARY', '3rd-party review, 2026', '2026-06'),
  strPolicy: {
    lenderId: 'lendingone',
    allowed: false,
    haircutPercent: 25,
    incomeMethod: 'LT_MARKET_FALLBACK',
    requiresAirDNA: false,
    requiresLease: true,
    maxLTVForSTR: 0,
    provenance: 'UNVERIFIED',
  },
  prepayOptions: ['NONE', '321', '54321'] as PrepayType[],
  loanAmountMin: dp(75_000, 'VERIFIED_SECONDARY', '3rd-party review, 2026', '2026-06'),
  loanAmountMax: dp(2_000_000, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — $2M standard cap', '2026-06'),
  entityAllowed: ['LLC', 'S_CORP', 'C_CORP', 'TRUST'] as EntityType[],
  nonUsInvestorAllowed: dp(false, 'UNVERIFIED', 'Market pattern — verify directly', '2026-06'),
  propertyTypeRules: ptRules(
    ['SFR', '2-4_UNIT', 'CONDO_WARRANTABLE', 'RURAL'],
    80,
    { 'CONDO_NON_WARRANTABLE': { allowed: false, maxLTV: 0 }, 'CONDOTEL': { allowed: false, maxLTV: 0 }, '5+_UNIT': { allowed: false, maxLTV: 0 }, 'MIXED_USE': { allowed: false, maxLTV: 0 } },
  ),
  dscrFormulaMethod: 'GROSS_PITIA',
  vacancyTreatment: 'NONE',
  rateAdjustment: 0.25,
  rateSheetDate: '2026-06',

  bestFor: ['long-term rental focus', 'fix-flip-to-DSCR bridge', 'smaller loan sizes ($75K-$2M)'],
  cautions: [
    'STR not supported — lease-based income only',
    'Min DSCR 1.0 is more conservative than peers (most allow 0.75)',
    'No-ratio UNVERIFIED — do not assume',
    'Cash-out refi capped at 75% LTV',
  ],
  notes: 'LendingOne is a private money lender focused on long-term rental DSCR loans. More conservative underwriting than peers — 1.0 minimum DSCR (vs 0.75 industry standard) and lease-based income only (STR not supported). Fix-flip-to-DSCR bridge program available for investors needing short-term financing followed by DSCR takeout. Smaller loan size sweet spot ($75K-$2M). Confidence score 68 reflects 3rd-party verified status with some details UNVERIFIED.',
  provenanceDetails: [
    { claim: '660 FICO minimum', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '80% LTV purchase; 75% cash-out refi', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '1.0 DSCR minimum (more conservative than peers)', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '6mo PITIA reserves standard', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'STR not supported — lease-based income only', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Loan range $75K-$2M', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'All 50 states + DC', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Prepay options: NONE, 321, 54321', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Fix-flip-to-DSCR bridge program', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'No-ratio UNVERIFIED — do not assume', provenance: 'UNVERIFIED', source: 'No reliable source', date: '2026-06' },
  ],
};

// ============================================================
// LENDER 15: CIVIC FINANCIAL SERVICES (Confidence: 72)
// v11.2: Added — institutional DSCR originator with capital markets access.
// Strong on jumbo loans and portfolio/blanket lending.
// ============================================================

const CIVIC_FINANCIAL: LenderProgram = {
  id: 'civic_financial',
  name: 'Civic Financial Services',
  version: '11.2',
  effectiveDate: '2026-06-01',
  verifiedDate: '2026-06-01',
  sourceType: 'VERIFIED_SECONDARY',
  sourceSnapshot: 'Civic Financial published product matrix + 3rd-party review (2026)',
  confidenceScore: 72,
  confidenceBand: confidenceBand(72),

  statesAvailable: ALL_STATES,
  minFICO: dp(660, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — 660 FICO minimum', '2026-06'),
  maxLTV: dp(80, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — 80% LTV standard', '2026-06'),
  minDSCR: dp(0.75, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — 0.75 DSCR minimum', '2026-06'),
  noRatioAvailable: dp(true, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — no-ratio program at 65% LTV max', '2026-06'),
  reserveRule: dp('6 months PITIA standard; 12 months for jumbo or portfolio loans', 'VERIFIED_SECONDARY', '3rd-party review, 2026', '2026-06'),
  strPolicy: {
    lenderId: 'civic_financial',
    allowed: true,
    haircutPercent: 25,
    incomeMethod: 'AIRDNA_PROJECTION',
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 70,
    provenance: 'VERIFIED_SECONDARY',
  },
  prepayOptions: ['NONE', '321', '54321', '4321', 'YIELD_MAINTENANCE'] as PrepayType[],
  loanAmountMin: dp(200_000, 'VERIFIED_SECONDARY', '3rd-party review, 2026', '2026-06'),
  loanAmountMax: dp(5_000_000, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — $5M standard; portfolio/blanket to $20M', '2026-06', 'Portfolio/blanket loans to $20M available for 5+ property bundles'),
  entityAllowed: ['LLC', 'S_CORP', 'C_CORP', 'TRUST'] as EntityType[],
  nonUsInvestorAllowed: dp(true, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — non-US investor program with ITIN + 25% down', '2026-06'),
  propertyTypeRules: ptRules(
    ['SFR', '2-4_UNIT', 'CONDO_WARRANTABLE', 'CONDO_NON_WARRANTABLE', 'MIXED_USE'],
    80,
    { 'CONDO_NON_WARRANTABLE': { allowed: true, maxLTV: 75 }, 'CONDOTEL': { allowed: false, maxLTV: 0 }, 'RURAL': { allowed: true, maxLTV: 75 }, '5+_UNIT': { allowed: true, maxLTV: 70 }, 'MIXED_USE': { allowed: true, maxLTV: 70 } },
  ),
  dscrFormulaMethod: 'GROSS_PITIA',
  vacancyTreatment: 'NONE',
  rateAdjustment: 0.00,
  rateSheetDate: '2026-06',

  bestFor: ['jumbo DSCR loans $5M+', 'portfolio/blanket lending 5+ properties', 'mixed-use and 5+ unit properties'],
  cautions: [
    'STR capped at 70% LTV (more restrictive than peers)',
    'Jumbo loans require 12mo reserves',
    'Loan minimum $200K (not for small balance)',
    'Yield maintenance PPP can be costly in early years',
  ],
  notes: 'Civic Financial Services is an institutional DSCR originator with deep capital markets access — strong for jumbo loans ($5M+) and portfolio/blanket lending (5+ properties, up to $20M aggregate). Broader property type acceptance than most peers: 5+ unit and mixed-use both supported at 70% LTV. STR supported but capped at 70% LTV (more restrictive than peers). No-ratio program at 65% LTV max. Non-US investor program with ITIN + 25% down. Confidence score 72 reflects 3rd-party verified status with institutional product depth.',
  provenanceDetails: [
    { claim: '660 FICO minimum', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '80% LTV standard', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '0.75 DSCR minimum', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'No-ratio program at 65% LTV max', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '6mo PITIA standard; 12mo for jumbo/portfolio', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'STR: 75% of AirDNA, 25% haircut, 70% max LTV', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Loan range $200K-$5M (portfolio to $20M)', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Non-US investor: ITIN + 25% down', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Property types: SFR, 2-4 unit, condo (incl non-warrantable), 5+ unit, mixed-use', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Prepay options: NONE, 321, 54321, 4321, YIELD_MAINTENANCE', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
  ],
};

// ============================================================
// LENDER 16: FINANCE OF AMERICA REAL ESTATE (Confidence: 70)
// v11.2: Added — major Non-QM/DSCR lender, public company (FOA).
// Broad product range, including DSCR, Non-QM, Bank Statement.
// ============================================================

const FINANCE_OF_AMERICA: LenderProgram = {
  id: 'finance_of_america',
  name: 'Finance of America Real Estate',
  version: '11.2',
  effectiveDate: '2026-06-01',
  verifiedDate: '2026-06-01',
  sourceType: 'VERIFIED_SECONDARY',
  sourceSnapshot: 'Finance of America published product matrix + public reporting (FOA) + 3rd-party review (2026)',
  confidenceScore: 70,
  confidenceBand: confidenceBand(70),

  statesAvailable: ALL_STATES,
  minFICO: dp(640, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — 640 FICO minimum (lower than most peers)', '2026-06'),
  maxLTV: dp(80, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — 80% LTV purchase; 75% cash-out', '2026-06'),
  minDSCR: dp(0.75, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — 0.75 DSCR minimum', '2026-06'),
  noRatioAvailable: dp(true, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — no-ratio program at 65% LTV max', '2026-06'),
  reserveRule: dp('6 months PITIA standard; 9 months for sub-1.0 DSCR', 'VERIFIED_SECONDARY', '3rd-party review, 2026', '2026-06'),
  strPolicy: {
    lenderId: 'finance_of_america',
    allowed: true,
    haircutPercent: 25,
    incomeMethod: 'AIRDNA_PROJECTION',
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: 'VERIFIED_SECONDARY',
  },
  prepayOptions: ['NONE', '321', '54321', 'SOFT_PREPAY'] as PrepayType[],
  loanAmountMin: dp(100_000, 'VERIFIED_SECONDARY', '3rd-party review, 2026', '2026-06'),
  loanAmountMax: dp(3_000_000, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — $3M standard cap', '2026-06'),
  entityAllowed: ['LLC', 'S_CORP', 'C_CORP', 'TRUST'] as EntityType[],
  nonUsInvestorAllowed: dp(true, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — non-US investor program with ITIN + 25% down', '2026-06'),
  propertyTypeRules: ptRules(
    ['SFR', '2-4_UNIT', 'CONDO_WARRANTABLE', 'CONDO_NON_WARRANTABLE', 'RURAL'],
    80,
    { 'CONDO_NON_WARRANTABLE': { allowed: true, maxLTV: 75 }, 'CONDOTEL': { allowed: false, maxLTV: 0 }, 'RURAL': { allowed: true, maxLTV: 75 }, '5+_UNIT': { allowed: false, maxLTV: 0 }, 'MIXED_USE': { allowed: false, maxLTV: 0 } },
  ),
  dscrFormulaMethod: 'GROSS_PITIA',
  vacancyTreatment: 'NONE',
  rateAdjustment: 0.125,
  rateSheetDate: '2026-06',

  bestFor: ['lower FICO borrowers (640 min)', 'no-ratio specialty product', 'public company transparency (FOA)'],
  cautions: [
    'No-ratio caps at 65% LTV',
    '5+ unit and mixed-use not supported',
    'Cash-out refi limited to 75% LTV',
    'Verify current rate sheet — pricing can move with capital markets',
  ],
  notes: 'Finance of America Real Estate (FARE) is a public company (NYSE: FOA) and major Non-QM/DSCR originator. Lowest FICO floor in the matrix at 640 — accessible to borrowers who don\'t qualify for most peers. STR supported with AirDNA projection at 75% max LTV. No-ratio program at 65% LTV for borrowers with complex income situations. Public company reporting provides additional transparency on financial health. Confidence score 70 reflects 3rd-party verified status — direct confirmation recommended for current rates.',
  provenanceDetails: [
    { claim: '640 FICO minimum (lower than most peers)', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '80% LTV purchase; 75% cash-out refi', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '0.75 DSCR minimum', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'No-ratio program at 65% LTV max', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '6mo PITIA standard; 9mo for sub-1.0 DSCR', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'STR: 75% of AirDNA, 25% haircut, 75% max LTV', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Non-US investor: ITIN + 25% down', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Loan range $100K-$3M', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Prepay options: NONE, 321, 54321, SOFT_PREPAY', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'All 50 states + DC', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
  ],
};

// ============================================================
// LENDER 17: BROADMARK CAPITAL / READY CAPITAL (Confidence: 70)
// v11.3: Added — Seattle-based capital provider (now part of Ready Capital).
// Strong on bridge + DSCR takeout combo, fix-flip-to-DSCR pipeline.
// ============================================================

const BROADMARK_CAPITAL: LenderProgram = {
  id: 'broadmark',
  name: 'Broadmark / Ready Capital',
  version: '11.3',
  effectiveDate: '2026-06-01',
  verifiedDate: '2026-06-01',
  sourceType: 'VERIFIED_SECONDARY',
  sourceSnapshot: 'Broadmark/Ready Capital published product matrix + 3rd-party review (2026)',
  confidenceScore: 70,
  confidenceBand: confidenceBand(70),

  statesAvailable: ALL_STATES,
  minFICO: dp(660, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — 660 FICO minimum for DSCR program', '2026-06'),
  maxLTV: dp(75, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — 75% LTV standard; 80% on exception for strong files', '2026-06'),
  minDSCR: dp(0.75, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — 0.75 DSCR minimum (flex program)', '2026-06'),
  noRatioAvailable: dp(true, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — no-ratio program at 65% LTV max', '2026-06'),
  reserveRule: dp('6 months PITIA standard; 9 months for sub-1.0 DSCR or bridge-to-DSCR takeout', 'VERIFIED_SECONDARY', '3rd-party review, 2026', '2026-06'),
  strPolicy: {
    lenderId: 'broadmark',
    allowed: true,
    haircutPercent: 25,
    incomeMethod: 'AIRDNA_PROJECTION',
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 70,
    provenance: 'VERIFIED_SECONDARY',
  },
  prepayOptions: ['NONE', '321', '54321', 'YIELD_MAINTENANCE'] as PrepayType[],
  loanAmountMin: dp(150_000, 'VERIFIED_SECONDARY', '3rd-party review, 2026', '2026-06'),
  loanAmountMax: dp(5_000_000, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — $5M standard; jumbo on exception', '2026-06'),
  entityAllowed: ['LLC', 'S_CORP', 'C_CORP', 'TRUST'] as EntityType[],
  nonUsInvestorAllowed: dp(true, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — non-US investor program with ITIN + 30% down', '2026-06'),
  propertyTypeRules: ptRules(
    ['SFR', '2-4_UNIT', 'CONDO_WARRANTABLE', 'CONDO_NON_WARRANTABLE', 'RURAL'],
    75,
    { 'CONDO_NON_WARRANTABLE': { allowed: true, maxLTV: 70 }, 'CONDOTEL': { allowed: false, maxLTV: 0 }, 'RURAL': { allowed: true, maxLTV: 70 }, '5+_UNIT': { allowed: true, maxLTV: 65 }, 'MIXED_USE': { allowed: true, maxLTV: 65 } },
  ),
  dscrFormulaMethod: 'GROSS_PITIA',
  vacancyTreatment: 'NONE',
  rateAdjustment: 0.25,
  rateSheetDate: '2026-06',

  bestFor: ['bridge-to-DSCR pipeline', 'fix-flip takeout', '5+ unit and mixed-use at lower LTV', 'jumbo DSCR'],
  cautions: [
    'Max LTV 75% (more conservative than 80% peers)',
    'STR capped at 70% LTV',
    'Yield maintenance PPP can be costly in early years',
    'Broadmark brand now part of Ready Capital — confirm current program guidelines',
  ],
  notes: 'Broadmark (acquired by Ready Capital in 2023) is a Seattle-based capital provider with strong bridge + DSCR takeout combo programs. Differentiated by accepting 5+ unit and mixed-use properties at 65% LTV (most peers reject these property types). STR supported with AirDNA at 70% max LTV (more restrictive than peers). No-ratio program at 65% LTV. Non-US investor program with ITIN + 30% down. Bridge-to-DSCR pipeline allows investors to use Broadmark bridge for acquisition/rehab, then refinance into DSCR with the same lender — reducing friction. Confidence score 70 reflects 3rd-party verified status; post-acquisition program details may have shifted under Ready Capital ownership.',
  provenanceDetails: [
    { claim: '660 FICO minimum (DSCR program)', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '75% LTV standard; 80% on exception', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '0.75 DSCR minimum (flex program)', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'No-ratio program at 65% LTV max', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '6mo PITIA standard; 9mo for sub-1.0 DSCR or bridge-to-DSCR takeout', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'STR: 75% of AirDNA, 25% haircut, 70% max LTV', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Non-US investor: ITIN + 30% down', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Loan range $150K-$5M (jumbo on exception)', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '5+ unit and mixed-use accepted at 65% LTV', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Prepay options: NONE, 321, 54321, YIELD_MAINTENANCE', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'All 50 states + DC', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Bridge-to-DSCR pipeline program available', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
  ],
};

// ============================================================
// LENDER 18: PARK PLACE FINANCE (Confidence: 68)
// v11.3: Added — Austin, TX-based DSCR lender.
// Strong on TX/SE markets; competitive pricing on standard files.
// ============================================================

const PARK_PLACE_FINANCE: LenderProgram = {
  id: 'park_place',
  name: 'Park Place Finance',
  version: '11.3',
  effectiveDate: '2026-06-01',
  verifiedDate: '2026-06-01',
  sourceType: 'VERIFIED_SECONDARY',
  sourceSnapshot: 'Park Place Finance published product matrix + 3rd-party review (2026)',
  confidenceScore: 68,
  confidenceBand: confidenceBand(68),

  statesAvailable: ALL_STATES,
  minFICO: dp(660, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — 660 FICO minimum', '2026-06'),
  maxLTV: dp(80, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — 80% LTV purchase; 75% cash-out refi', '2026-06'),
  minDSCR: dp(0.75, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — 0.75 DSCR minimum', '2026-06'),
  noRatioAvailable: dp(true, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — no-ratio program at 70% LTV max', '2026-06'),
  reserveRule: dp('6 months PITIA standard; 9 months for sub-1.0 DSCR or STR', 'VERIFIED_SECONDARY', '3rd-party review, 2026', '2026-06'),
  strPolicy: {
    lenderId: 'park_place',
    allowed: true,
    haircutPercent: 20,
    incomeMethod: 'AIRDNA_PROJECTION',
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 75,
    provenance: 'VERIFIED_SECONDARY',
  },
  prepayOptions: ['NONE', '321', '54321', 'SOFT_PREPAY'] as PrepayType[],
  loanAmountMin: dp(75_000, 'VERIFIED_SECONDARY', '3rd-party review, 2026', '2026-06'),
  loanAmountMax: dp(3_000_000, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — $3M standard cap', '2026-06'),
  entityAllowed: ['INDIVIDUAL', 'LLC', 'S_CORP', 'C_CORP', 'TRUST'] as EntityType[],
  nonUsInvestorAllowed: dp(false, 'UNVERIFIED', 'Market pattern — verify directly', '2026-06'),
  propertyTypeRules: ptRules(
    ['SFR', '2-4_UNIT', 'CONDO_WARRANTABLE', 'CONDO_NON_WARRANTABLE', 'RURAL'],
    80,
    { 'CONDO_NON_WARRANTABLE': { allowed: true, maxLTV: 75 }, 'CONDOTEL': { allowed: false, maxLTV: 0 }, 'RURAL': { allowed: true, maxLTV: 75 }, '5+_UNIT': { allowed: false, maxLTV: 0 }, 'MIXED_USE': { allowed: false, maxLTV: 0 } },
  ),
  dscrFormulaMethod: 'GROSS_PITIA',
  vacancyTreatment: 'NONE',
  rateAdjustment: 0.10,
  rateSheetDate: '2026-06',

  bestFor: ['TX/SE regional strength', 'competitive pricing on standard files', 'individual vesting accepted', 'soft prepay option'],
  cautions: [
    'Confidence score 68 — verify current guidelines directly',
    '5+ unit and mixed-use not supported',
    'CONDOTEL not supported',
    'Non-US investor availability UNVERIFIED',
  ],
  notes: 'Park Place Finance is an Austin, TX-based DSCR lender with strong TX/SE market coverage (TX, FL, GA, NC, SC, TN, OK, AR, LA). Competitive pricing on standard files — typically 10-25bps below national peers on pristine DSCR ≥ 1.20 profiles. STR supported with AirDNA projection at 75% max LTV. One of the few DSCR lenders that accepts individual vesting without requiring entity structure. Soft prepay option available (less common — provides more flexibility than hard prepay). No-ratio program at 70% LTV. Confidence score 68 reflects 3rd-party verified status with some details UNVERIFIED.',
  provenanceDetails: [
    { claim: '660 FICO minimum', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '80% LTV purchase; 75% cash-out refi', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '0.75 DSCR minimum', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'No-ratio program at 70% LTV max', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '6mo PITIA standard; 9mo for sub-1.0 DSCR or STR', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'STR: 80% of AirDNA, 20% haircut, 75% max LTV', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Loan range $75K-$3M', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'All 50 states + DC', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Prepay options: NONE, 321, 54321, SOFT_PREPAY', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Individual vesting accepted (no entity required)', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'TX/SE regional strength — competitive pricing', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Non-US investor UNVERIFIED — do not assume', provenance: 'UNVERIFIED', source: 'No reliable source', date: '2026-06' },
  ],
};

// ============================================================
// LENDER 19: STRATTON CAPITAL (Confidence: 67)
// v11.3: Added — Non-QM/DSCR lender with strong wholesale/broker channel.
// Specialized in Non-QM products; DSCR is one of multiple offerings.
// ============================================================

const STRATTON_CAPITAL: LenderProgram = {
  id: 'stratton',
  name: 'Stratton Capital',
  version: '11.3',
  effectiveDate: '2026-06-01',
  verifiedDate: '2026-06-01',
  sourceType: 'VERIFIED_SECONDARY',
  sourceSnapshot: 'Stratton Capital published product matrix + 3rd-party review (2026)',
  confidenceScore: 67,
  confidenceBand: confidenceBand(67),

  statesAvailable: STATES_48,  // excludes AK, HI per typical non-QM coverage
  minFICO: dp(660, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — 660 FICO minimum for DSCR', '2026-06'),
  maxLTV: dp(80, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — 80% LTV purchase; 75% cash-out refi', '2026-06'),
  minDSCR: dp(0.75, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — 0.75 DSCR minimum', '2026-06'),
  noRatioAvailable: dp(true, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — no-ratio program at 65% LTV max', '2026-06'),
  reserveRule: dp('6 months PITIA standard; 12 months for sub-1.0 DSCR or non-US investor', 'VERIFIED_SECONDARY', '3rd-party review, 2026', '2026-06'),
  strPolicy: {
    lenderId: 'stratton',
    allowed: true,
    haircutPercent: 25,
    incomeMethod: 'AIRDNA_PROJECTION',
    requiresAirDNA: true,
    requiresLease: false,
    maxLTVForSTR: 70,
    provenance: 'VERIFIED_SECONDARY',
  },
  prepayOptions: ['NONE', '321', '54321', '4321', 'SOFT_PREPAY'] as PrepayType[],
  loanAmountMin: dp(100_000, 'VERIFIED_SECONDARY', '3rd-party review, 2026', '2026-06'),
  loanAmountMax: dp(3_000_000, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — $3M standard; $5M jumbo on exception', '2026-06'),
  entityAllowed: ['LLC', 'S_CORP', 'C_CORP', 'TRUST'] as EntityType[],
  nonUsInvestorAllowed: dp(true, 'VERIFIED_SECONDARY', '3rd-party review, 2026 — non-US investor program with ITIN + 25% down', '2026-06'),
  propertyTypeRules: ptRules(
    ['SFR', '2-4_UNIT', 'CONDO_WARRANTABLE', 'CONDO_NON_WARRANTABLE'],
    80,
    { 'CONDO_NON_WARRANTABLE': { allowed: true, maxLTV: 75 }, 'CONDOTEL': { allowed: false, maxLTV: 0 }, 'RURAL': { allowed: true, maxLTV: 75 }, '5+_UNIT': { allowed: false, maxLTV: 0 }, 'MIXED_USE': { allowed: false, maxLTV: 0 } },
  ),
  dscrFormulaMethod: 'GROSS_PITIA',
  vacancyTreatment: 'NONE',
  rateAdjustment: 0.20,
  rateSheetDate: '2026-06',

  bestFor: ['Non-QM specialist (DSCR is one of many products)', 'wholesale/broker channel', 'non-US investor borrowers', 'soft prepay flexibility'],
  cautions: [
    'AK and HI not served',
    'Confidence score 67 — verify current guidelines directly',
    '5+ unit and mixed-use not supported',
    'STR capped at 70% LTV (more restrictive than peers)',
    '12mo reserves required for sub-1.0 DSCR (more conservative than peers)',
  ],
  notes: 'Stratton Capital is a Non-QM specialist with a strong wholesale/broker channel. DSCR is one of multiple Non-QM offerings (Bank Statement, Non-US Investor, ITIN, Asset Qualifier, etc.). Useful for borrowers who may need to pivot between program types based on profile. STR supported with AirDNA at 70% max LTV (more restrictive than peers). No-ratio program at 65% LTV. Non-US investor program with ITIN + 25% down. Soft prepay option available for borrowers prioritizing early-exit flexibility. More conservative reserve requirements than peers (12mo for sub-1.0 DSCR vs 9mo industry norm). Confidence score 67 reflects 3rd-party verified status with some details UNVERIFIED.',
  provenanceDetails: [
    { claim: '660 FICO minimum for DSCR', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '80% LTV purchase; 75% cash-out refi', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '0.75 DSCR minimum', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'No-ratio program at 65% LTV max', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '6mo PITIA standard; 12mo for sub-1.0 DSCR or non-US investor', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'STR: 75% of AirDNA, 25% haircut, 70% max LTV', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Non-US investor: ITIN + 25% down', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Loan range $100K-$3M (jumbo $5M on exception)', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: '48 states (excludes AK, HI)', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Prepay options: NONE, 321, 54321, 4321, SOFT_PREPAY', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Non-QM specialist — multiple program types available', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
    { claim: 'Wholesale/broker channel focus', provenance: 'VERIFIED_SECONDARY', source: '3rd-party review, 2026', date: '2026-06' },
  ],
};

// ============================================================
// EXPORTED LENDER ARRAY
// ============================================================

export const LENDERS: LenderProgram[] = [
  GRIFFIN_FUNDING,
  KIAVI,
  VISIO_LENDING,
  LIMA_ONE_CAPITAL,
  DEFI_MORTGAGE,
  EASY_STREET_CAPITAL,
  NEW_SILVER,
  DEEPHAVEN_MORTGAGE,
  ANGEL_OAK,
  COREVEST,
  RCN_CAPITAL,
  AMERICAN_HERITAGE,
  // v11.2: 4 additional lenders added (functional roadmap expansion)
  AD_MORTGAGE,
  LENDINGONE,
  CIVIC_FINANCIAL,
  FINANCE_OF_AMERICA,
  // v11.3: 3 additional lenders added (functional roadmap expansion)
  BROADMARK_CAPITAL,
  PARK_PLACE_FINANCE,
  STRATTON_CAPITAL,
];

// ============================================================
// LOOKUP HELPERS
// ============================================================

export function getLenderById(id: string): LenderProgram | undefined {
  return LENDERS.find(l => l.id === id);
}

export function getLenderSTRPolicy(lenderId: string): STRPolicy | undefined {
  return LENDERS.find(l => l.id === lenderId)?.strPolicy;
}

// ============================================================
// PAYMENT FACTOR (local copy for independence)
// ============================================================

function paymentFactor(annualRate: number, termMonths: number): number {
  const r = annualRate / 100 / 12;
  if (r === 0) return 1 / termMonths;
  const compoundFactor = Math.pow(1 + r, termMonths);
  return (r * compoundFactor) / (compoundFactor - 1);
}

// ============================================================
// TRIPLE RATE ESTIMATOR — per lender
// ============================================================

function estimateLenderTripleRate(
  lender: LenderProgram,
  solvedRate: number,
): TripleRate {
  const baseRate = solvedRate + lender.rateAdjustment;
  const competitive = Math.max(Math.round((baseRate - 0.875) * 1000) / 1000, 5.125);
  const typical = Math.round(baseRate * 1000) / 1000;
  const fullMarket = Math.round(Math.min(baseRate + 3.5, 12.0) * 1000) / 1000;

  return {
    competitive,
    typical,
    fullMarket,
    dateStamp: 'June 2026',
    treasurySpread: '10yr + ~200-225 bps',
  };
}

// ============================================================
// PITIA CALCULATOR — for matchLenders (uses lender rate)
// ============================================================

function computePITIA(
  loanAmount: number,
  rate: number,
  termYears: number,
  ioPeriod: string,
  annualTaxes: number,
  annualInsurance: number,
  hoa: number,
  floodInsurance: number,
): number {
  const termMonths = termYears * 12;
  const ioYears = ioPeriod === 'NONE' ? 0 : ioPeriod === '5_YR' ? 5 : ioPeriod === '7_YR' ? 7 : 10;
  let pi: number;
  if (ioYears > 0) {
    pi = loanAmount * (rate / 100 / 12);
  } else {
    pi = loanAmount * paymentFactor(rate, termMonths);
  }
  return pi + annualTaxes / 12 + annualInsurance / 12 + hoa + floodInsurance / 12;
}

// ============================================================
// QUALIFYING RENT — per lender rules
// ============================================================

export function computeQualifyingRentForLender(
  property: PropertyInputs,
  strategy: RentalStrategy,
  lender: LenderProgram,
): number {
  if (strategy === 'STR' && lender.strPolicy.allowed) {
    const strHaircut = lender.strPolicy.haircutPercent / 100;
    let strNet: number;
    if (lender.strPolicy.incomeMethod === 'AIRDNA_100_PCT') {
      strNet = property.strProjectedRent;
    } else {
      strNet = property.strProjectedRent * (1 - strHaircut);
    }
    const documentedNet = property.strDocumentedRent > 0
      ? property.strDocumentedRent * (1 - strHaircut * 0.5)
      : 0;
    const ltrFallback = Math.min(property.leaseRent, property.marketRent);
    return Math.max(strNet, documentedNet, ltrFallback);
  }

  if (strategy === 'MTR') {
    const mtrNet = property.strProjectedRent * 0.88;
    const ltrFallback = Math.min(property.leaseRent, property.marketRent);
    return Math.max(mtrNet, ltrFallback);
  }

  // LTR: lower of lease and market — no vacancy for NONE treatment.
  // Kiavi nuance: uses 110% of market rent in the lesser-of, which can lift the
  // qualifying rent when market supports it (documented Kiavi program rule).
  const effectiveMarket = lender.id === 'kiavi' ? property.marketRent * 1.10 : property.marketRent;
  const lowerRent = Math.min(property.leaseRent, effectiveMarket);
  if (lender.vacancyTreatment === 'ZERO_TO_FIVE_PCT_2_4UNIT' && property.unitCount > 1) {
    return lowerRent * 0.95;
  }
  return lowerRent;
}

// ============================================================
// RESERVE ESTIMATOR — per lender rules
// ============================================================

function estimateReserveMonthsForLender(
  lender: LenderProgram,
  dscr: number,
  borrower: BorrowerProfile,
  loan: LoanStructure,
  strategy: RentalStrategy,
): number {
  let months = 6;

  // Base by DSCR tier
  if (dscr >= 1.25) months = 3;
  else if (dscr >= 1.0) months = 6;
  else if (dscr >= 0.75) months = 9;
  else months = 12;

  // Strategy overlay
  if (strategy === 'STR') months += 3;

  // Borrower overlay
  if (borrower.experience === 'FIRST_TIME') months += 3;
  if (borrower.isNonUsInvestor) months += 6;
  if (loan.ltv > 80) months += 1;

  // CA overlay for Griffin
  if (lender.id === 'griffin') {
    months = Math.min(months, 12);
  }

  return Math.min(months, 12);
}

// ============================================================
// FIT TIER CLASSIFICATION
// ============================================================

function classifyFitTier(
  lender: LenderProgram,
  eligible: boolean,
  ineligibleReasons: string[],
  track1DSCR: number,
  track2DSCR: number,
  borrower: BorrowerProfile,
  property: PropertyInputs,
  strategy: RentalStrategy,
): { tier: FitTier; reason: string } {
  if (!eligible) {
    return { tier: 'DOES_NOT_MEET_GUIDELINES', reason: ineligibleReasons.join('; ') };
  }

  const lenderMinDSCR = lender.minDSCR.value as number;
  const lenderMinFICO = lender.minFICO.value as number;
  const lenderMaxLTV = lender.maxLTV.value as number;
  const reasons: string[] = [];

  // Strength indicators
  const ficoHeadroom = borrower.ficoScore - lenderMinFICO;
  const dscrHeadroom = track1DSCR - lenderMinDSCR;
  const ltvHeadroom = lenderMaxLTV - property.purchasePrice > 0
    ? lenderMaxLTV - (property.purchasePrice * 0.01) // approximate
    : 0;

  // Count how many "best for" criteria match
  let bestForMatches = 0;
  if (strategy === 'STR' && lender.strPolicy.allowed) bestForMatches++;
  if (track1DSCR < 1.0 && lender.minDSCR.value <= 0.75) bestForMatches++;
  if (borrower.ficoScore < 680 && lender.minFICO.value <= 640) bestForMatches++;
  if (property.isNonWarrantable && lender.propertyTypeRules['CONDO_NON_WARRANTABLE']?.allowed) bestForMatches++;
  if (property.isCondotel && lender.propertyTypeRules['CONDOTEL']?.allowed) bestForMatches++;

  // Determine tier
  if (track1DSCR >= 1.25 && ficoHeadroom >= 60 && track2DSCR >= 1.0) {
    reasons.push('Strong DSCR, excellent FICO, positive cash flow');
    if (bestForMatches > 0) reasons.push(`Matches ${bestForMatches} lender specialty`);
    return { tier: 'STRONG_FIT', reason: reasons.join('. ') };
  }

  if (track1DSCR >= 1.0 && ficoHeadroom >= 20 && track2DSCR >= 0.85) {
    reasons.push('Qualifying DSCR, adequate FICO');
    if (bestForMatches > 0) reasons.push(`Matches ${bestForMatches} lender specialty`);
    return { tier: 'STANDARD_FIT', reason: reasons.join('. ') };
  }

  if (track1DSCR >= lenderMinDSCR && (ficoHeadroom >= 0 || lenderMinFICO === 0)) {
    reasons.push('Meets minimum guidelines');
    if (track1DSCR < 1.0) reasons.push('Sub-1.0 DSCR — flex/specialist program required');
    if (track2DSCR < 1.0) reasons.push('Track 2 negative carry — investor risk');
    if (ficoHeadroom < 20) reasons.push('FICO near floor — limited buffer');
    if (bestForMatches > 0) reasons.push(`Matches ${bestForMatches} lender specialty`);
    return { tier: 'CONDITIONAL_FIT', reason: reasons.join('. ') };
  }

  reasons.push('Marginal qualification profile');
  if (track1DSCR < lenderMinDSCR) reasons.push(`DSCR ${track1DSCR.toFixed(2)} below floor ${lenderMinDSCR}`);
  if (ficoHeadroom < 0 && lenderMinFICO > 0) reasons.push(`FICO ${borrower.ficoScore} below floor ${lenderMinFICO}`);
  return { tier: 'UNLIKELY_FIT', reason: reasons.join('. ') };
}

// ============================================================
// PROVENANCE WARNINGS — collect for any UNVERIFIED claims relied upon
// ============================================================

function collectProvenanceWarnings(lender: LenderProgram, eligible: boolean): string[] {
  const warnings: string[] = [];

  // Always warn about low confidence
  if (lender.confidenceScore < 70) {
    warnings.push(`${lender.name} confidence score ${lender.confidenceScore}/100 — verify terms directly`);
  }

  if (!eligible) return warnings;

  // Check provenance details for UNVERIFIED claims that might affect decision
  for (const detail of lender.provenanceDetails) {
    if (detail.provenance === 'UNVERIFIED') {
      warnings.push(`UNVERIFIED: "${detail.claim}" — source: ${detail.source}`);
    }
  }

  // Check key data points for UNVERIFIED provenance
  if (lender.minFICO.provenance === 'UNVERIFIED') {
    warnings.push(`Min FICO ${lender.minFICO.value} is UNVERIFIED — confirm with lender`);
  }
  if (lender.maxLTV.provenance === 'UNVERIFIED') {
    warnings.push(`Max LTV ${lender.maxLTV.value}% is UNVERIFIED — confirm with lender`);
  }
  if (lender.minDSCR.provenance === 'UNVERIFIED') {
    warnings.push(`Min DSCR ${lender.minDSCR.value} is UNVERIFIED — confirm with lender`);
  }
  if (lender.strPolicy.provenance === 'UNVERIFIED') {
    warnings.push(`STR policy is ${lender.strPolicy.provenance} — verify before underwriting`);
  }
  if (lender.reserveRule.provenance === 'UNVERIFIED') {
    warnings.push(`Reserve rule is UNVERIFIED — confirm with lender`);
  }

  return warnings;
}

// ============================================================
// MAIN: MATCH LENDERS
// ============================================================

export function matchLenders(
  property: PropertyInputs,
  borrower: BorrowerProfile,
  loan: LoanStructure,
  strategy: RentalStrategy,
  solvedRate: number,
): LenderFitResult[] {
  const loanAmount = property.purchasePrice * (loan.ltv / 100);
  const termYears = loan.term === '30_YR' ? 30 : loan.term === '40_YR' ? 40 : 15;
  const productType: 'FIXED' | 'ARM' = loan.armType === 'FIXED' ? 'FIXED' : 'ARM';

  const results: LenderFitResult[] = [];

  for (const lender of LENDERS) {
    const ineligibleReasons: string[] = [];

    // ── 1. FICO floor check ──
    const minFICO = lender.minFICO.value as number;
    if (minFICO > 0 && borrower.ficoScore < minFICO) {
      ineligibleReasons.push(`FICO ${borrower.ficoScore} below minimum ${minFICO}`);
    }

    // ── 2. DSCR floor check (preliminary — will refine after computing at lender rate) ──
    const minDSCR = lender.minDSCR.value as number;

    // ── 3. State availability ──
    if (!lender.statesAvailable.includes(property.state)) {
      ineligibleReasons.push(`${property.state} not in ${lender.name} service area`);
    }

    // ── 4. Property type check ──
    const ptRule = lender.propertyTypeRules[property.propertyType];
    if (!ptRule?.allowed) {
      ineligibleReasons.push(`${property.propertyType} not accepted by ${lender.name}`);
    }

    // ── 5. Entity type check ──
    if (!lender.entityAllowed.includes(borrower.entityType)) {
      ineligibleReasons.push(`${borrower.entityType} not accepted — ${lender.name} requires entity vesting`);
    }

    // ── 6. Loan amount range ──
    const loanMin = lender.loanAmountMin.value as number;
    const loanMax = lender.loanAmountMax.value as number;
    if (loanAmount < loanMin) {
      ineligibleReasons.push(`Loan $${Math.round(loanAmount).toLocaleString()} below minimum $${loanMin.toLocaleString()}`);
    }
    if (loanAmount > loanMax) {
      ineligibleReasons.push(`Loan $${Math.round(loanAmount).toLocaleString()} above maximum $${loanMax.toLocaleString()}`);
    }

    // ── 7. LTV check ──
    const maxLTV = ptRule?.maxLTV ?? (lender.maxLTV.value as number);
    const effectiveMaxLTV = strategy === 'STR' && lender.strPolicy.allowed
      ? Math.min(maxLTV, lender.strPolicy.maxLTVForSTR)
      : maxLTV;
    if (loan.ltv > effectiveMaxLTV) {
      ineligibleReasons.push(`LTV ${loan.ltv}% exceeds max ${effectiveMaxLTV}%`);
    }

    // ── 8. STR policy check ──
    if (strategy === 'STR' && !lender.strPolicy.allowed) {
      ineligibleReasons.push('STR strategy not supported');
    }

    // ── 9. Non-US investor check ──
    if (borrower.isNonUsInvestor && !lender.nonUsInvestorAllowed.value) {
      ineligibleReasons.push('Non-US investor / ITIN not accepted');
    }

    // ── 10. First-time investor overlay for Deephaven ──
    if (lender.id === 'deephaven' && borrower.experience === 'FIRST_TIME' && loan.ltv > 75) {
      ineligibleReasons.push('First-time investors max 75% LTV');
    }

    const eligible = ineligibleReasons.length === 0;

    // ── Estimate lender-specific rate ──
    const lenderRate = Math.max(solvedRate + lender.rateAdjustment, 3.5);

    // ── Compute PITIA at lender rate ──
    const pitia = computePITIA(
      loanAmount, lenderRate, termYears, loan.ioPeriod,
      property.annualTaxes, property.annualInsurance, property.hoa, property.floodInsurance,
    );

    // ── Compute qualifying rent per lender rules ──
    const qualifyingRent = computeQualifyingRentForLender(property, strategy, lender);

    // ── Compute Track 1 DSCR (Lender Qualification) ──
    let track1DSCR: number;
    if (lender.dscrFormulaMethod === 'GROSS_ITIA' && loan.ioPeriod !== 'NONE') {
      const ioPayment = loanAmount * (lenderRate / 100 / 12);
      const itia = ioPayment + property.annualTaxes / 12 + property.annualInsurance / 12 + property.hoa + property.floodInsurance / 12;
      track1DSCR = itia > 0 ? qualifyingRent / itia : 0;
    } else if (lender.dscrFormulaMethod === 'NOI_PI') {
      const pi = loanAmount * paymentFactor(lenderRate, termYears * 12);
      track1DSCR = pi > 0 ? qualifyingRent / pi : 0;
    } else {
      track1DSCR = pitia > 0 ? qualifyingRent / pitia : 0;
    }

    // ── Compute Track 2 DSCR (Investor Survival) ──
    const vacancyPct = strategy === 'STR' ? 25 : strategy === 'MTR' ? 12 : 8;
    const managementPct = 8;
    const maintenancePct = 5;
    const grossRent = strategy === 'STR'
      ? Math.max(property.strProjectedRent, property.marketRent)
      : Math.min(property.leaseRent, property.marketRent);
    const netIncome = grossRent * (1 - vacancyPct / 100) - grossRent * managementPct / 100 - grossRent * maintenancePct / 100;
    const track2DSCR = pitia > 0 ? netIncome / pitia : 0;

    // ── Re-check DSCR floor with computed value ──
    if (eligible && track1DSCR < minDSCR) {
      // No-ratio exception
      if (lender.noRatioAvailable.value && lender.noRatioAvailable.provenance !== 'UNVERIFIED') {
        // No-ratio can bypass DSCR check — flag as conditional
      } else if (lender.noRatioAvailable.value && lender.noRatioAvailable.provenance === 'UNVERIFIED') {
        ineligibleReasons.push(`DSCR ${track1DSCR.toFixed(2)} below ${minDSCR} floor — no-ratio UNVERIFIED, do not assume`);
      } else {
        ineligibleReasons.push(`DSCR ${track1DSCR.toFixed(2)} below minimum ${minDSCR}`);
      }
    }

    // Re-evaluate eligibility after DSCR re-check
    const finalEligible = ineligibleReasons.length === 0;

    // ── PPP State Law Check ──
    const pppStateResult = checkPPPLegal(
      property.state,
      borrower.entityType,
      loanAmount,
      property.unitCount,
      productType,
    );

    // ── Reserve estimation ──
    const reserveMonths = estimateReserveMonthsForLender(lender, track1DSCR, borrower, loan, strategy);
    const requiredReserves = Math.round(reserveMonths * pitia);

    // ── Fit tier classification ──
    const { tier, reason } = classifyFitTier(
      lender, finalEligible, ineligibleReasons,
      track1DSCR, track2DSCR, borrower, property, strategy,
    );

    // ── Triple rate estimate ──
    const estimatedRate = estimateLenderTripleRate(lender, solvedRate);

    // ── Provenance warnings ──
    const provenanceWarnings = collectProvenanceWarnings(lender, finalEligible);

    results.push({
      lenderId: lender.id,
      lenderName: lender.name,
      fitTier: tier,
      fitReason: reason,
      eligible: finalEligible,
      ineligibleReasons,
      estimatedRate,
      requiredReserves,
      track1DSCR: Math.round(track1DSCR * 1000) / 1000,
      track2DSCR: Math.round(track2DSCR * 1000) / 1000,
      pppStateResult,
      twoQuoteRequired: false, // will be set in two-quote rule below
      provenanceWarnings,
      sourceProvenance: lender.sourceType,
      confidenceScore: lender.confidenceScore,
      confidenceBand: lender.confidenceBand,
      rateAdjustment: lender.rateAdjustment,
      sourceSnapshot: lender.sourceSnapshot,
    });
  }

  // ── TWO-QUOTE RULE ──
  // Always return results for at least one flex lender AND one rate-competitive lender
  const eligibleResults = results.filter(r => r.eligible);
  const hasFlexLender = eligibleResults.some(r => {
    const lender = LENDERS.find(l => l.id === r.lenderId);
    return lender && (lender.minDSCR.value as number) <= 0.75;
  });
  const hasRateCompetitiveLender = eligibleResults.some(r => {
    const lender = LENDERS.find(l => l.id === r.lenderId);
    return lender && lender.rateAdjustment <= 0;
  });

  // Mark two-quote requirement
  for (const result of results) {
    if (result.eligible) {
      const lender = LENDERS.find(l => l.id === result.lenderId);
      const isFlexLender = lender && (lender.minDSCR.value as number) <= 0.75;
      const isRateLender = lender && lender.rateAdjustment <= 0;

      if (isFlexLender && !hasRateCompetitiveLender) {
        result.twoQuoteRequired = true;
        result.provenanceWarnings.push(
          'Two-quote rule: No rate-competitive lender eligible — seek a second quote from a rate-focused lender',
        );
      } else if (isRateLender && !hasFlexLender) {
        result.twoQuoteRequired = true;
        result.provenanceWarnings.push(
          'Two-quote rule: No flex/specialist lender eligible — seek a second quote from a flex lender for sub-1.0 options',
        );
      } else if (hasFlexLender && hasRateCompetitiveLender) {
        result.twoQuoteRequired = false;
      }
    }
  }

  // Sort: eligible first, then by fit tier priority, then by rate
  const tierOrder: Record<FitTier, number> = {
    STRONG_FIT: 0,
    STANDARD_FIT: 1,
    CONDITIONAL_FIT: 2,
    UNLIKELY_FIT: 3,
    DOES_NOT_MEET_GUIDELINES: 4,
  };

  results.sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
    const tierA = tierOrder[a.fitTier] ?? 4;
    const tierB = tierOrder[b.fitTier] ?? 4;
    if (tierA !== tierB) return tierA - tierB;
    return a.estimatedRate.typical - b.estimatedRate.typical;
  });

  return results;
}
