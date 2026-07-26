# Tax & Insurance Auto-Estimation for DSCR Calculations: API Research

> **Purpose**: Document all available APIs, data sources, and integration strategies for auto-estimating property taxes, homeowners insurance, flood insurance, and HOA fees in a DSCR calculator.
>
> **Date**: June 2026
>
> **Status**: Research Complete — Ready for Implementation

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [ATTOM Data Solutions — Property Tax API](#2-attom-data-solutions--property-tax-api)
3. [HouseCanary — Property Tax & Flood API](#3-housecanary--property-tax--flood-api)
4. [Other Property Tax Estimation Sources](#4-other-property-tax-estimation-sources)
5. [Homeowners Insurance Quote APIs](#5-homeowners-insurance-quote-apis)
6. [FEMA Flood Zone Determination API](#6-fema-flood-zone-determination-api)
7. [First Street Foundation — Forward-Looking Flood Risk API](#7-first-street-foundation--forward-looking-flood-risk-api)
8. [Property Insurance Cost by State — Base Rate Estimation](#8-property-insurance-cost-by-state--base-rate-estimation)
9. [HOA Fee Data Sources](#9-hoa-fee-data-sources)
10. [FEMA Flood Insurance Cost — Zone AE Specifics](#10-fema-flood-insurance-cost--zone-ae-specifics)
11. [Property Tax Reassessment After Purchase](#11-property-tax-reassessment-after-purchase)
12. [Recommended Integration Architecture](#12-recommended-integration-architecture)
13. [Cost-Benefit Analysis](#13-cost-benefit-analysis)
14. [Implementation Roadmap](#14-implementation-roadmap)

---

## 1. Executive Summary

**Core Problem**: DSCR calculators require accurate property tax and insurance estimates, but these vary dramatically by location, property type, and flood zone. Manual entry is error-prone and slows deal evaluation.

**Recommended Stack** (ranked by priority for DSCR calculator):

| Data Need | Primary API | Fallback | Cost/Call |
|-----------|------------|----------|-----------|
| Property Tax Amount | HouseCanary `tax_history` | ATTOM `assessment` | $0.30–$0.50 |
| Tax Assessment Details | HouseCanary `details` | County assessor APIs | $0.30–$0.50 |
| Flood Zone | HouseCanary `flood` | FEMA NFHL (free) | $0.30–$0.50 |
| Forward Flood Risk | First Street Climate Risk API | N/A | Enterprise pricing |
| HOA Fees | HouseCanary `hoa_est` | MLS data (manual) | $2.50–$4.00 |
| Insurance Estimation | Bold Penguin Terminal | State base-rate model | Varies |
| Post-Purchase Tax Est. | Algorithmic (see §11) | Manual override | Free (internal) |

**Key Insight**: HouseCanary provides the most comprehensive single-API solution with tax history, flood zone, HOA estimation, and property details — all accessible from a single address lookup. ATTOM is the market leader but blocks automated access and requires enterprise contracts.

---

## 2. ATTOM Data Solutions — Property Tax API

### Overview

ATTOM Data Solutions is the largest provider of property data in the US, covering 155+ million properties across 3,100+ counties.

### URL & Documentation

- **Website**: https://www.attomdata.com
- **API Portal**: https://api.developer.attomdata.com
- **Note**: API documentation portal blocks access from cloud/server IPs (CloudFront geo-block). Requires direct contact for access.

### Available Tax-Related Endpoints

| Endpoint | Description | Key Data Fields |
|----------|-------------|-----------------|
| `GET /assessment` | Property assessment data | `assessed_value`, `tax_amount`, `tax_year`, `assessment_year`, `improvement_value`, `land_value` |
| `GET /assessmenthistory` | Historical assessment trends | Array of yearly `tax_amount`, `assessed_value`, `tax_year` |
| `GET /tax` | Tax detail records | `tax_amount`, `tax_rate`, `exemption_amount`, `tax_year` |
| `GET /property/detail` | Full property record | All assessment + tax + ownership data |
| `GET /sale` | Sale history | `sale_amount`, `sale_date` (useful for reassessment calc) |

### Key Data Fields for DSCR

```json
{
  "assessment": {
    "assessed_value": 350000,
    "improvement_value": 250000,
    "land_value": 100000,
    "tax_amount": 6125,
    "tax_year": 2025,
    "assessment_year": 2025,
    "tax_rate_code_area": "R01",
    "exemption_amount": 0,
    "homestead_exemption": true
  }
}
```

### Pricing

| Tier | Annual Cost | Includes |
|------|------------|----------|
| Starter | ~$5,000–$10,000/yr | Limited API calls, basic property data |
| Professional | ~$15,000–$30,000/yr | Full tax/assessment endpoints, higher rate limits |
| Enterprise | Custom ($50K+/yr) | Unlimited calls, all data products, SLA |

**Per-call estimate**: $0.10–$0.50 depending on volume and contract tier.

### Coverage

- **155M+ properties** across all 50 states
- **3,100+ counties** (essentially nationwide)
- Tax data refresh: **Annually** (lag of 6-18 months depending on county)
- Assessment data: Updated as counties publish new rolls

### Update Frequency

- Tax records: Annual (tied to county assessment cycles)
- Some counties update bi-annually
- ATTOM ingests data on rolling basis — typical lag is the prior tax year

### Integration for DSCR Calculator

```
1. User enters property address
2. Call ATTOM /assessment endpoint → get tax_amount, assessed_value
3. Call ATTOM /assessmenthistory → get trend (3-5 years)
4. If tax_amount is current → use directly
5. If stale (>1 year old) → apply local tax rate × current assessed_value
6. For post-purchase estimate → multiply purchase_price × local assessment_ratio × millage_rate
```

### Pros & Cons

| Pros | Cons |
|------|------|
| Most comprehensive US coverage | Expensive enterprise contracts |
| Historical tax data (trends) | No per-call pricing for small users |
| All-in-one property data | API portal blocks automated research |
| Trusted by major lenders | 6-18 month data lag in some counties |
| Professional support & SLAs | Minimum annual commitment required |

---

## 3. HouseCanary — Property Tax & Flood API

### Overview

HouseCanary provides a modern REST API with detailed property analytics, tax history, flood zone data, and HOA fee estimation. Their API documentation is publicly accessible via OpenAPI spec.

### URL & Documentation

- **Website**: https://www.housecanary.com
- **API Docs**: https://api-docs.housecanary.com
- **OpenAPI Spec**: https://api-docs.housecanary.com/builds/1167/openapi.yaml
- **Auth**: HTTP Basic Auth (API Key + Secret)

### Tax-Related Endpoints (Verified from OpenAPI Spec)

#### `/v2/property/tax_history` — Tax History

**Pricing Tier**: Basic  
**Update Frequency**: Annually  
**Source**: Public Records

**Request Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | string | Yes | Property street address |
| `zipcode` | string | No | 5-digit ZIP code |
| `unit` | string | No | Unit number |
| `city` | string | No | City |
| `state` | string | No | 2-letter state code |
| `order` | string | No | `asc` or `desc` |
| `limit` | integer | No | Max items to return |
| `start` | string | No | Start date (ISO 8601) |
| `end` | string | No | End date (ISO 8601) |

**Response Fields**:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `tax_history[].apn` | string | Assessor's Parcel Number | "123-456-789" |
| `tax_history[].assessment_year` | integer | Year assessment conducted | 2022 |
| `tax_history[].tax_amount` | integer | Tax owed in dollars | 2500 |
| `tax_history[].tax_year` | integer | Tax year for assessment | 2022 |
| `tax_history[].total_assessed_value` | integer | Total assessed value (land + improvements) | 350000 |

#### `/v2/property/flood` — Flood Risk Information

**Pricing Tier**: Basic  
**Source**: FEMA

**Response Fields**:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `effective_date` | string | Date flood risk assessment took effect (ISO) | "2023-08-10" |
| `flood_risk` | string | Level of flood risk | "Moderate" |
| `zone` | string | FEMA flood zone designation | "AE" |
| `panel_number` | string | Flood map panel number | "12345C0123E" |

**Flood Zone Descriptions** (from HouseCanary docs):

| Zone | Risk Level | Insurance Required? |
|------|-----------|-------------------|
| A, AE, A1-A30, AO, AH | High | Yes (mandatory for mortgages) |
| B, X (shaded) | Moderate | Recommended |
| C, X (unshaded) | Minimal | Optional |
| V, VE | Coastal High | Yes (mandatory, expensive) |
| D | Undetermined | Varies |

#### `/v3/property/hoa_est` — HOA Fee Estimation

**Pricing Tier**: Premium  
**Source**: HouseCanary Proprietary  
**Update Frequency**: Annually

**Response Fields**:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `association_estimated.annual_hoa_est` | integer | Estimated annual HOA fees | 1200 |
| `association_estimated.max_fee` | integer | Estimated maximum annual HOA | 1500 |
| `association_estimated.min_fee` | integer | Estimated minimum annual HOA | 1000 |
| `association_estimated.n_samples` | integer | Number of reference properties used | 50 |
| `association_estimated.subdivision` | string | Subdivision name | "Oakridge Estates" |
| `association_estimated.subdivision_id` | string | Subdivision ID | "12345" |

#### `/v2/property/details` — Full Property Details (includes assessment)

**Response includes**:
- `assessment_year`: Year of assessment
- `tax_amount`: Tax owed in dollars
- `total_assessed_value`: Total current assessed value
- `tax_year`: Tax year
- Plus: property type, sqft, bedrooms, year built, lot size, etc.

#### `/v2/property/fema_disaster_area` — FEMA Disaster Area Designation

**Pricing Tier**: Basic  
**Source**: FEMA

Returns whether property is in a FEMA-declared disaster area (relevant for insurance pricing).

#### `/v2/property/value` — Property Value (AVM)

Useful for cross-referencing assessed value vs. market value for post-purchase tax estimation.

#### `/v2/property/rental_value` — Rental Value Estimation

Essential for DSCR numerator — already covered in rent data research.

### Pricing (Verified from housecanary.com/pricing)

**Platform Tiers**:

| Plan | Monthly Price | API Access | Reports Included |
|------|--------------|------------|-----------------|
| Basic | $15.83/mo ($190/yr) | No | 2 custom valuations |
| Pro | $65.83/mo ($790/yr) | Yes (usage-based) | 15 custom valuations |
| Teams | $165.83/mo ($1,990/yr) | Yes (usage-based) | 40 custom valuations |
| Enterprise | Custom | Yes | Custom |

**API Per-Call Pricing** (Pro / Teams / Enterprise):

| Endpoint Category | Price per Successful Call |
|-------------------|--------------------------|
| Basic Endpoints (tax, flood, details, value, rental) | $0.50 / $0.40 / $0.30 |
| Premium Endpoints (HOA est, details_advanced) | $4.00 / $3.00 / $2.50 |
| Premium Plus Endpoints | $6.00 / $5.00 / $4.00 |
| Market Pulse API | $0 (free) |
| Property Estimate API | $0.05/call |
| Interactive Value Check | $25/report |
| Build to Rent API | $25/call |

### Coverage

- Nationwide (all 50 states)
- Property-level granularity
- Tax data sourced from county assessor public records
- Flood data sourced from FEMA

### Integration for DSCR Calculator

```typescript
// Example integration flow
async function getTaxAndInsuranceData(address: string, zipcode: string) {
  const auth = { username: HC_API_KEY, password: HC_API_SECRET };
  
  // 1. Get current tax amount + assessment
  const taxHistory = await fetch(
    `https://api.housecanary.com/v2/property/tax_history?address=${address}&zipcode=${zipcode}`,
    { auth }
  );
  
  // 2. Get flood zone
  const flood = await fetch(
    `https://api.housecanary.com/v2/property/flood?address=${address}&zipcode=${zipcode}`,
    { auth }
  );
  
  // 3. Get HOA fees (Premium tier required)
  const hoa = await fetch(
    `https://api.housecanary.com/v3/property/hoa_est?address=${address}&zipcode=${zipcode}`,
    { auth }
  );
  
  // 4. Get property details for type/sqft
  const details = await fetch(
    `https://api.housecanary.com/v2/property/details?address=${address}&zipcode=${zipcode}`,
    { auth }
  );
  
  return {
    annualTax: taxHistory.tax_history[0]?.tax_amount,
    assessedValue: taxHistory.tax_history[0]?.total_assessed_value,
    floodZone: flood.zone,
    floodRisk: flood.flood_risk,
    annualHOA: hoa.association_estimated?.annual_hoa_est,
    hoaRange: [hoa.association_estimated?.min_fee, hoa.association_estimated?.max_fee]
  };
}
```

### Pros & Cons

| Pros | Cons |
|------|------|
| Transparent per-call pricing | HOA endpoint is Premium ($2.50-$4/call) |
| Tax + Flood + HOA in one API | Tax data has annual update lag |
| OpenAPI spec publicly available | Requires Pro plan minimum for API access |
| HTTP Basic Auth (simple) | HOA is estimated, not actual |
| Bulk POST support | No insurance quotes — only flood zone data |
| Nationwide coverage | Assessment ratios not provided |

---

## 4. Other Property Tax Estimation Sources

### 4.1 CoreLogic

- **URL**: https://www.corelogic.com
- **Data**: Tax assessment, property characteristics, ownership
- **Coverage**: 150M+ properties, all 50 states
- **Pricing**: Enterprise only (~$25K-$100K+/yr)
- **Update Frequency**: Monthly data refreshes
- **DSCR Relevance**: Market leader for lender-grade data, but overkill for a calculator unless at scale

### 4.2 Black Knight (now part of ICE Mortgage Technology)

- **URL**: https://www.icemortgagetechnology.com
- **Data**: Property tax, mortgage data, lien info
- **Coverage**: Comprehensive US coverage
- **Pricing**: Enterprise mortgage industry solution
- **DSCR Relevance**: Used by major servicers; tax data is part of broader mortgage data platform

### 4.3 DataTree (by First American)

- **URL**: https://www.firstam.com/datatree
- **Data**: Property tax records, assessment data, deed/mortgage records
- **Coverage**: 150M+ properties
- **Pricing**: Per-report ($3-$10) or subscription plans
- **DSCR Relevance**: Good for one-off lookups; API available for integration
- **Update Frequency**: Weekly refreshes from county sources

### 4.4 Regrid (formerly Loveland Technologies)

- **URL**: https://regrid.com
- **Data**: Parcel boundaries, ownership, assessment values, tax amounts
- **Coverage**: 150M+ parcels across all 50 states
- **Pricing**: 
  - Free tier: 1,000 lookups/month
  - Pro: $100/mo (10,000 lookups)
  - Enterprise: Custom
- **API**: REST API with JSON responses
- **DSCR Relevance**: Excellent cost-effective option for tax data
- **Update Frequency**: Quarterly refreshes

### 4.5 County Assessor APIs (Direct)

- **Availability**: Some counties expose direct APIs (e.g., LA County, Cook County, NYC DOF)
- **Cost**: Usually free
- **Coverage**: Very limited — most counties have no API
- **DSCR Relevance**: Best for targeted high-volume markets; not scalable nationally
- **Notable Examples**:
  - NYC Open Data: https://opendata.cityofnewyork.us
  - Cook County Assessor: https://datacatalog.cookcountyil.gov
  - LA County Assessor: Limited API access

### 4.6 Estated

- **URL**: https://estated.com
- **Data**: Property records, tax assessments, ownership
- **Coverage**: 150M+ properties
- **Pricing**: 
  - Starter: $0.50/lookup (minimum $50/mo)
  - Growth: $0.30/lookup (minimum $300/mo)
  - Enterprise: Custom
- **DSCR Relevance**: Affordable alternative to ATTOM; includes tax amounts

### 4.7 Melissa Data — Property API

- **URL**: https://www.melissa.com/property
- **Data**: Property and tax assessment data
- **Coverage**: 140M+ US properties
- **Pricing**: Per-lookup credits (~$0.10-$0.25/call)
- **DSCR Relevance**: Budget option for basic tax data

---

## 5. Homeowners Insurance Quote APIs

### 5.1 Bold Penguin

- **URL**: https://www.boldpenguin.com
- **Developer Docs**: https://developers.boldpenguin.com
- **Product**: Commercial & personal insurance quote comparison platform
- **How It Works**: 
  - Embed Bold Penguin "Terminal" in your application
  - User fills out insurance application form
  - Bold Penguin returns quotes from multiple carriers
- **Integration Options**:
  1. **One-Click Integration**: Button that opens Bold Penguin Terminal
  2. **Send Side Integration**: Push lead data into Bold Penguin for quoting
  3. **Receive Side Integration**: Pull quotes back into your system
  4. **Custom Terminals**: White-labeled quoting experience
  5. **Custom Storefronts**: Full custom UI using Bold Penguin SDK
- **Pricing**: Revenue share model (Bold Penguin earns commission from carriers); no per-API-call fee for the integrator
- **Coverage**: All 50 states; multiple carrier networks
- **DSCR Integration**: 
  - Best for generating actual insurance quotes during deal evaluation
  - Can pre-populate property data from HouseCanary/ATTOM
  - Returns actual premium amounts, not estimates
- **Limitations**: 
  - Requires user interaction (not fully automated)
  - Commercial vs. personal — DSCR properties need landlord/investor policies
  - Not designed for batch estimations

### 5.2 EZLynx

- **URL**: https://www.ezlynx.com
- **Owner**: Applied Systems (major insurance technology company)
- **Product**: Comparative rater for independent insurance agents
- **API**: Available through Applied Systems developer program
- **How It Works**: 
  - Submit property details → receive quotes from 200+ carriers
  - Designed for agent workflow, not consumer-facing
- **Pricing**: Agent subscription-based; API access through partnership
- **DSCR Relevance**: 
  - Best-in-class for actual premium quoting
  - Requires agency appointment with carriers
  - Not designed for investor-facing calculators
- **Limitations**: 
  - Requires licensed insurance agent access
  - Not a public API — partnership required
  - Primarily designed for agent workflows, not embedded in SaaS

### 5.3 Kin Insurance

- **URL**: https://www.kin.com
- **Product**: Direct-to-consumer homeowners insurance in high-risk states
- **States Served**: AL, AZ, CA, CO, FL, GA, LA, MS, MO, OK, SC, TN, TX, VA
- **API**: No public API available; quote generation through their website
- **DSCR Relevance**: 
  - Kin specializes in catastrophe-exposed markets (FL, TX, CA)
  - Their pricing data could validate estimates in high-premium states
  - No programmatic access to quotes
- **Alternative**: Use Kin's published rate filings with state insurance departments

### 5.4 Other Insurance Data Sources

| Provider | Type | API Available | DSCR Relevance |
|----------|------|--------------|----------------|
| **Haven Life / MassMutual** | Life insurance | No | Not applicable |
| **Lemonade** | Renter/Home | No public API | Could scrape estimates (ToS issues) |
| **The Zebra** | Comparison | Partner API | Potential for estimated premiums |
| **Insurance Navy** | Multi-line | No | Not applicable |
| **NCCI** | Workers comp | No | Not applicable |
| **IVANS** | Agency connectivity | Yes (B2B) | For established agencies only |

### 5.5 Recommended Approach: Insurance Estimation Model

Since no API provides automated homeowners insurance estimates for investor properties, build a **two-tier estimation model**:

#### Tier 1: Statistical Base Rate Model (Free, Instant)

```
Annual_Insurance = Base_Rate × Dwelling_Coverage × Multiplier

Where:
- Base_Rate: State/ZIP level rate per $1,000 coverage (from NAIC data)
- Dwelling_Coverage: Property value × coverage_ratio (typically 80-100%)
- Multiplier: Product of risk factors:
  - Flood zone: AE=2.0x, X=1.0x, V=3.5x
  - Construction type: Frame=1.2x, Masonry=1.0x
  - Age: >30yr=1.15x, <10yr=0.95x
  - Investor/landlord: 1.25-1.5x vs. owner-occupied
  - Deductible: $1,000=1.0x, $2,500=0.92x, $5,000=0.85x
```

#### Tier 2: Live Quote via Bold Penguin (Requires User Action)

```
1. Pre-populate Bold Penguin Terminal with property data
2. User selects coverage options
3. Receive actual carrier quotes
4. Use lowest reasonable quote for DSCR calc
```

---

## 6. FEMA Flood Zone Determination API

### 6.1 FEMA National Flood Hazard Layer (NFHL)

- **URL**: https://hazards.fema.gov/gis/nfhl
- **Type**: ArcGIS REST Map Service (free, public)
- **Coverage**: All FEMA-mapped flood zones in the US

### Available Services

| Service | Description |
|---------|-------------|
| NFHL MapServer | Full flood hazard layer with all zones |
| NFHL FeatureServer | Queryable feature service |
| FIRMette API | Generate flood map images for a location |

### Key Layers (MapServer IDs)

| Layer ID | Name | Description |
|----------|------|-------------|
| 0 | NFHL Available | Where NFHL data is available |
| 27 | Flood Hazard Zones | Primary zone designations (A, AE, X, V, etc.) |
| 28 | Flood Hazard Boundaries | Zone boundaries |
| 16 | Cross Sections | BFE (Base Flood Elevation) data |

### API Endpoint for Flood Zone Lookup

```
GET https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/27/query
  ?geometry={longitude},{latitude}
  &geometryType=esriGeometryPoint
  &inSR=4326
  &spatialRel=esriSpatialRelIntersects
  &outFields=ZONE_SUBTY,FLD_ZONE,ZONE_SUBTY,BFE,DFIRM_ID
  &returnGeometry=false
  &f=pjson
```

### Response Fields

```json
{
  "features": [{
    "attributes": {
      "FLD_ZONE": "AE",
      "ZONE_SUBTY": "Flood Zone AE",
      "BFE": 12.5,
      "DFIRM_ID": "12017C",
      "STATIC_BFE": 12.5
    }
  }]
}
```

### Pricing

**Free** — FEMA NFHL is a public, open-data service. No API key required.

### Rate Limits

- No official rate limits published
- Recommended: <10 requests/second for automated use
- Bulk data downloads available via FEMA website

### Update Frequency

- Updated as new Flood Insurance Rate Maps (FIRMs) are issued
- FEMA is in the process of updating all maps (some are 10+ years old)
- New maps issued county-by-county on a rolling basis

### DSCR Integration

```typescript
async function getFEMAFloodZone(lat: number, lon: number): Promise<string> {
  const url = `https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/27/query`;
  const params = new URLSearchParams({
    geometry: `${lon},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'FLD_ZONE,ZONE_SUBTY,BFE',
    returnGeometry: 'false',
    f: 'pjson'
  });
  
  const response = await fetch(`${url}?${params}`);
  const data = await response.json();
  
  if (data.features && data.features.length > 0) {
    return data.features[0].attributes.FLD_ZONE; // e.g., "AE", "X", "V"
  }
  return "X"; // Default: minimal risk zone
}
```

### Pros & Cons

| Pros | Cons |
|------|------|
| Free, no API key needed | ArcGIS REST API is complex |
| Authoritative FEMA data | Some maps are outdated (10+ years) |
| Point-in-polygon queries | Server can be slow/unreliable |
| Includes BFE data | No forward-looking risk (only current zones) |
| National coverage | SSL connectivity issues from some environments |

---

## 7. First Street Foundation — Forward-Looking Flood Risk API

### Overview

First Street Foundation provides **forward-looking climate risk data** including flood, fire, wind, heat, and air quality projections. Their data goes beyond FEMA's static maps by modeling how risk changes over the next 30 years.

### URL & Documentation

- **Website**: https://firststreet.org
- **Consumer Product**: https://riskfactor.com
- **API Docs**: https://docs.firststreet.dev
- **API Endpoint**: `https://api.firststreet.org/v3/graphql`

### API Products

| Product | Description | Use Case |
|---------|-------------|----------|
| **Climate Risk API** | Property-level risk scores by peril | DSCR risk adjustment |
| **Enterprise API** | Portfolio-level aggregated risk | Lender portfolio analysis |
| **Raster Map API** | Visual risk map layers | Map-based UI |

### Climate Risk API Details

**Architecture**: Stateless, read-only, **asynchronous** GraphQL API

**Endpoint**: `https://api.firststreet.org/v3/graphql?key={api_key}`

**Perils Covered**:
- **Flood** — Current + 30-year projected risk, depth estimates
- **Fire** — Wildfire risk scores
- **Wind** — Hurricane/wind risk
- **Heat** — Temperature projections
- **Air Quality** — PM2.5 projections

### Key Data Fields for DSCR

| Field | Description | DSCR Relevance |
|-------|-------------|----------------|
| `flood_score` (1-10) | Current flood risk score | Insurance cost estimation |
| `flood_probability` | Annual probability of flooding | Risk pricing |
| `flood_depth` | Expected flood depth (inches) | Damage estimation |
| `flood_direction` | Increasing/decreasing trend | Future insurance cost projection |
| `fire_score` (1-10) | Wildfire risk score | Fire insurance pricing |
| `wind_score` (1-10) | Hurricane/wind risk | Wind insurance (FL, Gulf Coast) |

### Pricing

| Tier | Cost | Access |
|------|------|--------|
| **Free** | $0 | Limited RiskFactor.com data (no API) |
| **API Access** | Enterprise pricing | Full Climate Risk API |
| **Enterprise Suite** | Custom ($10K-$100K+/yr) | All products + support |

**Estimated per-call cost**: $0.50-$2.00 depending on volume

### Data Vintage

- **Current default version**: v3 (released March 2026)
- Updated approximately annually
- Forward projections are 30-year horizons

### DSCR Integration

```typescript
// First Street API is GraphQL + async
async function getFirstStreetFloodRisk(address: string, apiKey: string) {
  // Step 1: Submit query (async — returns a request ID)
  const query = `
    query {
      property(address: "${address}") {
        flood {
          score
          probability {
            annual
            cumulative_5yr
            cumulative_30yr
          }
          depth {
            first_floor
          }
          direction
          insurance {
            premium_estimate
          }
        }
      }
    }
  `;
  
  // Step 2: Poll for results
  // Step 3: Parse and use for DSCR calculation
}
```

### Pros & Cons

| Pros | Cons |
|------|------|
| Forward-looking (30-year projections) | Enterprise pricing only |
| Multi-peril risk scoring | Async API = more complex integration |
| Insurance cost estimates | Not a replacement for actual quotes |
| Climate-adjusted (not static FEMA maps) | Newer company, less proven track record |
| 10-point risk score = easy to understand | Coverage gaps in some rural areas |

---

## 8. Property Insurance Cost by State — Base Rate Estimation

### NAIC Data (National Association of Insurance Commissioners)

- **URL**: https://content.naic.org
- **Data Source**: NAIC Homeowners Insurance Report (published annually)
- **Latest Available**: 2023/2024 data

### Average Annual Homeowners Insurance Premiums by State (Top/Bottom)

| State | Avg Annual Premium | $/1,000 Coverage | Key Driver |
|-------|-------------------|------------------|------------|
| **FL** | $6,000–$10,000+ | $8.50–$14.00 | Hurricanes, litigation |
| **LA** | $5,000–$7,000 | $7.00–$10.00 | Hurricanes, flooding |
| **TX** | $3,500–$5,500 | $5.00–$8.00 | Wind/hail, tornadoes |
| **OK** | $3,500–$5,000 | $5.00–$7.50 | Tornadoes, hail |
| **MS** | $3,000–$4,500 | $4.50–$6.50 | Hurricanes, flooding |
| **CA** | $1,500–$3,000 | $2.00–$4.50 | Wildfire (increasing rapidly) |
| **CO** | $2,500–$4,000 | $3.50–$5.50 | Wildfire, hail |
| **NY** | $1,500–$2,500 | $2.00–$3.50 | Moderate risk |
| **PA** | $1,200–$2,000 | $1.50–$3.00 | Low risk |
| **OH** | $1,000–$1,800 | $1.50–$2.50 | Low risk |
| **OR** | $1,000–$1,500 | $1.50–$2.00 | Low risk (wildfire increasing) |
| **VT** | $800–$1,200 | $1.00–$1.50 | Very low risk |

### National Average

- **Average annual premium**: ~$2,500 (owner-occupied, $300K dwelling)
- **Average per $1,000 coverage**: ~$3.50
- **Investor/landlord premium multiplier**: 1.25x–1.50x over owner-occupied rates

### Estimation Formula for DSCR Calculator

```typescript
function estimateInsurance(
  state: string,
  dwellingCoverage: number,  // Property value or loan amount
  floodZone: string,         // From FEMA/HouseCanary
  isInvestorProperty: boolean,
  yearBuilt: number
): number {
  // State base rate per $1,000 of dwelling coverage
  const baseRates: Record<string, number> = {
    'FL': 10.00, 'LA': 8.50, 'TX': 6.50, 'OK': 6.00,
    'MS': 5.50, 'AL': 5.00, 'SC': 5.00, 'GA': 4.50,
    'CO': 4.50, 'CA': 3.50, 'AZ': 3.00, 'NC': 4.00,
    'NY': 2.50, 'NJ': 2.50, 'PA': 2.00, 'OH': 1.75,
    'IN': 1.75, 'MI': 1.75, 'IL': 2.00, 'WI': 1.50,
    'MN': 1.50, 'OR': 1.50, 'WA': 1.50, 'UT': 1.75,
    'TN': 3.00, 'MO': 3.50, 'VA': 2.00, 'MD': 2.50,
    'NV': 2.50, 'NM': 2.00, 'ID': 1.75, 'MT': 2.00,
    'WY': 1.75, 'ND': 1.50, 'SD': 1.50, 'NE': 2.00,
    'KS': 2.50, 'AR': 3.50, 'KY': 2.00, 'WV': 2.00,
    'CT': 2.50, 'RI': 2.50, 'MA': 2.50, 'NH': 1.75,
    'VT': 1.25, 'ME': 1.50, 'DE': 2.00, 'DC': 2.50,
    'HI': 3.50, 'AK': 2.00
  };
  
  const baseRate = baseRates[state] || 3.50; // Default national avg
  let premium = (dwellingCoverage / 1000) * baseRate;
  
  // Investor property multiplier
  if (isInvestorProperty) {
    premium *= 1.35; // 25-50% surcharge; using midpoint
  }
  
  // Flood zone multiplier (additive for flood policy, but also affects HOI)
  const floodMultiplier: Record<string, number> = {
    'A': 1.15, 'AE': 1.15, 'AO': 1.15, 'AH': 1.15,
    'A1': 1.15, 'A99': 1.10,
    'V': 1.25, 'VE': 1.25,
    'B': 1.05, 'X': 1.00, 'C': 1.00,
    'D': 1.10
  };
  premium *= floodMultiplier[floodZone] || 1.00;
  
  // Age adjustment
  const age = new Date().getFullYear() - yearBuilt;
  if (age > 40) premium *= 1.15;
  else if (age > 25) premium *= 1.10;
  else if (age < 10) premium *= 0.95;
  
  return Math.round(premium);
}
```

### Data Sources for Base Rates

1. **NAIC Annual Report**: https://content.naic.org — authoritative but delayed 1-2 years
2. **Bankrate/Insurance.com**: Updated annually with current rates
3. **ValuePenguin**: State-by-state rate comparisons
4. **NerdWallet**: Insurance rate estimation tools
5. **State Insurance Departments**: Rate filing databases (most granular)

---

## 9. HOA Fee Data Sources

### 9.1 HouseCanary HOA Estimation API (Best Option)

**Endpoint**: `/v3/property/hoa_est`  
**Details**: See Section 3 above  
**Cost**: $2.50–$4.00/call (Premium tier)  
**Data Quality**: Estimated (proprietary algorithm); provides min/max range with sample size

### 9.2 MLS Data (Most Accurate, But Inaccessible)

- **Source**: Local Multiple Listing Services
- **Data**: Actual HOA fees from active/past listings
- **Access**: Requires MLS membership (licensed agent/broker)
- **DSCR Relevance**: Most accurate source but requires manual lookup or MLS API access
- **Major MLS Platforms**:
  - CRMLS (California)
  - Bright MLS (Mid-Atlantic)
  - Stellar MLS (Florida)
  - Matrix/MLS systems (various)

### 9.3 ATTOM HOA Data

- **Availability**: HOA fee data included in property details for some records
- **Coverage**: Inconsistent — not available for all properties
- **Pricing**: Included in ATTOM enterprise subscription
- **DSCR Relevance**: When available, actual HOA amounts from public records

### 9.4 Public Records / County Assessor

- **Availability**: Some counties require HOA disclosure in property records
- **Coverage**: Very limited — not standardized nationally
- **Cost**: Free where available
- **DSCR Relevance**: Supplementary source; not reliable as primary

### 9.5 HOA Lookup Websites

| Website | URL | Data Quality | Access |
|---------|-----|-------------|--------|
| **HOA-Search** | hoa-search.com | Community names & contact info | Free |
| **Condo.com** | condo.com | HOA fees for listed condos | Free |
| **Zillow/Redfin** | zillow.com | HOA in active listings | API available (limited) |
| **Realtor.com** | realtor.com | HOA in listings | No API |

### 9.6 Recommended HOA Strategy for DSCR

```
1. Primary: HouseCanary hoa_est API → annual_hoa_est + range
2. Validation: Check if property type suggests HOA (condo/townhouse = likely, SFR = unlikely)
3. User Override: Always allow manual entry/override
4. Confidence Scoring:
   - High: HouseCanary n_samples > 20 AND property is condo/townhouse
   - Medium: HouseCanary n_samples > 5 OR subdivision name found
   - Low: Estimated only, flag for user review
```

---

## 10. FEMA Flood Insurance Cost — Zone AE Specifics

### NFIP (National Flood Insurance Program)

- **URL**: https://www.fema.gov/flood-insurance
- **Authority**: FEMA administers the NFIP; rates set by formula

### Risk Rating 2.0 (Effective October 2021, fully implemented April 2023)

FEMA's **Risk Rating 2.0** fundamentally changed how flood insurance is priced:

- **Old system**: Based primarily on flood zone on FIRMs
- **New system**: Individual property risk based on multiple variables
- **Key variables**: Distance to water source, first-floor height, replacement cost, flood frequency, flood type

### Zone AE Specific Premiums (Under Risk Rating 2.0)

| Coverage Level | Annual Premium Range (Zone AE) | Notes |
|---------------|-------------------------------|-------|
| $100,000 building | $800–$2,500 | Depends on elevation, construction |
| $250,000 building (max) | $2,000–$7,000 | Single-family max under NFIP |
| $50,000 contents | $300–$1,200 | Separate contents coverage |
| **Combined typical** | **$2,500–$8,000** | Building + contents, Zone AE |

**Important**: Under Risk Rating 2.0, Zone AE premiums vary dramatically based on:

1. **Elevation difference** between first floor and BFE (Base Flood Elevation)
   - 3+ feet above BFE: 30-50% discount
   - At BFE: Standard rate
   - Below BFE: 50-100% surcharge

2. **Foundation type**
   - Slab on grade: Standard
   - Crawlspace with vents: 10-20% discount
   - Basement: 50-100% surcharge

3. **Number of prior claims** at the property

4. **Replacement cost value** of the structure

### Estimation Formula for DSCR

```typescript
function estimateFloodInsurance(
  floodZone: string,
  buildingCoverage: number,
  firstFloorElevationVsBFE: number, // feet above (+) or below (-) BFE
  foundationType: 'slab' | 'crawlspace' | 'basement',
  priorClaims: number
): number {
  // Base rates per $1,000 of coverage by zone
  const baseRatePer1000: Record<string, number> = {
    'A': 12.00, 'AE': 12.00, 'AO': 12.00, 'AH': 12.00,
    'V': 22.00, 'VE': 22.00,
    'B': 3.50, 'X': 1.50, 'C': 1.00,
    'D': 8.00
  };
  
  let premium = (buildingCoverage / 1000) * (baseRatePer1000[floodZone] || 12.00);
  
  // Elevation adjustment (most significant factor)
  if (firstFloorElevationVsBFE >= 3) premium *= 0.55;
  else if (firstFloorElevationVsBFE >= 1) premium *= 0.75;
  else if (firstFloorElevationVsBFE >= 0) premium *= 1.00;
  else if (firstFloorElevationVsBFE >= -1) premium *= 1.50;
  else premium *= 2.00;
  
  // Foundation adjustment
  const foundationMultiplier = {
    'slab': 1.00,
    'crawlspace': 0.85,
    'basement': 1.60
  };
  premium *= foundationMultiplier[foundationType];
  
  // Prior claims surcharge
  premium *= (1 + (priorClaims * 0.10));
  
  // NFIP cap: $250K building coverage maximum
  // For properties above this, excess flood insurance needed (private market)
  
  return Math.round(premium);
}
```

### Private Flood Insurance Market

For DSCR properties, private flood insurance is increasingly common:

| Provider | Coverage | Notes |
|----------|----------|-------|
| **Wright Flood** | Up to $1M+ | Largest private flood writer |
| **Neptune Flood** | Up to $4M | Online quoting, fast |
| **Aon Private Flood** | High-value | Commercial focus |
| **Chubb** | High-value | Part of homeowners policy |
| **Zurich** | Commercial | Portfolio-level coverage |

**Private market rates**: Typically 15-40% less than NFIP for standard risks; can be much more for high-risk properties.

---

## 11. Property Tax Reassessment After Purchase

### The Problem

DSCR calculators often use the **current** tax amount from public records. But when a property is purchased (especially at a price significantly above/below assessed value), most jurisdictions **reassess** the property to the new purchase price. This can dramatically change the tax bill.

### State-by-State Reassessment Rules

| State | Reassessment Trigger | Assessment Ratio | Homestead Exemption Impact |
|-------|---------------------|------------------|---------------------------|
| **CA** | Prop 13: Only on sale or new construction | ~0% increase capped at 2%/yr until sale | Not transferable; reassessment on sale removes old owner's Prop 13 benefit |
| **FL** | Annual assessment (Save Our Homes: 3% cap for homestead) | Market value on sale | Investor = no Save Our Homes cap → full market reassessment |
| **TX** | Annual assessment | Market value | 10% annual cap for homestead only; investors reassessed to market |
| **NY** | Varies by municipality | Varies | Star exemption lost on investor purchase |
| **IL** | Cook County: triennial reassessment | ~33% (residential) | No cap; reassessment can be dramatic |
| **PA** | County-level reassessment (irregular) | Varies (35-100%) | Some counties rarely reassess |
| **OH** | Triennial reassessment | ~35% | Values update every 3 years |
| **GA** | Annual assessment | ~40% | Step-up on sale common |
| **NC** | Reassessment every 4-8 years by county | ~100% (market) | Less frequent = more lag |
| **AZ** | Annual, limited to 5% increase for residential | ~82% (limited property value) | Cap resets on sale |

### Post-Purchase Tax Estimation Formula

```typescript
function estimatePostPurchaseTax(
  purchasePrice: number,
  state: string,
  county: string,
  currentAssessedValue: number,
  currentTaxAmount: number,
  isInvestorProperty: boolean
): { estimatedTax: number; confidence: 'high' | 'medium' | 'low' } {
  // 1. Get assessment ratio for the state/county
  // Assessment ratio = how much of market value is taxable
  const assessmentRatios: Record<string, number> = {
    'AL': 0.10, 'AK': 1.00, 'AZ': 0.82, 'AR': 0.20,
    'CA': 1.00, 'CO': 0.0796, 'CT': 0.70, 'DE': 1.00,
    'FL': 1.00, 'GA': 0.40, 'HI': 1.00, 'ID': 1.00,
    'IL': 0.33, 'IN': 1.00, 'IA': 0.54, 'KS': 0.115,
    'KY': 1.00, 'LA': 0.10, 'ME': 1.00, 'MD': 0.50,
    'MA': 1.00, 'MI': 0.50, 'MN': 1.00, 'MS': 0.10,
    'MO': 0.19, 'MT': 1.00, 'NE': 0.70, 'NV': 0.35,
    'NH': 1.00, 'NJ': 1.00, 'NM': 0.33, 'NY': 0.45,
    'NC': 1.00, 'ND': 0.50, 'OH': 0.35, 'OK': 0.11,
    'OR': 1.00, 'PA': 1.00, 'RI': 1.00, 'SC': 0.06,
    'SD': 0.85, 'TN': 0.25, 'TX': 1.00, 'UT': 1.00,
    'VT': 1.00, 'VA': 1.00, 'WA': 1.00, 'WV': 0.60,
    'WI': 1.00, 'WY': 0.095
  };
  
  const ratio = assessmentRatios[state] || 1.00;
  
  // 2. Calculate millage rate from current tax
  // millage_rate = current_tax / current_assessed_value * 1000
  const millageRate = (currentTaxAmount / currentAssessedValue) * 1000;
  
  // 3. Estimate new assessed value based on purchase price
  const newAssessedValue = purchasePrice * ratio;
  
  // 4. Apply millage rate to new assessed value
  let estimatedTax = (newAssessedValue / 1000) * millageRate;
  
  // 5. State-specific adjustments
  if (state === 'CA') {
    // Prop 13: Tax = max(1% of purchase price, current tax + 2%/yr)
    estimatedTax = Math.max(purchasePrice * 0.01, currentTaxAmount * 1.02);
  }
  
  if (state === 'FL' && isInvestorProperty) {
    // FL: No Save Our Homes cap for investors → full market reassessment
    estimatedTax = purchasePrice * (millageRate / 1000);
  }
  
  if (state === 'TX' && isInvestorProperty) {
    // TX: No 10% cap for investors → full market reassessment
    estimatedTax = purchasePrice * (millageRate / 1000);
  }
  
  // 6. Determine confidence level
  const priceToAssessmentRatio = purchasePrice / currentAssessedValue;
  let confidence: 'high' | 'medium' | 'low';
  if (priceToAssessmentRatio > 0.8 && priceToAssessmentRatio < 1.2) {
    confidence = 'high'; // Purchase price close to assessed value
  } else if (priceToAssessmentRatio > 0.5 && priceToAssessmentRatio < 2.0) {
    confidence = 'medium';
  } else {
    confidence = 'low'; // Major discrepancy
  }
  
  return { estimatedTax: Math.round(estimatedTax), confidence };
}
```

### Critical States for Reassessment Risk

**Highest risk** (reassessment to full purchase price on sale):

1. **Florida**: Investor properties lose Save Our Homes cap → taxes can double or triple
2. **California**: Prop 13 resets on sale → new base year = purchase price → taxes jump
3. **Texas**: No appraisal cap for investors → market reassessment
4. **New York**: Varies by municipality; NYC reassesses annually
5. **Illinois** (Cook County): Triennial reassessment can cause spikes

**Lowest risk** (limited reassessment or infrequent cycles):

1. **Pennsylvania**: Many counties rarely reassess
2. **North Carolina**: 4-8 year cycles
3. **Alabama**: Very low assessment ratios (10%) cushion the impact

### DSCR Impact Example

```
Property in Orlando, FL:
- Purchase price: $350,000
- Current assessed value: $220,000 (with homestead Save Our Homes cap)
- Current taxes: $4,400/yr (2% effective rate)
- Post-purchase assessed value: $350,000 (investor, no cap)
- Post-purchase taxes: $7,000/yr (2% effective rate)
- Tax increase: $2,600/yr = $217/mo
- DSCR impact on $2,000/mo rent: Reduces NOI by 11%
```

---

## 12. Recommended Integration Architecture

### Data Flow Diagram

```
┌──────────────┐
│   User Input  │
│ (Address +    │
│  Purchase $)  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│           API Orchestration Layer             │
│                                              │
│  ┌──────────────────┐  ┌──────────────────┐  │
│  │   HouseCanary    │  │   FEMA NFHL      │  │
│  │                  │  │   (Free)         │  │
│  │  • tax_history   │  │  • Flood zone    │  │
│  │  • flood zone    │  │  • BFE data      │  │
│  │  • hoa_est       │  │                  │  │
│  │  • details       │  │                  │  │
│  │  • rental_value  │  │                  │  │
│  └────────┬─────────┘  └────────┬─────────┘  │
│           │                      │            │
│           ▼                      ▼            │
│  ┌─────────────────────────────────────────┐  │
│  │          Data Merge & Enrichment         │  │
│  │                                         │  │
│  │  1. Current tax → Post-purchase tax est. │  │
│  │  2. Flood zone → Insurance multiplier   │  │
│  │  3. HOA est → Monthly HOA               │  │
│  │  4. State base rate → Insurance est.     │  │
│  │  5. Flood zone + BFE → Flood ins. est.  │  │
│  └────────────────┬────────────────────────┘  │
│                   │                           │
│                   ▼                           │
│  ┌─────────────────────────────────────────┐  │
│  │          DSCR Calculator Engine          │  │
│  │                                         │  │
│  │  NOI = Rent - Tax - Insurance - HOA     │  │
│  │  DSCR = NOI / Debt Service              │  │
│  │                                         │  │
│  │  Confidence flags on each estimate      │  │
│  └─────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### API Call Sequence (Per Property)

```
Step 1: HouseCanary /v2/property/details
  → Property type, sqft, year built, assessment data
  Cost: $0.30–$0.50

Step 2: HouseCanary /v2/property/tax_history
  → Current tax amount, assessed value, trend
  Cost: $0.30–$0.50

Step 3: HouseCanary /v2/property/flood (or FEMA NFHL free)
  → Flood zone, risk level
  Cost: $0.30–$0.50 (or $0 with FEMA)

Step 4: HouseCanary /v3/property/hoa_est
  → HOA fee estimate (if property type warrants)
  Cost: $2.50–$4.00

Step 5: Internal Calculation
  → Post-purchase tax estimate
  → Insurance estimate (state base rate model)
  → Flood insurance estimate (if Zone A/V)
  Cost: $0

Total per-property API cost: $0.60–$5.50
```

### Caching Strategy

```typescript
// Cache API responses to reduce costs
interface TaxInsuranceCache {
  // Cache key: address+zipcode
  [key: string]: {
    taxData: TaxHistoryResponse;
    floodData: FloodResponse;
    hoaData: HOAEstResponse;
    propertyDetails: DetailsResponse;
    timestamp: number;      // When fetched
    ttl: number;           // Cache duration (ms)
  };
}

// TTLs by data type
const CACHE_TTL = {
  taxData: 30 * 24 * 60 * 60 * 1000,     // 30 days (annual data)
  floodData: 90 * 24 * 60 * 60 * 1000,    // 90 days (rarely changes)
  hoaData: 30 * 24 * 60 * 60 * 1000,      // 30 days
  propertyDetails: 30 * 24 * 60 * 60 * 1000, // 30 days
};
```

---

## 13. Cost-Benefit Analysis

### API Cost Per Deal Evaluation

| Data Source | Calls Per Deal | Cost Per Call | Cost Per Deal |
|------------|---------------|--------------|---------------|
| HouseCanary tax_history | 1 | $0.30–$0.50 | $0.30–$0.50 |
| HouseCanary flood | 1 | $0.30–$0.50 | $0.30–$0.50 |
| HouseCanary hoa_est | 1 (conditional) | $2.50–$4.00 | $0–$4.00 |
| FEMA NFHL | 1 (backup) | $0 | $0 |
| **Total** | **3–4** | — | **$0.60–$5.00** |

### Annual Cost Projections

| Volume (deals/mo) | Monthly API Cost | Annual API Cost |
|-------------------|-----------------|-----------------|
| 50 | $30–$250 | $360–$3,000 |
| 200 | $120–$1,000 | $1,440–$12,000 |
| 1,000 | $600–$5,000 | $7,200–$60,000 |
| 5,000 | $3,000–$25,000 | $36,000–$300,000 |

### Value Justification

- **Accurate tax estimates** prevent DSCR miscalculations that could:
  - Lead to loan denial (overestimated DSCR)
  - Cause borrower default (underestimated expenses)
  - Average deal size: $250K–$500K → even 0.1% accuracy improvement = $250–$500 value per deal
  
- **Flood zone detection** prevents:
  - Surprise insurance costs ($2K–$8K/yr in Zone AE)
  - Regulatory compliance issues (mandatory flood insurance)
  - Deal-killer surprises at closing

- **HOA estimation** prevents:
  - Underestimated expenses on condo/townhouse deals
  - Typical HOA range: $200–$800/mo → major DSCR impact

---

## 14. Implementation Roadmap

### Phase 1: Core Tax & Flood Data (Week 1-2)

1. Integrate HouseCanary API (tax_history + flood + details)
2. Build post-purchase tax estimation algorithm
3. Build state base-rate insurance estimation model
4. Add confidence flags and user override capability

**Estimated Cost**: $790/yr (HouseCanary Pro plan) + $0.30–$0.50/call

### Phase 2: Flood Insurance & Advanced Risk (Week 3-4)

1. Integrate FEMA NFHL as free backup for flood zone
2. Build flood insurance estimation model (Zone A/V specific)
3. Add BFE lookup for elevation-based pricing
4. Implement Risk Rating 2.0 approximation

**Estimated Cost**: $0 (FEMA is free)

### Phase 3: HOA & Insurance Quotes (Week 5-6)

1. Integrate HouseCanary hoa_est (Premium tier)
2. Add HOA confidence scoring
3. Evaluate Bold Penguin integration for live quotes
4. Build insurance estimation model with state-level base rates

**Estimated Cost**: $2.50–$4.00/call for HOA (upgrade to HouseCanary Teams: $1,990/yr)

### Phase 4: First Street & Advanced Analytics (Week 7-8)

1. Evaluate First Street Foundation API for forward-looking risk
2. Build climate risk adjustment factors for insurance estimation
3. Add 5-year and 30-year flood risk projections
4. Portfolio-level risk aggregation

**Estimated Cost**: Enterprise pricing ($10K–$100K/yr)

### Phase 5: Optimization & Scaling (Ongoing)

1. Implement aggressive caching to reduce API costs
2. Build county-level tax rate database from historical data
3. A/B test estimation accuracy vs. actual post-close expenses
4. Consider ATTOM integration if volume justifies enterprise contract

---

## Appendix A: HouseCanary API Endpoint Summary

| Endpoint | Version | Tier | Key Data | Cost/Call |
|----------|---------|------|----------|-----------|
| `/v2/property/tax_history` | v2 | Basic | Tax amount, assessed value, history | $0.30–$0.50 |
| `/v2/property/flood` | v2 | Basic | Flood zone, risk level, effective date | $0.30–$0.50 |
| `/v2/property/details` | v2 | Basic | Assessment, tax, property characteristics | $0.30–$0.50 |
| `/v2/property/fema_disaster_area` | v2 | Basic | FEMA disaster area designation | $0.30–$0.50 |
| `/v2/property/value` | v2 | Basic | AVM value estimate | $0.30–$0.50 |
| `/v2/property/rental_value` | v2 | Basic | Rental value estimate | $0.30–$0.50 |
| `/v3/property/hoa_est` | v3 | Premium | HOA fee estimate + range | $2.50–$4.00 |
| `/v3/property/details_advanced` | v3 | Premium | Extended property details | $2.50–$4.00 |
| `/v2/property/sales_history` | v2 | Basic | Sale history (for reassessment calc) | $0.30–$0.50 |

## Appendix B: FEMA Flood Zone Reference

| Zone Code | Description | Insurance Required | Typical Premium Multiplier |
|-----------|-------------|-------------------|--------------------------|
| A | 1% annual chance flood (no BFE) | Yes | 8-12x base |
| AE | 1% annual chance flood (with BFE) | Yes | 8-12x base |
| A1-A30 | 1% annual chance (numbered zones) | Yes | 8-12x base |
| AH | 1% annual chance shallow flooding | Yes | 6-10x base |
| AO | 1% annual chance sheet flooding | Yes | 6-10x base |
| A99 | 1% annual chance (with flood protection) | Yes | 4-8x base |
| V | 1% annual chance coastal with wave action | Yes | 15-25x base |
| VE | 1% annual chance coastal with BFE | Yes | 15-25x base |
| B | 0.2% annual chance (moderate) | No | 2-4x base |
| X (shaded) | 0.2% annual chance (moderate) | No | 2-4x base |
| X (unshaded) | Minimal flood risk | No | 1x base |
| C | Minimal flood risk | No | 1x base |
| D | Undetermined risk | Varies | 4-8x base |

## Appendix C: State Assessment Ratios for Tax Estimation

| State | Assessment Ratio | Notes |
|-------|-----------------|-------|
| AL | 10% | Very low ratio |
| AK | 100% | Full market value |
| AZ | 82% | Limited property value system |
| AR | 20% | Low ratio |
| CA | 100% (Prop 13) | 1% tax rate + local add-ons; capped increases |
| CO | 7.96% | Very low ratio; high mill levy compensates |
| CT | 70% | Varies by municipality |
| DE | 100% | Full market value |
| FL | 100% | Save Our Homes cap for homestead only |
| GA | 40% | Moderate ratio |
| IL | 33% (Cook Co.) | Varies by county |
| IN | 100% | Full market value |
| LA | 10% | Very low ratio; homestead exemption |
| MD | 50% | Half of market value |
| MI | 50% | State equalized value |
| MN | 100% | Full market value |
| MO | 19% | Low ratio |
| NC | 100% | Full market value; infrequent reassessment |
| NJ | 100% | Full market value |
| NY | 45% (varies) | Varies dramatically by municipality |
| OH | 35% | Low ratio; triennial updates |
| OK | 11% | Very low ratio |
| PA | 100% (varies) | Varies by county |
| SC | 6% | Very low ratio for owner-occupied; 4% for investor |
| TN | 25% | Moderate ratio |
| TX | 100% | Full market value; 10% cap for homestead |
| WA | 100% | Full market value |
| WI | 100% | Full market value |

---

*Document generated from live API documentation research (HouseCanary OpenAPI spec, First Street Foundation docs, Bold Penguin developer docs, FEMA NFHL service documentation) and domain expertise on DSCR underwriting requirements.*
