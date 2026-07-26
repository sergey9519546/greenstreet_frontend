---
type: synthesis
status: drafted
title: "Open Decisions Master Plan v11.2"
summary: "Master Plan v11.2 open decisions — superseded by _root/decisions.md (2026-06-21 17:36 PT all 6 resolved)."
created: 2026-06-22
vaulted_at: 2026-06-22
author: Mavis (root session mvs_b78f9d32cd6348d6a48278d25e380ca4)
---

# DSCR Master Plan v11.2 — Open §6 Decisions (User Input Required)


> **NOTE 2026-06-21 17:36 PT:** All 4 open decisions now RESOLVED. See `_obsidian_vault/_root/decisions.md` for the resolved-state copy. This file is the original pending-state snapshot, retained for traceability.

**Date:** 2026-06-21
**Source:** Master Plan v11.2 §6 (post gap-closure)
**Status:** 4 of 6 §6 decisions remain open after Threads G (LendingPad) + M (Tier 4 pricing) resolved in v11.1

---

## RESOLVED (2 of 6) — No Action Required

| # | Decision | Resolution Source |
|---|---|---|
| 3 | LendingPad for v1 LOS | Thread G — 3-yr TCO $26K-$83K vs Encompass $245K-$980K; weighted 8.85 vs Encompass 5.45 |
| 6 | Tier 4 v1 pricing model | Thread M — 3 tiers (Starter $15K / Pro $30K / Enterprise $50K-$100K) + per-loan use fees; Year 1 target $250K-$400K |

---

## OPEN (4 of 6) — User Input Required

### Decision 1: v0.5.6 Scope (Thread J) — 6 questions

**Decision point:** Approve the v0.5.6 ship scope and timing.

**What's in the spec (per Thread J):**
- HOEPA 2027 threshold pre-population: $28,226 loan amount / $1,412 P&F (+2.3% CPI from 2026)
- 4 new §1071 product-coverage helpers:
  - `is_merchant_cash_advance`
  - `is_agricultural_loan`
  - `is_small_dollar_business_credit`
  - **`is_last_decision_maker`** — explicit fix for the v0.5.5 broker-exempt design-interpretation gap
- 12-test acceptance matrix
- Ship target: ~2 weeks after Dec 15, 2026 HOEPA 2027 Federal Register publication

**Questions to user:**
1. Approve the 4 helpers as specified, or modify the list?
2. Approve ship-target (~2 weeks post Dec 15, 2026), or earlier (e.g., pre-publish placeholder) / later?
3. Trigger full `dscr-verifier` audit before ship? (Default yes per project standard.)
4. Include any v0.5.6 docstring changes from the May 2026 §1071 Final Rule interpretations?
5. Approve the HOEPA 2027 projection (2.3% CPI from 2026 actuals), or wait until CFPB publishes Nov 2026?
6. Bundle v0.5.6 + v0.5.7 (additional §1071 helpers) or keep separate?

### Decision 2: v0.6.0 Timing (Tax + MC + After-Tax) — DEFERRED

**Decision point:** When (if ever) to resume v0.6.0 work.

**Current state:** v0.6.0 (tax engine + Monte Carlo + after-tax IRR) is fully specced in the codebase + Sprint 6 corpus, but **deferred per the 2026-06-20 16:29 PT research-mode directive**.

**Questions to user:**
1. Confirm v0.6.0 stays deferred (default per current directive)?
2. If lifted, target timing (Q4 2026? Q1 2027?)?
3. If lifted, scope-confirm: tax engine + Monte Carlo + after-tax IRR + IC memo + 1031 exit (per Sprint 6)? Or subset?

### Decision 3: Insula Sales Call Jul 11, 2026 (Thread K) — 5 questions

**Decision point:** Confirm the sales call attendees, agenda, and commercial terms authority.

**Background (per Thread K):** Insula Capital Group launched portfolio-DSCR financing 2026-06-11. Their product fills the origination gap; our engine fills the analytics gap. 12-question prep + 4 talking points ready in Thread K.

**Questions to user:**
1. **Attendees on our side** (user + ?). Sales engineering vs BD vs engineering-led?
2. **Agenda** — 60 min: 5 min introductions, 25 min our positioning, 25 min their needs, 5 min next steps? Or different structure?
3. **Commercial terms authority** — what can we commit on the call? (Pilot terms: 6-month free, no exclusivity, 5 success metrics? Pricing discussion deferred? NDA required?)
4. **Deck / materials** — share the 12-question checklist? Send Tier 4 Deep-Dive ahead of time?
5. **Pre-call intel** — research Insula's tech stack + recent leadership changes + LinkedIn connections before call?

### Decision 4: First 5 Pilot Broker Partners (Threads I + L) — 6 questions

**Decision point:** Approve the pilot outreach funnel, budget, and MoU terms.

**What's ready (per Threads I + L):**
- 5 placeholder partners (LoanStream top partner, Angel Oak broker channel, independent FL/TX DSCR broker, CrossCountry Mortgage broker network, New American Funding broker division)
- 5-stage funnel (250-500 candidates → 50 qualified → 20 demos → 10 pilots proposed → 5 signed)
- Pilot MoU: 6 months free, 30-day termination, $0, no exclusivity
- 5 success metrics: 50 loans/qtr, 30% time reduction, 90% accuracy, NPS 40+, 70% renewal intent
- Budget: $30K-$60K Y1 (Apollo/ZoomInfo $500-$1,500/mo + NAMB affiliate $2-5K + events $10-25K + AM time $15-25K)

**Questions to user:**
1. **Funnel scale** — start with 250 candidates, or scale to 500 from day 1?
2. ~~**Tooling budget** — approve Apollo.io ($500-$1,500/mo) or start with free LinkedIn outbound (slower, $0)?~~ — **RESOLVED 2026-06-21: D4 = Lean, LinkedIn free only, $0/mo (per decisions.md)**
3. **NAMB affiliate** — apply now ($2-5K) or defer to Q4 2026?
4. **AM time allocation** — who (you? SDR hire? contractor?)? 0.5 FTE Y1?
5. **Pilot MoU terms** — approve 6-month free + 30-day termination + no exclusivity as drafted, or modify?
6. **Data sharing** — include data-sharing clause in MoU (required for XGBoost accumulation moat) or defer to post-pilot agreement?

---

## Recommended Order of Decision

Based on leverage and urgency (Mavis's view — override as needed):

1. **Decision 3 (Insula call)** — Jul 11 is firm, 20 days out. Calendar now.
2. **Decision 4 (pilot brokers)** — parallel work, won't block other decisions; can start while waiting on Insula outcome.
3. **Decision 1 (v0.5.6 scope)** — cleanest spec, ~2 weeks of work post Dec 15, 2026; not urgent until Q4 2026.
4. **Decision 2 (v0.6.0 timing)** — lowest urgency; can defer indefinitely.

---

## One-Line Decision Per Item (if user wants fast path)

If user wants to resolve each in one shot:

- **Decision 1:** "Approve Thread J spec as-is. Ship ~2 weeks post Dec 15, 2026. Full verifier audit before ship."
- **Decision 2:** "Confirm v0.6.0 stays deferred. Re-evaluate Q1 2027."
- **Decision 3:** "Attendees: [user] + [TBD]. Agenda: 60 min per Thread K §2. Commercial terms: pilot only (no production commitment). Send Thread K 12-question checklist pre-call. NDA required."
- **Decision 4:** "250 candidates. Apollo.io $500/mo. NAMB deferred to Q4 2026. AM time: [user] 0.25 FTE. MoU as drafted + data-sharing clause."

---

*Generated 2026-06-21 16:35 PT by Mavis. Single-source decision list for user response.*
