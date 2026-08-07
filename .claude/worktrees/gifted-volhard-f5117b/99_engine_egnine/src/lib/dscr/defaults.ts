import type { DealInputs } from './types';

// ============================================================================
// Default deal templates — these mirror the spec's example (Lender PASS,
// Investor FAIL = Trap Deal). Users can switch between presets to see how
// the engine responds to different risk profiles.
// ============================================================================

export const DEFAULT_DEAL: DealInputs = {
  // Property
  propertyType: 'SFR',
  rentType: 'LTR',
  state: 'FL',
  county: 'Hillsborough',
  occupancyIntent: 'INVESTMENT',

  // Deal economics — a Trap Deal: lender-qualifies, investor-fails
  purchasePrice: 425000,
  appraisedValue: 430000,
  loanAmount: 318750, // 75% LTV
  rate: 7.875,
  points: 1.5,
  termMonths: 360,
  amortMonths: 360,
  interestOnlyMonths: 0,
  prepayType: 'YSP_3_2_1',

  // Income
  borrowerRentClaim: 3500,
  appraiserRent: 3400,
  leaseRent: 3350,
  otherIncome: 0,
  leaseVerified: true,
  leaseDepositVerified: false,
  strTrailingRevenue: 0,
  strProjection: 0,

  // Expenses (monthly, investor-real)
  propertyTaxes: 525,
  insurance: 360,
  hoa: 0,
  propertyMgmtPct: 8,
  repairsMaintenancePct: 4,
  capexReservePct: 4,
  turnoverPct: 2,
  utilities: 0,
  landscaping: 60,
  accounting: 35,
  licensing: 0,
  legalEvictionReserve: 50,
  emergencyReserve: 75,
  strFurnishingReserve: 0,

  // Borrower
  fico: 724,
  entity: 'LLC',
  experienceProperties: 3,
  bankruptcySeasoningMonths: 84,
  foreclosureSeasoningMonths: 84,
  reservesMonths: 6,
  mortgageHistoryMonths: 36,

  // Market / Risk
  vacancyPct: 7,
  collectionLossPct: 1,
  concessionsPct: 1,
  platformFeesPct: 0,
  seasonalityHaircutPct: 0,
  marketCapRate: 7.5,
  stressCapRate: 9,

  // Documentation
  appraisalDone: true,
  inspectionDone: true,
  insuranceQuotedBindable: false,
  taxReassessmentEstimated: false,
  llcOwnershipVerified: true,
  guarantorLinkageVerified: true,
  strPlatformHistoryPulled: false,
  creditReportPulled: true,
  titleSearchPulled: true,
  bankStatementsPulled: true,

  // Loan
  loanPurpose: 'PURCHASE',
  structure: 'FIXED_30',
};

// Presets to demonstrate each quadrant of the truth matrix
export const PRESETS: {
  id: string;
  name: string;
  description: string;
  inputs: DealInputs;
}[] = [
  {
    id: 'trap',
    name: 'Trap Deal (FL SFR)',
    description: 'Lender approves at 75% LTV but investor fails after real expenses',
    inputs: DEFAULT_DEAL,
  },
  {
    id: 'green',
    name: 'Green Deal (OH Duplex)',
    description: 'Strong cash flow, lender-eligible, real NOI survives stress',
    inputs: {
      ...DEFAULT_DEAL,
      propertyType: 'TWO_UNIT',
      rentType: 'LTR',
      state: 'OH',
      county: 'Franklin',
      purchasePrice: 245000,
      appraisedValue: 250000,
      loanAmount: 171500, // 70% LTV
      rate: 7.0,
      points: 1,
      borrowerRentClaim: 3500,
      appraiserRent: 3400,
      leaseRent: 3400,
      leaseVerified: true,
      leaseDepositVerified: true,
      propertyTaxes: 380,
      insurance: 180,
      hoa: 0,
      propertyMgmtPct: 7,
      repairsMaintenancePct: 4,
      capexReservePct: 4,
      turnoverPct: 2,
      vacancyPct: 5,
      marketCapRate: 8.5,
      stressCapRate: 9.5,
      fico: 748,
      reservesMonths: 9,
      insuranceQuotedBindable: true,
      taxReassessmentEstimated: true,
    },
  },
  {
    id: 'structuring',
    name: 'Structuring Deal (TX SFR)',
    description: 'Investor survives but lender rejects at proposed LTV — lower leverage to close',
    inputs: {
      ...DEFAULT_DEAL,
      propertyType: 'SFR',
      rentType: 'LTR',
      state: 'TX',
      county: 'Travis',
      purchasePrice: 385000,
      appraisedValue: 390000,
      loanAmount: 327250, // 85% LTV — exceeds 80% lender max
      rate: 7.25,
      points: 1.5,
      borrowerRentClaim: 4900,
      appraiserRent: 4800,
      leaseRent: 4800,
      leaseVerified: true,
      leaseDepositVerified: true,
      propertyTaxes: 480,
      insurance: 300,
      hoa: 35,
      propertyMgmtPct: 8,
      repairsMaintenancePct: 4,
      capexReservePct: 4,
      turnoverPct: 2,
      vacancyPct: 6,
      marketCapRate: 8.5,
      stressCapRate: 9.5,
      fico: 712,
      reservesMonths: 6,
      insuranceQuotedBindable: true,
      taxReassessmentEstimated: true,
    },
  },
  {
    id: 'kill',
    name: 'Kill Deal (NV STR)',
    description: 'STR projection abuse — fails both lender and investor under any honest view',
    inputs: {
      ...DEFAULT_DEAL,
      propertyType: 'CONDOTEL',
      rentType: 'STR',
      state: 'NV',
      county: 'Clark',
      purchasePrice: 510000,
      appraisedValue: 515000,
      loanAmount: 382500, // 75% LTV
      rate: 8.5,
      points: 2.5,
      borrowerRentClaim: 6200, // STR projection
      appraiserRent: 4100, // LTR fallback
      leaseRent: 0, // no lease, it's STR
      leaseVerified: false,
      leaseDepositVerified: false,
      strTrailingRevenue: 3800, // actual trailing 12 — much lower than projection
      strProjection: 6200,
      propertyTaxes: 580,
      insurance: 480,
      hoa: 425,
      propertyMgmtPct: 12, // STR management is higher
      repairsMaintenancePct: 5,
      capexReservePct: 5,
      turnoverPct: 5,
      utilities: 180,
      landscaping: 0,
      accounting: 50,
      licensing: 75,
      legalEvictionReserve: 50,
      emergencyReserve: 150,
      strFurnishingReserve: 250,
      vacancyPct: 18, // STR much higher
      collectionLossPct: 2,
      concessionsPct: 3,
      platformFeesPct: 15, // Airbnb/VRBO
      seasonalityHaircutPct: 8,
      marketCapRate: 8,
      stressCapRate: 10,
      fico: 698,
      reservesMonths: 3,
      insuranceQuotedBindable: false,
      taxReassessmentEstimated: false,
      strPlatformHistoryPulled: false,
    },
  },
  {
    id: 'arm',
    name: 'ARM Reset Risk (CA SFR)',
    description: '5/6 ARM with affordable starter payment — exposed at reset year 6',
    inputs: {
      ...DEFAULT_DEAL,
      propertyType: 'SFR',
      rentType: 'LTR',
      state: 'CA',
      county: 'San Bernardino',
      purchasePrice: 465000,
      appraisedValue: 470000,
      loanAmount: 372000, // 80% LTV
      rate: 6.875, // low teaser
      points: 1,
      termMonths: 360,
      amortMonths: 360,
      interestOnlyMonths: 0,
      structure: 'ARM_5_6',
      prepayType: 'YSP_3_2_1',
      borrowerRentClaim: 3600,
      appraiserRent: 3550,
      leaseRent: 3550,
      leaseVerified: true,
      leaseDepositVerified: true,
      propertyTaxes: 480,
      insurance: 220,
      hoa: 45,
      propertyMgmtPct: 8,
      repairsMaintenancePct: 4,
      capexReservePct: 4,
      turnoverPct: 2,
      vacancyPct: 6,
      marketCapRate: 7.5,
      stressCapRate: 9,
      fico: 736,
      reservesMonths: 8,
      insuranceQuotedBindable: true,
      taxReassessmentEstimated: true,
    },
  },
];
