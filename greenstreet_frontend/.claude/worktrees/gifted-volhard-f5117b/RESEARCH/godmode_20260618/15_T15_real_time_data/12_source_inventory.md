---
type: research
status: drafted
confidence: 3
title: "T15: 12 Free Real-Time Data Sources — Master Inventory"
summary: "**Coverage**: 12/12 free sources documented **Replaces**: Paid Cotality subscriptions, paid Trepp, paid KBRA Premium"
entities:
  - concept/arm
  - concept/dscr
  - data/apartment-list
  - data/cotality
  - data/fred
  - data/freddie-mac
  - data/kbra
  - data/trepp
  - data/zillow
  - data/zori
  - slice/2
  - topic/condo
  - topic/non-qm
  - topic/sfr
  - topic/str
tags:
  - topic/foreclosure
source: RESEARCH/godmode_20260618/15_T15_real_time_data/12_source_inventory.md
vaulted_at: 2026-06-20
---
# T15: 12 Free Real-Time Data Sources — Master Inventory

**Date**: 2026-06-18
**Coverage**: 12/12 free sources documented
**Replaces**: Paid Cotality subscriptions, paid Trepp, paid KBRA Premium

---

## 1. FRED API (Federal Reserve Bank of St. Louis)

| Field | Value |
|---|---|
| **Data Type** | 800K+ economic time series (interest rates, GDP, CPI, housing, employment) |
| **Frequency** | Daily / weekly / monthly / quarterly depending on series |
| **Auth** | Free API key (32-char alpha-numeric) — register at https://fredaccount.stlouisfed.org/apikeys |
| **Rate Limit** | 120 requests/minute (free tier) |
| **Endpoint** | `https://api.stlouisfed.org/fred/series/observations?series_id={SERIES}&api_key={KEY}&file_type=json` |
| **Series relevant to DSCR** | MORTGAGE30US (Freddie PMMS 30-yr), MORTGAGE15US, MORTGAGE5US, DGS10, DGS2, DFF (Fed Funds), SOFR30DAYAVG, CSUSHPISA (Case-Shiller), HOUST, PERMIT |
| **Sample Response** | `{"observations":[{"date":"2026-06-12","value":"6.47"}]}` |
| **SLA / Freshness** | Updated daily by 9 AM ET for prior business day |
| **Docs** | https://fred.stlouisfed.org/docs/api/api_key.html |

---

## 2. FRED CSV Download

| Field | Value |
|---|---|
| **Data Type** | Same 800K series as FRED API but CSV format (no auth needed for public pages) |
| **Frequency** | Same as series |
| **Auth** | None for one-off downloads; API key for bulk |
| **Endpoint** | `https://fred.stlouisfed.org/graph/fredgraph.csv?id={SERIES}` |
| **Example** | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=MORTGAGE30US` |
| **Use Case** | Bulk backfills, quick checks, Excel-ready |
| **SLA** | Updated same as API |

---

## 3. Cotality Public Press Releases (Mortgage Fraud Risk)

| Field | Value |
|---|---|
| **Data Type** | Quarterly Mortgage Application Fraud Risk Index + supplementary reports |
| **Frequency** | Quarterly (Q1 ~June 1, Q2 ~Aug, Q3 ~Sep-Nov, Q4 ~Feb next year) |
| **Auth** | None (public) |
| **Endpoint** | https://www.cotality.com/newsroom (list of press releases) |
| **Most recent** | https://www.cotality.com/press-releases/mortgage-fraud-risk-decreased-in-beginning-of-2026 (Q1 2026 — index 121, down from 133 Q4 2025) |
| **Q2 2026 release** | Expected August 2026 |
| **Key data points** | National index value, fraud risk by category (identity, income, occupancy, property, transaction, undisclosed real estate), state rankings |
| **Replaces** | Cotality paid subscription |

---

## 4. Trepp Public Blog (CMBS Delinquency)

| Field | Value |
|---|---|
| **Data Type** | CMBS delinquency commentary, large bank CRE call report analysis |
| **Frequency** | Multiple per week (TreppTalk) |
| **Auth** | None (public) |
| **Endpoint** | https://www.trepp.com/trepptalk (TreppTalk blog) |
| **Latest** | https://www.trepp.com/trepptalk/large-bank-cre-delinquency-rates-drop-sharply-in-q1 (Q1 2026: large banks dropped from 1.9% to 1.5%) |
| **Monthly CMBS report** | https://www.trepp.com/research-and-insights (Trepp publishes free monthly CMBS delinquency commentary) |
| **Replaces** | Paid Trepp wire |
| **Key insight** | Free blog gives macro trends; granular loan-level data requires paid Trepp |

---

## 5. KBRA Public Press Releases & Publications

| Field | Value |
|---|---|
| **Data Type** | Non-QM RMBS research, ABS indices, CMBS surveillance summary |
| **Frequency** | Weekly (Auto Loan ABS indices), event-driven (Non-QM Forum recaps), quarterly |
| **Auth** | None for press releases + index publications; **paid** for KBRA Premium (full reports) |
| **Endpoint** | https://www.kbra.com/ (homepage lists latest publications) |
| **Latest free** | https://www.kbra.com/publications/VhBqGTFs/u-s-auto-loan-abs-indices-may-2026 (May 2026) |
| **Non-QM Forum recap** | https://www.kbra.com/publications/dLCtqfbG/imn-2026-non-qm-forum-recap (June 2026) |
| **Replaces** | KBRA Premium subscription for headline-level data |
| **Limitation** | Full RMBS surveillance reports are paywalled |

---

## 6. Freddie Mac PMMS (Primary Mortgage Market Survey)

| Field | Value |
|---|---|
| **Data Type** | Weekly mortgage rate averages (30-yr FRM, 15-yr FRM) |
| **Frequency** | Weekly (Thursday 12 PM ET) |
| **Auth** | None (public) |
| **Endpoint** | https://www.freddiemac.com/pmms (live rates) |
| **Historical XLSX** | https://www.freddiemac.com/pmms/docs/historicalweeklydata.xlsx |
| **FRED alias** | MORTGAGE30US, MORTGAGE15US series (use FRED API for programmatic access) |
| **Latest** | 30-yr FRM 6.47% as of 06/18/2026 |
| **SLA** | Published Thursday 12 PM ET |

---

## 7. MBA Weekly Applications Survey

| Field | Value |
|---|---|
| **Data Type** | Mortgage application volume (purchase + refinance), rates, loan sizes |
| **Frequency** | Weekly (Wednesday) |
| **Auth** | None (public) |
| **Endpoint** | https://www.mba.org/news-and-research/research-and-economics/single-family-research/weekly-applications-survey |
| **Latest report** | Published each Wednesday morning (week ending prior Friday) |
| **Key series** | Market Composite Index, Purchase Index, Refinance Index, 30-yr fixed rate |
| **Use Case** | Demand tracker; correlates with origination volume 4-6 weeks later |

---

## 8. MBA Quarterly Performance Report / National Delinquency Survey (NDS)

| Field | Value |
|---|---|
| **Data Type** | Mortgage delinquency + foreclosure by loan type (subprime, prime, FHA, VA, USDA, conv) |
| **Frequency** | Quarterly |
| **Auth** | None for press release; full data is MBA member benefit |
| **Endpoint** | https://www.mba.org/news-and-research/research-and-economics/single-family-research/national-delinquency-survey |
| **Q1 2026 release** | https://www.mba.org/news-and-research/newsroom (search "National Delinquency Survey") |
| **Key metrics** | 30+ days delinquent %, 90+ days delinquent %, foreclosure starts %, foreclosure inventory |
| **Use Case** | DSCR performance benchmark; stress-test calibration |

---

## 9. Census Bureau New Residential Sales (HVS)

| Field | Value |
|---|---|
| **Data Type** | New home sales (count + price + months supply) |
| **Frequency** | Monthly (released ~3rd-4th week of each month for prior month) |
| **Auth** | None (public) |
| **Endpoint** | https://www.census.gov/housing/hvs/ (landing page) |
| **Data tables** | https://www.census.gov/housing/hvs/data/index.html |
| **Release schedule** | https://www.census.gov/housing/hvs/data/upcoming.html |
| **Key series** | New One-Family Houses Sold: United States (HSN1F), Median Sales Price |
| **Use Case** | New construction demand; correlates with SFR investment demand |

---

## 10. Zillow ZORI + ZHVI (Observed Rent Index + Home Value Index)

| Field | Value |
|---|---|
| **Data Type** | Rent index (ZORI) + home value index (ZHVI), multiple tiers and geographies |
| **Frequency** | Monthly (updated 16th of each month for prior month) |
| **Auth** | None (public CSV downloads) |
| **ZORI endpoint** | `https://files.zillowstatic.com/research/public_csvs/zori/Metro_zori_uc_sfrcondomfr_sm_month.csv` |
| **ZHVI endpoint** | `https://files.zillowstatic.com/research/public_csvs/zhvi/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv` |
| **Geographies** | National, State, Metro, County, City, ZIP |
| **Use Case** | DSCR rent comparable + property value trends (FREE institutional-quality indices) |

---

## 11. Apartment List Rent Report (Monthly)

| Field | Value |
|---|---|
| **Data Type** | National + metro median rent, vacancy index, list-to-lease time |
| **Frequency** | Monthly (last week of each month) |
| **Auth** | None (public) |
| **Endpoint** | https://www.apartmentlist.com/research/national-rent-data |
| **Data download** | https://www.apartmentlist.com/research/category/data-rent-estimates |
| **Latest** | May 2026: national median rent $1,379 (+0.5% MoM, -1.5% YoY), vacancy 7.2%, list-to-lease 30 days |
| **Methodology** | https://www.apartmentlist.com/research/rent-estimate-methodology |
| **Use Case** | SFR rent comparable; vacancy / liquidity indicator |

---

## 12. NY Fed SOFR API (Secured Overnight Financing Rate)

| Field | Value |
|---|---|
| **Data Type** | Daily SOFR, SOFR 30/90/180-day averages, SOFR index |
| **Frequency** | Daily (published ~8 AM ET) |
| **Auth** | None (public API) |
| **Endpoint** | `https://markets.newyorkfed.org/api/rates/unsecured/sofr/last/1.json` (last 1 day) |
| **Endpoint (range)** | `https://markets.newyorkfed.org/api/rates/unsecured/sofr/{start}/{end}.json` |
| **Endpoint (SOFR averages)** | `https://markets.newyorkfed.org/api/rates/sofr-averages/last/30.json` (30-day average) |
| **Docs** | https://markets.newyorkfed.org/static/docs/markets-api.html |
| **Use Case** | ARM index (SOFR-indexed ARMs are replacing LIBOR); rate ceiling/DSCR payment calc |

---

## Coverage Summary Matrix

| # | Source | Type | Frequency | Auth | Replaces Paid |
|---|---|---|---|---|---|
| 1 | FRED API | Macro | Daily | Free key | Bloomberg/Reuters macro |
| 2 | FRED CSV | Macro | Daily | None | Same |
| 3 | Cotality Public | Mortgage fraud | Quarterly | None | Cotality subscription |
| 4 | Trepp Blog | CMBS | Weekly | None | Trepp wire |
| 5 | KBRA Press | RMBS indices | Weekly | None | KBRA Premium |
| 6 | Freddie PMMS | Mortgage rate | Weekly | None | Rate services |
| 7 | MBA WAS | Origination | Weekly | None | Ellie Mae / ICE data |
| 8 | MBA NDS | Delinquency | Quarterly | None | Equifax / Black Knight |
| 9 | Census NRS | New home sales | Monthly | None | N/A (always public) |
| 10 | Zillow ZORI/ZHVI | Rent + value | Monthly | None | N/A (always public) |
| 11 | Apartment List | Rent | Monthly | None | CoStar (paid) |
| 12 | NY Fed SOFR | Reference rate | Daily | None | LIBOR/ICE |

---

## Slice 2 P0-2 (Live Rate Anchors) Integration Plan

The Slice 2 P0-2 deliverable requires live DSCR pricing anchors. The free-tier plan:

| Anchor | Free Source | Pull Frequency |
|---|---|---|
| 30-yr Fixed Rate | FRED MORTGAGE30US (== Freddie PMMS) | Weekly (Thursday) |
| 15-yr Fixed Rate | FRED MORTGAGE15US | Weekly |
| 10-yr Treasury | FRED DGS10 | Daily |
| SOFR | NY Fed API | Daily (8 AM ET) |
| Fed Funds | FRED DFF | Daily |
| Rent index (national) | ZORI (Zillow) | Monthly (16th) |
| Rent index (city) | ZORI metro | Monthly |
| Home value | ZHVI (Zillow) | Monthly |
| Demand proxy | MBA WAS Purchase Index | Weekly (Wed) |
| Credit quality | MBA NDS quarterly | Quarterly |
| Reference rate | NY Fed SOFR API | Daily |

**Cost**: $0/month (vs $5-15K/month Bloomberg/CoStar/Cotality stack)
**Coverage gap**: Loan-level CMBS data, MSR pricing, non-QM pool-level tape — those still require paid (Cotality/Trepp/KBRA premium)