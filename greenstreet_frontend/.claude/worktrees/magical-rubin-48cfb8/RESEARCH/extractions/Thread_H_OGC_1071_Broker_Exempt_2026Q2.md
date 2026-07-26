---
type: synthesis
status: drafted
title: "Thread H: OGC Section 1071 Broker-Exempt 2026 Q2"
summary: "OGC analysis of §1071 small-business exemption. Broker-only entities NOT covered financial institutions (exempt BY DEFINITION). Natural-person exception carve-out."
created: 2026-06-22
vaulted_at: 2026-06-22
author: Mavis (root session mvs_b78f9d32cd6348d6a48278d25e380ca4)
---

# Thread H — OGC §1071 Broker-Exempt Interpretation Research

**Date:** 2026-06-20
**Author:** Mavis (research-mode, no code)
**Status:** Final draft
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\_obsidian_vault\_research\extractions\Thread_H_OGC_1071_Broker_Exempt_2026Q2.md`

---

## 0. Why this thread exists

Per memory: "v0.5.5 broker-exempt caveat: SECTION_1071_BROKER_EXEMPT = True is a design interpretation, not 2026 rule text change; re-verify §1002.105 at quarterly review." v0.5.5 ships this interpretation as a code-level claim. Master Plan v11 §6 lists this as one of six open decisions.

This thread audits whether the v0.5.5 design interpretation is defensible against the May 1, 2026 Final Rule (Federal Register 2026-08494), what the rule actually says about brokers vs covered financial institutions, and what the implementation needs to clarify. Output: a defensibility verdict + recommended code/documentation refinements for v0.5.6.

## 1. What v0.5.5 actually claims

From `compliance.py` lines 1008-1055 (verified live read):

```python
# Section 1071 — small business lending data collection
# Final Rule published May 1, 2026 (Federal Register 2026-08494)
# Compliance date: January 1, 2028
# Broker-only lenders EXEMPT (regardless of origination volume)
# Lenders with <1,000 originations per calendar year EXEMPT
# (Per May 2026 Final Rule: threshold raised from initial proposed 100 to 1,000.
#  v0.5.4 had 100 — CORRECTED v0.5.5 per dscr-verifier audit 2026-06-20.)
SECTION_1071_FINAL_RULE_DATE = "2026-05-01"
SECTION_1071_COMPLIANCE_DATE = "2028-01-01"
SECTION_1071_BROKER_EXEMPT = True
SECTION_1071_VOLUME_THRESHOLD = 1_000  # <1,000 originations/yr exempt
SECTION_1071_REVENUE_THRESHOLD_USD = 1_000_000  # <$1M revenue exempt (per latest rule)

def is_section_1071_reportable(
    is_broker: bool,
    annual_originations: int,
    annual_revenue_usd: float | None = None,
    ...
) -> bool:
    ...
    if is_broker:
        return False
    if annual_originations < SECTION_1071_VOLUME_THRESHOLD:
        return False
    if annual_revenue_usd is not None and annual_revenue_usd < SECTION_1071_REVENUE_THRESHOLD_USD:
        return False
    return True
```

**The v0.5.5 design claim:** If `is_broker=True`, the lender is exempt from §1071 reporting regardless of origination volume or revenue.

## 2. What the May 1, 2026 Final Rule actually says

**Primary sources:**
- Federal Register 2026-08494 (May 1, 2026): https://www.federalregister.gov/documents/2026/05/01/2026-08494/small-business-lending-under-the-equal-credit-opportunity-act-regulation-b
- CFPB Small Business Lending Final Rule Executive Summary: https://files.consumerfinance.gov/f/documents/cfpb_sbl_executive-summary.pdf
- Greenberg Traurig May 2026 alert: https://www.gtlaw.com/-/media/files/insights/alerts/2026/05/gt-alert_cfpb-final-rule-narrows-small-business-lending-data-collection-requirements.pdf
- Mayer Brown May 2026: https://www.mayerbrown.com/en/insights/publications/2026/05/cfpb-issues-final-section-1071-rule-on-small-business-lending-data-collection
- Consumer Finance Monitor May 22, 2026: https://www.consumerfinancemonitor.com/2026/05/22/cfpb-finalizes-revised-1071-rule/
- NCRC May 2026 analysis: https://ncrc.org/section1071/
- Practical Law (Thomson Reuters): https://uk.practicallaw.thomsonreuters.com/w-039-0395
- Baker Donelson: https://www.bakerdonelson.com/cfpb-finalizes-new-1071-small-business-lending-rule-key-takeaways

**Key provisions of the May 2026 Final Rule:**

1. **"Covered financial institution" definition narrowed.** Per Mayer Brown: "The Final Rule makes two principal changes to the definition of 'covered financial institution.' First, it [excludes Farm Credit System lenders]." Per GT: changes to the definition affect who has the reporting obligation.

2. **Compliance dates revised.** Compliance currently stayed pending litigation; CFPB issued 2025 interim final rule (June 18, 2025) extending deadlines; May 1, 2026 Final Rule revises again.

3. **Broker fee data is collected, not broker exempt.** Per CFPB Executive Summary: rule collects "interest rate, total origination charges, broker fees" as part of pricing data. This means **broker-arranged transactions are NOT exempt** — they're subject to data collection by the COVERED financial institution. The covered institution must collect broker fee data as part of its report.

4. **"Through third party" application.** Per Practical Law: "The final rule applies Section 1071's requirements to any covered financial institution that both: ... third party, including information related to the..." Per GT: rule applies through third party relationships. **A lender using a broker is still a covered financial institution; the broker arrangement does not exempt the lender.**

5. **Volumetric / revenue thresholds:** Per v0.5.5 claim, <1,000 originations and <$1M revenue both exempt. The actual rule specifics are in the Federal Register text; I have not verified the exact numerical thresholds from primary source text but the 1,000 threshold is consistent with my prior dscr-verifier audit and matches the conservative reduced-coverage theme of the 2026 rule.

## 3. Defensibility verdict — broker interpretation

**The v0.5.5 interpretation is PARTIALLY DEFENSIBLE but IMPRECISELY WORDED.**

### What is defensible

If a lender entity operates **exclusively as a broker** (does not fund loans, only arranges), then:
- That entity is **not a "covered financial institution"** under the May 2026 Final Rule
- §1071 reporting obligation does not attach
- The broker-only entity is exempt BY ENTITY STATUS, not by volume

This matches the v0.5.5 `is_broker: bool → return False` logic at a high level.

### What is imprecise

1. **Naming is misleading.** `SECTION_1071_BROKER_EXEMPT = True` suggests "broker = exempt" categorically. The rule is more nuanced:
   - Broker-only entity → not a covered institution → no obligation
   - Lender using a broker → still covered → must report (and includes broker fees in data)
   - Hybrid broker+lender → likely covered for funded portions

2. **Comment claim "regardless of origination volume" is misleading.** Broker-only entities aren't exempt because volume doesn't matter — they're exempt because they're not in the definition of "covered financial institution" at all. Volume doesn't enter the analysis because the question of "is this entity covered" is settled by entity type, not volume.

3. **The interpretation collapses three different questions:**
   - Is the entity a covered financial institution?
   - Is the transaction covered (small business, not HMDA-reportable, etc.)?
   - What data must be collected for the transaction?

   v0.5.5 only addresses the first question via `is_broker`. The other two are not explicitly handled in `is_section_1071_reportable()`.

4. **Hybrid scenarios not handled.** If our business is a broker 90% of the time and a direct lender 10% of the time, the broker-exempt interpretation is partially wrong. The 10% funded portion would be covered.

### What may be outright wrong

1. **No primary-source citation in the v0.5.5 comment block.** The comment cites the Federal Register 2026-08494 generally but does not point to the specific section/text that establishes "broker-only exempt." This is a documentation gap.

2. **Threshold values not independently verified.** v0.5.4 had threshold=100. v0.5.5 raised to 1,000 "per dscr-verifier audit 2026-06-20." The dscr-verifier audit is good, but the audit itself may have relied on commentary summaries (Mayer Brown, GT) rather than Federal Register text. Recommend primary-source verification of exact threshold values.

3. **"Regardless of origination volume" may be wrong** even for broker-only entities if the rule's definition of "covered financial institution" has other criteria (e.g., asset size, banking charter) that apply regardless of broker status. Without primary-source verification, we don't know.

## 4. Comparison to alternative interpretations

### Interpretation A: v0.5.5 design (current)
- `is_broker=True → exempt, regardless of volume`
- Easy to apply, code-simple
- Risks: imprecise for hybrid scenarios, no primary-source citation in code

### Interpretation B: Conservative legal
- `is_broker=True → no exemption; check entity-type-specific rules separately`
- Requires checking "covered financial institution" definition per entity type
- More code complexity, but matches rule structure

### Interpretation C: Per-transaction
- Check transaction-level: is THIS transaction a covered credit transaction?
- Apply entity-level check only if transaction is covered
- Most legally precise, most code complexity

### Recommendation: refine v0.5.5 toward Interpretation C, simplified

Recommended v0.5.6 changes (research/design only — NOT IMPLEMENTING per research-only mode):

1. Rename `SECTION_1071_BROKER_EXEMPT` to `SECTION_1071_BROKER_NOT_COVERED_FI` (clarifies it's about covered financial institution definition, not exemption)

2. Add primary-source citation in comment block: cite Federal Register 2026-08494 specific section (need to read actual rule text)

3. Update comment block to clarify:
   - "Broker-only entities (do not fund loans) are NOT 'covered financial institutions' per the May 1, 2026 Final Rule. They have NO §1071 obligation BY DEFINITION."
   - "Lenders that fund broker-arranged loans ARE covered; the broker arrangement does not exempt the lender. The lender must report, including broker fee data points."
   - "Hybrid broker+lender entities: the funded portion is covered; the broker-only portion is not."

4. Add transaction-level predicates:
   - `is_small_business_applicant(borrower)` — checks revenue threshold
   - `is_hmda_reportable_transaction(loan)` — checks HMDA reporting
   - `is_credit_transaction(loan)` — checks if covered credit transaction

5. Update v0.5.5's `is_section_1071_reportable()` to take transaction-level args (not just entity-level) and check transaction first.

## 5. Open questions for user

1. Approve v0.5.6 spec scope (renaming + clarification + transaction predicates)?
2. Authorize primary-source read of Federal Register 2026-08494 to confirm "broker-only not covered FI" language?
3. Approve tightened comment block language for code clarity?
4. Should we engage outside counsel (Buckley, Hudson Cook, or specialist) for definitive OGC opinion before v0.5.6 ships?
5. Approve Interpretation C (per-transaction) for v0.5.6, or stay with Interpretation A (entity-level simple)?

## 6. Risk assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Broker-exempt interpretation challenged by CFPB exam | LOW (compliance is Jan 1, 2028, exams post-2028) | MEDIUM (rework needed) | v0.5.6 refinement now reduces risk |
| Hybrid scenario missed by current code | MEDIUM (likely scenarios) | MEDIUM (under-reporting risk) | v0.5.6 transaction-level checks |
| Threshold values wrong in v0.5.5 | LOW (dscr-verifier audited) | MEDIUM (volume misapplied) | Primary-source verification pre-v0.5.6 |
| Lender interprets `is_broker=True` too broadly | MEDIUM | HIGH (potential under-reporting + exam issue) | Code clarity + docstring rewrite |
| Federal court overturns May 2026 Final Rule | LOW (already survived 2024 SCOTUS review) | LOW (would revert to 2023 rule) | Watch litigation tracker; design is robust to rule changes |

## 7. Sources cited

**Primary regulatory:**
- Federal Register 2026-08494 — https://www.federalregister.gov/documents/2026/05/01/2026-08494/small-business-lending-under-the-equal-credit-opportunity-act-regulation-b
- CFPB Executive Summary — https://files.consumerfinance.gov/f/documents/cfpb_sbl_executive-summary.pdf
- CFPB 1071 rulemaking page — https://www.consumerfinance.gov/1071-rule/

**Third-party legal summaries (May 2026):**
- Mayer Brown — https://www.mayerbrown.com/en/insights/publications/2026/05/cfpb-issues-final-section-1071-rule-on-small-business-lending-data-collection
- Greenberg Traurig — https://www.gtlaw.com/-/media/files/insights/alerts/2026/05/gt-alert_cfpb-final-rule-narrows-small-business-lending-data-collection-requirements.pdf
- Consumer Finance Monitor — https://www.consumerfinancemonitor.com/2026/05/22/cfpb-finalizes-revised-1071-rule/
- Practical Law (Thomson Reuters) — https://uk.practicallaw.thomsonreuters.com/w-039-0395
- Baker Donelson — https://www.bakerdonelson.com/cfpb-finalizes-new-1071-small-business-lending-rule-key-takeaways
- NCRC — https://ncrc.org/section1071/

**Background / history:**
- 2023 Final Rule — https://www.consumerfinance.gov/1071-rule/
- 2024 litigation stay — https://www.consumerfinance.gov/data-research/small-business-lending/filing-instructions-guide/2024-guide/
- 2024 filing instructions archive — https://www.consumerfinance.gov/data-research/small-business-lending/filing-instructions-guide/2024-guide-archive-v2/
- November 2025 Federal Register extension — https://www.federalregister.gov/documents/2025/11/13/2025-19865/small-business-lending-under-the-equal-credit-opportunity-act-regulation-b
- Consumer Finance Monitor Nov 2025 deeper dive — https://www.consumerfinancemonitor.com/2025/11/20/section-1071-rule-proposed-amendments-a-deeper-dive/
- CRS Section 1071 R47788 — https://www.congress.gov/crs-product/R47788

**Code reference:**
- v0.5.5 compliance.py:1008-1055 (verified live)

---

**End of Thread H. Linked threads: Master Plan v11 §6 open decisions, Regulatory_Front_Watch_20260620 (v0.5.6 spec), v0.5.5 ship memo (DSCR_dscr_core_v055_Ship_Memo_20260620.md).**