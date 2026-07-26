// ============================================================================
// EVIDENCE VAULT — v11 Part L / Spec Requirement 2
// ============================================================================
// Every claim in the system carries provenance. No claim renders without:
// - claim text, value, source type, verified date, confidence, reviewer
// Old evidence is never deleted — it's superseded.
// ============================================================================

export type SourceType =
  | 'primary'           // Lender's own published materials
  | 'official'          // Statute, regulation, government source
  | 'broker_matrix'     // Third-party broker-compiled matrix
  | 'user_assumption'   // User-provided value
  | 'market_estimate'   // Derived from market data
  | 'third_party_data'; // AirDNA, Zillow, Census, FRED

export type ConfidenceTier = 'verified' | 'reported' | 'unverified' | 'stale';

export interface EvidenceRecord {
  id: string;
  claim: string;                    // What is being asserted
  value: string;                    // The asserted value
  source_type: SourceType;
  source_ref: string;               // URL, file ref, or citation
  verified_date: string;            // ISO date
  expiration_date?: string;         // When this evidence goes stale
  confidence: number;               // 0-100
  confidence_tier: ConfidenceTier;
  reviewer: string;                 // Who verified this
  supersedes_id?: string;           // ID of the record this replaces
  conflict_flag: boolean;           // True if this conflicts with another record
  notes: string;
}

export interface EvidenceVault {
  records: EvidenceRecord[];
  // Query methods
  getByClaim: (claim: string) => EvidenceRecord[];
  getActive: () => EvidenceRecord[];
  getConflicts: () => EvidenceRecord[];
  getStale: (asOfDate: string) => EvidenceRecord[];
  // Mutation methods
  add: (record: Omit<EvidenceRecord, 'id'>) => EvidenceRecord;
  supersede: (oldId: string, newRecord: Omit<EvidenceRecord, 'id'>) => EvidenceRecord;
}

export function createEvidenceVault(initialRecords: EvidenceRecord[] = []): EvidenceVault {
  let records = [...initialRecords];
  let nextId = records.length + 1;

  const generateId = () => `ev-${String(nextId++).padStart(4, '0')}`;

  return {
    records,

    getByClaim(claim: string): EvidenceRecord[] {
      return records.filter(r => r.claim.toLowerCase().includes(claim.toLowerCase()));
    },

    getActive(): EvidenceRecord[] {
      // Active = not superseded and not stale
      const now = new Date().toISOString();
      return records.filter(r => {
        const isSuperseded = records.some(other => other.supersedes_id === r.id);
        const isStale = r.expiration_date && r.expiration_date < now;
        return !isSuperseded && !isStale;
      });
    },

    getConflicts(): EvidenceRecord[] {
      return records.filter(r => r.conflict_flag);
    },

    getStale(asOfDate: string): EvidenceRecord[] {
      return records.filter(r => r.expiration_date && r.expiration_date < asOfDate);
    },

    add(record: Omit<EvidenceRecord, 'id'>): EvidenceRecord {
      const newRecord: EvidenceRecord = { ...record, id: generateId() };
      records.push(newRecord);
      return newRecord;
    },

    supersede(oldId: string, newRecord: Omit<EvidenceRecord, 'id'>): EvidenceRecord {
      const replacement: EvidenceRecord = {
        ...newRecord,
        id: generateId(),
        supersedes_id: oldId,
      };
      records.push(replacement);
      return replacement;
    },
  };
}

// ============================================================================
// COMPLIANCE BRANCHING GATE — v11 Part M / Spec Requirement 3
// ============================================================================
// Before pricing or DSCR calculation, classify the transaction.
// This determines which regulatory regime applies.
// ============================================================================

export type LoanPurposeType = 'business_purpose' | 'consumer_purpose';
export type OccupancyType = 'non_owner_occupied' | 'owner_occupied' | 'second_home';
export type LenderType = 'bank' | 'depository' | 'private_lender' | 'correspondent' | 'wholesale';
export type VestingType = 'individual' | 'llc' | 'partnership' | 'corp' | 'trust';

export interface ComplianceInput {
  occupancy_intent: OccupancyType;
  vesting: VestingType;
  loan_purpose: string;          // 'PURCHASE' | 'RATE_TERM_REFI' | 'CASH_OUT_REFI'
  lender_type: LenderType;
  state: string;
  has_nmls_license: boolean;
  is_b2b_professional_use: boolean;
}

export interface ComplianceResult {
  loan_purpose_type: LoanPurposeType;
  reg_z_applies: boolean;
  respa_applies: boolean;
  ecoa_applies: boolean;
  high_cost_test_required: boolean;
  state_ppp_restriction: string | null;
  advertising_risk: 'low' | 'moderate' | 'high';
  licensing_evidence: 'confirmed' | 'missing' | 'not_required';
  positioning: string;           // B2B decision-support disclaimer
  flags: string[];
  notes: string[];
}

export function runComplianceGate(input: ComplianceInput): ComplianceResult {
  const flags: string[] = [];
  const notes: string[] = [];

  // Step 1: Business vs Consumer Purpose
  // Reg Z commentary: credit to acquire non-owner-occupied rental property = business purpose
  const isBusinessPurpose =
    input.occupancy_intent === 'non_owner_occupied' &&
    (input.vesting === 'llc' || input.vesting === 'partnership' || input.vesting === 'corp' || input.vesting === 'trust');

  const loanPurposeType: LoanPurposeType = isBusinessPurpose ? 'business_purpose' : 'consumer_purpose';

  if (!isBusinessPurpose && input.occupancy_intent === 'owner_occupied') {
    flags.push('CONSUMER PURPOSE: Owner-occupied rental — Reg Z applies. Requires full TRID disclosure.');
    notes.push('Reg Z commentary: owner-occupied rental requires separate analysis. Not automatically business-purpose.');
  }

  // Step 2: Reg Z
  const regZApplies = !isBusinessPurpose;
  if (regZApplies) {
    flags.push('REG Z: Applies — consumer-purpose loan. Full disclosure required.');
  } else {
    notes.push('REG Z: Exempt — business-purpose credit for non-owner-occupied investment property.');
  }

  // Step 3: RESPA
  // RESPA applies to federally-related mortgage loans (1-4 unit residential)
  const respaApplies = input.occupancy_intent !== 'non_owner_occupied' || !isBusinessPurpose;
  if (respaApplies) {
    flags.push('RESPA: May apply — verify if transaction is federally-related mortgage loan.');
  }

  // Step 4: ECOA
  // ECOA always applies — cannot discriminate on protected basis
  notes.push('ECOA: Always applies. FICO-tiered outputs carry disparate-impact exposure. Ensure B2B positioning.');

  // Step 5: High-cost test
  const highCostStates = ['NJ', 'NM', 'AR', 'TX', 'OK', 'MA', 'IL'];
  const highCostTestRequired = highCostStates.includes(input.state.toUpperCase());
  if (highCostTestRequired) {
    flags.push(`HIGH-COST TEST: ${input.state} has state-specific high-cost/hoeppa thresholds. Verify APR does not trigger.`);
  }

  // Step 6: State PPP restriction (from state-ppp-law.ts)
  const pppRestrictedStates = ['KS', 'MN', 'NM', 'ND', 'MD', 'NY', 'AK'];
  const statePppRestriction = pppRestrictedStates.includes(input.state.toUpperCase())
    ? `${input.state} restricts prepayment penalties — verify entity vesting for business-purpose exception`
    : null;

  // Step 7: Lender type constraints
  if (input.lender_type === 'bank' || input.lender_type === 'depository') {
    notes.push('BANK/DEPOSITORY: Stricter consumer rules apply even to investors. Non-bank portfolio lenders have more flexibility.');
  }

  // Step 8: Licensing
  let licensingEvidence: 'confirmed' | 'missing' | 'not_required';
  if (input.is_b2b_professional_use) {
    licensingEvidence = input.has_nmls_license ? 'confirmed' : 'missing';
    if (!input.has_nmls_license) {
      flags.push('NMLS: No licensing evidence — cannot confirm originator authority.');
    }
  } else {
    licensingEvidence = 'not_required';
  }

  // Step 9: Advertising risk
  let advertisingRisk: 'low' | 'moderate' | 'high';
  if (input.is_b2b_professional_use && isBusinessPurpose) {
    advertisingRisk = 'low';
  } else if (!input.is_b2b_professional_use) {
    advertisingRisk = 'high';
    flags.push('ADVERTISING RISK: Non-B2B use detected. System must not present as consumer mortgage advice.');
  } else {
    advertisingRisk = 'moderate';
  }

  // Step 10: Positioning
  const positioning = 'Professional decision-support for licensed professionals and sophisticated investors. The user is the decision-maker of record. Not a loan commitment, credit decision, or substitute for legal/tax counsel.';

  return {
    loan_purpose_type: loanPurposeType,
    reg_z_applies: regZApplies,
    respa_applies: respaApplies,
    ecoa_applies: true,
    high_cost_test_required: highCostTestRequired,
    state_ppp_restriction: statePppRestriction,
    advertising_risk: advertisingRisk,
    licensing_evidence: licensingEvidence,
    positioning,
    flags,
    notes,
  };
}

// ============================================================================
// RESTRUCTURING ENGINE — v11 Part J / Spec Requirement 11
// ============================================================================
// For each fix, show effect on Track 1, Track 2, cash to close, AEY, survival, verdict
// ============================================================================

export interface RestructureFix {
  id: string;
  label: string;
  description: string;
  apply: (input: RestructureInput) => RestructureInput;
  effect: {
    track1_delta: number;
    track2_delta: number;
    cash_to_close_delta: number;
    verdict_change: string | null;
  };
  feasibility: 'high' | 'medium' | 'low';
  counterparty: string;
}

export interface RestructureInput {
  purchase_price: number;
  loan_amount: number;
  rate: number;
  points: number;
  lease_rent: number;
  appraiser_rent: number;
  interest_only_months: number;
  structure: string;
  reserves_months: number;
  borrower_rent_claim: number;
}

export interface RestructureResult {
  fix: RestructureFix;
  new_input: RestructureInput;
  new_track1_dscr: number;
  new_track2_dscr: number;
  new_cash_to_close: number;
  new_verdict: string;
  improvement: number;
}

export function getRestructureOptions(): RestructureFix[] {
  return [
    {
      id: 'reduce_price_5',
      label: 'Reduce purchase price 5%',
      description: 'Seller concedes 5% on price. Lowers loan, down payment, and debt service.',
      apply: (i) => {
        const newPrice = i.purchase_price * 0.95;
        const ltvRatio = i.loan_amount / i.purchase_price;
        return { ...i, purchase_price: newPrice, loan_amount: newPrice * ltvRatio };
      },
      effect: { track1_delta: 0, track2_delta: 0, cash_to_close_delta: 0, verdict_change: null },
      feasibility: 'medium',
      counterparty: 'Seller',
    },
    {
      id: 'reduce_price_10',
      label: 'Reduce purchase price 10%',
      description: 'Seller concedes 10%. Significant — requires appraisal gap or market weakness.',
      apply: (i) => {
        const newPrice = i.purchase_price * 0.90;
        const ltvRatio = i.loan_amount / i.purchase_price;
        return { ...i, purchase_price: newPrice, loan_amount: newPrice * ltvRatio };
      },
      effect: { track1_delta: 0, track2_delta: 0, cash_to_close_delta: 0, verdict_change: null },
      feasibility: 'low',
      counterparty: 'Seller',
    },
    {
      id: 'lower_ltv_5',
      label: 'Lower LTV by 5% (add down payment)',
      description: 'Add cash to reduce loan amount. Lowers P&I, lifts both DSCRs.',
      apply: (i) => {
        const valueBase = i.purchase_price;
        const currentLtv = i.loan_amount / valueBase;
        const newLtv = Math.max(0.50, currentLtv - 0.05);
        return { ...i, loan_amount: newLtv * valueBase };
      },
      effect: { track1_delta: 0, track2_delta: 0, cash_to_close_delta: 0, verdict_change: null },
      feasibility: 'high',
      counterparty: 'Borrower',
    },
    {
      id: 'rate_buydown_50',
      label: 'Buy down rate 50 bps',
      description: 'Pay ~1 point to reduce rate 50bps. Lowers monthly P&I.',
      apply: (i) => ({ ...i, rate: Math.max(0, i.rate - 0.5), points: i.points + 1 }),
      effect: { track1_delta: 0, track2_delta: 0, cash_to_close_delta: 0, verdict_change: null },
      feasibility: 'high',
      counterparty: 'Lender',
    },
    {
      id: 'rate_buydown_100',
      label: 'Buy down rate 100 bps',
      description: 'Pay ~2 points to reduce rate 100bps. Larger DSCR lift but more upfront.',
      apply: (i) => ({ ...i, rate: Math.max(0, i.rate - 1.0), points: i.points + 2 }),
      effect: { track1_delta: 0, track2_delta: 0, cash_to_close_delta: 0, verdict_change: null },
      feasibility: 'medium',
      counterparty: 'Lender',
    },
    {
      id: 'remove_io',
      label: 'Remove interest-only period',
      description: 'Switch to full amortizing. Avoids payment cliff at recast.',
      apply: (i) => ({ ...i, interest_only_months: 0, structure: 'FIXED_30' }),
      effect: { track1_delta: 0, track2_delta: 0, cash_to_close_delta: 0, verdict_change: null },
      feasibility: 'high',
      counterparty: 'Lender',
    },
    {
      id: 'verify_rent',
      label: 'Verify and lock rent at claim',
      description: 'Confirm lease with deposit verification. Strengthens rent hierarchy.',
      apply: (i) => ({ ...i, borrower_rent_claim: i.lease_rent }),
      effect: { track1_delta: 0, track2_delta: 0, cash_to_close_delta: 0, verdict_change: null },
      feasibility: 'high',
      counterparty: 'Borrower',
    },
    {
      id: 'add_reserves_3',
      label: 'Add 3 months PITIA reserves',
      description: 'Borrower brings additional cash for reserves.',
      apply: (i) => ({ ...i, reserves_months: i.reserves_months + 3 }),
      effect: { track1_delta: 0, track2_delta: 0, cash_to_close_delta: 0, verdict_change: null },
      feasibility: 'medium',
      counterparty: 'Borrower',
    },
    {
      id: 'increase_rent_5',
      label: 'Raise rent 5% (with verified lease)',
      description: 'Negotiate new lease at 5% higher. Requires market support.',
      apply: (i) => ({
        ...i,
        borrower_rent_claim: i.borrower_rent_claim * 1.05,
        appraiser_rent: i.appraiser_rent * 1.05,
        lease_rent: i.lease_rent * 1.05,
      }),
      effect: { track1_delta: 0, track2_delta: 0, cash_to_close_delta: 0, verdict_change: null },
      feasibility: 'low',
      counterparty: 'Borrower',
    },
  ];
}

// ============================================================================
// IC MEMO GENERATOR — v11 Part J / Spec Requirement 9
// ============================================================================

export interface IcMemoInput {
  // Deal
  address: string;
  entity: string;
  state: string;
  // Verdict
  decision: string;
  binding_constraint: string;
  kill_switch: string;
  track2_acknowledgment: string | null;
  // Three-metric credit standard
  track1_dscr: number;
  required_dscr: number;
  debt_yield: number;
  ltv: number;
  deal_break_rate: number;
  // Track 2
  track2_dscr: number;
  track2_monthly_cf: number;
  track2_annual_noi: number;
  breakeven_occupancy: number;
  liquidity_runway_months: number;
  // Returns
  entry_cap_rate: number;
  coc_year1: number;
  after_tax_irr: number;
  return_grade: string;
  // Lender
  top_lender: string;
  top_lender_aey: number;
  flex_lender: string | null;
  rate_comp_lender: string | null;
  aey_delta_dollars: number;
  // Stress
  stress_pass: number;
  stress_kill: number;
  binding_risk: string;
  // Reserves
  reserves_lenient: number;
  reserves_median: number;
  reserves_strict: number;
  // Compliance
  compliance_flags: string[];
  // Data confidence
  data_confidence_score: number;
  fraud_risk: string;
  // ARM
  arm_reset_rate?: number;
  arm_stress_dscr?: number;
  // Points recoup
  points_recoup_months: number;
  points_recoup_status: string;
}

export function generateIcMemo(input: IcMemoInput): string {
  const memo = `═══════════════════════════════════════════════════════════════════
INSTITUTIONAL DSCR CREDIT COMMITTEE — IC MEMO
Property: ${input.address} | Entity: ${input.entity} | State: ${input.state}
Date: June 2026 | Engine: v11.0.0
═══════════════════════════════════════════════════════════════════

VERDICT: ${input.decision}
  Binding constraint: ${input.binding_constraint}
  Kill-switch: ${input.kill_switch}
  ${input.track2_acknowledgment ? `\n  ⚠️ TRACK 2 ACKNOWLEDGMENT REQUIRED:\n  ${input.track2_acknowledgment}` : ''}

THREE-METRIC CREDIT STANDARD:
  Track 1 DSCR:                      ${input.track1_dscr.toFixed(3)}x    [min: ${input.required_dscr.toFixed(2)}x]
  Debt Yield (NOI/Loan):             ${input.debt_yield.toFixed(1)}%     [target: ≥9%]
  LTV:                               ${input.ltv.toFixed(1)}%           [lender cap: varies]
  Deal-Break Rate:                   ${input.deal_break_rate.toFixed(2)}%

TRACK 2 — INVESTOR SURVIVAL:
  Track 2 DSCR:                      ${input.track2_dscr.toFixed(3)}x
  Monthly Cash Flow:                 $${input.track2_monthly_cf.toFixed(0)}/mo
  Annual NOI:                        $${input.track2_annual_noi.toLocaleString()}
  Break-Even Occupancy:              ${input.breakeven_occupancy.toFixed(1)}%
  Liquidity Runway:                  ${input.liquidity_runway_months.toFixed(1)} months

RETURN STACK:
  Entry Cap Rate:                    ${input.entry_cap_rate.toFixed(2)}%
  Year 1 Cash-on-Cash:               ${input.coc_year1.toFixed(2)}%
  After-Tax IRR (5yr hold):          ${input.after_tax_irr.toFixed(1)}%
  Return Grade:                      ${input.return_grade}

LENDER TRUE-COST RANKING (AEY):
  #1: ${input.top_lender}            AEY ${input.top_lender_aey.toFixed(2)}%
  Two-Quote Rule:
    Flex Lender:                     ${input.flex_lender ?? '—'}
    Rate-Competitive:                ${input.rate_comp_lender ?? '—'}
    AEY Delta:                       $${input.aey_delta_dollars.toLocaleString()} over hold

STRESS TESTS:
  Scenarios: ${input.stress_pass} pass / ${input.stress_kill} kill
  Binding Risk (tornado):            ${input.binding_risk}

RESERVES (3-scenario range):
  Lenient:                           ${input.reserves_lenient} months
  Market Median:                     ${input.reserves_median} months
  Strict / Sub-DSCR:                 ${input.reserves_strict} months

${input.arm_reset_rate ? `ARM RESET:
  Reset rate:                        ${input.arm_reset_rate.toFixed(3)}%
  Track 1 at stress reset:           ${input.arm_stress_dscr?.toFixed(3)}x
` : ''}
POINTS RECOUP:
  Break-even:                        ${input.points_recoup_months} months
  Status:                            ${input.points_recoup_status.toUpperCase()}

COMPLIANCE:
  ${input.compliance_flags.length > 0 ? input.compliance_flags.map(f => '  ⚠️ ' + f).join('\n') : '  ✅ No compliance flags'}

DATA CONFIDENCE:
  Score:                             ${input.data_confidence_score}/100
  Fraud Risk:                        ${input.fraud_risk}

═══════════════════════════════════════════════════════════════════
Professional decision-support. Not a loan commitment, credit decision,
appraisal, tax opinion, or guarantee of approval. The user is the
decision-maker of record. Verify all terms directly with lender.
═══════════════════════════════════════════════════════════════════`;

  return memo;
}
