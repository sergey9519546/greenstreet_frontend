// ============================================================================
// Financial math utilities
// ============================================================================
// Strict, defensive math helpers. These functions DO NOT silently swallow
// NaN / Infinity — they propagate or throw so callers can detect invalid
// inputs. Use `safeNum()` only at display boundaries.
// ============================================================================

/**
 * Standard amortizing monthly payment.
 * @param principal loan amount (must be > 0)
 * @param annualRatePct annual interest rate in percent (e.g. 7.5 = 7.5%)
 * @param amortMonths amortization term in months (must be > 0)
 * @throws Error if principal or term is non-positive, or rate is negative
 */
export function monthlyPayment(
  principal: number,
  annualRatePct: number,
  amortMonths: number
): number {
  if (!Number.isFinite(principal) || !Number.isFinite(annualRatePct) || !Number.isFinite(amortMonths)) {
    return 0;
  }
  if (principal < 0) {
    throw new Error(`monthlyPayment: principal cannot be negative (got ${principal})`);
  }
  if (amortMonths <= 0) {
    throw new Error(`monthlyPayment: amortMonths must be > 0 (got ${amortMonths})`);
  }
  if (annualRatePct < 0) {
    throw new Error(`monthlyPayment: annualRatePct cannot be negative (got ${annualRatePct})`);
  }
  if (principal === 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / amortMonths;
  return (principal * r) / (1 - Math.pow(1 + r, -amortMonths));
}

/**
 * Interest-only monthly payment.
 */
export function interestOnlyPayment(
  principal: number,
  annualRatePct: number
): number {
  if (!Number.isFinite(principal) || !Number.isFinite(annualRatePct)) return 0;
  if (principal < 0) {
    throw new Error(`interestOnlyPayment: principal cannot be negative (got ${principal})`);
  }
  if (annualRatePct < 0) {
    throw new Error(`interestOnlyPayment: annualRatePct cannot be negative (got ${annualRatePct})`);
  }
  return (principal * (annualRatePct / 100)) / 12;
}

/**
 * Annual debt service for a given principal/rate/amortization.
 */
export function annualDebtService(
  principal: number,
  annualRatePct: number,
  amortMonths: number
): number {
  return monthlyPayment(principal, annualRatePct, amortMonths) * 12;
}

/**
 * LTV ratio in percent. Returns NaN for non-positive value so callers can
 * detect invalid inputs (instead of conflating with a real 0% LTV).
 */
export function ltvPct(loanAmount: number, value: number): number {
  if (!Number.isFinite(loanAmount) || !Number.isFinite(value)) return NaN;
  if (value <= 0) return NaN;
  return (loanAmount / value) * 100;
}

/**
 * Round to N decimals safely. Propagates NaN/Infinity as NaN (does NOT
 * coerce to 0). Use `safeNum()` if you want a 0-fallback for display.
 */
export function round(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return value; // propagate
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Coerce NaN/Infinity to a fallback (default 0) at display boundaries.
 */
export function safeNum(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

/**
 * Currency formatter (USD).
 */
export function usd(value: number, max = 0): string {
  if (!Number.isFinite(value)) return '$—';
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: max,
  });
}

/**
 * Compact currency (e.g. $1.2M).
 */
export function usdCompact(value: number): string {
  if (!Number.isFinite(value)) return '$—';
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return usd(value);
}

export function pct(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '—';
  return `${value.toFixed(decimals)}%`;
}

export function ratio(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '—';
  return `${value.toFixed(decimals)}x`;
}

/**
 * Sentinel for "positive cash flow, infinite runway". Use Number.isFinite()
 * to detect.
 */
export const INFINITE_RUNWAY = Number.POSITIVE_INFINITY;

/**
 * Format liquidity runway for display. Returns '∞' for Infinity, otherwise
 * the number of months.
 */
export function formatRunway(months: number): string {
  if (!Number.isFinite(months)) return '∞';
  return `${months.toFixed(1)}mo`;
}
