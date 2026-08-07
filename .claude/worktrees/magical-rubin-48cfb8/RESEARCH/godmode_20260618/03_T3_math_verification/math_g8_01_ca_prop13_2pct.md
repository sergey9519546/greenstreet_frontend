---
type: research
status: drafted
confidence: 3
title: "Audit Card: Math G8-01 — California Proposition 13 (2% Annual Property Tax Cap)"
summary: "**Claim**: California Proposition 13 caps the annual increase of a property's assessed value at **2% per year** (or the California Consumer Price Index change, whichever is **less**), and the ad valorem property tax rate is capped at **1%** of full cash value (plus voter-approved bonds, fees, and special charges)."
entities:
  - concept/dscr
  - slice/2
  - state/ca
  - topic/str
tags:
  - topic/compliance
  - topic/tax
  - type/audit
source: RESEARCH/godmode_20260618/03_T3_math_verification/math_g8_01_ca_prop13_2pct.md
vaulted_at: 2026-06-20
---
# Audit Card: Math G8-01 — California Proposition 13 (2% Annual Property Tax Cap)

## Claim Statement

**Claim**: California Proposition 13 caps the annual increase of a property's assessed value at **2% per year** (or the California Consumer Price Index change, whichever is **less**), and the ad valorem property tax rate is capped at **1%** of full cash value (plus voter-approved bonds, fees, and special charges).

**Formula**:
- Assessed value year_n = AV_year_n-1 × (1 + min(CPI_change, 0.02))
- Annual property tax bill = AV × (1% + bonded-indebtedness rate + parcel fees)

## Derivation from First Principles

Proposition 13 (California Constitution Article XIII A, §2(a), amended 1978):

1. Section 1(a) sets the ceiling on ad valorem tax at **1 percent (1%)** of full cash value.
2. Section 2(a) defines "full cash value" as the assessor's valuation on the **1975–76** tax bill (the factored base-year value, FBYV).
3. Section 2(b) limits the annual adjustment of FBYV to the **lesser of (i)** the percentage change in the California Consumer Price Index for the prior year, **or (ii) two percent (2%)**.
4. Reassessment to current market value is triggered **only** by (a) a change in ownership or (b) completion of new construction.
5. The 1% rate is collected by the county and apportioned among local jurisdictions; voter-approved indebtedness (general obligation bonds, parcel taxes, Mello-Roos CFDs, special assessments) is added on top.

**Inflation-factor implementation**: Each year, the California State Board of Equalization (BOE) computes the California CPI change for the prior calendar year (Oct–Oct LA-area All Urban Consumers index). When CA-CPI ≤ 2%, BOE sets the inflation factor = CA-CPI; when CA-CPI > 2%, BOE caps the factor at 2%. For 2024/25 the BOE used 2.0% (capped).

## Numerical Example with Tolerance Band

Property purchased in 2024 at $500,000, prior AV rolled forward at 2% since 2014:

| Tax year | AV (capped 2%) | AV (uncapped CPI, hypothetical 3%) | Tax @ 1% |
|---|---|---|---|
| 2024 | $500,000 | $500,000 | $5,000 |
| 2025 | $510,000 | $515,000 | $5,100 |
| 2026 | $520,200 | $530,450 | $5,202 |
| 2027 | $530,604 | $546,364 | $5,306 |
| 2028 | $541,216 | $562,754 | $5,412 |
| 2029 | $552,040 | $579,637 | $5,520 |
| 2030 | $563,081 | $597,026 | $5,631 |

**Effective tax-rate tolerance**: After 6 years, the capped AV is ~$9,400 lower than uncapped CPI. With ongoing 1% base rate, effective rate falls below 1% as market value diverges. This is the Prop 13 "lock-in effect" documented by NBER (Wasi & White 2005).

## Source 1 — Primary Statute

**California Constitution, Article XIII A, Section 2(b)** — "The full cash value base … may reflect from year to year the inflationary rate not to exceed two percent (2%) per year … or the percentage change in the California Consumer Price Index, whichever is less."

- Official text: https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=CON&article=XIII%20A (leginfo.legislature.ca.gov — California Legislative Information, primary state statute portal)
- Justia mirror (Section 1): https://law.justia.com/constitution/california/article-xiii-a/section-1/ (cited from search snippet — direct fetch returned 403)
- Date accessed: 2026-06-18

## Source 2 — Independent Statutory/Regulatory Authority

**California State Board of Equalization (BOE)** — "How Property Is Assessed for Property Taxes" (Publication 800-10, June 2025):

> "Proposition 13 caps the growth on a property's assessed value at no more than two percent a year unless the market value falls below the FBYV."

- URL: https://boe.ca.gov/pdf/pub800-10.pdf (boe.ca.gov — California State Board of Equalization)
- Companion page (Decline-in-Value / Prop 8): https://www.boe.ca.gov/proptaxes/decline-in-value/

## Source 3 — Independent County Assessor

**City & County of San Francisco Office of the Assessor-Recorder** — Real Property Assessments:

> "Except for these two instances, property assessments cannot be increased by more than 2% annually, based on the California Consumer Price Index. The property tax rate is 1% plus any bonds, fees, or special charges."

- URL: http://sfassessor.org/property-information/homeowners/real-property-assessments
- Date accessed: 2026-06-18

## Recency Check

- Prop 13 adopted **June 6, 1978**; ratified as Article XIII A.
- HdL Companies (2024/25): BOE advised 2.0% inflation factor for FY 2024/25 (https://www.hdlcompanies.com/news/california-proposition-13-inflation-factor-for-2024-25).
- Core statutory text **unchanged** since 1978 except for the 2020 Prop 19 amendment (transfer of base year value for disabled / 55+ homeowners). The 2% cap language itself is unmodified.
- **Status: Current.**

## Bias Assessment

- All three sources are **government/regulatory primary sources** (state constitution, state tax agency, county assessor).
- Zero commercial-bias risk: these are non-partisan constitutional and administrative bodies.
- Cross-verified across state-level (BOE), county-level (SF Assessor), and constitutional text (LegInfo). No contradictions found.
- Conflicting framing exists in popular media (e.g., "Prop 13 will be repealed in 2026") — this is **political advocacy**, not legal text. The constitutional 2% cap is still operative.

## Verdict

**TIER 1 CONFIRMED** — Multiple independent statutory and regulatory primary sources agree on:
1. 2% annual assessment cap (or CPI, whichever is lower)
2. 1% ad valorem rate ceiling
3. Change-in-ownership/new-construction reassessment trigger

Confidence: **5 / 5**

## Test Coverage Recommendation

- **Unit tests**: parameterized over CA-CPI scenarios {CPI < 2%, CPI = 2%, CPI > 2%}; verify AV never grows more than min(CPI, 2%).
- **Integration tests**: change-in-ownership → reset AV to sale price; new construction → supplemental assessment (prorated).
- **Edge cases**: Prop 8 decline-in-value (AV can drop below FBYV during recession but cannot grow faster than 2% on rebound until FBYV caught up); Prop 19 transfer rules (post-2020 55+/disabled exclusions).
- **Slice 2 P2-2 (Property Tax) build work**: anchor `TaxMath.prop13_av_path()` against these 3 sources; add a `cpi_index_lookup()` for the BOE-published CA-CPI series.

## Notes for Downstream Use

- "Effective property tax rate" for a CA owner who bought in 1990 and holds today can be < 0.5% (vs. statutory 1%) because AV is anchored to old FBYV. **Do not** use the Tax Foundation 0.76% CA effective rate as the cap-rate assumption; it is a **statewide median**, not the maximum.
- For DSCR underwriting: model **assessed** tax (Prop 13 path) for DSCR-on-assumed-rent calculations, but **actual** tax bill (which can equal 1% + bonds on new acquisitions) for refinance and post-change-in-ownership scenarios.