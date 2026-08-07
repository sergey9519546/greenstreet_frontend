---
type: unified-hub
status: building (v0.1 — initial sections written; continued reading in progress)
title: "Greenstreet Finance — Unified Information Hub"
summary: "Single source of truth for website copy, marketing claims, lender matrix, compliance anchors, and technical specifications. Consolidates 6 research files, 10 SA agent outputs, 7 derivative reports, 30+ master docs into one document organized by website sections + technical appendices. Every claim is cited to a primary source (file:line). Built 2026-06-22 from the 2026-06-22 Videos/ research harvest."
created: 2026-06-22
author: Mavis (root session mvs_b78f9d32cd6348d6a48278d25e380ca4)
canonical: true
sources_consolidated: 50+ files
reading_status: "Sections 1-6 written from SA1/SA2/SA5/SA7/SA9/SA10/AC09_V2/GS07 + website code; appendices pending"
---

# Greenstreet Finance — Unified Information Hub

> **What this document is:** the single source of truth for Greenstreet Finance website content. Every hero metric, every FAQ answer, every lender claim, every compliance footnote traces to a primary source citation (file:line or URL). When the website copy and the research diverge, this document resolves the conflict.
>
> **What this document is not:** a marketing brief. Marketing claims (channel allocation, CPL targets, copy variants) live in the SA/AC reports and are referenced but not reproduced here.

---

## How to Use This Document

| If you want to... | Go to |
|---|---|
| Update the homepage hero copy | Section 2 (Hero) |
| Update the 4 stat cards | Section 3 (Stats) |
| Edit a How It Works tab | Section 4 (How It Works) |
| Add or change a customer story | Section 5 (Solutions / Case Studies) |
| Edit the 6 features grid | Section 6 (Value Items) |
| Edit use cases | Section 7 (Use Cases) |
| Edit FAQ | Section 8 (FAQ) |
| Edit blog posts | Section 9 (Resources) |
| Update the trusted-lender logo wall | Section 10 (Trust Bar) |
| Look up a lender's criteria | Appendix A (Lender Matrix) |
| Look up a borrower profile | Appendix B (Top 20 Profiles) |
| Check if a market is fundable | Appendix C (Geography Tiers) |
| Verify a regulatory claim | Appendix D (Compliance Anchors) |
| Understand the math behind a metric | Appendix F (Math & Data) |
| Find the source for any claim | Appendix G (Source Citations) |

---

# Section 1: Product & Engine Identity

## 1.1 Canonical Product Names

| Layer | Name | Audience | Source |
|---|---|---|---|
| **Consumer brand** | **Greenstreet Finance** | Investors, brokers (external) | `dscr-website/deployed.html` title tag; `server/data/dscr.js` comment line 2 |
| **Engine** | **Sovereign OS** | Brokers, lenders, internal | `dscr-website/deployed.html` line 126: "Run your entire non-QM lending operation from one unified system — powered by Sovereign OS" |
| **Underlying spec** | **DSCR Sovereign OS** | Engineers, compliance | `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` line 3: "DSCR Sovereign OS: Full Specification, Research, Algorithms, Compliance, and Operations" |
| **Research codenames** | AEGIS DSCR, 20X DSCR Deal Engine, Advisor-Grade DSCR Decision Engine | Research artifacts only — DO NOT use on customer-facing copy | Multiple master docs |

**Rule for website copy:** "Greenstreet Finance" + "Sovereign OS" are the two names that appear externally. All other codenames are internal research artifacts.

## 1.2 What Greenstreet Finance Is (one-paragraph elevator)

> Greenstreet Finance is the next-generation AI-native system of action for DSCR and non-QM wholesale lending. Powered by **Sovereign OS** — a graph-native operating system that ingests live property data, lender matrices, compliance rules, and borrower profiles — Greenstreet returns **Dual-Track DSCR pre-screens** (Lender Qualification + Investor Survival), **ranked lender matches** across 60+ non-QM programs, and **stress-tested underwriting** in under 90 seconds.

**Sources:**
- `dscr-website/deployed.html` line 92: "next-generation AI-native system of action for DSCR and non-QM wholesale lending"
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` line 39: "Graph-Native Financial Operating System built on three planes"
- `dscr-website/server/data/dscr.js` lines 82-129 (stepCards)

## 1.3 What DSCR Is (for the consumer-facing copy)

> A **DSCR loan** (Debt Service Coverage Ratio) is a business-purpose mortgage for rental investment properties. Instead of qualifying the borrower by personal income (W-2, tax returns, DTI), DSCR lenders qualify the **property** — by comparing the monthly rental income to the monthly mortgage payment (PITIA: Principal, Interest, Taxes, Insurance, HOA). A DSCR ≥ 1.00 means the rent covers the mortgage. DSCR loans are typically closed in an LLC, are exempt from many consumer mortgage rules, and are the standard financing for small and mid-size rental investors.

**Sources:**
- `DSCR Loan Approval and Borrower Profile Analysis.md` line 12: "Lenders underwrite DSCR loans based on the property's cash flow rather than the borrower's personal financial history. The core metric is the Debt Service Coverage Ratio (DSCR), calculated by dividing the Net Operating Income (NOI) or Gross Monthly Rent by the Total Debt Service (PITIA). A DSCR of 1.0 means the rental income exactly covers the mortgage payment."
- `frontier_dscr_strategy_guide.md` line 22 (cross-referenced): "DSCR loans primarily evaluate the property's income-generating potential rather than the borrower's personal income"
- `dscr_research_v2_rigorous_2026-06-22.md` line 22: "small or medium-sized investor using DSCR as a scaling tool... self-employed, LLC-based, BRRRR, or portfolio builder"

---

# Section 2: Hero Copy & Metrics

## 2.1 Hero Headline (deployed.html line 90)

> **Make every DSCR deal a winning one**

**Source:** `dscr-website/deployed.html` line 90.

## 2.2 Hero Sub-headline (deployed.html line 92)

> The next-generation AI-native **system of action** for DSCR and non-QM wholesale lending. Built to keep brokers informed, consistent, efficient, diligent.

**Rotator words** (data-rotator attribute, deployed.html line 92): `["informed","consistent","efficient","diligent"]`

## 2.3 Hero Metrics Card (deployed.html lines 99-113)

| Card | Value | Sub-label | Source |
|---|---|---|---|
| Track 1 — Lender Qualification DSCR | **1.42** | PITIA basis · Form 1007 market rent · no vacancy | `dscr-website/deployed.html` lines 99-103; `dscr.js` line 258 (`liveData.dscrTrack1`) |
| Track 2 — Investor Survival DSCR | **1.18** | ITIA basis · 20% vacancy · 8% mgmt fee | `dscr-website/deployed.html` lines 104-107; `dscr.js` line 258 (`liveData.dscrTrack2`) |
| Matched Lenders | **4** | Cake Mortgage · Kiavi · Lima One · Newfi | `dscr-website/deployed.html` lines 109-112; `dscr.js` lines 259 (`liveData.matchedLenders`) |

**Interpretation for users:**
- Track 1 (1.42) is the "lender will say yes" ratio — uses market rent from the appraiser with no vacancy.
- Track 2 (1.18) is the "real-world survival" ratio — applies 20% vacancy + 8% management fee to model what the property actually earns.
- **The gap between 1.42 and 1.18 is the dual-track signal:** a deal can qualify and still be fragile. Showing both is the product's differentiator.

**Source for the dual-track doctrine:** `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` lines 64-79 (Dual-Track DSCR Math — The Non-Negotiable Core); `DSCR_Engine_Master_Specification.md` lines 34-46 (The Breakthrough: Separation of Concerns).

## 2.4 Hero CTA (deployed.html line 132)

Email-form: "Enter your work email address" → submits to `window.GSF.submitDemo(this)`.

---

# Section 3: Stats Panel (deployed.html lines 164-197)

## 3.1 The 4 Stats with Footnotes

| Stat | Value | Footnote | Claim verified against |
|---|---|---|---|
| Pre-screen turnaround | **7 seconds** | ¹ | `dscr-website/deployed.html` line 172; `dscr.js` line 251 (FAQ: "under 7 seconds for a single property") |
| Reduction in lender-eligibility false positives | **99.14%** | ² | `dscr-website/deployed.html` line 178 |
| Investors consolidating to a single DSCR engine | **88%** | ³ | `dscr-website/deployed.html` line 184 |
| Customer retention across active DSCR books | **99%+** | ⁴ | `dscr-website/deployed.html` line 190 |

## 3.2 Citation Status (UNVERIFIED — see Appendix F)

**Critical:** The 4 stat numbers above (7s / 99.14% / 88% / 99%+) are **NOT YET** cited to primary sources in any of the master docs I've audited. They appear in `deployed.html` and `dscr.js` as deployed website copy, but no corresponding footnote content, methodology, or primary-source citation exists in:
- `SOVEREIGN_RESEARCH_REPORT.md`
- `frontier_dscr_strategy_guide.md`
- `dscr_research_v2_rigorous_2026-06-22.md`
- `dscr_frontier_research.csv` or `dscr_wide_research.csv`
- `DSCR_Engine_Master_Specification.md`
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md`
- The 10 SA agent outputs

**Recommendation before publishing:**
- 7 seconds — needs engineering benchmark (internal performance test)
- 99.14% — needs baseline methodology (false-positive rate is matrix-relative, not absolute)
- 88% — needs market source (the closest verifiable claim is Cotality's "small + medium investors drive 2025 growth" per `dscr_research_v2_rigorous_2026-06-22.md` line 159, but 88% is not in that report)
- 99%+ — needs internal retention data

**Action:** Treat all 4 stat numbers as **marketing claims requiring internal evidence package** before they ship with footnotes on the live site. They are currently in the deployed HTML but lack citations.

---

# Section 4: How It Works (5 Tabs — deployed.html lines 199-258)

The "How it works" section is built from 5 tab cards in `dscr.js` lines 83-129 (`stepCards`). Each card has a title, body, visual, and CTA.

## 4.1 Tab 1 — Underwriting Engine (Dual-Track DSCR, by design)

**Title:** Underwriting Engine — Dual-Track DSCR, by design
**Body:** Every property runs through Track 1 (Lender Qualification DSCR on PITIA / ITIA, market rent, no vacancy) and Track 2 (Investor Survival DSCR on actual cash flow with vacancy, management fees, and CapEx). The two tracks never blend — what qualifies you is not always what keeps you alive.
**Visual:** ASCII table showing Track 1 ($3,250 rent, PITIA $2,288, DSCR 1.42 ✅) vs Track 2 ($2,990 rent after 8% vacancy, ITIA + 8% mgmt fee $2,182, DSCR 1.37 ⚠️) → Decision: QUALIFIES — flag margin

**Sources:**
- `dscr-website/server/data/dscr.js` lines 85-91
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` lines 67-79 (Dual-Track DSCR Math)
- `DSCR_Engine_Master_Specification.md` lines 187-216 (DSCR formulas)

## 4.2 Tab 2 — Lender Matching

**Title:** Lender Matching across 60+ non-QM programs
**Body:** Stop running five portals. Greenstreet ingests each lender's matrix and returns ranked matches based on DSCR, FICO, LTV, property type, entity vesting, and reserves. Programs update nightly so your quotes reflect today's pricing, not last quarter's.
**Visual:** Searching 60 programs · 24 active DSCR — ranked list:
1. Cake Mortgage — DSCR≥1.25 / FICO≥680 / LTV≤80%
2. Kiavi — DSCR≥1.20 / FICO≥660 / LTV≤80%
3. Lima One Capital — DSCR≥1.15 / FICO≥660 / LTV≤80%
4. Newfi Wholesale — DSCR≥1.20 / FICO≥680 / LTV≤75%
5. Angel Oak MS — DSCR≥1.15 / FICO≥640 / LTV≤80%
Best fit: Cake Mortgage — 0.25 pts lower

**Sources:**
- `dscr-website/server/data/dscr.js` lines 94-100
- `RESEARCH/ads_targeting/SA2_Lender_Matrix_Approval_Criteria.md` lines 137-189 (20-lender matrix)
- `RESEARCH/ads_targeting/SA5_Credit_Profile_Heat_Map.md` lines 105-126 (per-FICO summary)

## 4.3 Tab 3 — Dual-Track DSCR

**Title:** Dual-Track DSCR — never blend qualification with survival
**Body:** Lender qualification uses the appraiser's market rent with no vacancy deduction — that's Track 1. Investor survival applies vacancy, management fees, maintenance, and CapEx to model real-world cash flow — that's Track 2. Greenstreet always shows both. A deal that passes Track 1 but fails Track 2 qualifies but doesn't perform.
**Visual:** Side-by-side framing — "Lender wants to know: 'Can the rent cover the payment?' Investor needs to know: 'Will the property cash flow after vacancy, fees, and CapEx?'" — Greenstreet answers both — at once.

**Sources:**
- `dscr-website/server/data/dscr.js` lines 103-109
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` line 79: "The Godmode Rule: A deal can PASS Track 1 and FAIL Track 2. The system must state both and require explicit acknowledgment"

## 4.4 Tab 4 — Reserves & Assets

**Title:** Reserves, assets & full borrower profile
**Body:** Personal liquidity, cross-collateral reserves, business funds, gift funds, seasoned seasoning — every reserve source matched to every lender's matrix. Borrower experience tiers (first-time, experienced, FTHB) and entity vesting rules (LLC, partnership, layered LLC up to two layers) are computed automatically.
**Visual:** Reserves Required vs Sourced table — 6 mo PITIA Required $13,728 / Personal Checking $42,500 ✅ / Cross-Collateral (REO) $78,000 ✅ / Business Operating $11,200 ⚠️ seasoning / Gift Funds (allowed) $0 → Total Verified Liquidity $131,500 / Coverage 9.6 mo · STRONG

**Sources:**
- `dscr-website/server/data/dscr.js` lines 112-118
- `DSCR_Loan_Approval_and_Borrower_Profile_Analysis.md` line 145 (reserves 3-6 mo PITIA standard, up to 12 mo for >$2M)
- `RESEARCH/ads_targeting/SA5_Credit_Profile_Heat_Map.md` lines 165-176 (Reserves multiplier table)
- `RESEARCH/ads_targeting/SA7_Self_Employed_Archetypes.md` line 53 (Friction scale 1-5)

## 4.5 Tab 5 — Privacy & Security

**Title:** Enterprise-grade privacy & security
**Body:** Built on a sovereign-by-default architecture. Borrower PII is tokenized at rest, encrypted in transit, and scoped per broker. SOC 2 Type II controls, GLBA-aligned handling, and per-org data isolation — so you can run multiple brokerages without leaking borrowers across books.
**Visual:** Security Posture 2026 — SOC 2 Type II ✅ / GLBA-aligned handling ✅ / PII tokenization at rest ✅ / Per-org data isolation ✅ / OFAC + sanctions screening ✅ / Audit log · every decision ✅

**Sources:**
- `dscr-website/server/data/dscr.js` lines 121-127
- `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md` line 67 (SR 26-02 governance framework)
- `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md` line 156-161 (Canonical data schema with provenance decay)

---

# Section 5: Solutions / Case Studies (3 customer stories — deployed.html lines 261-283)

## 5.1 Customer Story 1 — Vela Capital (Lender · Cake Mortgage partner)

**Eyebrow:** Lender · Cake Mortgage
**Title:** Vela Capital scales 4× without adding underwriting headcount
**Body:** Vela Capital needed to pre-screen 120+ DSCR files a month across 8 brokers. Greenstreet's Dual-Track engine + lender matching cut decision time from 25 minutes to 6 minutes per file — without adding headcount.

**Source:** `dscr-website/public/js/main.js` lines 99-105 (`bundledCaseStudies` array).

**Supporting data (for the website content team):**
- Testimonial 1 in `dscr.js` lines 38-44 (Marcos Vela, Managing Partner, Vela Capital): "Greenstreet surfaced a 1.42 DSCR pass and matched us to three lenders inside 60 seconds. We stopped running parallel Excel models the same week."
- This testimonial matches the hero metric (1.42 DSCR pass) — confirms internal consistency.

## 5.2 Customer Story 2 — Northshore Non-QM (Broker)

**Eyebrow:** Broker · Northshore Non-QM
**Title:** From 2 quotes per loan to 5 — same underwriting team
**Body:** Northshore's brokers now run one file through Greenstreet and see ranked matches across Cake, Kiavi, Lima One, and Newfi. Pipeline visibility went from scattered spreadsheets to a single ledger.

**Source:** `dscr-website/public/js/main.js` lines 106-110.

**Supporting data:**
- Testimonial 4 in `dscr.js` lines 59-64 (Sasha Okafor, Broker Owner, Okafor Wholesale): "Lender matching against Cake, Kiavi, Lima One and Newfi in one screen is the productivity unlock our brokers needed. Quotes per loan went from 2 to 5."
- Quotes per loan 2→5 stat is internally consistent.

## 5.3 Customer Story 3 — Quintero & Co. (Investor)

**Eyebrow:** Investor · Quintero & Co.
**Title:** Killed 3 bad deals before appraisal — saved $14,800 in fees
**Body:** Quintero & Co. use Track 2 to surface real cash-flow risk. Three deals that would have failed post-appraisal were walked away from pre-appraisal, saving over $14,800 in hard cost.

**Source:** `dscr-website/public/js/main.js` lines 111-117.

**Supporting data:**
- Testimonial 6 in `dscr.js` lines 73-79 (Rafael Quintero, Principal, Quintero & Co.): "Foreign national ITIN borrower flow used to take a week. Greenstreet matched us to a specialty lender in under three minutes."
- The $14,800 saved figure should be sourced — currently no internal math; recommend cross-checking against appraisal fee averages ($500-$1,000 for SFR, $1,500+ for multi-family; Quintero case may be 3 SFR × ~$5K all-in = $14.8K ballpark).

## 5.4 All 6 Testimonials (full list from dscr.js)

| Author | Role | Company | Quote | Use Case |
|---|---|---|---|---|
| Marcos Vela | Managing Partner | Vela Capital | 1.42 DSCR pass / 3 lenders in 60s; killed parallel Excel | Broker scaling |
| Priya Ramachandran | Director of Underwriting | Northshore Non-QM | Dual-Track saved deal; Track 2 caught 12% vacancy | Underwriting |
| Devon Larkin | Head of Originations | Larkin Realty Partners | 40+ DSCR files/month; STR legality gate + AirDNA | STR underwriting |
| Sasha Okafor | Broker Owner | Okafor Wholesale | 4 lenders in 1 screen; 2→5 quotes per loan | Broker productivity |
| Beatrice Hahn | Chief Credit Officer | Hahn Capital Markets | Reserves + DSCR stress test sharper than internal policy | Credit risk |
| Rafael Quintero | Principal | Quintero & Co. | Foreign national ITIN flow from 1 week to 3 min | FN/ITIN specialty |

**Source:** `dscr-website/server/data/dscr.js` lines 38-80.

---

# Section 6: Value Items (6 features — deployed.html lines 285-297)

The Value Items section displays 6 features in `dscr.js` lines 132-169. Each has an icon, title, and body.

## 6.1 Feature 1 — Dual-Track DSCR, computed correctly

**Icon:** 🧮
**Body:** Track 1 (Lender Qualification, PITIA, market rent, no vacancy) and Track 2 (Investor Survival, vacancy + mgmt fee + CapEx) — both shown, never blended.

## 6.2 Feature 2 — 60+ non-QM programs, one matrix

**Icon:** 🏦
**Body:** Lender matrices update nightly. DSCR floor, FICO floor, LTV cap, reserve rule, entity policy — matched against your file in seconds.

**Note:** "60+" is marketing. Verified lender count from `RESEARCH/ads_targeting/SA2_Lender_Matrix_Approval_Criteria.md` is **20** active lenders in the production matrix. "60+" likely refers to total non-QM programs (e.g., a single lender may have 3-4 DSCR programs × 20 lenders = ~60+ programs).

## 6.3 Feature 3 — STR legality gate & AirDNA

**Icon:** 🌴
**Body:** STR income is gated by legality. AirDNA Rentalizer with a 20% occupancy haircut, 12-month coverage, market score ≥60, 2-per-bedroom occupancy.

**Sources:**
- `dscr-website/server/data/dscr.js` lines 144-150
- `RESEARCH/ads_targeting/SA10_Compliance_Verifier_Slice.md` lines 60-66 (STR prohibited states)
- `frontier_dscr_strategy_guide.md` line 121: "DSCR lenders in 2026 (Zeitro market survey) explicitly accept AirDNA data as income documentation for STR programs"

## 6.4 Feature 4 — Foreign national & ITIN flow

**Icon:** 🪪
**Body:** Non-QM specialty. Passport + visa/ESTA, OFAC screening, alternative credit (international reports, reference letters, foreign bank statements).

**Sources:**
- `dscr-website/server/data/dscr.js` lines 152-156
- `frontier_dscr_strategy_guide.md` line 439: "Key features that attract HNW international investors include the absence of requirements for US tax returns, US employment verification, US credit history, Social Security Numbers, or US residency/visa for qualification"
- `frontier_dscr_strategy_guide.md` line 456: "Interest Rates (Foreign National DSCR): 7.0-8.5% (as of late 2025), 0.25-0.75% higher than domestic DSCR rates"

## 6.5 Feature 5 — Entity vesting & layered LLCs

**Icon:** 🏢
**Body:** U.S. domestic LLC / partnership / corporation. Up to two layered LLCs with 51% guarantor ownership. Full-recourse personal guarantees.

**Sources:**
- `dscr-website/server/data/dscr.js` lines 158-162
- `RESEARCH/ads_targeting/SA10_Compliance_Verifier_Slice.md` line 66 (NJ LLC = contested per Arc Home LLC guideline)

## 6.6 Feature 6 — Reserves & cross-collateral

**Icon:** 📉
**Body:** 6+ months PITIA. Personal liquidity, business funds (with seasoning), cross-collateral from other REOs, gift funds where allowed.

**Sources:**
- `dscr-website/server/data/dscr.js` lines 164-168
- `RESEARCH/ads_targeting/SA5_Credit_Profile_Heat_Map.md` lines 165-176 (reserves matrix)
- `DSCR_Loan_Approval_and_Borrower_Profile_Analysis.md` line 145

---

[More sections coming in Part 2: Use Cases, FAQ, Blog, Trust Bar, then Appendices]
