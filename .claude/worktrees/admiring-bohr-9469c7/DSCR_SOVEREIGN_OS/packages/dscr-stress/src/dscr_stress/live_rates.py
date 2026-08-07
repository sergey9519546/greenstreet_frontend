"""Live SOFR / Treasury rate fetcher.

Pulls live reference rates from the New York Fed SOFR API and FRED CSV
endpoints. These are the two FREE primary sources for ARM index forecasts:

    - NY Fed SOFR: https://markets.newyorkfed.org/api/rates/unsecured/sofr/last/1.json
    - FRED CSV: https://fred.stlouisfed.org/graph/fredgraph.csv?id={SERIES}

The fetcher:
    1. Tries live fetch with timeout
    2. Falls back to cached values from the most recent successful call
    3. Falls back to documented "as of" defaults (last known good values)
    4. Never blocks — returns a RateSnapshot with stale=False if live, True if fallback

Spec source:
    - RESEARCH/godmode_20260618/15_T15_real_time_data/12_source_inventory.md
    - DSCR Sovereign OS Sprint 5 Module 1 (live data APIs)

All values annualized (decimal). SOFR publication is daily at ~8 AM ET.
"""

from __future__ import annotations

import json
import math
from dataclasses import dataclass, field
from datetime import UTC, date, datetime
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

NY_FED_SOFR_LAST_1 = "https://markets.newyorkfed.org/api/rates/unsecured/sofr/last/1.json"

# FRED CSV series endpoints
FRED_BASE = "https://fred.stlouisfed.org/graph/fredgraph.csv"

FRED_SERIES = {
    "MORTGAGE30US": f"{FRED_BASE}?id=MORTGAGE30US",
    "MORTGAGE15US": f"{FRED_BASE}?id=MORTGAGE15US",
    "DGS10": f"{FRED_BASE}?id=DGS10",  # 10-yr Treasury
    "DGS2": f"{FRED_BASE}?id=DGS2",  # 2-yr Treasury
    "DFF": f"{FRED_BASE}?id=DFF",  # Fed Funds
    "SOFR30DAYAVG": f"{FRED_BASE}?id=SOFR30DAYAVG",  # 30-day SOFR avg
}

# FRED values are annualized percent (e.g., "6.47" for 6.47%)
# NY Fed SOFR values are annualized percent too

# Documented fallback rates (as of 2026-06-17, from Sprint 5 module)
FALLBACK_RATES: dict[str, float] = {
    # SOFR curve (from SOFR/Tradition Data, June 17 2026)
    "sofr_1m": 0.03637,
    "sofr_3m": 0.03668,
    "sofr_6m": 0.03731,
    "sofr_12m": 0.03869,
    "sofr_2y": 0.03644,
    "sofr_5y": 0.03685,
    "sofr_10y": 0.03751,
    "sofr_30y": 0.03884,
    # Treasury (from FRED, June 16 2026)
    "treasury_2y": 0.0395,
    "treasury_10y": 0.0443,
    # Mortgage (from Freddie PMMS, June 18 2026)
    "mortgage_30yr": 0.0647,
    "mortgage_15yr": 0.0577,
}

DEFAULT_TIMEOUT_SEC = 5.0
DEFAULT_CACHE_PATH = Path.home() / ".cache" / "dscr_stress_rates.json"


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------


@dataclass
class RateSnapshot:
    """A snapshot of ARM-relevant reference rates at a point in time."""

    as_of: date  # Date these rates are valid for
    source: str  # "NY Fed live", "FRED live", "fallback", "cache"
    rates: dict[str, float]  # series -> annualized rate (decimal)
    is_stale: bool = False  # True if rates are not from live fetch
    fetched_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    def get(self, series: str, default: float | None = None) -> float | None:
        """Get a rate by series name. Returns default if not present."""
        return self.rates.get(series, default)


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------


def _is_finite(x, name: str) -> None:
    if x is None or (isinstance(x, float) and (math.isnan(x) or math.isinf(x))):
        raise ValueError(f"{name} must be finite, got {x}")


def _validate_rate(rate: float, name: str) -> None:
    _is_finite(rate, name)
    if rate < -0.05 or rate > 0.30:
        raise ValueError(f"{name} must be in [-5%, 30%]; got {rate:.4%}")


# ---------------------------------------------------------------------------
# Fetchers
# ---------------------------------------------------------------------------


def _fetch_with_timeout(url: str, timeout: float = DEFAULT_TIMEOUT_SEC) -> bytes:
    """HTTP GET with timeout. Returns raw bytes."""
    req = Request(url, headers={"User-Agent": "DSCR-Sovereign-OS/0.4.0"})
    with urlopen(req, timeout=timeout) as resp:
        return resp.read()


def fetch_ny_fed_sofr(timeout: float = DEFAULT_TIMEOUT_SEC) -> dict[str, float]:
    """Fetch the latest SOFR rates from NY Fed API.

    Returns:
        Dict mapping tenor (e.g., '1d', '1m', '3m', 'sofr30dayavg') to
        annualized rate as decimal (e.g., 0.03637 for 3.637%).

    Raises:
        URLError, TimeoutError, OSError on network failure
        ValueError on malformed response
    """
    data = _fetch_with_timeout(NY_FED_SOFR_LAST_1, timeout)
    payload = json.loads(data)

    # NY Fed response format: {"sofr": [{"effectiveDate": "...", "percentRate": "...", ...}]}
    # The 'last/1' endpoint returns the most recent 1 day
    rates = {}
    records = payload.get("sofr", [])
    if not records:
        raise ValueError("NY Fed response contains no SOFR records")
    rec = records[0]
    # Map common fields
    for tenor in ("percentRate", "percent1", "percent30", "percent90", "percent180"):
        if tenor in rec:
            # NY Fed returns rates as percent strings (e.g., "3.63")
            try:
                rate_decimal = float(rec[tenor]) / 100.0
                rates[tenor] = rate_decimal
            except (TypeError, ValueError):
                continue
    # The standard 'last 1 day' just gives the daily SOFR; rate stored as 'daily'
    if "percentRate" in rec:
        rates["daily"] = float(rec["percentRate"]) / 100.0
    return rates


def fetch_fred_csv(series_id: str, timeout: float = DEFAULT_TIMEOUT_SEC) -> tuple[date, float]:
    """Fetch the latest observation from a FRED CSV endpoint.

    Returns:
        Tuple of (observation_date, annualized_rate_decimal)

    Raises:
        URLError, TimeoutError, OSError on network failure
        ValueError on malformed response
    """
    if series_id not in FRED_SERIES:
        raise ValueError(f"Unknown FRED series '{series_id}'")
    data = _fetch_with_timeout(FRED_SERIES[series_id], timeout).decode("utf-8")
    # CSV format: DATE,VALUE (skip header)
    lines = [
        ln for ln in data.splitlines() if ln and not ln.startswith("DATE,") and ln != "DATE,VALUE"
    ]
    if not lines:
        raise ValueError(f"FRED response for {series_id} has no data rows")
    # Last non-empty line is most recent
    last = lines[-1]
    parts = last.split(",")
    if len(parts) < 2:
        raise ValueError(f"Malformed FRED CSV row: {last!r}")
    obs_date = datetime.strptime(parts[0], "%Y-%m-%d").date()
    value_str = parts[1].strip()
    if value_str == "." or value_str == "":
        raise ValueError(f"FRED value missing for {series_id} on {obs_date}")
    value_decimal = float(value_str) / 100.0
    _validate_rate(value_decimal, series_id)
    return obs_date, value_decimal


def fetch_rate_snapshot(
    include_sofr_curve: bool = True,
    use_cache: bool = True,
    cache_path: Path = DEFAULT_CACHE_PATH,
    timeout: float = DEFAULT_TIMEOUT_SEC,
) -> RateSnapshot:
    """Fetch a complete ARM-relevant rate snapshot.

    Tries live fetch first; falls back to cache; falls back to hardcoded defaults.

    Args:
        include_sofr_curve: if True, attempt to fetch full SOFR curve
            (1m, 3m, 6m, 12m, 2y, 5y, 10y, 30y). Otherwise only daily SOFR.
        use_cache: if True, save successful fetches to cache and load on failure.
        cache_path: where to store the cache
        timeout: HTTP timeout per fetch

    Returns:
        RateSnapshot with as_of date, source, and rates dict
    """
    rates: dict[str, float] = {}
    is_stale = False
    source = "unknown"

    # Attempt live SOFR fetch
    try:
        sofr_rates = fetch_ny_fed_sofr(timeout=timeout)
        rates.update(sofr_rates)
        source = "NY Fed live"
    except (URLError, TimeoutError, OSError, ValueError, json.JSONDecodeError) as e:
        is_stale = True
        source = f"fallback ({type(e).__name__})"

    # Attempt live Treasury fetches (used for DGS10 calibration + sanity)
    if include_sofr_curve:
        for series_id in ("DGS10", "DGS2", "SOFR30DAYAVG"):
            try:
                obs_date, rate = fetch_fred_csv(series_id, timeout=timeout)
                rates[series_id.lower()] = rate
            except (URLError, TimeoutError, OSError, ValueError):
                is_stale = True
                if source == "NY Fed live":
                    source = f"partial: NY Fed live, {series_id} failed"
                continue

    # If live fetch failed, try cache
    if not rates and use_cache and cache_path.exists():
        try:
            cached = json.loads(cache_path.read_text(encoding="utf-8"))
            rates = cached.get("rates", {})
            if rates:
                source = "cache"
                is_stale = True
        except (OSError, json.JSONDecodeError):
            pass

    # If still nothing, use hardcoded fallback
    if not rates:
        rates = dict(FALLBACK_RATES)
        source = "fallback (documented defaults)"
        is_stale = True

    # Determine as_of date
    if rates:
        # Use the rate snapshot's date if NY Fed live worked
        if "daily" in rates:
            as_of = date.today()
        else:
            as_of = date.today()
    else:
        as_of = date.today()

    snapshot = RateSnapshot(
        as_of=as_of,
        source=source,
        rates=rates,
        is_stale=is_stale,
    )

    # Save successful live fetches to cache
    if not is_stale and use_cache:
        try:
            cache_path.parent.mkdir(parents=True, exist_ok=True)
            cache_path.write_text(
                json.dumps(
                    {
                        "as_of": str(snapshot.as_of),
                        "rates": snapshot.rates,
                        "saved_at": datetime.now(UTC).isoformat(),
                    },
                    indent=2,
                ),
                encoding="utf-8",
            )
        except OSError:
            pass  # Cache save failure is non-fatal

    return snapshot


# ---------------------------------------------------------------------------
# SOFR curve extraction
# ---------------------------------------------------------------------------


def get_sofr_curve_from_snapshot(snapshot: RateSnapshot) -> dict[str, float]:
    """Extract the SOFR forward curve from a rate snapshot.

    Returns:
        Dict with tenor keys (1m, 3m, 6m, 12m, 2y, 5y, 10y, 30y) and
        decimal rates. Empty dict if SOFR curve not in snapshot.
    """
    curve_keys = ("1m", "3m", "6m", "12m", "2y", "5y", "10y", "30y")
    return {k: snapshot.rates[f"sofr_{k}"] for k in curve_keys if f"sofr_{k}" in snapshot.rates}


def get_sofr_horizons_years() -> dict[str, float]:
    """Standard SOFR curve horizons in years (for calibration)."""
    return {
        "1m": 1 / 12,
        "3m": 3 / 12,
        "6m": 6 / 12,
        "12m": 1.0,
        "2y": 2.0,
        "5y": 5.0,
        "10y": 10.0,
        "30y": 30.0,
    }


# ---------------------------------------------------------------------------
# Synthetic curve (for offline testing)
# ---------------------------------------------------------------------------


def synthetic_sofr_curve(
    flat_rate: float = 0.0365,
) -> dict[str, float]:
    """Build a synthetic flat SOFR curve for offline testing.

    Returns:
        Dict with tenor keys matching get_sofr_curve_from_snapshot format.
    """
    _validate_rate(flat_rate, "flat_rate")
    return {k: flat_rate for k in get_sofr_horizons_years()}


__all__ = [
    "RateSnapshot",
    "NY_FED_SOFR_LAST_1",
    "FRED_BASE",
    "FRED_SERIES",
    "FALLBACK_RATES",
    "DEFAULT_CACHE_PATH",
    "fetch_ny_fed_sofr",
    "fetch_fred_csv",
    "fetch_rate_snapshot",
    "get_sofr_curve_from_snapshot",
    "get_sofr_horizons_years",
    "synthetic_sofr_curve",
]
