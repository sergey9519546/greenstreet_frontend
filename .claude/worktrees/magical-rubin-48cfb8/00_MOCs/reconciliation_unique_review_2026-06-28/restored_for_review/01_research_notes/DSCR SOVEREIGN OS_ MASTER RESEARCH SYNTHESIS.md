---
type: research
status: drafted
confidence: 3
title: "DSCR SOVEREIGN OS: MASTER RESEARCH SYNTHESIS"
summary: "*Date: June 18, 2026 | Classification: Build-Critical*"
entities:
  - concept/arm
  - concept/dscr
  - concept/itia
  - concept/ltv
  - concept/pitia
  - data/cotality
  - data/fred
  - lender/deephaven
  - lender/easy-street
  - lender/lima-one
  - lender/visio-lending
  - math/copula
  - math/sobol
  - math/t-copula
  - ml/shap
  - ml/xgboost
  - regulation/cfpb
  - regulation/ecoa
  - regulation/reg-b
  - regulation/reg-z
  - state/ca
  - state/fl
  - state/mn
  - state/nj
  - state/oh
  - state/pa
  - state/tx
  - tax/1031
  - tax/bonus-depreciation
  - tax/niit
  - tax/pal
  - topic/str
tags:
  - ml/xgboost
  - topic/adverse-action
  - topic/after-tax
  - topic/architecture
  - topic/compliance
  - topic/default-rate
  - topic/flood-insurance
  - topic/ic-memo
  - topic/monte-carlo
  - topic/portfolio
  - topic/ppp
  - topic/short-rate
  - topic/stress-test
  - topic/tax
  - type/audit
source: DSCR SOVEREIGN OS_ MASTER RESEARCH SYNTHESIS.md
vaulted_at: 2026-06-20
---
# DSCR SOVEREIGN OS: MASTER RESEARCH SYNTHESIS
## Wide & Deep Academic, Algorithmic, and Regulatory Research Across All 16 Build Domains
*Date: June 18, 2026 | Classification: Build-Critical*

---

## RESEARCH PLAN OVERVIEW

This report synthesizes deep research across 16 domains derived from the 14 source documents. Each domain maps directly to a build-critical point in the DSCR Sovereign OS. The research covers academic papers, state-of-the-art algorithms, regulatory sources, and actionable build recommendations.

| # | Research Domain | Primary Build Module |
|---|---|---|
| 1 | Dual-Track DSCR Math | `engine.ts` / `dualTrackEngine.py` |
| 2 | Monte Carlo Simulation | `probabilisticStress.ts` |
| 3 | Prepayment Penalty Law | `pppBranchGate.ts` / `stateRulesEngine.py` |
| 4 | Property Tax Reassessment | `taxReassessmentEngine.py` |
| 5 | After-Tax Return Modeling | `afterTaxIRR.py` |
| 6 | All-In Effective Yield (AEY/XIRR) | `trueCostEngine.ts` |
| 7 | Graph-Native Architecture | `graphPlane.ts` / `ledgerPlane.ts` |
| 8 | AI OCR & Document Extraction | `ocrPipeline.py` / `leaseExtractor.py` |
| 9 | Real Estate Market Data APIs | `rentCompAggregator.ts` / `marketDataService.py` |
| 10 | STR Income Modeling | `strEngine.ts` |
| 11 | Lender Guideline Intelligence | `fitScorer.ts` / `guidelineDiff.ts` |
| 12 | ARM & SOFR Rate Reset Modeling | `armResetEngine.ts` |
| 13 | Portfolio-Level DSCR | `portfolioCenter.ts` |
| 14 | Regulatory Compliance Architecture | `adverseActionEngine.ts` |
| 15 | Fraud Detection | `fraudDetectionEngine.py` |
| 16 | IC Memo & Report Generation | `creditMemo.ts` / `icMemoGenerator.py` |

---

## DOMAIN 1: DUAL-TRACK DSCR MATH

### Key Academic Papers
- **Rodríguez, R.A. (2024).** "A Required Debt Service Coverage Ratio Related to the Economic Value of the Asset Involved." *Journal of Financial Risk Management*, 13, 618–642. [DOI:10.4236/jfrm.2024.134029](https://doi.org/10.4236/jfrm.2024.134029)
- **Blanc-Brude, F. & Hasan, M. (2016).** "A Structural Model of Credit Risk for Illiquid Debt." SIPAMetrics. Defines default as DSCR < 1.0 (hard) or DSCR < contractual threshold (technical).
- **OCC (2022).** "Commercial Real Estate Lending." Comptroller's Handbook v2.0. [https://www.occ.gov/publications-and-resources/publications/comptrollers-handbook/files/commercial-real-estate-lending/pub-ch-commercial-real-estate.pdf](https://www.occ.gov/publications-and-resources/publications/comptrollers-handbook/files/commercial-real-estate-lending/pub-ch-commercial-real-estate.pdf)

### State-of-the-Art Algorithms
- **P50/P99 Debt Sculpting:** Divides periodic CADS by minimum DSCR, discounts future values, and applies statistical scenarios (P50 = base case, P99 = 1-in-100-year worst case) for robust debt sizing.
- **Structural Credit Risk Model (DSCR Dynamics):** Models default as the inability to service debt using DSCR dynamics as a scale-independent quantity. Hard default at DSCR < 1.0; technical default at DSCR < contractual threshold.
- **Gradient Boosting Machines (XGBoost/LightGBM):** For predictive DSCR analysis, capturing non-linear relationships between financial indicators and DSCR outcomes.

### Build Recommendations
1. Implement machine learning models (gradient boosting) for predictive DSCR analysis to provide early warnings of financial distress.
2. Support both `Gross/PITIA` and `NOI/P&I` formula methods with a per-lender toggle.
3. Implement P50/P99 debt sculpting for project-finance-style DSCR sizing in the Track 2 engine.
4. Model IO recast explicitly: `New_Payment = Remaining_Balance × r / (1 - (1+r)^(-n_remaining))`.

---

## DOMAIN 2: MONTE CARLO SIMULATION

### Key Academic Papers
- **Li, D.X. (2000).** "On Default Correlation: A Copula Function Approach." *Journal of Fixed Income*, 9(4), 43–54. The seminal paper that introduced Gaussian copulas — and whose limitations caused the 2008 crisis.
- **Cherubini, U., Luciano, E. & Vecchiato, W. (2004).** *Copula Methods in Finance.* Wiley. The definitive textbook on copula functions for financial risk.
- **ECB Financial Stability Review (2024).** Systemic risk modeling with t-copula approaches.
- **Glasserman, P. (2003).** *Monte Carlo Methods in Financial Engineering.* Springer. The canonical reference for variance reduction techniques.

### State-of-the-Art Algorithms
- **Student-t Copula (ν degrees of freedom):** Captures fat-tail joint downside risk. Superior to Gaussian for correlated financial shocks. Calibrate ν using maximum likelihood estimation on historical DSCR/vacancy/rent data.
- **Clayton Copula (θ parameter):** Exhibits strong lower-tail dependence — exactly what is needed for modeling simultaneous vacancy spikes and rent compression.
- **Antithetic Variates + Stratified Sampling:** Variance reduction techniques that reduce simulation error by 50–80% without increasing trial count.
- **Quasi-Monte Carlo (Sobol Sequences):** Replaces pseudo-random numbers with low-discrepancy sequences for faster convergence in high-dimensional simulations.

### Regulatory Sources
- **Basel III / BCBS 239:** Principles for effective risk data aggregation. Requires stress testing with correlated scenarios.
- **EBA Guidelines on Stress Testing (EBA/GL/2018/04):** Mandates use of correlated multi-factor stress scenarios.

### Build Recommendations
1. Use **t-copula (5–7 degrees of freedom)** as the default for correlated shock modeling. Explicitly forbid Gaussian copulas in the production engine.
2. Implement **Quasi-Monte Carlo (Sobol sequences)** for faster convergence with 10,000 trials.
3. Output P10/P50/P90 IRR distributions (pre- and after-tax) alongside `P(DSCR < 1.00)`.
4. Calibrate the rent-change distribution to **negative skew** for counties with documented yield compression (ATTOM/CBRE data).

---

## DOMAIN 3: PREPAYMENT PENALTY LAW & COMPLIANCE

### Key Regulatory Sources
- **Minnesota §58.137 + HF 3437 (Enacted 4/23/2026, Eff. 8/1/2026):** Narrows PPP restrictions to personal/family/household loans. Business-purpose DSCR loans are entirely outside scope. [https://www.revisor.mn.gov/statutes/cite/58.137](https://www.revisor.mn.gov/statutes/cite/58.137)
- **Ohio ORC §1343.011:** PPP on 1-2 unit residential mortgages capped at 1% of **original principal**, max 5 years. 2026 threshold: $116,356 (annually indexed). [https://codes.ohio.gov/ohio-revised-code/section-1343.011](https://codes.ohio.gov/ohio-revised-code/section-1343.011)
- **Pennsylvania Act 6 LIPL (§406):** 2026 base figure: $329,411. Business-purpose loans above threshold: allowed. [https://www.pa.gov/agencies/dobs/media-resources/act-6-information](https://www.pa.gov/agencies/dobs/media-resources/act-6-information)
- **New Jersey N.J.S.A. 46:10B-2:** LLCs increasingly treated like individuals per July 2025 Arc Home update. Only C-Corps are universally safe. [https://wholesale.archomellc.com/news/new-jersey-prepayment-penalty-update-7-22-25](https://wholesale.archomellc.com/news/new-jersey-prepayment-penalty-update-7-22-25)
- **Regulation Z (12 CFR 1026.3):** Exempts business-purpose credit from consumer protections. [https://ecfr.io/Title-12/Section-1026.3](https://ecfr.io/Title-12/Section-1026.3)
- **CFPB Circular 2022-03:** Adverse action notices required even for AI/ML-based decisions. [https://www.consumerfinance.gov/compliance/circulars/circular-2022-03-adverse-action-notification-requirements-in-connection-with-credit-decisions-based-on-complex-algorithms/](https://www.consumerfinance.gov/compliance/circulars/circular-2022-03-adverse-action-notification-requirements-in-connection-with-credit-decisions-based-on-complex-algorithms/)

### Build Recommendations
1. Implement a **3-step branching gate** (Business-Purpose + Entity → Bank/Depository → Individual) before any PPP calculation.
2. Store `penalty_base` as a per-state field: `ORIGINAL_PRINCIPAL` for OH; `REMAINING_BALANCE` for AR and most others.
3. Build a **Celery cron job** [DELETED 2026-06-21 14:43 PT per research-mode directive] to re-index OH/PA thresholds every January 1.
4. Flag NJ as "High-Risk / Lender-Dependent" with an ambiguity node until a specific lender matrix is linked.

---

## DOMAIN 4: PROPERTY TAX REASSESSMENT

### Key Sources
- **California Proposition 13:** Resets assessed value to purchase price at sale. Supplemental tax bill arrives post-closing. [https://www.boe.ca.gov/proptaxes/pdf/pub29.pdf](https://www.boe.ca.gov/proptaxes/pdf/pub29.pdf)
- **Texas Property Tax Code §23.01:** Annual reassessment to market value at 2–3% of market value.
- **Florida Statute §193.155:** Purchase-year reset to market value.

### Build Recommendations
1. **Non-negotiable rule:** `reassessed_tax = Purchase_Price × effective_mill_rate(state, county)`. Never use the seller's current tax bill.
2. Build a per-state reassessment rules table in PostgreSQL with `state`, `trigger_event`, `assessment_method`, and `supplemental_bill_flag`.
3. Surface the delta to the user: "Seller currently pays $X/yr. You will pay ~$Y/yr after reassessment."

---

## DOMAIN 5: AFTER-TAX REAL ESTATE INVESTMENT MODELING

### Key Academic Papers
- **IRS Publication 946:** "How to Depreciate Property." Defines 27.5-year straight-line depreciation for residential rental property.
- **IRS Rev. Proc. 87-56:** Asset class lives for cost segregation components (5-year, 7-year, 15-year personal property).
- **OBBBA (One Big Beautiful Bill Act, Signed Jan 2025):** 100% bonus depreciation permanently restored for assets acquired after Jan 19, 2025.

### State-of-the-Art Algorithms
- **Cost Segregation Study (Engineering-Based):** Identifies and reclassifies building components into shorter depreciation lives (5, 7, 15 years) to accelerate deductions. Typical savings: $50K–$100K per $1M building value.
- **1031 Exchange Optimization Model:** Compares after-tax proceeds of a direct sale vs. a 1031 exchange, modeling the step-up in tax basis and deferred gain.
- **NIIT Stack Calculation:** `Effective_Rate = LTCG_Rate + 0.038` (23.8% at top bracket); `Recapture_Rate = 0.25 + 0.038` (28.8%).

### Build Recommendations
1. Implement the full after-tax IRR engine: depreciation (27.5yr, land-allocated), §1250 recapture (≤25%), NIIT (3.8% for MAGI > $200K/$250K), passive-loss ($25K allowance, $100K–$150K MAGI phase-out), 1031 alternate exit.
2. Surface cost segregation as a first-class decision variable for properties ≥ $450K.
3. Model "sell-and-pay" vs. "1031-and-roll" as alternate exit scenarios in the IC Memo.

---

## DOMAIN 6: ALL-IN EFFECTIVE YIELD (AEY/XIRR)

### Key Academic Papers
- **Brealey, R.A., Myers, S.C. & Allen, F. (2023).** *Principles of Corporate Finance.* McGraw-Hill. Canonical reference for IRR/XIRR computation.
- **CFPB Research on APR Limitations:** APR is imperfect for comparing adjustable-rate loans; XIRR over the expected hold period is superior.

### State-of-the-Art Algorithms
- **Newton-Raphson Method for XIRR:** Iterative root-finding on the NPV function. Converges in 5–10 iterations for typical mortgage cash flows.
- **Bisection Method (Fallback):** Guaranteed convergence when Newton-Raphson diverges (e.g., non-monotonic cash flows from balloon payments).
- **SciPy `scipy.optimize.brentq`:** Production-grade implementation combining bisection and inverse quadratic interpolation.

### Build Recommendations
1. Implement AEY using `scipy.optimize.brentq` (Python backend) with the full cash flow array: `[Net_Proceeds_0, -P_1, ..., -(P_n + Balance_n + PPP_n)]`.
2. Render AEY at 12/24/36/60-month hold periods for every lender.
3. Implement **Points Recoup Analysis:** `Break_Even_Months = Total_Points_Cost / Monthly_Payment_Savings_vs_Par`. Flag red if break-even > hold period.
4. Flag YSP exposure when rate > verified par rate.

---

## DOMAIN 7: GRAPH-NATIVE ARCHITECTURE

### Key Academic Papers
- **Robinson, I., Webber, J. & Eifrem, E. (2015).** *Graph Databases.* O'Reilly Media. The canonical reference for property graph models.
- **Bellomarini, L. et al. (2022).** "Knowledge Graphs and Enterprise AI." *IEEE Internet Computing.* On typed edges and causal propagation.
- **Kleppmann, M. (2017).** *Designing Data-Intensive Applications.* O'Reilly. Canonical reference for event sourcing and CQRS patterns for immutable audit logs.

### State-of-the-Art Algorithms
- **Property Graph Model (PGM):** Nodes with typed labels and properties; edges with typed labels, directionality, and properties. Enables causal propagation queries.
- **Semantic Diff Algorithm:** Multi-stage diff: (1) Structured field comparison (hash), (2) LLM-based facet classifier for prose changes, (3) Facet-sensitive edge invalidation.
- **Event Sourcing + CQRS:** Append-only ledger of all state mutations. The Ledger Plane is the source of truth; the Graph Plane is a projection.

### Build Recommendations
1. Implement the Three-Plane Architecture: **Projection** (UI views), **Graph** (causal nodes/edges in PostgreSQL + pgvector), **Ledger** (append-only event log).
2. Use **pgvector** for semantic similarity search on lender guidelines.
3. Implement the **Semantic Diff Engine** with facet classification (Location, Timing, Budget, Legal) to prevent cascading invalidations from cosmetic changes.

---

## DOMAIN 8: AI OCR & DOCUMENT EXTRACTION

### Key Papers & Benchmarks
- **Docling (IBM/Linux Foundation, 2024):** Open-source, table-aware PDF parsing. Best for digital PDFs. [https://www.docling.ai](https://www.docling.ai)
- **Mistral OCR 2505:** Claims to outperform Azure Document Intelligence and Google Document AI on scanned documents. $1/1000 pages ($0.50 batch). [https://ai.azure.com/catalog/models/mistral-document-ai-2505](https://ai.azure.com/catalog/models/mistral-document-ai-2505)
- **Reducto:** Industry-leading accuracy (~0.90 RD-TableBench) for complex multi-column layouts. Enterprise pricing.
- **Instructor Library (Python):** Patches any LLM provider with `response_model` parameter for schema-guaranteed Pydantic output with auto-retry. [https://python.useinstructor.com](https://python.useinstructor.com)

### Build Recommendations
1. Implement the **Hybrid OCR Pipeline:** Docling (digital) → Mistral OCR 2505 (scanned) → GPT-4o Vision (complex/handwritten).
2. Every extracted field must carry: `source_page`, `source_bbox` (bounding box), `confidence`, `extraction_model`.
3. HITL gate: `confidence < 0.85` → route to human review queue. Hard-block on rent schedules and NOI calculations regardless of confidence.
4. Implement **±30% Market Rent Guardrail** using RentCast AVM to auto-flag fraud/stale leases.
5. Track **Lease Amendment Chains** with `amendment_number`, `effective_date`, `fields_modified`, `prior_values`, `new_values`.

---

## DOMAIN 9: REAL ESTATE MARKET DATA APIs

### Key Sources & Benchmarks
- **RentCast API:** 140M+ property records, rental AVM, market comps. Free developer tier. [https://www.rentcast.io](https://www.rentcast.io)
- **FRED API:** 845,000+ economic time series. Key series: `MORTGAGE30US`, `SOFR`, `SOFR30DAYAVG`, `RRVRUSQ156N`. Free. [https://fred.stlouisfed.org](https://fred.stlouisfed.org)
- **Census ACS API:** Tract-level vacancy data (B25002, B25004). Free. [https://api.census.gov](https://api.census.gov)
- **FEMA NFHL WMS:** Official flood hazard mapping. Free. [https://msc.fema.gov/arcgis/rest/services/public/NFHL/MapServer](https://msc.fema.gov/arcgis/rest/services/public/NFHL/MapServer)

### Build Recommendations
1. Implement **WebSocket push** for live rate changes: poll FRED `MORTGAGE30US` hourly; push to connected clients on change.
2. Use **Redis TTL caching:** FRED rates (daily), RentCast comps (weekly), Census vacancy (quarterly).
3. Implement **multi-source triangulation:** RentCast (baseline) + Rentometer (corroboration). Flag if delta > 10%.
4. AirDNA: **Enterprise-gated only.** Do not build automation until commercial API agreement is signed.

---

## DOMAIN 10: STR INCOME MODELING

### Key Sources
- **Easy Street Capital:** Accepts 100% of AirDNA projections for professional STR operators. Waives 12-month seasoning for BRRRR.
- **Visio Lending:** Broadest STR acceptance; 48 states.
- **Deephaven:** Requires 12 months documented STR history.

### Build Recommendations
1. Implement a **STR Legality Gate** before any STR income is used: check permit requirements, min-stay rules, HOA restrictions, and zoning.
2. Use the **Three-Source Minimum:** `min(LT_Rent, Projected × 0.70-0.80, Documented_12mo)`. Appraisal governs.
3. Build a **Monthly Seasonality Bar Chart** for every STR file. Annual DSCR of 1.15 can hide months at 0.6.
4. Model STR OpEx at 45–65% of gross (vs. LTR at 30–45%).

---

## DOMAIN 11: LENDER GUIDELINE INTELLIGENCE

### State-of-the-Art Algorithms
- **Multi-Dimensional Constraint Satisfaction (CSP):** Models lender eligibility as a constraint satisfaction problem. Each lender is a set of constraints (FICO ≥ X, LTV ≤ Y, DSCR ≥ Z). The fit scorer finds all lenders where all constraints are satisfied.
- **NLP for Guideline PDF Extraction:** Use `instructor` + GPT-4o to extract structured lender guidelines from PDF rate sheets. Store as JSONB evidence objects.
- **Confidence Calibration (Platt Scaling):** Calibrates raw model scores to well-calibrated probabilities. Prevents overconfident fit tier assignments.

### Build Recommendations
1. Implement the **Two-Quote Rule:** Always surface one flex/fit lender + one rate-competitive lender with the AEY delta in dollars.
2. Build a **Guideline Diff Engine:** Detect when a lender's guidelines change and propagate the update to all active deals that reference that lender.
3. Never output numeric approval probabilities. Use qualitative fit tiers: Strong / Standard / Conditional / Unlikely / Does-not-meet.

---

## DOMAIN 12: ARM & SOFR RATE RESET MODELING

### Key Sources
- **SOFR Transition (ARRC):** Alternative Reference Rates Committee guidance on SOFR-based ARM products. [https://www.newyorkfed.org/arrc](https://www.newyorkfed.org/arrc)
- **CFPB ARM Guidance:** Index + Margin = Fully Indexed Rate, subject to periodic and lifetime caps. [https://www.consumerfinance.gov/owning-a-home/loan-options/adjustable-rate-mortgages/](https://www.consumerfinance.gov/owning-a-home/loan-options/adjustable-rate-mortgages/)

### State-of-the-Art Algorithms
- **SOFR Forward Curve Construction:** Build from CME SOFR futures contracts. `Forward_SOFR_t = (SOFR_Futures_Price_t - 100) / 100`.
- **ARM Reset Payment Formula:** `New_Rate = min(max(SOFR_t + Margin, Floor), min(Current_Rate + Periodic_Cap, Initial_Rate + Lifetime_Cap))`. Then: `New_Payment = Remaining_Balance × New_Rate/12 / (1 - (1 + New_Rate/12)^(-n_remaining))`.
- **IO + ARM Double-Shock:** Model the year when IO expires AND rate resets simultaneously. Flag as "Kill-Switch Year."

### Build Recommendations
1. Implement the **ARM Reset Engine** with full cap structure modeling (initial, periodic, lifetime caps and floors).
2. Integrate **SOFR forward curve** from CME futures for projecting reset rates.
3. Surface the "Kill-Switch Year" prominently in the IC Memo.

---

## DOMAIN 13: PORTFOLIO-LEVEL DSCR

### Key Sources
- **CRED iQ (2026):** Reports balance-weighted debt yields by property type for CMBS portfolios.
- **Eichholtz, P. et al. (1995).** "Real estate portfolio diversification by property type and region." *Journal of Property Finance.*

### Build Recommendations
1. Implement **Portfolio DSCR:** `Σ(NOI) / Σ(Annual Debt Service)`.
2. Build a **Blanket Exit Warning** for Lima One and other portfolio lenders: selling one property may force restructuring absent a partial-release clause.
3. Build a **Refi Watchlist:** current rate vs. market rate, savings, prepay remaining, break-even months, PROCEED/HOLD verdict.
4. Track **Counterparty Continuity Flag:** lender solvency/continuity risk (the 2022–23 shakeout pulled lenders mid-pipeline).

---

## DOMAIN 14: REGULATORY COMPLIANCE ARCHITECTURE

### Key Regulatory Sources
- **CFPB Circular 2022-03:** Adverse action notices required for AI/ML credit decisions. Cannot use "black-box" defense. [https://www.consumerfinance.gov/compliance/circulars/circular-2022-03-adverse-action-notification-requirements-in-connection-with-credit-decisions-based-on-complex-algorithms/](https://www.consumerfinance.gov/compliance/circulars/circular-2022-03-adverse-action-notification-requirements-in-connection-with-credit-decisions-based-on-complex-algorithms/)
- **ECOA / Regulation B (12 CFR 1002.9):** Adverse action notice within 30 days of **completed** application. Business credit has different notification rules.
- **SAFE Act / MLO Licensing:** Offering or negotiating loan terms triggers licensing requirements.
- **GLBA:** PII and financial data handling requirements.

### State-of-the-Art Algorithms
- **SHAP (SHapley Additive exPlanations):** Provides feature-level explanations for ML model decisions. Required for generating specific adverse action reasons.
- **LIME (Local Interpretable Model-Agnostic Explanations):** Local approximations of complex model behavior for individual decisions.
- **Fairness-Aware Optimization:** Modifies the model's objective function to include fairness metrics (demographic parity, equalized odds) alongside predictive accuracy.

### Build Recommendations
1. Integrate **SHAP values** into the scoring engine to generate specific, accurate adverse action reasons.
2. Implement distinct adverse action workflows for business credit (≤$1M vs. >$1M gross revenues).
3. Position the tool as **B2B/operator-facing** to minimize consumer regulatory surface (SAFE Act, RESPA, Reg Z).

---

## DOMAIN 15: FRAUD DETECTION

### Key Papers
- **Hernandez Aros, L. et al. (2024).** "Financial fraud detection through the application of machine learning techniques: a literature review." *Nature Scientific Reports.* [https://www.nature.com/articles/s41599-024-03606-0](https://www.nature.com/articles/s41599-024-03606-0)
- **Chen, Y. et al. (2025).** "Year-over-Year Developments in Financial Fraud Detection via Deep Learning." *arXiv.* [https://arxiv.org/html/2502.00201v1](https://arxiv.org/html/2502.00201v1)
- **Cotality (formerly CoreLogic) Q1 2026 Fraud Report:** Investment-property applications had fraud indicators at **1 in 44** (vs. 1 in 129 overall). Undisclosed real estate is the largest rising category.

### State-of-the-Art Algorithms
- **Deep Learning (CNNs + LSTMs):** For detecting complex fraud patterns in large document datasets.
- **Metadata Fingerprinting:** Check PDF creation timestamps, author metadata, and font consistency for document-level manipulation signals.
- **Cross-Document Reconciliation:** Compare extracted rent against bank statement deposits. Flag if delta > 15%.
- **Snappt-Style Analysis:** Analyzes thousands of metadata elements for bank statement fraud. Claims 99.8% detection accuracy.

### Build Recommendations
1. Implement **metadata fingerprinting** on all uploaded PDFs (creation timestamp, author, font consistency, modification history).
2. Build **cross-document reconciliation:** lease rent vs. bank statement deposits vs. RentCast AVM. Flag if any two sources diverge by > 30%.
3. Integrate Cotality's LoanSafe API for consortium-based fraud risk scoring.
4. Flag **undisclosed real estate** as a primary fraud vector: cross-reference borrower entity against public property records.

---

## DOMAIN 16: IC MEMO & REPORT GENERATION

### Key Papers
- **Kim, A.G., Muhn, M. & Nikolaev, V.V. (2024).** "Financial Statement Analysis with Large Language Models." University of Chicago Booth. [https://arxiv.org/html/2407.17866v1](https://arxiv.org/html/2407.17866v1)
- **MMGCI (2026).** "DSCR Under Stress: A Three-Method Framework for Institutional Underwriting." [https://www.mmcginvest.com/post/dscr-under-stress-a-three-method-framework-for-institutional-underwriting](https://www.mmcginvest.com/post/dscr-under-stress-a-three-method-framework-for-institutional-underwriting)
- **BCBS 239:** Principles for effective risk data aggregation and risk reporting.

### State-of-the-Art Algorithms
- **Retrieval-Augmented Generation (RAG):** Grounds AI-generated memo content in specific, verifiable source documents. Prevents hallucinations. Every claim links to its source page and bounding box.
- **Chain-of-Thought (CoT) Prompting:** Guides LLMs to emulate a financial analyst's reasoning process for complex judgments.
- **Modular Data-Object Architecture:** Credit memos are governed data objects, not static documents. Policy changes propagate programmatically.

### Build Recommendations
1. Implement **RAG-based IC Memo generation** with source traceability: every numerical claim links to its source document, page, and bounding box.
2. Adopt the **Three-Metric Credit Standard** (DSCR + Debt Yield + LTV) as the mandatory header of every credit memo.
3. Include **Kill-Switch Conditions** as explicit, falsifiable statements in every memo.
4. Build a **Kill-Switch Monitor** that polls rent comps and guideline diffs on a 30-day cadence post-verdict, alerting the LO within 1 hour of any condition breach.
5. Ensure every memo snapshot includes ALL inputs + lender-data versions + rate anchors at the time of generation for full reproducibility.

---

## APPENDIX: RESEARCH PLAN SUMMARY TABLE

| Domain | Top Algorithm | Top Paper | Primary Regulatory Source |
|---|---|---|---|
| Dual-Track DSCR | Structural Credit Risk (DSCR Dynamics) | Rodríguez (2024) | OCC Comptroller's Handbook |
| Monte Carlo | t-Copula / Clayton Copula | Li (2000), Cherubini et al. (2004) | Basel III / BCBS 239 |
| PPP Law | 3-Step Branching Gate | N/A (statutory) | MN HF 3437, OH ORC §1343.011, PA Act 6 |
| Tax Reassessment | Mill-Rate Engine | N/A (statutory) | CA Prop 13, TX §23.01, FL §193.155 |
| After-Tax IRR | Cost Segregation + NIIT Stack | IRS Pub 946, OBBBA | IRC §167/168, §1250, §1411, §469 |
| AEY/XIRR | Brent's Method (SciPy brentq) | Brealey et al. (2023) | CFPB APR Guidance |
| Graph Architecture | Property Graph + Semantic Diff | Kleppmann (2017) | N/A |
| AI OCR | Hybrid Docling + Mistral OCR 2505 | Instructor Library | RESPA/TRID Audit Trail |
| Market Data APIs | Multi-Source Triangulation | N/A | FEMA NFHL WMS |
| STR Modeling | Three-Source Min() | N/A | Local STR Permit Regulations |
| Guideline Intelligence | CSP + NLP Extraction | N/A | Fannie/Freddie Selling Guides |
| ARM/SOFR | Forward Curve + Double-Shock | ARRC Guidance | CFPB ARM Guidance |
| Portfolio DSCR | Σ(NOI)/Σ(ADS) + Blanket Warning | Eichholtz et al. (1995) | CMBS Presale Methodology |
| Compliance | SHAP + Fairness-Aware Optimization | Hurlin et al. (2022) | CFPB Circular 2022-03, ECOA/Reg B |
| Fraud Detection | CNN + Metadata Fingerprinting | Hernandez Aros et al. (2024) | FHFA Fraud Prevention Guidance |
| IC Memo | RAG + CoT Prompting | Kim et al. (2024) | BCBS 239 |

---

*This report synthesizes research from 16 parallel deep-research agents. All citations are sourced from academic databases, official regulatory publications, and industry benchmarks. Data as of June 18, 2026.*
