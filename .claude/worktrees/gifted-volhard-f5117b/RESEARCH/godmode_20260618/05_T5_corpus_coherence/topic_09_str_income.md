---
type: research
status: drafted
confidence: 5
title: "T5 Audit Card — TOPIC 9: STR Income Modeling (Legality, Three Worlds, Seasonality)"
summary: "**TOPICAL_INDEX ref:** Lines 594–660 **Last update (per audit table):** Round 17 (PARTIAL — needs T12 full 50-state matrix)"
entities:
  - data/kbra
  - lender/deephaven
  - topic/str
tags:
  - topic/default-rate
  - topic/insurance
  - topic/ppp
  - type/audit
source: RESEARCH/godmode_20260618/05_T5_corpus_coherence/topic_09_str_income.md
vaulted_at: 2026-06-20
---
# T5 Audit Card — TOPIC 9: STR Income Modeling (Legality, Three Worlds, Seasonality)

**Audit date:** 2026-06-18
**TOPICAL_INDEX ref:** Lines 594–660
**Last update (per audit table):** Round 17 (PARTIAL — needs T12 full 50-state matrix)

---

## 1. Internal Consistency Check

| Item | Verdict |
|------|---------|
| Legality gate CLEAR/RESTRICTED/UNCERTAIN/PROHIBITED | ✅ Aligned with TOPIC 6 AC #17 |
| 3 income worlds (LTR, projected, 12-mo documented) NEVER blended | ✅ |
| Three-source min rule: MIN(LTR, AirDNA × (1−haircut), 12-mo) | ✅ Aligned |
| Appraisal GOVERNS over AirDNA | ✅ Standard |
| STR OpEx 45-65% | ✅ Aligned with TOPIC 1 |
| Monthly seasonality bar chart MANDATORY | ✅ Aligned |
| STR lender acceptance table | ⚠️ Deephaven "Requires 12 mo documented STR history" — but per TOPIC 8 Deephaven was upgraded to Tier 1 PROBABLE; need to verify STR-specific rule still applies |
| STR regulation database — hardcoded markets | ⚠️ Only 4 cities (LA, NYC, Miami Beach, Nashville); needs T12 expansion |
| AirDNA enterprise gating | ✅ Aligned with TOPIC 14 |
| 2026 STR occupancy stabilizing | ⚠️ No source citation; needs citation |

## 2. Cross-TOPIC Consistency Check

| Related TOPIC | Consistency |
|---------------|-------------|
| TOPIC 11 (PPP — STR = prohibited kill) | ✅ Aligned |
| TOPIC 8 (Lender match — STR specialists) | ⚠️ Need to reconcile Deephaven STR requirement (12-mo) with Round 17 Tier 1 PROBABLE upgrade |
| TOPIC 17 (Insurance — STR has different considerations) | ✅ Aligned |

## 3. Round 19 Verification

- TOPIC 9 was NOT explicitly re-verified in Round 19.
- **Round 17 T2 #1 (STR default +1.5-2.5pp) was DOWNGRADED** — citation broken, KBRA shows no systematic gap. TOPIC 9 doesn't cite this specific rule of thumb so no direct contradiction, but cross-reference hygiene would be improved by adding the KBRA finding.
- **Round 17 T2 #4 (STR regulation 50 states) was UPGRADED to Tier 1 PROBABLE** — TOPIC 9 only has 4 hardcoded markets (LA, NYC, Miami Beach, Nashville) and needs T12 expansion.

**T12 work in progress:** 50-state STR regulation matrix; Round 17 confirms Wikipedia + Minut + state tourism are sufficient sources.

## 4. Stale Items

- **STR regulation database** has only 4 hardcoded markets; needs T12 expansion to 50 states.
- **2026 STR occupancy claim** (line 653) needs source.
- **STR lender acceptance table** includes Deephaven with 12-mo requirement; need to verify post-Round 17 upgrade.

## 5. Cross-References Validity

- TOPIC 11 link ✅
- TOPIC 8 link ✅ (subject to Deephaven conflict — see TOPIC 8 audit card)
- TOPIC 17 link ✅

## 6. Verdict

**PARTIAL — NEEDS T12 EXPANSION**

**Confidence: 3/5** (3 income worlds model is solid; STR regulation database incomplete; STR default rule of thumb needs cross-reference update)

## 7. Recommended Actions

1. **CRITICAL — Complete T12 50-state STR regulation matrix** and propagate to TOPIC 9 STR Regulation Database section.
2. **Add Round 17 T2 #1 finding:** "STR-vs-LTR default delta is property-level, not systematic per KBRA 475K loans (June 2025). Industry rule of thumb +1.5-2.5pp is not empirically grounded."
3. **Verify Deephaven STR 12-mo requirement** against post-Round 17 Tier 1 PROBABLE upgrade.
4. **Cite source for "2026 STR occupancy stabilizing; supply growth risk elevated"** — likely AirDNA or Rabbu.
5. **Optional add:** AirDNA Rentalizer constraints (12 mo, dated within 90 days, 3 comps, market score ≥60, 2 persons/bedroom max) are documented in TOPIC 9; verify they align with TOPIC 14 vendor costs.