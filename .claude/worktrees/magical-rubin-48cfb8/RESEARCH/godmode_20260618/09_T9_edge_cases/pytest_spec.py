"""T9 Edge Case Stress Tests — Concrete pytest specification for Slice 1.

This file contains ready-to-copy pytest code for the 20 Slice 1 edge cases.
For Slice 3 (after-tax) edge cases (26-30), the tests are sketched but the
implementation is deferred until the after-tax engine exists.

Source: /RESEARCH/godmode_20260618/09_T9_edge_cases/T9_summary.md
"""

from __future__ import annotations

import pytest
from hypothesis import given, strategies as st, assume

from dscr_core.payment import payment_factor, pi, piti, pitia
from dscr_core.dscr import (
    TrackDecision,
    dscr_track1,
    dscr_track2,
    dual_track,
    qualifying_rent,
    round_dscr,
    track_decision,
)
from dscr_core.leverage import deal_break_rate, max_purchase_price


# =====================================================================
# Group 1: Payment Math Edge Cases (10 cases, all Slice 1)
# =====================================================================

class TestEdge01RateZero:
    """Edge 01: payment_factor(0, n) = 1/n (level principal)."""

    def test_rate_zero_returns_level_principal_360(self):
        assert payment_factor(0.0, 360) == pytest.approx(1 / 360, abs=1e-12)

    def test_rate_zero_returns_level_principal_12(self):
        assert payment_factor(0.0, 12) == pytest.approx(1 / 12, abs=1e-12)

    def test_rate_zero_returns_level_principal_600(self):
        assert payment_factor(0.0, 600) == pytest.approx(1 / 600, abs=1e-12)

    @given(n=st.integers(min_value=1, max_value=600))
    def test_rate_zero_property_based(self, n):
        assert payment_factor(0.0, n) == pytest.approx(1.0 / n, abs=1e-12)


class TestEdge02Rate100Pct:
    """Edge 02: payment_factor(100, n) at extreme high rate."""

    def test_rate_100pct_360_returns_finite_factor(self):
        f = payment_factor(100.0, 360)
        assert 0.08 < f < 0.09  # ~0.0833 expected

    def test_rate_100pct_1_returns_one_plus_rate(self):
        # At n=1: payment_factor = 1 + r (algebraic identity)
        f = payment_factor(100.0, 1)
        assert f == pytest.approx(1.0 + 100.0 / 100.0 / 12.0, abs=1e-9)

    @given(rate=st.floats(min_value=50.0, max_value=100.0, allow_nan=False),
           n=st.integers(min_value=12, max_value=600))
    def test_rate_high_property_based(self, rate, n):
        f = payment_factor(rate, n)
        assert 0.0 < f < 1.0


class TestEdge03TermOneMonth:
    """Edge 03: payment_factor(rate, 1) = 1 + rate/100/12."""

    @pytest.mark.parametrize("rate", [0.0, 1.0, 5.0, 7.0, 10.0, 50.0])
    def test_payment_factor_one_month(self, rate):
        f = payment_factor(rate, 1)
        if rate == 0:
            assert f == pytest.approx(1.0, abs=1e-12)
        else:
            expected = 1.0 + rate / 100.0 / 12.0
            assert f == pytest.approx(expected, abs=1e-9)


class TestEdge04Term600Months:
    """Edge 04: payment_factor(rate, 600) at MAX_TERM_MONTHS."""

    def test_600_months_accepted(self):
        f = payment_factor(7.0, 600)
        assert 0.0 < f < payment_factor(7.0, 360)  # longer term = lower factor
        assert f == pytest.approx(0.0058360, abs=1e-4)

    def test_601_months_rejected(self):
        with pytest.raises(ValueError, match="n_months must be <= 600"):
            payment_factor(7.0, 601)

    def test_1200_months_rejected(self):
        with pytest.raises(ValueError, match="n_months must be <= 600"):
            payment_factor(7.0, 1200)


class TestEdge05LoanZero:
    """Edge 05: pi(0, rate, n) = 0.0."""

    def test_pi_zero_loan_zero_rate(self):
        assert pi(0, 0.0) == 0.0

    def test_pi_zero_loan_7pct(self):
        assert pi(0, 7.0) == 0.0

    def test_pi_zero_loan_50pct_12mo(self):
        assert pi(0, 50.0, 12) == 0.0

    @given(rate=st.floats(min_value=0.0, max_value=20.0, allow_nan=False),
           n=st.integers(min_value=12, max_value=600))
    def test_pi_zero_loan_property_based(self, rate, n):
        assert pi(0.0, rate, n) == 0.0


class TestEdge06LoanNegativeOne:
    """Edge 06: pi(-1, rate, n) rejected."""

    def test_pi_rejects_minus_one(self):
        with pytest.raises(ValueError) as exc_info:
            pi(-1, 7.0)
        assert "-1" in str(exc_info.value)
        assert "loan must be >= 0" in str(exc_info.value)

    def test_pi_rejects_large_negative(self):
        with pytest.raises(ValueError, match="loan must be >= 0"):
            pi(-1_000_000, 7.0)

    @given(loan=st.floats(max_value=-1e-9, allow_nan=False))
    def test_pi_rejects_any_negative(self, loan):
        with pytest.raises(ValueError, match="loan must be >= 0"):
            pi(loan, 7.0)


class TestEdge07TermFloat:
    """Edge 07: payment_factor(rate, 360.0) raises TypeError."""

    def test_term_float_rejected(self):
        with pytest.raises(TypeError, match="n_months must be int"):
            payment_factor(7.0, 360.0)

    def test_term_float_120_rejected(self):
        with pytest.raises(TypeError, match="n_months must be int"):
            payment_factor(7.0, 120.5)

    @given(n=st.floats(min_value=1.0, max_value=600.0, allow_nan=False))
    def test_term_float_property_based(self, n):
        with pytest.raises(TypeError, match="n_months must be int"):
            payment_factor(7.0, n)


class TestEdge08TermString:
    """Edge 08: payment_factor(rate, '360') raises TypeError."""

    def test_term_string_rejected(self):
        with pytest.raises(TypeError, match="n_months must be int"):
            payment_factor(7.0, "360")

    def test_term_gibberish_rejected(self):
        with pytest.raises(TypeError, match="n_months must be int"):
            payment_factor(7.0, "thirty years")

    def test_term_empty_string_rejected(self):
        with pytest.raises(TypeError, match="n_months must be int"):
            payment_factor(7.0, "")

    @given(s=st.text(min_size=1, max_size=10))
    def test_term_string_property_based(self, s):
        with pytest.raises(TypeError, match="n_months must be int"):
            payment_factor(7.0, s)


class TestEdge09RateMicro:
    """Edge 09: payment_factor(0.001, 360) at 1 basis point annual."""

    def test_one_basis_point_slightly_above_level_principal(self):
        f = payment_factor(0.001, 360)
        assert f > 1.0 / 360  # strictly above level-principal
        assert f == pytest.approx(1.0 / 360, abs=1e-6)  # but very close

    @given(rate=st.floats(min_value=1e-6, max_value=0.01, allow_nan=False),
           n=st.integers(min_value=12, max_value=600))
    def test_micro_rate_property_based(self, rate, n):
        f = payment_factor(rate, n)
        assert f > 1.0 / n  # above level-principal for r > 0
        assert f < 1.0 / n + (rate / 100.0 / 12.0) * 1.01  # within tolerance


class TestEdge10Rate50Pct:
    """Edge 10: payment_factor(50.0, 360) at extreme DSCR rate."""

    def test_50pct_360_returns_near_monthly_rate(self):
        f = payment_factor(50.0, 360)
        expected_r = 50.0 / 100.0 / 12.0  # 0.04167
        assert f == pytest.approx(expected_r, abs=1e-4)

    def test_50pct_monotonic_with_lower_rates(self):
        f_25 = payment_factor(25.0, 360)
        f_50 = payment_factor(50.0, 360)
        assert f_25 < f_50


# =====================================================================
# Group 2: DSCR Math Edge Cases (10 cases, all Slice 1)
# =====================================================================

class TestEdge11PitiaZero:
    """Edge 11: PITIA = 0 rejected (zero divisor)."""

    def test_dscr_track1_rejects_zero_pitia(self):
        with pytest.raises(ValueError, match="pitia must be > 0"):
            dscr_track1(3000, 0)

    def test_dscr_track2_rejects_zero_pitia(self):
        with pytest.raises(ValueError, match="pitia must be > 0"):
            dscr_track2(3000, 0.05, 0.08, 0.05, pitia=0)


class TestEdge12RentZero:
    """Edge 12: rent = 0 returns DSCR = 0 (not error)."""

    def test_dscr_track1_zero_rent(self):
        assert dscr_track1(0, 2853.985) == 0.0

    @given(pitia=st.floats(min_value=0.01, max_value=10000.0, allow_nan=False))
    def test_dscr_track1_zero_rent_property_based(self, pitia):
        assert dscr_track1(0.0, pitia) == 0.0

    def test_dscr_track2_zero_rent(self):
        assert dscr_track2(0, 0.05, 0.08, 0.05, pitia=2853.985) == 0.0


class TestEdge13RentNegative:
    """Edge 13: rent = -100 rejected."""

    def test_dscr_track1_rejects_negative_rent(self):
        with pytest.raises(ValueError, match="rent_monthly must be >= 0"):
            dscr_track1(-100, 2853.985)

    @given(rent=st.floats(max_value=-1e-9, allow_nan=False))
    def test_dscr_track1_rejects_any_negative_rent(self, rent):
        with pytest.raises(ValueError, match="rent_monthly must be >= 0"):
            dscr_track1(rent, 2853.985)


class TestEdge14VacancyAboveOne:
    """Edge 14: vacancy = 1.5 rejected (>100%)."""

    def test_dscr_track2_rejects_vacancy_1_5(self):
        with pytest.raises(ValueError, match="vacancy_pct must be in"):
            dscr_track2(3000, 1.5, 0, 0, 2853.985)

    def test_dscr_track2_rejects_vacancy_2_0(self):
        with pytest.raises(ValueError, match="vacancy_pct must be in"):
            dscr_track2(3000, 2.0, 0, 0, 2853.985)

    def test_dscr_track2_rejects_negative_vacancy(self):
        with pytest.raises(ValueError, match="vacancy_pct must be in"):
            dscr_track2(3000, -0.1, 0, 0, 2853.985)

    def test_dscr_track2_accepts_vacancy_boundaries(self):
        # vac = 0: 100% effective rent
        assert dscr_track2(3000, 0.0, 0.0, 0.0, 2853.985) == pytest.approx(1.0512, abs=0.001)
        # vac = 1: 0% effective rent
        assert dscr_track2(3000, 1.0, 0.0, 0.0, 2853.985) == 0.0


class TestEdge15MgmtNegative:
    """Edge 15: mgmt = -0.01 rejected."""

    def test_dscr_track2_rejects_negative_mgmt(self):
        with pytest.raises(ValueError, match="mgmt/maint pcts must be >= 0"):
            dscr_track2(3000, 0.05, -0.01, 0, 2853.985)

    def test_dscr_track2_rejects_negative_maint(self):
        with pytest.raises(ValueError, match="mgmt/maint pcts must be >= 0"):
            dscr_track2(3000, 0.05, 0, -0.01, 2853.985)


class TestEdge16VacPlusMgmt:
    """Edge 16: vac + mgmt > 1.5 rejected (sanity bound)."""

    def test_dscr_track2_rejects_egregious_combo(self):
        with pytest.raises(ValueError, match="unreasonably large"):
            dscr_track2(3000, 0.9, 0.7, 0, 2853.985)

    def test_dscr_track2_rejects_at_exactly_1_5_plus(self):
        with pytest.raises(ValueError, match="unreasonably large"):
            dscr_track2(3000, 0.8, 0.8, 0, 2853.985)  # 1.6 > 1.5


class TestEdge17DscrExactlyOne:
    """Edge 17 (CRITICAL): DSCR = exactly 1.0 must be a PASS."""

    def test_dscr_exactly_one_is_pass(self):
        assert track_decision(1.0, 1.0) == TrackDecision.GREEN

    def test_dscr_one_zero_two_above_is_pass(self):
        assert track_decision(1.0, 1.2) == TrackDecision.GREEN

    def test_dscr_one_zero_below_is_trap(self):
        assert track_decision(1.0, 0.95) == TrackDecision.TRAP

    def test_dscr_one_zero_above_is_struct_opp(self):
        assert track_decision(0.95, 1.0) == TrackDecision.STRUCTURING_OPPORTUNITY

    @given(t1=st.floats(min_value=0.99, max_value=1.01, allow_nan=False),
           t2=st.floats(min_value=0.99, max_value=1.01))
    def test_dscr_one_boundary_inclusive_property_based(self, t1, t2):
        decision = track_decision(t1, t2, min_dscr=1.0)
        t1_pass = t1 >= 1.0
        t2_pass = t2 >= 1.0
        if t1_pass and t2_pass:
            assert decision == TrackDecision.GREEN
        elif t1_pass and not t2_pass:
            assert decision == TrackDecision.TRAP
        elif not t1_pass and t2_pass:
            assert decision == TrackDecision.STRUCTURING_OPPORTUNITY
        else:
            assert decision == TrackDecision.KILL


class TestEdge18Dscr1005Bankers:
    """Edge 18 (CRITICAL): DSCR = 1.005 rounds DOWN to 1.0 (banker's)."""

    def test_dscr_1005_rounds_to_1_0(self):
        """1.005 with banker's rounding -> 1.0 (half to even, NOT 1.01)."""
        assert round_dscr(1.005) == 1.0

    def test_dscr_1005_via_integer_arithmetic(self):
        """100.5 / 100 = 1.005; banker's rounding: round(1.005, 2) = 1.0."""
        assert round_dscr(100.5 / 100) == 1.0

    def test_dscr_10051_rounds_to_1_01(self):
        """1.0051 (clearly above 1.005) rounds UP to 1.01."""
        assert round_dscr(1.0051) == 1.01

    def test_dscr_10049_rounds_to_1_00(self):
        """1.0049 (clearly below 1.005) rounds DOWN to 1.00."""
        assert round_dscr(1.0049) == 1.00


class TestEdge19DscrBelowOne:
    """Edge 19: DSCR = 0.995 (just below threshold) → KILL."""

    def test_dscr_995_below_is_kill(self):
        assert track_decision(0.995, 0.995) == TrackDecision.KILL

    def test_dscr_995_with_t2_above_is_struct_opp(self):
        assert track_decision(0.995, 1.005) == TrackDecision.STRUCTURING_OPPORTUNITY

    def test_dscr_995_with_t2_below_is_kill(self):
        assert track_decision(0.995, 0.99) == TrackDecision.KILL

    @given(t1=st.floats(min_value=0.99, max_value=0.9999, allow_nan=False),
           t2=st.floats(min_value=0.99, max_value=0.9999))
    def test_dscr_below_one_kill_property_based(self, t1, t2):
        assert track_decision(t1, t2) == TrackDecision.KILL


class TestEdge20DualTrackAllZero:
    """Edge 20: dual_track(0, 0, 0, ...) returns KILL."""

    def test_dual_track_all_zero_rents_returns_kill(self):
        result = dual_track(0, 0, 0, 0.05, 0.08, 0.05, pitia=2853.985)
        assert result["qualifying_rent"] == 0
        assert result["dscr_t1"] == 0.0
        assert result["dscr_t2"] == 0.0
        assert result["t1_pass"] is False
        assert result["t2_pass"] is False
        assert result["decision"] == TrackDecision.KILL

    @given(pitia=st.floats(min_value=0.01, max_value=10000.0, allow_nan=False))
    def test_dual_track_all_zero_property_based(self, pitia):
        result = dual_track(0, 0, 0, 0.0, 0.0, 0.0, pitia=pitia)
        assert result["dscr_t1"] == 0.0
        assert result["decision"] == TrackDecision.KILL


# =====================================================================
# Group 3: Leverage Edge Cases (5 cases, all Slice 1)
# =====================================================================

class TestEdge21DealBreakExtremeTarget:
    """Edge 21: deal_break_rate(target=2.0) — unreachable target raises."""

    def test_deal_break_unreachable_target_raises(self):
        with pytest.raises(ValueError, match="does not qualify at minimum rate"):
            deal_break_rate(
                loan=1_000_000,
                target_dscr=2.0,
                rent_monthly=3000,
                tax_annual=5000,
                insurance_annual=2000,
                hoa_monthly=150,
            )

    @given(target_dscr=st.floats(min_value=1.5, max_value=10.0, allow_nan=False))
    def test_deal_break_unreachable_property_based(self, target_dscr):
        # Setup: rent too small for target
        loan = 318_750
        rent = 3000
        n_months = 360
        # At 0%, max DSCR = rent * n_months / loan = 3000 * 360 / 318750 = 3.39
        max_dscr_at_zero = (rent * n_months) / loan
        if target_dscr > max_dscr_at_zero:
            with pytest.raises(ValueError, match="does not qualify at minimum rate"):
                deal_break_rate(
                    loan=loan,
                    target_dscr=target_dscr,
                    rent_monthly=rent,
                    n_months=n_months,
                )


class TestEdge22DealBreakExtremeRent:
    """Edge 22: deal_break_rate(rent=$100K) — super-qualified raises."""

    def test_deal_break_extreme_rent_raises(self):
        with pytest.raises(ValueError, match="qualifies even at maximum rate"):
            deal_break_rate(
                loan=100_000,
                target_dscr=1.0,
                rent_monthly=100_000,
                tax_annual=0,
                insurance_annual=0,
                hoa_monthly=0,
            )

    @given(rent=st.floats(min_value=50_000, max_value=1_000_000, allow_nan=False))
    def test_deal_break_extreme_rent_property_based(self, rent):
        loan = 100_000
        pf_20 = payment_factor(20.0, 360)
        max_dscr_at_20pct = rent / (loan * pf_20)
        if max_dscr_at_20pct > 1.0:
            with pytest.raises(ValueError, match="qualifies even at maximum rate"):
                deal_break_rate(
                    loan=loan,
                    target_dscr=1.0,
                    rent_monthly=rent,
                    n_months=360,
                )


class TestEdge23MaxPurchaseNoFixedCosts:
    """Edge 23: max_purchase_price with no fixed costs (raises)."""

    def test_max_purchase_no_fixed_costs_raises(self):
        with pytest.raises(ValueError, match="qualifies even at min_value"):
            max_purchase_price(
                target_dscr=1.05,
                rate_pct=7.00,
                hoa_monthly=0,
                flood_monthly=0,
                mi_monthly=0,
            )


class TestEdge24MaxPurchaseLtvOutOfRange:
    """Edge 24: max_purchase_price LTV out of (0, 1) raises."""

    @pytest.mark.parametrize("ltv", [-0.1, 0.0, 1.0, 1.5, 2.0])
    def test_max_purchase_ltv_rejected(self, ltv):
        with pytest.raises(ValueError, match="ltv must be in"):
            max_purchase_price(1.05, 7.00, hoa_monthly=150, ltv=ltv)

    @pytest.mark.parametrize("ltv", [0.5, 0.65, 0.75, 0.80, 0.85])
    def test_max_purchase_typical_ltv_accepted(self, ltv):
        result = max_purchase_price(1.05, 7.00, hoa_monthly=150, ltv=ltv)
        assert result > 0


class TestEdge25MaxPurchaseZeroYield:
    """Edge 25: max_purchase_price rent_per_value_yr=0 raises."""

    @pytest.mark.parametrize("yield_", [-0.01, 0.0, 1.0, 1.5, 2.0])
    def test_max_purchase_yield_rejected(self, yield_):
        with pytest.raises(ValueError, match="rent_per_value_yr must be in"):
            max_purchase_price(1.05, 7.00, hoa_monthly=150, rent_per_value_yr=yield_)

    @pytest.mark.parametrize("yield_", [0.05, 0.0847, 0.10, 0.15])
    def test_max_purchase_typical_yield_accepted(self, yield_):
        result = max_purchase_price(1.05, 7.00, hoa_monthly=150, rent_per_value_yr=yield_)
        assert result > 0


# =====================================================================
# Group 4: After-Tax Edge Cases (5 cases, Slice 3 — STUBS ONLY)
# =====================================================================

class TestEdge26OBBBABonusZeroBasis:
    """Edge 26: bonus_depreciation(cost_basis=0) — Slice 3 stub."""

    @pytest.mark.skip(reason="Slice 3 not yet implemented")
    def test_bonus_depreciation_zero_basis_is_zero(self):
        # Future Slice 3 API
        from dscr_core.after_tax import bonus_depreciation
        result = bonus_depreciation(cost_basis=0, year=2026)
        assert result == 0.0


class TestEdge27CostSegNoFiveYrProperty:
    """Edge 27: cost_segregation with no 5/7/15-yr property — Slice 3 stub."""

    @pytest.mark.skip(reason="Slice 3 not yet implemented")
    def test_cost_segregation_zero_reclassification(self):
        from dscr_core.after_tax import cost_segregation
        result = cost_segregation(
            building_basis=100_000,
            land_basis=20_000,
            seg_5yr_basis=0,
            seg_7yr_basis=0,
            seg_15yr_basis=0,
            property_type='residential',
        )
        assert result['total_depreciable_basis'] == 100_000  # excludes land
        assert result['year_1_depreciation'] == pytest.approx(3636.36, abs=0.01)


class TestEdge28Section179Zero:
    """Edge 28: section_179_deduction(purchases=0) — Slice 3 stub."""

    @pytest.mark.skip(reason="Slice 3 not yet implemented")
    def test_section_179_zero_purchases_is_zero(self):
        from dscr_core.after_tax import section_179_deduction
        result = section_179_deduction(
            qualifying_purchases=0,
            business_income=100_000,
            tax_year=2026,
        )
        assert result == 0.0


class TestEdge29QozPost2026:
    """Edge 29 (CRITICAL for Slice 3): QOZ regime transition."""

    @pytest.mark.skip(reason="Slice 3 not yet implemented — CRITICAL")
    def test_qoz_tcja_regime_pre_2027(self):
        from datetime import date
        from dscr_core.after_tax import qoz_deferral
        result = qoz_deferral(
            deferred_gain=100_000,
            investment_date=date(2025, 6, 15),
        )
        assert result['stepup_at_5yr'] == 10_000  # 10%
        assert result['stepup_at_7yr'] == 5_000   # TCJA: additional 5%
        assert result['regime'] == 'TCJA'

    @pytest.mark.skip(reason="Slice 3 not yet implemented — CRITICAL")
    def test_qoz_obbba_regime_post_2026(self):
        from datetime import date
        from dscr_core.after_tax import qoz_deferral
        result = qoz_deferral(
            deferred_gain=100_000,
            investment_date=date(2027, 6, 15),
        )
        assert result['stepup_at_5yr'] == 10_000  # 10%
        assert result['stepup_at_7yr'] == 0       # OBBBA: NO 7-yr
        assert result['deferral_period_years'] == 5
        assert result['regime'] == 'OBBBA'

    @pytest.mark.skip(reason="Slice 3 not yet implemented — CRITICAL")
    def test_qoz_regime_boundary_dec_31_2026(self):
        from datetime import date
        from dscr_core.after_tax import qoz_deferral
        last_tcja = qoz_deferral(deferred_gain=100_000, investment_date=date(2026, 12, 31))
        assert last_tcja['regime'] == 'TCJA'
        first_obbba = qoz_deferral(deferred_gain=100_000, investment_date=date(2027, 1, 1))
        assert first_obbba['regime'] == 'OBBBA'


class TestEdge30Section1031NoReplacement:
    """Edge 30: §1031 with no replacement property — Slice 3 stub."""

    @pytest.mark.skip(reason="Slice 3 not yet implemented")
    def test_section_1031_no_replacement_is_taxable(self):
        from dscr_core.after_tax import section_1031
        result = section_1031(
            relinquished_sale={
                'sale_price': 500_000,
                'original_basis': 200_000,
                'selling_costs': 30_000,
            },
            replacement_property=None,
        )
        assert result['deferred_gain'] == 0
        assert result['recognized_gain'] == 270_000  # 500K - 200K - 30K
        assert result['is_1031_exchange'] is False
