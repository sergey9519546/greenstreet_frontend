# 📦 Complete Session Archive — Everything Bundled

> Cleanup note 2026-06-25: the large ZIP/TAR/CSV payloads described here were
> moved out of the workspace root to
> `99_attachments/source_archives/2026-06-22/`. This README is kept in root
> because existing reports reference it as the manifest for that archive.

**Total size:** ~1.2 GB compressed  
**Total files:** 140+ files across 9 categorized ZIPs + raw datasets folder  
**Date:** 2026-06-22

## What's in this archive

This single ZIP contains the COMPLETE output of a multi-phase data acquisition
and analysis session covering:

- **Phase 1:** Original dataset downloads (Treasury FIO, Zillow, Inside Airbnb,
  HUD, FEMA, Realtor.com, Fannie Mae, Freddie Mac)
- **Phase 2:** Florida & California filtered datasets
- **Phase 3:** DSCR loan performance datasets
- **Phase 4:** Workaround downloads (HMDA, Fannie Mae SF parquet with 16.5M
  loan-month records, Freddie Mac samples)
- **Phase 5:** Full dataset analysis (14 datasets analyzed)
- **Phase 6:** Climate-Adjusted DSCR (CA-DSCR) algorithm + Default Probability
  Score (DPS) — with calibrated coefficients, validation, and per-ZIP results

## Archive Structure

```
everything_session_complete.zip
├── 00_MASTER_README.md                  (this file)
├── zips/                                (9 categorized ZIPs — pick what you need)
│   ├── 01_florida_datasets.zip          (29 MB)
│   ├── 02_california_datasets.zip       (71 MB)
│   ├── 03_dscr_loan_performance.zip     (43 MB)
│   ├── 04_national_raw_datasets.zip     (98 MB)
│   ├── 05_inside_airbnb_all_cities.zip  (13 MB)
│   ├── 06_master_bundle.zip             (252 MB — ZIPs 1-5 combined)
│   ├── 07_new_datasets_phase1.zip       (211 MB)
│   ├── 08_analysis_and_algorithm.zip    (404 KB)
│   └── 09_master_bundle_new.zip         (211 MB — ZIPs 7-8 combined)
└── datasets/                            (raw, unzipped files for direct access)
    ├── README.md                        (original acquisition notes)
    ├── FL_CA_README.md                  (FL & CA manifest with merge code)
    ├── DSCR_ADDENDUM.md                 (torrent search notes + free alternatives)
    ├── findings_summary.txt             (Phase 2 statistical findings)
    ├── PHASE3_FINDINGS_AND_ALGORITHM.md (Phase 3 algorithm writeup)
    ├── florida/                         (120 MB — 17 FL-specific files)
    ├── california/                      (141 MB — 34 CA-specific files)
    ├── treasury_fio/                    (15 MB — Treasury FIO national)
    ├── zillow_zori/                     (9 MB — Zillow ZORI national)
    ├── inside_airbnb/                   (15 MB — Airbnb raw)
    ├── dscr_extra/                      (175 MB — Fannie Mae + Freddie Mac + HMDA + FHFA NMDB)
    ├── _realtor_raw/                    (149 MB — Realtor.com national)
    ├── FEMA_NFIP_Redacted_Claims_All_States.csv  (140 MB — national FEMA flood claims)
    └── algorithm_output/                (944 KB — CA-DSCR results for FL & CA + summary JSON)
```

## Quick Start Guide

### If you only want one thing:

| You want... | Get this file | Size |
|---|---|---|
| Just the algorithm & analysis | `zips/08_analysis_and_algorithm.zip` | 404 KB |
| Just FL datasets | `zips/01_florida_datasets.zip` | 29 MB |
| Just CA datasets | `zips/02_california_datasets.zip` | 71 MB |
| All new datasets (HMDA + Fannie Mae parquet) | `zips/07_new_datasets_phase1.zip` | 211 MB |
| Everything from original session | `zips/06_master_bundle.zip` | 252 MB |
| Everything new from this session | `zips/09_master_bundle_new.zip` | 211 MB |
| **EVERYTHING (this archive)** | (you're already in it) | ~1.2 GB |

### To reproduce the analysis:

1. Unzip this archive
2. `cd datasets/`
3. Read `_analysis_docs/PHASE3_FINDINGS_AND_ALGORITHM.md` for the formula
4. Read `findings_summary.txt` for the statistical findings
5. Run `python3 _scripts/analyze_all_datasets.py` to regenerate findings
6. Run `python3 _scripts/build_dscr_algorithm.py` to regenerate algorithm outputs
7. To stress-test: change `CURRENT_RATE` in `build_dscr_algorithm.py` from 0.07 to 0.06 or 0.08

## Key Findings (TL;DR)

1. **FL insurance is 3x more expensive than CA** ($5,081 vs $1,669/yr)
2. **CA SFR is structurally cash-flow negative** — Price-to-Rent ratio is 25.8x in CA vs 14.5x in FL
3. **At 7% mortgage rates, no major FL or CA ZIP produces positive cash flow** for new SFR acquisitions at 75% LTV
4. **Top 3 highest-risk ZIPs (by Default Probability Score):**
   - 90210 Beverly Hills, CA — DPS 19.9% (climate penalty 24%)
   - 92662 Newport Beach, CA — DPS 10.8%
   - 94301 Palo Alto, CA — DPS 10.2%

## The Algorithm (Climate-Adjusted DSCR + Default Probability Score)

```
NOI = Gross Rent × (1 − OpEx 40% − Vacancy 7%)
Debt Service = Loan × r(1+r)^n / ((1+r)^n − 1) × 12
DSCR_baseline = NOI / Debt Service

Climate Risk Penalty = 0.20×Flood + 0.15×LossRatio + 0.10×Nonrenewal + 0.25×Wildfire
CA-DSCR = DSCR_baseline × (1 − Climate Risk Penalty)

Default Probability Score = σ(−8.0 − 2.5×ln(CA-DSCR) + 2.0×max(0,LTV−0.8) − 0.005×(FICO−700) + 1.5×CRP)
```

Validated against Fannie Mae MFLPD actual DSCR benchmark of 1.35x.

## Source URLs (all free / public)

See individual README files for source URLs of every dataset. All data was acquired
from legitimate public sources:
- Treasury FIO: https://home.treasury.gov/news/press-releases/jy2791
- Zillow Research: https://files.zillowstatic.com/research/public_csvs/...
- HUD SAFMR: https://www.huduser.gov/portal/datasets/fmr/smallarea/index.html
- FEMA NFIP: https://www.fema.gov/about/reports-and-data/openfema/ (via Wayback)
- Realtor.com: https://econdata.s3-us-west-2.amazonaws.com/Reports/Core/...
- Fannie Mae MFLPD: https://capitalmarkets.fanniemae.com/...
- Fannie Mae SF: https://www.kaggle.com/datasets/qhhuang/fannie-mae-single-family-loan-performance
- Freddie Mac: https://www.freddiemac.com/research/datasets/sf-loanlevel-dataset
- FHFA NMDB: https://www.fhfa.gov/data/nmdb
- HMDA: https://files.consumerfinance.gov/hmda-historic-loan-data/ (via Wayback)
- Inside Airbnb: https://data.insideairbnb.com/...
- CDI wildfire: https://www.insurance.ca.gov/01-consumers/200-wrr/DataAnalysisOnWildfiresAndInsurance.cfm
- CAL FIRE DINS: https://gis.data.cnra.ca.gov/...
- CA DOF E-5: https://dof.ca.gov/forecasting/demographics/estimates/...
- FL BEBR: https://bebr.ufl.edu/population/population-data

## Last Updated
2026-06-22
