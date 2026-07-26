# Rent Data API Deep-Test — Technical Integration Specification

**Date:** March 2026  
**Classification:** APEX-Level Technical Specification  
**Sources:** RentCast API docs (developers.rentcast.io), AirDNA enterprise API (docs.airdna.co), Rentometer API, prior DSCR platform research, live API documentation scraping

---

## TABLE OF CONTENTS

1. [RentCast API — Deep Technical Specs](#1-rentcast-api)
2. [AirDNA Enterprise API — Deep Technical Specs](#2-airdna-enterprise-api)
3. [API Response Comparison & Normalization](#3-api-response-comparison)
4. [Accuracy Benchmarks & Confidence Scoring](#4-accuracy-benchmarks)
5. [Fallback Strategy](#5-fallback-strategy)
6. [Caching Strategy](#6-caching-strategy)
7. [Integration Architecture](#7-integration-architecture)
8. [Cost Projection](#8-cost-projection)
9. [Implementation Checklist](#9-implementation-checklist)

---

## 1. RENTCAST API

### 1.1 Base Configuration

| Field | Value |
|---|---|
| **Base URL** | `https://api.rentcast.io/v1` |
| **Protocol** | HTTPS / REST |
| **Auth** | API Key in `X-Api-Key` header |
| **Format** | JSON (request + response) |
| **Method** | `GET` only (all endpoints) |
| **Rate Limit** | **20 requests/second** per API key (hard limit, all plans) |

### 1.2 Primary Endpoint: Rent Estimate (LTR)

```
GET /avm/rent/long-term
```

**Full URL:** `https://api.rentcast.io/v1/avm/rent/long-term`

#### Request Parameters (Query String)

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `address` | string | Yes* | — | Full address: `Street, City, State, Zip` (e.g., `5500 Grand Lake Dr, San Antonio, TX, 78244`) |
| `latitude` | float | Yes* | — | Latitude (alternative to `address`) |
| `longitude` | float | Yes* | — | Longitude (alternative to `address`) |
| `propertyType` | string (enum) | No | `""` | `Single Family` \| `Condo` \| `Townhouse` \| `Manufactured` \| `Multi-Family` \| `Apartment` |
| `bedrooms` | float | No | `""` | Number of bedrooms. `0` = studio |
| `bathrooms` | float | No | `""` | Number of bathrooms. Supports fractions (e.g., `2.5`) |
| `squareFootage` | float | No | `""` | Total indoor living area in sq ft |
| `maxRadius` | float | No | — | Max distance for comps in miles |
| `daysOld` | integer | No | — | Max age of comp listings in days (min: 1) |
| `compCount` | integer | No | `5` | Number of comps (5–25, default 15 if not provided) |
| `lookupSubjectAttributes` | boolean | No | `true` | Auto-lookup property attributes from address |

\* Provide either `address` OR `latitude`+`longitude`. Address required for `lookupSubjectAttributes`.

#### Response Schema (200 OK)

```json
{
  "rent": 1620,
  "rentRangeLow": 1550,
  "rentRangeHigh": 1690,
  "subjectProperty": {
    "id": "5500-Grand-Lake-Dr,-San-Antonio,-TX-78244",
    "formattedAddress": "5500 Grand Lake Dr, San Antonio, TX 78244",
    "addressLine1": "5500 Grand Lake Dr",
    "addressLine2": null,
    "city": "San Antonio",
    "state": "TX",
    "stateFips": "48",
    "zipCode": "78244",
    "county": "Bexar",
    "countyFips": "029",
    "latitude": 29.476011,
    "longitude": -98.351454,
    "propertyType": "Single Family",
    "bedrooms": 3,
    "bathrooms": 2,
    "squareFootage": 1878,
    "lotSize": 8843,
    "yearBuilt": 1973,
    "lastSaleDate": "2024-11-18T00:00:00.000Z",
    "lastSalePrice": 270000
  },
  "comparables": [
    {
      "id": "7306-Kingsland-Dr,-San-Antonio,-TX-78244",
      "formattedAddress": "7306 Kingsland Dr, San Antonio, TX 78244",
      "addressLine1": "7306 Kingsland Dr",
      "addressLine2": null,
      "city": "San Antonio",
      "state": "TX",
      "zipCode": "78244",
      "county": "Bexar",
      "countyFips": "029",
      "latitude": 29.473782,
      "longitude": -98.344684,
      "propertyType": "Single Family",
      "bedrooms": 3,
      "bathrooms": 2,
      "squareFootage": 1835,
      "lotSize": 7405,
      "yearBuilt": 1997,
      "status": "Inactive",
      "price": 1627,
      "listingType": "Standard",
      "listedDate": "2025-02-06T00:00:00.000Z",
      "removedDate": "2025-02-07T00:00:00.000Z",
      "lastSeenDate": "2025-02-06T05:09:03.727Z",
      "daysOnMarket": 1,
      "distance": 0.4359,
      "daysOld": 210,
      "correlation": 0.9873
    }
  ]
}
```

#### Key Response Field Definitions

| Field | Type | Description |
|---|---|---|
| `rent` | number | Estimated monthly rent (AVM output) |
| `rentRangeLow` | number | Lower boundary of 85% confidence interval |
| `rentRangeHigh` | number | Upper boundary of 85% confidence interval |
| `subjectProperty.*` | object | Auto-looked-up or provided property attributes |
| `comparables[].correlation` | number | **0–1 similarity score** (1 = 100% similar). Sorted descending. |
| `comparables[].distance` | number | Distance from subject property in miles |
| `comparables[].daysOld` | number | Days since comp was last seen active |
| `comparables[].price` | number | Listed rent of the comparable |
| `comparables[].status` | string | `Active` or `Inactive` |

#### Multi-Family Special Behavior
- `/avm/rent/long-term` returns rent estimate for a **single unit**, NOT the entire building
- For multi-family DSCR, multiply unit rent × number of units (require unit count as user input)
- `/avm/value` returns value estimate for the **entire building**

### 1.3 Secondary Endpoints

#### Value Estimate
```
GET /avm/value?address={address}
```
Returns: `price`, `priceRangeLow`, `priceRangeHigh` (85% CI), `subjectProperty`, `comparables[]`

#### Market Data
```
GET /markets?zipCode={zipCode}
```
Returns: Average/median rents by property type & bedroom count, days on market, listing counts, historical trends by month

#### Property Records
```
GET /properties?address={address}
```
Returns: Full property record with tax history, owner details, features

#### Rental Listings
```
GET /listings/rental/long-term?address={address}
```
Returns: Active and recent rental listings with status, price, days on market

### 1.4 Error Codes

| Code | Error ID | Description |
|---|---|---|
| `200` | — | Success |
| `400` | `resource/bad-request` | Invalid/missing parameters. Body: `{"status":400,"error":"resource/bad-request","message":"The provided address '...' could not be parsed or geolocated"}` |
| `401` | `auth/api-key-invalid` | Missing or invalid API key |
| `401` | `billing/subscription-inactive` | API subscription not active or billing issue |
| `404` | — | No data found for query parameters |
| `405` | — | Method not allowed (only GET supported) |
| `429` | `auth/rate-limit-exceeded` | Rate limit exceeded (20 req/sec). Body: `{"status":429,"error":"auth/rate-limit-exceeded","message":"The rate limit of 20 requests per second has been exceeded"}` |
| `500` | — | Internal server error |
| `504` | — | Server timeout |

### 1.5 Pricing (Verified from Live Site)

| Plan | Monthly | Included Requests | Overage Rate |
|---|---|---|---|
| **Developer** | **$0** | 50/mo | $0.20/req |
| **Foundation** | **$74** | 1,000/mo | $0.06/req |
| **Growth** | **$199** | 5,000/mo | $0.03/req |
| **Scale** | **$449** | 25,000/mo | $0.015/req |
| **Enterprise** | Custom | Custom | Negotiable |

- Billing: Monthly, no long-term contracts
- Overage: Charged per request beyond included limit
- Only successful requests (HTTP 200) are billed
- 85% and 100% usage notification emails sent
- Unused requests do NOT carry over between billing periods

### 1.6 Improving Rent Estimate Accuracy

**Best Practice (from RentCast docs):**
1. Always provide `address` (not lat/lng) to enable `lookupSubjectAttributes=true`
2. Provide `propertyType`, `bedrooms`, `bathrooms`, `squareFootage` if known — these override auto-looked-up values
3. Use `compCount=20` (matches RentCast website default)
4. Use `maxRadius=5` for suburban/rural; `maxRadius=2` for dense urban
5. Use `daysOld=270` for standard; `daysOld=90` in rapidly appreciating markets
6. **Critical:** If too few comps match criteria, you'll get a 400 error — increase `maxRadius` or `daysOld`

### 1.7 Correlation Score Interpretation

| Correlation | Quality | Meaning |
|---|---|---|
| **0.95–1.0** | Excellent | Near-identical property (same type, beds, baths, sqft, proximity) |
| **0.85–0.94** | Good | Strong similarity, minor differences |
| **0.70–0.84** | Moderate | Same area, somewhat different property |
| **0.50–0.69** | Weak | Significantly different property or distant |
| **< 0.50** | Poor | Should be excluded from underwriting |

**DSCR Platform Rule:** If the top comp correlation < 0.70, flag the estimate as **LOW CONFIDENCE**.

---

## 2. AIRDNA ENTERPRISE API

### 2.1 Base Configuration

| Field | Value |
|---|---|
| **Base URL** | `https://api.airdna.co/api/enterprise/v2` |
| **Docs** | https://docs.airdna.co |
| **Protocol** | HTTPS / REST |
| **Auth** | Bearer token in `Authorization: Bearer {token}` header |
| **Format** | JSON (request + response) |
| **Method** | `POST` for all endpoints (JSON body) |
| **Rate Limit** | Enterprise-dependent (negotiated in contract) |
| **Webhooks** | ❌ Not available |
| **Bulk/Batch** | ✅ `/rentalizer/bulk-summary` endpoint available |

### 2.2 API Packages (4 Tiers)

| Package | Key Endpoints | DSCR Relevance |
|---|---|---|
| **Market Data** | `/market/search`, `/market/{id}/details`, `/market/{id}/occupancy`, `/market/{id}/avg-revenue`, `/market/{id}/avg-daily-rate`, `/market/{id}/revpar`, `/market/{id}/future-pricing` | Market-level validation |
| **Property Valuations & Comps** | `/listing/{id}/details`, `/listing/{id}/metrics`, `/listing/{id}/comps`, `/listing/{id}/future-pricing`, `/listings/area` | Comp analysis for underwriting |
| **Rentalizer Lead Gen** | `/rentalizer/estimate`, `/rentalizer/bulk-summary`, `/rentalizer/summary` | **PRIMARY DSCR TOOL** |
| **Smart Rates** | `/listing/{id}/smart-rates`, `/listing/{id}/smart-rates/base-rates` | Dynamic pricing validation |

### 2.3 Primary Endpoint: Rentalizer Estimate (STR)

```
POST /rentalizer/estimate
```

**Full URL:** `https://api.airdna.co/api/enterprise/v2/rentalizer/estimate`

#### Request Body

```json
{
  "address": "1321 15th St, Denver, CO 80202",
  "bedrooms": 2,
  "bathrooms": 2,
  "accommodates": 4,
  "currency": "USD"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `address` | string | Yes* | Full property address |
| `latitude` | float | Yes* | Property latitude (alternative) |
| `longitude` | float | Yes* | Property longitude (alternative) |
| `bedrooms` | integer | No | Number of bedrooms |
| `bathrooms` | integer | No | Number of bathrooms |
| `accommodates` | integer | No | Max guest capacity |
| `currency` | string | No | `USD` (default) |

\* Provide `address` OR `latitude`+`longitude`

#### Response Schema (200 OK)

```json
{
  "future": {
    "summary": {
      "adr": 480,
      "occupancy": 0.73,
      "revenue": 128139,
      "revenue_upper": 133622,
      "revenue_lower": 122655
    },
    "metrics": [
      {
        "month": "2026-04",
        "adr": 450,
        "occupancy": 0.68,
        "revenue": 9180,
        "revenue_upper": 9567,
        "revenue_lower": 8793
      }
    ]
  },
  "historical": {
    "summary": {
      "revenue": 115000,
      "monthly_change": 0.03,
      "yearly_change": 0.08
    }
  },
  "comps": [
    {
      "id": "abc123",
      "address": "1400 15th St, Denver, CO 80202",
      "comp_score": 92,
      "bedrooms": 2,
      "bathrooms": 2,
      "occupancy": 0.75,
      "adr": 490,
      "revenue": 134000
    }
  ]
}
```

#### Key Response Field Definitions

| Field | Type | Description |
|---|---|---|
| `future.summary.adr` | number | Average Daily Rate (projected, next 12 months) |
| `future.summary.occupancy` | float | Occupancy rate (0–1, projected) |
| `future.summary.revenue` | number | **Annual gross revenue** (projected) |
| `future.summary.revenue_upper` | number | Upper bound of revenue estimate |
| `future.summary.revenue_lower` | number | Lower bound of revenue estimate |
| `future.metrics[]` | array | 12 months of monthly ADR/occupancy/revenue projections |
| `historical.summary.revenue` | number | Trailing 12-month actual revenue (if available) |
| `comps[].comp_score` | integer | **0–100 similarity score** (100 = identical) |
| `comps[].revenue` | number | Annual revenue of comp property |

### 2.4 Bulk Endpoint

```
POST /rentalizer/bulk-summary
```

Accepts array of addresses for batch processing. Returns summary projections for each.

### 2.5 Pricing

| Access Level | Cost | Notes |
|---|---|---|
| **Self-Service** (web only) | Free – ~$19.95/mo | NO API access |
| **Enterprise / API** | **~$1,000–$10,000+/month** | Contact sales, negotiated per contract |
| **Per-call estimate** | ~$0.10–$0.50/call | Depends on volume and package |

**Key insight:** AirDNA does NOT offer self-serve API access. All API usage requires an enterprise contract negotiated with their sales team.

### 2.6 Lenders Using AirDNA (Verified)

1. **Visio Lending** — AirDNA Rentalizer in underwriting
2. **Kiavi** — Market-level AirDNA data for STR lending
3. **Ridge Street Capital** — 80% of AirDNA projections (20% haircut)
4. **Easy Street Capital** — AirDNA integrated (case study on AirDNA site)
5. **LendingOne** — AirDNA data for STR cash flow analysis

---

## 3. API RESPONSE COMPARISON & NORMALIZATION

### 3.1 Side-by-Side for Same Address

| Metric | RentCast (LTR) | AirDNA (STR) |
|---|---|---|
| **Rent type** | Monthly long-term rent | Nightly rate × occupancy = annual revenue |
| **Primary output** | `rent` = $1,620/mo | `revenue` = $128,139/yr |
| **Range** | `rentRangeLow` / `rentRangeHigh` (85% CI) | `revenue_lower` / `revenue_upper` |
| **Comps** | 5–25 rental listings | Up to 10 active STR listings |
| **Confidence** | `correlation` (0–1) per comp | `comp_score` (0–100) per comp |
| **Property details** | Auto-looked up from DB | User-provided or inferred |
| **Seasonality** | Not included | Monthly breakdown in `metrics[]` |

### 3.2 Normalization to Monthly Rent for DSCR

```typescript
// RentCast LTR — already monthly
const ltrMonthlyRent = rentCastResponse.rent;

// AirDNA STR — convert annual revenue to monthly equivalent
const strMonthlyRent = airdnaResponse.future.summary.revenue / 12;

// Apply lender haircut to STR
const haircutPct = 0.20; // Standard 20% haircut
const strMonthlyRentAfterHaircut = strMonthlyRent * (1 - haircutPct);

// Conservative approach: use revenue_lower with haircut
const strConservativeMonthly = airdnaResponse.future.summary.revenue_lower / 12 * (1 - haircutPct);

// DSCR calculation for each mode
const dscr_ltr = ltrMonthlyRent * 12 / annualDebtService;
const dscr_str = strMonthlyRentAfterHaircut * 12 / annualDebtService;
```

### 3.3 Normalization Rules

| Rule | Implementation |
|---|---|
| **LTR rent** | Use `rent` directly (already monthly) |
| **STR revenue** | Divide `revenue` by 12 for monthly equivalent |
| **STR haircut** | Apply 20% standard (configurable per lender) |
| **STR conservative** | Use `revenue_lower / 12 * (1 - haircut)` |
| **Min DSCR** | Require LTR DSCR ≥ 0.75 as safety net |
| **Kill-switch** | If STR market is regulated, force LTR-only mode |

---

## 4. ACCURACY BENCHMARKS & CONFIDENCE SCORING

### 4.1 RentCast Accuracy

| Metric | Value | Source |
|---|---|---|
| **Published MAE** | ❌ Not published | No formal accuracy study found |
| **Confidence interval** | 85% CI (`rentRangeLow` to `rentRangeHigh`) | RentCast API documentation |
| **Coverage** | 140M+ property records, all 50 states | Verified from API docs |
| **AVM basis** | Weighted average of comparable rental listings | RentCast valuation methodology docs |
| **Comp quality** | Sorted by `correlation` score (0–1) | API response structure |

**Deriving a proxy MAE from the range:**
- If `rent = $1,620`, `rentRangeLow = $1,550`, `rentRangeHigh = $1,690`
- Half-range = ($1,690 - $1,550) / 2 = $70
- The 85% CI half-width divided by 1.44 (z-score for 85% two-tailed) ≈ $49
- Approximate 1-sigma error ≈ $49, or ~3% of rent
- **Estimated MAE: ~3–8% depending on market density**

### 4.2 AirDNA Accuracy

| Metric | Value | Source |
|---|---|---|
| **Published property-level MAE** | ❌ Not independently audited | AirDNA own materials |
| **Aggregate validation** | Market-level vs Airbnb financial reports | AirDNA methodology |
| **Data sources** | 10M+ active listings (Airbnb, Vrbo, Booking.com) | AirDNA marketing |
| **Federal Reserve citation** | ✅ Used by Fed for STR market analysis | Public record |
| **Revenue CI bounds** | `revenue_lower` / `revenue_upper` provided | API response |

**AirDNA accuracy caveats:**
- Rentalizer is designed for **lead generation**, not underwriting
- Revenue projections are forward-looking estimates with inherent uncertainty
- Occupancy in new/regulating markets is unreliable
- Seasonal markets (beach/ski) have much wider variance

### 4.3 Confidence Scoring Model for DSCR Platform

```typescript
interface RentConfidence {
  score: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNRELIABLE';
  factors: string[];
  suggestedHaircut: number;
}

function assessRentConfidence(
  rentCast: RentCastResponse,
  airdna: AirDNAResponse | null,
  market: MarketContext
): { ltr: RentConfidence; str: RentConfidence } {
  
  // LTR confidence assessment
  const ltrFactors: string[] = [];
  let ltrScore: number = 100;
  
  // Factor 1: Comp count
  const compCount = rentCast.comparables?.length ?? 0;
  if (compCount < 5) { ltrScore -= 30; ltrFactors.push('Fewer than 5 comps'); }
  else if (compCount < 10) { ltrScore -= 10; ltrFactors.push('Fewer than 10 comps'); }
  
  // Factor 2: Top comp correlation
  const topCorrelation = rentCast.comparables?.[0]?.correlation ?? 0;
  if (topCorrelation < 0.70) { ltrScore -= 25; ltrFactors.push('Top comp correlation < 0.70'); }
  else if (topCorrelation < 0.85) { ltrScore -= 10; ltrFactors.push('Top comp correlation < 0.85'); }
  
  // Factor 3: Range width (as % of rent)
  const rent = rentCast.rent;
  const rangeWidth = (rentCast.rentRangeHigh - rentCast.rentRangeLow) / rent;
  if (rangeWidth > 0.20) { ltrScore -= 20; ltrFactors.push('Wide confidence interval (>20%)'); }
  else if (rangeWidth > 0.12) { ltrScore -= 10; ltrFactors.push('Moderate confidence interval'); }
  
  // Factor 4: Comp recency
  const avgDaysOld = rentCast.comparables?.reduce((s, c) => s + c.daysOld, 0) / compCount;
  if (avgDaysOld > 180) { ltrScore -= 15; ltrFactors.push('Stale comps (avg >180 days)'); }
  
  // Factor 5: Market density
  if (market.isRural) { ltrScore -= 15; ltrFactors.push('Rural market (low data density)'); }
  
  // STR confidence assessment
  let strScore: number = 100;
  const strFactors: string[] = [];
  
  if (!airdna) {
    strScore = 0;
    strFactors.push('No STR data available');
  } else {
    const compScore = airdna.comps?.[0]?.comp_score ?? 0;
    if (compScore < 60) { strScore -= 25; strFactors.push('Low comp score (<60)'); }
    
    const occupancy = airdna.future.summary.occupancy;
    if (occupancy > 0.85) { strScore -= 15; strFactors.push('Unrealistically high occupancy (>85%)'); }
    
    const revenueSpread = (airdna.future.summary.revenue_upper - airdna.future.summary.revenue_lower) 
                          / airdna.future.summary.revenue;
    if (revenueSpread > 0.15) { strScore -= 10; strFactors.push('Wide revenue spread (>15%)'); }
    
    if (market.isRegulated) { strScore -= 30; strFactors.push('STR-regulated market'); }
    if (market.isSeasonal) { strScore -= 15; strFactors.push('Highly seasonal market'); }
  }
  
  return {
    ltr: scoreToConfidence(ltrScore, ltrFactors),
    str: scoreToConfidence(strScore, strFactors)
  };
}

function scoreToConfidence(score: number, factors: string[]): RentConfidence {
  if (score >= 80) return { score: 'HIGH', factors, suggestedHaircut: 0.20 };
  if (score >= 60) return { score: 'MEDIUM', factors, suggestedHaircut: 0.25 };
  if (score >= 40) return { score: 'LOW', factors, suggestedHaircut: 0.35 };
  return { score: 'UNRELIABLE', factors, suggestedHaircut: 0.40 };
}
```

### 4.4 Confidence Score Summary

| Score | LTR Threshold | STR Threshold | Haircut | UI Display |
|---|---|---|---|---|
| **HIGH** | ≥80 pts | ≥80 pts | 20% | 🟢 Green |
| **MEDIUM** | 60–79 | 60–79 | 25% | 🟡 Yellow |
| **LOW** | 40–59 | 40–59 | 35% | 🟠 Orange |
| **UNRELIABLE** | <40 | <40 | 40% or LTR-only | 🔴 Red |

---

## 5. FALLBACK STRATEGY

### 5.1 Decision Tree

```
User enters address
    │
    ├── Call RentCast /avm/rent/long-term (parallel)
    ├── Call AirDNA /rentalizer/estimate (parallel, if enterprise contract active)
    │
    ├── Both return data?
    │   ├── YES → Calculate both LTR and STR DSCR, apply confidence scoring
    │   └── NO → Enter fallback chain
    │
    ├── Fallback Chain (LTR):
    │   ├── 1. RentCast returned data → Use it (even if LOW confidence)
    │   ├── 2. RentCast 404 (no data) → Try Rentometer QuickView API
    │   ├── 3. Rentometer fails → Try RentCast /markets endpoint for zip-level average
    │   ├── 4. Zip-level fails → Manual entry mode (user provides rent)
    │   └── 5. Appraiser referral (1007 form) for formal valuation
    │
    └── Fallback Chain (STR):
        ├── 1. AirDNA returned data → Use it (apply appropriate haircut)
        ├── 2. AirDNA 404 (rural/no STR market) → LTR-only mode
        ├── 3. Wide revenue spread → Use revenue_lower with 30% haircut
        └── 4. Kill-list market → Force LTR-only, flag as restricted
```

### 5.2 Specific Fallback Scenarios

| Scenario | Response | UI Message |
|---|---|---|
| RentCast 404 (rural address) | Try Rentometer, then zip-level average | "Limited rental data for this area. Estimate based on market averages." |
| RentCast wide range (>20%) | Use `rentRangeLow` as conservative estimate | "Low confidence area. Using conservative rent estimate." |
| AirDNA no data (rural) | LTR-only mode | "No STR data available. LTR DSCR calculation only." |
| AirDNA occupancy >85% | Cap at 70%, flag warning | "Occupancy projection seems high. Capped at 70% for new listings." |
| Kill-list market (NYC, etc.) | Force LTR-only, block STR calculation | "STR income not eligible in this market. LTR DSCR only." |
| Both APIs fail | Manual entry mode | "No automated rent data available. Please enter rent manually or order an appraisal." |

### 5.3 Rentometer as Backup

| Feature | Details |
|---|---|
| **Endpoint** | QuickView™ Rent Estimate |
| **Output** | Average, median, 25th & 75th percentile rents |
| **Cost** | $99/1,000 credits ($0.099/call) — $499/10,000 credits ($0.050/call) |
| **Pro subscription required** | ~$29/month |
| **Advantage** | Percentile data enables conservative underwriting (use 25th percentile) |
| **Disadvantage** | No correlation scores, no comp-level detail |

---

## 6. CACHING STRATEGY

### 6.1 Refresh Cadence

| Data Type | Refresh Interval | Rationale |
|---|---|---|
| **RentCast rent estimate** | 30 days | Rent changes slowly in LTR markets |
| **RentCast market data** | 7 days | Market trends shift weekly |
| **AirDNA STR projection** | 14 days | STR markets shift with seasons |
| **AirDNA comp data** | 30 days | Active listing turnover ~30 days |
| **Property records** | 90 days | Physical attributes rarely change |
| **User-overridden rent** | Never (user-controlled) | Manual entries persist until changed |

### 6.2 Caching Architecture

```typescript
interface CachedRentData {
  address: string;
  source: 'rentcast' | 'airdna' | 'rentometer' | 'manual';
  dataType: 'ltr_rent' | 'str_projection' | 'market_data' | 'property_record';
  response: any;
  fetchedAt: string; // ISO 8601
  expiresAt: string; // ISO 8601
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNRELIABLE';
  etag?: string; // For conditional requests if API supports
}
```

### 6.3 ToS Compliance

| Provider | Caching Policy | Key Restriction |
|---|---|---|
| **RentCast** | ✅ Caching allowed | Cannot resell/redistribute raw data; can display in your application |
| **AirDNA** | ✅ Caching allowed (enterprise) | Enterprise contract governs; typically allows internal caching for 30 days |
| **Rentometer** | ⚠️ Check ToS | Credit-based system; each call costs credits regardless of caching |

**RentCast ToS (from billing docs):** "You will also not be billed for requests that return an error" — this means cached responses should be stored to avoid redundant calls.

**AirDNA Enterprise:** Typical enterprise contracts allow caching for internal use with 30-day refresh. Confirm in contract negotiation.

### 6.4 Stale Data Handling

```typescript
function getRentData(address: string): Promise<RentData> {
  const cached = cache.get(cacheKey(address));
  
  if (cached && !isExpired(cached)) {
    return cached.response; // Fresh cache hit
  }
  
  if (cached && isStale(cached)) {
    // Return stale data immediately, refresh in background
    refreshInBackground(address);
    return { ...cached.response, _stale: true, _lastUpdated: cached.fetchedAt };
  }
  
  // No cache or completely expired
  return fetchFresh(address);
}

function isStale(cached: CachedRentData): boolean {
  const age = Date.now() - new Date(cached.fetchedAt).getTime();
  const ttl = Date.now() - new Date(cached.expiresAt).getTime();
  return age > ttl * 0.7; // Stale at 70% of TTL
}
```

**UI Indication for Stale Data:**
- Fresh (< 70% of TTL): No indicator
- Stale (70–100% of TTL): Small "Updated X days ago" label
- Expired (> TTL): "Data may be outdated. Click to refresh."

---

## 7. INTEGRATION ARCHITECTURE

### 7.1 System Flow

```
┌─────────────┐
│  User enters │
│   address    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────┐
│   Backend: Rent Data Service     │
│                                  │
│  1. Check cache for address      │
│  2. If fresh cache → return      │
│  3. If stale/expired:            │
│     ┌──────────┐ ┌───────────┐  │
│     │ RentCast │ │  AirDNA   │  │
│     │  /avm/   │ │ /rental-  │  │
│     │ rent/    │ │ izer/     │  │
│     │long-term │ │ estimate  │  │
│     └────┬─────┘ └─────┬─────┘  │
│          │  (parallel)  │        │
│          ▼              ▼        │
│  4. Merge & normalize responses │
│  5. Apply confidence scoring    │
│  6. Apply lender haircuts       │
│  7. Calculate LTR & STR DSCR    │
│  8. Cache with timestamp        │
│  9. Return to frontend          │
└──────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│   Frontend: Results Display      │
│                                  │
│  ┌─────────────────────────────┐ │
│  │ LTR Mode                    │ │
│  │  Rent: $1,620/mo            │ │
│  │  Range: $1,550–$1,690       │ │
│  │  Confidence: HIGH 🟢        │ │
│  │  DSCR: 1.35                 │ │
│  ├─────────────────────────────┤ │
│  │ STR Mode                    │ │
│  │  Revenue: $128,139/yr       │ │
│  │  Monthly Eq: $10,678/mo     │ │
│  │  After 20% haircut: $8,543  │ │
│  │  Confidence: MEDIUM 🟡      │ │
│  │  DSCR: 1.42                 │ │
│  ├─────────────────────────────┤ │
│  │ Mode Toggle: LTR | STR | Both│ │
│  └─────────────────────────────┘ │
└──────────────────────────────────┘
```

### 7.2 TypeScript Service Implementation

```typescript
// rent-data.service.ts

interface RentEstimateRequest {
  address: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  lenderId?: string; // For lender-specific haircut config
}

interface RentEstimateResult {
  address: string;
  ltr: {
    source: 'rentcast' | 'rentometer' | 'manual';
    rent: number;
    rentRangeLow: number;
    rentRangeHigh: number;
    comps: Comp[];
    confidence: ConfidenceScore;
    dscr: number;
    monthlyPayment: number;
  };
  str: {
    source: 'airdna' | null;
    annualRevenue: number;
    monthlyEquivalent: number;
    haircutApplied: number;
    monthlyAfterHaircut: number;
    occupancy: number;
    adr: number;
    comps: STRComp[];
    confidence: ConfidenceScore;
    dscr: number;
  } | null;
  metadata: {
    fetchedAt: string;
    cachedAt: string | null;
    cacheExpiresAt: string;
    warnings: string[];
  };
}

class RentDataService {
  private rentCastClient: RentCastClient;
  private airdnaClient: AirDNAClient;
  private rentometerClient: RentometerClient;
  private cache: RentDataCache;
  private haircutConfig: Map<string, HaircutConfig>;

  async getEstimate(request: RentEstimateRequest): Promise<RentEstimateResult> {
    const cacheKey = `rent:${request.address}:${request.propertyType}:${request.bedrooms}`;
    
    // Step 1: Check cache
    const cached = await this.cache.get(cacheKey);
    if (cached && !this.isExpired(cached)) {
      return this.applyLenderHaircuts(cached, request.lenderId);
    }

    // Step 2: Parallel API calls
    const [rentCastResult, airdnaResult] = await Promise.allSettled([
      this.rentCastClient.getRentEstimate({
        address: request.address,
        propertyType: request.propertyType,
        bedrooms: request.bedrooms,
        bathrooms: request.bathrooms,
        squareFootage: request.squareFootage,
        compCount: 20,
        lookupSubjectAttributes: true,
      }),
      this.airdnaClient?.getRentalizerEstimate({
        address: request.address,
        bedrooms: request.bedrooms,
        bathrooms: request.bathrooms,
      }),
    ]);

    // Step 3: Process RentCast result (with fallback)
    let ltrData = this.processRentCastResult(rentCastResult);
    if (!ltrData) {
      ltrData = await this.fallbackToRentometer(request);
    }
    if (!ltrData) {
      ltrData = await this.fallbackToMarketAverage(request);
    }

    // Step 4: Process AirDNA result
    const strData = this.processAirDNAResult(airdnaResult, request.address);

    // Step 5: Build result
    const result: RentEstimateResult = {
      address: request.address,
      ltr: ltrData,
      str: strData,
      metadata: {
        fetchedAt: new Date().toISOString(),
        cachedAt: null,
        cacheExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        warnings: this.collectWarnings(ltrData, strData),
      },
    };

    // Step 6: Cache
    await this.cache.set(cacheKey, result, {
      ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Step 7: Apply lender-specific haircuts
    return this.applyLenderHaircuts(result, request.lenderId);
  }

  private applyLenderHaircuts(
    result: RentEstimateResult,
    lenderId?: string
  ): RentEstimateResult {
    if (!lenderId || !result.str) return result;

    const config = this.haircutConfig.get(lenderId);
    if (!config) return result;

    // Apply lender-specific STR haircut
    result.str.haircutApplied = config.strHaircut;
    result.str.monthlyAfterHaircut = result.str.monthlyEquivalent * (1 - config.strHaircut);
    result.str.dscr = this.calculateDSCR(
      result.str.monthlyAfterHaircut,
      config.annualDebtService
    );

    // Apply lender LTR floor requirement
    if (config.requireLtrFloor && result.ltr) {
      const ltrDscr = result.ltr.dscr;
      if (ltrDscr < config.ltrFloorDscr) {
        result.metadata.warnings.push(
          `LTR DSCR (${ltrDscr.toFixed(2)}) below lender floor (${config.ltrFloorDscr})`
        );
      }
    }

    return result;
  }
}
```

### 7.3 Lender-Specific Haircut Configuration

```typescript
interface HaircutConfig {
  lenderId: string;
  strHaircut: number;          // 0.20 standard, up to 0.40
  requireLtrFloor: boolean;    // Most lenders require LTR DSCR check
  ltrFloorDscr: number;        // Typically 0.75–0.90
  maxStrOccupancy: number;     // Cap STR occupancy (0.65–0.70 for new)
  killListMarkets: string[];   // Markets where STR is blocked
  useRevenueLower: boolean;    // Use AirDNA lower bound instead of mean
}

// Example configs
const LENDER_CONFIGS: HaircutConfig[] = [
  {
    lenderId: 'ridge-street',
    strHaircut: 0.20,
    requireLtrFloor: true,
    ltrFloorDscr: 0.80,
    maxStrOccupancy: 0.70,
    killListMarkets: ['New York NY', 'San Francisco CA', 'Santa Monica CA'],
    useRevenueLower: false,
  },
  {
    lenderId: 'kiavi',
    strHaircut: 0.25,
    requireLtrFloor: true,
    ltrFloorDscr: 0.75,
    maxStrOccupancy: 0.65,
    killListMarkets: ['New York NY', 'San Francisco CA'],
    useRevenueLower: true,
  },
  {
    lenderId: 'griffin',
    strHaircut: 0.20,
    requireLtrFloor: true,
    ltrFloorDscr: 0.75,
    maxStrOccupancy: 0.70,
    killListMarkets: [],
    useRevenueLower: false,
  },
];
```

### 7.4 Rate Limiter Implementation

```typescript
class RateLimiter {
  private requestTimes: number[] = [];
  private maxPerSecond: number;

  constructor(maxPerSecond: number) {
    this.maxPerSecond = maxPerSecond;
  }

  async acquire(): Promise<void> {
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    
    this.requestTimes = this.requestTimes.filter(t => t > oneSecondAgo);
    
    if (this.requestTimes.length >= this.maxPerSecond) {
      const oldestInWindow = this.requestTimes[0];
      const waitMs = 1000 - (now - oldestInWindow) + 10; // +10ms buffer
      await new Promise(resolve => setTimeout(resolve, waitMs));
      return this.acquire(); // Re-check after waiting
    }
    
    this.requestTimes.push(now);
  }
}

// RentCast: 20 req/sec
const rentCastLimiter = new RateLimiter(18); // 18 to leave headroom

// AirDNA: negotiated limit (typically 5-10 req/sec for enterprise)
const airdnaLimiter = new RateLimiter(8);
```

---

## 8. COST PROJECTION

### 8.1 Scenario: 1,000 Users × 5 Queries/Day

| Metric | Value |
|---|---|
| Daily queries | 5,000 |
| Monthly queries | 150,000 |
| Annual queries | 1,800,000 |

### 8.2 RentCast Cost

| Plan Analysis | Calculation |
|---|---|
| **Growth plan ($199/mo)** | 5,000 included → 145,000 overages × $0.03 = **$4,350/mo** overage |
| **Scale plan ($449/mo)** | 25,000 included → 125,000 overages × $0.015 = **$1,875/mo** overage |
| **Multiple Scale keys** | 6 × $449 = $2,694/mo for 150,000 included requests = **$2,694/mo total** |
| **Enterprise** | Estimated **$1,500–$2,500/mo** for 150K req/mo |

**Recommended:** 6 Scale plan keys ($2,694/mo) OR negotiate Enterprise (~$2,000/mo)

### 8.3 AirDNA Cost

| Tier | Estimated Monthly Cost |
|---|---|
| **Enterprise Starter** | ~$1,000–$2,000/mo (limited calls) |
| **Enterprise Standard** | ~$3,000–$5,000/mo (moderate volume) |
| **Enterprise Full** | ~$5,000–$10,000/mo (high volume) |

**For 150K req/mo, estimated AirDNA cost: $3,000–$5,000/mo**

Note: Not all 150K requests need AirDNA. Only STR-mode queries need it (~40% of queries).

**STR-only volume:** ~60,000 AirDNA calls/mo → **~$2,000–$3,000/mo**

### 8.4 Rentometer Backup Cost

| Usage | Cost |
|---|---|
| Fallback calls (~5% of total) | ~7,500 calls/mo |
| QuickView credits | 10,000 credits × $499 = **~$500/mo** |
| Pro subscription | **$29/mo** |
| **Total** | **~$529/mo** |

### 8.5 Total Monthly Cost

| Component | Monthly Cost |
|---|---|
| **RentCast (6 × Scale)** | $2,694 |
| **AirDNA Enterprise** | $2,500 |
| **Rentometer backup** | $529 |
| **Infrastructure (caching, DB)** | ~$200 |
| **TOTAL** | **~$5,923/mo** |

**Cost per query:** $5,923 / 150,000 = **~$0.04/query**

### 8.6 Cost Optimization Strategies

1. **Aggressive caching** — 30-day cache for LTR, 14-day for STR reduces API calls by ~60%
2. **Deduplication** — Multiple users querying same address = 1 API call
3. **Pre-fetching** — Background refresh of popular markets during off-peak
4. **RentCast-only mode** — For LTR-only DSCR lenders, skip AirDNA entirely
5. **AirDNA on-demand** — Only call AirDNA when user explicitly selects STR mode
6. **Negotiated enterprise** — Both RentCast and AirDNA offer better rates at volume

**Optimized cost with 60% cache hit rate:**

| Component | Monthly Cost (Optimized) |
|---|---|
| RentCast | ~$1,100 |
| AirDNA | ~$1,000 |
| Rentometer | ~$210 |
| Infrastructure | ~$200 |
| **TOTAL** | **~$2,510/mo** |

---

## 9. IMPLEMENTATION CHECKLIST

### Phase 1: MVP (Weeks 1–4)
- [ ] Implement RentCast API client with rate limiter (20 req/sec)
- [ ] Implement `/avm/rent/long-term` integration with all parameters
- [ ] Implement confidence scoring algorithm
- [ ] Implement 30-day cache with stale-while-revalidate
- [ ] Build LTR DSCR calculator
- [ ] Build UI for LTR results display with confidence indicators
- [ ] Handle all RentCast error codes (400, 401, 404, 429, 500, 504)

### Phase 2: STR Integration (Weeks 5–8)
- [ ] Negotiate and activate AirDNA enterprise contract
- [ ] Implement AirDNA API client with rate limiter
- [ ] Implement `/rentalizer/estimate` integration
- [ ] Build STR-to-monthly normalization logic
- [ ] Build STR DSCR calculator with configurable haircuts
- [ ] Add lender-specific haircut configs
- [ ] Build STR/LTR mode toggle UI
- [ ] Add kill-list market detection

### Phase 3: Resilience (Weeks 9–12)
- [ ] Implement Rentometer fallback integration
- [ ] Build market-level average fallback (RentCast `/markets`)
- [ ] Add manual rent entry mode
- [ ] Implement background cache refresh
- [ ] Add appraiser referral workflow
- [ ] Build admin dashboard for cache management
- [ ] Implement address deduplication
- [ ] Add usage monitoring and alerting

### Phase 4: Polish (Weeks 13–16)
- [ ] Add seasonal STR projection visualization (monthly breakdown chart)
- [ ] Implement comp map display
- [ ] Add PDF report generation with rent data
- [ ] Build A/B test for confidence display
- [ ] Implement real-time rate limit monitoring
- [ ] Add data staleness indicators in UI
- [ ] Document all API integrations for compliance

---

## APPENDIX A: RentCast API Request Examples

### cURL Example
```bash
curl -X GET "https://api.rentcast.io/v1/avm/rent/long-term?address=5500%20Grand%20Lake%20Dr%2C%20San%20Antonio%2C%20TX%2C%2078244&propertyType=Single%20Family&bedrooms=3&bathrooms=2&squareFootage=1878&compCount=20" \
  -H "X-Api-Key: YOUR_API_KEY" \
  -H "Accept: application/json"
```

### Node.js Example
```typescript
const response = await fetch(
  `https://api.rentcast.io/v1/avm/rent/long-term?` +
  new URLSearchParams({
    address: '5500 Grand Lake Dr, San Antonio, TX, 78244',
    propertyType: 'Single Family',
    bedrooms: '3',
    bathrooms: '2',
    squareFootage: '1878',
    compCount: '20',
  }),
  {
    headers: {
      'X-Api-Key': process.env.RENTCAST_API_KEY!,
      'Accept': 'application/json',
    },
  }
);

if (!response.ok) {
  const error = await response.json();
  // Handle: 400 (bad request), 401 (auth), 404 (no data), 429 (rate limit)
  throw new Error(`RentCast API error: ${error.message}`);
}

const data = await response.json();
// data.rent, data.rentRangeLow, data.rentRangeHigh, data.comparables[]
```

## APPENDIX B: AirDNA API Request Examples

### cURL Example
```bash
curl -X POST "https://api.airdna.co/api/enterprise/v2/rentalizer/estimate" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "1321 15th St, Denver, CO 80202",
    "bedrooms": 2,
    "bathrooms": 2,
    "accommodates": 4,
    "currency": "USD"
  }'
```

### Node.js Example
```typescript
const response = await fetch(
  'https://api.airdna.co/api/enterprise/v2/rentalizer/estimate',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.AIRDNA_BEARER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      address: '1321 15th St, Denver, CO 80202',
      bedrooms: 2,
      bathrooms: 2,
      accommodates: 4,
      currency: 'USD',
    }),
  }
);

const data = await response.json();
// data.future.summary.adr, .occupancy, .revenue, .revenue_upper, .revenue_lower
// data.future.metrics[] — 12 monthly projections
// data.comps[] — up to 10 comps with comp_score (0-100)
```

## APPENDIX C: Confidence Scoring Quick Reference

| Factor | Impact | Weight |
|---|---|---|
| Fewer than 5 comps | -30 pts | High |
| Top comp correlation < 0.70 | -25 pts | High |
| Confidence interval width > 20% | -20 pts | High |
| Average comp age > 180 days | -15 pts | Medium |
| Rural market | -15 pts | Medium |
| STR-regulated market | -30 pts | Critical |
| Highly seasonal market | -15 pts | Medium |
| Occupancy projection > 85% | -15 pts | Medium |
| Wide revenue spread > 15% | -10 pts | Low |

---

*Specification compiled from live API documentation, developer portal scraping, and verified pricing pages. All RentCast specs confirmed from developers.rentcast.io (llms.txt index). AirDNA specs based on enterprise documentation at docs.airdna.co and prior verified research. Pricing subject to change — confirm before implementation.*
