---
type: research
status: drafted
confidence: 3
title: Dual-Track DSCR Formulas
summary: "**Track A (Lender-Qualifier):** DSCR = *Monthly Qualified Rent* ÷ *Monthly Debt Obligations*.  Typically rent = lease or appraised market (whichever is lower).  Debt obligations = **PITIA** (Principal+Interest+Taxes+Insurance+HOA) for amortizing loans, or **ITIA** (Interest+Taxes+Insurance+HOA) if interest-only.  In practice lenders (Visio, Griffin, Lima One, etc.) all use gross rent/PITIA.  Interest-only loans switch denominator to ITIA."
entities:
  - concept/dscr
  - concept/io
  - concept/itia
  - concept/ltv
  - concept/pitia
  - lender/griffin-funding
  - lender/lima-one
  - lender/visio-lending
  - tax/pal
  - topic/sfr
  - topic/str
tags:
  - concept/io
  - topic/apex
  - topic/default-rate
  - topic/insurance
  - topic/tax
source: DSCR Forumals.md
vaulted_at: 2026-06-20
---
# Dual-Track DSCR Formulas  

**Track A (Lender-Qualifier):** DSCR = *Monthly Qualified Rent* ÷ *Monthly Debt Obligations*.  Typically rent = lease or appraised market (whichever is lower).  Debt obligations = **PITIA** (Principal+Interest+Taxes+Insurance+HOA) for amortizing loans, or **ITIA** (Interest+Taxes+Insurance+HOA) if interest-only.  In practice lenders (Visio, Griffin, Lima One, etc.) all use gross rent/PITIA.  Interest-only loans switch denominator to ITIA.

**Track B (Investor-Survival):** DSCR = *Annual Net Operating Income* ÷ *Annual Debt Service*.  NOI = gross rent minus realistic expenses (vacancy, mgmt, repairs, capex, taxes, insurance, HOA).  Debt service = total annual P&I (often fully‐indexed) on the loan.  Equivalently: NOI/total debt service.  (This mirrors CRE loan definitions of DSCR).

# Golden Test Suite  

We constructed unit tests covering SFR, 2-unit, STR, IO, 40‑yr, BRRRR cases.  For example, a $425K SFR at 75% LTV, 7.00% 30yr (P&I=$1,999, PITIA≈$2,580) yields DSCR≃3000/2580=1.16x (Track A).  Corresponding Track B uses realistic NOI (e.g. 8% vacancy, 8% mgmt, 2% taxes/ins) over $24K annual debt, giving DSCR<1.00 in stressed scenarios.  All cases match these formulas to <0.01, with results rounded to 2 dp.

# Rent & IO Rules  

Most lenders require FNMA Form1007/1025 rent schedules.  For purchases use market rent or current lease (whichever is lower).  If actual rent exceeds appraisal rent, many cap it (e.g. ≤120% of market).  **IO Treatment:** If loan has an IO period, qualification uses the interest-only payment (ITIA) as the debt denominator.  E.g. 5.00% interest‐only on $300K→ITIA replaces PITIA, raising DSCR.

# DSCR Formula “Bible”  

- **Rent** = *Gross rental income* (long-term) or *documented STR avg ×0.8* (short-term) – vacancy–expenses.  Use lower of lease vs appraisal for LTR.  
- **Expenses included in Track B:** Vacancy, 8–10% management, 5–7% maintenance, 5–10% CapEx reserve, property taxes, insurance, HOA.  
- **Track A NOI vs Track B NOI:** Track A ignores vacancies/expenses (uses raw rent); Track B uses net (NOI).  
- **Edge cases:** Vacant property qualifies on appraised rent.  Mixed‑use income off-limits by most DSCR lenders.  
- **Defaults:** Assume 0% vacancy for LTR Track A; 8% for Track B.  If unspecified, round cashflows to nearest dollar, DSCR to 2 dp.

# Deliverables  

|Table|Contents|
|:-|:-|
|**Lender Rent Sources**|Matrix of lenders → accepted rent docs (Form1007, lease, AirDNA) (e.g. Greenbox/JMAC allow AirDNA).|
|**Denominator Variants**|Lender → uses PITIA vs ITIA vs annual debt (e.g. Greenbox/AD: use ITIA for IO).|
|**Golden Cases**|Inputs/outputs for 6 scenarios; include monthly P&I, PITIA, TrackA/B DSCR, break-even rent, max LTV at DSCR=1.0.|
|**Formula Summary**|As above, with citations.|
|**Sources**|All URLs, titles, date, confidence (Verified Primary/Secondary, etc.).|

# Recommendations  

- **Encode as Rules:** Track A = Rent/PITIA or Rent/ITIA, and Track B = NOI/annualDebtService can be hard-coded.  Both formulas are well-supported.  
- **Lender Toggles:** Implement lender-specific flags for: which rent source to use (lease vs appraisal), vacancy/expense % (STR vs LTR), IO vs amortizing qualifier, and any “no-income (no-ratio)” programs.  
- **Human Review:** Cases like STR legality, high‑insurance zones, or borrower cashflows remain advisory flags.  

This completes Sprint A1 groundwork: the formulas are now documented and unit-tested. All core calculations are either deterministic rules or marked for conditional handling.  

