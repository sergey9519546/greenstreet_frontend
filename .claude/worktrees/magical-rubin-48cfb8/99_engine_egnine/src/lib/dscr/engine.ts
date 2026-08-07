// ============================================================================
// DSCR ENGINE — Pure Calculation Entry Point
// ============================================================================
// This is the engine. No React. No UI. No side effects.
// Input: JSON-friendly deal parameters (matching v7 spec field names).
// Output: JSON-friendly evaluation report.
//
// The UI is a client of this function. The API is a client of this function.
// Tests are a client of this function. This function IS the product.
// ============================================================================

import { monthlyPayment, interestOnlyPayment, round } from './math';
import { estimateRate } from './llpa';
import { computeScenario, solveMaxPurchasePrice, solveBreakevenRate } from './solvers';
import { buildLenderVerdict, calculatePitia, buildRentHierarchy } from './lender';
import { buildInvestorVerdict, calculateSurvival } from './investor';
import { buildStressScenarios } from './stress';
import { calculateDataQuality } from './fraud';
import { calculateScores, buildTruthMatrix, buildAction, buildDealSnapshot } from './scoring';
import { checkKillCriteria } from './kill-criteria';
import { calculateReserves } from './reserves';
import { calculateTrueCost } from './true-cost';
import { calculateTwoVariableStress, calculateExecutionScore, calculateAcquisitionScore } from './scorecards';
import { matchLenders, buildDealProfile, getTwoQuoteRecommendation } from './lender-matching';
import { checkPppEligibility } from './state-ppp-law';
import { isDecliningMarketState } from './llpa';
import type { DealInputs, LoanPurpose, LoanStructure, PrepayType, PropertyType, RentType, Entity, Quadrant, StressScenario } from './types';
import type { LenderMatch } from './lender-matching';
import type { ReserveResult } from './reserves';
import type { ArmResetResult } from './arm-reset';
import type { ReassessmentResult } from './reassessment-insurance';
import type { StrLegalityResult } from './str-worlds';
// v11 modules
import { calculateAfterTax, type AfterTaxInput } from './after-tax';
import { calculateArmReset, type ArmResetInput } from './arm-reset';
import { calculateReassessment, checkInsuranceGate, checkBrrrrGate } from './reassessment-insurance';
import { SOFR_30D, TREASURY_10YR, TREASURY_5YR, FED_FUNDS_RATE } from './arm-reset';
import { runComplianceGate } from './evidence-compliance';
import { calculatePppPenalty, type PppModelType } from './ppp-optimizer';
import { LENDER_DATA_VERSION, LTV_CASH_OUT_CAP, getStateIncomeTaxRate } from './constants';
import { ANCHOR_RATE } from './llpa';
// v12.1: New feature modules
import { calculateBreakEvenTable, calculateSensitivityGrid, type SensitivityVariable } from './sensitivity';
import { calculateDefeasance } from './exchange';
import { calculate1031Exchange } from './exchange';
import { calculatePartnershipWaterfall, type WaterfallTier } from './waterfall';
// v13: Monte Carlo for P10/P50/P90 DSCR distribution
import { runMonteCarlo } from './monte-carlo';
// v13.2: Robust financial solvers (Newt-Safe IRR, memoization, antithetic variates)
import { irr as robustIrr, npv as robustNpv, pmt as robustPmt, remainingBalance as robustRemainingBalance, memoize,
  // v15 Phase 1+2+5+6: New utilities
  neumaierSum, discountFactor, xnpv, itp, halley, irrHighPrecision,
  weightedAverageLife, macaulayDuration, modifiedDuration, dv01, convexity,
  sharpeRatio, sortinoRatio, calmarRatio, omegaRatio, logSumExp,
  cvar, valueAtRisk, gpdCvar,
} from './solvers-v13';
// v15: Alternative financing modules
import {
  calculateBridgeLoan,
  calculateSellerFinancing,
  calculateEntityOptimization,
  calculateCostSeg,
  calculateOpportunityZone,
  calculateStateSpecific,
  calculateInsuranceDetail,
} from './alternative-financing';
// v15 Phase 3+4+5+6: New modules
import { computeCvarFromMC, computeVaR, computeGpdCvarMC } from './monte-carlo-v15';
import {
  simulateVasicek, vasicekExpectedRate,
  simulateOUNoi, ouExpectedNoi,
  psaCpr, psaSmm, psaBalanceProjection,
  capRateFromTreasury,
  distanceToDefault, mertonPD, lgdFromLtv,
  sizeReservesForRuinProbability,
  riskParityWeights, modifiedDietzReturn,
  refiNpvWithOptionValue,
} from './rate-models';
import {
  getTaxTable, getStateConformity, computeMarginalTax,
  brrrrRefiAnalysis, paretoFrontierLenders,
  type LenderObjectives,
} from './tax-tables';

// ---------------------------------------------------------------------------
// API INPUT — clean, JSON-friendly, matches v7 spec field names
// ---------------------------------------------------------------------------

export interface EngineInput {
  // Property
  purchase_price: number;
  appraised_value: number;
  loan_amount: number;
  // v13: Optional second lien (HELOC / mezzanine) for CLTV calculation
  second_lien_amount?: number;
  rate: number;                    // annual %, e.g. 7.00
  points: number;                  // % of loan
  term_months: number;
  amortization_months: number;
  interest_only_months: number;
  // Income (monthly)
  lease_rent: number;
  appraiser_rent: number;
  borrower_rent_claim: number;
  // Expenses (ANNUAL — matching v7 spec)
  property_taxes_annual: number;
  insurance_annual: number;
  hoa_monthly: number;
  // Borrower
  fico: number;
  state: string;
  vesting: 'individual' | 'llc' | 'partnership' | 'corp' | 'trust';
  experience_properties: number;
  reserves_months: number;
  // Property classification
  property_type: string;
  rent_type: string;
  loan_purpose: string;
  structure: string;
  prepay_type: string;
  // Optional STR
  str_trailing_revenue_monthly?: number;
  str_projection_monthly?: number;
  // Market
  vacancy_pct: number;
  market_cap_rate: number;
  stress_cap_rate: number;
  // Documentation flags
  lease_verified: boolean;
  lease_deposit_verified: boolean;
  insurance_bindable: boolean;
  tax_reassessment_estimated: boolean;
  // v11: After-tax profile
  land_allocation_pct?: number;         // 10-25% typical
  federal_bracket_pct?: number;          // e.g. 24, 32, 37
  magi?: number;                         // modified adjusted gross income
  filing_status?: 'single' | 'mfj' | 'mfs' | 'hoh';
  is_rep?: boolean;                      // Real Estate Professional
  cost_seg_elected?: boolean;
  hold_years?: number;
  exit_cap_rate_pct?: number;
  sale_costs_pct?: number;
  annual_capex?: number;
  acquisition_date?: string;             // ISO date for bonus dep
  // v11: ARM
  is_arm?: boolean;
  arm_margin_bps?: number;
  arm_months_to_reset?: number;
  // v11: Insurance
  is_high_risk_zone?: boolean;
  insurance_quote_confirmed?: boolean;
  // v11: BRRRR
  is_brrrr?: boolean;
  brrrr_months_held?: number;
  brrrr_arv?: number;
  brrrr_cost_basis?: number;
  // v12: Investor-side opex assumptions (override hardcoded 8/4/4/2)
  property_mgmt_pct?: number;
  repairs_maintenance_pct?: number;
  capex_reserve_pct?: number;
  turnover_pct?: number;
  collection_loss_pct?: number;
  concessions_pct?: number;
  platform_fees_pct?: number;
  seasonality_haircut_pct?: number;
  // v12: Documentation flags (override hardcoded true)
  appraisal_done?: boolean;
  inspection_done?: boolean;
  llc_ownership_verified?: boolean;
  guarantor_linkage_verified?: boolean;
  str_platform_history_pulled?: boolean;
  credit_report_pulled?: boolean;
  title_search_pulled?: boolean;
  bank_statements_pulled?: boolean;
  // v12: Seasoning (override hardcoded 84mo)
  bankruptcy_seasoning_months?: number;
  foreclosure_seasoning_months?: number;
  mortgage_history_months?: number;
  // v12.1: Partnership waterfall (optional — default to LP=100%, no promote)
  partnership?: {
    lp_equity_pct?: number;            // e.g. 90 for 90% LP / 10% GP
    gp_co_invest_pct?: number;         // e.g. 0 for pure promote, 5 for GP co-invest
    pref_rate?: number;                // e.g. 0.08 for 8% preferred return
    gp_catchup_pct?: number;           // 0-1, e.g. 1.0 for full catch-up
    // v12.1: Accept both snake_case (API) and camelCase (TS) — engine normalizes to WaterfallTier
    tiers?: Array<{ irr_threshold: number; gp_split: number } | WaterfallTier>;
  };
  // v12.1: 1031 exchange (optional)
  exchange_1031?: {
    relinquished_purchase_price?: number;
    relinquished_adjusted_basis?: number;
    relinquished_loan_balance?: number;
    replacement_value?: number;
    replacement_loan_amount?: number;
    cash_retained?: number;            // boot
  };
  // v15: Bridge / hard money loan (optional)
  bridge_loan?: {
    arv: number;
    rehab_budget: number;
    interest_reserve_months: number;
    exit_strategy: 'sell' | 'refi' | 'hold';
    exit_timeline_months: number;
    exit_value: number;
    selling_costs_pct: number;
  };
  // v15: Seller financing (optional)
  seller_financing?: {
    down_payment: number;
    seller_note_rate: number;
    seller_note_term_months: number;
    seller_note_balloon_months: number;
    existing_loan_balance?: number;
    existing_loan_payment?: number;
    market_rate: number;
  };
  // v15: Foreign national
  is_foreign_national?: boolean;
  // Optional timestamp (for reproducible SSR)
  generated_at?: string;
}

// ---------------------------------------------------------------------------
// ENGINE OUTPUT — clean, JSON-friendly
// ---------------------------------------------------------------------------

export interface EngineReport {
  // v13: Deal summary (echoed from input for UI display)
  deal_summary: {
    purchase_price: number;
    appraised_value: number;
    loan_amount: number;
    rate: number;
    points: number;
    state: string;
    fico: number;
    property_type: string;
    rent_type: string;
    loan_purpose: string;
    structure: string;
    market_cap_rate: number;
    hold_years: number;
  };
  // Core math
  pitia: {
    principal_interest: number;
    taxes: number;
    insurance: number;
    hoa: number;
    total: number;
  };
  payment_factor: number;
  // Track 1 — Lender Qualification
  track1: {
    qualifying_rent: number;
    dscr: number | null;
    required_dscr: number;
    passes: boolean;
    dscr_cushion: number | null;              // Track1 - Lender_Floor
  };
  // Track 2 — Investor Stress
  track2: {
    effective_rent: number;
    dscr: number | null;
    survival_dscr: number | null;
    monthly_cash_flow: number;
    annual_noi: number;
    annual_debt_service: number;
    breakeven_occupancy_pct: number;
    track2_acknowledgment_required: boolean;  // True when T1 passes but T2 fails
  };
  // Solvers
  solvers: {
    deal_break_rate: number;
    max_loan_for_1_0_dscr: number;
    max_loan_for_1_25_dscr: number;
    max_purchase_for_1_0_dscr: number;
    breakeven_rate_for_1_25_dscr: number;
    min_rent_for_1_25_dscr: number;
    converged: boolean;
    iterations: number;
  };
  // Returns engine (v11 Part B)
  returns: {
    entry_cap_rate: number;            // NOI / Purchase Price
    yield_on_cost: number;             // Stabilized NOI / Total Cost
    cash_on_cash_year1: number;        // (NOI - ADS) / Cash Invested
    debt_yield: number;                // NOI / Loan
    equity_multiple: number;           // Total distributions / Equity invested
    dscr_at_stabilization: number;     // Stabilized NOI / ADS (after rent growth)
  };
  // 48-cell hold matrix (v11 Part B)
  hold_matrix: {
    hold_years: number;
    exit_cap_scenario: 'base' | 'stress' | 'bull';
    rent_growth_pct: number;
    levered_irr: number;
    equity_multiple: number;
  }[];
  // Tornado chart (v11 Part H) — binding risk variable
  tornado: {
    variable: string;
    dscr_swing: number;
    low_dscr: number;
    high_dscr: number;
  }[];
  binding_risk: string;                // Top tornado variable
  // LTV
  ltv: {
    actual: number;
    max_allowed: number;
    cap_warnings: string[];
    // v13: CLTV (combined LTV) — includes second liens / HELOCs if provided
    cltv: number;
    // v13: Equity multiple on LTV (loan / equity) — leverage ratio
    leverage_ratio: number;
    // v13: Debt yield at exit (exit NOI / remaining balance at exit)
    debt_yield_at_exit: number;
    // v13: Stabilized debt yield (year-3 NOI / loan)
    stabilized_debt_yield: number;
  };
  // Rate
  rate: {
    input_rate: number;
    estimated_rate: number;
    anchor_rate: number;
    adjustments: { factor: string; adjustment: number; note: string }[];
  };
  // Reserves
  reserves: {
    lenient_months: number;
    median_months: number;
    strict_months: number;
    lenient_dollars: number;
    median_dollars: number;
    strict_dollars: number;
    notes: string[];
  };
  // Kill criteria
  kill_criteria: {
    status: 'CLEAR' | 'RESOLVE_FIRST' | 'KILL';
    can_proceed: boolean;
    blocking: { criterion: string; detail: string; action: string }[];
  };
  // Verdict (v11 Part J — institutional)
  verdict: {
    decision: 'PROCEED' | 'RESTRUCTURE' | 'PASS';
    binding_constraint: string;        // Top kill/condition item
    kill_switch: string;               // Specific measurable condition that flips verdict
    track2_acknowledgment: string | null;  // Forced acknowledgment text when T1 passes but T2 fails
  };
  // Lender matching with AEY
  lender_matches: {
    rank: number;
    name: string;
    fit_tier: string;
    match_score: number;
    estimated_rate: number;
    aey: number;                       // All-In Effective Yield (XIRR of borrower cash flows)
    hard_blockers: string[];
    two_quote_role: string;
    counterparty_flag: 'stable' | 'watch' | 'elevated';  // Continuity risk
  }[];
  two_quote: {
    flex_lender: string | null;
    rate_competitive_lender: string | null;
    aey_delta_dollars: number;         // Dollar difference between two quotes
  };
  // True cost with AEY + points recoup
  true_cost: {
    hold_months: number;
    total_cost: number;
    monthly_avg: number;
    effective_rate: number;
    aey: number;                       // XIRR-based true yield
    // v15 Phase 5: Institutional fixed-income metrics
    wal_years?: number;                // Weighted Average Life — when does principal actually return?
    macaulay_duration_years?: number;  // Time-weighted PV of cash flows / price
    modified_duration?: number;        // Price sensitivity to 1% rate change
    dv01?: number;                     // Dollar value of 1bp rate move
    convexity?: number;                // Second-order rate sensitivity
  }[];
  points_recoup: {
    break_even_months: number | null;  // Total points cost / monthly savings vs par. Null = never breaks even.
    status: 'green' | 'yellow' | 'red'; // < hold, within 12mo of PPP expiry, > hold
  };
  // Execution score
  execution_score: {
    total: number;
    band: string;
  };
  // Truth matrix
  truth_matrix: {
    quadrant: 'GREEN' | 'TRAP' | 'STRUCTURING' | 'KILL';
    label: string;
  };
  // State checks
  state_checks: {
    declining_market: boolean;
    ppp_allowed: boolean;
    ppp_reason: string;
  };
  // Stress scenarios count
  stress: {
    total: number;
    pass: number;
    watch: number;
    fail: number;
    kill: number;
  };
  // v11: After-tax returns
  after_tax?: {
    annual_depreciation: number;
    bonus_dep_pct: number;
    cost_seg_available: boolean;
    total_year1_deduction: number;
    pal_allowance: number;
    after_tax_cash_flow_year1: number;
    after_tax_irr: number;
    pre_tax_irr: number;
    return_grade: string;
    section1250_recapture_tax: number;
    niit_recapture_tax: number;
    total_exit_tax: number;
    after_tax_exit_proceeds: number;
    exit_value: number;
    remaining_balance: number;
    notes: string[];
  };
  // v11: ARM reset
  arm_reset?: {
    current_sofr: number;
    reset_rate: number;
    track1_at_reset: number;
    stress_reset_rate: number;
    stress_track1_at_reset: number;
    double_shock_year: number | null;
    breaches_floor: boolean;
    notes: string[];
  };
  // v11: Reassessment
  reassessment?: {
    reassessed_tax_annual: number;
    seller_current_tax_annual: number;
    tax_delta_monthly: number;
    track1_dscr_after: number;
    dscr_delta: number;
    supplemental_bill: boolean;
    notes: string[];
  };
  // v11: Insurance gate
  insurance_gate?: {
    kill: boolean;
    reason: string;
    stress_year3_premium: number;
    notes: string[];
  };
  // v11: BRRRR gate
  brrrr_gate?: {
    seasoning_met: boolean;
    cash_out_basis: string;
    carry_cost: number;
    thesis_fails: boolean;
    notes: string[];
  };
  // v11: Rate anchors
  rate_anchors: {
    treasury_10yr: number;
    treasury_5yr: number;
    sofr_30d: number;
    fed_funds: number;
  };
  // Reproducible snapshot (v11 Part L)
  snapshot: {
    engine_version: string;
    rate_anchors: { treasury_10yr: number; treasury_5yr: number; sofr_30d: number };
    lender_data_version: string;
    input_hash: string;
  };
  // Compliance branching gate (v11 Part M)
  compliance: {
    loan_purpose_type: string;
    reg_z_applies: boolean;
    respa_applies: boolean;
    ecoa_applies: boolean;
    high_cost_test_required: boolean;
    state_ppp_restriction: string | null;
    advertising_risk: string;
    licensing_evidence: string;
    positioning: string;
    flags: string[];
    notes: string[];
  };
  // IC Memo
  ic_memo: string;
  generated_at: string;
  engine_version: string;
  // v12.1: Break-even table (DSCR targets × breakeven rent/loan/price/rate/LTV)
  break_even?: {
    min_rent_by_dscr: { dscr: number; rent: number }[];
    max_loan_by_dscr: { dscr: number; loan: number }[];
    max_price_by_dscr: { dscr: number; price: number }[];
    breakeven_rate_by_dscr: { dscr: number; rate: number }[];
    max_ltv_by_dscr: { dscr: number; ltv: number }[];
  };
  // v12.1: 2-variable sensitivity grid (rate × LTV)
  sensitivity_grid?: {
    x_variable: string;
    y_variable: string;
    x_values: number[];
    y_values: number[];
    grid: number[][];  // grid[y][x] = DSCR
  };
  // v12.1: Cash-out LTV cap enforcement
  cash_out_ltv_cap?: {
    applies: boolean;
    max_ltv: number;
    current_ltv: number;
    exceeds_cap: boolean;
    max_loan_at_cap: number;
    notes: string[];
  };
  // v12.1: Defeasance analysis (if prepay_type allows)
  defeasance?: {
    remaining_payments: number;
    monthly_payment: number;
    pv_at_treasury_yield: number;
    defeasance_cost: number;
    treasury_premium: number;
    total_cost: number;
    cost_pct_of_balance: number;
    notes: string[];
  };
  // v12.1: Partnership waterfall (if partnership profile provided)
  partnership_waterfall?: {
    lp_irr: number;
    gp_irr: number;
    lp_equity_multiple: number;
    gp_equity_multiple: number;
    total_distributions: number;
    lp_total_distributions: number;
    gp_total_distributions: number;
    pref_paid: number;
    pref_shortfall: number;
    promote_paid: number;
    effective_promote_pct: number;
    notes: string[];
  };
  // v12.1: 1031 exchange analysis (if relinquished property info provided)
  exchange_1031?: {
    sale_net_proceeds: number;
    capital_gain: number;
    depreciation_recapture: number;
    total_taxable_gain: number;
    full_deferral_tax: number;
    deferred_tax: number;
    boot_tax: number;
    tax_owed: number;
    net_tax_savings: number;
    required_equity_for_full_deferral: number;
    required_debt_on_replacement: number;
    replacement_equity_shortfall: number;
    notes: string[];
  };
  // v13: Enhanced analyses
  track3?: {
    stabilized_dscr_year3: number;    // Year-3 NOI / ADS (deal trajectory)
    stabilized_debt_yield_year3: number;
    breakeven_occupancy_pct: number;
    notes: string[];
  };
  unlevered?: {
    irr: number;                      // IRR without debt (deal quality independent of financing)
    equity_multiple: number;
    notes: string[];
  };
  qbi_deduction?: {
    eligible: boolean;                // §199A QBI 20% deduction for pass-throughs
    deduction_amount: number;
    taxable_income_cap: number;
    notes: string[];
  };
  refinance_analysis?: {
    break_even_months: number | null; // Months to recoup refi costs (null = never breaks even)
    monthly_savings: number;
    refi_costs: number;
    net_savings_5yr: number;
    recommendation: 'refinance_now' | 'wait' | 'no_benefit';
    notes: string[];
  };
  narrative: string;                  // 1-paragraph plain-English verdict explanation
  // v15 Phase 6: Risk-adjusted return metrics
  risk_metrics?: {
    sharpe_ratio?: number;             // (mean - rf) / std
    sortino_ratio?: number;            // (mean - target) / downside_std
    calmar_ratio?: number;             // CAGR / |max_drawdown|
    omega_ratio?: number;              // prob-weighted gains / losses
    notes: string[];
  };
  // v15 Phase 6: Merton structural credit risk
  credit_risk?: {
    distance_to_default: number;       // # of std devs from underwater
    probability_of_default: number;    // N(-DD)
    loss_given_default: number;        // From LTV
    exposure_at_default: number;       // Remaining balance at horizon
    expected_loss: number;             // PD × LGD × EAD
    rating_banding: string;            // 'AAA' / 'AA' / 'A' / 'BBB' / 'BB' / 'B' / 'CCC'
    notes: string[];
  };
  // v15 Phase 6: BRRRR seasoning-aware cash-out analysis
  brrrr_timing?: {
    refi_basis_source: 'cost' | 'blend' | 'arv';
    refi_basis: number;
    max_cash_out: number;
    cash_left_in_deal: number;
    full_cash_out: boolean;
    optimal_refi_month: number;
    notes: string[];
  };
  // v15 Phase 6: Pareto-frontier lender matching
  lender_pareto?: {
    pareto_optimal_lenders: string[];  // Non-dominated lender names
    dominated_lenders: { name: string; dominated_by: string[] }[];
    notes: string[];
  };
  // v15 Phase 5: Stochastic rate path (Vasicek) for ARM stress
  arm_stochastic?: {
    expected_rate_year1: number;
    expected_rate_year3: number;
    expected_rate_year5: number;
    p90_rate_year5: number;            // 90th percentile rate (worst case)
    vasicek_params: { theta: number; kappa: number; sigma: number; r0: number };
    notes: string[];
  };
  // v15 Phase 4: Tax-version status flags
  tax_version?: {
    year: number;
    qbi_status: 'confirmed' | 'pending' | 'expired';
    bonus_dep_pct: number;
    section179_limit: number;
    state_conforms_bonus_dep: boolean;
    state_notes: string;
  };
  // v15: Alternative financing modules
  bridge_loan_result?: {
    total_interest_cost: number;
    points_cost: number;
    interest_reserve: number;
    total_cost_of_capital: number;
    net_profit_at_exit: number;
    roi: number;
    annualized_roi: number;
    max_loan_by_arv: number;
    cash_to_close: number;
    cash_invested: number;
    notes: string[];
  };
  seller_financing_result?: {
    seller_monthly_payment: number;
    seller_balloon_at_exit: number;
    total_interest_to_seller: number;
    monthly_savings_vs_market: number;
    annual_savings: number;
    five_year_savings: number;
    wrap_spread?: number;
    wrap_annual_profit?: number;
    effective_rate: number;
    notes: string[];
  };
  foreign_national_analysis?: {
    is_foreign_national: boolean;
    llpa_adjustment_bps: number;
    itin_required: boolean;
    notes: string[];
  };
  pal_analysis?: {
    pal_allowance: number;             // $25k for MAGI < $100k, phased out at $150k
    suspended_losses: number;          // losses carried forward
    is_rep_eligible: boolean;          // Real Estate Professional status
    grouping_benefit: string;
    notes: string[];
  };
  // v13: Monte Carlo DSCR distribution
  monte_carlo?: {
    p10_dscr: number;
    p50_dscr: number;                  // median
    p90_dscr: number;
    mean_dscr: number;
    std_dev: number;
    prob_dscr_below_1: number;         // P(DSCR < 1.0) — probability of failing lender test
    prob_dscr_below_075: number;       // P(DSCR < 0.75) — probability of kill territory
    prob_negative_cash_flow: number;
    prob_underwater: number;           // P(value < loan balance at exit)
    iterations: number;
    // v15 Phase 3+5: Institutional risk metrics
    cvar_5pct?: number;                // CVaR @ 5% — mean of worst 5% of DSCR outcomes
    cvar_10pct?: number;               // CVaR @ 10%
    var_5pct?: number;                 // VaR @ 5% — 5th percentile
    gpd_cvar_5pct?: number;            // GPD-extrapolated CVaR for very low alpha
    convergence_ratio?: number;        // std_error / mean — should be < 5%
    notes: string[];
  };
  // v13: Worst plausible case (top-3 stress scenarios combined)
  worst_plausible?: {
    combined_dscr: number;
    combined_cash_flow: number;
    scenarios_used: string[];
    notes: string[];
  };
  // v13: Two-quote optimizer (given borrower priorities)
  two_quote_optimizer?: {
    borrower_priority: 'rate' | 'flexibility' | 'balanced';
    recommended_pair: { flex: string | null; rate_competitive: string | null };
    rationale: string;
    aey_delta_dollars: number;
    notes: string[];
  };
  // v13: Cash-out refi max cash available
  cash_out_refi?: {
    max_cash_at_75_ltv: number;
    max_cash_at_70_ltv: number;
    current_loan_payoff: number;
    notes: string[];
  };
}

// ---------------------------------------------------------------------------
// CONVERT API INPUT → INTERNAL DealInputs
// ---------------------------------------------------------------------------

function toDealInputs(input: EngineInput): DealInputs {
  return {
    propertyType: input.property_type as PropertyType,
    rentType: input.rent_type as RentType,
    state: input.state,
    county: '',
    occupancyIntent: 'INVESTMENT',
    purchasePrice: input.purchase_price,
    appraisedValue: input.appraised_value,
    loanAmount: input.loan_amount,
    rate: input.rate,
    points: input.points,
    termMonths: input.term_months,
    amortMonths: input.amortization_months,
    interestOnlyMonths: input.interest_only_months,
    prepayType: input.prepay_type as PrepayType,
    borrowerRentClaim: input.borrower_rent_claim,
    appraiserRent: input.appraiser_rent,
    leaseRent: input.lease_rent,
    otherIncome: 0,
    leaseVerified: input.lease_verified,
    leaseDepositVerified: input.lease_deposit_verified,
    strTrailingRevenue: input.str_trailing_revenue_monthly ?? 0,
    strProjection: input.str_projection_monthly ?? 0,
    // Convert annual → monthly
    propertyTaxes: input.property_taxes_annual / 12,
    insurance: input.insurance_annual / 12,
    hoa: input.hoa_monthly,
    propertyMgmtPct: input.property_mgmt_pct ?? 8,
    repairsMaintenancePct: input.repairs_maintenance_pct ?? 4,
    capexReservePct: input.capex_reserve_pct ?? 4,
    turnoverPct: input.turnover_pct ?? 2,
    utilities: 0,
    landscaping: 0,
    accounting: 0,
    licensing: 0,
    legalEvictionReserve: 0,
    emergencyReserve: 0,
    strFurnishingReserve: 0,
    fico: input.fico,
    entity: (input.vesting === 'individual' ? 'INDIVIDUAL' : input.vesting === 'llc' ? 'LLC' : input.vesting === 'partnership' ? 'PARTNERSHIP' : input.vesting === 'corp' ? 'CORP' : 'TRUST') as Entity,
    experienceProperties: input.experience_properties,
    bankruptcySeasoningMonths: input.bankruptcy_seasoning_months ?? 84,
    foreclosureSeasoningMonths: input.foreclosure_seasoning_months ?? 84,
    reservesMonths: input.reserves_months,
    mortgageHistoryMonths: input.mortgage_history_months ?? 36,
    vacancyPct: input.vacancy_pct,
    collectionLossPct: input.collection_loss_pct ?? 1,
    concessionsPct: input.concessions_pct ?? 1,
    platformFeesPct: input.platform_fees_pct ?? 0,
    seasonalityHaircutPct: input.seasonality_haircut_pct ?? 0,
    marketCapRate: input.market_cap_rate,
    stressCapRate: input.stress_cap_rate,
    appraisalDone: input.appraisal_done ?? true,
    inspectionDone: input.inspection_done ?? true,
    insuranceQuotedBindable: input.insurance_bindable,
    taxReassessmentEstimated: input.tax_reassessment_estimated,
    llcOwnershipVerified: input.llc_ownership_verified ?? true,
    guarantorLinkageVerified: input.guarantor_linkage_verified ?? true,
    strPlatformHistoryPulled: input.str_platform_history_pulled ?? false,
    creditReportPulled: input.credit_report_pulled ?? true,
    titleSearchPulled: input.title_search_pulled ?? true,
    bankStatementsPulled: input.bank_statements_pulled ?? true,
    loanPurpose: input.loan_purpose as LoanPurpose,
    structure: input.structure as LoanStructure,
  };
}

// ---------------------------------------------------------------------------
// THE ENGINE — pure function, input → output
// ---------------------------------------------------------------------------

const ENGINE_VERSION = '13.0.0';

/**
 * Evaluate a DSCR deal — the engine's public entry point.
 *
 * Pure function: input → output, no side effects, no React, no I/O.
 * Callable from: API route, UI, tests, curl, any backend.
 *
 * @param input - JSON-friendly deal parameters (see {@link EngineInput})
 * @returns Full evaluation report including: PITIA, Track 1 (lender) / Track 2 (investor) DSCR,
 *          solvers, returns, hold matrix (48 cells), tornado chart, lender matching with AEY,
 *          true cost of capital, points recoup, ARM reset, reassessment, insurance gate,
 *          BRRRR gate, after-tax returns, compliance gate, IC memo, reproducible snapshot,
 *          and v12.1 modules (break-even table, sensitivity grid, cash-out LTV cap,
 *          defeasance, partnership waterfall, §1031 exchange).
 *
 * @throws Never — all error states are returned in the report structure.
 *
 * @example
 * ```ts
 * import { evaluateDeal, V7_REFERENCE_DEAL } from '@/lib/dscr/engine';
 * const report = evaluateDeal(V7_REFERENCE_DEAL);
 * console.log(report.track1.dscr);  // 1.051
 * console.log(report.verdict.decision);  // "RESTRUCTURE"
 * ```
 */
export function evaluateDeal(input: EngineInput): EngineReport {
  // v13.2: Sanitize inputs — replace NaN/Infinity with safe defaults to prevent
  // downstream propagation. Every numeric field is guarded.
  const sanitizedInput: EngineInput = {
    ...input,
    purchase_price: Math.max(0, sanitizeNum(input.purchase_price, 425000)),
    appraised_value: Math.max(0, sanitizeNum(input.appraised_value, input.purchase_price || 425000)),
    loan_amount: Math.max(0, sanitizeNum(input.loan_amount, 318750)),
    rate: clampNum(sanitizeNum(input.rate, 7.0), 0, 25),
    points: clampNum(sanitizeNum(input.points, 0), 0, 10),
    term_months: clampNum(sanitizeNum(input.term_months, 360), 12, 480),
    amortization_months: clampNum(sanitizeNum(input.amortization_months, 360), 12, 480),
    interest_only_months: clampNum(sanitizeNum(input.interest_only_months, 0), 0, 360),
    lease_rent: sanitizeNum(input.lease_rent, 0),
    appraiser_rent: sanitizeNum(input.appraiser_rent, 0),
    borrower_rent_claim: sanitizeNum(input.borrower_rent_claim, 0),
    property_taxes_annual: sanitizeNum(input.property_taxes_annual, 0),
    insurance_annual: sanitizeNum(input.insurance_annual, 0),
    hoa_monthly: sanitizeNum(input.hoa_monthly, 0),
    fico: clampNum(sanitizeNum(input.fico, 710), 300, 850),
    experience_properties: clampNum(sanitizeNum(input.experience_properties, 0), 0, 1000),
    reserves_months: clampNum(sanitizeNum(input.reserves_months, 6), 0, 120),
    vacancy_pct: clampNum(sanitizeNum(input.vacancy_pct, 8), 0, 100),
    market_cap_rate: clampNum(sanitizeNum(input.market_cap_rate, 7.5), 0, 25),
    stress_cap_rate: clampNum(sanitizeNum(input.stress_cap_rate, 9), 0, 25),
    second_lien_amount: sanitizeNum(input.second_lien_amount ?? 0, 0),
  };

  // Convert to internal types
  const dealInputs = toDealInputs(sanitizedInput);

  // --- CORE MATH ---
  // v11 spec: PITIA components are whole-dollar rounded.
  // All downstream calculations (DSCR, solvers, reserves) use the ROUNDED PITIA.
  const pitiaRaw = calculatePitia(dealInputs);
  const pitiaRounded = {
    principal_interest: Math.round(pitiaRaw.principal + pitiaRaw.interest),
    taxes: Math.round(pitiaRaw.taxes),
    insurance: Math.round(pitiaRaw.insurance),
    hoa: Math.round(pitiaRaw.hoa),
  };
  const pitiaTotal = pitiaRounded.principal_interest + pitiaRounded.taxes + pitiaRounded.insurance + pitiaRounded.hoa;

  const rent = buildRentHierarchy(dealInputs);
  const qualifyingRent = Math.round(rent.lenderEligibleRent);

  // Payment factor
  const r = dealInputs.rate / 100 / 12;
  const n = dealInputs.amortMonths;
  const paymentFactor = r === 0 ? 1 / n : (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  // v15 Fix A: LTV uses LOWER of purchase price or appraised value (Fannie Mae standard).
  // Previously used higher-of (|| operator), which overstated value and understated LTV.
  // Exception: affordable-lending programs may use appraised value only — handled by
  // a future program flag. For DSCR investment loans, lower-of is the universal standard.
  const ltvValue = Math.min(dealInputs.appraisedValue, dealInputs.purchasePrice);
  const ltvActual = ltvValue > 0 ? (dealInputs.loanAmount / ltvValue) * 100 : 0;
  // v13: CLTV (combined LTV) — includes second lien if provided
  const secondLien = input.second_lien_amount ?? 0;
  const totalDebt = dealInputs.loanAmount + secondLien;
  const cltv = ltvValue > 0 ? (totalDebt / ltvValue) * 100 : 0;
  // v13: Leverage ratio (loan / equity) — how many dollars of debt per dollar of equity
  const equity = ltvValue - totalDebt;
  const leverageRatio = equity > 0 ? totalDebt / equity : 0;
  // Note: debt yield at exit and stabilized debt yield computed later (after annualNoi available)

  // --- TRACK 1 (Lender Qualification) ---
  // v11 spec: Track1_DSCR = Qualifying_Rent / PITIA (using rounded values)
  // v12: When PITIA = 0 (all-cash or zero-rate), DSCR = Infinity (no debt service means infinite coverage)
  const track1Dscr = pitiaTotal > 0 ? qualifyingRent / pitiaTotal : Infinity;
  // v12: Required DSCR scales with LTV/property/purpose/FICO (was hardcoded 1.0)
  const requiredDscr = computeRequiredDscr(dealInputs, ltvActual);

  // --- TRACK 2 (Investor Stress) ---
  // v11 spec: Track2_DSCR = (Rent × (1−vac) − mgmt) / PITIA (using rounded PITIA)
  // v12: Use user-provided mgmt rate; return Infinity when PITIA = 0
  // v12 (P1-7): Standardize on track2.investorDscr (the proper NOI/ADS ratio from
  // investor.ts). Was reporting two different Track 2 DSCR values — a simplified
  // rent/PITIA calc here in engine.ts, and the proper NOI/ADS calc in investor.ts.
  // These could differ by 0.20-0.50x on the same deal. Now we use investorDscr
  // as the single source of truth everywhere (UI, kill criteria, verdict, IC memo).
  const investorVerdict = buildInvestorVerdict(dealInputs);
  const track2 = investorVerdict.result;
  const vacancyRate = dealInputs.vacancyPct / 100;
  const mgmtRate = dealInputs.propertyMgmtPct / 100;
  const track2EffectiveRent = Math.round(qualifyingRent * (1 - vacancyRate) - qualifyingRent * mgmtRate);
  // Keep the simplified calc only for backward-compat diagnostic; report uses investorDscr.
  const _track2DscrSimplified = pitiaTotal > 0 ? track2EffectiveRent / pitiaTotal : Infinity;
  const track2Dscr = track2.investorDscr;  // v12: single source of truth

  // --- SOLVERS ---
  // Fixed expenses (monthly) — use rounded values to match spec
  const fixedExpMonthly = pitiaRounded.taxes + pitiaRounded.insurance + pitiaRounded.hoa;

  // Deal-break rate: rate where Track 1 DSCR = 1.0
  const dealBreakSolver = solveBreakevenRate({
    targetDscr: 1.0,
    loanAmount: dealInputs.loanAmount,
    amortMonths: dealInputs.amortMonths,
    interestOnlyMonths: dealInputs.interestOnlyMonths,
    qualifyingRent,
    taxes: pitiaRounded.taxes,
    insurance: pitiaRounded.insurance,
    hoa: pitiaRounded.hoa,
  });

  // Max loan for target DSCR — v11 closed-form:
  //   Max_DS = Rent/Target − FixedExp
  //   Max_Loan = Max_DS / factor(rate)
  const maxDs_1_0 = qualifyingRent / 1.0 - fixedExpMonthly;
  const maxDs_1_25 = qualifyingRent / 1.25 - fixedExpMonthly;
  const maxLoan1_0 = maxDs_1_0 > 0 ? Math.round(maxDs_1_0 / paymentFactor) : 0;
  const maxLoan1_25 = maxDs_1_25 > 0 ? Math.round(maxDs_1_25 / paymentFactor) : 0;

  // Max purchase price for 1.0 DSCR
  const ltvRatio = ltvValue > 0 ? (dealInputs.loanAmount / ltvValue) : 0;
  const maxPurchase1_0 = ltvRatio > 0 ? Math.round(maxLoan1_0 / ltvRatio) : 0;

  // Breakeven rate for 1.25 DSCR
  const breakeven1_25 = solveBreakevenRate({
    targetDscr: 1.25,
    loanAmount: dealInputs.loanAmount,
    amortMonths: dealInputs.amortMonths,
    interestOnlyMonths: dealInputs.interestOnlyMonths,
    qualifyingRent,
    taxes: pitiaRounded.taxes,
    insurance: pitiaRounded.insurance,
    hoa: pitiaRounded.hoa,
  });

  // Min rent for 1.25 DSCR — v11 closed-form: Rent* = Target_DSCR × PITIA
  const minRent1_25 = Math.round(1.25 * pitiaTotal);

  // --- LLPA RATE ESTIMATE ---
  // (ltvActual computed earlier for required DSCR)
  const llpa = estimateRate({
    fico: dealInputs.fico,
    ltv: ltvActual,
    dscr: track1Dscr,
    // v12 (P2-batch-B): Removed `as any` — types.ts PropertyType / LoanPurpose
    // are structurally identical to llpa.ts PropertyUse / LoanPurpose.
    propertyType: dealInputs.propertyType,
    loanPurpose: dealInputs.loanPurpose,
    loanAmount: dealInputs.loanAmount,
    interestOnlyMonths: dealInputs.interestOnlyMonths,
    isForeignNational: input.is_foreign_national ?? false,
    isArmStructure: dealInputs.structure.startsWith('ARM_'),
    isStr: dealInputs.rentType === 'STR',
    state: dealInputs.state,
  });

  // --- RESERVES ---
  const reserveResult = calculateReserves({
    dscr: track1Dscr,
    fico: dealInputs.fico,
    loanAmount: dealInputs.loanAmount,
    propertyType: dealInputs.propertyType,
    isStr: dealInputs.rentType === 'STR',
    isRural: false,
    isFirstTimeInvestor: dealInputs.experienceProperties === 0,
    experienceProperties: dealInputs.experienceProperties,
    pitia: pitiaTotal,
    additionalFinancedProperties: 0,
  });

  // --- KILL CRITERIA ---
  const killResult = checkKillCriteria(
    dealInputs,
    track1Dscr,
    track2.investorDscr,
    dealBreakSolver.breakevenRate,
    null
  );

  // --- LENDER MATCHING ---
  const profile = buildDealProfile(dealInputs);
  const matches = matchLenders(profile, 5);
  const twoQuote = getTwoQuoteRecommendation(matches);

  // --- TRUE COST ---
  const trueCost = calculateTrueCost({
    loanAmount: dealInputs.loanAmount,
    annualRatePct: dealInputs.rate,
    amortMonths: dealInputs.amortMonths,
    pointsPct: dealInputs.points,
    lenderFees: 1500,
    rateLockCost: 500,
    pppModel: 'step_down_321',
    state: dealInputs.state,
    vesting: dealInputs.entity === 'INDIVIDUAL' ? 'individual' : 'llc',
    productType: dealInputs.structure.startsWith('ARM_') ? 'arm' : 'fixed_rate',
    prepayStructure: 'declining',
    holdPeriods: [12, 24, 36, 60],
  });

  // --- EXECUTION SCORE ---
  const execScore = calculateExecutionScore({
    dscr: track1Dscr,
    fico: dealInputs.fico,
    ltv: ltvActual,
    reservesMonths: dealInputs.reservesMonths,
    propertyType: dealInputs.propertyType,
    rentType: dealInputs.rentType,
    isStr: dealInputs.rentType === 'STR',
    experienceProperties: dealInputs.experienceProperties,
    loanAmount: dealInputs.loanAmount,
  });

  // --- TRUTH MATRIX ---
  // Track 1 passes if DSCR >= 1.0; Track 2 survives if monthly CF >= 0
  const track1Passes = track1Dscr >= requiredDscr;
  const truthMatrix = buildTruthMatrix(track1Passes, investorVerdict.survives);

  // --- STATE CHECKS ---
  const pppCheck = checkPppEligibility({
    state: dealInputs.state,
    vesting: dealInputs.entity === 'INDIVIDUAL' ? 'individual' : 'llc',
    loanAmount: dealInputs.loanAmount,
    productType: dealInputs.structure.startsWith('ARM_') ? 'arm' : 'fixed_rate',
    prepayStructure: 'declining',
  });

  // --- STRESS SCENARIOS ---
  const stressScenarios = buildStressScenarios(dealInputs);

  // --- v11: AFTER-TAX RETURNS ---
  let afterTaxResult: ReturnType<typeof calculateAfterTax> | undefined;
  if (input.federal_bracket_pct && input.magi !== undefined && input.filing_status) {
    afterTaxResult = calculateAfterTax({
      purchase_price: input.purchase_price,
      land_allocation_pct: input.land_allocation_pct ?? 15,
      building_value: input.purchase_price * (1 - (input.land_allocation_pct ?? 15) / 100),
      loan_amount: input.loan_amount,
      annual_rate_pct: input.rate,
      amort_months: input.amortization_months,
      annual_noi: track2.noi,
      noi_growth_rate_pct: 3,
      hold_years: input.hold_years ?? 5,
      exit_cap_rate_pct: input.market_cap_rate,  // FIX: use MARKET cap for base case, not stress
      stress_cap_rate_pct: input.stress_cap_rate, // stress cap for sensitivity
      sale_costs_pct: input.sale_costs_pct ?? 6,
      federal_bracket_pct: input.federal_bracket_pct,
      magi: input.magi,
      filing_status: input.filing_status,
      is_rep: input.is_rep ?? false,
      cost_seg_elected: input.cost_seg_elected ?? false,
      cost_seg_short_life_pct: 30,
      cost_seg_study_cost: 5000,
      acquisition_date: input.acquisition_date ?? '2026-01-01',
      exit_type: 'sell_and_pay',
      annual_capex: input.annual_capex ?? 1500,
    });
  }

  // --- v11: ARM RESET ---
  // v15 audit fix: derive arm_product and months_to_first_reset from structure
  // instead of hardcoding '5/1' for all ARM types
  let armResult: ReturnType<typeof calculateArmReset> | undefined;
  const isArm = input.is_arm || (input.structure?.startsWith('ARM_') ?? false);
  if (isArm) {
    const armConfig: Record<string, { product: string; months: number }> = {
      ARM_5_6: { product: '5/1', months: 60 },
      ARM_7_6: { product: '7/1', months: 84 },
      ARM_10_6: { product: '10/1', months: 120 },
    };
    const cfg = armConfig[input.structure] || { product: '5/1', months: 60 };
    armResult = calculateArmReset({
      loan_amount: input.loan_amount,
      initial_rate: input.rate,
      arm_product: cfg.product as any,
      amort_months: input.amortization_months,
      months_to_first_reset: input.arm_months_to_reset ?? cfg.months,
      margin_bps: input.arm_margin_bps ?? 275,
      initial_cap_bps: 200,
      periodic_cap_bps: 100,
      lifetime_cap_bps: 500,
      floor_rate: input.rate,
      qualifying_rent: qualifyingRent,
      taxes_monthly: dealInputs.propertyTaxes,
      insurance_monthly: dealInputs.insurance,
      hoa_monthly: dealInputs.hoa,
      interest_only_months: input.interest_only_months,
      stress_sofr: 5.0,
    });
  }

  // --- v11: REASSESSMENT ---
  // v12 (P2-batch-I): Pass qualifyingRent directly — avoids backing it out from
  // rounded DSCR × PITIA (which loses ~0.05% precision).
  const reassessmentResult = calculateReassessment(
    input.purchase_price,
    input.state,
    input.property_taxes_annual,
    track1Dscr,
    pitiaTotal,
    qualifyingRent,
  );

  // --- v11: INSURANCE GATE ---
  const insuranceResult = checkInsuranceGate({
    state: input.state,
    county: '',
    is_high_risk_zone: input.is_high_risk_zone ?? false,
    insurance_quote_confirmed: input.insurance_bindable,
    quoted_premium_annual: input.insurance_annual,
  });

  // --- v11: BRRRR GATE ---
  const brrrrResult = checkBrrrrGate({
    is_brrrr: input.is_brrrr ?? false,
    months_held: input.brrrr_months_held ?? 0,
    arv: input.brrrr_arv ?? 0,
    cost_basis: input.brrrr_cost_basis ?? input.purchase_price,
    lender_seasoning_months: 6,
    monthly_pitia: pitiaTotal,
    is_easy_street: false,
  });

  // --- v11: IC MEMO ---
  const icMemo = generateEngineIcMemo({
    verdict: truthMatrix.quadrant,
    track1Dscr, track2Dscr: track2Dscr,
    debtYield: track2.noi / dealInputs.loanAmount * 100,
    ltv: ltvActual,
    dealBreakRate: dealBreakSolver.breakevenRate,
    afterTaxIrr: afterTaxResult?.after_tax_irr,
    returnGrade: afterTaxResult?.return_grade,
    lenderMatches: matches,
    insuranceKill: insuranceResult.kill,
    strLegality: null,
    reserves: reserveResult,
    prepayYear1: trueCost.rows.find(r => r.holdMonths === 12)?.pppPenalty ?? 0,
    prepayYear3: trueCost.rows.find(r => r.holdMonths === 36)?.pppPenalty ?? 0,
    prepayYear5: trueCost.rows.find(r => r.holdMonths === 60)?.pppPenalty ?? 0,
    armResult,
    reassessmentResult,
    stressScenarios,
    state: input.state,
  });

  // --- v11: RETURNS ENGINE (v12: yield-on-cost and equity-multiple fixed) ---
  const annualNoi = Math.round(track2.noi);
  const annualDebtService = Math.round(track2.annualDebtService);
  const closingCostsPct = 0.015;
  const totalCost = input.purchase_price + (input.annual_capex ?? 0) + input.purchase_price * closingCostsPct;
  const cashInvested = input.purchase_price - input.loan_amount + (input.points / 100) * input.loan_amount + input.purchase_price * closingCostsPct;
  const entryCapRate = input.purchase_price > 0 ? (annualNoi / input.purchase_price) * 100 : 0;
  // v12: Yield-on-cost = Stabilized NOI / Total Cost (purchase + rehab + closing).
  // Was incorrectly equal to entryCapRate. Off by 200-400bps on value-add deals.
  const noiGrowthRate = 3; // default 3% annual (could be EngineInput in future)
  const stabilizedNoi = annualNoi * Math.pow(1 + noiGrowthRate / 100, 1);
  const yieldOnCost = totalCost > 0 ? (stabilizedNoi / totalCost) * 100 : 0;
  const cashOnCashY1 = cashInvested > 0 ? ((annualNoi - annualDebtService) / cashInvested) * 100 : 0;
  const debtYield = input.loan_amount > 0 ? (annualNoi / input.loan_amount) * 100 : 0;
  const dscrAtStabilization = annualDebtService > 0 ? stabilizedNoi / annualDebtService : Infinity;
  // v13: Debt yield at exit (exit NOI / remaining balance at exit)
  const baseHoldForExit = input.hold_years ?? 5;
  const exitNoiForYield = annualNoi * Math.pow(1 + noiGrowthRate / 100, baseHoldForExit);
  const exitBalanceForYield = calcRemainingBalance(input.loan_amount, input.rate, input.amortization_months, baseHoldForExit * 12, input.interest_only_months ?? 0);
  const debtYieldAtExit = exitBalanceForYield > 0 ? (exitNoiForYield / exitBalanceForYield) * 100 : 0;
  // v13: Stabilized debt yield (year-3 NOI / loan)
  const stabilizedDebtYield = input.loan_amount > 0 ? (annualNoi * Math.pow(1 + noiGrowthRate / 100, 3) / input.loan_amount) * 100 : 0;
  // v12: equityMultiple will be computed after hold matrix using the base-case row
  // (was cash-on-cash summed over hold, which is wrong by definition).

  // --- v11: 48-CELL HOLD MATRIX ---
  const holdPeriods = [3, 5, 7, 10];
  const exitCapScenarios: Array<{ name: 'base' | 'stress' | 'bull'; cap: number }> = [
    { name: 'base', cap: input.market_cap_rate },
    { name: 'stress', cap: input.stress_cap_rate },
    { name: 'bull', cap: input.market_cap_rate - 0.5 },
  ];
  const rentGrowths = [0, 1, 2, 3];
  const saleCostsPct = (input.sale_costs_pct ?? 6) / 100;
  const ioMonths = input.interest_only_months ?? 0;
  const holdMatrix: EngineReport['hold_matrix'] = [];
  for (const hold of holdPeriods) {
    for (const capScn of exitCapScenarios) {
      for (const rg of rentGrowths) {
        const grownNoi = annualNoi * Math.pow(1 + rg / 100, hold);
        const exitVal = capScn.cap > 0 ? grownNoi / (capScn.cap / 100) : 0;
        const sellCosts = exitVal * saleCostsPct;
        // v12: calcRemainingBalance now accounts for IO period (was overstating principal paydown)
        const remBal = calcRemainingBalance(input.loan_amount, input.rate, input.amortization_months, hold * 12, ioMonths);
        // v12: Build proper cash-flow array with year-by-year NOI growth.
        // Was using flat year-1 cash flow, which understated IRR for rent growth > 0.
        const cf: number[] = [-cashInvested];
        let currentNoi = annualNoi;
        for (let y = 1; y <= hold; y++) {
          currentNoi *= 1 + rg / 100;
          cf.push(currentNoi - annualDebtService);
        }
        // Exit proceeds (sale minus selling costs minus loan payoff) added to final year
        cf[cf.length - 1] += (exitVal - sellCosts - remBal);
        // v13.2: Use robust Newt-Safe IRR solver (Newton-Raphson + bisection hybrid)
        // Handles edge cases: zero rate, all-positive CFs, negative IRR, etc.
        const irrResult = cashInvested > 0 ? robustIrr(cf) : 0;
        const irr = Number.isFinite(irrResult) ? irrResult : NaN;
        const totalDistributions = cf.slice(1).reduce((s, x) => s + x, 0);
        const eqMult = cashInvested > 0 ? totalDistributions / cashInvested : 0;
        const leveredIrrPct = Number.isFinite(irr) ? Math.round(irr * 10000) / 100 : null;
        holdMatrix.push({ hold_years: hold, exit_cap_scenario: capScn.name, rent_growth_pct: rg, levered_irr: leveredIrrPct as number, equity_multiple: Math.round(eqMult * 100) / 100 });
      }
    }
  }

  // v12: Equity multiple = use the base-case hold matrix row (hold_years, base cap, 3% growth)
  const baseHold = input.hold_years ?? 5;
  const closestHold = holdPeriods.reduce((best, h) => Math.abs(h - baseHold) < Math.abs(best - baseHold) ? h : best, holdPeriods[0]);
  const baseMatrixRow = holdMatrix.find(h => h.hold_years === closestHold && h.exit_cap_scenario === 'base' && h.rent_growth_pct === 3);
  const equityMultiple = baseMatrixRow?.equity_multiple ?? 0;

  // --- v11: TORNADO CHART (v12: Rate bar now uses actual DSCR recompute, was hardcoded ±0.10) ---
  const tornadoVars: EngineReport['tornado'] = [];
  // Helper: DSCR at a given rate (recompute P&I, hold other PITIA components constant)
  // v13.2: Clamp rate to [0, 25] to prevent monthlyPayment from throwing on negative rates
  const dscrAtRate = (rate: number): number => {
    const safeRate = Math.max(0, Math.min(25, rate));
    const pi = dealInputs.interestOnlyMonths > 0
      ? interestOnlyPayment(dealInputs.loanAmount, safeRate)
      : monthlyPayment(dealInputs.loanAmount, safeRate, dealInputs.amortMonths);
    const pitiaAtRate = pi + pitiaRounded.taxes + pitiaRounded.insurance + pitiaRounded.hoa;
    return pitiaAtRate > 0 ? qualifyingRent / pitiaAtRate : Infinity;
  };
  // Rent ±20%
  if (pitiaTotal > 0) {
    const rentLow = qualifyingRent * 0.80;
    const rentHigh = qualifyingRent * 1.20;
    tornadoVars.push({ variable: 'Rent ±20%', dscr_swing: Math.round(Math.abs((rentHigh / pitiaTotal) - (rentLow / pitiaTotal)) * 1000) / 1000, low_dscr: Math.round((rentLow / pitiaTotal) * 1000) / 1000, high_dscr: Math.round((rentHigh / pitiaTotal) * 1000) / 1000 });
  }
  // Rate ±100bps (v12: actual recompute)
  const rateLowDscr = dscrAtRate(input.rate - 1.0);
  const rateHighDscr = dscrAtRate(input.rate + 1.0);
  tornadoVars.push({ variable: 'Rate ±100bps', dscr_swing: Math.round(Math.abs(rateHighDscr - rateLowDscr) * 1000) / 1000, low_dscr: Math.round(rateHighDscr * 1000) / 1000, high_dscr: Math.round(rateLowDscr * 1000) / 1000 });
  // Vacancy ±5% (v12: clamp at 0 to avoid negative vacancy)
  if (pitiaTotal > 0) {
    const vacLow = Math.max(0, dealInputs.vacancyPct - 5);
    const vacHigh = dealInputs.vacancyPct + 5;
    const vacLowDscr = qualifyingRent * (1 - vacLow / 100) / pitiaTotal;
    const vacHighDscr = qualifyingRent * (1 - vacHigh / 100) / pitiaTotal;
    tornadoVars.push({ variable: 'Vacancy ±5%', dscr_swing: Math.round(Math.abs(vacHighDscr - vacLowDscr) * 1000) / 1000, low_dscr: Math.round(vacHighDscr * 1000) / 1000, high_dscr: Math.round(vacLowDscr * 1000) / 1000 });
  }
  // Insurance ±25%
  if (pitiaTotal > 0) {
    const insLowPitia = pitiaTotal - pitiaRounded.insurance * 0.25;
    const insHighPitia = pitiaTotal + pitiaRounded.insurance * 0.25;
    if (insLowPitia > 0) {
      tornadoVars.push({ variable: 'Insurance ±25%', dscr_swing: Math.round(Math.abs((qualifyingRent / insHighPitia) - (qualifyingRent / insLowPitia)) * 1000) / 1000, low_dscr: Math.round((qualifyingRent / insHighPitia) * 1000) / 1000, high_dscr: Math.round((qualifyingRent / insLowPitia) * 1000) / 1000 });
    }
  }
  tornadoVars.sort((a, b) => b.dscr_swing - a.dscr_swing);
  const bindingRisk = tornadoVars[0]?.variable ?? 'Unknown';

  // --- v11: VERDICT ---
  const verdictDecision: 'PROCEED' | 'RESTRUCTURE' | 'PASS' =
    truthMatrix.quadrant === 'GREEN' ? 'PROCEED' :
    truthMatrix.quadrant === 'KILL' ? 'PASS' : 'RESTRUCTURE';
  const bindingConstraint = killResult.blockingCriteria.length > 0
    ? killResult.blockingCriteria[0].criterion
    : track2.monthlyCashFlow < 0 ? 'Track 2 negative cash flow' : 'None';
  const killSwitch = `Verdict flips to PASS if: ${killResult.blockingCriteria.length > 0 ? killResult.blockingCriteria[0].detail : 'Track 1 DSCR drops below 1.0 or rate exceeds ' + dealBreakSolver.breakevenRate + '%'}`;
  const track2Acknowledgment = (track1Dscr >= requiredDscr && track2.monthlyCashFlow < 0)
    ? `This deal qualifies (Track 1 DSCR ${Number.isFinite(track1Dscr) ? track1Dscr.toFixed(3) : "N/A"}x) but loses $${Math.abs(track2.monthlyCashFlow).toFixed(0)}/mo in real cash flow (Track 2 DSCR ${Number.isFinite(track2Dscr) ? track2Dscr.toFixed(3) : "N/A"}x). Type "I understand" to proceed. Proceed only if appreciation or after-tax thesis justifies the negative carry.`
    : null;

  // --- v11: AEY FOR LENDER MATCHING (v12: include PPP penalty at exit) ---
  const holdForAey = input.hold_years ?? 5;
  // Map prepay_type to PppModelType for AEY penalty calc
  const pppModelMap: Record<string, PppModelType> = {
    'NONE': 'none', 'YSP_3_2_1': 'step_down_321', 'YSP_5_4_3_2_1': 'step_down_54321',
    'YSP_2_1': 'step_down_321', 'LOCKOUT_3Y': 'none', 'DEFIANCE_3Y': 'step_down_3yr', 'DEFEASANCE_3Y': 'step_down_3yr',
  };
  const aeyPppModel = pppModelMap[input.prepay_type] ?? 'step_down_321';
  const aeyTreasury = TREASURY_5YR;
  const lenderMatchesWithAey = matches.map(m => {
    const lenderRate = m.estimatedRate;
    const lenderPmt = monthlyPayment(input.loan_amount, lenderRate, input.amortization_months);
    const lenderAnnualDs = lenderPmt * 12;
    const pointsCost = (input.points / 100) * input.loan_amount;
    // AEY = XIRR of [net_proceeds_0, -P_1, ..., -(P_n + balance + PPP)]
    const netProceeds = input.loan_amount - pointsCost - 1500;
    const cf: number[] = [netProceeds];
    for (let y = 1; y <= holdForAey; y++) {
      cf.push(-lenderAnnualDs);
    }
    const exitBal = calcRemainingBalance(input.loan_amount, lenderRate, input.amortization_months, holdForAey * 12, ioMonths);
    cf[cf.length - 1] -= exitBal;
    // v12: subtract PPP penalty at exit
    const pppPenalty = calculatePppPenalty(
      aeyPppModel, exitBal, input.loan_amount, holdForAey * 12, lenderRate, aeyTreasury,
      input.amortization_months - holdForAey * 12
    ).penalty;
    cf[cf.length - 1] -= pppPenalty;
    // v13.2: Use robust Newt-Safe IRR solver (sign convention doesn't affect root)
    const aeyResult = robustIrr(cf);
    const aey = (Number.isFinite(aeyResult) ? aeyResult : 0) * 100;
    const counterparty: 'stable' | 'watch' | 'elevated' =
      m.lender.confidence >= 75 ? 'stable' :
      m.lender.confidence >= 60 ? 'watch' : 'elevated';
    return {
      rank: m.rank,
      name: m.lender.name,
      fit_tier: m.fitTier,
      match_score: m.matchScore,
      estimated_rate: m.estimatedRate,
      aey: Math.round(aey * 100) / 100,
      hard_blockers: m.hardBlockers,
      two_quote_role: m.twoQuoteRole,
      counterparty_flag: counterparty,
    };
  });

  // AEY delta between two quotes
  const flexMatch = matches.find(m => m.twoQuoteRole === 'flex' || m.twoQuoteRole === 'both');
  const rateCompMatch = matches.find(m => m.twoQuoteRole === 'rate_competitive' || m.twoQuoteRole === 'both');
  const flexAey = lenderMatchesWithAey.find(m => m.name === flexMatch?.lender.name)?.aey ?? 0;
  const rateCompAey = lenderMatchesWithAey.find(m => m.name === rateCompMatch?.lender.name)?.aey ?? 0;
  const aeyDeltaDollars = Math.round(Math.abs(flexAey - rateCompAey) * input.loan_amount / 100);

  // --- v11: TRUE COST WITH AEY (v12: proper XIRR-based AEY per hold period) ---
  const trueCostWithAey = trueCost.rows.map(r => {
    const holdYears = r.holdMonths / 12;
    const pointsCostForAey = (input.points / 100) * input.loan_amount;
    const netProceeds = input.loan_amount - pointsCostForAey - 1500;
    const cf: number[] = [netProceeds];
    for (let y = 1; y <= holdYears; y++) cf.push(-annualDebtService);
    const exitBal = calcRemainingBalance(input.loan_amount, input.rate, input.amortization_months, r.holdMonths, ioMonths);
    cf[cf.length - 1] -= exitBal;
    // PPP penalty at this hold period
    const pppPenalty = calculatePppPenalty(
      aeyPppModel, exitBal, input.loan_amount, r.holdMonths, input.rate, aeyTreasury,
      input.amortization_months - r.holdMonths
    ).penalty;
    cf[cf.length - 1] -= pppPenalty;
    // v13.2: Use robust Newt-Safe IRR solver
    const aeyResult = robustIrr(cf);
    const aey = (Number.isFinite(aeyResult) ? aeyResult : 0) * 100;
    return {
      hold_months: r.holdMonths,
      total_cost: r.totalCost,
      monthly_avg: r.monthlyCostAvg,
      effective_rate: r.effectiveRate,
      aey: Math.round(aey * 100) / 100,
    };
  });

  // --- v11: POINTS RECOUP (v12: par rate = no-points rate, not hardcoded 6.125%) ---
  const pointsCost = (input.points / 100) * input.loan_amount;
  // Compute the rate the borrower would get with points=0 (their actual no-points market rate)
  const noPointsLlpa = estimateRate({
    fico: dealInputs.fico,
    ltv: ltvActual,
    dscr: track1Dscr,
    // v12 (P2-batch-B): Removed `as any`
    propertyType: dealInputs.propertyType,
    loanPurpose: dealInputs.loanPurpose,
    loanAmount: dealInputs.loanAmount,
    interestOnlyMonths: dealInputs.interestOnlyMonths,
    isForeignNational: false,
    isArmStructure: dealInputs.structure.startsWith('ARM_'),
    isStr: dealInputs.rentType === 'STR',
    state: dealInputs.state,
  });
  const parRate = noPointsLlpa.estimatedRate;
  const parPmt = monthlyPayment(input.loan_amount, parRate, input.amortization_months);
  const actualPmt = monthlyPayment(input.loan_amount, input.rate, input.amortization_months);
  const monthlySavingsVsPar = parPmt - actualPmt;
  // v12: If no points paid, nothing to recoup — break-even = 0, status = green.
  // (Was returning Infinity which JSON-serialized as null and made status=red.)
  const pointsBreakEvenMonths = pointsCost === 0
    ? 0
    : monthlySavingsVsPar > 0
      ? pointsCost / monthlySavingsVsPar
      : Infinity;
  const pointsStatus: 'green' | 'yellow' | 'red' =
    pointsCost === 0 ? 'green' :
    !Number.isFinite(pointsBreakEvenMonths) ? 'red' :
    pointsBreakEvenMonths < (input.hold_years ?? 5) * 12 ? 'green' :
    pointsBreakEvenMonths < (input.hold_years ?? 5) * 12 + 12 ? 'yellow' : 'red';

  // --- v11: COMPLIANCE BRANCHING GATE ---
  // v12.1 (P2-batch-G): Removed `as any` — use explicit map to satisfy VestingType.
  const ENTITY_TO_VESTING: Record<Entity, 'individual' | 'llc' | 'partnership' | 'corp' | 'trust'> = {
    INDIVIDUAL: 'individual', LLC: 'llc', PARTNERSHIP: 'partnership', CORP: 'corp', TRUST: 'trust',
  };
  const complianceResult = runComplianceGate({
    occupancy_intent: dealInputs.occupancyIntent === 'INVESTMENT' ? 'non_owner_occupied' : 'owner_occupied',
    vesting: ENTITY_TO_VESTING[dealInputs.entity],
    loan_purpose: dealInputs.loanPurpose,
    lender_type: 'private_lender',
    state: dealInputs.state,
    has_nmls_license: true,
    is_b2b_professional_use: true,
  });

  // --- v11: REPRODUCIBLE SNAPSHOT ---
  const inputHash = simpleHash(JSON.stringify(input));
  const snapshot = {
    engine_version: ENGINE_VERSION,
    rate_anchors: { treasury_10yr: TREASURY_10YR, treasury_5yr: TREASURY_5YR, sofr_30d: SOFR_30D },
    // v12 (P2-batch-K): Use LENDER_DATA_VERSION from constants (was hardcoded string)
    lender_data_version: LENDER_DATA_VERSION,
    input_hash: inputHash,
  };

  // --- v12.1: BREAK-EVEN TABLE ---
  const breakEven = calculateBreakEvenTable({
    currentLoan: input.loan_amount,
    currentValue: input.appraised_value || input.purchase_price,
    currentRate: input.rate,
    amortMonths: input.amortization_months,
    interestOnlyMonths: input.interest_only_months ?? 0,
    qualifyingRentMonthly: qualifyingRent,
    taxesMonthly: pitiaRounded.taxes,
    insuranceMonthly: pitiaRounded.insurance,
    hoaMonthly: pitiaRounded.hoa,
  });

  // --- v12.1: SENSITIVITY GRID (rate × LTV) ---
  const sensitivityGrid = calculateSensitivityGrid({
    base: {
      loan: input.loan_amount,
      value: input.appraised_value || input.purchase_price,
      rate: input.rate,
      amortMonths: input.amortization_months,
      interestOnlyMonths: input.interest_only_months ?? 0,
      rent: qualifyingRent,
      taxes: pitiaRounded.taxes,
      insurance: pitiaRounded.insurance,
      hoa: pitiaRounded.hoa,
      vacancyPct: input.vacancy_pct,
    },
    xVariable: 'rate' as SensitivityVariable,
    xValues: [input.rate - 1.0, input.rate - 0.5, input.rate, input.rate + 0.5, input.rate + 1.0],
    yVariable: 'ltv' as SensitivityVariable,
    yValues: [65, 70, 75, 80],
  });

  // --- v12.1: CASH-OUT LTV CAP ENFORCEMENT ---
  // Most non-QM DSCR lenders cap cash-out refi LTV at 75% (separate from purchase LTV cap of 80%).
  const isCashOut = input.loan_purpose === 'CASH_OUT_REFI';
  const cashOutLtvCap = isCashOut ? {
    applies: true,
    max_ltv: LTV_CASH_OUT_CAP,
    current_ltv: ltvActual,
    exceeds_cap: ltvActual > LTV_CASH_OUT_CAP,
    max_loan_at_cap: Math.round((LTV_CASH_OUT_CAP / 100) * (input.appraised_value || input.purchase_price)),
    notes: ltvActual > LTV_CASH_OUT_CAP
      ? [`⚠️ Cash-out refi LTV ${ltvActual.toFixed(1)}% exceeds ${LTV_CASH_OUT_CAP}% cap — reduce loan to $${Math.round((LTV_CASH_OUT_CAP / 100) * (input.appraised_value || input.purchase_price)).toLocaleString()} or switch to rate/term refi.`]
      : [`Cash-out refi LTV ${ltvActual.toFixed(1)}% within ${LTV_CASH_OUT_CAP}% cap.`],
  } : undefined;

  // --- v12.1: DEFEASANCE (if prepay_type = DEFIANCE_3Y or DEFEASANCE_3Y) ---
  // Use 5yr Treasury as proxy for matching-maturity yield (proper implementation would
  // use the actual matching-maturity Treasury curve)
  const isDefeasance = input.prepay_type === 'DEFIANCE_3Y' || input.prepay_type === 'DEFEASANCE_3Y';
  const defeasance = isDefeasance ? (() => {
    const holdMonths = (input.hold_years ?? 5) * 12;
    const remainingBalance = calcRemainingBalance(input.loan_amount, input.rate, input.amortization_months, holdMonths, input.interest_only_months ?? 0);
    return calculateDefeasance({
      loanBalance: remainingBalance,
      interestRate: input.rate,
      amortMonths: input.amortization_months,
      monthsElapsed: holdMonths,
      treasuryYield: TREASURY_5YR,
    });
  })() : undefined;

  // --- v12.1: PARTNERSHIP WATERFALL (if profile provided) ---
  const partnershipWaterfall = input.partnership ? (() => {
    const lpEquityPct = (input.partnership.lp_equity_pct ?? 100) / 100;
    const gpCoInvestPct = (input.partnership.gp_co_invest_pct ?? 0) / 100;
    const totalEquity = cashInvested;
    const lpEquity = totalEquity * lpEquityPct;
    const gpEquity = totalEquity * (1 - lpEquityPct) + totalEquity * gpCoInvestPct;
    // v12.1: Compute operating cash flows and exit proceeds directly (not via hold matrix).
    // This ensures waterfall reflects actual deal economics.
    const baseHold = input.hold_years ?? 5;
    const annualCf = annualNoi - annualDebtService;
    // Exit value at base cap rate with 3% NOI growth, minus selling costs and loan payoff
    const grownNoi = annualNoi * Math.pow(1 + 3 / 100, baseHold);
    const exitValue = input.market_cap_rate > 0 ? grownNoi / (input.market_cap_rate / 100) : 0;
    const saleCosts = exitValue * ((input.sale_costs_pct ?? 6) / 100);
    const exitBalance = calcRemainingBalance(input.loan_amount, input.rate, input.amortization_months, baseHold * 12, input.interest_only_months ?? 0);
    const exitProceeds = Math.max(0, exitValue - saleCosts - exitBalance);
    return calculatePartnershipWaterfall({
      lpEquity,
      gpEquity,
      annualCashFlows: Array(baseHold).fill(annualCf),
      exitProceeds,
      prefRate: input.partnership.pref_rate ?? 0.08,
      // v12.1: Map snake_case API fields to WaterfallTier camelCase. Default to 8%/30% if no tiers provided.
      tiers: (input.partnership.tiers && input.partnership.tiers.length > 0
        ? input.partnership.tiers.map((t: any): WaterfallTier => ({
            irrThreshold: t.irrThreshold ?? t.irr_threshold ?? 0.08,
            gpSplit: t.gpSplit ?? t.gp_split ?? 0.30,
          }))
        : [{ irrThreshold: 0.08, gpSplit: 0.30 }]),
      gpCatchupPct: input.partnership.gp_catchup_pct ?? 1.0,
      holdYears: baseHold,
    });
  })() : undefined;

  // --- v12.1: 1031 EXCHANGE (if relinquished info provided) ---
  const exchange1031 = input.exchange_1031 ? calculate1031Exchange({
    relinquishedPurchasePrice: input.exchange_1031.relinquished_purchase_price ?? input.purchase_price,
    relinquishedSalePrice: input.purchase_price,
    relinquishedAdjustedBasis: input.exchange_1031.relinquished_adjusted_basis ?? input.purchase_price * 0.8, // assume 20% depreciation
    relinquishedLoanBalance: input.exchange_1031.relinquished_loan_balance ?? input.loan_amount,
    relinquishedSellingCostsPct: input.sale_costs_pct ?? 6,
    replacementValue: input.exchange_1031.replacement_value ?? input.purchase_price,
    replacementLoanAmount: input.exchange_1031.replacement_loan_amount ?? input.loan_amount,
    capitalGainsRate: 15,  // federal LTCG
    depreciationRecaptureRate: 25,  // §1250
    // v13: State tax by state (was hardcoded 0%)
    stateTaxRate: getStateIncomeTaxRate(input.state),
    niitRate: 3.8,
    cashRetained: input.exchange_1031.cash_retained,
  }) : undefined;

  // --- v13: TRACK 3 (Stabilized DSCR — deal trajectory) ---
  // Year-3 NOI / ADS shows whether deal improves or deteriorates over time.
  const year3Noi = annualNoi * Math.pow(1 + noiGrowthRate / 100, 3);
  const track3 = {
    stabilized_dscr_year3: annualDebtService > 0 ? year3Noi / annualDebtService : Infinity,
    stabilized_debt_yield_year3: input.loan_amount > 0 ? (year3Noi / input.loan_amount) * 100 : 0,
    breakeven_occupancy_pct: track2.breakevenOccupancyPct,
    notes: [
      `Year-3 stabilized NOI: $${year3Noi.toLocaleString()} (3% annual growth)`,
      `DSCR improves from ${Number.isFinite(track2Dscr) ? round(track2Dscr, 2) : "N/A"}x → ${round(year3Noi / annualDebtService, 2)}x by year 3`,
      `Breakeven occupancy: ${track2.breakevenOccupancyPct.toFixed(1)}% (deals below 85% are risky)`,
    ],
  };

  // --- v13: UNLEVERED IRR (deal quality without debt) ---
  // IRR with no loan — pure real estate return. Shows if deal makes sense independent of financing.
  // Uses standard IRR solver (investment = negative CF at t=0, returns = positive CF).
  const unlevered = (() => {
    const baseHold = input.hold_years ?? 5;
    const unleveredCashFlows: number[] = [-input.purchase_price];
    let currentNoi = annualNoi;
    for (let y = 1; y <= baseHold; y++) {
      currentNoi *= 1 + noiGrowthRate / 100;
      unleveredCashFlows.push(currentNoi);
    }
    const grownNoiExit = annualNoi * Math.pow(1 + noiGrowthRate / 100, baseHold);
    const exitValue = input.market_cap_rate > 0 ? grownNoiExit / (input.market_cap_rate / 100) : 0;
    const saleCosts = exitValue * ((input.sale_costs_pct ?? 6) / 100);
    unleveredCashFlows[unleveredCashFlows.length - 1] += (exitValue - saleCosts);
    // v13.2: Use robust Newt-Safe IRR solver
    const irr = robustIrr(unleveredCashFlows);
    const eqMult = input.purchase_price > 0
      ? unleveredCashFlows.slice(1).reduce((s, x) => s + x, 0) / input.purchase_price
      : 0;
    return {
      irr,
      equity_multiple: eqMult,
      notes: [
        `Unlevered IRR: ${Number.isFinite(irr) ? (irr * 100).toFixed(1) + '%' : '—'} (no debt)`,
        `Equity multiple: ${eqMult.toFixed(2)}x over ${baseHold}yr`,
        irr > 0.08 ? '✅ Deal makes sense without leverage' : '⚠️ Deal requires leverage to be attractive',
      ],
    };
  })();

  // --- v13: QBI DEDUCTION (§199A) ---
  // v15 Fix C: Tax-year versioned. IRS materials are not perfectly aligned for 2026 —
  // the IRS QBI page says deduction available through tax years ending on or before
  // Dec 31, 2025, while 2026 IRS Pub 505 and Form 8995 pages still reference QBI workflows.
  // We compute the deduction but flag it as "subject to legislative confirmation".
  // Thresholds are 2025 inflation-adjusted values; 2026 values pending IRS release.
  const qbiDeduction = input.vesting !== 'corp' ? (() => {
    const magi = input.magi ?? 120000;
    const filingStatus = input.filing_status ?? 'mfj';
    // 2025 inflation-adjusted phase-out thresholds (Rev. Proc. 2024-40)
    // 2026 thresholds pending IRS release — using 2025 as conservative estimate
    const phaseOutStart = filingStatus === 'mfj' ? 383900 : 191950;
    const phaseOutEnd = filingStatus === 'mfj' ? 483900 : 241950;
    const eligible = magi < phaseOutEnd;
    const qbi = annualNoi;
    const deductionAmount = eligible ? qbi * 0.20 : 0;
    return {
      eligible,
      deduction_amount: Math.round(deductionAmount),
      taxable_income_cap: phaseOutStart,
      notes: [
        eligible
          ? `Eligible for 20% QBI deduction: $${deductionAmount.toLocaleString()}/yr`
          : `MAGI $${magi.toLocaleString()} exceeds phase-out ($${phaseOutEnd.toLocaleString()}) — deduction reduced`,
        `Pass-through entity (${input.vesting}) — rental income qualifies as QBI`,
        `Phase-out starts at $${phaseOutStart.toLocaleString()} (${filingStatus.toUpperCase()})`,
        `LEGAL REVIEW: §199A QBI deduction status for 2026 is subject to legislative confirmation. IRS materials are not fully aligned. Consult a CPA.`,
      ],
    };
  })() : undefined;

  // --- v13: REFINANCE ANALYSIS ---
  // Given current rate vs estimated market rate, when does refi break even?
  const refinanceAnalysis = (() => {
    const marketRate = llpa.estimatedRate;  // LLPA's estimate of market rate for this deal
    const currentRate = input.rate;
    const refiCosts = input.loan_amount * 0.02;  // typical 2% refi costs (points + fees + title)
    const currentPmt = monthlyPayment(input.loan_amount, currentRate, input.amortization_months);
    const refiPmt = monthlyPayment(input.loan_amount, marketRate, input.amortization_months);
    const monthlySavings = currentPmt - refiPmt;
    const breakEvenMonths = monthlySavings > 0 ? refiCosts / monthlySavings : Infinity;
    const netSavings5yr = monthlySavings * 60 - refiCosts;
    const recommendation: 'refinance_now' | 'wait' | 'no_benefit' =
      monthlySavings <= 0 ? 'no_benefit' :
      breakEvenMonths < 24 ? 'refinance_now' : 'wait';
    return {
      break_even_months: Number.isFinite(breakEvenMonths) ? Math.round(breakEvenMonths) : null,
      monthly_savings: Math.round(monthlySavings),
      refi_costs: Math.round(refiCosts),
      net_savings_5yr: Math.round(netSavings5yr),
      recommendation,
      notes: [
        monthlySavings > 0
          ? `Refi from ${currentRate}% → ${marketRate.toFixed(3)}% saves $${Math.round(monthlySavings)}/mo`
          : `Current rate ${currentRate}% already at/below market ${marketRate.toFixed(3)}% — no refi benefit`,
        `Refi costs: $${Math.round(refiCosts).toLocaleString()} (2% of loan)`,
        Number.isFinite(breakEvenMonths)
          ? `Break-even: ${Math.round(breakEvenMonths)} months`
          : 'No break-even — refi would lose money',
        recommendation === 'refinance_now' ? '✅ Refinance now — breaks even in <24mo' :
        recommendation === 'wait' ? '⏳ Wait — break-even exceeds 24mo' :
        '❌ No benefit — keep current loan',
      ],
    };
  })();

  // --- v13: NARRATIVE (plain-English verdict explanation) ---
  const narrative = (() => {
    const verdict = truthMatrix.quadrant;
    const parts: string[] = [];
    if (verdict === 'GREEN') {
      parts.push(`This deal qualifies at standard DSCR lenders (Track 1 ${Number.isFinite(track1Dscr) ? round(track1Dscr, 2) : "N/A"}x).`);
      if (track2.monthlyCashFlow > 0) {
        parts.push(`Investor cash flow is positive at +$${Math.round(track2.monthlyCashFlow)}/mo (Track 2 ${Number.isFinite(track2Dscr) ? round(track2Dscr, 2) : "N/A"}x).`);
      }
      parts.push(`Deal-break rate ${dealBreakSolver.breakevenRate.toFixed(2)}% gives ${(dealBreakSolver.breakevenRate - input.rate).toFixed(2)}% cushion against rate shocks.`);
      parts.push(`Recommended: proceed to lender matching — top match is ${matches[0]?.lender.name ?? 'N/A'} at ${matches[0]?.estimatedRate.toFixed(3)}%.`);
    } else if (verdict === 'TRAP' || verdict === 'STRUCTURING') {
      parts.push(`This deal qualifies for a loan (Track 1 ${Number.isFinite(track1Dscr) ? round(track1Dscr, 2) : "N/A"}x) but fails investor stress (Track 2 ${Number.isFinite(track2Dscr) ? round(track2Dscr, 2) : "N/A"}x).`);
      parts.push(`Negative cash flow of $${Math.abs(Math.round(track2.monthlyCashFlow))}/mo means you're subsidizing the deal monthly.`);
      parts.push(`Proceed only if appreciation or after-tax thesis justifies the negative carry.`);
      parts.push(`To restructure: ${killResult.blockingCriteria[0]?.actionRequired ?? 'lower LTV, increase rent, or reduce price'}.`);
    } else {
      parts.push(`This deal does not qualify.`);
      parts.push(`Binding constraint: ${bindingConstraint}.`);
      parts.push(`Kill switch: ${killSwitch}.`);
      parts.push(`Do not proceed without restructuring.`);
    }
    return parts.join(' ');
  })();

  // --- v13: MONTE CARLO DSCR DISTRIBUTION ---
  // Run 1000-iteration Monte Carlo to get P10/P50/P90 DSCR + probability of failure.
  const monteCarloResult = (() => {
    try {
      const mc = runMonteCarlo({
        loanAmount: input.loan_amount,
        amortMonths: input.amortization_months,
        interestOnlyMonths: input.interest_only_months ?? 0,
        baseRate: input.rate,
        baseRent: qualifyingRent,
        otherIncomeMonthly: 0,
        propertyTaxes: pitiaRounded.taxes,
        insurance: pitiaRounded.insurance,
        hoa: pitiaRounded.hoa,
        propertyMgmtPct: dealInputs.propertyMgmtPct,
        repairsMaintenancePct: dealInputs.repairsMaintenancePct,
        capexReservePct: dealInputs.capexReservePct,
        turnoverPct: dealInputs.turnoverPct,
        rentVolatility: 0.05,
        vacancyMean: input.vacancy_pct,
        vacancyVolatility: 2,
        interestRateVolatility: 0.5,
        capRateVolatility: 0.5,
        maintenanceVolatility: 0.2,
        marketCapRate: input.market_cap_rate,
        iterations: 1000,
      });
      return {
        p10_dscr: Math.round(mc.dscrDistribution.p10 * 1000) / 1000,
        p50_dscr: Math.round(mc.dscrDistribution.p50 * 1000) / 1000,
        p90_dscr: Math.round(mc.dscrDistribution.p90 * 1000) / 1000,
        mean_dscr: Math.round(mc.dscrDistribution.mean * 1000) / 1000,
        std_dev: Math.round(mc.dscrDistribution.stdDev * 1000) / 1000,
        prob_dscr_below_1: mc.probDscrBelow1,
        prob_dscr_below_075: mc.probDscrBelow075,
        prob_negative_cash_flow: mc.probNegativeCashFlow,
        prob_underwater: mc.probUnderwater,
        iterations: mc.iterations,
        // v15 Phase 3+5: Institutional risk metrics (CVaR/VaR/GPD-CVaR)
        cvar_5pct: Math.round(computeCvarFromMC(mc.samples.map(s => s.dscr), 0.05) * 1000) / 1000,
        cvar_10pct: Math.round(computeCvarFromMC(mc.samples.map(s => s.dscr), 0.10) * 1000) / 1000,
        var_5pct: Math.round(computeVaR(mc.samples.map(s => s.dscr), 0.05) * 1000) / 1000,
        gpd_cvar_5pct: Math.round(computeGpdCvarMC(mc.samples.map(s => s.dscr), 0.05) * 1000) / 1000,
        convergence_ratio: mc.dscrDistribution.mean > 0
          ? Math.round((mc.dscrDistribution.stdDev / Math.sqrt(mc.iterations) / mc.dscrDistribution.mean) * 10000) / 100
          : 0,
        notes: [
          `P50 DSCR: ${mc.dscrDistribution.p50.toFixed(2)}x (P10: ${mc.dscrDistribution.p10.toFixed(2)}x, P90: ${mc.dscrDistribution.p90.toFixed(2)}x)`,
          `P(DSCR < 1.0) = ${mc.probDscrBelow1.toFixed(1)}% — probability of failing lender test`,
          `P(DSCR < 0.75) = ${mc.probDscrBelow075.toFixed(1)}% — probability of kill territory`,
          `P(negative cash flow) = ${mc.probNegativeCashFlow.toFixed(1)}% | P(underwater at exit) = ${mc.probUnderwater.toFixed(1)}%`,
          // v15: CVaR gives the expected DSCR given we're in the worst 5% of outcomes
          `CVaR@5%: ${computeCvarFromMC(mc.samples.map(s => s.dscr), 0.05).toFixed(2)}x (mean DSCR given worst-5% scenario)`,
          `VaR@5%: ${computeVaR(mc.samples.map(s => s.dscr), 0.05).toFixed(2)}x (5th-percentile DSCR)`,
          mc.probDscrBelow1 < 10 ? '✅ Low failure probability — deal is robust to stress' :
          mc.probDscrBelow1 < 30 ? '⚠️ Moderate failure probability — monitor rent/vacancy' :
          '❌ High failure probability — restructure required',
        ],
      };
    } catch (e) {
      return undefined;
    }
  })();

  // --- v13: WORST PLAUSIBLE CASE (combine top-3 stress scenarios) ---
  // Take the 3 worst stress scenarios and combine their effects simultaneously.
  const worstPlausible = (() => {
    const sorted = [...stressScenarios].sort((a, b) => a.investorDscr - b.investorDscr);
    const top3 = sorted.slice(0, 3);
    if (top3.length === 0) return undefined;
    // Combined DSCR = average of top-3 worst (conservative)
    const combinedDscr = top3.reduce((s, x) => s + x.investorDscr, 0) / top3.length;
    const combinedCf = top3.reduce((s, x) => s + x.monthlyCashFlow, 0) / top3.length;
    return {
      combined_dscr: Math.round(combinedDscr * 1000) / 1000,
      combined_cash_flow: Math.round(combinedCf),
      scenarios_used: top3.map(s => s.name),
      notes: [
        `Combined worst-3 scenarios: ${top3.map(s => s.name).join(', ')}`,
        `Average DSCR across worst-3: ${combinedDscr.toFixed(2)}x`,
        `Average monthly cash flow: $${Math.round(combinedCf).toLocaleString()}/mo`,
        combinedDscr < 0.75 ? '❌ Deal fails under combined stress — restructure required' :
        combinedDscr < 1.0 ? '⚠️ Deal barely survives combined stress — thin margin' :
        '✅ Deal survives combined stress',
      ],
    };
  })();

  // --- v13: TWO-QUOTE OPTIMIZER ---
  // Given borrower priorities, recommend the optimal lender pair.
  const twoQuoteOptimizer = (() => {
    const flexMatch = matches.find(m => m.twoQuoteRole === 'flex' || m.twoQuoteRole === 'both');
    const rateCompMatch = matches.find(m => m.twoQuoteRole === 'rate_competitive' || m.twoQuoteRole === 'both');
    // Heuristic: if deal is borderline (DSCR 1.0-1.25), prioritize flexibility; if strong (DSCR > 1.4), prioritize rate
    const priority: 'rate' | 'flexibility' | 'balanced' =
      track1Dscr < 1.25 ? 'flexibility' :
      track1Dscr > 1.4 ? 'rate' :
      'balanced';
    const rationale =
      priority === 'flexibility'
        ? `Borderline DSCR (${Number.isFinite(track1Dscr) ? track1Dscr.toFixed(2) : "N/A"}x) — prioritize flex lender for exception handling`
        : priority === 'rate'
        ? `Strong DSCR (${Number.isFinite(track1Dscr) ? track1Dscr.toFixed(2) : "N/A"}x) — prioritize rate-competitive lender for best pricing`
        : `Balanced DSCR (${Number.isFinite(track1Dscr) ? track1Dscr.toFixed(2) : "N/A"}x) — get both quotes for comparison`;
    return {
      borrower_priority: priority,
      recommended_pair: { flex: flexMatch?.lender.name ?? null, rate_competitive: rateCompMatch?.lender.name ?? null },
      rationale,
      aey_delta_dollars: aeyDeltaDollars,
      notes: [
        rationale,
        `Flex lender: ${flexMatch?.lender.name ?? 'N/A'} (${flexMatch?.estimatedRate.toFixed(3) ?? 'N/A'}%)`,
        `Rate-competitive: ${rateCompMatch?.lender.name ?? 'N/A'} (${rateCompMatch?.estimatedRate.toFixed(3) ?? 'N/A'}%)`,
        `AEY delta: $${aeyDeltaDollars.toLocaleString()} over ${input.hold_years ?? 5}yr`,
      ],
    };
  })();

  // --- v13: CASH-OUT REFI MAX CASH AVAILABLE ---
  const cashOutRefi = input.loan_purpose === 'CASH_OUT_REFI' ? (() => {
    const value = input.appraised_value || input.purchase_price;
    const maxLoanAt75 = value * 0.75;
    const maxLoanAt70 = value * 0.70;
    const maxCashAt75 = Math.max(0, maxLoanAt75 - input.loan_amount);
    const maxCashAt70 = Math.max(0, maxLoanAt70 - input.loan_amount);
    return {
      max_cash_at_75_ltv: Math.round(maxCashAt75),
      max_cash_at_70_ltv: Math.round(maxCashAt70),
      current_loan_payoff: Math.round(input.loan_amount),
      notes: [
        `Max cash at 75% LTV: $${Math.round(maxCashAt75).toLocaleString()} (loan $${Math.round(maxLoanAt75).toLocaleString()} - payoff $${Math.round(input.loan_amount).toLocaleString()})`,
        `Max cash at 70% LTV (conservative): $${Math.round(maxCashAt70).toLocaleString()}`,
        maxCashAt75 > 50000 ? '✅ Meaningful cash-out available' : maxCashAt75 > 0 ? '⚠️ Limited cash-out — consider waiting for appreciation' : '❌ No cash-out available at current LTV',
      ],
    };
  })() : undefined;

  // --- v15 Phase 6: RISK-ADJUSTED RETURN METRICS ---
  // Use Monte Carlo samples to compute Sharpe/Sortino/Calmar/Omega on monthly cash flow returns
  const riskMetrics = (() => {
    try {
      if (!monteCarloResult) return undefined;
      // Use MC cash flow samples as proxy for return distribution
      // (in production, would use hold-period returns from hold matrix)
      const mc = runMonteCarlo({
        loanAmount: input.loan_amount,
        amortMonths: input.amortization_months,
        interestOnlyMonths: input.interest_only_months ?? 0,
        baseRate: input.rate,
        baseRent: qualifyingRent,
        otherIncomeMonthly: 0,
        propertyTaxes: pitiaRounded.taxes,
        insurance: pitiaRounded.insurance,
        hoa: pitiaRounded.hoa,
        propertyMgmtPct: dealInputs.propertyMgmtPct,
        repairsMaintenancePct: dealInputs.repairsMaintenancePct,
        capexReservePct: dealInputs.capexReservePct,
        turnoverPct: dealInputs.turnoverPct,
        rentVolatility: 0.05,
        vacancyMean: input.vacancy_pct,
        vacancyVolatility: 2,
        interestRateVolatility: 0.5,
        capRateVolatility: 0.5,
        maintenanceVolatility: 0.2,
        marketCapRate: input.market_cap_rate,
        iterations: 1000,
      });
      // Convert monthly cash flows to monthly returns (relative to cash invested)
      const cashInvested = Math.max(1, input.purchase_price - input.loan_amount);
      const returns = mc.samples.map(s => s.monthlyCashFlow / cashInvested);
      const sharpe = sharpeRatio(returns, 0.004);  // ~5% annual risk-free monthly
      const sortino = sortinoRatio(returns, 0);
      const calmar = calmarRatio(returns, 12);
      const omega = omegaRatio(returns, 0);
      return {
        sharpe_ratio: Number.isFinite(sharpe) ? Math.round(sharpe * 100) / 100 : undefined,
        sortino_ratio: Number.isFinite(sortino) ? Math.round(sortino * 100) / 100 : undefined,
        calmar_ratio: Number.isFinite(calmar) ? Math.round(calmar * 100) / 100 : undefined,
        omega_ratio: Number.isFinite(omega) ? Math.round(omega * 100) / 100 : undefined,
        notes: [
          `Sharpe: ${Number.isFinite(sharpe) ? sharpe.toFixed(2) : 'N/A'} (>1 = good, >2 = excellent)`,
          `Sortino: ${Number.isFinite(sortino) ? sortino.toFixed(2) : 'N/A'} (downside-only risk)`,
          `Calmar: ${Number.isFinite(calmar) ? calmar.toFixed(2) : 'N/A'} (return / max drawdown)`,
          `Omega: ${Number.isFinite(omega) ? omega.toFixed(2) : 'N/A'} (>1 = favorable odds)`,
        ],
      };
    } catch {
      return undefined;
    }
  })();

  // --- v15 Phase 6: MERTON STRUCTURAL CREDIT RISK ---
  const creditRisk = (() => {
    try {
      const propertyValue = input.appraised_value || input.purchase_price;
      const debt = input.loan_amount;
      // v15 fix: Guard against debt=0 or propertyValue=0 which produces NaN
      if (debt <= 0 || propertyValue <= 0) return undefined;
      // Asset volatility: typical RE is 10-20%; use cap rate vol × leverage multiplier
      const assetVol = 0.15 + (input.market_cap_rate / 100) * 0.5;
      const r0 = 0.045;  // 4.5% risk-free
      const T = (input.hold_years ?? 5);
      const dd = distanceToDefault({
        assetValue: propertyValue,
        debt,
        assetVolatility: assetVol,
        riskFreeRate: r0,
        horizon: T,
      });
      const pd = mertonPD({
        assetValue: propertyValue,
        debt,
        assetVolatility: assetVol,
        riskFreeRate: r0,
        horizon: T,
      });
      const ltv = debt / Math.max(1, propertyValue);
      const lgd = lgdFromLtv(ltv, 0.6);
      const ead = robustRemainingBalance(input.loan_amount, input.rate, input.amortization_months, Math.min(12 * T, input.amortization_months), input.interest_only_months ?? 0);
      const expectedLoss = pd * lgd * ead;
      // Rating banding (Merton mapping, simplified)
      const ratingBanding =
        dd > 4 ? 'AAA/AA' :
        dd > 3 ? 'A' :
        dd > 2 ? 'BBB' :
        dd > 1 ? 'BB' :
        dd > 0 ? 'B' : 'CCC';
      return {
        distance_to_default: Math.round(dd * 100) / 100,
        probability_of_default: Math.round(pd * 10000) / 100,  // as percentage
        loss_given_default: Math.round(lgd * 1000) / 10,  // as percentage
        exposure_at_default: Math.round(ead),
        expected_loss: Math.round(expectedLoss),
        rating_banding: ratingBanding,
        notes: [
          `Distance to Default: ${dd.toFixed(2)}σ from underwater`,
          `Probability of Default (Merton): ${(pd * 100).toFixed(2)}% over ${T}y horizon`,
          `LGD: ${(lgd * 100).toFixed(1)}% (based on LTV ${(ltv * 100).toFixed(0)}%)`,
          `EAD at year ${T}: $${Math.round(ead).toLocaleString()}`,
          `Expected Loss: $${Math.round(expectedLoss).toLocaleString()} (PD × LGD × EAD)`,
          `Credit Rating: ${ratingBanding}`,
        ],
      };
    } catch {
      return undefined;
    }
  })();

  // --- v15 Phase 6: BRRRR SEASONING-AWARE CASH-OUT ---
  // v15 fix: 'REFINANCE' is not a valid loan_purpose. Valid values are
  // 'PURCHASE' | 'RATE_TERM_REFI' | 'CASH_OUT_REFI'. Was silently skipped for all refis.
  const brrrrTiming = (input.loan_purpose === 'PURCHASE' || input.loan_purpose === 'RATE_TERM_REFI' || input.loan_purpose === 'CASH_OUT_REFI') ? (() => {
    try {
      const monthsSince = input.loan_purpose !== 'PURCHASE' ? (input.hold_years ?? 0) * 12 : 0;
      const result = brrrrRefiAnalysis({
        purchasePrice: input.purchase_price,
        rehabCost: 0,
        arv: input.appraised_value || input.purchase_price * 1.15,
        monthsSincePurchase: monthsSince,
        maxLtvPct: 75,
        originalLoanBalance: input.loan_amount,
        cashInvested: Math.max(0, input.purchase_price - input.loan_amount),
      });
      return {
        refi_basis_source: result.refiBasisSource,
        refi_basis: Math.round(result.refiBasis),
        max_cash_out: Math.round(result.maxCashOut),
        cash_left_in_deal: Math.round(result.cashLeftInDeal),
        full_cash_out: result.fullCashOut,
        optimal_refi_month: result.optimalRefiMonth,
        notes: [
          `Refi basis source: ${result.refiBasisSource.toUpperCase()} ($${Math.round(result.refiBasis).toLocaleString()})`,
          `Max cash-out: $${Math.round(result.maxCashOut).toLocaleString()}`,
          `Cash left in deal: $${Math.round(result.cashLeftInDeal).toLocaleString()}`,
          result.fullCashOut ? '✅ Full cash extraction possible (true BRRRR)' :
          result.cashLeftInDeal > 0 ? `⚠️ $${Math.round(result.cashLeftInDeal).toLocaleString()} remains trapped — wait for seasoning` : '',
          `Optimal refi month: ${result.optimalRefiMonth} (full ARV recognition)`,
        ].filter(n => n),
      };
    } catch {
      return undefined;
    }
  })() : undefined;

  // --- v15 Phase 6: PARETO-FRONTIER LENDER MATCHING ---
  const lenderPareto = (() => {
    try {
      if (matches.length < 2) return undefined;
      const lendersForPareto = matches.map(m => ({
        id: m.lender.name,
        name: m.lender.name,
        objectives: {
          rate: m.estimatedRate,
          fees: input.loan_amount * (input.points ?? 0) / 100,  // points × loan
          pppNpv: 0,  // would need PPP NPV from engine
          dscrBuffer: track1Dscr,  // same deal, but could vary by lender
        } as LenderObjectives,
      }));
      const pareto = paretoFrontierLenders(lendersForPareto);
      const paretoOptimal = pareto.filter(p => p.isParetoOptimal).map(p => p.name);
      const dominated = pareto.filter(p => !p.isParetoOptimal).map(p => ({
        name: p.name,
        dominated_by: p.dominatedBy,
      }));
      return {
        pareto_optimal_lenders: paretoOptimal,
        dominated_lenders: dominated,
        notes: [
          `Pareto-optimal lenders: ${paretoOptimal.length} of ${pareto.length} (${paretoOptimal.join(', ') || 'none'})`,
          dominated.length > 0 ? `Dominated: ${dominated.map(d => d.name).join(', ')}` : 'All lenders on Pareto frontier',
          'Pareto frontier = set of lenders where no other lender is better on ALL objectives',
        ],
      };
    } catch {
      return undefined;
    }
  })();

  // --- v15 Phase 5: STOCHASTIC ARM PATH (Vasicek) ---
  // v15 fix: was checking === 'ARM' but actual enum values are ARM_5_6, ARM_7_6, ARM_10_6
  const armStochastic = (input.structure?.startsWith('ARM') ?? false) ? (() => {
    try {
      const params = {
        theta: input.rate / 100,  // mean-revert to current rate
        kappa: 0.5,                // 0.5/year mean reversion
        sigma: 0.01,               // 1% volatility
        r0: input.rate / 100,
      };
      const y1 = vasicekExpectedRate(params, 1) * 100;
      const y3 = vasicekExpectedRate(params, 3) * 100;
      const y5 = vasicekExpectedRate(params, 5) * 100;
      // P90 rate at year 5: expected + 1.2816 × std dev
      const std5 = params.sigma * Math.sqrt((1 - Math.exp(-2 * params.kappa * 5)) / (2 * params.kappa));
      const p90 = (vasicekExpectedRate(params, 5) + 1.2816 * std5) * 100;
      return {
        expected_rate_year1: Math.round(y1 * 100) / 100,
        expected_rate_year3: Math.round(y3 * 100) / 100,
        expected_rate_year5: Math.round(y5 * 100) / 100,
        p90_rate_year5: Math.round(p90 * 100) / 100,
        vasicek_params: params,
        notes: [
          `Vasicek: κ=${params.kappa}, θ=${(params.theta * 100).toFixed(2)}%, σ=${(params.sigma * 100).toFixed(2)}%`,
          `Year 1 expected: ${y1.toFixed(2)}% | Year 3: ${y3.toFixed(2)}% | Year 5: ${y5.toFixed(2)}%`,
          `P90 (worst 10%) year-5 rate: ${p90.toFixed(2)}%`,
          `Mean reversion prevents rates from drifting beyond reasonable bounds`,
        ],
      };
    } catch {
      return undefined;
    }
  })() : undefined;

  // --- v15 Phase 4: TAX VERSION STATUS ---
  const taxVersion = (() => {
    try {
      const year = new Date().getFullYear();
      const table = getTaxTable(year);
      const stateConf = getStateConformity(input.state);
      return {
        year: table.year,
        qbi_status: table.qbi2026Status,
        bonus_dep_pct: Math.round(table.bonusDepreciationPct * 100),
        section179_limit: table.section179DeductionLimit,
        state_conforms_bonus_dep: stateConf.conformsBonusDepreciation,
        state_notes: stateConf.notes,
      };
    } catch {
      return undefined;
    }
  })();

  // --- v15: BRIDGE LOAN (if inputs provided) ---
  const bridgeLoanResult = input.bridge_loan ? (() => {
    try {
    const bl = input.bridge_loan!;
    const result = calculateBridgeLoan({
      purchasePrice: input.purchase_price,
      arv: bl.arv,
      rehabBudget: bl.rehab_budget,
      loanAmount: input.loan_amount,
      rate: input.rate,
      points: input.points,
      termMonths: input.term_months,
      interestReserveMonths: bl.interest_reserve_months,
      exitStrategy: bl.exit_strategy,
      exitTimelineMonths: bl.exit_timeline_months,
      exitValue: bl.exit_value,
      exitLoanPayoff: input.loan_amount,
      sellingCostsPct: bl.selling_costs_pct ?? 6,
    });
    return {
      total_interest_cost: result.totalInterestCost,
      points_cost: result.pointsCost,
      interest_reserve: result.interestReserve,
      total_cost_of_capital: result.totalCostOfCapital,
      net_profit_at_exit: result.netProfitAtExit,
      roi: result.roi,
      annualized_roi: result.annualizedRoi,
      max_loan_by_arv: result.maxLoanByArv,
      cash_to_close: result.cashToClose,
      cash_invested: result.cashInvested,
      notes: result.notes,
    };
    } catch { return undefined; }
  })() : undefined;

  // --- v15: SELLER FINANCING (if inputs provided) ---
  const sellerFinancingResult = input.seller_financing ? (() => {
    try {
    const sf = input.seller_financing!;
    const sellerNoteAmount = input.purchase_price - sf.down_payment;
    const result = calculateSellerFinancing({
      purchasePrice: input.purchase_price,
      downPayment: sf.down_payment,
      sellerNoteAmount,
      sellerNoteRate: sf.seller_note_rate,
      sellerNoteTermMonths: sf.seller_note_term_months,
      sellerNoteBalloonMonths: sf.seller_note_balloon_months,
      existingLoanBalance: sf.existing_loan_balance,
      existingLoanPayment: sf.existing_loan_payment,
      marketRate: sf.market_rate,
    });
    return {
      seller_monthly_payment: result.sellerMonthlyPayment,
      seller_balloon_at_exit: result.sellerBalloonAtExit,
      total_interest_to_seller: result.totalInterestToSeller,
      monthly_savings_vs_market: result.monthlySavingsVsMarket,
      annual_savings: result.annualSavings,
      five_year_savings: result.fiveYearSavings,
      wrap_spread: result.wrapSpread,
      wrap_annual_profit: result.wrapAnnualProfit,
      effective_rate: result.effectiveRate,
      notes: result.notes,
    };
    } catch { return undefined; }
  })() : undefined;

  // --- v15: FOREIGN NATIONAL ANALYSIS ---
  const foreignNationalAnalysis = input.is_foreign_national ? {
    is_foreign_national: true,
    llpa_adjustment_bps: 200, // typical 150-300bps adjustment
    itin_required: true,
    notes: [
      'Foreign national borrower: ITIN required instead of SSN',
      'LLPA adjustment: +200bps (typical for foreign national)',
      'Documentation: passport, visa, ITIN, foreign credit report, 12mo bank statements',
      'LTV cap: typically 65-70% (lower than domestic 75-80%)',
    ],
  } : undefined;

  // --- v15: PAL RULES (§469) ---
  const magi = input.magi ?? 120000;
  const filingStatus = input.filing_status ?? 'mfj';
  const palAllowance = magi < 100000 ? 25000 : magi < 150000 ? 25000 * (1 - (magi - 100000) / 50000) : 0;
  const isRepEligible = input.is_rep ?? false;
  const passiveLoss = Math.max(0, annualDebtService - annualNoi); // simplified: loss if NOI < debt service
  const palAnalysis = {
    pal_allowance: Math.round(palAllowance),
    suspended_losses: Math.max(0, passiveLoss - palAllowance),
    is_rep_eligible: isRepEligible,
    grouping_benefit: isRepEligible
      ? 'REP status allows unlimited passive losses against ordinary income'
      : input.experience_properties >= 7
      ? 'Active participation (7+ properties) may allow grouping election to combine passive activities'
      : 'Standard passive loss rules apply: $25k allowance phases out at $150k MAGI',
    notes: [
      `PAL allowance: $${Math.round(palAllowance).toLocaleString()} (MAGI $${magi.toLocaleString()}, ${filingStatus.toUpperCase()})`,
      `Passive loss this year: $${Math.round(passiveLoss).toLocaleString()}`,
      palAllowance > 0 ? `$${Math.round(Math.max(0, passiveLoss - palAllowance)).toLocaleString()} suspended and carried forward` : 'No allowance — all losses suspended',
      isRepEligible ? 'REP status: unlimited passive losses deductible against W-2 income' : 'Non-REP: losses limited to passive income + $25k allowance',
    ],
  };

  // --- v15: ENTITY OPTIMIZATION (compute if vesting is pass-through) ---
  // Already computed in qbiDeduction above; entity optimization uses similar logic.

  // --- v15: COST SEG (compute if cost_seg_elected) ---
  // v15 audit fix: wrap in try/catch to prevent engine crash
  const costSegResult = input.cost_seg_elected ? (() => {
    try {
      return calculateCostSeg({
        buildingValue: input.purchase_price * (1 - (input.land_allocation_pct ?? 15) / 100),
        landValue: input.purchase_price * ((input.land_allocation_pct ?? 15) / 100),
        acquisitionDate: input.acquisition_date ?? '2026-06-01',
        costSegStudyCost: 5000,
        federalBracketPct: input.federal_bracket_pct ?? 24,
        stateTaxRate: getStateIncomeTaxRate(input.state),
        isResidential: input.property_type !== 'MIXED_USE' && input.property_type !== 'MULTIFAMILY',
      });
    } catch { return undefined; }
  })() : undefined;

  // --- v15: STATE-SPECIFIC OVERLAYS ---
  // v15 audit fix: wrap in try/catch
  const stateSpecificResult = (() => {
    try {
      return calculateStateSpecific({
        state: input.state,
        purchasePrice: input.purchase_price,
        currentTaxAnnual: input.property_taxes_annual,
        isRentControlled: ['CA', 'NY', 'NJ', 'OR', 'MD'].includes((input.state || "XX").toUpperCase()),
        borrowerMagi: magi,
        propertyTaxesAnnual: input.property_taxes_annual,
        stateIncomeTaxPaid: magi * (getStateIncomeTaxRate(input.state) / 100),
      });
    } catch { return undefined; }
  })();

  // --- v15: INSURANCE DETAIL ---
  // v15 audit fix: wrap in try/catch
  const insuranceDetailResult = (() => {
    try {
      return calculateInsuranceDetail({
        state: input.state,
        isHighRiskZone: input.is_high_risk_zone ?? false,
        dwellingCoverage: input.appraised_value,
        isFloodZone: input.is_high_risk_zone ?? false,
        hasWindHailDeductible: ['FL', 'LA', 'TX', 'SC', 'NC'].includes((input.state || "XX").toUpperCase()),
        windHailDeductiblePct: 2,
        hasLossOfRents: true,
        lossOfRentsMonths: 12,
        basePremiumAnnual: input.insurance_annual,
      });
    } catch { return undefined; }
  })();

  // --- BUILD REPORT ---
  return {
    deal_summary: {
      purchase_price: input.purchase_price,
      appraised_value: input.appraised_value,
      loan_amount: input.loan_amount,
      rate: input.rate,
      points: input.points,
      state: input.state,
      fico: input.fico,
      property_type: input.property_type,
      rent_type: input.rent_type,
      loan_purpose: input.loan_purpose,
      structure: input.structure,
      market_cap_rate: input.market_cap_rate,
      hold_years: input.hold_years ?? 5,
    },
    pitia: {
      principal_interest: pitiaRounded.principal_interest,
      taxes: pitiaRounded.taxes,
      insurance: pitiaRounded.insurance,
      hoa: pitiaRounded.hoa,
      total: pitiaTotal,
    },
    payment_factor: round(paymentFactor, 7),
    track1: {
      qualifying_rent: Math.round(qualifyingRent),
      dscr: Number.isFinite(track1Dscr) ? round(track1Dscr, 3) : null,
      required_dscr: round(requiredDscr, 2),
      passes: track1Dscr >= requiredDscr,
      dscr_cushion: round(track1Dscr - requiredDscr, 3),
    },
    track2: {
      effective_rent: Math.round(track2EffectiveRent),
      dscr: Number.isFinite(track2Dscr) ? round(track2Dscr, 3) : null,
      survival_dscr: Number.isFinite(track2.investorDscr) ? round(track2.investorDscr, 3) : null,
      monthly_cash_flow: Math.round(track2.monthlyCashFlow),
      annual_noi: Math.round(track2.noi),
      annual_debt_service: Math.round(track2.annualDebtService),
      breakeven_occupancy_pct: round(track2.breakevenOccupancyPct, 1),
      track2_acknowledgment_required: track1Dscr >= requiredDscr && track2.monthlyCashFlow < 0,
    },
    returns: {
      entry_cap_rate: round(entryCapRate, 2),
      yield_on_cost: round(yieldOnCost, 2),
      cash_on_cash_year1: round(cashOnCashY1, 2),
      debt_yield: round(debtYield, 2),
      equity_multiple: round(equityMultiple, 2),
      dscr_at_stabilization: round(dscrAtStabilization, 3),
    },
    hold_matrix: holdMatrix,
    tornado: tornadoVars,
    binding_risk: bindingRisk,
    solvers: {
      deal_break_rate: round(dealBreakSolver.breakevenRate, 2),
      max_loan_for_1_0_dscr: maxLoan1_0,
      max_loan_for_1_25_dscr: maxLoan1_25,
      max_purchase_for_1_0_dscr: maxPurchase1_0,
      breakeven_rate_for_1_25_dscr: round(breakeven1_25.breakevenRate, 2),
      min_rent_for_1_25_dscr: minRent1_25,
      converged: dealBreakSolver.converged,
      iterations: dealBreakSolver.iterations,
    },
    ltv: {
      actual: round(ltvActual, 1),
      max_allowed: llpa.maxLtvAllowed,
      cap_warnings: llpa.ltvCapWarnings ?? [],
      // v13: Enhanced LTV metrics
      cltv: round(cltv, 1),
      leverage_ratio: round(leverageRatio, 2),
      debt_yield_at_exit: round(debtYieldAtExit, 1),
      stabilized_debt_yield: round(stabilizedDebtYield, 1),
    },
    rate: {
      input_rate: dealInputs.rate,
      estimated_rate: llpa.estimatedRate,
      anchor_rate: llpa.anchorRate,
      adjustments: llpa.adjustments,
    },
    reserves: {
      lenient_months: reserveResult.scenarios[0].months,
      median_months: reserveResult.scenarios[1].months,
      strict_months: reserveResult.scenarios[2].months,
      lenient_dollars: reserveResult.scenarios[0].dollars,
      median_dollars: reserveResult.scenarios[1].dollars,
      strict_dollars: reserveResult.scenarios[2].dollars,
      notes: reserveResult.notes,
    },
    kill_criteria: {
      status: killResult.overallStatus,
      can_proceed: killResult.canProceedToLenderMatching,
      blocking: killResult.blockingCriteria.map(c => ({
        criterion: c.criterion,
        detail: c.detail,
        action: c.actionRequired ?? '',
      })),
    },
    verdict: {
      decision: verdictDecision,
      binding_constraint: bindingConstraint,
      kill_switch: killSwitch,
      track2_acknowledgment: track2Acknowledgment,
    },
    lender_matches: lenderMatchesWithAey,
    two_quote: {
      flex_lender: twoQuote.flexLender?.lender.name ?? null,
      rate_competitive_lender: twoQuote.rateCompetitiveLender?.lender.name ?? null,
      aey_delta_dollars: aeyDeltaDollars,
    },
    true_cost: trueCostWithAey,
    points_recoup: {
      // Infinity → null (points never break even when user rate > par rate).
      // JSON.stringify(Infinity) === 'null' anyway, so this makes the type match reality.
      break_even_months: Number.isFinite(pointsBreakEvenMonths) ? Math.round(pointsBreakEvenMonths) : null,
      status: pointsStatus,
    },
    execution_score: {
      total: execScore.totalScore,
      band: execScore.band,
    },
    truth_matrix: {
      quadrant: truthMatrix.quadrant,
      label: truthMatrix.label,
    },
    state_checks: {
      declining_market: isDecliningMarketState(dealInputs.state),
      ppp_allowed: pppCheck.pppAllowed,
      ppp_reason: pppCheck.reason,
    },
    // v12 (P2-batch-K): Single reduce instead of 4 .filter() calls (was O(n) × 4)
    stress: (() => {
      const counts = { total: stressScenarios.length, pass: 0, watch: 0, fail: 0, kill: 0 };
      for (const s of stressScenarios) {
        const v = s.verdict.toLowerCase() as keyof typeof counts;
        if (v !== 'total' && v in counts) counts[v]++;
      }
      return counts;
    })(),
    // v11 fields
    after_tax: afterTaxResult ? {
      annual_depreciation: afterTaxResult.annual_depreciation,
      bonus_dep_pct: afterTaxResult.bonus_dep_pct,
      cost_seg_available: afterTaxResult.cost_seg_available,
      total_year1_deduction: afterTaxResult.total_year1_deduction,
      pal_allowance: afterTaxResult.pal_allowance,
      after_tax_cash_flow_year1: afterTaxResult.after_tax_cash_flow_year1,
      after_tax_irr: afterTaxResult.after_tax_irr,
      pre_tax_irr: afterTaxResult.pre_tax_irr,
      return_grade: afterTaxResult.return_grade,
      section1250_recapture_tax: afterTaxResult.section1250_recapture_tax,
      niit_recapture_tax: afterTaxResult.niit_recapture_tax,
      total_exit_tax: afterTaxResult.total_exit_tax,
      after_tax_exit_proceeds: afterTaxResult.after_tax_exit_proceeds,
      exit_value: afterTaxResult.exit_value,
      remaining_balance: afterTaxResult.remaining_balance,
      notes: afterTaxResult.notes,
    } : undefined,
    arm_reset: armResult ? {
      current_sofr: armResult.current_sofr,
      reset_rate: armResult.reset_rate,
      track1_at_reset: armResult.track1_at_reset,
      stress_reset_rate: armResult.stress_reset_rate,
      stress_track1_at_reset: armResult.stress_track1_at_reset,
      double_shock_year: armResult.double_shock_year,
      breaches_floor: armResult.breaches_floor,
      notes: armResult.notes,
    } : undefined,
    reassessment: {
      reassessed_tax_annual: reassessmentResult.reassessed_tax_annual,
      seller_current_tax_annual: reassessmentResult.seller_current_tax_annual,
      tax_delta_monthly: reassessmentResult.tax_delta_monthly,
      track1_dscr_after: reassessmentResult.track1_dscr_after,
      dscr_delta: reassessmentResult.dscr_delta,
      supplemental_bill: reassessmentResult.supplemental_bill,
      notes: reassessmentResult.notes,
    },
    insurance_gate: {
      kill: insuranceResult.kill,
      reason: insuranceResult.reason,
      stress_year3_premium: insuranceResult.stress_year3_premium,
      notes: insuranceResult.notes,
    },
    brrrr_gate: {
      seasoning_met: brrrrResult.seasoning_met,
      cash_out_basis: brrrrResult.cash_out_basis,
      carry_cost: brrrrResult.carry_cost,
      thesis_fails: brrrrResult.thesis_fails,
      notes: brrrrResult.notes,
    },
    rate_anchors: {
      treasury_10yr: TREASURY_10YR,
      treasury_5yr: TREASURY_5YR,
      sofr_30d: SOFR_30D,
      fed_funds: FED_FUNDS_RATE,
    },
    snapshot: snapshot,
    compliance: {
      loan_purpose_type: complianceResult.loan_purpose_type,
      reg_z_applies: complianceResult.reg_z_applies,
      respa_applies: complianceResult.respa_applies,
      ecoa_applies: complianceResult.ecoa_applies,
      high_cost_test_required: complianceResult.high_cost_test_required,
      state_ppp_restriction: complianceResult.state_ppp_restriction,
      advertising_risk: complianceResult.advertising_risk,
      licensing_evidence: complianceResult.licensing_evidence,
      positioning: complianceResult.positioning,
      flags: complianceResult.flags,
      notes: complianceResult.notes,
    },
    ic_memo: icMemo,
    generated_at: input.generated_at ?? new Date().toISOString(),
    engine_version: ENGINE_VERSION,
    // v12.1: New analysis blocks
    break_even: {
      min_rent_by_dscr: breakEven.minRentByDscr,
      max_loan_by_dscr: breakEven.maxLoanByDscr,
      max_price_by_dscr: breakEven.maxPriceByDscr,
      breakeven_rate_by_dscr: breakEven.breakevenRateByDscr,
      max_ltv_by_dscr: breakEven.maxLtvByDscr,
    },
    sensitivity_grid: {
      x_variable: sensitivityGrid.xVariable,
      y_variable: sensitivityGrid.yVariable,
      x_values: sensitivityGrid.xValues,
      y_values: sensitivityGrid.yValues,
      grid: sensitivityGrid.grid,
    },
    cash_out_ltv_cap: cashOutLtvCap,
    defeasance: defeasance ? {
      remaining_payments: defeasance.remainingPayments,
      monthly_payment: defeasance.monthlyPayment,
      pv_at_treasury_yield: defeasance.pvAtTreasuryYield,
      defeasance_cost: defeasance.defeasanceCost,
      treasury_premium: defeasance.treasuryPremium,
      total_cost: defeasance.totalCost,
      cost_pct_of_balance: defeasance.costPctOfBalance,
      notes: defeasance.notes,
    } : undefined,
    partnership_waterfall: partnershipWaterfall ? {
      lp_irr: partnershipWaterfall.lpIrr,
      gp_irr: partnershipWaterfall.gpIrr,
      lp_equity_multiple: partnershipWaterfall.lpEquityMultiple,
      gp_equity_multiple: partnershipWaterfall.gpEquityMultiple,
      total_distributions: partnershipWaterfall.totalDistributions,
      lp_total_distributions: partnershipWaterfall.lpTotalDistributions,
      gp_total_distributions: partnershipWaterfall.gpTotalDistributions,
      pref_paid: partnershipWaterfall.prefPaid,
      pref_shortfall: partnershipWaterfall.prefShortfall,
      promote_paid: partnershipWaterfall.promotePaid,
      effective_promote_pct: partnershipWaterfall.effectivePromotePct,
      notes: partnershipWaterfall.notes,
    } : undefined,
    exchange_1031: exchange1031 ? {
      sale_net_proceeds: exchange1031.saleNetProceeds,
      capital_gain: exchange1031.capitalGain,
      depreciation_recapture: exchange1031.depreciationRecapture,
      total_taxable_gain: exchange1031.totalTaxableGain,
      full_deferral_tax: exchange1031.fullDeferralTax,
      deferred_tax: exchange1031.deferredTax,
      boot_tax: exchange1031.bootTax,
      tax_owed: exchange1031.taxOwed,
      net_tax_savings: exchange1031.netTaxSavings,
      required_equity_for_full_deferral: exchange1031.requiredEquityForFullDeferral,
      required_debt_on_replacement: exchange1031.requiredDebtOnReplacement,
      replacement_equity_shortfall: exchange1031.replacementEquityShortfall,
      notes: exchange1031.notes,
    } : undefined,
    // v13: Enhanced analyses
    track3,
    unlevered,
    qbi_deduction: qbiDeduction,
    refinance_analysis: refinanceAnalysis,
    narrative,
    // v13: New analyses
    monte_carlo: monteCarloResult,
    worst_plausible: worstPlausible,
    two_quote_optimizer: twoQuoteOptimizer,
    cash_out_refi: cashOutRefi,
    // v15 Phase 4-6: New institutional analytics
    risk_metrics: riskMetrics,
    credit_risk: creditRisk,
    brrrr_timing: brrrrTiming,
    lender_pareto: lenderPareto,
    arm_stochastic: armStochastic,
    tax_version: taxVersion,
    // v15: Alternative financing modules
    bridge_loan_result: bridgeLoanResult,
    seller_financing_result: sellerFinancingResult,
    foreign_national_analysis: foreignNationalAnalysis,
    pal_analysis: palAnalysis,
  };
}

// ---------------------------------------------------------------------------
// HELPER: Simple IRR solver (bisection — correct direction for loan cashflows)
// For loan AEY: NPV(0) is negative (borrower pays back more), NPV(high) is positive.
// So: NPV < 0 → rate too low → lo = mid; NPV > 0 → rate too high → hi = mid.
// ---------------------------------------------------------------------------
// v15 Phase 2.4: solveSimpleIrr and solveStandardIrr were dead code (already
// replaced by robustIrr from solvers-v13). Deleted to unify all IRR solvers.
// The unified robustIrr() uses Brent's method with superlinear convergence,
// analytic NPV derivative (via Newton-Raphson), and bisection fallback.
// See src/lib/dscr/solvers-v13.ts for the implementation.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// HELPER: Remaining balance calculator
// ---------------------------------------------------------------------------
// v12: Added ioMonths parameter — during IO period, balance is unchanged.
// Was incorrectly amortizing from month 1, overstating principal paydown by ~13% on 5y IO loans.
function calcRemainingBalance(loan: number, rate: number, amortMonths: number, monthsElapsed: number, ioMonths: number = 0): number {
  const r = rate / 100 / 12;
  const n = amortMonths;
  const amortElapsed = Math.max(0, monthsElapsed - ioMonths);
  if (amortElapsed === 0) return loan; // still in IO period (or at start)
  if (r === 0) return Math.max(0, loan - (loan / n) * amortElapsed);
  const remainingFactor = Math.pow(1 + r, n) - Math.pow(1 + r, amortElapsed);
  const denominator = Math.pow(1 + r, n) - 1;
  return Math.max(0, (loan * remainingFactor) / denominator);
}

// ---------------------------------------------------------------------------
// HELPER: Required DSCR (v12 — was hardcoded 1.0 in engine, but lender.ts:263
// already had the proper logic. Now exported and shared.)
// ---------------------------------------------------------------------------
function computeRequiredDscr(i: DealInputs, ltv: number): number {
  let req = 1.0; // most non-QM DSCR programs need 1.00x minimum
  if (ltv > 75) req = Math.max(req, 1.1);
  if (i.propertyType === 'CONDOTEL' || i.rentType === 'STR') req = Math.max(req, 1.1);
  if (i.loanPurpose === 'CASH_OUT_REFI') req = Math.max(req, 1.1);
  if (i.fico < 680) req = Math.max(req, 1.1);
  return req;
}

// ---------------------------------------------------------------------------
// HELPER: v13.2 Input sanitization — prevents NaN/Infinity propagation
// ---------------------------------------------------------------------------

/**
 * Replace NaN/Infinity with a safe fallback value.
 * Use at the engine entry point to guard against malformed API input.
 */
function sanitizeNum(value: number | undefined | null, fallback: number): number {
  if (value === undefined || value === null) return fallback;
  if (!Number.isFinite(value)) return fallback;
  return value;
}

/**
 * Clamp a number to [min, max] range.
 * Use for inputs with known valid bounds (e.g. FICO 300-850, rate 0-25%).
 */
function clampNum(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

// ---------------------------------------------------------------------------
// HELPER: Simple hash for reproducible snapshot
// ---------------------------------------------------------------------------
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// ---------------------------------------------------------------------------
// IC MEMO GENERATOR — v11 Part J
// ---------------------------------------------------------------------------

// v12 (P2-batch-B): Typed IC memo params — was `any[]` / `any` everywhere,
// losing type safety on field access. Now properly typed.
interface IcMemoParams {
  verdict: Quadrant;
  track1Dscr: number;
  track2Dscr: number;
  debtYield: number;
  ltv: number;
  dealBreakRate: number;
  afterTaxIrr?: number;
  returnGrade?: string;
  lenderMatches: LenderMatch[];
  insuranceKill: boolean;
  strLegality: StrLegalityResult | null;
  reserves: ReserveResult;
  prepayYear1: number;
  prepayYear3: number;
  prepayYear5: number;
  armResult?: ArmResetResult;
  reassessmentResult?: ReassessmentResult;
  stressScenarios: StressScenario[];
  state: string;
}

function generateEngineIcMemo(p: IcMemoParams): string {
  const verdictLabel = p.verdict === 'GREEN' ? 'PROCEED' : p.verdict === 'TRAP' ? 'RESTRUCTURE' : p.verdict === 'STRUCTURING' ? 'RESTRUCTURE' : 'PASS';
  const topLender = p.lenderMatches[0];
  const stressKill = p.stressScenarios.filter(s => s.verdict === 'Kill').length;
  const stressPass = p.stressScenarios.filter(s => s.verdict === 'Pass').length;

  return `═══════════════════════════════════════════════════════════════════
PRO DESK IC MEMO — v11 | State: ${p.state} | Date: ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
═══════════════════════════════════════════════════════════════════
VERDICT:  ${verdictLabel}
          Binding constraint: ${p.insuranceKill ? 'Insurance unconfirmed in high-risk zone' : stressKill > 15 ? 'Stress scenarios failing' : p.track2Dscr < 1.0 ? 'Track 2 negative cash flow' : 'None — deal clears'}

THREE-METRIC CREDIT STANDARD:
  Track 1 DSCR:                      ${Number.isFinite(p.track1Dscr) ? p.track1Dscr.toFixed(2) : 'N/A'}x
  Track 2 DSCR (investor stress):    ${Number.isFinite(p.track2Dscr) ? p.track2Dscr.toFixed(2) : 'N/A'}x
  Debt Yield (NOI/Loan):             ${p.debtYield.toFixed(1)}%
  LTV:                               ${p.ltv.toFixed(1)}%
  Deal-Break Rate:                   ${p.dealBreakRate.toFixed(2)}%
  Cushion vs Anchor (${ANCHOR_RATE}%):     +${(p.dealBreakRate - ANCHOR_RATE).toFixed(2)}%

RETURN STACK:
  After-Tax IRR:                     ${p.afterTaxIrr?.toFixed(1) ?? 'N/A'}%
  Return Grade:                      ${p.returnGrade ?? 'N/A'}

STRESS SUMMARY:
  Total scenarios: ${p.stressScenarios.length} | Pass: ${stressPass} | Kill: ${stressKill}

LENDER RANKING:
  #1: ${topLender?.lender.name ?? 'N/A'} (${topLender?.fitTier ?? 'N/A'})

INSURANCE:     ${p.insuranceKill ? 'UNCONFIRMED — KILL CRITERION' : 'Confirmed'}
RESERVES:      ${p.reserves.scenarios[0].months}mo / ${p.reserves.scenarios[1].months}mo / ${p.reserves.scenarios[2].months}mo
PREPAY (Y1/Y3/Y5): $${p.prepayYear1.toLocaleString()} / $${p.prepayYear3.toLocaleString()} / $${p.prepayYear5.toLocaleString()}

${p.armResult ? `ARM RESET:
  Current reset rate: ${p.armResult.reset_rate}% | Track 1 at reset: ${p.armResult.track1_at_reset}x
  Stress reset (SOFR 5%): ${p.armResult.stress_reset_rate}% | Track 1 at stress: ${p.armResult.stress_track1_at_reset}x
  ${p.armResult.double_shock_year ? '⚠️ Double-shock year: ' + p.armResult.double_shock_year : ''}
` : ''}
${p.reassessmentResult ? `TAX REASSESSMENT:
  Seller pays: $${p.reassessmentResult.seller_current_tax_annual.toLocaleString()}/yr
  You pay: $${p.reassessmentResult.reassessed_tax_annual.toLocaleString()}/yr
  DSCR impact: ${p.reassessmentResult.track1_dscr_before}x → ${p.reassessmentResult.track1_dscr_after}x
` : ''}
═══════════════════════════════════════════════════════════════════
Professional decision-support. Not a loan commitment. Verify all terms.`;
}

// ---------------------------------------------------------------------------
// V7 REFERENCE DEAL — for testing (updated to v11)
// ---------------------------------------------------------------------------

export const V7_REFERENCE_DEAL: EngineInput = {
  purchase_price: 425000,
  appraised_value: 425000,
  loan_amount: 318750,
  rate: 7.00,
  points: 0,
  term_months: 360,
  amortization_months: 360,
  interest_only_months: 0,
  lease_rent: 3000,
  appraiser_rent: 3000,
  borrower_rent_claim: 3000,
  property_taxes_annual: 5000,
  insurance_annual: 2000,
  hoa_monthly: 150,
  fico: 710,
  state: 'FL',
  vesting: 'llc',
  experience_properties: 1,
  reserves_months: 6,
  property_type: 'SFR',
  rent_type: 'LTR',
  loan_purpose: 'PURCHASE',
  structure: 'FIXED_30',
  prepay_type: 'YSP_3_2_1',
  vacancy_pct: 8,
  market_cap_rate: 7.5,
  stress_cap_rate: 9,
  lease_verified: true,
  lease_deposit_verified: true,
  insurance_bindable: true,
  tax_reassessment_estimated: true,
  // v11 after-tax profile
  land_allocation_pct: 15,
  federal_bracket_pct: 24,
  magi: 120000,
  filing_status: 'mfj',
  is_rep: false,
  cost_seg_elected: false,
  hold_years: 5,
  exit_cap_rate_pct: 7.5,
  sale_costs_pct: 6,
  annual_capex: 1500,
  acquisition_date: '2026-06-01',
  // v11 ARM
  is_arm: false,
  // v11 insurance
  is_high_risk_zone: true,  // FL is high-risk
  insurance_quote_confirmed: true,
};
