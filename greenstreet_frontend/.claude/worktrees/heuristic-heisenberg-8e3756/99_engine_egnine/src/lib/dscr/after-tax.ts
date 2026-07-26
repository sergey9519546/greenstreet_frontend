// ============================================================================
// AFTER-TAX RETURNS ENGINE — v11 Parts B′ + B‴ (FIXED)
// ============================================================================
// Full after-tax computation chain:
//   - Depreciation (27.5yr straight-line, land-allocated)
//   - Bonus depreciation per OBBBA (100% for post-1/19/25 assets)
//   - Cost segregation flag ($450K+ properties)
//   - §1250 recapture (25% max on straight-line)
//   - NIIT (3.8% on passive income for MAGI > $200K/$250K)
//   - Passive Activity Loss ($25K allowance, MAGI phase-out $100K-$150K, REP)
//   - 1031 exchange alternate exit
// ============================================================================

// v15 Phase 2.4: Use unified robust IRR solver (Brent's method) from solvers-v13.
// Replaces the old local solveIrr() bisection implementation.
import { irr as robustIrr } from './solvers-v13';
// v15 Phase 6.7: Progressive marginal tax computation (replaces flat federal_bracket_pct)
import { computeMarginalTax } from './tax-tables';

export type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh';
export type ExitType = 'sell_and_pay' | 'section_1031';

export interface AfterTaxInput {
  purchase_price: number;
  land_allocation_pct: number;
  building_value: number;
  loan_amount: number;
  annual_rate_pct: number;
  amort_months: number;
  annual_noi: number;
  noi_growth_rate_pct: number;
  hold_years: number;
  exit_cap_rate_pct: number;       // MARKET cap rate for base case exit
  stress_cap_rate_pct?: number;    // Optional stress cap for sensitivity
  sale_costs_pct: number;
  federal_bracket_pct: number;
  magi: number;
  filing_status: FilingStatus;
  is_rep: boolean;
  cost_seg_elected: boolean;
  cost_seg_short_life_pct: number;
  cost_seg_study_cost: number;
  acquisition_date: string;
  exit_type: ExitType;
  annual_capex: number;
  /** v15 Phase 6.7: Optional state code for progressive marginal tax computation */
  state?: string;
}

export interface AfterTaxResult {
  annual_depreciation: number;
  building_basis: number;
  land_value: number;
  bonus_dep_pct: number;
  bonus_dep_year1: number;
  cost_seg_available: boolean;
  cost_seg_first_year_deduction: number;
  total_year1_deduction: number;
  pal_allowance: number;
  pal_suspended: number;
  after_tax_noi_year1: number;
  after_tax_cash_flow_year1: number;
  tax_shield_year1: number;
  exit_value: number;
  exit_value_stress: number | null;
  selling_costs: number;
  remaining_balance: number;
  total_depreciation_taken: number;
  section1250_recapture_tax: number;
  niit_recapture_tax: number;
  ltcg_tax: number;
  niit_ltcg_tax: number;
  total_exit_tax: number;
  after_tax_exit_proceeds: number;
  after_tax_irr: number;
  pre_tax_irr: number;
  return_grade: 'A' | 'B' | 'C' | 'D' | 'F';
  notes: string[];
}

const NIIT_THRESHOLDS: Record<FilingStatus, number> = {
  single: 200000, mfj: 250000, mfs: 125000, hoh: 200000,
};

/**
 * v15: Bonus Depreciation under OBBBA (One Big Beautiful Bill Act).
 *
 * The OBBBA PERMANENTLY restores 100% bonus depreciation for qualified
 * property acquired and placed in service after January 19, 2025.
 * This reverses the TCJA phase-down schedule.
 *
 * Key rules:
 * - Property acquired AND placed in service after Jan 19, 2025: 100%
 * - Property acquired Jan 1 – Jan 19, 2025: 40% (TCJA phase-down, transitional)
 * - Property acquired 2024: 60% (TCJA phase-down)
 * - Property acquired 2023: 80% (TCJA phase-down)
 * - Property acquired 2022: 100% (original TCJA)
 * - Binding written contract before Jan 20, 2025: subject to TCJA phase-down
 *
 * §168(k)(10) Elect-out: Taxpayers can elect to claim 40% (instead of 100%)
 * for the first tax year ending after Jan 19, 2025. Useful for NOL management
 * or state non-conformity situations.
 *
 * IRS Guidance: Notice 2026-11 provides the official rules.
 *
 * §179 update (OBBBA): Annual deduction increased from $1M to $2.5M,
 * phaseout threshold from $2M to $4M.
 */
export function getBonusDepPct(acquisitionDate: string, electOut: boolean = false): number {
  const date = new Date(acquisitionDate);
  const jan19_2025 = new Date('2025-01-19');
  const jan1_2025 = new Date('2025-01-01');
  const jan1_2024 = new Date('2024-01-01');
  const jan1_2023 = new Date('2023-01-01');
  const jan1_2022 = new Date('2022-01-01');

  // OBBBA permanent 100% for property acquired after Jan 19, 2025
  if (date > jan19_2025) {
    // §168(k)(10) elect-out: can claim 40% instead of 100%
    return electOut ? 40 : 100;
  }

  // TCJA phase-down schedule (pre-OBBBA)
  if (date >= jan1_2025 && date <= jan19_2025) return 40;  // transitional window
  if (date >= jan1_2024 && date < jan1_2025) return 60;
  if (date >= jan1_2023 && date < jan1_2024) return 80;
  if (date >= jan1_2022 && date < jan1_2023) return 100;
  return 100;  // pre-2022: 50% (TCJA era) — simplified to 100 for OBBBA permanent
}

export function calculatePalAllowance(magi: number, isRep: boolean, filingStatus: FilingStatus): number {
  if (isRep) return Infinity;
  if (filingStatus === 'mfs') {
    if (magi <= 50000) return 12500;
    if (magi < 75000) return 12500 - (magi - 50000) * 0.50;
    return 0;
  }
  if (magi <= 100000) return 25000;
  if (magi < 150000) return 25000 - (magi - 100000) * 0.50;
  return 0;
}

export function calculateAfterTax(input: AfterTaxInput): AfterTaxResult {
  const notes: string[] = [];

  // --- Depreciation ---
  const landValue = input.purchase_price * (input.land_allocation_pct / 100);
  const buildingBasis = input.purchase_price - landValue;
  const annualDepreciation = buildingBasis / 27.5;
  notes.push(`Depreciation: $${buildingBasis.toFixed(0)} building basis ÷ 27.5yr = $${annualDepreciation.toFixed(0)}/yr`);

  // --- Bonus Depreciation (OBBBA) ---
  const bonusPct = getBonusDepPct(input.acquisition_date);
  const costSegAvailable = input.purchase_price >= 450000;
  let costSegFirstYearDeduction = 0;
  let bonusDepYear1 = 0;
  if (input.cost_seg_elected && costSegAvailable) {
    const shortLifeComponents = buildingBasis * (input.cost_seg_short_life_pct / 100);
    bonusDepYear1 = shortLifeComponents * (bonusPct / 100);
    costSegFirstYearDeduction = bonusDepYear1;
    notes.push(`Cost seg: ${input.cost_seg_short_life_pct}% of building ($${shortLifeComponents.toFixed(0)}) reclassified to 5/7/15yr. Bonus dep ${bonusPct}% = $${bonusDepYear1.toFixed(0)} year 1 deduction.`);
  } else {
    notes.push(`Bonus dep: ${bonusPct}% for assets acquired after Jan 19, 2025 (OBBBA permanent).`);
  }
  const totalYear1Deduction = annualDepreciation + costSegFirstYearDeduction;

  // --- PAL ---
  const palAllowance = calculatePalAllowance(input.magi, input.is_rep, input.filing_status);
  if (palAllowance === Infinity) notes.push('PAL: Real Estate Professional status — unlimited passive loss deduction');
  else if (palAllowance > 0) notes.push(`PAL: $${palAllowance.toFixed(0)} allowance (MAGI $${input.magi.toLocaleString()})`);
  else notes.push(`PAL: $0 allowance — MAGI $${input.magi.toLocaleString()} exceeds $150K phase-out`);

  // --- After-Tax Cash Flow (Year 1) ---
  const annualDebtService = calcAnnualDebtService(input.loan_amount, input.annual_rate_pct, input.amort_months);
  const preTaxNcf = input.annual_noi - annualDebtService - input.annual_capex;
  const taxableIncome = input.annual_noi - annualDepreciation;

  // v15 Phase 6.7: When state is provided, use progressive marginal tax computation
  // instead of flat federal_bracket_pct. Falls back to flat if no state given.
  // v15 AUDIT FIX: Tax shield = tax SAVINGS from deductions, NOT total tax owed.
  // The old code used year1CombinedTax (total tax after deductions) as the shield,
  // which inverted the result — high-tax states appeared to have HIGHER after-tax CF.
  // Correct: shield = (tax on pre-deduction income) - (tax on post-deduction income)
  let year1MarginalRate: number;
  let taxShield: number;
  if (input.state) {
    const deduction = Math.min(totalYear1Deduction, Math.max(0, taxableIncome));
    const preDeductionTax = computeMarginalTax({
      taxableIncome: Math.max(0, taxableIncome),
      filingStatus: input.filing_status === 'mfj' ? 'MFJ' : 'SINGLE',
      year: new Date().getFullYear(),
      state: input.state,
    });
    const postDeductionTax = computeMarginalTax({
      taxableIncome: Math.max(0, taxableIncome - deduction),
      filingStatus: input.filing_status === 'mfj' ? 'MFJ' : 'SINGLE',
      year: new Date().getFullYear(),
      state: input.state,
    });
    year1MarginalRate = postDeductionTax.combinedMarginalRate;
    taxShield = preDeductionTax.federalTax + preDeductionTax.stateTax - postDeductionTax.federalTax - postDeductionTax.stateTax;
  } else {
    year1MarginalRate = input.federal_bracket_pct / 100;
    taxShield = Math.max(0, Math.min(totalYear1Deduction, Math.max(0, taxableIncome))) * (input.federal_bracket_pct / 100);
  }

  const afterTaxCashFlowY1 = preTaxNcf + taxShield;
  const afterTaxNoiY1 = input.annual_noi + annualDepreciation;

  // --- Exit (FIXED: use exit_cap_rate_pct = MARKET cap, not stress cap) ---
  const exitNoi = input.annual_noi * Math.pow(1 + input.noi_growth_rate_pct / 100, input.hold_years);
  const exitValue = input.exit_cap_rate_pct > 0 ? exitNoi / (input.exit_cap_rate_pct / 100) : 0;
  const sellingCosts = exitValue * (input.sale_costs_pct / 100);
  const remainingBalance = calcRemainingBalance(input.loan_amount, input.annual_rate_pct, input.amort_months, input.hold_years * 12);

  // Stress exit (optional sensitivity)
  let exitValueStress: number | null = null;
  if (input.stress_cap_rate_pct && input.stress_cap_rate_pct > 0) {
    exitValueStress = exitNoi / (input.stress_cap_rate_pct / 100);
  }

  // Total depreciation over hold
  const totalDepreciationTaken = annualDepreciation * Math.min(input.hold_years, 27.5) + costSegFirstYearDeduction;

  // §1250 recapture (25% max on straight-line)
  const section1250RecaptureTax = totalDepreciationTaken * 0.25;

  // NIIT (3.8%)
  const niitThreshold = NIIT_THRESHOLDS[input.filing_status];
  const niitApplies = input.magi > niitThreshold;
  const niitRecaptureTax = niitApplies ? totalDepreciationTaken * 0.038 : 0;

  // LTCG on appreciation
  const appreciation = exitValue - sellingCosts - input.purchase_price;
  const ltcgTax = Math.max(0, appreciation) * 0.20;
  const niitLtcgTax = niitApplies ? Math.max(0, appreciation) * 0.038 : 0;
  const totalExitTax = section1250RecaptureTax + niitRecaptureTax + ltcgTax + niitLtcgTax;

  let afterTaxExitProceeds = exitValue - sellingCosts - remainingBalance - totalExitTax;
  if (input.exit_type === 'section_1031') {
    afterTaxExitProceeds = exitValue - sellingCosts - remainingBalance;
    notes.push('1031 Exchange: Recapture and LTCG deferred.');
  }

  // --- IRR (FIXED: proper solver, not bisection floor of -0.99) ---
  const preTaxIrr = computeIrr(input, annualDebtService, exitValue, sellingCosts, remainingBalance, false, totalExitTax, afterTaxExitProceeds, annualDepreciation, input.federal_bracket_pct, palAllowance);
  const afterTaxIrr = computeIrr(input, annualDebtService, exitValue, sellingCosts, remainingBalance, true, totalExitTax, afterTaxExitProceeds, annualDepreciation, input.federal_bracket_pct, palAllowance);

  // Return grade
  let returnGrade: AfterTaxResult['return_grade'];
  if (afterTaxIrr >= 15) returnGrade = 'A';
  else if (afterTaxIrr >= 12) returnGrade = 'B';
  else if (afterTaxIrr >= 8) returnGrade = 'C';
  else if (afterTaxIrr >= 0) returnGrade = 'D';
  else returnGrade = 'F';

  if (niitApplies) notes.push(`NIIT: 3.8% applies (MAGI $${input.magi.toLocaleString()} > $${niitThreshold.toLocaleString()}). §1250 effective: 28.8%. LTCG effective: 23.8%.`);

  return {
    annual_depreciation: Math.round(annualDepreciation),
    building_basis: Math.round(buildingBasis),
    land_value: Math.round(landValue),
    bonus_dep_pct: bonusPct,
    bonus_dep_year1: Math.round(bonusDepYear1),
    cost_seg_available: costSegAvailable,
    cost_seg_first_year_deduction: Math.round(costSegFirstYearDeduction),
    total_year1_deduction: Math.round(totalYear1Deduction),
    pal_allowance: palAllowance === Infinity ? -1 : Math.round(palAllowance),
    pal_suspended: 0,
    after_tax_noi_year1: Math.round(afterTaxNoiY1),
    after_tax_cash_flow_year1: Math.round(afterTaxCashFlowY1),
    tax_shield_year1: Math.round(taxShield),
    exit_value: Math.round(exitValue),
    exit_value_stress: exitValueStress ? Math.round(exitValueStress) : null,
    selling_costs: Math.round(sellingCosts),
    remaining_balance: Math.round(remainingBalance),
    total_depreciation_taken: Math.round(totalDepreciationTaken),
    section1250_recapture_tax: Math.round(section1250RecaptureTax),
    niit_recapture_tax: Math.round(niitRecaptureTax),
    ltcg_tax: Math.round(ltcgTax),
    niit_ltcg_tax: Math.round(niitLtcgTax),
    total_exit_tax: Math.round(totalExitTax),
    after_tax_exit_proceeds: Math.round(afterTaxExitProceeds),
    after_tax_irr: Math.round(afterTaxIrr * 100) / 100,
    pre_tax_irr: Math.round(preTaxIrr * 100) / 100,
    return_grade: returnGrade,
    notes,
  };
}

// ============================================================================
// IRR SOLVER — Newton-Raphson + bisection hybrid (no -0.99 floor)
// ============================================================================
function computeIrr(
  input: AfterTaxInput,
  annualDebtService: number,
  exitValue: number,
  sellingCosts: number,
  remainingBalance: number,
  afterTax: boolean,
  totalExitTax: number,
  afterTaxExitProceeds: number,
  annualDepreciation: number,
  federalBracketPct: number,
  palAllowance: number,
): number {
  // Build cashflow array
  const cashflows: number[] = [];
  const initialInvestment = input.purchase_price - input.loan_amount;
  cashflows.push(-initialInvestment);

  for (let y = 1; y <= input.hold_years; y++) {
    const yearNoi = input.annual_noi * Math.pow(1 + input.noi_growth_rate_pct / 100, y - 1);
    const yearCf = yearNoi - annualDebtService - input.annual_capex;
    if (afterTax) {
      const taxableIncome = yearNoi - annualDepreciation;
      const shield = Math.max(0, Math.min(annualDepreciation, Math.max(0, taxableIncome))) * (federalBracketPct / 100);
      const maxShield = palAllowance === Infinity ? shield : Math.min(shield, palAllowance * (federalBracketPct / 100));
      cashflows.push(yearCf + maxShield);
    } else {
      cashflows.push(yearCf);
    }
  }

  // Exit cashflow in final year
  const exitProceeds = afterTax ? afterTaxExitProceeds : (exitValue - sellingCosts - remainingBalance);
  cashflows[cashflows.length - 1] += exitProceeds;

  // v15 Phase 2.4: Use unified IRR solver from solvers-v13 (Brent's method).
  // Returns percentage (matching old convention).
  const irrResult = robustIrr(cashflows, { initialGuess: 0.08, tolerance: 1e-10 });
  return Number.isFinite(irrResult) ? irrResult * 100 : 0;
}

// --- Helpers ---
function calcAnnualDebtService(loan: number, rate: number, amortMonths: number): number {
  if (amortMonths <= 0) return 0;
  const r = rate / 100 / 12;
  const n = amortMonths;
  if (r === 0) return (loan / n) * 12;
  const monthlyPmt = (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return monthlyPmt * 12;
}

function calcRemainingBalance(loan: number, rate: number, amortMonths: number, monthsElapsed: number): number {
  if (amortMonths <= 0) return loan;
  const r = rate / 100 / 12;
  const n = amortMonths;
  if (r === 0) return Math.max(0, loan - (loan / n) * monthsElapsed);
  const monthlyPmt = (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const remainingFactor = Math.pow(1 + r, n) - Math.pow(1 + r, monthsElapsed);
  const denominator = Math.pow(1 + r, n) - 1;
  return Math.max(0, (loan * remainingFactor) / denominator);
}
