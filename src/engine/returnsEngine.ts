// ============================================================
// DSCR Deal Desk — Returns Engine
// ONE cash-flow schedule: acquisition → hold → sale.
// ============================================================
//
// THE RULE THIS FILE NOW ENFORCES
// ------------------------------------------------------------
// Every published figure — levered IRR, unlevered IRR, after-tax IRR, equity
// multiple, cash-on-cash, break-even year — is derived from ONE array of
// `ReturnsScheduleRow`. Nothing recomputes its own private cash flow.
//
// That rule exists because the previous version broke it four ways, and each
// break shipped a wrong number to an investor:
//
//   1. `afterTaxIRR: irr * 0.75` — a flat 25% haircut labelled as an after-tax
//      IRR. It ignored depreciation, mortgage-interest deductibility, §469
//      passive-loss limits, §1250/§1245 recapture and NIIT. After-tax IRR is
//      now computed from the same schedule, with the operating tax applied
//      year by year and the sale tax from `taxEngine.computeRecaptureOnSale`.
//   2. `equityMultiple` / `year1CashOnCash` divided by `cashInvested` with no
//      guard, so a 100% LTV deal published `-Infinity` — a number that reads
//      as catastrophic loss when the truth is "the ratio is undefined". Both
//      are now `number | null`.
//   3. `totalDistributions` floored the exit at zero (`Math.max(net, 0)`), so
//      a deal that loses money on the sale reported a BETTER multiple than
//      reality (probe: reported -2.40 where the truth including the real exit
//      was -7.51). The floor is gone; a negative exit is a negative exit.
//   4. The equity multiple summed cash flow FLAT while the IRR grew it 2%/yr,
//      so the two published numbers disagreed by construction. They now read
//      the same rows.
//
// DEFINITIONS (unchanged where they were already right)
//   GPR  = gross potential rent
//   EGI  = GPR × (1 − vacancy)
//   OpEx = mgmt + maint + turnover + taxes + insurance + HOA + flood
//          (NO debt service, NO capex — capex is its own reserve line)
//   NOI  = EGI − OpEx
//   Operating cash flow = NOI − capex reserve − debt service
//   Cap rate      = year-1 NOI ÷ purchase price
//   Yield on cost = year-1 NOI ÷ total cost basis
//   Debt yield    = year-1 NOI ÷ loan amount
//   Break-even occupancy = (OpEx + debt service) ÷ GPR
//   Equity multiple = Σ(distributions, years 1..N, incl. the real exit) ÷ cash invested
//
// EXIT CONVENTION: the sale is priced off FORWARD NOI (the year N+1 income a
// buyer would underwrite), i.e. `NOI₁ × (1+g)^N ÷ exit cap`. This is stated on
// the page next to the number, because it is the most fragile input in the model.
// ============================================================

import type {
  ReturnsResult,
  HoldMatrixCell,
  PropertyInputs,
  LoanStructure,
  TaxProfile,
  FilingStatus,
} from './types';
import { calculatePI } from './engine';
import {
  computeXIRR,
  computeDepreciationSchedule,
  computeRecaptureOnSale,
  computePassiveLossAllowance,
} from './taxEngine';

// ============================================================
// ASSUMPTIONS — every one of these is a named, defaulted input.
// No figure in this file comes from a constant buried in a formula.
// ============================================================

export interface ReturnsTaxAssumptions {
  /** When false the schedule still computes, but tax columns are all zero and
   *  `afterTaxIrrPct` is null rather than a made-up number. */
  enabled: boolean;
  /** Marginal FEDERAL ordinary rate applied to net rental income. */
  ordinaryRatePct: number;
  /** Flat state income-tax rate on rental income and on gain at sale. */
  stateRatePct: number;
  /** Share of basis allocated to land. Land is never depreciable. */
  landAllocationPct: number;
  filingStatus: FilingStatus;
  /** Drives the LTCG bracket and whether NIIT (3.8%) applies at sale. */
  magi: number;
  /** IRC §469: real-estate professionals are not subject to the passive-loss cap. */
  isRealEstateProfessional: boolean;
  /** IRC §1031: defers all recapture and gain tax at sale. */
  section1031Exchange: boolean;
  costSegStudyCompleted: boolean;
  costSegReclassifiedPct: number;
  acquisitionDate: string;
  placedInServiceDate: string;
}

export interface ReturnsAssumptions {
  // ── acquisition ──────────────────────────────────────────
  purchasePrice: number;
  /** Closing costs as % of price. Capitalised into basis and paid in cash. */
  closingCostsPct: number;
  /** Day-one capital works as % of price (rehab / make-ready). Capitalised. */
  upfrontCapExPct: number;

  // ── financing ────────────────────────────────────────────
  ltvPct: number;
  ratePct: number;
  termMonths: number;

  // ── income ───────────────────────────────────────────────
  grossRentMonthly: number;
  rentGrowthPct: number;
  vacancyPct: number;

  // ── operating expenses ───────────────────────────────────
  /** % of GROSS potential rent (the convention this desk quotes on). */
  managementPct: number;
  maintenancePct: number;
  turnoverPct: number;
  annualTaxes: number;
  annualInsurance: number;
  hoaMonthly: number;
  floodInsuranceMonthly: number;
  /** Annual growth applied to the fixed-dollar expenses (taxes/ins/HOA/flood). */
  expenseGrowthPct: number;

  // ── capital ──────────────────────────────────────────────
  /** Ongoing capex reserve as % of EGI. Deducted from cash flow every year. */
  capExReservePct: number;

  // ── exit ─────────────────────────────────────────────────
  holdYears: number;
  exitCapRatePct: number;
  sellingCostsPct: number;
  /** Prepayment penalty in DOLLARS at the exit date. */
  prepayPenaltyAtExit: number;

  // ── overrides ────────────────────────────────────────────
  /** Cash to close from the full engine, when the caller has it. Defaults to
   *  down payment + closing costs + upfront capex. */
  cashInvestedOverride?: number;

  tax: ReturnsTaxAssumptions;
}

export const DEFAULT_TAX_ASSUMPTIONS: ReturnsTaxAssumptions = {
  enabled: true,
  ordinaryRatePct: 32,
  stateRatePct: 5,
  landAllocationPct: 20,
  filingStatus: 'MFJ',
  magi: 250_000,
  isRealEstateProfessional: false,
  section1031Exchange: false,
  costSegStudyCompleted: false,
  costSegReclassifiedPct: 0,
  acquisitionDate: '2026-01-01',
  placedInServiceDate: '2026-01-01',
};

export const DEFAULT_RETURNS_ASSUMPTIONS: ReturnsAssumptions = {
  purchasePrice: 425_000,
  closingCostsPct: 3,
  upfrontCapExPct: 0,
  ltvPct: 75,
  ratePct: 7,
  termMonths: 360,
  grossRentMonthly: 3_000,
  rentGrowthPct: 2,
  vacancyPct: 8,
  managementPct: 8,
  maintenancePct: 5,
  turnoverPct: 2,
  annualTaxes: 5_000,
  annualInsurance: 2_000,
  hoaMonthly: 0,
  floodInsuranceMonthly: 0,
  expenseGrowthPct: 2.5,
  capExReservePct: 5,
  holdYears: 5,
  exitCapRatePct: 6.5,
  sellingCostsPct: 6,
  prepayPenaltyAtExit: 0,
  tax: DEFAULT_TAX_ASSUMPTIONS,
};

/** Stated basis for every assumption, so the UI never ships a bare number. */
export const ASSUMPTION_BASIS = {
  closingCostsPct:
    'Title, escrow, lender and recording fees. Capitalised into basis and paid at close. Default 3% of price.',
  upfrontCapExPct:
    'Day-one capital works before the unit is rent-ready. Capitalised into basis, not expensed. Default 0%.',
  ltvPct: 'Loan-to-value. Down payment = 100% − LTV. Default 75%.',
  ratePct: 'Note rate on a fixed, fully-amortising loan. Interest-only periods are not modelled here.',
  rentGrowthPct:
    'Compounded annually from year 1. Default 2%. Stress the deal at 0% — a deal that only works on rent growth is not a deal.',
  vacancyPct:
    'Share of the year the unit produces no rent, including turnover downtime. Default 8% for long-term rentals.',
  managementPct: 'Third-party management, as % of GROSS scheduled rent. Default 8%.',
  maintenancePct:
    'Routine repairs, as % of gross scheduled rent. Default 5%. Capital items sit in the capex reserve instead.',
  turnoverPct: 'Make-ready and leasing cost between tenancies, as % of gross scheduled rent. Default 2%.',
  expenseGrowthPct:
    'Annual escalation on the fixed-dollar expenses (property tax, insurance, HOA, flood). Default 2.5%. Percentage-based expenses already grow with rent.',
  capExReservePct:
    'Roof, HVAC, appliances — funded from cash flow every year, as % of effective gross income. Default 5% (Part B range 5–8%). Deducted from cash flow, not a footnote.',
  exitCapRatePct:
    'The cap rate a buyer applies at sale, against FORWARD (year N+1) NOI. Higher cap = lower price. The most fragile input in the model — assume 25–100 bps above your entry cap.',
  sellingCostsPct:
    'Broker commission, transfer tax and seller-paid closing costs, as % of gross sale price. Default 6%.',
  prepayPenaltyAtExit: 'Dollar penalty owed to the lender at payoff, from the prepay structure on the note.',
  holdYears: 'Years from close to sale. The IRR is highly sensitive to this.',
  ordinaryRatePct:
    'Marginal federal rate applied to net rental income (NOI − mortgage interest − depreciation). Default 32%.',
  stateRatePct: 'Flat state income-tax rate on rental income and on the gain at sale. Default 5%.',
  landAllocationPct:
    'Share of basis allocated to land, which is never depreciable. Default 20%. The remainder depreciates straight-line over 27.5 years (IRC §168).',
  magi:
    'Modified adjusted gross income. Sets the long-term capital-gains bracket, the §469 passive-loss allowance, and whether the 3.8% NIIT applies at sale (IRC §1411).',
  section1031Exchange:
    'A like-kind exchange defers ALL recapture and gain tax at sale (IRC §1031). Default off.',
} as const;

// ============================================================
// THE SCHEDULE
// ============================================================

export interface ReturnsAcquisition {
  purchasePrice: number;
  closingCosts: number;
  upfrontCapEx: number;
  /** Purchase price + capitalised closing costs + capitalised upfront capex. */
  costBasis: number;
  loanAmount: number;
  downPayment: number;
  /** The year-0 outflow every return metric is measured against. */
  cashInvested: number;
}

export interface ReturnsScheduleRow {
  year: number;
  grossPotentialRent: number;
  vacancyLoss: number;
  effectiveGrossIncome: number;
  management: number;
  maintenance: number;
  turnover: number;
  propertyTaxes: number;
  insurance: number;
  hoa: number;
  floodInsurance: number;
  operatingExpenses: number;
  netOperatingIncome: number;
  capExReserve: number;
  debtInterest: number;
  debtPrincipal: number;
  debtService: number;
  loanBalanceEnd: number;
  /** NOI − capex reserve − debt service. */
  operatingCashFlow: number;
  /** Net sale proceeds before tax. Zero except in the exit year. */
  saleProceeds: number;
  /** operatingCashFlow + saleProceeds — the levered IRR's year-N term. */
  preTaxCashFlow: number;
  depreciation: number;
  /** NOI − mortgage interest − depreciation. The capex reserve is not deductible. */
  taxableIncome: number;
  /** Positive = tax due; negative = a shield against other income. */
  incomeTax: number;
  /** Recapture + LTCG + NIIT + state at sale. Zero except in the exit year. */
  taxOnSale: number;
  afterTaxCashFlow: number;
  cumulativePreTaxCashFlow: number;
  cumulativeAfterTaxCashFlow: number;
  /** NOI ÷ debt service for the year. */
  dscr: number;
}

export interface ReturnsExit {
  year: number;
  /** Year N+1 NOI — what a buyer underwrites. */
  forwardNoi: number;
  exitCapRatePct: number;
  grossSalePrice: number;
  sellingCosts: number;
  loanPayoff: number;
  prepayPenalty: number;
  /** grossSalePrice − sellingCosts − loanPayoff − prepayPenalty. May be negative. */
  netSaleProceeds: number;
  totalDepreciationTaken: number;
  gainOnSale: number;
  section1250Gain: number;
  section1245Recapture: number;
  appreciationGain: number;
  taxOnSale: number;
  netSaleProceedsAfterTax: number;
}

export interface ReturnsMetrics {
  cashInvested: number;
  entryCapRatePct: number;
  yieldOnCostPct: number;
  debtYieldPct: number;
  breakEvenOccupancyPct: number;
  /** null when there is no equity to divide by — never ±Infinity. */
  year1CashOnCashPct: number | null;
  averageCashOnCashPct: number | null;
  /** null when the cash-flow series has no sign change (no IRR exists). */
  leveredIrrPct: number | null;
  unleveredIrrPct: number | null;
  /** Real after-tax IRR from this schedule. Never a haircut on the pre-tax IRR. */
  afterTaxIrrPct: number | null;
  equityMultiple: number | null;
  afterTaxEquityMultiple: number | null;
  /** Σ of years 1..N pre-tax cash flow, INCLUDING a negative exit. */
  totalPreTaxDistributions: number;
  totalAfterTaxDistributions: number;
  totalProfitPreTax: number;
  /** First year cumulative pre-tax cash flow turns non-negative. */
  breakEvenYear: number | null;
  year1Dscr: number;
}

export interface ReturnsSchedule {
  assumptions: ReturnsAssumptions;
  acquisition: ReturnsAcquisition;
  rows: ReturnsScheduleRow[];
  exit: ReturnsExit;
  metrics: ReturnsMetrics;
  /** The exact vectors the IRRs are solved on — published so a user can check them. */
  leveredCashFlows: number[];
  unleveredCashFlows: number[];
  afterTaxCashFlows: number[];
}

// ============================================================
// AMORTISATION — shared, never re-implemented by a caller
// ============================================================

export function computeRemainingBalance(
  loanAmount: number,
  annualRate: number,
  totalTermMonths: number,
  monthsElapsed: number,
): number {
  const r = annualRate / 100 / 12;
  if (r === 0) return loanAmount * Math.max(0, 1 - monthsElapsed / totalTermMonths);
  if (monthsElapsed >= totalTermMonths) return 0;

  const factor = Math.pow(1 + r, totalTermMonths);
  const elapsed = Math.pow(1 + r, monthsElapsed);
  const remaining = loanAmount * (factor - elapsed) / (factor - 1);
  return Math.max(0, remaining);
}

/**
 * IRR in PERCENT, or null when no IRR exists.
 *
 * `computeXIRR` returns a bare 0 when it cannot bracket a root, which reads as
 * "0% return" — indistinguishable from a deal that exactly returns capital. A
 * series with no sign change has no IRR at all, and this says so.
 */
function irrPct(flows: number[]): number | null {
  if (flows.length < 2) return null;
  if (!flows.some((v) => v < 0) || !flows.some((v) => v > 0)) return null;
  const irr = computeXIRR(flows.map((amount, time) => ({ time, amount })));
  return Number.isFinite(irr) ? irr * 100 : null;
}

/** Ratio that is null — not ±Infinity — when the denominator is not positive. */
function ratio(numerator: number, denominator: number): number | null {
  if (!(denominator > 0) || !Number.isFinite(denominator)) return null;
  const v = numerator / denominator;
  return Number.isFinite(v) ? v : null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const round1 = (n: number) => Math.round(n * 10) / 10;

function toTaxProfile(a: ReturnsAssumptions): TaxProfile {
  return {
    ordinaryIncomeBrackets: [],
    magi: a.tax.magi,
    filingStatus: a.tax.filingStatus,
    stateTaxRatePct: a.tax.stateRatePct,
    isRealEstateProfessional: a.tax.isRealEstateProfessional,
    yearsREP: a.tax.isRealEstateProfessional ? 1 : 0,
    landAllocationPct: a.tax.landAllocationPct,
    costSegStudyCompleted: a.tax.costSegStudyCompleted,
    costSegReclassifiedPct: a.tax.costSegReclassifiedPct,
    acquisitionDate: a.tax.acquisitionDate,
    placedInServiceDate: a.tax.placedInServiceDate,
    expectedHoldYears: a.holdYears,
    exitSellingCostsPct: a.sellingCostsPct,
    exitCapRatePct: a.exitCapRatePct,
    section1031Exchange: a.tax.section1031Exchange,
  };
}

// ============================================================
// buildReturnsSchedule — the one approved schedule
// ============================================================

export function buildReturnsSchedule(input: Partial<ReturnsAssumptions>): ReturnsSchedule {
  const a: ReturnsAssumptions = {
    ...DEFAULT_RETURNS_ASSUMPTIONS,
    ...input,
    tax: { ...DEFAULT_TAX_ASSUMPTIONS, ...(input.tax ?? {}) },
  };
  const holdYears = Math.max(1, Math.round(a.holdYears));
  const termMonths = Math.max(12, Math.round(a.termMonths));

  // ── Year 0: acquisition ────────────────────────────────────────────────
  const closingCosts = a.purchasePrice * (a.closingCostsPct / 100);
  const upfrontCapEx = a.purchasePrice * (a.upfrontCapExPct / 100);
  const costBasis = a.purchasePrice + closingCosts + upfrontCapEx;
  const loanAmount = a.purchasePrice * (a.ltvPct / 100);
  const downPayment = a.purchasePrice - loanAmount;
  const cashInvested = a.cashInvestedOverride ?? (downPayment + closingCosts + upfrontCapEx);

  const acquisition: ReturnsAcquisition = {
    purchasePrice: a.purchasePrice,
    closingCosts,
    upfrontCapEx,
    costBasis,
    loanAmount,
    downPayment,
    cashInvested,
  };

  const piMonthly = calculatePI(loanAmount, a.ratePct, termMonths);

  // Depreciation comes from the tax engine, on the capitalised basis.
  const taxProfile = toTaxProfile({ ...a, holdYears });
  const depreciationSchedule = a.tax.enabled
    ? computeDepreciationSchedule(costBasis, a.tax.landAllocationPct, holdYears, taxProfile)
    : [];

  const rentG = 1 + a.rentGrowthPct / 100;
  const expG = 1 + a.expenseGrowthPct / 100;

  const noiForYear = (yr: number): number => {
    const gpr = a.grossRentMonthly * 12 * Math.pow(rentG, yr - 1);
    const egi = gpr * (1 - a.vacancyPct / 100);
    const pctExpenses = gpr * ((a.managementPct + a.maintenancePct + a.turnoverPct) / 100);
    const fixedExpenses =
      (a.annualTaxes + a.annualInsurance + a.hoaMonthly * 12 + a.floodInsuranceMonthly * 12) *
      Math.pow(expG, yr - 1);
    return egi - pctExpenses - fixedExpenses;
  };

  // ── Years 1..N: operations ────────────────────────────────────────────
  const rows: ReturnsScheduleRow[] = [];

  for (let yr = 1; yr <= holdYears; yr++) {
    const growth = Math.pow(rentG, yr - 1);
    const escalation = Math.pow(expG, yr - 1);

    const grossPotentialRent = a.grossRentMonthly * 12 * growth;
    const vacancyLoss = grossPotentialRent * (a.vacancyPct / 100);
    const effectiveGrossIncome = grossPotentialRent - vacancyLoss;

    const management = grossPotentialRent * (a.managementPct / 100);
    const maintenance = grossPotentialRent * (a.maintenancePct / 100);
    const turnover = grossPotentialRent * (a.turnoverPct / 100);
    const propertyTaxes = a.annualTaxes * escalation;
    const insurance = a.annualInsurance * escalation;
    const hoa = a.hoaMonthly * 12 * escalation;
    const floodInsurance = a.floodInsuranceMonthly * 12 * escalation;

    const operatingExpenses =
      management + maintenance + turnover + propertyTaxes + insurance + hoa + floodInsurance;
    const netOperatingIncome = effectiveGrossIncome - operatingExpenses;
    const capExReserve = effectiveGrossIncome * (a.capExReservePct / 100);

    // Debt: exact closed-form amortisation, split into interest and principal.
    const monthsStart = Math.min((yr - 1) * 12, termMonths);
    const monthsEnd = Math.min(yr * 12, termMonths);
    const balStart = computeRemainingBalance(loanAmount, a.ratePct, termMonths, monthsStart);
    const balEnd = computeRemainingBalance(loanAmount, a.ratePct, termMonths, monthsEnd);
    const debtService = piMonthly * (monthsEnd - monthsStart);
    const debtPrincipal = balStart - balEnd;
    const debtInterest = Math.max(0, debtService - debtPrincipal);

    const operatingCashFlow = netOperatingIncome - capExReserve - debtService;

    rows.push({
      year: yr,
      grossPotentialRent,
      vacancyLoss,
      effectiveGrossIncome,
      management,
      maintenance,
      turnover,
      propertyTaxes,
      insurance,
      hoa,
      floodInsurance,
      operatingExpenses,
      netOperatingIncome,
      capExReserve,
      debtInterest,
      debtPrincipal,
      debtService,
      loanBalanceEnd: balEnd,
      operatingCashFlow,
      saleProceeds: 0,
      preTaxCashFlow: operatingCashFlow,
      depreciation: 0,
      taxableIncome: 0,
      incomeTax: 0,
      taxOnSale: 0,
      afterTaxCashFlow: operatingCashFlow,
      cumulativePreTaxCashFlow: 0,
      cumulativeAfterTaxCashFlow: 0,
      dscr: debtService > 0 ? netOperatingIncome / debtService : Number.POSITIVE_INFINITY,
    });
  }

  // ── The sale ──────────────────────────────────────────────────────────
  const forwardNoi = noiForYear(holdYears + 1);
  const grossSalePrice = a.exitCapRatePct > 0 ? forwardNoi / (a.exitCapRatePct / 100) : 0;
  const sellingCosts = Math.max(0, grossSalePrice) * (a.sellingCostsPct / 100);
  const loanPayoff = rows[rows.length - 1].loanBalanceEnd;
  const prepayPenalty = a.prepayPenaltyAtExit;
  // NO floor. A sale that does not cover the payoff is a negative number, and
  // the equity multiple has to feel it.
  const netSaleProceeds = grossSalePrice - sellingCosts - loanPayoff - prepayPenalty;

  const totalDepreciationTaken = depreciationSchedule.reduce(
    (s, d) => s + d.totalAnnualDepreciation,
    0,
  );

  let exitTax = 0;
  let gainOnSale = 0;
  let section1250Gain = 0;
  let section1245Recapture = 0;
  let appreciationGain = 0;
  if (a.tax.enabled) {
    const recapture = computeRecaptureOnSale(
      costBasis,
      a.tax.landAllocationPct,
      totalDepreciationTaken,
      Math.max(0, grossSalePrice),
      a.sellingCostsPct,
      taxProfile,
    );
    // A loss on sale generates no tax. `computeRecaptureOnSale` returns a
    // negative state figure on a negative gain; a paper loss is not a refund.
    exitTax = Math.max(0, recapture.totalTaxOnSale);
    gainOnSale = recapture.totalGainOnSale;
    section1250Gain = recapture.unrecapturedSection1250Gain;
    section1245Recapture = recapture.section1245Recapture;
    appreciationGain = recapture.appreciationGain;
  }

  const exit: ReturnsExit = {
    year: holdYears,
    forwardNoi,
    exitCapRatePct: a.exitCapRatePct,
    grossSalePrice,
    sellingCosts,
    loanPayoff,
    prepayPenalty,
    netSaleProceeds,
    totalDepreciationTaken,
    gainOnSale,
    section1250Gain,
    section1245Recapture,
    appreciationGain,
    taxOnSale: exitTax,
    netSaleProceedsAfterTax: netSaleProceeds - exitTax,
  };

  // ── Tax layer, applied to the SAME rows ───────────────────────────────
  let cumPreTax = -cashInvested;
  let cumAfterTax = -cashInvested;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (a.tax.enabled) {
      row.depreciation = depreciationSchedule[i]?.totalAnnualDepreciation ?? 0;
      // The capex reserve is a cash set-aside, not a deduction; capital work is
      // capitalised and recovered through depreciation, not expensed here.
      row.taxableIncome = row.netOperatingIncome - row.debtInterest - row.depreciation;

      const combinedRate = (a.tax.ordinaryRatePct + a.tax.stateRatePct) / 100;
      if (row.taxableIncome > 0) {
        row.incomeTax = row.taxableIncome * combinedRate;
      } else {
        // IRC §469 — a passive loss only shields other income up to the
        // allowance, which phases out between $100k and $150k MAGI.
        const pal = computePassiveLossAllowance(
          a.tax.magi,
          a.tax.filingStatus,
          a.tax.isRealEstateProfessional,
          row.taxableIncome,
        );
        row.incomeTax = pal.actualAllowableLoss * combinedRate; // negative → shield
      }
    }

    if (i === rows.length - 1) {
      row.saleProceeds = netSaleProceeds;
      row.taxOnSale = exitTax;
    }
    row.preTaxCashFlow = row.operatingCashFlow + row.saleProceeds;
    row.afterTaxCashFlow = row.preTaxCashFlow - row.incomeTax - row.taxOnSale;

    cumPreTax += row.preTaxCashFlow;
    cumAfterTax += row.afterTaxCashFlow;
    row.cumulativePreTaxCashFlow = cumPreTax;
    row.cumulativeAfterTaxCashFlow = cumAfterTax;
  }

  // ── Metrics — all read from `rows`, none recomputed ───────────────────
  const leveredCashFlows = [-cashInvested, ...rows.map((r) => r.preTaxCashFlow)];
  const afterTaxCashFlows = [-cashInvested, ...rows.map((r) => r.afterTaxCashFlow)];
  const unleveredCashFlows = [
    -costBasis,
    ...rows.map((r, i) =>
      i === rows.length - 1
        ? r.netOperatingIncome - r.capExReserve + (grossSalePrice - sellingCosts)
        : r.netOperatingIncome - r.capExReserve,
    ),
  ];

  const totalPreTaxDistributions = rows.reduce((s, r) => s + r.preTaxCashFlow, 0);
  const totalAfterTaxDistributions = rows.reduce((s, r) => s + r.afterTaxCashFlow, 0);

  const y1 = rows[0];
  const year1Noi = y1.netOperatingIncome;
  const cocs = rows.map((r) => ratio(r.operatingCashFlow, cashInvested));
  const finiteCocs = cocs.filter((v): v is number => v !== null);

  let breakEvenYear: number | null = null;
  for (const r of rows) {
    if (r.cumulativePreTaxCashFlow >= 0) {
      breakEvenYear = r.year;
      break;
    }
  }

  const metrics: ReturnsMetrics = {
    cashInvested,
    entryCapRatePct: a.purchasePrice > 0 ? (year1Noi / a.purchasePrice) * 100 : 0,
    yieldOnCostPct: costBasis > 0 ? (year1Noi / costBasis) * 100 : 0,
    debtYieldPct: loanAmount > 0 ? (year1Noi / loanAmount) * 100 : 0,
    breakEvenOccupancyPct:
      y1.grossPotentialRent > 0
        ? ((y1.operatingExpenses + y1.debtService) / y1.grossPotentialRent) * 100
        : 0,
    year1CashOnCashPct: cocs[0] === null ? null : cocs[0] * 100,
    averageCashOnCashPct:
      finiteCocs.length > 0
        ? (finiteCocs.reduce((s, v) => s + v, 0) / finiteCocs.length) * 100
        : null,
    leveredIrrPct: irrPct(leveredCashFlows),
    unleveredIrrPct: irrPct(unleveredCashFlows),
    afterTaxIrrPct: a.tax.enabled ? irrPct(afterTaxCashFlows) : null,
    equityMultiple: ratio(totalPreTaxDistributions, cashInvested),
    afterTaxEquityMultiple: a.tax.enabled ? ratio(totalAfterTaxDistributions, cashInvested) : null,
    totalPreTaxDistributions,
    totalAfterTaxDistributions,
    totalProfitPreTax: totalPreTaxDistributions - cashInvested,
    breakEvenYear,
    year1Dscr: y1.dscr,
  };

  return {
    assumptions: { ...a, holdYears, termMonths },
    acquisition,
    rows,
    exit,
    metrics,
    leveredCashFlows,
    unleveredCashFlows,
    afterTaxCashFlows,
  };
}

// ============================================================
// LEGACY ADAPTER — same signature, same shape, now schedule-derived
// ============================================================

// Part B (Track 2 / investor model) operating defaults.
const DEFAULT_VACANCY_LT_PCT = 8;
const DEFAULT_MGMT_PCT = 8;
const DEFAULT_MAINT_PCT = 5;
const DEFAULT_CAPEX_RESERVE_PCT = 5;
const DEFAULT_TURNOVER_PCT = 2;
const DEFAULT_RENT_GROWTH_PCT = 2;
const DEFAULT_EXIT_CAP_PCT = 6.5;
const DEFAULT_SELLING_COSTS_PCT = 6;

/**
 * Translate the v11 property/loan objects into `ReturnsAssumptions`, so
 * `computeReturns`, the hold matrix and the Returns page all price the same way.
 *
 * `expenseGrowthPct` is 0 here on purpose: `computeReturns` is the Part B
 * pre-tax contract consumed by `v11Runner` and the DSCR calculator, both of
 * which quote a flat-expense model. The Returns page passes its own visible,
 * user-set escalation rather than inheriting this.
 */
export function assumptionsFromV11(
  property: PropertyInputs,
  loan: LoanStructure,
  grossRentMonthly: number,
  strategy: 'LTR' | 'STR' | 'MTR',
  solvedRate: number,
  prepayPenaltyAtExit: number,
  cashInvestedOverride?: number,
): ReturnsAssumptions {
  const termYears = loan.term === '30_YR' ? 30 : loan.term === '40_YR' ? 40 : 15;
  const vacancyPct = strategy === 'STR' ? 25 : strategy === 'MTR' ? 12 : DEFAULT_VACANCY_LT_PCT;

  return {
    ...DEFAULT_RETURNS_ASSUMPTIONS,
    purchasePrice: property.purchasePrice,
    closingCostsPct: 0, // Part B carries lender/broker fees separately.
    upfrontCapExPct: 0,
    ltvPct: loan.ltv,
    ratePct: solvedRate,
    termMonths: termYears * 12,
    grossRentMonthly,
    rentGrowthPct: DEFAULT_RENT_GROWTH_PCT,
    vacancyPct,
    managementPct: DEFAULT_MGMT_PCT,
    maintenancePct: DEFAULT_MAINT_PCT,
    turnoverPct: DEFAULT_TURNOVER_PCT,
    annualTaxes: property.annualTaxes,
    annualInsurance: property.annualInsurance,
    hoaMonthly: property.hoa,
    // `floodInsurance` is MONTHLY on PropertyInputs — annualised in the schedule.
    floodInsuranceMonthly: property.floodInsurance,
    expenseGrowthPct: 0,
    capExReservePct: DEFAULT_CAPEX_RESERVE_PCT,
    holdYears: Math.max(1, Math.floor(loan.expectedHoldYears)),
    exitCapRatePct: DEFAULT_EXIT_CAP_PCT,
    sellingCostsPct: DEFAULT_SELLING_COSTS_PCT,
    prepayPenaltyAtExit,
    cashInvestedOverride,
    tax: { ...DEFAULT_TAX_ASSUMPTIONS, enabled: false },
  };
}

/**
 * Part B pre-tax returns stack + 48-cell hold matrix.
 *
 * Signature and result shape are unchanged for `v11Runner` and the DSCR
 * calculator. What changed is that every field now comes off ONE schedule, so
 * `equityMultiple` and `leveredIRR` can no longer disagree, and a losing exit
 * is reported as a loss.
 *
 * Ratio fields are `NaN` — not ±Infinity — when there is no equity to divide
 * by. NaN fails every comparison and every `Number.isFinite` guard, so it
 * cannot masquerade as a real return the way `-Infinity` did.
 */
export function computeReturns(
  property: PropertyInputs,
  loan: LoanStructure,
  grossRentMonthly: number,
  strategy: 'LTR' | 'STR' | 'MTR',
  solvedRate: number,
  prepayPenaltyAtExit: number = 0,
  cashInvestedOverride?: number,
): ReturnsResult {
  const assumptions = assumptionsFromV11(
    property,
    loan,
    grossRentMonthly,
    strategy,
    solvedRate,
    prepayPenaltyAtExit,
    cashInvestedOverride,
  );
  const schedule = buildReturnsSchedule(assumptions);
  const { metrics, exit, acquisition, rows } = schedule;

  // Yield on cost keeps the Part B definition: NOI ÷ (price + lender + broker fees).
  const totalCost = property.purchasePrice + loan.lenderFees + loan.brokerFees;
  const yieldOnCost = totalCost > 0 ? (rows[0].netOperatingIncome / totalCost) * 100 : 0;

  const holdMatrix = computeHoldMatrix(assumptions);
  const orNaN = (v: number | null) => (v === null ? Number.NaN : v);

  return {
    entryCapRate: round2(metrics.entryCapRatePct),
    yieldOnCost: round2(yieldOnCost),
    year1CashOnCash: round2(orNaN(metrics.year1CashOnCashPct)),
    debtYield: round2(metrics.debtYieldPct),
    breakEvenOccupancy: round1(metrics.breakEvenOccupancyPct),
    equityMultiple: round2(orNaN(metrics.equityMultiple)),
    leveredIRR: round1(orNaN(metrics.leveredIrrPct)),
    unleveredIRR: round1(orNaN(metrics.unleveredIrrPct)),
    exitYear: exit.year,
    exitCapRate: exit.exitCapRatePct,
    exitValue: Math.round(exit.grossSalePrice),
    exitSellingCosts: Math.round(exit.sellingCosts),
    remainingLoanBalance: Math.round(exit.loanPayoff),
    prepayPenaltyAtExit: Math.round(exit.prepayPenalty),
    netExitProceeds: Math.round(exit.netSaleProceeds),
    holdMatrix,
    capExReservePct: assumptions.capExReservePct,
    monthlyAdsBreakdown: {
      principal: Math.round(rows[0].debtPrincipal / 12),
      interest: Math.round(rows[0].debtInterest / 12),
      total: Math.round(rows[0].debtService / 12),
    },
    note:
      `One schedule, acquisition through sale. Cash invested $${Math.round(acquisition.cashInvested).toLocaleString('en-US')}. ` +
      `Operating cash flow = NOI − a ${assumptions.capExReservePct}%-of-EGI capex reserve − debt service. ` +
      `Exit priced on FORWARD NOI at a ${exit.exitCapRatePct}% cap, less ${assumptions.sellingCostsPct}% selling costs and the loan payoff; ` +
      `a shortfall carries through as a negative distribution rather than being floored at zero. ` +
      `Equity multiple and levered IRR read the same rows. Hold-matrix after-tax IRR comes from the tax engine, not a haircut on the pre-tax figure.`,
  };
}

// ============================================================
// 48-CELL HOLD MATRIX — the same schedule builder, 48 times
// ============================================================

const HOLD_PERIODS = [3, 5, 7, 10];
const EXIT_CAP_SCENARIOS = [-0.50, 0, 0.50]; // ±50 bps around base, plus base
const RENT_GROWTH_SCENARIOS = [0, 1, 2, 3];  // %

/**
 * 4 hold periods × 4 rent-growth rates × 3 exit-cap scenarios.
 *
 * Every cell rebuilds the full schedule under its own scenario, so a cell's
 * IRR, equity multiple and after-tax IRR are mutually consistent. `afterTaxIRR`
 * is a REAL after-tax IRR — depreciation, deductible mortgage interest, §469
 * passive-loss limits, §1250/§1245 recapture, LTCG and NIIT — computed by the
 * tax engine on that cell's own rows. It is no longer `leveredIRR × 0.75`.
 */
export function computeHoldMatrix(base: Partial<ReturnsAssumptions>): HoldMatrixCell[][] {
  const merged: ReturnsAssumptions = {
    ...DEFAULT_RETURNS_ASSUMPTIONS,
    ...base,
    tax: { ...DEFAULT_TAX_ASSUMPTIONS, ...(base.tax ?? {}) },
  };
  const baseExitCapPct = merged.exitCapRatePct;
  const matrix: HoldMatrixCell[][] = [];

  for (const holdYears of HOLD_PERIODS) {
    const row: HoldMatrixCell[] = [];
    for (const rentGrowth of RENT_GROWTH_SCENARIOS) {
      for (const exitCapDelta of EXIT_CAP_SCENARIOS) {
        const exitCapRatePct = baseExitCapPct + exitCapDelta;
        const cell = buildReturnsSchedule({
          ...merged,
          holdYears,
          rentGrowthPct: rentGrowth,
          exitCapRatePct,
          // The matrix is a return-shape study, so it always carries the tax
          // layer — that is what makes its after-tax column mean anything.
          tax: { ...merged.tax, enabled: true },
        });
        const m = cell.metrics;

        row.push({
          holdYears,
          rentGrowthPct: rentGrowth,
          exitCapRatePct: round2(exitCapRatePct),
          leveredIRR: m.leveredIrrPct === null ? Number.NaN : round1(m.leveredIrrPct),
          afterTaxIRR: m.afterTaxIrrPct === null ? Number.NaN : round1(m.afterTaxIrrPct),
          equityMultiple: m.equityMultiple === null ? Number.NaN : round2(m.equityMultiple),
          verdict: classifyIRR(m.leveredIrrPct, rentGrowth, exitCapDelta),
        });
      }
    }
    matrix.push(row);
  }

  return matrix;
}

function classifyIRR(
  irrPercent: number | null,
  rentGrowth: number,
  exitCapDelta: number,
): HoldMatrixCell['verdict'] {
  if (irrPercent === null) return 'BROKEN';
  const irr = irrPercent / 100;
  if (irr >= 0.15 && rentGrowth === 0) return 'ROBUST';
  if (irr >= 0.12 && rentGrowth >= 1 && exitCapDelta === 0) return 'STABLE';
  if (irr >= 0.10 && rentGrowth >= 2 && exitCapDelta === 0) return 'CONDITIONAL';
  if (irr >= 0.08 && (rentGrowth >= 3 || exitCapDelta < 0)) return 'FRAGILE';
  return 'BROKEN';
}

// ============================================================
// EXIT PROCEEDS (helper — the same arithmetic the schedule uses)
// ============================================================

export function computeExitProceeds(
  year1NOI: number,
  rentGrowthPct: number,
  holdYears: number,
  exitCapRatePct: number,
  sellingCostsPct: number,
  remainingLoanBalance: number,
  prepayPenalty: number,
): {
  exitValue: number;
  sellingCosts: number;
  netExitProceeds: number;
} {
  const exitNOI = year1NOI * Math.pow(1 + rentGrowthPct / 100, holdYears);
  const exitValue = exitCapRatePct > 0 ? exitNOI / (exitCapRatePct / 100) : 0;
  const sellingCosts = exitValue * (sellingCostsPct / 100);
  const netExitProceeds = exitValue - sellingCosts - remainingLoanBalance - prepayPenalty;
  return {
    exitValue: Math.round(exitValue),
    sellingCosts: Math.round(sellingCosts),
    netExitProceeds: Math.round(netExitProceeds),
  };
}
