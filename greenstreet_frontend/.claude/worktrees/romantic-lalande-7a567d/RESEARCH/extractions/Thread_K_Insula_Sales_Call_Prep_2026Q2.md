---
type: synthesis
status: drafted
title: "Thread K: Insula Sales Call Prep 2026 Q2 (DEPRECATED)"
summary: "Insula sales call prep — REMOVED per Master Plan v11.2 §6 decision D3. Channel no longer in scope. Kept for historical reference only."
created: 2026-06-22
vaulted_at: 2026-06-22
author: Mavis (root session mvs_b78f9d32cd6348d6a48278d25e380ca4)
---

# Thread K — Insula Capital Group Sales Engineering Call Deep-Prep

**Date:** 2026-06-21
**Author:** Mavis (research-mode, no code)
**Status:** ⚠️ **DEPRECATED 2026-06-21 17:36 PT** — User removed Insula channel from scope ("skip this overall i never need it"). Retained for reference. Do NOT action; do NOT calendar invite for Jul 11, 2026.
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\_obsidian_vault\_research\extractions\Thread_K_Insula_Sales_Call_Prep_2026Q2.md`

---

## 0. Why this thread exists (DEPRECATED — see status above)

~~Master Plan v11 §6 lists "Insula Capital sales engineering call Jul 11, 2026" as one of the four Q3 2026 immediate actions. Per Tier4_DeepDive_2026Q2.md, this call is the entry point for a 12-18 month blue-ocean window for portfolio-DSCR analytics.~~

~~This thread produces a research-grade sales engineering prep document for the Jul 11, 2026 call. Goal: ensure we walk in with full knowledge of Insula's recent moves, competitive landscape, and concrete value-prop talking points.~~

**DEPRECATION NOTE:** Per user decision 2026-06-21 17:36 PT, the Insula sales channel has been removed from the plan. The 12-question prep + 4 talking points below are retained verbatim for historical reference but are NOT to be actioned. Calendar invite NOT sent. No outbound. This is a one-time user override of Master Plan v11.2 §6 Decision 3.

## 1. Insula Capital Group — what they actually do (2026)

**Primary sources (verified live):**
- Press release Jun 11, 2026: https://www.prweb.com/releases/insula-capital-group-introduces-portfolio-level-dscr-financing-for-scalable-rental-investors-in-2026-302796381.html
- Yahoo Finance / Investor Support Program: https://finance.yahoo.com/news/insula-capital-group-launches-investor-191500887.html
- Insula main site DSCR loans: https://insulacapitalgroup.com/loans/dscr-rental-loans/
- Insula news/blog: https://insulacapitalgroup.com/latest-news/
- Address: 627 Horseblock Rd, per Tier 4 Deep-Dive
- Phone: (833) 319-3517
- Email: info@insulacapitalgroup.com

**Key 2026 facts (per primary sources):**

1. **June 11, 2026: "Portfolio-level DSCR financing" launch.** Press release describes "consolidated underwriting, stronger cash-flow" for "scalable rental investors." This is Insula's flagship differentiator for 2026 — the exact gap a portfolio-DSCR analytics platform fills.
2. **Investor Support Program launched 2026.** Includes DSCR loans, fix-and-flip loans, "specializes in DSCR loans." This is their distribution channel / broker-facing program.
3. **DSCR rental loans core product.** Per Insula site, "streamlined and asset-focused lending solution."
4. **Fix-and-flip adjacent:** May 2026 fix-and-flip loan amount example $167,950 / $ARV. So they have STR (fix-and-flip) capability too.
5. **Recent content focus:** "Boosting Portfolio Efficiency in 2026", "DSCR Loans for Multifamily and Rental Portfolios in 2026", "DSCR Loans for Short-Term Renovation Projects."
6. **Niche positioning:** Per Tier 4 Deep-Dive, "12-18 month blue-ocean window" — Insula doesn't have portfolio-DSCR analytics yet, but it's a natural extension of their portfolio product.

**Strategic inference:** Insula is a DIRECT POTENTIAL CUSTOMER for our portfolio-DSCR analytics platform. Their June 11, 2026 portfolio-level DSCR launch is the exact product our engine analyzes. If we can demonstrate value in their pilot (e.g., 30% faster underwriting on their portfolio loans), we have a real anchor customer for Tier 4 v1.

## 2. The 12-question sales engineering checklist (refreshed)

Per Tier 4 Deep-Dive, this is the original 12-question list. Updated for Thread K context:

### Pre-call research (do before Jul 11)

1. **What does Insula's current underwriting workflow look like for portfolio-DSCR loans?** (manual? rules engine? LOS? what software?)
2. **What's their portfolio composition? (avg properties per investor, geographic mix, DSCR product mix)**
3. **Who is their typical investor? (individual vs. entity, sophistication level, repeat vs. one-time)**
4. **What's their current portfolio size and growth rate? (per their public Investor Support Program)**
5. **What pricing/turn-times do they offer? (versus competitors — Angel Oak, LoanStream, A&D)**
6. **What's their biggest pain point post-launch? (per their recent content focus on "portfolio efficiency")**

### Product-fit questions (ask on the call)

7. **What does "portfolio underwriting" mean to them operationally?** (one application per property? or one application covering the portfolio?)
8. **What data do they currently use to underwrite each property in the portfolio?** (rent rolls, market comps, expense ratios?)
9. **What does their post-funding portfolio monitoring look like?** (covenant compliance, DSCR tracking, exception management?)
10. **How do they currently handle cross-collateral and cross-default across the portfolio?**
11. **What's their current investor reporting cadence? (monthly statements, portfolio dashboards, tax doc generation?)**
12. **Who are their key software/data partners today? (Argyle, Cotality, Optimal Blue, ICE Mortgage Technology, Blend, etc.)**

## 3. Talking points — what to lead with

### Talking point 1: "We make your portfolio-DSCR underwriting 30-50% faster"

- **Their pain:** Per their recent content ("Boosting Portfolio Efficiency"), they need efficiency gains
- **Our value:** Portfolio-DSCR engine with cross-collateral, cross-default, and Brinson-Fachler fixed-income decomposition (per Thread B Tier 4 architecture) reduces per-property underwriting time
- **Evidence:** Per Thread E, our XGBoost + monotonic + SHAP architecture can do automated property-level decisioning in seconds, with adverse action reason codes auto-generated
- **Killer question:** "How many FTE-hours does it currently take to underwrite a 10-property portfolio? We believe we can cut that by 50%."

### Talking point 2: "We're already aligned with your portfolio-DSCR positioning"

- **Their positioning:** "Consolidated underwriting, stronger cash-flow" (per their June 11, 2026 press release)
- **Our value:** Our engine is purpose-built for portfolio-level DSCR analytics — not just per-loan DSCR
- **Validation:** Per Thread B Tier 4 architecture, we have Modified Dietz (MWR not TWR per CAIA), Brinson-Fachler for portfolio decomposition, EPFL Contagion Index for sponsor/MSA risk concentration
- **Differentiator:** Most DSCR lenders (Angel Oak, LoanStream) still treat each property as a separate loan. We're portfolio-native.

### Talking point 3: "We're MRM-ready under the new OCC 2026-13 framework"

- **Their context:** Per Thread E, OCC Bulletin 2026-13 (April 17, 2026) now applies to vendor models — Insula will get asked by their bank partners about our model documentation
- **Our value:** We ship SR 26-2 documentation as part of our delivery (per Thread E recommendation)
- **Bank-channel credibility:** Insula likely sells loan pools to banks; bank channel will require model documentation
- **Differentiator:** Most DSCR analytics vendors have no MRM story. We do.

### Talking point 4: "We can co-pilot with your top 3-5 investors"

- **Their context:** Their Investor Support Program is their distribution; if we can deliver value to their top investors, we get pulled into their workflow
- **Our value:** Tier 4 v1 designed for pilot broker + sponsor relationships (per Thread I)
- **Wedge:** Propose: "We run our POC on your top 3 portfolio investors for 90 days. If we don't cut their underwriting time by 30%, we walk away."

## 4. Competitive landscape — what to anticipate

### Direct competitors (existing)

- **Angel Oak Mortgage Solutions** — non-QM leader; has portfolio loan programs
- **LoanStream Wholesale** — #1 non-QM wholesale; less portfolio-focused
- **A&D Mortgage** — non-QM portfolio player
- **Acra Lending** — non-QM + portfolio

### Indirect competitors (analytics platforms, not lenders)

- **Argyle** — verification (VOI/VOE/VOA), not underwriting analytics
- **Pinwheel** — payroll-linked income verification
- **The Loan Store** — broker LOS, not portfolio analytics
- **Verum** (acquired by ICE Mortgage Technology) — non-QM underwriting
- **Beeline** — POS for non-QM
- **BloomCU** — credit union focused

### Our defensible moat

- **Portfolio-native:** Not per-loan with portfolio wrap; natively portfolio
- **XGBoost accumulation moat:** Proprietary deal-outcome data trains model uniquely tuned to DSCR (per Master Plan v11 §2)
- **OSS-first cost structure:** 94% cost savings vs vendor-first (per Master Plan v11 §4) — we can pass savings to customers
- **MRM-ready:** SR 26-2 documentation built in (per Thread E)
- **AGPL/clean licensing:** No SaaS source-disclosure liability (per Thread F)

## 5. What we DON'T have (honest gap list)

1. **No proprietary DSCR loan performance data** (per Thread E) — model accuracy ceiling is real
2. **No bank channel relationships** (per Master Plan v11 §3) — Insula's bank partners are unknown to us
3. **No Tier 4 v1 reference customers** — we're pitching on the strength of design, not track record
4. **No demo product** — only design specs + Thread B architecture + Thread E POC plan
5. **No live integration** with any LOS — LendingPad integration is design only (per Thread G)

**Implication:** Don't oversell on Jul 11. Lead with architecture + design + 90-day POC proposal. Get to "yes, do the POC" before any deep commitment.

## 6. Call agenda (60-minute target)

| Time | Topic | Owner |
|---|---|---|
| 0-5 min | Intro + Insula's recent portfolio-DSCR launch (per Jun 11, 2026 PR) | Both |
| 5-15 min | Walk through their current portfolio underwriting workflow | Insula |
| 15-25 min | Walk through our Tier 4 v1 design (Thread B + Thread E + Thread F) | Us |
| 25-35 min | Discussion: where's the 30-50% efficiency gain? | Both |
| 35-50 min | Propose 90-day pilot scope + commercial terms | Us |
| 50-55 min | Next steps: who's involved? timeline? decision-maker? | Both |
| 55-60 min | Q&A and wrap | Both |

## 7. Post-call deliverables (research-mode hand-off)

If call goes well, we need to produce:
- **Insula Tier 4 v1 POC spec** — customized to their portfolio data
- **3-month pilot commercial proposal** — pricing, scope, success metrics
- **MRM documentation template** — pre-built per Thread E
- **Tech integration plan** — LendingPad + their LOS + our engine

If call goes lukewarm:
- **Thank-you note** with concrete next step (e.g., 2-week follow-up)
- **Revisit in 6 months** when we have POC results

## 8. Open questions for user

1. Confirm Jul 11, 2026 call is on calendar (and who from our side is on the call)?
2. Approve 4 talking points as framed above (modify if needed)?
3. Approve the 90-day pilot proposal approach (or do we lead with a smaller scoping conversation)?
4. What commercial terms are we authorized to discuss (free POC? paid POC? equity pilot?)?
5. Do we have existing relationships at Insula via Tier 4 Deep-Dive intro, or is this a cold call?

## 9. Sources cited

**Insula primary:**
- Jun 11, 2026 press release — https://www.prweb.com/releases/insula-capital-group-introduces-portfolio-level-dscr-financing-for-scalable-rental-investors-in-2026-302796381.html
- Yahoo Finance / Investor Support Program — https://finance.yahoo.com/news/insula-capital-group-launches-investor-191500887.html
- Insula DSCR loans page — https://insulacapitalgroup.com/loans/dscr-rental-loans/
- Insula news/blog — https://insulacapitalgroup.com/latest-news/

**Competitive landscape:**
- Verusmc 2026 outlook — https://verusmc.com/looking-ahead-the-2026-outlook-for-non-qm-lending-and-securitization/
- A&D Mortgage non-QM scenarios — https://admortgage.com/blog/non-qm-scenarios-how-to-win/
- Angel Oak DSCR scaling — https://angeloakms.com/the-non-qm-advantage-scaling-your-business-with-dscr-short-term-rentals/
- National Mortgage Professional non-QM town hall — https://nationalmortgageprofessional.com/news/non-qm-town-hall-highlights-2026-growth-opportunities-originators-shift-strategy

**Related research:**
- Tier4_DeepDive_2026Q2.md (original 12-question checklist)
- Master Plan v11 §2, §3, §4, §6
- Thread B Tier 4 architecture (Modified Dietz, Brinson-Fachler, EPFL Contagion)
- Thread E AI/ML audit (XGBoost + SHAP, MRM per OCC 2026-13)
- Thread F AGPL exposure (clean licensing for Tier 4 v1)
- Thread I Pilot broker profile (sponsor/investor model fits)

---

**End of Thread K. Linked threads: Master Plan v11 §3 + §6 Insula decision; Tier4_DeepDive_2026Q2; Thread B (Tier 4 architecture); Thread E (MRM per OCC 2026-13); Thread F (AGPL clean licensing); Thread I (pilot economics for sponsor-side).**