# Actionable Next Steps for the 20X DSCR Deal Engine

Following the deep research phase, the following actionable steps have been identified to move the **20X DSCR Deal Engine** toward implementation and market launch. These steps are prioritized based on their impact on the platform's core functionality and competitive advantage.

## 1. Technical Development & Integration (High Priority)

### 1.1 Initiate API Integration with FRED and Zillow
*   **Action:** Secure API keys and develop the data normalization layer to ingest live interest rates from FRED and rental metrics from Zillow.
*   **Objective:** Replace static planning inputs with real-time market benchmarks for the **Iterative Rate-DSCR Solver**.

### 1.2 Pilot OCR Implementation with Ocrolus
*   **Action:** Set up a sandbox environment with Ocrolus to test the automated extraction of data from sample lease agreements and Airbnb revenue reports.
*   **Objective:** Validate the "Document Understanding" layer for automated income verification.

### 1.3 Calibrate Monte Carlo Risk Engine
*   **Action:** Implement the identified volatility parameters (e.g., 9.15%–9.66% for multifamily rent) and correlation coefficients (e.g., 0.6 for Rate ↔ Cap Rate) into the simulation model.
*   **Objective:** Ensure the **Monte Carlo Risk Engine** provides empirically grounded probability distributions.

## 2. Market Intelligence & Content Updates (High Priority)

### 2.1 Update Lender Matrix with Rocket Pro TPO
*   **Action:** Incorporate Rocket Pro's 1.00x DSCR guidelines and pricing incentives into the **Lender Matching Engine**.
*   **Objective:** Maintain a competitive and up-to-date lender database.

### 2.2 Standardize DSCR Second-Lien Parameters
*   **Action:** Formalize the 75% CLTV cap and 700+ FICO requirements for second-lien products within the engine's rule set.
*   **Objective:** Enable accurate automated underwriting for equity extraction scenarios.

## 3. Compliance & Regulatory Automation (Medium Priority)

### 3.1 Build the State-Level PPP Validator
*   **Action:** Develop a lookup table for state-specific PPP thresholds (e.g., $329,411 for PA, $116,356 for OH) and integrate it into the loan structuring workflow.
*   **Objective:** Automate legal compliance checks for prepayment penalty structures.

### 3.2 Implement STR Registration Gating
*   **Action:** Add a mandatory field for STR permit verification in the STR underwriting module, with specific gating for restrictive markets like Los Angeles.
*   **Objective:** Prevent reliance on legally ambiguous income for baseline qualification.

## 4. Product Strategy & Growth (Medium Priority)

### 4.1 Launch the Refi & Seasoning Tracker MVP
*   **Action:** Develop the "retention engine" to track 6- and 12-month seasoning clocks for funded deals and alert users to refinance opportunities.
*   **Objective:** Drive repeat business and increase customer lifetime value.

### 4.2 Refine Unit Economics by Channel
*   **Action:** Implement tracking for Cost Per Lead (CPL) and Cost Per Funded Loan (CPFL) across different acquisition channels (SEO vs. Paid Search).
*   **Objective:** Optimize marketing spend based on the identified $500–$3,000 CPFL benchmarks.
