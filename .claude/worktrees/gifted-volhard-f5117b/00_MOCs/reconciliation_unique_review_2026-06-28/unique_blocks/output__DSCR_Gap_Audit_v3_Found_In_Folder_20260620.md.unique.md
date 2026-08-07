# Unique Content Review

- Source path: output/DSCR_Gap_Audit_v3_Found_In_Folder_20260620.md
- Archived path: 99_attachments/generated_archive_2026-06-28/p1_generated_stale_2026-06-28/output/DSCR_Gap_Audit_v3_Found_In_Folder_20260620.md
- Replacement path: docs/research/operational/DSCR_Blueprint_Verification_Corrections_Log.md
- Coverage decision: HIGH_RISK_RESTORE_OR_EXTRACT
- Block coverage: 0
- Unique words: 2506
- Preliminary classification: GENERATED_ARTIFACT_RETAIN_ARCHIVE
- Review copy: 00_MOCs\reconciliation_unique_review_2026-06-28\restored_for_review\output\DSCR_Gap_Audit_v3_Found_In_Folder_20260620.md

## Unique Headings
- # DSCR Sovereign OS — Gap Audit v3: Answers Found in Folder
- ## Executive Summary
- ## Found in Folder — Direct Citeable Answers
- ### Group A: Reserves (12+ questions answered)
- ### Group B: Interest-Only / ITIA (8+ questions answered)
- ### Group C: Subordinate Financing / CLTV (5+ questions answered)
- ### Group D: Foreign National / ITIN (8+ questions answered)
- ### Group E: Entity Vesting (10+ questions answered)
- ### Group F: Experience Tiers (3 tiers answered)
- ### Group G: Credit Requirements (5+ answered)
- ### Group H: Property Types & Collateral (8+ answered)
- ### Group I: Compliance & Regulatory (15+ answered)
- ### Group J: After-Tax Engine (Sprint 6 has full implementation)
- ### Group K: Risk Management & Stress Testing (10+ answered)
- ### Group L: ARM & Rate Engineering (8+ answered)
- ### Group M: Lender Matrix (25+ lenders profiled)
- ### Group N: Market Data (12+ answered)
- ### Group O: Technology Stack (15+ answered)
- ## Genuinely NOT in Folder (Need External Research)
- ## Self-Critique of This Folder Audit
- ## Revised Sprint 1 Scope
- ### Sprint 1 (3-4 hours): Fix bugs + add 3 missing validation tests
- ### Sprint 2 (4-6 hours): Production hardening
- ### Sprint 3 (8-10 hours): Compliance layer
- ### Sprint 4 (10-15 hours): Domain expansion

## First Unique Blocks

### Block 1
```text
--- type: deliverable status: shipped confidence: 5 title: "DSCR Sovereign OS — Gap Audit v3: Answers Found in Folder" summary: "**Author:** DSCR Sovereign OS Quant Team **Scope:** Search workspace for answers to 120+ gaps previously identified" entities: - concept/arm - concept/cltv - concept/dscr - concept/io - concept/itia - concept/ltv - concept/pitia - data/cotality - data/fannie-mae - data/fred - lender/angel-oak - lender/deephaven - lender/griffin-funding - lender/insula - lender/kiavi - lender/lima-one - lender/newfi - lender/ready-capital - lender/verus - lender/visio-lending - math/copula - math/t-copula - ml/shap - ml/xgboost - regulation/cfpb - regulation/ecoa - regulation/hmda - regulation/hoepa - regulation/reg-b - regulation/reg-z - regulation/section-1071 - regulation/tila - slice/1 - sprint/1 - sprint/2 - sprint/3 - sprint/4 - sprint/5 - sprint/6 - tax/1031 - tax/niit - tax/pal - topic/2-4-unit - topic/condo - topic/multifamily - topic/non-qm - topic/sfr - topic/str tags: - concept/io - ml/xgboost - topic/adverse-action - topic/after-tax - topic/compliance - topic/default-rate - topic/ic-memo - topic/insurance - topic/kill-criteria - topic/llpa - topic/monte-carlo  ... [truncated]
```

### Block 2
```text
**Date:** 2026-06-20 **Author:** DSCR Sovereign OS Quant Team **Scope:** Search workspace for answers to 120+ gaps previously identified
```

### Block 3
```text
## Executive Summary
```

### Block 4
```text
**Massive find.** The workspace contains ~50 top-level MD files (~3 MB) + 14 godmode domain folders (170 files, 1.1 MB) + ANALYSIS/ (15 files) + RESEARCH/ extractions. **Most of the 120+ "gaps" are actually answered in existing research — they just haven't been transcribed into code.**
```

### Block 5
```text
Of the original 75 gaps in v1: - **~30 have complete answers in folder** (citeable primary sources) - **~25 have partial answers** (need synthesis from 2+ files) - **~20 are genuine "not yet researched"** (mostly per-diem, NTB, title insurance, recording fees)
```

### Block 6
```text
Critical gap: the research is **not indexed by code module**. So when we look at Slice 1 code, we don't know that there's a 6-month reserves spec in Sprint 6 Module 1, or a foreign national matrix in Master DSCR Knowledge Section 3.
```

### Block 7
```text
## Found in Folder — Direct Citeable Answers
```

### Block 8
```text
### Group A: Reserves (12+ questions answered)
```

### Block 9
```text
| Question | Answer | Source File | |---|---|---| | Months of PITIA reserves (standard) | **6 months** (standard), **9 months** (sub-1.0 DSCR), **12 months** (foreign nationals, $2.5M+ loans) | Sprint 0 & 1 Findings, Sprint 6 Module 1, Master DSCR §6 | | Portfolio drag | +2 months per additional financed property | Master DSCR §6 | | Reserve waiver | Waived for rate-and-term refi with ≥10% payment savings | Master DSCR §6 | | Reserve range format | Range (Likely / Conservative / Stress-case), not single number | Master DSCR §6 | | Crypto as reserves | 0% (volatility/compliance) OR 60% if liquidated to U.S. bank | Master DSCR §6 |
```

### Block 10
```text
### Group B: Interest-Only / ITIA (8+ questions answered)
```

### Block 11
```text
| Question | Answer | Source File | |---|---|---| | IO product existence | All major DSCR lenders offer 5/1, 7/1, 10/1 ARM with 10-year IO period; also 30-yr fixed IO | Blueprint v3, Sprint 2, AEGIS Complete | | DSCR formula for IO loans | **Gross Rent / ITIA** (not PITIA) | AEGIS Complete §5.2 | | ITIA = Interest + Taxes + Insurance + Association (no Principal) | Defined explicitly | AEGIS Complete §5.3 | | Lender matrix awareness | Some lenders use ITIA, some use PITIA; engine must not assume one | Advisor-Grade Usable Master Spec §5.2 | | IO period standard | 10 years (most common), 5 years (Kiavi specialty) | Sprint 2 Module 3, Blueprint v3 | | Fully indexed rate formula | `New_Rate = min(max(SOFR_t + Margin, Floor), min(Current_Rate + Periodic_Cap, Initial_Rate + Lifetime_Cap))` | Sprint 6 Module 3 | | Qualifying rate for ARM IO | Set to **note rate** (not stress test) per non-QM guidelines | Blueprint v3 §3.5 | | Post-IO payment shock | "Reset-Safe DSCR" = DSCR after IO expiry / ARM reset | Advisor-Grade Organized Research |
```

### Block 12
```text
### Group C: Subordinate Financing / CLTV (5+ questions answered)
```

### Block 13
```text
| Question | Answer | Source File | |---|---|---| | CLTV market cap | **75% CLTV is consistent cap** across Angel Oak, Deephaven HELOC, Griffin | Blueprint v3 §3 | | Second lien product | Angel Oak: $100K-$350K; min FICO 700 for 70% CLTV, **720 FICO for 75% CLTV** | Blueprint v3, Deep Research §2.2 | | DSCR for combined | Must include second lien P&I in PITIA for DSCR calc | Blueprint v3 | | Combined LTV formulation | PITIA = first + second lien debt service | Blueprint v3 | | Deephaven HELOC | Up to $1M, "Equity Advantage HELOC" | Blueprint v3 |
```

### Block 14
```text
### Group D: Foreign National / ITIN (8+ questions answered)
```

### Block 15
```text
| Question | Answer | Source File | |---|---|---| | FN eligibility | Yes, with passport + visa/ESTA + OFAC screening | Master DSCR §3 | | POA for FN | **NOT permitted** | Master DSCR §3 | | U.S. credit required? | No; alternative credit (international reports, reference letters, foreign bank statements) acceptable | Master DSCR §3 | | ITIN documentation | Valid ITIN card/letter + government photo ID | Master DSCR §3 | | FN reserves | **12 months** (vs 6 standard) | Master DSCR §6, line 158 | | FN pricing | +50-150 bps LLPA vs standard; some lenders +25-75 bps | Sprint 3, Feature Engineering Blueprint | | Market share | 5-10% of DSCR borrowers are FN/ITIN | Research domain_13 | | Persona details | FN: LLC, 680-720 FICO, 1-3 properties, FL/NY/CA/TX | Research domain_13 |
```

### Block 16
```text
### Group E: Entity Vesting (10+ questions answered)
```

### Block 17
```text
| Question | Answer | Source File | |---|---|---| | LLC / partnership / corp | Acceptable for business-purpose transactions | Master DSCR §3 | | Max owners in entity | **4 owners maximum** | Master DSCR §3 | | Min entity ownership on loan | **25% of entity ownership must be borrowers** | Master DSCR §3 | | Personal guarantor requirement | Required when lending to entity; **51% cumulative ownership** | Master DSCR §3 | | Guaranty type | Must be **full recourse** | Master DSCR §3 | | Layered LLCs | Permitted up to **2 layers** if 51% guarantor at each level | Master DSCR §3 |
```

### Block 18
```text
### Group F: Experience Tiers (3 tiers answered)
```

### Block 19
```text
| Tier | Definition | Source | |---|---|---| | **Experienced Investor** | Owned ≥1 non-owner-occupied property for ≥12 months in prior 3 years, OR actively employed in property management | Master DSCR §3 | | **First-Time Investor** | Currently/owned primary residence; this is first investment OR owned <12 months. Requires **12 months verifiable housing payment history** | Master DSCR §3 | | **First-Time Homebuyer (FTHB)** | Never owned any real property. Eligible for DSCR but requires **rent-free letter** if lacking 12mo rental history | Master DSCR §3 |
```

### Block 20
```text
### Group G: Credit Requirements (5+ answered)
```

### Block 21
```text
| Question | Answer | Source | |---|---|---| | Credit report date | Within **120 days of note** | Master DSCR §3 | | Score requirement | Min 2 credit scores; qualifying = lower of 2 or middle of 3 | Master DSCR §3 | | Tradelines | 3 tradelines/12 months OR 2/24 months; alternative (rent, utilities) allowed | Master DSCR §3 | | Charge-offs | May be ignored unless **title-impacting** | Master DSCR §3 | | Forbearance | **Active forbearance plans not permitted** | Master DSCR §3 |
```

### Block 22
```text
### Group H: Property Types & Collateral (8+ answered)
```

### Block 23
```text
| Question | Answer | Source | |---|---|---| | Eligible types | SFR, 2-4 unit, condo (warrantable + non-warrantable), LTR + STR | Blueprint v3, AEGIS | | Ineligible | Mobile homes on leased land, co-ops (varies), commercial-only | Master DSCR §4 | | Condo rules | Warrantable vs non-warrantable; CPA waiver for established projects | Master DSCR §4 | | Multifamily 5-9 units | Commercial-style underwriting with $250/unit/year replacement reserve | Master DSCR §4, AEGIS | | Multifamily DSCR formula | **Underwritten NCF / Annual debt service** (per Fannie Mae MF) | AEGIS Complete | | 1007 STR haircut | MIN(gross x 0.80, LTR_market_rent) — 20% haircut on STR income | Sprint 2, Blueprint | | 1007 lease vs market | Higher of 1007 market OR lease up to **+20%** allowed | Master DSCR §4 | | 1007 lease rent | New tenant lease can qualify at **120%** of 1007 market with deposit + first month documented | Master DSCR §4 |
```

### Block 24
```text
### Group I: Compliance & Regulatory (15+ answered)
```

### Block 25
```text
| Question | Answer | Source | |---|---|---| | ECOA 30-day clock | Adverse action within 30 days of **completed** application | Master Research, Master Synthesis | | CFPB Circular 2022-03 | Complex algorithm creditors must still provide specific reason codes | Multiple | | Section 1071 (SMB lending) | Final Rule May 1, 2026; **Jan 1, 2028 compliance**; broker-only EXEMPT; lender-originators covered if ≥100 originations | Sprint 4 | | HOEPA 2026 thresholds | Loan amount **$27,592**; Points-and-fees **$1,380** (Jan 1, 2027) | DSCR Appendix B, Blueprint v3 | | TILA Reg Z exemption | $73,400 (real property subject to Reg Z regardless) | DSCR Appendix B | | QM 3% cap threshold | $137,958 (Jan 1, 2027) | DSCR Appendix B | | ATR (Ability to Repay) | Even in Non-QM, lenders must make reasonable good-faith determination | Master DSCR §10 | | LLC Wrapper Trap | Closing in entity does NOT guarantee business-purpose treatment; attestation + evidence required | Master DSCR §10 | | Business-purpose exemption | DSCR loans are federally business-purpose and typically outside TRID/ATR | Master DSCR §10 | | State licensing strategy | Phased: broker-only → hybrid → fully licensed direct lender | Mast ... [truncated]
```

### Block 26
```text
### Group J: After-Tax Engine (Sprint 6 has full implementation)
```

### Block 27
```text
| Question | Answer | Source | |---|---|---| | After-Tax IRR formula | Full pyxirr-based XIRR engine | Sprint 6 Module 4 (code provided) | | OBBBA 100% bonus dep | For property acquired after Jan 19, 2025 | Sprint 4 + Sprint 6 | | §1250 recapture | 25% + 3.8% NIIT at exit | Sprint 6 | | PAL phase-out | $25K allowance; 50¢/$1 phase-out between $100K-$150K MAGI; **zero at $150K ALL filers** | Sprint 4 + Sprint 6 | | NIIT thresholds | $250K MFJ / $200K Single — **permanently frozen** (not CPI-indexed) | Sprint 4 | | 1031 Exchange deadlines | 45-day ID + 180-day close **CONCURRENT**; OBBBA preserved | Sprint 6 Module 5 | | REP exception | 750 hrs + >50% real property time test eliminates NIIT | Sprint 4 | | Cost seg election | 30% personal property (5/7yr) accelerated; 70% structural (27.5yr) | Sprint 6 |
```

### Block 28
```text
### Group K: Risk Management & Stress Testing (10+ answered)
```

### Block 29
```text
| Question | Answer | Source | |---|---|---| | t-copula degrees of freedom | **ν = 5-7** (captures tail dependence) | Sprint 6 Module 2 | | Correlation matrix (5-factor) | [rent, vacancy, expense, exit_cap, rate] correlations | Sprint 6 Module 2 | | Monte Carlo trials | 10,000 default | Sprint 6 | | Multifamily rent volatility | **9.15% - 9.66%** annual std | Deep Research Report | | STR haircut formula | MIN(gross x 0.80, LTR_market_rent) | Sprint 2 | | Stress test scenarios | Tax reassessment, vacancy, STR shutdown, reserve depletion, ARM reset, IO recast | Master DSCR §7 | | Deal kill criteria (16 IMP-06) | LTV, FICO, DSCR, reserves, property type, etc. | v16 master spec | | LTV thresholds for ECOA | >90% = Code 27; 80-90% = Code 26 | compliance.py | | FICO kill | <620 = Code 19 | compliance.py | | Insurance kill | Deductible >25% reserves | Sprint 4 |
```

### Block 30
```text
### Group L: ARM & Rate Engineering (8+ answered)
```
