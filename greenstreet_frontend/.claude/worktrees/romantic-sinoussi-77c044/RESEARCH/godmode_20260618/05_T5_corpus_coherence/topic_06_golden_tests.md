---
type: research
status: drafted
confidence: 3
title: "T5 Audit Card — TOPIC 6: Golden Tests / Acceptance Criteria (Definition of Done)"
summary: "**TOPICAL_INDEX ref:** Lines 380–436 **Last update (per audit table):** Round 11 (FLAGGED STALE — needs Round 19 propagation)"
entities:
  - concept/arm
  - concept/itia
  - concept/pitia
  - tax/1031
  - tax/niit
  - tax/pal
  - topic/str
tags:
  - topic/after-tax
  - topic/default-rate
  - topic/ic-memo
  - topic/insurance
  - topic/portfolio
  - topic/ppp
  - topic/reserves
  - topic/short-rate
  - topic/tax
  - topic/yield-curve
  - type/audit
source: RESEARCH/godmode_20260618/05_T5_corpus_coherence/topic_06_golden_tests.md
vaulted_at: 2026-06-20
---
# T5 Audit Card — TOPIC 6: Golden Tests / Acceptance Criteria (Definition of Done)

**Audit date:** 2026-06-18
**TOPICAL_INDEX ref:** Lines 380–436
**Last update (per audit table):** Round 11 (FLAGGED STALE — needs Round 19 propagation)

---

## 1. Internal Consistency Check

23 Acceptance Criteria (v11) reviewed:

| # | Criterion | Internal Consistency |
|--:|-----------|----------------------|
| 1 | Track 1 + Track 2 side by side, never blended | ✅ Matches TOPIC 1 |
| 2 | Reproduces every golden vector; stress cells reconcile | ⚠️ Conflict with TOPIC 2 forumals vector (P&I $1,999 vs $2,121) — see TOPIC 2 Conflict #1 |
| 3 | Gross/PITIA AND NOI/P&I; lower-of(lease, 1007); no LTR vacancy haircut by default | ✅ Consistent with TOPIC 1 |
| 4 | Returns + levered IRR (PRE/AFTER-TAX); Return Grade on after-tax | ✅ Aligned with TOPIC 3 + 4 |
| 5 | Property-tax reassessment per state; PITIA uses reassessed tax | ✅ Aligned with TOPIC 16 (Round 19 verified) |
| 6 | After-tax engine (depreciation, §1250, NIIT, PAL, 1031, OBBBA bonus-dep) | ✅ Aligned with TOPIC 4 |
| 7 | Cost-seg flag ≥$450K | ✅ Aligned with TOPIC 4 |
| 8 | Insurance: geography risk model + kill gate (FL, CA, TX Gulf, LA Coastal) | ✅ Aligned with TOPIC 17 (Round 19 verified) |
| 9 | BRRRR refi-seasoning gate (ARV vs cost basis) | ✅ Aligned with TOPIC 17 |
| 10 | ARM reset engine (B″): SOFR + margin, double-shock year flagged for IO+ARM | ✅ Aligned with TOPIC 12 (Round 19 verified) |
| 11 | Rates: dated triplet at 10yr 4.44–4.47%, 5yr 4.26%, SOFR 3.59% (Jun 17, 2026); 175-450 bps spread | ✅ Consistent with TOPIC 5 |
| 12 | True cost per lender: AEY via XIRR 12/24/36/60-mo + APR-equiv | ✅ Aligned with TOPIC 8 |
| 13 | Lender screen: eligibility → fit tier → AEY → confidence; two-quote | ✅ Aligned with TOPIC 8 |
| 14 | PPP gate BRANCHES (entity × bank × purpose); MN HF 3437 ENACTED; OH/PA annually-indexed | ✅ Aligned with TOPIC 11 |
| 15 | No-PPP re-pricing re-runs both tracks AND return model | ✅ Aligned |
| 16 | Reserves: tiered/capped/geography/portfolio-stacked | ✅ |
| 17 | STR legality gate before income; three-source min(); monthly seasonality bar chart | ✅ Aligned with TOPIC 9 |
| 18 | Every lender claim: provenance label + verified_date; no render without them | ✅ Aligned with TOPIC 10 |
| 19 | Verdict (PROCEED/RESTRUCTURE/PASS) + binding constraint + $ deltas + Track-2 ack | ✅ Aligned |
| 20 | Kill criteria (incl. insurability + BRRRR + ARM double-shock) before lender ranking | ✅ Aligned |
| 21 | IC memo + sensitivity + risk + true-cost exports; reproducible snapshots | ✅ Aligned with TOPIC 18 |
| 22 | Portfolio: ΣNOI/ΣADS, debt yield, concentration, refi watchlist | ✅ |
| 23 | NJ LLC/entity PPP defaults to HIGH-RISK | ✅ Aligned with TOPIC 11 |

15 Kill Criteria reviewed — all consistent with referenced TOPICS.

## 2. Cross-TOPIC Consistency Check

**CONFLICT candidate #3: Acceptance Criterion 11 rate anchor**
- TOPIC 6 line 399: "10yr 4.44–4.47%, 5yr 4.26%, SOFR 3.59% as of June 17, 2026"
- TOPIC 5 line 313-321: "SOFR 3.63%" (NY Fed Jun 16); "SOFR 30-day avg 3.609%"
- TOPIC 12 line 868: "SOFR 30-day: 3.59% (Northmarq)"
- The 3.59% / 3.609% / 3.63% are different precision/sources for SOFR. Not strictly contradictory but worth aligning.

## 3. Round 19 Verification

| Item | Round 19 Status |
|------|-----------------|
| AC #2 (golden vector reproduction) | ⚠️ Subject to TOPIC 2 Conflict #1 |
| AC #5 (property tax reassessment) | ✅ T3 G8-01..05 verified (Prop 13, mill rates) |
| AC #6 (after-tax engine) | ✅ TOPIC 4 verified Round 15 |
| AC #7 (cost-seg) | ✅ TOPIC 4 verified |
| AC #8 (insurance kill gate) | ✅ T3 G7-01..04 verified (insurance escalation, NFIP) |
| AC #10 (ARM reset double-shock) | ✅ T4 algo + T11 layered ensemble verified (NSS-Svensson + Hull-White + Vasicek/CIR) |
| AC #11 (rate triplet) | ✅ TOPIC 5 verified, Q3 2026 refresh needed |
| AC #14 (PPP gate) | ✅ TOPIC 11 verified |
| AC #17 (STR legality gate) | ⚠️ TOPIC 9 PARTIAL — needs T12 full 50-state matrix |

**Critical Round 19 propagation points:**
- The 23 ACs themselves don't need to change; they are stable.
- BUT the underlying TOPICS they reference need their verification dates propagated.

## 4. Stale Items

- **Acceptance Criterion 11 rate triplet** — needs to be re-verified monthly per T10 cron.
- **All "Last updated Round 11"** metadata is misleading — multiple TOPICS have been re-verified Round 14/15/16/17/19.
- **No content errors** in the 23 ACs themselves.

## 5. Cross-References Validity

- TOPIC 2 link ✅ (subject to Conflict #1)
- TOPIC 10 link ✅
- TOPIC 11 link ✅
- TOPIC 17 link ✅

## 6. Verdict

**VERIFIED — propagation needed**

**Confidence: 4/5** (all 23 ACs internally consistent; needs last-update metadata propagated from Round 19)

## 7. Recommended Actions

1. **Update last-update date** for TOPIC 6 to "Round 19 propagation" since AC #5, #8, #10 have all been re-verified.
2. **Resolve TOPIC 2 Conflict #1** (Forumals P&I $1,999 vs Sovereign Master $2,121) — affects AC #2 "Reproduces every golden vector."
3. **T10 cron:** Monthly re-verification of AC #11 rate triplet.
4. **TOPIC 9 partial gap** — note that AC #17 references TOPIC 9 STR legality gate; flag TOPIC 9 for T12 50-state matrix completion.