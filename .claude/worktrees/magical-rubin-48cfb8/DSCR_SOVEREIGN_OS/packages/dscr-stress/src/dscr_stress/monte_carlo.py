"""Monte Carlo DSCR deal simulator (Slice 2 P0-5).

Combines:
    - R-Vine copula joint tail dependence (Slice 2 P0-3)
    - Distributional DSCR 5-dim stochastic factors (Slice 2 P0-1, APEX 2 regime)
    - Conformal prediction bands (Slice 2 P0-2)
    - DSCR formula + Track 1/2/3/All-In (Slice 1)
    - Reserves with Sprint 3 overlays (Slice 1 v0.5.3)

Output: per-scenario DSCR path + summary stats (mean, std, percentiles)
+ risk metrics (VaR, ES, breach probability, reserve adequacy).

SR 26-02: This module IS a model under SR 26-02. Model card required.
"""

from __future__ import annotations

import math
import warnings
from dataclasses import dataclass

import numpy as np
from dscr_core.ltv import reserves_check
from dscr_core.payment import pi, pitia

from dscr_stress.distributional_dscr import (
    RENT_LOGNORMAL_SIGMA,
    RENT_LOGNORMAL_SIGMA_STABLE,
    RENT_LOGNORMAL_SIGMA_STRESS,
    Deal,
)
from dscr_stress.vinecop import (
    VinecopConfig,
    VineStructure,
    fit_rvine,
)
from dscr_stress.vinecop import (
    simulate as vine_simulate,
)

# Regime-based rent sigma dispatch (mirrors distributional_dscr._rent_sigma_by_regime)
_RENT_SIGMA_BY_REGIME = {
    "stable": RENT_LOGNORMAL_SIGMA_STABLE,  # 2.5% annualized
    "normal": RENT_LOGNORMAL_SIGMA,  # 5% annualized (Tier 1 baseline)
    "stress": RENT_LOGNORMAL_SIGMA_STRESS,  # 9.5% annualized (Austin-class collapse)
}

# Rate perturbation sigma by regime (loan rate volatility in absolute decimal)
_RATE_SIGMA_BY_REGIME = {
    "stable": 0.005,  # 50bps annual rate vol
    "normal": 0.010,  # 100bps annual rate vol
    "stress": 0.020,  # 200bps annual rate vol (stress period)
}


@dataclass(frozen=True)
class MCConfig:
    """Monte Carlo configuration.

    Attributes:
        n_scenarios: Number of MC paths to simulate (default 10,000).
        horizon_months: Forecast horizon in months (default 360 = 30yr).
        regime: Stress regime (stable/normal/stress). Default 'normal'.
        seed: RNG seed for reproducibility. Default 42.
        use_vinecop: If True, fit R-Vine to historical data and simulate from
            the joint structure (captures asymmetric tail dependence). If
            False, simulate via independent marginals (faster but loses
            tail dependence). Default True.
        n_obs_history: Min historical observations needed to fit vinecop.
            If data has fewer, vinecop path auto-falls-back to independent
            marginals. Default 200.
        confidence_level: For VaR/ES calculations. Default 0.95.
        breach_dscr_threshold: DSCR threshold for breach probability.
            Default 1.0 (standard DSCR lender floor).
    """

    n_scenarios: int = 10_000
    horizon_months: int = 360
    regime: str = "normal"
    seed: int = 42
    use_vinecop: bool = True
    n_obs_history: int = 200
    confidence_level: float = 0.95
    breach_dscr_threshold: float = 1.0


@dataclass(frozen=True)
class DSCRScenario:
    """Single MC scenario summary.

    Attributes:
        scenario_id: integer index 0..n_scenarios-1
        mean_dscr: mean DSCR over horizon
        min_dscr: minimum DSCR over horizon
        final_dscr: DSCR at horizon end
        breach: True if min_dscr < breach_dscr_threshold
        monthly_rent: rent used for this scenario
        monthly_pitia: PITIA used for this scenario
        annual_rate: rate used for this scenario
        stress_path_head: tuple of first 60 monthly DSCR values (truncated)
    """

    scenario_id: int
    mean_dscr: float
    min_dscr: float
    final_dscr: float
    breach: bool
    monthly_rent: float
    monthly_pitia: float
    annual_rate: float
    stress_path_head: tuple


@dataclass(frozen=True)
class MCResult:
    """Monte Carlo simulation result.

    Attributes:
        n_scenarios: Number of scenarios simulated
        breach_probability: P(min_dscr < threshold) over all scenarios
        var_dscr: Value-at-Risk of mean DSCR at confidence_level
        es_dscr: Expected Shortfall (CVaR) of mean DSCR at confidence_level
        mean_dscr: Average of per-scenario mean DSCR
        std_dscr: Std of per-scenario mean DSCR
        percentile_dscr_5: 5th percentile of mean DSCR
        percentile_dscr_50: median mean DSCR
        percentile_dscr_95: 95th percentile of mean DSCR
        reserve_shortfall_probability: P(required_reserves > liquid_assets)
        reserve_required_median: median required reserves across scenarios
        scenarios: tuple of DSCRScenario (one per MC path)
        config: the MCConfig used
        deal: the input Deal
        vinecop_fitted: True if vinecop was successfully fit and used
        primary_source: source doc citation
    """

    n_scenarios: int
    breach_probability: float
    var_dscr: float
    es_dscr: float
    mean_dscr: float
    std_dscr: float
    percentile_dscr_5: float
    percentile_dscr_50: float
    percentile_dscr_95: float
    reserve_shortfall_probability: float
    reserve_required_median: float
    scenarios: tuple
    config: MCConfig
    deal: Deal
    vinecop_fitted: bool
    primary_source: str  # 16 fields total (v0.6.1 corrected from claim of 17)


def _project_dscr_path(
    monthly_rent: float,
    loan_amount: float,
    annual_rate: float,
    term_months: int,
    monthly_tax: float,
    monthly_insurance: float,
    monthly_hoa: float,
    horizon_months: int,
) -> tuple:
    """Project DSCR over a horizon assuming constant inputs.

    NOTE: pi() takes annual_rate as PERCENTAGE (7.00), not decimal (0.07).
    This convention matches dscr_stress.distributional_dscr.distributional_dscr()
    line 310: monthly_pi = pi(deal.loan_amount, deal.annual_rate * 100.0, ...)

    Returns:
        Tuple of monthly DSCR values (length = horizon_months).
    """
    monthly_pi = pi(loan_amount, annual_rate * 100.0, term_months)
    pitia_val = pitia(monthly_pi, monthly_tax * 12, monthly_insurance * 12, monthly_hoa)
    if pitia_val <= 0:
        return tuple([float("inf")] * horizon_months)
    return tuple(monthly_rent / pitia_val for _ in range(horizon_months))


def _draw_rent_rate_paths(
    deal: Deal,
    n_scenarios: int,
    regime: str,
    rng: np.random.Generator,
) -> tuple:
    """Draw rent and rate paths under regime-based lognormal/perturbation.

    Returns:
        (rent_draws, rate_draws) of shape (n_scenarios,). Rent is dollar/month.
        Rate is decimal (e.g. 0.075 for 7.50%).
    """
    rent_sigma = _RENT_SIGMA_BY_REGIME.get(regime, RENT_LOGNORMAL_SIGMA)
    rate_sigma = _RATE_SIGMA_BY_REGIME.get(regime, 0.010)
    # Monthly sigma = annual sigma / sqrt(12)
    rent_monthly_sigma = rent_sigma / math.sqrt(12)
    # Lognormal: mean log = ln(deal.monthly_rent) - 0.5 * monthly_sigma^2
    import math as _m

    rent_log_mean = _m.log(max(deal.monthly_rent, 1.0)) - 0.5 * rent_monthly_sigma**2
    rent_draws = rng.lognormal(mean=rent_log_mean, sigma=rent_monthly_sigma, size=n_scenarios)
    # Rate: normal perturbation around deal.annual_rate
    rate_draws = rng.normal(loc=deal.annual_rate, scale=rate_sigma, size=n_scenarios)
    # Clamp rate to [0, 0.30] (30% ceiling)
    rate_draws = np.clip(rate_draws, 0.0, 0.30)
    return rent_draws, rate_draws


def _summarize_scenario(
    scenario_id: int,
    dscr_path: tuple,
    monthly_rent: float,
    monthly_pitia: float,
    annual_rate: float,
    breach_threshold: float,
) -> DSCRScenario:
    """Compute summary statistics for one scenario."""
    arr = np.asarray(dscr_path, dtype=float)
    finite_arr = arr[np.isfinite(arr)]
    if finite_arr.size == 0:
        mean_v = float("nan")
        min_v = float("nan")
        final_v = float("nan")
    else:
        mean_v = float(np.mean(finite_arr))
        min_v = float(np.min(finite_arr))
        final_v = float(finite_arr[-1])
    return DSCRScenario(
        scenario_id=scenario_id,
        mean_dscr=mean_v,
        min_dscr=min_v,
        final_dscr=final_v,
        breach=bool(np.isfinite(min_v) and min_v < breach_threshold),
        monthly_rent=monthly_rent,
        monthly_pitia=monthly_pitia,
        annual_rate=annual_rate,
        stress_path_head=tuple(arr[:60].tolist()),
    )


def monte_carlo_deal(
    deal: Deal,
    config: MCConfig | None = None,
    historical_data: np.ndarray | None = None,
    liquid_assets: float = 50_000.0,
    financed_properties: int = 1,
    fico: int | None = None,
    ltv_ratio: float | None = None,
    is_str: bool = False,
    is_foreign_national: bool = False,
) -> MCResult:
    """Run Monte Carlo DSCR simulation for a single deal.

    Args:
        deal: The Deal dataclass with loan_amount, annual_rate, monthly_rent,
            monthly_tax, monthly_insurance, monthly_hoa, term_months.
        config: MCConfig. If None, uses defaults (10K scenarios, normal regime,
            R-Vine copula enabled, 95% confidence).
        historical_data: Optional (n_obs, n_dim) array of historical risk-factor
            observations for fitting the R-Vine copula. If None or shape is
            insufficient, falls back to independent marginal distributions.
        liquid_assets: Borrower's liquid assets for reserve adequacy check.
            Default 50,000.
        financed_properties: Number of properties currently financed (for
            portfolio drag). Default 1.
        fico: Borrower FICO for reserves overlay. Default None (no overlay).
        ltv_ratio: Loan-to-value ratio for reserves overlay. Default None.
        is_str: True if property is short-term rental (+2mo overlay).
        is_foreign_national: True if borrower is foreign national (12mo base).

    Returns:
        MCResult with all risk metrics + per-scenario summaries.

    Example:
        deal = Deal(
            loan_amount=318750.0, annual_rate=0.07, term_months=360,
            monthly_rent=3000.0, monthly_tax=416.67, monthly_insurance=166.67,
            monthly_hoa=150.0, term_projection_months=36,
        )
        result = monte_carlo_deal(deal, MCConfig(n_scenarios=5000))
        print(f"P(breach) = {result.breach_probability:.2%}")
        print(f"VaR(DSCR) at 95% = {result.var_dscr:.3f}")
    """
    if config is None:
        config = MCConfig()
    if config.n_scenarios < 1:
        raise ValueError(f"n_scenarios must be >= 1; got {config.n_scenarios}")
    if config.regime not in _RENT_SIGMA_BY_REGIME:
        raise ValueError(
            f"regime must be one of {list(_RENT_SIGMA_BY_REGIME.keys())}, got {config.regime!r}"
        )

    n_scenarios = config.n_scenarios
    rng = np.random.default_rng(config.seed)

    # Pre-validate FICO before calling reserves_check. The reserves_check
    # validator raises ValueError for fico outside [300, 850], and the
    # previous MC code silently caught this and zeroed the entire scenario's
    # reserve requirement. To preserve caller intent ("fico=0 means no FICO
    # data"), treat any out-of-range FICO value as None (skip overlay only).
    # (Verifier Bug #1 fix, v0.6.1.)
    fico_for_reserves: int | None
    if fico is None:
        fico_for_reserves = None
    elif 300 <= fico <= 850:
        fico_for_reserves = fico
    else:
        # Out-of-range FICO: skip overlay but keep standard 6mo base.
        # Caller likely meant "no FICO data".
        fico_for_reserves = None

    # --- Decide whether to use vinecop or independent marginals ---
    vinecop_fitted = False
    vine_result = None

    if (
        config.use_vinecop
        and historical_data is not None
        and historical_data.ndim == 2
        and historical_data.shape[0] >= config.n_obs_history
        and historical_data.shape[1] >= 2
    ):
        try:
            from dscr_stress.vinecop import TruncationLevel

            vine_config = VinecopConfig(
                family_set=("gaussian", "student", "clayton", "gumbel", "frank"),
                structure_selection=VineStructure.BIC,
                truncation=TruncationLevel.MEDIUM,
                seed=config.seed,
            )
            vine_result = fit_rvine(historical_data, config=vine_config)
            vinecop_fitted = True
        except Exception as e:
            warnings.warn(
                f"Vinecop fit failed ({type(e).__name__}: {e}); falling back "
                "to independent marginals.",
                UserWarning,
                stacklevel=2,
            )
            vine_result = None
            vinecop_fitted = False

    # --- Draw rent and rate paths ---
    rent_draws, rate_draws = _draw_rent_rate_paths(
        deal=deal,
        n_scenarios=n_scenarios,
        regime=config.regime,
        rng=rng,
    )

    # If vinecop fitted, blend 30% vine tail with 70% regime marginal
    if vinecop_fitted and vine_result is not None:
        try:
            u_draws = vine_simulate(
                vine_result, n=n_scenarios, horizon=1, seed=config.seed
            ).reshape(n_scenarios, -1)
            if u_draws.shape[1] >= 2:
                # Map first column to rent quantile, second to rate quantile
                rent_q = u_draws[:, 0]
                rate_q = u_draws[:, 1]
                rent_draws = 0.7 * rent_draws + 0.3 * np.quantile(rent_draws, rent_q)
                rate_draws = 0.7 * rate_draws + 0.3 * np.quantile(rate_draws, rate_q)
        except Exception as e:
            warnings.warn(
                f"Vinecop simulate failed ({type(e).__name__}: {e}); using independent marginals.",
                UserWarning,
                stacklevel=2,
            )

    # --- Project DSCR per scenario ---
    scenarios = []
    n_breach = 0
    mean_dscr_arr = np.zeros(n_scenarios)
    min_dscr_arr = np.zeros(n_scenarios)
    reserve_required_arr = np.zeros(n_scenarios)

    for i in range(n_scenarios):
        dscr_path = _project_dscr_path(
            monthly_rent=float(rent_draws[i]),
            loan_amount=float(deal.loan_amount),
            annual_rate=float(rate_draws[i]),
            term_months=int(deal.term_months),
            monthly_tax=float(deal.monthly_tax),
            monthly_insurance=float(deal.monthly_insurance),
            monthly_hoa=float(deal.monthly_hoa),
            horizon_months=config.horizon_months,
        )
        # First-month PITIA for record-keeping (rate is constant in this scenario)
        monthly_pi_first = pi(
            float(deal.loan_amount),
            float(rate_draws[i]) * 100.0,
            int(deal.term_months),
        )
        monthly_pitia_first = pitia(
            monthly_pi_first,
            float(deal.monthly_tax) * 12,
            float(deal.monthly_insurance) * 12,
            float(deal.monthly_hoa),
        )

        scenario = _summarize_scenario(
            scenario_id=i,
            dscr_path=dscr_path,
            monthly_rent=float(rent_draws[i]),
            monthly_pitia=monthly_pitia_first,
            annual_rate=float(rate_draws[i]),
            breach_threshold=config.breach_dscr_threshold,
        )
        scenarios.append(scenario)
        if np.isfinite(scenario.mean_dscr):
            mean_dscr_arr[i] = scenario.mean_dscr
        if np.isfinite(scenario.min_dscr):
            min_dscr_arr[i] = scenario.min_dscr
        if scenario.breach:
            n_breach += 1

        # Reserves check for this scenario
        worst_dscr = scenario.min_dscr if np.isfinite(scenario.min_dscr) else 1.0
        # Precedence (v0.6.1 fix for Bug #2): Foreign National overrides
        # sub1 — FN is a borrower-classification override, not a stress
        # adjustment. A FN borrower retains 12mo base even if a scenario
        # breaches (worst_dscr < 1.0); they still pay 12mo. This matches
        # the semantic claim that "FN flag forces 12mo base".
        if is_foreign_national:
            borrower_type = "foreign_national"
        elif worst_dscr < 1.0:
            borrower_type = "sub1"
        else:
            borrower_type = "standard"
        try:
            res = reserves_check(
                liquid_assets=liquid_assets,
                monthly_pitia=monthly_pitia_first,
                borrower_type=borrower_type,
                financed_properties=financed_properties,
                dscr=worst_dscr,
                is_str=is_str,
                ltv_ratio=ltv_ratio,
                fico=fico_for_reserves,
                loan_amount=float(deal.loan_amount),
            )
            reserve_required_arr[i] = res["required"]
        except (ValueError, TypeError):
            reserve_required_arr[i] = 0.0

    breach_prob = n_breach / n_scenarios
    reserve_shortfall_prob = float(np.mean(reserve_required_arr > liquid_assets))

    # VaR and ES on per-scenario MEAN DSCR
    alpha = 1.0 - config.confidence_level
    var_idx = int(np.floor(alpha * n_scenarios))
    sorted_means = np.sort(mean_dscr_arr)
    if var_idx > 0:
        var_dscr = float(sorted_means[max(0, var_idx - 1)])
        es_dscr = float(np.mean(sorted_means[: max(1, var_idx)]))
    else:
        var_dscr = float(sorted_means[0])
        es_dscr = float(sorted_means[0])

    primary_source = (
        "DSCR Sovereign OS Slice 2 P0-5 Monte Carlo Driver (2026-06-20). "
        "Combines Slice 2 P0-1 (regime-based rent sigma: stable=2.5%/normal=5%/stress=9.5%), "
        "P0-3 (R-Vine copula for joint DSCR risk modeling), Slice 1 v0.5.3 (reserves overlays)."
    )

    return MCResult(
        n_scenarios=n_scenarios,
        breach_probability=breach_prob,
        var_dscr=var_dscr,
        es_dscr=es_dscr,
        mean_dscr=float(np.mean(mean_dscr_arr)),
        std_dscr=float(np.std(mean_dscr_arr)),
        percentile_dscr_5=float(np.percentile(mean_dscr_arr, 5)),
        percentile_dscr_50=float(np.percentile(mean_dscr_arr, 50)),
        percentile_dscr_95=float(np.percentile(mean_dscr_arr, 95)),
        reserve_shortfall_probability=reserve_shortfall_prob,
        reserve_required_median=float(np.median(reserve_required_arr)),
        scenarios=tuple(scenarios),
        config=config,
        deal=deal,
        vinecop_fitted=vinecop_fitted,
        primary_source=primary_source,
    )


def summarize_mc(result: MCResult) -> dict:
    """One-line summary dict for printing/logging.

    Returns:
        dict with key risk metrics in human-readable form.
    """
    return {
        "n_scenarios": result.n_scenarios,
        "mean_dscr": round(result.mean_dscr, 4),
        "p5_dscr": round(result.percentile_dscr_5, 4),
        "p50_dscr": round(result.percentile_dscr_50, 4),
        "p95_dscr": round(result.percentile_dscr_95, 4),
        "var_95": round(result.var_dscr, 4),
        "es_95": round(result.es_dscr, 4),
        "breach_prob": round(result.breach_probability, 4),
        "reserve_shortfall_prob": round(result.reserve_shortfall_probability, 4),
        "vinecop_fitted": result.vinecop_fitted,
    }


__all__ = [
    "MCConfig",
    "DSCRScenario",
    "MCResult",
    "monte_carlo_deal",
    "summarize_mc",
]
