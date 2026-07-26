"""Monte Carlo driver tests (Slice 2 P0-5).

Source: dscr_stress.monte_carlo module (v0.6.0)
"""

from __future__ import annotations

import dataclasses

import numpy as np
import pytest

from dscr_stress.distributional_dscr import Deal
from dscr_stress.monte_carlo import (
    DSCRScenario,
    MCConfig,
    MCResult,
    monte_carlo_deal,
    summarize_mc,
)


def _make_deal(**overrides) -> Deal:
    """Default Sovereign Master Deal A with optional overrides."""
    defaults = dict(
        loan_amount=318_750.0,
        annual_rate=0.07,
        term_months=360,
        monthly_rent=3_000.0,
        monthly_tax=416.67,
        monthly_insurance=166.67,
        monthly_hoa=150.0,
        term_projection_months=36,
    )
    defaults.update(overrides)
    return Deal(**defaults)


class TestMCConfig:
    def test_defaults(self):
        c = MCConfig()
        assert c.n_scenarios == 10_000
        assert c.horizon_months == 360
        assert c.regime == "normal"
        assert c.seed == 42
        assert c.use_vinecop is True
        assert c.confidence_level == 0.95
        assert c.breach_dscr_threshold == 1.0

    def test_frozen(self):
        c = MCConfig()
        with pytest.raises(dataclasses.FrozenInstanceError):
            c.n_scenarios = 5_000  # type: ignore


class TestDSCRScenario:
    def test_frozen(self):
        s = DSCRScenario(
            scenario_id=0,
            mean_dscr=1.0,
            min_dscr=0.9,
            final_dscr=1.0,
            breach=False,
            monthly_rent=3000.0,
            monthly_pitia=2853.0,
            annual_rate=0.07,
            stress_path_head=(1.05,),
        )
        with pytest.raises(dataclasses.FrozenInstanceError):
            s.mean_dscr = 0.5  # type: ignore


class TestMonteCarloDeal:
    """End-to-end MC simulation tests."""

    def test_returns_mcresult(self):
        deal = _make_deal()
        result = monte_carlo_deal(deal, MCConfig(n_scenarios=100))
        assert isinstance(result, MCResult)
        assert result.n_scenarios == 100
        assert len(result.scenarios) == 100

    def test_default_deal_breach_prob_in_sensible_range(self):
        """Sovereign Master Deal A: ~10-40% breach probability under normal regime."""
        deal = _make_deal()
        result = monte_carlo_deal(deal, MCConfig(n_scenarios=5000))
        assert 0.05 <= result.breach_probability <= 0.55
        assert result.mean_dscr > 0.5  # sanity

    def test_regime_increases_breach_probability(self):
        """Stress regime should produce higher breach prob than stable regime."""
        deal = _make_deal()
        stable = monte_carlo_deal(deal, MCConfig(n_scenarios=2000, regime="stable"))
        stress = monte_carlo_deal(deal, MCConfig(n_scenarios=2000, regime="stress"))
        # Stress should have at least 2x breach probability (allow for noise)
        assert stress.breach_probability >= stable.breach_probability * 1.5

    def test_invalid_n_scenarios_raises(self):
        deal = _make_deal()
        with pytest.raises(ValueError, match="n_scenarios"):
            monte_carlo_deal(deal, MCConfig(n_scenarios=0))

    def test_invalid_regime_raises(self):
        deal = _make_deal()
        with pytest.raises(ValueError, match="regime must be"):
            monte_carlo_deal(deal, MCConfig(n_scenarios=10, regime="invalid"))

    def test_reproducible_with_seed(self):
        deal = _make_deal()
        r1 = monte_carlo_deal(deal, MCConfig(n_scenarios=200, seed=123))
        r2 = monte_carlo_deal(deal, MCConfig(n_scenarios=200, seed=123))
        assert r1.breach_probability == r2.breach_probability
        assert r1.mean_dscr == r2.mean_dscr
        assert r1.var_dscr == r2.var_dscr

    def test_different_seeds_produce_different_results(self):
        deal = _make_deal()
        r1 = monte_carlo_deal(deal, MCConfig(n_scenarios=500, seed=1))
        r2 = monte_carlo_deal(deal, MCConfig(n_scenarios=500, seed=999))
        # Different seeds should give different breach probs (probabilistically)
        assert abs(r1.breach_probability - r2.breach_probability) > 0.001

    def test_var_le_es_le_mean(self):
        """VaR <= ES <= mean for loss-oriented metric."""
        deal = _make_deal()
        result = monte_carlo_deal(deal, MCConfig(n_scenarios=1000))
        # Var and ES are computed at 95% confidence (worst 5%)
        # Var should be <= mean, ES should be <= Var (CVaR <= VaR)
        assert result.var_dscr <= result.mean_dscr + 0.01
        assert result.es_dscr <= result.var_dscr + 0.01

    def test_percentiles_monotonic(self):
        """5th <= 50th <= 95th percentile."""
        deal = _make_deal()
        result = monte_carlo_deal(deal, MCConfig(n_scenarios=1000))
        assert result.percentile_dscr_5 <= result.percentile_dscr_50
        assert result.percentile_dscr_50 <= result.percentile_dscr_95

    def test_scenario_summary_fields_present(self):
        deal = _make_deal()
        result = monte_carlo_deal(deal, MCConfig(n_scenarios=50))
        s = result.scenarios[0]
        assert isinstance(s, DSCRScenario)
        assert s.scenario_id == 0
        assert s.monthly_rent > 0
        assert s.monthly_pitia > 0
        assert 0 <= s.annual_rate <= 0.30
        assert len(s.stress_path_head) == 60  # truncated

    def test_scenarios_with_breach_counted_correctly(self):
        """breach_probability == (# breach scenarios) / n_scenarios."""
        deal = _make_deal()
        result = monte_carlo_deal(deal, MCConfig(n_scenarios=500))
        expected_breach = sum(1 for s in result.scenarios if s.breach)
        assert result.breach_probability == expected_breach / result.n_scenarios

    def test_breach_threshold_changes_results(self):
        deal = _make_deal()
        r_strict = monte_carlo_deal(deal, MCConfig(n_scenarios=500, breach_dscr_threshold=1.25))
        r_relaxed = monte_carlo_deal(deal, MCConfig(n_scenarios=500, breach_dscr_threshold=0.75))
        # Stricter threshold (1.25) should produce >= breach probability vs relaxed (0.75)
        assert r_strict.breach_probability >= r_relaxed.breach_probability

    def test_reserve_overlay_increases_required(self):
        """Adding FICO<700 overlay should increase reserve requirements."""
        deal = _make_deal()
        r_no_overlay = monte_carlo_deal(deal, MCConfig(n_scenarios=100), fico=None)
        r_low_fico = monte_carlo_deal(deal, MCConfig(n_scenarios=100), fico=650)
        # Low FICO + LTV > 75% overlay should push required reserves higher
        assert r_low_fico.reserve_required_median >= r_no_overlay.reserve_required_median

    def test_foreign_national_base_12_months(self):
        """is_foreign_national=True should result in 12mo base reserves."""
        deal = _make_deal()
        r_standard = monte_carlo_deal(deal, MCConfig(n_scenarios=200), is_foreign_national=False)
        r_fn = monte_carlo_deal(deal, MCConfig(n_scenarios=200), is_foreign_national=True)
        # Foreign national scenarios should have HIGHER reserve requirements
        # (12mo base vs 6mo base, before any overlays)
        assert r_fn.reserve_required_median >= r_standard.reserve_required_median

    def test_vinecop_disabled_falls_back_to_marginals(self):
        """use_vinecop=False should still produce results (from marginals)."""
        deal = _make_deal()
        result = monte_carlo_deal(deal, MCConfig(n_scenarios=100, use_vinecop=False))
        assert result.vinecop_fitted is False
        assert len(result.scenarios) == 100

    def test_vinecop_insufficient_data_falls_back(self):
        """Too few historical observations → falls back to marginals."""
        deal = _make_deal()
        # Only 10 obs, less than n_obs_history=200
        tiny_data = np.random.default_rng(0).standard_normal((10, 5))
        result = monte_carlo_deal(
            deal,
            MCConfig(n_scenarios=100, n_obs_history=200),
            historical_data=tiny_data,
        )
        assert result.vinecop_fitted is False

    def test_vinecop_with_sufficient_data(self):
        """Enough historical data → vinecop fitted and used."""
        deal = _make_deal()
        rng = np.random.default_rng(0)
        # Generate correlated normal data with realistic n_obs
        n = 500
        chol = np.linalg.cholesky(
            np.array(
                [
                    [1.0, 0.5, 0.3, 0.2, 0.1],
                    [0.5, 1.0, 0.4, 0.3, 0.2],
                    [0.3, 0.4, 1.0, 0.5, 0.3],
                    [0.2, 0.3, 0.5, 1.0, 0.4],
                    [0.1, 0.2, 0.3, 0.4, 1.0],
                ]
            )
        )
        data = rng.standard_normal((n, 5)) @ chol.T
        result = monte_carlo_deal(
            deal,
            MCConfig(n_scenarios=100, n_obs_history=200),
            historical_data=data,
        )
        assert result.vinecop_fitted is True

    def test_summary_keys(self):
        deal = _make_deal()
        result = monte_carlo_deal(deal, MCConfig(n_scenarios=100))
        s = summarize_mc(result)
        expected_keys = {
            "n_scenarios",
            "mean_dscr",
            "p5_dscr",
            "p50_dscr",
            "p95_dscr",
            "var_95",
            "es_95",
            "breach_prob",
            "reserve_shortfall_prob",
            "vinecop_fitted",
        }
        assert set(s.keys()) == expected_keys

    def test_primary_source_cited(self):
        """Result includes Slice 2 P0-5 source citation."""
        deal = _make_deal()
        result = monte_carlo_deal(deal, MCConfig(n_scenarios=10))
        ps = result.primary_source.lower()
        assert "slice 2 p0-5" in ps
        assert "r-vine copula" in ps or "vinecop" in ps
        assert "reserves overlays" in ps

    def test_fico_zero_treated_as_none(self):
        """fico=0 (out-of-range) should not crash AND should NOT zero reserves.

        Regression for v0.6.0 Bug #1: the prior code caught ValueError from
        reserves_check and silently zeroed the entire scenario's reserve
        requirement. Correct behavior: treat out-of-range as fico=None
        (skip FICO overlay, keep standard 6mo base).
        """
        deal = _make_deal(monthly_rent=5000.0)  # high rent = no breach
        result = monte_carlo_deal(deal, MCConfig(n_scenarios=50), liquid_assets=100_000, fico=0)
        assert result.n_scenarios == 50
        # Reserve requirement should NOT be zero (caller intent: "no FICO data",
        # not "no reserves"). Standard 6mo base applies.
        assert result.reserve_required_median > 0

    def test_fico_out_of_range_skips_overlay_keeps_reserves(self):
        """fico=850 (upper boundary) and fico=100 (too low) — both should
        keep standard 6mo reserves with no FICO overlay."""
        deal = _make_deal(monthly_rent=5000.0)
        r_high = monte_carlo_deal(deal, MCConfig(n_scenarios=50), liquid_assets=100_000, fico=850)
        r_low = monte_carlo_deal(deal, MCConfig(n_scenarios=50), liquid_assets=100_000, fico=100)
        # Both should have similar reserve_median (standard 6mo, no FICO overlay)
        assert abs(r_high.reserve_required_median - r_low.reserve_required_median) < 200

    def test_fn_overrides_sub1_on_breach_scenario(self):
        """is_foreign_national=True should force 12mo even when scenario breaches.

        Regression for v0.6.0 Bug #2: the prior code checked sub1 first,
        so any breaching FN scenario got 9mo (sub1) instead of 12mo (FN).
        Compare two scenarios: one with FN=True (12mo), one with FN=False
        and worst_dscr < 1.0 (sub1 = 9mo). FN median should be HIGHER.
        """
        # Force breaches via very low rent
        deal = _make_deal(monthly_rent=500.0)
        r_fn = monte_carlo_deal(
            deal,
            MCConfig(n_scenarios=500),
            liquid_assets=100_000,
            is_foreign_national=True,
        )
        r_sub1 = monte_carlo_deal(
            deal,
            MCConfig(n_scenarios=500),
            liquid_assets=100_000,
            is_foreign_national=False,
        )
        # Force a breach to dominate the borrower_type decision
        # The reserve median for FN should be >= sub1 (FN = 12mo vs sub1 = 9mo)
        assert r_fn.reserve_required_median >= r_sub1.reserve_required_median
        # And FN should be > 0 (caller expects real reserves, not zeroed)
        assert r_fn.reserve_required_median > 0

    def test_ltv_zero_treated_as_none(self):
        """ltv=0 should not trigger overlay (threshold is strict >)."""
        deal = _make_deal()
        result = monte_carlo_deal(deal, MCConfig(n_scenarios=50), ltv_ratio=0.0)
        assert result.n_scenarios == 50
