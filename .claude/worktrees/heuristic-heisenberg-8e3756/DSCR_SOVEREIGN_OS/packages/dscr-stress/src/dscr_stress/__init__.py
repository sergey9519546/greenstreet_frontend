"""dscr-stress: Slice 2 -- Stochastic Stress + Conformal + R-Vine + ARM Reset Engine.

This package adds stochastic stress testing, distribution-free uncertainty
quantification, R-Vine copula joint risk modeling, and ARM reset forecasting
on top of the Slice 1 deterministic foundation.

Modules:
    distributional_dscr: 5-dimensional stochastic DSCR (P0-1)
    conformal: Conformal prediction bands via MAPIE (P0-2)
    vinecop: R-Vine copula for joint risk modeling (P0-3)
    yield_curve: Nelson-Siegel-Svensson yield curve calibration (P0-4)
    arm_reset: ARM reset forecasting with caps (P0-4)
    live_rates: NY Fed SOFR API + FRED CSV integration (P0-4)

Spec sources:
- Round 23 Algorithm Innovation Tournament (Architecture A)
- v16 Sovereign Master / v3 Cross-Doc Synthesis
- dscr_sovereign_os_architectural_debt_and_math.md (DEBT 1 fix)
- KBRA DSCR methodology (calibration anchors)
- APEX 2 (June 2026): regime-based rent sigma from Apartment List cross-
  sectional metro dispersion 2020-2026 (Wayback Machine).
- APEX 3 (June 2026): MAPIE integration for distribution-free conformal
  prediction (Lei et al. 2018).
- APEX 3 (June 2026): pyvinecopulib 0.7.6 (MIT License) for R-Vine
  copula joint DSCR risk modeling -- replaces the Gaussian copula banned
  by the stationary-correlation attack (Tournament Round 23 defense).
- T11 #3 NSS-Svensson yield curve (Slice 2 P0-4)
- Sprint 6 Module 3 ARM reset engine (Slice 2 P0-4)
- T15 #1, #3, #12 live data sources (Slice 2 P0-4)

SR 26-02: This layer IS a model under SR 26-02. Model card required.
"""

from dscr_stress.arm_reset import (
    ARM_INITIAL_PERIOD_MONTHS,
    ARM_RESET_FREQUENCY_MONTHS,
    DEFAULT_INDEX,
    DEFAULT_LIFETIME_CAP,
    DEFAULT_LIFETIME_FLOOR_DELTA,
    DEFAULT_MARGIN,
    DEFAULT_PERIODIC_CAP,
    ARMResetSchedule,
    payment_shock,
    populate_payment_shocks,
    project_arm_reset_schedule,
    project_arm_reset_stressed,
    project_arm_reset_with_nss,
)
from dscr_stress.conformal import (
    DEFAULT_CALIBRATION_FRACTION,
    DEFAULT_CONFIDENCE_LEVEL,
    ConformalDSCR,
    conformal_dscr_path,
)
from dscr_stress.distributional_dscr import (
    RENT_LOGNORMAL_SIGMA,
    RENT_LOGNORMAL_SIGMA_STABLE,
    RENT_LOGNORMAL_SIGMA_STRESS,
    RENT_SIGMA_BY_REGIME,
    Deal,
    DistributionalDSCR,
    distributional_dscr,
)
from dscr_stress.live_rates import (
    DEFAULT_CACHE_PATH,
    FALLBACK_RATES,
    FRED_SERIES,
    NY_FED_SOFR_LAST_1,
    RateSnapshot,
    fetch_fred_csv,
    fetch_ny_fed_sofr,
    fetch_rate_snapshot,
    get_sofr_curve_from_snapshot,
    get_sofr_horizons_years,
    synthetic_sofr_curve,
)
from dscr_stress.monte_carlo import (
    DSCRScenario,
    MCConfig,
    MCResult,
    monte_carlo_deal,
    summarize_mc,
)
from dscr_stress.vinecop import (
    TruncationLevel,
    VinecopConfig,
    VinecopResult,
    VineStructure,
    fit_and_report,
    fit_rvine,
    independence_joint_tail,
    joint_tail_dependence,
    pseudo_observations,
    simulate,
    stress_scenario,
    tail_dependence_ratio,
    upper_tail_dependence,
)
from dscr_stress.yield_curve import (
    GOOD_FIT_RMSE,
    NSS_BOUNDS,
    STANDARD_MATURITIES,
    CalibrationResult,
    NSSParams,
    calibrate_ns,
    calibrate_nss,
    fit_quality,
    ns_yield,
    nss_forward_rate,
    nss_forward_rate_range,
    nss_yield,
)

__version__ = "0.6.1"  # Slice 2 P0-5 MC (verifier-fix: FICO+FN bug fixes)

__all__ = [
    # distributional_dscr (P0-1)
    "Deal",
    "DistributionalDSCR",
    "distributional_dscr",
    "RENT_LOGNORMAL_SIGMA",
    "RENT_LOGNORMAL_SIGMA_STABLE",
    "RENT_LOGNORMAL_SIGMA_STRESS",
    "RENT_SIGMA_BY_REGIME",
    # conformal (P0-2)
    "ConformalDSCR",
    "conformal_dscr_path",
    "DEFAULT_CONFIDENCE_LEVEL",
    "DEFAULT_CALIBRATION_FRACTION",
    # vinecop (P0-3) -- R-Vine Copula joint DSCR risk modeling
    "VinecopConfig",
    "VinecopResult",
    "VineStructure",
    "TruncationLevel",
    "fit_rvine",
    "simulate",
    "joint_tail_dependence",
    "upper_tail_dependence",
    "independence_joint_tail",
    "tail_dependence_ratio",
    "stress_scenario",
    "fit_and_report",
    "pseudo_observations",
    # yield_curve (P0-4)
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
    # arm_reset (P0-4)
    "ARMResetSchedule",
    "ARM_INITIAL_PERIOD_MONTHS",
    "ARM_RESET_FREQUENCY_MONTHS",
    "DEFAULT_PERIODIC_CAP",
    "DEFAULT_LIFETIME_CAP",
    "DEFAULT_LIFETIME_FLOOR_DELTA",
    "DEFAULT_INDEX",
    "DEFAULT_MARGIN",
    "project_arm_reset_schedule",
    "project_arm_reset_with_nss",
    "project_arm_reset_stressed",
    "payment_shock",
    "populate_payment_shocks",
    # live_rates (P0-4)
    "RateSnapshot",
    "NY_FED_SOFR_LAST_1",
    "FRED_SERIES",
    "FALLBACK_RATES",
    "DEFAULT_CACHE_PATH",
    "fetch_ny_fed_sofr",
    "fetch_fred_csv",
    "fetch_rate_snapshot",
    "get_sofr_curve_from_snapshot",
    "get_sofr_horizons_years",
    "synthetic_sofr_curve",
    # Slice 2 P0-5 Monte Carlo Driver (NEW v0.6.0)
    "DSCRScenario",
    "MCConfig",
    "MCResult",
    "monte_carlo_deal",
    "summarize_mc",
]  # v0.6.1 -- Slice 2 P0-5: Monte Carlo Driver (verifier-fix patch)
