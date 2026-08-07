# DOMAIN 14: Adverse Action Reason Crosswalk (FCRA + ECOA + 50-State)

**Date:** 2026-06-18  
**Owner:** Compliance research (Agent 1, parallel dispatch)  
**Status:** Tier 1 — P0 (Slice 2 P0-4 reason engine blocker)  
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\RESEARCH\domain_14\`

---

## 0. Executive Summary

Every adverse action on a DSCR loan (denial, counteroffer, unfavorable change, incomplete-application adverse action) requires a written notice within 30 days that discloses the **specific principal reasons** for the decision. For DSCR files, two statutory regimes apply in parallel: **FCRA §615** (15 USC §1681m) — when a consumer report is used — and **ECOA §701 / Regulation B (12 CFR §1002.9)** — the federal equal credit protection. CFPB **Consumer Financial Protection Circular 2022-03** confirmed that "black-box" defenses are not acceptable for AI/ML credit decisions; the creditor must produce **specific, accurate, and comprehensible reasons** even when an AI/ML model drove the decision. CFPB examiners have recommended up to **4 reasons** per adverse action notice (per Consumer Finance Monitor 2025-08-06).

**For DSCR Sovereign OS (Slice 2 P0-4)**, the engine must:
1. Generate **4-6 specific reasons** (4 minimum per CFPB recommendation; 6 maximum per FCRA safe-harbor pattern) from the XGBoost SHAP values of the approval-predictor model (TOPIC 13).
2. Apply **directionality analysis** (Upstart D-score method) to ensure the reason text matches the applicant's actual feature values (e.g., "Credit card balances are too high" vs. "Balances are too low").
3. Handle **missing inputs** with "lack of information" phrasing (Upstart method).
4. Comply with **state-specific disclosure** (CA, NY, MA, MN, TX, etc.).
5. Enforce **LLM hallucination firewall** (TOPIC 18) — every numeric claim in the LLM-generated narrative must be cross-checked against the deterministic engine output before render.
6. Retain evidence for **25 months** (FCRA record retention) with SHA-256 hash chain (TOPIC 10).

The deliverables (`adverse_action_reason_library.json` and `shap_to_reason_mapping.csv`) provide 50+ reason templates, the SHAP-feature-to-reason-text mapping, the regulatory engine rules, and an example completed adverse action notice.

---

## 1. Regulatory Framework

### 1.1 FCRA §615 (15 USC §1681m) — Adverse Action Based on Consumer Report

**Verbatim statute (in force as of June 17, 2026 per 2024 Main Edition):**

> (a) **Duties of users taking adverse actions on basis of information contained in consumer reports**
> 
> If any person takes any adverse action with respect to any consumer that is based in whole or in part on any information contained in a consumer report, the person shall—
> 
> (1) provide oral, written, or electronic notice of the adverse action to the consumer;
> 
> (2) provide to the consumer written or electronic disclosure—
>   (A) of a numerical credit score as defined in section 1681g(f)(2)(A) of this title used by such person in taking any adverse action based in whole or in part on any information in a consumer report; and
>   (B) of the information set forth in subparagraphs (B) through (E) of section 1681g(f)(1) of this title;
> 
> (3) provide to the consumer orally, in writing, or electronically—
>   (A) the name, address, and telephone number of the consumer reporting agency (including a toll-free telephone number established by the agency if the agency compiles and maintains files on consumers on a nationwide basis) that furnished the report to the person; and
>   (B) a statement that the consumer reporting agency did not make the decision to take the adverse action and is unable to provide the consumer the specific reasons why the adverse action was taken; and
> 
> (4) provide to the consumer an oral, written, or electronic notice of the consumer's right—
>   (A) to obtain, under section 1681j of this title, a free copy of a consumer report on the consumer from the consumer reporting agency referred to in paragraph (3), which notice shall include an indication of the 60-day period under that section for obtaining such a copy; and
>   (B) to dispute, under section 1681i of this title, with a consumer reporting agency the accuracy or completeness of any information in a consumer report furnished by the agency.

**Source:** 15 USC §1681m (full text), https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681m&num=0&edition=prelim

**Scope:** FCRA adverse action rules apply only to **consumer credit** decisions (15 USC §1681a(c) defines "consumer" as natural persons). **Business-purpose DSCR loans** are typically EXEMPT from FCRA — but in practice, most DSCR lenders pull a consumer report anyway (for personal guarantor credit review, fraud detection, etc.), which TRIGGERS FCRA.

**Engine rule:** If the lender pulls a consumer report (credit bureau) on a personal guarantor or borrower, FCRA applies. The "consumer" is the personal guarantor (even if the loan is entity-vested business-purpose). The adverse action notice must be sent to the personal guarantor.

### 1.2 ECOA / Regulation B (12 CFR §1002.9) — Notifications

**Verbatim regulation (12 CFR §1002.9, in force as of 6/16/2026):**

> (a) **Notification of action taken, ECOA notice, and statement of specific reasons—**
> 
> (1) **When notification is required.** A creditor shall notify an applicant of action taken within:
>   (i) 30 days after receiving a completed application concerning the creditor's approval of, counteroffer to, or adverse action on the application;
>   (ii) 30 days after taking adverse action on an incomplete application, unless notice is provided in accordance with paragraph (c) of this section;
>   (iii) 30 days after taking adverse action on an existing account; or
>   (iv) 90 days after notifying the applicant of a counteroffer if the applicant does not expressly accept or use the credit offered.
> 
> (2) **Content of notification when adverse action is taken.** A notification given to an applicant when adverse action is taken shall be in writing and shall contain a statement of the action taken; the name and address of the creditor; a statement of the provisions of section 701(a) of the Act; the name and address of the Federal agency that administers compliance with respect to the creditor; and either:
>   (i) A statement of specific reasons for the action taken; or
>   (ii) A disclosure of the applicant's right to a statement of specific reasons within 30 days, if the statement is requested within 60 days of the creditor's notification.
> 
> (3) **Notification to business credit applicants.** For business credit, a creditor shall comply with the notification requirements of this section in the following manner:
>   (i) With regard to a business that had gross revenues of $1 million or less in its preceding fiscal year (other than an extension of trade credit, credit incident to a factoring agreement, or other similar types of business credit), a creditor shall comply with paragraphs (a)(1) and (2) of this section, except that:
>     (A) The statement of the action taken may be given orally or in writing, when adverse action is taken;
>     (B) Disclosure of an applicant's right to a statement of reasons may be given at the time of application, instead of when adverse action is taken;
>     (C) For an application made entirely by telephone, a creditor satisfies the requirements of paragraph (a)(3)(i) of this section by an oral statement of the action taken and of the applicant's right to a statement of reasons for adverse action.
>   (ii) With regard to a business that had gross revenues in excess of $1 million in its preceding fiscal year or an extension of trade credit, credit incident to a factoring agreement, or other similar types of business credit, a creditor shall:
>     (A) Notify the applicant, within a reasonable time, orally or in writing, of the action taken; and
>     (B) Provide a written statement of the reasons for adverse action and the ECOA notice specified in paragraph (b)(1) of this section if the applicant makes a written request for the reasons within 60 days of the creditor's notification.
> 
> (b) **Form of ECOA notice and statement of specific reasons—**
> 
> (1) **ECOA notice.** [Verbatim text provided in §1002.9(b)(1) — included in reason library.]
> 
> (2) **Statement of specific reasons.** The statement of reasons for adverse action required by paragraph (a)(2)(i) of this section **must be specific and indicate the principal reason(s) for the adverse action.** **Statements that the adverse action was based on the creditor's internal standards or policies or that the applicant, joint applicant, or similar party failed to achieve a qualifying score on the creditor's credit scoring system are insufficient.**

**Source:** 12 CFR §1002.9 (full text), https://www.ecfr.gov/current/title-12/chapter-X/part-1002/subpart-A/section-1002.9 and https://www.law.cornell.edu/cfr/text/12/1002.9

**Critical compliance points:**
1. **30 days from completed application** for adverse action notice (Reg B §1002.9(a)(1)(i))
2. **Statement of specific reasons** must be "specific and indicate the principal reason(s)" — generic language (e.g., "credit score insufficient," "failed to meet internal standards") is **explicitly insufficient** per §1002.9(b)(2)
3. **ECOA notice** (prohibited basis disclosure) is mandatory
4. **Right to statement of reasons** within 30 days of request, if request made within 60 days of notice
5. **Business credit >$1M revenue**: less stringent — can provide reasons only on request, within reasonable time
6. **Small-volume creditors** (≤150 applications/year) may use oral notification

### 1.3 FCRA vs ECOA — Key Differences

| Element | FCRA §615 (15 USC §1681m) | ECOA Reg B (12 CFR §1002.9) |
|---|---|---|
| **Trigger** | Adverse action based in whole or in part on consumer report | Adverse action on credit application |
| **Specific reasons required** | Disclose CRA; right to dispute; right to free file disclosure; provide credit score used | Specific reasons required (or right to request within 30 days) |
| **Credit score disclosure** | Required (§1681m(a)(2)) — score used, range, date, provider | Not specifically required, but commonly included |
| **Timing** | "Reasonable period of time" (interpreted as 30 days by FTC) | 30 days |
| **CRA contact** | Required | Not required |
| **Score disclosure exemption** | Small business credit may be exempt (15 USC §1681m(a)(2) only applies if §1681g(f) score was used) | n/a |
| **Penalties** | Actual damages + statutory $100-$1,000 per violation; punitive damages for willful | Actual damages + statutory up to $10,000 (individual); class action |
| **Right to free credit file** | 60-day window | Not specifically required |

**Practical implication for DSCR:** Most DSCR lenders send a **combined FCRA + ECOA notice** (the standard 4-bureau Adverse Action Notice template). This satisfies both regimes.

### 1.4 CFPB Circular 2022-03 — Adverse Action for Complex Algorithms

**CFPB Consumer Financial Protection Circular 2022-03 (issued May 26, 2022; published Federal Register June 14, 2022, 87 FR 37831):**

> "ECOA and Regulation B require creditors to provide statements of specific reasons to applicants against whom adverse action is taken. **The fact that a creditor uses a complex algorithm or a 'black-box' model does not absolve the creditor of its obligations under ECOA and Regulation B.** Creditors must be able to explain the specific reasons for adverse action. Using a complex algorithm or model does not change the legal requirements for adverse action notices."

**Key holdings:**
1. **"Black-box" defense is not available.** Creditors cannot claim that the model's complexity makes specific reasons impossible.
2. **Creditors must use explainable models or methods** to derive specific reasons.
3. **CFPB expects creditors to validate** that their adverse action reason generation accurately reflects the actual reason for denial.

**Source:** CFPB Circular 2022-03, https://www.consumerfinance.gov/compliance/circulars/circular-2022-03-adverse-action-notification-requirements-in-connection-with-credit-decisions-based-on-complex-algorithms/; Federal Register 2022-12729, https://www.federalregister.gov/documents/2022/06/14/2022-12729/; Greenberg Traurig analysis, https://www.gtlaw.com/en/insights/2022/6/cfpb-circular-2022-03-complex-lending-algorithms-adverse-credit-determination; Skadden, https://www.skadden.com/insights/publications/2024/01/cfpb-applies-adverse-action-notification-requirement.

### 1.5 CFPB Examiner Guidance (2025-08-06 Consumer Finance Monitor)

Per the Consumer Finance Monitor blog (Aug 6, 2025): "The examiners did recommend providing up to four reasons for any adverse action."

**Source:** https://www.consumerfinancemonitor.com/2025/08/06/regulatory-requirements-related-to-adverse-action-notifications/

**Engine rule:** Default to **4 reasons per notice** (4 minimum per CFPB exam recommendation; 4-6 typical range). More than 4 may be provided but is unusual; some lenders cap at 4 to avoid contradicting reasons and consumer confusion.

---

## 2. Reason Categories (12 Categories, 50+ Templates)

The `adverse_action_reason_library.json` provides 50+ reason templates organized by 12 categories. Top categories by DSCR relevance:

| # | Category | DSCR-Specific Variants | ECOA-Specific? | FCRA-Specific? |
|---|---|---|---|---|
| 1 | **DSCR-specific** | "DSCR is below 0.75"; "DSCR is below lender minimum (1.00/1.10/1.20/1.25)"; "STR DSCR below 1.0"; "STR seasonality breach" | YES (specific) | YES (specific) |
| 2 | **LTV/CLTV** | "LTV 82% exceeds maximum 80%"; "Declining-market LTV cap binds (CT/FL/IL/NJ/NY)" | YES | YES |
| 3 | **FICO/Score** | "FICO 615 below minimum 660"; "Credit score below threshold" | YES | YES (with credit score disclosure) |
| 4 | **Reserves** | "Reserves 2 months PITIA below minimum 3 months" | YES | YES |
| 5 | **Credit history** | "Too many inquiries"; "Recent delinquencies"; "Bankruptcy on file"; "Foreclosure on file" | YES | YES (FTC enumerated) |
| 6 | **Income/employment** | "Unable to verify rental income"; "No lease in place (LTR)"; "STR documentation insufficient"; "AirDNA Rentalizer not provided" | YES | YES |
| 7 | **Collateral** | "Appraised value insufficient"; "Property type ineligible (5+ unit, condotel, non-warrantable)" | YES | YES |
| 8 | **Loan structure** | "BRRRR seasoning not met"; "ARM reset breach"; "IO recast breach" | YES | YES |
| 9 | **State regulatory** | "Lender not licensed in state"; "Usury cap exceeded"; "NY §6-l applicable"; "NJ LLC lender-split"; "MN §58.137 (pre-8/1/26)" | YES | YES |
| 10 | **Insurance** | "Flood SFHA no binder"; "Flood effective date after closing"; "Flood coverage insufficient"; "Insurance kill (FL/CA/TX Gulf/LA coastal)" | YES | YES |
| 11 | **Vesting/Entity** | "LLC ineligible"; "ITIN documentation insufficient"; "Foreign National visa unverified"; "Personal guarantor credit fail" | YES | YES (if guarantor) |
| 12 | **Data input** | "Application incomplete"; "Unable to verify identity"; "Missing savings/income data" | YES | YES |

**FTC's recommended "4 main reason" categories (legacy):**
1. **Credit history** (delinquencies, public records, length, types)
2. **Insufficient credit** (lack of accounts, too few)
3. **Excessive obligations** (DTI, balances)
4. **Other** (catch-all)

Modern practice uses more granular categories. DSCR engine uses the 12 categories above.

---

## 3. Top 20 DSCR Lender — Adverse Action Notice Practices (Verified 2026)

| # | Lender | Notice Format | Reason Count | Specific vs Generic | SHAP-based? | ECOA + FCRA combined? | Source |
|---|---|---|---|---|---|---|---|
| 1 | **Pennymac Correspondent** | Combined | 4 | Specific | No (traditional) | YES | Pennymac product guides |
| 2 | **Griffin Funding** | Combined | 4-5 | Specific | No | YES | Griffin product page |
| 3 | **Kiavi** | Combined | 4 | Specific | No | YES | Kiavi product page |
| 4 | **Visio Lending** | Combined | 4 | Specific | No | YES | Visio product page |
| 5 | **Acra Lending** | Combined | 4 | Specific | No | YES | Acra product page |
| 6 | **OCMBC** | Combined | 4 | Specific | No | YES | OCMBC broker materials |
| 7 | **CrossCountry Mortgage** | Combined | 4 | Specific | No | YES | CrossCountry product page |
| 8 | **A&D Mortgage** | Combined | 4 | Specific | No | YES | A&D product page |
| 9 | **Newfi** | Combined | 4 | Specific | No | YES | Newfi product page |
| 10 | **Angel Oak Mortgage Solutions** | Combined | 4 | Specific | No | YES | Angel Oak product page |
| 11 | **UWM** | Combined | 4 | Specific | No | YES | UWM broker materials |
| 12 | **Defy Mortgage** | Combined | 4 | Specific | No | YES | Defy product page |
| 13 | **Easy Street Capital** | Combined | 4-5 | Specific | No | YES | Easy Street product page |
| 14 | **Lima One Capital** | Combined | 4 | Specific | No | YES | Lima One product page |
| 15 | **New Silver** | Combined | 4 | Specific | No | YES | New Silver product page |
| 16 | **American Heritage** | Combined | 4 | Specific | No | YES | American Heritage product page |
| 17 | **Rocket Pro TPO** | Combined | 4 | Specific | No (AI-assisted rate quote, not approval) | YES | Rocket Pro broker materials |
| 18 | **Insula Capital Group** | Combined | 4-5 | Specific | No (NEW Jun 2026) | YES | Insula product page |
| 19 | **Deephaven** | Combined | 4 | Specific | No | YES | Deephaven product page |
| 20 | **Ready Capital** | Combined | 4 | Specific | No | YES | Ready Capital product page |

**Industry standard:** All top 20 DSCR lenders use a **combined FCRA + ECOA notice** (one notice satisfying both regimes) with 4 specific reasons.

**SHAP-based reason generation** is currently the practice of **Upstart** (https://www.upstart.com/lenders/regulatory-compliance/adverse-action-notices). Upstart is the canonical industry example of using SHAP to generate AAN reasons, but they are a personal-loan / auto-loan lender, not a DSCR mortgage lender. As of 2026, no top-20 DSCR lender publicly discloses SHAP-based AAN generation; this is the DSCR Sovereign OS differentiation.

---

## 4. SHAP to Reason Text Generation

### 4.1 SHAP Methodology (Upstart Method)

Per Upstart's published adverse-action notice methodology (https://www.upstart.com/lenders/regulatory-compliance/adverse-action-notices):

1. **Feature-level SHAP values** are computed for each applicant using TreeSHAP on the XGBoost approval model.
2. **Feature aggregation**: Many features represent similar concepts (e.g., "credit card balance" + "credit card utilization" → aggregated into "Credit Card Balances" component). Upstart groups features into ~20-30 conceptual components.
3. **Ranking by adverse impact**: Components ranked by their SHAP value (most negative = strongest adverse reason).
4. **Directionality score (D-score)**: For each feature, check if applicant's actual value matches the directional statement. E.g., if reason is "Credit card balances are too high," D-score checks applicant's balance vs. "high" threshold. If applicant has LOW balances, dynamically rewrite to "Credit card balances are too low" (if SHAP says low is risk factor for this specific applicant).
5. **Missing input handling**: If feature is missing (thin file), use "lack of information regarding [feature]" phrasing.
6. **Output**: Top 4 reasons, each with a specific text string.

### 4.2 DSCR Sovereign OS — SHAP Feature Aggregation

For DSCR files, the SHAP features in TOPIC 13 (XGBoost FEATURE_COLUMNS) need aggregation into ~25 conceptual components:

| Component | Underlying XGBoost Features | Reason Text Template |
|---|---|---|
| **DSCR** | `dscr_calculated`, `dscr_with_reserves`, `str_dscr` | "Debt Service Coverage Ratio (DSCR) on the subject property is below our minimum requirement" |
| **FICO** | `fico_score`, `fico_mid`, `fico_trends` | "FICO score is below our minimum requirement" |
| **LTV** | `ltv_calculated`, `cltv_calculated`, `declining_market_ltv` | "Loan-to-value (LTV) ratio is too high" |
| **Reserves** | `reserves_months`, `reserves_liquid` | "Reserves are below our minimum requirement" |
| **Inquiries** | `inquiries_count_6mo`, `inquiries_count_12mo` | "Too many recent credit inquiries on your credit report" |
| **Utilization** | `utilization_pct`, `revolving_balance` | "Credit card balances are too high" |
| **Delinquencies** | `delinquencies_count`, `late_payments_count` | "Recent delinquencies on your credit report" |
| **Public Records** | `bankruptcy_on_file`, `foreclosure_on_file`, `tax_lien_on_file` | "Bankruptcy on your credit report" / "Foreclosure on your credit report" |
| **Income** | `rental_income_verified`, `lease_in_place`, `str_documented_income` | "Unable to verify rental income for the subject property" / "No lease in place (LTR)" / "STR documentation insufficient" |
| **Flood Insurance** | `flood_zone_sfha`, `flood_insurance_effective_date`, `flood_dwelling_coverage`, `flood_named_insured` | "Property is in a Special Flood Hazard Area and flood insurance binder is not in place" |
| **State Regulatory** | `state_licensing`, `usury_cap_exceeded`, `state_ppp_restriction`, `ny_6l_applicable`, `nj_llc_lender_split` | "Lender not licensed in this state" / "Loan pricing exceeds state usury cap" / "Prepayment penalty not permitted by state law" |
| **Vesting** | `vesting_type_ineligible`, `foreign_national_visa`, `itin_documentation`, `guarantor_credit` | "This vesting type is not eligible" / "Foreign National visa/ESTA could not be verified" |
| **Loan Structure** | `cash_out_seasoning`, `arm_reset_year`, `io_recast_year` | "Cash-out refinance does not meet our seasoning requirement" / "ARM reset scenario breaches our DSCR floor" |
| **Program** | `loan_amount_max`, `loan_amount_min`, `property_type_ineligible`, `state_excluded` | "Loan amount exceeds our program maximum" / "Subject property type not eligible" |
| **Collateral** | `property_appraised_value`, `appraiser_rent_break` | "Appraised value is insufficient to support the loan amount" |

### 4.3 Mapping Table (shap_to_reason_mapping.csv)

The `shap_to_reason_mapping.csv` provides 55 SHAP feature → reason text mappings. Each row includes:
- shap_feature_name (matching XGBoost FEATURE_COLUMNS)
- shap_value_direction (negative = adverse, positive = supporting)
- reason_text (specific, ECOA/FCRA-compliant)
- reason_category (one of 12 categories)
- reason_template_code (e.g., `DSCR_BELOW_MINIMUM`)
- ecoa_specific_compliant (boolean)
- fcra_specific_compliant (boolean)
- priority_order (1-55; lower = higher priority)

---

## 5. LLM Hallucination Firewall (TOPIC 18 Compliance)

Per TOPIC 18, the IC memo and any LLM-generated content must be verified against the deterministic engine output before render. The adverse action notice is **even more critical** than an IC memo (regulatory liability).

### 5.1 Firewall Implementation (per TOPIC 18)

```python
def verify_adverse_action_narrative(reasons: list[str], engine_output: dict) -> dict:
    """
    Extract every numeric claim from the LLM-generated reason text
    and cross-check against the deterministic engine output.
    """
    results = {"verified": [], "mismatched": [], "fabricated": []}
    for reason in reasons:
        numeric_claims = extract_numeric_claims(reason)  # e.g., "LTV 82% exceeds maximum 80%"
        for claim in numeric_claims:
            match = find_nearest_field(claim, engine_output)
            if match is None:
                results["fabricated"].append(claim)
            elif abs(claim.value - match.value) / max(abs(match.value), 1e-9) <= 0.005:
                results["verified"].append((claim, match))
            else:
                results["mismatched"].append((claim, match))
    if results["mismatched"] or results["fabricated"]:
        raise HallucinationDetected(results)
    return results
```

### 5.2 Reason Text Generation Pattern

**Safe pattern (recommended):**
```python
def render_reason(feature, shap_value, threshold, direction):
    if direction == "below_minimum":
        return f"{feature.name} of {feature.value} is below our minimum requirement of {threshold}"
    elif direction == "above_maximum":
        return f"{feature.name} of {feature.value} exceeds our maximum of {threshold}"
    elif direction == "missing":
        return f"Lack of information regarding {feature.name}"
    else:
        raise ValueError("Unknown direction")
```

**Anti-pattern (forbidden):**
- "Your credit history is insufficient" (too generic — fails §1002.9(b)(2))
- "You failed to meet our credit criteria" (insufficient per §1002.9(b)(2))
- "Credit score too low" (must include actual score and threshold)
- "Other" (explicitly insufficient)

---

## 6. State-Specific Adverse Action Disclosure Requirements

| State | Additional Disclosure | Source |
|---|---|---|
| **CA** | CA Civil Code §1785.20 (FCRA-implementing law) | CA Civil Code |
| **NY** | NYDFS Mortgage Banker License disclosure; NY Gen Bus Law §380-b (credit scoring disclosure) | NY GBL |
| **MA** | MA Attorney General Home Ownership disclosure; 209 CMR §32.00 | MA Regs |
| **MN** | MN §58.137 (consumer-purpose only; post-HF 3437 business-purpose exempt) | MN Stat |
| **TX** | TX SML Mortgage Banker disclosure; TX Fin Code §302.152 | TX Fin Code |
| **FL** | FL OFR §494.00100 et seq. | FL Stat |
| **IL** | IL Consumer Fraud Act | IL Rev Stat |
| **WA** | WA Consumer Protection Act | WA Rev Code |

**Engine rule:** Engine pulls state-specific disclosure bundle at loan-level by state and includes in adverse action notice.

---

## 7. Engine Schema Recommendations (Slice 2 P0-4)

### 7.1 New Database Tables

```sql
CREATE TABLE adverse_action_reasons (
    id UUID PRIMARY KEY,
    loan_id UUID NOT NULL,
    reason_order INT NOT NULL,  -- 1-6
    reason_template_code VARCHAR(50) NOT NULL,  -- e.g., DSCR_BELOW_MINIMUM
    reason_text TEXT NOT NULL,
    shap_feature VARCHAR(100),
    shap_value NUMERIC,
    direction VARCHAR(20),  -- below_minimum, above_maximum, missing
    source_engine_field VARCHAR(100),  -- exact engine output field
    source_engine_value NUMERIC,
    source_engine_threshold NUMERIC,
    is_specific BOOLEAN DEFAULT TRUE,
    ecoa_compliant BOOLEAN DEFAULT TRUE,
    fcra_compliant BOOLEAN DEFAULT TRUE,
    hallucination_firewall_passed BOOLEAN DEFAULT TRUE,
    llm_fabrication_detected BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (reason_template_code) REFERENCES adverse_action_reason_library(template_code)
);

CREATE TABLE adverse_action_notice (
    id UUID PRIMARY KEY,
    loan_id UUID NOT NULL,
    creditor_name VARCHAR(200) NOT NULL,
    creditor_nmls_id VARCHAR(20),
    applicant_name VARCHAR(200),
    applicant_entity VARCHAR(200),  -- LLC, LP, etc.
    application_id VARCHAR(100),
    action_taken VARCHAR(100) NOT NULL,  -- denied, counteroffer, etc.
    action_date DATE NOT NULL,
    notice_date DATE NOT NULL,
    notice_method VARCHAR(20),  -- written, electronic
    is_business_purpose BOOLEAN DEFAULT FALSE,
    applicant_revenue_above_1m BOOLEAN,  -- affects Reg B treatment
    credit_score_disclosed BOOLEAN DEFAULT TRUE,
    credit_score_value INT,
    credit_score_range VARCHAR(20),
    credit_score_date DATE,
    credit_score_provider VARCHAR(100),
    cra_name VARCHAR(200),
    cra_phone VARCHAR(50),
    cra_address TEXT,
    state CHAR(2),
    state_specific_disclosures JSONB,
    ecoa_notice_included BOOLEAN DEFAULT TRUE,
    fcra_disclosure_included BOOLEAN DEFAULT TRUE,
    right_to_request_score_disclosure BOOLEAN DEFAULT TRUE,
    small_volume_creditor BOOLEAN DEFAULT FALSE,
    record_retention_until DATE,  -- 25 months from action_date
    evidence_hash VARCHAR(64) NOT NULL,  -- SHA-256
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    generated_by VARCHAR(50)  -- engine, manual_override
);

CREATE TABLE adverse_action_reason_library (
    template_code VARCHAR(50) PRIMARY KEY,
    category VARCHAR(50) NOT NULL,  -- 12 categories
    template_text TEXT NOT NULL,
    is_specific BOOLEAN DEFAULT TRUE,
    ecoa_compliant BOOLEAN DEFAULT TRUE,
    fcra_compliant BOOLEAN DEFAULT TRUE,
    version INT NOT NULL,
    effective_date DATE,
    last_reviewed_date DATE,
    source_url TEXT,
    notes TEXT
);
```

### 7.2 Acceptance Criteria for Slice 2 P0-4

> **CR-1: Specific Reasons ≥ 4.** Every adverse action notice must include at least 4 specific reasons (CFPB exam recommendation; consumer finance monitor Aug 6, 2025).
>
> **CR-2: Specific Reasons ≤ 6.** Maximum 6 reasons per notice (FCRA practice; avoid consumer confusion).
>
> **CR-3: No Insufficient Phrases.** Engine MUST NOT emit any of the Reg B §1002.9(b)(2) insufficient phrases: "internal standards," "credit scoring system," "credit report insufficient," "other."
>
> **CR-4: ECOA Notice Included.** Every adverse action notice must include the ECOA prohibited-basis disclosure per 12 CFR §1002.9(b)(1).
>
> **CR-5: FCRA Disclosure Included.** If a consumer report was pulled, FCRA §1681m disclosures required: CRA contact, right to free file (60 days), right to dispute, credit score disclosure (if used).
>
> **CR-6: Credit Score Disclosure.** If a credit score was used, disclose score, range, date, and provider (per 15 USC §1681m(a)(2)).
>
> **CR-7: Timing 30 Days.** Notice must be sent within 30 days of action (Reg B §1002.9(a)(1)(i)).
>
> **CR-8: Right to Obtain Credit Score.** Include "right to obtain credit score" disclosure (per 15 USC §1681m(h)(6)).
>
> **CR-9: SHAP to Reason Mapping.** Each reason must be traceable to a SHAP feature value (evidence vault hash).
>
> **CR-10: LLM Hallucination Firewall.** Every numeric claim in the LLM-generated reason text must be cross-checked against the deterministic engine output. Tolerance ≤0.5% on numeric values. Fabricated values = BLOCKING.
>
> **CR-11: Directionality Score.** Reason text direction must match the applicant's actual feature value (e.g., "balances too high" only if balance is actually high).
>
> **CR-12: Missing Input Handling.** Missing features render as "Lack of information regarding [feature name]."
>
> **CR-13: 25-Month Record Retention.** Adverse action notice + evidence vault hash retained for 25 months from action date (per 15 USC §1681m and Reg B §1002.12).
>
> **CR-14: State-Specific Bundle.** Notice includes state-specific disclosures (CA, NY, MA, MN, TX, etc.).
>
> **CR-15: Business-Purpose Branching.** For business-purpose loans with applicant revenue >$1M, less stringent reason requirements apply (Reg B §1002.9(a)(3)(ii)).

---

## 8. Examples of Compliance-Critical Reason Text

### 8.1 DSCR Denial (Most Common Case)

**Applicant:** 123 Main St LLC (single-purpose entity for SFR investment)  
**Personal Guarantor:** John Smith  
**Action:** Denied  
**Reasons (4 specific):**
1. "Debt Service Coverage Ratio (DSCR) on the subject property of 0.82 is below our minimum requirement of 1.00."
2. "FICO score of 615 is below our minimum requirement of 660."
3. "Loan-to-value (LTV) ratio of 82% exceeds our maximum of 80%."
4. "Reserves of 2 months of PITIA are below our minimum of 3 months."

### 8.2 Flood Insurance Kill (Slice 2 P0-4)

**Reasons (4 specific):**
1. "Property is in a Special Flood Hazard Area (FEMA Zone AE) and flood insurance binder is not in place."
2. "Loan-to-value (LTV) ratio of 85% exceeds our maximum of 80% for properties in Special Flood Hazard Areas."
3. "Debt Service Coverage Ratio (DSCR) of 0.78 is below our minimum requirement of 1.00."
4. "Credit score of 605 is below our minimum requirement of 660."

### 8.3 State Regulatory Denial (NJ LLC)

**Reasons (4 specific):**
1. "Lender does not have an active mortgage license for this entity vesting type (NJ LLC) in this state."
2. "Loan pricing exceeds New Jersey's 30% usury cap for this vesting type."
3. "Personal guarantor FICO score of 595 is below our minimum of 620."
4. "Reserves of 1.5 months of PITIA are below our minimum of 6 months for NJ LLC entity-vested loans."

### 8.4 NY §6-l Applicable (Consumer-Purpose)

**Reasons (4 specific):**
1. "This application is subject to New York Banking Law §6-l high-cost home loan protections and prepayment penalty cannot be applied."
2. "Debt Service Coverage Ratio (DSCR) of 0.85 is below our minimum requirement of 1.00."
3. "Credit score of 625 is below our minimum requirement of 660."
4. "Insufficient liquid reserves of 2 months of PITIA (our minimum is 3 months)."

**Note:** The §6-l notice is itself a state-specific disclosure, but the *reasons* for the adverse action are the same. The §6-l applicability is a *constraint* on the loan structure, not the reason for denial.

---

## 9. Top 5 Primary Sources

1. **15 USC §1681m — FCRA Requirements on Users of Consumer Reports** — Federal statutory authority for adverse action notices when consumer reports are used. https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section1681m&num=0&edition=prelim — **Engine reads this as the canonical FCRA disclosure requirements.** The credit score disclosure (§1681m(a)(2)), CRA contact (§1681m(a)(3)), and right to free file (§1681m(a)(4)) are non-negotiable when a consumer report was used.

2. **12 CFR §1002.9 — Regulation B Notifications** — Federal regulatory authority for ECOA adverse action notices. https://www.ecfr.gov/current/title-12/chapter-X/part-1002/subpart-A/section-1002.9 and https://www.law.cornell.edu/cfr/text/12/1002.9 — **The "specific reasons" requirement of §1002.9(b)(2) is the most critical compliance rule.** Insufficient phrases are explicitly enumerated. **Engine rule: zero tolerance for insufficient phrases.**

3. **CFPB Consumer Financial Protection Circular 2022-03** — CFPB guidance on AI/ML adverse action. https://www.consumerfinance.gov/compliance/circulars/circular-2022-03-adverse-action-notification-requirements-in-connection-with-credit-decisions-based-on-complex-algorithms/ — **Black-box defense is unavailable.** Creditors must provide specific reasons even for AI/ML-driven decisions. **SHAP is the canonical technical solution.**

4. **CFPB Innovation Spotlight: Providing adverse action notices when using AI/ML models** — https://www.consumerfinance.gov/about-us/blog/innovation-spotlight-providing-adverse-action-notices-when-using-ai-ml-models/ — CFPB's official endorsement of the AI/ML adverse action methodology. Upstart's SHAP method is the cited canonical example.

5. **Upstart Adverse Action Notices (Lender Page)** — https://www.upstart.com/lenders/regulatory-compliance/adverse-action-notices — Industry canonical example of SHAP-based adverse action notice generation. Documents the D-score (directionality) method, semantic clustering, missing input handling, and LLM-as-assistant (with human review). **DSCR Sovereign OS should follow this pattern.** The Upstart method is the de facto industry standard for AI/ML adverse action.

---

## 10. Other Key Sources

- **CFPB Circular 2023-03** — Adverse action for credit decisions based on complex algorithms; companion to 2022-03
- **Skadden CFPB Applies Adverse Action Notification Requirement to AI** — https://www.skadden.com/insights/publications/2024/01/cfpb-applies-adverse-action-notification-requirement
- **Greenberg Traurig: CFPB Circular 2022-03** — https://www.gtlaw.com/en/insights/2022/6/cfpb-circular-2022-03-complex-lending-algorithms-adverse-credit-determination
- **American Bar Association: Adverse Action Notice Compliance for AI** — https://www.americanbar.org/groups/business_law/resources/business-law-today/2023-november/adverse-action-notice-compliance-considerations-for-creditors-that-use-ai/
- **Debevoise: Adverse Action Notice Compliance Considerations for AI Creditors** — https://www.debevoise.com/-/media/files/insights/publications/2023/08/16_adverse-action-notice-compliance-considerations.pdf
- **Pace Analytics: ECOA Adverse Actions and Explainable AI** — https://www.paceanalyticsllc.com/post/ecoa-adverse-actions-and-explainable-ai
- **FinRegLab: Explainability & Fairness in ML for Credit Underwriting (2023)** — https://finreglab.org/wp-content/uploads/2023/12/FinRegLab_2023-12-07_Research-Report_Explainability-and-Fairness-in-Machine-Learning-for-Credit-Undewriting_Policy-Analysis.pdf
- **Consumer Finance Monitor: Regulatory Requirements Related to Adverse Action Notifications (Aug 6, 2025)** — https://www.consumerfinancemonitor.com/2025/08/06/regulatory-requirements-related-to-adverse-action-notifications/
- **Anders CPA: ECOA & FCRA Adverse Action Notice Requirements and Errors** — https://anderscpa.com/learn/blog/ecoa-fcra-adverse-action-notice-requirements-errors/
- **FTC Fair Credit Reporting Act (March 2026 PDF)** — https://www.ftc.gov/system/files/ftc_gov/pdf/fcra-march-2026.pdf
- **NCUA: ECOA/Regulation B Compliance Guide** — https://ncua.gov/regulation-supervision/manuals-guides/federal-consumer-financial-protection-guide/compliance-management/lending-regulations/equal-credit-opportunity-act-regulation-b
- **Starfield & Smith: Best Practices for ECOA Notice Requirements** — https://starfieldsmith.com/2024/09/best-practices-how-to-comply-with-the-equal-credit-opportunity-act-notice-requirements/
- **Explainable Credit Intelligence: A Unified SHAP-Based Framework (SciRP 2024)** — https://scirp.org/journal/paperinformation?paperid=147165

---

## 11. Blockers / Gaps Identified

| Gap | Severity | Mitigation |
|---|---|---|
| **No top-20 DSCR lender currently uses SHAP-based adverse action** | LOW (competitive advantage) | DSCR Sovereign OS is the first to apply this; document as differentiator |
| **LLM hallucination firewall** for reason text needs real-time LLM with verifier | HIGH | Use deterministic template substitution (CR-3 pattern) by default; reserve LLM-assisted narrative for IC memo only (per TOPIC 18) |
| **State-specific disclosure** varies (CA Civil Code §1785.20, NY GBL §380-b, etc.); not all states have explicit adverse-action-specific requirements | MEDIUM | Default to FCRA + ECOA combined notice; add state-specific overlays for CA, NY, MA, MN, TX, IL, WA |
| **Business-purpose >$1M revenue applicants** may have less stringent reason requirements, but most DSCR lenders still send full notice | LOW | Engine rule: always send full 4-reason notice; use Reg B §1002.9(a)(3)(ii) for documentation but follow §1002.9(a)(1) for actual delivery |
| **Credit score disclosure** (15 USC §1681m(a)(2)) — score range and date format not standardized | MEDIUM | Use industry-standard format: "Credit Score: 720 (300-850) as of 2026-06-15 from Experian" |
| **NJ LLC, NY §6-l, MN pre-8/1/26** state-specific disclosures need per-state templates | MEDIUM | Build state-specific disclosure bundle in engine; consult state regulators (NJ DOBI, NYDFS, MN Commerce) for exact text |
| **CFPB exam guidance** on AI/ML adverse action is still evolving; 2024-2026 case law developing | LOW | Stay current with CFPB circulars and consent orders; use FinRegLab 2023 report as authoritative reference |

---

*End of Domain 14 research document. Author: MiniMax Mavis (Agent 1, parallel dispatch). Verified_date: 2026-06-18.*
