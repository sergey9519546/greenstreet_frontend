"""ARM (Adjustable Rate Mortgage) reset forecasting for DSCR loans.

Projects the ARM reset schedule using a forward-rate curve (NSS-Svensson yield
curve), applies periodic and lifetime caps, and computes the payment shock
the borrower will experience at each reset.

This module is the engine behind defending Attack 1 (ARM reset shock) from the
algorithm tournament — it makes the rate projection empirical (live SOFR curve)
instead of constant-margin (assumes margin-only, no index movement).

Spec sources:
    - DSCR Sovereign OS Sprint 6 Module 3 — ARM Reset Engine (QuantLib-based,
      simplified here to use NSS forward rates from yield_curve.py)
    - RESEARCH/godmode_20260618/11_T11_hardcore_algos/03_nss_svensson_yield_curve.md
    - RESEARCH/godmode_20260618/15_T15_real_time_data/12_source_inventory.md
      (NY Fed SOFR API: markets.newyorkfed.org/api/rates/unsecured/sofr/...)
    - Pennymac DSCR Product Profile 6.12.26 — ARM cap structure
    - AEGIS_DSCR_Complete §5.2 (ARM/IO conventions)

Standard DSCR ARM structure:
    - Initial fixed period: 5, 7, or 10 years (60, 84, or 120 months)
    - Reset frequency: 6 months after initial period ("5/6 ARM", "7/6 ARM", "10/6 ARM")
    - Index: 30-day SOFR (replaced LIBOR in 2021)
    - Margin: typically 2.50%-3.50% above index
    - Initial cap: 2% on first reset
    - Periodic cap: 1-2% per adjustment
    - Lifetime cap: 5-6% above start rate
    - Floor: typically initial rate - 2.00% (no negative amortization in standard DSCR)
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Literal

import numpy as np

from dscr_stress.yield_curve import (
    NSSParams,
    nss_forward_rate_range,
)

# ---------------------------------------------------------------------------
# Constants — industry-standard DSCR ARM structure
# ---------------------------------------------------------------------------

# ARM product types
ARMProduct = Literal["5/6", "7/6", "10/6", "5/1", "7/1", "10/1"]

# Months to first reset by product
ARM_INITIAL_PERIOD_MONTHS: dict[str, int] = {
    "5/6": 60,
    "5/1": 60,
    "7/6": 84,
    "7/1": 84,
    "10/6": 120,
    "10/1": 120,
}

# Months between resets after initial period (1 = annual, 6 = semiannual)
ARM_RESET_FREQUENCY_MONTHS: dict[str, int] = {
    "5/6": 6,
    "5/1": 12,
    "7/6": 6,
    "7/1": 12,
    "10/6": 6,
    "10/1": 12,
}

# Default caps per DSCR lender convention (Pennymac 6.12.26 + Blueprint v3)
DEFAULT_PERIODIC_CAP = 0.02  # 2.00% per adjustment
DEFAULT_LIFETIME_CAP = 0.05  # 5.00% max above initial rate
DEFAULT_LIFETIME_FLOOR_DELTA = 0.02  # 2.00% below initial rate (no neg-am standard)
DEFAULT_INDEX = "30-day SOFR"
DEFAULT_MARGIN = 0.025  # 2.50% margin (Pennymac 6.12.26 standard)

# Validation bounds
MIN_RATE = -0.05  # -5%
MAX_RATE = 0.20  # 20% (cap on input; ARM can go higher in extreme cases but flag)
MIN_MARGIN = -0.01  # -1% (unusual but possible)
MAX_MARGIN = 0.10  # 10%
MIN_PERIODIC_CAP = 0.0
MAX_PERIODIC_CAP = 0.05
MIN_LIFETIME_CAP = 0.0
MAX_LIFETIME_CAP = 0.10


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------


def _is_finite(x, name: str) -> None:
    if x is None or (isinstance(x, float) and (math.isnan(x) or math.isinf(x))):
        raise ValueError(f"{name} must be finite, got {x}")


def _validate_rate(rate: float, name: str) -> None:
    _is_finite(rate, name)
    if rate < MIN_RATE or rate > MAX_RATE:
        raise ValueError(f"{name} must be in [{MIN_RATE:.1%}, {MAX_RATE:.1%}]; got {rate:.4%}")


def _validate_positive(value: float, name: str) -> None:
    _is_finite(value, name)
    if value <= 0:
        raise ValueError(f"{name} must be > 0; got {value}")


def _validate_arm_product(product: str) -> None:
    if product not in ARM_INITIAL_PERIOD_MONTHS:
        raise ValueError(
            f"Unknown ARM product '{product}'; use one of {list(ARM_INITIAL_PERIOD_MONTHS)}"
        )


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------


@dataclass
class ARMResetSchedule:
    """ARM reset schedule for one loan, including caps analysis and verdict."""

    product: str  # e.g., "5/6 ARM"
    initial_rate: float  # Start rate at origination
    margin: float  # Lender margin above index
    index_name: str  # e.g., "30-day SOFR"
    initial_period_months: int  # Months to first reset
    reset_frequency_months: int  # Months between resets
    n_resets: int  # How many resets projected
    resets: list[dict]  # Per-reset details
    avg_projected_rate: float  # Mean of capped reset rates
    max_projected_rate: float  # Peak capped rate
    min_projected_rate: float  # Trough capped rate
    payment_shock_at_first_reset: float  # Monthly payment change at first reset ($)
    payment_shock_at_peak: float  # Largest monthly payment change across resets ($)
    arm_vs_fixed_verdict: str  # "ARM FAVORABLE" | "FIXED FAVORABLE" | "NEUTRAL"
    verdict_reason: str  # Why this verdict
    curve_used: str  # "NSS-calibrated" | "synthetic flat" | "user-supplied"

    def as_dict(self) -> dict:
        return {
            "product": self.product,
            "initial_rate": self.initial_rate,
            "margin": self.margin,
            "index_name": self.index_name,
            "initial_period_months": self.initial_period_months,
            "reset_frequency_months": self.reset_frequency_months,
            "n_resets": self.n_resets,
            "resets": self.resets,
            "avg_projected_rate": self.avg_projected_rate,
            "max_projected_rate": self.max_projected_rate,
            "min_projected_rate": self.min_projected_rate,
            "payment_shock_at_first_reset": self.payment_shock_at_first_reset,
            "payment_shock_at_peak": self.payment_shock_at_peak,
            "arm_vs_fixed_verdict": self.arm_vs_fixed_verdict,
            "verdict_reason": self.verdict_reason,
            "curve_used": self.curve_used,
        }


# ---------------------------------------------------------------------------
# Core ARM reset forecasting
# ---------------------------------------------------------------------------


def _apply_cap(
    proposed_rate: float,
    current_rate: float,
    initial_rate: float,
    periodic_cap: float,
    lifetime_cap: float,
    lifetime_floor_delta: float,
) -> tuple[float, bool, bool]:
    """Apply periodic + lifetime caps to a proposed reset rate.

    Returns:
        (capped_rate, periodic_cap_applied, lifetime_cap_applied)
    """
    # Periodic cap: max change per adjustment
    diff = proposed_rate - current_rate
    capped_diff = max(-periodic_cap, min(periodic_cap, diff))
    periodic_capped = current_rate + capped_diff
    periodic_cap_applied = abs(diff - capped_diff) > 1e-9

    # Lifetime cap: max = initial + lifetime_cap, floor = initial - lifetime_floor_delta
    lifetime_max = initial_rate + lifetime_cap
    lifetime_floor = initial_rate - lifetime_floor_delta
    final = max(lifetime_floor, min(lifetime_max, periodic_capped))
    lifetime_cap_applied = final != periodic_capped

    return final, periodic_cap_applied, lifetime_cap_applied


def project_arm_reset_schedule(
    product: str,
    initial_rate: float,
    margin: float = DEFAULT_MARGIN,
    n_resets: int = 5,
    periodic_cap: float = DEFAULT_PERIODIC_CAP,
    lifetime_cap: float = DEFAULT_LIFETIME_CAP,
    lifetime_floor_delta: float = DEFAULT_LIFETIME_FLOOR_DELTA,
    forward_rate_curve: np.ndarray | None = None,
    forward_rate_horizons_years: np.ndarray | None = None,
    curve_label: str = "user-supplied",
) -> ARMResetSchedule:
    """Project ARM reset schedule given a forward rate curve.

    Args:
        product: "5/6", "7/6", "10/6", "5/1", "7/1", or "10/1"
        initial_rate: starting rate at origination (decimal)
        margin: lender margin above index (decimal)
        n_resets: how many future resets to project (default 5 = ~30yr hold)
        periodic_cap: max change per adjustment (default 2%)
        lifetime_cap: max above initial rate (default 5%)
        lifetime_floor_delta: max below initial rate (default 2%)
        forward_rate_curve: np.ndarray of forward rates at horizons
            (decimal, annualized). Length must equal n_resets.
        forward_rate_horizons_years: np.ndarray of years-to-reset from origination
            (decimal). Length must equal n_resets.
            If None, defaults to evenly spaced at reset intervals.
        curve_label: human-readable description of the curve source

    Returns:
        ARMResetSchedule with full reset projections and verdict

    Note:
        Without a forward rate curve, this defaults to a FLAT CURVE at the
        initial rate (i.e., ARM resets track current rate, no rate shock).
        For production use, always pass a calibrated NSS curve.
    """
    _validate_arm_product(product)
    _validate_rate(initial_rate, "initial_rate")
    _is_finite(margin, "margin")
    if margin < MIN_MARGIN or margin > MAX_MARGIN:
        raise ValueError(
            f"margin must be in [{MIN_MARGIN:.1%}, {MAX_MARGIN:.1%}]; got {margin:.4%}"
        )
    if periodic_cap < MIN_PERIODIC_CAP or periodic_cap > MAX_PERIODIC_CAP:
        raise ValueError(f"periodic_cap must be in [{MIN_PERIODIC_CAP}, {MAX_PERIODIC_CAP}]")
    if lifetime_cap < MIN_LIFETIME_CAP or lifetime_cap > MAX_LIFETIME_CAP:
        raise ValueError(f"lifetime_cap must be in [{MIN_LIFETIME_CAP}, {MAX_LIFETIME_CAP}]")
    if n_resets < 1 or n_resets > 30:
        raise ValueError(f"n_resets must be in [1, 30]; got {n_resets}")

    initial_period = ARM_INITIAL_PERIOD_MONTHS[product]
    reset_freq = ARM_RESET_FREQUENCY_MONTHS[product]

    # Default forward curve horizons (years from origination)
    if forward_rate_horizons_years is None:
        forward_rate_horizons_years = np.array(
            [(initial_period + i * reset_freq) / 12.0 for i in range(n_resets)], dtype=float
        )

    if forward_rate_curve is None:
        # Default: flat curve at initial rate (no rate movement)
        forward_rate_curve = np.full(n_resets, initial_rate - margin, dtype=float)
        curve_label = "synthetic flat"

    if len(forward_rate_curve) != n_resets:
        raise ValueError(
            f"forward_rate_curve length {len(forward_rate_curve)} != n_resets {n_resets}"
        )
    if len(forward_rate_horizons_years) != n_resets:
        raise ValueError(
            f"forward_rate_horizons_years length "
            f"{len(forward_rate_horizons_years)} != n_resets {n_resets}"
        )

    # Compute reset schedule
    resets = []
    current_rate = initial_rate
    for reset_num in range(n_resets):
        horizon_years = float(forward_rate_horizons_years[reset_num])
        months_at_reset = int(round(horizon_years * 12))
        forward_index = float(forward_rate_curve[reset_num])

        # Fully indexed rate (unconstrained)
        fully_indexed = forward_index + margin

        # Apply caps
        capped_rate, periodic_applied, lifetime_applied = _apply_cap(
            fully_indexed,
            current_rate,
            initial_rate,
            periodic_cap,
            lifetime_cap,
            lifetime_floor_delta,
        )

        resets.append(
            {
                "reset_number": reset_num + 1,
                "months_at_reset": months_at_reset,
                "horizon_years": horizon_years,
                "forward_index_rate": round(forward_index, 6),
                "margin": round(margin, 6),
                "fully_indexed_rate": round(fully_indexed, 6),
                "capped_rate": round(capped_rate, 6),
                "current_rate_before_reset": round(current_rate, 6),
                "periodic_cap_applied": periodic_applied,
                "lifetime_cap_applied": lifetime_applied,
                "rate_change_from_initial": round(capped_rate - initial_rate, 6),
                "rate_change_from_previous": round(capped_rate - current_rate, 6),
            }
        )
        current_rate = capped_rate

    all_capped = [r["capped_rate"] for r in resets]
    avg_projected = float(np.mean(all_capped))
    max_projected = float(np.max(all_capped))
    min_projected = float(np.min(all_capped))

    # Verdict
    if avg_projected < initial_rate - 0.001:
        verdict = "ARM FAVORABLE"
        verdict_reason = (
            f"Avg projected rate {avg_projected:.2%} < initial {initial_rate:.2%}; "
            f"ARM resets trend lower than start rate."
        )
    elif avg_projected > initial_rate + 0.001:
        verdict = "FIXED FAVORABLE"
        verdict_reason = (
            f"Avg projected rate {avg_projected:.2%} > initial {initial_rate:.2%}; "
            f"ARM resets trend higher than start rate."
        )
    else:
        verdict = "NEUTRAL"
        verdict_reason = (
            f"Avg projected rate {avg_projected:.2%} ≈ initial {initial_rate:.2%}; "
            f"no clear winner between ARM and fixed."
        )

    return ARMResetSchedule(
        product=product,
        initial_rate=initial_rate,
        margin=margin,
        index_name=DEFAULT_INDEX,
        initial_period_months=initial_period,
        reset_frequency_months=reset_freq,
        n_resets=n_resets,
        resets=resets,
        avg_projected_rate=avg_projected,
        max_projected_rate=max_projected,
        min_projected_rate=min_projected,
        payment_shock_at_first_reset=0.0,  # Computed separately
        payment_shock_at_peak=0.0,
        arm_vs_fixed_verdict=verdict,
        verdict_reason=verdict_reason,
        curve_used=curve_label,
    )


# ---------------------------------------------------------------------------
# Payment shock calculation
# ---------------------------------------------------------------------------


def _payment_factor(rate_pct: float, n_months: int) -> float:
    """Compute the payment factor (decimal / 1.0) for a given annual rate % and term."""
    if rate_pct == 0:
        return 1.0 / n_months
    r = rate_pct / 100.0 / 12.0
    return r * (1 + r) ** n_months / ((1 + r) ** n_months - 1)


def payment_shock(
    loan_amount: float,
    initial_rate: float,
    first_reset_rate: float,
    n_months: int,
) -> float:
    """Compute monthly payment shock at ARM first reset.

    Args:
        loan_amount: principal balance at first reset (decimal)
        initial_rate: rate at origination (decimal, e.g., 0.07 = 7%)
        first_reset_rate: rate after first reset (decimal)
        n_months: remaining term at first reset

    Returns:
        Monthly payment change in dollars (positive = increase)
    """
    _validate_positive(loan_amount, "loan_amount")
    _validate_positive(n_months, "n_months")
    _validate_rate(initial_rate, "initial_rate")
    _validate_rate(first_reset_rate, "first_reset_rate")

    initial_payment = loan_amount * _payment_factor(initial_rate * 100, n_months)
    new_payment = loan_amount * _payment_factor(first_reset_rate * 100, n_months)
    return new_payment - initial_payment


def populate_payment_shocks(
    schedule: ARMResetSchedule,
    loan_amount: float,
    term_months: int,
) -> ARMResetSchedule:
    """Compute payment shocks at each reset in the schedule.

    Returns a new ARMResetSchedule with payment_shock_at_first_reset and
    payment_shock_at_peak populated.
    """
    _validate_positive(loan_amount, "loan_amount")
    _validate_positive(term_months, "term_months")
    if not schedule.resets:
        return schedule

    shocks = []
    for r in schedule.resets:
        # Remaining term at this reset
        months_elapsed = r["months_at_reset"]
        remaining = term_months - months_elapsed
        if remaining < 1:
            shocks.append(0.0)
            continue
        # Approximate loan balance (constant-pay, simple schedule)
        # For simplicity, use loan_amount * (remaining/term_months)
        # In production, replace with proper amortization
        remaining_balance = loan_amount * (remaining / term_months)
        shock = payment_shock(
            remaining_balance,
            schedule.initial_rate,
            r["capped_rate"],
            remaining,
        )
        shocks.append(shock)

    # Add shocks to each reset dict
    new_resets = []
    for r, shock in zip(schedule.resets, shocks, strict=True):
        r2 = dict(r)
        r2["payment_shock"] = round(shock, 2)
        new_resets.append(r2)

    return ARMResetSchedule(
        product=schedule.product,
        initial_rate=schedule.initial_rate,
        margin=schedule.margin,
        index_name=schedule.index_name,
        initial_period_months=schedule.initial_period_months,
        reset_frequency_months=schedule.reset_frequency_months,
        n_resets=schedule.n_resets,
        resets=new_resets,
        avg_projected_rate=schedule.avg_projected_rate,
        max_projected_rate=schedule.max_projected_rate,
        min_projected_rate=schedule.min_projected_rate,
        payment_shock_at_first_reset=shocks[0],
        payment_shock_at_peak=max(shocks) if shocks else 0.0,
        arm_vs_fixed_verdict=schedule.arm_vs_fixed_verdict,
        verdict_reason=schedule.verdict_reason,
        curve_used=schedule.curve_used,
    )


# ---------------------------------------------------------------------------
# Convenience: full ARM scenario using NSS-calibrated curve
# ---------------------------------------------------------------------------


def project_arm_reset_with_nss(
    product: str,
    initial_rate: float,
    nss_params: NSSParams,
    margin: float = DEFAULT_MARGIN,
    n_resets: int = 5,
    periodic_cap: float = DEFAULT_PERIODIC_CAP,
    lifetime_cap: float = DEFAULT_LIFETIME_CAP,
    lifetime_floor_delta: float = DEFAULT_LIFETIME_FLOOR_DELTA,
    loan_amount: float = 0.0,
    term_months: int = 360,
) -> ARMResetSchedule:
    """Project ARM reset schedule using a calibrated NSS forward-rate curve.

    This is the production entry point — combines yield_curve.nss_forward_rate
    with arm_reset.project_arm_reset_schedule.

    Args:
        product: ARM product type ("5/6", "7/6", "10/6", etc.)
        initial_rate: starting rate (decimal)
        nss_params: calibrated NSS parameters (from yield_curve.calibrate_nss)
        margin: lender margin (default 2.50%)
        n_resets: number of resets to project (default 5)
        periodic_cap: max per-adjustment change (default 2%)
        lifetime_cap: max above initial (default 5%)
        lifetime_floor_delta: max below initial (default 2%)
        loan_amount: principal at origination (for payment shock; default 0)
        term_months: original loan term in months (default 360 = 30yr)

    Returns:
        ARMResetSchedule with forward rates from NSS + caps applied + payment shocks
    """
    initial_period = ARM_INITIAL_PERIOD_MONTHS[product]
    reset_freq = ARM_RESET_FREQUENCY_MONTHS[product]

    horizons_years = np.array(
        [(initial_period + i * reset_freq) / 12.0 for i in range(n_resets)], dtype=float
    )

    # Get forward rates from NSS
    forward_rates = nss_forward_rate_range(horizons_years, nss_params)

    schedule = project_arm_reset_schedule(
        product=product,
        initial_rate=initial_rate,
        margin=margin,
        n_resets=n_resets,
        periodic_cap=periodic_cap,
        lifetime_cap=lifetime_cap,
        lifetime_floor_delta=lifetime_floor_delta,
        forward_rate_curve=forward_rates,
        forward_rate_horizons_years=horizons_years,
        curve_label="NSS-calibrated",
    )

    if loan_amount > 0 and term_months > 0:
        schedule = populate_payment_shocks(schedule, loan_amount, term_months)

    return schedule


# ---------------------------------------------------------------------------
# Stressed scenario: forced upward curve shift
# ---------------------------------------------------------------------------


def project_arm_reset_stressed(
    product: str,
    initial_rate: float,
    nss_params: NSSParams,
    shift_bps: float = 200.0,
    **kwargs,
) -> ARMResetSchedule:
    """Project ARM reset schedule with a parallel shift to the forward curve.

    Used for stress testing — e.g., +200 bps parallel shift simulates a sudden
    hawkish Fed pivot that raises all forward rates.

    Args:
        product: ARM product type
        initial_rate: starting rate
        nss_params: baseline NSS parameters
        shift_bps: parallel shift in basis points (positive = upward shift)
        **kwargs: passed to project_arm_reset_with_nss

    Returns:
        ARMResetSchedule with shifted forward curve
    """
    _is_finite(shift_bps, "shift_bps")
    shift_decimal = shift_bps / 10000.0

    shifted_params = NSSParams(
        beta0=nss_params.beta0 + shift_decimal,
        beta1=nss_params.beta1,
        beta2=nss_params.beta2,
        beta3=nss_params.beta3,
        lambda1=nss_params.lambda1,
        lambda2=nss_params.lambda2,
    )
    return project_arm_reset_with_nss(
        product=product,
        initial_rate=initial_rate,
        nss_params=shifted_params,
        **kwargs,
    )


__all__ = [
    "ARMProduct",
    "ARMResetSchedule",
    "ARM_INITIAL_PERIOD_MONTHS",
    "ARM_RESET_FREQUENCY_MONTHS",
    "DEFAULT_PERIODIC_CAP",
    "DEFAULT_LIFETIME_CAP",
    "DEFAULT_LIFETIME_FLOOR_DELTA",
    "DEFAULT_INDEX",
    "DEFAULT_MARGIN",
    "project_arm_reset_schedule",
    "project_arm_reset_with_nss",
    "project_arm_reset_stressed",
    "payment_shock",
    "populate_payment_shocks",
]
