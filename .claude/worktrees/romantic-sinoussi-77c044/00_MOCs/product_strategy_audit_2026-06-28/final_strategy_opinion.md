# DSCR Product Strategy Audit - Final Opinion

Generated: 2026-06-28

## Scope And Artifacts

I inventoried the DSCR_LOAN OFFICE workspace plus the active greenstreet_frontend repo boundary, excluding common vendor/build folders. The audit pack is in:

`C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\00_MOCs\product_strategy_audit_2026-06-28`

Generated artifacts:

- `file_inventory.csv`: 1,614 candidate markdown/research/document files with parser status, hash prefix, counts, buckets, and detected categories.
- `extracted_scored_items.csv`: 32,503 extracted ideas, claims, product directions, buyer segments, risks, corrections, algorithms, features, and formulas.
- `theme_scorecard.csv`: aggregate theme scoring.
- `product_split_summary.csv`: final product bucket scoring.
- `inventory_summary.md`: scope, extension counts, bucket counts, extraction modes, and top source docs.

Scoring is 1-5 where 5 is favorable. For build complexity, 5 means easier to build. For data/legal risk, 5 means lower risk and easier to manage. Each criterion is equal weighted.

## Local Evidence That Should Govern The Strategy

The strongest local source-of-truth set is:

- `docs/research/operational/UNIFIED_HUB.md`: defines the Dual-Track doctrine. Lines 51-55 say a deal can qualify with a lender and still fail in ownership, so Greenstreet should always show lender qualification and investor survival separately.
- `00_engine/research/DSCR-Research/BUILDABLE_MASTER_SPECIFICATION.md`: lines 10-15 define the buildable master spec as verified lender data, exact formulas, parameters, and algorithm designs. Lines 368-373 put the first 12-week build around the DSCR engine, lender rules, and calculate/match/sensitivity APIs.
- `docs/research/sprints/Build_Phase1_Deterministic_Core_Plan.md`: lines 13-16 define Phase 1 as deterministic DSCR calculator, golden vector regression suite, evidence vault, and lender matrix engine.
- `01_research_notes/NEW_DSCR Deal Desk Build-Ready Research Report.md`: lines 56-60 say the opportunity is not another calculator, but an explainable, state-aware, lender-matching underwriting system. Lines 267-274 name P0/P1 tickets: deterministic core, lender rule versioning, evidence vault, adverse-action reason engine, OCR, STR module, scenario rail, and ranked lender match.
- `docs/research/analysis/THE MISSING PIECES_ NON-QM WHOLESALE LENDER GAP ANALYSIS.md`: lines 15-20 and 101-103 show the bigger wholesale-lender path requires bank-statement income parsing, PPE, broker/TPO management, and warehouse lending. Those are not first-product scope.
- `docs/research/operational/DSCR_Blueprint_Verification_Corrections_Log.md`: lines 26-31 and 49-52 show why correction overlays must override older research snapshots.

Current external checks used only for market/legal timing:

- Freddie Mac/FRED PMMS data confirms mortgage rates remain a live timing variable, not a static assumption: https://fred.stlouisfed.org/series/MORTGAGE30US
- CFPB Regulation Z still contains business-purpose credit exemptions, but that does not eliminate fair lending, licensing, privacy, or state-law risk: https://www.consumerfinance.gov/rules-policy/regulations/1026/3/
- FinCEN's current residential real estate page says a March 19, 2026 court order vacated the residential real estate reporting rule and reporting is not required while the order remains in force. This updates the local correction log's 2026 RRE-rule treatment: https://www.fincen.gov/residential-real-estate

## Product Split

| Bucket | Product | Equal score | Decision |
|---|---:|---:|---|
| First product | DSCR Deal Desk v1 | 3.92 | Build first |
| Second product | Lender Intelligence and Broker Workflow | 3.69 | Build after v1 traction |
| Long-term platform | Sovereign OS / wholesale-lender operating platform | 3.21 | Defer until data and distribution exist |
| Discarded ideas | Generic calculators, unsupported live-rate claims, premature automated credit decisions, broad lender build-out | 3.31 | Discard or hold as research |

## First Product

Build a DSCR Deal Desk v1 for brokers, loan officers, non-QM account executives, and sophisticated investor borrowers.

The product should not be marketed as a generic calculator. The wedge is "can this deal clear a real lender, why or why not, and what changes improve fundability?" Minimum v1:

- Dual-Track DSCR: Track 1 lender qualification and Track 2 investor survival, always separate.
- Deterministic P&I, IO, LTV, reserves, and DSCR math with golden-vector tests.
- Versioned lender matrix for a small manually verified lender set.
- Evidence vault with source URL/document ID, effective date, confidence, hash, retrieval timestamp, and stale-data flags.
- Scenario rail for rent, rate, reserves, DSCR floor, IO/ARM mode, and hold period.
- Ranked lender match with exact inclusion/exclusion reasons.
- Exportable deal memo, not a binding approval or consumer credit decision.

Manual validation is straightforward: take 30-50 real or synthetic DSCR scenarios, run them against published lender guidelines and direct lender/broker conversations, then measure whether the Deal Desk predicts eligible, ineligible, and borderline outcomes better than a broker spreadsheet.

## Second Product

After v1 has users, add Lender Intelligence and Broker Workflow:

- Per-lender document checklists and exceptions.
- Guideline/rate-sheet change tracking with dated diffs.
- Quote tracker, lock/float tracker, and close-rate calculator.
- Broker-facing intake and handoff workflow.
- Optional OCR/PDF extraction, but only once the deterministic evidence model is stable.

This is where willingness to pay improves because it saves broker and lender staff time. It also creates defensibility through versioned rule history and outcome feedback.

## Long-Term Platform

The Sovereign OS / wholesale-lender operating platform is real but premature. Defer:

- Full PPE integration.
- Broker/TPO approval portal.
- Bank-statement income engine.
- Warehouse lending, hedging, capital-markets, QC, and securitization workflows.
- TimesFM/LoRA forecasting, Monte Carlo/copula layers, fraud models, catastrophe/insurance scoring.
- Marketplace/API operating system.

These ideas have expansion value, but they score lower on founder fit, manual validation, and build complexity. The ML work should wait until there is proprietary deal/outcome data. The wholesale-lender path should wait until the product has distribution, compliance counsel, and capital partners.

## Discard Or Hold

Discard these as first-order products:

- Another consumer-facing DSCR calculator.
- Undated live-rate pages or rate quote promises.
- Fully automated approval/decline/adverse-action systems without counsel and audit controls.
- Scraped lender matrices without source dating and human verification.
- Broad SEO/content/landing-page factories before the core decision product is validated.
- FinCEN/RRE compliance claims based only on stale local research snapshots.
- ML forecasting before enough clean property-month and loan-outcome data exists.

## Final Opinion

The best first product is a narrow, auditable DSCR Deal Desk. It should sell certainty and explainability at the top of funnel, not "AI lending" and not "better calculator." The strongest build path is deterministic math plus verified lender rules plus evidence provenance plus scenario explanations.

The second product is lender intelligence and broker workflow. That is where the product turns from useful tool into operating habit.

The long-term platform should remain the north star, but building it first would be a mistake. It pulls the project into licensing, PPE, TPO, capital markets, ML, and compliance complexity before the simplest wedge has proven willingness to pay.

So the practical answer is: build the Deal Desk, manually validate it with brokers/lenders, charge for it, and let the platform emerge from the evidence and rule-change data it collects.
