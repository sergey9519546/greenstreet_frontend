// ============================================================
// LOSS-FRAMED RISK COMMUNICATION
// ============================================================
// Behavioral finance (INNOVATION_BEHAVIORAL_FINANCE §3): a DSCR ratio is
// abstract; people are ~2x more sensitive to a concrete dollar loss. Translate
// canonical shocks into "what you'd pay out of pocket" so the risk is visceral.
//
// Pure math — no data feeds, no React. Mirrors the lender-basis DSCR used
// across the deal tools (gross rent ÷ PITIA).

export interface LossFramingInput {
  /** Monthly gross rent (qualifying). */
  monthlyRent: number;
  /** Full monthly payment P+I+T+I+HOA. */
  monthlyPITIA: number;
  /** Monthly taxes (for tax-shock decomposition). */
  monthlyTax: number;
  /** Monthly insurance (for insurance-shock decomposition). */
  monthlyInsurance: number;
}

export interface LossScenario {
  /** Short label, e.g. "Rent −5%". */
  label: string;
  /** DSCR after the shock (rent ÷ PITIA basis). */
  newDSCR: number;
  /** Monthly cash flow after the shock (rent − PITIA); negative = bleeding. */
  monthlyCashFlow: number;
  /** Out-of-pocket per month if cash flow is negative (0 otherwise). */
  monthlyShortfall: number;
  /** monthlyShortfall × 12 — the annual subsidy from savings. */
  annualOutOfPocket: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function scenario(label: string, newRent: number, newPITIA: number): LossScenario {
  const newDSCR = newPITIA > 0 ? newRent / newPITIA : 0;
  const cashFlow = newRent - newPITIA;
  const shortfall = Math.max(0, -cashFlow);
  return {
    label,
    newDSCR: round3(newDSCR),
    monthlyCashFlow: Math.round(cashFlow),
    monthlyShortfall: Math.round(shortfall),
    annualOutOfPocket: Math.round(shortfall * 12),
  };
}

/**
 * Canonical downside scenarios, each framed as a dollar shortfall.
 * Shocks chosen from the edge-case research (rent declines, insurance surge,
 * tax reassessment, a vacancy month).
 */
export function computeLossScenarios(input: LossFramingInput): LossScenario[] {
  const { monthlyRent, monthlyPITIA, monthlyTax, monthlyInsurance } = input;
  if (monthlyRent <= 0 || monthlyPITIA <= 0) return [];

  return [
    scenario('Rent −5%', monthlyRent * 0.95, monthlyPITIA),
    scenario('Rent −10%', monthlyRent * 0.90, monthlyPITIA),
    // Insurance +30% (a single hard-market renewal) — only PITIA moves.
    scenario('Insurance +30%', monthlyRent, monthlyPITIA + monthlyInsurance * 0.30),
    // Tax reassessment +25% (purchase-year reset proxy).
    scenario('Tax reassess +25%', monthlyRent, monthlyPITIA + monthlyTax * 0.25),
    // One vacant month spread across the year ≈ 8.3% effective-rent haircut.
    scenario('1 vacant month', monthlyRent * (1 - 1 / 12), monthlyPITIA),
  ];
}

export interface ExpenseBreakeven {
  /** Monthly insurance at which DSCR hits 1.00 (others held). */
  maxMonthlyInsurance: number;
  /** Monthly taxes at which DSCR hits 1.00 (others held). */
  maxMonthlyTax: number;
}

/**
 * Standalone insurance / tax break-even (Edge App. A) — the expense level at
 * which DSCR falls to 1.00, holding everything else. Complements the existing
 * rent/rate/price/LTV break-evens in sensitivity.ts.
 *
 * At DSCR=1.0: rent = P&I + tax + insurance + hoa. Solve for one, hold the rest.
 */
export function computeExpenseBreakeven(
  monthlyRent: number,
  monthlyPI: number,
  monthlyTax: number,
  monthlyInsurance: number,
  monthlyHOA: number,
): ExpenseBreakeven {
  // Insurance headroom = rent − (everything except insurance).
  const maxIns = monthlyRent - monthlyPI - monthlyTax - monthlyHOA;
  const maxTax = monthlyRent - monthlyPI - monthlyInsurance - monthlyHOA;
  return {
    maxMonthlyInsurance: round2(Math.max(0, maxIns)),
    maxMonthlyTax: round2(Math.max(0, maxTax)),
  };
}
