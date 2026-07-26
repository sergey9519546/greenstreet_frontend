"""
fred_api_integration.py — FRED API integration for DSCR rate anchors

Fetches 9 free time series relevant to DSCR pricing:
1. MORTGAGE30US — Freddie Mac 30-yr Fixed Rate Mortgage Average
2. MORTGAGE15US — Freddie Mac 15-yr Fixed Rate Mortgage Average
3. MORTGAGE5US  — Freddie Mac 5/1-Yr ARM
4. DGS10        — 10-yr Treasury Constant Maturity
5. DGS2         — 2-yr Treasury Constant Maturity
6. SOFR30DAYAVG — 30-Day Average SOFR (FRED-calculated; primary = NY Fed API)
7. DFF          — Federal Funds Effective Rate (Daily)
8. CSUSHPISA    — Case-Shiller U.S. National Home Price Index
9. HOUST        — New One-Family Houses Sold: United States

Requirements:
- Python 3.8+
- pip install fredapi pandas requests
- Free FRED API key from https://fredaccount.stlouisfed.org/apikeys

Usage:
    export FRED_API_KEY="your_key_here"
    python fred_api_integration.py
"""

import os
import json
import datetime as dt
from pathlib import Path

import pandas as pd
import requests

# Optional: official fredapi library wraps API
try:
    from fredapi import Fred
    FREDAPI_AVAILABLE = True
except ImportError:
    FREDAPI_AVAILABLE = False


# DSCR-relevant FRED series
DSCR_FRED_SERIES = {
    "MORTGAGE30US": "30-Year Fixed Rate Mortgage Average (Freddie PMMS)",
    "MORTGAGE15US": "15-Year Fixed Rate Mortgage Average (Freddie PMMS)",
    "MORTGAGE5US":  "5/1-Year ARM Rate (Freddie PMMS)",
    "DGS10":        "10-Year Treasury Constant Maturity Rate",
    "DGS2":         "2-Year Treasury Constant Maturity Rate",
    "SOFR30DAYAVG": "30-Day Average SOFR",
    "DFF":          "Federal Funds Effective Rate (Daily)",
    "CSUSHPISA":    "Case-Shiller U.S. National Home Price Index",
    "HOUST":        "New One-Family Houses Sold: United States (SAAR)",
}


def get_fred_data_httpx(series_id: str, api_key: str, observation_start: str = "2020-01-01") -> pd.DataFrame:
    """
    Direct HTTP pull (no library dependency).
    Endpoint: https://api.stlouisfed.org/fred/series/observations
    """
    url = "https://api.stlouisfed.org/fred/series/observations"
    params = {
        "series_id": series_id,
        "api_key": api_key,
        "file_type": "json",
        "observation_start": observation_start,
    }
    resp = requests.get(url, params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    obs = pd.DataFrame(data["observations"])
    obs["date"] = pd.to_datetime(obs["date"])
    obs["value"] = pd.to_numeric(obs["value"], errors="coerce")
    obs = obs[["date", "value"]].dropna()
    return obs


def get_fred_data_lib(series_id: str, api_key: str, observation_start: str = "2020-01-01") -> pd.DataFrame:
    """Use fredapi library (cleaner)."""
    if not FREDAPI_AVAILABLE:
        raise ImportError("fredapi not installed. Run: pip install fredapi")
    fred = Fred(api_key=api_key)
    s = fred.get_series(series_id, observation_start=observation_start)
    return pd.DataFrame({"date": s.index, "value": s.values})


def pull_dscr_snapshot(api_key: str, output_path: str = None) -> dict:
    """
    Pull latest observation for each DSCR-relevant FRED series.
    Returns dict of {series_id: {date, value, name}}.
    """
    snapshot = {}
    for sid, name in DSCR_FRED_SERIES.items():
        try:
            df = get_fred_data_httpx(sid, api_key, observation_start="2025-01-01")
            if df.empty:
                snapshot[sid] = {"name": name, "error": "no_data"}
                continue
            latest = df.iloc[-1]
            snapshot[sid] = {
                "name": name,
                "date": latest["date"].strftime("%Y-%m-%d"),
                "value": float(latest["value"]),
            }
        except Exception as e:
            snapshot[sid] = {"name": name, "error": str(e)}
    snapshot["_pulled_at"] = dt.datetime.utcnow().isoformat() + "Z"
    snapshot["_source"] = "FRED API (Federal Reserve Bank of St. Louis)"

    if output_path:
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w") as f:
            json.dump(snapshot, f, indent=2)

    return snapshot


def pull_dscr_history(api_key: str, output_path: str = "dscr_fred_history.csv") -> pd.DataFrame:
    """
    Pull full history (since 2020-01-01) for all DSCR series, merged on date.
    Output: tidy DataFrame with columns [date, series_id, value].
    """
    frames = []
    for sid in DSCR_FRED_SERIES:
        df = get_fred_data_httpx(sid, api_key, observation_start="2020-01-01")
        df["series_id"] = sid
        df["series_name"] = DSCR_FRED_SERIES[sid]
        frames.append(df)
    big = pd.concat(frames, ignore_index=True)
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    big.to_csv(output_path, index=False)
    return big


if __name__ == "__main__":
    api_key = os.environ.get("FRED_API_KEY")
    if not api_key:
        raise SystemExit(
            "Set FRED_API_KEY environment variable.\n"
            "Get a free key at: https://fredaccount.stlouisfed.org/apikeys"
        )

    # Pull snapshot
    snap = pull_dscr_snapshot(api_key, output_path="dscr_fred_snapshot.json")
    print("\n=== DSCR FRED Snapshot ===")
    for sid, info in snap.items():
        if sid.startswith("_"):
            continue
        if "error" in info:
            print(f"  {sid:20s} ERROR: {info['error']}")
        else:
            print(f"  {sid:20s} {info['date']} = {info['value']:>10.4f}  {info['name']}")

    # Pull history
    print("\n=== Pulling history (since 2020-01-01) ===")
    hist = pull_dscr_history(api_key)
    print(f"Wrote {len(hist)} rows to dscr_fred_history.csv")

    # Compute quick DSCR-relevant spread
    snap30 = snap.get("MORTGAGE30US", {}).get("value")
    snap10y = snap.get("DGS10", {}).get("value")
    snap_sofr = snap.get("SOFR30DAYAVG", {}).get("value")
    if all(isinstance(v, float) for v in (snap30, snap10y, snap_sofr)):
        print(f"\n30-yr Mortgage - 10-yr Treasury spread = {snap30 - snap10y:.2f} ppt")
        print(f"30-yr Mortgage - SOFR spread           = {snap30 - snap_sofr:.2f} ppt")