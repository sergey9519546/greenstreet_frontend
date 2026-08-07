"""Tests for Conformal Prediction Bands on DSCR Path Distribution (Slice 2 P0-2).

Verifies distribution-free coverage guarantees via MAPIE SplitConformalRegressor.

These tests check:
1. Conformal bands shape and validity
2. Coverage guarantee (empirical coverage >= target - tolerance)
3. Determinism with same seed
4. Stress regime warning emission
5. Integration with Slice 2 P0-1 regime constants
6. Validation (invalid inputs raise)

Tolerance: conformal coverage guarantee has slack ~1/sqrt(n_calibration).
With n_paths=10,000 and calibration_fraction=0.5, n_calibration=5,000,
so tolerance = 1/sqrt(5000) ~ 0.014 = 1.4%.
"""

from __future__ import annotations

from dataclasses import replace

import numpy as np
import pytest

from dscr_stress.conformal import (
    DEFAULT_CALIBRATION_FRACTION,
    DEFAULT_CONFIDENCE_LEVEL,
    ConformalDSCR,
    conformal_dscr_path,
)
from dscr_stress.distributional_dscr import Deal

# --- Test fixtures ---


def _golden_deal() -> Deal:
    """Sovereign Master Deal A: $425K / 75% LTV / 7.00% / 30yr / lease $3,000.

    loan = $318,750. P&I = $2,120.6517, PITIA = $2,853.9850, T1 DSCR = 1.0512.
    """
    return Deal(
        loan_amount=318_750.0,
        annual_rate=0.07,
        term_months=360,
        monthly_rent=3_000.0,
        monthly_tax=5_000.0 / 12,  # $416.67
        monthly_insurance=2_000.0 / 12,  # $166.67
        monthly_hoa=150.0,
        term_projection_months=36,
    )


# --- Output structure ---


def test_returns_conformal_dscr_dataclass() -> None:
    """Output must be ConformalDSCR with 36-element arrays + diagnostics."""
    deal = _golden_deal()
    result = conformal_dscr_path(deal, n_paths=5_000, seed=42)
    assert isinstance(result, ConformalDSCR)
    assert result.median_path.shape == (36,)
    assert result.lower_band.shape == (36,)
    assert result.upper_band.shape == (36,)
    assert 0.0 < result.coverage_level < 1.0
    assert 0.0 <= result.empirical_coverage <= 1.0


def test_default_confidence_level_is_95() -> None:
    """Default target coverage must be 95%."""
    deal = _golden_deal()
    result = conformal_dscr_path(deal, n_paths=5_000, seed=42)
    assert result.coverage_level == 0.95


def test_lower_band_below_median_below_upper() -> None:
    """lower_band <= median_path <= upper_band element-wise."""
    deal = _golden_deal()
    result = conformal_dscr_path(deal, n_paths=5_000, seed=42)
    assert np.all(result.lower_band <= result.median_path)
    assert np.all(result.median_path <= result.upper_band)


# --- Coverage guarantee ---


def test_empirical_coverage_meets_target() -> None:
    """Empirical coverage on calibration set must be >= target - tolerance.

    Split conformal guarantee: empirical coverage >= (n_cal - floor(n_cal * alpha) - 1) / n_cal
    For confidence_level=0.95 and n_cal=5000, expected >= 0.95 (very tight).
    """
    deal = _golden_deal()
    result = conformal_dscr_path(deal, n_paths=10_000, confidence_level=0.95, seed=42)
    # Conformal guarantee is exact: coverage >= 1 - alpha (modulo finite-sample effect)
    # Allow 1% slack for safety
    assert result.empirical_coverage >= 0.94, (
        f"Coverage {result.empirical_coverage} below 0.94; conformal guarantee violated"
    )


def test_lower_band_below_zero_is_clipped_or_rational() -> None:
    """For a 1.05x DSCR deal with sigma=5%, lower band should not crash below zero.

    Path-level DSCR can go negative if rent crashes, but aggregated band should
    reflect realistic range. With monthly sigma=0.0144, 5th percentile over 36 months
    cumulative sigma ~ 0.087 means DSCR could fall ~17% below origination.
    Origin DSCR = 1.05, so 1.05 * 0.83 ~ 0.87 (still positive).
    """
    deal = _golden_deal()
    result = conformal_dscr_path(deal, n_paths=5_000, seed=42)
    # Bands at month 36 are widest
    lower_at_36 = result.lower_band[-1]
    median_at_36 = result.median_path[-1]
    # Should be > 0 (rent floors at 0 in our model)
    assert lower_at_36 >= 0.0, f"Lower band at month 36 went negative: {lower_at_36}"
    # And reasonable (not bizarrely low for a 1.05x deal)
    assert lower_at_36 < median_at_36


# --- Determinism ---


def test_same_seed_produces_same_output() -> None:
    """Reproducibility: same seed must produce identical bands."""
    deal = _golden_deal()
    r1 = conformal_dscr_path(deal, n_paths=5_000, seed=42)
    r2 = conformal_dscr_path(deal, n_paths=5_000, seed=42)
    np.testing.assert_array_equal(r1.median_path, r2.median_path)
    np.testing.assert_array_equal(r1.lower_band, r2.lower_band)
    np.testing.assert_array_equal(r1.upper_band, r2.upper_band)
    assert r1.empirical_coverage == r2.empirical_coverage


def test_different_seed_produces_different_paths() -> None:
    """Different seeds should produce different median paths (Monte Carlo noise)."""
    deal = _golden_deal()
    r1 = conformal_dscr_path(deal, n_paths=5_000, seed=42)
    r2 = conformal_dscr_path(deal, n_paths=5_000, seed=99)
    # At least one element should differ
    diffs = np.abs(r1.median_path - r2.median_path)
    assert max(diffs) > 0.001, "Different seeds produced identical median paths"


# --- Regime integration ---


def test_stress_regime_produces_wider_bands() -> None:
    """Stress regime (sigma=9.5%) must produce wider bands than normal (sigma=5%)."""
    deal = _golden_deal()
    normal = conformal_dscr_path(deal, n_paths=5_000, seed=42)
    stress_deal = replace(deal, volatility_regime="stress")
    stress = conformal_dscr_path(stress_deal, n_paths=5_000, seed=42)
    # Width = upper - lower at month 36 (widest)
    width_normal = normal.upper_band[-1] - normal.lower_band[-1]
    width_stress = stress.upper_band[-1] - stress.lower_band[-1]
    assert width_stress > width_normal, (
        f"Stress width {width_stress} must exceed normal width {width_normal}"
    )


def test_stable_regime_produces_narrower_bands() -> None:
    """Stable regime (sigma=2.5%) must produce narrower bands than normal."""
    deal = _golden_deal()
    normal = conformal_dscr_path(deal, n_paths=5_000, seed=42)
    stable_deal = replace(deal, volatility_regime="stable")
    stable = conformal_dscr_path(stable_deal, n_paths=5_000, seed=42)
    width_normal = normal.upper_band[-1] - normal.lower_band[-1]
    width_stable = stable.upper_band[-1] - stable.lower_band[-1]
    assert width_stable < width_normal


def test_stress_regime_emits_warning() -> None:
    """stress regime must surface a warning string."""
    deal = _golden_deal()
    stress_deal = replace(deal, volatility_regime="stress")
    result = conformal_dscr_path(stress_deal, n_paths=1_000, seed=42)
    assert any("stress" in w.lower() for w in result.warnings)


# --- Edge cases ---


def test_zero_rent_deal_has_zero_lower_band() -> None:
    """Zero rent deal: DSCR is always 0, so all bands should be 0."""
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
    result = conformal_dscr_path(deal, n_paths=1_000, seed=42)
    np.testing.assert_array_equal(result.lower_band, np.zeros(36))
    np.testing.assert_array_equal(result.median_path, np.zeros(36))
    np.testing.assert_array_equal(result.upper_band, np.zeros(36))


def test_very_high_rent_deal_has_high_lower_band() -> None:
    """5x rent deal: DSCR ~5.0, lower band should remain very high."""
    deal = Deal(
        loan_amount=318_750.0,
        annual_rate=0.07,
        term_months=360,
        monthly_rent=15_000.0,
        monthly_tax=416.67,
        monthly_insurance=166.67,
        monthly_hoa=150.0,
        term_projection_months=36,
    )
    result = conformal_dscr_path(deal, n_paths=1_000, seed=42)
    # All bands should be very high (well above 4.0)
    assert np.all(result.lower_band > 3.5)


# --- Validation ---


def test_invalid_confidence_level_raises() -> None:
    """confidence_level outside (0, 1) must raise."""
    deal = _golden_deal()
    with pytest.raises(ValueError):
        conformal_dscr_path(deal, n_paths=1_000, confidence_level=0.0, seed=42)
    with pytest.raises(ValueError):
        conformal_dscr_path(deal, n_paths=1_000, confidence_level=1.0, seed=42)
    with pytest.raises(ValueError):
        conformal_dscr_path(deal, n_paths=1_000, confidence_level=1.5, seed=42)


def test_invalid_calibration_fraction_raises() -> None:
    """calibration_fraction outside [0.1, 0.9] must raise."""
    deal = _golden_deal()
    with pytest.raises(ValueError):
        conformal_dscr_path(deal, n_paths=1_000, calibration_fraction=0.05, seed=42)
    with pytest.raises(ValueError):
        conformal_dscr_path(deal, n_paths=1_000, calibration_fraction=0.95, seed=42)


def test_too_few_paths_raises() -> None:
    """n_paths < 100 must raise (need enough for meaningful bands)."""
    deal = _golden_deal()
    with pytest.raises(ValueError):
        conformal_dscr_path(deal, n_paths=50, seed=42)


def test_invalid_regime_raises() -> None:
    """Unknown volatility_regime must raise."""
    deal = _golden_deal()
    bad = replace(deal, volatility_regime="extreme")
    with pytest.raises(ValueError):
        conformal_dscr_path(bad, n_paths=1_000, seed=42)


def test_negative_loan_amount_raises() -> None:
    """Negative loan amount must raise."""
    deal = replace(_golden_deal(), loan_amount=-1.0)
    with pytest.raises(ValueError):
        conformal_dscr_path(deal, n_paths=1_000, seed=42)


# --- Constants ---


def test_default_constants_match_documented_values() -> None:
    """Default confidence_level and calibration_fraction must be documented values."""
    assert DEFAULT_CONFIDENCE_LEVEL == 0.95
    assert DEFAULT_CALIBRATION_FRACTION == 0.5
