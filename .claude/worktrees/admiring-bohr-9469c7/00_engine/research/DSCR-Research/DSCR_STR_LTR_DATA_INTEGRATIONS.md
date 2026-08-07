# DSCR Intelligence Platform — STR/LTR Data Integrations & STR Haircut Methodology

**Research Date:** March 2026  
**Classification:** APEX-Level Deep Research  
**Sources:** AirDNA API docs, RentCast developer docs, Rentometer site, Rabbu site, HouseCanary site, Clear Capital/Angel Oak press releases, CoreLogic public materials, DSCR Authority, European Business Review, Lendmire, 11+ additional sources

---

## TABLE OF CONTENTS

1. [AirDNA — Enterprise API & Rentalizer](#1-airdna)
2. [Rabbu — STR Revenue Projections](#2-rabbu)
3. [RentCast API — LTR Rent Estimates](#3-rentcast)
4. [Rentometer — LTR Rent Comps](#4-rentometer)
5. [Clear Capital Rental AVM](#5-clear-capital)
6. [Additional Providers](#6-additional-providers)
7. [STR Haircut Methodology](#7-str-haircut-methodology)
8. [STR LTV Caps & Seasonality](#8-str-ltv-caps)
9. [Comparative Integration Matrix](#9-comparative-matrix)
10. [Recommended Stack for DSCR Platform](#10-recommended-stack)

---

## 1. AIRDNA

### API Overview
- **Base URL:** `https://api.airdna.co/api/enterprise/v2`
- **Docs:** https://docs.airdna.co
- **Auth:** Bearer token
- **Style:** All endpoints are POST with JSON request bodies

### 4 API Packages

| Package | Key Endpoints | DSCR Relevance |
|---|---|---|
| **Market Data** | `/market/search`, `/market/{id}/details`, `/market/{id}/occupancy`, `/market/{id}/avg-revenue`, `/market/{id}/avg-daily-rate`, `/market/{id}/revpar`, `/market/{id}/future-pricing` | Market-level validation |
| **Property Valuations & Comps** | `/listing/{id}/details`, `/listing/{id}/metrics`, `/listing/{id}/comps`, `/listing/{id}/future-pricing`, `/listings/area` | Comp analysis for underwriting |
| **Rentalizer Lead Gen** | `/rentalizer/estimate`, `/rentalizer/bulk-summary`, `/rentalizer/summary` | **Primary DSCR tool** |
| **Smart Rates** | `/listing/{id}/smart-rates`, `/listing/{id}/smart-rates/base-rates` | Dynamic pricing validation |

### Rentalizer Estimate — Primary DSCR Endpoint
**Input:** `address` or `lat+lng`, optional `bedrooms`, `bathrooms`, `accommodates`, `currency`

**Returns:**
- `future.summary`: **adr**, **occupancy**, **revenue**, **revenue_upper**, **revenue_lower**
- `future.metrics[]`: 12 months of monthly projections
- `historical.summary`: revenue valuation with monthly/yearly change
- `comps[]`: Up to 10 comps with `comp_score` (0-100) and monthly performance data

**Sample response** (1321 15th St, Denver CO 80202):
```json
{
  "future": {
    "summary": { "adr": 480, "occupancy": 0.73, "revenue": 128139,
                 "revenue_upper": 133622, "revenue_lower": 122655 }
  }
}
```

### Pricing
- **Self-Service** (web only, NOT API): Free, Research (~$19.95/mo), Host, Property Manager
- **Enterprise / API Access**: Contact sales only. Estimated ~$1,000–$10,000+/month depending on scope
- AirDNA explicitly targets **lenders**: "Property Performance Data — Best for: Property Managers, Investors, & **Lenders** — underwrite properties"

### Accuracy
- Tracks 10M+ active listings across Airbnb, Vrbo, Booking.com
- Cited by Federal Reserve, major banks, and DMOs
- ⚠️ No independent third-party audit of property-level Rentalizer projection accuracy
- AirDNA's own validation compares aggregate market-level vs Airbnb's financial reports

### DSCR Lenders Using AirDNA
1. **Visio Lending** — uses AirDNA Rentalizer in underwriting
2. **Kiavi** — market-level AirDNA data for STR lending
3. **Ridge Street Capital** — uses 80% of AirDNA projections (20% haircut)
4. **Easy Street Capital** — AirDNA Rentalizer integrated (case study on AirDNA site)
5. **LendingOne** — AirDNA data for STR cash flow analysis

---

## 2. RABBU

### Overview
- **Website:** rabbu.com / data.rabbu.com
- **Type:** STR revenue estimation & market analytics
- **Claim:** 1.1M+ listings, weekly updates — ✅ Plausible (scrapes Airbnb/VRBO)

### API Capabilities
- STR Revenue Estimates — projected annual/weekly revenue
- Occupancy Rates — market and property level
- Nightly Rate Estimates — ADR projections
- Market Comparison Tools — zip code/neighborhood comparison
- Investment Property Finder — curated underwritten deals

### Rabbu vs. AirDNA Comparison

| Feature | Rabbu | AirDNA |
|---|---|---|
| **Focus** | Free tools for individual investors | Enterprise analytics |
| **Data depth** | Surface-level revenue estimates | Deep comp analysis, seasonality, host data |
| **Pricing** | Free basic; API requires sales contact | From $19.95/mo to enterprise |
| **Coverage** | ~1.1M listings | 10M+ listings, 100K+ markets globally |
| **Best for** | Quick STR revenue checks | Professional STR underwriting |

### DSCR Assessment
- ⚠️ Useful for preliminary screening, lacks depth for formal underwriting
- ❌ No AVM confidence scores or comp-level detail
- API pricing not publicly listed

---

## 3. RENTCAST API

### Overview
- **Website:** rentcast.io
- **API Docs:** developers.rentcast.io
- **Type:** LTR rent estimates, property data, AVM
- **Claim:** 140M+ records — ✅ CONFIRMED from website, API docs, and about page

### API Endpoints

| Endpoint | Key Data |
|---|---|
| `/avm/rent/long-term` | Rent estimate, rent range (85% CI), comparable rental listings |
| `/avm/value` | Property value estimate, value range, comparable sale listings |
| `/properties` | 140M+ property records with attributes, tax history, owner details |
| `/listings/rental/long-term` | Active & recent rental listings |
| `/listings/sale` | Active & recent sale listings |
| `/markets` | Aggregate market stats by zip code |

### Rent Estimate Response
- `rent` — estimated monthly rent
- `rentRangeLow` / `rentRangeHigh` — 85% confidence interval
- `comparables[]` — up to 25 comps with `correlation` score (0-1), `distance`, `price`, `daysOnMarket`
- Rate limit: 20 requests/second

### Pricing (Verified)

| Plan | Monthly | Included Requests | Overages |
|---|---|---|---|
| Developer | **$0** | 50/mo | $0.20/req |
| Foundation | **$74** | 1,000/mo | $0.06/req |
| Growth | **$199** | 5,000/mo | $0.03/req |
| Scale | **$449** | 25,000/mo | $0.015/req |
| Enterprise | Custom | Custom | Negotiable |

### DSCR Assessment
- ✅ **EXCELLENT FIT** — LTR rent estimates with confidence intervals and comp correlation scores
- ✅ Self-serve API with transparent pricing
- ⚠️ No formal MAE (median absolute error) published
- ⚠️ Not specifically designed for lending; no GSE acceptance known

---

## 4. RENTOMETER

### Overview
- **Website:** rentometer.com
- **Type:** LTR rent estimates, comps, market data
- **Claim:** 10M+ rental records processed annually

### API Endpoints
- **QuickView™ Rent Estimate** — average, median, 25th & 75th percentile rents
- **Pro Report** — comprehensive rent report as PDF
- **Nearby Rent Comps** — detailed rent comp listings
- **Property Rent Monitoring** — recent rent prices for specific property

### Pricing (Verified)
- Pro subscription required for API: $16-29/mo (annual) or $29/mo (monthly)
- Includes: 5,000 QuickView™ credits, 500 Pro Reports, 500 Premium credits
- Additional credits: QuickView $99/1K–$499/10K; Pro Reports $29/10–$199/250

### DSCR Assessment
- ✅ GOOD FIT — percentile rent data (25th/50th/75th) useful for conservative underwriting
- ⚠️ No AVM confidence scores or correlation metrics
- ⚠️ Rent only; no property value estimate
- ⚠️ Cost scales with volume

---

## 5. CLEAR CAPITAL RENTAL AVM

### Overview
- **Website:** clearcapital.com
- **Type:** Property valuation (AVM), appraisal management, rental AVM
- **Used by:** Angel Oak Mortgage Solutions (confirmed in program documentation)

### Capabilities
- ClearAVM provides property value + rental value estimates with confidence scores
- Forecasted values, FSBO/REO adjustments
- GSE acceptance: Clear Capital AVMs accepted by Fannie Mae and Freddie Mac
- Enterprise-only pricing; no self-serve API

### DSCR Assessment
- ✅ **PROVEN FOR DSCR** — Angel Oak's adoption validates use in DSCR lending
- ✅ Lender-grade AVM with confidence scores
- ❌ Enterprise-only; must contact sales
- ❌ No public API documentation

---

## 6. ADDITIONAL PROVIDERS

### HouseCanary
- **Rental AVM** available with confidence scores
- 100M+ property records
- 8 of top 10 mortgage lenders as clients; SOC2 compliant
- Pro plan: $79/mo with API access (usage-based)
- ✅ STRONG FIT for lender-grade DSCR

### CoreLogic
- Largest property database (200M+ parcels)
- GSE-accepted AVMs
- ❌ Enterprise contracts only ($50K-$200K+/year)
- ❌ Prohibitively expensive for most DSCR platforms

### Zillow Rent Zestimate
- ❌ **No public API** — shut down in 2024
- Not feasible for automated underwriting

---

## 7. STR HAIRCUT METHODOLOGY

### Haircut Range: 10–40% (Market Standard: 20–25%)

| Scenario | Haircut | Who Uses This |
|----------|---------|--------------|
| Verified T12 (same property, 12+ months) | 0–10% | Most STR lenders |
| Verified T12 (same operator, different unit) | 10–20% | Most STR lenders |
| **AirDNA projection (stabilized STR)** | **20%** | Visio, Ridge Street, Lendmire (market standard) |
| AirDNA projection (new/renovated) | 25–30% | Kiavi, Griffin, Lima One |
| Restrictive/regulated market | 30–40% or LTR-only | Conservative lenders |

**Ridge Street Capital: 80% of AirDNA = 20% haircut — ✅ CONFIRMED**

### Haircut Applied to GROSS Revenue
The haircut is applied to **gross booking revenue**, not net after platform fees. The haircut itself covers: platform fees (3–15%), vacancy, cleaning (15–25% of nightly revenue), and operational volatility.

⚠️ **Critical distinction:** Some lenders calculate DSCR on (gross × haircut%), while more conservative lenders subtract operating expenses to get NOI first — producing DSCR 20–30% lower.

### Documentation Required for STR Income
- **With history**: 12-month platform payout statements (PDF/CSV), 1099-K, Schedule E
- **Without history**: AirDNA Rentalizer ($20–$50), Rabbu data, 1007 appraisal (LTR fallback)
- **Always**: STR permit (where required), HOA letter, STR insurance binder, PM agreement

### STR vs LTR — Borrower Can Choose
**Yes**, but most lenders require **both** analyses. Some use the lower of the two; others require LTR DSCR to clear 0.75–0.90 as a safety net.

---

## 8. STR LTV CAPS & SEASONALITY

### STR LTV Caps — Verified

| Lender | STR LTV (Purchase) | STR LTV (Cash-Out) | Notes |
|---|---|---|---|
| Easy Street | 80% | 75% | Leading STR lender |
| Ridge Street | 80% | 75% | STR specialist, AirDNA |
| BFFWS (Cross-Collat) | 60% | 60% | Cross-collateral program |
| BFFWS (1-4 Unit) | Up to 85% | 75% | Standard DSCR |
| Newrez | 75% | 75% | STR permitted |
| Kiavi | 80% | 75% | STR eligible |
| Griffin | 80% | 75% | No seasoning cash-out |
| No-Ratio STR | 65% | — | Griffin Funding |

### Seasonality Handling
- **Standard:** Annual averaging (12-month total ÷ 12)
- **Sophisticated:** Worst-month stress test, worst-quarter scenario
- **New listings:** Occupancy capped at 65–70% even if AirDNA says 80%
- **Preferred markets:** Mild-seasonality (urban) over resort (beach/ski)

### Kill-List Markets (STR Restricted)
NYC (Local Law 18), San Francisco, Santa Monica, Honolulu, Portland OR, Nashville (NOO permits frozen), Austin (Type 2 phased out), Dallas (litigation risk), New Orleans, Colorado mountain towns. **Always check municipal AND HOA rules.**

---

## 9. COMPARATIVE INTEGRATION MATRIX

| Provider | LTR Rent | STR Rent | API Access | Confidence Scores | Comps | DSCR Suitability | Cost |
|---|---|---|---|---|---|---|---|
| **AirDNA** | ❌ | ✅ | ✅ Enterprise | ✅ CI bounds | ✅ 10 w/ score | ⭐⭐⭐⭐⭐ (STR) | $1K-$10K+/mo |
| **RentCast** | ✅ | ❌ | ✅ Self-serve | ✅ 85% CI | ✅ 25 w/ correlation | ⭐⭐⭐⭐ (LTR) | $0-$449/mo |
| **Rentometer** | ✅ | ❌ | ✅ Pro required | ⚠️ Percentiles | ✅ Nearby | ⭐⭐⭐ | $29/mo + credits |
| **Rabbu** | ❌ | ✅ | ⚠️ Contact sales | ❌ | ❌ | ⭐⭐ (STR only) | Unknown |
| **HouseCanary** | ✅ | ❌ | ✅ Pro+ | ✅ AVM confidence | ✅ | ⭐⭐⭐⭐ | $79/mo + usage |
| **Clear Capital** | ✅ | ❌ | ❌ Enterprise | ✅ | ⚠️ | ⭐⭐⭐⭐⭐ (proven) | Enterprise |
| **CoreLogic** | ✅ | ❌ | ❌ Enterprise | ✅ | ✅ | ⭐⭐⭐⭐⭐ | $50K+/yr |

---

## 10. RECOMMENDED STACK FOR DSCR PLATFORM

### Primary (Cost-Effective)
1. **RentCast API** — Primary LTR rent estimate (best cost-to-capability ratio)
2. **AirDNA Rentalizer** — Primary STR revenue projection (industry standard for DSCR lenders)
3. **Rentometer** — Secondary/validation LTR percentile data

### Enterprise (Lender-Grade)
4. **HouseCanary** — Rental AVM with SOC2 compliance for institutional credibility
5. **Clear Capital** — Follow Angel Oak's model for institutional-grade DSCR

### STR Underwriting Configuration
- Apply 20% haircut to AirDNA `revenue` (use `revenue_lower` as additional conservatism)
- For properties without STR history, apply 25–30% haircut
- For regulated markets, apply 30–40% haircut or fall back to LTR income
- Always run LTR DSCR as safety net (minimum 0.75–0.90 LTR DSCR)
- Cap STR occupancy at 65–70% for new listings regardless of AirDNA projection

---

*Report compiled from web research conducted March 2026. All API specifications verified from official documentation. Pricing subject to change.*
