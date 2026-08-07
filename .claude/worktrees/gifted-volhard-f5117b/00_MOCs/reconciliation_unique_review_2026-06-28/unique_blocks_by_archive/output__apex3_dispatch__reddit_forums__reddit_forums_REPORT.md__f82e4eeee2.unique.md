# Unique Content Review

- Source path: output/apex3_dispatch/reddit_forums/reddit_forums_REPORT.md
- Archived path: 99_attachments/generated_archive_2026-06-28/p1_generated_stale_2026-06-28/output/apex3_dispatch/reddit_forums/reddit_forums_REPORT.md
- Archive SHA1 short: f82e4eeee2
- Replacement path: docs/research/operational/DSCR_Blueprint_Verification_Corrections_Log.md
- Coverage decision: HIGH_RISK_RESTORE_OR_EXTRACT
- Block coverage: 0
- Unique words: 5077
- Preliminary classification: GENERATED_ARTIFACT_RETAIN_ARCHIVE
- Review copy: 00_MOCs\reconciliation_unique_review_2026-06-28\restored_for_review\output\apex3_dispatch\reddit_forums\reddit_forums_REPORT__archivecopy_f82e4eee.md

## Unique Headings
- # DSCR Community Intelligence: Reddit, BiggerPockets, Hacker News
- ## 0. Executive Summary — Top 5 Findings
- ## 1. Source Coverage
- ## 2. The DSCR Mechanics (how the community actually computes it)
- ## 3. The Sub-1.0, No-Ratio, and STR-No-Min Lender Matrix (extracted from `r/loanoriginators/1tmnto0`)
- ## 4. The Prepayment-Penalty State Map (extracted from `r/Mortgages/1syh6m7`)
- ## 5. The 1007 / STR Pain Point (r/loanoriginators/1e7au8k + r/appraisal/1avzfxa)
- ## 6. Common DSCR Deal-Killers (Quantified)
- ### 6.1 The 5% Cap / 7% Debt / 1.25 DSCR = Dead Deal (NYC)
- ### 6.2 Property-Needs-Work / Deferred Maintenance
- ### 6.3 Florida Insurance Shock
- ### 6.4 Property Tax Reassessment / Prop 13
- ### 6.5 Vacancy Assumptions
- ### 6.6 Occupancy / Owner-Occupied Fraud Risk
- ### 6.7 The 5+ Unit Boundary
- ### 6.8 Servicer / Lender Failure (Dominion Financial)
- ## 7. The Lender Pricing Reality (current rate environment)
- ## 8. DSCR Origination Process Pain Points (LO Pain)
- ### 8.1 First-time investor / no prior experience
- ### 8.2 Loan Officer / Underwriter Knowledge Gap
- ### 8.3 Lender Slow / No Response (BiggerPockets/Reddit pattern)
- ### 8.4 LLC Requirement Variance
- ## 9. Tool & Data-Source Inventory
- ### 9.1 Opensource / Free tools mentioned
- ### 9.2 Lender-provided vendor DSCR calculators
- ## 10. Hacker News Insights (Algolia corpus)
- ### 10.1 DSCR triggers default when rent drops
- ### 10.2 DSCR covenants can force lender takeover of bank accounts
- ### 10.3 $1.5T CRE Maturity Wall
- ### 10.4 STR rent-fixing software → DSCR risk
- ### 10.5 LBO / mortgage analogy (Hacker News canonical)
- ## 11. BiggerPockets Threads (Additional Detail)
- ## 12. Synthesized Insights for DSCR Sovereign OS
- ### 12.1 Feature Priorities (inferred from pain-point frequency)
- ### 12.2 Data Sources the Engine Should Ingest
- ### 12.3 Vendors to Watch (in the order of community frequency)
- ## 13. Limitations & Gaps
- ## 14. File Manifest

## First Unique Blocks

### Block 1
```text
--- type: research status: drafted confidence: 3 title: "DSCR Community Intelligence: Reddit, BiggerPockets, Hacker News" summary: "> Research dump for **DSCR Sovereign OS** — practitioner pain points, vendor mentions, data sources, common deal-killers, and quantified experiences. Compiled 2026-06-19." entities: - concept/appreciation - concept/arm - concept/cap-rate - concept/dscr - concept/io - concept/itia - concept/ltv - concept/pitia - data/fannie-mae - data/fred - lender/acra-lending - lender/ad-mortgage - lender/american-heritage - lender/angel-oak - lender/crosscountry - lender/deephaven - lender/defy - lender/easy-street - lender/griffin-funding - lender/kiavi - lender/lima-one - lender/new-silver - lender/newfi - lender/verus - lender/visio-lending - state/ak - state/ca - state/fl - state/ga - state/il - state/md - state/mi - state/mn - state/ms - state/nm - state/ny - state/va - tax/pal - topic/condo - topic/multifamily - topic/non-qm - topic/str tags: - concept/io - topic/apex - topic/compliance - topic/default-rate - topic/flood-insurance - topic/insurance - topic/llpa - topic/portfolio - topic/ppp - topic/reserves - topic/tax source: output/apex3_dispatch/reddit_forum ... [truncated]
```

### Block 2
```text
> Research dump for **DSCR Sovereign OS** — practitioner pain points, vendor mentions, data sources, common deal-killers, and quantified experiences. Compiled 2026-06-19.
```

### Block 3
```text
## 0. Executive Summary — Top 5 Findings
```

### Block 4
```text
1. **DSCR thresholds in the wild cluster at 1.0 / 1.20 / 1.25**, but a clear sub-1.0 tier exists (A&D down to 0.55; NQM Funding 0.75 no-ratio; EasyShort 0). Most "real" lenders want 1.0+ for best pricing; many underwrite down to 0.75 with rate/LTV penalties. **VA/CA/NY/FL/GCA lenders** explicitly require LLC entity title for PPP; **AK/MN/NM** prohibit prepayment penalties entirely on 1-4 unit DSCR. 2. **The 1007 rent schedule is structurally broken for STR (Airbnb) properties.** Fannie Mae officially told appraisers: "Form 1007 requires monthly rent… there is currently no Fannie Mae approved form for reporting STR Market Rent." Originators are forced to use AirDNA + ad-hoc addenda; underwriters apply implicit vacancy haircuts. This is a screaming data-source gap. 3. **NYC 5+ unit stabilized product is functionally non-financeable at standard DSCR terms**: lenders cap LTV at 50-60% (vs the commonly-cited 70-75%) at 7%+ rates with a 1.25 DSCR requirement, because rent stabilization and 5% caps mean NOI cannot cover P&I. Multiple practitioners confirm DSCR is a "fallback product" for that segment — primary execution is agency/Fannie SBL or local bank. 4. **Florida insurance shock is r ... [truncated]
```

### Block 5
```text
## 1. Source Coverage
```

### Block 6
```text
| Channel | Threads read in full | Distinct URLs visited | |---|---|---| | r/RealEstateInvesting | 11 | 12 | | r/Mortgages | 9 | 10 | | r/loanoriginators | 7 | 8 | | r/appraisal | 2 | 3 | | r/Insurance | 1 | 1 | | BiggerPockets forums | 6 | 7 | | Hacker News (Algolia) | 3 | 3 (Algolia is canonical) | | Lender/vendor sources (referenced in threads) | ~20 | — | | **Total** | **39 deeply-read + Algolia corpus** | **80+ URLs** |
```

### Block 7
```text
The complete flat URL list is in `reddit_forums_urls.txt`.
```

### Block 8
```text
## 2. The DSCR Mechanics (how the community actually computes it)
```

### Block 9
```text
Multiple threads confirm the formula in plain-English terms: **DSCR = Gross Rental Income / PITIA** (where PITIA = Principal + Interest + Taxes + Insurance + Association dues). NOT NOI. NOT cap rate.
```

### Block 10
```text
> *"If rent = the mortgage payment the DSCR is 1.0. If rent is 25% higher than the mortgage payment the DSCR is 1.25."* — `r/loanoriginators/1gi1rcy` (DSCR ratios how do they come up, 1yr ago, 4pts)
```

### Block 11
```text
> *"DSCR is a backwards DTI. Income / expenses and mortgage payment. A DSCR of 1.30 means the property makes 1.30 for every 1.00 it spends. Net Operating Income / (Expenses + Total mortgage payment). Don't double count taxes and insurance."* — `r/loanoriginators/1gi1rcy`
```

### Block 12
```text
**HOW useful for Sovereign OS:** pin this definition in the engine. Several beginner LOs literally admitted in the thread that they had closed 4+ DSCR loans without understanding the math. Tool opportunity: a single canonical DSCR calculator with the formula displayed.
```

### Block 13
```text
**Tag:** INSIGHT, TOOL
```

### Block 14
```text
**Vendor mentions / thresholds** — see section 3.
```

### Block 15
```text
## 3. The Sub-1.0, No-Ratio, and STR-No-Min Lender Matrix (extracted from `r/loanoriginators/1tmnto0`)
```

### Block 16
```text
A live, opinion-based lender matrix from a self-identified LO enumerating 200+ DSCR lenders. Exact matrix values as published:
```

### Block 17
```text
| Lender | Min FICO | Min DSCR | Max LTV | Standout | |---|---|---|---|---| | ACRA Lending | 575 | 0.80 (lower w/ larger down) | 80% | Lowest FICO floor. ITIN. STR via AirDNA. | | NQM Funding | 640 | 0.75 (No-Ratio available) | 80% | No-Ratio sub-product, no income/employment/DSCR docs. 5-10 unit MF. | | Change Wholesale | 600 | 0.75 (IO calc) | 85% | DSCR on interest-only payment; Community Mortgage no-ratio. | | Carrington | 620 | 1.0 / 0.75 / no-ratio | 85% | 3 tiers, 40-yr term. | | A&D Mortgage | 620 | 1.0 std / 0.55 (high FICO) / no-ratio | 80% | **0.55 is the lowest published ratio-based threshold in space**. 5-8 unit. $5M AD Power Jumbo. | | Easy Street Capital (EasyShort) | 640 | **No min DSCR for STR** | 80% buy / 75% cash-out | An Airbnb that doesn't cover its debt service still qualifies. 49 states. | | Angel Oak | 680 / 720 | 1.0 (waived at 75% LTV w/ 700+ FICO) | 85% | Rental AVM (launched Nov 2025). 5/6 and 7/6 ARM. | | Defy Mortgage | 640 | 0.75 | 85% | 85% LTV at 640 FICO. 14-21 day close. Foreign national. | | Deephaven | 640 | Not published (80% LTV avail) | 80% | DSCR 2nd lien ($75K-$500K, 680+). 5-9 unit MF. |
```

### Block 18
```text
Additional lenders named in other threads: **Lima One, JMAC, Carrington, Orion, Loanstream, Homexpress, Loanstore, NQMF, Kiavi, Visio, HonestCasa, New Silver, TheLender.com, Beeline, Figure, Griffin, BFF (Brokers First Funding), CakeTPO, Emporium TPO, Open Wholesale, LendZ, Newpoint, Westgate Capital, Champions Funding, VPM, Velocity, Verus, NexBank, Open Wholesale, LendZ, Brokers Advantage (no LTV cuts on STR; 0.01 DSCR floor), Silver Hill, Dominion Financial, Newfi, AHL (American Heritage Lending), New Silver Lending, HonestCasa, Rabbu, Convoy Home Loans, Figure, TheLender, Beltway Lending, Convo Home Loans, Astoria, Fund Loans, Kiavi**.
```

### Block 19
```text
> *"DSCR will cost you more. I buy loans to securitize and right now DSCR loans attracts the highest adjustments amongst Non QM. Especially STR backed."* — `r/Mortgages/1sso1rw` (Why don't more investors use DSCR loans, 1mo ago, 4pts)
```

### Block 20
```text
> *"DSCR is the most permissive income documentation structure in the space — no income, no employment, no DSCR calculation required. Available with 36-month housing event seasoning."* — `r/loanoriginators/1tmnto0`
```

### Block 21
```text
**HOW useful for Sovereign OS:** this is the master lender matrix. A Sovereign OS feature should let the user enter file (FICO, DSCR, LTV, property type, entity, state) and produce a ranked shortlist. The matrix above is the seed training data.
```

### Block 22
```text
**Tag:** VENDOR, INSIGHT, TOOL
```

### Block 23
```text
## 4. The Prepayment-Penalty State Map (extracted from `r/Mortgages/1syh6m7`)
```

### Block 24
```text
A user-built summary chart with industry consensus. The r/Mortgages thread `1syh6m7` and the NJ-specific thread `r/realestateinvesting/1r5ib2j` (4pts) plus the r/loanoriginators consensus converge on:
```

### Block 25
```text
**Fully Allowed, No Restrictions (35 states):** AL, AZ, AR, CA, CT, DC, FL, GA, HI, ID, IN, IA, KY, LA, ME, MA, MO, MT, NE, NV, NY, NC, ND, OK, SC, SD, TN, TX, UT, VT, WA, WV, WY
```

### Block 26
```text
**Fully Allowed with Disclosure Restrictions:** CO, OR, WI
```

### Block 27
```text
**Fully Allowed Only If Borrower Is an Entity (LLC):** IL, NJ (NJ further restricts per `r/realestateinvesting/1r5ib2j` — even entity PPPs are tightly scoped, C-corp/S-corp only per some lenders)
```

### Block 28
```text
**Allowed with Restrictions (length / fee caps / loan size / unit count):** MI, MS, OH, PA, RI, VA
```

### Block 29
```text
**Varied Interpretation Among Lenders (grey area):** DE, KS, MD, NH
```

### Block 30
```text
**Prepayment Penalties NOT Allowed (1-4 unit DSCR):** AK, MN, NM
```
