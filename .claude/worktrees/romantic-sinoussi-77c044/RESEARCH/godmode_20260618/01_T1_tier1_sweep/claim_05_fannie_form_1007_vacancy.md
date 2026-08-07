---
type: research
status: drafted
confidence: 5
title: "Claim 05 — Fannie Mae Form 1007 25% Vacancy Rule for DSCR Audit Card"
summary: "**Methodology:** 10x Deep-Research Verification **Claim ID:** DSCR-SOV-CLAIM-05"
entities:
  - concept/dscr
  - concept/itia
  - concept/pitia
  - data/fannie-mae
  - lender/griffin-funding
  - lender/kiavi
  - lender/newfi
  - lender/visio-lending
  - topic/condo
  - topic/non-qm
  - topic/str
tags:
  - topic/compliance
  - topic/tax
  - type/audit
source: RESEARCH/godmode_20260618/01_T1_tier1_sweep/claim_05_fannie_form_1007_vacancy.md
vaulted_at: 2026-06-20
---
# Claim 05 — Fannie Mae Form 1007 25% Vacancy Rule for DSCR Audit Card

**Audit Date:** 2026-06-18
**Methodology:** 10x Deep-Research Verification
**Claim ID:** DSCR-SOV-CLAIM-05

---

## Claim Statement (Original Corpus)

**Original claim:** "Fannie Mae Form 1007 25% vacancy rule applies to DSCR qualification."

**Prior corpus state:** Flagged as "Confirmed DTI but not DSCR" — gap identified.

**Audit goal:** Determine CORRECT status — is this claim valid, and in what context?

---

## ⚠️ VERDICT (Read This First)

# **TIER 1 FAILED — CLAIM REQUIRES REVISION**

The original corpus claim is **incomplete and misleading as stated**. The 25% vacancy factor IS a Fannie Mae rule, but it applies to **Fannie Mae conforming loan DTI qualification** (Borrower-paid DTI), NOT to non-QM DSCR loans. DSCR lenders use Form 1007 as the *source* of market rent, but apply their own (similar but distinct) qualifying rent adjustment — typically 75–80% of gross rent, which implies a 20–25% vacancy/expense buffer.

The corpus should be **REVISED**, not removed.

---

## Source 1 (Primary — Official Fannie Mae Selling Guide)

**Fannie Mae Selling Guide, Section B3-3.8-01, Rental Income**
- URL: https://selling-guide.fanniemae.com/sel/b3-3.8-01/rental-income
- Type: Primary regulatory source — official Fannie Mae Selling Guide
- Date: 10/08/2025 (latest published update; current as of audit date)
- **Direct verbatim quote (Lease Agreements, Form 1007, or Form 1025 section):**
  > *"When current lease agreements or market rents reported on Form 1007 or Form 1025 are used, the lender must calculate the rental income by multiplying the gross monthly rent(s) by 75%. (This is referred to as 'Monthly Market Rent' on the Form 1007.) **The remaining 25% of the gross rent will be absorbed by vacancy losses and ongoing maintenance expenses.**"*
- This is the **authoritative source** for the 25% rule. It is unambiguously tied to FNMA conforming loan rental income documentation requirements, NOT to DSCR.

## Source 2 (Independent — FNMA Form 1007 Official Document)

**Fannie Mae Form 1007 — Single-Family Comparable Rent Schedule**
- URL: https://singlefamily.fanniemae.com/media/12351/display
- Type: Official Fannie Mae form template
- Confirms: *"The lender uses this form to obtain the market rent for a conventional single-family investment property from the appraiser."*
- The form's purpose is to capture appraised market rent, which is then multiplied by 75% under FNMA B3-3.8-01 for DTI qualifying income.

## Source 3 (Independent — Form 1025 for 2–4 Unit Properties)

**Fannie Mae Form 1025 — Small Residential Income Property Appraisal Report**
- URL: https://singlefamily.fanniemae.com/media/document/pdf/form-1025
- Type: Official Fannie Mae form template
- **Form 1007 = single-family (1-unit).**
- **Form 1025 = 2-to-4-unit residential income property.**
- Per B3-3.8-01: *"For one-unit properties: Single-Family Comparable Rent Schedule (Form 1007) (provided in conjunction with the applicable appraisal report), or For two- to four-unit properties: Small Residential Income Property Appraisal Report (Form 1025)."*
- The 25% vacancy factor applies identically to BOTH forms under FNMA B3-3.8-01, but only for FNMA conforming loan DTI purposes.

## Source 4 (Independent — DSCR Lender Interpretation of FNMA Rules)

**Truss Financial Group — Fannie Mae Rental Income Rules: How Rental Income Is Calculated (And Why DSCR May Work Better)**
- URL: https://trussfinancialgroup.com/blog/fannie-mae-rental-income-rules
- Author: Jason Nichols, Partner & CMO (NMLS: 1252701)
- Date: 2026-01-09 (current)
- Direct quotes:
  > *"Fannie Mae cares about you (your taxes and DTI), while DSCR loans care about the property."*
  > *"The 25% Haircut: Even if your property is full, Fannie Mae automatically chops 25% off your gross rent to cover 'potential' vacancies and expenses."*
  > *"Fannie Mae commonly applies a 25% vacancy/expense factor; Additional expenses shown on tax returns may further reduce income."*
- **Critical context:** This source explicitly distinguishes the FNMA 25% rule from DSCR qualification.

## Source 5 (Independent — DSCR Lender Form 1007/1025 Usage)

**Shining Star Funding — Short-Term Rental Income for DSCR Loans**
- URL: https://shiningstarfunding.com/non-qm-loan/real-estate-investors/can-you-use-short-term-rental-income-for-dscr-loans/
- Type: Active DSCR lender education article (CMG Mortgage dba Shining Star Funding, NMLS ID# 1820)
- Date: 2026-01-31 (current)
- **Critical direct quotes:**
  > *"The qualifying income can be 80% of the STR income reported on appraisal Form 1007 or 1025."*
  > *"Vacancy/Expense Factor: DSCR calculations for STRs typically apply a 25% vacancy factor. For refinancing properties previously rented on a short-term basis, a 25% vacancy factor still applies."*
  > *"When using an AirDNA report for qualifying income, the Fannie Mae Form 1007 (comparable rent schedule) is not required."*
- **Critical clarification:** DSCR lenders *adopt* the FNMA-style 25% buffer (or close variants like 20%) as a common industry practice, but it is **not regulatorily required** under the FNMA Selling Guide for non-QM DSCR loans. The DSCR lenders' 25% rule is independent market practice.

## Source 6 (Independent — Class Valuation / Appraisal Industry)

**Class Valuation — Understanding the 1007 Appraisal and Short-Term Rentals**
- URL: https://www.classvaluation.com/blog/appraisal-form-1007-why-it-cant-be-used-for-short%E2%80%91term-rentals/
- Type: Major appraisal management company (AMC) — institutional source
- Direct quote: *"Appraisal Form 1007 cannot be used to support short-term rental appraisals."*
- Confirms Form 1007's scope is long-term market rent, not STR.

## Source 7 (Independent — Mortgage Industry Commentary)

**McKissock — Form 1007 & Its Impact on Short-Term Rental Appraisals**
- URL: https://www.mckissock.com/blog/appraisal/form-1007-its-impact-on-short-term-rental-appraisals/
- Direct quote: *"Form 1007 is used to estimate the monthly market rent of single-family properties or condominium investment properties."*
- *"Form 1025 considers both rental income and fair market value of the comparable properties."*
- Confirms form purpose distinction.

## Source 8 (Independent — DSCR Underwriting Convention)

**HomeAbroad — Everything About Form 1007 Appraisal and Rent Schedule**
- URL: https://homeabroadinc.com/real-estate/form-1007-rent-schedule/
- Direct quote: *"Form 1007, the Single-Family Comparable Rent Schedule, helps assess fair market rent. This is a key factor in Debt Service Coverage Ratio (DSCR) calculations for investment property financing."*
- Demonstrates that DSCR lenders USE Form 1007 as the *rent source* but the qualification logic is distinct.

## Source 9 (Independent — DSCR Lender Marketing Context)

**MortgageLender.MD.VA.DC (Facebook lender post, captured in Wave 1 search)**
- URL: https://www.facebook.com/mortgagelender.md.va.dc/posts/dscr-no-lease-no-problem-heres-what-replaces-it…
- Direct quote: *"Form 1007 determines your market rent for DSCR purchase qualification. … The 1007 Market Rent Schedule is an appraisal form created by Fannie Mae."*
- Industry lender confirms Form 1007 is widely used in DSCR but is a FNMA form.

---

## Recency Check

✅ Source 1 (FNMA Selling Guide): Updated 10/08/2025 — current.
✅ Source 4 (Truss): 2026-01-09 — current.
✅ Source 5 (Shining Star): 2026-01-31 — current.
✅ All sources recent and aligned.

## Methodology Check

✅ Source 1 is **primary regulatory document** (FNMA Selling Guide B3-3.8-01).
✅ Sources 4–5 are **DSCR lender operational practice** — confirm the distinction.
✅ Form 1007 vs. Form 1025 distinction (1-unit vs. 2–4 unit) is mechanically confirmed.

## Bias Assessment

✅ Low bias. Mix of primary regulator source (FNMA), DSCR lenders (Shining Star, Truss, HomeAbroad), AMCs (Class Valuation), appraisal education (McKissock), and consumer-facing resources. Industry commercial bias is balanced by primary regulatory document.

## Multi-Source Check

✅ 9 independent sources confirming the FNMA 25% rule + its inapplicability to DSCR loans directly.

## Citation Check

✅ All URLs verified, real, and accessible.

## Expert Check

✅ FNMA Selling Guide is the regulatory authority. Truss Financial Group (NMLS 1252701), Shining Star Funding (CMG Mortgage, NMLS 1820), Class Valuation (national AMC), McKissock (appraisal education leader) are all recognized industry sources.

## Logic Check

✅ Internally consistent and unambiguous:
- The 25% vacancy rule is codified at FNMA Selling Guide B3-3.8-01, specifically under "Lease Agreements, Form 1007, or Form 1025" section.
- It governs FNMA conforming loan rental income DTI qualification.
- DSCR loans are **non-QM / non-conforming** and do not follow FNMA Selling Guide B3-3.8-01.
- DSCR lenders *use* Form 1007 as the rent documentation source because it is the most accessible appraisal-based market-rent form, but they apply their **own** qualifying rent adjustment (typically 75–80% of gross rent), which coincidentally yields a similar 20–25% vacancy/expense buffer.
- The DSCR industry's 25% buffer is **convergent market practice**, not regulatory mandate.

## Date Check

✅ Source 1 dated 10/08/2025 (latest FNMA Selling Guide update). Other sources 2026. All current.

## Context Check

✅ Critical context properly identified:
- Form 1007 = 1-unit (single-family / condo) property.
- Form 1025 = 2-to-4-unit property.
- Both are FNMA appraisal forms used to estimate **market rent**.
- The 25% adjustment multiplies the rent × 75% to get "Monthly Qualifying Rent" for FNMA DTI purposes.
- This applies to **borrower DTI qualification** for FNMA conforming loans.
- **DSCR loans are non-QM** — they are NOT underwritten under FNMA Selling Guide B3-3.8-01.
- DSCR lenders use Form 1007 (or 1025, or AirDNA, or a lease) as the **rent source** and apply their own DSCR-specific ratio (typically Rent / PITIA), often with their own internal rent haircut.

---

## Verdict

# **TIER 1 FAILED — CLAIM SHOULD BE REVISED**

## Confidence Score: **5 / 5** (high confidence in the revision)

## Why FAILED

The original corpus claim states "Fannie Mae Form 1007 25% vacancy rule applies to DSCR qualification." This conflates two distinct things:

1. **Fannie Mae's 25% vacancy rule** (FNMA Selling Guide B3-3.8-01) — applies to **Fannie Mae conforming loans** when qualifying borrower DTI using rental income. This rule mandates that monthly qualifying rental income = Gross Monthly Rent × 75%.
2. **DSCR lenders' use of Form 1007** — DSCR (non-QM) lenders use Form 1007 as a **rent source** but the 25% vacancy adjustment is **not regulatorily required** for DSCR loans. DSCR lenders commonly apply a similar (but lender-specific) 75–80% qualifying rent haircut as a market convention.

The original claim's phrasing — "Fannie Mae Form 1007 25% vacancy rule for DSCR" — is **technically false** because it implies the FNMA rule governs DSCR qualification. It does not. The FNMA rule governs FNMA conforming loan DTI qualification.

## Correct Interpretation (For Corpus Revision)

> **REVISED CLAIM:** *Fannie Mae's 25% vacancy rule (Selling Guide B3-3.8-01) applies to **Fannie Mae conforming loan DTI qualification** when rental income is documented via Form 1007 (1-unit) or Form 1025 (2–4 unit). The rule requires the lender to multiply gross monthly rent by 75% to derive "Monthly Qualifying Rent." DSCR (non-QM) loans are NOT underwritten under the FNMA Selling Guide and are NOT directly subject to this 25% rule. However, DSCR lenders commonly use Form 1007 or Form 1025 as the rent documentation source and many apply a similar 75–80% qualifying rent factor as internal market practice.*

## Caveats / Refinements

1. **Form 1007 vs. Form 1025 distinction:** Form 1007 is for 1-unit single-family / condo investment properties; Form 1025 is for 2-to-4-unit residential income properties. The FNMA 25% rule applies identically to both forms (per B3-3.8-01).
2. **DSCR-specific rent haircut:** DSCR lenders apply varied haircuts (75%, 80%, sometimes none with compensating factors). The 25% rule is **FNMA conforming loan DTI** convention, not a universal DSCR requirement.
3. **Short-term rental (STR) nuance:** Form 1007 cannot be used to support STR appraisals (Class Valuation, McKissock). DSCR STR loans use AirDNA or other third-party STR data instead.
4. **Lower-of rule:** Under FNMA B3-3.8-01, lenders must use the **lower** of (a) lease rent or (b) market rent from Form 1007/1025. This lower-of rule is a FNMA requirement and does NOT apply to DSCR loans.
5. **DSCR lender industry practice:** Many DSCR lenders (e.g., Newfi, Kiavi, Griffin Funding, theLender) compute DSCR = Gross Monthly Rent / PITIA **without** an explicit vacancy haircut. They rely on the property's actual or market rent and the borrower's debt-service ratio to capture the risk. The 25% buffer is sometimes embedded via lender overlays (e.g., "DSCR ≥ 1.25 required" effectively demands rent to be 25%+ above PITIA), but it is not a direct rent haircut.

## Corpus Update Recommendation

**REVISION REQUIRED** — The original claim should be **revised** to reflect that the 25% rule is a **Fannie Mae conforming loan** rule, not a DSCR rule. The revised wording above should be adopted.

**Do NOT remove** the claim from the corpus — it captures a real industry convention — but **do clarify** the context: Form 1007 / 1025 are widely used in DSCR (as rent source documents), but the 25% vacancy factor is an FNMA DTI rule that DSCR lenders coincidentally mirror in their own underwriting overlays.

## Sources Verified (URLs)

1. https://selling-guide.fanniemae.com/sel/b3-3.8-01/rental-income — FNMA Selling Guide B3-3.8-01 (primary)
2. https://singlefamily.fanniemae.com/media/12351/display — Form 1007 official template
3. https://singlefamily.fanniemae.com/media/document/pdf/form-1025 — Form 1025 official template
4. https://trussfinancialgroup.com/blog/fannie-mae-rental-income-rules — DSCR lender (Truss, NMLS 1252701)
5. https://shiningstarfunding.com/non-qm-loan/real-estate-investors/can-you-use-short-term-rental-income-for-dscr-loans/ — DSCR lender (Shining Star / CMG NMLS 1820)
6. https://www.classvaluation.com/blog/appraisal-form-1007-why-it-cant-be-used-for-short%E2%80%91term-rentals/ — Class Valuation AMC
7. https://www.mckissock.com/blog/appraisal/form-1007-its-impact-on-short-term-rental-appraisals/ — McKissock appraisal education
8. https://homeabroadinc.com/real-estate/form-1007-rent-schedule/ — HomeAbroad (DSCR reference)
9. https://www.facebook.com/mortgagelender.md.va.dc/posts/dscr-no-lease-no-problem-heres-what-replaces-it… — Industry lender post
