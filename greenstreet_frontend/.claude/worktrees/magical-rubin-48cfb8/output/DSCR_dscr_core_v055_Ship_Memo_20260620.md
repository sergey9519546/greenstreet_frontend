---
type: ship-memo
slice: 2
status: shipped
confidence: 4
title: "dscr-core v0.5.5 — §1071 volume threshold fix (100→1,000)"
summary: "v0.5.5 ship: §1071 volume threshold corrected from 100 to 1,000 per May 1, 2026 Final Rule (Federal Register 2026-08494, 91 FR 23530). Verifier-on-ship: 12/12 PASS, 508/508 dscr-core tests + 191/191 dscr-stress tests, ruff clean, zero collateral damage in DSCR_SOVEREIGN_OS tree. Compliance.py docstring bumped to v0.5.5. version bumped in 5 places (pyproject.toml, __init__.py:__version__, __init__.py:__all__ comment, compliance.py:docstring, test file)."
entities:
  - concept/dscr
  - data/cfpb
  - data/federal-register
  - slice/2
  - topic/compliance
  - topic/regulatory
  - topic/section-1071
tags:
  - topic/ecoa
  - topic/fcra
  - topic/hoepa
  - topic/small-business-lending
  - ship-memo
  - version/v0.5.5
ship_date: 2026-06-20
verifier_session: mvs_8b81575786a449b7b628d89e534e7cf1
verifier_verdict: PASS
verifier_report: C:\Users\serge\AppData\Local\Temp\verifier_report_v055.md
source: output/DSCR_dscr_core_v055_Ship_Memo_20260620.md
vaulted_at: 2026-06-20
author: Mavis
session: mvs_b78f9d32cd6348d6a48278d25e380ca4
---

# dscr-core v0.5.5 — §1071 Volume Threshold Fix (100→1,000)

**Date:** 2026-06-20 17:15 PT
**Ship status:** ✅ SHIPPED (verifier-on-ship PASS, 12/12)
**Audit report:** `C:\Users\serge\AppData\Local\Temp\verifier_report_v055.md`

---

## 1. What shipped

A single-line regulatory bug fix to `dscr_core.compliance.SECTION_1071_VOLUME_THRESHOLD`:
changed from `100` to `1_000` per the CFPB Section 1071 Final Rule published May 1, 2026
(Federal Register 2026-08494, 91 FR 23530).

**Why it matters:** v0.5.4 had 100 (the originally-proposed threshold from the 2023 NPRM).
The May 2026 Final Rule raised it to 1,000 covered credit transactions per year for each
of two consecutive years. A DSCR lender with 100-999 annual originations was being
incorrectly flagged as reportable; now correctly exempt.

**Severity (pre-fix):** MEDIUM. "Conservatively safe" in practice (DSCR lenders crossing
100 but not 1,000 would be incorrectly flagged but in practice wouldn't be filing because
their actual volume is below 1,000), but legally incorrect per Federal Register.

## 2. Files changed (7 files, ~30 lines net)

| File | Change | Lines |
|---|---|---|
| `src/dscr_core/compliance.py:1018` | `SECTION_1071_VOLUME_THRESHOLD = 100` → `1_000` | 1 |
| `src/dscr_core/compliance.py:1008-1014` | inline comment updated to reflect May 2026 Final Rule | 7 |
| `src/dscr_core/compliance.py:1042, 1044` | docstring "<100 originations/yr" → "<1,000 originations/yr" | 2 |
| `src/dscr_core/compliance.py:3` | docstring header bumped to v0.5.5 | 1 |
| `src/dscr_core/__init__.py:169` | `__version__ = "0.5.5"` + comment | 1 |
| `src/dscr_core/__init__.py:316` | trailing `__all__` comment bumped | 1 |
| `pyproject.toml:7, 8` | `version = "0.5.5"` + description | 2 |
| `tests/test_compliance_v040.py:620-666` | rewrote 6 §1071 tests + added boundary test | ~50 |

## 3. Verifier-on-ship result (12/12 PASS)

dscr-verifier (mvs_8b81575786a449b7b628d89e534e7cf1) verified:

| # | Claim | Result | Primary source |
|---|---|---|---|
| 1 | §1071 volume threshold = 1,000 | ✅ PASS | Federal Register 2026-08494 (91 FR 23530) |
| 2 | `is_section_1071_reportable()` logic unchanged | ✅ PASS | compliance.py:1022-1055 byte-identical |
| 3 | §1071 broker-exempt preserved (True) | ✅ PASS (with caveat) | compliance.py:1017 |
| 4 | §1071 revenue carve-out = $1M | ✅ PASS | Federal Register 2026-08494 (was $5M in 2023) |
| 5 | §1071 compliance date = 2028-01-01 | ✅ PASS | Federal Register 2026-08494 |
| 6 | §1071 final rule date = 2026-05-01 | ✅ PASS | Federal Register publication date |
| 7 | 7/7 TestSection1071 + 508/508 dscr-core + 191/191 dscr-stress | ✅ PASS | pytest |
| 8 | Ruff clean on src + tests | ✅ PASS | ruff check |
| 9 | MN HF 3437 logic unaffected | ✅ PASS | 28 MN PPP+HOEPA tests pass |
| 10 | HOEPA logic unaffected | ✅ PASS | HOEPA_THRESHOLDS_BY_YEAR intact at line 1098 |
| 11 | No collateral damage: all SECTION_1071_VOLUME_THRESHOLD refs updated | ✅ PASS | 9 references all updated (more than prompt's 3 estimate) |
| 12 | Zero §1071 / volume_threshold refs in dscr-stress or anywhere else | ✅ PASS | recursive grep clean across DSCR_SOVEREIGN_OS |

## 4. Primary sources cited (verifier)

- **Federal Register 2026-08494 (91 FR 23530)**, published 2026-05-01:
  https://www.federalregister.gov/documents/2026/05/01/2026-08494/small-business-lending-under-the-equal-credit-opportunity-act-regulation-b
  - Threshold 100 → 1,000 originations
  - Compliance date January 1, 2028
  - Publication date May 1, 2026

- **Baker Donelson**, "CFPB Finalizes New 1071 Small Business Lending Rule – Key Takeaways" (May 1, 2026):
  https://www.bakerdonelson.com/cfpb-finalizes-new-1071-small-business-lending-rule-key-takeaways
  - Confirms 100→1,000 threshold
  - Small business definition $1M (down from $5M)
  - FCS lenders exempt; MCAs/agricultural/small dollar excluded

- **Consumer Finance Monitor**, "CFPB Finalizes Revised 1071 Rule" (May 22, 2026):
  https://www.consumerfinancemonitor.com/2026/05/22/cfpb-finalizes-revised-1071-rule/

## 5. Caveats (from verifier)

- **Broker-exempt (#3) is a design interpretation, not a 2026 rule textual change.** The 2026
  rule raises the volume threshold and exempts FCS lenders; it does not redefine who is a
  "financial institution" for §1002.105 purposes. The `SECTION_1071_BROKER_EXEMPT = True` constant
  is consistent with the 2023 final rule's institutional-coverage approach (broker-only lenders
  remain outside coverage as third-party originators not falling within the statutory "financial
  institution" definition under ECOA). Verifier recommends re-verifying against exact §1002.105
  text when 12 CFR Part 1002 Subpart B is fully re-published.

## 6. Process notes (operational)

- Spawning dscr-verifier via PowerShell + `mavis communication send --command spawn` requires
  the JSON content to be a literal single-quoted string with backslash-escaping. Using a
  variable (`$Spawn = @{...} | ConvertTo-Json`) or here-string (`@'...'@`) silently strips
  the JSON quotes and the spawn fails with "Invalid spawn config JSON". The fix is to
  inline the JSON as a single-quoted literal: `'{"agent":"...","prompt":"..."}'`. The first
  two attempts failed; the third (literal-escaped) succeeded.

- 9 SECTION_1071_VOLUME_THRESHOLD references exist (not 3 as the spawn prompt expected):
  5 documentation (constant + 2 inline comments + 2 docstring entries) + 1 usage +
  2 re-exports + 4 test references. Verifier caught the undercount and verified all 9.

## 7. What's next

- **User direction:** back to research/innovation mode per 17:08 user message
- **Open Thread D (Master Plan v11 synthesis)** — depends on Threads A/B/C, ~2-3 hours
- **Open Thread E (AI/ML production reality audit)** — lower priority
- **§1071 follow-ups** (deferred until promotion mode):
  - Add product-coverage helpers (FCS exclusion, MCA exclusion, $1,000 small-dollar exclusion)
  - Add "last decision-maker" rule for multi-party origination
  - Schedule HOEPA 2027 threshold refresh for Nov/Dec 2026 (cron exists at 2026-12-05)
  - Schedule FRED DRSFRMACBS Q2 2026 release poll for Aug 15, 2026 (per Thread A)

## 8. Cross-references

- Thread C research report: `C:\Users\serge\.mavis\scratchpads\mvs_b78f9d32cd6348d6a48278d25e380ca4\research_regulatory_frontier_20260620.md`
- Thread A empirical refresh: `_obsidian_vault/_research\domains\domain_5\EMPIRICAL_REFRESH_2026Q2.md`
- Thread B Tier 4 architecture: `C:\Users\serge\.mavis\scratchpads\mvs_b78f9d32cd6348d6a48278d25e380ca4\research_tier4_architecture_20260620.md`
- v0.5.4 dscr-core ship memo: `output\DSCR_dscr_core_v053_Ship_Memo_20260620.md`
- Verifier report: `C:\Users\serge\AppData\Local\Temp\verifier_report_v055.md`
- DSCR Sovereign OS repo: `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\DSCR_SOVEREIGN_OS\`

---

*Ship verified by dscr-verifier (mvs_8b81575786a449b7b628d89e534e7cf1) on 2026-06-20 17:15 PT.*
*All 12 claims PASS, 508/508 dscr-core + 191/191 dscr-stress tests, ruff clean, zero collateral damage.*
*Bug fix originated from Thread C research finding. Verifier findings integrated into the ship.*
