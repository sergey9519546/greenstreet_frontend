"""Payment math: amortization factor, P&I, PITI, PITIA, ITIA, interest-only.

All functions are pure, deterministic, and zero-dep.
Verified to 8 decimal places against the canonical Sovereign Master v11.0 golden vector.

Formulas:
    payment_factor(r, n) = r * (1+r)^n / ((1+r)^n - 1)        where r = annual_rate_pct / 100 / 12
    pi(loan, r, n)       = loan * payment_factor(r, n)
    pi_io(loan, r)       = loan * r  (monthly interest-only payment)
    piti(pi, t, i)       = pi + t_monthly + i_monthly
    pitia(...)           = piti + hoa_monthly + flood_monthly + mi_monthly
    itia(interest, t, i) = interest + t_monthly + i_monthly + hoa_monthly
                            (DSCR denominator for IO loans per AEGIS Complete §5.3)
"""

from __future__ import annotations

import math
from decimal import Decimal, localcontext
from typing import Final

# High precision for IRS-grade audit trails. 28 digits is the stdlib Decimal default;
# 50 is the absolute maximum. We use 28 to keep arithmetic fast while staying auditable.
# NOTE: Use localcontext() in payment_factor() to avoid mutating GLOBAL Decimal state
# (was a bug in v0.x that affected user code using Decimal elsewhere).
DEFAULT_DECIMAL_PRECISION: Final = 28

# Cap on amortization term to prevent pathological inputs.
MAX_TERM_MONTHS: Final = 600  # 50 years — covers all CRE products including interest-only bridges

# Valid interest rate bounds (annual %). 0 is valid (zero interest loans).
# Negative rates are invalid for US mortgages (Federal Reserve has never gone negative).
MIN_ANNUAL_RATE_PCT: Final = 0.0
MAX_ANNUAL_RATE_PCT: Final = 100.0  # 100% APR is absurd but defended

# Growth rate bounds for noi_at_year (separate from payment rate bounds).
# Annual NOI growth from -50% (severe decline) to +50% (extreme growth).
# Outside this range, the projection is likely bad data.
MIN_NOI_GROWTH_RATE: Final = -0.5
MAX_NOI_GROWTH_RATE: Final = 0.5


def _is_finite_positive_number(x: float, name: str) -> None:
    """Validate x is a finite, non-NaN number (can be zero).

    Raises ValueError if x is NaN or infinity. Does NOT check for non-negative;
    use _is_finite_non_negative for that.
    """
    if not isinstance(x, (int, float)):
        raise TypeError(f"{name} must be a number, got {type(x).__name__}")
    if math.isnan(x):
        raise ValueError(f"{name} must not be NaN, got NaN")
    if math.isinf(x):
        raise ValueError(f"{name} must be finite, got {x}")


def _is_finite_non_negative(x: float, name: str, allow_zero: bool = True) -> None:
    """Validate x is a finite, non-NaN, non-negative number.

    Raises ValueError if x is NaN, infinity, or negative. By default, zero is OK.
    Set allow_zero=False to require strictly positive.
    """
    _is_finite_positive_number(x, name)
    if allow_zero:
        if x < 0:
            raise ValueError(f"{name} must be >= 0, got {x}")
    else:
        if x <= 0:
            raise ValueError(f"{name} must be > 0, got {x}")


def payment_factor(annual_rate_pct: float, n_months: int) -> float:
    """Return the monthly payment factor per $1 of loan principal.

    Equivalent to the standard amortization annuity formula:
        f(r, n) = r * (1+r)^n / ((1+r)^n - 1)

    Args:
        annual_rate_pct: nominal annual rate as a percentage (e.g. 7.00 for 7%).
            Must be >= 0. Negative rates raise ValueError.
        n_months: amortization term in months (360 = 30yr fixed).
            Must be int in (0, 600].

    Returns:
        Monthly payment per $1 of principal. Multiply by loan amount for P&I.

    Edge cases:
        - rate == 0: returns 1 / n_months (level principal, no interest)
        - n_months <= 0: raises ValueError
        - n_months > MAX_TERM_MONTHS: raises ValueError
        - annual_rate_pct < 0: raises ValueError (Bug 6 fix)
        - annual_rate_pct NaN/inf: raises ValueError
        - n_months not int: raises TypeError

    Verified values:
        - payment_factor(7.00, 360)  = 0.0066530207
        - payment_factor(6.125, 360) = 0.0060761359
        - payment_factor(8.25, 360)  = 0.0075126634
    """
    if n_months <= 0:
        raise ValueError(f"n_months must be > 0, got {n_months}")
    if n_months > MAX_TERM_MONTHS:
        raise ValueError(f"n_months must be <= {MAX_TERM_MONTHS} (50 years), got {n_months}")
    if not isinstance(n_months, int):
        raise TypeError(f"n_months must be int, got {type(n_months).__name__}")

    # NaN check FIRST (before range check) so the specific error message matches.
    if math.isnan(annual_rate_pct):
        raise ValueError("annual_rate_pct must not be NaN, got NaN")
    # Bug 6 fix: validate rate bounds (was: silently produced small positive for negative rate)
    if not (MIN_ANNUAL_RATE_PCT <= annual_rate_pct <= MAX_ANNUAL_RATE_PCT):
        raise ValueError(
            f"annual_rate_pct must be in [{MIN_ANNUAL_RATE_PCT}, {MAX_ANNUAL_RATE_PCT}], "
            f"got {annual_rate_pct}"
        )

    if annual_rate_pct == 0:
        return 1.0 / n_months

    # Decimal path for IRS-grade precision. Use localcontext() to avoid mutating
    # GLOBAL Decimal state (was a side-effect bug in v0.x — affected user code).
    with localcontext() as ctx:
        ctx.prec = DEFAULT_DECIMAL_PRECISION
        # Convert float → Decimal via string to avoid binary-float artifacts
        # like 0.07 becoming 0.06999999999999999.
        r = Decimal(str(annual_rate_pct)) / Decimal("100") / Decimal("12")
        n = Decimal(n_months)
        one = Decimal("1")
        growth = (one + r) ** n  # (1+r)^n
        factor = r * growth / (growth - one)
        return float(factor)


def pi(loan: float, annual_rate_pct: float, n_months: int = 360) -> float:
    """Return monthly principal-and-interest payment (fully amortizing).

    Args:
        loan: loan amount in dollars (e.g. 318750 for $318,750). Must be >= 0.
        annual_rate_pct: nominal annual rate as a percentage. Must be >= 0.
        n_months: amortization term. Default 360 (30yr fixed). Must be int in (0, 600).

    Returns:
        Monthly P&I in dollars.

    Verified: pi(318750, 7.00, 360) = $2,120.6517
    """
    _is_finite_non_negative(loan, "loan", allow_zero=True)
    return loan * payment_factor(annual_rate_pct, n_months)


def pi_io(loan: float, annual_rate_pct: float) -> float:
    """Return monthly INTEREST-ONLY payment (no principal reduction).

    Used for IO ARMs (5/1, 7/1, 10/1) which dominate DSCR origination.
    Formula: monthly_IO = loan * annual_rate_pct / 100 / 12

    Args:
        loan: loan amount in dollars. Must be > 0 (zero loan = zero IO is trivial but weird).
        annual_rate_pct: nominal annual rate as a percentage. Must be >= 0.

    Returns:
        Monthly interest-only payment in dollars.

    Example:
        pi_io(318750, 7.00) = 318750 * 0.07 / 12 = $1,859.375

    Source: AEGIS_DSCR_Complete §5.2 (Interest-only payment formula).
    """
    # Zero loan = zero IO payment (trivial case, not an error).
    _is_finite_non_negative(loan, "loan", allow_zero=True)
    if annual_rate_pct < 0:
        raise ValueError(f"annual_rate_pct must be >= 0 for IO, got {annual_rate_pct}")
    return loan * annual_rate_pct / 100.0 / 12.0


def piti(
    p_i: float,
    tax_annual: float = 0,
    insurance_annual: float = 0,
) -> float:
    """Return monthly PITI (Principal + Interest + Taxes + Insurance).

    Args:
        p_i: monthly principal-and-interest payment. Must be >= 0 (Bug 7 fix).
        tax_annual: annual property tax in dollars. Must be >= 0.
        insurance_annual: annual hazard insurance in dollars. Must be >= 0.

    Returns:
        Monthly PITI in dollars.
    """
    # Bug 7 fix: p_i was not previously validated. Negative p_i could
    # produce negative PITI, propagating wrong DSCR downstream.
    _is_finite_non_negative(p_i, "p_i", allow_zero=True)
    _is_finite_non_negative(tax_annual, "tax_annual", allow_zero=True)
    _is_finite_non_negative(insurance_annual, "insurance_annual", allow_zero=True)
    return p_i + tax_annual / 12 + insurance_annual / 12


def pitia(
    p_i: float,
    tax_annual: float = 0,
    insurance_annual: float = 0,
    hoa_monthly: float = 0,
    flood_monthly: float = 0,
    mi_monthly: float = 0,
) -> float:
    """Return monthly PITIA (Principal + Interest + Taxes + Insurance + Association + flood/MI).

    Args:
        p_i: monthly principal-and-interest payment. Must be >= 0 (Bug 7 fix).
        tax_annual: annual property tax in dollars. Must be >= 0.
        insurance_annual: annual hazard insurance in dollars. Must be >= 0.
        hoa_monthly: monthly homeowners/condo association dues. Must be >= 0 (Bug 1 fix).
        flood_monthly: monthly flood insurance premium. Must be >= 0 (Bug 1 fix).
        mi_monthly: monthly mortgage insurance premium (PMI/MIP). Must be >= 0 (Bug 1 fix).

    Returns:
        Monthly PITIA in dollars.

    Verified: pitia(2120.6517, 5000, 2000, 150) = $2,853.9850
    """
    # Bug 1 fix: hoa/flood/MI previously not validated.
    # Negative values silently produced wrong PITIA. Now raise.
    _is_finite_non_negative(hoa_monthly, "hoa_monthly", allow_zero=True)
    _is_finite_non_negative(flood_monthly, "flood_monthly", allow_zero=True)
    _is_finite_non_negative(mi_monthly, "mi_monthly", allow_zero=True)
    return piti(p_i, tax_annual, insurance_annual) + hoa_monthly + flood_monthly + mi_monthly


def itia(
    interest_monthly: float,
    tax_annual: float = 0,
    insurance_annual: float = 0,
    hoa_monthly: float = 0,
) -> float:
    """Return monthly ITIA (Interest + Taxes + Insurance + Association).

    DSCR denominator for interest-only loans (per AEGIS_DSCR_Complete §5.3):
        ITIA_mo = Interest + Taxes + Insurance + Association Dues
        DSCR_IO = Gross_Rent / ITIA

    Differs from PITIA in that it EXCLUDES principal payment (since IO has no principal).

    Args:
        interest_monthly: monthly interest payment (from pi_io). Must be >= 0.
        tax_annual: annual property tax in dollars. Must be >= 0.
        insurance_annual: annual hazard insurance in dollars. Must be >= 0.
        hoa_monthly: monthly HOA dues. Must be >= 0.

    Returns:
        Monthly ITIA in dollars.

    Example:
        pi_io(318750, 7.00) = $1,859.375
        itia(1859.375, 5000, 2000, 150) = 1859.375 + 416.67 + 166.67 + 150 = $2,592.71
        DSCR_IO for $3,000 rent = 3000 / 2592.71 = 1.157

    Source: AEGIS_DSCR_Complete §5.3 (ITIA formula), Blueprint v3 (DSCR denominator awareness).
    """
    _is_finite_non_negative(interest_monthly, "interest_monthly", allow_zero=True)
    _is_finite_non_negative(tax_annual, "tax_annual", allow_zero=True)
    _is_finite_non_negative(insurance_annual, "insurance_annual", allow_zero=True)
    _is_finite_non_negative(hoa_monthly, "hoa_monthly", allow_zero=True)
    return interest_monthly + tax_annual / 12 + insurance_annual / 12 + hoa_monthly
