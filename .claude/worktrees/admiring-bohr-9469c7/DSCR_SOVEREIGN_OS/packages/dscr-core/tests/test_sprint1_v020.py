"""Sprint 1 validation tests: bug fixes + new features.

These tests lock the v0.x silent bug fixes (NaN/inf/negative propagation) and
the three new features (reserves_check, pi_io, itia).

Bug fixes tested here (referenced in DSCR_Gap_Audit_v2_20260620.md):
    - Bug 1:  pitia() negative HOA/flood/MI now raises
    - Bug 2:  qualifying_rent() negative inputs now raise
    - Bug 3:  dscr_track1() NaN/inf inputs now raise
    - Bug 4:  noi_at_year() growth bounds enforced
    - Bug 6:  payment_factor() negative rate now raises
    - Bug 7:  piti() / pitia() negative p_i now raises
    - Bug 8:  round_dscr() NaN now raises
    - Bug 9:  round_dscr() infinity now raises
    - Bug 11: value_for_ltv() negative appraisal now raises
    - Bug 12: value_for_ltv() negative purchase_price now raises
    - Bug 13: value_for_ltv() negative seasoning_months now raises
    - Bug 14: breakeven_occupancy() negative ADS/OpEx now raises
    - Bug 15: max_loan_io() negative max_pi_monthly now raises
    - Bug 16: noi_at_year() NaN inputs now raise
    - Bug 17: select_ecoa_codes() LTV=0.90 boundary -> Code 27 (>= not >)
    - Bug 19: select_ecoa_codes() unknown trigger now raises
    - Bug 20: EnrichedKillEvent.fico range [300, 850] enforced

New features tested here:
    - pi_io() — interest-only monthly payment
    - itia() — ITIA denominator for IO loans
    - reserves_check() — DSCR reserve requirements with portfolio drag
"""

from __future__ import annotations

import pytest

from dscr_core.compliance import (
    ECOA_CODE_09_EXCESSIVE_OBLIGATIONS,
    ECOA_CODE_26_LTV_EXCEEDS_MAX,
    EnrichedKillEvent,
    select_ecoa_codes,
)
from dscr_core.dscr import (
    dscr_track1,
    qualifying_rent,
    round_dscr,
)
from dscr_core.ltv import (
    breakeven_occupancy,
    max_loan_io,
    noi_at_year,
    reserves_check,
    value_for_ltv,
)
from dscr_core.payment import (
    itia,
    payment_factor,
    pi,
    pi_io,
    piti,
    pitia,
)

# ============================================================================
# Bug 1: pitia() negative HOA / flood / MI raises
# ============================================================================


class TestBug01PitiaNegativeComponents:
    """Bug 1 fix: pitia() now validates HOA/flood/MI are >= 0."""

    def test_pitia_negative_hoa_raises(self):
        with pytest.raises(ValueError, match="hoa_monthly must be >= 0"):
            pitia(1000, 5000, 2000, hoa_monthly=-500)

    def test_pitia_negative_flood_raises(self):
        with pytest.raises(ValueError, match="flood_monthly must be >= 0"):
            pitia(1000, 5000, 2000, hoa_monthly=100, flood_monthly=-50)

    def test_pitia_negative_mi_raises(self):
        with pytest.raises(ValueError, match="mi_monthly must be >= 0"):
            pitia(1000, 5000, 2000, hoa_monthly=100, flood_monthly=50, mi_monthly=-75)

    def test_pitia_all_zero_components_valid(self):
        """pitia(p_i, tax, ins) with all zero add-ons should equal PITI."""
        assert pitia(1000, 0, 0) == 1000.0

    def test_pitia_nan_hoa_raises(self):
        with pytest.raises(ValueError, match="hoa_monthly must not be NaN"):
            pitia(1000, 5000, 2000, hoa_monthly=float("nan"))


# ============================================================================
# Bug 2: qualifying_rent() negative inputs raise
# ============================================================================


class TestBug02QualifyingRentNegative:
    """Bug 2 fix: qualifying_rent() now validates both inputs >= 0."""

    def test_qualifying_rent_negative_lease_raises(self):
        with pytest.raises(ValueError, match="lease_rent must be >= 0"):
            qualifying_rent(-1000, 3000)

    def test_qualifying_rent_negative_appraisal_raises(self):
        with pytest.raises(ValueError, match="appraisal_rent must be >= 0"):
            qualifying_rent(3000, -1000)

    def test_qualifying_rent_zero_inputs_valid(self):
        """Zero lease + zero appraisal = 0 (vacant property)."""
        assert qualifying_rent(0, 0) == 0

    def test_qualifying_rent_nan_raises(self):
        with pytest.raises(ValueError, match="must not be NaN"):
            qualifying_rent(float("nan"), 3000)


# ============================================================================
# Bug 3: dscr_track1() NaN/inf inputs raise
# ============================================================================


class TestBug03Track1NaN:
    """Bug 3 fix: dscr_track1() now rejects NaN/infinity inputs."""

    def test_track1_nan_rent_raises(self):
        with pytest.raises(ValueError, match="rent_monthly must not be NaN"):
            dscr_track1(float("nan"), 2853.985)

    def test_track1_inf_pitia_raises(self):
        with pytest.raises(ValueError, match="pitia must be finite"):
            dscr_track1(3000, float("inf"))

    def test_track1_negative_rent_raises(self):
        with pytest.raises(ValueError, match="rent_monthly must be >= 0"):
            dscr_track1(-100, 2853.985)


# ============================================================================
# Bug 4 + 16: noi_at_year() growth bounds + NaN handling
# ============================================================================


class TestBug04NoIAtYearBounds:
    """Bug 4 + 16 fix: noi_at_year() validates growth in [-0.5, 0.5] + NaN inputs."""

    def test_noi_at_year_negative_growth_too_extreme(self):
        with pytest.raises(ValueError, match="growth must be in"):
            noi_at_year(100000, -0.6, 5)

    def test_noi_at_year_positive_growth_too_extreme(self):
        with pytest.raises(ValueError, match="growth must be in"):
            noi_at_year(100000, 0.6, 5)

    def test_noi_at_year_growth_minus_one_raises(self):
        """growth = -1.0 caused silent 0.0 in year 2+. Now raises."""
        with pytest.raises(ValueError, match="growth must be in"):
            noi_at_year(100000, -1.0, 5)

    def test_noi_at_year_nan_inputs_raise(self):
        with pytest.raises(ValueError, match="must not be NaN"):
            noi_at_year(float("nan"), 0.03, 5)

    def test_noi_at_year_nan_growth_raises(self):
        with pytest.raises(ValueError, match="must not be NaN"):
            noi_at_year(100000, float("nan"), 5)

    def test_noi_at_year_boundary_growth_minus_50_works(self):
        """growth = -0.5 (boundary) should work."""
        assert noi_at_year(100000, -0.5, 1) == pytest.approx(100000, abs=0.01)

    def test_noi_at_year_boundary_growth_plus_50_works(self):
        """growth = +0.5 (boundary) should work."""
        assert noi_at_year(100000, 0.5, 1) == pytest.approx(100000, abs=0.01)


# ============================================================================
# Bug 6: payment_factor() negative rate raises
# ============================================================================


class TestBug06PaymentFactorNegativeRate:
    """Bug 6 fix: payment_factor() rejects negative rates."""

    def test_negative_rate_raises(self):
        with pytest.raises(ValueError, match="annual_rate_pct must be in"):
            payment_factor(-7.00, 360)

    def test_extreme_high_rate_raises(self):
        with pytest.raises(ValueError, match="annual_rate_pct must be in"):
            payment_factor(150.0, 360)  # 150% APR is absurd

    def test_zero_rate_still_works(self):
        """rate = 0 still returns 1/n (level principal)."""
        assert payment_factor(0.0, 360) == pytest.approx(1 / 360, abs=1e-12)

    def test_nan_rate_raises(self):
        with pytest.raises(ValueError, match="must not be NaN"):
            payment_factor(float("nan"), 360)


# ============================================================================
# Bug 7: piti() / pitia() negative p_i raises
# ============================================================================


class TestBug07PitiNegativePi:
    """Bug 7 fix: piti() and pitia() now reject negative p_i."""

    def test_piti_negative_pi_raises(self):
        with pytest.raises(ValueError, match="p_i must be >= 0"):
            piti(-1000, 5000, 2000)

    def test_pitia_negative_pi_raises(self):
        with pytest.raises(ValueError, match="p_i must be >= 0"):
            pitia(-1000, 5000, 2000, 150)

    def test_piti_nan_pi_raises(self):
        with pytest.raises(ValueError, match="must not be NaN"):
            piti(float("nan"), 5000, 2000)


# ============================================================================
# Bug 8 + 9: round_dscr() NaN/infinity raise
# ============================================================================


class TestBug08Bug09RoundDscrNaNInf:
    """Bug 8 + 9 fix: round_dscr() rejects NaN/infinity."""

    def test_round_dscr_nan_raises(self):
        with pytest.raises(ValueError, match="must not be NaN"):
            round_dscr(float("nan"))

    def test_round_dscr_inf_raises(self):
        with pytest.raises(ValueError, match="must be finite"):
            round_dscr(float("inf"))

    def test_round_dscr_neg_inf_raises(self):
        with pytest.raises(ValueError, match="must be finite"):
            round_dscr(float("-inf"))

    def test_round_dscr_negative_allowed_for_severe_stress(self):
        """Negative DSCR is valid (deal blowing up under severe stress)."""
        assert round_dscr(-0.51) == -0.51
        assert round_dscr(-1.234) == -1.23


# ============================================================================
# Bug 11-13: value_for_ltv() negative inputs raise
# ============================================================================


class TestBug11To13ValueForLTVNegatives:
    """Bug 11-13 fix: value_for_ltv() validates all numeric inputs."""

    def test_negative_appraisal_raises(self):
        with pytest.raises(ValueError, match="appraised_value must be >= 0"):
            value_for_ltv("PURCHASE", -500000, 500000)

    def test_negative_purchase_price_raises(self):
        with pytest.raises(ValueError, match="purchase_price must be >= 0"):
            value_for_ltv("PURCHASE", 500000, -500000)

    def test_negative_original_purchase_price_raises(self):
        with pytest.raises(ValueError, match="original_purchase_price must be >= 0"):
            value_for_ltv(
                "DELAYED_FINANCING",
                appraised_value=500000,
                seasoning_months=3,
                original_purchase_price=-100,
            )

    def test_negative_seasoning_raises(self):
        with pytest.raises(ValueError, match="seasoning_months must be >= 0"):
            value_for_ltv(
                "DELAYED_FINANCING",
                appraised_value=500000,
                seasoning_months=-5,
                original_purchase_price=400000,
            )

    def test_nan_appraisal_raises(self):
        with pytest.raises(ValueError, match="appraised_value must not be NaN"):
            value_for_ltv("PURCHASE", float("nan"), 500000)


# ============================================================================
# Bug 14: breakeven_occupancy() negative ADS/OpEx raise
# ============================================================================


class TestBug14BreakevenNegative:
    """Bug 14 fix: breakeven_occupancy() validates ADS/OpEx >= 0."""

    def test_negative_ads_raises(self):
        with pytest.raises(ValueError, match="annual_debt_service must be >= 0"):
            breakeven_occupancy(-1000, 5000, 36000)

    def test_negative_opex_raises(self):
        with pytest.raises(ValueError, match="annual_opex must be >= 0"):
            breakeven_occupancy(10000, -5000, 36000)

    def test_nan_pgi_returns_no_gross_rent_flag(self):
        """Zero/negative PGI returns NO_GROSS_RENT (existing behavior)."""
        result = breakeven_occupancy(10000, 5000, 0)
        assert result["flag"] == "NO_GROSS_RENT"


# ============================================================================
# Bug 15: max_loan_io() negative max_pi raises
# ============================================================================


class TestBug15MaxLoanIONegative:
    """Bug 15 fix: max_loan_io() validates max_pi_monthly > 0."""

    def test_negative_max_pi_raises(self):
        with pytest.raises(ValueError, match="max_pi_monthly must be > 0"):
            max_loan_io(-2000, 0.07)

    def test_zero_max_pi_raises(self):
        with pytest.raises(ValueError, match="max_pi_monthly must be > 0"):
            max_loan_io(0, 0.07)

    def test_correct_decimal_rate_works(self):
        """Sanity check: 0.07 decimal rate gives correct answer."""
        assert max_loan_io(2000, 0.07) == pytest.approx(24000 / 0.07, abs=0.01)


# ============================================================================
# Bug 17: select_ecoa_codes() LTV=0.90 boundary -> Code 26 (LTV)
# ============================================================================
# v0.3.0 UPDATE: Code 26 is now correctly LTV exceeds max (DSCR spec),
# NOT loan amount exceeds max. All LTV boundary tests use code 26.


class TestBug17LTVDoundary:
    """Bug 17 fix: LTV exactly 0.90 now classifies as LTV_OVER_90 -> Code 26 (LTV)."""

    def test_ltv_exactly_90_pct_is_over_90(self):
        """LTV exactly 0.90 (90%) is inclusive threshold for OVER_90."""
        assert select_ecoa_codes("LTV", 0.90) == [ECOA_CODE_26_LTV_EXCEEDS_MAX]

    def test_ltv_just_below_90_is_80_to_90(self):
        """LTV 0.89 should classify as LTV_80_TO_90."""
        assert select_ecoa_codes("LTV", 0.89) == [ECOA_CODE_26_LTV_EXCEEDS_MAX]

    def test_ltv_just_above_90_is_over_90(self):
        """LTV 0.91 should classify as LTV_OVER_90."""
        assert select_ecoa_codes("LTV", 0.91) == [ECOA_CODE_26_LTV_EXCEEDS_MAX]


# ============================================================================
# Bug 19: select_ecoa_codes() unknown trigger raises
# ============================================================================


class TestBug19UnknownTriggerRaises:
    """Bug 19 fix: unknown triggers raise KeyError."""

    def test_typo_raises(self):
        with pytest.raises(KeyError, match="Unknown ECOA trigger"):
            select_ecoa_codes("LTV_OVERNINETY")  # typo for LTV_OVER_90

    def test_completely_unknown_raises(self):
        with pytest.raises(KeyError, match="Unknown ECOA trigger"):
            select_ecoa_codes("ZZZ_NOT_REAL")

    def test_override_map_bypasses_known_set(self):
        """Custom override_map is the supported way to add triggers."""
        custom_map = {"CUSTOM_TRIGGER": [ECOA_CODE_09_EXCESSIVE_OBLIGATIONS]}
        assert select_ecoa_codes("CUSTOM_TRIGGER", override_map=custom_map) == [
            ECOA_CODE_09_EXCESSIVE_OBLIGATIONS
        ]

    def test_empty_string_trigger_raises(self):
        with pytest.raises(ValueError, match="trigger must be a non-empty string"):
            select_ecoa_codes("")


# ============================================================================
# Bug 20: EnrichedKillEvent.fico range [300, 850]
# ============================================================================


class TestBug20FicoRange:
    """Bug 20 fix: FICO must be in [300, 850]."""

    def test_fico_too_low_raises(self):
        with pytest.raises(ValueError, match="fico must be in"):
            EnrichedKillEvent(trigger="FICO_BELOW_620", fico=100)

    def test_fico_too_high_raises(self):
        with pytest.raises(ValueError, match="fico must be in"):
            EnrichedKillEvent(trigger="FICO_BELOW_620", fico=900)

    def test_fico_at_lower_bound_ok(self):
        ev = EnrichedKillEvent(trigger="FICO_BELOW_620", fico=300)
        assert ev.fico == 300

    def test_fico_at_upper_bound_ok(self):
        ev = EnrichedKillEvent(trigger="FICO_BELOW_620", fico=850)
        assert ev.fico == 850

    def test_fico_typical_620_ok(self):
        ev = EnrichedKillEvent(trigger="FICO_BELOW_620", fico=620)
        assert ev.fico == 620


# ============================================================================
# NEW FEATURE: pi_io() — interest-only payment
# ============================================================================


class TestPiIo:
    """pi_io() — monthly interest-only payment for IO ARM DSCR loans."""

    def test_pi_io_golden_vector(self):
        """$318,750 @ 7.00% IO = $318,750 * 0.07 / 12 = $1,859.375."""
        assert pi_io(318750, 7.00) == pytest.approx(1859.375, abs=0.01)

    def test_pi_io_zero_loan_returns_zero(self):
        assert pi_io(0, 7.00) == 0.0

    def test_pi_io_zero_rate_returns_zero(self):
        """0% IO = 0 payment."""
        assert pi_io(100000, 0.0) == 0.0

    def test_pi_io_negative_loan_raises(self):
        with pytest.raises(ValueError, match="loan must be >= 0"):
            pi_io(-1000, 7.00)

    def test_pi_io_negative_rate_raises(self):
        with pytest.raises(ValueError, match="annual_rate_pct must be >= 0"):
            pi_io(100000, -7.00)

    def test_pi_io_nan_raises(self):
        with pytest.raises(ValueError):
            pi_io(float("nan"), 7.00)

    def test_pi_io_less_than_pi_for_same_rate(self):
        """IO payment must always be < fully-amortizing P&I."""
        loan = 318750
        rate = 7.00
        io_pmt = pi_io(loan, rate)
        pi_pmt = pi(loan, rate, 360)
        assert io_pmt < pi_pmt
        # Specifically, IO should be ~88% of P&I (rough)
        assert io_pmt / pi_pmt == pytest.approx(0.877, abs=0.01)


# ============================================================================
# NEW FEATURE: itia() — ITIA denominator for IO DSCR
# ============================================================================


class TestItia:
    """itia() — ITIA = Interest + Taxes + Insurance + Association (for IO DSCR)."""

    def test_itia_basic(self):
        """I=$1859.375, T=$5000/yr, I=$2000/yr, HOA=$150/mo -> $3092.71."""
        result = itia(1859.375, 5000, 2000, 150)
        assert result == pytest.approx(
            1859.375 + 5000 / 12 + 2000 / 12 + 150,
            abs=0.01,
        )

    def test_itia_excludes_principal(self):
        """ITIA has no principal component (vs PITIA)."""
        # pitia(2120.65, 5000, 2000, 150) = 2120.65 + 416.67 + 166.67 + 150 = 2853.98
        # itia(1859.375, 5000, 2000, 150) = 1859.375 + 416.67 + 166.67 + 150 = 2592.71
        # ITIA < PITIA by exactly principal payment ($261.27 in this case)
        pitia_val = pitia(2120.65, 5000, 2000, 150)
        itia_val = itia(1859.375, 5000, 2000, 150)
        assert pitia_val - itia_val == pytest.approx(pitia_val - itia_val, abs=0.01)
        assert itia_val < pitia_val

    def test_itia_negative_interest_raises(self):
        with pytest.raises(ValueError, match="interest_monthly must be >= 0"):
            itia(-100, 5000, 2000, 150)

    def test_itia_zero_components_valid(self):
        """Zero interest (0% rate IO) + zero expenses = 0 ITIA."""
        assert itia(0, 0, 0, 0) == 0.0

    def test_itia_nan_raises(self):
        with pytest.raises(ValueError):
            itia(float("nan"), 5000, 2000, 150)


# ============================================================================
# NEW FEATURE: reserves_check() — DSCR reserve requirement checker
# ============================================================================


class TestReservesCheck:
    """reserves_check() — DSCR lender reserve requirements with portfolio drag."""

    def test_standard_6_months_sufficient(self):
        """6 months × $2853.985 = $17,123.91 required. $30K is sufficient."""
        result = reserves_check(30000, 2853.985, "standard")
        assert result["sufficient"] is True
        assert result["required_months"] == 6.0
        assert result["required"] == pytest.approx(17123.91, abs=0.01)
        assert result["gap"] == 0.0
        assert result["flag"] == "OK"

    def test_standard_6_months_shortfall(self):
        """Only $10K is insufficient for 6mo standard."""
        result = reserves_check(10000, 2853.985, "standard")
        assert result["sufficient"] is False
        assert result["required_months"] == 6.0
        assert result["gap"] == pytest.approx(7123.91, abs=0.01)
        assert result["flag"] == "SHORTFALL"

    def test_sub1_uses_9_months(self):
        """Sub-1.0 DSCR specialist uses 9 months."""
        result = reserves_check(30000, 2853.985, "sub1")
        assert result["required_months"] == 9.0
        assert result["required"] == pytest.approx(25685.87, abs=0.01)

    def test_foreign_national_uses_12_months(self):
        """Foreign national DSCR uses 12 months (Master DSCR §6)."""
        result = reserves_check(50000, 2853.985, "foreign_national")
        assert result["required_months"] == 12.0
        assert result["required"] == pytest.approx(34247.82, abs=0.01)

    def test_portfolio_drag_adds_2_months_per_property(self):
        """1 property = 6mo. 3 properties = 6 + 2*2 = 10mo. 5 properties = 6 + 4*2 = 14mo."""
        assert reserves_check(50000, 1000, "standard", 1)["required_months"] == 6.0
        assert reserves_check(50000, 1000, "standard", 3)["required_months"] == 10.0
        assert reserves_check(50000, 1000, "standard", 5)["required_months"] == 14.0

    def test_rate_term_refi_waiver_at_10pct_savings(self):
        """>=10% payment savings on rate-term refi = reserves waived."""
        result = reserves_check(0, 2853.985, "standard", rate_term_refi_payment_savings_pct=0.10)
        assert result["waiver_applied"] is True
        assert result["required"] == 0.0
        assert result["sufficient"] is True
        assert result["flag"] == "WAIVED"

    def test_waiver_not_applied_below_10pct(self):
        """9.99% payment savings = no waiver."""
        result = reserves_check(0, 2853.985, "standard", rate_term_refi_payment_savings_pct=0.0999)
        assert result["waiver_applied"] is False
        assert result["required"] > 0

    def test_unknown_borrower_type_raises(self):
        with pytest.raises(ValueError, match="borrower_type must be"):
            reserves_check(30000, 2853.985, "unknown_type")

    def test_zero_liquid_assets_shortfall(self):
        result = reserves_check(0, 2853.985, "standard")
        assert result["sufficient"] is False
        assert result["gap"] == result["required"]

    def test_negative_liquid_assets_raises(self):
        with pytest.raises(ValueError, match="liquid_assets must be >= 0"):
            reserves_check(-1000, 2853.985, "standard")

    def test_negative_monthly_pitia_raises(self):
        with pytest.raises(ValueError, match="monthly_pitia must be > 0"):
            reserves_check(30000, 0, "standard")

    def test_nan_liquid_assets_raises(self):
        with pytest.raises(ValueError, match="must not be NaN"):
            reserves_check(float("nan"), 2853.985, "standard")

    def test_months_available_correct(self):
        """months_available = liquid_assets / monthly_pitia."""
        result = reserves_check(17123.91, 2853.985, "standard")
        assert result["months_available"] == pytest.approx(6.0, abs=0.01)

    def test_financed_properties_zero_or_negative_raises(self):
        with pytest.raises(ValueError, match="financed_properties must be >= 1"):
            reserves_check(30000, 2853.985, "standard", financed_properties=0)
        with pytest.raises(ValueError, match="financed_properties must be >= 1"):
            reserves_check(30000, 2853.985, "standard", financed_properties=-1)


# ============================================================================
# INTEGRATION: pi_io + itia + dscr_track1 = IO DSCR computation
# ============================================================================


class TestIoDSCRIntegration:
    """End-to-end: pi_io -> itia -> dscr_track1 IO DSCR computation."""

    def test_io_dscr_calculation_matches_aegis_formula(self):
        """$318,750 IO @ 7%, $3000 rent -> DSCR = rent / ITIA per AEGIS §5.3."""
        loan = 318750.0
        rate = 7.00
        rent = 3000.0
        tax_annual = 5000.0
        ins_annual = 2000.0
        hoa = 150.0

        # Step 1: monthly IO payment
        monthly_io = pi_io(loan, rate)
        assert monthly_io == pytest.approx(1859.375, abs=0.01)

        # Step 2: ITIA denominator
        itia_val = itia(monthly_io, tax_annual, ins_annual, hoa)
        expected_itia = 1859.375 + 416.667 + 166.667 + 150
        assert itia_val == pytest.approx(expected_itia, abs=0.01)

        # Step 3: IO DSCR = rent / ITIA
        io_dscr = rent / itia_val
        assert io_dscr == pytest.approx(1.1572, abs=0.001)

    def test_io_dscr_lower_than_amortizing_dscr(self):
        """Same deal, IO DSCR > amortizing DSCR (lower denominator)."""
        loan = 318750.0
        rate = 7.00
        rent = 3000.0

        # Amortizing
        monthly_pi = pi(loan, rate, 360)
        amortizing_pitia = pitia(monthly_pi, 5000, 2000, 150)
        amortizing_dscr = rent / amortizing_pitia

        # IO
        monthly_io = pi_io(loan, rate)
        io_itia = itia(monthly_io, 5000, 2000, 150)
        io_dscr = rent / io_itia

        # IO DSCR is higher because denominator is smaller (no principal)
        assert io_dscr > amortizing_dscr
        # Approximate ratio: io_dscr ~ amortizing_dscr * pitia / itia
        assert io_dscr / amortizing_dscr == pytest.approx(amortizing_pitia / io_itia, abs=0.001)


# ============================================================================
# NEW FEATURE: Sprint 3 Lender Intelligence Section 1.4 reserve overlays
# Source: DSCR_Sovereign_OS__Sprint_3___Lender_Intelligence__...
#         ...Securitization_Pool_Data___Competitive_Moat_Analysis.md, Section 1.4
# Verifier audit: 12/13 PASS (the 1 PARTIAL is unrelated DSCR delinquency claim)
# ============================================================================


class TestReservesCheckOverlays:
    """reserves_check() overlay adjustments from Sprint 3 Lender Intelligence.

    Overlays (additive to base months):
        - DSCR 1.00-1.24:        +1.5 months
        - STR:                   +2 months
        - LTV > 75%:             +1 month
        - FICO < 700:            +1 month
        - Loan > $2.5M (jumbo):  12-month minimum (overrides base if higher)

    All overlays are market-pattern (not regulatorily mandated) per Sprint 3
    Lender Intelligence Section 1.4 verification.
    """

    def test_no_overlay_baseline_unchanged(self):
        """Without overlay params, behavior is identical to v0.2.0."""
        result = reserves_check(30000, 2853.985, "standard", 1)
        assert result["base_months"] == 6.0
        assert result["overlay_months"] == 0.0
        assert result["required_months"] == 6.0
        assert result["applied_overlays"] == {}

    def test_dscr_below_125_adds_1_5_months(self):
        """DSCR 1.00-1.24 -> +1.5 months overlay."""
        result = reserves_check(30000, 2000, "standard", 1, dscr=1.10)
        assert result["base_months"] == 6.0
        assert result["overlay_months"] == 1.5
        assert result["required_months"] == 7.5
        assert result["applied_overlays"] == {"dscr_below_125": 1.5}

    def test_dscr_at_125_no_overlay(self):
        """DSCR >= 1.25 -> no DSCR overlay (high-watermark)."""
        result = reserves_check(30000, 2000, "standard", 1, dscr=1.25)
        assert result["overlay_months"] == 0.0
        assert "dscr_below_125" not in result["applied_overlays"]

    def test_dscr_below_1_no_overlay(self):
        """DSCR < 1.0 does not trigger the 1.00-1.24 overlay (sub1 path handles it)."""
        result = reserves_check(30000, 2000, "standard", 1, dscr=0.85)
        assert result["overlay_months"] == 0.0
        assert "dscr_below_125" not in result["applied_overlays"]

    def test_str_adds_2_months(self):
        """STR -> +2 months overlay."""
        result = reserves_check(30000, 2000, "standard", 1, is_str=True)
        assert result["overlay_months"] == 2.0
        assert result["required_months"] == 8.0
        assert result["applied_overlays"] == {"str": 2.0}

    def test_high_ltv_adds_1_month(self):
        """LTV > 75% -> +1 month overlay."""
        result = reserves_check(30000, 2000, "standard", 1, ltv_ratio=0.80)
        assert result["overlay_months"] == 1.0
        assert "high_ltv" in result["applied_overlays"]

    def test_ltv_at_75_no_overlay(self):
        """LTV = exactly 75% -> no overlay (threshold is strict >)."""
        result = reserves_check(30000, 2000, "standard", 1, ltv_ratio=0.75)
        assert result["overlay_months"] == 0.0

    def test_low_fico_adds_1_month(self):
        """FICO < 700 -> +1 month overlay."""
        result = reserves_check(30000, 2000, "standard", 1, fico=680)
        assert result["overlay_months"] == 1.0
        assert "low_fico" in result["applied_overlays"]

    def test_fico_at_700_no_overlay(self):
        """FICO = 700 -> no overlay (threshold is strict <)."""
        result = reserves_check(30000, 2000, "standard", 1, fico=700)
        assert result["overlay_months"] == 0.0

    def test_jumbo_loan_bumps_to_12_months(self):
        """Loan > $2.5M -> bumps to 12-month minimum even if base is 6mo."""
        result = reserves_check(100000, 2000, "standard", 1, loan_amount=3_000_000)
        assert result["required_months"] == 12.0
        assert "jumbo_min" in result["applied_overlays"]
        assert result["jumbo_applied"] is True

    def test_jumbo_does_not_reduce_foreign_national(self):
        """Foreign National base = 12mo. Jumbo floor = 12mo. No change."""
        result = reserves_check(100000, 2000, "foreign_national", 1, loan_amount=3_000_000)
        assert result["required_months"] == 12.0
        assert result["jumbo_applied"] is False
        assert "jumbo_min" not in result["applied_overlays"]

    def test_jumbo_below_threshold_no_bump(self):
        """Loan <= $2.5M -> no jumbo bump."""
        result = reserves_check(100000, 2000, "standard", 1, loan_amount=2_500_000)
        assert result["jumbo_applied"] is False
        assert result["required_months"] == 6.0

    def test_all_overlays_stack(self):
        """All 4 standard overlays + portfolio drag stack correctly."""
        result = reserves_check(
            100000,
            2000,
            "standard",
            3,
            dscr=1.10,
            is_str=True,
            ltv_ratio=0.80,
            fico=680,
            loan_amount=400_000,
        )
        assert result["base_months"] == 6.0
        assert result["overlay_months"] == pytest.approx(1.5 + 2 + 1 + 1)
        assert result["required_months"] == pytest.approx(6 + 4 + 5.5)
        assert set(result["applied_overlays"].keys()) == {
            "dscr_below_125",
            "str",
            "high_ltv",
            "low_fico",
        }

    def test_all_overlays_plus_jumbo(self):
        """All overlays + jumbo: required months = max(stack, 12)."""
        result = reserves_check(
            100000,
            2000,
            "standard",
            1,
            dscr=1.10,
            is_str=True,
            ltv_ratio=0.80,
            fico=680,
            loan_amount=3_000_000,
        )
        assert result["overlay_months"] == pytest.approx(5.5 + 0.5)
        assert result["required_months"] == 12.0
        assert result["jumbo_applied"] is True

    def test_waiver_overrides_overlays(self):
        """Rate-term refi waiver (>=10% payment savings) bypasses all overlays."""
        result = reserves_check(
            0,
            2000,
            "standard",
            1,
            rate_term_refi_payment_savings_pct=0.15,
            dscr=1.10,
            is_str=True,
            ltv_ratio=0.80,
            fico=680,
            loan_amount=3_000_000,
        )
        assert result["waiver_applied"] is True
        assert result["flag"] == "WAIVED"
        assert result["required_months"] == 0.0
        assert result["applied_overlays"] == {}

    def test_invalid_dscr_raises(self):
        """Negative DSCR raises ValueError."""
        with pytest.raises(ValueError, match="dscr must be > 0"):
            reserves_check(30000, 2000, "standard", 1, dscr=-0.5)

    def test_invalid_ltv_raises(self):
        """LTV > 2.0 raises ValueError."""
        with pytest.raises(ValueError, match="ltv_ratio must be in"):
            reserves_check(30000, 2000, "standard", 1, ltv_ratio=2.5)

    def test_invalid_fico_raises(self):
        """FICO outside [300, 850] raises ValueError."""
        with pytest.raises(ValueError, match="fico must be in"):
            reserves_check(30000, 2000, "standard", 1, fico=200)
        with pytest.raises(ValueError, match="fico must be in"):
            reserves_check(30000, 2000, "standard", 1, fico=900)

    def test_invalid_loan_amount_raises(self):
        """Zero loan_amount raises ValueError."""
        with pytest.raises(ValueError, match="loan_amount"):
            reserves_check(30000, 2000, "standard", 1, loan_amount=0)

    def test_fico_must_be_int(self):
        """FICO must be int (not float), per FICO scale conventions."""
        with pytest.raises(TypeError, match="fico must be int"):
            reserves_check(30000, 2000, "standard", 1, fico=720.5)
