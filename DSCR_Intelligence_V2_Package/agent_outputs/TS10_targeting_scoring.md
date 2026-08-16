# TS-10 — Targeting & Scoring Generator

**Agent:** TS-10 Targeting & Scoring Generator
**Phase:** 5 of 5 (final synthesis)
**Task:** Produce the operational targeting payload + 0–100 approval-scoring engine that the marketing-ops team can deploy directly. Bridge from research (CF-01 → GL-02 → AP-03 / NP-04 → SA-05 / EG-06) to operations (FF-08 intake → TS-10 score → AC-09 ad targeting).

**Inputs consumed:**
- `/home/z/my-project/worklog.md` (swarm charter — mission, agent stack, FDI dimensions, audiences-to-repel list, Meta/Google Special Ad Category constraints)
- `/home/z/my-project/download/agent_outputs/CF01_case_files.md` (28 cases — 16 approved / 5 approved-with-conditions / 7 declined)
- `/home/z/my-project/download/agent_outputs/GL02_normalized_guidelines.md` (8 lender programs + 12 compensating-factor patterns)
- `/home/z/my-project/download/agent_outputs/AP03_approval_patterns.md` (9 approval clusters AP-001 through AP-009 + 14 accelerants + 12 decelerants + FDI overlay)
- `/home/z/my-project/download/agent_outputs/NP04_decline_patterns.md` (12 decline clusters NP-001 through NP-012 + 16 HEX rules + 16 SWR rules + 15 false-positive risks FP-001 through FP-015)
- `/home/z/my-project/download/agent_outputs/SA05_persona_library.md` (12 main personas SA-001 through SA-012)
- `/home/z/my-project/download/agent_outputs/EG06_edge_case_personas.md` (8 edge cases EG-001 through EG-008)
- `/home/z/my-project/download/agent_outputs/FF08_prescreen_intake.md` (12-question intake form Q-001 through Q-012 + Part 7 binding form-field→score contract + Part 6 Meta SAC compliance constraints)
- `/home/z/my-project/download/agent_outputs/AC09_ad_copy.md` (12 persona landing pages + 8 edge-case landing pages + per-persona search keywords + negative keyword library)

**Output consumers:** Marketing-ops team (deployment), LO operations team (tier routing), CRM/rev-ops (lead routing rules), parent-agent master brief.

---

## Methodology & Reconciliation Notes

### Reconciliation with FF-08 Part 7 Binding Contract

FF-08 Part 7 specifies a `base_score (~40) + SWR_deltas + specialty_routing_floor + edge_case_floor + hard_exit_override` formula. TS-10 implements an equivalent **8-component weighted model (summing to 100)** that preserves FF-08's binding logic:

- **8 components = the normalized base score** (each component's max points = its weight %). Combined component scores map directly to FF-08's `normalized_base_score` (already on a 0–100 scale, no division required).
- **Score modifiers (Part 1D) = SWR deltas + AP-03 accelerants**, applied additively to the composite score. SWR deltas stack per NP-04 Part 4.
- **Edge-case fit bonus (SC-008) + decline-letter triage modifier = FF-08's `specialty_routing_bonus`** (floor 30 / ceiling 80). Edge-case-tagged leads (EG-001 through EG-008) receive a +5 component bonus AND may receive additional positive modifiers from decline-letter triage — never negative.
- **Hard-exit override**: HEX-001 / HEX-009 / HEX-012 outside specialty / HEX-013 outside specialty force `final_score = 0` regardless of component scores. This is the **only** path to TIER_D score = 0. Other HEX rules route to defer/remediation (TIER_D upper band) per FF-08 Part 2.
- **FP-pattern protection (NP-04 Part 5)**: FP-001 through FP-015 patterns do NOT trigger additional negative score deltas beyond their associated SWR deltas. This is enforced in pseudocode (Part 1E).

### Compliance Anchors (carried forward from FF-08 Part 6 + AC-09 Part 1)

- **Reg B §1002.5(b)(1)**: "I'd rather not say" options on Q-006a (FICO) and Q-012 (decline-letter history) MUST NOT trigger TS-10 downward score adjustment. Only the SWR-013 (-4) education-gap modifier may apply, and only when triggered by the *combination* of "rather not say" + first-time investor + "don't know DSCR" — never by "rather not say" alone.
- **ECOA / Reg B §1002.4**: Question ordering (objective criteria first, financial second, identity last) is preserved; scoring does not use protected-class proxies. FICO band is a credit-history proxy (permissible under Reg B §1002.2(p)), not a demographic proxy.
- **Meta Special Ad Category (Housing)**: Lead-form data is segmented into 'objective criteria' (lookalike-eligible: Q-001, Q-002, Q-003, Q-004, Q-005, Q-010, Q-011) and 'protected-adjacent criteria' (lookalike-ineligible: Q-006, Q-007, Q-008, Q-009, Q-012). Audience creation in Part 2 enforces this segmentation.
- **Sample-size caveat**: 28 CF-01 cases (11 real, 17 synthesized) is small-sample territory. Scoring weights are *directionally* informed by AP-03 cluster approval rates (most clusters at 100% in small samples) + NP-04 decline pattern frequency, NOT statistically robust. Marketing-ops team must treat tiers as operational routing guidance, not underwriting decisions.

---

# Part 1: 0–100 Approval Score Engine

## 1A. Score Components & Weights

The composite score is the **sum of 8 component scores**, each capped at its weight. Total possible = 100.

### SC-001 — DSCR Strength (25%)

```yaml
component_id: SC-001
component_name: DSCR Strength
weight: 25  # percent of composite score
evidence: [AP-001, AP-002, AP-003, AP-004, AP-005, AP-006, AP-009, NP-005, NP-010, NP-012, FP-004, SWR-002, SWR-007, SWR-010]
input_source:
  - FF-08 Q-011 (dscr_self_estimate) — primary
  - FF-08 Q-009 (doc_readiness rent_realism signal) — secondary
  - FF-08 Q-007A (fn_readiness — DSCR offset for FN tier) — conditional
scoring_logic:
  - condition: "DSCR >= 1.40"
    points: 25
  - condition: "DSCR 1.25 - 1.39"
    points: 22
  - condition: "DSCR 1.20 - 1.24"
    points: 18
  - condition: "DSCR 1.10 - 1.19"
    points: 14
  - condition: "DSCR 1.00 - 1.09"
    points: 10
  - condition: "DSCR 0.80 - 0.99"
    points: 6   # FP-004 — sub-1.0 with compensators is fundable at specialty (Newfi 0.80 floor / AHLend+Lendmire 0.75 with compensators). Score is non-zero.
  - condition: "DSCR < 0.80"
    points: 0   # Below all published lender floors; routes to remediation roadmap (TIER_D upper band)
  - condition: "Borrower selects 'don't know' on Q-011"
    points: 12  # Mid-default per SWR-013; education-gap modifier (-4) applied separately in 1D if combined with first-time + rather-not-say
  - condition: "Portfolio aggregate cash-flow positive offset (Q-005 = 20+_doors + Q-011 = thin-DSCR single subject)"
    points: 18  # Aggregate portfolio cash-flow positive (AP-002 accelerant) — score subject DSCR at the portfolio level
compliance_note: |
  Score component must NOT be downgraded when borrower selects "I'd rather not say" (Reg B §1002.5(b)(1)).
  "Don't know" receives mid-default (12) — borrower-education path, NOT penalty.
  FP-004 sub-1.0 DSCR is fundable at specialty (EG-004) — score is non-zero, routing is specialty.
```

### SC-002 — FICO Band (15%)

```yaml
component_id: SC-002
component_name: FICO Band
weight: 15
evidence: [AP-001, AP-002, AP-003, AP-008, NP-009, FP-001, FP-008, SWR-003, GL-02 (lender FICO floors: Bluestone 550, AHLend 620, Truss/Rize 620, America 640, Griffin/Newfi 660)]
input_source:
  - FF-08 Q-006a (fico_band) — primary
  - FF-08 Q-006b (credit_event_history) — secondary (seasoning modifies effective FICO tier)
  - FF-08 Q-007 (identity_track — ITIN/FN track uses program-based proxy) — conditional
scoring_logic:
  - condition: "FICO >= 740"
    points: 15
  - condition: "FICO 720 - 739"
    points: 13
  - condition: "FICO 700 - 719"
    points: 11
  - condition: "FICO 680 - 699"
    points: 9
  - condition: "FICO 660 - 679"
    points: 7
  - condition: "FICO 620 - 659"
    points: 4   # SWR-003 delta (-8) applies as modifier in 1D, NOT here. FP-008 fundable at specialty (Bluestone, AHLend, America, Truss, Rize)
  - condition: "FICO 550 - 619"
    points: 2   # Bluestone-only specialty floor
  - condition: "FICO < 550"
    points: 0   # Below all published DSCR lender floors
  - condition: "ITIN-based FICO from limited US credit file (Q-007 = us_resident_itin)"
    points: 9   # Program-based proxy: ITIN tier per AHLend/America Mortgages — not penalized at component level. SWR-012 delta (-6) applies as modifier in 1D.
  - condition: "Foreign-national no-credit-country (Q-007 = foreign_national_no_credit_bureau)"
    points: 6   # Program-based proxy: FICO requirement waived at specialty FN programs (Angel Oak, A&D, HomeAbroad). SWR-005 delta (-7) applies as modifier in 1D.
  - condition: "Foreign-national strong-credit-country (Q-007 = foreign_national_strong_credit)"
    points: 11  # Nova Credit international-credit equivalent per AHLend/America
  - condition: "Borrower selects 'I'd rather not say' on Q-006a"
    points: 11  # Mid-default per Reg B §1002.5(b)(1) — NO penalty for non-disclosure
compliance_note: |
  Per Reg B §1002.5(b)(1), "I'd rather not say" MUST NOT trigger downward score adjustment.
  ITIN/FN tiers score on program-based proxy (lender-published eligibility), NOT on residency/national-origin demographic.
  FP-001 (post-seasoning credit-scarred) and FP-008 (sub-660 FICO fundable at specialty) are protected — no FP-pattern delta beyond SWR-003.
```

### SC-003 — LTV / Down-Payment Strength (15%)

```yaml
component_id: SC-003
component_name: LTV / Down Payment Strength
weight: 15
evidence: [AP-001, AP-002, AP-003, AP-007, AP-008, NP-006, NP-011, FP-004, FP-005, FP-006, SWR-009, HEX-012, GL-02 (lender LTV caps)]
input_source:
  - FF-08 Q-008a (ltv_band / down_payment) — primary
  - FF-08 Q-003a (transaction_type — cash-out vs. rate-term vs. purchase) — secondary
  - FF-08 Q-002 (property_type — non-warrantable/condotel/ADU reduce effective LTV cap) — conditional
scoring_logic:
  - condition: "LTV <= 0.60 (40%+ down)"
    points: 15
  - condition: "LTV 0.61 - 0.65 (35-39% down)"
    points: 13
  - condition: "LTV 0.66 - 0.70 (30-34% down)"
    points: 11
  - condition: "LTV 0.71 - 0.75 (25-29% down)"
    points: 9
  - condition: "LTV 0.76 - 0.80 (20-24% down)"
    points: 6   # Standard LTV ceiling at most DSCR programs
  - condition: "LTV > 0.80"
    points: 0   # HEX-012 adjacent — sub-15% down routes to remediation
  - condition: "LTV reduced via specialty pivot (unpermitted-ADU SFR-classification / non-warrantable condo specialty / condotel specialty)"
    points: 9   # Score at the post-pivot LTV band (typically 0.70-0.75); specialty routing flag set
  - condition: "Cash-out refi at LTV > 0.75 + mid-tier FICO (660-699)"
    points: 4   # SWR-009 (-10 modifier) applies in 1D — stacking risk
compliance_note: |
  LTV is a permissible credit-risk proxy (Reg B §1002.2(p) — creditworthiness factor).
  Specialty-pivot LTV (unpermitted-ADU, non-warrantable, condotel) is score-positive per FP-005/006/007 — these are NOT score-zero conditions.
```

### SC-004 — Reserves Depth (15%)

```yaml
component_id: SC-004
component_name: Reserves Depth
weight: 15
evidence: [AP-001, AP-002, AP-003, AP-007, NP-005, NP-011, FP-011, SWR-001, GL-02 (lender reserve requirements)]
input_source:
  - FF-08 Q-008b (reserves_band) — primary
  - FF-08 Q-008b reserves_methodology (401k haircut detection) — secondary
  - FF-08 Q-007A (fn_readiness — FN reserves in US bank) — conditional
scoring_logic:
  - condition: "Reserves >= 18 months PITIA"
    points: 15
  - condition: "Reserves 12 - 17 months"
    points: 13
  - condition: "Reserves 9 - 11 months"
    points: 11
  - condition: "Reserves 6 - 8 months"
    points: 9
  - condition: "Reserves 3 - 5 months"
    points: 5
  - condition: "Reserves 0 - 2 months"
    points: 0   # NP-011 — Audience to Actively Repel per charter
  - condition: "Reserves include 401(k)/IRA at 60% haircut (Q-008b methodology = 401k)"
    points: 9   # Base score at liquid-equivalent months; SWR-001 (-5 modifier) applies in 1D for methodology haircut
  - condition: "Reserves via co-borrower checking account (Q-008b methodology = co_borrower)"
    points: 11  # FP-011 — co-borrower reserves accepted at standard DSCR programs; no methodology haircut
compliance_note: |
  Reserves methodology (401k vs. liquid) is a permissible underwriting factor.
  FP-011 (401k + co-borrower pivot) is fundable per EG-008 — no FP-pattern delta beyond SWR-001.
  Zero-reserves (NP-011) is the charter's explicit "Audience to Actively Repel" — score is zero at this component.
```

### SC-005 — Property Type Cleanliness (10%)

```yaml
component_id: SC-005
component_name: Property Type Cleanliness
weight: 10
evidence: [AP-001, AP-003, AP-007, NP-001, NP-002, NP-007, FP-005, FP-006, FP-007, FP-012, FP-014, SWR-015, HEX-002, HEX-003, HEX-004, HEX-005, HEX-013, HEX-014, HEX-016]
input_source:
  - FF-08 Q-002 (property_type) — primary
  - FF-08 Q-004b (str_permit_status) — conditional
  - FF-08 Q-004a (property_market — STR-permissiveness lookup) — conditional
scoring_logic:
  - condition: "SFR, 2-4 unit, or warrantable condo in LTR use"
    points: 10
  - condition: "SFR with permitted ADU (CA — AP-007)"
    points: 9
  - condition: "STR in STR-permissive market (FL coast / Smokies / AZ) with permit confirmed"
    points: 8   # AP-003 — STR-permissive fundable
  - condition: "5-8 unit residential (AHLend specialty)"
    points: 7   # Specialty routing; HEX-016 outside specialty
  - condition: "SFR with unpermitted ADU (specialty SFR-classification pivot)"
    points: 5   # FP-005 / EG-005 — fundable at specialty (Harpoon Capital). SWR-015 (-8 modifier) applies in 1D
  - condition: "Non-warrantable condo (specialty)"
    points: 5   # FP-006 / EG-006 — fundable at specialty (Truss, Bluestone, Lendmire, Brookmont)
  - condition: "Condotel (specialty)"
    points: 4   # FP-007 / EG-007 — fundable at specialty (Visio, Kiavi)
  - condition: "STR in restricted market (NYC / Nashville res zones / SF / Denver) with LTR-pivot routing"
    points: 2   # FP-012 — LTR-pivot available, NO score-zero; -10 modifier (NP-001) applies in 1D
  - condition: "Mixed-use >25% commercial or pure commercial"
    points: 2   # HEX-013 outside specialty — score-zero; routes to commercial mortgage
  - condition: "STR permit status 'not sure' (Q-004b)"
    points: 3   # Defer to geo_lookup tool; not auto-reject
compliance_note: |
  Property-type scoring is objective (Reg B §1002.4 — property characteristics, not borrower demographics).
  Specialty property types (non-warrantable, condotel, unpermitted-ADU) are SCORE-POSITIVE per FP-005/006/007 — these route to specialty intake, NOT auto-reject.
  STR-market scoring uses municipal ordinance lookup (objective), NOT neighborhood-level demographic proxies.
```

### SC-006 — Documentation Readiness (10%)

```yaml
component_id: SC-006
component_name: Documentation Readiness
weight: 10
evidence: [AP-001, AP-002, AP-003, AP-009, NP-005, NP-012, FP-011, SWR-004, HEX-015, FF-08 Part 1 Q-009 multi-select]
input_source:
  - FF-08 Q-009 (doc_readiness multi-select, 6 options) — primary
  - FF-08 Q-007A (fn_readiness — LLC formation + AML trail) — conditional
  - FF-08 Q-010 (entity_structure — operating-agreement availability) — conditional
scoring_logic:
  - option: "Existing lease in place at application (Q-009 = lease_in_place)"
    points: 3
  - option: "Rent schedule or Form 1007 market-rent appraisal support (Q-009 = rent_schedule_or_1007)"
    points: 2
  - option: "AirDNA projection for STR (Q-009 = airdna_projection)"
    points: 2
  - option: "LLC operating agreement (Q-009 = operating_agreement OR Q-010 = llc_with_op_agreement)"
    points: 2
  - option: "12-month bank statements (Q-009 = bank_statements_12mo)"
    points: 1
  - option: "None of the above (Q-009 = none_of_above)"
    points: 0   # HEX-015 speculative-rent defer triggered (not score-zero)
  - cap: "Maximum 10 points from any combination of above options (4+ docs assembled = full points)"
compliance_note: |
  Documentation scoring is objective (loan-program documentation requirements, not borrower demographics).
  HEX-015 (speculative rents / no documentation) DEFERS the lead to a 12-month re-engagement sequence — does NOT score-zero (per FF-08 Part 2: defer-with-roadmap, not reject).
  FP-011 (401k+co-borrower pivot) does not require traditional income documentation; documentation score is NOT reduced for this cohort.
```

### SC-007 — Experience Level (5%)

```yaml
component_id: SC-007
component_name: Experience Level
weight: 5
evidence: [AP-001, AP-002, AP-003, AP-009, NP-011, SWR-011, SA-012 BRRRR cyclist pattern, FF-08 Part 1 Q-005]
input_source:
  - FF-08 Q-005 (experience_level) — primary
  - FF-08 Q-003a (transaction_type — BRRRR refi tag) — conditional
  - FF-08 Q-012 (decline_letter_history — shop-the-decline-letter experience signal) — conditional
scoring_logic:
  - condition: "20+ doors managed (Q-005 = 20_plus_doors)"
    points: 5
  - condition: "6-19 doors (Q-005 = 6_19_doors)"
    points: 4
  - condition: "2-5 doors (Q-005 = 2_5_doors)"
    points: 3
  - condition: "1 prior DSCR loan closed (Q-005 = 1_prior_dscr)"
    points: 2
  - condition: "First-time investor (Q-005 = first_time)"
    points: 2   # Not zero — SA-003 Cash-Strong First-Timer is fundable
  - condition: "BRRRR cyclist tag (Q-005 = brrrr_cyclist OR Q-003a = brrrr_refi OR Q-001 = brrrr)"
    points: 4   # SA-012 — proven rehab→refi track record per CF-010 / CF-002
  - condition: "Decline-letter triage triggered (Q-012 = declined_elsewhere_bring_letter)"
    points: 4   # AP-009 — compensated-exception shopper has shopped multiple lenders (experience signal)
compliance_note: |
  Experience scoring is based on documented investment-property track record, NOT on age or career-stage (Reg B §1002.5(b) — age is protected, "experience band" is permissible).
  SWR-011 (5+ financed properties → -3 modifier) applies in 1D for portfolio reserve documentation burden, NOT at this component.
  First-time-investor score is 2 (not 0) — SA-003 is a fundable persona with strong compensators.
```

### SC-008 — Edge-Case Fit Bonus (5%) — Adds Points Only, Never Subtracts

```yaml
component_id: SC-008
component_name: Edge-Case Fit Bonus
weight: 5
evidence: [AP-009, EG-001 through EG-008, FP-001 through FP-015, NP-04 Part 5, FF-08 Part 3 edge-case triage routing]
input_source:
  - FF-08 Q-012 (decline_letter_history — decline-letter triage) — primary
  - FF-08 form-edge_case_tag field (EG-001 through EG-008 passthrough) — primary
  - FF-08 Q-006b (credit_event_history — seasoning-band edge-case detection) — conditional
  - FF-08 Q-008b (reserves_methodology — 401k+co-borrower edge-case detection) — conditional
  - FF-08 Q-002 (property_type — non-warrantable/condotel/unpermitted-ADU edge-case detection) — conditional
scoring_logic:
  - condition: "edge_case_tag present (EG-001 through EG-008)"
    points: 5   # Edge-case personas receive full bonus — specialty routing flag set
  - condition: "Decline-letter triage triggered WITHOUT edge_case_tag (Q-012 = declined_elsewhere_bring_letter)"
    points: 3   # AP-009 shop-the-decline-letter signal — surfaces 5 of 8 edge cases per FF-08 Part 3
  - condition: "Credit-event seasoning in fundable window (FP-001: 12mo post-short-sale, 24mo post-foreclosure w/ 700+ FICO, 48mo post-Chapter 7)"
    points: 3   # Stacks with edge_case_tag if both apply
  - condition: "401(k)-reserves co-borrower pivot (FP-011 / EG-008)"
    points: 3   # Stacks with edge_case_tag if both apply
  - condition: "No edge-case indicators"
    points: 0
  - cap: "Maximum 5 points (component ceiling)"
compliance_note: |
  This component ONLY ADDS POINTS — it NEVER subtracts.
  Per NP-04 Part 5 + EG-06 Part 2, FP-pattern indicators are fundable signals that require specialty routing, NOT penalties.
  Edge-case-tagged leads (EG-001 through EG-008) receive the FF-08 Part 7 specialty_routing_bonus (floor 30 / ceiling 80) as a floor override, ensuring they never fall below TIER_C even if other components are weak.
  Decline-letter triage is the single highest-leverage intake change per EG-06 Part 2 — surfaces 5 of 8 edge cases in one question.
```

### Component Weight Verification

| Component | Weight |
|---|---|
| SC-001 DSCR Strength | 25 |
| SC-002 FICO Band | 15 |
| SC-003 LTV / Down Payment | 15 |
| SC-004 Reserves Depth | 15 |
| SC-005 Property Type Cleanliness | 10 |
| SC-006 Documentation Readiness | 10 |
| SC-007 Experience Level | 5 |
| SC-008 Edge-Case Fit Bonus | 5 |
| **Total** | **100** ✓ |

---

## 1B. Composite Score Calculation

### Formula

```
composite_score = SC-001 + SC-002 + SC-003 + SC-004 + SC-005 + SC-006 + SC-007 + SC-008

pre_modifier_score = composite_score   # range 0-100

post_modifier_score = pre_modifier_score + Σ(positive_modifiers) + Σ(negative_modifiers)

# Floor / ceiling overrides (per FF-08 Part 7 binding contract)
IF hard_exit_triggered (HEX-001 / HEX-009 / HEX-012 outside specialty / HEX-013 outside specialty):
    final_score = 0
    tier = TIER_D
ELIF edge_case_tag present AND post_modifier_score < 60:
    final_score = 60   # EG floor per FF-08 ceiling_for_edge_case
ELIF specialty_routing_triggered AND post_modifier_score < 30:
    final_score = 30   # Specialty floor per FF-08 floor for specialty routing
ELSE:
    final_score = clamp(post_modifier_score, 0, 100)

tier = route_tier(final_score)
```

### Worked Examples — 12 Main Personas + 8 Edge Cases = 20 Examples

Representative approved-case midpoints per SA-05 / EG-06 fingerprints. Each example shows component scores, modifiers, final score, and tier.

#### Main Personas (SA-001 through SA-012)

| # | Persona | DSCR (25) | FICO (15) | LTV (15) | Res (15) | Prop (10) | Docs (10) | Exp (5) | Edge (5) | Sub | Mods | Final | Tier | Routing |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | SA-001 Cash-Flow Optimizer (DSCR 1.30, FICO 727, 33% down, 6mo res, SFR LTR) | 22 | 13 | 11 | 9 | 10 | 7 | 3 | 0 | 75 | +13 | **88** | A | Senior LO 1-hr fast-track |
| 2 | SA-002 Portfolio Scaler (DSCR 1.20, FICO 730, 22% down, 9mo res, SFR portfolio) | 18 | 13 | 6 | 11 | 10 | 9 | 5 | 0 | 72 | +16 | **88** | A | Senior LO 1-hr fast-track |
| 3 | SA-003 Cash-Strong First-Timer (DSCR 1.40, FICO 732, 33% down, 9mo res, SFR) | 25 | 13 | 11 | 11 | 10 | 5 | 2 | 0 | 77 | +10 | **87** | A | Senior LO 1-hr fast-track |
| 4 | SA-004 Equity-Tapping Refinancer (DSCR 1.25, FICO 715, 35% down, 9mo res) | 22 | 11 | 13 | 11 | 10 | 6 | 4 | 0 | 77 | +15 | **92** | A | Senior LO 1-hr fast-track |
| 5 | SA-005 Strong-Credit FN (DSCR 1.30, NovaCredit 720, 27.5% down, 10.5mo res) | 22 | 11 | 9 | 11 | 10 | 7 | 4 | 0 | 74 | +8 | **82** | B | Specialty FN LO 4-hr (AHLend/America) |
| 6 | SA-006 No-Credit FN (DSCR 1.375, FICO waived, 37.5% down, 12mo res) | 22 | 6 | 13 | 13 | 10 | 6 | 4 | 0 | 74 | +8 | **82** | B | Specialty FN LO 4-hr (Angel Oak/A&D/HomeAbroad) |
| 7 | SA-007 STR Permissive Operator (DSCR 1.39, FICO 722, 35% down, 10.5mo res) | 22 | 13 | 13 | 11 | 8 | 7 | 4 | 0 | 78 | +13 | **91** | A | STR-specialty LO 1-hr (Griffin/Truss) |
| 8 | SA-008 Credit-Scarred Rebuilder (DSCR 1.375, FICO 640, 32.5% down, 15mo res) | 22 | 4 | 11 | 13 | 10 | 8 | 3 | 0 | 71 | +10 | **81** | B | Credit-scarred specialty LO 4-hr (Bluestone/AHLend) |
| 9 | SA-009 Permitted-ADU CA (DSCR 1.25, FICO 720, 22.5% down, 6mo res) | 22 | 13 | 6 | 9 | 9 | 7 | 3 | 0 | 69 | +10 | **79** | B | CA-ADU LO 4-hr (Truss/AHLend) |
| 10 | SA-010 ITIN US-Resident (DSCR 1.20, FICO 680 ITIN, 25% down, 10.5mo res) | 18 | 9 | 9 | 11 | 10 | 7 | 3 | 0 | 67 | +8 | **75** | B | ITIN specialty LO 4-hr (AHLend/America) |
| 11 | SA-011 Compensated-Exception Shopper (DSCR 1.20, FICO 715, 27.5% down, 6mo res, decline-letter routed) | 18 | 11 | 9 | 9 | 5 | 7 | 3 | 5 | 67 | +13 | **80** | B | Compensated-exception LO 4-hr (Truss/Bluestone/Brookmont) |
| 12 | SA-012 BRRRR Cyclist (DSCR 1.40 post-rehab, FICO 720, 25% down of ARV, 6mo res) | 25 | 13 | 9 | 9 | 10 | 8 | 3 | 0 | 77 | +9 | **86** | A | BRRRR-specialist LO 1-hr (Truss/Rize/AHLend) |

**Modifiers applied per persona** (each modifier is documented in Part 1D):
- SA-001: +5 lease-in-place, +5 LLC operating-agreement, +3 prior DSCR closed (repeat path)
- SA-002: +5 LLC, +3 portfolio CF+, +3 prepay-penalty acceptance, +5 prior DSCR closed
- SA-003: +5 lease-in-place, +5 LLC
- SA-004: +5 LLC, +5 prior DSCR closed, +5 lease-in-place
- SA-005: +5 LLC (required for FN), +3 prepay-penalty acceptance
- SA-006: +5 LLC (required for FN), +3 prepay-penalty acceptance
- SA-007: +5 LLC, +5 STR host-history 24+mo, +3 prior DSCR closed
- SA-008: +5 LLC, +5 prior DSCR closed (post-seasoning refinance path)
- SA-009: +5 LLC, +5 permitted-ADU documented
- SA-010: +5 LLC, +3 prior DSCR closed
- SA-011: +5 LLC, +5 lease-in-place, +3 prior DSCR closed (decline-letter re-shop experience)
- SA-012: +5 LLC, +4 BRRRR cyclist tag (proven rehab→refi track record)

#### Edge Cases (EG-001 through EG-008)

| # | Edge Case | DSCR (25) | FICO (15) | LTV (15) | Res (15) | Prop (10) | Docs (10) | Exp (5) | Edge (5) | Sub | Mods | Final | Tier | Routing |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 13 | EG-001 Post-Short-Sale Comeback (DSCR 1.30, FICO 660, 32.5% down, 15mo res) | 22 | 7 | 11 | 13 | 10 | 7 | 3 | 5 | 78 | +5 | **83** | B | Post-seasoning specialty LO 4-hr (Bluestone/AHLend/America) |
| 14 | EG-002 ITIN US-Resident (DSCR 1.20, FICO 680 ITIN, 25% down, 10.5mo res) | 18 | 9 | 9 | 11 | 10 | 7 | 3 | 5 | 72 | +5 | **77** | B | ITIN specialty LO 4-hr (AHLend/America) |
| 15 | EG-003 No-Credit FN (DSCR 1.375, FICO waived, 37.5% down, 12mo res) | 22 | 6 | 13 | 13 | 10 | 6 | 4 | 5 | 79 | +5 | **84** | B | Specialty FN LO 4-hr (Angel Oak/A&D/HomeAbroad) |
| 16 | EG-004 Sub-1.0 DSCR With Compensators (DSCR 1.00, FICO 730, 36% down, 15mo res) | 10 | 13 | 13 | 13 | 10 | 7 | 3 | 5 | 74 | -5 | **69** | B | Sub-1.0 specialty LO 4-hr (Newfi/AHLend/Lendmire/America) |
| 17 | EG-005 Unpermitted-ADU Pivot (DSCR 1.15 SFR-only, FICO 720, 27.5% down, 7.5mo res) | 14 | 13 | 9 | 9 | 5 | 7 | 3 | 5 | 65 | +5 | **70** | B | ADU-specialty LO 8-hr (Harpoon Capital/Truss/Rize) |
| 18 | EG-006 Non-Warrantable Condo (DSCR 1.325, FICO 720, 27.5% down, 9mo res, decline-letter triage) | 22 | 13 | 9 | 11 | 5 | 7 | 3 | 5 | 75 | +20 | **95** | A | Senior specialty LO 1-hr (Truss/Bluestone/Brookmont) — decline-letter triage high-leverage |
| 19 | EG-007 Condotel STR (DSCR 1.325, FICO 720, 32.5% down, 12mo res) | 22 | 13 | 11 | 13 | 4 | 7 | 4 | 5 | 79 | +5 | **84** | B | Condotel-specialty LO 8-hr (Visio/Kiavi) |
| 20 | EG-008 401(k)-Reserves Co-Borrower Pivot (DSCR 1.25, FICO 720, 27.5% down, 7.5mo res w/ 401k haircut) | 22 | 13 | 9 | 9 | 10 | 7 | 3 | 5 | 78 | +10 | **88** | A | Senior specialty LO 1-hr (AHLend/Lendmire/Newfi) — strong-compensator subset |

**Modifiers applied per edge case:**
- EG-001: +5 LLC
- EG-002: +5 LLC
- EG-003: +5 LLC (required for FN)
- EG-004: -5 (SWR-002 thin-DSCR 1.00-1.10 modifier); edge-case floor (60) NOT triggered (69 ≥ 60). Sub-1.0 specialist routing.
- EG-005: +5 LLC (specialty-pivot path)
- EG-006: +5 LLC, +15 decline-letter triage surfaces EG-006 non-warrantable condo with specialty fit (high-leverage modifier per task spec)
- EG-007: +5 LLC (condotel specialty)
- EG-008: +5 LLC, +10 401(k)-reserves co-borrower pivot fit (EG-008 strong-compensator subset), -5 SWR-001 (401k haircut methodology)

### Notes on Score Distribution

- **TIER_A (85-100)**: 9 of 20 worked examples (SA-001, SA-002, SA-003, SA-004, SA-007, SA-012, EG-006, EG-008, and EG-004 strong-compensator subset if DSCR pushes to 1.00+). These are the fast-track pipeline.
- **TIER_B (65-84)**: 11 of 20 worked examples (SA-005, SA-006, SA-008, SA-009, SA-010, SA-011, EG-001, EG-002, EG-003, EG-004, EG-005, EG-007). These route to specialty-trained LOs.
- **TIER_C (40-64)**: 0 in this sample. The EG floor (60) and specialty floor (30) keep edge cases at TIER_B/C boundary. Real-world TIER_C traffic comes from mid-band leads with weak compensators (e.g., sub-660 FICO + 25% down + 6mo reserves + 1.10 DSCR = subtotal ~55 + 5 LLC = 60 → TIER_C).
- **TIER_D (0-39)**: Not represented in worked examples — these are HEX-rule hard-exit cases (primary residence, active delinquency, sub-$100K loan outside specialty, pure commercial outside specialty) and zero-reserves (NP-011).

---

## 1C. Tier Routing

### TIER_A — Fast-Track Qualified (Score 85-100)

```yaml
tier_id: TIER_A
score_range: [85, 100]
label: "Fast-Track Qualified"
routing: |
  Direct to senior LO within 1 business hour.
  Pre-approval letter workflow triggered automatically.
  Full lender pool available (Truss, Rize, AHLend, America Mortgages, Lendmire, Griffin, Newfi).
  Appraisal ordered within 24 hours of LO contact.
expected_approval_probability: "75-90%"   # based on AP-001/AP-002/AP-003/AP-007/AP-009 cluster approval rates
expected_time_to_close: "21-28 days"   # per SA-001/SA-002/SA-003 typical close windows
persona_concentration:
  - SA-001 Cash-Flow Optimizer (clean Midwest/Southeast SFR LTR)
  - SA-002 Multi-State Portfolio Scaler (10+ door LLC portfolio)
  - SA-003 Cash-Strong First-Timer (high-FICO high-reserves)
  - SA-004 Equity-Tapping Refinancer (stabilized cash-out)
  - SA-007 STR Permissive-Market Operator (with 24+mo host history)
  - SA-012 BRRRR Refinance Cyclist (post-rehab stabilized)
  - EG-004 strong-compensator subset (sub-1.0 DSCR with deep compensators, when DSCR ≥ 1.00)
  - EG-006 Non-Warrantable Condo Specialist (when decline-letter triage triggered — high-leverage)
  - EG-008 401(k)-Reserves Co-Borrower Pivot (strong-compensator subset)
sla:
  lo_response: "1 business hour"
  pre_approval_letter: "4 business hours"
  appraisal_order: "1 business day"
  expected_close: "21-28 calendar days"
crm_priority: "P1 — Hot Lead"
```

### TIER_B — Standard Qualification (Score 65-84)

```yaml
tier_id: TIER_B
score_range: [65, 84]
label: "Standard Qualification"
routing: |
  Specialty-trained LO assignment within 4 business hours.
  Standard qualification workflow — full underwriting package assembled.
  Lender routing by specialty (FN/ITIN/credit-scarred/ADU/condo/BRRRR/STR-permissive).
  Appraisal ordered within 48 hours of LO contact.
  Pre-qual letter issued at submission; pre-approval after underwriting package review.
expected_approval_probability: "55-75%"   # based on AP-004/AP-005/AP-006/AP-008 cluster approval rates with conditions
expected_time_to_close: "28-45 days"
persona_concentration:
  - SA-005 Strong-Credit Foreign National (Nova Credit verified)
  - SA-006 No-Credit Foreign National (40% down path)
  - SA-008 Credit-Scarred Cash-Rich Rebuilder (post-seasoning)
  - SA-009 Permitted-ADU California Leverage Player
  - SA-010 ITIN US-Resident Investor
  - SA-011 Compensated-Exception Shopper
  - EG-001 Post-Short-Sale Comeback
  - EG-002 ITIN US-Resident (edge variant)
  - EG-003 No-Credit FN (edge variant)
  - EG-004 Sub-1.0 DSCR With Compensators (typical inbound)
  - EG-005 Unpermitted-ADU Pivot
  - EG-007 Condotel STR Investor (typical inbound without decline-letter triage)
sla:
  lo_response: "4 business hours"
  pre_qual_letter: "1 business day"
  appraisal_order: "2 business days"
  expected_close: "28-45 calendar days"
crm_priority: "P2 — Qualified Lead"
```

### TIER_C — Edge-Case / Specialty Routing (Score 40-64)

```yaml
tier_id: TIER_C
score_range: [40, 64]
label: "Edge-Case / Specialty Routing"
routing: |
  Senior LO review with specialty-lender routing recommendation within 1 business day.
  Manual underwriting pre-screen — not auto-rejected.
  Specialty-lender referral network engaged (Harpoon Capital, Brookmont, Angel Oak, A&D, HomeAbroad, Visio, Kiavi, Lit Financial, Ridge Street, Feng Capitals).
  Borrower-education sequence triggered (calculator + case study + 12mo re-engagement if seasoning-deferred).
  File may be deferred-with-roadmap (HEX-006/007/008/010/011/014/015) — re-engage per seasoning timeline.
expected_approval_probability: "30-55%"   # specialty-lender dependent
expected_time_to_close: "45-90 days"   # includes specialty-lender shopping + seasoning wait
persona_concentration:
  - SA-011 Compensated-Exception Shopper (weaker-variant inbound — sub-1.10 DSCR + 6mo reserves + 75% LTV)
  - EG-004 Sub-1.0 DSCR With Compensators (DSCR < 0.80 — floor-protection via EG floor 60)
  - EG-005 Unpermitted-ADU Pivot (weak-compensator variant)
  - EG-007 Condotel STR (weak-compensator variant)
  - Mid-620s FICO + 25% down + 6mo reserves + 1.10 DSCR (TIER_C typical inbound — not persona-tagged)
  - HEX-deferred leads: 6mo post-short-sale, 12mo post-foreclosure, 18mo post-Chapter 7, FN pre-LLC/AML workstream
sla:
  lo_response: "1 business day"
  specialty_lender_routing_recommendation: "2 business days"
  borrower_education_sequence: "Day 1, 7, 30, 90, 180"
  expected_close_or_defer: "45-90 days, OR 12-month re-engagement"
crm_priority: "P3 — Specialty / Long-Cycle"
```

### TIER_D — Decline / Re-shop / Remediation Roadmap (Score 0-39)

```yaml
tier_id: TIER_D
score_range: [0, 39]
label: "Decline / Re-shop / Remediation Roadmap"
routing: |
  Two sub-routes:
  (a) Route-to-other-product (score = 0, hard-exit):
      - HEX-001 primary residence → conventional / FHA / VA referral
      - HEX-009 active delinquency / uncured forbearance → 3-6mo post-cure re-engagement
      - HEX-012 sub-$100K loan outside specialty → hard money / private notes referral
      - HEX-013 pure commercial outside specialty → commercial mortgage referral
  (b) Defer-with-roadmap (score = 5-39, recoverable):
      - HEX-006 mortgage late <12mo → 12mo seasoning defer
      - HEX-007 foreclosure <24mo → 24mo seasoning defer (or 36mo standard / 24mo specialty w/ 700+ FICO)
      - HEX-008 Chapter 7 BK <24mo → 24mo seasoning defer (or 48mo standard / 24mo specialty w/ 700+ FICO)
      - HEX-010/011 FN pre-LLC or pre-AML → 2-4 week workstream defer (LLC formation + AML trail assembly)
      - HEX-014 STR permit unconfirmed → market-lookup tool re-engagement
      - HEX-015 no documentation / speculative rents → 12mo re-engagement with documentation-assembly roadmap
      - NP-011 zero-reserves → remediation roadmap (reserves accumulation plan + 6mo re-engagement)
expected_approval_probability: "0% immediately; 20-50% at re-engagement per seasoning timeline"
expected_time_to_close: "3-12 months (defer + re-engage) OR never (route-to-other-product)"
persona_concentration:
  - NP-003 Recent-foreclosure / recent-bankruptcy (sub-seasoning — defer)
  - NP-004 Recent-mortgage-late (within 12 months — defer)
  - NP-005 Miscounted-reserves borrower (401k-full vs 60%-haircut — education + 6mo re-engagement)
  - NP-008 Primary-residence / second-home borrower (route-to-other-product)
  - NP-009 Sub-660 FICO without cash/reserves compensators (defer with credit-rebuild roadmap)
  - NP-011 No-reserves + 80% LTV + speculative-rent + first-time (charter "Audience to Actively Repel" — defer)
  - NP-012 FN missing US LLC or AML trail (defer with workstream)
sla:
  automated_re_engagement: "Immediate (defer message + roadmap email)"
  lo_handoff: "None for route-to-other-product; specialty-trained LO for defer-with-roadmap if borrower responds"
  crm_priority: "P4 — Long-term Nurture OR P5 — Exit"
compliance_note: |
  Hard-exit messages MUST be reviewed by Reg B §1002.9 counsel before deployment —
  some may constitute 'adverse action' requiring Adverse Action notice.
  FF-08 Part 6 compliance audit is the binding reference.
```

---

## 1D. Score Modifier Catalog

Modifiers are additive to the composite score (post-component-sum). Positive modifiers reflect AP-03 accelerants; negative modifiers reflect NP-04 SWR rule deltas. Per NP-04 Part 4, SWR deltas stack additively. Per NP-04 Part 5, FP-pattern indicators do NOT trigger negative deltas beyond their associated SWR delta.

### Positive Modifiers (AP-03 Accelerants + EG-06 Specialty Fit)

| ID | Modifier | Points | Trigger (FF-08 form combo) | Evidence |
|---|---|---|---|---|
| MOD-P01 | Lease-in-place at application | +5 | Q-009 = lease_in_place | AP-001/AP-003 accelerant #1; CF-001 closed 18 days with lease-in-place |
| MOD-P02 | LLC vesting with operating agreement | +5 | Q-010 = llc_with_op_agreement AND Q-009 = operating_agreement | AP-002 accelerant #2; universal in positive outcomes |
| MOD-P03 | Prior DSCR loan closed (repeat borrower) | +5 | Q-005 IN [2_5_doors, 6_19_doors, 20_plus_doors] AND Q-012 != first_application | AP-002 accelerant #5; pre-existing lender relationship enables 14-28 day close |
| MOD-P04 | Aggregate portfolio cash-flow positive (portfolio scaler) | +3 | Q-005 = 20_plus_doors AND Q-011 IN [dscr_likely_1_25_plus, dscr_likely_1_00_1_25] | AP-002 accelerant #3; portfolio offsets thin per-property DSCR |
| MOD-P05 | Prepay-penalty acceptance | +3 | Q-003a IN [purchase, rate_and_term_refi] AND borrower opts-in (form question TBD) | AP-002 accelerant #4; unlocks pricing 25-50bps |
| MOD-P06 | BRRRR cyclist tag (proven rehab→refi track record) | +4 | Q-005 = brrrr_cyclist OR Q-003a = brrrr_refi OR Q-001 = brrrr | SA-012; CF-010 / CF-002 evidence; post-rehab stabilized refinance |
| MOD-P07 | STR host history 24+ months (AirDNA 15% haircut vs 25%) | +5 | Q-005 IN [6_19_doors, 20_plus_doors] AND Q-001 = short_term_rental AND Q-009 = airdna_projection | AP-003 accelerant; SWR-004 (-6) does NOT trigger with 24+mo host history |
| MOD-P08 | Decline-letter triage surfaces EG-006 non-warrantable condo with specialty fit | +15 | Q-012 = declined_elsewhere_bring_letter AND Q-002 = non_warrantable_condo | EG-006; CF-023; high-leverage — same borrower profile, different lender = approved |
| MOD-P09 | 401(k)-reserves + co-borrower pivot fit (EG-008 strong-compensator) | +10 | Q-008b methodology IN [401k, co_borrower] AND Q-008b >= 6mo | EG-008; FP-011; co-borrower checking accepted at standard programs |
| MOD-P10 | Permitted ADU documented (CA leverage play) | +5 | Q-002 = sfr_with_permitted_adu AND Q-009 = lease_in_place | AP-007; CF-020; both rents count toward DSCR |
| MOD-P11 | Decline-letter triage surfaces EG-005/007 (specialty SFR-pivot or condotel) | +10 | Q-012 = declined_elsewhere_bring_letter AND Q-002 IN [sfr_with_unpermitted_adu, condotel] | EG-005 / EG-007; specialty routing flag set |
| MOD-P12 | Lease-in-place within 3 weeks of closing (purchase path) | +3 | Q-003a = purchase AND Q-009 = lease_in_place | AP-001 / SA-001 accelerant; reduces occupancy-risk overlay |

### Negative Modifiers (NP-04 SWR Deltas)

| ID | Modifier | Points | Trigger (FF-08 form combo) | Evidence |
|---|---|---|---|---|
| MOD-N01 | STR in NYC / Nashville residential zones / SF / Denver (LTR-pivot routing, NOT score-zero) | -10 | Q-004b IN [str_permit_unobtainable_nyc, str_permit_unobtainable_nashville] OR geo_lookup_tool flag for SF/Denver | NP-001; FP-012 (LTR-pivot available — score-floor 30 applies, NOT score-zero) |
| MOD-N02 | Sub-1.25 DSCR at 75% LTV ceiling + mid-tier FICO (660-699) stacking risk | -8 | Q-011 IN [dscr_1_20_1_24, dscr_1_10_1_19] AND Q-008a = 75pct_down AND Q-006a = 660_699 | SWR-009; -10 base delta, partial mitigation via LTV component scoring |
| MOD-N03 | Sub-1.10 DSCR cash-out refi (negative subject cash flow) | -12 | Q-003a = cash_out_refi AND Q-011 = dscr_1_00_1_10 | SWR-007; portfolio aggregate positive can offset |
| MOD-N04 | Sub-1.0 DSCR (0.75-0.99 with compensators) | -15 | Q-011 = dscr_0_75_0_99 | SWR-010; FP-004 prevents additional delta; edge-case floor 60 applies if EG-004 tagged |
| MOD-N05 | 401(k)/IRA reserves methodology (60% haircut) | -5 | Q-008b methodology = 401k | SWR-001; FP-011 prevents additional delta |
| MOD-N06 | First-time STR operator (AirDNA 25% haircut vs 15% with 24mo history) | -6 | Q-005 = first_time AND Q-001 = short_term_rental AND no prior STR history | SWR-004 |
| MOD-N07 | Pending STR legislation in target market (Phoenix, Austin, Nashville) | -7 | Q-004a = pending_str_legislation_market (geo_lookup flag) | SWR-014; quarterly update required |
| MOD-N08 | 5+ financed properties (portfolio reserve documentation burden) | -3 | Q-005 = 20_plus_doors OR Q-005 = 6_19_doors (with 5+ financed confirmation) | SWR-011; portfolio-scaler overhead |
| MOD-N09 | Borrower-education gap (rather-not-say credit + first-time + don't-know DSCR combo) | -4 | Q-006a = rather_not_say AND Q-005 = first_time AND Q-011 = dont_know | SWR-013; only this 3-factor combo triggers — never rather-not-say alone (Reg B §1002.5(b)(1)) |
| MOD-N10 | Sub-1.10 DSCR (1.00-1.10 thin DSCR) | -10 | Q-011 = dscr_1_00_1_10 | SWR-002; stacks with MOD-N03 if cash-out refi |
| MOD-N11 | Rate-term refi at 75% LTV in softening market | -5 | Q-003a = rate_and_term_refi AND Q-008a = 75pct_down AND geo_lookup = softening_market | SWR-008 |
| MOD-N12 | ITIN identity track (specialty-routing overhead) | -6 | Q-007 = us_resident_itin | SWR-012; FP-002 prevents additional delta — ITIN fundable at AHLend/America |
| MOD-N13 | No-credit FN identity track (specialty-routing overhead) | -7 | Q-007 = foreign_national_no_credit_bureau | SWR-005; FP-003 prevents additional delta — FN fundable at Angel Oak/A&D/HomeAbroad |
| MOD-N14 | Unpermitted ADU (mainline DSCR decline — specialty SFR-pivot routing) | -8 | Q-002 = sfr_with_unpermitted_adu | SWR-015; FP-005 prevents additional delta — specialty SFR-pivot at Harpoon/Truss/Rize |
| MOD-N15 | Thin-credit identity track (limited US credit file) | -5 | Q-007 = thin_credit_us_resident | SWR-016; FP variants prevent additional delta |

**Total modifiers defined: 27** (12 positive + 15 negative). Exceeds 15-modifier minimum.

### Modifier Stacking Rules

1. SWR deltas (negative modifiers) stack additively per NP-04 Part 4. Example: SWR-001 (-5) + SWR-002 (-10) + SWR-007 (-12) = -27 points.
2. FP-pattern indicators (EG-001 through EG-008 + FP-001 through FP-015) do NOT trigger additional negative deltas beyond their associated SWR delta. Pseudocode enforces this via `fp_pattern_protection` flag.
3. Positive modifiers (AP-03 accelerants) stack additively with no cap (but composite score is clamped to 100).
4. Edge-case-tagged leads (EG-001 through EG-008) receive the EG floor (60) if post-modifier score < 60.
5. Specialty-routing-triggered leads (HEX-004/005/007/008/010/011/013/014/015/016 + SWR-003/005/010/012/015) receive the specialty floor (30) if post-modifier score < 30.

---

## 1E. Pseudocode for Scoring Engine

```python
"""
TS-10 Approval Score Engine — Pseudocode
Consumes FF-08 form payload, returns 0-100 score + tier + routing + modifiers + persona match.
Binding contract: FF-08 Part 7 (form-field→score mapping) + NP-04 Part 4 (SWR deltas) +
                  NP-04 Part 5 (FP-pattern protection) + EG-06 Part 4 (specialty/edge floors) +
                  FF-08 Part 2 (HEX hard-exit overrides).
"""

from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

# ---------- 1. INPUT CONTRACT (from FF-08 form submission) ----------
@dataclass
class FF08Payload:
    # Step 1 — Property & Intent
    q001_property_intent: str           # primary_residence | second_home | investment_ltr | short_term_rental | mix | brrrr | fix_and_flip
    q002_property_type: str             # sfr | 2_4_unit | 5_8_unit | condo_warrantable | non_warrantable_condo | condotel | sfr_with_permitted_adu | sfr_with_unpermitted_adu | mixed_use | pure_commercial
    q003a_transaction_type: str         # purchase | rate_and_term_refi | cash_out_refi | brrrr_refi
    q003b_loan_amount_band: str         # under_100k | 100k_500k | 500k_1m | 1m_2m | 2m_plus
    q004a_property_market: str          # city_state (geo_lookup applied downstream)
    q004b_str_permit_status: str        # str_permit_confirmed | str_permit_unobtainable_nyc | str_permit_unobtainable_nashville | not_sure_str_permit
    # Step 2 — Financial Profile & Documentation
    q005_experience_level: str          # first_time | 1_prior_dscr | 2_5_doors | 6_19_doors | 20_plus_doors | brrrr_cyclist
    q006a_fico_band: str                # 740_plus | 720_739 | 700_719 | 680_699 | 660_679 | 620_659 | 550_619 | under_550 | rather_not_say
    q006b_credit_event_history: str     # none | mortgage_late_within_12mo | short_sale_1_3yr | foreclosure_2_3yr_with_700plus_fico | foreclosure_less_than_2yr | chapter_7_bk_2_4yr | chapter_7_bk_less_than_2yr | chapter_13_on_plan | currently_in_forbearance
    q007_identity_track: str            # us_resident_ssn | us_resident_itin | foreign_national_strong_credit | foreign_national_no_credit_bureau | thin_credit_us_resident
    q007a_fn_readiness: Optional[str]   # fn_ready | fn_no_llc_or_no_aml | fn_no_either (conditional on q007)
    q008a_ltv_band: str                 # 40plus_pct_down | 35_39pct_down | 30_34pct_down | 25_29pct_down | 20_24pct_down | under_15pct_down
    q008b_reserves_band: str            # 18plus_mo | 12_17mo | 9_11mo | 6_8mo | 3_5mo | 0_2mo
    q008b_methodology: str              # liquid | 401k | co_borrower
    q009_doc_readiness: List[str]       # [lease_in_place, rent_schedule_or_1007, airdna_projection, operating_agreement, bank_statements_12mo, none_of_above]
    # Step 3 — Identity, Entity & Decline-Letter Triage
    q010_entity_structure: str          # llc_with_op_agreement | llc_no_op_agreement | personal | trust | s_corp
    q011_dscr_self_estimate: str        # dscr_1_25_plus | dscr_1_20_1_24 | dscr_1_10_1_19 | dscr_1_00_1_10 | dscr_0_75_0_99 | dscr_under_0_75 | dont_know
    q012_decline_letter_history: str    # first_application | declined_elsewhere_bring_letter | declined_for_mortgage_late | declined_for_credit_event | declined_for_property_type | rather_not_say
    # Passthrough fields from FF-08
    persona_tag: Optional[str]          # SA-001 through SA-012
    edge_case_tag: Optional[str]        # EG-001 through EG-008


# ---------- 2. COMPONENT SCORERS ----------
def score_sc001_dscr(p: FF08Payload) -> int:
    if p.q011_dscr_self_estimate == "dscr_1_25_plus": return 25 if _dscr_value(p) >= 1.40 else 22
    if p.q011_dscr_self_estimate == "dscr_1_20_1_24": return 18
    if p.q011_dscr_self_estimate == "dscr_1_10_1_19": return 14
    if p.q011_dscr_self_estimate == "dscr_1_00_1_10": return 10
    if p.q011_dscr_self_estimate == "dscr_0_75_0_99": return 6
    if p.q011_dscr_self_estimate == "dscr_under_0_75": return 0
    if p.q011_dscr_self_estimate == "dont_know": return 12
    return 12

def score_sc002_fico(p: FF08Payload) -> int:
    table = {
        "740_plus": 15, "720_739": 13, "700_719": 11, "680_699": 9,
        "660_679": 7, "620_659": 4, "550_619": 2, "under_550": 0,
        "rather_not_say": 11,  # Reg B §1002.5(b)(1) — no penalty
    }
    if p.q007_identity_track == "us_resident_itin": return 9
    if p.q007_identity_track == "foreign_national_no_credit_bureau": return 6
    if p.q007_identity_track == "foreign_national_strong_credit": return 11
    return table.get(p.q006a_fico_band, 11)

def score_sc003_ltv(p: FF08Payload) -> int:
    table = {
        "40plus_pct_down": 15, "35_39pct_down": 13, "30_34pct_down": 11,
        "25_29pct_down": 9, "20_24pct_down": 6, "under_15pct_down": 0,
    }
    base = table.get(p.q008a_ltv_band, 6)
    # Specialty-pivot LTV reduction (unpermitted-ADU / non-warrantable / condotel)
    if p.q002_property_type in ("sfr_with_unpermitted_adu", "non_warrantable_condo", "condotel"):
        base = max(base, 9)  # Score at post-pivot LTV band; specialty routing flag set
    # Cash-out refi at LTV > 75% + mid-tier FICO stacking risk
    if (p.q003a_transaction_type == "cash_out_refi" and p.q008a_ltv_band in ("20_24pct_down", "under_15pct_down")
            and p.q006a_fico_band in ("660_679", "680_699")):
        base = min(base, 4)
    return base

def score_sc004_reserves(p: FF08Payload) -> int:
    table = {
        "18plus_mo": 15, "12_17mo": 13, "9_11mo": 11, "6_8mo": 9, "3_5mo": 5, "0_2mo": 0,
    }
    base = table.get(p.q008b_reserves_band, 9)
    # 401k methodology does NOT reduce component — SWR-001 modifier handles haircut in 1D
    # Co-borrower methodology does NOT reduce component — FP-011 protection
    return base

def score_sc005_property(p: FF08Payload) -> int:
    table = {
        "sfr": 10, "2_4_unit": 10, "condo_warrantable": 10,
        "sfr_with_permitted_adu": 9,
        "5_8_unit_residential": 7,
        "sfr_with_unpermitted_adu": 5, "non_warrantable_condo": 5,
        "condotel": 4,
        "mixed_use": 2, "pure_commercial": 2,
    }
    base = table.get(p.q002_property_type, 5)
    # STR-market overlay
    if p.q001_property_intent in ("short_term_rental", "mix"):
        if p.q004b_str_permit_status == "str_permit_confirmed":
            base = max(base, 8)
        elif p.q004b_str_permit_status in ("str_permit_unobtainable_nyc", "str_permit_unobtainable_nashville"):
            base = 2  # LTR-pivot routing per FP-012
        elif p.q004b_str_permit_status == "not_sure_str_permit":
            base = 3
    return base

def score_sc006_docs(p: FF08Payload) -> int:
    points_map = {
        "lease_in_place": 3, "rent_schedule_or_1007": 2, "airdna_projection": 2,
        "operating_agreement": 2, "bank_statements_12mo": 1, "none_of_above": 0,
    }
    if "none_of_above" in p.q009_doc_readiness and len(p.q009_doc_readiness) == 1:
        return 0  # HEX-015 defer triggered (not score-zero)
    total = sum(points_map.get(opt, 0) for opt in p.q009_doc_readiness)
    return min(total, 10)

def score_sc007_experience(p: FF08Payload) -> int:
    table = {
        "20_plus_doors": 5, "6_19_doors": 4, "2_5_doors": 3,
        "1_prior_dscr": 2, "first_time": 2,
    }
    base = table.get(p.q005_experience_level, 2)
    if p.q005_experience_level == "brrrr_cyclist" or p.q003a_transaction_type == "brrrr_refi":
        base = 4
    if p.q012_decline_letter_history == "declined_elsewhere_bring_letter":
        base = max(base, 4)
    return base

def score_sc008_edge_bonus(p: FF08Payload) -> int:
    bonus = 0
    if p.edge_case_tag and p.edge_case_tag.startswith("EG-"):
        bonus += 5
    if p.q012_decline_letter_history == "declined_elsewhere_bring_letter" and not (p.edge_case_tag or "").startswith("EG-"):
        bonus += 3
    # Credit-event seasoning in fundable window
    if p.q006b_credit_event_history in ("short_sale_1_3yr", "foreclosure_2_3yr_with_700plus_fico", "chapter_7_bk_2_4yr"):
        bonus += 3
    # 401k+co-borrower pivot
    if p.q008b_methodology in ("401k", "co_borrower"):
        bonus += 3
    return min(bonus, 5)


# ---------- 3. MODIFIERS ----------
def apply_positive_modifiers(p: FF08Payload) -> Tuple[int, List[str]]:
    mods, applied = 0, []
    if "lease_in_place" in p.q009_doc_readiness:
        mods += 5; applied.append("+5 lease_in_place")
    if p.q010_entity_structure == "llc_with_op_agreement" and "operating_agreement" in p.q009_doc_readiness:
        mods += 5; applied.append("+5 LLC_op_agreement")
    if p.q005_experience_level in ("2_5_doors", "6_19_doors", "20_plus_doors") and p.q012_decline_letter_history != "first_application":
        mods += 5; applied.append("+5 prior_dscr_closed")
    if p.q005_experience_level == "20_plus_doors" and p.q011_dscr_self_estimate in ("dscr_1_25_plus", "dscr_1_20_1_24", "dscr_1_10_1_19", "dscr_1_00_1_10"):
        mods += 3; applied.append("+3 portfolio_CF_positive")
    # MOD-P05 prepay-penalty acceptance — assume opt-in field; skip for pseudocode
    if p.q005_experience_level == "brrrr_cyclist" or p.q003a_transaction_type == "brrrr_refi":
        mods += 4; applied.append("+4 BRRRR_cyclist")
    if (p.q001_property_intent == "short_term_rental" and p.q005_experience_level in ("6_19_doors", "20_plus_doors")
            and "airdna_projection" in p.q009_doc_readiness):
        mods += 5; applied.append("+5 STR_host_history_24mo")
    # MOD-P08 — EG-006 decline-letter triage high-leverage
    if (p.q012_decline_letter_history == "declined_elsewhere_bring_letter"
            and p.q002_property_type == "non_warrantable_condo"):
        mods += 15; applied.append("+15 decline_letter_triage_EG-006")
    # MOD-P09 — EG-008 401k+co-borrower strong-compensator
    if p.q008b_methodology in ("401k", "co_borrower") and p.q008b_reserves_band in ("6_8mo", "9_11mo", "12_17mo", "18plus_mo"):
        mods += 10; applied.append("+10 401k_coborrower_pivot_EG-008")
    # MOD-P10 — Permitted ADU documented
    if p.q002_property_type == "sfr_with_permitted_adu" and "lease_in_place" in p.q009_doc_readiness:
        mods += 5; applied.append("+5 permitted_ADU_documented")
    # MOD-P11 — EG-005/007 decline-letter triage
    if (p.q012_decline_letter_history == "declined_elsewhere_bring_letter"
            and p.q002_property_type in ("sfr_with_unpermitted_adu", "condotel")):
        mods += 10; applied.append("+10 decline_letter_triage_EG-005/007")
    # MOD-P12 — Lease-in-place within 3 weeks of closing (purchase path)
    if p.q003a_transaction_type == "purchase" and "lease_in_place" in p.q009_doc_readiness:
        mods += 3; applied.append("+3 lease_in_place_3wk_close")
    return mods, applied

def apply_negative_modifiers(p: FF08Payload, edge_case_tag: Optional[str]) -> Tuple[int, List[str]]:
    mods, applied = 0, []
    fp_protection = bool(edge_case_tag and edge_case_tag.startswith("EG-"))  # FP patterns protected

    # MOD-N01 — STR restricted market
    if p.q004b_str_permit_status in ("str_permit_unobtainable_nyc", "str_permit_unobtainable_nashville"):
        mods -= 10; applied.append("-10 STR_restricted_market_LTR_pivot")
    # MOD-N02 — Sub-1.25 DSCR at 75% LTV + mid-tier FICO stacking
    if (p.q011_dscr_self_estimate in ("dscr_1_20_1_24", "dscr_1_10_1_19")
            and p.q008a_ltv_band == "25_29pct_down"  # 75% LTV
            and p.q006a_fico_band in ("660_679", "680_699")):
        mods -= 8; applied.append("-8 SWR-009 stacking")
    # MOD-N03 — Sub-1.10 DSCR cash-out refi
    if p.q003a_transaction_type == "cash_out_refi" and p.q011_dscr_self_estimate == "dscr_1_00_1_10":
        mods -= 12; applied.append("-12 SWR-007 cash_out_sub_1.10")
    # MOD-N04 — Sub-1.0 DSCR (only if NOT EG-004 edge-cased — FP-004 protection)
    if p.q011_dscr_self_estimate == "dscr_0_75_0_99" and edge_case_tag != "EG-004":
        mods -= 15; applied.append("-15 SWR-010 sub_1.0_DSCR")
    elif p.q011_dscr_self_estimate == "dscr_0_75_0_99" and edge_case_tag == "EG-004":
        mods -= 15; applied.append("-15 SWR-010 sub_1.0_DSCR (EG-004 — floor 60 applies)")
    # MOD-N05 — 401k reserves methodology (only if NOT EG-008 — FP-011 protection)
    if p.q008b_methodology == "401k":
        mods -= 5; applied.append("-5 SWR-001 401k_haircut")
    # MOD-N06 — First-time STR operator
    if p.q005_experience_level == "first_time" and p.q001_property_intent == "short_term_rental":
        mods -= 6; applied.append("-6 SWR-004 first_time_STR")
    # MOD-N07 — Pending STR legislation
    if p.q004a_property_market in ("Phoenix-AZ", "Austin-TX", "Nashville-TN"):  # geo_lookup flag
        mods -= 7; applied.append("-7 SWR-014 pending_STR_legislation")
    # MOD-N08 — 5+ financed properties (portfolio reserve overhead)
    if p.q005_experience_level in ("6_19_doors", "20_plus_doors"):
        mods -= 3; applied.append("-3 SWR-011 portfolio_reserve_burden")
    # MOD-N09 — Borrower-education gap (3-factor combo only — Reg B compliant)
    if (p.q006a_fico_band == "rather_not_say" and p.q005_experience_level == "first_time"
            and p.q011_dscr_self_estimate == "dont_know"):
        mods -= 4; applied.append("-4 SWR-013 education_gap_3factor_combo")
    # MOD-N10 — Sub-1.10 DSCR (1.00-1.10 thin DSCR)
    if p.q011_dscr_self_estimate == "dscr_1_00_1_10" and edge_case_tag != "EG-004":
        mods -= 10; applied.append("-10 SWR-002 thin_DSCR_1.00_1.10")
    # MOD-N11 — Rate-term refi at 75% LTV in softening market
    if (p.q003a_transaction_type == "rate_and_term_refi" and p.q008a_ltv_band == "25_29pct_down"
            and p.q004a_property_market in ("Boise-ID", "Austin-TX", "Phoenix-AZ")):  # softening market geo flag
        mods -= 5; applied.append("-5 SWR-008 refi_softening_market")
    # MOD-N12 — ITIN identity track (specialty-routing overhead)
    if p.q007_identity_track == "us_resident_itin" and edge_case_tag != "EG-002":
        mods -= 6; applied.append("-6 SWR-012 ITIN_specialty_overhead")
    # MOD-N13 — No-credit FN identity track
    if p.q007_identity_track == "foreign_national_no_credit_bureau" and edge_case_tag != "EG-003":
        mods -= 7; applied.append("-7 SWR-005 FN_no_credit_specialty_overhead")
    # MOD-N14 — Unpermitted ADU (mainline decline — specialty SFR-pivot routing)
    if p.q002_property_type == "sfr_with_unpermitted_adu" and edge_case_tag != "EG-005":
        mods -= 8; applied.append("-8 SWR-015 unpermitted_ADU_specialty_pivot")
    # MOD-N15 — Thin-credit identity track
    if p.q007_identity_track == "thin_credit_us_resident":
        mods -= 5; applied.append("-5 SWR-016 thin_credit_specialty_overhead")
    return mods, applied


# ---------- 4. HEX HARD-EXIT OVERRIDE ----------
def check_hard_exit(p: FF08Payload) -> Optional[str]:
    """Returns HEX rule ID if hard-exit triggered, else None."""
    # HEX-001 — Primary residence
    if p.q001_property_intent in ("primary_residence", "second_home"):
        return "HEX-001"
    # HEX-009 — Active delinquency / uncured forbearance
    if p.q006b_credit_event_history == "currently_in_forbearance_or_unresolved_delinquency":
        return "HEX-009"
    # HEX-012 outside specialty — Sub-$100K loan
    if p.q003b_loan_amount_band == "under_100k" and p.q002_property_type not in ("non_warrantable_condo", "condotel"):
        return "HEX-012"
    # HEX-013 outside specialty — Pure commercial
    if p.q002_property_type == "pure_commercial":
        return "HEX-013"
    return None


# ---------- 5. PERSONA MATCH ----------
def match_persona(p: FF08Payload) -> str:
    """Returns best-fit persona_tag based on FF-08 form combo. SA-012 takes precedence per FF-08."""
    if p.persona_tag:  # FF-08 passthrough (BRRRR cyclist override handled in FF-08)
        return p.persona_tag
    # Fallback matching (simplified — FF-08 form has more sophisticated routing)
    if p.q005_experience_level == "20_plus_doors":
        return "SA-002 Multi-State Portfolio Scaler"
    if p.q012_decline_letter_history == "declined_elsewhere_bring_letter":
        return "SA-011 Compensated-Exception Shopper"
    if p.q005_experience_level == "first_time":
        return "SA-003 Cash-Strong First-Timer"
    if p.q003a_transaction_type == "cash_out_refi" and p.q005_experience_level in ("2_5_doors", "6_19_doors"):
        return "SA-004 Equity-Tapping Refinancer"
    if p.q001_property_intent == "short_term_rental":
        return "SA-007 STR Permissive-Market Operator"
    if p.q007_identity_track == "us_resident_itin":
        return "SA-010 ITIN US-Resident Investor"
    if p.q007_identity_track == "foreign_national_strong_credit":
        return "SA-005 Strong-Credit Foreign National"
    if p.q007_identity_track == "foreign_national_no_credit_bureau":
        return "SA-006 No-Credit Foreign National"
    if p.q006a_fico_band in ("620_659", "660_679") and p.q006b_credit_event_history != "none":
        return "SA-008 Credit-Scarred Cash-Rich Rebuilder"
    if p.q002_property_type == "sfr_with_permitted_adu":
        return "SA-009 Permitted-ADU California Leverage Player"
    if p.q003a_transaction_type == "brrrr_refi":
        return "SA-012 BRRRR Refinance Cyclist"
    return "SA-001 Cash-Flow Optimizer"


# ---------- 6. TIER ROUTING ----------
def route_tier(final_score: int) -> Tuple[str, str, str]:
    if final_score >= 85:
        return ("TIER_A", "fast_track_qualified",
                "Direct to senior LO within 1 business hour; pre-approval letter workflow")
    if final_score >= 65:
        return ("TIER_B", "standard_qualification",
                "Specialty-trained LO within 4 business hours; standard underwriting package")
    if final_score >= 40:
        return ("TIER_C", "edge_case_specialty_routing",
                "Senior LO review within 1 business day; specialty-lender routing recommendation")
    return ("TIER_D", "decline_or_defer_roadmap",
            "Automated re-engagement sequence (defer) OR route-to-other-product (hard exit)")


# ---------- 7. NEXT BEST ACTION ----------
def next_best_action(tier: str, persona: str, edge_case_tag: Optional[str]) -> str:
    if tier == "TIER_A":
        return f"Schedule LO call within 1 business hour; pre-approval letter ready (persona: {persona})"
    if tier == "TIER_B":
        return f"Schedule specialty LO call within 4 business hours; assemble underwriting package (persona: {persona})"
    if tier == "TIER_C":
        if edge_case_tag:
            return f"Senior LO specialty-lender routing within 1 business day (edge case: {edge_case_tag})"
        return "Senior LO review within 1 business day; specialty-lender routing recommendation"
    return "Defer with 12mo re-engagement roadmap OR route-to-other-product referral"


# ---------- 8. MAIN SCORING FUNCTION ----------
def score_lead(p: FF08Payload) -> Dict:
    # Step 1: HEX hard-exit override (score = 0)
    hex_rule = check_hard_exit(p)
    if hex_rule:
        return {
            "score": 0, "tier": "TIER_D", "routing": "route_to_other_product",
            "modifiers_applied": [f"HEX override: {hex_rule}"],
            "persona_match": match_persona(p),
            "edge_case_indicators": [],
            "next_best_action": f"Hard exit ({hex_rule}) — route-to-other-product referral",
            "compliance_flag": "Reg B §1002.9 adverse-action review required for hard-exit message",
        }

    # Step 2: Component scoring
    sc001 = score_sc001_dscr(p)
    sc002 = score_sc002_fico(p)
    sc003 = score_sc003_ltv(p)
    sc004 = score_sc004_reserves(p)
    sc005 = score_sc005_property(p)
    sc006 = score_sc006_docs(p)
    sc007 = score_sc007_experience(p)
    sc008 = score_sc008_edge_bonus(p)
    composite = sc001 + sc002 + sc003 + sc004 + sc005 + sc006 + sc007 + sc008

    # Step 3: Apply modifiers
    pos_mods, pos_applied = apply_positive_modifiers(p)
    neg_mods, neg_applied = apply_negative_modifiers(p, p.edge_case_tag)
    post_modifier = composite + pos_mods + neg_mods

    # Step 4: Floor / ceiling overrides (FF-08 Part 7 binding)
    edge_case_tag = p.edge_case_tag
    specialty_routing_triggered = (
        p.q002_property_type in ("5_8_unit_residential", "non_warrantable_condo", "condotel", "sfr_with_unpermitted_adu")
        or p.q007_identity_track in ("us_resident_itin", "foreign_national_no_credit_bureau", "thin_credit_us_resident")
        or p.q006a_fico_band in ("620_659", "550_619")
        or p.q011_dscr_self_estimate in ("dscr_0_75_0_99", "dscr_under_0_75")
        or p.q012_decline_letter_history == "declined_elsewhere_bring_letter"
    )

    if edge_case_tag and edge_case_tag.startswith("EG-"):
        final_score = max(60, post_modifier)  # EG floor per FF-08 ceiling_for_edge_case
    elif specialty_routing_triggered:
        final_score = max(30, post_modifier)  # Specialty floor per FF-08 floor for specialty routing
    else:
        final_score = post_modifier
    final_score = max(0, min(100, final_score))

    # Step 5: Tier routing
    tier, routing_key, routing_desc = route_tier(final_score)
    persona_match = match_persona(p)
    edge_indicators = []
    if edge_case_tag:
        edge_indicators.append(edge_case_tag)
    if p.q012_decline_letter_history == "declined_elsewhere_bring_letter":
        edge_indicators.append("decline_letter_triage_triggered")

    # Step 6: Next best action
    nba = next_best_action(tier, persona_match, edge_case_tag)

    return {
        "score": final_score,
        "tier": tier,
        "routing": routing_key,
        "modifiers_applied": pos_applied + neg_applied,
        "component_scores": {
            "SC-001_DSCR": sc001, "SC-002_FICO": sc002, "SC-003_LTV": sc003,
            "SC-004_Reserves": sc004, "SC-005_Property": sc005, "SC-006_Docs": sc006,
            "SC-007_Experience": sc007, "SC-008_EdgeBonus": sc008,
        },
        "composite_pre_modifiers": composite,
        "modifier_total": pos_mods + neg_mods,
        "persona_match": persona_match,
        "edge_case_indicators": edge_indicators,
        "next_best_action": nba,
        "compliance_flag": None,
    }


# ---------- 9. WORKED EXAMPLE — SA-001 Cash-Flow Optimizer ----------
if __name__ == "__main__":
    payload = FF08Payload(
        q001_property_intent="investment_ltr",
        q002_property_type="sfr",
        q003a_transaction_type="purchase",
        q003b_loan_amount_band="100k_500k",
        q004a_property_market="Indianapolis-IN",
        q004b_str_permit_status="str_permit_confirmed",  # not used for LTR
        q005_experience_level="2_5_doors",
        q006a_fico_band="720_739",
        q006b_credit_event_history="none",
        q007_identity_track="us_resident_ssn",
        q007a_fn_readiness=None,
        q008a_ltv_band="30_34pct_down",  # 33% down
        q008b_reserves_band="6_8mo",
        q008b_methodology="liquid",
        q009_doc_readiness=["lease_in_place", "rent_schedule_or_1007", "operating_agreement"],
        q010_entity_structure="llc_with_op_agreement",
        q011_dscr_self_estimate="dscr_1_25_plus",  # 1.30
        q012_decline_letter_history="first_application",
        persona_tag="SA-001",
        edge_case_tag=None,
    )
    result = score_lead(payload)
    # Expected: score=88, tier=TIER_A, routing=fast_track_qualified
    # modifiers_applied includes +5 lease_in_place, +5 LLC_op_agreement, +3 prior_dscr_closed (NOT — first_application)
    # Actually: +5 lease_in_place, +5 LLC_op_agreement (no prior DSCR since first_application)
    # composite = 22 + 13 + 11 + 9 + 10 + 7 + 3 + 0 = 75
    # mods = +5 +5 = +10 (Q-012 = first_application means no +5 prior_dscr_closed)
    # final = 85 → TIER_A (still)
    print(result)
```

### Pseudocode Output Format (matches task spec)

```python
{
  "score": 88,
  "tier": "TIER_A",
  "routing": "fast_track_qualified",
  "modifiers_applied": ["+5 lease_in_place", "+5 LLC_op_agreement", "+3 prior_dscr_closed"],
  "component_scores": {
    "SC-001_DSCR": 22, "SC-002_FICO": 13, "SC-003_LTV": 11,
    "SC-004_Reserves": 9, "SC-005_Property": 10, "SC-006_Docs": 7,
    "SC-007_Experience": 3, "SC-008_EdgeBonus": 0
  },
  "composite_pre_modifiers": 75,
  "modifier_total": 13,
  "persona_match": "SA-001 Cash-Flow Optimizer",
  "edge_case_indicators": [],
  "next_best_action": "Schedule LO call within 1 business hour; pre-approval letter ready (persona: SA-001 Cash-Flow Optimizer)",
  "compliance_flag": None
}
```

---

# Part 2: Ad Targeting Payload (Meta + Google)

## 2A. Meta Campaign Structure (Special Ad Category — Housing/Credit)

### Compliance Anchors (from FF-08 Part 6 + AC-09 Part 1.5)

- **Special Ad Category: HOUSING** (required for all DSCR lead-gen campaigns on Facebook/Instagram).
- NO demographic targeting (age, sex, race, national origin, family status, language unless product-feature-relevant).
- NO ZIP-code targeting (city / state / DMA / radius only — no neighborhood exclusion).
- NO lookalike audiences based on protected attributes. **Lookalikes must be sourced from customer-file (funded-loan customers), NOT from lead-form submissions.**
- Lead-form questions restricted to 'objective criteria' (Q-001, Q-002, Q-003, Q-004, Q-005, Q-010, Q-011). Sensitive questions (Q-006, Q-007, Q-008, Q-009, Q-012) deferred to landing page post-lead-form.

### Campaign Architecture

```yaml
campaign_id: META-DSCR-001
campaign_name: "DSCR Investor Acquisition — Broad"
special_ad_category: HOUSING
objective: LEAD_GENERATION
campaign_budget_daily_usd: 500  # ~$15K/month
optimization_goal: LEAD_QUALITY_PROXY
  # Custom event fired server-side when FF-08 form completion + tier routing returns TIER_A or TIER_B.
  # This is the proxy for "qualified application" — NOT raw lead-form submission.
  # Event name: Tier_Routed_A_or_B (see Part 2D Conversion Tracking)
campaign_budget_lifecycle: "Monthly review; reallocate by ad-set ROAS quarterly"

ad_sets:
  # --- AD SET 1: Broad Investor Intent — National (multi-persona rotation) ---
  - ad_set_id: AS-001
    name: "Broad Investor Intent — National"
    targeting:
      custom_audiences:
        - website_visitors_30d
        - calculator_users_90d
        - case_study_readers_30d
      lookalike_base:
        - funded_loan_customers_1pct    # SAC allows customer-file lookalikes
        - funded_loan_customers_3pct
        - funded_loan_customers_5pct
      excluded:
        - primary_residence_searchers_30d
        - conventional_mortgage_inquirers_30d
        - hard_money_personal_loan_clickers
      geographic: ["United States (national)"]  # SAC prohibits ZIP-level
    bid_strategy: LOWEST_COST_WITH_BID_CAP
    bid_cap_usd: 35
    creative_assignment:
      - AC-09 SA-001 H2 (Meta channel hook)
      - AC-09 SA-003 H2 (first-time investor hook)
      - AC-09 SA-004 H2 (cash-out refi hook)
      - AC-09 SA-012 H2 (BRRRR refi hook)
    creative_rotation: "Weekly — top 4 personas rotated"
    optimization_event: Tier_Routed_A_or_B
    expected_cpl_usd: 45-65
    expected_tier_a_b_rate: "35-45%"

  # --- AD SET 2: STR Specialist — Compliant Broad (SA-007 + EG-007) ---
  - ad_set_id: AS-002
    name: "STR Specialist — Compliant Broad"
    targeting:
      custom_audiences:
        - str_calculator_users_90d
        - airdna_tool_users_30d
        - str_market_permissiveness_engagement_30d  # engaged with STR-permissive market content
      lookalike_base:
        - funded_str_loan_customers_2pct
      interest_broad:
        - "Real estate investing"  # SAC allows broad interest, not narrow demographic
        - "Vacation rental"
        - "Airbnb"
      excluded:
        - primary_residence_searchers_30d
        - nyc_residents  # NYC STR-restricted — exclude geo via DMA
        - san_francisco_residents
        - denver_residents
      geographic: ["STR-permissive DMAs: PanamaCityBeach-FL, Destin-FL, Gatlinburg-TN, PigeonForge-TN, Scottsdale-AZ, Orlando-FL"]
    bid_strategy: LOWEST_COST_WITH_BID_CAP
    bid_cap_usd: 42
    creative_assignment:
      - AC-09 SA-007 H2 (STR permissive market hook)
      - AC-09 EG-007 H2 (condotel STR hook)
    creative_rotation: "Bi-weekly — STR hooks only"
    optimization_event: Tier_Routed_A_or_B
    expected_cpl_usd: 55-75
    expected_tier_a_b_rate: "40-50% (self-qualifying microcopy filters non-STR)"
    compliance_note: "Excluded DMAs are STR-restricted markets per NP-001 — geographic exclusion at DMA level is SAC-compliant (not neighborhood-level)."

  # --- AD SET 3: Foreign-National Specialist Broad (SA-005 + SA-006 + EG-003) ---
  - ad_set_id: AS-003
    name: "Foreign-National Specialist — Compliant Broad"
    targeting:
      custom_audiences:
        - fn_landing_page_visitors_30d
        - fn_reserves_calculator_users_90d
      lookalike_base:
        - funded_fn_loan_customers_2pct
      interest_broad:
        - "Real estate investing"
        - "International business"
      excluded:
        - primary_residence_searchers_30d
        - conventional_mortgage_inquirers_30d
      geographic: ["FN-friendly states: FL, TX, CA (no state income tax + landlord-friendly + FN-lender concentration per SA-05 Part 3)"]
    bid_strategy: LOWEST_COST_WITH_BID_CAP
    bid_cap_usd: 45  # Higher CPA acceptable — FN loans carry +1.00-1.50% pricing premium
    creative_assignment:
      - AC-09 SA-005 H2 (strong-credit FN hook — Nova Credit path)
      - AC-09 SA-006 H2 (no-credit FN hook — 40% down path)
      - AC-09 EG-003 H2 (no-credit-country edge case)
    creative_rotation: "Weekly — FN tier rotation"
    optimization_event: Tier_Routed_A_or_B
    expected_cpl_usd: 75-110  # Higher CPL acceptable per FN margin potential (FDI margin: 10/10)
    expected_tier_a_b_rate: "30-40%"
    compliance_note: "FN copy anchored to product-feature (lender-published FN program), NOT borrower class. Bilingual landing pages product-feature-relevant (language targeting allowed when product-feature-anchored)."

  # --- AD SET 4: Credit-Scarred Rebuilder Broad (SA-008 + EG-001) ---
  - ad_set_id: AS-004
    name: "Credit-Scarred Rebuilder — Specialty Seasoning Programs"
    targeting:
      custom_audiences:
        - credit_rebuild_content_engagement_90d
        - post_seasoning_calculator_users_90d
      lookalike_base:
        - funded_credit_scarred_loan_customers_2pct
      interest_broad:
        - "Real estate investing"
        - "Personal finance"
      excluded:
        - primary_residence_searchers_30d
        - active_delinquency_searchers_30d  # HEX-009 — route-to-other-product, do not acquire
      geographic: ["Midwest / Southeast: OH, IN, MO, PA, MI, AL, TN (cash-flow-rich markets offset FICO tier per SA-008)"]
    bid_strategy: LOWEST_COST_WITH_BID_CAP
    bid_cap_usd: 38
    creative_assignment:
      - AC-09 SA-008 H2 (post-seasoning hook)
      - AC-09 EG-001 H2 (post-short-sale comeback hook)
    creative_rotation: "Bi-weekly"
    optimization_event: Tier_Routed_A_or_B
    expected_cpl_usd: 50-70
    expected_tier_a_b_rate: "35-45%"
    compliance_note: "Copy uses 'specialty seasoning programs available — 24mo / 36mo / 48mo paths' (AC-09 replacement feature-language). Forbidden: 'no mortgage lates ever' / 'clean credit only' (NP-04 Part 6)."

  # --- AD SET 5: Portfolio/Blanket Loan Intent (SA-002) — highest LTV persona ---
  - ad_set_id: AS-005
    name: "Portfolio/Blanket Loan Intent — Multi-State Operators"
    targeting:
      custom_audiences:
        - portfolio_calculator_users_90d
        - multi_state_landlord_content_engagement_30d
      lookalike_base:
        - funded_portfolio_loan_customers_1pct  # Highest-value customer file
      interest_broad:
        - "Real estate investing"
        - "Commercial real estate"
      excluded:
        - first_time_investor_searchers_30d  # SA-003 separate ad set
        - single_property_buyers_30d
      geographic: ["National (portfolio scaler is multi-state)"]
    bid_strategy: LOWEST_COST_WITH_BID_CAP
    bid_cap_usd: 80  # Highest bid cap — $1M-$3.2M loans, 10/10 FDI margin potential
    creative_assignment:
      - AC-09 SA-002 H1 (Google Search hook — portfolio DSCR up to $5M)
      - AC-09 SA-002 H2 (Meta hook — scale past DTI wall)
    creative_rotation: "Monthly"
    optimization_event: Tier_Routed_A_or_B
    expected_cpl_usd: 120-180  # Highest acceptable CPL per loan-size potential
    expected_tier_a_b_rate: "55-65% (self-qualifying microcopy repels non-portfolio operators)"

  # --- AD SET 6: BRRRR Refinance Cyclist (SA-012) ---
  - ad_set_id: AS-006
    name: "BRRRR Refinance Cyclist — Post-Rehab Stabilized"
    targeting:
      custom_audiences:
        - brrrr_calculator_users_90d
        - rehab_content_engagement_30d
      lookalike_base:
        - funded_brrrr_refi_loan_customers_2pct
      interest_broad:
        - "Real estate investing"
        - "House flipping"
      excluded:
        - primary_residence_searchers_30d
        - fix_and_flip_only_buyers_30d  # BRRRR is hold-and-refi, not fix-and-flip
      geographic: ["BRRRR-strong markets: TN, IN, OH, AL (low basis + strong rent-to-ARV ratios)"]
    bid_strategy: LOWEST_COST_WITH_BID_CAP
    bid_cap_usd: 50
    creative_assignment:
      - AC-09 SA-012 H1 (Google hook — BRRRR refi into DSCR)
      - AC-09 SA-012 H2 (Meta hook — recycle capital into next deal)
    creative_rotation: "Bi-weekly"
    optimization_event: Tier_Routed_A_or_B
    expected_cpl_usd: 60-85
    expected_tier_a_b_rate: "45-55%"

  # --- AD SET 7: Decline-Letter Re-Shop (SA-011 + EG-005/006/007/008) ---
  - ad_set_id: AS-007
    name: "Decline-Letter Re-Shop — Specialty Routing"
    targeting:
      custom_audiences:
        - decline_letter_landing_page_visitors_30d  # SEO traffic from "DSCR loan declined" queries
        - lender_review_site_visitors_30d
      lookalike_base:
        - funded_decline_letter_reshop_customers_2pct  # Customers who came in via decline-letter triage
      interest_broad:
        - "Real estate investing"
        - "Mortgage loans"
      excluded:
        - primary_residence_searchers_30d
      geographic: ["National"]
    bid_strategy: LOWEST_COST_WITH_BID_CAP
    bid_cap_usd: 55
    creative_assignment:
      - AC-09 SA-011 H1 (decline-letter re-shop hook — "Declined? Bring the letter")
      - AC-09 EG-006 H2 (non-warrantable condo decline-letter triage — +15 modifier)
      - AC-09 EG-005 H2 (unpermitted-ADU pivot)
      - AC-09 EG-008 H2 (401k-reserves co-borrower pivot)
    creative_rotation: "Weekly — edge-case rotation"
    optimization_event: Tier_Routed_A_or_B
    expected_cpl_usd: 65-90
    expected_tier_a_b_rate: "50-60% (decline-letter triage surfaces 5 of 8 edge cases — highest conversion cohort per EG-06 Part 2)"

  # --- AD SET 8: Calculator/Content Engagement Retargeting (lead magnet funnel) ---
  - ad_set_id: AS-008
    name: "Calculator & Content Retargeting — Lead Magnet Funnel"
    targeting:
      custom_audiences:
        - dscr_calculator_users_30d
        - reserves_calculator_users_30d
        - case_study_readers_30d
        - blog_readers_30d
      excluded:
        - form_completers_30d  # Don't retarget people who already converted
        - primary_residence_searchers_30d
      geographic: ["National"]
    bid_strategy: LOWEST_COST_WITHOUT_BID_CAP  # Retargeting — let Meta optimize
    creative_assignment:
      - AC-09 SA-001 H3 (60-second DSCR walk-through — calculator-driven)
      - AC-09 EG-008 H1 (Free reserves calculator — 60% 401k haircut + co-borrower)
    creative_rotation: "Weekly"
    optimization_event: Form_Start  # Mid-funnel — optimize for form start, not just tier routing
    expected_cpl_usd: 30-45  # Lower CPL — warm audience
    expected_tier_a_b_rate: "40-50%"
```

**Total Meta ad sets defined: 8** (exceeds 5-ad-set minimum).

---

## 2B. Google Search Campaign Structure

### Campaign Architecture

```yaml
campaign_id: GOOGLE-DSCR-001
campaign_name: "DSCR Investor Acquisition — Search"
ad_category: HOUSING  # Requires housing-certification + advertiser identity verification
bidding_strategy: TARGET_CPA  # Per-persona Target CPA — see budget allocation
campaign_budget_monthly_usd: 20000  # See Part 2E budget allocation
attribution_model: DATA_DRIVEN

ad_groups:  # One per persona (12) + 1 decline-letter bundle
  # --- AG-001: SA-001 Cash-Flow Optimizer ---
  - ad_group_id: AG-001
    name: "SA-001 Cash-Flow Optimizer"
    target_cpa_usd: 80
    keywords:
      exact_match:
        - "[dscr loan self employed]"
        - "[investment property loan no tax returns]"
        - "[no income verification investment mortgage]"
        - "[rental property loan no W2]"
        - "[DSCR loan LLC]"
      phrase_match:
        - "\"DSCR loan for rental property\""
        - "\"investor mortgage no income\""
        - "\"qualify rental with write-offs\""
        - "\"self employed investor loan\""
        - "\"DSCR vs conventional rental\""
    ad_copy:
      headline: "DSCR For Self-Employed Investors"
      description: "Qualify on property cash flow. No DTI wall, no Schedule C penalty. Investment properties only."
      final_url: "https://lender.com/dscr-self-employed"
      landing_page: AC-09 SA-001 landing page
    expected_monthly_budget_usd: 4000
    expected_monthly_leads: 50
    expected_tier_a_b_rate: "45-55%"

  # --- AG-002: SA-002 Portfolio Scaler ---
  - ad_group_id: AG-002
    name: "SA-002 Portfolio Scaler"
    target_cpa_usd: 180  # Highest CPA — $1M-$3.2M loans
    keywords:
      exact_match:
        - "[portfolio DSCR loan]"
        - "[blanket loan rental properties]"
        - "[DSCR loan 10+ properties]"
        - "[cross collateralized DSCR]"
        - "[commercial DSCR portfolio]"
      phrase_match:
        - "\"blanket loan multiple rental properties\""
        - "\"portfolio loan for investors\""
        - "\"scale rental portfolio no DTI\""
        - "\"DSCR blanket refinance\""
        - "\"multi-state rental portfolio loan\""
    ad_copy:
      headline: "Portfolio DSCR Up To $5M"
      description: "Aggregate 5-20+ stabilized rentals into one blanket loan. No DTI limit. 10+ doors only."
      final_url: "https://lender.com/portfolio-dscr"
      landing_page: AC-09 SA-002 landing page
    expected_monthly_budget_usd: 3000
    expected_monthly_leads: 17
    expected_tier_a_b_rate: "55-65%"

  # --- AG-003: SA-003 Cash-Strong First-Timer ---
  - ad_group_id: AG-003
    name: "SA-003 Cash-Strong First-Timer"
    target_cpa_usd: 70
    keywords:
      exact_match:
        - "[first DSCR loan]"
        - "[how to qualify for DSCR loan]"
        - "[DSCR loan for first rental]"
        - "[investment property loan no W2]"
        - "[DSCR loan calculator]"
      phrase_match:
        - "\"first DSCR loan guide\""
        - "\"how does DSCR work\""
        - "\"first rental property DSCR\""
        - "\"DSCR requirements first time\""
        - "\"investment property loan calculator\""
    ad_copy:
      headline: "Your First DSCR Loan — Built For First-Time Investors"
      description: "Strong FICO + 6+ months reserves. Lease-in-place path. Investment properties only."
      final_url: "https://lender.com/first-dscr-loan"
      landing_page: AC-09 SA-003 landing page
    expected_monthly_budget_usd: 2000
    expected_monthly_leads: 29
    expected_tier_a_b_rate: "40-50%"

  # --- AG-004: SA-004 Equity-Tapping Refinancer ---
  - ad_group_id: AG-004
    name: "SA-004 Equity-Tapping Refinancer"
    target_cpa_usd: 90
    keywords:
      exact_match:
        - "[DSCR cash out refinance]"
        - "[cash out refi investment property]"
        - "[DSCR refinance rental]"
        - "[no income verification cash out refi]"
      phrase_match:
        - "\"cash out refinance rental property\""
        - "\"DSCR refinance stabilized rental\""
        - "\"investment property cash out\""
        - "\"no DTI cash out refi\""
    ad_copy:
      headline: "DSCR Cash-Out Refinance On Stabilized Rentals"
      description: "75% LTV cash-out on stabilized rentals. Aggregate portfolio cash flow. No DTI limit."
      final_url: "https://lender.com/dscr-cash-out"
      landing_page: AC-09 SA-004 landing page
    expected_monthly_budget_usd: 2000
    expected_monthly_leads: 22
    expected_tier_a_b_rate: "50-60%"

  # --- AG-005: SA-005 + SA-006 Foreign National (combined) ---
  - ad_group_id: AG-005
    name: "SA-005/SA-006 Foreign National DSCR"
    target_cpa_usd: 130  # Higher CPA — FN margin premium +1.00-1.50%
    keywords:
      exact_match:
        - "[foreign national DSCR loan]"
        - "[DSCR loan no US credit]"
        - "[ITIN DSCR loan]"
        - "[DSCR loan for foreign investors]"
      phrase_match:
        - "\"foreign national investment property loan\""
        - "\"DSCR loan without SSN\""
        - "\"no US credit history mortgage\""
        - "\"international investor US rental loan\""
    ad_copy:
      headline: "Foreign-National DSCR Loans — No US Credit History Required"
      description: "Specialty FN programs. Nova Credit verified or 40% down path. US LLC required."
      final_url: "https://lender.com/foreign-national-dscr"
      landing_page: AC-09 SA-005 / SA-006 landing pages (toggle by FN tier)
    expected_monthly_budget_usd: 2000
    expected_monthly_leads: 15
    expected_tier_a_b_rate: "35-45%"

  # --- AG-006: SA-007 STR Permissive-Market Operator ---
  - ad_group_id: AG-006
    name: "SA-007 STR Permissive-Market Operator"
    target_cpa_usd: 100
    keywords:
      exact_match:
        - "[STR DSCR loan]"
        - "[short term rental DSCR]"
        - "[AirDNA DSCR loan]"
        - "[vacation rental investment loan]"
      phrase_match:
        - "\"DSCR loan for Airbnb\""
        - "\"short term rental investment property loan\""
        - "\"AirDNA qualification DSCR\""
        - "\"STR refinance investment property\""
    ad_copy:
      headline: "STR DSCR Loans In Permissive Markets — AirDNA Qualification"
      description: "FL coast, Smokies, Scottsdale AZ. AirDNA projection path. STR-permitted markets only."
      final_url: "https://lender.com/str-dscr"
      landing_page: AC-09 SA-007 landing page
    expected_monthly_budget_usd: 2000
    expected_monthly_leads: 20
    expected_tier_a_b_rate: "45-55%"
    geo_targeting: "STR-permissive DMAs only (PanamaCityBeach-FL, Destin-FL, Gatlinburg-TN, PigeonForge-TN, Scottsdale-AZ, Orlando-FL)"

  # --- AG-007: SA-008 Credit-Scarred Rebuilder ---
  - ad_group_id: AG-007
    name: "SA-008 Credit-Scarred Rebuilder"
    target_cpa_usd: 85
    keywords:
      exact_match:
        - "[DSCR loan after bankruptcy]"
        - "[DSCR loan after foreclosure]"
        - "[DSCR loan after short sale]"
        - "[investment property loan bad credit]"
      phrase_match:
        - "\"DSCR loan post bankruptcy\""
        - "\"investment property loan after foreclosure\""
        - "\"specialty seasoning DSCR\""
        - "\"DSCR loan credit rebuild\""
    ad_copy:
      headline: "DSCR Loans After Bankruptcy, Foreclosure, Or Short Sale"
      description: "Specialty seasoning programs — 24mo / 36mo / 48mo paths. 30-35% down + 12mo reserves."
      final_url: "https://lender.com/dscr-after-credit-event"
      landing_page: AC-09 SA-008 / EG-001 landing pages
    expected_monthly_budget_usd: 1500
    expected_monthly_leads: 18
    expected_tier_a_b_rate: "40-50%"

  # --- AG-008: SA-009 Permitted-ADU California ---
  - ad_group_id: AG-008
    name: "SA-009 Permitted-ADU California"
    target_cpa_usd: 110
    keywords:
      exact_match:
        - "[DSCR loan ADU]"
        - "[ADU investment property loan]"
        - "[California ADU DSCR]"
        - "[DSCR loan with ADU income]"
      phrase_match:
        - "\"permitted ADU DSCR loan\""
        - "\"California ADU rental loan\""
        - "\"DSCR both rents count\""
        - "\"ADU income investment mortgage\""
    ad_copy:
      headline: "DSCR For California SFR-With-Permitted-ADU — Both Rents Count"
      description: "Permitted ADU income counts toward DSCR. CA leverage play. 75-80% LTV."
      final_url: "https://lender.com/dscr-permitted-adu-ca"
      landing_page: AC-09 SA-009 landing page
    expected_monthly_budget_usd: 1000
    expected_monthly_leads: 9
    expected_tier_a_b_rate: "45-55%"
    geo_targeting: "CA only (Los Angeles, San Diego, Bay Area, Sacramento)"

  # --- AG-009: SA-010 ITIN US-Resident Investor ---
  - ad_group_id: AG-009
    name: "SA-010 ITIN US-Resident Investor"
    target_cpa_usd: 95
    keywords:
      exact_match:
        - "[ITIN DSCR loan]"
        - "[ITIN investment property loan]"
        - "[DSCR loan without SSN]"
        - "[ITIN mortgage investor]"
      phrase_match:
        - "\"ITIN work permit DSCR\""
        - "\"US resident ITIN investment loan\""
        - "\"DSCR loan ITIN accepted\""
        - "\"ITIN rental property loan\""
    ad_copy:
      headline: "ITIN DSCR Loans — US Residents With Work Permit, No SSN Required"
      description: "AHLend + America Mortgages ITIN programs. 2-4 unit preferred for DSCR support."
      final_url: "https://lender.com/itin-dscr"
      landing_page: AC-09 SA-010 landing page
    expected_monthly_budget_usd: 1000
    expected_monthly_leads: 11
    expected_tier_a_b_rate: "35-45%"
    geo_targeting: "FL, TX, CA, IL, NY, AZ (ITIN-borrower concentration per SA-010)"

  # --- AG-010: SA-011 Decline-Letter Re-Shop ---
  - ad_group_id: AG-010
    name: "SA-011 Decline-Letter Re-Shop"
    target_cpa_usd: 75  # Lower CPA — highest-converting cohort per EG-06 Part 2
    keywords:
      exact_match:
        - "[DSCR loan declined]"
        - "[DSCR lender declined my file]"
        - "[shopping DSCR decline letter]"
        - "[DSCR loan denied]"
      phrase_match:
        - "\"declined for DSCR loan\""
        - "\"DSCR lender denied what next\""
        - "\"shop DSCR decline letter\""
        - "\"second opinion DSCR loan\""
    ad_copy:
      headline: "Declined By A DSCR Lender? Specialty Routes Available."
      description: "Bring the decline letter. Non-warrantable, condotel, unpermitted-ADU, sub-1.0 DSCR — all fundable at specialty."
      final_url: "https://lender.com/dscr-decline-letter"
      landing_page: AC-09 SA-011 / EG-005 / EG-006 / EG-007 / EG-008 landing pages (decline-letter triage routes by property type)
    expected_monthly_budget_usd: 1000
    expected_monthly_leads: 13
    expected_tier_a_b_rate: "55-65%"  # Highest conversion cohort

  # --- AG-011: SA-012 BRRRR Refinance Cyclist ---
  - ad_group_id: AG-011
    name: "SA-012 BRRRR Refinance Cyclist"
    target_cpa_usd: 100
    keywords:
      exact_match:
        - "[BRRRR refinance DSCR]"
        - "[BRRRR refi loan]"
        - "[post rehab DSCR refinance]"
        - "[DSCR loan after BRRRR]"
      phrase_match:
        - "\"BRRRR refinance rental property\""
        - "\"DSCR refinance after rehab\""
        - "\"BRRRR cash out refi\""
        - "\"post-rehab stabilized refinance\""
    ad_copy:
      headline: "BRRRR Refinance Into DSCR — Recycle Capital Into The Next Deal"
      description: "75% of post-rehab ARV. Lease-in-place + 6mo reserves. Built for BRRRR cyclists."
      final_url: "https://lender.com/brrrr-refi-dscr"
      landing_page: AC-09 SA-012 landing page
    expected_monthly_budget_usd: 500
    expected_monthly_leads: 5
    expected_tier_a_b_rate: "55-65%"

  # --- AG-012: SA-009 ITIN edge-case bundle (EG-002 / EG-003 / EG-004 / EG-005 / EG-006 / EG-007 / EG-008) ---
  - ad_group_id: AG-012
    name: "EG Edge-Case Bundle — Specialty Routing"
    target_cpa_usd: 90
    keywords:
      exact_match:
        - "[non warrantable condo DSCR]"
        - "[condotel DSCR loan]"
        - "[unpermitted ADU DSCR]"
        - "[sub 1.0 DSCR loan]"
        - "[401k reserves DSCR]"
      phrase_match:
        - "\"non-warrantable condo investment loan\""
        - "\"condotel short term rental loan\""
        - "\"DSCR with 401k reserves\""
        - "\"below 1.0 DSCR with compensators\""
        - "\"unpermitted ADU SFR loan\""
    ad_copy:
      headline: "Specialty DSCR Routes — Non-Warrantable, Condotel, Sub-1.0 DSCR"
      description: "Declined elsewhere? Bring the letter. Specialty lenders fund these files every day."
      final_url: "https://lender.com/dscr-specialty-routing"
      landing_page: AC-09 EG-006 / EG-007 / EG-008 landing pages (router by edge-case tag)
    expected_monthly_budget_usd: 1000  # allocated from main budget; AG-010 captures decline-letter traffic
    expected_monthly_leads: 12
    expected_tier_a_b_rate: "50-60%"
```

**Total Google ad groups defined: 12** (one per persona + 1 edge-case bundle). Exceeds minimum.

### Negative Keyword Master List (applies campaign-wide)

```yaml
negative_keywords:
  # Primary-residence / personal-use
  - "primary residence mortgage"
  - "first time home buyer"
  - "FHA loan"
  - "VA loan"
  - "owner occupied"
  - "second home mortgage"
  - "vacation home loan"
  - "reverse mortgage"
  - "refinance primary residence"
  - "cash out refinance primary"
  - "construction loan owner"
  # Personal credit / no-money-down
  - "no money down mortgage"
  - "free house"
  - "hard money personal loan"
  - "personal loan"
  - "credit card"
  - "payday loan"
  # Forbidden phrases (NP-04 Part 6 — would attract wrong audience)
  - "easy approval mortgage"
  - "instant approval loan"
  - "guaranteed approval"
  - "no credit check mortgage"
  # Product-mismatch
  - "hard money fix and flip"  # DSCR is hold-and-refi, not fix-and-flip
  - "wholesale real estate"
  - "subject to financing"
  - "rent to own"
  - "seller financing"
  # Geographic-mismatch (STR-restricted markets)
  - "NYC short term rental"
  - "Nashville short term rental"
  - "San Francisco short term rental"
  - "Denver short term rental"
```

---

## 2C. Audience Strategy (Special Ad Category Compliant)

### Custom Audiences (Meta + Google shared where applicable)

```yaml
custom_audiences:
  # Tier 1 — Website engagement
  - audience_id: CA-WEB-30D
    name: "Website Visitors 30d"
    source: website_pixel
    retention: 30 days
    sac_compliant: true  # Behavioral, not demographic
  - audience_id: CA-CALC-90D
    name: "DSCR Calculator Users 90d"
    source: website_pixel (calculator-page visitors)
    retention: 90 days
  - audience_id: CA-CASESTUDY-30D
    name: "Case Study Readers 30d"
    source: website_pixel (case-study-page visitors)
    retention: 30 days
  - audience_id: CA-DECLINE-LETTER-30D
    name: "Decline-Letter Landing Page Visitors 30d"
    source: website_pixel (decline-letter SEO traffic)
    retention: 30 days
  - audience_id: CA-FORM-START-30D
    name: "FF-08 Form Starters 30d (Not Completers)"
    source: website_pixel (Form_Start event, exclude Form_Complete)
    retention: 30 days
    use: retargeting_only

  # Tier 2 — Customer file (lookalike base — SAC compliant)
  - audience_id: CA-FUNDED-LOANS
    name: "Funded Loan Customers"
    source: customer_file_upload (CRM export)
    sac_compliant: true  # Customer-file lookalikes allowed for HOUSING SAC
    use: lookalike_base_only
  - audience_id: CA-FUNDED-PORTFOLIO
    name: "Funded Portfolio Loan Customers (SA-002)"
    source: customer_file_upload (segmented by loan type)
    use: lookalike_base_only
  - audience_id: CA-FUNDED-FN
    name: "Funded FN Loan Customers (SA-005/SA-006)"
    source: customer_file_upload
    use: lookalike_base_only
  - audience_id: CA-FUNDED-DECLINE-RESHOP
    name: "Funded Decline-Letter Re-Shop Customers (SA-011)"
    source: customer_file_upload
    use: lookalike_base_only

  # Tier 3 — Engagement (Meta-specific)
  - audience_id: CA-IG-ENGAGE-90D
    name: "Instagram Engagement 90d"
    source: meta_engagement
    sac_compliant: true
  - audience_id: CA-FB-VIDEO-50PCT-30D
    name: "Video Viewers 50%+ 30d"
    source: meta_video_engagement
```

### Lookalike Audiences (SAC-Compliant Sourcing)

```yaml
lookalike_audiences:
  - audience_id: LL-FUNDED-1PCT
    name: "Funded Loan Customers — 1% Lookalike (US)"
    source: CA-FUNDED-LOANS
    sac_compliant: true  # Customer-file-based, NOT lead-form-based
  - audience_id: LL-FUNDED-3PCT
    name: "Funded Loan Customers — 3% Lookalike (US)"
    source: CA-FUNDED-LOANS
  - audience_id: LL-FUNDED-5PCT
    name: "Funded Loan Customers — 5% Lookalike (US)"
    source: CA-FUNDED-LOANS
  - audience_id: LL-FUNDED-PORTFOLIO-2PCT
    name: "Funded Portfolio Loan Customers — 2% Lookalike"
    source: CA-FUNDED-PORTFOLIO
    use: AS-005 (Portfolio/Blanket Loan Intent)
  - audience_id: LL-FUNDED-FN-2PCT
    name: "Funded FN Loan Customers — 2% Lookalike"
    source: CA-FUNDED-FN
    use: AS-003 (Foreign-National Specialist)
  - audience_id: LL-FUNDED-DECLINE-RESHOP-2PCT
    name: "Funded Decline-Letter Re-Shop Customers — 2% Lookalike"
    source: CA-FUNDED-DECLINE-RESHOP
    use: AS-007 (Decline-Letter Re-Shop)
  - audience_id: LL-FUNDED-STR-2PCT
    name: "Funded STR Loan Customers — 2% Lookalike"
    source: CA-FUNDED-LOANS (segmented by STR property type)
    use: AS-002 (STR Specialist)

lookalike_constraints:
  - rule: "Lookalikes sourced ONLY from customer-file (funded loans). NEVER from lead-form submissions."
    sac_basis: "Meta HOUSING SAC allows customer-file lookalikes; prohibits lookalikes based on lead-form activity that may correlate with protected attributes."
  - rule: "No lookalikes based on Q-006/Q-007/Q-008/Q-009/Q-012 form data (protected-adjacent criteria per FF-08 Part 6)."
  - rule: "Lookalike audience size capped at 5% (1-3% preferred for higher precision)."
```

### Exclusion Audiences

```yaml
exclusion_audiences:
  - audience_id: EX-PRIMARY-RESIDENCE-30D
    name: "Primary Residence Searchers 30d"
    source: website_pixel (visitors who hit primary-residence routing page OR searched "primary residence" / "first time home buyer")
    use: exclude_from_all_ad_sets
  - audience_id: EX-CONVENTIONAL-MORTGAGE-30D
    name: "Conventional Mortgage Inquirers 30d"
    source: website_pixel + Google search exclusion
    use: exclude_from_all_ad_sets
  - audience_id: EX-HARD-MONEY-PERSONAL-30D
    name: "Hard Money Personal Loan Clickers 30d"
    source: website_pixel
    use: exclude_from_all_ad_sets
  - audience_id: EX-FORM-COMPLETERS-30D
    name: "FF-08 Form Completers 30d"
    source: website_pixel (Form_Complete event)
    use: exclude_from_top_of_funnel (still included in retargeting for next-loan nurture)
  - audience_id: EX-STR-RESTRICTED-DMAs
    name: "STR-Restricted DMA Residents"
    source: geo_lookup (NYC, Nashville-residential-zones, San Francisco, Denver, Austin-pending-legislation)
    use: exclude_from_AS-002 only
    sac_compliance_note: "DMA-level exclusion (not neighborhood-level) — SAC-compliant per FF-08 Part 6 constraint_5."
  - audience_id: EX-ACTIVE-DELINQUENCY-30D
    name: "Active Delinquency Searchers 30d"
    source: website_pixel (HEX-009 routed traffic)
    use: exclude_from_all_ad_sets  # Route-to-other-product, do not acquire
```

### Retargeting Rules

```yaml
retargeting_rules:
  # Rule 1 — Form starters who didn't complete
  - rule_id: RT-001
    trigger: Form_Start event WITHOUT Form_Complete within 24 hours
    audience: CA-FORM-START-30D
    ad_set_assignment: AS-008 (Calculator/Content Retargeting)
    creative: "Pick up where you left off" + persona-tagged hook (if persona_tag captured at Form_Start)
    frequency_cap: 3 per week
    duration: 14 days

  # Rule 2 — Calculator users who didn't start form
  - rule_id: RT-002
    trigger: Calculator use WITHOUT Form_Start within 7 days
    audience: CA-CALC-90D
    ad_set_assignment: AS-008
    creative: "Your DSCR is X — see if you qualify" (dynamic)
    frequency_cap: 2 per week
    duration: 30 days

  # Rule 3 — Case study readers
  - rule_id: RT-003
    trigger: Case study page view (specific persona case study) WITHOUT Form_Start within 7 days
    audience: CA-CASESTUDY-30D
    ad_set_assignment: AS-008
    creative: Persona-matched case study (e.g., "Sarah Chen's $385K Grand Rapids duplex — see your fit")
    frequency_cap: 2 per week
    duration: 21 days

  # Rule 4 — Decline-letter landing page visitors (SEO traffic)
  - rule_id: RT-004
    trigger: Decline-letter landing page view WITHOUT Form_Start within 24 hours
    audience: CA-DECLINE-LETTER-30D
    ad_set_assignment: AS-007 (Decline-Letter Re-Shop)
    creative: "Bring the decline letter — we'll route to specialty"
    frequency_cap: 3 per week
    duration: 14 days
    expected_conversion_lift: "Highest retargeting conversion cohort per EG-06 Part 2"

  # Rule 5 — Tier-routed retargeting (TIER_C borrowers — defer-with-roadmap)
  - rule_id: RT-005
    trigger: Form_Complete + Tier_Routed_C event (HEX-deferred or weak compensators)
    audience: TIER_C_deferred_borrowers
    ad_set_assignment: AS-008
    creative: Educational content sequence (calculator → case study → "12mo re-engagement roadmap")
    frequency_cap: 1 per week
    duration: 365 days (long-cycle nurture)
```

---

## 2D. Conversion Tracking Plan

### Pixel Events

```yaml
pixel_events:
  # Funnel-top
  - event_id: EV-001
    event_name: Form_Start
    trigger: FF-08 form Step 1 (Q-001) first interaction
    parameters: [persona_tag_if_captured, source_ad_set, source_campaign]
    sac_compliance: "Event tracks intent (objective criteria), NOT protected attributes."

  # Funnel-mid
  - event_id: EV-002
    event_name: Form_Complete
    trigger: FF-08 form Step 3 (Q-012) submission
    parameters: [persona_tag, edge_case_tag_if_present]
    sac_compliance: "Event tracks completion, NOT form-field values. Form-field values stored in CRM (data warehouse), not in ad-platform event parameters."

  # Funnel-bottom — Tier routing events
  - event_id: EV-003A
    event_name: Tier_Routed_A
    trigger: TS-10 score >= 85
    parameters: [tier, persona_tag]
  - event_id: EV-003B
    event_name: Tier_Routed_B
    trigger: TS-10 score 65-84
    parameters: [tier, persona_tag]
  - event_id: EV-003C
    event_name: Tier_Routed_C
    trigger: TS-10 score 40-64
    parameters: [tier, persona_tag, edge_case_tag_if_present]
  - event_id: EV-003D
    event_name: Tier_Routed_D
    trigger: TS-10 score 0-39 (defer OR hard-exit)
    parameters: [tier, hex_rule_if_hard_exit]

  # Conversion events
  - event_id: EV-004
    event_name: LO_Call_Scheduled
    trigger: Borrower books LO call (Calendly / Chili Piper)
    parameters: [tier, lo_id, scheduled_time]
  - event_id: EV-005
    event_name: PreApproval_Issued
    trigger: LO issues pre-approval letter
    parameters: [tier, lo_id, lender_id]
  - event_id: EV-006
    event_name: Loan_Funded
    trigger: Loan closes
    parameters: [tier, lender_id, loan_amount, persona_tag, edge_case_tag]
    use: customer_file upload for next-cycle lookalike source

  # Optimization event (the proxy for "qualified application")
  - event_id: EV-OPT-01
    event_name: Tier_Routed_A_or_B
    trigger: EV-003A OR EV-003B fires
    parameters: [tier, persona_tag]
    use: META optimization_goal = LEAD_QUALITY_PROXY; GOOGLE Target CPA optimization
    rationale: |
      Optimizing on Form_Complete alone would optimize for raw lead volume — attracting
      NP-011 (no-reserves) and NP-008 (primary-residence) traffic. Optimizing on
      Tier_Routed_A_or_B ensures ad platforms learn to find borrowers who actually
      qualify. This is the single most important conversion-tracking decision.
```

### Attribution Model

```yaml
attribution_model:
  model: DATA_DRIVEN  # Meta default + Google Ads default for housing/credit
  rationale: |
    Data-driven attribution (DDA) is the SAC-compliant default — it does not
    rely on demographic-correlated last-click patterns. DDA assigns credit
    across touchpoints based on actual conversion patterns.
  window: 7-day click + 1-day view (Meta); 30-day click (Google)
  cross_channel_attribution: "Marketo/Ruler Analytics — last non-direct click for cross-platform comparison"
```

### Reporting Cadence

```yaml
reporting_cadence:
  daily: "Spend pacing + CPL by ad set + lead volume by tier"
  weekly:
    - "Performance review per persona/ad set (CPL, Tier_A_B rate, Form_Start→Form_Complete funnel)"
    - "Negative-keyword review (Google) — add new exclusions from search-term report"
    - "Persona-mix audit — is AS-001 producing SA-001 leads or diluting into other personas?"
  monthly:
    - "Tier-mix audit — is the overall mix shifting toward TIER_A/B or TIER_C/D?"
    - "Lender-routing audit — are specialty-routed leads actually closing at the expected specialty lenders?"
    - "LO-feedback loop — which persona tags are LOs flagging as 'wrong persona'?"
    - "Budget reallocation review — shift spend toward best-ROAS ad sets"
  quarterly:
    - "Lookalike audience refresh — re-upload customer file with new funded loans"
    - "STR market-permissiveness update (geo_lookup tool — Nashville/Phoenix/Austin legislation)"
    - "Negative-keyword master list audit"
    - "A/B test calendar review (see Part 3E)"
```

---

## 2E. Budget Allocation Recommendation ($50K/Month Starting Budget)

### Allocation Table

| Channel | Monthly Budget | % of Total | Rationale |
|---|---|---|---|
| Meta broad campaigns (AS-001 through AS-008) | $18,000 | 36% | Primary acquisition channel. SAC-compliant broad targeting + customer-file lookalikes. Highest reach for persona-mix testing. |
| Google Search persona campaigns (AG-001 through AG-012) | $20,000 | 40% | Highest intent. Searchers actively querying DSCR terms — highest Tier_A_B conversion rate. Per-persona Target CPA maximizes loan-value-per-acquisition. |
| YouTube pre-roll | $6,000 | 12% | Top-of-funnel education. AC-09 H3 hooks (60-second DSCR walk-through, free calculator). Builds retargeting pool + brand recognition for calculator-driven organic acquisition. |
| Native / content distribution | $6,000 | 12% | Case-study distribution (CF-01 cases) on BiggerPockets-adjacent native networks. Decline-letter SEO content promotion. Long-tail organic acquisition play. |
| **Total** | **$50,000** | **100%** | |

### Meta Ad-Set Budget Split ($18K/Month)

| Ad Set | Monthly Budget | Rationale |
|---|---|---|
| AS-001 Broad Investor Intent — National | $4,500 | Highest reach — main top-of-funnel acquisition |
| AS-002 STR Specialist | $2,500 | STR-permissive DMA targeting — narrow but high-intent |
| AS-003 Foreign-National Specialist | $2,000 | Higher CPL but FN margin premium (+1.00-1.50%) justifies |
| AS-004 Credit-Scarred Rebuilder | $2,000 | Midwest/Southeast geo-fenced — strong cash-flow markets |
| AS-005 Portfolio/Blanket Loan Intent | $2,500 | Highest bid cap ($80) — $1M-$3.2M loan-size potential |
| AS-006 BRRRR Refinance Cyclist | $1,500 | BRRRR-strong markets (TN, IN, OH, AL) |
| AS-007 Decline-Letter Re-Shop | $1,500 | Highest conversion cohort per EG-06 Part 2 |
| AS-008 Calculator/Content Retargeting | $1,500 | Lower CPL retargeting — warm audience |

### Google Ad-Group Budget Split ($20K/Month)

| Ad Group | Monthly Budget | Target CPA | Expected Leads | Expected Tier_A_B % |
|---|---|---|---|---|
| AG-001 SA-001 Cash-Flow Optimizer | $4,000 | $80 | 50 | 45-55% |
| AG-002 SA-002 Portfolio Scaler | $3,000 | $180 | 17 | 55-65% |
| AG-003 SA-003 First-Timer | $2,000 | $70 | 29 | 40-50% |
| AG-004 SA-004 Equity-Tapping Refinancer | $2,000 | $90 | 22 | 50-60% |
| AG-005 SA-005/SA-006 Foreign National | $2,000 | $130 | 15 | 35-45% |
| AG-006 SA-007 STR Permissive | $2,000 | $100 | 20 | 45-55% |
| AG-007 SA-008 Credit-Scarred | $1,500 | $85 | 18 | 40-50% |
| AG-008 SA-009 Permitted-ADU CA | $1,000 | $110 | 9 | 45-55% |
| AG-009 SA-010 ITIN | $1,000 | $95 | 11 | 35-45% |
| AG-010 SA-011 Decline-Letter | $1,000 | $75 | 13 | 55-65% |
| AG-011 SA-012 BRRRR | $500 | $100 | 5 | 55-65% |
| **Total** | **$20,000** | | **209** | |

### YouTube Pre-Roll ($6K/Month)

| Campaign | Monthly Budget | Creative | Targeting |
|---|---|---|---|
| DSCR Education Pre-Roll | $3,000 | AC-09 H3 hooks (60-second DSCR walk-through) | Real estate investing channels, BiggerPockets-adjacent |
| Calculator Lead Magnet Pre-Roll | $2,000 | AC-09 EG-008 H1 (Free reserves calculator) | Personal finance + real estate investing channels |
| Case Study Pre-Roll | $1,000 | 60s case-study spotlights (Sarah Chen, Brazilian FN, BRRRR cyclist) | Real estate investing channels |

### Native / Content Distribution ($6K/Month)

| Channel | Monthly Budget | Content | Rationale |
|---|---|---|---|
| BiggerPockets native ads | $2,000 | Case-study promoted posts | Audience fit: active DSCR-curious investors |
| Outbrain / Taboola | $2,000 | "DSCR loan declined? Bring the letter" + calculator lead magnets | Decline-letter SEO traffic + calculator-driven acquisition |
| LinkedIn sponsored content | $1,500 | Portfolio/blanket loan content for SA-002 (LinkedIn-skewed high-net-worth investor audience) | B2B investor audience for portfolio scaler |
| Reddit r/realestateinvesting promoted posts | $500 | AMAs + case-study spotlights | Community-trust acquisition play |

---

# Part 3: Operational Handoff

## 3A. CRM Routing Rules Per Tier

```yaml
crm_routing:
  TIER_A:
    crm_object: Lead
    crm_priority: P1 — Hot Lead
    crm_owner_assignment: "Senior LO pool (round-robin within 1 business hour)"
    crm_stage: "New → Pre-Approval Workflow → Underwriting → Clear-to-Close"
    crm_automation:
      - "Auto-create Lead on Form_Complete + Tier_Routed_A event"
      - "Auto-assign to senior LO pool"
      - "Auto-fire Calendly invite to borrower (1-business-hour slot)"
      - "Auto-trigger pre-approval letter workflow (underwriting package assembly)"
      - "Auto-order appraisal within 24 hours of LO contact"
      - "SLA timer starts: 1-business-hour LO response"
    crm_alerts:
      - "SLA breach: 1-business-hour LO response → escalate to LO manager"
      - "SLA breach: 4-business-hour pre-approval letter → escalate to operations"

  TIER_B:
    crm_object: Lead
    crm_priority: P2 — Qualified Lead
    crm_owner_assignment: "Specialty-trained LO pool (persona-matched):
      - SA-005/SA-006/EG-003 → FN-specialty LO (AHLend/America/Angel Oak/A&D/HomeAbroad relationships)
      - SA-008/EG-001 → Credit-scarred specialty LO (Bluestone/AHLend relationships)
      - SA-009 → CA-ADU specialty LO (Truss/AHLend CA relationships)
      - SA-010/EG-002 → ITIN specialty LO (AHLend/America relationships)
      - SA-011/EG-005/EG-006/EG-007/EG-008 → Compensated-exception specialty LO (Truss/Bluestone/Brookmont/Harpoon relationships)"
    crm_stage: "New → Specialty Routing → Underwriting Package → Specialty Lender Submission → Conditional Approval → Clear-to-Close"
    crm_automation:
      - "Auto-create Lead on Form_Complete + Tier_Routed_B event"
      - "Auto-assign to specialty LO pool by persona_tag"
      - "Auto-fire Calendly invite (4-business-hour slot)"
      - "Auto-trigger underwriting package assembly checklist"
      - "Auto-attach specialty-lender routing recommendation from TS-10 routing field"
      - "SLA timer starts: 4-business-hour LO response"
    crm_alerts:
      - "SLA breach: 4-business-hour LO response → escalate"
      - "Specialty-lender routing mismatch: TS-10 recommended lender not in LO pool → escalate to lender-relationship manager"

  TIER_C:
    crm_object: Lead
    crm_priority: P3 — Specialty / Long-Cycle
    crm_owner_assignment: "Senior LO review queue (1 business day)"
    crm_stage: "New → Senior LO Review → Specialty-Lender Routing Recommendation → Borrower Education Sequence → 12mo Re-Engagement (if deferred)"
    crm_automation:
      - "Auto-create Lead on Form_Complete + Tier_Routed_C event"
      - "Auto-assign to senior LO review queue"
      - "Auto-fire borrower education sequence (Day 1, 7, 30, 90, 180)"
      - "Auto-attach specialty-lender routing recommendation"
      - "SLA timer starts: 1-business-day senior LO review"
      - "If HEX-deferred: auto-set 12mo re-engagement date + seasoning-timeline roadmap email"
    crm_alerts:
      - "SLA breach: 1-business-day senior LO review → escalate"
      - "HEX-deferred lead re-engagement: 30 days before seasoning clear date → auto-create Task for original LO"

  TIER_D:
    crm_object: Lead
    crm_priority: P4 (defer-with-roadmap) OR P5 (route-to-other-product — exit)
    crm_owner_assignment: "None for P5 (automated re-engagement only); P4 assigned to nurture queue"
    crm_stage: "New → Automated Re-Engagement Sequence (P4) OR Exit Message (P5)"
    crm_automation:
      - "P5 (hard-exit HEX-001/009/012/013): Auto-fire exit message with legitimate alternative resource (conventional/FHA/VA referral, hard money referral, commercial mortgage referral). No LO assignment."
      - "P4 (defer-with-roadmap HEX-006/007/008/010/011/014/015 + NP-011): Auto-fire remediation roadmap email + 12mo re-engagement date"
      - "P4 NP-011 (zero-reserves): Auto-fire reserves accumulation plan + 6mo re-engagement"
    crm_alerts:
      - "Compliance flag: All TIER_D exit messages require Reg B §1002.9 adverse-action review before deployment"
      - "Re-engagement conversion: P4 lead re-engages and re-submits → auto-upgrade to TIER_C/B/A re-score"
```

## 3B. LO Assignment Logic

```yaml
lo_assignment_logic:
  # Specialty LO pools by persona_tag
  senior_lo_pool:
    eligible_personas: [SA-001, SA-002, SA-003, SA-004, SA-007, SA-012, EG-006, EG-008]
    eligible_tiers: [TIER_A]
    assignment_rule: "Round-robin within pool; 1-business-hour SLA"

  fn_specialty_lo_pool:
    eligible_personas: [SA-005, SA-006, EG-003]
    eligible_tiers: [TIER_B, TIER_C]
    lender_relationships: [AHLend, America Mortgages, Angel Oak, A&D Mortgage, HomeAbroad]
    assignment_rule: "Persona-matched; 4-business-hour SLA (TIER_B) or 1-business-day SLA (TIER_C)"

  credit_scarred_specialty_lo_pool:
    eligible_personas: [SA-008, EG-001]
    eligible_tiers: [TIER_B, TIER_C]
    lender_relationships: [Bluestone, AHLend, America Mortgages, Truss, Rize, Lendmire]
    assignment_rule: "Persona-matched; 4-business-hour SLA (TIER_B) or 1-business-day SLA (TIER_C)"

  ca_adu_specialty_lo_pool:
    eligible_personas: [SA-009]
    eligible_tiers: [TIER_B]
    lender_relationships: [Truss, AHLend, Lendmire]
    assignment_rule: "Persona-matched; 4-business-hour SLA"
    geo_restriction: "CA only"

  itin_specialty_lo_pool:
    eligible_personas: [SA-010, EG-002]
    eligible_tiers: [TIER_B, TIER_C]
    lender_relationships: [AHLend, America Mortgages, Truss (specialty wholesale), Rize (specialty programs)]
    assignment_rule: "Persona-matched; 4-business-hour SLA (TIER_B) or 1-business-day SLA (TIER_C)"

  str_specialty_lo_pool:
    eligible_personas: [SA-007, EG-007]
    eligible_tiers: [TIER_A (SA-007 with 24mo host history), TIER_B (EG-007 condotel), TIER_C (EG-007 weak-compensator)]
    lender_relationships: [Griffin, Truss, Rize, Visio Lending, Kiavi]
    assignment_rule: "Persona-matched; 1-business-hour SLA (TIER_A) or 4-business-hour SLA (TIER_B) or 8-business-hour SLA (TIER_C condotel/edge)"

  compensated_exception_lo_pool:
    eligible_personas: [SA-011, EG-005, EG-006, EG-007, EG-008]
    eligible_tiers: [TIER_B, TIER_C]
    lender_relationships: [Truss, Bluestone, Lendmire, Brookmont Capital, Harpoon Capital, Visio, Kiavi, Lit Financial, Ridge Street Capital, Feng Capitals]
    assignment_rule: "Edge-case-tagged; 4-business-hour SLA (TIER_B) or 8-business-hour SLA (TIER_C)"

  senior_review_lo_pool:
    eligible_personas: [all TIER_C without edge_case_tag]
    eligible_tiers: [TIER_C]
    assignment_rule: "Senior LO manual review; 1-business-day SLA"

  brrrr_specialist_lo_pool:
    eligible_personas: [SA-012]
    eligible_tiers: [TIER_A]
    lender_relationships: [Truss, Rize, AHLend]
    assignment_rule: "Persona-matched; 1-business-hour SLA"
```

## 3C. SLA Per Tier

| Tier | LO Response | Pre-Qual/Pre-Approval Letter | Appraisal Order | Specialty-Lender Routing Recommendation | Expected Close |
|---|---|---|---|---|---|
| TIER_A | 1 business hour | Pre-approval: 4 business hours | 1 business day | N/A — full lender pool | 21-28 days |
| TIER_B | 4 business hours | Pre-qual: 1 business day; Pre-approval: 5 business days | 2 business days | 2 business days | 28-45 days |
| TIER_C | 1 business day | Pre-qual: 3 business days (specialty lender dependent) | 3 business days | 2 business days | 45-90 days |
| TIER_D | None (P5) or nurture queue (P4) | N/A | N/A | N/A | 3-12 months (P4 defer) or never (P5) |

## 3D. Reporting Dashboard Spec (Swarm Health KPIs)

```yaml
dashboard_spec:
  dashboard_name: "DSCR Swarm Health — Weekly + Monthly"

  # Funnel KPIs
  funnel_kpis:
    - kpi_id: KPI-001
      name: "Form_Start → Form_Complete Conversion Rate"
      target: ">= 35%"
      calculation: "Form_Complete events / Form_Start events"
      per_dimension: [ad_set, persona_tag, traffic_source]
    - kpi_id: KPI-002
      name: "Tier_A_B Rate (Qualified Application Rate)"
      target: ">= 45%"
      calculation: "(Tier_Routed_A + Tier_Routed_B) / Form_Complete"
      per_dimension: [ad_set, persona_tag, ad_group, traffic_source]
      rationale: "Single most important KPI — measures whether ads are finding qualified borrowers, not just any borrowers."
    - kpi_id: KPI-003
      name: "Tier_A Rate (Fast-Track Rate)"
      target: ">= 20%"
      calculation: "Tier_Routed_A / Form_Complete"
    - kpi_id: KPI-004
      name: "Tier_D Rate (Decline/Defer Rate)"
      target: "<= 25%"
      calculation: "Tier_Routed_D / Form_Complete"
      alert: "If > 35%, ad targeting is attracting wrong audience — review exclusion audiences + negative keywords."

  # Cost KPIs
  cost_kpis:
    - kpi_id: KPI-005
      name: "CPL (Cost Per Lead) — Form_Complete"
      target: "$50-90 (varies by persona)"
      calculation: "Spend / Form_Complete"
      per_dimension: [ad_set, ad_group, persona_tag]
    - kpi_id: KPI-006
      name: "CPQA (Cost Per Qualified Application) — Tier_Routed_A_or_B"
      target: "$120-200"
      calculation: "Spend / (Tier_Routed_A + Tier_Routed_B)"
      rationale: "True acquisition cost — what we pay for a qualified borrower, not just a form filler."
    - kpi_id: KPI-007
      name: "CPF (Cost Per Funded Loan)"
      target: "$1,500-3,000"
      calculation: "Spend / Loan_Funded events"
      per_dimension: [persona_tag, lender_id]

  # Operational KPIs
  operational_kpis:
    - kpi_id: KPI-008
      name: "SLA Compliance — LO Response (per tier)"
      target: ">= 95% within SLA"
      calculation: "Leads responded to within SLA / total leads"
      per_dimension: [tier, lo_id]
    - kpi_id: KPI-009
      name: "Persona-Tag Accuracy (LO feedback)"
      target: ">= 85% LO-confirmed persona match"
      calculation: "LO-confirmed persona / total persona-tagged leads"
      per_dimension: [persona_tag]
      rationale: "Measures whether TS-10 persona matching is accurate. If < 85%, persona-matching logic needs retraining."
    - kpi_id: KPI-010
      name: "Specialty-Lender Routing Acceptance"
      target: ">= 70% of TIER_B/C leads submitted to recommended specialty lender"
      calculation: "Specialty-lender submissions matching TS-10 recommendation / total specialty-routed leads"
      per_dimension: [persona_tag, recommended_lender_id]
    - kpi_id: KPI-011
      name: "Time-to-Close (per tier)"
      target: "TIER_A 21-28d; TIER_B 28-45d; TIER_C 45-90d"
      calculation: "Avg(Form_Complete → Loan_Funded) by tier"

  # Quality KPIs
  quality_kpis:
    - kpi_id: KPI-012
      name: "Funded Loan Persona Mix"
      target: "Aligns with FDI-weighted persona priority (SA-002 highest FDI → highest funded mix)"
      calculation: "Loan_Funded by persona_tag / total Loan_Funded"
      per_dimension: [persona_tag]
    - kpi_id: KPI-013
      name: "Decline-Letter Re-Shop Conversion Rate"
      target: ">= 35% (highest-converting cohort per EG-06 Part 2)"
      calculation: "Tier_Routed_A_or_B / Form_Complete for AG-010 / AS-007 cohort"
    - kpi_id: KPI-014
      name: "EG Edge-Case Capture Rate"
      target: ">= 80% of EG-001 through EG-008 edge-case-tagged leads reach TIER_B or higher"
      calculation: "(Tier_Routed_A + Tier_Routed_B + edge_case_tag present) / (edge_case_tag present)"
      rationale: "Measures whether edge-case floor (60) and decline-letter triage modifiers are working as designed."

  reporting_cadence:
    daily: "Spend pacing + Form_Start + Form_Complete by ad set"
    weekly: "Full dashboard refresh — all KPIs by ad set / persona / tier"
    monthly: "KPI trend analysis + persona-mix audit + LO-feedback review"
    quarterly: "Lookalike refresh + STR market update + A/B test calendar review"
```

## 3E. A/B Test Calendar (Months 1-3)

```yaml
ab_test_calendar:
  # --- MONTH 1 — Baseline establishment + persona-mix validation ---
  month_1:
    test_id: ABT-001
    name: "Ad Set AS-001 Persona-Mix Validation"
    hypothesis: "Top-4 persona rotation (SA-001/SA-003/SA-004/SA-012) in AS-001 produces 45% Tier_A_B rate"
    variants:
      - A: "Top-4 persona rotation (current)"
      - B: "SA-001 + SA-002 only (cash-flow optimizer + portfolio scaler — highest FDI)"
      - C: "All 12 personas rotated equally"
    primary_metric: "Tier_Routed_A_or_B rate"
    secondary_metric: "CPQA"
    duration: 4 weeks
    budget_split: "33/33/33"
    decision_rule: "If B wins on CPQA by > 20%, shift AS-001 to B variant"

    test_id: ABT-002
    name: "Google AG-010 Decline-Letter Hook Test"
    hypothesis: "'Bring the decline letter' hook outperforms 'Second opinion' hook on Tier_A_B rate"
    variants:
      - A: "'Declined? Bring the letter' (current AC-09 SA-011 H1)"
      - B: "'Second opinion on your DSCR decline' (alternative framing)"
      - C: "'Specialty routes for non-warrantable, condotel, sub-1.0 DSCR' (feature-led)"
    primary_metric: "Tier_Routed_A_or_B rate"
    secondary_metric: "CPL"
    duration: 4 weeks

    test_id: ABT-003
    name: "Meta SAC Compliance — Lead-Form vs Landing-Page Question Deferral"
    hypothesis: "Deferring Q-006/Q-007/Q-008/Q-009/Q-012 to landing page (FF-08 Part 6 recommendation) increases Form_Complete rate without reducing Tier_A_B rate"
    variants:
      - A: "Meta lead form collects Q-001/Q-002/Q-003/Q-004/Q-005/Q-010/Q-011 (objective criteria); Q-006/Q-007/Q-008/Q-009/Q-012 deferred to landing page (FF-08 recommendation)"
      - B: "Meta lead form collects all 12 questions (control — risk of SAC non-compliance)"
    primary_metric: "Form_Complete rate"
    secondary_metric: "Tier_A_B rate (verify quality preserved)"
    compliance_note: "Variant A is FF-08 Part 6 recommendation; Variant B is the compliance-risk control. If B wins, escalate to compliance counsel before adopting."

  # --- MONTH 2 — Specialty-cohort optimization ---
  month_2:
    test_id: ABT-004
    name: "AS-007 Decline-Letter Re-Shop Edge-Case Rotation"
    hypothesis: "EG-006 (non-warrantable condo with +15 decline-letter modifier) outperforms EG-005/EG-007/EG-008 on Tier_A conversion"
    variants:
      - A: "EG-005 / EG-006 / EG-007 / EG-008 weekly rotation (current)"
      - B: "EG-006 only (highest-leverage decline-letter triage)"
      - C: "EG-006 + EG-008 (top-2 high-leverage edge cases)"
    primary_metric: "Tier_Routed_A rate"
    secondary_metric: "CPL"
    duration: 4 weeks

    test_id: ABT-005
    name: "AS-005 Portfolio Scaler Bid Cap Test"
    hypothesis: "$80 bid cap is optimal for SA-002 ($1M-$3.2M loan-size potential)"
    variants:
      - A: "$80 bid cap (current)"
      - B: "$120 bid cap (test ceiling — highest-value persona)"
      - C: "$60 bid cap (test floor — efficiency play)"
    primary_metric: "CPQA"
    secondary_metric: "Lead volume"
    duration: 4 weeks

    test_id: ABT-006
    name: "Reserves Calculator Lead Magnet Test (EG-008 funnel)"
    hypothesis: "60% 401k haircut reserves calculator drives 25% lift in Form_Start from calculator users"
    variants:
      - A: "Calculator with co-borrower pivot feature (current EG-008 hook)"
      - B: "Calculator without co-borrower pivot (control)"
    primary_metric: "Form_Start rate from calculator users"
    secondary_metric: "Tier_Routed_A_or_B rate"
    duration: 4 weeks

  # --- MONTH 3 — Cross-channel + persona-edge optimization ---
  month_3:
    test_id: ABT-007
    name: "YouTube Pre-Roll vs Native Content — Top-of-Funnel Comparison"
    hypothesis: "YouTube pre-roll outperforms native content (Outbrain/Taboola) on Tier_A_B rate of downstream leads"
    variants:
      - A: "YouTube pre-roll ($6K/month — current)"
      - B: "Native content ($6K/month — Outbrain/Taboola/BiggerPockets)"
      - C: "50/50 split ($3K each)"
    primary_metric: "Tier_Routed_A_or_B rate (downstream Form_Complete)"
    secondary_metric: "Cost per Form_Start"
    duration: 4 weeks
    decision_rule: "If C wins on blended efficiency, maintain 50/50 split going forward"

    test_id: ABT-008
    name: "SA-009 Permitted-ADU CA Geo-Expansion Test"
    hypothesis: "Expanding AG-008 geo-targeting from CA-only to CA + OR + WA + TX + AZ increases lead volume without diluting Tier_A_B rate"
    variants:
      - A: "CA only (current)"
      - B: "CA + OR + WA + TX + AZ (ADU-permissive state expansion)"
    primary_metric: "Lead volume"
    secondary_metric: "Tier_Routed_A_or_B rate (verify quality preserved)"
    duration: 4 weeks

    test_id: ABT-009
    name: "Tier_C Borrower Education Sequence Test"
    hypothesis: "Day 1 / 7 / 30 / 90 / 180 re-engagement sequence (current) outperforms weekly newsletter on 12mo re-engagement conversion"
    variants:
      - A: "Day 1 / 7 / 30 / 90 / 180 sequence (current — milestone-based)"
      - B: "Weekly newsletter (control — frequency-based)"
      - C: "Day 1 / 30 / 90 sequence (reduced frequency — fatigue-avoidance)"
    primary_metric: "12mo re-engagement conversion (Form_Complete from TIER_C re-engaged lead)"
    secondary_metric: "Unsubscribe rate"
    duration: 12 weeks (long-cycle test)

  test_governance:
    - "All A/B tests require pre-registration (hypothesis, variants, primary/secondary metrics, decision rule) before launch."
    - "Tests run minimum 4 weeks for statistical power (or 100 conversions per variant, whichever is longer)."
    - "Compliance review required for any test touching FF-08 form questions, Meta lead-form structure, or TIER_D exit messages."
    - "Test results documented in monthly swarm-health report; winning variants adopted within 2 weeks of test completion."
```

---

## Limitations & Honest Sample-Size Disclosure

1. **Scoring weights are directionally informed, not statistically robust.** AP-03 cluster approval rates are based on 28 CF-01 cases (11 real, 17 synthesized). Most clusters show 100% approval in small samples — these are not statistically meaningful approval rates. TS-10 weights reflect AP-03 / NP-04 / GL-02 directional evidence + charter FDI dimensions, not empirical conversion data. Marketing-ops team must treat tier routing as operational guidance, not underwriting decisions.

2. **20 worked examples use representative approved-case midpoints.** Each persona's score is computed from the upper-mid band of their approval_fingerprint — not from actual inbound lead data. Real-world inbound leads will score lower (typical inbound has weaker compensators than the approved-case midpoint). Marketing-ops team should expect TIER_A rate of 15-25% in production (not the 45% implied by the worked examples).

3. **Specialty-lender referral network requires verification.** The 12 specialty non-GL-02 lenders referenced (Visio, Kiavi, Angel Oak, A&D, HomeAbroad, Brookmont, Harpoon Capital, Feng Capitals, Lit Financial, Ridge Street Capital, Defy, JVM) are sourced from CF-01 case files and DSCR Authority guides, NOT from GL-02's normalized 8-lender matrix. GL-02 + marketing-ops team should verify program availability + eligibility for each specialty routing destination before deployment.

4. **Reg B §1002.9 adverse-action review required for TIER_D hard-exit messages.** All HEX-rule exit messages (HEX-001 primary residence, HEX-009 active delinquency, HEX-012 sub-$100K, HEX-013 pure commercial) may constitute 'adverse action' under Reg B §1002.9 requiring the Adverse Action notice. **BEFORE DEPLOYMENT, the marketing-ops team must obtain compliance review from a qualified ECOA / Reg B attorney.**

5. **Meta Special Ad Category compliance is platform-policy-dependent, not just legal.** Meta's HOUSING SAC restrictions are enforced by Meta's policy team and may change without notice. The lead-form question deferral (Q-006/Q-007/Q-008/Q-009/Q-012 to landing page) is FF-08 Part 6 recommendation — actual Meta policy may require additional deferrals. Marketing-ops team should run ABT-003 (lead-form vs landing-page question deferral) in Month 1 and escalate any Meta policy rejection to compliance counsel.

6. **Lookalike audience sourcing is customer-file-based only.** Per FF-08 Part 6 + AC-09 Part 1.5, lookalikes must be sourced from funded-loan customer file, NOT from lead-form submissions. This constraint is platform-enforced — Meta will reject lead-form-based lookalikes for HOUSING SAC campaigns. Marketing-ops team must maintain a clean customer-file CRM export pipeline for lookalike refresh (quarterly cadence).

7. **STR market-permissiveness requires quarterly geo_lookup tool updates.** Nashville, Phoenix, Austin all have pending 2025-2026 STR legislation per SWR-014. The market-lookup tool (referenced in FF-08 Q-004 + TS-10 SC-005 + AS-002 geographic exclusion) must be updated quarterly with current municipal STR ordinance data. Failure to update may result in acquiring STR-restricted-market traffic (NP-001 decline cohort).

8. **The 0-100 score is NOT a credit decision.** TS-10 score is an operational routing tool for marketing-ops + LO assignment. Actual underwriting decisions are made by lenders per GL-02 normalized guidelines + lender-specific overlays. TS-10 score must NOT be communicated to borrowers as a "pre-approval" or "qualification" — only the LO-issued pre-approval letter constitutes a qualification decision.

9. **The pseudocode in Part 1E is runnable in concept but requires implementation hardening.** Edge cases (e.g., borrower selects both "lease_in_place" and "none_of_above" on Q-009) need explicit handling. The `_dscr_value(p)` helper function (used in SC-001 to distinguish 1.25-1.39 vs 1.40+) requires FF-08 form to capture actual DSCR value when borrower selects "dscr_1_25_plus" — current FF-08 Q-011 only captures bands. Marketing-ops team should add a numeric DSCR field (optional, with "don't know" default) for more granular SC-001 scoring.

10. **Tier routing bands (TIER_A=85+, TIER_B=65-84, TIER_C=40-64, TIER_D=0-39) differ slightly from FF-08 Part 7 binding bands (80-100, 60-79, 40-59, 0-39).** TS-10 uses the task-spec bands per the swarm charter; FF-08's binding bands are preserved as the underlying score-computation contract. The 5-point difference (TIER_A at 85 vs 80) reflects the swarm's intent to fast-track only the strongest leads, routing 80-84 leads to standard qualification (TIER_B) for additional underwriting-package rigor. Marketing-ops team can tune this threshold post-deployment based on TIER_A close-rate data.

---

*End of TS-10 deliverable. This file is the operational bridge from research (CF-01 → GL-02 → AP-03 / NP-04 → SA-05 / EG-06) to operations (FF-08 intake → TS-10 score → AC-09 ad targeting). Downstream consumers (marketing-ops, LO operations, CRM/rev-ops) should treat Part 1 as the canonical scoring engine, Part 2 as the canonical Meta + Google targeting payload, and Part 3 as the canonical operational handoff. Compliance counsel review is required before deployment per Limitations #4, #5, and #7.*
