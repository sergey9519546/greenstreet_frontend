export interface LenderProfile {
  id: string;
  name: string;
  tier: 1 | 2 | 3 | 4;
  minDSCR: number; // standard minimum DSCR
  subMinDSCR?: number; // minimum DSCR with reserves or exceptions
  noRatioAvailable: boolean;
  minFICO: number;
  minReservesMonths: number; // 0 if no minimum
  maxLTV: {
    purchase: number;
    rateTerm: number;
    cashOut: number;
  };
  stateExclusions: string[];
  notes: string;
}

export const LENDER_MATRIX: LenderProfile[] = [
  {
    id: "pennymac",
    name: "Pennymac DSCR",
    tier: 1,
    minDSCR: 1.0,
    subMinDSCR: 0.75,
    noRatioAvailable: true,
    minFICO: 620,
    minReservesMonths: 3, // 3mo if <=$500k, 6mo if $500k-$2M
    maxLTV: { purchase: 80, rateTerm: 80, cashOut: 75 },
    stateExclusions: ["CT", "FL", "IL", "NJ", "NY"], // 25% down required there
    notes:
      "Requires 25% min down in exclusion states. $500k cash-out cap if LTV > 60%.",
  },
  {
    id: "kiavi",
    name: "Kiavi",
    tier: 1,
    minDSCR: 0.8,
    noRatioAvailable: false,
    minFICO: 660,
    minReservesMonths: 0, // No minimum liquidity required
    maxLTV: { purchase: 85, rateTerm: 80, cashOut: 75 }, // 85% LTV with FICO 700+
    stateExclusions: [],
    notes:
      "No minimum liquidity required. Max LTV 85% with FICO 700+. $75K-$3M loan range. No cap on total rental portfolio loans.",
  },
  {
    id: "visio",
    name: "Visio Lending",
    tier: 2,
    minDSCR: 1.0,
    noRatioAvailable: false,
    minFICO: 680,
    minReservesMonths: 6,
    maxLTV: { purchase: 80, rateTerm: 75, cashOut: 75 },
    stateExclusions: [],
    notes:
      "Entity vesting required in GA, HI, IL, MA, NJ, NY, PA, VA. Prepayment penalty cannot be charged in NM, KS, OH, MD, PA, RI.",
  },
  {
    id: "griffin",
    name: "Griffin Funding",
    tier: 2,
    minDSCR: 0.75,
    noRatioAvailable: true,
    minFICO: 620,
    minReservesMonths: 6,
    maxLTV: { purchase: 80, rateTerm: 80, cashOut: 75 },
    stateExclusions: [],
    notes:
      "No seasoning required for cash-out refi. No-ratio option caps LTV at 75%.",
  },
  {
    id: "acra",
    name: "Acra Lending",
    tier: 2,
    minDSCR: 1.0,
    subMinDSCR: 0.75,
    noRatioAvailable: true,
    minFICO: 620,
    minReservesMonths: 6,
    maxLTV: { purchase: 80, rateTerm: 80, cashOut: 75 },
    stateExclusions: [],
    notes:
      "Aggressive portfolio pricing options. Reserves tier scales from 6 to 12 months based on profile.",
  },
  {
    id: "ocmbc",
    name: "OCMBC",
    tier: 2,
    minDSCR: 1.0,
    subMinDSCR: 0.75,
    noRatioAvailable: true,
    minFICO: 620,
    minReservesMonths: 6,
    maxLTV: { purchase: 80, rateTerm: 80, cashOut: 75 },
    stateExclusions: [],
    notes: "Strong volume discounts. Fits diverse entity structures.",
  },
  {
    id: "crosscountry",
    name: "CrossCountry Mortgage",
    tier: 2,
    minDSCR: 1.0,
    subMinDSCR: 0.75,
    noRatioAvailable: true,
    minFICO: 620,
    minReservesMonths: 6,
    maxLTV: { purchase: 80, rateTerm: 80, cashOut: 75 },
    stateExclusions: [],
    notes: "ITIN-only options (no Foreign National support).",
  },
  {
    id: "admortgage",
    name: "A&D Mortgage",
    tier: 2,
    minDSCR: 1.0,
    subMinDSCR: 0.75,
    noRatioAvailable: true,
    minFICO: 620,
    minReservesMonths: 6,
    maxLTV: { purchase: 80, rateTerm: 80, cashOut: 75 },
    stateExclusions: [],
    notes: "Extensive state footprint. Fast turnaround times.",
  },
  {
    id: "newfi",
    name: "Newfi Wholesale",
    tier: 2,
    minDSCR: 1.0,
    subMinDSCR: 0.75,
    noRatioAvailable: true,
    minFICO: 660,
    minReservesMonths: 6,
    maxLTV: { purchase: 80, rateTerm: 80, cashOut: 75 },
    stateExclusions: [],
    notes: "120% Form 1007 rent allowed for vacant units.",
  },
  {
    id: "angeloak",
    name: "Angel Oak Mortgage Solutions",
    tier: 1,
    minDSCR: 0.0, // No minimum (no-ratio available)
    noRatioAvailable: true,
    minFICO: 640,
    minReservesMonths: 6,
    maxLTV: { purchase: 90, rateTerm: 80, cashOut: 75 }, // 90% LTV at 740+ FICO
    stateExclusions: [],
    notes:
      "No minimum DSCR (no-ratio available). Max LTV 90% at 740+ FICO. Supports AirDNA STR. Utilizes Clear Capital Rental AVM.",
  },
  {
    id: "defy",
    name: "Defy Mortgage",
    tier: 2,
    minDSCR: 1.0,
    subMinDSCR: 0.75,
    noRatioAvailable: true,
    minFICO: 640,
    minReservesMonths: 6,
    maxLTV: { purchase: 85, rateTerm: 85, cashOut: 75 }, // 85% LTV with FICO 740
    stateExclusions: [],
    notes: "Excellent execution on mid-tier credit profiles.",
  },
  {
    id: "easystreet",
    name: "Easy Street Capital",
    tier: 2,
    minDSCR: 0.8, // Purchase
    noRatioAvailable: true, // No minimum for cash-outs
    minFICO: 620, // 640 for cash-out
    minReservesMonths: 3, // 3-6mo
    maxLTV: { purchase: 80, rateTerm: 80, cashOut: 75 }, // 70% LTV if 3-6mo seasoned
    stateExclusions: [],
    notes:
      "STR specialist using AirDNA. 5/4/3/2/1 prepayment penalties. No minimum DSCR for cash-out refinances.",
  },
  {
    id: "limaone",
    name: "Lima One Capital",
    tier: 1,
    minDSCR: 1.3, // Strictest tier
    noRatioAvailable: false,
    minFICO: 700,
    minReservesMonths: 6,
    maxLTV: { purchase: 80, rateTerm: 80, cashOut: 75 },
    stateExclusions: [],
    notes:
      "Strictest underwriting tier (1.30 DSCR / 700 FICO min). $85K-$2.5M. Exceptional pricing on 7-year PPP products.",
  },
  {
    id: "newsilver",
    name: "New Silver",
    tier: 3,
    minDSCR: 1.0,
    subMinDSCR: 0.75,
    noRatioAvailable: true,
    minFICO: 660,
    minReservesMonths: 6,
    maxLTV: { purchase: 80, rateTerm: 80, cashOut: 75 },
    stateExclusions: [],
    notes: "Technology-focused lending platform.",
  },
  {
    id: "americanheritage",
    name: "American Heritage",
    tier: 3,
    minDSCR: 1.0,
    subMinDSCR: 0.75,
    noRatioAvailable: false,
    minFICO: 660, // 760 for 85% LTV
    minReservesMonths: 6, // 12mo if sub-1.0
    maxLTV: { purchase: 85, rateTerm: 85, cashOut: 75 },
    stateExclusions: [],
    notes: "Requires 12mo reserves if DSCR is below 1.00.",
  },
  {
    id: "lendsure",
    name: "LendSure Mortgage",
    tier: 2,
    minDSCR: 0.75, // no-ratio caps
    noRatioAvailable: true,
    minFICO: 640,
    minReservesMonths: 0, // No reserves required if LTV < 65%
    maxLTV: { purchase: 80, rateTerm: 80, cashOut: 75 },
    stateExclusions: [],
    notes:
      "Offers 10/40 Interest-Only product (10-year interest-only period + 30-year amortization).",
  },
  {
    id: "ridgestreet",
    name: "Ridge Street Capital",
    tier: 2,
    minDSCR: 1.0, // 1.0 LTR / 1.0 STR (80% AirDNA) / 1.15 for 5-10 units
    noRatioAvailable: false,
    minFICO: 660, // 700 for STR / 700 first-time investors
    minReservesMonths: 6,
    maxLTV: { purchase: 80, rateTerm: 75, cashOut: 70 }, // LTV 80% for 1-4 unit, 75% for 5-10 unit
    stateExclusions: [],
    notes:
      "$55K-$2.5M range. Portfolio DSCR loans available (min $250K total). 80% AirDNA haircut for STR qualification.",
  },
];

// FICO × DSCR Heat Map Approval Ratios (17 lenders)
export interface HeatMapCell {
  dscrRange: string;
  approvedCount: number;
  totalCount: number;
  percentage: number;
}

export const FICO_DSCR_HEATMAP: { [ficoBand: string]: HeatMapCell[] } = {
  "580-599": [
    { dscrRange: "0.75-0.99", approvedCount: 0, totalCount: 17, percentage: 0 },
    { dscrRange: "1.00-1.19", approvedCount: 0, totalCount: 17, percentage: 0 },
    { dscrRange: "1.20-1.49", approvedCount: 0, totalCount: 17, percentage: 0 },
    { dscrRange: "1.50-1.99", approvedCount: 0, totalCount: 17, percentage: 0 },
    { dscrRange: "2.00+", approvedCount: 0, totalCount: 17, percentage: 0 },
  ],
  "600-619": [
    { dscrRange: "0.75-0.99", approvedCount: 0, totalCount: 17, percentage: 0 },
    { dscrRange: "1.00-1.19", approvedCount: 0, totalCount: 17, percentage: 0 },
    { dscrRange: "1.20-1.49", approvedCount: 0, totalCount: 17, percentage: 0 },
    { dscrRange: "1.50-1.99", approvedCount: 0, totalCount: 17, percentage: 0 },
    { dscrRange: "2.00+", approvedCount: 0, totalCount: 17, percentage: 0 },
  ],
  "620-639": [
    {
      dscrRange: "0.75-0.99",
      approvedCount: 4,
      totalCount: 17,
      percentage: 24,
    },
    {
      dscrRange: "1.00-1.19",
      approvedCount: 4,
      totalCount: 17,
      percentage: 24,
    },
    {
      dscrRange: "1.20-1.49",
      approvedCount: 4,
      totalCount: 17,
      percentage: 24,
    },
    {
      dscrRange: "1.50-1.99",
      approvedCount: 4,
      totalCount: 17,
      percentage: 24,
    },
    { dscrRange: "2.00+", approvedCount: 4, totalCount: 17, percentage: 24 },
  ],
  "640-659": [
    {
      dscrRange: "0.75-0.99",
      approvedCount: 7,
      totalCount: 17,
      percentage: 41,
    },
    {
      dscrRange: "1.00-1.19",
      approvedCount: 7,
      totalCount: 17,
      percentage: 41,
    },
    {
      dscrRange: "1.20-1.49",
      approvedCount: 7,
      totalCount: 17,
      percentage: 41,
    },
    {
      dscrRange: "1.50-1.99",
      approvedCount: 7,
      totalCount: 17,
      percentage: 41,
    },
    { dscrRange: "2.00+", approvedCount: 7, totalCount: 17, percentage: 41 },
  ],
  "660-679": [
    {
      dscrRange: "0.75-0.99",
      approvedCount: 11,
      totalCount: 17,
      percentage: 65,
    },
    {
      dscrRange: "1.00-1.19",
      approvedCount: 12,
      totalCount: 17,
      percentage: 71,
    },
    {
      dscrRange: "1.20-1.49",
      approvedCount: 12,
      totalCount: 17,
      percentage: 71,
    },
    {
      dscrRange: "1.50-1.99",
      approvedCount: 12,
      totalCount: 17,
      percentage: 71,
    },
    { dscrRange: "2.00+", approvedCount: 12, totalCount: 17, percentage: 71 },
  ],
  "680-699": [
    {
      dscrRange: "0.75-0.99",
      approvedCount: 12,
      totalCount: 17,
      percentage: 71,
    },
    {
      dscrRange: "1.00-1.19",
      approvedCount: 13,
      totalCount: 17,
      percentage: 76,
    },
    {
      dscrRange: "1.20-1.49",
      approvedCount: 13,
      totalCount: 17,
      percentage: 76,
    },
    {
      dscrRange: "1.50-1.99",
      approvedCount: 13,
      totalCount: 17,
      percentage: 76,
    },
    { dscrRange: "2.00+", approvedCount: 13, totalCount: 17, percentage: 76 },
  ],
  "700-719": [
    {
      dscrRange: "0.75-0.99",
      approvedCount: 13,
      totalCount: 17,
      percentage: 76,
    },
    {
      dscrRange: "1.00-1.19",
      approvedCount: 14,
      totalCount: 17,
      percentage: 82,
    },
    {
      dscrRange: "1.20-1.49",
      approvedCount: 14,
      totalCount: 17,
      percentage: 82,
    },
    {
      dscrRange: "1.50-1.99",
      approvedCount: 14,
      totalCount: 17,
      percentage: 82,
    },
    { dscrRange: "2.00+", approvedCount: 14, totalCount: 17, percentage: 82 },
  ],
  "720-739": [
    {
      dscrRange: "0.75-0.99",
      approvedCount: 13,
      totalCount: 17,
      percentage: 76,
    },
    {
      dscrRange: "1.00-1.19",
      approvedCount: 14,
      totalCount: 17,
      percentage: 82,
    },
    {
      dscrRange: "1.20-1.49",
      approvedCount: 14,
      totalCount: 17,
      percentage: 82,
    },
    {
      dscrRange: "1.50-1.99",
      approvedCount: 14,
      totalCount: 17,
      percentage: 82,
    },
    { dscrRange: "2.00+", approvedCount: 14, totalCount: 17, percentage: 82 },
  ],
  "740-759": [
    {
      dscrRange: "0.75-0.99",
      approvedCount: 14,
      totalCount: 17,
      percentage: 82,
    },
    {
      dscrRange: "1.00-1.19",
      approvedCount: 15,
      totalCount: 17,
      percentage: 88,
    },
    {
      dscrRange: "1.20-1.49",
      approvedCount: 15,
      totalCount: 17,
      percentage: 88,
    },
    {
      dscrRange: "1.50-1.99",
      approvedCount: 15,
      totalCount: 17,
      percentage: 88,
    },
    { dscrRange: "2.00+", approvedCount: 15, totalCount: 17, percentage: 88 },
  ],
  "760+": [
    {
      dscrRange: "0.75-0.99",
      approvedCount: 14,
      totalCount: 17,
      percentage: 82,
    },
    {
      dscrRange: "1.00-1.19",
      approvedCount: 15,
      totalCount: 17,
      percentage: 88,
    },
    {
      dscrRange: "1.20-1.49",
      approvedCount: 15,
      totalCount: 17,
      percentage: 88,
    },
    {
      dscrRange: "1.50-1.99",
      approvedCount: 15,
      totalCount: 17,
      percentage: 88,
    },
    { dscrRange: "2.00+", approvedCount: 15, totalCount: 17, percentage: 88 },
  ],
};

// Reserves Multiplier for FICO band 660-679, showing approved % base on months of reserve
export interface ReserveCell {
  months: string;
  approvedHighDSCR: number; // DSCR >= 1.25
  approvedMidDSCR: number; // DSCR 1.00-1.24
  approvedLowDSCR: number; // DSCR 0.75-0.99
}

export const RESERVES_MULTIPLIER: ReserveCell[] = [
  {
    months: "<2 mo",
    approvedHighDSCR: 0,
    approvedMidDSCR: 0,
    approvedLowDSCR: 0,
  },
  {
    months: "2-3 mo",
    approvedHighDSCR: 24,
    approvedMidDSCR: 0,
    approvedLowDSCR: 0,
  },
  {
    months: "3-6 mo",
    approvedHighDSCR: 71,
    approvedMidDSCR: 24,
    approvedLowDSCR: 0,
  },
  {
    months: "6-12 mo",
    approvedHighDSCR: 71,
    approvedMidDSCR: 71,
    approvedLowDSCR: 24,
  },
  {
    months: "12-24 mo",
    approvedHighDSCR: 71,
    approvedMidDSCR: 71,
    approvedLowDSCR: 65,
  },
];

// Prepayment Penalty (PPP) thresholds and state legalities
export interface StatePppRule {
  state: string;
  isAllowed: boolean;
  notes: string;
  threshold?: number; // 2026 indexed thresholds
  ambiguityFlag?: boolean;
}

export const STATE_PPP_RULES: { [stateCode: string]: StatePppRule } = {
  OH: {
    state: "Ohio",
    isAllowed: true,
    threshold: 116356,
    notes:
      "Ohio prepayment penalties are prohibited for loans under $116,356 (2026 threshold).",
  },
  PA: {
    state: "Pennsylvania",
    isAllowed: true,
    threshold: 319777,
    notes:
      "Pennsylvania prepayment penalties are prohibited for loans under $319,777 (2026 threshold) on 1-2 unit residential properties.",
  },
  MN: {
    state: "Minnesota",
    isAllowed: true,
    notes:
      "Under HF 3437 (effective Aug 1, 2026), business-purpose DSCR loans are fully exempt from prepay restrictions.",
  },
  NJ: {
    state: "New Jersey",
    isAllowed: true,
    ambiguityFlag: true,
    notes:
      "NJ has LLC prepayment penalty validity ambiguities; enforcement is highly lender-dependent.",
  },
  NM: {
    state: "New Mexico",
    isAllowed: false,
    notes: "Prepayment penalties generally prohibited.",
  },
  KS: {
    state: "Kansas",
    isAllowed: false,
    notes: "Prepayment penalties generally prohibited.",
  },
  MD: {
    state: "Maryland",
    isAllowed: false,
    notes: "Prepayment penalties generally prohibited.",
  },
  RI: {
    state: "Rhode Island",
    isAllowed: false,
    notes: "Prepayment penalties generally prohibited.",
  },
  TX: {
    state: "Texas",
    isAllowed: true,
    notes: "Prepayment penalties fully allowed for business-purpose loans.",
  },
  FL: {
    state: "Florida",
    isAllowed: true,
    notes: "Prepayment penalties fully allowed for business-purpose loans.",
  },
  CA: {
    state: "California",
    isAllowed: true,
    notes:
      "Prepayment penalties allowed on business-purpose loans, subject to LTV caps in state rules (e.g. max 75% LTV for some lenders).",
  },
};

// STR Zoning rules
export interface StrZoningRule {
  city: string;
  status: "prohibited" | "restricted" | "permitted";
  notes: string;
}

export const MUNICIPAL_STR_RULES: { [cityName: string]: StrZoningRule } = {
  "New York City": {
    city: "New York City",
    status: "prohibited",
    notes:
      "NYC Local Law 18 enforces strict registration requirements. Short-term renting of entire apartments is completely prohibited.",
  },
  "Los Angeles": {
    city: "Los Angeles",
    status: "restricted",
    notes:
      "LA Home-Sharing ordinance requires primary residence registration. Investor-owned STRs are prohibited.",
  },
  "Miami Beach": {
    city: "Miami Beach",
    status: "restricted",
    notes:
      "Only permitted in specific zoning districts. Fines range from $20,000 to $100,000 for violations.",
  },
  "Hawaii (Maui/Oahu)": {
    city: "Hawaii (Maui/Oahu)",
    status: "restricted",
    notes:
      "Ongoing phase-outs of transient vacation rentals (TVRs). High compliance risk.",
  },
  Orlando: {
    city: "Orlando",
    status: "permitted",
    notes:
      "Allowed with registration and home-sharing permits; commercial operations in non-residential zones are prohibited.",
  },
  Nashville: {
    city: "Nashville",
    status: "restricted",
    notes:
      "Non-owner-occupied permits are restricted in residential zones; permitted in commercial/mixed-use zones.",
  },
};
