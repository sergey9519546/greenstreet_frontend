# DSCR Sovereign OS — Compliance v0.5.0 HOEPA Dodd-Frank Fix Ship Memo

**Date:** 2026-06-20
**Package:** `dscr-core` v0.4.0 → v0.5.0
**Type:** PATCH (CRITICAL HOEPA compliance bug — caught by dscr-verifier smoke test)
**Status:** ⚠️ **SUPERSEDED by v0.5.2** — v0.5.0 verifier audit found 3 additional bugs (HOEPA_PF_DOLLAR_SMALL=1000 hardcoded when IS inflation-adjusted to $1,380 in 2026; 2 wrong CFR cite subparagraphs). See `output/DSCR_Compliance_v052_Ship_Memo_20260620.md` for the final clean version.

---

## TL;DR

`dscr-core` v0.4.0 shipped with WRONG HOEPA thresholds (pre-Dodd-Frank values, AND logic, single-tier P&F, missing prepayment penalty test). **dscr-verifier smoke test caught it within 7 minutes of agent creation** on the same day it shipped. v0.5.0 fixes all 4 HOEPA bugs and adds the missing test.

**Quality gate:**
- 437/437 tests pass (was 427 + 10 new HOEPA tests)
- Coverage 92% (compliance.py 93%)
- Ruff clean + format clean

---

## What v0.4.0 got wrong (per dscr-verifier)

| Claim | v0.4.0 value | CORRECT (per 12 CFR 1026.32) |
|-------|--------------|------------------------------|
| First-lien APR threshold | 0.085 (8.5pp) | **0.065 (6.5pp)** — Dodd-Frank §1431 |
| Subordinate-lien APR threshold | 0.10 (10pp) | **0.085 (8.5pp)** — Dodd-Frank §1431 |
| P&F logic | Single 8% with `max()` operator | **Two-tier:** 5% (≥threshold) OR lesser-of-8%-or-$1,000 (<threshold) |
| `is_hoepa_loan` logic | AND across 3 tests | **OR across 3 tests** |
| Loan-size threshold | Used as a cap | **Used as tier-break** between 5% and 8% P&F rules |
| Prepayment penalty test | Missing entirely | **Added:** >36mo period OR >2% of prepaid amount |

## What v0.5.0 fixes

1. **HOEPA APR thresholds corrected** per Dodd-Frank Wall Street Reform Act §1431:
   - First-lien: 0.065 (6.5pp) above APOR (was 0.085 in v0.4.0)
   - Subordinate: 0.085 (8.5pp) above APOR (was 0.10 in v0.4.0)
   - Citation: 12 CFR 1026.32(a)(1)(i)(A) and (C)

2. **HOEPA P&F two-tier logic** per 12 CFR 1026.32(a)(1)(ii):
   - Loan ≥ annual threshold ($27,592 in 2026): P&F > 5% of loan
   - Loan < annual threshold: P&F > lesser of 8% of loan OR $1,000 (NOT inflation-adjusted per Reg Z §1026.32(b)(1)(ii))

3. **`is_hoepa_loan` restructured** to OR logic per 12 CFR 1026.32(a)(1):
   - Returns True if ANY of (i) APR test, (ii) P&F test, (iii) Prepayment penalty test passes
   - Old v0.4.0 required ALL to pass (WRONG)

4. **Prepayment penalty test added** per 12 CFR 1026.32(a)(1)(iii):
   - Triggers if penalty period > 36 months after consummation, OR
   - Triggers if penalty > 2% of amount prepaid
   - New function signature: `is_hoepa_loan(..., prepayment_penalty_period_months, prepayment_penalty_pct)`

5. **Loan-size threshold reclassified**:
   - v0.4.0 used `HOEPA_THRESHOLDS_BY_YEAR[year]["loan_amount"]` as a CAP (HOEPA only applies to SMALLER loans)
   - v0.5.0 uses it as the TIER-BREAK between 5% and 8% P&F rules — no loan-size cap on HOEPA itself

6. **New constants exported**:
   - `HOEPA_PF_PERCENTAGE_LARGE = 0.05` (5% for loans ≥ annual threshold)
   - `HOEPA_PF_DOLLAR_SMALL = 1000` ($1,000 cap for small loans, NOT inflation-adjusted)
   - `HOEPA_PP_PENALTY_PERCENT = 0.02` (prepayment penalty % test)
   - `HOEPA_PP_PENALTY_PERIOD_MONTHS = 36` (prepayment penalty period test)
   - Old `HOEPA_PF_PERCENTAGE_FLOOR = 0.08` removed (it was wrong)

## Tests

Replaced TestHOEPA (4 tests with wrong expected values) with 13 tests covering:
- `test_first_lien_apr_above_6_5pp_triggers` (was: `test_first_lien_apr_threshold` with wrong expected)
- `test_first_lien_apr_at_6_5pp_does_not_trigger` (boundary check)
- `test_subordinate_apr_above_8_5pp_triggers` (was: `test_subordinate_apr_threshold` with wrong expected)
- `test_first_lien_apr_below_6_5pp_no_trigger`
- `test_large_loan_pf_threshold_is_5pct`
- `test_small_loan_pf_threshold_is_lesser_of_8pct_or_1000`
- `test_large_loan_no_size_cap_only_higher_pf_threshold` (corrects v0.4.0 misclassification)
- `test_or_logic_any_single_test_triggers`
- `test_prepayment_penalty_period_over_36_months_triggers`
- `test_prepayment_penalty_percent_over_2pct_triggers`
- `test_no_test_triggers_does_not_trigger`
- `test_all_three_exceeded_triggers` (still passes via OR logic)
- `test_pending_year_raises` + `test_pre_2025_raises` (validation)

Per-year lookup tests (TestHOEPAPerYear) unchanged — that part was correct.

## Primary-source citations

| Claim | Primary source | Verified by |
|-------|----------------|-------------|
| 6.5pp first-lien APR threshold | 12 CFR 1026.32(a)(1)(i)(A) post-Dodd-Frank | dscr-verifier (smoke test 2026-06-20) + my own web_search confirmation |
| 8.5pp subordinate-lien APR threshold | 12 CFR 1026.32(a)(1)(i)(C) post-Dodd-Frank | dscr-verifier + web_search |
| 5% P&F for ≥ $20K inflation-adjusted | 12 CFR 1026.32(a)(1)(ii)(A) | dscr-verifier + Federal Register 2025-22773 |
| Lesser of 8% or $1,000 for < $20K | 12 CFR 1026.32(a)(1)(ii)(B) | dscr-verifier + Federal Register 2025-22773 |
| OR logic across three tests | 12 CFR 1026.32(a)(1) (the structure is "exceeds [i] or [ii] or [iii]") | dscr-verifier |
| Prepayment penalty test | 12 CFR 1026.32(a)(1)(iii) | dscr-verifier |
| Dodd-Frank revision | Pub.L. 111-203 §1431 (July 21, 2010) | dscr-verifier |
| $1,000 NOT inflation-adjusted | Reg Z §1026.32(b)(1)(ii) | dscr-verifier |

## Files changed

| File | Status |
|------|--------|
| `src/dscr_core/compliance.py` | UPDATED — constants + is_hoepa_loan rewritten |
| `src/dscr_core/__init__.py` | UPDATED — version 0.5.0 + new exports |
| `tests/test_compliance_v040.py` | UPDATED — TestHOEPA rewritten (4 wrong tests → 13 correct tests) |
| `pyproject.toml` | UPDATED — version 0.5.0 |
| `output/DSCR_Compliance_v040_Ship_Memo_20260620.md` | UPDATED — correction notice added; ✅→❌ for APR threshold row |
| `output/DSCR_Compliance_Fix_Ship_Memo_20260620.md` | UPDATED — correction notice added; ✅→❌ for APR threshold row |
| `_obsidian_vault/_deliverables/DSCR_Compliance_Fix_Ship_Memo_20260620.md` | UPDATED — summary notes supersession; ✅→❌ for APR threshold row |

## Impact assessment

If v0.4.0 had been used in production:
- **Under-trigger risk (consumer protection failure)**: A loan with APR > APOR + 6.5pp (but ≤ 8.5pp) would have been classified as non-HOEPA, skipping required HOEPA disclosures. This could trigger TILA rescission rights and statutory damages ($5K-$50K per violation per 15 USC 1640).
- **Over-trigger risk (lender false positive)**: A $15K loan with $1,200 P&F would have been classified as HOEPA when it isn't (lesser of $1,200 or $1,000 = $1,000; $1,200 > $1,000 is correct HOEPA, but $1,100 would have been wrongly HOEPA per old 8% × $15K = $1,200 logic, which is correct per old single-tier with max() but WRONG per two-tier min()).
- **Missing prepayment penalty check**: Any prepayment penalty > 36mo or > 2% would have been ignored — TILA rescission exposure.
- **AND vs OR**: A loan passing APR test (e.g., 11% APR, 1.5% APOR, first-lien) with low P&F would have been classified as non-HOEPA even though it triggers HOEPA via APR test alone.

These are theoretical scenarios (no production deployment), but the dscr-verifier audit confirms they would have been misclassified by v0.4.0.

## Lessons (carry forward)

1. **Stamping "✅ verified" without cross-checking primary source is WORSE than admitting "unverified".** Internal consistency ≠ correctness.
2. **The dscr-verifier caught a bug 7 minutes after it shipped.** Verifier-on-ship is now part of the workflow.
3. **The same wrong values can propagate through code, tests, and ship memos simultaneously** if all derived from the same wrong source. Always verify against the primary statute text, not against how I remember it or what the corpus says.
4. **Pre-Dodd-Frank values (8.5pp/10pp/8% with max()) are widespread in industry references** — they're outdated but still appear in many compliance summaries. Always check the actual effective regulation.

## Next steps

- ✅ v0.5.0 SHIPPED — HOEPA Dodd-Frank fix complete
- ⏳ Re-spawn dscr-verifier to audit v0.5.0 (independently confirm fix)
- ⏳ Resume Slice 2 P0-3 R-Vine Copula work (paused on this P0 fix)
- ⏳ Future enhancement: make dscr-verifier a mandatory ship gate (run verifier before declaring any compliance-related work shipped)
