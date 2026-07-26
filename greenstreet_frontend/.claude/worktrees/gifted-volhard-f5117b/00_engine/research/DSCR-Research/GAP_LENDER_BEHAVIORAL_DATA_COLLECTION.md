# Lender Behavioral Data Collection — Comprehensive Acquisition Strategy

**Date:** March 5, 2026  
**Classification:** STRATEGIC — Data Moat Architecture  
**Companion To:** `INNOVATION_LENDER_BEHAVIORAL_INTELLIGENCE.md` (what to capture) + this document (how to capture it)  
**Objective:** Build the largest proprietary dataset on actual DSCR lender behavior, creating an insurmountable competitive moat

---

## EXECUTIVE SUMMARY

The gap between published DSCR lender guidelines and actual lender behavior is the single biggest information asymmetry in investment property lending. No existing platform — not LendingTree, not Morty, not any CRM — systematically captures this gap. Our strategy combines **six distinct data acquisition channels**, each with different cost profiles, data richness, and defensibility:

| Channel | Data Richness | Cost to Acquire | Defensibility | Timeline |
|---|---|---|---|---|
| 1. Broker Crowdsourcing | ★★★★★ | $$ | ★★★★★ | 3-9 months |
| 2. HMDA Public Data | ★★☆☆☆ | $ | ★☆☆☆☆ | Immediate |
| 3. Securitization/RMBS Data | ★★★★☆ | $$$ | ★★★☆☆ | 1-3 months |
| 4. Rate Sheet Scraping | ★★★☆☆ | $$ | ★★★☆☆ | 1-2 months |
| 5. Structured Broker Surveys | ★★★★★ | $$ | ★★★★☆ | 1-3 months |
| 6. Lender Partnership APIs | ★★★★★ | $$$$ | ★★★★★ | 6-12 months |

**Target:** 50,000+ verified behavioral data points within 18 months, covering 30+ DSCR lenders across all 8 behavioral intelligence dimensions.

---

## 1. BROKER CROWDSOURCING MODEL

### 1.1 The Core Mechanism

Create a "Waze for DSCR lending" — brokers submit real deal outcomes (approvals, denials, conditions, timelines, negotiated rates) in exchange for access to aggregated intelligence they can't get anywhere else.

**How it works:**
1. Broker submits a deal outcome: "Submitted to Kiavi, DSCR 0.85, 75% LTV, 680 FICO — **Approved** at 6.25%, 45-day close"
2. System validates, anonymizes, and aggregates with other submissions
3. Broker gets back: "Kiavi approves 73% of deals at DSCR 0.80-0.89 with your profile — median rate 6.375%, median close 42 days"
4. Each submission improves the model for everyone; the more you contribute, the more granular your access

### 1.2 Motivation Architecture — Why Brokers Will Share

| Motivation Tier | Mechanism | Expected Conversion |
|---|---|---|
| **Self-interest (primary)** | Access to better data = better lender selection = more closed deals = more commission | 60-70% of contributors |
| **Competitive advantage** | Premium tier unlocks lender-specific approval probability models unavailable to free users | 20-25% of contributors |
| **Community standing** | "Top Contributor" badge, leaderboard, early access to new features | 5-10% of contributors |
| **Cash incentives** | $5-25 per verified submission (funded from platform revenue) | 5-10% of contributors |
| **Reduced liability** | Documented trail of lender selection rationale for compliance/audits | Indirect — reduces churn |

**Key Insight:** The primary motivation is NOT cash — it's **reciprocal data access**. Brokers will share because the data they get back is worth 10x what they put in. This is the same dynamic that powers Waze, Glassdoor, and Zillow's Zestimate.

### 1.3 Precedent Analysis

| Platform | Data Collected | Relevance | Lesson |
|---|---|---|---|
| **RateGravity** | Collects borrower info, matches to lender rates | Medium — consumer-facing, not broker | Proves rate comparison works; doesn't capture outcomes |
| **Morty** | Digital mortgage marketplace, collects offers | Medium — conventional focus | Shows brokers will use comparison tools, but no DSCR data |
| **LendingTree** | 5+ lender offers per submission | Low — conventional, no outcome data | **Critical lesson:** They capture OFFERS, not OUTCOMES. Our moat is outcomes. |
| **Glassdoor** | Anonymous employer reviews + salary data | High — anon submission + validation | Best model: anon submissions, verification tier, community moderation |
| **Zillow** | Agent reviews, Zestimate accuracy improves with data | High — data network effects | Zestimate accuracy improves with more data → more users → more data |
| **Waze** | Real-time traffic from drivers | Very High — real-time behavioral crowdsourcing | Perfect analog: brokers report conditions in real-time, just like drivers |

**No existing platform collects DSCR loan OUTCOMES (approved/denied/conditions/rate/timeline).** This is the whitespace.

### 1.4 Verification & Anti-Gaming System

This is the hardest problem. Bad data is worse than no data.

#### Layer 1: Submission-Level Verification
- **LO number / confirmation code** — broker enters partial loan officer ID (last 4 digits); we verify against known AE/LO rosters
- **Screenshots** — optional upload of approval/denial letter (redacted); AI OCR extracts key data points
- **Cross-referencing** — if 3+ brokers report same lender behavior within 7 days, confidence score increases
- **Timestamp validation** — submissions must be within 90 days of deal close date

#### Layer 2: Contributor-Level Verification
- **NMLS verification** — broker must verify NMLS number to submit (ties to real identity)
- **Submission velocity checks** — flag accounts submitting >10 deals/day (likely automated/fake)
- **Outlier detection** — if a broker's submissions consistently contradict aggregate data, flag for review
- **Account age weighting** — new accounts start at 0.5x weight; weight increases with verified submissions

#### Layer 3: Statistical Verification
- **Bayesian updating** — each new data point updates our prior; extreme claims require more evidence
- **Consensus scoring** — data points confirmed by 2+ independent brokers get 2x weight
- **Temporal decay** — data older than 6 months gets reduced weight (lender behavior changes)
- **Lender confirmation loop** — when we reach partnerships, lender data validates crowdsourced data

#### Data Quality Scoring Matrix

| Signal | Weight | Rationale |
|---|---|---|
| NMLS-verified broker | +2 | Confirms real person |
| Screenshot uploaded | +3 | Hard evidence |
| Cross-confirmed by 2+ brokers | +3 | Independent verification |
| Submission within 30 days of close | +1 | Fresh data |
| Account with 10+ verified submissions | +2 | Track record |
| No screenshot, no cross-confirmation | -1 | Weaker signal |
| Outlier vs. lender aggregate | -2 | Possible error or unique case |
| New account (<5 submissions) | -1 | Unproven contributor |

**Minimum quality score of 3 required** for a data point to enter the primary dataset. Score <3 goes to "unverified" queue for manual review or additional confirmation.

### 1.5 Submission Data Schema

```
DealOutcome {
  // Identity (anonymized)
  broker_id: string (hashed NMLS)
  submission_date: datetime
  
  // Lender
  lender_name: string
  loan_officer_id: string (optional, last 4 digits)
  channel: enum (wholesale | correspondent | retail)
  
  // Deal Parameters
  property_type: enum (SFR | 2-4 unit | 5-10 unit | condo | townhouse)
  occupancy: enum (LTR | STR | mixed)
  loan_purpose: enum (purchase | rate_term_refi | cash_out_refi)
  loan_amount: number
  purchase_price: number (if purchase)
  appraised_value: number
  requested_ltv: number
  
  // Borrower Profile
  fico: number (rounded to nearest 10)
  dscr_calculated: number (2 decimal places)
  dscr_method: enum (scheduled_rent | actual_rent | str_platform | air_dna)
  property_count: number (total financed properties)
  first_time_investor: boolean
  entity_type: enum (LLC | individual | trust | other)
  state: string
  reserves_months: number
  
  // Outcome
  status: enum (approved | conditionally_approved | denied | withdrawn | counter_offered)
  approved_rate: number (if approved)
  published_rate: number (from rate sheet at time of submission)
  rate_negotiated: boolean
  origination_points: number
  actual_close_days: number
  published_close_days: number (from lender marketing)
  conditions_count: number
  conditions_detail: string[] (e.g., "additional 2 months reserves", "property inspection required")
  denial_reason: string (if denied)
  counter_offer_detail: string (if counter-offered)
  
  // Behavioral Intelligence
  published_dscr_min: number (from lender guidelines)
  approved_below_published_dscr: boolean
  published_reserves_required: number
  actual_reserves_required: number
  flexibility_rating: 1-5 scale (subjective broker assessment)
  negotiability_rating: 1-5 scale (subjective broker assessment)
  ae_helpfulness_rating: 1-5 scale
  would_use_again: boolean
  
  // Verification
  verification_score: number (computed)
  screenshot_uploaded: boolean
  cross_confirmed: boolean
}
```

---

## 2. HMDA DATA FOR DSCR / NON-QM

### 2.1 What HMDA Captures

The Home Mortgage Disclosure Act requires most mortgage lenders to report loan-level data annually. Since 2018, HMDA data includes expanded fields under the Economic Growth, Regulatory Relief, and Consumer Protection Act.

**Available HMDA fields relevant to DSCR analysis:**

| Field | HMDA Name | Relevance | Notes |
|---|---|---|---|
| Loan purpose | `loan_purpose` | ★★★★★ | 1=Purchase, 2=Home Improvement, 3=Refinance |
| Property type | `dwelling_type` | ★★★★☆ | 1=Single Family, 2=Manufactured, 3=Multifamily |
| Occupancy | `occupancy_type` | ★★★★★ | 1=Principal residence, 2=Second home, **3=Investment property** |
| Loan amount | `loan_amount` | ★★★★★ | Exact loan amount |
| Action taken | `action_taken` | ★★★★★ | 1=Originated, 2=Approved not accepted, 3=Denied, 4=Withdrawn, 5=Closed incompleteness, 6=Purchased loan |
| Rate spread | `rate_spread` | ★★★★★ | Spread over APOR — proxy for pricing tier |
| FICO | `applicant_credit_score` | ★★★★☆ | Available but many non-bank lenders omit it |
| LTV | `loan_to_value_ratio` | ★★★★☆ | Available but many non-bank lenders omit it |
| DTI | `debt_to_income_ratio` | ★★☆☆☆ | Less relevant for DSCR (DTI not used) |
| Income | `income` | ★★☆☆☆ | Often "NA" for DSCR loans |
| State/County | `state_code`, `county_code` | ★★★★☆ | Geographic analysis |
| Lender ID | `lei` + `institution_name` | ★★★★★ | Identifies the lender |
| Total units | `total_units` | ★★★★☆ | 1=1-unit, 2=2-unit, etc. |
| Business purpose | `business_purpose` | ★★★★★ | 1=Primarily business, 2=Primarily consumer |

### 2.2 Can HMDA Capture DSCR/Non-QM Data?

**Partial — with significant limitations:**

| Question | Answer | Detail |
|---|---|---|
| Does HMDA capture DSCR specifically? | **No** | HMDA has no "DSCR" field. DSCR is a non-QM underwriting method, not a HMDA category. |
| Can we identify investment property loans? | **Yes** | `occupancy_type = 3` filters to investment properties |
| Can we filter by lender? | **Yes** | By LEI or institution name |
| Can we identify non-QM loans? | **Indirectly** | Business-purpose + investment property + non-bank lender + rate spread > APOR+300bp is a reasonable proxy for non-QM/DSCR |
| Are approval/denial rates available? | **Yes** | `action_taken` field provides originations, denials, withdrawals |
| Is the rate available? | **Partially** | `rate_spread` gives spread over APOR, not the absolute rate |
| Is DSCR value available? | **No** | Not a HMDA field |
| Is property type (STR vs LTR) available? | **No** | Not a HMDA field |

### 2.3 Key HMDA Limitations for DSCR Intelligence

1. **Non-bank underreporting:** Many DSCR lenders are non-bank entities that may not meet HMDA reporting thresholds (25 closed-end loans in each of the past 2 years for institutions with assets <$50M). Lenders like Kiavi, Easy Street, and Visio may or may not report depending on their asset size and volume.

2. **No DSCR field:** This is the biggest gap. HMDA tells you a loan was made for an investment property, but not whether it was underwritten via DSCR, and at what DSCR.

3. **No property income data:** HMDA doesn't capture rental income, property cash flow, or the DSCR calculation inputs.

4. **Rate spread, not absolute rate:** `rate_spread` is the spread over the APOR (Average Prime Offer Rate). To get the absolute rate, you must add the APOR for that date/term. Non-QM loans typically have spreads of 200-500bp over APOR.

5. **Wholesale/correspondent attribution:** Many DSCR loans are originated through broker channels. The originating lender on HMDA may be the correspondent who purchased the loan, not the actual DSCR decision-maker.

6. **Timeliness:** HMDA data is released annually, typically 9-12 months after the reporting year. 2025 data won't be available until Q3 2026.

### 2.4 HMDA Strategy — What We Can Extract

Despite limitations, HMDA provides **valuable seed data** for our behavioral intelligence model:

**A. Lender Approval Rate Benchmarks**
```
For each lender:
  - Total investment property applications (occupancy_type = 3)
  - Originated / Denied / Withdrawn / Incomplete rates
  - Approval rate by state, property type, loan amount bucket
  - Rate spread distribution (proxy for pricing competitiveness)
```

**B. Lender Volume & Market Share**
```
For each lender:
  - Investment property loan volume (count + dollar amount)
  - Market share by state
  - Average loan size
  - Growth/decline trends (year-over-year)
```

**C. Non-QM Proxy Identification**
```
Filter for likely DSCR/Non-QM:
  - occupancy_type = 3 (investment property)
  - business_purpose = 1 (primarily business)
  - rate_spread > 3.0 (300bp over APOR = likely non-QM pricing)
  - lender = non-bank DSCR lenders (cross-reference our lender list)
  - dwelling_type = 1 (single family) or multifamily
  - total_units <= 10 (DSCR typically 1-10 units)
```

**D. Implementation Plan**

```
Phase 1 (Month 1): Download HMDA 2023-2024 data from CFPB
  - https://ffiec.cfpb.gov/data-publication/snapshot-national-loan-level
  - Filter to investment property + business purpose
  - Map LEIs to our known DSCR lender list
  - Compute approval rates, volume, pricing proxies

Phase 2 (Month 2): Build HMDA-to-DSCR crosswalk
  - Match HMDA lenders to our verified lender parameters
  - Identify which DSCR lenders report to HMDA and which don't
  - Estimate "HMDA coverage ratio" for DSCR market (likely 30-50%)

Phase 3 (Ongoing): Annual HMDA refresh
  - Update when new data released each year
  - Use as validation benchmark for crowdsourced data
  - Track lender-level trends (expansion, contraction, pricing shifts)
```

### 2.5 HMDA Data Sources & Access

| Source | URL | Cost | Format |
|---|---|---|---|
| CFPB HMDA Data Browser | ffiec.cfpb.gov/data-browser | Free | Interactive, CSV download |
| CFPB Snapshot Data | ffiec.cfpb.gov/data-publication/snapshot-national-loan-level | Free | CSV (large files) |
| HMDA Sandbox API | ffiec.cfpb.gov/tools/sandbox | Free | API (rate-limited) |
| FFEIC National Aggregate | ffiec.gov/hmda/ | Free | Summary tables |
| Consumer Financial Monitor | consumerfinance.gov | Free | Reports & analysis |

---

## 3. SECURITIZATION DATA AS PROXY

### 3.1 The Non-QM RMBS Market

Non-QM DSCR loans are extensively securitized. Major issuers include:

| Issuer | DSCR Exposure | Notable Deals |
|---|---|---|
| **Angel Oak** | Very High | AOMT series (Angel Oak Mortgage Trust) — dedicated DSCR pools |
| **Kiavi** | High | Formerly LendingHome; loans appear in multiple shelf programs |
| **Newrez** | High | SmartVest loans securitized through multiple issuers |
| **Deephaven** | High | PWR series (Pacific Western Bank shelf) |
| **Finance of America** | Medium | FOA series — includes DSCR alongside other non-QM |
| **Invictus Capital** | High | Specialized non-QM/DSCR issuer |
| **PennyMac** | Medium | PSLT series — mixed non-QM |

**Total Non-QM RMBS issuance: ~$30-50B annually (2024-2026), with DSCR loans comprising 40-60% of collateral.**

### 3.2 What RMBS Deal Documents Contain

When a lender securitizes DSCR loans, the **prospectus supplement** (pro supp) and **loan tape** contain extremely rich pool-level data:

#### Available Data Fields (Typical DSCR RMBS Loan Tape)

| Category | Fields | Richness |
|---|---|---|
| **DSCR Metrics** | Original DSCR, DSCR calculation method (scheduled vs actual), DSCR at cutoff | ★★★★★ |
| **Credit Profile** | FICO score (borrower and co-borrower), credit score model used | ★★★★★ |
| **Loan Terms** | Note rate, margin, index, original balance, current balance, maturity date | ★★★★★ |
| **LTV/CLTV** | Original LTV, current LTV, appraised value, purchase price | ★★★★★ |
| **Property** | Property type (SFR, 2-4 unit, condo), occupancy (investor, second home), state, MSA | ★★★★★ |
| **Income** | Scheduled rent, actual rent, DSCR method, STR indicator | ★★★★☆ |
| **Borrower** | Entity type (LLC, individual), number of properties owned, first-time investor flag | ★★★★☆ |
| **Performance** | Current status (current, 30-day, 60-day, 90+ day), modification history | ★★★★★ |
| **Geography** | Property state, MSA, zip code (sometimes truncated to 3-digit) | ★★★★☆ |

**This is the single richest public data source on actual DSCR loan characteristics.** It tells us what loans lenders actually originated — not what their guidelines say, but what they actually funded.

### 3.3 How to Access Securitization Data

| Source | What It Provides | Cost | Access Method |
|---|---|---|---|
| **Intex** | Full deal modeling, loan-level data, cashflow modeling | $15K-50K/year | Subscription (industry standard) |
| **Bloomberg ABS** | Deal summaries, loan tapes, performance data | Included in Bloomberg Terminal ($24K/yr) | Terminal access |
| **Fitch Ratings** | Presale reports, rating actions, surveillance | Free (most reports) | fitchratings.com |
| **S&P Global** | Presale reports, performance data, Spotlight series | Free (some); paid for detailed data | spglobal.com |
| **Morningstar DBRS** | Presale reports, rating methodologies | Free (most reports) | dbrs.morningstar.com |
| **KBRA** | Presale reports, surveillance | Free | kbra.com |
| **SEC EDGAR** | Prospectus supplements, pooling & servicing agreements | Free | sec.gov/edgar |
| **FRED (St. Louis Fed)** | Aggregate non-QM issuance data, mortgage rates | Free | fred.stlouisfed.org |

### 3.4 What We Can Extract from RMBS Data

**A. Lender Origination Behavior**
```
From loan tapes:
  - What DSCR levels does Lender X actually originate? (vs. their published minimum)
  - What FICO floors are they really enforcing?
  - What LTVs are they really achieving?
  - What property types and geographies do they favor?
  - What is the mix of STR vs LTR in their pools?
```

**B. Pool Performance as Lender Quality Signal**
```
From performance reports:
  - 30/60/90+ day delinquency rates by lender
  - Default rates by DSCR bucket
  - Prepayment speeds (CPR) — fast prepays = refinancing out = competitive pressure
  - Loss severity — how bad are the defaults when they happen?
  - Modification rates — does the lender modify troubled loans or foreclose?
```

**C. Pricing Intelligence**
```
From weighted average coupon (WAC) and rate dispersion:
  - What rates is Lender X actually originating at?
  - How wide is their rate dispersion? (tight = consistent pricing; wide = negotiation variability)
  - How do their rates compare to competitors for similar collateral?
```

### 3.5 Limitations of Securitization Data

| Limitation | Impact | Mitigation |
|---|---|---|
| **Pool-level, not individual** | Can't see individual borrower outcomes | Aggregate is still valuable for behavioral patterns |
| **Survivorship bias** | Only securitized loans appear; lender-retained loans are invisible | Combine with other data sources |
| **Lag** | Loan tapes available 1-3 months after deal close; performance data quarterly | Accept lag; focus on trend analysis |
| **Lender masking** | Some deals don't identify the originator by name | Cross-reference with SEC EDGAR filings |
| **No denial data** | Only originated (approved) loans are securitized | Combine with HMDA denial data and broker reports |
| **Cost** | Intex and Bloomberg are expensive | Start with free SEC EDGAR + rating agency reports; upgrade later |
| **Cherry-picking** | Lenders may retain best loans and securitize the rest | Track same-lender pools over time for consistency |

### 3.6 Implementation Plan

```
Phase 1 (Month 1-2): Free Data Mining
  - Download all non-QM RMBS presale reports from Fitch, S&P, KBRA, DBRS
  - Extract DSCR pool statistics from each report
  - Build lender-to-deal mapping
  - Start tracking deal performance via rating agency surveillance reports

Phase 2 (Month 3-4): SEC EDGAR Deep Dive
  - Search EDGAR for all non-QM shelf registrations and prospectus supplements
  - Key shelves: AOMT (Angel Oak), FOA, PWR, PSLT, etc.
  - Extract loan-level data from prospectus supplement exhibits
  - Build initial DSCR origination database

Phase 3 (Month 5-6): Paid Data Integration
  - Evaluate Intex subscription ($20K-30K for non-QM module)
  - If budget permits, get Bloomberg access for deal analytics
  - Build automated pipeline: new deal → extract data → update models

Phase 4 (Ongoing): Performance Tracking
  - Monthly update from rating agency surveillance
  - Track pool delinquency curves by lender
  - Correlate performance with origination characteristics
  - Feed into lender stability risk models
```

---

## 4. LENDER RATE SHEET SCRAPING

### 4.1 What's Scrapable

| Lender | Rate Sheet Online? | Format | Update Frequency | Scrapable? |
|---|---|---|---|---|
| **Kiavi** | Yes — kiavi.com/rates | Web page / PDF | Weekly-Monthly | ✅ Yes |
| **Easy Street Capital** | Partial — rate indications on site | Web page | Monthly | ✅ Partial |
| **Ridge Street Capital** | Rate indications on homepage | Web page | Monthly | ✅ Partial |
| **Griffin Funding** | Rate calculator tool | Web form | Ad hoc | ✅ Via calculator |
| **Visio Lending** | Not directly published | — | — | ❌ No |
| **Lima One** | Not published publicly | — | — | ❌ No |
| **Angel Oak** | Not published publicly | — | — | ❌ No |
| **LendSure** | Available to registered brokers | PDF (behind login) | Weekly | ⚠️ Requires broker access |
| **Deephaven** | Available to registered brokers | PDF (behind login) | Weekly | ⚠️ Requires broker access |
| **BFFWS** | Available to registered brokers | PDF (behind login) | Weekly | ⚠️ Requires broker access |
| **Newrez** | Available via wholesale channel | PDF (behind login) | Monthly | ⚠️ Requires broker access |
| **Arc Home** | Available via correspondent | PDF (behind login) | Weekly | ⚠️ Requires broker access |

**Key Finding:** Only 3-4 DSCR lenders publish rates publicly. The majority distribute rate sheets through wholesale/correspondent portals requiring broker credentials.

### 4.2 Scraping Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   RATE SCRAPING PIPELINE                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Public Sources (No Auth)                                    │
│  ├── Kiavi.com/rates → HTML scraper → rate_parser           │
│  ├── EasyStreetCapital.com → HTML scraper → rate_parser     │
│  └── RidgeStreetCapital.com → HTML scraper → rate_parser    │
│                                                              │
│  Broker Portal Sources (Auth Required)                       │
│  ├── LendSure wholesale portal → PDF downloader → OCR       │
│  ├── Deephaven Optimal Blue → API or PDF → rate_parser      │
│  ├── BFFWS broker portal → PDF downloader → OCR             │
│  └── Newrez SmartVest portal → PDF → rate_parser            │
│                                                              │
│  Rate Parser (Common Format)                                 │
│  ├── Extract: product, FICO tier, LTV tier, DSCR tier       │
│  ├── Extract: base rate, lock periods, origination pts       │
│  ├── Extract: effective date, state restrictions             │
│  └── Normalize → RateSheet table                            │
│                                                              │
│  Delta Detection                                             │
│  ├── Compare new scrape vs. previous version                 │
│  ├── Flag rate changes > 25bp                                │
│  ├── Flag guideline changes (new FICO tiers, DSCR floors)   │
│  └── Push alerts to subscribers + update models             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Technical Implementation

**For public rate pages (Kiavi, Easy Street, Ridge Street):**
- **Playwright/Puppeteer** headless browser for JavaScript-rendered pages
- **Weekly scrape cadence** (DSCR rates don't change daily like conventional)
- **PDF parsing** with `pdf-parse` or `camelot` for rate sheet PDFs
- **OCR fallback** with Tesseract for scanned/image-based PDFs
- **Rate matrix parser** — custom regex/ML to extract structured data from rate grids

**For broker portal rate sheets:**
- Must have **real broker credentials** (NMLS-verified)
- **Optimal Blue / Mortech integration** — many lenders use these pricing engines; API access may be available
- **Email list monitoring** — many lenders distribute rate sheets via email; can auto-parse incoming emails
- **Respectful scraping** — rate-limit to avoid detection; scrape during business hours only

### 4.4 Legal / ToS Considerations

| Concern | Risk Level | Mitigation |
|---|---|---|
| **Copyright on rate sheets** | Low | Rate data is factual information, not copyrightable expression (Feist v. Rural) |
| **Terms of Service violations** | Medium | Broker portals may prohibit scraping in ToS; use authorized broker access |
| **Computer Fraud & Abuse Act (CFAA)** | Medium | Don't bypass authentication; only scrape with authorized credentials |
| **Anti-competitive claims** | Low | We're aggregating publicly available pricing information |
| **Lender notification** | Recommended | Proactively notify lenders; frame as "market data service" that benefits them too |

**Recommended approach:**
1. For public pages: scrape freely — rate data is factual information
2. For broker portals: use authorized broker credentials with broker's consent
3. For Optimal Blue / Mortech: negotiate API access or reseller agreement
4. Proactively offer lenders the ability to provide rate data directly (partnership model)

### 4.5 Rate Change Intelligence

Beyond just collecting current rates, track **how rates change over time**:

```
RateChange {
  lender: string
  effective_date: date
  product: string
  fico_tier: string
  ltv_tier: string
  dscr_tier: string
  previous_rate: number
  new_rate: number
  rate_change_bps: number
  previous_origination: number
  new_origination: number
  origination_change_bps: number
  state_restrictions: string[]
  
  // Derived intelligence
  is_promotional: boolean  // temporary rate reduction?
  follows_market: boolean  // correlated with MBS/Treasury moves?
  competitive_response: boolean  // did competitor just change rates?
  capacity_signal: enum   // rate increase = capacity tightening?
}
```

This rate change history is itself valuable behavioral data: it reveals lender capacity cycles, competitive dynamics, and risk appetite shifts.

---

## 5. MORTGAGE BROKER SURVEY DESIGN

### 5.1 Survey Architecture — Three Tiers

| Tier | Frequency | Depth | Incentive | Target |
|---|---|---|---|---|
| **Pulse Survey** | Monthly | 5-8 questions (2 min) | Data access credits | All contributors |
| **Deep Dive** | Quarterly | 20-30 questions (10 min) | $25-50 Amazon gift card | Active brokers |
| **Expert Interview** | Semi-annual | 60-min structured interview | $150-200 + premium access | Top producers |

### 5.2 Pulse Survey Questions (Monthly)

These questions are designed for maximum signal extraction per question. Each targets a specific behavioral intelligence dimension.

**Q1: Approval Gap Detection (Dimension: Approval Rate Intelligence)**
> "For [LENDER X], what is the lowest DSCR you've had APPROVED in the past 30 days?"
> - Open numeric response
> - Asked for top 3 lenders the broker uses most

**Q2: Timeline Reality Check (Dimension: Speed/Capacity Intelligence)**
> "On your last 3 closed deals with [LENDER X], what was the average time from submission to clear-to-close?"
> - Numeric response in days
> - Compared against lender's published timeline

**Q3: Flexibility Signal (Dimension: Overlay Gap Intelligence)**
> "In the past month, has [LENDER X] approved any deal that didn't meet their published guidelines? (e.g., lower DSCR, lower FICO, higher LTV, fewer reserves)"
> - Yes/No
> - If Yes: "What guideline was exceeded and by how much?"

**Q4: Rate Negotiability (Dimension: Pricing Behavior)**
> "Rate the negotiability of [LENDER X]'s rate and origination on a 1-5 scale:"
> - 1 = Take it or leave it (no negotiation)
> - 2 = Minor flexibility (5-10bp rate, 0.125pt origination)
> - 3 = Moderate flexibility (10-25bp rate, 0.25pt origination)
> - 4 = Significant flexibility (25-50bp rate, 0.5pt origination)
> - 5 = Highly negotiable (50bp+ rate, 1pt+ origination)

**Q5: Condition Severity (Dimension: Condition/Overlay Intelligence)**
> "On your last deal with [LENDER X], were the conditions reasonable relative to the published guidelines?"
> - 1 = Much worse than expected (surprise conditions)
> - 2 = Somewhat worse
> - 3 = About as expected
> - 4 = Somewhat better (fewer/easier conditions)
> - 5 = Much better (minimal conditions)

**Q6: AE/LO Quality (Dimension: Relationship Intelligence)**
> "How responsive and helpful is your primary AE at [LENDER X]?"
> - 1 = Unresponsive / unhelpful
> - 2 = Slow but eventually helpful
> - 3 = Adequate
> - 4 = Responsive and helpful
> - 5 = Exceptional partner

**Q7: STR Flexibility (Dimension: Overlay Gap — STR specific)**
> "Which DSCR lender is MOST flexible on STR income qualification?"
> - Dropdown of lenders
> - "Why?" (free text, 1-2 sentences)

**Q8: Capacity Signal (Dimension: Capacity Cycle Intelligence)**
> "In the past month, has [LENDER X] seemed to be:"
> - Actively seeking deals (fast turnaround, flexible)
> - Processing normally
> - Slowing down / being more conservative
> - Effectively closed to new submissions

### 5.3 Deep Dive Survey Questions (Quarterly)

**Section A: Lender-Specific Behavioral Profile** (20 minutes)

1. "For each lender you've used in the past 90 days, rate their OVERALL reliability as a DSCR partner (1-5 scale)"

2. "Have you observed [LENDER X] changing their underwriting strictness in the past quarter? In which direction?"

3. "What is the ACTUAL minimum DSCR [LENDER X] will approve, regardless of what they publish?"

4. "What is the ACTUAL minimum FICO [LENDER X] will approve?"

5. "Has [LENDER X] ever approved a deal with reserves below their published requirement? What was the actual reserve amount?"

6. "Does [LENDER X] allow STR income using AirDNA? If so, what haircut do they apply?"

7. "For cash-out refinances, what is [LENDER X]'s ACTUAL seasoning requirement vs. their published requirement?"

8. "What entity structures does [LENDER X] actually accept vs. what they publish?"

9. "How often does [LENDER X] re-trade on rate after initial lock? (Never / Rarely / Sometimes / Often / Always)"

10. "Has [LENDER X] ever pulled a commitment after approval? Under what circumstances?"

**Section B: Competitive Landscape** (5 minutes)

11. "If [YOUR #1 LENDER] stopped lending tomorrow, which lender would you move your DSCR business to?"

12. "Which DSCR lender has surprised you most (positively) in the past quarter? How?"

13. "Which DSCR lender has disappointed you most in the past quarter? How?"

14. "What is the #1 thing you wish you knew about a lender BEFORE submitting a deal?"

**Section C: Market Intelligence** (5 minutes)

15. "Are DSCR lenders overall getting more or less strict this quarter?"

16. "Are DSCR rates trending up, down, or flat relative to Treasuries?"

17. "Which property types are lenders tightening on? (Select all: SFR, 2-4 unit, 5-10 unit, condo, STR, mixed-use)"

18. "Are you seeing any new DSCR lenders entering your market?"

19. "Have any DSCR lenders exited your market or stopped lending?"

20. "What's the single biggest pain point in your DSCR lending workflow?"

### 5.4 Survey Quality Controls

| Control | Implementation | Rationale |
|---|---|---|
| **Attention check** | "Select 'Moderate' for this question" (1 per survey) | Filters inattentive respondents |
| **Consistency check** | Q4 asks about Lender X negotiability; Q10 asks about re-trading — should be consistent | Catches contradictory responses |
| **Recency requirement** | "Only answer for lenders you've used in the past 90 days" | Prevents stale/guessed data |
| **Minimum deal volume** | Brokers must have closed ≥3 DSCR deals to participate in deep dive | Ensures experienced respondents |
| **Max per lender** | Max 3 responses per lender per broker per survey period | Prevents single-broker dominance |
| **Time minimum** | Survey must take ≥60 seconds for pulse; ≥5 minutes for deep dive | Prevents bot/gaming |
| **Outlier flagging** | Responses >2 standard deviations from lender mean are flagged for review | Statistical quality control |

### 5.5 Survey Distribution Strategy

| Channel | Method | Expected Response Rate |
|---|---|---|
| **In-app** | Post-deal submission prompt ("Rate your experience with [Lender]") | 40-60% |
| **Email** | Monthly pulse survey to registered brokers | 15-25% |
| **LinkedIn Groups** | Mortgage broker communities (DSCR-specific groups) | 5-10% |
| **Broker associations** | NAMB, state mortgage associations | 10-15% |
| **Partner AE networks** | Lender AEs share survey with their broker networks | 20-30% |
| **Incentivized** | $25 gift card for completing quarterly deep dive | 40-60% |

---

## 6. DATA NETWORK EFFECTS ARCHITECTURE

### 6.1 The Flywheel

```
                    ┌──────────────────────┐
                    │  MORE DATA POINTS    │
                    │  (submissions,       │
                    │   surveys, rates)    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  BETTER MODELS       │
                    │  (lender-specific    │
                    │   approval rates,    │
                    │   pricing, timing)   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  BETTER              │
                    │  RECOMMENDATIONS     │
                    │  (right lender,      │
                    │   right price,       │
                    │   first try)         │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  MORE USERS          │
                    │  (brokers get        │
                    │   better results,    │
                    │   tell colleagues)   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  MORE DATA POINTS    │
                    │  (more users submit  │
                    │   more outcomes)     │
                    └──────────┬───────────┘
                               │
                               ▼
                           [FLYWHEEL]
```

### 6.2 Data Scale Milestones

| Data Points | What's Possible | Product Capability | Competitive Moat |
|---|---|---|---|
| **100** deals | Basic patterns: "Lender X seems flexible on DSCR" | Anecdotal reports | None |
| **500** deals | Directional signals: "Lender X approves 60% of sub-1.0 DSCR deals" | Lender comparison tables | Minimal |
| **1,000** deals | Lender-specific models: approval probability by FICO/DSCR/LTV tier | Approval probability engine | Emerging |
| **5,000** deals | Statistical significance on major overlay gaps; detect capacity cycles | Lender behavioral profiles | Moderate |
| **10,000** deals | Significant on niche overlays (STR haircuts, entity restrictions, reserves) | Comprehensive behavioral intelligence | Strong |
| **25,000** deals | Predictive: "Lender X will likely tighten in Q3 based on capacity signals" | Predictive lender analytics | Very Strong |
| **50,000** deals | Comprehensive: full behavioral profiles for 30+ lenders across all dimensions | Industry-standard intelligence layer | **Insurmountable** |

### 6.3 Data Value by Intelligence Dimension

Different dimensions require different data volumes to reach statistical significance:

| Behavioral Dimension | Min Data Points for Signal | Min for Significance | Min for Comprehensive |
|---|---|---|---|
| Approval rate by lender | 50 per lender | 200 per lender | 1,000 per lender |
| DSCR flexibility (actual vs. published) | 30 per lender | 100 per lender | 500 per lender |
| Pricing behavior (rate spread distribution) | 50 per lender | 200 per lender | 1,000 per lender |
| Timeline/capacity cycles | 100 per lender | 500 per lender | 2,000 per lender |
| Condition severity | 50 per lender | 200 per lender | 1,000 per lender |
| STR-specific overlays | 30 per lender | 100 per lender | 500 per lender |
| Negotiability/flexibility | 100 per lender | 500 per lender | 2,000 per lender |
| Stability/reliability risk | 200 per lender | 1,000 per lender | 5,000 per lender |

### 6.4 Data Gravity & Defensibility

**Why this moat is defensible:**

1. **Data uniqueness** — No one else is collecting this. First-mover advantage is massive.
2. **Network effects** — Each new data point improves models for all users, attracting more users who contribute more data.
3. **Temporal accumulation** — Historical behavioral data can't be replicated instantly. A competitor starting in year 2 will always be 1 year behind on trend data.
4. **Contributor lock-in** — Brokers who've contributed 100+ data points have significant investment in the platform; switching costs are high.
5. **Validation flywheel** — More data → more accurate models → more broker trust → more data submissions → even more accurate models.
6. **Multi-source triangulation** — Combining HMDA + RMBS + scraping + survey + crowdsourced data creates a dataset that's greater than the sum of its parts; replicating all 6 channels is extremely costly.

**What's NOT defensible:**
- Raw HMDA data (anyone can download it)
- Published rate sheets (competitors can scrape them too)
- Public RMBS data (anyone can read prospectus supplements)

**What IS defensible:**
- The proprietary crosswalk between all data sources
- The broker-contributed outcome data (unique, not available elsewhere)
- The behavioral models trained on the combined dataset
- The contributor network (relationships with 1,000+ active brokers)

---

## 7. PRIVACY & LEGAL FRAMEWORK

### 7.1 What Data Can We Legally Collect?

| Data Type | Collectible? | Legal Basis | Requirements |
|---|---|---|---|
| **Lender name & product info** | ✅ Yes | Public information | None |
| **Published guidelines/rates** | ✅ Yes | Public information | Attribution if needed |
| **Broker's own experience with a lender** | ✅ Yes | First-party data, broker consent | Broker must consent to sharing |
| **Loan outcome (approved/denied)** | ✅ Yes | Broker's own experience | Anonymize borrower; no PII |
| **Specific loan terms (rate, LTV, DSCR)** | ✅ Yes | Business information | No borrower PII; aggregate reporting |
| **Borrower identity** | ❌ No | Privacy laws (GLBA, state laws) | Never collect |
| **Borrower credit/income data** | ❌ No | FCRA, GLBA | Never collect |
| **Property address** | ⚠️ Caution | Can be quasi-identifying | Truncate to zip/county level |
| **Lender internal decision data** | ❌ No | Confidential | Only collect broker's observation |

### 7.2 Fair Lending Considerations

**Critical risk:** If we track and publish lender approval/denial patterns that could be correlated with protected classes (race, ethnicity, gender, age), we could inadvertently create fair lending liability for ourselves or for lenders.

**Mitigation framework:**

| Risk | Mitigation |
|---|---|
| **Approval rate by geography** could imply racial patterns | Never publish approval rates at census tract level; aggregate to MSA or state |
| **Denial reason analysis** could reveal disparate impact | Focus analysis on DSCR/FICO/LTV/business factors, never on borrower demographics |
| **Lender ranking by "flexibility"** could incentivize redlining | Frame flexibility around DSCR/FICO/LTV parameters, never geographic or demographic |
| **Publishing individual lender approval rates** could trigger ECOA claims | Aggregate across multiple lenders; never publish single-lender rates below MSA level |
| **Data subpoena risk** — CFPB or state AG could request our data | Maintain data as aggregate statistical analysis; minimize retention of raw submissions |

**Recommended policy:**
- **Never** collect borrower race, ethnicity, gender, or age
- **Never** publish lender-level approval rates at geographic granularity finer than MSA
- **Always** frame behavioral intelligence in business-purpose terms (DSCR, LTV, FICO, property type)
- **Document** our methodology as "improving market efficiency for business-purpose lending" (DSCR loans are business-purpose, not consumer)
- **Consult** fair lending counsel before publishing any lender-level approval rate data

### 7.3 Anonymization Framework

**Data anonymization tiers:**

| Tier | Applies To | Method | Retention |
|---|---|---|---|
| **Identifying** | Broker NMLS, email | Hashed with salt; only accessible for account management | Encrypted at rest; purged after 3 years of inactivity |
| **Quasi-identifying** | Property location, loan amount, close date | Truncated: zip → 3-digit; loan amount → bucket ($100K ranges); date → month only | Retained for analytics |
| **Non-identifying** | DSCR, FICO (rounded to 10), LTV, rate, conditions | Used as-is | Retained permanently |
| **Aggregated** | Lender-level statistics | Minimum aggregation = 5 data points per cell; small cells suppressed | Published and retained |

**K-anonymity standard:** All published data must achieve k ≥ 5 (at least 5 records in every combination of quasi-identifiers). Where k < 5, generalize or suppress.

### 7.4 Lender Consent

**Do we need lender consent to collect data about their behavior?**

| Data Source | Lender Consent Required? | Rationale |
|---|---|---|
| Published rate sheets | No | Publicly available information |
| HMDA data | No | Government-published public data |
| RMBS deal documents | No | Filed with SEC; public record |
| Broker-reported outcomes | No | Broker is reporting their own experience, not lender's confidential data |
| Lender portal rate sheets | Possibly | If accessed under ToS that prohibit redistribution; need broker authorization |
| Lender-provided data via API | Yes | Partnership agreement required |

**Recommended approach:** No lender consent needed for 90% of our data collection. Proactively offer lenders the opportunity to provide data directly (partnership model) and correct inaccuracies, but don't require their consent to collect publicly available or broker-reported information.

### 7.5 Regulatory Compliance Checklist

| Regulation | Relevance | Compliance Approach |
|---|---|---|
| **GLBA (Gramm-Leach-Bliley)** | Protects consumer financial data | We collect business data, not consumer data; DSCR loans are business-purpose |
| **FCRA (Fair Credit Reporting Act)** | Regulates consumer credit reporting | We don't provide consumer credit reports; we provide lender intelligence |
| **ECOA (Equal Credit Opportunity Act)** | Prohibits lending discrimination | Our data could reveal discriminatory patterns; handle carefully (see 7.2) |
| **CCPA/CPRA (California)** | Consumer privacy | We don't collect consumer data; we collect business intelligence from brokers |
| **State data breach laws** | Breach notification | Standard security practices; encrypt all data at rest and in transit |
| **HMDA itself** | Defines what data is public vs. restricted | HMDA data is public; but don't re-identify individuals from HMDA records |
| **CFAA (Computer Fraud & Abuse Act)** | Unauthorized access to computers | Only scrape publicly available data; use authorized credentials for portals |

---

## 8. COLD START PROBLEM — Getting the First 1,000 Data Points

### 8.1 The Chicken-and-Egg Problem

Brokers won't contribute data until the platform has enough data to be useful. The platform can't be useful until brokers contribute data. We must **seed the platform** with data from non-broker sources.

### 8.2 Seed Data Sources (Months 1-3)

| Source | Estimated Data Points | Cost | Effort | Timeline |
|---|---|---|---|---|
| **HMDA 2023-2024** | 50,000+ investment property loans (after filtering) | $0 | 2-3 weeks engineering | Month 1 |
| **RMBS presale reports** | 200-500 pool-level data points from 30+ deals | $0 | 1-2 weeks research | Month 1-2 |
| **SEC EDGAR loan tapes** | 5,000-20,000 individual loan records | $0 | 2-4 weeks engineering | Month 2 |
| **Public rate sheets** | 50-100 rate grid snapshots (3 lenders × weekly × 8 weeks) | $0 | 1 week engineering | Month 1 |
| **Rating agency surveillance** | 100+ performance data points (delinquency curves) | $0 | 1-2 weeks research | Month 1-2 |
| **Lender website data** | 30+ lender parameter sets (from our existing verified research) | $0 | Already done | Immediate |
| **Founder/team networks** | 50-100 personal deal experiences | $0 | 1-2 weeks outreach | Month 1 |

**Total seed data estimate: ~60,000+ data points from public/semi-public sources**

**But:** This seed data is mostly about what lenders ORIGINATED, not about the behavioral gaps (denials, flexibilities, negotiation levers). For that, we need broker input.

### 8.3 Early Adopter Broker Acquisition (Months 2-6)

#### Target: 200 active broker contributors × 5 deals each = 1,000 broker-sourced data points

**Tier 1: Personal Network (Month 2-3)**
- 20-30 brokers from founder/team personal networks
- Direct outreach; high-trust; willing to contribute without much incentive
- Expected: 5-10 data points per broker = 100-300 data points

**Tier 2: DSCR Specialist Communities (Month 3-4)**
- Facebook groups: "DSCR Lenders & Brokers", "Non-QM Wholesale", "Investment Property Financing"
- BiggerPockets forums (DSCR section)
- LinkedIn groups: "Non-QM Mortgage Professionals", "DSCR Lending"
- Reddit: r/Mortgages, r/realestateinvesting
- Offer: Free premium access for 6 months + early contributor badge
- Expected: 50-100 brokers × 3-5 data points = 150-500 data points

**Tier 3: Mortgage Broker Associations (Month 4-6)**
- NAMB (National Association of Mortgage Brokers) — partner for survey distribution
- State mortgage broker associations (CA, TX, FL, NY — top DSCR markets)
- Wholesale lender events/conferences (bring sign-up booth)
- Offer: Free behavioral intelligence report for their members
- Expected: 100-200 brokers × 2-3 data points = 200-600 data points

#### Incentive Structure for Early Adopters

| Milestone | Reward | Purpose |
|---|---|---|
| First submission | "Founding Contributor" badge (permanent) | Status + identity |
| 5 submissions | 1 month premium access free | Product stickiness |
| 10 submissions | "Top 100 Contributor" recognition; priority support | Gamification |
| 25 submissions | $50 gift card + 3 months premium | Tangible reward |
| 50 submissions | "Expert Contributor" status; invited to product advisory board | Deep engagement |
| 100 submissions | Revenue share (small % of subscription revenue from their data) | Long-term alignment |

### 8.4 Minimum Viable Data to Make Product Useful

**The product is useful when a broker can:**
1. Look up a lender and see **actual** (not just published) parameters → needs ~30 data points per lender
2. Compare two lenders on a specific deal and get an approval probability → needs ~200 data points per lender
3. Get a recommendation: "For YOUR deal, Lender X is 78% likely to approve at 6.25%" → needs ~500 data points per lender

**Phase 1 target (Month 6):** 30 data points per lender for top 10 lenders = 300 broker-sourced data points (+ 60K+ seed data)

**Phase 2 target (Month 12):** 200 data points per lender for top 15 lenders = 3,000 broker-sourced data points

**Phase 3 target (Month 18):** 500 data points per lender for top 20 lenders = 10,000 broker-sourced data points

### 8.5 The "Trojan Horse" Strategy

Instead of launching as a "behavioral intelligence platform" (which sounds like a research project), launch as a **practical tool brokers already need**, with behavioral intelligence as the value-add they discover:

1. **Launch as a DSCR lender comparison tool** (like a mortgage rate comparison site, but for DSCR)
   - Show published parameters (we already have this data verified)
   - Add "Community Insights" tab showing aggregated behavioral data
   - The comparison tool is the hook; behavioral intelligence is the differentiator

2. **Add a "Deal Check" feature** — broker enters deal parameters, gets instant feedback:
   - "Based on published guidelines, these 5 lenders qualify"
   - "Based on community data, Lender X has approved deals like yours 78% of the time"
   - "Lender Y's published DSCR minimum is 1.0, but they've approved deals at 0.85"

3. **The "submit outcome" prompt** appears AFTER the broker uses the tool:
   - "How did your deal with [Lender X] turn out? Help the community by sharing."
   - One-click: Approved / Denied / Conditions
   - Two-click: Rate / Timeline / Flexibility rating
   - Frictionless contribution embedded in natural workflow

---

## 9. INTEGRATED DATA ACQUISITION TIMELINE

### 9.1 18-Month Roadmap

```
MONTH 1-2: SEED PHASE
├── Download & process HMDA 2023-2024 data (investment property filter)
├── Collect & parse 30+ RMBS presale reports (non-QM deals)
├── Build rate scraping pipeline for 3 public-facing lenders
├── Compile existing lender parameter data (already done)
├── Design & launch broker submission platform (MVP)
└── Recruit 20 founding broker contributors

MONTH 3-4: EARLY GROWTH
├── First 300 broker-sourced data points
├── Launch monthly pulse survey
├── SEC EDGAR loan tape extraction (5,000+ loan records)
├── Rate scraping expanded to 6+ lenders (with broker portal access)
├── DSCR community outreach (Facebook, LinkedIn, BiggerPockets)
└── First "Lender Behavioral Profile" published (top 5 lenders)

MONTH 5-6: PRODUCT-MARKET FIT
├── 1,000 broker-sourced data points
├── Launch "Deal Check" feature with behavioral intelligence
├── Quarterly deep dive survey (first edition)
├── HMDA 2025 data integration (when released)
├── Broker association partnerships (NAMB, state associations)
└── First revenue (premium subscriptions for advanced intelligence)

MONTH 7-9: SCALE
├── 3,000+ broker-sourced data points
├── 15+ lenders with behavioral profiles
├── RMBS performance tracking pipeline operational
├── Rate change alert system launched
├── Predictive models: lender capacity cycle detection
└── 500+ registered broker users

MONTH 10-12: ACCELERATION
├── 5,000+ broker-sourced data points
├── 20+ lenders with comprehensive behavioral profiles
├── First lender partnership (data validation / API integration)
├── Approval probability engine (lender + deal specific)
├── Second revenue stream: lender intelligence reports (sold to lenders)
└── 1,000+ registered broker users

MONTH 13-18: DOMINANCE
├── 10,000-50,000+ broker-sourced data points
├── 30+ lenders profiled across all 8 behavioral dimensions
├── Predictive analytics: "Lender X likely to tighten in Q3"
├── Multiple lender partnerships for direct data feeds
├── Industry recognition as the DSCR behavioral intelligence standard
└── 2,000-5,000+ registered broker users; sustainable revenue model
```

### 9.2 Resource Requirements

| Resource | Phase 1 (M1-6) | Phase 2 (M7-12) | Phase 3 (M13-18) |
|---|---|---|---|
| **Engineering** | 2 FTE (data pipeline + platform) | 3 FTE (+ ML engineer) | 4-5 FTE |
| **Data/Research** | 1 FTE (HMDA + RMBS) | 1 FTE + 1 analyst | 2 FTE |
| **Biz Dev** | 0.5 FTE (broker recruitment) | 1 FTE (+ lender partnerships) | 1.5 FTE |
| **Total FTE** | 3.5 | 5 | 6.5-7.5 |
| **Data costs** | $0-5K (free sources) | $20-50K (Intex/Bloomberg eval) | $30-80K (paid data) |
| **Incentive costs** | $5-10K (gift cards, free access) | $15-25K | $25-50K |
| **Marketing** | $5-10K (community outreach) | $15-25K | $30-50K |
| **Total budget** | $10-25K + salaries | $50-100K + salaries | $85-180K + salaries |

---

## 10. DATA ARCHITECTURE — TECHNICAL SPECIFICATION

### 10.1 Data Warehouse Schema

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA WAREHOUSE LAYERS                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  RAW LAYER (Bronze)                                         │
│  ├── raw_hmda_loans          (HMDA annual data)            │
│  ├── raw_rmbs_deals          (SEC EDGAR + rating agencies) │
│  ├── raw_rate_sheets         (Scraped rate data)           │
│  ├── raw_broker_submissions  (Crowdsourced outcomes)       │
│  ├── raw_survey_responses    (Pulse + deep dive surveys)   │
│  └── raw_lender_partnerships (API feeds from lenders)      │
│                                                              │
│  CLEANSED LAYER (Silver)                                    │
│  ├── normalized_loans        (Common schema across sources) │
│  ├── lender_master           (Canonical lender list)       │
│  ├── product_master          (Lender product definitions)  │
│  ├── rate_history            (Rate sheet time series)      │
│  └── verification_scores     (Data quality tracking)       │
│                                                              │
│  ANALYTICS LAYER (Gold)                                     │
│  ├── lender_behavioral_profiles (Per-lender aggregate)     │
│  ├── approval_probability_models (ML models)               │
│  ├── pricing_models          (Rate/origination prediction) │
│  ├── capacity_cycle_models   (Timeline/capacity tracking)  │
│  └── market_intelligence     (Cross-lender analytics)      │
│                                                              │
│  PUBLISHED LAYER (Platinum)                                 │
│  ├── api_endpoints           (Real-time intelligence)      │
│  ├── reports                 (PDF/HTML reports)            │
│  ├── alerts                  (Rate change, capacity shift) │
│  └── exports                 (CSV/JSON data exports)       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 Key Technical Decisions

| Decision | Recommendation | Rationale |
|---|---|---|
| **Data warehouse** | Snowflake or BigQuery | Handles 100M+ HMDA rows; pay-per-query; SQL access |
| **ETL framework** | dbt (data build tool) | Version-controlled SQL transformations; testing; documentation |
| **Rate scraping** | Playwright + custom PDF parser | JavaScript rendering; headless; reliable |
| **ML platform** | Python + scikit-learn → MLflow | Start simple; upgrade to deep learning if needed |
| **API framework** | FastAPI | Fast, typed, async; Python ecosystem |
| **Database** | PostgreSQL (operational) + Snowflake (analytical) | Operational for platform; analytical for intelligence |
| **Real-time** | Redis + WebSocket | Rate alerts, deal check responses |
| **Monitoring** | dbt tests + Great Expectations | Data quality checks on every pipeline run |

### 10.3 Data Freshness Requirements

| Data Type | Update Frequency | Max Acceptable Latency |
|---|---|---|
| Rate sheets | Daily scrape | 24 hours |
| Broker submissions | Real-time | Immediate |
| Survey responses | Real-time | Immediate |
| HMDA data | Annual (when released) | 1 month after release |
| RMBS deal data | Monthly | 2 weeks after deal close |
| RMBS performance | Quarterly | 1 month after period end |
| Behavioral models | Daily retrain | 24 hours |
| Approval probabilities | Real-time inference | <2 seconds response |

---

## 11. COMPETITIVE MOAT ASSESSMENT

### 11.1 Why Competitors Can't Easily Replicate This

| Barrier | Description | Time to Replicate |
|---|---|---|
| **Data uniqueness** | Broker outcome data doesn't exist anywhere else | 12-24 months |
| **Network effects** | More data → better product → more users → more data | 18-36 months |
| **Multi-source integration** | Combining 6 data sources requires significant engineering | 6-12 months |
| **Contributor relationships** | 1,000+ active brokers contributing regularly | 12-18 months |
| **Temporal data** | Historical behavioral data (rate changes, capacity cycles) | Grows 1 year per year |
| **Validation system** | Multi-layer verification builds trust; can't be faked quickly | 6-12 months |
| **Regulatory knowledge** | Privacy framework + fair lending compliance | 3-6 months |

### 11.2 Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Lenders block scraping** | Medium | Low | Shift to broker-submitted rate data; partner with lenders |
| **Competitor launches similar platform** | Low (Year 1) | High | First-mover advantage; lock in brokers early |
| **Brokers submit fake data** | Medium | High | Multi-layer verification system (Section 1.4) |
| **Lenders threaten legal action** | Low | Medium | Proactive outreach; frame as beneficial; legal review of all published data |
| **Regulatory scrutiny** | Low | High | Fair lending compliance framework (Section 7.2); retain counsel |
| **Data breach** | Low | Very High | SOC 2 compliance; encryption; minimal PII collection |
| **Lenders change behavior to match our data** | Medium | Low | Actually a GOOD sign — means our data is influential; update models continuously |
| **HMDA data becomes less useful** | Low | Low | HMDA is seed data only; primary value is in broker-sourced data |

---

## 12. MEASURING SUCCESS — KPIs

### 12.1 Data Acquisition KPIs

| KPI | Month 6 Target | Month 12 Target | Month 18 Target |
|---|---|---|---|
| Total data points | 1,000 (broker) + 60K (seed) | 5,000 (broker) + 100K (seed) | 50,000 (broker) + 150K (seed) |
| Lenders with behavioral profiles | 10 | 20 | 30+ |
| Active broker contributors | 200 | 500 | 2,000 |
| Monthly survey response rate | 20% | 30% | 40% |
| Data verification score (avg) | 3.5 | 4.0 | 4.5 |

### 12.2 Product KPIs

| KPI | Month 6 Target | Month 12 Target | Month 18 Target |
|---|---|---|---|
| Deal Check queries/month | 500 | 5,000 | 25,000 |
| Approval probability accuracy | 65% | 75% | 85% |
| Rate prediction error (MAE) | 50bp | 30bp | 15bp |
| Timeline prediction error | ±10 days | ±7 days | ±5 days |
| User retention (monthly) | 60% | 70% | 80% |

### 12.3 Business KPIs

| KPI | Month 6 Target | Month 12 Target | Month 18 Target |
|---|---|---|---|
| Registered users | 500 | 2,000 | 5,000 |
| Paying subscribers | 0 | 100 | 500 |
| Revenue | $0 | $5K/month | $50K/month |
| Lender partnerships | 0 | 1-2 | 5+ |
| NPS from broker users | 40 | 50 | 60+ |

---

## APPENDIX A: EXISTING DATA INVENTORY

From our verified research (`DSCR_LENDER_PARAMETERS_VERIFIED.md`), we already have:

| Data Category | Count | Quality |
|---|---|---|
| Lenders with verified parameters | 14+ | ✅ High (source-verified) |
| FICO floors confirmed | 12 | ✅ High |
| DSCR minimums confirmed | 13 | ✅ High |
| LTV maximums confirmed | 14 | ✅ High |
| Reserve requirements | 9 | ⚠️ Mixed (some not published) |
| STR policies | 11 | ⚠️ Mixed |
| Prepay structures | 10 | ⚠️ Mixed |
| Loan caps | 12 | ✅ High |
| Rate indications | 5 | ⚠️ Low (few lenders publish rates) |

**This published-parameter data is the BASELINE.** Behavioral intelligence measures the GAP between these published values and actual practice.

---

## APPENDIX B: SAMPLE LENDER BEHAVIORAL PROFILE

*(Illustrative — what the output looks like at scale)*

### Kiavi — Behavioral Intelligence Profile

| Dimension | Published | Actual (Community Data) | Gap | Confidence |
|---|---|---|---|---|
| Min DSCR | 0.80 | 0.75 (approved with compensating factors) | -0.05 | ★★★★☆ |
| Min FICO | 660 | 640 (with 5% LTV reduction) | -20 | ★★★☆☆ |
| Max LTV (Purchase) | 80% (85% at 700+) | 80% rarely exceeds published; 85% requires 720+ FICO in practice | Minimal | ★★★★★ |
| Reserves | None required | 2 months PITIA commonly requested for DSCR <1.0 | +2 months | ★★★☆☆ |
| STR Policy | Eligible | STR income accepted but requires 6-month operating history | Tighter than implied | ★★★☆☆ |
| Close Timeline | Not published | Median 38 days (vs. industry 42 days) | Faster | ★★★★☆ |
| Rate Negotiability | Not published | 2/5 — limited flexibility; AE can get 10-15bp concession | Low | ★★★☆☆ |
| Condition Severity | Not published | 3/5 — moderate; few surprise conditions | Average | ★★★★☆ |
| Approval Rate (DSCR 0.80-1.0) | N/A | ~72% approval rate | N/A | ★★★☆☆ |
| Approval Rate (DSCR >1.0) | N/A | ~89% approval rate | N/A | ★★★★☆ |

---

## APPENDIX C: REGULATORY REFERENCE

| Regulation | Citation | Relevance |
|---|---|---|
| HMDA | 12 USC 2801-2811 | Public data source; defines reporting requirements |
| Regulation C | 12 CFR 1003 | Implements HMDA; defines data fields |
| ECOA | 15 USC 1691-1691f | Fair lending; limits how we analyze approval patterns |
| Regulation B | 12 CFR 1002 | Implements ECOA |
| FCRA | 15 USC 1681-1681x | Consumer credit reporting; we don't provide credit reports |
| GLBA | 15 USC 6801-6809 | Financial privacy; we collect business data, not consumer |
| CCPA/CPRA | Cal. Civ. Code 1798.100-1798.199.100 | California consumer privacy; business data exemption likely applies |
| CFAA | 18 USC 1030 | Computer access; don't bypass authentication without authorization |

---

*Document version 1.0 — March 5, 2026*  
*Next review: April 2026 (after Phase 1 seed data collection begins)*  
*Owner: DSCR Intelligence Platform — Data Engineering Team*
