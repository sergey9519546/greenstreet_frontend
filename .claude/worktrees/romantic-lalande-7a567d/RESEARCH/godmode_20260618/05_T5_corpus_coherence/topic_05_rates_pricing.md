---
type: research
status: drafted
confidence: 3
title: "T5 Audit Card — TOPIC 5: Rates & Pricing (Live Anchors, Spreads, Levers)"
summary: "**TOPICAL_INDEX ref:** Lines 291–378 **Last update (per audit table):** Round 11 (FLAGGED STALE)"
entities:
  - concept/arm
  - concept/dscr
  - data/fred
  - data/freddie-mac
  - data/trepp
  - lender/angel-oak
  - lender/griffin-funding
  - lender/visio-lending
  - topic/multifamily
  - topic/str
tags:
  - topic/lgd
  - topic/llpa
  - type/audit
source: RESEARCH/godmode_20260618/05_T5_corpus_coherence/topic_05_rates_pricing.md
vaulted_at: 2026-06-20
---
# T5 Audit Card — TOPIC 5: Rates & Pricing (Live Anchors, Spreads, Levers)

**Audit date:** 2026-06-18
**TOPICAL_INDEX ref:** Lines 291–378
**Last update (per audit table):** Round 11 (FLAGGED STALE)

---

## 1. Internal Consistency Check

| Item | Verdict |
|------|---------|
| DGS10 (10Y Treasury) 4.43% (FRED) | ✅ Live as of Jun 2026 |
| GS10 May 2026 avg 4.48% | ✅ |
| 10Y Treasury FRED DGS10 Jun 15-17: 4.44-4.47% | ✅ |
| 5-Year Treasury 4.26% (Northmarq) | ✅ |
| SOFR 3.63% (NY Fed Jun 16) | ✅ |
| SOFR 30/90/180-day averages 3.609/3.636/3.679% | ✅ |
| CME Term SOFR 1mo/3mo/6mo/12mo: 3.637/3.668/3.731/3.869% | ✅ |
| Fed Funds 3.50-3.75% (4th consecutive hold) | ✅ |
| MORTGAGE30US ~6.53% (Freddie Mac Jun 8) | ✅ |
| Credit spread 175-450 bps | ✅ Reasonable |
| Dated triplet 6.125-6.49% / 6.50-7.50% / up to 10.75% | ✅ Internally consistent |
| Pricing levers table | ✅ Reasonable |
| LLPAs | ✅ Standard |

**No internal contradictions within TOPIC 5.**

## 2. Cross-TOPIC Consistency Check

| Related TOPIC | Consistency |
|---------------|-------------|
| TOPIC 8 (Lender Matrix uses rates for AEY) | ✅ Uses TOPIC 5 dated triplet as anchor |
| TOPIC 12 (ARM Reset uses SOFR forward curve) | ✅ TOPIC 5 SOFR anchors feed TOPIC 12 SOFR forward curve |
| TOPIC 14 (Cost Stack) | ✅ Independent; no conflict |
| TOPIC 9 (STR Income) | ✅ Independent |

**CONFLICT candidate #2: SOFR 30-day average**
- TOPIC 5 line 314: SOFR 30-day avg 3.609%
- TOPIC 12 line 868: SOFR 30-day 3.59% (Northmarq)
- Difference: 0.019% (rounding/measurement window). Likely the same data; no real conflict.

## 3. Round 19 Verification

- TOPIC 5 was **NOT** explicitly re-verified in Round 19 (math/algo sweep didn't include live rates).
- TOPIC 5 internal rates appear to be from Round 11-12. The "live" data is dated to June 17-18, 2026 which IS the current session date, so rate data is technically fresh.
- **HOWEVER:** Round 19 T3 G8-04 (DSCR LGD 25-32%) and Round 17 T1 (Trepp CMBS 7.55% → STALE → April 2026 multifamily 7.71%) indicate that corpus-wide macro data needs **monthly cron re-verification** per T10 in godmode plan.
- TOPIC 5's Trepp CMBS reference is in TOPIC 15, not TOPIC 5, so TOPIC 5 itself doesn't have stale macro figures — only the dated triplet and SOFR anchors.

**Stale risk:** Even though data was captured "Jun 17-18 2026," if this TOPIC is consumed by future builds, the data ages quickly. T10 cron schedule is the right mitigation.

## 4. Stale Items

- **Last update date Round 11** — the audit table flags this as STALE. Live rates captured Jun 17-18 2026 partially mitigate but the **dated triplet (June 2026) needs Q3 2026 refresh** to remain operationally useful for downstream builds.
- **LLPAs table** — appears to be from Round 11; no Round 19 verification.
- **Pricing levers table** — appears stable, but credit-spread band (175-450 bps) needs re-check against current lender rate sheets.

## 5. Cross-References Validity

- TOPIC 8 link ✅
- TOPIC 12 link ✅
- TOPIC 14 link ✅

## 6. Verdict

**NEEDS REFRESH**

**Confidence: 4/5** (current data is internally consistent and well-sourced, but corpus "last update Round 11" stamp is misleading — needs Round 19 stamp AND a recurring Q3 2026 refresh schedule)

## 7. Recommended Actions

1. **Update last-update date** to "Round 19 (June 2026 refresh)" — the live data IS current but the audit table metadata is wrong.
2. **Add Q3 2026 refresh trigger** to T10 cron calendar (gmode plan T10 already has Trepp CMBS cron; extend to TOPIC 5 dated triplet).
3. **Re-verify credit spread 175-450 bps** against current Griffin/Visio/Angel Oak rate sheets.
4. **Cross-check SOFR 30-day** 3.609% (NY Fed) vs 3.59% (Northmarq) — likely same source, just round differently. Add note.
5. **No content errors** found — this is a refresh issue, not a correctness issue.