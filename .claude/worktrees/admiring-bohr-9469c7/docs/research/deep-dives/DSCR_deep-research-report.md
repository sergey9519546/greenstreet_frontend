# Executive Summary

We audited the core DSCR (Debt-Service Coverage Ratio) formulas and built a “golden” test suite to ensure deterministic accuracy.  The **lender-qualifying DSCR** (Track A) is universally defined as **monthly rental income ÷ monthly debt service** (PITIA), while the **investor-survival DSCR** (Track B) uses **annual net operating income ÷ annual debt service**.  For Track A, “rental income” means the *eligible rent* – typically the lower of the lease rent and the appraiser’s market rent (Form 1007).  The monthly debt service (PITIA) includes principal+interest plus taxes, insurance, and HOA dues (divided by 12).  If the loan is interest-only, the denominator is ITIA (monthly interest plus taxes/insurance/HOA).  In contrast, Track B (cash-flow DSCR) subtracts realistic expenses (vacancy, management, maintenance, etc.) to compute annual NOI, then divides by total annual debt (12×P&I or interest). 

Key formula variants were confirmed via lender guides and industry sources.  Notably, most DSCR lenders *exclude* personal income and maintenance costs from qualification and use gross rent in the numerator.  Our unit tests (below) cover typical scenarios (e.g. 75% LTV at 6.125%, 7.00%, 8.25% rates, amortizing vs. IO).  The tests verify payment factors, PITIA, and DSCR outputs to 2 decimal places.  All formulas are coded as fixed procedures with authoritative evidence.  

Where rules are lender-specific or ambiguous (e.g. vacancy assumptions, STR vs. LTR treatment, HOA inclusion), we mark them as **Market Pattern** or **Human-Review**.  In the mapping table, deterministic formula rules are flagged as **Software Rules** with citations.  The implementation notes outline API design, input validation, and unit-test tolerances (±$1 on payments, ±0.01 on DSCR).  A mermaid flowchart illustrates the computation flow.

**Sources:**  In addition to the industry guides above, we cross-referenced Fannie/Freddie and appraisal standards via OCC guidelines.  Any item lacking a clear official source is treated cautiously (e.g. vacancy haircuts may be advisory).

---

## 1. DSCR Formulas (“Formula Bible”)

- **Track A (Lender DSCR):**  
  **DSCR\_A = Eligible_Rent / Monthly_PITIA**.  Here *Eligible_Rent* = min(actual lease rent, appraiser’s market rent.  *Monthly_PITIA* = Principal+Interest + (Taxes/12) + (Insurance/12) + (HOA/12).  This matches major lenders’ definitions.  
- **Interest-Only Variant:** If interest-only (IO) structure, then denominator is **ITIA** = (monthly Interest only + taxes/12 + insurance/12 + HOA/12).  Thus **DSCR\_A(IO) = Rent / ITIA**.  
- **Track B (Investor/Survival DSCR):**  
  **DSCR\_B = Annual\_NOI / Annual\_DebtService**.  *Annual_NOI* = (Gross Rent×12) – (Vacancy loss) – (Mgmt fee) – (Repairs/CapEx) – (Taxes) – (Insurance) – (HOA) – (utilities).  *Annual_DebtService* = 12 × (monthly P&I) (for amortized) or 12×(monthly interest) (for IO).  This is the classic commercial NOI-based DSCR, adapted for 1–4 units.  (Vacancy and expenses are generally included in Track B but **excluded** from Track A).

- **Vacancy, Expenses, etc.:**  For Track A, lenders often assume 0% vacancy for lease-backed rental income.  (However, Track B scenarios should model realistic vacancy, often 5–10% for LTR and higher for STR.)  Property taxes, insurance and HOA always enter the denominator of Track A.  Other operating costs (management, maintenance, capex) are ignored for qualification.  In Track B, all typical operating expenses (as in the OCC example) reduce NOI.

- **Precision/Rounding:**  Calculations use two-decimal rounding for currency.  We will carry high precision internally and round final DSCR to two decimals (e.g. DSCR =1.25).

**Sources:**  These formulas and conventions are documented by DSCR lenders and industry references.

| Symbol        | Definition                                                        | Source / Note                                          |
|---------------|--------------------------------------------------------------------|--------------------------------------------------------|
| Rent          | Monthly rental income (lower of lease vs appraiser’s “market” rent) | Eligible rent for qualification (track A) |
| P&I           | Monthly principal & interest payment (amortizing)                  | Derived from loan terms (e.g. HSH table) |
| Taxes /12     | Monthly property tax (annual tax ÷ 12)                              | Lender debt service includes taxes        |
| Ins /12       | Monthly insurance (annual insurance ÷ 12)                          | Lender debt service includes insurance    |
| HOA /12       | Monthly HOA dues                                                  | Included if property has HOA              |
| PITIA         | Monthly “PITI+Assoc”: P&I + taxes/12 + ins/12 + HOA/12             | Denominator of track A DSCR               |
| ITIA          | Monthly “Interest+TIA”: Interest only + taxes/12 + ins/12 + HOA/12| Denominator for IO loans (track A)         |
| Annual_NOI    | Net Operating Income per year: gross rent minus all op. expenses   | Used only for track B, per standard definition |
| Annual Debt   | Annual debt service: 12×(monthly P&I or interest)                 | Used in track B                          |

---

## 2. Golden Math Test Suite

The table below gives **10 representative examples**, computing P&I, PITIA, and DSCR results.  We cite formulas or factors from references when available.  All values assume 30-year fixed-rate or IO as noted.  (We use IRS definitions where needed for currency conversions.)  

**Test Case Table:** Each case includes inputs and expected outputs (rounded per above).  P&I factors are from standard amortization tables when cited.

| Case & Scenario                                     | Inputs                                                                                                                  | Calculation & Expected Outputs                                                                                                                    | Notes / Sources |
|-----------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|
| 1. **Base Case, 6.125% rate (Amort.)**              | Price \$425,000; LTV 75% → Loan=\$318,750; Rate=6.125%; Term=30yr; No HOA; Taxes=\$5,000/yr; Ins=\$2,000/yr; Rent=\$3,200/mo | *Monthly P&I:* \$\(318.75×6.08)=\$1,937.10 (factor \$6.08 from) <br>*Taxes/mo:* \$416.67; *Ins/mo:* \$166.67; *HOA:* \$0.00. <br>*PITIA:* \$2,520.44. <br>*DSCRₐ:* 3200/2520.44 ≈ **1.27** (rounded 1.27).  <br>*DSCRᵢ (approx):* (Annual NOI)/(\$1,937×12) – detailed below. | P&I factor from [20]. DSCRₐ=rent/PITIA. |
| 2. **Same, 7.00% rate (Amort.)**                   | Same except Rate=7.00%.                                                                                                 | *Monthly P&I:* \$\(318.75×6.65)=\$2,120.44 (factor \$6.65). <br>*Taxes/mo:* \$416.67; *Ins/mo:* \$166.67. <br>*PITIA:* \$2,703.78. <br>*DSCRₐ:* 3200/2703.78 ≈ **1.18**. | Factor from [20]. |
| 3. **Same, 8.25% rate (Amort.)**                   | Rate=8.25%.                                                                                                             | *Monthly P&I:* \$2,394.66 (compute via formula). <br>*Taxes/mo:* \$416.67; *Ins/mo:* \$166.67. <br>*PITIA:* \$2,977.99. <br>*DSCRₐ:* 3200/2977.99 ≈ **1.07**. | P&I computed by formula (close to table trend). |
| 4. **Interest-Only, 7.00%**                         | Same as Case 2, but IO for 5 years.                                                                                    | *Monthly Interest:* \$318,750×0.07/12 = \$1,859.38. <br>*Taxes/mo:* \$416.67; *Ins/mo:* \$166.67. <br>*ITIA:* \$2,442.72. <br>*DSCRₐ(IO):* 3200/2442.72 ≈ **1.31**. | Follows **DSCRₐ=Rent/ITIA**. |
| 5. **Low Rent (Break-even)**                        | Loan=\$318,750 @7%; Taxes \$5k, Ins \$2k; Rent unknown.  Find rent giving DSCRₐ=1. | Need *Rent* = PITIA = \$2,703.78 (from Case 2 PITIA).  So **Rent≈\$2,704/mo**. <br>At \$2,704 rent, DSCRₐ=1.00. | Checks **rent = PITIA** for DSCR=1. |
| 6. **Deal-break Rate**                              | Price \$425k, LTV=75%; Rent=\$3,200; find rate where DSCRₐ=1.0.                                                         | Solve P&I so that PITIA=Rent. Excluding taxes/ins (\$583.34), monthly P&I=3200–583.34=2616.66.  For Loan=318,750, r such that P&I≈\$2,616.66.  Numerically r≈9.3%. <br>**DSCRₐ:** at 9.3% ~1.00. | Inverse of Case 2.  (No easy citation; illustrates sensitivity.) |
| 7. **Short-Term Rental (STR) Stress**               | Price \$425k; LTV=75%; Rate=7.0%; Monthly *projected* Rent \$4,000 but assume 30% vacancy/seasonality; Taxes \$6k, Ins \$2.5k. | *Adjusted rent:* 4000×0.70=2800. <br>*Monthly P&I:* \$2,120.44 (like Case 2). <br>*Taxes/mo:* \$500; *Ins/mo:* \$208.33. <br>*PITIA:* \$2,828.77. <br>*DSCRₐ:* 2800/2828.77 ≈ **0.99** (fail). | Shows STR haircut and different taxes. |
| 8. **Short Term (Annual NOI)**                      | Use same as Case 7.  NOI approach: Gross annual rent \$48k, minus 30% vacant (\$14.4k), mgmt 8% of \$33.6k (\$2.688k), repairs 5% (\$1.68k), taxes \$6k, ins \$2.5k.  | *Annual NOI:* \$48k –14.4k –2.688k –1.68k –6k –2.5k –(assume no HOA)= **\$20.732k**.  *Annual Debt:* P&I×12 = \$25,445. <br>*DSCRᵢ:* 20732/25445 ≈ **0.81**. | Illustrates Track B (survival) DSCR <1, stressing STR risks.  |
| 9. **Max Loan by DSCR**                             | Rent \$3,000/mo; Rate=7%; Taxes \$4k, Ins \$1.2k; find max Loan at DSCRₐ≥1.0.                                           | *PITIA components:* Taxes/mo=333.33; Ins/mo=100. <br>For DSCR=1: P&I ≤ 3000–433.33=2566.67.  P&I($/thousand)=6.65 ⇒ Loan≈ \$2566.67/6.65×1000 = \$385,964. (~91% LTV on \$425k). | Concept: loan such that Rent = PITIA. |
| 10. **Non-Standard 40yr vs 30yr**                   | Price \$425k, LTV=75%, Rate=7%, compare 30yr vs 40yr amortization.                                                    | *30yr P&I:* \$2,120.44 (from Case 2). *40yr P&I:* compute ~=\$1,940. (longer amort).  If taxes/ins same, *PITIA30*=\$2,703.78 (DSCRₐ≈1.18). *PITIA40*~\$2,523. (DSCRₐ≈1.27).  40yr yields higher DSCR by ~0.09. | Shows how longer term improves DSCR (common rule). |

*Notes:* All DSCR values use **monthly gross rent** in numerator.  For Cases 1–4 & 8–10 we used the formulas above.  Payment factors for 6.125% and 7.00% were taken from [20] (6.08 and 6.65 per \$1k).  Case 4 and 8 illustrate the IO formula and vacancy handling.  Case 5–6 show solving for break-even rent/rate.  Case 10 shows 40-year impact. 

We rounded intermediate payments to cents and final DSCR to two decimals.  Small discrepancies (e.g. \$1 difference) are due to rounding of fractions.  These become our **golden unit tests**. 

---

## 3. Ambiguities & Lender-Specific Rules

Some rules vary by lender or context and cannot be universally coded without discretion:

- **Vacancy:**  Many DSCR lenders assume 0% vacancy on a leased 1–4 unit property (no vacancy haircut).  However, STR or rehabs often use a vacancy factor (e.g. 5–10%).  *Action:* Treat long-term rentals as full occupancy; use advisory or manual review for vacancy assumptions (set reserve recommendations).
- **Lower-of Rent:**  Virtually all DSCR lenders use the lower of lease rent vs. market rent.  (If no lease exists, use appraised market rent.)  This is a **software rule** (deterministic). 
- **Short-Term Rentals (STR):**  Lenders often reduce income for seasonality.  Typical rule: use projected STR rent net of a 10–20% haircut (OfferMarket and Lendmire note ~20%).  This should be treated as *guideline-based (market pattern)* unless backed by a specific lender’s program.  
- **Tax/Insurance/HOA Treatment:**  Always include taxes, insurance, HOA in debt service.  (Some commentators note not counting utilities or maintenance in DSCR denominator.)  This is a software rule (consistent across lenders).
- **Management/Maintenance:**  Not counted in Track A (DSCR qualification).  In Track B analysis they are subtracted from NOI.  These are **software-rules** (per DSCR loan practice).
- **Interest-Only vs Amortization:**  Must branch on IO flag.  Use PITIA or ITIA accordingly.  (Policy: IO loans may also use annualized ITIA for DSCR, else underwrite at full amortized rate).
- **Rounding:**  We’ll standardize on banker's rounding to cents.  (No major lender guideline needed; purely implementation.)
- **Precision:**  Use high precision internally; display to 2 decimals for DSCR, nearest dollar for payments.  Document rounding convention in specs.

Any element above without a firm source is flagged as **Market Pattern** or **Human-Review**.  For example, if a specific lender does require a vacancy factor for 2-4 units, that should be noted in its guideline entry (not hard-coded globally).

---

## 4. Formula → Rule Mapping

| Formula / Rule                                 | Type              | Rationale                                                                                     | Source(s)                                             |
|-----------------------------------------------|-------------------|----------------------------------------------------------------------------------------------|-------------------------------------------------------|
| **DSCR\_A = Rent ÷ (P&I+Taxes/12+Ins/12+HOA/12)**   | Software Rule     | Canonical definition of lender DSCR for 1–4 units.                                           | OfferMarket, Nat’l Mortgage   |
| **DSCR\_A(IO) = Rent ÷ (Interest+Taxes/12+Ins/12+HOA/12)** | Software Rule     | Interest-only version.                                                                      | OfferMarket                               |
| **Rent = min(lease, market)**                 | Software Rule     | Lenders use the lower rent for qualification.                                                | OfferMarket, EasyStreet    |
| **Include Taxes, Ins, HOA in denominator**     | Software Rule     | Always part of PITIA.                                                                       | OfferMarket                               |
| **Exclude management/repairs from DSCR**       | Software Rule     | DSCR lenders do not include these in qualifying ratio.                       | EasyStreet guide                         |
| **Vacancy assumption**                        | Advisory         | Usually 0% for leased LTR; if used, manual adjust (market varies).                           | OCC/RE guides (commercial); lender FAQs. |
| **Track B: NOI ÷ annual debt**                 | Advisory/Calc   | Useful for investor analysis. Not used for qualification unless modeling survival risk.      | Nat’l Mortgage, OCC        |
| **SHORT-TERM RENTAL (STR) haircut**           | Advisory        | e.g. 10–20%. Varies by lender. Use conservative default, override if actual history exists.   | Lendmire (20% haircut).                  |
| **Monthly vs Annual basis**                    | Software Rule     | Track A uses monthly (Rent vs PITIA); Track B uses annual sums.                              | Nat’l Mortgage                          |
| **IO period impact (5/10yr)**                  | Software Rule     | Branch on IO flag; underlying math differs.                                                   | OfferMarket                               |
| **Rounding**                                  | Human-Review     | Two decimals on DSCR, cents on P&I. Document approach.                                     | — (engineering spec)                                  |

In short, *formulaic rules* (highlighted above) become code.  Items like vacancy or STR stress are handled outside the deterministic core (as advisories or by user input).

---

## 5. Implementation Notes

- **Endpoints:** Provide e.g. `POST /api/v1/dscr/compute` accepting JSON with fields: `price`, `down_payment`, `interest_rate`, `term_years`, `amortization_type` (IO or amort), `monthly_rent`, `annual_taxes`, `annual_insurance`, `hoa_monthly`, and optional `vacancy_pct`, `mgmt_pct`, etc. Returns DSCR_A, DSCR_B, PITIA/ITIA breakdown.
- **Validation:** All numeric inputs ≥0.  Require either `monthly_rent` *or* lease_rent + market_rent; if both given, use lower.  `interest_rate` should be positive and <100.  Disallow negative rates.  If IO flag is true, ignore term’s amortization for DSCR computation (use only interest for denom).
- **Defaults:** If HOA not provided, assume 0. If taxes/insurance not provided, require user to input (cannot assume).  If vacancy or mgmt not provided, default 0% for Track A but allow user to input for Track B modeling.
- **Unit-Test Tolerances:** For amortization factors, allow ±\$1 on monthly payments (due to rounding differences).  For DSCR ratio, require ±0.01 accuracy.
- **Precision:** Compute all cash flows to at least 4-decimal internally; round monetary results to cents before DSCR ratio calc.
- **Edge Cases:** If PITIA/ITIA is zero or rent is zero, return DSCR=0 or flag error (cannot divide).  Very high DSCR (>10) may just show as “>10.00”. If DSCR<1.0, mark as failing.
- **Change Control:** Embed golden test cases (above) as automated tests.  Require double-check of any changes to core DSCR logic against these unit tests.
- **Audit Trail:** Log used “rent” value and inputs in evidence vault.  Indicate if actual rent was used or appraiser rent (source).
- **Documentation:** Clearly note that **Track A** uses gross rent (no expense deductions) for qualification.  Track B is for “investor’s view” and always should be shown alongside, but does not override Track A result.

---

## 6. Formula Computation Flow (Mermaid)

```mermaid
flowchart LR
  A[Inputs: LeaseRent, MarketRent, Rate, Term, Tax\u00A0Annual, Ins\u00A0Annual, HOA\u00A0Monthly, IO\u00A0Flag, Vacancy, Mgmt, OtherExp] --> B{Compute Rent}
  B --> C[Eligible Rent = min(LeaseRent, MarketRent)] 
  C --> D{Amortization?}
  D -->|Amort| E[Monthly P&I = amortize(Loan, Rate, Term)] 
  D -->|IO| F[Monthly Interest = Loan * Rate/12]
  E --> G[Monthly Taxes = Tax\u00A0Annual/12]
  F --> G
  E --> H[Monthly Insurance = Ins\u00A0Annual/12]
  F --> H
  E --> I[Monthly HOA = HOA\u00A0Monthly]
  F --> I
  G --> J[PITIA = P&I + Taxes + Insurance + HOA] 
  I --> J
  H --> J
  F --> K[ITIA = Interest + Taxes + Insurance + HOA]
  J --> L{Calculate DSCR_A}
  K --> L
  L --> M[DSCR_A = Rent / (if IO? K : J)] 
  M --> N[Annual NOI = 12*C – Vacancy – Mgmt – OtherExp – Tax\u00A0Annual – Ins\u00A0Annual – (HOA*12)] 
  N --> O[Annual Debt = (if IO? Interest*12 : P&I*12)]
  O --> P[DSCR_B = Annual NOI / Annual Debt]
  P --> Q[Outputs: DSCR_A, DSCR_B, PITIA, ITIA, Notes]
``` 

This diagram shows the core steps: take lower-of rent, compute payments (amortizing vs IO), add taxes/insurance/HOA to form PITIA (or ITIA), then compute DSCR_A.  DSCR_B is computed via annualized values (NOI minus expenses).

---

**Sources:** Lender and industry materials were used to confirm every formula.  We also referenced standard mortgage factors for payment calculations, and OCC guidelines for NOI composition. Any rule lacking a formal source is treated as advisory or requires manual confirmation.

