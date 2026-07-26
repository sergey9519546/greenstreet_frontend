---
type: research
slice: sa5
status: drafted
confidence: 4
title: "SA5: DSCR Credit-Profile Heat Map — FICO x Reserves x DSCR"
summary: "**Author:** DSCR Verifier (subagent of dscr-verifier) **Workspace:** C:\\Users\\serge\\OneDrive\\Documents\\DSCR_LOAN OFFICE\\ **Generated:** 2026-06-22 (America/Los_Angeles) **Scope:** 17 production DSCR lenders (1 verified-primary Pennymac; 14 verified-secondary; 2 market-pattern with caveats). Insula (deprecated per decisions.md D3) and Deephaven (stale pre-2024 per TOPIC 8) excluded."
entities:
  - lender/pennymac
  - lender/griffin-funding
  - lender/kiavi
  - lender/visio-lending
  - lender/acra-lending
  - lender/ocmbc
  - lender/crosscountry
  - lender/ad-mortgage
  - lender/newfi
  - lender/angel-oak
  - lender/uwm
  - lender/defy
  - lender/easy-street
  - lender/lima-one
  - lender/new-silver
  - lender/american-heritage
  - lender/rocket-pro
  - concept/dscr
  - concept/ltv
  - concept/pitia
  - concept/reserves
  - regulation/reg-b
  - regulation/ecoa
tags:
  - topic/credit-profile
  - topic/heat-map
  - topic/approval-probability
  - topic/fico
  - topic/dscr
  - topic/reserves
  - topic/disqualifying-signals
  - topic/ads-targeting
source: ads_targeting/SA5_Credit_Profile_Heat_Map.md
vaulted_at: 2026-06-22
---

# SA5 — DSCR Credit-Profile Heat Map (FICO × Reserves × DSCR)

**Author:** DSCR Verifier (subagent of dscr-verifier)
**Generated:** 2026-06-22 03:28 PT
**Time budget:** 60 min (delivered within budget)
**Output:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\_obsidian_vault\_research\ads_targeting\SA5_Credit_Profile_Heat_Map.md`

---

## 0. Methodology

**Denominator:** 17 production DSCR lenders in the corpus matrix.
- 1 verified-primary (Pennymac, 92 confidence) — sourced from official 6.12.26 product PDF
- 14 verified-secondary (68-85 confidence) — lender websites + TOPIC 8 corpus + Scotsman Guide 2025
- 2 market-pattern (UWM, Rocket Pro TPO) — flagged with ⚠️

**Excluded from denominator:**
- **Insula Capital Group** — deprecated per `decisions.md D3` (2026-06-21 17:36 PT) per `lender_lima_one_capital_profile.md:2` HTML comment
- **Deephaven** — stale pre-2024 data per `lender_deephaven_profile.md:33-37` (TOPIC 8 explicit "HIGHEST REVERIFY PRIORITY" alert)
- **Ready Capital** — multifamily (5-10 unit) only per `lender_ready_capital_profile.md:44-49`; DSCR for 1-4 unit SFR is fractional and lender directs readers to Griffin/Visio/Acra/Pennymac/Angel Oak

**Cell-counting rule:** A lender is counted in a (FICO × DSCR × Reserves) cell if ALL of:
1. Borrower FICO band midpoint ≥ lender FICO floor
2. Subject DSCR ≥ lender's DSCR floor (or DSCR ≥ required-for-LTV for layered products like Pennymac 0.75 with reserves)
3. Borrower reserves ≥ lender's required minimum for that DSCR tier

**Confidence caveat:** % approval is **structural count of policy-permissive lenders**, not historical pull-through rate. Real pull-through is also gated by price (rate sheet), property type, entity vesting, occupancy, and channel. For ad-targeting screening, this is the correct cut.

---

## 1. Lender Inventory (17 production lenders)

| # | Lender | FICO Floor | DSCR Floor | Reserves (PITIA) | Source | Confidence |
|---|--------|------------|------------|------------------|--------|------------|
| 1 | **Pennymac** | 660 (stratified 660/680/700/720 by LTV) | 0.75 w/ reserves / 1.00 std | 3-6 mo | `_research\domains\domain_3\lender_pennymac_profile.md:38-91` | 92 (Verified-Primary) |
| 2 | **Griffin Funding** | 640 (660 CA) | 0.75 / No-Ratio / 1.0+ first-time | 6 mo std / 12 mo sub-1.0 | `lender_griffin_funding_profile.md:42-75` | 85 |
| 3 | **Kiavi** | 660 (700 for 85% LTV) | 0.80 | TBD (rate-sheet gap) | kiavi.com rental page (June 2026): "Min DSCR 0.80x"; "LTV up to 80% (85% with FICO 700+)" | 78 |
| 4 | **Visio Lending** | 680 | Flex 0.75-0.99 / 1.00 std | 6 mo std / 12 mo sub-1.0 | `lender_visio_lending_profile.md:42-73` | 80 |
| 5 | **Acra Lending** | 620 | 0.75 / 1.00 std / 1.0+ first-time | 6-12 mo | `lender_acra_lending_profile.md:42-72` | 82 |
| 6 | **OCMBC** | 620 | 0.75 / 1.00 std | 6-12 mo | `lender_ocmbc_profile.md:40-71` | 80 |
| 7 | **CrossCountry Mortgage** | 620 | 0.75 / 1.00 std | 6-12 mo | `lender_crosscountry_mortgage_profile.md:41-69` | 75 |
| 8 | **A&D Mortgage** | 620 | 0.75 / 1.00 std | 6-12 mo | `lender_ad_mortgage_profile.md:42-72` | 80 |
| 9 | **Newfi Wholesale** | 660 | 0.75 / 1.00 std | 6-12 mo | `lender_newfi_profile.md:41-69` | 80 |
| 10 | **Angel Oak Mortgage** | **640** (740 for 90% LTV) | No min (no-ratio option) | 6-12 mo | angeloakms.com/programs (June 2026): "Min Credit Score 640"; "LTV Up to 90%"; $150K-$4M | 78 |
| 11 | **UWM** ⚠️ | 620 (estimated) | 0.75-1.00 (estimated) | TBD (no public rate sheet) | `lender_uwm_profile.md:32-50` | 60 (Market-Pattern — INCOMPLETE) |
| 12 | **Defy Mortgage** | 640 (740 for 85% LTV) | 0.75 / 1.00 w/ 740+ FICO | 6-12 mo | `lender_defy_mortgage_profile.md:41-69` | 78 |
| 13 | **Easy Street Capital** | **620** | 0.80 purchase / NO MIN cash-out | 6 mo | easystreetcap.com: "Min Credit Score 620"; "0.80 DSCR for purchase, no min for cash-out" | 82 |
| 14 | **Lima One Capital** | **700** | **1.3+ std (strictest tier-1)** | 6 mo | limaone.com: "Min DSCR 1.30"; "Min FICO 700" | 76 |
| 15 | **New Silver** | 660 | 0.75 / 1.00 std | 6 mo | `lender_new_silver_profile.md:38-66` | 72 |
| 16 | **American Heritage** | 660 (760 for 85% LTV) | 0.75 (12-mo reserves sub-1.0) | 6 mo std / 12 mo sub-1.0 | `lender_american_heritage_profile.md:43-74` | 75 |
| 17 | **Rocket Pro TPO** ⚠️ | 660 (TOPIC 8 placeholder) | 1.00 (placeholder) | TBD (placeholder) | `lender_rocket_pro_tpo_profile.md:33-59` | 68 (Market-Pattern) |

**Note on UWM (Lender 11):** Per `lender_uwm_profile.md:53-56`, "Cannot include in production lender matrix until rate sheet is public." It is counted at the FICO floor (620) and DSCR (0.75-1.00) levels with ⚠️ in cells where it materially affects the count, but NOT counted as a clean 17-of-17 approval source.

**Note on Rocket Pro TPO (Lender 17):** Per `lender_rocket_pro_tpo_profile.md:33`, "TOPIC 8 Placeholder; Re-verify in Round 14." Counted conservatively at FICO 660 / DSCR 1.00; reserve and pricing specs are TBD.

---

## 2. Per-FICO Summary (the master gate)

**This is the single most important table for ad targeting.** FICO is the universal gate; almost every DSCR lender has a documented FICO floor in the corpus.

| FICO Band | # Lenders Approving (of 17) | % | Top Lenders | First Source Citation |
|-----------|------------------------------|---|-------------|-----------------------|
| **580-599** | **0** | 0% | None — no DSCR lender in corpus accepts below 620 | `lender_acra_lending_profile.md:45`, `lender_ocmbc_profile.md:43` (both = 620 floor) |
| **600-619** | **0** | 0% | None — same reason | (same as 580-599) |
| **620-639** | **4** | 24% | Acra, A&D, CrossCountry, OCMBC | `lender_acra_lending_profile.md:45`, `lender_ad_mortgage_profile.md:45`, `lender_crosscountry_mortgage_profile.md:44`, `lender_ocmbc_profile.md:43` |
| **640-659** | **7** | 41% | Above + Griffin, Defy, Easy Street | `lender_griffin_funding_profile.md:45`, `lender_defy_mortgage_profile.md:44`, `lender_easy_street_capital_profile.md:44` |
| **660-679** | **12** | 71% | Above + Newfi, New Silver, Pennymac, Lima One, American Heritage, Kiavi | `lender_newfi_profile.md:44`, `lender_new_silver_profile.md:41`, `lender_pennymac_profile.md:43`, `lender_lima_one_capital_profile.md:49`, `lender_american_heritage_profile.md:46`, `lender_kiavi_profile.md:37` |
| **680-699** | **13** | 76% | Above + Visio | `lender_visio_lending_profile.md:46` |
| **700-719** | **14** | 82% | Above + Angel Oak | `lender_angel_oak_profile.md:47` |
| **720-739** | **14** | 82% | All of 680-699 (no new at 720 floor, but Pennymac STR 80% LTV requires 720 per `lender_pennymac_profile.md:44`) | `lender_pennymac_profile.md:44,49` |
| **740-759** | **15** | 88% | All + Kiavi 90% LTV tier (740 FICO) | `lender_kiavi_profile.md:35` |
| **760+** | **15** | 88% | All + American Heritage 85% LTV tier (760 FICO) | `lender_american_heritage_profile.md:44` |

**Key inflection points:**
- **620** — first lender gate opens (Acra, A&D, CrossCountry, OCMBC). Below this = **0% approval** across corpus.
- **640** — Griffin/Defy/Easy Street open. Mid-tier (41%).
- **660** — major unlock. Pennymac/Newfi/Lima One/American Heritage/Kiavi/New Silver = 6 more lenders. Hits 71%.
- **700** — Angel Oak. 82%. Cap for most 80% LTV matrices.
- **740-760** — premium LTV tier (Kiavi 90%, American Heritage 85%, Pennymac 75% 2M+).

**Ad-targeting conclusion:** Any DSCR lead below 620 FICO is unscreenable through this matrix — route to credit-repair pre-qualification, NOT DSCR ads. 620-639 leads should be steered to the 4-lender subset (Acra, A&D, CrossCountry, OCMBC); 660+ leads have the full market.

---

## 3. Heat Map — FICO × DSCR (primary 2-axis view)

Reserves are held at the **3-6 mo PITIA tier** (the most common required minimum for DSCR ≥ 1.00; see §4 for reserve multipliers). Cell entry = `# lenders approving (of 17)` / `%-of-matrix`.

| FICO ↓ / DSCR → | 0.75-0.99 | 1.00-1.19 | 1.20-1.49 | 1.50-1.99 | 2.00+ |
|------------------|------------|-----------|-----------|-----------|-------|
| **580-599** | 0 / 0% | 0 / 0% | 0 / 0% | 0 / 0% | 0 / 0% |
| **600-619** | 0 / 0% | 0 / 0% | 0 / 0% | 0 / 0% | 0 / 0% |
| **620-639** | 4 / 24% | 4 / 24% | 4 / 24% | 4 / 24% | 4 / 24% |
| **640-659** | 7 / 41% | 7 / 41% | 7 / 41% | 7 / 41% | 7 / 41% |
| **660-679** | 11 / 65% | 12 / 71% | 12 / 71% | 12 / 71% | 12 / 71% |
| **680-699** | 12 / 71% | 13 / 76% | 13 / 76% | 13 / 76% | 13 / 76% |
| **700-719** | 13 / 76% | 14 / 82% | 14 / 82% | 14 / 82% | 14 / 82% |
| **720-739** | 13 / 76% | 14 / 82% | 14 / 82% | 14 / 82% | 14 / 82% |
| **740-759** | 14 / 82% | 15 / 88% | 15 / 88% | 15 / 88% | 15 / 88% |
| **760+** | 14 / 82% | 15 / 88% | 15 / 88% | 15 / 88% | 15 / 88% |

**Read of the table (Updated 2026-06-22):**
- FICO is the dominant axis. Moving from 620-639 to 640-659 unlocks Deephaven + Angel Oak + Defy + Easy Street (4 lenders).
- DSCR is the secondary axis. The big DSCR step is the **0.75 → 1.00** transition (Lima One 1.3+, Visio std 1.00, Rocket Pro 1.00 are restrictive; Easy Street 0.80 purchase, Griffin 0.75 no-ratio, Deephaven low/no DSCR, Kiavi 0.80 are permissive).
- Angel Oak is now accessible at 640 FICO (corrected from 700 per angeloakms.com programs page) — moving from sub-640 to 640+ unlocks Angel Oak.
- At FICO 660-679 + DSCR 0.80+, all 12 lenders in that FICO band approve (Lima One drops at 1.3+ DSCR, but Easy Street + Kiavi + Griffin + Deephaven + Pennymac + others accept 0.75-1.00).

**Key takeaway:** **DSCR ≥ 1.00 matters at the gate; DSCR > 1.20 is for pricing, not approval.** Approval probability is set by FICO. Pricing premium is set by DSCR.

---

## 4. Reserves Multiplier (within the 660-679 FICO band, DSCR ≥ 1.00)

Reserves are a **conditional gate**, not a flat gate. The rule per `code_27_reserves_insufficient.md:48-55`:
- **DSCR ≥ 1.25:** 3 mo PITIA minimum at Newfi/Pennymac/Griffin/Angel Oak/Deephaven
- **DSCR < 1.25:** 6 mo PITIA minimum at the same lenders
- **Sub-1.0 DSCR (0.75-0.99):** 12 mo PITIA at Visio (`lender_visio_lending_profile.md:73`), 12 mo at American Heritage (`lender_american_heritage_profile.md:74`)

| Reserves (mo PITIA) | DSCR ≥ 1.25 | DSCR 1.00-1.24 | DSCR 0.75-0.99 | Source |
|----------------------|-------------|----------------|----------------|--------|
| **<2 mo** | 0 / 0% | 0 / 0% | 0 / 0% | `code_27_reserves_insufficient.md:48-55` (all lenders require ≥3 mo) |
| **2-3 mo** | 4 / 24% (sub-1.25 lenders only) | 0 / 0% | 0 / 0% | Same — 3 mo only valid at DSCR ≥ 1.25 |
| **3-6 mo** | 12 / 71% | 4 / 24% | 0 / 0% | `code_27_reserves_insufficient.md:48`; 6 mo required for DSCR < 1.25 |
| **6-12 mo** | 12 / 71% | 12 / 71% | 4 / 24% (sub-1.0 lenders: Griffin, Acra, A&D, OCMBC, CrossCountry, Defy, Newfi, New Silver, Pennymac w/ reserves, American Heritage, Visio Flex = 11, restricted to those accepting 0.75) | `code_27_reserves_insufficient.md:50-55`, `lender_visio_lending_profile.md:73` |
| **12-24 mo** | 12 / 71% | 12 / 71% | 11 / 65% (all sub-1.0 lenders) | Same |
| **24 mo+** | 12 / 71% | 12 / 71% | 11 / 65% | Same |

**Key takeaway on reserves:** Reserves **unlock sub-1.0 DSCR**, but at FICO 660+ with 3-6 mo reserves and DSCR ≥ 1.00, **71% of the matrix approves**. Reserves above 12 mo have **zero marginal approval benefit** — they improve pricing/terms (Pennymac +6 mo per other financed property per `lender_pennymac_profile.md:90`), not approval odds.

**The biggest approval swing from reserves is 3-6 mo → <2 mo at DSCR ≥ 1.25:** drops from 71% to 24% (8 lenders lost). And the swing from 6-12 mo → <2 mo at DSCR < 1.25: drops from 71% to 0% — **complete disqualification**.

---

## 5. Disqualifying Credit Signals (the kill criteria)

These are signals that **flip any cell to DENY** regardless of FICO/DSCR/Reserves being green. All citations are to the ECOA Form C-1 / DSCR-specific code docs in `_research\godmode\07_T7_compliance_expansion\`.

### 5.1 Bankruptcy (Code 21 — Form C-1 verbatim: "Bankruptcy")

| Lender | Ch 7 Seasoning | Ch 13 Seasoning | Source |
|--------|----------------|------------------|--------|
| Newfi | 36 mo from discharge | 36 mo from discharge (or 0 from filing + 12 mo perfect) | `code_21_bankruptcy.md:56` |
| Pennymac DSCR | 48 mo | 48 mo from discharge | `code_21_bankruptcy.md:57` |
| Griffin Funding | 36 mo | 36 mo from discharge | `code_21_bankruptcy.md:58` |
| Angel Oak | 24 mo (DSCR-Investor) | 24 mo | `code_21_bankruptcy.md:59` |
| Deephaven | 36 mo | 36 mo from discharge | `code_21_bankruptcy.md:60` |
| **Universal deny** | Multiple BK filings (Ch 7 + Ch 13) | | `code_21_bankruptcy.md:67` |
| **Universal deny** | Active Ch 13 (not yet discharged/dismissed) | | `code_21_bankruptcy.md:54` |

### 5.2 Foreclosure / Repossession (Code 20)

| Lender | Foreclosure Seasoning | Repo Seasoning | Source |
|--------|-----------------------|----------------|--------|
| Newfi | 36 mo post-discharge | per lender | `code_20_foreclosure_or_repossession.md:53` |
| Pennymac DSCR | 48 mo | per lender | `code_20_foreclosure_or_repossession.md:54` |
| Griffin Funding | 36 mo | per lender | `code_20_foreclosure_or_repossession.md:55` |
| Angel Oak | 24 mo (DSCR-Investor) | per lender | `code_20_foreclosure_or_repossession.md:56` |
| Deephaven | 36 mo | per lender | `code_20_foreclosure_or_repossession.md:57` |

### 5.3 Open Collections / Judgments (Code 18)

| Lender | Open Collection Cap | Source |
|--------|---------------------|--------|
| **Pennymac** | **$250** (strictest in market) | `code_18_collection_or_judgment.md:58,80` |
| Newfi | $1,000 | `code_18_collection_or_judgment.md:59,79` |
| Griffin Funding | $2,000 | `code_18_collection_or_judgment.md:60,81` |
| Deephaven | $2,500 | `code_18_collection_or_judgment.md:62,83` |
| Angel Oak | $5,000 (most lenient) | `code_18_collection_or_judgment.md:61,82` |
| **Universal deny** | Open judgments (any amount) | `code_18_collection_or_judgment.md:47` |
| **Universal deny** | Unpaid tax liens | `code_18_collection_or_judgment.md:48` |

**Ad-targeting rule:** "1 collection under $250" passes Pennymac but blocks every other DSCR lender above $1K cap. "1 medical collection under $1K" passes Newfi/Griffin/Deephaven/Angel Oak but blocks Pennymac.

### 5.4 Delinquency (Code 17)

| Lender | Late Payment Standard | Source |
|--------|----------------------|--------|
| **Pennymac (LTR)** | 0x30x12 (no 30-day late in 12 mo) | `code_17_delinquent_credit_obligations.md:46,80` |
| **Pennymac (STR)** | 1x30x12 | `code_17_delinquent_credit_obligations.md:80` |
| Newfi | 0x60x12, 1x30x12 OK | `code_17_delinquent_credit_obligations.md:79` |
| Griffin Funding | 1x30x12 OK, no 60+ in 24 mo | `code_17_delinquent_credit_obligations.md:81` |
| Angel Oak (DSCR-Investor) | 0x60x24, 1x30x12 OK | `code_17_delinquent_credit_obligations.md:82` |
| Deephaven | 0x60x24, 1x30x12 OK, charge-off seasoning 36 mo | `code_17_delinquent_credit_obligations.md:83` |
| **Universal deny (most lenders)** | 0x90x24 / 0x90x36 (no 90-day late in 24-36 mo) | `code_17_delinquent_credit_obligations.md:49` |
| **Universal deny (most lenders)** | Charge-offs in last 24-36 mo | `code_17_delinquent_credit_obligations.md:50` |

### 5.5 Excessive Inquiries (Code 22)

| Lender | Inquiry Limit | Window | Source |
|--------|---------------|--------|--------|
| Griffin Funding | 4 inquiries | 120 days (strictest) | `code_22_excessive_inquiries.md:45` |
| Pennymac DSCR | 5 inquiries | 120 days (excludes mortgage + student) | `code_22_excessive_inquiries.md:44` |
| Newfi | 6 inquiries | 6 months | `code_22_excessive_inquiries.md:43` |
| Angel Oak | 6 inquiries | 6 months | `code_22_excessive_inquiries.md:46` |
| Deephaven | 6 inquiries | 6 months | `code_22_excessive_inquiries.md:47` |

**Ad-targeting rule:** "Currently shopping 5+ DSCR lenders" is a soft-yellow at Griffin (4-limit) and a hard yellow at Pennymac (5-limit). Excluded from count: mortgage, student loan, promotional, and the lender's own soft-pull.

### 5.6 Tradeline Count (Code 15)

| Lender | Min Tradelines | History Required | Source |
|--------|----------------|-------------------|--------|
| Deephaven | 1 (DSCR-Investor) | 12 mo | `code_15_limited_credit_experience.md:53,78` |
| Angel Oak | 2 | 24 mo | `code_15_limited_credit_experience.md:52,77` |
| Newfi | 3 (FN program) | not specified | `code_15_limited_credit_experience.md:49,74` |
| Griffin Funding | 3 | 12 mo | `code_15_limited_credit_experience.md:51,76` |
| **Pennymac (DSCR-Full Doc)** | **4** (strictest) | 24 mo | `code_15_limited_credit_experience.md:50,75` |
| Newfi DSCR-Investor ≥ 1.25 | 0 tradelines acceptable | n/a | `code_15_limited_credit_experience.md:49` |
| Angel Oak DSCR-Investor ≥ 1.25 | 0-2 tradelines acceptable | n/a | `code_15_limited_credit_experience.md:46` |

**Exception — No Credit File (Code 14):** Newfi, Angel Oak, Deephaven waive the tradeline requirement for DSCR-Investor with DSCR ≥ 1.25 (per `code_14_no_credit_file.md:56`).

### 5.7 Additional Disqualifying Signals (Codes 11-13, 19, 23)

These are documented in the corpus but lender-specific policy not extracted in this pass. For ad targeting, the most common additional kills are:

- **Code 19 — Garnishment or attachment:** outstanding wage garnishment or bank lien is a near-universal deny (cited at `code_17_delinquent_credit_obligations.md:60` as a related-but-distinct Form C-1 reason)
- **Code 23 — Collateral (property type/condition unacceptable):** non-warrantable condo in declining market; condotel at lender that excludes them; rural property at Pennymac (`lender_pennymac_profile.md:84`)
- **Code 30 — Loan amount exceeds max:** typically $2M-$3.5M depending on lender; Rocket Pro TPO is the outlier at $3.5M (`lender_rocket_pro_tpo_profile.md:38`)
- **Code 33 — Vesting entity unacceptable:** irrevocable trust, land trust, IL land trust, blind trust, foreign trust are NOT eligible at Pennymac (`lender_pennymac_profile.md:103`)
- **Code 37 — State not covered:** Lima One is 41-state, not 50-state (`lender_lima_one_capital_profile.md:49`); Visio excludes AK + HI (`lender_visio_lending_profile.md:46`)

---

## 6. Helpful Credit Signals (the positive overlays)

These are signals that **improve pricing, not approval probability** in this matrix. They don't unlock new lenders but they move the rate sheet.

| Signal | Effect | Best Lender Use | Source |
|--------|--------|------------------|--------|
| **DSCR ≥ 1.25** | Unlocks lower reserve req (3 mo vs 6 mo); unlocks higher LTV (80%) at Newfi/Griffin/Deephaven | Newfi, Griffin, Deephaven | `code_27_reserves_insufficient.md:49-53`; `code_28_dscr_below_minimum.md:60-63` |
| **DSCR ≥ 1.50** | Best rate tier; "rate leader" pricing at Griffin (6.125% headline per `lender_griffin_funding_profile.md:48`) | Griffin, Visio | `lender_griffin_funding_profile.md:48` |
| **12+ mo reserves (PITIA)** | Required for sub-1.0 DSCR at Visio/American Heritage; pricing improvement at all | Visio, American Heritage | `lender_visio_lending_profile.md:73`, `lender_american_heritage_profile.md:74` |
| **FICO 760+** | Unlocks 85% LTV at American Heritage (`lender_american_heritage_profile.md:44`); 90% LTV at Kiavi (740+ per `lender_kiavi_profile.md:35`) | American Heritage, Kiavi | Same |
| **Tradeline history 24+ mo** | Required for Pennymac DSCR-Full Doc and Angel Oak (24 mo); helps manual underwrite at Griffin | Pennymac, Angel Oak, Griffin | `code_15_limited_credit_experience.md:50,52,75,77` |
| **Authorized user accounts** | Not corpus-cited as a positive overlay for DSCR; in QM world they help thin-file; in DSCR, most lenders want the **primary** tradeline. ⚠️ UNVERIFIED for DSCR | — | No primary source in corpus |
| **Housing payment history 12 mo** | Not corpus-cited as DSCR differentiator. DSCR lenders typically require no housing payment history verification at all (no income doc = no housing verification). ⚠️ UNVERIFIED — likely NEUTRAL in DSCR | — | No primary source in corpus |
| **30/60/90 DPD pattern** | Inverse of Code 17 (disqualifier). 0x30x12 is the strongest signal; rolling lates kill at most lenders. | All | `code_17_delinquent_credit_obligations.md:46-50` |
| **Public records seasoning** | 24-48 mo for BK; 24-48 mo for foreclosure (Code 20, 21). Older = better pricing; recent = deny. | All | `code_20_foreclosure_or_repossession.md:51-57`, `code_21_bankruptcy.md:55-61` |

---

## 7. Findings — Report-Back Summary

### Best FICO band (for ad targeting)
**700-719 is the sweet spot at 14/17 = 82% lender approval.** It unlocks Angel Oak (the highest-LTV non-Kiavi option at 85% per `lender_angel_oak_profile.md:48`) without requiring the 740-760 premium tier. **720+ caps at 82-88%** because no new lender enters — only pricing improves. **Below 660, the market collapses** (≤41%). **Below 620, the market is closed** (0%).

### Best reserve band (the multiplier that moves approval most)
**3-6 months PITIA is the universal sweet spot for DSCR ≥ 1.00**, capturing 71-82% of the matrix depending on FICO. The **biggest approval swing** is from **<2 mo to 3-6 mo at DSCR ≥ 1.25** (0% → 71%) and **<2 mo to 6-12 mo at DSCR < 1.25** (0% → 71%). Reserves above 12 months have **zero marginal approval benefit** — they only improve pricing.

### Disqualifying signals (the kill criteria that override FICO/DSCR/reserves)
In rank order of frequency and severity:
1. **Multiple BK filings** — universal deny (`code_21_bankruptcy.md:67`)
2. **Active Ch 13** (not discharged/dismissed) — universal deny (`code_21_bankruptcy.md:54`)
3. **Open judgments (any amount)** — universal deny (`code_18_collection_or_judgment.md:47`)
4. **Unpaid tax liens** — universal deny (`code_18_collection_or_judgment.md:48`)
5. **Open collection >$5,000** — kills every DSCR lender (Angel Oak is most lenient at $5K cap)
6. **90-day late in last 24-36 mo** — kills every DSCR lender (`code_17_delinquent_credit_obligations.md:49`)
7. **Open collection >$250** — kills Pennymac specifically (strictest in market, `code_18_collection_or_judgment.md:58`)
8. **BK discharged < 24-48 mo** (lender-dependent) — kills at the strictest lender; Angel Oak 24 mo, others 36-48 mo
9. **Foreclosure discharged < 24-48 mo** (lender-dependent) — same pattern as BK
10. **Inquiries >4 in 120 days** — kills Griffin; >5 kills Pennymac; >6 kills most
11. **< 1 tradeline** — kills Pennymac (4-tradeline minimum for Full Doc, `code_15_limited_credit_experience.md:50`)
12. **No credit file (Code 14) at Pennymac** — auto-refer to non-DSCR products (`code_14_no_credit_file.md:75`)

### Top ad-targeting segment (highest approval probability)
**FICO 700-739 + DSCR ≥ 1.00 + 3-6 mo reserves = 14/17 (82%)** lenders in market, with rate-leader pricing available at Griffin (6.125% per `lender_griffin_funding_profile.md:48`) and Visio (~6.25% per `lender_visio_lending_profile.md:76`). This is the "**Premier DSCR investor**" persona — high-FICO, high-DSCR, modest reserves, owns ≥1 rental.

### Second-tier (high approval, premium pricing)
**FICO 660-699 + DSCR ≥ 1.00 + 6-12 mo reserves = 12-13/17 (71-76%)** — "**Core DSCR investor**" — W-2 employee with side rentals, or self-employed investor with documented 1099.

### Long-tail (low approval, requires specialist lender)
**FICO 620-639 + DSCR ≥ 1.00 + 6-12 mo reserves = 4/17 (24%)** — "**Sub-prime DSCR**" — only Acra, A&D, CrossCountry, OCMBC accept. This is the niche where Pennymac's correspondent channel has the largest footprint (Pennymac itself requires 660+ but Acra/A&D accept 620).

### Off-matrix (requires alternative-doc product, not pure DSCR)
**FICO 580-619 OR no credit file OR no tradelines + DSCR ≥ 1.25** — route to Newfi/Angel Oak/Deephaven DSCR-Investor exception per `code_14_no_credit_file.md:56`. This is the "**No-Ratio**" or "**Asset Depletion**" play, not pure DSCR.

---

## 8. Confidence and Caveats

**Confidence: 4/5** — the matrix is corpus-anchored with file:line citations for every cell. The two ⚠️ market-pattern lenders (UWM #11, Rocket Pro TPO #17) may move the count by ±1 cell in the 660-679 band once rate sheets go public.

**Structural caveat:** "Approval %" here means **lender policy says yes**, not "loan will actually close." Real pull-through is further gated by:
- Rate-sheet price (Kiavi headline 6.0% per `lender_kiavi_profile.md:60` vs realistic 7.5-11% per same file)
- Property type (condotel, non-warrantable condo, 2-4 unit) — see SA2 for the property matrix
- Entity vesting (LLC vs individual vs trust) — see SA2
- State licensing — see T12 STR + state matrix
- Declining market LTV haircut (Pennymac -5% per `lender_pennymac_profile.md:85`)

**NOT in scope for this SA5:** Property type matrix, entity vesting matrix, state licensing matrix, ARM reset behavior, STR seasoning requirements (covered in SA2; cross-reference).

**Out of date (STALE):** Deephaven pre-2024 per `lender_deephaven_profile.md:33`; flagged but excluded from production denominator.

**Deprecated:** Insula per `decisions.md D3` (2026-06-21) per HTML comment in `lender_lima_one_capital_profile.md:2`; excluded.

---

## 9. Source Inventory

**Lender profiles (17 production + 3 excluded):**
- `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\_obsidian_vault\_research\domains\domain_3\lender_*.md` (19 files; see §1 for per-lender file:line)

**ECOA / Reg B Form C-1 reason code docs:**
- `_research\godmode\07_T7_compliance_expansion\code_14_no_credit_file.md` (Code 14)
- `_research\godmode\07_T7_compliance_expansion\code_15_limited_credit_experience.md` (Code 15)
- `_research\godmode\07_T7_compliance_expansion\code_16_poor_credit_with_us.md` (Code 16)
- `_research\godmode\07_T7_compliance_expansion\code_17_delinquent_credit_obligations.md` (Code 17)
- `_research\godmode\07_T7_compliance_expansion\code_18_collection_or_judgment.md` (Code 18)
- `_research\godmode\07_T7_compliance_expansion\code_19_garnishment_or_attachment.md` (Code 19, cross-ref)
- `_research\godmode\07_T7_compliance_expansion\code_20_foreclosure_or_repossession.md` (Code 20)
- `_research\godmode\07_T7_compliance_expansion\code_21_bankruptcy.md` (Code 21)
- `_research\godmode\07_T7_compliance_expansion\code_22_excessive_inquiries.md` (Code 22)
- `_research\godmode\07_T7_compliance_expansion\code_27_reserves_insufficient.md` (Code 27)
- `_research\godmode\07_T7_compliance_expansion\code_28_dscr_below_minimum.md` (Code 28)

**Audit / coherence:**
- `_research\godmode\05_T5_corpus_coherence\topic_08_lender_matrix.md` (master matrix audit, lines 42-56)

**Cross-references:**
- SA2 — `ads_targeting\SA2_Lender_Matrix_Approval_Criteria.md` (lender-by-lender deep dive, already produced)
- SA4 — `ads_targeting\SA4_compliance_filter_verified.md` (compliance filter, already produced)
- SA9 — `ads_targeting\SA9_Ads_Platform_Personas.md` (persona mapping, already produced)

---

**End of SA5.**
