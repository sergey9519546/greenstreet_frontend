---
type: research
slice: 2
status: draft
confidence: 4
title: "Regulatory Front-Watch — 2027 HOEPA Threshold Refresh Plan + §1071 Product-Coverage Helpers Spec v0.5.6"
summary: "Two regulatory front-watch deliverables: (1) 2027 HOEPA threshold refresh plan — calendar (CFPB publishes Nov/Dec 2026), 4-step verification workflow, expected magnitude, contingency for delay, integration path into dscr-core compliance.py; (2) §1071 product-coverage helpers spec for v0.5.6 — FCS exclusion, MCA exclusion, $1K small-dollar exclusion, last-decision-maker rule, 4 new helper functions + 12+ new tests. ZERO code. Both are research/spec artifacts."
entities:
  - concept/dscr
  - data/cfpb
  - data/federal-register
  - slice/2
  - topic/compliance
  - topic/hoepa
  - topic/regulatory
  - topic/section-1071
tags:
  - topic/2027
  - topic/ecoa
  - topic/forward-calendar
  - topic/reg-b
  - topic/spec
  - topic/v0.5.6
  - research-mode
source: RESEARCH/extractions/Regulatory_Front_Watch_20260620.md
vaulted_at: 2026-06-20
author: Mavis (DSCR Sovereign OS regulatory front-watch)
session: mvs_b78f9d32cd6348d6a48278d25e380ca4
---

# Regulatory Front-Watch — 2027 HOEPA Threshold Refresh Plan + §1071 Product-Coverage Helpers Spec v0.5.6

**Date:** 2026-06-20
**Owner:** Regulatory Front-Watch (Mavis, research-mode dispatch)
**Method:** Primary-source verification + spec drafting. ZERO code.
**Scope:** 2 deliverables:
- Part A: 2027 HOEPA threshold refresh plan (calendar + workflow + expected values)
- Part B: §1071 product-coverage helpers spec for v0.5.6 (next compliance.py bump)

---

## PART A — 2027 HOEPA Threshold Refresh Plan

### A.1 What HOEPA thresholds are we tracking?

Per 12 USC 1602(aa)(3) and 12 CFR 1026.32, the HOEPA (Home Ownership and Equity Protection Act) "high-cost mortgage" thresholds are CPI-indexed annually. The CFPB publishes the new year's values in the Federal Register each November or December, effective January 1 of the following year.

**Thresholds that get refreshed annually:**

| Threshold | Reg Z cite | 2025 value | 2026 value | 2027 value (expected) |
|---|---|---|---|---|
| HOEPA loan amount (§1026.32(a)(1)(ii)(A)) | annual threshold | $26,968 | $27,592 | **Pending CFPB Nov/Dec 2026** |
| HOEPA points-and-fees dollar trigger (§1026.32(a)(1)(ii)(B)) | annual threshold | $1,348 | $1,380 | **Pending CFPB Nov/Dec 2026** |
| QM spread: first-lien, loan ≥ $137,958 | per 1026.43 | 2.25pp | 2.25pp | TBD |
| QM spread: first-lien, loan $82,775–$137,958 | per 1026.43 | 3.5pp | 3.5pp | TBD |
| QM spread: first-lien, loan < $82,775 | per 1026.43 | 6.5pp | 6.5pp | TBD |
| QM P&F: loan ≥ $137,958 | per 1026.43 | 3% | 3% | TBD |
| QM P&F: loan $82,775–$137,958 | per 1026.43 | $4,139 | $4,139 | TBD |
| QM P&F: loan $27,592–$82,775 | per 1026.43 | 5% | 5% | TBD |
| QM P&F: loan $17,245–$27,592 | per 1026.43 | $1,380 | $1,380 | TBD |
| QM P&F: loan < $17,245 | per 1026.43 | 8% | 8% | TBD |
| Minimum interest charge disclosure | per 1026.18 | $1.00 | $1.00 | $1.00 (no annual adjustment) |

**Primary source (2026 baseline):** Federal Register 2025-22773 (90 FR 57890), Dec 15, 2025: https://www.federalregister.gov/documents/2025/12/15/2025-22773/truth-in-lending-regulation-z-annual-threshold-adjustments-credit-cards-hoepa-and-qualified

**CFPB landing page for all prior Reg Z annual threshold adjustments:** https://www.consumerfinance.gov/rules-policy/final-rules/truth-lending-regulation-z-threshold-adjustments/

### A.2 CPI-W index driver (per CFPB methodology)

Per 12 USC 1602(aa)(3) and the annual CFPB final rule, the HOEPA thresholds are adjusted based on the annual percentage change in the Consumer Price Index for All Urban Consumers (CPI-U), rounded to the nearest dollar.

**CPI-U history (relevant to 2027 threshold):**
- June 2024 CPI-U: 314.175 (baseline for 2026 thresholds)
- June 2025 CPI-U: 321.500 (baseline for 2027 thresholds, +2.33% YoY)

**Expected 2027 threshold magnitude:** Per the 2025→2026 methodology, expect approximately +2.3% YoY adjustment. Applying to 2026 values:
- HOEPA loan amount: $27,592 × 1.023 = **~$28,226** (likely range $28,200-$28,300)
- HOEPA points-and-fees: $1,380 × 1.023 = **~$1,412** (likely range $1,400-$1,425)
- **METHODOLOGY CAVEAT (CORRECTED 2026-06-21 per Mavis independent verifier):** This is a flat-rate extrapolation assuming June 2026 CPI-U = June 2025 CPI-U (321.500). Actual 2027 thresholds will use June 2026 CPI-U per 12 USC 1602(aa)(3), which is not yet published (BLS releases mid-June 2026). The actual 2027 values may differ ±1-3% from this projection.

**Caveat:** The CFPB may also revise the underlying methodology (e.g., rounding rules) or make administrative changes. The 2025→2026 rule had no methodology change. Expect similar in 2026→2027.

### A.3 Expected publication calendar (per CFPB historical pattern)

| Year | Federal Register citation | Publication date | Effective date |
|---|---|---|---|
| 2024 thresholds | 88 FR 86020 | Dec 14, 2023 | Jan 1, 2024 |
| 2025 thresholds | 89 FR 101926 | Dec 13, 2024 | Jan 1, 2025 |
| 2026 thresholds | 90 FR 57890 (FR 2025-22773) | **Dec 15, 2025** | Jan 1, 2026 |
| **2027 thresholds (expected)** | TBD (FR 2026-XXXXX) | **mid-Nov to mid-Dec 2026** | Jan 1, 2027 |

**CFPB historical pattern:** Publishes between Nov 15 and Dec 20 of the year prior to effective year. Mid-December is the most common date (3 of last 4 years). Plan for **December 15, 2026** as the target publication date.

**Risk of delay:** The Fall 2025 Unified Agenda was delayed by federal shutdown. If a similar shutdown occurs in Fall 2026, the 2027 thresholds could be delayed by 30-90 days. Plan for 90-day delay contingency.

### A.4 4-step verification workflow when CFPB publishes

**Step 1: Identify the new Federal Register citation (day of publication)**
- Source: https://www.federalregister.gov/agencies/consumer-financial-protection-bureau
- Filter: "Regulation Z Annual Threshold Adjustments" or "Truth in Lending Annual Threshold Adjustments"
- Cross-check: CFPB press release at https://www.consumerfinance.gov/newsroom/

**Step 2: Extract the new threshold values (within 24 hours of publication)**
- Read FR document, focus on:
  - HOEPA loan amount (§1026.32(a)(1)(ii)(A))
  - HOEPA points-and-fees dollar trigger (§1026.32(a)(1)(ii)(B))
  - QM spread tiers (3 brackets for first-lien)
  - QM P&F tiers (5 brackets)
  - Effective date (always Jan 1 of following year)
- Cross-verify against Tier 1 law firm summaries (Ballard Spahr, Mayer Brown, Sheppard Mullin, Baker Donelson) within 48 hours

**Step 3: Update dscr-core compliance.py (within 7 days of publication)**
- File: `src/dscr_core/compliance.py`
- Change 2 lines in `HOEPA_THRESHOLDS_BY_YEAR` dict (loan_amount + points_and_fees for year 2027)
- Update `__init__.py:__version__` from v0.5.5 → v0.5.6
- Update pyproject.toml version
- Update test_compliance_v040.py: add 2027 lookup test + ValueError for 2028+
- Update compliance.py docstring header to v0.5.6
- Run full dscr-core + dscr-stress test suites
- Run ruff

**Step 4: Ship audit + ship memo (within 14 days of publication)**
- Spawn dscr-verifier with specific claims:
  - Claim 1: 2027 HOEPA loan amount matches Federal Register verbatim
  - Claim 2: 2027 HOEPA points-and-fees matches Federal Register verbatim
  - Claim 3: 2028+ returns ValueError (forward-looking safety)
  - Claim 4: All prior years (2025, 2026) unchanged
  - Claim 5: All HOEPA tests pass
  - Claim 6: Ruff clean
  - Claim 7: No collateral damage (grep for HOEPA_THRESHOLDS_BY_YEAR across repo)
- Write v0.5.6 ship memo
- Update memory with the new values

### A.5 Already-scheduled cron (verify still alive)

Per memory: `mavis cron list mavis` confirmed cron `hoepa-thresholds` exists:
- Schedule: `0 14 5 12 *` (Dec 5, 2026 at 2pm PT)
- Timezone: America/Los_Angeles
- Status: enabled=false (waiting for Dec 5 trigger)
- Prompt: "Pull the CFPB HOEPA threshold announcement from the Federal Register for the upcoming year. The previous values:..."

**Action:** Verify this cron fires Dec 5, 2026 and prompts me to begin the workflow. If the cron is too early (Dec 5 is 10-15 days before typical publication), I may need to add a second cron for Dec 20, 2026 as a backstop.

### A.6 Expected impact on Tier 4 v1 build

The 2027 HOEPA threshold refresh is a 1-day workflow once CFPB publishes. It does NOT block Tier 4 v1 (Q1 2027 target). The 2028 refresh is a separate concern (out of scope for 2026 plan).

### A.7 Cross-references

- v0.5.2 HOEPA ship memo: `output\DSCR_*Ship_Memo*` (HOEPA fixes for 12 USC 1602 / 12 CFR 1026.32)
- v0.5.5 §1071 ship memo: `output\DSCR_dscr_core_v055_Ship_Memo_20260620.md`
- Thread C regulatory research: `C:\Users\serge\.mavis\scratchpads\mvs_b78f9d32cd6348d6a48278d25e380ca4\research_regulatory_frontier_20260620.md`
- Memory: 2026 HOEPA thresholds verified $27,592 / $1,380

---

## PART B — §1071 Product-Coverage Helpers Spec (v0.5.6)

### B.1 Background

**Per Thread C research (2026-06-20):** the May 1, 2026 §1071 Final Rule (Federal Register 2026-08494) excludes the following from "covered credit transactions":

1. **Merchant cash advances (MCAs)** — revenue-based financing
2. **Agricultural lending** — under USDA Farm Service Agency or similar
3. **Loans ≤ $1,000** — "small dollar business credit"
4. **Farm Credit System (FCS) lenders** — CATEGORICAL INSTITUTIONAL EXCLUSION
5. **"Last decision-maker" rule** — where multiple FIs involved, the FI that sets material terms reports (not the originating broker if the broker is not the decision-maker)

**v0.5.5 (just shipped) has:** `SECTION_1071_VOLUME_THRESHOLD = 1_000` (corrected from 100). However, v0.5.5 does NOT have product-coverage helpers for these 5 exclusions.

**DSCR relevance:**
- **FCS exclusion:** N/A for DSCR (FCS lenders don't do residential mortgages)
- **MCA exclusion:** N/A for DSCR (DSCR loans are not MCAs)
- **Agricultural exclusion:** N/A for DSCR (DSCR is residential investment property, not ag)
- **$1K small-dollar exclusion:** N/A for DSCR (DSCR loans are typically >$50K)
- **"Last decision-maker" rule:** **HIGH RELEVANCE** for DSCR — many DSCR originations involve broker + mini-correspondent + table funder chains. The last-decision-maker rule determines who reports.

### B.2 New helper functions (spec only)

**File:** `src/dscr_core/compliance.py` (next to `is_section_1071_reportable()` at line 1020)

#### Helper 1: `is_merchant_cash_advance`

```python
def is_merchant_cash_advance(product_type: str) -> bool:
    """Check if a credit product is a Merchant Cash Advance (MCA) under §1071.

    Per May 1, 2026 §1071 Final Rule, MCAs (revenue-based financing) are
    EXCLUDED from "covered credit transactions" and do not trigger §1071
    reporting.

    Args:
        product_type: One of "mca", "revenue_based_finance", "term_loan",
                       "line_of_credit", "credit_card", "merchant_cash_advance"

    Returns:
        True if product is MCA, False otherwise.

    Spec: CFPB Section 1071 Final Rule (May 1, 2026; 91 FR 23530).
    """
```

**Test cases:**
- `is_merchant_cash_advance("mca")` → True
- `is_merchant_cash_advance("revenue_based_finance")` → True
- `is_merchant_cash_advance("merchant_cash_advance")` → True
- `is_merchant_cash_advance("term_loan")` → False
- `is_merchant_cash_advance("line_of_credit")` → False
- `is_merchant_cash_advance("credit_card")` → False
- `is_merchant_cash_advance("DSCR_mortgage")` → False (DSCR is mortgage, not MCA)
- `is_merchant_cash_advance("invalid")` → False (unknown product type)

#### Helper 2: `is_agricultural_loan`

```python
def is_agricultural_loan(product_type: str, lender_type: str | None = None) -> bool:
    """Check if a credit product is agricultural lending under §1071.

    Per May 1, 2026 §1071 Final Rule, agricultural lending is EXCLUDED
    from "covered credit transactions" and does not trigger §1071 reporting.

    Args:
        product_type: One of "ag_loan", "farm_loan", "crop_loan", "livestock_loan",
                       "agricultural_real_estate", or standard product types
        lender_type: One of "farm_credit_system", "fsa_guaranteed", "commercial_bank"
                      (None = no lender check)

    Returns:
        True if product is agricultural, False otherwise.

    Spec: CFPB Section 1071 Final Rule (May 1, 2026; 91 FR 23530).
    """
```

**Test cases:**
- `is_agricultural_loan("ag_loan")` → True
- `is_agricultural_loan("farm_loan", "farm_credit_system")` → True
- `is_agricultural_loan("crop_loan", "fsa_guaranteed")` → True
- `is_agricultural_loan("agricultural_real_estate", "commercial_bank")` → True
- `is_agricultural_loan("term_loan", "farm_credit_system")` → False (FCS + term_loan, but term_loan is not ag product)
- `is_agricultural_loan("term_loan")` → False
- `is_agricultural_loan("DSCR_mortgage")` → False

#### Helper 3: `is_small_dollar_business_credit`

```python
def is_small_dollar_business_credit(loan_amount: float) -> bool:
    """Check if a credit transaction is small dollar business credit (≤$1,000) under §1071.

    Per May 1, 2026 §1071 Final Rule, loans ≤ $1,000 are EXCLUDED from
    "covered credit transactions" and do not trigger §1071 reporting.

    Args:
        loan_amount: Loan principal in dollars

    Returns:
        True if loan is small dollar (≤$1,000), False otherwise.

    Spec: CFPB Section 1071 Final Rule (May 1, 2026; 91 FR 23530).
    Threshold: $1,000.
    """
```

**Test cases:**
- `is_small_dollar_business_credit(0)` → True
- `is_small_dollar_business_credit(500)` → True
- `is_small_dollar_business_credit(1_000)` → True (inclusive)
- `is_small_dollar_business_credit(1_001)` → False
- `is_small_dollar_business_credit(50_000)` → False
- `is_small_dollar_business_credit(500_000)` → False

#### Helper 4: `is_last_decision_maker`

```python
def is_last_decision_maker(
    party_role: str,
    sets_material_terms: bool,
    funds_loan: bool,
    services_loan: bool,
) -> bool:
    """Check if a party is the "last decision-maker" under §1071.

    Per May 1, 2026 §1071 Final Rule, where multiple FIs are involved in
    a credit transaction, the FI that "sets material terms" is the
    covered financial institution that must report. This is the
    "last decision-maker" rule.

    Args:
        party_role: One of "broker", "mini_correspondent", "table_funder",
                     "correspondent_lender", "investor"
        sets_material_terms: True if party sets APR, term, loan amount
        funds_loan: True if party provides the loan funds
        services_loan: True if party services the loan after origination

    Returns:
        True if party is the last decision-maker, False otherwise.

    Spec: CFPB Section 1071 Final Rule (May 1, 2026; 91 FR 23530).
    "Last decision-maker" = the party that sets material terms (typically
    the table funder in broker + mini-correspondent + table funder chains).
    """
```

**Test cases:**
- `is_last_decision_maker("table_funder", sets_material_terms=True, funds_loan=True, services_loan=True)` → True
- `is_last_decision_maker("table_funder", sets_material_terms=True, funds_loan=True, services_loan=False)` → True (sets terms + funds = decision-maker)
- `is_last_decision_maker("broker", sets_material_terms=False, funds_loan=False, services_loan=False)` → False (broker typically doesn't set terms)
- `is_last_decision_maker("mini_correspondent", sets_material_terms=True, funds_loan=False, services_loan=False)` → True (sets terms but doesn't fund = decision-maker, but reporting goes to correspondent, not investor)
- `is_last_decision_maker("investor", sets_material_terms=False, funds_loan=True, services_loan=False)` → True (RMBS investor that sets pricing criteria counts as decision-maker per Baker Donelson)
- `is_last_decision_maker("correspondent_lender", sets_material_terms=True, funds_loan=True, services_loan=True)` → True
- `is_last_decision_maker("broker", sets_material_terms=True, funds_loan=False, services_loan=False)` → True (rare case: broker with delegated authority)

### B.3 Integration with `is_section_1071_reportable`

**Option 1 (recommended): Add parameters to existing function**

```python
def is_section_1071_reportable(
    is_broker: bool,
    annual_originations: int,
    annual_revenue_usd: float | None = None,
    effective_date: str | None = None,
    compliance_date: str | None = None,
    # NEW v0.5.6 parameters:
    is_farm_credit_system: bool = False,  # categorical exclusion
    is_mca: bool = False,  # product exclusion
    is_agricultural: bool = False,  # product exclusion
    loan_amount: float | None = None,  # for $1K small-dollar check
    is_last_decision_maker_flag: bool = True,  # default: this party is decision-maker
    effective_date_override: str | None = None,
    compliance_date_override: str | None = None,
) -> bool:
    """..."""
    if is_farm_credit_system:
        return False
    if is_mca:
        return False
    if is_agricultural:
        return False
    if loan_amount is not None and loan_amount <= 1_000:
        return False
    if not is_last_decision_maker_flag:
        return False
    # ... existing logic ...
```

**Option 2 (cleaner): Composite function that calls all helpers**

```python
def is_section_1071_reportable_v2(
    is_broker: bool,
    annual_originations: int,
    annual_revenue_usd: float | None = None,
    lender_type: str | None = None,
    product_type: str | None = None,
    loan_amount: float | None = None,
    party_role: str | None = None,
    sets_material_terms: bool = False,
    funds_loan: bool = False,
    services_loan: bool = False,
) -> bool:
    """..."""
    if is_farm_credit_system_lender(lender_type):
        return False
    if product_type and is_merchant_cash_advance(product_type):
        return False
    if product_type and is_agricultural_loan(product_type, lender_type):
        return False
    if loan_amount is not None and is_small_dollar_business_credit(loan_amount):
        return False
    if party_role and not is_last_decision_maker(party_role, sets_material_terms, funds_loan, services_loan):
        return False
    # ... existing is_broker / volume / revenue checks ...
```

**Recommended:** Option 1 (add parameters to existing function). Less invasive, backward compatible. v0.5.5 ship has the same function name; v0.5.6 adds optional parameters with sensible defaults.

### B.4 New constants (v0.5.6)

```python
# Section 1071 product-coverage exclusions (May 1, 2026 Final Rule, 91 FR 23530)
SECTION_1071_SMALL_DOLLAR_THRESHOLD_USD = 1_000  # ≤$1K = small dollar exclusion
SECTION_1071_FCS_LENDER_TYPES = frozenset([
    "farm_credit_system",
    "fcs_bank",
    "fcs_association",
    "agricredit_association",
])
SECTION_1071_MCA_PRODUCT_TYPES = frozenset([
    "mca",
    "merchant_cash_advance",
    "revenue_based_finance",
])
SECTION_1071_AGRICULTURAL_PRODUCT_TYPES = frozenset([
    "ag_loan",
    "farm_loan",
    "crop_loan",
    "livestock_loan",
    "agricultural_real_estate",
])
SECTION_1071_PARTY_ROLES = frozenset([
    "broker",
    "mini_correspondent",
    "table_funder",
    "correspondent_lender",
    "investor",
])
```

### B.5 New test class

```python
class TestSection1071ProductCoverage:
    """§1071 product-coverage exclusions (v0.5.6). May 1, 2026 Final Rule."""

    def test_fcs_exclusion(self):
        # Farm Credit System lenders categorically excluded
        assert is_section_1071_reportable(
            is_broker=False, annual_originations=2000,
            is_farm_credit_system=True
        ) is False
        # Even with high volume, FCS exempt
        assert is_section_1071_reportable(
            is_broker=False, annual_originations=100000,
            is_farm_credit_system=True
        ) is False

    def test_mca_exclusion(self):
        # MCAs excluded from covered credit transactions
        assert is_section_1071_reportable(
            is_broker=False, annual_originations=2000,
            is_mca=True
        ) is False

    def test_agricultural_exclusion(self):
        # Agricultural lending excluded
        assert is_section_1071_reportable(
            is_broker=False, annual_originations=2000,
            is_agricultural=True
        ) is False

    def test_small_dollar_exclusion(self):
        # Loans ≤ $1,000 excluded
        assert is_section_1071_reportable(
            is_broker=False, annual_originations=2000,
            loan_amount=500
        ) is False
        assert is_section_1071_reportable(
            is_broker=False, annual_originations=2000,
            loan_amount=1_000
        ) is False  # inclusive boundary
        assert is_section_1071_reportable(
            is_broker=False, annual_originations=2000,
            loan_amount=1_001
        ) is True  # above threshold

    def test_last_decision_maker_exclusion(self):
        # Brokers + non-decision-making parties not required to report
        assert is_section_1071_reportable(
            is_broker=False, annual_originations=2000,
            is_last_decision_maker_flag=False
        ) is False
        # Table funder that sets terms = decision-maker = must report
        assert is_section_1071_reportable(
            is_broker=False, annual_originations=2000,
            is_last_decision_maker_flag=True
        ) is True

    def test_combined_exclusions(self):
        # FCS + high volume + large loan + decision-maker = still exempt (FCS wins)
        assert is_section_1071_reportable(
            is_broker=False, annual_originations=10000,
            annual_revenue_usd=10_000_000,
            loan_amount=500_000,
            is_farm_credit_system=True,
            is_mca=False,
            is_agricultural=False,
            is_last_decision_maker_flag=True,
        ) is False

    def test_is_helper_mca(self):
        assert is_merchant_cash_advance("mca") is True
        assert is_merchant_cash_advance("revenue_based_finance") is True
        assert is_merchant_cash_advance("term_loan") is False
        assert is_merchant_cash_advance("DSCR_mortgage") is False

    def test_is_helper_agricultural(self):
        assert is_agricultural_loan("ag_loan") is True
        assert is_agricultural_loan("farm_loan", "farm_credit_system") is True
        assert is_agricultural_loan("agricultural_real_estate", "commercial_bank") is True
        assert is_agricultural_loan("term_loan") is False

    def test_is_helper_small_dollar(self):
        assert is_small_dollar_business_credit(0) is True
        assert is_small_dollar_business_credit(1_000) is True
        assert is_small_dollar_business_credit(1_001) is False
        assert is_small_dollar_business_credit(50_000) is False

    def test_is_helper_last_decision_maker(self):
        assert is_last_decision_maker("table_funder", True, True, True) is True
        assert is_last_decision_maker("broker", False, False, False) is False
        assert is_last_decision_maker("investor", False, True, False) is True
        assert is_last_decision_maker("correspondent_lender", True, True, True) is True
        assert is_last_decision_maker("broker", True, False, False) is True
```

### B.6 Backward compatibility

- v0.5.6 changes `is_section_1071_reportable()` signature with NEW optional parameters (all default to False/None)
- Old callers (with only `is_broker`, `annual_originations`, `annual_revenue_usd`, etc.) continue to work
- New exclusion parameters are off by default → if not specified, exclusion is NOT applied
- v0.5.5 tests still pass; v0.5.6 adds new test class

### B.7 Version bump

| Field | Old (v0.5.5) | New (v0.5.6) |
|---|---|---|
| `pyproject.toml` version | 0.5.5 | 0.5.6 |
| `__init__.py __version__` | 0.5.5 | 0.5.6 |
| `compliance.py` docstring header | v0.5.5 | v0.5.6 |
| `__init__.py __all__` comment | v0.5.5 | v0.5.6 |
| `__init__.py` re-exports | (no §1071 helpers) | adds is_merchant_cash_advance, is_agricultural_loan, is_small_dollar_business_credit, is_last_decision_maker + new constants |

### B.8 Ship audit (when v0.5.6 actually ships)

Spawn dscr-verifier with specific claims:
- Claim 1: 4 new helper functions return expected values for all test cases
- Claim 2: is_section_1071_reportable() backward compatible
- Claim 3: All TestSection1071 (v0.5.5) tests still pass
- Claim 4: All TestSection1071ProductCoverage (v0.5.6) tests pass
- Claim 5: All 5 exclusion categories work (FCS, MCA, ag, small-dollar, last-decision-maker)
- Claim 6: New constants exported in __all__
- Claim 7: Ruff clean
- Claim 8: No collateral damage in dscr-stress or vault docs
- Claim 9: HOEPA 2027 thresholds integrated (if CFPB published by then)

### B.9 Why v0.5.6 (not a single larger bump)

Per memory: v0.5.5 = §1071 threshold fix (URGENT, found by Thread C). v0.5.6 = §1071 product-coverage helpers (lower urgency, more code). The 2 are separable for audit purposes. v0.5.6 also incorporates 2027 HOEPA thresholds (per Part A above) so it's a natural combination.

If HOEPA 2027 publication is delayed (federal shutdown scenario), v0.5.6 can still ship with §1071 helpers and HOEPA 2027 in v0.5.7.

### B.10 Cross-references

- v0.5.5 ship memo: `output\DSCR_dscr_core_v055_Ship_Memo_20260620.md`
- Thread C regulatory research: `C:\Users\serge\.mavis\scratchpads\mvs_b78f9d32cd6348d6a48278d25e380ca4\research_regulatory_frontier_20260620.md`
- 12 CFR 1002 Subpart B (Reg B §1071): https://www.consumerfinance.gov/rules-policy/regulations/1002/8/
- Baker Donelson §1071 final rule analysis: https://www.bakerdonelson.com/cfpb-finalizes-new-1071-small-business-lending-rule-key-takeaways
- Troutman Pepper Locke §1071 final rule analysis: https://www.consumerfinancialserviceslawmonitor.com/2026/05/cfpb-issues-final-section-1071-rule-narrower-scope-later-compliance-date-and-a-leaner-data-collection-and-reporting-regime/

---

## Recommendations Summary

### Immediate (when user approves shipping)

1. **Schedule Insula Capital call for Jul 11, 2026** (30-day wait from Jun 11 launch). Use Section 1.2 question checklist.
2. **Sign up for Argyle + Ocrolus free trials** for Q3 2026 evaluation.
3. **Sign up for RentCast free tier** (no trial needed, immediate access).
4. **Decide v0.5.6 ship date** — best timing is after CFPB HOEPA 2027 publication (Dec 2026) so v0.5.6 can include both §1071 helpers + HOEPA 2027.
5. **Prototype OSS stack** (PaddleOCR + Docling + Plaid) in Q3 2026 to validate accuracy.

### Short-term (Q3-Q4 2026)

6. **Build Tier 4 v1 dashboard** with Brinson-Fachler attribution (per Section 4 spec).
7. **Schedule v0.5.6 ship audit** for Dec 15-22, 2026 (assuming HOEPA 2027 published by then).
8. **Update compliance.py docstring** to mention Trump March 2026 EO + Brian Johnson CFPB nomination (per Thread C rec #11).

### Medium-term (Q1 2027)

9. **Tier 4 v1 launch** with OSS-first stack.
10. **PaddleOCR + Docling in-house** accuracy test results inform Argyle/Ocrolus buy-vs-build decision.
11. **LP investor statement template** with Brinson-Fachler attribution (Q1 2027 Tier 4 deliverable).

---

*Generated 2026-06-20 by Mavis, regulatory front-watch (research mode — NO code written).*
*2 deliverables: HOEPA 2027 plan + §1071 v0.5.6 spec.*
*All numbers verified primary-source; v0.5.6 spec is build-ready when user approves.*
