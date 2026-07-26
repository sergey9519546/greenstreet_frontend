---
type: research
status: drafted
confidence: 3
title: github_DATASETS_REPORT.md
summary: This report catalogs publicly available datasets surfaced through GitHub repos, code examples, and upstream institutional sources.
entities:
  - concept/arm
  - concept/dscr
  - concept/ltv
  - data/apartment-list
  - data/cotality
  - data/fannie-mae
  - data/fred
  - data/freddie-mac
  - data/zillow
  - data/zori
  - ml/shap
  - regulation/hmda
  - state/ct
  - state/mi
  - topic/multifamily
  - topic/sfr
  - topic/str
tags:
  - ml/xgboost
  - topic/apex
  - topic/default-rate
  - topic/lgd
  - topic/yield-curve
source: output/apex3_dispatch/github/github_DATASETS_REPORT.md
vaulted_at: 2026-06-20
---
# github_DATASETS_REPORT.md
## DSCR Sovereign OS — Open Datasets for Mortgage Performance, Rent Indexes, PD/LGD, and Prepayment

This report catalogs publicly available datasets surfaced through GitHub repos, code examples, and upstream institutional sources.

---

## A. AGENCY (FANNIE MAE / FREDDIE MAC) LOAN-LEVEL DATA — *PRIMARY*

| Dataset | Source | Coverage | Schema (key fields) | How to get | Repo pointers |
|---|---|---|---|---|---|
| **Fannie Mae Single-Family Loan Performance Data** | Fannie Mae Capital Markets | 2000-Q3 2025+, ~40M loans | Loan ID, MSACode, CreditScore, OrigLTV, DTI, OrigRate, OrigUPB, FirstPayDate, Maturity, PropertyType, monthly delinquency (0-8), zero-balance code, disposition, modified flag, current UPB, current rate | Free signup at capitalmarkets.fanniemae.com → Single-Family Loan Performance Data → quarterly ZIPs (.csv .txt) | `dataquestio/loan-prediction`, `ferrarisf50/Fannie-Mae-single-family-mortgage-loan-data`, `ovinueza/MortgageDelinquency`, `chaitanyachadha12/Fannie-Mae---Single-Family-LPD`, `stphnma/agency-loan-level`, `brendancovington/agency-loan-level`, `NVIDIA/spark-rapids-examples` (mortgage ETL+XGB) |
| **Freddie Mac Single-Family Loan-Level Dataset** | Freddie Mac Research | 1999-Q3 2025+, ~50M loans | Same vintage fields; uses different monthly file split (origination + monthly performance) | Free at freddiemac.com/research/datasets/sf-loanlevel-dataset | `stphnma/agency-loan-level`, `NVIDIA/spark-rapids-examples` |
| **Fannie Mae Multifamily Loan Performance Data (MFLPD)** | Fannie Mae Capital Markets | 2000-present | CMBS-style loan tape (large CRE), servicer reports | Free at capitalmarkets.fanniemae.com | Indirect via DSCR CRE channels |
| **Fannie Mae Single-Family Credit Risk Transfer (CRT)** | Fannie Mae | 2013-present | CAS (Connecticut Avenue Securities) reference pool | Free | DSCR benchmark |
| **Freddie Mac K-Deal / STACR** | Freddie Mac | 2013-present | STACR / ACIS reference pools | Free | DSCR benchmark |

## B. MORTGAGE PERFORMANCE / PD / LGD / PREPAY (DERIVED)

| Dataset | Source | Notes |
|---|---|---|
| **Todd Schneider "Mortgages Are About Math"** | toddwschneider.com (mirror on GitHub gist) | Million-loan tape analytics; published CSV extracts; SQL scripts |
| **Home Credit Default Risk (Kaggle)** | Kaggle | 7 application_train tables, ~300k rows, multi-source credit behavior — consumer-PD analog |
| **Lending Club loan tape (2007-2018)** | Kaggle + several GitHub mirrors | 2.6M loans, status (Fully Paid / Charged Off / Current), intRate, grade, sub_grade, dti, fico_range, revol_util — useful for consumer PD/LGD analogs |
| **"Give Me Some Credit" (Kaggle)** | Kaggle | 250k consumer-credit binary default with 11 features; PD benchmark |
| **Kaggle "predict-loan-defaulters"** | CSDN mirrors | Czech banking data (trans / order / account / disp / client / card / loan / district) |
| **Open Mortgage Data Pipeline reference data** | FINOS labs | Sample data on finos-labs/open-mortgage-data-pipeline |

## C. RENT INDEXES / HOUSEHOLD-LEVEL RENT

| Dataset | Source | Coverage | Schema | Notes |
|---|---|---|---|---|
| **Zillow Rent Index (ZRI)** | Zillow (public-facing) | 2010-present, MSA + ZIP | Monthly median rent estimate | Repo `chunziwang/zillow-rent-forecast` walks through retrieval |
| **Zillow Observed Rent Index (ZORI)** | Zillow | 2015-present | Smoothed ZRI | Free CSV download; use for SFR rent forecasting |
| **Apartment List National Rent Data** | Apartment List | 2017-present, 100 metros | Monthly median rent, MoM, YoY | Free CSV downloads |
| **Census ACS B25064 — Median Gross Rent** | data.census.gov | Annual, by ZIP/Tract | Median gross rent (occupied units paying cash rent) | Lagging ~1 yr |
| **Census ACS B25068 / B25067 — Rent distribution** | data.census.gov | Annual | 1st-to-99th percentile band | Granular distribution |
| **BLS CPI Rent Index (CUUR0000SEHA)** | BLS | 1915-present | Owners' equiv. rent + tenant rent | Inflation-linked |
| **BLS New Tenant Rent Index** | BLS | 2018-present (experimental) | New-lease rents | Best leading indicator |
| **CoreLogic / RealPage (commercial)** | Commercial | Various | Single-family + multifamily rent comps | Licensed |
| **Yardi Matrix (commercial)** | Commercial | Various | Apartment rent/occupancy | Licensed |

## D. PREPAYMENT-SPECIFIC (CPR / SMM / PSA)

| Dataset | Source | Notes |
|---|---|---|
| **Fannie Mae Benchmark CPR** | Fannie Mae Capital Markets | Monthly benchmark CPR public data file — essential validation for custom CPR model |
| **Freddie Mac Primary Mortgage Market Survey** | Freddie Mac | Historical refi incentive + actual CPR/SMM |
| **Ginnie Mae CPR Public Tapes** | Ginnie Mae | Direct comparison for government MBS prepay speeds |
| **Black Knight / ICE McDash Prepay** | ICE | Industry-standard performance dataset | Licensed |
| **eMBS / Recursion Prepay Dashboards** | Recursion (commercial) | Aggregated CPR/PSA by vintage |

## E. INTEREST-RATE / TREASURY / MORTGAGE-RATE SERIES

| Dataset | Source | Notes |
|---|---|---|
| **FRED H.15 Selected Interest Rates** | Federal Reserve | Treasury constant-maturity + SOFR |
| **Freddie Mac PMMS** | Freddie Mac weekly | 30-yr, 15-yr, ARM indices |
| **Fannie Mae PMMS+** | Fannie Mae weekly | Mortgage rate index |
| **Treasury Yield Curve (daily)** | US Treasury Daily Yield Curve | Par yields (1mo–30yr) |
| **SOFR (Secured Overnight Financing Rate)** | NY Fed | ARM index reference |
| **CMT 1-Year Treasury** | FRED | ARM reset benchmark |
| **OCC / FHLMC ARM Margin Series** | OCC | Historical ARM index spreads |

## F. HOUSE PRICE / PROPERTY VALUATION (for DSCR LTV / DSCR stress)

| Dataset | Source | Notes |
|---|---|---|
| **FHFA House Price Index (HPI)** | FHFA | MSA + ZIP, monthly |
| **Case-Shiller National Home Price Index** | S&P / Case-Shiller | National + 20-city |
| **Zillow Home Value Index (ZHVI)** | Zillow | Smoothed median home value by ZIP |
| **Redfin Data Center** | Redfin | Weekly median sale price by metro/city |
| **CoreLogic Home Price Insights** | CoreLogic | Index + YoY by state |
| **ATTOM Property Data** | ATTOM | Deed-level (licensed) |

## G. CREDIT RISK / PD / LGD REFERENCE DATA

| Dataset | Source | Notes |
|---|---|---|
| **Fannie Mae CRT Reference Pools** | Fannie Mae | Senior vs. subordination; attaches default data |
| **Freddie Mac K-Deal Reference Pools** | Freddie Mac | Same |
| **Moody's Default & Recovery Database (DRD)** | Moody's | Corporate + structured (licensed) |
| **S&P RatingsDirect CreditStats** | S&P | Historical PDs by rating (licensed) |
| **Federal Reserve Shared National Credit (SNC)** | Federal Reserve | Annual credit data on large syndicated loans |
| **FFIEC Call Reports / NIC** | FFIEC | Bank-level credit metrics |
| **Y-14M / Y-14Q FRB stress-test data** | FRB | Bank-internal stress (HMDA-equivalent; licensed, summary only) |

## H. MACRO / MARKET-DRIVEN COVARIATES (FOR PREPAY + PD)

| Dataset | Source | Notes |
|---|---|---|
| **NBER Recession Indicators** | NBER | Recession dummy |
| **BLS Unemployment Rate (UNRATE)** | BLS | National + state + MSA |
| **UMich Consumer Sentiment** | University of Michigan | Prepay driver |
| **MBA Mortgage Applications Survey** | MBA | Weekly refi/purchase index |
| **Senior Loan Officer Opinion Survey (SLOOS)** | FRB | Lending standards |
| **GDP / PCE / Housing Starts** | BEA / Census | Macro covariates |

## I. AML / KYC / ENTITY DATA (FOR SOVEREIGN-LAYER IDENTITY)

| Dataset | Source | Notes |
|---|---|---|
| **OFAC SDN List** | US Treasury | Sanctions |
| **FinCEN 314(a) / BSA** | FinCEN | Cross-institution lists |
| **OpenCorporates API** | OpenCorporates | Global company registry (free tier) |
| **SEC EDGAR full-text** | sec.gov | 13F, 10-K, S-1 filings — used by `dgunning/edgartools` |

## J. DERIVED / OPEN GEOSPATIAL

| Dataset | Source | Notes |
|---|---|---|
| **OSM Nominatim / Overpass** | OpenStreetMap | Geocoding |
| **Census TIGER/Line shapefiles** | Census | MSA / ZIP / tract polygons |
| **FCC BDC Broadband** | FCC | Block-level connectivity |
| **HUD USPS Crosswalk** | HUD | ZIP → Tract → County lookups |

---

### Implementation priority for DSCR Sovereign OS

1. **Fannie Mae SFLP + Freddie Mac SFLLD** — must-have for institutional-grade PD/LGD/prepay calibration and backtesting.
2. **Zillow ZORI / ZRI + Apartment List** — primary rent forecast input.
3. **FHFA HPI + Case-Shiller** — house-price / LTV stress covariates.
4. **FRED H.15 + Treasury curve + Freddie PMMS** — ARM reset index and DSCR stress path.
5. **Fannie Mae Benchmark CPR** — benchmark to validate the custom CPR engine.
6. **Kaggle Home Credit / Give Me Some Credit / Lending Club** — fast PD analogs when full agency data unavailable.
7. **BLS New Tenant Rent Index** — leading rent indicator for forward DSCR.
8. **MBA Mortgage Applications** — refi-incentive covariate for prepayment model.
