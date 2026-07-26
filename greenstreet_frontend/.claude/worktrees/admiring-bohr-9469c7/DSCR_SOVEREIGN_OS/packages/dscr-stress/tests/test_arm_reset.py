"""Tests for ARM reset forecasting.

Spec source: Sprint 6 Module 3 (ARM Reset Engine) + T11 NSS-Svensson.

24 tests covering:
- ARM reset schedule projection (all product types)
- Cap application (periodic, lifetime, floor)
- Payment shock computation
- NSS-integrated forecasting
- Stressed scenario (parallel shift)
- Validation edge cases (bad inputs)
"""

from __future__ import annotations

import numpy as np
import pytest

from dscr_stress.arm_reset import (
    ARM_INITIAL_PERIOD_MONTHS,
    ARM_RESET_FREQUENCY_MONTHS,
    DEFAULT_LIFETIME_CAP,
    DEFAULT_PERIODIC_CAP,
    payment_shock,
    populate_payment_shocks,
    project_arm_reset_schedule,
    project_arm_reset_stressed,
    project_arm_reset_with_nss,
)
from dscr_stress.yield_curve import NSSParams

# Standard test parameters
DEFAULT_PARAMS = {
    "initial_rate": 0.065,  # 6.50%
    "margin": 0.025,  # 2.50%
    "loan_amount": 300_000,
    "term_months": 360,  # 30 years
}

# Test NSS parameters (flat-ish curve ~3.65%)
TEST_NSS_PARAMS = NSSParams(
    beta0=0.0365,
    beta1=-0.005,
    beta2=0.0,
    beta3=0.0,
    lambda1=1.5,
    lambda2=5.0,
)


# ---------------------------------------------------------------------------
# ARM reset schedule projection
# ---------------------------------------------------------------------------


class TestProjectARMReset:
    def test_5_6_arm_basic_schedule(self):
        schedule = project_arm_reset_schedule(
            product="5/6",
            initial_rate=0.065,
            margin=0.025,
            n_resets=5,
            forward_rate_curve=np.array([0.035, 0.040, 0.045, 0.045, 0.045]),
            forward_rate_horizons_years=np.array([5.0, 5.5, 6.0, 6.5, 7.0]),
        )
        assert schedule.product == "5/6"
        assert schedule.n_resets == 5
        assert schedule.initial_period_months == 60
        assert schedule.reset_frequency_months == 6
        assert len(schedule.resets) == 5
        # First reset at month 60 (5.0 years)
        assert schedule.resets[0]["months_at_reset"] == 60
        # First forward index 3.5% + 2.5% margin = 6.0% fully indexed
        assert abs(schedule.resets[0]["fully_indexed_rate"] - 0.060) < 1e-6

    def test_all_arm_products_supported(self):
        for product in ("5/6", "7/6", "10/6", "5/1", "7/1", "10/1"):
            schedule = project_arm_reset_schedule(
                product=product,
                initial_rate=0.065,
                n_resets=2,
                forward_rate_curve=np.array([0.035, 0.040]),
            )
            expected_period = ARM_INITIAL_PERIOD_MONTHS[product]
            expected_freq = ARM_RESET_FREQUENCY_MONTHS[product]
            assert schedule.initial_period_months == expected_period
            assert schedule.reset_frequency_months == expected_freq

    def test_unknown_product_raises(self):
        with pytest.raises(ValueError, match="Unknown ARM product"):
            project_arm_reset_schedule(product="99/1", initial_rate=0.065)

    def test_invalid_initial_rate_raises(self):
        with pytest.raises(ValueError, match="initial_rate"):
            project_arm_reset_schedule(
                product="5/6",
                initial_rate=1.5,  # 150% — out of range
                forward_rate_curve=np.array([0.035]),
            )

    def test_invalid_margin_raises(self):
        with pytest.raises(ValueError, match="margin"):
            project_arm_reset_schedule(
                product="5/6",
                initial_rate=0.065,
                margin=0.20,  # 20% — too high
                forward_rate_curve=np.array([0.035]),
            )

    def test_invalid_caps_raise(self):
        with pytest.raises(ValueError, match="periodic_cap"):
            project_arm_reset_schedule(
                product="5/6",
                initial_rate=0.065,
                periodic_cap=0.20,  # 20% — too high
                forward_rate_curve=np.array([0.035]),
            )

    def test_invalid_n_resets_raises(self):
        with pytest.raises(ValueError, match="n_resets"):
            project_arm_reset_schedule(
                product="5/6",
                initial_rate=0.065,
                n_resets=0,
                forward_rate_curve=np.array([0.035]),
            )


# ---------------------------------------------------------------------------
# Cap application
# ---------------------------------------------------------------------------


class TestCapApplication:
    def test_periodic_cap_applied_on_increase(self):
        """If fully indexed > current + periodic cap, cap the change."""
        # Fully indexed = 0.10 (10%) when current = 0.065 (6.5%); change = +3.5%
        # Periodic cap = 2%; so capped_change = 2%; new rate = 8.5%
        schedule = project_arm_reset_schedule(
            product="5/6",
            initial_rate=0.065,
            margin=0.025,
            n_resets=1,
            periodic_cap=0.02,
            lifetime_cap=0.10,
            forward_rate_curve=np.array([0.075]),  # + 2.5% margin = 10%
        )
        reset = schedule.resets[0]
        assert reset["fully_indexed_rate"] == 0.10
        assert reset["capped_rate"] == pytest.approx(0.085, abs=1e-6)
        assert reset["periodic_cap_applied"] is True

    def test_lifetime_cap_applied(self):
        """Multiple resets compounding should eventually hit lifetime cap.

        Initial 6.5%, periodic 2%, lifetime 5% (max 11.5%).
        Forward 10% + margin 2.5% = 12.5% per reset; +2% per reset.
        After reset 4: rate hits 8.5 + 2 = 10.5 (capped by periodic), then... no wait,
        each reset can only +2%. So after 3 resets we'd be at 6.5+6 = 12.5. Lifetime caps at 11.5.
        Reset 4: proposed +2 -> 12.5; periodic cap 2 -> 12.5 (no clamp since
        fully_indexed pushes too far); lifetime cap fires.
        """
        schedule = project_arm_reset_schedule(
            product="5/6",
            initial_rate=0.065,
            margin=0.025,
            n_resets=5,
            periodic_cap=0.02,
            lifetime_cap=0.05,
            forward_rate_curve=np.array([0.10, 0.10, 0.10, 0.10, 0.10]),  # All 12.5% fully indexed
        )
        # At least one reset should trigger lifetime cap
        any_lifetime = any(r["lifetime_cap_applied"] for r in schedule.resets)
        assert any_lifetime
        # Final rate should not exceed lifetime max
        max_rate = max(r["capped_rate"] for r in schedule.resets)
        assert max_rate <= 0.065 + 0.05 + 1e-9

    def test_lifetime_floor_applied_on_decrease(self):
        """Multiple resets going down should eventually hit lifetime floor."""
        schedule = project_arm_reset_schedule(
            product="5/6",
            initial_rate=0.065,
            margin=0.025,
            n_resets=5,
            periodic_cap=0.02,
            lifetime_cap=0.05,
            lifetime_floor_delta=0.02,
            forward_rate_curve=np.array([-0.01, -0.01, -0.01, -0.01, -0.01]),
        )
        any_floor = any(r["lifetime_cap_applied"] for r in schedule.resets)
        assert any_floor
        # Final rate should not go below floor
        min_rate = min(r["capped_rate"] for r in schedule.resets)
        assert min_rate >= 0.065 - 0.02 - 1e-9

    def test_no_caps_when_within_bounds(self):
        """If change is within periodic and lifetime bounds, no caps apply."""
        # Initial 6.5%, fully indexed 6.7%, periodic cap 2% — change is +0.2%
        schedule = project_arm_reset_schedule(
            product="5/6",
            initial_rate=0.065,
            margin=0.025,
            n_resets=1,
            periodic_cap=0.02,
            lifetime_cap=0.05,
            forward_rate_curve=np.array([0.042]),  # + 2.5% margin = 6.7%
        )
        reset = schedule.resets[0]
        assert reset["capped_rate"] == pytest.approx(0.067, abs=1e-6)
        assert reset["periodic_cap_applied"] is False
        assert reset["lifetime_cap_applied"] is False


# ---------------------------------------------------------------------------
# Verdict logic
# ---------------------------------------------------------------------------


class TestVerdict:
    def test_arm_favorable_when_avg_below_initial(self):
        schedule = project_arm_reset_schedule(
            product="5/6",
            initial_rate=0.065,
            n_resets=3,
            forward_rate_curve=np.array([0.030, 0.030, 0.030]),  # Way below
        )
        assert "ARM FAVORABLE" in schedule.arm_vs_fixed_verdict

    def test_fixed_favorable_when_avg_above_initial(self):
        schedule = project_arm_reset_schedule(
            product="5/6",
            initial_rate=0.065,
            n_resets=3,
            forward_rate_curve=np.array([0.080, 0.080, 0.080]),  # Way above
        )
        assert "FIXED FAVORABLE" in schedule.arm_vs_fixed_verdict

    def test_neutral_when_avg_near_initial(self):
        schedule = project_arm_reset_schedule(
            product="5/6",
            initial_rate=0.065,
            n_resets=3,
            forward_rate_curve=np.array([0.040, 0.040, 0.040]),  # +2.5% margin = 6.5% ≈ initial
        )
        assert schedule.arm_vs_fixed_verdict == "NEUTRAL"


# ---------------------------------------------------------------------------
# Payment shock
# ---------------------------------------------------------------------------


class TestPaymentShock:
    def test_payment_shock_positive_on_rate_increase(self):
        """Rate increase should yield positive monthly payment change."""
        shock = payment_shock(
            loan_amount=300_000, initial_rate=0.065, first_reset_rate=0.085, n_months=300
        )
        assert shock > 0

    def test_payment_shock_negative_on_rate_decrease(self):
        """Rate decrease should yield negative monthly payment change."""
        shock = payment_shock(
            loan_amount=300_000, initial_rate=0.085, first_reset_rate=0.065, n_months=300
        )
        assert shock < 0

    def test_payment_shock_zero_when_rate_unchanged(self):
        shock = payment_shock(
            loan_amount=300_000, initial_rate=0.065, first_reset_rate=0.065, n_months=300
        )
        assert shock == pytest.approx(0.0, abs=0.01)

    def test_payment_shock_rejects_invalid_inputs(self):
        with pytest.raises(ValueError):
            payment_shock(
                loan_amount=-100, initial_rate=0.065, first_reset_rate=0.085, n_months=300
            )
        with pytest.raises(ValueError):
            payment_shock(
                loan_amount=100_000, initial_rate=0.065, first_reset_rate=0.085, n_months=0
            )

    def test_populate_payment_shocks_adds_to_schedule(self):
        schedule = project_arm_reset_schedule(
            product="5/6",
            initial_rate=0.065,
            n_resets=3,
            forward_rate_curve=np.array([0.080, 0.075, 0.075]),  # All way above
        )
        updated = populate_payment_shocks(schedule, loan_amount=300_000, term_months=360)
        assert updated.payment_shock_at_first_reset != 0.0
        assert all("payment_shock" in r for r in updated.resets)
        # Peak shock should be at or near first reset (largest rate move)
        assert updated.payment_shock_at_peak >= updated.payment_shock_at_first_reset * 0.5


# ---------------------------------------------------------------------------
# NSS-integrated projection
# ---------------------------------------------------------------------------


class TestNSSIntegration:
    def test_with_nss_returns_nss_labeled_schedule(self):
        schedule = project_arm_reset_with_nss(
            product="5/6",
            initial_rate=0.065,
            nss_params=TEST_NSS_PARAMS,
        )
        assert schedule.curve_used == "NSS-calibrated"
        assert len(schedule.resets) == 5
        # Each reset should have a forward_index_rate from NSS
        for r in schedule.resets:
            assert "forward_index_rate" in r
            assert -0.05 < r["forward_index_rate"] < 0.30

    def test_with_nss_includes_payment_shocks_when_loan_amount_given(self):
        schedule = project_arm_reset_with_nss(
            product="5/6",
            initial_rate=0.065,
            nss_params=TEST_NSS_PARAMS,
            loan_amount=300_000,
            term_months=360,
        )
        assert all("payment_shock" in r for r in schedule.resets)

    def test_with_nss_no_payment_shocks_when_loan_amount_zero(self):
        schedule = project_arm_reset_with_nss(
            product="5/6",
            initial_rate=0.065,
            nss_params=TEST_NSS_PARAMS,
            loan_amount=0,
            term_months=360,
        )
        assert schedule.payment_shock_at_first_reset == 0.0

    def test_stressed_scenario_shifts_curve_up(self):
        baseline = project_arm_reset_with_nss(
            product="5/6",
            initial_rate=0.065,
            nss_params=TEST_NSS_PARAMS,
        )
        stressed = project_arm_reset_stressed(
            product="5/6",
            initial_rate=0.065,
            nss_params=TEST_NSS_PARAMS,
            shift_bps=200,  # +200 bps parallel
        )
        # Stressed should produce higher avg projection (within cap limits)
        assert stressed.avg_projected_rate >= baseline.avg_projected_rate - 0.0001

    def test_stressed_scenario_shift_validation(self):
        with pytest.raises(ValueError, match="shift_bps"):
            project_arm_reset_stressed(
                product="5/6",
                initial_rate=0.065,
                nss_params=TEST_NSS_PARAMS,
                shift_bps=float("nan"),
            )


# ---------------------------------------------------------------------------
# Default values match Pennymac 6.12.26 standard
# ---------------------------------------------------------------------------


class TestDefaults:
    def test_default_margin_is_2_5_pct(self):
        """Pennymac 6.12.26 standard margin is 2.50%."""
        from dscr_stress.arm_reset import DEFAULT_MARGIN

        assert DEFAULT_MARGIN == pytest.approx(0.025, abs=1e-9)

    def test_default_periodic_cap_is_2_pct(self):
        assert DEFAULT_PERIODIC_CAP == pytest.approx(0.02, abs=1e-9)

    def test_default_lifetime_cap_is_5_pct(self):
        assert DEFAULT_LIFETIME_CAP == pytest.approx(0.05, abs=1e-9)
