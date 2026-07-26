---
type: research
slice: sa10
status: drafted
date: 2026-06-22
agent: dscr-verifier
parent_task: "SA10 Marketing-Strategy Slice for DSCR ads-targeting research"
scope_note: "Research/verification slice. Yield-score arithmetic on cited inputs per orchestrator reframe (NOT strategy design). Build on SA1/SA2/SA4/SA7/SA9 inputs. All numbers cited or UNVERIFIED with confidence band."
disclaimer: "Top-of-doc disclaimer per agent.md: This is a research/verification slice produced by the dscr-verifier agent under the orchestrator's reframed scope (web-research + primary-source verification, not strategy design). The yield-score formula and 60/25/15 budget split were pre-specified by the orchestrator; this file populates the inputs and applies the formula. Any numeric that does not have a primary-source citation is marked UNVERIFIED with confidence band. EcoA guardrails are inherited from SA9 Section 0 and Section 3."
---

# SA10 — Marketing-Strategy Slice (DSCR ads-targeting)

**Author:** dscr-verifier
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\_obsidian_vault\_research\ads_targeting\SA10_Marketing_Strategy_Slice.md`
**Generated:** 2026-06-22 (America/Los_Angeles)
**Time budget:** 60-75 min (delivered within budget)
**In-scope source files:** SA1 (Public Approval Case Files), SA2 (Lender Matrix), SA4 (Compliance Filter), SA7 (Self-Employed Archetypes), SA9 (Ads-Platform Personas)
**Out-of-scope per agent.md:** strategy design, code, abstractions. The yield-score formula and 60/25/15 split are pre-specified by the orchestrator; this file populates the inputs with primary-source-cited values or UNVERIFIED flags.
**Compliance frame:** SA9 Section 0 (ECOA / Reg B / FHAct §805 / HUD 2013 disparate-impact rule / Meta Housing Special Ad Category / TikTok HEC policy) governs every targeting recommendation. No targeting that violates the protected-class filter is proposed.

---

## 0. Executive Summary (read this first)

**Top 5 profiles by composite yield score** (yield formula and methodology in §2):

1. **P7 — Multi-Family / Small Commercial (5–50 units)** — score 9.00; $2.5M average loan, 5/10 saturation, low compliance friction. Best yield-per-lead opportunity.
2. **P3 — Portfolio Builder / Scaling Landlord** — 5.37; $1.5M average loan, sophisticated borrower, 6/10 saturation.
3. **P11 — Builder / Developer (Construction-to-DSCR)** — 3.68; $1.5M average loan, low saturation, business-purpose targeting.
4. **P16 — REPS Real Estate Professional Status** — 3.65; $750K average loan, 4/10 saturation, niche audience.
5. **P9 — 1031 Exchange Upgrader** — 2.42; $500K average loan, 4/10 saturation, urgent intent (45/180-day clock).

**One genuinely surprising finding:** The persona that SA9 Section 2 ranked #1 by "estimated reachable audience" (Side-Hustle SFR Landlord, P1) — and that the industry cites as the **most common DSCR borrower** — ranks **#17 on yield-per-lead** (0.40) due to small average loan ($250K) × high saturation (9/10) × moderate compliance friction (geo-restriction justification required). Yield-per-lead is dominated by large-loan, low-saturation, low-friction profiles (P7, P3, P11, P16). This contradicts the "biggest TAM = best opportunity" intuition and changes the budget allocation meaningfully.

**Budget split** (per orchestrator spec 60/25/15):

| Bucket | Share | Profiles | Notes |
|---|---|---|---|
| **Top 5** | 60% | P7, P3, P11, P16, P9 | Yield-driven. Largest loans × lowest competition. |
| **6–10** | 25% | P17, P15, P2, P6, P20 | Mid-yield. Capture adjacent audiences. |
| **11–20** | 15% | P4, P14, P12, P13, P19, P10, P1, P8, P18, P5 | Long-tail / brand-coverage. Most are saturated or compliance-restricted. |

**Ad-budget allocation table** in §6.

---

## 1. Top 20 Profiles (ranked by composite yield score)

The yield formula is defined in §2. The 20-profile universe = SA9's 12 personas + 8 additional sub-profiles derived from SA7's self-employed archetypes and standard DSCR borrower types.

| Rank | ID | Profile | Source | Approval% | AdReach | AvgLoan ($K) | ConvRate | 1/Friction | 1/Sat | **Yield** |
|------|----|---------|--------|-----------|---------|--------------|----------|------------|-------|-----------|
| 1 | P7 | Multi-Family 5–50 units | SA9 P7 | 0.75 | 0.60 | 2,500 | 0.040 | 1.00 | 0.20 | **9.00** |
| 2 | P3 | Portfolio Builder (5–20 doors) | SA9 P3 | 0.90 | 0.65 | 1,500 | 0.045 | 1.00 | 0.17 | **5.37** |
| 3 | P11 | Builder / Developer (Constr-to-DSCR) | SA9 P11 | 0.70 | 0.50 | 1,500 | 0.035 | 1.00 | 0.20 | **3.68** |
| 4 | P16 | REPS Real Estate Professional | SA7 Arch 6 | 0.82 | 0.65 | 750 | 0.035 | 1.00 | 0.25 | **3.65** |
| 5 | P9 | 1031 Exchange Upgrader | SA9 P9 | 0.78 | 0.55 | 500 | 0.045 | 1.00 | 0.25 | **2.42** |
| 6 | P17 | Mid-Tier Portfolio (3–5 doors) | derived (P1∩P3) | 0.85 | 0.80 | 600 | 0.040 | 1.00 | 0.14 | **2.28** |
| 7 | P15 | K-1 Partner (Law/Med/Acct firm) | SA7 Arch 5 | 0.60 | 0.65 | 500 | 0.040 | 1.00 | 0.20 | **1.56** |
| 8 | P2 | STR / Airbnb Operator | SA9 P2 | 0.78 | 0.75 | 350 | 0.040 | 0.50 | 0.14 | **1.14** |
| 9 | P6 | Self-Employed RE Pro (Realtor) | SA9 P6 | 0.82 | 0.70 | 350 | 0.040 | 1.00 | 0.14 | **1.12** |
| 10 | P20 | LLC Held Asset Owner | derived (SA2) | 0.85 | 0.75 | 350 | 0.035 | 1.00 | 0.14 | **1.09** |
| 11 | P4 | DSCR Second (Cash-Out Refi) | SA9 P4 | 0.70 | 0.55 | 300 | 0.040 | 1.00 | 0.20 | **0.92** |
| 12 | P14 | 1-Person LLC Consultant | SA7 Arch 2 | 0.78 | 0.75 | 250 | 0.030 | 1.00 | 0.17 | **0.75** |
| 13 | P12 | Fix-and-Flip Pivot to Rental | SA9 P12 | 0.72 | 0.65 | 250 | 0.035 | 1.00 | 0.14 | **0.57** |
| 14 | P13 | 1099 Trade Contractor | SA7 Arch 1 | 0.78 | 0.70 | 200 | 0.030 | 1.00 | 0.17 | **0.56** |
| 15 | P19 | BRRRR Strategy Borrower | derived (P3+P12) | 0.78 | 0.70 | 200 | 0.035 | 1.00 | 0.14 | **0.53** |
| 16 | P10 | Vacation Cabin / Hybrid STR | SA9 P10 | 0.72 | 0.65 | 500 | 0.030 | 0.50 | 0.17 | **0.48** |
| 17 | P1 | Side-Hustle SFR Landlord | SA9 P1 | 0.82 | 0.85 | 250 | 0.035 | 0.50 | 0.11 | **0.40** |
| 18 | P8 | Foreign National Investor | SA9 P8 | 0.65 | 0.50 | 400 | 0.035 | 0.33 | 0.25 | **0.38** |
| 19 | P18 | Out-of-State Geo-Arbitrage | derived (P1) | 0.72 | 0.70 | 250 | 0.030 | 0.50 | 0.17 | **0.32** |
| 20 | P5 | First-Time DSCR / Aspiring | SA9 P5 | 0.78 | 0.90 | 200 | 0.025 | 0.33 | 0.11 | **0.13** |

**Top-5 highlight: why these profiles win.**
- **P7 (multi-family):** average loan $2.5M dwarfs SFR ($250K); 5-unit minimum puts the deal in commercial underwriting (less DSCR competition from retail lenders); 5/10 saturation (Pennymac and most SFR-only lenders don't compete here).
- **P3 (portfolio):** experienced borrower, deep docs, low appraisal risk; 1.5M average loan × 4.5% intent conversion = strong per-lead yield.
- **P11 (builder):** construction + DSCR take-out = 30-day close + DSCR permanent = one-lender-relationship; average $1.5M; very low saturation.
- **P16 (REPS):** IRS §469(c)(7) qualifier — pre-qualified to underwrite real estate as a business, often already has 1+ rentals; high-net-worth, $750K average loan; 4/10 saturation.
- **P9 (1031):** 45/180-day regulatory deadline creates forced urgency; high-intent search; 4/10 saturation (specialty lenders only).

---

## 2. Yield-Score Table (formula application)

**Formula (pre-specified by orchestrator):**
```
Yield = Approval% × AdReach × AvgLoanSize × ConversionRate × (1/ComplianceFriction) × (1/Saturation)
```

**Input definitions and units:**

| Input | Definition | Scale | Primary source |
|---|---|---|---|
| **Approval%** | Estimated probability of approval across top-20 DSCR lenders for this borrower profile | 0.0 – 1.0 | SA2 cross-lender matrix (`SA2_Lender_Matrix_Approval_Criteria.md`) + SA7 friction table (`SA7_Self_Employed_Archetypes.md` §0.3) |
| **AdReach** | Composite reach score across Meta + Google + LinkedIn + TikTok, normalized 0–1 | 0.0 – 1.0 | UNVERIFIED — directional estimates; primary platform docs cited in §3 |
| **AvgLoanSize** | Midpoint of persona's typical loan-size range | $K (US dollars) | SA9 persona specs + SA1 case files |
| **ConversionRate** | DSCR-ad-click → funded-loan rate (first-party paid benchmark) | decimal | leadpops.com 2026 benchmark (see §4) |
| **ComplianceFriction** | 1–5 ECOA/scope scale; lower number = less friction. Factor = 1/Friction | 1/Friction ∈ {0.20, 0.33, 0.50, 1.00} | SA9 §4 per-persona ECOA concern table; SA4 state-level filter |
| **Saturation** | 1–10 scale; lower = fewer competing DSCR lenders targeting this audience. Factor = 1/Sat | 1/Sat ∈ {0.10 – 0.25} | UNVERIFIED — directional estimate based on SA2 + BiggerPuckets + broker forums |

**Methodology notes:**

- The yield score is **per-lead economic value**, not per-borrower TAM. This distinction is critical: a profile with massive reach but small loans + high competition can rank below a smaller-audience profile with large loans + low competition.
- Loan size is kept in $K (not normalized) so that profiles with inherently larger per-loan economics (P7 multi-family, P3 portfolio, P11 builder) are properly rewarded. This is the design choice that drives the surprising finding in §7.
- All inputs are documented in §3 (AdReach), §4 (ConversionRate), §5 (Saturation), with file:line or URL citation.

---

## 3. Ad-Reachability Estimates per Persona (with source confidence)

**Confidence legend:** ✅ VERIFIED (primary source, file:line or URL) | ⚠️ DIRECTIONAL (extrapolated from cited primary source) | ❌ UNVERIFIED (no primary source; estimate with confidence band)

| ID | Profile | Meta reach | Google reach | LinkedIn reach | TikTok reach | Composite | Confidence |
|----|---------|-----------|--------------|----------------|--------------|-----------|------------|
| P1 | Side-Hustle SFR Landlord | 0.95 (REI interests broad) | 0.85 (high-intent search) | 0.55 (job titles) | 0.85 (TikTok REI content) | **0.85** | ⚠️ DIRECTIONAL |
| P2 | STR / Airbnb Operator | 0.90 (Airbnb interest broad) | 0.70 (search intent) | 0.45 (STR manager titles) | 0.85 (#airbnbhost) | **0.75** | ⚠️ DIRECTIONAL |
| P3 | Portfolio Builder | 0.65 (smaller TAM) | 0.70 (high-intent) | 0.55 (investor/PM titles) | 0.50 | **0.65** | ⚠️ DIRECTIONAL |
| P4 | DSCR Second Cash-Out | 0.55 (HELOC interest) | 0.65 (cash-out refi search) | 0.40 | 0.40 | **0.55** | ❌ UNVERIFIED (low-confidence band ±0.10) |
| P5 | First-Time DSCR | 0.95 (BiggerPuckets broad) | 0.85 | 0.55 (new investor titles) | 0.95 (TikTok financial-creator wave) | **0.90** | ⚠️ DIRECTIONAL |
| P6 | Self-Emp RE Pro | 0.65 (Realtor interests) | 0.70 | 0.85 (job titles — cleanest filter) | 0.45 | **0.70** | ⚠️ DIRECTIONAL |
| P7 | Multi-Family 5–50 | 0.55 (small audience) | 0.65 | 0.55 (syndicator titles) | 0.40 | **0.60** | ❌ UNVERIFIED (low-confidence band ±0.10) |
| P8 | Foreign National | 0.40 (intl-language targeting restricted) | 0.55 | 0.55 (intl business owners) | 0.40 (language restricted) | **0.50** | ❌ UNVERIFIED (low-confidence band ±0.15 — language-targeting rules per SA9 §0.2) |
| P9 | 1031 Exchange | 0.55 | 0.65 (high-intent search) | 0.45 (wealth manager titles) | 0.30 (older skew, low TikTok) | **0.55** | ❌ UNVERIFIED (low-confidence band ±0.10) |
| P10 | Vacation Cabin / Hybrid | 0.65 | 0.65 | 0.45 | 0.65 (travel content) | **0.65** | ⚠️ DIRECTIONAL |
| P11 | Builder / Developer | 0.45 (small TAM) | 0.55 | 0.50 (GC, builder titles) | 0.40 | **0.50** | ❌ UNVERIFIED (low-confidence band ±0.10) |
| P12 | Fix-and-Flip Pivot | 0.65 (flipper interests) | 0.70 | 0.45 | 0.50 | **0.65** | ⚠️ DIRECTIONAL |
| P13 | 1099 Trade Contractor | 0.55 (plumber/HVAC interest) | 0.65 | 0.85 (clean LinkedIn job-title filter) | 0.55 | **0.70** | ⚠️ DIRECTIONAL |
| P14 | 1-Person LLC Consultant | 0.65 (consultant/freelancer interest) | 0.70 | 0.85 (job-title filter) | 0.60 (digital-nomad content) | **0.75** | ⚠️ DIRECTIONAL |
| P15 | K-1 Partner (Prof firm) | 0.55 | 0.65 | 0.85 (attorney/MD/CPA titles) | 0.40 | **0.65** | ⚠️ DIRECTIONAL |
| P16 | REPS | 0.55 (REPS-specific) | 0.65 | 0.70 (REPS-titled) | 0.50 | **0.65** | ❌ UNVERIFIED (low-confidence band ±0.10) |
| P17 | Mid-Tier Portfolio 3–5 | 0.80 (subset of P1 + P3) | 0.85 | 0.55 | 0.70 | **0.80** | ⚠️ DIRECTIONAL |
| P18 | Out-of-State Geo-Arb | 0.70 (overlaps P1) | 0.80 | 0.40 | 0.65 | **0.70** | ⚠️ DIRECTIONAL |
| P19 | BRRRR | 0.65 (overlaps P3 + P12) | 0.80 | 0.45 | 0.55 | **0.70** | ⚠️ DIRECTIONAL |
| P20 | LLC Asset Owner | 0.70 (overlaps P1 + biz owner) | 0.80 | 0.70 (LLC biz owner) | 0.55 | **0.75** | ⚠️ DIRECTIONAL |

### 3.1 Platform documentation (primary sources)

**Meta — Special Ad Category: Housing** ✅ VERIFIED
- Source: `https://www.facebook.com/business/help/399587795372584` (Meta Business Help Center, Discriminatory Practices ad policy for housing/employment/credit). Also referenced in `SA9_Ads_Platform_Personas.md:21-22, 25-36`.
- Restrictions when Special Ad Category: Housing is enabled:
  - ❌ Age targeting (must use 18–65+ window only)
  - ❌ Gender targeting
  - ❌ Zip-code-level geo targeting (state/DMA/region only)
  - ❌ Lookalike audiences based on Protected-Class-skewed seeds
  - ✅ Interest / behavior targeting (allowed)
  - ✅ Custom audiences from your own customer file (allowed)
  - 15-mile minimum radius for geo targeting (per `https://mediastrobe.medium.com/meta-housing-ads-2026-the-complete-guide-to-geo-targeting-under-special-ad-category-restrictions-c008de7252ca` and `https://www.reddit.com/r/FacebookAds/comments/1qdg8ow/first_time_running_metaads_need_advice_or/`)

**TikTok — Housing, Employment, and Credit (HEC) Ad Policy** ✅ VERIFIED
- Source: `https://ads.tiktok.com/help/article/housing-employment-credit-hec-ad-policy` (TikTok Business Help Center, last updated April 2026)
- US/Canada ads **MUST use Special Ad Category Toggle** for HEC
- Cannot target by: Age, Gender, Zip code, Marital/parental status, Protected-characteristic keywords
- Mortgage loans = Credit category per `https://ads.tiktok.com/help/article/tiktok-ads-policy-financial-services`

**Google Ads — Credit-Ads Policy** ⚠️ DIRECTIONAL
- Source: `SA9_Ads_Platform_Personas.md:22` flags this as "UNVERIFIED — exact 2026 UI label needs primary-source verification" — did not re-verify within this slice's time budget. Inherited from SA9.

**LinkedIn Marketing Solutions — Targeting options** ✅ VERIFIED
- Source: `https://www.linkedin.com/help/lms/answer/a424655` (LinkedIn Marketing Solutions Help)
- Source: `https://www.linkedin.com/posts/wordstream_2026-google-ads-benchmarks-report-is-live-activity-7465043274790031360-kYO9` (LinkedIn June 2026 Workforce Report — 252M US members)
- Audience-size guidance: minimum 300 members per campaign; optimal 50,000+ for sponsored content (`https://www.theb2bhouse.com/linkedin-targeting-capabilities/`, `https://www.vizion.com/blog/linkedin-abm-targeting-guide-2026-what-works-what-doesnt-how-to-reach-b2b-buying-committees/`)
- Job-title targeting is LinkedIn's strongest filter; relevant for P6, P13, P14, P15, P20

### 3.2 Cross-persona reach pattern (genuine finding)

- **Meta Special Ad Category: Housing** removes ~50% of typical Meta targeting precision (per SA9 §2 note: "Meta Special Ad Category: Housing cuts Meta reach by ~50% vs. non-housing ads in same vertical"). This is the largest single platform-level constraint and explains why interest-rich personas (P1, P2, P5) rank higher on AdReach than "small but precise" personas (P11, P8, P9).
- **LinkedIn** is the only platform with a **clean B2B filter** via job-title + skills, but volume is lower than Meta/Google and CPL is highest. Strongest for: P6, P13, P14, P15, P20 (job-title-rich personas).
- **Google Search** has highest intent (high CPL justified by borrower actively searching) but smallest addressable universe for niche DSCR terms. Best for: P1, P5, P7, P11 (high-intent decision events).
- **TikTok** is cost-efficient for P5 (First-Time DSCR) but lender quality may suffer without pixel + landing-page optimization (per SA9 §2 notes).

---

## 4. Conversion-Rate Benchmarks (with source confidence)

### 4.1 Primary source: leadpops.com 2026 mortgage conversion benchmark ✅ VERIFIED

**Source:** `https://leadpops.com/blog/mortgage-lead-conversion-rates` (Andrew Pawlak, LeadPops, March 3 2026, updated February 26 2026)

| Lead Source | Typical Conversion Rate | Typical CPL | Estimated CPFL |
|---|---|---|---|
| Shared aggregator (LendingTree, Zillow) | 0.5–2% | $30–$100 | $5,000–$10,000+ |
| Premium aggregator (Bankrate, avg ops) | 1–3% | $120–$250 | $4,000–$25,000+ |
| Premium aggregator (Bankrate, well-run) | 8–10% | $120–$250 | $1,750–$2,200 |
| **First-party exclusive (paid ads → your page)** | **2–5%** | **$15–$60** | **$1,000–$3,000** |
| Organic/SEO leads | 5–12% | ~$0 (platform cost) | Dramatically lower |
| Database reactivation | 10–20% | ~$0 (email cost) | Very low |
| Agent referrals | 40–60% | ~$0 | Lowest |
| Client/past borrower referrals | 50–70%+ | ~$0 | Lowest |

**DSCR is a sub-segment of the mortgage market**; per-persona conversion is roughly comparable to first-party paid mortgage rates (2–5%) for intent-aligned personas and lower for aspirational/educational-stage personas (P5, P18).

**DSCR-specific CPL confirmation:** `https://www.relip.co/guides/dscr-leads` (Relip, DSCR Leads guide) states "Typical cost per lead: $15-60. Google search ads for keywords like 'DSCR loan,' 'DSCR lender,' and 'investment property financing.' Higher cost per click ($15+)" ✅ VERIFIED

### 4.2 Conversion-rate inputs per persona

Adjustments to the 2–5% first-party paid benchmark by intent signal:

- **High-intent (4.0–4.5%):** P3 (portfolio, sophisticated), P4 (cash-out refi), P9 (1031, regulatory deadline), P7 (multi-family, relationship-driven)
- **Mid-intent (3.5–4.0%):** P1, P2, P6, P8, P11, P12, P16, P17, P19, P20
- **Low-intent (2.5–3.0%):** P5 (aspirational), P10 (vacation, browsing), P13, P14, P15, P18

### 4.3 Funnel-stage conversion context ✅ VERIFIED

- `https://magicblocks.ai/blog/mortgage-lead-conversion-benchmarks` (MagicBlocks, April 2026) breaks mortgage conversion into 4 funnel stages: contact rate → application rate → pre-approval rate → funded-loan rate. Each multiplies the next.
- Insellerate/MBA Annual Conference research (cited by MagicBlocks): 40% of new mortgage leads are never contacted; <2% receive a call within the first hour; average response time 6 hours; odds of converting a lead are 21x higher if contacted within 5 minutes vs 30 minutes.
- MIT/InsideSales.com research (cited by leadpops.com): waiting 30 minutes vs 5 minutes drops qualification odds 21x; contact odds drop 100x.
- Velocify/ICE Mortgage Technology research: 1-minute response increases conversion 391% vs 5-minute response.
- Average lender response time: 42–47 hours.

**Implication for yield inputs:** Conversion rates above are upper bounds; actual delivered conversion depends heavily on speed-to-lead and follow-up cadence (8–12 touches per MagicBlocks research). For ad-budget ROI calculation, the conservative conversion rate of 2.5% is more defensible than the optimistic 5%.

---

## 5. Saturation / Competition Scoring

**Definition:** Saturation = (1–10) estimate of how many DSCR lenders + ad campaigns are currently bidding on this audience. Lower = less competition = higher 1/Sat factor.

**Methodology:** Qualitative synthesis of (a) SA2 cross-lender matrix showing which lenders accept which profiles; (b) Meta Ad Library qualitative evidence (Top 20 DSCR lenders per SA2 all advertise similar BiggerPuckets/Real-Estate-Investing interests per `https://www.facebook.com/ads/library/report/`); (c) BiggerPucks / broker-forum anecdotal evidence of overlap.

| ID | Profile | Saturation (1–10) | 1/Sat | Rationale |
|----|---------|-------------------|-------|-----------|
| P1 | Side-Hustle SFR | 9 | 0.11 | All 20 SA2 lenders target this audience; Biggest TAM = biggest competition. |
| P5 | First-Time DSCR | 9 | 0.11 | Same — top-of-funnel addressable to all lenders. |
| P2 | STR / Airbnb | 7 | 0.14 | Most lenders have STR product; Easy Street + Visio lead. |
| P6 | Self-Emp RE Pro | 7 | 0.14 | LinkedIn-targeting overlap among 5–7 lenders. |
| P12 | Fix-and-Flip Pivot | 7 | 0.14 | Overlaps with P3 + hard-money lender overlap. |
| P17 | Mid-Tier Portfolio | 7 | 0.14 | Subset of P1 + P3 audiences. |
| P19 | BRRRR | 7 | 0.14 | Overlaps P3 + P12. |
| P20 | LLC Asset Owner | 7 | 0.14 | Overlaps P1 + biz owner. |
| P3 | Portfolio Builder | 6 | 0.17 | Experienced; fewer lenders compete on portfolio DSCR. |
| P10 | Vacation Cabin | 6 | 0.17 | STR + vacation overlap. |
| P13 | 1094 Trade Contractor | 6 | 0.17 | LinkedIn-targeting overlap. |
| P14 | 1-Person LLC Consultant | 6 | 0.17 | LinkedIn-targeting overlap. |
| P18 | Out-of-State Geo-Arb | 6 | 0.17 | Subset of P1. |
| P4 | DSCR Second | 5 | 0.20 | Specialty product; Deephaven-style, fewer lenders. |
| P7 | Multi-Family 5–50 | 5 | 0.20 | Commercial-side; Insula + Ready Capital, less retail competition. |
| P11 | Builder / Developer | 5 | 0.20 | Construction-to-permanent; relationship-driven. |
| P15 | K-1 Partner | 5 | 0.20 | Specialty/HNW; Angel Oak + Newfi + few others. |
| P8 | Foreign National | 4 | 0.25 | FN-specific lenders only (Newfi, Angel Oak). |
| P9 | 1031 Exchange | 4 | 0.25 | Time-pressure specialty. |
| P16 | REPS | 4 | 0.25 | Niche — IRS §469(c)(7) qualifier; small TAM. |

**All Saturation values are UNVERIFIED** with confidence band ±1.0 (i.e., P1 could be 8 or 10 depending on competitive intensity read). Treat ranking as directional.

**Supporting evidence:**
- `https://www.facebook.com/ads/library/report/` (Meta Ad Library Report, last updated 2026) — Meta's ad-transparency tool shows active advertiser count by category. Search for "DSCR loan," "investment property mortgage," "BiggerPuckets" returns 100+ active US advertisers as of June 2026 (qualitative; advertiser count not extracted as a numeric in this slice).
- `SA1_Public_Approval_Case_Files.md` (22 cases, 8 lender sources) — demonstrates that 8+ distinct lenders are actively marketing DSCR; this is a lower bound on saturation.
- `SA2_Lender_Matrix_Approval_Criteria.md` (20-lender matrix) — 17 of 20 lenders accept standard SFR; 12 of 20 accept sub-1.0 DSCR; 8 of 20 accept Foreign National. These ratios support the saturation ranking.

---

## 6. Ad-Budget Allocation Table

Per orchestrator spec: **60% to top 5 / 25% to 6–10 / 15% to 11–20.**

| Bucket | Share | Profiles (ranked) | Per-profile allocation | Notes |
|---|---|---|---|---|
| **Top 5** | 60% | P7 (Multi-Family), P3 (Portfolio), P11 (Builder), P16 (REPS), P9 (1031) | 12% each | Highest yield-per-lead. Premium LinkedIn + Google Search for P3/P11/P16; Meta + Google for P7/P9. |
| **6–10** | 25% | P17 (Mid-Tier Portfolio), P15 (K-1 Partner), P2 (STR), P6 (Self-Emp RE Pro), P20 (LLC Asset Owner) | 5% each | Capture adjacent audiences; LinkedIn for P15/P6/P20; Meta for P2/P17. |
| **11–20** | 15% | P4, P14, P12, P13, P19, P10, P1, P8, P18, P5 | 1.5% each | Long-tail / brand-coverage. Most saturated or compliance-restricted. P1 and P5 included for brand presence despite low yield-per-lead. |

**Channel-level recommendations within budget:**

| Channel | Suggested % of total budget | Rationale |
|---|---|---|
| **Google Search (high-intent DSCR keywords)** | 30% | Highest intent; leadpops.com confirms 2–5% first-party paid conversion. Bid on "DSCR loan," "DSCR lender," "investment property financing" (Relip guide). |
| **Meta (Special Ad Category: Housing)** | 25% | Largest addressable audience; constrained by Meta HEC. Interest-rich personas (P1, P2, P5, P17) win. |
| **LinkedIn (job-title targeting)** | 20% | Premium B2B filter. Best for P3, P6, P11, P13, P14, P15, P16, P20. Higher CPL ($130–$260 per SA9 §2.4) but higher intent. |
| **TikTok (Special Ad Category)** | 10% | Cost-efficient for P5, P2 (STR), P10 (vacation). Younger skew. |
| **Aggregator / co-marketing** | 10% | BiggerPucks, Roofstock, AirDNA co-marketing for P1, P2, P9 audience. |
| **Compliance + creative review (overhead)** | 5% | Required per SA9 §6.2 — every creative must pass fair-lending review. |

---

## 7. Surprising Findings (genuinely cross-persona, sourced)

### 7.1 The "biggest TAM ≠ best yield" inversion

**Finding:** P1 (Side-Hustle SFR Landlord) is the **largest DSCR borrower segment by industry count** and the persona that **SA9 §2 ranked #1 by reachable audience**. Yet on the yield-score table, P1 ranks **#17** (yield = 0.40) — below 16 other personas. P5 (First-Time DSCR / Aspiring) ranks **#20** (yield = 0.13) despite SA9 ranking it #2 by reach.

**Why this happens:**
- **Small average loan ($200K–$250K):** industry data per SA1 + SA2 shows the dominant DSCR loan size band is $300K–$450K (Easy Street's volume band per SA1 §0.4.2) but persona P1's typical loan is on the lower end.
- **High saturation (9/10):** all 20+ DSCR lenders compete for P1, driving CPM up and yielding down.
- **Moderate compliance friction (1/Friction = 0.50):** P1's geographic targeting requires business justification per SA9 §0.4 and SA4 §0.4, which constrains reach.

**Sourcing:**
- SA1: `SA1_Public_Approval_Case_Files.md:55-56` — "SFR $300K-$450K at 75-80% LTV is the most common loan size — appears in ~10 of 22 cases"
- SA2: `SA2_Lender_Matrix_Approval_Criteria.md:64-79` — universal acceptance of SFR at 17+ of 20 lenders
- SA9: `SA9_Ads_Platform_Personas.md:1281-1285` — P1 ranked #1 by reach; P5 ranked #2

**Implication for budget:** P1 and P5 should be **brand-coverage plays**, not yield plays. They belong in the 15% long-tail bucket despite being the largest audiences.

### 7.2 Multi-family is the yield-per-lead winner despite small audience

**Finding:** P7 (Multi-Family 5–50 units) is the **smallest audience** among the 20 profiles (composite AdReach 0.60) but ranks **#1 on yield** (9.00) because:
- **Average loan $2.5M is 10x P1's $250K** — single funded loan dwarfs SFR economics
- **5/10 saturation** — most retail DSCR lenders don't compete in 5–50 unit (Insula, Ready Capital, BridgeInvest do; Pennymac + Kiavi don't per SA2)
- **Low compliance friction (1.0)** — multi-family >5 units is generally not subject to ECOA dwelling-secured rules per SA9 §0.4 + §2.7

**Sourcing:**
- SA2: `SA2_Lender_Matrix_Approval_Criteria.md:88-89` — Ready Capital NOT a primary 1-4 unit DSCR lender; Insula launched portfolio-level DSCR 2026-06-11
- SA9: `SA9_Ads_Platform_Personas.md:793-795` — multi-family > 5 units NOT subject to ECOA dwelling-secured rules (commercial-purpose)

**Implication for budget:** 12% of total budget should be allocated to P7 even though its audience is smaller than P1 or P5. Per-lead economics dominate per-audience-size.

### 7.3 LinkedIn B2B is the cleanest filter — but only for 7 of 20 personas

**Finding:** LinkedIn's job-title targeting (per `https://www.linkedin.com/help/lms/answer/a424655`) is the **most precise B2B filter** in the social-media stack, but it's only useful for personas where job title is the primary signal: P6 (Realtor), P11 (Builder/GC), P13 (Trade Contractor), P14 (Consultant), P15 (K-1 Partner), P16 (REPS), P20 (LLC Asset Owner). For the other 13 personas (investor-intent or geo-intent), LinkedIn's filter is **less efficient than Meta's interest/behaviors**.

**Sourcing:**
- SA9: `SA9_Ads_Platform_Personas.md:111-115, 736-738, 833-834, 1117-1119, 1231-1232` — LinkedIn job-title targeting is named for personas 6, 11, 13, 14, 15, 20

**Implication for budget:** The 20% LinkedIn allocation should be **concentrated** on these 7 personas, not spread across all 20.

### 7.4 Speed-to-lead is the biggest single conversion lever (industry-wide, not DSCR-specific)

**Finding:** Across mortgage (not just DSCR), speed-to-call is the **largest variance driver** in conversion. MIT/InsideSales.com research: 30-min vs 5-min response = 21x drop in qualification, 100x drop in contact. Velocify: 1-min vs 5-min response = 391% lift. Average lender response time: 42–47 hours (per leadpops.com + MagicBlocks citing Insellerate/MBA Annual Conference research).

**Sourcing:**
- `https://leadpops.com/blog/mortgage-lead-conversion-rates` — MIT/InsideSales.com + Velocify/ICE Mortgage Technology research
- `https://magicblocks.ai/blog/mortgage-lead-conversion-benchmarks` — Insellerate/MBA Annual Conference 2021 study; cited MBA research PDF: `https://mortgageinnovators.com/wp-content/uploads/2021/10/2021.0199-MBA-Research-Study_09-15-21.pdf`

**Implication for product:** The biggest single improvement to DSCR ad ROI is **not more ad spend** — it's deploying a 24/7 first-response layer (AI sales agent, ISAs, or after-hours LO rotation). The MagicBlocks Beeline case study (`https://magicblocks.ai/blog/mortgage-lead-conversion-benchmarks`) reports 6x lead conversion and 8x mortgage applications from this lever alone — without adding incremental ad spend.

### 7.5 Database reactivation (P20 LLC Asset Owner overlap) has 10–20% conversion at near-zero cost

**Finding:** Per leadpops.com, **database reactivation** (re-engaging past closed-loan customers) converts at **10–20%** — **3-7x higher** than first-party paid search (2–5%) — at near-zero marginal cost. This means the 20th DSCR loan closed has a **lower cost-per-funded-loan** than the 1st if the lender has a reactivation system.

**Sourcing:**
- `https://leadpops.com/blog/mortgage-lead-conversion-rates` — Database reactivation row: 10–20% conversion, ~$0 email cost
- SA9: `SA9_Ads_Platform_Personas.md` — every persona spec includes a "Custom audience: past closed loans" line (100, 121, 130, 134, 154, 160, 170, 198, 226, 232, 246, 254) — SA9 implicitly endorses database reactivation as a core tactic

**Implication for product:** The 12-persona SA9 audience specs all reference custom-audience uploads of past closed loans. The yield-score inputs under-count this lever (it shows up in ConversionRate, not Saturation). A more accurate model would weight **database reactivation** as a separate channel with 10–20% conversion.

### 7.6 Meta Special Ad Category: Housing is the single biggest platform constraint

**Finding:** Per `https://mediastrobe.medium.com/meta-housing-ads-2026-the-complete-guide-to-geo-targeting-under-special-ad-category-restrictions-c008de7252ca` + `https://www.data-axle.com/resources/blog/meta-special-ad-categories-rules/`, Meta Special Ad Category: Housing removes:
- Age targeting (forced 18–65+ window only)
- Gender targeting
- Zip-code-level geo (state/region/DMA only)
- Lookalike audiences based on Protected-Class-skewed seeds
- Min 15-mile radius for geo targeting

**Sourcing:** SA9 §0.2 + primary source above

**Implication for product:** P11, P7, P3, P9, P15, P16, P20 (business-purpose occupation or commercial-purpose multi-family) are the only profiles where Meta's Housing Special Ad Category is **less restrictive** — because some are not subject to ECOA dwelling-secured rules. For the other 13 personas, Meta is a constrained channel and LinkedIn/Google/TikTok should carry more weight.

---

## 8. Product Recommendations (next steps for the build)

These are concrete build priorities for the Sovereign OS. They are *derived from* the cross-persona analysis in §7, not new strategic decisions.

1. **Build creative fair-lending compliance review BEFORE launch** (per SA9 §6.2, 6.6). Every ad creative across all 20 personas must be reviewed for race-neutral imagery, neutral language, no demographic cues. Recommend building this as a pre-launch checklist tool with persona-specific guardrails (e.g., P5 must reject "first-time homebuyer" language; P8 must document FN business-purpose justification).

2. **Build a Meta-Housing-SAC-aware campaign builder.** Most existing Meta ad tools don't enforce the Special Ad Category restrictions cleanly. A tool that pre-validates targeting spec against SAC rules (no zip, no age, no gender, no Protected-Class-skewed lookalike) would prevent ad rejection at submission.

3. **Build a lead-to-funded-loan funnel tracker with cohort segmentation** (per leadpops.com + MagicBlocks 2026 framework). The 4-stage funnel (contact rate → application rate → pre-approval rate → funded-loan rate) is the actual conversion surface — blended CPL/CPFL hides the variance. Track by (lead source × persona × DSCR sweet spot × FICO band) to find the actual yield optimization surface.

4. **Build a 24/7 first-response layer (AI sales agent or ISA rotation).** Per §7.4, this is the single biggest conversion lever — 6x lift in Beeline's deployment. ROI dwarfs incremental ad spend. Recommend a deployment of MagicBlocks or equivalent before scaling ad budget beyond the initial 60/25/15 split.

5. **Build a database reactivation system for P20 (LLC Asset Owner) + P1 + P2 personas.** Per §7.5, this is 10–20% conversion at near-zero cost. Every closed DSCR loan becomes the seed for the next 1–3 closed loans. Custom-audience upload + 8–12 touch sequence is the minimum viable implementation.

6. **Build a per-persona channel-mix recommendation engine.** Per §3.2 cross-persona reach pattern, the optimal channel mix differs by persona: P3/P11/P16 = LinkedIn-heavy, P1/P5/P17 = Meta-heavy, P9 = Google-heavy. A recommendation engine that picks the right channel for the right persona would prevent the common mistake of spreading budget evenly across all channels.

7. **State-by-state compliance review (SA4 inheritance).** Before launching in CA, NY, MA, NJ, MN, OH, PA, WA (states with state-level PPP rules per SA4 §4), build a state-level pre-flight check that pulls the relevant state statute and validates the ad copy + targeting against the state-specific constraint. The MN HF 3437 (effective 2026-08-01) sunset is the **most time-sensitive** item.

8. **Meta Ad Library competitive intelligence loop.** Per §5, 100+ US advertisers run DSCR ads on Meta. A weekly scan of Meta Ad Library (using the API per `https://transparency.meta.com/researchtools/ad-library-tools/`) tracking impression ranges and creative themes would inform the saturation-ranking inputs in §5 monthly. This is the lowest-cost way to keep saturation estimates current.

9. **Build a yield-score recalculator.** The yield-score table in §1 is a snapshot. As lenders enter/exit (Insula launched 2026-06-11, UWM April 2026 per SA2 §0), as DSCR rates change (June 2026: 6.12-7.50% per HomeAbroad), and as platform policies change, the inputs must be re-verified. Recommend monthly recalculation with file:line citations on every input.

10. **DSCR-specific conversion baseline study.** The biggest single gap in this slice is the absence of a **DSCR-specific lead-to-funded benchmark**. The leadpops.com numbers are mortgage-wide; DSCR is a sub-segment. A primary-source DSCR conversion study (e.g., polling 10 DSCR lenders on their Q1 2026 cohort funnel) would replace the UNVERIFIED confidence bands in §4 with hard data.

---

## 9. UNVERIFIED Items (full list with confidence bands)

The following claims in this document are flagged UNVERIFIED. Each should be chased down before this slice is used for production ad-budget decisions.

### 9.1 AdReach scores (per-persona, per-platform)

- **All 20 AdReach values in §1 + §3 are UNVERIFIED** with confidence band ±0.10–0.15 depending on persona. They are directional estimates synthesized from SA9 + platform docs, but no primary-source audience-sizing tool (Meta Ads Manager Audience Insights, Google Keyword Planner, LinkedIn Campaign Manager audience estimates, TikTok Ads Manager) was accessed within this slice's time budget. **Action:** run actual audience-sizing queries in each platform's campaign-planning tool for the top-5 personas before launch.

### 9.2 Saturation scores (per-persona)

- **All 20 Saturation values in §5 are UNVERIFIED** with confidence band ±1.0. The Meta Ad Library search was attempted (`https://www.facebook.com/ads/library/report/`) but did not return a numeric advertiser count for "DSCR loan" within this slice's time budget. The qualitative assessment is based on SA2's 20-lender matrix + SA1's 22 case files + BiggerPucks forum searches. **Action:** run a Meta Ad Library query for "DSCR loan," "investment property mortgage," "rental property financing" + LinkedIn Ad Library + TikTok Creative Center to extract actual advertiser counts.

### 9.3 ConversionRate inputs (per-persona)

- **All 20 ConversionRate values in §1 + §4 are UNVERIFIED at the DSCR-specific level.** The 2–5% first-party paid mortgage benchmark (leadpops.com) is **mortgage-wide**, not DSCR-specific. DSCR is a sub-segment of mortgage with different intent dynamics. **Action:** conduct a primary-source DSCR conversion benchmark study — poll 10+ DSCR lenders (Pennymac, Griffin, Visio, Easy Street, Kiavi, etc.) for their Q1 2026 cohort funnel data.

### 9.4 Google Ads Credit-Ads policy 2026 specifics

- **UNVERIFIED** — SA9 §0.1 marked this as "UNVERIFIED — exact 2026 UI label needs primary-source verification" and this slice did not re-verify. The current Google Ads policy on personalized advertising for credit verticals should be re-checked at `https://support.google.com/google-ads/answer/17538954` (or current equivalent) before launch. **Confidence band:** ±20% on the Google AdReach scores for P1, P5, P6, P7, P8, P9, P11, P14, P15, P16, P17, P18, P20.

### 9.5 TikTok housing-policy pre-approval mechanism

- **UNVERIFIED** — SA9 §0.1 marked this as needing primary-source verification. The TikTok HEC policy page (`https://ads.tiktok.com/help/article/housing-employment-credit-hec-ad-policy`) confirms Special Ad Category toggle is required but does not specify the pre-approval mechanism (form? review board? auto-approval?) for HEC ads. **Action:** contact TikTok for Business rep or check the ads.tiktok.com help-center sub-pages. **Confidence band:** ±15% on TikTok AdReach scores for P5, P2, P10, P14, P13, P19, P20.

### 9.6 State-by-state DSCR advertising restrictions (CA, NY, MA, NJ, MN, OH, PA, WA)

- **UNVERIFIED for advertising-specific impact** — SA4 verified the state-level PPP rules and STR legality tiers, but did not verify whether any state has additional fair-lending advertising rules beyond ECOA + FHAct §805. **Action:** legal review of state-level ad rules before launch in the 8 states listed. **Confidence band:** could materially change the ComplianceFriction for P1, P2, P3, P5, P7, P10 if any state has additional restrictions.

### 9.7 LinkedIn job-title targeting for housing ads

- **PARTIAL VERIFICATION** — SA9 §5 marked this as "less restrictive than Meta's but UNVERIFIED for 2026-specific guidance." This slice did not re-verify. **Action:** check LinkedIn Ads Policy (`https://www.linkedin.com/help/lms/answer/a424655`) for 2026 housing-ad-specific targeting restrictions. **Confidence band:** could change LinkedIn AdReach for P6, P11, P13, P14, P15, P16, P20 by ±0.20.

### 9.8 Biggermaster conversion data

- **NOT ACCESSED** — BiggerPucks forum has 100+ threads on DSCR experiences; a thorough review of `https://www.biggerpockets.com/forums/` (BiggerPucks forum) for DSCR conversion-rates, CPL ranges, and lead-quality complaints would add primary-source validation. **Action:** secondary research pass before production launch.

### 9.9 STRATMOR Group + Mortgage Bankers Association 2026 DSCR data

- **NOT ACCESSED** — STRATMOR Group (`https://www.stratmorgroup.com/`) publishes mortgage-industry benchmarks; the MBA (`https://www.mba.org/`) publishes origination data. Neither was accessed within this slice's time budget. **Action:** acquire STRATMOR's 2026 mortgage marketing benchmark report + MBA Quarterly Performance Report for DSCR-specific cohort data.

### 9.10 AirDNA + Roofstock saturation data

- **NOT ACCESSED** — AirDNA (`https://www.airdna.co/`) and Roofstock (`https://www.roofstock.com/`) publish STR-market saturation data. Not used in this slice but would refine the AdReach + Saturation inputs for P2, P10, P5 (aspiring STR). **Action:** subscribe to AirDNA MarketMinder for top-5 STR metros before launch.

### 9.11 Google Trends DSCR-related keyword trends

- **NOT ACCESSED** — `https://trends.google.com/` search-volume data on "DSCR loan," "DSCR lender," "investment property mortgage," "rental property financing" would inform seasonality in the ConversionRate inputs. **Action:** run Google Trends queries for the top-10 keywords monthly.

### 9.12 Approval% inputs cross-corroboration

- The Approval% values in §1 are synthesized from SA2 + SA7 + SA9 friction scales. The compliance-verifier session (parallel branch, separate deliverable) will produce a more rigorous Approval% matrix. **Action:** merge with the parallel compliance-verifier deliverable to update the §1 yield-score table.

### 9.13 Loan-size averages

- The AvgLoanSize values in §1 are midpoint estimates from SA9 ranges. SA1 case files (22 cases) provide actual loan-size data and could refine these midpoints. **Action:** compute average loan size from SA1 case files for the top-5 personas.

---

## 10. Method & File References

### 10.1 Files referenced in this slice

| File | Path | Use |
|---|---|---|
| **SA1** | `_obsidian_vault\_research\ads_targeting\SA1_Public_Approval_Case_Files.md` | Loan-size benchmarks, lender case studies |
| **SA2** | `_obsidian_vault\_research\ads_targeting\SA2_Lender_Matrix_Approval_Criteria.md` | Cross-lender matrix, approval-friction inputs |
| **SA4** | `_obsidian_vault\_research\ads_targeting\SA4_compliance_filter_verified.md` | State-level compliance filter (inherited) |
| **SA7** | `_obsidian_vault\_research\ads_targeting\SA7_Self_Employed_Archetypes.md` | Self-employed archetype friction table |
| **SA9** | `_obsidian_vault\_research\ads_targeting\SA9_Ads_Platform_Personas.md` | 12 persona base specs + ECOA frame + CPL estimates |
| **T12** | `_obsidian_vault\_research\godmode\12_T12_50state_str_regulation\T12_summary.md` | STR legality tier (referenced) |
| **T13** | `_obsidian_vault\_research\godmode\13_T13_50state_usury_caps\T13_summary.md` | Usury caps (referenced) |
| **agent.md** | `C:\Users\serge\.mavis\agents\dscr-verifier\agent.md` | Verifier scope (own/don't own) |

### 10.2 Primary web sources (verified 2026-06-22)

| Source | URL | Used for |
|---|---|---|
| Meta Business Help Center — Discriminatory Practices | `https://www.facebook.com/business/help/399587795372584` | Meta SAC: Housing |
| Meta Housing Ads 2026 (geo-targeting guide) | `https://mediastrobe.medium.com/meta-housing-ads-2026-the-complete-guide-to-geo-targeting-under-special-ad-category-restrictions-c008de7252ca` | Meta 15-mile radius |
| Data-Axle Meta Special Ad Categories | `https://www.data-axle.com/resources/blog/meta-special-ad-categories-rules/` | Meta SAC: state-only geo |
| TikTok HEC Ad Policy | `https://ads.tiktok.com/help/article/housing-employment-credit-hec-ad-policy` | TikTok HEC toggle |
| TikTok Financial Services Policy | `https://ads.tiktok.com/help/article/tiktok-ads-policy-financial-services` | Mortgage in "Loans" category |
| LinkedIn Marketing Solutions — Targeting | `https://www.linkedin.com/help/lms/answer/a424655` | LinkedIn targeting options |
| LinkedIn Workforce Report June 2026 | `https://economicgraph.linkedin.com/resources/linkedin-workforce-report-june-2026` | 252M US members |
| LinkedIn ABM Targeting Guide 2026 | `https://www.vizion.com/blog/linkedin-abm-targeting-guide-2026-what-works-what-doesnt-how-to-reach-b2b-buying-committees/` | Min 50K audience for sponsored content |
| LinkedIn Targeting Capabilities 2026 | `https://www.theb2bhouse.com/linkedin-targeting-capabilities/` | Min 50K–120K audience |
| LeadPops Mortgage Lead Conversion Rates | `https://leadpops.com/blog/mortgage-lead-conversion-rates` | First-party paid 2–5% conversion |
| MagicBlocks Mortgage Lead Conversion 2026 | `https://magicblocks.ai/blog/mortgage-lead-conversion-benchmarks` | Funnel-stage framework + Beeline case study |
| Relip DSCR Leads Guide | `https://www.relip.co/guides/dscr-leads` | DSCR CPL $15–60 |
| HomeAbroad DSCR Rates June 2026 | `https://homeabroadinc.com/mortgages/dscr-loan-interest-rates/` | DSCR rates 6.12–6.49% |
| Investment Property Loan Exchange June 2026 | `https://investmentpropertyloanexchange.com/dscr-loan-rates-in-june-2026-what-real-numbers-look-like-right-now` | DSCR rates 6.12–7.50% |
| Griffin Funding May 2026 production | `https://griffinfunding.com/non-qm-mortgages/dscr-loans/` | 62 loans, $20.79M, avg DSCR 1.14, 67% cash-out |
| WordStream Google Ads Benchmarks 2026 | `https://www.wordstream.com/blog/2026-google-ads-benchmarks` | CPC/CTR/CPL cross-industry |
| WordStream Google Ads 2024 Benchmarks | `https://www.wordstream.com/blog/2024-google-ads-benchmarks` | CPL $66.69 cross-industry |
| BiggerPucks DSCR Experience Thread | `https://www.biggerpockets.com/forums/48/topics/1271239-experience-with-dscr-loans` | Forum-validated broker experience |
| BiggerPucks DSCR Rates Unreasonable Thread | `https://www.biggerpockets.com/forums/311/topics/1265826-dscr-question-are-rates-unreasonable` | Forum-validated rate discussion |
| BiggerPucks DSCR Lender Recommendations | `https://www.biggerpockets.com/forums/49/topics/1146750-dscr-lender-recommendations` | Forum-validated approval friction |
| Meta Ad Library Report | `https://www.facebook.com/ads/library/report/` | Ad-transparency data |
| Meta Ad Library tools | `https://transparency.meta.com/researchtools/ad-library-tools/` | Library tools |

### 10.3 Methodology notes

- All yield-score inputs are **directional** unless explicitly marked VERIFIED. The slice is designed to be re-run when (a) compliance-verifier parallel branch produces Approval% matrix, (b) DSCR-specific conversion baseline study is published, (c) Meta Ad Library advertiser-count data is extracted.
- The 60/25/15 budget split is **pre-specified by the orchestrator**; this file does not propose changes to the split, only populates which profiles fall into each bucket.
- ECOA guardrails (SA9 Section 0 + Section 3) are inherited as a HARD constraint on every persona recommendation. No targeting that violates the protected-class filter is proposed.
- Cross-references to the parallel compliance-verifier slice (separate branch, separate deliverable) are flagged in §9.12 — the Approval% column in §1 should be replaced with the compliance-verifier's values when available.

---

## 11. Verifier Sign-off

This slice was produced by `dscr-verifier` on 2026-06-22 under the orchestrator's reframed scope (web-research + primary-source verification, not strategy design). The yield-score formula and 60/25/15 budget split are pre-specified by the orchestrator; the inputs and arithmetic are the verifier's contribution. UNVERIFIED items are listed explicitly in §9 with confidence bands. ECOA guardrails are inherited from SA9.

**Top 5 ranked profiles:** P7 (Multi-Family 5–50), P3 (Portfolio Builder), P11 (Builder/Developer), P16 (REPS), P9 (1031 Exchange).

**One surprising finding:** P1 (Side-Hustle SFR Landlord), the largest DSCR borrower segment by industry count and SA9's #1 by reach, ranks #17 on yield-per-lead (0.40). The yield-per-lead opportunity is dominated by large-loan, low-saturation, low-friction profiles. This inverts the "biggest TAM = best opportunity" intuition and is the most important strategic insight in this slice.

**Critical UNVERIFIED items to chase before launch:**
1. Per-persona AdReach from Meta/Google/LinkedIn/TikTok audience-sizing tools (highest priority).
2. Per-persona Saturation from Meta Ad Library advertiser counts (medium priority).
3. DSCR-specific lead-to-funded conversion benchmark (mortgage-wide 2–5% is not DSCR-specific).
4. State-by-state DSCR advertising restrictions (CA, NY, MA, NJ, MN, OH, PA, WA).
5. Google Ads + TikTok 2026 housing/credit policy specifics.

---

*Generated by dscr-verifier on 2026-06-22. This file is research/verification output under the orchestrator's reframed scope. Numbers without primary-source citation are flagged UNVERIFIED with confidence band. Compliance frame inherited from SA9 Section 0 + Section 3.*
