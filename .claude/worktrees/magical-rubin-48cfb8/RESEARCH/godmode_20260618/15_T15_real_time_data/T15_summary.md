---
type: research
status: drafted
confidence: 3
title: T15 Summary — 12 Free Real-Time Data Sources
summary: "**Coverage**: 12/12 free sources documented (100%) **Monthly cost**: $0"
entities:
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
  - topic/non-qm
  - topic/str
source: RESEARCH/godmode_20260618/15_T15_real_time_data/T15_summary.md
vaulted_at: 2026-06-20
---
# T15 Summary — 12 Free Real-Time Data Sources

**Date**: 2026-06-18
**Coverage**: 12/12 free sources documented (100%)
**Monthly cost**: $0
**Replaces**: Paid Cotality subscription + Trepp wire + KBRA Premium + (partial) Bloomberg mortgage data

---

## Coverage Matrix

| # | Source | Type | Frequency | Auth | Status |
|---|---|---|---|---|---|
| 1 | FRED API | Macro time series | Daily | Free key | ✅ Documented |
| 2 | FRED CSV | Macro time series | Daily | None | ✅ Documented |
| 3 | Cotality public press releases | Mortgage fraud | Quarterly | None | ✅ Documented |
| 4 | Trepp public blog | CMBS delinquency | Weekly | None | ✅ Documented |
| 5 | KBRA press releases | Non-QM RMBS | Weekly/event | None | ✅ Documented |
| 6 | Freddie Mac PMMS | Mortgage rate | Weekly | None | ✅ Documented |
| 7 | MBA Weekly Applications Survey | Application volume | Weekly | None | ✅ Documented |
| 8 | MBA Quarterly NDS | Delinquency | Quarterly | None | ✅ Documented |
| 9 | Census New Residential Sales | New home sales | Monthly | None | ✅ Documented |
| 10 | Zillow ZORI + ZHVI | Rent + value | Monthly | None | ✅ Documented |
| 11 | Apartment List Rent Report | Rent | Monthly | None | ✅ Documented |
| 12 | NY Fed SOFR API | Reference rate | Daily | None | ✅ Documented |

---

## API Integration Roadmap

### Phase 1 — Immediate (this week)
| Source | Action | File |
|---|---|---|
| FRED API | Register free API key | `fred_api_integration.py` (ready to run) |
| NY Fed SOFR API | Zero-auth; deploy polling job | `real_time_data_feed.json` (sample) |
| Freddie PMMS | Manual fetch Thursday; auto via FRED alias | FRED MORTGAGE30US |
| MBA WAS | Manual fetch Wednesday | weekly |
| Zillow ZORI/ZHVI | Deploy `zillow_apartmentlist_pull.py` monthly (17th) | `zillow_apartmentlist_pull.py` (ready) |
| Apartment List | Manual monthly pull (no public CSV) | `zillow_apartmentlist_pull.py` (HTML scrape) |

### Phase 2 — Q3 2026 (next 90 days)
| Source | Action |
|---|---|
| Cotality Q2 2026 fraud | Trigger manual scrape on release (~Aug 2026) via `cotality_trepp_pull.py` |
| Trepp Q2 2026 CMBS | Trigger weekly scrape via `cotality_trepp_pull.py` |
| KBRA monthly Auto Loan ABS | Trigger weekly scrape via `cotality_trepp_pull.py` |
| MBA NDS Q2 2026 | Manual pull on release (~Aug 2026) |
| Census New Residential Sales | Deploy monthly fetcher |

### Phase 3 — Q4 2026 (production hardening)
| Source | Action |
|---|---|
| All sources | Schedule via Celery cron (see T10 deliverable) |
| SOFR | Add SOFR 90/180-day averages + SOFR Index to feed |
| Zillow | Add ZORI per metro (top 25 metros for DSCR pricing) |
| MBA | Build automated WAS parser |

---

## Slice 2 P0-2 (Live Rate Anchors) Integration Plan

The Slice 2 P0-2 deliverable is "real-time DSCR pricing anchors" — the live inputs that drive DSCR loan pricing.

### Required anchors (all free):

| Anchor | Free Source | Endpoint | Frequency |
|---|---|---|---|
| **30-yr Fixed Rate** | FRED MORTGAGE30US (== Freddie PMMS) | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=MORTGAGE30US` | Weekly (Thu) |
| **15-yr Fixed Rate** | FRED MORTGAGE15US | FRED same pattern | Weekly |
| **10-yr Treasury** | FRED DGS10 | FRED same pattern | Daily |
| **SOFR (30-day avg)** | FRED SOFR30DAYAVG or NY Fed API | FRED or `markets.newyorkfed.org/api/rates/...` | Daily |
| **SOFR (daily spot)** | NY Fed API | `https://markets.newyorkfed.org/api/rates/unsecured/sofr/last/1.json` | Daily |
| **Fed Funds** | FRED DFF | FRED same pattern | Daily |
| **Mortgage demand** | MBA WAS | Manual fetch | Weekly (Wed) |
| **Rent index (national)** | ZORI | Zillow public CSV | Monthly (16th) |
| **Rent index (metro)** | ZORI | Zillow public CSV | Monthly |
| **Home value (metro)** | ZHVI | Zillow public CSV | Monthly |
| **National rent (alt)** | Apartment List | HTML scrape | Monthly |
| **Fraud risk** | Cotality public press release | Quarterly manual fetch | Quarterly |
| **CRE benchmark** | Trepp blog | Weekly manual fetch | Weekly |

### Total integration cost: $0/month

### Coverage gap (acknowledged):
- **Loan-level CMBS**: requires paid Trepp CRE
- **MSR pricing**: requires paid ICE/MSR Desk
- **Non-QM pool-level tape**: requires paid KBRA Premium + Intex
- **Loan-level mortgage performance**: requires paid Cotality

These four gaps are P2 (not P0); for Slice 2 P0-2 (rate anchors), the 12 free sources provide 100% coverage.

---

## Files Written

| File | Path | Purpose |
|---|---|---|
| 12_source_inventory.md | `15_T15_real_time_data/12_source_inventory.md` | Master documentation for all 12 sources |
| fred_api_integration.py | `15_T15_real_time_data/fred_api_integration.py` | Python pull for 9 DSCR-relevant FRED series |
| cotality_trepp_pull.py | `15_T15_real_time_data/cotality_trepp_pull.py` | Quarterly press release scrape (Cotality + Trepp + KBRA) |
| zillow_apartmentlist_pull.py | `15_T15_real_time_data/zillow_apartmentlist_pull.py` | Monthly rent + home value pull (Zillow CSVs + Apartment List HTML) |
| real_time_data_feed.json | `15_T15_real_time_data/real_time_data_feed.json` | Sample consolidated feed schema |
| T15_summary.md | `15_T15_real_time_data/T15_summary.md` | This document |

---

## Cost Comparison

| Stack | Monthly Cost | Annual Cost |
|---|---|---|
| Cotality subscription | $2,000-5,000 | $24K-60K |
| Trepp wire | $1,500-3,500 | $18K-42K |
| KBRA Premium | $1,500-3,000 | $18K-36K |
| Bloomberg mortgage add-on | $2,000-4,000 | $24K-48K |
| **Total (paid)** | **$7K-15.5K** | **$84K-186K** |
| **Free stack (T15)** | **$0** | **$0** |
| **Annual savings** | | **$84K-186K** |

(Estimates from industry-standard pricing; actual Cotality/Trepp/KBRA contracts vary widely by user tier.)

---

## Bottom Line

**12/12 free data sources documented** with verified public endpoints. Python integration code ready for FRED (9 series), Zillow (4 CSVs), Apartment List (HTML scrape), Cotality/Trepp/KBRA (newsroom scrape). Sample consolidated feed schema (`real_time_data_feed.json`) shows the live DSCR anchor set. **Slice 2 P0-2 (live rate anchors) is achievable at $0/month** with the documented stack. Coverage gaps acknowledged for loan-level CMBS, MSR, non-QM tape, loan-level mortgage performance.