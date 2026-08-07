// ============================================================================
// Dual-Track DSCR Truth Engine — Type System
// ============================================================================
// Separates Lender Qualification (Track A) from Investor Survival (Track B),
// then reconciles both into a 2x2 truth matrix verdict.
// ============================================================================

export type PropertyType =
  | 'SFR'
  | 'CONDO'
  | 'TWO_UNIT'
  | 'THREE_UNIT'
  | 'FOUR_UNIT'
  | 'MIXED_USE'
  | 'RURAL'
  | 'CONDOTEL'
  | 'STR'
  | 'MULTIFAMILY';

export type RentType = 'LTR' | 'STR' | 'MID_TERM' | 'CONDOTEL';
export type LoanPurpose = 'PURCHASE' | 'RATE_TERM_REFI' | 'CASH_OUT_REFI';
export type Entity = 'INDIVIDUAL' | 'LLC' | 'PARTNERSHIP' | 'CORP' | 'TRUST';
export type LoanStructure = 'FIXED_30' | 'FIXED_15' | 'FIXED_40' | 'ARM_5_6' | 'ARM_7_6' | 'ARM_10_6' | 'INTEREST_ONLY';
// v12.1 (P3-11): Added 'DEFEASANCE_3Y' as alias for the originally-typo'd 'DEFIANCE_3Y'.
// Both forms accepted; new code should prefer 'DEFEASANCE_3Y'.
export type PrepayType = 'NONE' | 'YSP_3_2_1' | 'YSP_5_4_3_2_1' | 'YSP_2_1' | 'LOCKOUT_3Y' | 'DEFIANCE_3Y' | 'DEFEASANCE_3Y';

// ---------------------------------------------------------------------------
// INPUT — Deal inputs (everything the underwriter + investor needs)
// ---------------------------------------------------------------------------

export interface DealInputs {
  // Property
  propertyType: PropertyType;
  rentType: RentType;
  state: string;
  county?: string;
  occupancyIntent: 'INVESTMENT' | 'OWNER' | 'SECOND_HOME';

  // Deal economics
  purchasePrice: number;
  appraisedValue: number;
  loanAmount: number;
  rate: number; // %
  points: number; // % of loan
  termMonths: number;
  amortMonths: number;
  interestOnlyMonths: number; // 0 = none
  prepayType: PrepayType;

  // Income
  borrowerRentClaim: number; // monthly
  appraiserRent: number; // monthly Form 1007 / 1025
  leaseRent: number; // monthly actual lease
  otherIncome: number; // monthly (laundry, parking, fees)
  leaseVerified: boolean;
  leaseDepositVerified: boolean;
  strTrailingRevenue?: number; // monthly trailing 12 avg
  strProjection?: number; // monthly projection

  // Expenses (monthly, investor-real)
  propertyTaxes: number;
  insurance: number;
  hoa: number;
  propertyMgmtPct: number; // % of EGI
  repairsMaintenancePct: number; // % of EGI
  capexReservePct: number; // % of EGI
  turnoverPct: number; // % of EGI
  utilities: number;
  landscaping: number;
  accounting: number;
  licensing: number;
  legalEvictionReserve: number;
  emergencyReserve: number;
  strFurnishingReserve: number;

  // Borrower
  fico: number;
  entity: Entity;
  experienceProperties: number;
  bankruptcySeasoningMonths: number;
  foreclosureSeasoningMonths: number;
  reservesMonths: number; // months of PITIA borrower has
  mortgageHistoryMonths: number; // months of clean mortgage history

  // Market / Risk
  vacancyPct: number; // market vacancy
  collectionLossPct: number;
  concessionsPct: number;
  platformFeesPct: number; // STR platform fees
  seasonalityHaircutPct: number;
  marketCapRate: number; // for exit valuation
  stressCapRate: number; // stressed exit cap

  // Documentation
  appraisalDone: boolean;
  inspectionDone: boolean;
  insuranceQuotedBindable: boolean;
  taxReassessmentEstimated: boolean;
  llcOwnershipVerified: boolean;
  guarantorLinkageVerified: boolean;
  strPlatformHistoryPulled: boolean;
  creditReportPulled: boolean;
  titleSearchPulled: boolean;
  bankStatementsPulled: boolean;

  // Loan purpose (used for matrix overlays)
  loanPurpose: LoanPurpose;
  structure: LoanStructure;

  // v12 (P1-14): After-tax profile — was hardcoded $120k MAGI / 24% / MFJ in toApiBody
  afterTax?: {
    landAllocationPct?: number;       // 10-25% typical
    federalBracketPct?: number;       // 24, 32, 37
    magi?: number;                    // modified adjusted gross income
    filingStatus?: 'single' | 'mfj' | 'mfs' | 'hoh';
    isRep?: boolean;                  // Real Estate Professional
    costSegElected?: boolean;
  };
}

// ---------------------------------------------------------------------------
// TRACK A — Lender Qualification outputs
// ---------------------------------------------------------------------------

export interface RentHierarchy {
  borrowerRentClaim: number;
  appraiserRent: number;
  leaseRent: number;
  lenderEligibleRent: number;
  investorStressedRent: number;
}

export interface LenderPITIA {
  principal: number;
  interest: number;
  taxes: number;
  insurance: number;
  hoa: number;
  total: number;
  itiaTotal: number; // for IO programs
}

export interface LenderMatrixResult {
  eligible: boolean;
  ficoTier: string;
  ltvTier: string;
  ltvActual: number;
  cltvActual: number;
  dscrRequired: number;
  dscrCalculated: number;
  dscrCushion: number; // calc - required
  dscrBand: string;
  maxLtvAllowed: number;
  maxLoanAllowed: number;
  reserveRequiredMonths: number;
  reserveActualMonths: number;
  reserveShortfall: number;
  eligiblePrograms: string[];
  bestProgram: string;
  estimatedRate: number;
  estimatedPoints: number;
  prepayOptions: string[];
  cashToClose: number;
  documentationExceptions: string[];
  guidelineConflicts: string[];
  reasonCodes: string[];
  eligibilityGates: { gate: string; passed: boolean; note: string }[];
  postRecastDscr?: number; // DSCR after IO recast (if IO period > 0)
  postRecastPitia?: number; // PITIA after IO recast
}

export interface LenderVerdict {
  pass: boolean;
  conditional: boolean;
  summary: string;
  reasons: string[];
  matrix: LenderMatrixResult;
  pitia: LenderPITIA;
  lenderDscr: number;
  qualifyingRent: number;
  rentHierarchy: RentHierarchy;
}

// ---------------------------------------------------------------------------
// TRACK B — Investor Survival outputs
// ---------------------------------------------------------------------------

export interface EffectiveGrossIncome {
  grossScheduledRent: number;
  vacancyLoss: number;
  collectionLoss: number;
  concessions: number;
  platformFees: number;
  seasonalityHaircut: number;
  otherIncome: number;
  egi: number;
}

export interface OperatingExpenses {
  propertyTaxes: number;
  insurance: number;
  hoa: number;
  propertyManagement: number;
  repairsMaintenance: number;
  capexReserve: number;
  turnover: number;
  utilities: number;
  landscaping: number;
  accounting: number;
  licensing: number;
  legalEviction: number;
  emergencyReserve: number;
  strFurnishingReserve: number;
  total: number;
}

export interface InvestorDebtService {
  baseAnnualDebtService: number;
  baseMonthlyPayment: number;
  ioMonthlyPayment: number;
  postRecastMonthlyPayment: number;
  paymentCliffIncrease: number;
  paymentCliffPct: number;
  armResetMonthlyPayment?: number; // post-ARM-reset payment if structure is ARM
  armResetRate?: number; // assumed rate at reset
}

export interface InvestorSurvivalResult {
  egi: EffectiveGrossIncome;
  opex: OperatingExpenses;
  noi: number;
  annualDebtService: number;
  investorDscr: number;
  monthlyCashFlow: number;
  cashOnCashReturn: number;
  capRate: number;
  breakevenRent: number;
  breakevenOccupancyPct: number;
  liquidityRunwayMonths: number;
  debtService: InvestorDebtService;
}

export interface InvestorVerdict {
  survives: boolean;
  summary: string;
  reasons: string[];
  result: InvestorSurvivalResult;
}

// ---------------------------------------------------------------------------
// STRESS TESTS
// ---------------------------------------------------------------------------

export interface StressScenario {
  name: string;
  category: 'base' | 'vacancy' | 'rent' | 'expense' | 'insurance' | 'tax' | 'capex' | 'rate' | 'exit' | 'str' | 'liquidity' | 'arm_reset' | 'io_recast';
  investorDscr: number;
  monthlyCashFlow: number;
  liquidityRunwayMonths: number;
  verdict: 'Pass' | 'Watch' | 'Fail' | 'Kill';
  note: string;
}

// ---------------------------------------------------------------------------
// INPUT VALIDATION
// ---------------------------------------------------------------------------

export interface ValidationIssue {
  field: keyof DealInputs;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

// ---------------------------------------------------------------------------
// FRAUD / DATA QUALITY
// ---------------------------------------------------------------------------

export interface FraudCheck {
  risk: string;
  check: string;
  passed: boolean;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  note: string;
}

export interface DataQualityResult {
  score: number; // 0-100
  fraudRisk: 'Low' | 'Moderate' | 'High' | 'Critical';
  checks: FraudCheck[];
  primaryWeakness: string;
}

// ---------------------------------------------------------------------------
// FOUR SCORES
// ---------------------------------------------------------------------------

export interface FourScores {
  lenderQualification: number; // 0-100
  pricingEfficiency: number;
  investorSurvival: number;
  dataConfidence: number;
}

// ---------------------------------------------------------------------------
// TRUTH MATRIX
// ---------------------------------------------------------------------------

export type Quadrant = 'GREEN' | 'TRAP' | 'STRUCTURING' | 'KILL';

export interface TruthMatrix {
  lenderApproves: boolean;
  investorSurvives: boolean;
  quadrant: Quadrant;
  label: string;
  description: string;
}

// ---------------------------------------------------------------------------
// ACTION VERDICT
// ---------------------------------------------------------------------------

export type ActionType =
  | 'CLOSE_AS_STRUCTURED'
  | 'CLOSE_WITH_LOWER_LEVERAGE'
  | 'CLOSE_WITH_SELLER_CREDIT'
  | 'CLOSE_WITH_RATE_BUYDOWN'
  | 'CLOSE_AFTER_LEASE_VERIFICATION'
  | 'SWITCH_LENDER_PRODUCT'
  | 'DELAY'
  | 'KILL';

export interface ActionVerdict {
  action: ActionType;
  label: string;
  summary: string;
  requiredFixes: string[];
  alternatives: string[];
  requiredFixMatrix: {
    fix: string;
    impact: string;
    feasibility: 'high' | 'medium' | 'low';
  }[];
}

// ---------------------------------------------------------------------------
// FULL REPORT
// ---------------------------------------------------------------------------

export interface DealSnapshot {
  purchasePrice: number;
  appraisedValue: number;
  loanAmount: number;
  ltv: number;
  rate: number;
  points: number;
  term: string;
  amortization: string;
  interestOnlyPeriod: string;
  prepayPenalty: string;
  estimatedCashToClose: number;
  propertyType: string;
  rentType: string;
  state: string;
  entity: string;
}

export interface DscrReport {
  inputs: DealInputs;
  truthMatrix: TruthMatrix;
  lenderVerdict: LenderVerdict;
  investorVerdict: InvestorVerdict;
  stressScenarios: StressScenario[];
  dataQuality: DataQualityResult;
  scores: FourScores;
  action: ActionVerdict;
  dealSnapshot: DealSnapshot;
  generatedAt: string;
  validation: ValidationResult;
}
