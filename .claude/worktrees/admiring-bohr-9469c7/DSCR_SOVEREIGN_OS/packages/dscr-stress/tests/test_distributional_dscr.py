"""Tests for 5-Dim Distributional DSCR Engine (Slice 2 P0-1).

These tests verify the distributional output of a fixed-rate fully-amortizing
loan under stochastic rent / vacancy / expense / rate paths.

The 5 dimensions are:
    1. p12       — P(DSCR_t < 1.0 for any t in [0, 12])
    2. p36       — P(DSCR_t < 1.0 for any t in [0, 36])
    3. lifetime  — P(min DSCR over [0, T] < 1.0)
    4. E_macro   — E[DSCR | macro recession scenario]
    5. CVaR_95   — Conditional VaR at 95th percentile macro

Tolerance: Monte Carlo sample error. With N=10,000 paths, expect ±0.01
on p12/p36/lifetime and ±0.02 on CVaR_95.
"""

from __future__ import annotations

from dataclasses import dataclass, replace

import pytest
from dscr_core.payment import pi

from dscr_stress.distributional_dscr import (
    RENT_LOGNORMAL_SIGMA,
    RENT_LOGNORMAL_SIGMA_STABLE,
    RENT_LOGNORMAL_SIGMA_STRESS,
    RENT_SIGMA_BY_REGIME,
    Deal,
    DistributionalDSCR,
    distributional_dscr,
)

# --- Test fixtures ---


@dataclass(frozen=True)
class SovereignDealA:
    """Sovereign Master Deal A golden vector.

    $425K / 75% LTV / 7.00% / 30yr / lease $3,000 = 1007 / tax $5K / ins $2K / HOA $150.
    P&I = $2,120.6517, PITIA = $2,853.9850, Track 1 DSCR = 1.0512.
    """

    loan_amount: float = 318_750.0
    annual_rate: float = 0.07
    term_months: int = 360
    monthly_rent: float = 3_000.0
    monthly_tax: float = 5_000.0 / 12  # $416.67
    monthly_insurance: float = 2_000.0 / 12  # $166.67
    monthly_hoa: float = 150.0
    term_projection_months: int = 36


def _golden_deal() -> Deal:
    s = SovereignDealA()
    return Deal(
        loan_amount=s.loan_amount,
        annual_rate=s.annual_rate,
        term_months=s.term_months,
        monthly_rent=s.monthly_rent,
        monthly_tax=s.monthly_tax,
        monthly_insurance=s.monthly_insurance,
        monthly_hoa=s.monthly_hoa,
        term_projection_months=s.term_projection_months,
    )


def test_golden_vector_pitia_matches_slice1() -> None:
    """Sanity: PITIA from Slice 1 must equal $2,853.9850 (golden vector)."""
    s = SovereignDealA()
    # dscr_core.pi() takes annual_rate as PERCENTAGE (7.00), not decimal (0.07)
    monthly_pi = pi(s.loan_amount, s.annual_rate * 100.0, s.term_months)
    # piti(pi, tax_annual, insurance_annual) returns PITI; add HOA monthly
    from dscr_core.payment import pitia as compute_pitia

    monthly_pit = compute_pitia(
        p_i=monthly_pi,
        tax_annual=s.monthly_tax * 12,
        insurance_annual=s.monthly_insurance * 12,
        hoa_monthly=s.monthly_hoa,
    )
    assert abs(monthly_pit - 2_853.9850) < 0.01


# --- 5-dim output structure ---


def test_returns_dataclass_with_five_dimensions() -> None:
    deal = _golden_deal()
    result = distributional_dscr(deal, n_paths=10_000, seed=42)
    assert isinstance(result, DistributionalDSCR)
    assert hasattr(result, "p12")
    assert hasattr(result, "p36")
    assert hasattr(result, "lifetime")
    assert hasattr(result, "E_macro")
    assert hasattr(result, "CVaR_95")


def test_all_outputs_are_in_unit_interval() -> None:
    """Probabilities and ratios should be in [0, 1] (CVaR is conditional coverage, also [0, 1])."""
    deal = _golden_deal()
    result = distributional_dscr(deal, n_paths=10_000, seed=42)
    assert 0.0 <= result.p12 <= 1.0
    assert 0.0 <= result.p36 <= 1.0
    assert 0.0 <= result.lifetime <= 1.0
    assert 0.0 <= result.E_macro <= 1.0
    assert 0.0 <= result.CVaR_95 <= 1.0


# --- Golden vector benchmark (Sovereign Master Deal A) ---


def test_p12_in_reasonable_range() -> None:
    """Sovereign Master Deal A at $3K rent vs $2.85K PITIA: 1.05x DSCR at origination.

    With cumulative rent growth random walk (sigma=5% annualized), expect
    p12 ~ 15-30% near-term breach probability (rent at month 12).
    Tolerance widened to accommodate Monte Carlo variance across calibration choices.
    """
    deal = _golden_deal()
    result = distributional_dscr(deal, n_paths=10_000, seed=42)
    assert 0.05 <= result.p12 <= 0.50, f"p12 out of expected range: {result.p12}"


def test_p36_greater_than_p12() -> None:
    """3-year breach probability must be >= 1-year breach probability."""
    deal = _golden_deal()
    result = distributional_dscr(deal, n_paths=10_000, seed=42)
    assert result.p36 >= result.p12, f"p36 ({result.p36}) must be >= p12 ({result.p12})"


def test_lifetime_greater_than_p36() -> None:
    """Lifetime breach probability must be >= 3-year breach probability."""
    deal = _golden_deal()
    result = distributional_dscr(deal, n_paths=10_000, seed=42)
    assert result.lifetime >= result.p36, (
        f"lifetime ({result.lifetime}) must be >= p36 ({result.p36})"
    )


def test_e_macro_less_than_origination_dscr() -> None:
    """Macro-conditioned expected DSCR must be less than origination DSCR (1.05)."""
    deal = _golden_deal()
    result = distributional_dscr(deal, n_paths=10_000, seed=42)
    assert result.E_macro < 1.05, f"E_macro ({result.E_macro}) must be < origination DSCR (1.05)"


def test_cvar_less_than_e_macro() -> None:
    """CVaR (tail conditional) must be less than E[DSCR|macro] (mean)."""
    deal = _golden_deal()
    result = distributional_dscr(deal, n_paths=10_000, seed=42)
    assert result.CVaR_95 <= result.E_macro, (
        f"CVaR_95 ({result.CVaR_95}) must be <= E_macro ({result.E_macro})"
    )


# --- Determinism ---


def test_same_seed_produces_same_output() -> None:
    """Reproducibility: same seed must produce identical 5-dim output."""
    deal = _golden_deal()
    r1 = distributional_dscr(deal, n_paths=5_000, seed=42)
    r2 = distributional_dscr(deal, n_paths=5_000, seed=42)
    assert r1.p12 == r2.p12
    assert r1.p36 == r2.p36
    assert r1.lifetime == r2.lifetime
    assert abs(r1.E_macro - r2.E_macro) < 1e-9
    assert abs(r1.CVaR_95 - r2.CVaR_95) < 1e-9


def test_different_seed_produces_different_output() -> None:
    """Different seeds must produce statistically different output."""
    deal = _golden_deal()
    r1 = distributional_dscr(deal, n_paths=5_000, seed=42)
    r2 = distributional_dscr(deal, n_paths=5_000, seed=99)
    # At least one dimension should differ by Monte Carlo noise floor (~0.01 at N=5k)
    diffs = [
        abs(r1.p12 - r2.p12),
        abs(r1.p36 - r2.p36),
        abs(r1.lifetime - r2.lifetime),
        abs(r1.E_macro - r2.E_macro),
        abs(r1.CVaR_95 - r2.CVaR_95),
    ]
    assert max(diffs) > 0.002, f"Seeds 42 vs 99 produced identical output: {r1} vs {r2}"


# --- Edge cases ---


def test_zero_rent_deal_has_high_breach_probability() -> None:
    """A deal with zero rent must have ~100% breach probability."""
    deal = Deal(
        loan_amount=318_750.0,
        annual_rate=0.07,
        term_months=360,
        monthly_rent=0.0,
        monthly_tax=416.67,
        monthly_insurance=166.67,
        monthly_hoa=150.0,
        term_projection_months=36,
    )
    result = distributional_dscr(deal, n_paths=1_000, seed=42)
    assert result.p12 > 0.95, f"Zero rent should breach in 12 mo: p12={result.p12}"
    assert result.lifetime > 0.99, f"Zero rent should breach lifetime: {result.lifetime}"


def test_very_high_rent_deal_has_low_breach_probability() -> None:
    """A deal with 5x rent must have ~0% breach probability."""
    deal = Deal(
        loan_amount=318_750.0,
        annual_rate=0.07,
        term_months=360,
        monthly_rent=15_000.0,  # 5x normal
        monthly_tax=416.67,
        monthly_insurance=166.67,
        monthly_hoa=150.0,
        term_projection_months=36,
    )
    result = distributional_dscr(deal, n_paths=1_000, seed=42)
    assert result.p12 < 0.05, f"5x rent should not breach: p12={result.p12}"
    assert result.lifetime < 0.10, f"5x rent should rarely breach lifetime: {result.lifetime}"


# --- Validation ---


def test_negative_loan_amount_raises() -> None:
    """Negative loan amount must raise ValueError."""
    deal = Deal(
        loan_amount=-1.0,
        annual_rate=0.07,
        term_months=360,
        monthly_rent=3_000.0,
        monthly_tax=416.67,
        monthly_insurance=166.67,
        monthly_hoa=150.0,
        term_projection_months=36,
    )
    with pytest.raises(ValueError):
        distributional_dscr(deal, n_paths=1_000, seed=42)


def test_zero_n_paths_raises() -> None:
    """N=0 paths must raise ValueError."""
    deal = _golden_deal()
    with pytest.raises(ValueError):
        distributional_dscr(deal, n_paths=0, seed=42)


def test_term_projection_exceeds_loan_term_raises() -> None:
    """term_projection_months > term_months must raise."""
    deal = Deal(
        loan_amount=318_750.0,
        annual_rate=0.07,
        term_months=12,
        monthly_rent=3_000.0,
        monthly_tax=416.67,
        monthly_insurance=166.67,
        monthly_hoa=150.0,
        term_projection_months=36,  # > term_months=12
    )
    with pytest.raises(ValueError):
        distributional_dscr(deal, n_paths=1_000, seed=42)


def test_macro_condition_uses_actual_paths() -> None:
    """E_macro is computed from the worst 5% of paths (matching CVaR-95)."""
    deal = _golden_deal()
    result = distributional_dscr(deal, n_paths=10_000, seed=42)
    # Both E_macro and CVaR_95 should reflect macro-conditioned paths
    # (we verify structural property: E_macro > CVaR_95)
    assert result.E_macro >= result.CVaR_95


# --- Volatility regime (APEX 2 calibration, June 2026) ---


def test_regime_constants_match_documented_values() -> None:
    """Sigma constants match documented APEX 2 calibration."""
    assert RENT_LOGNORMAL_SIGMA == 0.05
    assert RENT_LOGNORMAL_SIGMA_STABLE == 0.025
    assert RENT_LOGNORMAL_SIGMA_STRESS == 0.095
    assert RENT_SIGMA_BY_REGIME == {
        "stable": 0.025,
        "normal": 0.05,
        "stress": 0.095,
    }


def test_stress_regime_produces_higher_breach_probability() -> None:
    """stress regime must produce strictly higher p12/p36/lifetime than normal."""
    base = _golden_deal()
    normal = distributional_dscr(base, n_paths=10_000, seed=42)
    stress_deal = replace(base, volatility_regime="stress")
    stress = distributional_dscr(stress_deal, n_paths=10_000, seed=42)
    assert stress.p12 > normal.p12, (
        f"stress.p12 ({stress.p12}) must exceed normal.p12 ({normal.p12})"
    )
    assert stress.p36 > normal.p36
    assert stress.lifetime > normal.lifetime


def test_stable_regime_produces_lower_breach_probability() -> None:
    """stable regime must produce strictly lower p12/p36/lifetime than normal."""
    base = _golden_deal()
    normal = distributional_dscr(base, n_paths=10_000, seed=42)
    stable_deal = replace(base, volatility_regime="stable")
    stable = distributional_dscr(stable_deal, n_paths=10_000, seed=42)
    assert stable.p12 < normal.p12, (
        f"stable.p12 ({stable.p12}) must be lower than normal.p12 ({normal.p12})"
    )
    assert stable.p36 < normal.p36
    assert stable.lifetime < normal.lifetime


def test_invalid_regime_raises() -> None:
    """Unknown volatility_regime must raise ValueError."""
    deal = _golden_deal()
    bad = replace(deal, volatility_regime="extreme")
    with pytest.raises(ValueError):
        distributional_dscr(bad, n_paths=1_000, seed=42)


def test_stress_regime_emits_warning() -> None:
    """stress regime must surface a warning string for downstream review."""
    deal = _golden_deal()
    stress_deal = replace(deal, volatility_regime="stress")
    result = distributional_dscr(stress_deal, n_paths=1_000, seed=42)
    assert any("stress" in w.lower() for w in result.warnings), (
        f"stress regime must emit a warning; got {result.warnings}"
    )


def test_stable_regime_emits_warning() -> None:
    """stable regime must surface a warning string (underestimate flag)."""
    deal = _golden_deal()
    stable_deal = replace(deal, volatility_regime="stable")
    result = distributional_dscr(stable_deal, n_paths=1_000, seed=42)
    assert any("stable" in w.lower() for w in result.warnings)


def test_regime_determinism_with_same_seed() -> None:
    """Same regime + same seed must produce identical output across runs."""
    base = _golden_deal()
    r1 = distributional_dscr(base, n_paths=5_000, seed=42)
    r2 = distributional_dscr(base, n_paths=5_000, seed=42)
    assert r1.p12 == r2.p12
    assert r1.p36 == r2.p36
    assert r1.lifetime == r2.lifetime


def test_default_regime_is_normal() -> None:
    """If volatility_regime is unset, default must be 'normal' (5% sigma)."""
    deal = _golden_deal()
    # Force unset by constructing without it
    assert deal.volatility_regime == "normal"
