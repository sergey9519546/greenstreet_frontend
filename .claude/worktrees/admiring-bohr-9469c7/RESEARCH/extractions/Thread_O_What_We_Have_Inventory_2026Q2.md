---
type: synthesis
status: drafted
title: "Thread O: What We Have Inventory 2026 Q2"
summary: "Consolidated inventory of what the corpus has. One-stop reference for PMs + engineers. Cross-referenced with TOP_20_PROFILES_20260622.md."
created: 2026-06-22
vaulted_at: 2026-06-22
author: Mavis (root session mvs_b78f9d32cd6348d6a48278d25e380ca4)
---

# Thread O — Complete Inventory ("What We Have")

**Date:** 2026-06-21
**Author:** Mavis (research-mode, no code)
**Status:** Final draft
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\_obsidian_vault\_research\extractions\Thread_O_What_We_Have_Inventory_2026Q2.md`

---

## 0. Why this thread exists

User asked: "stop all the next crons and collect/organize all the information you found. and lets figure out what we have."

This thread is the comprehensive inventory. It maps every artifact, every research thread, every shipped product, and every open decision so the user can see exactly what we have and decide what's next.

---

## 1. Crons status (post-cleanup)

| Cron | Schedule | Status | Last run | Note |
|---|---|---|---|---|
| `dscr-ultrathink-loop` | every 30m | **DELETED 2026-06-21 14:43 PT** | — | Was producing progress tags since 18:30 PT 2026-06-20 |
| `v2-sub1-sub7-poll` | every 15m | **DELETED 2026-06-21 14:04 PT** | — | Sub-thread 1 dropped; sub-thread 7 on disk |
| `hoepa-thresholds` | Dec 5, 2026 14:00 PT | DISABLED | never run | Scheduled (will fire on Dec 5) |

**Total active crons:** 0. System is fully under manual control.

---

## 2. Research artifacts (organized)

### 2.1 Today (2026-06-20 → 2026-06-21): 10 new research threads

| Thread | Title | Size | Disposition |
|---|---|---|---|
| E | AI/ML Production Reality Audit | 22.3 KB | ✓ Shipped |
| F | AGPL-3.0 Tier 4 SaaS Exposure | 18.4 KB | ✓ Shipped |
| G | LendingPad vs Encompass DSCR Deep-Dive | 12.4 KB | ✓ Shipped |
| H | OGC §1071 Broker-Exempt Interpretation | 13.6 KB | ✓ Shipped |
| I | Pilot Broker Profile + Wholesale Channel | 14.1 KB | ✓ Shipped |
| J | v0.5.6 Ship Spec | 11.3 KB | ✓ Shipped |
| K | Insula Sales Call Prep (Jul 11) | 12.2 KB | ✓ Shipped |
| L | Pilot Broker Outreach Playbook | 11.4 KB | ✓ Shipped |
| M | Tier 4 v1 SaaS Pricing Model | 12.6 KB | ✓ Shipped |
| N | Work Audit + 20-Step Plan | ~9 KB | ✓ Shipped |

**Total new content today: ~138 KB of primary-source-cited research**

### 2.2 Prior session (2026-06-20): synthesis + verifier outputs

| Artifact | Title | Size | Source |
|---|---|---|---|
| Master_Plan_v11_2026Q2.md | Master Plan v11.1 (updated 14:04 PT) | 24.2 KB | Thread D synthesis |
| Thread_D_Master_Plan_v11_Outline.md | Master Plan v11 Outline (retired) | 11.1 KB | Thread D precursor |
| Build_vs_Buy_API_Dataset_Replacements_2026Q2.md | Major Build-vs-Buy v1 (14 API categories) | varies | Major Thread v1 |
| Build_vs_Buy_API_Dataset_Replacements_v2_2026Q2.md | Major Build-vs-Buy v2 (5 sub-threads) | 40.6 KB | Major Thread v2 |
| Tier4_DeepDive_2026Q2.md | Tier 4 Deep-Dive (5 sub-deliverables) | varies | Thread B supplement |
| Regulatory_Front_Watch_20260620.md | 2027 HOEPA + §1071 helpers v0.5.6 spec | varies | Thread C precursor |
| research_tier4_architecture_20260620.md | Tier 4 architecture (verifier output) | 456 lines | Thread B |
| research_regulatory_frontier_20260620.md | Regulatory frontier (verifier output) | 391 lines | Thread C |
| EMPIRICAL_REFRESH_2026Q2.md | Empirical calibration (Thread A) | varies | Thread A |
| DSCR_dscr_core_v055_Ship_Memo_20260620.md | v0.5.5 ship memo | varies | v0.5.5 ship |

### 2.3 v2 sub-thread outputs (scratchpad → vault)

| Sub-thread | Title | Size | Status |
|---|---|---|---|
| 2 (pricing_appraisal_mers) | Pricing engines + appraisal + MERS | 24.7 KB | ✓ Synthesized |
| 3 (credit_decisioning_ai) | Credit decisioning AI + OSS stack | 42.8 KB | ✓ Synthesized |
| 4 (title_tax_condition) | Title + IRS 4506-C + property condition | 41.4 KB | ✓ Synthesized |
| 5 (core_infrastructure) | Core infrastructure OSS stack | 55.5 KB | ✓ Synthesized |
| 6 (oss_not_viable_gsa) | OSS-not-viable + GSA + free-tier | 40.6 KB | ✓ Synthesized |
| 7 (hidden_datasets) | Hidden / obscure datasets | 34.9 KB | ✅ INTEGRATED 2026-06-21 (Major Thread v2 v2.1 §7) |
| 1 (insurance_climate) | Property insurance + climate | 14.5 KB | ✅ INTEGRATED 2026-06-21 (Major Thread v2 v2.1 §6 — Mavis-authored from verifier todos; NOT independently dscr-verifier-audited — flagged for user audit if needed) |

### 2.4 Domains corpus (14 domain folders, deeper than extractions)

```
_obsidian_vault/_research/domains/
├── domain_1/  RESEARCH_DOMAIN_1_INSURANCE
├── domain_2/  RESEARCH_DOMAIN_2_STATE_REG
├── domain_3/  RESEARCH_DOMAIN_3_LENDER (24+ lender profiles: Acra, AD Mortgage, Angel Oak, CrossCountry, Deephaven, Defy, Easy Street, Griffin, Insula, Kiavi, Lima One, Newfi, New Silver, OCMBC, Pennymac, Ready Capital, Rocket Pro TPO, UWM, Visio, etc.)
├── domain_4/  RESEARCH_DOMAIN_4_PPE_APP
├── domain_5/  RESEARCH_DOMAIN_5_CALIBRATION (includes EMPIRICAL_REFRESH_2026Q2)
├── domain_6/  RESEARCH_DOMAIN_6_STR
├── domain_7/  RESEARCH_DOMAIN_7_CAPITAL
├── domain_8/  RESEARCH_DOMAIN_8_INSURANCE
├── domain_9/  RESEARCH_DOMAIN_9_TAX
├── domain_10/ RESEARCH_DOMAIN_10_1031
├── domain_11/ RESEARCH_DOMAIN_11_PORT
├── domain_12/ RESEARCH_DOMAIN_12_LGD
├── domain_13/ RESEARCH_DOMAIN_13_BORROWER (includes borrower_journey_map)
└── domain_14/ RESEARCH_DOMAIN_14_ADVERSE
```

**24+ lender profiles** = pilot broker candidate source pool + competitive intel.

### 2.5 Corrupt context (raw deep research, not yet curated)

```
DSCR LOAN OFFICE/  (spaced workspace)
├── 80+ .md / .pdf files at top level
├── DSCR_Sovereign_OS_ Sprint 0/1/2/3/4/5/6
├── DSCR_Sovereign_OS_ Definitive Master Research Report
├── DSCR_SOVEREIGN_OS_ MASTER RESEARCH SYNTHESIS
├── DSCR_Sovereign_OS_ THE DEFINITIVE PRODUCT SPECIFICATION
├── Godmode Research Plan, Live Research Execution, etc.
├── AEGIS / Beyond Rulebook / From Black Box to Glass Box / From Policy to Profit / Beyond DSCR (6+ research output PDFs/txt)
├── pdfs/ (subfolder)
├── DSCR_Sovereign_OS___Non_QM_Wholesale_Lender__The_Definitive_Master_Research_Report.md
└── audit_reports (v0.5.1, v0.5.2, v0.5.3, v0.6.0 monte carlo, vinecop)
```

This is the raw research dump that preceded the structured vault. Not actively used but provides historical context.

### 2.6 Shipped code (in DSCR_LOAN OFFICE/DSCR_SOVEREIGN_OS/)

```
DSCR_SOVEREIGN_OS/packages/dscr-core/
├── src/dscr_core/
│   ├── compliance.py (v0.5.5, §1071 threshold fix + 4 helpers planned for v0.5.6)
│   ├── state_matrix.py (v0.1.0)
│   ├── dscr.py
│   ├── leverage.py
│   ├── ltv.py
│   ├── payment.py
│   ├── tax.py (v0.5.4 IRC §168/§1250/§469/§1411)
│   └── portfolio_aggregation_model.py
├── tests/
└── pyproject.toml (version 0.5.5)
```

**Test status:** 508/508 dscr-core + 191/191 dscr-stress tests pass (post v0.5.5).

---

## 3. Master Plan v11.1 status (post-update)

### Decisions resolved (2 of 6)
- ✅ **LendingPad for v1 LOS** (Thread G): 3-yr TCO $26K-$83K vs Encompass $245K-$980K
- ✅ **Tier 4 v1 pricing model** (Thread M): 3 tiers (Starter $15K / Pro $30K / Enterprise $50K-$100K); Year 1 $250K-$400K realistic

### Decisions unresolved (4 of 6)
- ⏳ **v0.5.6 scope** (Thread J): 6 open questions — HOEPA 2027 projection, 4 §1071 helpers, 12-test matrix, ship standard, target timing
- ⏳ **v0.6.0 timing**: tax + MC + after-tax (currently deferred per research-mode directive)
- ~~⏳ **Insula sales call Jul 11, 2026**~~ — REMOVED per user 2026-06-21 (Thread K DEPRECATED). 5 questions moot.
- ⏳ **First 5 pilot broker partners** (Thread I + L): 6 open questions — funnel targets, templates, MoU terms, tooling budget, internal ownership, success metrics

### v0.5.6 implementation pipeline (per Thread J)
- HOEPA 2027: $28,226 / $1,412 (projected, +2.3% CPI from 2026 actuals)
- 4 new §1071 helpers: is_merchant_cash_advance, is_agricultural_loan, is_small_dollar_business_credit, **is_last_decision_maker** (the explicit fix for v0.5.5 broker-exempt gap)
- 12-test acceptance matrix defined
- Ship target: ~2 weeks after Dec 15, 2026 HOEPA publication

### Year 1 revenue projection
- Per Master Plan v11 §3 + Thread M: $500K-$1M target
- Realistic scenario: $250K-$400K total ($185K-$235K ARR + $125K-$175K one-time implementation)
- Stretch scenario: $455K total ($255K ARR + $200K one-time)

---

## 4. Customer pipeline (per Threads I, K, L)

### 5 pilot broker placeholders
1. **LoanStream Wholesale** top broker partner (CA-based, 500-1K loans/yr) — #1 Non-QM wholesale lender
2. **Angel Oak** broker channel partner (multi-state, 200-500 non-QM/yr)
3. **Independent DSCR-focused brokerage** (FL or TX, 100-300 DSCR/yr)
4. **CrossCountry Mortgage** broker network (national, 700+ branches)
5. **New American Funding** broker division (CA-heavy, 200-500 non-QM/yr)

### Enterprise target
- 12-question checklist + 4 talking points ready (Thread K)

### Outreach economics
- Acquisition cost: $0 (D4=Lean, LinkedIn free only per user 2026-06-21)
- Year 1 ROI: 2.5-5x
- Conversion target: 30% (industry benchmark 20-40%)

---

## 5. Open audit / compliance items (per Thread N)

### v0.5.6 HOEPA 2027
- Dec 15, 2026 Federal Register watch scheduled (via `hoepa-thresholds` cron, currently disabled)
- Pre-populated values: $28,226 / $1,412 (projection; actuals to be verified when published)

### §1071 May 2026 Final Rule
- Primary-source verification of "broker-only not covered FI" language needed
- May 1, 2026 Final Rule (Federal Register 2026-08494) substantially revised subpart B
- Litigation context: 2024 stayed all compliance deadlines; U.S. Supreme Court ruled May 16, 2024; 2025 interim final rule extended deadlines

### AGPL-3.0 risk
- 4 components in original stack: Documenso, Twenty CRM, OpenSign, EspoCRM
- Thread F recommendation: REPLACE with non-AGPL alternatives (HelloSign, SuiteCRM, Cloudflare R2)
- 2 components mis-flagged in prior memory: Aequitas + Fairlearn are MIT, not AGPL
- Cost: $20-60K/yr (replacement) vs $40-220K/yr (commercial licenses)

### Memory lessons (4 entries from this session)
- OSS license verify-before-claim
- AGPL §13 entity-status clarification
- mavis JSON spawn pattern (pre-existing)
- Async cron coordination patterns (pre-existing)

---

## 6. Volume statistics

| Metric | Count |
|---|---|
| Research threads today | 10 (E-N) |
| Research threads prior session | 8 (A, B, C, plus 5 v2 sub-threads) |
| Sub-threads total | 7 (1 dropped, 5 synthesized, 1 on disk) |
| Lender profiles (corpus) | 24+ |
| Domain research docs (corpus) | 14 folders |
| Raw research dump (DSCR LOAN OFFICE) | 80+ .md/.pdf files |
| Shipped code packages | 1 (dscr-core v0.5.5) |
| Cron infrastructure | 0 active |
| Verifier outputs (B, C) | 2 (456 + 391 lines) |
| Master plan documents | 2 (Master Plan v11.1 + Thread D outline retired) |
| Open decisions | 4 of 6 unresolved |
| Open questions across threads | ~21 (J: 6, K: 5, L: 6, M: 6, plus H/E misc) |

---

## 7. Strategic positioning summary

**The DSCR Sovereign OS is positioned as:**
- First pure-play DSCR portfolio analytics SaaS
- OSS-first infrastructure stack (60-90% cost reduction vs vendor-first)
- Blue-ocean timing window opened by the late-2025 / mid-2026 emergence of portfolio-DSCR originators (Lima One, BFF; Insula channel removed per user 2026-06-21)
- 12-18 months before competitors (Trepp/Intex/Cotality/Verus) build portfolio-DSCR product
- Defensibility: XGBoost accumulation moat + Brinson-Fachler fixed-income decomposition + AGPL-clean licensing + MRM documentation

**3-year cost model (per Master Plan v11.2 + Major Thread v2 v2.1 §8.3):**
- Vendor-first: $3.46M-$5.82M (range per Major Thread v2)
- OSS-first: $1.28M-$2.10M (range per Major Thread v2)
- Savings: $2.18M-$3.72M (annualized $726K-$1,240K/yr)

---

## 8. Immediate next actions (per Thread N 20-step plan)

**Tier 1 (user decisions, 4 of 6 unresolved):**
1. Approve v0.5.6 scope (6 questions in Thread J)
3. ~~Approve Tier 4 v1 pricing~~ → RESOLVED (Thread M: 3-tier model)
4. Approve pilot broker outreach (6 questions in Thread L)

**Tier 2 cleanup (DONE 2026-06-21 14:04 PT):**
- ✅ Delete dead v2-sub1-sub7-poll cron
- ✅ Update Master Plan v11 v11.1
- ✅ Update Thread D Outline (retired)

**Tier 3 (spec hand-off, awaiting Tier 1):**
- v0.5.6 implementation ticket
- HOEPA 2027 pre-population
- 12-test acceptance matrix
- AGPL replacement execution plan

**Tier 4 (customer-facing, awaiting Tier 1):**
- NAMB affiliate application
- Pilot broker LinkedIn outbound
- First 2 discovery calls

**Tier 5 (defensive, ongoing):**
- HOEPA 2027 Federal Register watch (Dec 15, 2026)
- §1071 May 2026 Final Rule primary-source verification
- Memory: 4 reusable lessons from this session
- Quarterly review (Q1 2027)

---

## 9. What we don't have (gaps)

1. **No v0.5.6 code** — only spec (Thread J)
2. **No Tier 4 v1 product** — only design (Threads B, K, M)
3. **No pilot broker outreach executed** — only playbook (Thread L)
5. **No NAMB affiliate application** — recommended in Thread L
7. **No proprietary DSCR loan performance data** — fundamental limit on POC accuracy (Thread E)
9. **Sub-thread 1 (insurance+climate) data** — gap-closed 2026-06-21 (Mavis-rebuilt, NOT independently dscr-verifier-audited — user may request audit)
10. **v0.6.0 (tax + MC + after-tax) timing unresolved** — only Master Plan v11 §6 decision still pending for that scope

---

## 10. Sources cited

- Master Plan v11.1 (this session's synthesis)
- Threads A-N (all shipped to vault today)
- Build_vs_Buy_API_Dataset_Replacements_v1 + v2 (Major Thread)
- Tier4_DeepDive_2026Q2 (5 sub-deliverables)
- Regulatory_Front_Watch_20260620 (v0.5.6 source spec)
- v0.5.5 ship memo + dscr-verifier audit
- Thread B Tier 4 architecture (verifier output, 456 lines)
- Thread C Regulatory frontier (verifier output, 391 lines)
- DSCR LOAN OFFICE corpus (raw deep research, 80+ files)
- domains/ folder (14 domains, 24+ lender profiles)

---

**End of Thread O. Linked: Threads A-N; Master Plan v11.1; Thread N (audit).**