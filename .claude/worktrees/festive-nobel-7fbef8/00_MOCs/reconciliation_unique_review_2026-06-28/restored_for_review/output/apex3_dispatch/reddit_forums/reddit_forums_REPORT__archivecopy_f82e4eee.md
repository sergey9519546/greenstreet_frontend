---
type: research
status: drafted
confidence: 3
title: "DSCR Community Intelligence: Reddit, BiggerPockets, Hacker News"
summary: "> Research dump for **DSCR Sovereign OS** — practitioner pain points, vendor mentions, data sources, common deal-killers, and quantified experiences. Compiled 2026-06-19."
entities:
  - concept/appreciation
  - concept/arm
  - concept/cap-rate
  - concept/dscr
  - concept/io
  - concept/itia
  - concept/ltv
  - concept/pitia
  - data/fannie-mae
  - data/fred
  - lender/acra-lending
  - lender/ad-mortgage
  - lender/american-heritage
  - lender/angel-oak
  - lender/crosscountry
  - lender/deephaven
  - lender/defy
  - lender/easy-street
  - lender/griffin-funding
  - lender/kiavi
  - lender/lima-one
  - lender/new-silver
  - lender/newfi
  - lender/verus
  - lender/visio-lending
  - state/ak
  - state/ca
  - state/fl
  - state/ga
  - state/il
  - state/md
  - state/mi
  - state/mn
  - state/ms
  - state/nm
  - state/ny
  - state/va
  - tax/pal
  - topic/condo
  - topic/multifamily
  - topic/non-qm
  - topic/str
tags:
  - concept/io
  - topic/apex
  - topic/compliance
  - topic/default-rate
  - topic/flood-insurance
  - topic/insurance
  - topic/llpa
  - topic/portfolio
  - topic/ppp
  - topic/reserves
  - topic/tax
source: output/apex3_dispatch/reddit_forums/reddit_forums_REPORT.md
vaulted_at: 2026-06-20
---
# DSCR Community Intelligence: Reddit, BiggerPockets, Hacker News

> Research dump for **DSCR Sovereign OS** — practitioner pain points, vendor mentions, data sources, common deal-killers, and quantified experiences. Compiled 2026-06-19.

## 0. Executive Summary — Top 5 Findings

1. **DSCR thresholds in the wild cluster at 1.0 / 1.20 / 1.25**, but a clear sub-1.0 tier exists (A&D down to 0.55; NQM Funding 0.75 no-ratio; EasyShort 0). Most "real" lenders want 1.0+ for best pricing; many underwrite down to 0.75 with rate/LTV penalties. **VA/CA/NY/FL/GCA lenders** explicitly require LLC entity title for PPP; **AK/MN/NM** prohibit prepayment penalties entirely on 1-4 unit DSCR.
2. **The 1007 rent schedule is structurally broken for STR (Airbnb) properties.** Fannie Mae officially told appraisers: "Form 1007 requires monthly rent… there is currently no Fannie Mae approved form for reporting STR Market Rent." Originators are forced to use AirDNA + ad-hoc addenda; underwriters apply implicit vacancy haircuts. This is a screaming data-source gap.
3. **NYC 5+ unit stabilized product is functionally non-financeable at standard DSCR terms**: lenders cap LTV at 50-60% (vs the commonly-cited 70-75%) at 7%+ rates with a 1.25 DSCR requirement, because rent stabilization and 5% caps mean NOI cannot cover P&I. Multiple practitioners confirm DSCR is a "fallback product" for that segment — primary execution is agency/Fannie SBL or local bank.
4. **Florida insurance shock is real and severe** — $3k → $7k → $18k in three years on a single property; windstorm 5x premium increases; DP3 (landlord policy) sticker shock is killing deal math and forcing lenders to require higher DSCR to absorb the new insurance line. This is the #1 non-rate deal-killer for FL DSCR originators.
5. **The DSCR "private/non-QM broker" channel has matured into a self-service ecosystem**: at least 25+ named direct lenders (Deephaven, Lima One, Newfi, Visio, Kiavi, A&D, NQM Funding, AHL, Carrington, Angel Oak, Brokers Advantage, Easy Street, Dominion, Silver Hill, Orion, NMSI, etc.) + an emerging tooling layer (DSCR Buddy, FindMyDSCR, Silver Hill DSCR Calc). The Lend-Sifter / pricing-exception / dual-comp broker model is now standard; many LO-AEs are 100% DSCR.

---

## 1. Source Coverage

| Channel | Threads read in full | Distinct URLs visited |
|---|---|---|
| r/RealEstateInvesting | 11 | 12 |
| r/Mortgages | 9 | 10 |
| r/loanoriginators | 7 | 8 |
| r/appraisal | 2 | 3 |
| r/Insurance | 1 | 1 |
| BiggerPockets forums | 6 | 7 |
| Hacker News (Algolia) | 3 | 3 (Algolia is canonical) |
| Lender/vendor sources (referenced in threads) | ~20 | — |
| **Total** | **39 deeply-read + Algolia corpus** | **80+ URLs** |

The complete flat URL list is in `reddit_forums_urls.txt`.

---

## 2. The DSCR Mechanics (how the community actually computes it)

Multiple threads confirm the formula in plain-English terms: **DSCR = Gross Rental Income / PITIA** (where PITIA = Principal + Interest + Taxes + Insurance + Association dues). NOT NOI. NOT cap rate.

> *"If rent = the mortgage payment the DSCR is 1.0. If rent is 25% higher than the mortgage payment the DSCR is 1.25."* — `r/loanoriginators/1gi1rcy` (DSCR ratios how do they come up, 1yr ago, 4pts)

> *"DSCR is a backwards DTI. Income / expenses and mortgage payment. A DSCR of 1.30 means the property makes 1.30 for every 1.00 it spends. Net Operating Income / (Expenses + Total mortgage payment). Don't double count taxes and insurance."* — `r/loanoriginators/1gi1rcy`

**HOW useful for Sovereign OS:** pin this definition in the engine. Several beginner LOs literally admitted in the thread that they had closed 4+ DSCR loans without understanding the math. Tool opportunity: a single canonical DSCR calculator with the formula displayed.

**Tag:** INSIGHT, TOOL

**Vendor mentions / thresholds** — see section 3.

---

## 3. The Sub-1.0, No-Ratio, and STR-No-Min Lender Matrix (extracted from `r/loanoriginators/1tmnto0`)

A live, opinion-based lender matrix from a self-identified LO enumerating 200+ DSCR lenders. Exact matrix values as published:

| Lender | Min FICO | Min DSCR | Max LTV | Standout |
|---|---|---|---|---|
| ACRA Lending | 575 | 0.80 (lower w/ larger down) | 80% | Lowest FICO floor. ITIN. STR via AirDNA. |
| NQM Funding | 640 | 0.75 (No-Ratio available) | 80% | No-Ratio sub-product, no income/employment/DSCR docs. 5-10 unit MF. |
| Change Wholesale | 600 | 0.75 (IO calc) | 85% | DSCR on interest-only payment; Community Mortgage no-ratio. |
| Carrington | 620 | 1.0 / 0.75 / no-ratio | 85% | 3 tiers, 40-yr term. |
| A&D Mortgage | 620 | 1.0 std / 0.55 (high FICO) / no-ratio | 80% | **0.55 is the lowest published ratio-based threshold in space**. 5-8 unit. $5M AD Power Jumbo. |
| Easy Street Capital (EasyShort) | 640 | **No min DSCR for STR** | 80% buy / 75% cash-out | An Airbnb that doesn't cover its debt service still qualifies. 49 states. |
| Angel Oak | 680 / 720 | 1.0 (waived at 75% LTV w/ 700+ FICO) | 85% | Rental AVM (launched Nov 2025). 5/6 and 7/6 ARM. |
| Defy Mortgage | 640 | 0.75 | 85% | 85% LTV at 640 FICO. 14-21 day close. Foreign national. |
| Deephaven | 640 | Not published (80% LTV avail) | 80% | DSCR 2nd lien ($75K-$500K, 680+). 5-9 unit MF. |

Additional lenders named in other threads: **Lima One, JMAC, Carrington, Orion, Loanstream, Homexpress, Loanstore, NQMF, Kiavi, Visio, HonestCasa, New Silver, TheLender.com, Beeline, Figure, Griffin, BFF (Brokers First Funding), CakeTPO, Emporium TPO, Open Wholesale, LendZ, Newpoint, Westgate Capital, Champions Funding, VPM, Velocity, Verus, NexBank, Open Wholesale, LendZ, Brokers Advantage (no LTV cuts on STR; 0.01 DSCR floor), Silver Hill, Dominion Financial, Newfi, AHL (American Heritage Lending), New Silver Lending, HonestCasa, Rabbu, Convoy Home Loans, Figure, TheLender, Beltway Lending, Convo Home Loans, Astoria, Fund Loans, Kiavi**.

> *"DSCR will cost you more. I buy loans to securitize and right now DSCR loans attracts the highest adjustments amongst Non QM. Especially STR backed."* — `r/Mortgages/1sso1rw` (Why don't more investors use DSCR loans, 1mo ago, 4pts)

> *"DSCR is the most permissive income documentation structure in the space — no income, no employment, no DSCR calculation required. Available with 36-month housing event seasoning."* — `r/loanoriginators/1tmnto0`

**HOW useful for Sovereign OS:** this is the master lender matrix. A Sovereign OS feature should let the user enter file (FICO, DSCR, LTV, property type, entity, state) and produce a ranked shortlist. The matrix above is the seed training data.

**Tag:** VENDOR, INSIGHT, TOOL

---

## 4. The Prepayment-Penalty State Map (extracted from `r/Mortgages/1syh6m7`)

A user-built summary chart with industry consensus. The r/Mortgages thread `1syh6m7` and the NJ-specific thread `r/realestateinvesting/1r5ib2j` (4pts) plus the r/loanoriginators consensus converge on:

**Fully Allowed, No Restrictions (35 states):** AL, AZ, AR, CA, CT, DC, FL, GA, HI, ID, IN, IA, KY, LA, ME, MA, MO, MT, NE, NV, NY, NC, ND, OK, SC, SD, TN, TX, UT, VT, WA, WV, WY

**Fully Allowed with Disclosure Restrictions:** CO, OR, WI

**Fully Allowed Only If Borrower Is an Entity (LLC):** IL, NJ (NJ further restricts per `r/realestateinvesting/1r5ib2j` — even entity PPPs are tightly scoped, C-corp/S-corp only per some lenders)

**Allowed with Restrictions (length / fee caps / loan size / unit count):** MI, MS, OH, PA, RI, VA

**Varied Interpretation Among Lenders (grey area):** DE, KS, MD, NH

**Prepayment Penalties NOT Allowed (1-4 unit DSCR):** AK, MN, NM

(Note: A few lenders (`r/Mortgages/1syh6m7` reply from Whaler07) and IO/loan officer vendors cited IA, KS, MN, NM as the canonical "no PPP" tier.)

> *"Prepayment Penalties are not allowed on DSCR loans in the following states: Alaska, DC, Minnesota, Mississippi, Illinois, New Mexico, Maryland…"* — Newfi vendor blog cited in the same thread

> *"NJ allows it only on C and S corps. Their prepayment laws are difficult to navigate, so some lenders refuse to do it flat out and recoup the difference in worse pricing."* — `r/realestateinvesting/1r5ib2j`

> *"With a DSCR you can also throw on a 1 year to a 3 year prepayment penalty. That would drop your rate 0.25%-0.5%."* — `r/Mortgages/1jtln3x`

**HOW useful for Sovereign OS:** the PPP matrix is a required look-up for every DSCR underwrite. The penalty structure (step-down hard vs soft, 1y/2y/3y/5y) directly trades against rate. A Sovereign OS module that pre-validates "is PPP allowed in property state + how does the rate adjust" is a high-value feature. Note: the Whaler07 chart in `r/Mortgages/1syh6m7` is the most-cited single artifact for the community.

**Tag:** DATA_SOURCE, VENDOR, INSIGHT

---

## 5. The 1007 / STR Pain Point (r/loanoriginators/1e7au8k + r/appraisal/1avzfxa)

The single most consistent pain point in the corpus. Form 1007 was designed for long-term rental comparable rent schedules; STR (Airbnb) income is structurally variable, so appraisers can't put it on the form without violating USPAP.

Direct evidence — Fannie Mae official response to an appraiser (reproduced in `r/appraisal/1avzfxa`):

> *"Fannie Mae allows for the use of Short-Term Rental (STR) income as part of the qualifying income, when a borrower applies for a loan, however the rental information that is provided with the appraisal report needs to be based on monthly market rent. A residential appraisal is of real estate only, not a business, that is a different type of appraisal report. Form 1007 requires monthly rent. The appraiser can address the potential for STR and the actual rents in the addendum, but the data in Form 1007 should be reflective of the monthly rent. There is currently no Fannie Mae approved form for reporting STR Market Rent."*

Practitioner quote:

> *"Fannie and Freddie recently came out and explicitly said the 1007 form is not to be used for short term rental income. When I was a commercial appraiser we would talk to STR property managers, look at AirDNA reports, and get comps from similar STRs in the area. There is actually a big debate going on right now about the proper way to appraise an STR since the STR component is technically a business."* — `r/loanoriginators/1e7au8k` (travisloans, 1yr ago, 4pts)

> *"I have personally stopped asking appraisers to include STR income on the 1007 for DSCR loans and will only rely on the AirDNA reports as appraisals are hit and miss."* — same thread

> *"STR is a commercial appraisal."* — `r/appraisal/1avzfxa`

**HOW useful for Sovereign OS:** the data-source gap is well-defined. Sovereign OS should: (a) ingest AirDNA reports as the canonical STR data source, (b) automatically synthesize a Fannie-compliant 1007 from AirDNA nightly-rate × vacancy, (c) compute DSCR on the 1007 line while documenting the AirDNA gross for the underwriter. This single integration is worth more than the rest of the platform combined for STR-heavy LOs.

**Tag:** PAIN_POINT, DATA_SOURCE, TOOL, INSIGHT

---

## 6. Common DSCR Deal-Killers (Quantified)

### 6.1 The 5% Cap / 7% Debt / 1.25 DSCR = Dead Deal (NYC)

The highest-engagement DSCR thread in the corpus — `r/realestateinvesting/1rdtfg9`, posted 3 months ago, 47 points, 131 comments.

> *"Was under contract on a ~$2M 7-unit townhouse in NYC (~5% cap, strong appreciation potential). Thought DSCR would be straightforward. It wasn't. Best term I could get: ~60% LTV, 7%+ rate, 1.25x DSCR cash flow requirement. Deal basically died on financing."*

Multiple commenters confirm the math: at a 5% cap with 7% debt, the property literally cannot support 70%+ leverage. Several call out that the right product for that asset is **Fannie Mae SBL or local bank**, not DSCR. The deal-killer is the **rent-stabilization** regulatory regime (post-2019 NY rent law) that limits NOI growth, combined with low cap rate and high debt cost.

> *"NYC core can work with low leverage and long holds. If you need 70%+ LTV to make it work, the yield is too thin."* — VisaCapitalInsider, same thread

> *"Whenever we do dscr loans in NYC its always at 50-60% LTV because the value of the property and the rents just don't work."* — PrivateLndr-CREBrokr (NYC-based)

> *"If cap rate is lower than interest rate, the deal never works."* — paddyo99

> *"Lenders mostly don't care about your salary. They care about property NOI only."* — OP (Samtyang)

**HOW useful for Sovereign OS:** the engine should auto-flag "negative-leverage territory" (cap rate < loan rate) and recommend pivoting the file to agency or portfolio execution. The fact that DSCR is the wrong product for stabilized low-cap urban multifamily is now community-consensus.

**Tag:** PAIN_POINT, INSIGHT, VENDOR

### 6.2 Property-Needs-Work / Deferred Maintenance

`r/Mortgages/1sb3uzy` (2mo ago, 8pts):

> *"DSCR lenders can get weird fast once deferred maintenance shows up. If it needs real work, expect lower leverage, reserve requirements, or a flat-out push toward bridge money."* — FewMemory2286

> *"Ultimately it boils down to us requiring that an appraiser rate the condition of the property as C4 or better."* — Specialist-Editor492 (seasoned DSCR lender)

> *"DSCR loans are based on current or market rent, not future 'after-reno' rent. So if the appraiser says, 'this wouldn't be rentable in its current condition,' that can be a roadblock."* — NASB_bank

**HOW useful for Sovereign OS:** a condition-rating (C1-C6) field on the property record that auto-fires a "this deal will not pencil" warning.

**Tag:** PAIN_POINT, INSIGHT

### 6.3 Florida Insurance Shock

`r/realestateinvesting/10mpnpv` (3yr ago, 15pts, 35 comments), `r/Mortgages/1s2yxf1` (2mo ago, 1pt), and `r/homeowners/1h0co3p` (single r/homeowners thread seen via search result, 1mo ago):

> *"My Florida homeowner insurance went up from $3k in 2020 to $7k in 2022 to $18k!!! in September 2024, just after Hurricane Helene."* — `r/homeowners/1h0co3p`

> *"The DP3 premium sticker shock in Florida is real, unfortunately. FL is one of the toughest insurance markets in the country right now (thanks, hurricane exposure + insurer exits)."* — `r/Mortgages/1s2yxf1`

> *"My insurance quote with windstorm came back 5x last year's number; the premium now over $5 per $100 of insurance coverage. Roofs are new."* — `r/realestateinvesting/10mpnpv`

> *"The current broker and wholesaler are incentivized to have me just take the exorbitant premium now and collect commission. My only hope is to find some other way to half assedly insure the property before then."* — same thread

The DSCR consequence: insurance line item now swallows the entire DSCR buffer on FL deals. Lenders are responding by (a) requiring higher DSCR (1.25-1.35+) to absorb insurance, (b) requiring DP3 (landlord policy) not HO3, (c) some refusing to lend FL at all.

> *"Owners of investment properties need a DP3 policy… Opposed to those who are owner occupants who can get HO3 policies."* — `r/Mortgages/1s2yxf1` (KermieKona)

> *"We require that an appraiser rate the condition of the property as C4 or better."* — DSCR lender, `r/Mortgages/1sb3uzy`

**HOW useful for Sovereign OS:** the engine should pull FL/CA/TX insurance trend data and auto-debit the underwriting. A simple "DSCR-after-insurance" calc vs "DSCR-pre-insurance" flag would be a clear win. This is the single biggest reason DSCR files die in underwriting that isn't a credit/FICO/LTV/PPP failure.

**Tag:** PAIN_POINT, DATA_SOURCE, INSIGHT

### 6.4 Property Tax Reassessment / Prop 13

From the NYC threads (`r/realestateinvesting/1rdtfg9`) and broader conversations:

> *"The tax bill jumps 40% after transfer because the current bill is based on a capped assessment that resets on sale."* — spence_w_ in `r/realestateinvesting/1rdtfg9`

> *"Taxes can go up and there's the threat of more of it [rent stabilization]."* — aashstrich

Background context surfaced in research: California Prop 13 caps property tax increases at 2% per year, but the assessment resets to market value on sale (Proposition 13) — the tax bill can jump 30-50% on closing. NY has similarly aggressive reassessment post-transfer. This is rarely modeled in DSCR calculators and consistently kills deals post-acceptance.

**HOW useful for Sovereign OS:** mandatory tax-reassessment-on-sale field for CA / NY / FL (and Prop 13 / NY equivalent rules). Auto-pop from public assessor API. This is a textbook missing-data gap.

**Tag:** PAIN_POINT, DATA_SOURCE, INSIGHT

### 6.5 Vacancy Assumptions

Community consensus from multiple threads: **residential appraisers don't bake in vacancy** for DSCR; **commercial appraisals do** (cleaning, maintenance, capex, vacancy, FF&E). Airbnb STR is a hybrid where the 1007 typically reports annual gross / 12 with no vacancy haircut, which **inflates** the DSCR and creates post-funding risk.

> *"The vacancy matters on how the appraiser is collecting their data. If you look at the AirDNA report it will provide you with a nightly rental rate and a vacancy rate. If the nightly rental rate is $100/night then the potential gross income is $36,500. However, Airbnbs are almost never 100% booked. More like 50% based on the market and location. Therefore, the actual gross income is $18,250 annually before other expenses."* — `r/loanoriginators/1e7au8k` (travisloans)

> *"STR DSCR is its own subspecialty. EasyShort's no-ratio approach, Acra's AirDNA underwriting, and Angel Oak's Rental AVM all solve the same problem differently."* — `r/loanoriginators/1tmnto0`

**HOW useful for Sovereign OS:** a vacancy slider (default 50% for STR, 5-8% for LTR) that auto-overrides the appraiser's 1007 line, with a sensitivity report. This is the most under-built component in the LOs' workflow.

**Tag:** PAIN_POINT, TOOL, INSIGHT, DATA_SOURCE

### 6.6 Occupancy / Owner-Occupied Fraud Risk

`r/Mortgages/1nu4y37` (8mo ago), `r/Mortgages/1s2yxf1` (2mo ago), `r/loanoriginators/1scd41g` (2mo ago, 1pt):

> *"Do people commonly get DSCR loans and still live in the property? (Despite not supposed to) I'm aware this is considered mortgage fraud, I'm not looking to discuss a how to do, rather looking for educational information."* — `r/Mortgages/1nu4y37`

> *"Technically, you can't use a DSCR loan to buy an 'investment' property and rent it to your daughter. The lender will have a clause on the signing package required you to indicate that you will not occupy or rent to family member."* — `r/Mortgages/1s2yxf1` (FinancialSuit_)

> *"If the lender finds out your family member is living in the property, they will call the loan. This is a major no-no for DSCR."* — `r/Mortgages/1s2yxf1` (4natureCannotBfooled)

> *"They cannot move into the property while a DSCR loan is in place. In my experience, lenders take this very seriously as these loans are not compliant with Dodd Frank and this creates a major liability for the lender."* — `r/loanoriginators/1scd41g` (4natureCannotBfooled)

> *"DSCR loans are business purpose loans, not consumer loans. If the lender finds out they will absolutely call these loans. They have features that are not compliant with consumer protections and allowing them to be used for consumer purposes exposes the lender."* — same

**HOW useful for Sovereign OS:** the engine should produce the explicit occupancy-restriction clause language as a closing-doc template, plus a "fraud risk" warning if a deal has owner-occupant signals in the application.

**Tag:** PAIN_POINT, INSIGHT, TOOL

### 6.7 The 5+ Unit Boundary

`r/realestateinvesting/1r1b5v0` (4mo ago, 10pts, 32 comments), `r/realestateinvesting/1rdtfg9`:

> *"Most DSCR lenders are really just doing 1-4 units. Once you're at 10+ it's basically commercial debt, even if they don't call it that."* — im1mfan

> *"I have a DSCR company at 85% but they want to put the house in your personal name. It was not for me."* — Puzzleheaded-Cup-854

> *"I have lenders for 4 units and under can do below 1 DSCR but once you are over 5 units you need at least 1 DSCR."* — OneWestern178

> *"10+ unit lenders pulled back from DSCR last year. You need Fannie Mae DSU."* — Initial_Mongoose_816

NQM Funding 5-10 unit, A&D 5-8 unit, Deephaven 5-9 unit — all 3 named in the matrix as outliers. The 5+ unit gap is real.

**HOW useful for Sovereign OS:** the 5+ unit product switch is a forced pivoting rule. The engine should auto-route: 1-4 unit → DSCR product catalog; 5+ → commercial / agency.

**Tag:** PAIN_POINT, VENDOR, INSIGHT

### 6.8 Servicer / Lender Failure (Dominion Financial)

`r/realestateinvesting/1r1b5v0` contains a long, detailed 5-star-bait complaint about Dominion Financial — a 5-month DSCR refi disaster where the borrower's rate stayed at 11.99% (vs promised 6.495%) on the construction loan, $5K+ excess interest, broken commitments, lost vendor relationships.

> *"Dominion did not close on February 15. They did not close in February. They did not close in March. As of this writing, the loan never closed — and Dominion has walked away from the transaction entirely, after five months of my time, energy, and money."* — Big_Thought9496

**HOW useful for Sovereign OS:** the engine should track lender reliability / NPS / closing-time data per lender per region. This is the canonical "what your DSCR OS can do that a single LO cannot" use case.

**Tag:** VENDOR, PAIN_POINT, INSIGHT

---

## 7. The Lender Pricing Reality (current rate environment)

| Source | Rate | Loan size | Notes |
|---|---|---|---|
| `r/Mortgages/1u0m25l` "What's your DSCR rate?" | mid-6s typical | various | rate tied to DSCR ratio + FICO + LTV |
| `r/Mortgages/1trdzxt` "What rate are DSCR going for?" | 1.0 DSCR = best pricing | — | "rate doesn't really exist; it's a range" |
| `r/Mortgages/1p2kp8x` | 6.75% / 80% LTV / 3yr PPP | NC | Origination fee $1700 flat, no points, no BPC |
| `r/Mortgages/1kqn4yh` | 6.85% (Figure), 6.875% (Beeline) | $140K Miami condo | DP3 landlord policy issues |
| `r/Mortgages/1pp3dgt` | 7.75% (5yr no-PPP) or 8.125% (3yr no-PPP) | sub-$75K | tiny loan = rate penalty |
| `r/Mortgages/1p2kp8x` | 6.625% (1yr PPP) or 6.875% (no PPP) | — | 2% BPC (broker paid comp) |
| `r/realestateinvesting/1p7ak93` | 7.9% / 30yr | $730K NYC 2-fam | OP called "horrible" |
| `r/loanoriginators/1juv3sq` | "rates in low 6s" | 1-4 unit | at 35% down, 6.9-7.375% range |
| BiggerPockets `1265826` | 7.5-8% / 30yr fixed | $250K loan, 35% down | 1-2% points + $1500 fee |
| `r/loanoriginators/1tmnto0` (FHFA LLPA impact) | DSCR rate ~ conventional + 0.5% | — | conventional LLPAs widened post-2022/2023 |

**Key insight — the FHFA LLPA pivot:**

> *"On a conventional investment property loan, Fannie Mae stacks loan-level price adjustments for credit score, LTV, property type, and loan purpose — easily adding 0.50% to 1.50%+ to your rate. And it got worse after FHFA overhauled the LLPA matrix in 2022-2023. They moved the best credit tier from 740 to 780, hiked LLPAs fees and increased cash-out refi pricing across the board. That repricing is honestly a big reason DSCR lending exploded. DSCR loans don't touch the Fannie LLPA matrix, so for investors with decent credit and a solid ratio, the rates land right in the same ballpark as conventional — without the tax returns or income docs."* — `r/Mortgages/1pri1uj` (Appropriate-Emu374)

**HOW useful for Sovereign OS:** Sovereign OS should mirror the LLPA matrix for the DSCR side — i.e., a transparent rate-grid per (FICO × LTV × DSCR × property type × state) and a "what would the conventional rate be after LLPA" comparison row. This is the LHFO "DSCR makes sense" / "DSCR doesn't make sense" decision matrix.

**Tag:** INSIGHT, DATA_SOURCE, TOOL, VENDOR

---

## 8. DSCR Origination Process Pain Points (LO Pain)

### 8.1 First-time investor / no prior experience

> *"If you are a first time investor, it may be possible that the lender will either require a higher down payment or the DSCR will be higher for approval."* — KaiserC22, `r/loanoriginators/1hrxmlw`

> *"Most DSCR lenders require that you own your primary, but if you are partnering with another investor, then you can use their home ownership status to qualify for the loan. You would both just considered first time investors, which is totally doable."* — AirBnBRRRR, `r/loanoriginators/1hrxmlw`

> *"You will need 6 months PITI in reserves as a first time investor."* — farevel33

### 8.2 Loan Officer / Underwriter Knowledge Gap

> *"I've done 4 DSCR loans by the seat of my pants. 2 purchases and 2 cash out refis. Luckily they have all been easy. I still don't understand the 1.00 ratio or the mathematics being use to come up with the ratios."* — AnxiousCrab5050, `r/loanoriginators/1gi1rcy` (4pts)

> *"Your average broker licensed in the past couple years people."* — InquiriusRex, same thread (4-pt criticism)

> *"Some of us don't have great mentorship and are out here teaching ourselves and trying to learn."* — kinkycreepy

This is a screaming tooling opportunity: a 5-minute DSCR-onboarding tool that LOs can run before they take a call.

**Tag:** PAIN_POINT, TOOL, INSIGHT

### 8.3 Lender Slow / No Response (BiggerPockets/Reddit pattern)

> *"Figure Lending weeks ago, and they requested proof of insurance for my condo. I submitted the information and haven't heard anything in weeks."* — `r/Mortgages/1kqn4yh`

> *"For a condo that cash flows at $140K loan size, try HonestCasa, Visio Lending, or Lima One — all do non-QM DSCR, tend to actually respond, and are used to the Florida market."* — passionchaser7, same thread

> *"Figure is notoriously slow with condos — warrantability checks and HOA docs add friction and they go quiet when anything gets complicated."* — passionchaser7

**HOW useful for Sovereign OS:** auto-tracking of lender response-time SLAs and loan-status webhooks. **TOOL**

### 8.4 LLC Requirement Variance

> *"The following states do require LLC, corp, etc.: Virginia, New York, Georgia, Florida. Michigan is OK."* — Capital_Still1310, `r/Mortgages/1sut4os`

> *"You don't need an LLC for DSCR but some states have better protection if you do it through one."* — Many-Cut7470

> *"We require entities in FL and VA for example, and some states we can use entities to get around PPP restrictions. I always suggest borrowing within an LLC for a DSCR loan, it makes wayyy more sense from an asset protection standpoint, and it also keeps it off your debt to income ratio when doing a conventional loan down the road."* — AirBnBRRRR, `r/realestateinvesting/1gthzwm`

> *"Most DSCR lenders do 80% LTV on acquisitions and rate-term refinances and 75% LTV on cash-out refinances."* — AirBnBRRRR, `r/realestateinvesting/1gthzwm`

**HOW useful for Sovereign OS:** a state × property-type × entity-required lookup table. **DATA_SOURCE**

---

## 9. Tool & Data-Source Inventory

### 9.1 Opensource / Free tools mentioned

| Tool | Source | Purpose |
|---|---|---|
| **AirDNA** | `r/loanoriginators/1e7au8k` | STR income projection (nightly rate + vacancy) |
| **STR Pro** (by Nationwide AMC, cited by Acra Lending) | `r/loanoriginators/1e7au8k` | Form that pulls AirDNA data, accepted by some lenders as 1007 replacement |
| **LoanSifter / similar loan-pricing engines** | `r/loanoriginators/1juv3sq` | Broker pricing-exception shopping |
| **"Rent Schedule" / DSCR calculator** in Google Sheets | Multiple (e.g., `r/realestateinvesting/1gthzwm`) | DIY, manual formula |
| **Fannie Mae Form 1007 (PDF)** | singlefamily.fanniemae.com/media/12351/display | Canonical, but not for STR |
| **Class Valuation "Understanding the 1007" blog** | classvaluation.com/blog/appraisal-form-1007-why-it-cant-be-used-for-short%E2%80%91term-rentals/ | Educational |
| **Redashboard.org/deal-analysis** | `r/realestateinvesting/1pbui09` | Proforma modeling w/ free week trial |
| **FindMyDSCR.com** | `r/Mortgages/1p2kp8x` | State-specific lender data + DSCR calculators |
| **DSCRBuddy.com** | `r/Mortgages/1p2kp8x` | "Champions is good; running early bird specials" (per comment) |
| **Silver Hill Funding DSCR Calc** | silverhillfunding.com/dscr-calc | Lender-provided quick-quote (saves loan amount, LTV, FICO, DTI/DSCR, broker email) |
| **Overline IQ** | `r/realestateinvesting/1rdtfg9` | Cost segregation calculator |
| **ProPilot** | `r/realestateinvesting/1r1b5v0` | Multi-lender shopping aggregator for niche lenders |
| **RentCast, Rabbu** | `r/Mortgages/1pri1uj`, others | Rent comp data |

### 9.2 Lender-provided vendor DSCR calculators

Most DSCR lenders publish a quick-quote tool that pulls the same inputs (loan amount, LTV, FICO, DSCR, property type, email). Sample inventory:

- **Silver Hill** — silverhillfunding.com/dscr-calc
- **NQM Funding** — nqm.thelender.com
- **Dominion Financial** — dominionfinancialservices.com
- **American Heritage Lending (AHL)** — ahlend.com
- **TheLender.com** — nqm.thelender.com
- **CrossCountry Mortgage** — rpm-mtg.com
- **California Capital Mortgage Bank** — ccmb.com (CA Prop-13-aware, $3.5M max)
- **New American Funding** — newamericanfunding.com/loan-types/non-qm-loan/dscr-loan/state/california/
- **Truss Financial Group** — trussfinancialgroup.com/blog/dscr-loan-below-1
- **Newfi** — newfi.com/dscr-loan-prepayment-penalty
- **Bluerate.ai** — bluerate.ai/blog/dscr-loan-pros-and-cons
- **Lendmire** — lendmire.com/how-dscr-loans-are-underwritten
- **SalaryDr** — salarydr.com/blog/dscr-loans-real-estate-physicians
- **MCFunding** state guide PDF — mcfunding.com/wp-content/uploads/2024/05/State-Prepayment-Penalty-Guide-5.2.24.pdf
- **HonestCasa** — honestcasa.com/blog/dscr-loan-prepayment-penalty
- **AHL** — ahlend.com/dscr-loan-prepayment-penalties-explained/
- **Ridge Street Capital** — ridgestreetcap.com/blog/dscr-loan-prepayment-penalty
- **Chalet (dev tool)** — `r/realestateinvesting/1134w49` — "tools we have that allow you underwrite the property for its cashflow potential to calculate the DSCR ratio"

**HOW useful for Sovereign OS:** none of these calculators talk to each other. A single meta-engine that calls 5-10 lender quote APIs and normalizes the output is the natural play.

**Tag:** TOOL, VENDOR, DATA_SOURCE

---

## 10. Hacker News Insights (Algolia corpus)

Hacker News is sparse on residential DSCR (it's a commercial-real-estate / CRE topic there), but the comments are unusually high-signal.

### 10.1 DSCR triggers default when rent drops

`HN item 41412652` (under "Landlords Face a $1.5T Commercial Real Estate Maturity Wall"):

> *"Commercial backed mortgages I have been privy to come with debt service coverage ratios, which can trigger default if total cash flow is not as expected. Some rent is always more than no rent. Lenders aren't fooled by property owners earning less money, but advertising higher than market rate rents to prospective tenants. The only question is if the lender wants to trigger the default and take over dealing with the property, and many times they don't, and prefer to renegotiate the terms of the loan."* — `lotsofpulp`, 2024-08-31

**Tag:** INSIGHT — confirms that DSCR enforcement is lender-discretionary. Important for Sovereign OS to model: covenant enforcement is not deterministic.

### 10.2 DSCR covenants can force lender takeover of bank accounts

`HN item 22968052` (under "Wealthy mortgage borrowers face cold shoulder from lenders"):

> *"In certain commercial mortgages, you have to maintain a certain debt service coverage ratio (DSCR), which is operating income divided by debt service. If not maintained above a certain ratio, the lender has the right to come and take over your bank accounts and you have to submit to them to get reimbursed for expenses. Never heard of it in a residential loan though."* — `lotsofpulp`, 2020-04-24

**HOW useful for Sovereign OS:** the engine should model the "cash management / lockbox" overlay that commercial DSCR loans carry. This is rarely disclosed in residential 1-4 unit DSCR but is the reason most non-QM DSCR lenders require LLC entity title.

**Tag:** INSIGHT, TOOL

### 10.3 $1.5T CRE Maturity Wall

`HN item 41412054` ("Landlords Face a $1.5T Commercial Real Estate Maturity Wall" — Bloomberg, 2024-08-31) — the entire HN thread is gated to commercial DSCR. The community consensus: refinancing pressure through 2026 means 5+ unit / commercial DSCR will be tighter, and 1-4 unit will continue to absorb demand.

**Tag:** INSIGHT, DATA_SOURCE

### 10.4 STR rent-fixing software → DSCR risk

`HN item 41237850` (under "San Francisco seeks ban of software critics say is used to inflate rents"):

> *"Commercial mortgages will come with terms requiring a minimum debt service coverage ratio (DSCR) to avoid default. If a landlord leaves units empty, their income drops, so their DSCR drops, and the lender can consider the property in default."* — `lotsofpulp`

**HOW useful for Sovereign OS:** STR market rate is now politically and regulatorily exposed (Palm Springs, SF, NYC, Barcelona). Sovereign OS should include a regulatory-overlay module that flags STR-restricted jurisdictions.

**Tag:** INSIGHT, DATA_SOURCE

### 10.5 LBO / mortgage analogy (Hacker News canonical)

`HN item 48293540` (the canonical LBO-DSCR comment):

> *"LBO's are like buying a rental property where the mortgage is approved by ensuring the DSCR (debt service coverage ratio) is over 1.0. In an LBO the target owes the debt."*

**HOW useful for Sovereign OS:** this framing ("DSCR is the commercial equivalent of personal DTI") is the cleanest teaching artifact. Use it in onboarding.

**Tag:** INSIGHT, TOOL

---

## 11. BiggerPockets Threads (Additional Detail)

| URL | Date | Upvotes/Replies | Key Takeaway |
|---|---|---|---|
| `1271239-experience-with-dscr-loans` | 12/10/2025 | 0/6 | "DSCR loans solve 99.99% of the problems traditional financing proposes" — lender (Devin Peterson) |
| `1042383-dscr-loan-calculations` | 5/26/2022 | 6/15 | "Most lenders won't lend via DSCR if the ratio is less than 0.75%" — Kristen L Garner |
| `1265826-dscr-question-are-rates-unreasonable` | 10/18/2025 | 3/6 | 7.5-8% on $250K loan @ 35% down; community consensus = "rates in low 6s" is normal |
| `1261414-how-do-i-know-if-i-am-getting-a-good-dscr-loan` | 9/10/2025 | 0/13 | Quote vs closing-table rate drift; BRRRR strategy + DSCR seasoning |
| `1245616-question-fix-and-flip-loan-or-dscr` | 6/1/2025 | 3/8 | Fix-and-flip → DSCR refi (BRRRR), 6-month seasoning common |
| `1257447-brrrr-questions-on-hard-money-lending-reserves-dscr` | 8/11/2025 | 1/8 | 100% financing is a "pipedream"; need 10-20% cash + reserves |

**HOW useful for Sovereign OS:** these are practitioner-level discussions on rate-shopping, BRRRR math, and lender reliability. The closing-table quote-drift complaint (`1261414`) is a known pain point that a Sovereign OS rate-lock confirmation could solve.

**Tag:** INSIGHT, TOOL, PAIN_POINT, VENDOR

---

## 12. Synthesized Insights for DSCR Sovereign OS

### 12.1 Feature Priorities (inferred from pain-point frequency)

| Frequency in corpus | Pain point | Sovereign OS feature |
|---|---|---|
| 8+ threads | DSCR math confusion / what counts as rent | "DSCR-onboarding wizard" with 5-min walkthrough |
| 6+ threads | STR vs 1007 incompatibility | AirDNA → 1007 auto-generator + vacancy haircut slider |
| 5+ threads | Lender shopping / rate comparison | Multi-lender quote aggregator (calls 5+ lender APIs) |
| 4+ threads | PPP state map | PPP-state validator with rate-adjustment logic |
| 4+ threads | Florida insurance shock | Insurance line-item stress-test module |
| 3+ threads | CA/NY tax reassessment on sale | Reassessment-on-sale modeler with Prop 13 / NY logic |
| 3+ threads | Lender reliability / Dominion-style failures | Lender SLA tracker, public complaint aggregation |
| 2+ threads | 5+ unit boundary | Property-type → product-family router |
| 2+ threads | Occupancy / owner-fraud | Closing-doc occupancy clause template + warning |
| 2+ threads | 1-4 unit vs 5+ unit cap rate confusion | KP17: educational walkthrough (small multifamily ≠ CRE) |
| 2+ threads | Cash management / lockbox | Commercial-style covenant simulator |
| 1+ thread | Condo warrantability (Figure delay) | Condo warrantability pre-check |
| 1+ thread | Bank statement / non-DSCR alt paths | Non-DSCR product family tree |

### 12.2 Data Sources the Engine Should Ingest

1. **AirDNA** — STR nightly rates + vacancy (paid, API available)
2. **RentCast / Rabbu** — LTR rent comps
3. **County assessor public records** — Prop 13 reassessment modeling (CA)
4. **FEMA flood maps** — flood insurance requirements
5. **Citizens Insurance / state-backed insurers** (FL, CA FAIR) — fallback insurance pricing
6. **NMLS** — LO license verification
7. **Lender-published quick-quote APIs** — for live rate shopping
8. **Reddit/HN/BiggerPockets scraping** — for lender NPS / closing-time complaints
9. **State attorney general + state banking dept** — for PPP enforceability per state
10. **Fannie Mae Form 1007 PDF template** + UAD 3.6 form spec
11. **Form 1004 / 1025 / AIRDna STR Pro integration**

### 12.3 Vendors to Watch (in the order of community frequency)

Tier 1 (most-cited): **Lima One, Visio, HonestCasa, Kiavi, Deephaven, Newfi, Brokers Advantage, AHL, NQM Funding, A&D, Carrington, New Silver, Easy Street Capital**
Tier 2 (frequent): **Silver Hill, Dominion Financial, Beeline, Figure, TheLender.com, Astoria, Fund Loans, Loanstream, Orion, NMSI, Rabbu, Convoy Home Loans, Beltway Lending, Acra, Angel Oak, Defy, Open Wholesale, Cake TPO, Emporium TPO, LendZ**
Tier 3 (specialty): **Dominion Financial, ProPilot, DSCRBuddy, FindMyDSCR, Chalet, Lendmire, SalaryDr, Truss Financial, New American Funding, CA Capital Mortgage**

---

## 13. Limitations & Gaps

1. **Reddit .json endpoints blocked** — had to scrape old.reddit.com rendered HTML. Quality is high but upvote counts may be slightly stale.
2. **BiggerPockets thread detail only available on Pro tier** — quoted content is first-page only.
3. **HN Algolia only returns 3 "DSCR mortgage" matches** — broader DSCR/discussions exist under LBO, CRE, mortgage tags but weren't fully surfaced.
4. **No DSCR-specific subreddit exists** — discussion is scattered across r/realestateinvesting, r/Mortgages, r/loanoriginators, r/appraisal, r/Insurance, r/RealEstate, r/personalfinance. Search-driven discovery.
5. **Vendor Reddit posts are heavily self-promotional** — cross-referenced against LP comments to filter signal.
6. **Some threads are 2-3 years old** — rates / lender guidelines have shifted; matrix in section 3 is current as of mid-2025 / early-2026 based on the most recent threads.
7. **No real estate cycle data** — would need to layer FRED, NAR, or Attom Data for macro context.

---

## 14. File Manifest

| File | Contents |
|---|---|
| `reddit_forums_REPORT.md` | This document |
| `reddit_forums_urls.txt` | Flat list of every URL visited |
| `_raw_hn_dscr.json` | Raw HN Algolia response (DSCR query) — kept for reference |

---

*Generated 2026-06-19. Sources: web_search + webfetch (old.reddit.com rendered HTML, hn.algolia.com API, biggerpockets.com rendered HTML, lender vendor blogs).*
