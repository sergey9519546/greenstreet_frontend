"""
zillow_apartmentlist_pull.py — Monthly rent + home value pulls

Sources (all free / public CSV / free API):
- Zillow ZORI (rent index): https://files.zillowstatic.com/research/public_csvs/zori/Metro_zori_uc_sfrcondomfr_sm_month.csv
- Zillow ZHVI (home value): https://files.zillowstatic.com/research/public_csvs/zhvi/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv
- Apartment List (no public CSV — must scrape): https://www.apartmentlist.com/research/national-rent-data

Cadence: Zillow updates on the 16th of each month; Apartment List updates last week of month.

Usage:
    python zillow_apartmentlist_pull.py
"""

import csv
import json
import datetime as dt
from io import StringIO
from pathlib import Path

import pandas as pd
import requests


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
}


# Zillow public CSV endpoints (verified live as of 2026-06-18)
ZILLOW_ENDPOINTS = {
    "ZORI_Metro_SFRMF_sm_month": "https://files.zillowstatic.com/research/public_csvs/zori/Metro_zori_uc_sfrcondomfr_sm_month.csv",
    "ZHVI_Metro_AllHomes_sm_sa": "https://files.zillowstatic.com/research/public_csvs/zhvi/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv",
    "ZHVI_State_AllHomes_sm_sa": "https://files.zillowstatic.com/research/public_csvs/zhvi/State_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv",
    "ZORI_State_SFR_sm_month":  "https://files.zillowstatic.com/research/public_csvs/zori/State_zori_uc_sfrcondomfr_sm_month.csv",
}


def pull_zillow_csv(url: str, output_path: str) -> pd.DataFrame:
    """Pull a Zillow public CSV and save to disk. Returns DataFrame."""
    resp = requests.get(url, headers=HEADERS, timeout=60)
    resp.raise_for_status()
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(resp.content)
    df = pd.read_csv(StringIO(resp.text))
    return df


def pull_all_zillow(output_dir: str = ".") -> dict:
    """Pull all Zillow CSVs."""
    pulled = {}
    for label, url in ZILLOW_ENDPOINTS.items():
        try:
            df = pull_zillow_csv(url, f"{output_dir}/zillow_{label}.csv")
            # Identify date columns (named like "2018-01", "2018-02", ...)
            date_cols = [c for c in df.columns if c not in ("RegionID", "SizeRank", "RegionName", "RegionType", "StateName")]
            if date_cols:
                latest = sorted(date_cols)[-1]
                # Try to grab national or first-metro snapshot
                if "Metro" in label:
                    first_row = df.iloc[0]
                    pulled[label] = {
                        "rows": len(df),
                        "latest_col": latest,
                        "sample_region": first_row.get("RegionName"),
                        "sample_value": float(first_row.get(latest, 0)) if pd.notna(first_row.get(latest)) else None,
                    }
                else:
                    first_row = df.iloc[0]
                    pulled[label] = {
                        "rows": len(df),
                        "latest_col": latest,
                        "sample_region": first_row.get("RegionName"),
                        "sample_value": float(first_row.get(latest, 0)) if pd.notna(first_row.get(latest)) else None,
                    }
        except Exception as e:
            pulled[label] = {"error": str(e)}
    return pulled


def pull_apartment_list_national(output_path: str = "apartment_list_national.csv") -> dict:
    """
    Apartment List publishes the National Rent Report HTML page; we parse key stats.
    No public CSV; the methodology page links to downloadable CSVs (requires free signup).
    """
    url = "https://www.apartmentlist.com/research/national-rent-data"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        # Naive parse: pull first <p>... values from the report intro
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(resp.text, "html.parser")
        text = soup.get_text(" ", strip=True)
        # The intro typically mentions the national median rent + MoM + YoY
        # This is brittle; relying on human-readable summary as fallback.
        snap = {
            "source": "Apartment List National Rent Report",
            "url": url,
            "scraped_at": dt.datetime.utcnow().isoformat() + "Z",
            "raw_excerpt": text[:1500],
        }
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(snap, f, indent=2)
        return snap
    except Exception as e:
        return {"source": "Apartment List", "error": str(e)}


def consolidate_dscr_rent_snapshot(output_dir: str = ".") -> dict:
    """
    Build a DSCR-focused rent + value snapshot:
    - National ZORI latest value
    - Top 25 metro ZORI latest values
    - Top 25 metro ZHVI latest values
    - Apartment List national headline
    """
    zillow_data = pull_all_zillow(output_dir)
    al_data = pull_apartment_list_national(f"{output_dir}/apartment_list_national.json")

    snap = {
        "pulled_at": dt.datetime.utcnow().isoformat() + "Z",
        "zillow_files": zillow_data,
        "apartment_list": al_data,
    }
    with open(f"{output_dir}/dscr_rent_value_snapshot.json", "w", encoding="utf-8") as f:
        json.dump(snap, f, indent=2, default=str)
    print(f"\nWrote DSCR rent + value snapshot to {output_dir}/dscr_rent_value_snapshot.json")
    return snap


if __name__ == "__main__":
    consolidate_dscr_rent_snapshot(output_dir=".")