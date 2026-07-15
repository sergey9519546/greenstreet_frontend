// ============================================================
// TCO-DSCR — Total Cost of Ownership DSCR
// ============================================================
// Single source of truth for the investor-survival (Track 2) operating-expense
// haircut. Replaces the old flat 8% vacancy + 8% mgmt + 5% maint (21%, no CapEx)
// with property-type / age / market granularity + an explicit CapEx line, per
// GAP_TCO_DSCR_FORMULA.md (§6, §8). Every Track-2 call site sources its haircut
// from `computeTcoRate` here, so there is exactly one place the assumption lives.
//
// Pure math — no React, no data feeds. After-tax uses straight-line residential
// depreciation (27.5yr) for ongoing cash-flow coverage; bonus/cost-seg/recapture
// for total-return IRR live in taxEngine.ts (OBBBA-current) and are not used here.

export type TcoPropertyType = 'SFR' | 'SMALL_MULTI' | 'MED_MULTI' | 'CONDOTEL';
export type TcoPropertyAge = 'NEW' | 'AVERAGE' | 'AGING' | 'OLD';
export type TcoMarketType = 'HOT' | 'NORMAL' | 'SLOW' | 'STRESS';

/** Base operating-cost rates as a fraction of gross rent (TCO §8.1). */
export const BASE_TCO_RATES: Record<TcoPropertyType, { management: number; maintenance: number; capex: number; vacancy: number }> = {
  SFR:         { management: 0.08, maintenance: 0.08, capex: 0.05, vacancy: 0.07 }, // 28%
  SMALL_MULTI: { management: 0.07, maintenance: 0.07, capex: 0.05, vacancy: 0.08 }, // 27%
  MED_MULTI:   { management: 0.06, maintenance: 0.06, capex: 0.04, vacancy: 0.09 }, // 25%
  CONDOTEL:    { management: 0.25, maintenance: 0.10, capex: 0.08, vacancy: 0.20 }, // 63% (STR/condotel)
};

/** Age adjustments to maintenance + capex (TCO §8.2). */
export const AGE_ADJUSTMENTS: Record<TcoPropertyAge, { maintenance: number; capex: number }> = {
  NEW:     { maintenance: -0.03, capex: -0.02 },
  AVERAGE: { maintenance: 0.00, capex: 0.00 },
  AGING:   { maintenance: 0.03, capex: 0.02 },
  OLD:     { maintenance: 0.05, capex: 0.04 },
};

/** Market adjustments to vacancy (TCO §8.3). */
export const MARKET_ADJUSTMENTS: Record<TcoMarketType, number> = {
  HOT: -0.02, NORMAL: 0.00, SLOW: 0.03, STRESS: 0.05,
};

function rounded(n: number, factor: number): number {
  const scaled = n * factor;
  if (!Number.isFinite(n) || !Number.isFinite(scaled)) {
    throw new RangeError('TCO result exceeded the supported finite calculation range.');
  }
  return Math.round(scaled) / factor;
}

function r4(n: number): number { return rounded(n, 10000); }
function r2(n: number): number { return rounded(n, 100); }
function r3(n: number): number { return rounded(n, 1000); }

function assertFiniteIntermediate(label: string, ...values: number[]): void {
  if (values.some(value => !Number.isFinite(value))) {
    throw new RangeError(`${label} exceeded the supported finite calculation range.`);
  }
}

export interface TcoRateOpts {
  propertyType?: TcoPropertyType;
  propertyAge?: TcoPropertyAge;
  marketType?: TcoMarketType;
  isSelfManaged?: boolean;
  /** Override vacancy (0–100); used by the Stress Matrix vacancy slider. */
  vacancyOverridePct?: number;
}

export interface TcoRateComponents {
  vacancy: number; management: number; maintenance: number; capex: number; total: number;
}

/**
 * The total operating-cost rate (fraction of gross rent) + its components.
 * Defaults: SFR / average age / normal market / professionally managed → 28%.
 * Self-managed caps management at the 5% implicit-labor floor (TCO §2.3).
 */
export function computeTcoRate(o: TcoRateOpts = {}): TcoRateComponents {
  const type = o.propertyType && BASE_TCO_RATES[o.propertyType] ? o.propertyType : 'SFR';
  const age = o.propertyAge && AGE_ADJUSTMENTS[o.propertyAge] ? o.propertyAge : 'AVERAGE';
  const market = o.marketType && MARKET_ADJUSTMENTS[o.marketType] !== undefined ? o.marketType : 'NORMAL';
  const base = BASE_TCO_RATES[type];
  const ageAdj = AGE_ADJUSTMENTS[age];

  const management = o.isSelfManaged ? Math.min(base.management, 0.05) : base.management;
  const maintenance = Math.max(0, base.maintenance + ageAdj.maintenance);
  const capex = Math.max(0, base.capex + ageAdj.capex);
  const vacancy = o.vacancyOverridePct !== undefined && Number.isFinite(o.vacancyOverridePct)
    ? Math.min(1, Math.max(0, o.vacancyOverridePct / 100))
    : Math.max(0.02, base.vacancy + MARKET_ADJUSTMENTS[market]);

  return {
    vacancy: r4(vacancy),
    management: r4(management),
    maintenance: r4(maintenance),
    capex: r4(capex),
    total: r4(vacancy + management + maintenance + capex),
  };
}

/** Map a deal's unit count + strategy to a TCO property type. */
export function mapToTcoType(unitCount: number, isShortTerm: boolean): TcoPropertyType {
  if (isShortTerm) return 'CONDOTEL';
  if (unitCount >= 5) return 'MED_MULTI';
  if (unitCount >= 2) return 'SMALL_MULTI';
  return 'SFR';
}

export interface TcoDscrInput {
  grossRent: number;        // monthly gross
  principalAndInterest: number; // monthly P&I
  propertyTax: number;      // monthly
  insurance: number;        // monthly
  hoa: number;              // monthly
  rateOpts?: TcoRateOpts;
  /** For after-tax: depreciable basis (price − land) and marginal rate. */
  depreciableBasis?: number;
  marginalTaxRate?: number; // default 0.24
}

export interface TcoDscrResult {
  standardDSCR: number;     // gross rent ÷ PITIA (lender Track 1)
  tcoDSCR: number;          // NOI after TCO opex ÷ PITIA (investor Track 2)
  afterTaxTcoDSCR: number;  // after-tax NOI available ÷ PITIA
  tcoGap: number;           // standardDSCR − tcoDSCR
  breakEvenRent: number;    // rent for TCO-DSCR = 1.0
  monthlyDeficit: number;   // pre-tax monthly cash flow (gross − PITIA − opex)
  rate: TcoRateComponents;
  components: { management: number; maintenance: number; capex: number; vacancy: number; total: number }; // $/mo
}

/**
 * Full TCO-DSCR for one deal (TCO §6, §7). standardDSCR is the familiar
 * lender ratio; tcoDSCR nets real operating costs; afterTaxTcoDSCR adds the
 * depreciation shield (commonly lifts a sub-1.0 pre-tax deal).
 */
export function computeTcoDscr(input: TcoDscrInput): TcoDscrResult {
  const { grossRent, principalAndInterest, propertyTax, insurance, hoa } = input;
  const required = [grossRent, principalAndInterest, propertyTax, insurance, hoa];
  if (required.some(value => !Number.isFinite(value) || value < 0)) {
    throw new RangeError('Rent and PITIA components must be finite, non-negative numbers.');
  }
  if (input.depreciableBasis !== undefined && (!Number.isFinite(input.depreciableBasis) || input.depreciableBasis < 0)) {
    throw new RangeError('Depreciable basis must be finite and non-negative.');
  }
  if (input.marginalTaxRate !== undefined && (!Number.isFinite(input.marginalTaxRate) || input.marginalTaxRate < 0 || input.marginalTaxRate > 1)) {
    throw new RangeError('Marginal tax rate must be a decimal between 0 and 1.');
  }

  const pitia = principalAndInterest + propertyTax + insurance + hoa;
  assertFiniteIntermediate('TCO PITIA', pitia);
  const rate = computeTcoRate(input.rateOpts);

  const opex = grossRent * rate.total;
  const noi = Math.max(0, grossRent - opex);
  const standardDSCR = pitia > 0 ? grossRent / pitia : 0;
  // Canonical Track 2: modeled NOI after vacancy, management, maintenance,
  // and CapEx reserves divided by the same full PITIA used by Track 1.
  const tcoDSCR = pitia > 0 ? noi / pitia : 0;
  const preTaxCF = noi - pitia;
  const breakEvenRent = rate.total < 1 ? pitia / (1 - rate.total) : 0;
  assertFiniteIntermediate('TCO pre-tax result', opex, noi, standardDSCR, tcoDSCR, preTaxCF, breakEvenRent);

  // After-tax: straight-line residential depreciation shield (TCO §7.4).
  const marginalRate = input.marginalTaxRate ?? 0.24;
  const monthlyDepreciation = input.depreciableBasis ? input.depreciableBasis / 27.5 / 12 : 0;
  const taxableIncome = preTaxCF - monthlyDepreciation;
  const taxSavings = Math.max(0, -taxableIncome) * marginalRate;
  const taxOwed = Math.max(0, taxableIncome) * marginalRate;
  const afterTaxCF = preTaxCF + taxSavings - taxOwed;
  // Preserve the canonical denominator: after-tax NOI available ÷ full PITIA.
  const afterTaxNoi = afterTaxCF + pitia;
  const afterTaxTcoDSCR = pitia > 0 ? afterTaxNoi / pitia : 0;
  assertFiniteIntermediate(
    'TCO after-tax result', monthlyDepreciation, taxableIncome, taxSavings, taxOwed,
    afterTaxCF, afterTaxNoi, afterTaxTcoDSCR,
  );

  return {
    standardDSCR: r3(standardDSCR),
    tcoDSCR: r3(tcoDSCR),
    afterTaxTcoDSCR: r3(afterTaxTcoDSCR),
    tcoGap: r3(standardDSCR - tcoDSCR),
    breakEvenRent: Math.round(breakEvenRent),
    monthlyDeficit: Math.round(preTaxCF),
    rate,
    components: {
      management: Math.round(grossRent * rate.management),
      maintenance: Math.round(grossRent * rate.maintenance),
      capex: Math.round(grossRent * rate.capex),
      vacancy: Math.round(grossRent * rate.vacancy),
      total: Math.round(opex),
    },
  };
}

/** Convert a standard-DSCR threshold to its TCO-equivalent (TCO §10.2). */
export function tcoEquivalent(standardDSCR: number, tcoRateTotal: number): number {
  return r3(standardDSCR * (1 - tcoRateTotal));
}
