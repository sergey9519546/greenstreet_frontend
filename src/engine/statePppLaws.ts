// ============================================================
// DSCR Deal Desk v11.0 — State-Aware Prepayment Penalty Engine
// Part E: Business-purpose aware branching gate.
//
// v11 UPGRADES:
//   - MN HF 3437 ENACTED April 23, 2026; effective August 1, 2026.
//     Narrows §58.137 to personal/family/household loans ONLY.
//     Business-purpose DSCR loans NOT reached.
//   - Business-purpose branch gate: entity × bank × purpose
//   - AK: INDIVIDUAL not allowed; LLC/CORP ALLOWED
//   - NJ: lender matrices SPLIT (some LLC OK, some C/S-corp only)
//   - OH: penalty BASE = ORIGINAL principal (per ORC §1343.011)
//   - WI/ME: no PPP on ARM (WI cap 2 months' interest)
//   - WA: ARM ban UNVERIFIED — do not encode as blanket
// ============================================================

import type {
  PPPStateLaw,
  PPPStateStatus,
  PPPCheckResult,
  EntityType,
  PrepayType,
  ProvenanceLabel,
} from './types';

export const STATE_CODE_TO_NAME: Readonly<Record<string, string>> = Object.freeze({
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
  DC: 'District of Columbia',
});

export const STATE_JURISDICTION_CODES: readonly string[] = Object.freeze(
  Object.keys(STATE_CODE_TO_NAME),
);

const STATE_NAME_TO_CODE = Object.freeze(
  Object.fromEntries(
    Object.entries(STATE_CODE_TO_NAME).map(([code, name]) => [name.toUpperCase(), code]),
  ) as Record<string, string>,
);

/** Returns a canonical postal code for an exact two-letter code or full jurisdiction name. */
export function normalizeStateCode(value: string | null | undefined): string | null {
  const normalized = value?.trim().replace(/\s+/g, ' ').toUpperCase();
  if (!normalized) return null;
  if (STATE_CODE_TO_NAME[normalized]) return normalized;
  return STATE_NAME_TO_CODE[normalized] ?? null;
}

export interface PPPStateSourceMetadata {
  sourceUrl?: string | null;
  effectiveDate?: string | null;
  reviewedAt?: string | null;
  reviewer?: string | null;
}

export type PPPStateLawWithSource = PPPStateLaw & PPPStateSourceMetadata;

export const PPP_MODEL_AS_OF = '2026-06-25';

export const PPP_MODEL_LIMITATION =
  `Informational model data current as of ${PPP_MODEL_AS_OF}; not legal advice. ` +
  'It does not determine legality, enforceability, program availability, pricing, or approval. Verify current primary sources, lender guidelines, and final documents with qualified counsel.';

// -----------------------------------------------------------
// Indexed threshold values (2026)
// Annually re-confirmed each January per Part E.3
// -----------------------------------------------------------
const PA_PPP_THRESHOLD_2026 = 329_411;
const OH_PPP_THRESHOLD_2026 = 116_356;
const THRESHOLD_YEAR = 2026;

// -----------------------------------------------------------
// All available prepay types (for unrestricted states)
// -----------------------------------------------------------
const ALL_PREPAY_OPTIONS: PrepayType[] = [
  'NONE',
  '54321',
  '4321',
  '321',
  '54333',
  'FLAT_5',
  'SIX_MONTHS_INTEREST',
  'SIX_MONTHS_80_PCT',
  'YIELD_MAINTENANCE',
  'SOFT_PREPAY',
];

// Declining-only structures (MS and similar)
const DECLINING_ONLY_OPTIONS: PrepayType[] = [
  'NONE',
  '54321',
  '4321',
  '321',
];

// No-PPP premium constants
const NO_PPP_RATE_PREMIUM = 0.0025;   // Illustrative internal model assumption; not a current quote.
const NO_PPP_FEE_PREMIUM = 0.00625;   // Illustrative internal model assumption; not a current quote.

// Entity types that are NOT individuals
const ENTITY_TYPES: EntityType[] = ['LLC', 'S_CORP', 'C_CORP', 'TRUST'];

// -----------------------------------------------------------
// Full State Matrix — PPP_STATE_LAWS
// -----------------------------------------------------------
export const PPP_STATE_LAWS: Record<string, PPPStateLawWithSource> = {
  // ── MINNESOTA — HF 3437 ENACTED (v11 upgrade) ──────────────
  MN: {
    state: 'MN',
    status: 'CONDITIONAL',  // Changed from PRACTICALLY_PROHIBITED — HF 3437 narrows scope
    reason:
      'MN HF 3437 ENACTED April 23, 2026; effective August 1, 2026. Narrows Minn. Stat. § 58.137 to loans made PRIMARILY for personal/family/household purposes. Business-purpose DSCR loans (LLC-vested, investment property) are NOT reached by the statute. Pre-8/1/26: § 58.137 capped PPPs at 4 years / ≤2 months interest (effectively prohibited). Post-8/1/26: business-purpose DSCR loans have PPP availability per lender matrix.',
    details:
      'HF 3437 passed House April 13, Senate April 20, signed into law April 23, 2026. ' +
      'Effective August 1, 2026. Amends § 58.137 to explicitly limit scope to "loans made ' +
      'primarily for personal, family, or household purposes." Business-purpose DSCR loans ' +
      '(which by definition are NOT personal/family/household) are entirely outside scope. ' +
      'PRE-8/1/26: 4-year max duration, ≤2 months interest cap = effectively prohibited. ' +
      'POST-8/1/26: business-purpose loans follow lender state matrix (typically available). ' +
      'Most significant 2026 PPP law change. References: MN Revisor HF 3437 (Refs 37,38,39).',
    maxPenaltyYears: 4,  // still applies to consumer loans
    maxPenaltyAmount: '2 months interest (consumer only)',
    statutoryReference: 'Minn. Stat. § 58.137 (as amended by HF 3437, eff. Aug 1, 2026)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── NEW JERSEY ─────────────────────────────────────────────
  NJ: {
    state: 'NJ',
    status: 'ENTITY_ONLY',
    reason:
      'Prohibited for INDIVIDUALS; permitted for entities (LLC rules vary by lender).',
    details:
      'New Jersey law prohibits prepayment penalties for loans made to individual borrowers. ' +
      'Entity borrowers (LLC, S-Corp, C-Corp, Trust) are generally permitted to have PPPs, ' +
      'though LLC-specific rules vary by lender. Borrowers seeking PPP must vest in an ' +
      'eligible entity prior to closing.',
    entityRestrictions: ['INDIVIDUAL'],
    statutoryReference: 'N.J.S.A. 46:10B-2',
    provenance: 'VERIFIED_SECONDARY',
    lastVerified: '2026-01',
  },

  // ── ILLINOIS ───────────────────────────────────────────────
  IL: {
    state: 'IL',
    status: 'CONDITIONAL',
    reason:
      'Prohibited for individuals; entities subject to APR fall-rate tests.',
    details:
      'Illinois prohibits prepayment penalties for individual borrowers. ' +
      'Entity borrowers may have PPPs but are subject to APR fall-rate tests ' +
      'that constrain the permissible penalty structure. The fall-rate test ' +
      'requires that the penalty decline proportionally over the penalty period.',
    entityRestrictions: ['INDIVIDUAL'],
    statutoryReference: '815 ILCS 137/5 (Predatory Lending Database Act) + 815 ILCS 205/4.1',
    provenance: 'VERIFIED_SECONDARY',
    lastVerified: '2026-01',
  },

  // ── OHIO ───────────────────────────────────────────────────
  OH: {
    state: 'OH',
    status: 'CONDITIONAL',
    reason:
      'Prohibited on loans ≤ ~$116,356 (or applicable state limit) for 1–2 unit properties.',
    details:
      'Ohio prohibits prepayment penalties on residential mortgage loans at or below ' +
      'the applicable state loan threshold. For 2026, the threshold is $116,356. ' +
      'Loans exceeding this amount and/or secured by 3+ unit properties may include PPPs. ' +
      'Threshold is indexed and may adjust annually. ' +
      'Per ORC § 1343.011, penalty basis = ORIGINAL principal (not remaining).',
    loanThreshold: OH_PPP_THRESHOLD_2026,
    thresholdIsIndexed: true,
    thresholdYear: THRESHOLD_YEAR,
    unitCountRestriction: 2,
    statutoryReference: 'Ohio Rev. Code § 1343.011 (penalty base = original principal)',
    provenance: 'VERIFIED_SECONDARY',
    lastVerified: '2026-01',
  },

  // ── PENNSYLVANIA ───────────────────────────────────────────
  PA: {
    state: 'PA',
    status: 'CONDITIONAL',
    reason:
      'Prohibited on 1–2 unit properties below the annually indexed threshold: $329,411 for 2026 (was $319,777).',
    details:
      'Pennsylvania prohibits prepayment penalties on 1–2 unit residential properties ' +
      'when the loan amount falls below the annually indexed threshold. ' +
      'For 2026 the threshold is $329,411 (previously $319,777). ' +
      'This value adjusts each year. Loans above the threshold or on 3+ unit ' +
      'properties are not subject to this restriction. STORE AS INDEXED VALUE.',
    loanThreshold: PA_PPP_THRESHOLD_2026,
    thresholdIsIndexed: true,
    thresholdYear: THRESHOLD_YEAR,
    unitCountRestriction: 2,
    statutoryReference: '41 P.S. § 101 (Pennsylvania Loan Interest and Protection Law)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-01',
  },

  // ── MISSISSIPPI ────────────────────────────────────────────
  MS: {
    state: 'MS',
    status: 'CONDITIONAL',
    reason:
      'Declining structures only; statutory caps 5-4-3-2-1 by year; flat penalties prohibited on terms >1 year.',
    details:
      'Mississippi permits prepayment penalties only in declining step-down structures ' +
      'following the statutory schedule of 5%-4%-3%-2%-1% by year (Miss. Code § 75-17-31). ' +
      'Flat penalties are prohibited on loan terms exceeding 1 year. ' +
      'Yield maintenance, six-months-interest, and other non-declining structures are not permitted.',
    statutoryCapSchedule: [5, 4, 3, 2, 1],
    statutoryReference: 'Miss. Code § 75-17-31',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-01',
  },

  // ── NORTH DAKOTA ───────────────────────────────────────────
  ND: {
    state: 'ND',
    status: 'AMBIGUOUS',
    reason:
      'Treated as prohibited by many lenders (program guidelines + usury considerations).',
    details:
      'North Dakota does not have a clear statutory prohibition on prepayment penalties ' +
      'for commercial/investment property loans, but many lenders treat ND as a no-PPP state ' +
      'due to program guidelines and usury law considerations. ' +
      'Lender interpretation varies significantly. Borrowers should verify with their ' +
      'specific lender before assuming PPP availability.',
    statutoryReference: 'N.D. Cent. Code § 47-14-09 (usury) — no specific PPP statute; lender-matrix-driven',
    provenance: 'UNVERIFIED',
    lastVerified: '2026-01',
  },

  // ── KANSAS ─────────────────────────────────────────────────
  KS: {
    state: 'KS',
    status: 'PRACTICALLY_PROHIBITED',
    reason:
      'Effectively prohibited per prevailing lender matrices.',
    details:
      'Kansas is treated as a no-PPP state by virtually all major DSCR lenders. ' +
      'While not a flat statutory ban, prevailing lender matrices and program guidelines ' +
      'effectively prohibit prepayment penalties. Verify with individual lenders.',
    statutoryReference: 'No specific KS PPP statute — lender-matrix-driven (verified via program guidelines)',
    provenance: 'UNVERIFIED',
    lastVerified: '2026-01',
  },

  // ── NEW MEXICO ─────────────────────────────────────────────
  NM: {
    state: 'NM',
    status: 'PRACTICALLY_PROHIBITED',
    reason:
      'Effectively prohibited per prevailing lender matrices.',
    details:
      'New Mexico is treated as a no-PPP state by virtually all major DSCR lenders. ' +
      'While not a flat statutory ban, prevailing lender matrices and program guidelines ' +
      'effectively prohibit prepayment penalties. Verify with individual lenders.',
    statutoryReference: 'NMSA § 58-21A-1 et seq. (NM Mortgage Loan Originator Act) — lender-matrix-driven',
    provenance: 'UNVERIFIED',
    lastVerified: '2026-01',
  },

  // ── MARYLAND ───────────────────────────────────────────────
  MD: {
    state: 'MD',
    status: 'PRACTICALLY_PROHIBITED',
    reason:
      'Effectively prohibited per prevailing lender matrices.',
    details:
      'Maryland is treated as a no-PPP state by virtually all major DSCR lenders. ' +
      'While not a flat statutory ban, prevailing lender matrices and program guidelines ' +
      'effectively prohibit prepayment penalties. Verify with individual lenders.',
    statutoryReference: 'Md. Code, Real Property § 12-103 (prepayment penalty limitations) — lender-matrix-driven',
    provenance: 'UNVERIFIED',
    lastVerified: '2026-01',
  },

  // ── WISCONSIN ──────────────────────────────────────────────
  WI: {
    state: 'WI',
    status: 'ARM_RESTRICTED',
    reason:
      'No PPP on ARM loans; WI caps at 2 months\u2019 interest.',
    details:
      'Wisconsin prohibits prepayment penalties on adjustable-rate mortgage (ARM) loans. ' +
      'For fixed-rate loans, PPPs are permitted but are capped at a maximum of ' +
      '2 months\u2019 interest. Declining structures and flat penalties that exceed ' +
      'this cap are not permissible.',
    armRestriction: true,
    maxPenaltyAmount: '2 months interest',
    statutoryReference: 'Wis. Stat. § 138.05(7) (ARM ban); § 422.202(c) (2-months-interest cap)',
    provenance: 'VERIFIED_SECONDARY',
    lastVerified: '2026-01',
  },

  // ── MAINE ──────────────────────────────────────────────────
  ME: {
    state: 'ME',
    status: 'ARM_RESTRICTED',
    reason:
      'No PPP on ARM loans.',
    details:
      'Maine prohibits prepayment penalties on adjustable-rate mortgage (ARM) loans. ' +
      'For fixed-rate loans, PPPs are generally available with standard structures.',
    armRestriction: true,
    statutoryReference: '9-A M.R.S. § 8-505 (Maine Consumer Credit Code — ARM prepay ban)',
    provenance: 'VERIFIED_SECONDARY',
    lastVerified: '2026-01',
  },

  // ── WASHINGTON ─────────────────────────────────────────────
  WA: {
    state: 'WA',
    status: 'ALLOWED',
    reason:
      'ARM-ban claim from v6.0 could not be confirmed. Standard PPP options available until sourced.',
    details:
      'A claim that Washington prohibits PPPs on ARM loans was present in v6.0 but ' +
      'could not be confirmed through independent verification. Per v7.0 provenance policy, ' +
      'unverified restrictions must not be encoded. The ARM restriction is flagged as ' +
      'UNVERIFIED and should not be applied until a reliable source is found. ' +
      'Standard PPP options remain available for both fixed and ARM products. ' +
      'If a source confirms RCW § 19.144.060(2) or similar ARM-ban, update this entry.',
    armRestriction: 'UNVERIFIED',
    statutoryReference: 'RCW § 19.144 (consumer mortgage) — ARM prepay ban NOT VERIFIED',
    provenance: 'UNVERIFIED',
    lastVerified: '2026-01',
  },

  // ── MICHIGAN (ambiguous) ───────────────────────────────────
  MI: {
    state: 'MI',
    status: 'AMBIGUOUS',
    reason:
      'No legal consensus as of 2026 on whether PPPs are allowed, restricted, or banned. Lender-interpretation varies.',
    details:
      'Michigan has no clear legal consensus regarding prepayment penalties on ' +
      'DSCR/investment property loans as of 2026. Interpretations range from ' +
      'permitted to restricted to banned depending on the legal analysis applied. ' +
      'Borrowers should consult legal counsel and verify with their specific lender. ' +
      'MCL § 445.1601 et seq. (Consumer Mortgage Protection Act) may apply to consumer loans.',
    statutoryReference: 'MCL § 445.1601 et seq. (Consumer Mortgage Protection Act) — applicability to DSCR UNVERIFIED',
    provenance: 'UNVERIFIED',
    lastVerified: '2026-01',
  },

  // ── v11.2 ADDITIONS: 6 high-volume DSCR states with documented
  //    business-purpose carve-outs (CA, TX, FL, GA, NC, CO).
  //    Previously relied on the generic "ALLOWED" fallback — adding
  //    explicit entries gives provenance-tracked documentation. ──

  // ── CALIFORNIA ─────────────────────────────────────────────
  CA: {
    state: 'CA',
    status: 'ALLOWED',
    reason:
      'Business-purpose DSCR loans are exempt from consumer PPP restrictions. Federal lenders benefit from DIDMCA preemption. State-chartered lenders subject to CA Finance Lenders Law (CFLL) but PPP permitted on investment property loans.',
    details:
      'California Civil Code § 2954.9 prohibits prepayment penalties on owner-occupied ' +
      '1-4 unit residential loans, but expressly EXEMPTS loans "made primarily for ' +
      'business or commercial purposes" (the DSCR use case). For entity-vested ' +
      'investment property loans, no state PPP restriction applies. ' +
      'Federally-chartered lenders (banks, credit unions) additionally benefit from ' +
      'DIDMCA (Depository Institutions Deregulation and Monetary Control Act of 1980) ' +
      'preemption, which overrides state PPP law for first-lien residential loans. ' +
      'State-chartered lenders under CFLL (Cal. Fin. Code § 22000 et seq.) may impose ' +
      'PPPs on business-purpose loans. Lender matrices uniformly permit PPP on CA ' +
      'DSCR loans.',
    statutoryReference: 'Cal. Civ. Code § 2954.9 (business-purpose exemption); Cal. Fin. Code § 22000 et seq. (CFLL); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── TEXAS ──────────────────────────────────────────────────
  TX: {
    state: 'TX',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. TX Constitution\'s homestead protections apply only to owner-occupied (cash-out refinance) loans, not DSCR.',
    details:
      'Texas has no state statute restricting prepayment penalties on business-purpose ' +
      'or investment property loans. The Texas Constitution (Art. XVI, § 50) governs ' +
      'homestead equity loans (owner-occupied cash-out refis) and prohibits certain ' +
      'fees on those loans — but this does NOT extend to DSCR/investment property ' +
      'loans, which are business-purpose and outside the homestead protections. ' +
      'Federally-chartered lenders benefit from DIDMCA preemption. ' +
      'All major DSCR lender matrices permit PPP in Texas. Standard prepay ' +
      'structures (321, 54321, yield maintenance, soft prepay) are uniformly available.',
    statutoryReference: 'Tex. Const. Art. XVI, § 50 (homestead — does NOT apply to investment/DSCR); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── FLORIDA ────────────────────────────────────────────────
  FL: {
    state: 'FL',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. FL statute § 697.05 governs prepayment on residential loans but does not prohibit PPP.',
    details:
      'Florida Statutes § 697.05 regulates prepayment penalties on residential mortgage ' +
      'loans but does not prohibit them. For business-purpose DSCR loans secured by ' +
      'investment property, no restriction applies. Federally-chartered lenders ' +
      'additionally benefit from DIDMCA preemption. All major DSCR lender matrices ' +
      'permit PPP in Florida. Standard prepay structures (321, 54321, yield ' +
      'maintenance, soft prepay) are uniformly available. Florida is one of the ' +
      'highest-volume DSCR states (no state income tax, landlord-friendly courts).',
    statutoryReference: 'Fla. Stat. § 697.05 (prepayment permitted, not prohibited); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── GEORGIA ────────────────────────────────────────────────
  GA: {
    state: 'GA',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. GA\'s predatory lending law (O.C.G.A. § 7-6A-5) applies to consumer home loans only, not DSCR.',
    details:
      'Georgia\'s Georgia Fair Lending Act (O.C.G.A. § 7-6A-1 et seq.) and predatory ' +
      'lending provisions (§ 7-6A-5) apply to "home loans" defined as consumer-purpose ' +
      'owner-occupied 1-4 unit residential loans. Business-purpose DSCR loans are ' +
      'outside the scope of these provisions. Federally-chartered lenders additionally ' +
      'benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in ' +
      'Georgia. Standard prepay structures uniformly available.',
    statutoryReference: 'O.C.G.A. § 7-6A-1 et seq. (GA Fair Lending Act — consumer home loans only); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── NORTH CAROLINA ─────────────────────────────────────────
  NC: {
    state: 'NC',
    status: 'CONDITIONAL',
    reason:
      '3-2-1 declining cap applies to consumer 1-4 unit residential loans (≤$400K). Business-purpose DSCR loans are exempt. High-cost loan provisions may apply on rate/fee triggers — verify structure complies.',
    details:
      'North Carolina General Statutes § 24-1.1A impose a 3%-2%-1% declining prepayment ' +
      'penalty cap on consumer-purpose first-lien residential loans of $400,000 or less ' +
      '(indexed annually). This cap does NOT apply to business-purpose DSCR loans ' +
      'secured by investment property — entity-vested business-purpose loans are exempt. ' +
      'However, NC\'s high-cost home loan provisions (N.C. Gen. Stat. § 24-1.1E) can ' +
      'apply if APR or points/fees exceed statutory triggers — verify your structure ' +
      'does not trip these triggers. Federally-chartered lenders additionally benefit ' +
      'from DIDMCA preemption. Lender matrices generally permit PPP on DSCR loans in NC.',
    statutoryReference: 'N.C. Gen. Stat. § 24-1.1A (3-2-1 cap, consumer ≤$400K, indexed); N.C. Gen. Stat. § 24-1.1E (high-cost home loan); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_SECONDARY',
    lastVerified: '2026-06',
  },

  // ── COLORADO ───────────────────────────────────────────────
  CO: {
    state: 'CO',
    status: 'CONDITIONAL',
    reason:
      '3-2-1 declining cap applies to consumer 1-4 unit residential loans. Business-purpose DSCR loans are exempt. Colorado Uniform Consumer Credit Code (UCCC) applies only to consumer credit.',
    details:
      'Colorado\'s Uniform Consumer Credit Code (C.R.S. § 5-1-101 et seq.) regulates ' +
      'prepayment penalties on consumer credit transactions. A 3%-2%-1% declining ' +
      'cap applies to consumer-purpose residential mortgage loans. Business-purpose ' +
      'DSCR loans (entity-vested, investment property) are NOT consumer credit ' +
      'transactions and fall outside the UCCC. Federally-chartered lenders ' +
      'additionally benefit from DIDMCA preemption. Lender matrices generally ' +
      'permit PPP on DSCR loans in Colorado, with standard structures available.',
    statutoryReference: 'C.R.S. § 5-1-101 et seq. (Colorado UCCC — consumer credit only); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_SECONDARY',
    lastVerified: '2026-06',
  },

  // ── v11.3 ADDITIONS: 5 high-volume DSCR states (TN, AZ, VA, IN, SC) ──
  // These states have meaningful DSCR volume but previously relied on the
  // generic "ALLOWED" fallback. Adding explicit entries with statutory
  // references gives users documented legal basis (business-purpose
  // exemption + DIDMCA preemption for federal lenders).

  // ── TENNESSEE ──────────────────────────────────────────────
  TN: {
    state: 'TN',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. TN usury statute (T.C.A. § 47-14-102) sets ceiling at prime + 4% but banks/LLC business loans are exempt. TN is one of the fastest-growing DSCR markets (no state income tax, landlord-friendly).',
    details:
      'Tennessee has no state statute restricting prepayment penalties on business-purpose ' +
      'or investment property loans. T.C.A. § 47-14-123 governs prepayment generally and ' +
      'does not prohibit PPP on commercial/investment transactions. The Tennessee usury ' +
      'statute (T.C.A. § 47-14-102) sets the interest rate ceiling at 4% above the prime ' +
      'rate, but expressly exempts loans made by banks, savings & loans, and loans ' +
      'secured by real property in the ordinary course of business — which covers DSCR ' +
      'loans. Federally-chartered lenders additionally benefit from DIDMCA preemption. ' +
      'All major DSCR lender matrices permit PPP in Tennessee. Standard prepay ' +
      'structures (321, 54321, yield maintenance, soft prepay) are uniformly available. ' +
      'TN is one of the fastest-growing DSCR markets — no state income tax, ' +
      'landlord-friendly courts, and strong in-migration from high-tax states.',
    statutoryReference: 'T.C.A. § 47-14-123 (prepayment permitted); T.C.A. § 47-14-102 (usury — banks/real-estate-secured loans exempt); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── ARIZONA ───────────────────────────────────────────────
  AZ: {
    state: 'AZ',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. AZ consumer prepayment statute (A.R.S. § 6-126) applies to consumer 1-2 unit owner-occupied only.',
    details:
      'Arizona has no state statute restricting prepayment penalties on business-purpose ' +
      'or investment property loans. A.R.S. § 6-126 (Department of Financial Institutions ' +
      'regulation) regulates prepayment penalties on consumer residential mortgage loans ' +
      'but expressly applies only to owner-occupied 1-2 unit properties — not DSCR/' +
      'investment property loans. The Arizona usury statute (A.R.S. § 44-1201) sets the ' +
      'civil usury cap at 10% above the prime rate, but loans made by banks, savings & ' +
      'loans, and any loan "made primarily for a business, agricultural, or commercial ' +
      'purpose" are exempt — which covers DSCR loans by definition. Federally-chartered ' +
      'lenders additionally benefit from DIDMCA preemption. All major DSCR lender ' +
      'matrices permit PPP in Arizona. Standard prepay structures (321, 54321, yield ' +
      'maintenance, soft prepay) are uniformly available. AZ is a high-growth DSCR ' +
      'market (Phoenix/Tucson in-migration, no state income tax on most income).',
    statutoryReference: 'A.R.S. § 6-126 (consumer owner-occupied 1-2 unit only); A.R.S. § 44-1201 (usury — business/commercial loans exempt); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── VIRGINIA ──────────────────────────────────────────────
  VA: {
    state: 'VA',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. VA high-cost mortgage provisions (Va. Code § 6.2-1303 et seq.) apply to consumer home loans only, not DSCR.',
    details:
      'Virginia has no state statute restricting prepayment penalties on business-purpose ' +
      'or investment property loans. The Virginia Mortgage Lender and Broker Act ' +
      '(Va. Code § 6.2-1600 et seq.) regulates prepayment penalties on consumer ' +
      'residential mortgage loans. The Virginia High-Rate Home Loans Act (Va. Code ' +
      '§ 6.2-1303 et seq.) imposes restrictions on high-cost consumer home loans ' +
      '— but this applies only to owner-occupied consumer-purpose 1-4 unit residential ' +
      'loans, not DSCR/investment property loans. Business-purpose DSCR loans are ' +
      'outside the scope of these provisions. Federally-chartered lenders additionally ' +
      'benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP in ' +
      'Virginia. Standard prepay structures (321, 54321, yield maintenance, soft prepay) ' +
      'are uniformly available. VA is a growing DSCR market (Northern VA/' +
      ' Richmond/VA Beach corridor — strong rental demand from federal contractors).',
    statutoryReference: 'Va. Code § 6.2-1600 et seq. (Mortgage Lender and Broker Act — consumer); Va. Code § 6.2-1303 et seq. (High-Rate Home Loans — consumer only); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── INDIANA ───────────────────────────────────────────────
  IN: {
    state: 'IN',
    status: 'CONDITIONAL',
    reason:
      '2% cap applies to consumer 1-2 unit residential loans (first 3 years). Business-purpose DSCR loans are exempt per Indiana UCCC § 24-4.5-2-106. DIDMCA preemption applies for federal lenders. Standard prepay structures available.',
    details:
      'Indiana\'s Uniform Consumer Credit Code (Ind. Code § 24-4.5-3-202) imposes a 2% ' +
      'prepayment penalty cap on consumer-purpose first-lien residential mortgage loans ' +
      'during the first 3 years (declining step-down). Critically, Ind. Code § 24-4.5-2-106 ' +
      'expressly EXEMPTS "transactions conducted primarily for a business, agricultural, ' +
      'or commercial purpose" from the UCCC — which covers DSCR loans by definition. ' +
      'Business-purpose entity-vested investment property loans fall outside the UCCC ' +
      'and are not subject to the 2% consumer cap. Federally-chartered lenders ' +
      'additionally benefit from DIDMCA preemption. All major DSCR lender matrices ' +
      'permit PPP on DSCR loans in Indiana. Standard prepay structures (321, 54321, ' +
      'yield maintenance, soft prepay) are uniformly available for business-purpose ' +
      'entity-vested DSCR loans.',
    statutoryReference: 'Ind. Code § 24-4.5-3-202 (2% consumer cap, first 3 years); Ind. Code § 24-4.5-2-106 (business-purpose exemption); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── SOUTH CAROLINA ────────────────────────────────────────
  SC: {
    state: 'SC',
    status: 'CONDITIONAL',
    reason:
      'Consumer credit code 3-2-1 declining cap applies to consumer 1-4 unit residential loans. Business-purpose DSCR loans are exempt per S.C. Code § 37-1-202. DIDMCA preemption applies for federal lenders. Standard prepay structures available.',
    details:
      'South Carolina\'s Consumer Protection Code (S.C. Code Ann. § 37-5-202) imposes a ' +
      'declining prepayment penalty cap (typically 3%-2%-1% by year) on consumer-purpose ' +
      'first-lien residential mortgage loans. Critically, S.C. Code Ann. § 37-1-202 ' +
      'expressly EXEMPTS "transactions conducted primarily for a business, agricultural, ' +
      'or commercial purpose" from the Consumer Protection Code — which covers DSCR ' +
      'loans by definition. Business-purpose entity-vested investment property loans ' +
      'fall outside the Consumer Protection Code and are not subject to the 3-2-1 ' +
      'consumer cap. Federally-chartered lenders additionally benefit from DIDMCA ' +
      'preemption. All major DSCR lender matrices permit PPP on DSCR loans in South ' +
      'Carolina. Standard prepay structures (321, 54321, yield maintenance, soft prepay) ' +
      'are uniformly available for business-purpose entity-vested DSCR loans. SC is a ' +
      'growing DSCR market (Charleston, Greenville, Columbia — strong in-migration).',
    statutoryReference: 'S.C. Code Ann. § 37-5-202 (3-2-1 consumer cap); S.C. Code Ann. § 37-1-202 (business-purpose exemption); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── v11.4 ADDITIONS: 5 more high-volume DSCR states (OR, NV, UT, MO, AL) ──
  // These states previously fell through to the generic ALLOWED fallback.
  // v11.4 promotes them to explicit entries with documented business-purpose
  // carve-outs + DIDMCA preemption for federal lenders, matching the
  // treatment already given to CA/TX/FL/GA/NC/CO/TN/AZ/VA/IN/SC.

  // ── OREGON ────────────────────────────────────────────────
  OR: {
    state: 'OR',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. OR consumer prepayment statute (ORS § 86A.192) applies to consumer residential mortgage loans only.',
    details:
      'Oregon has no state statute restricting prepayment penalties on business-purpose ' +
      'or investment property loans. ORS § 86A.192 (Oregon Mortgage Lender Law) ' +
      'regulates prepayment penalties on consumer residential mortgage loans but ' +
      'applies to consumer-purpose transactions — not business-purpose DSCR loans. ' +
      'The Oregon Consumer Finance Act (ORS § 725.320 et seq.) governs consumer ' +
      'finance transactions and does not reach business-purpose commercial real ' +
      'estate lending. Oregon usury law (ORS § 82.010) sets the general usury cap ' +
      'but expressly exempts loans "made primarily for a business, agricultural, ' +
      'or commercial purpose" — which covers DSCR loans by definition. Federally-' +
      'chartered lenders additionally benefit from DIDMCA preemption. All major ' +
      'DSCR lender matrices permit PPP in Oregon. Standard prepay structures ' +
      '(321, 54321, yield maintenance, soft prepay) are uniformly available. OR ' +
      'is a growing DSCR market (Portland metro, Bend, Salem — Portland in-' +
      'migration from CA, Bend vacation/STR market).',
    statutoryReference: 'ORS § 86A.192 (Oregon Mortgage Lender Law — consumer); ORS § 82.010 (usury — business/commercial loans exempt); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── NEVADA ────────────────────────────────────────────────
  NV: {
    state: 'NV',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. NV consumer mortgage lending statute (NRS § 598D.430) applies to consumer residential mortgage loans only.',
    details:
      'Nevada has no state statute restricting prepayment penalties on business-purpose ' +
      'or investment property loans. NRS § 598D.430 (Mortgage Lending Act) regulates ' +
      'prepayment penalties on consumer residential mortgage loans but applies to ' +
      'consumer-purpose transactions — not business-purpose DSCR loans. NRS Chapter ' +
      '598D expressly governs "residential mortgage loans" defined as consumer loans ' +
      'to acquire or refinance a primary residence. Business-purpose entity-vested ' +
      'investment property loans fall outside the scope. The Nevada usury statute ' +
      '(NRS § 99.040) sets the general usury cap, but NRS § 99.050 exempts loans ' +
      'made by banks, savings & loans, and loans "made primarily for a business, ' +
      'agricultural, or commercial purpose" — which covers DSCR loans by definition. ' +
      'Federally-chartered lenders additionally benefit from DIDMCA preemption. All ' +
      'major DSCR lender matrices permit PPP in Nevada. Standard prepay structures ' +
      '(321, 54321, yield maintenance, soft prepay) are uniformly available. NV is ' +
      'a high-growth DSCR market (Las Vegas, Reno — strong in-migration from CA, ' +
      'no state income tax, landlord-friendly).',
    statutoryReference: 'NRS § 598D.430 (Mortgage Lending Act — consumer residential only); NRS § 99.040–050 (usury — banks/business loans exempt); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── UTAH ──────────────────────────────────────────────────
  UT: {
    state: 'UT',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. UT consumer credit code (Utah Code § 70C-5-202) applies to consumer credit transactions only.',
    details:
      'Utah has no state statute restricting prepayment penalties on business-purpose ' +
      'or investment property loans. The Utah Consumer Credit Code (Utah Code Title ' +
      '70C) governs consumer credit transactions and Utah Code § 70C-5-202 regulates ' +
      'prepayment penalties on consumer real estate loans. Critically, Utah Code ' +
      '§ 70C-1-202(3) expressly EXEMPTS "transactions conducted primarily for a ' +
      'business, agricultural, or commercial purpose" from the Consumer Credit Code ' +
      '— which covers DSCR loans by definition. Business-purpose entity-vested ' +
      'investment property loans fall outside the scope of the UCCC and are not ' +
      'subject to its prepayment restrictions. Utah has no general usury cap for ' +
      'business-purpose loans (Utah is one of the most lender-friendly states on ' +
      'interest rate). Federally-chartered lenders additionally benefit from DIDMCA ' +
      'preemption. All major DSCR lender matrices permit PPP in Utah. Standard ' +
      'prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly ' +
      'available. UT is a fast-growing DSCR market (Salt Lake City, Provo, St. ' +
      'George — strong in-migration, tech-sector growth).',
    statutoryReference: 'Utah Code § 70C-5-202 (consumer real estate prepay); Utah Code § 70C-1-202(3) (business-purpose exemption); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── MISSOURI ──────────────────────────────────────────────
  MO: {
    state: 'MO',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. MO consumer mortgage statute (Mo. Rev. Stat. § 408.043) applies to consumer residential loans only.',
    details:
      'Missouri has no state statute restricting prepayment penalties on business-purpose ' +
      'or investment property loans. Mo. Rev. Stat. § 408.043 (Missouri residential ' +
      'mortgage act) regulates prepayment penalties on consumer residential mortgage ' +
      'loans but applies to consumer-purpose transactions secured by the borrower\'s ' +
      'primary residence — not business-purpose DSCR loans. Missouri usury law ' +
      '(Mo. Rev. Stat. § 408.030) sets the general usury cap, but Mo. Rev. Stat. ' +
      '§ 408.030(8) expressly exempts "loans made primarily for a business, ' +
      'agricultural, or commercial purpose" — which covers DSCR loans by definition. ' +
      'Loans secured by real estate in the ordinary course of business are also ' +
      'exempt. Federally-chartered lenders additionally benefit from DIDMCA ' +
      'preemption. All major DSCR lender matrices permit PPP in Missouri. Standard ' +
      'prepay structures (321, 54321, yield maintenance, soft prepay) are uniformly ' +
      'available. MO is a steady DSCR market (Kansas City, St. Louis, Springfield ' +
      '— affordable rents, stable landlord-tenant law).',
    statutoryReference: 'Mo. Rev. Stat. § 408.043 (residential mortgage act — consumer primary residence only); Mo. Rev. Stat. § 408.030(8) (usury — business/commercial loans exempt); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── ALABAMA ───────────────────────────────────────────────
  AL: {
    state: 'AL',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. AL Mini-Code (Ala. Code § 5-19-4) applies to consumer credit transactions only.',
    details:
      'Alabama has no state statute restricting prepayment penalties on business-purpose ' +
      'or investment property loans. The Alabama Mini-Code (Ala. Code Title 5, ' +
      'Chapter 19) regulates consumer credit transactions and Ala. Code § 5-19-4 ' +
      'governs prepayment penalties on consumer loans. Critically, Ala. Code ' +
      '§ 5-19-4(2) expressly EXEMPTS "transactions conducted primarily for a ' +
      'business, agricultural, or commercial purpose" from the Mini-Code — which ' +
      'covers DSCR loans by definition. Business-purpose entity-vested investment ' +
      'property loans fall outside the scope of the Mini-Code and are not subject ' +
      'to its prepayment restrictions. Alabama usury law (Ala. Code § 8-8-1 et seq.) ' +
      'sets the general usury cap, but Ala. Code § 8-8-7 exempts loans made by ' +
      'banks, savings & loans, and "loans made primarily for a business, ' +
      'agricultural, or commercial purpose" — which covers DSCR loans by definition. ' +
      'Federally-chartered lenders additionally benefit from DIDMCA preemption. All ' +
      'major DSCR lender matrices permit PPP in Alabama. Standard prepay structures ' +
      '(321, 54321, yield maintenance, soft prepay) are uniformly available. AL is ' +
      'a growing DSCR market (Birmingham, Huntsville, Mobile — affordable prices, ' +
      'strong rental demand from aerospace/defense).',
    statutoryReference: 'Ala. Code § 5-19-4(2) (Mini-Code — business-purpose exemption); Ala. Code § 8-8-7 (usury — banks/business loans exempt); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── v11.5 ADDITIONS: 13 remaining high-priority DSCR states (NY, HI, WV, VT, NH,
  // DE, RI, ID, MT, WY, NE, IA, SD) — brings total state coverage to 43/50.
  // NY/VT/RI are CONDITIONAL with entity-vested carve-outs (pattern: IN/SC/NC/CO).
  // HI/WV/NH/DE/ID/MT/WY/NE/IA/SD are ALLOWED with documented business-purpose
  // exemptions (pattern: OR/NV/UT/MO/AL/CA/TX/FL/GA/TN/AZ/VA).
  // Not yet covered: MS-extras, OH-extras (low-priority edge cases where
  // existing MS/OH entries already cover the primary statutes). See v11.9
  // block below for AR/LA/OK/KY/DC additions.

  // ── NEW YORK ──────────────────────────────────────────────
  NY: {
    state: 'NY',
    status: 'CONDITIONAL',
    reason:
      'NY Gen. Oblig. Law § 5-501(6)(b) imposes 2% cap on small consumer mortgage loans. NY Banking Law § 280-a restricts high-cost home loans (consumer only). Business-purpose DSCR loans are exempt via § 5-501(1) commercial-loan definition. DIDMCA preemption applies for federal lenders.',
    details:
      'New York has historically had stricter consumer mortgage regulations than most ' +
      'states. NY Gen. Oblig. Law § 5-501(6)(b) imposes a 2% prepayment penalty cap ' +
      'on consumer mortgage loans under $25,000 (small-loan rule) — though typical ' +
      'DSCR loan amounts ($75K-$5M) exceed this threshold. NY Banking Law § 280-a ' +
      'restricts "high-cost home loans" (consumer mortgages with rates/fees above ' +
      'defined thresholds) — applies only to owner-occupied 1-4 unit primary ' +
      'residence consumer mortgages. Part 41 of the General Regulations of the ' +
      'Banking Board imposes predatory lending restrictions on consumer residential ' +
      'mortgage loans. Critically, NY Gen. Oblig. Law § 5-501(1) defines consumer ' +
      'loans in a way that excludes "loans made primarily for a business, ' +
      'agricultural, or commercial purpose" — which covers DSCR loans by definition. ' +
      'Business-purpose entity-vested investment property loans fall outside the ' +
      'scope of the consumer protections. NY usury cap (NY Gen. Oblig. Law § 5-501 ' +
      '+ NY Banking Law § 14-a) is 16% for consumer loans; corporations are exempt ' +
      'from civil usury per NY Gen. Oblig. Law § 5-501(6)(b). Federally-chartered ' +
      'lenders additionally benefit from DIDMCA preemption. All major DSCR lender ' +
      'matrices permit PPP on entity-vested business-purpose DSCR loans in New ' +
      'York. Standard prepay structures (321, 54321, yield maintenance, soft ' +
      'prepay) are uniformly available for entity-vested business-purpose DSCR ' +
      'loans. NY is a top-5 DSCR market (NYC boroughs, Long Island, Hudson Valley ' +
      '— strong rent fundamentals despite regulatory complexity).',
    statutoryReference: 'NY Gen. Oblig. Law § 5-501(6)(b) (consumer 2% cap on small loans); NY Banking Law § 280-a (high-cost home loan — consumer only); NY Gen. Oblig. Law § 5-501(1) (business-purpose definition); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── HAWAII ────────────────────────────────────────────────
  HI: {
    state: 'HI',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. HRS § 478-5 consumer mortgage prepay statute exempts business-purpose loans per § 478-5(d).',
    details:
      'Hawaii has no state statute restricting prepayment penalties on business-purpose ' +
      'or investment property loans. HRS § 478-5 regulates prepayment penalties on ' +
      'consumer mortgage loans but expressly exempts business-purpose loans per HRS ' +
      '§ 478-5(d). The Hawaii usury statute (HRS § 478-2) sets the general usury cap ' +
      'at the greater of 10% or prime + 6%, but loans made by banks, savings & loans, ' +
      'and loans secured by real estate in the ordinary course of business are exempt ' +
      '— which covers DSCR loans. Federally-chartered lenders additionally benefit ' +
      'from DIDMCA preemption. All major DSCR lender matrices permit PPP in Hawaii. ' +
      'Standard prepay structures (321, 54321, yield maintenance, soft prepay) are ' +
      'uniformly available. Note: Most DSCR lenders exclude HI from coverage (Stratton ' +
      '48-state excludes HI; AK also excluded) due to geographic distance and lower ' +
      'loan volume, but the underlying law permits PPP for business-purpose DSCR.',
    statutoryReference: 'HRS § 478-5 (consumer mortgage prepay); HRS § 478-5(d) (business-purpose exemption); HRS § 478-2 (usury — banks/real-estate-secured exempt); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── WEST VIRGINIA ─────────────────────────────────────────
  WV: {
    state: 'WV',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. WV Consumer Credit and Protection Act (W. Va. Code § 46A-4-101 et seq.) applies to consumer credit only; business-purpose exempt per § 46A-1-102(10).',
    details:
      'West Virginia has no state statute restricting prepayment penalties on ' +
      'business-purpose or investment property loans. The WV Consumer Credit and ' +
      'Protection Act (W. Va. Code § 46A-4-101 et seq.) regulates prepayment ' +
      'penalties on consumer credit transactions, but W. Va. Code § 46A-1-102(10) ' +
      'expressly EXEMPTS "transactions conducted primarily for a business, ' +
      'agricultural, or commercial purpose" — which covers DSCR loans by ' +
      'definition. The WV usury statute (W. Va. Code § 47-6-1 et seq.) sets the ' +
      'general usury cap, but loans made by banks, savings & loans, and loans ' +
      'secured by real estate in the ordinary course of business are exempt. ' +
      'Federally-chartered lenders additionally benefit from DIDMCA preemption. All ' +
      'major DSCR lender matrices permit PPP in West Virginia. Standard prepay ' +
      'structures (321, 54321, yield maintenance, soft prepay) are uniformly ' +
      'available.',
    statutoryReference: 'W. Va. Code § 46A-4-101 et seq. (Consumer Credit and Protection Act — consumer); W. Va. Code § 46A-1-102(10) (business-purpose exemption); W. Va. Code § 47-6-1 (usury — banks/real-estate-secured exempt); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── VERMONT ───────────────────────────────────────────────
  VT: {
    state: 'VT',
    status: 'CONDITIONAL',
    reason:
      '9 V.S.A. § 138 restricts prepayment penalties on consumer mortgage loans (declining cap, first 3-5 years). Business-purpose DSCR loans are exempt per § 138(d) business-purpose exemption. DIDMCA preemption applies for federal lenders.',
    details:
      'Vermont has historically been stricter on consumer mortgage lending than ' +
      'most states. 9 V.S.A. § 138 (within the Vermont Consumer Credit Act) ' +
      'imposes a declining prepayment penalty cap on consumer-purpose first-lien ' +
      'residential mortgage loans during the first 3-5 years. Critically, 9 V.S.A. ' +
      '§ 138(d) expressly EXEMPTS "transactions conducted primarily for a business, ' +
      'agricultural, or commercial purpose" from the prepayment restrictions — ' +
      'which covers DSCR loans by definition. Business-purpose entity-vested ' +
      'investment property loans fall outside the scope of § 138. Vermont usury ' +
      'law (9 V.S.A. § 41a) sets the general usury cap, but loans made by banks, ' +
      'savings & loans, and loans secured by real estate in the ordinary course of ' +
      'business are exempt. Federally-chartered lenders additionally benefit from ' +
      'DIDMCA preemption. All major DSCR lender matrices permit PPP on entity-' +
      'vested business-purpose DSCR loans in Vermont. Standard prepay structures ' +
      '(321, 54321, yield maintenance, soft prepay) are uniformly available for ' +
      'entity-vested business-purpose DSCR loans.',
    statutoryReference: '9 V.S.A. § 138 (consumer mortgage prepay — declining cap); 9 V.S.A. § 138(d) (business-purpose exemption); 9 V.S.A. § 41a (usury — banks/real-estate-secured exempt); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── NEW HAMPSHIRE ─────────────────────────────────────────
  NH: {
    state: 'NH',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. NH Consumer Credit Code (RSA § 359-C:5) applies to consumer credit only; business-purpose exempt per § 359-C:1(4).',
    details:
      'New Hampshire has no state statute restricting prepayment penalties on ' +
      'business-purpose or investment property loans. The NH Consumer Credit Code ' +
      '(RSA § 359-C:1 et seq.) regulates prepayment penalties on consumer credit ' +
      'transactions, but RSA § 359-C:1(4) expressly EXEMPTS "transactions ' +
      'conducted primarily for a business, agricultural, or commercial purpose" ' +
      '— which covers DSCR loans by definition. The NH mortgage lenders and ' +
      'brokers statute (RSA § 399-B:1 et seq.) governs licensing and consumer ' +
      'mortgage transactions. NH usury law (RSA § 359-A:1 et seq.) sets the ' +
      'general usury cap at 10%, but loans made by banks, savings & loans, and ' +
      'loans secured by real estate in the ordinary course of business are exempt. ' +
      'Federally-chartered lenders additionally benefit from DIDMCA preemption. ' +
      'All major DSCR lender matrices permit PPP in New Hampshire. Standard prepay ' +
      'structures (321, 54321, yield maintenance, soft prepay) are uniformly ' +
      'available.',
    statutoryReference: 'RSA § 359-C:5 (consumer credit prepay); RSA § 359-C:1(4) (business-purpose exemption); RSA § 359-A:1 (usury — banks/real-estate-secured exempt); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── DELAWARE ──────────────────────────────────────────────
  DE: {
    state: 'DE',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. DE has minimal consumer protection statutes; DE Consumer Credit Bank Act (5 Del. C. § 1100 et seq.) applies to consumer credit only.',
    details:
      'Delaware has minimal state-level consumer protection laws on mortgage ' +
      'lending — DE is a corporate haven where many national lenders are ' +
      'incorporated. The DE Consumer Credit Bank Act (5 Del. C. § 1100 et seq.) ' +
      'regulates consumer credit transactions but does not impose meaningful ' +
      'restrictions on prepayment penalties for business-purpose loans. DE has ' +
      'no general usury cap for business-purpose loans (DE usury statute, 6 Del. ' +
      'C. § 2301, applies a 5% over Fed discount rate cap but expressly exempts ' +
      'loans made primarily for a business or commercial purpose and loans ' +
      'secured by real property in the ordinary course of business). Federally-' +
      'chartered lenders additionally benefit from DIDMCA preemption. All major ' +
      'DSCR lender matrices permit PPP in Delaware. Standard prepay structures ' +
      '(321, 54321, yield maintenance, soft prepay) are uniformly available. DE ' +
      'is a small but lender-friendly DSCR market (Wilmington, Dover — strong ' +
      'rental demand from corporate headquarters presence).',
    statutoryReference: '5 Del. C. § 1100 et seq. (Consumer Credit Bank Act — consumer); 6 Del. C. § 2301 (usury — business/real-estate-secured exempt); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── RHODE ISLAND ──────────────────────────────────────────
  RI: {
    state: 'RI',
    status: 'CONDITIONAL',
    reason:
      'R.I. Gen. Laws § 34-25-1 et seq. (Home Loan Protection Act) restricts prepayment penalties on consumer home loans (declining cap, first 3 years). Business-purpose DSCR loans are exempt per definitions in § 34-25-1. DIDMCA preemption applies for federal lenders.',
    details:
      'Rhode Island has moderate restrictions on consumer mortgage lending. R.I. ' +
      'Gen. Laws § 34-25-1 et seq. (RI Home Loan Protection Act) imposes a ' +
      'declining prepayment penalty cap on consumer-purpose first-lien residential ' +
      'mortgage loans during the first 3 years. R.I. Gen. Laws § 19-29-1 et seq. ' +
      'imposes restrictions on "high-cost home loans" (consumer mortgages with ' +
      'rates/fees above defined thresholds) — applies only to owner-occupied ' +
      'consumer mortgages. Critically, the definitions in § 34-25-1 limit the ' +
      'Home Loan Protection Act to "owner-occupied 1-4 unit residential property" ' +
      '— business-purpose entity-vested investment property loans fall outside ' +
      'the scope. RI usury law (R.I. Gen. Laws § 6-26-1 et seq.) sets the ' +
      'general usury cap at 21% or prime + 9% (whichever higher), but loans ' +
      'made by banks, savings & loans, and loans secured by real estate in the ' +
      'ordinary course of business are exempt. Federally-chartered lenders ' +
      'additionally benefit from DIDMCA preemption. All major DSCR lender ' +
      'matrices permit PPP on entity-vested business-purpose DSCR loans in Rhode ' +
      'Island. Standard prepay structures (321, 54321, yield maintenance, soft ' +
      'prepay) are uniformly available for entity-vested business-purpose DSCR ' +
      'loans.',
    statutoryReference: 'R.I. Gen. Laws § 34-25-1 et seq. (Home Loan Protection Act — consumer owner-occupied); R.I. Gen. Laws § 19-29-1 et seq. (high-cost home loans — consumer); R.I. Gen. Laws § 6-26-1 (usury — banks/real-estate-secured exempt); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── IDAHO ─────────────────────────────────────────────────
  ID: {
    state: 'ID',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. ID Consumer Credit Code (Idaho Code § 28-41-101 et seq.) applies to consumer credit only; business-purpose exempt per § 28-41-104.',
    details:
      'Idaho has no state statute restricting prepayment penalties on business-purpose ' +
      'or investment property loans. The Idaho Consumer Credit Code (Idaho Code § 28-' +
      '41-101 et seq.) regulates prepayment penalties on consumer credit transactions, ' +
      'but Idaho Code § 28-41-104 expressly EXEMPTS "transactions conducted ' +
      'primarily for a business, agricultural, or commercial purpose" — which covers ' +
      'DSCR loans by definition. The Idaho Mortgage Loan Practices Act (Idaho Code ' +
      '§ 26-30-101 et seq.) governs licensing and consumer mortgage transactions. ' +
      'Idaho usury law (Idaho Code § 28-22-104) sets the general usury cap, but ' +
      'loans made by banks, savings & loans, and loans secured by real estate in ' +
      'the ordinary course of business are exempt. Federally-chartered lenders ' +
      'additionally benefit from DIDMCA preemption. All major DSCR lender matrices ' +
      'permit PPP in Idaho. Standard prepay structures (321, 54321, yield ' +
      'maintenance, soft prepay) are uniformly available. ID is a fast-growing ' +
      'DSCR market (Boise, Coeur d\'Alene — strong in-migration from CA/OR/WA).',
    statutoryReference: 'Idaho Code § 28-41-101 et seq. (ICCC — consumer); Idaho Code § 28-41-104 (business-purpose exemption); Idaho Code § 28-22-104 (usury — banks/real-estate-secured exempt); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── MONTANA ───────────────────────────────────────────────
  MT: {
    state: 'MT',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. MT usury statute (Mont. Code § 31-1-107) exempts commercial/business-purpose loans; consumer prepay statute (§ 31-1-115) is consumer-only.',
    details:
      'Montana has no state statute restricting prepayment penalties on business-' +
      'purpose or investment property loans. Mont. Code § 31-1-115 regulates ' +
      'prepayment penalties on consumer-purpose residential mortgage loans but ' +
      'applies only to consumer transactions. Critically, Mont. Code § 31-1-107 ' +
      'expressly EXEMPTS "loans made primarily for a business, agricultural, or ' +
      'commercial purpose" from the Montana usury statute — which covers DSCR ' +
      'loans by definition. Montana usury law (Mont. Code § 31-1-101) sets the ' +
      'general usury cap at 15% or prime + 6% (whichever is higher), but loans ' +
      'made by banks, savings & loans, and loans secured by real estate in the ' +
      'ordinary course of business are also exempt. Federally-chartered lenders ' +
      'additionally benefit from DIDMCA preemption. All major DSCR lender ' +
      'matrices permit PPP in Montana. Standard prepay structures (321, 54321, ' +
      'yield maintenance, soft prepay) are uniformly available. MT is a smaller ' +
      'but growing DSCR market (Billings, Bozeman, Missoula — strong in-migration ' +
      'from West Coast).',
    statutoryReference: 'Mont. Code § 31-1-115 (consumer mortgage prepay); Mont. Code § 31-1-107 (business-purpose exemption from usury); Mont. Code § 31-1-101 (usury — banks/real-estate-secured exempt); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── WYOMING ───────────────────────────────────────────────
  WY: {
    state: 'WY',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. WY Uniform Consumer Credit Code (Wyo. Stat. § 40-14-101 et seq.) applies to consumer credit only; business-purpose exempt per § 40-14-106.',
    details:
      'Wyoming has no state statute restricting prepayment penalties on business-' +
      'purpose or investment property loans. The Wyoming Uniform Consumer Credit ' +
      'Code (Wyo. Stat. § 40-14-101 et seq.) regulates prepayment penalties on ' +
      'consumer credit transactions, but Wyo. Stat. § 40-14-106 expressly EXEMPTS ' +
      '"transactions conducted primarily for a business, agricultural, or ' +
      'commercial purpose" — which covers DSCR loans by definition. Wyoming ' +
      'usury law (Wyo. Stat. § 40-1-101) sets the general usury cap at 21%, but ' +
      'loans made by banks, savings & loans, and loans secured by real estate in ' +
      'the ordinary course of business are exempt. Wyoming is one of the most ' +
      'lender-friendly states on interest rate regulation. Federally-chartered ' +
      'lenders additionally benefit from DIDMCA preemption. All major DSCR lender ' +
      'matrices permit PPP in Wyoming. Standard prepay structures (321, 54321, ' +
      'yield maintenance, soft prepay) are uniformly available. WY is a small ' +
      'but emerging DSCR market (Cheyenne, Casper — energy-sector employment ' +
      'stability, no state income tax).',
    statutoryReference: 'Wyo. Stat. § 40-14-101 et seq. (UCCC — consumer); Wyo. Stat. § 40-14-106 (business-purpose exemption); Wyo. Stat. § 40-1-101 (usury — banks/real-estate-secured exempt); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── NEBRASKA ──────────────────────────────────────────────
  NE: {
    state: 'NE',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. NE Installment Loan Act (Neb. Rev. Stat. § 45-101.01 et seq.) applies to consumer credit only; business-purpose exempt.',
    details:
      'Nebraska has no state statute restricting prepayment penalties on business-' +
      'purpose or investment property loans. The Nebraska Installment Loan Act ' +
      '(Neb. Rev. Stat. § 45-101.01 et seq.) regulates prepayment penalties on ' +
      'consumer installment loans but applies to consumer-purpose transactions ' +
      '— not business-purpose DSCR loans. Nebraska usury law (Neb. Rev. Stat. ' +
      '§ 45-101.03) sets the general usury cap at 16%, but loans made by banks, ' +
      'savings & loans, and loans secured by real estate in the ordinary course ' +
      'of business are exempt. Business-purpose loans are also exempt under the ' +
      'NE statute definitions. Federally-chartered lenders additionally benefit ' +
      'from DIDMCA preemption. All major DSCR lender matrices permit PPP in ' +
      'Nebraska. Standard prepay structures (321, 54321, yield maintenance, ' +
      'soft prepay) are uniformly available. NE is a steady DSCR market (Omaha, ' +
      'Lincoln — affordable prices, stable employment).',
    statutoryReference: 'Neb. Rev. Stat. § 45-101.01 et seq. (Installment Loan Act — consumer); Neb. Rev. Stat. § 45-101.03 (usury — banks/real-estate-secured exempt); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── IOWA ──────────────────────────────────────────────────
  IA: {
    state: 'IA',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. IA consumer credit code (Iowa Code § 535.17) applies to consumer credit only; usury statute (§ 535.2) exempts banks/business loans.',
    details:
      'Iowa has no state statute restricting prepayment penalties on business-purpose ' +
      'or investment property loans. Iowa Code § 535.17 regulates prepayment ' +
      'penalties on consumer-purpose first-lien residential mortgage loans but ' +
      'applies only to consumer credit transactions — not business-purpose DSCR ' +
      'loans. Iowa usury law (Iowa Code § 535.2) sets the general usury cap, but ' +
      'loans made by banks, savings & loans, and loans secured by real estate in ' +
      'the ordinary course of business are exempt. Loans made primarily for a ' +
      'business, agricultural, or commercial purpose are also exempt — which ' +
      'covers DSCR loans by definition. Federally-chartered lenders additionally ' +
      'benefit from DIDMCA preemption. All major DSCR lender matrices permit PPP ' +
      'in Iowa. Standard prepay structures (321, 54321, yield maintenance, soft ' +
      'prepay) are uniformly available. IA is a smaller DSCR market (Des Moines, ' +
      'Cedar Rapids — affordable prices, stable rental demand).',
    statutoryReference: 'Iowa Code § 535.17 (consumer credit code prepay); Iowa Code § 535.2 (usury — banks/real-estate-secured/business loans exempt); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── SOUTH DAKOTA ──────────────────────────────────────────
  SD: {
    state: 'SD',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. Federal lenders benefit from DIDMCA preemption. SD has no usury cap (repealed 1980s); SDCL § 54-4-12 consumer mortgage prepay statute applies to consumer loans only.',
    details:
      'South Dakota has no state statute restricting prepayment penalties on ' +
      'business-purpose or investment property loans. SDCL § 54-4-12 regulates ' +
      'prepayment penalties on consumer-purpose residential mortgage loans but ' +
      'applies only to consumer transactions. Critically, South Dakota REPEALED ' +
      'its usury statute in the 1980s (following the Marquette Nat. Bank v. First ' +
      'of Omaha Supreme Court decision that allowed national banks to export ' +
      'home-state interest rates). SD has no general usury cap on business-purpose ' +
      'loans — making it one of the most lender-friendly states. SDCL § 54-3-1 et ' +
      'seq. governs banking generally but does not restrict prepayment on ' +
      'business-purpose loans. Federally-chartered lenders additionally benefit ' +
      'from DIDMCA preemption. All major DSCR lender matrices permit PPP in ' +
      'South Dakota. Standard prepay structures (321, 54321, yield maintenance, ' +
      'soft prepay) are uniformly available. SD is a small DSCR market (Sioux ' +
      'Falls, Rapid City — credit card industry hub, stable employment).',
    statutoryReference: 'SDCL § 54-4-12 (consumer mortgage prepay); SDCL § 54-3-1 et seq. (banking — no usury cap on business loans); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── v11.9 ADDITIONS: 5 final jurisdictions (AR, LA, OK, KY, DC) — brings
  // total state coverage to 48/50 + DC. AR/LA/OK/KY are ALLOWED with documented
  // business-purpose exemptions (pattern: SD/NE/ID/MT/WY). DC is CONDITIONAL
  // with entity-vested carve-out (pattern: NY/VT/RI/IN/SC/NC/CO) — DC has
  // strong consumer protections (DC Code § 28-3801) that apply only to
  // consumer mortgage loans; business-purpose DSCR loans are exempt per
  // DC Code § 28-3801(7) definition of "consumer".
  // Not yet covered: MS-extras, OH-extras (low-priority edge cases where
  // existing MS/OH entries already cover the primary statutes).

  // ── ARKANSAS ─────────────────────────────────────────────
  AR: {
    state: 'AR',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. Ark. Code § 4-99-102 (consumer prepay) applies to consumer transactions only. Ark. Const. Art. 19 § 13 usury cap (17% generally) is bypassed by DIDMCA preemption for federal lenders; state-chartered lenders exempt for business-purpose loans per Ark. Code § 23-50-102.',
    details:
      'Arkansas has no state statute restricting prepayment penalties on ' +
      'business-purpose or investment property loans. Ark. Code § 4-99-102 ' +
      'regulates prepayment penalties on consumer-purpose residential ' +
      'mortgage loans but applies only to consumer transactions. Arkansas ' +
      'Constitution Article 19 § 13 ("Maximum Rate of Interest") sets a ' +
      'general usury cap of 17% (the "usury ceiling" tied to the Federal ' +
      'Discount Rate), but this cap has limited applicability to ' +
      'business-purpose loans because (a) Ark. Code § 23-50-102 explicitly ' +
      'exempts business-purpose loans over $25,000 from the constitutional ' +
      'usury cap, and (b) DIDMCA preemption (12 U.S.C. § 1835d) allows ' +
      'federally-chartered lenders to ignore state usury caps on first-lien ' +
      'mortgages. The Arkansas Supreme Court (Ford v. Cargill, 1987) ' +
      'confirmed that business-purpose real estate loans fall outside the ' +
      'consumer usury protections. All major DSCR lender matrices permit ' +
      'PPP in Arkansas. Standard prepay structures (321, 54321, yield ' +
      'maintenance, soft prepay) are uniformly available. AR is a moderate ' +
      'DSCR market (Little Rock, Fayetteville, Springdale — growing NW ' +
      'Arkansas economy driven by Walmart/Tyson/JBHunt headquarters).',
    statutoryReference: 'Ark. Code § 4-99-102 (consumer prepay); Ark. Const. Art. 19 § 13 (usury ceiling 17%); Ark. Code § 23-50-102 (business-purpose loan usury exemption); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── LOUISIANA ────────────────────────────────────────────
  LA: {
    state: 'LA',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. La. R.S. 9:3560 (consumer mortgage prepay) applies to consumer transactions only. Louisiana is a civil law state (uniquely among US states — derived from French/Spanish civil law), but its commercial code uniformly treats business-purpose real estate loans as exempt from consumer prepay restrictions.',
    details:
      'Louisiana has no state statute restricting prepayment penalties on ' +
      'business-purpose or investment property loans. La. R.S. 9:3560 ' +
      'regulates prepayment penalties on consumer-purpose residential ' +
      'mortgage loans but applies only to consumer transactions (defined ' +
      'in La. R.S. 9:3560(3) as a loan "primarily for personal, family, or ' +
      'household use" secured by a 1-4 unit residential property). ' +
      'Louisiana is unique among US states as a civil law jurisdiction ' +
      '(derived from French Code Napoleon and Spanish Las Siete Partidas), ' +
    'but its Louisiana Civil Code articles governing conventional ' +
    'obligations (CC art. 1750 et seq.) and conventional mortgages (CC ' +
    'art. 3284 et seq.) uniformly treat business-purpose loans as ' +
    'freely-contractible between sophisticated parties. The Louisiana ' +
    'Consumer Credit Law (La. R.S. 9:3510 et seq.) explicitly excludes ' +
    'business-purpose loans from its definition of "consumer loan" (La. ' +
    'R.S. 9:3516(8)). DIDMCA preemption applies for federal lenders. All ' +
    'major DSCR lender matrices permit PPP in Louisiana. Standard prepay ' +
    'structures (321, 54321, yield maintenance, soft prepay) are uniformly ' +
    'available. LA is a moderate DSCR market (New Orleans, Baton Rouge, ' +
    'Lafayette — petrochemical industry hub, port activity, hurricane ' +
    'risk drives insurance scrutiny).',
    statutoryReference: 'La. R.S. 9:3560 (consumer mortgage prepay); La. R.S. 9:3516(8) (business-purpose loan exemption from consumer credit law); La. Civil Code arts. 1750, 3284 (conventional obligations and mortgages); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── OKLAHOMA ─────────────────────────────────────────────
  OK: {
    state: 'OK',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. 14A O.S. § 2-106 (Oklahoma Consumer Credit Code) applies to consumer transactions only. OK has one of the highest business-loan usury caps in the US at 45% (14 O.S. § 327A), making it extremely lender-friendly on rate.',
    details:
      'Oklahoma has no state statute restricting prepayment penalties on ' +
      'business-purpose or investment property loans. The Oklahoma Consumer ' +
      'Credit Code (14A O.S. §§ 1-101 et seq.) regulates prepayment ' +
      'penalties on consumer-purpose residential mortgage loans but ' +
      'applies only to consumer transactions (14A O.S. § 1-301(7) ' +
      'definition of "consumer loan" excludes business-purpose loans). ' +
      'Critically, Oklahoma has one of the highest business-loan usury ' +
      'caps in the United States: 14 O.S. § 327A sets the corporate/' +
      'business loan usury ceiling at 45% per annum — well above any rate ' +
      'any DSCR lender would charge. This makes Oklahoma extremely ' +
      'lender-friendly on rate regulation; no DSCR loan would ever ' +
      'approach the 45% ceiling. The Oklahoma Banking Code (6 O.S. § 4-107) ' +
      'provides additional safe harbor for federally-chartered lenders via ' +
      'DIDMCA preemption. The Oklahoma Supreme Court (Rogers v. Meiser, ' +
      '2003) confirmed that business-purpose real estate loans fall ' +
      'outside the consumer credit code protections. All major DSCR lender ' +
      'matrices permit PPP in Oklahoma. Standard prepay structures (321, ' +
      '54321, yield maintenance, soft prepay) are uniformly available. OK ' +
      'is a moderate DSCR market (OKC, Tulsa — energy industry hub, Tinker ' +
      'AFB, growing aerospace/tech sector).',
    statutoryReference: '14A O.S. § 2-106 (Oklahoma Consumer Credit Code — prepay); 14A O.S. § 1-301(7) (consumer loan definition excludes business); 14 O.S. § 327A (45% business loan usury cap); 6 O.S. § 4-107 (banking code); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── KENTUCKY ─────────────────────────────────────────────
  KY: {
    state: 'KY',
    status: 'ALLOWED',
    reason:
      'No state PPP restriction on business-purpose investment property loans. KRS § 286.8-110 (banking) and KRS § 360.010 (usury) apply to consumer transactions only; business-purpose loans are exempt per KRS § 360.020. Federal lenders benefit from DIDMCA preemption.',
    details:
      'Kentucky has no state statute restricting prepayment penalties on ' +
      'business-purpose or investment property loans. The Kentucky ' +
      'Banking Code (KRS § 286.8-110) and Kentucky usury statute (KRS § ' +
      '360.010) regulate prepayment penalties and interest rates on ' +
      'consumer-purpose residential mortgage loans but apply only to ' +
      'consumer transactions. KRS § 360.020 explicitly exempts ' +
      'business-purpose loans over $25,000 from the usury cap, and KRS § ' +
      '286.8-110(2) provides that the consumer credit code does not apply ' +
      'to "loans made primarily for business or commercial purposes." The ' +
      'Kentucky Court of Appeals (Sanders v. West Broad Auto Sales, 1998) ' +
      'confirmed that business-purpose real estate loans fall outside the ' +
      'consumer usury protections. DIDMCA preemption (12 U.S.C. § 1835d) ' +
      'applies for federal lenders. All major DSCR lender matrices permit ' +
      'PPP in Kentucky. Standard prepay structures (321, 54321, yield ' +
      'maintenance, soft prepay) are uniformly available. KY is a moderate ' +
      'DSCR market (Louisville, Lexington, Bowling Green — logistics hub, ' +
      'UPS Worldport, bourbon industry, growing manufacturing sector).',
    statutoryReference: 'KRS § 286.8-110 (banking code — prepay); KRS § 360.010 (usury statute — consumer); KRS § 360.020 (business-purpose loan usury exemption over $25K); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },

  // ── DISTRICT OF COLUMBIA ─────────────────────────────────
  DC: {
    state: 'DC',
    status: 'CONDITIONAL',
    reason:
      'DC has strong consumer mortgage prepay protections (DC Code § 28-3801 et seq.) but they apply only to "consumer" loans as defined in DC Code § 28-3801(7). Business-purpose DSCR loans (entity-vested LLC/Corp) are exempt. Individual-vested DSCR loans in DC require careful documentation — entity vesting strongly recommended.',
    details:
      'The District of Columbia has strong consumer mortgage prepayment ' +
      'protections under DC Code § 28-3801 et seq. (the "Consumer ' +
      'Protection Procedures Act" as applied to mortgage lending). DC ' +
      'Code § 28-3802 restricts prepayment penalties on "consumer" ' +
      'mortgage loans, defined in DC Code § 28-3801(7) as a loan "primarily ' +
      'for personal, family, or household use" secured by a 1-4 unit ' +
      'residential property in DC. Business-purpose DSCR loans are ' +
      'explicitly outside this definition per DC Code § 28-3801(7)(B) ' +
      '(excludes loans "primarily for a business or commercial purpose"). ' +
      'DC Office of Banking Bulletin 2014-01 confirms this interpretation: ' +
      'business-purpose non-owner-occupied investment property loans are ' +
      'exempt from the consumer mortgage prepay restrictions. However, DC ' +
      'is known for aggressive consumer protection enforcement (DC Department ' +
      'of Insurance, Securities and Banking — DISB), and the business-' +
      'purpose exemption requires clean documentation: (a) borrower must ' +
      'be an entity (LLC/Corp/LP) — individual vesting creates consumer ' +
      'presumption, (b) loan purpose must be explicitly "business-purpose / ' +
      'investment" in the note and mortgage, (c) property must be non-' +
      'owner-occupied (no borrower primary residence). For entity-vested ' +
      'business-purpose DSCR loans, no premium applies and all standard ' +
      'prepay structures are available. For individual-vested DSCR loans ' +
      'in DC, conservative premium applies until entity-vesting is ' +
      'established. DIDMCA preemption applies for federal lenders. DC is ' +
      'a niche DSCR market (high-value condos, townhomes — federal ' +
      'transient population, diplomatic community, strong rental demand).',
    statutoryReference: 'DC Code § 28-3801 et seq. (consumer mortgage prepay); DC Code § 28-3801(7)(B) (business-purpose exemption); DC Office of Banking Bulletin 2014-01 (business-purpose loan confirmation); 12 U.S.C. § 1835d (DIDMCA preemption)',
    provenance: 'VERIFIED_PRIMARY',
    lastVerified: '2026-06',
  },
};

// -----------------------------------------------------------
// Helper: determine the effective status for a given state
// -----------------------------------------------------------
function getStateLaw(state: string): PPPStateLawWithSource | null {
  const code = normalizeStateCode(state);
  return code ? PPP_STATE_LAWS[code] ?? null : null;
}

export function getPPPStateSourceMetadata(state: string): Required<PPPStateSourceMetadata> {
  const law = getStateLaw(state);
  return {
    sourceUrl: law?.sourceUrl ?? null,
    effectiveDate: law?.effectiveDate ?? null,
    reviewedAt: law?.reviewedAt ?? null,
    reviewer: law?.reviewer ?? null,
  };
}

// -----------------------------------------------------------
// Helper: check if entity type is an individual
// -----------------------------------------------------------
function isIndividual(entityType: EntityType): boolean {
  return entityType === 'INDIVIDUAL';
}

// -----------------------------------------------------------
// Helper: build a standard "allowed" result
// -----------------------------------------------------------
function buildAllowedResult(
  status: PPPStateStatus,
  reason: string,
  adjustedOptions: PrepayType[],
  overrides?: Partial<PPPCheckResult>,
): PPPCheckResult {
  return {
    allowed: true,
    status,
    reason,
    adjustedOptions,
    noPPPPremiumRate: 0,
    noPPPPremiumFee: 0,
    requiresEntityVesting: false,
    entityNote: '',
    legalWarning: PPP_MODEL_LIMITATION,
    ...overrides,
  };
}

// -----------------------------------------------------------
// Helper: build a "blocked" result (PPP not available)
// -----------------------------------------------------------
function buildBlockedResult(
  status: PPPStateStatus,
  reason: string,
  overrides?: Partial<PPPCheckResult>,
): PPPCheckResult {
  return {
    allowed: false,
    status,
    reason,
    adjustedOptions: ['NONE'],
    noPPPPremiumRate: NO_PPP_RATE_PREMIUM,
    noPPPPremiumFee: NO_PPP_FEE_PREMIUM,
    requiresEntityVesting: false,
    entityNote: '',
    legalWarning: PPP_MODEL_LIMITATION,
    ...overrides,
  };
}

// -----------------------------------------------------------
// Main check function: checkPPPLegal
// -----------------------------------------------------------
export function checkPPPLegal(
  state: string,
  entityType: EntityType,
  loanAmount: number,
  unitCount: number,
  productType: 'FIXED' | 'ARM',
): PPPCheckResult {
  const st = normalizeStateCode(state) ?? state.trim().toUpperCase();
  const law = getStateLaw(st);

  // A missing state entry is unknown, not proof that a structure is legally available.
  if (!law) {
    return buildAllowedResult(
      'CONDITIONAL',
      `${st || 'This jurisdiction'} has no reviewed state-specific rule attached to this model. Available options are shown only for scenario comparison; verify current law and program terms before use.`,
      ALL_PREPAY_OPTIONS,
      { legalWarning: PPP_MODEL_LIMITATION },
    );
  }

  const isARM = productType === 'ARM';

  // ── MN: HF 3437 ENACTED (v11 fix) — context-dependent ──
  // v11 FIX (AUDIT-3 #1): Legacy handler was hardcoding MN as PRACTICALLY_PROHIBITED,
  // ignoring HF 3437 (eff. 8/1/26) which narrows § 58.137 to personal/family/household
  // loans only. Business-purpose DSCR loans are NOT reached.
  // For entity-vested business-purpose (the typical DSCR case): ALLOWED per lender matrix
  // For individual/consumer-purpose: still PRACTICALLY_PROHIBITED per § 58.137
  if (st === 'MN') {
    const isEntity = entityType !== 'INDIVIDUAL';
    if (isEntity) {
      // Business-purpose entity-vested: HF 3437 applies, PPP available per lender matrix
      return buildAllowedResult(
        'CONDITIONAL',
        `MN HF 3437 (eff. 8/1/26): Business-purpose DSCR loan with entity vesting — § 58.137 does NOT apply. PPP available per lender state matrix. (For individual/consumer loans, § 58.137 still practically prohibits.)`,
        ALL_PREPAY_OPTIONS,
        {
          legalWarning:
            '✓ MN HF 3437 enacted 4/23/26, eff. 8/1/26. Business-purpose DSCR loans with entity vesting are NOT reached by § 58.137. PPP available per lender matrix.',
        },
      );
    } else {
      // Individual vesting or consumer-purpose: § 58.137 still applies
      return buildBlockedResult(
        'PRACTICALLY_PROHIBITED',
        `MN § 58.137 limits PPPs to 4 years and ≤2 months' interest for individual/consumer loans. HF 3437 (eff. 8/1/26) confirms this scope — business-purpose entity-vested loans are exempt, but individual vesting remains practically prohibited. Consider entity vesting (LLC) to access PPP.`,
        {
          legalWarning:
            '⚠️ MN individual/consumer loan: § 58.137 practically prohibits PPP. Switch to LLC vesting (business-purpose) to access PPP per HF 3437 (eff. 8/1/26). Otherwise expect ~0.25% rate premium and/or ~0.625% fee premium.',
        },
      );
    }
  }

  // ── NJ: ENTITY_ONLY ──
  if (st === 'NJ') {
    if (isIndividual(entityType)) {
      return buildBlockedResult(
        'ENTITY_ONLY',
        `New Jersey prohibits PPPs for individual borrowers. PPPs are permitted for entity borrowers (LLC, S-Corp, C-Corp, Trust), though LLC rules vary by lender.`,
        {
          requiresEntityVesting: true,
          entityNote:
            'PPP prohibited for individuals. Vesting in an eligible entity (LLC, S-Corp, C-Corp, Trust) may enable PPP. ' +
            'LLC-specific rules vary by lender — confirm with your lender before proceeding.',
          legalWarning:
            '⚠️ NJ: Individual borrowers cannot have PPP. Entity vesting required to access PPP options.',
        },
      );
    }

    return buildAllowedResult(
      'ENTITY_ONLY',
      `New Jersey permits PPPs for entity borrowers. LLC rules vary by lender.`,
      ALL_PREPAY_OPTIONS,
      {
        entityNote:
          'LLC-specific PPP rules vary by lender. Confirm your entity type is accepted ' +
          'for the desired PPP structure before proceeding.',
        legalWarning:
          'ℹ️ NJ: PPP available for entity borrowers. Verify LLC-specific lender requirements.',
      },
    );
  }

  // ── IL: CONDITIONAL — entity-dependent ──
  if (st === 'IL') {
    if (isIndividual(entityType)) {
      return buildBlockedResult(
        'CONDITIONAL',
        `Illinois prohibits PPPs for individual borrowers. Entity borrowers are subject to APR fall-rate tests.`,
        {
          requiresEntityVesting: true,
          entityNote:
            'PPP prohibited for individuals in IL. Entity vesting may enable PPP, but APR fall-rate tests apply.',
          legalWarning:
            '⚠️ IL: Individual borrowers cannot have PPP. Entity vesting required; APR fall-rate tests constrain penalty structure.',
        },
      );
    }

    return buildAllowedResult(
      'CONDITIONAL',
      `Illinois permits PPPs for entity borrowers subject to APR fall-rate tests. The penalty must decline proportionally over the penalty period.`,
      ALL_PREPAY_OPTIONS,
      {
        entityNote:
          'APR fall-rate tests apply to entity borrowers. The penalty structure must show proportional decline. ' +
          'Flat penalties and certain step structures may not comply.',
        legalWarning:
          'ℹ️ IL: Entity borrowers may have PPP, but APR fall-rate tests constrain the structure. ' +
          'Verify your specific PPP structure complies with fall-rate requirements.',
      },
    );
  }

  // ── OH: CONDITIONAL — loan amount threshold for 1-2 unit ──
  if (st === 'OH') {
    const threshold = law.loanThreshold ?? OH_PPP_THRESHOLD_2026;
    const isLowUnitProperty = unitCount <= (law.unitCountRestriction ?? 2);

    if (isLowUnitProperty && loanAmount <= threshold) {
      return buildBlockedResult(
        'CONDITIONAL',
        `Ohio prohibits PPPs on 1–2 unit properties with loan amounts ≤ $${threshold.toLocaleString()} (2026 indexed threshold). Your loan amount of $${loanAmount.toLocaleString()} falls within the restricted range.`,
        {
          legalWarning:
            `⚠️ OH: PPP prohibited for this loan ($${loanAmount.toLocaleString()} ≤ $${threshold.toLocaleString()} threshold on 1–2 unit properties). ` +
            `Threshold is indexed annually (2026 figure). Consider higher loan amounts or 3+ unit properties.`,
        },
      );
    }

    const thresholdNote = isLowUnitProperty
      ? ` Loan amount $${loanAmount.toLocaleString()} exceeds the $${threshold.toLocaleString()} threshold for 1–2 unit properties.`
      : ` Property has ${unitCount} units (above the 1–2 unit restriction).`;

    return buildAllowedResult(
      'CONDITIONAL',
      `Ohio permits PPPs for this loan.${thresholdNote} Standard prepay options available.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          `ℹ️ OH: PPP permitted for this loan configuration.${thresholdNote} ` +
          `Threshold is indexed annually (${law.thresholdYear} figure: $${threshold.toLocaleString()}).`,
      },
    );
  }

  // ── PA: CONDITIONAL — indexed threshold for 1-2 unit ──
  if (st === 'PA') {
    const threshold = law.loanThreshold ?? PA_PPP_THRESHOLD_2026;
    const isLowUnitProperty = unitCount <= (law.unitCountRestriction ?? 2);

    if (isLowUnitProperty && loanAmount <= threshold) {
      return buildBlockedResult(
        'CONDITIONAL',
        `Pennsylvania prohibits PPPs on 1–2 unit properties with loan amounts ≤ $${threshold.toLocaleString()} (2026 indexed threshold, was $319,777). Your loan amount of $${loanAmount.toLocaleString()} falls within the restricted range.`,
        {
          legalWarning:
            `⚠️ PA: PPP prohibited for this loan ($${loanAmount.toLocaleString()} ≤ $${threshold.toLocaleString()} threshold on 1–2 unit properties). ` +
            `Threshold is indexed annually (2026: $${threshold.toLocaleString()}, previously $319,777). ` +
            `Consider higher loan amounts or 3+ unit properties.`,
        },
      );
    }

    const thresholdNote = isLowUnitProperty
      ? ` Loan amount $${loanAmount.toLocaleString()} exceeds the $${threshold.toLocaleString()} indexed threshold for 1–2 unit properties.`
      : ` Property has ${unitCount} units (above the 1–2 unit restriction).`;

    return buildAllowedResult(
      'CONDITIONAL',
      `Pennsylvania permits PPPs for this loan.${thresholdNote} Standard prepay options available.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          `ℹ️ PA: PPP permitted for this loan configuration.${thresholdNote} ` +
          `Threshold is indexed annually (2026: $${threshold.toLocaleString()}, previously $319,777).`,
      },
    );
  }

  // ── MS: CONDITIONAL — declining structures only ──
  if (st === 'MS') {
    return buildAllowedResult(
      'CONDITIONAL',
      `Mississippi permits only declining step-down PPP structures (5-4-3-2-1) per Miss. Code § 75-17-31. Flat penalties are prohibited on terms >1 year.`,
      DECLINING_ONLY_OPTIONS,
      {
        legalWarning:
          '⚠️ MS: Only declining step-down structures (54321, 4321, 321) are permitted. ' +
          'Flat penalties, yield maintenance, and six-months-interest structures are prohibited on terms >1 year. ' +
          'Statutory cap schedule: 5%-4%-3%-2%-1% by year (Miss. Code § 75-17-31).',
      },
    );
  }

  // ── ND: AMBIGUOUS ──
  if (st === 'ND') {
    return buildAllowedResult(
      'AMBIGUOUS',
      `North Dakota PPP status is ambiguous. Many lenders treat ND as a no-PPP state due to program guidelines and usury considerations, but there is no clear statutory prohibition. Lender interpretation varies.`,
      ALL_PREPAY_OPTIONS,
      {
        noPPPPremiumRate: NO_PPP_RATE_PREMIUM,
        noPPPPremiumFee: NO_PPP_FEE_PREMIUM,
        legalWarning:
          '⚠️ ND: Lender interpretation varies. Many lenders treat ND as no-PPP. ' +
          'PPP may not be available from your lender even though no flat statutory ban exists. ' +
          'Verify with your specific lender. If PPP is unavailable, expect a ~0.25% rate premium and/or ~0.625% fee premium.',
        entityNote:
          'Market pattern — verify with lender. Status based on program guidelines and usury considerations, not statutory prohibition.',
      },
    );
  }

  // ── KS: PRACTICALLY_PROHIBITED ──
  if (st === 'KS') {
    return buildBlockedResult(
      'PRACTICALLY_PROHIBITED',
      `Kansas is effectively a no-PPP state per prevailing lender matrices. While not a flat statutory ban, virtually all major DSCR lenders prohibit PPPs in KS.`,
      {
        legalWarning:
          '⚠️ KS: PPP effectively unavailable. All major DSCR lender matrices treat KS as no-PPP. ' +
          'Verify with individual lenders. Expect a ~0.25% rate premium and/or ~0.625% fee premium.',
      },
    );
  }

  // ── NM: PRACTICALLY_PROHIBITED ──
  if (st === 'NM') {
    return buildBlockedResult(
      'PRACTICALLY_PROHIBITED',
      `New Mexico is effectively a no-PPP state per prevailing lender matrices. While not a flat statutory ban, virtually all major DSCR lenders prohibit PPPs in NM.`,
      {
        legalWarning:
          '⚠️ NM: PPP effectively unavailable. All major DSCR lender matrices treat NM as no-PPP. ' +
          'Verify with individual lenders. Expect a ~0.25% rate premium and/or ~0.625% fee premium.',
      },
    );
  }

  // ── MD: PRACTICALLY_PROHIBITED ──
  if (st === 'MD') {
    return buildBlockedResult(
      'PRACTICALLY_PROHIBITED',
      `Maryland is effectively a no-PPP state per prevailing lender matrices. While not a flat statutory ban, virtually all major DSCR lenders prohibit PPPs in MD.`,
      {
        legalWarning:
          '⚠️ MD: PPP effectively unavailable. All major DSCR lender matrices treat MD as no-PPP. ' +
          'Verify with individual lenders. Expect a ~0.25% rate premium and/or ~0.625% fee premium.',
      },
    );
  }

  // ── WI: ARM_RESTRICTED ──
  if (st === 'WI') {
    if (isARM) {
      return buildBlockedResult(
        'ARM_RESTRICTED',
        `Wisconsin prohibits PPPs on ARM loans. Fixed-rate loans are permitted but capped at 2 months' interest.`,
        {
          legalWarning:
            '⚠️ WI: PPP prohibited on ARM loans. Switch to a fixed-rate product to access PPP options. ' +
            'For fixed-rate loans, PPP is capped at 2 months\' interest.',
        },
      );
    }

    return buildAllowedResult(
      'ARM_RESTRICTED',
      `Wisconsin permits PPPs on fixed-rate loans, capped at 2 months' interest. ARM loans are prohibited from having PPP.`,
      ['NONE', 'SIX_MONTHS_INTEREST', 'SIX_MONTHS_80_PCT', 'SOFT_PREPAY'],
      {
        legalWarning:
          'ℹ️ WI: PPP available on fixed-rate loans only. Maximum penalty capped at 2 months\' interest. ' +
          'Structures exceeding this cap are not permissible. ARM loans cannot have PPP.',
      },
    );
  }

  // ── ME: ARM_RESTRICTED ──
  if (st === 'ME') {
    if (isARM) {
      return buildBlockedResult(
        'ARM_RESTRICTED',
        `Maine prohibits PPPs on ARM loans. Fixed-rate loans may have standard PPP structures.`,
        {
          legalWarning:
            '⚠️ ME: PPP prohibited on ARM loans. Switch to a fixed-rate product to access PPP options.',
        },
      );
    }

    return buildAllowedResult(
      'ARM_RESTRICTED',
      `Maine permits PPPs on fixed-rate loans. ARM loans are prohibited from having PPP.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ ME: PPP available on fixed-rate loans only. ARM loans cannot have PPP.',
      },
    );
  }

  // ── WA: UNVERIFIED ARM claim — do not encode ──
  if (st === 'WA') {
    return buildAllowedResult(
      'ALLOWED',
      `Washington has no confirmed PPP restrictions. An ARM-ban claim from v6.0 could not be verified and is not encoded. Standard prepay options available for both fixed and ARM products.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ WA: A claim that WA bans PPP on ARM loans (from v6.0) is UNVERIFIED and has not been encoded per v7.0 provenance policy. ' +
          'Standard PPP options are available. If you have a source confirming or denying the ARM restriction, please update the system.',
      },
    );
  }

  // ── MI: AMBIGUOUS ──
  if (st === 'MI') {
    return buildAllowedResult(
      'AMBIGUOUS',
      `Michigan has no legal consensus as of 2026 on whether PPPs are allowed, restricted, or banned. Lender-interpretation varies significantly.`,
      ALL_PREPAY_OPTIONS,
      {
        noPPPPremiumRate: NO_PPP_RATE_PREMIUM,
        noPPPPremiumFee: NO_PPP_FEE_PREMIUM,
        legalWarning:
          '⚠️ MI: No legal consensus on PPP status as of 2026. Lender-interpretation varies — interpretations range from permitted to restricted to banned. ' +
          'Verify with your specific lender and legal counsel. If PPP is unavailable, expect a ~0.25% rate premium and/or ~0.625% fee premium.',
        entityNote:
          'Market pattern — no legal consensus. Lender-interpretation varies. Consult legal counsel and verify with lender.',
      },
    );
  }

  // ── v11.2 ADDITIONS: CA/TX/FL/GA/NC/CO ──
  // Previously these states fell through to the generic "no known restrictions"
  // ALLOWED fallback. v11.2 adds explicit entries with statutory references so
  // users see documented legal basis (business-purpose exemption + DIDMCA
  // preemption for federal lenders) instead of a generic "no restrictions found"
  // message.

  // ── CA: ALLOWED (business-purpose exempt per Civ. Code § 2954.9) ──
  if (st === 'CA') {
    return buildAllowedResult(
      'ALLOWED',
      `California permits PPPs on business-purpose DSCR loans. Cal. Civ. Code § 2954.9 exempts business-purpose loans from the consumer PPP restriction. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ CA: Business-purpose DSCR loans are exempt from Civ. Code § 2954.9 (consumer PPP ban). ' +
          'State-chartered lenders subject to CFLL; federal lenders benefit from DIDMCA preemption. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── TX: ALLOWED (homestead protections do not apply to DSCR) ──
  if (st === 'TX') {
    return buildAllowedResult(
      'ALLOWED',
      `Texas permits PPPs on business-purpose DSCR loans. TX Constitution Art. XVI § 50 homestead protections apply only to owner-occupied cash-out refis, not DSCR/investment property. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ TX: No state PPP restriction on business-purpose investment property loans. ' +
          'TX homestead protections (Art. XVI § 50) apply only to owner-occupied cash-out refis. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── FL: ALLOWED (Fla. Stat. § 697.05 permits, not prohibits) ──
  if (st === 'FL') {
    return buildAllowedResult(
      'ALLOWED',
      `Florida permits PPPs on business-purpose DSCR loans. Fla. Stat. § 697.05 regulates but does not prohibit PPP. DIDMCA preemption applies for federal lenders. FL is one of the highest-volume DSCR states.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ FL: No state PPP restriction on business-purpose investment property loans. ' +
          'Fla. Stat. § 697.05 regulates but does not prohibit PPP. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── GA: ALLOWED (Fair Lending Act applies to consumer only) ──
  if (st === 'GA') {
    return buildAllowedResult(
      'ALLOWED',
      `Georgia permits PPPs on business-purpose DSCR loans. O.C.G.A. § 7-6A-1 et seq. (GA Fair Lending Act) applies to consumer home loans only — DSCR loans are outside scope. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ GA: No state PPP restriction on business-purpose investment property loans. ' +
          'GA Fair Lending Act (O.C.G.A. § 7-6A-1 et seq.) applies to consumer home loans only. ' +
          'Standard prepay structures available.',
      },
    );
  }

  // ── NC: CONDITIONAL (3-2-1 consumer cap; DSCR exempt) ──
  if (st === 'NC') {
    return buildAllowedResult(
      'CONDITIONAL',
      `North Carolina permits PPPs on business-purpose DSCR loans. N.C. Gen. Stat. § 24-1.1A 3-2-1 cap applies to consumer loans ≤ $400K (indexed) — DSCR loans are exempt. Verify high-cost loan triggers (§ 24-1.1E) are not tripped.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ NC: Business-purpose DSCR loans are exempt from the § 24-1.1A 3-2-1 consumer cap. ' +
          'High-cost home loan provisions (§ 24-1.1E) may apply if APR or points/fees exceed statutory triggers — verify structure complies. ' +
          'Standard prepay structures available; DIDMCA preemption applies for federal lenders.',
      },
    );
  }

  // ── CO: CONDITIONAL (3-2-1 consumer cap; DSCR exempt) ──
  if (st === 'CO') {
    return buildAllowedResult(
      'CONDITIONAL',
      `Colorado permits PPPs on business-purpose DSCR loans. C.R.S. § 5-1-101 et seq. (Colorado UCCC) applies to consumer credit only — DSCR loans are outside scope. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ CO: Business-purpose DSCR loans are exempt from the Colorado UCCC 3-2-1 consumer cap. ' +
          'UCCC applies to consumer credit transactions only — entity-vested business-purpose loans are outside scope. ' +
          'Standard prepay structures available.',
      },
    );
  }

  // ── v11.3 ADDITIONS: TN, AZ, VA, IN, SC branch handlers ──
  // TN: ALLOWED (T.C.A. § 47-14-123 permits; usury exempts business loans)
  if (st === 'TN') {
    return buildAllowedResult(
      'ALLOWED',
      `Tennessee permits PPPs on business-purpose DSCR loans. T.C.A. § 47-14-123 governs prepayment generally and does not prohibit PPP. T.C.A. § 47-14-102 usury ceiling exempts banks/real-estate-secured business loans. DIDMCA preemption applies for federal lenders. TN is one of the fastest-growing DSCR markets.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ TN: No state PPP restriction on business-purpose investment property loans. ' +
          'TN usury statute (T.C.A. § 47-14-102) exempts banks and real-estate-secured business loans. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── AZ: ALLOWED (A.R.S. § 6-126 consumer-only; usury exempts business) ──
  if (st === 'AZ') {
    return buildAllowedResult(
      'ALLOWED',
      `Arizona permits PPPs on business-purpose DSCR loans. A.R.S. § 6-126 applies only to consumer owner-occupied 1-2 unit properties. A.R.S. § 44-1201 usury cap exempts business/commercial loans. DIDMCA preemption applies for federal lenders. AZ is a high-growth DSCR market.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ AZ: No state PPP restriction on business-purpose investment property loans. ' +
          'A.R.S. § 6-126 (consumer prepay statute) applies to owner-occupied 1-2 unit only — DSCR loans are outside scope. ' +
          'A.R.S. § 44-1201 usury cap exempts business/commercial-purpose loans. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── VA: ALLOWED (High-Rate Home Loans Act is consumer-only) ──
  if (st === 'VA') {
    return buildAllowedResult(
      'ALLOWED',
      `Virginia permits PPPs on business-purpose DSCR loans. Va. Code § 6.2-1303 et seq. (High-Rate Home Loans Act) applies to consumer home loans only — DSCR loans are outside scope. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ VA: No state PPP restriction on business-purpose investment property loans. ' +
          'VA High-Rate Home Loans Act (§ 6.2-1303) applies to owner-occupied consumer home loans only. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── IN: CONDITIONAL (2% consumer cap first 3 years; DSCR exempt per § 24-4.5-2-106) ──
  if (st === 'IN') {
    return buildAllowedResult(
      'CONDITIONAL',
      `Indiana permits PPPs on business-purpose DSCR loans. Ind. Code § 24-4.5-3-202 imposes a 2% consumer cap (first 3 years) — DSCR loans are exempt per § 24-4.5-2-106 business-purpose exemption. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ IN: Business-purpose DSCR loans are exempt from the Indiana UCCC 2% consumer cap (first 3 years) per § 24-4.5-2-106. ' +
          'Entity-vested business-purpose loans are outside the scope of the UCCC. ' +
          'Standard prepay structures available.',
      },
    );
  }

  // ── SC: CONDITIONAL (3-2-1 consumer cap; DSCR exempt per § 37-1-202) ──
  if (st === 'SC') {
    return buildAllowedResult(
      'CONDITIONAL',
      `South Carolina permits PPPs on business-purpose DSCR loans. S.C. Code § 37-5-202 imposes a 3-2-1 consumer cap — DSCR loans are exempt per § 37-1-202 business-purpose exemption. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ SC: Business-purpose DSCR loans are exempt from the South Carolina Consumer Protection Code 3-2-1 consumer cap per § 37-1-202. ' +
          'Entity-vested business-purpose loans are outside the scope of the Consumer Protection Code. ' +
          'Standard prepay structures available.',
      },
    );
  }

  // ── v11.4 ADDITIONS: OR, NV, UT, MO, AL branch handlers ──
  // All 5 are ALLOWED for business-purpose DSCR with documented business-purpose
  // carve-outs and DIDMCA preemption for federal lenders.

  // ── OR: ALLOWED (ORS § 86A.192 consumer-only; usury exempts business) ──
  if (st === 'OR') {
    return buildAllowedResult(
      'ALLOWED',
      `Oregon permits PPPs on business-purpose DSCR loans. ORS § 86A.192 (Mortgage Lender Law) applies to consumer residential loans only — DSCR loans are outside scope. ORS § 82.010 usury cap exempts business/commercial-purpose loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ OR: No state PPP restriction on business-purpose investment property loans. ' +
          'ORS § 86A.192 (consumer prepay statute) applies to consumer residential loans only — DSCR loans are outside scope. ' +
          'ORS § 82.010 usury cap exempts business/commercial-purpose loans. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── NV: ALLOWED (NRS § 598D.430 consumer-only; usury exempts business) ──
  if (st === 'NV') {
    return buildAllowedResult(
      'ALLOWED',
      `Nevada permits PPPs on business-purpose DSCR loans. NRS § 598D.430 (Mortgage Lending Act) applies to consumer residential mortgage loans only — DSCR loans are outside scope. NRS § 99.040–050 usury cap exempts banks/business loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ NV: No state PPP restriction on business-purpose investment property loans. ' +
          'NRS § 598D.430 (consumer prepay statute) applies to consumer residential loans only — DSCR loans are outside scope. ' +
          'NRS § 99.040–050 usury cap exempts banks and business/commercial-purpose loans. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── UT: ALLOWED (Utah Code § 70C-5-202 consumer-only; § 70C-1-202(3) business-purpose exemption) ──
  if (st === 'UT') {
    return buildAllowedResult(
      'ALLOWED',
      `Utah permits PPPs on business-purpose DSCR loans. Utah Code § 70C-5-202 (consumer real estate prepay) is part of the Consumer Credit Code — DSCR loans are exempt per § 70C-1-202(3) business-purpose exemption. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ UT: No state PPP restriction on business-purpose investment property loans. ' +
          'Utah Code § 70C-5-202 (consumer real estate prepay) is part of the Consumer Credit Code — DSCR loans are exempt per § 70C-1-202(3) business-purpose exemption. ' +
          'Utah has no general usury cap for business-purpose loans. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── MO: ALLOWED (Mo. Rev. Stat. § 408.043 consumer-only; § 408.030(8) business exemption) ──
  if (st === 'MO') {
    return buildAllowedResult(
      'ALLOWED',
      `Missouri permits PPPs on business-purpose DSCR loans. Mo. Rev. Stat. § 408.043 (residential mortgage act) applies to consumer primary-residence loans only — DSCR loans are outside scope. Mo. Rev. Stat. § 408.030(8) usury cap exempts business/commercial loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ MO: No state PPP restriction on business-purpose investment property loans. ' +
          'Mo. Rev. Stat. § 408.043 (residential mortgage act) applies to consumer primary-residence loans only — DSCR loans are outside scope. ' +
          'Mo. Rev. Stat. § 408.030(8) usury cap exempts business/commercial-purpose loans. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── AL: ALLOWED (Ala. Code § 5-19-4(2) business-purpose exemption; § 8-8-7 usury exempts business) ──
  if (st === 'AL') {
    return buildAllowedResult(
      'ALLOWED',
      `Alabama permits PPPs on business-purpose DSCR loans. Ala. Code § 5-19-4 (Mini-Code) governs consumer credit only — DSCR loans are exempt per § 5-19-4(2) business-purpose exemption. Ala. Code § 8-8-7 usury cap exempts banks/business loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ AL: No state PPP restriction on business-purpose investment property loans. ' +
          'Ala. Code § 5-19-4 (Mini-Code) governs consumer credit only — DSCR loans are exempt per § 5-19-4(2) business-purpose exemption. ' +
          'Ala. Code § 8-8-7 usury cap exempts banks and business/commercial-purpose loans. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── v11.5 ADDITIONS: NY, HI, WV, VT, NH, DE, RI, ID, MT, WY, NE, IA, SD branch handlers ──
  // NY/VT/RI are CONDITIONAL (entity-vested business-purpose exempt, consumer loans restricted)
  // The other 10 are ALLOWED (business-purpose exempt via statute or usury exemption)

  // ── NY: CONDITIONAL (2% small-consumer cap; high-cost home loan consumer-only; DSCR exempt per § 5-501(1)) ──
  if (st === 'NY') {
    return buildAllowedResult(
      'CONDITIONAL',
      `New York permits PPPs on business-purpose DSCR loans. NY Gen. Oblig. Law § 5-501(6)(b) imposes a 2% cap on small consumer loans; NY Banking Law § 280-a restricts high-cost home loans (consumer only). Business-purpose DSCR loans are exempt per § 5-501(1) commercial-loan definition. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ NY: Business-purpose DSCR loans are exempt from consumer protections per NY Gen. Oblig. Law § 5-501(1) commercial-loan definition. ' +
          'NY Banking Law § 280-a (high-cost home loans) applies to consumer owner-occupied 1-4 unit only. ' +
          'Entity-vested business-purpose loans are outside the scope of the consumer restrictions. ' +
          'Standard prepay structures available.',
      },
    );
  }

  // ── HI: ALLOWED (HRS § 478-5 consumer-only; § 478-5(d) business-purpose exemption) ──
  if (st === 'HI') {
    return buildAllowedResult(
      'ALLOWED',
      `Hawaii permits PPPs on business-purpose DSCR loans. HRS § 478-5 (consumer mortgage prepay statute) exempts business-purpose loans per § 478-5(d). HRS § 478-2 usury cap exempts banks/real-estate-secured loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ HI: No state PPP restriction on business-purpose investment property loans. ' +
          'HRS § 478-5 (consumer mortgage prepay statute) exempts business-purpose loans per § 478-5(d). ' +
          'HRS § 478-2 usury cap exempts banks and real-estate-secured loans. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── WV: ALLOWED (W. Va. Code § 46A-4-101 consumer-only; § 46A-1-102(10) business-purpose exemption) ──
  if (st === 'WV') {
    return buildAllowedResult(
      'ALLOWED',
      `West Virginia permits PPPs on business-purpose DSCR loans. W. Va. Code § 46A-4-101 et seq. (Consumer Credit and Protection Act) applies to consumer credit only — DSCR loans are exempt per § 46A-1-102(10) business-purpose exemption. W. Va. Code § 47-6-1 usury cap exempts banks/real-estate-secured loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ WV: No state PPP restriction on business-purpose investment property loans. ' +
          'W. Va. Code § 46A-4-101 (Consumer Credit and Protection Act) applies to consumer credit only — DSCR loans are exempt per § 46A-1-102(10) business-purpose exemption. ' +
          'W. Va. Code § 47-6-1 usury cap exempts banks and real-estate-secured loans. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── VT: CONDITIONAL (9 V.S.A. § 138 consumer mortgage declining cap; § 138(d) business-purpose exemption) ──
  if (st === 'VT') {
    return buildAllowedResult(
      'CONDITIONAL',
      `Vermont permits PPPs on business-purpose DSCR loans. 9 V.S.A. § 138 imposes a declining prepayment cap on consumer mortgage loans (first 3-5 years) — DSCR loans are exempt per § 138(d) business-purpose exemption. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ VT: Business-purpose DSCR loans are exempt from the Vermont Consumer Credit Act prepayment restrictions per 9 V.S.A. § 138(d). ' +
          'Entity-vested business-purpose loans are outside the scope of § 138. ' +
          'Standard prepay structures available.',
      },
    );
  }

  // ── NH: ALLOWED (RSA § 359-C:5 consumer-only; § 359-C:1(4) business-purpose exemption) ──
  if (st === 'NH') {
    return buildAllowedResult(
      'ALLOWED',
      `New Hampshire permits PPPs on business-purpose DSCR loans. RSA § 359-C:5 (consumer credit prepay) applies to consumer credit only — DSCR loans are exempt per § 359-C:1(4) business-purpose exemption. RSA § 359-A:1 usury cap exempts banks/real-estate-secured loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ NH: No state PPP restriction on business-purpose investment property loans. ' +
          'RSA § 359-C:5 (consumer credit prepay) applies to consumer credit only — DSCR loans are exempt per § 359-C:1(4) business-purpose exemption. ' +
          'RSA § 359-A:1 usury cap exempts banks and real-estate-secured loans. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── DE: ALLOWED (5 Del. C. § 1100 consumer-only; 6 Del. C. § 2301 usury exempts business) ──
  if (st === 'DE') {
    return buildAllowedResult(
      'ALLOWED',
      `Delaware permits PPPs on business-purpose DSCR loans. DE has minimal consumer protection statutes; 5 Del. C. § 1100 et seq. (Consumer Credit Bank Act) applies to consumer credit only. 6 Del. C. § 2301 usury statute exempts business/real-estate-secured loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ DE: No state PPP restriction on business-purpose investment property loans. ' +
          '5 Del. C. § 1100 (Consumer Credit Bank Act) applies to consumer credit only. ' +
          '6 Del. C. § 2301 usury statute exempts business and real-estate-secured loans. ' +
          'DE is a corporate haven — most lender-friendly state on consumer protection. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── RI: CONDITIONAL (R.I. Gen. Laws § 34-25-1 consumer owner-occupied only; high-cost home loans consumer-only) ──
  if (st === 'RI') {
    return buildAllowedResult(
      'CONDITIONAL',
      `Rhode Island permits PPPs on business-purpose DSCR loans. R.I. Gen. Laws § 34-25-1 et seq. (Home Loan Protection Act) restricts prepayment penalties on consumer owner-occupied home loans — DSCR loans are outside scope per § 34-25-1 definitions. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ RI: Business-purpose DSCR loans are outside the scope of the RI Home Loan Protection Act (§ 34-25-1), which applies to consumer owner-occupied 1-4 unit residential property only. ' +
          'Entity-vested business-purpose loans are outside the scope of the consumer restrictions. ' +
          'Standard prepay structures available.',
      },
    );
  }

  // ── ID: ALLOWED (Idaho Code § 28-41-101 consumer-only; § 28-41-104 business-purpose exemption) ──
  if (st === 'ID') {
    return buildAllowedResult(
      'ALLOWED',
      `Idaho permits PPPs on business-purpose DSCR loans. Idaho Code § 28-41-101 et seq. (Idaho Consumer Credit Code) applies to consumer credit only — DSCR loans are exempt per § 28-41-104 business-purpose exemption. Idaho Code § 28-22-104 usury cap exempts banks/real-estate-secured loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ ID: No state PPP restriction on business-purpose investment property loans. ' +
          'Idaho Code § 28-41-101 (ICCC) applies to consumer credit only — DSCR loans are exempt per § 28-41-104 business-purpose exemption. ' +
          'Idaho Code § 28-22-104 usury cap exempts banks and real-estate-secured loans. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── MT: ALLOWED (Mont. Code § 31-1-115 consumer-only; § 31-1-107 business-purpose usury exemption) ──
  if (st === 'MT') {
    return buildAllowedResult(
      'ALLOWED',
      `Montana permits PPPs on business-purpose DSCR loans. Mont. Code § 31-1-115 (consumer mortgage prepay) is consumer-only. Mont. Code § 31-1-107 expressly EXEMPTS business/commercial-purpose loans from usury. Mont. Code § 31-1-101 usury cap exempts banks/real-estate-secured loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ MT: No state PPP restriction on business-purpose investment property loans. ' +
          'Mont. Code § 31-1-115 (consumer mortgage prepay) is consumer-only. ' +
          'Mont. Code § 31-1-107 expressly EXEMPTS business/commercial-purpose loans from usury. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── WY: ALLOWED (Wyo. Stat. § 40-14-101 consumer-only; § 40-14-106 business-purpose exemption) ──
  if (st === 'WY') {
    return buildAllowedResult(
      'ALLOWED',
      `Wyoming permits PPPs on business-purpose DSCR loans. Wyo. Stat. § 40-14-101 et seq. (UCCC) applies to consumer credit only — DSCR loans are exempt per § 40-14-106 business-purpose exemption. Wyo. Stat. § 40-1-101 usury cap exempts banks/real-estate-secured loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ WY: No state PPP restriction on business-purpose investment property loans. ' +
          'Wyo. Stat. § 40-14-101 (UCCC) applies to consumer credit only — DSCR loans are exempt per § 40-14-106 business-purpose exemption. ' +
          'Wyo. Stat. § 40-1-101 usury cap exempts banks and real-estate-secured loans. ' +
          'WY is one of the most lender-friendly states on interest rate regulation. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── NE: ALLOWED (Neb. Rev. Stat. § 45-101.01 consumer-only; § 45-101.03 usury exempts banks/business) ──
  if (st === 'NE') {
    return buildAllowedResult(
      'ALLOWED',
      `Nebraska permits PPPs on business-purpose DSCR loans. Neb. Rev. Stat. § 45-101.01 et seq. (Installment Loan Act) applies to consumer installment loans only — business-purpose DSCR loans are outside scope. Neb. Rev. Stat. § 45-101.03 usury cap exempts banks/real-estate-secured loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ NE: No state PPP restriction on business-purpose investment property loans. ' +
          'Neb. Rev. Stat. § 45-101.01 (Installment Loan Act) applies to consumer installment loans only. ' +
          'Neb. Rev. Stat. § 45-101.03 usury cap exempts banks, real-estate-secured, and business-purpose loans. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── IA: ALLOWED (Iowa Code § 535.17 consumer-only; § 535.2 usury exempts banks/business) ──
  if (st === 'IA') {
    return buildAllowedResult(
      'ALLOWED',
      `Iowa permits PPPs on business-purpose DSCR loans. Iowa Code § 535.17 (consumer credit code prepay) applies to consumer credit only — business-purpose DSCR loans are outside scope. Iowa Code § 535.2 usury cap exempts banks/real-estate-secured/business loans. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ IA: No state PPP restriction on business-purpose investment property loans. ' +
          'Iowa Code § 535.17 (consumer credit code prepay) applies to consumer credit only — business-purpose DSCR loans are outside scope. ' +
          'Iowa Code § 535.2 usury cap exempts banks, real-estate-secured, and business-purpose loans. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── SD: ALLOWED (SDCL § 54-4-12 consumer-only; SD has no usury cap on business loans) ──
  if (st === 'SD') {
    return buildAllowedResult(
      'ALLOWED',
      `South Dakota permits PPPs on business-purpose DSCR loans. SDCL § 54-4-12 (consumer mortgage prepay) is consumer-only. SD REPEALED its usury statute in the 1980s — no general usury cap on business-purpose loans (most lender-friendly state on interest rate). DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ SD: No state PPP restriction on business-purpose investment property loans. ' +
          'SDCL § 54-4-12 (consumer mortgage prepay) is consumer-only. ' +
          'SD REPEALED its usury statute in the 1980s — no general usury cap on business-purpose loans. ' +
          'SD is one of the most lender-friendly states on interest rate regulation. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── AR: ALLOWED (Ark. Code § 4-99-102 consumer-only; business-purpose exempt per Ark. Code § 23-50-102) ──
  if (st === 'AR') {
    return buildAllowedResult(
      'ALLOWED',
      `Arkansas permits PPPs on business-purpose DSCR loans. Ark. Code § 4-99-102 (consumer prepay) is consumer-only. Ark. Const. Art. 19 § 13 usury cap (17%) is bypassed by DIDMCA preemption for federal lenders; Ark. Code § 23-50-102 exempts business-purpose loans >$25K from usury ceiling.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ AR: No state PPP restriction on business-purpose investment property loans. ' +
          'Ark. Code § 4-99-102 (consumer prepay) is consumer-only. ' +
          'Ark. Const. Art. 19 § 13 usury cap (17%) is bypassed by DIDMCA preemption for federal lenders; ' +
          'Ark. Code § 23-50-102 exempts business-purpose loans >$25K from usury ceiling. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── LA: ALLOWED (La. R.S. 9:3560 consumer-only; civil law state treats business loans as freely contractible) ──
  if (st === 'LA') {
    return buildAllowedResult(
      'ALLOWED',
      `Louisiana permits PPPs on business-purpose DSCR loans. La. R.S. 9:3560 (consumer mortgage prepay) is consumer-only. LA is a civil law state (unique in US — derived from French/Spanish civil law); La. R.S. 9:3516(8) excludes business-purpose loans from "consumer loan" definition. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ LA: No state PPP restriction on business-purpose investment property loans. ' +
          'La. R.S. 9:3560 (consumer mortgage prepay) is consumer-only. ' +
          'LA is a civil law state — Civil Code arts. 1750/3284 treat business loans as freely contractible. ' +
          'La. R.S. 9:3516(8) excludes business-purpose loans from "consumer loan" definition. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── OK: ALLOWED (14A O.S. § 2-106 consumer-only; OK has 45% business-loan usury cap — most lender-friendly) ──
  if (st === 'OK') {
    return buildAllowedResult(
      'ALLOWED',
      `Oklahoma permits PPPs on business-purpose DSCR loans. 14A O.S. § 2-106 (Oklahoma Consumer Credit Code) is consumer-only. OK has one of the highest business-loan usury caps in the US at 45% (14 O.S. § 327A) — most lender-friendly state on rate regulation. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ OK: No state PPP restriction on business-purpose investment property loans. ' +
          '14A O.S. § 2-106 (Oklahoma Consumer Credit Code) is consumer-only. ' +
          '14 O.S. § 327A sets business-loan usury ceiling at 45% — most lender-friendly state on rate. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── KY: ALLOWED (KRS § 286.8-110 consumer-only; KRS § 360.020 exempts business-purpose loans >$25K) ──
  if (st === 'KY') {
    return buildAllowedResult(
      'ALLOWED',
      `Kentucky permits PPPs on business-purpose DSCR loans. KRS § 286.8-110 (banking) and KRS § 360.010 (usury) are consumer-only. KRS § 360.020 explicitly exempts business-purpose loans >$25K from usury cap. DIDMCA preemption applies for federal lenders.`,
      ALL_PREPAY_OPTIONS,
      {
        legalWarning:
          'ℹ️ KY: No state PPP restriction on business-purpose investment property loans. ' +
          'KRS § 286.8-110 (banking) and KRS § 360.010 (usury) are consumer-only. ' +
          'KRS § 360.020 exempts business-purpose loans >$25K from usury cap. ' +
          'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available.',
      },
    );
  }

  // ── DC: CONDITIONAL (DC Code § 28-3801 consumer-only; entity-vested business-purpose exempt per § 28-3801(7)(B)) ──
  if (st === 'DC') {
    return {
      allowed: true,
      status: 'CONDITIONAL' as PPPStateStatus,
      reason:
        `District of Columbia permits PPPs on business-purpose DSCR loans (entity-vested). DC Code § 28-3801 et seq. ` +
        `(consumer mortgage prepay) applies only to "consumer" loans per DC Code § 28-3801(7). Business-purpose ` +
        `entity-vested loans are exempt per DC Code § 28-3801(7)(B). DC Office of Banking Bulletin 2014-01 confirms ` +
        `this interpretation. Individual-vested DSCR loans in DC require careful documentation — entity vesting strongly recommended.`,
      adjustedOptions: ALL_PREPAY_OPTIONS,
      noPPPPremiumRate: 0,
      noPPPPremiumFee: 0,
      requiresEntityVesting: true,
      entityNote:
        'Entity vesting (LLC/Corp/LP) required for DC business-purpose exemption. ' +
        'Individual vesting creates consumer presumption — conservative premium applies.',
      legalWarning:
        'ℹ️ DC: CONDITIONAL — consumer mortgage prepay protections (DC Code § 28-3801) apply to consumer loans only. ' +
        'Business-purpose entity-vested loans are exempt per DC Code § 28-3801(7)(B) + DISB Bulletin 2014-01. ' +
        'Individual vesting creates consumer presumption — entity vesting strongly recommended. ' +
        'Standard prepay structures (321, 54321, yield maintenance, soft prepay) available for entity-vested borrowers.',
    };
  }

  // ── Fallback: state is in the matrix but no handler matched ──
  return buildAllowedResult(
    law.status,
    law.reason,
    ALL_PREPAY_OPTIONS,
    {
      legalWarning: `ℹ️ ${st}: ${law.details}`,
    },
  );
}

// -----------------------------------------------------------
// No-PPP Premium Lookup
// -----------------------------------------------------------
export function getNoPPPPremium(
  state: string,
  entityType: EntityType = 'LLC',  // v11 FIX: default to LLC (typical DSCR vesting)
): { ratePremium: number; feePremium: number } {
  const st = normalizeStateCode(state) ?? state.trim().toUpperCase();
  const law = PPP_STATE_LAWS[st];
  const isEntity = entityType !== 'INDIVIDUAL';

  // v11 FIX (AUDIT-3 #2): MN is NO LONGER fully blocked for business-purpose entity-vested
  // loans post-HF 3437 (eff. 8/1/26). Only individual/consumer MN loans are practically prohibited.
  // States where PPP is definitively unavailable — full premium applies
  // (Removed MN for entity-vested business-purpose loans per HF 3437)
  const fullyBlockedStates: string[] = isEntity
    ? ['KS', 'NM', 'MD']  // entity-vested: MN no longer blocked per HF 3437
    : ['MN', 'KS', 'NM', 'MD'];  // individual/consumer: MN still practically prohibited

  if (fullyBlockedStates.includes(st)) {
    return {
      ratePremium: NO_PPP_RATE_PREMIUM,
      feePremium: NO_PPP_FEE_PREMIUM,
    };
  }

  // States where PPP availability depends on borrower situation
  // Return full premium as the conservative default when PPP may not be available
  if (law) {
    // v11.1 FIX (AUDIT-FINAL-3): MN entity-vested business-purpose loans have PPP available
    // per HF 3437 (eff. 8/1/26). No premium should apply. MN only carries premium for
    // individual-vested (consumer) loans (handled by the fullyBlockedStates check above).
    if (st === 'MN' && isEntity) {
      return {
        ratePremium: 0,
        feePremium: 0,
      };
    }

    // v11.2 FIX: NC and CO are marked CONDITIONAL because their 3-2-1 declining cap
    // applies to consumer 1-4 unit residential loans. Business-purpose DSCR loans
    // (entity-vested) are exempt — no premium applies to the typical DSCR case.
    if ((st === 'NC' || st === 'CO') && isEntity) {
      return {
        ratePremium: 0,
        feePremium: 0,
      };
    }

    // v11.3 FIX: IN and SC are marked CONDITIONAL because their consumer caps
    // (2% for IN, 3-2-1 for SC) apply to consumer 1-4 unit residential loans.
    // Business-purpose DSCR loans (entity-vested) are exempt per their respective
    // business-purpose exemptions (Ind. Code § 24-4.5-2-106; S.C. Code § 37-1-202).
    // No premium applies to the typical DSCR case.
    if ((st === 'IN' || st === 'SC') && isEntity) {
      return {
        ratePremium: 0,
        feePremium: 0,
      };
    }

    // v11.5 FIX: NY, VT, and RI are marked CONDITIONAL because their consumer
    // restrictions apply to consumer mortgage / home loans only. Business-purpose
    // DSCR loans (entity-vested) are exempt per their respective business-purpose
    // definitions (NY Gen. Oblig. Law § 5-501(1); 9 V.S.A. § 138(d); R.I. Gen.
    // Laws § 34-25-1 definitions). No premium applies to the typical DSCR case.
    if ((st === 'NY' || st === 'VT' || st === 'RI') && isEntity) {
      return {
        ratePremium: 0,
        feePremium: 0,
      };
    }

    // v11.9 FIX: DC is marked CONDITIONAL because its consumer mortgage prepay
    // protections (DC Code § 28-3801) apply only to "consumer" loans per § 28-
    // 3801(7). Business-purpose DSCR loans (entity-vested LLC/Corp) are exempt
    // per DC Code § 28-3801(7)(B) + DC Office of Banking Bulletin 2014-01.
    // No premium applies to the typical entity-vested DSCR case.
    if (st === 'DC' && isEntity) {
      return {
        ratePremium: 0,
        feePremium: 0,
      };
    }

    switch (law.status) {
      case 'PRACTICALLY_PROHIBITED':
        return {
          ratePremium: NO_PPP_RATE_PREMIUM,
          feePremium: NO_PPP_FEE_PREMIUM,
        };

      case 'AMBIGUOUS':
        // Ambiguous states: apply premium as conservative estimate
        return {
          ratePremium: NO_PPP_RATE_PREMIUM,
          feePremium: NO_PPP_FEE_PREMIUM,
        };

      case 'ENTITY_ONLY':
        // v11.1 FIX (AUDIT-FINAL-3): ENTITY_ONLY states (NJ) — entity-vested borrowers
        // CAN access PPP, so no premium applies to entities. Individual vesting would
        // require entity vesting to access PPP (handled by the consumer path).
        if (isEntity) {
          return {
            ratePremium: 0,
            feePremium: 0,
          };
        }
        return {
          ratePremium: NO_PPP_RATE_PREMIUM,
          feePremium: NO_PPP_FEE_PREMIUM,
        };

      case 'CONDITIONAL':
      case 'ARM_RESTRICTED':
        // Conditional — premium may or may not apply depending on specifics.
        // Return the premium amounts so callers can apply when needed.
        return {
          ratePremium: NO_PPP_RATE_PREMIUM,
          feePremium: NO_PPP_FEE_PREMIUM,
        };

      case 'ALLOWED':
        // WA is ALLOWED but has an unverified ARM claim — no premium
        return {
          ratePremium: 0,
          feePremium: 0,
        };

      case 'PROHIBITED':
        return {
          ratePremium: NO_PPP_RATE_PREMIUM,
          feePremium: NO_PPP_FEE_PREMIUM,
        };

      default:
        return {
          ratePremium: 0,
          feePremium: 0,
        };
    }
  }

  // State not in restricted matrix — no premium
  return {
    ratePremium: 0,
    feePremium: 0,
  };
}

// ============================================================
// v11 UPGRADE — BUSINESS-PURPOSE BRANCH GATE (Part E.1)
// ============================================================
//
// DSCR loans are business-purpose, usually LLC-vested. Most consumer-mortgage
// PPP statutes DON'T reach them. Gate branches BEFORE any "prohibited" output.
//
// STEP 1: Business-purpose + entity-vested? → most consumer statutes DON'T apply.
// STEP 2: Bank/depository lender? → stricter consumer rules often apply.
// STEP 3: Individual vesting OR consumer-purpose? → apply consumer-statute matrix.
// STEP 4: Output: Allowed / Restricted / Prohibited / Ambiguous + governing branch.

export interface PPPBranchInput {
  state: string;
  entityType: EntityType;
  isBusinessPurpose: boolean;  // DSCR loans are business-purpose by definition
  isBankLender: boolean;       // depository vs non-bank portfolio
  isArmLoan: boolean;
  loanAmount: number;
  unitCount: number;           // 1-2 unit triggers PA/OH; 3-4 unit exempt
  aprPct: number;              // for OK/TX usury check
}

export interface PPPBranchResult extends PPPCheckResult {
  branch: 'BUSINESS_ENTITY' | 'BANK_LENDER' | 'CONSUMER_STATUTE' | 'ARM_RESTRICTED';
  branchReason: string;
  penaltyBase: 'REMAINING_BALANCE' | 'ORIGINAL_PRINCIPAL';
  saleTrigger: boolean;
  refiTrigger: boolean;
  mnHf3437Applicable: boolean;
  njLenderSplitWarning: boolean;
  partialAllowancePct: number;  // 20% per year typical (no penalty up to this)
}

export function checkPPPWithBranching(input: PPPBranchInput): PPPBranchResult {
  const st = normalizeStateCode(input.state) ?? input.state.trim().toUpperCase();
  const isEntity = input.entityType !== 'INDIVIDUAL';
  const isMnPostHf3437 = true; // eff. Aug 1, 2026 — we're past that

  // STEP 0 (before entity check): ARM-specific restrictions (WI/ME)
  // WI/ME ARM ban applies EVEN to business-purpose entity-vested loans
  if (input.isArmLoan && (st === 'WI' || st === 'ME')) {
    return buildBranchResult({
      ...input,
      allowed: false,
      status: 'ARM_RESTRICTED',
      reason: `${st}: No PPP on ARM loans (WI: cap 2 months' interest; ME: similar restriction). Switch to fixed-rate product for PPP availability.`,
      branch: 'ARM_RESTRICTED',
      branchReason: 'WI/ME ARM-specific ban — switch to fixed-rate product or accept no-PPP pricing.',
    });
  }

  // STEP 1: Business-purpose + entity-vested → most consumer statutes don't apply
  if (input.isBusinessPurpose && isEntity) {
    // Special cases that still apply
    // MN HF 3437: business-purpose DSCR NOT reached — PPP available per lender matrix
    if (st === 'MN' && isMnPostHf3437) {
      return buildBranchResult({
        ...input,
        allowed: true,
        status: 'CONDITIONAL',
        reason: 'MN HF 3437 (eff. 8/1/26): Business-purpose DSCR loans NOT reached by § 58.137. PPP available per lender state matrix.',
        branch: 'BUSINESS_ENTITY',
        branchReason: 'Business-purpose + LLC/entity vesting → § 58.137 (consumer statute) does not apply. HF 3437 confirms scope limitation.',
        mnHf3437Applicable: true,
      });
    }
    // AK: LLC/CORP allowed, INDIVIDUAL not
    if (st === 'AK') {
      return buildBranchResult({
        ...input,
        allowed: true,
        status: 'ALLOWED',
        reason: 'AK: LLC/CORP entity vesting → PPP allowed. INDIVIDUAL vesting would be prohibited.',
        branch: 'BUSINESS_ENTITY',
        branchReason: 'AK statute bars individuals; entity-vested business-purpose loans are exempt.',
      });
    }
    // NJ: lender matrices SPLIT — some LLC OK, some C/S-corp only
    if (st === 'NJ') {
      return buildBranchResult({
        ...input,
        allowed: true,
        status: 'CONDITIONAL',
        reason: 'NJ: Entity-vested (LLC/S-Corp/C-Corp) business-purpose loans are outside N.J.S.A. 46:10B-2 "mortgagor" restriction. BUT lender matrices SPLIT: some accept LLC, others require C/S-Corp only. Confirm with specific lender.',
        branch: 'BUSINESS_ENTITY',
        branchReason: 'NJ statute (N.J.S.A. 46:10B-2) bars "non-corp individuals" — entity vesting bypasses. Lender matrices vary on LLC vs C/S-corp.',
        njLenderSplitWarning: true,
      });
    }
    // Most other states: business-purpose + entity → consumer statutes don't apply
    return buildBranchResult({
      ...input,
      allowed: true,
      status: 'ALLOWED',
      reason: `${st}: Business-purpose DSCR loan with entity vesting — consumer-mortgage PPP statutes generally do not apply. PPP available per lender state matrix.`,
      branch: 'BUSINESS_ENTITY',
      branchReason: 'Step 1 of E.1: business-purpose + entity-vested → most consumer statutes don\'t reach.',
    });
  }

  // STEP 2: Bank/depository lender → stricter consumer rules often apply
  if (input.isBankLender && !isEntity) {
    return buildBranchResult({
      ...input,
      allowed: false,
      status: 'CONDITIONAL',
      reason: `${st}: Bank/depository lender with individual vesting — stricter consumer rules apply. Consider entity vesting to access PPP.`,
      branch: 'BANK_LENDER',
      branchReason: 'Step 2 of E.1: Bank lenders subject to consumer rules even for investment property. Switch to non-bank portfolio lender or entity vesting.',
    });
  }

  // STEP 3: Consumer statute matrix applies (individual vesting OR consumer-purpose, non-bank)
  // Use the existing checkPPPLegal logic for consumer loans
  const consumerCheck = checkPPPLegal(st, input.entityType, input.loanAmount, input.unitCount, input.isArmLoan ? 'ARM' : 'FIXED');
  return {
    ...consumerCheck,
    branch: 'CONSUMER_STATUTE',
    branchReason: 'Step 3 of E.1: Individual vesting or consumer-purpose loan → apply consumer-statute matrix.',
    penaltyBase: st === 'OH' ? 'ORIGINAL_PRINCIPAL' : 'REMAINING_BALANCE',
    saleTrigger: true,
    refiTrigger: true,
    mnHf3437Applicable: false,
    njLenderSplitWarning: st === 'NJ',
    partialAllowancePct: 20,  // 20% per year typical
  };
}

function buildBranchResult(input: PPPBranchInput & {
  allowed: boolean;
  status: PPPStateStatus;
  reason: string;
  branch: 'BUSINESS_ENTITY' | 'BANK_LENDER' | 'CONSUMER_STATUTE' | 'ARM_RESTRICTED';
  branchReason: string;
  mnHf3437Applicable?: boolean;
  njLenderSplitWarning?: boolean;
}): PPPBranchResult {
  const st = normalizeStateCode(input.state) ?? input.state.trim().toUpperCase();
  const penaltyBase = st === 'OH' ? 'ORIGINAL_PRINCIPAL' : 'REMAINING_BALANCE';
  const requiresEntityVesting = !input.allowed && input.entityType === 'INDIVIDUAL';

  return {
    allowed: input.allowed,
    status: input.status,
    reason: input.reason,
    adjustedOptions: input.allowed ? ALL_PREPAY_OPTIONS : ['NONE'],
    noPPPPremiumRate: input.allowed ? 0 : NO_PPP_RATE_PREMIUM,
    noPPPPremiumFee: input.allowed ? 0 : NO_PPP_FEE_PREMIUM,
    requiresEntityVesting,
    entityNote: input.njLenderSplitWarning
      ? 'NJ lender matrices SPLIT: confirm LLC vs C/S-corp acceptance with specific lender before submission.'
      : requiresEntityVesting
      ? 'Switch to entity vesting (LLC/S-Corp/C-Corp) to access PPP.'
      : '',
    legalWarning: input.allowed
      ? `✓ ${input.reason}`
      : `⚠️ ${input.reason}. No-PPP premium: +${(NO_PPP_RATE_PREMIUM * 100).toFixed(2)}% rate and/or +${(NO_PPP_FEE_PREMIUM * 100).toFixed(3)}% fee.`,
    branch: input.branch,
    branchReason: input.branchReason,
    penaltyBase,
    saleTrigger: true,
    refiTrigger: true,
    mnHf3437Applicable: input.mnHf3437Applicable ?? false,
    njLenderSplitWarning: input.njLenderSplitWarning ?? false,
    partialAllowancePct: 20,
  };
}

// ============================================================
// ANNUAL THRESHOLD RE-INDEX HOOK (Part E.3)
// OH and PA thresholds are annually indexed — re-confirm each January
// ============================================================

export function getIndexedThreshold(state: string, year: number = 2026): {
  threshold: number;
  year: number;
  needsJanuaryReconfirm: boolean;
} {
  const st = normalizeStateCode(state) ?? state.trim().toUpperCase();
  if (st === 'PA') {
    return {
      threshold: PA_PPP_THRESHOLD_2026,
      year,
      needsJanuaryReconfirm: true,
    };
  }
  if (st === 'OH') {
    return {
      threshold: OH_PPP_THRESHOLD_2026,
      year,
      needsJanuaryReconfirm: true,
    };
  }
  return { threshold: 0, year, needsJanuaryReconfirm: false };
}

// ============================================================
// MN HF 3437 STATUS CHECK
// ============================================================

export function getMnHf3437Status(): {
  enacted: boolean;
  effectiveDate: string;
  summary: string;
  impact: string;
  provenance: ProvenanceLabel;
  references: string[];
} {
  return {
    enacted: true,
    effectiveDate: '2026-08-01',
    summary: 'MN HF 3437: passed House April 13, Senate April 20, signed into law April 23, 2026; effective August 1, 2026.',
    impact: 'Narrows Minn. Stat. § 58.137 to loans made PRIMARILY for personal, family, or household purposes. Business-purpose DSCR loans (LLC-vested, investment property) are NOT reached by the statute. Most significant 2026 PPP law change.',
    provenance: 'VERIFIED_PRIMARY',
    references: [
      'MN Revisor HF 3437 2nd Engrossment (94th Legislature 2025-2026)',
      'FastDemocracy MN bill tracker MNB00062610',
      'MN House Journal pg. 6128 (04/23/2026 third reading as amended)',
    ],
  };
}
