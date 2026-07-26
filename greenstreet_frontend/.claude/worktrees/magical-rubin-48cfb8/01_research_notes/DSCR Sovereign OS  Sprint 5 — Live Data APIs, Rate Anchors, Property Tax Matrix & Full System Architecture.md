---
type: research
sprint: 5
status: drafted
confidence: 3
title: "DSCR Sovereign OS: Sprint 5 Research Execution"
summary: "**Classification:** SOVEREIGN | **Executed:** June 18, 2026 | **Sprint:** 5 of 6"
entities:
  - concept/appreciation
  - concept/arm
  - concept/dscr
  - concept/itia
  - concept/ltv
  - concept/pitia
  - data/cotality
  - data/fred
  - lender/visio-lending
  - math/copula
  - math/t-copula
  - ml/xgboost
  - regulation/section-1071
  - sprint/1
  - sprint/3
  - sprint/5
  - sprint/6
  - state/al
  - state/ar
  - state/az
  - state/co
  - state/ct
  - state/hi
  - state/id
  - state/il
  - state/mi
  - state/mn
  - state/nj
  - state/ny
  - state/oh
  - state/pa
  - state/sc
  - state/tn
  - state/vt
  - state/wy
  - tax/niit
  - tax/pal
  - topic/condo
  - topic/sfr
  - topic/str
tags:
  - ml/xgboost
  - topic/after-tax
  - topic/architecture
  - topic/compliance
  - topic/default-rate
  - topic/flood-insurance
  - topic/ic-memo
  - topic/insurance
  - topic/kill-criteria
  - topic/monte-carlo
  - topic/ppp
  - topic/reserves
  - topic/tax
  - topic/yield-curve
  - type/audit
source: "DSCR Sovereign OS  Sprint 5 — Live Data APIs, Rate Anchors, Property Tax Matrix & Full System Architecture.md"
vaulted_at: 2026-06-20
---
# DSCR Sovereign OS: Sprint 5 Research Execution
## Live API Integration | Rate Triplet | SOFR Forward Curve | Property Tax Matrix | FastAPI Architecture | PostgreSQL Evidence Vault

**Classification:** SOVEREIGN | **Executed:** June 18, 2026 | **Sprint:** 5 of 6

***

## Module 1: Live Rate Triplet — All Values Current (June 16–18, 2026)

This is the engine's live rate anchor. Every DSCR computation begins by pulling these three values. They are refreshed on every session open, every deal computation, and every overnight Celery task.

### Rate Triplet — Confirmed Live (June 17–18, 2026)

| Series | FRED ID | Value (June 16, 2026) | Source |
|--------|---------|----------------------|--------|
| 10-Year Treasury (DGS10) | `DGS10` | **4.43%** | [^1] |
| 10-Year Treasury (GS10, monthly) | `GS10` | **4.48%** (May 2026 avg) | [^2] |
| SOFR (overnight) | `SOFR` | **3.63%** (June 16, 2026) | [^3] |
| 30-Day Average SOFR | NY Fed | **3.609%** (June 17, 2026) | [^4] |
| 90-Day Average SOFR | NY Fed | **3.636%** (June 17, 2026) | [^4] |
| 180-Day Average SOFR | NY Fed | **3.679%** (June 17, 2026) | [^4] |

### CME Term SOFR Forward Curve — Live (June 16–17, 2026)

**Source:** global-rates.com CME Term SOFR; Tradition Data SOFR swaps[^5][^6]

| Tenor | Rate (June 16, 2026) | Usage in Engine |
|-------|---------------------|-----------------|
| **1-Month Term SOFR** | **3.637%** | ARM 1/6 reset reference |
| **3-Month Term SOFR** | **3.668%** | Standard ARM reset reference |
| **6-Month Term SOFR** | **3.731%** | 6-month ARM cap reference |
| **12-Month Term SOFR** | **3.869%** | Forward rate for 12-month projection |

**SOFR Swap Curve (Tradition Data, June 17, 2026):**[^6]

| Swap Tenor | Rate |
|-----------|------|
| 1 Year | 3.6242% |
| 2 Year | 3.6442% |
| 3 Year | 3.6649% |
| 5 Year | 3.6849% |
| 7 Year | 3.7311% |
| 10 Year | 3.7511% |
| 20 Year | 3.8635% |
| 30 Year | 3.8835% |

**ARM Reset Rate Computation (Canonical):**

For a 5/6 ARM resetting at month 60:
- Index = 6-Month Term SOFR at reset date (currently **3.731%**)
- Margin = lender-specific spread (typically **2.25%–2.75%** for DSCR ARMs)
- Computed new rate = 3.731% + 2.50% (midpoint) = **6.231%**
- Annual cap: +2% per adjustment
- Lifetime cap: +5% above start rate

**Why this matters:** A DSCR ARM that starts at 7.25% today resets at month 60. If SOFR forward curve implies 3.73% at that tenor, the new rate = 3.73% + margin (2.50%) = 6.23% — **actually lower than today's start rate**. This is a case where ARM risk works in favor of the borrower given the current inverted-to-flat curve. The engine must compute this explicitly rather than assuming rates move adversely.

### SOFR Rate History — Monthly (ARM Reset Stress Calibration)

From HSH/SOFR Index data:[^7]

| Month | SOFR |
|-------|------|
| Jun 2026 | 3.63% |
| May 2026 | 3.65% |
| Apr 2026 | 3.65% |
| Mar 2026 | 3.71% |
| Feb 2026 | 3.69% |
| Jan 2026 | 3.75% |
| Dec 2025 | 4.12% |
| Nov 2025 | 4.13% |
| Oct 2025 | 4.20% |
| Sep 2025 | 4.39% |

**Trend:** SOFR has declined from 4.39% (Sep 2025) to 3.63% (Jun 2026) — a 76bps drop over 9 months. The forward curve (flat to slight upward slope) implies market consensus for modest rate stability at current levels with slight upward pressure at longer tenors. This calibrates the Monte Carlo `rate_mu = 0.00, rate_sigma = 0.005` assumption from Sprint 3 — confirmed appropriate.

***

## Module 2: FRED API — Complete Integration Code

**Source:** FRED API v2 documentation; Federal Reserve partnership documentation[^8][^9]

**Authentication:** Free registration at fred.stlouisfed.org → API key issued immediately → `FRED_API_KEY` environment variable

```python
# ══════════════════════════════════════════════
# FRED API Integration — Rate Triplet Fetcher
# Sovereign OS: data_feeds/fred_client.py
# ══════════════════════════════════════════════

import os
import requests
from datetime import datetime, date
from functools import lru_cache
from typing import Optional

FRED_BASE = "https://api.stlouisfed.org/fred/series/observations"
FRED_KEY = os.getenv("FRED_API_KEY")

SERIES_MAP = {
    'dgs10': 'DGS10',       # 10-Year Treasury Daily
    'dgs30': 'DGS30',       # 30-Year Treasury Daily
    'dgs5':  'DGS5',        # 5-Year Treasury Daily (ARM benchmark)
    'sofr':  'SOFR',        # SOFR Overnight Daily
    't10y2y': 'T10Y2Y',     # 10Y-2Y Spread (yield curve signal)
    'mortgage30': 'MORTGAGE30US',   # 30yr fixed conforming weekly
    'mortgage15': 'MORTGAGE15US',   # 15yr fixed conforming weekly
    'cpi': 'CPIAUCSL',      # CPI All Urban (expense escalation input)
}

def fetch_latest(series_key: str) -> tuple[float, date]:
    """Fetch most recent observation for a FRED series. Returns (value, obs_date)."""
    sid = SERIES_MAP[series_key]
    resp = requests.get(FRED_BASE, params={
        'series_id': sid,
        'api_key': FRED_KEY,
        'file_type': 'json',
        'sort_order': 'desc',
        'limit': 1,
        'observation_start': '2020-01-01'
    }, timeout=10)
    resp.raise_for_status()
    obs = resp.json()['observations']
    if obs['value'] == '.':  # FRED encodes missing as '.'
        # Fall back to second-most-recent
        resp2 = requests.get(FRED_BASE, params={
            'series_id': sid, 'api_key': FRED_KEY, 'file_type': 'json',
            'sort_order': 'desc', 'limit': 5
        }, timeout=10)
        for o in resp2.json()['observations']:
            if o['value'] != '.':
                return float(o['value']) / 100, datetime.strptime(o['date'], '%Y-%m-%d').date()
    return float(obs['value']) / 100, datetime.strptime(obs['date'], '%Y-%m-%d').date()

def fetch_rate_triplet() -> dict:
    """
    Master rate-fetch function. Called at session open + every 4 hours via Celery.
    Returns canonical rate triplet for all downstream computations.
    """
    dgs10, dgs10_date = fetch_latest('dgs10')
    dgs30, dgs30_date = fetch_latest('dgs30')
    dgs5, dgs5_date   = fetch_latest('dgs5')
    sofr, sofr_date   = fetch_latest('sofr')
    t10y2y, _         = fetch_latest('t10y2y')
    mortgage30, _     = fetch_latest('mortgage30')
    
    return {
        'dgs10': dgs10,               # 10Y Treasury — DSCR rate anchor
        'dgs30': dgs30,               # 30Y Treasury — secondary anchor
        'dgs5': dgs5,                 # 5Y Treasury — ARM benchmark
        'sofr_overnight': sofr,       # SOFR overnight rate
        'mortgage30_conforming': mortgage30,  # Conforming 30yr (rate premium baseline)
        't10y2y_spread': t10y2y,      # Yield curve health indicator
        'fetched_at': datetime.utcnow().isoformat(),
        'dgs10_date': dgs10_date.isoformat(),
        'stale': (date.today() - dgs10_date).days > 2  # Weekend/holiday tolerance
    }

# Celery task: refresh every 4 hours during market hours, once daily overnight
# from celery_config import app as celery_app
# @celery_app.task(bind=True)
# def refresh_rate_triplet(self):
#     triplet = fetch_rate_triplet()
#     cache.set('rate_triplet', triplet, timeout=14400)  # 4hr cache
```

***

## Module 3: CME Term SOFR — Licensing Architecture (Critical Constraint)

**Source:** CME Group SOFR FAQ; CME SOFR API documentation; CME licensing overview[^10][^11][^12]

### The Licensing Requirement — Fully Resolved

CME Term SOFR requires a **Use License (Information License Agreement / ILA)** for any organization using the rates as an input or reference in valuation, pricing, transactional, or benchmarking activities.[^11][^12]

**All parties on the lending side of a loan transaction require a Category One Use License.**[^12]

**Key distinction:**
- **End borrower:** No license required (just being a counterparty)
- **Deal desk doing valuation/pricing:** **Category One Use License required**
- **Distributing CME Term SOFR to third parties:** Distribution License required

### Licensing Cost Architecture

```
OPTION A — Full CME ILA (Category One Use License)
Contact: CME Group directly at cmebenchmarks@cmegroup.com
Cost: Enterprise pricing — not publicly listed
Timeline: 2–4 weeks for contract execution
Use rights: Full use in valuation, pricing, transactional activities

OPTION B — Alternative SOFR Sources (No License Required)
→ SOFR Overnight (Federal Reserve Bank of New York) — FREE, no license
→ 30-Day SOFR Average (NY Fed) — FREE, no license  
→ 90-Day SOFR Average (NY Fed) — FREE, no license
→ SOFR from FRED (series ID: SOFR) — FREE, no license
→ SOFR Swap curve from Tradition Data — market data vendor subscription
→ QuantLib + SOFR Overnight → build implied term structure internally

RECOMMENDED ENGINE APPROACH:
Use NY Fed SOFR Averages + FRED for historical data (free, no license).
Build the forward curve using QuantLib bootstrapping from SOFR futures/swaps.
For ARM reset computations: SOFR 30-Day Average (NY Fed) as index — 
most DSCR ARM products use the 30-day SOFR average, not CME Term SOFR.
Only pursue CME ILA when the engine moves from internal analytics to 
commercial loan pricing/transactional use for external clients.
```

**NY Fed SOFR API (Free, No License):**
```
GET https://markets.newyorkfed.org/read?productCode=50&startDt=2026-01-01&endDt=2026-06-18&eventCodes=520,522,523,524&format=json
```
Returns: SOFR, 30-Day Average, 90-Day Average, 180-Day Average, SOFR Index

***

## Module 4: RentCast API — Full Integration Specification

**Source:** RentCast GitHub documentation; RentCast blog; Reddit developer thread[^13][^14][^15][^16]

### API Overview
- **Coverage:** 140+ million property records, all 50 states
- **Free tier:** 50 API calls/month (Developer plan)
- **Authentication:** `X-Api-Key` header
- **Base URL:** `https://api.rentcast.io/v1/`
- **Documentation:** developers.rentcast.io

### Critical Endpoints for the DSCR Engine

```python
# ══════════════════════════════════════════════
# RentCast API Client — DSCR Engine Integration
# data_feeds/rentcast_client.py
# ══════════════════════════════════════════════

import os, requests
from typing import Optional

RENTCAST_BASE = "https://api.rentcast.io/v1"
RENTCAST_KEY = os.getenv("RENTCAST_API_KEY")
HEADERS = {"X-Api-Key": RENTCAST_KEY, "Content-Type": "application/json"}

def get_rent_estimate(address: str, bedrooms: int, bathrooms: float,
                       property_type: str = "Single Family") -> dict:
    """
    Endpoint: GET /avm/rent/long-term
    Returns: LTR rent estimate + comparable properties + confidence score
    This IS the Form 1007 equivalent for the LTR track.
    """
    resp = requests.get(
        f"{RENTCAST_BASE}/avm/rent/long-term",
        headers=HEADERS,
        params={
            "address": address,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "propertyType": property_type,
            "compCount": 5  # Request 5 comps minimum
        },
        timeout=15
    )
    resp.raise_for_status()
    data = resp.json()
    
    return {
        'ltr_rent_estimate': data.get('rent'),
        'rent_range_low': data.get('rentRangeLow'),
        'rent_range_high': data.get('rentRangeHigh'),
        'confidence_score': data.get('confidence'),    # 0-100
        'comparable_count': len(data.get('comparables', [])),
        'comps': data.get('comparables', []),
        'engine_note': 'Use rent estimate as Form 1007 LTR equivalent. Apply for DSCR computation only after confirming address match.',
        'data_freshness': data.get('lastUpdated'),
        'raw': data
    }

def get_property_value_avm(address: str) -> dict:
    """
    Endpoint: GET /avm/value
    Returns: Property value estimate + range + comparables
    Use: Validate purchase price vs. market; confirm LTV inputs
    """
    resp = requests.get(
        f"{RENTCAST_BASE}/avm/value",
        headers=HEADERS,
        params={"address": address, "compCount": 5},
        timeout=15
    )
    resp.raise_for_status()
    data = resp.json()
    
    return {
        'value_estimate': data.get('price'),
        'value_range_low': data.get('priceRangeLow'),
        'value_range_high': data.get('priceRangeHigh'),
        'confidence_score': data.get('confidence'),
        'comps': data.get('comparables', [])
    }

def get_market_data(zip_code: str, property_type: str = "Single Family") -> dict:
    """
    Endpoint: GET /markets
    Returns: Market-level rent trends, vacancy rates, days on market
    Use: STR market score context; area median rent for floor validation
    """
    resp = requests.get(
        f"{RENTCAST_BASE}/markets",
        headers=HEADERS,
        params={"zipCode": zip_code, "propertyType": property_type},
        timeout=15
    )
    resp.raise_for_status()
    return resp.json()
```

### RentCast Confidence Score Gate

```python
RENTCAST_CONFIDENCE_GATES = {
    'HIGH':   {'min': 80, 'max': 100, 'action': 'USE',
               'note': 'High confidence — use as primary rent input'},
    'MEDIUM': {'min': 60, 'max': 79,  'action': 'USE_WITH_WARN',
               'note': 'Medium confidence — use as estimate; flag for 1007 order confirmation'},
    'LOW':    {'min': 0,  'max': 59,  'action': 'REQUIRE_MANUAL',
               'note': 'Low confidence — RentCast estimate unreliable. Order Form 1007 from licensed appraiser.'},
    'MISSING':{'min': None, 'max': None, 'action': 'REQUIRE_MANUAL',
               'note': 'No RentCast data — property outside coverage or address mismatch. Order Form 1007.'}
}
```

***

## Module 5: AirDNA API — Full Integration Specification

**Source:** AirDNA Enterprise API documentation (airdna.redoc.ly); BNBCalc review; CheckThat.ai platform overview[^17][^18][^19]

### API Overview
- **Coverage:** 10+ million STR properties across 120,000+ global markets; Airbnb, VRBO, Booking.com[^19]
- **Data accuracy:** 97% (self-reported, based on daily scraping of 100% of listings)[^19]
- **Pricing:**
  - Professional plans: **$15–$40/month per market** (entry level for individual markets)[^18]
  - Enterprise/API: **Custom pricing** — contact enterprise@airdna.co
  - Free tier: Limited market data, no Rentalizer access
- **Best for:** DSCR deals where STR income is the primary qualifying metric

### AirDNA Engine Endpoints — STR Track (Track B)

```python
# ══════════════════════════════════════════════
# AirDNA API Client — STR Income Track
# data_feeds/airdna_client.py
# ══════════════════════════════════════════════

import os, requests
AIRDNA_BASE = "https://api.airdna.co/v1"
AIRDNA_KEY = os.getenv("AIRDNA_API_KEY")

def get_str_market_data(market_id: str, months_history: int = 24) -> dict:
    """
    Endpoint: /market/{market_id}/revenue
    Returns: 12–60 months historical monthly revenue, ADR, occupancy
    """
    resp = requests.get(
        f"{AIRDNA_BASE}/market/{market_id}/revenue",
        headers={"Authorization": f"Bearer {AIRDNA_KEY}"},
        params={"months": months_history},
        timeout=20
    )
    resp.raise_for_status()
    return resp.json()

def get_str_property_estimate(address: str, bedrooms: int, bathrooms: float,
                               amenities: list = None) -> dict:
    """
    AirDNA Rentalizer: Property-level STR revenue estimator.
    Returns: Projected annual revenue, occupancy, ADR, comparable listings.
    This is the STR equivalent of Form 1007.
    """
    resp = requests.post(
        f"{AIRDNA_BASE}/rentalizer",
        headers={"Authorization": f"Bearer {AIRDNA_KEY}"},
        json={
            "address": address,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "amenities": amenities or []
        },
        timeout=20
    )
    resp.raise_for_status()
    data = resp.json()
    
    gross_annual = data.get('annual_revenue_estimate')
    gross_monthly = gross_annual / 12 if gross_annual else None
    
    # Apply mandatory haircut (20%) + LTR floor (set externally)
    haircut_pct = 0.20
    adjusted_monthly = gross_monthly * (1 - haircut_pct) if gross_monthly else None
    
    return {
        'gross_annual_estimate': gross_annual,
        'gross_monthly_estimate': gross_monthly,
        'haircut_applied': haircut_pct,
        'adjusted_monthly_income': adjusted_monthly,  # Used in DSCR numerator
        'occupancy_rate': data.get('occupancy_rate'),
        'adr': data.get('average_daily_rate'),
        'comparable_listings': data.get('comparables', []),
        'market_score': data.get('market_score'),
        'engine_note': 'Adjusted income = gross × 0.80. Must also apply LTR floor: use MIN(adjusted_monthly, ltr_rent_estimate) in DSCR numerator.',
        'report_date': data.get('report_date'),
        'report_age_policy': 'Expire after 90 days — re-pull required for underwriting'
    }

def get_market_future_pricing(market_id: str, months_forward: int = 12) -> dict:
    """
    Endpoint: /market/{market_id}/future_pricing
    Returns: 1–12 months of forward daily pricing data
    Use: Seasonal revenue distribution for Monte Carlo inputs
    """
    resp = requests.get(
        f"{AIRDNA_BASE}/market/{market_id}/future_pricing",
        headers={"Authorization": f"Bearer {AIRDNA_KEY}"},
        params={"months": months_forward},
        timeout=20
    )
    resp.raise_for_status()
    return resp.json()
```

### AirDNA Minimum Comparables Gate

```python
STR_AIRDNA_GATES = {
    'comps_minimum': 3,       # < 3 comps → estimate unreliable → require manual
    'report_max_age_days': 90, # Older than 90 days → re-pull required
    'market_score_minimum': 50, # Score < 50 → STR market too weak → flag for LTR track only
    'occupancy_minimum': 0.45,  # < 45% occupancy → STR economics marginal → warn
}
```

***

## Module 6: ATTOM Property Tax API — Full Integration

**Source:** ATTOM Data overview; ATTOM 2025 property tax analysis; Bankrate property tax by state; ATTOM top/bottom tax rate counties[^20][^21][^22][^23]

### API Overview
- **Coverage:** 160+ million properties, 3,000+ U.S. counties, 9,000+ data attributes[^20]
- **Trial:** 30-day free trial for Property API[^24][^20]
- **Pricing:** $499/year starting tier; enterprise $850–$2,000/month for API volume[^25][^26]
- **Formats:** JSON/XML via REST

```python
# ══════════════════════════════════════════════
# ATTOM API Client — Property Tax Integration  
# data_feeds/attom_client.py
# ══════════════════════════════════════════════

import os, requests
ATTOM_BASE = "https://api.developer.attomdata.com/propertyapi/v1.0.0"
ATTOM_KEY = os.getenv("ATTOM_API_KEY")

def get_property_tax(address1: str, address2: str) -> dict:
    """
    Endpoint: /property/detail
    Returns: Tax assessment, effective rate, annual taxes
    address1 = street address, address2 = "City, ST ZIP"
    """
    resp = requests.get(
        f"{ATTOM_BASE}/property/detail",
        headers={"apikey": ATTOM_KEY, "Accept": "application/json"},
        params={"address1": address1, "address2": address2},
        timeout=15
    )
    resp.raise_for_status()
    data = resp.json()
    
    prop = data.get('property', [{}])
    assessment = prop.get('assessment', {})
    taxes = prop.get('taxes', [{}])
    latest_tax = taxes if taxes else {}
    
    return {
        'annual_tax': latest_tax.get('taxamt'),              # Actual tax bill
        'assessed_value': assessment.get('assessed', {}).get('assdttlvalue'),
        'market_value_attom': assessment.get('market', {}).get('mktttlvalue'),
        'effective_rate': latest_tax.get('taxamt') / assessment.get('assessed', {}).get('assdttlvalue', 1) if latest_tax.get('taxamt') else None,
        'tax_year': latest_tax.get('taxyear'),
        'tax_district': prop.get('address', {}).get('county'),
        'monthly_tax': latest_tax.get('taxamt') / 12 if latest_tax.get('taxamt') else None,
        'engine_note': 'Use monthly_tax in PITIA denominator. If None, estimate from state effective rate × purchase_price / 12.',
        'apn': prop.get('identifier', {}).get('apn')
    }
```

### Property Tax State Benchmarks — 2025 ATTOM Data (Fully Sourced)

**Source:** ATTOM 2025 Annual Property Tax Analysis; Bankrate state effective rates[^21][^22][^23]

| Tier | States | Effective Rate | Annual Tax on $494K Home (National Avg) |
|------|--------|---------------|---------------------------------------|
| **Lowest** | Hawaii (0.33%), Idaho (0.39%), Wyoming (0.40%), Arizona, Alabama | 0.33%–0.45% | $1,631–$2,223 |
| **Below Average** | Colorado, South Carolina, Tennessee, Arkansas | 0.46%–0.65% | $2,273–$3,211 |
| **National Average** | National | **0.90%** (2025, up from 0.86% 2024) | **$4,427** |
| **Above Average** | Minnesota, Michigan, Ohio, Pennsylvania | 1.10%–1.50% | $5,434–$7,410 |
| **Highest** | Illinois (~2.27%), New Jersey (~2.23%), Connecticut (~1.79%), Vermont (~1.83%) | 1.79%–2.27% | $8,844–$11,214 |

**National property tax trend:** $396.8 billion levied on 89.6M single-family homes in 2025, up 3.7% YoY. National effective rate: 0.90% (highest since 2020). Engine must apply annual upward drift of +3–4% to forward property tax projections in the Monte Carlo.[^21]

### Property Tax Fallback Table (When ATTOM Returns No Data)

```python
STATE_TAX_RATE_FALLBACK = {
    # Effective property tax rate — use only when ATTOM API returns null
    # Source: ATTOM 2025 Annual Tax Analysis
    'AL': 0.0041, 'AK': 0.0098, 'AZ': 0.0044, 'AR': 0.0057, 'CA': 0.0075,
    'CO': 0.0050, 'CT': 0.0179, 'DE': 0.0052, 'FL': 0.0089, 'GA': 0.0083,
    'HI': 0.0033, 'ID': 0.0039, 'IL': 0.0227, 'IN': 0.0083, 'IA': 0.0147,
    'KS': 0.0141, 'KY': 0.0083, 'LA': 0.0052, 'ME': 0.0108, 'MD': 0.0099,
    'MA': 0.0104, 'MI': 0.0148, 'MN': 0.0108, 'MS': 0.0062, 'MO': 0.0093,
    'MT': 0.0073, 'NE': 0.0145, 'NV': 0.0059, 'NH': 0.0189, 'NJ': 0.0223,
    'NM': 0.0058, 'NY': 0.0171, 'NC': 0.0077, 'ND': 0.0091, 'OH': 0.0152,
    'OK': 0.0089, 'OR': 0.0084, 'PA': 0.0142, 'RI': 0.0138, 'SC': 0.0049,
    'SD': 0.0117, 'TN': 0.0059, 'TX': 0.0157, 'UT': 0.0044, 'VT': 0.0183,
    'VA': 0.0082, 'WA': 0.0092, 'WV': 0.0059, 'WI': 0.0160, 'WY': 0.0040,
    'DC': 0.0053
}

def estimate_monthly_tax(purchase_price: float, state: str, 
                          attom_annual_tax: float = None) -> dict:
    if attom_annual_tax:
        return {'monthly_tax': round(attom_annual_tax / 12, 2),
                'source': 'ATTOM actual', 'confidence': 'HIGH'}
    rate = STATE_TAX_RATE_FALLBACK.get(state, 0.0090)  # Default: national avg
    annual_est = purchase_price * rate
    return {'monthly_tax': round(annual_est / 12, 2),
            'source': f'State fallback rate ({rate:.2%})',
            'confidence': 'MEDIUM',
            'note': 'Replace with ATTOM actual before final underwriting'}
```

***

## Module 7: HouseCanary AVM — Integration Specification

**Source:** HouseCanary blog; BatchData API comparison; G2 reviews[^27][^28][^25]

### API Overview
- **Coverage:** 136+ million U.S. properties[^25]
- **Distinction:** Third-party testing recognizes HouseCanary as **most accurate residential AVM** in the market[^27]
- **Pricing:** $79/month ($790/year); basic endpoints $0.30–$0.50/call; premium (AVM) $4.00–$6.00/call[^25]
- **Models:** Monthly update cycle using ML from thousands of sources
- **Best use in engine:** Second AVM validation check when RentCast confidence is MEDIUM or property is high-value (>$1M)

```python
# ══════════════════════════════════════════════
# HouseCanary API Client — AVM Validation
# data_feeds/housecanary_client.py
# ══════════════════════════════════════════════

import os, requests
HOUSECANARY_BASE = "https://api.housecanary.com/v2"
HC_KEY = os.getenv("HOUSECANARY_API_KEY")
HC_SECRET = os.getenv("HOUSECANARY_API_SECRET")

def get_property_avm(address: str, zipcode: str) -> dict:
    """
    Endpoint: GET /property/value
    Returns: AVM value, range, confidence, forecast
    Premium endpoint: ~$4.00–$6.00 per call
    """
    resp = requests.get(
        f"{HOUSECANARY_BASE}/property/value",
        auth=(HC_KEY, HC_SECRET),
        params={"address": address, "zipcode": zipcode},
        timeout=15
    )
    resp.raise_for_status()
    data = resp.json()
    
    result = data.get('property/value', {}).get('result', {})
    
    return {
        'avm_value': result.get('price_mean'),
        'avm_low': result.get('price_lwr'),
        'avm_high': result.get('price_upr'),
        'fsd': result.get('fsd'),           # Forecast Standard Deviation = confidence proxy
        'confidence': 'HIGH' if result.get('fsd', 1) < 0.1 else 'MEDIUM',
        'source': 'HouseCanary AVM (most accurate residential AVM per 3rd-party testing)',
        'note': 'Use as LTV validation. If HC AVM < purchase price by >10%: flag LTV recalculation.'
    }

def get_rental_value(address: str, zipcode: str) -> dict:
    """
    Endpoint: GET /property/rental_value
    Returns: Rental AVM estimate + range
    """
    resp = requests.get(
        f"{HOUSECANARY_BASE}/property/rental_value",
        auth=(HC_KEY, HC_SECRET),
        params={"address": address, "zipcode": zipcode},
        timeout=15
    )
    resp.raise_for_status()
    data = resp.json()
    result = data.get('property/rental_value', {}).get('result', {})
    
    return {
        'rental_value_monthly': result.get('rent_mean'),
        'rental_value_low': result.get('rent_lwr'),
        'rental_value_high': result.get('rent_upr'),
        'source': 'HouseCanary Rental AVM',
        'confidence': 'HIGH' if result else 'MEDIUM'
    }
```

***

## Module 8: FastAPI Engine Architecture — Full Endpoint Map

**Source:** FastAPI documentation; Auth0 FastAPI best practices[^29][^30]

### Complete API Router Structure

```
dscr-engine/
├── main.py                    # FastAPI app init + CORS + middleware
├── routers/
│   ├── deal.py               # POST /deal/analyze — master deal endpoint
│   ├── rates.py              # GET /rates/live — current rate triplet
│   ├── rent.py               # GET /rent/estimate — RentCast + HC
│   ├── str.py                # GET /str/estimate — AirDNA STR track
│   ├── tax.py                # POST /tax/property — ATTOM + fallback
│   ├── lender.py             # GET /lender/matrix — lender fit scores
│   ├── compliance.py         # GET /compliance/state — PPP + STR gates
│   ├── monte_carlo.py        # POST /monte-carlo/stress — 10K trials
│   ├── after_tax.py          # POST /tax/after-tax-irr — full IRR
│   └── memo.py               # POST /memo/generate — IC memo PDF
├── models/
│   ├── deal.py               # Pydantic deal request + response schemas
│   ├── lender.py             # Pydantic lender database models
│   └── compliance.py         # State compliance data models
├── data_feeds/
│   ├── fred_client.py        # FRED API
│   ├── rentcast_client.py    # RentCast API
│   ├── airdna_client.py      # AirDNA API
│   ├── attom_client.py       # ATTOM API
│   └── housecanary_client.py # HouseCanary AVM
├── engines/
│   ├── dscr_dual_track.py    # Core DSCR computation (LTR + STR)
│   ├── aey_engine.py         # AEY / XIRR cost of capital
│   ├── monte_carlo.py        # t-copula Monte Carlo stress engine
│   ├── after_tax_irr.py      # OBBBA + §1250 + NIIT + PAL
│   ├── arm_engine.py         # QuantLib ARM reset computation
│   ├── ppp_engine.py         # PPP computation + exit penalty
│   └── lender_scorer.py      # Lender fit scoring algorithm
├── compliance/
│   ├── ppp_state_matrix.py   # 50-state PPP rules
│   ├── str_legality.py       # STR city/state prohibition map
│   └── insurance_gate.py     # Flood + wildfire kill criterion
├── evidence_vault/
│   ├── vault.py              # PostgreSQL evidence store + decay
│   └── migrations/           # Alembic migrations
├── tasks/
│   └── celery_tasks.py       # Rate refresh + PPP threshold re-index
└── output/
    ├── ic_memo.py            # reportlab PDF IC memo generator
    └── templates/            # Jinja2 memo templates
```

### Master Deal Endpoint — Pydantic Schema

```python
from pydantic import BaseModel, Field, validator
from typing import Optional, Literal
from enum import Enum

class PropertyType(str, Enum):
    SFR = "SFR"
    CONDO = "Condo"
    TWO_UNIT = "2-Unit"
    THREE_UNIT = "3-Unit"
    FOUR_UNIT = "4-Unit"
    WARRANTABLE_CONDO = "Warrantable Condo"

class TransactionType(str, Enum):
    PURCHASE = "Purchase"
    RATE_TERM_REFI = "Rate-Term Refi"
    CASH_OUT_REFI = "Cash-Out Refi"

class VestingType(str, Enum):
    LLC = "LLC"
    CORP = "Corp"
    TRUST = "Trust"
    INDIVIDUAL = "Individual"
    LP = "LP"

class TaxFilingStatus(str, Enum):
    MFJ = "MFJ"
    SINGLE = "Single"
    HH = "HH"
    MFS = "MFS"

class DealRequest(BaseModel):
    # Property
    address: str = Field(..., min_length=10, description="Full property address")
    city: str
    state: str = Field(..., min_length=2, max_length=2)
    zip_code: str = Field(..., min_length=5, max_length=5)
    property_type: PropertyType
    
    # Loan
    purchase_price: float = Field(..., gt=50000, lt=10_000_000)
    loan_amount: float = Field(..., gt=50000)
    transaction_type: TransactionType
    vesting_type: VestingType
    
    # Borrower
    fico_score: int = Field(..., ge=580, le=850)
    verified_reserves_months: float = Field(..., ge=0)
    is_rep: bool = False  # Real Estate Professional status
    magi: float = Field(..., ge=0, description="Modified Adjusted Gross Income")
    filing_status: TaxFilingStatus = TaxFilingStatus.MFJ
    marginal_tax_rate: float = Field(..., ge=0.10, le=0.37)
    
    # Income inputs
    gross_monthly_rent_ltr: Optional[float] = None  # If known; else pull from RentCast
    is_str: bool = False
    gross_annual_str_estimate: Optional[float] = None  # If known; else pull from AirDNA
    
    # Deal parameters
    hold_years: int = Field(default=5, ge=1, le=30)
    annual_appreciation_pct: float = Field(default=0.035, ge=-0.10, le=0.20)
    cost_seg_elected: bool = False
    land_value_pct: float = Field(default=0.20, ge=0.05, le=0.50)
    
    # Fees/costs
    monthly_hoa: float = Field(default=0, ge=0)
    annual_insurance_estimate: Optional[float] = None
    
    @validator('loan_amount')
    def loan_not_exceed_price(cls, v, values):
        if 'purchase_price' in values and v > values['purchase_price']:
            raise ValueError('Loan amount cannot exceed purchase price')
        return v
    
    @property
    def ltv(self) -> float:
        return self.loan_amount / self.purchase_price
    
    class Config:
        use_enum_values = True

class DealResponse(BaseModel):
    # Verdicts
    track_a_verdict: str           # STRONG / STANDARD / CONDITIONAL / MARGINAL / DOES_NOT_MEET
    track_b_verdict: Optional[str] # STR track (if applicable)
    
    # Core computations
    track_a_dscr: float
    track_b_dscr: Optional[float]
    effective_qualifying_dscr: float
    
    # Rate and cost
    estimated_rate_range: tuple
    true_aey: Optional[float]
    
    # Returns
    pre_tax_irr: Optional[float]
    after_tax_irr: Optional[float]
    equity_multiple: Optional[float]
    
    # Lender matrix
    lender_rankings: list
    
    # Compliance flags
    ppp_state_gate: str
    str_legality_gate: Optional[str]
    insurance_gate: str
    flood_zone_gate: str
    
    # Data confidence
    data_confidence_score: float   # 0–100
    evidence_vault_id: str         # UUID for audit trail
    
    # Generated output
    monte_carlo_summary: Optional[dict]
    ic_memo_url: Optional[str]
```

***

## Module 9: PostgreSQL Evidence Vault — Schema + Decay Architecture

```sql
-- ══════════════════════════════════════════════
-- Evidence Vault Schema
-- Sovereign OS: evidence_vault/migrations/001_initial.sql
-- ══════════════════════════════════════════════

CREATE TABLE evidence_claims (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id         UUID REFERENCES deals(id) ON DELETE CASCADE,
    claim_type      VARCHAR(50) NOT NULL,      -- 'rent_estimate', 'str_income', 'rate', 'tax', 'insurance', 'lender_quote'
    claim_value     NUMERIC(18,6) NOT NULL,
    claim_unit      VARCHAR(20),               -- 'USD', 'PCT', 'RATIO', 'MONTHS'
    
    source_name     VARCHAR(200) NOT NULL,      -- 'RentCast API', 'FRED DGS10', 'Visio Lender Matrix'
    source_url      TEXT,
    source_type     VARCHAR(50) NOT NULL,       -- 'API_LIVE', 'LENDER_MATRIX', 'STATUTE', 'APPRAISAL', 'MANUAL'
    
    confidence_score NUMERIC(5,2),             -- 0–100
    
    fetched_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until     TIMESTAMPTZ,               -- NULL = use decay rules below
    
    -- Decay rules by source type (days until stale)
    -- API_LIVE: rate data = 1 day, rent = 30 days, tax = 365 days
    -- LENDER_MATRIX: 30 days
    -- STATUTE: 365 days (manual re-verify trigger)
    -- APPRAISAL: 120 days (USPAP)
    -- MANUAL: 14 days
    
    decay_days      INTEGER NOT NULL,
    is_stale        BOOLEAN GENERATED ALWAYS AS (
        fetched_at + (decay_days || ' days')::interval < NOW()
    ) STORED,
    
    raw_response    JSONB,                     -- Full API response preserved
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-flag stale claims on deal retrieval
CREATE INDEX idx_evidence_stale ON evidence_claims (deal_id, is_stale);
CREATE INDEX idx_evidence_claim_type ON evidence_claims (deal_id, claim_type);

-- Decay constants (application layer)
COMMENT ON COLUMN evidence_claims.decay_days IS 
'API_LIVE rate: 1 | API_LIVE rent: 30 | API_LIVE tax: 365 | LENDER_MATRIX: 30 | STATUTE: 365 | APPRAISAL: 120 | MANUAL: 14';

-- Deals table
CREATE TABLE deals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address         TEXT NOT NULL,
    state           CHAR(2) NOT NULL,
    property_type   VARCHAR(50),
    purchase_price  NUMERIC(15,2),
    loan_amount     NUMERIC(15,2),
    fico_score      INTEGER,
    
    -- Final computed outputs
    track_a_dscr    NUMERIC(6,4),
    track_b_dscr    NUMERIC(6,4),
    final_verdict   VARCHAR(20),
    
    -- Lender selections
    lender_ranked_1 VARCHAR(200),
    lender_ranked_2 VARCHAR(200),
    lender_aey_1    NUMERIC(8,4),
    lender_aey_2    NUMERIC(8,4),
    
    -- Returns
    pre_tax_irr     NUMERIC(8,4),
    after_tax_irr   NUMERIC(8,4),
    
    -- Metadata
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    deal_status     VARCHAR(30) DEFAULT 'DRAFT',  -- DRAFT / SUBMITTED / APPROVED / DECLINED / CLOSED
    approved_lender VARCHAR(200),
    
    -- XGBoost training label (filled post-close)
    outcome         VARCHAR(20)   -- 'APPROVED', 'DECLINED', 'WITHDRAWN'
);

-- XGBoost training features table (approve/decline signal accumulation)
CREATE TABLE deal_ml_features (
    deal_id         UUID PRIMARY KEY REFERENCES deals(id),
    fico_score      INTEGER,
    ltv             NUMERIC(5,4),
    dscr            NUMERIC(6,4),
    state           CHAR(2),
    property_type   VARCHAR(50),
    loan_amount     NUMERIC(15,2),
    reserves_months NUMERIC(5,1),
    is_str          BOOLEAN,
    ppp_selected    BOOLEAN,
    vesting_type    VARCHAR(20),
    rate_at_app     NUMERIC(6,4),
    outcome         VARCHAR(20)   -- Label for training
);
```

***

## Module 10: Data Freshness Manifest — Complete API Cost Architecture

| API | Free Tier | Paid Tier | Cost Per Call | Engine Use |
|-----|-----------|-----------|--------------|-----------|
| **FRED** | Unlimited (API key) | N/A | $0.00 | Rate triplet; DGS10, SOFR, CPI — every session |
| **NY Fed SOFR** | Unlimited, no key | N/A | $0.00 | SOFR averages; ARM reset index |
| **RentCast** | 50 calls/month | From $29/month for 1,000 calls | ~$0.03–$0.05 | LTR rent estimate per deal |
| **AirDNA** | Limited (no Rentalizer) | $15–$40/month per market | Custom enterprise | STR estimate per STR deal |
| **ATTOM** | 30-day trial | $499/year; $850–$2,000/month API | Custom per volume | Property tax + APN lookup |
| **HouseCanary** | None (trial available) | $79/month + $4–$6/premium call | $4.00–$6.00/AVM | AVM validation for >$1M deals |
| **CME Term SOFR** | View only | ILA license required for use | Enterprise | Defer — use NY Fed SOFR instead |

**Operational cost at 100 deals/month:**
- FRED: $0
- NY Fed SOFR: $0
- RentCast (100 calls): ~$29/month (1K plan)
- AirDNA (STR deals only, est. 20%): ~$20/month (single market plan × 2)
- ATTOM (100 tax calls): ~$42/month (at $499/yr plan rate)
- HouseCanary (premium deals >$1M, est. 10): ~$50/month
- **Total data feed cost at 100 deals/month: ~$141/month ($1.41/deal)**

At 1,000 deals/month (scale), marginal cost falls dramatically as ATTOM and RentCast enterprise pricing kicks in.

***

## Sprint 5 Research Gaps Resolved

| Gap | Status | Finding |
|-----|--------|---------|
| FRED API authentication | ✅ CONFIRMED | Free API key; env var `FRED_API_KEY`; JSON endpoint fully documented |
| DGS10 current value | ✅ LIVE | 4.43% (June 16, 2026) |
| SOFR overnight current value | ✅ LIVE | 3.63% (June 16, 2026) |
| CME Term SOFR live values | ✅ CONFIRMED | 1M: 3.637%, 3M: 3.668%, 6M: 3.731%, 12M: 3.869% (June 16, 2026) |
| CME SOFR licensing requirement | ✅ RESOLVED | Category One Use License (ILA) required for valuation/pricing use. Defer — use NY Fed SOFR 30-day average as ARM index instead (free, no license) |
| RentCast API full spec | ✅ CONFIRMED | 50 free calls/month; X-Api-Key header; /avm/rent/long-term endpoint |
| AirDNA API full spec | ✅ CONFIRMED | Enterprise custom pricing; Rentalizer endpoint for property-level estimates; $15–$40/month per market (individual) |
| ATTOM API pricing | ✅ CONFIRMED | $499/year; 30-day free trial; 30-min property/detail endpoint |
| HouseCanary pricing | ✅ CONFIRMED | $79/month; $4–$6/premium AVM call; most accurate AVM per 3rd-party testing |
| Property tax state rates | ✅ CONFIRMED | Full 50-state table from ATTOM 2025 Annual Tax Analysis; national avg 0.90% effective rate |
| FastAPI architecture pattern | ✅ CONFIRMED | Router-based modular structure; Pydantic schemas with validators; CORS middleware |
| PostgreSQL evidence vault schema | ✅ DESIGNED | Complete schema with auto-decay via generated STORED column |
| SOFR forward curve for ARM reset | ✅ CONFIRMED | SOFR swap curve from Tradition Data: flat at 3.62–3.72% through 10Y → ARM resets may actually reduce rates below initial rate |
| XGBoost training data schema | ✅ DESIGNED | deal_ml_features table with outcome label column |

## Sprint 6 Queue — Final Synthesis, QA Audit & Master Deployment Checklist

| Task | Priority | Action |
|------|----------|--------|
| Full DSCR computation integration test (sample deal end-to-end) | CRITICAL | Run sample deal through every module |
| QuantLib ARM reset engine — full implementation with SOFR curve | CRITICAL | QuantLib + scipy integration |
| Monte Carlo full integration test — 10K trials, t-copula, output distribution | CRITICAL | Confirm pyxirr + scipy.stats output |
| IC memo PDF template — full reportlab implementation | HIGH | reportlab + Jinja2 |
| Optimal Blue PPE partner enrollment (broker access for live rate quotes) | HIGH | Submit application at optimalblue.com |
| Celery task configuration: rate refresh (4hr), PPP threshold (annual Jan), AirDNA report expiry (90d) | HIGH | Redis + Celery setup |
| Section 1071 data collection scaffold (if lender role) | MEDIUM | Jan 2028 deadline — build now |
| Final master gap audit — compare all 35 Sprint 1 gaps against all 5 sprint outputs | CRITICAL | Audit CSV reconciliation |
| Build-vs-buy analysis: YieldStack, Optimal Blue, Cotality integration vs. native build | MEDIUM | Finalize vendor decisions |

---

## References

1. [Market Yield on U.S. Treasury Securities at 10-Year ... - FRED](https://fred.stlouisfed.org/series/DGS10) - Market Yield on U.S. Treasury Securities at 10-Year Constant Maturity, Quoted on an Investment Basis...

2. [Market Yield on U.S. Treasury Securities at 10-Year Constant ...](https://fred.stlouisfed.org/series/GS10) - Market Yield on U.S. Treasury Securities at 10-Year Constant Maturity, Quoted on an Investment Basis...

3. [Secured Overnight Financing Rate (SOFR) - FRED](https://fred.stlouisfed.org/series/SOFR) - Secured Overnight Financing Rate (SOFR) ; 2026-06-10: 3.59 ; 2026-06-09: 3.60 ; 2026-06-08: 3.63 ; 2...

4. [What is the current SOFR rate? We provide the latest data ...](https://sofracademy.com/current-sofr-rates/) - 30 - Day Average SOFR, △ 3.60872, 17-June-2026 ; 90 - Day Average SOFR, △ 3.63617, 17-June-2026 ; 18...

5. [CME Term SOFR interest rates](https://www.global-rates.com/en/interest-rates/cme-term-sofr/) - The CME Term SOFR rates are interest rates published by the Chicago Mercantile Exchange (CME) and ar...

6. [SOFR Data | Daily, Historical SOFR Rates & Forward Curves](https://www.traditiondata.com/products/usd-sofr/) - What is the current SOFR rate? – Example SOFR swap data ; 12th Jun 2026 · 11th Jun 2026 · 10th Jun 2...

7. [Secured Overnight Financing Rate / SOFR Index](https://www.hsh.com/mortgage-rates/arm-indices/SOFR-secured-overnight-financing-rate.html) - ARM Indexes: SOFR - Secured Overnight Financing Rate / SOFR Rate / SOFR Index from June 2025 to June...

8. [St. Louis Fed Web Services: FRED® API](https://fred.stlouisfed.org/docs/api/fred/) - The FRED® API, Version 2 is ideal for anyone who is interested to retrieve observations for all seri...

9. [Data Download Program and Federal Reserve Economic ...](https://www.federalreserve.gov/data/data-download-fred-information.htm) - An API enables users to write programs and build applications that retrieve economic data from FRED....

10. [CME Term SOFR API](https://www.cmegroup.com/market-data/market-data-api/cme-term-sofr-api.html) - The CME Term SOFR API delivers CME Term SOFR Reference Rates that provide a forward-looking measurem...

11. [CME Term SOFR Reference Rates ‒ Frequently Asked ...](https://www.cmegroup.com/articles/faqs/cme-term-sofr-reference-rates.html) - The CME Term SOFR Reference Rates benchmark is a daily set of forward-looking interest rate estimate...

12. [A look at CME Term SOFR](https://www.cmegroup.com/education/courses/introduction-to-sofr/a-look-at-cme-term-sofr) - Derived from CME SOFR futures, CME Term SOFR provides a robust and resilient underlying data set bas...

13. [Start Using the RentCast API With Detailed Video Tutorials](https://www.rentcast.io/blog/start-using-rentcast-api-with-detailed-video-tutorials) - In this tutorial, you'll use the RentCast API valuation endpoints to retrieve property value and ren...

14. [A new property and rental data API by RentCast - Reddit](https://www.reddit.com/r/RealEstateTechnology/comments/141k94x/a_new_property_and_rental_data_api_by_rentcast/) - A new property and rental data API by RentCast · Get access to 140+ million property records, owner ...

15. [RentCast API](https://github.com/RentCast) - Our real estate and property data API provides access to 140+ million property records, owner detail...

16. [New Feature: Introducing the RentCast Real Estate API](https://www.rentcast.io/blog/introducing-rentcast-real-estate-api) - Our new RentCast API gives you instant access to 140+ million property records, owner details, value...

17. [AirDNA Enterprise API](https://airdna.redoc.ly) - Pricing Data. Average Revenue; Average Daily Rate; RevPAR (Revenue Per Available Rental) ... pricing...

18. [AirDNA Review 2026: The Honest Investor's Guide to STR ...](https://www.bnbcalc.com/reviews/airdna-review-2026) - Professional Plans: Typically start around $15–$40/month per market for individual market subscripti...

19. [AirDNA: Details, Reviews, Pricing, & Features](https://checkthat.ai/brands/airdna) - AirDNA is a market intelligence platform that tracks 10 million+ short-term rental properties to pro...

20. [ATTOM Data Overview (2026): Property, Ownership, and ...](https://blog.iq.dwellsy.com/attom-data-overview-2026-property-ownership-and-market-data-explained/) - ATTOM Data is a property data provider for real estate investors and lenders. Pricing starts at $499...

21. [ATTOM 2025 Property Tax Analysis Average Bills Up 3%](https://www.attomdata.com/news/market-trends/home-sales-prices/2025-annual-tax-report/) - Nationwide, the effective tax rate for single-family homes in 2025 was 0.9 percent, up from 0.86 per...

22. [Top 10 U.S. Counties with Highest Effective Property Tax ...](https://www.attomdata.com/news/market-trends/figuresfriday/top-10-u-s-counties-with-highest-effective-property-tax-rates-in-2025/) - Hawaii (0.33 percent) posted the lowest effective tax rate, followed by Idaho (0.39 percent), Wyomin...

23. [Property Tax Rates By State](https://www.bankrate.com/mortgages/property-tax-by-state/) - This table shows the effective tax rate by state for tax year 2024, based on data from ATTOM Data So...

24. [10 Best Real Estate APIs in 2026 (Listings, Rent Estimates ...](https://api.market/blog/magicapi/real-estate/best-real-estate-api) - You send a request, you get back structured property data in JSON format: rent estimates, active lis...

25. [Top Real Estate APIs for Workflow Automation in 2026](https://batchdata.io/blog/top-apis-for-real-estate-workflow-automation) - HouseCanary's Automated Valuation Models (AVMs) are updated monthly using real-time market data. Its...

26. [What is the price of Attom data? : r/RealEstateTechnology](https://www.reddit.com/r/RealEstateTechnology/comments/1b76bfz/what_is_the_price_of_attom_data/) - rinse sand edge memorize roof innate innocent detail smell wine

This post was mass deleted and anon...

27. [HouseCanary Data Reviews & Product Details](https://www.g2.com/products/housecanary-data/reviews) - Third-party testing recognizes HouseCanary's automated valuation model (AVM) as the most accurate re...

28. [10 Best Real Estate APIs in 2026 + Use Cases](https://www.housecanary.com/blog/real-estate-api) - HouseCanary's Data Explorer API delivers granular and actionable real estate data. The platform prov...

29. [Bigger Applications - Multiple Files](https://fastapi.tiangolo.com/tutorial/bigger-applications/) - You can put everything in a single file. FastAPI provides a convenience tool to structure your appli...

30. [FastAPI Best Practices](https://auth0.com/blog/fastapi-best-practices/) - Understand the architectural patterns, testing strategies, and design principles required to turn a ...

