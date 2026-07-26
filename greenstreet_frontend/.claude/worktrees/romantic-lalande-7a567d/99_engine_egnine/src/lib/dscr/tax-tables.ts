// ============================================================================
// TAX TABLES — Year-versioned federal tax parameters
// ============================================================================
// Hardcoding tax thresholds in code is a maintenance nightmare — they change
// annually. This module centralizes them with explicit year indexing.
//
// Sources:
//   - IRS Rev. Proc. 2024-40 (2025 parameters)
//   - IRS Rev. Proc. 2025-XX (2026 projected — not yet finalized)
//   - OBBBA (One Big Beautiful Bill Act, 2025) — §179 changes
//   - IRS Pub 925 (PAL rules)
//   - IRS Pub 535 (QBI §199A)
//
// WARNING: 2026 values are PROJECTED — IRS hasn't published final numbers.
// Engine will flag QBI 2026 as "subject to legislative confirmation".
// ============================================================================

export interface YearTaxTable {
  year: number;
  // QBI §199A
  qbiPhaseOutStartMFJ: number;
  qbiPhaseOutEndMFJ: number;
  qbiPhaseOutStartSingle: number;
  qbiPhaseOutEndSingle: number;
  qbiMaxDeductionPct: number;  // 20% normally
  qbi2026Status: 'confirmed' | 'pending' | 'expired';

  // PAL §469
  palAllowanceActive: number;        // $25k for MAGI < $100k
  palPhaseOutStart: number;          // $100k
  palPhaseOutEnd: number;            // $150k

  // §179
  section179DeductionLimit: number;  // $1M pre-OBBBA, $2.5M post
  section179PhaseOutStart: number;   // $2M pre-OBBBA, $4M post

  // Bonus depreciation
  bonusDepreciationPct: number;  // 100% pre-2023, 80% 2023, 60% 2024, 40% 2025, 20% 2026, 0% 2027
  bonusDepreciationNote: string;

  // NIIT (Net Investment Income Tax) threshold
  niitThresholdMFJ: number;
  niitThresholdSingle: number;
  niitRate: number;  // 3.8%

  // Federal income tax brackets (married filing jointly)
  // 2025 OBBBA: extended 2017 TCJA brackets
  ordinaryBracketsMFJ: Array<{ rate: number; upTo: number }>;
  ordinaryBracketsSingle: Array<{ rate: number; upTo: number }>;

  // Standard deduction
  standardDeductionMFJ: number;
  standardDeductionSingle: number;

  // Long-term capital gains brackets (MFJ)
  ltcgBracketsMFJ: Array<{ rate: number; upTo: number }>;
}

export const TAX_TABLES: Record<number, YearTaxTable> = {
  2024: {
    year: 2024,
    qbiPhaseOutStartMFJ: 383900,
    qbiPhaseOutEndMFJ: 483900,
    qbiPhaseOutStartSingle: 191950,
    qbiPhaseOutEndSingle: 241950,
    qbiMaxDeductionPct: 0.20,
    qbi2026Status: 'confirmed',
    palAllowanceActive: 25000,
    palPhaseOutStart: 100000,
    palPhaseOutEnd: 150000,
    section179DeductionLimit: 1220000,
    section179PhaseOutStart: 3061000,
    bonusDepreciationPct: 0.60,
    bonusDepreciationNote: '60% bonus depreciation for property placed in service in 2024',
    niitThresholdMFJ: 250000,
    niitThresholdSingle: 200000,
    niitRate: 0.038,
    ordinaryBracketsMFJ: [
      { rate: 0.10, upTo: 23200 },
      { rate: 0.12, upTo: 94300 },
      { rate: 0.22, upTo: 201050 },
      { rate: 0.24, upTo: 383900 },
      { rate: 0.32, upTo: 487450 },
      { rate: 0.35, upTo: 731200 },
      { rate: 0.37, upTo: Infinity },
    ],
    ordinaryBracketsSingle: [
      { rate: 0.10, upTo: 11600 },
      { rate: 0.12, upTo: 47150 },
      { rate: 0.22, upTo: 100525 },
      { rate: 0.24, upTo: 191950 },
      { rate: 0.32, upTo: 243725 },
      { rate: 0.35, upTo: 365600 },
      { rate: 0.37, upTo: Infinity },
    ],
    standardDeductionMFJ: 29200,
    standardDeductionSingle: 14600,
    ltcgBracketsMFJ: [
      { rate: 0.00, upTo: 94050 },
      { rate: 0.15, upTo: 583750 },
      { rate: 0.20, upTo: Infinity },
    ],
  },

  2025: {
    year: 2025,
    qbiPhaseOutStartMFJ: 383900,
    qbiPhaseOutEndMFJ: 483900,
    qbiPhaseOutStartSingle: 191950,
    qbiPhaseOutEndSingle: 241950,
    qbiMaxDeductionPct: 0.20,
    qbi2026Status: 'confirmed',
    palAllowanceActive: 25000,
    palPhaseOutStart: 100000,
    palPhaseOutEnd: 150000,
    // OBBBA 2025: §179 increased to $2.5M / phaseout $4M
    section179DeductionLimit: 2500000,
    section179PhaseOutStart: 4000000,
    bonusDepreciationPct: 0.40,
    bonusDepreciationNote: '40% bonus depreciation for property placed in service in 2025 (OBBBA restored 100% phasing in)',
    niitThresholdMFJ: 250000,
    niitThresholdSingle: 200000,
    niitRate: 0.038,
    ordinaryBracketsMFJ: [
      { rate: 0.10, upTo: 23850 },
      { rate: 0.12, upTo: 96700 },
      { rate: 0.22, upTo: 206700 },
      { rate: 0.24, upTo: 394600 },
      { rate: 0.32, upTo: 501050 },
      { rate: 0.35, upTo: 751600 },
      { rate: 0.37, upTo: Infinity },
    ],
    ordinaryBracketsSingle: [
      { rate: 0.10, upTo: 11925 },
      { rate: 0.12, upTo: 48350 },
      { rate: 0.22, upTo: 103350 },
      { rate: 0.24, upTo: 197300 },
      { rate: 0.32, upTo: 250525 },
      { rate: 0.35, upTo: 375800 },
      { rate: 0.37, upTo: Infinity },
    ],
    standardDeductionMFJ: 30000,
    standardDeductionSingle: 15000,
    ltcgBracketsMFJ: [
      { rate: 0.00, upTo: 96050 },
      { rate: 0.15, upTo: 600050 },
      { rate: 0.20, upTo: Infinity },
    ],
  },

  2026: {
    year: 2026,
    // 2026 values PROJECTED — IRS hasn't published final Rev Proc
    qbiPhaseOutStartMFJ: 395000,
    qbiPhaseOutEndMFJ: 495000,
    qbiPhaseOutStartSingle: 197500,
    qbiPhaseOutEndSingle: 247500,
    qbiMaxDeductionPct: 0.20,
    // QBI §199A is currently scheduled to sunset after 2025 under TCJA,
    // but OBBBA (2025) extended it. Status: pending IRS final guidance.
    qbi2026Status: 'pending',
    palAllowanceActive: 25000,
    palPhaseOutStart: 100000,
    palPhaseOutEnd: 150000,
    // OBBBA: §179 keeps increased $2.5M / $4M
    section179DeductionLimit: 2500000,
    section179PhaseOutStart: 4000000,
    // OBBBA: 100% bonus depreciation phasing back in
    bonusDepreciationPct: 1.00,
    bonusDepreciationNote: '100% bonus depreciation restored by OBBBA for property placed in service 2025-2029 (pending final IRS guidance)',
    niitThresholdMFJ: 250000,
    niitThresholdSingle: 200000,
    niitRate: 0.038,
    ordinaryBracketsMFJ: [
      { rate: 0.10, upTo: 24500 },
      { rate: 0.12, upTo: 99400 },
      { rate: 0.22, upTo: 212500 },
      { rate: 0.24, upTo: 405500 },
      { rate: 0.32, upTo: 514800 },
      { rate: 0.35, upTo: 772950 },
      { rate: 0.37, upTo: Infinity },
    ],
    ordinaryBracketsSingle: [
      { rate: 0.10, upTo: 12250 },
      { rate: 0.12, upTo: 49700 },
      { rate: 0.22, upTo: 106250 },
      { rate: 0.24, upTo: 202750 },
      { rate: 0.32, upTo: 257400 },
      { rate: 0.35, upTo: 386475 },
      { rate: 0.37, upTo: Infinity },
    ],
    standardDeductionMFJ: 30850,
    standardDeductionSingle: 15425,
    ltcgBracketsMFJ: [
      { rate: 0.00, upTo: 98850 },
      { rate: 0.15, upTo: 617050 },
      { rate: 0.20, upTo: Infinity },
    ],
  },
};

/**
 * Get tax table for a year (falls back to nearest year if missing).
 */
export function getTaxTable(year: number = new Date().getFullYear()): YearTaxTable {
  if (TAX_TABLES[year]) return TAX_TABLES[year];
  // Find nearest year
  const years = Object.keys(TAX_TABLES).map(Number).sort((a, b) => a - b);
  for (let i = years.length - 1; i >= 0; i--) {
    if (years[i] <= year) return TAX_TABLES[years[i]];
  }
  return TAX_TABLES[years[0]];
}

// ---------------------------------------------------------------------------
// State bonus-depreciation non-conformity (partial list — full list maintenance
// is the responsibility of the tax counsel; this is a code-anchored starting point)
// ---------------------------------------------------------------------------

export interface StateTaxConformity {
  state: string;
  conformsBonusDepreciation: boolean;
  conformsQbi: boolean;            // state allows QBI on state return
  conformsSection179: boolean;
  bonusDepPctAdjustment: number;   // e.g. -1.0 = no state bonus dep; 0 = full conformity; -0.5 = 50% addback
  notes: string;
}

export const STATE_TAX_CONFORMITY: Record<string, StateTaxConformity> = {
  AL: { state: 'AL', conformsBonusDepreciation: false, conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: -1.0, notes: 'AL does not conform to federal bonus depreciation; addback required' },
  AK: { state: 'AK', conformsBonusDepreciation: true,  conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: 0,    notes: 'AK no state income tax' },
  AZ: { state: 'AZ', conformsBonusDepreciation: true,  conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: 0,    notes: 'AZ conforms to federal bonus depreciation' },
  AR: { state: 'AR', conformsBonusDepreciation: false, conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: -1.0, notes: 'AR does not conform to bonus depreciation' },
  CA: { state: 'CA', conformsBonusDepreciation: false, conformsQbi: false, conformsSection179: false, bonusDepPctAdjustment: -1.0, notes: 'CA does not conform to federal bonus depreciation or §179 above $25k' },
  CO: { state: 'CO', conformsBonusDepreciation: true,  conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: 0,    notes: 'CO conforms' },
  CT: { state: 'CT', conformsBonusDepreciation: false, conformsQbi: false, conformsSection179: false, bonusDepPctAdjustment: -1.0, notes: 'CT does not conform; addback required' },
  FL: { state: 'FL', conformsBonusDepreciation: true,  conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: 0,    notes: 'FL no state income tax (corporate only)' },
  GA: { state: 'GA', conformsBonusDepreciation: true,  conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: 0,    notes: 'GA conforms' },
  IL: { state: 'IL', conformsBonusDepreciation: false, conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: -1.0, notes: 'IL does not conform to bonus dep' },
  IN: { state: 'IN', conformsBonusDepreciation: true,  conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: 0,    notes: 'IN conforms' },
  KS: { state: 'KS', conformsBonusDepreciation: false, conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: -1.0, notes: 'KS does not conform to bonus dep' },
  KY: { state: 'KY', conformsBonusDepreciation: false, conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: -1.0, notes: 'KY does not conform to bonus dep' },
  LA: { state: 'LA', conformsBonusDepreciation: true,  conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: 0,    notes: 'LA conforms' },
  MA: { state: 'MA', conformsBonusDepreciation: false, conformsQbi: false, conformsSection179: false, bonusDepPctAdjustment: -1.0, notes: 'MA does not conform' },
  MD: { state: 'MD', conformsBonusDepreciation: true,  conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: 0,    notes: 'MD conforms' },
  MI: { state: 'MI', conformsBonusDepreciation: false, conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: -1.0, notes: 'MI does not conform to bonus dep' },
  MN: { state: 'MN', conformsBonusDepreciation: false, conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: -1.0, notes: 'MN does not conform to bonus dep' },
  MO: { state: 'MO', conformsBonusDepreciation: true,  conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: 0,    notes: 'MO conforms' },
  MS: { state: 'MS', conformsBonusDepreciation: true,  conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: 0,    notes: 'MS conforms' },
  NC: { state: 'NC', conformsBonusDepreciation: false, conformsQbi: false, conformsSection179: false, bonusDepPctAdjustment: -1.0, notes: 'NC does not conform to bonus dep or §179 above $25k' },
  NJ: { state: 'NJ', conformsBonusDepreciation: false, conformsQbi: false, conformsSection179: false, bonusDepPctAdjustment: -1.0, notes: 'NJ does not conform' },
  NV: { state: 'NV', conformsBonusDepreciation: true,  conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: 0,    notes: 'NV no state income tax' },
  NY: { state: 'NY', conformsBonusDepreciation: false, conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: -1.0, notes: 'NY does not conform to bonus dep' },
  OH: { state: 'OH', conformsBonusDepreciation: false, conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: -1.0, notes: 'OH does not conform to bonus dep' },
  OK: { state: 'OK', conformsBonusDepreciation: true,  conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: 0,    notes: 'OK conforms' },
  OR: { state: 'OR', conformsBonusDepreciation: false, conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: -1.0, notes: 'OR does not conform to bonus dep' },
  PA: { state: 'PA', conformsBonusDepreciation: false, conformsQbi: false, conformsSection179: false, bonusDepPctAdjustment: -1.0, notes: 'PA does not conform' },
  SC: { state: 'SC', conformsBonusDepreciation: true,  conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: 0,    notes: 'SC conforms' },
  TN: { state: 'TN', conformsBonusDepreciation: true,  conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: 0,    notes: 'TN conforms (no tax on wages)' },
  TX: { state: 'TX', conformsBonusDepreciation: true,  conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: 0,    notes: 'TX no state income tax' },
  UT: { state: 'UT', conformsBonusDepreciation: true,  conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: 0,    notes: 'UT conforms' },
  VA: { state: 'VA', conformsBonusDepreciation: false, conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: -1.0, notes: 'VA does not conform to bonus dep' },
  WA: { state: 'WA', conformsBonusDepreciation: true,  conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: 0,    notes: 'WA no state income tax' },
  WI: { state: 'WI', conformsBonusDepreciation: false, conformsQbi: false, conformsSection179: true,  bonusDepPctAdjustment: -1.0, notes: 'WI does not conform to bonus dep' },
};

/**
 * Get state tax conformity info (defaults to conforming for unknown states).
 */
export function getStateConformity(state: string): StateTaxConformity {
  return STATE_TAX_CONFORMITY[state.toUpperCase()] ?? {
    state: state.toUpperCase(),
    conformsBonusDepreciation: true,
    conformsQbi: false,
    conformsSection179: true,
    bonusDepPctAdjustment: 0,
    notes: 'State not in conformity database — assuming full conformity. Verify with state tax counsel.',
  };
}

// ---------------------------------------------------------------------------
// State income tax brackets (2025 tax year)
// ---------------------------------------------------------------------------
// Top 25 states by population + states where DSCR investing is common.
// Each bracket is progressive: rate applies to income WITHIN that bracket.
//
// Sources: state revenue department publications, Tax Foundation 2025.
// NOTE: These are SIMPLIFIED — many states have additional deductions,
// credits, exemptions, and special treatments for rental income. For
// production use, integrate with a tax service like Taxee.io or Avalara.
// ---------------------------------------------------------------------------

export interface StateTaxBracket {
  rate: number;       // marginal rate as decimal (0.05 = 5%)
  upTo: number;       // upper bound of this bracket (Infinity for top)
}

export type StateTaxStructure = {
  state: string;
  name: string;
  bracketsMFJ: StateTaxBracket[];   // married filing jointly
  bracketsSingle: StateTaxBracket[];
  flatRate?: number;  // for flat-tax states (PA, IL, etc.)
  notes?: string;
};

// No state income tax
const NO_TAX: StateTaxStructure = {
  state: 'NONE',
  name: 'No state income tax',
  bracketsMFJ: [{ rate: 0, upTo: Infinity }],
  bracketsSingle: [{ rate: 0, upTo: Infinity }],
};

export const STATE_TAX_TABLES_2025: Record<string, StateTaxStructure> = {
  // No-tax states
  AK: { ...NO_TAX, state: 'AK', name: 'Alaska' },
  FL: { ...NO_TAX, state: 'FL', name: 'Florida' },
  NV: { ...NO_TAX, state: 'NV', name: 'Nevada' },
  NH: { ...NO_TAX, state: 'NH', name: 'New Hampshire (no wage tax)' },
  SD: { ...NO_TAX, state: 'SD', name: 'South Dakota' },
  TN: { ...NO_TAX, state: 'TN', name: 'Tennessee (no wage tax)' },
  TX: { ...NO_TAX, state: 'TX', name: 'Texas' },
  WA: { ...NO_TAX, state: 'WA', name: 'Washington (no wage tax; capital gains taxed)' },
  WY: { ...NO_TAX, state: 'WY', name: 'Wyoming' },

  // Flat-tax states
  PA: { state: 'PA', name: 'Pennsylvania', flatRate: 0.0307,
    bracketsMFJ: [{ rate: 0.0307, upTo: Infinity }],
    bracketsSingle: [{ rate: 0.0307, upTo: Infinity }],
    notes: 'PA flat 3.07% + local wage tax (1-3% typical). No preferential capital gains rate.' },
  IL: { state: 'IL', name: 'Illinois', flatRate: 0.0495,
    bracketsMFJ: [{ rate: 0.0495, upTo: Infinity }],
    bracketsSingle: [{ rate: 0.0495, upTo: Infinity }],
    notes: 'IL flat 4.95%.' },
  IN: { state: 'IN', name: 'Indiana', flatRate: 0.0305,
    bracketsMFJ: [{ rate: 0.0305, upTo: Infinity }],
    bracketsSingle: [{ rate: 0.0305, upTo: Infinity }],
    notes: 'IN flat 3.05%.' },
  MI: { state: 'MI', name: 'Michigan', flatRate: 0.0425,
    bracketsMFJ: [{ rate: 0.0425, upTo: Infinity }],
    bracketsSingle: [{ rate: 0.0425, upTo: Infinity }],
    notes: 'MI flat 4.25%.' },
  CO: { state: 'CO', name: 'Colorado', flatRate: 0.044,
    bracketsMFJ: [{ rate: 0.044, upTo: Infinity }],
    bracketsSingle: [{ rate: 0.044, upTo: Infinity }],
    notes: 'CO flat 4.40% of federal taxable income.' },
  UT: { state: 'UT', name: 'Utah', flatRate: 0.0455,
    bracketsMFJ: [{ rate: 0.0455, upTo: Infinity }],
    bracketsSingle: [{ rate: 0.0455, upTo: Infinity }],
    notes: 'UT flat 4.55%.' },
  NC: { state: 'NC', name: 'North Carolina', flatRate: 0.0425,
    bracketsMFJ: [{ rate: 0.0425, upTo: Infinity }],
    bracketsSingle: [{ rate: 0.0425, upTo: Infinity }],
    notes: 'NC flat 4.25%.' },
  KY: { state: 'KY', name: 'Kentucky', flatRate: 0.04,
    bracketsMFJ: [{ rate: 0.04, upTo: Infinity }],
    bracketsSingle: [{ rate: 0.04, upTo: Infinity }],
    notes: 'KY flat 4.00%.' },
  GA: { state: 'GA', name: 'Georgia', flatRate: 0.0539,
    bracketsMFJ: [{ rate: 0.0539, upTo: Infinity }],
    bracketsSingle: [{ rate: 0.0539, upTo: Infinity }],
    notes: 'GA flat 5.39% (2025, transitioning to 5.39% flat from prior progressive).' },

  // Progressive-tax states (top rates shown for reference)
  CA: { state: 'CA', name: 'California',
    bracketsMFJ: [
      { rate: 0.01, upTo: 19156 },
      { rate: 0.02, upTo: 45497 },
      { rate: 0.04, upTo: 71776 },
      { rate: 0.06, upTo: 99904 },
      { rate: 0.08, upTo: 250765 },
      { rate: 0.093, upTo: 343784 },
      { rate: 0.103, upTo: 576822 },
      { rate: 0.113, upTo: 1000000 },
      { rate: 0.123, upTo: Infinity },
    ],
    bracketsSingle: [
      { rate: 0.01, upTo: 9578 },
      { rate: 0.02, upTo: 22749 },
      { rate: 0.04, upTo: 35888 },
      { rate: 0.06, upTo: 49952 },
      { rate: 0.08, upTo: 250765 },
      { rate: 0.093, upTo: 343784 },
      { rate: 0.103, upTo: 576822 },
      { rate: 0.113, upTo: 1000000 },
      { rate: 0.123, upTo: Infinity },
    ],
    notes: 'CA top rate 12.3% (over $1M). No preferential capital gains rate. Add 1% mental health tax on income over $1M.' },
  NY: { state: 'NY', name: 'New York',
    bracketsMFJ: [
      { rate: 0.04, upTo: 17150 },
      { rate: 0.045, upTo: 23600 },
      { rate: 0.0525, upTo: 27900 },
      { rate: 0.055, upTo: 43400 },
      { rate: 0.06, upTo: 89550 },
      { rate: 0.0685, upTo: 215400 },
      { rate: 0.0965, upTo: 1077550 },
      { rate: 0.103, upTo: 5000000 },
      { rate: 0.109, upTo: 25000000 },
      { rate: 0.1070, upTo: Infinity },
    ],
    bracketsSingle: [
      { rate: 0.04, upTo: 8500 },
      { rate: 0.045, upTo: 11700 },
      { rate: 0.0525, upTo: 13900 },
      { rate: 0.055, upTo: 21500 },
      { rate: 0.06, upTo: 80650 },
      { rate: 0.0685, upTo: 215400 },
      { rate: 0.0965, upTo: 1077550 },
      { rate: 0.103, upTo: 5000000 },
      { rate: 0.109, upTo: 25000000 },
      { rate: 0.1070, upTo: Infinity },
    ],
    notes: 'NY top rate 10.70%. NYC residents add 2.9-3.876% city tax. Yonkers residents add 16.5% of state tax.' },
  NJ: { state: 'NJ', name: 'New Jersey',
    bracketsMFJ: [
      { rate: 0.014, upTo: 20000 },
      { rate: 0.0175, upTo: 50000 },
      { rate: 0.0245, upTo: 70000 },
      { rate: 0.035, upTo: 80000 },
      { rate: 0.05525, upTo: 150000 },
      { rate: 0.0637, upTo: 500000 },
      { rate: 0.0897, upTo: 1000000 },
      { rate: 0.1075, upTo: Infinity },
    ],
    bracketsSingle: [
      { rate: 0.014, upTo: 20000 },
      { rate: 0.0175, upTo: 35000 },
      { rate: 0.035, upTo: 40000 },
      { rate: 0.0553, upTo: 75000 },
      { rate: 0.0637, upTo: 500000 },
      { rate: 0.0897, upTo: 1000000 },
      { rate: 0.1075, upTo: Infinity },
    ],
    notes: 'NJ top rate 10.75%.' },
  OR: { state: 'OR', name: 'Oregon',
    bracketsMFJ: [
      { rate: 0.0475, upTo: 10200 },
      { rate: 0.0675, upTo: 25500 },
      { rate: 0.0875, upTo: 325200 },
      { rate: 0.099, upTo: Infinity },
    ],
    bracketsSingle: [
      { rate: 0.0475, upTo: 4100 },
      { rate: 0.0675, upTo: 10250 },
      { rate: 0.0875, upTo: 125000 },
      { rate: 0.099, upTo: Infinity },
    ],
    notes: 'OR top rate 9.9%.' },
  MN: { state: 'MN', name: 'Minnesota',
    bracketsMFJ: [
      { rate: 0.0535, upTo: 34690 },
      { rate: 0.068, upTo: 137450 },
      { rate: 0.0785, upTo: 256430 },
      { rate: 0.0985, upTo: Infinity },
    ],
    bracketsSingle: [
      { rate: 0.0535, upTo: 17340 },
      { rate: 0.068, upTo: 68710 },
      { rate: 0.0785, upTo: 128210 },
      { rate: 0.0985, upTo: Infinity },
    ],
    notes: 'MN top rate 9.85%.' },
  WI: { state: 'WI', name: 'Wisconsin',
    bracketsMFJ: [
      { rate: 0.0354, upTo: 16050 },
      { rate: 0.0465, upTo: 31910 },
      { rate: 0.053, upTo: 350660 },
      { rate: 0.0765, upTo: Infinity },
    ],
    bracketsSingle: [
      { rate: 0.0354, upTo: 11070 },
      { rate: 0.0465, upTo: 22010 },
      { rate: 0.053, upTo: 175330 },
      { rate: 0.0765, upTo: Infinity },
    ],
    notes: 'WI top rate 7.65%.' },
  MO: { state: 'MO', name: 'Missouri',
    bracketsMFJ: [
      { rate: 0.0200, upTo: 10000 },
      { rate: 0.0250, upTo: 20000 },
      { rate: 0.0300, upTo: 30000 },
      { rate: 0.0350, upTo: 40000 },
      { rate: 0.0400, upTo: 50000 },
      { rate: 0.0450, upTo: 60000 },
      { rate: 0.0500, upTo: Infinity },
    ],
    bracketsSingle: [
      { rate: 0.0200, upTo: 5000 },
      { rate: 0.0250, upTo: 10000 },
      { rate: 0.0300, upTo: 15000 },
      { rate: 0.0350, upTo: 20000 },
      { rate: 0.0400, upTo: 25000 },
      { rate: 0.0450, upTo: 30000 },
      { rate: 0.0500, upTo: Infinity },
    ],
    notes: 'MO top rate 5.0%.' },
  VA: { state: 'VA', name: 'Virginia',
    bracketsMFJ: [
      { rate: 0.02, upTo: 3000 },
      { rate: 0.03, upTo: 5000 },
      { rate: 0.05, upTo: 17000 },
      { rate: 0.0575, upTo: Infinity },
    ],
    bracketsSingle: [
      { rate: 0.02, upTo: 3000 },
      { rate: 0.03, upTo: 5000 },
      { rate: 0.05, upTo: 17000 },
      { rate: 0.0575, upTo: Infinity },
    ],
    notes: 'VA top rate 5.75%.' },
  OH: { state: 'OH', name: 'Ohio',
    bracketsMFJ: [
      { rate: 0.0282, upTo: 26450 },
      { rate: 0.03226, upTo: 52850 },
      { rate: 0.03688, upTo: 105700 },
      { rate: 0.0399, upTo: Infinity },
    ],
    bracketsSingle: [
      { rate: 0.0282, upTo: 13250 },
      { rate: 0.03226, upTo: 26450 },
      { rate: 0.03688, upTo: 52850 },
      { rate: 0.0399, upTo: Infinity },
    ],
    notes: 'OH top rate 3.99%. Plus school district income tax (0.5-2%).' },
  AZ: { state: 'AZ', name: 'Arizona', flatRate: 0.025,
    bracketsMFJ: [{ rate: 0.025, upTo: Infinity }],
    bracketsSingle: [{ rate: 0.025, upTo: Infinity }],
    notes: 'AZ flat 2.5% (2025).' },
  MA: { state: 'MA', name: 'Massachusetts', flatRate: 0.05,
    bracketsMFJ: [{ rate: 0.05, upTo: Infinity }],
    bracketsSingle: [{ rate: 0.05, upTo: Infinity }],
    notes: 'MA flat 5% on earned income + 4% on short-term cap gains + 9% on long-term cap gains over $1M (2025).' },
  CT: { state: 'CT', name: 'Connecticut',
    bracketsMFJ: [
      { rate: 0.0200, upTo: 12000 },
      { rate: 0.0300, upTo: 100000 },
      { rate: 0.0500, upTo: 200000 },
      { rate: 0.0550, upTo: 250000 },
      { rate: 0.0600, upTo: 350000 },
      { rate: 0.0650, upTo: 500000 },
      { rate: 0.0699, upTo: Infinity },
    ],
    bracketsSingle: [
      { rate: 0.0200, upTo: 10000 },
      { rate: 0.0300, upTo: 50000 },
      { rate: 0.0500, upTo: 100000 },
      { rate: 0.0550, upTo: 150000 },
      { rate: 0.0600, upTo: 250000 },
      { rate: 0.0650, upTo: 500000 },
      { rate: 0.0699, upTo: Infinity },
    ],
    notes: 'CT top rate 6.99%.' },
  MD: { state: 'MD', name: 'Maryland',
    bracketsMFJ: [
      { rate: 0.0200, upTo: 1000 },
      { rate: 0.0300, upTo: 2000 },
      { rate: 0.0400, upTo: 3000 },
      { rate: 0.0475, upTo: 150000 },
      { rate: 0.0500, upTo: 175000 },
      { rate: 0.0525, upTo: 225000 },
      { rate: 0.0550, upTo: 300000 },
      { rate: 0.0575, upTo: Infinity },
    ],
    bracketsSingle: [
      { rate: 0.0200, upTo: 1000 },
      { rate: 0.0300, upTo: 2000 },
      { rate: 0.0400, upTo: 3000 },
      { rate: 0.0475, upTo: 100000 },
      { rate: 0.0500, upTo: 125000 },
      { rate: 0.0525, upTo: 150000 },
      { rate: 0.0550, upTo: 250000 },
      { rate: 0.0575, upTo: Infinity },
    ],
    notes: 'MD top rate 5.75% + local county tax 2.25-3.2%.' },
  LA: { state: 'LA', name: 'Louisiana',
    bracketsMFJ: [
      { rate: 0.0185, upTo: 12500 },
      { rate: 0.0212, upTo: 50000 },
      { rate: 0.0245, upTo: Infinity },
    ],
    bracketsSingle: [
      { rate: 0.0185, upTo: 12500 },
      { rate: 0.0212, upTo: 50000 },
      { rate: 0.0245, upTo: Infinity },
    ],
    notes: 'LA top rate 2.45% (recently reduced).' },
};

/**
 * Get state tax table. Returns flat 5% fallback for unknown states.
 */
export function getStateTaxTable(state: string): StateTaxStructure {
  const upper = state.toUpperCase();
  if (STATE_TAX_TABLES_2025[upper]) return STATE_TAX_TABLES_2025[upper];
  // Fallback: 5% flat (was the previous default)
  return {
    state: upper,
    name: `${upper} (assumed 5% flat — not in state tax database)`,
    flatRate: 0.05,
    bracketsMFJ: [{ rate: 0.05, upTo: Infinity }],
    bracketsSingle: [{ rate: 0.05, upTo: Infinity }],
    notes: 'State not in 2025 tax database — assuming flat 5%. Verify with state tax counsel.',
  };
}

/**
 * Compute state income tax using progressive brackets.
 */
function computeStateTax(taxableIncome: number, brackets: StateTaxBracket[]): { tax: number; marginalRate: number } {
  let tax = 0;
  let prevCap = 0;
  let marginalRate = 0;
  for (const bracket of brackets) {
    if (taxableIncome > prevCap) {
      const taxableInBracket = Math.min(taxableIncome, bracket.upTo) - prevCap;
      tax += taxableInBracket * bracket.rate;
      marginalRate = bracket.rate;
      prevCap = bracket.upTo;
    } else break;
  }
  return { tax, marginalRate };
}

// ---------------------------------------------------------------------------
// Marginal tax rate computation
// ---------------------------------------------------------------------------

export type FilingStatus = 'MFJ' | 'SINGLE' | 'HOH' | 'MFS';

export interface MarginalTaxInputs {
  taxableIncome: number;
  filingStatus: FilingStatus;
  year?: number;
  /** State (for state tax) — optional */
  state?: string;
  /** Long-term capital gains included in taxableIncome */
  ltcg?: number;
}

export interface MarginalTaxResult {
  federalMarginalRate: number;
  federalEffectiveRate: number;
  federalTax: number;
  ltcgMarginalRate: number;
  niitApplies: boolean;
  niitAmount: number;
  stateMarginalRate: number;
  stateTax: number;
  combinedMarginalRate: number;
  combinedEffectiveRate: number;
}

/**
 * Compute marginal and effective tax rates for a given income.
 *
 * Used by after-tax IRR for period-by-period marginal rate calculations
 * (replaces the flat-tax assumption).
 *
 * State rates are simplified — using flat ~5% for known-tax states, 0 for
 * no-tax states. Production should use state-specific bracket tables.
 */
export function computeMarginalTax(input: MarginalTaxInputs): MarginalTaxResult {
  const year = input.year ?? new Date().getFullYear();
  const table = getTaxTable(year);
  const brackets = input.filingStatus === 'MFJ'
    ? table.ordinaryBracketsMFJ
    : input.filingStatus === 'SINGLE' || input.filingStatus === 'MFS'
    ? table.ordinaryBracketsSingle
    : table.ordinaryBracketsMFJ;  // HOH approximation

  // Federal ordinary income tax (progressive brackets)
  let fedTax = 0;
  let prevCap = 0;
  let marginalRate = 0;
  for (const bracket of brackets) {
    if (input.taxableIncome > prevCap) {
      const taxableInBracket = Math.min(input.taxableIncome, bracket.upTo) - prevCap;
      fedTax += taxableInBracket * bracket.rate;
      marginalRate = bracket.rate;
      prevCap = bracket.upTo;
    } else break;
  }

  // LTCG tax (separate brackets — assume stacked on top of ordinary income)
  const ltcg = input.ltcg ?? 0;
  let ltcgTax = 0;
  let ltcgMarginalRate = 0;
  if (ltcg > 0) {
    const ltcgBrackets = table.ltcgBracketsMFJ;
    // Ordinary income fills lower brackets first
    let remainingLtcgBracket = ltcgBrackets[0].upTo - input.taxableIncome;
    let ltcgRemaining = ltcg;
    let ltcgBracketIdx = 0;
    while (ltcgRemaining > 0 && ltcgBracketIdx < ltcgBrackets.length) {
      const bracket = ltcgBrackets[ltcgBracketIdx];
      if (remainingLtcgBracket > 0) {
        const taxableInBracket = Math.min(ltcgRemaining, remainingLtcgBracket);
        ltcgTax += taxableInBracket * bracket.rate;
        ltcgMarginalRate = bracket.rate;
        ltcgRemaining -= taxableInBracket;
      }
      ltcgBracketIdx++;
      remainingLtcgBracket = ltcgBrackets[ltcgBracketIdx]
        ? ltcgBrackets[ltcgBracketIdx].upTo - ltcgBrackets[ltcgBracketIdx - 1].upTo
        : Infinity;
    }
  }

  // NIIT (3.8% on investment income above threshold)
  const niitThreshold = input.filingStatus === 'MFJ'
    ? table.niitThresholdMFJ
    : table.niitThresholdSingle;
  const magi = input.taxableIncome + ltcg;  // simplified
  const niitApplies = magi > niitThreshold && ltcg > 0;
  const niitAmount = niitApplies ? ltcg * table.niitRate : 0;

  // State tax — uses progressive bracket tables for known states
  const stateTable = input.state ? getStateTaxTable(input.state) : null;
  const stateBrackets = stateTable
    ? (input.filingStatus === 'MFJ' ? stateTable.bracketsMFJ : stateTable.bracketsSingle)
    : [{ rate: 0.05, upTo: Infinity }];
  const stateResult = computeStateTax(input.taxableIncome, stateBrackets);
  const stateRate = stateResult.marginalRate;
  const stateTax = stateResult.tax;

  const combinedMarginalRate = marginalRate + (niitApplies ? table.niitRate : 0) + stateRate;
  const totalTax = fedTax + ltcgTax + niitAmount + stateTax;
  const totalIncome = input.taxableIncome + ltcg;

  return {
    federalMarginalRate: marginalRate,
    federalEffectiveRate: totalIncome > 0 ? fedTax / totalIncome : 0,
    federalTax: fedTax,
    ltcgMarginalRate,
    niitApplies,
    niitAmount,
    stateMarginalRate: stateRate,
    stateTax,
    combinedMarginalRate,
    combinedEffectiveRate: totalIncome > 0 ? totalTax / totalIncome : 0,
  };
}

// ---------------------------------------------------------------------------
// BRRRR seasoning-aware cash-out modeling
// ---------------------------------------------------------------------------

export interface BrrrrRefiInputs {
  purchasePrice: number;
  rehabCost: number;
  arv: number;              // After-Repair Value
  monthsSincePurchase: number;
  maxLtvPct: number;        // LTV cap (default 75)
  /** Original loan balance at purchase */
  originalLoanBalance: number;
  /** Cumulative cash invested during rehab */
  cashInvested: number;
}

export interface BrrrrRefiResult {
  /** Basis used for refi: cost basis early, ARV later */
  refiBasis: number;
  /** Refi basis source: 'cost' | 'blend' | 'arv' */
  refiBasisSource: 'cost' | 'blend' | 'arv';
  /** Max cash-out at refi */
  maxCashOut: number;
  /** Cash left in deal after refi */
  cashLeftInDeal: number;
  /** True BRRRR success = full cash extraction */
  fullCashOut: boolean;
  /** Optimal refi month (estimate based on seasoning curve) */
  optimalRefiMonth: number;
}

/**
 * BRRRR seasoning-aware cash-out modeling.
 *
 * Lender seasoning rules (typical):
 *   0-6 months:   cost basis × LTV cap (no ARV recognition)
 *   6-12 months:  max(cost basis, ARV × 70%) × LTV cap (blended)
 *   12+ months:   ARV × LTV cap (full ARV recognition)
 *
 * @returns refi parameters and cash-out amounts
 */
export function brrrrRefiAnalysis(input: BrrrrRefiInputs): BrrrrRefiResult {
  const costBasis = input.purchasePrice + input.rehabCost;
  let refiBasis: number;
  let refiBasisSource: 'cost' | 'blend' | 'arv';

  if (input.monthsSincePurchase < 6) {
    refiBasis = costBasis;
    refiBasisSource = 'cost';
  } else if (input.monthsSincePurchase < 12) {
    refiBasis = Math.max(costBasis, input.arv * 0.70);
    refiBasisSource = 'blend';
  } else {
    refiBasis = input.arv;
    refiBasisSource = 'arv';
  }

  const maxLoanAmount = (refiBasis * input.maxLtvPct) / 100;
  const maxCashOut = Math.max(0, maxLoanAmount - input.originalLoanBalance);
  const cashLeftInDeal = Math.max(0, input.cashInvested - maxCashOut);
  const fullCashOut = maxCashOut >= input.cashInvested;

  // Optimal refi month: 12 (full ARV recognition) unless cost basis already gives full cash-out
  const optimalRefiMonth = cashLeftInDeal === 0 ? input.monthsSincePurchase : 12;

  return {
    refiBasis,
    refiBasisSource,
    maxCashOut,
    cashLeftInDeal,
    fullCashOut,
    optimalRefiMonth,
  };
}

// ---------------------------------------------------------------------------
// Pareto-frontier lender matching (multi-objective)
// ---------------------------------------------------------------------------

export interface LenderObjectives {
  rate: number;       // lower is better
  fees: number;       // lower is better
  pppNpv: number;     // lower is better (cost of prepay penalty)
  dscrBuffer: number; // higher is better
}

export interface ParetoLender {
  id: string;
  name: string;
  objectives: LenderObjectives;
  /** True if this lender is non-dominated (on the Pareto frontier) */
  isParetoOptimal: boolean;
  /** Lenders that dominate this one (empty = Pareto optimal) */
  dominatedBy: string[];
}

/**
 * Compute Pareto frontier of lenders.
 *
 * A lender A dominates lender B if A is at least as good as B on ALL objectives
 * and strictly better on at least one.
 *
 * Pareto-optimal lenders = those not dominated by any other lender.
 * Output: list with isParetoOptimal flag set, dominatedBy populated.
 *
 * @param lenders - array of {id, name, objectives}
 */
export function paretoFrontierLenders(
  lenders: Array<{ id: string; name: string; objectives: LenderObjectives }>
): ParetoLender[] {
  const result: ParetoLender[] = lenders.map(l => ({
    ...l,
    isParetoOptimal: true,
    dominatedBy: [] as string[],
  }));

  for (let i = 0; i < lenders.length; i++) {
    for (let j = 0; j < lenders.length; j++) {
      if (i === j) continue;
      const a = lenders[i].objectives;
      const b = lenders[j].objectives;

      // Does lender j dominate lender i?
      // j dominates i if j is at least as good on all objectives and strictly better on at least one
      const rateBetterOrEqual = b.rate <= a.rate;
      const feesBetterOrEqual = b.fees <= a.fees;
      const pppBetterOrEqual  = b.pppNpv <= a.pppNpv;
      const dscrBetterOrEqual = b.dscrBuffer >= a.dscrBuffer;

      const allBetterOrEqual = rateBetterOrEqual && feesBetterOrEqual && pppBetterOrEqual && dscrBetterOrEqual;
      const atLeastOneStrictlyBetter =
        b.rate < a.rate || b.fees < a.fees || b.pppNpv < a.pppNpv || b.dscrBuffer > a.dscrBuffer;

      if (allBetterOrEqual && atLeastOneStrictlyBetter) {
        result[i].isParetoOptimal = false;
        result[i].dominatedBy.push(lenders[j].id);
      }
    }
  }

  return result;
}
