// Greenstreet DSCR program lineup — real underwriting parameters.
//
// Source of truth: the live DSCR eligibility matrices from Greenstreet's
// capital partner (caketpo.com/products, DSCR tab), pulled 2026-06-24.
// Each Greenstreet program below maps 1:1 to one partner matrix (named in the
// `_src` comment with its effective date). The partner name is NEVER surfaced
// to customers — Greenstreet underwrites and funds these in-house.
//
// Headline numbers (minFICO, maxLTV, maxLoan, dscrFloor) are the most
// favorable purchase terms in each matrix; full FICO × loan-size × LTV grids
// and overlays live in the partner matrices and the Greenstreet credit guide.

export type DscrProgram = {
  id: string;
  name: string;
  tagline: string;
  minFICO: number;        // lowest qualifying FICO in the matrix
  dscrFloor: number;      // lowest DSCR accepted (0 = no-ratio / no DSCR minimum)
  noRatio: boolean;       // true if a true no-ratio option exists
  maxLTV: number;         // best purchase LTV (headline)
  maxLoan: number;        // max loan amount ($)
  isSTR: boolean;         // short-term rental eligible
  multiFamily: boolean;   // 5+ units eligible
  foreignNational: boolean;
  reserves: string;       // plain-English reserve summary
  features: string[];     // chips shown on the card
};

export const DSCR_PROGRAMS: DscrProgram[] = [
  {
    // _src: Cup Cake — DSCR (eff. 3/9/2026). Max-leverage tier.
    id: "maple",
    name: "Greenstreet Maple",
    tagline: "Maximum leverage — up to 85% LTV",
    minFICO: 620, dscrFloor: 0.75, noRatio: true, maxLTV: 85, maxLoan: 3_000_000,
    isSTR: true, multiFamily: false, foreignNational: true,
    reserves: "FICO < 620 needs 12 mo; otherwise per loan size",
    features: ["85% LTV at 720 FICO", "ITIN tiers", "No-ratio option", "2-4 unit to 80%", "Non-warrantable condo"],
  },
  {
    // _src: Pound Cake — DSCR (eff. 2/13/2026). No-ratio + credit-event tier.
    id: "oak",
    name: "Greenstreet Oak",
    tagline: "No-ratio & credit-event friendly",
    minFICO: 660, dscrFloor: 0.75, noRatio: true, maxLTV: 85, maxLoan: 3_000_000,
    isSTR: true, multiFamily: false, foreignNational: false,
    reserves: "3 mo ≤ $500k · 6 mo to $2M · 12 mo > $2M",
    features: ["True no-ratio (no DSCR min)", "Recent credit events OK", "Small balance from $100k", "Condotel"],
  },
  {
    // _src: Sponge Cake — DSCR (eff. 9/12/2025). Broad + multi-family + sub-0.75.
    id: "birch",
    name: "Greenstreet Birch",
    tagline: "Broadest box, including multi-family",
    minFICO: 620, dscrFloor: 0, noRatio: true, maxLTV: 80, maxLoan: 3_000_000,
    isSTR: true, multiFamily: true, foreignNational: false,
    reserves: "3 mo ≤ $1M · 6 mo to $2M · 12 mo > $2M",
    features: ["DSCR below 0.75 considered", "Multi-family (1.10 DSCR)", "New construction", "STR to 80% LTV", "ITIN"],
  },
  {
    // _src: Coffee Cake — DSCR (eff. 3/9/2026). Conservative jumbo, $3.5M.
    id: "cedar",
    name: "Greenstreet Cedar",
    tagline: "Biggest loans, tier-priced to $3.5M",
    minFICO: 640, dscrFloor: 0.75, noRatio: false, maxLTV: 80, maxLoan: 3_500_000,
    isSTR: true, multiFamily: false, foreignNational: false,
    reserves: "2 mo · 6 mo > $1.5M · 12 mo > $2.5M",
    features: ["Loans to $3.5M", "Granular FICO/LTV pricing", "Vacant-property refi", "Cash-in-hand to $1M"],
  },
  {
    // _src: Funnel Cake — DSCR (eff. 11/25/2025). Mid-tier standard properties.
    id: "aspen",
    name: "Greenstreet Aspen",
    tagline: "The everyday 1-4 unit DSCR loan",
    minFICO: 640, dscrFloor: 0.75, noRatio: false, maxLTV: 80, maxLoan: 2_500_000,
    isSTR: true, multiFamily: false, foreignNational: true,
    reserves: "3 mo ≤ $1M · 6 mo > $1M",
    features: ["SFR, PUD, 2-4 unit, condo", "Foreign national to $1.5M", "STR (1.15 DSCR, 720)", "Fixed + ARM + I/O"],
  },
  {
    // _src: Cheese Cake — DSCR (eff. 10/14/2025). Standard + FN + condotel.
    id: "willow",
    name: "Greenstreet Willow",
    tagline: "Standard DSCR with FN & condotel paths",
    minFICO: 660, dscrFloor: 0.80, noRatio: false, maxLTV: 80, maxLoan: 3_000_000,
    isSTR: true, multiFamily: false, foreignNational: true,
    reserves: "0 mo at ≤65% LTV · up to 9 mo > $1.5M",
    features: ["Foreign national to 70%", "Condotel program", "First-time investor (75%)", "I/O at 700+ FICO"],
  },
  {
    // _src: Velvet Cake — DSCR (eff. 4/1/2026). Multi-family 5-9 + exotic property.
    id: "magnolia",
    name: "Greenstreet Magnolia",
    tagline: "The widest property box — 5-9 units & more",
    minFICO: 660, dscrFloor: 1.00, noRatio: false, maxLTV: 80, maxLoan: 3_000_000,
    isSTR: true, multiFamily: true, foreignNational: true,
    reserves: "6 mo ≤ $2M · 12 mo > $2M",
    features: ["5-9 units", "Mixed-use & commercial-zoned", "Agricultural, co-op, leasehold", "1/2/3/5-yr PPP options"],
  },
];

export const DSCR_PROGRAMS_AS_OF = "Jun 24, 2026";
