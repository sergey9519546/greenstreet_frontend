# EG-06 — Edge-Case Gold Miner

**Agent:** EG-06 Edge-Case Gold Miner
**Phase:** 3 of 5 (parallel with SA-05)
**Task:** Hunt 5–8 non-obvious but fundable DSCR borrower personas — the "false positives" that conventional funnels reject but AP-03 + NP-04 evidence shows are actually fundable with the right lender, structure, or documentation.
**Inputs:**
- `/home/z/my-project/download/agent_outputs/CF01_case_files.md` (28 cases, 12 negative-or-marginal — the gold mine of "shop the decline letter" pivots)
- `/home/z/my-project/download/agent_outputs/AP03_approval_patterns.md` (9 approval clusters, 14 accelerants, 12 decelerants)
- `/home/z/my-project/download/agent_outputs/NP04_decline_patterns.md` — **Part 5: False-Positive Risk Notes (FP-001 through FP-015)** is the canonical source list
- `/home/z/my-project/download/agent_outputs/GL02_normalized_guidelines.md` (8 lender programs + 12 compensating-factor patterns)

**Output consumers:** SA-05 (ensure edge personas are distinct from P1–P8 main personas), FF-08 (intake must CAPTURE not repel edge cases), AC-09 (copy must not repel edge cases), TS-10 (do not apply FP-pattern deltas as negative scores).

---

## Methodology Note

- Each persona here is a **counter-balance** to an NP-04 red-zone rule. NP-04 catalogs what kills files; EG-06 catalogs what LOOKS dead but isn't.
- Every persona must have working lender referrals from GL-02's lender list (Truss, Rize, AHLend, America Mortgages, Lendmire, Bluestone, Griffin, Newfi + specialty non-GL-02 references when named in CF-01 sources: Visio Lending, Kiavi, Angel Oak, A&D Mortgage, HomeAbroad, Brookmont, Harpoon Capital, Feng Capitals, Lit Financial, Ridge Street Capital).
- Every persona must have **specific** unlock conditions (not "be a stronger borrower") — concrete LTV haircut, reserve months, entity structure, seasoning window, or specialty-lender routing.
- Every persona references its NP-04 false-positive ID (FP-xxx) AND its AP-03 cluster ID AND its CF-01 case ID(s). This triangulation prevents persona drift.
- "Strategic value" scores (1–10) reflect: how badly competitors miss this segment (underserved), how premium the pricing tolerance is (margin), how often they return (repeat), and how much referral-network effect exists (edge cases cluster — ITIN borrowers know ITIN borrowers; non-warrantable condo investors know other non-warrantable condo investors).
- Compliance guardrails are honest. Fair-lensing risk is flagged where present (ITIN, foreign-national, credit-event-recovery personas are fair-lensing-sensitive; property-type personas are lower-risk but still have disclosure obligations).

---

## Part 1: Edge-Case Persona Catalog

### EG-001 — The Post-Short-Sale Comeback

```yaml
persona_id: EG-001
persona_name: "The Post-Short-Sale Comeback"
edge_case_type: credit_event_recovery
one_line_description: "Seasoned past a short sale or foreclosure, cash-rich, credit-rebuilt — fundable at specialty lenders."

# Why this borrower LOOKS un-fundable
surface_red_flags:
  - "Short sale, deed-in-lieu, or foreclosure in last 1–4 years (most recent credit event = recent adverse event)"
  - "Chapter 7 bankruptcy discharged 24–60 months ago (sub-seasoning at standard programs)"
  - "Mid-tier FICO (620–699) — below the 700+ that mainstream marketing copy implies is the floor"
  - "Prior housing-history narrative contains 'event' language that filters flag"

# Why this borrower IS fundable
hidden_fundability:
  - "Short sale seasoning 12–24mo accepted at AHLend, Lendmire, Newfi, America Mortgages with 25% down + 1.30 DSCR + 12mo reserves (NP-04 FP-001)"
  - "Foreclosure 24mo seasoning accepted at specialty programs when FICO ≥700; 36mo seasoning is standard-program minimum (HEX-007)"
  - "Chapter 7 bankruptcy 48mo standard / 24–36mo specialty — CF-028 closed at 60mo seasoning with FICO 645 + compensators"
  - "Post-event credit rebuild (3–6mo on-time payments, utilization <30%) is documented compensator that moves conditions → clean approval"
  - "Midwest 2–4 unit cash-flow-rich property structurally supports the 1.30+ DSCR needed to offset FICO tier (Cleveland 'highest cash-flow yields' per DSCR Authority)"

# Required structure to unlock approval
unlock_conditions:
  - "LTV reduced to 65–70% (vs. 75% mainstream) — 25–35% down payment"
  - "Reserves increased to 12–18 months PITIA (vs. 6mo mainstream)"
  - "DSCR 1.30+ (vs. 1.25 best-tier) — strong cash flow required to offset FICO tier"
  - "Specialty lender routing: Bluestone (550 FICO floor), AHLend (620 floor), America (640 floor), Truss/Rize (620 floor)"
  - "Pricing premium accepted: +50–100bps for below-floor FICO; +25bps for specialty seasoning programs"
  - "Post-event credit rebuild documentation: 3–6mo on-time payment history, <30% utilization"
  - "Midwest 2–4 unit or Sunbelt SFR preferred (rent-to-value ratio >1.0%)"

# Lender fit list
lenders_likely_to_fund: [Bluestone, AHLend, America Mortgages, Truss, Rize, Lendmire]
lenders_likely_to_decline: [Newfi (residential 1-4 unit only + stricter seasoning overlay), Griffin (STR-focused, less competitive on credit-scarred LTR)]

# Approval fingerprint when properly structured
approval_fingerprint:
  DSCR_band: [1.30, 1.45]
  FICO_band: [620, 699]
  LTV_band: [0.65, 0.70]
  reserves_months_band: [12, 18]
  property_type_fit: [2-4_unit, SFR]
  occupancy_fit: [long_term_rental]
  geo_fit: [OH-Cleveland, OH-Cincinnati, MO-StLouis, IN-Indianapolis, PA-Pittsburgh, MI-Detroit, AL-Birmingham, TN-Memphis]

# Why this is a high-opportunity segment
strategic_value:
  underserved_by_competitors: 9   # "no recent credit events" copy repels this entire cohort
  margin_potential: 8              # +50–100bps premium accepted; specialty-lender margin preserved
  repeat_borrowing_likelihood: 8   # post-seasoning DSCR borrowers typically rebuild FICO 30–50pts in 6–12mo and refinance → second loan
  referral_value: 8                # credit-recovery communities (BiggerPockets, Credit Karma forums) refer aggressively

# Source evidence
evidence_case_ids: [CF-024, CF-028]
evidence_cluster_ids: [AP-008]
np04_false_positive_id: FP-001
notes: |
  CF-024 is the cautionary tale: foreclosure 30mo + FICO 680 + 75% LTV + 9mo reserves + 1.20 DSCR = decline
  (missed 36mo standard window AND missed 24mo specialty window because FICO <700). The fundable variant
  is exactly the same borrower 6 months later: 36mo seasoning cleared, OR FICO rebuilt to 700+ to unlock
  24mo specialty program. CF-028 is the resolved version: 60mo seasoning + 645 FICO + 70% LTV + 12mo
  reserves + 1.36 DSCR = approved at Bluestone-tier lender. The unlock is seasoning-OR-FICO, not both —
  FF-08 must collect both fields and route based on whichever clears first.
```

---

### EG-002 — The ITIN US-Resident Investor

```yaml
persona_id: EG-002
persona_name: "The ITIN US-Resident Investor"
edge_case_type: ITIN_resident
one_line_description: "US resident with work permit, no SSN, has ITIN — fundable between FN and standard tiers."

# Why this borrower LOOKS un-fundable
surface_red_flags:
  - "No SSN — triggers conventional-funnel rejection ('SSN required' copy filters them out)"
  - "Limited US credit file (2 credit cards + 1 prior auto loan, 18mo history vs. 7+ years mainstream)"
  - "FICO appears mid-tier (660–700) due to thin file, not weak credit"
  - "Bilingual documentation needs (Spanish-language loan paperwork not standard at all lenders)"

# Why this borrower IS fundable
hidden_fundability:
  - "AHLend + America Mortgages explicitly accept ITIN in lieu of SSN (GL-02 Part 1 GL02-003, GL02-004)"
  - "ITIN tier pricing sits between pure FN and US borrower (+25–75bps vs. US; CF-019 closed at +50bps)"
  - "ITIN borrowers are US RESIDENTS — AML friction materially lower than pure FN (no FIRPTA, no foreign-source funds trail)"
  - "2–4 unit property selection offsets thin credit: combined unit rents support DSCR with smaller individual unit economics"
  - "ITIN is NOT the same as no-credit-country FN — CF-019 closed at 75% LTV (vs. 60% for no-credit-country FN) on the strength of US residency + work permit"

# Required structure to unlock approval
unlock_conditions:
  - "ITIN issued via CAA (Certified Acceptance Agent) — 11+ week lead time; start the ITIN application BEFORE property shopping"
  - "2–3 US tradelines with 18+ months history (credit cards, auto loan, prior installment loan)"
  - "9 months PITIA reserves (vs. 6mo standard for US borrower)"
  - "12 months US bank statements + employment verification letter supplementing thin credit file"
  - "LLC vesting (standard for ITIN tier)"
  - "2–4 unit property preferred (higher rents support DSCR with thinner credit)"
  - "DSCR 1.15–1.25 (clears 1.00–1.15 2-4 unit floor; below 1.25 best-tier is acceptable for ITIN tier)"
  - "Specialty lender routing: AHLend (ITIN core), America Mortgages (ITIN eligible)"

# Lender fit list
lenders_likely_to_fund: [AHLend, America Mortgages, Truss (specialty wholesale), Rize (specialty programs)]
lenders_likely_to_decline: [Newfi (residential only + not FN-focused — does not publish ITIN path), Griffin (STR-focused)]

# Approval fingerprint when properly structured
approval_fingerprint:
  DSCR_band: [1.15, 1.25]
  FICO_band: [660, 700]   # ITIN-based FICO from limited US file
  LTV_band: [0.70, 0.80]
  reserves_months_band: [9, 12]
  property_type_fit: [2-4_unit, SFR]
  occupancy_fit: [long_term_rental]
  geo_fit: [FL-Miami, FL-Orlando, FL-Tampa, TX-Houston, TX-Dallas, TX-SanAntonio, CA-LosAngeles, IL-Chicago, NY-NYC, AZ-Phoenix]

# Why this is a high-opportunity segment
strategic_value:
  underserved_by_competitors: 10   # 'SSN required' + 'US citizens only' copy filters them out almost everywhere
  margin_potential: 7               # +50bps ITIN premium accepted; pricing sits between FN and standard
  repeat_borrowing_likelihood: 8    # ITIN borrowers acquire 2–4 properties over 5 years per DSCR Authority
  referral_value: 9                 # ITIN borrowers refer to ITIN-eligible communities; bilingual landing pages critical

# Source evidence
evidence_case_ids: [CF-019]
evidence_cluster_ids: [AP-006]
np04_false_positive_id: FP-002
notes: |
  CF-019 Miami FL 2-unit at $560K value, 75% LTV, 1.20 DSCR, 9mo reserves, ITIN-based 680 FICO, +50bps
  premium — approved_with_conditions. The single most undermarketed DSCR segment: AHLend and America
  publish ITIN eligibility but neither runs dedicated ITIN marketing campaigns (verified via GL-02 source
  fetches). Bilingual landing pages + ITIN-aware intake = white-space acquisition channel. CAUTION: see
  Part 3 Compliance — ITIN is a proxy for national origin; ad targeting cannot use demographic language.
```

---

### EG-003 — The No-Credit-Country Foreign National

```yaml
persona_id: EG-003
persona_name: "The No-Credit-Country Foreign National"
edge_case_type: foreign_national_no_credit
one_line_description: "Investor from LatAm/Asia/Africa with no Nova-Credit-translatable credit — fundable at 60% LTV."

# Why this borrower LOOKS un-fundable
surface_red_flags:
  - "No US credit history (no SSN, no ITIN, no US FICO)"
  - "No international credit bureau equivalent in home country (Brazil, Russia, Nigeria, Vietnam, etc. — no Nova Credit translation)"
  - "Foreign-source funds require 2–4 week AML clearance (delayed closing risk)"
  - "FIRPTA withholding structure adds tax-counsel coordination"

# Why this borrower IS fundable
hidden_fundability:
  - "AHLend + America Mortgages are FN-native — 'No US credit required' is a published feature, not a barrier (GL-02 Part 1)"
  - "Specialty FN portfolio lenders (Angel Oak, A&D Mortgage, HomeAbroad) actively write no-credit-country FN tier per CF-018 source"
  - "Prior real estate sale in home country provides clean source-of-funds narrative (CF-018: Brazil sale → Orlando FL purchase)"
  - "Florida market selection: no state income tax + landlord-friendly = '#1 DSCR market' per DSCR Authority; deep FN-investor comp set"
  - "12mo international bank statements extend underwriting 5–7 days but rarely decline on documentation alone (CF-018 approval_conditions)"

# Required structure to unlock approval
unlock_conditions:
  - "40% down payment (60% LTV cap — no-credit-country FN tier per CF-018)"
  - "12 months PITIA reserves in US bank, seasoned 90 days"
  - "Source-of-funds paper trail: prior real estate sale closing statement + 12mo international bank statements with certified English translation + USD conversion"
  - "Valid passport + B1/B2 visa stamp (or ESTA if visa-waiver country)"
  - "US LLC with EIN (file Form SS-4 by fax — 4–6 week processing) + operating agreement drafted by US attorney"
  - "FIRPTA withholding structure reviewed by tax counsel (15% withholding on dispositions — borrower structure matters)"
  - "DSCR 1.30+ (well above 1.25 best-tier) to compensate for no-credit tier"
  - "Specialty lender routing: AHLend, America Mortgages, Angel Oak, A&D Mortgage, HomeAbroad"
  - "Pricing premium accepted: +1.00–1.50% vs. US borrower; $1,500 FN underwriting fee"

# Lender fit list
lenders_likely_to_fund: [AHLend, America Mortgages, Truss (specialty wholesale), Rize (specialty), Lendmire (specialty), Bluestone (specialty), Griffin (affiliate)]
lenders_likely_to_decline: [Newfi (residential 1-4 unit only, not FN-focused — GL-02 Part 1 GL02-008)]

# Approval fingerprint when properly structured
approval_fingerprint:
  DSCR_band: [1.30, 1.45]
  FICO_band: ["n/a — credit requirement waived at specialty FN programs"]
  LTV_band: [0.60, 0.65]
  reserves_months_band: [12, 12]
  property_type_fit: [SFR]
  occupancy_fit: [long_term_rental]
  geo_fit: [FL-Orlando, FL-Miami, FL-Tampa, FL-Jacksonville, TX-Houston, TX-Dallas, TX-SanAntonio, AZ-Phoenix, NV-LasVegas]

# Why this is a high-opportunity segment
strategic_value:
  underserved_by_competitors: 9    # Newfi explicitly excludes FN; specialty FN marketing by AHLend/America is thin
  margin_potential: 10              # +1.25% premium (highest in this catalog); $1,500 FN fee; specialty-lender margin preserved
  repeat_borrowing_likelihood: 6    # lower than strong-credit-country FN due to friction per loan, but 1–2 follow-on properties common
  referral_value: 8                 # FN communities refer within diaspora networks; HomeAbroad built a business on this

# Source evidence
evidence_case_ids: [CF-018, CF-017]
evidence_cluster_ids: [AP-005]
np04_false_positive_id: FP-003
notes: |
  CF-018 (Brazilian borrower, Orlando FL, $380K SFR, 60% LTV, 1.36 DSCR, 12mo reserves, +1.25% premium,
  $1,500 fee) is the canonical case. CF-017 (UK FN, Houston TX) is the strong-credit-country counterpart —
  70% LTV + +0.50% premium + 9mo reserves. The delta (10pts LTV + 75bps premium + 3mo reserves) is the
  price of no-credit-country status. Borrowers who can document prior real estate sale (clean source-of-
  funds narrative) materially reduce AML friction. CAUTION: see Part 3 Compliance — FN nationality is
  fair-lensing-adjacent; cannot target by country of origin in ad copy.
```

---

### EG-004 — The Sub-1.0 DSCR With Compensators

```yaml
persona_id: EG-004
persona_name: "The Sub-1.0 DSCR With Strong Compensators"
edge_case_type: sub_1.0_DSCR_with_compensators
one_line_description: "Cash-flow-negative on paper but cash-rich, low-LTV, deep reserves — fundable at AHLend/Lendmire/Newfi."

# Why this borrower LOOKS un-fundable
surface_red_flags:
  - "Initial DSCR calculation falls between 0.75 and 0.99 (below universal 1.00 floor)"
  - "Negative cash flow on subject property at standard LTV"
  - "Property in higher-cost market where rent-to-value ratios don't support 1.00+ at 20% down (CF-008: 0.81 at 20% down)"

# Why this borrower IS fundable
hidden_fundability:
  - "Newfi publishes 0.80 DSCR floor (lowest in this set per GL-02 Part 1 GL02-008) — 'supports underperforming properties with long-term potential'"
  - "AHLend + Lendmire allow 0.75 DSCR with compensating factors (GL-02 Part 4 CF-01 pattern)"
  - "America Mortgages publishes 'below 1:1 and no-ratio DSCR scenarios available with compensating factors' (GL-02 Part 1 GL02-004)"
  - "CF-008 Sarah Chen Grand Rapids duplex: 0.81 DSCR at 20% down → 1.00 at 35% down → 1.08 at 40% down → 1.12 at 42% down (approved)"
  - "Compensating-factor pattern is documented at AHLend, Lendmire, Newfi, America — this is a published program feature, not an exception"

# Required structure to unlock approval
unlock_conditions:
  - "LTV reduced to 65–70% (vs. 75% mainstream) — 30–35% down payment"
  - "FICO 700+ (vs. 660 mainstream floor) — credit strength compensates for DSCR weakness"
  - "Reserves 12+ months PITIA (vs. 6mo mainstream)"
  - "3+ financed properties track record (established investor — proves cash-flow management)"
  - "Specialty lender routing: Newfi (0.80 floor), AHLend (0.75 with compensators), Lendmire (0.75 with compensators), America (no-ratio path)"
  - "Pricing premium accepted: +25–75bps for sub-1.0 DSCR overlay"
  - "Documented long-term plan: appreciation thesis, rent-growth trajectory, or BRRRR stabilization roadmap"
  - "OPTIONAL: Interest-only period (Lendmire offers IO followed by 20-yr amortization — materially improves DSCR)"

# Lender fit list
lenders_likely_to_fund: [Newfi, AHLend, Lendmire, America Mortgages]
lenders_likely_to_decline: [Truss (1.00 floor + <1.0 only via exception), Rize (1.00 floor + hard money redirect for DSCR <1.0 + credit at floor), Bluestone (1.00 floor), Griffin (1.25 preferred)]

# Approval fingerprint when properly structured
approval_fingerprint:
  DSCR_band: [0.75, 1.00]
  FICO_band: [700, 760]
  LTV_band: [0.58, 0.70]
  reserves_months_band: [12, 18]
  property_type_fit: [SFR, 2-4_unit]
  occupancy_fit: [long_term_rental]
  geo_fit: [appreciation markets — MI-GrandRapids, TN-Nashville-LTR, NC-Charlotte, TX-Austin-LTR, FL-Tampa, AZ-Phoenix, CO-Denver-LTR]

# Why this is a high-opportunity segment
strategic_value:
  underserved_by_competitors: 9    # '1.25+ DSCR required' copy repels this entire cohort
  margin_potential: 7               # +25–75bps premium accepted; lower-LTV pricing offsets some of the risk premium
  repeat_borrowing_likelihood: 8    # appreciation-market investors systematically acquire below-1.0 DSCR properties
  referral_value: 7                 # BRRRR community + appreciation-market investor forums refer aggressively

# Source evidence
evidence_case_ids: [CF-008, CF-011]
evidence_cluster_ids: [AP-009]
np04_false_positive_id: FP-004
notes: |
  CF-008 is the textbook case: Sarah Chen, 755 FICO, 58% LTV ($161,700 down on $385K), 6mo reserves, 1.12
  DSCR — approved at Lit Financial. The borrower's journey (0.81 → 1.00 → 1.08 → 1.12 at 20%/35%/40%/42%
  down) is the playbook. CF-011 is the portfolio-context variant: 1.04 DSCR with -$267/mo subject cash
  flow approved ONLY because $3,200/mo aggregate positive cash flow across 10 other properties — this is
  the NP-010 cluster (thin-DSCR cash-out refi). Two paths exist: (a) LTV-haircut path (CF-008); (b)
  portfolio-aggregate path (CF-011). FF-08 must collect BOTH single-property numbers AND portfolio context
  to route correctly. SWR-010 in NP-04 (-15 score impact) should NOT block these leads — TS-10 must route
  to AHLend/Lendmire/Newfi intake, not auto-decline.
```

---

### EG-005 — The Unpermitted-ADU Pivot

```yaml
persona_id: EG-005
persona_name: "The Unpermitted-ADU Pivot"
edge_case_type: unpermitted_adu_pivot
one_line_description: "SFR with prior-owner unpermitted ADU — fundable at specialty lender treating property as SFR."

# Why this borrower LOOKS un-fundable
surface_red_flags:
  - "ADU built by prior owner without permits — unpermitted (8–14 month permit cure timeline in San Diego, LA, Bay Area)"
  - "Mainline DSCR lender excludes ADU income from DSCR calc → DSCR drops from 1.40 to 1.00 (floor, not best-tier) per CF-021"
  - "Borrower is unwilling to wait 8–14 months for permit cure (would lose purchase opportunity)"
  - "Appraisal on SFR-with-unpermitted-ADU is non-standard — many appraisers exclude ADU contributory value"

# Why this borrower IS fundable
hidden_fundability:
  - "Specialty DSCR lenders qualify file as SFR (ADU ignored for income AND value) at reduced LTV (CF-021 pivot path)"
  - "LTV haircut from 75% to 70% + 25bps rate premium is the entire pricing cost — same borrower profile, same property"
  - "ADU does NOT preclude eligibility at specialty lender per Harpoon Capital guide: 'If the ADU is unpermitted, it may still be allowed on the property... but its value will not be counted in the LTV ratio'"
  - "ADU income still collects in operation even if not in qualification — borrower gets the rent without the qualification benefit, but loan closes"
  - "Permit cure is a post-close option, not pre-close requirement — borrower can pursue permit while owning"

# Required structure to unlock approval
unlock_conditions:
  - "LTV reduced from 75% to 70% (5pt haircut) — specialty-lender SFR treatment"
  - "Loan amount recalculated at SFR-only value (ADU excluded from appraisal)"
  - "DSCR recalculated on primary-house rent only (ADU income excluded from qualification)"
  - "Appraiser must comment on ADU; ADU value excluded from appraisal (Harpoon Capital guide)"
  - "Rate premium +25bps for unpermitted-ADU overlay (CF-021 approval_conditions)"
  - "Specialty lender routing: Harpoon Capital (ADU specialist), Truss (specialty wholesale), Rize (case-by-case)"
  - "ADU permit-cure plan documented (post-close roadmap) — even if not required pre-close, demonstrates borrower sophistication"
  - "LLC vesting (standard)"

# Lender fit list
lenders_likely_to_fund: [Harpoon Capital (specialty ADU), Truss (specialty wholesale), Rize (case-by-case), Lendmire (specialty)]
lenders_likely_to_decline: [Newfi (residential 1-4 unit only — SFR-with-ADU classification inconsistent), AHLend (excludes commercial but ADU-agnostic), Bluestone (subject to stricter volatility overlays), Griffin (STR-focused, not ADU-focused)]

# Approval fingerprint when properly structured
approval_fingerprint:
  DSCR_band: [1.00, 1.30]   # 1.00 floor on SFR-only income; 1.30 if ADU income can be counted
  FICO_band: [700, 740]
  LTV_band: [0.70, 0.75]    # 70% post-pivot
  reserves_months_band: [6, 9]
  property_type_fit: [SFR_with_unpermitted_ADU]
  occupancy_fit: [long_term_rental]
  geo_fit: [CA-LosAngeles, CA-SanDiego, CA-BayArea, CA-Sacramento, OR-Portland, WA-Seattle, TX-Austin, AZ-Phoenix]

# Why this is a high-opportunity segment
strategic_value:
  underserved_by_competitors: 9    # 'permitted ADU only' copy repels this cohort
  margin_potential: 7               # +25bps premium; 5pt LTV haircut preserves margin
  repeat_borrowing_likelihood: 8    # CA ADU-savvy investors systematically buy SFR-with-ADU; ~12,000 LA DBS permits 2017-2024 (CF-020 source)
  referral_value: 8                 # ADU investor communities (LA DBS workshops, ADU Academy) refer aggressively

# Source evidence
evidence_case_ids: [CF-021, CF-020]
evidence_cluster_ids: [AP-009, AP-007]
np04_false_positive_id: FP-005
notes: |
  CF-021 San Diego $850K SFR + unpermitted ADU: 1.40 DSCR with ADU / 1.00 without → mainline decline →
  pivot to specialty at 70% LTV + 25bps premium = approved. CF-020 LA $950K SFR + permitted ADU is the
  "permitted" counterpart — same property type, no pivot needed. The two cases together prove the ADU
  spectrum: permitted (AP-007 main persona) vs unpermitted (EG-005 edge case). SWR-015 in NP-04 (-8 score
  impact) should trigger specialty-lender routing, NOT auto-decline. CAUTION: ADU disclosure — see Part 3
  Compliance — borrower must be informed ADU income is excluded from qualification but still collectable
  in operation (not a misrepresentation issue if documented).
```

---

### EG-006 — The Non-Warrantable Condo Specialist

```yaml
persona_id: EG-006
persona_name: "The Non-Warrantable Condo Specialist"
edge_case_type: non_warrantable_condo
one_line_description: "Condo complex with >50% investor concentration, HOA litigation, or hotel conversion — fundable at specialty."

# Why this borrower LOOKS un-fundable
surface_red_flags:
  - "Condo complex investor concentration >50% (above Fannie warrantability threshold)"
  - "Pending HOA litigation (even minor slip-and-fall triggers non-warrantable flag per CF-023)"
  - "Hotel conversion or non-compliant HOA financials"
  - "Standard residential DSCR lenders (AHLend, Newfi) auto-decline non-warrantable"

# Why this borrower IS fundable
hidden_fundability:
  - "~Half-dozen DSCR lenders actively write non-warrantable DSCR per DSCR Authority decline-reasons guide (CF-023 source)"
  - "Borrower profile strength does NOT need to change — CF-023 had 1.36 DSCR + 720 FICO + 6mo reserves; decline was lender-fit issue, not file issue"
  - "Specialty non-warrantable DSCR available at: Truss (specialty wholesale), Bluestone (broader property-type eligibility per GL-02), Lendmire (specialty), Brookmont Capital (CF-009 source)"
  - "Property is financeable — just not at standard residential DSCR programs. Counteroffer at 70% LTV (vs. 75%) + 25–50bps premium typically closes"
  - "Non-warrantable condo investor concentration often correlates with strong rental markets (Chicago Loop, Miami Beach, Phoenix urban core) — borrower thesis is sound"

# Required structure to unlock approval
unlock_conditions:
  - "LTV reduced from 75% to 70% (5pt haircut) — non-warrantable overlay"
  - "DSCR 1.25+ (vs. 1.00 floor) — stronger cash flow required to offset property-type risk"
  - "25–50bps rate premium for non-warrantable overlay"
  - "Specialty lender routing: Truss, Bluestone, Lendmire, Brookmont Capital, Rize (case-by-case)"
  - "HOA questionnaire completed (HOA litigation status, investor concentration %, financials, master insurance)"
  - "Documented 12mo operating history on similar condo (if available) OR market-rent Form 1007 with comparable non-warrantable condos"
  - "LLC vesting (standard)"
  - "12mo reserves (vs. 6mo standard) — condo-typical assessments require deeper reserves"

# Lender fit list
lenders_likely_to_fund: [Truss, Bluestone, Lendmire, Brookmont Capital, Rize (case-by-case)]
lenders_likely_to_decline: [AHLend (condotel/non-warrantable excluded), Newfi (residential 1-4 unit only), America Mortgages (conservative), Griffin (STR-focused, not condo-specialty)]

# Approval fingerprint when properly structured
approval_fingerprint:
  DSCR_band: [1.25, 1.40]
  FICO_band: [700, 740]
  LTV_band: [0.70, 0.75]
  reserves_months_band: [6, 12]
  property_type_fit: [non_warrantable_condo]
  occupancy_fit: [long_term_rental, short_term_rental]
  geo_fit: [IL-Chicago-Loop, FL-Miami-Beach, FL-FortLauderdale, AZ-Phoenix-urban, NY-NYC-midtown, NV-LasVegas-Strip-adjacent, TX-Houston-Galleria]

# Why this is a high-opportunity segment
strategic_value:
  underserved_by_competitors: 8    # 'warrantable condos only' copy repels this cohort
  margin_potential: 7               # +25–50bps premium; LTV haircut preserves margin
  repeat_borrowing_likelihood: 7    # non-warrantable condo investors systematically acquire similar assets
  referral_value: 7                 # condo-investor networks (BiggerPockets condo subforum) refer within specialty

# Source evidence
evidence_case_ids: [CF-023]
evidence_cluster_ids: [AP-009]
np04_false_positive_id: FP-006
notes: |
  CF-023 Chicago Loop $365K condo: 1.36 DSCR + 720 FICO + 6mo reserves + 75% LTV = declined at standard
  residential DSCR (investor concentration 58% + pending slip-and-fall HOA litigation). Pivot path: re-
  shop to Truss/Bluestone/Lendmire/Brookmont at 70% LTV + 25–50bps premium. Same borrower, same property,
  different lender = approval. HEX-005 in NP-04 (route_to_specialty_intake, NOT auto-reject) is the
  correct FF-08 action. SWR-008 (appraisal-risk flag) applies because condo appraisal comps in non-
  warrantable complexes are harder to source — pre-appraisal comp pull recommended.
```

---

### EG-007 — The Condotel STR Investor

```yaml
persona_id: EG-007
persona_name: "The Condotel STR Investor"
edge_case_type: non_warrantable_condo
one_line_description: "Hotel-condo conversion with front-desk rental program — fundable at STR-condotel specialty."

# Why this borrower LOOKS un-fundable
surface_red_flags:
  - "Condotel (hotel-condo conversion with front-desk rental program) excluded at AHLend, Newfi explicitly (GL-02 Part 1)"
  - "Newfi residential-1-4-unit-only overlay excludes entire property class"
  - "Standard residential DSCR auto-declines — borrower may have already received a decline letter"
  - "Operating history on condotels is harder to document (front-desk management vs. direct lease)"

# Why this borrower IS fundable
hidden_fundability:
  - "Visio Lending + Kiavi have STR-condotel programs per DSCR Authority STR guide (CF-022 source)"
  - "Commercial-facing DSCR available with 30–35% down + 1.25+ DSCR + 12mo operating history"
  - "Condotels in Gulf Coast (Galveston, Destin, Panama City Beach) + Smoky Mountains (Gatlinburg) have deep comp set + STR-permissive regulatory environment"
  - "Borrower profile in CF-022 was strong (1.40 DSCR + 720 FICO + 12mo reserves) — decline was property-type overlay, not file issue"
  - "Front-desk rental program provides documented operating history that traditional SFR STR cannot match"

# Required structure to unlock approval
unlock_conditions:
  - "30–35% down payment (65–70% LTV) — commercial-facing DSCR tier"
  - "DSCR 1.25+ (vs. 1.00 floor) — STR volatility requires stronger coverage"
  - "12 months documented operating history (front-desk rental statements OR Airbnb host dashboard OR VRBO booking history)"
  - "STR-permissive market verification — Gulf Coast (TX, FL), Smoky Mountains (TN), Scottsdale AZ"
  - "Specialty lender routing: Visio Lending, Kiavi (STR-condotel specialists per CF-022 source)"
  - "Pricing premium accepted: +50–100bps for condotel overlay + STR volatility"
  - "STR permit verification (non-owner-occupied permit where required)"
  - "LLC vesting (standard for STR)"
  - "Reserves 12mo PITIA (vs. 6mo standard LTR)"

# Lender fit list
lenders_likely_to_fund: [Visio Lending (STR-condotel specialty), Kiavi (STR-condotel specialty), Truss (specialty wholesale), Lendmire (STR via AirDNA, case-by-case on condotel)]
lenders_likely_to_decline: [AHLend (condotel explicitly excluded), Newfi (residential 1-4 unit only), America Mortgages (conservative STR), Bluestone (vacation rentals subject to stricter volatility overlays), Griffin (Airbnb host-history focused, not condotel-specific), Rize (STR eligible but condotel unclear)]

# Approval fingerprint when properly structured
approval_fingerprint:
  DSCR_band: [1.25, 1.40]
  FICO_band: [700, 740]
  LTV_band: [0.65, 0.70]
  reserves_months_band: [12, 12]
  property_type_fit: [condotel, hotel_condo_conversion]
  occupancy_fit: [short_term_rental]
  geo_fit: [FL-PanamaCityBeach, FL-Destin, FL-Orlando-resort, TX-Galveston, TN-Gatlinburg, TN-PigeonForge, AZ-Scottsdale, CO-Breckenridge, SC-MyrtleBeach]

# Why this is a high-opportunity segment
strategic_value:
  underserved_by_competitors: 9    # condotel = automatic decline at 6 of 8 GL-02 lenders; borrowers receive multiple decline letters
  margin_potential: 9               # +50–100bps premium; specialty-lender margin preserved
  repeat_borrowing_likelihood: 7    # condotel investors often acquire 2–5 units in same complex
  referral_value: 7                 # condotel investor communities (resort-area HOA networks) refer within complex

# Source evidence
evidence_case_ids: [CF-022]
evidence_cluster_ids: [AP-009, AP-003]
np04_false_positive_id: FP-007
notes: |
  CF-022 Galveston TX $425K condotel: 1.40 DSCR + 720 FICO + 12mo reserves + 75% LTV = declined at AHLend
  (condotel explicitly excluded per decline taxonomy). Pivot path: re-shop to Visio Lending / Kiavi at
  65–70% LTV + 50–100bps premium + 12mo operating history. Same borrower, same property, different lender
  = approval. HEX-004 in NP-04 (route_to_specialty_intake, NOT auto-reject) is the correct FF-08 action.
  This is the highest-margin edge case in the catalog because the borrower has ALREADY received multiple
  declines — they are motivated and willing to accept premium pricing. CAUTION: STR market regulatory
  check (HEX-014) still applies — condotel in NYC, Nashville, San Francisco is hard-decline regardless of
  lender.
```

---

### EG-008 — The 401(k)-Reserves Co-Borrower Pivot

```yaml
persona_id: EG-008
persona_name: "The 401(k)-Reserves Co-Borrower Pivot"
edge_case_type: other   # reserves_documentation_pivot
one_line_description: "Reserves miscalculated on 401(k) — fundable with 60% haircut + co-borrower addition."

# Why this borrower LOOKS un-fundable
surface_red_flags:
  - "Initial reserves calc falls below 6mo PITIA (CF-026: 4mo at first lender)"
  - "Borrower applied full 401(k) balance ($35K) rather than 60% haircut ($21K) — most common reserve-calc error"
  - "Single-borrower reserves insufficient — spouse's liquid checking not initially considered"
  - "Already received a decline letter from first lender ('reserves shortfall')"

# Why this borrower IS fundable
hidden_fundability:
  - "60% 401(k)/IRA haircut is the standard reserve-calculation methodology — borrower's miscalculation, not file weakness"
  - "Co-borrower (spouse) liquid checking can supplement reserves — CF-026 added $12K spouse checking → 6.2mo PITIA cleared 6mo minimum"
  - "Lendmire publishes no-reserve-required program at ≤$1.5M loan + ≤70% LTV (GL-02 Part 1 GL02-005) — alternative path"
  - "Borrower profile is otherwise strong (CF-026: 1.27 DSCR + 720 FICO + 75% LTV + Charlotte NC market) — decline was documentation issue, not file issue"
  - "Re-shop to second lender applying correct 60% haircut is the documented 'shop the decline letter' playbook per DSCR Authority"

# Required structure to unlock approval
unlock_conditions:
  - "Apply standard 60% haircut to 401(k)/IRA balances (not full balance)"
  - "Add co-borrower (spouse) with liquid checking/savings to supplement reserves"
  - "Re-shop to second lender applying correct 60% methodology (CF-026 pivot)"
  - "OR pivot to Lendmire no-reserve-required program if loan ≤$1.5M AND LTV ≤70%"
  - "Document 60-day seasoned liquid funds (401(k) loan or 401(k) withdrawal documentation if needed to bridge)"
  - "Combined reserves ≥6mo PITIA after haircut + co-borrower addition"
  - "Form 1007 market-rent appraisal on subject property (CF-026 had 1.27 DSCR — file is strong once reserves cleared)"

# Lender fit list
lenders_likely_to_fund: [Lendmire (no-reserve at ≤$1.5M ≤70% LTV), Truss, Rize, Bluestone, AHLend, America Mortgages, Newfi — ALL lenders accept 60% 401(k) haircut methodology; issue is borrower education]
lenders_likely_to_decline: [N/A — all GL-02 lenders apply 60% haircut; first lender declined on miscalculation, not policy]

# Approval fingerprint when properly structured
approval_fingerprint:
  DSCR_band: [1.20, 1.30]
  FICO_band: [700, 740]
  LTV_band: [0.70, 0.75]
  reserves_months_band: [6, 9]
  property_type_fit: [SFR, 2-4_unit]
  occupancy_fit: [long_term_rental]
  geo_fit: [NC-Charlotte, NC-Raleigh, SC-Charleston, GA-Atlanta, TN-Nashville-LTR, FL-Tampa, TX-Dallas, AZ-Phoenix]

# Why this is a high-opportunity segment
strategic_value:
  underserved_by_competitors: 8    # borrowers self-reject after first decline; 'liquid reserves only' copy repels them
  margin_potential: 5               # standard pricing — no premium required; borrower already qualified on DSCR/FICO
  repeat_borrowing_likelihood: 9    # borrower education gap is cured after first close — second loan has no friction
  referral_value: 8                 # borrower-education content marketing funnels; "60% 401(k) haircut" calculator is a lead magnet

# Source evidence
evidence_case_ids: [CF-026]
evidence_cluster_ids: [AP-009]
np04_false_positive_id: FP-011
notes: |
  CF-026 Charlotte NC $295K SFR: 1.27 DSCR + 720 FICO + 75% LTV + 4mo reserves (miscalculated) = declined
  at first lender → re-shop + co-borrower + 60% haircut = 6.2mo reserves = approved_with_conditions.
  This is the single most preventable decline pattern in the catalog — the borrower was always fundable,
  the first lender miscalculated (or borrower self-reported wrong), and a simple education tool + co-
  borrower routing solves it. SWR-001 in NP-04 (-5 score impact) should trigger FF-08's reserves
  calculator that auto-applies 60% haircut — this is the highest-leverage intake tool per NP-04 Part 6
  handoff. Strategic insight: a "60% 401(k) haircut calculator" landing page is both a lead magnet AND a
  service to the market — high SEO value, high conversion, low acquisition cost.
```

---

## Part 2: Edge-Case Funnel-Entry Strategy

FF-08 + AC-09 must design intake that **captures** (not repels) edge cases by leading with the borrower's stated situation, not with mainstream filter language. The single highest-leverage change is a **decline-letter triage question** on the intake form: *"Have you received a decline letter on this file from another DSCR lender? If yes, what was the stated reason?"* This question (i) signals to the borrower that declines are expected and reroutable, not stigmatized; (ii) surfaces the FP-001 through FP-015 cohort in one question; (iii) routes immediately to specialty intake (AHLend for ITIN, Visio/Kiavi for condotel, Harpoon for unpermitted ADU, Bluestone for sub-660 FICO, Newfi for sub-1.0 DSCR). The question must be OPTIONAL with an "I'd rather not say / N/A" branch — some borrowers will not have a decline letter (first-time applicants) and should not feel excluded.

AC-09's copy must avoid ALL the explicit-floor language NP-04 Part 6 enumerated ("660+ FICO required", "1.25+ DSCR required", "SSN required", "US citizens only", "no recent credit events", "warrantable condos only", "permitted ADU only", "no mortgage lates ever", "liquid reserves only"). The replacement language is feature-oriented, not threshold-oriented: *"Investment properties only"* (HEX-001 primary-residence screen), *"DSCR from 0.80 with compensating factors"* (welcomes EG-004), *"Foreign-national specialists — no US credit required"* (welcomes EG-002, EG-003), *"Prior credit event? Specialty seasoning programs available"* (welcomes EG-001), *"Condotel or non-warrantable condo? Specialty lender routing"* (welcomes EG-006, EG-007), *"401(k) reserves accepted with standard haircut"* (welcomes EG-008), *"Unpermitted ADU? SFR-classification pivot available"* (welcomes EG-005). Each phrase names the edge case the borrower is in, signals competence in handling it, and does NOT promise "easy approval" (per charter Creative Guardrail). Landing pages must pair each edge-case phrase with a 1-paragraph "How we'd underwrite this" explainer — this is the conversion mechanism for borrowers who have already been declined elsewhere and are skeptical of new promises.

---

## Part 3: Compliance Guardrails

### ECOA / Reg B Fair-Lensing Risk by Persona

| Persona | Fair-Lensing Risk | Reason | Mitigation |
|---|---|---|---|
| EG-001 Post-Short-Sale Comeback | **MODERATE** | Prior bankruptcy / foreclosure / short sale correlates with protected-class characteristics (medical debt, divorce, job loss disability). "Post-bankruptcy borrower" targeting could be construed as proxy for protected class. | Do NOT target by credit-event history in ad platforms. Use **feature-language** ("Specialty seasoning programs available for investors past credit events — 24mo / 36mo / 48mo seasoning paths") not **demographic-language**. Underwriting decision governed by documented seasoning rules — that is compliant. **Marketing reach** is the risk surface, not underwriting. |
| EG-002 ITIN US-Resident Investor | **HIGH** | ITIN is a direct proxy for national origin / citizenship status — a protected class under ECOA. ANY targeting by ITIN status, Spanish language, or country-of-origin is fair-lensing risk. | Do NOT target by language preference, national-origin proxies, or ITIN status in ad platforms. Use **program-feature-language** ("ITIN accepted in lieu of SSN at AHLend + America Mortgages") on the landing page — this is a published program feature, not demographic targeting. Bilingual landing pages are permissible under ECOA's "affirmative marketing" provision (language accessibility is NOT a proxy for national origin when the product feature is itself language-relevant). Document the lender-published ITIN eligibility as the basis for outreach. |
| EG-003 No-Credit-Country Foreign National | **HIGH** | Foreign-national status is fair-lensing-adjacent; targeting by country of origin (Brazil, Russia, etc.) is national-origin targeting. | Do NOT target by country, language, or national-origin proxies. Use **program-feature-language** ("Foreign-national DSCR specialists — no US credit history required") that targets by **product feature**, not borrower class. AHLend and America Mortgages publish FN eligibility as a product feature — outreach on this basis is permissible. Document the published product feature as the basis for outreach. AML documentation requirements are lender-imposed, not borrower-imposed — they apply to all FN borrowers regardless of country. |
| EG-004 Sub-1.0 DSCR With Compensators | **LOW** | DSCR is a financial metric, not a protected-class proxy. Compensating-factor model is documented at AHLend, Lendmire, Newfi, America. | Standard ECOA compliance — underwriting decision based on documented compensating-factor policy applied uniformly. No special targeting restrictions. |
| EG-005 Unpermitted-ADU Pivot | **LOW–MODERATE** | Property-type classification, not borrower class. ADU-permit-status disclosure is required (see below). | Standard property-disclosure compliance. Borrower must be informed in writing that (i) ADU income is excluded from DSCR qualification, (ii) ADU value is excluded from appraisal, (iii) ADU income still collectable in operation. This prevents misrepresentation claims post-close. |
| EG-006 Non-Warrantable Condo Specialist | **LOW** | Property-type classification, not borrower class. HOA questionnaire is the documentation basis. | Standard property-disclosure compliance. Borrower must be informed that (i) non-warrantable overlay applies, (ii) LTV haircut + rate premium are the pricing impact, (iii) specialty-lender routing is required. |
| EG-007 Condotel STR Investor | **LOW–MODERATE** | Property-type classification. STR market regulatory check (HEX-014) applies — borrower must confirm STR permit obtainable. | Standard property-disclosure + STR-permit compliance. Borrower must be informed that (i) condotel overlay applies, (ii) specialty-lender routing is required (Visio/Kiavi), (iii) STR-permit verification is independent of lender approval. |
| EG-008 401(k)-Reserves Co-Borrower Pivot | **LOW** | Documentation methodology, not borrower class. 60% haircut is industry-standard. | Standard disclosure compliance. Borrower must be informed (i) 60% 401(k)/IRA haircut is standard methodology, (ii) co-borrower addition is a structuring option, (iii) reserves calc must clear 6mo PITIA after haircut. |

### Documentation Required to Justify Exception-Based Approval

For EVERY edge-case approval, the loan file must contain:

1. **Specialty-lender program documentation** — the lender's published guideline page (URL + retrieval date) showing the program feature that supports the exception (ITIN eligibility, sub-1.0 DSCR floor, non-warrantable eligibility, etc.). This is the ECOA "objective criteria" basis for the approval.
2. **Compensating-factor worksheet** — for any file with below-mainstream FICO, DSCR, or LTV, a written worksheet documenting (a) the weakness, (b) the compensators applied, (c) the pricing impact. This is the Reg B "written criteria" basis for differential pricing.
3. **Decline-letter re-shop documentation** — for any borrower with a prior decline, the prior decline letter + the new lender's approval rationale. This is the "shop the decline letter" audit trail.
4. **Property-type exception documentation** — for non-warrantable condo, condotel, unpermitted-ADU, mixed-use: the specific overlay that triggered the exception (HOA questionnaire, ADU permit status, property-classification memo, etc.).
5. **AML/FIRPTA documentation** — for FN edge cases (EG-003, EG-002 if applicable): foreign bank statements with certified English translation, source-of-funds letter, FIRPTA withholding structure reviewed by tax counsel.

### Pricing Disclosure Obligations

For every edge-case approval, the Loan Estimate (LE) and Closing Disclosure (CD) must clearly disclose:

1. **Rate premium** — the basis-points premium vs. standard DSCR pricing, with the compensating factor or specialty-program feature that supports it (e.g., "+50bps ITIN premium per AHLend ITIN program", "+25bps unpermitted-ADU overlay per Harpoon Capital guide").
2. **LTV haircut** — the LTV reduction vs. standard program max, with the property-type or credit-tier basis (e.g., "70% LTV vs. 75% standard for non-warrantable condo overlay").
3. **Specialty underwriting fee** — any lender-specific add-on fee (e.g., $1,000 FN underwriting fee per AHLend, $1,500 FN underwriting fee per DSCR Authority FN guide).
4. **Prepayment penalty** — for edge-case loans where prepayment penalty is required to access specialty pricing (e.g., CF-028 5-year step-down prepay), the LE must disclose the prepayment schedule and the borrower's right to opt out (with pricing impact).
5. **Reserve requirement** — the post-close reserve requirement (PITIA months) and the methodology (60% 401(k) haircut, co-borrower combined, foreign-bank-seasoned).

---

## Part 4: Edge-Case Persona vs NP-04 Hard-Decline Boundary

This table is the critical handoff to FF-08. Each row defines the BOUNDARY between (a) the fundable edge case (route to specialty intake) and (b) the NP-04 hard decline (reject or defer). FF-08 must encode this as a multi-field routing decision, not a single threshold.

| Edge-Case Persona | FUNDABLE (route to specialty intake) | HARD-DECLINE BOUNDARY (reject or defer) | NP-04 Hard-Stop Rule |
|---|---|---|---|
| **EG-001 Post-Short-Sale Comeback** | Short sale >12mo seasoning + 25% down + 1.30+ DSCR + 12mo reserves + 700+ FICO OR 36mo seasoning + 25% down + 1.25+ DSCR + 12mo reserves + 660+ FICO. Chapter 7 BK >48mo standard OR >24mo specialty with 700+ FICO. Chapter 13 BK >12mo on-plan with trustee approval. | Foreclosure <24mo (specialty floor). Chapter 7 BK <24mo (specialty floor). Active mortgage delinquency / uncured forbearance (HEX-009). Mortgage late <12mo (HEX-006 — defer 12mo, not reject). | HEX-006, HEX-007, HEX-008, HEX-009 |
| **EG-002 ITIN US-Resident Investor** | ITIN issued via CAA + 2–3 US tradelines 18+ months + 9mo reserves + 70–80% LTV + 1.15+ DSCR + employment verification letter + 12mo bank statements + LLC vesting. Specialty: AHLend, America Mortgages. | ITIN with NO US credit file at all + no reserves + 80% LTV + no LLC. SWR-012 + HEX-010 (no US LLC). ITIN borrower misrepresenting as US citizen — fraud flag. | HEX-010 (FN-no-LLC), SWR-012 (thin credit) |
| **EG-003 No-Credit-Country FN** | 40% down + 12mo reserves (US bank seasoned 90 days) + US LLC + EIN + operating agreement + AML source-of-funds trail + valid passport + B1/B2 visa + FIRPTA review + 1.30+ DSCR. Specialty: AHLend, America, Angel Oak, A&D, HomeAbroad. | <30% down + no US LLC + no AML trail + gift funds >10% of purchase. HEX-010 (no US LLC) + HEX-011 (no AML trail) + NP-012 (FN without US LLC). | HEX-010, HEX-011 |
| **EG-004 Sub-1.0 DSCR With Compensators** | DSCR 0.75–0.99 + FICO 700+ + LTV ≤65–70% + 12mo reserves + 3+ financed properties + LLC vesting. Specialty: Newfi (0.80 floor), AHLend (0.75 with compensators), Lendmire (0.75 with compensators), America (no-ratio path). | DSCR <0.75 (below specialty floor everywhere). DSCR 0.75–0.99 + FICO <660 + 75% LTV + 6mo reserves + first-time investor (no compensators). SWR-010 hard-decline if no compensators. | SWR-010 (recoverable with compensators only) |
| **EG-005 Unpermitted-ADU Pivot** | Unpermitted ADU + specialty-lender SFR classification (ADU ignored for income AND value) + LTV 70% + 25bps premium + 6–9mo reserves + DSCR 1.00+ on primary-house rent only. Specialty: Harpoon Capital, Truss, Rize case-by-case. | Unpermitted ADU + borrower insists on ADU income counted + 75–80% LTV at mainline lender. No fundable path until ADU permit cured (8–14mo in CA) OR specialty pivot accepted. SWR-015 + NP-007. | SWR-015, NP-007 |
| **EG-006 Non-Warrantable Condo** | Non-warrantable condo + 70% LTV + 1.25+ DSCR + 6–12mo reserves + 25–50bps premium + HOA questionnaire + LLC vesting. Specialty: Truss, Bluestone, Lendmire, Brookmont. | Non-warrantable condo + 75–80% LTV + 1.00–1.20 DSCR + first-time investor + no reserves beyond minimum. SWR-008 + HEX-005 outside specialty. | HEX-005 (route to specialty, NOT auto-reject) |
| **EG-007 Condotel STR Investor** | Condotel + 30–35% down (65–70% LTV) + 1.25+ DSCR + 12mo operating history + STR-permissive market + STR permit + LLC vesting. Specialty: Visio Lending, Kiavi, Truss. | Condotel in NYC/Nashville/SF (HEX-002, HEX-003, HEX-014). Condotel + 20–25% down + no operating history at standard residential DSCR (HEX-004 outside specialty). | HEX-002, HEX-003, HEX-004, HEX-014 |
| **EG-008 401(k)-Reserves Co-Borrower Pivot** | 401(k) reserves with 60% haircut applied correctly + co-borrower liquid checking added + 6.2mo PITIA after combined + DSCR 1.20+ + FICO 700+. OR Lendmire no-reserve at ≤$1.5M loan + ≤70% LTV. | No reserves at all (no 401(k), no liquid checking, no co-borrower) + 80% LTV + speculative rents + first-time investor (NP-011 hard decline — charter "Audiences to Actively Repel"). | SWR-001, NP-011 (charter hard-decline) |

### Boundary-Enforcement Rules for FF-08

1. **Every edge-case intake must collect BOTH the weak-axis metric AND the compensator-axis metric.** EG-001 must collect seasoning months AND FICO AND LTV AND reserves. EG-004 must collect DSCR AND FICO AND LTV AND reserves AND financed-properties count. Single-axis intake under-routes.
2. **If the borrower clears the FUNDABLE column on ALL axes → route to specialty intake with edge-case persona tag.** TS-10 score: 60–80 (specialty-routable, not hard-stop).
3. **If the borrower clears the FUNDABLE column on SOME axes but misses one → defer-with-roadmap.** TS-10 score: 30–50 with manual-review flag. Roadmap = the specific axis to remediate (e.g., "rebuild FICO to 700+ over next 3–6mo to unlock 24mo specialty seasoning program" per CF-024 remediation path).
4. **If the borrower falls in the HARD-DECLINE column → reject-with-redirect** (per HEX-001 through HEX-016 ff08_action). TS-10 score: 0–20 with route-to-other-product. The redirect is NOT silent — AC-09 must provide specific next-steps (conventional/FHA/VA for primary residence; commercial DSCR for >5-8 unit; hard money for <$100K loan; LTR-pivot or market-pivot for STR in NYC/Nashville).
5. **The HEX-001 / HEX-009 / HEX-012-outside-specialty / HEX-013-outside-specialty rules are PERMANENT rejections** (per NP-04 Part 6). No edge-case persona overrides these. FF-08 must NOT attempt to capture primary-residence borrowers, actively delinquent borrowers, sub-$100K loan borrowers, or pure-commercial borrowers into edge-case intake — they are not edge cases, they are outside the product.

---

## Source Manifest

| Source | Used For | Citation |
|---|---|---|
| CF-01 case files | All 8 personas — case IDs cited per persona | `/home/z/my-project/download/agent_outputs/CF01_case_files.md` |
| AP-03 approval clusters | AP-005, AP-006, AP-007, AP-008, AP-009 cluster IDs cited per persona | `/home/z/my-project/download/agent_outputs/AP03_approval_patterns.md` |
| NP-04 false-positive risk notes | FP-001 through FP-015 — every persona references its NP-04 FP ID | `/home/z/my-project/download/agent_outputs/NP04_decline_patterns.md` (Part 5) |
| NP-04 hard-exclusion rules | HEX-001 through HEX-016 — cited in Part 4 boundary table | NP-04 Part 3 |
| NP-04 soft-warning rules | SWR-001, SWR-010, SWR-012, SWR-015 — cited per persona | NP-04 Part 4 |
| GL-02 lender programs | Truss, Rize, AHLend, America, Lendmire, Bluestone, Griffin, Newfi — cited per persona lender fit list | GL-02 Part 1 |
| GL-02 compensating-factor patterns | CF-01 through CF-12 — cited in EG-004 specifically | GL-02 Part 4 |
| Specialty non-GL-02 lenders | Visio Lending, Kiavi (condotel STR); Angel Oak, A&D Mortgage, HomeAbroad (no-credit FN); Brookmont Capital (portfolio/non-warrantable); Harpoon Capital (ADU); Feng Capitals, Lit Financial, Ridge Street Capital (CF-01 source cases) | CF-01 source citations |

---

## Cross-Agent Handoff Notes

### For SA-05 (Sponsor Archetype Synthesizer)
- EG-001 through EG-008 are **distinct** from charter personas P1–P8. P7 (credit-scarred cash-rich) overlaps EG-001 in spirit but EG-001 is specifically the post-short-sale/post-foreclosure/post-bankruptcy seasoning path, not the general "credit-scarred" archetype. SA-05 should treat EG personas as a **parallel catalog** to P1–P8 — same borrower in some cases, but the EG persona is the *exception-structured* version (lower LTV, higher reserves, specialty lender). Where SA-05 personas capture the "main path" borrower, EG personas capture the "decline-letter-rerouted" version of the same borrower.
- Highest-FD edge cases (per strategic_value scores): EG-002 ITIN (9/7/8/9), EG-003 No-Credit FN (9/10/6/8), EG-007 Condotel STR (9/9/7/7), EG-001 Post-Short-Sale (9/8/8/8). These four should be the priority edge-case acquisition targets for marketing ops.

### For FF-08 (Funnel Friction Mapper)
- Encode the **decline-letter triage question** as the FIRST optional question on the intake form: "Have you received a decline letter on this file from another DSCR lender? If yes, what was the stated reason?" This is the single highest-leverage intake change — it surfaces 5 of 8 edge cases (EG-001, EG-004, EG-005, EG-006, EG-007, EG-008) in one question.
- Encode the **Part 4 boundary table** as a multi-axis routing decision (specialty-intake vs. defer-with-roadmap vs. reject-with-redirect), not a single threshold. Single-axis intake will under-route every edge case.
- Build the **60% 401(k) haircut reserves calculator** (per NP-04 Part 6 handoff) — this is both a funnel conversion tool (EG-008) and a lead magnet (SEO value, calculator-driven organic acquisition).
- Build the **seasoning-router tool** for EG-001: input = credit-event type + discharge date + current FICO + current reserves + current LTV → output = specialty-lender routing recommendation (which 24mo/36mo/48mo program applies, what compensators needed).
- Build the **condotel/non-warrantable condo specialty router** for EG-006/EG-007: input = property type + HOA questionnaire summary + market → output = specialty lender match (Visio/Kiavi/Truss/Bluestone/Lendmire/Brookmont/Harpoon).

### For AC-09 (Ad Hook & Copy Reframer)
- Use **feature-language**, not threshold-language, in all edge-case copy. Per NP-04 Part 6: avoid "660+ FICO", "1.25+ DSCR", "SSN required", "US citizens only", "no recent credit events", "warrantable condos only", "permitted ADU only", "no mortgage lates ever", "liquid reserves only".
- DO use: "Investment properties only" (HEX-001), "DSCR from 0.80 with compensating factors" (EG-004), "Foreign-national specialists — no US credit required" (EG-002, EG-003), "Prior credit event? Specialty seasoning programs available — 24mo / 36mo / 48mo paths" (EG-001), "Condotel or non-warrantable condo? Specialty lender routing" (EG-006, EG-007), "401(k) reserves accepted with standard 60% haircut" (EG-008), "Unpermitted ADU? SFR-classification pivot available" (EG-005).
- Pair each phrase with a 1-paragraph "How we'd underwrite this" explainer — this is the conversion mechanism for borrowers who have already been declined elsewhere and are skeptical of new promises.
- Build **8 edge-case-specific landing pages** — one per persona. Each page must include (i) the published lender guideline quote supporting the program feature, (ii) a representative case study (CF-01 case ID cited), (iii) the specialty lender list, (iv) the unlock-conditions checklist, (v) the next-step intake form pre-filled with the edge-case tag.

### For TS-10 (Targeting & Scoring Generator)
- DO NOT apply FP-pattern deltas as negative scores. FP-001 through FP-015 are explicitly fundable.
- Edge-case-persona-tagged leads should score **60–80** (specialty-routable, not hard-stop), NOT 0–30.
- Apply SWR deltas (-3 to -15) as designed in NP-04 Part 4 — these are the yellow-flag score reductions. Multiple SWR flags stack additively.
- Hard-stop leads (HEX-001, HEX-009, HEX-012 outside specialty, HEX-013 outside specialty) score **0** with route-to-other-product. These are PERMANENT — no edge-case persona overrides.
- Conditional-hard leads (HEX-002, HEX-003, HEX-004, HEX-005, HEX-007, HEX-008, HEX-010, HEX-011, HEX-014, HEX-015, HEX-016) score **30–50** with specialty-intake routing — this is where EG-005/EG-006/EG-007 leads land before full underwriting.
- Recoverable leads (NP-003, NP-004, NP-005, NP-006, NP-007, NP-009, NP-010, NP-012) score **50–70** with manual-review flag — this is where EG-001, EG-004, EG-008 leads land before full underwriting.

---

## Limitations & Honest Sample-Size Disclosure

1. **Sample size for edge-case evidence is thin.** Of the 8 personas: EG-001 draws from 2 cases (CF-024, CF-028); EG-002 draws from 1 case (CF-019); EG-003 draws from 2 cases (CF-017, CF-018); EG-004 draws from 2 cases (CF-008, CF-011); EG-005 draws from 2 cases (CF-020, CF-021); EG-006 draws from 1 case (CF-023); EG-007 draws from 1 case (CF-022); EG-008 draws from 1 case (CF-026). All but CF-008, CF-020 partial, CF-007 (EG-005 alternative) are synthesized case files per CF-01 methodology disclosure.
2. **Specialty-lender referrals (Visio Lending, Kiavi, Angel Oak, A&D Mortgage, HomeAbroad, Brookmont, Harpoon Capital, Feng Capitals, Lit Financial, Ridge Street Capital) are sourced from CF-01 case files and DSCR Authority guides, NOT from GL-02's normalized 8-lender matrix.** These lenders' guidelines were not independently normalized in this swarm. FF-08 + TS-10 should verify program availability + eligibility before routing leads.
3. **Strategic-value scores (1–10) are analyst estimates, not measured.** Underserved-by-competitors is based on observed ad-copy patterns in NP-04 Part 6; margin-potential is based on documented rate premiums in CF-01 cases; repeat-borrowing-likelihood is based on DSCR Authority investor-profile statements; referral-value is analyst inference based on community-network patterns. These are directional, not statistically robust.
4. **Compliance guardrails are good-faith analyst interpretations of ECOA / Reg B principles, not legal advice.** EG-002 (ITIN) and EG-003 (No-Credit-Country FN) carry the highest fair-lensing risk. Before deploying ad campaigns targeting these segments, the marketing-ops team must obtain compliance review from a qualified ECOA / Reg B attorney — particularly on the question of whether "ITIN accepted" / "no US credit required" constitutes permissible product-feature marketing or impermissible proxy targeting in the specific ad platform's policy environment.
5. **The Part 4 boundary table is the canonical FF-08 routing logic.** Single-axis intake will under-route every edge case. Multi-axis intake is mandatory. If FF-08 cannot collect all axes for every persona, it should prioritize the axes that drive the most persona distinctions: (a) credit-event seasoning months, (b) FICO, (c) LTV, (d) reserves months, (e) reserves source (401(k)/liquid/foreign), (f) property type, (g) ADU permit status, (h) condo warrantability, (i) STR market regulatory status, (j) ITIN vs SSN vs no-SSN, (k) US LLC status (for FN), (l) AML source-of-funds trail (for FN).

---

*End of EG-06 deliverable. Downstream agents (SA-05, FF-08, AC-09, TS-10) should treat Part 1 as the canonical edge-case persona catalog, Part 2 as the funnel-entry strategy, Part 3 as the compliance guardrail (especially for EG-002 and EG-003 fair-lensing risk), and Part 4 as the canonical boundary table that prevents FF-08 from admitting NP-04 hard-declines while trying to capture edge cases.*
