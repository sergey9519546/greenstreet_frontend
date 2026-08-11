// ============================================================
// Request → engine input mapping.
// The frontend can send a thin "quick" payload (a handful of fields)
// or a "full" payload. Either way we build complete, valid
// PropertyInputs / BorrowerProfile / LoanStructure / RentalStrategy
// objects here, applying conservative defaults for anything omitted.
// ============================================================

import type {
  PropertyInputs,
  PropertyType,
  BorrowerProfile,
  EntityType,
  InvestorExperience,
  LoanStructure,
  LoanTerm,
  IOPeriod,
  ARMType,
  PrepayType,
  LoanPurpose,
  RentalStrategy,
} from './types';

// Explicit ceilings keep browser-valid scientific notation and oversized API
// payloads from entering financial math. These are safety boundaries, not
// pricing assumptions.
export const MAX_PURCHASE_PRICE = 100_000_000;
export const MAX_LOAN_AMOUNT = 100_000_000;
export const MAX_MONTHLY_RENT = 500_000;
export const MAX_ANNUAL_PROPERTY_EXPENSE = 10_000_000;
export const MAX_MONTHLY_PROPERTY_EXPENSE = 1_000_000;
export const MAX_CURRENCY_INPUT = 100_000_000;
// Below this existing manual-review boundary, the model must not make an
// automatic qualification conclusion. This is a numerical/model-domain guard,
// not a universal lender program minimum.
export const MODEL_AUTO_DECISION_FLOOR = 50_000;
// One basis point is the smallest rate the payment model treats as meaningfully
// distinct from zero; lower values require review rather than 0%-like math.
export const MIN_MODELED_RATE_PCT = 0.01;

/** Thin, forgiving request shape accepted by the API. All fields optional except the few the UI always sends. */
export interface DealRequest {
  // --- core (always sent by Quick mode) ---
  purchasePrice: number;
  loanAmount?: number;        // if given, derives ltv
  ltv?: number;               // alternative to loanAmount
  monthlyRent: number;        // gross / lease rent
  state: string;

  // --- property ---
  propertyType?: PropertyType;
  marketRent?: number;        // 1007/1025 appraiser rent; defaults to monthlyRent
  annualTaxes?: number;       // if omitted, estimated at 1.2% of price
  annualInsurance?: number;   // if omitted, estimated at 0.5% of price
  hoa?: number;               // monthly
  floodInsurance?: number;    // monthly
  unitCount?: number;
  sqft?: number;
  yearBuilt?: number;
  strProjectedRent?: number;
  strDocumentedRent?: number;
  isCondotel?: boolean;
  isNonWarrantable?: boolean;
  isRural?: boolean;
  hoaSTRPolicy?: PropertyInputs['hoaSTRPolicy'];

  // --- borrower ---
  ficoScore?: number;
  entityType?: EntityType;
  experience?: InvestorExperience;
  existingFinancedProperties?: number;
  availableReserves?: number;
  isNonUsInvestor?: boolean;
  isUSCitizenOrPR?: boolean;
  isFirstResponder?: boolean;

  // --- loan ---
  term?: LoanTerm;
  ioPeriod?: IOPeriod;
  armType?: ARMType;
  prepayPreference?: PrepayType;
  loanPurpose?: LoanPurpose;
  expectedHoldYears?: number;
  points?: number;
  lenderFees?: number;
  brokerFees?: number;
  rateLockCost?: number;

  // --- strategy ---
  strategy?: RentalStrategy;
}

const DECLINING_MARKET_STATES = new Set(['CT', 'FL', 'IL', 'NJ', 'NY']);

function abbrevState(state: string): string {
  return (state || '').trim().toUpperCase().slice(0, 2);
}

function nonNegative(value: unknown, fallback = 0, max = Number.MAX_SAFE_INTEGER): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= max ? parsed : fallback;
}

function positive(value: unknown, fallback: number, max = Number.MAX_SAFE_INTEGER): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= max ? parsed : fallback;
}

function isExplicitlyProvided(req: DealRequest, field: keyof DealRequest): boolean {
  return Object.prototype.hasOwnProperty.call(req, field) && req[field] !== undefined;
}

function isFiniteWithin(value: unknown, min: number, max: number): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function addIssue(issues: string[], field: string): void {
  if (!issues.includes(field)) issues.push(field);
}

function collectExplicitNumericIssues(req: DealRequest): string[] {
  const issues: string[] = [];
  const validate = (field: keyof DealRequest, min: number, max: number) => {
    if (isExplicitlyProvided(req, field) && !isFiniteWithin(req[field], min, max)) {
      addIssue(issues, field);
    }
  };

  validate('purchasePrice', MODEL_AUTO_DECISION_FLOOR, MAX_PURCHASE_PRICE);
  validate('loanAmount', MODEL_AUTO_DECISION_FLOOR, MAX_LOAN_AMOUNT);
  validate('ltv', Number.MIN_VALUE, 100);
  validate('monthlyRent', 0, MAX_MONTHLY_RENT);
  validate('marketRent', 0, MAX_MONTHLY_RENT);
  validate('strProjectedRent', 0, MAX_MONTHLY_RENT);
  validate('strDocumentedRent', 0, MAX_MONTHLY_RENT);
  validate('annualTaxes', 0, MAX_ANNUAL_PROPERTY_EXPENSE);
  validate('annualInsurance', 0, MAX_ANNUAL_PROPERTY_EXPENSE);
  validate('hoa', 0, MAX_MONTHLY_PROPERTY_EXPENSE);
  validate('floodInsurance', 0, MAX_MONTHLY_PROPERTY_EXPENSE);
  validate('unitCount', 1, Number.MAX_SAFE_INTEGER);
  validate('sqft', Number.MIN_VALUE, Number.MAX_SAFE_INTEGER);
  validate('yearBuilt', Number.MIN_VALUE, Number.MAX_SAFE_INTEGER);
  validate('ficoScore', 300, 850);
  validate('existingFinancedProperties', 0, Number.MAX_SAFE_INTEGER);
  validate('availableReserves', 0, MAX_CURRENCY_INPUT);
  validate('expectedHoldYears', Number.MIN_VALUE, Number.MAX_SAFE_INTEGER);
  validate('points', 0, 100);
  validate('lenderFees', 0, MAX_CURRENCY_INPUT);
  validate('brokerFees', 0, MAX_CURRENCY_INPUT);
  validate('rateLockCost', 0, MAX_CURRENCY_INPUT);

  return issues;
}

export interface EngineInputs {
  property: PropertyInputs;
  borrower: BorrowerProfile;
  loan: LoanStructure;
  strategy: RentalStrategy;
}

/** Build complete, valid engine inputs from a thin or full request. */
export function buildEngineInputs(req: DealRequest): EngineInputs {
  const purchasePrice = nonNegative(req.purchasePrice, 0, MAX_PURCHASE_PRICE);
  const monthlyRent = nonNegative(req.monthlyRent, 0, MAX_MONTHLY_RENT);
  const inputValidationIssues = collectExplicitNumericIssues(req);

  // LTV: prefer an explicit valid LTV, else derive from an explicit valid loan
  // amount, else default only when both optional fields were omitted.
  const hasExplicitLtv = isExplicitlyProvided(req, 'ltv');
  const hasExplicitLoanAmount = isExplicitlyProvided(req, 'loanAmount');
  const hasValidLtv = isFiniteWithin(req.ltv, Number.MIN_VALUE, 100);
  const hasValidLoanAmount = isFiniteWithin(req.loanAmount, MODEL_AUTO_DECISION_FLOOR, MAX_LOAN_AMOUNT);
  let ltv = 75;
  if (hasExplicitLtv) {
    if (hasValidLtv) {
      ltv = req.ltv as number;
    } else {
      ltv = 0;
    }
  } else if (hasExplicitLoanAmount) {
    if (hasValidLoanAmount && purchasePrice > 0) {
      const derivedLtv = (req.loanAmount as number / purchasePrice) * 100;
      if (isFiniteWithin(derivedLtv, Number.MIN_VALUE, 100)) {
        ltv = derivedLtv;
      } else {
        ltv = 0;
        addIssue(inputValidationIssues, 'loanAmount');
      }
    } else {
      ltv = 0;
    }
  }

  const modeledLoanAmount = purchasePrice * (ltv / 100);
  if (hasExplicitLtv && (!Number.isFinite(modeledLoanAmount) || modeledLoanAmount < MODEL_AUTO_DECISION_FLOOR)) {
    addIssue(inputValidationIssues, 'ltv');
  }

  const stateAbbrev = abbrevState(req.state);
  const strategy: RentalStrategy = req.strategy ?? 'LTR';

  const property: PropertyInputs = {
    purchasePrice,
    leaseRent: monthlyRent,
    marketRent: nonNegative(req.marketRent, monthlyRent, MAX_MONTHLY_RENT),
    strProjectedRent: nonNegative(req.strProjectedRent, strategy === 'STR' ? monthlyRent : 0, MAX_MONTHLY_RENT),
    strDocumentedRent: nonNegative(req.strDocumentedRent, 0, MAX_MONTHLY_RENT),
    hoa: nonNegative(req.hoa, 0, MAX_MONTHLY_PROPERTY_EXPENSE),
    annualTaxes: nonNegative(req.annualTaxes, Math.round(purchasePrice * 0.012), MAX_ANNUAL_PROPERTY_EXPENSE),
    annualInsurance: nonNegative(req.annualInsurance, Math.round(purchasePrice * 0.005), MAX_ANNUAL_PROPERTY_EXPENSE),
    floodInsurance: nonNegative(req.floodInsurance, 0, MAX_MONTHLY_PROPERTY_EXPENSE),
    propertyType: req.propertyType ?? 'SFR',
    state: stateAbbrev,
    unitCount: Math.max(1, Math.round(positive(req.unitCount, 1))),
    sqft: positive(req.sqft, 1500),
    yearBuilt: Math.round(positive(req.yearBuilt, 2000)),
    isCondotel: req.isCondotel ?? false,
    isNonWarrantable: req.isNonWarrantable ?? false,
    isRural: req.isRural ?? false,
    isDecliningMarket: DECLINING_MARKET_STATES.has(stateAbbrev),
    hoaSTRPolicy: req.hoaSTRPolicy ?? 'UNKNOWN',
    ...(inputValidationIssues.length > 0 ? { inputValidationIssues } : {}),
  };

  const borrower: BorrowerProfile = {
    ficoScore: Math.min(850, Math.max(300, positive(req.ficoScore, 740))),
    experience: req.experience ?? 'EXPERIENCED',
    existingFinancedProperties: Math.round(nonNegative(req.existingFinancedProperties, 1)),
    entityType: req.entityType ?? 'LLC',
    isUSCitizenOrPR: req.isUSCitizenOrPR ?? !(req.isNonUsInvestor ?? false),
    availableReserves: nonNegative(req.availableReserves, 0, MAX_CURRENCY_INPUT),
    reserveAssets: [],
    isFirstResponder: req.isFirstResponder ?? false,
    isNonUsInvestor: req.isNonUsInvestor ?? false,
  };

  const loan: LoanStructure = {
    ltv,
    term: req.term ?? '30_YR',
    ioPeriod: req.ioPeriod ?? 'NONE',
    armType: req.armType ?? 'FIXED',
    prepayPreference: req.prepayPreference ?? 'NONE',
    purpose: req.loanPurpose ?? 'PURCHASE',
    expectedHoldYears: positive(req.expectedHoldYears, 5),
    points: nonNegative(req.points, 0, 100),
    lenderFees: nonNegative(req.lenderFees, 0, MAX_CURRENCY_INPUT),
    brokerFees: nonNegative(req.brokerFees, 0, MAX_CURRENCY_INPUT),
    rateLockCost: nonNegative(req.rateLockCost, 0, MAX_CURRENCY_INPUT),
  };

  return { property, borrower, loan, strategy };
}
