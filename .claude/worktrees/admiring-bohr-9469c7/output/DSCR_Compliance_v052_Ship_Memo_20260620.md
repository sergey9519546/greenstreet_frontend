# DSCR Sovereign OS — Compliance v0.5.2 Final Clean Ship Memo

**Date:** 2026-06-20
**Package:** `dscr-core` v0.4.0 → v0.5.2 (2 patch releases in 1 day)
**Type:** PATCH (CRITICAL HOEPA compliance bugs — caught by dscr-verifier across 3 audit rounds)
**Status:** ✅ **VERIFIER-CONFIRMED CLEAN** — all 5 audit claims PASS

---

## TL;DR

`dscr-core` v0.4.0 shipped with WRONG HOEPA thresholds. Three rounds of dscr-verifier audits caught **5 distinct bugs** in the HOEPA implementation. v0.5.2 fixes all of them and is the final clean version, verified by independent dscr-verifier audit.

**Quality gate:**
- 439/439 tests pass (was 213 in v0.2.0; +226 tests across v0.3.0/v0.4.0/v0.5.x)
- Coverage 92% (compliance.py 93%)
- Ruff clean + format clean
- dscr-verifier v0.5.2 audit: **5/5 claims PASS**

---

## The full bug chain (caught by dscr-verifier)

| Version | Verifier round | Bug found |
|---------|----------------|-----------|
| v0.4.0 | smoke test | APR thresholds 0.085/0.10 (pre-Dodd-Frank); P&F single-tier with max(); AND logic; no prepayment penalty test; no docstring specifics. 4 bugs caught. |
| v0.5.0 | audit 1 | `HOEPA_PF_DOLLAR_SMALL = 1000` hardcoded (the dollar trigger IS inflation-adjusted, $1,380 in 2026). Plus 2 docstring citation errors. 3 bugs caught. |
| v0.5.1 | audit 2 | File header line 3 still said v0.5.0; line 21 still claimed "1000 NOT inflation-adjusted" (residual from v0.5.0); is_hoepa_loan docstring at line 1149 still hardcoded "$1,000"; test naming claimed "year_indexed" but only tested 2026; missing pinpoint cite to 12 CFR 1026.32(a)(1)(ii)(B). 5 issues caught. |
| v0.5.2 | re-audit | **All 5 claims PASS.** ✅ |

## What v0.5.2 ships (final correct values)

```python
# HOEPA APR thresholds (12 CFR 1026.32(a)(1)(i); Dodd-Frank §1431)
HOEPA_APR_THRESHOLD_FIRST_LIEN = 0.065    # 6.5pp above APOR
HOEPA_APR_THRESHOLD_SUBORDINATE = 0.085   # 8.5pp above APOR

# HOEPA P&F thresholds (12 CFR 1026.32(a)(1)(ii))
# 5% for loans >= annual threshold ($27,592 in 2026)
HOEPA_PF_PERCENTAGE_LARGE = 0.05
# Small-loan tier uses annual inflation-adjusted dollar trigger
# ($1,348 in 2025, $1,380 in 2026) — pulled from HOEPA_THRESHOLDS_BY_YEAR
# NOT hardcoded — was the v0.5.0 bug

# HOEPA prepayment penalty test (12 CFR 1026.32(a)(1)(iii))
HOEPA_PP_PENALTY_PERIOD_MONTHS = 36   # >36 months after consummation triggers
HOEPA_PP_PENALTY_PERCENT = 0.02      # >2% of amount prepaid triggers

# HOEPA_THRESHOLDS_BY_YEAR — both annual thresholds inflation-adjusted
# per 12 CFR 1026.32(a)(1)(ii)(B) + Federal Register annual notice
HOEPA_THRESHOLDS_BY_YEAR = {
    2025: {"loan_amount": 26_968, "points_and_fees": 1_348},
    2026: {"loan_amount": 27_592, "points_and_fees": 1_380},
    2027+: None,  # pending CFPB Federal Register Nov/Dec 2026
}

# is_hoepa_loan uses OR logic across the three tests (per 12 CFR 1026.32(a)(1))
# Returns True if ANY of: APR test, P&F test, prepayment penalty test passes
```

## Quality gate per version

| Version | Tests | Coverage | Ruff | Verifier |
|---------|-------|----------|------|----------|
| v0.4.0 (shipped) | 427 | 89% | clean | FAILED audit (4 bugs) |
| v0.5.0 (shipped) | 437 | 92% | clean | FAILED audit (3 bugs) |
| v0.5.1 (shipped) | 439 | 92% | clean | FAILED audit (5 issues) |
| **v0.5.2 (current)** | **439** | **92%** | **clean** | **PASSED audit (5/5)** |

## Files changed

| File | Status |
|------|--------|
| `src/dscr_core/compliance.py` | Final clean — Dodd-Frank APRs, two-tier P&F with year-indexed dollar trigger, OR logic, prepayment penalty test, correct docstrings with pinpoint CFR cites |
| `src/dscr_core/__init__.py` | v0.5.2 version + new exports |
| `pyproject.toml` | v0.5.2 version |
| `tests/test_compliance_v040.py` | 13 HOEPA tests covering Dodd-Frank + year-indexed P&F + prepayment penalty tests |
| `output/DSCR_Compliance_v040_Ship_Memo_20260620.md` | Correction notice + ✅→❌ for APR row |
| `output/DSCR_Compliance_Fix_Ship_Memo_20260620.md` | Correction notice + ✅→❌ for APR row |
| `_obsidian_vault/_deliverables/DSCR_Compliance_Fix_Ship_Memo_20260620.md` | Updated summary + ✅→❌ |
| `output/DSCR_Compliance_v050_Ship_Memo_20260620.md` | v0.5.0 ship memo |
| `output/DSCR_Compliance_v051_Ship_Memo_20260620.md` | v0.5.1 ship memo (will be marked superseded by this memo) |
| `output/DSCR_Compliance_v052_Ship_Memo_20260620.md` | THIS FILE (v0.5.2 final clean) |

## Primary-source citations

| Claim | Source | Verified by |
|-------|--------|-------------|
| First-lien APR 6.5pp | 12 CFR 1026.32(a)(1)(i)(A); Dodd-Frank §1431 | dscr-verifier (rounds 1, 2, 3) |
| Subordinate APR 8.5pp | 12 CFR 1026.32(a)(1)(i)(C) | dscr-verifier |
| P&F 5% for ≥ $20K inflation-adjusted | 12 CFR 1026.32(a)(1)(ii)(A); FR 2025-22773 | dscr-verifier |
| P&F lesser of 8% OR $1,000 inflation-adjusted | 12 CFR 1026.32(a)(1)(ii)(B); FR 2025-22773 | dscr-verifier (round 2 caught the $1,000 hardcoded bug) |
| OR logic across 3 tests | 12 CFR 1026.32(a)(1) | dscr-verifier |
| Prepayment penalty test | 12 CFR 1026.32(a)(1)(iii) | dscr-verifier |
| 2026 dollar trigger $1,380 | FR 2025-22773 (Dec 15, 2025) | dscr-verifier |
| 2026 loan threshold $27,592 | FR 2025-22773 (Dec 15, 2025) | dscr-verifier |
| 2025 dollar trigger $1,348 | FR 2024-27553 | dscr-verifier |
| 2025 loan threshold $26,968 | FR 2024-27553 | dscr-verifier |

## Lessons (carry forward — recorded in agent.md + MEMORY)

1. **The same bug shipped 3 times in a row.** The pattern is: I write a value with a confident comment claiming what it is, the verifier checks against primary source, the comment is wrong AND the value is wrong AND the cite is wrong. The fix in each round is the same: update value + update comment + update cite. **The root cause is me not verifying against primary source before writing the docstring.**

2. **dscr-verifier is now part of the ship workflow.** Every compliance change must be verified before declaration. The verifier caught in 3 audits what I would have shipped with ✅ stamps — 5 total bugs.

3. **The self-improving principle worked.** When the verifier caught a bug, I propagated the lesson to agent.md (CRITICAL operating principle), dscr-verifier agent.md (do not trust producer's prior ✅ stamps), and MEMORY.md (concrete failure examples). Each verifier round was more thorough than the last.

4. **Internal consistency ≠ correctness.** Code, tests, and ship memos can all be wrong together if they all derived from the same wrong source. The verifier breaks this cycle by cross-checking against primary statute text.

5. **The verifier caught a meta-bug.** The verifier flagged that even after fixing the constant, my docstring still claimed "1000 NOT inflation-adjusted" — the same wrong claim in the docstring as the wrong value. The fix needed to update both the code AND the documentation in tandem.

## Honest about what was wrong

I shipped v0.4.0 with 4 wrong HOEPA values + 3 wrong docstring claims + 2 wrong citations. v0.5.0 fixed the 4 wrong values but kept the wrong claims (now contradicted by the inline comments). v0.5.1 fixed the inline comments and dollar-trigger logic but left 5 documentation/consistency issues. **v0.5.2 fixes ALL of them** — but the meta-pattern (confident wrong values + confident wrong claims) won't stop unless I check primary sources BEFORE writing.

This is exactly what the user's directive was about: "self-improving + proactive agent". The directive is now embedded in my system prompt. I am committing to verifying against primary source before stamping ✅ on any compliance claim, and to spawning `dscr-verifier` on every compliance-related ship.

## Next steps

- ✅ v0.5.2 SHIPPED — HOEPA final clean
- ✅ dscr-verifier confirmed all 5 claims PASS
- ⏳ Resume Slice 2 P0-3 R-Vine Copula (paused on this P0 fix)
- ⏳ Future: investigate T13_summary.md (corpus collateral issue flagged by verifier — pre-Dodd-Frank values still there)
- ⏳ Future: write the official v0.5.2 marker in vault
