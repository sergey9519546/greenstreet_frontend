# DSCR Intelligence System: Complete Master Knowledge Synthesis

**Date:** June 18, 2026 | **Version:** Unified v11.0 | **Source:** 29 Documents, Cross-Validated

***

## Executive Summary

This report synthesizes every document in the DSCR knowledge base into a single, deduplicated, contradiction-resolved master reference. The canonical truth across all files is: **a DSCR loan can qualify with a lender and simultaneously be a catastrophic investment.** The entire architecture — from the dual-track math to the evidence vault to the legal gates — exists to surface that conflict before capital is committed. Any tool that presents a single DSCR number is lying by omission. The system described across these documents is not a calculator; it is a **Decision Simulator built on deterministic, evidence-backed mathematics.**

The overarching business strategy is clear: **build the broker origination operation first** (sub-$25K, multi-state, 90-day path to revenue), use the Command Center software as an internal edge and lead magnet, and treat the SaaS/direct-lender ambitions as Year 2–3 graduation moves contingent on a clean origination tape.

***

## Part I: The Correct Mathematical Spine (Golden Tests — Ship Without Alteration)

### 1.1 The Dual-Track Discipline

**This is the non-negotiable core of every document in the corpus.**

**Track 1 — Lender Qualification DSCR:**
```
Track1_DSCR = QualifyingGrossRent / PITIA
```
- **Qualifying Rent Rule:** Lower of (signed lease, Form 1007 appraiser market rent). For vacant properties: use 1007 only.
- **No vacancy haircut** on 1–4 unit LTR by default. The 1007 already embeds occupancy assumptions.
- **2–4 unit caveat:** Fannie Mae Form 1007 instructions contemplate a 25% vacancy factor on 2–4 unit investment properties at lenders using Fannie-aligned underwriting. Surface and require per-lender confirmation.
- **IO denominator:** Use ITIA (Interest + Taxes + Insurance + Association dues) when IO product is selected.
- **Formula toggle:** Some lenders use NOI/PI instead of Gross/PITIA — store as a per-lender field, never blend.

**Track 2 — Investor Survival DSCR:**
```
Track2_DSCR = Gross*(1-Vacancy) - Management - Maintenance / PITIA
```
- This is a **stress output**, never a qualification input.
- A deal can PASS Track 1 and FAIL Track 2. State both. Require acknowledgment.
- If Track 2 < 1.0, display mandatory modal: *"This deal qualifies. It does not cash flow. Type I understand to proceed."*

**Flagship Golden Vector (A.2 — verified math, all implementations must reproduce these exactly):**
- Reference deal: $425,000 purchase, 75% LTV, 7.00% rate, $3,000/mo lease, $3,300 Form 1007, $5,000/yr tax, $2,000/yr insurance, $150/mo HOA
- Monthly PITIA @ 7.00%: **$2,855** (PI $2,121 + Tax $417 + Insurance $167 + HOA $150)
- Monthly PITIA @ 8.25%: **$2,993** (PI $2,254 + same non-debt items)
- Track 1 @ 7.00%: **1.05** ✅ Qualifies
- Track 2 @ 8% vacancy + 8% management: **0.88** ❌ Negative cash flow −$335/mo
- Rent break-even for Track 1 = 1.00: **$2,855/mo**
- Deal-break rate (Track 1 = 1.00 at 3,000 rent): **7.67%**
- Maximum purchase price at current terms: **$454,100**

**All stress cells, sensitivity tables, and heatmaps must reconcile back to these formulas.**

### 1.2 Corrected Rate Pricing Anchor (June 2026)

**Base anchor:** 6.125% for 740 FICO / 75% LTV / 1.0 DSCR / SFR / 30-yr fixed / 3-yr PPP. Sources: Defy Mortgage, HomeAbroad, Griffin Funding — June 2026.

**FICO Adjustments (cumulative from 6.125 base):**
| FICO Band | Rate Adj | Notes |
|-----------|----------|-------|
| 760+ | −0.10 | Best tier |
| 740–759 | 0.00 | Anchor |
| 720–739 | +0.20 | |
| 700–719 | +0.40 | |
| 680–699 | +0.70 | Cliff begins |
| 660–679 | +1.00 | Cliff |
| 640–659 | +1.40 | Very limited programs |
| 620–639 | +1.90 | |
| <620 | +2.75 | Almost no programs |

**LTV Adjustments:**
| LTV | Rate Adj |
|-----|----------|
| <65% | −0.15 |
| 65–70% | −0.05 |
| 70–75% | 0.00 (anchor) |
| 75–80% | +0.40 |
| 80–85% | +0.90 |
| >85% | +1.50 |

**Other Adjustments:**
- DSCR < 1.25: +0.15; < 1.10: +0.35; < 1.00: +0.85; < 0.75: +1.50
- 2–4 unit: +0.20; Condo: +0.125; Non-warrantable Condo: +0.50; Condotel: +0.75
- STR: +0.30; MTR: +0.10
- 40-yr Fixed: +0.25; 10-yr IO: +0.375
- No PPP: +0.40–0.80 (state-banned PPP forces this premium)
- First-time investor: +0.20
- Loan < $150K: +0.50; Loan < $100K: +0.75; Loan > $1.5M: +0.20; Loan > $2.5M: +0.40

**Rate Clamp (June 2026):** Floor = 6.00%; Ceiling = 11.50%. The old 4.75% floor is unreachable in 2026.

**Rate Triplet (always render all three, never a single rate):**
- Competitive (740 FICO, 70–75% LTV, 1.0 DSCR): **6.125–6.49%**
- Typical standard files: **6.50–7.50%**
- Thin/non-prime (low FICO/DSCR, STR, foreign national): **up to 10.75%**
- ARM from: **5.125%** (Griffin 1-yr SOFR ARM)

### 1.3 Current Market Rate Anchors (June 17, 2026)

| Index | Rate | Source |
|-------|------|--------|
| 10-Year Treasury (DGS10) | 4.44–4.47% | FRED, June 15–17, 2026 |
| 5-Year Treasury | 4.26% | Northmarq, June 2026 |
| 30-Day Avg. SOFR | 3.59% | Northmarq, June 2026 |
| Fed Effective FFR | 3.62% | FRB H.15, June 16, 2026 |
| Fed Funds Target | 3.50–3.75% | Held 4th consecutive FOMC meeting |
| Freddie Mac 30yr Fixed | 6.53% | Multiple sources, June 8, 2026 |

**Structural anchor:** DSCR 30yr Fixed = 10-yr Treasury + risk-tiered credit spread of 175–450 bps (not a flat 200–225 bps).
- Best tier (760+ FICO, 1.25+ DSCR, 70% LTV): 175–225 bps → 6.2–6.7%
- Typical file: 250–350 bps → 6.9–7.8%
- Weaker file: 350–450 bps → 7.9–8.9%
- DSCR premium over conforming: 0.50–1.25%
- Non-QM premium over QM: 0.50–2.00%

**Re-verify these anchors daily as the Treasury moves.**

***

## Part II: Reserve Requirements (Corrected June 2026)

**Base:** 6 months PITIA — this is the 2026 market center. 3 months is a best-case floor, not a starting point.

**Escalation Logic:**
| Condition | Reserve Adjustment |
|-----------|-------------------|
| FICO ≥ 740 | May reduce to 5 months at some lenders |
| FICO 660–679 | +1 month |
| FICO < 660 | +2 months |
| LTV ≥ 80% | Floor at 6 months |
| DSCR < 1.00 | Floor at 9 months (specialist programs need 6–12) |
| DSCR 1.00–1.09 | Floor at 7 months |
| STR strategy | Floor at 9 months |
| Non-warrantable Condo / Condotel | +1 month |
| Loan > $1.5M | Floor at 6 months (minimum per guidelines) |
| Loan > $2.5M | Floor at 12 months (minimum per guidelines) |
| First-time investor | Floor at 7 months |
| ≥5 other financed properties | +1 month |

**Hard cap:** 12 months maximum.

**Other property reserves:** 2 months PITIA per additional financed property (conservative standard program baseline).

**Critical caveats to surface in UI:**
1. **60-day seasoning:** Reserves must be held in verifiable liquid accounts seasoned for 60 days. Deposits >$500–$1,000 need paper trail. Begin positioning reserves ≥90 days before application.
2. **Retirement account haircut:** Most lenders count only 70% of vested 401k/IRA value. Never accept face value.
3. **Cash-out proceeds note:** Lenders generally prefer seasoned reserves. Cash-out proceeds count toward post-closing reserves but not as pre-seasoned funds.
4. **Acceptable tiers:** T1 = Cash/MMA; T2 = Brokerage; T3 = Retirement (60–80% of vested). Never: home equity, crypto, gifted, borrowed.

***

## Part III: FICO-Based LTV Hard Caps

This was a critical error in all earlier versions — now corrected and non-negotiable:

| FICO | Max LTV | Warning |
|------|---------|---------|
| ≥740 | 80% | None |
| 700–739 | 80% | None |
| 680–699 | 75% | At {FICO} FICO, most lenders cap at 75% |
| 660–679 | 70% | At {FICO} FICO, most lenders cap at 70%; overlays may require 680 |
| 620–659 | 65% | Rate could be 1–2% higher than top-tier borrower |
| First-time investor + FICO < 700 | 65% | 700 FICO required; approval not guaranteed |

**Apply this cap before every computation.** If effective LTV < requested LTV, flag the cap and display the warning.

***

## Part IV: STR Income Treatment (Corrected)

**The STR haircut was inverted in earlier builds.**

**Correct logic:**
1. Calculate **haircut rent:** `stated_STR_gross × (1 − haircut_pct)`. Haircut = 10–20% of gross STR revenue (typical 20%).
2. Calculate **LTR market fallback:** appraiser's long-term market rent comparable.
3. **Qualifying STR rent = MIN(haircut_rent, LTR_market_fallback)**. The appraisal governs — AirDNA never overrides.
4. For LTR/MTR: Qualifying rent = MIN(signed_lease, appraiser_market_rent).

**Three STR income worlds — never blend:**
- W1: Long-term rent (LTR rule above)
- W2: Projected STR (70–80% of projection; pro-STR programs may use 100%)
- W3: Documented 12-month trailing STR actuals (highest credibility, bank/platform-verified)

**STR-specific operating expenses:** 45–65% of gross (vs. 30–45% for LTR). Monthly seasonality DSCR chart is mandatory for every STR file — annual average DSCR ≥1.15 can hide months with DSCR < 0.6 in off-season.

**STR legality gate (run BEFORE any income calculation):**
- Query: city/county permits, min-stay requirements, owner-occupancy rules, HOA enforcement, pending legislation, permit caps.
- Status: CLEAR / RESTRICTED / UNCERTAIN / PROHIBITED.
- If HOA status = silent/unknown → attorney review required before any STR underwriting.
- If not CLEAR → disable STR income scenarios, display legal risk alert.

***

## Part V: Prepayment Penalty Module (Business-Purpose Aware — June 17, 2026)

### 5.1 The Branching Gate (run in this order before any PPP output)
1. **Business-purpose + entity-vested?** → Most consumer-mortgage PPP statutes don't apply. PPP generally available subject to lender state matrix.
2. **Bank/depository lender?** → Stricter consumer rules may apply even to investors.
3. **Individual vesting OR consumer-purpose?** → Apply consumer-statute matrix below.
4. Output: ALLOWED / RESTRICTED / PROHIBITED / AMBIGUOUS + reason + governing branch.

**Critical:** Lender matrices differ within a state. Never present one lender's NJ matrix as universal law.

### 5.2 State PPP Matrix (June 17, 2026 — Entity-Vested, Business-Purpose Unless Noted)

| State | Treatment | Provenance |
|-------|-----------|------------|
| **MN** | HF 3437 ENACTED April 23, 2026, effective August 1, 2026. Stat. 58.137 applies ONLY to personal/family/household loans. Business-purpose DSCR loans NOT reached. | Verified statute + HF 3437 text |
| **OH** | 1–2 unit: PPP ≤1% original principal, max 5 years. Small loans below indexed threshold ($116,356 in 2026 — **re-confirm annually each January**) may not carry penalty. PENALTY BASE = ORIGINAL principal per ORC 1343.011. 3–4 unit: no restriction. | Verified ORC 1343.011 |
| **PA** | 1–2 unit: banned below indexed threshold ($329,411 in 2026 — **re-confirm annually each January**). Business-purpose above threshold allowed. 3–4 unit: outside restriction. | Verified statute (Act 6 / 406 LIPL) |
| **NJ** | N.J.S.A. 46:10B-2 bars mortgagor non-corp individuals. Entities allowed but lender matrices split — some LLC OK, some require C-corp only, NOT LLC. Recourse guarantors don't affect eligibility. **NJ defaults to HIGH-RISK until specific lender matrix confirms entity type.** | Verified statute + lender matrices |
| **IL** | Individuals barred and/or APR-gated (>8%); entities subject to APR fall-rate tests. | Verified matrix |
| **AK** | Individual: NOT allowed. LLC/Corp: ALLOWED. | Verified lender matrix 2026 |
| **MS** | Declining structures only; flat banned (75-17-31). | Verified statute |
| **AR** | Allowed first 3 years. PENALTY BASE = REMAINING balance (3-2-1). | Verified state PPP matrix |
| **WI/ME** | No PPP on ARM; WI cap = 2 months interest. | Verified pattern |
| **WV** | Max 3 years, 1%. | Verified matrix |
| **RI** | Max 1 year, 2%. | Verified matrix |
| **SC** | Not allowed above $690,000. | Verified matrix |
| **OK/TX** | Banned if APR >13%/12%. | Verified matrix |
| **NY** | Banking Law 6-l bars PPP on residential EXCEPT business-purpose loans — use- and entity-dependent. | Verified AAPL |
| **WA** | Some matrices: no PPP on 5/6 ARM. Older blanket ARM-ban claim UNVERIFIED — do not encode as blanket. | Unverified — verify with counsel |
| **ND/KS/SD/MD** | De facto prohibited at many lenders (program usury). | Market pattern |
| **NM** | Often listed as individual ban; entity treatment varies by lender. | Market pattern — verify |

**Penalty base per state:** Store `penalty_base` as a per-state, per-loan field.
- DEFAULT: REMAINING balance (step-rate; market-standard DSCR contract)
- STATUTORY OVERRIDE: ORIGINAL principal (OH and some others per state law)

**Sale/refi trigger:** Default triggers on BOTH sale AND refi. Confirm exemption language in actual loan documents.

**Standard structures:** 5-4-3-2-1 / 3-2-1 / flat / 5-5-5 / floored 5-4-3-3-3 / six-months-interest / 20-yr partial-prepay allowance / assumability.

**No-PPP repricing:** If PPP is unavailable/illegal → reprice +0.40–0.80% rate, recompute PI, PITIA, and BOTH tracks, then re-run return model. A marginal deal can fail purely because its state/vesting bans the rate subsidy.

**OH and PA annually-indexed thresholds:** Store with `effective_year` field. Re-confirm each January.

***

## Part VI: Tax Engine (UPGRADED — OBBBA Encoded as Law)

### 6.1 Depreciation

- Residential building: 27.5-year straight-line.
- Building basis = Purchase Price − Land Value. **Land is NOT depreciable** — require land allocation input (typically 10–25% of purchase price; higher in urban/coastal markets).
- Annual depreciation = Building Basis ÷ 27.5.

### 6.2 Bonus Depreciation (OBBBA — Hardcoded, Not a Placeholder)

The One Big Beautiful Bill Act (OBBBA), signed January 2025, **permanently reinstated 100% bonus depreciation** for qualified property acquired after January 19, 2025.

| Acquisition Date | Placed in Service | Bonus Authority |
|-----------------|-------------------|-----------------|
| After Jan 19, 2025 | Any year | **100% (OBBBA permanent)** |
| Jan 1–19, 2025 | 2025 | 40% (TCJA phase-down) |
| Jan 1–19, 2025 | 2026 | 20% (TCJA phase-down) |
| Before Jan 1, 2025 | 2025 | 40% |
| Before Jan 1, 2025 | 2026 | 20% |

Bonus depreciation applies to qualifying personal property (5/7/15-year class via cost segregation) — NOT to the 27.5-year residential building structure itself.

### 6.3 Cost Segregation (New — v11)

A cost segregation study reclassifies 20–40% of a property's components from 27.5-year into 5-, 7-, and 15-year depreciation. For post-1/19/25 assets: 100% first-year bonus depreciation on those components.

- **Study cost:** $2,500–$15,000 typical; smaller residential studies $750–$2,500.
- **Economic candidate threshold:** Properties ≥$450,000–$500,000.
- **Typical first-year savings:** Up to $100,000 per $1M in building value.
- **All depreciation subject to Section 1250 recapture at disposition.**

**Engine rule:** If `property_value ≥ $450,000` → prompt for cost seg election status → compute accelerated deduction by component class with bonus-dep overlay.

### 6.4 Section 1250 Depreciation Recapture

- Straight-line depreciation taken → unrecaptured 1250 gain taxed at **maximum 25% federal rate**.
- Accelerated/excess depreciation (cost-seg 5/7-year components) → taxed at **ordinary income rates** (Section 1245 recapture).
- Additional **3.8% NIIT stacks** on recapture for high-income investors.
- 1031 exchange defers both gain and recapture if structured correctly — model sell-and-pay vs. 1031-and-roll as alternate exits.

### 6.5 Net Investment Income Tax (NIIT) — New v11

**3.8% NIIT** applies to passive investment income (including rental income and capital gains) for:
- MAGI > $200,000 (single/head of household)
- MAGI > $250,000 (married filing jointly)
- MAGI > $125,000 (married filing separately)

At exit for high-income investor:
- Gain attributable to depreciation: 25% federal + 3.8% NIIT = **28.8% effective rate**
- Appreciation gain: 20% LTCG + 3.8% NIIT = **23.8% effective rate** (top bracket)

### 6.6 Passive Activity Loss (PAL) Rules

- Rental losses are generally passive — can only offset passive income.
- **Special $25,000 allowance** for active participants:
  - Full $25,000 if MAGI ≤ $100,000
  - Phases out at $0.50 per $1 over $100,000
  - Fully phased out at MAGI ≥ $150,000
  - Married filing separately: max $12,500, fully phased out at $75,000 MAGI
- **Real Estate Professional (REP) exception:** If investor meets BOTH the 750-hour test AND the 50% test → rental losses are non-passive and fully deductible regardless of MAGI.
- Suspended losses carried forward indefinitely; fully released at complete taxable disposition.

### 6.7 Property Tax Reassessment at Purchase (Highest Priority Fix)

**Using the seller's current tax bill silently overstates DSCR — this is a systemic error.**

**Engine rule — non-negotiable:**
```
reassessed_tax = PurchasePrice × effective_mill_rate(state, county)
PITIA uses reassessed_tax, NOT the seller's current bill
```

**State-specific reassessment mechanics (verified):**
- **California (Prop 13):** Resets to purchase price at sale (full market value). Supplemental bill arrives post-closing for stub period. Subsequent increases capped at 2%/yr thereafter.
- **Texas:** 2–3% of market value annually. Purchase triggers reassessment to market value.
- **Florida:** Similar purchase-year reset to market value.
- **NJ, NY, IL:** Store per-state defaults; prompt confirmation for all other states.

**UI output required:** *"Seller currently pays $X/yr in property taxes. As the new buyer, you will pay approximately $Y/yr based on your purchase price of $Z. DSCR delta: Track 1 before [X] → after [Y]."*

***

## Part VII: ARM/SOFR Rate Reset Engine (New — v11)

ARM products: 6-mo SOFR, 1-yr SOFR, 5/1, 7/1, 10/1.

**Reset calculation:**
```
reset_rate = MAX(floor_rate, index + lender_margin)
# Typical DSCR ARM: margin = 250–350 bps over SOFR; floor = initial rate
# Standard cap structure: initial cap 2%, periodic cap 1–2%, lifetime cap 5–6% over initial rate
recast_payment = payment(loan_balance_at_reset, reset_rate, remaining_amortization)
Track1_at_reset = qualifying_rent / (recast_payment + taxes/12 + insurance/12 + HOA)
```

**Mandatory stress output for every ARM file:**
- At current SOFR (3.59%) + margin = current reset rate
- At SOFR 5.0% stress scenario = stressed reset rate and Track 1 DSCR at stress
- Deal-break rate at reset
- Cushion in bps

**IO + ARM double-shock:** When IO period expires simultaneously with rate reset, model the combined payment cliff explicitly. Flag the year of double-shock as a kill-criterion checkpoint.

**Conservative lender rule:** Many lenders stress-test ARM files at the fully amortizing payment at the max rate (or reset rate + 2%). Surface both.

***

## Part VIII: Insurance as a Kill Criterion (Not a Line Item)

**2026 data confirms this is a deal-level gate, not an underwriting assumption:**
- >90% of FL investors and 83% of CA investors missed deals due to insurance issues (2024 survey, RCN Capital/CJ Patrick)
- 57% of all investors nationwide reported insurance-driven missed deals
- 1-in-3 affordable housing providers experienced ≥25% premium increases
- Double-digit rate increases projected in multiple states in 2026

**Engine rule — KILL CRITERION in high-risk zones:**
```
HIGH_RISK_ZONES = [FL, CA_Coastal, CA_Wildfire, TX_Gulf, LA_Coastal]
if property_state in HIGH_RISK_ZONES AND insurance_quote_unconfirmed:
    kill_criterion = True
    verdict = "PASS — Insurance unconfirmed in high-risk zone. Do not proceed until a bindable quote is in hand."
```

**Insurance premium feeds BOTH:**
1. PITIA Track 1 denominator (property insurance is a PITIA component)
2. OpEx in Track 2/NOI computation

Model premium as volatile (+10–30% annual increase in high-risk zones) rather than static. Surface: Year 1 insurance = $X; stress-test Year 3 at +25%.

***

## Part IX: True Cost of Capital — AEY Ranking (Not Rate Ranking)

**The lender with the lowest stated rate is NOT necessarily the cheapest lender.**

**All-In Effective Yield (AEY) = XIRR of actual borrower cash flows:**
```
AEY = XIRR([-net_proceeds_at_close, P1, P2, ..., Pn, balance_n + PPP_n])
net_proceeds_at_close = LoanAmount - Points - LenderFees
```

**Render AEY at:** 12, 24, 36, and 60-month APR equivalents.

**True Cost components:**
```
TrueCost_hold = Interest_during_hold + Points + Lender/Broker/UW_fees + Lock_cost + Prepay_exit(year) + Refi_costs_if_planned
```

**Two-Quote Rule:** Always show one flex-fit lender + one rate-competitive lender, with the AEY delta in dollars. Never a single quote.

**Lender screening order:**
1. ELIGIBILITY GATE (binary): PPP legality per Part V, FICO/DSCR floor, LTV ceiling, property type, loan-size band, citizenship/ITIN, STR acceptance. Fail = "Does not meet guidelines — reason."
2. FIT TIER (qualitative): Strong / Standard / Conditional / Unlikely / Does-not-meet. Never a numeric approval probability.
3. PRICE: Anchor + levers, dated band.
4. TRUE COST: AEY at hold period.
5. CONFIDENCE: Tiebreaker ONLY — never overrides a material true-cost delta.

***

## Part X: Lender Matrix — Verified Anchors (June 17, 2026)

| Lender | Conf | Key Verified Facts | Best For | Avoid |
|--------|------|-------------------|----------|-------|
| **Griffin Funding** | 85% | All 50 states/DC. Fixed 6.125–7.5%, ARM 5.125. DSCR ≥0.75/no-ratio. Jumbo to $4M in-house. Min FICO 620 (avg 729; 2025 avg 739). June 2026: 62 loans/$20.79M; 67% cash-out; avg loan $292K; avg DSCR 1.14. Down as low as 15% (unusual). CA reserves 9/12/15 months. | Sub-1.0/no-ratio, jumbo, nationwide | Rate-shoppers outside core geography |
| **Defy Mortgage** | 80% | FICO ≥640. 85% LTV at 740 FICO/SFR purchase/1.0 DSCR (verified exception). DSCR ≥0.75. 3-mo reserve min. STR via hist/market/AirDNA. 14–21d close. Rate at 740/75%: 6.125%; at 640/75%: 7.875%. | High-leverage qualified files | 640–679 FICO + 85% LTV attempts — confirm max loan by state |
| **Easy Street Capital** | 82% | STR specialist. AirDNA 100% for pro STR investors. No min DSCR for STR origination. **Waives 12-mo STR cash-out seasoning (BRRRR edge).** From 5.75%. 80% LTV purchase / 75% cash-out. | Pro STR/AirDNA acquisitions, AirBnBRRRR | Condotel; N/A property types |
| **Lima One Capital** | 76% | Dedicated STR with AirDNA at 45%. To $2M / 80% LTV. 41 states. **BLANKET EXIT WARNING: blanket loans bind ALL properties.** Partial-release clause must be negotiated at origination. | Experienced investors, bridge-to-rental, portfolio | Single-property buyers (confirm partial-release) |
| **Kiavi** | 70% | DSCR ≥1.1 to prequalify. FICO ≥660. 6–9mo reserves. SSN required — **NO ITIN, no foreign national.** From 6% realistic (7.5–11% range). 49 states + DC. | Speed, BRRRR bridge-to-DSCR | ITIN/FN, sub-1.1 DSCR |
| **New Silver** | 72% | 30-yr. $150K–$3M. 80% LTV. DSCR ≥0.75. FICO ≥660. STR yes. Instant approval, 14–21d close. Rate typically 50–100 bps above established lenders. | Speed-sensitive, tech-forward, sub-1.0 | Pristine-file rate-shoppers |
| **Deephaven** | 65% | **STALE — highest re-verify priority.** Gross/PITIA or Gross/ITIA. Lower-of. DSCR ≥0.75. Reserves 3/6/6/12 mo. First-timer max 75% LTV. | Pending reverification | Do not use stale data in production |
| **Visio Lending** | 78% | 48 states (no AK/HI). FICO ≥680. Flex DSCR 0.75–0.99. Lower-of with NO vacancy factor — **cleanest public confirmation of Track 1 rule.** Broadest STR acceptance. 5-4-3-2-1 / no-PPP (+0.625). $75K–$2M. | STR any market, unique properties, sub-1.0 Flex | AK/HI, >$2M, pristine-file rate-shoppers |
| **American Heritage** | 65% | Invest Star DSCR ≥0.75. FICO 660 (720 better). 12-mo reserves sub-1.0. Up to 85% LTV at 760. STR: 75% projected / 100% w/ 12-mo history. STR min DSCR 1.0. | Sub-1.0 with compensating factors, STR with docs | |

**⚠️ Anchor Six:** Cannot be verified as a mortgage lender from official/public sources. The domain surfaced was an IT services company. **Remove from matrix entirely until NMLS ID, lender legal name, and current licensing footprint are verified.**

**Provenance rule:** Every lender claim must carry: `verified_date`, `provenance_label` (Verified-Primary / Verified-Secondary / Market-Pattern-Verify / Unverified), `confidence_score`, `source_url`. No record renders without all four. Confidence is a tiebreaker only — never overrides a material AEY delta.

**Counterparty continuity flag:** Track lender-continuity risk separately from data freshness. The 2022–23 market shakeout pulled lenders mid-pipeline.

***

## Part XI: DSCR Band Definitions (Production Standard)

| DSCR Band | Label | Meaning | UI Action |
|-----------|-------|---------|-----------|
| ≥1.25 | 🟢 Strong — Best Pricing Tier | Clears lender benchmark; best pricing and max LTV | Green proceed |
| 1.10–1.24 | 🟡 Solid — Standard Approval | Small pricing adjustments vs. 1.25 tier; most programs available | Green-yellow |
| 1.00–1.09 | 🟠 Thin — Passable with Right Structure | Higher reserves, slightly higher rate, tighter lender selection | Yellow — flag |
| 0.75–0.99 | 🔴 Sub-1.00 — Specialist Territory | Specialist lenders only (Griffin, Easy Street, Visio, LendingOne); 0.85–1.50% premium; tighter LTV caps | Red + compensating factors |
| <0.75 | ⛔ Not Financeable (Standard DSCR) | No-ratio program, larger down, higher rent, lower price, or alternative structure required | Hard block — show sensitivity table |

***

## Part XII: Verdict Framework

**PROCEED:** Track 1 ≥ floor + cushion ≥ 0.05; Track 2 ≥ 1.0 OR explicit appreciation/tax thesis documented; Return Grade ≥ B on after-tax IRR; no kill criteria met; ≥1 Strong/Standard lender.

**RESTRUCTURE:** One fixable gate. Return ranked rescue options:
1. Lower purchase price (strong positive on BOTH tracks)
2. Increase down payment (fastest structural fix)
3. Rate buydown (effective for modest basis — show break-even months vs. hold)
4. Shift lender matrix (solves Track A, NOT bad economics)
5. IO structure (model recast formula swap — NOI/PI vs. Gross/PITIA, 0.10–0.20x income-method swap)
6. Combination approach

**PASS:** Hard kill criteria met OR P(DSCR < 1.00) > 15% OR 5th-percentile DSCR < 0.80 OR Return Grade D with negative Track 2 and no thesis OR no eligible lender.

**KILL CRITERIA (check before lender ranking):**
- STR prohibited by city/county/HOA
- PPP illegal for this vesting/lender
- Insurance unconfirmed in high-risk zone (new v10+)
- FICO below all program floors (<620)
- Track 1 DSCR < 0.75
- Appraiser rent break-point exceeded ($4.83/mo for reference deal at $2,855 PITIA)
- Value/cash-gap unfundable
- Reserves not liquid or not in acceptable tier
- BRRRR ARV cash-out gated by seasoning (new v10+)
- Confidence < 60% on best-fit lender
- ARM double-shock year breaches DSCR floor (new v11)
- Declining-market LTV cap binds (CT, FL, IL, NJ, NY)
- Loan below lender minimum (sub-$150K floor)

**Track 2 negative — NOT a kill, but forced acknowledgment:** "This deal qualifies and loses money every month. Type 'I understand' to proceed. Proceed only if appreciation or after-tax thesis justifies the negative carry — state thesis in memo."

***

## Part XIII: Return Engine

**Accounting split (define once, enforce everywhere):**
- **EGI** = GPR × (1 − Vacancy)
- **OpEx** = Management + Maintenance + Tax + Insurance + HOA + Utilities + Turnover
- **NOI** = EGI − OpEx (NO debt, NO capex)
- **ADS** = PI × 12
- **PITIA** = ADS/12 + Tax/mo + Insurance/mo + HOA/mo (this is the LENDER denominator)
- **NOI** = the INVESTOR result. **Never mix.**

**Key metrics:**
- Cap Rate = NOI / Price
- Yield-on-Cost = Stabilized NOI / Total Cost
- Cash-on-Cash = NOI − ADS / Cash Invested
- Debt Yield = NOI / Loan Amount (target ≥9%; leverage-independent)
- Break-even Occupancy = (OpEx + ADS) / GPR
- Equity Multiple = Distributions / Equity

**Return grading (after-tax levered IRR):**
| Grade | After-tax IRR | Track 2 |
|-------|---------------|---------|
| A | ≥15% | ≥1.10 |
| B | 12–15% | ≥1.00 |
| C | 8–12% | ≥1.00 with appreciation thesis |
| D | <8% | Negative |
| F | PASS scenario | Negative IRR, hard kill, or no lender |

**Exit model:**
```
m0 = -Cash_Invested
m1..n = NOI/12 − PI
m_n = Exit_NOI/Exit_Cap − Selling_Costs − Remaining_Balance − Prepay(exit_year)
Levered_IRR = XIRR([m0, m1, ..., m_n])
```

**Sensitivity grid:** 4 hold periods (3/5/7/10 yr) × 3 exit cap scenarios × 4 rent growth rates = 48-cell matrix. A deal requiring bull cap compression + 3% rent growth to clear 12% IRR is fragile.

**BRRRR seasoning gate:**
- Standard rule: 6–12 months from acquisition for ARV-based cash-out.
- **Easy Street Capital exception:** Waives 12-month STR cash-out seasoning.
- Model carry cost during season window: monthly PITIA × season_months.

***

## Part XIV: Probabilistic Stress Engine (Phase 2)

**Monte Carlo: 10,000 trials, t-copula (5–7 df or Clayton).**
- **Gaussian copula is FORBIDDEN** — systematically underestimates joint downside (this is the 2008 model failure).

**Correlated inputs as distributions:**
- Rent YoY: Normal, mean 2.0%, σ = 4.5%
- Vacancy: Beta, 5% mean
- Refi-rate: off forward curve
- Exit cap: ±50–150 bps
- Expense growth and appreciation

**Required outputs:**
- P(Track 1 < floor) over loan term
- P(Track 2 < 1.0) over loan term
- Levered IRR P10/P50/P90, pre- and after-tax
- P(negative monthly cash flow)
- Reserve-burn drawdown path

**Action triggers:**
- P(DSCR < 1.00) > 10% → CONDITIONAL — reprice or restructure
- P(DSCR < 1.00) > 15% → PASS — risk threshold exceeded
- 5th-percentile DSCR < 0.80 → automatic flag regardless of median

**Tornado chart:** Sort 10 key variables by absolute DSCR swing. Top variable = binding risk. 2026 calibration note: for counties with documented yield compression (ATTOM/CBRE data), adjust rent distribution to negative skew (left tail is fatter than historical distributions imply).

***

## Part XV: Four-Score System (Sovereign OS)

| Dimension | Weighting | Hard Cap |
|-----------|-----------|---------|
| **Lender Qualification** | Eligibility 20%, Cushion 25%, LTV 20%, FICO 15%, Reserves 10%, Docs 10% | Any hard ineligibility → 0–39 |
| **Pricing Efficiency** | AEY Spread 35%, Points 20%, PPP 20%, Structural Fit 15%, Cash 10% | <2 quotes → N/A |
| **Investor Survival** | NOI DSCR 30%, Free Cash Flow 15%, Liquidity 15%, Stress 25%, Reset 15% | DSCR < 0.85 or runway < 3 mo → 0–39 |
| **Data Confidence** | Rent 25%, Valuation 20%, Tax/Ins 15%, Fraud 20%, Freshness 10%, Consistency 10% | Unresolved occupancy conflict → 0–39 |

**Score bands:** 85–100 = Strong; 70–84 = Pass-Watch; 55–69 = Conditional; 40–54 = Weak; <40 = No-Go/Exception Only.

***

## Part XVI: Architecture & Build Order

### Technology Stack
- **Frontend:** Next.js 16 / React / React Hook Form / Zod / TanStack Table / Recharts or Visx / Zustand / server-side PDF. No browser storage in sandboxed contexts.
- **Backend:** Python 3.11 / FastAPI / pure deterministic math with golden tests pinned to A.2 / SciPy bisection for deal-break rate, max loan, IRR pre/after-tax, XIRR for AEY / rules engine for eligibility / PPP branch gate / insurance/seasoning/ARM reset gates.
- **Database:** PostgreSQL — borrowers, properties (land_allocation, reassessment_state, tax_mill_rate), scenarios, lender_programs (versioned, provenance, confidence, counterparty_flag), state_ppp_rules (penalty_base, sale_trigger, refi_trigger, entity_branch, annually_indexed_threshold, effective_year, pending_legislation, mn_hf_3437_enacted), state_tax_reassessment_rules, str_regulations, hoa_documents, audit_logs.
- **Object storage:** S3/R2 for guideline PDFs, rate-sheet snapshots, HOA docs.
- **Queue:** Celery/Redis for freshness/confidence decay, refi scans, ARM reset alerts, annual January threshold re-index (OH/PA), pending-legislation watch.

### Build Phases
**Phase 1 — Core (zero hallucination risk):**
Dual-track golden math → returns engine (B: reassessment, after-tax with 1250/NIIT/PAL, insurance gate, BRRRR seasoning, cost-seg flag, bonus-dep per OBBBA) → ARM reset engine → true-cost AEY lender ranking → PPP branch gate (E.1–E.3 with MN HF 3437 as ENACTED) → reserves → 9-lender matrix → kill criteria → Track-2 acknowledgment → two-quote → IC memo → reproducible snapshots.

**Phase 2 — Intelligence:**
STR legality DB + monthly seasonality DSCR output (elevated from Phase 3 — every STR file) → portfolio center → Monte Carlo pre/after-tax, t-copula → fit scoring → HOA parsing → IO/ARM recast double-shock year → blanket exit warnings → annual re-index → pending-legislation counterparty watch.

**Phase 3 — Sovereign:**
STR regulation monitoring → guideline PDF extraction → historical fit-tier calibration (only then may probabilities appear) → live rent/AirDNA/Treasury APIs → SOFR forward-curve integration → confidence auto-decay.

### Acceptance Criteria (Definition of Done — 23 Criteria, v11)
1. Track 1 / Track 2 always side by side — never blended.
2. Reproduces every A.2 golden value; all stress cells reconcile to formulas.
3. Gross/PITIA AND NOI/PI formula toggle; lower-of/lease/1007; vacant rule; no LT vacancy haircut by default; 2–4 unit vacancy toggle flagged as potential program requirement.
4. Returns: Cap/CoC/debt-yield/equity-multiple/break-even, levered IRR with exit-cap sensitivity — PRE- and AFTER-TAX. Return Grade on after-tax.
5. Property-tax reassessment modeled per state — PITIA uses reassessed tax, NOT seller's current bill.
6. After-tax engine: depreciation 27.5yr land-allocated, 1250 recapture 25%, NIIT 3.8% if MAGI exceeds threshold, passive-loss $25K allowance with MAGI thresholds, REP exception, 1031 alternate exit, bonus-dep per OBBBA (100% for post-1/19/25; 40%/20% for prior).
7. Cost-seg flag for properties ≥$450K; if elected, compute accelerated deduction by component class + bonus-dep overlay.
8. Insurance geography risk: insurability KILL gate in all high-risk zones; feeds PITIA and OpEx separately.
9. BRRRR refi-seasoning gate: ARV vs. cost basis with carry during season.
10. ARM reset engine: reset rate = SOFR + margin, capped at cap structure; Track 1 at reset displayed; double-shock year flagged for IO+ARM files.
11. Rates: dated triplet with 10yr/5yr/SOFR anchors at current values — risk-tiered spread 175–450 bps; re-price as anchors move.
12. True cost per lender: AEY via XIRR at 12/24/36/60-mo APR equivalents; no figure without all inputs; YSP flag.
13. Lender screen: eligibility → fit tier + reason → AEY → confidence tiebreaker only; two-quote enforced.
14. PPP gate branches on entity/bank/purpose before any ban; per-state penalty base (remaining vs. original per state law).
15. No-PPP re-pricing re-runs BOTH tracks AND return model.
16. Reserves tiered/capped/geography/portfolio-stacked/ranged; cash-out seasoning caveat noted.
17. STR legality gate before income; three-source income; min appraisal governs; monthly seasonality bar chart in Phase 2 (elevated from Phase 3) for every STR file.
18. Every lender claim carries one of four provenance labels; no render without them; fit tiers, never approval percentages; counterparty flag.
19. Verdict: PROCEED/RESTRUCTURE/PASS with binding constraint deltas, Track-2 acknowledgment, kill-switch conditions.
20. Kill criteria include: insurability, BRRRR seasoning, ARM double-shock before lender ranking.
21. IC memo, sensitivity, risk, true-cost exports; reproducible snapshots (inputs + lender-data versions + rate-anchor values at that instant).
22. Portfolio: NOI/ADS totals (not averages), debt yield, weighted rate/LTV/equity, DE, blended CoC, concentration flags, sub-1.0 Track 2 alerts, refi watchlist, counterparty-continuity flag.
23. NJ LLC/entity PPP defaults to HIGH-RISK/lender-split state until specific lender matrix confirms entity type — never presents any single lender's NJ matrix as universal.

***

## Part XVII: Evidence Vault Architecture

**Guidelines are not records — they are Evidence Objects in PostgreSQL JSONB vault.**

Every claim must carry:
- `claim`: exact text of the claim
- `source_url`: verifiable primary link
- `verified_date`: date of verification (June 17, 2026 or newer)
- `confidence_score`: 0–100 (tiebreaker only)
- `supersedes_id`: audit trail to previous version
- `provenance_label`: Verified-Primary / Verified-Secondary / Market-Pattern-Verify / Unverified

**If a metric is missing (e.g., Anchor Loans FICO floor) → the UI renders "Unspecified — Requires Broker Matrix."** Interpolation is a systemic failure.

**Two ingestion tracks:**
- **Track A (auto-publish):** High-confidence official content — lender headline LTV/FICO/DSCR/rates-from, Pennsylvania Act 6 base figure, Ohio indexed threshold, FEMA flood service status, NMLS free-access facts.
- **Track B (human/counsel review):** State-law ambiguity, lender overlays depending on vesting or property count, anything from gated broker materials.

***

## Part XVIII: Compliance & Regulatory Framework

### Tool-Level Classification
**B2B desk tool for licensed operators** has a fundamentally different regulatory surface than a consumer "get advice" app. This classification determines:
- SAFE Act/MLO licensing applicability
- RESPA referral-fee treatment
- ECOA/Reg B adverse-action requirements
- Reg Z APR disclosure obligations
- GLBA PII/financials handling

### Key Regulatory Rules (Verified)
- **Reg Z:** Excludes credit primarily for business, commercial, agricultural, or organizational purposes. Applies to owner-occupied DSCR.
- **RESPA (Reg X):** Exempts credit primarily for business, commercial, or agricultural purpose. Section 8 referral-fee ban still applies for covered federally related mortgage loans.
- **ECOA (Reg B):** Applies to both individuals AND businesses seeking credit. Adverse-action notices required. CFPB Circular 2022-03: cannot evade ECOA with black-box AI models — specific, accurate reasons required.
- **SAFE Act:** DSCR loans are business-purpose on non-owner-occupied investment property — generally exempt from NMLS MLO requirement that governs consumer mortgages. But verify per state.

### Licensing Ladder (3 Tiers)
- **Tier 3 — Broker Only:** License-exempt in ~35 states for LLC-borrower DSCR. Rely on lender's licensing. Lowest burden, smallest margin.
- **Tier 2 — Business-Purpose Selected Licenses (Year 2):** Exempt in ~35 states, licensed in ~8–15 that require it. State-counsel memo per jurisdiction required.
- **Tier 1 — Fully Licensed Direct Lender (Year 3+):** Griffin Funding posture — licensed in 46–48 states + DC.

### The 7-Question State-Counsel Memo Template
1. Does the state regulate origination of business-purpose loans secured by residential real property?
2. Does the business-purpose exemption apply when the borrower is an LLC/entity?
3. Does it still apply when the occupant is the LLC's sole member?
4. Is there a separate commercial mortgage broker/lender license?
5. Are there usury rate caps on business-purpose real estate loans?
6. Does the state regulate mortgage advertising/marketing registration?
7. **Does the state separately regulate servicing/collection of these loans?** (Most people omit this one.)

**Business-purpose attestation + corroborating evidence** (signed lease, active listing, or property-manager agreement) required on EVERY file.

***

## Part XIX: Market Intelligence & Macro Context (2026)

### Market Size & Growth
- Total U.S. single-family origination: $2.0T (2025) → $2.2T projected (2026) — MBA
- Non-QM share: 1.38% (Aug 2020) → 5.64% (Aug 2024) → 8.34% (Aug 2025) — Optimal Blue via MarketWatch
- Non-QM expected to approach **10% of total originations** by end-2026 — Verus Mortgage Capital
- DSCR origination: **$49B total private lending volume (2024)**; +123% YoY in Jan 2025 spike
- Q1 2026 private-lending originations: $29.7B (+4.0% YoY); DSCR specifically contracted **−8.8% YoY to $10.7B** while STR/rehab (RTL) surged +13%

### DSCR Rate Context
- DSCR rates trajectory: 8.73% (Jan 2024) → 7.76% (Feb 2025) → **6.0–10.75% range (2026)**
- Rate spread over conforming: **0.50–1.25%** (narrowed from 2023 — core broker pitch)
- Conforming fell below 50% of lock volume first in April 2026 (vs. 2018-onward tracking history)

### Credit Performance (2026 Vintage)
- DSCR 60-day delinquency: ~3% end of 2024 (S&P) — doubled in 2 years
- Securitized non-QM impairment rate: ~6.92% (March 2026, easing from ~7.4% Feb) — dv01/Scotsman Guide
- **DSCR investor loans performing better** than weaker low-doc cohorts: impairment rates ~6% or lower
- 2024/2025 vintages showing materially stronger early performance (2.3% and 1.2% serious delinquency)
- **2022–2023 vintage is the cautionary tale** (11% 30-day delinquency from the 0.75-DSCR, stretched-LTV, loose-doc era)
- Fraud risk: **1-in-44 investment loan applications flagged Q1 2026** vs. 1-in-129 overall average
- Problem loans at U.S. banks: **$55B Q1 2025** (4× increase in two years)
- Top fraud-risk states Q1 2026: **New York, Florida, Connecticut, New Jersey, California**

### Top DSCR Markets (2026)
- **Cash-flow markets:** Midwest/Southeast — Rockford IL, Cleveland OH, Kansas City MO, Birmingham AL
- **Appreciation markets:** Austin TX, Charlotte NC
- **Avoid/caution:** Sun Belt oversupply — Austin, Nashville softening rental demand (70–77% inventory growth)
- **Texas-specific:** Constitutional restrictions (Art. XVI, Sec. 50(a)(6)) — 80% combined LTV max, no cash-out refi above 80% LTV. High property taxes (2–3% of market value/yr) + insurance volatility reduce DSCR ratios more than any other state. Requires separate scenario modeling.

### Competitive Landscape

**LenderSA** AI platform: scanning 200 direct lenders for DSCR loan matching — disruptive aggregator threatening lender-direct channel relationships.

**Speed arms race:** Tidal Loans claims 7-day close vs. Kiavi/Visio 10–15 days (prior matrix had 10–15 days as best-in-class).

**LOS market:** $6.5B in 2025 projected $26.3B — AI/ML transforming DSCR decisioning.

**Tech-enabled operators:** Reportedly grew volume +54% YoY while broader private market grew +4% (reported, not independently verified — directionally well-supported).

***

## Part XX: Tax-Legal Intelligence (Critical — Gaps from Prior Research)

### 1031 Exchange + DSCR Combination Strategy
- One of the top 3 reasons high-net-worth investors use DSCR — capital gains deferral while financing replacement property.
- **One Big Beautiful Bill Act (July 4, 2025 — same bill as OBBBA):** 1031 exchanges PRESERVED. No caps, no changes. Investors feared elimination — this is active reassurance needed in every engagement.
- **Cost segregation + 1031 exchange combo:** Accelerated depreciation on replacement property after 1031 = major wealth strategy for top DSCR borrowers. Positions lender as sophisticated advisor.
- Model: sell-and-pay vs. 1031-and-roll as alternate exit scenarios.

### DSCR LLC Vesting & Tax
- Entity-level depreciation and pass-through tax advantages.
- LLC vesting is primary reason investors choose DSCR over conventional (NOT just title preference).
- **Section 1071 (CFPB small business lending rule, revised May 2026):** Covers institutions with ≥1,000 business loans. Compliance risk for high-volume DSCR lenders — affects data reporting obligations.

### Section 1031 Qualified Principal Residence Indebtedness
- Exclusion SUNSET January 1, 2026 — **debt forgiveness is now taxable.** Affects distressed borrowers; changes loss-mitigation math.

***

## Part XXI: Underwriting Gaps (Audit CSV — Fill These Before Production)

### Critical
| Gap | Why It Matters |
|-----|---------------|
| Stress test framework: rate shock +150 bps, NOI stress −10–20%, occupancy cap at 75–80% for commercial DSCR | Institutional underwriting standard |
| Bridge-to-DSCR refinance checklist: 6–12 months rent seasoning, 1.25 DSCR, 75–80% LTV, 6–12 months cash reserves | Exact transition triggers missing from BRRRR coverage |
| Property insurance: landlord/dwelling fire policy required — NOT homeowners. DP-3 vs. DP-1 distinction | Most borrowers have wrong insurance type at application |
| Appraisal condition ratings C1–C6 and loan eligibility: C5/C6 = ineligible for DSCR (needs bridge loan first) | Never previously explained |

### High Priority
| Gap | Why It Matters |
|-----|---------------|
| 40-year amortization as DSCR-boosting mechanism for borderline deals | Key structuring technique for deals that fail at 30-year |
| AUS: how DSCR lenders build internal proprietary scoring vs. Fannie DU/Freddie LP | Explains why two lenders can approve/decline the same file |
| DSCR second mortgage/subordinate lien products (Deep Haven and others) | Allows equity extraction without refinancing first lien |
| No-ratio DSCR as primary tool for vacant/transitional properties in BRRRR | Bridge between bridge loan and stabilized DSCR |
| DSCR for manufactured homes on permanent foundation: extremely limited availability, max 65% LTV | Specific investor segment that gets turned away |
| Broker pricing tools: **Lender Price** and **Optimal Blue** are the actual tech workflow for DSCR broker pricing | Never previously documented |
| Override programs at wholesale lenders: volume-based basis-point overrides beyond standard YSP | Strongest broker retention mechanism |
| DSCR loan documentation checklist beyond credit/income: landlord insurance, lease, entity docs, tax certs | File preparation gap causing deals to die at submission |

***

## Part XXII: Business Strategy — The Correct Sequenced Path

### The One-Paragraph Decision (From Strategic Memo)
Build the operating brokerage first (Tier 3). Run the dual-track engine as internal underwriting edge and free public lead magnet. Do NOT attempt the SaaS, correspondent, or direct-lender models before a clean origination tape exists. The $25K bootstrap budget funds entity, website, compliance consult, and initial licensing — not warehouse lines or data teams.

### Credit Posture as Broker (Protect the Tape from Loan 1)
Push these files; decline or restructure the rest:
- FICO ≥700 (680 with compensating factors)
- DSCR ≥1.10 (≥1.20 on cash-out)
- LTV ≤75% purchase (≤70% cash-out)
- 6–9 months reserves
- Seasoned STR only

Sub-1.0 DSCR = rare accommodation at low LTV + high FICO. NEVER as a marketing hook.

### The 67% Cash-Out Flywheel (Griffin Benchmark)
Griffin's June 2026 production: 67% of loans are cash-out refinances. This reveals the real model: every purchase is a future cash-out; every cash-out funds the next acquisition. DSCR is a repeat-capital relationship, not a transaction. CRM from loan 1 — tag every borrower with property count, rate, equity, and prepay-expiry to mine refi business.

### Geographic Intelligence (2026 Reversal from Prior Research)
- **Actively originate:** Midwest (Cleveland, Detroit, Indianapolis), Northeast secondary cities, Southeast coastal (Tampa, Charlotte, Atlanta with scrutiny)
- **Caution:** Sun Belt (Phoenix, Austin, DFW) — weak near-term cap rates, high oversupply, falling rents
- **High opportunity, high compliance:** Pacific Coast (CA, WA, OR)
- **Rent-to-price heuristic:** At 7.5% rate on 25% down, need 0.85–0.90% monthly rent-to-price ratio for 1.25× DSCR; 0.70–0.75% for 1.00×. Markets failing this at median prices → high fallout

### KPIs (Track from Loan 1 in Securitization Vocabulary)
| KPI | Target |
|-----|--------|
| Scenario-to-application conversion | 25% |
| Application-to-lock | 60% |
| Lock-to-close (days) | ≤35 days |
| Pull-through | 75% |
| Exception rate | ≤15% |
| Post-close defect rate | ≤3% |
| First-payment default | ≤0.5% |
| Repeat/referral share | 30% by Month 12 |

***

## Part XXIII: ALWAYS / NEVER Reference Card

| ALWAYS | NEVER |
|--------|-------|
| Both DSCR tracks side by side | Blend the two tracks |
| Returns on Track 2 show after-tax: 1250/NIIT/PAL | Grade a deal on pre-tax IRR alone |
| Use REASSESSED purchase taxes in PITIA | Use the seller's current tax bill |
| Treat insurability as a gate in high-risk zones | Treat insurance as a static line item |
| Rate triplet, dated, with 10yr/5yr/SOFR anchors | One undated rate flat spread |
| Penalty on the CORRECT per-state base | Global remaining-balance, sale-AND-refi rule |
| Branch PPP on entity/bank/purpose | Encode a consumer-statute ban as universal |
| Provenance label on every claim | Citation markers that resolve to nothing |
| Reserve RANGES, confidence as tiebreaker | Let uncalibrated confidence reorder lenders |
| Index OH/PA annually; MN HF 3437 encoded as ENACTED | Hard-code indexed thresholds or stale law |
| Fit tiers with reasons | Numeric approval probabilities |
| Two-quote AEY delta in dollars | A single quote |
| Verdict with binding constraint deltas | A verdict without its assumptions |
| ARM reset Track 1 modeled at stress SOFR | Quote ARM rate without reset scenario |
| NIIT modeled for high-MAGI exits | Ignore 3.8% stack on 1250 recapture |
| Bonus-dep per OBBBA — 100% post-1/19/25 | Hard-code an outdated bonus-dep rate |
| Operator is decision-maker-of-record | Imply the engine is a loan commitment |

***

## Part XXIV: Items Flagged for Additional Research

The following are explicitly unknown or require ongoing monitoring. **Do NOT fabricate these — surface as "Requires Research/Verification":**

| Item | Status | Action Required |
|------|--------|----------------|
| OH 2026 exact indexed threshold ($116,356 stated) | Annual re-confirm | Re-verify each January |
| PA 2026 Act 6 exact base figure ($329,411 stated) | Annual re-confirm | Re-verify each January |
| MN HF 3437 full text business-purpose scope edge cases | Enacted 4/23/26 — verify exact boundary | Counsel memo for edge cases |
| WA ARM prepayment penalty — blanket ban claim | UNVERIFIED | Do not encode as blanket; verify with counsel |
| NJ LLC vs. C-corp split per-lender | Varies by lender | Build lender-specific matrix field |
| Kiavi AirDNA acceptance | Unverified from public page | Direct matrix ingest |
| Griffin $20M jumbo figure | Unverified | Remove until confirmed |
| Anchor Six lender identity | Cannot verify as mortgage lender | Remove from matrix entirely |
| Velocity Mortgage full rate sheet | Gated to licensed professionals | Manual matrix ingest only |
| Anchor Loans full DSCR matrix | Limited public disclosure | Direct matrix ingest |
| AirDNA API enterprise pricing | Not public — contact sales | Do not hardcode API COGS |
| NMLS official public API | No official public API found | Manual browser verification only |
| LenderSA competitive threat assessment | Mentioned in audit CSV | Research competitive impact |
| Section 1071 CFPB compliance threshold details | Revised May 2026 | Full rule text review |
| STR regulation database (city/county level) | Phase 2 build | Commission data acquisition |
| DSCR second mortgage (Deep Haven subordinate liens) | Product gap | Research program terms |
| 40-year amortization lender availability matrix | Not documented | Audit top-10 lender programs |

***

## Disclaimer (Required on Every Session/Export)

**PROFESSIONAL DECISION-SUPPORT. DATA AS OF JUNE 17–18, 2026.** Analytical recommendations for use by a licensed professional or sophisticated investor, who is the decision-maker of record. Not a loan commitment, credit decision, appraisal, tax opinion, or guarantee of approval. Not a substitute for legal, tax, and financial counsel. Guidelines, rates, LTV, reserves, prepayment structures, and STR/insurance policies change without notice; verified items reflect their labeled source dates. Rates anchor to the 10yr/5yr Treasury and SOFR at a risk-tiered spread and must be re-priced as markets move. Annually indexed thresholds (OH/PA) re-confirmed each January. MN HF 3437 enacted April 23, 2026, effective August 1, 2026 — applies only to personal/family/household loans; business-purpose DSCR loans not reached. Tax outputs (depreciation, bonus-dep per OBBBA, recapture, NIIT, 1031, after-tax IRR) are estimates dependent on the investor's bracket, MAGI, REP status, filing status, entity, and cost-segregation election — confirm with a CPA. Return projections depend on forward assumptions (rent growth, exit cap, hold) that are estimates, not forecasts. Fit tiers are qualitative, not predictions.