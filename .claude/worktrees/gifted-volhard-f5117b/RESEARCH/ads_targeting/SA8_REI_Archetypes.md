---
type: research
status: drafted
confidence: 4
title: "SA8 — REI Archetypes × DSCR Fit Matrix"
summary: "12 real estate investor archetypes scored on DSCR fit (STRONG/MODERATE/WEAK/N/A), with property type, DSCR ratio, loan size, FICO, reserves, lender picks, ad targeting hook, and compliance concerns per archetype. Used for ad targeting segmentation and broker lead routing."
entities:
  - concept/dscr
  - concept/ltv
  - concept/ppp
  - concept/pitia
  - concept/str
  - concept/ltr
  - concept/mtr
  - topic/sfr
  - topic/2-4-unit
  - topic/multifamily
  - topic/condo
  - topic/condotel
  - topic/portfolio
  - topic/str
  - topic/str-seasoning
  - topic/airbnb
  - topic/vrbo
  - topic/travel-nurse
  - topic/section-8
  - topic/build-to-rent
  - topic/foreign-national
  - topic/itin
  - lender/insula
  - lender/lima-one
  - lender/bff
  - lender/corevest
  - lender/ready-capital
  - lender/easy-street
  - lender/angel-oak
  - lender/visio-lending
  - lender/kiavi
  - lender/newfi
  - lender/griffin-funding
  - lender/dominion-financial
  - lender/the-lender
  - lender/acra-lending
  - lender/defy
  - lender/american-heritage
  - lender/crosscountry
  - lender/uwm
  - lender/crestmark
  - lender/deephaven
  - lender/ocmbc
  - lender/arbor
  - lender/park-place
  - state/nj
  - state/ny
  - state/mn
  - state/pa
  - state/oh
  - state/wa
  - state/hi
  - regulation/hoepa
  - regulation/section-1071
  - regulation/fcra
tags:
  - topic/archetype
  - topic/ad-targeting
  - topic/persona
  - topic/compliance
  - topic/str-regulation
  - topic/ppp
  - topic/llc
  - topic/marketing
source: RESEARCH/ads_targeting/SA8_REI_Archetypes.md
vaulted_at: 2026-06-22
---

# SA8 — REI Archetypes × DSCR Fit Matrix

**Compiled by:** DSCR Verifier (agent)
**Date:** 2026-06-22
**Purpose:** Segmentation for ad targeting, broker lead routing, and product/marketing alignment. Every profile scores a DSCR fit rating (STRONG / MODERATE / WEAK / N/A) with rationale, top lender picks, ad copy hook, and compliance concerns tied back to the corpus.

**Source priority (per agent charter):**
1. Corpus files at `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\_obsidian_vault\_research\` (domains 11, 13; sprints 3, 6; godmode T12, T13)
2. Lender matrices (Domain 11 portfolio_lender_matrix.csv — 24 lenders)
3. Lender product pages (Easy Street, Visio, Insula, Crestmark, Lima One, BFF, Angel Oak, Dominion)
4. BiggerPockets strategy guides / forum consensus
5. Roofstock / AirDNA / Mashvisor archetype breakdowns
6. Live web search for archetype-specific underwriting rules (2026)

---

## 0. Executive Summary — Top-Line Findings

### Top 3 DSCR-friendly archetypes (for ad spend concentration)

1. **Long-Term Rental (LTR) — scaling portfolio (3-15 SFR / 2-4 unit)** — *STRONG* fit. This is the bread-and-butter DSCR use case. Easy to underwrite (12-month leases, 1007 rents, Fannie Form 1037-style appraisal), broadest lender selection (22+ lenders), lowest compliance friction. **Largest absolute addressable audience.**

2. **Short-Term Rental (STR) — 1-5 unit operator in CLEAR/RESTRICTED state** — *STRONG* fit. Higher revenue-per-door, premium lender niches (Easy Street, Kiavi, Newfi, Visio STR-friendly), STR-specific data sources (AirDNA). The 12-month STR seasoning waiver at Easy Street is the industry-unique unlock. **Highest revenue per loan.**

3. **Portfolio Lender Customer (cross-collateralized 5-50 properties)** — *STRONG* fit at $5M+ portfolio size. Insula Capital (launched Jun 11 2026), Brokers First Funding, Lima One blanket, Verus aggregator. One approval, one closing, lower blended cost of capital. **Highest LTV per customer.**

### The 1 surprising pattern

**The "house hack" archetype — the #1 entry strategy at BiggerPockets — is *incompatible* with DSCR as a primary financing vehicle.** DSCR explicitly requires *investment* occupancy (not owner-occupied); FHA/conventional/VA require *owner-occupied* for house hack loans. House hackers graduate INTO DSCR only after they move out and the property converts to investment status. **The implication for ad targeting: a meaningful share of "how do I finance my first rental" traffic is *not* a DSCR lead at all — it's an FHA/conventional lead. Filter before bidding.** Source: HonestCasa DSCR House Hacking guide, May 2026 update.

### Compliance concerns that change everything (5 alerts)

| Alert | State / Reg | Archetypes affected | What it does |
|-------|-------------|---------------------|--------------|
| NJ LLC contested | NJ (Arc Home Jul 22 2025 + NPLA Oct 2025) | All NJ investment deals | NJ LLC vesting has elevated scrutiny; some lenders decline; expect 25-50bps pricing premium |
| MN HF 3437 PPP | MN (eff Aug 1 2026) | All MN deals | Statewide PPP cap (~$329K bracket); affects all DSCR products; refinance-only period |
| PA Act 6 2026 PPP | PA (eff 2026; threshold $329,411) | All PA deals | Lowest PPP threshold in the country; 0% PPP possible in PA |
| OH ORC §1343.011 | OH (2025 threshold $112,957) | All OH deals | Lowest state PPP threshold + Visio zero-PPP state |
| WA RCW 19.144.040 | WA (60-day ARM PPP limit) | All WA ARM products | ARM 5/6 capped at 60-day pre-payment window; product-pricing change |

### Confidence level

| Field | Confidence | Why |
|-------|------------|-----|
| DSCR fit rating per archetype | 4/5 | Synthesized from 24-lender matrix + lender product pages + BiggerPockets strategy consensus |
| Typical DSCR ratio per archetype | 3/5 | Industry ranges only; no single primary source; varies by lender/product |
| Typical loan amount per archetype | 4/5 | Lender matrices publish min/max |
| Top 3 lender picks per archetype | 4/5 | Pulled from domain 11 matrix (24 lenders) + product page verification |
| Ad targeting hook | 3/5 | Inferred from lender copy + BiggerPockets forum tone; not A/B tested |
| Compliance concerns per archetype | 5/5 | Direct cite to primary sources (CFR, state statute, lender matrix) |

---

## 1. Master Matrix — All 12 Archetypes

| # | Archetype | DSCR Fit | Property | DSCR | Loan Amt | FICO | Reserves | Top Lenders (first 3) | Ad Hook |
|---|-----------|----------|----------|------|----------|------|----------|------------------------|---------|
| 1 | BRRRR (Buy-Rehab-Rent-Refi-Repeat) | **STRONG** | SFR, 2-4 unit | ≥1.0 post-rehab | $150K-$500K | 680-720 | 3-6mo PITIA | Easy Street, Kiavi, Newfi | "Recycle your down payment — buy 5 properties with 1 down payment" |
| 2 | House Hack (1-unit + ADU OR 2-4 unit live-in) | **N/A** then **STRONG** as exit | 2-4 unit / SFR + ADU | 1.0+ as refi | $200K-$500K | 660-740 (as exit) | 3-6mo PITIA (as exit) | FHA → then Visio/Kiavi/Lima One (post-move-out) | "Live for free" (FHA) → "Graduate to portfolio scale" (DSCR exit) |
| 3 | Long-Term Rental (LTR, 12-mo lease) | **STRONG** | SFR, 2-4 unit, condo | 1.0-1.25 | $150K-$2M | 660-780 | 3-12mo PITIA | Visio, Griffin, Acra, Pennymac | "Stable, predictable, no-income-doc rental financing" |
| 4 | Short-Term Rental (STR, 1-30 day) | **STRONG** | SFR, condo, condotel | 1.0+ (Easy Street: NO MIN) | $150K-$2M | 660-740 | 3-6mo PITIA | Easy Street, Kiavi, Newfi, Visio | "Airbnb income qualifies. No tax returns. No W-2." |
| 5 | Mid-Term Rental (MTR, 30+ day) | **STRONG** | SFR, condo, townhome | 1.0+ | $150K-$1.5M | 660-740 | 3-6mo PITIA | Visio, Angel Oak, Easy Street | "Travel nurses, corporate relocations, insurance holds — without the STR chaos" |
| 6 | Vacation Rental (resort/destination) | **MODERATE** | SFR, cabin, resort condo | 1.0+ | $250K-$1.5M | 700-760 | 3-6mo PITIA | Easy Street (AirDNA), Newfi, Kiavi | "Own the beach house. Finance it like one." |
| 7 | Multi-family (5+ unit) | **MODERATE** | 5-50 unit small multifamily | 1.20+ (commercial-style) | $500K-$50M | 680-740 | 6-12mo PITIA | Ready Capital, Lima One, BFF, Insula | "Stop managing 1-4 unit rentals. Step up to 5+ unit scale." |
| 8 | Portfolio Lender Customer (5-50 cross-collateral) | **STRONG** | Blended SFR/STR/small MF | 0.75-1.20 portfolio-WA | $2M-$50M | 700-820 | Portfolio-level | Insula, BFF, Lima One, Verus (aggregator) | "One approval. Ten properties. One closing." |
| 9 | Section 8 / Affordable Housing (HCV) | **MODERATE** | SFR, 2-4 unit | 1.0-1.25 | $100K-$500K | 660-720 | 3-12mo PITIA | Wholesale broker sourced (50% of DSCR lenders accept) | "Government-backed rent. 7-year tenants. No income verification." |
| 10 | Co-living / Room-by-Room | **MODERATE** | Large SFR (4+ BR), small MF | 1.0+ (gross rent aggregated) | $200K-$750K | 680-740 | 3-6mo PITIA | Visio, Griffin, Acra, Dominion | "Rent every bedroom. Maximize yield. DSCR-friendly." |
| 11 | Build-to-Rent (BTR) Developer | **STRONG** | SFR subdivision (5+ units) | 1.0+ on stabilized NOI | $2M-$100M (2-phase: construction → permanent) | 680-740 | 6-12mo PITIA | Arbor (construction), Park Place/Pinnacle/Cactus (permanent DSCR) | "Build, lease, refinance — vertical integration" |
| 12 | Wholesale / Flip (NOT DSCR) | **N/A** | SFR (single-property at a time) | N/A (transactional) | $75K-$500K (hard money / bridge) | 620-680 | None typical | LendingOne, Kiavi (bridge), DOMINION (100% LTC) | Cross-sell to BRRRR exit / DSCR refi; not primary |

---

## 2. Detailed Archetype Profiles

### Archetype 1 — BRRRR (Buy-Rehab-Rent-Refi-Repeat)

**DSCR Fit: STRONG**

| Field | Value |
|-------|-------|
| **Typical property** | 1-4 unit SFR / duplex / triplex / fourplex; B-class neighborhoods |
| **Typical DSCR** | ≥1.0 at refi; ideal 1.15-1.25 (cash flow positive post-rehab) |
| **Typical loan amount** | $150K-$500K; up to $750K in high-cost MSAs |
| **Typical FICO** | 680-720 (Easy Street accepts **620** for STR refi post-BRRRR; primary source: easystreetcap.com) |
| **Typical reserves** | 3-6mo PITIA after refi closing |
| **Top 3 lender picks** | (1) **Easy Street Capital** — *industry-unique 12-month STR seasoning waiver* (critical for new-build/refurb STR). (2) **Kiavi** — tech-forward, fast close. (3) **Newfi** — DSCR + bridge combo. |
| **Ad targeting hook** | "Recycle your down payment — buy 5 properties with the cash from 1." Cash-flow-positive. "Hard money in. DSCR out." |
| **Compliance concern** | 6-month title seasoning (cash-out), property condition appraisal (deferred maintenance flags), LLC HIGH-RISK (NJ, NY entity-required states per Visio). |

**Why STRONG:**
BRRRR's *refi step* is exactly what DSCR is built for — refinance the hard money / bridge loan into a long-term 30-yr fixed or 5/6/7/6 ARM with no income verification. Easy Street's STR seasoning waiver directly addresses the "no 12-month rental history" challenge. LargerPockets forum consensus: BRRRR is the most common path *into* DSCR for first-time-to-mid-tier investors.

**Sources:** BiggerPockets BRRRR forum (topic 1278549, 1274480, 1229240); Easy Street lender profile (Domain 3, lines 41-56); Insula PR Web Jun 11 2026.

---

### Archetype 2 — House Hack (1-unit + ADU OR 2-4 unit live-in)

**DSCR Fit: N/A as primary. STRONG as exit/refi.**

| Field | Value |
|-------|-------|
| **Typical property** | 2-4 unit (classic), SFR + ADU, SFR with rentable rooms |
| **Typical DSCR** | N/A at purchase (owner-occupied loan); 1.0+ at DSCR exit |
| **Typical loan amount** | $200K-$500K (purchase); 75% LTV at DSCR exit refi |
| **Typical FICO** | 580+ FHA, 620+ conventional, 660+ at DSCR exit |
| **Typical reserves** | 3-6mo PITIA at DSCR exit |
| **Top 3 lender picks (as primary)** | **FHA, VA, or Conventional 97** (NOT DSCR). At exit: (1) **Visio**, (2) **Kiavi**, (3) **Lima One** for cross-collateral roll-up. |
| **Ad targeting hook** | **Phase 1 (purchase):** "Live for free in your first duplex" (FHA). **Phase 2 (exit):** "Convert your house hack to a DSCR-financed rental — no income docs" |
| **Compliance concern** | Occupancy fraud risk (legitimate concern; not paranoia). At DSCR exit, the borrower must have moved out and the property must be a true investment. Misrepresenting occupancy is federal mortgage fraud. |

**Why N/A as primary, STRONG as exit:**
DSCR loan applications explicitly ask about occupancy plans. If the borrower indicates owner-occupied intent, they are denied and redirected to FHA/conventional/VA. FHA (3.5% down, 580+ FICO) and VA (0% down) are the dominant house-hack products.

**The graduation play (HonestCasa May 2026 update):** A house hacker buys a $350K duplex with FHA at 3.5% down. Lives 1-2 years. Moves to a new house hack. Original property converts to 100% investment. Borrower then **refinances to a DSCR loan** at 75% LTV — removes FHA MIP, drops payment, scales to next property. This is the *natural* bridge from house hack to portfolio investor.

**Ad targeting implication:** House hack keyword traffic ("how to buy first rental with 3.5% down") is FHA/conventional, not DSCR. **Filter for "already own a primary residence" / "moving out" / "second property" intent** before bidding DSCR keywords on this segment.

**Sources:** HonestCasa "DSCR Loan House Hacking" (May 25 2026, updated Jun 4 2026) — definitive primary source. HUD FHA history page. Verus S&P DSCR Presale 2025 (89.44% property-focused borrowers).

---

### Archetype 3 — Long-Term Rental (LTR, 12-month lease)

**DSCR Fit: STRONG (highest absolute volume)**

| Field | Value |
|-------|-------|
| **Typical property** | SFR, 2-4 unit small multifamily, warrantable condo, townhome |
| **Typical DSCR** | 1.0-1.25 minimum; 1.20+ for best pricing |
| **Typical loan amount** | $150K-$2M (Visio range $100K-$5M; Griffin $100K-$2.5M) |
| **Typical FICO** | 660-780; 720+ best pricing; 620 floor at Visio, Newfi |
| **Typical reserves** | 3-12mo PITIA depending on lender |
| **Top 3 lender picks** | (1) **Visio Lending** — #1 dedicated DSCR lender (Scotsman Guide 2024, $854.6M DSCR submitted volume). (2) **Griffin Funding** — DSCR specialist, $1.5M-$5M typical portfolio. (3) **Acra Lending** — 100% non-QM, 339B 2024 vol. (Pennymac, Newfi, Kiavi, Angel Oak, American Heritage, A_D_Mortgage all viable.) |
| **Ad targeting hook** | "Stable, predictable, no-income-doc rental financing." "Qualify on the rent, not the W-2." "The rental pays for itself." |
| **Compliance concern** | State PPP (MN Aug 2026; PA $329,411; OH $112,957; WA 60-day ARM); NJ/VA/GA/IL entity-required (Visio); HOEPA 2026 thresholds ($27,592 / $1,380); §1071 reporting Jan 1 2028 (broker-exempt). |

**Why STRONG:**
LTR is the bread-and-butter DSCR use case. The 12-month lease + 1007 appraisal + Fannie Form 1037 cash-flow projection is the standard underwriting model. Verus S&P DSCR Presale 2025 reports **89.44% property-focused borrowers** — the dominant segment. **63.04% of DSCR loans originate with no lease in place** (lenders use market rent). WA DSCR 1.10x in institutional pools.

This is the archetype where ad spend most directly converts to funded loans. Buyer intent signal: "I'm buying a rental property" / "I want to add to my portfolio" / "I'm scaling from 1 to 5 doors."

**Sources:** Domain 11 portfolio_lender_matrix.csv (24 lenders); Visio profile (Domain 3); Angel Oak profile; Verus S&P 2025 presale; Domain 13 borrower personas (Persona 1: First_Time_SFR_Investor, Persona 2: Scaling_Portfolio_Builder — 30% + 22% = 52% of DSCR originations).

---

### Archetype 4 — Short-Term Rental (STR, 1-30 day)

**DSCR Fit: STRONG**

| Field | Value |
|-------|-------|
| **Typical property** | SFR, condo, condotel, cabin, resort-adjacent |
| **Typical DSCR** | 1.0+ minimum; Easy Street has **NO MINIMUM DSCR for STR** (industry-unique) |
| **Typical loan amount** | $150K-$2M (Easy Street cap $2M; Newfi up to $3M) |
| **Typical FICO** | 660-740 |
| **Typical reserves** | 3-6mo PITIA |
| **Top 3 lender picks** | (1) **Easy Street Capital** — STR specialist, 100% AirDNA acceptance, waives 12-mo STR seasoning. (2) **Kiavi** — STR-friendly tech DSCR. (3) **Newfi** — DSCR + bridge combo for STR flippers. (Visio STR-supported, Angel Oak STR via AVM lock.) |
| **Ad targeting hook** | "Airbnb income qualifies." "No tax returns. No W-2. No DTI." "Use AirDNA, not Zillow Zestimate." |
| **Compliance concern** | **STR regulation 50-state matrix:** 2 PROHIBITED (HI, NY), 18 RESTRICTED (CA, CO, FL, GA, IL, MA, NC, NJ, TN, VA, etc.), 6 UNCERTAIN, 24 CLEAR. **WA, MN, NJ LLC HIGH-RISK overlay.** STR is most state-conditional product — engine must fire state-level kill criteria. |

**Why STRONG (with caveats):**
STR generates 1.5x-2.5x the rent of LTR in destination markets, but adds 12-month rental history requirement (most lenders require 12 months of STR P&L or AirDNA projection). Easy Street's waiver of this seasoning requirement is the industry-unique unlock. **State regulation is the killer:** NYC Local Law 18, Hawaii county-by-county, NJ Asbury Park ban, many FL/CA city restrictions. Loan can be closed in CLEAR states, but appraised value reflects STR-restricted comps in RESTRICTED states.

**Sources:** AirDNA "Quick Guide to STR Financing"; Easy Street Capital short-term rentals product page; T12 50-state STR regulation matrix (Domain 12); Domain 6 STR data; HonestCasa.

---

### Archetype 5 — Mid-Term Rental (MTR, 30+ day)

**DSCR Fit: STRONG**

| Field | Value |
|-------|-------|
| **Typical property** | SFR, condo, townhome (furnished, 30+ day stays) |
| **Typical DSCR** | 1.0+ minimum |
| **Typical loan amount** | $150K-$1.5M |
| **Typical FICO** | 660-740 |
| **Typical reserves** | 3-6mo PITIA |
| **Top 3 lender picks** | (1) **Visio Lending**, (2) **Angel Oak**, (3) **Easy Street** (if STR seasoning met). MTR is a subset of "LTR" or "STR" in most lender matrices — Truss Financial confirms DSCR is "the primary option for scaling investors" in MTR. |
| **Ad targeting hook** | "Travel nurses. Corporate relocations. Insurance holds." "30+ day furnished stays — the best of both worlds." "Higher than LTR rent. Lower than STR turnover." |
| **Compliance concern** | Furnished premium typically 10-20% above unfurnished LTR — must be documented in appraisal. Some lenders treat MTR as STR (12-mo history required) or LTR (gross market rent). Underwriting classification varies. |

**Why STRONG:**
MTR is the fastest-growing REI segment 2024-2026 (Furnished Finder 300K listings, 30M page views/year). Travel nurse demand is structural (3-month average stay). MTR bridges STR yield (1.5x LTR) and LTR stability (less turnover than STR). DSCR income calculation: most lenders use comparable LTR rent or appraiser market rent, not the actual MTR rent. Some lenders (Visio) accept MTR rent with 12-month history.

**Sources:** Furnished Finder / Travel Nurse Housing; Truss Financial Group "Mid-Term Rentals Guide"; Reddit r/realestateinvesting MTR threads.

---

### Archetype 6 — Vacation Rental (resort / destination market)

**DSCR Fit: MODERATE**

| Field | Value |
|-------|-------|
| **Typical property** | Cabin, beach house, resort condo, mountain chalet |
| **Typical DSCR** | 1.0+ on AirDNA projection |
| **Typical loan amount** | $250K-$1.5M |
| **Typical FICO** | 700-760 (higher because seasonal income volatility) |
| **Typical reserves** | 3-6mo PITIA; 6-12mo for off-season markets |
| **Top 3 lender picks** | (1) **Easy Street** (AirDNA-native), (2) **Newfi** (DSCR + bridge), (3) **Kiavi**. Many national DSCR lenders price vacation STRs as elevated risk → pricing premium 25-50bps. |
| **Ad targeting hook** | "Own the beach house. Finance it like one." "Smoky Mountains. Florida panhandle. Cape Cod. Finance your vacation rental with DSCR." |
| **Compliance concern** | Seasonal income volatility — 60-90% occupancy concentrated in 3-4 months. Engine must use 12-month TTM or 3-year average, not peak-month. Some lenders discount off-season income. Hurricane/wildfire insurance availability (Domain 8). |

**Why MODERATE (not STRONG):**
Vacation rental is a subset of STR with elevated risk. Seasonal income concentration, weather/insurance risk, and remote locations make underwriting harder. Many DSCR lenders will finance but with stricter reserve requirements and pricing premium. Appraiser must use 1007 with seasonal adjustment, or AirDNA 12-month projection.

**Sources:** AirDNA STR financing guide; Park Place BTR financing; Domain 6 STR data; Domain 8 insurance quotes by geography.

---

### Archetype 7 — Multi-family (5+ unit)

**DSCR Fit: MODERATE**

| Field | Value |
|-------|-------|
| **Typical property** | 5-50 unit small multifamily (small apartment building) |
| **Typical DSCR** | 1.20+ (commercial-style, more conservative) |
| **Typical loan amount** | $500K-$50M |
| **Typical FICO** | 680-740 |
| **Typical reserves** | 6-12mo PITIA |
| **Top 3 lender picks** | (1) **Ready Capital** (multifamily specialty, $500K-$50M, DSCR 1.00 floor). (2) **Lima One** (multifamily blended DSCR). (3) **BFF** (cross-collateral blanket). Bridge DSCR lenders. Pure commercial (5+ units, ≥$1M) often lives at agency CMBs/Freddie Mac small-balance rental, not DSCR. |
| **Ad targeting hook** | "Stop managing 1-4 unit rentals. Step up to 5+ unit scale." "One building. One loan. Twenty tenants." |
| **Compliance concern** | **5+ units is commercial** in most lender matrices — not residential mortgage, not subject to Reg Z / RESPA / ATR/QM. Different compliance regime. Some states require commercial broker license, not mortgage license. |

**Why MODERATE:**
The 1-4 unit vs 5+ unit line is a hard regulatory boundary. 5+ unit is typically financed via commercial mortgage (Freddie Mac SBL, Fannie Mae small MF, CMBS, life co.) — DSCR is a niche. Smaller 5-8 unit can be DSCR-financed, but pricing is closer to commercial than residential DSCR. Default risk profile is commercial (tenant roll, capex reserves, cap rate sensitivity).

**Sources:** Ready Capital product page; Lima One portfolio; Domain 11 portfolio lender matrix; Domain 7 capital markets research.

---

### Archetype 8 — Portfolio Lender Customer (5-50 cross-collateralized)

**DSCR Fit: STRONG at $5M+ portfolio**

| Field | Value |
|-------|-------|
| **Typical property** | Blended portfolio: SFR, 2-4 unit, small MF, possibly STR |
| **Typical DSCR** | 0.75 portfolio weighted-average (Insula publishes 0.75 floor on portfolio-level) |
| **Typical loan amount** | $2M-$50M (Insula: $100K-$3M per property, 2-50 properties) |
| **Typical FICO** | 700-820 (institutional investors) |
| **Typical reserves** | Portfolio-level cash management, not per-property |
| **Top 3 lender picks** | (1) **Insula Capital Group** (NEW Jun 11 2026 launch — consolidated underwriting, portfolio-level DSCR, cross-collateralized). (2) **Brokers First Funding** (2-25 properties, 38 states, 80% LTV). (3) **Lima One** (blanket loans, fix-flip-DSCR-rental). (Verus = securitizer aggregator.) |
| **Ad targeting hook** | "One approval. Ten properties. One closing." "Stop financing one property at a time." "Cross-collateral DSCR for the scaling investor." |
| **Compliance concern** | Portfolio concentration limits (per MSA, per state) — Insula 25% MSA / 35% state. Securitization disclosure (Reg AB II). §1071 small-business reporting Jan 1 2028 (likely broker-exempt for individual loan origination, but portfolio data may be reportable at the entity level). |

**Why STRONG (for the right borrower):**
The 2026 portfolio-DSCR category is newly hot: Insula Capital Group launched Jun 11 2026 specifically for "consolidated underwriting, portfolio cash-flow analysis, cross-collateralized loan options." This solves the "I have 8 properties and 8 separate DSCR loans" inefficiency. Lower blended cost of capital (one closing cost, one rate). Cross-collateralization allows weak-DSCR properties to be supported by strong-DSCR properties in the same portfolio.

**Sources:** Insula Capital PR Web press release Jun 11 2026 (Farmingville NY); Brokers First Funding product page; Lima One product page; Domain 11 portfolio_lender_matrix.csv lines 33-56.

---

### Archetype 9 — Section 8 / Affordable Housing (HCV)

**DSCR Fit: MODERATE (lender-dependent)**

| Field | Value |
|-------|-------|
| **Typical property** | SFR, 2-4 unit; some condo / townhome (PHA-dependent) |
| **Typical DSCR** | 1.0-1.25 minimum |
| **Typical loan amount** | $100K-$500K |
| **Typical FICO** | 660-720 (same as standard DSCR; 620 floor at some lenders) |
| **Typical reserves** | 3-12mo PITIA |
| **Top 3 lender picks** | **Wholesale broker required.** Mothebroker/Lumin Lending research: only **50-55% of DSCR lenders accept Section 8 voucher income**. Top picks: (1) wholesale-sourced Section 8-friendly DSCR lender, (2) Angel Oak, (3) Visio (case-by-case). |
| **Ad targeting hook** | "Government-backed rent. 7-year tenants. No income verification." "HUD pays 60-80% of the rent directly." "Fair Market Rent increases annually." |
| **Compliance concern** | **Lender policy dispersion is the #1 issue:** 25-30% of DSCR lenders count full HAP (Housing Assistance Payment) contract rent; 20-25% discount HAP by 10-25%; 20-25% use appraiser market rent only; 20-30% reject Section 8 entirely. **A 25% discount can kill a deal that would qualify elsewhere.** HQS inspection must be current. Property must pass DSCR appraisal. |

**Why MODERATE:**
Section 8 is a fantastic tenant (7-year retention vs 2-3 LTR; government-backed HAP; rent increases tied to annual FMR). But the *DSCR* lender dispersion on voucher income makes it a broker-driven deal. Borrower self-service direct application has a 45-50% rejection rate. Wholesale broker routing is essential.

**Sources:** Mothebroker "DSCR Loans for Section 8 Rentals" Mar 2026 update (Mo Abdel, NMLS #1426884, Lumin Lending NMLS #2716106) — definitive primary source on lender policy dispersion. HUD HCV program data; CBPP retention research.

---

### Archetype 10 — Co-living / Room-by-Room Rental

**DSCR Fit: MODERATE**

| Field | Value |
|-------|-------|
| **Typical property** | Large SFR (4+ BR), small multifamily, sometimes single-family converted |
| **Typical DSCR** | 1.0+ on aggregate room rent (3-5 separate tenants) |
| **Typical loan amount** | $200K-$750K |
| **Typical FICO** | 680-740 |
| **Typical reserves** | 3-6mo PITIA |
| **Top 3 lender picks** | (1) **Visio Lending**, (2) **Griffin Funding**, (3) **Acra Lending**, (4) **Dominion Financial** (850+ rental properties owned). Some lenders treat room-by-room as LTR; others require single-family lease. **HonestCasa's "DSCR rent by room" article covers this specifically.** |
| **Ad targeting hook** | "Rent every bedroom. Maximize yield. DSCR-friendly." "$4,000/month from 4 rooms. $400K loan. 1.0+ DSCR." |
| **Compliance concern** | Appraisal must support per-room rent (1007 room schedule). Some lenders discount to single-family rent (undervaluing by 30-50%). Local zoning (some cities prohibit unrelated occupants). HOA restrictions. |

**Why MODERATE:**
Co-living is a high-yield niche but underwriting is fragmented. Per-room rent is real but appraisal-comparable leases are rare — lenders lean conservative. Top markets: college towns (Boulder, Ann Arbor, East Lansing), urban infill (DC, SF, NYC), Sun Belt (Atlanta, Phoenix, Tampa).

**Sources:** HonestCasa "DSCR rent by room" article; Domain 6 STR data (overlaps with co-living/room rental in college markets); Reddit r/realestateinvesting co-living threads.

---

### Archetype 11 — Build-to-Rent (BTR) Developer

**DSCR Fit: STRONG (two-phase)**

| Field | Value |
|-------|-------|
| **Typical property** | Single-family subdivision (5-200+ units) |
| **Typical DSCR** | 1.0+ on stabilized NOI (post-construction) |
| **Typical loan amount** | $2M-$100M; construction phase + permanent takeout |
| **Typical FICO** | 680-740 (entity-level) |
| **Typical reserves** | 6-12mo PITIA + construction contingency |
| **Top 3 lender picks (construction)** | (1) **Arbor Realty Trust** (Single-Family Rental Portfolio BTR program, 24-month construction, $32.1M case study). (2) **Dominion Financial** (ground-up construction, no appraisal). (3) **Lima One** (construction-to-DSCR bridge). |
| **Top 3 lender picks (permanent takeout)** | (1) **DSCR portfolio lenders** (Insula, BFF, Lima One). (2) **Park Place Finance** (BTR permanent, NOI-based). (3) **Pinnacle Funding Network** (construction → 30-yr DSCR refi). |
| **Ad targeting hook** | "Build, lease, refinance — vertical integration." "SFR subdivision under one roof." "BTR is the institutional play of 2026." |
| **Compliance concern** | Construction-to-permanent bridge is two loans / two underwritings. Construction loan requires as-built appraisal, completion guarantee. Permanent DSCR refi requires stabilized NOI (typically 6-12mo of 90%+ occupancy). Entitled land, building permits, GC contracts. |

**Why STRONG (when verticalized):**
BTR is the fastest-growing institutional REI segment. Arbor's $32.1M BTR case study is the canonical example: 24-month construction loan, then refi into permanent DSCR. Park Place Finance calls DSCR "increasingly the preferred permanent financing vehicle for stabilized build-to-rent properties." Two-phase: hard money / construction → permanent DSCR. Net effect: developer captures construction profit + long-term rental cash flow.

**Sources:** Park Place Finance "Complete Guide to BTR Financing"; Arbor Realty Trust $32.1M case study; Pinnacle Funding Network BTR guide 2026; Cactus "How Investors Underwrite BTR 2026"; Rental Home Financing (90% LTC BTR).

---

### Archetype 12 — Wholesale / Flip (NOT DSCR, but cross-sell)

**DSCR Fit: N/A primary. STRONG as next-deal cross-sell.**

| Field | Value |
|-------|-------|
| **Typical property** | Distressed SFR (1-4 unit), at a time |
| **Typical DSCR** | N/A (transactional sale within 6-12 months) |
| **Typical loan amount** | $75K-$500K (hard money / bridge) |
| **Typical FICO** | 620-680 |
| **Typical reserves** | None typical (transactional) |
| **Top 3 lender picks** | (1) **LendingOne**, (2) **Kiavi** (bridge), (3) **DOMINION Financial** (100% LTC acquisition + rehab). NOT DSCR — these are bridge/hard money products. |
| **Ad targeting hook** | "Fix and flip, then rent-and-refi" — message: "Don't stop at the flip. BRRRR the next one." Cross-sell to Archetype 1 (BRRRR) or Archetype 3 (LTR). |
| **Compliance concern** | Bridge/hard money is *not* DSCR. Borrower is using transactional capital. Cross-sell motion: after the flip sale, fund the next deal with DSCR. |

**Why N/A:**
Flips exit before DSCR seasoning is relevant. But the *flipper* is a high-LTV lead for the next deal. After selling the flip, the flipper often rolls capital into a BRRRR (Archetype 1) or buy-and-hold rental (Archetype 3). **The cross-sell motion is the play here.** Ad targeting: "You've flipped. Now scale with DSCR."

**Sources:** LendingOne; Kiavi bridge product; Dominion Financial; BiggerPockets flipping forum.

---

## 3. Compliance Concerns Catalog (per archetype)

The following regulatory / compliance concerns apply to specific archetypes in specific states. Every ad campaign and lead-routing rule must be state-segmented.

| Concern | Source (corpus) | Archetypes affected | Action |
|---------|-----------------|---------------------|--------|
| **NJ LLC HIGH-RISK** (Arc Home Jul 22 2025 + NPLA Oct 2025) | NJ legal tracker | All NJ investment deals | Some lenders decline NJ LLCs; 25-50bps pricing premium; alternative is individual vesting in NJ |
| **MN HF 3437 PPP** (eff Aug 1 2026) | MN House Bill Summary Apr 23 2026 | All MN deals | Statewide PPP cap; refinance-only period; affects ALL archetypes in MN |
| **PA Act 6 2026 PPP** (threshold $329,411) | PA Bulletin 2026 | All PA deals | Lowest PPP threshold in country; 0% PPP possible in PA |
| **OH ORC §1343.011** (2025 threshold $112,957) | OH Revised Code | All OH deals | Lowest state PPP threshold + Visio zero-PPP state |
| **WA RCW 19.144.040** (60-day ARM PPP limit) | WA statute | All WA ARM products | 5/6 ARM capped at 60-day pre-payment; affects ARM-heavy products |
| **NJ Mansion Tax** (graduated >$1M seller brackets) | Holland & Knight Aug 2025 | All NJ $1M+ deals | Seller-side tax; affects pricing assumptions |
| **HOEPA 2026** ($27,592 / $1,380) | CFPB Federal Register Nov 2025 | All deals | APR/spread triggers; should not fire on DSCR (qualified mortgage exemption typically applies) |
| **§1071 small-business lending** (Jan 1 2028 compliance) | CFPB Final Rule May 1 2026 | All deals | Broker-exempt; data collection by originator only |
| **FCRA adverse action** (30-day notice / 25-month retention) | 15 USC 1681m | All denials | Adverse action notice for every DSCR denial |
| **T12 50-state STR regulation** (2 PROHIBITED / 18 RESTRICTED / 6 UNCERTAIN / 24 CLEAR) | T12 summary | STR, MTR, Vacation, BTR | State-level kill criteria for STR products |
| **NJ LLC contested (NPLA Oct 2025)** | NPLA | All NJ deals | NJ LLC vesting elevated scrutiny |

---

## 4. Ad Targeting Hooks — Quick Reference

| Archetype | Headline | Sub-headline | CTA |
|-----------|----------|--------------|-----|
| BRRRR | "Recycle your down payment" | "Buy 5 properties with the cash from 1" | "Get pre-qualified in 24 hours" |
| House Hack | "Live for free in your first duplex" | "FHA 3.5% down. Owner-occupant." | "Find FHA lenders" |
| House Hack (exit) | "Graduate to portfolio scale" | "DSCR refi your house hack — no income docs" | "See if you qualify" |
| LTR | "Qualify on the rent, not the W-2" | "Long-term rental DSCR from 660 FICO" | "Pre-qual in 5 minutes" |
| STR | "Airbnb income qualifies" | "No tax returns. No W-2. No DTI." | "Use AirDNA, not Zillow" |
| MTR | "Travel nurses. Corporate relocations." | "30+ day stays — the best of both worlds" | "Estimate MTR DSCR" |
| Vacation | "Own the beach house" | "Smoky Mountains. Florida panhandle. Cape Cod." | "See destination markets" |
| 5+ MF | "Step up to 5+ unit scale" | "One building. One loan. Twenty tenants." | "Talk to a commercial DSCR broker" |
| Portfolio | "One approval. Ten properties." | "Cross-collateral DSCR for the scaling investor" | "Insula / BFF / Lima One quote" |
| Section 8 | "Government-backed rent. 7-year tenants." | "HUD pays 60-80% of the rent directly" | "Find a Section 8-friendly lender" |
| Co-living | "Rent every bedroom" | "Maximize yield. DSCR-friendly." | "Get room-by-room DSCR" |
| BTR | "Build, lease, refinance" | "SFR subdivision under one roof" | "Construction + permanent takeout" |
| Flip → DSCR | "You've flipped. Now scale." | "Roll your flip capital into BRRRR" | "See your next deal" |

---

## 5. Top 3 Archetypes for Ad Spend Concentration (with rationale)

### #1: Long-Term Rental (LTR) — scaling portfolio (3-15 SFR / 2-4 unit)

**Why #1:**
- **Largest absolute addressable audience.** Verus S&P 2025 reports 89.44% property-focused borrowers. Domain 13 personas: Persona 1 (First_Time_SFR_Investor, 30% of originations) + Persona 2 (Scaling_Portfolio_Builder, 22% of originations) = **52% of DSCR origination volume**.
- **Broadest lender selection** (22+ lenders in Domain 11 matrix all accept LTR).
- **Lowest compliance friction** — 12-month lease is unambiguous; 1007 + 1037 underwriting is industry standard.
- **Easiest to underwrite at appraisal** — comparable LTR leases exist everywhere.
- **Largest loan pool at securitization** — Verus, KBRA, Citi, Barclays all want LTR paper.

**Bid higher on:** "rental property financing", "DSCR loan", "investment property mortgage", "no income verification mortgage", "LLC rental mortgage".

### #2: Short-Term Rental (STR) — 1-5 unit operator in CLEAR/RESTRICTED state

**Why #2:**
- **Highest revenue per loan.** STR generates 1.5x-2.5x LTR rent; same loan amount, higher DSCR.
- **Premium lender niche** (Easy Street, Kiavi, Newfi, Visio STR-friendly) — these lenders have the most to gain per customer.
- **Easy Street's industry-unique 12-mo STR seasoning waiver** is the competitive unlock.
- **AirDNA + Roofstock + Mashvisor** are data-rich targeting sources (lookalike audiences).
- **Market concentration** in TN (Nashville, Smokies), FL (Panhandle, 30A), NC (Asheville, OBX), SC (Hilton Head, Myrtle), AZ (Sedona, Phoenix), TX (Hill Country).

**Bid higher on:** "Airbnb financing", "STR DSCR loan", "vacation rental mortgage", "Airbnb investment property loan".

**Filter aggressively:** Avoid NY, HI (PROHIBITED); NJ, MA, CA coastal (RESTRICTED); 6 UNCERTAIN states.

### #3: Portfolio Lender Customer (5-50 cross-collateral)

**Why #3:**
- **Highest LTV per customer** ($5M-$50M per deal, vs $200K-$500K for single-property).
- **Insula Capital's June 11 2026 launch** is the freshest product in DSCR. The portfolio-DSCR category is under-served — single-property DSCR has 22+ lenders; portfolio DSCR has 4-5.
- **BFF, Lima One, Ready Capital** compete here but Insula's consolidated underwriting is unique.
- **Lower blended cost of capital** (one closing cost, one rate) — institutional pricing power.
- **Customer retention is high** (Domain 13 Persona 2: 70% 5-year retention; Persona 7 Institutional: 80% 5-year retention).

**Bid higher on:** "portfolio lender", "cross-collateral DSCR", "blanket loan", "consolidated rental financing", "Insula Capital".

**Filter aggressively:** Min 5 properties, min $5M portfolio value, min 700 FICO.

---

## 6. The 1 Surprising Pattern

### House hack ≠ DSCR (despite being the #1 entry strategy at BiggerPockets)

**Pattern:** House hacking is the **#1 most-recommended entry REI strategy at BiggerPockets** — 2-4 unit live-in-one, FHA 3.5% down, live for free. **But it's a direct fit for FHA / VA / Conventional 97, not DSCR.** DSCR explicitly requires investment-property occupancy; FHA/VA/Conventional require owner-occupant.

**Why it matters for ad targeting:**
- **"Buy my first rental" / "live for free" / "house hack" keyword traffic is FHA/VA/Conventional, not DSCR.** Bidding DSCR on these terms wastes spend.
- **The graduation play is the DSCR opportunity.** When the house hacker moves out 1-3 years later, the property converts to investment status. THAT'S the moment to target them with DSCR exit-refi messaging.
- **A meaningful share of "rental property" search traffic is first-time-investor / house-hacker intent** — they are NOT DSCR-ready (no W-2 strength, limited reserves, no LLC).

**Ad targeting filter:**
- **Phase 1 (FHA/conventional):** "How to buy a duplex with 3.5% down", "house hack calculator", "live for free real estate". Product: FHA, VA, Conventional 97.
- **Phase 2 (DSCR exit):** "Convert house hack to rental", "DSCR refinance after move-out", "remove FHA mortgage insurance with DSCR refi". Product: Visio, Kiavi, Lima One.
- **Retargeting motion:** If visitor downloaded a house-hack calculator 12-24 months ago, retarget with DSCR exit messaging. If visitor's last-touch was a house-hack webinar, retarget with "graduate to portfolio scale".

**Implication for ad budget allocation:** House hack keyword traffic should be **filtered OUT of DSCR campaigns** unless the visitor is also on the portfolio-scaling list. The Persona 1 (First_Time_SFR_Investor, 30% of originations) and Persona 4 (Self-Employed W-2 Skip, 15%) are pure DSCR — those are the spend targets. Persona's "house hacker" cohort is *not* a DSCR-ready audience.

**Sources:** HonestCasa "DSCR Loan House Hacking" (May 25 2026, definitive); BiggerPockets House Hacking forum; Domain 13 personas (Persona 1 details, Persona 2 graduation narrative).

---

## 7. Cross-Reference: Lender Match by Archetype

| Archetype | Primary | Secondary | Tertiary | Avoid |
|-----------|---------|-----------|----------|-------|
| BRRRR | Easy Street (12-mo STR waiver) | Kiavi | Newfi | Deephaven (no seasoning flex) |
| House Hack (purchase) | FHA, VA, Conv 97 | n/a | n/a | DSCR (occupancy conflict) |
| House Hack (exit refi) | Visio | Kiavi | Lima One | FHA streamline (still MIP) |
| LTR | Visio | Griffin | Acra | Easy Street (LTR OK but STR-specialized) |
| STR | Easy Street | Kiavi | Newfi | Deephaven, Ready Capital (no STR) |
| MTR | Visio | Angel Oak | Easy Street | Lenders without 30-day furnished product |
| Vacation | Easy Street (AirDNA) | Newfi | Kiavi | Newfi (geographic concentration risk) |
| 5+ MF | Ready Capital | Lima One | BFF | Visio (residential, not commercial) |
| Portfolio | Insula | BFF | Lima One | Acra (single-property specialist) |
| Section 8 | Wholesale broker sourced | Angel Oak | Visio (case-by-case) | Lenders with no-Section-8 policy |
| Co-living | Visio | Griffin | Acra | Dominion (residential, not co-living-specific) |
| BTR (construction) | Arbor | DOMINION | Lima One | Pure DSCR lenders (need construction product) |
| BTR (permanent) | Insula | BFF | Lima One | Arbor (construction only) |
| Flip → DSCR | LendingOne (bridge) | DOMINION | Kiavi | n/a (transactional, not DSCR) |

---

## 8. Confidence & Verification Notes

This document is a synthesis of:

1. **Corpus files (Tier 1 — authoritative within this project):**
   - `domain_11/portfolio_lender_matrix.csv` — 24-lender matrix with state coverage, DSCR floor, FICO floor, LTV max, STR support, portfolio-level features. (Directly used for lender picks per archetype.)
   - `domain_13/dscr_borrower_personas.csv` — 7 personas with default risk score, retention, lender fit.
   - `domain_3/lender_easy_street_capital_profile.md`, `lender_insula_capital_profile.md`, etc. — individual lender product specs.
   - `godmode/12_T12_50state_str_regulation/T12_summary.md` — STR regulation 50-state matrix.
   - `sprints/Sprint_03.md` — lender footprint, entity requirements, Visio profile.
   - `extractions/Regulatory_Front_Watch_20260620.md`, `extractions/Thread_K_Insula_Sales_Call_Prep_2026Q2.md` — Insula specifics.

2. **Live web verification (Tier 2 — primary sources):**
   - **HonestCasa "DSCR Loan House Hacking" (May 25 2026, updated Jun 4 2026)** — definitive primary source for the house-hack-NOT-DSCR pattern. Retrieved 2026-06-22.
   - **Mothebroker "DSCR Loans for Section 8 Rentals" Mar 2026** — Mo Abdel NMLS #1426884. Definitive primary source for Section 8 DSCR lender dispersion (50-55% acceptance).
   - **Insula Capital Group PR Web press release Jun 11 2026** — definitive primary source for portfolio-DSCR launch.
   - **Park Place Finance "Complete Guide to BTR Financing"** — BTR + DSCR.
   - **Arbor Realty Trust $32.1M BTR case study** — BTR construction financing.
   - **Pinnacle Funding Network BTR guide 2026** — BTR construction → permanent DSCR.
   - **AirDNA STR financing guide** — STR + DSCR.
   - **Truss Financial Group MTR guide** — MTR + DSCR.
   - **BiggerPockets BRRRR forum** (topics 1278549, 1274480, 1229240, 1241575) — strategy consensus.

3. **Inferences (Tier 3 — synthesized from 1 + 2):**
   - Typical DSCR ratio per archetype (industry range, no single primary source)
   - Ad targeting hook copy (inferred from lender tone + BiggerPockets forum language; not A/B tested)
   - Top 3 lender picks per archetype (synthesized from matrix; some archetypes have >3 strong fits)

### Unverified / needs primary source

- Specific DSCR ratio floor per archetype (varies by lender; no industry-aggregated source)
- Ad targeting hook conversion rates (inferred; not measured)
- Section 8 lender dispersion percentages (Mothebroker Mar 2026 is one broker's experience; 50+ Wholesale Lenders sample, not industry-wide)
- MTR underwriting classification (some lenders treat as STR, some as LTR; not standardized)

---

## 9. Related Corpus References

- `_research/domains/domain_3/RESEARCH_DOMAIN_3_LENDER_PROFILES.md` — all 24 lender deep profiles
- `_research/domains/domain_11/RESEARCH_DOMAIN_11_PORTFOLIO_DSCR.md` — portfolio lender matrix narrative
- `_research/domains/domain_13/RESEARCH_DOMAIN_13_BORROWER_DEMOGRAPHICS.md` — borrower personas narrative
- `_research/domains/domain_6/RESEARCH_DOMAIN_6_STR_DATA.md` — STR data, default rates, saturation
- `_research/godmode/12_T12_50state_str_regulation/T12_summary.md` — 50-state STR matrix
- `_research/godmode/13_T13_50state_usury_caps/T13_summary.md` — state usury caps (MN, PA, OH, NJ, WA covered)
- `_research/extractions/Regulatory_Front_Watch_20260620.md` — recent regulatory developments
- `_research/extractions/Thread_K_Insula_Sales_Call_Prep_2026Q2.md` — Insula specifics
- `_research/extractions/Thread_J_v056_Ship_Spec_2026Q2.md` — DSCR engine spec context

---

**End of SA8 — REI Archetypes × DSCR Fit Matrix. Confidence 4/5. Compiled 2026-06-22 by DSCR Verifier.**
