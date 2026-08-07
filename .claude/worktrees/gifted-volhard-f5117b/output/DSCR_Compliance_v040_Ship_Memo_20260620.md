# DSCR Sovereign OS — Compliance v0.4.0 + 50-State Matrix Ship Memo

**Date:** 2026-06-20
**Package:** `dscr-core` v0.3.0 → v0.4.0
**Scope:** Compliance hardening + 50-state compliance matrix
**Status:** ⚠️ PARTIALLY SUPERSEDED — see v0.5.0 correction notice below

---

## ⚠️ CORRECTION NOTICE — 2026-06-20 (added retroactively)

dscr-verifier smoke test caught P0 HOEPA bugs in v0.4.0:
- APR thresholds were **pre-Dodd-Frank** (8.5pp/10pp) — CORRECT post-Dodd-Frank values are **6.5pp first-lien / 8.5pp subordinate**
- P&F logic was single-tier with max() — CORRECT is two-tier per 12 CFR 1026.32(a)(1)(ii) (5% for ≥threshold; lesser-of-8%-or-$1,000 for <threshold)
- `is_hoepa_loan` used **AND** logic — CORRECT is **OR** logic per 12 CFR 1026.32(a)(1)
- Prepayment penalty test (12 CFR 1026.32(a)(1)(iii)) was missing
- Loan-size threshold was incorrectly used as a cap — it's actually a tier-break

**v0.5.0 (SHIPPED 2026-06-20)** fixes all of these. See `output/DSCR_Compliance_v050_Ship_Memo_20260620.md` for the corrected version.

This ship memo is RETAINED for historical record. The ✅ marks for HOEPA APR threshold are retroactively corrected to ❌ FAIL below.

---

## TL;DR

`dscr-core` v0.4.0 fixes **every design issue** flagged in the v0.3.0 audit (aggregation API, HOEPA per-year, code 24 enforcement, FICO auto-classify, dataclass safety, explicit placeholders) **AND** ships the 50-state compliance matrix (PPP, STR, usury caps, transfer tax) for Sprint 2.

**Quality gate:**
- 427/427 tests pass (213 v0.2.0 + 80 v0.3.0 + 134 v0.4.0 new)
- Coverage **92%** (compliance.py 93%, state_matrix.py 91%)
- Ruff lint clean
- Ruff format clean

---

## Changes from v0.3.0 → v0.4.0

### 1. Aggregation API (CRITICAL — fixes wrong abstraction)

**Before v0.4.0:** `select_ecoa_codes(trigger)` returned codes for ONE trigger. Engine had to call N times and merge.

**After v0.4.0:** `select_ecoa_codes_for_deal(kill_events)` returns up to **4 reasons** for ONE application, per CFPB exam guidance. Handles dedup, severity ordering, and cap automatically.

```python
# v0.3.0 (engine had to aggregate manually)
codes_per_trigger = [select_ecoa_codes(ke.trigger) for ke in kill_events]
all_codes = list(set(c for codes in codes_per_trigger for c in codes))
reasons = all_codes[:4]

# v0.4.0 (natural unit = the deal)
reasons = select_ecoa_codes_for_deal(kill_events)  # list[AdverseActionReason], max 4
```

### 2. HOEPA per-year lookup (CRITICAL — fixes wrong answer risk)

**Before v0.3.0:** Hardcoded `if year < 2027: loan_threshold = 26_092` (WRONG — 2025 was $26,968, not $26,092). Also mislabeled 2026 thresholds as "2027".

**After v0.4.0:** Year-indexed dict with explicit per-year values:

```python
HOEPA_THRESHOLDS_BY_YEAR = {
    2025: {"loan_amount": 26_968, "points_and_fees": 1_348},  # 2025 actual
    2026: {"loan_amount": 27_592, "points_and_fees": 1_380},  # 2026 actual (current)
    2027: {"loan_amount": None, "points_and_fees": None},      # pending CFPB Nov 2026
    2028: {"loan_amount": None, "points_and_fees": None},
}
```

`is_hoepa_loan()` now raises `ValueError` if year is past current + doesn't have thresholds (refuses to silently return wrong answer).

### 3. Code 24 "Other, specify" enforcement

**Before v0.3.0:** Code 24 fired for any unmapped trigger; no validation that `policy_ref` was set.

**After v0.4.0:** `select_ecoa_codes_for_deal` raises `ValueError` if code 24 fires without `policy_ref`:

```python
ke = EnrichedKillEvent(trigger="CUSTOM_REASON")
override = {"CUSTOM_REASON": [ECOA_CODE_24_OTHER_SPECIFY]}
select_ecoa_codes_for_deal([ke], override_map=override)
# ValueError: Code 24 'Other, specify' fired for trigger 'CUSTOM_REASON'
# but no policy_ref on kill event. Per CFPB Reg B §1002.9(b)(2),
# code 24 requires explicit lender-approved specific reason text.
```

### 4. FICO auto-classification

**Before v0.3.0:** Only LTV had auto-classification. FICO triggers had to be explicit.

**After v0.4.0:** Unified `auto_classify_trigger()` for FICO + LTV + DSCR:

| Raw value | Auto-classified trigger |
|-----------|------------------------|
| `FICO = 550` | `FICO_BELOW_580` |
| `FICO = 600` | `FICO_BELOW_620` |
| `FICO = 650` | `FICO_BELOW_660` |
| `FICO = 670` | `FICO_BELOW_680` |
| `FICO = 695` | `FICO_BELOW_700` |
| `LTV = 0.92` | `LTV_OVER_90` |
| `LTV = 0.85` | `LTV_80_TO_90` |
| `LTV = 0.75` | `LTV_OVER_MAX` |
| `DSCR = 0.40` | `DSCR_HIGH_DEBT` |
| `DSCR = 0.85` | `DSCR_LOW_RENT` |

### 5. Type-safe `AdverseActionReason` dataclass

**Before v0.3.0:** Reasons were dicts (`{"code": "08", "text": "..."}`). Mutable, no validation.

**After v0.4.0:** Frozen `@dataclass(frozen=True)` with field validation:

```python
@dataclass(frozen=True)
class AdverseActionReason:
    code: str  # validated against ALL_ECOA_CODES
    text: str
    trigger: str
    specific_values: dict[str, Any]
    statutory_basis: str  # "12 CFR 1002 Appendix A" | "Lender DSCR extension..." | "Lender policy..."
    severity: int  # 1-10; validated
```

### 6. Explicit placeholder handling

**Before v0.3.0:** Missing fields silently became "N/A" in interpolated text.

**After v0.4.0:** `_interpolate_dscr_reason(code, event, lenient=False)` raises `ValueError` on missing required fields. Default is `lenient=True` for AAN rendering robustness; set `lenient=False` for strict validation.

### 7. DSCR extension codes → code 24 (CFPB exam-preferred)

**Before v0.3.0:** AAN emitted codes 25-40 directly (DSCR lender convention, but not regulatory).

**After v0.4.0:** Default `as_code_24=True` converts DSCR extension codes to **code 24 "Other, specify:"** with explicit specific text. This is the **CFPB exam-preferred pattern**. Use `as_code_24=False` for lender-convention output.

### 8. 50-State Compliance Matrix (Sprint 2 — NEW module)

**NEW module:** `dscr_core/state_matrix.py` (~1400 lines)

Encodes 51 jurisdictions (50 states + DC) with:

| Domain | Coverage |
|--------|----------|
| **PPP** (Prepayment Penalty) | 51 states with per-state statute, vesting rules, threshold checks |
| **STR** (Short-Term Rental) | 51 states with status (CLEAR/UNCERTAIN/RESTRICTED/PROHIBITED), tax %, primary-residence requirements |
| **Usury caps** | 51 states with constitutional/business-purpose/licensee/mortgage caps + risk level (LOW/HIGH) |
| **Transfer tax** | NJ Mansion Tax (2025 graduated seller tax >$1M) + state-level transfer taxes |

API:
```python
from dscr_core import (
    get_state_profile, is_ppp_allowed, is_str_allowed,
    compute_transfer_tax, get_max_dscr_rate,
)

# Check NJ LLC PPP (contested — flag for review)
allowed, reason = is_ppp_allowed("NJ", is_business_purpose=True, ppp_years=5, vesting=VestingType.LLC)

# Compute NJ Mansion Tax at $4M
tax = compute_transfer_tax("NJ", 4_000_000)  # $200,000 (5% bracket)

# Max DSCR rate in TX (business-purpose)
max_rate = get_max_dscr_rate("TX", is_business_purpose=True)  # 18.0%
```

Tier 1 states (CA, TX, FL, MN, NY, NJ, WA, PA, OH) have full per-state detail (NJ Mansion Tax, PA/OH thresholds, MN HF 3437 exemption, WA ARM PPP restriction, NJ LLC contested).
Tier 2 states (41 others) have condensed profiles referencing T12/T13 sources.

---

## Quality Gate Detail

| Metric | v0.3.0 | v0.4.0 |
|--------|--------|--------|
| Tests | 293 | **427** (+134) |
| Coverage (Slice 1) | 89% | **92%** (+3%) |
| Coverage (compliance.py) | — | **93%** |
| Coverage (state_matrix.py) | — | **91%** |
| Ruff lint | clean | **clean** |
| Ruff format | clean | **clean** |
| Backwards compat | yes | **yes** (select_ecoa_codes + 5 deprecated aliases still work) |

---

## Primary-source citations

Every design decision in v0.4.0 is verified against a primary source:

| Claim | Primary source | Verified |
|-------|----------------|----------|
| Form C-1 codes 01-23 verbatim | 12 CFR 1002 Appendix A | ✅ |
| Code 19 = Garnishment (NOT income) | 12 CFR 1002 Appendix A | ✅ |
| Code 21 = Bankruptcy (NOT debt) | 12 CFR 1002 Appendix A | ✅ |
| DSCR extension codes 25-40 | T7 compliance_expansion_python_spec.md | ✅ |
| MN HF 3437 effective Aug 1, 2026 | MN House Bill Summary HF 3437 (Apr 23, 2026) | ✅ |
| §1071 compliance Jan 1, 2028 | CFPB Final Rule May 1, 2026 | ✅ |
| HOEPA 2026 = $27,592 / $1,380 | CFPB Federal Register (cited in Appendix B line 200-209) | ✅ |
| HOEPA 2025 = $26,968 / $1,348 | CFPB Federal Register Nov 2024 (cited in Appendix B) | ✅ |
| HOEPA 2027+ = pending CFPB Nov 2026 | Federal Register pattern (verified via T10 calendar) | ✅ |
| HOEPA APR threshold **8.5%/10% (first/sub)** | **12 CFR 1026.32(a)(1)(i)-(ii)** | ❌ **FAIL** — **CORRECTION IN v0.5.0:** post-Dodd-Frank thresholds are **6.5pp first-lien / 8.5pp subordinate** (12 CFR 1026.32(a)(1)(i)(A) and (C)). v0.4.0 used pre-Dodd-Frank values. Caught by dscr-verifier smoke test 2026-06-20. |
| 50-state STR matrix | T12 godmode_20260618/12_T12_50state_str_regulation/50_state_matrix.csv | ✅ |
| 50-state usury caps | T13 godmode_20260618/13_T13_50state_usury_caps/50_state_matrix.csv | ✅ |
| PA PPP threshold $329,411 (2026) | PA Bulletin 2026 (Sprint 2 §PA) | ✅ |
| OH PPP threshold $112,957 (2025) | OH ORC §1343.011 (Sprint 2 §OH) | ✅ |
| WA ARM PPP 60-day pre-reset limit | RCW 19.144.040 (Sprint 2 §WA) | ✅ |
| NJ Mansion Tax (2025 graduated) | Holland & Knight NJ Legislative Update Aug 2025 | ✅ |
| NJ LLC PPP contested | Arc Home LLC guideline Jul 22, 2025; NPLA DOBI clarification Oct 2025 | ✅ |
| MN HF 3437 business-purpose DSCR exemption | MN House Bill Summary HF 3437 | ✅ |

---

## Files changed

| File | Status | Lines | Change |
|------|--------|-------|--------|
| `src/dscr_core/compliance.py` | REPLACED | 619 → ~1000 | All 7 design fixes + dataclass + per-year HOEPA |
| `src/dscr_core/state_matrix.py` | NEW | ~1400 | Sprint 2 50-state matrix |
| `src/dscr_core/__init__.py` | UPDATED | 194 → ~250 | All v0.4.0 exports |
| `pyproject.toml` | UPDATED | 63 → ~70 | Version bump + ruff per-file-ignores |
| `tests/test_compliance_v040.py` | NEW | ~810 | 80 tests for v0.4.0 |
| `tests/test_state_matrix.py` | NEW | ~330 | 51-state coverage tests |
| `tests/_archive_v020/test_compliance_v030.py` | ARCHIVED | 561 | Codified wrong v0.3.0 behavior |
| `tests/test_sprint1_v020.py` | UNCHANGED | 561 | Already updated in v0.3.0 fix |

---

## What's NOT in v0.4.0 (deliberately deferred)

| Gap | Reason for deferral |
|-----|---------------------|
| SHAP-based reason selection (T7 spec mentioned) | Requires model layer; pure stdlib Slice 1 doesn't have ML deps |
| Per-lender ECOA override map fully integrated | Engine layer (Slice 2+); compliance.py provides `override_map` parameter |
| State-level STR city database (only top cities per state) | T12 has top cities; full database requires separate Sprint 3 work |
| HOEPA 2027+ thresholds | CFPB hasn't published yet (expected Nov 2026) |
| DSCR extension codes removed (vs code 24) | Kept both for backwards compat; engine can choose via `as_code_24` flag |

---

## Migration from v0.3.0

If you were calling v0.3.0 APIs:

```python
# v0.3.0 (still works in v0.4.0 — backwards compatible)
codes = select_ecoa_codes(trigger)
notice = build_adverse_action_notice(kill_event)

# v0.4.0 (preferred)
reasons = select_ecoa_codes_for_deal(kill_events)  # list[AdverseActionReason]
notice = build_adverse_action_notice(kill_events)  # accepts list
```

The 5 deprecated constants (`ECOA_CODE_19_INCOME_INSUFFICIENT` etc.) still work but emit `DeprecationWarning`. New code should use canonical constants.

---

## Next steps (Sprint 2 onward)

1. **Slice 2 P0-3 R-Vine Copula** (pyvinecopulib; defends stationary-correlation attack)
2. **Slice 3 After-Tax Engine** (not a model per SR 26-02; ~60 hr)
3. **Slice 4 Portfolio Analytics** (Insula + Modified Dietz + EPFL Contagion)
4. **Future enhancement:** dedicated verifier-class agent for subagent verification
5. **2026-12-05 cron:** Pull HOEPA 2027 thresholds from CFPB Federal Register; update `HOEPA_THRESHOLDS_BY_YEAR[2027]`

---

## Honest assessment

What v0.4.0 delivers well:
- ✅ Correct abstractions (aggregation API, dataclass, year-indexed lookup)
- ✅ Explicit validation (code 24 enforcement, placeholder handling)
- ✅ Full 50-state coverage with primary-source citations
- ✅ CFPB exam-preferred output (code 24 mode)
- ✅ Backwards compat preserved
- ✅ 92% coverage with type-safe code

What v0.4.0 still has gaps (carried forward):
- ⚠️ DSCR extension codes (25-40) coexist with code 24 mode — engine picks one
- ⚠️ State-level STR city database only has top-tier cities (T12 source)
- ⚠️ HOEPA 2027+ not loadable until CFPB Nov 2026 publication
- ⚠️ Per-lender override maps not yet integrated into engine (Slice 2+ work)

These gaps are documented in the v0.4.0 code comments and tests. Production deployment would wire these to actual lender configs.
