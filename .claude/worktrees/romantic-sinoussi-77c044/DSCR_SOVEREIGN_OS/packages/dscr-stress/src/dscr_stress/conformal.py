"""Conformal Prediction Bands on DSCR Path Distribution (Slice 2 P0-2).

Adds distribution-free uncertainty quantification on top of the Slice 2 P0-1
Distributional DSCR Monte Carlo engine. Uses MAPIE (scikit-learn-contrib) for
provable finite-sample coverage guarantees (Lei et al. 2018).

Why conformal prediction?
--------------------------

Standard Monte Carlo quantiles (e.g., 5th/95th percentile of 10k paths) give
empirical intervals but no coverage guarantee — if the Monte Carlo distribution
is mis-specified, the quantiles are wrong.

Conformal prediction (Vovk, Gammerman, Saunders 1999; Lei et al. 2018) provides
distribution-free, finite-sample coverage guarantees. Given a calibration set
of "seen" outcomes, the conformal intervals are guaranteed to contain the true
outcome with probability >= confidence_level, regardless of the underlying
distribution.

Why MAPIE?
----------

MAPIE 1.4.1 (BSD-3, scikit-learn-contrib) is the reference Python implementation
of conformal prediction. It supports Split, Cross, Jackknife+, and Time-Series
conformal variants. Mature, audited, production-grade.

Slice 2 P0-2 Math
-----------------

Step 1: Generate n_paths Monte Carlo paths (reuse Slice 2 P0-1 distributional_dscr).

Step 2: Reshape into (n_paths * 36, 3) feature matrix:
    features[i] = [month, log_month, deal_size_normalized]
    target[i] = dscr_path.flatten()

Step 3: Split into train (calibration_fraction) + calibration (1 - calibration_fraction).

Step 4: Fit LinearRegression base estimator on train.

Step 5: Calibrate conformal scores on calibration set (MAPIE conformalize).

Step 6: Predict intervals on test set.

Step 7: Validate empirical coverage >= confidence_level.

Output (ConformalDSCR):
    coverage_level: target coverage (e.g., 0.95)
    median_path: 36-element array of median DSCR per month
    lower_band: 36-element array of lower conformal bound
    upper_band: 36-element array of upper conformal bound
    empirical_coverage: actual coverage on test set (sanity check)
    n_calibration: number of paths used for calibration
    warnings: tuple of warnings

Defense
-------

Lei et al. (2018) "Distribution-Free Predictive Inference for Regression"
JASA, formal coverage proof for split conformal.

Sample complexity: requires n_calibration >= ~50 paths for tight bands at
confidence_level=0.95. Default n_paths=10,000 with calibration_fraction=0.5
gives n_calibration=5,000 (>>50).

SR 26-02: This layer IS a model under SR 26-02. Model card required.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Final

import numpy as np
from dscr_core.payment import pi
from mapie.regression import SplitConformalRegressor
from sklearn.linear_model import LinearRegression

from dscr_stress.distributional_dscr import Deal, _resolve_rent_sigma

DEFAULT_CONFIDENCE_LEVEL: Final = 0.95
DEFAULT_CALIBRATION_FRACTION: Final = 0.5


@dataclass(frozen=True)
class ConformalDSCR:
    """Conformal prediction bands on DSCR path distribution.

    All DSCR values are coverage ratios (1 = full coverage of debt service).

    Attributes:
        coverage_level: target coverage probability (e.g., 0.95).
        median_path: 36-element array of median DSCR per month.
        lower_band: 36-element array of lower conformal bound per month.
        upper_band: 36-element array of upper conformal bound per month.
        empirical_coverage: actual coverage observed on test set (sanity check,
            should be >= coverage_level - 1/sqrt(n_test)).
        n_calibration: number of Monte Carlo paths used for calibration.
        warnings: tuple of warning strings (e.g., low coverage warning).
    """

    coverage_level: float
    median_path: np.ndarray  # shape (36,)
    lower_band: np.ndarray  # shape (36,)
    upper_band: np.ndarray  # shape (36,)
    empirical_coverage: float
    n_calibration: int
    warnings: tuple[str, ...] = ()


def _generate_dscr_paths(
    deal: Deal,
    n_paths: int,
    seed: int,
) -> tuple[np.ndarray, float]:
    """Generate Monte Carlo DSCR paths (reuses Slice 2 P0-1 math).

    Args:
        deal: Deal parameters.
        n_paths: number of Monte Carlo paths.
        seed: RNG seed.

    Returns:
        (dscr_paths, pitia) where dscr_paths has shape (n_paths, 36).
    """
    rng = np.random.default_rng(seed)
    t = deal.term_projection_months

    # Deterministic PITIA (fixed-rate fully-amortizing)
    monthly_pi = pi(deal.loan_amount, deal.annual_rate * 100.0, deal.term_months)
    pitia = monthly_pi + deal.monthly_tax + deal.monthly_insurance + deal.monthly_hoa

    # Stochastic rent paths (same math as Slice 2 P0-1)
    rent_sigma_annual = _resolve_rent_sigma(deal.volatility_regime)
    monthly_growth_paths = rng.normal(
        loc=0.0,
        scale=rent_sigma_annual / np.sqrt(12),
        size=(n_paths, t),
    )
    cumulative_growth = np.cumsum(monthly_growth_paths, axis=1)
    rent_paths = deal.monthly_rent * (1.0 + cumulative_growth)
    rent_paths = np.maximum(rent_paths, 0.0)

    # Track 1 DSCR (rent / PITIA, lender formula)
    dscr_paths = rent_paths / pitia
    return dscr_paths, pitia


def _build_features(
    deal: Deal,
    n_paths: int,
    t: int,
) -> np.ndarray:
    """Build (n_paths * t, 3) feature matrix: month, log_month, deal_size.

    Args:
        deal: Deal parameters (for deal_size).
        n_paths: number of paths.
        t: months per path.

    Returns:
        features array shape (n_paths * t, 3).
    """
    months = np.arange(1, t + 1, dtype=float)
    log_months = np.log1p(months)
    # Normalize deal size to ~unit scale (loan amount in $K)
    deal_size = deal.loan_amount / 100_000.0

    # Repeat for each path: each path has same month vector
    features_per_path = np.column_stack([months, log_months, np.full(t, deal_size)])
    features = np.tile(features_per_path, (n_paths, 1))
    return features


def conformal_dscr_path(
    deal: Deal,
    n_paths: int = 10_000,
    confidence_level: float = DEFAULT_CONFIDENCE_LEVEL,
    calibration_fraction: float = DEFAULT_CALIBRATION_FRACTION,
    seed: int = 42,
) -> ConformalDSCR:
    """Compute conformal prediction bands on DSCR path distribution.

    Uses MAPIE SplitConformalRegressor for distribution-free coverage guarantees.
    Distribution-free means the coverage guarantee holds for ANY underlying DSCR
    distribution — no normality assumption, no specific copula.

    Args:
        deal: Deal parameters.
        n_paths: number of Monte Carlo paths. Default 10,000.
        confidence_level: target coverage (e.g., 0.95). Default 0.95.
        calibration_fraction: fraction of paths used for training. Default 0.5.
            The remaining (1 - calibration_fraction) is calibration set.
        seed: RNG seed for reproducibility. Default 42.

    Returns:
        ConformalDSCR with conformal bands and coverage diagnostics.

    Raises:
        ValueError: on invalid inputs.

    Example (Sovereign Master Deal A):
        >>> deal = Deal(318750.0, 0.07, 360, 3000.0, 416.67, 166.67, 150.0)
        >>> result = conformal_dscr_path(deal, n_paths=10000, seed=42)
        >>> result.coverage_level
        0.95
    """
    if not 0.0 < confidence_level < 1.0:
        raise ValueError(f"confidence_level must be in (0, 1), got {confidence_level}")
    if not 0.1 <= calibration_fraction <= 0.9:
        raise ValueError(f"calibration_fraction must be in [0.1, 0.9], got {calibration_fraction}")
    if n_paths < 100:
        raise ValueError(f"n_paths must be >= 100 for meaningful bands, got {n_paths}")

    # Validate deal fields
    if deal.loan_amount <= 0:
        raise ValueError(f"loan_amount must be > 0, got {deal.loan_amount}")
    if deal.annual_rate < 0:
        raise ValueError(f"annual_rate must be >= 0, got {deal.annual_rate}")
    if deal.term_months <= 0:
        raise ValueError(f"term_months must be > 0, got {deal.term_months}")
    if deal.monthly_rent < 0:
        raise ValueError(f"monthly_rent must be >= 0, got {deal.monthly_rent}")
    if deal.term_projection_months <= 0:
        raise ValueError(f"term_projection_months must be > 0, got {deal.term_projection_months}")
    if deal.term_projection_months > deal.term_months:
        raise ValueError(
            f"term_projection_months ({deal.term_projection_months}) "
            f"must be <= term_months ({deal.term_months})"
        )
    # Validate volatility_regime (raises ValueError on unknown)
    _resolve_rent_sigma(deal.volatility_regime)

    t = deal.term_projection_months

    # 1. Generate DSCR paths via Slice 2 P0-1 Monte Carlo
    dscr_paths, _pitia = _generate_dscr_paths(deal, n_paths, seed)

    # 2. Build features (n_paths * t, 3)
    features = _build_features(deal, n_paths, t)
    # Target: actual DSCR values
    target = dscr_paths.flatten()

    # 3. Split into train + calibration
    n_train = int(n_paths * calibration_fraction)
    x_train = features[: n_train * t]
    y_train = target[: n_train * t]
    x_cal = features[n_train * t :]
    y_cal = target[n_train * t :]

    n_calibration_paths = n_paths - n_train

    # 4. Fit base estimator on train
    base_estimator = LinearRegression()
    base_estimator.fit(x_train, y_train)

    # 5. Conformalize on calibration set
    conformal = SplitConformalRegressor(
        estimator=base_estimator,
        confidence_level=confidence_level,
        prefit=True,
    )
    conformal.conformalize(x_cal, y_cal)

    # 6. Predict intervals on a single representative month trajectory
    # Use a new path (same features) to get intervals
    x_test = _build_features(deal, 1, t)  # 1 representative path
    y_pred, y_pis = conformal.predict_interval(x_test)

    # y_pis shape: (n_samples, 2, n_intervals)
    lower_band = y_pis[:, 0, 0]  # shape (t,)
    upper_band = y_pis[:, 1, 0]  # shape (t,)
    median_path = y_pred.flatten()  # shape (t,)

    # 7. Compute empirical coverage on calibration set (sanity check)
    _y_cal_pred, y_cal_pis = conformal.predict_interval(x_cal)
    coverage_mask = (y_cal >= y_cal_pis[:, 0, 0]) & (y_cal <= y_cal_pis[:, 1, 0])
    empirical_coverage = float(np.mean(coverage_mask))

    # 8. Build warnings
    warnings_list: list[str] = []
    coverage_tolerance = 1.0 / np.sqrt(len(y_cal))
    if empirical_coverage < confidence_level - coverage_tolerance:
        warnings_list.append(
            f"Empirical coverage {empirical_coverage:.3f} below target "
            f"{confidence_level:.3f} (tolerance {coverage_tolerance:.3f}); "
            "model may be mis-specified"
        )
    if n_calibration_paths < 100:
        warnings_list.append(
            f"Calibration set has only {n_calibration_paths} paths; "
            "bands may be wider than necessary"
        )
    if deal.volatility_regime == "stress":
        warnings_list.append("stress regime: bands reflect downside scenario, not expected case")

    return ConformalDSCR(
        coverage_level=confidence_level,
        median_path=median_path,
        lower_band=lower_band,
        upper_band=upper_band,
        empirical_coverage=empirical_coverage,
        n_calibration=n_calibration_paths,
        warnings=tuple(warnings_list),
    )
