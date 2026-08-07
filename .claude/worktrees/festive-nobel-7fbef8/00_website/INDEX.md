---
type: index
status: canonical
title: "Greenstreet Finance — Master Information Index"
summary: "Single entry point to all Greenstreet Finance / Sovereign OS research, organized by PURPOSE so backend data, frontend content, marketing payloads, and compliance research never get mixed up. Each file has its own scope, primary sources, and decision rights."
created: 2026-06-22
author: Mavis (root session mvs_b78f9d32cd6348d6a48278d25e380ca4)
version: v0.1 — restructured 2026-06-22 09:08 PT after user separation request
---

# Greenstreet Finance — Master Information Index

> **Why this exists:** the corpus has 100+ research files. When frontend copy, backend logic, marketing payloads, and compliance research mix in one document, you get hallucinations like "DSCR 0%" or "40% estate tax avoided" — claims that cross-pollinated across categories. This index forces each claim to live in ONE bucket, with ONE primary source.

## The Four Buckets

### 🟦 [FRONTEND_HUB.md](./FRONTEND_HUB.md) — Website copy & visuals
**What it is:** Single source of truth for everything users see on `greenstreetfinance.com`. Hero, stats, How it Works, case studies, value items, use cases, FAQ, blog, trust bar.
**Powers:** `dscr-website/deployed.html`, `public/index.html`, `server/data/dscr.js`, `public/js/main.js`
**Primary sources:** website code itself + verified case files + compliance anchors
**Decision rights:** content team can edit copy; numbers/stats require primary-source citation

### 🟥 [BACKEND_DATA.md](./BACKEND_DATA.md) — Engine logic & calculators
**What it is:** All numerical inputs, formulas, lender matrices, tax engine data, Monte Carlo parameters, capital markets benchmarks that drive the Sovereign OS engine.
**Powers:** `DSCR_SOVEREIGN_OS/packages/dscr-core/` (Python engine code)
**Primary sources:** Pennymac DSCR Profile PDF (verified-primary), Toorak/JPMorgan/CoreVest RMBS filings (verified-primary), 17-lender matrix (verified-secondary), 50-state mill rates (verified-primary)
**Decision rights:** engineering team can edit; numbers must trace to file:line

### 🟩 [MARKETING_ADS.md](./MARKETING_ADS.md) — Campaigns, audiences, copy
**What it is:** Ad hooks (120 V2 hooks), 12 persona specs, 8 edge cases, geo targeting map (50 MSAs), yield scoring, channel allocation, CPL benchmarks.
**Powers:** Meta/Google/LinkedIn/TikTok campaigns, prescreen intake funnel, landing pages
**Primary sources:** SA9 (12 personas), AC09_V2 (120 hooks), GS07 (50 MSAs), TS10 (targeting scoring), SA10-Marketing (yield formula), SA5 (FICO x DSCR heat map)
**Decision rights:** marketing team can iterate; ECOA/Reg B/FHAct compliance gates apply

### 🟨 [COMPLIANCE_OPS.md](./COMPLIANCE_OPS.md) — Regulatory, risk, governance
**What it is:** Regulatory anchors (HOEPA, §1071, ECOA, Reg B, FHAct, state PPP, Meta Housing SAC, SR 26-02), risk register, decline patterns, state-by-state matrices.
**Powers:** compliance engine, risk gates, ad-platform policy compliance, audit trail
**Primary sources:** 12 USC / 12 CFR primary citations, CFPB May 1 2026 Final Rule, 50-state STR matrix, 50-state usury table, 50-state estate tax table
**Decision rights:** compliance team owns; claims require primary-source citation to 12 USC/12 CFR/state statute

---

## Source Files → Bucket Routing

Every research file in the corpus is routed to exactly ONE bucket. Cross-bucket content gets duplicated with explicit cross-references.

### → FRONTEND_HUB
- `dscr-website/deployed.html` (current deployed)
- `dscr-website/public/index.html` (served)
- `dscr-website/server/data/dscr.js` (data)
- `dscr-website/public/js/main.js` (frontend controller)
- `RESEARCH/ads_targeting/SA1_Public_Approval_Case_Files.md` (real approval stories — used as customer story input)
- `SOVEREIGN_RESEARCH_REPORT.md` (Sections 1-7 for content, not math)

### → BACKEND_DATA
- `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md` (engine architecture, formulas)
- `DSCR_Engine_Master_Specification.md` (11 modules, 40+ formulas)
- `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md` (architecture, SR 26-02)
- `DSCR_Underwriting_Engine_Master_Consolidated_v16.md` (v16 engine)
- `DSCR_Underwriting_Engine_v14_Complete_Master_Document.md` (v14 engine)
- `dscr_research_v2_rigorous_2026-06-22.md` (capital markets data)
- `frontier_dscr_strategy_guide.md` (creative financing, cross-border, after-tax, stagflation)
- `RESEARCH/sprints/Sprint_5_-_Live_Data_APIs,_Rate_Anchors,_Property_Tax_Matrix.md` (API specs)
- `RESEARCH/sprints/Sprint_6_-_Computation_Engines,_Monte_Carlo,_After-Tax_IRR.md` (math layer)
- `RESEARCH/ads_targeting/SA2_Lender_Matrix_Approval_Criteria.md` (20 lender matrix)
- `RESEARCH/ads_targeting/SA5_Credit_Profile_Heat_Map.md` (FICO x DSCR heat map)
- `99_attachments/dscr_frontier_research.csv` (113 KB, 8 rows)
- `99_attachments/dscr_wide_research.csv` (69 KB, 10 rows)
- `RESEARCH/domains/domain_12/foreclosure_timeline_by_state.csv`
- `RESEARCH/domains/domain_1/fema_nfhl_zone_lookup_template.csv`
- `RESEARCH/extractions/Build_vs_Buy_API_Dataset_Replacements_v2_2026Q2.md`

### → MARKETING_ADS
- `RESEARCH/ads_targeting/SA9_Ads_Platform_Personas.md` (12 personas, Meta/Google/LinkedIn/TikTok specs)
- `RESEARCH/ads_targeting/SA10_Marketing_Strategy_Slice.md` (yield scoring, 60/25/15 budget)
- `agent_outputs/AC09_V2_ad_copy.md` (120 V2 hooks)
- `agent_outputs/AC09_ad_copy.md` (V1 hooks, archived)
- `agent_outputs/GS07_geo_targeting_map.md` (50 MSAs T1-T5)
- `agent_outputs/TS10_targeting_scoring.md` (yield scoring)
- `agent_outputs/SA05_persona_library.md` (12 personas)
- `agent_outputs/EG06_edge_case_personas.md` (8 edge cases)
- `agent_outputs/NP04_decline_patterns.md` (HEX/FP/SWR patterns)
- `agent_outputs/AP03_approval_patterns.md` (approval clusters)
- `agent_outputs/GL02_normalized_guidelines.md` (lender guidelines normalized)
- `agent_outputs/FF08_prescreen_intake.md` (intake form logic)
- `RESEARCH/ads_targeting/SA7_Self_Employed_Archetypes.md` (15 archetypes)
- `RESEARCH/ads_targeting/SA8_REI_Archetypes.md` (REI archetypes)
- `RESEARCH/ads_targeting/SA3_Unconventional_Personas.md` (unconventional)
- `00_MOCs/TOP_20_PROFILES_20260622.md` (Top 20 highest-yield profiles)

### → COMPLIANCE_OPS
- `RESEARCH/ads_targeting/SA4_compliance_filter_verified.md` (compliance filter)
- `RESEARCH/ads_targeting/SA10_Compliance_Verifier_Slice.md` (compliance slice)
- `RESEARCH/godmode_20260618/12_T12_50state_str_regulation/` (50-state STR)
- `RESEARCH/godmode_20260618/03_T3_math_verification/` (math verification)
- `RESEARCH/godmode_20260618/11_T11_50state_usury/` (50-state usury)
- `RESEARCH/godmode_20260618/13_T13_estate_tax_50state/` (estate tax)
- `RESEARCH/sprints/Sprint_2_-_PPP_State_Matrix,_STR_Legality_Database.md` (40 KB)
- `RESEARCH/sprints/Sprint_3_-_Lender_Intelligence,_Securitization_Pool_Data.md` (43 KB)
- `RESEARCH/sprints/Sprint_0_&_1_Findings.md` (operational findings)
- `RESEARCH/sprints/Sprint_4_-_Full_Tax_Engine,_Insurance_Kill_Criterion.md` (46 KB)

### → NOT FOR SHIPPING (internal research / archives / alternate codenames)
- `AEGIS_DSCR_Complete_Usable_Master_Doc_v3.md` (research codename — DO NOT use externally)
- `AEGIS_DSCR_Algorithm_Gap_Upgrade_Pack.md` (research artifact)
- `20X DSCR Deal Engine` references in research papers (paper name, not product)
- `Advisor_Grade_DSCR_Decision_Engine*` (alternate codename)
- `RESEARCH/sprint_short/` (older shorter versions — superseded by RESEARCH/sprints/)
- `RESEARCH/_archive/sprint_clean/` (old archive copies)
- `01_research_notes/` (vault copies — canonical is workspace root)
- `Master DSCR Knowledge Document.md` (superseded by SOVEREIGN_RESEARCH_REPORT.md)
- `DSCR SOVEREIGN OPERATING SYSTEM_ THE MASTER BLUEPRINT.md` (superseded by v3)
- `DSCR Sovereign OS  Live Research Execution - Sprint 0 & 1 Findings.md` (superseded by RESEARCH/sprints/ versions)
- `DSCR_Appendix_B_Research_Resolution_Report.md` (audit artifact)
- `DSCR_Blueprint_Verification_Corrections_Log.md` (audit artifact)
- `DSCR Forumals.md` (typo in filename, partial content)

---

## Author's Guarantee

**I commit to writing every claim in these four files with the strongest primary source available:**

1. **Tier 1 primary sources** (12 USC, 12 CFR, Federal Register, state statutes, federal agency filings) — used as-is, cited to specific section/subsection
2. **Tier 2 verified-primary** (lender official rate sheets, RMBS filings, government datasets) — cited to file:line and date
3. **Tier 3 verified-secondary** (corroborated across 2+ sources, corpus-validated) — cited with confidence band
4. **Tier 4 market-pattern** (industry consensus, forum reports) — flagged as UNVERIFIED with confidence note

**Claims I will NOT make:**
- "99.14% reduction in false positives" — UNVERIFIED, no methodology in corpus
- "88% consolidating to single engine" — UNVERIFIED, no source
- "99%+ customer retention" — UNVERIFIED, no internal data
- Any "guaranteed approval" or "easy approval" — banned by AC09_V2 G-1

**When I don't have the right source, I will:**
- Mark UNVERIFIED with `[NEEDS SOURCE]` flag
- Recommend what source would resolve it
- NOT default to a marketing-page number

**When sources conflict, I will:**
- Cite both
- Pick the more conservative / better-sourced one
- Flag the discrepancy in `RISK_REGISTER.md`

— Mavis, 2026-06-22 09:08 PT
