---
type: decisions
status: resolved
title: "DSCR Master Plan v11.2 — §6 Decisions (RESOLVED 2026-06-21)"
summary: "All 4 open §6 decisions resolved 2026-06-21. D1 = Approve Thread J as-is (Mavis-recommended); D2 = Stay deferred; D3 = REMOVED per user; D4 = Lean (LinkedIn free only). All 6 of 6 §6 decisions now closed."
source: Master_Plan_v11_2026Q2.md §6
vaulted_at: 2026-06-21
resolved_at: 2026-06-21 17:36 PT
author: Mavis
session: mvs_b78f9d32cd6348d6a48278d25e380ca4
---

# DSCR Master Plan v11.2 — §6 Decisions (RESOLVED 2026-06-21)

**Date resolved:** 2026-06-21 17:36 PT
**Source:** Master Plan v11.2 §6 (post gap-closure)
**Status:** ALL 6 of 6 §6 decisions resolved

---

## RESOLVED (6 of 6) — No Open Items

| # | Decision | Resolution | Resolved By | Date |
|---|---|---|---|---|
| 1 | v0.5.6 scope | **Approve Thread J as-is** (Mavis-recommended). 4 §1071 helpers + HOEPA 2027 projection + 12-test acceptance matrix. Ship ~2 weeks post Dec 15, 2026 HOEPA 2027 Federal Register. Full dscr-verifier audit before ship. | User | 2026-06-21 17:36 PT |
| 2 | v0.6.0 timing | **Stay deferred** (Mavis-recommended). v0.5.6 has higher leverage; nothing in v0.6.0 blocks the plan. Re-evaluate Q1 2027. | User | 2026-06-21 17:36 PT |
| 3 | Insula sales call Jul 11 | **REMOVED per user** — "skip this overall i never need it." Insula channel no longer in scope. Thread K retained for reference but flagged DEPRECATED. | User | 2026-06-21 17:36 PT |
| 4 | Pilot broker outreach | **Lean (LinkedIn free only).** 250 candidates, $0 tooling (no Apollo/ZoomInfo), NAMB deferred, AM time: user 0.25 FTE. MoU: 6-mo free + 30-day termination + no exclusivity + data-sharing clause. | User | 2026-06-21 17:36 PT |
| 5 | LendingPad for v1 LOS | Thread G — 3-yr TCO $26K-$83K vs Encompass $245K-$980K; weighted 8.85 vs Encompass 5.45 | (Pre-v11.2) | 2026-06-21 |
| 6 | Tier 4 v1 pricing model | Thread M — 3 tiers (Starter $15K / Pro $30K / Enterprise $50K-$100K) + per-loan use fees; Year 1 target $250K-$400K | (Pre-v11.2) | 2026-06-21 |

---

## D1: v0.5.6 Scope — APPROVE AS-IS

**Scope (per Thread J):**
- HOEPA 2027 threshold pre-population: $28,226 loan amount / $1,412 P&F (+2.3% CPI from 2026 actuals) — **PROJECTION, pending CFPB Federal Register Dec 15, 2026**
- 4 new §1071 product-coverage helpers:
  - `is_merchant_cash_advance`
  - `is_agricultural_loan`
  - `is_small_dollar_business_credit`
  - **`is_last_decision_maker`** — explicit fix for the v0.5.5 broker-exempt design-interpretation gap
- 12-test acceptance matrix
- Ship target: ~2 weeks after Dec 15, 2026 HOEPA 2027 Federal Register publication
- Full dscr-verifier audit before ship (per project standard)

**Rationale (Mavis-recommended):**
- HOEPA 2027 projection is verifiable math (2.3% CPI from June 2025)
- 4 helpers close a real v0.5.5 design-interpretation gap (especially `is_last_decision_maker`)
- Verifier-on-ship keeps the standard
- Shipping ~2 weeks post Dec 15 lets the actuals anchor to real FR data, not placeholder

---

## D2: v0.6.0 Timing — STAY DEFERRED

**Current state:** v0.6.0 (tax engine + Monte Carlo + after-tax IRR) is fully specced in the codebase + Sprint 6 corpus, but **deferred per the 2026-06-20 16:29 PT research-mode directive**.

**Re-evaluation trigger:** Q1 2027 (or when user signals readiness to lift research-mode directive).

---

## D3: Insula Sales Call Jul 11 — REMOVED

**Per user 2026-06-21 17:36 PT:** "skip this overall i never need it."

**Impact:** Insula Capital Group (launched portfolio-DSCR Jun 11, 2026) is no longer a go-to-market channel. The 12-question prep + 4 talking points in Thread K are flagged DEPRECATED but retained for reference.

**Remaining go-to-market channels:**
- Tier 4 v1 SaaS (direct to lenders, per Thread M pricing)
- Pilot broker outreach (D4 — lean/LinkedIn-free)
- Future: any lender who organically surfaces after Tier 4 v1 ships

---

## D4: Pilot Broker Outreach — LEAN (LinkedIn free only)

**Funnel:** 250 candidates → 50 qualified → 20 demos → 10 pilots proposed → 5 signed
**Tooling:** $0 — LinkedIn Sales Navigator free tier + manual outbound only
**NAMB affiliate:** Deferred (no $2-5K spend)
**AM time:** User 0.25 FTE (no SDR hire, no contractor)
**MoU:** 6 months free, 30-day termination, $0, no exclusivity + data-sharing clause
**Budget:** $0 Y1 (vs $30K-$60K as originally drafted in Thread L)
**Target:** 5 signed pilots by Sep 30, 2026 (revised from Thread L's Sep 30 date — same target, $0 spend)

**Impact:** Lower scale, longer timeline, but zero capital risk. Pilot success becomes the proof-point for Tier 4 v1 SaaS pricing later.

---

*Resolved 2026-06-21 17:36 PT by Mavis. Master Plan v11.2 §6 is now CLOSED. Next §6 batch opens when v0.5.6 ships or when user lifts the research-mode directive.*
