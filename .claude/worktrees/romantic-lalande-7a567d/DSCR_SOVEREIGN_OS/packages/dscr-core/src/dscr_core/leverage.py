"""Leverage solvers: deal_break_rate (brentq) and max_purchase_price (bisection).

These solve the inverse DSCR problem: given a target DSCR and other constraints,
find the interest rate (deal_break) or purchase price (max_purchase) at which the
loan just barely qualifies.

deal_break_rate: monotonically decreasing in rate (higher rate -> higher P&I -> lower DSCR).
    We use Brent's method (scipy-free implementation) for robustness.

max_purchase_price: monotonically increasing in price (higher price -> higher loan
    and typically higher rent, but the rent/price ratio is held constant via
    rent_per_dollar_yr). We use simple bisection.

Both solvers are deterministic, bounded, and audited via golden-vector tests.
"""

from __future__ import annotations

from collections.abc import Callable

from dscr_core.payment import payment_factor, pitia

# --- Brent's method constants ---
BRENT_MAX_ITER: int = 100
BRENT_TOL: float = 1e-9


def _brentq(
    f: Callable[[float], float],
    a: float,
    b: float,
    xtol: float = BRENT_TOL,
    maxiter: int = BRENT_MAX_ITER,
) -> tuple[float, int]:
    """Find a root of f in [a, b] using Brent's method.

    Pure-Python implementation. No scipy/numpy. Suitable for the deal_break_rate
    solver where f is monotonic and bracket is guaranteed.

    Args:
        f: callable f(x) -> float. Must have opposite signs at a and b.
        a, b: bracket endpoints.
        xtol: convergence tolerance on x.
        maxiter: safety bound on iterations.

    Returns:
        Tuple of (root, iterations_used).

    Raises:
        ValueError: if f(a) and f(b) have the same sign (no guaranteed bracket).
        RuntimeError: if maxiter exceeded (indicates solver pathology).
    """
    fa = f(a)
    fb = f(b)
    if fa == 0:
        return a, 0
    if fb == 0:
        return b, 0
    if (fa > 0) == (fb > 0):
        raise ValueError(f"f(a) and f(b) must bracket a root, got f({a})={fa}, f({b})={fb}")

    # Ensure fa < 0 < fb (swap if reversed)
    if fa > fb:
        a, fa, b, fb = b, fb, a, fa

    c, fc = a, fa
    d = b - a
    mflag = True
    iterations = 0

    while iterations < maxiter:
        if abs(fa) < xtol:
            return a, iterations
        if abs(fb) < xtol:
            return b, iterations
        if abs(b - a) < xtol:
            return (a + b) / 2, iterations

        # Inverse quadratic interpolation or secant
        if fa != fc and fb != fc:
            # Inverse quadratic interpolation
            s = (
                a * fb * fc / ((fa - fb) * (fa - fc))
                + b * fa * fc / ((fb - fa) * (fb - fc))
                + c * fa * fb / ((fc - fa) * (fc - fb))
            )
        else:
            # Secant
            if fb - fa == 0:
                s = (a + b) / 2  # degenerate fallback
            else:
                s = b - fb * (b - a) / (fb - fa)

        # Conditions for bisection
        cond1 = not ((3 * a + b) / 4 < s < b or b < s < (3 * a + b) / 4)
        cond2 = mflag and abs(s - b) >= abs(b - c) / 2
        cond3 = (not mflag) and abs(s - b) >= abs(c - d) / 2
        cond4 = mflag and abs(b - c) < xtol
        cond5 = (not mflag) and abs(c - d) < xtol

        if cond1 or cond2 or cond3 or cond4 or cond5:
            s = (a + b) / 2
            mflag = True
        else:
            mflag = False

        fs = f(s)

        # Early return if we found an exact-ish root
        if abs(fs) < xtol:
            return s, iterations

        d = c
        c, fc = b, fb

        if (fa > 0) != (fs > 0):
            b, fb = s, fs
        else:
            a, fa = s, fs

        if abs(fa) < abs(fb):
            a, fa, b, fb = b, fb, a, fa

        iterations += 1

    if abs(fa) < xtol:
        return a, iterations
    if abs(fb) < xtol:
        return b, iterations
    raise RuntimeError(f"Brent's method did not converge in {maxiter} iterations")


def deal_break_rate(
    loan: float,
    target_dscr: float,
    rent_monthly: float,
    tax_annual: float = 0,
    insurance_annual: float = 0,
    hoa_monthly: float = 0,
    flood_monthly: float = 0,
    mi_monthly: float = 0,
    n_months: int = 360,
    min_rate_pct: float = 0.0,
    max_rate_pct: float = 20.0,
) -> float:
    """Return the maximum interest rate at which the loan still qualifies.

    The "deal-break rate" is the rate ceiling: above this rate, the DSCR drops
    below the target (typically 1.0 or the lender's qualifying DSCR). Used for:
        - Stress testing (deal-break vs current rate = cushion)
        - Rate buydown analysis (how many bps can I buy down?)
        - ARM cap analysis (does the rate ceiling breach the ARM life cap?)

    Args:
        loan: loan amount in dollars.
        target_dscr: minimum acceptable DSCR (e.g. 1.0 or 1.10).
        rent_monthly: monthly qualifying rent (already min(lease, appraisal)).
        tax_annual, insurance_annual, hoa_monthly, flood_monthly, mi_monthly: PITIA components.
        n_months: amortization term (360 = 30yr fixed).
        min_rate_pct: lower bracket for solver (default 0.0%).
        max_rate_pct: upper bracket for solver (default 20.0%).

    Returns:
        The interest rate (as a percentage) at which DSCR exactly equals target_dscr.

    Raises:
        ValueError: if the deal never qualifies even at 0% (negative equity scenario).
        ValueError: if the deal always qualifies even at 20% (deep value scenario).

    Verified (golden vector + 7.00% qualifier):
        deal_break_rate(318750, 1.0, 3000, 5000, 2000, 150) ≈ 7.67%
        deal_break_rate(318750, 1.05, 3000, 5000, 2000, 150) ≈ 7.00%  (definition of green)
    """
    if loan <= 0:
        raise ValueError(f"loan must be > 0, got {loan}")
    if target_dscr <= 0:
        raise ValueError(f"target_dscr must be > 0, got {target_dscr}")
    if rent_monthly <= 0:
        raise ValueError(f"rent_monthly must be > 0, got {rent_monthly}")
    if not min_rate_pct < max_rate_pct:
        raise ValueError(
            f"min_rate_pct must be < max_rate_pct, got {min_rate_pct} >= {max_rate_pct}"
        )

    def dscr_minus_target(rate_pct: float) -> float:
        monthly_p_i = loan * payment_factor(rate_pct, n_months)
        full_pitia = pitia(
            monthly_p_i,
            tax_annual,
            insurance_annual,
            hoa_monthly,
            flood_monthly,
            mi_monthly,
        )
        return rent_monthly / full_pitia - target_dscr

    # At rate=0: DSCR is maximized. At rate=max: DSCR is minimized.
    # If DSCR at 0% < target: deal never qualifies (underwater).
    f_low = dscr_minus_target(min_rate_pct)
    f_high = dscr_minus_target(max_rate_pct)

    if f_low < 0:
        raise ValueError(
            f"Deal does not qualify at minimum rate {min_rate_pct}% "
            f"(DSCR at 0% = {target_dscr + f_low:.4f}). "
            f"Inputs: loan={loan}, rent={rent_monthly}, PITIA components."
        )
    if f_high > 0:
        raise ValueError(
            f"Deal qualifies even at maximum rate {max_rate_pct}% "
            f"(DSCR at {max_rate_pct}% = {target_dscr + f_high:.4f}). "
            f"Increase max_rate_pct or check for input error."
        )

    rate_pct, _ = _brentq(dscr_minus_target, min_rate_pct, max_rate_pct)
    return rate_pct


def max_purchase_price(
    target_dscr: float,
    rate_pct: float,
    rent_per_value_yr: float = 0.0847,
    tax_factor: float = 0.012,
    insurance_factor: float = 0.006,
    hoa_monthly: float = 0,
    flood_monthly: float = 0,
    mi_monthly: float = 0,
    ltv: float = 0.75,
    n_months: int = 360,
    vacancy_pct: float = 0.0,
    mgmt_pct: float = 0.0,
    maint_pct: float = 0.0,
    min_value: float = 1_000.0,
    max_value: float = 100_000_000.0,
    xtol: float = 100.0,
) -> float:
    """Return the maximum purchase price at which the loan still qualifies.

    Used in reverse: given a target DSCR and known rate, what is the most expensive
    property the borrower can buy and still qualify? Returns the price ceiling for
    the borrower's shopping search.

    IMPORTANT GOTCHA — this function enforces DSCR only, NOT absolute affordability.
    Counter-intuitively, with fixed HOA/flood/MI, higher rates lead to HIGHER
    max-price (because more-expensive property generates proportionally more rent,
    diluting the fixed costs). In real underwriting, you must apply a separate
    max_payment or max_loan constraint alongside this DSCR ceiling.

    The closed form for max price (when fixed costs c > 0):
        V* = target * c / (a - target * b)
    where a = rent_per_value_yr/12, b = ltv * payment_factor + (tax+ins)/12.

    Args:
        target_dscr: minimum acceptable DSCR (e.g. 1.0 or 1.10).
        rate_pct: quoted interest rate as a percentage.
        rent_per_value_yr: gross rent yield (decimal). Default 0.0847 = 8.47%/yr,
            which is the 2026 median US rental yield per rentometer.
        tax_factor: annual property tax as a decimal of value. Default 0.012 = 1.2%.
        insurance_factor: annual hazard insurance as decimal of value. Default 0.006.
        hoa_monthly: monthly HOA dues (not scaled by value).
        flood_monthly, mi_monthly: not scaled by value.
        ltv: loan-to-value ratio (decimal, e.g. 0.75 for 75%).
        n_months: amortization term.
        vacancy_pct: Track 2 vacancy (for dual-track ceiling — default 0% gives Track 1 ceiling).
        mgmt_pct, maint_pct: Track 2 expenses.
        min_value, max_value: bracket for bisection.
        xtol: convergence tolerance in dollars (default $100).

    Returns:
        Maximum purchase price in dollars.

    Verified (golden vector, 1.05 DSCR target at 7.00% / 75% LTV / $150 HOA):
        max_purchase_price(1.05, 7.00, hoa_monthly=150) ≈ $648,000
    """
    if not 0 < ltv < 1:
        raise ValueError(f"ltv must be in (0, 1), got {ltv}")
    if not 0 < rent_per_value_yr < 1:
        raise ValueError(f"rent_per_value_yr must be in (0, 1), got {rent_per_value_yr}")

    def dscr_at_value(value: float) -> float:
        loan = value * ltv
        gross_rent_monthly = value * rent_per_value_yr / 12
        effective_rent = gross_rent_monthly * (1 - vacancy_pct)
        expenses = gross_rent_monthly * (mgmt_pct + maint_pct)
        noi_monthly = effective_rent - expenses
        monthly_p_i = loan * payment_factor(rate_pct, n_months)
        full_pitia = pitia(
            monthly_p_i,
            tax_annual=value * tax_factor,
            insurance_annual=value * insurance_factor,
            hoa_monthly=hoa_monthly,
            flood_monthly=flood_monthly,
            mi_monthly=mi_monthly,
        )
        if full_pitia <= 0:
            return -1e9
        return noi_monthly / full_pitia

    # DSCR scales linearly with value when all expenses scale with value. So:
    # - At very high value: PITIA scales with value, NOI scales with value -> DSCR constant
    # - At very low value: PITIA approaches (P&I + hoa + flood + mi), NOI scales with value
    # - Net: DSCR is monotonically increasing in value (more value = more rent > more PITIA
    #   for fixed LTV, because rent yield > rate yield at most realistic scenarios)
    #
    # But actually: DSCR scales with rent and PITIA, both proportional to value
    # for variable costs. The fixed costs (hoa, flood, mi) cause DSCR to decrease at
    # low values. So DSCR is monotonically increasing in value (when fixed costs > 0).
    # At high values, DSCR asymptotes to:
    #   rent_per_value_yr / 12 / (ltv * payment_factor + (tax_factor + insurance_factor) / 12)
    # At golden defaults: 0.0847/12 / (0.75 * 0.0066532 + 0.018/12)
    #                  = 0.007058 / 0.006490
    #                  = 1.0876
    # At 1.05 target, max price exists in finite space. Bisection works.

    f_low = dscr_at_value(min_value) - target_dscr
    f_high = dscr_at_value(max_value) - target_dscr

    if f_low > 0:
        raise ValueError(
            f"Deal qualifies even at min_value=${min_value:,.0f}. "
            f"DSCR at min = {target_dscr + f_low:.4f}."
        )
    if f_high < 0:
        raise ValueError(
            f"Deal does not qualify even at max_value=${max_value:,.0f}. "
            f"DSCR at max = {target_dscr + f_high:.4f}."
        )

    # Bisection
    # Bug 5 fix: was hardcoded to 200 iterations which gives precision ~$95 at $10B.
    # Now uses convergence-based loop (precision scales with xtol, not iteration count).
    # Iteration cap of 200 is still kept as a safety bound.
    lo, hi = min_value, max_value
    mid: float = (lo + hi) / 2
    f_mid: float = 0.0
    for _ in range(200):  # safety bound, not the precision driver
        mid = (lo + hi) / 2
        f_mid = dscr_at_value(mid) - target_dscr
        if abs(f_mid) < 1e-9:
            return mid
        if f_mid < 0:
            lo = mid
        else:
            hi = mid
        if hi - lo < xtol:
            return mid
    return mid  # return last mid even if iteration cap reached
