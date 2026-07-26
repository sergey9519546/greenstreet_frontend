# Unique Content Review

- Row key: 7f62536059
- Source path: greenstreet_frontend/docs/dscr_loan_office/DSCR Forumals.md
- Archived path: docs/research/_archive/superseded_formula_docs_2026-06-28/docs_research_deep-dives__DSCR_Formulas.md
- Replacement path: docs/research/deep-dives/DSCR_Formulas.md
- Coverage decision: HIGH_RISK_RESTORE_OR_EXTRACT
- Block coverage: 0
- Unique words: 513
- Preliminary classification: REJECTED_FORMULA_RETAIN_QUARANTINE
- Review copy: 00_MOCs\reconciliation_unique_review_verified_2026-06-28\restored_for_review\7f62536059__greenstreet_frontend__docs__dscr_loan_office__DSCR Forumals.md

## Unique Headings
- # Dual-Track DSCR Formulas
- # Golden Test Suite
- # Rent & IO Rules
- # DSCR Formula “Bible”
- # Deliverables
- # Recommendations

## First Unique Blocks

### Block 1
```text
# Dual-Track DSCR Formulas
```

### Block 2
```text
**Track A (Lender-Qualifier):** DSCR = *Monthly Qualified Rent* ÷ *Monthly Debt Obligations*. Typically rent = lease or appraised market (whichever is lower). Debt obligations = **PITIA** (Principal+Interest+Taxes+Insurance+HOA) for amortizing loans, or **ITIA** (Interest+Taxes+Insurance+HOA) if interest-only. In practice lenders (Visio, Griffin, Lima One, etc.) all use gross rent/PITIA. Interest-only loans switch denominator to ITIA.
```

### Block 3
```text
**Track B (Investor-Survival):** DSCR = *Annual Net Operating Income* ÷ *Annual Debt Service*. NOI = gross rent minus realistic expenses (vacancy, mgmt, repairs, capex, taxes, insurance, HOA). Debt service = total annual P&I (often fully‐indexed) on the loan. Equivalently: NOI/total debt service. (This mirrors CRE loan definitions of DSCR).
```

### Block 4
```text
# Golden Test Suite
```

### Block 5
```text
We constructed unit tests covering SFR, 2-unit, STR, IO, 40‑yr, BRRRR cases. For example, a $425K SFR at 75% LTV, 7.00% 30yr (P&I=$1,999, PITIA≈$2,580) yields DSCR≃3000/2580=1.16x (Track A). Corresponding Track B uses realistic NOI (e.g. 8% vacancy, 8% mgmt, 2% taxes/ins) over $24K annual debt, giving DSCR<1.00 in stressed scenarios. All cases match these formulas to <0.01, with results rounded to 2 dp.
```

### Block 6
```text
# Rent & IO Rules
```

### Block 7
```text
Most lenders require FNMA Form1007/1025 rent schedules. For purchases use market rent or current lease (whichever is lower). If actual rent exceeds appraisal rent, many cap it (e.g. ≤120% of market). **IO Treatment:** If loan has an IO period, qualification uses the interest-only payment (ITIA) as the debt denominator. E.g. 5.00% interest‐only on $300K→ITIA replaces PITIA, raising DSCR.
```

### Block 8
```text
# DSCR Formula “Bible”
```

### Block 9
```text
- **Rent** = *Gross rental income* (long-term) or *documented STR avg ×0.8* (short-term) – vacancy–expenses. Use lower of lease vs appraisal for LTR. - **Expenses included in Track B:** Vacancy, 8–10% management, 5–7% maintenance, 5–10% CapEx reserve, property taxes, insurance, HOA. - **Track A NOI vs Track B NOI:** Track A ignores vacancies/expenses (uses raw rent); Track B uses net (NOI). - **Edge cases:** Vacant property qualifies on appraised rent. Mixed‑use income off-limits by most DSCR lenders. - **Defaults:** Assume 0% vacancy for LTR Track A; 8% for Track B. If unspecified, round cashflows to nearest dollar, DSCR to 2 dp.
```

### Block 10
```text
# Deliverables
```

### Block 11
```text
|Table|Contents| |:-|:-| |**Lender Rent Sources**|Matrix of lenders → accepted rent docs (Form1007, lease, AirDNA) (e.g. Greenbox/JMAC allow AirDNA).| |**Denominator Variants**|Lender → uses PITIA vs ITIA vs annual debt (e.g. Greenbox/AD: use ITIA for IO).| |**Golden Cases**|Inputs/outputs for 6 scenarios; include monthly P&I, PITIA, TrackA/B DSCR, break-even rent, max LTV at DSCR=1.0.| |**Formula Summary**|As above, with citations.| |**Sources**|All URLs, titles, date, confidence (Verified Primary/Secondary, etc.).|
```

### Block 12
```text
# Recommendations
```

### Block 13
```text
- **Encode as Rules:** Track A = Rent/PITIA or Rent/ITIA, and Track B = NOI/annualDebtService can be hard-coded. Both formulas are well-supported. - **Lender Toggles:** Implement lender-specific flags for: which rent source to use (lease vs appraisal), vacancy/expense % (STR vs LTR), IO vs amortizing qualifier, and any “no-income (no-ratio)” programs. - **Human Review:** Cases like STR legality, high‑insurance zones, or borrower cashflows remain advisory flags.
```

### Block 14
```text
This completes Sprint A1 groundwork: the formulas are now documented and unit-tested. All core calculations are either deterministic rules or marked for conditional handling.
```
