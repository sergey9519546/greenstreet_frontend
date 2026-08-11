// ============================================================
// DSCR Loan Command Center v7.0 — Type Definitions
// Dual-Track, Math-Verified, Provenance-Honest
// ============================================================

// --- Property Inputs ---
export interface PropertyInputs {
  purchasePrice: number;
  leaseRent: number;
  marketRent: number;       // 1007/1025 appraiser market rent
  strProjectedRent: number; // AirDNA or projected STR gross
  strDocumentedRent: number; // 12-month actual STR history
  hoa: number;                // MONTHLY
  annualTaxes: number;        // ANNUAL
  annualInsurance: number;    // ANNUAL
  floodInsurance: number;     // MONTHLY (bug audit #1 — do not divide by 12; see calculatePITIA)
  propertyType: PropertyType;
  state: string;
  unitCount: number;        // 1, 2, 3, or 4
  sqft: number;
  yearBuilt: number;
  isCondotel: boolean;
  isNonWarrantable: boolean;
  isRural: boolean;
  isDecliningMarket: boolean; // CT, FL, IL, NJ, NY overlay
  hoaSTRPolicy: 'ALLOWS' | 'SILENT' | 'PROHIBITS' | 'UNKNOWN';
  /** Mapper-created list of explicitly supplied numeric fields that require review. */
  inputValidationIssues?: readonly string[];
}

export type PropertyType =
  | 'SFR'
  | '2-4_UNIT'
  | 'CONDO_WARRANTABLE'
  | 'CONDO_NON_WARRANTABLE'
  | 'CONDOTEL'
  | 'RURAL'
  | '5+_UNIT'
  | 'MIXED_USE';

// --- Borrower Profile ---
export interface BorrowerProfile {
  ficoScore: number;
  experience: InvestorExperience;
  existingFinancedProperties: number;
  entityType: EntityType;
  isUSCitizenOrPR: boolean;  // SSN path vs ITIN
  availableReserves: number;
  reserveAssets: ReserveAsset[];
  isFirstResponder: boolean;
  isNonUsInvestor: boolean;
}

export type InvestorExperience = 'FIRST_TIME' | 'EXPERIENCED' | 'VETERAN';
export type EntityType = 'INDIVIDUAL' | 'LLC' | 'S_CORP' | 'C_CORP' | 'TRUST';

// --- Reserve Assets ---
export interface ReserveAsset {
  type: ReserveAssetType;
  value: number;
}

export type ReserveAssetType =
  | 'CHECKING' | 'SAVINGS' | 'MONEY_MARKET'
  | 'BROKERAGE' | 'PUBLICLY_TRADED_SECURITIES'
  | 'RETIREMENT_401K' | 'RETIREMENT_IRA'
  | 'BUSINESS_ACCOUNT' | 'CASH_OUT_PROCEEDS' | 'GIFT_FUNDS'
  | 'CRYPTO' | 'HOME_EQUITY' | 'UNSECURED_BORROWED';

// --- Loan Structure ---
export interface LoanStructure {
  ltv: number;
  term: LoanTerm;
  ioPeriod: IOPeriod;
  armType: ARMType;
  prepayPreference: PrepayType;
  purpose: LoanPurpose;
  expectedHoldYears: number;
  points: number;             // origination points (e.g., 2.0 = 2%)
  lenderFees: number;         // flat lender fees
  brokerFees: number;
  rateLockCost: number;
}

export type LoanTerm = '30_YR' | '40_YR' | '15_YR';
export type IOPeriod = 'NONE' | '5_YR' | '7_YR' | '10_YR';
export type ARMType = 'FIXED' | '5_6_ARM' | '7_6_ARM' | '10_6_ARM';
export type PrepayType =
  | 'NONE'
  | '54321' | '4321' | '321'
  | '54333'   // floored stepdown
  | 'FLAT_5'  // flat 5/5/5
  | 'SIX_MONTHS_INTEREST'
  | 'SIX_MONTHS_80_PCT'
  | 'YIELD_MAINTENANCE'
  | 'SOFT_PREPAY';
export type LoanPurpose = 'PURCHASE' | 'RATE_TERM' | 'CASH_OUT';

// --- Rental Strategy ---
export type RentalStrategy = 'LTR' | 'STR' | 'MTR';

// --- DSCR Formula Method ---
export type DSCRFormulaMethod =
  | 'GROSS_PITIA'   // Gross Rent / PITIA (1007 DSCR)
  | 'GROSS_ITIA'    // Gross Rent / ITIA (for IO loans)
  | 'NOI_PI';       // NOI / P&I

// --- DSCR Gradient (6 tiers) ---
export type DSCRTier = 'ELITE' | 'STRONG' | 'STANDARD' | 'PREMIUM' | 'SPECIALIST' | 'NO_RATIO';

export interface DSCRGradient {
  tier: DSCRTier;
  label: string;
  range: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  emoji: string;
}

// --- Dual-Track DSCR ---
export interface DualTrackDSCR {
  track1: DSCRTrack; // Lender Qualification
  track2: DSCRTrack; // Investor Survival
  verdict: DualTrackVerdict;
}

export interface DSCRTrack {
  label: string;
  dscr: number;
  gradient: DSCRGradient;
  qualifyingRent: number;
  rentSource: string;
  formulaMethod: DSCRFormulaMethod;
  vacancyApplied: number;      // percent
  managementApplied: number;   // percent
  maintenanceApplied: number;  // percent
  capexApplied?: number;       // percent (TCO CapEx reserve; Track 2 only)
  netRentAfterDeductions: number;
  monthlyCashFlow: number;     // net rent - PITIA
  passes: boolean;
}

export interface DualTrackVerdict {
  track1Passes: boolean;
  track2Passes: boolean;
  summary: string;
  warningRequired: boolean; // Track 2 negative carry requires acknowledgment
}

// --- Triple Rate ---
export interface TripleRate {
  competitive: number;   // 6.125%-6.49% (740+ FICO, ≤70% LTV, 1.0+ DSCR)
  typical: number;       // 6.50%-7.50%
  fullMarket: number;    // up to 10.75%+
  dateStamp: string;     // "June 2026"
  treasurySpread: string; // "10yr + ~200-225 bps"
}

// --- Provenance Labels (v7.0 — THREE levels) ---
export type ProvenanceLabel =
  | 'VERIFIED_PRIMARY'      // lender site, statute
  | 'VERIFIED_SECONDARY'    // published matrix, third-party review
  | 'UNVERIFIED';           // no reliable source

export interface LenderDataPoint<T = number | string | number[] | boolean> {
  value: T;
  provenance: ProvenanceLabel;
  source: string;
  asOfDate: string;         // e.g., "2026-06"
  notes?: string;
}

// --- PPP State Law (v7.0 expanded) ---
export interface PPPStateLaw {
  state: string;
  status: PPPStateStatus;
  reason: string;
  details: string;
  entityRestrictions?: EntityType[];
  loanThreshold?: number;           // e.g., PA $319,777 for 1-2 unit (2026)
  thresholdIsIndexed?: boolean;     // PA/OH thresholds adjust annually
  thresholdYear?: number;           // 2026
  armRestriction?: boolean | 'UNVERIFIED';
  unitCountRestriction?: number;    // e.g., PA applies to 1-2 unit
  maxPenaltyYears?: number;         // MN: 4 years max
  maxPenaltyAmount?: string;        // MN: ≤2 months interest
  statutoryCapSchedule?: number[];  // MS: [5,4,3,2,1]
  statutoryReference?: string;      // e.g., "Minn. Stat. § 58.137"
  provenance: ProvenanceLabel;
  lastVerified: string;
}

export type PPPStateStatus =
  | 'UNKNOWN'              // state code is missing/unrecognized; verify before quoting
  | 'PROHIBITED'           // KS, NM, MD (effectively)
  | 'PRACTICALLY_PROHIBITED' // MN (so narrow it's effectively prohibited)
  | 'ENTITY_ONLY'          // NJ individuals restricted
  | 'CONDITIONAL'          // IL, OH, PA — amount/entity dependent
  | 'AMBIGUOUS'            // ND, MI — interpretations vary
  | 'ALLOWED'              // most states
  | 'ARM_RESTRICTED';      // WI/ME ARM restriction

export interface PPPCheckResult {
  allowed: boolean;
  status: PPPStateStatus;
  reason: string;
  adjustedOptions: PrepayType[];
  noPPPPremiumRate: number;    // ~0.25% rate premium when PPP blocked
  noPPPPremiumFee: number;     // ~0.625% fee premium
  requiresEntityVesting: boolean;
  entityNote: string;
  legalWarning: string;
}

// --- PITIA Breakdown ---
export interface PITIABreakdown {
  principalAndInterest: number;
  taxes: number;
  insurance: number;
  hoa: number;
  floodInsurance: number; // monthly (passthrough — see calculatePITIA unit convention)
  mortgageInsurance: number; // rare for DSCR
  total: number;
  // ITIA variant for IO
  isInterestOnly: boolean;
  interestOnlyPayment?: number;
  itia?: number; // IO payment + taxes + insurance + HOA + flood
}

// --- DSCR Result (v7.0 comprehensive) ---
export interface DSCRResult {
  dualTrackDSCR: DualTrackDSCR;
  qualifyingRent: number;
  rentSource: string;
  monthlyPITIA: PITIABreakdown;
  dscr: number;                // Track 1 DSCR (lender qualification)
  dscrGradient: DSCRGradient;
  solvedRate: number;
  tripleRate: TripleRate;
  loanAmount: number;
  debtYield: number;
  cashToClose: CashToCloseStack;
  appraisalBreakpointRent: number;
  appraisalBreakpointPercent: number;
  dealBreakRate: number;       // rate where DSCR = 1.0
  rateHeadroomBps: number;     // bps between current rate and deal-break rate
  maxPurchaseAtDSCR1: number;
  minDownPayment: number;
  additionalDownNeeded: number;
}

// --- Cash-to-Close Stack ---
export interface CashToCloseStack {
  downPayment: number;
  closingCosts: number;
  points: number;
  lenderFees: number;
  brokerFees: number;
  rateLockCost: number;
  reserveRequirement: number;  // likely scenario
  reserveConservative: number; // conservative scenario
  furnishingBudget: number;
  credits: number;
  total: number;               // optimistic
  totalConservative: number;
  totalStress: number;
}

// --- Reserve Engine (v7.0 Three-Scenario) ---
export interface ReserveScenarios {
  likely: ReserveCalculation;
  conservative: ReserveCalculation;
  stress: ReserveCalculation;
  geographyOverlay: GeographyOverlay | null;
  cap: number; // 12 months max
}

export interface ReserveCalculation {
  label: string;
  baseMonths: number;
  adjustments: ReserveAdjustment[];
  totalMonths: number;       // capped at 12
  totalDollars: number;
  assetHaircuts: AssetHaircutResult[];
  totalEligibleReserves: number;
  shortfall: number;
  seasoningWarning: boolean;
}

export interface ReserveAdjustment {
  factor: string;
  monthsAdded: number;
  reason: string;
  capped: boolean; // true if this adjustment was capped
}

export interface GeographyOverlay {
  state: string;
  schedule: string;     // e.g., "9/12/15" for CA
  provenance: ProvenanceLabel;
  source: string;
}

export interface AssetHaircutResult {
  assetType: ReserveAssetType;
  value: number;
  haircutPct: number;
  eligibleAmount: number;
  tier: 1 | 2 | 3 | 'EXCLUDED';
}

// --- Sensitivity / Breakeven ---
export interface BreakevenResult {
  rentBreakeven: { for1_0: number; for1_10: number; for1_25: number };
  priceBreakeven: { for1_0: number; for1_10: number; for1_25: number };
  ltvBreakeven: {
    for1_0: number; for1_10: number; for1_25: number;
    additionalDown: { for1_0: number; for1_10: number; for1_25: number };
  };
  rateBreakeven: { maxRateFor1_0: number; maxRateFor1_10: number; maxRateFor1_25: number };
  structureBreakeven: {
    dscrWithIO: number;
    dscrWith40yr: number;
    monthlySavingsIO: number;
    ioRecastPayment: number;
    ioRecastDSCR: number;
    note: string;
  };
  taxInsuranceBreakeven: { taxAppealNeeded: number; insuranceReshopNeeded: number };
  pathTo1_25: PathToTarget;
  tornadoData: TornadoItem[];
  jointAppraisalRisk: JointAppraisalRisk;
}

export interface PathToTarget {
  targetDSCR: number;
  requiredRentIncrease: number;
  requiredPriceReduction: number;
  requiredAdditionalDown: number;
  requiredRateBuydown: number;
  bestSingleFix: { action: string; amount: number; cost: number };
  bestCombination: { actions: string[]; totalCost: number };
}

export interface JointAppraisalRisk {
  rentBreakpoint: number;
  rentDropPercent: number;
  valueShockTable: ValueShockRow[];
  combinedRiskRating: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  bindingConstraint: 'RENT' | 'VALUE' | 'BOTH' | 'NEITHER';
  summary: string;
  /** Combined stress test: simultaneous rent -10% × value -10% shock (Section 8.1). */
  combinedStressTest: {
    rentDropPct: number;
    valueDropPct: number;
    stressedRent: number;
    stressedValue: number;
    stressedMaxLoan: number;
    stressedPITIA: number;
    stressedDSCR: number;
    /** Rating implied by the combined -10%/-10% shock alone. */
    impliedRating: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  };
}

export interface ValueShockRow {
  appraisedValue: number;
  maxLoan: number;
  cashGap: number;
  dscrAtMaxLoan: number;
}

export interface TornadoItem {
  lever: string;
  currentValue: number;
  lowValue: number;
  highValue: number;
  dscrAtLow: number;
  dscrAtHigh: number;
  impact: number;
}

// --- Heatmap ---
export interface HeatmapCell {
  rent: number;
  price: number;
  dscr: number;
  gradient: DSCRGradient;
}

// --- Loan Optimizer / Structure Option ---
export interface StructureOption {
  name: string;
  term: string;
  armType: string;
  ioPeriod: string;
  ltv: number;
  rate: number;
  track1DSCR: number;
  track2DSCR: number;
  monthlyPayment: number;
  monthlyCashFlow: number;
  fiveYearCost: number;
  prepayPenalty: string;
  prepaySchedule: PrepayPenaltySchedule;
  totalCostOfCapital: number;
  tags: string[];
  pppAllowed: boolean;
  pppStateNote: string;
  ioRecastWarning: string | null;
}

export interface PrepayPenaltySchedule {
  structure: string;
  year1: number;
  year2: number;
  year3: number;
  year4: number;
  year5: number;
  year6Plus: number;
  partialAllowancePct: number; // e.g., 20% per year
  softPrepay: boolean;
  softPrepaySaleExempt: boolean | 'UNCONFIRMED';
}

// --- STR Underwriting (Three Worlds) ---
export interface STRUnderwritingResult {
  world1_LTR: STRWorld;
  world2_Projected: STRWorld;
  world3_Documented: STRWorld;
  bestQualifyingRent: number;
  bestWorld: string;
  haircutPercent: number;
  legalityGate: STRLegalityGate;
  documentationChecklist: DocChecklistItem[];
  marketDirectionWarning: string;
  /** v11.1 (AUDIT-FINAL issue 6): Monthly seasonality breakdown — 12 months
   *  of projected STR revenue, DSCR, and occupancy stress. Required by spec
   *  Part G "monthly DSCR breakdown + off-season warning".
   *
   *  Non-optional: evaluateSTRUnderwriting (the only producer) populates this on
   *  both of its return paths, and the spec makes it mandatory. It was marked
   *  optional while the field was being rolled out; leaving the `?` on forced
   *  every consumer to null-check a value that is always present. */
  monthlySeasonality: STRMonthlySeasonality;
}

/** v11.1: STR monthly seasonality projection.
 *  National-average index (100 = annual mean month); per-market overrides
 *  can be applied by the caller. */
export interface STRMonthlySeasonality {
  months: STRMonthBreakdown[];
  annualRevenueProjected: number;
  annualRevenueHaircut: number;     // revenue after 20% Track-1 haircut
  offSeasonMonths: string[];        // months where DSCR < 1.0
  worstMonth: string;
  worstMonthDSCR: number;
  bestMonth: string;
  bestMonthDSCR: number;
  warningMessage: string;
}

export interface STRMonthBreakdown {
  month: string;          // 'Jan', 'Feb', etc.
  monthIndex: number;     // 1-12
  seasonalityIndex: number; // 100 = average month
  projectedRevenue: number; // gross STR revenue this month
  haircutRevenue: number;   // after 20% Track-1 haircut
  monthlyPITIA: number;
  monthlyDSCR: number;       // haircutRevenue / monthlyPITIA
  isOffSeason: boolean;      // DSCR < 1.0
}

export interface STRWorld {
  name: string;
  grossIncome: number;
  haircutPercent: number;
  netIncome: number;
  ltrFallback: number;
  qualifyingRent: number;
  dscr: number;
  method: string;
  lenderConfirmationRequired: boolean;
}

export interface STRLegalityGate {
  status: 'CLEAR' | 'RESTRICTED' | 'UNCERTAIN' | 'PROHIBITED';
  city: string;
  permitStatus: string;
  minStayRestriction: string;
  ownerOccupancyRequired: boolean;
  hoaStatus: 'ALLOWS' | 'SILENT' | 'PROHIBITS' | 'UNKNOWN';
  enforcementIntensity: 'LOW' | 'MODERATE' | 'HIGH';
  pendingLegislation: boolean;
  summary: string;
  incomeEnabled: boolean;
}

export interface DocChecklistItem {
  item: string;
  required: boolean;
  status: 'COMPLETE' | 'NEEDED' | 'N/A';
}

export interface STRPolicy {
  lenderId: string;
  allowed: boolean;
  haircutPercent: number;
  incomeMethod: 'AIRDNA_PROJECTION' | 'AIRDNA_100_PCT' | 'HISTORICAL_12MO' | 'APPRAISAL_STR' | 'LT_MARKET_FALLBACK';
  requiresAirDNA: boolean;
  requiresLease: boolean;
  maxLTVForSTR: number;
  provenance: ProvenanceLabel;
}

// --- Lender Profile (v7.0 provenance-honest) ---
export interface LenderProgram {
  id: string;
  name: string;
  version: string;
  effectiveDate: string;
  verifiedDate: string;
  sourceType: ProvenanceLabel;
  sourceSnapshot: string;
  confidenceScore: number;       // 0-100
  confidenceBand: string;        // "Highly verified" / "Reliable" / etc.

  // Program parameters
  statesAvailable: string[];
  minFICO: LenderDataPoint<number>;
  maxLTV: LenderDataPoint<number>;
  minDSCR: LenderDataPoint<number>;
  noRatioAvailable: LenderDataPoint<boolean>;
  reserveRule: LenderDataPoint<string>;
  strPolicy: STRPolicy;
  prepayOptions: PrepayType[];
  loanAmountMin: LenderDataPoint<number>;
  loanAmountMax: LenderDataPoint<number>;
  entityAllowed: EntityType[];
  nonUsInvestorAllowed: LenderDataPoint<boolean>;
  propertyTypeRules: Record<PropertyType, { allowed: boolean; maxLTV: number }>;
  dscrFormulaMethod: DSCRFormulaMethod;
  vacancyTreatment: 'NONE' | 'ZERO_TO_FIVE_PCT_2_4UNIT' | 'OTHER';
  rateAdjustment: number;       // relative to base
  rateSheetDate: string;

  // Fit assessment
  bestFor: string[];
  cautions: string[];
  notes: string;
  provenanceDetails: ProvenanceDetail[];
}

export interface ProvenanceDetail {
  claim: string;
  provenance: ProvenanceLabel;
  source: string;
  date: string;
}

export interface LenderFitResult {
  lenderId: string;
  lenderName: string;
  fitTier: FitTier;
  fitReason: string;
  eligible: boolean;
  ineligibleReasons: string[];
  estimatedRate: TripleRate;
  requiredReserves: number;
  track1DSCR: number;
  track2DSCR: number;
  pppStateResult: PPPCheckResult;
  twoQuoteRequired: boolean;
  provenanceWarnings: string[];
  sourceProvenance: ProvenanceLabel;     // lender profile's overall provenance
  confidenceScore: number;                // 0-100 from lender profile
  confidenceBand: string;                 // e.g., "Highly verified"
  rateAdjustment: number;                 // lender's rate delta vs base
  sourceSnapshot: string;                 // lender's source snapshot string
}

export type FitTier =
  | 'STRONG_FIT'
  | 'STANDARD_FIT'
  | 'CONDITIONAL_FIT'
  | 'UNLIKELY_FIT'
  | 'DOES_NOT_MEET_GUIDELINES';

// --- Monte Carlo ---
export interface MonteCarloResult {
  simulations: number;
  probabilityDSCRAbove1_0: number;
  probabilityNegativeCashFlow: number;
  expectedAnnualCashFlow: {
    p10: number; p25: number; p50: number; p75: number; p90: number;
  };
  reserveDepletionCurve: ReserveDepletionPoint[];
  dscrDistribution: DSCRDistributionPoint[];
  keyRisks: RiskItem[];
  // Phase 4 (regime-switching recalibration) — optional, non-breaking.
  probabilityTrack2Below1?: number;   // P(investor-survival DSCR < 1.0)
  avgTimeInStressPct?: number;        // avg fraction of months in the stress regime
}

// v11.9 — Monte Carlo ARM/SOFR rate-path simulator (Vasicek mean-reverting process)
export type MonteCarloRatePathAnalysisStatus = 'READY' | 'INVALID_ASSUMPTIONS';

export interface MonteCarloRatePathResult {
  /** READY only when every input and every generated outcome was finite and bounded. */
  analysisStatus: MonteCarloRatePathAnalysisStatus;
  /** Human-readable reasons when no analysis can be safely produced. */
  analysisIssues: string[];
  simulations: number;                    // # of stochastic paths simulated
  horizonMonths: number;                  // simulation horizon (e.g., 120 = 10 years)
  seed: number;                           // RNG seed (for reproducibility)
  // Per-path outcomes (one entry per simulation)
  paths: RatePathOutcome[];
  // Aggregate statistics
  finalRateStats: {
    mean: number;
    median: number;
    p10: number;                          // 10th percentile (LOW rate — best case)
    p25: number;
    p75: number;
    p90: number;                          // 90th percentile (HIGH rate — worst case)
    stddev: number;
  };
  dscrStats: {
    mean: number;
    median: number;
    p10: number;                          // 10th percentile (LOW DSCR — worst case)
    p25: number;
    p75: number;
    p90: number;                          // 90th percentile (HIGH DSCR — best case)
    min: number;
    max: number;
  };
  // Probability distributions
  probabilityDSCRBelow1_0: number;        // P(DSCR < 1.0) — deal-break probability
  probabilityDSCRBelow1_25: number;       // P(DSCR < 1.25) — marginal qualifying probability
  probabilityDSCRBelow1_50: number;       // P(DSCR < 1.50) — comfortable buffer probability
  probabilityRateAboveLifetimeCap: number; // P(stabilized rate hits lifetime cap)
  // SOFR path distribution at key horizons
  sofrAtHorizon: {
    year1: { mean: number; p10: number; p90: number };
    year3: { mean: number; p10: number; p90: number };
    year5: { mean: number; p10: number; p90: number };
    year10: { mean: number; p10: number; p90: number };
  };
  // Model parameters used (for audit trail)
  modelParameters: {
    process: 'VASICEK';
    longRunMeanSOFR: number;              // θ (theta) — long-run mean SOFR (%)
    meanReversionSpeed: number;           // κ (kappa) — mean reversion speed (per year)
    volatility: number;                   // σ (sigma) — annual volatility (%)
    initialSOFR: number;                  // r0 — starting SOFR (%)
    shockProbMonthly: number;             // probability of Fed shock event per month
    shockMagnitudeBps: number;            // magnitude of Fed shock (bps, ±)
  };
  summary: string;                        // human-readable summary
}

export interface RatePathOutcome {
  pathId: number;
  finalSOFR: number;                      // SOFR at end of horizon
  stabilizedRate: number;                 // ARM stabilized rate along this path
  finalDSCR: number;                      // Track 1 DSCR at stabilized rate
  hitLifetimeCap: boolean;                // true if ARM rate hit lifetime cap on this path
  hitFloor: boolean;                      // true if ARM rate hit floor on this path
}

export interface ReserveDepletionPoint {
  month: number;
  p10Reserve: number;
  p50Reserve: number;
  p90Reserve: number;
}

export interface DSCRDistributionPoint {
  dscr: number;
  probability: number;
}

export interface RiskItem {
  risk: string;
  probability: number;
  impact: number;
}

// --- Portfolio ---
export interface PortfolioProperty {
  id: string;
  name: string;
  address: string;
  state?: string;  // v11.6: optional state code for geographic concentration analysis
  monthlyPITIA: number;
  monthlyRent: number;
  lender: string;
  loanBalance: number;
  dscr: number;
  track2DSCR: number;
  isBlanket: boolean;
}

export interface PortfolioAnalysis {
  properties: PortfolioProperty[];
  totalPITIA: number;
  totalRent: number;
  totalNOI: number;
  globalDSCR: number;       // ΣNOI / ΣDebt_Service
  totalDebtYield: number;
  totalCashInvested: number;
  weightedCashOnCash: number;
  totalReservesRequired: number;
  totalReservesByLender: { lender: string; months: number; dollars: number }[];
  reserveShortfall: number;
  blanketLoanWarning: string | null;
  refiOpportunities: RefiOpportunity[];
  // v11.6 — Portfolio Analytics Depth additions
  lenderConcentration: {
    topLender: string | null;
    topLenderCount: number;
    topLenderPct: number;        // 0-1
    uniqueLenderCount: number;
    warning: string | null;      // populated if topLenderPct > 0.50
  };
  geographicConcentration: {
    topState: string | null;
    topStateCount: number;
    topStatePct: number;         // 0-1
    uniqueStateCount: number;
    propertiesWithState: number; // may be < total if state field not populated
    warning: string | null;      // populated if topStatePct > 0.40
  };
  dscrDistribution: {
    min: number;
    max: number;
    mean: number;
    median: number;
    count: number;
  };
  track2DscrDistribution: {
    min: number;
    max: number;
    mean: number;
    median: number;
    count: number;
  };
  negativeCashFlowProperties: {
    count: number;               // properties with track2DSCR < 1.0
    totalMonthlyBleed: number;   // Σ(max(0, PITIA - NOI_monthly)) for bleeders
    propertyIds: string[];
  };
}

export interface RefiOpportunity {
  propertyId: string;
  currentRate: number;
  projectedRate: number;
  monthlySavings: number;
  seasoningMonthsRemaining: number;
}

// --- Refi Tracker ---
export interface RefiAnalysis {
  currentDSCR: number;
  projectedRefiDSCR: number;
  seasoningMonthsRequired: number;
  delayedFinancingAvailable: boolean;
  projectedRefiRate: number;
  projectedRefiPayment: number;
  monthlySavings: number;
  breakEvenMonths: number;
  appreciationNeeded: number;
  // v11.7 — Refi Tracker enhancements
  refiType: 'RATE_TERM' | 'CASH_OUT' | 'NO_REFI';
  seasoningMet: boolean;
  seasoningMonthsRemaining: number;
  cashOutMaxAmount: number;        // max cash extractable at 70% LTV cash-out (0 for rate-term)
  refiReadinessScore: number;      // 0-100 composite (higher = more ready)
  readinessFactors: RefiReadinessFactor[];
}

export interface RefiReadinessFactor {
  factor: string;                  // e.g., 'Seasoning'
  score: number;                   // 0 to maxScore
  maxScore: number;
  status: 'PASS' | 'WARN' | 'FAIL';
  detail: string;                  // human-readable explanation
}

// --- Rescue Engine ---
export interface RescueResult {
  currentTrack1DSCR: number;
  targetTrack1DSCR: number;
  currentTrack2DSCR: number;
  fixes: RescueFix[];
  fastestFix: RescueFix;
  cheapestFix: RescueFix;
  lowestRiskFix: RescueFix;
  bestROIFix: RescueFix;
  warning: string;
}

export interface RescueFix {
  action: string;
  description: string;
  amount: number;
  track1Impact: number;
  track2Impact: number;
  cashOnCashImpact: number;
  risk: 'LOW' | 'MODERATE' | 'HIGH';
  cost: number;
  lenderConfirmation: boolean;
}

// --- Deal Kill Criteria ---
export interface DealKillCheck {
  criteria: DealKillItem[];
  allClear: boolean;
  blockingItems: string[];
  track2Acknowledgment: DealKillItem | null;
}

export interface DealKillItem {
  criterion: string;
  triggered: boolean;
  severity: 'BLOCKER' | 'WARNING' | 'ACKNOWLEDGMENT';
  detail: string;
  action: string;
}

// --- Acquisition Score ---
export interface AcquisitionScore {
  score: number;
  band: string;
  factors: ScoreFactor[];
}

export interface ScoreFactor {
  name: string;
  weight: number;
  value: number;
  contribution: number;
}

// --- US States ---
export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  'DC',
] as const;

// --- Declining Market States ---
export const DECLINING_MARKET_STATES = ['CT', 'FL', 'IL', 'NJ', 'NY'] as const;

// --- STR Restriction States (heavily regulated) ---
export const STR_RESTRICTION_STATES = ['CA', 'NY', 'HI', 'MA', 'CO', 'WA'] as const;

// --- Verified Payment Factor Table (30-year) ---
// These are GOLDEN TEST VALUES — do not modify without re-derivation
export const VERIFIED_PAYMENT_FACTORS: Record<string, number> = {
  '6.125': 0.006076,
  '6.50': 0.006321,
  '6.875': 0.006569,
  '7.00': 0.006653,    // $665.30 per $100K
  '7.25': 0.006822,
  '7.50': 0.006992,
  '7.75': 0.007164,
  '8.00': 0.007338,
  '8.25': 0.0075127,   // Corrected: was 0.007568 in v5.0
  '8.50': 0.007690,
  '9.00': 0.008046,
};

// ============================================================
// v11.0 UPGRADE TYPES — Tax Engine, Reassessment, ARM Reset,
// Returns, True Cost (AEY), IC Memo, Insurance Gate, BRRRR
// ============================================================

// --- Property Tax Reassessment on Purchase (Part B'.1) ---
export type ReassessmentRule =
  | 'CA_PROP_13'         // resets to purchase price; 2% annual cap; supplemental bill
  | 'TX_MARKET_RATE'     // 2-3% of market value annually; reassesses on purchase
  | 'FL_PURCHASE_RESET'  // similar purchase-year reset
  | 'NJ_RESET'           // NJ rebases to purchase price
  | 'NY_RESET'           // NY rebases to purchase price (with STAR exemptions)
  | 'IL_RESET'           // IL rebases to fair market value
  | 'GENERAL_REASSESS'   // most states reassess periodically; conservative assume purchase-year reset
  | 'NO_REASSESS';       // state limits increase to original seller basis (rare)

export interface StateReassessmentRule {
  state: string;
  rule: ReassessmentRule;
  // effective mill rate per state (annual property tax % of market value)
  effectiveMillRatePct: number;       // e.g., CA 0.75% statewide + local; TX ~1.7% avg
  annualIncreaseCapPct: number;       // CA 2%; TX none (effectively market-rate)
  purchaseYearReset: boolean;         // does purchase trigger reassessment to full market?
  supplementalBillExpected: boolean;  // CA: yes; others: usually no
  provenance: ProvenanceLabel;
  source: string;
  asOfDate: string;
}

export interface ReassessmentResult {
  sellerAnnualTax: number;
  reassessedAnnualTax: number;
  taxDeltaAnnual: number;
  taxDeltaMonthly: number;
  pitiaBefore: number;
  pitiaAfter: number;
  dscrBefore: number;
  dscrAfter: number;
  dscrImpact: number;
  supplementalBillEstimate: number;
  rule: ReassessmentRule;
  note: string;
}

// --- Tax Engine: After-Tax IRR (Part B'.2) ---
export type FilingStatus = 'SINGLE' | 'MFJ' | 'MFS' | 'HOH';

export interface TaxProfile {
  // MAGI components (Modified Adjusted Gross Income)
  ordinaryIncomeBrackets: TaxBracket[];
  magi: number;
  filingStatus: FilingStatus;
  stateTaxRatePct: number;            // e.g., 5% flat or state-specific
  isRealEstateProfessional: boolean;  // REP: 750hr + 50% test
  yearsREP: number;                   // for material participation
  // Depreciation inputs
  landAllocationPct: number;          // 10-25% typical; not depreciable
  costSegStudyCompleted: boolean;
  costSegReclassifiedPct: number;     // 20-40% of building reclassified
  acquisitionDate: string;            // ISO; for OBBBA bonus dep determination
  placedInServiceDate: string;
  // Sale/Exit inputs
  expectedHoldYears: number;
  exitSellingCostsPct: number;        // 6-8% typical
  exitCapRatePct: number;             // user-set; sensitivity ±50-150 bps
  section1031Exchange: boolean;
}

export interface TaxBracket {
  threshold: number;  // income threshold
  rate: number;       // marginal rate as decimal (0.24 = 24%)
}

// OBBBA bonus depreciation rules (Part B'.2)
export type BonusDepCategory =
  | 'POST_2025_01_19'    // acquired after Jan 19, 2025 — 100%
  | 'PRE_2025_01_19_2025' // acquired Jan 1-19, 2025, placed in service 2025 — 40%
  | 'PRE_2025_01_19_2026' // acquired Jan 1-19, 2025, placed in service 2026 — 20%
  | 'PRE_2025_2024'      // acquired before 1/1/25, placed in service 2024 — 60%
  | 'PRE_2025_2025'      // acquired before 1/1/25, placed in service 2025 — 40%
  | 'EXCLUDED';          // residential building structure (27.5-yr)

export interface BonusDepResult {
  category: BonusDepCategory;
  bonusPct: number;            // 1.00, 0.40, 0.20, 0.60
  appliesToShortLifeOnly: boolean;  // never to 27.5-yr structure
  qualifyingComponentValue: number;  // cost-seg short-life components
  firstYearBonusDepreciation: number;
  provenance: ProvenanceLabel;
  source: string;
}

export interface DepreciationSchedule {
  year: number;
  buildingDepreciation: number;     // 27.5-yr straight-line on (purchase - land)
  costSegDepreciation: number;      // bonus + accelerated short-life
  totalAnnualDepreciation: number;
  cumulativeDepreciation: number;
}

export interface RecaptureComputation {
  totalDepreciationTaken: number;
  unrecapturedSection1250Gain: number;  // straight-line portion — max 25% fed
  section1245Recapture: number;         // excess over straight-line (cost-seg 5/7yr) — ordinary income
  totalGainOnSale: number;
  appreciationGain: number;             // gain above original basis
  federalRecaptureTax: number;          // 25% × unrecaptured §1250 + ordinary × §1245
  federalLtcgTax: number;               // 0/15/20% on appreciation
  niitTax: number;                      // 3.8% on gains if MAGI > threshold
  stateTax: number;
  totalTaxOnSale: number;
  afterTaxExitProceeds: number;
}

export interface PassiveLossResult {
  magi: number;
  filingStatus: FilingStatus;
  isRep: boolean;
  fullAllowance: number;     // $25,000 (MFJ/S/HOH) or $12,500 (MFS)
  phaseOutStart: number;     // $100,000 (most), $50,000 (MFS)
  phaseOutEnd: number;       // $150,000 (most), $75,000 (MFS)
  actualAllowableLoss: number;
  suspendedLoss: number;     // carried forward
  repUnlocksAll: boolean;
}

export interface AfterTaxIRRResult {
  yearByYear: AfterTaxCashFlowRow[];
  preTaxIRR: number;
  afterTaxIRR: number;
  irrImpactOfTaxes: number;  // negative; how much taxes reduce IRR
  totalDepreciationShield: number;
  totalTaxOnExit: number;
  niitApplies: boolean;
  effectiveRecaptureRate: number;
  effectiveLtcgRate: number;
  disclaimer: string;
}

export interface AfterTaxCashFlowRow {
  year: number;
  preTaxNCF: number;             // NOI - ADS
  depreciationDeduction: number;
  taxableIncome: number;
  federalTax: number;
  stateTax: number;
  afterTaxNCF: number;
  cumulativeAfterTaxNCF: number;
}

// --- ARM / SOFR Reset Engine (Part B") ---
export type ARMIndex = 'SOFR_30D' | 'SOFR_30D_AVG' | 'TREASURY_5YR' | 'TREASURY_10YR';

export interface ARMTerms {
  armType: string;                // e.g., '5_6_ARM', '7_6_ARM'
  index: ARMIndex;
  marginPct: number;              // typically 2.50-3.50%
  initialRate: number;            // quoted start rate
  initialCapPct: number;          // first-reset cap; +2% typical, some +5%
  periodicCapPct: number;         // +1% or +2% per period
  lifetimeCapPct: number;         // +5% or +6% over initial
  floorRate: number;              // most DSCR ARM floors = initial rate
  fixedPeriodMonths: number;      // 60 for 5/6 ARM, 84 for 7/6 ARM
  resetFrequencyMonths: number;   // 6 for 5_6_ARM
}

export interface MarketIndexSnapshot {
  asOfDate: string;            // '2026-06-17'
  treasury10Y: number;         // 4.44-4.47
  treasury5Y: number;          // 4.26
  sofr30Day: number;           // 3.59
  fedFundsEffective: number;   // 3.62
  fedFundsTargetLower: number; // 3.50
  fedFundsTargetUpper: number; // 3.75
  freddieMac30YrFixed: number; // ~6.53
  provenance: ProvenanceLabel;
  source: string;
}

export interface ARMResetResult {
  initialRate: number;
  currentIndex: number;
  margin: number;
  resetRateAtCurrentIndex: number;   // max(floor, index + margin)
  resetRateAtStressIndex: number;    // SOFR stress @ 5.0%
  resetRateAtLifetimeCap: number;    // initial + lifetime cap
  yearsToFirstReset: number;
  paymentAtCurrentReset: number;     // amortizing PI at resetRate
  paymentAtStressReset: number;
  paymentAtLifetimeCap: number;
  track1DSCRAtCurrentReset: number;
  track1DSCRAtStressReset: number;
  track1DSCRAtLifetimeCap: number;
  dealBreakRate: number;
  cushionBpsAtStress: number;
  ioArmDoubleShockYear: number | null;  // year when IO expires AND ARM resets
  doubleShockRisk: 'NONE' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  warningMessage: string;
}

// v11.8 — ARM/SOFR multi-scenario reset analysis
export type ARMScenarioName = 'BULLISH' | 'BASE' | 'BEARISH' | 'STRESS' | 'CRISIS';

export interface ARMScenarioResult {
  scenarioName: ARMScenarioName;
  indexPct: number;                    // sustained SOFR assumption for this scenario
  stabilizedRate: number;              // rate after full reset ladder settles
  paymentAtStabilization: number;      // amortizing P&I at stabilizedRate
  track1DSCRAtStabilization: number;   // qualifyingRent / new PITIA at stabilized rate
  dealBreaks: boolean;                 // true if track1DSCR < 1.0
  cushionBps: number;                  // deal-break rate - stabilized rate, in bps
  trajectory: ARMResetTrajectoryPointLite[];  // year-by-year rate path
}

export interface ARMResetTrajectoryPointLite {
  resetNumber: number;
  year: number;
  rate: number;
  capBinding: 'NONE' | 'INITIAL_CAP' | 'PERIODIC_CAP' | 'LIFETIME_CAP' | 'FLOOR';
}

export interface MultiScenarioARMResult {
  scenarios: ARMScenarioResult[];      // 5 scenarios, ordered bullish→crisis
  worstCase: ARMScenarioResult;        // scenario with lowest DSCR
  breaksCount: number;                 // # of scenarios where dealBreaks=true (out of 5)
  fixedRateComparison: number;         // current Freddie Mac 30yr fixed for refi analysis
  summary: string;                     // human-readable summary
}

export interface PaymentShockResult {
  initialPayment: number;
  worstCasePaymentAtFirstReset: number;   // max payment under any scenario at first reset
  paymentShockPct: number;                // (worst - initial) / initial × 100  [Reg Z disclosure]
  paymentShockYear: number;               // year of first reset
  worstCaseScenarioName: ARMScenarioName;
  regZDisclosure: string;                 // Reg Z-compliant disclosure text
}

export interface DSCRBreakYearResult {
  breakYear: number | null;               // first year DSCR drops below threshold
  threshold: number;                      // DSCR threshold used (typically 1.0 or 1.25)
  scenarioName: ARMScenarioName;
  dscrAtBreakYear: number;                // actual DSCR at break year (just below threshold)
  yearsToFirstReset: number;
  trajectory: { year: number; rate: number; dscr: number }[];
  warning: string;
}

export interface RefiTriggerResult {
  refiTriggerSOFR: number;                // SOFR level at which ARM stabilized rate = current 30yr fixed
  currentFixedRate: number;               // Freddie Mac 30yr fixed
  currentARMStabilizedRate: number;       // ARM stabilized rate at current SOFR
  refiRecommended: boolean;               // true if currentARMStabilizedRate > currentFixedRate
  refiSavingsMonthly: number;             // if refiRecommended, monthly savings at current balance
  breakEvenMonths: number;                // if refiRecommended, months to recoup 2.5% refi costs
  recommendation: string;                 // human-readable recommendation
}

// --- Returns Engine: Pre-tax levered IRR + exit model (Part B) ---
export interface ReturnsResult {
  entryCapRate: number;
  yieldOnCost: number;
  year1CashOnCash: number;
  debtYield: number;
  breakEvenOccupancy: number;
  equityMultiple: number;
  leveredIRR: number;
  unleveredIRR: number;
  exitYear: number;
  exitCapRate: number;
  exitValue: number;
  exitSellingCosts: number;
  remainingLoanBalance: number;
  prepayPenaltyAtExit: number;
  netExitProceeds: number;
  holdMatrix: HoldMatrixCell[][];     // 4 holds × 3 exit caps × 4 rent growths
  capExReservePct: number;            // 5-8% EGI
  monthlyAdsBreakdown: { principal: number; interest: number; total: number };
  note: string;
}

export interface HoldMatrixCell {
  holdYears: number;
  rentGrowthPct: number;
  exitCapRatePct: number;
  leveredIRR: number;
  afterTaxIRR: number;
  equityMultiple: number;
  verdict: 'ROBUST' | 'STABLE' | 'CONDITIONAL' | 'FRAGILE' | 'BROKEN';
}

// --- True Cost of Capital / AEY (Part D) ---
export interface TrueCostResult {
  lenderId: string;
  lenderName: string;
  statedRate: number;
  pointsPct: number;
  pointsDollars: number;
  lenderFees: number;
  brokerFees: number;
  rateLockCost: number;
  pppPenaltyAtExit: number;
  netLoanProceeds: number;          // loan amount - points - fees
  cashFlows: TrueCostCashFlow[];
  aey: number;                      // XIRR of cash flows
  aprEquivalent: number;
  yspAdjustedAPR: number | null;
  yspFlag: boolean;
  totalCost12mo: number;
  totalCost24mo: number;
  totalCost36mo: number;
  totalCost60mo: number;
  pointsRecoupMonths: number;       // break-even vs par rate
  pointsRecoupVerdict: 'GREEN' | 'YELLOW' | 'RED';
  provenance: ProvenanceLabel;
  confidenceScore: number;
}

export interface TrueCostCashFlow {
  month: number;
  amount: number;     // negative = borrower outflow
}

// --- Lender Ranking (Part D) ---
export interface LenderRankingEntry {
  rank: number;
  lenderId: string;
  lenderName: string;
  fitTier: FitTier;
  eligible: boolean;
  ineligibleReasons: string[];
  estimatedRate: number;
  aey: number;
  totalCost60mo: number;
  confidenceScore: number;
  counterpartyRisk: CounterpartyRisk;
  pppAllowed: boolean;
  pppStructure: string;
  provenance: ProvenanceLabel;
  provenanceWarnings: string[];
  sourceSnapshot: string;
}

export interface CounterpartyRisk {
  lenderId: string;
  continuityScore: number;          // 0-100; higher = more stable
  knownDisruption: string | null;   // '2022-23 shakeout exit', 'pipeline pull', etc.
  lastReportedStatus: string;
  flag: 'STABLE' | 'WATCH' | 'ELEVATED';
}

// --- Insurance Gate (Part B'.3) ---
export type InsuranceRiskZone =
  | 'STANDARD'
  | 'FL_HIGH_RISK'
  | 'CA_COASTAL'
  | 'CA_WILDFIRE'
  | 'TX_GULF'
  | 'LA_COASTAL'
  | 'OTHER_HIGH_RISK';

export interface InsuranceGateResult {
  zone: InsuranceRiskZone;
  zoneLabel: string;
  quoteConfirmed: boolean;
  premiumAnnual: number;
  premiumStressY3: number;          // +25% stress
  killCriterion: boolean;
  verdict: 'CLEAR' | 'CONFIRM_REQUIRED' | 'KILL';
  reason: string;
  provenance: ProvenanceLabel;
  source: string;
}

// --- BRRRR Refi Seasoning Gate (Part B'.4) ---
export interface BRRRRSeasoningGate {
  applies: boolean;
  monthsHeld: number;
  lenderRuleMonths: number;          // 6-12 standard
  seasoningMet: boolean;
  cashOutBasis: 'ARV' | 'COST_BASIS';
  arvExpected: number;
  carryCostDuringSeasoning: number;
  waivedByLender: string | null;     // 'Easy Street Capital' for STR cash-out
  verdict: 'PROCEED' | 'WAIT' | 'RESTRUCTURE';
  reason: string;
}

// --- Return Grade (Part J) ---
export type ReturnGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface VerdictResult {
  verdict: 'PROCEED' | 'RESTRUCTURE' | 'PASS';
  bindingConstraint: string;
  killSwitchConditions: string[];
  returnGrade: ReturnGrade;
  returnGradeReason: string;
  track2AcknowledgmentRequired: boolean;
  /**
   * Null when `track2AcknowledgmentRequired` is false — there is no ack copy to
   * show. Callers must branch on the boolean (or null-check) rather than render
   * this directly; an empty string would read as "ack exists but is blank".
   */
  track2AcknowledgmentText: string | null;
  killCriteriaTriggered: KillCriterion[];
  rescueOptions: RescueFix[];
  note: string;
}

export interface KillCriterion {
  criterion: string;
  triggered: boolean;
  severity: 'BLOCKER' | 'WARNING' | 'ACKNOWLEDGMENT';
  detail: string;
  action: string;
}

// --- IC Memo Export (Part J) ---
export interface ICMemo {
  generatedAt: string;
  propertyAddress: string;
  entityType: string;
  verdict: 'PROCEED' | 'RESTRUCTURE' | 'PASS';
  bindingConstraint: string;
  killSwitch: string;
  threeMetricCredit: {
    track1DSCR: number;
    lenderMinDSCR: number;
    debtYield: number;
    debtYieldTarget: number;
    ltv: number;
    ltvCap: number;
    dealBreakRate: number;
    cushionBps: number;
  };
  returnStack: {
    entryCapRate: number;
    year1CoC: number;
    preTaxIRR: number;
    preTaxP10: number;
    preTaxP90: number;
    afterTaxIRR: number;
    returnGrade: ReturnGrade;
    equityMultiple: number;
    sellerAnnualTax: number;
    reassessedAnnualTax: number;
  };
  probabilisticStress: {
    bindingRisk: string;
    pDSCRLessThan1: number;
    fifthPctDSCR: number;
    heatmapSummary: string;
  };
  armReset: {
    initialRate: number;
    resetRateAtCurrent: number;
    resetRateAtStress: number;
    track1AtStress: number;
    doubleShockYear: number | null;
  } | null;
  lenderRanking: LenderRankingEntry[];
  insuranceStatus: string;
  strLegality: string;
  reserves: { likely: number; conservative: number; stress: number; portfolioStack: number };
  prepaySchedule: string;
  riskStatement: string;
  assumptions: string[];
  sourceDates: { name: string; date: string; provenance: ProvenanceLabel }[];
  disclaimer: string;
}

// ============================================================
// v11.11 — Lender Match Score Engine
// Ranks lenders 0-100 with weighted factor breakdown for
// transparent "best lender for THIS deal" recommendation.
// ============================================================

export type LenderScoreFactorKey =
  | 'RATE_COMPETITIVENESS'   // 25% weight — lower typical rate wins
  | 'DSCR_HEADROOM'          // 20% weight — cushion vs lender min DSCR
  | 'RESERVE_BURDEN'         // 15% weight — fewer months of reserves wins
  | 'PROVENANCE_CONFIDENCE'  // 15% weight — VERIFIED_PRIMARY + confidence score
  | 'LTV_FIT'                // 15% weight — distance from max LTV (sweet spot)
  | 'FLEXIBILITY'            // 10% weight — no-ratio, non-US investor, STR, IO options
  ;

export type LenderScoreTier =
  | 'TOP_PICK'      // score ≥ 80
  | 'STRONG'        // score ≥ 65
  | 'VIABLE'        // score ≥ 50
  | 'WEAK';         // score < 50

export interface LenderScoreFactor {
  key: LenderScoreFactorKey;
  label: string;                              // human-readable label
  weight: number;                             // 0-1, sum of all weights = 1.0
  rawScore: number;                           // 0-100 sub-score before weighting
  weightedScore: number;                      // rawScore × weight (0-100 contribution)
  detail: string;                             // explanation of how rawScore was derived
}

export interface LenderMatchScore {
  lenderId: string;
  lenderName: string;
  eligible: boolean;
  totalScore: number;                         // 0-100 weighted sum (0 if ineligible)
  tier: LenderScoreTier;
  factors: LenderScoreFactor[];               // 6 factors with breakdown
  topReasons: string[];                       // top 3 reasons to pick this lender
  topConcerns: string[];                      // top 2 concerns / risks
  rankAmongEligible: number | null;           // 1-based rank among eligible lenders (null if ineligible)
  recommendationText: string;                 // human-readable summary
}

export interface LenderMatchScoreResult {
  scores: LenderMatchScore[];                 // all lenders scored, sorted by score desc
  topPicks: LenderMatchScore[];               // top 3 eligible lenders (or fewer if <3 eligible)
  marketRateBenchmark: number;                // median typical rate across eligible lenders (context)
  fieldCount: number;                         // # of eligible lenders
  summary: string;                            // overall summary
}

// ============================================================
// v11.12 — Combined Stress Matrix Engine
// 2D rate×rent heatmap with cell-level risk classification,
// Track 1 + Track 2 DSCR, monthly cash flow, and break-even curves.
// ============================================================

export type StressRiskZone =
  | 'SAFE'           // DSCR ≥ 1.50 — comfortable buffer
  | 'COMFORTABLE'    // 1.25 ≤ DSCR < 1.50 — lender comfort threshold
  | 'MARGINAL'       // 1.00 ≤ DSCR < 1.25 — qualifies but no cushion
  | 'FRAGILE'        // 0.85 ≤ DSCR < 1.00 — deal-break zone
  | 'DEAL_BREAK';    // DSCR < 0.85 — severe negative cash flow

export interface StressMatrixCell {
  ratePct: number;                   // absolute rate (e.g., 7.00)
  rateOffsetBps: number;             // offset from base rate in bps (e.g., +100 = +1.00%)
  rentOffsetPct: number;             // rent offset from base (e.g., -10 = -10%)
  adjustedRent: number;              // actual rent used ($)
  piMonthly: number;                 // P&I payment ($/mo)
  pitiaMonthly: number;              // full PITIA ($/mo)
  track1DSCR: number;                // Lender Qualification DSCR
  track2DSCR: number;                // Investor Survival DSCR (after vacancy/mgmt/maint)
  monthlyCashFlow: number;           // Track 2 NOI - PITIA ($/mo)
  annualCashFlow: number;            // × 12
  riskZone: StressRiskZone;          // classification
  interpretation: string;            // human-readable explanation
}

export interface StressBreakEvenPoint {
  rentOffsetPct: number;             // rent offset (row)
  breakEvenRatePct: number | null;   // rate at which Track 1 DSCR = 1.0 (null if never breaks in range)
  cushionBps: number;                // baseRate - breakEvenRate, in bps (positive = safe)
}

export interface StressMatrixResult {
  baseRate: number;                  // solved rate (%)
  baseRent: number;                  // base qualifying rent ($/mo)
  baseLTV: number;                   // LTV (%) for context
  baseTrack1DSCR: number;            // baseline DSCR
  baseTrack2DSCR: number;
  rateAxis: number[];                // absolute rate values (Y-axis)
  rentAxis: number[];                // rent offset % values (X-axis)
  cells: StressMatrixCell[][];       // 2D grid: cells[i][j] = rateAxis[i] × rentAxis[j]
  breakEvenCurve: StressBreakEvenPoint[];  // for each rent offset, the break-even rate
  zoneCounts: Record<StressRiskZone, number>;  // count of cells in each risk zone
  totalCells: number;
  safeZonePct: number;               // % of cells in SAFE/COMFORTABLE
  fragileZonePct: number;            // % in FRAGILE/DEAL_BREAK
  worstCase: StressMatrixCell;       // cell with lowest Track 1 DSCR (extreme stress)
  bestCase: StressMatrixCell;        // cell with highest Track 1 DSCR (best case)
  summary: string;
}

// ============================================================
// v11.13 — IRR Waterfall Engine
// Decomposes the after-tax IRR pipeline into a transparent
// waterfall: Gross Rent → OpEx → NOI → Debt Service → Taxable →
// Tax → After-Tax CF → Exit → IRR.
// ============================================================

export type WaterfallSign = 'ADD' | 'SUBTRACT' | 'SUBTOTAL' | 'TOTAL';

export interface IRRWaterfallStage {
  step: number;                       // 1-indexed step number
  label: string;                      // human-readable label
  amount: number;                     // $ amount (always positive; sign conveyed by `sign`)
  sign: WaterfallSign;                // ADD/SUBTRACT/SUBTOTAL/TOTAL
  cumulative: number;                 // running cumulative after this stage
  pctOfGrossRent: number;             // % of gross scheduled rent (Year 1 only; null for hold totals)
  detail: string;                     // explanation of computation
}

export interface IRRWaterfallYear1 {
  stages: IRRWaterfallStage[];        // waterfall stages for Year 1
  grossRent: number;                  // Year 1 gross scheduled rent
  noi: number;                        // Year 1 NOI
  preTaxCF: number;                   // Year 1 pre-tax cash flow (NOI - ADS)
  afterTaxCF: number;                 // Year 1 after-tax cash flow
  effectiveTaxRate: number;           // Year 1 (fed+state tax) / pre-tax NCF
  depreciationShieldPct: number;      // Year 1 depreciation / NOI
}

export interface IRRWaterfallExit {
  exitYear: number;                   // year of exit (holdYears)
  salePrice: number;                  // gross sale price
  sellingCosts: number;               // selling costs ($)
  netSaleProceeds: number;            // sale price - selling costs
  remainingLoanBalance: number;       // loan payoff
  prepayPenalty: number;              // PPP at exit
  depreciationRecapture: number;      // unrecaptured §1250 + §1250 recapture tax
  capitalGainsTax: number;            // LTCG + NIIT
  netAfterTaxExit: number;            // what investor pockets at exit
  exitMultiple: number;               // netAfterTaxExit / cashInvested
}

export interface IRRWaterfallResult {
  // Year-1 waterfall (most-watched)
  year1: IRRWaterfallYear1;
  // Hold-total waterfall (sum across all years including exit)
  holdTotal: {
    stages: IRRWaterfallStage[];
    cashInvested: number;             // initial cash outflow
    totalOperatingCF: number;         // sum of year-by-year after-tax NCF
    exitAfterTax: number;             // exit waterfall result
    totalReturn: number;              // total $ returned (operating + exit)
    totalProfit: number;              // totalReturn - cashInvested
    returnMultiple: number;           // totalReturn / cashInvested
    preTaxIRR: number;
    afterTaxIRR: number;
    irrImpactOfTaxes: number;         // afterTaxIRR - preTaxIRR (typically negative)
  };
  // Exit waterfall
  exit: IRRWaterfallExit;
  // Summary text
  summary: string;
}

// ─── Audit log (ComplianceDashboard history) ──────────────────────────────────
export interface AuditLog {
  id?: string;
  userId: string;
  userEmail: string;
  type: "analyze" | "lender-search" | "state-rules";
  title: string;
  timestamp: string;
  input: string;
  output: any;
}
