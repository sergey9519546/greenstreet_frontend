# DSCR SOVEREIGN OS: THE DEFINITIVE PRODUCT SPECIFICATION
*Version 12.0 — Dual-Audience Architecture (Borrower & Loan Officer)*
*Date: June 17, 2026*

The DSCR Sovereign Operating System is the ultimate command center for Debt Service Coverage Ratio (DSCR) lending. By fusing institutional financial rigor with a graph-native architecture, it serves two distinct masters: the **Borrower/Investor** (who needs transparency, speed, and real-world cash-flow truth) and the **Loan Officer / Credit Desk** (who needs a defensible, zero-defect file capable of surviving a 10-minute underwriting SLA). 

This document defines the complete product surface, workflows, and mathematical spine required to build the best DSCR tool ever created.

---

## I. THE BORROWER / INVESTOR JOURNEY: BUILDING TRUST THROUGH TRUTH

Borrowers do not want a black-box approval; they want to know if a deal will make them money and what it will actually cost to finance. The Sovereign OS replaces opaque rate sheets with radical transparency.

### 1. The Dual-Track Cash Flow Reveal
The platform forces a confrontation with reality by running two separate calculations and presenting them side-by-side [1]:
*   **Track 1 (Lender Qualification):** Calculates the lender's view using `Gross Rent / PITIA` (no vacancy haircut for 1-4 unit long-term rentals, using the lower of the lease or 1007 appraisal). This determines if the loan *can* close.
*   **Track 2 (Investor Survival):** Calculates the borrower's reality using `(Gross Rent × (1 - Vacancy) - Management - Maintenance) / PITIA`. This determines if the investment *should* close.

If a deal passes Track 1 but fails Track 2 (negative cash flow), the UI enforces a **Mandatory Acknowledgment**. The borrower must actively check a box stating they understand the property qualifies for a loan but is projected to bleed cash under standard operating assumptions. This friction point is the ultimate trust-builder.

### 2. The Complete Return Stack
Instead of a simple DSCR ratio, the borrower dashboard renders a five-metric return stack [2]:
*   **Entry Cap Rate:** NOI / Purchase Price.
*   **Levered Cash-on-Cash (CoC):** Year 1, Year 3, and Year 5 projections, correctly factoring in closing costs and required reserves, not just the down payment.
*   **Levered IRR:** XIRR calculation over the expected hold period.
*   **Equity Multiple:** Total equity returned divided by total equity invested.
*   **After-Tax IRR:** Hardcodes the OBBBA 100% Bonus Depreciation (post-Jan 19, 2025) and models the 3.8% NIIT surtax on exit proceeds for high-MAGI filers [3].

### 3. True-Cost Lender Ranking & The "Kill-Switch"
Lenders are ranked not by superficial note rates, but by **All-In Effective Yield (AEY)**. The system runs an XIRR on the expected hold period, factoring in points, lender fees, and state-specific Prepayment Penalties (PPP). 

The borrower receives a plain-language verdict (GO, CONDITIONAL-GO, or NO-GO) accompanied by explicitly defined **Kill-Switch Conditions**. For example: "If the 1007 appraisal comes back below $2,100/mo, this deal flips to NO-GO." The borrower knows exactly what assumptions are holding the deal together [4].

---

## II. THE LOAN OFFICER JOURNEY: SPEED, COMPLIANCE, AND CONVERSION

For the Loan Officer (LO), the platform is an execution engine designed to compress the pre-qualification cycle from days to minutes while ensuring a zero-defect file submission [5].

### 1. The 10-Minute Committee-Grade Verdict
The LO dashboard generates a structured, 150-word **Investment Thesis Block** that the LO can deliver verbatim to the borrower or credit committee. This replaces free-form emails with a falsifiable argument covering property metrics, qualification status, returns, and binding risks.

Every credit memo must contain the **Three-Metric Credit Standard** [6]:
*   **DSCR (Cash Control):** Can the borrower make the payment?
*   **Debt Yield (Workout Metric):** What is the lender's cap rate if they foreclose? (Target: ≥ 9%).
*   **LTV (Loss-Given-Default):** How much asset deflation can the lender absorb?

### 2. Adverse-Case Recourse & Automated Remediation
When a file hits a NO-GO, the system does not just reject it. It generates an **Adverse-Case Recourse Table** mapping the failure to an operator action. 
If the Track A DSCR is 0.94, the system automatically suggests the most mathematically efficient fixes: "Reduce loan amount by $14,000 to reach 1.00x DSCR" or "Route to IO product (Estimated time: 1 day)." This turns declines into structured coaching opportunities [7].

### 3. The Kill-Switch Monitor (Post-Verdict)
The LO's biggest liability is a file that was approved weeks ago but has since degraded. The **Kill-Switch Monitor** runs continuously in the background. It polls the RentCast API on a 30-day cadence, monitors lender guideline diffs, and checks the 10-Year Treasury (currently anchored at ~4.44% as of June 16, 2026) [8]. If a condition breaches, the LO is alerted within one hour, preventing dead files from reaching the rate-lock desk.

---

## III. THE GRAPH-NATIVE ENGINE: INTAKE & ARCHITECTURE

The backend architecture discards flat databases in favor of a Graph-Native "Three-Plane" model (Projection, Graph, Ledger) that ensures absolute context persistence [9].

### 1. Hybrid AI-OCR Intake Pipeline
The intake process utilizes a multi-engine OCR pipeline to ingest leases, rent rolls, and bank statements [10]:
*   **Docling:** Handles digital PDFs and table reconstruction.
*   **Mistral OCR 2505:** Processes scanned and handwritten addenda.
*   **GPT-4o Vision:** Extracts structured JSON via Pydantic schemas.

Every extracted field (e.g., "Monthly Base Rent") is tagged with a bounding-box ID and a confidence score. Fields with <0.85 confidence are routed to a Human-in-the-Loop (HITL) queue. Furthermore, a **Market Rent Guardrail** automatically flags any lease that deviates by more than ±30% from the live RentCast AVM, instantly catching potential fraud or stale leases.

### 2. The Evidence Vault & Semantic Diff Engine
Lender guidelines are stored as JSONB objects in the Evidence Vault, complete with a `verified_date`, `source_url`, and `confidence_score`. The system strictly enforces the **"Unspecified" Rule**: if a data point (like a minimum FICO score) is not publicly verifiable, the UI renders "Unspecified / Requires Broker Matrix" rather than hallucinating a guess [11].

When an input changes, the **Semantic Diff Engine** classifies the change by facet. A structural change—such as shifting vesting from an LLC to an Individual—triggers a causal propagation through the **PPP Legal Branching Gate**, instantly updating the compliance posture without destroying unrelated underwriting work [12].

### 3. State-Specific Legal Sovereignty (June 2026 Baseline)
The engine hardcodes the complex reality of state-level business-purpose lending [13]:
*   **Minnesota HF 3437:** Enacted April 23, 2026; effective August 1, 2026. Explicitly exempts business-purpose DSCR loans from the §58.137 prepayment ban.
*   **Ohio & Pennsylvania:** The system runs a cron job every January to automatically update the annually indexed PPP thresholds (OH: $116,356; PA: $329,411).
*   **New Jersey:** Treated as an "Ambiguity Gate" where LLC vesting is flagged as lender-dependent until a specific matrix confirms eligibility.

---

## IV. PROBABILISTIC RISK: THE MONTE CARLO MODULE

Point-estimate DSCR is fundamentally flawed because real-world risks (like vacancy and rent compression) are correlated. The Sovereign OS replaces static stress tests with a **10,000-trial Monte Carlo simulation** using a t-copula distribution [14].

The output generates a **Tornado Chart** that visually identifies the single "Binding Sensitivity" (e.g., Market Rent Volatility or an Insurance Premium Spike). It provides the Probability of Default `P(DSCR < 1.00)` and the 1-in-20-year stress scenario (5th-Percentile DSCR). Any deal with a `P(DSCR < 1.00) > 15%` triggers a hard NO-GO, regardless of the lender's Track A qualification.

---

## References

[1] DSCRDUALTRUTHENGINECHATGPTRESEARCH.md, "Dual-Track DSCR Truth Engine"
[2] DSCRProDealDeskInstitutional-GradeAnalyticalEngineSpecification.md, "Part I — Full Return Modeling"
[3] DSCR_Engine_Professional_v10.md, "Part B′ — Tax, Reassessment, Insurance"
[4] DSCRProDealDeskInstitutional-GradeAnalyticalEngineSpecification.md, "Kill-Switch Conditions"
[5] mortgageworkspace.com, "How Mortgage POS Interfaces Speed Up Pre-Qualification in 2026"
[6] DSCRProDealDeskInstitutional-GradeAnalyticalEngineSpecification.md, "The Three-Metric Credit Standard"
[7] DSCRProDealDeskInstitutional-GradeAnalyticalEngineSpecification.md, "Adverse-Case Recourse Table"
[8] macromicro.me, "US - 10-Year Treasury Yield"
[9] DeconstructingtheTreatmentOSBlueprint_AnArchitectural,Market,andComplianceValidation.pdf, "Technical Architecture"
[10] High-EndAIOCRIncomeVerification&Real-TimeMarketDataIntegrationforDSCRLending.md, "Part 1: AI OCR Income Verification Pipeline"
[11] TheGodmodeBlueprint_AFour-PillarArchitecturefortheDefinitiveDSCRProDealDesk.pdf, "The Evidence Vault"
[12] DeconstructingtheTreatmentOSBlueprint_AnArchitectural,Market,andComplianceValidation.pdf, "Semantic Diff Engine"
[13] DSCR-Pro-Deal-Desk-Spec.md, "Acceptance Criteria — Definition of Done"
[14] DSCRProDealDeskInstitutional-GradeAnalyticalEngineSpecification.md, "Part III — Probabilistic Stress Engine"
