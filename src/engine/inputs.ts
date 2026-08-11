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

  // LTV: prefer explicit ltv, else derive from loanAmount, else default 75%.
  let ltv: number;
  if (typeof req.ltv === 'number' && Number.isFinite(req.ltv) && req.ltv > 0 && req.ltv <= 100) {
    ltv = req.ltv;
  } else if (typeof req.loanAmount === 'number' && Number.isFinite(req.loanAmount) && req.loanAmount >= 0 && req.loanAmount <= MAX_LOAN_AMOUNT && purchasePrice > 0) {
    ltv = (req.loanAmount / purchasePrice) * 100;
    if (ltv <= 0 || ltv > 100) ltv = 75;
  } else {
    ltv = 75;
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
