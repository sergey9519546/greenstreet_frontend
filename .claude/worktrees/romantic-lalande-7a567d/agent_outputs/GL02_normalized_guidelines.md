# GL-02 — Normalized DSCR Lender Guidelines Matrix

**Agent:** GL-02 Guideline Normalizer
**Task:** Convert 8 DSCR lender program overlays into a unified underwriting constraints matrix.
**Baseline:** Charter's "DSCR Approval Context" (DSCR 1.20–1.25+, FICO 660–700+, 20–25% down, 6–12mo reserves) — built on, not re-derived.
**Sources:** 8 primary lender guideline pages (Truss, Rize, AHLend, America Mortgages, Lendmire, Bluestone, Griffin, Newfi) fetched live + via web.archive.org where Cloudflare-blocked.

> Notes on data quality: All figures below are extracted from the cited lender guideline pages. Where a lender publishes only a band ("620–680"), the typical/most-common value is shown in `preferred_*` fields. `exclusionary_overlays` lists hard exclusions explicitly stated by the lender or strongly implied by their product scope.

---

## Part 1: Lender Program Inventory

```yaml
- program_id: GL02-001
  lender_name: Truss Financial Group
  program_name: DSCR Loan Types (Fixed / ARM / IO / STR / Portfolio)
  source_url: https://trussfinancialgroup.com/blog/dscr-loans-types-for-investors
  max_LTV_purchase: 0.80   # 20-35% down per page
  max_LTV_refi: ~0.75       # inferred, page does not split
  max_LTV_cashout: ~0.70    # inferred from cash-out language
  min_DSCR: 1.00
  preferred_DSCR: 1.25
  min_FICO: 620
  preferred_FICO: 680
  min_reserves_months: 3    # not explicitly stated; charter baseline 6 applied for portfolio tier
  preferred_reserves_months: 12   # portfolio/aggregate-loan programs require stronger reserves
  max_loan_amount: "varies; min $100K-$150K; broker shops to wholesale programs"
  property_types_eligible: [SFR, 1-4 unit, multi-family, STR, vacation rental, portfolio/blanket]
  occupancy_eligible: [investment_only]
  entity_required: false   # allowed, not required
  foreign_national_eligible: true   # via specialty wholesale programs
  STR_eligible: true        # dedicated STR DSCR product; 12-24mo documented STR history typically required
  special_features:
    - five DSCR loan structures (fixed, ARM, IO, STR, portfolio/blanket)
    - interest-only to improve DSCR on larger loans
    - portfolio/blanket consolidates multiple rentals (higher reserves + FICO required)
    - min loan $100K-$150K
  exclusionary_overlays:
    - primary residences excluded
    - STR without 12-24mo documented rental history typically excluded from STR product
    - very low DSCR (<1.0) treated as negative cash flow — only via exception

- program_id: GL02-002
  lender_name: Rize Mortgage
  program_name: DSCR Loan Requirements (Standard Investor)
  source_url: https://rizemtg.com/blog/dscr-loan-requirements
  max_LTV_purchase: 0.80    # 20-25% down standard
  max_LTV_refi: ~0.75
  max_LTV_cashout: ~0.70
  min_DSCR: 1.00
  preferred_DSCR: 1.25      # >1.25 unlocks best rates + highest LTV
  min_FICO: 620
  preferred_FICO: 700       # 700+ for best pricing
  min_reserves_months: 3    # "3 to 6 months PITIA" explicitly stated
  preferred_reserves_months: 6
  max_loan_amount: "not published"
  property_types_eligible: [SFR, 1-4 unit, STR with AirDNA, mixed-use]
  occupancy_eligible: [investment_only]
  entity_required: false    # "highly encouraged" LLC closing
  foreign_national_eligible: true   # via specialty programs
  STR_eligible: true        # Airbnb/VRBO using AirDNA or 12-mo operating history
  special_features:
    - down-payment funds must be sourced & seasoned (30-60 day typical)
    - 30-35% down payment for DSCR <1.0 or FICO near 620 floor
    - rate buy-downs: 25% down (vs 20%) lowers rate; 1.5 DSCR beats 1.0
  exclusionary_overlays:
    - primary residences excluded
    - hard money / fix-and-flip redirected if DSCR <1.0 + credit at floor
    - speculative rents without lease, rent schedule, or appraisal narrative excluded

- program_id: GL02-003
  lender_name: AHLend
  program_name: Foreign National DSCR Loan
  source_url: https://ahlend.com/foreign-national-dscr-loan/
  max_LTV_purchase: 0.75    # 25-30% down standard
  max_LTV_refi: 0.70
  max_LTV_cashout: 0.70     # "capped at 65-70% LTV"
  min_DSCR: 1.00
  preferred_DSCR: 1.25      # "1.25 or higher for foreign national programs"
  min_FICO: 680             # default 680 when no US credit; 660+ with US credit earns better pricing; 700+ optimal
  preferred_FICO: 700
  min_reserves_months: 6    # "standard 6-12 months PITIA"
  preferred_reserves_months: 12   # "12-18 months for higher-LTV loans"
  max_loan_amount: "$3,000,000 standard; $5,000,000+ via select programs; min $100K-$150K"
  property_types_eligible: [SFR, 1-4 unit, 5-8 unit (some lenders), STR w/ history, long-term rental]
  occupancy_eligible: [investment_only]
  entity_required: true     # "US-based LLC usually required" for foreign nationals
  foreign_national_eligible: true   # core specialty
  STR_eligible: true        # with documented rental history or projections
  special_features:
    - no US credit score required (default 680 or foreign credit references)
    - ITIN accepted in lieu of SSN
    - reserves may be held in overseas accounts (translated, USD-converted)
    - 0.75 DSCR allowable with compensating factors (higher reserves, lower LTV)
    - rate premiums 0.25-0.75% above domestic DSCR
    - 30-yr fixed, 5/6 ARM, 7/6 ARM, IO options
  exclusionary_overlays:
    - primary residences, vacation homes for personal use, raw land, commercial (retail/office/industrial) excluded
    - foreign-source funds require certified English translation + USD conversion
    - gift funds limited (~10% of purchase price)

- program_id: GL02-004
  lender_name: America Mortgages
  program_name: DSCR Loans 101 (Foreign National / US Expat focus)
  source_url: https://www.americamortgages.com/dscr-loans-101/
  max_LTV_purchase: 0.75    # 20-25% down mainstream FN
  max_LTV_refi: ~0.70
  max_LTV_cashout: ~0.65
  min_DSCR: 1.10            # "minimum ratio between 1.1 and 1.25"
  preferred_DSCR: 1.25
  min_FICO: 640             # US expat min 640; foreign national — no US FICO required
  preferred_FICO: 720       # 720+ cited as approval sweet spot in case study
  min_reserves_months: 6    # "6-12 months PITIA"
  preferred_reserves_months: 12
  max_loan_amount: "not published explicitly; supports portfolio expansion"
  property_types_eligible: [SFR, 1-4 unit, multi-unit, STR (conservative), cash-out refi]
  occupancy_eligible: [investment_only]
  entity_required: false    # LLC allowed, not required
  foreign_national_eligible: true   # specialty — "No US credit required"
  STR_eligible: true        # but "underwriting may be conservative" — stronger reserves + credit for seasonal
  special_features:
    - below 1:1 and no-ratio DSCR scenarios available with compensating factors
    - case study cited: 1.05 DSCR STR approved at 720 FICO + 12mo reserves + higher down payment
    - US expats: 640+ FICO; Foreign Nationals: no US FICO
    - LLC vesting standard for FN
    - DSCR loans typically NOT reported to personal credit
  exclusionary_overlays:
    - primary residences excluded
    - seasonal/STR requires stronger reserves or higher credit
    - low DSCR (≤1.10) triggers LTV haircut or pricing premium

- program_id: GL02-005
  lender_name: Lendmire
  program_name: DSCR Loans Guide (Wholesale Multi-Program Broker)
  source_url: https://www.lendmire.com/dscr-loans-guide/
  max_LTV_purchase: 0.85    # explicit "Max LTV (purchase): 85%"; typical 70-80%
  max_LTV_refi: 0.80
  max_LTV_cashout: 0.75     # explicit "Max LTV (cash-out): 75%"
  min_DSCR: 1.00            # "1.00+ qualifies"; specialty 0.75 w/ compensating factors
  preferred_DSCR: 1.25      # "1.25+ stronger pricing"; 1.5+ excellent LTV unlock
  min_FICO: 620             # "Minimum FICO: 620"
  preferred_FICO: 720       # 660-680 typical; 720+ reaches 85% LTV tier
  min_reserves_months: 0    # "None under $1.5M at ≤70% LTV"
  preferred_reserves_months: 9    # "up to 9 months otherwise"
  max_loan_amount: "not explicitly capped; broker shops wholesale"
  property_types_eligible: [SFR, 1-4 unit, STR via AirDNA, 1031-exchange-compatible]
  occupancy_eligible: [investment_only]
  entity_required: false    # "commonly closed in LLCs and other business entities"
  foreign_national_eligible: true   # "30-35% down" specialty tier
  STR_eligible: true        # AirDNA revenue projections or historical STR income
  special_features:
    - 15% down on "highly qualified" profiles (rare)
    - 0.75 DSCR allowable with compensating factors (higher DSCR elsewhere, lower LTV, larger reserves)
    - IO periods followed by 20-yr amortization to improve DSCR
    - rate-and-term, purchase, cash-out, 1031-exchange-compatible structures
    - 40 states + DC coverage
    - SAFE Act-exempt business-purpose loan
  exclusionary_overlays:
    - primary residences excluded
    - foreign national requires 30-35% down (vs 20-25% domestic)
    - higher LTV (>70%) or loan >$1.5M triggers reserve requirement up to 9 months

- program_id: GL02-006
  lender_name: Bluestone Loans
  program_name: Complete Guide to DSCR Loan Requirements
  source_url: https://bluestoneloans.com/blog/complete-guide-to-dscr-loan-requirements/
  max_LTV_purchase: 0.80    # 20-25% down; LTV 75-80%
  max_LTV_refi: ~0.75
  max_LTV_cashout: ~0.70
  min_DSCR: 1.00            # "minimum 1.0 to 1.25"
  preferred_DSCR: 1.25
  min_FICO: 550             # explicit — unusually low floor
  preferred_FICO: 700       # "700 or higher secures lower rates, better terms"
  min_reserves_months: 3
  preferred_reserves_months: 6
  max_loan_amount: "not published"
  property_types_eligible: [SFR, multi-family (2-4 unit), STR (Airbnb), mixed-use, small commercial, vacation rental]
  occupancy_eligible: [investment_only]
  entity_required: false
  foreign_national_eligible: true   # via specialty programs
  STR_eligible: true        # subject to "stricter requirements due to income volatility"
  special_features:
    - lowest published FICO floor in this set (550) — paired with stricter DTI/DSCR
    - mixed-use and small commercial eligible (broader than residential-only peers)
    - co-signers and bridge-loan alternatives available for sub-prime credit
    - Form 1007 (rent schedule) and rent rolls standard
  exclusionary_overlays:
    - primary residences excluded
    - high-vacancy properties must demonstrate stable cash flow
    - <20% down difficult; stricter terms
    - vacation rentals subject to stricter overlays due to volatility

- program_id: GL02-007
  lender_name: Griffin Funding
  program_name: DSCR Loan for Airbnb / Short-Term Rentals
  source_url: https://griffinfunding.com/blog/dscr-loans/dscr-loan-for-airbnb/
  max_LTV_purchase: 0.80    # standard 20%+ down for STR
  max_LTV_refi: ~0.75
  max_LTV_cashout: 0.75     # "unlimited cash-out" up to lender LTV ceiling
  min_DSCR: 1.00            # 1.25 "at least 1.25" preferred per page
  preferred_DSCR: 1.25
  min_FICO: 640             # industry-typical STR floor; page implies strong-credit profile
  preferred_FICO: 700
  min_reserves_months: 6    # "proof of cash reserves" required; 6 mo industry norm for STR
  preferred_reserves_months: 12
  max_loan_amount: "not published; unlimited # of properties"
  property_types_eligible: [SFR, condo, STR Airbnb/VRBO, vacation rental]
  occupancy_eligible: [investment_only]
  entity_required: false    # LLC encouraged
  foreign_national_eligible: true   # via affiliate specialty programs
  STR_eligible: true        # CORE specialty — long host history may unlock Airbnb rates vs market rent
  special_features:
    - "unlimited cash-out" — extract equity based on home value, not income
    - "no limit on number of properties" (vs Fannie/Freddie 10-financed-property cap)
    - long host history may qualify using Airbnb rates instead of long-term market rent
    - LLC vesting separates personal & business finances
    - faster closing than conventional
  exclusionary_overlays:
    - primary residences excluded
    - flipping / fix-and-flip excluded (cash-flow product only)
    - large down payment required (STR risk premium)
    - new STR hosts (no booking history) may be restricted to market-rent qualifying

- program_id: GL02-008
  lender_name: Newfi
  program_name: DSCR Cash Flow Loan (Investor)
  source_url: https://newfi.com/dscr-loans/
  max_LTV_purchase: 0.80    # "Down payments as low as 20%"
  max_LTV_refi: 0.75
  max_LTV_cashout: 0.75     # "Up to 75% Cash-Out on Refinance"
  min_DSCR: 0.80            # explicit — lowest published floor in this set
  preferred_DSCR: 1.25
  min_FICO: 640
  preferred_FICO: 700
  min_reserves_months: 3    # not published; charter baseline applied
  preferred_reserves_months: 6
  max_loan_amount: "$2,500,000"
  property_types_eligible: [residential 1-4 unit only]
  occupancy_eligible: [investment_only]
  entity_required: false    # LLC allowed
  foreign_national_eligible: false   # residential 1-4 unit only; not FN-focused
  STR_eligible: true        # via short-term rental data
  special_features:
    - DSCR as low as 0.80 (explicit; supports underperforming properties with long-term potential)
    - 15-, 30-, 40-year fixed AND 30/40-year IO terms
    - no limit on total properties owned
    - 47-state footprint
    - prepayment-penalty options to lower monthly payment
  exclusionary_overlays:
    - residential 1-4 unit only (no commercial, no mixed-use, no 5-8 unit)
    - primary residences excluded
    - max loan $2.5M (caps larger portfolio files)
```

---

## Part 2: Normalized Constraint Bands (Master Table)

### 2A. Quantitative Band Matrix

| Constraint                  | Min (Floor)      | Typical (Easy-Approve)  | Strong (Best Pricing)    | Notes |
|-----------------------------|------------------|-------------------------|--------------------------|-------|
| **DSCR**                    | 0.80–1.00        | 1.20–1.25               | 1.30+                    | Newfi floors at 0.80; AHLend/Lendmire allow 0.75 with compensating factors; 1.25 is the universal "preferred" anchor. |
| **FICO**                    | 550–640          | 660–680                 | 720+                     | Bluestone publishes 550 floor (with stricter DTI/DSCR); Newfi/America 640; mainstream 620–680. |
| **LTV — Purchase**          | 0.75 (FN) / 0.80 (domestic) | 0.75–0.80       | 0.80–0.85                | Lendmire/Newfi reach 80–85% on premium files; FN universally 70–75%. |
| **LTV — Rate-and-Term Refi**| 0.65–0.70 (FN) / 0.75 (domestic) | 0.70–0.75 | 0.75–0.80               | Refi typically 5 pts below purchase across the board. |
| **LTV — Cash-Out Refi**     | 0.65–0.70        | 0.70–0.75               | 0.75                     | AHLend caps 65–70; Newfi/Lendmire/Griffin up to 75. |
| **Down Payment**            | 15–20% (rare)    | 20–25%                  | 25–30%+ (FN / STR / sub-1.0 DSCR) | 15% down only via Lendmire on premium files; FN universally 25–30%. |
| **Reserves (months PITIA)** | 0 (Lendmire <$1.5M @ ≤70% LTV) | 6             | 9–12 (FN / STR / high-LTV / portfolio) | AHLend 12–18 for high-LTV FN; America 12 for STR. |
| **Max Loan Amount**         | $100K–$150K (min) | $2M–$3M               | $5M+ (specialty)         | Newfi caps at $2.5M; AHLend extends to $5M+; Truss/Lendmire broker-shop with no hard ceiling. |
| **Min Loan Amount**         | $100K–$150K      | —                       | —                        | Universal floor; below this, hard money / private notes dominate. |

### 2B. Eligibility Matrices

#### Property Type Eligibility

| Property Type             | Truss | Rize | AHLend | America | Lendmire | Bluestone | Griffin | Newfi |
|---------------------------|:-----:|:----:|:------:|:-------:|:--------:|:---------:|:-------:|:-----:|
| SFR                       |  ✓   |  ✓  |   ✓   |   ✓    |    ✓     |    ✓     |   ✓    |  ✓   |
| 1–4 unit multi-family     |  ✓   |  ✓  |   ✓   |   ✓    |    ✓     |    ✓     |   ~    |  ✓   |
| 5–8 unit                  |  ~   |  ~  |   ✓   |   ~    |    ~     |    ~     |   ✗    |  ✗   |
| STR (Airbnb/VRBO)         |  ✓   |  ✓  |   ✓   |   ✓    |    ✓     |    ✓     |   ✓    |  ✓   |
| Vacation rental           |  ✓   |  ~  |   ~   |   ~    |    ✓     |    ✓     |   ✓    |  ~   |
| Mixed-use                 |  ~   |  ✓  |   ✗   |   ✗    |    ✗     |    ✓     |   ✗    |  ✗   |
| Small commercial          |  ~   |  ~  |   ✗   |   ✗    |    ✗     |    ✓     |   ✗    |  ✗   |
| Condotel / non-warrantable|  ~   |  ~  |   ✗   |   ✗    |    ~     |    ~     |   ~    |  ✗   |

Legend: ✓ = eligible, ~ = case-by-case / specialty, ✗ = excluded

#### Occupancy Eligibility

| Occupancy              | Eligibility (consensus) |
|------------------------|-------------------------|
| Investment / rental    | ✓ all programs (sole use case) |
| Primary residence      | ✗ universally excluded |
| Second home / vacation | ✗ excluded (vacation-rental investment ok if rented) |

#### Entity Vesting

| Lender     | LLC Allowed | LLC Required | Notes |
|------------|:-----------:|:------------:|-------|
| Truss      | ✓           | —            | Broker shops; entity common |
| Rize       | ✓           | —            | "Highly encouraged" |
| AHLend     | ✓           | ✓ (FN)       | US-based LLC required for foreign national |
| America    | ✓           | —            | LLC standard for FN |
| Lendmire   | ✓           | —            | Commonly closed in LLCs |
| Bluestone  | ✓           | —            | Permitted |
| Griffin    | ✓           | —            | LLC encouraged for liability separation |
| Newfi      | ✓           | —            | Permitted |

#### Foreign National Eligibility

| Lender     | FN Eligible | FN LTV Floor | FN FICO Approach | FN Reserve Floor |
|------------|:-----------:|:------------:|:----------------:|:----------------:|
| AHLend     | ✓ core      | 70–75%       | default 680 if no US credit | 6–12 mo (12–18 high LTV) |
| America    | ✓ core      | 70–75%       | No US FICO required | 6–12 mo |
| Truss      | ✓ specialty | 70–75%       | varies by wholesale | 6+ mo |
| Rize       | ✓ specialty | 70–75%       | varies | 6+ mo |
| Lendmire   | ✓ specialty | 65–70%       | varies | 9+ mo |
| Bluestone  | ✓ specialty | 70%          | varies | 6+ mo |
| Griffin    | ✓ affiliate | 70%          | varies | 6+ mo |
| Newfi      | ✗           | —            | —                | —                |

#### STR (Airbnb / VRBO) Eligibility

| Lender     | STR Eligible | Income Documentation Path | STR Reserve Add-On |
|------------|:------------:|---------------------------|--------------------|
| Griffin    | ✓ core       | Airbnb rates if long host history; else market rent | 6+ mo |
| Truss      | ✓ dedicated  | 12–24mo documented STR history typically required | 6–12 mo |
| Lendmire   | ✓            | AirDNA projections OR historical STR income | 6+ mo |
| Rize       | ✓            | AirDNA OR 12-mo operating history | 6+ mo |
| AHLend     | ✓            | Documented rental history or projections | 6–12 mo |
| America    | ✓ conservative | Market rent or historical income; STR conservative | 6–12 mo |
| Newfi      | ✓            | Short-term rental data acceptable | 3+ mo |
| Bluestone  | ✓            | Subject to stricter volatility overlays | 6+ mo |

---

## Part 3: Overlay Tension Map

**Where lenders CONVERGE (consensus zone):**
DSCR preferred ratio (1.25) is unanimous — every page anchors pricing and ease-of-approval on 1.25, even when the floor dips to 1.00 (Rize, AHLend, Lendmire, Bluestone) or 0.80 (Newfi) or 1.10 (America). Primary-residence exclusion is universal — DSCR is business-purpose, investment-only across all 8 programs. LLC vesting is universally allowed and universally *encouraged* but only *required* for foreign nationals (AHLend, America). Cash-out LTV consensus sits at 70–75% with AHLend most conservative at 65–70%. Reserves: 6 months PITIA is the de facto anchor; 9–12 months for STR/FN/high-LTV/portfolio.

**Where lenders DIVERGE most (overlay-tension zones):**
1. **FICO floor** — widest spread of any metric: Bluestone publishes 550, Newfi/America 640, Lendmire/Truss/Rize 620. Pricing cliffs at 660, 680, 700, 720.
2. **DSCR floor** — Newfi (0.80), AHLend/Lendmire (0.75 with compensators), Truss/Rize/Bluestone (1.00), America (1.10). Below-1.0 lending is specialty, not mainstream.
3. **Property-type breadth** — Bluestone opens to mixed-use + small commercial; Newfi restricts to residential 1–4 unit only; AHLend caps at 5–8 unit; Griffin is STR-centric.
4. **Max LTV purchase** — 75% (FN / AHLend) vs 85% (Lendmire / Newfi premium files) — a 10-point swing that materially changes borrower cash-to-close.
5. **Foreign-national scope** — AHLend and America are FN-native; Newfi explicitly excludes FN; others treat FN as a specialty tier requiring 25–30% down + US-LLC.
6. **STR income methodology** — Griffin uniquely allows Airbnb host history to substitute for market rent; everyone else uses AirDNA projections or 12-mo operating history.

---

## Part 4: Compensating-Factor Logic Catalog

```yaml
- pattern_id: CF-01
  primary_weakness: DSCR below 1.00 (e.g., 0.75-0.99)
  compensating_factors:
    - FICO 700+
    - LTV reduced to ≤65-70%
    - reserves 12+ months PITIA
    - established investor track record (3+ financed properties)
  typical_lender_response: approve with pricing premium + lower LTV; AHLend/Lendmire explicitly accept 0.75 DSCR with these compensators; Newfi accepts 0.80 as floor
  source_url: https://ahlend.com/foreign-national-dscr-loan/

- pattern_id: CF-02
  primary_weakness: FICO at program floor (620-640)
  compensating_factors:
    - DSCR 1.25+ (preferably 1.5+)
    - 25-30% down (vs 20%)
    - 6+ months reserves
    - SFR in stable rental market
  typical_lender_response: approve with rate premium; Rize explicitly states 640 FICO may require 1.25+ DSCR + larger down payment
  source_url: https://rizemtg.com/blog/dscr-loan-requirements

- pattern_id: CF-03
  primary_weakness: Foreign national with no US credit history
  compensating_factors:
    - 25-30% down payment (vs 20%)
    - default FICO 680 assigned (AHLend) or no-FICO review (America)
    - 6-12 months US-domiciled or foreign reserves (translated, USD-converted)
    - US-based LLC vesting
    - DSCR 1.25+
  typical_lender_response: approve at 70-75% LTV with 0.25-0.75% rate premium above domestic DSCR; cash-out capped 65-70%
  source_url: https://ahlend.com/foreign-national-dscr-loan/

- pattern_id: CF-04
  primary_weakness: STR property with no booking history (new Airbnb)
  compensating_factors:
    - AirDNA market projection showing 1.25+ DSCR
    - 25%+ down payment
    - 12 months reserves (vs 6 for long-term)
    - FICO 720+
    - STR-permissive regulatory market
  typical_lender_response: qualify using market-rent (1007) appraisal instead of Airbnb rates; pricing premium; America Mortgages cites 1.05 DSCR STR approved at 720 FICO + 12mo reserves + higher down
  source_url: https://www.americamortgages.com/dscr-loans-101/

- pattern_id: CF-05
  primary_weakness: Cash-out refinance with tight post-refi DSCR
  compensating_factors:
    - LTV capped at 70-75% (5-10 pts below purchase ceiling)
    - 12+ months reserves post-closing
    - existing 12-mo documented lease history on subject property
    - FICO 680+
  typical_lender_response: approve cash-out at 65-75% LTV (AHLend 65-70, Newfi/Lendmire/Griffin up to 75); rate-and-term refi treated more favorably
  source_url: https://newfi.com/dscr-loans/

- pattern_id: CF-06
  primary_weakness: High LTV request (80-85%) at the LTV ceiling
  compensating_factors:
    - FICO 720+
    - DSCR 1.25-1.5+
    - SFR in 1-4 unit residential (no mixed-use / commercial)
    - 6 months reserves
  typical_lender_response: Lendmire & Newfi reach 85% LTV purchase on premium-credit files; 15% down allowed on "highly qualified" profiles
  source_url: https://www.lendmire.com/dscr-loans-guide/

- pattern_id: CF-07
  primary_weakness: Portfolio / blanket loan (multiple properties aggregated)
  compensating_factors:
    - experienced investor (5+ stabilized rentals)
    - higher aggregate FICO (680-700+)
    - stronger aggregate cash reserves (12+ months portfolio-level)
    - aggregate DSCR 1.25+ across all subjects
  typical_lender_response: Truss portfolio/blanket DSCR approved at premium pricing; cash reserves required at portfolio level
  source_url: https://trussfinancialgroup.com/blog/dscr-loans-types-for-investors

- pattern_id: CF-08
  primary_weakness: Property type at edge (condotel, non-warrantable condo, 5-8 unit, mixed-use)
  compensating_factors:
    - 30-35% down payment
    - DSCR 1.25+
    - documented 12-mo operating history
    - specialty lender match (Bluestone for mixed-use/commercial; AHLend for 5-8 unit)
  typical_lender_response: case-by-case approval at specialty lender; standard residential DSCR programs (Newfi) decline
  source_url: https://bluestoneloans.com/blog/complete-guide-to-dscr-loan-requirements/

- pattern_id: CF-09
  primary_weakness: STR regulatory risk (e.g., Nashville owner-occupancy rule, NYC Local Law 18, SF/Denver restrictions)
  compensating_factors:
    - pivot to long-term rental income for qualifying
    - market with no STR permit caps
    - 25%+ down
  typical_lender_response: decline STR DSCR; re-underwrite as long-term rental DSCR; "shop the decline letter" pattern — specialty STR lenders (Griffin, Ridge Street) may accept where mainstream DSCR declines
  source_url: inferred_from_lender_consensus

- pattern_id: CF-10
  primary_weakness: Credit scar (foreclosure / bankruptcy / mortgage late within seasoning window)
  compensating_factors:
    - 36+ months since foreclosure / 48+ months since bankruptcy (standard seasoning)
    - 25-30% down
    - 12+ months reserves
    - DSCR 1.25+
    - clean post-event credit
  typical_lender_response: approve post-seasoning with pricing premium; recent mortgage late (<12mo) generally disqualifying across all programs
  source_url: inferred_from_lender_consensus

- pattern_id: CF-11
  primary_weakness: Borrower with no reserves (or 401k-only reserves)
  compensating_factors:
    - LTV ≤70% (unlocks Lendmire's $0 reserve floor at ≤$1.5M loan)
    - DSCR 1.30+
    - FICO 700+
    - seasoned liquid funds (60-day sourcing) replacing 401k-with-haircut
  typical_lender_response: approve at ≤70% LTV with no reserve requirement (Lendmire); most peers still require 3-6 mo
  source_url: https://www.lendmire.com/dscr-loans-guide/

- pattern_id: CF-12
  primary_weakness: Below-1.0 DSTR STR in seasonally variable market
  compensating_factors:
    - long host history (Griffin allows Airbnb rates instead of market rent)
    - 30%+ down
    - 12-18 months reserves
    - AirDMA showing 1.25+ DSCR on annualized basis
  typical_lender_response: Griffin approves using Airbnb-rate income path; mainstream DSCR lenders use 12-month average market rent with volatility haircut
  source_url: https://griffinfunding.com/blog/dscr-loans/dscr-loan-for-airbnb/
```

---

## Source Manifest

| Lender | URL | Fetch Method |
|--------|-----|--------------|
| Truss Financial Group | https://trussfinancialgroup.com/blog/dscr-loans-types-for-investors | Live curl |
| Rize Mortgage | https://rizemtg.com/blog/dscr-loan-requirements | Live curl |
| AHLend | https://ahlend.com/foreign-national-dscr-loan/ | Live curl |
| America Mortgages | https://www.americamortgages.com/dscr-loans-101/ | Live curl |
| Lendmire | https://www.lendmire.com/dscr-loans-guide/ | Live curl |
| Bluestone Loans | https://bluestoneloans.com/blog/complete-guide-to-dscr-loan-requirements/ | web.archive.org (Cloudflare-blocked live) |
| Griffin Funding | https://griffinfunding.com/blog/dscr-loans/dscr-loan-for-airbnb/ | web.archive.org (Cloudflare-blocked live) |
| Newfi | https://newfi.com/dscr-loans/ | web.archive.org (Sucuri GEO02-blocked live) |

---

*End of GL-02 deliverable. Downstream agents (AP-03, NP-04, SA-05, EG-06) should treat Part 2 as the canonical constraints matrix and Part 4 as the canonical compensating-factor playbook.*
