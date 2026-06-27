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

export interface EngineInputs {
  property: PropertyInputs;
  borrower: BorrowerProfile;
  loan: LoanStructure;
  strategy: RentalStrategy;
}

/** Build complete, valid engine inputs from a thin or full request. */
export function buildEngineInputs(req: DealRequest): EngineInputs {
  const purchasePrice = Number(req.purchasePrice);
  const monthlyRent = Number(req.monthlyRent);

  // LTV: prefer explicit ltv, else derive from loanAmount, else default 75%.
  let ltv: number;
  if (typeof req.ltv === 'number') {
    ltv = req.ltv;
  } else if (typeof req.loanAmount === 'number' && purchasePrice > 0) {
    ltv = (req.loanAmount / purchasePrice) * 100;
  } else {
    ltv = 75;
  }

  const stateAbbrev = abbrevState(req.state);
  const strategy: RentalStrategy = req.strategy ?? 'LTR';

  const property: PropertyInputs = {
    purchasePrice,
    leaseRent: monthlyRent,
    marketRent: req.marketRent ?? monthlyRent,
    strProjectedRent: req.strProjectedRent ?? (strategy === 'STR' ? monthlyRent : 0),
    strDocumentedRent: req.strDocumentedRent ?? 0,
    hoa: req.hoa ?? 0,
    annualTaxes: req.annualTaxes ?? Math.round(purchasePrice * 0.012),
    annualInsurance: req.annualInsurance ?? Math.round(purchasePrice * 0.005),
    floodInsurance: req.floodInsurance ?? 0,
    propertyType: req.propertyType ?? 'SFR',
    state: stateAbbrev,
    unitCount: req.unitCount ?? 1,
    sqft: req.sqft ?? 1500,
    yearBuilt: req.yearBuilt ?? 2000,
    isCondotel: req.isCondotel ?? false,
    isNonWarrantable: req.isNonWarrantable ?? false,
    isRural: req.isRural ?? false,
    isDecliningMarket: DECLINING_MARKET_STATES.has(stateAbbrev),
    hoaSTRPolicy: req.hoaSTRPolicy ?? 'UNKNOWN',
  };

  const borrower: BorrowerProfile = {
    ficoScore: req.ficoScore ?? 740,
    experience: req.experience ?? 'EXPERIENCED',
    existingFinancedProperties: req.existingFinancedProperties ?? 1,
    entityType: req.entityType ?? 'LLC',
    isUSCitizenOrPR: req.isUSCitizenOrPR ?? !(req.isNonUsInvestor ?? false),
    availableReserves: req.availableReserves ?? 0,
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
    expectedHoldYears: req.expectedHoldYears ?? 5,
    points: req.points ?? 0,
    lenderFees: req.lenderFees ?? 0,
    brokerFees: req.brokerFees ?? 0,
    rateLockCost: req.rateLockCost ?? 0,
  };

  return { property, borrower, loan, strategy };
}
