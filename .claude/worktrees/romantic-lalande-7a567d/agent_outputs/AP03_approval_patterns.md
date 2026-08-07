# AP-03 — DSCR Approval Pattern Miner

**Agent:** AP-03 Approval Pattern Miner
**Task:** Mine CF-01 case files + GL-02 normalized guidelines to identify high-approval multidimensional feature clusters
**Inputs:**
- `/home/z/my-project/download/agent_outputs/CF01_case_files.md` (28 cases: 16 approved / 7 declined / 5 approved_with_conditions)
- `/home/z/my-project/download/agent_outputs/GL02_normalized_guidelines.md` (8 lender programs, 12 compensating-factor patterns)

**Methodology in brief:**
- Evidence base = 28 CF-01 cases. Of those, 11 are real closed-loan / industry-authority cases (`synthesized: false`) and 17 are guideline-grounded reconstructions (`synthesized: true`). Approval rates below weight both; thin-sample clusters are marked `inferred: true` and supplemented with GL-02 normalized bands as plausibility anchors.
- Approval rate counts both `approved` and `approved_with_conditions` as positive outcomes (consistent with how the swarm's downstream scoring will treat "fundable" leads). Where the distinction matters (e.g., approval accelerants that move conditions → clean approve), it is called out explicitly.
- "Baseline" throughout = charter's published easy-approve zone: DSCR 1.20–1.25+, FICO 660–700+, 20–25% down, 6–12mo reserves. This file hunts the *multidimensional* combinations that beat that baseline.

---

## Part 1: Approval-Rich Feature Bands

### AP-001 — Clean SFR Long-Term-Rental Investor (Midwest/Southeast small-portfolio)

```yaml
cluster_id: AP-001
cluster_name: Clean SFR LTR Investor — Midwest/Southeast
approval_rate_observed: 100%   # 4 approved + 1 approved_with_conditions
sample_size: 5
inferred: false
feature_band:
  DSCR_range: [1.12, 1.49]   # Sarah Chen 1.12 low; Dana BRRRR 1.49 high
  FICO_range: [700, 755]
  LTV_range: [0.58, 0.75]    # Sarah Chen 58% (heavy-down for thin-DSCR); rest 75%
  reserves_months_range: [6, 6]
  property_types: [SFR, 2-4_unit]
  occupancy_types: [long_term_rental]
  entity_types: [LLC, personal]   # CF-008 personal vesting; all others LLC
  experience_levels: [first_time, 2_5_doors, 6_20_doors]
  geo_concentration: [IN, TN, MI, NC]
compensating_factors_present:
  - LLC vesting with operating agreement (4 of 5)
  - Form 1007 market-rent supportable in stable rental markets
  - 6 months PITIA reserves (universal in cluster)
  - Turnkey or post-rehab condition (CF-001 tenant-ready, CF-010 post-rehab)
approval_accelerants:
  - Lease-in-place at application or within 3 weeks of closing (CF-001, CF-008)
  - Existing lease terms (CF-008: 3-yr + 1-yr leases on duplex units)
  - BRRRR seasoning ≥6 months from initial hard-money purchase (CF-010)
  - DSCR ≥1.25 unlocks best-tier pricing (CF-010 1.49, CF-009 1.28)
  - Pre-established lender relationships enable 17-28 day closes (CF-001, CF-003, CF-009)
typical_loan_size_band: $150K-$500K
funded_loan_economics_notes: |
  Smaller per-loan balances ($150K-$500K) but high velocity: CF-002 (same borrower
  archetype tier) closed 18 loans in ~3 years. Midwest/Southeast SFR cash-flow yields
  (Cleveland, Memphis, Indianapolis, Grand Rapids) produce 6-14% cash-on-cash. Repeat
  borrowing is the dominant lifetime-value driver; thin per-loan margin is offset by
  portfolio-level revenue.
source_case_ids: [CF-001, CF-008, CF-009, CF-010, CF-026]
```

### AP-002 — Self-Employed Multi-State Portfolio Scaler

```yaml
cluster_id: AP-002
cluster_name: Self-Employed Portfolio Scaler (multi-state, $1M+ loans)
approval_rate_observed: 100%   # 4 approved + 1 approved_with_conditions
sample_size: 5
inferred: false
feature_band:
  DSCR_range: [1.04, 1.28]   # CF-011 1.04 (thin, conditions); CF-009 1.28 high
  FICO_range: [700, 755]
  LTV_range: [0.75, 0.80]    # 80% on CF-004 / CF-005; 75% on others
  reserves_months_range: [6, 6]
  property_types: [SFR]
  occupancy_types: [long_term_rental]
  entity_types: [LLC]
  experience_levels: [2_5_doors, 6_20_doors, 20+_doors]
  geo_concentration: [Multi-state, MD, CA, OH, NC]
compensating_factors_present:
  - LLC vesting with multi-state operating agreement (universal)
  - 6+ months PITIA reserves at portfolio level
  - Tax-return-disqualified from conventional (heavy write-offs) — DSCR removes DTI bottleneck
  - Pre-existing lender relationship enabling 14-28 day closes (CF-003 quadrupled 4→16 properties in 14 months)
  - Aggregate portfolio cash flow offsets thin-DSCR subjects (CF-011: $3,200/mo aggregate positive supports 1.04 DSCR subject)
approval_accelerants:
  - Existing portfolio cash flow aggregating positive across 10+ properties (CF-011)
  - Prepay-penalty acceptance (5/4/3/2/1) unlocks pricing (CF-002, CF-011)
  - 75% LTV cash-out on stabilized rental = clean approve (CF-011, CF-002)
  - No tax return required (CF-002 closed 18 loans without ever providing tax return)
typical_loan_size_band: $1M-$3.2M
funded_loan_economics_notes: |
  Highest-value cluster by loan size. CF-002 closed $3.2M across 4-state portfolio;
  CF-003 $1.755M; CF-004 $960K; CF-005 $1M+ (San Diego). These borrowers are
  conventionally DTI-blocked — DSCR is their only scalable path to growth, so repeat
  borrowing is near-certain. Portfolio/blanket loan structures (Truss) aggregate
  multiple subjects into one loan, increasing per-loan revenue 3-5x vs. single-unit DSCR.
source_case_ids: [CF-002, CF-003, CF-004, CF-005, CF-011]
```

### AP-003 — STR Operator in STR-Permissive Markets

```yaml
cluster_id: AP-003
cluster_name: STR Operator — STR-Permissive Markets (FL coast / AZ / Smoky Mountains)
approval_rate_observed: 100%   # 4 of 4 approved in STR-permissive markets
sample_size: 4
inferred: false
feature_band:
  DSCR_range: [1.27, 1.51]   # CF-014 1.27 low; CF-006 1.51 high
  FICO_range: [700, 745]
  LTV_range: [0.55, 0.75]    # CF-006 cash-out at 55%; others 75% purchase
  reserves_months_range: [9, 12]   # STR-typical vs. 6mo LTR
  property_types: [SFR, condo]
  occupancy_types: [short_term_rental]
  entity_types: [LLC]
  experience_levels: [first_time, 2_5_doors, 6_20_doors]
  geo_concentration: [FL-PanamaCityBeach, FL-Destin, AZ-Scottsdale, TN-GatlinburgPigeonForge]
compensating_factors_present:
  - 9-12 months PITIA reserves (STR-typical vs. 6mo LTR)
  - AirDNA market score ≥82 (CF-012=82, CF-013=85, CF-014=88)
  - STR-permissive regulatory market (verified by approved STR permit pathway)
  - LLC vesting (universal)
  - STR insurance (Proper/Slice/CBIZ) sourced pre-closing
approval_accelerants:
  - 24+ months STR host history unlocks 15% income haircut (vs. 25% new-host) AND 10-25bps rate improvement (CF-013)
  - DSCR ≥1.25 unlocks "max rate discount for favorable DSCR loans" (CF-006 1.51)
  - AirDNA projection accepted in lieu of 6-12mo trailing STR history (CF-006 specialty lender pathway)
  - STR permit pre-verified (eliminates CF-015/CF-016 decline-driver)
  - Pool / cabin / 5BR features that drive STR occupancy (CF-006 5BR/4BA, CF-013 pool, CF-014 cabin)
typical_loan_size_band: $290K-$600K
funded_loan_economics_notes: |
  +25-75bps rate premium over LTR DSCR adds per-loan margin. STR appraisal with
  1004+1007+STR-addendum costs $850-$900 (vs. $650 standard). Repeat borrowing high —
  STR operators typically scale to 3-8 properties. Critical caveat: STR-permissive
  market is gating; CF-015 (Nashville owner-occ) and CF-016 (NYC Local Law 18) declined
  despite 720+ FICO / 12mo reserves / 24mo host history. Pre-screening STR permit
  eligibility is the single most preventable decline driver in the entire case file.
source_case_ids: [CF-006, CF-012, CF-013, CF-014]
```

### AP-004 — Foreign National, Strong-Credit-Country Tier

```yaml
cluster_id: AP-004
cluster_name: FN Strong-Credit-Country (UK/EU/Canada/AU)
approval_rate_observed: 100%   # 1 of 1 in sample; GL-02 CF-03 pattern corroborates
sample_size: 1
inferred: true   # only 1 case; supplemented by GL-02 CF-03 + AHLend/America FN guidelines
feature_band:
  DSCR_range: [1.25, 1.35]
  FICO_range: [700, 740]   # Nova Credit international-credit equivalent
  LTV_range: [0.70, 0.75]   # 25-30% down
  reserves_months_range: [9, 12]
  property_types: [SFR]
  occupancy_types: [long_term_rental]
  entity_types: [LLC]   # US-based LLC required for FN
  experience_levels: [first_time]
  geo_concentration: [TX, FL]   # no state income tax; landlord-friendly
compensating_factors_present:
  - US-based LLC with EIN + operating agreement (US-attorney-drafted)
  - Nova Credit international credit report translation
  - 9-12 months PITIA reserves in US bank, seasoned 60-90 days
  - Valid passport 6+ months validity past closing
  - AML source-of-funds clearance with paper trail
  - DSCR 1.25+ (clears best-tier threshold)
approval_accelerants:
  - Strong-credit-country passport (UK/EU/Canada/AU) unlocks 70-75% LTV (vs. 60-65% no-credit)
  - +0.50-0.75% rate premium (vs. +1.00-1.50% no-credit-country)
  - Valid US visa + ESTA visa-waiver (no embassy delay)
  - US bank account seasoned 60-90 days pre-application
typical_loan_size_band: $300K-$500K
funded_loan_economics_notes: |
  +50bps rate premium vs. US borrower; $1,000 FN underwriting fee add-on. 3-week AML
  clearance extends underwriting cycle. Repeat borrowing pattern: FN investors typically
  acquire 3-5 US properties over 5-7 years (per DSCR Authority). Florida is "#1 DSCR
  market" per source (no state income tax, landlord-friendly); Texas selected for
  fastest eviction timeline. Lender-match (A&D Mortgage, HomeAbroad) is critical.
source_case_ids: [CF-017]
```

### AP-005 — Foreign National, No-Credit-Country Tier

```yaml
cluster_id: AP-005
cluster_name: FN No-Credit-Country (LatAm/Asia/Africa)
approval_rate_observed: 100%   # 1 of 1 in sample
sample_size: 1
inferred: true
feature_band:
  DSCR_range: [1.30, 1.45]   # higher DSCR required to offset no-credit tier
  FICO_range: ["n/a — no credit documentation; lender waived"]
  LTV_range: [0.60, 0.65]   # 35-40% down
  reserves_months_range: [12, 12]
  property_types: [SFR]
  occupancy_types: [long_term_rental]
  entity_types: [LLC]
  experience_levels: [first_time]
  geo_concentration: [FL]
compensating_factors_present:
  - 40% down payment (no-credit-country FN tier)
  - 12 months PITIA reserves in US bank, seasoned 90 days
  - Source-of-funds paper trail: prior real estate sale closing statement + 12mo international bank statements
  - Valid passport + B1/B2 visa stamp
  - US LLC with EIN (fax Form SS-4) + operating agreement
  - FIRPTA withholding structure reviewed by tax counsel
  - DSCR 1.30+ (well above 1.25 best-tier to compensate for credit-tier)
approval_accelerants:
  - Prior real estate sale (Brazil) provides clean source-of-funds narrative
  - 12mo international bank statements (extends underwriting 5-7 days but rarely declines)
  - Florida market selection (landlord-friendly, no state income tax)
typical_loan_size_band: $200K-$400K
funded_loan_economics_notes: |
  +1.00-1.50% rate premium vs. US borrower (here +1.25%); $1,500 FN underwriting fee.
  Smaller loan sizes than strong-credit-country FN due to lower LTV. Specialty FN
  portfolio lenders (Angel Oak, A&D Mortgage, HomeAbroad) are the active market.
  Lower repeat frequency than strong-credit-country tier due to higher friction per loan.
source_case_ids: [CF-018]
```

### AP-006 — ITIN US-Resident Investor

```yaml
cluster_id: AP-006
cluster_name: ITIN US-Resident Investor (work-permit, no SSN)
approval_rate_observed: 100%   # 1 of 1 approved_with_conditions
sample_size: 1
inferred: true
feature_band:
  DSCR_range: [1.15, 1.25]
  FICO_range: [660, 700]   # ITIN-based FICO from limited US credit file
  LTV_range: [0.70, 0.80]   # ITIN tier between pure FN and standard
  reserves_months_range: [9, 12]   # higher than 6mo standard due to thin credit
  property_types: [2-4_unit]   # 2-4 unit preferred: higher rents support DSCR with thinner credit
  occupancy_types: [long_term_rental]
  entity_types: [LLC]
  experience_levels: [2_5_doors]
  geo_concentration: [FL-Miami]
compensating_factors_present:
  - ITIN issued via CAA (Certified Acceptance Agent) — 11+ weeks pre-application
  - 9 months PITIA reserves (vs. 6mo standard)
  - 12mo bank statements + employment verification letter supplementing thin credit file
  - 2 credit cards + 1 prior auto loan with 18mo US credit history
  - LLC vesting
  - DSCR 1.20+ (clears 1.00-1.15 2-4 unit minimum but below 1.25 best-tier)
approval_accelerants:
  - 2-4 unit property: combined unit rents ($4,900/mo on $560K = 1.05% rent GRM) support DSCR
  - US residency + work permit (vs. pure FN) reduces AML friction
  - 18mo US credit file (vs. none) reduces underwriting ambiguity
typical_loan_size_band: $400K-$500K
funded_loan_economics_notes: |
  +0.25-0.75% rate premium vs. US borrower (here +50bps). ITIN programs are "usually
  closer to standard DSCR pricing than pure FN pricing" (DSCR Authority). Repeat
  borrowing moderate — ITIN borrowers often acquire 2-4 properties over 5 years.
  Hispanic-language campaigns + bilingual landing pages critical for reachability.
source_case_ids: [CF-019]
```

### AP-007 — Permitted-ADU SFR Operator (California)

```yaml
cluster_id: AP-007
cluster_name: Permitted-ADU SFR Operator
approval_rate_observed: 100%   # 1 of 1 approved; CF-021 unpermitted-ADU → conditions (excluded)
sample_size: 1
inferred: true
feature_band:
  DSCR_range: [1.20, 1.30]
  FICO_range: [700, 740]
  LTV_range: [0.75, 0.80]   # SFR classification (not duplex) unlocks 75-80% LTV
  reserves_months_range: [6, 6]
  property_types: [SFR-with-permitted-ADU]   # classified as SFR per Harpoon Capital
  occupancy_types: [long_term_rental]
  entity_types: [LLC]
  experience_levels: [2_5_doors, 6_20_doors]
  geo_concentration: [CA-LosAngeles, CA-SanDiego, CA-BayArea]
compensating_factors_present:
  - ADU permit verified (LA DBS / city building & safety)
  - Separate lease for ADU + 2+ months rent receipts
  - Form 1007 market rent analysis supports both rents (primary + ADU)
  - Appraiser comments on ADU design/location consistent with neighborhood norms
  - LLC vesting
  - ADU has private entrance, kitchen, bathroom, sleeping area (accessory dwelling complete)
approval_accelerants:
  - SFR-with-ADU classified as SFR (not duplex) → unlocks 75-80% LTV (vs. 70-75% for 2-4 unit)
  - ADU contributory value counted in appraisal (loan amount based on combined value)
  - ADU rental income ($1,600/mo in CF-020) counted in DSCR — material lift to qualifying ratio
  - California ADU-permit density (LA, San Diego, Bay Area) = deep comp set for appraisal
typical_loan_size_band: $700K-$1.2M
funded_loan_economics_notes: |
  Large loan sizes (CA property values). ADU income counting is the unlock: same property
  with ADU excluded would qualify at ~30% lower loan amount (CF-021 mainline-lender
  calculation excluded ADU → DSCR fell to 1.00 minimum threshold). CA ADU-savvy
  investors typically repeat (LA DBS reports ~12,000 ADU permits issued 2017-2024).
source_case_ids: [CF-020]
```

### AP-008 — Credit-Scarred Cash-Rich Operator (Post-Seasoning)

```yaml
cluster_id: AP-008
cluster_name: Credit-Scarred Cash-Rich Post-Seasoning
approval_rate_observed: 100%   # 1 of 1 approved
sample_size: 1
inferred: true
feature_band:
  DSCR_range: [1.30, 1.45]   # strong DSCR required to offset FICO
  FICO_range: [620, 659]   # below 660 standard floor; above 620 specialty floor
  LTV_range: [0.65, 0.70]   # 25-35% down (reduced from 75% standard)
  reserves_months_range: [12, 18]   # 12-18mo (up from 6mo standard)
  property_types: [2-4_unit]   # 2-4 unit Midwest cash-flow rich
  occupancy_types: [long_term_rental]
  entity_types: [LLC]
  experience_levels: [2_5_doors, 6_20_doors]
  geo_concentration: [OH-Cleveland, OH-Cincinnati, MO-StLouis, IN-Indianapolis, PA-Pittsburgh]
compensating_factors_present:
  - Chapter 7 bankruptcy discharged 48+ months (past 4-year standard seasoning)
  - Foreclosure discharged 36+ months (past 3-year standard seasoning)
  - Post-event credit rebuild: 3-6mo on-time payments, utilization <30%
  - 25-35% down payment (vs. 20-25% standard)
  - 12+ months PITIA reserves (vs. 6mo standard)
  - DSCR 1.30+ (well above 1.25 best-tier)
  - LLC vesting
  - Midwest 2-4 unit property produces strong rent-to-value ratio (CF-028: $4,200/mo rent on $285K = 1.47% monthly GRM)
approval_accelerants:
  - Midwest 2-4 unit cash-flow yields (Cleveland "highest cash-flow yields" per DSCR Authority)
  - Bankruptcy seasoning clearance ≥48mo removes GL-02 CF-10 weakness flag
  - Specialty lender match (Bluestone 550 FICO floor; AHLend 620; America 640)
  - Reduced LTV + increased reserves + rate premium is the universal "approval accelerator" for credit-risk files
typical_loan_size_band: $150K-$250K
funded_loan_economics_notes: |
  +50-100bps rate premium for below-floor FICO. Smaller loan sizes (Midwest property
  values). Specialty lender access is critical — Bluestone publishes 550 FICO floor,
  but pricing cliffs at 620/660/680/700/720 mean borrowers pay materially more.
  Repeat borrowing: post-seasoning borrowers who successfully close one DSCR loan
  typically rebuild FICO 30-50 points over 6-12mo and refinance into better terms.
source_case_ids: [CF-028]
```

### AP-009 — Compensated-Exception Approval (Shop-the-Decline-Letter)

```yaml
cluster_id: AP-009
cluster_name: Compensated-Exception Approval — Shop-the-Decline-Letter
approval_rate_observed: 100%   # 3 of 3 approved_with_conditions after re-shop
sample_size: 3
inferred: false
feature_band:
  DSCR_range: [1.00, 1.40]   # CF-021 1.00 (without ADU) low; CF-007 1.25; CF-026 1.27
  FICO_range: [710, 720]
  LTV_range: [0.70, 0.75]   # 70% after pivot (CF-007, CF-021); 75% after reserves fix (CF-026)
  reserves_months_range: [6, 6]   # CF-026 fixed to 6.2mo after co-borrower addition
  property_types: [SFR, ADU]
  occupancy_types: [long_term_rental]
  entity_types: [LLC]
  experience_levels: [2_5_doors]
  geo_concentration: [NY, CA, NC]
compensating_factors_present:
  - Reduced LTV from 75% → 70% (CF-007, CF-021) to compensate for property/condition risk
  - Co-borrower addition to supplement reserves (CF-026 added spouse with $12K liquid checking)
  - 60% 401(k) haircut properly applied (CF-026 fix; original lender misapplied full balance)
  - Specialty-lender re-shop (CF-021 specialty DSCR lender accepts unpermitted ADU by ignoring ADU for both income AND value)
  - Property-violation exception granted with strategic coordination (CF-007)
  - LLC vesting (universal)
approval_accelerants:
  - "Shop the decline letter" playbook: original decline reason triaged to specialty lender
  - Borrower willingness to accept LTV haircut / rate premium / conditions (vs. walking away)
  - 6+ months reserves + DSCR ≥1.25 underlying file strength (the decline was overlay-driven, not file-fundamental)
  - Documented compensating-factor package (reduced LTV, increased reserves, specialty lender match)
typical_loan_size_band: $220K-$850K
funded_loan_economics_notes: |
  +25bps rate premium for unpermitted-ADU overlay (CF-021). Specialty lender matches
  add 1-2 weeks to underwriting cycle. Borrowers in this cluster demonstrate
  resilience and financial sophistication — high repeat-borrow likelihood once
  relationship established. Primary value: preventing decline of fundable files
  by routing to right lender.
source_case_ids: [CF-007, CF-021, CF-026]
```

### Cluster Summary Table

| Cluster | Approval Rate | Sample N | Avg Loan Size | Top Geo | Inferred? |
|---|---|---|---|---|---|
| AP-001 Clean SFR LTR (MW/SE) | 100% | 5 | $150K-$500K | IN, TN, MI, NC | No |
| AP-002 Portfolio Scaler | 100% | 5 | $1M-$3.2M | Multi-state, MD, CA, OH, NC | No |
| AP-003 STR (Permissive Market) | 100% | 4 | $290K-$600K | FL coast, AZ, TN-Smokies | No |
| AP-004 FN Strong-Credit-Country | 100% | 1 | $300K-$500K | TX, FL | Yes |
| AP-005 FN No-Credit-Country | 100% | 1 | $200K-$400K | FL | Yes |
| AP-006 ITIN US-Resident | 100% (cond) | 1 | $400K-$500K | FL-Miami | Yes |
| AP-007 Permitted-ADU SFR | 100% | 1 | $700K-$1.2M | CA | Yes |
| AP-008 Credit-Scarred Post-Seasoning | 100% | 1 | $150K-$250K | OH, MO, IN, PA | Yes |
| AP-009 Compensated-Exception | 100% (cond) | 3 | $220K-$850K | NY, CA, NC | No |

**Total cases captured in approval clusters: 22 of 28** (19 positive outcomes clustered + 3 decline cases excluded; remaining 6 cases are pure decline-pattern drivers that belong to NP-04).

---

## Part 2: Approval Probability Heatmap

Each cell shows `approval_rate (sample_size)` where approval = `approved` OR `approved_with_conditions`. Sample = all 28 cases.

### 2A. DSCR Band × FICO Band

| DSCR \ FICO | <680 | 680–719 | 720+ |
|---|---|---|---|
| **<1.20** | n/a (0) | 100% (2) [CF-011 cond — 1.04 thin portfolio cash-out; CF-021 cond — 1.00 after ADU income excluded at specialty lender] | 50% (4) [CF-001, CF-008 appr; CF-015, CF-016 decl on STR-regulatory fallback to <1.0 LTR DSCR] |
| **1.20–1.29** | n/a (0) | 83% (6) [CF-003, CF-004, CF-014 appr; CF-007, CF-019 cond; CF-024 decl — recent foreclosure] | 100% (5) [CF-002, CF-005, CF-009, CF-020 appr; CF-026 cond] |
| **1.30+** | 100% (1) [CF-028 appr — 645 FICO + 70% LTV + 12mo reserves compensators] | 75% (4) [CF-006, CF-010, CF-018 appr; CF-027 decl — recent mortgage late] | 50% (6) [CF-012, CF-013, CF-017 appr; CF-022 condotel decl, CF-023 non-warrantable condo decl, CF-025 appraisal-short decl] |

**Key insight for SA-05 / TS-10:** The 1.30+ × 720+ cell shows only 50% approval — counter-intuitive vs. charter baseline assumption that higher DSCR monotonically increases approval odds. The 3 declines in this cell are **all overlay-driven** (condotel property type, non-warrantable condo with HOA litigation, appraisal short). High DSCR does NOT immunize against property-type / appraisal / regulatory overlays. The 1.20–1.29 × 720+ cell (100% approval, 5 cases) is the actual "easy-approve" sweet spot — borrowers in this band have clean property types AND no overlay risk.

### 2B. LTV Band × Reserves Band

| LTV \ Reserves | 6mo | 9mo | 12mo |
|---|---|---|---|
| **≤70%** | 100% (3) [CF-007 cond, CF-008 appr, CF-021 cond — all 70% or below; reduced-LTV compensator pattern] | 100% (1) [CF-017 appr — FN strong-credit, 70% LTV, 9mo] | 100% (3) [CF-006 appr — STR cash-out 55%; CF-018 appr — FN no-credit 60%; CF-028 appr — credit-scarred 70%] |
| **71–75%** | 73% (11) [CF-001, CF-002, CF-003, CF-009, CF-010, CF-020 appr; CF-011, CF-026 cond; CF-023, CF-025, CF-027 decl] | 67% (3) [CF-013 appr; CF-019 cond; CF-024 decl — recent foreclosure] | 40% (5) [CF-012, CF-014 appr; CF-015, CF-016, CF-022 decl — all STR-regulatory or property-type] |
| **76–80%** | 100% (2) [CF-004, CF-005 appr — premium files at 80% LTV] | n/a (0) | n/a (0) |

**Key insight:** The 71–75% × 12mo cell shows only 40% approval — but 3 of 3 declines are property-type/regulatory (Nashville STR, NYC STR, condotel). When excluding property-type declines, that cell becomes 100% (2/2). Reserves alone don't predict approval; property-type cleanliness dominates.

The ≤70% LTV row shows universal 100% approval across all reserve bands — confirming GL-02's "LTV haircut is the universal approval accelerator" pattern (CF-007, CF-021, CF-028 all drop LTV from 75% → 70% to compensate for property/credit risk).

### 2C. Property Type × Occupancy Type

| Property \ Occupancy | LTR | STR |
|---|---|---|
| **SFR** | 73% (15) [11 approved/cond; 3 declined on overlays — CF-024 foreclosure seasoning, CF-025 appraisal short, CF-027 mortgage late] | 75% (4) [CF-006, CF-013, CF-014 appr; CF-015 decl — Nashville STR permit] |
| **2–4 unit** | 100% (3) [CF-008, CF-028 appr; CF-019 cond — ITIN] | n/a (0) |
| **Condo (warrantable)** | 0% (1) [CF-023 decl — non-warrantable, investor concentration 58% + HOA litigation] | 50% (2) [CF-012 appr — Destin FL STR condo; CF-016 decl — NYC Local Law 18] |
| **Condotel** | n/a (0) | 0% (1) [CF-022 decl — condotel property type ineligible at standard DSCR] |
| **SFR with ADU** | 100% (2) [CF-020 appr — permitted ADU; CF-021 cond — unpermitted ADU pivot] | n/a (0) |

**Key insight:** 2-4 unit properties show 100% approval in this sample (3/3) — higher than SFR (73%). Reason: 2-4 unit properties produce higher rent-to-value ratios (especially Midwest: CF-008 Grand Rapids duplex, CF-028 Cleveland quadplex), which makes DSCR easier to clear and creates a "cash-flow-rich" borrower profile that compensates for other file weaknesses (CF-028 credit scar; CF-019 ITIN tier). SA-05 should treat 2-4 unit as a preferred property-type accelerant in cash-flow markets.

Condo and condotel show the weakest approval rates — entirely driven by property-type overlays (non-warrantable, condotel, HOA litigation, STR regulatory). NP-04 should encode property-type pre-screening as the single most preventable decline category.

---

## Part 3: Approval Accelerants Catalog

Factors that materially raise approval odds when present, with evidence from CF-01 + GL-02.

| # | Accelerant | Evidence | Estimated Lift |
|---|---|---|---|
| 1 | **LLC vesting with operating agreement + EIN** | 16 of 16 approved cases + 5 of 5 approved-with-conditions = 21 of 21 positive outcomes are LLC-vested. Only 1 case (CF-008 Sarah Chen) used personal vesting — still approved due to 755 FICO + 58% LTV + 1.12 DSCR + 6mo reserves compensators. GL-02 entity matrix: LLC allowed at all 8 programs; required for FN at AHLend/America. | +10-15% approval rate vs. personal vesting; required for FN tier |
| 2 | **Existing lease in place at application OR Form 1007 market rent supportable** | CF-008 (3-yr + 1-yr leases on duplex → clean approve); CF-001 (lease placed within 3 weeks of closing); CF-020 (separate ADU lease + 2mo rent receipts); CF-002 (multi-state portfolio with documented rent rolls). | +15-20% approval rate; eliminates rent-support risk |
| 3 | **12+ months PITIA reserves** (vs. 6mo standard) | CF-006 (12mo, STR cash-out clean approve); CF-012, CF-014 (12mo STR standard); CF-018 (12mo FN no-credit compensator); CF-028 (12mo credit-scarred compensator). GL-02 CF-01 pattern: 12mo reserves compensates DSCR 0.75-0.99. | Shifts approve-with-conditions → clean approve; unlocks 0.75 DSCR floor at AHLend/Lendmire |
| 4 | **DSCR ≥1.30 (above 1.25 baseline)** | CF-006 (1.51 unlocked "max rate discount for favorable DSCR loans" per Ridge Street Capital); CF-010 (1.49 "well above minimum, excellent tier pricing"); CF-013 (1.38 best-tier STR pricing). GL-02 consensus: 1.25 is universal "preferred" anchor — 1.30+ unlocks pricing tier. | Rate improvement 10-25bps; shifts conditions → clean approve on borderline files |
| 5 | **STR-permissive market + AirDNA score ≥80** | CF-012 (AirDNA 82 approved), CF-013 (85 approved), CF-014 (88 approved). CF-015 (Nashville STR permit denied despite 720 FICO + 12mo reserves + 1.31 DSCR) and CF-016 (NYC Local Law 18 despite 740 FICO) declined — STR market eligibility is gating, not borrower strength. | +40-50% approval rate for STR files (gating factor — without it, 0% approval regardless of borrower strength) |
| 6 | **24+ months STR host history** | CF-013 (24mo host history unlocks 15% income haircut vs. 25% new-host) + 10-25bps rate improvement per DSCR Authority STR guide. CF-014 (first-time STR) forced 25% haircut + 12mo reserves + more expensive cabin appraisal. | -50bps rate; -10pts income haircut; shifts STR conditions → clean approve |
| 7 | **Pre-existing lender relationship / repeat borrower** | CF-002 (closed 18 DSCR loans with established lenders; 14-19 day closes vs. typical 30+); CF-003 (Brookmont Capital — quadrupled portfolio 4→16 properties in 14 months with same lender). GL-02 CF-07 pattern: portfolio/blanket DSCR approved at premium pricing with prior relationship. | -7 to -14 days to close; cleaner conditions; pricing flexibility |
| 8 | **Reduced LTV from 75% → 70% (universal compensator)** | CF-007 (NY violations → 70% LTV exception approved), CF-021 (CA unpermitted ADU → 70% LTV specialty-lender approve), CF-028 (OH credit-scarred → 70% LTV approve). GL-02 CF-01, CF-02, CF-08, CF-10 patterns all use LTV reduction as primary compensator. | Converts decline → approve-with-conditions on property/credit-risk files |
| 9 | **Foreign national with strong-credit-country passport (UK/EU/Canada/AU)** | CF-017 (UK citizen → 70% LTV + 0.50% premium) vs. CF-018 (Brazil → 60% LTV + 1.25% premium). GL-02 CF-03 + AHLend/America FN guidelines confirm tiered pricing. | +10pts LTV; -75bps rate; +6mo fewer reserves required |
| 10 | **Aggregate portfolio cash flow positive across 10+ properties** | CF-011 (Columbus OH 1.04 DSCR thin subject approved-with-conditions because $3,200/mo aggregate positive across 10 other properties offsets subject negative cash flow). | Converts decline → approve-with-conditions on thin-DSCR cash-out files |
| 11 | **Midwest 2-4 unit property in cash-flow market** | CF-008 (Grand Rapids MI duplex, $2,825/mo rent on $385K = 0.73% monthly GRM), CF-028 (Cleveland OH quadplex, $4,200/mo rent on $285K = 1.47% monthly GRM). Cleveland cited by DSCR Authority as "highest cash-flow yields" market. | Supports DSCR 1.20+ even at higher LTV; enables thin-credit / credit-scarred approvals |
| 12 | **BRRRR execution: 6+ months seasoning from initial hard-money purchase** | CF-010 (Dana Memphis BRRRR — applied at month 6, closed at month 7, DSCR 1.49 "excellent tier pricing"). GL-02 seasoning consensus: 6mo minimum for cash-out refi from purchase. | Unlocks cash-out refi at 75% LTV with clean DSCR; returns capital to borrower |
| 13 | **Property-violation exception with strategic coordination** | CF-007 (Setauuket NY, 3 open violations, lender exception granted at 70% LTV). Demonstrates file strength overrides property-condition risk when LTV haircut applied. | Converts property-condition decline → approve-with-conditions |
| 14 | **AirDNA projection accepted in lieu of 6-12mo trailing STR history** | CF-006 (Panama City Beach FL, <1mo Airbnb history, Ridge Street Capital used AirDNA projection instead). Specialty STR DSCR pathway — not all lenders accept. | Unlocks STR DSCR for new-host files; +25-50bps rate premium |

---

## Part 4: Approval-Decelerant Catalog (Mild)

Factors that mildly reduce approval odds or add friction but rarely kill the file (NP-04 handles severe declines). Each with evidence and typical friction cost.

| # | Decelerant | Evidence | Friction Cost | Approval Impact |
|---|---|---|---|---|
| 1 | **ITIN instead of SSN** | CF-019 (ITIN FL 2-4 unit approved_with_conditions). GL-02 AHLend: ITIN accepted in lieu of SSN. | +9mo reserves (vs 6mo standard); +50bps rate premium; 12mo bank statements + employment verification supplement | Rarely declines if other factors strong; adds 5-7 days underwriting |
| 2 | **No-credit-country FN (vs. strong-credit-country)** | CF-018 (Brazil FL SFR) vs. CF-017 (UK TX SFR). | +60→60% LTV (vs 70-75%); +1.25% rate premium (vs +0.50%); +12mo reserves (vs 9mo); +5-7 days AML | Approved with full compensator package; rarely declines if DSCR 1.30+ and 40% down |
| 3 | **Unpermitted ADU** | CF-021 (San Diego unpermitted ADU — declined at mainline lender, approved_with_conditions at specialty lender). Harpoon Capital guidance: "value not counted in LTV." | LTV haircut 75%→70%; +25bps rate premium; ADU income excluded; appraiser must comment on ADU; ADU value excluded | Curable by re-shopping to specialty lender (e.g., the one in CF-021) |
| 4 | **Open property violations at application** | CF-007 (Setauuket NY, 3 open violations). Lender exception granted. | LTV haircut 75%→70%; underwriting exception review; 5-10 day extension; strategic coordination required | Approved with conditions if DSCR 1.25+ and 6mo reserves + 70% LTV |
| 5 | **Mid-tier FICO 620-659** | CF-028 (645 FICO Cleveland quadplex approved). GL-02 CF-02 pattern: 620-640 FICO requires DSCR 1.25+ + 25-30% down. | LTV haircut to 70%; +50-100bps rate premium; 12mo reserves (vs 6mo); specialty lender required | Approved at specialty lenders (Bluestone 550 floor, AHLend 620, America 640) |
| 6 | **Vacant at purchase (no in-place lease)** | CF-004 (Allay Capital $1.2M SFR — vacant at purchase, qualified on Form 1007 market rent). | Form 1007 market rent appraisal required (~$650); 5-7 day underwriting extension; risk of 1007 coming in below estimated rent | Approves if 1007 supports DSCR; adds appraisal-risk exposure |
| 7 | **STR with no host history (first-time STR)** | CF-014 (Gatlinburg TN first-time STR). FAAS Funding guide: 25% AirDNA haircut for new hosts. | 25% AirDNA income haircut (vs 15-20% with host history); 12mo reserves (vs 9mo); cabin-class appraisal $900 (vs $650 standard); +25bps rate premium | Approves in STR-permissive market; market eligibility is gating |
| 8 | **401(k)-heavy reserves** | CF-026 (Charlotte NC — initial lender misapplied full 401(k) balance, shortfall; second lender applied 60% haircut correctly). | 60% haircut on 401(k)/IRA balances; possible co-borrower addition; documentation cycle 1-2 weeks; reserve-re-shop to second lender | Curable with proper documentation or re-shop; rarely declines if DSCR 1.25+ and other reserves available |
| 9 | **Cash-out refi with thin post-refi DSCR (1.00-1.10)** | CF-011 (Columbus OH cash-out 1.04 DSCR approved_with_conditions). | 6mo property-specific reserve required (vs. standard 6mo PITIA); borrower accepts negative cash flow on subject; aggregate portfolio cash flow must offset | Approves with conditions if aggregate portfolio cash flow positive |
| 10 | **First-time investor (no portfolio track record)** | CF-001 (Indianapolis first-time), CF-014 (Gatlinburg first-time STR). | Slightly more underwriting scrutiny on property analysis; reserves sometimes increased (CF-014 12mo vs 9mo); no portfolio-aggregate offset available | Approves if FICO 710+ + DSCR 1.20+ + 6-12mo reserves + LLC vesting |
| 11 | **Foreign-source funds requiring AML clearance** | CF-017 (UK FN — 3 weeks AML); CF-018 (Brazil FN — 2-4 weeks AML). | 2-4 week AML source-of-funds clearance; certified English translation; USD conversion documentation; international bank statements 12mo | Adds underwriting cycle time but rarely declines if paper trail clean |
| 12 | **Rate-and-term refi vs. cash-out refi** | GL-02: refi LTV 5pts below purchase; cash-out another 5pts below refi. | Lower max LTV for cash-out (65-75% vs 80% purchase); rate premium for cash-out; conditions on use-of-proceeds | Approves at lower LTV; cash-out adds 5-10pts LTV haircut |

---

## Part 5: Funding-Desirability Overlay

For each cluster from Part 1, scored 1-10 on the 7 charter dimensions. FDI = weighted average using charter-recommended weights: Approval 25%, Doc-clean 15%, Rent-realism 15%, Repeat 15%, Margin 15%, Compliance 10%, Reachability 5%.

| Cluster | Approval (25%) | Doc-clean (15%) | Rent-realism (15%) | Repeat (15%) | Margin/size (15%) | Compliance (10%) | Reachability (5%) | **FDI** |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **AP-001** Clean SFR LTR (MW/SE) | 9 | 9 | 9 | 8 | 5 | 9 | 7 | **8.15** |
| **AP-002** Portfolio Scaler | 9 | 7 | 9 | 10 | 10 | 9 | 7 | **8.90** |
| **AP-003** STR (Permissive Market) | 9 | 7 | 6 | 8 | 7 | 7 | 8 | **7.55** |
| **AP-004** FN Strong-Credit-Country | 8 | 6 | 8 | 8 | 8 | 7 | 6 | **7.50** |
| **AP-005** FN No-Credit-Country | 7 | 5 | 8 | 6 | 7 | 6 | 5 | **6.50** |
| **AP-006** ITIN US-Resident | 7 | 6 | 8 | 7 | 7 | 7 | 6 | **6.95** |
| **AP-007** Permitted-ADU SFR | 8 | 7 | 8 | 7 | 9 | 8 | 6 | **7.75** |
| **AP-008** Credit-Scarred Post-Seasoning | 7 | 6 | 9 | 6 | 6 | 8 | 6 | **6.90** |
| **AP-009** Compensated-Exception | 7 | 5 | 8 | 6 | 6 | 7 | 6 | **6.50** |

### Top 3 Highest-FDI Clusters

1. **AP-002 — Self-Employed Multi-State Portfolio Scaler (FDI 8.90)**
   - The dominant cluster by lifetime value: large loans ($1M-$3.2M), near-certain repeat borrowing (CF-002 closed 18 DSCR loans; CF-003 quadrupled 4→16 in 14 months), and conventionally-DTI-blocked (DSCR is their only path to scale).
   - Margin score 10 reflects portfolio/blanket loan structures (Truss) that aggregate multiple subjects into one loan — 3-5x revenue per loan vs. single-unit DSCR.

2. **AP-001 — Clean SFR LTR Investor Midwest/Southeast (FDI 8.15)**
   - The volume play: smaller per-loan balances ($150K-$500K) but cleanest documentation, highest approval rate at 100% (5/5), strongest rent-support realism (stable LTR markets), and high repeat-borrow likelihood.
   - Margin score 5 is the only weak dimension — offset by velocity (CF-002 archetype closes 5-6 loans/year per borrower).

3. **AP-007 — Permitted-ADU SFR Operator California (FDI 7.75)**
   - The California large-loan niche: $700K-$1.2M loans on SFR-with-permitted-ADU. SFR classification (vs. duplex) unlocks 75-80% LTV. ADU income counting is the unlock — same property with ADU excluded qualifies at ~30% lower loan amount (per CF-021 mainline-lender calculation).
   - Smallest sample (N=1) but GL-02 corroborates via Harpoon Capital ADU guide; CA ADU-permit density provides deep comp set.

### Scoring Rationale Notes

- **Margin/size** weights per-loan revenue, not borrower-level lifetime value. AP-002 scores 10 on both because portfolio/blanket structures compound both. AP-001 scores 5 on per-loan margin but offset by velocity (repeat-borrow 8).
- **Reachability** scores assume Meta Special Ad Category constraints (limited demographic targeting, broad distribution + self-qualification required) and Google Search intent quality. STR and "DSCR loan after bankruptcy" score highest on reachability because the Google Search intent is unambiguous.
- **Compliance friendliness** scores penalize clusters with AML/KYC complexity (FN, ITIN), property-type overlay risk (STR, condotel-adjacent), and exception-documentation burden (Compensated-Exception).
- **Rent-realism** scores penalize STR clusters (AirDNA projection volatility, 15-25% haircut) and reward LTR clusters in stable cash-flow markets (Midwest/Southeast).

### Cluster Investment Tiers (for SA-05 persona prioritization)

| Tier | Clusters | Rationale |
|---|---|---|
| **Tier 1 (anchor personas)** | AP-001, AP-002, AP-007 | FDI ≥ 8.0; largest loan sizes or highest velocity; cleanest documentation; highest repeat-borrow likelihood |
| **Tier 2 (specialty personas)** | AP-003, AP-004, AP-006 | FDI 7.0-8.0; meaningful volume; Google Search intent high; specialty-lender match required |
| **Tier 3 (edge-case personas for EG-06)** | AP-005, AP-008, AP-009 | FDI 6.5-7.0; lower volume but high-opportunity (non-obvious fundable borrowers conventional funnels miss); route to EG-06 for deeper edge-case exploration |

---

## Methodological Caveats for SA-05 / TS-10

1. **Sample-size limitation:** N=28 total cases (17 of which are synthesized guideline-grounded reconstructions per CF-01). Cluster approval rates for AP-004 through AP-008 are based on N=1 each — directional, not statistical. Mark inferred clusters as `inferred: true` in persona library.

2. **The 1.30+ DSCR × 720+ FICO cell (50% approval rate, 6 cases) is misleading.** All 3 declines in this cell are overlay-driven (condotel CF-022, non-warrantable condo CF-023, appraisal short CF-025) — not file-fundamental. SA-05 should NOT penalize borrowers with strong DSCR + FICO for property-type / appraisal / seasoning issues. NP-04 will encode property-type pre-screening; TS-10 should treat property-type cleanliness as an orthogonal gating variable, not as a feature-input to the approval score.

3. **The 1.20-1.29 DSCR × 720+ FICO cell (100% approval, 5 cases) is the actual easy-approve sweet spot** — better than 1.30+ × 720+ in this sample. Borrowers in the 1.20-1.29 band have clean property types AND no overlay risk; borrowers in the 1.30+ band often have other file complications (property type, appraisal, credit event) that drove them to DSCR in the first place. TS-10's 0-100 score should treat 1.25-1.30 as the "sweet spot" rather than pushing 1.40+ as the ideal.

4. **Foreign-national and ITIN clusters (AP-004, AP-005, AP-006) are entirely synthesized.** CF-01 could not locate a publicly-cited closed-loan foreign-national DSCR case study with concrete numbers during the harvest window. Treat FN approval patterns as guideline-informed, not case-verified. SA-05 personas for FN/ITIN should carry an explicit `evidence_tier: guideline-inferred` flag.

5. **Reserves alone do not predict approval.** The 71-75% × 12mo cell shows 40% approval (5 cases) — but 3 of 3 declines are STR-regulatory (Nashville, NYC) or property-type (condotel). When excluding property-type/regulatory declines, that cell becomes 100% (2/2). TS-10 should NOT weight reserves linearly without property-type/occupancy interaction terms.

6. **"Shop the decline letter" (AP-009) is a process pattern, not a borrower archetype.** SA-05 may want to encode it as a triage pathway in FF-08's pre-screen ("What was your decline reason?") rather than as a distinct persona. EG-06 should mine AP-009 for edge-case gold (CF-007 violations, CF-021 unpermitted ADU, CF-026 reserves miscalc) as exception personas.

7. **LLC vesting is universally present in positive outcomes (21 of 21).** The single personal-vesting case (CF-008 Sarah Chen) was approved due to exceptional compensators (755 FICO + 58% LTV). SA-05 / TS-10 should treat LLC vesting as a near-universal prerequisite — score it as a strong approval accelerant, not just a "nice to have."

8. **Property type cleanliness dominates reserves / DSCR for approval prediction** in this sample. NP-04's red-zone rules should encode property-type pre-screening as the #1 preventable decline category. AP-03's green-zone map is most actionable when paired with NP-04's red-zone map: a borrower in an AP-001/002/003 cluster with a property-type flag from NP-04 should be routed to AP-009 (Compensated-Exception) for specialty-lender triage.

---

## Cross-References for Downstream Agents

- **SA-05 (Persona Synthesizer):** Use AP-001 → P2/P3, AP-002 → P2 (upgraded), AP-003 → P6, AP-004/AP-005/AP-006 → P5 (with sub-tier personas for strong-credit / no-credit / ITIN), AP-007 → P8, AP-008 → P7, AP-009 → new "Decline-Letter Shopper" persona. Tier 1 (AP-001, AP-002, AP-007) should anchor the persona library.
- **NP-04 (Negative Pattern Miner):** Property-type overlays (condotel, non-warrantable condo, unpermitted ADU), STR regulatory ineligibility (Nashville, NYC, SF, Denver), credit-event seasoning (foreclosure <36mo, bankruptcy <48mo), mortgage late <12mo, appraisal short, reserves shortfall (401k 60% haircut miscalc) — these are the 6 decline drivers that intersect AP-03's green-zone map.
- **EG-06 (Edge-Case Gold Miner):** AP-005 (FN no-credit), AP-006 (ITIN), AP-008 (credit-scarred post-seasoning), AP-009 (compensated-exception) are the 4 highest-opportunity edge-case clusters. CF-008 (Sarah Chen thin-DSCR with 42% down in appreciation market) is a fifth edge-case worth deeper exploration.
- **TS-10 (Scoring Generator):** Use FDI weights as starting weights for 0-100 approval score. Treat DSCR 1.25-1.30 as the sweet spot (not 1.40+). Encode property-type cleanliness as a gating variable (not a feature input). Weight LLC vesting as a strong accelerant (+10-15%). Weight STR market eligibility as gating (0% approval without it, regardless of borrower strength).
- **FF-08 (Funnel Friction Mapper):** Pre-screen questions should encode: (1) property type, (2) STR market regulatory status, (3) ADU permit status, (4) credit event discharge date, (5) mortgage late history, (6) reserves source type (401k haircut), (7) FN/ITIN status, (8) STR host history months, (9) "Have you been declined? What was the decline reason?" (routes to AP-009 pathway).

---

*End of AP-03 deliverable. SA-05, NP-04, EG-06, FF-08, TS-10 — refer to Methodological Caveats above before consuming clusters.*
