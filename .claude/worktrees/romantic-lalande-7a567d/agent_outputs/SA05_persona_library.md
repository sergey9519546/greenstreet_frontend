# SA-05 — Sponsor Archetype Synthesizer

**Agent:** SA-05 Sponsor Archetype Synthesizer
**Phase:** 3 of 5 (parallel with EG-06 Edge-Case Gold Miner)
**Task:** Convert AP-03's 9 approval clusters + NP-04's 15 false-positive risks into a rich, approval-weighted borrower persona library (10-12 personas)
**Inputs consumed:**
- `/home/z/my-project/worklog.md` (charter — 8 starting personas P1-P8 + FDI scoring dimensions + creative guardrail)
- `/home/z/my-project/download/agent_outputs/AP03_approval_patterns.md` (9 approval clusters AP-001 through AP-009 + 3 heatmaps + 14 accelerants + 12 decelerants + FDI overlay)
- `/home/z/my-project/download/agent_outputs/NP04_decline_patterns.md` (12 decline clusters + 16 HEX rules + 16 SWR rules + 15 false-positive risks FP-001 through FP-015)
- `/home/z/my-project/download/agent_outputs/CF01_case_files.md` (28 cases — spot-checked for persona evidence)
- `/home/z/my-project/download/agent_outputs/GL02_normalized_guidelines.md` (referenced for lender-tier evidence)

**Output consumers:** FF-08 (Funnel Friction Mapper), AC-09 (Ad Hook & Copy Reframer), TS-10 (Targeting & Scoring Generator), GS-07 (Geo-Segment Correlator), EG-06 (Edge-Case Gold Miner — for extension)

---

## Methodology in Brief

- **Persona construction:** Each of the charter's 8 personas (P1-P8) was enriched with AP-03 cluster evidence + NP-04 false-positive risk patterns. P5 (foreign national) was split into two distinct tiers (Strong-Credit-Country and No-Credit-Country) because AP-004 vs. AP-005 diverge sharply on LTV band (70-75% vs. 60-65%), reserves (9-12mo vs. 12mo), rate premium (+0.50-0.75% vs. +1.00-1.50%), and borrower preparedness. This produces 9 enriched charter personas.
- **New personas:** 3 added per charter guidance — SA-010 ITIN US-Resident Investor (from AP-006), SA-011 Compensated-Exception Shopper (from AP-009), SA-012 BRRRR Refinance Cyclist (from AP-001 accelerant #12, CF-010 / CF-002 evidence). Total: 12 personas.
- **FDI scoring:** Weighted per charter — Approval 25%, Doc-clean 15%, Rent-realism 15%, Repeat 15%, Margin 15%, Compliance 10%, Reachability 5%. Scores are honest: SA-006 (No-Credit FN) and SA-011 (Compensated-Exception Shopper) score in the 6.5-6.7 band because their friction is real, even though both are fundable.
- **Traceability:** Every persona traces to ≥1 AP-03 cluster + ≥1 CF-01 case ID. AP-03 caveat #4 (FN/ITIN clusters are guideline-inferred, not case-verified) is flagged in those personas via `evidence_tier: guideline_inferred`.
- **Compliance:** All demographic framing is in business/investor terms. No protected-class proxies. Age is framed as "experience band" (e.g., "mid-career to pre-retirement"); national origin is framed as "credit-country tier" (UK/EU/Canada/AU vs. LatAm/Asia/Africa per AHLend/America Mortgages FN guidelines, not by ethnicity).

---

## Part 1: Persona Library (12 Personas)

### SA-001 — The Cash-Flow Optimizer (P1 enriched)

```yaml
persona_id: SA-001
persona_name: The Cash-Flow Optimizer
persona_lineage: Charter P1 (self-employed cash-flow investor) + AP-001 Clean SFR LTR + AP-002 (single-unit variant)
one_line_description: Self-employed W-2-blocked investor qualifying first 1-4 SFR rentals off property cash flow, not tax returns.

profile:
  experience_level: first_time | 2_5_doors
  typical_age_band: mid-career to pre-retirement
  employment_pattern: self_employed
  entity_structure: LLC
  financial_sophistication: intermediate
  intent_signal: searching for "no income verification investment loan" / "DSCR loan self-employed"

approval_fingerprint:
  DSCR_band: [1.12, 1.49]
  FICO_band: [700, 755]
  LTV_band: [0.58, 0.75]
  reserves_months_band: [6, 6]
  property_type_fit: [SFR, 2-4_unit]
  occupancy_fit: [long_term_rental]
  entity_fit: [LLC]
  geo_fit: [IN-Indianapolis, TN-Memphis, MI-GrandRapids, OH-Cleveland, NC-Charlotte, AL-Birmingham]
  typical_loan_size_band: $150K-$500K

accelerants:
  - Heavy Schedule C write-offs that disqualify conventional DTI but are irrelevant under DSCR
  - LLC vesting with operating agreement (universal in positive outcomes)
  - Form 1007 market-rent supportable in stable Midwest/Southeast rental markets
  - Lease-in-place at application OR within 3 weeks of closing
  - Pre-existing lender relationship enabling 17-28 day closes

watch_outs:
  - First-time-investor with no portfolio track record → no aggregate portfolio cash-flow offset available
  - Self-employment income volatility may require 12mo bank statements if FICO <720
  - If borrower pushes LTV to 75% ceiling at thin DSCR (1.12-1.20), expect 1-2 condition flags

search_queries:
  - "DSCR loan self employed"
  - "investment property loan no tax returns"
  - "no income verification investment mortgage"
  - "DSCR loan vs conventional for rental"
  - "qualify for rental with write-offs"
forum_signals:
  - BiggerPockets posts asking "How do I qualify for more rentals when my CPA writes off everything?"
  - Reddit r/realestateinvesting questions about DTI blockers and DSCR alternatives
  - Repeated mentions of "tax returns don't reflect my actual cash flow"

scoring:
  approval_likelihood: 9
  documentation_cleanliness: 7
  rent_support_realism: 9
  repeat_borrow_likelihood: 8
  margin_loan_size_potential: 5
  compliance_friendliness: 9
  marketing_reachability_special_ad_category: 7
  FDI_weighted: 7.85

evidence_case_ids: [CF-001, CF-008, CF-009, CF-010, CF-028]
evidence_cluster_ids: [AP-001, AP-002]
false_positive_risks_referenced: [FP-015]
notes: |
  The P1 archetype is the volume play of DSCR lending — clean files, smaller per-loan
  balances, but the highest loan velocity in the library (CF-002 archetype closed 18
  loans in ~3 years from this persona tier). SA-001 is distinct from SA-002 (Portfolio
  Scaler) by door count: SA-001 is 1-5 doors scaling up; SA-002 is 10+ doors with
  multi-state portfolio/blanket loan structures. SA-001 routes to SA-002 as borrower
  scales. FP-015 (DTI at 48-50% conventional wall) is the #1 false-positive risk — AC-09
  must CELEBRATE "no DTI limit" rather than screening on DTI.
```

### SA-002 — The Multi-State Portfolio Scaler (P2 upgraded)

```yaml
persona_id: SA-002
persona_name: The Multi-State Portfolio Scaler
persona_lineage: Charter P2 (seasoned small-portfolio landlord) upgraded + AP-002 Self-Employed Portfolio Scaler
one_line_description: Seasoned 10-50+ door LLC empire operator using portfolio/blanket DSCR loans to scale across multiple states.

profile:
  experience_level: 20+_doors
  typical_age_band: mid-career to pre-retirement
  employment_pattern: self_employed | mixed
  entity_structure: LLC (multi-state operating agreements)
  financial_sophistication: expert
  intent_signal: searching for "portfolio DSCR loan" / "blanket DSCR loan multiple properties"

approval_fingerprint:
  DSCR_band: [1.04, 1.28]
  FICO_band: [700, 755]
  LTV_band: [0.75, 0.80]
  reserves_months_band: [6, 12]
  property_type_fit: [SFR]
  occupancy_fit: [long_term_rental]
  entity_fit: [LLC]
  geo_fit: [Multi-state, MD-Baltimore, CA-SanDiego, OH, NC-Charlotte, TN-Memphis, AR-LittleRock, FL-Jacksonville, AL-Birmingham]
  typical_loan_size_band: $1M-$3.2M

accelerants:
  - Aggregate portfolio cash flow positive across 10+ properties offsets thin-DSCR subjects
  - Portfolio/blanket loan structures (Truss) aggregate multiple subjects into one loan — 3-5x revenue per loan vs. single-unit DSCR
  - No tax return required (CF-002 closed 18 loans without ever providing tax return)
  - Prepay-penalty acceptance (5/4/3/2/1) unlocks pricing
  - 75% LTV cash-out on stabilized rental = clean approve
  - Pre-existing lender relationship enabling 14-28 day closes (CF-003 quadrupled 4→16 properties in 14 months)

watch_outs:
  - Aggregate portfolio reserve documentation burden (Truss portfolio/blanket requires higher reserves + 680+ aggregate FICO per SWR-011)
  - Multi-state operating agreements require US-attorney coordination
  - Thin-DSCR cash-out (1.00-1.10 DSCR) requires 6mo property-specific reserve + portfolio context (SWR-007, -12 score impact)
  - Prepay penalty acceptance — borrower must understand exit-cost math

search_queries:
  - "portfolio DSCR loan"
  - "blanket loan multiple rental properties"
  - "DSCR loan 10+ properties"
  - "scale rental portfolio no DTI limit"
  - "commercial DSCR vs portfolio loan"
forum_signals:
  - BiggerPockets advanced-landlord threads on scaling past conventional DTI walls
  - Real estate syndication-adjacent operators looking for portfolio leverage
  - Mentions of "blanket loan" or "cross-collateralized DSCR"

scoring:
  approval_likelihood: 9
  documentation_cleanliness: 7
  rent_support_realism: 9
  repeat_borrow_likelihood: 10
  margin_loan_size_potential: 10
  compliance_friendliness: 9
  marketing_reachability_special_ad_category: 7
  FDI_weighted: 8.90

evidence_case_ids: [CF-002, CF-003, CF-004, CF-005, CF-011]
evidence_cluster_ids: [AP-002]
false_positive_risks_referenced: [FP-015, FP-004]
notes: |
  Highest-FDI persona in the library. The dominant cluster by lifetime value: large
  loans ($1M-$3.2M), near-certain repeat borrowing, and conventionally DTI-blocked
  (DSCR is their only path to scale). AC-09 must target Google Search intent terms
  ("portfolio DSCR loan", "blanket loan rental") — Meta Special Ad Category audience
  is small. TS-10 should weight this persona at the top of routing priority. GS-07
  should map to multi-state landlord-friendly clusters (TN, AR, FL, AL, OH, NC).
  SA-002 borrower may also enter via SA-004 (Equity-Tapping Refinancer) pathway when
  cash-out is the entry intent.
```

### SA-003 — The Cash-Strong First-Timer (P3 enriched)

```yaml
persona_id: SA-003
persona_name: The Cash-Strong First-Timer
persona_lineage: Charter P3 (first-time investor with strong savings) + AP-001 (first-time cases)
one_line_description: High-FICO high-liquidity first-time investor entering DSCR because reserves + rent cover the payment, not W2.

profile:
  experience_level: first_time
  typical_age_band: early-career to mid-career
  employment_pattern: W2
  entity_structure: LLC (newly formed for this purchase)
  financial_sophistication: intermediate
  intent_signal: searching for "first DSCR loan" / "how to qualify for rental property DSCR"

approval_fingerprint:
  DSCR_band: [1.19, 1.49]
  FICO_band: [710, 755]
  LTV_band: [0.58, 0.75]
  reserves_months_band: [6, 12]
  property_type_fit: [SFR]
  occupancy_fit: [long_term_rental, short_term_rental_if_permissive_market]
  entity_fit: [LLC, personal]
  geo_fit: [IN-Indianapolis, TN-Gatlinburg-PigeonForge (first-time STR), NC-Charlotte]
  typical_loan_size_band: $150K-$350K

accelerants:
  - Strong FICO (710+) unlocks best-tier pricing
  - 6-12 months PITIA reserves
  - LLC vesting (or personal vesting with 755+ FICO + 58% LTV compensator — CF-008 Sarah Chen pattern)
  - First DSCR loan creates lender relationship for repeat borrowing
  - Lease-in-place within 3 weeks of closing (CF-001)

watch_outs:
  - No portfolio track record → no aggregate portfolio cash-flow offset for thin-DSCR files
  - Inexperience with DSCR mechanics → higher borrower-education burden (SWR-013)
  - First-time STR investors face worst-tier AirDNA haircut (25% vs. 15% with 24mo host history — SWR-004, -6 score impact)
  - Tendency to overestimate rents — Form 1007 may come in below borrower estimate

search_queries:
  - "first DSCR loan"
  - "how to qualify for DSCR loan"
  - "DSCR loan for first rental"
  - "investment property loan no W2"
  - "DSCR loan calculator"
forum_signals:
  - BiggerPockets newcomer questions about DSCR mechanics
  - Reddit r/realestateinvesting "first rental" threads where conventional DTI is the blocker
  - High engagement with DSCR calculator tools

scoring:
  approval_likelihood: 8
  documentation_cleanliness: 8
  rent_support_realism: 8
  repeat_borrow_likelihood: 9
  margin_loan_size_potential: 4
  compliance_friendliness: 9
  marketing_reachability_special_ad_category: 8
  FDI_weighted: 7.65

evidence_case_ids: [CF-001, CF-008, CF-009, CF-014]
evidence_cluster_ids: [AP-001, AP-003]
false_positive_risks_referenced: [FP-013]
notes: |
  Education-first persona. AC-09 must NOT hard-sell — copy must teach the mechanics
  ("rent covers payment + reserves = fundable") rather than promise easy approval.
  FP-013 (first-time STR with no host history) is fundable in STR-permissive markets
  with AirDNA + 12mo reserves + STR permit verification; AC-09 must NOT say
  "established STR hosts only". SA-003 converts to SA-001 or SA-002 after 2-3
  successful closes — lender relationship is the durable asset. FF-08 should
  trigger borrower-education module BEFORE intake if borrower self-identifies as
  first-time.
```

### SA-004 — The Equity-Tapping Refinancer (P4 enriched)

```yaml
persona_id: SA-004
persona_name: The Equity-Tapping Refinancer
persona_lineage: Charter P4 (portfolio refi / cash-out consolidator) + AP-002 cash-out variant + NP-010 (counteroffer-likely thin-DSCR cash-out)
one_line_description: Stabilized-portfolio landlord cashing out 60-75% LTV on existing rentals to fund the next acquisition.

profile:
  experience_level: 2_5_doors | 6_20_doors | 20+_doors
  typical_age_band: mid-career to pre-retirement
  employment_pattern: self_employed | mixed
  entity_structure: LLC
  financial_sophistication: advanced
  intent_signal: searching for "DSCR cash-out refinance" / "refi rental to buy next property"

approval_fingerprint:
  DSCR_band: [1.04, 1.31]
  FICO_band: [700, 730]
  LTV_band: [0.55, 0.75]
  reserves_months_band: [6, 12]
  property_type_fit: [SFR]
  occupancy_fit: [long_term_rental]
  entity_fit: [LLC]
  geo_fit: [NC-Charlotte, OH-Columbus, FL-PanamaCityBeach, multi-state]
  typical_loan_size_band: $300K-$1.5M

accelerants:
  - Stabilized rental with documented rent rolls (12mo+ operating history)
  - 6mo seasoning from initial purchase (BRRRR or conventional)
  - Aggregate portfolio cash flow positive across 10+ properties (CF-011: $3,200/mo aggregate offsets subject negative)
  - Pre-existing lender relationship
  - Rate-and-term refi (vs. cash-out) unlocks 5pts higher LTV

watch_outs:
  - Cash-out adds 5-10pts LTV haircut vs. rate-term refi (GL-02 Part 4 CF-12)
  - Thin post-refi DSCR (1.00-1.10) requires 6mo property-specific reserve (NP-010 / SWR-007)
  - Appraisal-risk flag in softening markets (SWR-008 — CF-025 declined when appraisal came $30K below estimate)
  - Negative cash flow on subject property (CF-011: -$267/mo) requires portfolio context documentation

search_queries:
  - "DSCR cash out refinance"
  - "refinance rental property to buy next"
  - "cash out refi investment property no income"
  - "DSCR refinance rates"
  - "BRRRR refinance DSCR"
forum_signals:
  - BiggerPockets BRRRR threads asking about refi seasoning requirements
  - Reddit r/realestateinvesting questions about cash-out timing
  - Discussion of "refi-to-buy" strategies

scoring:
  approval_likelihood: 7
  documentation_cleanliness: 8
  rent_support_realism: 8
  repeat_borrow_likelihood: 9
  margin_loan_size_potential: 7
  compliance_friendliness: 9
  marketing_reachability_special_ad_category: 7
  FDI_weighted: 7.80

evidence_case_ids: [CF-006, CF-010, CF-011, CF-025]
evidence_cluster_ids: [AP-002, NP-010]
false_positive_risks_referenced: [FP-010, FP-004]
notes: |
  Two sub-pathways within this persona: (a) clean cash-out on stabilized LTR rental
  at 70-75% LTV with DSCR ≥1.25 (clean approve — CF-010, CF-006); (b) thin-DSCR
  cash-out at 1.00-1.10 with portfolio context (counteroffer-likely — CF-011).
  FF-08 should branch intake on these two pathways via "what is your expected
  post-refi DSCR?" question. FP-010 (appraisal short) is recoverable via ROV
  / cash-bridge / second-appraisal — not a pre-screen filter. SA-004 overlaps
  with SA-012 (BRRRR Cyclist) when the refi specifically pays off hard money
  post-rehab — the distinguishing factor is whether the borrower is actively
  cycling capital (SA-012) or stabilizing a long-held portfolio (SA-004).
```

### SA-005 — The Strong-Credit Foreign National (P5a — strong-credit tier)

```yaml
persona_id: SA-005
persona_name: The Strong-Credit Foreign National
persona_lineage: Charter P5 (foreign national with verified assets) + AP-004 (strong-credit-country tier)
one_line_description: UK/EU/Canada/AU passport holder buying US SFR rentals via DSCR using Nova Credit international-credit translation.

profile:
  experience_level: first_time
  typical_age_band: mid-career to pre-retirement
  employment_pattern: foreign_national
  entity_structure: LLC (US-based, US-attorney-drafted)
  financial_sophistication: advanced
  intent_signal: searching for "foreign national DSCR loan" / "DSCR loan no US credit"

approval_fingerprint:
  DSCR_band: [1.25, 1.35]
  FICO_band: [700, 740]   # Nova Credit international-credit equivalent
  LTV_band: [0.70, 0.75]
  reserves_months_band: [9, 12]
  property_type_fit: [SFR]
  occupancy_fit: [long_term_rental]
  entity_fit: [LLC]   # required for FN
  geo_fit: [TX (no state income tax, landlord-friendly), FL (no state income tax)]
  typical_loan_size_band: $300K-$500K

accelerants:
  - Strong-credit-country passport (UK/EU/Canada/AU) unlocks 70-75% LTV (vs. 60-65% no-credit)
  - +0.50-0.75% rate premium (vs. +1.00-1.50% no-credit-country)
  - Valid US visa + ESTA visa-waiver (no embassy delay)
  - US bank account seasoned 60-90 days pre-application
  - DSCR 1.25+ clears best-tier threshold
  - US LLC with EIN + operating agreement (US-attorney-drafted)

watch_outs:
  - Nova Credit international credit report translation required (not all lenders accept)
  - 3-week AML clearance extends underwriting cycle
  - 9-12 months PITIA reserves in US bank, seasoned 60-90 days (vs. 6mo standard for US borrowers)
  - Valid passport 6+ months validity past closing
  - Foreign-source funds require certified English translation + USD conversion
  - HEX-010 (no US LLC) and HEX-011 (no AML paper trail) are hard-stops if unprepared

search_queries:
  - "foreign national DSCR loan"
  - "DSCR loan no US credit history"
  - "international investor US rental property financing"
  - "Nova Credit DSCR lender"
  - "foreign national investment property Florida"
forum_signals:
  - BiggerPockets international-investor subforum
  - Reddit r/USExpats and r/expat questions about US real estate investing
  - HomeAbroad / A&D Mortgage / Angel Oak forum mentions

scoring:
  approval_likelihood: 8
  documentation_cleanliness: 6
  rent_support_realism: 8
  repeat_borrow_likelihood: 8
  margin_loan_size_potential: 8
  compliance_friendliness: 7
  marketing_reachability_special_ad_category: 6
  FDI_weighted: 7.50

evidence_case_ids: [CF-017]
evidence_cluster_ids: [AP-004]
false_positive_risks_referenced: [FP-003]
evidence_tier: guideline_inferred
notes: |
  Per AP-03 caveat #4, FN clusters are guideline-inferred (only N=1 case in CF-01
  sample). Lender-match is critical — AHLend + America Mortgages are the two FN-native
  DSCR lenders per GL-02. Florida is "#1 DSCR market" for FN per DSCR Authority (no
  state income tax, landlord-friendly); Texas selected for fastest eviction timeline.
  FP-003 (FN with no US credit history) is fundable when Nova Credit translation
  available — AC-09 must NOT say "US credit history required" or "US citizens only".
  GS-07 should map SA-005 to TX + FL specifically. SA-005 is distinct from SA-006
  (No-Credit FN) by passport country — borrowers from LatAm, Asia, Africa without
  Nova Credit coverage route to SA-006.
```

### SA-006 — The No-Credit Foreign National (P5b — no-credit tier)

```yaml
persona_id: SA-006
persona_name: The No-Credit Foreign National
persona_lineage: Charter P5 (foreign national) + AP-005 (no-credit-country tier)
one_line_description: LatAm/Asia/Africa investor with 40% down + 12mo reserves + DSCR 1.30+, no credit-translation available.

profile:
  experience_level: first_time
  typical_age_band: mid-career to pre-retirement
  employment_pattern: foreign_national
  entity_structure: LLC (US-based)
  financial_sophistication: advanced
  intent_signal: searching for "Brazilian investor US mortgage" / "no credit foreign national DSCR"

approval_fingerprint:
  DSCR_band: [1.30, 1.45]   # higher DSCR required to offset no-credit tier
  FICO_band: ["n/a — no credit documentation; lender waived"]
  LTV_band: [0.60, 0.65]   # 35-40% down
  reserves_months_band: [12, 12]
  property_type_fit: [SFR]
  occupancy_fit: [long_term_rental]
  entity_fit: [LLC]   # required for FN
  geo_fit: [FL]
  typical_loan_size_band: $200K-$400K

accelerants:
  - 40% down payment (no-credit-country FN tier — compensator for credit-tier)
  - 12 months PITIA reserves in US bank, seasoned 90 days
  - Prior real estate sale (home country) provides clean source-of-funds narrative
  - 12mo international bank statements (extends underwriting 5-7 days but rarely declines)
  - Florida market selection (landlord-friendly, no state income tax)
  - US LLC with EIN + operating agreement
  - FIRPTA withholding structure reviewed by tax counsel
  - DSCR 1.30+ well above 1.25 best-tier to compensate for credit-tier

watch_outs:
  - +1.00-1.50% rate premium vs. US borrower (here +1.25% per CF-018) — borrower must accept
  - 12mo international bank statements with certified English translation + USD conversion (SWR-016, -5 score impact)
  - AML source-of-funds clearance 2-4 weeks (HEX-011 if not prepared)
  - B1/B2 visa stamp required
  - Specialty FN portfolio lenders (Angel Oak, A&D Mortgage, HomeAbroad) — limited lender pool
  - Smaller loan sizes due to 60-65% LTV cap
  - Lower repeat frequency than strong-credit-country tier due to higher friction per loan

search_queries:
  - "foreign national DSCR loan no credit history"
  - "Brazilian investor US mortgage"
  - "no credit check investment property loan Florida"
  - "international investor 40% down DSCR"
  - "FIRPTA DSCR loan structure"
forum_signals:
  - BiggerPockets international-investor threads for LatAm/Asia investors
  - Reddit r/USExpats country-specific threads (r/Brazil, r/IndianInUSA)
  - Forum mentions of A&D Mortgage / Angel Oak / HomeAbroad

scoring:
  approval_likelihood: 7
  documentation_cleanliness: 5
  rent_support_realism: 8
  repeat_borrow_likelihood: 6
  margin_loan_size_potential: 7
  compliance_friendliness: 6
  marketing_reachability_special_ad_category: 5
  FDI_weighted: 6.50

evidence_case_ids: [CF-018]
evidence_cluster_ids: [AP-005]
false_positive_risks_referenced: [FP-003]
evidence_tier: guideline_inferred
notes: |
  Lowest-FDI persona in the library — still fundable but operationally expensive
  (12mo foreign bank statements, AML clearance, FIRPTA counsel). Per AP-03 caveat
  #4, this cluster is guideline-inferred (N=1 in CF-01). AC-09 must reach this
  borrower via in-language campaigns (Portuguese, Spanish, Mandarin) + bilingual
  landing pages — Meta Special Ad Category reachability is the lowest in the
  library (5). EG-06 should explore whether specialty FN-only lenders can be
  pre-positioned to absorb the documentation cycle. SA-006 is distinct from
  SA-010 (ITIN US-Resident) — ITIN borrowers have US residency + work permit +
  18mo US credit file (CF-019); SA-006 borrowers are non-resident with no US
  credit file at all.
```

### SA-007 — The STR Permissive-Market Operator (P6 enriched)

```yaml
persona_id: SA-007
persona_name: The STR Permissive-Market Operator
persona_lineage: Charter P6 (short-term rental operator) + AP-003 (STR-permissive markets only)
one_line_description: STR operator in Florida coast / Smokies / Scottsdale AZ using AirDNA + STR permit to qualify DSCR on projected STR income.

profile:
  experience_level: first_time | 2_5_doors | 6_20_doors
  typical_age_band: mid-career to pre-retirement
  employment_pattern: self_employed | mixed
  entity_structure: LLC
  financial_sophistication: advanced
  intent_signal: searching for "DSCR loan Airbnb" / "STR investment property financing"

approval_fingerprint:
  DSCR_band: [1.27, 1.51]
  FICO_band: [700, 745]
  LTV_band: [0.55, 0.75]
  reserves_months_band: [9, 12]   # STR-typical vs. 6mo LTR
  property_type_fit: [SFR, condo_warrantable]
  occupancy_fit: [short_term_rental]
  entity_fit: [LLC]
  geo_fit: [FL-PanamaCityBeach, FL-Destin, AZ-Scottsdale, TN-Gatlinburg-PigeonForge]
  typical_loan_size_band: $290K-$600K

accelerants:
  - 9-12 months PITIA reserves (STR-typical vs. 6mo LTR)
  - AirDNA market score ≥82 (CF-012=82, CF-013=85, CF-014=88)
  - STR-permissive regulatory market (verified by obtainable non-owner STR permit pathway)
  - 24+ months STR host history unlocks 15% income haircut (vs. 25% new-host) + 10-25bps rate improvement
  - AirDNA projection accepted in lieu of 6-12mo trailing STR history (specialty lender pathway)
  - STR permit pre-verified (eliminates NP-001 / HEX-002/003/014 decline drivers)
  - Pool / cabin / 5BR features that drive STR occupancy
  - STR insurance (Proper / Slice / CBIZ) sourced pre-closing

watch_outs:
  - STR market regulatory eligibility is GATING — 0% approval in Nashville residential zones (HEX-003) and NYC (HEX-002, Local Law 18) regardless of borrower strength
  - First-time STR (no host history) forced 25% AirDNA haircut + 12mo reserves + more expensive cabin appraisal (SWR-004, -6 score impact)
  - STR appraisal costs $850-$900 (vs. $650 standard)
  - +25-75bps rate premium over LTR DSCR
  - Markets with pending STR regulation changes (Phoenix, Austin) require permit verification + 6mo operating history (SWR-014, -7 score impact)

search_queries:
  - "DSCR loan Airbnb"
  - "STR investment property financing"
  - "AirDNA DSCR loan"
  - "short term rental mortgage no income"
  - "DSCR loan STR permit"
forum_signals:
  - BiggerPockets STR subforum (Airbnb/VRBO strategy)
  - Reddit r/airbnb_hosts questions about financing STR acquisitions
  - Mentions of STR-permissive markets (Panama City Beach, Gatlinburg, Scottsdale)

scoring:
  approval_likelihood: 9
  documentation_cleanliness: 7
  rent_support_realism: 6
  repeat_borrow_likelihood: 8
  margin_loan_size_potential: 7
  compliance_friendliness: 7
  marketing_reachability_special_ad_category: 8
  FDI_weighted: 7.55

evidence_case_ids: [CF-006, CF-012, CF-013, CF-014, CF-015, CF-016]
evidence_cluster_ids: [AP-003, NP-001]
false_positive_risks_referenced: [FP-012, FP-013]
notes: |
  Geo-gated persona — STR market regulatory eligibility is the single most
  preventable decline driver in CF-01 sample (CF-015 Nashville + CF-016 NYC both
  declined at 720+ FICO + 12mo reserves + 1.31 DSCR despite strong borrower
  profiles). FF-08 must pair HEX-002/003/014 (STR regulatory) with a market-lookup
  tool — borrowers often don't know their city's STR rules. AC-09 must redirect
  NYC/Nashville STR inquiries to STR-permissive markets OR LTR-pivot path
  (FP-012). Two sub-segments: (a) experienced STR with 24mo+ host history
  (best-tier pricing — CF-013); (b) first-time STR with AirDNA projection only
  (worst-tier haircut — CF-014). GS-07 should map SA-007 to the four STR-permissive
  MSAs (Panama City Beach FL, Destin FL, Scottsdale AZ, Gatlinburg TN) with
  regulatory-status flag.
```

### SA-008 — The Credit-Scarred Cash-Rich Rebuilder (P7 enriched)

```yaml
persona_id: SA-008
persona_name: The Credit-Scarred Cash-Rich Rebuilder
persona_lineage: Charter P7 (credit-scarred but cash-rich operator) + AP-008 (post-seasoning credit-scarred)
one_line_description: Post-bankruptcy/post-foreclosure investor (48mo+ seasoning) buying Midwest 2-4 unit cash-flow property with 30-35% down + 12-18mo reserves.

profile:
  experience_level: 2_5_doors | 6_20_doors
  typical_age_band: mid-career to pre-retirement
  employment_pattern: self_employed | mixed
  entity_structure: LLC
  financial_sophistication: intermediate
  intent_signal: searching for "DSCR loan after bankruptcy" / "DSCR loan after foreclosure"

approval_fingerprint:
  DSCR_band: [1.30, 1.45]
  FICO_band: [620, 659]   # below 660 standard floor; above 620 specialty floor
  LTV_band: [0.65, 0.70]   # 30-35% down (reduced from 75% standard)
  reserves_months_band: [12, 18]
  property_type_fit: [2-4_unit, SFR]
  occupancy_fit: [long_term_rental]
  entity_fit: [LLC]
  geo_fit: [OH-Cleveland, OH-Cincinnati, MO-StLouis, IN-Indianapolis, PA-Pittsburgh]
  typical_loan_size_band: $150K-$250K

accelerants:
  - Chapter 7 bankruptcy discharged 48+ months (past 4-year standard seasoning)
  - Foreclosure discharged 36+ months (past 3-year standard seasoning)
  - Post-event credit rebuild: 3-6mo on-time payments, utilization <30%
  - 30-35% down payment (vs. 20-25% standard)
  - 12+ months PITIA reserves (vs. 6mo standard)
  - DSCR 1.30+ well above 1.25 best-tier
  - Midwest 2-4 unit cash-flow-rich property (Cleveland cited as "highest cash-flow yields" market)
  - LLC vesting
  - Specialty lender match (Bluestone 550 FICO floor; AHLend 620; America 640)

watch_outs:
  - HEX-007 (foreclosure <36mo standard / <24mo specialty with 700+ FICO) — borrower at 680 FICO + 30mo seasoning was declined (CF-024)
  - HEX-008 (Chapter 7 <48mo standard / <24-36mo specialty) — seasoning clearance is gating
  - HEX-006 (recent mortgage late <12mo) is universal hard-stop regardless of seasoning — CF-027 declined at 4mo post-late
  - HEX-009 (unresolved mortgage delinquency / uncured forbearance) — must be cured before application
  - Borrower-education gap: many credit-scarred borrowers mistakenly believe "DSCR = no personal credit review" (SWR-013)
  - Reduced LTV + increased reserves + rate premium is the universal compensator package — borrower must accept pricing premium (+50-100bps)

search_queries:
  - "DSCR loan after bankruptcy"
  - "DSCR loan after foreclosure"
  - "investment property loan bad credit"
  - "DSCR loan 620 FICO"
  - "Bluestone DSCR loan requirements"
forum_signals:
  - BiggerPockets credit-recovery subforum
  - Reddit r/personalfinance and r/realestateinvesting threads on rebuilding after bankruptcy
  - Mentions of "second chance" or "post-bankruptcy" investor financing

scoring:
  approval_likelihood: 7
  documentation_cleanliness: 6
  rent_support_realism: 9
  repeat_borrow_likelihood: 6
  margin_loan_size_potential: 6
  compliance_friendliness: 8
  marketing_reachability_special_ad_category: 8
  FDI_weighted: 7.00

evidence_case_ids: [CF-024, CF-028]
evidence_cluster_ids: [AP-008, NP-003, NP-009]
false_positive_risks_referenced: [FP-001, FP-008, FP-009]
notes: |
  Most false-positive-exposed persona in the library per NP-04 handoff notes.
  AC-09 must NOT use copy like "no recent credit events" / "clean credit only" /
  "660+ FICO required" — each repels a fundable SA-008 cohort. The persona's
  defining feature is *past-seasoning* (48mo+ post-bankruptcy, 36mo+ post-
  foreclosure) + *present-cash-reserves* (12-18mo) + *present-DSCR strength*
  (1.30+). CF-028 (645 FICO + 60mo post-bankruptcy + 70% LTV + 12mo reserves
  approved) is the canonical positive counterexample; CF-024 (680 FICO + 30mo
  post-foreclosure declined) is the canonical decline. FF-08 must encode
  HEX-007/008/009 as triage questions — defer-or-route-to-specialty, NOT
  permanent rejection. GS-07 should map SA-008 to Midwest 2-4 unit cash-flow
  markets (Cleveland, Cincinnati, St. Louis, Indianapolis, Pittsburgh).
```

### SA-009 — The Permitted-ADU California Leverage Player (P8 enriched)

```yaml
persona_id: SA-009
persona_name: The Permitted-ADU California Leverage Player
persona_lineage: Charter P8 (ADU / hybrid rental owner) + AP-007 (Permitted-ADU SFR)
one_line_description: California ADU-permit holder using SFR-with-permitted-ADU classification to unlock 75-80% LTV and ADU rental income in DSCR.

profile:
  experience_level: 2_5_doors | 6_20_doors
  typical_age_band: mid-career to pre-retirement
  employment_pattern: self_employed | mixed
  entity_structure: LLC
  financial_sophistication: advanced
  intent_signal: searching for "DSCR loan ADU" / "ADU rental income mortgage"

approval_fingerprint:
  DSCR_band: [1.20, 1.30]
  FICO_band: [700, 740]
  LTV_band: [0.75, 0.80]   # SFR classification unlocks 75-80%
  reserves_months_band: [6, 6]
  property_type_fit: [SFR_with_permitted_ADU]
  occupancy_fit: [long_term_rental]
  entity_fit: [LLC]
  geo_fit: [CA-LosAngeles, CA-SanDiego, CA-BayArea]
  typical_loan_size_band: $700K-$1.2M

accelerants:
  - ADU permit verified (LA DBS / city building & safety)
  - Separate lease for ADU + 2+ months rent receipts
  - Form 1007 market rent analysis supports both rents (primary + ADU)
  - ADU has private entrance, kitchen, bathroom, sleeping area (accessory dwelling complete)
  - SFR-with-ADU classified as SFR (not duplex) per Harpoon Capital → unlocks 75-80% LTV (vs. 70-75% for 2-4 unit)
  - ADU contributory value counted in appraisal (loan amount based on combined value)
  - ADU rental income ($1,600/mo in CF-020) counted in DSCR — material lift to qualifying ratio
  - California ADU-permit density (LA DBS reports ~12,000 ADU permits issued 2017-2024) = deep comp set for appraisal
  - LLC vesting

watch_outs:
  - UNPERMITTED ADU is a different pathway — mainline lender excludes ADU income → DSCR drops to floor (CF-021: 1.40 → 1.00); specialty-lender pivot at 70% LTV + 25bps premium (SWR-015, NP-007)
  - ADU permit verification cycle 2-4 weeks at LA DBS / San Diego DSD
  - Appraiser must comment on ADU design/location consistent with neighborhood norms
  - California property values mean large loan amounts but also higher appraisal-risk exposure
  - HEX-016: property with 5+ units (5-8 unit) routes to AHLend specialty only — ADU + SFR = 2 units = SFR classification, not 5+

search_queries:
  - "DSCR loan ADU"
  - "ADU rental income mortgage"
  - "California ADU financing investment"
  - "SFR with ADU DSCR loan"
  - "ADU appraisal DSCR"
forum_signals:
  - BiggerPockets California subforum
  - Reddit r/ADU and r/realestateinvesting CA threads
  - LA DBS / San Diego DSD ADU-permit holder communities

scoring:
  approval_likelihood: 8
  documentation_cleanliness: 7
  rent_support_realism: 8
  repeat_borrow_likelihood: 7
  margin_loan_size_potential: 9
  compliance_friendliness: 8
  marketing_reachability_special_ad_category: 6
  FDI_weighted: 7.75

evidence_case_ids: [CF-020, CF-021]
evidence_cluster_ids: [AP-007, NP-007]
false_positive_risks_referenced: [FP-005]
notes: |
  Large-loan California niche ($700K-$1.2M). ADU income counting is the unlock —
  same property with ADU excluded qualifies at ~30% lower loan amount (per CF-021
  mainline-lender calculation). Two sub-pathways within this persona: (a) permitted
  ADU (clean approve at 75-80% LTV — CF-020); (b) unpermitted ADU (specialty-
  lender pivot at 70% LTV + 25bps premium — CF-021, FP-005). FF-08 must capture
  ADU permit status as a triage branch — NOT auto-reject unpermitted ADU. EG-06
  should explore the unpermitted-ADU specialty path as edge-case gold. GS-07
  should map SA-009 to CA-LosAngeles, CA-SanDiego, CA-BayArea MSAs with
  ADU-permit density flag.
```

### SA-010 — The ITIN US-Resident Investor (NEW)

```yaml
persona_id: SA-010
persona_name: The ITIN US-Resident Investor
persona_lineage: NEW persona from AP-006 (ITIN US-Resident Investor) + NP-04 FP-002
one_line_description: Legal US resident with work permit + ITIN (no SSN) buying 2-4 unit rentals in Miami FL via ITIN-tier DSCR.

profile:
  experience_level: 2_5_doors
  typical_age_band: mid-career to pre-retirement
  employment_pattern: mixed   # US W2-equivalent + work permit
  entity_structure: LLC
  financial_sophistication: intermediate
  intent_signal: searching for "ITIN DSCR loan" / "DSCR loan no SSN"

approval_fingerprint:
  DSCR_band: [1.15, 1.25]
  FICO_band: [660, 700]   # ITIN-based FICO from limited US credit file
  LTV_band: [0.70, 0.80]   # ITIN tier between pure FN and standard
  reserves_months_band: [9, 12]   # higher than 6mo standard due to thin credit
  property_type_fit: [2-4_unit]   # 2-4 unit preferred: higher rents support DSCR with thinner credit
  occupancy_fit: [long_term_rental]
  entity_fit: [LLC]
  geo_fit: [FL-Miami, TX-Houston, CA-LosAngeles]
  typical_loan_size_band: $400K-$500K

accelerants:
  - ITIN issued via CAA (Certified Acceptance Agent) — 11+ weeks pre-application
  - 9 months PITIA reserves (vs. 6mo standard)
  - 12mo bank statements + employment verification letter supplementing thin credit file
  - 2 credit cards + 1 prior auto loan with 18mo US credit history
  - 2-4 unit property: combined unit rents ($4,900/mo on $560K = 1.05% rent GRM) support DSCR
  - US residency + work permit (vs. pure FN) reduces AML friction
  - LLC vesting
  - DSCR 1.20+ clears 1.00-1.15 2-4 unit minimum but below 1.25 best-tier

watch_outs:
  - HEX-010/011 do NOT apply to ITIN borrowers (they are US residents, not foreign nationals) — FF-08 must distinguish ITIN from FN
  - SWR-012: ITIN borrower with limited US credit history (<24mo, <3 tradelines) requires 12mo bank statements + employment verification + 9mo reserves (-6 score impact)
  - ITIN pricing sits between pure FN and US borrower (+25-75bps) — borrower must accept pricing premium
  - 2-4 unit property preference creates Airbnb/STR temptation — but ITIN tier DSCR is LTR-only at most lenders
  - ITIN underwriting adds 5-7 days to standard cycle
  - Bilingual (Spanish/Portuguese) intake processing often needed

search_queries:
  - "ITIN DSCR loan"
  - "DSCR loan no SSN"
  - "ITIN investment property loan"
  - "DSCR loan work permit"
  - "prestamo DSCR ITIN"   # Spanish-language query
forum_signals:
  - BiggerPockets immigrant-investor threads (limited)
  - Reddit r/immigration and r/USExpats questions about ITIN financing
  - Spanish-language real estate investor communities (Facebook groups, BiggerPockets en Español)

scoring:
  approval_likelihood: 7
  documentation_cleanliness: 6
  rent_support_realism: 8
  repeat_borrow_likelihood: 7
  margin_loan_size_potential: 7
  compliance_friendliness: 7
  marketing_reachability_special_ad_category: 6
  FDI_weighted: 6.95

evidence_case_ids: [CF-019]
evidence_cluster_ids: [AP-006]
false_positive_risks_referenced: [FP-002]
evidence_tier: guideline_inferred
notes: |
  NEW persona per charter guidance (AP-006). FP-002 (ITIN borrower) is the
  canonical false-positive risk — conventional funnels reject "no SSN" but
  ITIN-tier DSCR lenders (AHLend, America Mortgages, Angel Oak) accept. AC-09
  must NOT use copy "SSN required" or "US citizens only" — repels fundable
  SA-010 cohort. Bilingual landing pages + Spanish/Portuguese campaigns
  critical for reachability. SA-010 is distinct from SA-005/SA-006 (foreign
  national) — ITIN borrowers are US RESIDENTS with work permits, not foreign
  nationals; they have US credit files (thin, 18mo) vs. none. LTV band
  (70-80%) is between standard FN (60-75%) and US borrower (75-80%). EG-06
  should explore deeper ITIN edge-case opportunities (e.g., ITIN with 36mo+
  US credit history unlocking standard-tier pricing).
```

### SA-011 — The Compensated-Exception Shopper (NEW)

```yaml
persona_id: SA-011
persona_name: The Compensated-Exception Shopper
persona_lineage: NEW persona from AP-009 (Compensated-Exception Approval — Shop-the-Decline-Letter) + NP-04 FP-005/006/007/010/011/014
one_line_description: Sophisticated borrower whose file is fundable but requires specialty-lender triage after an overlay-driven decline elsewhere.

profile:
  experience_level: 2_5_doors
  typical_age_band: mid-career to pre-retirement
  employment_pattern: self_employed | mixed
  entity_structure: LLC
  financial_sophistication: advanced
  intent_signal: searching for "DSCR loan after decline" / "non-warrantable condo DSCR" / "unpermitted ADU DSCR"

approval_fingerprint:
  DSCR_band: [1.00, 1.40]   # wide range — DSCR often NOT the issue
  FICO_band: [710, 720]
  LTV_band: [0.70, 0.75]   # 70% after pivot
  reserves_months_band: [6, 6]
  property_type_fit: [SFR_with_unpermitted_ADU, non_warrantable_condo, condotel, SFR_with_open_violations]
  occupancy_fit: [long_term_rental, short_term_rental]
  entity_fit: [LLC]
  geo_fit: [NY-Setauuket, CA-SanDiego, NC-Charlotte, multi-state]
  typical_loan_size_band: $220K-$850K

accelerants:
  - "Shop the decline letter" playbook — original decline reason triaged to specialty lender
  - Borrower willingness to accept LTV haircut / rate premium / conditions (vs. walking away)
  - 6+ months reserves + DSCR ≥1.25 underlying file strength (the decline was overlay-driven, not file-fundamental)
  - Documented compensating-factor package (reduced LTV, increased reserves, specialty lender match)
  - Borrower sophistication — these borrowers understand the specialty-lender landscape

watch_outs:
  - Specialty-lender matches add 1-2 weeks to underwriting cycle
  - +25bps rate premium for unpermitted-ADU overlay (CF-021)
  - Condotel requires 30-35% down + 12mo operating history at commercial-facing DSCR (CF-022)
  - Non-warrantable condo borrower profile strength does not need to change — just re-shop (CF-023)
  - 401(k) reserves miscalc is the most common reversible decline — FF-08 should auto-apply 60% haircut in intake tool (CF-026, SWR-001)
  - Open violations require strategic coordination + lender exception at 70% LTV (CF-007, SWR-006)

search_queries:
  - "DSCR loan after decline"
  - "non-warrantable condo DSCR loan"
  - "unpermitted ADU DSCR lender"
  - "condotel DSCR financing"
  - "declined DSCR loan what now"
  - "401k reserves DSCR lender"
forum_signals:
  - BiggerPockets "I got declined" threads
  - Reddit r/realestateinvesting posts about lender rejection
  - Mentions of "Visio Lending" / "Kiavi" (specialty STR-condotel) or specialty DSCR lenders
  - Forum discussions of property-type overlays at standard DSCR lenders

scoring:
  approval_likelihood: 7
  documentation_cleanliness: 5
  rent_support_realism: 8
  repeat_borrow_likelihood: 6
  margin_loan_size_potential: 6
  compliance_friendliness: 7
  marketing_reachability_special_ad_category: 9
  FDI_weighted: 6.65

evidence_case_ids: [CF-007, CF-021, CF-022, CF-023, CF-026]
evidence_cluster_ids: [AP-009, NP-002, NP-005, NP-006, NP-007]
false_positive_risks_referenced: [FP-005, FP-006, FP-007, FP-010, FP-011, FP-014]
notes: |
  NEW persona per charter guidance (AP-009). Per AP-03 caveat #6, this is a
  PROCESS-pattern persona — the borrower's defining feature is their JOURNEY
  (decline → re-shop → specialty approve), not their static profile. Highest
  reachability in the library (9) because these borrowers explicitly Google
  "DSCR loan after decline" / "non-warrantable condo DSCR" / "declined by
  lender DSCR". FF-08 MUST implement "What was your decline reason?" as a
  triage question — routes to specialty-lender intake, NOT auto-rejection.
  This persona has the HIGHEST false-positive risk density in the library —
  6 of NP-04's 15 FP patterns apply (FP-005/006/007/010/011/014). AC-09
  should craft landing pages that name specific decline reasons ("Declined
  for unpermitted ADU? We can help." / "Condotel declined at standard DSCR?
  Specialty programs available."). EG-06 should treat SA-011 as the
  canonical edge-case persona for deeper exploration. TS-10 score: 30-50
  with specialty-routing flag (per NP-04 handoff notes), NOT 0.
```

### SA-012 — The BRRRR Refinance Cyclist (NEW)

```yaml
persona_id: SA-012
persona_name: The BRRRR Refinance Cyclist
persona_lineage: NEW persona from AP-001 accelerant #12 (BRRRR execution) + CF-010 / CF-002 evidence
one_line_description: Active BRRRR cyclist refinancing hard-money purchase+rehab into DSCR cash-out 6mo after acquisition to recycle capital.

profile:
  experience_level: 2_5_doors | 6_20_doors
  typical_age_band: early-career to mid-career
  employment_pattern: self_employed | mixed
  entity_structure: LLC
  financial_sophistication: advanced
  intent_signal: searching for "DSCR loan BRRRR" / "refinance hard money DSCR"

approval_fingerprint:
  DSCR_band: [1.28, 1.49]   # post-rehab DSCR typically strong
  FICO_band: [700, 740]
  LTV_band: [0.75, 0.75]   # 75% of post-rehab ARV
  reserves_months_band: [6, 6]
  property_type_fit: [SFR, 2-4_unit]
  occupancy_fit: [long_term_rental]
  entity_fit: [LLC]
  geo_fit: [TN-Memphis, IN-Indianapolis, OH-Cleveland, AL-Birmingham, multi-state]
  typical_loan_size_band: $100K-$350K

accelerants:
  - 6+ months seasoning from initial hard-money purchase (GL-02 universal seasoning minimum)
  - Post-rehab appraisal supports DSCR (CF-010: $148K ARV vs. $114K all-in = $34K spread)
  - Form 1007 market rent on post-rehab condition (CF-010: $1,425/mo appraised market rent)
  - Hard-money payoff documented (CF-010: $91,200 hard-money payoff at refi)
  - Capital returned to borrower at refi (CF-010: $10,352 net cash to borrower)
  - Prepay-penalty acceptance (5/4/3/2/1) unlocks pricing for repeat borrowers
  - Pre-existing lender relationship — CF-002 archetype closed 18 BRRRR-style loans with established lenders at 14-19 day closes
  - LLC vesting
  - BRRRR cycle compresses capital reinvestment timeline — borrower is ready for next acquisition within 30-60 days of refi close

watch_outs:
  - Loan amount below $100K-$150K program minimum (HEX-012) — small-market BRRRR properties (Memphis, Birmingham) can hit this floor; CF-010 loan amount $111K is just above floor
  - 6mo seasoning is universal minimum — applications before 6mo auto-decline (no compensator override)
  - Hard-money interest rate (11.5% in CF-010) must be modeled in BRRRR math — borrower must understand carry cost
  - Post-rehab appraisal risk — if rehab quality is poor, appraisal comes in below ARV estimate (SWR-008 appraisal-risk flag)
  - Repeat-borrower velocity can mask deteriorating borrower profile — lender must re-underwrite each file, not rely on relationship

search_queries:
  - "DSCR loan BRRRR"
  - "refinance hard money DSCR"
  - "BRRRR refinance seasoning requirements"
  - "DSCR cash out after rehab"
  - "BRRRR refinance 6 month rule"
forum_signals:
  - BiggerPockets BRRRR subforum (high activity)
  - Reddit r/realestateinvesting BRRRR strategy threads
  - Mentions of "BRRRR refinance", "seasoning", "hard money payoff"
  - Discussion of cash-on-cash returns after refi

scoring:
  approval_likelihood: 8
  documentation_cleanliness: 7
  rent_support_realism: 8
  repeat_borrow_likelihood: 10
  margin_loan_size_potential: 5
  compliance_friendliness: 9
  marketing_reachability_special_ad_category: 8
  FDI_weighted: 7.80

evidence_case_ids: [CF-010, CF-002, CF-011]
evidence_cluster_ids: [AP-001, AP-002]
false_positive_risks_referenced: [FP-015]
notes: |
  NEW persona derived from AP-001's accelerant #12 (BRRRR execution). SA-012
  is distinct from SA-004 (Equity-Tapping Refinancer) by borrower journey:
  SA-012 is ACTIVELY CYCLING capital (hard-money purchase → 6mo seasoning
  → DSCR refi → next acquisition within 30-60 days); SA-004 is stabilizing
  a long-held portfolio (1-3yr operating history → cash-out for next
  acquisition). SA-012 has the HIGHEST repeat-borrow score (10) in the
  library — CF-002 archetype closed 18 loans from this pattern. Margin score
  is only 5 (small per-loan balances $100-350K) but velocity compensates:
  5-6 loans/year per borrower is typical. FF-08 should ask "Is this a BRRRR
  refinance?" as a triage question to capture 6mo-seasoning flag. AC-09
  should target Google Search "BRRRR refinance" / "DSCR loan after hard
  money" — high-intent niche. EG-06 should explore the small-loan BRRRR
  edge case (loan amounts just above $100K-$150K floor — CF-010 at $111K
  is right at the edge).
```

---

## Part 2: Persona Library Summary

### FDI Ranking (high → low)

| Rank | Persona | FDI | Charter P# | Cluster | Loan Size Band | Top Geo |
|---:|---|---:|---|---|---|---|
| 1 | SA-002 Multi-State Portfolio Scaler | 8.90 | P2 upgraded | AP-002 | $1M-$3.2M | Multi-state, MD, CA, OH, NC |
| 2 | SA-001 Cash-Flow Optimizer | 7.85 | P1 | AP-001 + AP-002 | $150K-$500K | IN, TN, MI, OH, NC, AL |
| 3 | SA-004 Equity-Tapping Refinancer | 7.80 | P4 | AP-002 + NP-010 | $300K-$1.5M | NC, OH, FL, multi-state |
| 3 | SA-012 BRRRR Refinance Cyclist | 7.80 | NEW | AP-001 accel #12 | $100K-$350K | TN, IN, OH, AL |
| 5 | SA-009 Permitted-ADU CA Leverage | 7.75 | P8 | AP-007 | $700K-$1.2M | CA-LA, CA-SD, CA-BayArea |
| 6 | SA-003 Cash-Strong First-Timer | 7.65 | P3 | AP-001 first-time | $150K-$350K | IN, TN-Gatlinburg, NC |
| 7 | SA-007 STR Permissive-Market Operator | 7.55 | P6 | AP-003 | $290K-$600K | FL coast, AZ, TN-Smokies |
| 8 | SA-005 Strong-Credit Foreign National | 7.50 | P5a | AP-004 | $300K-$500K | TX, FL |
| 9 | SA-008 Credit-Scarred Cash-Rich Rebuilder | 7.00 | P7 | AP-008 | $150K-$250K | OH, MO, IN, PA |
| 10 | SA-010 ITIN US-Resident Investor | 6.95 | NEW | AP-006 | $400K-$500K | FL-Miami, TX, CA |
| 11 | SA-011 Compensated-Exception Shopper | 6.65 | NEW | AP-009 | $220K-$850K | NY, CA, NC, multi-state |
| 12 | SA-006 No-Credit Foreign National | 6.50 | P5b | AP-005 | $200K-$400K | FL |

### Top 3 by FDI
1. **SA-002 Multi-State Portfolio Scaler (8.90)** — highest LTV per-loan revenue via portfolio/blanket structures; near-certain repeat borrowing.
2. **SA-001 Cash-Flow Optimizer (7.85)** — volume play; smaller per-loan balances but highest velocity (5-6 loans/year per borrower).
3. **SA-004 Equity-Tapping Refinancer (7.80, tied with SA-012)** — refi-to-buy pattern; high repeat conversion.

### Bottom 3 by FDI (still fundable — do NOT screen out)
1. **SA-006 No-Credit Foreign National (6.50)** — fundable but operationally expensive; smallest loan sizes; hardest to reach on Meta.
2. **SA-011 Compensated-Exception Shopper (6.65)** — fundable but requires specialty-lender match; highest false-positive risk density (6 FP patterns apply); highest reachability (9).
3. **SA-010 ITIN US-Resident Investor (6.95)** — fundable via specialty ITIN tier; bilingual processing required; guideline-inferred evidence tier.

### Investment Tier Grouping (for downstream prioritization)

| Tier | Personas | Rationale |
|---|---|---|
| **Tier 1 (anchor personas)** | SA-002, SA-001, SA-004, SA-012, SA-009 | FDI ≥ 7.75; large loan sizes or highest velocity; cleanest documentation; highest repeat-borrow likelihood |
| **Tier 2 (specialty personas)** | SA-003, SA-007, SA-005, SA-008 | FDI 7.00-7.65; meaningful volume; Google Search intent high; specialty-lender match or education-first pathway |
| **Tier 3 (edge-case personas)** | SA-010, SA-011, SA-006 | FDI 6.50-6.95; lower volume but high-opportunity (non-obvious fundable borrowers conventional funnels miss); route to EG-06 for deeper edge-case exploration |

---

## Part 3: Cross-Agent Handoff Notes

### For FF-08 (Funnel Friction Mapper)

**Persona-routing triage questions** (in priority order — top 5 most leverage):
1. **"How many investment properties do you currently own?"** — routes SA-003 (first-time) vs. SA-001 (1-5 doors) vs. SA-002 (10+ doors) vs. SA-004 (refinancer) vs. SA-012 (BRRRR cyclist).
2. **"Is this property intended as your primary residence, second home, or personal-use vacation home?"** — HEX-001 universal hard-stop; routes primary-residence borrowers OUT of DSCR funnel.
3. **"What is your citizenship/residency status? US citizen / permanent resident (SSN) / US resident with work permit (ITIN) / foreign national?"** — routes SA-001/002/003/004/007/008/009/012 vs. SA-005/006 (FN) vs. SA-010 (ITIN).
4. **"Have you been declined by another lender? If yes, what was the decline reason?"** — routes SA-011 (Compensated-Exception Shopper) to specialty-lender intake; NOT auto-rejection.
5. **"Is the property a condotel, non-warrantable condo, or has an unpermitted ADU?"** — routes property-type overlays to SA-011 specialty pathway.

**Persona-specific FF-08 design notes:**
- SA-002 / SA-004: Trigger portfolio-level reserve documentation request (SWR-011) at 5+ financed properties.
- SA-006 / SA-005: Trigger 2-4 week FN pre-intake workstream (US LLC formation + AML paper trail assembly + 60-90 day US bank seasoning) — NOT auto-reject.
- SA-007: Pair STR market regulatory question with market-lookup tool (HEX-002/003/014) — borrowers often don't know their city's STR rules.
- SA-008: Encode HEX-006/007/008/009 (credit event seasoning + active delinquency) as triage-then-defer-or-specialty-route, NOT permanent rejection.
- SA-010: Build reserves calculator that auto-applies 60% 401(k) haircut (SWR-001) — CF-026's miscalc was the single most common reversible decline.
- SA-011: "What was your decline reason?" free-text field + dropdown of common overlay decline reasons (condotel, non-warrantable, unpermitted ADU, reserves miscalc, appraisal short, open violations).

### For AC-09 (Ad Hook & Copy Reframer)

**Per-persona copy direction:**
- **SA-002 (Portfolio Scaler):** Google Search anchor copy. "Portfolio DSCR loans up to $5M. Blanket loan multiple rental properties. No DTI limit. Repeat-borrower pricing."
- **SA-001 (Cash-Flow Optimizer):** Self-employed angle. "Your tax returns say one thing. Your rentals say another. Qualify from property income, not personal write-offs."
- **SA-003 (First-Timer):** Education-first. "First DSCR loan? If rent covers the payment and you have 6 months reserves, you may already fit. Free calculator + walkthrough."
- **SA-007 (STR Operator):** Geo-gated. "STR DSCR in Florida coast, Smokies, Scottsdale. AirDNA projection accepted. STR permit verification built in."
- **SA-008 (Credit-Scarred):** Seasoning-forward. "Bankruptcy discharged 4+ years ago? Foreclosure 3+ years? You may qualify for DSCR with 30% down + 12mo reserves."
- **SA-010 (ITIN):** Bilingual. "ITIN DSCR loans. No SSN required. US residency + work permit + 9mo reserves = fundable." (Spanish: "Préstamos DSCR con ITIN. Sin SSN. Residencia + permiso de trabajo + 9 meses reservas = calificable.")
- **SA-011 (Compensated-Exception):** Decline-letter hooks. "Declined for unpermitted ADU? Non-warrantable condo? Condotel? Specialty DSCR lenders available. Free decline-letter triage."

**Forbidden copy (repels fundable personas):** Per NP-04 Part 6 handoff — "easy approval", "1.25+ DSCR required", "660+ FICO required", "SSN required", "US citizens only", "warrantable condos only", "permitted ADU only", "no mortgage lates ever", "clean credit only", "established STR hosts only", "liquid reserves only", "no recent credit events".

### For TS-10 (Targeting & Scoring Generator)

**Lead-score weights by persona (suggested starting weights):**
- Use FDI weights as starting point: Approval 25%, Doc-clean 15%, Rent-realism 15%, Repeat 15%, Margin 15%, Compliance 10%, Reachability 5%.
- Treat DSCR 1.25-1.30 as the sweet spot (per AP-03 caveat #3) — NOT 1.40+ as the ideal.
- Encode LLC vesting as a strong accelerant (+10-15% per AP-03 Part 3 #1).
- Encode STR market eligibility as gating (0% approval without it, regardless of borrower strength).
- Apply SWR deltas (-3 to -15 per rule) as additive downward pressure; multiple SWR flags stack.
- Apply FP-pattern deltas as ZERO downward pressure — FP patterns are explicitly fundable.
- Hard-stop leads (HEX-001, HEX-009, HEX-012 outside specialty, HEX-013 outside specialty) score 0 / route-to-other-product.
- Conditional-hard leads (HEX-002/003/004/005/007/008/010/011/014/015/016) score 30-50 + route to specialty intake.
- Recoverable leads (NP-003/004/005/006/007/009/010/012) score 50-70 with manual-review flag.
- Persona-aware routing: lead-score 80+ routes to Tier 1 lender pool; 60-79 routes to Tier 2 specialty; 40-59 routes to Tier 3 edge-case intake; <40 routes to other-product.

### For GS-07 (Geo-Segment Correlator)

**Persona-to-MSA mapping priorities:**
- **SA-002 Portfolio Scaler:** Multi-state landlord-friendly clusters — TN, AR, FL, AL, OH, NC, MD.
- **SA-001 Cash-Flow Optimizer:** IN-Indianapolis, TN-Memphis, MI-GrandRapids, OH-Cleveland, NC-Charlotte, AL-Birmingham.
- **SA-007 STR Operator:** FL-PanamaCityBeach, FL-Destin, AZ-Scottsdale, TN-Gatlinburg-PigeonForge (STR-permissive MSAs only).
- **SA-008 Credit-Scarred Rebuilder:** OH-Cleveland, OH-Cincinnati, MO-StLouis, IN-Indianapolis, PA-Pittsburgh (Midwest 2-4 unit cash-flow markets).
- **SA-009 Permitted-ADU CA:** CA-LosAngeles, CA-SanDiego, CA-BayArea (ADU-permit density MSAs).
- **SA-005 Strong-Credit FN:** TX (no state income tax, landlord-friendly, fast eviction), FL (no state income tax).
- **SA-006 No-Credit FN:** FL (landlord-friendly, no state income tax, FN-lender concentration).
- **SA-010 ITIN US-Resident:** FL-Miami, TX-Houston, CA-LosAngeles (immigrant-dense MSAs + landlord-friendly).
- **SA-012 BRRRR Cyclist:** TN-Memphis, IN-Indianapolis, OH-Cleveland, AL-Birmingham (low-cost BRRRR-friendly markets).
- **SA-011 Compensated-Exception:** Multi-state — depends on the underlying property-type overlay (NY-condotel, CA-unpermitted-ADU, NC-reserves-fix).

### For EG-06 (Edge-Case Gold Miner)

**Highest-opportunity edge-case veins to extend:**
1. **SA-011 (Compensated-Exception Shopper)** — 6 of NP-04's 15 FP patterns apply; richest specialty-lender-routing opportunity. EG-06 should map each decline-reason → specialty-lender pathway.
2. **SA-008 (Credit-Scarred Cash-Rich Rebuilder)** — post-seasoning + compensator pathway is non-obvious to conventional funnels; CF-028 is canonical.
3. **SA-006 (No-Credit FN)** — operationally complex but specialty FN lenders (Angel Oak, A&D Mortgage, HomeAbroad) have dedicated programs.
4. **SA-010 (ITIN US-Resident)** — FP-002 pattern; conventional funnels universally reject; specialty ITIN lenders accessible.
5. **SA-009 (Permitted-ADU CA)** — unpermitted-ADU sub-pathway (CF-021) is the edge-case gold within the broader permitted-ADU persona.

---

## Part 4: Methodological Caveats

1. **Sample-size limitation:** AP-03's 9 clusters include 5 inferred clusters (N=1 each — AP-004, AP-005, AP-006, AP-007, AP-008). Personas SA-005, SA-006, SA-010, SA-008, SA-009 derive from these N=1 clusters; their FDI scores are guideline-informed, not statistically robust. Flagged via `evidence_tier: guideline_inferred` where applicable.
2. **Charter P5 split into two tiers (SA-005 + SA-006)** was necessary because AP-004 vs. AP-005 diverge on LTV (70-75% vs. 60-65%), reserves (9-12mo vs. 12mo), rate premium (+0.50-0.75% vs. +1.00-1.50%), and repeat-borrow likelihood. Treating P5 as a single persona would have averaged away operationally critical distinctions.
3. **SA-011 (Compensated-Exception Shopper) is a process-pattern persona**, not a static-profile persona — per AP-03 caveat #6. It is included per charter guidance but flagged for downstream agents: the persona's defining feature is the borrower's JOURNEY (decline → re-shop → specialty approve), not a fixed feature band. The wide approval_fingerprint bands (DSCR 1.00-1.40, LTV 0.70-0.75) reflect this — the underlying borrower profile varies by decline reason.
4. **SA-012 (BRRRR Refinance Cyclist) overlaps with SA-001 and SA-004** on borrower profile but is distinct on borrower JOURNEY (active capital cycling vs. stabilized operation vs. portfolio cash-out). FF-08 should treat "Is this a BRRRR refinance?" as a routing question that overrides the static-profile persona assignment.
5. **All FDI scores are honest** — not all personas score 8+. SA-006 (No-Credit FN, FDI 6.50) and SA-011 (Compensated-Exception Shopper, FDI 6.65) score in the 6.5-6.7 band because their friction is real, even though both are fundable. SA-007 (STR Operator) scores 6 on rent-realism due to AirDNA projection volatility. SA-008 (Credit-Scarred Rebuilder) scores 6 on doc-clean due to bankruptcy/foreclosure documentation burden.
6. **No protected-class proxies used.** Demographic framing is in business/investor terms throughout: "experience band" (first_time / 2_5_doors / 6_20_doors / 20+_doors), "typical_age_band" (mid-career to pre-retirement), "employment_pattern" (W2 / self_employed / foreign_national / retired / mixed). Foreign-national personas are framed by credit-country tier (UK/EU/Canada/AU vs. LatAm/Asia/Africa per AHLend/America Mortgages FN guidelines), not by ethnicity or national origin per se.
7. **Every persona traces to ≥1 AP-03 cluster + ≥1 CF-01 case ID** per quality bar. SA-012 (BRRRR Cyclist) traces to AP-001's accelerant #12 (BRRRR execution evidence from CF-010 + CF-002) — this is an accelerant-derived persona rather than a cluster-derived persona, but the case-evidence anchor is solid.

---

*End of SA-05 deliverable. Downstream agents (FF-08, AC-09, TS-10, GS-07, EG-06) should treat Part 1 as the canonical persona library, Part 2 as the FDI ranking for prioritization, Part 3 as persona-specific handoff notes, and Part 4 as honest sample-size disclosure.*
