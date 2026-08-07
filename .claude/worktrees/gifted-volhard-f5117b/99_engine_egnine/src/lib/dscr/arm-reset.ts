// ============================================================================
// ARM / SOFR RATE RESET ENGINE — v11 Part B″
// ============================================================================
// ARM loans carry rate-reset risk that destroys DSCR on marginal files.
// Models: SOFR index + margin, cap structure, recast payment, DSCR-at-reset,
// and the double-shock year (IO expiry + rate reset simultaneously).
// ============================================================================

import { monthlyPayment, round } from './math';

// v11 Verified June 17, 2026 anchors
export const SOFR_30D = 3.59;
export const TREASURY_5YR = 4.26;
export const TREASURY_10YR = 4.47;
export const FED_FUNDS_RATE = 3.62;
export const FED_FUNDS_TARGET = '3.50-3.75%';

export type ArmProduct = '6mo_SOFR' | '1yr_SOFR' | '5/1' | '7/1' | '10/1';

export interface ArmResetInput {
  loan_amount: number;
  initial_rate: number;          // quoted ARM rate
  arm_product: ArmProduct;
  amort_months: number;
  months_to_first_reset: number; // e.g. 60 for 5/1
  margin_bps: number;            // typically 250-350 bps over SOFR
  // Cap structure
  initial_cap_bps: number;       // +2% (200 bps) typical, some +5%
  periodic_cap_bps: number;      // +1% or +2% per period
  lifetime_cap_bps: number;      // +5% or +6% over initial
  floor_rate: number;            // usually = initial_rate
  // Property economics
  qualifying_rent: number;
  taxes_monthly: number;
  insurance_monthly: number;
  hoa_monthly: number;
  // IO
  interest_only_months: number;  // 0 = none
  // Stress
  stress_sofr: number;           // e.g. 5.0% for stress scenario
}

export interface ArmResetResult {
  // Current reset
  current_sofr: number;
  reset_rate: number;
  recast_payment: number;
  track1_at_reset: number;
  // Stress reset
  stress_reset_rate: number;
  stress_recast_payment: number;
  stress_track1_at_reset: number;
  // Double shock
  double_shock_year: number | null;
  double_shock_payment: number;
  double_shock_track1: number;
  // Cap analysis
  max_rate: number;              // initial + lifetime cap
  // Kill criterion
  breaches_floor: boolean;       // Track 1 < 1.0 at stress reset
  notes: string[];
}

export function calculateArmReset(input: ArmResetInput): ArmResetResult {
  const notes: string[] = [];

  // v12 (P2-batch-H): Compute remaining balance at reset (was using original loan_amount).
  // For a 5/1 ARM with 360mo amort, after 60 months the balance is ~94% of original.
  // Using loan_amount overstates the payment slightly and the principal paydown over time.
  const r = input.initial_rate / 100 / 12;
  const balanceAtReset = (() => {
    if (r === 0) return Math.max(0, input.loan_amount - (input.loan_amount / input.amort_months) * input.months_to_first_reset);
    const powN = Math.pow(1 + r, input.months_to_first_reset);
    const monthlyPmt = (input.loan_amount * r) / (1 - Math.pow(1 + r, -input.amort_months));
    return Math.max(0, input.loan_amount * powN - monthlyPmt * (powN - 1) / r);
  })();

  // --- Current reset ---
  const currentResetRate = Math.max(
    input.floor_rate,
    SOFR_30D + input.margin_bps / 100
  );
  const recastPayment = monthlyPayment(
    balanceAtReset,
    currentResetRate,
    Math.max(1, input.amort_months - input.months_to_first_reset)
  );
  const pitiaAtReset = recastPayment + input.taxes_monthly + input.insurance_monthly + input.hoa_monthly;
  const track1AtReset = pitiaAtReset > 0 ? input.qualifying_rent / pitiaAtReset : 0;

  // --- Stress reset (SOFR → 5.0%) ---
  const stressResetRateRaw = input.stress_sofr + input.margin_bps / 100;
  // Apply cap structure
  const maxRate = input.initial_rate + input.lifetime_cap_bps / 100;
  const stressResetRate = Math.min(stressResetRateRaw, maxRate);
  const stressRecastPayment = monthlyPayment(
    balanceAtReset,
    stressResetRate,
    Math.max(1, input.amort_months - input.months_to_first_reset)
  );
  const stressPitia = stressRecastPayment + input.taxes_monthly + input.insurance_monthly + input.hoa_monthly;
  const stressTrack1 = stressPitia > 0 ? input.qualifying_rent / stressPitia : 0;

  // --- Double shock (IO expiry + rate reset in same period) ---
  // v12 (P2-batch-H): Month-level comparison instead of ceil-year. Was missing
  // double-shocks when IO=61mo and reset=60mo (ceil rounded 61 up to year 6 but
  // 60 to year 5, so they didn't match). Now: |ioExpiry - reset| <= 12 months.
  let doubleShockYear: number | null = null;
  let doubleShockPayment = 0;
  let doubleShockTrack1 = 0;

  if (input.interest_only_months > 0) {
    const ioExpiryMonth = input.interest_only_months;
    const resetMonth = input.months_to_first_reset;
    if (Math.abs(ioExpiryMonth - resetMonth) <= 12) {
      doubleShockYear = Math.ceil(Math.max(ioExpiryMonth, resetMonth) / 12);
      // Payment jumps from IO to full amortizing at stress rate
      const ioPayment = (input.loan_amount * (input.initial_rate / 100)) / 12;
      const postRecastPmt = monthlyPayment(
        input.loan_amount,  // IO loans don't amortize during IO period, so balance = original
        stressResetRate,
        Math.max(1, input.amort_months - input.interest_only_months)
      );
      doubleShockPayment = postRecastPmt;
      const doubleShockPitia = postRecastPmt + input.taxes_monthly + input.insurance_monthly + input.hoa_monthly;
      doubleShockTrack1 = doubleShockPitia > 0 ? input.qualifying_rent / doubleShockPitia : 0;
      notes.push(`⚠️ DOUBLE-SHOCK YEAR ${doubleShockYear}: IO expires AND rate resets simultaneously. Payment jumps from $${ioPayment.toFixed(0)}/mo (IO) to $${postRecastPmt.toFixed(0)}/mo (amortizing at stress rate). Track 1 DSCR: ${doubleShockTrack1.toFixed(2)}x`);
    } else {
      const ioYear = Math.ceil(ioExpiryMonth / 12);
      const resetYr = Math.ceil(resetMonth / 12);
      notes.push(`IO expires year ${ioYear}, rate resets year ${resetYr} — no double-shock.`);
    }
  }

  // --- Kill criterion ---
  const breachesFloor = stressTrack1 < 1.0;
  if (breachesFloor) {
    notes.push(`❌ KILL CRITERION: Track 1 DSCR at stress reset = ${stressTrack1.toFixed(2)}x (below 1.0 floor). Deal fails if SOFR rises to ${input.stress_sofr}%.`);
  }

  notes.push(`Current SOFR: ${SOFR_30D}% + margin ${input.margin_bps}bps = ${currentResetRate.toFixed(3)}% reset rate`);
  notes.push(`Stress SOFR ${input.stress_sofr}% + margin = ${stressResetRateRaw.toFixed(3)}% → capped at ${stressResetRate.toFixed(3)}% (lifetime cap ${maxRate.toFixed(3)}%)`);
  notes.push(`Track 1 at current reset: ${track1AtReset.toFixed(2)}x | at stress reset: ${stressTrack1.toFixed(2)}x`);

  return {
    current_sofr: SOFR_30D,
    reset_rate: round(currentResetRate, 3),
    recast_payment: round(recastPayment),
    track1_at_reset: round(track1AtReset, 3),
    stress_reset_rate: round(stressResetRate, 3),
    stress_recast_payment: round(stressRecastPayment),
    stress_track1_at_reset: round(stressTrack1, 3),
    double_shock_year: doubleShockYear,
    double_shock_payment: round(doubleShockPayment),
    double_shock_track1: round(doubleShockTrack1, 3),
    max_rate: round(maxRate, 3),
    breaches_floor: breachesFloor,
    notes,
  };
}
