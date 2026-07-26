# Unique Content Review

- Row key: c9883881b9
- Source path: 01_research_notes/DSCR_Sovereign_OS_Feature_Engineering_Blueprint.md
- Archived path: 01_research_notes/_archive/superseded_by_docs_research_2026-06-28/DSCR_Sovereign_OS_Feature_Engineering_Blueprint.md
- Replacement path: docs/research/specs/DSCR_Sovereign_OS_Feature_Engineering_Blueprint.md
- Coverage decision: HIGH_RISK_RESTORE_OR_EXTRACT
- Block coverage: 0.9178
- Unique words: 652
- Preliminary classification: ROOT_NOTE_UNIQUE_CONTENT_REVIEW
- Review copy: 00_MOCs\reconciliation_unique_review_verified_2026-06-28\restored_for_review\c9883881b9__01_research_notes__DSCR_Sovereign_OS_Feature_Engineering_Blueprint.md

## Unique Headings
- ### 2.8 Category H — Tax Reassessment Features (Highest-Priority Fix from v11.2)

## First Unique Blocks

### Block 1
```text
--- type: research status: drafted confidence: 3 title: "DSCR Sovereign OS: Upgrade Intelligence Report" summary: "> **Canonical Truth:** A DSCR loan can qualify with a lender and simultaneously be a catastrophic investment. Every feature in this system must serve *both* the lender qualification track and the investor survival track. Conflating them produces the most expensive mistake in real estate finance." entities: - concept/appreciation - concept/arm - concept/cap-rate - concept/cltv - concept/dscr - concept/itia - concept/ltv - concept/pitia - data/fred - data/freddie-mac - data/kbra - lender/american-heritage - lender/deephaven - lender/defy - lender/easy-street - lender/griffin-funding - lender/kiavi - lender/lima-one - lender/new-silver - lender/visio-lending - math/copula - math/t-copula - ml/shap - ml/xgboost - regulation/cfpb - regulation/section-1071 - state/ca - state/fl - state/tx - tax/1031 - tax/bonus-depreciation - tax/niit - tax/pal - topic/condo - topic/condotel - topic/sfr - topic/str tags: - ml/xgboost - topic/40yr-amort - topic/after-tax - topic/architecture - topic/compliance - topic/default-rate - topic/flood-insurance - topic/ic-memo - topic/insurance - to ... [truncated]
```

### Block 2
```text
**Golden Test Vector (v11.2 — June 17, 2026):** - Purchase price: $425,000 | LTV: 75% | Loan: $318,750 - Gross rent: $3,000/mo | Form 1007: $3,000/mo - Tax: $5,000/yr | Insurance: $2,000/yr | HOA: $150/mo - At 7.00%: PI = $2,121 | PITIA = $2,855 - **Track 1 DSCR = 1.05** (PASSES — lender sees this) - **Track 2 DSCR = 0.88** (FAILS — investor bleeds $335/mo) - Deal-break rate: **7.67%** | Rate cushion: 67 bps
```

### Block 3
```text
These are the primary predictive signals and must be computed with verified math (v11.2 golden values).
```

### Block 4
```text
**Hard FICO Caps by Program Tier (v11.2 verified):**
```

### Block 5
```text
**Reserve Tiering Matrix (v11.2 verified):**
```

### Block 6
```text
### 2.8 Category H — Tax Reassessment Features (Highest-Priority Fix from v11.2)
```

### Block 7
```text
**Kill Criterion Status (v11.2 elevated from line item to gate):** - 90% of FL investors, 83% of CA investors missed deals due to insurance issues (2024 survey) - 57% of all investors nationwide reported insurance-driven missed opportunities - 1-in-3 affordable housing providers: premium increases ≥ 25% in 2023 - Multiple states: projected double-digit rate increases in 2026
```

### Block 8
```text
| Lender | Min DSCR | Min FICO | Max LTV | STR | FN/ITIN | Key Differentiator | |---|---|---|---|---|---|---| | Griffin Funding | 0.75 | 620 | 80% (15% dn possible) | Yes | Yes (FN) | Sub-1.0 nationwide; ARM from 5.125% | | Defy Mortgage | 0.75 | 640 | **85%** (740 FICO SFR purchase only) | Yes (AirDNA) | Yes | 85% exception; 14–21d close | | Easy Street Capital | 1.0 | 640 | 80% / 75% cash-out | Yes | Unknown | **Waives 12-mo STR seasoning** | | Lima One Capital | 0.75 | 660 | 80% | Yes (AirDNA 45%) | No info | Portfolio/blanket; exit warning | | Kiavi | 1.1 (prequalify) | 660 | 80% | Unverified | **No — SSN required** | Speed/tech | | New Silver | 0.75 | 580 | 80% | Yes | Not stated | 580 FICO floor; instant approval | | Visio Lending | 0.75 | 680 | 80% | Broadest STR | Not stated | Cleanest public T1 rule | | Deephaven | 0.75 | 660 | 80% | Conditional | Not stated | **STALE — reverify priority** | | American Heritage | 0.75 | 660 | 85% (760 FICO) | Yes | Not stated | Sub-1.0 with compensating factors | | CAKE Mortgage (v4.0) | Varies | Varies | Per matrix | Yes (AirDNA purchase only) | Yes | Institutional guideline spec |
```

### Block 9
```text
| # | Kill Criterion | Source | |---|---|---| | 1 | STR prohibited (city/county/HOA) | STR legality gate | | 2 | PPP illegal for this state/entity AND no lender available without PPP | PPP gate | | 3 | Insurance unconfirmed in high-risk zone | v11.2 elevated | | 4 | FICO below all lender floors (< 580) | Universal floor | | 5 | Track 1 DSCR < 0.75 | Hard floor | | 6 | Appraisal rent break point exceeded ($4.83/sqft equivalent at reference deal) | T1 < floor | | 7 | Value cash-gap unfundable (purchase > max loan at any DSCR) | Bisection | | 8 | Reserves not liquid / not in acceptable tier | Liquidity check | | 9 | Deal-break rate ≤ note rate | Rate feasibility | | 10 | Declining-market LTV cap binds (CT/FL/IL/NJ/NY) | Overlay | | 11 | Loan < lender minimum ($75K–$150K depending on lender) | Floor | | 12 | BRRRR ARV cash-out gated by seasoning AND no Easy Street | Seasoning | | 13 | Confidence < 60 on best-fit lender | Provenance | | 14 | ARM double-shock year breaches T1 DSCR floor | Structural | | 15 | P(DSCR < 1.00) > 15% over loan term | Monte Carlo |
```
