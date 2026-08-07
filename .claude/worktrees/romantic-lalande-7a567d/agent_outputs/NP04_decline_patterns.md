# NP-04 — DSCR Decline Cluster Catalog & Red-Zone Rule Map

**Agent:** NP-04 Negative Pattern Miner
**Phase:** 2 of 5 (parallel with AP-03)
**Inputs:** CF-01 (28 case files, 12 negative-or-marginal) + GL-02 (8 lender normalized guidelines + 12 compensating-factor patterns)
**Output consumers:** FF-08 (pre-screen disqualifiers), AC-09 (ad copy that quietly repels), TS-10 (lead-score downward pressure)
**Methodology:** Pattern-mined CF-01's 7 declined + 5 approved_with_conditions cases (=12 negative-or-marginal files) cross-referenced against GL-02 Part 1 exclusionary overlays per lender + Part 4 compensating-factor logic. Hard declines vs. recoverable declines distinguished because FF-08 must auto-screen the first and route the second to a counteroffer/specialty-lender path.

---

## Methodology Note & Sample-Size Caveats

- Sample size = 28 cases (7 declined + 5 approved_with_conditions = 12 negative-or-marginal, 43% of total). This is small-sample territory — frequency rates below should be read as directionally informative, not statistically robust.
- 17 of 28 cases are CF-01-synthesized (grounded in published lender ranges but not closed-loan-verified). Hard-decline patterns (CF-015, CF-016, CF-022, CF-023, CF-024, CF-025, CF-027) are all synthesized; real-world decline rates may differ.
- Patterns marked `inferred: true` are derived from guideline overlays (GL-02) rather than directly observed in CF-01 cases — these are typically the most operationally important because they reflect lender policy, not case-sample noise.
- The "shop the decline letter" pattern (CF-021, CF-023, CF-026 all pivoted from decline → approval) is the single most important meta-pattern: **~40% of declines in the CF-01 sample are lender-fit issues, not file issues.** FF-08 + AC-09 must NOT auto-screen these out — they should route to specialty-lender intake.

---

## Part 1: Decline Cluster Catalog

### Cluster NP-001 — STR Regulatory Ineligibility (Hard Decline)

```yaml
cluster_id: NP-001
cluster_name: STR-regulatory-banned-market investor
decline_rate_observed: 100%   # 2 of 2 cases declined (CF-015, CF-016)
sample_size: 2
feature_band:
  DSCR_range: [0.62, 0.71]    # AFTER LTR fallback; STR DSCR 1.18-1.31 is irrelevant
  FICO_range: [720, 740]
  LTV_range: [0.75, 0.75]
  reserves_months_range: [12, 12]
  property_types: [SFR, condo]
  occupancy_types: [short_term_rental]
  experience_levels: [2_5_doors]
primary_decline_reasons:
  - STR income legally unusable (Local Law 18 in NYC; owner-occupancy permit rule in Nashville)
  - LTR market-rent fallback produces DSCR well below 1.00 (0.62 in NYC, 0.71 in Nashville)
  - Lender will not underwrite projected STR income where compliant non-owner STR permit is unobtainable
secondary_decline_reasons:
  - High-cost coastal market priced for STR income cannot cash-flow on LTR alone
recoverability: hard_decline   # in this market; recoverable by pivoting to STR-permissive market
remediation_path: Pivot to STR-permissive market (Gatlinburg TN, Panama City Beach FL, Scottsdale AZ, Destin FL) OR re-underwrite as long-term rental DSCR with realistic rent (typically fails DSCR test in high-cost coastal markets)
source_case_ids: [CF-015, CF-016]
inferred: false
```

### Cluster NP-002 — Property-Type Ineligible at Standard DSCR (Hard Decline)

```yaml
cluster_id: NP-002
cluster_name: Condotel / non-warrantable condo investor
decline_rate_observed: 100%   # 2 of 2 cases declined at standard residential DSCR (CF-022, CF-023)
sample_size: 2
feature_band:
  DSCR_range: [1.36, 1.40]    # strong — DSCR is IRRELEVANT here
  FICO_range: [720, 720]
  LTV_range: [0.75, 0.75]
  reserves_months_range: [6, 12]
  property_types: [condotel, non_warrantable_condo]
  occupancy_types: [long_term_rental, short_term_rental]
  experience_levels: [first_time, 2_5_doors]
primary_decline_reasons:
  - Condotel (hotel-condo conversion) excluded at standard residential DSCR programs (AHLend, Newfi explicitly)
  - Non-warrantable condo: investor concentration >50%, pending HOA litigation, hotel conversion, or non-compliant HOA
secondary_decline_reasons:
  - Newfi residential-1-4-unit-only overlay excludes entire property class
  - Lender requires warrantable condo status; commercial-facing DSCR pricing applies (different LTV + rate)
recoverability: hard_decline   # at standard residential DSCR; counteroffer_likely via specialty
remediation_path: Re-shop to specialty lender — ~half-dozen DSCR lenders write non-warrantable; Visio Lending + Kiavi have STR-condotel programs; commercial-facing DSCR available with 30-35% down + 1.25+ DSCR + 12mo operating history
source_case_ids: [CF-022, CF-023]
inferred: false
```

### Cluster NP-003 — Credit-Event Seasoning Insufficient (Hard Decline, Recoverable)

```yaml
cluster_id: NP-003
cluster_name: Recent-foreclosure / recent-bankruptcy borrower (sub-seasoning)
decline_rate_observed: 100%   # 1 of 1 case declined (CF-024); CF-028 cleared seasoning and was approved
sample_size: 1
feature_band:
  DSCR_range: [1.20, 1.20]    # above 1.00 floor; 1.25 best-tier unmet
  FICO_range: [680, 680]      # rebuilt post-event
  LTV_range: [0.75, 0.75]
  reserves_months_range: [9, 9]
  property_types: [SFR]
  occupancy_types: [long_term_rental]
  experience_levels: [first_time]
primary_decline_reasons:
  - Foreclosure discharged 30 months ago — below 36-month standard program minimum
  - Specialty 24-month programs require 700+ FICO; borrower at 680 falls short
secondary_decline_reasons:
  - Multiple overlays compound: timing + FICO + first-time-investor = no specialty path available yet
recoverability: recoverable_with_remediation
remediation_path: (a) Rebuild FICO to 700+ over next 3-6 months to unlock specialty 24-mo seasoning program; OR (b) wait 6 more months to clear 36-mo standard window. CF-028 confirms approval is fundable once 60-mo seasoning cleared + FICO rebuilt (even with mid-600s FICO + compensators)
source_case_ids: [CF-024]
inferred: false
```

### Cluster NP-004 — Recent Mortgage Late / Housing History Overlay (Hard Decline, Recoverable)

```yaml
cluster_id: NP-004
cluster_name: Recent-mortgage-late borrower (within 12 months)
decline_rate_observed: 100%   # 1 of 1 case declined (CF-027)
sample_size: 1
feature_band:
  DSCR_range: [1.30, 1.30]    # strong — DSCR IRRELEVANT to decline
  FICO_range: [705, 705]
  LTV_range: [0.75, 0.75]
  reserves_months_range: [6, 6]
  property_types: [SFR]
  occupancy_types: [long_term_rental]
  experience_levels: [2_5_doors]
primary_decline_reasons:
  - 30-day mortgage late 4 months ago on primary residence (job transition)
  - Lender overlay: housing-history review mandatory; recent lates trigger automatic decline regardless of DSCR/FICO
secondary_decline_reasons:
  - Borrower mistakenly believed DSCR = no personal-credit review (common misconception)
recoverability: recoverable_with_remediation
remediation_path: Wait until 12+ months since most recent 30-day late payment; or find specialty lender with looser housing-history overlay (rare). No compensating-factor override exists at mainstream DSCR programs for <12mo mortgage late
source_case_ids: [CF-027]
inferred: false
```

### Cluster NP-005 — Reserves Shortfall / 401(k) Haircut Miscalculation (Decline-then-Pivot)

```yaml
cluster_id: NP-005
cluster_name: Miscounted-reserves borrower (401k-full vs. 60%-haircut)
decline_rate_observed: 100%   # initial decline at first lender; 100% approval at second lender with corrected calc + co-borrower
sample_size: 1
feature_band:
  DSCR_range: [1.27, 1.27]
  FICO_range: [720, 720]
  LTV_range: [0.75, 0.75]
  reserves_months_range: [4, 6]    # 4mo as borrower-calculated; 6mo required; post-fix 6.2mo
  property_types: [SFR]
  occupancy_types: [long_term_rental]
  experience_levels: [2_5_doors]
primary_decline_reasons:
  - Borrower applied full 401(k) balance ($35K) rather than 60% haircut ($21K)
  - Initial lender declined: 4 months PITIA vs. 6 months required
secondary_decline_reasons:
  - Borrower education gap on retirement-account haircut methodology
  - Single-borrower reserves insufficient; spouse had $12K liquid checking
recoverability: recoverable_with_remediation   # 100% pivot success in CF-026
remediation_path: Re-shop to second lender applying standard 60% 401(k) haircut properly + add co-borrower (spouse) with $12K liquid checking → combined reserves $33K → 6.2 months PITIA clears 6-mo minimum. Documented pivot, no waiting period required
source_case_ids: [CF-026]
inferred: false
```

### Cluster NP-006 — Appraisal Short / LTV Exceeded Post-Appraisal (Decline, Recoverable)

```yaml
cluster_id: NP-006
cluster_name: Thin-equity refi borrower in appraisal-short scenario
decline_rate_observed: 100%   # 1 of 1 case declined (CF-025)
sample_size: 1
feature_band:
  DSCR_range: [1.18, 1.31]    # 1.31 intended / 1.18 actual at forced-down loan amount
  FICO_range: [730, 730]
  LTV_range: [0.75, 0.81]     # 75% intended / 81% actual after short appraisal
  reserves_months_range: [6, 6]
  property_types: [SFR]
  occupancy_types: [long_term_rental]
  experience_levels: [6_20_doors]
primary_decline_reasons:
  - Appraisal came in $30K below estimated value ($380K vs. $410K)
  - At intended loan amount $307,500 / appraised $380,000 = 81% LTV — exceeds 75% program max
  - Borrower could not bring additional $30K cash to close
secondary_decline_reasons:
  - Softening-market appraisal risk concentrated in rate-term refis at 75% LTV ceiling
recoverability: recoverable_with_remediation   # if borrower has cash to bridge
remediation_path: One or more of: (a) Reconsideration of Value (ROV) with better comps; (b) negotiate lower purchase/refi price with seller/lender; (c) bring additional cash to maintain LTV; (d) second appraisal if lender permits; (e) re-shop to Lendmire/Newfi 80-85% LTV purchase program (does not apply to refi ceiling)
source_case_ids: [CF-025]
inferred: false
```

### Cluster NP-007 — Unpermitted ADU Income Rejected (Decline-then-Pivot)

```yaml
cluster_id: NP-007
cluster_name: Unpermitted-ADU property buyer (mainline DSCR decline)
decline_rate_observed: 100%   # initial decline at mainline lender; pivot approved at specialty
sample_size: 1
feature_band:
  DSCR_range: [1.00, 1.40]    # 1.40 with ADU income / 1.00 without ADU income (mainline calc)
  FICO_range: [710, 710]
  LTV_range: [0.70, 0.75]     # 75% intended / 70% post-pivot
  reserves_months_range: [6, 6]
  property_types: [SFR_with_unpermitted_ADU]
  occupancy_types: [long_term_rental]
  experience_levels: [2_5_doors]
primary_decline_reasons:
  - ADU built by prior owner without permits — unpermitted
  - Mainline DSCR lender excludes ADU income from DSCR calc per property-type overlay
  - DSCR fell from 1.40 (with ADU) to 1.00 (without) — at minimum floor, not best-tier pricing
secondary_decline_reasons:
  - ADU value excluded from appraisal on pivot lender's terms
  - Permit cure path is 8-14 month process in San Diego — borrower declined to cure
recoverability: recoverable_with_remediation   # via specialty-lender pivot
remediation_path: Re-shop to specialty DSCR lender that qualifies file as SFR (ADU ignored for income AND value) at LTV reduced to 70% (vs 75%) + rate premium +25 bps for unpermitted-ADU overlay. Borrower accepted pivot terms rather than cure permits
source_case_ids: [CF-021]
inferred: false
```

### Cluster NP-008 — Owner-Occupied Intent (Universal Hard Decline)

```yaml
cluster_id: NP-008
cluster_name: Primary-residence / second-home borrower misrouted to DSCR
decline_rate_observed: n/a    # not present in CF-01 sample, but universal across all 8 GL-02 lenders
sample_size: 0   # inferred from guideline consensus
feature_band:
  DSCR_range: n/a
  FICO_range: n/a
  LTV_range: n/a
  reserves_months_range: n/a
  property_types: [any]
  occupancy_types: [primary_residence, second_home_personal_use, vacation_home_personal_use]
  experience_levels: [any]
primary_decline_reasons:
  - DSCR is business-purpose, investment-only product across ALL 8 GL-02 lenders
  - ECOA / Reg B risk if DSCR product used for owner-occupied financing
  - Primary residences excluded universally; second homes / vacation homes for personal use also excluded
secondary_decline_reasons:
  - SAFE Act exemption depends on business-purpose designation
recoverability: hard_decline
remediation_path: Route to conventional / FHA / VA / non-QM primary-residence product. DSCR is structurally unavailable regardless of borrower strength
source_case_ids: []
inferred: true   # universal across GL-02 Part 1; not observed as case file
source_guideline_ids: [GL02-001, GL02-002, GL02-003, GL02-004, GL02-005, GL02-006, GL02-007, GL02-008]
```

### Cluster NP-009 — Below-Floor FICO With No Compensating Factors (Inferred)

```yaml
cluster_id: NP-009
cluster_name: Sub-660 FICO borrower without cash/reserves compensators
decline_rate_observed: n/a    # CF-028 (645 FICO) was APPROVED with compensators — this cluster = same FICO band without compensators
sample_size: 0   # inferred from guideline floor + CF-028 counterexample
feature_band:
  DSCR_range: [1.20, 1.40]
  FICO_range: [550, 659]      # below 660 mainstream floor; specialty lenders (Bluestone 550 floor, Rize/Truss 620) accessible
  LTV_range: [0.75, 0.80]     # WITHOUT compensating LTV reduction
  reserves_months_range: [3, 6]   # WITHOUT compensating reserve increase
  property_types: [SFR]
  occupancy_types: [long_term_rental]
  experience_levels: [first_time, 2_5_doors]
primary_decline_reasons:
  - FICO below 660 mainstream floor (most programs)
  - No compensating factors applied (no LTV reduction, no reserve increase, no rate-premium acceptance)
secondary_decline_reasons:
  - Borrower unwilling to accept pricing premium or lower LTV
  - Conventional funnel mis-education about DSCR's "no-FICO-required" myth
recoverability: recoverable_with_remediation   # via specialty lender + compensators (CF-028 proves path)
remediation_path: Apply CF-028 playbook: (a) LTV reduced from 75% to 70%; (b) reserves increased from 6mo to 12mo; (c) rate premium +50 bps; (d) bankruptcy/foreclosure seasoning fully cleared (60mo > 48mo standard). Specialty lender accessed via Bluestone (550 floor) or sub-660-tier wholesale
source_case_ids: [CF-028]   # positive counterexample — same FICO band, was approved
inferred: true   # the decline pattern is inferred from guideline floor + absence of compensators
```

### Cluster NP-010 — Thin-DSCR Cash-Out Refi (Approved-with-Conditions, Near-Decline)

```yaml
cluster_id: NP-010
cluster_name: Cash-out refi producing sub-1.10 DSCR
decline_rate_observed: 0%   # 1 of 1 case approved_with_conditions (CF-011); decline-risk flagged
sample_size: 1
feature_band:
  DSCR_range: [1.00, 1.10]    # CF-011 = 1.04
  FICO_range: [700, 700]
  LTV_range: [0.75, 0.75]
  reserves_months_range: [6, 12]   # 6mo standard / 12mo required as condition
  property_types: [SFR]
  occupancy_types: [long_term_rental]
  experience_levels: [20+_doors]
primary_decline_reasons: []   # approved, but flag-pattern
secondary_decline_reasons:
  - Negative cash flow on subject property (-$267/mo in CF-011)
  - Only approved because of broader 12-property portfolio context (+$3,200/mo aggregate positive cash flow)
  - Any rent reduction or insurance increase pushes subject below 1.00
recoverability: counteroffer_likely
remediation_path: (a) 6mo property-specific reserve established (CF-011 condition); (b) borrower accepts negative cash flow on subject to fund acquisition; (c) re-price at 70% LTV instead of 75% to improve DSCR; (d) consider rate-and-term refi instead of cash-out for higher DSCR
source_case_ids: [CF-011]
inferred: false
```

### Cluster NP-011 — No-Reserves High-Leverage First-Time Speculator (Inferred — Charter "Audience to Repel")

```yaml
cluster_id: NP-011
cluster_name: No-reserves + 80% LTV + speculative-rent + first-time
decline_rate_observed: n/a    # not directly observed; inferred from charter "Audiences to Repel" + GL-02 overlays
sample_size: 0
feature_band:
  DSCR_range: [1.00, 1.20]    # often calculated on optimistic rent, not 1007-supported
  FICO_range: [620, 680]
  LTV_range: [0.80, 0.85]     # at LTV ceiling, often with 15-20% down
  reserves_months_range: [0, 3]
  property_types: [SFR, condo]
  occupancy_types: [long_term_rental, short_term_rental]
  experience_levels: [first_time]
primary_decline_reasons:
  - No cash reserves — fails 6mo PITIA anchor at all 8 GL-02 lenders (Lendmire is sole exception at ≤$1.5M loan + ≤70% LTV)
  - Speculative rents without lease, rent schedule, or appraisal narrative — explicitly excluded by Rize overlay
  - LTV at 80-85% ceiling + FICO at 620-680 floor + no track record = no compensating factors available
secondary_decline_reasons:
  - First-time-investor with no portfolio context — cannot cross-collateralize
  - AirDNA projection haircut (15-25% for no-host-history STR) not modeled by borrower
recoverability: hard_decline   # in current state; recoverable only after 6-12mo reserve build-up + 1007-supported rent
remediation_path: Build 6mo PITIA reserves; obtain Form 1007 market-rent appraisal or lease-in-place; reduce LTV to 75% with 25% down; consider lower-cost Midwest market
source_case_ids: []
inferred: true
source_guideline_ids: [GL02-002, GL02-005, GL02-006]   # Rize speculative-rent overlay, Lendmire reserve floor, Bluestone <20%-down difficult
charter_reference: "Audiences to Actively Repel — Borrowers with no cash reserves; Investors relying on speculative rents with no lease, rent schedule, or supportable appraisal narrative"
```

### Cluster NP-012 — Foreign National Without US LLC or Source-of-Funds Trail (Inferred Hard Decline)

```yaml
cluster_id: NP-012
cluster_name: Foreign-national borrower missing US LLC or AML source-of-funds paper trail
decline_rate_observed: n/a    # CF-017, CF-018, CF-019 all had these elements and were approved; absence is inferred hard-decline
sample_size: 0
feature_band:
  DSCR_range: [1.20, 1.40]
  FICO_range: n/a             # FN programs do not require US FICO; default 680 (AHLend) or no-FICO review (America)
  LTV_range: [0.60, 0.75]
  reserves_months_range: [6, 12]
  property_types: [SFR, 1-4 unit]
  occupancy_types: [long_term_rental]
  experience_levels: [first_time, 2_5_doors]
primary_decline_reasons:
  - No US-based LLC with EIN + operating agreement — required for FN at AHLend + America
  - No AML-compliant source-of-funds paper trail (foreign bank statements translated to English + USD-converted)
  - No valid passport + visa documentation (or ITIN if US resident)
secondary_decline_reasons:
  - Gift funds exceed ~10% of purchase price (AHLend overlay)
  - Foreign-source funds not certified-English-translated
recoverability: recoverable_with_remediation   # via 4-12 week documentation prep
remediation_path: (a) Form US LLC via US attorney ($1,200 per CF-017); (b) open US bank account 60-90 days pre-close (Relay Financial in CF-017); (c) assemble 12mo foreign bank statements + certified English translation; (d) obtain passport + visa stamp or ITIN via CAA (11-week lead per CF-019); (e) FIRPTA tax counsel review for withholding structure
source_case_ids: [CF-017, CF-018, CF-019]   # all approved WITH these elements; absence is inferred decline
inferred: true
source_guideline_ids: [GL02-003, GL02-004]
```

---

## Part 2: Decline Reason Taxonomy (Frequency Across 28 Cases)

| Rank | Decline Driver | Cases | Frequency (of 28) | Of Negative-Marginal (12) | Recoverable? |
|---:|---|---|---:|---:|---|
| 1 | DSCR below floor (incl. STR→LTR fallback collapse) | CF-015, CF-016 (via LTR fallback); CF-011 (thin 1.04); CF-008 (0.81 at 20% down pre-cure); CF-025 (1.18 post-appraisal) | 5/28 = 18% | 5/12 = 42% | Mixed: hard in STR-regulatory cases; recoverable via down-payment increase or 1007-supported rent |
| 2 | Property type ineligible (condotel / non-warrantable / unpermitted ADU) | CF-022, CF-023, CF-021 | 3/28 = 11% | 3/12 = 25% | Recoverable via specialty-lender pivot |
| 3 | STR regulatory ineligibility | CF-015, CF-016 | 2/28 = 7% | 2/12 = 17% | Hard in market; recoverable by market pivot |
| 4 | Reserves shortfall (incl. 401k haircut miscalc) | CF-026 | 1/28 = 4% | 1/12 = 8% | Recoverable via co-borrower + re-shop |
| 5 | Recent credit event seasoning insufficient | CF-024 (foreclosure 30<36mo); CF-028 (bankruptcy 60mo — cleared, approved) | 1/28 = 4% | 1/12 = 8% | Recoverable via FICO rebuild or wait |
| 6 | Recent mortgage late within 12 months | CF-027 | 1/28 = 4% | 1/12 = 8% | Recoverable via 12-mo wait |
| 7 | LTV above max (post-appraisal) | CF-025 | 1/28 = 4% | 1/12 = 8% | Recoverable via cash-to-close or ROV |
| 8 | FICO below floor | CF-028 (645 — compensated, approved) | 1/28 = 4% | 1/12 = 8% | Recoverable via compensators |
| 9 | Documentation gap (401k haircut / ADU permit / source-of-funds) | CF-026 (401k), CF-021 (ADU permit) | 2/28 = 7% | 2/12 = 17% | Recoverable via re-shop or cure |
| 10 | Property condition / open violations | CF-007 (3 violations — exception approved) | 1/28 = 4% | 1/12 = 8% | Recoverable via low-LTV exception |
| 11 | Entity structure issue (no US LLC for FN) | none directly observed | 0/28 = 0% | — | Inferred hard decline per GL-02 |
| 12 | Other — housing-history overlay (mortgage late) | CF-027 (already counted above) | — | — | Same as #6 |
| 13 | Owner-occupied intent (universal exclusion) | none observed (would not enter pipeline) | 0/28 = 0% | — | Hard decline per all 8 GL-02 lenders |
| 14 | Loan amount below $100K-$150K minimum | none observed | 0/28 = 0% | — | Hard decline per Truss |

**Top 3 decline drivers by raw frequency (CF-01 sample):**
1. DSCR below floor (18%) — but most often a *symptom* of another root cause (STR→LTR fallback, appraisal short, thin-DSCR cash-out)
2. Property-type ineligible / overlay (11%)
3. STR regulatory ineligibility + documentation gap (tied at 7%)

**Root-cause hierarchy (more useful for FF-08 than raw frequency):**
1. Property-type / market-regulatory overlays (NP-001 + NP-002 + NP-007 = 5 cases, 42% of negative-or-marginal) — *preventable at pre-screen*
2. Credit-event / housing-history overlays (NP-003 + NP-004 = 2 cases) — *preventable via borrower education + pre-screen*
3. Reserves / documentation / appraisal mechanics (NP-005 + NP-006 = 2 cases) — *preventable via intake calculation tools*
4. Thin-DSCR cash-out (NP-010 = 1 case) — *counteroffer-eligible, not decline*
5. Owner-occupied / FN structural (NP-008 + NP-012 = inferred) — *pre-screen routing*

---

## Part 3: Hard Exclusion Rules (Binary Disqualifiers for FF-08)

These are the rules FF-08 should encode as **form-level yes/no disqualifiers** — if "yes," the lead should either be rejected outright (with route-to-other-product messaging from AC-09) or routed to specialty intake (not auto-screened-out of the funnel entirely, because some are recoverable).

```yaml
- rule_id: HEX-001
  rule: Property intended as primary residence
  severity: hard_stop
  reason: DSCR is business-purpose investment-only product across all 8 GL-02 lenders. ECOA / Reg B risk if misused for owner-occupied financing. SAFE Act exemption depends on business-purpose designation.
  source: GL-02 Part 1 exclusionary_overlays — universal across GL02-001 through GL02-008; charter "Audiences to Actively Repel"
  recommended_screening_question: "Will this property be your primary residence, second home, or personal-use vacation home at any point in the next 12 months?"
  ff08_action: reject_with_redirect   # route to conventional/FHA/VA intake
  ac09_redirect_copy: "DSCR loans are investment-only. For a primary residence or second home, [conventional / FHA / VA] financing is the right fit. Here's where to start."

- rule_id: HEX-002
  rule: STR property located in NYC (Local Law 18 ban)
  severity: hard_stop
  reason: Local Law 18 (effective 2023) requires host present during guest stays + caps at 2 guests. Investment properties in NYC cannot generate STR income acceptable to DSCR lenders. LTR fallback typically fails DSCR (CF-016 = 0.62 DSCR on LTR).
  source: CF-016 case file + FAAS Funding STR guide
  recommended_screening_question: "Is the subject property located within the five boroughs of New York City AND intended for short-term rental (Airbnb/VRBO) use?"
  ff08_action: reject_with_redirect   # route to LTR DSCR or out-of-market STR
  ac09_redirect_copy: "NYC's Local Law 18 restricts short-term rentals. We can underwrite this as a long-term rental DSCR (if rents pencil) or help you find an STR-permissive market."

- rule_id: HEX-003
  rule: STR property located in Nashville TN residential zone (owner-occupancy permit required)
  severity: hard_stop
  reason: Nashville owner-occupancy requirement for non-owner STR permits means most investment property purchases in residential zones cannot operate as non-owner STRs legally. Lenders will not use projected STR income where compliant permit is unobtainable. LTR fallback typically fails DSCR (CF-015 = 0.71 on LTR).
  source: CF-015 case file + FAAS Funding STR guide
  recommended_screening_question: "Is the subject property located in Nashville TN residential zoning AND will the borrower NOT occupy the property as primary residence?"
  ff08_action: reject_with_redirect
  ac09_redirect_copy: "Nashville requires owner-occupancy for STR permits in residential zones. Consider Gatlinburg/Pigeon Forge TN, Panama City Beach FL, or Scottsdale AZ for STR DSCR."

- rule_id: HEX-004
  rule: Condotel / hotel-condo conversion property type
  severity: hard_stop_at_standard_residential_DSCR
  reason: Condotels explicitly excluded at standard residential DSCR programs (AHLend, Newfi). Hotel-condo conversion = non-warrantable condo with front-desk rental program — overlays at most residential DSCR lenders. Requires commercial-facing DSCR at different LTV/rate.
  source: CF-022 + AHLend decline taxonomy + GL-02 Part 1 Newfi residential-1-4-unit-only overlay
  recommended_screening_question: "Is the subject property a condotel (hotel-condo conversion with front-desk rental program) or hotel-condo project?"
  ff08_action: route_to_specialty_intake   # NOT auto-reject — Visio Lending / Kiavi STR-condotel programs
  ac09_redirect_copy: "Condotels need a specialty DSCR lender. We can route you to lenders who write condotel STR DSCR (typically 30-35% down + 1.25+ DSCR)."

- rule_id: HEX-005
  rule: Non-warrantable condo (investor concentration >50% OR pending HOA litigation OR hotel conversion OR non-compliant HOA)
  severity: hard_stop_at_standard_residential_DSCR
  reason: Lenders requiring warrantable condo status will auto-decline. Property is financeable, just not at this lender — ~half-dozen DSCR lenders actively write non-warrantable DSCR.
  source: CF-023 + DSCR Authority decline-reasons guide
  recommended_screening_question: "For condo purchases: is the complex's investor concentration above 50%, is there pending HOA litigation, is it a hotel conversion, or is the HOA non-compliant with Fannie warrantability standards?"
  ff08_action: route_to_specialty_intake
  ac09_redirect_copy: "Non-warrantable condos need a specialty DSCR lender. We can match you with lenders who write non-warrantable condo DSCR."

- rule_id: HEX-006
  rule: Recent 30-day mortgage late payment within last 12 months
  severity: hard_stop
  reason: Housing-history review mandatory across all DSCR programs despite no-DTI underwriting. Recent lates trigger automatic decline regardless of DSCR/FICO (CF-027). No compensating-factor override at mainstream DSCR.
  source: CF-027 + AHLend decline taxonomy
  recommended_screening_question: "Have you had any 30-day-or-greater late payment on any mortgage (primary residence, prior investment property, or HELOC) within the last 12 months?"
  ff08_action: defer_12mo   # not permanent rejection — defer until 12mo since late
  ac09_redirect_copy: "DSCR lenders require 12+ months since your most recent mortgage late. We'll re-engage you when you clear that window."

- rule_id: HEX-007
  rule: Foreclosure discharged less than 36 months ago (standard program) OR less than 24 months ago with FICO below 700 (specialty program)
  severity: hard_stop
  reason: 36-month standard seasoning minimum from foreclosure discharge date; 24-month specialty programs require 700+ FICO. CF-024 declined at 30mo + 680 FICO (missed both paths).
  source: CF-024 + DSCR Authority seasoning benchmarks
  recommended_screening_question: "Have you experienced a foreclosure? If yes, what was the discharge date? (Specialty programs allow 24mo seasoning with 700+ FICO; standard programs require 36mo.)"
  ff08_action: defer_or_route_to_specialty   # if FICO ≥700 and ≥24mo, route to specialty
  ac09_redirect_copy: "Foreclosure seasoning needs 24-36 months. We can map you to a specialty lender if you're 24+ months past discharge with a 700+ credit score."

- rule_id: HEX-008
  rule: Chapter 7 bankruptcy discharged less than 48 months ago (standard program) OR less than 24-36 months ago (specialty)
  severity: hard_stop
  reason: 48-month standard seasoning minimum from Chapter 7 discharge. CF-028 cleared 60mo seasoning and was approved with FICO 645 + compensators — confirms post-seasoning path is fundable.
  source: CF-028 (positive counterexample) + DSCR Authority seasoning benchmarks
  recommended_screening_question: "Have you filed for Chapter 7 bankruptcy? If yes, what was the discharge date?"
  ff08_action: defer_or_route_to_specialty
  ac09_redirect_copy: "Bankruptcy seasoning needs 24-48 months depending on chapter. We'll map you to the right specialty program once you're past the window."

- rule_id: HEX-009
  rule: Unresolved mortgage delinquency or uncured forbearance
  severity: hard_stop
  reason: AHLend explicitly lists "unresolved mortgage delinquencies" and "forbearance not fully cured" as decline triggers. Distinct from HEX-006 (recent late) — this is *currently* delinquent or in active forbearance.
  source: AHLend decline taxonomy
  recommended_screening_question: "Are you currently in mortgage forbearance, or do you have any unresolved mortgage delinquency on any property?"
  ff08_action: reject_until_cured
  ac09_redirect_copy: "DSCR lenders require all mortgage delinquencies cured and forbearance fully exited before application. Let's revisit once that's resolved."

- rule_id: HEX-010
  rule: Foreign-national borrower without US-based LLC (EIN + operating agreement)
  severity: hard_stop_at_FN_programs
  reason: AHLend + America Mortgages (the two FN-native DSCR lenders) require US-based LLC for foreign-national borrowers. No LLC = no FN DSCR approval.
  source: GL-02 Part 1 GL02-003 (AHLend) + GL02-004 (America); CF-017, CF-018, CF-019 all had US LLC
  recommended_screening_question: "If you are not a US citizen or permanent resident: do you have (or are you prepared to form within 2-4 weeks) a US-based LLC with EIN and operating agreement?"
  ff08_action: route_to_FN_intake_with_LLC_setup   # formation is a 2-4 week remediation
  ac09_redirect_copy: "Foreign-national DSCR requires a US LLC. We can connect you with a US attorney to form one (~$1,200, 2-4 weeks)."

- rule_id: HEX-011
  rule: Foreign-national borrower without AML-compliant source-of-funds paper trail
  severity: hard_stop
  reason: Foreign-source funds require certified English translation + USD conversion. Gift funds limited to ~10% of purchase price. AML clearance takes 2-4 weeks.
  source: GL-02 Part 1 GL02-003 (AHLend); CF-017 (AML 3-week clearance), CF-018 (12mo international bank statements)
  recommended_screening_question: "If foreign-national: can you provide 12 months of foreign bank statements with certified English translation + USD conversion + source-of-funds letter for the down payment?"
  ff08_action: route_to_FN_intake_with_AML_prep
  ac09_redirect_copy: "Foreign-national DSCR needs a 2-4 week AML source-of-funds review. Start assembling 12 months of bank statements + translation now."

- rule_id: HEX-012
  rule: Loan amount below $100K-$150K program minimum
  severity: hard_stop
  reason: Universal floor across GL-02 lenders; below this, hard money / private notes dominate. Truss publishes $100K-$150K min explicitly.
  source: GL-02 Part 1 GL02-001 (Truss); AHLend min $100K-$150K
  recommended_screening_question: "What is your target loan amount? (Program floor is typically $100K-$150K; below this we cannot underwrite a DSCR loan.)"
  ff08_action: reject_with_redirect   # route to hard money / private notes
  ac09_redirect_copy: "DSCR loans start at ~$100K-$150K. For smaller loan amounts, hard money or private notes may be a better fit."

- rule_id: HEX-013
  rule: Property in commercial / retail / industrial use
  severity: hard_stop_at_residential_DSCR
  reason: Newfi (residential 1-4 unit only) + AHLend (excludes commercial) + America + Lendmire all exclude. Only Bluestone opens to mixed-use + small commercial.
  source: GL-02 Part 1 GL02-008 (Newfi) + GL02-003 (AHLend); GL-02 Part 2 Property Type Eligibility matrix
  recommended_screening_question: "Is the subject property used for commercial, retail, industrial, or mixed-use purposes (with >25% commercial component)?"
  ff08_action: route_to_specialty_intake   # Bluestone or commercial DSCR
  ac09_redirect_copy: "Commercial-use properties need a commercial DSCR lender. We can route you to specialty programs that write mixed-use and small commercial DSCR."

- rule_id: HEX-014
  rule: STR property without obtainable non-owner STR permit (regardless of market)
  severity: hard_stop_for_STR_income_path
  reason: Lenders will not underwrite projected STR income if compliant non-owner STR permit is unobtainable (CF-015). Applies beyond Nashville/NYC — San Francisco, Denver, parts of Austin also restrict.
  source: CF-015 + FAAS Funding STR guide
  recommended_screening_question: "For STR-intent properties: have you confirmed with the local municipality that a non-owner-occupied STR permit is obtainable for this property?"
  ff08_action: defer_until_permit_confirmed   # or route to LTR DSCR
  ac09_redirect_copy: "STR DSCR requires a confirmable non-owner STR permit. Verify with the local municipality, or we can underwrite this as a long-term rental DSCR instead."

- rule_id: HEX-015
  rule: Borrower relying on speculative rents with no lease, rent schedule, or supportable appraisal narrative
  severity: hard_stop
  reason: Rize exclusionary overlay — speculative rents without lease/rent schedule/1007 narrative excluded. Charter "Audiences to Actively Repel."
  source: GL-02 Part 1 GL02-002 (Rize); charter
  recommended_screening_question: "Do you have a current lease, rent schedule, Form 1007 market-rent appraisal, or AirDNA projection supporting the rental income you're using to qualify?"
  ff08_action: defer_until_1007_supported
  ac09_redirect_copy: "DSCR qualification requires supportable rent — a lease, rent schedule, or 1007 market-rent appraisal. Without that, we can't underwrite the file."

- rule_id: HEX-016
  rule: Property with 5+ units (5-8 unit) at non-AHLend lender
  severity: hard_stop_at_non_AHLend_lenders
  reason: Newfi explicitly residential 1-4 unit only; AHLend allows 5-8 unit; most others case-by-case. Property is financeable at AHLend but auto-declines elsewhere.
  source: GL-02 Part 1 GL02-003 (AHLend) vs GL02-008 (Newfi); GL-02 Part 2 Property Type matrix
  recommended_screening_question: "How many units does the subject property have? (1-4 = residential DSCR; 5-8 = AHLend specialty only; 9+ = commercial DSCR)"
  ff08_action: route_to_specialty_intake   # AHLend for 5-8 unit
  ac09_redirect_copy: "5-8 unit properties need a specialty DSCR lender (AHLend). 9+ units need commercial DSCR. We can route you to the right program."
```

---

## Part 4: Soft Warning Rules (Yellow Flags)

Patterns that do NOT auto-decline but should trigger manual review, counteroffer, additional documentation, or TS-10 lead-score reduction.

```yaml
- rule_id: SWR-001
  rule: Reserves held primarily in retirement accounts (401k / IRA)
  flag_type: documentation_gap
  ts10_score_impact: -5
  ff08_action: prompt_borrower_to_apply_60pct_haircut + request 2mo bank statements showing liquid funds
  rationale: 401(k) reserves must be haircut 60% (CF-026 initial decline); most common reserve-calculation error. Borrower education gap.
  source: CF-026 + DSCR Authority

- rule_id: SWR-002
  rule: DSCR between 1.00 and 1.10 (thin band)
  flag_type: counteroffer_likely
  ts10_score_impact: -10
  ff08_action: trigger_counteroffer_with_options   # 70% LTV vs 75%; rate-and-term vs cash-out
  rationale: CF-011 approved at 1.04 only with 6mo property-specific reserve + portfolio context. CF-008 needed 42% down to clear 1.12. Thin DSCR triggers LTV haircut or reserve increase.
  source: CF-008, CF-011

- rule_id: SWR-003
  rule: FICO between 620 and 659
  flag_type: route_to_specialty_lender
  ts10_score_impact: -8
  ff08_action: route_to_Bluestone_or_Rize_specialty_intake
  rationale: Below 660 mainstream floor (CF-028 645 FICO approved with 70% LTV + 12mo reserves + 50bps premium). Specialty lenders (Bluestone 550 floor, Rize 620 floor) accessible.
  source: CF-028 + GL-02 Part 2 Quantitative Band Matrix

- rule_id: SWR-004
  rule: First-time STR investor with no host history
  flag_type: documentation_required
  ts10_score_impact: -6
  ff08_action: require_AirDNA_report + 12mo_reserves + 25pct_down
  rationale: CF-014 first-time STR approved with 25% AirDNA haircut + 12mo reserves + STR permit verification. CF-012 had 12mo host history → 20% haircut; CF-013 24mo host history → 15% haircut. No-history borrowers face worst-tier haircut.
  source: CF-012, CF-013, CF-014

- rule_id: SWR-005
  rule: Foreign-national borrower from no-credit country (no Nova Credit translation available)
  flag_type: pricing_premium + LTV_haircut
  ts10_score_impact: -7
  ff08_action: route_to_no_credit_country_FN_tier
  rationale: CF-018 Brazilian borrower approved at 60% LTV + 12mo reserves + 8.125% rate (+1.25% premium) vs CF-017 UK borrower at 70% LTV + 9mo reserves + 7.25% (+0.50% premium). No-credit-country tier requires 40% down.
  source: CF-017, CF-018

- rule_id: SWR-006
  rule: Property with open code violations or condition issues
  flag_type: counteroffer_likely
  ts10_score_impact: -8
  ff08_action: trigger_low_LTV_exception_path
  rationale: CF-007 approved with 3 open violations at 70% LTV (vs 75% standard) + 6mo reserves + 1.25+ DSCR. Lender exception granted; property-condition risk priced via LTV haircut.
  source: CF-007

- rule_id: SWR-007
  rule: Cash-out refi producing negative cash flow on subject property
  flag_type: manual_review_required
  ts10_score_impact: -12
  ff08_action: require_portfolio_context_documentation   # 12-mo rent rolls on other properties
  rationale: CF-011 approved at 1.04 DSCR with -$267/mo subject cash flow ONLY because of $3,200/mo aggregate positive cash flow across 10 other properties. Without portfolio context, decline.
  source: CF-011

- rule_id: SWR-008
  rule: Appraisal-risk flag — rate-term refi at 75% LTV in softening market
  flag_type: pre-appraisal_risk_review
  ts10_score_impact: -5
  ff08_action: trigger_comp_pull_before_formal_application
  rationale: CF-025 declined when appraisal came in $30K below estimate (75% → 81% LTV). Borrower couldn't bridge $30K cash. Pre-appraisal comp pull prevents wasted application.
  source: CF-025 + HonestCasa decline taxonomy

- rule_id: SWR-009
  rule: Borrower at LTV ceiling (80-85% purchase) with FICO 620-680
  flag_type: counteroffer_likely
  ts10_score_impact: -10
  ff08_action: suggest_25pct_down_instead_of_20pct
  rationale: GL-02 CF-02 compensating-factor pattern: FICO at floor requires 25-30% down + 1.25+ DSCR. Lendmire/Newfi 85% LTV tier requires 720+ FICO + 1.25-1.5+ DSCR.
  source: GL-02 Part 4 CF-02 + CF-06

- rule_id: SWR-010
  rule: Below-1.0 DSCR on initial calculation (0.75-0.99)
  flag_type: counteroffer_likely_with_compensators
  ts10_score_impact: -15   # but recoverable — do NOT auto-decline
  ff08_action: route_to_AHLend_Lendmire_Newfi_specialty_with_compensators
  rationale: AHLend/Lendmire/Newfi all accept 0.75-0.80 DSCR with compensators (FICO 700+ + LTV ≤65-70% + 12mo reserves + 3+ financed properties). CF-008 demonstrates cure via down-payment increase (1.12 DSCR at 42% down).
  source: GL-02 Part 4 CF-01 + CF-008

- rule_id: SWR-011
  rule: Borrower with 5+ financed properties (portfolio/blanket loan request)
  flag_type: documentation_required
  ts10_score_impact: -3
  ff08_action: require_portfolio-level_reserve_documentation + 680+ aggregate FICO
  rationale: Truss portfolio/blanket DSCR requires higher reserves + FICO per GL-02 Part 1 GL02-001 special features.
  source: GL-02 Part 4 CF-07

- rule_id: SWR-012
  rule: ITIN borrower with limited US credit history (<24mo, <3 tradelines)
  flag_type: counteroffer_likely
  ts10_score_impact: -6
  ff08_action: require_12mo_bank_statements + employment_verification_letter + 9mo_reserves
  rationale: CF-019 ITIN borrower approved with 9mo reserves (vs 6mo standard) + 50bps rate premium + 12mo bank statement supplement. ITIN tier sits between pure FN and US borrower pricing.
  source: CF-019

- rule_id: SWR-013
  rule: Borrower self-identifies as "no credit needed" / "DSCR = no personal review"
  flag_type: borrower_education_gap
  ts10_score_impact: -4
  ff08_action: trigger_education_module_before_intake
  rationale: CF-027 decline surprised borrower who thought DSCR = no housing-history review. Borrower-education gap is itself a yellow flag — these borrowers often have other unremediated overlay risks.
  source: CF-027

- rule_id: SWR-014
  rule: STR property in market with pending STR regulation changes
  flag_type: market_risk_review
  ts10_score_impact: -7
  ff08_action: require_STR_permit_verification + 6mo STR operating history backup
  rationale: STR regulatory landscape shifting in 2025-2026 — markets currently permissive may not remain so (Nashville, Phoenix, Austin all have pending legislation). Mitigate by requiring permit + history.
  source: CF-015, CF-016 regulatory-decline pattern extrapolated
  inferred: true

- rule_id: SWR-015
  rule: Unpermitted ADU on property (income used in borrower's calc)
  flag_type: income_recalculation_required
  ts10_score_impact: -8
  ff08_action: recalc_DSCR_excluding_ADU_income + offer_specialty_lender_pivot_at_70pct_LTV
  rationale: CF-021 mainline lender excluded unpermitted ADU income → DSCR fell from 1.40 to 1.00 (floor, not best-tier). Specialty lender pivot at 70% LTV approved.
  source: CF-021 + Harpoon Capital ADU guide

- rule_id: SWR-016
  rule: Foreign-national reserves held in overseas account (not yet US-domiciled)
  flag_type: documentation_required
  ts10_score_impact: -5
  ff08_action: require_2-week_US_wire_transfer_setup + 60-90 day seasoning in US bank
  rationale: CF-017 UK borrower opened US bank 90 days pre-close via Relay Financial; CF-018 Brazilian borrower seasoned funds 90 days. Foreign reserves need translation + USD conversion + US-domicile seasoning.
  source: CF-017, CF-018
```

---

## Part 5: False-Positive Risk Notes (Do NOT Over-Filter)

Patterns that LOOK like declines but are actually fundable. FF-08 must NOT auto-screen these out; AC-09 must NOT use ad copy that repels these leads; TS-10 must NOT score these leads downward beyond the soft-warning deltas above.

```yaml
- pattern_id: FP-001
  pattern: Recent short sale or foreclosure in borrower's history
  looks_like_decline_because: Recent credit event = sub-seasoning risk
  actually_fundable_when:
    - Short sale: 2+ years seasoning + 25% down + 1.30+ DSCR (specialty lenders)
    - Foreclosure: 36+ months standard / 24+ months specialty with 700+ FICO
    - Chapter 7 bankruptcy: 48+ months standard / 24-36 months specialty
    - Chapter 13 bankruptcy: 12+ months on-plan payments with trustee approval
  source: CF-024 (decline at 30mo, would approve at 36mo) + CF-028 (approved at 60mo with 645 FICO + compensators)
  ff08_handling: Do NOT auto-decline; route to specialty-lender intake with seasoning + FICO + LTV inputs; TS-10 should add -8 to -15 depending on seasoning gap, NOT -100
  ac09_warning: "Do NOT use copy like 'no recent credit events' or 'clean credit only' — it will repel fundable P7 (credit-scarred cash-rich) borrowers"

- pattern_id: FP-002
  pattern: ITIN borrower (US resident with work permit, no SSN, has ITIN)
  looks_like_decline_because: "No SSN" triggers conventional-funnel rejection
  actually_fundable_when: ITIN issued via CAA + 2-3 tradelines with 18+ months history + 9mo reserves + employment verification letter. ITIN pricing sits between pure FN and US borrower (+25-75 bps).
  source: CF-019 (Miami FL ITIN borrower approved at 75% LTV + 1.20 DSCR + 9mo reserves)
  ff08_handling: Do NOT reject ITIN borrowers; route to ITIN-tier intake. ITIN is NOT the same as no-credit-country foreign national.
  ac09_warning: "Ad copy must NOT say 'SSN required' or 'US citizens only' — repels fundable ITIN + FN borrowers"

- pattern_id: FP-003
  pattern: Foreign-national borrower with no US credit history
  looks_like_decline_because: No US FICO triggers conventional rejection
  actually_fundable_when:
    - Strong-credit-country FN (UK, Canada, Australia, etc.): 70-75% LTV + 9-12mo reserves + Nova Credit translation
    - No-credit-country FN (Brazil, Russia, etc.): 60% LTV + 12mo reserves + 12mo foreign bank statements + source-of-funds trail
  source: CF-017 (UK FN approved), CF-018 (Brazilian FN approved)
  ff08_handling: FN is a CORE specialty at AHLend + America Mortgages; route to FN intake, not rejection
  ac09_warning: "Ad copy should explicitly welcome foreign-national investors — 'No US credit history required' is a feature, not a screen-out"

- pattern_id: FP-004
  pattern: Below-1.0 DSCR on initial calculation (0.75-0.99)
  looks_like_decline_because: Below universal 1.00 floor
  actually_fundable_when: AHLend, Lendmire, Newfi all accept 0.75-0.80 DSCR with compensators — FICO 700+ + LTV ≤65-70% + 12mo reserves + 3+ financed properties. Newfi's published floor is 0.80.
  source: GL-02 Part 1 GL02-003 (AHLend 0.75 with compensators), GL02-005 (Lendmire 0.75), GL02-008 (Newfi 0.80 floor); GL-02 Part 4 CF-01
  ff08_handling: Do NOT auto-reject DSCR <1.00; route to AHLend/Lendmire/Newfi specialty intake with compensator-collection prompt
  ac09_warning: "Ad copy must NOT say '1.25+ DSCR required' — repels fundable sub-1.0 borrowers with compensators"

- pattern_id: FP-005
  pattern: Unpermitted ADU on subject property
  looks_like_decline_because: Mainline DSCR lender excludes ADU income → DSCR drops to floor (CF-021: 1.40 → 1.00)
  actually_fundable_when: Specialty DSCR lender qualifies property as SFR (ADU ignored for income AND value) at LTV reduced to 70% (vs 75%) + 25bps rate premium.
  source: CF-021 (decline at mainline → pivot approved at specialty, 70% LTV)
  ff08_handling: Do NOT reject; route to specialty-lender intake with ADU-permit-status flag. Borrower may choose 8-14mo permit cure OR accept pivot terms.
  ac09_warning: "Ad copy should not say 'permitted ADU only' — there is a fundable specialty path for unpermitted ADU"

- pattern_id: FP-006
  pattern: Non-warrantable condo (investor concentration >50% OR HOA litigation OR hotel conversion)
  looks_like_decline_because: Standard residential DSCR auto-declines
  actually_fundable_when: ~half-dozen DSCR lenders actively write non-warrantable DSCR per DSCR Authority. Borrower profile strength (CF-023: 1.36 DSCR + 720 FICO) does not need to change.
  source: CF-023 (decline at standard → would pivot to specialty per source)
  ff08_handling: Route to specialty-lender intake; do NOT auto-reject
  ac09_warning: "Ad copy should NOT say 'warrantable condos only' — there is a fundable path for non-warrantable"

- pattern_id: FP-007
  pattern: Condotel property
  looks_like_decline_because: Excluded at residential DSCR programs (AHLend, Newfi)
  actually_fundable_when: Visio Lending + Kiavi have STR-condotel programs. Commercial-facing DSCR available with 30-35% down + 1.25+ DSCR + 12mo operating history.
  source: CF-022 + DSCR Authority STR guide
  ff08_handling: Route to commercial-facing or STR-condotel specialty intake
  ac09_warning: "Do NOT auto-reject condotel — there are fundable specialty programs"

- pattern_id: FP-008
  pattern: FICO between 620 and 659 (below mainstream 660 floor)
  looks_like_decline_because: Below most lenders' 660 floor
  actually_fundable_when: Bluestone (550 floor), Truss/Rize/Lendmire (620 floor) accessible with compensators — 25-30% down + 6+ months reserves + 1.25+ DSCR + SFR in stable rental market. CF-028 approved at 645 FICO with 70% LTV + 12mo reserves + 50bps premium.
  source: CF-028 + GL-02 Part 1 GL02-006 (Bluestone 550 floor)
  ff08_handling: Route to specialty-lender intake; do NOT auto-reject
  ac09_warning: "Ad copy should NOT say '660+ FICO required' — repels fundable P7 (credit-scarred cash-rich) borrowers"

- pattern_id: FP-009
  pattern: Recent 30-day mortgage late at 12-24 months ago
  looks_like_decline_because: Mortgage late in housing-history review window
  actually_fundable_when: 12+ months since most recent late payment clears AHLend overlay. Some specialty lenders accept 12-24mo seasoning with compensators.
  source: CF-027 (declined at 4mo) → inferred fundable at 12+mo
  ff08_handling: Defer-intake with 12-mo re-engagement, NOT permanent rejection
  ac09_warning: "Ad copy should NOT say 'no mortgage lates ever' — repels fundable borrowers at 12+ months post-late"

- pattern_id: FP-010
  pattern: Appraisal comes in below estimated value
  looks_like_decline_because: LTV exceeds program max post-appraisal (CF-025: 75% → 81%)
  actually_fundable_when: One or more of: (a) ROV with better comps; (b) price negotiation with seller/lender; (c) borrower brings additional cash to maintain LTV; (d) second appraisal if lender permits.
  source: CF-025 + HonestCasa decline taxonomy
  ff08_handling: Do NOT auto-reject; trigger ROV + cash-bridge + second-appraisal option path
  ac09_warning: "Ad copy should not pre-screen on appraisal optimism — it's a mid-process remediation, not a pre-screen filter"

- pattern_id: FP-011
  pattern: Borrower with no reserves in checking but $50K+ in 401(k)
  looks_like_decline_because: Initial reserve calc falls below 6mo PITIA
  actually_fundable_when: Apply 60% haircut to 401(k) (CF-026: $35K → $21K qualifying), add co-borrower (spouse) with $12K liquid checking → combined $33K = 6.2mo PITIA clears 6mo minimum. Or pivot to Lendmire's no-reserve-required program at ≤$1.5M loan + ≤70% LTV.
  source: CF-026 + GL-02 Part 1 GL02-005 (Lendmire no-reserve floor)
  ff08_handling: Trigger reserve-calculation intake tool that auto-applies 60% 401(k) haircut; do NOT auto-reject
  ac09_warning: "Ad copy should not say 'liquid reserves only' — repels fundable borrowers with retirement-account reserves"

- pattern_id: FP-012
  pattern: STR property in NYC or Nashville
  looks_like_decline_because: STR income legally unusable (Local Law 18 / owner-occupancy rule)
  actually_fundable_when: Pivoted to long-term rental DSCR IF LTR rents support 1.00+ DSCR (rare in NYC; sometimes feasible in Nashville). Or borrower pivots to STR-permissive market (Gatlinburg TN, Panama City Beach FL, Scottsdale AZ, Destin FL).
  source: CF-015, CF-016 (declined on STR; pivot path not taken by borrowers but available)
  ff08_handling: Auto-reject only if borrower insists on STR income path in NYC/Nashville residential zone; offer LTR-pivot or market-pivot alternatives
  ac09_warning: "Do NOT auto-reject all NYC/Nashville STR inquiries — offer the LTR-pivot path or market-pivot education"

- pattern_id: FP-013
  pattern: First-time STR investor with no Airbnb host history
  looks_like_decline_because: Most STR DSCR programs prefer 12-24mo documented STR history
  actually_fundable_when: AirDNA market projection showing 1.25+ DSCR + 25%+ down + 12mo reserves + FICO 720+ + STR-permissive regulatory market. CF-014 first-time STR approved in Gatlinburg at 1.27 DSCR + 25% AirDNA haircut + 12mo reserves. CF-006 Panama City Beach approved with <1mo STR history via AirDNA projection.
  source: CF-006, CF-014 + GL-02 Part 4 CF-04
  ff08_handling: Do NOT reject first-time STR; require AirDNA report + STR permit verification + 12mo reserves
  ac09_warning: "Ad copy should NOT say 'established STR hosts only' — repels fundable first-time STR investors in STR-permissive markets"

- pattern_id: FP-014
  pattern: Property with open code violations (CF-007 had 3)
  looks_like_decline_because: Property condition risk
  actually_fundable_when: Lender exception granted at 70% LTV (vs 75% standard) + 6mo reserves + 1.25+ DSCR + steady rental income + strong borrower profile.
  source: CF-007 (approved_with_conditions at 70% LTV)
  ff08_handling: Do NOT auto-reject; route to exception-path intake with low-LTV + strong-reserves counteroffer
  ac09_warning: "Ad copy should not say 'clean-title only' or 'no open violations' — repels fundable exception-path borrowers"

- pattern_id: FP-015
  pattern: Borrower with DTI at 48-50% (conventional wall)
  looks_like_decline_because: Conventional lenders decline at 50% DTI
  actually_fundable_when: DSCR IGNORES personal DTI entirely. CF-009 (Marcus, DTI at 48%) approved specifically because DSCR ignores DTI. This is the #1 reason borrowers adopt DSCR.
  source: CF-009, CF-003 (tax returns showed $62K vs $180K+ actual cash flow — DSCR qualified on property income)
  ff08_handling: DTI is NOT a DSCR intake question. Do not collect DTI for DSCR qualification.
  ac09_warning: "Ad copy should CELEBRATE 'no DTI limit' — this is DSCR's core value proposition, not a screen-out"
```

---

## Part 6: Cross-Agent Handoff Notes

### For FF-08 (Funnel Friction Mapper)
- Encode HEX-001 through HEX-016 as form-level yes/no questions (Part 3 above). Recommended order: HEX-001 (primary residence) FIRST — most universal hard-stop. Then HEX-013 (commercial use), HEX-012 (loan amount floor), HEX-009 (active delinquency) — these are quick disqualifiers.
- For HEX-002/003/014 (STR regulatory), pair the question with a market-lookup tool — borrowers often don't know their city's STR rules.
- For HEX-010/011 (FN LLC + AML), trigger a 2-4 week pre-intake workstream; do NOT auto-reject.
- For SWR-001 (401k reserves), build a reserves calculator that auto-applies 60% haircut — this is the single highest-leverage intake tool.
- For SWR-008 (appraisal risk), trigger a comp-pull at 75% LTV rate-term refi before formal application.
- For SWR-013 ("no credit needed" borrower), trigger a borrower-education module BEFORE intake — this cohort has elevated overlay-risk density.

### For AC-09 (Ad Hook & Copy Reframer)
- Do NOT use copy like: "easy approval", "1.25+ DSCR required", "660+ FICO required", "SSN required", "US citizens only", "warrantable condos only", "permitted ADU only", "no mortgage lates ever", "clean credit only", "established STR hosts only", "liquid reserves only", "no recent credit events". Each repels a fundable FP-001 through FP-015 cohort.
- DO use copy that quietly screens via specific language: "Investment properties only" (screens HEX-001), "DSCR from 0.80 with compensating factors" (welcomes FP-004), "Foreign-national specialists — no US credit required" (welcomes FP-002, FP-003), "STR-permissive markets: FL coast, Smoky Mountains, Scottsdale AZ" (redirects from HEX-002/003).
- Per charter: "creative must NOT promise 'easy approval'." Multiple real declines (CF-015, CF-016, CF-022, CF-023, CF-024, CF-025, CF-027) demonstrate that even strong DSCRs (1.20-1.40) get declined on overlays.

### For TS-10 (Targeting & Scoring Generator)
- Apply SWR deltas (-3 to -15 per rule) as lead-score downward pressure. Multiple SWR flags stack additively (e.g., SWR-001 + SWR-002 + SWR-007 = -27 points).
- Do NOT apply FP-pattern deltas as negative scores — FP patterns are explicitly fundable.
- Hard-stop leads (HEX-001, HEX-009, HEX-012 outside specialty, HEX-013 outside specialty) should score 0 / route-to-other-product.
- Conditional-hard leads (HEX-002, HEX-003, HEX-004, HEX-005, HEX-007, HEX-008, HEX-010, HEX-011, HEX-014, HEX-015, HEX-016) should score 30-50 + route to specialty intake, NOT 0.
- Recoverable leads (NP-003, NP-004, NP-005, NP-006, NP-007, NP-009, NP-010, NP-012) should score 50-70 with manual-review flag.

### For AP-03 (Approval Pattern Miner)
- The decline clusters NP-001 through NP-012 directly inform the inverse "approval-rich" clusters. AP-03's green zones should be the negation of NP-04's red zones (where borrower can clear the hard-stop AND has fundable-path flag).
- CF-028 (credit-scarred cash-rich, FICO 645 + bankruptcy 60mo + 12mo reserves + 70% LTV) is BOTH an NP-04 decline-cluster exemplar (NP-009) AND an AP-03 approval exemplar (P7 persona). The distinction is whether compensators are present.

### For SA-05 (Sponsor Archetype Synthesizer)
- P7 (credit-scarred but cash-rich operator) persona is the most false-positive-exposed — must be designed to NOT trigger HEX-007/008/009 hard-stops. The persona's defining feature is *past-seasoning* + *present-cash-reserves*.
- P5 (foreign national) persona is the second-most false-positive-exposed — must NOT trigger HEX-010/011 hard-stops. The persona's defining feature is *preparedness* (US LLC formed + AML paper trail assembled + 60-90 day US bank seasoning).
- P6 (STR operator) persona must be geo-segmented to STR-permissive markets only (Part 5 FP-012). Nashville STR + NYC STR are NOT P6; Gatlinburg STR + Panama City Beach STR + Scottsdale STR are P6.

### For EG-06 (Edge-Case Gold Miner)
- The richest edge-case veins are: FP-005 (unpermitted ADU pivot), FP-006 (non-warrantable condo specialty), FP-007 (condotel specialty), FP-001 (post-seasoning credit-scarred), FP-011 (401k-reserves + co-borrower pivot). All are "shop the decline letter" patterns — high opportunity because competitors auto-reject.

---

## Part 7: Limitations & Honest Sample-Size Disclosure

1. **Sample size = 28 cases, 12 negative-or-marginal (43%).** Frequency rates in Part 2 are directional, not statistically robust. Real-world DSCR decline rates are likely higher because lender case-study publications skew toward approvals.
2. **17 of 28 cases are CF-01-synthesized** (all 7 declines + 2 of 5 approved-with-conditions are synthesized). Decline-cluster identification is therefore guideline-informed, not case-verified. Real-world decline patterns may include clusters not present in the synthesized sample (e.g., DTI-wall borrowers, undisclosed-LLC-issue borrowers, fraud-flag borrowers).
3. **No real declined case studies were harvested** because lender publications rarely document declines in detail. The 7 decline cases are reconstructed from published decline-reason taxonomies (AHLend, DSCR Authority, HonestCasa) applied to constructed borrower profiles.
4. **Hard-exclusion rule count (16)** exceeds the charter minimum of 8 because the swarm benefits from granular rule granularity — FF-08 can implement HEX-001 through HEX-016 as discrete form fields with discrete routing logic. AC-09 can craft per-rule redirect copy. TS-10 can apply per-rule score deltas.
5. **Soft-warning rule count (16)** is generous because the swarm benefits from layered yellow-flag logic. Multiple SWR flags stacking additively produces a more accurate lead-score than a single binary hard/soft distinction.
6. **False-positive risk patterns (15)** are critical to prevent over-filtering. The charter's "Audiences to Actively Repel" list is correct but must be applied narrowly — only HEX-001 (primary residence) + HEX-009 (active delinquency) + HEX-012 (below min loan) + HEX-013 (commercial use outside specialty) are truly permanent rejections. Everything else is recoverable or specialty-routable.
7. **Inferred patterns (`inferred: true`)** = NP-008, NP-009, NP-011, NP-012 + HEX-001 (universal but not case-observed) + HEX-010 through HEX-016 + SWR-014. These are guideline-derived, not case-verified.

---

*End of NP-04 deliverable. Downstream agents (FF-08, AC-09, TS-10, AP-03, SA-05, EG-06) should treat Part 1 as the canonical decline-cluster catalog, Part 3 as the canonical hard-exclusion rule set for FF-08 form design, Part 4 as the canonical TS-10 score-delta source, and Part 5 as the canonical over-filtering-prevention list.*
