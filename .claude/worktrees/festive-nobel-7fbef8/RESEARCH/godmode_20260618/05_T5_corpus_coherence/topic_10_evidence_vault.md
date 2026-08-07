---
type: research
status: drafted
confidence: 3
title: "T5 Audit Card — TOPIC 10: Evidence Vault & Provenance"
summary: "**TOPICAL_INDEX ref:** Lines 663–747 **Last update (per audit table):** Round 11 (SCHEMA READY)"
entities:
  - lender/deephaven
  - lender/rocket-pro
  - regulation/ecoa
  - regulation/fcra
  - topic/str
tags:
  - topic/kill-criteria
  - type/audit
source: RESEARCH/godmode_20260618/05_T5_corpus_coherence/topic_10_evidence_vault.md
vaulted_at: 2026-06-20
---
# T5 Audit Card — TOPIC 10: Evidence Vault & Provenance

**Audit date:** 2026-06-18
**TOPICAL_INDEX ref:** Lines 663–747
**Last update (per audit table):** Round 11 (SCHEMA READY)

---

## 1. Internal Consistency Check

| Item | Verdict |
|------|---------|
| JSONB Evidence Object Schema (evidence_id, entity_type, claim, lender, source_url, etc.) | ✅ Standard |
| PostgreSQL Schema (source_id, as_of_timestamp, effective_date, confidence_score, hash, ttl_hours, provenance_tier, decay_rate) | ✅ Solid |
| lender_programs Table (lender_name, claim_text, claim_type, source_url, source_type, verified_date, confidence_score, supersedes_id, counterparty_flag, expires_date) | ✅ Solid |
| Confidence Decay (Verified-Primary -5/30d after 90d; Verified-Secondary -10/30d after 60d; Market-Pattern -15/30d after 45d) | ✅ Reasonable |
| Records below 40 confidence → flag 'REQUIRES REVERIFICATION' | ✅ Aligned with TOPIC 6 AC #18 |
| "Unspecified" Rule (no false precision; interpolation forbidden) | ✅ Aligned with TOPIC 8 |
| Per-Inference Model Provenance (model version, git hash, training cutoff, calibration map, challenger delta) | ✅ Aligned with TOPIC 13 |
| Cryptographic Hash Chain (SHA-256; immutable versioning; FCRA 25-month retention; SR 26-02) | ✅ Aligned with TOPIC 17 |

**No internal contradictions.**

## 2. Cross-TOPIC Consistency Check

| Related TOPIC | Consistency |
|---------------|-------------|
| TOPIC 8 (Lender provenance rules) | ✅ Aligned |
| TOPIC 6 (Kill criterion 14: confidence <60) | ✅ Aligned |
| TOPIC 13 (Model governance under SR 26-02) | ✅ Aligned |
| TOPIC 17 (FCRA + ECOA + SR 26-02 retention) | ✅ Aligned |

## 3. Round 19 Verification

- TOPIC 10 is a **schema specification**, not a verified data claim. The schema itself is stable.
- **However, the confidence decay rates and re-verification triggers** should be sanity-checked against Round 17 T2 upgrades — Round 17 demonstrated that confidence scores need periodic re-validation (Deephaven was upgraded from 65 STALE to Tier 1 PROBABLE after S&P RMBS 2026-INV2 deal).
- **SR 26-02 classification** (TOPIC 13 line 991-999) is consistent with TOPIC 10 model governance.

**No content changes needed.** TOPIC 10 is current.

## 4. Stale Items

- **Decay schedule not yet operationalized** in production — T10 cron needs to be live.
- **Per-Inference Model Provenance** (V3 add) — not yet referenced by any TOPIC's runtime example.

## 5. Cross-References Validity

- TOPIC 8 link ✅
- TOPIC 6 link ✅
- TOPIC 13 link ✅

## 6. Verdict

**VERIFIED — SCHEMA READY**

**Confidence: 5/5** (schema is solid; runtime cron needs to be live but that's an ops task, not a corpus task)

## 7. Recommended Actions

1. **No critical actions** — TOPIC 10 schema is well-designed.
2. **Optional:** Add Round 17 T2 #7 Deephaven upgrade as an exemplar evidence_id entry showing how the provenance schema supports re-verification.
3. **Add Round 17 T2 #8 Rocket Pro TPO upgrade** as second exemplar.
4. **Cross-link to T10 cron schedule** in godmode plan.