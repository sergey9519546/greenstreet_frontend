# AUDIT-FINAL-2 — Lender Database Accuracy Sweep (12 lenders)

**Task ID:** AUDIT-FINAL-2
**Agent:** Audit-Subagent-2 (general-purpose)
**Scope:** All 12 lender profiles in `src/lib/dscr/lenders.ts` + counterparty risk table in `src/lib/dscr/trueCostEngine.ts`
**Date:** June 2026 (post v11.1 fixes)

---

## 1. 12-Lender Matrix

| # | ID | Name | FICO | LTV | DSCR | $min | $max | Conf | All-States? | STR? |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | griffin | Griffin Funding | 620 | 80 | 0.75 | $65K | $4M | 85 | Yes (51 = 50+DC) | Yes (75% LTV) |
| 2 | kiavi | Kiavi | 660 | 80 | 1.10 | $75K | $3M | 70 | Yes (51) | Yes (75% LTV, UNVERIFIED) |
| 3 | visio | Visio Lending | 680 | 80 | 1.00 (Flex 0.75 UNVERIFIED) | $75K | $2M | 78 | 49 (excl AK/HI, incl DC) | Yes (75% LTV) |
| 4 | lima_one | Lima One Capital | 660 | 80 | 1.00 | $75K | $2M | 76 | Yes (51) | Yes (75% LTV, AirDNA) |
| 5 | defy | Defy Mortgage | 640 | 85 | 0.75 | $75K | $2.5M | 80 | Yes (51) | Yes (75% LTV) |
| 6 | easy_street | Easy Street Capital | 620 | 80 | 0.00 (no min) | $50K | $3M | 82 | Yes (51) | Yes (75% LTV, AIRDNA_100_PCT) |
| 7 | new_silver | New Silver | 660 | 80 | 0.75 | $150K | $3M | 72 | Yes (51) | Yes (75% LTV, UNVERIFIED) |
| 8 | deephaven | Deephaven Mortgage | 660 | 90 | 0.75 | $100K | $3.5M | 65 (STALE) | Yes (51) | Yes (70% LTV) |
| 9 | angel_oak | Angel Oak | 680 | 80 | 1.00 | $150K | $3M | 75 | Yes (51) | Yes (75% LTV) |
| 10 | corevest | CoreVest | 680 | 75 | 1.25 | $2M | $50M | 68 (DOWNGRADED, <70) | Yes (51) | No |
| 11 | rcn_capital | RCN Capital | 660 | 80 | 1.00 | $75K | $2.5M | 70 | Yes (51) | No |
| 12 | american_heritage | American Heritage | 660 | 85 (@760+ FICO) | 0.75 | $100K | $3M | 65 (STABLE) | Yes (51) | Yes (75% LTV, 25% haircut) |

### Counterparty Risk Table (trueCostEngine.ts `COUNTERPARTY_RISK`)

| Lender | Continuity | Flag | Status |
|---|---|---|---|
| griffin | 88 | STABLE | Active, $20.79M May 2026 production, all 50 states |
| kiavi | 82 | STABLE | Active, public reporting (SPAC 2024) |
| visio | 80 | STABLE | Active, 48 states, broadest STR acceptance |
| lima_one | 78 | STABLE | Active, ~3 week close; portfolio/blanket loans |
| defy | 75 | STABLE | Active, 85% LTV exception |
| easy_street | 76 | STABLE | Active, $500M+ funded, 1500+ loans; STR specialist |
| new_silver | 72 | STABLE | Active, tech-forward, instant approval |
| deephaven | 60 | WATCH | Active but matrix needs re-verification |
| angel_oak | 70 | STABLE | Active, public reporting (AOMC) |
| corevest | 70 | STABLE | Active, institutional portfolio lender ($2M-$50M+) |
| rcn_capital | 75 | STABLE | Active, published guidelines, $2.5M cap, delayed financing |
| american_heritage | 65 | STABLE | Active, Invest Star program |

---

## 2. Spec Verification — All 12 Lenders

| # | Lender | Spec Verified | Status |
|---|---|---|---|
| 1 | Griffin Funding | FICO 620 ✓, LTV 80 ✓, DSCR 0.75 ✓, $4M cap (NOT $20M) ✓, 50 states+DC (51) ✓, confidence 85 ✓ | PASS |
| 2 | Kiavi | confidence 70 ✓, no-ratio UNVERIFIED ✓, portfolio 5+ properties (notes ✓, provenanceDetail VERIFIED_PRIMARY from "Kiavi program guide") ✓ | PASS |
| 3 | Visio Lending | confidence 78 ✓, $2M cap (NOT $5M — v11.1 fix) ✓, STR LTV 75 (NOT 80) ✓, Flex 0.75 UNVERIFIED ✓, vacancyTreatment NONE ✓, 49 entries (48 states + DC, excl AK/HI) ✓ | PASS |
| 4 | Lima One Capital | confidence 76 ✓, $2M cap (NOT $5M — v11.1 fix) ✓, AirDNA STR program (AIRDNA_PROJECTION incomeMethod) ✓, ~3 weeks realistic close (in notes) ✓ | PASS |
| 5 | Defy Mortgage | confidence 80 ✓, FICO 640 ✓, LTV 85 ✓, DSCR 0.75 ✓ | PASS |
| 6 | Easy Street Capital | confidence 82 ✓, AIRDNA_100_PCT income method ✓, FICO 620 ✓, no min DSCR (0) ✓ | PASS |
| 7 | New Silver | confidence 72 ✓, FICO 660 (NOT 640) ✓, DSCR 0.75 (NOT 0) ✓ | PASS |
| 8 | Deephaven Mortgage | confidence 65 (STALE) ✓, $3.5M ✓, 90% LTV ✓, 660 FICO ✓, gift funds (in reserveRule) ✓ | PASS |
| 9 | Angel Oak | confidence 75 ✓, 680 FICO ✓, non-warrantable condo allowed ✓, STR 75% LTV ✓ | PASS |
| 10 | CoreVest | confidence 68 (DOWNGRADED, <70) ✓, institutional $2M-$50M ✓ | PASS |
| 11 | RCN Capital | confidence 70 ✓, $2.5M ✓, no STR (allowed=false) ✓ | PASS |
| 12 | American Heritage | confidence 65 STABLE ✓, FICO 660 ✓, LTV 85 (@760+ FICO, tiered down) ✓, DSCR 0.75 ✓, 12mo reserves sub-1.0 DSCR ✓, STR 75% projected / 100% documented (25% haircut) ✓, Invest Star program (notes + provenanceDetails) ✓ | PASS |

---

## 3. Structural Integrity Checks (All Lenders)

| Check | Result |
|---|---|
| LENDERS array contains all 12 profiles | ✓ PASS |
| Every lender has `confidenceScore` (1-100) | ✓ PASS (12/12) |
| Every lender has `confidenceBand` (non-empty) | ✓ PASS (12/12) |
| Every lender has `sourceSnapshot` (non-empty) | ✓ PASS (12/12) |
| Every lender has `provenanceDetails` array (≥1 entry) | ✓ PASS (12/12) |
| Every `provenanceDetails` claim has a valid provenance label (VERIFIED_PRIMARY / VERIFIED_SECONDARY / UNVERIFIED) | ✓ PASS (12/12) |
| No lender has `loanAmountMax` > $50M (CoreVest exception at exactly $50M) | ✓ PASS |
| American Heritage has ≥10 `provenanceDetails` entries | ✓ PASS (14 entries) |
| Visio + Lima One have "v11.1 FIX" annotation in `loanAmountMax` (source or notes field) | ✓ PASS (in `notes` sub-field) |
| Counterparty risk table has all 12 lender entries | ✓ PASS (after fix — was missing `corevest` and `rcn_capital`) |

---

## 4. Defects Found & Fixed

### D1 — HIGH: Counterparty risk table missing 2 of 12 lender entries
- **File:** `src/lib/dscr/trueCostEngine.ts` lines 36-107 (pre-fix)
- **Issue:** `COUNTERPARTY_RISK` had only 10 entries (missing `corevest` and `rcn_capital`). When `rankLendersByAEY` looked up these lenders, it fell through to the generic `{continuityScore: 50, flag: 'WATCH'}` fallback (trueCostEngine.ts line 330-336), understating counterparty stability by 20-25 points and triggering a false WATCH flag on every CoreVest/RCN quote.
- **Fix:** Added `corevest` (continuityScore 70, STABLE) and `rcn_capital` (continuityScore 75, STABLE) entries.
- **Severity rationale:** HIGH — would have biased the two-quote rule against CoreVest/RCN and produced incorrect counterparty-risk UI badges on every comparison involving these lenders. Not CRITICAL because the fallback still returned a valid object (no runtime crash), but the data was materially wrong.

### D2 — MEDIUM: Stale test expectations in `scripts/audit_v7_strict_lenders.ts` (4 failing checks)
- **Issue:** The strict-lenders audit script still asserted the OLD (pre-v11.1) values:
  - `griffin-20m` expected `$20M` — v11.1 spec confirmed `$4M` (the $20M figure was UNVERIFIED per spec Part I + Part N)
  - `deephaven-confidence` expected `≥70` — v11.1 spec downgraded to `65` (STALE)
  - `ns-fico` expected `640` — v11.1 spec confirmed `660` per spec Part I
  - `ns-dscr` expected `0` — v11.1 spec confirmed `0.75` per spec Part I
- **Fix:** Updated all 4 stale expectations to match v11.1 spec. Tests now 40/40 PASS (was 36/40).
- **Severity rationale:** MEDIUM — the lender profiles were correct (v11.1 fixes were properly applied in lenders.ts); only the test assertions were stale. The script would have failed CI on every run, masking any real regression.

### D3 — MEDIUM: Stale test expectations in `scripts/audit_v7_full.ts` (2 failing checks, MN PPP)
- **Issue:** The full audit script still asserted the OLD (pre-AUDIT-3) values:
  - `p2-mn-1` expected `PRACTICALLY_PROHIBITED` — AUDIT-3 #1/#2 migrated MN to `CONDITIONAL` per HF 3437 (eff. Aug 1, 2026)
  - `p2-mn-2` expected bare `Minn. Stat. § 58.137` — actual value is `Minn. Stat. § 58.137 (as amended by HF 3437, eff. Aug 1, 2026)`
- **Fix:** Updated both expectations to match the v11.1 MN/HF 3437 fix. Tests now 73/73 PASS (was 71/73).
- **Severity rationale:** MEDIUM — out of strict lender scope (PPP-related), but blocking the required `npx tsx scripts/audit_v7_full.ts` PASS requirement.

---

## 5. No Defects (Spec-Compliant Items Verified)

The following v11.1 fixes were ALREADY correctly applied in lenders.ts and required no further changes:
- Griffin `loanAmountMax` = $4M UNVERIFIED (was $20M VERIFIED_PRIMARY) — line 126
- Deephaven `confidenceScore` = 65 STALE (was 78) — line 576
- New Silver `minFICO` = 660 (was 640) — line 514
- New Silver `minDSCR` = 0.75 (was 0) — line 516
- Visio `loanAmountMax` = $2M with "v11.1 FIX (AUDIT-10 issue 5)" annotation — line 270
- Lima One `loanAmountMax` = $2M with "v11.1 FIX (AUDIT-10 issue 7)" annotation — line 337
- American Heritage profile present (lines 845-913), 14 provenanceDetails entries (≥10 spec)
- CoreVest `loanAmountMax` = $50M (institutional exception, not violating $50M cap)
- Visio `vacancyTreatment` = NONE — line 279
- Visio STR `maxLTVForSTR` = 75 (NOT 80) — line 265
- Visio Flex 0.75 UNVERIFIED (downgraded) — line 255
- Easy Street `strPolicy.incomeMethod` = AIRDNA_100_PCT — line 460
- Kiavi `noRatioAvailable.provenance` = UNVERIFIED — line 185
- RCN Capital `strPolicy.allowed` = false — line 787
- Angel Oak `propertyTypeRules.CONDO_NON_WARRANTABLE.allowed` = true — line 668
- American Heritage `reserveRule` mentions 12mo PITIA when DSCR<1.0 — line 861

---

## 6. Test Suite Results

| Suite | Before Fix | After Fix |
|---|---|---|
| `scripts/verify_v11.ts` | 53/53 PASS | 53/53 PASS (no regression) |
| `scripts/audit_v7_strict_lenders.ts` | 36/40 PASS (4 stale-assertion failures) | **40/40 PASS** |
| `scripts/audit_v7_full.ts` | 71/73 PASS (2 stale MN-PPP failures) | **73/73 PASS** |
| `scripts/audit_final_2_lenders_runner.ts` (new) | — | **205/205 PASS** |

TypeScript compilation of `lenders.ts` and `trueCostEngine.ts`: 0 errors.

---

## 7. VERDICT: ✅ PASS

All 12 lender profiles match the v11.1 spec exactly. Counterparty risk table now contains all 12 lender entries (was missing `corevest` and `rcn_capital` — fixed). Two stale audit scripts updated to reflect v11.1 spec values (Griffin $4M, Deephaven 65, New Silver FICO 660/DSCR 0.75, MN CONDITIONAL/HF 3437). All 4 test suites pass (53 + 40 + 73 + 205 = 371 total checks). No CRITICAL defects. One HIGH defect (counterparty table) fixed. Two MEDIUM defects (stale test assertions) fixed.

**Recommendation:** Ship. Lender database is spec-compliant and ready for production release.
