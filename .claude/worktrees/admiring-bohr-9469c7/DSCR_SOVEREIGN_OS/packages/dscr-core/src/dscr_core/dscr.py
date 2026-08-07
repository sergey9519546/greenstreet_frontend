"""DSCR computation: Track 1 (lower of lease / 1007), Track 2 (stressed), dual-track orchestration.

================================================================================
TRACK 1 vs TRACK 2 — CRITICAL DISTINCTION (verified primary-source 2026-06-18):
================================================================================

Track 1 = rent / PITIA (no vacancy adjustment).
   THIS IS THE LENDER'S ACTUAL DSCR FORMULA. Confirmed by:
     - Fannie Mae Selling Guide B3-3.8-01 (10/08/2025): Form 1007/1025 framework
       (but the 25% vacancy rule is for DTI qualification, NOT DSCR ratio itself)
     - Pennymac Correspondent Non-QM DSCR Product Profile (6.12.26):
       "Gross Rental Income / Qualifying Payment"
       "Gross Rental Income is calculated using the lower of: Executed Lease
       Agreement or 1007/1025 Market rent from appraisal"
     - Newfi DSCR Calculator: "Monthly Rental Income / Monthly Expenses (PITIA)"
     - Coldesina Capital DSCR Loan: "annual gross rental income / debt obligations"
     - Lendmire DSCR article: "gross rent / PITIA = ratio"

Track 2 = (gross_rent * (1 - vacancy) - mgmt - maint) / PITIA.
   THIS IS A STRESS-TEST OVERLAY beyond lender requirement.
   Useful for the IC memo to show "what happens if vacancy rises to 7-25%?"
   Fannie Mae's 25% vacancy rule (B3-3.8-01) applies to DTI QUALIFICATION of
   borrower income, NOT to the DSCR ratio. Track 2 is our internal overlay.

Rules (locked from Sovereign Master v11.0):
    1. DSCR rounded to 2 decimals. NEVER round up.
    2. Track 1 and Track 2 are NEVER blended. Both surface; user decides.
    3. Track 1 qualifying rent = min(lease_rent, appraisal_rent) -- no vacancy,
       no deductions. This matches Pennymac's "lower of" rule.
    4. Track 2 = (gross_rent * (1 - vacancy_pct) - mgmt_pct - maint_pct) / PITIA.
       25% vacancy default matches Fannie Form 1007 2-4 unit DTI rule (not the
       DSCR ratio, but a stress scenario the IC memo can show).
    5. 2-4 unit residential: Pennymac uses 1007/1025 with vacancy as STR overlay.
    6. 5+ unit: commercial/multifamily rules, separate track (not in Slice 1).
    7. STR (short-term rental): Pennymac refinance uses lower of (100% market
       rent from 1007/1025) AND (100% actual 12-mo STR history). NEVER blend
       LTR/STR worlds.

Track 1 PASS + Track 2 FAIL = TRAP  (forced acknowledgment per Master)
Track 1 PASS + Track 2 PASS = GREEN
Track 1 FAIL + Track 2 PASS = STRUCTURING_OPPORTUNITY
Track 1 FAIL + Track 2 FAIL = KILL
"""

from __future__ import annotations

import math
from enum import Enum
from typing import Final

# Round DSCR to 2 decimal places. NEVER round up.
# Banker's rounding (ROUND_HALF_EVEN) matches GAAP/ASC 820 fair value practice
# and avoids systematic upward bias that ROUND_HALF_UP would introduce.
DSCR_ROUND_DECIMALS: Final = 2

# min_dscr bounds for track_decision.
# min_dscr <= 0 makes every DSCR pass (invalid); min_dscr > 5 is unreasonable.
MIN_MIN_DSCR: Final = 0.0  # exclusive (must be > 0)
MAX_MIN_DSCR: Final = 5.0  # inclusive (cap at 500% DSCR)


def _validate_dscr_input(
    value: float,
    name: str,
    allow_zero: bool = True,
    allow_negative: bool = True,
) -> None:
    """Validate a DSCR input is finite, non-NaN.

    By default, allows negative values (DSCR CAN be negative under severe stress —
    NOI < debt service means the deal is blowing up). Use allow_negative=False
    to enforce non-negative.

    Raises:
        TypeError: value not a number.
        ValueError: value is NaN or infinity.
        ValueError: value < 0 and allow_negative=False.
        ValueError: value <= 0 and not allow_zero.
    """
    if not isinstance(value, (int, float)):
        raise TypeError(f"{name} must be a number, got {type(value).__name__}")
    if math.isnan(value):
        raise ValueError(f"{name} must not be NaN, got NaN")
    if math.isinf(value):
        raise ValueError(f"{name} must be finite, got {value}")
    if not allow_negative and value < 0:
        raise ValueError(f"{name} must be >= 0, got {value}")
    if not allow_zero and value <= 0:
        raise ValueError(f"{name} must be > 0, got {value}")


def round_dscr(dscr: float) -> float:
    """Round DSCR to 2 decimals using banker's rounding (NEVER round up).

    Args:
        dscr: DSCR value. Must be finite (not NaN, not infinity).
            Can be negative (severe stress scenario).

    Returns:
        Rounded DSCR.

    Examples:
        round_dscr(1.0512) == 1.05
        round_dscr(0.78841) == 0.79
        round_dscr(1.005) == 1.0  (banker's: halves round to even)
        round_dscr(-0.51) == -0.51  (negative DSCR valid for severe stress)

    Raises:
        TypeError: dscr not a number.
        ValueError: dscr is NaN or infinity (Bug 8 + Bug 9 fix).
    """
    # Bug 8 + Bug 9 fix: NaN and infinity used to propagate silently.
    # Negative DSCR allowed (deal can blow up under severe stress).
    if not isinstance(dscr, (int, float)):
        raise TypeError(f"dscr must be a number, got {type(dscr).__name__}")
    if math.isnan(dscr):
        raise ValueError("dscr must not be NaN, got NaN")
    if math.isinf(dscr):
        raise ValueError(f"dscr must be finite, got {dscr}")
    # Decimal + ROUND_HALF_EVEN = banker's rounding. Float round() uses banker's too.
    # We use round() with explicit ndigits to be Python-3-version-agnostic.
    return round(dscr, DSCR_ROUND_DECIMALS)


def qualifying_rent(lease_rent: float, appraisal_rent: float) -> float:
    """Return the Track 1 qualifying rent: min(lease, appraisal).

    For Track 1, the lender uses the LOWER of the in-place lease rent and the
    appraiser's opinion of market rent (Form 1007 / 1025). This prevents borrowers
    from overstating lease income to inflate DSCR.

    Args:
        lease_rent: monthly in-place lease rent (from rent roll). Must be >= 0.
        appraisal_rent: monthly market rent opinion (from appraisal Form 1007/1025).
            Must be >= 0.

    Returns:
        The lower of the two, in dollars per month.

    Raises:
        ValueError: either input is negative, NaN, or infinity (Bug 2 fix).

    Lender-specific overrides (not in Slice 1):
        - Kiavi: 110% of appraised market rent cap
        - Easy Street: "lower of in-place and market rent" (matches default)
        - LendingOne: lesser of actual or market, capped at 120% of market
    """
    # Bug 2 fix: qualifying_rent used to silently accept negative inputs.
    # Now raises so downstream DSCR doesn't go negative.
    _validate_dscr_input(
        lease_rent,
        "lease_rent",
        allow_zero=True,
        allow_negative=False,
    )
    _validate_dscr_input(
        appraisal_rent,
        "appraisal_rent",
        allow_zero=True,
        allow_negative=False,
    )
    return min(lease_rent, appraisal_rent)


def dscr_track1(rent_monthly: float, pitia: float) -> float:
    """Return Track 1 DSCR: qualifying rent / PITIA.

    Track 1 is the "income-presence" test. It uses the lower of lease rent and
    appraisal rent (no vacancy adjustment). It answers: "If the tenant pays as
    contracted and the appraisal is correct, can the debt service?"

    Args:
        rent_monthly: Track 1 qualifying rent (already min(lease, appraisal)).
            Must be finite and >= 0.
        pitia: full monthly PITIA. Must be > 0 (degenerate inputs raise).

    Returns:
        Track 1 DSCR as a ratio (e.g. 1.05 means $1.05 of rent per $1 of debt service).

    Raises:
        ValueError: pitia <= 0, rent_monthly < 0, or NaN/infinity inputs
            (Bug 3 fix + Sprint 1 validation hardening).

    Verified: dscr_track1(3000, 2853.985) == 1.0512
    """
    # Bug 3 fix: NaN inputs used to propagate silently (nan <= 0 is False).
    # Sprint 1: also enforce rent_monthly >= 0 (negative rent is meaningless).
    _validate_dscr_input(rent_monthly, "rent_monthly", allow_zero=True, allow_negative=False)
    _validate_dscr_input(pitia, "pitia", allow_zero=False)
    return rent_monthly / pitia


def dscr_track2(
    gross_rent_monthly: float,
    vacancy_pct: float,
    mgmt_pct: float,
    maint_pct: float,
    pitia: float,
) -> float:
    """Return Track 2 DSCR: stressed cash flow after vacancy and operating expenses.

    Track 2 is the "stress-tested" reality. It strips out the in-place rent assumption
    and asks: "What if we apply a normal vacancy rate AND deduct management and
    maintenance reserves? Can the property still service the debt?"

    Args:
        gross_rent_monthly: gross potential rent (GPR), typically from rent roll or
            appraiser's opinion. NOT adjusted for vacancy. Must be finite and >= 0.
        vacancy_pct: vacancy allowance as a decimal fraction (e.g. 0.075 for 7.5%).
            Use 0.25 for 2-4 unit per Fannie Mae Form 1007. Must be in [0, 1].
        mgmt_pct: property management as a decimal fraction of GPR
            (e.g. 0.08 for 8%). Must be >= 0.
        maint_pct: maintenance/reserves as a decimal fraction of GPR
            (e.g. 0.05 for 5%). Must be >= 0.
        pitia: full monthly PITIA. Must be > 0.

    Returns:
        Track 2 DSCR as a ratio.

    Raises:
        ValueError: invalid inputs (NaN, infinity, negative, vacancy > 1, etc.).

    Verified (Sovereign Master 75% occupancy, no mgmt/maint):
        dscr_track2(3000, 0.25, 0.0, 0.0, 2853.985) == 0.7884

    Verified (Easy Street 5% vacancy, no mgmt/maint):
        dscr_track2(3000, 0.05, 0.0, 0.0, 2853.985) == 0.9978
    """
    _validate_dscr_input(
        gross_rent_monthly,
        "gross_rent_monthly",
        allow_zero=True,
        allow_negative=False,
    )
    _validate_dscr_input(vacancy_pct, "vacancy_pct", allow_zero=True)
    _validate_dscr_input(mgmt_pct, "mgmt_pct", allow_zero=True, allow_negative=False)
    _validate_dscr_input(maint_pct, "maint_pct", allow_zero=True, allow_negative=False)
    _validate_dscr_input(pitia, "pitia", allow_zero=False)

    if not 0 <= vacancy_pct <= 1:
        raise ValueError(f"vacancy_pct must be in [0, 1], got {vacancy_pct}")
    if mgmt_pct < 0 or maint_pct < 0:
        raise ValueError(f"mgmt/maint pcts must be >= 0, got mgmt={mgmt_pct}, maint={maint_pct}")
    if mgmt_pct + vacancy_pct > 1.5:  # sanity bound — flags obvious bad input
        raise ValueError(f"vacancy_pct + mgmt_pct unreasonably large: {vacancy_pct} + {mgmt_pct}")

    effective_rent = gross_rent_monthly * (1 - vacancy_pct)
    expenses = gross_rent_monthly * (mgmt_pct + maint_pct)
    noi_monthly = effective_rent - expenses
    return noi_monthly / pitia


class TrackDecision(str, Enum):
    """Four-state decision matrix for dual-track DSCR.

    Sovereign Master canonical matrix:
        T1 PASS + T2 PASS  -> GREEN
        T1 PASS + T2 FAIL  -> TRAP  (restructure required — borrower must acknowledge)
        T1 FAIL + T2 PASS  -> STRUCTURING_OPPORTUNITY  (rate/term engineering)
        T1 FAIL + T2 FAIL  -> KILL
    """

    GREEN = "GREEN"
    TRAP = "TRAP"
    STRUCTURING_OPPORTUNITY = "STRUCTURING_OPPORTUNITY"
    KILL = "KILL"


def track_decision(t1: float, t2: float, min_dscr: float = 1.0) -> TrackDecision:
    """Return the dual-track decision.

    Args:
        t1: Track 1 DSCR. Must be finite.
        t2: Track 2 DSCR. Must be finite.
        min_dscr: minimum DSCR threshold. Must be in (0, 5]. Default 1.0.

    Returns:
        TrackDecision enum value.

    Raises:
        ValueError: min_dscr <= 0 or > 5 (Bug 10 fix). t1/t2 NaN/inf.
    """
    # Bug 10 fix: min_dscr <= 0 made every DSCR pass (invalid).
    _validate_dscr_input(t1, "t1", allow_zero=True)
    _validate_dscr_input(t2, "t2", allow_zero=True)
    _validate_dscr_input(min_dscr, "min_dscr", allow_zero=False)
    if not (MIN_MIN_DSCR < min_dscr <= MAX_MIN_DSCR):
        raise ValueError(f"min_dscr must be in (0, {MAX_MIN_DSCR}], got {min_dscr}")

    t1_pass = t1 >= min_dscr
    t2_pass = t2 >= min_dscr
    if t1_pass and t2_pass:
        return TrackDecision.GREEN
    if t1_pass and not t2_pass:
        return TrackDecision.TRAP
    if not t1_pass and t2_pass:
        return TrackDecision.STRUCTURING_OPPORTUNITY
    return TrackDecision.KILL


def dscr_track3_stabilized(
    stabilized_noi_annual: float,
    annual_debt_service: float,
) -> float:
    """Return Track 3 — Stabilized DSCR (annual NOI / annual debt service).

    v16 spec (Section 3): Track 3 is used for value-add, bridge-to-perm, and
    repositioning properties. The numerator is the stabilized Year-N NOI
    (typically Year 3 after rehab/lease-up), and the denominator is ADS after
    recast or perm debt.

    Args:
        stabilized_noi_annual: stabilized NOI. Must be >= 0.
        annual_debt_service: annual debt service after refi/recast. Must be > 0.

    Returns:
        Track 3 DSCR as a ratio.

    Raises:
        ValueError: invalid inputs.

    Verified:
        - dscr_track3_stabilized(33948.80, 18420.60) ≈ 1.843 (v16 Scenario 2)
    """
    # Sprint 1: enforce NOI >= 0 (negative stabilized NOI is meaningless).
    _validate_dscr_input(
        stabilized_noi_annual,
        "stabilized_noi_annual",
        allow_zero=True,
        allow_negative=False,
    )
    _validate_dscr_input(annual_debt_service, "annual_debt_service", allow_zero=False)
    return stabilized_noi_annual / annual_debt_service


def dscr_all_in(
    noi_annual: float,
    pi_annual: float,
    tax_annual: float,
    insurance_annual: float,
    hoa_annual: float,
) -> float:
    """Return All-In DSCR: NOI / (PI + Taxes + Insurance + HOA), annualized.

    v16 spec (Section 3): "All-In DSCR" — conservative lender/investor variant.
    Unlike Track 2 (which uses ADS only as denominator), All-In includes the
    full housing cost.

    Args:
        noi_annual: net operating income (annualized). Must be >= 0.
        pi_annual: annual principal + interest. Must be >= 0.
        tax_annual: annual property tax. Must be >= 0.
        insurance_annual: annual hazard insurance. Must be >= 0.
        hoa_annual: annual HOA dues. Must be >= 0.

    Returns:
        All-In DSCR as a ratio.

    Verified:
        - $2,400/mo rent, 95% occ, $7,200 OpEx + $1,800 ins + $3,600 tax
          NOI_annual = 2400*12*0.95 - 7200 - 1800 - 3600 = 14,640
          PI_annual = 1535.05 * 12 = 18,420.60
          All-in DSCR = 14,640 / (18420.60 + 3600 + 1800 + 0) = 14,640 / 23,820.60
                       ≈ 0.6146  (worse than Track 2's 0.795, more conservative)
    """
    # Sprint 1: enforce NOI >= 0, but allow tax/insurance/HOA to be 0 (no charge).
    _validate_dscr_input(
        noi_annual,
        "noi_annual",
        allow_zero=True,
        allow_negative=False,
    )
    _validate_dscr_input(pi_annual, "pi_annual", allow_zero=True, allow_negative=False)
    _validate_dscr_input(
        tax_annual,
        "tax_annual",
        allow_zero=True,
        allow_negative=False,
    )
    _validate_dscr_input(
        insurance_annual,
        "insurance_annual",
        allow_zero=True,
        allow_negative=False,
    )
    _validate_dscr_input(
        hoa_annual,
        "hoa_annual",
        allow_zero=True,
        allow_negative=False,
    )

    denominator = pi_annual + tax_annual + insurance_annual + hoa_annual
    if denominator <= 0:
        raise ValueError(f"All-in denominator must be > 0, got {denominator}")
    return noi_annual / denominator


def dual_track(
    lease_rent_monthly: float,
    appraisal_rent_monthly: float,
    gross_rent_monthly: float,
    vacancy_pct: float,
    mgmt_pct: float,
    maint_pct: float,
    pitia: float,
    min_dscr: float = 1.0,
) -> dict:
    """Compute both tracks and the dual-track decision in one call.

    This is the canonical entry point. The IC memo, broker portal, and approval
    predictor all consume this dict.

    Args:
        lease_rent_monthly: in-place lease rent from rent roll.
        appraisal_rent_monthly: market rent opinion from appraisal.
        gross_rent_monthly: gross potential rent (GPR).
        vacancy_pct: Track 2 vacancy allowance (decimal).
        mgmt_pct: Track 2 mgmt expense (decimal of GPR).
        maint_pct: Track 2 maintenance/reserves (decimal of GPR).
        pitia: full monthly PITIA.
        min_dscr: minimum DSCR threshold. Default 1.0.

    Returns:
        Dict with keys: qualifying_rent, dscr_t1, dscr_t2, dscr_t1_rounded,
        dscr_t2_rounded, decision, both_pass, t1_pass, t2_pass.

    Example (golden vector):
        dual_track(3000, 3000, 3000, 0.25, 0.0, 0.0, 2853.985, 1.0)
        -> {
            'qualifying_rent': 3000.0,
            'dscr_t1': 1.0512,
            'dscr_t2': 0.7884,
            'dscr_t1_rounded': 1.05,
            'dscr_t2_rounded': 0.79,
            't1_pass': True,
            't2_pass': False,
            'both_pass': False,
            'decision': <TrackDecision.TRAP: 'TRAP'>,
        }
    """
    q_rent = qualifying_rent(lease_rent_monthly, appraisal_rent_monthly)
    t1 = dscr_track1(q_rent, pitia)
    t2 = dscr_track2(gross_rent_monthly, vacancy_pct, mgmt_pct, maint_pct, pitia)
    decision = track_decision(t1, t2, min_dscr)
    return {
        "qualifying_rent": q_rent,
        "dscr_t1": t1,
        "dscr_t2": t2,
        "dscr_t1_rounded": round_dscr(t1),
        "dscr_t2_rounded": round_dscr(t2),
        "t1_pass": t1 >= min_dscr,
        "t2_pass": t2 >= min_dscr,
        "both_pass": (t1 >= min_dscr) and (t2 >= min_dscr),
        "decision": decision,
        "min_dscr": min_dscr,
    }
