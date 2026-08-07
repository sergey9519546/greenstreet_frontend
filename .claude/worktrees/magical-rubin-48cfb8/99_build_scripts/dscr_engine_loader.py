"""
Unified DSCR Engine Data Loader
Loads ALL real datasets into a single SQLite database (dscr_engine.db)
Source: 00_engine/data/{national,florida,california,airbnb,loan_performance,...}/

Output: data/processed/dscr_engine.db (~50-100 MB indexed)

Tables created:
  - nfip_claims        (FEMA NFIP redacted claims, ~347K rows)
  - zillow_zori        (Zillow Observed Rent Index by ZIP × month)
  - zillow_zhvi        (Zillow Home Value Index by ZIP × month)
  - rdc_inventory      (Realtor.com inventory core metrics by ZIP × month)
  - calfire_dins       (CA wildfire damage inspections)
  - airbnb_listings    (Inside Airbnb listings for STR comps)
  - treasury_fio       (FIO homeowners insurance by ZIP × year)
  - hud_safmr          (HUD Small Area Fair Market Rents)
  - fannie_mae_sf      (Fannie Mae single-family loan performance sample)
"""

import os
import sys
import gzip
import sqlite3
import time
import logging
from pathlib import Path

import pandas as pd
import numpy as np

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)


# ============================================================
# CONFIGURATION
# ============================================================

WORKSPACE = Path(r"C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE")
DATA_ROOT = WORKSPACE / "00_engine" / "data"
DB_PATH = DATA_ROOT / "dscr_engine.db"

# Source file paths
SOURCES = {
    "nfip_national": DATA_ROOT / "national" / "FEMA_NFIP_Redacted_Claims_All_States.csv",
    "nfip_fl":       DATA_ROOT / "florida" / "florida" / "fema_flood" / "FEMA_NFIP_Redacted_Claims_FL.csv",
    "nfip_ca":       DATA_ROOT / "california" / "california" / "fema_flood" / "FEMA_NFIP_Redacted_Claims_CA.csv",

    "zillow_zori_national":  DATA_ROOT / "national" / "zillow_zori" / "Zip_zori_uc_sfrcondomfr_sm_month.csv",
    "zillow_zori_ca":        DATA_ROOT / "california" / "california" / "zillow_zori_filtered" / "zillow_zori_zip_CA_953_zips.csv",
    "zillow_zori_fl":        DATA_ROOT / "florida" / "florida" / "zillow_zori_filtered" / "zillow_zori_zip_FL_691_zips.csv",

    "zillow_zhvi_ca":        DATA_ROOT / "california" / "california" / "zillow_zori_filtered" / "zillow_zhvi_zip_CA_1543_zips.csv",
    "zillow_zhvi_fl":        DATA_ROOT / "florida" / "florida" / "zillow_zori_filtered" / "zillow_zhvi_zip_FL_924_zips.csv",

    "rdc_history_national":  DATA_ROOT / "national" / "_realtor_raw" / "RDC_Inventory_Core_Metrics_Zip_History.csv",
    "rdc_history_ca":        DATA_ROOT / "california" / "california" / "state_open_data" / "realtor_RDC_Inventory_Core_Metrics_Zip_History_CA.csv",
    "rdc_history_fl":        DATA_ROOT / "florida" / "florida" / "state_open_data" / "realtor_RDC_Inventory_Core_Metrics_Zip_History_FL.csv",

    "calfire_dins":          DATA_ROOT / "california" / "california" / "state_open_data" / "CALFIRE_DINS_Damage_Inspections.csv",

    "airbnb_broward":        DATA_ROOT / "airbnb" / "inside_airbnb" / "broward_county_fl_listings.csv",
    "airbnb_broward_detail": DATA_ROOT / "airbnb" / "inside_airbnb" / "broward_county_fl_listings_detailed.csv.gz",
    "airbnb_nashville":      DATA_ROOT / "airbnb" / "inside_airbnb" / "nashville_listings.csv",
    "airbnb_nashville_detail": DATA_ROOT / "airbnb" / "inside_airbnb" / "nashville_listings_detailed.csv.gz",
    "airbnb_la":             DATA_ROOT / "california" / "california" / "inside_airbnb" / "los-angeles_listings.csv",
    "airbnb_la_detail":      DATA_ROOT / "california" / "california" / "inside_airbnb" / "los-angeles_listings_detailed.csv.gz",
    "airbnb_sd":             DATA_ROOT / "california" / "california" / "inside_airbnb" / "san-diego_listings.csv",
    "airbnb_sd_detail":      DATA_ROOT / "california" / "california" / "inside_airbnb" / "san-diego_listings_detailed.csv.gz",
    "airbnb_sf":             DATA_ROOT / "california" / "california" / "inside_airbnb" / "san-francisco_listings.csv",
    "airbnb_sf_detail":      DATA_ROOT / "california" / "california" / "inside_airbnb" / "san-francisco_listings_detailed.csv.gz",

    "treasury_fio_fl":       DATA_ROOT / "florida" / "florida" / "treasury_fio_filtered" / "treasury_fio_homeowners_insurance_FL_2560_rows.csv",
    "treasury_fio_ca":       DATA_ROOT / "california" / "california" / "treasury_fio_filtered" / "treasury_fio_homeowners_insurance_CA_4700_rows.csv",
    "treasury_fio_xlsx":     DATA_ROOT / "insurance" / "treasury_fio" / "Supporting_Underlying_Metrics_FIO_Homeowners_Insurance_2018-2022.xlsx",

    "hud_safmr_fl":          DATA_ROOT / "florida" / "florida" / "hud" / "FY2026_SAFMRs_revised_FL_747_zips.csv",

    "fannie_mae_sf":         DATA_ROOT / "loan_performance" / "dscr_extra" / "fanniemae_single_family" / "FannieMae_SF_Loan_Performance_Sample.csv",
}


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def table_exists(con, name):
    cur = con.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (name,))
    return cur.fetchone() is not None


def drop_table(con, name):
    if table_exists(con, name):
        con.execute(f"DROP TABLE {name}")
        log.info(f"  Dropped {name}")


def report_table(con, name):
    if table_exists(con, name):
        cur = con.execute(f"SELECT COUNT(*) FROM {name}")
        n = cur.fetchone()[0]
        size_mb = (DB_PATH).stat().st_size / 1024 / 1024
        log.info(f"  ✓ {name}: {n:,} rows  (DB size: {size_mb:.1f} MB)")
        return n
    return 0


# ============================================================
# LOADERS
# ============================================================

def load_nfip_claims(con):
    """Load FEMA NFIP claims — chunked for the big national file."""
    log.info("=" * 70)
    log.info("LOADING FEMA NFIP claims")
    log.info("=" * 70)

    drop_table(con, "nfip_claims")

    # Define columns we care about (subset of 75)
    keep_cols = [
        "id", "asOfDate", "dateOfLoss", "yearOfLoss",
        "ratedFloodZone", "floodZoneCurrent",
        "occupancyType", "rentalPropertyIndicator",
        "amountPaidOnBuildingClaim", "amountPaidOnContentsClaim",
        "totalBuildingInsuranceCoverage", "totalContentsInsuranceCoverage",
        "buildingPropertyValue", "waterDepth", "elevationDifference",
        "baseFloodElevation", "causeOfDamage", "floodEvent",
        "floodWaterDuration", "numberOfUnits",
        "state", "reportedCity", "reportedZipCode",
        "countyCode", "latitude", "longitude",
        "primaryResidenceIndicator", "smallBusinessIndicatorBuilding",
        "nonProfitIndicator", "houseWorship", "agricultureStructureIndicator",
    ]

    # Combine national + FL + CA into one table (use INSERT OR IGNORE on id)
    total_loaded = 0
    sources = [
        ("national", SOURCES["nfip_national"]),
        ("FL",       SOURCES["nfip_fl"]),
        ("CA",       SOURCES["nfip_ca"]),
    ]

    for src_label, path in sources:
        if not path.exists():
            log.warning(f"  MISSING: {path}")
            continue
        log.info(f"  Reading {src_label}: {path.name}")
        t0 = time.time()
        # Read in chunks
        chunks = pd.read_csv(
            path,
            chunksize=10000,
            usecols=lambda c: c in keep_cols or c == keep_cols[0],
            low_memory=False,
            dtype=str,  # safest with so many edge cases
        )
        first = True
        rows = 0
        for chunk in chunks:
            # Only keep the columns we want
            chunk = chunk[[c for c in keep_cols if c in chunk.columns]]
            # Add source label
            chunk["source_dataset"] = src_label
            if first:
                chunk.to_sql("nfip_claims", con, if_exists="replace", index=False)
                first = False
            else:
                chunk.to_sql("nfip_claims", con, if_exists="append", index=False)
            rows += len(chunk)
        log.info(f"    Loaded {rows:,} rows in {time.time()-t0:.1f}s")
        total_loaded += rows

    # Indexes
    log.info("  Building indexes on nfip_claims...")
    con.execute("CREATE INDEX IF NOT EXISTS idx_nfip_zip ON nfip_claims(reportedZipCode)")
    con.execute("CREATE INDEX IF NOT EXISTS idx_nfip_state ON nfip_claims(state)")
    con.execute("CREATE INDEX IF NOT EXISTS idx_nfip_year ON nfip_claims(yearOfLoss)")
    con.execute("CREATE INDEX IF NOT EXISTS idx_nfip_zone ON nfip_claims(ratedFloodZone)")
    con.execute("CREATE INDEX IF NOT EXISTS idx_nfip_rental ON nfip_claims(rentalPropertyIndicator)")
    con.commit()

    return total_loaded


def load_zillow_wide_to_long(con, source_key, measure_type):
    """Load Zillow wide-format CSV and melt to long format.

    Wide format: RegionID, RegionName, ..., 2015-01-31, 2015-02-31, ...
    Long format: RegionID, RegionName, State, City, Metro, CountyName, month, value, measure_type
    """
    log.info(f"  Loading {source_key} ({measure_type})...")
    path = SOURCES[source_key]
    if not path.exists():
        log.warning(f"    MISSING: {path}")
        return 0

    t0 = time.time()
    # First, identify the month columns by trying to parse first row
    df_head = pd.read_csv(path, nrows=0)
    month_cols = [c for c in df_head.columns if c[:4].isdigit() and len(c) >= 10]

    # Read full
    df = pd.read_csv(path, low_memory=False)
    log.info(f"    Read {len(df):,} rows × {len(df.columns)} cols, {len(month_cols)} month cols")

    # Drop rows where ALL month values are NaN
    df_months = df[month_cols]
    has_data = df_months.notna().any(axis=1)
    df = df[has_data].reset_index(drop=True)
    log.info(f"    After dropping empty rows: {len(df):,}")

    # Melt
    id_cols = ["RegionID", "SizeRank", "RegionName", "RegionType",
               "StateName", "State", "City", "Metro", "CountyName"]
    id_cols = [c for c in id_cols if c in df.columns]

    long = df.melt(
        id_vars=id_cols,
        value_vars=month_cols,
        var_name="month",
        value_name="value",
    )
    long = long.dropna(subset=["value"])
    long["measure_type"] = measure_type
    log.info(f"    Long format: {len(long):,} rows")

    # Write to DB
    table_name = "zillow_zori" if measure_type == "ZORI" else "zillow_zhvi"
    if_exists = "replace" if not table_exists(con, table_name) else "append"
    long.to_sql(table_name, con, if_exists=if_exists, index=False)

    log.info(f"    Loaded in {time.time()-t0:.1f}s")
    return len(long)


def load_zillow_all(con):
    log.info("=" * 70)
    log.info("LOADING Zillow (ZORI rents + ZHVI home values)")
    log.info("=" * 70)

    drop_table(con, "zillow_zori")
    drop_table(con, "zillow_zhvi")

    # ZORI (rents)
    for key in ["zillow_zori_national", "zillow_zori_ca", "zillow_zori_fl"]:
        load_zillow_wide_to_long(con, key, "ZORI")

    # ZHVI (home values) — only have CA and FL filtered
    for key in ["zillow_zhvi_ca", "zillow_zhvi_fl"]:
        load_zillow_wide_to_long(con, key, "ZHVI")

    # Indexes
    log.info("  Building indexes on Zillow tables...")
    con.execute("CREATE INDEX IF NOT EXISTS idx_zori_zip ON zillow_zori(RegionName)")
    con.execute("CREATE INDEX IF NOT EXISTS idx_zori_state ON zillow_zori(State)")
    con.execute("CREATE INDEX IF NOT EXISTS idx_zori_month ON zillow_zori(month)")
    con.execute("CREATE INDEX IF NOT EXISTS idx_zhvi_zip ON zillow_zhvi(RegionName)")
    con.execute("CREATE INDEX IF NOT EXISTS idx_zhvi_state ON zillow_zhvi(State)")
    con.commit()


def load_realtor_rdc(con):
    """Load Realtor RDC inventory core metrics. Long format already."""
    log.info("=" * 70)
    log.info("LOADING Realtor RDC inventory core metrics")
    log.info("=" * 70)

    drop_table(con, "rdc_inventory")

    sources = [
        ("national", SOURCES["rdc_history_national"]),
        ("CA",       SOURCES["rdc_history_ca"]),
        ("FL",       SOURCES["rdc_history_fl"]),
    ]

    total = 0
    for src_label, path in sources:
        if not path.exists():
            log.warning(f"  MISSING: {path}")
            continue
        log.info(f"  Reading {src_label}: {path.name}")
        t0 = time.time()
        # Already long-format
        df = pd.read_csv(path, low_memory=False)
        df["source_dataset"] = src_label
        # postal_code as text for leading-zero ZIPs (e.g. 01234)
        df["postal_code"] = df["postal_code"].astype(str).str.zfill(5)
        log.info(f"    Read {len(df):,} rows")
        if_exists = "replace" if src_label == "national" else "append"
        df.to_sql("rdc_inventory", con, if_exists=if_exists, index=False)
        log.info(f"    Loaded in {time.time()-t0:.1f}s")
        total += len(df)

    # Indexes
    log.info("  Building indexes on rdc_inventory...")
    con.execute("CREATE INDEX IF NOT EXISTS idx_rdc_zip ON rdc_inventory(postal_code)")
    con.execute("CREATE INDEX IF NOT EXISTS idx_rdc_month ON rdc_inventory(month_date_yyyymm)")
    con.commit()

    return total


def load_calfire(con):
    log.info("=" * 70)
    log.info("LOADING CALFIRE DINS (CA wildfire damage inspections)")
    log.info("=" * 70)

    drop_table(con, "calfire_dins")

    path = SOURCES["calfire_dins"]
    if not path.exists():
        log.warning(f"  MISSING: {path}")
        return 0

    t0 = time.time()
    # Pipe-delimited? No, CSV
    df = pd.read_csv(path, low_memory=False)
    log.info(f"  Read {len(df):,} rows × {len(df.columns)} cols")
    df.to_sql("calfire_dins", con, if_exists="replace", index=False)
    log.info(f"  Loaded in {time.time()-t0:.1f}s")

    # Indexes
    con.execute("CREATE INDEX IF NOT EXISTS idx_calfire_zip ON calfire_dins([Zip Code])")
    con.execute("CREATE INDEX IF NOT EXISTS idx_calfire_county ON calfire_dins(County)")
    con.execute("CREATE INDEX IF NOT EXISTS idx_calfire_hazard ON calfire_dins([Hazard Type])")
    con.commit()

    return len(df)


def load_airbnb_all(con):
    log.info("=" * 70)
    log.info("LOADING Inside Airbnb listings (for STR comps)")
    log.info("=" * 70)

    drop_table(con, "airbnb_listings")

    sources = [
        ("broward_FL", SOURCES["airbnb_broward"], None),
        ("broward_FL_detail", None, SOURCES["airbnb_broward_detail"]),
        ("nashville_TN", SOURCES["airbnb_nashville"], None),
        ("nashville_TN_detail", None, SOURCES["airbnb_nashville_detail"]),
        ("los_angeles_CA", SOURCES["airbnb_la"], None),
        ("los_angeles_CA_detail", None, SOURCES["airbnb_la_detail"]),
        ("san_diego_CA", SOURCES["airbnb_sd"], None),
        ("san_diego_CA_detail", None, SOURCES["airbnb_sd_detail"]),
        ("san_francisco_CA", SOURCES["airbnb_sf"], None),
        ("san_francisco_CA_detail", None, SOURCES["airbnb_sf_detail"]),
    ]

    total = 0
    for label, csv_path, gz_path in sources:
        path = csv_path or gz_path
        if not path or not path.exists():
            log.warning(f"  MISSING: {path}")
            continue

        t0 = time.time()
        try:
            if path.suffix == ".gz":
                df = pd.read_csv(path, compression="gzip", low_memory=False)
            else:
                df = pd.read_csv(path, low_memory=False)
            df["market"] = label
            df["source_file"] = path.name
            log.info(f"    {label}: {len(df):,} rows × {len(df.columns)} cols")
            df.to_sql("airbnb_listings", con, if_exists="append", index=False)
            total += len(df)
            log.info(f"      Loaded in {time.time()-t0:.1f}s")
        except Exception as e:
            log.error(f"    FAILED {label}: {e}")

    # Indexes
    con.execute("CREATE INDEX IF NOT EXISTS idx_airbnb_market ON airbnb_listings(market)")
    con.execute("CREATE INDEX IF NOT EXISTS idx_airbnb_price ON airbnb_listings(price)")
    con.execute("CREATE INDEX IF NOT EXISTS idx_airbnb_room ON airbnb_listings(room_type)")
    if "neighbourhood" in [c for c in con.execute("PRAGMA table_info(airbnb_listings)").fetchall()]:
        con.execute("CREATE INDEX IF NOT EXISTS idx_airbnb_hood ON airbnb_listings(neighbourhood)")
    con.commit()

    return total


def load_treasury_fio(con):
    log.info("=" * 70)
    log.info("LOADING Treasury FIO homeowners insurance data")
    log.info("=" * 70)

    drop_table(con, "treasury_fio")

    for src_label, path in [
        ("FL", SOURCES["treasury_fio_fl"]),
        ("CA", SOURCES["treasury_fio_ca"]),
    ]:
        if not path.exists():
            continue
        df = pd.read_csv(path, low_memory=False)
        df["source_state"] = src_label
        log.info(f"    {src_label}: {len(df):,} rows")
        if_exists = "replace" if src_label == "FL" else "append"
        df.to_sql("treasury_fio", con, if_exists=if_exists, index=False)

    # Also load national xlsx
    xlsx_path = SOURCES["treasury_fio_xlsx"]
    if xlsx_path.exists():
        try:
            import openpyxl
            xl = pd.ExcelFile(xlsx_path, engine="openpyxl")
            for sheet in xl.sheet_names:
                df = pd.read_excel(xlsx_path, sheet_name=sheet, engine="openpyxl")
                df["source_sheet"] = sheet
                df["source_state"] = "NATIONAL"
                log.info(f"    National sheet '{sheet}': {len(df):,} rows × {len(df.columns)} cols")
                df.to_sql("treasury_fio", con, if_exists="append", index=False)
        except Exception as e:
            log.error(f"    National xlsx FAILED: {e}")

    con.execute("CREATE INDEX IF NOT EXISTS idx_fio_zip ON treasury_fio([ZIP Code])")
    con.execute("CREATE INDEX IF NOT EXISTS idx_fio_state ON treasury_fio(source_state)")
    con.commit()


def load_hud_safmr(con):
    log.info("=" * 70)
    log.info("LOADING HUD SAFMR (FL only)")
    log.info("=" * 70)

    drop_table(con, "hud_safmr")

    path = SOURCES["hud_safmr_fl"]
    if not path.exists():
        return 0

    # The HUD CSV has a complex header structure — quote-enclosed multi-line.
    # Read with skiprows=1 to skip the multi-line header line.
    df = pd.read_csv(path, low_memory=False, skiprows=1, dtype=str)
    log.info(f"  Read {len(df):,} rows × {len(df.columns)} cols")
    # Clean column names
    df.columns = [c.strip().strip('"') for c in df.columns]
    log.info(f"  Columns: {list(df.columns[:10])}")
    df.to_sql("hud_safmr", con, if_exists="replace", index=False)
    con.commit()


def load_fannie_mae_sf(con):
    log.info("=" * 70)
    log.info("LOADING Fannie Mae SF loan performance sample")
    log.info("=" * 70)

    drop_table(con, "fannie_mae_sf")

    path = SOURCES["fannie_mae_sf"]
    if not path.exists():
        return 0

    # Pipe-delimited, no header
    t0 = time.time()
    df = pd.read_csv(path, sep="|", header=None, low_memory=False, dtype=str)
    log.info(f"  Read {len(df):,} rows × {len(df.columns)} cols (pipe-delimited)")
    df.to_sql("fannie_mae_sf", con, if_exists="replace", index=False)
    log.info(f"  Loaded in {time.time()-t0:.1f}s")
    con.commit()


def main():
    t_start = time.time()

    log.info("=" * 70)
    log.info("DSCR ENGINE — UNIFIED DATA LOADER")
    log.info(f"Workspace: {WORKSPACE}")
    log.info(f"DB output: {DB_PATH}")
    log.info("=" * 70)

    # Ensure DB dir exists
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Connect
    con = sqlite3.connect(str(DB_PATH))
    con.execute("PRAGMA journal_mode=WAL")
    con.execute("PRAGMA synchronous=NORMAL")

    # Load
    counts = {}
    try:
        counts["nfip_claims"] = load_nfip_claims(con)
        load_zillow_all(con)
        load_realtor_rdc(con)
        counts["calfire"] = load_calfire(con)
        counts["airbnb"] = load_airbnb_all(con)
        load_treasury_fio(con)
        load_hud_safmr(con)
        load_fannie_mae_sf(con)
    except Exception as e:
        log.error(f"LOAD FAILED: {e}")
        raise

    con.close()

    # Final report
    log.info("=" * 70)
    log.info("LOAD COMPLETE")
    log.info("=" * 70)

    con = sqlite3.connect(str(DB_PATH))
    con.row_factory = sqlite3.Row
    for table in ["nfip_claims", "zillow_zori", "zillow_zhvi", "rdc_inventory",
                  "calfire_dins", "airbnb_listings", "treasury_fio", "hud_safmr",
                  "fannie_mae_sf"]:
        report_table(con, table)

    size_mb = DB_PATH.stat().st_size / 1024 / 1024
    log.info(f"\nTotal DB size: {size_mb:.1f} MB")
    log.info(f"Total load time: {time.time()-t_start:.1f}s")
    log.info(f"DB path: {DB_PATH}")


if __name__ == "__main__":
    main()
