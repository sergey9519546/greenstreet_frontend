---
type: research
status: drafted
confidence: 3
title: "T5 Audit Card — TOPIC 11: 50-State PPP Matrix (Branching Gate)"
summary: "**TOPICAL_INDEX ref:** Lines 750–841 **Last update (per audit table):** Round 11 (17/50 verified — needs completion)"
entities:
  - tax/pal
  - topic/str
tags:
  - topic/kill-criteria
  - topic/ppp
  - topic/usury
  - type/audit
source: RESEARCH/godmode_20260618/05_T5_corpus_coherence/topic_11_50state_ppp.md
vaulted_at: 2026-06-20
---
# T5 Audit Card — TOPIC 11: 50-State PPP Matrix (Branching Gate)

**Audit date:** 2026-06-18
**TOPICAL_INDEX ref:** Lines 750–841
**Last update (per audit table):** Round 11 (17/50 verified — needs completion)

---

## 1. Internal Consistency Check

| Item | Verdict |
|------|---------|
| Branching Gate (3 ordered steps: business-purpose + entity-vested; bank/depository; individual vesting) | ✅ Solid logic |
| State matrix (16 states documented) | ⚠️ Only 16 of 50 — audit table says "17/50 verified" |
| MN HF 3437 ENACTED 4/23/26, eff 8/1/26 | ✅ Matches Round 14 corpus |
| OH threshold $116,356 (2026 indexed), PENALTY BASE = ORIGINAL principal | ✅ Specific citation |
| PA threshold $319,777 (2026, §406 LIPL) | ✅ Specific citation |
| NJ LLC/entity = HIGH-RISK | ✅ Aligned with TOPIC 6 AC #23 |
| PPP structures (5-4-3-2-1, 3-2-1, etc.) | ✅ Standard |
| Annual re-index Celery cron January 1 | ✅ Aligned with T10 |
| Repricing (No-PPP Premium): +0.50/+0.80 rate and/or 0.625% fee | ✅ Aligned with TOPIC 5 |

## 2. Cross-TOPIC Consistency Check

| Related TOPIC | Consistency |
|---------------|-------------|
| TOPIC 6 (Kill criterion 2: PPP illegal) | ✅ Aligned |
| TOPIC 8 (Lender match — affected by PPP availability) | ✅ Aligned |
| TOPIC 5 (Pricing — no-PPP premium) | ✅ Aligned |

## 3. Round 19 Verification

- TOPIC 11 was NOT explicitly re-verified in Round 19.
- **T13 50-state usury caps** (parallel work) is in progress per godmode plan T13.
- **MN HF 3437** enacted date and effective date are stable.
- **OH/PA annual indexing** needs January 1 cron — operationally important.

**Audit table says 17/50 verified.** TOPIC 11 documents 16 states explicitly (AK, MN, NM, ND/KS/MD, OH, PA, NJ, IL, MS, AR, WI/ME, WV, RI, SC, OK/TX, NY, WA). The "17/50" suggests one more state added without full documentation in TOPIC 11.

## 4. Stale Items

- **33 of 50 states undocumented** in TOPIC 11 — major gap.
- **T13 usury caps** work may help complete PPP coverage (some states have usury caps that effectively ban PPP via APR threshold).
- **Round 17 T2** did not include PPP-specific verification — should have.

## 5. Cross-References Validity

- TOPIC 6 link ✅
- TOPIC 8 link ✅
- TOPIC 5 link ✅

## 6. Verdict

**NEEDS COMPLETION (33 of 50 states missing)**

**Confidence: 3/5** (16 documented states are accurate; 33 states undocumented)

## 7. Recommended Actions

1. **CRITICAL — Complete 50-state PPP matrix.** T13 usury caps research can serve as a foundation; expand to all 50 states.
2. **Document the 17th verified state** (audit table says 17/50).
3. **Cross-link T13 usury caps findings** — APR-based PPP bans (OK/TX, IL) are usury-cap-adjacent.
4. **Schedule January 1 cron re-verify** for OH/PA indexed thresholds.