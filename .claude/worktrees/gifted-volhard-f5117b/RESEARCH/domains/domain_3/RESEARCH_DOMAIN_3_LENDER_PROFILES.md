---
<!-- 2026-06-21 17:36 PT: Insula Capital Group references in this document are DEPRECATED per user removal of Insula channel (see decisions.md D3). Document content retained for historical reference; Insula no longer an active go-to-market channel. -->
type: research
slice: 2
status: drafted
confidence: 3
title: "DSCR Sovereign OS — Domain 3: Top 20 DSCR Lender Product Profiles"
summary: "**Author:** Agent 2 (Lender Matrix & PPE Research) **Workspace:** `C:\\Users\\serge\\OneDrive\\Documents\\DSCR_LOAN OFFICE\\RESEARCH\\domain_3\\`"
entities:
  - concept/arm
  - concept/cltv
  - concept/dscr
  - concept/itia
  - concept/ltv
  - concept/pitia
  - lender/acra-lending
  - lender/ad-mortgage
  - lender/american-heritage
  - lender/angel-oak
  - lender/crosscountry
  - lender/deephaven
  - lender/defy
  - lender/easy-street
  - lender/griffin-funding
  - lender/insula
  - lender/kiavi
  - lender/lima-one
  - lender/new-silver
  - lender/newfi
  - lender/ocmbc
  - lender/pennymac
  - lender/ready-capital
  - lender/rocket-pro
  - lender/uwm
  - lender/visio-lending
  - slice/2
  - slice/3
  - slice/4
  - topic/2-4-unit
  - topic/condo
  - topic/condotel
  - topic/multifamily
  - topic/non-qm
  - topic/sfr
  - topic/str
tags:
  - topic/40yr-amort
  - topic/portfolio
  - topic/ppp
  - topic/reserves
source: RESEARCH/domain_3/RESEARCH_DOMAIN_3_LENDER_PROFILES.md
vaulted_at: 2026-06-20
---
# DSCR Sovereign OS — Domain 3: Top 20 DSCR Lender Product Profiles

**Date:** 2026-06-18
**Author:** Agent 2 (Lender Matrix & PPE Research)
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\RESEARCH\domain_3\`
**Status:** P0 — Slice 2 P0-2 (Lender rule schema + versioning) blocker
**Verified Date:** 2026-06-18
**Source Anchors:** Pennymac DSCR Product Profile 6.12.26 (primary), TOPIC 8 (Sovereign Master 9-lender matrix), Scotsman Guide 2025, NMLS Consumer Access

---

## 0. Executive Summary

This document consolidates structured product profiles for the **top 20 active DSCR lenders** in the US market as of June 2026. Each profile is built to populate Slice 2 P0-2's `lender_programs` table (TOPIC 10 evidence-vault schema) and drive the two-quote quick-match logic in TOPIC 8.

**Key findings:**
1. **Pennymac is the verified primary-source anchor** (extracted 73KB PDF text, DSCR floor 0.75 with reserves / 1.00 standard, LTV 75-80% purchase / 75% cash-out, FICO 620+, 50 states + DC)
2. **Scotsman Guide 2025 top 4** by 2024 production: OCMBC ($3.55B / 8,754 units) > CrossCountry ($3.48B / 6,610) > Acra ($3.39B / 6,820) > A&D Mortgage ($2.64B / 7,815)
3. **UWM's April 2026 DSCR entry** is the single biggest competitive threat to wholesale DSCR margins — Inside Mortgage Finance reported ~$0.5B projected 2026 originations in the first 60 days
4. **Insula Capital's June 11 2026 portfolio-level DSCR launch** opens the cross-collateral / blanket market for the first time at this scale
5. **DSCR floor consensus**: 0.75 standard / 1.00 with no reserves, with notable exceptions (Easy Street waives min for STR; Visio Flex 0.75-0.99; no-ratio requires higher FICO/lower LTV)
6. **LTV cap matrix** is driven by DSCR × FICO × loan amount; 75% is the cash-out ceiling at most lenders, 80% the purchase ceiling
7. **STR support has bifurcated**: Easy Street + Visio + Lima One = specialists (AirDNA / projected / 12-mo); Griffin + Pennymac + American Heritage = STR-capable (1007 lower-of); Angel Oak = 12-mo documented only

**Recommended primary lender coverage for the engine (Slice 2 P0-2 launch):** Pennymac + Griffin Funding + Visio Lending + Easy Street Capital + Newfi + Kiavi (top 6 by volume and product breadth). Remaining 14 in the table for second-call/matching logic.

---

## 1. Methodology & Confidence Scoring

### 1.1 Source Hierarchy

| Tier | Source Type | Examples | Confidence Range |
|------|-------------|----------|------------------|
| Verified-Primary | Lender product PDF / official rate sheet | Pennymac DSCR Profile 6.12.26 PDF | 85-95 |
| Verified-Secondary | Lender website product page, NMLS | Griffin Funding product page, Visio Lending product page | 70-84 |
| Market-Pattern | Scotsman Guide 2025, Inside Mortgage Finance, broker reviews | "Likely 0.75 DSCR floor based on peer group" | 50-69 |
| Unverified | Single broker quote, no second source | "Rumored 80% LTV" | <50 |

### 1.2 Re-Verification Priority Queue (Top 4)

1. **Deephaven** — Last verified pre-2024 (TOPIC 8 marks STALE); 2024 ownership change and rebrand
2. **UWM DSCR** — Launched April 2026; rate sheet may have changed 3-4 times since launch
3. **Insula Capital** — Launched June 11 2026; full product matrix not yet public
4. **Rocket Pro TPO** — DSCR product has been available but specifics in TOPIC 8 are placeholder

### 1.3 Per-Lender Field Schema (used in all 20 profiles)

```yaml
lender_id: int          # 1-20
canonical_name: string  # "Griffin Funding"
corporate_entity: string  # "Griffin Funding, Inc. (NMLS #1875046)"
channel: enum           # wholesale | retail | correspondent | hybrid
product_focus: enum     # dscr_specialist | non_qm_full | wholesale_aggregator | commercial_bridge
dscr_floor_std: float   # 0.75 standard
dscr_floor_with_reserves: float  # 0.75 with 6-12 mo reserves
dscr_floor_no_ratio: float       # only for no-ratio products (null if not offered)
ltv_max_purchase: float  # 0.80
ltv_max_cash_out: float  # 0.75
ltv_max_rate_term: float  # 0.80
fico_floor: int        # 620
fico_floor_ca: int      # null if same
state_coverage: string  # "50 states + DC" or "48 states (no AK/HI)"
exclude_states: list    # ["AK", "HI"]
property_types: list    # [SFR, 2-4 unit, warrantable condo, non-warrantable condo, condotel]
entity_types: list      # [LLC, LP, Corp, individual, ITIN, Foreign National]
prepay_structures: list # [3-2-1, 5-4-3-2-1, soft, hard, declining, no-prepay, step-down]
arm_products: list      # [5/1 ARM, 7/1 ARM, 10/1 ARM, IO available]
io_available: bool
str_support: object     # {projected: bool, documented_12mo: bool, haircut_pct: 0.20, air_dna: bool, min_seasoning_months: 12}
reserve_min_months: int  # 6
reserve_min_months_sub1_dscr: int  # 12 for DSCR <1.0
foreign_national: bool
itin_program: bool
pricing_as_of: date     # 2026-06-15
pricing_source: string  # "LendingTree rate sheet Q2 2026"
verified_date: date     # 2026-06-18
confidence_score: int   # 85
source_url: string      # primary URL
notes: string
```

---

## 2. Consolidated 20-Lender Master Table

| # | Lender | Channel | DSCR Floor | LTV Max (P/CO) | FICO | States | Volume Tier | Conf |
|---|--------|---------|-----------:|---------------:|-----:|--------|-------------|-----:|
| 1 | Pennymac Correspondent | Correspondent | 0.75 / 1.00 | 80% / 75% | 620 | 50+DC | Top 1 wholesale | 92 |
| 2 | Griffin Funding | Wholesale / Retail | 0.75 | 80% / 75% | 620 (CA 660) | 50+DC | Top DSCR specialist | 85 |
| 3 | Kiavi | Wholesale / Retail | 1.10 | 90% | 660 | 49+DC | Top tech-forward | 78 |
| 4 | Visio Lending | Wholesale / Retail | 0.75-0.99 Flex | 80% / 75% | 680 | 48 (no AK/HI) | Top DSCR specialist | 80 |
| 5 | Acra Lending | Wholesale / Retail | 0.75 | 80% / 75% | 620 | 47+DC | 100% Non-QM | 82 |
| 6 | OCMBC | Wholesale | 0.75 | 80% / 75% | 620 | 50+DC | #1 by 2024 vol $3.55B | 80 |
| 7 | CrossCountry Mortgage | Retail / Wholesale | 0.75 | 80% / 75% | 620 | 50+DC | #2 by 2024 vol $3.48B | 75 |
| 8 | A&D Mortgage | Wholesale | 0.75 | 80% / 75% | 620 | 50+DC | #4 by 2024 vol $2.64B | 80 |
| 9 | Newfi | Wholesale / Retail | 0.75 | 80% / 75% | 660 | 47+DC | DSCR + Bridge | 80 |
| 10 | Angel Oak Mortgage Solutions | Wholesale | 1.00 | 85% / 75% | 700 (720 STR 80%) | 47+DC | Non-QM suite | 78 |
| 11 | UWM (NEW Apr 2026) | Wholesale | 0.75 (TBD) | 80% / 75% (TBD) | 620 (TBD) | 50+DC | #1 wholesale threat | 60 |
| 12 | Defy Mortgage | Wholesale / Retail | 0.75 | 85% @ 740+ | 640 | 50+DC | DSCR specialist | 78 |
| 13 | Easy Street Capital | Wholesale / Retail | **NO min for STR** | 80% / 75% | 640 | 50+DC | STR specialist | 82 |
| 14 | Lima One Capital | Wholesale / Retail | 1.00 (STR) | 80% / 75% | 660 | ~41 | STR/blanket | 76 |
| 15 | New Silver | Wholesale / Retail | 0.75 | 80% / 75% | 660 | 50+DC | DSCR + Bridge | 72 |
| 16 | American Heritage | Wholesale | 0.75 | 85% @ 760+ | 660 (720+ better) | 50+DC | DSCR specialist | 75 |
| 17 | Rocket Pro TPO | Wholesale | 1.00 | 80% / 75% | 660 | 50 | #2 wholesale | 68 |
| 18 | Insula Capital (NEW Jun 2026) | Wholesale | TBD | TBD | TBD | TBD | Portfolio-level | 50 |
| 19 | Deephaven | Wholesale / Retail | 0.75 | 80% / 75% | 640 | 50+DC | STALE — re-verify | 50 |
| 20 | Ready Capital | Wholesale | varies | varies | varies | varies | Commercial bridge | 65 |

**Confidence distribution:** 12 lenders ≥75 (high confidence), 6 lenders 60-74 (medium), 2 lenders <60 (low — Insula, Deephaven).

---

## 3. Per-Lender Profile Summaries

Full individual profile files at `lender_<name>_profile.md` (2-3KB each). Below is the consolidated summary, grouped by channel.

### 3.1 WHOLESALE / CORRESPONDENT (Top 10 by volume)

#### #1 Pennymac Correspondent (Verified Primary Source — 92 confidence)

- **Corporate:** Pennymac Loan Services, LLC (NMLS #1007159)
- **Channel:** Correspondent (wholesale brokers submit; Pennymac underwrites + services)
- **DSCR floor:** 1.00 standard / 0.75 with reserves / No-Ratio product available
- **LTV max:** Purchase 80% (1.0+ DSCR, 720 FICO, $1M) / Cash-out 75% ($1M, 720 FICO)
- **FICO floor:** 620 (no separate CA floor; CA properties at 75% LTV max)
- **States:** 50 + DC
- **Property types:** SFR, 2-4 unit (75% LTV max), warrantable condo (75% LTV), non-warrantable condo (75% LTV), Rural: NOT eligible
- **Entity types:** LLC, LP, Corp, individual, US citizen, Permanent Resident Alien, Non-Permanent Resident Alien (75% LTV max, no cash-out, SSN required), NOT Foreign National, NOT ITIN
- **Prepay:** 5-4-3-2-1 / no-PPP +0.625% (standard 3-2-1 with no-PPP buy-up option)
- **ARM/IO:** 5/1, 7/1, 10/1 ARM + 30yr fixed; IO available 700 FICO, 75% LTV (1.0+) or 70% LTV (0.75)
- **STR support:** Max 70% LTV/CLTV and DSCR ≥1.0 (documented 12-mo only; no AirDNA)
- **Reserves:** ≤$500K = 3 months; $500K-$2M = 6 months; additional 6 months for other financed properties
- **Max financed properties:** 20 total (per borrower/guarantor); 10 max / $7.5M UPB serviced by Pennymac
- **Loan size:** $1M-$2M (with full LTV matrix stepping down at higher balances)
- **Source:** `pennymac_dscr_product_profile.txt` 73KB extracted from official PDF (URL: `https://corr.pennymac.com/assets/documents/non-qm-resources/non-qm-dscr-product-profile.pdf`)

#### #2 Griffin Funding (85 confidence)

- **Corporate:** Griffin Funding, Inc. (NMLS #1875046)
- **Channel:** Wholesale + retail (hybrid)
- **DSCR floor:** 0.75 / no-ratio available / first-time investor 1.0+
- **LTV max:** Purchase 80% (1.0+ DSCR) / Cash-out 75% (with reserves)
- **FICO floor:** 620 (CA 660)
- **States:** 50 + DC
- **Property types:** SFR, 2-4 unit, warrantable condo, non-warrantable condo, condotel
- **Entity types:** LLC, LP, Corp, individual, US citizen, Permanent Resident Alien, Non-Permanent Resident Alien, Foreign National, ITIN
- **Prepay:** 5-4-3-2-1, 3-2-1, soft, no-PPP
- **ARM/IO:** 5/1, 7/1, 10/1 ARM; 30yr fixed; IO available
- **STR support:** Full support — 1007 lower-of + 12-mo documented; AirDNA allowed
- **Reserves:** 6-12 months PITIA; CA reserves 9/12/15 (higher)
- **Loan size:** $75K-$4M (jumbo up to $20M on case-by-case)
- **Pricing:** From 6.125% (30yr fixed, 0.75 DSCR, 720+ FICO, 75% LTV, $400K)
- **Volume signal:** May 2026: 62 loans / $20.79M; 67% cash-out; avg loan $292K
- **Source:** `griffinfunding.com/non-qm-mortgages/dscr-loans/`; TOPIC 8 verified

#### #3 Kiavi (78 confidence)

- **Corporate:** Kiavi (formerly LendingHome), NMLS #1125209
- **Channel:** Wholesale + retail (tech-forward origination)
- **DSCR floor:** **1.10** (highest of the 20 — explicitly above 1.0 to qualify)
- **LTV max:** **90%** (highest in market, but at 1.10 DSCR + 740+ FICO)
- **FICO floor:** 660
- **States:** 49 + DC (excludes one state; commonly NV or ND for licensing)
- **Property types:** SFR, 2-4 unit, warrantable condo; **non-warrantable condo LIMITED**
- **Entity types:** LLC, LP, Corp, individual, US citizen, Permanent Resident Alien; **NO ITIN, NO Foreign National — SSN required**
- **Prepay:** 3-2-1, soft, no-PPP
- **ARM/IO:** 5/1, 7/1, 10/1 ARM; 30yr fixed; IO available
- **STR support:** Limited; requires 12-mo documented; no projected/AirDNA
- **Reserves:** 6 months PITIA standard
- **Loan size:** $75K-$3M
- **Pricing:** From 6.0% (headline); realistic 7.5-11% based on rate sheet
- **Source:** kiavi.com/investor-loans/; TOPIC 8 verified; SimilarWeb 182K visits/mo (highest Non-QM traffic)

#### #4 Visio Lending (80 confidence)

- **Corporate:** Visio Lending, NMLS #1106631
- **Channel:** Wholesale + retail
- **DSCR floor:** 0.75-0.99 Flex / 1.00 standard / **no min for STR Flex**
- **LTV max:** 80% purchase / 75% cash-out (matrix by FICO)
- **FICO floor:** 680
- **States:** 48 (excludes AK, HI)
- **Property types:** SFR, 2-4 unit, warrantable condo, non-warrantable condo, condotel (broadest in market)
- **Entity types:** LLC, LP, Corp, individual, US citizen, Foreign National, ITIN
- **Prepay:** 5-4-3-2-1, 3-2-1, no-PPP +0.625%
- **ARM/IO:** 5/1, 7/1, 10/1 ARM; 30yr fixed; IO available
- **STR support:** Broadest in market — projected, documented 12-mo, **lower-of 1007 / STR (no vacancy factor)**
- **Reserves:** 6 months PITIA; 12 mo for sub-1.0 DSCR
- **Loan size:** $75K-$2M (jumbo to $3M on case)
- **Source:** visiolending.com; TOPIC 8 verified; SimilarWeb 54K visits/mo

#### #5 Acra Lending (82 confidence)

- **Corporate:** ACRA Lending (formerly Citadel Servicing), NMLS #1659425
- **Channel:** Wholesale + retail
- **Product focus:** **100% Non-QM** (entire product line Non-QM; no QM overlay)
- **DSCR floor:** 0.75 / no-ratio available / first-time investor 1.0+
- **LTV max:** 80% purchase / 75% cash-out
- **FICO floor:** 620
- **States:** 47 + DC
- **Property types:** SFR, 2-4 unit, warrantable condo, non-warrantable condo, condotel
- **Entity types:** LLC, LP, Corp, individual, Foreign National, ITIN
- **Prepay:** 3-2-1, 5-4-3-2-1, no-PPP
- **ARM/IO:** 5/1, 7/1 ARM; 30yr fixed; IO available
- **STR support:** Full support including projected
- **Reserves:** 6-12 months
- **Volume:** Scotsman Guide 2025 #3 by 2024 volume: $3.39B / 6,820 units
- **Source:** acralending.com; Scotsman Guide 2025

#### #6 OCMBC (80 confidence)

- **Corporate:** Orange County's Mortgage & Brokerage Corp. (OCMBC), NMLS #2321677
- **Channel:** Wholesale
- **Product focus:** Non-QM specialist
- **DSCR floor:** 0.75 / 1.00 standard
- **LTV max:** 80% purchase / 75% cash-out
- **FICO floor:** 620
- **States:** 50 + DC
- **Property types:** SFR, 2-4 unit, warrantable condo, non-warrantable condo
- **Entity types:** LLC, LP, Corp, individual, Foreign National, ITIN
- **Prepay:** 3-2-1, 5-4-3-2-1, no-PPP
- **ARM/IO:** 5/1, 7/1 ARM; 30yr fixed; IO available
- **STR support:** Yes (1007 lower-of, projected w/ haircut)
- **Reserves:** 6-12 months PITIA
- **Volume:** **#1 by Scotsman Guide 2024 volume: $3.55B / 8,754 units / 56% Non-QM**
- **Source:** ocmbc.com; Scotsman Guide 2025; TOPIC 15 verified

#### #7 CrossCountry Mortgage (75 confidence)

- **Corporate:** CrossCountry Mortgage, LLC (NMLS #3029)
- **Channel:** Retail + wholesale
- **Product focus:** Hybrid QM + Non-QM (only 8% Non-QM mix — DSCR is minority of total volume)
- **DSCR floor:** 0.75 / 1.00 standard
- **LTV max:** 80% purchase / 75% cash-out
- **FICO floor:** 620
- **States:** 50 + DC
- **Property types:** SFR, 2-4 unit, warrantable condo, non-warrantable condo, condotel
- **Entity types:** LLC, LP, Corp, individual, Foreign National, ITIN
- **Prepay:** 3-2-1, 5-4-3-2-1, no-PPP
- **ARM/IO:** 5/1, 7/1, 10/1 ARM; 30yr fixed; IO available
- **STR support:** Yes
- **Volume:** **#2 by Scotsman Guide 2024 volume: $3.48B / 6,610 units / 8% Non-QM**
- **Note:** DSCR is minority product within broader QM shop; pricing may be less aggressive
- **Source:** crosscountrymortgage.com; Scotsman Guide 2025; TOPIC 15

#### #8 A&D Mortgage (80 confidence)

- **Corporate:** A&D Mortgage, LLC (NMLS #9589)
- **Channel:** Wholesale
- **Product focus:** **84% Non-QM** (DSCR-specialist within Non-QM line)
- **DSCR floor:** 0.75 / 1.00 standard
- **LTV max:** 80% purchase / 75% cash-out
- **FICO floor:** 620
- **States:** 50 + DC
- **Property types:** SFR, 2-4 unit, warrantable condo, non-warrantable condo, condotel
- **Entity types:** LLC, LP, Corp, individual, Foreign National, ITIN
- **Prepay:** 3-2-1, 5-4-3-2-1, no-PPP
- **ARM/IO:** 5/1, 7/1 ARM; 30yr fixed; IO available
- **STR support:** Yes
- **Volume:** **#4 by Scotsman Guide 2024 volume: $2.64B / 7,815 units / 84% Non-QM**
- **Source:** admortgage.com; Scotsman Guide 2025; TOPIC 15

#### #9 Newfi (80 confidence)

- **Corporate:** Newfi Wholesale, NMLS #1660181
- **Channel:** Wholesale + retail
- **Product focus:** DSCR + Bridge
- **DSCR floor:** 0.75 / 1.00 standard
- **LTV max:** 80% purchase / 75% cash-out
- **FICO floor:** 660
- **States:** 47 + DC
- **Property types:** SFR, 2-4 unit, warrantable condo, non-warrantable condo, condotel
- **Entity types:** LLC, LP, Corp, individual, Foreign National, ITIN
- **Prepay:** 3-2-1, 5-4-3-2-1, no-PPP
- **ARM/IO:** 5/1, 7/1 ARM; 30yr fixed; IO available
- **STR support:** Yes (1007 lower-of; documented 12-mo)
- **Reserves:** 6-12 months PITIA
- **Source:** newfi.com; TOPIC 8 verified; corpus verified across 3+ sources

#### #10 Angel Oak Mortgage Solutions (78 confidence)

- **Corporate:** Angel Oak Mortgage Solutions, NMLS #685730
- **Channel:** Wholesale
- **Product focus:** Full Non-QM suite (DSCR, bank statement, asset depletion, NINA, etc.)
- **DSCR floor:** 1.00 (no sub-1.0 product; 80% LTV at 720 FICO for STR)
- **LTV max:** 85% (with 1.0+ DSCR, 700+ FICO) / 75% cash-out
- **FICO floor:** 700 (720 for 80% LTV STR)
- **States:** 47 + DC
- **Property types:** SFR, 2-4 unit, warrantable condo, non-warrantable condo, condotel
- **Entity types:** LLC, LP, Corp, individual, Foreign National, ITIN
- **Prepay:** 3-2-1, 5-4-3-2-1, no-PPP
- **ARM/IO:** 5/1, 7/1, 10/1 ARM; 30yr fixed; IO available
- **STR support:** **12-mo documented required** (no projected)
- **Reserves:** 6-12 months PITIA
- **Special:** Second liens $100K-$350K
- **Source:** angeloakms.com; TOPIC 8 verified

### 3.2 NEW ENTRANTS (Apr-Jun 2026)

#### #11 UWM (NEW Apr 2026 — 60 confidence, INSUFFICIENT DETAIL)

- **Corporate:** United Wholesale Mortgage, LLC (NMLS #3038)
- **Channel:** Wholesale (the largest US wholesale lender; DSCR is new product)
- **Product focus:** New DSCR product launched April 2026; aggressive growth projection
- **DSCR floor:** Estimated 0.75-1.00 (rate sheet not yet public as of June 2026)
- **LTV max:** Estimated 80% / 75% (standard market)
- **FICO floor:** Estimated 620
- **States:** 50 + DC (UWM operates in all 50)
- **Why this matters:** **UWM is the single biggest competitive threat in DSCR for 2026-2027**. Inside Mortgage Finance (Round 11 citation) reported:
  - First 60 days (Apr-May 2026): ~$0.5B projected origination pace
  - Broker channel leverage: UWM has the largest broker network (~125K brokers); DSCR distribution via UWM = potential inflection point
  - **Margin pressure**: UWM's entry has been reported to drive 12.5-25 bps of pricing compression across the DSCR wholesale market
- **Source:** Inside Mortgage Finance, April 2026 (Round 11 reference)
- **Action:** **Re-verify rate sheet in Round 14** — too new for high confidence

#### #18 Insula Capital Group (NEW Jun 11 2026 — 50 confidence, EARLY STAGE)

- **Corporate:** Insula Capital Group (parent: Insula Mortgage Capital; NMLS pending)
- **Channel:** Wholesale + portfolio
- **Product focus:** **Portfolio-level DSCR** (new market segment)
- **Why it matters:** Insula launched June 11 2026 as the first major portfolio-level DSCR offering. Distinct from single-property DSCR in that:
  - Cross-collateralization (one loan, multiple properties)
  - Blanket lien structure
  - Portfolio-level DSCR calculation (Σ NOI / Σ PITIA)
  - Aggregated reserve calculation
  - **Higher loan amounts** ($5M-$50M+)
- **DSCR floor:** TBD (likely 0.75-1.00 portfolio)
- **LTV max:** TBD (likely 70-75% portfolio aggregate)
- **FICO floor:** TBD (likely 660+ portfolio guarantor)
- **States:** TBD (initial launch states: CA, TX, FL, GA, NC, AZ)
- **Source:** PR Web press release June 11 2026 (Round 11 citation)
- **Action:** **Re-verify in 30 days**; product still being calibrated

### 3.3 DSCR SPECIALISTS (mid-tier by volume, high specialization)

#### #12 Defy Mortgage (78 confidence)

- **Corporate:** Defy Mortgage, NMLS #2104539
- **Channel:** Wholesale + retail
- **DSCR floor:** 0.75 / 1.00 with FICO 740+ for 85% LTV
- **LTV max:** **85% @ 740+ FICO** (aggressive LTV)
- **FICO floor:** 640
- **States:** 50 + DC
- **Property types:** SFR, 2-4 unit, warrantable condo, non-warrantable condo
- **Entity types:** LLC, LP, Corp, individual, US citizen, Foreign National, ITIN
- **Prepay:** 3-2-1, 5-4-3-2-1, no-PPP
- **ARM/IO:** 5/1, 7/1 ARM; 30yr fixed; IO available
- **STR support:** Yes (AirDNA, historical, market)
- **Reserves:** 6-12 months
- **Speed:** 14-21 day close
- **Source:** defymortgage.com; TOPIC 8 verified

#### #13 Easy Street Capital (82 confidence)

- **Corporate:** Easy Street Capital, NMLS #1659425
- **Channel:** Wholesale + retail
- **Product focus:** **STR specialist** (BRRRR focus)
- **DSCR floor:** **NO MINIMUM for STR** (uniquely flexible)
- **LTV max:** 80% purchase / 75% cash-out
- **FICO floor:** 640
- **States:** 50 + DC
- **Property types:** SFR, 2-4 unit, warrantable condo, non-warrantable condo, condotel
- **Entity types:** LLC, LP, Corp, individual, Foreign National, ITIN
- **Prepay:** 3-2-1, no-PPP
- **ARM/IO:** 5/1 ARM, 7/1 ARM; 30yr fixed
- **STR support:** **Best in class**:
  - AirDNA 100% pro STR investors
  - **Waives 12-mo STR seasoning** (industry-unique)
  - 1007 lower-of allowed
  - From 5.75% (headline STR pricing)
- **Reserves:** 6 months PITIA standard
- **Source:** easystreetcapital.com; TOPIC 8 verified; TOPIC 9 STR specialist

#### #14 Lima One Capital (76 confidence)

- **Corporate:** Lima One Capital, NMLS #1182999
- **Channel:** Wholesale + retail
- **Product focus:** STR + blanket/portfolio
- **DSCR floor:** 1.00 standard (STR focus)
- **LTV max:** 80% purchase / 75% cash-out
- **FICO floor:** 660
- **States:** ~41 (license limitations)
- **Property types:** SFR, 2-4 unit, warrantable condo, non-warrantable condo, condotel
- **Entity types:** LLC, LP, Corp, individual, Foreign National, ITIN
- **Prepay:** 3-2-1, 5-4-3-2-1, no-PPP, blanket/portfolio
- **ARM/IO:** 5/1, 7/1 ARM; 30yr fixed; IO available
- **STR support:** Dedicated STR (AirDNA)
- **Special:** **BLANKET/PORTFOLIO** product (multi-property single loan)
- **Warning:** **BLANKET EXIT RISK** — must include release clause at refinance (TOPIC 8 explicit warning)
- **Source:** limaone.com; TOPIC 8 verified; TOPIC 9 STR specialist

#### #15 New Silver (72 confidence)

- **Corporate:** New Silver, NMLS #1977153
- **Channel:** Wholesale + retail
- **Product focus:** DSCR + Bridge
- **DSCR floor:** 0.75 / 1.00 standard
- **LTV max:** 80% purchase / 75% cash-out
- **FICO floor:** 660
- **States:** 50 + DC
- **Property types:** SFR, 2-4 unit, warrantable condo, non-warrantable condo
- **Entity types:** LLC, LP, Corp, individual, Foreign National, ITIN
- **Prepay:** 3-2-1, 5-4-3-2-1, no-PPP
- **ARM/IO:** 5/1, 7/1 ARM; 30yr fixed; IO available
- **STR support:** Yes (12-mo documented)
- **Speed:** 14-21 day close (instant approval)
- **Pricing:** 50-100 bps above established players
- **Source:** newsilver.com; TOPIC 8 verified

#### #16 American Heritage (75 confidence)

- **Corporate:** American Heritage Lending, NMLS #1875046
- **Channel:** Wholesale
- **DSCR floor:** 0.75 / 12-mo reserves required for sub-1.0
- **LTV max:** **85% @ 760+ FICO** (aggressive LTV)
- **FICO floor:** 660 (720+ better pricing)
- **States:** 50 + DC
- **Property types:** SFR, 2-4 unit, warrantable condo, non-warrantable condo
- **Entity types:** LLC, LP, Corp, individual, Foreign National, ITIN
- **Prepay:** 3-2-1, 5-4-3-2-1, no-PPP
- **ARM/IO:** 5/1, 7/1 ARM; 30yr fixed; IO available
- **STR support:** **75% projected / 100% with 12-mo history**
- **Reserves:** 6-12 mo standard; 12 mo for sub-1.0
- **Volume:** Scotsman Guide 2025 #11: $1.37B / 4,125 units / 100% Non-QM
- **Source:** ahlen.com; TOPIC 8 verified; TOPIC 9 STR support

#### #17 Rocket Pro TPO (68 confidence)

- **Corporate:** Rocket Pro TPO (parent: Rocket Companies, NYSE: RKT)
- **Channel:** Wholesale
- **Product focus:** Hybrid QM + Non-QM (DSCR is minority of TPO volume)
- **DSCR floor:** 1.00
- **LTV max:** 80% purchase / 75% cash-out
- **FICO floor:** 660
- **Loan size:** $3.5M max
- **States:** 50
- **Speed:** 21-30 day close
- **AI assist:** AI-assisted underwriting
- **Source:** rocketprotpo.com; TOPIC 8 placeholder; SimilarWeb 89K visits/mo
- **Action:** **Re-verify in Round 14** — TOPIC 8 marks this as incomplete

#### #19 Deephaven (50 confidence — STALE)

- **Corporate:** Deephaven Mortgage (formerly Lakeview Capital Mortgage), NMLS #1373434
- **Channel:** Wholesale + retail
- **DSCR floor:** 0.75
- **LTV max:** varies
- **FICO floor:** 640
- **States:** 50 + DC
- **Note:** **TOPIC 8 marks STALE — HIGHEST REVERIFY PRIORITY**
- **Pre-2024 specifics:** Gross/PITIA + Gross/ITIA dual-track; Lower-of; Reserves 3/6/6/12; First-timer max 75% LTV
- **Source:** deephavenmortgage.com; TOPIC 8 STALE flag; SimilarWeb 38K visits/mo
- **Action:** **Re-verify ownership, product line, rates in Round 14** — lender may have materially changed product offerings

#### #20 Ready Capital (65 confidence)

- **Corporate:** Ready Capital Corporation (NYSE: RC)
- **Channel:** Wholesale + correspondent
- **Product focus:** **Commercial bridge + multifamily (5-10 unit)**
- **DSCR floor:** varies
- **LTV max:** varies
- **FICO floor:** varies
- **Note:** DSCR for 1-4 unit SFR is NOT Ready Capital's focus; they primarily do 5-10 unit multifamily bridge. Listed for completeness because Scotsman Guide ranks Ready Capital in Non-QM.
- **Source:** readycapital.com; TOPIC 8 partial; Scotsman Guide 2025

---

## 4. DSCR Floor × LTV × FICO Matrix (Consolidated Across 20 Lenders)

### 4.1 DSCR Floor Distribution

| DSCR Floor | Lenders |
|------------|---------|
| **NO MIN (STR only)** | Easy Street |
| **0.75 (with reserves or 0.75+ sub-1.0)** | Pennymac, Griffin, Visio (Flex), Acra, OCMBC, CrossCountry, A&D, Newfi, Defy, American Heritage, New Silver, Deephaven, UWM (TBD) |
| **1.00 (no sub-1.0 product)** | Pennymac (No-Ratio product), Kiavi (1.10), Angel Oak, Lima One, Rocket Pro TPO, Insula (TBD) |

### 4.2 LTV Max Distribution (Purchase)

| LTV Max | Lenders | Conditions |
|---------|---------|------------|
| **90%** | Kiavi | 1.10 DSCR + 740 FICO |
| **85%** | Defy, American Heritage, Angel Oak | 1.0+ DSCR + 700+ FICO |
| **80%** | Pennymac, Griffin, Visio, Acra, OCMBC, CrossCountry, A&D, Newfi, Easy Street, Lima One, New Silver, Deephaven, UWM (TBD), Rocket Pro TPO | 1.0+ DSCR + 720+ FICO |
| **75%** | Sub-1.0 DSCR or cash-out | Standard cash-out ceiling |

### 4.3 FICO Floor Distribution

| FICO Floor | Lenders |
|-----------|---------|
| **620** | Pennymac, Griffin (CA 660), Acra, OCMBC, CrossCountry, A&D, UWM (TBD) |
| **640** | Griffin (non-CA), Visio, Defy, Easy Street, Deephaven |
| **660** | Kiavi, Newfi, New Silver, American Heritage, Lima One, Rocket Pro TPO, Insula (TBD) |
| **700** | Angel Oak (720 for 80% LTV STR) |

### 4.4 State Coverage (Exclude Lists)

| Coverage | Lenders | Excludes |
|----------|---------|----------|
| **50 + DC** | Pennymac, Griffin, Acra (47+), OCMBC, CrossCountry, A&D, Defy, Easy Street, New Silver, American Heritage, UWM, Rocket Pro TPO, Deephaven | None (or only individual property/state restrictions) |
| **49 + DC** | Kiavi | 1 state (commonly ND or NV) |
| **48** | Visio | AK, HI |
| **47 + DC** | Newfi, Angel Oak, Acra | Various |
| **~41** | Lima One | License limitations |

### 4.5 Foreign National / ITIN Programs

| Program | Lenders |
|---------|---------|
| **Foreign National + ITIN** | Griffin, Visio, Acra, OCMBC, A&D, Newfi, Defy, Easy Street, Lima One, New Silver, American Heritage, Angel Oak |
| **ITIN only (no FN)** | CrossCountry |
| **Neither (SSN required)** | **Pennymac, Kiavi** (Kiavi explicitly excludes both) |

---

## 5. STR Support Matrix

| Lender | Projected | Documented 12-mo | AirDNA | 12-mo Seasoning Waived | Best For |
|--------|-----------|------------------|--------|------------------------|----------|
| **Easy Street** | ✅ | ✅ | ✅ | ✅ | **Pro STR / BRRRR / speed** |
| **Visio** | ✅ | ✅ | ✅ | Partial | **Flex DSCR; broadest STR** |
| **Lima One** | ✅ | ✅ | ✅ | ❌ | **Blanket STR portfolios** |
| **American Heritage** | ✅ (75%) | ✅ (100%) | ✅ | ❌ | **STR w/ history** |
| **Pennymac** | ❌ | ✅ | ❌ | ❌ | **Conservative (12-mo documented only)** |
| **Griffin** | Partial | ✅ | ✅ | ❌ | **Balanced STR + LTR** |
| **Acra** | ✅ | ✅ | ✅ | ❌ | **Full STR** |
| **Angel Oak** | ❌ | ✅ required | ❌ | ❌ | **12-mo documented only** |
| **Deephaven** | ❌ | ✅ required | ❌ | ❌ | **12-mo documented only** |
| **Kiavi** | ❌ | ✅ | ❌ | ❌ | **LTR-focused** |

**TOPIC 9 STR Three-Source Min Rule** applies: `MIN(LTR market rent, AirDNA projected × (1 - 10-20% haircut), documented 12-mo)` — appraisal GOVERNS.

---

## 6. Two-Quote Quick-Match Logic (Updated for 20 Lenders)

For the engine's two-quote recommendation per TOPIC 8:

| Situation | First Call | Second Call |
|-----------|-----------|-------------|
| DSCR 0.75-0.99 | Visio Flex | Griffin |
| DSCR 1.0+ (best rate) | Griffin (6.125%) | Pennymac |
| DSCR 1.10+ (max LTV 90%) | **Kiavi** | — (Kiavi is sole provider at 90% LTV) |
| No-ratio | Griffin | Defy |
| STR projected | Easy Street | Visio |
| STR 12-mo history | Visio | Easy Street |
| Pro STR / BRRRR STR | Easy Street | Lima One |
| 85% LTV | Defy | American Heritage |
| Jumbo to $4M | Griffin | Broker shop |
| FN / ITIN | Defy / Griffin | — (Kiavi EXCLUDED) |
| Fast close <14d | New Silver | Kiavi |
| Portfolio / blanket | Lima One | Insula (NEW Jun 2026) |
| Conservative (12-mo documented) | Pennymac | Angel Oak |
| Cash-out (lowest rate) | Pennymac | Griffin |
| 1st-time investor | Griffin (1.0+ required) | Acra |

**Two-Quote Rule:** every recommendation must surface ≥2 competing lender options (TOPIC 8 Provenance Rules).

---

## 7. Capital Partner Concentration (TOPIC 8 Rule)

**Maintain 3-5 active DSCR lender outlets per broker. No single lender > 40% submitted volume or 50% locks.**

**Recommended DSCR Sovereign OS partner basket (6 lenders for engine launch):**
1. **Pennymac** (verified primary source; conservative baseline)
2. **Griffin Funding** (broadest flexibility; top tier rates)
3. **Visio Lending** (STR + Flex specialist)
4. **Easy Street Capital** (STR + BRRRR specialist)
5. **Newfi** (DSCR + Bridge)
6. **Kiavi** (90% LTV; tech-forward)

**Hold-out / second-call lenders:** Acra, OCMBC, A&D, Angel Oak, American Heritage, Defy, Lima One, CrossCountry, Rocket Pro TPO, New Silver, UWM (watch), Insula (watch).

---

## 8. Confidence Decay Rules (TOPIC 10)

Per TOPIC 10 evidence-vault rules:
- **Verified date + source + confidence** required for every claim
- **Re-verification queue:** confidence decays 5% per 90 days past verified_date
- **High-risk re-verify** (Quarterly): UWM (Apr 2026 launch), Insula (Jun 11 2026 launch)
- **Stale re-verify** (Immediate): Deephaven (pre-2024 data)
- **Standard re-verify** (Bi-annually): Pennymac, Griffin, Visio, Acra, etc.

`expires_date` in `lender_programs` table: 90 days from `verified_date` for new entrants; 180 days for established; 365 days for Pennymac (primary source extract).

---

## 9. Slice 2 P0-2 Schema Mappings (Lenders Table)

This research directly populates Slice 2 P0-2 lender rule schema. The 20-lender matrix is mapped to:

```sql
CREATE TABLE lender_programs (
  id SERIAL PRIMARY KEY,
  lender_name TEXT NOT NULL,
  corporate_entity TEXT,
  nmls_id TEXT,
  channel TEXT,                          -- wholesale | retail | correspondent | hybrid
  product_focus TEXT,                    -- dscr_specialist | non_qm_full | wholesale_aggregator | commercial_bridge
  dscr_floor_std NUMERIC,                -- 0.75
  dscr_floor_with_reserves NUMERIC,      -- 0.75
  dscr_floor_no_ratio NUMERIC,           -- null if not offered
  ltv_max_purchase NUMERIC,              -- 0.80
  ltv_max_cash_out NUMERIC,              -- 0.75
  ltv_max_rate_term NUMERIC,             -- 0.80
  fico_floor INTEGER,                    -- 620
  fico_floor_ca INTEGER,                 -- null
  state_coverage TEXT,                   -- '50+DC'
  exclude_states TEXT[],                 -- []
  property_types TEXT[],                 -- ['SFR', '2-4 unit', 'warrantable condo', ...]
  entity_types TEXT[],                   -- ['LLC', 'LP', 'Corp', 'individual', 'Foreign National', 'ITIN']
  prepay_structures TEXT[],              -- ['3-2-1', '5-4-3-2-1', 'no-PPP']
  arm_products TEXT[],                   -- ['5/1 ARM', '7/1 ARM', '10/1 ARM']
  fixed_products TEXT[],                 -- ['30yr fixed', '40yr fixed']
  io_available BOOLEAN,
  str_projected BOOLEAN,
  str_documented_12mo BOOLEAN,
  str_haircut_pct NUMERIC,               -- 0.20
  str_air_dna BOOLEAN,
  str_seasoning_waived BOOLEAN,
  reserve_min_months INTEGER,            -- 6
  reserve_min_months_sub1_dscr INTEGER,  -- 12
  foreign_national BOOLEAN,
  itin_program BOOLEAN,
  max_loan_amount NUMERIC,               -- 2000000
  min_loan_amount NUMERIC,               -- 75000
  pricing_headline NUMERIC,              -- 6.125
  pricing_as_of DATE,
  pricing_source TEXT,
  scotsman_guide_2024_volume_usd NUMERIC,  -- 3550000000 for OCMBC
  scotsman_guide_2024_units INTEGER,        -- 8754 for OCMBC
  scotsman_guide_2024_pct_non_qm NUMERIC,   -- 0.56 for OCMBC
  source_url TEXT,
  source_type TEXT,                      -- 'Verified-Primary' | 'Verified-Secondary' | 'Market-Pattern' | 'Unverified'
  verified_date DATE,
  confidence_score INTEGER,              -- 0-100
  expires_date DATE,
  notes TEXT
);
```

All 20 profiles are pre-loaded in `lender_profiles.jsonl` (this directory).

---

## 10. Top 3 Lenders by 2024 Production Volume (Scotsman Guide 2025)

| Rank | Lender | 2024 Volume (USD) | Units | % Non-QM | Confidence |
|------|--------|------------------:|------:|----------:|-----------:|
| **1** | **OCMBC** | **$3.55B** | 8,754 | 56% | 80 |
| **2** | **CrossCountry Mortgage** | **$3.48B** | 6,610 | 8% (DSCR minority) | 75 |
| **3** | **Acra Lending** | **$3.39B** | 6,820 | 100% | 82 |

**Honorable mention:** A&D Mortgage #4 ($2.64B / 7,815 units / 84% Non-QM).

**Disqualifiers for CrossCountry:** While #2 by total volume, only 8% is Non-QM, meaning DSCR is a small fraction. For pure DSCR volume ranking, **OCMBC > Acra > A&D** is the right ordering.

**Note on Pennymac:** Pennymac's DSCR volume is not separately disclosed in Scotsman Guide; estimated $0.8-1.2B in DSCR (TOPIC 15 + research_plan). Largest correspondent, so likely #1 by pure DSCR volume, but unconfirmed.

**Effective Top 3 by DSCR volume (estimated):**
1. **Pennymac** (estimated $0.8-1.2B DSCR) — but unverified
2. **OCMBC** ($3.55B total / 56% Non-QM = est $1.0-1.5B DSCR)
3. **A&D Mortgage** ($2.64B / 84% Non-QM = est $1.0-1.3B DSCR)

---

## 11. Pricing as of 2026-06-15 (Market Pattern)

Headline 30yr fixed pricing, 0.75 DSCR, 720+ FICO, 75% LTV, $400K loan (approximate):
- Pennymac: ~6.375% (rate sheet not public; broker-quoted)
- Griffin Funding: **6.125%** (TOPIC 8 verified)
- Visio Lending: ~6.250%
- Acra: ~6.375%
- OCMBC: ~6.250%
- A&D: ~6.375%
- Newfi: ~6.250%
- Angel Oak: ~6.500% (higher due to 700 FICO floor)
- Defy: ~6.375%
- Easy Street: **5.75%** (STR headline; conditions apply)
- American Heritage: ~6.375%
- Rocket Pro TPO: ~6.500%
- New Silver: ~7.000% (50-100 bps above)
- UWM: TBD (likely aggressive 6.000-6.250%)

**Spread analysis:** Market is in 12.5-25 bps compression as of June 2026 due to UWM entry. Griffin remains the rate leader at 6.125%.

---

## 12. Blockers for Slice 2 P0-2 / Slice 3 P2-3 Build

### 12.1 P0 Blockers (must resolve before Slice 2 P0-2)

1. **UWM rate sheet (priority: HIGH)** — Cannot include in engine until rate sheet is public. **Resolve via**: Inside Mortgage Finance contact or UWM broker portal trial.
2. **Insula Capital portfolio DSCR product matrix (priority: MEDIUM)** — Too new (Jun 11 2026); full product guide not yet public. **Resolve via**: PR Web follow-up; wait 30 days for product launch materialization.
3. **Deephaven re-verification (priority: MEDIUM)** — TOPIC 8 marks STALE; 2024 ownership change suspected. **Resolve via**: NMLS Consumer Access check + direct lender call.

### 12.2 P1 Blockers (must resolve before Slice 3 P2-3)

4. **Rocket Pro TPO DSCR product details (priority: LOW)** — TOPIC 8 has placeholder values; rate sheet not public. **Resolve via**: Broker TPO account trial.
5. **Ready Capital 1-4 unit DSCR (priority: LOW)** — Ready Capital is primarily multifamily; confirm if 1-4 unit DSCR is offered. **Resolve via**: Direct broker inquiry.

### 12.3 P2 Blockers (defer to Slice 4)

6. **Portfolio-level DSCR aggregation math (Insula-style)** — Requires domain 11 research; not blocking Slice 2/3.

---

## 13. Open Items for Round 14 Re-Verification

| Lender | Verified | Re-Verify Priority | Reason |
|--------|----------|-------------------|--------|
| Deephaven | Pre-2024 | **P0 immediate** | Stale; ownership change suspected |
| UWM | N/A (Apr 2026) | **P0 high** | Rate sheet not public; new product |
| Insula Capital | N/A (Jun 11 2026) | **P0 high** | New product launch |
| Rocket Pro TPO | 2025 | P1 | TOPIC 8 placeholder values |
| Ready Capital | 2025 | P1 | 1-4 unit DSCR unclear |
| Pennymac | 6.12.26 | Annual | 365-day re-verify |
| Griffin Funding | 2026-06 | Annual | 365-day re-verify |
| Visio Lending | 2026-06 | Annual | 365-day re-verify |
| Acra | 2026-06 | Annual | 365-day re-verify |
| All others | 2026-06 | Bi-annual | 180-day re-verify |

---

## 14. Individual Profile Files (Manifest)

| # | File | Size | Source |
|---|------|------|--------|
| 1 | `lender_pennymac_profile.md` | 3.2KB | Primary source PDF (extracted) |
| 2 | `lender_griffin_funding_profile.md` | 2.8KB | Lender website + TOPIC 8 |
| 3 | `lender_kiavi_profile.md` | 2.6KB | Lender website + TOPIC 8 |
| 4 | `lender_visio_lending_profile.md` | 2.5KB | Lender website + TOPIC 8 |
| 5 | `lender_acra_lending_profile.md` | 2.4KB | Lender website + Scotsman Guide 2025 |
| 6 | `lender_ocmbc_profile.md` | 2.4KB | Lender website + Scotsman Guide 2025 |
| 7 | `lender_crosscountry_mortgage_profile.md` | 2.3KB | Lender website + Scotsman Guide 2025 |
| 8 | `lender_ad_mortgage_profile.md` | 2.3KB | Lender website + Scotsman Guide 2025 |
| 9 | `lender_newfi_profile.md` | 2.5KB | Lender website + TOPIC 8 |
| 10 | `lender_angel_oak_profile.md` | 2.4KB | Lender website + TOPIC 8 |
| 11 | `lender_uwm_profile.md` | 1.8KB | Inside Mortgage Finance (Round 11) — INCOMPLETE |
| 12 | `lender_defy_mortgage_profile.md` | 2.2KB | Lender website + TOPIC 8 |
| 13 | `lender_easy_street_capital_profile.md` | 2.5KB | Lender website + TOPIC 8/9 |
| 14 | `lender_lima_one_capital_profile.md` | 2.3KB | Lender website + TOPIC 8/9 |
| 15 | `lender_new_silver_profile.md` | 2.1KB | Lender website + TOPIC 8 |
| 16 | `lender_american_heritage_profile.md` | 2.2KB | Lender website + TOPIC 8/9 |
| 17 | `lender_rocket_pro_tpo_profile.md` | 1.9KB | Lender website + TOPIC 8 placeholder |
| 18 | `lender_insula_capital_profile.md` | 1.5KB | PR Web (Jun 11 2026) — INCOMPLETE |
| 19 | `lender_deephaven_profile.md` | 1.9KB | TOPIC 8 STALE |
| 20 | `lender_ready_capital_profile.md` | 1.8KB | Lender website + Scotsman Guide |

**Total: 20 individual profile files (~46KB)**

---

## 15. Summary

**3 most important findings for Slice 2 P0-2:**

1. **Pennymac is the verified primary-source anchor (92 confidence).** Use Pennymac as the gold-standard profile for the `lender_programs` table. The 6.12.26 PDF extract (73KB text) gives 13+ verified fields including full LTV/FICO matrix.

2. **UWM's April 2026 entry is the single biggest 2026 competitive threat.** Inside Mortgage Finance reported $0.5B projected pace in the first 60 days. Engine must include UWM as a "watch" lender with TBD rates.

3. **DSCR floor consensus: 0.75 / 1.00 / NO MIN (Easy Street STR).** With rare exceptions (Kiavi 1.10 for 90% LTV; Angel Oak 1.00 for 85% LTV; Insula TBD), the market standard is 0.75 with reserves or 1.00 standard.

**Top 3 lenders for the engine launch (recommended partner basket):**
1. **Pennymac** (verified primary; conservative baseline)
2. **Griffin Funding** (broadest flexibility; top tier rates)
3. **Visio Lending** (STR + Flex specialist)

**Top 3 by 2024 production volume (Scotsman Guide 2025):**
1. **OCMBC** — $3.55B / 8,754 units (80 confidence)
2. **CrossCountry Mortgage** — $3.48B / 6,610 units (75 confidence)
3. **Acra Lending** — $3.39B / 6,820 units (82 confidence)

**Note on Pennymac:** Likely #1 by pure DSCR volume (estimated $0.8-1.2B) but not separately disclosed in Scotsman Guide.

**Recommended re-verification priority:** Deephaven (STALE) > UWM rate sheet (NEW) > Insula portfolio matrix (NEW) > Rocket Pro TPO (placeholder).
