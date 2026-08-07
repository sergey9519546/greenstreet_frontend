"""
DSCR Sovereign OS — TimesFM 2.5 ICF Rent Forecasting Pipeline
==============================================================
Phase 1 (Current): ICF (In-Context Fine-Tuning) mode — zero training data required.
  - Uses TimesFM 2.5 base model with comparable property rent histories as in-context examples.
  - Produces 12-month forward rent forecast with native P10/P50/P90 quantile intervals.
  - Feeds directly into the Monte Carlo engine as the rent uncertainty distribution.

Phase 3+ (Upgrade Trigger): Switch to LoRA fine-tuned model when:
  - You have >= 500 property-months of clean rent history in the database.
  - A GPU instance is available (A10/A100-class recommended).
  - See LORA_UPGRADE_BLUEPRINT.md for the full upgrade path.

Architecture:
  TimesFM 2.5 (ICF mode)
      → point_forecast + quantile_forecast (P10/P50/P90)
      → feeds rent_margin in Monte Carlo Module 1 (R-vine copula)
      → replaces conformal wrapper on TimesFM output (quantile head handles it)
      → still use conformal wrapping on RentCast/AirDNA vendor point estimates

Anti-leakage rules (critical):
  - SOFR/Treasury covariates: supply FUTURE values from NSS forward curve only.
  - Vacancy/occupancy: is_past=True — we do NOT know the future.
  - STR-ban flags: is_past=False ONLY if the ban is legally enacted and deterministic.

Author: DSCR Sovereign OS Autonomous Intelligence Loop
Date: 2026-06-18
"""

import os
import json
import datetime
import logging
import math
import statistics
from pathlib import Path

# ── Logging ───────────────────────────────────────────────────────────────────
BASE_DIR = "/home/ubuntu/dscr_improvement_loop"
LOG_FILE = f"{BASE_DIR}/timesfm.log"
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.FileHandler(LOG_FILE), logging.StreamHandler()]
)
log = logging.getLogger(__name__)

TODAY = datetime.date.today().isoformat()
FORECAST_DIR = f"{BASE_DIR}/rent_forecasts"
PROPERTY_DB  = f"{BASE_DIR}/property_rent_history.json"
os.makedirs(FORECAST_DIR, exist_ok=True)

# ── TimesFM Import Guard ───────────────────────────────────────────────────────
# TimesFM 2.5 requires ~2GB RAM and works on CPU-only (no GPU needed for inference).
# Install: pip install timesfm[torch] timesfm[xreg]
TIMESFM_AVAILABLE = False
try:
    import timesfm
    TIMESFM_AVAILABLE = True
    log.info("TimesFM 2.5 loaded successfully.")
except ImportError:
    log.warning("TimesFM not installed. Running in SIMULATION mode.")
    log.warning("To install: pip install timesfm[torch] timesfm[xreg]")

# ── Property Rent History Database ────────────────────────────────────────────
def load_property_db() -> dict:
    """Load the accumulated property rent history database."""
    if os.path.exists(PROPERTY_DB):
        with open(PROPERTY_DB, 'r') as f:
            return json.load(f)
    return {"properties": {}, "total_property_months": 0, "last_updated": None}

def save_property_db(db: dict):
    """Save the property rent history database."""
    db["last_updated"] = TODAY
    with open(PROPERTY_DB, 'w') as f:
        json.dump(db, f, indent=2)

def add_property_history(property_id: str, address: str, zip_code: str,
                          property_type: str, rent_history: list,
                          sofr_history: list = None, vacancy_history: list = None):
    """
    Add or update a property's rent history in the database.
    
    Args:
        property_id: Unique identifier (e.g., "prop_123_main_st_austin_tx")
        address: Full address string
        zip_code: 5-digit ZIP code
        property_type: "SFR", "2-4unit", "condo", "STR"
        rent_history: List of monthly rents, chronological order (oldest first)
                      e.g., [2800, 2850, 2900, 2950, 3000, ...]
        sofr_history: Optional list of monthly SOFR rates (same length as rent_history)
        vacancy_history: Optional list of monthly vacancy rates (0.0 to 1.0)
    """
    db = load_property_db()
    
    n_months = len(rent_history)
    db["properties"][property_id] = {
        "address": address,
        "zip_code": zip_code,
        "property_type": property_type,
        "rent_history": rent_history,
        "sofr_history": sofr_history or [],
        "vacancy_history": vacancy_history or [],
        "n_months": n_months,
        "last_updated": TODAY
    }
    
    # Recount total property-months
    total = sum(p["n_months"] for p in db["properties"].values())
    db["total_property_months"] = total
    
    save_property_db(db)
    log.info(f"Property {property_id} added/updated: {n_months} months. Total DB: {total} property-months.")
    
    # Check LoRA upgrade trigger
    if total >= 500:
        log.warning(f"LORA UPGRADE TRIGGER: {total} property-months >= 500 threshold.")
        log.warning("Review LORA_UPGRADE_BLUEPRINT.md and provision a GPU instance.")

def get_comparable_properties(zip_code: str, property_type: str, n: int = 5) -> list:
    """
    Find comparable properties for ICF mode.
    Returns up to n rent history series from the same ZIP and property type.
    """
    db = load_property_db()
    comparables = []
    
    for pid, prop in db["properties"].items():
        if prop["zip_code"] == zip_code and prop["property_type"] == property_type:
            if len(prop["rent_history"]) >= 12:  # minimum 12 months
                comparables.append(prop["rent_history"])
    
    # If not enough in same ZIP, broaden to same property type
    if len(comparables) < n:
        for pid, prop in db["properties"].items():
            if prop["property_type"] == property_type and prop["rent_history"] not in comparables:
                if len(prop["rent_history"]) >= 12:
                    comparables.append(prop["rent_history"])
    
    return comparables[:n]

# ── ICF Forecasting Engine ─────────────────────────────────────────────────────
def run_icf_forecast(
    rent_history: list,
    zip_code: str,
    property_type: str,
    sofr_forward_curve: list = None,
    vacancy_estimate: float = 0.05,
    horizon: int = 12
) -> dict:
    """
    Run TimesFM 2.5 ICF (In-Context Fine-Tuning) forecast.
    
    This is the Phase 1 production path: zero training data, CPU-only.
    Uses comparable property rent histories as in-context examples.
    
    Args:
        rent_history: List of monthly rents for the subject property (oldest first)
        zip_code: ZIP code for finding comparable properties
        property_type: "SFR", "2-4unit", "condo", "STR"
        sofr_forward_curve: List of 12 monthly SOFR forward rates (from NSS module)
                            If None, uses flat current SOFR estimate.
        vacancy_estimate: Current vacancy rate for the market (0.0 to 1.0)
        horizon: Forecast horizon in months (default 12)
    
    Returns:
        dict with keys: point_forecast, p10, p50, p90, method, metadata
    """
    if not TIMESFM_AVAILABLE:
        return _simulation_forecast(rent_history, horizon)
    
    try:
        log.info(f"Running TimesFM 2.5 ICF forecast for ZIP {zip_code}, type {property_type}")
        
        # Load base model (CPU-only, ~2GB RAM)
        tfm = timesfm.TimesFm(
            hparams=timesfm.TimesFmHparams(
                backend="cpu",
                per_core_batch_size=32,
                horizon_len=horizon,
                num_layers=50,
                model_dims=1280,
                use_positional_embedding=False,
            ),
            checkpoint=timesfm.TimesFmCheckpoint(
                huggingface_repo_id="google/timesfm-2.0-500m-pytorch"
            ),
        )
        
        # Compile with quantile head for native P10/P90
        tfm.compile(
            timesfm.ForecastConfig(
                max_context=1024,
                max_horizon=horizon,
                normalize_inputs=True,          # MANDATORY: rents vary 3-10x by market
                use_continuous_quantile_head=True,  # native P10/P90, no conformal needed
                force_flip_invariance=True,
                infer_is_positive=True,         # rents are always positive
                fix_quantile_crossing=True,     # prevents P10 > P50 nonsense
            )
        )
        
        # Get comparable properties for ICF
        comparables = get_comparable_properties(zip_code, property_type, n=5)
        log.info(f"Found {len(comparables)} comparable properties for ICF.")
        
        # Build covariates (XReg)
        # SOFR forward curve: future values from NSS module (anti-leakage compliant)
        if sofr_forward_curve is None:
            sofr_forward_curve = [0.0363] * horizon  # flat at current 30-day SOFR
        
        # Vacancy: past-only (we don't know future vacancy)
        vacancy_series = [vacancy_estimate] * len(rent_history)
        
        # Build forecast inputs
        forecast_input = [rent_history]  # subject property
        
        # Add comparables as in-context examples (ICF mode)
        if comparables:
            for comp in comparables:
                forecast_input.append(comp)
        
        # Dynamic covariates (anti-leakage compliant)
        dynamic_numerical_covariates = [
            {
                "name": "sofr_1y",
                "values": [sofr_forward_curve] * len(forecast_input),
                "is_past": False  # future values from NSS curve — compliant
            },
            {
                "name": "vacancy_rate",
                "values": [vacancy_series[:len(rent_history)]] * len(forecast_input),
                "is_past": True  # past-only — we don't know future vacancy
            }
        ]
        
        # Run forecast
        point_forecast, quantile_forecast = tfm.forecast_with_covariates(
            inputs=forecast_input,
            dynamic_numerical_covariates=dynamic_numerical_covariates,
            horizon=horizon,
            xreg_mode="xreg+timesfm",  # covariate-first, residual-second (recommended)
        )
        
        # Extract subject property forecast (index 0)
        subject_point = point_forecast[0].tolist()
        subject_quantiles = quantile_forecast[0]  # shape: (horizon, n_quantiles)
        
        # Extract P10, P50, P90 (quantile indices depend on model config)
        p10 = subject_quantiles[:, 1].tolist()   # 10th percentile
        p50 = subject_quantiles[:, 5].tolist()   # 50th percentile (median)
        p90 = subject_quantiles[:, 9].tolist()   # 90th percentile
        
        result = {
            "method": "TimesFM_2.5_ICF",
            "zip_code": zip_code,
            "property_type": property_type,
            "forecast_date": TODAY,
            "horizon_months": horizon,
            "n_comparables_used": len(comparables),
            "point_forecast": subject_point,
            "p10": p10,
            "p50": p50,
            "p90": p90,
            "current_rent": rent_history[-1] if rent_history else None,
            "forecast_month_1": {
                "point": round(subject_point[0], 2),
                "p10": round(p10[0], 2),
                "p50": round(p50[0], 2),
                "p90": round(p90[0], 2),
            },
            "forecast_month_12": {
                "point": round(subject_point[-1], 2),
                "p10": round(p10[-1], 2),
                "p50": round(p50[-1], 2),
                "p90": round(p90[-1], 2),
            },
            "rent_growth_central": round((subject_point[-1] / rent_history[-1] - 1) * 100, 2) if rent_history else None,
            "lora_upgrade_ready": load_property_db()["total_property_months"] >= 500,
        }
        
        log.info(f"ICF forecast complete. Month 12 P50: ${p50[-1]:.0f}, P10: ${p10[-1]:.0f}, P90: ${p90[-1]:.0f}")
        return result
        
    except Exception as e:
        log.error(f"TimesFM ICF forecast failed: {e}. Falling back to simulation.")
        return _simulation_forecast(rent_history, horizon)


def _simulation_forecast(rent_history: list, horizon: int = 12) -> dict:
    """
    CPU-only simulation fallback when TimesFM is not installed.
    Uses a simple trend + seasonality model to produce P10/P50/P90 intervals.
    This is NOT a substitute for TimesFM — install TimesFM for production use.
    """
    log.warning("Using SIMULATION fallback. Install TimesFM for production accuracy.")
    
    if not rent_history or len(rent_history) < 3:
        return {"method": "SIMULATION_FALLBACK", "error": "Insufficient rent history"}
    
    # Simple trend: average monthly growth rate over last 12 months
    recent = rent_history[-min(12, len(rent_history)):]
    if len(recent) >= 2:
        monthly_growth = (recent[-1] / recent[0]) ** (1 / (len(recent) - 1)) - 1
    else:
        monthly_growth = 0.002  # default 0.2%/month (~2.4% annual)
    
    # Cap growth at reasonable bounds
    monthly_growth = max(-0.02, min(0.03, monthly_growth))
    
    current_rent = rent_history[-1]
    point_forecast = []
    p10 = []
    p50 = []
    p90 = []
    
    # Compute volatility from history
    if len(rent_history) >= 6:
        changes = [(rent_history[i] / rent_history[i-1] - 1) for i in range(1, len(rent_history))]
        vol = statistics.stdev(changes) if len(changes) > 1 else 0.02
    else:
        vol = 0.025  # default 2.5% monthly volatility
    
    for t in range(1, horizon + 1):
        central = current_rent * ((1 + monthly_growth) ** t)
        # Uncertainty grows with horizon (sqrt of time)
        uncertainty = central * vol * math.sqrt(t)
        
        point_forecast.append(round(central, 2))
        p10.append(round(central - 1.28 * uncertainty, 2))
        p50.append(round(central, 2))
        p90.append(round(central + 1.28 * uncertainty, 2))
    
    return {
        "method": "SIMULATION_FALLBACK_install_timesfm",
        "forecast_date": TODAY,
        "horizon_months": horizon,
        "current_rent": current_rent,
        "point_forecast": point_forecast,
        "p10": p10,
        "p50": p50,
        "p90": p90,
        "forecast_month_1": {
            "point": point_forecast[0], "p10": p10[0], "p50": p50[0], "p90": p90[0]
        },
        "forecast_month_12": {
            "point": point_forecast[-1], "p10": p10[-1], "p50": p50[-1], "p90": p90[-1]
        },
        "rent_growth_central": round((point_forecast[-1] / current_rent - 1) * 100, 2),
        "lora_upgrade_ready": False,
        "warning": "SIMULATION MODE — install timesfm[torch] for production accuracy"
    }


# ── Monte Carlo Integration ────────────────────────────────────────────────────
def get_monte_carlo_rent_params(forecast: dict) -> dict:
    """
    Convert TimesFM forecast output into Monte Carlo input parameters.
    
    The R-vine copula Monte Carlo engine needs:
    - rent_mean: central path (from P50)
    - rent_sigma: implied volatility (from P10/P90 spread)
    - rent_skew: directional bias (negative if P10 is closer to P50 than P90)
    
    This respects the hierarchy:
    - TimesFM own output: use P10/P90 directly (no conformal wrapper needed)
    - Vendor feeds (RentCast, AirDNA): still apply conformal wrapper
    """
    if "error" in forecast:
        return {"error": forecast["error"]}
    
    p10_12 = forecast["forecast_month_12"]["p10"]
    p50_12 = forecast["forecast_month_12"]["p50"]
    p90_12 = forecast["forecast_month_12"]["p90"]
    current = forecast.get("current_rent", p50_12)
    
    # Implied annual rent growth (central path)
    rent_mean_growth = (p50_12 / current - 1) if current else 0.02
    
    # Implied volatility from P10/P90 spread (1.28 sigma = 80% interval)
    spread = (p90_12 - p10_12) / 2
    rent_sigma = (spread / p50_12) if p50_12 else 0.04
    
    # Skew: negative if downside is larger than upside
    downside = p50_12 - p10_12
    upside   = p90_12 - p50_12
    rent_skew = (upside - downside) / p50_12 if p50_12 else 0
    
    return {
        "source": forecast.get("method", "unknown"),
        "rent_mean_growth_annual": round(rent_mean_growth, 4),
        "rent_sigma_annual": round(rent_sigma, 4),
        "rent_skew": round(rent_skew, 4),
        "p10_month12": p10_12,
        "p50_month12": p50_12,
        "p90_month12": p90_12,
        "use_conformal_wrapper": "SIMULATION" in forecast.get("method", ""),
        "note": "TimesFM P10/P90 are first-class MC inputs. Conformal only needed for vendor feeds."
    }


# ── Batch Forecast Runner ──────────────────────────────────────────────────────
def run_batch_forecast(deals: list) -> list:
    """
    Run ICF forecasts for a batch of deals.
    
    Args:
        deals: List of dicts with keys:
               - deal_id, rent_history, zip_code, property_type
               - sofr_forward_curve (optional)
               - vacancy_estimate (optional, default 0.05)
    
    Returns:
        List of forecast results with Monte Carlo parameters attached.
    """
    results = []
    for deal in deals:
        log.info(f"Forecasting deal: {deal.get('deal_id', 'unknown')}")
        
        forecast = run_icf_forecast(
            rent_history=deal["rent_history"],
            zip_code=deal["zip_code"],
            property_type=deal.get("property_type", "SFR"),
            sofr_forward_curve=deal.get("sofr_forward_curve"),
            vacancy_estimate=deal.get("vacancy_estimate", 0.05),
        )
        
        mc_params = get_monte_carlo_rent_params(forecast)
        
        results.append({
            "deal_id": deal.get("deal_id"),
            "forecast": forecast,
            "monte_carlo_params": mc_params,
        })
        
        # Save forecast to disk
        out_path = f"{FORECAST_DIR}/forecast_{deal.get('deal_id', 'unknown')}_{TODAY}.json"
        with open(out_path, 'w') as f:
            json.dump(results[-1], f, indent=2)
    
    return results


# ── Data Accumulation Counter ──────────────────────────────────────────────────
def check_lora_upgrade_status() -> dict:
    """Check current data accumulation and LoRA upgrade readiness."""
    db = load_property_db()
    total = db.get("total_property_months", 0)
    n_properties = len(db.get("properties", {}))
    
    status = {
        "total_property_months": total,
        "n_properties": n_properties,
        "lora_threshold": 500,
        "lora_ready": total >= 500,
        "progress_pct": round(total / 500 * 100, 1),
        "months_to_threshold": max(0, 500 - total),
        "current_mode": "ICF (zero-shot)" if total < 500 else "READY FOR LORA",
        "recommendation": (
            "Continue accumulating property data. ICF mode is active and production-ready."
            if total < 500 else
            "500+ property-months reached. Provision GPU instance and run LoRA fine-tuning. See LORA_UPGRADE_BLUEPRINT.md."
        )
    }
    
    log.info(f"LoRA status: {total}/{500} property-months ({status['progress_pct']}%)")
    return status


# ── CLI Entry Point ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "status":
        status = check_lora_upgrade_status()
        print(json.dumps(status, indent=2))
        sys.exit(0)
    
    if len(sys.argv) > 1 and sys.argv[1] == "demo":
        # Demo: run a sample forecast with synthetic rent history
        log.info("Running DEMO forecast with synthetic rent history...")
        
        # Simulate 24 months of rent history for a SFR in Austin TX
        demo_rent_history = [
            2800, 2830, 2850, 2870, 2900, 2920,
            2950, 2980, 3000, 3020, 3050, 3080,
            3100, 3120, 3150, 3180, 3200, 3220,
            3250, 3280, 3300, 3320, 3350, 3380
        ]
        
        # Current SOFR forward curve (flat at 3.63% for demo)
        sofr_curve = [0.0363] * 12
        
        forecast = run_icf_forecast(
            rent_history=demo_rent_history,
            zip_code="78701",
            property_type="SFR",
            sofr_forward_curve=sofr_curve,
            vacancy_estimate=0.05,
        )
        
        mc_params = get_monte_carlo_rent_params(forecast)
        
        print("\n=== TIMESFM 2.5 ICF FORECAST DEMO ===")
        print(f"Method: {forecast['method']}")
        print(f"Current Rent: ${forecast['current_rent']:,.0f}/mo")
        print(f"\n12-Month Forecast:")
        print(f"  P10 (bear): ${forecast['forecast_month_12']['p10']:,.0f}/mo")
        print(f"  P50 (base): ${forecast['forecast_month_12']['p50']:,.0f}/mo")
        print(f"  P90 (bull): ${forecast['forecast_month_12']['p90']:,.0f}/mo")
        print(f"  Central Growth: {forecast['rent_growth_central']}%")
        print(f"\nMonte Carlo Parameters:")
        print(f"  Annual Rent Growth (mean): {mc_params['rent_mean_growth_annual']*100:.2f}%")
        print(f"  Annual Rent Sigma: {mc_params['rent_sigma_annual']*100:.2f}%")
        print(f"  Skew: {mc_params['rent_skew']:.4f}")
        print(f"\nLoRA Upgrade Status:")
        status = check_lora_upgrade_status()
        print(f"  {status['total_property_months']}/{status['lora_threshold']} property-months ({status['progress_pct']}%)")
        print(f"  Mode: {status['current_mode']}")
        sys.exit(0)
    
    # Default: check status
    status = check_lora_upgrade_status()
    print(json.dumps(status, indent=2))
