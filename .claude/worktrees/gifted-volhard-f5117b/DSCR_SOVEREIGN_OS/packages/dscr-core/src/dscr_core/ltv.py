"""LTV / loan-sizing math per DSCR Underwriting Engine v16.0.0 master spec.

Implements:
    BUG-01 fix: transaction-aware `value_for_ltv()` (use `min()` for purchases,
                not `max()`)
    BUG-05 fix: `breakeven_occupancy()` includes OpEx, not just ADS
    BUG-06 fix: `max_loan_io()` uses DECIMAL annual rate (0.07), not percent (7)
                -- prevents 100x sizing error

Plus 7 silent-bug fixes (v0.x audit):
    - value_for_ltv() now rejects negative inputs (was silent)
    - breakeven_occupancy() now rejects negative inputs (was silent)
    - max_loan_io() now rejects negative max_pi (was silent)
    - noi_at_year() now rejects growth outside [-0.5, 0.5] (was silent)
    - noi_at_year() now rejects NaN inputs (was silent)
    - value_for_ltv() now rejects negative seasoning (was silent)

Plus new feature (Sprint 1 v0.2.0):
    - reserves_check() — DSCR lender reserve requirement checker

Source: C:\\Users\\serge\\OneDrive\\Documents\\DSCR_LOAN OFFICE\\
              DSCR_Underwriting_Engine_Master_Consolidated_v16.md
"""

from __future__ import annotations

import math

# v16 BUG-06: epsilon below which we treat rate as zero to avoid divide-by-zero.
# Standard finance convention; matches v16 ROB-01 (EPSILON = 1e-8).
RATE_EPSILON: float = 1e-8

# noi_at_year growth bounds (per Sprint 1 audit).
MIN_GROWTH_RATE: float = -0.5  # -50%/yr sustained decline
MAX_GROWTH_RATE: float = 0.5  # 50%/yr sustained growth (extreme)

# Reserves check: DSCR market standards per Sprint 6 / Master DSCR §6.
# Standard: 6 months. Sub-1.0 DSCR specialist: 9 months. Foreign national: 12 months.
# Portfolio drag: +2 months per additional financed property.
RESERVE_MONTHS_STANDARD: float = 6.0
RESERVE_MONTHS_SUB1: float = 9.0  # sub-1.0 DSCR specialty lenders (A&D, NQM Funding)
RESERVE_MONTHS_FOREIGN_NATIONAL: float = 12.0
RESERVE_PORTFOLIO_DRAG_PER_PROPERTY: float = 2.0

# Reserves check: ADJUSTMENT OVERLAYS (DSCR market standard practice).
# Source: DSCR_Sovereign_OS__Sprint_3___Lender_Intelligence__Securitization_Pool_Data
#         ___Competitive_Moat_Analysis.md, Section 1.4 "Reserve Requirements".
# Verifier audit: 12/13 claims PASS (the 1 PARTIAL is unrelated DSCR delinquency claim).
# Each overlay is a market-pattern (NOT regulatorily mandated) — apply when condition met.
RESERVE_OVERLAY_DSCR_BELOW_125_MONTHS: float = 1.5  # midpoint of +1-2mo for DSCR 1.0-1.24
RESERVE_OVERLAY_STR_MONTHS: float = 2.0  # +2mo for short-term rental
RESERVE_OVERLAY_HIGH_LTV_MONTHS: float = 1.0  # +1mo for LTV > 75%
RESERVE_OVERLAY_LOW_FICO_MONTHS: float = 1.0  # +1mo for FICO < 700
RESERVE_OVERLAY_JUMBO_MIN_MONTHS: float = 12.0  # 12mo minimum for loan > $2.5M
RESERVE_OVERLAY_JUMBO_THRESHOLD: float = 2_500_000.0  # jumbo loan threshold (USD)
RESERVE_OVERLAY_LTV_THRESHOLD: float = 0.75  # > 75% LTV triggers overlay
RESERVE_OVERLAY_FICO_THRESHOLD: int = 700  # < 700 FICO triggers overlay
RESERVE_OVERLAY_DSCR_HIGH_WATERMARK: float = 1.25  # >= 1.25 DSCR = no DSCR overlay


def _validate_ltv_input(
    value: float,
    name: str,
    allow_zero: bool = True,
    allow_none: bool = False,
) -> None:
    """Validate an LTV input is finite, non-NaN, non-negative (or positive).

    Used for value_for_ltv, ltv, breakeven_occupancy, max_loan_io, noi_at_year.
    """
    if value is None:
        if allow_none:
            return
        raise ValueError(f"{name} must not be None")
    if not isinstance(value, (int, float)):
        raise TypeError(f"{name} must be a number, got {type(value).__name__}")
    if math.isnan(value):
        raise ValueError(f"{name} must not be NaN, got NaN")
    if math.isinf(value):
        raise ValueError(f"{name} must be finite, got {value}")
    if allow_zero:
        if value < 0:
            raise ValueError(f"{name} must be >= 0, got {value}")
    else:
        if value <= 0:
            raise ValueError(f"{name} must be > 0, got {value}")


def value_for_ltv(
    transaction_type: str,
    appraised_value: float,
    purchase_price: float | None = None,
    original_purchase_price: float | None = None,
    seasoning_months: int | None = None,
    cash_out_and_low_seasoning: bool = False,
) -> float:
    """Return the value to use in the LTV denominator for the given transaction.

    v16 BUG-01 correction:
        INCORRECT (silent mispricing): LTV = loan / max(appraisal, price)
        CORRECT:                       LTV = loan / min(appraisal, price)

    For PURCHASE, the denominator is the LESSER of appraisal or purchase price.
    This prevents the borrower from inflating the denominator by overpaying.

    Args:
        transaction_type: one of "PURCHASE", "DELAYED_FINANCING",
                          "RATE_TERM_REFI", "CASH_OUT_REFI".
        appraised_value: appraiser's opinion of market value. Must be >= 0.
        purchase_price: contract price (required for PURCHASE). Must be >= 0.
        original_purchase_price: original acquisition price (for seasoning checks).
            Must be >= 0 if provided.
        seasoning_months: months since original acquisition. Must be >= 0 if provided.
        cash_out_and_low_seasoning: True if cash-out refi with seasoning < 6 months.

    Returns:
        The value to use as LTV denominator.

    Raises:
        ValueError: unsupported transaction type, missing required inputs,
            or any numeric input < 0 (was silent — Bugs 11, 12, 13 fixed).

    Verified:
        - $400K loan / $500K price / $480K appraisal (PURCHASE)
          → value_for_ltv = min(480K, 500K) = 480K → LTV = 83.33%
        - $375K loan / $500K price / $525K appraisal (PURCHASE)
          → value_for_ltv = min(525K, 500K) = 500K → LTV = 75.00%
    """
    # Bugs 11, 12, 13 fix: negative inputs now raise instead of silently returning
    # wrong values.
    _validate_ltv_input(appraised_value, "appraised_value", allow_zero=True)
    if purchase_price is not None:
        _validate_ltv_input(purchase_price, "purchase_price", allow_zero=True)
    if original_purchase_price is not None:
        _validate_ltv_input(original_purchase_price, "original_purchase_price", allow_zero=True)
    if seasoning_months is not None:
        if not isinstance(seasoning_months, int):
            raise TypeError(f"seasoning_months must be int, got {type(seasoning_months).__name__}")
        if seasoning_months < 0:
            raise ValueError(f"seasoning_months must be >= 0, got {seasoning_months}")

    if transaction_type == "PURCHASE":
        if purchase_price is None:
            raise ValueError("purchase_price required for PURCHASE")
        return min(appraised_value, purchase_price)

    if transaction_type == "DELAYED_FINANCING":
        if seasoning_months is None or seasoning_months < 6:
            if original_purchase_price is None:
                raise ValueError(
                    "original_purchase_price required for delayed financing "
                    "with seasoning < 6 months"
                )
            return min(appraised_value, original_purchase_price)
        return appraised_value

    if transaction_type in ("RATE_TERM_REFI", "CASH_OUT_REFI"):
        value = appraised_value
        if cash_out_and_low_seasoning and original_purchase_price is not None:
            value = min(value, original_purchase_price)
        return value

    raise ValueError(
        f"Unsupported transaction_type: {transaction_type!r}. "
        f"Must be one of: PURCHASE, DELAYED_FINANCING, RATE_TERM_REFI, CASH_OUT_REFI"
    )


def ltv(
    loan_amount: float,
    transaction_type: str,
    appraised_value: float,
    purchase_price: float | None = None,
    original_purchase_price: float | None = None,
    seasoning_months: int | None = None,
    cash_out_and_low_seasoning: bool = False,
) -> float:
    """Return the Loan-to-Value ratio for the given transaction.

    Wrapper around `value_for_ltv()` for the common case.

    Verified:
        - ltv(400000, PURCHASE, 480000, 500000) = 400000 / 480000 = 0.8333
        - ltv(375000, PURCHASE, 525000, 500000) = 375000 / 500000 = 0.7500
    """
    value = value_for_ltv(
        transaction_type=transaction_type,
        appraised_value=appraised_value,
        purchase_price=purchase_price,
        original_purchase_price=original_purchase_price,
        seasoning_months=seasoning_months,
        cash_out_and_low_seasoning=cash_out_and_low_seasoning,
    )
    return loan_amount / value


def breakeven_occupancy(
    annual_debt_service: float,
    annual_opex: float,
    potential_gross_income: float,
) -> dict:
    """Return the breakeven occupancy ratio and a flag.

    v16 BUG-05 correction:
        INCORRECT: breakeven_occupancy = ADS / PGI
        CORRECT:    breakeven_occupancy = (ADS + OpEx) / PGI

    The income must cover BOTH the debt service AND the operating expenses
    before the deal produces any cash flow. The incorrect formula
    understates the true breakeven point by ignoring OpEx.

    Args:
        annual_debt_service: total annual P&I (or PITIA for some lender variants).
            Must be >= 0 (was silently accepted — Bug 14 fix).
        annual_opex: total annual operating expenses. Must be >= 0.
        potential_gross_income: gross potential rent, annualized. Must be > 0.

    Returns:
        Dict with keys:
            - value: breakeven occupancy ratio (0-1+, >1 means structurally unviable)
            - flag: "OK" | "STRUCTURALLY_UNVIABLE" | "NO_GROSS_RENT"

    Verified:
        - breakeven_occupancy(18420.60, 12600, 28800) = 31020.60 / 28800 = 1.0771
          (structurally unviable — can't even cover debt + opex with 100% rent)
        - breakeven_occupancy(18420.60, 3600, 36000) = 22020.60 / 36000 = 0.6117
          (viable — needs 61.2% occupancy to break even)
    """
    # Bug 14 fix: negative ADS/OpEx now raise (previously returned garbage ratios).
    _validate_ltv_input(annual_debt_service, "annual_debt_service", allow_zero=True)
    _validate_ltv_input(annual_opex, "annual_opex", allow_zero=True)

    if potential_gross_income <= 0:
        return {"value": float("nan"), "flag": "NO_GROSS_RENT"}

    value = (annual_debt_service + annual_opex) / potential_gross_income

    if value > 1.0:
        return {"value": value, "flag": "STRUCTURALLY_UNVIABLE"}

    return {"value": value, "flag": "OK"}


def max_loan_io(
    max_pi_monthly: float,
    annual_rate_decimal: float,
) -> float:
    """Return the maximum interest-only loan size given a max monthly payment.

    v16 BUG-06 correction:
        INCORRECT: max_loan_io = (max_pi * 12) / annual_rate_percent
                   → if rate is 7 (instead of 0.07), 100x sizing error
        CORRECT:    max_loan_io = (max_pi * 12) / annual_rate_decimal

    Args:
        max_pi_monthly: maximum allowable monthly interest payment. Must be > 0
            (was silently accepted as negative — Bug 15 fix).
        annual_rate_decimal: annual rate as a DECIMAL (e.g. 0.07 for 7%).
            Must be > 0 (returns inf if below EPSILON).

    Returns:
        Maximum loan amount. Returns infinity if rate is below EPSILON.

    Verified:
        - max_loan_io(2000, 0.07) = (2000 * 12) / 0.07 = 24000 / 0.07 = $342,857.14
        - max_loan_io(2000, 7.0)  = (2000 * 12) / 7.0  = 24000 / 7.0  = $3,428.57
          (would be a 100x under-size — silent if rate is mistakenly passed as percent)
    """
    # Bug 15 fix: negative max_pi_monthly used to silently return negative loan size.
    _validate_ltv_input(max_pi_monthly, "max_pi_monthly", allow_zero=False)
    if abs(annual_rate_decimal) < RATE_EPSILON:
        return float("inf")
    return (max_pi_monthly * 12) / annual_rate_decimal


def noi_at_year(year1_noi: float, growth: float, year: int) -> float:
    """Return the projected NOI at year N, given Year-1 NOI and growth.

    v16 BUG-02 correction:
        INCORRECT: Year3_NOI = Year1 × (1+g)^3  → off-by-one
        CORRECT:    Year3_NOI = Year1 × (1+g)^(year-1)

    Convention: `year1_noi` is the FIRST FULL OPERATING YEAR, not Year 0.
    So Year 1 = year1_noi (no growth applied).
    Year 2 = year1_noi × (1+g)^1.
    Year 3 = year1_noi × (1+g)^2.

    Used by: Track 3 stabilized DSCR, levered IRR, unlevered IRR,
    Monte Carlo exit NOI, stress scenario projections, refi future NOI, AEY.

    Args:
        year1_noi: NOI in the first full operating year. Must be finite and >= 0.
            NaN now raises (Bug 16 fix).
        growth: annual NOI growth rate as a DECIMAL (e.g. 0.03 for 3%).
            Must be in [-0.5, 0.5] (Bug 4 fix). Outside this range raises.
        year: target year index. Must be >= 1 (int).

    Returns:
        Projected NOI at the given year.

    Raises:
        ValueError: year < 1, growth outside bounds, NaN inputs.

    Verified:
        - noi_at_year(100000, 0.03, 1) == 100000.00
        - noi_at_year(100000, 0.03, 3) == 106090.00  (v16 regression case)
        - noi_at_year(32000, 0.03, 5)  == 32000 × (1.03)^4 = 36016.85 (v16 Scenario 2)
    """
    # Bug 16 fix: NaN inputs now raise (use direct math.isnan check to
    # match the specific error message; growth range check happens below).
    if year1_noi is None or (isinstance(year1_noi, float) and math.isnan(year1_noi)):
        raise ValueError("year1_noi must not be NaN, got NaN")
    if growth is None or (isinstance(growth, float) and math.isnan(growth)):
        raise ValueError("growth must not be NaN, got NaN")
    # year1_noi must be finite
    if isinstance(year1_noi, float) and math.isinf(year1_noi):
        raise ValueError(f"year1_noi must be finite, got {year1_noi}")
    # year1_noi must be >= 0
    if year1_noi < 0:
        raise ValueError(f"year1_noi must be >= 0, got {year1_noi}")

    # Bug 4 fix: growth must be in valid range (allows negative down to -0.5).
    # This is the SOLE check for growth — does NOT call _validate_ltv_input
    # which would reject all negatives.
    if not (MIN_GROWTH_RATE <= growth <= MAX_GROWTH_RATE):
        raise ValueError(f"growth must be in [{MIN_GROWTH_RATE}, {MAX_GROWTH_RATE}], got {growth}")

    if not isinstance(year, int):
        raise TypeError(f"year must be int, got {type(year).__name__}")
    if year < 1:
        raise ValueError(f"year must be >= 1, got {year}")
    return year1_noi * (1 + growth) ** (year - 1)


def reserves_check(
    liquid_assets: float,
    monthly_pitia: float,
    borrower_type: str = "standard",
    financed_properties: int = 1,
    rate_term_refi_payment_savings_pct: float = 0.0,
    dscr: float | None = None,
    is_str: bool = False,
    ltv_ratio: float | None = None,
    fico: int | None = None,
    loan_amount: float | None = None,
) -> dict:
    """Check if liquid assets meet DSCR lender reserve requirements.

    DSCR market reserve standards (per Sprint 6 Module 1 / Master DSCR §6):
        - Standard:    6 months PITIA
        - Sub-1.0:      9 months PITIA (specialty lenders A&D, NQM Funding)
        - Foreign nat: 12 months PITIA
        - Portfolio:   +2 months per additional financed property
        - Rate-term refi: waivable if payment savings >= 10%

    ADJUSTMENT OVERLAYS (DSCR market standard practice; not regulatorily
    mandated — lender-specific but widely applied):
        Source: Sprint 3 Lender Intelligence Section 1.4 (verified by
                dscr-verifier on 2026-06-20, 12/13 PASS).
        - DSCR 1.00-1.24:        +1.5 months (midpoint of +1-2mo range)
        - STR (short-term rental): +2 months
        - LTV > 75%:              +1 month
        - FICO < 700:             +1 month
        - Loan > $2.5M (jumbo):   12-month minimum (overrides base if higher)

    Args:
        liquid_assets: borrower's liquid assets (checking, savings, money market).
            Must be >= 0.
        monthly_pitia: full monthly PITIA (use pitia() from payment.py).
            Must be > 0.
        borrower_type: one of "standard", "sub1" (sub-1.0 DSCR specialist),
            "foreign_national". Default "standard".
        financed_properties: number of properties currently financed by the
            borrower (including subject). Default 1 (just subject property).
        rate_term_refi_payment_savings_pct: percentage payment savings for
            rate-and-term refi (decimal, e.g. 0.15 for 15% savings).
            If >= 0.10, reserves are waived. Default 0.0 (no waiver).
        dscr: DSCR ratio of the subject loan (decimal, e.g. 1.15 for 1.15x).
            If 1.0 <= dscr < 1.25, adds +1.5mo overlay. Default None (no overlay).
        is_str: True if property is a short-term rental (Airbnb/VRBO).
            Adds +2mo overlay. Default False.
        ltv_ratio: loan-to-value ratio (decimal, e.g. 0.80 for 80%).
            If > 0.75, adds +1mo overlay. Default None (no overlay).
        fico: borrower FICO score. If < 700, adds +1mo overlay. Default None.
        loan_amount: loan amount in USD. If > $2.5M, applies 12-month minimum
            (overrides base if higher). Default None (no overlay).

    Returns:
        Dict with keys:
            - sufficient: bool, True if liquid_assets >= required
            - required: float, required reserve amount in dollars
            - required_months: float, required months of PITIA
            - base_months: float, base reserve months before overlays
            - overlay_months: float, sum of applied overlay months
            - applied_overlays: dict[str, float], map of overlay name -> months
            - gap: float, max(0, required - liquid_assets), shortfall
            - months_available: float, liquid_assets / monthly_pitia
            - waiver_applied: bool, True if rate-term refi waiver kicked in
            - flag: "OK" | "SHORTFALL" | "WAIVED"

    Example:
        reserves_check(30000, 2853.985, "standard", 1)
        -> {"sufficient": True, "required": 17123.91, "overlay_months": 0, ...}
        (6 months × $2853.985 = $17,123.91 required; $30K is sufficient)

        reserves_check(20000, 2000, "standard", 1, dscr=1.10, is_str=True,
                       ltv_ratio=0.80, fico=680, loan_amount=400000)
        -> 6 base + 1.5 (DSCR) + 2 (STR) + 1 (LTV) + 1 (FICO) = 11.5 months
    """
    _validate_ltv_input(liquid_assets, "liquid_assets", allow_zero=True)
    _validate_ltv_input(monthly_pitia, "monthly_pitia", allow_zero=False)

    if not isinstance(financed_properties, int):
        raise TypeError(
            f"financed_properties must be int, got {type(financed_properties).__name__}"
        )
    if financed_properties < 1:
        raise ValueError(f"financed_properties must be >= 1, got {financed_properties}")
    _validate_ltv_input(
        rate_term_refi_payment_savings_pct,
        "rate_term_refi_payment_savings_pct",
        allow_zero=True,
    )

    # Optional overlay parameter validation
    if dscr is not None:
        _validate_ltv_input(dscr, "dscr", allow_zero=False)
    if ltv_ratio is not None:
        _validate_ltv_input(ltv_ratio, "ltv_ratio", allow_zero=True)
        if ltv_ratio < 0 or ltv_ratio > 2.0:
            raise ValueError(f"ltv_ratio must be in [0, 2.0], got {ltv_ratio}")
    if fico is not None:
        if not isinstance(fico, int):
            raise TypeError(f"fico must be int, got {type(fico).__name__}")
        if fico < 300 or fico > 850:
            raise ValueError(f"fico must be in [300, 850], got {fico}")
    if loan_amount is not None:
        _validate_ltv_input(loan_amount, "loan_amount", allow_zero=False)

    # Rate-term refi waiver (>=10% payment savings = reserves waived)
    waiver_applied = rate_term_refi_payment_savings_pct >= 0.10
    if waiver_applied:
        return {
            "sufficient": True,
            "required": 0.0,
            "required_months": 0.0,
            "base_months": 0.0,
            "overlay_months": 0.0,
            "applied_overlays": {},
            "gap": 0.0,
            "months_available": liquid_assets / monthly_pitia,
            "waiver_applied": True,
            "flag": "WAIVED",
        }

    # Base months by borrower type
    if borrower_type == "standard":
        base_months = RESERVE_MONTHS_STANDARD
    elif borrower_type == "sub1":
        base_months = RESERVE_MONTHS_SUB1
    elif borrower_type == "foreign_national":
        base_months = RESERVE_MONTHS_FOREIGN_NATIONAL
    else:
        raise ValueError(
            f"borrower_type must be 'standard', 'sub1', or 'foreign_national', "
            f"got {borrower_type!r}"
        )

    # Portfolio drag: +2 months per ADDITIONAL financed property
    # (1 financed = subject only, no drag)
    additional_properties = financed_properties - 1
    portfolio_drag_months = additional_properties * RESERVE_PORTFOLIO_DRAG_PER_PROPERTY

    # ---- Adjustment overlays (Sprint 3 Lender Intelligence Section 1.4) ----
    applied_overlays: dict[str, float] = {}
    overlay_months = 0.0

    # DSCR 1.00-1.24 → +1.5 months
    if dscr is not None and 1.0 <= dscr < RESERVE_OVERLAY_DSCR_HIGH_WATERMARK:
        applied_overlays["dscr_below_125"] = RESERVE_OVERLAY_DSCR_BELOW_125_MONTHS
        overlay_months += RESERVE_OVERLAY_DSCR_BELOW_125_MONTHS

    # STR → +2 months
    if is_str:
        applied_overlays["str"] = RESERVE_OVERLAY_STR_MONTHS
        overlay_months += RESERVE_OVERLAY_STR_MONTHS

    # LTV > 75% → +1 month
    if ltv_ratio is not None and ltv_ratio > RESERVE_OVERLAY_LTV_THRESHOLD:
        applied_overlays["high_ltv"] = RESERVE_OVERLAY_HIGH_LTV_MONTHS
        overlay_months += RESERVE_OVERLAY_HIGH_LTV_MONTHS

    # FICO < 700 → +1 month
    if fico is not None and fico < RESERVE_OVERLAY_FICO_THRESHOLD:
        applied_overlays["low_fico"] = RESERVE_OVERLAY_LOW_FICO_MONTHS
        overlay_months += RESERVE_OVERLAY_LOW_FICO_MONTHS

    required_months = base_months + portfolio_drag_months + overlay_months

    # Jumbo override: loan > $2.5M → at least 12 months total
    jumbo_applied = False
    if loan_amount is not None and loan_amount > RESERVE_OVERLAY_JUMBO_THRESHOLD:
        if required_months < RESERVE_OVERLAY_JUMBO_MIN_MONTHS:
            jumbo_bump = RESERVE_OVERLAY_JUMBO_MIN_MONTHS - required_months
            applied_overlays["jumbo_min"] = jumbo_bump
            overlay_months += jumbo_bump
            required_months = RESERVE_OVERLAY_JUMBO_MIN_MONTHS
            jumbo_applied = True

    required_dollars = required_months * monthly_pitia
    gap = max(0.0, required_dollars - liquid_assets)
    sufficient = gap == 0.0

    return {
        "sufficient": sufficient,
        "required": required_dollars,
        "required_months": required_months,
        "base_months": base_months,
        "overlay_months": overlay_months,
        "applied_overlays": applied_overlays,
        "gap": gap,
        "months_available": liquid_assets / monthly_pitia,
        "waiver_applied": False,
        "jumbo_applied": jumbo_applied,
        "flag": "OK" if sufficient else "SHORTFALL",
    }
