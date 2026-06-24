// Greenstreet DSCR program lineup — real underwriting parameters.
//
// Source: live DSCR eligibility matrices from Greenstreet's capital partner
// (caketpo.com/products, DSCR tab), pulled 2026-06-24.
// Partner name is NEVER surfaced to customers — Greenstreet underwrites
// and funds these in-house.
//
// Two data layers per program:
//   Headline  — minFICO / maxLTV / maxLoan used by LenderIntelPage card filters
//   grid      — full FICO × loan-amount LTV table for Deal Analyzer / Rate Quiz

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LtvRow = {
  ficoMin: number;
  loanMax: number;
  purchase: number;
  rateTerm: number | null;  // null = ineligible for this tx type
  cashOut: number | null;
};

export type DscrTierGrid = {
  label: string;
  dscrMin: number | null;   // null = no-ratio tier (no DSCR required)
  dscrMax: number | null;   // null = open-ended (≥ dscrMin, no cap)
  rows: LtvRow[];           // highest ficoMin first, lowest loanMax first within FICO
};

export type DscrProgram = {
  id: string;
  name: string;
  tagline: string;
  minFICO: number;
  dscrFloor: number;        // 0 = no-ratio / sub-0.75 eligible
  noRatio: boolean;
  maxLTV: number;           // headline best-case purchase LTV
  maxLoan: number;
  isSTR: boolean;
  multiFamily: boolean;     // 5+ units eligible
  foreignNational: boolean;
  reserves: string;
  features: string[];
  grid: DscrTierGrid[];
};

// ---------------------------------------------------------------------------
// Lookup helper — max LTV % for a specific deal, null = ineligible
// ---------------------------------------------------------------------------
export function lookupMaxLTV(
  program: DscrProgram,
  fico: number,
  loanAmt: number,
  dscr: number | null,                           // null = no-ratio
  txType: "purchase" | "rateTerm" | "cashOut"
): number | null {
  const tier = program.grid.find((t) => {
    if (dscr === null) return t.dscrMin === null;
    if (t.dscrMin === null) return false;
    return dscr >= t.dscrMin && (t.dscrMax === null || dscr <= t.dscrMax);
  });
  if (!tier) return null;
  const row = tier.rows.find((r) => fico >= r.ficoMin && loanAmt <= r.loanMax);
  if (!row) return null;
  if (txType === "purchase") return row.purchase;
  if (txType === "rateTerm") return row.rateTerm;
  return row.cashOut;
}

// ---------------------------------------------------------------------------
// Programs
// ---------------------------------------------------------------------------

export const DSCR_PROGRAMS: DscrProgram[] = [

  // =========================================================================
  // MAPLE  ←  _src: Cup Cake DSCR (eff. 3/9/2026)
  // Max-leverage: 85% purchase, ITIN, no-ratio, 2-4 unit, non-warr condo
  // =========================================================================
  {
    id: "maple",
    name: "Greenstreet Maple",
    tagline: "Maximum leverage — up to 85% LTV",
    minFICO: 620, dscrFloor: 0.75, noRatio: true, maxLTV: 85, maxLoan: 3_000_000,
    isSTR: true, multiFamily: false, foreignNational: true,
    reserves: "FICO < 620: 12 mo · otherwise per loan size",
    features: ["85% LTV at 720 FICO", "ITIN tiers", "No-ratio option", "2-4 unit to 80%", "Non-warrantable condo"],
    grid: [
      {
        label: "≥ 0.75",
        dscrMin: 0.75, dscrMax: null,
        rows: [
          // ≤ $1,500,000
          { ficoMin: 720, loanMax: 1_500_000, purchase: 85, rateTerm: 80, cashOut: 75 },
          { ficoMin: 700, loanMax: 1_500_000, purchase: 80, rateTerm: 75, cashOut: 75 },
          { ficoMin: 680, loanMax: 1_500_000, purchase: 80, rateTerm: 75, cashOut: 75 },
          { ficoMin: 660, loanMax: 1_500_000, purchase: 80, rateTerm: 75, cashOut: 75 },
          { ficoMin: 640, loanMax: 1_500_000, purchase: 75, rateTerm: 70, cashOut: 70 },
          { ficoMin: 620, loanMax: 1_500_000, purchase: 65, rateTerm: 65, cashOut: 65 },
          // $1,500,001 – $2,000,000
          { ficoMin: 720, loanMax: 2_000_000, purchase: 75, rateTerm: 75, cashOut: 75 },
          { ficoMin: 700, loanMax: 2_000_000, purchase: 75, rateTerm: 70, cashOut: 70 },
          { ficoMin: 680, loanMax: 2_000_000, purchase: 75, rateTerm: 70, cashOut: 70 },
          { ficoMin: 660, loanMax: 2_000_000, purchase: 75, rateTerm: 70, cashOut: 65 },
          { ficoMin: 640, loanMax: 2_000_000, purchase: 75, rateTerm: 65, cashOut: 65 },
          { ficoMin: 620, loanMax: 2_000_000, purchase: 65, rateTerm: 65, cashOut: 65 },
          // $2,000,001 – $3,000,000
          { ficoMin: 700, loanMax: 3_000_000, purchase: 65, rateTerm: 65, cashOut: 65 },
        ],
      },
      {
        // DSCR < 1.00 & No-Ratio overlay: flat 70% purchase / 65% refi, priced as 700 FICO
        label: "< 1.00 / No-Ratio",
        dscrMin: null, dscrMax: 0.99,
        rows: [
          { ficoMin: 640, loanMax: 3_000_000, purchase: 70, rateTerm: 65, cashOut: null },
        ],
      },
    ],
  },

  // =========================================================================
  // OAK  ←  _src: Pound Cake DSCR (eff. 2/13/2026)
  // True no-ratio + credit-event friendly + small balance from $100k
  // =========================================================================
  {
    id: "oak",
    name: "Greenstreet Oak",
    tagline: "No-ratio & credit-event friendly",
    minFICO: 660, dscrFloor: 0.75, noRatio: true, maxLTV: 85, maxLoan: 3_000_000,
    isSTR: true, multiFamily: false, foreignNational: false,
    reserves: "≤ $500k: 3 mo · ≤ $2M: 6 mo · > $2M: 12 mo",
    features: ["True no-ratio (no DSCR min)", "Recent credit events OK", "Small balance from $100k", "Condotel"],
    grid: [
      {
        label: "≥ 1.00",
        dscrMin: 1.00, dscrMax: null,
        rows: [
          { ficoMin: 720, loanMax: 1_000_000, purchase: 85, rateTerm: 80, cashOut: 75 },
          { ficoMin: 720, loanMax: 1_500_000, purchase: 85, rateTerm: 75, cashOut: 70 },
          { ficoMin: 720, loanMax: 2_000_000, purchase: 75, rateTerm: 75, cashOut: 60 },
          { ficoMin: 720, loanMax: 3_000_000, purchase: 70, rateTerm: 70, cashOut: 60 },
          { ficoMin: 700, loanMax: 1_500_000, purchase: 75, rateTerm: 75, cashOut: 70 },
          { ficoMin: 700, loanMax: 3_000_000, purchase: 70, rateTerm: 70, cashOut: 60 },
          { ficoMin: 680, loanMax: 1_500_000, purchase: 75, rateTerm: 75, cashOut: 70 },
          { ficoMin: 680, loanMax: 2_500_000, purchase: 70, rateTerm: 70, cashOut: 60 },
          { ficoMin: 660, loanMax: 1_000_000, purchase: 70, rateTerm: 65, cashOut: 60 },
          { ficoMin: 660, loanMax: 1_500_000, purchase: 65, rateTerm: 60, cashOut: 55 },
          { ficoMin: 660, loanMax: 2_000_000, purchase: 60, rateTerm: 55, cashOut: 50 },
        ],
      },
      {
        label: "0.75 – 0.99",
        dscrMin: 0.75, dscrMax: 0.99,
        rows: [
          { ficoMin: 740, loanMax: 1_500_000, purchase: 75, rateTerm: 75, cashOut: 70 },
          { ficoMin: 740, loanMax: 2_000_000, purchase: 75, rateTerm: 75, cashOut: 60 },
          { ficoMin: 700, loanMax: 1_000_000, purchase: 75, rateTerm: 75, cashOut: 70 },
          { ficoMin: 700, loanMax: 1_500_000, purchase: 70, rateTerm: 70, cashOut: 65 },
          { ficoMin: 700, loanMax: 2_000_000, purchase: 65, rateTerm: 65, cashOut: null },
          { ficoMin: 680, loanMax: 1_000_000, purchase: 65, rateTerm: 65, cashOut: 60 },
        ],
      },
      {
        label: "No-Ratio",
        dscrMin: null, dscrMax: null,
        rows: [
          { ficoMin: 740, loanMax: 1_000_000, purchase: 75, rateTerm: 75, cashOut: 65 },
          { ficoMin: 740, loanMax: 1_500_000, purchase: 70, rateTerm: 70, cashOut: 60 },
          { ficoMin: 720, loanMax: 1_000_000, purchase: 70, rateTerm: 70, cashOut: 60 },
          { ficoMin: 720, loanMax: 1_500_000, purchase: 65, rateTerm: 65, cashOut: 60 },
          { ficoMin: 700, loanMax: 1_500_000, purchase: 65, rateTerm: 65, cashOut: 60 },
        ],
      },
    ],
  },

  // =========================================================================
  // BIRCH  ←  _src: Sponge Cake DSCR (eff. 9/12/2025)
  // Broadest box: multi-family, sub-0.75 DSCR, new construction, ITIN
  // =========================================================================
  {
    id: "birch",
    name: "Greenstreet Birch",
    tagline: "Broadest box, including multi-family",
    minFICO: 620, dscrFloor: 0, noRatio: true, maxLTV: 80, maxLoan: 3_000_000,
    isSTR: true, multiFamily: true, foreignNational: false,
    reserves: "≤ $1M: 3 mo · ≤ $2M: 6 mo · > $2M: 12 mo",
    features: ["DSCR below 0.75 considered", "Multi-family (1.10 DSCR)", "New construction", "STR to 80% LTV", "ITIN"],
    grid: [
      {
        label: "≥ 1.00 (SFR / 2-4 unit)",
        dscrMin: 1.00, dscrMax: null,
        rows: [
          { ficoMin: 720, loanMax: 1_500_000, purchase: 80, rateTerm: 80, cashOut: 75 },
          { ficoMin: 720, loanMax: 2_000_000, purchase: 75, rateTerm: 75, cashOut: 70 },
          { ficoMin: 720, loanMax: 2_500_000, purchase: 70, rateTerm: 70, cashOut: 60 },
          { ficoMin: 720, loanMax: 3_000_000, purchase: 65, rateTerm: 65, cashOut: 55 },
          { ficoMin: 700, loanMax: 1_500_000, purchase: 80, rateTerm: 80, cashOut: 75 },
          { ficoMin: 700, loanMax: 2_000_000, purchase: 75, rateTerm: 75, cashOut: 65 },
          { ficoMin: 700, loanMax: 2_500_000, purchase: 70, rateTerm: 70, cashOut: 60 },
          { ficoMin: 700, loanMax: 3_000_000, purchase: 65, rateTerm: 65, cashOut: 55 },
          { ficoMin: 680, loanMax: 1_500_000, purchase: 80, rateTerm: 80, cashOut: 75 },
          { ficoMin: 680, loanMax: 2_000_000, purchase: 70, rateTerm: 70, cashOut: 65 },
          { ficoMin: 680, loanMax: 2_500_000, purchase: 65, rateTerm: 65, cashOut: 55 },
          { ficoMin: 660, loanMax: 1_000_000, purchase: 75, rateTerm: 75, cashOut: 65 },
          { ficoMin: 660, loanMax: 2_000_000, purchase: 70, rateTerm: 70, cashOut: 65 },
          { ficoMin: 660, loanMax: 2_500_000, purchase: 55, rateTerm: 55, cashOut: 55 },
          { ficoMin: 640, loanMax: 1_000_000, purchase: 70, rateTerm: 70, cashOut: null },
          { ficoMin: 620, loanMax: 1_000_000, purchase: 65, rateTerm: 65, cashOut: null },
        ],
      },
      {
        // Flat overlay per matrix: "680 Min FICO · 75% Max LTV P&R/T · 70% CO"
        label: "0.75 – 0.99",
        dscrMin: 0.75, dscrMax: 0.99,
        rows: [
          { ficoMin: 680, loanMax: 3_000_000, purchase: 75, rateTerm: 75, cashOut: 70 },
        ],
      },
      {
        // Flat overlay per matrix: "680 Min FICO · 70% Max LTV P&R/T · 65% CO"
        label: "< 0.75",
        dscrMin: 0, dscrMax: 0.74,
        rows: [
          { ficoMin: 680, loanMax: 3_000_000, purchase: 70, rateTerm: 70, cashOut: 65 },
        ],
      },
    ],
  },

  // =========================================================================
  // CEDAR  ←  _src: Coffee Cake DSCR (eff. 3/9/2026)
  // Granular jumbo grid; most precise FICO × loan-amount pricing up to $3.5M
  // =========================================================================
  {
    id: "cedar",
    name: "Greenstreet Cedar",
    tagline: "Biggest loans, tier-priced to $3.5M",
    minFICO: 640, dscrFloor: 0.75, noRatio: false, maxLTV: 80, maxLoan: 3_500_000,
    isSTR: true, multiFamily: false, foreignNational: false,
    reserves: "2 mo · > $1.5M: 6 mo · > $2.5M: 12 mo",
    features: ["Loans to $3.5M", "Granular FICO/LTV pricing", "Vacant-property refi", "Cash-in-hand to $1M"],
    grid: [
      {
        label: "≥ 1.00",
        dscrMin: 1.00, dscrMax: null,
        rows: [
          { ficoMin: 700, loanMax: 1_000_000, purchase: 80, rateTerm: 75, cashOut: 75 },
          { ficoMin: 700, loanMax: 1_500_000, purchase: 80, rateTerm: 75, cashOut: 75 },
          { ficoMin: 700, loanMax: 2_000_000, purchase: 75, rateTerm: 70, cashOut: 70 },
          { ficoMin: 700, loanMax: 3_000_000, purchase: 70, rateTerm: 65, cashOut: 65 },
          { ficoMin: 700, loanMax: 3_500_000, purchase: 70, rateTerm: 65, cashOut: null },
          { ficoMin: 660, loanMax: 1_000_000, purchase: 75, rateTerm: 75, cashOut: 70 },
          { ficoMin: 660, loanMax: 1_500_000, purchase: 75, rateTerm: 70, cashOut: 70 },
          { ficoMin: 660, loanMax: 2_000_000, purchase: 70, rateTerm: 65, cashOut: 65 },
          { ficoMin: 660, loanMax: 2_500_000, purchase: 70, rateTerm: 65, cashOut: 65 },
          { ficoMin: 660, loanMax: 3_000_000, purchase: 65, rateTerm: null, cashOut: null },
          { ficoMin: 640, loanMax: 1_000_000, purchase: 75, rateTerm: 65, cashOut: null },
          { ficoMin: 640, loanMax: 1_500_000, purchase: 65, rateTerm: 65, cashOut: null },
          { ficoMin: 640, loanMax: 2_000_000, purchase: 65, rateTerm: null, cashOut: null },
          { ficoMin: 640, loanMax: 3_000_000, purchase: 60, rateTerm: null, cashOut: null },
        ],
      },
      {
        label: "< 1.00",
        dscrMin: 0.75, dscrMax: 0.99,
        rows: [
          { ficoMin: 700, loanMax: 1_000_000, purchase: 75, rateTerm: 70, cashOut: 70 },
          { ficoMin: 700, loanMax: 1_500_000, purchase: 75, rateTerm: 70, cashOut: 70 },
          { ficoMin: 700, loanMax: 2_000_000, purchase: 70, rateTerm: 65, cashOut: 65 },
          { ficoMin: 700, loanMax: 2_500_000, purchase: 65, rateTerm: null, cashOut: null },
          { ficoMin: 700, loanMax: 3_000_000, purchase: 60, rateTerm: null, cashOut: null },
          { ficoMin: 680, loanMax: 1_000_000, purchase: 70, rateTerm: 65, cashOut: null },
          { ficoMin: 680, loanMax: 1_500_000, purchase: 70, rateTerm: 65, cashOut: null },
          { ficoMin: 680, loanMax: 2_000_000, purchase: 65, rateTerm: 60, cashOut: null },
          { ficoMin: 680, loanMax: 3_000_000, purchase: 60, rateTerm: null, cashOut: null },
          { ficoMin: 660, loanMax: 1_000_000, purchase: 65, rateTerm: null, cashOut: null },
        ],
      },
    ],
  },

  // =========================================================================
  // ASPEN  ←  _src: Funnel Cake DSCR (eff. 11/25/2025)
  // Mid-tier: everyday 1-4 unit, FN to $1.5M, sub-1.00 tier
  // =========================================================================
  {
    id: "aspen",
    name: "Greenstreet Aspen",
    tagline: "The everyday 1-4 unit DSCR loan",
    minFICO: 640, dscrFloor: 0.75, noRatio: false, maxLTV: 80, maxLoan: 2_500_000,
    isSTR: true, multiFamily: false, foreignNational: true,
    reserves: "≤ $1M: 3 mo · > $1M: 6 mo",
    features: ["SFR, PUD, 2-4 unit, condo", "Foreign national to $1.5M", "STR (1.15 DSCR, 720)", "Fixed + ARM + I/O"],
    grid: [
      {
        label: "≥ 1.00",
        dscrMin: 1.00, dscrMax: null,
        rows: [
          // ≤ $1,500,000
          { ficoMin: 720, loanMax: 1_500_000, purchase: 80, rateTerm: 80, cashOut: 80 },
          { ficoMin: 700, loanMax: 1_500_000, purchase: 80, rateTerm: 80, cashOut: 75 },
          { ficoMin: 680, loanMax: 1_500_000, purchase: 75, rateTerm: 75, cashOut: 75 },
          { ficoMin: 640, loanMax: 1_500_000, purchase: 70, rateTerm: 70, cashOut: 70 },
          // ≤ $2,000,000
          { ficoMin: 700, loanMax: 2_000_000, purchase: 80, rateTerm: 80, cashOut: 75 },
          { ficoMin: 680, loanMax: 2_000_000, purchase: 75, rateTerm: 75, cashOut: 75 },
          { ficoMin: 660, loanMax: 2_000_000, purchase: 65, rateTerm: 65, cashOut: 65 },
          // ≤ $2,500,000
          { ficoMin: 700, loanMax: 2_500_000, purchase: 70, rateTerm: 70, cashOut: 70 },
          { ficoMin: 660, loanMax: 2_500_000, purchase: 65, rateTerm: 65, cashOut: 65 },
        ],
      },
      {
        label: "0.75 – 0.99",
        dscrMin: 0.75, dscrMax: 0.99,
        rows: [
          { ficoMin: 720, loanMax: 1_500_000, purchase: 75, rateTerm: 75, cashOut: 70 },
          { ficoMin: 700, loanMax: 1_500_000, purchase: 75, rateTerm: 75, cashOut: 65 },
          { ficoMin: 680, loanMax: 1_500_000, purchase: 70, rateTerm: 70, cashOut: 65 },
          { ficoMin: 700, loanMax: 2_000_000, purchase: 70, rateTerm: 70, cashOut: 65 },
          { ficoMin: 680, loanMax: 2_000_000, purchase: 65, rateTerm: 65, cashOut: 65 },
          { ficoMin: 700, loanMax: 2_500_000, purchase: 60, rateTerm: 60, cashOut: 60 },
        ],
      },
    ],
  },

  // =========================================================================
  // WILLOW  ←  _src: Cheese Cake DSCR (eff. 10/14/2025)
  // Standard DSCR + FN + condotel; clean credit focus, simple FICO grid
  // =========================================================================
  {
    id: "willow",
    name: "Greenstreet Willow",
    tagline: "Standard DSCR with FN & condotel paths",
    minFICO: 660, dscrFloor: 0.80, noRatio: false, maxLTV: 80, maxLoan: 3_000_000,
    isSTR: true, multiFamily: false, foreignNational: true,
    reserves: "≤65% LTV: 0 mo · < $1M: 3 mo · $1M–$1.5M: 6 mo · > $1.5M: 9 mo",
    features: ["Foreign national to 70% LTV", "Condotel program", "First-time investor (75%)", "I/O at 700+ FICO"],
    grid: [
      {
        // Note: main grid is FICO-only; loan amount overlays apply:
        //   > $1.5M → 75% max;  > $2M → 70% max, 700 min FICO
        label: "≥ 0.80",
        dscrMin: 0.80, dscrMax: null,
        rows: [
          { ficoMin: 700, loanMax: 1_500_000, purchase: 80, rateTerm: 80, cashOut: 75 },
          { ficoMin: 700, loanMax: 2_000_000, purchase: 75, rateTerm: 75, cashOut: 75 },
          { ficoMin: 700, loanMax: 3_000_000, purchase: 70, rateTerm: 70, cashOut: 75 },
        ],
      },
      {
        label: "< 1.00",
        dscrMin: 0.80, dscrMax: 0.99,
        rows: [
          { ficoMin: 720, loanMax: 1_500_000, purchase: 75, rateTerm: 75, cashOut: 70 },
        ],
      },
    ],
  },

  // =========================================================================
  // MAGNOLIA  ←  _src: Velvet Cake DSCR (eff. 4/1/2026)
  // 5-9 units, mixed-use, commercial-zoned, exotic property types
  // =========================================================================
  {
    id: "magnolia",
    name: "Greenstreet Magnolia",
    tagline: "The widest property box — 5-9 units & more",
    minFICO: 660, dscrFloor: 1.00, noRatio: false, maxLTV: 80, maxLoan: 3_000_000,
    isSTR: true, multiFamily: true, foreignNational: true,
    reserves: "≤ $2M: 6 mo · > $2M: 12 mo",
    features: ["5-9 units", "Mixed-use & commercial-zoned", "Agricultural, co-op, leasehold", "1/2/3/5-yr PPP options"],
    grid: [
      {
        label: "≥ 1.20",
        dscrMin: 1.20, dscrMax: null,
        rows: [
          { ficoMin: 700, loanMax: 3_000_000, purchase: 80, rateTerm: 80, cashOut: 75 },
          { ficoMin: 680, loanMax: 3_000_000, purchase: 75, rateTerm: 75, cashOut: 70 },
          { ficoMin: 660, loanMax: 3_000_000, purchase: 70, rateTerm: 70, cashOut: null },
        ],
      },
      {
        label: "1.00 – 1.19",
        dscrMin: 1.00, dscrMax: 1.19,
        rows: [
          { ficoMin: 700, loanMax: 3_000_000, purchase: 80, rateTerm: 80, cashOut: 75 },
          { ficoMin: 680, loanMax: 3_000_000, purchase: 75, rateTerm: 75, cashOut: 70 },
        ],
      },
    ],
  },

];

export const DSCR_PROGRAMS_AS_OF = "Jun 24, 2026";
