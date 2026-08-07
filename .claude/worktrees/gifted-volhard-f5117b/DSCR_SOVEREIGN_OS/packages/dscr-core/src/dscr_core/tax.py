"""After-Tax Engine (Slice 3) for DSCR Sovereign OS.

Per SR 26-02 architectural decision: this module is NOT a model
(it's pure deterministic tax arithmetic). No model card required.

Implements:
    - MACRS depreciation: IRC §168 (27.5yr SL residential / 39yr SL commercial)
    - Depreciation recapture: IRC §1250 (0% residential Bucket 1 / 25% max commercial)
    - Capital gains: IRC §1001 (LTCG > 1yr holding vs STCG <= 1yr)
    - Net Investment Income Tax (NIIT): IRC §1411 (3.8% on net investment income)
    - Passive Activity Loss (PAL) phaseout: IRC §469 ($25k allowance, phase-out
      $0.50/$1 over $100k MAGI, zero at $150k MAGI)
    - Real Estate Professional (REP) status: IRC §469(c)(7) (>=750 hours AND
      >=50% of total work hours; eliminates NIIT for qualifying taxpayers)

Primary sources:
    - IRC §168 (MACRS depreciation)
    - IRC §1250 (depreciation recapture)
    - IRC §469 (passive activity loss rules)
    - IRC §469(c)(7) (real estate professional status)
    - IRC §1411 (net investment income tax)
    - IRS Pub 527 (Residential Rental Property depreciation)
    - Sprint 4 Master (after-tax IRR framework)
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class FilingStatus(str, Enum):
    """IRS filing status. Drives NIIT threshold + standard deduction.

    NIIT MAGI thresholds (per IRC §1411):
        SINGLE:     $200,000
        MFJ:        $250,000
        MFS:        $125,000
        HOH:        $200,000 (same as SINGLE)
    """

    SINGLE = "single"
    MFJ = "mfj"
    MFS = "mfs"
    HOH = "hoh"


class PropertyType(str, Enum):
    """Property type for depreciation + recapture.

    RESIDENTIAL_RENTAL: 27.5yr SL MACRS, §1250 recapture = 0% (Bucket 1)
    COMMERCIAL: 39yr SL MACRS, §1250 recapture = 25% max (ordinary income cap)
    """

    RESIDENTIAL_RENTAL = "residential_rental"
    COMMERCIAL = "commercial"


# NIIT MAGI thresholds by filing status (IRC §1411)
NIIT_MAGI_THRESHOLD = {
    FilingStatus.SINGLE: 200_000.0,
    FilingStatus.MFJ: 250_000.0,
    FilingStatus.MFS: 125_000.0,
    FilingStatus.HOH: 200_000.0,
}

# PAL allowance + phaseout parameters (IRC §469(i))
PAL_ALLOWANCE_BASE: float = 25_000.0  # $25k max special allowance
PAL_PHASEOUT_START: float = 100_000.0  # MAGI where phase-out begins
PAL_PHASEOUT_END: float = 150_000.0  # MAGI where allowance = 0
PAL_PHASEOUT_RATE: float = 0.50  # $0.50 reduction per $1 of MAGI over start

# MACRS recovery periods (years)
MACRS_PERIOD_RESIDENTIAL: int = 27  # 27.5 years rounded
MACRS_PERIOD_COMMERCIAL: int = 39

# §1250 recapture cap (% of depreciation taken, max ordinary income rate)
SECTION_1250_RECAPTURE_RATE: float = 0.25  # 25% max recapture rate (IRC §1250)


@dataclass(frozen=True)
class DepreciationSchedule:
    """MACRS straight-line depreciation schedule.

    Attributes:
        annual_depreciation: depreciation amount per year (constant under SL)
        cumulated_through_year: cumulative depreciation through given year
        book_value_at_year: remaining cost basis after given year
        property_type: RESIDENTIAL_RENTAL or COMMERCIAL
        recovery_period_years: 27 (residential) or 39 (commercial)
        cost_basis: original cost basis for depreciation
    """

    annual_depreciation: float
    cumulated_through_year: float
    book_value_at_year: float
    property_type: PropertyType
    recovery_period_years: int
    cost_basis: float


def macrs_depreciation_schedule(
    property_type: PropertyType,
    cost_basis: float,
    year: int,
) -> DepreciationSchedule:
    """Compute MACRS straight-line depreciation through a given year.

    Uses straight-line (SL) convention per IRC §168(e)(2):
        - Residential rental (27.5yr): §168(e)(2)(A); IRS Pub 527
        - Commercial (39yr): §168(e)(2)(B)

    Note: This is SIMPLIFIED — does not implement mid-month convention
    (which would shift the first-year depreciation). For DSCR analysis
    precision, the full MACRS table lookup is in Sprint 4 spec.

    Args:
        property_type: RESIDENTIAL_RENTAL or COMMERCIAL
        cost_basis: depreciable basis in dollars (typically purchase price
            + capitalized closing costs - land value).
        year: year number (1, 2, ..., recovery_period).

    Returns:
        DepreciationSchedule with annual, cumulated, book_value.

    Raises:
        ValueError: on invalid property_type or negative cost_basis.
    """
    if cost_basis < 0:
        raise ValueError(f"cost_basis must be >= 0; got {cost_basis}")
    if year < 0:
        raise ValueError(f"year must be >= 0; got {year}")

    if property_type == PropertyType.RESIDENTIAL_RENTAL:
        period = MACRS_PERIOD_RESIDENTIAL + 1  # 27.5 in full precision
        annual = cost_basis / 27.5  # simplified SL (no mid-month)
    elif property_type == PropertyType.COMMERCIAL:
        period = MACRS_PERIOD_COMMERCIAL
        annual = cost_basis / 39.0
    else:
        raise ValueError(
            f"property_type must be RESIDENTIAL_RENTAL or COMMERCIAL, got {property_type!r}"
        )

    # Cap cumulated depreciation at full cost_basis (no negative book value)
    cumulated = min(annual * year, cost_basis)
    book_value = max(cost_basis - cumulated, 0.0)

    return DepreciationSchedule(
        annual_depreciation=annual,
        cumulated_through_year=cumulated,
        book_value_at_year=book_value,
        property_type=property_type,
        recovery_period_years=period,
        cost_basis=cost_basis,
    )


def section_1250_recapture(
    depreciation_taken: float,
    sale_price: float,
    cost_basis: float,
    property_type: PropertyType,
    ordinary_tax_rate: float = 0.32,
) -> dict:
    """Compute IRC §1250 depreciation recapture on property sale.

    Rules per IRC §1250:
        - §1250 recapture only applies to depreciation taken IN EXCESS of
          straight-line (i.e., accelerated depreciation).
        - For DSCR properties using straight-line MACRS (the standard
          convention), §1250 recapture = 0% (Bucket 1).
        - However, "unrecaptured §1250 gain" is taxed at MAX 25% (the
          difference between sale price and adjusted basis, up to
          cumulative SL depreciation).
        - For commercial property, accumulated §1245/§1250 recapture
          may apply if accelerated depreciation was used (e.g., bonus
          depreciation pre-OBBBA).

    For residential rental on SL: recapture_amount = 0 (Bucket 1).
    For commercial on SL: recapture_amount = min(depreciation_taken,
        max(0, sale_price - cost_basis)) * 0.25 (capped at 25% rate).
    Gain above adjusted basis is capital gain.

    Args:
        depreciation_taken: cumulative depreciation claimed.
        sale_price: gross sale price.
        cost_basis: original cost basis (matches depreciation_taken basis).
        property_type: RESIDENTIAL_RENTAL or COMMERCIAL.
        ordinary_tax_rate: marginal rate used to compute recapture tax
            (must be <= 0.25 for §1250 cap to be relevant). Default 0.32.

    Returns:
        Dict with keys:
            - recapture_amount: dollars subject to §1250 recapture
            - recapture_rate: effective rate (0 for residential SL, 0.25
                for commercial SL "unrecaptured §1250 gain" cap)
            - recapture_tax: tax owed on recapture (rate * amount)
            - capital_gain: gain above adjusted basis (LTCG/STCG rate)
            - adjusted_basis: cost_basis - depreciation_taken
            - total_tax: recapture_tax + capital_gain * 0.20 (assuming
                LTCG 20% baseline; user can override)
    """
    if depreciation_taken < 0:
        raise ValueError(f"depreciation_taken must be >= 0; got {depreciation_taken}")
    if sale_price < 0:
        raise ValueError(f"sale_price must be >= 0; got {sale_price}")
    if cost_basis < 0:
        raise ValueError(f"cost_basis must be >= 0; got {cost_basis}")
    if not 0.0 <= ordinary_tax_rate <= 1.0:
        raise ValueError(f"ordinary_tax_rate must be in [0, 1]; got {ordinary_tax_rate}")

    adjusted_basis = cost_basis - depreciation_taken
    gain = sale_price - adjusted_basis

    if property_type == PropertyType.RESIDENTIAL_RENTAL:
        # SL only → §1250 recapture = 0 (Bucket 1). Excess gain is capital gain.
        recapture_amount = 0.0
        recapture_rate = 0.0
    elif property_type == PropertyType.COMMERCIAL:
        # "Unrecaptured §1250 gain" = lesser of depreciation taken or gain.
        # Taxed at MAX 25% (capped) under §1(h).
        unrecaptured_1250_gain = min(depreciation_taken, max(0.0, gain))
        recapture_amount = unrecaptured_1250_gain
        recapture_rate = min(0.25, ordinary_tax_rate) if ordinary_tax_rate <= 0.25 else 0.25
    else:
        raise ValueError(
            f"property_type must be RESIDENTIAL_RENTAL or COMMERCIAL, got {property_type!r}"
        )

    recapture_tax = recapture_amount * recapture_rate
    capital_gain = max(0.0, gain - recapture_amount)
    capital_gain_tax = capital_gain * 0.20  # baseline LTCG 20% (override as needed)

    return {
        "recapture_amount": recapture_amount,
        "recapture_rate": recapture_rate,
        "recapture_tax": recapture_tax,
        "capital_gain": capital_gain,
        "adjusted_basis": adjusted_basis,
        "capital_gain_tax": capital_gain_tax,
        "total_tax": recapture_tax + capital_gain_tax,
    }


def niit(
    magi: float,
    filing_status: FilingStatus,
    net_investment_income: float,
) -> dict:
    """Compute Net Investment Income Tax (NIIT) per IRC §1411.

    NIIT = 3.8% on LESSER of:
        (a) net_investment_income
        (b) MAGI in EXCESS of filing-status threshold

    If MAGI <= threshold, NIIT = 0 (the threshold floor is the floor).

    Args:
        magi: Modified Adjusted Gross Income in dollars.
        filing_status: one of FilingStatus enum values.
        net_investment_income: investment income for the year (rental
            income net of opex for DSCR landlords).

    Returns:
        Dict with keys:
            - niit_owed: tax in dollars (3.8% of lesser amount)
            - magi_excess: MAGI above threshold (max 0)
            - niit_base: the lesser of (net_investment_income, magi_excess)
            - threshold: the MAGI threshold for this filing status

    Note: Real Estate Professional (REP) status eliminates NIIT for
    qualifying taxpayers — caller should check rep_status() and pass
    niit_base = 0 if REP applies.
    """
    threshold = NIIT_MAGI_THRESHOLD[filing_status]
    magi_excess = max(0.0, magi - threshold)
    niit_base = min(net_investment_income, magi_excess)
    niit_owed = niit_base * 0.038
    return {
        "niit_owed": niit_owed,
        "magi_excess": magi_excess,
        "niit_base": niit_base,
        "threshold": threshold,
    }


def pal_phaseout(magi: float, filing_status: FilingStatus) -> dict:
    """Compute Passive Activity Loss (PAL) special allowance after phaseout.

    Per IRC §469(i):
        - Base allowance: $25,000
        - Phaseout: $0.50 reduction per $1 of MAGI over $100,000
        - Fully phased out at MAGI = $150,000 (allowance = 0)
        - MFS filers: ZERO allowance (regardless of MAGI)

    Args:
        magi: Modified Adjusted Gross Income.
        filing_status: IRS filing status (drives MFS rule).

    Returns:
        Dict with keys:
            - allowance: remaining special allowance after phaseout
            - phaseout_applied: dollars of phaseout reduction
            - base_allowance: pre-phaseout allowance ($25k or $0)
            - phaseout_complete: True if allowance = 0

    Note: Active participation also requires non-self-rental. This
    function returns the MAGI-based phaseout only — caller must verify
    active participation separately.
    """
    # MFS filers get no special allowance (married filing separately)
    if filing_status == FilingStatus.MFS:
        return {
            "allowance": 0.0,
            "phaseout_applied": PAL_ALLOWANCE_BASE,
            "base_allowance": 0.0,
            "phaseout_complete": True,
        }

    base = PAL_ALLOWANCE_BASE
    if magi <= PAL_PHASEOUT_START:
        phaseout = 0.0
    elif magi >= PAL_PHASEOUT_END:
        phaseout = base
    else:
        phaseout = base * PAL_PHASEOUT_RATE * (magi - PAL_PHASEOUT_START) / base

    allowance = max(0.0, base - phaseout)
    return {
        "allowance": allowance,
        "phaseout_applied": phaseout,
        "base_allowance": base,
        "phaseout_complete": allowance <= 0.0,
    }


def rep_status(hours_worked: float, total_work_hours: float) -> dict:
    """Check Real Estate Professional (REP) status per IRC §469(c)(7).

    REP requires BOTH:
        (a) More than 750 hours in real property trades or businesses
        (b) More than 50% of total work hours in real property trades

    Args:
        hours_worked: hours spent in real property trades/businesses
        total_work_hours: total work hours across all trades/businesses

    Returns:
        Dict with keys:
            - is_rep: True if both REP tests pass
            - hours_test_passed: True if hours_worked > 750
            - majority_test_passed: True if hours_worked > 50% of total
            - material_participation_implied: True if is_rep (REP status
                implies material participation in real property activities,
                allowing losses to be non-passive for tax purposes)
            - hours_worked: echoed
            - total_work_hours: echoed
            - hours_pct: hours_worked / total_work_hours (0 if total=0)

    Effect on NIIT: REP status eliminates NIIT on rental income for
    qualifying taxpayers (caller should zero niit_base if is_rep).
    """
    if hours_worked < 0:
        raise ValueError(f"hours_worked must be >= 0; got {hours_worked}")
    if total_work_hours < 0:
        raise ValueError(f"total_work_hours must be >= 0; got {total_work_hours}")

    hours_test_passed = hours_worked > 750
    hours_pct = hours_worked / total_work_hours if total_work_hours > 0 else 0.0
    majority_test_passed = hours_pct > 0.50
    is_rep = hours_test_passed and majority_test_passed

    return {
        "is_rep": is_rep,
        "hours_test_passed": hours_test_passed,
        "majority_test_passed": majority_test_passed,
        "material_participation_implied": is_rep,
        "hours_worked": hours_worked,
        "total_work_hours": total_work_hours,
        "hours_pct": hours_pct,
    }


def after_tax_cash_flow(
    gross_rent: float,
    opex: float,
    interest_paid: float,
    principal_paid: float,
    depreciation: float,
    ordinary_tax_rate: float,
    filing_status: FilingStatus,
    magi: float,
    rep_hours_worked: float = 0.0,
    rep_total_work_hours: float = 0.0,
    ltcg_tax_rate: float = 0.20,
    apply_niit: bool = True,
    apply_pal: bool = True,
) -> dict:
    """Compute annual after-tax cash flow for a DSCR landlord.

    Combines:
        1. Net rental income (gross_rent - opex)
        2. Minus interest (deductible for active landlords)
        3. Minus depreciation (MACRS)
        4. Equals taxable rental income (before PAL allowance)
        5. Apply PAL allowance if applicable
        6. Compute ordinary income tax
        7. Compute NIIT (if not REP and MAGI > threshold)
        8. Subtract principal paid (cash flow, not tax)
        Equals after-tax cash flow.

    Args:
        gross_rent: annual gross rental income.
        opex: annual operating expenses (taxes, insurance, mgmt, capex).
        interest_paid: annual mortgage interest paid.
        principal_paid: annual mortgage principal paid.
        depreciation: annual MACRS depreciation.
        ordinary_tax_rate: marginal ordinary tax rate (e.g. 0.32 = 32%).
        filing_status: IRS filing status.
        magi: Modified Adjusted Gross Income (across ALL income sources).
        rep_hours_worked: hours in real property for REP test.
        rep_total_work_hours: total work hours for REP test.
        ltcg_tax_rate: LTCG rate (default 0.20 = 20%).
        apply_niit: If True, compute NIIT (default True). Set False to skip.
        apply_pal: If True, apply PAL allowance (default True).

    Returns:
        Dict with keys:
            - net_rental_income: gross_rent - opex
            - taxable_rental_income: before PAL
            - pal_allowance_applied: PAL special allowance used
            - taxable_after_pal: after PAL
            - ordinary_tax: tax on taxable_after_pal
            - niit_owed: NIIT tax (0 if REP or below threshold)
            - principal_paid: cash outflow (not tax)
            - after_tax_cash_flow: net cash to landlord
            - is_rep: REP status result
    """
    # Step 1: net rental income
    net_rental = gross_rent - opex

    # Step 2-4: taxable rental income
    taxable = net_rental - interest_paid - depreciation

    # Step 5: PAL allowance (if active participant and apply_pal=True)
    pal = pal_phaseout(magi, filing_status)
    pal_allowance = pal["allowance"] if apply_pal else 0.0
    # PAL can only reduce taxable down to 0 (not negative)
    taxable_after_pal = max(0.0, taxable - pal_allowance)

    # Step 6: ordinary income tax
    ordinary_tax = max(0.0, taxable_after_pal) * ordinary_tax_rate

    # Step 7: NIIT (if not REP and apply_niit=True)
    rep = rep_status(rep_hours_worked, rep_total_work_hours)
    if rep["is_rep"] or not apply_niit:
        niit_owed = 0.0
    else:
        # NIIT base = net rental income (use net_rental, not taxable_after_pal
        # — IRC §1411 uses net investment income, which is broader than
        # taxable income; for DSCR rental it's typically = net_rental).
        niit_result = niit(
            magi=magi,
            filing_status=filing_status,
            net_investment_income=max(0.0, net_rental),
        )
        niit_owed = niit_result["niit_owed"]

    # Step 8: after-tax cash flow (subtract principal and taxes from rent)
    after_tax_cf = net_rental - interest_paid - ordinary_tax - niit_owed - principal_paid

    return {
        "net_rental_income": net_rental,
        "taxable_rental_income": taxable,
        "pal_allowance_applied": pal_allowance,
        "taxable_after_pal": taxable_after_pal,
        "ordinary_tax": ordinary_tax,
        "niit_owed": niit_owed,
        "principal_paid": principal_paid,
        "after_tax_cash_flow": after_tax_cf,
        "is_rep": rep["is_rep"],
    }


__all__ = [
    "FilingStatus",
    "PropertyType",
    "NIIT_MAGI_THRESHOLD",
    "PAL_ALLOWANCE_BASE",
    "PAL_PHASEOUT_START",
    "PAL_PHASEOUT_END",
    "PAL_PHASEOUT_RATE",
    "MACRS_PERIOD_RESIDENTIAL",
    "MACRS_PERIOD_COMMERCIAL",
    "SECTION_1250_RECAPTURE_RATE",
    "DepreciationSchedule",
    "macrs_depreciation_schedule",
    "section_1250_recapture",
    "niit",
    "pal_phaseout",
    "rep_status",
    "after_tax_cash_flow",
]
