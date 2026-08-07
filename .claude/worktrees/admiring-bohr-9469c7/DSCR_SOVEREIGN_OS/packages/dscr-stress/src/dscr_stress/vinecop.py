"""R-Vine Copula for joint DSCR risk modeling — Slice 2 P0-3.

v0.5.1 — R-Vine Copula integration verified by dscr-verifier (2026-06-20)
================================================

R-Vine Copula = hierarchical pair-copula construction for multivariate joint
distributions. Decomposes a d-dimensional dependence structure into d(d-1)/2
bivariate pair copulas organized in a sequence of nested trees.

Why R-Vine (not Gaussian copula) for DSCR modeling:

1. **Gaussian copula is BANNED for production use** (per Master Analysis
   2026-06-19). Gaussian assumes symmetric, linear, constant correlation —
   it cannot capture asymmetric tail dependence (e.g., rent collapses while
   interest rates spike simultaneously). This is the Stationary Correlation
   Attack that ADVERSARIAL_TESTS Round 27 flagged as the #1 vulnerability.

2. **R-Vine with mixed bivariate families** (Gaussian + Clayton + Gumbel +
   Frank + Student-t) captures:
   - Symmetric dependence (Gaussian)
   - Lower-tail dependence (Clayton) — joint downside (rent crash + rate spike)
   - Upper-tail dependence (Gumbel) — joint upside
   - Asymmetric dependence (Frank) — moderate dependence, no tail
   - Symmetric tail dependence (Student-t) — joint crash risk

3. **Hierarchical decomposition** — first tree captures strongest pairwise
   dependence; deeper trees capture residual dependence conditionally on
   previous trees. This is more realistic than a single global correlation
   matrix.

API:
    >>> from dscr_stress.vinecop import (
    ...     pseudo_observations, fit_rvine, simulate, joint_tail_dependence,
    ...     VinecopConfig, VinecopResult
    ... )
    >>> data = pd.DataFrame({...})  # historical DSCR factor data
    >>> config = VinecopConfig(family_set=["gaussian", "clayton", "gumbel", "frank"])
    >>> result = fit_rvine(data, columns=["rent_growth", "vacancy_rate", ...], config=config)
    >>> scenarios = simulate(result, n=10000, horizon=10)
    >>> jtd = joint_tail_dependence(result, threshold=0.05)

Backend: pyvinecopulib 0.7.6 (MIT License, Python 3.12 compatible).

Spec sources:
- Czado (2019), "Analyzing Dependent Data with Vine Copulas"
- Bedford & Cooke (2001), "Probability density decomposition for conditionally
  independent random variables"
- Aas et al. (2009), "Pair-copula constructions of multiple dependence"
- pyvinecopulib docs: https://github.com/vinecopulib/pyvinecopulib
"""

from __future__ import annotations

import warnings
from dataclasses import dataclass
from enum import Enum

import numpy as np
from scipy import stats

try:
    import pyvinecopulib as vc
except ImportError as e:
    raise ImportError(
        "pyvinecopulib is required for dscr_stress.vinecop. "
        "Install with: pip install pyvinecopulib>=0.7.0"
    ) from e


# =============================================================================
# Enums and dataclasses
# =============================================================================


class VineStructure(str, Enum):
    """R-Vine tree structure selection method.

    R-Vine structure = the edges of the trees (which variables are paired at
    each level). Different selection methods balance fit vs parsimony.
    """

    AIC = "aic"  # Akaike Information Criterion
    BIC = "bic"  # Bayesian Information Criterion (more parsimonious)
    CV = "cv"  # Cross-validation (most robust, slowest)


class TruncationLevel(int, Enum):
    """Truncation level of the R-Vine.

    Truncate the vine at tree T means we use only trees 1..T.
    Tree 1 has d-1 edges; tree 2 has d-2; etc.
    A truncated vine is a parsimonious approximation.
    """

    NONE = 0  # full vine (all d-1 trees)
    LOW = 1  # tree 1 only (simplest, d-1 edges)
    MEDIUM = 2  # trees 1-2 (default, ~2d-3 edges)
    HIGH = 3  # trees 1-3


# Map our family names to pyvinecopulib enum
_FAMILY_MAP = {
    "gaussian": vc.BicopFamily.gaussian,
    "student": vc.BicopFamily.student,
    "clayton": vc.BicopFamily.clayton,
    "gumbel": vc.BicopFamily.gumbel,
    "frank": vc.BicopFamily.frank,
    "joe": vc.BicopFamily.joe,
    "bb1": vc.BicopFamily.bb1,
    "bb6": vc.BicopFamily.bb6,
    "bb7": vc.BicopFamily.bb7,
    "bb8": vc.BicopFamily.bb8,
    "tawn": vc.BicopFamily.tawn,
    "tll": vc.BicopFamily.tll,
    "indep": vc.BicopFamily.indep,
}


@dataclass(frozen=True)
class VinecopConfig:
    """Configuration for R-Vine copula fitting.

    Attributes:
        family_set: Bivariate copula families to consider for each pair.
            Default: 5 families covering symmetric + asymmetric + tail dependence.
        structure_selection: Method for selecting tree structure (AIC/BIC/CV).
        truncation: Truncation level (how many trees to keep).
        seed: Random seed for reproducibility.
    """

    family_set: tuple[str, ...] = (
        "gaussian",
        "student",
        "clayton",
        "gumbel",
        "frank",
    )
    structure_selection: VineStructure = VineStructure.BIC
    truncation: TruncationLevel = TruncationLevel.MEDIUM
    seed: int | None = 42

    def get_pyvinecop_families(self) -> list[vc.BicopFamily]:
        """Map our family names to pyvinecopulib enum values."""
        result = []
        for name in self.family_set:
            if name not in _FAMILY_MAP:
                raise ValueError(f"Unknown family {name!r}. Valid: {sorted(_FAMILY_MAP.keys())}")
            result.append(_FAMILY_MAP[name])
        return result


@dataclass(frozen=True)
class VinecopResult:
    """Result of fitting an R-Vine copula.

    Attributes:
        vinecop: The fitted pyvinecopulib.Vinecop object.
        columns: Names of the input columns (in order matching vinecop dim).
        config: The config used to fit.
        n_obs: Number of observations used to fit.
        pseudo_obs: Pseudo-observations [n_obs, d] in [0,1]^d.
        aic: Akaike Information Criterion of the fit.
        bic: Bayesian Information Criterion of the fit.
        loglik: Log-likelihood at the MLE.
        n_params: Number of free parameters in the vine.
    """

    vinecop: vc.Vinecop
    columns: tuple[str, ...]
    config: VinecopConfig
    n_obs: int
    pseudo_obs: np.ndarray  # shape (n_obs, d)
    aic: float
    bic: float
    loglik: float
    n_params: int


# =============================================================================
# Public API
# =============================================================================


def pseudo_observations(data: np.ndarray) -> np.ndarray:
    """Transform data to pseudo-observations in [0,1]^d via rank transform.

    pyvinecopulib requires data on [0,1]^d. We use rank-based empirical CDF:
        u_ij = rank(x_ij) / (n + 1)

    This is the standard approach for semi-parametric copula estimation.
    Ties are broken by averaging (scipy.stats.rankdata default).

    Args:
        data: Raw data of shape (n_obs, n_dim). Each column is a variable.

    Returns:
        Pseudo-observations of shape (n_obs, n_dim) with values in (0, 1).
    """
    data = np.asarray(data, dtype=float)
    if data.ndim != 2:
        raise ValueError(f"data must be 2D (n_obs, n_dim); got shape {data.shape}")

    n = data.shape[0]
    pseudo = np.zeros_like(data)
    for j in range(data.shape[1]):
        pseudo[:, j] = stats.rankdata(data[:, j]) / (n + 1)
    return pseudo


def fit_rvine(
    data: np.ndarray | pd.DataFrame,  # noqa: F821
    columns: list[str] | None = None,
    config: VinecopConfig | None = None,
) -> VinecopResult:
    """Fit an R-Vine copula to multivariate data.

    Args:
        data: Either a numpy array (n_obs, n_dim) or pandas DataFrame.
              If DataFrame and columns=None, all columns are used.
        columns: Optional list of column names (str) for tracking. If data
                 is a DataFrame and columns is None, uses all columns.
        config: VinecopConfig. If None, uses defaults (5 families, BIC, level 2).

    Returns:
        VinecopResult with the fitted vine + fit statistics.

    Raises:
        ValueError: If data has < 50 observations or < 2 columns.
        ImportError: If pyvinecopulib is not installed.
    """
    if config is None:
        config = VinecopConfig()

    # Convert DataFrame to array if needed
    try:
        import pandas as pd

        if isinstance(data, pd.DataFrame):
            # Always subset by the DataFrame's ACTUAL columns (data.columns),
            # not by the user-provided `columns` argument. The `columns`
            # argument is metadata for output labeling, not a DataFrame
            # selector — using it as a selector raises KeyError when the
            # user passes renames that don't exist as actual columns.
            actual_cols = list(data.columns)
            arr = data[actual_cols].to_numpy(dtype=float)
            # If the user did NOT supply `columns`, default to the
            # DataFrame's actual column names.
            if columns is None:
                columns = actual_cols
        else:
            arr = np.asarray(data, dtype=float)
    except ImportError:
        arr = np.asarray(data, dtype=float)

    # Validate input
    if arr.ndim != 2:
        raise ValueError(f"data must be 2D; got shape {arr.shape}")
    n_obs, n_dim = arr.shape
    if n_obs < 50:
        raise ValueError(
            f"Need at least 50 observations for stable vine fit; got {n_obs}. "
            f"Increase historical data window or use synthetic augmentation."
        )
    if n_dim < 2:
        raise ValueError(f"Need at least 2 variables; got {n_dim}")

    # Determine column names
    if columns is None:
        columns = [f"var_{j}" for j in range(n_dim)]
    columns = tuple(columns)
    if len(columns) != n_dim:
        raise ValueError(f"Got {len(columns)} column names but data has {n_dim} columns")

    # Transform to pseudo-observations
    pseudo = pseudo_observations(arr)

    # Set up pyvinecopulib fit controls
    family_set = config.get_pyvinecop_families()
    # pyvinecopulib 0.7.6 API uses selection_criterion (not selection_method)
    # and seeds as Sequence[int] (not single seed int).
    seeds = [config.seed] if config.seed is not None else []
    # pyvinecopulib trunc_lvl semantics:
    #   - Positive int: build only the first T trees (e.g. 2 = first two trees).
    #   - (2**64 - 1) = 18446744073709551615: maximum (no truncation).
    # The library DOES NOT accept None. Pass the "max int" sentinel for
    # TruncationLevel.NONE / value=0 to mean "build all trees" (= d-1 trees).
    trunc_lvl_unlimited: int = (1 << 64) - 1
    if config.truncation.value == 0:
        trunc_lvl_arg: int = trunc_lvl_unlimited
    else:
        trunc_lvl_arg = config.truncation.value
    controls = vc.FitControlsVinecop(
        family_set=family_set,
        selection_criterion=config.structure_selection.value,
        trunc_lvl=trunc_lvl_arg,
        seeds=seeds,
    )

    # Fit
    vine = vc.Vinecop.from_data(pseudo, controls=controls)

    # Compute fit statistics
    loglik = float(vine.loglik(pseudo))
    # pyvinecopulib 0.7.6 returns vine.parameters as list[list[np.ndarray]]:
    # one inner-list per tree T, containing the per-pair-copula parameter
    # vectors. Each pair-copula contributes 1 param (Gaussian/Clayton/Gumbel/
    # Frank) or 2 params (Student-t). Sum the flattened sizes for AIC/BIC.
    n_params = int(
        sum(
            int(np.atleast_1d(np.asarray(p, dtype=float)).size)
            for tree in vine.parameters
            for p in tree
        )
    )
    aic = float(-2 * loglik + 2 * n_params)
    bic = float(-2 * loglik + np.log(n_obs) * n_params)

    return VinecopResult(
        vinecop=vine,
        columns=columns,
        config=config,
        n_obs=n_obs,
        pseudo_obs=pseudo,
        aic=aic,
        bic=bic,
        loglik=loglik,
        n_params=n_params,
    )


def simulate(
    result: VinecopResult,
    n: int = 10_000,
    horizon: int = 1,
    qmc: bool = False,
    seed: int | None = None,
) -> np.ndarray:
    """Simulate forward scenarios from a fitted R-Vine copula.

    Args:
        result: A fitted VinecopResult from fit_rvine.
        n: Number of scenarios to simulate.
        horizon: Number of time periods (rows per scenario). Each period
                 uses an independent draw from the vine (static vine).
                 For time-varying dependence, layer a separate model.
        qmc: If True, use quasi-Monte Carlo (Sobol) for lower-discrepancy.
             Currently not implemented by pyvinecopulib 0.7.6; ignored.
        seed: Random seed for reproducibility.

    Returns:
        Array of shape (n, horizon, n_dim) with values in (0, 1).
        These are uniform pseudo-observations; apply inverse CDF
        (e.g., empirical quantile) to map back to original scale.

    Raises:
        ValueError: If n < 1 or horizon < 1.
    """
    if n < 1:
        raise ValueError(f"n must be >= 1; got {n}")
    if horizon < 1:
        raise ValueError(f"horizon must be >= 1; got {horizon}")
    if qmc:
        warnings.warn(
            "Quasi-Monte Carlo not supported by pyvinecopulib 0.7.6; using pseudo-random.",
            UserWarning,
            stacklevel=2,
        )

    n_dim = result.vinecop.dim
    total = n * horizon
    # pyvinecopulib 0.7.6 simulate() expects seeds=Sequence[int] (not single seed)
    if seed is not None:
        sim = result.vinecop.simulate(total, seeds=[seed])
    else:
        sim = result.vinecop.simulate(total)
    return sim.reshape(n, horizon, n_dim)


def joint_tail_dependence(
    result: VinecopResult,
    threshold: float = 0.05,
    n_scenarios: int = 100_000,
    seed: int | None = 42,
) -> float:
    """Estimate joint tail probability: P(all variables simultaneously in worst tail).

    The "joint tail" attack scenario: how likely are all variables to be in
    their worst X% simultaneously? This is what kills DSCR deals — when rent
    growth is low, vacancy is high, AND interest rates are high, all at once.

    Args:
        result: A fitted VinecopResult.
        threshold: Tail quantile (default 0.05 = worst 5%).
        n_scenarios: Number of Monte Carlo scenarios for estimation.
        seed: Random seed.

    Returns:
        Estimated probability in [0, threshold]. E.g., 0.002 = 0.2% chance.
        Lower is better (less joint tail risk).

    Raises:
        ValueError: If threshold not in (0, 0.5].
    """
    if not 0 < threshold <= 0.5:
        raise ValueError(f"threshold must be in (0, 0.5]; got {threshold}")

    # Generate scenarios
    scenarios = simulate(result, n=n_scenarios, horizon=1, seed=seed)
    flat = scenarios[:, 0, :]  # shape (n_scenarios, n_dim)

    # Lower tail = below threshold quantile (uniform [0,1] → below threshold)
    # In uniform margins: P(U < threshold) = threshold (independent).
    # Joint lower tail: count scenarios where ALL variables < threshold.
    in_lower_tail = (flat < threshold).all(axis=1)
    return float(in_lower_tail.mean())


def upper_tail_dependence(
    result: VinecopResult,
    threshold: float = 0.95,
    n_scenarios: int = 100_000,
    seed: int | None = 42,
) -> float:
    """Estimate joint upper tail probability: P(all vars in best tail)."""
    if not 0.5 <= threshold < 1:
        raise ValueError(f"threshold must be in [0.5, 1); got {threshold}")
    scenarios = simulate(result, n=n_scenarios, horizon=1, seed=seed)
    flat = scenarios[:, 0, :]
    in_upper_tail = (flat > threshold).all(axis=1)
    return float(in_upper_tail.mean())


def independence_joint_tail(
    n_dim: int,
    threshold: float = 0.05,
    n_scenarios: int = 100_000,
    seed: int = 42,
) -> float:
    """Compute joint tail probability under independence assumption.

    Useful as a benchmark: the ratio (vine joint tail / independence joint tail)
    measures how much worse the joint tail risk is vs independence.

    Under independence: P(all < threshold) = threshold ** n_dim.

    Args:
        n_dim: Number of variables.
        threshold: Tail quantile.
        n_scenarios: Number of scenarios (for Monte Carlo validation).
        seed: Random seed.

    Returns:
        Joint tail probability under independence (analytical = threshold ** n_dim).
    """
    return threshold**n_dim


def tail_dependence_ratio(
    result: VinecopResult,
    threshold: float = 0.05,
    n_scenarios: int = 100_000,
    seed: int | None = 42,
) -> float:
    """Compute ratio of actual joint tail to independence joint tail.

    ratio > 1: vine captures MORE joint tail risk than independence (worse).
    ratio < 1: vine captures LESS joint tail risk (better than independence).
    ratio = 1: joint tail matches independence (independence copula).

    Args:
        result: A fitted VinecopResult.
        threshold: Tail quantile.
        n_scenarios: Number of scenarios.
        seed: Random seed.

    Returns:
        Ratio (actual / independence). >1 means tail-dependent.
    """
    actual = joint_tail_dependence(result, threshold, n_scenarios, seed)
    indep = independence_joint_tail(result.vinecop.dim, threshold)
    if indep == 0:
        return float("inf") if actual > 0 else 1.0
    return actual / indep


def stress_scenario(
    result: VinecopResult,
    target_quartile: float = 0.10,
    n_scenarios: int = 100_000,
    seed: int = 42,
) -> dict:
    """Generate a representative stress scenario from the fitted vine.

    Picks the scenario whose joint-likelihood is at `target_quartile` of
    worst cases. This is more informative than a single point estimate.

    Args:
        result: A fitted VinecopResult.
        target_quartile: Stress quantile (0.10 = 10th percentile = bad scenario).
        n_scenarios: Number of scenarios to generate.
        seed: Random seed.

    Returns:
        Dict with keys: 'worst_5pct_means', 'median', 'stress_scenario', 'vars'.
    """
    if not 0 < target_quartile < 1:
        raise ValueError(f"target_quartile must be in (0, 1); got {target_quartile}")

    scenarios = simulate(result, n=n_scenarios, horizon=1, seed=seed)
    flat = scenarios[:, 0, :]  # (n_scenarios, n_dim)

    # Rank scenarios by joint rank product (small = all bad)
    joint_rank = flat.mean(axis=1)
    sorted_idx = np.argsort(joint_rank)
    stress_idx = sorted_idx[int(target_quartile * n_scenarios)]

    return {
        "stress_scenario": flat[stress_idx],
        "median": np.median(flat, axis=0),
        "worst_5pct_means": flat[sorted_idx[: int(0.05 * n_scenarios)]].mean(axis=0),
        "best_5pct_means": flat[sorted_idx[-int(0.05 * n_scenarios) :]].mean(axis=0),
        "vars": list(result.columns),
    }


def fit_and_report(
    data: np.ndarray,
    columns: list[str] | None = None,
    config: VinecopConfig | None = None,
) -> dict:
    """Fit a vine and return a structured report dict.

    Convenience function: fits vine + computes tail dependencies + returns
    a serializable summary.

    Returns:
        Dict with: aic, bic, loglik, n_params, n_obs, columns,
                   joint_tail_5pct, indep_tail_5pct, tail_ratio_5pct,
                   joint_tail_10pct, indep_tail_10pct, tail_ratio_10pct,
                   family_set, structure_method, truncation_level.
    """
    result = fit_rvine(data, columns=columns, config=config)
    jt5 = joint_tail_dependence(result, threshold=0.05)
    it5 = independence_joint_tail(result.vinecop.dim, 0.05)
    jt10 = joint_tail_dependence(result, threshold=0.10)
    it10 = independence_joint_tail(result.vinecop.dim, 0.10)
    return {
        "aic": result.aic,
        "bic": result.bic,
        "loglik": result.loglik,
        "n_params": result.n_params,
        "n_obs": result.n_obs,
        "columns": list(result.columns),
        "joint_tail_5pct": jt5,
        "indep_tail_5pct": it5,
        "tail_ratio_5pct": jt5 / it5 if it5 > 0 else float("inf"),
        "joint_tail_10pct": jt10,
        "indep_tail_10pct": it10,
        "tail_ratio_10pct": jt10 / it10 if it10 > 0 else float("inf"),
        "family_set": list(result.config.family_set),
        "structure_method": result.config.structure_selection.value,
        "truncation_level": result.config.truncation.value,
    }


# =============================================================================
# Module exports
# =============================================================================


__all__ = [
    # Enums
    "VineStructure",
    "TruncationLevel",
    # Dataclasses
    "VinecopConfig",
    "VinecopResult",
    # Functions
    "pseudo_observations",
    "fit_rvine",
    "simulate",
    "joint_tail_dependence",
    "upper_tail_dependence",
    "independence_joint_tail",
    "tail_dependence_ratio",
    "stress_scenario",
    "fit_and_report",
]
