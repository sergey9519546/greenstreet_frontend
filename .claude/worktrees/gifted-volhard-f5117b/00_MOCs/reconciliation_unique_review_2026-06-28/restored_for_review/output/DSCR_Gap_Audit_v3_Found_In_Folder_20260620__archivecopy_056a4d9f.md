---
type: deliverable
status: shipped
confidence: 5
title: "DSCR Sovereign OS — Gap Audit v3: Answers Found in Folder"
summary: "**Author:** DSCR Sovereign OS Quant Team **Scope:** Search workspace for answers to 120+ gaps previously identified"
entities:
  - concept/arm
  - concept/cltv
  - concept/dscr
  - concept/io
  - concept/itia
  - concept/ltv
  - concept/pitia
  - data/cotality
  - data/fannie-mae
  - data/fred
  - lender/angel-oak
  - lender/deephaven
  - lender/griffin-funding
  - lender/insula
  - lender/kiavi
  - lender/lima-one
  - lender/newfi
  - lender/ready-capital
  - lender/verus
  - lender/visio-lending
  - math/copula
  - math/t-copula
  - ml/shap
  - ml/xgboost
  - regulation/cfpb
  - regulation/ecoa
  - regulation/hmda
  - regulation/hoepa
  - regulation/reg-b
  - regulation/reg-z
  - regulation/section-1071
  - regulation/tila
  - slice/1
  - sprint/1
  - sprint/2
  - sprint/3
  - sprint/4
  - sprint/5
  - sprint/6
  - tax/1031
  - tax/niit
  - tax/pal
  - topic/2-4-unit
  - topic/condo
  - topic/multifamily
  - topic/non-qm
  - topic/sfr
  - topic/str
tags:
  - concept/io
  - ml/xgboost
  - topic/adverse-action
  - topic/after-tax
  - topic/compliance
  - topic/default-rate
  - topic/ic-memo
  - topic/insurance
  - topic/kill-criteria
  - topic/llpa
  - topic/monte-carlo
  - topic/portfolio
  - topic/ppp
  - topic/reserves
  - topic/short-rate
  - topic/stress-test
  - topic/tax
  - topic/title-insurance
  - type/audit
source: output/DSCR_Gap_Audit_v3_Found_In_Folder_20260620.md
vaulted_at: 2026-06-20
---
# DSCR Sovereign OS — Gap Audit v3: Answers Found in Folder

**Date:** 2026-06-20
**Author:** DSCR Sovereign OS Quant Team
**Scope:** Search workspace for answers to 120+ gaps previously identified

---

## Executive Summary

**Massive find.** The workspace contains ~50 top-level MD files (~3 MB) + 14 godmode domain folders (170 files, 1.1 MB) + ANALYSIS/ (15 files) + RESEARCH/ extractions. **Most of the 120+ "gaps" are actually answered in existing research — they just haven't been transcribed into code.**

Of the original 75 gaps in v1:
- **~30 have complete answers in folder** (citeable primary sources)
- **~25 have partial answers** (need synthesis from 2+ files)
- **~20 are genuine "not yet researched"** (mostly per-diem, NTB, title insurance, recording fees)

Critical gap: the research is **not indexed by code module**. So when we look at Slice 1 code, we don't know that there's a 6-month reserves spec in Sprint 6 Module 1, or a foreign national matrix in Master DSCR Knowledge Section 3.

---

## Found in Folder — Direct Citeable Answers

### Group A: Reserves (12+ questions answered)

| Question | Answer | Source File |
|---|---|---|
| Months of PITIA reserves (standard) | **6 months** (standard), **9 months** (sub-1.0 DSCR), **12 months** (foreign nationals, $2.5M+ loans) | Sprint 0 & 1 Findings, Sprint 6 Module 1, Master DSCR §6 |
| Portfolio drag | +2 months per additional financed property | Master DSCR §6 |
| Reserve waiver | Waived for rate-and-term refi with ≥10% payment savings | Master DSCR §6 |
| Reserve range format | Range (Likely / Conservative / Stress-case), not single number | Master DSCR §6 |
| Crypto as reserves | 0% (volatility/compliance) OR 60% if liquidated to U.S. bank | Master DSCR §6 |

### Group B: Interest-Only / ITIA (8+ questions answered)

| Question | Answer | Source File |
|---|---|---|
| IO product existence | All major DSCR lenders offer 5/1, 7/1, 10/1 ARM with 10-year IO period; also 30-yr fixed IO | Blueprint v3, Sprint 2, AEGIS Complete |
| DSCR formula for IO loans | **Gross Rent / ITIA** (not PITIA) | AEGIS Complete §5.2 |
| ITIA = Interest + Taxes + Insurance + Association (no Principal) | Defined explicitly | AEGIS Complete §5.3 |
| Lender matrix awareness | Some lenders use ITIA, some use PITIA; engine must not assume one | Advisor-Grade Usable Master Spec §5.2 |
| IO period standard | 10 years (most common), 5 years (Kiavi specialty) | Sprint 2 Module 3, Blueprint v3 |
| Fully indexed rate formula | `New_Rate = min(max(SOFR_t + Margin, Floor), min(Current_Rate + Periodic_Cap, Initial_Rate + Lifetime_Cap))` | Sprint 6 Module 3 |
| Qualifying rate for ARM IO | Set to **note rate** (not stress test) per non-QM guidelines | Blueprint v3 §3.5 |
| Post-IO payment shock | "Reset-Safe DSCR" = DSCR after IO expiry / ARM reset | Advisor-Grade Organized Research |

### Group C: Subordinate Financing / CLTV (5+ questions answered)

| Question | Answer | Source File |
|---|---|---|
| CLTV market cap | **75% CLTV is consistent cap** across Angel Oak, Deephaven HELOC, Griffin | Blueprint v3 §3 |
| Second lien product | Angel Oak: $100K-$350K; min FICO 700 for 70% CLTV, **720 FICO for 75% CLTV** | Blueprint v3, Deep Research §2.2 |
| DSCR for combined | Must include second lien P&I in PITIA for DSCR calc | Blueprint v3 |
| Combined LTV formulation | PITIA = first + second lien debt service | Blueprint v3 |
| Deephaven HELOC | Up to $1M, "Equity Advantage HELOC" | Blueprint v3 |

### Group D: Foreign National / ITIN (8+ questions answered)

| Question | Answer | Source File |
|---|---|---|
| FN eligibility | Yes, with passport + visa/ESTA + OFAC screening | Master DSCR §3 |
| POA for FN | **NOT permitted** | Master DSCR §3 |
| U.S. credit required? | No; alternative credit (international reports, reference letters, foreign bank statements) acceptable | Master DSCR §3 |
| ITIN documentation | Valid ITIN card/letter + government photo ID | Master DSCR §3 |
| FN reserves | **12 months** (vs 6 standard) | Master DSCR §6, line 158 |
| FN pricing | +50-150 bps LLPA vs standard; some lenders +25-75 bps | Sprint 3, Feature Engineering Blueprint |
| Market share | 5-10% of DSCR borrowers are FN/ITIN | Research domain_13 |
| Persona details | FN: LLC, 680-720 FICO, 1-3 properties, FL/NY/CA/TX | Research domain_13 |

### Group E: Entity Vesting (10+ questions answered)

| Question | Answer | Source File |
|---|---|---|
| LLC / partnership / corp | Acceptable for business-purpose transactions | Master DSCR §3 |
| Max owners in entity | **4 owners maximum** | Master DSCR §3 |
| Min entity ownership on loan | **25% of entity ownership must be borrowers** | Master DSCR §3 |
| Personal guarantor requirement | Required when lending to entity; **51% cumulative ownership** | Master DSCR §3 |
| Guaranty type | Must be **full recourse** | Master DSCR §3 |
| Layered LLCs | Permitted up to **2 layers** if 51% guarantor at each level | Master DSCR §3 |

### Group F: Experience Tiers (3 tiers answered)

| Tier | Definition | Source |
|---|---|---|
| **Experienced Investor** | Owned ≥1 non-owner-occupied property for ≥12 months in prior 3 years, OR actively employed in property management | Master DSCR §3 |
| **First-Time Investor** | Currently/owned primary residence; this is first investment OR owned <12 months. Requires **12 months verifiable housing payment history** | Master DSCR §3 |
| **First-Time Homebuyer (FTHB)** | Never owned any real property. Eligible for DSCR but requires **rent-free letter** if lacking 12mo rental history | Master DSCR §3 |

### Group G: Credit Requirements (5+ answered)

| Question | Answer | Source |
|---|---|---|
| Credit report date | Within **120 days of note** | Master DSCR §3 |
| Score requirement | Min 2 credit scores; qualifying = lower of 2 or middle of 3 | Master DSCR §3 |
| Tradelines | 3 tradelines/12 months OR 2/24 months; alternative (rent, utilities) allowed | Master DSCR §3 |
| Charge-offs | May be ignored unless **title-impacting** | Master DSCR §3 |
| Forbearance | **Active forbearance plans not permitted** | Master DSCR §3 |

### Group H: Property Types & Collateral (8+ answered)

| Question | Answer | Source |
|---|---|---|
| Eligible types | SFR, 2-4 unit, condo (warrantable + non-warrantable), LTR + STR | Blueprint v3, AEGIS |
| Ineligible | Mobile homes on leased land, co-ops (varies), commercial-only | Master DSCR §4 |
| Condo rules | Warrantable vs non-warrantable; CPA waiver for established projects | Master DSCR §4 |
| Multifamily 5-9 units | Commercial-style underwriting with $250/unit/year replacement reserve | Master DSCR §4, AEGIS |
| Multifamily DSCR formula | **Underwritten NCF / Annual debt service** (per Fannie Mae MF) | AEGIS Complete |
| 1007 STR haircut | MIN(gross x 0.80, LTR_market_rent) — 20% haircut on STR income | Sprint 2, Blueprint |
| 1007 lease vs market | Higher of 1007 market OR lease up to **+20%** allowed | Master DSCR §4 |
| 1007 lease rent | New tenant lease can qualify at **120%** of 1007 market with deposit + first month documented | Master DSCR §4 |

### Group I: Compliance & Regulatory (15+ answered)

| Question | Answer | Source |
|---|---|---|
| ECOA 30-day clock | Adverse action within 30 days of **completed** application | Master Research, Master Synthesis |
| CFPB Circular 2022-03 | Complex algorithm creditors must still provide specific reason codes | Multiple |
| Section 1071 (SMB lending) | Final Rule May 1, 2026; **Jan 1, 2028 compliance**; broker-only EXEMPT; lender-originators covered if ≥100 originations | Sprint 4 |
| HOEPA 2026 thresholds | Loan amount **$27,592**; Points-and-fees **$1,380** (Jan 1, 2027) | DSCR Appendix B, Blueprint v3 |
| TILA Reg Z exemption | $73,400 (real property subject to Reg Z regardless) | DSCR Appendix B |
| QM 3% cap threshold | $137,958 (Jan 1, 2027) | DSCR Appendix B |
| ATR (Ability to Repay) | Even in Non-QM, lenders must make reasonable good-faith determination | Master DSCR §10 |
| LLC Wrapper Trap | Closing in entity does NOT guarantee business-purpose treatment; attestation + evidence required | Master DSCR §10 |
| Business-purpose exemption | DSCR loans are federally business-purpose and typically outside TRID/ATR | Master DSCR §10 |
| State licensing strategy | Phased: broker-only → hybrid → fully licensed direct lender | Master DSCR §10 |
| Fair Lending | Compliance with FHA, ECOA, nondiscrimination mandatory | Master DSCR §10 |
| MN PPP HF3437 | **Enacted April 23, 2026; business-purpose DSCR exempt** | Sprint 0/1 |
| NJ Mansion Tax 2025 | **Seller pays graduated % above $1M**, effective Nov 1, 2025 | Sprint 2 Module 6 |
| FL/OK/CA insurance data | FL $7,136 / OK $5,858; CA projected +16% 2026 | Sprint 4 |
| Insurance kill criterion | Policy deductible >25% of verified reserves = KILL | Sprint 4 |

### Group J: After-Tax Engine (Sprint 6 has full implementation)

| Question | Answer | Source |
|---|---|---|
| After-Tax IRR formula | Full pyxirr-based XIRR engine | Sprint 6 Module 4 (code provided) |
| OBBBA 100% bonus dep | For property acquired after Jan 19, 2025 | Sprint 4 + Sprint 6 |
| §1250 recapture | 25% + 3.8% NIIT at exit | Sprint 6 |
| PAL phase-out | $25K allowance; 50¢/$1 phase-out between $100K-$150K MAGI; **zero at $150K ALL filers** | Sprint 4 + Sprint 6 |
| NIIT thresholds | $250K MFJ / $200K Single — **permanently frozen** (not CPI-indexed) | Sprint 4 |
| 1031 Exchange deadlines | 45-day ID + 180-day close **CONCURRENT**; OBBBA preserved | Sprint 6 Module 5 |
| REP exception | 750 hrs + >50% real property time test eliminates NIIT | Sprint 4 |
| Cost seg election | 30% personal property (5/7yr) accelerated; 70% structural (27.5yr) | Sprint 6 |

### Group K: Risk Management & Stress Testing (10+ answered)

| Question | Answer | Source |
|---|---|---|
| t-copula degrees of freedom | **ν = 5-7** (captures tail dependence) | Sprint 6 Module 2 |
| Correlation matrix (5-factor) | [rent, vacancy, expense, exit_cap, rate] correlations | Sprint 6 Module 2 |
| Monte Carlo trials | 10,000 default | Sprint 6 |
| Multifamily rent volatility | **9.15% - 9.66%** annual std | Deep Research Report |
| STR haircut formula | MIN(gross x 0.80, LTR_market_rent) | Sprint 2 |
| Stress test scenarios | Tax reassessment, vacancy, STR shutdown, reserve depletion, ARM reset, IO recast | Master DSCR §7 |
| Deal kill criteria (16 IMP-06) | LTV, FICO, DSCR, reserves, property type, etc. | v16 master spec |
| LTV thresholds for ECOA | >90% = Code 27; 80-90% = Code 26 | compliance.py |
| FICO kill | <620 = Code 19 | compliance.py |
| Insurance kill | Deductible >25% reserves | Sprint 4 |

### Group L: ARM & Rate Engineering (8+ answered)

| Question | Answer | Source |
|---|---|---|
| Fully indexed rate | `Index + Margin` with caps/floors | Sprint 6 Module 3 |
| ARM reset mechanics | QuantLib bootstrapped SOFR curve (1M, 3M, 6M, 1Y) | Sprint 6 Module 3 |
| Periodic cap | Typically 1-2% per adjustment | Blueprint v3 |
| Lifetime cap | Typically 5-6% above start rate | Blueprint v3 |
| Initial cap | Typically 2% on first adjustment | Blueprint v3 |
| Margin (typical) | 3.5% above SOFR | Blueprint v3 |
| Index | 30-day avg SOFR (NY Fed, free) OR CME Term SOFR (paid license) | Sprint 5 |
| Current SOFR rates | 1M 3.637%, 3M 3.668%, 6M 3.731% | Sprint 5 |

### Group M: Lender Matrix (25+ lenders profiled)

**Found in:**
- Blueprint v3 §3: 6+ lenders detailed
- Sprint 3 Module 2: Securitization pool data + 25+ lenders
- Master DSCR §8: 6 key lenders with profiles

| Lender | Key Specs | Source |
|---|---|---|
| **Deephaven** | Largest non-QM; DSCR second lien $100K-$1M HELOC; sub-1.0 OK | Blueprint v3 |
| **Angel Oak** | Second lien $100K-$350K; min FICO 700/720 for 70%/75% CLTV | Blueprint v3 |
| **Lima One** | Blanket loans (portfolio DSCR); SFR specialist | Domain 11 |
| **Visio** | STR specialist; unique assets (A-frames, rural cabins) | Master DSCR §8 |
| **Kiavi** | Tech-forward; AVM-heavy; rapid closings | Master DSCR §8 |
| **Griffin Funding** | Sub-1.0, no-ratio, jumbo DSCR, micro-condos | Master DSCR §8 |
| **Ready Capital** | Multifamily bridge (5-10 units) | Master DSCR §8 |
| **Newfi** | Non-QM + DSCR + bank statement | Sprint 3 |
| **Insula Capital** | Portfolio DSCR (consolidated underwriting); launched Jun 11, 2026 | Domain 11 |
| **Brokers First Funding** | Cross-collateral 2-25 properties | Domain 11 |
| **Crestmark Lending** | Nationwide DSCR platform | Domain 11 |

### Group N: Market Data (12+ answered)

| Question | Answer | Source |
|---|---|---|
| DSCR market growth | 123% YoY Jan 2024→Jan 2025; $2B+/month Jan 2025 | Sprint 6 Module 1 |
| Q1 2026 DSCR rates | Below 7% for first time since June 2022 | Sprint 6 Module 1 |
| 2026 Non-QM market | ~$200-$250B (Verus outlook), up to $500B in recovery | Blueprint v3 |
| Q1 2026 CMBS DQ | Multifamily 7.15% → 7.71% (Apr) → 7.71% (May) | firecrawl research |
| Q1 2026 Cotality fraud | Index 121 (down from 133); 1/44 IP, 1/29 MF | firecrawl research |
| 2026 multifamily maturities | $160B+ | firecrawl research |
| Office CMBS DQ May 2026 | 11.69% | firecrawl research |
| Living Population Growth | DSCR borrowers 60-70% repeat, 30-40% first-time | domain_13 |
| 6-month reserve standard | Market center, not 3-month | Sprint 6 |
| Sub-1.0 DSCR reserves | 9-month floor for specialist territory | Sprint 6 |
| Fannie SFLP (free data) | 30M+ loans, 20+ years | open_data report |
| FRED API (free data) | DGS10 4.43% Jun 16, 2026; SOFR 3.63%; mortgage30 6.60% | Sprint 5 |

### Group O: Technology Stack (15+ answered)

| Question | Answer | Source |
|---|---|---|
| Backend | Python 3.11+ with FastAPI | Master DSCR §9 |
| Database | PostgreSQL with relational tables | Master DSCR §9 |
| Frontend | Next.js/React with TypeScript, TanStack Table, Recharts | Master DSCR §9 |
| Background jobs | Celery + Redis | Master DSCR §9 |
| Storage | S3-compatible | Master DSCR §9 |
| CI requirements | Golden formulas validation (P&I, IO, PITIA, Track 1/2 DSCR, lower-of-rent, reserves, PPP remaining, pricing solver) | Master DSCR §9 |
| AI Predictor | XGBoost binary classifier with SHAP explainability | Master DSCR §9 |
| Monte Carlo | Copula-GARCH, 10K iterations | Master DSCR §9 |
| Price engine | Optimal Blue PPE integration (via Loansifter for brokers) | Sprint 6 Module 8 |
| IC Memo | reportlab (institutional grade) | Sprint 6 Module 6 |

---

## Genuinely NOT in Folder (Need External Research)

These are **NOT** in the workspace and need to be researched before implementation:

| Gap | Effort | Why Critical |
|---|---|---|
| **Per-diem interest** | 1-2 hours | Standard closing math; not exotic |
| **Net Tangible Benefit (NTB)** | 2-4 hours | QM refi requirement; federally regulated |
| **Title insurance premiums** | 2-3 hours | State-specific schedule (ALTA) |
| **Recording fees (state-specific)** | 2-3 hours | 50-state variation |
| **Transfer taxes** | 2-3 hours | DC, FL, NY mansion tax |
| **Property tax proration** | 1-2 hours | Standard closing math |
| **Hazard insurance proration** | 1-2 hours | Standard closing math |
| **Full ECOA codes 11-30** | 1 hour | 12 CFR 1002 Appendix A |
| **HMDA demographic coding** | 4-6 hours | Reg B Appendix B |
| **Reg Z APR tolerance** | 2-3 hours | 1/8% or 1/4% |
| **STR legality city-by-city** | 4-8 hours | Los Angeles, NYC, etc. |

**Total external research needed:** ~25-40 hours

---

## Self-Critique of This Folder Audit

**What I might still be missing:**

1. **PDFs not yet extracted** — RESEARCH/pdf_extractions/ has 19 files but I haven't scanned them
2. **Godmode domain files** — domain_1 through domain_15 may have lender-specific matrices
3. **Sprint 3 / Sprint 4 / Sprint 5** — additional compliance/insurance/API content I haven't fully indexed
4. **Borrower journey maps** in domain_13 may have FN-specific deal flows
5. **Sprint 1 NN PPP** — 50-state detail may be in there but I didn't fully scan

**Recommendation:** Before implementing ANYTHING, do a 30-min pass on:
- `RESEARCH\pdf_extractions\*.txt` for primary-source data
- `RESEARCH\domain_1\`, `domain_2\`, `domain_11\`, `domain_12\` (lender-specific)
- `RESEARCH\sprint_clean\` (latest sprint output)

This could surface another 20-30 answers I haven't yet captured.

---

## Revised Sprint 1 Scope

Given that **most DSCR domain answers are in folder**, Sprint 1 scope is now MUCH smaller:

### Sprint 1 (3-4 hours): Fix bugs + add 3 missing validation tests

1. **Fix 12 confirmed bugs** in Slice 1 code (silent wrong values)
2. **Add 25-30 validation tests** to lock new validation behavior
3. **Add `reserves_check()`** function — formula exists in folder (6-month standard, 9 sub-1.0, 12 FN)
4. **Add `pi_io()`** function — formula exists in folder (monthly = loan × rate × 1/12 for IO period)
5. **Add ITIA helper** — `itIA = interest + tax + insurance + hoa`

### Sprint 2 (4-6 hours): Production hardening
1. Add LICENSE, CHANGELOG, Dockerfile (template from folder)
2. Add GitHub Actions CI
3. Add coverage threshold
4. Add logging hooks (use existing slice1 patterns)
5. Fix `getcontext().prec = 28` global issue

### Sprint 3 (8-10 hours): Compliance layer
1. Full ECOA codes 11-30 (12 CFR 1002 Appendix A — need external lookup)
2. Section 1071 compliance gate (Jan 1, 2028 deadline from Sprint 4)
3. HOEPA triggers (already have thresholds from DSCR Appendix B)

### Sprint 4 (10-15 hours): Domain expansion
1. 50-state PPP matrix (extract from Sprint 2)
2. Foreign national / ITIN module (extract from Master DSCR §3)
3. Entity vesting / guarantor logic (extract from Master DSCR §3)
4. Subordinate financing / CLTV (extract from Blueprint v3)
5. 5+ unit multifamily DSCR (extract from AEGIS Complete)

---

**Document version:** 1.0 (2026-06-20)
**Major finding:** ~30 of 75 v1 gaps have direct answers in folder; ~25 have partial answers; only ~20 need external research.
**Recommended next:** Sprint 1 = bug fixes + 3 critical features. Pull answers from folder (no new research needed for most).
