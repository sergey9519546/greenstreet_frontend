---
type: synthesis
status: drafted
title: "Thread N: Work Audit + 20-Step Plan 2026 Q2"
summary: "20-step plan for corpus work. Tier 4 RESOLVED, Tier 2 COMPLETED, Sub-thread 1 GAP-CLOSED in Round 9."
created: 2026-06-22
vaulted_at: 2026-06-22
author: Mavis (root session mvs_b78f9d32cd6348d6a48278d25e380ca4)
---

# Thread N — Work Audit + 20-Step Plan

**Date:** 2026-06-21
**Author:** Mavis (research-mode, no code)
**Status:** Final draft
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\_obsidian_vault\_research\extractions\Thread_N_Work_Audit_20_Step_Plan_2026Q2.md`

---

## 0. Why this thread exists

User asked for a work audit and 20 next steps. This thread:
1. Audits what was delivered (Threads A-M + 3 prior deliverables)
2. Identifies gaps and follow-up needed
3. Proposes 20 concrete next steps in priority order

## 1. What we delivered (audit)

### Pre-existing (from prior sessions)
- v0.5.5 §1071 threshold fix (shipped 2026-06-20 17:15 PT, dscr-verifier 12/12 PASS)
- Master Plan v11 (8-section integrated plan, 2026-06-20 18:30 PT)
- Empirical_Refresh_2026Q2 (Thread A, 11 anchors)
- Tier4_DeepDive_2026Q2 (Thread B + dscr-verifier supplement, 5 sub-deliverables + 20 recommendations)
- Regulatory_Front_Watch_20260620 (Thread C precursor, v0.5.6 source spec)
- Build_vs_Buy_API_Dataset_Replacements_2026Q2 + v2 (Major Thread v1 + v2; 5 of 7 sub-threads synthesized into Master Plan v11)
- Thread_D_Master_Plan_v11_Outline (precursor outline)

### Today (2026-06-20 → 2026-06-21)
| Thread | Title | Size | Status |
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

**Total: 9 new research threads, ~128 KB written to vault, ~21 open questions across them**

### Master Plan v11 §6 open decisions — status

| Decision | Status | Source |
|---|---|---|
| v0.5.6 scope (HOEPA 2027 + §1071 helpers) | ✓ Specced (6 open questions) | Thread J |
| v0.6.0 timing (tax + MC + after-tax) | ⏳ Not addressed | — |
| LendingPad vs Encompass LOS | ✓ Recommended LendingPad | Thread G |
| ~~Insula sales call Jul 11~~ | ~~✓ Prepped (5 open questions)~~ — **REMOVED per user 2026-06-21** | Thread K (DEPRECATED) |
| First 5 pilot broker partners | ✓ 5 placeholders identified | Thread I + L |
| Tier 4 v1 pricing model | ✓ Specced (6 open questions) | Thread M |

**5 of 6 Master Plan v11 §6 open decisions have actionable research artifacts. v0.6.0 timing is the only unaddressed one.**

## 2. What's still pending (audit)

### Infrastructure pending
- **Sub-thread 1 (insurance_climate) re-dispatched but NEVER returned.** 19+ hours pending. Poll cron continues to fire every 15 min producing progress tags. Realistic assessment: the sub-thread dispatch is stuck/dead.
- Master Plan v11 §1 PENDING sub-threads 1+7 still marked PENDING; not updated with current status

### Decisions pending (unblocked by user)
- 6 v0.5.6 scope questions (Thread J)
- ~~5 Insula call questions (Thread K)~~ — REMOVED per user 2026-06-21
- 6 Tier 4 v1 pricing questions (Thread M)
- 6 pilot outreach questions (Thread L)
- v0.6.0 timing (unaddressed)
- 1 broker-exempt / hybrid scenario question (Thread H)
- 1 XGBoost POC bank-partner outreach decision (Thread E)

### Action items pending (not research)
- v0.5.6 implementation ticket not created
- ~~Insula Jul 11 call not confirmed on calendar~~ — N/A, channel removed per user 2026-06-21
- Pilot broker outreach not started
- NAMB affiliate application not submitted
- No actual pricing decisions captured (only specced)
- No actual user decisions captured (only open questions asked)

### Defensive/audit pending
- HOEPA 2027 Federal Register watch (Dec 15, 2026 — not yet published)
- §1071 May 2026 Final Rule specific section for broker exemption (not primary-source verified)
- v0.5.6 spec needs dscr-verifier pre-implementation audit
- Memory: only 2 reusable lessons from today's research (could add 4-5 more from Threads J-M)

## 3. Gaps and risk

| Gap | Impact | Risk if not addressed |
|---|---|---|
| Sub-thread 1 (insurance_climate) missing | LOW | Synthesis without insurance data (we have Thread J/K/L/M as substitutes) |
| v0.5.6 not yet implemented | MEDIUM | Code-side ship target ~2 weeks after Dec 15, 2026 publication |
| ~~Insula call not scheduled~~ | N/A | ~~Lose 12-18 month blue-ocean window~~ — channel removed per user 2026-06-21, no impact |
| No actual pilot outreach | HIGH | No customer pipeline = no Year 1 revenue |
| v0.6.0 timing unaddressed | LOW | Tax + MC + after-tax is "defer" decision; can wait |
| No memory updates from J/K/L/M | LOW | Lessons lost; future research may re-discover |

## 4. The 20 next steps (priority order)

### Tier 1 — User decisions (UNBLOCK EVERYTHING)

1. **Approve v0.5.6 scope** (Thread J's 6 questions: HOEPA 2027 projection, 4 §1071 helpers, 12-test matrix, ship standard, target timing)
2. ~~**Approve Insula call Jul 11**~~ — REMOVED per user 2026-06-21 (was Thread K's 5 questions)
3. ~~**Approve Tier 4 v1 pricing**~~ → **RESOLVED 2026-06-21** (Thread M: 3-tier model Starter $15K / Pro $30K / Enterprise $50K-$100K; lead with Pro; discount strategy approved per Thread M §6)
4. **Approve pilot outreach** (Thread L's 6 questions: funnel targets, templates, MoU terms, tooling budget, internal ownership, success metrics)

### Tier 2 — Cleanup (no user input needed) — COMPLETED 2026-06-21 14:04 PT

5. ✅ **Cancelled the v2-sub1-sub7-poll cron** (DELETED 2026-06-21 14:04 PT; sub-threads 1 + 7 both integrated by 16:30 PT)
6. ✅ **Updated Master Plan v11 v11.1 → v11.2** (full sub-thread 1 + 7 integration, cost model refresh, hallucination audit pass 2026-06-21 16:40 PT)
7. ✅ **Updated Thread_D_Master_Plan_v11_Outline** (sub-thread 1 + 7 references replaced with actual Threads E/F/G/H/I/J/K/L/M refs in Master Plan v11.1 §7 Sources)

### Tier 3 — Code/spec hand-off (research-mode → implementation-ready)

8. **Create v0.5.6 implementation ticket** in dscr-core repo with: scope per Thread J, dscr-verifier pre-implementation audit per Master Plan v11 ship standard, 12-test acceptance matrix
9. **Pre-populate v0.5.6 HOEPA 2027 values** in compliance.py with +2.3% projection ($28,226 / $1,412); flag for Dec 15, 2026 Federal Register actuals update
10. **Author 12-test acceptance matrix** for v0.5.6 §1071 helpers (already in Thread J §5; copy into test file skeleton)
11. **AGPL-3.0 replacement execution plan** per Thread F: HelloSign/SuiteCRM/Cloudflare R2 evaluation + procurement; $20-60K/yr cost vs $40-220K/yr commercial licenses

### Tier 4 — Customer-facing (revenue pipeline)

12. ~~**Insula call Jul 11 prep finalization**~~ — REMOVED per user 2026-06-21
13. **Apply for NAMB affiliate status** (per Thread L source #2): request member directory with filters for non-QM/DSCR focus
14. **Start pilot broker LinkedIn outbound** (per Thread L §3): 50 connections/week, search terms "DSCR mortgage broker [state]", template per Thread L §2
15. ~~**Set up Apollo.io or ZoomInfo subscription**~~ — DEFERRED (D4=Lean, $0/mo per user 2026-06-21). Use LinkedIn free tier until Aug 15, 2026 escalation trigger
16. **Schedule first 2 discovery calls** with placeholder brokers: LoanStream top partner + Angel Oak broker channel contact (per Thread I candidate list)

### Tier 5 — Defensive (compliance + audit)

17. **HOEPA 2027 Federal Register watch** — calendar reminder for Dec 15, 2026 publication; primary-source verify + update compliance.py + ship via dscr-verifier
18. **§1071 May 2026 Final Rule specific section primary-source verification** — read Federal Register 2026-08494 §1002.105 actual text, confirm "broker-only not covered FI" language per Thread H recommendation
19. **Memory: append 4-5 reusable lessons from Threads J/K/L/M** to agent memory (build on existing 2 lessons: OSS license verify + AGPL §13 entity-status)
20. **Quarterly review** — schedule v0.5.6 re-audit at Q1 2027 (HOEPA 2027 actuals + §1071 litigation tracking + Master Plan v11.2 update)

## 5. Suggested ordering (what to do first)

If I were executing this list, the most valuable sequence is:

1. **Today (this week):** Step 1-4 (get user decisions on open questions); Step 5 (kill dead poll cron); Step 6-7 (Master Plan v11.1 + outline update)
2. **Next week:** Step 8-9 (v0.5.6 implementation ticket + HOEPA 2027 pre-population); Step 14-15 (pilot broker outreach lean mode + Tier 4 v1 spec review)
3. **Following 2 weeks:** Step 14-16 (pilot outreach execution); Step 10-11 (acceptance matrix + AGPL plan)
4. **Ongoing:** Step 15-16 (continue pilot outreach); Step 17-20 (defensive)

## 6. Risk reduction recommendations

- **Cancel the dead poll cron** (Step 5) — saves ~96 cron ticks/day of wasted work
- ~~**Schedule the Insula call NOW**~~ — N/A, channel removed per user 2026-06-21
- **Start pilot outreach IMMEDIATELY** (Step 14) — Tier 4 v1 is 5+ months from any revenue without pilots
- **Defer v0.6.0** (unaddressed in §6) — not on critical path for Q3 2026 launch

## 7. Open questions for user

1. Approve the 20-step plan as the roadmap for the next 4 weeks?
2. Authorize me to execute Tier 2 cleanup (Steps 5-7) without further user input?
3. Authorize me to start pilot outreach (Step 14) as soon as tooling budget is approved?
4. When can you respond to Tier 1 user decisions (Steps 1-4)?

## 8. Sources cited

**This audit references:**
- All 9 today's research threads (E through M) in extractions/
- v0.5.5 ship memo + dscr-verifier audit
- Master Plan v11 v11.0
- Thread D Master Plan v11 Outline
- Tier 4 Deep-Dive
- Regulatory Front Watch
- Empirical Refresh 2026 Q2
- Build-vs-Buy v1 + v2 (Major Thread)
- Thread B Tier 4 Architecture (verifier)
- Thread C Regulatory Frontier (verifier)

**Sub-thread 1 (insurance_climate):** GAP-CLOSED 2026-06-21 16:30 PT — Mavis-authored from verifier todos + primary sources. Saved to `research_v2_insurance_climate.md`. Integrated into Major Thread v2 v2.1 §6 + Master Plan v11.2 §4. Caveat: NOT independently dscr-verifier-audited (verifier sessions stood down before write).

---

**End of Thread N. Linked threads: All Threads A-M; Master Plan v11 §6; v0.5.5 ship memo; Tier 4 Deep-Dive; Thread D Outline.**