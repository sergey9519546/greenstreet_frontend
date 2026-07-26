# FF-08 — Funnel Friction Mapper: DSCR Pre-Screen Intake Form + Routing Logic

**Agent:** FF-08 Funnel Friction Mapper
**Phase:** 4 of 5 (parallel with AC-09)
**Task:** Design the DSCR intake form + multi-axis routing logic that (a) quietly filters NP-04 hard declines at submission, (b) routes EG-06 edge-case personas to specialty intake (never auto-rejection), (c) captures enough signal for TS-10 to compute a 0–100 approval score, (d) does not repel fundable-but-sensitive personas (credit-scarred, ITIN, no-credit FN), and (e) is ECOA / Reg B compliant.
**Inputs consumed:**
- `/home/z/my-project/worklog.md` (swarm charter — 8 personas, "Audiences to Actively Repel" list, FDI scoring dimensions, Special Ad Category constraints)
- `/home/z/my-project/download/agent_outputs/SA05_persona_library.md` (12 main personas SA-001 through SA-012 — Part 3 FF-08 handoff: 5 priority triage questions)
- `/home/z/my-project/download/agent_outputs/EG06_edge_case_personas.md` (8 edge-case personas EG-001 through EG-008 — Part 4 boundary table is the canonical routing source)
- `/home/z/my-project/download/agent_outputs/NP04_decline_patterns.md` (16 HEX rules Part 3 + 16 SWR rules Part 4 + 15 FP patterns Part 5)

**Output consumers:** AC-09 (form copy / landing pages mirror intake language), TS-10 (every form field → scoring dimension mapping in Part 7 is the binding contract), GS-07 (geo-segmentation may layer onto Q-004 market question), GL-02 / lenders (specialty routing destinations).

---

## Methodology in Brief

- **Form architecture:** 12 visible questions (estimated completion 2:30–3:00) + conditional follow-ups surfaced only when needed. Form is multi-step (3-step wizard) so the borrower never sees 12 questions on one screen.
- **Question ordering:** Objective property + intent questions first (Q-001 through Q-005); financial-profile questions second (Q-006 through Q-009); identity + decline-letter triage last (Q-010 through Q-012). This order respects ECOA / Reg B's "objective criteria first" guidance and prevents the borrower from abandoning at sensitive questions.
- **Hard-exit philosophy (NP-04 Part 3):** Only 4 of 16 HEX rules are PERMANENT rejections (HEX-001 primary residence, HEX-009 active delinquency, HEX-012 sub-$100K loan outside specialty, HEX-013 commercial use outside specialty). The other 12 are CONDITIONAL hard-stops that route to specialty intake or defer-with-roadmap. **No hard-exit message is silent** — every exit provides a specific legitimate alternative (conventional/FHA/VA, commercial DSCR, hard money, LTR-pivot, market-pivot, or 12-month re-engagement).
- **Edge-case philosophy (EG-06 Part 4):** Multi-axis routing decision, not single-threshold. FF-08 collects BOTH the weak-axis metric AND the compensator-axis metric for every edge case. Single-axis intake under-routes.
- **False-positive protection (NP-04 Part 5):** 15 FP patterns are explicitly fundable. FF-08 intake questions are designed to surface compensators, not screen them out. No question asks "have you EVER had a credit event" — questions ask "have you had a credit event in the last [X] months?" with X calibrated to the seasoning window.
- **Compliance posture (EG-06 Part 3):** Every question is anchored to a lender-published program feature (objective criteria), not a borrower-class proxy. ITIN and FN-eligibility questions are framed as "Do you have an SSN, an ITIN, or neither?" (program-feature) rather than "Are you a US citizen?" (protected-class proxy).

---

## Part 1: Pre-Screen Question Set (the master form)

Form is delivered as a 3-step wizard:
- **Step 1 — Property & Intent (Q-001 to Q-004):** screens HEX-001 (primary residence) and HEX-002/003/013/016 (property-type and STR-regulatory overlays). Highest hard-exit density — clears non-DSCR borrowers before they invest in financial-detail questions.
- **Step 2 — Financial Profile & Documentation (Q-005 to Q-009):** screens HEX-006/007/008/009/012/015 (credit-event seasoning, loan amount, documentation) and SWR-001/002/003/004/009/010/011 (soft-warning financial-pattern flags). Generates the core TS-10 score signal.
- **Step 3 — Identity, Entity & Decline-Letter Triage (Q-010 to Q-012):** screens HEX-010/011 (FN LLC + AML) and SWR-005/012/013/016 (ITIN/FN/education-gap flags). The decline-letter triage question (Q-012) is the single highest-leverage intake change per EG-06 Part 2 — surfaces 5 of 8 edge cases in one question.

Each question below is labeled with `routes_to` (the pipeline destination), `scores` (the TS-10 scoring dimension contribution), `hard_exit` (whether the option triggers a permanent exit), `specialty_route` (whether the option triggers specialty intake), and `soft_warning` (whether the option raises an internal manual-review flag). All question copy is **self-qualification language** (NP-04 Part 6 compliant — no explicit-floor language).

---

### Step 1 — Property & Intent (Q-001 to Q-004)

```yaml
question_id: Q-001
section: property_intent
step: 1
question_text: "What's your goal for this property?"
question_type: single_select
help_text: "DSCR loans are designed for investment properties. This question helps us route you to the right program."
options:
  - label: "Long-term rental (12+ month leases)"
    routes_to: [main_pipeline]
    scores: {property_intent: 10, occupancy_type: 10}
    ts10_base: +5
  - label: "Mid-term rental (30+ days, corporate / travel-nurse / insurance-housing)"
    routes_to: [main_pipeline]
    scores: {property_intent: 9, occupancy_type: 9}
    ts10_base: +4
  - label: "Short-term rental (Airbnb / VRBO, stays under 30 days)"
    routes_to: [str_pipeline]
    scores: {property_intent: 8, occupancy_type: 7}
    ts10_base: +3
    conditional_followup: Q-004B
  - label: "Mix — I plan to rotate between LTR, MTR, and STR based on season"
    routes_to: [str_pipeline]
    scores: {property_intent: 7, occupancy_type: 7}
    ts10_base: +3
    conditional_followup: Q-004B
  - label: "Primary residence for me / my family (will live in the property)"
    routes_to: [hard_exit_owner_occupied]
    scores: {property_intent: 0}
    ts10_base: 0
    hard_exit: true
    hex_rule: HEX-001
    exit_message: "DSCR loans are designed for investment properties, not primary residences. For primary-residence financing, conventional, FHA, or VA loans are the right fit — they offer lower rates and consumer protections DSCR loans can't provide. Here's where to start: [link to conventional lender directory / HUD-approved FHA lender search / VA loan resource]."
  - label: "Second home or personal-use vacation property"
    routes_to: [hard_exit_owner_occupied]
    scores: {property_intent: 0}
    ts10_base: 0
    hard_exit: true
    hex_rule: HEX-001
    exit_message: "DSCR loans are business-purpose investment-only. For second homes and vacation properties, second-home conventional financing or HomeStyle® Renovation may apply. [Link to conventional second-home lender directory]."
  - label: "Fix-and-flip / sell within 12 months"
    routes_to: [hard_exit_fix_flip]
    scores: {property_intent: 0}
    ts10_base: 0
    hard_exit: true
    hex_rule: HEX-001 (adjacent — business-purpose but outside DSCR product scope)
    exit_message: "DSCR loans are for stabilized rental cash flow, not fix-and-flip. For fix-and-flip or bridge-to-sell strategies, hard money and fix-and-flip lenders are the right fit — they underwrite ARV and rehab budget. [Link to fix-and-flip lender directory]."
  - label: "BRRRR — buy, rehab, rent, refinance, repeat"
    routes_to: [brrrr_pipeline]
    scores: {property_intent: 9, occupancy_type: 9}
    ts10_base: +5
    conditional_followup: Q-009C
compliance_note: "ECOA-safe — property intent and occupancy type are objective underwriting criteria, not protected-class proxies. The question does NOT ask about household composition, marital status, or dependents (which would be fair-housing proxies adjacent to familial status). Hard-exit copy provides a legitimate alternative resource, per Reg B §1002.4 (no discouragement of applications)."
```

```yaml
question_id: Q-002
section: property_basics
step: 1
question_text: "What type of property are you financing?"
question_type: single_select
help_text: "Some property types require specialty lenders. We'll route you to the right program — it doesn't disqualify you."
options:
  - label: "Single-family home (SFR, detached)"
    routes_to: [main_pipeline]
    scores: {property_type: 10}
    ts10_base: +5
  - label: "Condo (warrantable — meets Fannie Mae condo standards)"
    routes_to: [main_pipeline]
    scores: {property_type: 9}
    ts10_base: +4
  - label: "Condo (non-warrantable — high investor concentration, HOA litigation, hotel conversion, or non-compliant HOA)"
    routes_to: [specialty_intake_non_warrantable]
    scores: {property_type: 5}
    ts10_base: +2
    specialty_route: true
    hex_rule: HEX-005
    edge_case_tag: [EG-006]
  - label: "Condotel / hotel-condo conversion (front-desk rental program)"
    routes_to: [specialty_intake_condotel]
    scores: {property_type: 4}
    ts10_base: +2
    specialty_route: true
    hex_rule: HEX-004
    edge_case_tag: [EG-007]
  - label: "2-4 unit residential (duplex, triplex, quadplex)"
    routes_to: [main_pipeline]
    scores: {property_type: 9}
    ts10_base: +4
  - label: "5-8 unit residential (small multifamily)"
    routes_to: [specialty_intake_5_8_unit]
    scores: {property_type: 6}
    ts10_base: +2
    specialty_route: true
    hex_rule: HEX-016
    triage_message: "5-8 unit properties need a specialty DSCR lender — most residential DSCR programs cap at 4 units. AHLend writes 5-8 unit DSCR; we can route you there."
  - label: "Single-family with permitted ADU (accessory dwelling unit)"
    routes_to: [main_pipeline_adu_permitted]
    scores: {property_type: 8}
    ts10_base: +3
    edge_case_tag: [SA-009]
  - label: "Single-family with UNPERMITTED ADU (no final permit on record)"
    routes_to: [specialty_intake_unpermitted_adu]
    scores: {property_type: 4}
    ts10_base: +1
    specialty_route: true
    soft_warning: [SWR-015]
    edge_case_tag: [EG-005]
    triage_message: "Unpermitted ADUs need a specialty-lender pivot — we can qualify the property as SFR (ADU ignored for income and value) at a slightly lower LTV. Harpoon Capital and a few other lenders handle this."
  - label: "Mixed-use (residential + commercial, >25% commercial component)"
    routes_to: [specialty_intake_mixed_use]
    scores: {property_type: 3}
    ts10_base: +1
    specialty_route: true
    hex_rule: HEX-013
    triage_message: "Mixed-use properties need a commercial-facing DSCR lender. Bluestone writes mixed-use and small-commercial DSCR — we can route you there."
  - label: "Pure commercial / retail / industrial"
    routes_to: [hard_exit_commercial]
    scores: {property_type: 0}
    ts10_base: 0
    hard_exit: true
    hex_rule: HEX-013
    exit_message: "Pure commercial-use properties need commercial mortgage financing, not residential DSCR. [Link to commercial mortgage broker directory / SBA 504 resource for owner-occupied commercial]."
  - label: "Townhouse (fee-simple, warrantable)"
    routes_to: [main_pipeline]
    scores: {property_type: 9}
    ts10_base: +4
  - label: "Manufactured / mobile home on permanent foundation"
    routes_to: [specialty_intake_manufactured]
    scores: {property_type: 4}
    ts10_base: +1
    specialty_route: true
    triage_message: "Manufactured homes need a specialty DSCR program — most residential DSCR lenders don't write them, but a few do with permanent-foundation certification."
  - label: "Vacant land / lot"
    routes_to: [hard_exit_vacant_land]
    scores: {property_type: 0}
    ts10_base: 0
    hard_exit: true
    hex_rule: HEX-013 (adjacent — no rental income to underwrite)
    exit_message: "DSCR loans require a rentable property. For vacant land, lot loans or seller financing are the typical path. [Link to land-loan lender directory]."
compliance_note: "ECOA-safe — property type is an objective underwriting criterion documented in every GL-02 lender's program matrix. The question does NOT ask about neighborhood demographic characteristics (which would be redlining-adjacent). Non-warrantable condo / condotel / unpermitted ADU options route to specialty intake, NOT auto-rejection, per EG-06 Part 4 boundary rules."
```

```yaml
question_id: Q-003
section: transaction_basics
step: 1
question_text: "What's the transaction, and roughly how much do you need to borrow?"
question_type: composite (two-part)
help_text: "We just need a band — exact figures come later with your loan officer."

part_a:
  question_text: "Transaction type:"
  question_type: single_select
  options:
    - label: "Purchase (new acquisition)"
      routes_to: [main_pipeline]
      scores: {transaction_type: 10}
      ts10_base: +3
    - label: "Rate-and-term refinance (pay off existing loan, no cash out)"
      routes_to: [main_pipeline]
      scores: {transaction_type: 9}
      ts10_base: +3
      soft_warning_check: SWR-008  # appraisal risk flag at 75% LTV rate-term refi
    - label: "Cash-out refinance (pull equity out for next acquisition or other use)"
      routes_to: [main_pipeline_cashout]
      scores: {transaction_type: 7}
      ts10_base: +2
      soft_warning_check: SWR-007  # negative-cash-flow risk on subject
    - label: "BRRRR refinance (post-rehab, rent-stabilized)"
      routes_to: [brrrr_pipeline]
      scores: {transaction_type: 8}
      ts10_base: +3
      conditional_followup: Q-009C

part_b:
  question_text: "Target loan amount (band):"
  question_type: single_select
  options:
    - label: "Under $100K"
      routes_to: [hard_exit_sub_100k]
      scores: {loan_amount: 0}
      ts10_base: 0
      hard_exit: true
      hex_rule: HEX-012
      exit_message: "DSCR loans typically start at $100K–$150K (lender program floor). For smaller loan amounts, hard money, private notes, or local community lenders may be a better fit. [Link to hard-money lender directory / private lending marketplace]."
    - label: "$100K – $250K"
      routes_to: [main_pipeline]
      scores: {loan_amount: 6}
      ts10_base: +1
    - label: "$250K – $500K"
      routes_to: [main_pipeline]
      scores: {loan_amount: 8}
      ts10_base: +2
    - label: "$500K – $1M"
      routes_to: [main_pipeline]
      scores: {loan_amount: 9}
      ts10_base: +3
    - label: "$1M – $2M"
      routes_to: [main_pipeline_portfolio]
      scores: {loan_amount: 10}
      ts10_base: +3
    - label: "$2M – $5M"
      routes_to: [portfolio_pipeline]
      scores: {loan_amount: 10}
      ts10_base: +3
      soft_warning_check: SWR-011  # portfolio-level reserve documentation
    - label: "$5M+"
      routes_to: [portfolio_pipeline]
      scores: {loan_amount: 10}
      ts10_base: +3
      soft_warning_check: SWR-011
      triage_message: "Loan sizes above $5M typically need portfolio / blanket DSCR structures. A senior LO will reach out to discuss multi-property structuring."
compliance_note: "ECOA-safe — transaction type and loan amount are objective criteria. The loan-amount band does NOT ask about income source or wealth origin (which would touch AML-adjacent territory). Below-floor loan amount routes to a legitimate alternative (hard money / private), not a silent rejection. Reg B §1002.4 — exit copy is informational, not discouraging."
```

```yaml
question_id: Q-004
section: property_market
step: 1
question_text: "Where is the property located, and (if STR) is a non-owner STR permit available?"
question_type: composite (two-part)
help_text: "City + state is enough. For STR-intent properties, we check the local STR rules."

part_a:
  question_text: "Property city + state:"
  question_type: text_input (city) + dropdown (state)
  routing: geo_lookup_tool
  notes: "Routes to GS-07 geo-segment tagging. For STR-intent properties, the lookup tool also flags STR-regulatory status."

part_b:
  question_text: "If STR-intent: have you confirmed with the local municipality that a non-owner-occupied STR permit is obtainable for this property?"
  question_type: single_select
  conditional_on: Q-001 in [short_term_rental, mix]
  options:
    - label: "Yes, I have the STR permit in hand or written confirmation it's obtainable"
      routes_to: [str_pipeline]
      scores: {str_permit: 10}
      ts10_base: +3
    - label: "Not yet — I'm still verifying with the municipality"
      routes_to: [str_pipeline_deferred_permit]
      scores: {str_permit: 4}
      ts10_base: +1
      soft_warning: [SWR-014]
      triage_message: "STR DSCR requires a confirmable non-owner STR permit. Our market-lookup tool can help you verify — most cities post permit requirements on their planning-department website."
    - label: "I'm in a market that doesn't allow non-owner STR (NYC, Nashville residential zones, San Francisco, Denver, parts of Austin)"
      routes_to: [str_pipeline_rejected_market]
      scores: {str_permit: 0}
      ts10_base: 0
      hard_exit: true
      hex_rule: HEX-002 (NYC) / HEX-003 (Nashville) / HEX-014 (other restricted)
      exit_message: "STR DSCR requires a market where non-owner-occupied STR is legally permitted. We can underwrite your property as a long-term rental DSCR instead (if LTR rents pencil), or help you find an STR-permissive market — Florida coast (Panama City Beach, Destin), Smoky Mountains (Gatlinburg / Pigeon Forge), or Scottsdale AZ have deep STR-comp sets and permissive regulations."
    - label: "Not sure — my city has STR regulations but I don't know if my property qualifies"
      routes_to: [str_pipeline_deferred_permit]
      scores: {str_permit: 3}
      ts10_base: 0
      soft_warning: [SWR-014]
      triage_message: "STR permit status varies by zone even within permissive cities. Our market-lookup tool can help — or you can call the local planning department with the property address."
compliance_note: "ECOA-safe — property location is required for any mortgage application and is not a redlining proxy because the question does NOT screen OUT neighborhoods (it routes restricted-STR markets to LTR-pivot or market-pivot alternatives, not rejection). Market-lookup tool must be calibrated to objective municipal STR ordinance data, NOT demographic data. Reg B §1002.5(b) — geographic information collected as part of a bona fide loan application is permissible."
```

---

### Step 2 — Financial Profile & Documentation (Q-005 to Q-009)

```yaml
question_id: Q-005
section: experience_level
step: 2
question_text: "How many investment properties do you currently own (including this one)?"
question_type: single_select
help_text: "Experience level affects program pricing and reserve requirements — not eligibility."
options:
  - label: "This will be my first investment property"
    routes_to: [first_time_pipeline]
    scores: {experience_level: 6}
    ts10_base: +2
    edge_case_tag: [SA-003]
    soft_warning_check: SWR-013  # borrower-education gap trigger if Q-011 says "no, rent doesn't cover"
  - label: "1-5 investment properties"
    routes_to: [main_pipeline]
    scores: {experience_level: 9}
    ts10_base: +4
    edge_case_tag: [SA-001]
  - label: "6-20 investment properties"
    routes_to: [portfolio_pipeline]
    scores: {experience_level: 10}
    ts10_base: +5
    edge_case_tag: [SA-002]
  - label: "20+ investment properties (portfolio / blanket loan likely)"
    routes_to: [portfolio_pipeline]
    scores: {experience_level: 10}
    ts10_base: +5
    edge_case_tag: [SA-002]
    soft_warning_check: SWR-011  # portfolio-level reserve documentation
    triage_message: "With 20+ properties, a portfolio / blanket DSCR loan may give better pricing than per-property loans. A senior LO will reach out to discuss structuring."
  - label: "BRRRR cyclist — I'm actively rotating properties (buy → rehab → refi → repeat)"
    routes_to: [brrrr_pipeline]
    scores: {experience_level: 9}
    ts10_base: +4
    edge_case_tag: [SA-012]
    conditional_followup: Q-009C
compliance_note: "ECOA-safe — investment-property count is an objective underwriting criterion (reserves and pricing vary by portfolio size per GL-02 Part 1). Does NOT ask about primary residence ownership history (which would be familial-status-adjacent). Does NOT ask about occupation or employment history (which would be self-employment proxy risk for SA-001)."
```

```yaml
question_id: Q-006
section: credit_profile
step: 2
question_text: "What's your self-estimated credit score band, and have you had any of these credit events?"
question_type: composite (two-part)
help_text: "Self-reported bands only — no credit pull. We'll verify later only if you choose to proceed."

part_a:
  question_text: "Self-estimated FICO band:"
  question_type: single_select
  options:
    - label: "740+"
      routes_to: [main_pipeline]
      scores: {fico_band: 10}
      ts10_base: +5
    - label: "700-739"
      routes_to: [main_pipeline]
      scores: {fico_band: 9}
      ts10_base: +4
    - label: "660-699"
      routes_to: [main_pipeline]
      scores: {fico_band: 7}
      ts10_base: +3
    - label: "620-659"
      routes_to: [specialty_intake_sub_660_fico]
      scores: {fico_band: 5}
      ts10_base: +2
      specialty_route: true
      soft_warning: [SWR-003]
      edge_case_tag: [SA-008, EG-001]
      triage_message: "Below-660 FICO needs a specialty lender — Bluestone (550 floor), Truss / Rize / Lendmire (620 floor). We can route you there with a 25-30% down payment + 6+ month reserves + 1.25+ DSCR."
    - label: "580-619"
      routes_to: [specialty_intake_sub_620_fico]
      scores: {fico_band: 3}
      ts10_base: +1
      specialty_route: true
      soft_warning: [SWR-003]
      edge_case_tag: [SA-008]
      triage_message: "Below 620 FICO has limited but real options — Bluestone (550 floor) is the most active lender here. Strong compensators required (35%+ down, 12+ month reserves, 1.30+ DSCR)."
    - label: "Below 580"
      routes_to: [specialty_intake_sub_580_fico]
      scores: {fico_band: 1}
      ts10_base: 0
      specialty_route: true
      triage_message: "Below 580 FICO is at the edge of DSCR lending — most files at this tier need 12-24 months of credit rebuild before funding. A senior LO can walk you through the rebuild roadmap."
    - label: "I don't have a US FICO score (foreign national or new US resident)"
      routes_to: [fn_pipeline]
      scores: {fico_band: 4}
      ts10_base: +1
      conditional_followup: Q-007  # routes to identity/citizenship track
      edge_case_tag: [SA-005, SA-006, EG-003, EG-002]
    - label: "I'd rather not say"
      routes_to: [main_pipeline_with_review_flag]
      scores: {fico_band: 0}
      ts10_base: 0
      soft_warning: [SWR-013]  # borrower-education gap flag
      notes: "Per Reg B §1002.5(b)(1), applicants cannot be required to disclose credit score on a pre-screen form. The 'rather not say' option must be available."

part_b:
  question_text: "Have you experienced any of these credit events? (Select all that apply — these are seasoning-routed, NOT auto-disqualifying.)"
  question_type: multi_select
  options:
    - label: "Chapter 7 bankruptcy discharged 4+ years ago"
      routes_to: [main_pipeline]
      scores: {credit_event: 8}
      ts10_base: +2
    - label: "Chapter 7 bankruptcy discharged 2-4 years ago"
      routes_to: [specialty_intake_bk_seasoning]
      scores: {credit_event: 4}
      ts10_base: +1
      specialty_route: true
      hex_rule: HEX-008
      edge_case_tag: [EG-001, SA-008]
      triage_message: "Bankruptcy discharged 2-4 years ago qualifies at specialty seasoning programs with 700+ FICO and 25%+ down. We'll route you to AHLend, America, or Bluestone specialty seasoning tier."
    - label: "Chapter 7 bankruptcy discharged less than 2 years ago"
      routes_to: [defer_with_roadmap]
      scores: {credit_event: 0}
      ts10_base: 0
      hard_exit: true
      hex_rule: HEX-008
      exit_message: "Chapter 7 bankruptcy requires 24 months seasoning minimum (specialty programs) before DSCR application. We'll re-engage you at month 22 to start the pre-qualification process — most borrowers close 24-28 months post-discharge."
    - label: "Chapter 13 bankruptcy — on-plan payments 12+ months (trustee-approved)"
      routes_to: [specialty_intake_ch13_on_plan]
      scores: {credit_event: 5}
      ts10_base: +1
      specialty_route: true
      edge_case_tag: [EG-001]
      triage_message: "Chapter 13 on-plan with 12+ months of trustee-approved payments is fundable at specialty programs. We'll route you to a senior LO who handles on-plan bankruptcies."
    - label: "Foreclosure discharged 3+ years ago"
      routes_to: [main_pipeline]
      scores: {credit_event: 7}
      ts10_base: +2
    - label: "Foreclosure discharged 2-3 years ago (with 700+ FICO)"
      routes_to: [specialty_intake_foreclosure_seasoning]
      scores: {credit_event: 4}
      ts10_base: +1
      specialty_route: true
      hex_rule: HEX-007
      edge_case_tag: [EG-001, SA-008]
      triage_message: "Foreclosure 24-36 months seasoning qualifies at specialty programs with 700+ FICO. We'll route you to AHLend / America / Bluestone specialty seasoning tier."
    - label: "Foreclosure discharged less than 2 years ago"
      routes_to: [defer_with_roadmap]
      scores: {credit_event: 0}
      ts10_base: 0
      hard_exit: true
      hex_rule: HEX-007
      exit_message: "Foreclosure requires 24 months seasoning minimum (specialty programs) before DSCR application. We'll re-engage you at month 20 to start the pre-qualification process."
    - label: "Short sale or deed-in-lieu 1-3 years ago"
      routes_to: [specialty_intake_short_sale_seasoning]
      scores: {credit_event: 5}
      ts10_base: +1
      specialty_route: true
      edge_case_tag: [EG-001, SA-008]
      triage_message: "Short sale / deed-in-lieu seasoning 12+ months is fundable at specialty programs with 25%+ down + 1.30+ DSCR + 12mo reserves. AHLend, Lendmire, Newfi all accept this seasoning path."
    - label: "30+ day mortgage late payment within the last 12 months"
      routes_to: [defer_with_roadmap]
      scores: {credit_event: 0}
      ts10_base: 0
      hard_exit: true
      hex_rule: HEX-006
      exit_message: "DSCR lenders require 12+ months since your most recent 30-day mortgage late. We'll re-engage you at month 11 to start pre-qualification — most borrowers in this situation close 12-15 months after the late."
    - label: "30+ day mortgage late payment 12-24 months ago"
      routes_to: [specialty_intake_late_seasoning]
      scores: {credit_event: 4}
      ts10_base: +1
      specialty_route: true
      soft_warning: [SWR-013]
      edge_case_tag: [EG-001]
      triage_message: "Mortgage lates 12+ months ago are fundable at most DSCR programs. A few specialty lenders (Bluestone, AHLend) accept 12-24mo seasoning with compensators. We'll route you to the right fit."
    - label: "Currently in mortgage forbearance, or unresolved mortgage delinquency on any property"
      routes_to: [hard_exit_active_delinquency]
      scores: {credit_event: 0}
      ts10_base: 0
      hard_exit: true
      hex_rule: HEX-009
      exit_message: "DSCR lenders require all mortgage delinquencies cured and forbearance fully exited before application. Once your forbearance is exited and you've made 3+ on-time payments, we can re-engage — typically 3-6 months from forbearance exit."
    - label: "None of the above — clean credit history"
      routes_to: [main_pipeline]
      scores: {credit_event: 10}
      ts10_base: +3
compliance_note: "ECOA-safe — credit score and credit-event history are objective underwriting criteria documented in every GL-02 lender's program matrix. Part B uses 'seasoning-routed, not auto-disqualifying' language per NP-04 FP-001 (post-seasoning credit-scarred borrowers are fundable). The 'I'd rather not say' option on Part A is REQUIRED by Reg B §1002.5(b)(1) — applicants cannot be compelled to disclose credit score on a pre-screen form. No question asks about the CAUSE of credit events (medical debt, divorce, job loss) — that would be protected-class-adjacent (FP-001 / EG-001 compliance guardrail)."
```

```yaml
question_id: Q-007
section: identity_track
step: 2
question_text: "Which identity documentation track fits you? (This affects documentation requirements, not eligibility.)"
question_type: single_select
help_text: "DSCR has specialty programs for every track. Pick the one that fits — we'll route accordingly."
options:
  - label: "US citizen or permanent resident with SSN"
    routes_to: [main_pipeline]
    scores: {identity_track: 10}
    ts10_base: +3
  - label: "US resident with work permit — I have an ITIN instead of an SSN"
    routes_to: [itin_pipeline]
    scores: {identity_track: 7}
    ts10_base: +2
    specialty_route: true
    soft_warning: [SWR-012]
    edge_case_tag: [SA-010, EG-002]
    triage_message: "ITIN borrowers fund between FN and standard tiers — AHLend and America Mortgages explicitly accept ITIN in lieu of SSN. We'll route you to a senior LO who handles ITIN files."
  - label: "Foreign national with strong international credit (UK, Canada, Australia, EU, Mexico, India — Nova Credit countries)"
    routes_to: [fn_strong_credit_pipeline]
    scores: {identity_track: 6}
    ts10_base: +2
    specialty_route: true
    soft_warning: [SWR-005, SWR-016]
    edge_case_tag: [SA-005, EG-003]
    conditional_followup: Q-007A
    triage_message: "Strong-credit-country foreign nationals fund at 70-75% LTV with 9-12 month reserves and a Nova Credit translation of your home-country credit report. AHLend and America Mortgages are FN-native — we'll route you there."
  - label: "Foreign national with no international credit bureau (Latin America, Asia, Africa, Eastern Europe — no Nova Credit translation)"
    routes_to: [fn_no_credit_pipeline]
    scores: {identity_track: 5}
    ts10_base: +1
    specialty_route: true
    soft_warning: [SWR-005, SWR-016]
    edge_case_tag: [SA-006, EG-003]
    conditional_followup: Q-007A
    triage_message: "No-credit-country foreign nationals fund at 60% LTV with 12 month reserves, a US LLC, and an AML source-of-funds trail. AHLend, America Mortgages, Angel Oak, A&D Mortgage, and HomeAbroad all write this tier."
  - label: "I'm not sure which track applies to me"
    routes_to: [identity_triage_with_lo]
    scores: {identity_track: 0}
    ts10_base: 0
    triage_message: "No problem — a senior LO can help you figure out the right track. Common situations: DACA recipients (ITIN-adjacent), E-2 investor visa holders (FN track), asylum applicants with work permits (ITIN track), dual citizens (your choice)."
compliance_note: "HIGH FAIR-LENSING RISK — requires legal review before deployment. ITIN and foreign-national status are protected-class-adjacent under ECOA (national-origin proxy risk per EG-06 Part 3). The question is framed in PROGRAM-FEATURE language ('which documentation track fits you'), NOT demographic language ('what is your citizenship'). Per EG-06 Part 3 mitigation: this is permissible when the question is anchored to a lender-published program feature (AHLend and America Mortgages publish ITIN eligibility; AHLend and America publish FN eligibility). Bilingual (English + Spanish) form is recommended under ECOA's 'affirmative marketing' provision. CRITICAL: do NOT use this question's answers for ad-platform lookalike audience building (Special Ad Category restriction)."

# Conditional follow-up for FN borrowers
conditional_followup:
  question_id: Q-007A
  section: identity_track
  question_text: "Have you (or are you prepared to within 2-4 weeks) form a US-based LLC with EIN and operating agreement, AND can you provide 12 months of bank statements with certified English translation + USD conversion + a source-of-funds letter?"
  question_type: single_select
  conditional_on: Q-007 in [fn_strong_credit_pipeline, fn_no_credit_pipeline]
  options:
    - label: "Yes — US LLC formed (or in process) AND I can provide the source-of-funds documentation"
      routes_to: [fn_pipeline]
      scores: {fn_readiness: 8}
      ts10_base: +2
    - label: "I have one but not the other"
      routes_to: [fn_pre_intake_workstream]
      scores: {fn_readiness: 4}
      ts10_base: +1
      hex_rule: HEX-010 (if no LLC) or HEX-011 (if no AML trail)
      triage_message: "Foreign-national DSCR requires both a US LLC and an AML-compliant source-of-funds trail. We can connect you with a US attorney to form an LLC (~$1,200, 2-4 weeks) and walk you through assembling the AML documentation. Total pre-intake workstream is typically 3-6 weeks."
    - label: "No — I don't have either yet"
      routes_to: [fn_pre_intake_workstream]
      scores: {fn_readiness: 1}
      ts10_base: 0
      hex_rule: HEX-010, HEX-011
      triage_message: "No problem — we have a 3-6 week pre-intake workstream for foreign-national borrowers. We'll connect you with a US attorney for LLC formation and a translator for bank-statement certification. Most FN borrowers close 60-90 days from start of workstream."
compliance_note: "ECOA-safe conditional — US LLC and AML documentation are lender-published program requirements (objective criteria), not demographic proxies. The question does NOT ask about country of origin (which would be national-origin targeting). The triage message frames LLC formation and AML as a 'workstream' — non-rejection, specialty routing."
```

```yaml
question_id: Q-008
section: reserves_down_payment
step: 2
question_text: "What down payment are you planning, and what reserves (post-close) will you have?"
question_type: composite (two-part)
help_text: "Bands only — exact figures verified at loan-officer handoff. Reserves can include retirement accounts with a standard 60% haircut."

part_a:
  question_text: "Down payment (as % of purchase price or current value):"
  question_type: single_select
  options:
    - label: "35%+ down (65% LTV or below)"
      routes_to: [main_pipeline_low_ltv]
      scores: {ltv_band: 10}
      ts10_base: +5
    - label: "25-30% down (70-75% LTV)"
      routes_to: [main_pipeline]
      scores: {ltv_band: 9}
      ts10_base: +4
    - label: "20-25% down (75-80% LTV)"
      routes_to: [main_pipeline]
      scores: {ltv_band: 7}
      ts10_base: +3
      soft_warning_check: SWR-009  # ceiling LTV + mid-tier FICO counteroffer
    - label: "15-20% down (80-85% LTV)"
      routes_to: [specialty_intake_high_ltv]
      scores: {ltv_band: 5}
      ts10_base: +2
      specialty_route: true
      soft_warning: [SWR-009]
      triage_message: "85% LTV is available at Lendmire and Newfi with 720+ FICO + 1.25-1.50 DSCR + 6 month reserves. With lower FICO or thinner DSCR, 25%+ down may be required."
    - label: "Less than 15% down"
      routes_to: [hard_exit_low_down_payment]
      scores: {ltv_band: 0}
      ts10_base: 0
      hard_exit: true
      exit_message: "DSCR loans require 15%+ down payment minimum (typically 20-25%). For lower down payments, conventional financing with PMI or FHA financing (for primary residences) may apply. [Link to conventional / FHA lender directory]."
    - label: "Cash-out refi — I have 30%+ equity post-cash-out"
      routes_to: [main_pipeline_cashout]
      scores: {ltv_band: 8}
      ts10_base: +3
    - label: "Cash-out refi — I have 25-30% equity post-cash-out"
      routes_to: [main_pipeline_cashout]
      scores: {ltv_band: 7}
      ts10_base: +2

part_b:
  question_text: "Post-close reserves (months of PITIA — principal, interest, taxes, insurance, HOA):"
  question_type: single_select
  help_text: "Reserves can be in checking, savings, money market, or retirement accounts (401k/IRA counted at 60% of value)."
  options:
    - label: "12+ months reserves (strong)"
      routes_to: [main_pipeline]
      scores: {reserves_band: 10}
      ts10_base: +5
    - label: "6-12 months reserves (standard)"
      routes_to: [main_pipeline]
      scores: {reserves_band: 8}
      ts10_base: +3
    - label: "3-6 months reserves (thin)"
      routes_to: [specialty_intake_thin_reserves]
      scores: {reserves_band: 5}
      ts10_base: +1
      specialty_route: true
      soft_warning_check: SWR-009
      triage_message: "Below 6 months reserves needs compensators — higher FICO, lower LTV, or stronger DSCR. Lendmire has a no-reserve-required program at ≤$1.5M loan + ≤70% LTV."
    - label: "Less than 3 months — but I have $50K+ in a 401(k) / IRA"
      routes_to: [reserves_calculator_tool]
      scores: {reserves_band: 4}
      ts10_base: +1
      soft_warning: [SWR-001]
      edge_case_tag: [EG-008]
      triage_message: "401(k) reserves can count at 60% of value (e.g., $50K 401k = $30K qualifying). Plus you can add a co-borrower (spouse) with liquid checking to combine reserves. Our reserves calculator will show your options — most borrowers in this situation actually qualify."
    - label: "Less than 3 months — no retirement assets to supplement"
      routes_to: [hard_exit_no_reserves]
      scores: {reserves_band: 0}
      ts10_base: 0
      hard_exit: true
      hex_rule: NP-011 (charter "Audiences to Actively Repel" — no-reserves high-leverage first-time speculator)
      exit_message: "DSCR loans require 3-6 months reserves minimum. Building reserves to 6 months PITIA is the highest-leverage pre-qualification step you can take — most borrowers reach this in 3-9 months of disciplined saving. We'll send you our reserves-building checklist and re-engage when you're at 3 months."
compliance_note: "ECOA-safe — LTV and reserves are objective underwriting criteria documented in every GL-02 lender's program matrix. Part B does NOT ask about SOURCE of reserves (which would touch AML-adjacent territory for FN borrowers) — only the AMOUNT. The 401(k) option routes to a calculator tool, not rejection (per NP-04 FP-011 / EG-008). The 'less than 3 months — no retirement assets' exit message is informational, not discouraging (Reg B §1002.4)."
```

```yaml
question_id: Q-009
section: documentation_readiness
step: 2
question_text: "What documentation do you have ready to support the rental income on this property?"
question_type: multi_select
help_text: "Pick all that apply. The more you have, the faster we can underwrite — but missing items don't disqualify you."
options:
  - label: "Signed lease in place (12+ months remaining)"
    routes_to: [main_pipeline]
    scores: {doc_readiness: 10, rent_realism: 10}
    ts10_base: +3
  - label: "Rent schedule / current rent roll (for multi-unit or portfolio)"
    routes_to: [main_pipeline]
    scores: {doc_readiness: 9, rent_realism: 9}
    ts10_base: +2
  - label: "Market rent appraisal (Form 1007) — can be ordered pre-application"
    routes_to: [main_pipeline]
    scores: {doc_readiness: 8, rent_realism: 9}
    ts10_base: +2
  - label: "AirDNA / RentedRoof STR projection (for STR-intent properties)"
    routes_to: [str_pipeline]
    scores: {doc_readiness: 8, rent_realism: 7}
    ts10_base: +2
    soft_warning_check: SWR-004  # first-time STR with no host history
    conditional_on: Q-001 in [short_term_rental, mix]
  - label: "12+ months of STR host history (Airbnb / VRBO dashboard export)"
    routes_to: [str_pipeline]
    scores: {doc_readiness: 9, rent_realism: 9}
    ts10_base: +3
    conditional_on: Q-001 in [short_term_rental, mix]
  - label: "HOA questionnaire (for condo / non-warrantable / condotel)"
    routes_to: [specialty_intake_non_warrantable, specialty_intake_condotel]
    scores: {doc_readiness: 8}
    ts10_base: +1
    conditional_on: Q-002 in [non_warrantable_condo, condotel]
  - label: "Operating statements (12+ months) for existing rental"
    routes_to: [main_pipeline]
    scores: {doc_readiness: 9}
    ts10_base: +2
    conditional_on: Q-003a in [rate_and_term_refi, cash_out_refi, brrrr_refi]
  - label: "Rehab budget + contractor bids (for BRRRR or fix-up)"
    routes_to: [brrrr_pipeline]
    scores: {doc_readiness: 8}
    ts10_base: +2
    conditional_on: Q-003a in [brrrr_refi]
  - label: "None of the above yet — I'm early in the process"
    routes_to: [defer_with_roadmap]
    scores: {doc_readiness: 2}
    ts10_base: 0
    hex_rule: HEX-015  # speculative rents without lease / 1007 / schedule
    triage_message: "DSCR qualification requires supportable rent — a lease, rent schedule, or Form 1007 market-rent appraisal. Our team can help you get a 1007 ordered ($450-$650, 5-7 day turnaround) or connect you with a property manager to secure a lease. Most borrowers have this ready within 2-4 weeks."
compliance_note: "ECOA-safe — documentation readiness is an objective underwriting criterion. The question does NOT ask for tax returns upfront (which would repel self-employed SA-001 borrowers per FP-015 / friction point #1 below). 'None of the above' routes to roadmap with 1007 ordering resource, not rejection. STR AirDNA option welcomes first-time STR borrowers (FP-013) instead of requiring established host history."
```

---

### Step 3 — Identity, Entity & Decline-Letter Triage (Q-010 to Q-012)

```yaml
question_id: Q-010
section: entity_structure
step: 3
question_text: "How will you hold title to the property?"
question_type: single_select
help_text: "LLC vesting is preferred for DSCR (and required for foreign-national programs) — but personal-name vesting is allowed at most lenders."
options:
  - label: "LLC (existing or to be formed before closing)"
    routes_to: [main_pipeline]
    scores: {entity_structure: 10}
    ts10_base: +3
    notes: "LLC vesting is a strong accelerant (+10-15% per AP-03 Part 3) — strongest signal of investor intent and liability segregation."
  - label: "S-Corp or C-Corp"
    routes_to: [main_pipeline]
    scores: {entity_structure: 8}
    ts10_base: +2
  - label: "Personal name (individual vesting)"
    routes_to: [main_pipeline]
    scores: {entity_structure: 6}
    ts10_base: +1
    notes: "Personal vesting allowed at most DSCR lenders, but LLC vesting typically gives better pricing and liability protection. Borrower can transfer to LLC post-close."
  - label: "Partnership / multi-member LLC (with non-spouse)"
    routes_to: [partnership_pipeline]
    scores: {entity_structure: 7}
    ts10_base: +2
    triage_message: "Partnership vesting requires partnership-agreement review and all partners' credit review. A senior LO will reach out to discuss structure."
  - label: "Trust (revocable or irrevocable)"
    routes_to: [trust_pipeline]
    scores: {entity_structure: 6}
    ts10_base: +1
    triage_message: "Trust vesting requires trust-document review. Most DSCR lenders accept revocable trusts; irrevocable trusts need specialty-lender routing."
  - label: "Undecided — I'd like guidance"
    routes_to: [main_pipeline_with_lo_handoff]
    scores: {entity_structure: 5}
    ts10_base: +1
    triage_message: "Most DSCR investors use LLC vesting for liability protection and clean property-level accounting. A senior LO can walk you through the trade-offs — LLC formation costs ~$500-$1,500 depending on state."
compliance_note: "ECOA-safe — entity structure is an objective underwriting criterion. Spousal co-ownership is NOT asked as a marital-status question (which would be familial-status proxy) — partnership / multi-member LLC is asked as a business-structure question only. The 'undecided' option routes to LO guidance, not rejection."
```

```yaml
question_id: Q-011
section: dscr_self_estimate
step: 3
question_text: "Does the rent (or projected rent) cover the monthly mortgage payment (PITIA)?"
question_type: single_select
help_text: "Don't worry about exact math — pick the band that feels right. Our calculator can refine this with you."
options:
  - label: "Yes — rent covers PITIA comfortably (DSCR likely 1.25+)"
    routes_to: [main_pipeline]
    scores: {dscr_band: 10, rent_realism: 9}
    ts10_base: +5
  - label: "Yes — but barely (rent just covers PITIA, DSCR likely 1.00-1.25)"
    routes_to: [main_pipeline_thin_dscr]
    scores: {dscr_band: 6, rent_realism: 7}
    ts10_base: +2
    soft_warning: [SWR-002]
    triage_message: "Thin DSCR (1.00-1.10) may need a counteroffer — slightly lower LTV or slightly higher reserves. Most files in this band close at 70% LTV instead of 75%, or with 9-12 month reserves instead of 6."
  - label: "Not quite — rent covers most of PITIA but not all (DSCR likely 0.80-1.00)"
    routes_to: [specialty_intake_sub_1_dscr]
    scores: {dscr_band: 3, rent_realism: 5}
    ts10_base: +1
    specialty_route: true
    soft_warning: [SWR-010]
    edge_case_tag: [EG-004]
    triage_message: "Below-1.0 DSCR is fundable at specialty lenders (Newfi 0.80 floor, AHLend and Lendmire 0.75 with compensators) with 700+ FICO + 65-70% LTV + 12mo reserves + 3+ financed properties. We'll route you to the right specialty program."
  - label: "No — rent covers less than 75% of PITIA (DSCR likely below 0.80)"
    routes_to: [hard_exit_below_specialty_floor]
    scores: {dscr_band: 0}
    ts10_base: 0
    hard_exit: true
    exit_message: "DSCR loans have a 0.75 floor at the most aggressive specialty programs. Below that, the property's cash flow doesn't support the loan — options: (a) increase down payment to reduce PITIA, (b) negotiate rent increase post-rehab, (c) consider a different property. We can re-engage when the cash flow picture improves."
  - label: "I don't know — I haven't run the numbers"
    routes_to: [dscr_calculator_tool]
    scores: {dscr_band: 0, rent_realism: 0}
    ts10_base: 0
    soft_warning: [SWR-013]
    triage_message: "No problem — our DSCR calculator can run the numbers in 60 seconds. You'll need: (a) expected monthly rent, (b) purchase price or current value, (c) estimated interest rate (we'll default to current market), (d) property taxes and insurance estimate. [Link to calculator]."
  - label: "I'd rather use portfolio cash flow (multiple properties aggregate) — the subject property runs negative but my portfolio is strongly positive"
    routes_to: [portfolio_pipeline_aggregate]
    scores: {dscr_band: 5, rent_realism: 6}
    ts10_base: +1
    soft_warning: [SWR-007]
    edge_case_tag: [SA-002, SA-004]
    conditional_followup: Q-009B  # request portfolio rent rolls
    triage_message: "Portfolio-aggregate DSCR is available at Truss and a few specialty lenders — the subject property's negative cash flow can be offset by aggregate positive cash flow across your other properties. A senior LO will reach out to discuss portfolio-level underwriting."
compliance_note: "ECOA-safe — DSCR (rent / PITIA) is the core objective underwriting metric for DSCR loans (it's the product's defining feature). The question does NOT ask about personal income, employment, or DTI (which would be FP-015 territory — DSCR ignores personal DTI). The 'I don't know' option routes to a calculator tool, not rejection (Reg B §1002.4 — non-discouragement)."
```

```yaml
question_id: Q-012
section: decline_letter_triage
step: 3
question_text: "Have you received a decline letter on this file (or a similar file) from another DSCR or investment-property lender in the last 6 months?"
question_type: single_select
help_text: "If yes — this is GOOD news. ~40% of DSCR declines are lender-fit issues curable by re-shopping, not file issues. We have specialty lenders for every common decline reason."
options:
  - label: "No — this is my first application"
    routes_to: [main_pipeline]
    scores: {decline_letter: 10}
    ts10_base: +2
  - label: "No — but I've been pre-screening / haven't applied yet"
    routes_to: [main_pipeline]
    scores: {decline_letter: 9}
    ts10_base: +2
  - label: "Yes — declined for condotel or non-warrantable condo"
    routes_to: [specialty_intake_condotel, specialty_intake_non_warrantable]
    scores: {decline_letter: 6}
    ts10_base: +1
    specialty_route: true
    edge_case_tag: [EG-006, EG-007]
    triage_message: "Condotel and non-warrantable condo declines are almost always lender-fit issues, not file issues. Visio Lending and Kiavi write condotel STR DSCR; Truss, Bluestone, Lendmire, and Brookmont write non-warrantable DSCR. We'll route you to the right specialty lender — most declined files in this category close in 30-45 days."
  - label: "Yes — declined for unpermitted ADU income"
    routes_to: [specialty_intake_unpermitted_adu]
    scores: {decline_letter: 6}
    ts10_base: +1
    specialty_route: true
    edge_case_tag: [EG-005]
    triage_message: "Unpermitted ADU declines are curable two ways: (a) specialty-lender pivot treating the property as SFR (ADU ignored for income and value) at 70% LTV + 25bps premium, or (b) ADU permit cure (8-14 months in CA, faster elsewhere). Harpoon Capital and Truss handle the specialty pivot."
  - label: "Yes — declined for DSCR too low (1.00-1.20 range)"
    routes_to: [specialty_intake_thin_dscr]
    scores: {decline_letter: 5}
    ts10_base: +1
    specialty_route: true
    edge_case_tag: [EG-004]
    triage_message: "Thin-DSCR declines are often curable with compensators or portfolio context. AHLend (0.75 floor with compensators), Lendmire (0.75 floor), and Newfi (0.80 floor) all accept sub-1.0 DSCR. Plus portfolio-aggregate underwriting at Truss can offset subject-property cash flow."
  - label: "Yes — declined for reserves shortfall or 401(k) haircut issue"
    routes_to: [reserves_calculator_tool]
    scores: {decline_letter: 6}
    ts10_base: +1
    specialty_route: true
    edge_case_tag: [EG-008]
    triage_message: "Reserves-shortfall declines are often a calculation issue, not a real shortfall. Our reserves calculator applies the standard 60% 401(k) haircut and shows you options like co-borrower reserves combination or Lendmire's no-reserve program."
  - label: "Yes — declined for credit-event seasoning (bankruptcy, foreclosure, short sale)"
    routes_to: [specialty_intake_credit_seasoning]
    scores: {decline_letter: 5}
    ts10_base: +1
    specialty_route: true
    edge_case_tag: [EG-001, SA-008]
    triage_message: "Credit-event seasoning declines are usually lender-fit issues — standard programs require 36-48 months, specialty programs accept 24+ months with 700+ FICO. We'll route you to AHLend, America, or Bluestone specialty seasoning tier."
  - label: "Yes — declined for FICO below 660"
    routes_to: [specialty_intake_sub_660_fico]
    scores: {decline_letter: 5}
    ts10_base: +1
    specialty_route: true
    edge_case_tag: [SA-008]
    triage_message: "Below-660 FICO declines are lender-fit issues — Bluestone (550 floor), Truss / Rize / Lendmire (620 floor) all write sub-660 DSCR with 25-30% down + 6+ month reserves + 1.25+ DSCR."
  - label: "Yes — declined for property condition / open code violations"
    routes_to: [specialty_intake_property_condition]
    scores: {decline_letter: 5}
    ts10_base: +1
    specialty_route: true
    edge_case_tag: [SA-011]
    triage_message: "Open code violations can be underwritten at 70% LTV (vs 75% standard) + 6mo reserves + 1.25+ DSCR via lender-exception path. A senior LO can walk you through the exception-request process."
  - label: "Yes — declined for appraisal short (LTV exceeded post-appraisal)"
    routes_to: [specialty_intake_apraisal_short]
    scores: {decline_letter: 5}
    ts10_base: +1
    specialty_route: true
    triage_message: "Appraisal-short declines have 3 cure paths: (a) ROV (reconsideration of value) with better comps, (b) borrower brings additional cash to maintain LTV, (c) second appraisal if lender permits. A senior LO can walk you through which path fits."
  - label: "Yes — declined for mortgage late within 12 months"
    routes_to: [defer_with_roadmap]
    scores: {decline_letter: 0}
    ts10_base: 0
    hard_exit: true
    hex_rule: HEX-006
    exit_message: "DSCR lenders require 12+ months since your most recent 30-day mortgage late. We'll re-engage you at month 11 to start pre-qualification — most borrowers in this situation close 12-15 months after the late."
  - label: "Yes — declined for another reason (please specify)"
    routes_to: [specialty_intake_general]
    scores: {decline_letter: 5}
    ts10_base: +1
    specialty_route: true
    question_type: single_select + free_text
    triage_message: "Most DSCR declines are curable by re-shopping. A senior LO will review your decline letter (free, confidential) and route you to the right specialty lender — we have relationships with 12+ DSCR lenders across all specialty tiers."
  - label: "I'd rather not say"
    routes_to: [main_pipeline]
    scores: {decline_letter: 7}
    ts10_base: +1
    notes: "Per Reg B §1002.5(b)(1), applicants cannot be required to disclose prior application history on a pre-screen form. The 'rather not say' option must be available."
compliance_note: "ECOA-safe — decline-letter history is documented application activity, not a protected-class proxy. Per EG-06 Part 2: this is the single highest-leverage intake question — surfaces 5 of 8 edge cases (EG-001, EG-004, EG-005, EG-006, EG-007, EG-008) in one question. CRITICAL: every 'Yes — declined for X' option routes to SPECIALTY INTAKE, not auto-rejection. Per Reg B §1002.5(b)(1), the 'I'd rather not say' option is REQUIRED — applicants cannot be compelled to disclose prior application history. The 'I'd rather not say' option does NOT trigger any TS-10 downward score adjustment."
```

---

## Part 2: Hard Exit Logic (NP-04 Binary Disqualifiers)

Each HEX rule below maps to a question/option combination that triggers the exit. **Only 4 of 16 HEX rules are PERMANENT rejections** (HEX-001, HEX-009, HEX-012 outside specialty, HEX-013 outside specialty). The other 12 are CONDITIONAL hard-stops that route to specialty intake or defer-with-roadmap. Exit messages are respectful, non-discouraging (Reg B §1002.4), and provide a specific legitimate alternative.

```yaml
hard_exit_rules:

  - hex_rule: HEX-001
    rule: Property intended as primary residence, second home, or personal-use vacation
    triggered_by: Q-001 options [primary_residence, second_home, fix_and_flip]
    ff08_action: reject_with_redirect
    exit_type: permanent
    exit_message: "DSCR loans are designed for investment properties, not primary residences. For primary-residence financing, conventional, FHA, or VA loans offer lower rates and consumer protections DSCR loans can't provide. [Link to conventional lender directory / HUD-approved FHA lender search / VA loan resource]."
    specialty_routing: none
    redirect_destination: [conventional, FHA, VA, second-home conventional]
    compliance_note: "Universal hard-stop across all 8 GL-02 lenders. ECOA / Reg B risk if misused for owner-occupied financing. SAFE Act exemption depends on business-purpose designation."
    fp_override: none  # no FP pattern overrides HEX-001

  - hex_rule: HEX-002
    rule: STR property located in NYC (Local Law 18)
    triggered_by: Q-004b option [str_permit_unobtainable_nyc] OR geo_lookup_tool flag
    ff08_action: reject_with_redirect
    exit_type: conditional
    exit_message: "NYC's Local Law 18 restricts short-term rentals to host-present stays. We can underwrite this as a long-term rental DSCR (if LTR rents pencil — rare in NYC), or help you find an STR-permissive market — Florida coast, Smoky Mountains, Scottsdale AZ."
    specialty_routing: ltr_pivot OR market_pivot
    redirect_destination: [ltr_dscr_pipeline, str_permissive_market_education]
    compliance_note: "NYC Local Law 18 effective 2023 — objective municipal regulation, not a protected-class proxy."
    fp_override: FP-012  # LTR-pivot available if rents pencil

  - hex_rule: HEX-003
    rule: STR property located in Nashville TN residential zone (owner-occupancy permit required)
    triggered_by: Q-004b option [str_permit_unobtainable_nashville] OR geo_lookup_tool flag
    ff08_action: reject_with_redirect
    exit_type: conditional
    exit_message: "Nashville requires owner-occupancy for STR permits in residential zones. Consider Gatlinburg / Pigeon Forge TN, Panama City Beach FL, or Scottsdale AZ for STR DSCR — these markets have deep AirDNA comp sets and permissive regulations."
    specialty_routing: market_pivot
    redirect_destination: [str_permissive_market_education]
    compliance_note: "Nashville STR ordinance — objective municipal regulation."
    fp_override: FP-012  # LTR-pivot available if rents pencil

  - hex_rule: HEX-004
    rule: Condotel / hotel-condo conversion property type
    triggered_by: Q-002 option [condotel]
    ff08_action: route_to_specialty_intake
    exit_type: conditional
    exit_message: "Condotels need a specialty DSCR lender. Visio Lending and Kiavi write condotel STR DSCR (typically 30-35% down + 1.25+ DSCR + 12mo operating history). We can route you there."
    specialty_routing: condotel_specialty_lender
    redirect_destination: [specialty_intake_condotel]
    compliance_note: "Property-type classification, not borrower class. Standard property-disclosure compliance."
    fp_override: FP-007  # condotel is fundable at specialty

  - hex_rule: HEX-005
    rule: Non-warrantable condo (investor concentration >50% OR pending HOA litigation OR hotel conversion OR non-compliant HOA)
    triggered_by: Q-002 option [non_warrantable_condo]
    ff08_action: route_to_specialty_intake
    exit_type: conditional
    exit_message: "Non-warrantable condos need a specialty DSCR lender — Truss, Bluestone, Lendmire, and Brookmont all write non-warrantable DSCR (typically 70% LTV + 1.25+ DSCR + 25-50bps premium + HOA questionnaire)."
    specialty_routing: non_warrantable_specialty_lender
    redirect_destination: [specialty_intake_non_warrantable]
    compliance_note: "Property-type classification. HOA questionnaire is the documentation basis."
    fp_override: FP-006  # non-warrantable is fundable at specialty

  - hex_rule: HEX-006
    rule: Recent 30-day mortgage late payment within last 12 months
    triggered_by: Q-006b option [mortgage_late_within_12mo] OR Q-012 option [declined_for_mortgage_late]
    ff08_action: defer_12mo
    exit_type: conditional (defer-with-roadmap)
    exit_message: "DSCR lenders require 12+ months since your most recent 30-day mortgage late. We'll re-engage you at month 11 to start pre-qualification — most borrowers in this situation close 12-15 months after the late. Free resource: our 12-month mortgage-seasoning roadmap [link]."
    specialty_routing: defer_with_12mo_re_engagement
    redirect_destination: [defer_with_roadmap]
    compliance_note: "Housing-history review is mandatory across all DSCR programs despite no-DTI underwriting. Per NP-04 FP-009: mortgage lates 12-24mo ago are fundable at specialty — defer (not permanent reject)."
    fp_override: FP-009  # 12+ months seasoning unlocks specialty

  - hex_rule: HEX-007
    rule: Foreclosure discharged less than 36 months ago (standard) OR less than 24 months ago with FICO below 700 (specialty)
    triggered_by: Q-006b options [foreclosure_2_3yr_with_700plus_fico, foreclosure_less_than_2yr]
    ff08_action: defer_or_route_to_specialty
    exit_type: conditional
    exit_message_template:
      - condition: "foreclosure 24-36mo + FICO ≥700"
        exit_message: "Foreclosure 24-36 months seasoning qualifies at specialty programs with 700+ FICO. AHLend, America Mortgages, and Bluestone all write specialty seasoning tier. We'll route you there with a 25-35% down payment + 12mo reserves + 1.30+ DSCR counteroffer."
      - condition: "foreclosure <24mo OR FICO <700 with 24-36mo seasoning"
        exit_message: "Foreclosure requires 24 months seasoning minimum (specialty programs with 700+ FICO) or 36 months (standard programs). We'll re-engage you at month 22 (if you're rebuilding FICO to 700+) or month 34 (standard path). Free resource: our 24/36-month seasoning roadmap [link]."
    specialty_routing: defer_with_roadmap OR specialty_intake_foreclosure_seasoning
    redirect_destination: [specialty_intake_foreclosure_seasoning, defer_with_roadmap]
    compliance_note: "Seasoning requirement is objective, documented in DSCR Authority seasoning benchmarks. Per NP-04 FP-001: post-seasoning credit-scarred borrowers are fundable — defer (not permanent reject)."
    fp_override: FP-001  # post-seasoning is fundable

  - hex_rule: HEX-008
    rule: Chapter 7 bankruptcy discharged less than 48 months ago (standard) OR less than 24-36 months ago (specialty)
    triggered_by: Q-006b options [chapter_7_bk_2_4yr, chapter_7_bk_less_than_2yr]
    ff08_action: defer_or_route_to_specialty
    exit_type: conditional
    exit_message_template:
      - condition: "Chapter 7 discharged 24-48mo + FICO ≥700"
        exit_message: "Chapter 7 bankruptcy 24-48 months seasoning qualifies at specialty programs with 700+ FICO. We'll route you to AHLend, America, or Bluestone specialty seasoning tier."
      - condition: "Chapter 7 discharged <24mo"
        exit_message: "Chapter 7 bankruptcy requires 24 months seasoning minimum (specialty programs with 700+ FICO) or 48 months (standard programs). We'll re-engage you at month 22 (specialty path) or month 46 (standard path)."
      - condition: "Chapter 13 on-plan 12+ months with trustee approval"
        exit_message: "Chapter 13 on-plan with 12+ months of trustee-approved payments is fundable at specialty programs. We'll route you to a senior LO who handles on-plan bankruptcies."
    specialty_routing: specialty_intake_bk_seasoning OR defer_with_roadmap
    redirect_destination: [specialty_intake_bk_seasoning, specialty_intake_ch13_on_plan, defer_with_roadmap]
    compliance_note: "Seasoning requirement is objective. Per NP-04 FP-001: post-seasoning is fundable."
    fp_override: FP-001

  - hex_rule: HEX-009
    rule: Unresolved mortgage delinquency or uncured forbearance
    triggered_by: Q-006b option [currently_in_forbearance_or_unresolved_delinquency]
    ff08_action: reject_until_cured
    exit_type: permanent (until cured)
    exit_message: "DSCR lenders require all mortgage delinquencies cured and forbearance fully exited before application. Once your forbearance is exited and you've made 3+ on-time payments, we can re-engage — typically 3-6 months from forbearance exit. Free resource: forbearance-exit checklist [link]."
    specialty_routing: none (until cured)
    redirect_destination: [defer_with_roadmap]
    compliance_note: "AHLend explicitly lists 'unresolved mortgage delinquencies' and 'forbearance not fully cured' as decline triggers. Distinct from HEX-006 — this is currently delinquent, not historical."
    fp_override: none  # HEX-009 is one of the 4 PERMANENT rejections per NP-04 Part 6

  - hex_rule: HEX-010
    rule: Foreign-national borrower without US-based LLC (EIN + operating agreement)
    triggered_by: Q-007A option [fn_no_llc_or_no_aml] OR [fn_no_either]
    ff08_action: route_to_FN_intake_with_LLC_setup
    exit_type: conditional (defer-with-workstream)
    exit_message: "Foreign-national DSCR requires a US LLC. We can connect you with a US attorney to form one (~$1,200, 2-4 weeks) and walk you through the operating-agreement and EIN process. Total pre-intake workstream is typically 3-6 weeks."
    specialty_routing: fn_pre_intake_workstream
    redirect_destination: [fn_pre_intake_workstream]
    compliance_note: "US LLC is a lender-published program requirement (AHLend + America Mortgages), not a demographic proxy. The workstream framing is non-rejection, specialty routing."
    fp_override: FP-003  # FN with no US credit is fundable when prepared

  - hex_rule: HEX-011
    rule: Foreign-national borrower without AML-compliant source-of-funds paper trail
    triggered_by: Q-007A option [fn_no_llc_or_no_aml] OR [fn_no_either]
    ff08_action: route_to_FN_intake_with_AML_prep
    exit_type: conditional (defer-with-workstream)
    exit_message: "Foreign-national DSCR needs a 2-4 week AML source-of-funds review. We'll walk you through assembling: 12 months of bank statements, certified English translation, USD conversion, and a source-of-funds letter. Most FN borrowers complete this workstream in 3-4 weeks."
    specialty_routing: fn_pre_intake_workstream
    redirect_destination: [fn_pre_intake_workstream]
    compliance_note: "AML documentation is lender-imposed, applies to all FN borrowers regardless of country. Source-of-funds narrative is objective (prior real estate sale, business sale, etc.), not demographic."
    fp_override: FP-003

  - hex_rule: HEX-012
    rule: Loan amount below $100K-$150K program minimum
    triggered_by: Q-003b option [under_100k]
    ff08_action: reject_with_redirect
    exit_type: permanent (outside specialty)
    exit_message: "DSCR loans start at ~$100K-$150K (lender program floor). For smaller loan amounts, hard money, private notes, or local community lenders may be a better fit. [Link to hard-money lender directory / private lending marketplace]."
    specialty_routing: none (outside DSCR product scope)
    redirect_destination: [hard_money, private_notes, community_lender]
    compliance_note: "Universal floor across GL-02 lenders; below this, hard money / private notes dominate. Truss publishes $100K-$150K min explicitly."
    fp_override: none  # HEX-012 is one of the 4 PERMANENT rejections

  - hex_rule: HEX-013
    rule: Property in commercial / retail / industrial use (with >25% commercial component) OR pure commercial
    triggered_by: Q-002 options [mixed_use_over_25pct_commercial, pure_commercial]
    ff08_action: route_to_specialty_intake (mixed-use) OR reject_with_redirect (pure commercial)
    exit_type: conditional (mixed-use) OR permanent (pure commercial)
    exit_message_template:
      - condition: "mixed-use (>25% commercial)"
        exit_message: "Mixed-use properties need a commercial-facing DSCR lender. Bluestone writes mixed-use and small-commercial DSCR — we can route you there with 30-35% down + 1.25+ DSCR."
      - condition: "pure commercial"
        exit_message: "Pure commercial-use properties need commercial mortgage financing, not residential DSCR. [Link to commercial mortgage broker directory / SBA 504 resource for owner-occupied commercial]."
    specialty_routing: mixed_use_specialty_lender (Bluestone) OR none
    redirect_destination: [specialty_intake_mixed_use, commercial_mortgage, sba_504]
    compliance_note: "Property-use classification, not borrower class. Newfi, AHLend, America, Lendmire all exclude; only Bluestone opens to mixed-use + small commercial."
    fp_override: none for pure commercial; mixed-use routes to specialty

  - hex_rule: HEX-014
    rule: STR property without obtainable non-owner STR permit (regardless of market)
    triggered_by: Q-004b options [str_permit_unobtainable_nyc, str_permit_unobtainable_nashville, not_sure_str_permit]
    ff08_action: defer_until_permit_confirmed OR route_to_LTR_pivot
    exit_type: conditional
    exit_message: "STR DSCR requires a confirmable non-owner STR permit. Two paths: (a) verify with the local municipality (we have a market-lookup tool to help), or (b) underwrite the property as a long-term rental DSCR instead (if LTR rents pencil)."
    specialty_routing: str_permit_verification OR ltr_pivot
    redirect_destination: [str_pipeline_deferred_permit, ltr_dscr_pipeline]
    compliance_note: "Objective municipal regulation. Applies beyond Nashville/NYC — San Francisco, Denver, parts of Austin also restrict."
    fp_override: FP-012  # LTR-pivot available if rents pencil

  - hex_rule: HEX-015
    rule: Borrower relying on speculative rents with no lease, rent schedule, or supportable appraisal narrative
    triggered_by: Q-009 option [none_of_above_docs] AND Q-011 option in [dscr_likely_1_25_plus, dscr_likely_1_00_1_25] (i.e., borrower estimates strong DSCR but has no documentation)
    ff08_action: defer_until_1007_supported
    exit_type: conditional (defer-with-roadmap)
    exit_message: "DSCR qualification requires supportable rent — a lease, rent schedule, or Form 1007 market-rent appraisal. Our team can help you get a 1007 ordered ($450-$650, 5-7 day turnaround) or connect you with a property manager to secure a lease. Most borrowers have documentation ready within 2-4 weeks."
    specialty_routing: defer_with_roadmap
    redirect_destination: [defer_with_roadmap]
    compliance_note: "Rize exclusionary overlay — speculative rents without lease/rent schedule/1007 narrative excluded. Charter 'Audience to Actively Repel' — but defer-with-roadmap, not silent rejection."
    fp_override: none (this is a remediable gap, not a false-positive pattern)

  - hex_rule: HEX-016
    rule: Property with 5+ units (5-8 unit) at non-AHLend lender
    triggered_by: Q-002 option [5_8_unit_residential]
    ff08_action: route_to_specialty_intake
    exit_type: conditional
    exit_message: "5-8 unit properties need a specialty DSCR lender — most residential DSCR programs cap at 4 units. AHLend writes 5-8 unit DSCR; we can route you there. (9+ units need commercial DSCR — different product.)"
    specialty_routing: ahlend_5_8_unit_specialty
    redirect_destination: [specialty_intake_5_8_unit]
    compliance_note: "Property-type classification. AHLend explicitly allows 5-8 unit; Newfi explicitly residential 1-4 unit only. 9+ units route to commercial DSCR."
    fp_override: none (5-8 unit is fundable at specialty, just not auto-routable)
```

---

## Part 3: Edge-Case Triage Logic (EG-06 Persona Routing)

For each EG-06 edge-case persona, the table below specifies: (a) which combination of question-answer options surfaces the edge case, (b) the triage message (per EG-06 Part 2: feature-language not threshold-language, signals competence in handling the edge case, does NOT promise "easy approval"), (c) the specialty routing destination, and (d) the lenders likely to fund. **Every edge case routes to specialty intake — never auto-rejection.**

```yaml
edge_case_triage:

  - persona_id: EG-001
    persona_name: "Post-Short-Sale Comeback"
    surfaced_by:
      question_combinations:
        - Q-006b option [short_sale_1_3yr] OR [chapter_7_bk_2_4yr] OR [foreclosure_2_3yr_with_700plus_fico]
        - Q-006a option in [660_699, 700_739]
        - Q-008a option in [25_30pct_down, 35pct_plus_down]
        - Q-008b option in [6_12mo_reserves, 12plus_mo_reserves]
    triage_message: "We have specialty seasoning programs for investors past credit events — 24-month / 36-month / 48-month paths depending on event type and current FICO. A senior LO who handles post-seasoning files will reach out to map you to the right program. Your bankruptcy / foreclosure / short sale is not a deal-killer — it's a routing question."
    specialty_routing: specialty_intake_credit_seasoning
    lenders_likely_to_fund: [Bluestone, AHLend, America Mortgages, Truss, Rize, Lendmire]
    ts10_score_range: [60, 80]
    review_queue: credit_seasoning_specialty_queue
    compliance_note: "MODERATE fair-lensing risk per EG-06 Part 3 — prior credit events correlate with protected-class characteristics. Use FEATURE-LANGUAGE ('specialty seasoning programs available — 24mo / 36mo / 48mo paths') not demographic-language. Underwriting decision governed by documented seasoning rules — that is compliant."

  - persona_id: EG-002
    persona_name: "ITIN US-Resident Investor"
    surfaced_by:
      question_combinations:
        - Q-007 option [us_resident_itin]
        - Q-006a option in [660_699, 700_739]
        - Q-008a option in [25_30pct_down, 20_25pct_down]
        - Q-008b option in [6_12mo_reserves, 9_12mo_reserves]
        - Q-010 option in [llc, s_corp]
    triage_message: "We have specialty DSCR programs for ITIN borrowers — AHLend and America Mortgages explicitly accept ITIN in lieu of SSN, with pricing that sits between standard and foreign-national tiers (+25-75bps). A bilingual senior LO who handles ITIN files will reach out. ITIN is not a barrier — it's a program feature at the right lender."
    specialty_routing: itin_pipeline
    lenders_likely_to_fund: [AHLend, America Mortgages, Truss (specialty wholesale), Rize]
    ts10_score_range: [60, 75]
    review_queue: itin_specialty_queue
    compliance_note: "HIGH fair-lensing risk per EG-06 Part 3 — ITIN is a direct proxy for national origin / citizenship status. CRITICAL: do NOT target by ITIN status, Spanish language, or country-of-origin in ad platforms. Bilingual (English + Spanish) form and landing pages are permissible under ECOA 'affirmative marketing' provision. Document AHLend + America Mortgages published ITIN eligibility as basis for outreach. **REQUIRES LEGAL REVIEW BEFORE DEPLOYMENT.**"

  - persona_id: EG-003
    persona_name: "No-Credit-Country Foreign National"
    surfaced_by:
      question_combinations:
        - Q-007 option [foreign_national_no_credit_bureau]
        - Q-007A option [fn_yes_llc_aml] OR [fn_one_not_other]
        - Q-008a option [35pct_plus_down]  # 40%+ down required
        - Q-008b option [12plus_mo_reserves]
        - Q-010 option [llc]
    triage_message: "We have specialty foreign-national DSCR programs for investors from no-credit-bureau countries — AHLend, America Mortgages, Angel Oak, A&D Mortgage, and HomeAbroad all write this tier. 60% LTV with 12 month reserves, US LLC, and AML source-of-funds trail. A senior LO who handles no-credit-country FN files will reach out — typically 60-90 day timeline from workstream start to close."
    specialty_routing: fn_no_credit_pipeline
    lenders_likely_to_fund: [AHLend, America Mortgages, Angel Oak, A&D Mortgage, HomeAbroad]
    ts10_score_range: [55, 75]
    review_queue: fn_no_credit_specialty_queue
    compliance_note: "HIGH fair-lensing risk per EG-06 Part 3 — foreign-national status is fair-lensing-adjacent. CRITICAL: do NOT target by country, language, or national-origin proxies. Use PROGRAM-FEATURE-LANGUAGE ('Foreign-national DSCR specialists — no US credit history required'). AML documentation requirements are lender-imposed, not borrower-imposed — they apply to all FN borrowers regardless of country. **REQUIRES LEGAL REVIEW BEFORE DEPLOYMENT.**"

  - persona_id: EG-004
    persona_name: "Sub-1.0 DSCR With Compensators"
    surfaced_by:
      question_combinations:
        - Q-011 option [not_quite_dscr_0_80_1_00]
        - Q-006a option in [700_739, 740_plus]
        - Q-008a option in [25_30pct_down, 35pct_plus_down]  # 65-70% LTV
        - Q-008b option in [12plus_mo_reserves]
        - Q-005 option in [1_5_properties, 6_20_properties, 20plus_properties]  # 3+ financed properties
        - Q-010 option in [llc, s_corp]
    triage_message: "Below-1.0 DSCR is fundable at specialty lenders when you have compensators — Newfi (0.80 floor), AHLend (0.75 floor with compensators), Lendmire (0.75 floor with compensators), America Mortgages (no-ratio path). 700+ FICO + 65-70% LTV + 12mo reserves + 3+ financed properties + LLC vesting unlocks these programs. A senior LO will route you to the right specialty fit."
    specialty_routing: specialty_intake_sub_1_dscr
    lenders_likely_to_fund: [Newfi, AHLend, Lendmire, America Mortgages]
    ts10_score_range: [55, 75]
    review_queue: sub_1_dscr_specialty_queue
    compliance_note: "LOW fair-lensing risk per EG-06 Part 3 — DSCR is a financial metric, not a protected-class proxy. Compensating-factor model is documented at AHLend, Lendmire, Newfi, America. Standard ECOA compliance — underwriting decision based on documented compensating-factor policy applied uniformly."

  - persona_id: EG-005
    persona_name: "Unpermitted-ADU Pivot"
    surfaced_by:
      question_combinations:
        - Q-002 option [sfr_with_unpermitted_adu]
        - Q-008a option in [25_30pct_down, 35pct_plus_down]  # 70% LTV required
        - Q-008b option in [6_12mo_reserves, 12plus_mo_reserves]
        - Q-011 option in [yes_comfortably, yes_barely]
    triage_message: "Unpermitted ADUs need a specialty-lender pivot — Harpoon Capital and a few other lenders qualify the property as SFR (ADU ignored for income AND value) at 70% LTV + 25bps premium. The ADU income is still collectable in operation, just not counted for qualification. Two paths: (a) specialty pivot (30-45 day close), or (b) permit cure (8-14 months in CA, faster elsewhere). A senior LO will walk you through both."
    specialty_routing: specialty_intake_unpermitted_adu
    lenders_likely_to_fund: [Harpoon Capital, Truss (case-by-case), Rize (case-by-case)]
    ts10_score_range: [55, 70]
    review_queue: unpermitted_adu_specialty_queue
    compliance_note: "LOW-MODERATE fair-lensing risk per EG-06 Part 3 — property-type classification. ADU-permit-status disclosure is REQUIRED: borrower must be informed in writing that (i) ADU income is excluded from DSCR qualification, (ii) ADU value is excluded from appraisal, (iii) ADU income still collectable in operation. Prevents misrepresentation claims post-close."

  - persona_id: EG-006
    persona_name: "Non-Warrantable Condo Specialist"
    surfaced_by:
      question_combinations:
        - Q-002 option [non_warrantable_condo]
        - Q-008a option in [25_30pct_down, 35pct_plus_down]  # 70% LTV
        - Q-006a option in [660_699, 700_739, 740_plus]
        - Q-008b option in [6_12mo_reserves, 12plus_mo_reserves]
        - Q-009 option [hoa_questionnaire]
    triage_message: "Non-warrantable condos are fundable at specialty DSCR lenders — Truss, Bluestone, Lendmire, and Brookmont all write non-warrantable DSCR. 70% LTV + 1.25+ DSCR + 6-12mo reserves + 25-50bps premium + HOA questionnaire. The HOA questionnaire (we can help you order one, $250-$450, 5-10 day turnaround) is the key document."
    specialty_routing: specialty_intake_non_warrantable
    lenders_likely_to_fund: [Truss, Bluestone, Lendmire, Brookmont]
    ts10_score_range: [55, 75]
    review_queue: non_warrantable_specialty_queue
    compliance_note: "LOW fair-lensing risk per EG-06 Part 3 — property-type classification, not borrower class. HOA questionnaire is the documentation basis. Borrower must be informed of (i) non-warrantable overlay applies, (ii) LTV haircut + rate premium are the pricing impact, (iii) specialty-lender routing is required."

  - persona_id: EG-007
    persona_name: "Condotel STR Investor"
    surfaced_by:
      question_combinations:
        - Q-002 option [condotel]
        - Q-001 option in [short_term_rental, mix]
        - Q-008a option in [35pct_plus_down]  # 30-35% down (65-70% LTV)
        - Q-006a option in [700_739, 740_plus]
        - Q-008b option in [12plus_mo_reserves]
        - Q-009 option [airdna_projection] OR [str_host_history_12plus_mo]
        - Q-004b option in [str_permit_yes]
    triage_message: "Condotels need a specialty DSCR lender — Visio Lending and Kiavi have STR-condotel programs. 30-35% down + 1.25+ DSCR + 12mo operating history (or AirDNA projection for first-time STR) + STR-permissive market + STR permit + LLC vesting. A senior LO who handles condotel files will reach out."
    specialty_routing: specialty_intake_condotel
    lenders_likely_to_fund: [Visio Lending, Kiavi, Truss]
    ts10_score_range: [55, 75]
    review_queue: condotel_specialty_queue
    compliance_note: "LOW-MODERATE fair-lensing risk per EG-06 Part 3 — property-type classification. STR market regulatory check (HEX-014) applies — borrower must confirm STR permit obtainable. Borrower must be informed that (i) condotel overlay applies, (ii) specialty-lender routing required (Visio/Kiavi), (iii) STR-permit verification is independent of lender approval."

  - persona_id: EG-008
    persona_name: "401(k)-Reserves Co-Borrower Pivot"
    surfaced_by:
      question_combinations:
        - Q-008b option [less_than_3mo_with_401k]
        - Q-006a option in [700_739, 740_plus]
        - Q-008a option in [25_30pct_down, 35pct_plus_down]
        - Q-011 option in [yes_comfortably, yes_barely]
    triage_message: "401(k) reserves can count at 60% of value (e.g., $50K 401k = $30K qualifying) — and you can add a co-borrower (spouse, partner, business partner) with liquid checking to combine reserves. Lendmire also has a no-reserve-required program at ≤$1.5M loan + ≤70% LTV. Our reserves calculator will show you the options — most borrowers in this situation actually qualify."
    specialty_routing: reserves_calculator_tool
    lenders_likely_to_fund: [Lendmire (no-reserve program), AHLend, America Mortgages, Truss]
    ts10_score_range: [60, 80]
    review_queue: reserves_pivot_specialty_queue
    compliance_note: "LOW fair-lensing risk per EG-06 Part 3 — documentation methodology, not borrower class. 60% haircut is industry-standard. Co-borrower addition is a structuring option. Borrower must be informed (i) 60% 401(k)/IRA haircut is standard methodology, (ii) co-borrower addition is a structuring option, (iii) reserves calc must clear 6mo PITIA after haircut."
```

---

## Part 4: Soft-Warning Triggers (Manual Review Flags)

Each SWR rule below triggers an INTERNAL flag (not visible to borrower) and routes to a manual-review queue. SWR deltas stack additively for TS-10 lead-score computation (e.g., SWR-001 + SWR-002 + SWR-007 = -27 points). **SWR flags do NOT auto-reject** — they trigger manual review, counteroffer, additional documentation, or specialty routing.

```yaml
soft_warning_rules:

  - swr_rule: SWR-001
    rule: Reserves held primarily in retirement accounts (401k / IRA)
    triggered_by: Q-008b option [less_than_3mo_with_401k]
    internal_flag: reserves_401k_haircut_required
    ff08_action: Trigger reserves calculator tool that auto-applies 60% haircut; request 2mo bank statements showing liquid funds
    review_queue: reserves_review_queue
    ts10_score_impact: -5
    notes: "Most common reserve-calculation error per NP-04 CF-026. The reserves calculator is the single highest-leverage intake tool (per NP-04 Part 6 handoff)."

  - swr_rule: SWR-002
    rule: DSCR between 1.00 and 1.10 (thin band)
    triggered_by: Q-011 option [yes_barely] AND Q-008a option in [20_25pct_down, 25_30pct_down] (high LTV)
    internal_flag: thin_dscr_counteroffer_likely
    ff08_action: Trigger counteroffer with options — 70% LTV vs 75% / rate-and-term vs cash-out / additional reserves
    review_queue: thin_dscr_review_queue
    ts10_score_impact: -10
    notes: "CF-011 approved at 1.04 only with 6mo property-specific reserve + portfolio context. CF-008 needed 42% down to clear 1.12. Thin DSCR triggers LTV haircut or reserve increase."

  - swr_rule: SWR-003
    rule: FICO between 620 and 659
    triggered_by: Q-006a option [620_659]
    internal_flag: sub_660_fico_specialty_routing
    ff08_action: Route to Bluestone / Rize / Truss / Lendmire specialty intake with 25-30% down + 6mo reserves + 1.25+ DSCR counteroffer
    review_queue: sub_660_fico_review_queue
    ts10_score_impact: -8
    notes: "CF-028 645 FICO approved with 70% LTV + 12mo reserves + 50bps premium. Bluestone (550 floor) is the most active lender here."

  - swr_rule: SWR-004
    rule: First-time STR investor with no host history
    triggered_by: Q-001 option in [short_term_rental, mix] AND Q-005 option [first_investment_property] AND Q-009 option [airdna_projection] (no host history)
    internal_flag: first_time_str_airdna_required
    ff08_action: Require AirDNA report + 12mo reserves + 25pct down + STR permit verification
    review_queue: first_time_str_review_queue
    ts10_score_impact: -6
    notes: "CF-014 first-time STR approved in Gatlinburg at 1.27 DSCR + 25% AirDNA haircut + 12mo reserves. CF-006 Panama City Beach approved with <1mo STR history via AirDNA projection."

  - swr_rule: SWR-005
    rule: Foreign-national borrower from no-credit country (no Nova Credit translation)
    triggered_by: Q-007 option [foreign_national_no_credit_bureau]
    internal_flag: no_credit_country_fn_tier
    ff08_action: Route to no-credit-country FN tier — 60% LTV + 12mo reserves + 12mo foreign bank statements + source-of-funds trail
    review_queue: fn_no_credit_review_queue
    ts10_score_impact: -7
    notes: "CF-018 Brazilian borrower approved at 60% LTV + 12mo reserves + 8.125% rate (+1.25% premium)."

  - swr_rule: SWR-006
    rule: Property with open code violations or condition issues
    triggered_by: Q-012 option [declined_for_property_condition] OR free-text mention of code violations
    internal_flag: property_condition_exception_path
    ff08_action: Trigger low-LTV exception path — 70% LTV (vs 75% standard) + 6mo reserves + 1.25+ DSCR
    review_queue: property_condition_review_queue
    ts10_score_impact: -8
    notes: "CF-007 approved with 3 open violations at 70% LTV + 6mo reserves + 1.25+ DSCR. Lender exception granted; property-condition risk priced via LTV haircut."

  - swr_rule: SWR-007
    rule: Cash-out refi producing negative cash flow on subject property
    triggered_by: Q-003a option [cash_out_refi] AND Q-011 option [portfolio_aggregate_cash_flow] OR Q-011 option [not_quite_dscr_0_80_1_00]
    internal_flag: cash_out_negative_subject_cash_flow
    ff08_action: Require portfolio-context documentation — 12-mo rent rolls on other properties, portfolio-aggregate DSCR
    review_queue: cash_out_portfolio_review_queue
    ts10_score_impact: -12
    notes: "CF-011 approved at 1.04 DSCR with -$267/mo subject cash flow ONLY because of $3,200/mo aggregate positive cash flow across 10 other properties."

  - swr_rule: SWR-008
    rule: Appraisal-risk flag — rate-term refi at 75% LTV in softening market
    triggered_by: Q-003a option [rate_and_term_refi] AND Q-008a option in [20_25pct_down] (75-80% LTV band) AND geo_lookup_tool flag [softening_market]
    internal_flag: appraisal_risk_pre_review
    ff08_action: Trigger comp-pull before formal application — lender-orders or borrower-orders BPO + 2-comp review
    review_queue: appraisal_risk_review_queue
    ts10_score_impact: -5
    notes: "CF-025 declined when appraisal came in $30K below estimate (75% → 81% LTV). Pre-appraisal comp pull prevents wasted application."

  - swr_rule: SWR-009
    rule: Borrower at LTV ceiling (80-85% purchase) with FICO 620-680
    triggered_by: Q-008a option [15_20pct_down] AND Q-006a option in [620_659, 660_699]
    internal_flag: ltv_ceiling_mid_fico_counteroffer
    ff08_action: Suggest 25pct down instead of 20pct — counteroffer with LTV haircut
    review_queue: ltv_ceiling_review_queue
    ts10_score_impact: -10
    notes: "GL-02 CF-02 compensating-factor pattern: FICO at floor requires 25-30% down + 1.25+ DSCR. Lendmire/Newfi 85% LTV tier requires 720+ FICO + 1.25-1.5+ DSCR."

  - swr_rule: SWR-010
    rule: Below-1.0 DSCR on initial calculation (0.75-0.99)
    triggered_by: Q-011 option [not_quite_dscr_0_80_1_00]
    internal_flag: sub_1_dscr_compensators_required
    ff08_action: Route to AHLend / Lendmire / Newfi specialty with compensator-collection prompt — FICO 700+ + LTV ≤65-70% + 12mo reserves + 3+ financed properties + LLC vesting
    review_queue: sub_1_dscr_review_queue
    ts10_score_impact: -15
    notes: "Recoverable — do NOT auto-decline. AHLend/Lendmire/Newfi all accept 0.75-0.80 DSCR with compensators. CF-008 demonstrates cure via down-payment increase (1.12 DSCR at 42% down)."

  - swr_rule: SWR-011
    rule: Borrower with 5+ financed properties (portfolio/blanket loan request)
    triggered_by: Q-005 option in [6_20_properties, 20plus_properties] OR Q-003b option in [2m_5m, 5m_plus]
    internal_flag: portfolio_level_reserve_documentation_required
    ff08_action: Require portfolio-level reserve documentation + 680+ aggregate FICO + portfolio rent rolls
    review_queue: portfolio_review_queue
    ts10_score_impact: -3
    notes: "Truss portfolio/blanket DSCR requires higher reserves + FICO per GL-02 Part 1 GL02-001 special features."

  - swr_rule: SWR-012
    rule: ITIN borrower with limited US credit history (<24mo, <3 tradelines)
    triggered_by: Q-007 option [us_resident_itin] AND Q-006a option in [660_699] (thin-file-likely-mid-fico)
    internal_flag: itin_thin_credit_supplemental_docs
    ff08_action: Require 12mo bank statements + employment verification letter + 9mo reserves (vs 6mo standard)
    review_queue: itin_review_queue
    ts10_score_impact: -6
    notes: "CF-019 ITIN borrower approved with 9mo reserves + 50bps rate premium + 12mo bank statement supplement. ITIN tier sits between pure FN and US borrower pricing."

  - swr_rule: SWR-013
    rule: Borrower self-identifies as "no credit needed" / "DSCR = no personal review"
    triggered_by: Q-006a option [rather_not_say] OR Q-011 option [i_dont_know] OR Q-005 option [first_investment_property] AND Q-011 option [i_dont_know]
    internal_flag: borrower_education_gap
    ff08_action: Trigger borrower-education module BEFORE intake — DSCR-101 explainer on housing-history review, FICO overlay, reserves methodology
    review_queue: education_gap_review_queue
    ts10_score_impact: -4
    notes: "CF-027 decline surprised borrower who thought DSCR = no housing-history review. Borrower-education gap is itself a yellow flag — these borrowers often have other unremediated overlay risks."

  - swr_rule: SWR-014
    rule: STR property in market with pending STR regulation changes
    triggered_by: Q-004b option [not_yet_verifying_permit] OR [not_sure_str_permit] AND geo_lookup_tool flag [pending_str_legislation]
    internal_flag: str_market_risk_review
    ff08_action: Require STR permit verification + 6mo STR operating history backup (if available)
    review_queue: str_market_risk_review_queue
    ts10_score_impact: -7
    notes: "STR regulatory landscape shifting in 2025-2026 — markets currently permissive may not remain so (Nashville, Phoenix, Austin all have pending legislation). Mitigate by requiring permit + history."

  - swr_rule: SWR-015
    rule: Unpermitted ADU on property (income used in borrower's calc)
    triggered_by: Q-002 option [sfr_with_unpermitted_adu]
    internal_flag: unpermitted_adu_income_recalculation
    ff08_action: Recalc DSCR excluding ADU income + offer specialty-lender pivot at 70pct LTV
    review_queue: unpermitted_adu_review_queue
    ts10_score_impact: -8
    notes: "CF-021 mainline lender excluded unpermitted ADU income → DSCR fell from 1.40 to 1.00 (floor, not best-tier). Specialty lender pivot at 70% LTV approved."

  - swr_rule: SWR-016
    rule: Foreign-national reserves held in overseas account (not yet US-domiciled)
    triggered_by: Q-007 option in [foreign_national_strong_credit, foreign_national_no_credit_bureau] AND Q-007A option [fn_one_not_other]
    internal_flag: fn_overseas_reserves_seasoning_required
    ff08_action: Require 2-week US wire transfer setup + 60-90 day seasoning in US bank
    review_queue: fn_reserves_seasoning_review_queue
    ts10_score_impact: -5
    notes: "CF-017 UK borrower opened US bank 90 days pre-close via Relay Financial; CF-018 Brazilian borrower seasoned funds 90 days. Foreign reserves need translation + USD conversion + US-domicile seasoning."
```

---

## Part 5: Funnel Friction Audit (Friction Points That Kill Fundable Files + Fixes)

The friction points below are common intake-design errors that repel fundable-but-sensitive borrowers. Each is grounded in NP-04 false-positive patterns (Part 5) + EG-06 edge-case funnel-entry failures (Part 2) + SA-05 persona watch_outs. Each fix is specific and actionable.

```yaml
friction_points:

  - friction_id: FF-001
    friction: "Asking for tax returns upfront"
    kills_these_fundable_personas: [SA-001 Cash-Flow Optimizer (self-employed with heavy write-offs), SA-002 Portfolio Scaler, SA-012 BRRRR Cyclist]
    evidence: "NP-04 FP-015 — DSCR ignores personal DTI entirely; CF-003 tax returns showed $62K vs $180K+ actual cash flow — DSCR qualified on property income. Self-employed borrowers with heavy write-offs abandon forms that ask for tax returns because they assume they'll be declined for low AGI."
    fix: "Ask for property income documentation (lease, rent schedule, 1007) on the intake form. Request tax returns only at LO handoff, and only for portfolio-aggregate underwriting (SWR-007) or Truss portfolio/blanket DSCR (SWR-011). Frame the form: 'DSCR qualifies on property income, not personal tax returns.'"

  - friction_id: FF-002
    friction: "Asking for SSN on the first form"
    kills_these_fundable_personas: [SA-010 ITIN US-Resident Investor, SA-005 Strong-Credit FN, SA-006 No-Credit FN]
    evidence: "NP-04 FP-002 — ITIN borrowers see 'SSN required' and abandon. NP-04 FP-003 — foreign nationals see 'SSN required' and assume DSCR is US-citizens-only. EG-06 Part 2 — 'SSN required' is the single most-repelling phrase in DSCR ad copy and intake forms."
    fix: "Ask 'Do you have an SSN, an ITIN, or neither?' as the ONLY identity question on the form (Q-007). SSN collection happens only at LO handoff for credit pull, with ECOA-compliant disclosure. The 'neither' option routes to FN pre-intake workstream, not rejection. Bilingual (English + Spanish) form is recommended."

  - friction_id: FF-003
    friction: "Mandatory 2-year employment history"
    kills_these_fundable_personas: [SA-001 Cash-Flow Optimizer (recently self-employed), SA-003 First-Timer (career-change borrower), SA-008 Credit-Scarred Rebuilder (post-event career restart)]
    evidence: "NP-04 FP-015 — DSCR IGNORES personal employment history for qualification. Conventional 2-year employment history is a DTI-underwriting concept that does NOT apply to DSCR. Asking for it signals to borrowers that DSCR is just another conventional product."
    fix: "Ask '2+ years of investor experience OR 2+ years of property income documentation' — EITHER satisfies the underwriting criteria. Do NOT ask about employment history at all on the intake form. For SA-001 (self-employed), the property income documentation is the qualifying factor, not the employment history."

  - friction_id: FF-004
    friction: "Asking 'Have you EVER had a bankruptcy or foreclosure?' (no time window)"
    kills_these_fundable_personas: [SA-008 Credit-Scarred Cash-Rich Rebuilder, EG-001 Post-Short-Sale Comeback, EG-002 ITIN (thin-credit-fragile)]
    evidence: "NP-04 FP-001 — post-seasoning credit-scarred borrowers are fundable at specialty programs (24mo/36mo/48mo paths). A bankruptcy 10 years ago is irrelevant; a bankruptcy 6 months ago is a defer-with-roadmap. 'Ever' questions conflate these."
    fix: "Use time-banded questions: 'Chapter 7 bankruptcy discharged 4+ years ago / 2-4 years ago / less than 2 years ago / none' (Q-006b). Each band has a distinct routing — main pipeline / specialty seasoning / defer-with-roadmap / clean. The question communicates that DSCR has seasoning paths, not just 'clean credit only.'"

  - friction_id: FF-005
    friction: "Requiring liquid reserves only (no 401(k)/IRA/co-borrower combination)"
    kills_these_fundable_personas: [EG-008 401(k)-Reserves Co-Borrower Pivot, SA-003 Cash-Strong First-Timer (often 401(k)-heavy)]
    evidence: "NP-04 FP-011 — borrowers with no reserves in checking but $50K+ in 401(k) frequently abandon forms that say 'liquid reserves only.' CF-026 — $35K 401(k) → $21K qualifying + $12K co-borrower checking = $33K = 6.2mo PITIA, clears 6mo minimum. The miscalc was the most common reversible decline."
    fix: "Reserves question (Q-008b) explicitly states 'Reserves can be in checking, savings, money market, or retirement accounts (401k/IRA counted at 60% of value).' Add a 'less than 3 months — but I have $50K+ in a 401(k)/IRA' option that routes to a reserves calculator tool. The calculator auto-applies the 60% haircut and shows co-borrower combination options."

  - friction_id: FF-006
    friction: "Hard floor on FICO at 660 (auto-decline below 660)"
    kills_these_fundable_personas: [SA-008 Credit-Scarred Cash-Rich Rebuilder, EG-001 Post-Short-Sale Comeback (mid-tier FICO is the defining feature)]
    evidence: "NP-04 FP-008 — FICO 620-659 is fundable at Bluestone (550 floor), Truss/Rize/Lendmire (620 floor). CF-028 approved at 645 FICO with 70% LTV + 12mo reserves + 50bps premium. '660+ FICO required' copy repels a fundable P7 cohort per NP-04 Part 6."
    fix: "FICO question (Q-006a) options include bands down to 'Below 580' — every band routes somewhere (main pipeline / specialty / specialty / specialty-with-strong-compensators). The intake message communicates 'specialty lenders exist for every FICO band' instead of '660+ required.'"

  - friction_id: FF-007
    friction: "Asking for property address BEFORE determining intent"
    kills_these_fundable_personas: [SA-007 STR Operator in restricted market (NYC/Nashville), SA-009 ADU CA, EG-005 Unpermitted ADU]
    evidence: "Borrowers in restricted-STR markets (NYC, Nashville) often abandon forms that ask for property address before confirming STR-permissive market. The address-first question signals 'we'll screen you out by location' — a redlining-adjacent concern."
    fix: "Ask intent (Q-001) and property type (Q-002) BEFORE property address (Q-004). For STR-intent borrowers, the market-lookup tool flags STR-permissive status BEFORE the borrower commits to the address. Borrowers in restricted markets get the LTR-pivot or market-pivot message, not a silent rejection."

  - friction_id: FF-008
    friction: "Single-axis DSCR question ('What is your DSCR?')"
    kills_these_fundable_personas: [EG-004 Sub-1.0 DSCR With Compensators, SA-002 Portfolio Scaler (subject-property DSCR may be low but portfolio aggregate is strong)]
    evidence: "EG-06 Part 4 boundary-enforcement rule #1: 'Every edge-case intake must collect BOTH the weak-axis metric AND the compensator-axis metric. Single-axis intake under-routes.' A borrower with 0.85 DSCR + 720 FICO + 65% LTV + 12mo reserves + 5 financed properties is fundable at AHLend — but a single-axis DSCR question screens them out."
    fix: "Q-011 asks for self-estimated DSCR band, AND Q-006a asks FICO band, AND Q-008a asks LTV band, AND Q-008b asks reserves band, AND Q-005 asks financed-property count. The routing decision is MULTI-AXIS — sub-1.0 DSCR with strong compensators routes to EG-004 specialty intake, not rejection."

  - friction_id: FF-009
    friction: "No decline-letter triage question"
    kills_these_fundable_personas: [SA-011 Compensated-Exception Shopper (the entire persona), EG-005 Unpermitted ADU, EG-006 Non-Warrantable Condo, EG-007 Condotel STR, EG-008 401(k)-Reserves Pivot]
    evidence: "EG-06 Part 2: 'The single highest-leverage intake change is a decline-letter triage question on the intake form.' ~40% of DSCR declines are lender-fit issues curable by re-shopping, NOT file issues (NP-04 Part 6 + GL-02 finding). Without this question, declined borrowers don't surface as reroutable — they bounce to the next lender and start over."
    fix: "Q-012 (final visible question) is the decline-letter triage question. Every 'Yes — declined for X' option routes to specialty intake, not auto-rejection. The triage message communicates: 'declines are expected and reroutable, not stigmatized.' Per Reg B §1002.5(b)(1), the 'I'd rather not say' option is required."

  - friction_id: FF-010
    friction: "Asking about DTI (debt-to-income) ratio"
    kills_these_fundable_personas: [SA-001 Cash-Flow Optimizer (DTI at 48-50% is the conventional wall — this is WHY they adopt DSCR), SA-002 Portfolio Scaler, SA-003 First-Timer with high student-loan DTI]
    evidence: "NP-04 FP-015 — 'DTI is NOT a DSCR intake question. Do not collect DTI for DSCR qualification.' CF-009 Marcus DTI at 48% approved specifically because DSCR ignores DTI. CF-003 tax returns showed $62K vs $180K+ actual cash flow — DSCR qualified on property income."
    fix: "Do NOT include a DTI question on the form. The form copy should CELEBRATE 'no DTI limit' as DSCR's core value proposition (per NP-04 AC-09 handoff). If a borrower volunteers DTI in free-text, the LO handoff note should explain that DSCR ignores DTI entirely."

  - friction_id: FF-011
    friction: "Asking 'Are you a US citizen?' as the identity question"
    kills_these_fundable_personas: [SA-005 Strong-Credit FN, SA-006 No-Credit FN, SA-010 ITIN US-Resident, EG-002 ITIN, EG-003 No-Credit FN]
    evidence: "EG-06 Part 3 — citizenship / national origin is a PROTECTED CLASS under ECOA. Asking 'Are you a US citizen?' is a direct fair-lensing violation. ITIN and FN-eligibility questions must be framed in PROGRAM-FEATURE language ('which documentation track fits you'), not demographic language."
    fix: "Q-007 asks 'Which identity documentation track fits you?' with options: US citizen/permanent resident with SSN / US resident with work permit (ITIN) / Foreign national with strong international credit / Foreign national with no international credit bureau / Not sure. Each option is anchored to a lender-published program feature (AHLend ITIN eligibility, AHLend/America FN eligibility). Bilingual form recommended under ECOA 'affirmative marketing' provision."

  - friction_id: FF-012
    friction: "Mandatory 'established STR host history' requirement"
    kills_these_fundable_personas: [SA-007 STR Permissive-Market Operator (first-time STR sub-segment), EG-007 Condotel STR (first-time STR sub-segment)]
    evidence: "NP-04 FP-013 — first-time STR investors with no Airbnb host history are fundable at AirDNA market projection + 25%+ down + 12mo reserves + FICO 720+ + STR-permissive regulatory market. CF-014 first-time STR approved in Gatlinburg at 1.27 DSCR + 25% AirDNA haircut + 12mo reserves. CF-006 Panama City Beach approved with <1mo STR history via AirDNA projection."
    fix: "Q-009 (documentation readiness) includes 'AirDNA / RentedRoof STR projection' as an option alongside '12+ months of STR host history' — either satisfies the rent-realism documentation requirement. SWR-004 flags first-time STR for manual review with AirDNA-required counteroffer, not auto-rejection."

  - friction_id: FF-013
    friction: "Asking about race / ethnicity / national origin on the intake form"
    kills_these_fundable_personas: [ALL — ECOA / Reg B violation, fair-lensing liability]
    evidence: "Reg B §1002.5(b) — applicants cannot be asked about race, color, religion, national origin, sex, marital status, age, or receipt of public assistance on a pre-screen form. HMDA-reporting demographic data collection is permitted ONLY at application (post-pre-screen), and ONLY for home-purchase / refinance of primary residence (NOT for business-purpose DSCR loans)."
    fix: "NO demographic questions on the intake form. The form collects ONLY objective underwriting criteria: property intent, property type, transaction type, market, experience level, FICO band, credit-event history, identity track, down payment, reserves, documentation readiness, entity structure, DSCR self-estimate, decline-letter history. Post-application HMDA demographic collection is NOT required for business-purpose DSCR loans (SAFE Act exemption)."

  - friction_id: FF-014
    friction: "Long single-page form (12+ questions on one screen)"
    kills_these_fundable_personas: [ALL — completion-rate collapse, especially SA-003 First-Timer (less committed), SA-008 Credit-Scarred (anxious about credit questions), EG-002 ITIN (less familiar with US mortgage process)]
    evidence: "Industry benchmark — single-page mortgage intake forms with 12+ questions see 50-70% abandonment at question 6-8. 3-step wizard forms with 4 questions per step see 30-40% completion. Borrowers in sensitive personas (credit-scarred, ITIN, first-time) abandon at higher rates when sensitive questions appear without context."
    fix: "3-step wizard: Step 1 (property + intent, 4 questions), Step 2 (financial profile + docs, 5 questions), Step 3 (identity + decline-letter triage, 3 questions). Each step has a progress indicator and a 'why we ask' tooltip on sensitive questions. Conditional follow-ups (Q-004B, Q-007A, Q-009C) appear only when triggered, keeping the visible question count low for most borrowers."
```

---

## Part 6: Compliance Audit Notes

### ECOA / Reg B Considerations by Question

```yaml
compliance_by_question:

  Q-001 (Property Intent):
    ecoa_risk: LOW
    rationale: "Property intent and occupancy type are objective underwriting criteria, not protected-class proxies. Universal hard-stop for primary residence across all 8 GL-02 lenders."
    reg_b_citation: "§1002.4 (no discouragement) — exit copy provides legitimate alternative resource (conventional/FHA/VA)"
    fair_lensing_review: "Standard — no demographic-adjacent language"
    required_disclosure: "Hard-exit message must include link to legitimate alternative financing"

  Q-002 (Property Type):
    ecoa_risk: LOW
    rationale: "Property type is objective underwriting criterion documented in every GL-02 lender's program matrix."
    reg_b_citation: "§1002.5(b) — property information collected as part of bona fide application is permissible"
    fair_lensing_review: "Standard — must verify non-warrantable condo / condotel / unpermitted ADU routing is consistent across borrowers (not selectively applied)"
    required_disclosure: "Property-type exception disclosures per EG-06 Part 3 (unpermitted ADU income exclusion, non-warrantable overlay, condotel overlay)"

  Q-003 (Transaction + Loan Amount):
    ecoa_risk: LOW
    rationale: "Transaction type and loan amount are objective criteria. Loan-amount band does NOT ask about income source or wealth origin."
    reg_b_citation: "§1002.4 — below-floor loan amount exit is informational, not discouraging"
    fair_lensing_review: "Standard"
    required_disclosure: "Below-floor exit message must include hard-money / private-notes alternative resource"

  Q-004 (Property Market + STR Permit):
    ecoa_risk: MODERATE
    rationale: "Geographic information is permissible for bona fide application, but market-lookup tool must be calibrated to OBJECTIVE municipal STR ordinance data, NOT demographic data."
    reg_b_citation: "§1002.5(b) — geographic information collected as part of bona fide application is permissible"
    fair_lensing_review: "REQUIRED — verify market-lookup tool does NOT use neighborhood demographic data; verify STR-restricted market routing is consistent (NYC, Nashville, SF, Denver, parts of Austin) and not selectively applied"
    required_disclosure: "STR-restricted market exit message must include LTR-pivot and market-pivot alternatives"

  Q-005 (Experience Level):
    ecoa_risk: LOW
    rationale: "Investment-property count is objective underwriting criterion (reserves and pricing vary by portfolio size per GL-02 Part 1)."
    reg_b_citation: "§1002.5(b) — investment experience is permissible as objective criterion"
    fair_lensing_review: "Standard — does NOT ask about occupation or employment history (which would be self-employment proxy risk)"
    required_disclosure: "None"

  Q-006 (Credit Profile):
    ecoa_risk: MODERATE
    rationale: "Credit score and credit-event history are objective underwriting criteria, but prior credit events correlate with protected-class characteristics (medical debt, divorce, job loss, disability). Must use FEATURE-LANGUAGE ('specialty seasoning programs available — 24mo / 36mo / 48mo paths') not DEMOGRAPHIC-LANGUAGE."
    reg_b_citation: "§1002.5(b)(1) — applicants cannot be COMPELLED to disclose credit score on a pre-screen form. The 'I'd rather not say' option on Part A is REQUIRED. §1002.4 — credit-event seasoning routes must provide defer-with-roadmap message, not silent rejection"
    fair_lensing_review: "REQUIRED — verify credit-event question does NOT ask about CAUSE of credit events (medical debt, divorce, job loss) — that would be protected-class-adjacent per EG-06 Part 3 EG-001"
    required_disclosure: "Defer-with-roadmap messages must include specific re-engagement timeline (month 22, month 34, etc.) and free resource link (seasoning roadmap)"

  Q-007 (Identity Track):
    ecoa_risk: HIGH
    rationale: "ITIN and foreign-national status are protected-class-adjacent under ECOA (national-origin proxy risk per EG-06 Part 3). Question must be framed in PROGRAM-FEATURE language ('which documentation track fits you'), NOT demographic language ('what is your citizenship')."
    reg_b_citation: "§1002.5(b) — national-origin citizenship questions are PROHIBITED. Program-feature language (ITIN accepted at AHLend / FN program at AHLend+America) is permissible when anchored to lender-published program feature."
    fair_lensing_review: "REQUIRED — **REQUIRES LEGAL REVIEW BEFORE DEPLOYMENT**. Verify (a) question framing is program-feature not demographic, (b) bilingual (English + Spanish) form under ECOA 'affirmative marketing' provision, (c) routing is consistent (ITIN borrowers do not receive different messaging than SSN borrowers beyond program-feature differences), (d) NO use of identity-track data for ad-platform lookalike audience building (Special Ad Category restriction)"
    required_disclosure: "ECOA notice — 'We do not discriminate against applicants on the basis of race, color, religion, national origin, sex, marital status, age, or receipt of public assistance.' Required on all mortgage advertisements per Reg B §1002.4(b)"

  Q-008 (Reserves + Down Payment):
    ecoa_risk: LOW
    rationale: "LTV and reserves are objective underwriting criteria documented in every GL-02 lender's program matrix. Part B does NOT ask about SOURCE of reserves (which would touch AML-adjacent territory for FN borrowers)."
    reg_b_citation: "§1002.5(b) — financial information collected as part of bona fide application is permissible"
    fair_lensing_review: "Standard — verify 401(k)/IRA haircut is applied consistently across borrowers"
    required_disclosure: "Reserves calculator must disclose 60% 401(k)/IRA haircut methodology"

  Q-009 (Documentation Readiness):
    ecoa_risk: LOW
    rationale: "Documentation readiness is objective underwriting criterion. Does NOT ask for tax returns upfront (which would repel self-employed borrowers per FP-015)."
    reg_b_citation: "§1002.4 — 'none of the above' routes to roadmap with 1007 ordering resource, not rejection"
    fair_lensing_review: "Standard"
    required_disclosure: "1007 ordering resource must include typical cost ($450-$650) and turnaround (5-7 days)"

  Q-010 (Entity Structure):
    ecoa_risk: LOW
    rationale: "Entity structure is objective underwriting criterion. Spousal co-ownership is NOT asked as a marital-status question (which would be familial-status proxy)."
    reg_b_citation: "§1002.5(b) — entity structure is permissible as business-structure question, not marital-status question"
    fair_lensing_review: "Standard — verify partnership / multi-member LLC question does NOT ask about marital status of partners"
    required_disclosure: "None"

  Q-011 (DSCR Self-Estimate):
    ecoa_risk: LOW
    rationale: "DSCR (rent / PITIA) is the core objective underwriting metric for DSCR loans. Does NOT ask about personal income, employment, or DTI (FP-015 — DSCR ignores personal DTI)."
    reg_b_citation: "§1002.4 — 'I don't know' option routes to calculator tool, not rejection (non-discouragement)"
    fair_lensing_review: "Standard"
    required_disclosure: "DSCR calculator must be free, no obligation, no email-gate"

  Q-012 (Decline-Letter Triage):
    ecoa_risk: MODERATE
    rationale: "Decline-letter history is documented application activity, not a protected-class proxy. BUT — prior decline reasons (credit event, reserves shortfall, property condition) correlate with protected-class-adjacent factors. Must route all 'Yes — declined for X' to SPECIALTY INTAKE, not auto-rejection."
    reg_b_citation: "§1002.5(b)(1) — applicants cannot be COMPELLED to disclose prior application history on a pre-screen form. The 'I'd rather not say' option is REQUIRED. §1002.4 — decline-letter routes must provide specialty-lender alternative, not silent rejection"
    fair_lensing_review: "REQUIRED — verify all 'Yes — declined for X' routes lead to specialty intake (not rejection), and that the 'I'd rather not say' option does NOT trigger TS-10 downward score adjustment"
    required_disclosure: "Decline-letter review must be free, confidential, no obligation"
```

### Question Ordering Rules (ECOA / Reg B Compliant)

```yaml
question_ordering_rules:

  rule_1_objective_criteria_first:
    description: "Objective property + intent questions first (Q-001 to Q-005). These questions screen non-DSCR borrowers (primary residence, commercial use, sub-$100K loan, restricted-STR market) before they invest time in financial-detail questions."
    rationale: "Reg B §1002.4 — non-discriminatory application process. Objective criteria first prevents demographic-adjacent questions from being the first thing a borrower encounters."

  rule_2_financial_details_second:
    description: "Financial-profile questions second (Q-006 to Q-009). Borrower has invested in the form by this point and is less likely to abandon at sensitive questions."
    rationale: "Reg B §1002.5(b) — financial information collected as part of bona fide application is permissible. By Step 2, the borrower has demonstrated bona fide intent."

  rule_3_identity_last:
    description: "Identity + decline-letter triage last (Q-010 to Q-012). Identity questions (ITIN/FN) are the highest fair-lensing risk — placed last so the borrower has full context on the program before encountering them."
    rationale: "EG-06 Part 3 — ITIN and FN questions carry HIGH fair-lensing risk. Placing them last (a) reduces abandonment by sensitive borrowers, (b) ensures the borrower has seen the program-feature language ('specialty programs available') before the identity question, (c) allows the form to frame the identity question as 'documentation track' rather than 'demographic classification.'"

  rule_4_no_demographic_ever:
    description: "NO demographic questions on the intake form. The form collects ONLY objective underwriting criteria."
    rationale: "Reg B §1002.5(b) — applicants cannot be asked about race, color, religion, national origin, sex, marital status, age, or receipt of public assistance on a pre-screen form. HMDA demographic collection is NOT required for business-purpose DSCR loans (SAFE Act exemption)."

  rule_5_optional_disclosure_required:
    description: "Reg B §1002.5(b)(1) — applicants cannot be COMPELLED to disclose credit score (Q-006a), prior application history (Q-012), or ITIN/FN status (Q-007) on a pre-screen form. Each of these questions must have an 'I'd rather not say' or equivalent option."
    rationale: "Reg B §1002.5(b)(1) — applicants cannot be required to disclose information that is not necessary for the credit decision. Pre-screen is not the credit decision."

  rule_6_progressive_disclosure:
    description: "Conditional follow-ups (Q-004B STR permit, Q-007A FN LLC+AML, Q-009C BRRRR rehab budget) appear only when triggered by a prior answer. The visible question count stays low (12) for most borrowers."
    rationale: "Reduces form abandonment (FF-014). Conditional follow-ups are objective criteria triggered by objective answers — not demographic-adjacent."
```

### Required Fair-Lensing Review Points

```yaml
fair_lensing_review_points:

  - review_point: FLR-001
    area: "Q-007 Identity Track (ITIN / FN)"
    risk_level: HIGH
    review_action: "Obtain ECOA / Reg B attorney review BEFORE deployment. Verify (a) question framing is program-feature not demographic, (b) bilingual form under ECOA 'affirmative marketing' provision, (c) routing is consistent, (d) NO use of identity-track data for ad-platform lookalike audience building."
    documentation_required: "Lender-published ITIN eligibility (AHLend URL + retrieval date) + lender-published FN eligibility (AHLend + America Mortgages URLs + retrieval dates) + bilingual form certification + ad-platform Special Ad Category compliance certification"

  - review_point: FLR-002
    area: "Q-006 Credit Profile (credit-event seasoning)"
    risk_level: MODERATE
    review_action: "Verify credit-event question does NOT ask about CAUSE of credit events (medical debt, divorce, job loss — protected-class-adjacent per EG-06 Part 3 EG-001). Verify seasoning-routed messaging uses FEATURE-LANGUAGE ('specialty seasoning programs available — 24mo / 36mo / 48mo paths') not DEMOGRAPHIC-LANGUAGE."
    documentation_required: "Lender-published seasoning benchmarks (DSCR Authority URL + retrieval date) + seasoning-route messaging audit"

  - review_point: FLR-003
    area: "Q-004 Property Market (STR-permit market-lookup tool)"
    risk_level: MODERATE
    review_action: "Verify market-lookup tool is calibrated to OBJECTIVE municipal STR ordinance data (NOT neighborhood demographic data). Verify STR-restricted market routing is consistent (NYC, Nashville, SF, Denver, parts of Austin) and not selectively applied."
    documentation_required: "Market-lookup tool data-source documentation (municipal STR ordinance URLs by city) + restricted-market list audit"

  - review_point: FLR-004
    area: "Q-012 Decline-Letter Triage"
    risk_level: MODERATE
    review_action: "Verify all 'Yes — declined for X' routes lead to SPECIALTY INTAKE (not rejection). Verify 'I'd rather not say' option does NOT trigger TS-10 downward score adjustment. Verify decline-letter review process is applied uniformly."
    documentation_required: "Specialty-lender referral network documentation (Visio, Kiavi, AHLend, Harpoon, Bluestone, Truss, Lendmire, Newfi, Brookmont, Angel Oak, A&D, HomeAbroad) + decline-letter triage process audit"

  - review_point: FLR-005
    area: "Q-008 Reserves (401(k) haircut + co-borrower combination)"
    risk_level: LOW
    review_action: "Verify 60% 401(k)/IRA haircut is applied consistently across borrowers. Verify co-borrower combination option is available to all borrowers (not selectively offered)."
    documentation_required: "Reserves calculator methodology documentation + co-borrower option availability audit"

  - review_point: FLR-006
    area: "Form-wide: ECOA notice + Adverse Action notice triggers"
    risk_level: LOW
    review_action: "Verify ECOA notice ('We do not discriminate...') is displayed on form and all landing pages. Verify hard-exit messages that constitute 'adverse action' under Reg B §1002.9 trigger the Adverse Action notice requirement (or are framed as 'incomplete application' / 'no application made' to avoid the notice trigger)."
    documentation_required: "ECOA notice placement audit + Adverse Action notice trigger matrix (which exit messages require notice, which do not)"
```

### Meta / Facebook Special Ad Category Constraints

```yaml
meta_special_ad_category_constraints:

  constraint_1_special_ad_category_required:
    description: "DSCR lead forms on Meta MUST be classified under Special Ad Category (Housing) — Meta policy. This restricts detailed demographic targeting, lookalike audience creation based on lead form data, and certain audience-expansion features."
    impact_on_FF-08: "Lead form data CANNOT be used to create lookalike audiences based on identity track (Q-007), credit profile (Q-006), or decline-letter history (Q-012). Lookalike audiences can only be based on property intent / property type / geographic intent (objective criteria)."

  constraint_2_no_demographic_targeting:
    description: "No targeting by race, ethnicity, national origin, religion, age (under 21 / over 65), sex, sexual orientation, gender identity, disability, medical condition, genetic information, marital status, family status, income (except broad income bands in some cases), bankruptcy status, credit score range."
    impact_on_FF-08: "Lead form answers to Q-006 (credit profile), Q-007 (identity track), Q-012 (decline-letter history) CANNOT be used as custom-audience targeting attributes on Meta. They can be used for INTERNAL routing and TS-10 scoring only."

  constraint_3_no_lookalike_on_protected_attributes:
    description: "Lookalike audiences CANNOT be created based on lead form data that touches protected attributes (credit profile, identity track, decline-letter history). Lookalike audiences CAN be created based on property intent, property type, geographic intent, experience level, entity structure, documentation readiness, DSCR self-estimate (objective underwriting criteria only)."
    impact_on_FF-08: "TS-10 must SEGMENT lead form data into 'objective criteria' (lookalike-eligible) and 'protected-adjacent criteria' (lookalike-ineligible). Internal data warehouse tagging required."

  constraint_4_age_targeting_restricted:
    description: "Age targeting restricted to 21+ (no under-21 targeting) and cannot be used to exclude older age bands. DSCR borrowers are typically 25-65+ — targeting 25-65 is permissible, targeting 'first-time homebuyer' is NOT (family-status proxy)."
    impact_on_FF-08: "Q-005 (experience level — first investment property) data CANNOT be used for ad-platform audience creation. It can be used for INTERNAL routing only."

  constraint_5_geo_targeting_restricted:
    description: "Geographic targeting restricted — cannot target by ZIP code alone (redlining-adjacent), must target by city / state / DMA / radius. Cannot exclude specific neighborhoods."
    impact_on_FF-08: "Q-004 (property market) data CAN be used for geo-targeting at the city / state / DMA level. CANNOT be used to exclude specific neighborhoods or ZIP codes."

  constraint_6_lead_form_question_restrictions:
    description: "Meta lead form questions cannot ask about protected attributes directly. Questions about income, credit score, and bankruptcy status are restricted or require Special Ad Category compliance review."
    impact_on_FF-08: "Meta lead form (if used) should ask ONLY Q-001 (property intent), Q-002 (property type), Q-003 (transaction + loan amount band), Q-004 (property market), Q-005 (experience level), Q-010 (entity structure), Q-011 (DSCR self-estimate). Q-006 (credit profile), Q-007 (identity track), Q-008 (reserves), Q-009 (documentation), Q-012 (decline-letter) should be collected ON THE LANDING PAGE (post-Meta-lead-form), not on the Meta lead form itself. This preserves the borrower's first-touch as 'intent' (compliant) and defers sensitive questions to the lender-controlled landing page."
```

---

## Part 7: Form Field → TS-10 Score Mapping

This is the binding contract between FF-08 and TS-10. Each form field maps to one or more TS-10 scoring dimensions. TS-10 computes the 0-100 approval score by combining:
- **Base score** (sum of `ts10_base` values from each question option, max ~40)
- **SWR deltas** (additive downward pressure, -3 to -15 per rule, stacked)
- **FP-pattern protection** (FP patterns do NOT trigger negative score deltas)
- **Specialty-routing bonus** (specialty-routed leads score 30-50 minimum per NP-04 Part 6)
- **Hard-exit override** (HEX-001 / HEX-009 / HEX-012 outside specialty / HEX-013 outside specialty = score 0)

| Question | Form Field | TS-10 Scoring Dimension(s) Informed | Base Score Range | SWR / HEX / FP Cross-References |
|---|---|---|---|---|
| Q-001 | property_intent | property_intent, occupancy_type, transaction_type | 0 to +5 | HEX-001 (primary residence → score 0) |
| Q-002 | property_type | property_type | 0 to +5 | HEX-004/005/013/016 (condotel/non-warrantable/commercial/5-8 unit → specialty routing); SWR-015 (unpermitted ADU → -8); FP-005/006/007 (specialty fundable, NO negative score) |
| Q-003a | transaction_type | transaction_type | +2 to +3 | SWR-007 (cash-out negative cash flow → -12); SWR-008 (rate-term refi 75% LTV softening market → -5) |
| Q-003b | loan_amount_band | loan_amount | 0 to +3 | HEX-012 (<$100K → score 0); SWR-011 ($2M+ portfolio → -3) |
| Q-004a | property_market | geographic_intent, str_market_permissiveness | +1 to +2 (geo_lookup) | HEX-002/003/014 (STR-restricted market → score 0 or specialty routing); SWR-014 (pending STR legislation → -7) |
| Q-004b | str_permit_status | str_permit, rent_realism (STR) | 0 to +3 | HEX-002/003/014 (STR-restricted → score 0); FP-012 (LTR-pivot available, NO negative score) |
| Q-005 | experience_level | experience_level, repeat_borrowing_likelihood | +2 to +5 | SWR-011 (5+ financed properties → -3); SA-012 BRRRR cyclist tag (no negative score) |
| Q-006a | fico_band | fico_band | 0 to +5 | SWR-003 (620-659 → -8); FP-008 (sub-660 FICO fundable at specialty, NO negative score beyond SWR-003 delta) |
| Q-006b | credit_event_history | credit_event_seasoning, credit_event_type | 0 to +3 | HEX-006/007/008/009 (mortgage late / foreclosure / BK / active delinquency → defer or score 0); FP-001 (post-seasoning fundable, NO negative score); SWR-013 (rather-not-say → -4 education-gap flag) |
| Q-007 | identity_track | identity_track, documentation_path | 0 to +3 | SWR-005/012/016 (FN/ITIN/thin-credit → -7/-6/-5); FP-002/003 (ITIN/FN fundable at specialty, NO negative score beyond SWR deltas) |
| Q-007A | fn_readiness | fn_readiness, llc_formation_status, aml_trail_status | 0 to +2 | HEX-010/011 (no US LLC or no AML → defer with workstream, NOT score 0) |
| Q-008a | ltv_band (down_payment) | ltv_band | 0 to +5 | SWR-009 (LTV ceiling + mid-tier FICO → -10); HEX-012 adjacent (<15% down → score 0) |
| Q-008b | reserves_band | reserves_band, reserves_methodology | 0 to +5 | SWR-001 (401k haircut → -5); FP-011 (401k+co-borrower fundable, NO negative score); NP-011 (no reserves → score 0 — charter "Audience to Actively Repel") |
| Q-009 | doc_readiness (multi-select) | doc_readiness, rent_realism | 0 to +3 per option | HEX-015 (speculative rents → defer); SWR-004 (first-time STR → -6) |
| Q-010 | entity_structure | entity_structure, llc_vesting | +1 to +3 | None (LLC vesting is +10-15% accelerant per AP-03, NOT a SWR delta) |
| Q-011 | dscr_self_estimate | dscr_band, rent_realism | 0 to +5 | SWR-002 (1.00-1.10 thin DSCR → -10); SWR-010 (0.75-0.99 sub-1.0 → -15); SWR-007 (portfolio aggregate negative subject → -12); FP-004 (sub-1.0 fundable with compensators, NO negative score beyond SWR-010 delta); SWR-013 (don't know → -4 education-gap flag) |
| Q-012 | decline_letter_history | decline_letter_triage, specialty_routing_flag | 0 to +2 | HEX-006 (mortgage late decline → defer, NOT score 0); FP-005/006/007/011 (decline-letter-rerouted fundable, NO negative score); "I'd rather not say" → NO negative score (Reg B §1002.5(b)(1) required) |

### TS-10 Scoring Formula (binding contract)

```yaml
ts10_scoring_formula:
  base_score:
    description: "Sum of ts10_base values from Q-001 through Q-012 selected options"
    range: 0 to ~40

  swr_deltas:
    description: "Sum of all triggered SWR rule deltas (each -3 to -15, stacked additively)"
    range: 0 to -80 (theoretical max if every SWR triggered)
    typical_range: 0 to -30
    rules: "Per NP-04 Part 4 — SWR deltas stack additively. Example: SWR-001 (-5) + SWR-002 (-10) + SWR-007 (-12) = -27 points."

  fp_pattern_protection:
    description: "FP-001 through FP-015 patterns do NOT trigger negative score deltas beyond their associated SWR deltas"
    rules: "Per NP-04 Part 5 — FP patterns are explicitly fundable. Sub-1.0 DSCR (FP-004) triggers SWR-010 (-15) but NOT an additional FP-004 delta. Post-seasoning credit-scarred (FP-001) triggers NO score delta — seasoning routing is informational."

  specialty_routing_bonus:
    description: "Specialty-routed leads (HEX-004/005/007/008/010/011/013/014/015/016 + SWR-003/005/010/012/015) score 30-50 MINIMUM"
    rules: "Per NP-04 Part 6 + EG-06 Part 4 — conditional-hard leads score 30-50 with specialty-intake routing. Edge-case-persona-tagged leads (EG-001 through EG-008) score 60-80."
    floor: 30
    ceiling_for_specialty: 50
    ceiling_for_edge_case: 80

  hard_exit_override:
    description: "Permanent-rejection HEX rules override all other scoring — score = 0"
    rules: "HEX-001 (primary residence) + HEX-009 (active delinquency) + HEX-012 outside specialty (sub-$100K loan) + HEX-013 outside specialty (pure commercial) = score 0, route-to-other-product"
    floor: 0
    ceiling: 0

  recoverable_routing:
    description: "Recoverable leads (NP-003/004/005/006/007/009/010/012 patterns + EG-001/EG-004/EG-008 personas) score 50-70 with manual-review flag"
    floor: 50
    ceiling: 70

  final_score_computation:
    formula: "min(100, max(0, normalized_base_score + swr_deltas)) UNLESS specialty_routing_bonus applies (then min(specialty_ceiling, max(specialty_floor, normalized_base_score + swr_deltas))) UNLESS hard_exit_override applies (then 0)"
    normalization_note: "TS-10 normalizes base_score to 0-100 by dividing actual_base_score by max_possible_base_score (~40) and multiplying by 100. SWR deltas then subtract from this normalized score. Specialty-routing floor (30-50) and edge-case floor (60-80) override if normalized_base_score + swr_deltas would fall below the floor. Max-possible-base-score must be re-computed by TS-10 at deploy time by summing the highest ts10_base value from each question."
    example_1: "Strong borrower (no SWR triggers): base_score 38 / 40 max = 95 normalized. No SWR deltas. Final score = 95."
    example_2: "Sub-1.0 DSCR with compensators (EG-004): base_score 28 / 40 = 70 normalized. SWR-010 delta -15. Final pre-floor = 55. Edge-case floor 60 applies — final score = 60, with specialty-routing flag."
    example_3: "Below-660 FICO + 25% down + 12mo reserves + 1.30 DSCR (SA-008): base_score 30 / 40 = 75 normalized. SWR-003 delta -8. Final pre-floor = 67. No edge-case tag — final score = 67."
    example_4: "Hard exit (HEX-001 primary residence): override — final score = 0, route-to-other-product."
    example_5: "401(k)-reserves co-borrower pivot (EG-008): base_score 32 / 40 = 80 normalized. SWR-001 delta -5. Final pre-floor = 75. Edge-case floor 60 does not apply (above floor). Final score = 75, with edge-case tag."
```

### Persona Routing by Final Score (binding on TS-10)

```yaml
persona_routing_by_score:
  score_80_to_100:
    routes_to: "Tier 1 main pipeline — Truss / Rize / AHLend / America / Lendmire / Griffin / Newfi (full lender pool)"
    persona_tags: [SA-001, SA-002, SA-003, SA-004, SA-012]
    lo_handoff: "Standard LO assignment — within 4 business hours"

  score_60_to_79:
    routes_to: "Tier 2 specialty — Bluestone (sub-660 FICO) / AHLend (ITIN, sub-1.0 DSCR, 5-8 unit) / Lendmire (no-reserve, sub-1.0) / Newfi (sub-1.0) / America (FN, ITIN) / Harpoon (unpermitted ADU)"
    persona_tags: [SA-005, SA-006, SA-007, SA-008, SA-009, SA-010, SA-011]
    edge_case_tags: [EG-001, EG-002, EG-003, EG-004, EG-005, EG-006, EG-007, EG-008]
    lo_handoff: "Specialty-trained LO assignment — within 8 business hours (specialty queue)"

  score_40_to_59:
    routes_to: "Tier 3 edge-case intake — senior LO review with specialty-lender routing recommendation"
    persona_tags: [SA-011 (Compensated-Exception Shopper)]
    lo_handoff: "Senior LO review — within 24 business hours (edge-case queue)"

  score_0_to_39:
    routes_to: "Defer-with-roadmap OR route-to-other-product"
    sub_routing:
      - "Defer-with-roadmap: HEX-006 (mortgage late <12mo), HEX-007 (foreclosure <24mo), HEX-008 (BK <24mo), HEX-010/011 (FN pre-intake workstream), HEX-014 (STR permit unconfirmed), HEX-015 (no documentation) — re-engage per seasoning timeline"
      - "Route-to-other-product: HEX-001 (primary residence → conventional/FHA/VA), HEX-009 (active delinquency → 3-6mo post-cure), HEX-012 (sub-$100K → hard money / private notes), HEX-013 (pure commercial → commercial mortgage)"
    lo_handoff: "Automated re-engagement sequence — no immediate LO assignment"

  score_0_hard_exit:
    routes_to: "Permanent exit — HEX-001 / HEX-009 / HEX-012 outside specialty / HEX-013 outside specialty"
    lo_handoff: "None — exit message provides legitimate alternative resource"
```

---

## Cross-Agent Handoff Notes

### For AC-09 (Ad Hook & Copy Reframer)
- **Form language is self-qualification language** — Q-001 through Q-012 use feature-language not threshold-language. AC-09 landing pages MUST mirror this language exactly. Forbidden phrases (per NP-04 Part 6): "easy approval", "1.25+ DSCR required", "660+ FICO required", "SSN required", "US citizens only", "warrantable condos only", "permitted ADU only", "no mortgage lates ever", "clean credit only", "established STR hosts only", "liquid reserves only", "no recent credit events".
- **Recommended phrases** (from EG-06 Part 2 + this form): "Investment properties only" (HEX-001), "DSCR from 0.80 with compensating factors" (EG-004), "Foreign-national specialists — no US credit required" (EG-002/003), "Prior credit event? Specialty seasoning programs available — 24mo / 36mo / 48mo paths" (EG-001), "Condotel or non-warrantable condo? Specialty lender routing" (EG-006/007), "401(k) reserves accepted with standard 60% haircut" (EG-008), "Unpermitted ADU? SFR-classification pivot available" (EG-005).
- **Build 12 persona-specific landing pages** (one per SA-001 through SA-012 persona) + **8 edge-case landing pages** (one per EG-001 through EG-008 persona). Each landing page must include: (i) published lender guideline quote, (ii) representative case study (CF-01 case ID), (iii) specialty lender list, (iv) unlock-conditions checklist, (v) intake form pre-filled with persona tag.
- **Decline-letter landing page** is the highest-leverage standalone page — it's the Q-012 funnel entry. Should rank for queries like "DSCR loan declined", "DSCR lender declined my file", "shopping DSCR decline letter".

### For TS-10 (Targeting & Scoring Generator)
- **Part 7 is the binding contract.** Every form field maps to specific TS-10 scoring dimensions. TS-10 must implement the formula exactly — base_score normalization, SWR delta stacking, FP-pattern protection (no negative deltas), specialty-routing floor (30-50), edge-case floor (60-80), hard-exit override (score 0).
- **CRITICAL — FP-pattern protection.** FP-001 through FP-015 patterns do NOT trigger negative score deltas beyond their associated SWR deltas. Sub-1.0 DSCR (FP-004) triggers SWR-010 (-15) but NOT an additional FP-004 delta. Post-seasoning credit-scarred (FP-001) triggers NO score delta — seasoning routing is informational, not penalizing.
- **CRITICAL — Reg B §1002.5(b)(1) compliance.** "I'd rather not say" options on Q-006a (credit score), Q-012 (decline-letter history) MUST NOT trigger TS-10 downward score adjustment. The only adjustment is SWR-013 (-4) for borrower-education-gap flag, which is triggered by the COMBINATION of "rather not say" + first-time investor + "don't know DSCR" — not the "rather not say" alone.
- **Persona tag passthrough.** TS-10 must accept persona_tag and edge_case_tag fields from FF-08 form submission and use them to override default scoring (specialty-routing floor + edge-case floor).
- **Meta Special Ad Category compliance.** TS-10 must SEGMENT lead form data into 'objective criteria' (lookalike-eligible: Q-001, Q-002, Q-003, Q-004, Q-005, Q-010, Q-011) and 'protected-adjacent criteria' (lookalike-ineligible: Q-006, Q-007, Q-008, Q-009, Q-012). Internal data warehouse tagging required for ad-platform audience creation.

### For GS-07 (Geo-Segment Correlator)
- Q-004 (property market) is the geo-input field. GS-07 can layer geo-segment tags onto the lead based on city/state.
- For STR-intent borrowers (Q-001 = short_term_rental or mix), the market-lookup tool flags STR-permissive status. GS-07 should maintain the STR-permissive market list (FL coast, Smoky Mountains, Scottsdale AZ, Destin FL, Gatlinburg TN, Panama City Beach FL) and STR-restricted market list (NYC, Nashville residential zones, San Francisco, Denver, parts of Austin).
- For foreign-national borrowers (Q-007 = foreign_national_strong_credit or foreign_national_no_credit_bureau), GS-07 should tag FL, TX, CA as FN-friendly states (no state income tax + landlord-friendly + FN-lender concentration per SA-05 Part 3 handoff).

### For GL-02 (Guideline Normalizer)
- The specialty-routing destinations in Part 2 + Part 3 reference 8 GL-02 lenders (Truss, Rize, AHLend, America, Lendmire, Bluestone, Griffin, Newfi) + 12 specialty non-GL-02 lenders (Visio Lending, Kiavi, Angel Oak, A&D Mortgage, HomeAbroad, Brookmont, Harpoon Capital, Feng Capitals, Lit Financial, Ridge Street Capital, Defy, JVM). GL-02 should verify program availability + eligibility for each routing destination before deployment.

### For SA-05 (Sponsor Archetype Synthesizer)
- FF-08 form routes borrowers to SA-05 persona tags based on Q-005 (experience level), Q-006 (credit profile), Q-007 (identity track), Q-010 (entity structure), Q-011 (DSCR self-estimate), Q-012 (decline-letter triage). The persona_tag field on each form submission is the binding passthrough to TS-10.
- BRRRR cyclist (Q-005 = brrrr_cyclist OR Q-001 = brrrr OR Q-003a = brrrr_refi) overrides static-profile persona assignment per SA-05 Part 4 methodological caveat #4. SA-012 tag takes precedence over SA-001 / SA-004.

### For EG-06 (Edge-Case Gold Miner)
- FF-08 form captures EG-001 through EG-008 edge cases via the multi-axis question combinations specified in Part 3. The edge_case_tag field on each form submission is the binding passthrough to TS-10.
- The decline-letter triage question (Q-012) is the single highest-leverage intake change per EG-06 Part 2 — surfaces 5 of 8 edge cases (EG-001, EG-004, EG-005, EG-006, EG-007, EG-008) in one question.

---

## Limitations & Honest Sample-Size Disclosure

1. **Form-design evidence base is guideline-derived, not conversion-tested.** The 12-question structure, 3-step wizard, and friction-point fixes are grounded in NP-04 false-positive patterns + EG-06 edge-case funnel-entry strategy + SA-05 persona watch_outs + Reg B / ECOA compliance principles. NO A/B test data has been collected on this specific form design. Marketing-ops team should run a 90-day pilot with conversion-tracking on each question (drop-off rate by question, time-on-question, completion rate) before full deployment.

2. **Compliance notes are good-faith analyst interpretations of ECOA / Reg B principles, not legal advice.** Q-007 (Identity Track — ITIN/FN) and Q-012 (Decline-Letter Triage) carry MODERATE-to-HIGH fair-lensing risk per EG-06 Part 3. **BEFORE DEPLOYMENT, the marketing-ops team must obtain compliance review from a qualified ECOA / Reg B attorney** — particularly on (a) whether ITIN/FN program-feature language is permissible in the specific ad platform's policy environment, (b) whether Meta lead-form question restrictions require deferring Q-006/Q-007/Q-008/Q-009/Q-012 to the landing page (post-Meta-lead-form), (c) whether any hard-exit messages constitute 'adverse action' under Reg B §1002.9 requiring the Adverse Action notice.

3. **Specialty-lender referral network requires verification.** The 12 specialty non-GL-02 lenders referenced in Part 2 + Part 3 (Visio Lending, Kiavi, Angel Oak, A&D Mortgage, HomeAbroad, Brookmont, Harpoon Capital, Feng Capitals, Lit Financial, Ridge Street Capital, Defy, JVM) are sourced from CF-01 case files and DSCR Authority guides, NOT from GL-02's normalized 8-lender matrix. GL-02 + marketing-ops team should verify program availability + eligibility for each specialty routing destination before deployment.

4. **The 3-step wizard structure (Step 1: Q-001-Q-004, Step 2: Q-005-Q-009, Step 3: Q-010-Q-012) is a recommendation, not a hard requirement.** Alternative structures (single-page, 2-step, 4-step) may be A/B tested. The CRITICAL design constraint is question ORDERING (objective criteria first, financial details second, identity last) per Reg B §1002.4 + the friction-point fixes in Part 5.

5. **The 60% 401(k)/IRA haircut reserves calculator (referenced in Q-008b + EG-008 routing + SWR-001 ff08_action) is a high-leverage intake tool but requires build effort.** Marketing-ops team should prioritize building this calculator before form deployment — it's both a funnel conversion tool (EG-008) and a lead magnet (SEO value, calculator-driven organic acquisition per EG-06 Part 2).

6. **The market-lookup tool (referenced in Q-004 + HEX-002/003/014 + SWR-014) requires ongoing maintenance.** STR regulations shift — Nashville, Phoenix, Austin all have pending 2025-2026 legislation per SWR-014. The market-lookup tool must be updated quarterly with current municipal STR ordinance data.

7. **The decline-letter triage question (Q-012) is OPTIONAL per Reg B §1002.5(b)(1).** The 'I'd rather not say' option MUST be available and MUST NOT trigger TS-10 downward score adjustment. This is a hard compliance constraint — not optional design.

---

*End of FF-08 deliverable. Downstream agents (AC-09, TS-10, GS-07, GL-02, SA-05, EG-06) should treat Part 1 as the canonical form design, Part 2 as the canonical hard-exit logic, Part 3 as the canonical edge-case triage routing, Part 4 as the canonical soft-warning flag logic, Part 5 as the canonical friction-point audit, Part 6 as the canonical compliance audit, and Part 7 as the binding form-field-to-score contract with TS-10.*
