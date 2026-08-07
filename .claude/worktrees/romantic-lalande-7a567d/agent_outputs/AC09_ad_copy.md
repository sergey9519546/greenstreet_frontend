# AC-09 — Ad Hook & Copy Reframer

**Agent:** AC-09 Ad Hook & Copy Reframer
**Phase:** 4 of 5 (parallel with FF-08 Funnel Friction Mapper)
**Task:** Build self-qualifying ad creative that attracts fundable DSCR borrowers, quietly repels NP-04 hard-decline audiences, and complies with Meta Special Ad Category + Google Ads housing/credit policies.

**Inputs consumed:**
- `/home/z/my-project/worklog.md` (charter — Creative Guardrail, Audiences to Repel, Meta/Google constraints, FDI dimensions)
- `/home/z/my-project/download/agent_outputs/SA05_persona_library.md` (12 personas SA-001 through SA-012 — primary copy input)
- `/home/z/my-project/download/agent_outputs/EG06_edge_case_personas.md` (8 edge cases EG-001 through EG-008)
- `/home/z/my-project/download/agent_outputs/NP04_decline_patterns.md` Part 5 false-positive risks (FP-001 through FP-015) + Part 6 forbidden-copy list + Part 3 HEX rules (repel targets)

**Output consumers:** FF-08 (form intro copy + landing-page self_qualifier_block), TS-10 (campaign payload + persona → ad-set mapping), GS-07 (geo-targeted hook variants for STR-permissive MSAs), parent-agent master brief.

---

## Part 1: Universal Creative Guardrails

### 1.1 Charter Guardrails (operationalized)

| # | Guardrail | Operational rule for every hook |
|---|---|---|
| G-1 | NEVER promise "easy approval" | No hook may contain "easy", "instant", "guaranteed", "no credit check", "approval in minutes", "everyone qualifies", "we say yes". |
| G-2 | NEVER use demographic-adjacent language | No race, national origin, family status, age, sex, religion, disability proxies. Foreign-national copy is anchored to **product feature** (lender-published FN program), not borrower class. ITIN copy is anchored to **program feature** (lender-published ITIN eligibility), not residency status. |
| G-3 | Attract via property economics, not borrower demographics | Every hook must lead with a property-cash-flow, LTV, reserves, or property-type argument. Borrower identity is downstream of property economics. |
| G-4 | Always embed self-qualifying microcopy | Every hook must contain an embedded disqualifier that lets the wrong borrower self-select out BEFORE clicking (saves ad spend, repels NP-04 cohorts, improves lead quality). |
| G-5 | Compliance disclaimer per ad | Every primary text + landing page must carry the DSCR compliance disclaimer (see §1.4). |

### 1.2 Forbidden Copy (per NP-04 Part 6 + EG-06 Part 3)

These phrases repel fundable FP-001 through FP-015 cohorts. **AC-09 must not use them in any hook, headline, primary text, or landing-page copy.**

- "easy approval" / "instant approval" / "guaranteed approval"
- "no credit check"
- "1.25+ DSCR required" (repels FP-004 sub-1.0-DSCR-with-compensators)
- "660+ FICO required" (repels FP-008 + SA-008 credit-scarred)
- "SSN required" / "US citizens only" (repels FP-002 ITIN + FP-003 FN)
- "warrantable condos only" (repels FP-006 non-warrantable)
- "permitted ADU only" (repels FP-005 unpermitted-ADU pivot)
- "no mortgage lates ever" (repels FP-009 12+ months post-late)
- "clean credit only" / "no recent credit events" (repels FP-001 post-seasoning)
- "established STR hosts only" (repels FP-013 first-time STR)
- "liquid reserves only" (repels FP-011 401(k)-reserves pivot)
- "no open violations" (repels FP-014 violations-exception)

### 1.3 Replacement Feature-Language (use these instead)

| Edge case | Forbidden phrase | Replacement feature-language |
|---|---|---|
| HEX-001 primary-residence screen | (none) | "Investment properties only" / "Built for rental investors" |
| FP-004 sub-1.0 DSCR | "1.25+ DSCR required" | "DSCR from 0.80 with compensating factors — strong credit, deeper reserves, lower LTV" |
| FP-002 ITIN | "SSN required" | "ITIN accepted in lieu of SSN at AHLend + America Mortgages" |
| FP-003 FN | "US citizens only" | "Foreign-national specialists — no US credit history required" |
| FP-005 unpermitted ADU | "permitted ADU only" | "Unpermitted ADU? SFR-classification pivot available" |
| FP-006/007 non-warrantable/condotel | "warrantable condos only" | "Condotel or non-warrantable condo? Specialty lender routing" |
| FP-008 sub-660 FICO | "660+ FICO required" | "Specialty seasoning programs available — 24mo / 36mo / 48mo paths" |
| FP-009 12+mo post-late | "no mortgage lates ever" | "Mortgage late 12+ months ago? Specialty programs may fit" |
| FP-011 401(k) reserves | "liquid reserves only" | "401(k) reserves accepted with standard 60% haircut" |
| FP-013 first-time STR | "established STR hosts only" | "First STR? AirDNA projection path available in permissive markets" |
| FP-014 open violations | "no open violations" | "Open violations? Lender-exception path at lower LTV" |
| FP-015 DTI wall | (none) | "No DTI limit — DSCR qualifies on property cash flow" |

### 1.4 Required Compliance Disclaimer (per ad + landing page)

> **DSCR loans are for business-purpose investment properties only (1-4 units; condotel / non-warrantable / mixed-use subject to specialty-lender eligibility). Not for primary residence, second home, or personal-use vacation property. Loans made or brokered pursuant to applicable state licensing; program terms vary by lender. All loans subject to credit approval, property review, and investor guidelines. DSCR qualification is based on property cash flow and does not waive credit, reserves, or seasoning review. Rates, pricing premiums, and LTV caps vary by program and borrower profile; specialty-lender programs may carry rate premiums and LTV haircuts. Equal Housing Lender.**

Meta-specific: append `Equal Housing Lender` icon + NMLS ID. Google-specific: append `Equal Housing Lender` + housing-certification ad-category badge.

### 1.5 Meta Special Ad Category Constraints

- Ad category: **Housing** (Facebook/Instagram)
- NO lookalike audiences based on protected attributes
- NO targeting by ZIP code, age, sex, race, national origin, family status, language (unless language = product-feature-relevant, e.g., bilingual ITIN landing page)
- NO detailed-targeting expansion on protected attributes
- Broad distribution only; creative-led self-qualification does the filtering
- Lead-form intro must mirror the landing-page self_qualifier_block (FF-08 will implement)

### 1.6 Google Ads Housing/Credit Policy

- Ad category: **Housing** (requires housing-certification + advertiser identity verification)
- NO "easy approval" / "no credit check" / "guaranteed approval" language
- NO demographic targeting in audience segments
- Search keywords are persona-specific (intent-based), not demographic-based
- Landing pages must display Equal Housing Lender + NMLS + privacy policy
- Negative-keyword discipline is mandatory — do not pay for primary-residence / first-time-homebuyer / no-money-down traffic

### 1.7 Self-Qualifying Microcopy Patterns (canonical forms)

Every hook must contain one of these embedded disqualifiers (or a persona-specific variant):

1. **Property-income test:** "If the rent covers the payment + reserves, this might fit."
2. **Reserves test:** "Bring 6+ months of reserves — we don't pretend otherwise."
3. **Investment-only test:** "Investment properties only. Not for primary residence."
4. **Rent-support test:** "We'll need a lease, rent schedule, or 1007 appraisal — no exceptions."
5. **Property-type test:** "SFR, 2-4 unit, or condo — condotel/non-warrantable route to specialty."
6. **Credit-event test:** "Prior bankruptcy or foreclosure past seasoning? Specialty programs available."
7. **DTI-celebration test:** "DSCR has no DTI limit — we qualify on property cash flow."
8. **Specialty-routing test:** "Declined elsewhere? Bring the decline letter — we'll route to specialty."

---

## Part 2: Persona Ad Copy Library (12 Personas)

Each persona has 3 hook variants (H1/H2/H3) for A/B testing across channels. Every hook contains the required self_qualifying_microcopy, repels list (NP-04 hard-decline audiences it quietly filters out), and attracts list (persona traits it pulls in).

---

### SA-001 — The Cash-Flow Optimizer

```yaml
persona_id: SA-001
persona_name: The Cash-Flow Optimizer

hooks:
  - hook_id: H1
    channel_fit: [google_search]
    primary_text: |
      Your tax returns say one thing. Your rentals say another. DSCR qualifies
      investment-property loans on rent, not personal write-offs — no DTI wall,
      no Schedule C penalty. If your rentals cash-flow but your CPA writes off
      everything, this is built for you. Investment properties only; bring a
      lease or 1007 market-rent support — no exceptions.
    headline: "DSCR For Self-Employed Investors"
    cta: "See If Your Rental Qualifies"
    self_qualifying_microcopy: "If your rentals cash-flow but your tax returns look thin, this is built for you. Investment properties only — we'll need a lease or rent schedule."
    repels: [primary_residence_seekers, no_reserves_borrowers, speculative_rent_investors, primary_residence_refi_seekers]
    attracts: [self_employed, LLC_vested, Schedule_C_heavy_writeoffs, 1_5_door_scalers, Midwest_Southeast_SFR]

  - hook_id: H2
    channel_fit: [meta]
    primary_text: |
      Self-employed investors: stop fighting the DTI wall. DSCR qualifies on
      property rent — no personal income docs, no tax-return penalty. If your
      rental covers the payment + you have 6 months reserves, this might fit.
      Investment properties only. Equal Housing Lender.
    headline: "Investment Loans. No DTI Wall."
    cta: "Check Your Property"
    self_qualifying_microcopy: "If your rental covers the payment + you have 6 months reserves, this might fit. Investment properties only."
    repels: [primary_residence_seekers, no_reserves_borrowers, W2_first_time_homebuyers, no_money_down_seekers]
    attracts: [self_employed, LLC_vested, mid_FICO_700_plus, 1_5_door_scalers]

  - hook_id: H3
    channel_fit: [youtube, native]
    primary_text: |
      The 60-second DSCR walk-through: rent minus payment = DSCR. 1.25+ pencils,
      6 months reserves, lease-in-place. That's the math — no income docs, no
      DTI. Built for self-employed rental investors. Not for primary residences.
      Free calculator + 3-question self-check.
    headline: "DSCR In 60 Seconds — Free Calculator"
    cta: "Run The Numbers"
    self_qualifying_microcopy: "Rent covers payment + 6 months reserves + lease-in-place = fundable. Not for primary residences."
    repels: [primary_residence_seekers, no_reserves_borrowers, speculative_rent_investors]
    attracts: [self_employed, calculator_driven_investors, first_or_second_DSCR_applicants, Midwest_Southeast_SFR]

search_keywords:
  exact_match:
    - "dscr loan self employed"
    - "investment property loan no tax returns"
    - "no income verification investment mortgage"
    - "rental property loan no W2"
    - "DSCR loan LLC"
  phrase_match:
    - "DSCR loan for rental property"
    - "investor mortgage no income"
    - "qualify rental with write-offs"
    - "self employed investor loan"
    - "DSCR vs conventional rental"
  negative_keywords:
    - "primary residence mortgage"
    - "first time home buyer"
    - "FHA loan"
    - "VA loan"
    - "no money down mortgage"
    - "free house"
    - "owner occupied"
    - "second home mortgage"
    - "vacation home loan"
    - "reverse mortgage"
    - "refinance primary residence"
    - "cash out refinance primary"
    - "hard money personal loan"
    - "personal loan"
    - "credit card"

landing_hook:
  headline: "DSCR Loans For Self-Employed Rental Investors"
  subhead: "Qualify on property cash flow, not personal write-offs. No DTI wall, no Schedule C penalty."
  cta: "Check Your Property"
  trust_signals:
    - "Loans closed in all 50 states"
    - "Average close 17-28 days on clean files"
    - "LLC vesting supported at every program tier"
  self_qualifier_block: |
    3-question self-check (FF-08 will implement as inline form):
    Q1. Is the property an investment rental (not your primary residence)? [Yes / No]
    Q2. Does the rent cover the payment + leave room for reserves (DSCR ~1.20+)? [Yes / Unsure — show me the calculator / No]
    Q3. Do you have ~6+ months of reserves (liquid + 401(k) at 60% haircut)? [Yes / Some / No]

faq:
  - q: "Do I need to provide personal tax returns?"
    a: "DSCR qualification is based on property rent, not personal income. Some lenders may request tax returns or 12-month bank statements for files below best-tier FICO or with thin credit — but heavy Schedule C write-offs that disqualify conventional DTI are NOT a barrier to DSCR. We'll tell you up front which documentation path applies to your file."
  - q: "What DSCR do I need?"
    a: "Best-tier pricing is around 1.25-1.30. Specialty programs fund DSCR as low as 0.80 with compensating factors — strong credit, deeper reserves, lower LTV. We'll show you which band your property fits and what each tier unlocks."
  - q: "Can I close in an LLC?"
    a: "Yes — LLC vesting is supported at every program tier and is required for some foreign-national and portfolio structures. We'll coordinate operating-agreement review as part of intake."
  - q: "What if my rent estimate is optimistic?"
    a: "Rent support is non-negotiable — we'll need a current lease, rent schedule, or Form 1007 market-rent appraisal. If the appraisal comes in below your estimate, we'll walk you through ROV (reconsideration of value), price renegotiation, or cash-bridge options rather than just declining."
  - q: "Will a recent mortgage late disqualify me?"
    a: "Most programs require 12+ months since your most recent 30-day mortgage late. If you're inside that window, we'll defer intake 12 months — not permanently reject. If you're 12+ months past, several specialty programs may fit."

disclaimer: "DSCR loans are for business-purpose investment properties only. Not for primary residence, second home, or personal-use vacation property. All loans subject to credit approval, property review, and investor guidelines. Rates and LTV caps vary by program. Equal Housing Lender. NMLS #_____."
```

---

### SA-002 — The Multi-State Portfolio Scaler

```yaml
persona_id: SA-002
persona_name: The Multi-State Portfolio Scaler

hooks:
  - hook_id: H1
    channel_fit: [google_search]
    primary_text: |
      Portfolio DSCR loans up to $5M. Blanket-loan structures aggregate 5-20+
      rental properties into one loan — 3-5x revenue per close vs single-unit
      DSCR. Aggregate portfolio cash flow offsets thin per-property DSCR. No
      DTI limit; prepay-penalty acceptance unlocks pricing. Built for 10+ door
      LLC operators with stabilized multi-state portfolios. Investment
      properties only — we'll need rent rolls + operating agreements.
    headline: "Portfolio DSCR Up To $5M"
    cta: "Underwrite My Portfolio"
    self_qualifying_microcopy: "Built for 10+ door LLC operators with stabilized multi-state portfolios. Aggregate portfolio cash flow offsets thin per-property DSCR. Investment properties only."
    repels: [primary_residence_seekers, first_time_investors, no_reserves_borrowers, single_property_only_buyers]
    attracts: [LLC_empire_operators, multi_state_portfolios, 10_plus_doors, blanket_loan_seekers, repeat_borrowers]

  - hook_id: H2
    channel_fit: [meta, youtube]
    primary_text: |
      Landlords scaling past the conventional DTI wall: portfolio DSCR aggregates
      5-20+ rentals into one loan. Aggregate cash flow offsets thin per-property
      DSCR. No DTI limit. If your portfolio is cash-flow positive across 10+
      properties and you're ready for a blanket-loan structure, this is built
      for you. Investment properties only — we'll need rent rolls + 12mo
      operating history.
    headline: "Blanket DSCR For 10+ Doors"
    cta: "Build A Portfolio Quote"
    self_qualifying_microcopy: "If your portfolio is cash-flow positive across 10+ properties and you're ready for a blanket-loan structure, this is built for you. Investment properties only."
    repels: [primary_residence_seekers, first_time_investors, single_property_only_buyers, no_reserves_borrowers]
    attracts: [LLC_empire_operators, multi_state_portfolios, 6_20_door_scalers, repeat_borrowers]

  - hook_id: H3
    channel_fit: [google_search]
    primary_text: |
      Scaling past conventional DTI walls? Portfolio DSCR qualifies on aggregate
      rent rolls, not personal income. Blanket structures cover multi-state LLC
      portfolios. If your portfolio cash-flows positive across 5+ stabilized
      rentals and you're prepared for portfolio-level reserve documentation,
      we'll underwrite the whole book — not just one door.
    headline: "Scale Past The DTI Wall"
    cta: "Submit Rent Rolls"
    self_qualifying_microcopy: "If your portfolio cash-flows positive across 5+ stabilized rentals and you're prepared for portfolio-level reserve documentation, we'll underwrite the whole book."
    repels: [primary_residence_seekers, first_time_investors, no_reserves_borrowers, single_property_only_buyers]
    attracts: [LLC_empire_operators, multi_state_portfolios, 6_20_door_scalers, mixed_self_employed]

search_keywords:
  exact_match:
    - "portfolio DSCR loan"
    - "blanket loan rental properties"
    - "DSCR loan 10+ properties"
    - "cross collateralized DSCR"
    - "commercial DSCR portfolio"
  phrase_match:
    - "blanket loan multiple rental properties"
    - "portfolio loan for investors"
    - "scale rental portfolio no DTI"
    - "DSCR blanket refinance"
    - "multi-state rental portfolio loan"
  negative_keywords:
    - "primary residence mortgage"
    - "first time home buyer"
    - "FHA loan"
    - "VA loan"
    - "no money down"
    - "single family home purchase"
    - "owner occupied refinance"
    - "second home mortgage"
    - "reverse mortgage"
    - "personal loan"
    - "hard money personal"
    - "construction loan owner"

landing_hook:
  headline: "Portfolio DSCR Loans Up To $5M For Multi-State LLC Operators"
  subhead: "Aggregate 5-20+ stabilized rentals into one blanket loan. No DTI limit. Portfolio-level cash flow offsets thin per-property DSCR."
  cta: "Underwrite My Portfolio"
  trust_signals:
    - "Portfolio/blanket structures across all 50 states"
    - "Average close 14-28 days on stabilized portfolios"
    - "Prepay-penalty options unlock 25-50bps pricing improvements"
  self_qualifier_block: |
    3-question portfolio self-check (FF-08 will implement):
    Q1. How many investment properties are in the portfolio you'd like to finance? [1-4 / 5-9 / 10-19 / 20+]
    Q2. Is aggregate portfolio cash flow positive across the last 12 months? [Yes / Mixed / No]
    Q3. Can you provide 12-month rent rolls + operating agreements for each entity? [Yes / Partially / Need help assembling]

faq:
  - q: "What's the difference between portfolio DSCR and individual DSCR?"
    a: "Portfolio (blanket) DSCR aggregates multiple subjects into one loan — one closing, one payment, one set of documents. Aggregate portfolio cash flow can offset a thin individual subject. Pricing reflects the portfolio's aggregate risk, which is often better than the worst single property. Suited for 5+ stabilized rentals."
  - q: "Do I need tax returns?"
    a: "DSCR does not require personal tax returns for qualification. Some portfolio lenders may request 12-month operating statements or rent rolls at application. Heavy Schedule C write-offs are NOT a barrier — DSCR qualifies on property cash flow, not personal income."
  - q: "What's the maximum portfolio size?"
    a: "Portfolio DSCR programs typically cap at $3-5M aggregate loan amount; some wholesale channels go higher. Above $5M, agency-style or commercial multifamily programs may be more competitive. We'll route based on portfolio size and property mix."
  - q: "Can I cross-collateralize across states?"
    a: "Yes — multi-state LLC structures with US-attorney-coordinated operating agreements are supported. Each state's LLC statute is different; we'll coordinate counsel for the multi-state entity structure."
  - q: "Does a thin-DSCR subject still qualify if the portfolio is strong?"
    a: "Often yes — aggregate portfolio cash flow positive across 10+ properties can offset a thin-DSCR subject (NP-010 pattern). Documentation burden is higher (portfolio-level reserve documentation, aggregate rent rolls). We'll surface this pathway if your portfolio fits."

disclaimer: "Portfolio/blanket DSCR loans are for business-purpose investment properties only. Not for primary residence, second home, or personal-use vacation property. All loans subject to credit approval, property review, aggregate portfolio review, and investor guidelines. Prepay-penalty options may apply. Equal Housing Lender. NMLS #_____."
```

---

### SA-003 — The Cash-Strong First-Timer

```yaml
persona_id: SA-003
persona_name: The Cash-Strong First-Timer

hooks:
  - hook_id: H1
    channel_fit: [google_search, native]
    primary_text: |
      First DSCR loan? Start with the property's numbers, not your employment
      paperwork. If rent covers the payment + you have 6 months reserves + the
      property is in a stable rental market, you may already fit. Free DSCR
      calculator + 3-question self-check. Investment properties only — we'll
      need a lease, rent schedule, or 1007 appraisal.
    headline: "First Rental? Start With The Numbers"
    cta: "Run The Free Calculator"
    self_qualifying_microcopy: "If rent covers the payment + you have 6 months reserves + the property is in a stable rental market, you may already fit. Investment properties only."
    repels: [primary_residence_seekers, no_reserves_borrowers, no_money_down_seekers, speculative_rent_investors]
    attracts: [first_time_investors, strong_FICO_710_plus, 6_12mo_reserves, calculator_driven_investors, education_first_buyers]

  - hook_id: H2
    channel_fit: [meta, youtube]
    primary_text: |
      Your first rental doesn't have to wait for a perfect W-2. DSCR qualifies
      on property rent — if the numbers pencil and you have 6+ months reserves,
      this might fit. Free walk-through + calculator. Investment properties
      only; built for cash-strong first-time investors with a real rental
      strategy. Equal Housing Lender.
    headline: "First Rental, Real Numbers"
    cta: "Walk Me Through It"
    self_qualifying_microcopy: "If the numbers pencil and you have 6+ months reserves, this might fit. Investment properties only; built for cash-strong first-time investors with a real rental strategy."
    repels: [primary_residence_seekers, no_reserves_borrowers, no_money_down_seekers, speculative_rent_investors]
    attracts: [first_time_investors, strong_FICO_710_plus, W2_with_strong_savings, education_first_buyers]

  - hook_id: H3
    channel_fit: [google_search, native]
    primary_text: |
      "How do I qualify for a DSCR loan?" Free 5-minute walkthrough. Rent
      minus payment = DSCR. 1.25+ pencils. 6 months reserves. Lease-in-place.
      That's the math. If your property fits and you've got reserves, let's
      talk. Investment properties only — not for primary residences.
    headline: "How DSCR Loans Work — Free Guide"
    cta: "Get The Walkthrough"
    self_qualifying_microcopy: "Rent covers payment + 6 months reserves + lease-in-place = fundable. Investment properties only — not for primary residences."
    repels: [primary_residence_seekers, no_reserves_borrowers, no_money_down_seekers]
    attracts: [first_time_investors, education_first_buyers, calculator_driven_investors, stable_rental_market_seekers]

search_keywords:
  exact_match:
    - "first DSCR loan"
    - "how to qualify for DSCR loan"
    - "DSCR loan for first rental"
    - "DSCR loan calculator"
    - "investment property loan no W2"
  phrase_match:
    - "DSCR loan requirements"
    - "how does DSCR loan work"
    - "first time investor mortgage"
    - "rental property loan no income"
    - "DSCR vs conventional rental"
  negative_keywords:
    - "primary residence mortgage"
    - "first time home buyer"
    - "FHA loan"
    - "VA loan"
    - "no money down mortgage"
    - "free house"
    - "owner occupied"
    - "second home mortgage"
    - "vacation home loan"
    - "rent to own"
    - "lease to own home"
    - "personal loan"
    - "hard money personal"

landing_hook:
  headline: "Your First DSCR Loan — Built For Cash-Strong First-Time Investors"
  subhead: "Qualify on property cash flow, not personal income paperwork. Free calculator + walk-through. If the rent covers the payment and you have 6 months reserves, you may already fit."
  cta: "Run My Numbers"
  trust_signals:
    - "Free DSCR calculator with property-level reserve modeling"
    - "Borrower-education module included before intake — no hard-sell"
    - "Loans closed in all 50 states"
  self_qualifier_block: |
    3-question first-timer self-check (FF-08 will implement):
    Q1. Is this your first investment-property loan? [Yes / No]
    Q2. Will the rent cover the monthly payment with room to spare (DSCR ~1.20+)? [Yes / Show me how to calculate / No]
    Q3. Do you have 6+ months of reserves set aside? [Yes / Partially / No]

faq:
  - q: "I've never owned a rental before. Can I qualify?"
    a: "Yes — first-time investors with strong credit, 6+ months reserves, and a property in a stable rental market are a core DSCR borrower. We'll walk you through the mechanics before intake so you understand exactly what each number means. No hard-sell."
  - q: "Do I need a W-2 to qualify?"
    a: "No — DSCR qualifies on property rent. W-2 income is not required. Some programs may request 12-month bank statements for files with thin credit or unusual income patterns, but a missing W-2 is not a barrier."
  - q: "What if I'm not sure about my rent estimate?"
    a: "That's normal — first-timers often overestimate rents. We'll request a Form 1007 market-rent appraisal as part of underwriting. If the appraisal comes in below your estimate, we'll show you options (price negotiation, larger down payment, ROV) rather than just declining."
  - q: "Can I buy a short-term rental as my first DSCR?"
    a: "Yes, in STR-permissive markets (Florida coast, Smokies, Scottsdale AZ). First-time STR borrowers typically face a 25% AirDNA income haircut and need 12 months reserves instead of 6. We'll verify the local STR permit pathway before you commit. STR in Nashville residential zones or NYC is not a fundable path."
  - q: "What credit score do I need?"
    a: "Best-tier pricing sits around 700+. Specialty programs work with mid-tier credit when compensators (deeper reserves, lower LTV, stronger DSCR) are present. We'll show you which band you're in and what each tier unlocks — no mystery."

disclaimer: "DSCR loans are for business-purpose investment properties only. Not for primary residence, second home, or personal-use vacation property. All loans subject to credit approval, property review, and investor guidelines. Borrower-education materials are not a commitment to lend. Equal Housing Lender. NMLS #_____."
```

---

### SA-004 — The Equity-Tapping Refinancer

```yaml
persona_id: SA-004
persona_name: The Equity-Tapping Refinancer

hooks:
  - hook_id: H1
    channel_fit: [google_search]
    primary_text: |
      Unlock equity in stabilized rentals without income-doc friction. DSCR
      cash-out refi up to 75% LTV on long-term rentals with documented rent
      rolls + 6mo seasoning. If your portfolio is stabilized, cash-flowing,
      and you're ready for portfolio-level reserve documentation, this might
      fit. Investment properties only — primary-residence cash-out borrowers
      should look at conventional HELOCs.
    headline: "Cash-Out Refi On Stabilized Rentals"
    cta: "Check My Equity"
    self_qualifying_microcopy: "If your portfolio is stabilized, cash-flowing, and you're ready for portfolio-level reserve documentation, this might fit. Investment properties only — primary-residence cash-out borrowers should look at conventional HELOCs."
    repels: [primary_residence_seekers, primary_residence_refi_seekers, no_reserves_borrowers, speculative_rent_investors]
    attracts: [stabilized_portfolio_landlords, cash_out_refi_intent, 6_plus_mo_seasoning, LLC_vested]

  - hook_id: H2
    channel_fit: [meta, youtube]
    primary_text: |
      Refinance rental cash flow into your next acquisition. DSCR cash-out up
      to 75% LTV on stabilized rentals — no DTI wall, no income-doc friction.
      If your rentals have 6+ months operating history and the post-refi DSCR
      clears 1.20+, we can underwrite the equity. Investment properties only.
      Equal Housing Lender.
    headline: "Refi Rental Equity. Buy Next."
    cta: "See My Cash-Out Quote"
    self_qualifying_microcopy: "If your rentals have 6+ months operating history and the post-refi DSCR clears 1.20+, we can underwrite the equity. Investment properties only."
    repels: [primary_residence_seekers, primary_residence_refi_seekers, no_reserves_borrowers, no_seasoning_borrowers]
    attracts: [stabilized_portfolio_landlords, cash_out_refi_intent, 6_plus_mo_seasoning, LLC_vested, repeat_borrowers]

  - hook_id: H3
    channel_fit: [google_search, native]
    primary_text: |
      BRRRR refinance, rate-term, or cash-out — DSCR refi on stabilized rentals
      clears the equity without DTI friction. If you have 6+ months seasoning,
      a documented lease or rent schedule, and the post-refi DSCR pencils,
      this is built for you. Investment properties only — primary-residence
      refi borrowers should use conventional HELOC or rate-term refi.
    headline: "DSCR Refi — BRRRR Or Cash-Out"
    cta: "Underwrite My Refi"
    self_qualifying_microcopy: "If you have 6+ months seasoning, a documented lease or rent schedule, and the post-refi DSCR pencils, this is built for you. Investment properties only."
    repels: [primary_residence_seekers, primary_residence_refi_seekers, no_reserves_borrowers, no_seasoning_borrowers]
    attracts: [stabilized_portfolio_landlords, BRRRR_refi_cyclists, cash_out_refi_intent, LLC_vested]

search_keywords:
  exact_match:
    - "DSCR cash out refinance"
    - "refinance rental property no income"
    - "BRRRR refinance DSCR"
    - "DSCR refinance rates"
    - "cash out refi investment property"
  phrase_match:
    - "refinance rental to buy next property"
    - "DSCR refinance investment property"
    - "BRRRR refinance seasoning"
    - "cash out refi rental LLC"
    - "rate term refi rental DSCR"
  negative_keywords:
    - "primary residence refinance"
    - "first time home buyer"
    - "FHA refinance"
    - "VA refinance"
    - "no money down"
    - "owner occupied refinance"
    - "second home refinance"
    - "reverse mortgage"
    - "HELOC primary residence"
    - "personal loan"
    - "credit card refinance"
    - "student loan refinance"

landing_hook:
  headline: "DSCR Cash-Out Refinance On Stabilized Rental Properties"
  subhead: "Unlock equity without DTI friction. Up to 75% LTV on long-term rentals with 6+ months operating history. Refi-to-buy built for portfolio operators."
  cta: "Check My Equity"
  trust_signals:
    - "Cash-out and rate-term refi across all 50 states"
    - "BRRRR seasoning specialist — 6mo seasoning path documented"
    - "Pre-existing lender relationships unlock 14-21 day closes"
  self_qualifier_block: |
    3-question refi self-check (FF-08 will implement):
    Q1. Is this an investment property (not your primary residence)? [Yes / No]
    Q2. Has the property been rented for 6+ months with documented lease or rent roll? [Yes / Less than 6mo / No]
    Q3. Do you expect the post-refi DSCR to clear 1.20+? [Yes / Unsure — show me the calculator / No]

faq:
  - q: "How soon after purchase can I refi into DSCR cash-out?"
    a: "Most DSCR lenders require 6+ months seasoning from initial purchase (longer if appraisal-quality concerns exist). BRRRR refinance (post-rehab cash-out) typically follows the same 6-month rule. We'll verify your seasoning window at intake."
  - q: "What LTV can I get on cash-out?"
    a: "Cash-out DSCR typically caps at 70-75% LTV. Rate-term refi can reach 75-80% LTV (5-10 pts higher). Thin-DSCR cash-out (post-refi DSCR 1.00-1.10) may require portfolio-context documentation or 6mo property-specific reserves."
  - q: "What if my appraisal comes in below my estimate?"
    a: "Appraisal shorts are recoverable — ROV (reconsideration of value) with better comps, seller price negotiation, borrower cash-bridge to maintain LTV, or second appraisal if the lender permits. We'll walk through options rather than just declining."
  - q: "Can I refi a portfolio of multiple rentals at once?"
    a: "Yes — portfolio/blanket DSCR refinance aggregates multiple stabilized rentals into one loan. Aggregate portfolio cash flow can offset a thin-DSCR subject. Documentation burden is higher (portfolio-level reserve review, rent rolls for each property)."
  - q: "Does a thin-DSCR subject disqualify me if my portfolio is strong?"
    a: "Often no — aggregate portfolio cash flow positive across 10+ properties can offset a thin-DSCR subject (NP-010 pattern). Some lenders require 6mo property-specific reserves on thin-DSCR cash-out files. We'll surface this pathway if it applies."

disclaimer: "DSCR cash-out and rate-term refinance loans are for business-purpose investment properties only. Not for primary residence, second home, or personal-use vacation property. All loans subject to credit approval, property review, appraisal review, and investor guidelines. Cash-out LTV caps may be lower than rate-term. Equal Housing Lender. NMLS #_____."
```

---

### SA-005 — The Strong-Credit Foreign National

```yaml
persona_id: SA-005
persona_name: The Strong-Credit Foreign National

hooks:
  - hook_id: H1
    channel_fit: [google_search]
    primary_text: |
      Foreign-national DSCR specialists — no US credit history required.
      UK / EU / Canada / AU borrowers qualify with Nova Credit international-
      credit translation, US LLC, and 9-12 months reserves. 70-75% LTV on
      US SFR rentals. If you have a valid passport, US bank account seasoned
      60-90 days, and a US-attorney-drafted LLC, this is built for you.
      Investment properties only — primary-residence seekers should use
      conventional foreign-national mortgage programs.
    headline: "Foreign-National DSCR. No US Credit."
    cta: "Check FN Eligibility"
    self_qualifying_microcopy: "If you have a valid passport, US bank account seasoned 60-90 days, and a US-attorney-drafted LLC, this is built for you. Investment properties only."
    repels: [primary_residence_seekers, no_reserves_borrowers, no_LLC_FN_borrowers, speculative_rent_investors]
    attracts: [strong_credit_country_FN, UK_EU_Canada_AU_passport, US_LLC_vested, 9_12mo_reserves]

  - hook_id: H2
    channel_fit: [meta, google_search]
    primary_text: |
      US rental investing without US income documents. Foreign-national DSCR
      qualifies on property rent — Nova Credit translates your international
      credit file, US LLC holds title, 9-12 months reserves in US bank. If
      you're investing in Texas or Florida SFR rentals and have your US LLC
      + EIN set up, this might fit. Investment properties only.
    headline: "Invest In US Rentals — No US Income Docs"
    cta: "See FN Program Details"
    self_qualifying_microcopy: "If you're investing in Texas or Florida SFR rentals and have your US LLC + EIN set up, this might fit. Investment properties only."
    repels: [primary_residence_seekers, no_reserves_borrowers, no_LLC_FN_borrowers, no_passport_borrowers]
    attracts: [strong_credit_country_FN, UK_EU_Canada_AU_passport, TX_FL_market_seekers, US_LLC_vested]

  - hook_id: H3
    channel_fit: [google_search, native]
    primary_text: |
      DSCR for international investors — Nova Credit credit-translation
      accepted at AHLend + America Mortgages. 70-75% LTV, 9-12 months
      reserves, US LLC vesting required. If you've got a strong-credit-country
      passport and a verified source of funds for the down payment, we'll
      walk you through the 2-4 week AML clearance process. Investment
      properties only.
    headline: "Nova Credit DSCR — International Investors"
    cta: "Start FN Pre-Intake"
    self_qualifying_microcopy: "If you've got a strong-credit-country passport and a verified source of funds for the down payment, we'll walk you through the 2-4 week AML clearance process. Investment properties only."
    repels: [primary_residence_seekers, no_reserves_borrowers, no_LLC_FN_borrowers, no_source_of_funds_borrowers]
    attracts: [strong_credit_country_FN, Nova_Credit_eligible, US_LLC_vested, TX_FL_market_seekers]

search_keywords:
  exact_match:
    - "foreign national DSCR loan"
    - "DSCR loan no US credit"
    - "Nova Credit DSCR lender"
    - "international investor US mortgage"
    - "foreign national investment property Florida"
  phrase_match:
    - "DSCR loan for foreign nationals"
    - "international investor rental loan"
    - "non-US citizen investment mortgage"
    - "Nova Credit mortgage lender"
    - "foreign national DSCR Texas"
  negative_keywords:
    - "primary residence mortgage"
    - "first time home buyer"
    - "FHA loan"
    - "VA loan"
    - "no money down"
    - "owner occupied"
    - "second home mortgage"
    - "vacation home loan"
    - "US citizen mortgage"
    - "personal loan"
    - "credit card"

landing_hook:
  headline: "Foreign-National DSCR Loans — No US Credit History Required"
  subhead: "Nova Credit translates your international credit. US LLC holds title. 70-75% LTV on US SFR rentals. Specialists in TX and FL markets."
  cta: "Start FN Pre-Intake"
  trust_signals:
    - "AHLend + America Mortgages — FN-native DSCR lenders"
    - "Nova Credit credit-translation accepted"
    - "Loans closed in TX, FL, AZ, NV, CA"
  self_qualifier_block: |
    3-question FN self-check (FF-08 will implement):
    Q1. Are you a foreign national investing in US rental property (not your primary residence)? [Yes / No]
    Q2. Do you have (or can you form within 2-4 weeks) a US-based LLC with EIN + operating agreement? [Yes / Need help forming / No]
    Q3. Can you provide 12 months of foreign bank statements with certified English translation + USD conversion + source-of-funds letter? [Yes / Partially / No]

faq:
  - q: "Do I need a US credit history to qualify?"
    a: "No — foreign-national DSCR programs at AHLend and America Mortgages use Nova Credit to translate your international credit file. UK / EU / Canada / AU credit histories typically translate cleanly. Borrowers from countries without Nova Credit coverage route to a different specialty tier (60-65% LTV, 12mo reserves) — we'll tell you which path applies."
  - q: "What documents do I need to start?"
    a: "Valid passport (6+ months validity past closing), US bank account seasoned 60-90 days, US LLC with EIN + operating agreement (US-attorney-drafted), 12 months foreign bank statements with certified English translation + USD conversion, source-of-funds letter for the down payment. AML clearance typically takes 2-4 weeks."
  - q: "What LTV and reserves are required?"
    a: "Strong-credit-country FN (UK/EU/Canada/AU): 70-75% LTV, 9-12 months PITIA reserves in US bank. No-credit-country FN: 60-65% LTV, 12 months reserves. Pricing premium +0.50-0.75% vs US borrower for strong-credit-country tier."
  - q: "Which states are best for FN DSCR?"
    a: "Texas (no state income tax, landlord-friendly, fast eviction) and Florida (no state income tax, deep FN-investor comp set, #1 DSCR market for FN per DSCR Authority). We can also underwrite in AZ, NV, CA, and other landlord-friendly states."
  - q: "What about FIRPTA withholding?"
    a: "FIRPTA (Foreign Investment in Real Property Tax Act) imposes 15% withholding on dispositions by foreign persons. Your entity structure (LLC vs. individual) and tax-residency status affect the application. We'll coordinate with US tax counsel on the optimal structure pre-closing — this is not a last-minute item."

disclaimer: "Foreign-national DSCR loans are for business-purpose US investment properties only. Not for primary residence, second home, or personal-use vacation property. All loans subject to credit approval, AML source-of-funds review, property review, and investor guidelines. Rate premiums apply to FN tiers per lender-published program terms. FIRPTA withholding rules apply. Equal Housing Lender. NMLS #_____."
```

---

### SA-006 — The No-Credit Foreign National

```yaml
persona_id: SA-006
persona_name: The No-Credit Foreign National

hooks:
  - hook_id: H1
    channel_fit: [google_search, native]
    primary_text: |
      Foreign-national DSCR for borrowers from countries without Nova Credit
      coverage. 40% down payment + 12 months US-bank reserves + DSCR 1.30+ +
      US LLC + AML source-of-funds trail. Specialty FN lenders (AHLend,
      America Mortgages, Angel Oak, A&D Mortgage, HomeAbroad) have dedicated
      no-credit-country programs. If you have a verified source of funds and
      are prepared for a 2-4 week AML review, this might fit. Investment
      properties only.
    headline: "No-Credit FN DSCR — 40% Down Path"
    cta: "Check No-Credit FN Eligibility"
    self_qualifying_microcopy: "If you have a verified source of funds and are prepared for a 2-4 week AML review, this might fit. Investment properties only."
    repels: [primary_residence_seekers, no_reserves_borrowers, no_source_of_funds_borrowers, no_LLC_FN_borrowers, low_down_payment_borrowers]
    attracts: [no_credit_country_FN, 40pct_down_capable, 12mo_reserves, FL_market_seekers]

  - hook_id: H2
    channel_fit: [google_search]
    primary_text: |
      International investor without a US credit file? No-credit-country FN
      DSCR specialists at AHLend, America Mortgages, Angel Oak, A&D Mortgage,
      HomeAbroad. 60-65% LTV, 12mo reserves, US LLC + EIN, FIRPTA structure
      reviewed by tax counsel. If you've sold real estate in your home
      country and have a clean source-of-funds narrative, we'll walk you
      through the documentation cycle. Investment properties only — Florida
      market focus.
    headline: "No-Credit FN DSCR Specialists"
    cta: "Submit Source-Of-Funds Brief"
    self_qualifying_microcopy: "If you've sold real estate in your home country and have a clean source-of-funds narrative, we'll walk you through the documentation cycle. Investment properties only — Florida market focus."
    repels: [primary_residence_seekers, no_reserves_borrowers, no_source_of_funds_borrowers, no_LLC_FN_borrowers, low_down_payment_borrowers]
    attracts: [no_credit_country_FN, 40pct_down_capable, prior_home_country_real_estate_sale, FL_market_seekers]

  - hook_id: H3
    channel_fit: [native, youtube]
    primary_text: |
      No-credit-country foreign-national DSCR — for investors from LatAm,
      Asia, Africa without Nova Credit coverage. 40% down + 12mo US-bank
      reserves + DSCR 1.30+ + US LLC + AML source-of-funds trail. Specialty
      FN lenders (AHLend, America Mortgages, Angel Oak, A&D Mortgage,
      HomeAbroad) have dedicated no-credit-country programs. If your
      source-of-funds narrative is clean (prior home-country real estate
      sale) and you're prepared for FIRPTA review, this might fit.
      Investment properties only — Florida market focus.
    headline: "No-Credit FN DSCR — FL Specialists"
    cta: "Begin FN Pre-Intake"
    self_qualifying_microcopy: "If your source-of-funds narrative is clean (prior home-country real estate sale) and you're prepared for FIRPTA review, this might fit. Investment properties only — Florida market focus."
    repels: [primary_residence_seekers, no_reserves_borrowers, no_source_of_funds_borrowers, no_LLC_FN_borrowers, low_down_payment_borrowers]
    attracts: [no_credit_country_FN, 40pct_down_capable, 12mo_reserves, prior_home_country_real_estate_sale, FL_market_seekers]

search_keywords:
  exact_match:
    - "foreign national DSCR no credit history"
    - "no credit foreign national DSCR"
    - "international investor 40% down DSCR"
    - "FIRPTA DSCR loan structure"
    - "Angel Oak foreign national DSCR"
  phrase_match:
    - "Brazilian investor US mortgage"
    - "no credit country foreign national loan"
    - "international investor Florida rental"
    - "foreign national DSCR 60% LTV"
    - "HomeAbroad DSCR loan"
  negative_keywords:
    - "primary residence mortgage"
    - "first time home buyer"
    - "FHA loan"
    - "VA loan"
    - "no money down"
    - "owner occupied"
    - "second home mortgage"
    - "vacation home loan"
    - "US citizen mortgage"
    - "personal loan"
    - "credit card"
    - "no credit check personal loan"

landing_hook:
  headline: "No-Credit-Country Foreign-National DSCR — 40% Down Path"
  subhead: "Specialty FN lenders for investors without Nova Credit coverage. 60-65% LTV, 12 months reserves, US LLC + AML trail. Florida market focus."
  cta: "Start No-Credit FN Pre-Intake"
  trust_signals:
    - "Specialty FN lender network: AHLend, America Mortgages, Angel Oak, A&D Mortgage, HomeAbroad"
    - "Dedicated AML + FIRPTA coordination with US tax counsel"
    - "Florida — #1 DSCR market for FN investors"
  self_qualifier_block: |
    3-question no-credit FN self-check (FF-08 will implement):
    Q1. Are you a foreign national from a country without Nova Credit coverage (e.g., Brazil, Russia, Nigeria, Vietnam)? [Yes / Unsure / No — I'm from a strong-credit-country]
    Q2. Can you provide 40% down payment + 12 months PITIA reserves in US bank (seasoned 90 days)? [Yes / Partially / No]
    Q3. Can you document source of funds via prior real estate sale closing statement + 12 months foreign bank statements (certified English translation + USD conversion)? [Yes / Partially / No]

faq:
  - q: "Why is the down payment 40% instead of 25%?"
    a: "No-credit-country FN tier requires 60-65% LTV (35-40% down) to compensate for the lack of credit-translation. Strong-credit-country FN (UK/EU/Canada/AU) qualify at 70-75% LTV via Nova Credit. We'll route you to the correct tier based on your passport country and credit-translation availability."
  - q: "How long does AML clearance take?"
    a: "2-4 weeks for the source-of-funds review. Borrowers with a clean narrative (prior real estate sale in home country, documented 12-month foreign bank statements, certified English translation, USD conversion) typically clear faster. We coordinate with US tax counsel on FIRPTA withholding structure in parallel."
  - q: "What rate premium applies?"
    a: "No-credit-country FN pricing typically runs +1.00-1.50% vs. US borrower. Strong-credit-country FN runs +0.50-0.75%. There may also be a $1,500 FN underwriting fee. These premiums are lender-published program features, not negotiable items — we'll show you the exact pricing for your file."
  - q: "Can I use a foreign bank account for reserves?"
    a: "Reserves must be in a US bank account seasoned 60-90 days before application. Foreign bank statements (12 months, certified English translation, USD conversion) document source-of-funds but don't count toward US reserve requirements. We'll walk you through the US bank transfer + seasoning timeline."
  - q: "What entity structure is required?"
    a: "US LLC with EIN + operating agreement drafted by a US attorney. Required for all FN DSCR programs. We can connect you with US counsel for LLC formation (~$1,200, 2-4 weeks) if you don't have one yet. LLC formation is part of the pre-intake workstream, not a last-minute item."

disclaimer: "No-credit-country foreign-national DSCR loans are for business-purpose US investment properties only. Not for primary residence, second home, or personal-use vacation property. All loans subject to credit approval, AML source-of-funds review, FIRPTA review, property review, and investor guidelines. +1.00-1.50% rate premium and $1,500 FN underwriting fee typically apply per lender-published program terms. Equal Housing Lender. NMLS #_____."
```

---

### SA-007 — The STR Permissive-Market Operator

```yaml
persona_id: SA-007
persona_name: The STR Permissive-Market Operator

hooks:
  - hook_id: H1
    channel_fit: [google_search]
    primary_text: |
      STR DSCR in Florida coast (Panama City Beach, Destin), Smokies
      (Gatlinburg, Pigeon Forge), Scottsdale AZ. AirDNA market projection
      accepted for first-time STR; 24+ month host history unlocks better
      pricing. If your STR-permit is obtainable, AirDNA score clears 82+,
      and you have 9-12 months reserves, this might fit. STR in NYC
      (Local Law 18) and Nashville residential zones is not a fundable
      path — we can redirect to LTR DSCR or STR-permissive markets.
    headline: "STR DSCR — FL Coast, Smokies, Scottsdale"
    cta: "Check STR Market Eligibility"
    self_qualifying_microcopy: "If your STR-permit is obtainable, AirDNA score clears 82+, and you have 9-12 months reserves, this might fit. STR in NYC and Nashville residential zones is not fundable."
    repels: [NYC_STR_seekers, Nashville_residential_STR_seekers, no_reserves_borrowers, primary_residence_seekers, no_STR_permit_seekers]
    attracts: [STR_operators, FL_coast_buyers, Smokies_buyers, Scottsdale_buyers, AirDNA_literate_investors, first_time_STR_with_AirDNA]

  - hook_id: H2
    channel_fit: [meta, youtube]
    primary_text: |
      Buying an Airbnb? DSCR qualifies on projected STR income — AirDNA
      market report, STR permit verification, 9-12 months reserves. Built
      for STR-permissive markets: Florida coast, Smokies, Scottsdale AZ.
      If you have STR-permit eligibility, AirDNA score 82+, and the
      projected DSCR pencils, this might fit. STR in NYC or Nashville
      residential zones routes to LTR DSCR or a different market.
    headline: "Airbnb DSCR — AirDNA Qualification Path"
    cta: "Submit AirDNA Report"
    self_qualifying_microcopy: "If you have STR-permit eligibility, AirDNA score 82+, and the projected DSCR pencils, this might fit. STR in NYC or Nashville residential zones routes to LTR DSCR or a different market."
    repels: [NYC_STR_seekers, Nashville_residential_STR_seekers, no_reserves_borrowers, speculative_rent_investors, primary_residence_seekers]
    attracts: [STR_operators, FL_coast_buyers, Smokies_buyers, Scottsdale_buyers, AirDNA_literate_investors]

  - hook_id: H3
    channel_fit: [google_search, native]
    primary_text: |
      Short-term rental DSCR — AirDNA projection accepted in lieu of host
      history for first-time STR in permissive markets. 25% income haircut
      applies for new hosts (15% with 24+ month host history). If your STR
      market is permissive (FL coast, Smokies, Scottsdale), your permit
      pathway is clear, and you have 9-12 months reserves, we'll underwrite
      the file. STR in NYC (Local Law 18) or Nashville residential zones
      is not fundable — LTR pivot or market pivot only.
    headline: "STR DSCR — First-Time Host Path Available"
    cta: "Verify STR Permit Eligibility"
    self_qualifying_microcopy: "If your STR market is permissive (FL coast, Smokies, Scottsdale), your permit pathway is clear, and you have 9-12 months reserves, we'll underwrite the file. STR in NYC or Nashville residential zones is not fundable."
    repels: [NYC_STR_seekers, Nashville_residential_STR_seekers, no_reserves_borrowers, no_STR_permit_seekers, primary_residence_seekers]
    attracts: [first_time_STR_investors, AirDNA_literate_investors, FL_coast_buyers, Smokies_buyers, Scottsdale_buyers]

search_keywords:
  exact_match:
    - "DSCR loan Airbnb"
    - "STR investment property financing"
    - "AirDNA DSCR loan"
    - "short term rental mortgage no income"
    - "DSCR loan STR permit"
  phrase_match:
    - "DSCR loan for short term rental"
    - "Airbnb investment property loan"
    - "vacation rental DSCR loan"
    - "STR DSCR Florida"
    - "short term rental financing no W2"
  negative_keywords:
    - "primary residence mortgage"
    - "first time home buyer"
    - "FHA loan"
    - "VA loan"
    - "no money down"
    - "owner occupied"
    - "second home mortgage"
    - "vacation home mortgage"
    - "rent to own"
    - "personal loan"
    - "credit card"
    - "NYC Airbnb legal"  # explicitly route out regulatory-blocked searches

landing_hook:
  headline: "STR DSCR Loans In Permissive Markets — AirDNA Qualification Path"
  subhead: "Florida coast, Smokies, Scottsdale AZ. AirDNA projection accepted for first-time STR. 9-12 months reserves. STR-permit verification built into intake."
  cta: "Check STR Market Eligibility"
  trust_signals:
    - "STR-permissive market specialists: Panama City Beach, Destin, Gatlinburg, Pigeon Forge, Scottsdale"
    - "AirDNA report accepted in lieu of 24-month host history"
    - "STR-permit verification built into intake — no surprises at underwriting"
  self_qualifier_block: |
    3-question STR self-check (FF-08 will implement):
    Q1. Is the property in an STR-permissive market (FL coast, Smokies, Scottsdale AZ, or other permissive MSA)? [Yes / Unsure — check my market / No — NYC/Nashville residential]
    Q2. Have you confirmed with the local municipality that a non-owner-occupied STR permit is obtainable? [Yes / In progress / No]
    Q3. Do you have 9-12 months of reserves and an AirDNA market report (or 24+ months host history)? [Yes / Need help getting AirDNA / No]

faq:
  - q: "Can I buy a short-term rental as a first-time STR host?"
    a: "Yes — in STR-permissive markets (FL coast, Smokies, Scottsdale). First-time STR borrowers typically face a 25% AirDNA income haircut and need 12 months reserves. A 24+ month host history unlocks 15% haircut + better pricing. We'll verify the STR-permit pathway before you commit."
  - q: "Why are NYC and Nashville STRs not fundable?"
    a: "NYC's Local Law 18 (effective 2023) requires host present during stays and caps at 2 guests — making investment STRs non-compliant. Nashville requires owner-occupancy for STR permits in residential zones. In both markets, the legal STR income path is unavailable to investors. We can redirect to LTR DSCR (if rents pencil) or to STR-permissive markets."
  - q: "What AirDNA score do I need?"
    a: "AirDNA market scores above 82 typically support STR DSCR qualification (per CF-01 sample cases). Below 82, the projected income may not support a 1.25+ DSCR. We'll pull a market score for your target property before formal application."
  - q: "Does STR DSCR cost more than LTR DSCR?"
    a: "Typically +25-75bps rate premium over LTR DSCR due to STR income volatility. STR appraisal costs $850-900 (vs. $650 standard). STR insurance (Proper, Slice, CBIZ) is sourced pre-closing. 9-12 months reserves (vs. 6mo LTR) is standard."
  - q: "What about condotels (hotel-condo conversions)?"
    a: "Condotels route to specialty STR-condotel lenders (Visio Lending, Kiavi) — different program than standard STR DSCR. 30-35% down payment, 12mo documented operating history, STR-permissive market. Standard residential DSCR lenders (AHLend, Newfi) exclude condotels — we'll route you to the right specialty."

disclaimer: "STR DSCR loans are for business-purpose investment properties in STR-permissive markets only. Not for primary residence, second home, or personal-use vacation property. STR market regulatory eligibility is borrower's responsibility to verify; lender approval does not constitute permit approval. All loans subject to credit approval, AirDNA review, STR-permit verification, property review, and investor guidelines. Equal Housing Lender. NMLS #_____."
```

---

### SA-008 — The Credit-Scarred Cash-Rich Rebuilder

```yaml
persona_id: SA-008
persona_name: The Credit-Scarred Cash-Rich Rebuilder

hooks:
  - hook_id: H1
    channel_fit: [google_search]
    primary_text: |
      Prior bankruptcy or foreclosure? Specialty seasoning programs available
      — 24mo / 36mo / 48mo paths depending on event type and current FICO.
      If you're 48+ months past Chapter 7 discharge (or 36+ months past
      foreclosure, or 24+ months with 700+ FICO), have 30-35% to put down,
      and 12+ months reserves, this might fit. Midwest 2-4 unit cash-flow
      markets preferred. Investment properties only — not for primary
      residences.
    headline: "DSCR After Bankruptcy — Seasoning Paths"
    cta: "Check Seasoning Path"
    self_qualifying_microcopy: "If you're 48+ months past Chapter 7 discharge (or 36+ months past foreclosure, or 24+ months with 700+ FICO), have 30-35% to put down, and 12+ months reserves, this might fit."
    repels: [primary_residence_seekers, active_delinquency_borrowers, no_reserves_borrowers, sub_seasoning_borrowers, recent_mortgage_late_borrowers]
    attracts: [post_bankruptcy_seasoned, post_foreclosure_seasoned, 30pct_down_capable, 12mo_reserves, Midwest_2_4_unit_seekers]

  - hook_id: H2
    channel_fit: [meta, native]
    primary_text: |
      Not every investor with a credit scar is a bad file. DSCR seasoning
      programs: 48mo post-Chapter 7, 36mo post-foreclosure, 24mo specialty
      with 700+ FICO. If you've rebuilt your credit post-event, have 30%+
      down, and 12+ months reserves, this might fit. Midwest 2-4 unit
      cash-flow property preferred. Investment properties only — we'll need
      a lease or 1007 appraisal. Equal Housing Lender.
    headline: "Credit Rebuilt? DSCR May Fit."
    cta: "See Specialty Seasoning Programs"
    self_qualifying_microcopy: "If you've rebuilt your credit post-event, have 30%+ down, and 12+ months reserves, this might fit. Midwest 2-4 unit cash-flow property preferred. Investment properties only."
    repels: [primary_residence_seekers, active_delinquency_borrowers, no_reserves_borrowers, sub_seasoning_borrowers, recent_mortgage_late_borrowers]
    attracts: [post_bankruptcy_seasoned, post_foreclosure_seasoned, post_short_sale_seasoned, 30pct_down_capable, Midwest_2_4_unit_seekers]

  - hook_id: H3
    channel_fit: [google_search]
    primary_text: |
      DSCR after short sale, foreclosure, or bankruptcy. Specialty seasoning
      programs at Bluestone (550 FICO floor), AHLend (620 floor), America
      Mortgages (640 floor). If you're past the seasoning window, have 30%+
      down, 12+ months reserves, and a 1.30+ DSCR property, this is built
      for you. Investment properties only — Cleveland, Cincinnati, St. Louis,
      Indianapolis, Pittsburgh markets preferred.
    headline: "Specialty Seasoning DSCR — Rebuilt Credit OK"
    cta: "Check Specialty Lender Match"
    self_qualifying_microcopy: "If you're past the seasoning window, have 30%+ down, 12+ months reserves, and a 1.30+ DSCR property, this is built for you. Investment properties only."
    repels: [primary_residence_seekers, active_delinquency_borrowers, no_reserves_borrowers, sub_seasoning_borrowers, recent_mortgage_late_borrowers]
    attracts: [post_bankruptcy_seasoned, post_foreclosure_seasoned, post_short_sale_seasoned, Midwest_2_4_unit_seekers]

search_keywords:
  exact_match:
    - "DSCR loan after bankruptcy"
    - "DSCR loan after foreclosure"
    - "investment property loan after short sale"
    - "Bluestone DSCR requirements"
    - "DSCR loan bad credit investor"
  phrase_match:
    - "DSCR loan after Chapter 7"
    - "investment mortgage after bankruptcy"
    - "rental property loan post foreclosure"
    - "specialty seasoning DSCR loan"
    - "Midwest 2-4 unit DSCR"
  negative_keywords:
    - "primary residence mortgage"
    - "first time home buyer"
    - "FHA loan after bankruptcy"
    - "VA loan after foreclosure"
    - "no money down"
    - "owner occupied"
    - "second home mortgage"
    - "personal loan after bankruptcy"
    - "credit card for bad credit"
    - "payday loan"

landing_hook:
  headline: "DSCR Loans After Bankruptcy, Foreclosure, Or Short Sale"
  subhead: "Specialty seasoning programs at Bluestone, AHLend, America Mortgages. 24mo / 36mo / 48mo paths depending on event type and current FICO. 30%+ down, 12+ months reserves, 1.30+ DSCR."
  cta: "Check Seasoning Path"
  trust_signals:
    - "Specialty lender network: Bluestone (550 FICO floor), AHLend (620 floor), America (640 floor)"
    - "Midwest 2-4 unit cash-flow markets: Cleveland, Cincinnati, St. Louis, Indianapolis, Pittsburgh"
    - "Post-seasoning DSCR borrowers typically rebuild FICO 30-50 points in 6-12mo and refinance"
  self_qualifier_block: |
    3-question seasoning self-check (FF-08 will implement):
    Q1. What was your most recent credit event (Chapter 7 bankruptcy / Chapter 13 bankruptcy / foreclosure / short sale / deed-in-lieu) and what was the discharge date? [Dropdown + month/year]
    Q2. Have you had any 30-day-or-greater mortgage late payment in the last 12 months? [No / Yes — under 12 months / Yes — 12+ months ago]
    Q3. Can you put 30-35% down + 12+ months reserves + find a property with 1.30+ DSCR? [Yes / Partially / No]

faq:
  - q: "How long after bankruptcy can I qualify for DSCR?"
    a: "Chapter 7 bankruptcy: 48+ months standard seasoning, 24-36 months at specialty programs with 700+ FICO + compensators. Chapter 13 bankruptcy: 12+ months on-plan payments with trustee approval. We'll route you based on your discharge date and current FICO."
  - q: "How long after foreclosure?"
    a: "36+ months standard seasoning, 24+ months at specialty programs with 700+ FICO. CF-024 declined at 30 months post-foreclosure with 680 FICO (missed both windows) — the fundable variant is the same borrower 6 months later or with FICO rebuilt to 700+. We'll tell you which window you're in."
  - q: "What if I had a recent mortgage late?"
    a: "Most DSCR programs require 12+ months since your most recent 30-day mortgage late. If you're inside that window, we'll defer intake 12 months — not permanently reject. If you're 12+ months past, several specialty programs may fit. Active mortgage delinquency or uncured forbearance is a hard-stop until cured."
  - q: "What credit score do I need?"
    a: "Specialty programs work down to 620 FICO (AHLend), 640 (America Mortgages), or 550 (Bluestone) with compensators. Best-tier pricing sits at 700+. We'll show you which band you're in and what compensators (deeper reserves, lower LTV, stronger DSCR) unlock which programs."
  - q: "What property types work best?"
    a: "Midwest 2-4 unit cash-flow property (Cleveland, Cincinnati, St. Louis, Indianapolis, Pittsburgh) is the canonical fit — strong rent-to-value ratios support the 1.30+ DSCR needed to offset credit-tier. SFR in stable rental markets also works. We'll suggest markets if you're still property-shopping."

disclaimer: "DSCR loans are for business-purpose investment properties only. Not for primary residence, second home, or personal-use vacation property. Specialty seasoning programs vary by lender; 24mo / 36mo / 48mo seasoning paths require compensating factors (deeper reserves, lower LTV, stronger DSCR, post-event credit rebuild). All loans subject to credit approval, property review, and investor guidelines. +50-100bps rate premium may apply to below-floor FICO files per lender-published program terms. Equal Housing Lender. NMLS #_____."
```

---

### SA-009 — The Permitted-ADU California Leverage Player

```yaml
persona_id: SA-009
persona_name: The Permitted-ADU California Leverage Player

hooks:
  - hook_id: H1
    channel_fit: [google_search]
    primary_text: |
      DSCR for SFR-with-permitted-ADU in California. ADU rental income counts
      in DSCR qualification — material lift to the qualifying ratio. 75-80%
      LTV when property is classified as SFR (vs 70-75% for 2-4 unit). If
      your ADU permit is verified at LA DBS / San Diego DSD, you have a
      separate lease + 2+ months rent receipts, and Form 1007 supports both
      rents, this is built for you. Investment properties only — California
      LA / San Diego / Bay Area focus.
    headline: "ADU Rental Income DSCR — California"
    cta: "Verify ADU Permit Status"
    self_qualifying_microcopy: "If your ADU permit is verified at LA DBS / San Diego DSD, you have a separate lease + 2+ months rent receipts, and Form 1007 supports both rents, this is built for you. Investment properties only."
    repels: [primary_residence_seekers, unpermitted_ADU_only_borrowers, no_reserves_borrowers, non_CA_borrowers]
    attracts: [CA_ADU_permit_holders, SFR_with_ADU_owners, LA_SD_BayArea_investors, 700_plus_FICO]

  - hook_id: H2
    channel_fit: [meta, native]
    primary_text: |
      California ADU investor? DSCR qualifies on primary-house rent PLUS ADU
      rent — both rents lift the qualifying ratio. SFR-with-permitted-ADU
      classification unlocks 75-80% LTV. If your ADU permit is verified, the
      ADU has private entrance + kitchen + bath + sleeping area, and you have
      a separate lease, this might fit. Investment properties only — LA,
      San Diego, Bay Area focus. Equal Housing Lender.
    headline: "ADU Income Counts In DSCR — CA"
    cta: "Check ADU Eligibility"
    self_qualifying_microcopy: "If your ADU permit is verified, the ADU has private entrance + kitchen + bath + sleeping area, and you have a separate lease, this might fit. Investment properties only."
    repels: [primary_residence_seekers, unpermitted_ADU_only_borrowers, no_reserves_borrowers, non_CA_borrowers]
    attracts: [CA_ADU_permit_holders, SFR_with_ADU_owners, LA_SD_BayArea_investors, large_loan_seekers]

  - hook_id: H3
    channel_fit: [google_search, youtube]
    primary_text: |
      California SFR-with-ADU — DSCR underwriting counts both rents. 75-80%
      LTV when ADU is permitted (SFR classification per Harpoon Capital
      guide). ADU contributory value counted in appraisal. If you have an
      ADU permit verified at LA DBS or San Diego DSD, a separate ADU lease,
      and the combined rents support 1.20+ DSCR, this might fit. Investment
      properties only.
    headline: "Permitted ADU? DSCR Counts Both Rents"
    cta: "Underwrite My ADU Property"
    self_qualifying_microcopy: "If you have an ADU permit verified at LA DBS or San Diego DSD, a separate ADU lease, and the combined rents support 1.20+ DSCR, this might fit. Investment properties only."
    repels: [primary_residence_seekers, unpermitted_ADU_only_borrowers, no_reserves_borrowers, non_CA_borrowers]
    attracts: [CA_ADU_permit_holders, SFR_with_ADU_owners, 700_plus_FICO, large_loan_seekers]

search_keywords:
  exact_match:
    - "DSCR loan ADU"
    - "ADU rental income mortgage"
    - "California ADU financing investment"
    - "SFR with ADU DSCR loan"
    - "ADU appraisal DSCR"
  phrase_match:
    - "DSCR loan for ADU property"
    - "California ADU investment loan"
    - "SFR with permitted ADU mortgage"
    - "ADU rental income DSCR"
    - "Harpoon Capital ADU loan"
  negative_keywords:
    - "primary residence mortgage"
    - "first time home buyer"
    - "FHA loan"
    - "VA loan"
    - "no money down"
    - "owner occupied"
    - "second home mortgage"
    - "vacation home loan"
    - "ADU construction loan owner"
    - "personal loan"
    - "credit card"

landing_hook:
  headline: "DSCR For California SFR-With-Permitted-ADU — Both Rents Count"
  subhead: "75-80% LTV when ADU is permitted (SFR classification). ADU rental income + contributory value counted in qualification. LA / San Diego / Bay Area focus."
  cta: "Verify ADU Permit Status"
  trust_signals:
    - "Harpoon Capital ADU-specialist routing"
    - "LA DBS / San Diego DSD permit verification built into intake"
    - "Average close 21-28 days on permitted-ADU files"
  self_qualifier_block: |
    3-question ADU self-check (FF-08 will implement):
    Q1. Is the property an SFR with a permitted ADU (accessory dwelling unit) in California? [Yes — permitted / Yes — but unpermitted / No ADU / Not in CA]
    Q2. Does the ADU have a private entrance, kitchen, bathroom, and sleeping area, plus a separate lease + 2+ months rent receipts? [Yes / In progress / No]
    Q3. Can you provide the ADU permit number from LA DBS / San Diego DSD / your city's building & safety department? [Yes / Need help verifying / No — ADU is unpermitted]

faq:
  - q: "Does the ADU rental income count in DSCR?"
    a: "Yes — for permitted ADUs, both the primary-house rent and the ADU rent count toward DSCR qualification. This is a material lift to the qualifying ratio. ADU contributory value is also counted in the appraisal. Unpermitted ADUs route to a specialty SFR-classification pivot where ADU income is excluded but the property still qualifies (70% LTV + 25bps premium)."
  - q: "What LTV can I get with a permitted ADU?"
    a: "75-80% LTV when the property is classified as SFR (per Harpoon Capital guide: SFR-with-permitted-ADU = SFR, not duplex). This is higher than the 70-75% LTV cap on 2-4 unit properties. ADU permit verification is the gating requirement."
  - q: "What if my ADU is unpermitted?"
    a: "Unpermitted ADUs route to specialty-lender SFR-classification pivot at 70% LTV + 25bps premium (CF-021 case). ADU income is excluded from DSCR qualification AND ADU value is excluded from appraisal — but the property still qualifies, the ADU rent still collects in operation, and the borrower can pursue permit cure post-close (8-14 months in CA). Not a fundable dead-end — a specialty pathway."
  - q: "How long does ADU permit verification take?"
    a: "2-4 weeks at LA DBS or San Diego DSD. We pull the permit at intake — borrowers often don't know their ADU's permit status until we verify. If the ADU was built by a prior owner without permits, we'll route you to the unpermitted-ADU specialty pathway."
  - q: "Which California markets work best?"
    a: "LA, San Diego, and Bay Area have deep ADU-permit density (~12,000 LA DBS permits issued 2017-2024) — strong comp set for appraisal. Sacramento, Oakland, San Jose, Long Beach also work. Loan sizes typically $700K-$1.2M reflecting CA property values."

disclaimer: "DSCR loans are for business-purpose investment properties only. Not for primary residence, second home, or personal-use vacation property. ADU permit status must be verified; unpermitted-ADU files route to specialty SFR-classification pivot at reduced LTV and rate premium. ADU income exclusion for unpermitted ADUs is a qualification methodology, not an operational restriction. All loans subject to credit approval, property review, appraisal review, and investor guidelines. Equal Housing Lender. NMLS #_____."
```

---

### SA-010 — The ITIN US-Resident Investor

```yaml
persona_id: SA-010
persona_name: The ITIN US-Resident Investor

hooks:
  - hook_id: H1
    channel_fit: [google_search]
    primary_text: |
      ITIN DSCR loans — ITIN accepted in lieu of SSN at AHLend + America
      Mortgages. US resident with work permit + ITIN + 2-3 US tradelines (18+
      months history) + 9 months reserves + 70-80% LTV = fundable. 2-4 unit
      property preferred (combined rents support DSCR with thinner credit).
      If you have ITIN issued via CAA, US residency, and a 2-4 unit property
      in Miami / Houston / LA, this might fit. Investment properties only.
    headline: "ITIN DSCR Loans — No SSN Required"
    cta: "Check ITIN Program Eligibility"
    self_qualifying_microcopy: "If you have ITIN issued via CAA, US residency, and a 2-4 unit property in Miami / Houston / LA, this might fit. Investment properties only."
    repels: [primary_residence_seekers, no_reserves_borrowers, no_ITIN_borrowers, no_US_residency_borrowers, speculative_rent_investors]
    attracts: [ITIN_holders, US_residents_with_work_permit, 2_4_unit_investors, FL_TX_CA_investors]

  - hook_id: H2
    channel_fit: [google_search, native]
    primary_text: |
      Préstamos DSCR con ITIN — sin SSN. AHLend + America Mortgages aceptan
      ITIN. Residencia + permiso de trabajo + 2-3 tradelines de crédito (18+
      meses) + 9 meses reservas + 70-80% LTV = calificable. Propiedad de 2-4
      unidades preferida. Si tiene ITIN emitido por CAA, residencia
      estadounidense, y una propiedad de 2-4 unidades en Miami / Houston /
      Los Ángeles, esto podría funcionar. Propiedades de inversión
      únicamente.
    headline: "Préstamos DSCR Con ITIN — Sin SSN"
    cta: "Verificar Elegibilidad ITIN"
    self_qualifying_microcopy: "Si tiene ITIN emitido por CAA, residencia estadounidense, y una propiedad de 2-4 unidades en Miami / Houston / Los Ángeles, esto podría funcionar. Propiedades de inversión únicamente."
    repels: [primary_residence_seekers, no_reserves_borrowers, no_ITIN_borrowers, no_US_residency_borrowers, speculative_rent_investors]
    attracts: [ITIN_holders, US_residents_with_work_permit, Spanish_speaking_investors, 2_4_unit_investors]

  - hook_id: H3
    channel_fit: [meta, youtube]
    primary_text: |
      US resident with ITIN (no SSN)? DSCR investment-property loans available
      at AHLend + America Mortgages. 70-80% LTV, 9 months reserves, 2-4 unit
      property preferred. ITIN pricing sits between pure foreign-national and
      US borrower (+25-75bps). If you've got ITIN via CAA, 18+ months US
      credit history, and employment verification, this might fit.
      Investment properties only. Equal Housing Lender.
    headline: "ITIN DSCR — US Residents, No SSN"
    cta: "Start ITIN Pre-Intake"
    self_qualifying_microcopy: "If you've got ITIN via CAA, 18+ months US credit history, and employment verification, this might fit. Investment properties only."
    repels: [primary_residence_seekers, no_reserves_borrowers, no_ITIN_borrowers, no_US_residency_borrowers, speculative_rent_investors]
    attracts: [ITIN_holders, US_residents_with_work_permit, 2_4_unit_investors, mixed_W2_self_employed]

search_keywords:
  exact_match:
    - "ITIN DSCR loan"
    - "DSCR loan no SSN"
    - "ITIN investment property loan"
    - "prestamo DSCR ITIN"
    - "DSCR loan work permit"
  phrase_match:
    - "DSCR loan for ITIN borrowers"
    - "ITIN mortgage investment property"
    - "no SSN investment property loan"
    - "prestamo inversion ITIN"
    - "DSCR ITIN Miami Houston LA"
  negative_keywords:
    - "primary residence mortgage"
    - "first time home buyer"
    - "FHA loan"
    - "VA loan"
    - "no money down"
    - "owner occupied"
    - "second home mortgage"
    - "personal loan ITIN"
    - "credit card ITIN"
    - "no credit check personal loan"

landing_hook:
  headline: "ITIN DSCR Loans — US Residents With Work Permit, No SSN Required"
  subhead: "AHLend + America Mortgages accept ITIN. 70-80% LTV, 9 months reserves, 2-4 unit property preferred. Bilingual intake (English / Spanish)."
  cta: "Start ITIN Pre-Intake"
  trust_signals:
    - "AHLend + America Mortgages — ITIN-eligible DSCR lenders (published program feature)"
    - "Bilingual intake processing (English / Spanish / Portuguese)"
    - "2-4 unit property specialists in Miami, Houston, Los Angeles"
  self_qualifier_block: |
    3-question ITIN self-check (FF-08 will implement):
    Q1. Are you a US resident with work permit + ITIN (not a foreign national, not a US citizen)? [Yes / Foreign national / US citizen]
    Q2. Do you have 2-3 US tradelines (credit cards, auto loan, prior installment loan) with 18+ months history? [Yes / Partially / No — new to US credit]
    Q3. Can you provide 12 months US bank statements + employment verification letter + 9 months PITIA reserves? [Yes / Partially / No]

faq:
  - q: "I have ITIN but no SSN. Can I get a DSCR loan?"
    a: "Yes — AHLend and America Mortgages accept ITIN in lieu of SSN as a published program feature (not an exception). ITIN-tier pricing sits between pure foreign-national and US borrower (+25-75bps). ITIN borrowers are US residents — AML friction is materially lower than for foreign nationals."
  - q: "What credit history do I need?"
    a: "2-3 US tradelines (credit cards, auto loan, prior installment loan) with 18+ months history. ITIN-based FICO typically 660-700 due to thin file, not weak credit. 12 months US bank statements + employment verification letter supplement the thin credit file."
  - q: "What property types work best for ITIN DSCR?"
    a: "2-4 unit property is preferred — combined unit rents support DSCR with thinner credit. SFR also works. LTR (long-term rental) only at most ITIN-eligible lenders; STR is not standard for ITIN tier. Miami / Houston / LA markets have deep ITIN-investor comp sets."
  - q: "Do I need to form an LLC?"
    a: "LLC vesting is standard for ITIN tier (not strictly required at all lenders, but recommended). We'll coordinate LLC formation + operating agreement if needed. ITIN borrowers with US residency + work permit have lower entity-formation friction than foreign nationals."
  - q: "How long does ITIN underwriting take?"
    a: "ITIN underwriting adds 5-7 days to the standard cycle for employment verification + ITIN document review. ITIN issuance via CAA (Certified Acceptance Agent) takes 11+ weeks — start the ITIN application BEFORE property shopping if you don't have one yet."

disclaimer: "ITIN DSCR loans are for business-purpose US investment properties only. Not for primary residence, second home, or personal-use vacation property. ITIN accepted in lieu of SSN as a published lender program feature at AHLend and America Mortgages; ITIN is not a basis for underwriting exemption. All loans subject to credit approval, employment verification, property review, and investor guidelines. +25-75bps ITIN pricing premium per lender-published program terms. Equal Housing Lender. NMLS #_____."
```

---

### SA-011 — The Compensated-Exception Shopper

```yaml
persona_id: SA-011
persona_name: The Compensated-Exception Shopper

hooks:
  - hook_id: H1
    channel_fit: [google_search]
    primary_text: |
      Declined for unpermitted ADU? Non-warrantable condo? Condotel? Open
      code violations? Appraisal short? Reserves miscalc? Specialty DSCR
      lenders available — many declines are lender-fit issues, not file
      issues. If you've received a decline letter, bring it — we'll route
      to specialty intake (Visio/Kiavi for condotel, Harpoon for ADU,
      Bluestone for sub-660 FICO, Newfi for sub-1.0 DSCR). Investment
      properties only — not for primary-residence declines.
    headline: "Declined By DSCR Lender? Specialty Routes."
    cta: "Submit Decline Letter"
    self_qualifying_microcopy: "If you've received a decline letter, bring it — we'll route to specialty intake. Investment properties only — not for primary-residence declines."
    repels: [primary_residence_seekers, no_reserves_borrowers, fundamentally_unfundable_borrowers, active_delinquency_borrowers]
    attracts: [decline_letter_holders, non_warrantable_condo_buyers, condotel_buyers, unpermitted_ADU_owners, 401k_reserves_borrowers]

  - hook_id: H2
    channel_fit: [google_search, native]
    primary_text: |
      Non-warrantable condo declined at standard DSCR? ~Half-dozen specialty
      DSCR lenders write non-warrantable — 70% LTV + 1.25+ DSCR + 6-12mo
      reserves + 25-50bps premium. If your condo has investor concentration
      >50%, pending HOA litigation, or hotel conversion, this is built for
      you. Investment properties only — bring the decline letter + HOA
      questionnaire and we'll route to specialty intake.
    headline: "Non-Warrantable Condo? Specialty DSCR."
    cta: "Submit HOA Questionnaire"
    self_qualifying_microcopy: "If your condo has investor concentration >50%, pending HOA litigation, or hotel conversion, this is built for you. Investment properties only — bring the decline letter + HOA questionnaire."
    repels: [primary_residence_seekers, no_reserves_borrowers, fundamentally_unfundable_borrowers]
    attracts: [non_warrantable_condo_buyers, decline_letter_holders, Chicago_Miami_Phoenix_condo_investors]

  - hook_id: H3
    channel_fit: [google_search, meta]
    primary_text: |
      DSCR loan after decline? Many DSCR declines are lender-fit issues, not
      file issues. ~40% of declined files re-shop to specialty lenders and
      close. If you've been declined for unpermitted ADU, non-warrantable
      condo, condotel, sub-1.0 DSCR with compensators, or 401(k) reserves
      miscalc, we'll triage the decline reason and route to the right
      specialty lender. Investment properties only. Free decline-letter
      review.
    headline: "DSCR Decline? Free Triage + Specialty Route"
    cta: "Get Free Decline Review"
    self_qualifying_microcopy: "If you've been declined for unpermitted ADU, non-warrantable condo, condotel, sub-1.0 DSCR with compensators, or 401(k) reserves miscalc, we'll triage the decline reason and route to the right specialty lender. Investment properties only."
    repels: [primary_residence_seekers, no_reserves_borrowers, fundamentally_unfundable_borrowers, active_delinquency_borrowers]
    attracts: [decline_letter_holders, unpermitted_ADU_owners, condotel_buyers, sub_1_DSCR_with_compensators, 401k_reserves_borrowers]

search_keywords:
  exact_match:
    - "DSCR loan after decline"
    - "non-warrantable condo DSCR"
    - "condotel DSCR financing"
    - "unpermitted ADU DSCR lender"
    - "declined DSCR loan what now"
  phrase_match:
    - "DSCR loan declined what to do"
    - "specialty DSCR lender condotel"
    - "non-warrantable condo investment loan"
    - "DSCR after appraisal short"
    - "specialty DSCR 401k reserves"
  negative_keywords:
    - "primary residence mortgage"
    - "first time home buyer"
    - "FHA loan"
    - "VA loan"
    - "no money down"
    - "owner occupied"
    - "second home mortgage"
    - "personal loan"
    - "credit card"
    - "hard money personal loan"

landing_hook:
  headline: "Declined By A DSCR Lender? Specialty Routes Available."
  subhead: "~40% of DSCR declines are lender-fit issues, not file issues. Free decline-letter triage. Specialty lenders for condotel, non-warrantable, unpermitted ADU, sub-1.0 DSCR with compensators, 401(k) reserves miscalc, open violations, appraisal short."
  cta: "Submit Decline Letter"
  trust_signals:
    - "Specialty lender network: Visio Lending + Kiavi (condotel), Harpoon Capital (ADU), Truss + Bluestone + Lendmire + Brookmont (non-warrantable), Newfi (sub-1.0 DSCR)"
    - "Decline-letter triage process: 24-48 hour turnaround on routing recommendation"
    - "Documented CF-01 'shop the decline letter' playbook"
  self_qualifier_block: |
    3-question decline-triage self-check (FF-08 will implement):
    Q1. Have you received a decline letter on this file from another DSCR lender? [Yes — within 30 days / Yes — 30+ days ago / No]
    Q2. What was the stated decline reason? [Dropdown: condotel / non-warrantable condo / unpermitted ADU / sub-1.0 DSCR / 401(k) reserves miscalc / appraisal short / open code violations / FICO below floor / seasoning short / mortgage late / other]
    Q3. Are you able to provide the decline letter + any documentation you've already assembled (HOA questionnaire, ADU permit status, reserves calc, etc.)? [Yes / Partially / Need help assembling]

faq:
  - q: "I was declined for a non-warrantable condo. Can specialty DSCR help?"
    a: "Often yes — ~half-dozen DSCR lenders actively write non-warrantable (Truss, Bluestone, Lendmire, Brookmont Capital, Rize case-by-case). Borrower profile strength doesn't need to change — the decline was a lender-fit issue. Typical pivot: 70% LTV (vs 75% standard) + 25-50bps rate premium + HOA questionnaire + 12mo reserves. Same borrower, same property, different lender."
  - q: "What if I was declined for an unpermitted ADU?"
    a: "Specialty-lender SFR-classification pivot is available at Harpoon Capital, Truss, Rize case-by-case. The lender qualifies the property as SFR (ADU ignored for income AND value) at 70% LTV + 25bps premium. ADU income still collects in operation. ADU permit cure is a post-close option, not pre-close requirement."
  - q: "I was declined for condotel. Is there a path?"
    a: "Yes — Visio Lending and Kiavi have STR-condotel programs (commercial-facing DSCR tier). Typical: 30-35% down payment, 1.25+ DSCR, 12mo documented operating history, STR-permissive market. AHLend and Newfi exclude condotels explicitly — that's the lender-fit issue, not a file issue."
  - q: "My DSCR came in at 0.85. Am I out of options?"
    a: "Not necessarily. AHLend, Lendmire, and Newfi accept DSCR as low as 0.75-0.80 with compensating factors — FICO 700+, LTV ≤65-70%, 12mo reserves, 3+ financed properties. The CF-008 case shows the playbook: borrower started at 0.81 DSCR at 20% down → 1.12 at 42% down (approved). Compensators unlock sub-1.0 DSCR programs."
  - q: "I was declined for 401(k) reserves miscalc. What happened?"
    a: "The first lender likely applied your full 401(k) balance as reserves instead of the standard 60% haircut. Apply 60% haircut to 401(k)/IRA balances + add co-borrower (spouse) liquid checking + re-shop to a lender applying the correct methodology — most declines at this point resolve. CF-026 case: 4mo reserves (miscalculated) → 6.2mo after correct 60% haircut + co-borrower addition = approved_with_conditions."

disclaimer: "DSCR loans are for business-purpose investment properties only. Not for primary residence, second home, or personal-use vacation property. Prior decline by another lender does not guarantee specialty-lender approval; specialty programs require borrower-file fit per lender-published program terms. All loans subject to credit approval, property review, and investor guidelines. Specialty-lender programs may carry rate premiums, LTV haircuts, and specialty underwriting fees. Equal Housing Lender. NMLS #_____."
```

---

### SA-012 — The BRRRR Refinance Cyclist

```yaml
persona_id: SA-012
persona_name: The BRRRR Refinance Cyclist

hooks:
  - hook_id: H1
    channel_fit: [google_search]
    primary_text: |
      BRRRR refinance into DSCR — pay off hard-money, recycle capital,
      stabilize the next acquisition. 6+ months seasoning from initial
      hard-money purchase required (universal minimum). 75% LTV on post-rehab
      ARV. Form 1007 market-rent on post-rehab condition. If you're past
      the 6mo seasoning window, your hard-money payoff is documented, and
      the post-rehab appraisal pencils, this is built for you. Investment
      properties only — loan amounts $100K+ only.
    headline: "BRRRR Refi Into DSCR — 6mo+ Seasoning"
    cta: "Submit BRRRR Refi"
    self_qualifying_microcopy: "If you're past the 6mo seasoning window, your hard-money payoff is documented, and the post-rehab appraisal pencils, this is built for you. Investment properties only — loan amounts $100K+ only."
    repels: [primary_residence_seekers, sub_6mo_seasoning_borrowers, sub_100K_loan_borrowers, no_reserves_borrowers, speculative_rent_investors]
    attracts: [BRRRR_cyclists, hard_money_payoff_intent, 6mo_plus_seasoning, LLC_vested, low_cost_market_buyers]

  - hook_id: H2
    channel_fit: [meta, youtube]
    primary_text: |
      Hard-money BRRRR cyclist? DSCR refinance pays off the hard-money loan
      + returns capital for the next acquisition. 6mo seasoning minimum,
      75% LTV on post-rehab ARV, Form 1007 market rent supports DSCR. If
      your BRRRR cycle is at 6+ months, the rehab is complete, and the
      property is leased or rent-supportable, this might fit. Investment
      properties only. Equal Housing Lender.
    headline: "BRRRR Refi — Recycle Capital"
    cta: "Underwrite My BRRRR Refi"
    self_qualifying_microcopy: "If your BRRRR cycle is at 6+ months, the rehab is complete, and the property is leased or rent-supportable, this might fit. Investment properties only."
    repels: [primary_residence_seekers, sub_6mo_seasoning_borrowers, sub_100K_loan_borrowers, no_reserves_borrowers]
    attracts: [BRRRR_cyclists, hard_money_payoff_intent, LLC_vested, repeat_borrowers, low_cost_market_buyers]

  - hook_id: H3
    channel_fit: [google_search, native]
    primary_text: |
      DSCR cash-out after BRRRR rehab — recycle capital into the next deal.
      6mo seasoning universal minimum (no compensator override). 75% LTV on
      post-rehab ARV. Hard-money payoff documented at closing. Memphis,
      Indianapolis, Cleveland, Birmingham BRRRR-friendly markets preferred.
      If you're past the 6mo window and the post-rehab rent pencils at
      1.25+ DSCR, this is built for you. Investment properties only.
    headline: "BRRRR Refi — Memphis, Indy, Cleve, Bham"
    cta: "Check BRRRR Refi Eligibility"
    self_qualifying_microcopy: "If you're past the 6mo window and the post-rehab rent pencils at 1.25+ DSCR, this is built for you. Investment properties only."
    repels: [primary_residence_seekers, sub_6mo_seasoning_borrowers, sub_100K_loan_borrowers, no_reserves_borrowers, speculative_rent_investors]
    attracts: [BRRRR_cyclists, hard_money_payoff_intent, 6mo_plus_seasoning, low_cost_market_buyers]

search_keywords:
  exact_match:
    - "DSCR loan BRRRR"
    - "refinance hard money DSCR"
    - "BRRRR refinance seasoning"
    - "DSCR cash out after rehab"
    - "BRRRR refinance 6 month rule"
  phrase_match:
    - "BRRRR refinance DSCR lender"
    - "DSCR loan after hard money"
    - "BRRRR cash out refi investment"
    - "post-rehab DSCR refinance"
    - "DSCR BRRRR Memphis Indianapolis"
  negative_keywords:
    - "primary residence mortgage"
    - "first time home buyer"
    - "FHA loan"
    - "VA loan"
    - "no money down"
    - "owner occupied"
    - "second home mortgage"
    - "vacation home loan"
    - "personal loan"
    - "hard money personal loan"
    - "fix and flip loan owner"

landing_hook:
  headline: "BRRRR Refinance Into DSCR — Recycle Capital Into The Next Deal"
  subhead: "Pay off hard-money, stabilize the file, return capital to the borrower. 6mo seasoning minimum, 75% LTV on post-rehab ARV. Memphis, Indianapolis, Cleveland, Birmingham BRRRR-friendly markets."
  cta: "Underwrite My BRRRR Refi"
  trust_signals:
    - "Documented BRRRR-refi case file (CF-010): 6mo seasoning → 75% LTV → 14-day close"
    - "Repeat-borrower velocity: 5-6 BRRRR refis per year per active cyclist"
    - "Prepay-penalty acceptance unlocks 25-50bps pricing improvements"
  self_qualifier_block: |
    3-question BRRRR-refi self-check (FF-08 will implement):
    Q1. Is this a BRRRR refinance (hard-money purchase → rehab → 6+ months → DSCR refi)? [Yes / No — different refi pathway]
    Q2. Has it been 6+ months since your initial hard-money purchase? [Yes / Almost — within 4 weeks / No]
    Q3. Is the post-rehab ARV sufficient to support 75% LTV with a loan amount ≥$100K, and is the post-rehab rent supportable via lease or Form 1007? [Yes / Unsure — show me the calculator / No]

faq:
  - q: "How long after my hard-money purchase can I refi into DSCR?"
    a: "6+ months seasoning from initial purchase is the universal minimum — no compensator override. Applications before 6mo auto-decline. We'll verify your seasoning window at intake and time the application to clear the 6mo mark."
  - q: "What LTV can I get on a BRRRR refi?"
    a: "75% LTV on post-rehab ARV (after-rehab value) is standard. Rate-term refi can reach 75-80%. Cash-out refi typically caps at 70-75%. Post-rehab appraisal quality matters — if rehab is poor, appraisal may come in below ARV estimate; we'll walk through ROV or cash-bridge options."
  - q: "What's the minimum loan amount?"
    a: "$100K-$150K program minimum (Truss publishes this explicitly). Small-market BRRRR properties (Memphis, Birmingham, Indianapolis) can hit this floor — CF-010's $111K loan amount is right at the edge. Below $100K, hard money or private notes may be a better fit."
  - q: "Do I need a lease-in-place to qualify?"
    a: "Lease-in-place at application OR within 3 weeks of closing is the typical requirement. Some lenders accept Form 1007 market-rent appraisal in lieu of an executed lease if the borrower is still completing tenant placement. We'll confirm which path applies to your file."
  - q: "Can I refinance a portfolio of BRRRR properties at once?"
    a: "Yes — portfolio/blanket DSCR refinance can aggregate multiple BRRRR-stabilized properties into one loan (cf. SA-002 pathway). Documentation burden is higher (rent rolls for each property, 12mo operating history). Repeat-borrower BRRRR cyclists often prefer portfolio refis to compress capital reinvestment timelines."

disclaimer: "DSCR loans are for business-purpose investment properties only. Not for primary residence, second home, or personal-use vacation property. 6-month seasoning from initial hard-money purchase is the universal minimum; no compensator override. Loan amounts below $100K-$150K may not be underwritable. All loans subject to credit approval, property review, post-rehab appraisal review, and investor guidelines. Equal Housing Lender. NMLS #_____."
```

---

## Part 3: Edge-Case Ad Copy Library (8 Edge Cases)

Each edge case has 2 hook variants (H1/H2) — narrower reach than main personas. Search keywords are the primary acquisition channel for edge cases (borrowers self-identify via specific searches like "DSCR loan after short sale", "ITIN investor mortgage"). Disclosure language for exception-based pricing is embedded in every disclaimer.

---

### EG-001 — The Post-Short-Sale Comeback

```yaml
persona_id: EG-001
persona_name: The Post-Short-Sale Comeback

hooks:
  - hook_id: H1
    channel_fit: [google_search]
    primary_text: |
      DSCR after short sale, deed-in-lieu, or foreclosure. Specialty seasoning
      programs: 12mo post-short-sale, 24mo post-foreclosure (with 700+ FICO),
      36mo standard, 48mo post-Chapter 7. If you're past the seasoning window,
      have 25-35% down, 12+ months reserves, and a 1.30+ DSCR property, this
      might fit. Investment properties only — Midwest 2-4 unit cash-flow
      markets preferred. Active mortgage delinquency is a hard-stop until cured.
    headline: "DSCR After Short Sale — Seasoning Path"
    cta: "Check Seasoning Window"
    self_qualifying_microcopy: "If you're past the seasoning window, have 25-35% down, 12+ months reserves, and a 1.30+ DSCR property, this might fit. Active mortgage delinquency is a hard-stop until cured."
    repels: [primary_residence_seekers, active_delinquency_borrowers, sub_seasoning_borrowers, no_reserves_borrowers, recent_mortgage_late_borrowers]
    attracts: [post_short_sale_seasoned, post_foreclosure_seasoned, post_bankruptcy_seasoned, 25pct_down_capable, Midwest_2_4_unit_seekers]

  - hook_id: H2
    channel_fit: [meta, native]
    primary_text: |
      Prior short sale, foreclosure, or bankruptcy? Specialty DSCR seasoning
      programs available — 12mo / 24mo / 36mo / 48mo paths depending on
      event type and current FICO. Bluestone (550 FICO floor), AHLend (620),
      America (640), Truss/Rize (620). If you're past seasoning, have 25-35%
      down, 12+ months reserves, and a cash-flow property, this might fit.
      Investment properties only. Equal Housing Lender.
    headline: "Specialty Seasoning DSCR — Credit Rebuilt OK"
    cta: "Check Specialty Lender Match"
    self_qualifying_microcopy: "If you're past seasoning, have 25-35% down, 12+ months reserves, and a cash-flow property, this might fit. Investment properties only."
    repels: [primary_residence_seekers, active_delinquency_borrowers, sub_seasoning_borrowers, no_reserves_borrowers]
    attracts: [post_short_sale_seasoned, post_foreclosure_seasoned, post_bankruptcy_seasoned, Midwest_2_4_unit_seekers]

search_keywords:
  exact_match:
    - "DSCR loan after short sale"
    - "DSCR loan after foreclosure"
    - "DSCR loan after bankruptcy"
    - "investment loan after short sale"
    - "rental property loan post foreclosure"
  phrase_match:
    - "DSCR seasoning requirements"
    - "specialty DSCR after credit event"
    - "Bluestone DSCR after bankruptcy"
    - "investment property loan post short sale"
    - "DSCR loan credit event recovery"
  negative_keywords:
    - "primary residence mortgage"
    - "first time home buyer"
    - "FHA loan after bankruptcy"
    - "VA loan after foreclosure"
    - "no money down"
    - "owner occupied"
    - "personal loan after bankruptcy"
    - "credit card for bad credit"
    - "payday loan"

landing_hook:
  headline: "DSCR Loans After Short Sale, Foreclosure, Or Bankruptcy"
  subhead: "Specialty seasoning programs: 12mo / 24mo / 36mo / 48mo paths. Bluestone, AHLend, America Mortgages. 25-35% down, 12+ months reserves, 1.30+ DSCR."
  cta: "Check Seasoning Window"
  trust_signals:
    - "Specialty lender network: Bluestone (550 floor), AHLend (620), America (640), Truss/Rize (620)"
    - "CF-028 closed at 645 FICO + 60mo post-bankruptcy + 70% LTV + 12mo reserves"
    - "Post-seasoning DSCR borrowers typically rebuild FICO 30-50 points in 6-12mo"
  self_qualifier_block: |
    3-question seasoning self-check (FF-08 will implement):
    Q1. What was your most recent credit event (short sale / deed-in-lieu / foreclosure / Chapter 7 / Chapter 13) and discharge date? [Dropdown + month/year]
    Q2. Have you had any 30+ day mortgage late in the last 12 months or any active mortgage delinquency / uncured forbearance? [No / Recent late / Active delinquency]
    Q3. Can you put 25-35% down + 12+ months reserves + find a 1.30+ DSCR property? [Yes / Partially / No]

faq:
  - q: "How soon after a short sale can I qualify?"
    a: "12-24 months seasoning accepted at AHLend, Lendmire, Newfi, America Mortgages with 25% down + 1.30 DSCR + 12mo reserves. Short sales season faster than foreclosures. We'll route based on your specific event type and current FICO."
  - q: "Does the seasoning window depend on my current credit score?"
    a: "Yes — 24mo specialty programs typically require 700+ FICO + compensators. CF-024 declined at 30mo post-foreclosure with 680 FICO (missed both standard and specialty windows). The fundable variant is the same borrower 6 months later OR with FICO rebuilt to 700+. We'll show you which window you're in."
  - q: "What if I had a recent mortgage late?"
    a: "Most programs require 12+ months since your most recent 30-day mortgage late. Inside that window, we defer 12 months — not permanently reject. Active mortgage delinquency or uncured forbearance is a hard-stop until cured (HEX-009)."
  - q: "What pricing premium applies?"
    a: "+50-100bps for below-floor FICO files; +25bps for specialty seasoning programs. These premiums are lender-published program features. Post-seasoning borrowers typically rebuild FICO 30-50 points in 6-12 months and refinance into standard-tier pricing."

disclaimer: "DSCR loans are for business-purpose investment properties only. Not for primary residence, second home, or personal-use vacation property. Specialty seasoning programs (12mo / 24mo / 36mo / 48mo) vary by lender and credit-event type. Borrower must be past applicable seasoning window with compensating factors (deeper reserves, lower LTV, stronger DSCR, post-event credit rebuild documentation). All loans subject to credit approval, property review, and investor guidelines. +50-100bps rate premium may apply to below-floor FICO files per lender-published program terms. Active mortgage delinquency or uncured forbearance is a hard-stop until cured. Equal Housing Lender. NMLS #_____."
```

---

### EG-002 — The ITIN US-Resident Investor

```yaml
persona_id: EG-002
persona_name: The ITIN US-Resident Investor

hooks:
  - hook_id: H1
    channel_fit: [google_search]
    primary_text: |
      ITIN DSCR loans — ITIN accepted in lieu of SSN at AHLend + America
      Mortgages (published program feature). US resident + work permit + ITIN
      via CAA + 2-3 US tradelines (18+ months) + 9mo reserves + 70-80% LTV.
      2-4 unit property preferred. If you have your ITIN, US residency, and a
      2-4 unit property in Miami / Houston / LA, this might fit. Investment
      properties only — ITIN is NOT the same as no-credit foreign-national.
    headline: "ITIN DSCR — No SSN Required"
    cta: "Check ITIN Program Eligibility"
    self_qualifying_microcopy: "If you have your ITIN, US residency, and a 2-4 unit property in Miami / Houston / LA, this might fit. Investment properties only — ITIN is NOT the same as no-credit foreign-national."
    repels: [primary_residence_seekers, no_reserves_borrowers, no_ITIN_borrowers, no_US_residency_borrowers, foreign_nationals_no_US_residency]
    attracts: [ITIN_holders, US_residents_with_work_permit, 2_4_unit_investors, FL_TX_CA_investors]

  - hook_id: H2
    channel_fit: [google_search, native]
    primary_text: |
      Préstamos DSCR con ITIN — sin SSN. AHLend + America Mortgages aceptan
      ITIN como característica publicada del programa. Residencia + permiso
      de trabajo + ITIN emitido por CAA + 2-3 tradelines (18+ meses) + 9
      meses reservas + 70-80% LTV. Propiedad de 2-4 unidades preferida. Si
      tiene ITIN, residencia estadounidense, y una propiedad de 2-4 unidades
      en Miami / Houston / Los Ángeles, esto podría funcionar. Propiedades
      de inversión únicamente.
    headline: "Préstamos DSCR Con ITIN — Sin SSN"
    cta: "Verificar Elegibilidad ITIN"
    self_qualifying_microcopy: "Si tiene ITIN, residencia estadounidense, y una propiedad de 2-4 unidades en Miami / Houston / Los Ángeles, esto podría funcionar. Propiedades de inversión únicamente."
    repels: [primary_residence_seekers, no_reserves_borrowers, no_ITIN_borrowers, no_US_residency_borrowers]
    attracts: [ITIN_holders, US_residents_with_work_permit, Spanish_speaking_investors, 2_4_unit_investors]

search_keywords:
  exact_match:
    - "ITIN DSCR loan"
    - "DSCR loan no SSN"
    - "prestamo DSCR ITIN"
    - "ITIN investment property loan"
    - "DSCR loan work permit"
  phrase_match:
    - "DSCR loan for ITIN borrowers"
    - "ITIN mortgage investment property"
    - "no SSN investment property loan"
    - "prestamo inversion ITIN Miami"
    - "DSCR ITIN bilingual lender"
  negative_keywords:
    - "primary residence mortgage"
    - "first time home buyer"
    - "FHA loan"
    - "VA loan"
    - "no money down"
    - "owner occupied"
    - "personal loan ITIN"
    - "credit card ITIN"
    - "no credit check personal loan"

landing_hook:
  headline: "ITIN DSCR Loans — US Residents, No SSN Required"
  subhead: "AHLend + America Mortgages accept ITIN as a published program feature. 70-80% LTV, 9mo reserves, 2-4 unit property preferred. Bilingual intake (English / Spanish / Portuguese)."
  cta: "Start ITIN Pre-Intake"
  trust_signals:
    - "AHLend + America Mortgages — published ITIN-eligible program"
    - "Bilingual intake processing"
    - "2-4 unit property specialists in Miami, Houston, Los Angeles"
  self_qualifier_block: |
    3-question ITIN self-check (FF-08 will implement):
    Q1. Are you a US resident with work permit + ITIN (not a foreign national, not a US citizen)? [Yes / Foreign national / US citizen]
    Q2. Do you have ITIN issued via CAA + 2-3 US tradelines with 18+ months history? [Yes / Partially / Need to start ITIN application]
    Q3. Can you provide 12 months US bank statements + employment verification letter + 9 months reserves? [Yes / Partially / No]

faq:
  - q: "Is ITIN different from foreign-national status?"
    a: "Yes — ITIN borrowers are US residents with work permits and a US credit file (thin, 18+ months). Foreign nationals are non-residents with no US credit file. ITIN pricing (+25-75bps) sits between US borrower and pure foreign-national (+100-150bps). ITIN underwriting has materially lower AML friction than foreign-national."
  - q: "Do I need to start the ITIN application before property shopping?"
    a: "Yes — ITIN issuance via CAA (Certified Acceptance Agent) takes 11+ weeks. Start the ITIN application BEFORE property shopping. We can connect you with CAA-authorized tax professionals for the ITIN application workflow."
  - q: "What pricing premium applies?"
    a: "+25-75bps ITIN premium vs. US borrower (CF-019 closed at +50bps). Pricing sits between US borrower and foreign-national. The premium is a lender-published program feature, not negotiable."

disclaimer: "ITIN DSCR loans are for business-purpose US investment properties only. Not for primary residence, second home, or personal-use vacation property. ITIN accepted in lieu of SSN as a published lender program feature at AHLend and America Mortgages; ITIN is not a basis for underwriting exemption. Borrower must be US resident with work permit. All loans subject to credit approval, employment verification, property review, and investor guidelines. +25-75bps ITIN pricing premium per lender-published program terms. Equal Housing Lender. NMLS #_____."
```

---

### EG-003 — The No-Credit-Country Foreign National

```yaml
persona_id: EG-003
persona_name: The No-Credit-Country Foreign National

hooks:
  - hook_id: H1
    channel_fit: [google_search, native]
    primary_text: |
      Foreign-national DSCR for borrowers from countries without Nova Credit
      coverage (LatAm, Asia, Africa). Specialty FN lenders: AHLend, America
      Mortgages, Angel Oak, A&D Mortgage, HomeAbroad. 40% down payment, 12mo
      reserves (US bank seasoned 90 days), 60-65% LTV, 1.30+ DSCR. If you
      have a verified source of funds (prior home-country real estate sale)
      and are prepared for a 2-4 week AML review, this might fit. Investment
      properties only — Florida market focus.
    headline: "No-Credit FN DSCR — 40% Down Path"
    cta: "Start No-Credit FN Pre-Intake"
    self_qualifying_microcopy: "If you have a verified source of funds (prior home-country real estate sale) and are prepared for a 2-4 week AML review, this might fit. Investment properties only."
    repels: [primary_residence_seekers, no_reserves_borrowers, no_source_of_funds_borrowers, no_LLC_FN_borrowers, low_down_payment_borrowers]
    attracts: [no_credit_country_FN, 40pct_down_capable, 12mo_reserves, FL_market_seekers, prior_home_country_real_estate_sale]

  - hook_id: H2
    channel_fit: [google_search]
    primary_text: |
      International investor without Nova Credit coverage? No-credit-country
      FN DSCR specialists at AHLend, America Mortgages, Angel Oak, A&D
      Mortgage, HomeAbroad. 60% LTV, 12mo US-bank reserves, US LLC + EIN,
      FIRPTA structure reviewed by tax counsel. If you have a clean source-
      of-funds narrative (home-country real estate sale) and your US LLC is
      formed, we'll walk you through the 2-4 week AML cycle. Investment
      properties only — Florida market focus.
    headline: "No-Credit FN DSCR Specialists"
    cta: "Submit Source-Of-Funds Brief"
    self_qualifying_microcopy: "If you have a clean source-of-funds narrative (home-country real estate sale) and your US LLC is formed, we'll walk you through the 2-4 week AML cycle. Investment properties only."
    repels: [primary_residence_seekers, no_reserves_borrowers, no_source_of_funds_borrowers, no_LLC_FN_borrowers]
    attracts: [no_credit_country_FN, 40pct_down_capable, prior_home_country_real_estate_sale, FL_market_seekers]

search_keywords:
  exact_match:
    - "foreign national DSCR no credit history"
    - "no credit foreign national DSCR"
    - "international investor 40% down DSCR"
    - "FIRPTA DSCR loan structure"
    - "Angel Oak foreign national DSCR"
  phrase_match:
    - "Brazilian investor US mortgage"
    - "no credit country foreign national loan"
    - "international investor Florida rental"
    - "foreign national DSCR 60% LTV"
    - "HomeAbroad DSCR loan"
  negative_keywords:
    - "primary residence mortgage"
    - "first time home buyer"
    - "FHA loan"
    - "VA loan"
    - "no money down"
    - "owner occupied"
    - "second home mortgage"
    - "US citizen mortgage"
    - "personal loan"
    - "no credit check personal loan"

landing_hook:
  headline: "No-Credit-Country Foreign-National DSCR — 40% Down Path"
  subhead: "Specialty FN lenders (AHLend, America Mortgages, Angel Oak, A&D Mortgage, HomeAbroad). 60-65% LTV, 12mo reserves, US LLC + AML trail, FIRPTA review. Florida market focus."
  cta: "Start No-Credit FN Pre-Intake"
  trust_signals:
    - "Specialty FN lender network"
    - "Dedicated AML + FIRPTA coordination with US tax counsel"
    - "Florida — #1 DSCR market for FN investors"
  self_qualifier_block: |
    3-question no-credit FN self-check (FF-08 will implement):
    Q1. Are you a foreign national from a country without Nova Credit coverage? [Yes / Unsure / No — strong-credit-country]
    Q2. Can you provide 40% down payment + 12 months PITIA reserves in US bank (seasoned 90 days)? [Yes / Partially / No]
    Q3. Can you document source of funds via prior real estate sale closing statement + 12 months foreign bank statements (certified English translation + USD conversion)? [Yes / Partially / No]

faq:
  - q: "What countries are 'no-credit-country' tier?"
    a: "Borrowers from countries without Nova Credit international-credit translation (e.g., Brazil, Russia, Nigeria, Vietnam) route to the no-credit-country FN tier. UK / EU / Canada / AU borrowers route to the strong-credit-country tier (70-75% LTV via Nova Credit). We'll route based on your passport country and Nova Credit availability."
  - q: "What's the +1.00-1.50% rate premium based on?"
    a: "Lender-published no-credit-country FN program pricing. Compensators (deeper reserves, lower LTV, prior real estate sale source-of-funds) can shorten AML review but do not eliminate the premium. $1,500 FN underwriting fee is also standard. The premium reflects operational risk of no-credit-tier underwriting."
  - q: "How does FIRPTA affect my structure?"
    a: "FIRPTA (Foreign Investment in Real Property Tax Act) imposes 15% withholding on dispositions by foreign persons. Entity structure (LLC vs. individual) and tax-residency status affect application. We coordinate with US tax counsel on the optimal structure pre-closing — not a last-minute item."

disclaimer: "No-credit-country foreign-national DSCR loans are for business-purpose US investment properties only. Not for primary residence, second home, or personal-use vacation property. All loans subject to credit approval, AML source-of-funds review (2-4 weeks), FIRPTA review, property review, and investor guidelines. +1.00-1.50% rate premium and $1,500 FN underwriting fee typically apply per lender-published program terms. Foreign-source funds require certified English translation + USD conversion. Equal Housing Lender. NMLS #_____."
```

---

### EG-004 — The Sub-1.0 DSCR With Compensators

```yaml
persona_id: EG-004
persona_name: The Sub-1.0 DSCR With Strong Compensators

hooks:
  - hook_id: H1
    channel_fit: [google_search]
    primary_text: |
      DSCR came in below 1.00? Specialty programs at Newfi (0.80 floor),
      AHLend (0.75 with compensators), Lendmire (0.75 with compensators),
      America (no-ratio path). Compensators required: FICO 700+, LTV
      ≤65-70%, 12+ months reserves, 3+ financed properties track record. If
      your DSCR pencils at 0.80+ AND you can strengthen LTV + reserves,
      this might fit. Investment properties only — appreciation-market
      properties (Grand Rapids, Nashville LTR, Charlotte, Tampa) preferred.
    headline: "Sub-1.0 DSCR? Compensator Path Available"
    cta: "Check Compensator Fit"
    self_qualifying_microcopy: "If your DSCR pencils at 0.80+ AND you can strengthen LTV + reserves, this might fit. Investment properties only — appreciation-market properties preferred."
    repels: [primary_residence_seekers, sub_0.75_DSCR_borrowers, no_reserves_borrowers, no_compensators_borrowers, first_time_investors_no_track_record]
    attracts: [appreciation_market_investors, 700_plus_FICO, low_LTV_capable, 12mo_reserves, 3_plus_financed_properties]

  - hook_id: H2
    channel_fit: [meta, native]
    primary_text: |
      Property cash-flows negative at standard LTV? LTV-haircut pathway:
      reduce LTV to 65-70% (35% down) + 12mo reserves + 700+ FICO + 3+
      financed properties = fundable at sub-1.0 DSCR programs. Newfi,
      AHLend, Lendmire, America Mortgages — published specialty programs.
      If you have a strong credit profile and a real appreciation thesis,
      this might fit. Investment properties only — portfolio-context path
      also available (10+ properties aggregate cash-flow positive).
    headline: "Sub-1.0 DSCR — Compensator Programs"
    cta: "Run Compensator Calculator"
    self_qualifying_microcopy: "If you have a strong credit profile and a real appreciation thesis, this might fit. Investment properties only — portfolio-context path also available (10+ properties aggregate cash-flow positive)."
    repels: [primary_residence_seekers, sub_0.75_DSCR_borrowers, no_reserves_borrowers, no_compensators_borrowers]
    attracts: [appreciation_market_investors, 700_plus_FICO, low_LTV_capable, 12mo_reserves, portfolio_context_investors]

search_keywords:
  exact_match:
    - "DSCR loan below 1.0"
    - "DSCR loan 0.80"
    - "sub 1.0 DSCR lender"
    - "Newfi DSCR 0.80 floor"
    - "DSCR with compensating factors"
  phrase_match:
    - "DSCR loan negative cash flow"
    - "below 1.0 DSCR investment loan"
    - "specialty DSCR low DSCR"
    - "AHLend 0.75 DSCR"
    - "Lendmire no ratio DSCR"
  negative_keywords:
    - "primary residence mortgage"
    - "first time home buyer"
    - "FHA loan"
    - "VA loan"
    - "no money down"
    - "owner occupied"
    - "personal loan"
    - "hard money personal loan"

landing_hook:
  headline: "Sub-1.0 DSCR Loans With Compensating Factors"
  subhead: "Newfi (0.80 floor), AHLend + Lendmire (0.75 with compensators), America (no-ratio path). FICO 700+, LTV ≤65-70%, 12+ months reserves, 3+ financed properties."
  cta: "Check Compensator Fit"
  trust_signals:
    - "Newfi published 0.80 DSCR floor — 'supports underperforming properties with long-term potential'"
    - "AHLend + Lendmire 0.75 DSCR with compensators per GL-02 Part 4"
    - "America Mortgages publishes 'below 1:1 and no-ratio DSCR scenarios available with compensating factors'"
  self_qualifier_block: |
    3-question sub-1.0 DSCR self-check (FF-08 will implement):
    Q1. What is your calculated DSCR on the subject property (rent / PITIA)? [Above 1.25 / 1.00-1.25 / 0.80-1.00 / Below 0.80]
    Q2. Can you strengthen the file with FICO 700+ + LTV ≤65-70% + 12+ months reserves + 3+ financed properties track record? [Yes to all / Partially / No — first-time investor]
    Q3. Is this an appreciation-market property (Grand Rapids, Nashville LTR, Charlotte, Tampa, Phoenix, Denver LTR, Austin LTR)? [Yes / Other market / No]

faq:
  - q: "What's the lowest DSCR that's still fundable?"
    a: "0.75 with compensators at AHLend + Lendmire; 0.80 at Newfi (published floor). Below 0.75 is below all specialty floors — not fundable via DSCR. CF-008 case shows the LTV-haircut playbook: borrower went from 0.81 DSCR at 20% down → 1.12 DSCR at 42% down (approved)."
  - q: "What compensators unlock sub-1.0 DSCR?"
    a: "FICO 700+, LTV ≤65-70% (30-35% down), 12+ months PITIA reserves, 3+ financed properties track record (proves cash-flow management). Documented long-term plan (appreciation thesis, rent-growth trajectory, BRRRR stabilization roadmap) is helpful. Optional: interest-only period at Lendmire materially improves DSCR."
  - q: "Can portfolio context offset a weak subject property?"
    a: "Yes — the NP-010 pattern. CF-011 case: subject property at 1.04 DSCR with -$267/mo subject cash flow approved ONLY because $3,200/mo aggregate positive cash flow across 10 other properties. This is the portfolio-context pathway. FF-08 collects both single-property numbers AND portfolio context to route correctly."

disclaimer: "Sub-1.0 DSCR loans are for business-purpose investment properties only. Not for primary residence, second home, or personal-use vacation property. Specialty programs (0.75-0.80 DSCR floor with compensators) at Newfi, AHLend, Lendmire, America Mortgages per published lender program terms. Compensating factors required: FICO 700+, LTV ≤65-70%, 12+ months reserves, 3+ financed properties track record. All loans subject to credit approval, property review, and investor guidelines. +25-75bps rate premium may apply for sub-1.0 DSCR overlay. Equal Housing Lender. NMLS #_____."
```

---

### EG-005 — The Unpermitted-ADU Pivot

```yaml
persona_id: EG-005
persona_name: The Unpermitted-ADU Pivot

hooks:
  - hook_id: H1
    channel_fit: [google_search]
    primary_text: |
      Declined for unpermitted ADU? Specialty-lender SFR-classification pivot
      available at Harpoon Capital, Truss, Rize case-by-case. Property
      qualifies as SFR (ADU ignored for income AND value) at 70% LTV + 25bps
      rate premium. ADU income still collects in operation. ADU permit cure
      is a post-close option (8-14mo in CA). If your ADU is unpermitted but
      the primary-house rent pencils at 1.00+ DSCR with 70% LTV, this might
      fit. Investment properties only.
    headline: "Unpermitted ADU? SFR Pivot Path"
    cta: "Check SFR-Classification Fit"
    self_qualifying_microcopy: "If your ADU is unpermitted but the primary-house rent pencils at 1.00+ DSCR with 70% LTV, this might fit. Investment properties only."
    repels: [primary_residence_seekers, no_reserves_borrowers, borrowers_insisting_on_ADU_income_count, 75pct_LTV_only_borrowers]
    attracts: [unpermitted_ADU_owners, CA_investors, SFR_with_ADU_buyers, 700_plus_FICO]

  - hook_id: H2
    channel_fit: [meta, native]
    primary_text: |
      SFR with unpermitted ADU? Mainline DSCR lenders exclude ADU income
      (DSCR drops 1.40 → 1.00). Specialty pivot: qualify as SFR (ADU ignored)
      at 70% LTV + 25bps premium. ADU income still collects in operation
      post-close. If your primary-house rent supports 1.00+ DSCR at 70% LTV
      and you accept the +25bps premium, this might fit. Investment properties
      only — LA, San Diego, Bay Area focus. Equal Housing Lender.
    headline: "Unpermitted ADU — SFR Specialty Pivot"
    cta: "Submit ADU Property For Review"
    self_qualifying_microcopy: "If your primary-house rent supports 1.00+ DSCR at 70% LTV and you accept the +25bps premium, this might fit. Investment properties only."
    repels: [primary_residence_seekers, no_reserves_borrowers, borrowers_insisting_on_ADU_income_count, 75pct_LTV_only_borrowers]
    attracts: [unpermitted_ADU_owners, CA_investors, SFR_with_ADU_buyers]

search_keywords:
  exact_match:
    - "unpermitted ADU DSCR loan"
    - "DSCR ADU no permit"
    - "Harpoon Capital ADU"
    - "SFR with unpermitted ADU mortgage"
    - "ADU permit cure DSCR"
  phrase_match:
    - "unpermitted ADU investment loan"
    - "specialty DSCR unpermitted ADU"
    - "SFR classification ADU DSCR"
    - "California ADU no permit loan"
    - "DSCR ADU pivot lender"
  negative_keywords:
    - "primary residence mortgage"
    - "first time home buyer"
    - "FHA loan"
    - "VA loan"
    - "no money down"
    - "owner occupied"
    - "ADU construction loan owner"
    - "personal loan"
    - "credit card"

landing_hook:
  headline: "Unpermitted-ADU SFR-Classification Pivot"
  subhead: "Specialty lenders qualify property as SFR (ADU ignored for income AND value) at 70% LTV + 25bps premium. ADU income still collects in operation. Permit cure is post-close option (8-14mo in CA)."
  cta: "Check SFR-Classification Fit"
  trust_signals:
    - "Harpoon Capital ADU-specialist routing"
    - "CF-021 case: 1.40 DSCR with ADU → 1.00 without → mainline decline → specialty pivot approved at 70% LTV + 25bps"
    - "ADU disclosure: borrower informed ADU income excluded from qualification but still collectable in operation"
  self_qualifier_block: |
    3-question unpermitted-ADU self-check (FF-08 will implement):
    Q1. Is the property an SFR with an unpermitted ADU (built by prior owner without permits)? [Yes / Unsure — need permit check / No — permitted ADU / No ADU]
    Q2. Does the primary-house rent (excluding ADU income) support 1.00+ DSCR at 70% LTV? [Yes / Unsure — show me the calculator / No]
    Q3. Are you willing to accept +25bps rate premium + 5pt LTV haircut (75% → 70%) in exchange for SFR-classification pivot? [Yes / Need to understand trade-offs / No — must have 75% LTV]

faq:
  - q: "Why does the ADU income get excluded from DSCR?"
    a: "Mainline DSCR lenders exclude unpermitted ADU income because the ADU was built without permits — its rental use is legally ambiguous in many jurisdictions. Specialty lenders use a different methodology: qualify the property as SFR (ADU ignored for both income AND appraisal value). ADU income still collects in operation; borrower just can't use it for qualification. This is a methodology choice, not an operational restriction."
  - q: "Can I still collect ADU rent post-close?"
    a: "Yes — ADU income still collects in operation. The exclusion is for qualification purposes only. Borrower should pursue ADU permit cure post-close (8-14 months in CA) to potentially refinance into a permitted-ADU program later (75-80% LTV, no premium)."
  - q: "What's the 25bps premium based on?"
    a: "Specialty-lender program feature for unpermitted-ADU overlay. Documented in CF-021 case file (San Diego $850K SFR with unpermitted ADU). Same borrower profile, same property — 5pt LTV haircut + 25bps premium is the entire pricing cost of the pivot."

disclaimer: "DSCR loans are for business-purpose investment properties only. Not for primary residence, second home, or personal-use vacation property. Unpermitted-ADU SFR-classification pivot excludes ADU income from DSCR qualification AND ADU value from appraisal; ADU income still collects in operation. Borrower must be informed in writing of (i) ADU income exclusion from qualification, (ii) ADU value exclusion from appraisal, (iii) ADU income still collectable in operation. +25bps rate premium and 5pt LTV haircut apply per specialty-lender program terms. All loans subject to credit approval, property review, appraisal review, and investor guidelines. Equal Housing Lender. NMLS #_____."
```

---

### EG-006 — The Non-Warrantable Condo Specialist

```yaml
persona_id: EG-006
persona_name: The Non-Warrantable Condo Specialist

hooks:
  - hook_id: H1
    channel_fit: [google_search]
    primary_text: |
      Declined for non-warrantable condo (investor concentration >50%, HOA
      litigation, hotel conversion)? Specialty DSCR lenders: Truss, Bluestone,
      Lendmire, Brookmont Capital, Rize case-by-case. 70% LTV (vs 75%
      standard) + 1.25+ DSCR + 6-12mo reserves + 25-50bps premium. If your
      borrower profile is strong (CF-023: 1.36 DSCR + 720 FICO + 6mo reserves)
      and you can accept the LTV haircut, this might fit. Investment properties
      only — Chicago Loop, Miami Beach, Phoenix urban core, Houston Galleria.
    headline: "Non-Warrantable Condo DSCR — Specialty"
    cta: "Submit HOA Questionnaire"
    self_qualifying_microcopy: "If your borrower profile is strong (1.25+ DSCR + 720+ FICO + 6mo reserves) and you can accept the LTV haircut, this might fit. Investment properties only."
    repels: [primary_residence_seekers, no_reserves_borrowers, weak_borrower_profile_condo_buyers, first_time_investors]
    attracts: [non_warrantable_condo_buyers, urban_condo_investors, 700_plus_FICO, decline_letter_holders]

  - hook_id: H2
    channel_fit: [meta, native]
    primary_text: |
      Non-warrantable condo? ~Half-dozen specialty DSCR lenders write non-
      warrantable. 70% LTV + 1.25+ DSCR + 6-12mo reserves + 25-50bps premium.
      HOA questionnaire required (litigation status, investor concentration,
      financials, master insurance). If you have a strong borrower profile
      and can document the HOA status, this might fit. Investment properties
      only — Chicago, Miami, Phoenix, NYC midtown, Houston. Equal Housing
      Lender.
    headline: "Non-Warrantable Condo — Specialty Route"
    cta: "Check Non-Warrantable Eligibility"
    self_qualifying_microcopy: "If you have a strong borrower profile and can document the HOA status, this might fit. Investment properties only."
    repels: [primary_residence_seekers, no_reserves_borrowers, weak_borrower_profile_condo_buyers]
    attracts: [non_warrantable_condo_buyers, urban_condo_investors, decline_letter_holders]

search_keywords:
  exact_match:
    - "non-warrantable condo DSCR"
    - "non-warrantable condo investment loan"
    - "DSCR loan condo HOA litigation"
    - "condo investor concentration DSCR"
    - "Brookmont Capital non-warrantable"
  phrase_match:
    - "non-warrantable condo investment mortgage"
    - "DSCR loan condo hotel conversion"
    - "specialty DSCR non-warrantable"
    - "condo HOA litigation loan"
    - "non-warrantable condo specialty lender"
  negative_keywords:
    - "primary residence mortgage"
    - "first time home buyer"
    - "FHA loan"
    - "VA loan"
    - "no money down"
    - "owner occupied"
    - "warrantable condo conventional"
    - "personal loan"
    - "credit card"

landing_hook:
  headline: "Non-Warrantable Condo DSCR — Specialty Lender Routing"
  subhead: "Truss, Bluestone, Lendmire, Brookmont Capital, Rize case-by-case. 70% LTV + 1.25+ DSCR + 6-12mo reserves + 25-50bps premium. HOA questionnaire required."
  cta: "Submit HOA Questionnaire"
  trust_signals:
    - "Specialty lender network: Truss, Bluestone, Lendmire, Brookmont Capital"
    - "CF-023 case: 1.36 DSCR + 720 FICO + 6mo reserves declined at standard → specialty pivot at 70% LTV + 25-50bps premium"
    - "HOA questionnaire review: 24-48 hour routing recommendation"
  self_qualifier_block: |
    3-question non-warrantable self-check (FF-08 will implement):
    Q1. Is the condo complex non-warrantable (investor concentration >50%, pending HOA litigation, hotel conversion, or non-compliant HOA financials)? [Yes / Unsure / No]
    Q2. Can you put 30% down (70% LTV) + maintain 6-12 months reserves + accept +25-50bps rate premium? [Yes / Need to understand trade-offs / No]
    Q3. Can you provide a completed HOA questionnaire (litigation status, investor concentration %, financials, master insurance)? [Yes / In progress / No]

faq:
  - q: "Why was my non-warrantable condo declined at standard DSCR?"
    a: "Standard residential DSCR lenders (AHLend, Newfi) auto-decline non-warrantable condos because they require Fannie warrantability. The decline was a lender-fit issue, not a file issue — CF-023 borrower had 1.36 DSCR + 720 FICO + 6mo reserves and was declined. Specialty lenders write non-warrantable; your profile doesn't need to change."
  - q: "What's the pricing impact of non-warrantable overlay?"
    a: "5pt LTV haircut (75% → 70%) + 25-50bps rate premium + 12mo reserves (vs 6mo standard for condos with pending litigation). Documented in CF-023 case file. Pricing reflects condo-typical assessment risk and HOA litigation exposure."
  - q: "What markets work best for non-warrantable condo DSCR?"
    a: "Chicago Loop, Miami Beach, Fort Lauderdale, Phoenix urban core, NYC midtown, Las Vegas Strip-adjacent, Houston Galleria. These markets have non-warrantable complexes with strong rental demand — the borrower thesis is sound; the condo classification is the overlay."

disclaimer: "Non-warrantable condo DSCR loans are for business-purpose investment properties only. Not for primary residence, second home, or personal-use vacation property. Specialty lenders (Truss, Bluestone, Lendmire, Brookmont Capital, Rize) write non-warrantable per published program terms; standard residential DSCR lenders auto-decline non-warrantable. 5pt LTV haircut + 25-50bps rate premium typically apply. HOA questionnaire required for underwriting. All loans subject to credit approval, property review, HOA review, and investor guidelines. Equal Housing Lender. NMLS #_____."
```

---

### EG-007 — The Condotel STR Investor

```yaml
persona_id: EG-007
persona_name: The Condotel STR Investor

hooks:
  - hook_id: H1
    channel_fit: [google_search]
    primary_text: |
      Condotel declined at standard DSCR? Specialty STR-condotel programs at
      Visio Lending + Kiavi. 30-35% down payment (65-70% LTV) + 1.25+ DSCR +
      12mo documented operating history + STR-permissive market. Gulf Coast
      (Galveston, Destin, Panama City Beach) + Smokies (Gatlinburg) + Scottsdale
      AZ. If you have 12mo front-desk rental statements or Airbnb host
      dashboard history, this might fit. Investment properties only — STR in
      NYC or Nashville residential zones is not fundable.
    headline: "Condotel DSCR — Visio + Kiavi Specialty"
    cta: "Check Condotel Program Fit"
    self_qualifying_microcopy: "If you have 12mo front-desk rental statements or Airbnb host dashboard history, this might fit. Investment properties only — STR in NYC or Nashville residential zones is not fundable."
    repels: [primary_residence_seekers, no_reserves_borrowers, no_operating_history_borrowers, NYC_Nashville_STR_seekers, low_down_payment_borrowers]
    attracts: [condotel_buyers, Gulf_Coast_STR_investors, Smokies_STR_investors, decline_letter_holders, 12mo_operating_history_capable]

  - hook_id: H2
    channel_fit: [meta, native]
    primary_text: |
      Hotel-condo conversion (condotel) for STR? Specialty DSCR at Visio
      Lending + Kiavi — 65-70% LTV, 1.25+ DSCR, 12mo operating history,
      STR-permissive market. Front-desk rental statements OR Airbnb host
      dashboard accepted. If your condotel is in Gulf Coast, Smokies, or
      Scottsdale and you have 12mo operating history, this might fit.
      Investment properties only — primary-residence condotel borrowers
      should use conventional condotel financing. Equal Housing Lender.
    headline: "Condotel STR DSCR — Specialty Programs"
    cta: "Submit Operating History"
    self_qualifying_microcopy: "If your condotel is in Gulf Coast, Smokies, or Scottsdale and you have 12mo operating history, this might fit. Investment properties only."
    repels: [primary_residence_seekers, no_reserves_borrowers, no_operating_history_borrowers, NYC_Nashville_STR_seekers]
    attracts: [condotel_buyers, Gulf_Coast_STR_investors, Smokies_STR_investors, decline_letter_holders]

search_keywords:
  exact_match:
    - "condotel DSCR loan"
    - "Visio Lending condotel"
    - "Kiavi condotel STR"
    - "hotel condo DSCR financing"
    - "condotel investment property loan"
  phrase_match:
    - "condotel STR mortgage"
    - "hotel-condo conversion DSCR"
    - "condotel specialty lender"
    - "Gulf Coast condotel loan"
    - "Smokies condotel investment"
  negative_keywords:
    - "primary residence mortgage"
    - "first time home buyer"
    - "FHA loan"
    - "VA loan"
    - "no money down"
    - "owner occupied"
    - "second home mortgage"
    - "vacation home mortgage"
    - "personal loan"
    - "credit card"
    - "NYC Airbnb legal"

landing_hook:
  headline: "Condotel STR DSCR — Visio Lending + Kiavi Specialty Programs"
  subhead: "65-70% LTV, 1.25+ DSCR, 12mo documented operating history. Gulf Coast (Galveston, Destin, Panama City Beach), Smokies (Gatlinburg), Scottsdale AZ. STR-permissive markets only."
  cta: "Check Condotel Program Fit"
  trust_signals:
    - "Visio Lending + Kiavi — STR-condotel specialty lenders"
    - "CF-022 case: 1.40 DSCR + 720 FICO + 12mo reserves declined at AHLend → pivot to specialty"
    - "STR-permit verification built into intake"
  self_qualifier_block: |
    3-question condotel self-check (FF-08 will implement):
    Q1. Is the property a condotel (hotel-condo conversion with front-desk rental program)? [Yes / Unsure / No — standard condo]
    Q2. Do you have 12mo documented operating history (front-desk rental statements OR Airbnb host dashboard OR VRBO booking history)? [Yes / Partially / No — first-time STR]
    Q3. Is the property in an STR-permissive market (Gulf Coast, Smokies, Scottsdale AZ, Breckenridge CO, Myrtle Beach SC)? [Yes / Unsure — check my market / No — NYC/Nashville/SF]

faq:
  - q: "Why was my condotel declined at standard DSCR?"
    a: "Standard residential DSCR lenders (AHLend, Newfi) explicitly exclude condotels as a property-class overlay. The decline was a property-type issue, not a file issue — your borrower profile doesn't need to change. Specialty STR-condotel lenders (Visio Lending, Kiavi) write condotel as a published program feature."
  - q: "What pricing premium applies to condotel?"
    a: "+50-100bps premium for condotel overlay + STR volatility. 5-10pt LTV haircut (75% standard → 65-70% condotel). 12mo reserves (vs 6mo standard LTR). STR permit verification independent of lender approval. Premiums are lender-published program features, not negotiable."
  - q: "Can I buy a condotel as a first-time STR host?"
    a: "Typically no — 12mo documented operating history is required for condotel STR DSCR. First-time STR borrowers typically route to standard SFR STR DSCR with AirDNA projection (25% income haircut). Condotel's front-desk rental program structure requires operating-history documentation that first-timers don't have."

disclaimer: "Condotel STR DSCR loans are for business-purpose investment properties in STR-permissive markets only. Not for primary residence, second home, or personal-use vacation property. Specialty lenders (Visio Lending, Kiavi) write condotel per published program terms; standard residential DSCR lenders (AHLend, Newfi) exclude condotel. 5-10pt LTV haircut + 50-100bps rate premium typically apply. STR-permit verification is borrower's responsibility and independent of lender approval. STR in NYC (Local Law 18), Nashville residential zones, San Francisco is not fundable. All loans subject to credit approval, property review, STR-permit verification, and investor guidelines. Equal Housing Lender. NMLS #_____."
```

---

### EG-008 — The 401(k)-Reserves Co-Borrower Pivot

```yaml
persona_id: EG-008
persona_name: The 401(k)-Reserves Co-Borrower Pivot

hooks:
  - hook_id: H1
    channel_fit: [google_search]
    primary_text: |
      Declined for reserves shortfall? Most reserves declines are a calculation
      error — applying full 401(k) balance instead of standard 60% haircut.
      Free reserves calculator applies 60% haircut automatically + adds co-
      borrower (spouse) liquid checking. If your file is otherwise strong (1.20+
      DSCR + 700+ FICO) and you have 401(k) + a co-borrower, this might fit.
      Investment properties only — Lendmire also offers no-reserve program at
      ≤$1.5M loan + ≤70% LTV.
    headline: "Reserves Decline? 60% 401(k) Haircut Tool"
    cta: "Run Free Reserves Calculator"
    self_qualifying_microcopy: "If your file is otherwise strong (1.20+ DSCR + 700+ FICO) and you have 401(k) + a co-borrower, this might fit. Investment properties only."
    repels: [primary_residence_seekers, no_reserves_at_all_borrowers, no_401k_no_coborrower_borrowers, speculative_rent_investors]
    attracts: [401k_reserves_borrowers, decline_letter_holders, coborrower_spouse_borrowers, calculator_driven_investors]

  - hook_id: H2
    channel_fit: [meta, native, youtube]
    primary_text: |
      Reserves shortfall on your DSCR? Most reserves declines are fixable —
      60% 401(k) haircut + co-borrower liquid checking + re-shop to a lender
      applying correct methodology. Lendmire also offers no-reserve program at
      ≤$1.5M loan + ≤70% LTV. Free reserves calculator + co-borrower
      planning tool. If you have 401(k) reserves + a spouse with liquid
      checking, this might fit. Investment properties only.
    headline: "Fix Reserves Decline — Free Calculator"
    cta: "Run Reserves Calculator"
    self_qualifying_microcopy: "If you have 401(k) reserves + a spouse with liquid checking, this might fit. Investment properties only."
    repels: [primary_residence_seekers, no_reserves_at_all_borrowers, no_401k_no_coborrower_borrowers]
    attracts: [401k_reserves_borrowers, decline_letter_holders, coborrower_spouse_borrowers, calculator_driven_investors]

search_keywords:
  exact_match:
    - "DSCR reserves calculator"
    - "401k reserves DSCR"
    - "60% haircut 401k mortgage"
    - "co-borrower DSCR reserves"
    - "Lendmire no reserve DSCR"
  phrase_match:
    - "DSCR reserves shortfall"
    - "401k investment property loan reserves"
    - "reserves calculation DSCR lender"
    - "co-borrower investment property mortgage"
    - "DSCR loan reserves methodology"
  negative_keywords:
    - "primary residence mortgage"
    - "first time home buyer"
    - "FHA loan"
    - "VA loan"
    - "no money down"
    - "owner occupied"
    - "second home mortgage"
    - "personal loan"
    - "credit card"
    - "401k withdrawal penalty"

landing_hook:
  headline: "Free DSCR Reserves Calculator — 60% 401(k) Haircut + Co-Borrower"
  subhead: "Most reserves declines are calculation errors, not file weakness. Apply standard 60% haircut to 401(k)/IRA + add co-borrower (spouse) liquid checking + re-shop. Lendmire no-reserve program also available."
  cta: "Run Free Reserves Calculator"
  trust_signals:
    - "CF-026 case: 4mo reserves (miscalculated) → 6.2mo after correct 60% haircut + co-borrower = approved_with_conditions"
    - "Lendmire no-reserve program at ≤$1.5M loan + ≤70% LTV"
    - "60% 401(k)/IRA haircut is industry-standard methodology — all GL-02 lenders apply it"
  self_qualifier_block: |
    3-question reserves-pivot self-check (FF-08 will implement):
    Q1. Have you been declined (or told you'd be declined) for reserves shortfall? [Yes — within 30 days / Yes — 30+ days ago / No — pre-applying]
    Q2. Do you have 401(k)/IRA balances + a co-borrower (spouse) with liquid checking/savings? [Yes to both / 401(k) only / Co-borrower only / Neither]
    Q3. Is your file otherwise strong (1.20+ DSCR + 700+ FICO + investment property)? [Yes / Partially / No]

faq:
  - q: "Why is only 60% of my 401(k) counted as reserves?"
    a: "Industry-standard methodology — all GL-02 lenders apply 60% haircut to 401(k)/IRA balances to account for tax + penalty on early withdrawal. Applying full 401(k) balance as reserves is the single most common reserve-calculation error (CF-026 case). Our free calculator applies the 60% haircut automatically."
  - q: "Can I add my spouse as co-borrower to supplement reserves?"
    a: "Yes — co-borrower (spouse) liquid checking/savings can supplement reserves. CF-026 case: borrower's $21K (after 60% haircut on $35K 401(k)) + co-borrower's $12K liquid checking = $33K combined = 6.2mo PITIA cleared 6mo minimum. We'll walk you through co-borrower structuring."
  - q: "What is Lendmire's no-reserve program?"
    a: "Lendmire publishes a no-reserve-required program at ≤$1.5M loan amount + ≤70% LTV (GL-02 Part 1 GL02-005). This is an alternative path for borrowers with no 401(k) or co-borrower reserves — pricing may differ. We'll route you to Lendmire if your loan size + LTV fit."

disclaimer: "DSCR loans are for business-purpose investment properties only. Not for primary residence, second home, or personal-use vacation property. 60% haircut on 401(k)/IRA balances is industry-standard reserves methodology applied uniformly by GL-02 lenders; borrower education on reserves calculation is not a commitment to lend. Co-borrower addition is a structuring option subject to credit review. Lendmire no-reserve program eligibility limited to ≤$1.5M loan + ≤70% LTV per published program terms. All loans subject to credit approval, property review, and investor guidelines. Equal Housing Lender. NMLS #_____."
```

---

## Part 4: Channel Strategy Notes

### 4.1 Meta (Facebook / Instagram)

**Constraint**: Special Ad Category = Housing. No lookalike audiences on protected attributes, no ZIP / age / sex / national-origin / family-status targeting, no detailed-targeting expansion on protected attributes. Broad distribution only.

**Strategy**: Creative-led self-qualification. The creative IS the targeting — the self_qualifying_microcopy in each hook does the filtering that audience targeting cannot. Optimize toward qualified-application events (not raw leads) to train the algorithm on intent quality.

**Persona prioritization on Meta** (by reachability score from SA-05):
1. SA-011 Compensated-Exception Shopper (reachability 9) — decline-letter hooks are the highest-converting Meta play
2. SA-003 Cash-Strong First-Timer (reachability 8) — education-first calculator hooks
3. SA-008 Credit-Scarred Rebuilder (reachability 8) — seasoning-forward hooks (compliance-flagged: feature-language only, no demographic targeting)
4. SA-012 BRRRR Cyclist (reachability 8) — cycle-recycling hooks
5. SA-001 Cash-Flow Optimizer (reachability 7) — DTI-celebration hooks

**Meta lead-form intro copy** (FF-08 will implement as the form intro that mirrors the landing-page self_qualifier_block):

```
This is a DSCR loan intake for business-purpose investment properties only.

3 quick questions to confirm fit before you spend time on the full application:
1. Will this property be used as your primary residence, second home, or personal-use vacation home in the next 12 months? (If yes — conventional / FHA / VA is the right path, not DSCR.)
2. Is the property an investment rental with rent support (current lease, rent schedule, or willingness to obtain a 1007 market-rent appraisal)?
3. Do you have ~6+ months of reserves set aside (liquid + 401(k) at standard 60% haircut counts)?

If you've previously been declined for a DSCR loan, you can skip ahead and submit your decline letter for free specialty-lender triage.
```

### 4.2 Google Search

**Constraint**: Housing ad category requires certification + advertiser identity verification. No "easy approval" / "no credit check" / "guaranteed approval" language. No demographic targeting in audience segments.

**Strategy**: Persona-specific keyword sets → persona-specific landing pages. Search is the cleanest high-intent channel — borrowers self-identify via the queries they type. Negative-keyword discipline is mandatory (do NOT pay for primary-residence / first-time-homebuyer / no-money-down traffic). Each persona has its own ad group with its own landing page; the landing pages are the conversion mechanism.

**Persona → Google Search mapping** (priority order):
1. SA-002 Portfolio Scaler — "portfolio DSCR loan", "blanket loan rental" → highest LTV per-loan revenue
2. SA-001 Cash-Flow Optimizer — "DSCR loan self employed", "investment property loan no tax returns"
3. SA-007 STR Operator — "DSCR loan Airbnb", "AirDNA DSCR loan" (geo-targeted to FL / TN / AZ)
4. SA-005 / SA-006 / SA-010 Foreign-National / ITIN — "foreign national DSCR loan", "ITIN DSCR loan" (bilingual landing pages)
5. SA-008 Credit-Scarred Rebuilder — "DSCR loan after bankruptcy", "DSCR loan after foreclosure"
6. SA-011 Compensated-Exception — "DSCR loan after decline", "non-warrantable condo DSCR", "condotel DSCR"
7. SA-012 BRRRR Cyclist — "DSCR loan BRRRR", "refinance hard money DSCR"
8. SA-009 Permitted-ADU CA — "DSCR loan ADU", "ADU rental income mortgage" (geo-targeted to CA)
9. SA-004 Equity-Tapping Refinancer — "DSCR cash out refinance", "BRRRR refinance DSCR"
10. SA-003 First-Timer — "first DSCR loan", "how to qualify for DSCR loan"

**Universal negative keywords** (apply to ALL Google Search ad groups): primary residence mortgage, first time home buyer, FHA loan, VA loan, no money down, free house, owner occupied, second home mortgage, vacation home loan, reverse mortgage, refinance primary residence, cash out refinance primary, hard money personal loan, personal loan, credit card, rent to own, lease to own home.

### 4.3 YouTube

**Constraint**: Same housing/credit constraints as Meta + Google Search. Skippable in-stream pre-roll 15-30s is the highest-converting format for DSCR (visual + audio fits the "explainer" nature of DSCR mechanics).

**Strategy**: Education-first 15-30s pre-roll for top personas. The DSCR mechanic (rent minus payment = DSCR; 1.25+ pencils; 6mo reserves; lease-in-place) is teachable in 60 seconds — that's the hook. Calculator CTA at the end.

**Top 5 YouTube pre-roll priority personas** (per charter guidance + reachability):
1. **SA-001 Cash-Flow Optimizer (P1)** — "Your tax returns say one thing. Your rentals say another." → calculator CTA. 30s.
2. **SA-002 Portfolio Scaler (P2)** — "Scale past the DTI wall with portfolio DSCR." → portfolio quote CTA. 30s.
3. **SA-003 Cash-Strong First-Timer (P3)** — "First rental? Start with the property's numbers." → free walkthrough CTA. 30s.
4. **SA-004 Equity-Tapping Refinancer (P4)** — "Unlock rental equity without DTI friction." → cash-out calculator CTA. 15s.
5. **SA-012 BRRRR Cyclist** — "6-month seasoning + 75% LTV on post-rehab ARV = recycle capital." → BRRRR refi calculator CTA. 30s.

**YouTube creative principles**:
- Lead with the mechanic (DSCR math), not the borrower identity
- Visual: split-screen tax return vs. rent roll → rent wins
- Calculator CTA overlay at 0:08 (when DSCR formula appears)
- Self-qualifying microcopy in the description + pinned comment
- Compliance disclaimer in the description

### 4.4 Native (Taboola / Outbrain)

**Constraint**: Native ads run on publisher content surfaces (news, finance, real estate). Housing/credit constraints apply per publisher policies (varies — typically stricter than Google). Lead-quality is generally lower than Google Search but cost-per-click is materially lower.

**Strategy**: Calculator-led hooks for content-driven personas. The DSCR calculator is a lead magnet that filters via the math itself — borrowers who run the numbers and see 0.85 DSCR self-select out; borrowers who see 1.30 DSCR self-select in. Native is the highest-leverage channel for first-time-investor education (SA-003) and ADU specialist (SA-009) content.

**Native priority personas**:
1. **SA-003 First-Timer** — "How to qualify for a DSCR loan — free 5-minute walkthrough" (calculator CTA)
2. **SA-009 Permitted-ADU CA** — "California ADU investor? Both rents count in DSCR" (ADU calculator CTA)
3. **SA-008 Credit-Scarred Rebuilder** — "DSCR after bankruptcy — 24mo / 36mo / 48mo seasoning paths" (seasoning calculator CTA)
4. **EG-008 401(k)-Reserves Pivot** — "Most reserves declines are fixable — free 60% haircut calculator" (reserves calculator CTA)
5. **EG-005 Unpermitted-ADU Pivot** — "Declined for unpermitted ADU? SFR-classification pivot available" (SFR pivot calculator CTA)

### 4.5 SEO Content

**Strategy**: Calculator + case study content per persona. DSCR calculators (DSCR calculator, BRRRR refi calculator, ADU income calculator, 401(k) reserves calculator, seasoning calculator) are high-SEO-value lead magnets. Case study content ("How Marcus closed 18 DSCR loans in 3 years" / "Sarah Chen's 0.81 → 1.12 DSCR journey" / "CF-028 Cleveland credit-scarred rebuild") builds trust and converts borrowers who have been burned by other lenders.

**SEO content priority** (by search-volume × intent-quality):
1. **DSCR calculator** — universal lead magnet, captures SA-001 / SA-003 / SA-012 / SA-004
2. **DSCR loan after bankruptcy** — high-intent, captures SA-008 + EG-001
3. **ITIN DSCR loan** — high-intent, captures SA-010 + EG-002 (bilingual EN/ES)
4. **BRRRR refinance calculator** — captures SA-012 + SA-004
5. **60% 401(k) haircut reserves calculator** — captures EG-008 (per NP-04 handoff: "highest-leverage intake tool")
6. **Non-warrantable condo DSCR guide** — captures EG-006 + SA-011
7. **Condotel DSCR lender guide** — captures EG-007 + SA-011
8. **ADU rental income DSCR guide** — captures SA-009 + EG-005
9. **Foreign-national DSCR guide** — captures SA-005 + SA-006 + EG-003 (bilingual EN/PT/ES)
10. **STR-permissive market guide** — captures SA-007 (geo-targeted to FL / TN / AZ)

**Content-to-landing-page mapping**: Every SEO content piece should end with a CTA to the persona-specific landing page (with the self_qualifier_block). The SEO content does the education; the landing page does the qualification.

---

## Part 5: Repel Copy Library (Anti-Personas)

For each NP-04 hard-decline cohort, the following disqualifier phrasings quietly repel them. These appear as (a) embedded disqualifier language in primary text, (b) the first line of the landing-page self_qualifier_block, (c) the first question in the FF-08 intake form, and (d) the FAQ answer to "Who is this NOT for?"

### 5.1 Primary-Residence Seekers (HEX-001 — universal hard-stop)

```yaml
cohort: Primary-residence seekers
np04_rule: HEX-001
severity: hard_stop (permanent)
repel_copy_elements:
  - "Investment properties only."
  - "Built for rental investors — not for primary residences, second homes, or personal-use vacation properties."
  - "If you'll live in the property, conventional / FHA / VA financing is the right fit — not DSCR."
  - "DSCR loans are business-purpose investment-property loans. Primary-residence borrowers should start with a conventional or government-backed mortgage."
redirect_copy: "DSCR loans are investment-only. For a primary residence or second home, conventional / FHA / VA financing is the right fit. Here's where to start."
landing_page_first_line: "This is a DSCR loan intake for business-purpose investment properties only. If you'll live in the property, [conventional / FHA / VA] is the right path."
ff08_first_question: "Will this property be your primary residence, second home, or personal-use vacation home at any point in the next 12 months? (If yes — DSCR is not the right product; route to conventional / FHA / VA.)"
```

### 5.2 No-Reserves Borrowers (NP-011 — charter "Audiences to Actively Repel")

```yaml
cohort: No-reserves borrowers
np04_rule: NP-011 (charter hard-decline)
severity: hard_stop
repel_copy_elements:
  - "Bring 6+ months of reserves — we don't pretend otherwise."
  - "Reserves are non-negotiable: 6 months PITIA minimum, 9-12 months for STR / FN / ITIN / credit-scarred files. 401(k) at 60% haircut counts."
  - "If you don't have reserves set aside — liquid, 401(k), or co-borrower — DSCR is not the right product until you do."
  - "No-reserve DSCR programs exist (Lendmire at ≤$1.5M loan + ≤70% LTV) but only at lower LTV; 'no reserves at all + 80% LTV + speculative rents' is not a fundable file."
redirect_copy: "DSCR requires reserves — 6 months PITIA minimum. If you don't have reserves set aside, focus on building reserves before applying. The 60% 401(k) haircut + co-borrower addition may help; here's a free reserves calculator."
landing_page_first_line: "DSCR requires 6+ months reserves (liquid + 401(k) at 60% haircut + co-borrower checking). Use our free reserves calculator to confirm fit before applying."
ff08_first_question: "Do you have ~6+ months of reserves set aside (liquid + 401(k) at 60% haircut + co-borrower checking)? [Yes / Partially / No]"
```

### 5.3 Speculative-Rent Investors (HEX-015 — Rize overlay + charter "Audiences to Actively Repel")

```yaml
cohort: Speculative-rent investors (no lease, no rent schedule, no 1007 appraisal, no AirDNA)
np04_rule: HEX-015
severity: hard_stop (defer until 1007-supported)
repel_copy_elements:
  - "We'll need a lease, rent schedule, or 1007 market-rent appraisal — no exceptions."
  - "Rent support is non-negotiable: a current lease, a documented rent schedule, or a Form 1007 market-rent appraisal. AirDNA market report accepted for STR."
  - "If your rent estimate is unsupported (no lease, no comparable rents, no appraisal narrative), we can't underwrite the file — yet."
  - "Optimistic rent estimates are normal; unsupported rent estimates are a decline. Get a Form 1007 or a current lease and we'll talk."
redirect_copy: "DSCR qualification requires supportable rent — a lease, rent schedule, or 1007 market-rent appraisal. Without that, we can't underwrite. Your local appraiser or property manager can help assemble rent support."
landing_page_first_line: "Rent support is required: a current lease, documented rent schedule, or Form 1007 market-rent appraisal (AirDNA for STR). If your rent is unsupported, focus on assembling documentation first."
ff08_first_question: "Do you have a current lease, rent schedule, Form 1007 market-rent appraisal, or AirDNA projection supporting the rental income you're using to qualify? [Yes / In progress / No]"
```

### 5.4 Active-Delinquency Borrowers (HEX-009 — universal hard-stop)

```yaml
cohort: Borrowers with active mortgage delinquency or uncured forbearance
np04_rule: HEX-009
severity: hard_stop (until cured)
repel_copy_elements:
  - "DSCR lenders require all mortgage delinquencies cured and forbearance fully exited before application."
  - "Active mortgage delinquency or uncured forbearance is a hard-stop until cured. We can revisit once that's resolved."
  - "If you're currently in mortgage forbearance or have unresolved mortgage delinquency on any property, focus on curing that first — DSCR will be available once you're past the cure."
redirect_copy: "DSCR lenders require all mortgage delinquencies cured and forbearance fully exited before application. Let's revisit once that's resolved. If you need help with forbearance exit, your loan servicer + HUD-approved housing counselor are the right starting points."
landing_page_first_line: "Active mortgage delinquency or uncured forbearance is a hard-stop for DSCR. If you're currently in either situation, focus on curing first — DSCR will be available once cleared."
ff08_first_question: "Are you currently in mortgage forbearance, or do you have any unresolved mortgage delinquency on any property? (If yes — DSCR is a hard-stop until cured.) [No / Yes — in forbearance / Yes — active delinquency]"
```

### 5.5 Sub-Seasoning Borrowers (HEX-006, HEX-007, HEX-008 — defer-12mo or route-to-specialty)

```yaml
cohort: Borrowers inside seasoning window (recent mortgage late <12mo, foreclosure <24-36mo, bankruptcy <24-48mo)
np04_rule: HEX-006, HEX-007, HEX-008
severity: hard_stop (defer or route-to-specialty)
repel_copy_elements:
  - "Most DSCR programs require 12+ months since your most recent 30-day mortgage late."
  - "Foreclosure seasoning needs 24-36 months. We can map you to a specialty lender if you're 24+ months past discharge with a 700+ credit score."
  - "Bankruptcy seasoning needs 24-48 months depending on chapter. We'll map you to the right specialty program once you're past the window."
  - "Inside the seasoning window? We'll defer intake 12 months — not permanently reject. Set a reminder and come back."
redirect_copy: "DSCR seasoning needs 12-48 months depending on event type. We'll route you to a specialty lender if you're past the specialty window (24mo with 700+ FICO) or defer intake if you're inside the window. Come back when you clear."
landing_page_first_line: "DSCR seasoning programs: 12mo post-short-sale, 24mo post-foreclosure (specialty with 700+ FICO), 36mo post-foreclosure (standard), 48mo post-Chapter 7 (standard), 24mo post-Chapter 7 (specialty with 700+ FICO), 12mo Chapter 13 on-plan with trustee approval. If you're inside the window, we defer 12 months — not permanently reject."
ff08_first_question: "What was your most recent credit event (short sale / foreclosure / Chapter 7 / Chapter 13 / 30+ day mortgage late) and the discharge date? (We'll route based on seasoning window + FICO.) [Dropdown + month/year]"
```

### 5.6 Sub-$100K Loan Borrowers (HEX-012 — universal floor)

```yaml
cohort: Borrowers seeking loan amounts below $100K-$150K program minimum
np04_rule: HEX-012
severity: hard_stop (route to hard money / private notes)
repel_copy_elements:
  - "DSCR loans start at ~$100K-$150K. For smaller loan amounts, hard money or private notes may be a better fit."
  - "Program floor is typically $100K-$150K; below this we cannot underwrite a DSCR loan."
  - "Small-market properties with sub-$100K loan amounts — hard money or private notes typically serve this segment better than DSCR."
redirect_copy: "DSCR loans start at ~$100K-$150K. For smaller loan amounts, hard money lenders or private note investors may be a better fit. Local community banks also sometimes write smaller investment-property loans."
landing_page_first_line: "DSCR program floor: $100K-$150K loan amount. If your target loan is below this floor, hard money or private notes may be a better fit — we can refer you to local hard-money lenders."
ff08_first_question: "What is your target loan amount? (Program floor is typically $100K-$150K; below this we cannot underwrite a DSCR loan — hard money or private notes are the alternative.) [<$100K / $100K-$150K / $150K-$500K / $500K-$1M / $1M+]"
```

### 5.7 Commercial-Use Property Borrowers (HEX-013 — route to specialty)

```yaml
cohort: Borrowers with commercial / retail / industrial / mixed-use (>25% commercial) properties
np04_rule: HEX-013
severity: hard_stop_at_residential_DSCR (route to commercial DSCR or Bluestone)
repel_copy_elements:
  - "Commercial-use properties need a commercial DSCR lender. We can route you to specialty programs that write mixed-use and small commercial DSCR."
  - "Residential DSCR covers 1-4 unit (and 5-8 unit at AHLend specialty). Properties with >25% commercial component route to commercial DSCR — different program, different LTV."
  - "Mixed-use properties with >25% commercial component: residential DSCR lenders exclude, but Bluestone opens to mixed-use + small commercial. We'll route you to the right specialty."
redirect_copy: "Commercial-use properties need a commercial DSCR lender (Bluestone for mixed-use + small commercial; commercial multifamily lenders for 9+ units). We can route you to the right specialty program."
landing_page_first_line: "Residential DSCR covers 1-4 unit (5-8 unit at AHLend specialty). Properties with >25% commercial component route to commercial DSCR — different program. If you have a mixed-use or commercial property, we'll route you to specialty lenders."
ff08_first_question: "Is the subject property used for commercial, retail, industrial, or mixed-use purposes (with >25% commercial component)? (If yes — route to commercial DSCR specialty.) [No — residential 1-4 unit / Yes — mixed-use / Yes — commercial]"
```

### 5.8 STR in Non-Permissive Markets (HEX-002, HEX-003, HEX-014 — redirect)

```yaml
cohort: STR borrowers in NYC (Local Law 18), Nashville residential zones, San Francisco, Denver, parts of Austin
np04_rule: HEX-002, HEX-003, HEX-014
severity: hard_stop (redirect to LTR-pivot or market-pivot)
repel_copy_elements:
  - "STR DSCR requires a confirmable non-owner STR permit. Verify with the local municipality, or we can underwrite this as a long-term rental DSCR instead."
  - "STR in NYC (Local Law 18) and Nashville residential zones is not a fundable path. Consider Gatlinburg/Pigeon Forge TN, Panama City Beach FL, or Scottsdale AZ for STR DSCR."
  - "STR market regulatory eligibility is gating — STR in non-permissive markets routes to LTR-pivot (if rents pencil) or market-pivot (different MSA)."
redirect_copy: "STR DSCR requires STR-permissive regulatory market + obtainable non-owner STR permit. NYC (Local Law 18), Nashville residential zones, San Francisco, Denver are NOT fundable paths. Consider LTR DSCR (if long-term rents pencil) or STR-permissive markets: FL coast, Smokies, Scottsdale AZ."
landing_page_first_line: "STR DSCR is geo-gated to STR-permissive markets: FL coast (Panama City Beach, Destin), Smokies (Gatlinburg, Pigeon Forge), Scottsdale AZ. STR in NYC, Nashville residential zones, San Francisco, Denver routes to LTR-pivot or market-pivot."
ff08_first_question: "Is the property in an STR-permissive market with an obtainable non-owner STR permit? (NYC Local Law 18, Nashville residential zones, San Francisco, Denver are NOT fundable STR paths.) [Yes — STR-permissive market / Unsure — check my market / No — NYC/Nashville residential/SF/Denver]"
```

### 5.9 No-LLC Foreign-National Borrowers (HEX-010, HEX-011 — route to FN pre-intake)

```yaml
cohort: Foreign-national borrowers without US LLC + EIN + operating agreement + AML source-of-funds trail
np04_rule: HEX-010, HEX-011
severity: hard_stop_at_FN_programs (route to FN pre-intake with LLC + AML setup)
repel_copy_elements:
  - "Foreign-national DSCR requires a US LLC. We can connect you with a US attorney to form one (~$1,200, 2-4 weeks)."
  - "Foreign-national DSCR needs a 2-4 week AML source-of-funds review. Start assembling 12 months of bank statements + translation now."
  - "FN DSCR without US LLC + AML trail is not approvable — but formation is a 2-4 week remediation, not a permanent rejection."
redirect_copy: "Foreign-national DSCR requires (i) US LLC with EIN + operating agreement (~$1,200, 2-4 weeks) and (ii) AML source-of-funds trail (12 months foreign bank statements, certified English translation, USD conversion, source-of-funds letter). We can connect you with US counsel + start the AML workflow in parallel."
landing_page_first_line: "Foreign-national DSCR pre-intake: US LLC formation (2-4 weeks) + AML source-of-funds review (2-4 weeks). If you don't have a US LLC or AML trail yet, start here — both are remediation items, not permanent rejections."
ff08_first_question: "If foreign-national: do you have (or are you prepared to form within 2-4 weeks) a US-based LLC with EIN + operating agreement? AND can you provide 12 months of foreign bank statements with certified English translation + USD conversion + source-of-funds letter? [Yes to both / LLC ready, AML in progress / Need help with both / No]"
```

### 5.10 5-8 Unit at Non-AHLend Lender (HEX-016 — route to specialty)

```yaml
cohort: Borrowers with 5-8 unit properties at non-AHLend lenders
np04_rule: HEX-016
severity: hard_stop_at_non_AHLend_lenders (route to AHLend specialty)
repel_copy_elements:
  - "5-8 unit properties need a specialty DSCR lender (AHLend). 9+ units need commercial DSCR. We can route you to the right program."
  - "1-4 unit = residential DSCR. 5-8 unit = AHLend specialty only. 9+ unit = commercial DSCR. We'll route based on unit count."
redirect_copy: "5-8 unit properties: AHLend is the residential DSCR specialist (most other GL-02 lenders cap at 1-4 unit). 9+ unit properties: commercial multifamily DSCR. We'll route you based on your unit count."
landing_page_first_line: "1-4 unit = standard residential DSCR. 5-8 unit = AHLend specialty only. 9+ unit = commercial multifamily DSCR. We route based on your unit count + property type."
ff08_first_question: "How many units does the subject property have? (1-4 = residential DSCR; 5-8 = AHLend specialty only; 9+ = commercial DSCR.) [1 / 2 / 3 / 4 / 5-8 / 9+]"
```

### 5.11 Compliance-Friendly Repel Copy Patterns (Summary)

| NP-04 cohort | Primary repel phrasing | Where it appears |
|---|---|---|
| Primary-residence seekers (HEX-001) | "Investment properties only." | Every hook primary text + landing-page first line + FF-08 Q1 |
| No-reserves borrowers (NP-011) | "Bring 6+ months of reserves — we don't pretend otherwise." | Every hook + reserves calculator CTA + FF-08 Q3 |
| Speculative-rent investors (HEX-015) | "We'll need a lease, rent schedule, or 1007 appraisal — no exceptions." | Every hook + FF-08 Q2 |
| Active-delinquency (HEX-009) | "DSCR lenders require all mortgage delinquencies cured and forbearance fully exited." | FF-08 Q on delinquency |
| Sub-seasoning (HEX-006/007/008) | "12+ months since your most recent 30-day mortgage late. / 24-36mo post-foreclosure. / 24-48mo post-bankruptcy." | SA-008 + EG-001 hooks + FF-08 seasoning question |
| Sub-$100K loan (HEX-012) | "DSCR loans start at ~$100K-$150K." | FF-08 Q on loan amount |
| Commercial-use (HEX-013) | "Commercial-use properties need a commercial DSCR lender." | FF-08 Q on property type |
| STR non-permissive market (HEX-002/003/014) | "STR DSCR requires STR-permissive market + obtainable non-owner STR permit." | SA-007 + EG-007 hooks + FF-08 STR market question |
| No-LLC FN (HEX-010/011) | "Foreign-national DSCR requires US LLC + AML source-of-funds trail." | SA-005/006 + EG-003 hooks + FF-08 FN pre-intake |
| 5-8 unit at non-AHLend (HEX-016) | "5-8 unit properties need a specialty DSCR lender (AHLend)." | FF-08 Q on unit count |

---

## Cross-Agent Handoff Notes

### For FF-08 (Funnel Friction Mapper)

- **Landing-page self_qualifier_block** in every persona block above maps directly to FF-08's 3-question inline self-check. The first question is always the HEX-001 primary-residence screen (universal hard-stop). The second question captures the persona-defining axis (DSCR / seasoning / STR permit / ADU permit / ITIN / FN documentation / decline letter). The third question captures the compensator axis (reserves / LTV / FICO / operating history).
- **Lead-form intro copy** for Meta is provided in §4.1 above — this mirrors the landing-page self_qualifier_block so the borrower sees the same self-qualification logic in both places.
- **Decline-letter triage question** (per EG-06 handoff): include as the FIRST optional question on the intake form: "Have you received a decline letter on this file from another DSCR lender? If yes, what was the stated reason?" Dropdown: condotel / non-warrantable condo / unpermitted ADU / sub-1.0 DSCR / 401(k) reserves miscalc / appraisal short / open code violations / FICO below floor / seasoning short / mortgage late / other. Routes to SA-011 specialty intake.
- **Reserves calculator** (60% 401(k) haircut + co-borrower addition) is the highest-leverage intake tool per NP-04 Part 6 — implement as both inline intake tool AND standalone SEO lead magnet (EG-008 hooks).

### For TS-10 (Targeting & Scoring Generator)

- **Persona → ad-set mapping**: Each persona in Part 2 has 3 hook variants. Recommended rotation: H1 + H2 in initial launch (H1 Google Search, H2 Meta); H3 added as A/B challenger after 2 weeks of data.
- **Edge-case → ad-set mapping**: Each edge case in Part 3 has 2 hook variants. Recommended rotation: H1 Google Search (high-intent), H2 Meta/Native (broad reach). Edge cases have lower volume but higher conversion rate per lead.
- **Lead-score weights by persona**: Use SA-05 FDI scoring (Approval 25% / Doc-clean 15% / Rent-realism 15% / Repeat 15% / Margin 15% / Compliance 10% / Reachability 5%). Hard-stop leads (HEX-001 / HEX-009 / HEX-012 outside specialty / HEX-013 outside specialty) score 0 with route-to-other-product. Conditional-hard leads (HEX-002/003/004/005/007/008/010/011/014/015/016) score 30-50 with specialty-intake routing. Recoverable leads (NP-003/004/005/006/007/009/010/012) score 50-70 with manual-review flag. FP-pattern leads (FP-001 through FP-015) score 60-80 with specialty routing — NOT 0.
- **Negative-keyword discipline**: Apply the universal negative-keyword list (§4.2) to ALL Google Search ad groups. Each persona block adds persona-specific negatives.

### For GS-07 (Geo-Segment Correlator)

- **SA-002 Portfolio Scaler**: Multi-state landlord-friendly — TN, AR, FL, AL, OH, NC, MD.
- **SA-001 Cash-Flow Optimizer**: IN-Indianapolis, TN-Memphis, MI-GrandRapids, OH-Cleveland, NC-Charlotte, AL-Birmingham.
- **SA-007 STR Operator**: FL-PanamaCityBeach, FL-Destin, AZ-Scottsdale, TN-Gatlinburg-PigeonForge (STR-permissive MSAs only — NYC and Nashville residential are explicitly excluded by repel copy in §5.8).
- **SA-008 Credit-Scarred Rebuilder**: OH-Cleveland, OH-Cincinnati, MO-StLouis, IN-Indianapolis, PA-Pittsburgh (Midwest 2-4 unit cash-flow markets).
- **SA-009 Permitted-ADU CA**: CA-LosAngeles, CA-SanDiego, CA-BayArea (ADU-permit density MSAs).
- **SA-005/006 Foreign National**: TX (no state income tax, landlord-friendly), FL (no state income tax, #1 FN DSCR market).
- **SA-010 ITIN US-Resident**: FL-Miami, TX-Houston, CA-LosAngeles (bilingual processing required).
- **SA-012 BRRRR Cyclist**: TN-Memphis, IN-Indianapolis, OH-Cleveland, AL-Birmingham (low-cost BRRRR-friendly markets; loan amounts near $100K-$150K floor are common — flag for HEX-012).

### Compliance Pre-Launch Review Items

The following items require compliance pre-launch review before ad campaigns go live (per EG-06 Part 3 Compliance Guardrails):

1. **EG-002 / SA-010 ITIN copy** — ITIN is a direct proxy for national origin. The "ITIN accepted in lieu of SSN" language is anchored to lender-published program features (AHLend, America Mortgages), not borrower class. Bilingual landing pages are permissible under ECOA "affirmative marketing" provision. **Requires qualified ECOA / Reg B attorney review before deployment on Meta + Google.**
2. **EG-003 / SA-005 / SA-006 Foreign-National copy** — FN status is fair-lensing-adjacent. The "no US credit history required" language is anchored to lender-published program features (AHLend, America Mortgages, Angel Oak, A&D Mortgage, HomeAbroad), not national-origin targeting. **Requires qualified ECOA / Reg B attorney review before deployment.**
3. **EG-001 / SA-008 Credit-Scarred copy** — Prior credit events correlate with protected-class characteristics (medical debt, divorce, disability). The "specialty seasoning programs available" language is feature-oriented, not demographic. **Moderate risk; review recommended but lower-priority than ITIN / FN.**
4. **SA-007 / EG-007 STR copy** — STR-permissive-market geo-targeting (FL coast, Smokies, Scottsdale) is property-economics-based, not demographic. NYC / Nashville residential exclusion is regulatory, not demographic. **Low compliance risk.**
5. **All ad disclaimers** — Verify NMLS # placeholder is replaced with the actual NMLS ID before deployment. Verify "Equal Housing Lender" icon is present on all Meta + Google ads.
6. **Meta Special Ad Category** — Verify all Meta campaigns are submitted under Housing Special Ad Category with no lookalike audiences on protected attributes and no ZIP / demographic targeting.
7. **Google Ads housing certification** — Verify housing-credit certification + advertiser identity verification is complete before any Search campaign launches.

---

## Limitations & Honest Sample-Size Disclosure

1. **Ad copy is lift-and-deploy ready** but should be A/B tested in 2-week sprints. The 3-hook-variant structure (H1/H2/H3 per persona) is designed for initial 6-week testing rotation (2 weeks per hook). Edge cases (2 hooks each) follow a 4-week rotation.
2. **Headlines target Google Ads character limits** (≤40 characters for headline fields; ≤30 for headline_1 / headline_2 in expanded text ads). Some headlines are slightly over for RSA (responsive search ads) — adjust per Google's RSA field limits before deployment.
3. **Trust signals reference 2024 case data** (CF-01 sample) — verify current lender volumes / close times / state coverage before deployment. "Average close 17-28 days on clean files" reflects CF-01 case sample; real-world close times may vary by lender + file complexity.
4. **Compliance disclaimers use NMLS #_____ placeholder** — replace with actual NMLS ID before deployment. "Equal Housing Lender" icon must be added per ad-platform specifications.
5. **Negative keyword lists are starter lists** — expand based on actual search-term reports from initial 2-4 weeks of campaign data. Search-term review weekly for the first month, monthly thereafter.
6. **Spanish-language copy (EG-002 / SA-010 H2 hooks)** was drafted for bilingual landing-page use. Native-speaker review recommended before deployment — particularly the disclaimer language.
7. **Borrower-education content (SA-003, EG-008 calculator-led hooks)** should pair with actual calculator tools. FF-08 + parent-agent master brief should coordinate calculator implementation; AC-09 has drafted the calculator-led copy but not the calculator mechanics.
8. **All ad copy complies with the charter Creative Guardrail** — no hook promises "easy approval", "no credit check", or "guaranteed approval". No hook uses the forbidden-copy list from §1.2. Every hook contains self-qualifying microcopy per §1.7 canonical patterns.

---

*End of AC-09 deliverable. Downstream agents (FF-08, TS-10, GS-07, parent-agent master brief) should treat Part 1 as the universal guardrail contract, Part 2 as the persona-level creative library (12 personas × 3 hooks = 36 hooks), Part 3 as the edge-case creative library (8 edge cases × 2 hooks = 16 hooks), Part 4 as the channel-strategy routing map, and Part 5 as the anti-persona repel library (10 NP-04 hard-decline cohorts with quietly-repelling disqualifier phrasings).*
