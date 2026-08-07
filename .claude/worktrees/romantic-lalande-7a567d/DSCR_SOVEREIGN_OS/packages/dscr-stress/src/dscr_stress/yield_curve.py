"""Nelson-Siegel-Svensson (NSS) yield curve calibration.

Fits the parametric yield curve model used by central banks (ECB, Fed, BIS)
to observed bond prices or direct rate quotes. For DSCR Sovereign OS, this
powers ARM reset forecasting — the 5/6 and 7/6 ARM products need forward
rate projections at reset dates (e.g., month 60 for first 5/6 reset).

Spec sources:
    - Nelson & Siegel (1987) "Parsimonious Modeling of Yield Curves"
      Journal of Business 60(4): 473-489
    - Svensson (1994) "Estimating and Interpreting Forward Interest Rates"
      NBER WP 4871
    - Diebold & Li (2006) "Forecasting the Term Structure of Government
      Bond Yields" Journal of Econometrics 130: 337-364
    - ECB (2024) Statistical Paper Series 27 — yield curve methodology
    - Federal Reserve Nominal Yield Curve (Svensson methodology)
    - T11 godmode spec: RESEARCH/godmode_20260618/11_T11_hardcore_algos/
      03_nss_svensson_yield_curve.md

Pure numpy + scipy, no QuantLib dependency. Plain Python, deterministic.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np
from scipy.optimize import minimize

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Parameter bounds for the optimizer
NSS_BOUNDS = {
    "beta0": (-0.10, 0.30),  # Long rate (asymptote)
    "beta1": (-0.30, 0.30),  # Slope
    "beta2": (-0.30, 0.30),  # First curvature
    "beta3": (-0.30, 0.30),  # Second curvature (NSS extension)
    "lambda1": (0.01, 30.0),  # First decay
    "lambda2": (0.01, 30.0),  # Second decay
}

# Standard DSCR/ARM-relevant maturities (in years)
STANDARD_MATURITIES = np.array([0.25, 0.5, 1, 2, 3, 5, 7, 10, 20, 30])

# Tolerance for "good fit" (RMSE in yield space, decimal)
GOOD_FIT_RMSE = 1e-3  # 10 bps


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------


def _validate_yields_array(yields: np.ndarray) -> np.ndarray:
    """Validate yield inputs: numeric, non-NaN, finite, in [-10%, 30%]."""
    arr = np.asarray(yields, dtype=float)
    if arr.ndim != 1:
        raise ValueError(f"yields must be 1-D, got shape {arr.shape}")
    if np.any(np.isnan(arr)):
        raise ValueError("yields contains NaN values")
    if np.any(np.isinf(arr)):
        raise ValueError("yields contains inf values")
    if np.any(arr < -0.10) or np.any(arr > 0.30):
        raise ValueError(
            f"yields out of plausible range [-10%, 30%]; got min={arr.min()}, max={arr.max()}"
        )
    return arr


def _validate_maturities_array(maturities: np.ndarray) -> np.ndarray:
    """Validate maturity inputs: positive, <= 50 years."""
    arr = np.asarray(maturities, dtype=float)
    if arr.ndim != 1:
        raise ValueError(f"maturities must be 1-D, got shape {arr.shape}")
    if np.any(np.isnan(arr)) or np.any(np.isinf(arr)):
        raise ValueError("maturities contains NaN or inf")
    if np.any(arr <= 0):
        raise ValueError(f"maturities must be positive; got min={arr.min()}")
    if np.any(arr > 50):
        raise ValueError(f"maturities must be <= 50 years; got max={arr.max()}")
    return arr


def _is_finite_positive(x: float, name: str) -> None:
    if x is None or (isinstance(x, float) and (math.isnan(x) or math.isinf(x))):
        raise ValueError(f"{name} must be finite, got {x}")
    if x <= 0:
        raise ValueError(f"{name} must be > 0, got {x}")


# ---------------------------------------------------------------------------
# Yield computation (Nelson-Siegel + Nelson-Siegel-Svensson)
# ---------------------------------------------------------------------------


def nss_yield(
    tau,
    beta0: float,
    beta1: float,
    beta2: float,
    beta3: float,
    lambda1: float,
    lambda2: float,
) -> np.ndarray:
    """Compute Nelson-Siegel-Svensson yield at maturities tau (in years).

    Formula (Svensson 1994):
        y(tau) = b0 + b1 * t1(tau, l1) + b2 * [t1(tau, l1) - t2(tau, l1)]
                                  + b3 * [t1(tau, l2) - t2(tau, l2)]
    where:
        t1(tau, l) = (1 - exp(-tau/l)) / (tau/l)
        t2(tau, l) = exp(-tau/l)

    Args:
        tau: scalar or np.ndarray of maturities in years
        beta0..beta3: NSS parameters
        lambda1, lambda2: decay parameters (must be > 0)

    Returns:
        yield (decimal, annualized); same shape as tau
    """
    if lambda1 <= 0 or lambda2 <= 0:
        raise ValueError(f"lambda1 and lambda2 must be > 0; got l1={lambda1}, l2={lambda2}")
    tau = np.asarray(tau, dtype=float)
    eps = 1e-10
    # Use np.where to avoid division by zero at tau=0
    t1_l1 = np.where(tau < eps, 1.0, (1 - np.exp(-tau / lambda1)) / (tau / lambda1))
    t2_l1 = np.exp(-tau / lambda1)
    t1_l2 = np.where(tau < eps, 1.0, (1 - np.exp(-tau / lambda2)) / (tau / lambda2))
    t2_l2 = np.exp(-tau / lambda2)
    return beta0 + beta1 * t1_l1 + beta2 * (t1_l1 - t2_l1) + beta3 * (t1_l2 - t2_l2)


def ns_yield(
    tau,
    beta0: float,
    beta1: float,
    beta2: float,
    lambda1: float,
) -> np.ndarray:
    """Plain Nelson-Siegel (1987) yield curve (3 betas + 1 decay = 4 params).

    Use this when only 4 parameters are needed (most short-end curve shapes).
    """
    if lambda1 <= 0:
        raise ValueError(f"lambda1 must be > 0; got {lambda1}")
    tau = np.asarray(tau, dtype=float)
    eps = 1e-10
    t1 = np.where(tau < eps, 1.0, (1 - np.exp(-tau / lambda1)) / (tau / lambda1))
    t2 = np.exp(-tau / lambda1)
    return beta0 + beta1 * t1 + beta2 * (t1 - t2)


# ---------------------------------------------------------------------------
# Calibration
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class NSSParams:
    """Frozen NSS parameters — safe to use as dict key / hashable."""

    beta0: float
    beta1: float
    beta2: float
    beta3: float
    lambda1: float
    lambda2: float

    def as_dict(self) -> dict:
        return {
            "beta0": self.beta0,
            "beta1": self.beta1,
            "beta2": self.beta2,
            "beta3": self.beta3,
            "lambda1": self.lambda1,
            "lambda2": self.lambda2,
        }


@dataclass
class CalibrationResult:
    """Result of fitting NSS curve to observed yields."""

    params: NSSParams
    rmse: float  # RMSE in yield space (decimal); 0.001 = 10 bps
    fitted_yields: np.ndarray
    optimizer_success: bool
    objective_value: float
    n_iterations: int


def _initial_params_heuristic(maturities: np.ndarray, yields: np.ndarray) -> tuple:
    """Heuristic initial parameter guess based on observed curve shape."""
    return (
        float(yields[-1]),  # beta0 ~ long-end yield
        float(yields[0] - yields[-1]),  # beta1 ~ short-vs-long slope
        0.0,  # beta2 (curvature, neutral start)
        0.0,  # beta3 (second curvature, neutral start)
        1.5,  # lambda1 (typical: 1-3 years)
        5.0,  # lambda2 (typical: 3-10 years)
    )


def calibrate_nss(
    maturities: np.ndarray,
    yields: np.ndarray,
    initial_params: tuple | None = None,
    method: str = "Nelder-Mead",
) -> CalibrationResult:
    """Calibrate NSS parameters to observed yield curve via least-squares.

    Args:
        maturities: array of maturities in years (e.g., [0.25, 0.5, 1, 2, 5, 10, 30])
        yields: array of observed yields (decimal, same length as maturities)
        initial_params: optional 6-tuple (b0, b1, b2, b3, l1, l2)
        method: scipy.optimize method (Nelder-Mead, L-BFGS-B, differential_evolution)

    Returns:
        CalibrationResult with fitted params, RMSE, and fitted yields

    Spec: T11 #3 §3 (calibrate_nss) — Nelder-Mead with bounded constraints.
    """
    mats = _validate_maturities_array(maturities)
    ys = _validate_yields_array(yields)
    if mats.shape != ys.shape:
        raise ValueError(f"maturities shape {mats.shape} != yields shape {ys.shape}")
    if mats.shape[0] < 4:
        raise ValueError(
            f"Need at least 4 (maturity, yield) points to fit NSS; got {mats.shape[0]}"
        )

    if initial_params is None:
        initial_params = _initial_params_heuristic(mats, ys)
    if len(initial_params) != 6:
        raise ValueError(f"initial_params must be 6-tuple; got {len(initial_params)}")

    # Apply bounds manually via penalty (Nelder-Mead doesn't honor bounds)
    bounds = [
        NSS_BOUNDS["beta0"],
        NSS_BOUNDS["beta1"],
        NSS_BOUNDS["beta2"],
        NSS_BOUNDS["beta3"],
        NSS_BOUNDS["lambda1"],
        NSS_BOUNDS["lambda2"],
    ]

    def objective(params):
        b0, b1, b2, b3, l1, l2 = params
        # Penalty for bound violations
        penalty = 0.0
        for val, (lo, hi) in zip(params, bounds, strict=True):
            if val < lo:
                penalty += 1e6 * (lo - val) ** 2
            if val > hi:
                penalty += 1e6 * (val - hi) ** 2
        if l1 <= 0 or l2 <= 0:
            return 1e12 + penalty
        yhat = nss_yield(mats, b0, b1, b2, b3, l1, l2)
        return float(np.sum((yhat - ys) ** 2)) + penalty

    # Choose optimizer based on method
    if method == "differential_evolution":
        from scipy.optimize import differential_evolution

        # Convert bounds to scipy format
        scipy_bounds = list(bounds)
        result = differential_evolution(objective, scipy_bounds, seed=42, maxiter=500, tol=1e-10)
    elif method == "L-BFGS-B":
        result = minimize(
            objective,
            initial_params,
            method="L-BFGS-B",
            bounds=bounds,
            options={"maxiter": 5000, "ftol": 1e-12, "gtol": 1e-10},
        )
    elif method == "Nelder-Mead":
        result = minimize(
            objective,
            initial_params,
            method="Nelder-Mead",
            options={"maxiter": 10000, "xatol": 1e-10, "fatol": 1e-12},
        )
    else:
        raise ValueError(
            f"Unknown method '{method}'; use 'Nelder-Mead', 'L-BFGS-B', or 'differential_evolution'"
        )

    b0, b1, b2, b3, l1, l2 = result.x
    fitted = nss_yield(mats, b0, b1, b2, b3, l1, l2)
    rmse = float(np.sqrt(np.mean((fitted - ys) ** 2)))
    params = NSSParams(
        beta0=float(b0),
        beta1=float(b1),
        beta2=float(b2),
        beta3=float(b3),
        lambda1=float(l1),
        lambda2=float(l2),
    )
    return CalibrationResult(
        params=params,
        rmse=rmse,
        fitted_yields=fitted,
        optimizer_success=bool(result.success),
        objective_value=float(result.fun),
        n_iterations=int(result.nit) if hasattr(result, "nit") else 0,
    )


def calibrate_ns(
    maturities: np.ndarray,
    yields: np.ndarray,
) -> CalibrationResult:
    """Calibrate plain Nelson-Siegel (4 params, no second curvature).

    Use when NSS overfits (small sample, short-end only).
    """
    mats = _validate_maturities_array(maturities)
    ys = _validate_yields_array(yields)
    if mats.shape != ys.shape:
        raise ValueError("maturities and yields must have same shape")
    if mats.shape[0] < 3:
        raise ValueError("Need at least 3 points to fit plain NS")

    initial = (
        float(ys[-1]),
        float(ys[0] - ys[-1]),
        0.0,
        1.5,
    )
    bounds = [
        NSS_BOUNDS["beta0"],
        NSS_BOUNDS["beta1"],
        NSS_BOUNDS["beta2"],
        NSS_BOUNDS["lambda1"],
    ]

    def objective(params):
        b0, b1, b2, l1 = params
        if l1 <= 0:
            return 1e12
        yhat = ns_yield(mats, b0, b1, b2, l1)
        return float(np.sum((yhat - ys) ** 2))

    result = minimize(
        objective,
        initial,
        method="L-BFGS-B",
        bounds=bounds,
        options={"maxiter": 5000, "ftol": 1e-12},
    )
    b0, b1, b2, l1 = result.x
    # Wrap NS params in NSSParams with beta3=0
    fitted = ns_yield(mats, b0, b1, b2, l1)
    rmse = float(np.sqrt(np.mean((fitted - ys) ** 2)))
    params = NSSParams(
        beta0=float(b0),
        beta1=float(b1),
        beta2=float(b2),
        beta3=0.0,
        lambda1=float(l1),
        lambda2=float(l1),  # Plain NS = NSS with b3=0, l2=l1
    )
    return CalibrationResult(
        params=params,
        rmse=rmse,
        fitted_yields=fitted,
        optimizer_success=bool(result.success),
        objective_value=float(result.fun),
        n_iterations=int(result.nit) if hasattr(result, "nit") else 0,
    )


# ---------------------------------------------------------------------------
# Forward rate computation
# ---------------------------------------------------------------------------


def nss_forward_rate(
    tau: float,
    params: NSSParams,
) -> float:
    """Compute NSS instantaneous forward rate at horizon tau.

    The forward rate f(tau) is the rate implied by the curve for a loan
    starting at tau. For DSCR ARM reset forecasting, we want the forward
    rate at the RESET date (e.g., month 60 for 5/6 ARM first reset).

    f(tau) = b0 + b1 * exp(-tau/l1) + b2 * (tau/l1) * exp(-tau/l1)
            + b3 * (tau/l2) * exp(-tau/l2)
    """
    if tau < 0:
        raise ValueError(f"forward horizon must be >= 0; got {tau}")
    _is_finite_positive(params.lambda1, "lambda1")
    _is_finite_positive(params.lambda2, "lambda2")
    l1, l2 = params.lambda1, params.lambda2
    e1 = math.exp(-tau / l1)
    e2 = math.exp(-tau / l2)
    return (
        params.beta0
        + params.beta1 * e1
        + params.beta2 * (tau / l1) * e1
        + params.beta3 * (tau / l2) * e2
    )


def nss_forward_rate_range(
    horizons: np.ndarray,
    params: NSSParams,
) -> np.ndarray:
    """Vectorized forward rate computation over multiple horizons."""
    horizons = np.asarray(horizons, dtype=float)
    if np.any(horizons < 0):
        raise ValueError("horizons must be >= 0")
    l1, l2 = params.lambda1, params.lambda2
    e1 = np.exp(-horizons / l1)
    e2 = np.exp(-horizons / l2)
    return (
        params.beta0
        + params.beta1 * e1
        + params.beta2 * (horizons / l1) * e1
        + params.beta3 * (horizons / l2) * e2
    )


# ---------------------------------------------------------------------------
# Validation helpers (for tests)
# ---------------------------------------------------------------------------


def fit_quality(rmse: float) -> str:
    """Classify fit quality by RMSE."""
    rmse_bps = rmse * 10000
    if rmse_bps < 1:
        return "excellent"
    if rmse_bps < 5:
        return "good"
    if rmse_bps < 10:
        return "acceptable"
    if rmse_bps < 25:
        return "marginal"
    return "poor"


__all__ = [
    "NSSParams",
    "CalibrationResult",
    "nss_yield",
    "ns_yield",
    "calibrate_nss",
    "calibrate_ns",
    "nss_forward_rate",
    "nss_forward_rate_range",
    "fit_quality",
    "GOOD_FIT_RMSE",
    "STANDARD_MATURITIES",
    "NSS_BOUNDS",
]
