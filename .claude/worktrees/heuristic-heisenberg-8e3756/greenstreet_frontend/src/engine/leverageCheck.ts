// ============================================================
// LEVERAGE CHECK — positive vs negative leverage
// ============================================================
// From RIDGE debt-tool (capital-stack modeling): leverage only HELPS returns
// when the asset out-yields the debt. Compare the loan constant (annual debt
// service ÷ loan) to the going-in cap rate (NOI ÷ value):
//   • cap rate > loan constant → POSITIVE leverage (borrowing amplifies return)
//   • loan constant > cap rate → NEGATIVE leverage (debt costs more than the
//     asset yields — every borrowed dollar drags the return down)
// At ~7% rates and ~4–5% residential caps, most DSCR deals sit in NEGATIVE
// leverage today: the return case rests on appreciation + paydown + tax, NOT
// cash yield. No consumer DSCR calculator surfaces this. Pure math.

export type LeverageState = "POSITIVE" | "NEUTRAL" | "NEGATIVE";

export interface LeverageResult {
  loanConstantPct: number;   // annual debt service ÷ loan, %
  capRatePct: number;        // NOI ÷ value (going-in), %
  spreadBps: number;         // (cap rate − loan constant) × 100
  state: LeverageState;
  note: string;
}

export function assessLeverage(
  annualDebtService: number,
  loanAmount: number,
  annualNOI: number,
  propertyValue: number,
): LeverageResult {
  const loanConstant = loanAmount > 0 ? (annualDebtService / loanAmount) * 100 : 0;
  const capRate = propertyValue > 0 ? (annualNOI / propertyValue) * 100 : 0;
  const spread = capRate - loanConstant;
  const spreadBps = Math.round(spread * 100);

  // ±25 bps deadband around parity reads as "neutral".
  const state: LeverageState = spread > 0.25 ? "POSITIVE" : spread < -0.25 ? "NEGATIVE" : "NEUTRAL";
  const lc = loanConstant.toFixed(2);
  const cr = capRate.toFixed(2);
  const note =
    state === "POSITIVE"
      ? `Cap rate ${cr}% > loan constant ${lc}% — positive leverage. Borrowing amplifies your return (+${Math.abs(spreadBps)} bps of spread working for you).`
      : state === "NEGATIVE"
        ? `Loan constant ${lc}% > cap rate ${cr}% — negative leverage. Your debt costs more than the property yields, so every borrowed dollar drags the return down. The case rests on appreciation, paydown, and tax — not cash yield.`
        : `Loan constant ${lc}% ≈ cap rate ${cr}% — leverage is roughly return-neutral on a cash basis.`;

  return {
    loanConstantPct: Math.round(loanConstant * 100) / 100,
    capRatePct: Math.round(capRate * 100) / 100,
    spreadBps,
    state,
    note,
  };
}
