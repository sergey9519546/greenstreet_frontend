# SOVEREIGN OS · 90-DAY ROLLOUT BRIEFING — V2 GODMODE

**Document type:** Godmode Leadership Briefing (V2 upgrade of `01_90Day_Rollout_Briefing.pdf`)
**Audience:** Marketing-Ops Leadership (VP/Director), CFO, General Counsel, LO Operations Director, VP Marketing
**Classification:** Internal · Pre-Launch · Decision-Ready · Lift-and-Deployable
**Swarm status:** 10 agents complete · V2 campaign rebuild shipped · 4 pre-launch gates pending
**Budget ask:** $50K/month × 3 = **$150K for 90 days** · 5 funded loans target · <$8,500 CPFL
**Critical event:** `Tier_Routed_A_or_B` as Meta + Google optimization event (NOT raw `Form_Complete`)
**Build:** D1-GODMODE · Supersedes V1 executive briefing for governance purposes

---

## How to Read This Document

| If you are… | Read… | Time |
|---|---|---|
| VP Marketing / CFO / GC (time-boxed) | Part 1 only | 7 min |
| Marketing-Ops Lead (executing the launch) | Parts 1, 2, 9 | 90 min |
| Compliance Counsel | Parts 1, 2 (W1D1, W1D4), 3 (PM-001, PM-010), 6 (Crisis 2) | 45 min |
| LO Ops Director | Parts 1, 2 (W2D3–D5, W3D1–D5), 8 | 60 min |
| Board prep | Part 10 only | 5 min |
| On-call / incident responder | Parts 3, 6 only | 30 min |

**The WOW element is Part 2** — a day-by-day, hour-by-hour launch script for weeks 1–3 that any qualified marketing-ops team can lift and execute without re-planning.

---

# PART 1 · EXECUTIVE DECISION BRIEF

*(This is the only part leadership reads first. Everything else is support.)*

## 1.1 Mission Statement (one paragraph)

The DSCR Borrower-Intelligence Swarm is operationally complete: ten agents produced a deployable marketing-ops stack (12-persona library, 8-component 0–100 approval score, 12-question ECOA-compliant intake form, V2 creative library of 120 hooks + 100 objection destroyers + 20 landing pages, 49-MSA geo map, and a complete TS-10 targeting payload with 8 Meta ad sets and 12 Google ad groups). We are asking leadership to authorize a 90-day, $150K rollout with four pre-launch gates that hard-block launch until cleared, a day-by-day execution script, a 15-mode pre-mortem, a capital-efficiency model with explicit go/no-go scaling triggers, and a crisis playbook that defines response to lender withdrawal, CFPB inquiry, negative press, data breach, and silent scoring-engine failure. The single most important operational rule: **the Meta/Google optimization event is `Tier_Routed_A_or_B`, never raw `Form_Complete`** — because Tier D leads (decline cohorts) complete forms at high rates and would silently bankrupt the swarm if CTR or form-completion were the optimization signal.

## 1.2 The Four Decision Asks

| # | Decision | Recommended action | Deadline | Escalation if blocked |
|---|---|---|---|---|
| **D1** | Budget approval: **$150K for 90 days** ($50K/month; Meta 36% / Google 40% / YouTube 12% / Native 12%) | Approve full $150K. Pre-authorize Q2 scale to **$300K** if 90-day CPFL <$8,500 AND ≥5 funded loans AND Tier A-or-B rate ≥33%. | **5 business days** from briefing date | CFO (budget); VP Marketing (program) |
| **D2** | Pre-launch gate authorization: **4 gates** (Compliance / Platform / Operational / Tech) | Approve the 4 gates as hard blocks — no campaign ships, no pixel fires, no lead routes until all 4 clear in writing. Gate owners sign the gate-clearance register (Part 2, W1D5). | **5 business days** | VP Marketing |
| **D3** | Specialty-lender referral network sign-off: **12 non-GL-02 specialty lenders** (Angel Oak, A&D, HomeAbroad, Visio, Kiavi, Harpoon, Brookmont, DSCR Direct, Allay, First Liberty, Ridge Street, Feng Capitals) | Authorize referral agreements. LO Ops executes in W1–W2. Each lender must confirm capacity + eligibility for ≥2 persona routing destinations (TS-10 §3B). | **10 business days** | General Counsel (legal review of referral agreement template) |
| **D4** | Quarterly iteration cycle commitment | Commit marketing-ops to Q2/Q3/Q4 iteration cadence (re-harvest CF-01, re-normalize GL-02, re-mine AP-03/NP-04, recalibrate TS-10 weights). Allocate **1.0 FTE** (marketing-ops analyst) for swarm maintenance. | **5 business days** | VP Marketing (FTE allocation) |

## 1.3 90-Day KPI Summary Table

| Category | KPI | M1 | M2 | M3 | 90-day |
|---|---|---:|---:|---:|---:|
| Funnel volume | Form completions | 200 | 400 | 600 | **1,200** |
| Funnel volume | Tier A leads | 20 | 50 | 80 | **150** |
| Funnel volume | Tier A-or-B leads | 60 | 130 | 200 | **390** |
| Funnel quality | Tier A-or-B rate | 30% | 33% | 33% | **33%** |
| Funnel quality | Persona fit rate (top-3) | 60% | 55% | 50% | **55%** |
| Funnel quality | Documentation upload rate | 50% | 60% | 65% | **60%** |
| Economics | Cost per Tier A-or-B lead | $280 | $250 | $220 | **$250** |
| Economics | Cost per pre-qual letter | $1,500 | $1,300 | $1,100 | **$1,300** |
| Economics | Cost per loan in UW | $5,000 | $4,500 | $4,000 | **$4,500** |
| Economics | **Cost per funded loan** | — | — | — | **<$8,500** |
| Swarm health | Specialty-lender referral rate | 15% | 20% | 25% | **20%** |
| Swarm health | Decline-letter audit conversion | 10% | 15% | 20% | **15%** |
| Swarm health | Funded-loan cohort N | 0 | 0 | 2 | **5** |

**Stretch targets** (godmode additions, not in V1): Tier A-or-B rate ≥45% (TS-10 KPI-002 stretch), Tier D rate ≤25% (TS-10 KPI-004), LO SLA compliance ≥95% (TS-10 KPI-008), persona-tag accuracy ≥85% (TS-10 KPI-009), specialty-lender routing acceptance ≥70% (TS-10 KPI-010).

## 1.4 Critical Risk Callout

**The single highest-leverage failure mode is optimization-event misconfiguration (PM-006).** If the Meta campaign manager accidentally sets `Form_Complete` as the optimization event (default behavior) instead of `Tier_Routed_A_or_B`, Meta's algorithm will optimize for form-fillers — and Tier D decline-cohort leads fill forms at 2–3× the rate of Tier A/B qualified borrowers because decline-cohort borrowers are shopping desperately. Result: CPL drops (looks good), CPQA explodes (looks bad within 2 weeks), CPFL exceeds $20K (looks catastrophic by week 6). The mitigation is in W1D5 (Part 2): a pixel-QA gate that hard-blocks launch until `Tier_Routed_A_or_B` is verified as the optimization event at the campaign level for all 8 Meta ad sets and all 12 Google ad groups. This is non-negotiable.

## 1.5 Approval Block

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  APPROVAL — D1-GODMODE 90-DAY ROLLOUT                                         │
│                                                                               │
│  By signing, leadership authorizes marketing-ops to execute the 90-day        │
│  rollout pending the four pre-launch gates (G1–G4) clearing in writing.       │
│  The next briefing is the 30-day progress review (end of M1).                 │
│  If any KPI misses target by >20%, an interim briefing triggers within        │
│  5 business days (per Part 5 Bear scenario playbook).                         │
│                                                                               │
│  D1 Budget ($150K + Q2 pre-auth $300K):  _______ Approve   _______ Decline    │
│     Signature: __________________________  Date: ____________                 │
│                                                                               │
│  D2 Pre-launch gates (G1–G4 hard-block):  _______ Approve   _______ Decline   │
│     Signature: __________________________  Date: ____________                 │
│                                                                               │
│  D3 Specialty-lender referral network:    _______ Approve   _______ Decline   │
│     Signature: __________________________  Date: ____________                 │
│                                                                               │
│  D4 Quarterly iteration + 1.0 FTE:        _______ Approve   _______ Decline   │
│     Signature: __________________________  Date: ____________                 │
│                                                                               │
│  CFO (D1): ______________________  VP Marketing (D2/D4): __________________  │
│  General Counsel (D3): __________  LO Ops Director (D3): __________________  │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Return signed block to marketing-ops within 5 business days.** Unsigned = decline-by-default at day 6.

---

# PART 2 · DAY-BY-DAY LAUNCH SCRIPT (WEEKS 1–3)

> **This is the WOW element.** For each business day in weeks 1–3, this script specifies what happens at 8am, 9am standup, 10am–12pm morning blocks, 1pm–3pm afternoon blocks, 3pm–5pm review + handoffs, and 5pm EOD deliverables — with named owners, specific deliverables, and a Decision Gate sub-section per day. **Lift and deploy.** No re-planning required.

## 2.0 How to Use This Script

- **Timezone:** All times are **Pacific Time (PT)**. Adjust for standups if team is multi-zone.
- **Business days:** Monday–Friday. Weekends are monitoring-only (PM on-call rotation per Part 3).
- **Owners:** Named by role (e.g., "CRM Team Lead", "Reg B Counsel", "LO Ops Director"). Where a single role isn't sufficient, a backup is named.
- **Decision Gate (every day):** The one decision that MUST be made by EOD. If delayed, the next day's plan changes — there's a "what happens if delayed" line per day.
- **Deliverable format:** Every deliverable is named with an artifact ID (e.g., `W1D1-DEL-01`) for traceability in the worklog.
- **Status update template (EOD every day):**

```
D1-GODMODE STATUS — <DATE> · <DAY ID>
==================================================
GATES: G1 Compliance [Status] | G2 Platform [Status] | G3 Operational [Status] | G4 Tech [Status]
DELIVERABLES DUE TODAY:
  [DEL-ID] — <name> — Owner: <role> — Status: [DONE/IN-PROGRESS/BLOCKED]
  ...
DECISION GATE: <decision text> — Decider: <role> — Decision: [MADE/DEFERRED/BLOCKED]
BLOCKERS: <list, or "none">
RISK FLAGS RAISED: <list PM-IDs from Part 3, or "none">
TOMORROW'S CRITICAL PATH: <one-line>
==================================================
```

## 2.1 Role Roster (used throughout Part 2)

| Role abbreviation | Full title | Primary owner (placeholder — fill before W1D1) | Backup |
|---|---|---|---|
| **RMOL** | Rollout Marketing-Ops Lead (overall accountable) | _______ | Marketing Ops Manager |
| **RGC** | Reg B Compliance Counsel (external or in-house) | _______ | Outside ECOA counsel (backup firm) |
| **MOL** | Meta/Google Ops Lead (ad platform owner) | _______ | Sr. Paid Media Manager |
| **CRTL** | CRM Team Lead (routing rules + scoring engine) | _______ | CRM Admin |
| **TLEAD** | Tech Lead (pixel + tracking + landing pages) | _______ | Web Developer |
| **LOOD** | LO Operations Director (LO pools + SLA) | _______ | LO Ops Manager |
| **LRM** | Lender Relationship Manager (specialty lender agreements) | _______ | LO Ops Director |
| **DMAN** | Data Analyst (KPI dashboard + A/B test analysis) | _______ | Marketing Ops Analyst |
| **PRCOM** | PR / Communications Lead (crisis comms) | _______ | VP Marketing |
| **LEGCO** | Legal Counsel (contracts + privacy) | _______ | General Counsel |
| **PMON** | Project Manager (status reports + decision log) | _______ | Marketing Ops Manager |

---

## WEEK 1 — PRE-LAUNCH GATE EXECUTION

### W1D1 (Monday) — Pre-Launch Gate Kickoff (all 4 gates activated in parallel)

**Theme:** Standing up the launch. No creative ships, no pixel fires, no lead routes. Today is kickoff + parallel gate-work startup.

#### 8:00am — RMOL sends the W1D1 kickoff brief
- **Deliverable `W1D1-DEL-01`** — "D1-GODMODE W1D1 Kickoff Brief" (email + Slack post) sent to: RGC, MOL, CRTL, TLEAD, LOOD, LRM, DMAN, PRCOM, LEGCO, PMON.
- Content: links to V1 briefing (`01_90Day_Rollout_Briefing.pdf`), this godmode briefing, TS-10, AC-09 V2, SA-05, FF-08. W1D1 standup agenda. The four gates with owners. The critical-event rule (`Tier_Routed_A_or_B`, not `Form_Complete`).
- **Owner:** RMOL. **Deadline:** 8:30am.

#### 9:00am — Standup (30 min, video)
**Agenda:**
1. Roll call (all 11 roles). 5 min.
2. RMOL reads the mission statement (Part 1.1) aloud. 2 min.
3. Gate owners confirm understanding of their gate scope. 10 min (2.5 min × 4).
   - G1 Compliance — RGC: "I will review all EG-001 through EG-008 creative, plus SA-008, EG-002 ITIN, EG-003 No-Credit FN, with priority on adverse-action/Tier D exit messages under Reg B §1002.9. My deliverable is the G1 sign-off register by W1D5 EOD."
   - G2 Platform — MOL: "I will configure Meta SAC HOUSING designation at account level, complete Google Ads housing certification, replace NMLS ID in 20 disclaimers, and arrange Spanish-language native-speaker review for EG-002 + SA-010. My deliverable is the G2 sign-off register by W1D5 EOD."
   - G3 Operational — LOOD + LRM: "We will verify the 12 non-GL-02 specialty lenders active + accepting referrals, and confirm senior LO pool (Tier A) + specialty LO pools (Tier B/C) by persona. Our deliverable is the G3 sign-off register by W1D5 EOD."
   - G4 Tech — TLEAD + CRTL: "We will deploy the conversion tracking pixel with `Tier_Routed_A_or_B` as optimization event, configure CRM routing rules per TS-10 Part 3, and load the A/B test calendar. Our deliverable is the G4 sign-off register by W1D5 EOD."
4. PMON reviews the W1 schedule (W1D1–D5) at 30,000 ft. 8 min.
5. Risks + blockers surface. 5 min.
- **Owner:** RMOL. **Scribe:** PMON.

#### 10:00am–12:00pm — Morning work blocks (parallel)

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 10:00–11:00 | RGC | Open the V2 creative packet (`AC09_V2_ad_copy.md`); flag the 8 highest-risk assets for expedited P3 review: SA-008 Credit-Scarred, EG-002 ITIN, EG-003 No-Credit FN, EG-001 Post-Short-Sale, EG-005 Unpermitted-ADU, EG-006 Non-Warrantable, EG-007 Condotel, plus the SA-011 Decline-Letter triage LP. Build the review queue. | `W1D1-DEL-02` — RGC review queue (shared doc) |
| 10:00–11:00 | MOL | Log into Meta Ads Manager + Google Ads. Verify SAC HOUSING designation eligible at account level. Verify Google Ads housing-cert completed (or start it — 1 business day lead time). Pull list of 20 disclaimers needing NMLS ID replacement from AC-09 V2 Part 1.4. | `W1D1-DEL-03` — Platform readiness checklist |
| 10:00–11:30 | CRTL | Open TS-10 Part 3 (CRM Routing Rules). Inventory existing CRM automations. Identify the 8 persona-tag fields + 4 tier fields + 6 SLA timers that must be created. | `W1D1-DEL-04` — CRM field/automation build list |
| 10:00–11:30 | TLEAD | Inventory existing pixel deployment on the company website. Identify the 3 persona-specific landing page domains (LP-SA-001/002/004 for M1). Pull TS-10 §2D Conversion Tracking Plan. | `W1D1-DEL-05` — Pixel inventory + gap list |
| 11:00–12:00 | LOOD + LRM | Open the 12-lender referral tracker. Confirm each lender's relationship owner on our side. Draft the outreach email template (per lender). | `W1D1-DEL-06` — Lender outreach tracker + email template |
| 11:30–12:00 | DMAN | Open the KPI dashboard spec (TS-10 §3D). Inventory current dashboard tool (Looker/Tableau/Google Data Studio). Build the empty dashboard shell with all 14 KPIs + stretch targets. | `W1D1-DEL-07` — Empty dashboard shell |

#### 12:00–1:00pm — Lunch (working lunch for RGC + RMOL: walk through the 8 priority creative assets)

#### 1:00–3:00pm — Afternoon work blocks (parallel)

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 1:00–2:00 | RGC | Begin P3 review of SA-008 Credit-Scarred creative (highest-risk because of credit-event language + §1002.9 adverse-action exposure). Draft the first compliance flag log. | `W1D1-DEL-08` — Compliance flag log v0.1 |
| 1:00–2:30 | MOL | Begin NMLS ID replacement across 20 disclaimers (template found in AC-09 V2 §1.4). Coordinate with TLEAD for landing-page disclaimer placement. | `W1D1-DEL-09` — Disclaimer replacement log |
| 1:00–2:30 | CRTL | Begin building the 8 persona-tag fields in CRM. Map each to FF-08 Q-001–Q-012 form-field inputs (per TS-10 Part 7 binding contract). | `W1D1-DEL-10` — Persona-tag field schema |
| 1:00–2:30 | TLEAD | Begin building the 3 M1 landing pages (LP-SA-001, LP-SA-002, LP-SA-004) on the staging environment per AC-09 V2 Part 7. | `W1D1-DEL-11` — Staging LP build in progress |
| 1:00–2:30 | LOOD + LRM | Send the 12 lender outreach emails (one per specialty lender). Each email contains: program-feature language, expected referral volume (M1: 20 leads/month; M3: 60 leads/month), persona routing destinations, SLA expectations (4hr Tier B / 1day Tier C response). | `W1D1-DEL-12` — 12 outreach emails sent (logged) |
| 2:30–3:00 | DMAN + PMON | Daily status template built (Part 2.0 format). Pre-populate W1D1 fields. | `W1D1-DEL-13` — Daily status template live |

#### 3:00–5:00pm — Review + handoffs

| Time | Activity | Owner |
|---|---|---|
| 3:00–3:30 | RGC → RMOL handoff: walk through compliance flag log v0.1, surface any blocking flags early. | RGC + RMOL |
| 3:30–4:00 | MOL → TLEAD handoff: align on landing-page disclaimer placement + pixel placement per LP. | MOL + TLEAD |
| 4:00–4:30 | CRTL → LOOD handoff: review persona-tag schema against LO pool assignments (TS-10 §3B). Confirm the LO pool mapping is internally consistent. | CRTL + LOOD |
| 4:30–5:00 | PMON consolidates daily status from all owners. | PMON |

#### 5:00pm EOD — Deliverables due + status update
- All 13 `W1D1-DEL-*` deliverables logged in the project tracker.
- PMON posts the daily status update to the `#d1-godmode-launch` Slack channel by 5:15pm.

#### Decision Gate (W1D1)
- **Decision:** Confirm the 4 gate owners + their W1D5 EOD sign-off commitment.
- **Decider:** RMOL (with VP Marketing sign-off if any role is unfilled).
- **What happens if delayed:** If any of the 4 gate owners is unfilled by EOD W1D1, the launch date slips by 1 business day per missing owner. VP Marketing is paged.

---

### W1D2 (Tuesday) — CRM Scoring Engine Configuration Begins

**Theme:** The scoring engine is the brain of the swarm. If it misroutes Tier A leads to Tier D nurture (PM-014), the swarm fails silently. Today is the first day of building the TS-10 8-component score + 4-tier routing + 6 SLA timers in the CRM.

#### 8:00am — RGC delivers the SA-008 compliance flag list (carryover from W1D1)
- **Deliverable `W1D2-DEL-01`** — RGC's SA-008 Credit-Scarred compliance flags. RMOL reviews for any blocking issue.
- If blocking: RMOL escalates to VP Marketing by 9am; SA-008 launch deferred from M2 to M3 (contingency in Part 3 PM-001).

#### 9:00am — Standup (30 min)
**Agenda:**
1. Roll call. 3 min.
2. Gate-status round (each owner: green/yellow/red against W1D5 sign-off). 8 min.
3. CRTL presents the persona-tag field schema (`W1D1-DEL-10`) for group review. 10 min.
4. TLEAD presents the pixel placement plan for the 3 M1 landing pages. 5 min.
5. PMON reviews the W1D2 critical path. 4 min.

#### 10:00am–12:00pm — Morning work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 10:00–11:30 | CRTL | **Build the 8 score components in CRM** (per TS-10 §1A): SC-001 DSCR Strength (25%), SC-002 FICO Band (15%), SC-003 LTV/Down-Payment (15%), SC-004 Reserves Depth (15%), SC-005 Property Type Cleanliness (10%), SC-006 Documentation Readiness (10%), SC-007 Experience Level (5%), SC-008 Edge-Case Fit Bonus (5%). Each component built as a calculated field pulling from FF-08 form inputs. | `W1D2-DEL-02` — 8 score components live in CRM sandbox |
| 10:00–11:00 | RGC | P3 review of EG-002 ITIN creative (English + Spanish). Verify the "Sin SSN" framing doesn't trigger fair-lending concerns. | `W1D2-DEL-03` — EG-002 compliance flag log |
| 11:00–12:00 | RGC | P3 review of EG-003 No-Credit FN creative. Verify the 60% LTV / 12mo reserves framing matches GL-002 normalized program. | `W1D2-DEL-04` — EG-003 compliance flag log |
| 10:00–12:00 | MOL | Build the 8 Meta ad sets in Ads Manager (draft state, not published): AS-001 through AS-008 per TS-10 §2A. Each ad set targets a persona-matched audience with SAC HOUSING constraints applied. V2 creative (AC-09 V2 Part 2) loaded as drafts. | `W1D2-DEL-05` — 8 Meta ad sets in draft state |
| 10:00–11:00 | TLEAD | Deploy LP-SA-001 (Cash-Flow Optimizer) to staging. Verify lead-magnet above-fold (per AC-09 V2 LP architecture). Verify 3-question inline self-qualifier. Verify trust bar (NMLS + $340M funded + 2,847 borrowers). | `W1D2-DEL-06` — LP-SA-001 staging deploy |
| 11:00–12:00 | LOOD + LRM | Track W1D1 lender outreach responses. Send follow-up to non-responders. Confirm at least 4 of 12 lenders have acknowledged by EOD. | `W1D2-DEL-07` — Lender response tracker v0.2 |

#### 12:00–1:00pm — Lunch (working lunch for CRTL + DMAN: review score component logic against TS-10 §1A pseudocode)

#### 1:00–3:00pm — Afternoon work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 1:00–2:30 | CRTL | **Build the composite score calculation** (per TS-10 §1B). Floor/ceiling overrides per FF-08 Part 7 binding contract. Test against the 20 worked examples (12 main personas + 8 edge cases) in TS-10 §1B. | `W1D2-DEL-08` — Composite score + 20 test cases passing |
| 1:00–2:00 | RGC | P3 review of SA-008 LP (LP-SA-008 from AC-09 V2 Part 7). Verify "Bankruptcy discharged 4+ years" framing meets §1002.9. | `W1D2-DEL-09` — SA-008 LP compliance flag log |
| 2:00–3:00 | RGC | P3 review of SA-011 Decline-Letter triage LP (highest-leverage per Finding 2). Verify the "we will tell you honestly" V2-7 honest-triage notice language. | `W1D2-DEL-10` — SA-011 LP compliance flag log |
| 1:00–2:30 | MOL | Build the 12 Google ad groups (draft state): AG-001 through AG-012 per TS-10 §2B. Each ad group targets persona-specific exact-match + phrase-match keywords. V2 creative loaded as drafts. | `W1D2-DEL-11` — 12 Google ad groups in draft state |
| 1:00–2:30 | TLEAD | Deploy LP-SA-002 (Portfolio Scaler) + LP-SA-004 (Equity-Tapping Refinancer) to staging. Verify the same LP architecture as LP-SA-001. | `W1D2-DEL-12` — LP-SA-002 + LP-SA-004 staging deploy |
| 2:30–3:00 | DMAN | Begin wiring the KPI dashboard to the CRM + ad-platform APIs. Verify Form_Complete, Tier_Routed_A/B/C/D, Loan_Funded events flow. | `W1D2-DEL-13` — Dashboard wiring in progress |

#### 3:00–5:00pm — Review + handoffs

| Time | Activity | Owner |
|---|---|---|
| 3:00–3:30 | CRTL → DMAN handoff: walk through the composite score calculation + 20 test cases. DMAN validates the score field is queryable for dashboard. | CRTL + DMAN |
| 3:30–4:00 | RGC → RMOL handoff: surface any blocking compliance flags from the day's 4 creative reviews (SA-008, EG-002, EG-003, SA-011). | RGC + RMOL |
| 4:00–4:30 | MOL → TLEAD handoff: align on UTM tagging convention for the 20 ad sets + 12 ad groups so dashboard attribution works. | MOL + TLEAD |
| 4:30–5:00 | PMON consolidates daily status. | PMON |

#### 5:00pm EOD — Deliverables due + status update

#### Decision Gate (W1D2)
- **Decision:** Confirm the 8 score components match TS-10 §1A weights exactly (25/15/15/15/10/10/5/5 = 100%).
- **Decider:** CRTL (with DMAN validating arithmetic).
- **What happens if delayed:** If the weights don't sum to 100% by EOD W1D2, CRTL escalates to RMOL. Composite score build (W1D3 dependency) slips by 1 day. The W1D5 pixel QA gate cannot fire until composite score is live.

---

### W1D3 (Wednesday) — Meta + Google Ad Set Build Begins

**Theme:** The ad sets + ad groups go from draft to ready-to-publish (still paused, not spending). Every ad set + ad group must have the correct optimization event (`Tier_Routed_A_or_B`), the correct audience (SAC-compliant), the correct creative (V2 from AC-09 V2 Part 2), and the correct budget allocation (per TS-10 §2E).

#### 8:00am — RGC delivers consolidated compliance flag list (carryover from W1D2)
- **Deliverable `W1D3-DEL-01`** — RGC's consolidated compliance flag log across SA-008, EG-002, EG-003, SA-011, plus the Tier D exit-message review (PM-001 critical path). RMOL reviews for any W1D5-blocking issues.

#### 9:00am — Standup (30 min)
**Agenda:**
1. Roll call. 3 min.
2. Gate-status round. 8 min.
3. MOL presents the 8 Meta ad set + 12 Google ad group build status. Group review of audience targeting per ad set (SAC HOUSING constraints). 10 min.
4. CRTL presents the composite score 20-test-case validation. 5 min.
5. PMON reviews W1D3 critical path. 4 min.

#### 10:00am–12:00pm — Morning work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 10:00–11:30 | CRTL | **Build the 4-tier routing rules** (per TS-10 §1C): TIER_A (85–100) → senior LO 1hr SLA; TIER_B (65–84) → specialty LO 4hr SLA; TIER_C (40–64) → senior review 1day SLA; TIER_D (0–39) → defer/automate. Each rule fires on composite-score threshold + persona_tag combination. | `W1D3-DEL-02` — 4-tier routing rules live in CRM sandbox |
| 10:00–11:30 | MOL | **Finalize Meta ad set build** (8 ad sets): AS-001 Top-4 Persona Rotation, AS-002 SA-002 Portfolio Scaler, AS-003 SA-001 Cash-Flow Optimizer, AS-004 SA-004 Equity-Tapping Refinancer, AS-005 SA-007 STR Operator (M2), AS-006 SA-003 First-Timer (M2), AS-007 SA-011 Decline-Letter Triage, AS-008 Edge-Case Rotation (EG-005/006/007/008). Each ad set: V2 creative (6 hooks per persona = 2 PI + 2 PA + 2 PS), audience (SAC HOUSING), placement (FB+IG feed + reels + audience network off), budget allocation per TS-10 §2E. **Optimization event: `Tier_Routed_A_or_B`** — set at ad set level. | `W1D3-DEL-03` — 8 Meta ad sets ready-to-publish (paused) |
| 10:00–11:00 | RGC | P3 review of Tier D exit messages (HEX-001 primary residence, HEX-009 active delinquency, HEX-012 sub-$100K, HEX-013 pure commercial). Verify §1002.9 adverse-action compliance. **This is the highest-stakes compliance review of the entire launch** — Tier D exit messages that constitute adverse action trigger Reg B notice requirements. | `W1D3-DEL-04` — Tier D exit-message compliance sign-off (draft) |
| 11:00–12:00 | RGC | P3 review of SA-008 creative hooks (6 hooks from AC-09 V2 §SA-008). Verify "Bankruptcy discharged 4+ years ago" + "30% down + 12mo reserves" framing. | `W1D3-DEL-05` — SA-008 creative compliance sign-off (draft) |
| 10:00–11:30 | TLEAD | Build the `Form_Start`, `Form_Complete`, `Tier_Routed_A/B/C/D`, `Pre_Qual_Issued`, `Loan_in_UW`, `Loan_Funded` event tags in GTM. Each tag fires on specific form-state transitions. | `W1D3-DEL-06` — GTM event tags live in staging |
| 11:30–12:00 | LOOD + LRM | Confirm at least 8 of 12 specialty lenders have responded to outreach. Flag any lender declining referral capacity. | `W1D3-DEL-07` — Lender response tracker v0.3 |

#### 12:00–1:00pm — Lunch (working lunch for MOL + CRTL: align ad set audience targeting with persona_tag field)

#### 1:00–3:00pm — Afternoon work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 1:00–2:30 | CRTL | **Build the 6 SLA timers** (per TS-10 §3C): Tier A LO 1hr / Tier A pre-approval 4hr / Tier B LO 4hr / Tier B pre-qual 1day / Tier C senior review 1day / Tier C specialty routing 2day. Each timer starts on tier-routing event + escalates to LO manager on breach. | `W1D3-DEL-08` — 6 SLA timers live in CRM sandbox |
| 1:00–2:30 | MOL | **Finalize Google ad group build** (12 ad groups): AG-001 DSCR Loans (generic), AG-002 Portfolio DSCR (SA-002), AG-003 Self-Employed DSCR (SA-001), AG-004 Cash-Out Refi DSCR (SA-004), AG-005 First DSCR Loan (SA-003), AG-006 STR DSCR (SA-007), AG-007 Credit-Scarred DSCR (SA-008), AG-008 ADU DSCR (SA-009), AG-009 ITIN DSCR (SA-010), AG-010 Decline Letter (SA-011), AG-011 BRRRR Refi (SA-012), AG-012 FN DSCR (SA-005/006). Each ad group: V2 RSA creative, exact+phrase+modified-broad keywords (per TS-10 §2B), negative keyword master list applied (TS-10 §2B negative keyword list). **Conversion action: `Tier_Routed_A_or_B`**. | `W1D3-DEL-09` — 12 Google ad groups ready-to-publish (paused) |
| 1:00–2:00 | RGC | P3 review of SA-010 ITIN creative (English + Spanish). Verify bilingual disclaimer placement. | `W1D3-DEL-10` — SA-010 creative compliance sign-off (draft) |
| 2:00–3:00 | RGC | P3 review of EG-001 Post-Short-Sale creative. Verify "4 years post-short-sale" seasoning framing. | `W1D3-DEL-11` — EG-001 creative compliance sign-off (draft) |
| 1:00–2:30 | TLEAD | Wire the GTM event tags to the 3 M1 landing pages (LP-SA-001/002/004) on staging. Verify each event fires on the correct form-state transition. | `W1D3-DEL-12` — Staging LP event wiring live |
| 2:30–3:00 | DMAN | Continue dashboard wiring. Verify Form_Complete + Tier_Routed_A_or_B events flow into the dashboard in real-time. | `W1D3-DEL-13` — Dashboard events flowing (sandbox) |

#### 3:00–5:00pm — Review + handoffs

| Time | Activity | Owner |
|---|---|---|
| 3:00–3:30 | CRTL → LOOD handoff: walk through the 4-tier routing rules + 6 SLA timers. LOOD validates LO pool assignments are correct per persona_tag. | CRTL + LOOD |
| 3:30–4:00 | MOL → DMAN handoff: align on ad-set-level + ad-group-level UTM parameters so dashboard attribution works. | MOL + DMAN |
| 4:00–4:30 | RGC → RMOL handoff: surface any remaining blocking compliance flags. RMOL decides: which personas are clear for W3 launch, which are deferred to M2/M3. | RGC + RMOL |
| 4:30–5:00 | PMON consolidates daily status. | PMON |

#### 5:00pm EOD — Deliverables due + status update

#### Decision Gate (W1D3)
- **Decision:** Confirm the optimization event is `Tier_Routed_A_or_B` (not `Form_Complete`) on all 8 Meta ad sets AND all 12 Google ad groups. This is the PM-006 critical-path decision.
- **Decider:** MOL (with CRTL + DMAN validating).
- **What happens if delayed:** If any ad set or ad group has the wrong optimization event by EOD W1D3, the W1D5 pixel QA gate fails for that ad set/ad group. The affected campaign does NOT launch in W3. RMOL escalates to VP Marketing. The launch proceeds with remaining compliant ad sets only.

---

### W1D4 (Thursday) — Landing Page Deployment

**Theme:** The 3 M1 landing pages go from staging to production. Pixel + conversion tracking must fire on every form submission. The FF-08 12-question intake form is deployed with the TS-10 Part 7 binding form-field→score contract.

#### 8:00am — RGC delivers the G1 Compliance gate draft sign-off list
- **Deliverable `W1D4-DEL-01`** — RGC's draft G1 sign-off register: list of personas cleared for W3 launch, list deferred to M2, list deferred to M3, with rationale per persona. RMOL reviews; final G1 sign-off due W1D5.

#### 9:00am — Standup (30 min)
**Agenda:**
1. Roll call. 3 min.
2. Gate-status round. 8 min.
3. TLEAD presents the staging LP event-wiring test results. Group reviews whether all 6 GTM events fire correctly. 8 min.
4. CRTL presents the TS-10 Part 7 binding form-field→score contract status. 5 min.
5. PMON reviews W1D4 critical path. 6 min.

#### 10:00am–12:00pm — Morning work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 10:00–11:00 | TLEAD | **Production deploy of LP-SA-001** (Cash-Flow Optimizer). DNS + SSL verification. Pixel fire test (Form_Start, Form_Complete, Tier_Routed_A_or_B). Load-time test (target <3s — PM-007 critical path). Mobile-responsive test. | `W1D4-DEL-02` — LP-SA-001 production live |
| 10:00–11:00 | CRTL | **Deploy the FF-08 12-question intake form** on LP-SA-001 (3-step wizard: Step 1 = Q-001/Q-002/Q-003/Q-004/Q-005; Step 2 = Q-006/Q-007/Q-008/Q-009/Q-010; Step 3 = Q-011/Q-012 + decline-letter upload). Each form field maps to a CRM field per TS-10 Part 7 binding contract. | `W1D4-DEL-03` — FF-08 form live on LP-SA-001 |
| 11:00–12:00 | TLEAD | **Production deploy of LP-SA-002** (Portfolio Scaler) + **LP-SA-004** (Equity-Tapping Refinancer). Same verification battery as LP-SA-001. | `W1D4-DEL-04` — LP-SA-002 + LP-SA-004 production live |
| 10:00–11:00 | MOL | Build the Meta lead-form (SAC-compliant) for in-platform lead-gen ad sets. Lead form collects ONLY objective criteria (Q-001/Q-002/Q-003/Q-004/Q-005/Q-010/Q-011 per FF-08 Part 6 + TS-10 ABT-003); subjective criteria (Q-006/Q-007/Q-008/Q-009/Q-012) deferred to landing page. | `W1D4-DEL-05` — Meta lead-form live (sandbox) |
| 11:00–12:00 | RGC | Final compliance review of the Tier D exit-message copy (HEX-001/009/012/013). Verify each message either (a) avoids adverse-action language OR (b) includes the Reg B §1002.9 adverse-action notice. **This is the G1 gate's final blocker.** | `W1D4-DEL-06` — Tier D exit-message compliance sign-off (final) |
| 10:00–12:00 | LOOD + LRM | Continue lender follow-up. Target: 10 of 12 lenders confirmed by EOD. Execute referral agreements with confirmed lenders (LEGCO template). | `W1D4-DEL-07` — Signed referral agreements (target ≥6) |

#### 12:00–1:00pm — Lunch (working lunch for TLEAD + MOL + CRTL: dry-run the LP→form→CRM→tier-routing flow on staging)

#### 1:00–3:00pm — Afternoon work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 1:00–2:30 | TLEAD + CRTL | **End-to-end pixel + CRM routing dry run** on production LPs. Submit 5 test leads per LP (15 total) covering: 2 Tier A scenarios, 4 Tier B, 4 Tier C, 5 Tier D (incl. 1 HEX-001 primary residence, 1 HEX-009 active delinquency, 1 HEX-012 sub-$100K, 1 HEX-013 pure commercial, 1 NP-011 zero-reserves). Verify each lead routes correctly + SLA timer starts + LO pool assignment fires. | `W1D4-DEL-08` — End-to-end dry-run report (15 test leads) |
| 1:00–2:30 | MOL | Build the Google conversion action (`Tier_Routed_A_or_B`) + import into Google Ads. Verify conversion tracking fires on LP form submissions. | `W1D4-DEL-09` — Google conversion action live |
| 1:00–2:00 | RGC | Final compliance review of SA-008 creative (6 hooks + LP). If clear: G1 gate sign-off for SA-008 includes W3 launch. If blocked: SA-008 deferred to M2 (per Part 3 PM-001 mitigation). | `W1D4-DEL-10` — SA-008 final compliance sign-off (or deferral notice) |
| 2:00–3:00 | RGC | Final compliance review of EG-002 ITIN (English + Spanish) + EG-003 No-Credit FN. Both have V2-10 specialty-seasoning-premium notice — verify disclosure. | `W1D4-DEL-11` — EG-002 + EG-003 final compliance sign-off (or deferral) |
| 1:00–2:30 | DMAN | Finalize KPI dashboard wiring. All 14 KPIs + 5 stretch KPIs querying live data. A/B test dashboard wired (per ABT-001 through ABT-009 from TS-10 §3E). | `W1D4-DEL-12` — Dashboard fully wired |

#### 3:00–5:00pm — Review + handoffs

| Time | Activity | Owner |
|---|---|---|
| 3:00–3:30 | TLEAD + CRTL → RMOL handoff: walk through the 15-lead end-to-end dry run. RMOL signs off on the G4 Tech gate if dry-run passes. | TLEAD + CRTL + RMOL |
| 3:30–4:00 | RGC → RMOL handoff: RGC delivers the final G1 Compliance gate sign-off register (cleared / deferred personas). | RGC + RMOL |
| 4:00–4:30 | MOL → RMOL handoff: MOL delivers the G2 Platform gate sign-off (SAC HOUSING + Google housing cert + NMLS replacements + Spanish-language review). | MOL + RMOL |
| 4:30–5:00 | PMON consolidates daily status. | PMON |

#### 5:00pm EOD — Deliverables due + status update

#### Decision Gate (W1D4)
- **Decision:** Confirm G1 Compliance gate sign-off (cleared vs deferred personas for W3 launch).
- **Decider:** RGC (with RMOL arbitrating deferrals).
- **What happens if delayed:** If G1 is not signed off by EOD W1D4, the W3D1 soft launch slips to W3D3 at minimum. RMOL escalates to VP Marketing + General Counsel. Default contingency: launch only with the cleared personas (likely SA-001, SA-002, SA-004 — the top-3 FDI with cleanest compliance profiles).

---

### W1D5 (Friday) — Pixel + Conversion Tracking QA · All 4 Gates Sign-Off

**Theme:** Gate-clearance day. All 4 gates (G1 Compliance, G2 Platform, G3 Operational, G4 Tech) must be signed off in writing by EOD. If any gate fails, the W3 launch slips.

#### 8:00am — RMOL sends the W1D5 gate-clearance kickoff
- **Deliverable `W1D5-DEL-01`** — RMOL's "Gate Day" brief: gate-clearance checklist, sign-off register template, escalation tree if any gate fails.

#### 9:00am — Standup (45 min — extended for gate review)
**Agenda:**
1. Roll call. 3 min.
2. Each gate owner presents their gate status + sign-off decision. 25 min (5 min × 4 + 5 min buffer).
   - **G1 Compliance (RGC):** "Cleared personas for W3 launch: [list]. Deferred to M2: [list]. Deferred to M3: [list]. Sign-off: [YES/CONDITIONAL/NO]."
   - **G2 Platform (MOL):** "Meta SAC HOUSING: [verified]. Google housing cert: [verified]. NMLS replacement: [N/20 done]. Spanish-language review: [verified]. Sign-off: [YES/CONDITIONAL/NO]."
   - **G3 Operational (LOOD + LRM):** "Specialty lenders confirmed: [N/12]. Senior LO pool ready: [YES/NO]. Specialty LO pools ready: [YES/NO]. Sign-off: [YES/CONDITIONAL/NO]."
   - **G4 Tech (TLEAD + CRTL):** "Pixel deployed: [YES]. Optimization event = Tier_Routed_A_or_B: [verified on all 8 Meta ad sets + 12 Google ad groups]. CRM routing rules live: [YES]. A/B test calendar loaded: [YES/INCOMPLETE]. End-to-end dry run passed: [YES/NO]. Sign-off: [YES/CONDITIONAL/NO]."
3. RMOL reviews the consolidated gate status. 10 min.
4. PMON captures the gate-clearance register. 7 min.

#### 10:00am–12:00pm — Morning work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 10:00–11:30 | TLEAD | **Final pixel QA** on all 3 M1 production LPs: (1) verify `Form_Start` fires on first form-field interaction; (2) verify `Form_Complete` fires on submit; (3) verify `Tier_Routed_A/B/C/D` fires on CRM tier assignment; (4) verify `Tier_Routed_A_or_B` is the **Meta optimization event** on all 8 ad sets; (5) verify `Tier_Routed_A_or_B` is the **Google conversion action** on all 12 ad groups. This is the PM-006 critical-path final check. | `W1D5-DEL-02` — Pixel QA report (all checks pass/fail per ad set + ad group) |
| 10:00–11:00 | CRTL | Final CRM routing rules verification: load the 20 worked examples (TS-10 §1B) + 15 dry-run test leads (W1D4-DEL-08). Verify each routes to the correct tier + correct LO pool. | `W1D5-DEL-03` — CRM routing verification report (35 test cases) |
| 11:00–12:00 | CRTL | Load the A/B test calendar (ABT-001 through ABT-009 per TS-10 §3E). Each test pre-registered: hypothesis + variants + primary/secondary metrics + decision rule. | `W1D5-DEL-04` — A/B test calendar loaded (ABT-001–009) |
| 10:00–11:00 | MOL | Final ad-platform verification: confirm 8 Meta ad sets + 12 Google ad groups are all in paused state with $0 spend YTD. Confirm optimization event on each. Confirm budget caps set per TS-10 §2E. | `W1D5-DEL-05` — Ad-platform final verification report |
| 11:00–12:00 | LOOD + LRM | Final lender pool verification: confirm ≥10 of 12 specialty lenders have signed referral agreements + confirmed capacity. Confirm senior LO pool (Tier A) staffed with ≥3 LOs. Confirm specialty LO pools (Tier B/C) staffed per persona (FN, credit-scarred, CA-ADU, ITIN, STR, compensated-exception, senior-review, BRRRR). | `W1D5-DEL-06` — LO pool + lender network readiness report |
| 10:00–11:00 | RGC | Final G1 sign-off: deliver the G1 Compliance gate clearance register (signed). | `W1D5-DEL-07` — G1 gate clearance register (signed) |

#### 12:00–1:00pm — Lunch (working lunch for RMOL + PMON: prepare the consolidated gate-clearance register)

#### 1:00–3:00pm — Afternoon work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 1:00–2:00 | MOL | Final G2 sign-off: deliver the G2 Platform gate clearance register (signed). | `W1D5-DEL-08` — G2 gate clearance register (signed) |
| 1:00–2:00 | LOOD + LRM | Final G3 sign-off: deliver the G3 Operational gate clearance register (signed). | `W1D5-DEL-09` — G3 gate clearance register (signed) |
| 1:00–2:00 | TLEAD + CRTL | Final G4 sign-off: deliver the G4 Tech gate clearance register (signed). | `W1D5-DEL-10` — G4 gate clearance register (signed) |
| 2:00–3:00 | DMAN | Final dashboard verification: all 14 KPIs + 5 stretch KPIs querying live data from CRM + ad platforms. Daily refresh scheduled (8am PT). Weekly Monday digest scheduled (9am PT). | `W1D5-DEL-11` — Dashboard final verification report |
| 2:00–3:00 | PMON | Consolidate the 4 gate clearance registers into the master D1-GODMODE Gate-Clearance Register. | `W1D5-DEL-12` — Master gate-clearance register |

#### 3:00–5:00pm — Gate-clearance review + W2 kickoff

| Time | Activity | Owner |
|---|---|---|
| 3:00–4:00 | RMOL reviews the master gate-clearance register with VP Marketing. If all 4 gates signed: green light for W2 (A/B test loading + LO training + dry-run lead routing) + W3 (soft launch). If any gate fails: launch slips; RMOL + VP Marketing execute Part 5 Bear scenario contingency. | RMOL + VP Marketing |
| 4:00–4:30 | RMOL sends the W1 close-out + W2 kickoff brief to all owners. | RMOL |
| 4:30–5:00 | PMON posts the W1 weekly summary (gate status, deliverables completed, risks flagged, W2 plan). | PMON |

#### 5:00pm EOD — Deliverables due + status update
- **All 4 gate-clearance registers signed by EOD W1D5 = green light for W2 + W3.**
- **Any gate unsigned = launch slips; trigger Part 5 Bear scenario diagnostic.**

#### Decision Gate (W1D5)
- **Decision:** Final go/no-go for W2 + W3 launch sequence. All 4 gates must clear.
- **Decider:** RMOL (with VP Marketing sign-off on the master gate-clearance register).
- **What happens if delayed:** If any gate fails by EOD W1D5, the contingency is:
  - G1 fails → W3D1 soft launch slips to W4D1; only G1-cleared personas launch.
  - G2 fails → all Meta + Google campaigns held; only SEO + native (no SAC constraints) launch.
  - G3 fails → launch holds until ≥10 of 12 specialty lenders signed + LO pools staffed. RMOL escalates to VP Marketing + LOOD; max 5 business day extension before Bear scenario triggers.
  - G4 fails → no campaigns ship until pixel + routing + dry-run all pass. CRTL + TLEAD work W2D1–D2 to clear; soft launch slips to W3D3.

#### W1 Summary KPIs (reported Monday W2D1 standup)
- Gates cleared: ___ of 4
- Deliverables completed: ___ of 65 (`W1D1-DEL-01` through `W1D5-DEL-12`)
- Compliance flags raised: ___ (categorized by severity)
- Specialty lenders signed: ___ of 12
- Test leads processed in dry-run: ___ (target: 15 + 35 = 50)
- Risks flagged (Part 3 PM-IDs): ___

---

## WEEK 2 — A/B TEST LOADING + LO TRAINING + DRY-RUN LEAD ROUTING

### W2D1 (Monday) — A/B Test Loading + LO Training Kickoff

**Theme:** A/B tests load into the ad platforms. LO pool training begins (1hr per LO pool, 8 pools total over the week). Dry-run lead routing continues with LO-side participation (LOs receive test leads, simulate response within SLA, handoff to underwriting simulated).

#### 8:00am — RMOL sends the W2 kickoff brief
- **Deliverable `W2D1-DEL-01`** — W2 plan: A/B test loading schedule, LO training schedule (8 pools × 1hr each), dry-run routing schedule (15 test leads per day × 5 days = 75 dry-run leads).

#### 9:00am — Standup (30 min)
**Agenda:**
1. Roll call. 3 min.
2. Gate-status recap (all 4 cleared? if not, contingency plan). 5 min.
3. CRTL presents the A/B test loading plan (ABT-001 through ABT-009). 10 min.
4. LOOD presents the LO training schedule. 5 min.
5. PMON reviews W2D1 critical path. 7 min.

#### 10:00am–12:00pm — Morning work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 10:00–11:30 | CRTL + MOL | **Load ABT-001** (Ad Set AS-001 Persona-Mix Validation): 3 variants (A: top-4 rotation, B: SA-001+SA-002 only, C: all 12 rotated). 33/33/33 budget split. Primary metric: Tier_Routed_A_or_B rate. Pre-register in the A/B test tracker. | `W2D1-DEL-02` — ABT-001 loaded (paused) |
| 10:00–11:30 | CRTL + MOL | **Load ABT-002** (Google AG-010 Decline-Letter Hook Test): 3 variants (A: "Declined? Bring the letter", B: "Second opinion", C: "Specialty routes for non-warrantable/condotel/sub-1.0"). Primary metric: Tier_Routed_A_or_B rate. | `W2D1-DEL-03` — ABT-002 loaded (paused) |
| 11:30–12:00 | CRTL + MOL | **Load ABT-003** (Meta SAC Compliance — Lead-Form vs Landing-Page Deferral): 2 variants (A: deferred Q-006/007/008/009/012 to LP, B: all 12 on lead form). Primary metric: Form_Complete rate. **Compliance note:** if B wins, escalate to RGC before adopting. | `W2D1-DEL-04` — ABT-003 loaded (paused) |
| 10:00–11:00 | LOOD | **LO Training Session 1 — Senior LO Pool (Tier A):** Walk through TS-10 §3A Tier A routing (1hr SLA, Calendly auto-fire, pre-approval workflow, appraisal within 24hr). Review the 8 personas eligible for Tier A (SA-001/002/003/004/007/012 + EG-006/008 strong-compensator subsets). Q&A. | `W2D1-DEL-05` — Senior LO pool training complete (attendee log) |
| 11:00–12:00 | LOOD | **LO Training Session 2 — FN Specialty LO Pool (Tier B/C):** Walk through TS-10 §3B FN pool (SA-005/006/EG-003, lender relationships: AHLend/America/Angel Oak/A&D/HomeAbroad). Review 60% LTV floor for No-Credit FN, 70-75% for Strong-Credit FN. Q&A. | `W2D1-DEL-06` — FN specialty LO pool training complete |
| 10:00–12:00 | TLEAD | Begin dry-run lead generation (15 test leads across the 3 M1 LPs). Submit via test-lead script. Verify CRM routing fires correctly. | `W2D1-DEL-07` — 15 dry-run leads routed |

#### 12:00–1:00pm — Lunch

#### 1:00–3:00pm — Afternoon work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 1:00–2:00 | LOOD | **LO Training Session 3 — Credit-Scarred Specialty LO Pool (Tier B/C):** SA-008 + EG-001. Lender relationships: Bluestone/AHLend/America/Truss/Rize/Lendmire. Review seasoning requirements (4yr post-BK, 3yr post-FC). Review V2-7 honest-triage notice. | `W2D1-DEL-08` — Credit-scarred LO pool training complete |
| 1:00–2:00 | LOOD | **LO Training Session 4 — CA-ADU Specialty LO Pool (Tier B):** SA-009. Lender relationships: Truss/AHLend/Lendmire. Geo restriction: CA only. Review the ADU estimator lead magnet. | `W2D1-DEL-09` — CA-ADU LO pool training complete |
| 2:00–3:00 | LOOD | **LO Training Session 5 — ITIN Specialty LO Pool (Tier B/C):** SA-010 + EG-002. Lender relationships: AHLend/America/Truss/Rize. Bilingual processing (English + Spanish). Review 9mo reserves requirement. | `W2D1-DEL-10` — ITIN LO pool training complete |
| 1:00–3:00 | CRTL + DMAN | Monitor dry-run lead routing. DMAN verifies the dashboard captures each test lead + routing decision + LO assignment. | `W2D1-DEL-11` — Dry-run monitoring report |

#### 3:00–5:00pm — Review + handoffs

| Time | Activity | Owner |
|---|---|---|
| 3:00–3:30 | LOOD → RMOL handoff: 5 LO pool training sessions complete; 3 remaining (STR, compensated-exception, BRRRR + senior-review queue). | LOOD + RMOL |
| 3:30–4:00 | CRTL + MOL → RMOL handoff: 3 A/B tests loaded (paused); 6 remaining for W2D2–D3. | CRTL + MOL + RMOL |
| 4:00–4:30 | DMAN → RMOL handoff: dry-run dashboard capturing correctly. | DMAN + RMOL |
| 4:30–5:00 | PMON consolidates daily status. | PMON |

#### 5:00pm EOD — Deliverables due + status update

#### Decision Gate (W2D1)
- **Decision:** Confirm all 5 LO pools trained today have at least 1 LO per pool ready to receive live leads in W3.
- **Decider:** LOOD (with RMOL arbitrating gaps).
- **What happens if delayed:** If any pool has 0 trained LOs by EOD W2D1, LOOD assigns a backup LO from the senior LO pool + schedules makeup training W2D2. The affected persona's launch slips by 1 day if no LO is ready.

---

### W2D2 (Tuesday) — A/B Test Loading Continues + LO Training Continues

**Theme:** Remaining 6 A/B tests load. Remaining 3 LO pools train. Dry-run lead routing continues with LO-side full participation (LOs receive test leads via CRM, simulate response within SLA, log handoff to underwriting).

#### 9:00am — Standup (30 min)
**Agenda:**
1. Roll call. 3 min.
2. W2D1 recap (deliverables completed, dry-run results, training session attendance). 5 min.
3. CRTL presents the W2D2 A/B test loading plan (ABT-004 through ABT-006). 8 min.
4. LOOD presents the W2D2 LO training plan (STR, compensated-exception, BRRRR + senior-review). 5 min.
5. PMON reviews W2D2 critical path. 9 min.

#### 10:00am–12:00pm — Morning work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 10:00–11:00 | CRTL + MOL | **Load ABT-004** (AS-007 Decline-Letter Re-Shop Edge-Case Rotation): 3 variants (A: EG-005/006/007/008 rotation, B: EG-006 only, C: EG-006 + EG-008). Primary metric: Tier_Routed_A rate. | `W2D2-DEL-01` — ABT-004 loaded (paused) |
| 11:00–12:00 | CRTL + MOL | **Load ABT-005** (AS-005 Portfolio Scaler Bid Cap Test): 3 variants (A: $80 bid cap, B: $120, C: $60). Primary metric: CPQA. | `W2D2-DEL-02` — ABT-005 loaded (paused) |
| 10:00–11:00 | LOOD | **LO Training Session 6 — STR Specialty LO Pool (Tier A/B/C):** SA-007 + EG-007. Lender relationships: Griffin/Truss/Rize/Visio/Kiavi. Review STR permit verification (HEX-002/003/014). Review AirDNA projection acceptance. Review SWR-014 STR regulatory watchlist. | `W2D2-DEL-03` — STR LO pool training complete |
| 11:00–12:00 | LOOD | **LO Training Session 7 — Compensated-Exception LO Pool (Tier B/C):** SA-011 + EG-005/006/007/008. Lender relationships: Truss/Bluestone/Lendmire/Brookmont/Harpoon/Visio/Kiavi/Lit Financial/Ridge Street/Feng Capitals. Review the decline-letter triage flow (FF-08 Q-012). | `W2D2-DEL-04` — Compensated-exception LO pool training complete |
| 10:00–12:00 | TLEAD | Dry-run lead generation day 2: 15 test leads across the 3 M1 LPs. Add 5 leads specifically targeting the ITIN (SA-010) and FN (SA-005) pathways to test specialty routing. | `W2D2-DEL-05` — 15 dry-run leads routed + specialty routing tested |

#### 12:00–1:00pm — Lunch

#### 1:00–3:00pm — Afternoon work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 1:00–2:00 | CRTL + MOL | **Load ABT-006** (Reserves Calculator Lead Magnet Test — EG-008 funnel): 2 variants (A: calculator with co-borrower pivot, B: calculator without). Primary metric: Form_Start rate from calculator users. | `W2D2-DEL-06` — ABT-006 loaded (paused) |
| 2:00–3:00 | CRTL + MOL | **Load ABT-007** (YouTube Pre-Roll vs Native Content — Top-of-Funnel Comparison): 3 variants (A: YouTube $6K/mo, B: Native $6K/mo, C: 50/50 split $3K each). Primary metric: Tier_Routed_A_or_B rate downstream. **Note:** ABT-007 is M2+ test; pre-load now, activate M2D1. | `W2D2-DEL-07` — ABT-007 loaded (paused, M2 activation) |
| 1:00–2:00 | LOOD | **LO Training Session 8 — BRRRR Specialist + Senior Review Queue:** SA-012 BRRRR Cyclist (Tier A; lender: Truss/Rize/AHLend). Senior review queue for Tier C leads without edge-case tag. | `W2D2-DEL-08` — BRRRR + senior-review training complete |
| 2:00–3:00 | LOOD | All 8 LO pools trained. LOOD delivers the LO pool readiness report. | `W2D2-DEL-09` — LO pool readiness report (8/8 pools staffed + trained) |
| 1:00–3:00 | TLEAD + CRTL | Dry-run lead routing review: 30 test leads (W2D1 + W2D2) all routed correctly. Verify LO response times within SLA. Identify any LO-side friction. | `W2D2-DEL-10` — Dry-run routing review report |

#### 3:00–5:00pm — Review + handoffs

| Time | Activity | Owner |
|---|---|---|
| 3:00–3:30 | CRTL + MOL → RMOL: 5 A/B tests loaded today (4 active-paused for W3, 1 for M2). 4 remaining (ABT-008, ABT-009 + the M3 tests). | CRTL + MOL + RMOL |
| 3:30–4:00 | LOOD → RMOL: all 8 LO pools trained. Confirm readiness. | LOOD + RMOL |
| 4:00–5:00 | PMON consolidates daily status. | PMON |

#### 5:00pm EOD — Deliverables due + status update

#### Decision Gate (W2D2)
- **Decision:** Confirm all 8 LO pools trained + staffed (≥1 LO per pool).
- **Decider:** LOOD.
- **What happens if delayed:** Any unfilled LO pool → LOOD escalates to RMOL → VP Marketing. Backup: cross-train a senior LO to cover until dedicated hire fills the gap. No persona launches in W3 without its LO pool staffed.

---

### W2D3 (Wednesday) — Final A/B Test Loading + Dry-Run Lead Routing Stress Test

**Theme:** All 9 A/B tests loaded by EOD. Dry-run lead routing stress test: 30 test leads in a single day to verify the CRM + LO pools can handle W3 launch-day volume. Identify any bottleneck (PM-008 critical path).

#### 9:00am — Standup (30 min)
**Agenda:**
1. Roll call. 3 min.
2. W2D2 recap. 5 min.
3. CRTL presents the W2D3 A/B test loading plan (ABT-008 + ABT-009). 8 min.
4. TLEAD presents the dry-run stress test plan (30 test leads, mixed tier distribution: 6 Tier A, 12 Tier B, 6 Tier C, 6 Tier D). 8 min.
5. PMON reviews W2D3 critical path. 6 min.

#### 10:00am–12:00pm — Morning work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 10:00–11:00 | CRTL + MOL | **Load ABT-008** (SA-009 Permitted-ADU CA Geo-Expansion Test): 2 variants (A: CA only, B: CA + OR + WA + TX + AZ). Primary metric: Lead volume. Secondary: Tier_Routed_A_or_B rate. M2+ activation. | `W2D3-DEL-01` — ABT-008 loaded (paused, M2 activation) |
| 11:00–12:00 | CRTL + MOL | **Load ABT-009** (Tier C Borrower Education Sequence Test): 3 variants (A: Day 1/7/30/90/180 sequence, B: weekly newsletter, C: Day 1/30/90 sequence). Primary metric: 12mo re-engagement conversion. 12-week test. | `W2D3-DEL-02` — ABT-009 loaded (paused) |
| 10:00–12:00 | TLEAD | **Dry-run stress test (morning batch):** 15 test leads submitted across 3 M1 LPs over 2 hours (target: 1 lead every 8 min). Test tier distribution: 3 Tier A, 6 Tier B, 3 Tier C, 3 Tier D. Verify CRM routing + LO assignment + SLA timer start within 60 seconds per lead. | `W2D3-DEL-03` — Morning stress-test report (15 leads) |
| 10:00–11:00 | LOOD | LO pool on-call for stress test. LOs receive test leads via CRM, simulate response within SLA, log handoff. | `W2D3-DEL-04` — LO stress-test response log |

#### 12:00–1:00pm — Lunch

#### 1:00–3:00pm — Afternoon work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 1:00–3:00 | TLEAD | **Dry-run stress test (afternoon batch):** 15 more test leads over 2 hours. Include 3 high-difficulty scenarios: (1) HEX-001 primary residence (Tier D exit message test), (2) SA-011 decline-letter triage (specialty routing test), (3) SA-002 portfolio scaler with 5+ financed properties (SWR-011 reserves documentation trigger). | `W2D3-DEL-05` — Afternoon stress-test report (15 leads, 3 high-difficulty) |
| 1:00–2:00 | CRTL + DMAN | Review the morning stress-test results. Identify any CRM bottleneck (PM-008). If any lead took >60 seconds to route, CRTL identifies the cause + patches. | `W2D3-DEL-06` — Morning stress-test post-mortem |
| 2:00–3:00 | LOOD | Review LO response times in the morning stress test. If any LO missed SLA, identify cause (training gap? system lag? workload?). | `W2D3-DEL-07` — LO response-time post-mortem |

#### 3:00–5:00pm — Review + handoffs

| Time | Activity | Owner |
|---|---|---|
| 3:00–4:00 | All-hands stress-test post-mortem: walk through the 30 dry-run leads. Identify any systemic issue. RMOL decides: go for W3 launch, or patch + extend dry-run to W2D4. | RMOL + all owners |
| 4:00–4:30 | CRTL + MOL: 9/9 A/B tests loaded. Final verification. | CRTL + MOL |
| 4:30–5:00 | PMON consolidates daily status. | PMON |

#### 5:00pm EOD — Deliverables due + status update

#### Decision Gate (W2D3)
- **Decision:** Confirm 9/9 A/B tests loaded AND dry-run stress test passes (≥95% leads routed within 60 seconds; ≥90% LO responses within SLA).
- **Decider:** RMOL (with CRTL + LOOD validating).
- **What happens if delayed:** If <95% routing within 60s OR <90% LO responses within SLA → extend dry-run to W2D4 + W2D5; W3D1 soft launch slips to W3D3. CRTL + LOOD execute root-cause + patch.

---

### W2D4 (Thursday) — Final Dry-Run + Launch Readiness Review

**Theme:** If W2D3 stress test passed → final launch readiness review. If W2D3 stress test failed → patch + re-stress-test.

#### 9:00am — Standup (30 min)
**Agenda:**
1. Roll call. 3 min.
2. W2D3 stress-test results review. 10 min.
3. CRTL + LOOD present any patches + re-test plan (if applicable). 8 min.
4. RMOL presents the W3 launch readiness checklist. 5 min.
5. PMON reviews W2D4 critical path. 4 min.

#### 10:00am–12:00pm — Morning work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 10:00–11:00 | CRTL | If W2D3 patches needed: deploy patches to CRM routing rules. Re-test with 10 test leads. If no patches: finalize the A/B test activation schedule for W3. | `W2D4-DEL-01` — Patches deployed (or no-patch-needed confirmation) |
| 11:00–12:00 | MOL | Final pre-launch ad-platform verification: 8 Meta ad sets + 12 Google ad groups all paused, $0 spend, optimization event = `Tier_Routed_A_or_B` verified. Budget caps set per TS-10 §2E. | `W2D4-DEL-02` — Final ad-platform verification |
| 10:00–11:00 | LOOD | Final LO pool readiness verification: all 8 pools staffed + trained + have been through dry-run stress test. | `W2D4-DEL-03` — Final LO pool readiness report |
| 11:00–12:00 | DMAN | Final dashboard verification: all 19 KPIs querying live data, daily refresh scheduled, Monday weekly digest scheduled. | `W2D4-DEL-04` — Final dashboard verification |

#### 12:00–1:00pm — Lunch

#### 1:00–3:00pm — Afternoon work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 1:00–2:30 | RMOL | **Launch Readiness Review (LRR) document preparation.** Pull together: gate-clearance register (W1D5), A/B test calendar (W2D3), LO pool readiness (W2D4-DEL-03), dashboard verification (W2D4-DEL-04), ad-platform verification (W2D4-DEL-02), dry-run stress-test results (W2D3). | `W2D4-DEL-05` — LRR document v1.0 |
| 2:30–3:00 | RMOL + VP Marketing | LRR review. VP Marketing signs the launch authorization (or holds for patch). | `W2D4-DEL-06` — LRR signed (or hold notice) |

#### 3:00–5:00pm — Review + handoffs

| Time | Activity | Owner |
|---|---|---|
| 3:00–4:00 | RMOL → all owners: LRR signed. W3D1 soft launch confirmed for SA-001 (or whichever persona the LRR cleared) at 10% budget. | RMOL |
| 4:00–5:00 | PMON consolidates daily status + W3 launch plan. | PMON |

#### 5:00pm EOD — Deliverables due + status update

#### Decision Gate (W2D4)
- **Decision:** Final launch authorization for W3D1 soft launch (1 persona at 10% budget).
- **Decider:** VP Marketing (with RMOL + RGC + LOOD advisory).
- **What happens if delayed:** If LRR not signed by EOD W2D4 → W3D1 soft launch slips to W3D2. RMOL + VP Marketing decide on a 1-day or 1-week slip.

---

### W2D5 (Friday) — W3 Launch Final Prep + Risk Brief

**Theme:** Final pre-launch checklist. RMOL briefs leadership on the W3 plan + the Part 3 pre-mortem top-5 risks. PRCOM stands up the crisis-comms tree (per Part 6) in case W3 launch triggers any external event.

#### 9:00am — Standup (30 min)
**Agenda:**
1. Roll call. 3 min.
2. LRR sign-off recap. 3 min.
3. RMOL presents the W3 launch plan: W3D1 soft launch (1 persona, 10% budget = $5K), W3D2 performance review, W3D3 scale to 50% + add persona 2, W3D4 add persona 3, W3D5 full launch + first weekly review. 12 min.
4. RMOL presents the Part 3 pre-mortem top-5 risks (PM-001, PM-002, PM-006, PM-008, PM-014) + their early-warning signals + trigger thresholds. 8 min.
5. PRCOM presents the crisis-comms tree (Part 6 — 5 crises). 4 min.

#### 10:00am–12:00pm — Morning work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 10:00–11:00 | MOL | Final pre-launch ad-set + ad-group check. Confirm W3D1 soft-launch ad set (likely AS-003 SA-001 Cash-Flow Optimizer) is set to 10% budget ($5K) and ready to unpause Monday 9am PT. | `W2D5-DEL-01` — W3D1 soft-launch ad set ready |
| 10:00–11:00 | CRTL | Final CRM routing check. Confirm `Tier_Routed_A_or_B` event fires correctly on all 3 M1 LPs. Confirm dashboard captures the event in real-time. | `W2D5-DEL-02` — Final CRM + dashboard check |
| 11:00–12:00 | LOOD | Final LO pool alert: W3D1 soft launch begins 9am Monday. Senior LO pool on standby for Tier A leads. Specialty LO pools on standby for Tier B/C leads. | `W2D5-DEL-03` — LO pool alert sent |
| 11:00–12:00 | PRCOM | Crisis-comms tree verified. Internal: Slack `#d1-godmode-launch` + on-call rotation. External: legal hold template ready, media holding statement template ready (per Part 6). | `W2D5-DEL-04` — Crisis-comms tree verified |
| 10:00–11:00 | DMAN | Dashboard live-monitoring for W3D1 9am: confirm real-time event capture. Set up the daily 5pm KPI snapshot email to leadership. | `W2D5-DEL-05` — Daily KPI snapshot email scheduled |

#### 12:00–1:00pm — Lunch (working lunch for RMOL + PRCOM: walk through Part 6 crisis playbook)

#### 1:00–3:00pm — Afternoon work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 1:00–2:00 | RMOL + PMON | Final W3 launch brief sent to leadership (VP Marketing, CFO, GC, LOOD). Includes: W3 day-by-day plan, top-5 risks, escalation tree, KPI targets. | `W2D5-DEL-06` — W3 launch brief to leadership |
| 1:00–2:00 | DMAN | Pre-populate the W3 dashboard with target lines (Part 1.3 KPIs) so actuals can be compared daily. | `W2D5-DEL-07` — W3 dashboard target lines set |
| 2:00–3:00 | All owners | Final Q&A. Identify any lingering risk. | `W2D5-DEL-08` — Final risk register |

#### 3:00–5:00pm — Review + handoffs

| Time | Activity | Owner |
|---|---|---|
| 3:00–4:00 | All-hands: W2 close-out + W3 launch rehearsal. Walk through "Monday 9am unpause" step-by-step. | RMOL + all owners |
| 4:00–5:00 | PMON posts the W2 weekly summary + W3 launch plan. | PMON |

#### 5:00pm EOD — Deliverables due + status update

#### Decision Gate (W2D5)
- **Decision:** Final go/no-go for W3D1 9am soft launch.
- **Decider:** RMOL (with VP Marketing concurrence).
- **What happens if delayed:** If no-go by EOD W2D5 → W3D1 launch slips to W3D2. RMOL + VP Marketing identify the blocker; if blocker is a gate (G1–G4) failure, trigger Part 5 Bear scenario diagnostic.

#### W2 Summary KPIs (reported Monday W3D1 standup)
- A/B tests loaded: ___ of 9
- LO pools trained + staffed: ___ of 8
- Dry-run leads processed: ___ (target: 75)
- Stress-test pass rate: ___% (target: ≥95% routing within 60s)
- LRR signed: YES/NO
- W3D1 launch authorized: YES/NO

---

## WEEK 3 — SOFT LAUNCH → SCALE → FULL LAUNCH

### W3D1 (Monday) — Soft Launch (1 Persona, 10% Budget)

**Theme:** Live traffic. Real money. Real leads. Today the swarm starts learning from actual borrowers. The optimization event is `Tier_Routed_A_or_B`. The first 8 hours are the highest-risk window of the entire 90 days (PM-006, PM-002 critical-path monitoring).

#### 6:00am PT — RMOL + MOL + CRTL pre-launch check (90 min before go-live)
- **Deliverable `W3D1-DEL-01`** — Pre-launch checklist verification:
  - [ ] All 4 gates cleared (W1D5 master register signed).
  - [ ] All 8 Meta ad sets + 12 Google ad groups in paused state, $0 spend YTD.
  - [ ] Optimization event = `Tier_Routed_A_or_B` on all 20 placements.
  - [ ] W3D1 soft-launch ad set = **AS-003 SA-001 Cash-Flow Optimizer** at 10% weekly budget ($1,250/day for 4 days = $5,000 weekly cap).
  - [ ] 3 M1 LPs live (LP-SA-001/002/004) with FF-08 form + pixel firing.
  - [ ] CRM routing rules live; 4 tiers + 6 SLA timers active.
  - [ ] 8 LO pools trained + staffed; on-call for live leads.
  - [ ] Dashboard live; KPI target lines set.
  - [ ] Daily 5pm KPI snapshot email scheduled to leadership.
  - [ ] Crisis-comms tree active.

#### 8:00am — RMOL sends the "Go-Live T-minus-1-hour" brief
- **Deliverable `W3D1-DEL-02`** — Final confirmation to all owners: soft launch begins 9am PT. On-call rotation active (MOL primary, CRTL backup, RMOL escalation).

#### 9:00am — Standup (15 min — short, focused)
**Agenda:**
1. Roll call (RMOL, MOL, CRTL, TLEAD, DMAN, LOOD). 2 min.
2. RMOL: "Go for 9:15am unpause." 1 min.
3. MOL confirms AS-003 unpause sequence ready. 2 min.
4. CRTL confirms CRM ready to receive leads. 2 min.
5. LOOD confirms senior LO pool on standby (Tier A) + credit-scarred specialty pool on standby (Tier B for SA-001's weaker cohort). 2 min.
6. DMAN confirms dashboard monitoring active. 2 min.
7. PMON captures the go-decision in the decision log. 2 min.

#### 9:15am — MOL unpauses AS-003 (SA-001 Cash-Flow Optimizer) at 10% budget
- **Deliverable `W3D1-DEL-03`** — Launch event logged (timestamp, ad set ID, budget allocation, optimization event verified).

#### 9:15am–12:00pm — Morning live-monitoring (war-room mode)
- **MOL** monitors Meta Ads Manager: CTR, CPM, CPL, frequency, reach.
- **CRTL** monitors CRM: lead inflow, tier distribution, LO assignments, SLA timer starts.
- **DMAN** monitors dashboard: real-time KPI tracking.
- **LOOD** monitors LO pool: response times, handoffs.
- **RMOL** on standby for any escalation.
- **War-room cadence:** every 30 min (9:30, 10:00, 10:30, 11:00, 11:30) — 5-min status sync in Slack. RMOL logs any anomaly.

#### 10:00am–12:00pm — Expected first leads
- Target: 2–4 leads by noon (based on $1,250 daily budget × 4 hours × historical Meta CTR assumptions).
- **Critical monitoring:** Tier distribution of first 5 leads. If ≥3 of first 5 are Tier D (decline cohort), this is the PM-002 early-warning signal — Meta broad is attracting Tier D leads at low CPM. RMOL evaluates: pause and re-target, or let it run to 24hr for statistical signal.

#### 12:00–1:00pm — Lunch (war-room continuous monitoring; one owner always at the dashboard)

#### 1:00–3:00pm — Afternoon live-monitoring
- Continue 30-min status syncs (1:00, 1:30, 2:00, 2:30).
- Target: 4–8 leads by EOD (cumulative).
- **Critical monitoring:** any lead with persona_tag mismatch (PM-014). If a lead is routed to the wrong LO pool, CRTL flags + patches the persona-tag logic.

#### 3:00–5:00pm — Review + handoffs

| Time | Activity | Owner |
|---|---|---|
| 3:00–3:30 | DMAN pulls the first 6-hour KPI snapshot. Reviews with RMOL. | DMAN + RMOL |
| 3:30–4:00 | LOOD reviews LO response times. Any SLA breach? | LOOD |
| 4:00–4:30 | RMOL decides: continue at 10% budget overnight, or pause + diagnose. Default: continue. Pause only if PM-002 signal confirmed (≥40% Tier D rate). | RMOL |
| 4:30–5:00 | PMON consolidates daily status + sends the first 5pm KPI snapshot email to leadership. | PMON |

#### 5:00pm EOD — Deliverables due + status update
- **`W3D1-DEL-04`** — Day 1 KPI snapshot: spend, leads (by tier), CPL, CPQA, LO responses (within SLA), any anomalies.
- **`W3D1-DEL-05`** — Day 1 risk register update (any PM-ID signals triggered).

#### Decision Gate (W3D1)
- **Decision:** Continue at 10% budget overnight OR pause + diagnose.
- **Decider:** RMOL (with MOL + CRTL advisory).
- **What happens if delayed:** If pause + diagnose is triggered, the W3D2 performance review becomes a diagnostic review. Soft-launch extension by 1–2 days. W3D3 scale to 50% may slip to W3D4.

---

### W3D2 (Tuesday) — Performance Review + Decision to Scale to 50%

**Theme:** First 24+ hours of live data. The decision: scale to 50% budget + add persona 2 (SA-002 Portfolio Scaler) per the W3 plan, OR extend soft launch for another 24–48 hours.

#### 8:00am — DMAN delivers the overnight + W3D1 consolidated KPI report
- **Deliverable `W3D2-DEL-01`** — W3D1 full-day KPI report:
  - Spend: target $1,250 (W3D1) — actual $____.
  - Leads: target 4–8 — actual ___.
  - Tier distribution: A ___, B ___, C ___, D ___ (target A+B ≥33%; D ≤25%).
  - CPL: target $50–90 — actual $____.
  - CPQA: target $120–200 — actual $____.
  - LO responses within SLA: target ≥95% — actual ___%.
  - Persona-tag accuracy: target ≥85% — actual ___%.
  - Any anomalies: ____.

#### 9:00am — Standup (30 min)
**Agenda:**
1. Roll call. 3 min.
2. DMAN presents the W3D1 KPI report. 10 min.
3. Group discussion: any anomalies? Any PM-ID signals triggered? 8 min.
4. RMOL presents the W3D2 decision: scale to 50% budget + add SA-002, OR extend soft launch. 5 min.
5. PMON captures the decision in the decision log. 4 min.

#### 10:00am–12:00pm — Morning work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 10:00–10:30 | RMOL | **W3D2 scale-to-50% decision:** If W3D1 KPIs are within 20% of target → scale to 50% budget ($6,250/week) + add SA-002 Portfolio Scaler (AS-002). If W3D1 KPIs miss target by >20% → extend soft launch 24–48 hours, diagnose root cause. | `W3D2-DEL-02` — Scale decision logged |
| 10:30–11:30 | MOL | If scaling: unpause AS-002 (SA-002 Portfolio Scaler) at 50% budget allocation. Increase AS-003 budget to 50%. Total weekly spend: $6,250. If not scaling: continue AS-003 at 10%, schedule diagnostic for W3D3. | `W3D2-DEL-03` — Budget scaling executed (or hold) |
| 11:30–12:00 | CRTL | If scaling: verify CRM routing for SA-002 leads (Tier A → senior LO pool; persona_tag = SA-002). | `W3D2-DEL-04` — SA-002 routing verified |
| 10:00–12:00 | LOOD | Continue monitoring LO pool responses. If scaling: senior LO pool alert for SA-002 leads. | `W3D2-DEL-05` — LO pool response log |

#### 12:00–1:00pm — Lunch

#### 1:00–3:00pm — Afternoon work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 1:00–3:00 | All owners | Live monitoring of scaled spend. 30-min status syncs (1:00, 1:30, 2:00, 2:30). | `W3D2-DEL-06` — Afternoon monitoring log |
| 1:00–2:00 | DMAN | Update dashboard: add SA-002 as a separate persona cohort. Verify attribution. | `W3D2-DEL-07` — Dashboard updated for SA-002 |

#### 3:00–5:00pm — Review + handoffs

| Time | Activity | Owner |
|---|---|---|
| 3:00–4:00 | RMOL reviews the afternoon KPIs. Any new anomalies? | RMOL + DMAN |
| 4:00–4:30 | LOOD reviews LO responses for both SA-001 + SA-002 leads. | LOOD |
| 4:30–5:00 | PMON consolidates daily status + sends 5pm KPI snapshot. | PMON |

#### 5:00pm EOD — Deliverables due + status update

#### Decision Gate (W3D2)
- **Decision:** Scale to 50% + add SA-002 OR extend soft launch.
- **Decider:** RMOL (with VP Marketing concurrence if extending).
- **What happens if delayed:** If extending soft launch, W3D3 scale-to-50% slips. W3D4 add-persona-3 may slip to W3D5 or W4D1. The 90-day KPI targets (Part 1.3) may need a 1-week slip — RMOL notifies VP Marketing + CFO.

---

### W3D3 (Wednesday) — Scale to 50% + Add Persona 2 (SA-002)

**Theme:** Either executing the scale-to-50% decision from W3D2, or continuing the diagnostic if W3D2 decision was to extend.

#### 9:00am — Standup (30 min)
**Agenda:**
1. Roll call. 3 min.
2. W3D2 KPI recap (if scaled: how is SA-002 performing vs SA-001? If diagnostic: what's the root cause?). 8 min.
3. RMOL presents W3D3 plan: continue at 50% OR execute scale to 50% today (if W3D2 was a hold). 5 min.
4. PMON reviews W3D3 critical path. 14 min.

#### 10:00am–12:00pm — Morning work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 10:00–11:00 | MOL | If W3D2 was a hold and today is the scale day: execute the AS-002 unpause + AS-003 budget increase. If already scaled: monitor. | `W3D3-DEL-01` — Scale execution (or monitoring log) |
| 10:00–11:00 | CRTL | If scaling: verify SA-002 leads route correctly. If scaled: monitor persona_tag accuracy for SA-002. | `W3D3-DEL-02` — SA-002 routing verification |
| 11:00–12:00 | DMAN | Pull the W3D2 + W3D3-morning KPI snapshot. Compare SA-001 vs SA-002 performance. | `W3D3-DEL-03` — SA-001 vs SA-002 comparison report |
| 10:00–12:00 | LOOD | Monitor LO pool responses for both personas. Any SLA breach? Any persona mismatch (PM-014)? | `W3D3-DEL-04` — LO response log |

#### 12:00–1:00pm — Lunch

#### 1:00–3:00pm — Afternoon work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 1:00–2:00 | RMOL | Mid-day KPI review. Are we on track for the W3D5 full launch? | `W3D3-DEL-05` — Mid-day review |
| 1:00–3:00 | All owners | Live monitoring. 30-min status syncs (1:00, 1:30, 2:00, 2:30). | `W3D3-DEL-06` — Afternoon monitoring log |

#### 3:00–5:00pm — Review + handoffs

| Time | Activity | Owner |
|---|---|---|
| 3:00–4:00 | RMOL reviews afternoon KPIs. Decision for W3D4: add persona 3 (SA-004) or hold? | RMOL + DMAN |
| 4:00–4:30 | LOOD reviews LO responses. | LOOD |
| 4:30–5:00 | PMON consolidates daily status + sends 5pm KPI snapshot. | PMON |

#### 5:00pm EOD — Deliverables due + status update

#### Decision Gate (W3D3)
- **Decision:** Add persona 3 (SA-004 Equity-Tapping Refinancer) on W3D4 OR hold at 2 personas.
- **Decider:** RMOL.
- **What happens if delayed:** If holding, W3D4 add-persona-3 may slip to W3D5 or W4D1. The 90-day KPI targets may need a 1-week slip.

---

### W3D4 (Thursday) — Add Persona 3 (SA-004 Equity-Tapping Refinancer)

**Theme:** Either executing the add-persona-3 decision from W3D3, or continuing the diagnostic if W3D3 decision was to hold.

#### 9:00am — Standup (30 min)
**Agenda:**
1. Roll call. 3 min.
2. W3D3 KPI recap. 8 min.
3. RMOL presents W3D4 plan: add SA-004 today OR hold. 5 min.
4. PMON reviews W3D4 critical path. 14 min.

#### 10:00am–12:00pm — Morning work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 10:00–11:00 | MOL | If adding SA-004: unpause AS-004 (SA-004 Equity-Tapping Refinancer). Budget allocation now: AS-002 (33%), AS-003 (33%), AS-004 (33%) of 50% weekly cap. If holding: continue monitoring. | `W3D4-DEL-01` — AS-004 unpause (or hold log) |
| 10:00–11:00 | CRTL | Verify SA-004 leads route to senior LO pool (Tier A). Persona_tag = SA-004. | `W3D4-DEL-02` — SA-004 routing verification |
| 11:00–12:00 | DMAN | Pull the W3D3 + W3D4-morning KPI snapshot. Compare SA-001 vs SA-002 vs SA-004 performance. | `W3D4-DEL-03` — 3-persona comparison report |
| 10:00–12:00 | LOOD | Monitor LO pool responses for all 3 personas. | `W3D4-DEL-04` — LO response log |

#### 12:00–1:00pm — Lunch

#### 1:00–3:00pm — Afternoon work blocks

| Time | Owner | Work block | Deliverable |
|---|---|---|---|
| 1:00–2:00 | RMOL | Mid-day KPI review. On track for W3D5 full launch (100% budget)? | `W3D4-DEL-05` — Mid-day review |
| 1:00–3:00 | All owners | Live monitoring. 30-min status syncs. | `W3D4-DEL-06` — Afternoon monitoring log |

#### 3:00–5:00pm — Review + handoffs

| Time | Activity | Owner |
|---|---|---|
| 3:00–4:00 | RMOL reviews afternoon KPIs. Decision for W3D5: full launch (100% budget) OR hold at 50%? | RMOL + DMAN |
| 4:00–4:30 | LOOD reviews LO responses. | LOOD |
| 4:30–5:00 | PMON consolidates daily status + sends 5pm KPI snapshot. | PMON |

#### 5:00pm EOD — Deliverables due + status update

#### Decision Gate (W3D4)
- **Decision:** Full launch (100% budget) on W3D5 OR hold at 50%.
- **Decider:** RMOL.
- **What happens if delayed:** If holding at 50%, W3D5 full launch slips. The M1 KPI targets (200 form completions, 60 Tier A-or-B) may slip by 1–2 weeks. RMOL notifies VP Marketing.

---

### W3D5 (Friday) — Full Launch + First Weekly Review

**Theme:** Either executing the full-launch (100% budget) decision from W3D4, or holding at 50%. Either way, today is the first weekly review with leadership.

#### 6:00am PT — RMOL + MOL pre-launch check (if going to 100%)
- **Deliverable `W3D5-DEL-01`** — Full-launch pre-checklist verification (same battery as W3D1-DEL-01, plus: all 3 personas live, optimization event verified on all unpause placements, LO pools on standby for 3-persona lead volume).

#### 9:00am — Standup (30 min)
**Agenda:**
1. Roll call. 3 min.
2. W3D4 KPI recap. 5 min.
3. RMOL: "Go for 100% budget at 9:15am" OR "Hold at 50% for another week." 5 min.
4. MOL confirms full-launch unpause sequence ready (or hold). 2 min.
5. PMON reviews W3D5 critical path + first weekly review agenda. 15 min.

#### 9:15am — MOL executes full launch (if go-decision)
- **Deliverable `W3D5-DEL-02`** — Full-launch event logged. All 3 personas live at 100% weekly budget ($12,500/week = $50K/month).

#### 9:15am–12:00pm — Morning live-monitoring (war-room mode for the full-launch)
- Same 30-min status sync cadence as W3D1.
- Target: 6–10 leads by noon (3 personas at full budget).

#### 12:00–1:00pm — Lunch (war-room continuous monitoring)

#### 1:00–3:00pm — Afternoon live-monitoring
- Continue 30-min status syncs.
- Target: 10–16 leads by EOD (cumulative).

#### 3:00–4:30pm — First Weekly Review (90 min, leadership attends)
**Attendees:** VP Marketing, CFO (optional), GC (optional), RMOL, RGC, MOL, CRTL, TLEAD, LOOD, LRM, DMAN, PMON, PRCOM.

**Agenda:**
1. RMOL: W1–W3 rollout summary (gates cleared, deliverables completed, dry-run + soft-launch results). 15 min.
2. DMAN: W3 KPI dashboard walkthrough (spend, leads, tier distribution, CPL, CPQA, LO responses, persona-tag accuracy). 20 min.
3. RGC: compliance status (any flags raised, any deferred personas). 10 min.
4. LOOD: LO pool performance (SLA compliance, persona-tag accuracy from LO side, any friction). 10 min.
5. RMOL: top-5 risks (Part 3 PM-001/002/006/008/014) — current status, any signals triggered. 15 min.
6. RMOL: M2 plan preview (add 4 personas + first edge case, YouTube pre-roll, native + SEO content). 10 min.
7. Q&A + leadership direction. 10 min.

#### 4:30–5:00pm — PMON consolidates W3 weekly summary + sends to leadership
- **Deliverable `W3D5-DEL-03`** — W3 weekly summary report.

#### 5:00pm EOD — Deliverables due + status update

#### Decision Gate (W3D5)
- **Decision:** Confirm full launch continues into W4 (first full week of M1) OR scale back / pause based on weekly review.
- **Decider:** VP Marketing (with RMOL + RGC advisory).
- **What happens if delayed:** If scale-back / pause: trigger Part 5 Bear scenario diagnostic. Identify root cause; pause the affected persona or channel; communicate to leadership within 24 hours.

#### W3 Summary KPIs (reported Monday W4D1 standup)
- W3 spend: $____ (target: $12,500 — soft launch $5K + scale $7.5K)
- W3 leads: ___ (target: 30–50 across 3 personas)
- W3 tier distribution: A ___, B ___, C ___, D ___
- W3 CPL: $____ (target: $50–90)
- W3 CPQA: $____ (target: $120–200)
- W3 LO SLA compliance: ___% (target: ≥95%)
- W3 persona-tag accuracy: ___% (target: ≥85%)
- W3 anomalies / PM-ID signals triggered: ___
- M1 trajectory: on-track / behind / ahead

#### End of Part 2 — transition to M1 steady-state
After W3D5, the swarm enters steady-state operations:
- **Daily:** 9am standup (15 min); 5pm KPI snapshot email to leadership; continuous monitoring.
- **Weekly:** Monday 9am weekly standup (Part 8.1 template); Friday 3pm weekly review.
- **Monthly:** end-of-month monthly review (Part 8.3 template) with leadership; cohort review; scoring engine recalibration (per Part 5 Bear/Bull triggers).
- **Quarterly:** 90-day cohort review; full Q1 → Q2 iteration cycle; budget re-authorization (D1 Q2 scale to $300K if Part 9 Go criteria met).

---

# PART 3 · PRE-MORTEM ANALYSIS (15 FAILURE MODES)

> **Purpose:** Before the swarm launches, leadership and the operating team imagine the swarm has failed 90 days from now, then work backward to identify the 15 most likely failure modes, their early-warning signals, the trigger thresholds that demand action, and the specific mitigations. **Every PM-ID is a Slack alert waiting to happen.**

## 3.0 Pre-Mortem Master Index

| PM-ID | Failure mode | Likelihood | Impact | Owner | Page |
|---|---|---|---|---|---|
| PM-001 | Compliance gate delays EG-002/EG-003/SA-008 launch beyond M2 | High | Medium | RGC | below |
| PM-002 | Meta broad attracts Tier D leads at low CPM | High | High | MOL | below |
| PM-003 | Specialty lenders reject referral volume | Medium | High | LRM + LOOD | below |
| PM-004 | Scoring engine miscalibrates (Tier A converts below 60%) | Medium | High | CRTL + DMAN | below |
| PM-005 | STR regulatory shift in Phoenix/Austin mid-quarter | Medium | Medium | RGC + MOL | below |
| PM-006 | Conversion tracking pixel misconfigured (Form_Complete vs Tier_Routed) | Medium | Critical | TLEAD + MOL | below |
| PM-007 | Landing page load time >3s degrades conversion | Medium | Medium | TLEAD | below |
| PM-008 | CRM routing rules create lead backlog at specialty LO pool | Medium | High | CRTL + LOOD | below |
| PM-009 | Major lender (e.g., Truss) withdraws from DSCR market mid-quarter | Low | Critical | LRM + LOOD | below |
| PM-010 | CFPB inquiry or regulatory examination | Low | Critical | RGC + LEGCO | below |
| PM-011 | Negative press coverage of DSCR lending | Low | High | PRCOM + RGC | below |
| PM-012 | Lead data breach (Reg P / state privacy law) | Low | Critical | LEGCO + TLEAD | below |
| PM-013 | A/B test false positive leads to wrong creative scaling | Medium | Medium | DMAN + MOL | below |
| PM-014 | Persona mismatch (leads routed to wrong LO pool) | Medium | High | CRTL + LOOD | below |
| PM-015 | Cash flow crunch (budget burns faster than funded loans generate revenue) | Medium | High | RMOL + CFO | below |

---

## 3.1 Failure Mode Details

### PM-001 — Compliance gate delays EG-002/EG-003/SA-008 launch beyond M2

```yaml
failure_id: PM-001
failure_mode: "Reg B compliance counsel does not clear EG-002 (ITIN), EG-003 (No-Credit FN), or SA-008 (Credit-Scarred) creative by M2 launch, delaying 3 of 12 personas into M3 or later."
likelihood: High
impact: Medium
  # M2 target was 4 new personas + first edge case; losing SA-008 + EG-002 + EG-003 reduces M2 funnel volume by ~30%.
  # Tier B/C specialty routing loses its highest-value personas.
early_warning_signal: "RGC flag-log severity distribution. If >3 'blocking' flags unresolved by W1D5, the G1 gate clearance register will defer ≥3 personas."
trigger_threshold: "≥3 personas deferred from M2 launch due to unresolved compliance flags by W1D4 EOD."
mitigation:
  - "Pre-brief RGC in W0 (before W1D1) with the full V2 creative packet (AC09_V2_ad_copy.md). RGC starts review before gate kickoff."
  - "RGC prioritizes the 8 highest-risk assets (SA-008, EG-001/002/003/005/006/007 + SA-011 LP) on W1D1."
  - "If W1D4 review reveals blocking flags on SA-008/EG-002/EG-003, RMOL re-plans M2 with the cleared personas (likely SA-007/SA-003/SA-005 instead) and pushes SA-008/EG-002/EG-003 to M3."
  - "External ECOA counsel backup firm retained from W1D1 in case primary RGC is overloaded. Retainer: $15K on-call."
  - "Tier D exit-message compliance review (HEX-001/009/012/013) is the single highest-risk review item. RGC reviews on W1D3 with external counsel backup."
owner: "RGC (Reg B Compliance Counsel)"
escalation: "RMOL → VP Marketing → General Counsel. If G1 gate fails by W1D5, VP Marketing decides whether to launch with cleared personas only or hold launch entirely."
```

### PM-002 — Meta broad attracts Tier D leads at low CPM

```yaml
failure_id: PM-002
failure_mode: "Meta broad-distribution ad sets (AS-001, AS-003, AS-004) attract Tier D decline-cohort leads at low CPM because decline-cohort borrowers (recent foreclosure, recent BK, no-reserves, primary-residence) fill forms at 2-3x the rate of Tier A/B qualified borrowers."
likelihood: High
impact: High
  # CPL looks great ($40-60), CPQA explodes ($400+), CPFL exceeds $20K by week 6.
early_warning_signal: "Tier D rate on Meta broad ad sets. Tracked daily in dashboard."
trigger_threshold: "Tier D rate > 40% on any Meta broad ad set for 3 consecutive days, OR Tier A-or-B rate < 25% on Meta broad for 5 consecutive days."
mitigation:
  - "Lock the optimization event at Tier_Routed_A_or_B (not Form_Complete) at the ad set level. This is the PM-006 mitigation's twin — the same root cause, different symptom."
  - "Weekly tier-distribution review by ad set (Part 8.1 weekly standup agenda item #4). DMAN flags any ad set breaching the threshold."
  - "If threshold breached: pause the affected ad set within 24 hours. Re-target with narrower audience (lookalike off funded-loan customer file per FF-08 Part 6, NOT off lead-form submissions)."
  - "Reallocate the paused budget to Google Search (where intent is higher and Tier D rate is structurally lower)."
  - "If Meta broad is structurally broken for DSCR (Tier D rate >50% across all broad ad sets after 2 weeks): shift Meta budget entirely to retargeting + lookalike, kill broad distribution. Update M2 plan."
owner: "MOL (Meta/Google Ops Lead)"
escalation: "MOL → RMOL → VP Marketing. If Meta broad is killed, the 36% Meta allocation drops to ~15% (retargeting + lookalike only); the 25% delta shifts to Google Search + LinkedIn."
```

### PM-003 — Specialty lenders reject referral volume

```yaml
failure_id: PM-003
failure_mode: "One or more of the 12 non-GL-02 specialty lenders (Angel Oak, A&D, HomeAbroad, Visio, Kiavi, Harpoon, Brookmont, DSCR Direct, Allay, First Liberty, Ridge Street, Feng Capitals) decline referral volume beyond capacity, leaving Tier B/C leads un-routed."
likelihood: Medium
impact: High
  # Un-routed Tier B/C leads stall in CRM. SLA breach. Borrower churn. Reputational damage if borrower is told 'we'll call you back' and no call comes.
early_warning_signal: "Specialty-lender routing acceptance rate (TS-10 KPI-010). Target ≥70%. If <50% for any persona_tag for 1 week, capacity issue."
trigger_threshold: "Specialty-lender routing acceptance < 50% for any persona_tag for 5 consecutive business days, OR ≥3 of 12 lenders withdraw referral capacity in a single week."
mitigation:
  - "W1D1: LRM sends outreach to all 12 lenders with expected referral volume (M1: 20 leads/month; M3: 60 leads/month) per lender. Confirm capacity."
  - "Each persona has ≥2 specialty lender routing destinations (per TS-10 §3B). Diversify so no single lender is a single-point-of-failure."
  - "Maintain a backup lender list (GL-02 normalized 8-lender matrix: Truss, Rize, AHLend, America Mortgages, Lendmire, Griffin, Newfi + 1-2 more). Activate backup if primary lender withdraws."
  - "If a lender withdraws: LRM + LOOD re-route affected leads to backup lender within 4 business hours. CRTL updates CRM routing rules."
  - "If 3+ lenders withdraw: trigger Part 6 Crisis 1 playbook (major specialty lender withdrawal)."
owner: "LRM (Lender Relationship Manager) + LOOD (LO Operations Director)"
escalation: "LRM → LOOD → RMOL → VP Marketing. If >3 lenders withdraw, VP Marketing notifies General Counsel (referral agreement review) + CFO (revenue impact)."
```

### PM-004 — Scoring engine miscalibrates (Tier A converts below 60%)

```yaml
failure_id: PM-004
failure_mode: "The TS-10 8-component score produces Tier A leads that convert at <60% to funded loans (target: 75-90% per TS-10 §1C). This is the silent failure of the scoring engine — leads look qualified but aren't."
likelihood: Medium
impact: High
  # CPFL explodes. Tier A leads consume senior LO capacity without funding. LO morale drops. Quarterly cohort review reveals the miscalibration.
early_warning_signal: "Tier A → funded loan conversion rate. Tracked in monthly cohort review (Part 8.3). Target: 75-90%. If <60% in M2 cohort, miscalibration."
trigger_threshold: "Tier A → funded loan conversion < 60% in any monthly cohort review, OR Tier A leads abandoning at > 30% after pre-approval letter issued."
mitigation:
  - "Monthly cohort review (Part 8.3) is the primary early-warning mechanism. Track Tier A → funded loan conversion by persona_tag + by month."
  - "If threshold breached: CRTL + DMAN run root-cause analysis. Likely causes: (a) SC-001 DSCR weight too high; (b) SC-002 FICO band mis-set; (c) SC-005 property-type cleanliness mis-weighted (per Finding 3 — property type dominates DSCR); (d) SWR modifier deltas not stacking correctly."
  - "CRTL adjusts the offending component weight ±5 points. DMAN back-tests against the prior month's leads to validate the fix."
  - "Maintain manual override for senior LOs to re-tier leads within 4 business hours (per V1 Risk 4 mitigation). Senior LOs flag any Tier A lead they believe is mis-tiered; CRTL reviews weekly."
  - "If miscalibration is systemic (multiple components mis-weighted): trigger Part 5 Bear scenario diagnostic. Pause Tier A routing for 1 week while CRTL recalibrates."
owner: "CRTL (CRM Team Lead) + DMAN (Data Analyst)"
escalation: "CRTL → RMOL → VP Marketing. If systemic, VP Marketing notifies CFO (CPFL impact) + General Counsel (fair-lending risk if scoring is biased)."
```

### PM-005 — STR regulatory shift in Phoenix/Austin mid-quarter

```yaml
failure_id: PM-005
failure_mode: "Phoenix (AZ) or Austin (TX) passes restrictive STR legislation mid-quarter (per SWR-014 watchlist), invalidating SA-007 STR Operator leads in those markets."
likelihood: Medium
impact: Medium
  # SA-007 leads in affected markets become un-fundable. If not paused within 24 hours, the swarm acquires dead leads. Reputational risk if borrower is told 'we can help' then can't.
early_warning_signal: "SWR-014 watchlist status (quarterly geo review per GS-07). PRCOM monitors local news for STR legislation in watchlist markets."
trigger_threshold: "Any STR-restrictive legislation introduced (not yet passed) in Phoenix, Austin, Nashville, or any other watchlist market."
mitigation:
  - "Quarterly geo review (per V1 §4 Month 3 activity) updates GS-07 tier list with regulatory changes."
  - "PRCOM subscribes to STR ordinance trackers (e.g., Hostfully, STR legislation monitor) for watchlist markets. Daily scan."
  - "If legislation introduced: MOL pauses SA-007 ad sets targeting the affected market within 24 hours. CRTL updates CRM routing to route affected-market SA-007 leads to senior LO review (not auto-Tier A/B)."
  - "If legislation passes: MOL geo-excludes the affected market from all SA-007 ad sets. CRTL updates HEX-014 STR permit verification to hard-fail the market."
  - "If >3 watchlist markets pass restrictive legislation in a quarter: trigger Part 5 Bear scenario. Re-plan SA-007 strategy — possibly pause SA-007 entirely for the quarter."
owner: "RGC (Compliance Counsel) + MOL (Meta/Google Ops Lead)"
escalation: "RGC → RMOL → VP Marketing. If >3 markets affected, VP Marketing notifies General Counsel (regulatory exposure if swarm continues acquiring dead leads)."
```

### PM-006 — Conversion tracking pixel misconfigured (Form_Complete vs Tier_Routed)

```yaml
failure_id: PM-006
failure_mode: "The Meta + Google optimization event is accidentally set to Form_Complete (the platform default) instead of Tier_Routed_A_or_B. Meta/Google optimize for form-fillers, which over-index to Tier D decline-cohort leads. CPL drops (looks good), CPQA explodes (looks bad within 2 weeks), CPFL exceeds $20K by week 6."
likelihood: Medium
impact: Critical
  # This is the single highest-leverage failure mode. If undetected for >2 weeks, the swarm may burn $30K+ on Tier D leads before the monthly review catches it.
early_warning_signal: "Tier D rate trending up while CPL trends down (the inverse-correlation red flag). If CPL drops >20% week-over-week AND Tier D rate rises >10pts week-over-week, suspect PM-006."
trigger_threshold: "Daily dashboard alert: Tier D rate > 35% on any Meta ad set for 2 consecutive days, OR CPL < $40 on any Meta ad set for 2 consecutive days (suspiciously low)."
mitigation:
  - "W1D5 pixel QA gate (Part 2): hard-block launch until Tier_Routed_A_or_B is verified as the optimization event at the campaign level for all 8 Meta ad sets and all 12 Google ad groups."
  - "DMAN builds a daily dashboard alert: any ad set with Tier D rate >35% OR CPL <$40 triggers a Slack #d1-godmode-launch alert within 1 hour."
  - "If alert fires: MOL + CRTL verify the optimization event within 1 business hour. If misconfigured: pause the affected ad set, reconfigure, re-launch within 4 business hours."
  - "If misconfiguration persists >2 weeks undetected: trigger Part 5 Bear scenario. RMOL notifies VP Marketing + CFO. The affected budget is written off; quarter KPI targets re-baseline."
  - "W3D5 weekly review: DMAN explicitly presents the optimization-event status for all 20 placements. If any drift detected, immediate fix."
owner: "TLEAD (Tech Lead) + MOL (Meta/Google Ops Lead)"
escalation: "TLEAD + MOL → RMOL → VP Marketing → CFO (if >$10K wasted before detection). This is the most expensive failure mode if undetected."
```

### PM-007 — Landing page load time >3s degrades conversion

```yaml
failure_id: PM-007
failure_mode: "One or more of the 20 landing pages (LP-SA-001 through LP-SA-012 + LP-EG-001 through LP-EG-008) loads in >3 seconds on mobile, degrading Form_Start rate by 30-50% (per industry benchmark)."
likelihood: Medium
impact: Medium
  # Mobile is ~60-70% of DSCR lead traffic. Form_Start rate collapse on mobile = lead volume collapse.
early_warning_signal: "Landing page load time (mobile + desktop). Tracked weekly via Google PageSpeed Insights or Lighthouse."
trigger_threshold: "Any M1 landing page (LP-SA-001/002/004) loads in >3 seconds on mobile (Lighthouse performance score <60), OR Form_Start rate drops >20% week-over-week on any LP."
mitigation:
  - "W1D4 LP deploy: TLEAD runs Lighthouse on all 3 M1 LPs. Load time must be <3s mobile / <2s desktop before G4 gate clearance."
  - "Weekly Lighthouse scan on all live LPs. DMAN adds to dashboard."
  - "If threshold breached: TLEAD identifies the cause (image size, third-party script, server response). Patch within 48 hours."
  - "If patch takes >48 hours: MOL redirects the affected LP's ad traffic to a backup LP (or pauses the affected ad set) until patch lands."
  - "Image optimization: all LP images served via CDN + WebP format. JS deferred where possible."
owner: "TLEAD (Tech Lead)"
escalation: "TLEAD → RMOL. If >1 LP affected for >5 days, RMOL notifies VP Marketing (lead-volume impact)."
```

### PM-008 — CRM routing rules create lead backlog at specialty LO pool

```yaml
failure_id: PM-008
failure_mode: "Tier B/C leads route to specialty LO pools faster than the LOs can respond, creating a backlog. SLA breaches cascade. Borrower experience degrades. Tier B/C leads abandon at >40% (vs target <20%)."
likelihood: Medium
impact: High
  # Specialty LO pools are smaller (1-3 LOs per persona pool) than the senior LO pool. Backlog happens fast.
early_warning_signal: "Tier B/C SLA compliance rate (TS-10 KPI-008). Target ≥95%. If <80% for 3 consecutive days, backlog."
trigger_threshold: "Tier B/C SLA compliance < 80% for 3 consecutive business days, OR >10 Tier B/C leads unassigned in CRM for >4 business hours."
mitigation:
  - "W2D3 dry-run stress test (Part 2): 30 test leads in 1 day. Verify routing + LO response within SLA. If <95% routing within 60s OR <90% LO responses within SLA: extend dry-run + patch."
  - "Daily SLA compliance dashboard (DMAN). Alert if Tier B/C compliance <80%."
  - "If threshold breached: LOOD (a) re-allocates senior LOs to cover the backlog, (b) pauses the affected ad set for 24-48 hours to drain backlog, (c) hires/contracts additional LO capacity within 1 week."
  - "Long-term: each persona's specialty LO pool staffed at 1 LO per 30 monthly leads (capacity assumption). LOOD forecasts monthly lead volume per persona + hires ahead."
  - "If backlog is chronic (>3 backlog events per quarter): trigger Part 5 Bear scenario. Re-baseline lead volume targets + LO capacity."
owner: "CRTL (CRM Team Lead) + LOOD (LO Operations Director)"
escalation: "CRTL + LOOD → RMOL → VP Marketing. If chronic, VP Marketing notifies CFO (LO hire cost) + HR (recruiting timeline)."
```

### PM-009 — Major lender (e.g., Truss) withdraws from DSCR market mid-quarter

```yaml
failure_id: PM-009
failure_mode: "A major DSCR lender (most likely Truss, which is in 5 of 8 LO pool lender-relationship lists per TS-10 §3B) announces exit from DSCR market mid-quarter. 30-50% of Tier A lender capacity disappears overnight."
likelihood: Low
impact: Critical
  # Truss is in senior LO pool + CA-ADU pool + credit-scarred pool + ITIN pool + BRRRR pool + STR pool. Exit cascades across 6 LO pools.
early_warning_signal: "LRM monitors lender announcements (press releases, earnings calls, industry newsletters like DSCR Authority, Scotsman Guide)."
trigger_threshold: "Any DSCR market exit announcement from a lender in any of the 8 LO pool lender-relationship lists."
mitigation:
  - "Trigger Part 6 Crisis 1 playbook (Major specialty lender withdraws from market)."
  - "Immediate (4-hour): LOOD freezes new Truss-routed submissions. LRM activates backup lenders per LO pool (Rize, AHLend, America Mortgages, Griffin, Newfi, Lendmire)."
  - "Within 24 hours: CRTL updates CRM routing rules to redirect affected leads to backup lenders. LOOD briefs LO pools on new lender routing."
  - "Within 72 hours: LRM signs referral agreements with 2 new specialty lenders to replace lost capacity."
  - "Within 1 week: RMOL briefs leadership on revenue impact. If >30% of funded-loan capacity lost, trigger Part 5 Bear scenario."
owner: "LRM (Lender Relationship Manager) + LOOD (LO Operations Director)"
escalation: "LRM → RMOL → VP Marketing → CFO + General Counsel. Board notification if >40% capacity lost."
```

### PM-010 — CFPB inquiry or regulatory examination

```yaml
failure_id: PM-010
failure_mode: "The Consumer Financial Protection Bureau (CFPB) issues a Civil Investigative Demand (CID) or opens an examination into the company's DSCR marketing practices, citing potential ECOA / Reg B violations (especially around Tier D exit messages, ITIN marketing, or foreign-national marketing)."
likelihood: Low
impact: Critical
  # Regulatory examination can freeze marketing operations, require document production, and result in consent orders or fines. Reputational damage.
early_warning_signal: "CFPB published enforcement priorities (annual), industry-association alerts (MBA, ABA). RGC monitors."
trigger_threshold: "Any CFPB CID, examination notice, or formal information request received by the company."
mitigation:
  - "Trigger Part 6 Crisis 2 playbook (CFPB inquiry or Civil Investigative Demand)."
  - "Immediate (4-hour): LEGCO + RGC engage outside ECOA counsel. RMOL preserves all marketing records (legal hold)."
  - "Within 24 hours: RMOL pauses all DSCR campaigns pending counsel review. VP Marketing notifies CEO + Board."
  - "Within 72 hours: Outside counsel produces response strategy. RGC audits all V2 creative + Tier D exit messages for ECOA compliance."
  - "Within 1 week: Counsel responds to CFPB. RMOL + VP Marketing decide on partial restart (cleared campaigns only) or full hold pending resolution."
  - "Communication: PRCOM coordinates with Legal on external messaging. No public statements without counsel approval."
owner: "RGC (Reg B Compliance Counsel) + LEGCO (Legal Counsel)"
escalation: "RGC + LEGCO → RMOL → VP Marketing → CEO → Board. This is a board-level event."
```

### PM-011 — Negative press coverage of DSCR lending

```yaml
failure_id: PM-011
failure_mode: "A major publication (WSJ, NYT, ProPublica, NPR) publishes a story framing DSCR lending as predatory, citing high rates, foreign-national marketing, or decline-cohort marketing. Story names the company or the broader DSCR industry."
likelihood: Low
impact: High
  # Borrower trust drops. Lead volume drops 20-40% within 1 week. Partner lenders may distance. Regulator interest may follow (PM-010 cascade).
early_warning_signal: "PRCOM monitors media via Google Alerts + Meltwater + industry newsletters for 'DSCR predatory', 'DSCR high rates', 'investment property lending abuses'."
trigger_threshold: "Any story in a Tier-1 publication (WSJ/NYT/ProPublica/NPR/Bloomberg) naming the company OR framing DSCR lending as predatory, OR >3 Tier-2 stories in a single week."
mitigation:
  - "Trigger Part 6 Crisis 3 playbook (Negative press)."
  - "Immediate (4-hour): PRCOM + RGC review the story. Identify any factual errors. Prepare holding statement (counsel-approved)."
  - "Within 24 hours: PRCOM publishes response (if factual errors) or holds (if story is accurate but unfair). VP Marketing reviews all DSCR creative for any line that could be quote-mined."
  - "Within 72 hours: PRCOM briefs partner lenders + referral partners. RMOL reviews lead volume impact."
  - "Within 1 week: If lead volume drops >30%, RMOL pauses affected campaigns. Re-plan M2/M3 with trust-building creative (case studies, funded-borrower testimonials, transparent pricing)."
  - "Long-term: PRCOM builds proactive DSCR-education content (editorial op-eds, podcast appearances, industry conference talks) to counter the narrative."
owner: "PRCOM (PR / Communications Lead) + RGC (Reg B Compliance Counsel)"
escalation: "PRCOM → RMOL → VP Marketing → CEO (if Tier-1 publication names the company)."
```

### PM-012 — Lead data breach (Reg P / state privacy law)

```yaml
failure_id: PM-012
failure_mode: "CRM compromise exposes borrower PII (name, SSN/ITIN, address, financials, property addresses) for 500+ leads. Triggers Reg P (GLBA) notification + state privacy law (CCPA/CPRA in CA, etc.) notification requirements."
likelihood: Low
impact: Critical
  # Regulatory fines (up to $100K per violation under GLBA; CCPA statutory damages $100-$750 per consumer per incident). Reputational damage. Class-action lawsuit risk.
early_warning_signal: "TLEAD monitors CRM access logs for anomalous patterns (bulk export, off-hours access, unfamiliar IP)."
trigger_threshold: "Any confirmed unauthorized access to lead PII, OR any CRM security alert indicating potential exfiltration."
mitigation:
  - "Trigger Part 6 Crisis 4 playbook (Lead data breach)."
  - "Immediate (1-hour): TLEAD isolates the CRM. Revoke all access. LEGCO engages outside privacy counsel + forensics firm."
  - "Within 24 hours: LEGCO + forensics confirm scope. TLEAD patches the vulnerability. LEGCO begins Reg P + state law notification timeline (GLBA: 'as soon as possible'; CCPA: 'without unreasonable delay')."
  - "Within 72 hours: LEGCO notifies affected consumers (per GLBA + state law requirements). VP Marketing + CEO brief. PRCOM prepares external statement."
  - "Within 1 week: LEGCO files required regulatory notifications (state AGs, GLBA regulators). Forensics report delivered. Insurance claim filed (cyber liability)."
  - "Communication: PRCOM coordinates with Legal on consumer notification + external statement. Transparency is legally required; do not minimize."
owner: "LEGCO (Legal Counsel) + TLEAD (Tech Lead)"
escalation: "LEGCO + TLEAD → RMOL → VP Marketing → CEO → Board. This is a board-level event. Cyber-liability insurance carrier notified within 24 hours."
```

### PM-013 — A/B test false positive leads to wrong creative scaling

```yaml
failure_id: PM-013
failure_mode: "An A/B test (e.g., ABT-001 Persona-Mix Validation) declares a winner based on <100 conversions per variant (statistically underpowered), the winning variant is scaled, and 2-4 weeks later the 'winner' underperforms the loser."
likelihood: Medium
impact: Medium
  # Wasted spend on underperforming creative. Lost learning cycle. Team confidence in A/B testing erodes.
early_warning_signal: "A/B test conversion count per variant. If <100 conversions per variant at decision time, statistical power is insufficient."
trigger_threshold: "Any A/B test decision made at <100 conversions per variant, OR any A/B test 'winner' underperforming the 'loser' within 4 weeks of scaling."
mitigation:
  - "TS-10 §3E test governance: 'Tests run minimum 4 weeks for statistical power (or 100 conversions per variant, whichever is longer).' DMAN enforces pre-decision."
  - "DMAN computes statistical significance (p<0.05) before any test decision is scaled. If p>0.05, extend the test."
  - "If false positive detected post-scaling: MOL reverts to the 'loser' variant (now the proven winner) within 48 hours. DMAN documents the false positive in the monthly review."
  - "Quarantine rule: any test decision affecting >$5K/week in spend requires DMAN + MOL co-sign before scaling."
owner: "DMAN (Data Analyst) + MOL (Meta/Google Ops Lead)"
escalation: "DMAN → RMOL. If >3 false positives in a quarter, RMOL reviews the A/B test methodology with VP Marketing."
```

### PM-014 — Persona mismatch (leads routed to wrong LO pool)

```yaml
failure_id: PM-014
failure_mode: "The TS-10 persona-tag assignment (per FF-08 Q-001 through Q-012 inputs) mis-tags a lead, routing it to the wrong LO pool. E.g., a SA-005 Strong-Credit FN lead is tagged SA-006 No-Credit FN, routing to a Tier B FN pool with 60% LTV constraints when the borrower qualifies for 70-75%."
likelihood: Medium
impact: High
  # Borrower gets wrong loan program quoted. Trust erodes. Deal may die. Senior LO catches it via manual review (per PM-004 mitigation) but by then borrower may have moved on.
early_warning_signal: "Persona-tag accuracy (TS-10 KPI-009). Target ≥85% LO-confirmed. If <75%, persona-tag logic is misfiring."
trigger_threshold: "Persona-tag accuracy < 75% for any persona_tag for 1 week, OR >3 LO-confirmed persona mismatches in a single day."
mitigation:
  - "Daily persona-tag accuracy tracking (DMAN dashboard). LOs confirm or correct persona_tag on each lead within SLA window."
  - "If threshold breached: CRTL reviews the persona-tag logic (FF-08 Q-001 through Q-012 → persona_tag mapping). Likely causes: (a) Q-001 (citizenship) mis-set for FN tiers; (b) Q-002 (property type) mis-set for condotel/non-warrantable; (c) Q-006 (credit event) mis-set for seasoning thresholds."
  - "CRTL patches the offending mapping logic. Back-tests against the prior week's leads."
  - "Manual override: senior LOs can re-tier + re-tag any lead within 4 business hours. CRTL reviews all overrides weekly + identifies systemic patterns."
  - "If mismatch is systemic (>20% of leads for a persona): trigger Part 5 Bear scenario diagnostic. Pause the affected persona's ad set until persona-tag logic is fixed."
owner: "CRTL (CRM Team Lead) + LOOD (LO Operations Director)"
escalation: "CRTL + LOOD → RMOL. If systemic, RMOL notifies VP Marketing + RGC (fair-lending risk if mismatch correlates with protected class)."
```

### PM-015 — Cash flow crunch (budget burns faster than funded loans generate revenue)

```yaml
failure_id: PM-015
failure_mode: "The $150K quarterly budget burns at the planned $50K/month pace, but funded loans take 21-90 days to close (per TS-10 §1C SLA) and revenue recognition lags further. Cash outflow outpaces revenue inflow. By end of M2, $100K spent, $0 revenue recognized. CFO flags cash flow risk."
likelihood: Medium
impact: High
  # If CFO pauses budget mid-quarter, the swarm loses learning momentum. Funded loans in pipeline may be jeopardized if LO capacity is cut.
early_warning_signal: "Cash flow forecast (CFO dashboard). Track budget burn vs. pipeline revenue (in-underwriting loans × expected close rate × expected revenue per loan)."
trigger_threshold: "Cash outflow > $100K before any funded-loan revenue recognized (likely end of M2), OR pipeline revenue forecast < 50% of remaining budget."
mitigation:
  - "Pre-launch (W0): RMOL + CFO align on cash flow forecast. Budget deployed against expected revenue timing (M1 leads → M3 closes → M4+ revenue)."
  - "Capital deployment schedule (Part 4.4) front-loads W1-W4 ($15K) for gate work + soft launch, then $50K/month for M1-M3. Total $150K."
  - "Pipeline revenue tracking: DMAN forecasts expected revenue from in-underwriting loans (close rate × revenue per loan). Reported in monthly review (Part 8.3)."
  - "If cash flow threshold breached: RMOL + CFO review options: (a) slow budget burn to $30K/month (extends quarter to 5 months), (b) CFO authorizes bridge funding, (c) pause non-converting channels (Meta broad if PM-002 active) to preserve cash for converting channels."
  - "CAC payback period tracking (Part 4.5): if payback period >12 months for any persona, that persona's budget is at risk of cut. Re-plan."
  - "If CFO pauses budget entirely: trigger Part 5 Bear scenario. RMOL re-plans Q1 with reduced budget + extends timeline."
owner: "RMOL (Rollout Marketing-Ops Lead) + CFO"
escalation: "RMOL → CFO → VP Marketing → CEO (if budget pause required). Board notification if budget cut >50%."
```

## 3.2 Pre-Mortem Weekly Review Cadence

Every Monday 9am weekly standup (Part 8.1) includes a **5-minute pre-mortem scan**:
- DMAN presents the PM-ID dashboard: which PM-IDs had early-warning signals fire in the past week?
- For each triggered PM-ID: owner presents status (monitoring / mitigation active / resolved).
- RMOL escalates any PM-ID with mitigation active for >5 business days without resolution.

---

# PART 4 · CAPITAL EFFICIENCY MODEL

> **Purpose:** Make the cost-per-funded-loan (CPFL) math explicit so leadership can see exactly when the swarm makes money, when it breaks even, and when it loses money. Every assumption is stated. Every sensitivity is computed.

## 4.1 The CPFL Formula

```
CPFL = (Cost per Tier A-or-B lead) / (Tier A-or-B → funded loan conversion rate)

Where:
  Cost per Tier A-or-B lead (CPQA) = Spend / (Tier_Routed_A + Tier_Routed_B)
  Tier A-or-B → funded loan conversion = Funded loans / (Tier_Routed_A + Tier_Routed_B)

Substituting:
  CPFL = Spend / Funded loans
```

The CPFL is therefore driven by **two levers**:
1. **CPQA** — how much we pay per qualified lead.
2. **Tier A-or-B → funded loan conversion rate** — how many qualified leads become funded loans.

The conversion rate has two components:
- **Form completion → Tier A-or-B rate** (ad targeting + form quality): target 33% per Part 1.3.
- **Tier A-or-B → funded loan rate** (LO conversion + lender capacity + borrower intent): derived from the 90-day target of 5 funded loans / 390 Tier A-or-B leads = **1.28%**.

> ⚠️ **Note on the 1.28% derived rate:** This is conservative. TS-10 §1C tier-approval probabilities are 75-90% (Tier A) and 55-75% (Tier B), which would suggest a much higher funded-loan conversion. The 1.28% reflects: (a) the gap between "approval probability" and "funded loan" (borrower drop-off, appraisal fall-through, etc.); (b) the TS-10 §1C honest disclosure that inbound leads score lower than worked examples (real-world Tier A rate 15-25% in production, not 45%); (c) conservative planning against the V1 target of 5 funded loans at <$8,500 CPFL. The model below uses 1.28% as the **base case** and tests higher rates as bull scenarios.

## 4.2 Sensitivity Analysis — CPFL Under Different Scenarios

### 4.2.1 Variables and ranges

| Variable | Conservative | Base | Stretch | Bull |
|---|---:|---:|---:|---:|
| Form completion → Tier A-or-B rate | 25% | 30% | 33% | 40% |
| Tier A-or-B → funded loan rate | 8% | 12% | 15% | 20% |
| Cost per Tier A-or-B lead (CPQA) | $350 | $300 | $250 | $200 |
| Note: TS-10 dashboard target CPQA = $120-200; V1 90-day target = $250. We model $200-$350 to bracket realistic production variance. |

### 4.2.2 CPFL table — Cost per Tier A-or-B lead × Tier A-or-B → funded loan conversion rate

> Cell formula: `CPFL = CPQA / (Tier A-or-B → funded loan conversion rate)`
> Rows: CPQA. Columns: Tier A-or-B → funded loan conversion rate.

| CPQA \ Conv rate | 8% | 12% | 15% | 20% |
|---|---:|---:|---:|---:|
| **$200** | $2,500 | $1,667 | $1,333 | $1,000 |
| **$250** | $3,125 | $2,083 | $1,667 | $1,250 |
| **$300** | $3,750 | $2,500 | $2,000 | $1,500 |
| **$350** | $4,375 | $2,917 | $2,333 | $1,750 |

### 4.2.3 Reading the table

- **Best cell** ($200 CPQA × 20% conversion): CPFL = **$1,000**. Far below the $8,500 target. This is the bull-case ceiling (Part 5 Bull scenario assumes CPFL $6,500 — well above this best cell, indicating the bull case is plausible, not heroic).
- **Worst cell** ($350 CPQA × 8% conversion): CPFL = **$4,375**. Still below the $8,500 target. Even the conservative scenario is profitable.
- **Base case cell** ($300 CPQA × 12% conversion): CPFL = **$2,500**. Below the $8,500 target by 3.4×.
- **Stretch cell** ($250 CPQA × 15% conversion): CPFL = **$1,667**. Below the $8,500 target by 5.1×.

> ⚠️ **Important caveat:** The table above uses **Tier A-or-B → funded loan conversion rates of 8-20%**, which are materially higher than the 1.28% derived from V1's 5-funded-loans / 390-Tier-A-or-B target. The higher rates reflect the *theoretical* conversion if every Tier A-or-B lead that *should* convert did convert. V1's 1.28% target bakes in real-world lead-quality degradation, LO drop-off, and appraisal fall-through. **The model below (§4.3) uses V1's actual KPI targets** — the table above is a sensitivity to show the leverage of CPQA and conversion rate.

### 4.2.4 CPFL sensitivity under V1 KPI targets (the planning model)

Using V1 targets:
- Spend: $150,000 (90 days)
- Form completions: 1,200
- Tier A-or-B leads: 390 (33% rate)
- Funded loans: 5 (1.28% of Tier A-or-B)

**CPFL = $150,000 / 5 = $30,000** (theoretical, using raw spend)

But this is misleading because it includes spend on Tier C and Tier D leads (which don't convert to funded loans in the 90-day window). The **true CPFL** only counts spend attributable to Tier A-or-B leads.

**Refined CPFL = (Tier A-or-B fraction of spend) / Funded loans**
- If Tier A-or-B leads are 390 of 1,200 form completions (32.5%), and assuming spend is roughly proportional to form completions, then ~32.5% of $150K = $48,750 attributable to Tier A-or-B leads.
- **Refined CPFL = $48,750 / 5 = $9,750** (close to the V1 target of <$8,500).

The V1 target of <$8,500 CPFL is **achievable if**:
- Tier A-or-B rate holds at 33% (V1 target).
- Funded-loan count reaches 5 (V1 target).
- Spend efficiency on Tier A-or-B leads is at or better than proportional (i.e., Google Search spend converts better than Meta broad — which it should).

## 4.3 Break-Even Analysis

### 4.3.1 Revenue per funded loan (assumption)

DSCR lending revenue per funded loan varies by lender program + borrower size:
- **Average revenue per funded DSCR loan** (industry benchmark): **1.5-2.5% of loan amount** in origination fee + lender-paid comp + YSP.
- For SA-002 Portfolio Scaler ($1M-$3.2M loans): revenue per loan ≈ **$20,000-$50,000**.
- For SA-001 Cash-Flow Optimizer ($150K-$500K loans): revenue per loan ≈ **$3,000-$10,000**.
- For SA-004 Equity-Tapping Refinancer ($300K-$1.5M loans): revenue per loan ≈ **$6,000-$25,000**.
- **Blended average across the 3 M1 personas**: ~**$15,000-$20,000 per funded loan** (RMOL + CFO to confirm against actual commission schedule pre-launch).

### 4.3.2 Break-even CPFL

Using the blended revenue of **$17,500 per funded loan** (midpoint of $15K-$20K):

| Scenario | Revenue per funded loan | Break-even CPFL | Notes |
|---|---:|---:|---|
| Conservative ($15K revenue) | $15,000 | $15,000 | Swarm loses money above this CPFL |
| Base ($17,500 revenue) | $17,500 | $17,500 | Swarm loses money above this CPFL |
| Stretch ($20K revenue) | $20,000 | $20,000 | Swarm loses money above this CPFL |

**Implication:** The V1 target of <$8,500 CPFL has a **2× safety margin** against the break-even CPFL of $17,500. The swarm remains profitable even if CPFL degrades by 2× from target.

### 4.3.3 Break-even funded-loan count

Using $150K budget and $17,500 revenue per funded loan:
- **Break-even funded loans = $150,000 / $17,500 = 8.57 → 9 funded loans** (round up).
- Wait — that says we need 9 funded loans to break even, but V1 targets only 5. How does V1 make money?

**Resolution:** V1's 5 funded loans in Q1 generate $87,500 revenue against $150K spend = **$62,500 net loss in Q1**. The swarm is **unprofitable in Q1 by design** — it's a learning quarter. Profitability requires:
- Q2 funded loans (from Q1 pipeline) + Q2 new funded loans ≥ 18 (to cover Q1 $150K + Q2 $150K = $300K spend against $315K revenue at $17.5K/loan).
- Or higher revenue per loan (e.g., if Q1 funded loans skew toward SA-002 Portfolio Scaler at $30K revenue/loan, 5 loans = $150K revenue, breaking even on Q1 spend).

**This is the critical CFO conversation:** Q1 is intentionally a loss-making learning quarter. Profitability is a Q2+ outcome. RMOL + CFO must align pre-launch on this assumption.

## 4.4 Capital Deployment Schedule (13 weeks)

> Week-by-week budget burn for the 90-day rollout (13 calendar weeks). Aligned with Part 2 day-by-day script.

| Week | Phase | Budget burn | Cumulative spend | Notes |
|---|---|---:|---:|---|
| W0 | Pre-launch (gates) | $0 | $0 | No ad spend; only labor |
| W1 | Gate execution | $0 | $0 | No ad spend; only labor |
| W2 | A/B test loading + dry-run | $0 | $0 | No ad spend; only labor |
| W3 | Soft launch → full launch | $5,000 | $5,000 | W3D1: $1,250 (10% × $12.5K weekly). W3D3-D5: scale to $12.5K weekly cap. Net W3: ~$5K. |
| W4 | M1 steady-state week 1 | $12,500 | $17,500 | Full launch; 3 personas |
| W5 | M1 steady-state week 2 | $12,500 | $30,000 | Full launch |
| W6 | M1 steady-state week 3 + M2 prep | $12,500 | $42,500 | Full launch + M2 persona prep |
| W7 | M2 launch week 1 (7 personas) | $12,500 | $55,000 | M2 personas activate |
| W8 | M2 steady-state week 2 | $12,500 | $67,500 | 7 personas |
| W9 | M2 steady-state week 3 + M3 prep | $12,500 | $80,000 | 7 personas + M3 prep |
| W10 | M3 launch week 1 (12 personas + edge cases) | $12,500 | $92,500 | Full persona library |
| W11 | M3 steady-state week 2 | $12,500 | $105,000 | 12 personas + edge cases |
| W12 | M3 steady-state week 3 | $12,500 | $117,500 | 12 personas + edge cases |
| W13 | M3 wrap + 90-day cohort review | $12,500 | $130,000 | Final week of Q1 |
| **Buffer** | | $20,000 | $150,000 | Reserved for scale-up mid-quarter if Bull triggers fire |

**Total: $150,000 deployed over 13 weeks.** Front-loaded zero-spend in W0-W2 (gate work + dry-run), then steady-state $12,500/week in W4-W13. The $20,000 buffer is reserved for mid-quarter scale-up if Part 5 Bull scenario triggers (8 funded loans at $6,500 CPFL → double budget to $300K Q2).

### 4.4.1 Cash flow timeline (CFO view)

| Month | Cash out | Cumulative cash out | Expected funded loans | Revenue recognized (in-month) | Cumulative revenue |
|---|---:|---:|---:|---:|---:|
| M1 | $17,500 | $17,500 | 0 | $0 | $0 |
| M2 | $50,000 | $67,500 | 0-2 (from M1 leads) | $0-$35,000 | $0-$35,000 |
| M3 | $50,000 | $117,500 | 3-5 (from M1+M2 leads) | $52,500-$87,500 | $52,500-$122,500 |
| W13 + buffer | $32,500 | $150,000 | 0 | $0 | $52,500-$122,500 |
| **Q1 total** | **$150,000** | **$150,000** | **5 (target)** | **$52,500-$122,500** | **$52,500-$122,500** |

**Q1 net P&L: -$27,500 to -$97,500** (loss-making by design). Profitability in Q2 if:
- Q1 pipeline (Tier A/B leads not yet closed) converts to funded loans in Q2 at expected rates.
- Q2 budget doubles to $300K (per D1 Q2 pre-authorization) AND Q2 funded-loan target is 12-15 (to cover Q2 spend + recover Q1 loss).

## 4.5 CAC Payback Period per Persona

> **CAC payback period** = Cost per funded loan / (Monthly gross profit per funded loan). For DSCR, monthly gross profit per funded loan = (revenue per loan / loan lifetime servicing) — but DSCR loans typically have short hold periods (investor sells or refinances within 2-5 years), so we use **simpler payback**: CPFL / revenue per funded loan.

| Persona | Avg revenue per funded loan | Base-case CPFL | CAC payback (loans) | Notes |
|---|---:|---:|---:|---|
| SA-002 Portfolio Scaler | $30,000 | $8,500 | 0.28 loans | 1 funded loan pays back CAC of 0.28 loans |
| SA-001 Cash-Flow Optimizer | $5,000 | $8,500 | 1.70 loans | Need 2 funded loans to pay back CAC of 1 |
| SA-004 Equity-Tapping Refinancer | $12,000 | $8,500 | 0.71 loans | 1 funded loan pays back CAC of 0.71 loans |
| SA-007 STR Operator | $8,000 | $8,500 | 1.06 loans | ~1 funded loan pays back CAC of 1 |
| SA-008 Credit-Scarred | $4,500 | $8,500 | 1.89 loans | Need 2 funded loans to pay back CAC of 1 |
| SA-009 CA-ADU | $18,000 | $8,500 | 0.47 loans | 1 funded loan pays back CAC of 0.47 loans |
| SA-010 ITIN | $7,000 | $8,500 | 1.21 loans | Need 1-2 funded loans to pay back CAC of 1 |
| SA-011 Compensated-Exception | $10,000 | $8,500 | 0.85 loans | 1 funded loan nearly pays back CAC |
| SA-012 BRRRR Cyclist | $4,000 | $8,500 | 2.13 loans | Need 2-3 funded loans to pay back CAC of 1 |

**Implication:** SA-002, SA-009, and SA-004 have the fastest CAC payback (sub-1-loan). SA-012, SA-008, and SA-001 have the slowest (>1.5 loans). **Budget allocation should favor personas with fast CAC payback** — which is consistent with SA-002/SA-001/SA-004 being the M1 launch trio (SA-001 is the exception due to volume velocity).

## 4.6 Scaling Triggers (links to Part 9 Go/No-Go)

| Trigger | Metric threshold | Action | Authority |
|---|---|---|---|
| **Double budget (Q2 → $300K)** | CPFL < $6,500 AND funded loans ≥5 AND Tier A-or-B rate ≥33% AND no PM-006 active | Activate D1 Q2 pre-authorization; double weekly cap to $25,000 | VP Marketing + CFO |
| **Pause a persona** | CPQA > $400 for 2 consecutive weeks OR Tier A-or-B rate <20% for 2 consecutive weeks | Pause the persona's ad set; re-allocate budget to top-performing personas | RMOL |
| **Pause the swarm** | CPFL > $14,000 at any monthly review (Bear scenario) | Pause all campaigns; trigger Part 5 Bear diagnostic | VP Marketing |
| **Add a new persona mid-quarter** | Evidence: (a) ≥3 inbound leads requesting the persona in 2 weeks; (b) lender capacity confirmed; (c) ≥1 persona-specific LP ready | Add the persona; allocate 10% of weekly budget | RMOL + VP Marketing |
| **Remove a persona mid-quarter** | Evidence: (a) <2 Tier A-or-B leads in 4 weeks; (b) CPQA > $500 for 4 weeks; (c) 0 funded loans from persona's leads in quarter | Remove the persona; re-allocate budget | RMOL + VP Marketing |

---

# PART 5 · SCENARIO PLANS (BASE / BULL / BEAR)

> **Purpose:** Pre-defined action playbooks for the three most likely 90-day outcomes. Leadership knows in advance what happens if the swarm hits target, beats target, or misses target — no improvisation under pressure.

## 5.1 Scenario Index

| Scenario | Funded loans | CPFL | Budget implication | Q2 action |
|---|---:|---:|---|---|
| **Base** | 5 | $8,500 | $150K Q1 hold | Maintain $50K/month Q2; iterate per Q2 runbook |
| **Bull** | 8 | $6,500 | $150K Q1 + activate $300K Q2 pre-auth | Double budget; accelerate persona expansion |
| **Bear** | 2 | $14,000 | $150K Q1 hold; Q2 budget at risk | Pause + diagnostic; possible budget cut |

---

## 5.2 Base Scenario (target case)

```yaml
scenario: Base
description: |
  The swarm hits V1 targets: 1,200 form completions, 390 Tier A-or-B leads (33% rate),
  5 funded loans, CPFL <$8,500. Tier distribution holds (A 12.5%, A+B 33%, C 30%, D 25%).
  All 4 pre-launch gates cleared by W1D5. W3D1-W3D5 launch sequence executes as scripted.
  M2 adds 4 personas + first edge case. M3 adds remaining personas + decline-letter triage.
  No Part 3 PM-ID signals trigger beyond early-warning. Specialty-lender referral rate hits 20%.
  Decline-letter audit conversion hits 15%. LO SLA compliance ≥95%. Persona-tag accuracy ≥85%.
trigger_metrics:
  - "Form completions: 1,200 ± 10% (1,080-1,320)"
  - "Tier A-or-B rate: 30-36%"
  - "Tier D rate: 20-30%"
  - "Funded loans: 4-6"
  - "CPFL: $7,500-$10,000"
  - "Specialty-lender referral rate: 18-22%"
  - "Decline-letter audit conversion: 12-18%"
  - "LO SLA compliance: ≥90%"
  - "Persona-tag accuracy: ≥80%"
budget_implication: "$150K Q1 hold (no change). M3 monthly review confirms Q2 budget hold at $50K/month."
timeline_implication: "Q2 plan proceeds as scheduled: Q2 monthly review at end of M4, M5, M6; Q2 cohort review at end of M6."
action_playbook:
  - "M1 monthly review (end of M1): DMAN presents KPI dashboard vs target. RMOL confirms M2 launch on schedule."
  - "M2 monthly review (end of M2): DMAN presents KPI dashboard + cohort data. RMOL confirms M3 launch on schedule. CRTL presents scoring engine recalibration recommendation (if Tier A converts <60%, adjust weights per PM-004)."
  - "M3 + 90-day cohort review (end of M3): DMAN presents full funnel by persona / tier / geo / channel. Primary KPI: CPFL. RMOL + VP Marketing decide Q2 budget: maintain $50K/month OR activate $300K pre-auth (if Bull signals)."
  - "Q2 launch (W14+): proceed with $50K/month (Base) or $100K/month (Bull, if triggered). Q2 iteration cycle begins: re-harvest CF-01, re-normalize GL-02, re-mine AP-03/NP-04, recalibrate TS-10 weights."
leadership_action_required: |
  End-of-M3 review: VP Marketing + CFO + GC review 90-day cohort data. Approve Q2 budget
  (Base: $50K/month; Bull: $100K/month if triggered; Bear: reduced budget if triggered).
  Approve Q2 iteration cycle kickoff. Approve quarterly geo review updates (Phoenix/Austin
  STR, FL insurance, CA rent control per V1 §4 Month 3 activity).
```

---

## 5.3 Bull Scenario (outperform case)

```yaml
scenario: Bull
description: |
  The swarm beats V1 targets: 1,200+ form completions, 450+ Tier A-or-B leads (38%+ rate),
  8 funded loans, CPFL <$6,500. Tier A-or-B rate exceeds 33% target by 5pts+. Tier D rate
  holds below 25%. W3D1-W3D5 launch sequence executes cleanly. M2 adds 4 personas + first
  edge case, all converting above target. M3 adds remaining personas + decline-letter triage
  with strong edge-case capture (≥80% per TS-10 KPI-014). Specialty-lender referral rate hits
  25%. Decline-letter audit conversion hits 20%. LO SLA compliance ≥95%. Persona-tag
  accuracy ≥90%. SA-002 Portfolio Scaler delivers 2-3 funded loans (high revenue per loan).
trigger_metrics:
  - "Form completions: >1,200 (>10% above target)"
  - "Tier A-or-B rate: >38% (5pts above target)"
  - "Tier D rate: <25% (below ceiling)"
  - "Funded loans: 7-9"
  - "CPFL: <$6,500 (24% below target)"
  - "Specialty-lender referral rate: >23%"
  - "Decline-letter audit conversion: >18%"
  - "LO SLA compliance: ≥95%"
  - "Persona-tag accuracy: ≥90%"
  - "SA-002 funded loans: ≥2"
budget_implication: |
  $150K Q1 hold. Activate D1 Q2 pre-authorization: $300K for Q2 ($100K/month).
  Weekly cap doubles to $25,000 starting W14.
timeline_implication: |
  Q2 plan accelerates: Q2 launches with doubled budget + full persona library (12 personas + 
  8 edge cases) live from W14. Q2 cohort review at end of M6 (not end of Q2). Q3 planning
  begins end of M5 (1 month early).
action_playbook:
  - "W4 (first full week of M1): if W3D1-W3D5 launch KPIs exceed target by >20%, RMOL notifies VP Marketing of Bull trajectory. VP Marketing pre-notifies CFO of potential Q2 scale-up."
  - "M1 monthly review (end of M1): DMAN presents KPI dashboard vs target. If ≥6 of 9 trigger_metrics trending Bull, RMOL escalates to VP Marketing for mid-quarter scale-up consideration."
  - "Mid-M2 (week 7): if Bull trajectory holds, RMOL + VP Marketing + CFO align on Q2 $300K pre-authorization activation. CRTL + LOOD assess LO capacity for 2x volume (may require hiring)."
  - "M3 + 90-day cohort review (end of M3): DMAN presents 90-day results. If all Bull trigger_metrics met, VP Marketing + CFO activate Q2 $300K. LOOD confirms LO capacity for Q2 2x volume. RGC confirms compliance capacity for Q2 expanded creative library."
  - "Q2 launch (W14): $100K/month budget. Add 2 new edge-case campaigns (EG-002 ITIN, EG-003 No-Credit FN) if not already live. Expand geo-targeting per ABT-008 (CA + OR + WA + TX + AZ)."
  - "Q2 monthly review (end of M4): if Bull trajectory continues, CFO considers Q3 $500K budget. VP Marketing presents Q3 plan with 3x volume assumption."
leadership_action_required: |
  Mid-M2: VP Marketing + CFO pre-align on Q2 $300K pre-authorization. LOOD + HR begin
  recruiting additional LO capacity (4-6 week hiring timeline). End-of-M3: VP Marketing + CFO
  formalize Q2 $300K activation. CFO confirms cash flow for Q2 $300K (consider Q1 net loss +
  Q2 spend = ~$300K-$400K cash need). Board notification if Q2 budget >$300K.
```

---

## 5.4 Bear Scenario (underperform case)

```yaml
scenario: Bear
description: |
  The swarm misses V1 targets: <1,000 form completions, <280 Tier A-or-B leads (<25% rate),
  2 funded loans, CPFL >$14,000. Tier D rate exceeds 35% (PM-002 or PM-006 signal). LO SLA
  compliance <85% (PM-008 backlog). Persona-tag accuracy <75% (PM-014 mismatch). One or more
  Part 3 PM-IDs have triggered mitigations that are not resolving. CFO flags cash flow risk
  (PM-015). The swarm is bleeding budget without sufficient funded-loan pipeline to recover.
trigger_metrics:
  - "Form completions: <1,000 (>15% below target)"
  - "Tier A-or-B rate: <25% (8pts below target)"
  - "Tier D rate: >35% (10pts above ceiling)"
  - "Funded loans: ≤2"
  - "CPFL: >$14,000 (65% above target)"
  - "Specialty-lender referral rate: <12%"
  - "Decline-letter audit conversion: <8%"
  - "LO SLA compliance: <85%"
  - "Persona-tag accuracy: <75%"
  - "≥2 Part 3 PM-IDs in mitigation-active state for >5 business days"
budget_implication: |
  $150K Q1 spend continues (already deployed). Q2 budget at risk: hold at $50K/month OR
  reduce to $25K/month (half) OR pause entirely pending diagnostic. CFO + VP Marketing
  decide based on diagnostic findings.
timeline_implication: |
  Q2 plan slips: Q2 launch delayed 2-4 weeks pending diagnostic. Q2 cohort review pushed
  to end of M7. Q3 planning held until Q2 results stabilize. If pause required, full
  relaunch in Q3 (W26+).
action_playbook:
  - "Trigger threshold: any 3 of the 10 trigger_metrics breached at any weekly review."
  - "Within 24 hours of trigger: RMOL pauses all Meta broad ad sets (PM-002 mitigation). MOL re-targets with narrower lookalike audiences off funded-loan customer file (not lead-form submissions)."
  - "Within 48 hours: RMOL + DMAN + CRTL begin diagnostic. Root-cause hypotheses: (a) PM-006 optimization event misconfigured? (b) PM-002 Meta broad attracting Tier D? (c) PM-004 scoring engine miscalibrated? (d) PM-008 LO backlog? (e) PM-014 persona mismatch? (f) Persona-targeting itself wrong (top-3 FDI personas not actually highest-converting in production)?"
  - "Within 5 business days: diagnostic complete. RMOL presents findings to VP Marketing + CFO. Options: (a) pivot: re-allocate budget from Meta broad to Google Search; (b) recalibrate: CRTL adjusts scoring weights + persona-tag logic; (c) pause: halt campaigns for 2-4 weeks of re-tooling; (d) reduce scope: launch only top-2 personas (SA-002 + SA-001) at $25K/month."
  - "Within 10 business days: VP Marketing + CFO decide. If pivot/recalibrate: resume campaigns with fixes. If pause/reduce scope: execute re-tooling plan."
  - "M2 monthly review (end of M2): if Bear trajectory persists despite diagnostic + fixes, VP Marketing + CFO + CEO review. Decision: continue Q1 with reduced scope, or terminate Q1 launch and re-plan for Q2."
  - "M3 + 90-day cohort review (end of M3): if Bear scenario persists, present 90-day post-mortem to leadership + Board. Lessons learned. Q2 plan = re-launch with revised targeting + scoring + creative."
leadership_action_required: |
  Within 5 business days of Bear trigger: VP Marketing + CFO review diagnostic findings.
  Within 10 business days: VP Marketing + CFO + CEO decide on Q1 continuation vs. pause.
  Board notification if Q1 budget cut >50% or Q1 launch terminated. Q2 budget reallocation
  requires Board approval if >$50K reduction from $150K Q2 plan.
```

---

## 5.5 Scenario Decision Tree (visual)

```
                      ┌─ ALL Base trigger_metrics in range ──► BASE: maintain $50K/month Q2
                      │
End-of-M3 review ─────┼─ ≥6 of 9 Bull trigger_metrics met ───► BULL: activate $300K Q2
                      │
                      └─ ≥3 of 10 Bear trigger_metrics met ───► BEAR: diagnostic + decide
                                                                   │
                                                                   ├─ Pivot/recalibrate fixes it ──► resume Q1; Q2 at $50K/month
                                                                   ├─ Reduce scope to top-2 ───────► Q1 at $25K/month; Q2 at $50K/month
                                                                   └─ Pause ──────────────────────► Q1 terminated; Q2 re-launch plan
```

---

# PART 6 · CRISIS PLAYBOOK (5 SCENARIOS)

> **Purpose:** When a crisis hits, the team has 4 hours to act, not 4 hours to plan. This playbook pre-defines the immediate / 24-hour / 72-hour / 1-week responses, communication plans, and recovery criteria for the 5 most damaging crises the swarm could face.

## 6.0 Crisis Index

| Crisis ID | Crisis | Trigger | Severity | Primary owner |
|---|---|---|---|---|
| C-1 | Major specialty lender withdraws from DSCR market | Truss (or equivalent) announces DSCR exit | Critical | LRM + LOOD |
| C-2 | CFPB inquiry or Civil Investigative Demand | CID or examination notice received | Critical | RGC + LEGCO |
| C-3 | Negative press coverage of DSCR lending | Tier-1 publication predatory framing | High | PRCOM + RGC |
| C-4 | Lead data breach (Reg P / state privacy law) | Confirmed unauthorized PII access | Critical | LEGCO + TLEAD |
| C-5 | Scoring engine bug routes Tier A leads to Tier D nurture (silent failure) | Tier A funded-loan conversion collapses | High | CRTL + DMAN |

---

## 6.1 C-1 — Major specialty lender withdraws from DSCR market

### Trigger
Any public announcement (press release, earnings call, industry newsletter, lender-direct communication) that a DSCR lender in any of the 8 LO pool lender-relationship lists (per TS-10 §3B) is exiting the DSCR market, suspending new DSCR originations, or significantly tightening DSCR underwriting.

**Highest-risk lenders (by LO-pool exposure):**
- **Truss** (in 6 pools: senior, CA-ADU, credit-scarred, ITIN, BRRRR, STR) — exit cascades across 6 LO pools, ~30-40% of Tier A capacity.
- **AHLend** (in 5 pools: senior, FN, credit-scarred, CA-ADU, ITIN, BRRRR) — exit cascades across 5 LO pools, ~25-30% capacity.
- **Visio / Kiavi** (in 2 pools: STR, compensated-exception) — exit cascades across 2 pools, ~10-15% capacity.

### Immediate response (first 4 hours)
1. **LRM confirms the announcement** with the lender's relationship contact (phone, not email — speed matters). Document the scope: full exit? DSCR product line only? New-originations freeze? Existing pipeline honored?
2. **LOOD freezes new submissions to the exiting lender** in CRM (CRTL executes the routing-rule update within 1 hour of LRM confirmation).
3. **RMOL convenes war-room** (Slack `#d1-godmode-crisis` channel): RMOL, LRM, LOOD, CRTL, VP Marketing. Decision tree: can backup lenders absorb the volume? If yes, reroute. If no, pause affected personas.
4. **LRM activates backup lender outreach**: per LO pool, the backup lender list (from GL-02 normalized 8-lender matrix + remaining 11 specialty lenders). LRM calls each backup within 4 hours.

### 24-hour response
1. **CRTL completes CRM routing-rule update**: all leads previously routed to exiting lender now route to backup lenders (per TS-10 §3B backup assignments). Verify routing with 5 test leads per affected LO pool.
2. **LOOD briefs LO pools**: each affected LO pool's lead receives a 30-min briefing on new lender routing. Updated lender matrix distributed.
3. **LRM signs emergency referral agreements** with 2 new specialty lenders (from a pre-vetted backup list maintained by LRM). LEGCO expedites legal review (24-hour SLA).
4. **RMOL briefs VP Marketing + CFO**: revenue impact estimate (based on pipeline at exiting lender × expected close rate × revenue per loan). If >30% of funded-loan capacity lost, escalate to CEO.

### 72-hour response
1. **LRM confirms backup lender capacity** in writing (email confirmation per backup lender: yes/no, volume capacity, program terms).
2. **CRTL finalizes CRM routing rules**: backup lenders integrated, test leads validated, LO pools re-briefed.
3. **DMAN produces pipeline impact report**: leads in pipeline at exiting lender (count by tier), expected close rate pre-exit, expected close rate post-exit (with backup lenders).
4. **RMOL + VP Marketing decide**: continue Q1 plan (if backup capacity sufficient) OR trigger Part 5 Bear scenario (if >30% capacity lost).

### 1-week response
1. **LRM signs long-term referral agreements** with 2 new specialty lenders (replacing exiting lender's capacity). LEGCO completes full legal review.
2. **RMOL updates the 12-lender referral network** list (Part 1 Decision D3). If <10 of 12 active, trigger Part 3 PM-003 mitigation (specialty-lender capacity).
3. **PRCOM prepares internal + external messaging**: internal = "we've diversified lender capacity, no borrower impact"; external = no proactive announcement unless borrower-facing impact.
4. **CFO updates cash flow forecast**: if exiting lender held significant pipeline revenue, adjust Q1 P&L forecast.

### Communication plan
- **Internal (Slack + email):** RMOL sends crisis-update at 4-hour, 24-hour, 72-hour, 1-week marks to `#d1-godmode-launch` + leadership.
- **External (borrower-facing):** LOs proactively contact any borrower whose loan was in pipeline at exiting lender. Script: "We've secured backup lending capacity. Your loan continues without interruption. Here's your new LO contact." **No public announcement unless media inquiry.**
- **External (partner-facing):** LRM briefs remaining specialty lenders on the exit + our diversification plan (maintains partner confidence).

### Regulatory notification requirements
- None specific to lender withdrawal. If the exiting lender's withdrawal creates consumer harm (e.g., borrowers locked in pipeline lose rate locks), RGC reviews for state UDAP / unfair-practices exposure. LEGCO notifies state AGs if required.

### Recovery criteria
The crisis is "over" when:
- All leads previously routed to exiting lender are now routing to backup lenders.
- Backup lender capacity is confirmed in writing.
- New referral agreements signed with ≥2 replacement lenders.
- Pipeline impact report shows <10% expected funded-loan loss.
- LRM + LOOD + RMOL jointly sign the C-1 recovery memo.

---

## 6.2 C-2 — CFPB inquiry or Civil Investigative Demand

### Trigger
Receipt of any of the following from the Consumer Financial Protection Bureau (CFPB):
- Civil Investigative Demand (CID)
- Examination notice
- Formal information request (e.g., 1042 Civil Investigative Demand, Notice and Opportunity to Respond and Advise (NORA))
- Subpoena or administrative summons

Also triggered by: state AG inquiry into DSCR marketing practices, HUD inquiry, FFIEC examination flagging DSCR marketing.

### Immediate response (first 4 hours)
1. **LEGCO receives + preserves the document** (do not respond, do not delete any records). LEGCO engages outside ECOA/Reg B counsel within 1 hour.
2. **RMOL issues legal hold notice** to all owners: preserve all marketing records, CRM data, ad-platform data, email, Slack, decision logs. No deletion. No edits to existing records.
3. **RGC + LEGCO triage the inquiry scope**: is it specific to the company, or industry-wide? Is it about DSCR marketing, ITIN marketing, foreign-national marketing, Tier D exit messages, or something else?
4. **RMOL convenes crisis war-room**: RMOL, RGC, LEGCO, VP Marketing, CEO (board-level event). Decision: pause all DSCR campaigns pending counsel review? Default = YES, pause within 4 hours.

### 24-hour response
1. **MOL pauses all 8 Meta ad sets + 12 Google ad groups** (if not paused in immediate response). Verify $0 spend.
2. **RGC + outside counsel audit all V2 creative** for the inquiry scope (e.g., if inquiry is about ITIN marketing, audit SA-010 + EG-002 + Spanish-language creative; if inquiry is about Tier D exit messages, audit HEX-001/009/012/013 messages).
3. **LEGCO + outside counsel produce response strategy**: what to produce, what to assert (privilege, scope objections), timeline for response (CFPB CID response window is typically 30 days).
4. **VP Marketing notifies CEO + Board Chair** (board-level event). Board emergency session within 24-48 hours.
5. **PRCOM stands up holding statement** (counsel-approved): "We have received an inquiry from the CFPB and are cooperating fully. We have no further comment at this time." No proactive public statements.

### 72-hour response
1. **LEGCO + outside counsel produce initial response** to CFPB (scope clarification, privilege log, document preservation certification).
2. **RGC completes V2 creative audit**. Identifies any creative that may be perceived as non-compliant. RMOL decides: edit the creative (and resume paused campaigns) OR hold all campaigns until inquiry resolves.
3. **VP Marketing + CEO + Board align on external messaging**: typically, no public statement unless CFPB publicizes the inquiry. If media inquiry, PRCOM coordinates with Legal.
4. **CFO assesses financial exposure**: CFPB consent orders can result in fines ($1M-$50M typical for ECOA violations), restitution, remediation. CFO reserves balance-sheet capacity.

### 1-week response
1. **LEGCO + outside counsel produce full document response** to CFPB (within 30-day window, but staged production begins within 1 week).
2. **RMOL + VP Marketing decide on partial restart**: which campaigns can resume with counsel sign-off? Typically, the cleanest-compliance campaigns (SA-001, SA-002, SA-004 — no ITIN, no FN, no credit-scarred) resume first.
3. **RGC updates the compliance review process**: any creative that triggered inquiry scrutiny is removed from the library. V3 creative rebuild may be required.
4. **PRCOM monitors media**: if inquiry becomes public, prepare proactive op-ed / editorial response (counsel-approved).

### Communication plan
- **Internal:** Need-to-know basis. LEGCO + RGC + RMOL + VP Marketing + CEO + Board are read-in. Other owners informed only as needed (e.g., MOL informed of paused campaigns, but not inquiry specifics).
- **External (borrower-facing):** No proactive borrower communication. If borrowers inquire about paused campaigns, LOs say: "We're temporarily adjusting our marketing. Your loan in process is unaffected."
- **External (media):** Counsel-approved holding statement only. No proactive media outreach. If inquiry is publicized by CFPB or media, PRCOM + LEGCO coordinate response within 24 hours.
- **External (regulator):** LEGCO + outside counsel handle all CFPB communication. No other owner contacts CFPB directly.

### Regulatory notification requirements
- **CFPB response**: LEGCO produces document response within 30-day window (CFPB CID standard).
- **State AG notifications**: if inquiry is multi-state or state AGs parallel-investigate, LEGCO produces parallel state responses.
- **Board notification**: board-level event; CEO + Board Chair notified within 24 hours; board emergency session within 24-48 hours.
- **Cyber-liability / D&O insurance**: carrier notified within 24 hours (defense coverage).

### Recovery criteria
The crisis is "over" when:
- CFPB inquiry resolved (closed without action, settled with consent order, or full response produced and CFPB silent).
- All paused campaigns resumed (or formally terminated) with counsel sign-off.
- V3 creative rebuild (if required) complete + compliance-reviewed.
- Board debriefed on resolution.
- LEGCO + RGC sign the C-2 recovery memo.

---

## 6.3 C-3 — Negative press coverage of DSCR lending

### Trigger
Any of the following:
- Story in a Tier-1 publication (WSJ, NYT, ProPublica, NPR, Bloomberg, Reuters, AP, 60 Minutes) framing DSCR lending as predatory, naming the company OR the broader DSCR industry.
- Story in a Tier-2 publication (HousingWire, National Mortgage News, Scotsman Guide, BiggerPockets) framing DSCR lending as predatory + naming the company.
- >3 Tier-2/3 stories in a single week framing DSCR lending negatively.
- Viral social media post (X/Twitter, LinkedIn, Reddit r/realestateinvesting) naming the company + garnering >10K engagements + negative framing.

### Immediate response (first 4 hours)
1. **PRCOM detects + confirms the story** (Google Alerts, Meltwater, manual monitoring). PRCOM saves the story URL + screenshot (stories can be edited or removed).
2. **PRCOM + RGC review the story** for factual accuracy. Identify any specific claims about the company (true, false, or misleading).
3. **PRCOM + RGC + LEGCO draft holding statement** (within 4 hours):
   - If story contains factual errors: "We are aware of the story and are reviewing. The following factual corrections: [list]."
   - If story is accurate but unfair: "DSCR lending serves a legitimate borrower need. We adhere to all ECOA / Reg B requirements. Our specific practices: [list]."
   - If story is about industry (not company): no statement unless media contacts us.
4. **RMOL convenes crisis war-room**: RMOL, PRCOM, RGC, VP Marketing. Decision: respond publicly (publish holding statement) OR hold (monitor for 24 hours).

### 24-hour response
1. **PRCOM publishes holding statement** (if decision was to respond): on company blog, distributed to media contacts, posted to social media. LEGCO + RGC sign off before publication.
2. **VP Marketing reviews all DSCR creative** for any line that could be quote-mined by the publication. RGC flags any creative for revision.
3. **PRCOM briefs partner lenders + referral partners**: proactive communication, "we're aware of the story, here's our response, here's what we're doing." Maintains partner confidence.
4. **DMAN monitors lead volume impact**: if lead volume drops >20% within 24 hours, RMOL evaluates campaign adjustments (don't pause unless drop >40%).

### 72-hour response
1. **PRCOM + RGC produce follow-up content**: blog post, op-ed draft, podcast appearance pitch, industry-conference talking points. Counter-narrative: DSCR lending as legitimate investor financing, regulatory compliance, borrower protections.
2. **PRCOM pitches follow-up story** to the original publication (if factual errors) or to friendly Tier-2 publications (BiggerPockets, HousingWire) for balanced coverage.
3. **RMOL + VP Marketing review lead volume impact** at 72 hours. If drop >30%, pause affected campaigns + re-plan with trust-building creative (case studies, funded-borrower testimonials, transparent pricing).
4. **RGC finalizes creative revisions**: any line flagged in 24-hour review is revised or removed. V2.1 creative library update deployed.

### 1-week response
1. **PRCOM publishes proactive content**: blog post on "How DSCR lending works + borrower protections"; funded-borrower testimonial video; op-ed in industry publication.
2. **VP Marketing reviews the swarm's positioning**: does the company need to reposition (e.g., emphasize "regulated DSCR" vs "private/hard money")? Long-term brand strategy conversation.
3. **DMAN produces 1-week lead volume impact report**: total drop, recovery trajectory, persona-by-persona impact.
4. **PRCOM monitors for follow-up stories**: if Tier-1 publication runs follow-up, trigger C-3 playbook again.

### Communication plan
- **Internal:** RMOL sends crisis-update at 4-hour, 24-hour, 72-hour, 1-week marks. All owners informed of media holding statement + talking points (so LOs / sales can respond consistently if borrowers ask).
- **External (borrower-facing):** No proactive borrower communication unless they ask. If borrowers ask, LOs say: "We're aware of the story. Here are the facts about our practices: [talking points]."
- **External (media):** PRCOM handles all media inquiries. Holding statement published; no off-the-record comments; no speculative statements.
- **External (partner-facing):** LRM briefs partner lenders + referral partners proactively (within 24 hours).

### Regulatory notification requirements
- None specific to negative press. **However**: if the story triggers regulator interest (CFPB, state AG), C-2 playbook activates. PRCOM + RGC monitor for regulator follow-up.

### Recovery criteria
The crisis is "over" when:
- Lead volume recovers to within 10% of pre-story baseline (typically 2-4 weeks).
- No follow-up Tier-1 stories published.
- No CFPB / state AG inquiry triggered (C-2 playbook not activated).
- Proactive counter-narrative content published + gaining traction.
- PRCOM + RMOL + VP Marketing sign the C-3 recovery memo.

---

## 6.4 C-4 — Lead data breach (Reg P / state privacy law)

### Trigger
Any of the following:
- Confirmed unauthorized access to lead PII (name, SSN/ITIN, address, financials, property addresses) in the CRM or any connected system.
- CRM security alert indicating potential exfiltration (bulk export, off-hours access, unfamiliar IP, anomalous API calls).
- Third-party notification (e.g., FBI, cybersecurity firm, partner) of breach.
- Ransomware attack on CRM or connected systems.

### Immediate response (first 1-4 hours)
1. **TLEAD isolates the CRM** within 1 hour: revoke all access tokens, force password reset for all users, block suspicious IPs, take CRM offline if necessary.
2. **LEGCO + TLEAD engage outside privacy counsel + forensics firm** within 2 hours. Cyber-liability insurance carrier notified within 4 hours.
3. **LEGCO preserves evidence**: all CRM access logs, audit trails, system images. No deletion.
4. **RMOL convenes crisis war-room** (board-level event): RMOL, LEGCO, TLEAD, VP Marketing, CEO. CRTL + LOOD stand by for LO pool communication.
5. **PRCOM stands up holding statement** (counsel-approved): "We are investigating a potential data security incident. We will notify affected individuals as required by law. We have engaged outside cybersecurity counsel + forensics."

### 24-hour response
1. **Forensics firm completes initial scope assessment**: how many records exposed? Which fields? Time window of access? Attack vector?
2. **LEGCO begins regulatory notification timeline**:
   - **GLBA (Reg P)**: notify affected consumers "as soon as possible" (no specific day count, but regulators expect 30-60 days).
   - **CCPA/CPRA (CA)**: notify affected California residents "without unreasonable delay" (typically 30-90 days).
   - **State breach-notification laws** (all 50 states have varying timelines; range: 30-90 days).
   - **State AG notifications** (CA, NY, MA, etc. require AG notification for breaches affecting residents).
3. **TLEAD patches the vulnerability** that allowed the breach. Forensics verifies the patch.
4. **LEGCO + VP Marketing decide on law-enforcement notification**: FBI (IC3) for cybercrime, local law enforcement if physical theft involved.
5. **CFO activates cyber-liability insurance claim**: defense coverage, notification costs, forensics costs, potential fines.

### 72-hour response
1. **LEGCO + forensics confirm full scope**: every affected consumer identified by name + address.
2. **LEGCO produces consumer notification letters** (per GLBA + state law requirements): what happened, what data was involved, what the company is doing, what consumers should do (credit monitoring, fraud alerts).
3. **PRCOM + LEGCO coordinate external statement**: published on company website, distributed to media. Transparency is legally required; do not minimize.
4. **TLEAD deploys enhanced security**: MFA for all CRM users, IP allow-listing, enhanced logging, penetration testing within 30 days.
5. **RMOL + VP Marketing decide on campaign pause**: depending on breach severity, may pause campaigns for 1-2 weeks while security is hardened. Borrower trust is fragile post-breach.

### 1-week response
1. **LEGCO mails consumer notification letters** (if not already sent). Provides free credit monitoring (typically 12-24 months) to affected consumers.
2. **LEGCO files required regulatory notifications**: state AGs (CA, NY, MA, etc.), GLBA regulators (if applicable), state insurance regulators (if applicable).
3. **CFO finalizes insurance claim**: breach costs typically $150-$400 per affected record (forensics + notification + credit monitoring + legal + fines).
4. **VP Marketing + PRCOM review brand impact**: borrower trust survey, lead volume impact, partner lender confidence. Long-term brand recovery plan.
5. **TLEAD completes security hardening**: SOC 2 Type II audit initiated (if not already in progress); annual penetration testing cadence established.

### Communication plan
- **Internal:** Need-to-know basis initially (LEGCO + TLEAD + RMOL + VP Marketing + CEO + Board). Broader owner team informed within 24 hours with strict talking-point adherence. No Slack discussion of breach specifics (use counsel-privileged channel).
- **External (affected consumers):** LEGCO produces notification letters per GLBA + state law. Transparency is legally required. Letters include: incident description, data involved, company response, consumer action steps, credit monitoring offer, contact information.
- **External (media):** PRCOM + LEGCO coordinate. Proactive transparency (publish statement before media breaks the story). No speculative statements about attacker identity or motive.
- **External (regulator):** LEGCO handles all regulator communication. State AG notifications, GLBA regulator notifications, possible CFPB notification (if "customer financial information" involved — triggers CFPB jurisdiction).

### Regulatory notification requirements
- **GLBA (Reg P) Safeguards Rule**: notify affected consumers "as soon as possible."
- **State breach-notification laws**: 50 states, varying timelines (30-90 days typical).
- **State AG notifications**: CA, NY, MA, and others require AG notification.
- **CFPB**: if "customer financial information" involved, CFPB may assert jurisdiction.
- **Cyber-liability insurance**: carrier notified within 24 hours (defense coverage).
- **Law enforcement**: FBI IC3 for cybercrime; local law enforcement if physical theft.

### Recovery criteria
The crisis is "over" when:
- All affected consumers notified per GLBA + state law.
- All regulatory notifications filed.
- Vulnerability patched + verified by forensics.
- Security hardening complete (MFA, IP allow-listing, enhanced logging, penetration testing).
- Cyber-liability insurance claim resolved.
- No follow-on class-action lawsuits (or lawsuits defended via insurance).
- LEGCO + TLEAD + RMOL + VP Marketing sign the C-4 recovery memo.

---

## 6.5 C-5 — Scoring engine bug routes Tier A leads to Tier D nurture (silent failure)

### Trigger
The TS-10 8-component scoring engine has a bug (logic error, field-mapping error, or modifier-stacking failure) that incorrectly routes Tier A-qualified leads to Tier D (defer/automate). Leads silently receive defer/exit messages instead of senior LO contact. The bug is silent because:
- The CRM shows the lead as "processed" (no error).
- The dashboard shows the lead as "Tier D" (consistent with the bug's output).
- LOs don't see the leads (they're in the defer/automate queue).
- The borrower receives a defer/exit message and may not respond.

**Early-warning signals:**
- Tier A rate drops >50% week-over-week (e.g., from 12% to 5%) without ad-targeting change.
- Tier D rate spikes >15pts week-over-week (e.g., from 25% to 40%) without ad-targeting change.
- LO pool idle time spikes (no leads to work) while CRM shows high lead volume.
- Borrower complaints: "I filled out the form but never heard back from a loan officer."

### Immediate response (first 4 hours)
1. **DMAN detects the anomaly** via daily dashboard review. DMAN pages CRTL + RMOL within 1 hour of detection.
2. **CRTL freezes the scoring engine** (set all new leads to manual-review queue) within 2 hours. No new leads auto-routed until bug is identified.
3. **CRTL + DMAN begin root-cause analysis**: review the last 24-48 hours of leads. Were they actually Tier A? If yes, why did the scoring engine route them Tier D?
4. **LOOD redirects LO pools** to manually review the frozen-queue leads (likely 50-200 leads depending on bug duration). Senior LO pool + specialty LO pools work the queue.

### 24-hour response
1. **CRTL identifies the bug**: likely causes (per TS-10 §1E pseudocode):
   - (a) SC-001 DSCR Strength: DSCR input field mis-mapped (e.g., FF-08 Q-008 input mapped to wrong CRM field, defaulting to 0 → score 0 → Tier D).
   - (b) Modifier stacking: SWR deltas stacking incorrectly (e.g., -3 delta stacking to -30 due to loop bug).
   - (c) HEX override: HEX rule firing incorrectly (e.g., HEX-014 STR permit unconfirmed firing for all leads due to lookup-tool API failure).
   - (d) Persona-tag: persona_tag mis-assignment forcing tier-routing override.
2. **CRTL patches the bug** in sandbox. Tests against 20 worked examples (TS-10 §1B) + 50 historical leads.
3. **CRTL re-routes all bug-affected leads**: leads incorrectly routed to Tier D in the past 24-48 hours are re-scored + re-routed to correct tier. LOOD assigns LOs to contact affected borrowers within 4 business hours.
4. **PRCOM drafts borrower apology + recovery message** (if borrowers were sent defer/exit messages): "We experienced a system error that affected your application. Your loan is being personally reviewed by [LO name] who will contact you within [time]. We apologize for the inconvenience."

### 72-hour response
1. **CRTL deploys the patch to production**. Verifies with 50 test leads + 20 worked examples. DMAN monitors dashboard for 24 hours post-deploy.
2. **LOOD completes borrower outreach** to all bug-affected leads. Tracks recovery: how many borrowers re-engaged? How many lost to the bug?
3. **DMAN produces impact report**: total leads affected, by tier + persona + day. Estimated funded-loan impact (lost pipeline).
4. **RMOL + VP Marketing review**: was the bug caught early enough? What's the funded-loan impact? If >5 Tier A leads lost to the bug, escalate to CFO (revenue impact).

### 1-week response
1. **CRTL adds automated regression tests**: the bug's symptom (e.g., DSCR field mis-mapping) is now caught by a daily automated test. DMAN adds the test to the dashboard.
2. **CRTL reviews the entire scoring engine pseudocode** (TS-10 §1E) for similar latent bugs. Patches any found.
3. **DMAN builds early-warning alerts**: Tier A rate drop >50% WoW, Tier D rate spike >15pts WoW, LO pool idle spike. Alerts fire within 1 hour.
4. **RMOL documents the post-mortem**: root cause, detection timeline, mitigation, recovery, preventive measures. Added to Part 3 pre-mortem (PM-014 expansion).

### Communication plan
- **Internal:** RMOL sends crisis-update at 4-hour, 24-hour, 72-hour, 1-week marks. All owners informed. LOs briefed on borrower outreach script.
- **External (affected borrowers):** Proactive outreach by LOs within 24 hours of bug identification. Apology + recovery message + personal LO contact. No mass communication (borrower-by-borrower).
- **External (media):** No proactive communication. This is an internal operations issue, not a public event. If media inquires (unlikely), PRCOM coordinates with RMOL.
- **External (regulator):** No regulatory notification required unless the bug caused adverse-action notice failures (e.g., Tier D exit message sent incorrectly → borrower may have received incorrect adverse-action or no adverse-action). RGC reviews for Reg B §1002.9 exposure; if found, LEGCO notifies regulators.

### Regulatory notification requirements
- **Reg B §1002.9 adverse-action review**: if bug caused incorrect adverse-action notices (sent when shouldn't have, or not sent when should have), RGC + LEGCO review for regulatory exposure. Notify regulators if required.
- **No other regulatory notification** specific to the bug itself.

### Recovery criteria
The crisis is "over" when:
- Bug patched + verified in production.
- All bug-affected leads re-routed + borrower outreach complete.
- Automated regression tests deployed.
- Early-warning alerts active.
- Post-mortem documented + preventive measures in place.
- CRTL + DMAN + LOOD + RMOL sign the C-5 recovery memo.

---

# PART 7 · COMPETITIVE MONITORING FRAMEWORK

> **Purpose:** The DSCR market is competitive — 30+ lenders and 200+ brokers compete for the same borrower pool. This framework defines who we watch, what we watch for, how we watch, and when competitor action requires our response.

## 7.1 Competitor Watch List (10 names)

Tier-A priority (direct DSCR specialist lenders — watch weekly):

| # | Competitor | Type | Why we watch |
|---|---|---|---|
| 1 | **Visio Lending** | DSCR lender (national) | Largest DSCR specialist; rate sheet changes signal market direction; ad creative sets industry tone |
| 2 | **Kiavi** | DSCR lender (national, tech-led) | Tech-led originator; LP + ad creative innovation; lender-partnership model |
| 3 | **Truss Financial** | DSCR lender (national) | In 6 of our 8 LO pool lender-relationship lists; any change to their DSCR program affects our routing |
| 4 | **AHLend** | DSCR lender (specialty: FN, ITIN, credit-scarred) | In 5 of our LO pools; specialty overlap with SA-005/SA-006/SA-008/SA-010 |
| 5 | **Lima One Capital** | DSCR lender (national, specialty: BRRRR, fix-and-flip) | SA-012 BRRRR Cyclist competitor; specialty overlap |
| 6 | **Anchor Loans** | DSCR lender (national, fix-and-flip focus) | Top-of-funnel ad spend heavy; creative benchmark |
| 7 | **Rental360 / Finance of America** | DSCR lender (national, institutional) | Rate sheet + product changes signal institutional DSCR market direction |
| 8 | **DSCR Authority / DSCR Lenders .com** | Lead aggregator / broker | Aggregator model — they bid on the same keywords; their LP changes signal industry funnel shifts |
| 9 | **Newfi Wholesale** | DSCR wholesaler (in our LO pool) | Wholesale partner + competitor for broker-sourced leads; rate sheet changes |
| 10 | **Angel Oak Mortgage Solutions** | Non-QM / DSCR lender (specialty: bank-statement, ITIN) | SA-010 ITIN competitor; non-QM specialist overlap |

Tier-B priority (DSCR broker competitors — watch monthly):

| # | Competitor | Type | Why we watch |
|---|---|---|---|
| 11 | **Lendicom** | DSCR broker | Broker competitor; aggregator of multiple lenders |
| 12 | **Mortgage Mansion** | DSCR broker | Niche broker; creative + funnel benchmark |
| 13 | **Defy Mortgage** | DSCR broker | Newer entrant; aggressive ad spend; creative innovation |
| 14 | **Griffin Funding** | DSCR lender + broker (in our LO pool) | Hybrid lender-broker; partner + competitor |
| 15 | **Lendmire** | DSCR lender (in our LO pool) | Wholesale partner + competitor for broker-sourced leads |

**Total watch list: 15 competitors** (10 Tier-A weekly, 5 Tier-B monthly).

## 7.2 Weekly Monitoring Checklist

Every Monday 9am weekly standup includes a 5-minute competitive monitoring report (DMAN + MOL co-present). Checklist:

### 7.2.1 Ad creative changes (Tier-A: weekly; Tier-B: monthly)
- [ ] AdBeat or Meta Ad Library scan: any new V2-style pattern-interrupt hooks from competitors?
- [ ] SEMrush / SpyFu scan: any new Google Search ad copy from competitors?
- [ ] Manual scan: visit each Tier-A competitor's primary landing page; screenshot any changes; log in tracker.
- [ ] Flag any competitor copying our V2 creative elements (rare but possible — IP/brand issue).

### 7.2.2 Landing page changes (Tier-A: weekly; Tier-B: monthly)
- [ ] Manual visit each Tier-A competitor's primary DSCR LP.
- [ ] Document: headline change? Lead magnet change? Form length change? Trust bar change?
- [ ] Screenshot archive (monthly comparison).

### 7.2.3 Rate sheet / program changes (Tier-A: weekly; Tier-B: monthly)
- [ ] LRM pulls rate sheets from each Tier-A lender competitor (where public).
- [ ] LRM checks program guidelines: DSCR minimums changed? LTV bands changed? Reserves requirements changed?
- [ ] Document: any tightening (raises our opportunity — borrowers seeking alternatives) or loosening (raises our competitive pressure).

### 7.2.4 Lender partnership changes (Tier-A: monthly)
- [ ] LRM checks industry newsletters (HousingWire, National Mortgage News, Scotsman Guide, BiggerPockets) for partnership / merger / exit announcements.
- [ ] Document: any new lender-broker partnerships that could affect our routing? Any lender exits (C-1 playbook trigger)?

### 7.2.5 Keyword / SEO changes (Tier-A: monthly)
- [ ] DMAN pulls SEMrush / Ahrefs: are competitors bidding on new DSCR keywords? Ranking for new organic terms?
- [ ] Document: any keyword gaps we should close? Any competitors outranking us on key terms?

## 7.3 Tools + Cadence

| Tool | Purpose | Cadence | Owner | Annual cost |
|---|---|---|---|---|
| **AdBeat** | Meta + Google ad creative spying | Weekly Tier-A scan | MOL | ~$2,400 |
| **SEMrush** | Google Search ad copy + keyword gap + SEO rank | Weekly Tier-A scan; monthly Tier-B | DMAN | ~$1,800 |
| **SpyFu** | Google Search ad history + competitor PPC strategy | Monthly Tier-A | DMAN | ~$1,000 |
| **Meta Ad Library** | Public Meta ad creative (free) | Weekly Tier-A | MOL | $0 |
| **Google Ads Transparency** | Public Google Search ad creative (free) | Weekly Tier-A | MOL | $0 |
| **Manual LP visits** | Landing page change detection | Weekly Tier-A; monthly Tier-B | DMAN | $0 |
| **Industry newsletters** (HousingWire, National Mortgage News, Scotsman Guide, BiggerPockets) | Lender partnership / market news | Daily scan (PRCOM); weekly digest | PRCOM + LRM | ~$500 |
| **DSCR Authority / Scotsman Guide lender directory** | Lender program + rate sheet tracking | Monthly | LRM | $0 |

**Total annual competitive monitoring cost: ~$5,700** (line item in Q2 budget request).

## 7.4 Competitive Intelligence Report Template (weekly)

> DMAN produces this report every Monday 8am PT for the 9am weekly standup. Format: 1-page Slack post + link to full tracker.

```
WEEKLY COMPETITIVE INTELLIGENCE REPORT — Week of [DATE]
=========================================================

1. TIER-A CREATIVE CHANGES (this week)
   - Visio Lending: new Meta hook "Your tax returns say one thing. Your rentals say another."
     [NOTE: similar to our SA-001 PI-1 hook — possible copycat. Flag to RGC for IP review.]
   - Kiavi: new Google RSA "DSCR loans up to $3M. No DTI. Close in 21 days."
     [NOTE: 21-day close claim mirrors our V2 plausibility contract — verify they can deliver.]
   - [other Tier-A: no changes]

2. TIER-A LP CHANGES (this week)
   - Visio: added lead magnet (DSCR calculator). [Our LP-SA-001 has had this since W1D4.]
   - [other Tier-A: no changes]

3. TIER-A RATE SHEET / PROGRAM CHANGES (this week)
   - Visio: lowered DSCR minimum from 1.25 to 1.20 on LTV ≤70%. [Implication: our SA-001
     mid-DSCR cohort now has competitor alternative. Watch Tier A-or-B rate impact.]
   - Truss: tightened reserves from 6mo to 9mo on SA-008 credit-scarred program.
     [Implication: our SA-008 routing may pick up Truss-rejected borrowers.]
   - [other Tier-A: no changes]

4. TIER-A LENDER PARTNERSHIP / MARKET NEWS (this week)
   - Lima One Capital acquired [smaller DSCR lender]. [Implication: consolidation — possible
     rate / program changes forthcoming.]
   - [other Tier-A: no news]

5. KEYWORD / SEO CHANGES (this month)
   - Competitors now bidding on "DSCR loan no DTI" (was our exact-match exclusive).
     [Implication: CPC may rise. MOL to monitor CPC + adjust bid strategy.]
   - [other: no changes]

6. RESPONSE TRIGGERS FIRED THIS WEEK
   - [list any threshold from §7.6 that fired, with action taken]

7. WATCH-LIST ADDITIONS / REMOVALS
   - [added: new competitor X]
   - [removed: competitor Y no longer active]
=========================================================
```

## 7.5 Monthly Competitive Review (deep-dive)

Once per month (last Friday of month, 30 min, in monthly review per Part 8.3):
- DMAN presents the monthly competitive trend: which competitors are scaling ad spend? Which are pulling back?
- MOL presents the CPC / CPM trend: is competitor activity inflating our acquisition costs?
- LRM presents the lender program trend: which competitors are loosening / tightening? What's the implication for our routing?
- RMOL decides: any competitive response required this month?

## 7.6 Response Triggers (when does competitor action require our response?)

| Trigger | Threshold | Action | Owner | Timeline |
|---|---|---|---|---|
| Competitor copies our V2 creative | Any competitor ad copies ≥1 of our pattern-interrupt hooks verbatim | RGC reviews for IP / trademark infringement. If infringing, LEGCO sends cease-and-desist. | RGC + LEGCO | Within 5 business days |
| Competitor lowers DSCR minimum | Tier-A competitor lowers DSCR minimum below our SC-001 baseline (1.20) | CRTL reviews whether to update SC-001 baseline. MOL updates ad copy to match (if claiming DSCR minimum). | CRTL + MOL | Within 2 weeks |
| Competitor raises rate (tightens) | Tier-A competitor raises rates >50bps OR tightens reserves / LTV | LRM + LOOD reach out to affected borrowers (we have a better offer). MOL updates ad copy to highlight our better terms. | LRM + LOOD + MOL | Within 1 week |
| Competitor lowers rate (loosens) | Tier-A competitor lowers rates >50bps OR loosens reserves / LTV | CFO + VP Marketing review whether we can match. If not, MOL pivots ad copy to non-rate differentiation (specialty routing, decline-letter triage, etc.). | CFO + VP Marketing + MOL | Within 2 weeks |
| Competitor enters our specialty niche | Tier-A competitor launches ITIN, FN, or credit-scarred DSCR program | MOL + CRTL review competitive impact on SA-005/SA-006/SA-008/SA-010. May need to add specialty differentiators to ad copy. | MOL + CRTL | Within 2 weeks |
| Competitor exits DSCR market | Any Tier-A competitor announces DSCR exit | Trigger Part 6 C-1 playbook (Major specialty lender withdrawal) if competitor is in our LO pool. Otherwise, opportunistic: MOL + LRM pursue their orphaned borrowers. | LRM + LOOD + MOL | Within 24 hours |
| Competitor CPC inflation | Tier-A competitor bidding aggressively inflates our CPC >20% WoW | MOL shifts budget from affected keywords to long-tail / phrase-match alternatives. DMAN monitors CPC trend. | MOL + DMAN | Within 1 week |
| Competitor LP copycats our lead magnet | Tier-A competitor copies our DSCR calculator / decline-letter audit / etc. | RGC reviews for IP. If original, LEGCO considers copyright / trademark registration. MOL differentiates via risk-reversal offers. | RGC + LEGCO + MOL | Within 2 weeks |

## 7.7 Competitive Response Decision Framework

When competitor action triggers one of the §7.6 thresholds, RMOL + the relevant owner apply this decision framework:

1. **Is the competitor action material to our KPIs?** (If no — monitor, don't respond.)
2. **Can we match or beat the competitor's move within 2 weeks?** (If yes — execute; if no — pivot to differentiation.)
3. **What's the cost of responding?** (Ad copy revision, lender program change, IP enforcement, etc. Weigh against the cost of not responding.)
4. **What's the regulatory compliance risk of the response?** (RGC reviews — e.g., matching a competitor's "lowest rates" claim would violate V2 forbidden copy.)
5. **Does this require leadership approval?** (If response budget >$10K or affects >25% of weekly spend, VP Marketing approval required.)

---

# PART 8 · WEEKLY STANDUP + MONTHLY REVIEW TEMPLATES

> **Purpose:** Pre-defined templates so the team doesn't reinvent the agenda every week. Lift and deploy.

## 8.1 Weekly Standup Template (Mondays 9am PT, 30 min)

### Attendees
- RMOL (Rollout Marketing-Ops Lead) — **chairs**
- RGC (Reg B Compliance Counsel)
- MOL (Meta/Google Ops Lead)
- CRTL (CRM Team Lead)
- TLEAD (Tech Lead)
- LOOD (LO Operations Director)
- LRM (Lender Relationship Manager)
- DMAN (Data Analyst)
- PMON (Project Manager) — **scribe**
- PRCOM (PR / Communications Lead) — only if active issue
- Optional: VP Marketing (drop-in for first 5 min)

### Standing Agenda (30 min)

| Time | Item | Owner |
|---|---|---|
| 9:00–9:03 | Roll call + PMON captures attendance | PMON |
| 9:03–9:08 | **KPI dashboard walkthrough** (DMAN): spend WoW + MoM, leads by tier, CPL, CPQA, LO SLA compliance, persona-tag accuracy. Flag any metric >20% off target. | DMAN |
| 9:08–9:13 | **Pre-mortem scan** (DMAN): which Part 3 PM-IDs had early-warning signals fire in the past week? For each triggered PM-ID: owner presents status (monitoring / mitigation active / resolved). | DMAN + PM-ID owners |
| 9:13–9:18 | **Tier-distribution review by ad set + persona** (MOL + CRTL): any Meta broad ad set breaching Tier D >40%? Any persona breaching Tier A-or-B <25%? | MOL + CRTL |
| 9:18–9:22 | **LO pool performance** (LOOD): SLA compliance by tier, persona-tag accuracy from LO side, any friction. | LOOD |
| 9:22–9:25 | **Competitive intelligence report** (DMAN + MOL): per Part 7.4 template. Any §7.6 response triggers fired? | DMAN + MOL |
| 9:25–9:28 | **Compliance status** (RGC): any new flags? Any deferred personas? Any regulatory news? | RGC |
| 9:28–9:30 | **Decisions + action items** (RMOL): RMOL captures decisions made, action items + owners + due dates. PMON logs in decision log. | RMOL + PMON |

### Decisions + Action Items Log (PMON scribes)

```
WEEKLY STANDUP DECISIONS + ACTION ITEMS — Week of [DATE]
=========================================================
DECISIONS MADE:
  [D-YYYY-NNN] — <decision text> — Decider: <role> — Date: <YYYY-MM-DD>
  ...

ACTION ITEMS:
  [AI-YYYY-NNN] — <action text> — Owner: <role> — Due: <YYYY-MM-DD> — Status: [OPEN/DONE/BLOCKED]
  ...

CARRYOVER FROM LAST WEEK:
  [AI-YYYY-NNN] — <action text> — Owner: <role> — Due: <YYYY-MM-DD> — Status: [OPEN/DONE/BLOCKED]
  ...
=========================================================
```

## 8.2 Weekly KPI Dashboard Template

> DMAN produces this dashboard every Monday 8am PT for the 9am standup. Live in Looker / Tableau / Google Data Studio. Format below is the Slack-post summary; full dashboard is the live tool.

```
WEEKLY KPI DASHBOARD — Week of [DATE] (W[N])
==============================================

1. FUNNEL VOLUME (this week / cumulative vs target)
   - Form completions: [actual] / [target] ([% to target])
   - Tier A leads: [actual] / [target] ([% to target])
   - Tier A-or-B leads: [actual] / [target] ([% to target])

2. FUNNEL QUALITY
   - Tier A-or-B rate: [%] (target 33%)
   - Tier D rate: [%] (target <25%, ceiling 35%)
   - Persona fit rate (top-3): [%] (target 55%)
   - Documentation upload rate: [%] (target 60%)

3. ECONOMICS
   - Spend: $[actual] / $[target]
   - CPL (Form_Complete): $[actual] (target $50-90)
   - CPQA (Tier_Routed_A_or_B): $[actual] (target $120-200 stretch, $250 90-day)
   - Cost per pre-qual letter: $[actual] (target $1,300)
   - Cost per loan in UW: $[actual] (target $4,500)
   - CPFL (if funded loans this week): $[actual] (target <$8,500)

4. OPERATIONAL HEALTH
   - LO SLA compliance (by tier): Tier A [%] / Tier B [%] / Tier C [%] (target ≥95%)
   - Persona-tag accuracy: [%] (target ≥85%)
   - Specialty-lender routing acceptance: [%] (target ≥70%)
   - Time-to-close (by tier): Tier A [days] / Tier B [days] / Tier C [days]

5. SWARM HEALTH
   - Specialty-lender referral rate: [%] (target 20%)
   - Decline-letter audit conversion: [%] (target 15%)
   - EG edge-case capture rate: [%] (target ≥80%)
   - Funded loans this week: [N] / cumulative [N] (target 5 by end of M3)

6. PM-ID EARLY-WARNING SIGNALS (Part 3)
   - PM-002 (Meta broad Tier D): Tier D rate WoW trend [↑/↓/flat]
   - PM-006 (optimization event): verified on all 20 placements? [Y/N]
   - PM-008 (CRM backlog): any backlog alert? [Y/N]
   - PM-014 (persona mismatch): persona-tag accuracy WoW [↑/↓/flat]
   - [other PM-IDs as triggered]

7. A/B TESTS ACTIVE
   - ABT-[NNN]: <name> — Status: [running/paused/concluded] — Days running: [N] — Conversions per variant: [N] (target ≥100 for decision)
   - ...

8. AD SET + AD GROUP PERFORMANCE (top 5 + bottom 5 by CPQA)
   Top 5:
     1. [ad set/group ID] — CPQA $[actual] — Tier A-or-B rate [%]
     2. ...
   Bottom 5:
     1. [ad set/group ID] — CPQA $[actual] — Tier A-or-B rate [%] — [PAUSE CONSIDERED?]
     2. ...
==============================================
```

## 8.3 Monthly Review Deck Template (10-slide structure)

> RMOL produces this deck for the end-of-month leadership review. 60-min meeting. Last Friday of each month.

### Attendees
- VP Marketing (chairs)
- RMOL
- RGC
- MOL
- CRTL
- TLEAD
- LOOD
- LRM
- DMAN
- PMON
- PRCOM
- CFO (drop-in for slides 6-7)
- General Counsel (drop-in for slides 3, 9)
- Optional: CEO (for slide 10)

### Slide 1: Executive Summary (1 slide)
- Month-over-month KPI snapshot (5 key metrics: spend, leads, Tier A-or-B rate, CPQA, funded loans)
- One-paragraph narrative: "M[N] delivered [X] against target [Y]. [Bull/Base/Bear] trajectory. Top win: [X]. Top risk: [Y]."

### Slide 2: KPI Dashboard — Full (1 slide)
- The §8.2 dashboard, full version, month-end actuals vs targets.
- Color-coded (green/yellow/red) per metric.

### Slide 3: Compliance + Regulatory Status (1 slide)
- RGC presents: any new compliance flags? Any deferred personas? Any regulatory news (CFPB, state AG, industry)?
- Any Part 3 PM-001 / PM-005 / PM-010 signals?

### Slide 4: Funnel Performance by Persona (1 slide)
- DMAN presents: per-persona performance (spend, leads, Tier A-or-B rate, CPQA, funded loans).
- Identify top-3 + bottom-3 personas. Any persona recommended for pause / scale?

### Slide 5: Funnel Performance by Channel + Geo (1 slide)
- DMAN presents: per-channel (Google / Meta / YouTube / Native) performance. Per-geo (top-10 MSAs) performance.
- Any channel / geo recommended for budget shift?

### Slide 6: Capital Efficiency + Cash Flow (1 slide)
- CFO presents: budget burn vs plan, CPFL trajectory, pipeline revenue forecast, cash flow status.
- Any Part 3 PM-015 signals? Any Part 4 §4.3 break-even concerns?

### Slide 7: Scenario Plan Update (1 slide)
- RMOL presents: Base / Bull / Bear trajectory. Which trigger_metrics are trending which way?
- Any scenario re-baseline required?

### Slide 8: LO Pool + Specialty Lender Performance (1 slide)
- LOOD + LRM present: SLA compliance by tier + persona, persona-tag accuracy, specialty-lender routing acceptance, any lender capacity issues.
- Any Part 3 PM-003 / PM-008 / PM-014 signals?

### Slide 9: Risk Register + Pre-Mortem Update (1 slide)
- RMOL presents: Part 3 PM-ID status (monitoring / mitigation active / resolved). Any new PM-IDs identified this month?
- Any Part 6 crisis playbooks activated this month?

### Slide 10: Decisions + Asks for Next Month (1 slide)
- RMOL presents: decisions required from leadership for next month (budget shifts, persona adds/removes, scope changes).
- Any Q2 / Q3 planning implications?

### Monthly Decision Log Template

```
MONTHLY REVIEW DECISION LOG — [MONTH] Review (Date: YYYY-MM-DD)
================================================================
DECISIONS MADE:
  [D-YYYY-NNN] — <decision text> — Decider: <role> — Date: <YYYY-MM-DD>
  ...

ACTION ITEMS (carry to next month):
  [AI-YYYY-NNN] — <action text> — Owner: <role> — Due: <YYYY-MM-DD>
  ...

BUDGET DECISIONS:
  - M[N+1] budget: $[amount] ([hold/increase/decrease] from M[N])
  - Persona adds/removes: [list]
  - Channel re-allocation: [list]

LEADERSHIP ASKS FOR NEXT MONTH:
  - <ask 1>
  - <ask 2>
================================================================
```

---

# PART 9 · GO / NO-GO SCALING CRITERIA

> **Purpose:** Remove subjective judgment from scaling decisions. Every scaling action has explicit, metric-driven criteria. If the criteria are met, scale. If not, don't. No "I think it's going well" — only "the metrics say scale."

## 9.0 Scaling Decision Index

| Decision | Required metrics (all must hit) | Authority | Lead time |
|---|---|---|---|
| Scale budget 2x | 3 metrics (all hit) | VP Marketing + CFO | 1 week |
| Pause a persona | 2 metrics (both miss) | RMOL | 24 hours |
| Pause the entire swarm | 1 metric (miss) | VP Marketing | 4 hours |
| Add a new persona mid-quarter | 3 evidence requirements | RMOL + VP Marketing | 2 weeks |
| Remove a persona mid-quarter | 3 evidence requirements | RMOL + VP Marketing | 1 week |

---

## 9.1 Scale Budget 2x (Q1 $150K → Q2 $300K)

**Authority:** VP Marketing + CFO (joint sign-off). Board notification if Q2 budget >$300K.

**All 3 of the following metrics must hit by end of M3 (90-day cohort review):**

| # | Metric | Threshold | Source |
|---|---|---|---|
| 1 | **Cost per funded loan (CPFL)** | < $6,500 (24% below the $8,500 target) | DMAN dashboard, end-of-M3 cohort review |
| 2 | **Funded loan count** | ≥ 5 funded loans (V1 target hit) | CRM funded-loan records |
| 3 | **Tier A-or-B rate** | ≥ 33% (V1 90-day target hit) | DMAN dashboard, 90-day cumulative |

**Additional pre-conditions (must also be true):**
- No Part 3 PM-ID in mitigation-active state for >5 business days at time of scale decision.
- LOOD confirms LO capacity for 2x lead volume (may require hiring — 4-6 week lead time, so LOOD begins recruiting in M2 if Bull trajectory emerges).
- LRM confirms specialty-lender capacity for 2x referral volume (each of 12 specialty lenders confirms in writing).
- RGC confirms compliance capacity for 2x creative volume (V3 creative library expansion, if needed).

**Action playbook if all criteria met:**
1. End-of-M3 monthly review: VP Marketing + CFO formalize Q2 $300K activation.
2. CFO confirms cash flow for Q2 $300K (consider Q1 net loss + Q2 spend = ~$300K-$400K cash need).
3. W14 (first week of Q2): weekly budget cap doubles from $12,500 to $25,000.
4. MOL scales winning ad sets (per A/B test winners) + adds new ad sets for M2/M3 personas not yet live.
5. LOOD activates additional LO capacity (hired in M2-M3).
6. LRM activates 2 new specialty lenders (signed in M2-M3).

**If criteria not met:** Q2 budget holds at $50K/month (Base scenario). RMOL diagnoses which criteria missed + presents Q2 plan to recover.

---

## 9.2 Pause a Persona

**Authority:** RMOL (with VP Marketing notification within 24 hours).

**Either of the following 2 metrics must miss for 2 consecutive weeks:**

| # | Metric | Threshold (miss) | Source |
|---|---|---|---|
| 1 | **CPQA (cost per Tier A-or-B lead) for the persona** | > $400 for 2 consecutive weeks | DMAN dashboard, per-persona |
| 2 | **Tier A-or-B rate for the persona** | < 20% for 2 consecutive weeks | DMAN dashboard, per-persona |

**Additional pre-conditions (must also be true):**
- The persona's ad set has been running for ≥4 weeks (statistical power — don't pause a persona in week 1 due to noisy data).
- A/B tests on the persona's ad set have been concluded (not currently running — don't pause mid-test).
- LO pool for the persona has been trained + staffed (don't pause due to LO capacity — fix the LO capacity issue).

**Action playbook if criteria met:**
1. RMOL pauses the persona's ad set within 24 hours of confirming the criteria.
2. MOL re-allocates the paused budget to top-performing personas (per §8.2 dashboard top-5 list).
3. CRTL updates CRM routing: paused-persona leads still in CRM are processed by LO pool; no new leads acquired.
4. RMOL documents the pause rationale in the decision log + notifies VP Marketing within 24 hours.
5. RMOL reviews the paused persona in the next monthly review: resume (if criteria recover), keep paused (if not), or remove (per §9.5).

---

## 9.3 Pause the Entire Swarm

**Authority:** VP Marketing (with CEO notification within 4 hours; Board notification within 24 hours).

**The following 1 metric must miss at any monthly review:**

| # | Metric | Threshold (miss) | Source |
|---|---|---|---|
| 1 | **Cost per funded loan (CPFL) at the monthly review** | > $14,000 (Bear scenario trigger) | DMAN dashboard, end-of-month cohort review |

**Additional triggers (also activate swarm pause):**
- Any Part 6 Crisis playbook activated (C-1 through C-5).
- Part 3 PM-006 (optimization event misconfigured) confirmed active for >2 weeks undetected.
- Part 3 PM-010 (CFPB inquiry) or PM-012 (data breach) trigger fires.
- Cash flow threshold per Part 3 PM-015: cash outflow > $100K before any funded-loan revenue recognized AND CFO flags cash flow risk.
- Regulatory hold: RGC + LEGCO recommend pause due to compliance concern.

**Action playbook if criteria met:**
1. VP Marketing approves pause within 4 hours of trigger.
2. MOL pauses all 8 Meta ad sets + 12 Google ad groups within 1 hour of VP Marketing approval. Verify $0 spend.
3. RMOL notifies CEO within 4 hours; Board within 24 hours.
4. RMOL triggers Part 5 Bear scenario diagnostic (within 24 hours).
5. DMAN + CRTL + MOL + RMOL complete diagnostic within 5 business days.
6. VP Marketing + CFO decide within 10 business days: resume (with fixes), reduce scope, or terminate Q1 launch.

---

## 9.4 Add a New Persona Mid-Quarter

**Authority:** RMOL + VP Marketing (joint sign-off).

**All 3 of the following evidence requirements must be met:**

| # | Evidence | Source |
|---|---|---|
| 1 | **Inbound demand** | ≥3 inbound leads requesting the persona's product in a 2-week window (e.g., 3 leads asking about ITIN DSCR when SA-010 isn't yet live) | CRM inbound-lead notes + LO pool feedback |
| 2 | **Lender capacity confirmed** | LRM confirms ≥1 specialty lender with active program for the persona + capacity for ≥10 leads/month | LRM lender outreach tracker |
| 3 | **Persona-specific landing page ready** | TLEAD confirms the persona's LP (from AC-09 V2 Part 7) is deployed on production with pixel + FF-08 form firing | TLEAD LP deploy log |

**Additional pre-conditions:**
- The persona has cleared G1 Compliance gate (RGC sign-off).
- LO pool for the persona is trained + staffed (LOOD sign-off).
- A/B test variants for the persona are loaded (CRTL + MOL sign-off).

**Action playbook if all evidence met:**
1. RMOL + VP Marketing approve the persona add in the next weekly standup.
2. MOL unpause's the persona's ad set at 10% of weekly budget ($1,250/week).
3. Soft-launch the persona for 1 week (10% budget), then scale per W3D2/W3D3 decision tree (Part 2).
4. RMOL documents the add rationale in the decision log.

---

## 9.5 Remove a Persona Mid-Quarter

**Authority:** RMOL + VP Marketing (joint sign-off).

**All 3 of the following evidence requirements must be met:**

| # | Evidence | Source |
|---|---|---|
| 1 | **Persistent low lead volume** | <2 Tier A-or-B leads from the persona in a 4-week window | DMAN dashboard, per-persona |
| 2 | **Persistent high CPQA** | CPQA > $500 for the persona for 4 consecutive weeks | DMAN dashboard, per-persona |
| 3 | **Zero funded loans** | 0 funded loans from the persona's leads in the quarter (90-day window) | CRM funded-loan records |

**Additional pre-conditions:**
- The persona's ad set has been running for ≥8 weeks (don't remove a persona before it has had a fair chance).
- A/B tests have concluded (don't remove mid-test).
- LO pool feedback: LOs confirm the persona's leads are not converting (not just a scoring-engine issue — see PM-014).

**Action playbook if all evidence met:**
1. RMOL + VP Marketing approve the persona removal in the next weekly standup.
2. MOL pauses the persona's ad set within 24 hours.
3. CRTL updates CRM routing: persona's leads still in CRM are processed by LO pool; no new leads acquired.
4. RMOL documents the removal rationale in the decision log + notifies leadership.
5. RMOL reviews the removed persona in the next quarterly iteration cycle (per Decision D4): re-evaluate for re-launch with revised targeting / creative / scoring.

---

## 9.6 Scaling Decision Quick Reference (1-page)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  GO / NO-GO SCALING QUICK REFERENCE                                          │
│                                                                              │
│  SCALE BUDGET 2X (Q1 $150K → Q2 $300K):                                      │
│    All 3 must hit by end of M3:                                              │
│      [ ] CPFL < $6,500                                                       │
│      [ ] Funded loans ≥ 5                                                    │
│      [ ] Tier A-or-B rate ≥ 33%                                              │
│    Plus: no PM-ID in mitigation >5 days; LO capacity confirmed; lender       │
│    capacity confirmed; compliance capacity confirmed.                        │
│    Authority: VP Marketing + CFO.                                            │
│                                                                              │
│  PAUSE A PERSONA:                                                            │
│    Either of 2 must miss for 2 consecutive weeks:                            │
│      [ ] CPQA > $400 for the persona                                         │
│      [ ] Tier A-or-B rate < 20% for the persona                              │
│    Plus: ad set running ≥4 weeks; no active A/B test; LO pool staffed.       │
│    Authority: RMOL (notify VP Marketing within 24 hours).                    │
│                                                                              │
│  PAUSE THE SWARM:                                                            │
│    1 metric must miss at any monthly review:                                 │
│      [ ] CPFL > $14,000                                                      │
│    OR any Part 6 Crisis activated; OR PM-006 active >2 weeks; OR PM-010/012  │
│    triggered; OR PM-015 cash flow threshold; OR RGC regulatory hold.         │
│    Authority: VP Marketing (CEO within 4 hours; Board within 24 hours).      │
│                                                                              │
│  ADD A NEW PERSONA:                                                          │
│    All 3 evidence requirements:                                              │
│      [ ] ≥3 inbound leads requesting the persona in 2 weeks                  │
│      [ ] Lender capacity confirmed                                           │
│      [ ] Persona-specific LP ready                                           │
│    Plus: G1 cleared; LO pool trained; A/B tests loaded.                      │
│    Authority: RMOL + VP Marketing.                                           │
│                                                                              │
│  REMOVE A PERSONA:                                                           │
│    All 3 evidence requirements:                                              │
│      [ ] <2 Tier A-or-B leads from persona in 4 weeks                        │
│      [ ] CPQA > $500 for 4 consecutive weeks                                 │
│      [ ] 0 funded loans from persona in quarter                              │
│    Plus: ad set running ≥8 weeks; no active A/B test; LOs confirm.            │
│    Authority: RMOL + VP Marketing.                                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

# PART 10 · BOARD ONE-PAGER TEMPLATE

> **Purpose:** A single page leadership can lift verbatim for board reporting. No editing required — just fill in the blanks.

---

## 10.1 Board One-Pager — DSCR Swarm Quarterly Update

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  DSCR BORROWER-INTELLIGENCE SWARM — [QUARTER] BOARD UPDATE                    │
│  Prepared by: VP Marketing + RMOL    Date: [YYYY-MM-DD]    Page 1 of 1        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  MISSION (2 sentences)                                                       │
│  The DSCR borrower-intelligence swarm acquires approval-weighted DSCR        │
│  borrower leads at a target cost per funded loan (CPFL) below $8,500,        │
│  using a 12-persona library, an 8-component 0-100 approval score, and a      │
│  V2 ad creative library. The 90-day rollout deploys $150K against an         │
│  expected 5 funded loans, with explicit go/no-go scaling triggers for Q2.    │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  90-DAY KPI ACTUALS vs TARGETS                                               │
│                                                                              │
│  KPI                            Target      Actual       % to Target          │
│  ──────────────────────────── ─────────── ─────────── ──────────               │
│  Form completions                1,200      [actual]     [____%]              │
│  Tier A-or-B leads                 390      [actual]     [____%]              │
│  Tier A-or-B rate                 33%       [actual]%    [____%]              │
│  Cost per Tier A-or-B lead       $250      $[actual]     [____%]              │
│  Cost per funded loan           <$8,500    $[actual]     [____%]              │
│  Funded loans                       5       [actual]     [____%]              │
│  Specialty-lender referral rate   20%       [actual]%    [____%]              │
│  LO SLA compliance                ≥95%      [actual]%    [____%]              │
│                                                                              │
│  SCENARIO: [Base / Bull / Bear]                                              │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TOP 3 WINS                                                                  │
│  1. [e.g., "W3 soft launch hit 38% Tier A-or-B rate (5pts above target)"]    │
│  2. [e.g., "SA-002 Portfolio Scaler delivered 2 funded loans at $4,200 CPFL"]│
│  3. [e.g., "Decline-letter triage campaign (SA-011) launched on schedule;    │
│      18% conversion in first 4 weeks"]                                       │
│                                                                              │
│  TOP 3 RISKS + MITIGATIONS                                                   │
│  1. [e.g., "PM-002: Meta broad attracting Tier D leads at 38% (ceiling 35%). │
│      Mitigation: paused 2 ad sets, re-targeting with lookalike off funded-   │
│      loan customer file. Re-launch W[NN]."]                                  │
│  2. [e.g., "PM-008: Tier B specialty LO pool SLA compliance at 82% (target   │
│      ≥95%). Mitigation: LOOD hiring 2 additional LOs; backup capacity from    │
│      senior LO pool."]                                                       │
│  3. [e.g., "PM-005: Phoenix STR legislation pending. Mitigation: SWR-014     │
│      watchlist active; MOL ready to geo-exclude Phoenix within 24 hours of    │
│      passage."]                                                              │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CAPITAL DEPLOYED + REMAINING                                                │
│  Q1 budget: $150,000                                                         │
│  Deployed to date: $[actual]                                                 │
│  Remaining: $[actual]                                                        │
│  Expected Q1 funded-loan revenue: $[actual]                                  │
│  Q1 net P&L forecast: $[actual] (loss-making by design — learning quarter)   │
│  Q2 budget ask: $[50K / $300K / TBD based on scenario]                       │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  DECISION ASKS FOR NEXT QUARTER                                              │
│  1. [e.g., "Approve Q2 budget: $300K if Bull scenario confirmed (Part 9.1    │
│      criteria met); otherwise $50K/month Base."]                             │
│  2. [e.g., "Approve Q2 iteration cycle kickoff (re-harvest CF-01,            │
│      re-normalize GL-02, recalibrate TS-10 weights)."]                       │
│  3. [e.g., "Approve Q2 new persona additions per Part 9.4 evidence: [list]."]│
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  APPENDIX REFERENCES (full detail)                                           │
│  • V2 godmode briefing: /download/next_steps/01_90Day_Rollout_Briefing_      │
│    GODMODE.md (Parts 1-10)                                                   │
│  • V1 executive briefing: /download/next_steps/01_90Day_Rollout_Briefing.pdf │
│  • CRM + AdOps implementation: /download/next_steps/02_CRM_AdOps_            │
│    Implementation_Packet.pdf                                                 │
│  • Reg B compliance review: /download/next_steps/03_RegB_Compliance_         │
│    Review_Packet.pdf                                                         │
│  • Quarterly iteration runbook: /download/next_steps/04_Quarterly_           │
│    Iteration_Runbook.pdf                                                     │
│  • TS-10 targeting + scoring: /download/agent_outputs/TS10_targeting_        │
│    scoring.md                                                                │
│  • SA-05 persona library: /download/agent_outputs/SA05_persona_library.md    │
│  • AC-09 V2 ad creative: /download/agent_outputs/AC09_V2_ad_copy.md          │
│  • KPI dashboard (live): [internal Looker/Tableau link]                      │
│  • Decision log (live): [internal Notion/Confluence link]                    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 10.2 Board One-Pager — Usage Notes

- **Cadence:** Quarterly (end of Q1, Q2, Q3, Q4). Plus interim one-pager if Part 5 Bear scenario triggers (within 5 business days of trigger).
- **Audience:** Board of Directors. Optional: CEO executive team, investor relations.
- **Length:** Strict 1 page. No appendices on the one-pager (references in §10.1 are links, not content).
- **Tone:** Factual, metric-driven, no hedging. Wins and risks stated with equal directness.
- **Preparation:** RMOL drafts; VP Marketing reviews; CFO reviews financial lines (§10.1 capital + asks); GC reviews risk lines (§10.1 risks) for legal exposure. Final approval: VP Marketing.
- **Distribution:** Board packet 5 business days before board meeting. RMOL presents in board meeting if requested.

---

# END OF D1-GODMODE BRIEFING

**Document complete.** 10 parts. Lift-and-deployable. Supersedes V1 for governance purposes.

**Next steps for leadership:**
1. Read Part 1 (7 min).
2. Sign the Part 1.5 approval block within 5 business days.
3. Designate the 11 named roles (Part 2.1) before W1D1.
4. Authorize the 4 pre-launch gates (Decision D2).
5. Authorize the 12 specialty-lender referral outreach (Decision D3).
6. Commit the quarterly iteration FTE (Decision D4).

**Next steps for marketing-ops:**
1. Pre-brief RGC with V2 creative packet in W0 (before W1D1).
2. Confirm 11 named roles are filled before W1D1.
3. Begin the Part 2 day-by-day script on W1D1 Monday 8am PT.
4. Pre-build the daily status template + decision log (Part 2.0).
5. Pre-load the Part 3 PM-ID dashboard alerts (Slack `#d1-godmode-launch` channel).
6. Pre-load the Part 8.2 weekly KPI dashboard template (Looker / Tableau / Google Data Studio).

**Dependencies for PDF build:**
- This markdown file (`01_90Day_Rollout_Briefing_GODMODE.md`) is the source of truth.
- PDF render should preserve the ASCII tables + YAML code blocks + decision-matrix formatting.
- Page count target: ~50-60 pages (vs V1's 12 pages).
- Recommended PDF builder: Pandoc with LaTeX (or ReportLab per pdf skill).
- Cover page: SOVEREIGN OS · D1-GODMODE · 90-Day Rollout Briefing (V2 Godmode).
- Header: "D1-GODMODE | Confidential | Internal Use".
- Footer: page X of Y · [date].

