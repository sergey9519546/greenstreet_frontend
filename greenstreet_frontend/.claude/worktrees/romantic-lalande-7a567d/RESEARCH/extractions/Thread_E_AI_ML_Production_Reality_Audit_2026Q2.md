---
type: synthesis
status: drafted
title: "Thread E: AI/ML Production Reality Audit 2026 Q2"
summary: "Audit of AI/ML production-readiness for the DSCR engine. XGBoost, TimesFM 2.5 ICF, agentic underwriting, MRM documentation per OCC 2026-13."
created: 2026-06-22
vaulted_at: 2026-06-22
author: Mavis (root session mvs_b78f9d32cd6348d6a48278d25e380ca4)
---

# Thread E — AI/ML Production Reality Audit (DSCR Credit Decisioning POC)

**Date:** 2026-06-20
**Author:** Mavis (research-mode, no code)
**Status:** Final draft
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\_obsidian_vault\_research\extractions\Thread_E_AI_ML_Production_Reality_Audit_2026Q2.md`

---

## 0. Why this thread exists

Master Plan v11 §6 lists "XGBoost credit decisioning POC" as one of four Q3 2026 immediate actions. The Tier 4 Deep-Dive (2026-06-20) flagged that any third-party model purchase does NOT escape model risk management — OCC Bulletin 2026-13 explicitly applies MRM to vendor products. That makes "build vs buy" a question about who owns the validation burden, not whether you owe it.

This thread audits the realistic scope of a self-built credit decisioning POC vs the vendor claims from Scienaptic AI, Zest AI, and Argyle. Output: a defensible Q3-Q4 2026 plan for the XGBoost POC with hard regulatory and engineering constraints surfaced.

## 1. The new regulatory floor (what just changed April 17, 2026)

**Primary source:** OCC Bulletin 2026-13 / SR 26-2 / interagency revised guidance — issued April 17, 2026 by Federal Reserve, FDIC, OCC. Supersedes the 2011 SR 11-7.

URLs (verified live):
- https://www.occ.gov/news-issuances/bulletins/2026/bulletin-2026-13.html
- https://www.federalreserve.gov/supervisionreg/srletters/SR2602.pdf
- https://www.occ.treas.gov/news-issuances/bulletins/2026/bulletin-2026-13a.pdf
- News release: https://www.occ.gov/news-issuances/news-releases/2026/nr-occ-2026-29.html
- Third-party summaries (Schneider Downs, Sullivan & Cromwell, PwC): https://schneiderdowns.com/our-thoughts-on/banking-agencies-revise-model-risk-management-guidance/, https://www.sullcrom.com/insights/memo/2026/April/OCC-Fed-FDIC-Issue-Revised-Guidance-Model-Risk-Management, https://www.pwc.com/us/en/industries/financial-services/library/our-take/model-risk-guidance-private-fund-reporting-apr-24-2026.html

**Three operational changes that matter to us:**

1. **Definition of "model" broadened.** Per PwC: "a complex quantitative method, system, or approach that applies statistical, economic, or financial" methods. An XGBoost credit-decisioning classifier built in-house absolutely qualifies. So does any "policy rule set" that encodes rate-sheet logic + overlays. This is not just ML — it touches our Slice 1 reserves logic too.

2. **Vendor and third-party products in scope.** Per OCC NR 2026-29: "The guidance also discusses considerations specific to vendor and other third-party products, including validation of these products." Translation: buying Scienaptic or Zest doesn't make MRM somebody else's problem. The lender still owes independent validation, ongoing monitoring, and outcome testing.

3. **Effective date:** Banks were expected to comply on a "reasonable" timeline per their next exam cycle. For a non-bank DSCR lender that partners with banks (our channel), the indirect pressure is real — bank partners will start asking for our model documentation when they audit us.

**Implication for build path:** A self-built POC is no longer a regulatory free pass. We owe at minimum: development documentation, conceptual soundness review, ongoing monitoring, outcomes analysis, and clear vendor-model governance (if we use any third-party signal). The 2011-era SR 11-7 was "guidance"; the 2026 revision is closer to enforceable supervisory expectation (still guidance, but with sharper teeth).

## 2. Adverse action explainability (the wall every AI credit model hits)

**Primary sources:**
- Regulation B §1002.9 (CFPB): https://www.consumerfinance.gov/rules-policy/regulations/1002/9 — requires "statement of specific reasons" for adverse action
- CFPB Circular 2022-03: Adverse action notification requirements for credit decisions based on complex algorithms — https://data.aclum.org/storage/2025/01/CFPB_www_consumerfinance_gov_compliance_circulars_circular-2022-03-adverse-action-notification-requirements-in-connection-with-credit-decisions-based-on-complex-algorithms.pdf
- American Bar Association (Nov 2023): https://www.americanbar.org/groups/business_law/resources/business-law-today/2023-november/adverse-action-notice-compliance-considerations-for-creditors-that-use-ai/
- Skadden (Jan 2024): https://www.skadden.com/insights/publications/2024/01/cfpb-applies-adverse-action-notification-requirement
- Debevoise (Aug 2023): https://www.debevoise.com/-/media/files/insights/publications/2023/08/16_adverse-action-notice-compliance-considerations.pdf
- CFPB Innovation Spotlight blog: https://www.consumerfinance.gov/about-us/blog/innovation-spotlight-providing-adverse-action-notices-when-using-ai-ml-models/
- Pace Analytics LLC: https://www.paceanalyticsllc.com/post/ecoa-adverse-actions-and-explainable-ai — "Adverse Action Notification reasons produced by AI-based credit models may not be compliant with ECOA requirements"
- FinRegLab (Dec 2023): https://finreglab.org/wp-content/uploads/2023/12/FinRegLab_2023-12-07_Research-Report_Explainability-and-Fairness-in-Machine-Learning-for-Credit-Undewriting_Policy-Analysis.pdf

**The wall:** ECOA / Reg B §1002.9(b)(2) requires a creditor to disclose "the principal reasons" for adverse action — specific, individualized reasons. CFPB Circular 2022-03 makes clear that "black-box" AI outputs do not satisfy this. You owe a specific reason, not a feature-importance chart.

**The real-world implementation pattern:**
- XGBoost + SHAP (TreeExplainer) + adverse action code mapping — production-deployed at Intuit QuickBooks per AAAI 2020 paper (https://cdn.aaai.org/ojs/7055/7055-13-10284-1-10-20200526.pdf). Their approach: XGBoost with monotonic constraints + SHAP values → top-4 features → mapped to reason codes via Reg B Appendix C.
- Research comparing AAC (Adverse Action Code) methods: Richey paper (https://jeremiah-richey.com/pdfs/denials.pdf) — Shapley-based is axiomatically best; "Most Points Lost" is the fallback.
- The four canonical reason-code sources per Reg B §1002.9(b)(2): credit score, credit history (delinquencies, public records), collateral, capacity (DTI/DSCR), capital (reserves), and other (10 categories total).

**Implication:** SHAP-based XGBoost with reason-code mapping is the de-facto industry pattern. Our POC MUST include reason-code generation at decision time, not as an afterthought. This is non-negotiable.

## 3. Fair lending — federal retreat, state surge (May 2026 shift)

**Primary sources:**
- Massachusetts AG settlement (Jul 2025) on AI underwriting model: https://www.cfsreview.com/2025/07/massachusetts-ag-settles-fair-lending-action-based-upon-ai-underwriting-model/
- CFPB Final Rule (May 4, 2026) "Recalibrating Fair Lending Enforcement": https://www.consumerfinancemonitor.com/2026/05/04/cfpbs-final-rule-recalibrates-fair-lending-enforcement-a-return-to-clarity-and-core-statutory-principles/
- CFPB Fair Lending Annual Report 2025 (released Dec 2025): https://files.consumerfinance.gov/f/documents/cfpb_fair-lending-annual-report_2025-12.pdf
- CFPB RFI comment on AI: https://www.consumerfinance.gov/about-us/newsroom/cfpb-comment-on-request-for-information-on-uses-opportunities-and-risks-of-artificial-intelligence-in-the-financial-services-sector/
- Algorithmic UDAP arxiv (Dec 2025): https://arxiv.org/abs/2512.17007 — Gillis, Stacy, Black — "While DI has traditionally served as the foundation of fair lending law, recent regulatory efforts have invoked UDAP"
- Algorithmic Tradeoffs in Fair Lending arxiv (May 2025): https://arxiv.org/abs/2505.13469 — Bansal — fairness interventions can cut profit 0-15% in simulation

**Key fact:** CFPB May 2026 final rule scaled back disparate-impact enforcement via Regulation B. BUT:
- Per Consumer Finance Monitor: "for many residential mortgage lenders, disparate impact risk remains very much alive through the FHA"
- Massachusetts AG actively pursuing AI-underwriting cases (Jul 2025)
- UDAP (Unfair, Deceptive, or Abusive Acts or Practices) is the new front

**Implication:** Our POC should still test for disparate impact (even if federal enforcement wanes) because:
1. FHA disparate impact still applies to residential mortgage lenders (we sell to banks → our models get scrutinized)
2. State AGs are filling the gap (MA example)
3. UDAP liability is broader and harder to insure against
4. Investors and rating agencies (Kroll, Moody's, S&P) still demand fair lending testing for any securitization

**OSS tooling to consider:** Aequitas (http://aequitas.dssg.io/) — open-source bias audit toolkit developed by UChicago CSDS. Originally MIT/Apache, but per my prior memory flagged as AGPL-3.0 — verify before SaaS use (see Thread F). Alternative: Fairlearn (AGPL-3.0 also — same caveat).

## 4. Vendor claims — what Scienaptic / Zest / Argyle actually deliver

**Scienaptic AI:**
- Source: https://www.scienaptic.ai/, https://www.scienaptic.ai/news, MeridianLink partner page
- Claims: "15-40% increase in approval rates", "$9M incremental indirect vehicle loan originations", "82% lift in credit card approvals", "20% reduction in losses"
- Customer count: 150+ lenders (per GHS Federal Credit Union press release)
- Target: "smaller US institutions that want modern AI decisioning but can't staff an analytics group" (per HES FinTech 2026 guide: https://hesfintech.com/blog/best-ai-credit-scoring-software/)
- Pricing: NOT publicly disclosed — must request sales quote. Pricing tier estimate (HES FinTech 2026): mid-five-figures to low-six-figures per year for community bank / credit union.
- Integration: MeridianLink, Byte, DigiFi LOS partnerships (per BusinessWire + send2press)
- Public outcome validation: Limited — Scienaptic publishes own case studies; no independent third-party benchmark for DSCR specifically.

**Zest AI:**
- Source: https://www.zest.ai/, https://www.zest.ai/product/underwriting/
- Product: ZAML (Zest Automated Machine Learning) + Model Management System
- Customer count: 600+ lenders (per MeridianLink partnership page)
- Claims: "save up to 60% of time and resources", "80% of borrowers instant, accurate decisions"
- Founded 2009 (as ZestFinance), rebranded 2019
- Pricing: NOT publicly disclosed
- Differentiation vs Scienaptic (per HES FinTech): bigger lenders, longer track record, "Zest goes after large credit unions and regional banks; Scienaptic goes after community banks"
- 2024 National Fair Lending Report (Zest publishes their own): https://www.zest.ai/learn/resources/2024-national-fair-lending-report/

**Argyle:**
- Source: https://www.argyle.com/, https://www.argyle.com/blog/2026-must-haves-for-mortgage-lenders-automated-embedded-consumer-permissioned-verifications
- Product: Consumer-permissioned VOI / VOE / VOA — NOT a credit decisioning engine
- Pricing: NOT publicly disclosed
- Niche: Argyle is a DATA SOURCE (income/employment/asset verification), not a model. Different problem than Scienaptic/Zest.
- Integration: Byte LOS, Freddie Mac LPA AIM integration per YouTube Nov 2024 webinar

**Reality check on vendor claims:**
- All three vendors publish their own case studies. None have independent third-party head-to-head benchmarks published for DSCR.
- Approval-rate lift claims (15-40%) are from vendor-optimized portfolios where the vendor helps design the strategy. Standalone model swap rarely delivers the upper bound.
- "20% reduction in losses" type claims are usually pre-/post- on a single lender's portfolio with vendor's portfolio consulting included.
- Pricing opacity is universal — you cannot budget without a sales call.

## 5. The realistic build path for our POC (XGBoost, 90-day scope)

**Architecture (XGBoost + monotonic constraints + SHAP + reason codes):**

```
[Borrower data ingest]
        ↓
[Feature engineering: ~40-60 features]
   - Credit: FICO, derog history (24mo), public records, inquiries
   - Property: LTV, DSCR, property type, MSA, STR eligibility
   - Borrower: reserves (months PITIA), liquidity, doc type
   - Loan: rate, term, amort, prepay penalty, IO flag
   - Sponsor: entity doc, experience, prior DSCR count
        ↓
[XGBoost classifier: PD (Probability of Default)]
   - Monotonic constraints (DSCR ↑ → PD ↓; LTV ↑ → PD ↓; reserves ↑ → PD ↓)
   - Class-balanced via scale_pos_weight
   - Early stopping on log-loss validation
        ↓
[SHAP TreeExplainer: per-prediction attribution]
   - Top-4 features ranked
        ↓
[Reason-code mapper: SHAP → Reg B §1002.9(b)(2) categories]
   - Maps to one of: credit history, capacity (DSCR), collateral (LTV), capital (reserves)
        ↓
[Decision output: approve/refer/decline + reason codes + adverse action letter]
```

**Data requirements for a real POC:**
- Minimum 5,000 loans with known outcomes (paid off / 60+ DPD / foreclosure). Below this, the model overfits and SHAP attributions are unstable.
- We have ZERO proprietary loan history. **This is the central problem.**
- Options:
  1. **Synthetic data**: Generate via bootstrap on public sources (FRED Q1 2026 1.89% 60+ DPD, MBA delinquency curves) — useful for proof-of-concept only, NOT for production claims.
  2. **Public mortgage performance data**: Fannie Mae/Freddie Mac single-family (NOT DSCR), FHA Neighborhood Watch (NOT DSCR). No public DSCR loan-level dataset exists.
  3. **Bank partner data**: Negotiate data sharing with 1-2 partner banks (Lima One, Visio, Newfi) for anonymized performance data — high value but slow.
  4. **Pool data**: DSCR securitizations (CROSS, OBX, NLT 2026-NQM1) — 41 loans / 304 props per Thread A. Aggregate-only, not loan-level.

**Realistic POC timeline:**
- Week 1-2: Data pipeline (synthetic + scraped public data; feature engineering)
- Week 3-4: XGBoost baseline + monotonic constraints + cross-validation
- Week 5-6: SHAP + reason-code mapper + adverse action letter generator
- Week 7-8: Fair lending audit (Aequitas or Fairlearn — AGPL caveat)
- Week 9-10: Documentation per SR 26-2 / OCC 2026-13 expectations
- Week 11-12: Validation against 1-2 sponsor loans (manual override + comparison)

**Deliverable:** A working classifier that produces a DSCR decision + reason codes, with documented methodology, conceptual soundness review, and bias audit. NOT production-ready; demonstrably POC-grade.

**What this POC does NOT solve:**
- No proprietary DSCR data → model accuracy ceiling is fundamentally limited
- No bank channel validation → cannot deploy
- No investor rating-agency review → cannot securitize
- No production monitoring infrastructure → would need 6-12 more months

## 6. Build vs Buy — the honest matrix

| Dimension | Build (XGBoost POC) | Buy Scienaptic | Buy Zest | No model (rules only) |
|---|---|---|---|---|
| Time to first decision | 90 days POC | 90-180 days integration | 90-180 days integration | Already have |
| Upfront cost | $200-400K eng time | $50-150K/yr | $75-200K/yr | $0 |
| Ongoing cost | +$300-600K/yr SRE/MRM | included + validation | included + validation | $0 |
| MRM burden (under OCC 2026-13) | HIGH (full ownership) | MEDIUM (vendor-assisted) | MEDIUM (vendor-assisted) | LOW (rules = transparent) |
| Explainability | SHAP (good) | vendor-proprietary (opaque) | vendor-proprietary (opaque) | N/A (rules) |
| Data moat | Builds over time | None | None | None |
| Switch cost later | LOW (we own code) | HIGH (model + integrations) | HIGH | LOW |
| Defensibility (per Master Plan v11 §2 "XGBoost accumulation moat") | HIGH | None | None | None |

**The defensible play:** Build the POC for capability/learning/MRM documentation; keep vendor shortlist warm as fallback for pilot loans where we lack data confidence. After 12-18 months of proprietary outcomes data accumulate, the XGBoost model becomes meaningfully better than any vendor's.

## 7. Specific risks for our POC

1. **No proprietary data → cannot honestly claim statistical validity.** SHAP values will be unstable; reason codes will be noisy. Mitigation: position as research artifact, not production model.
2. **Fair lending risk on synthetic data.** Disparate impact test results on synthetic data are NOT meaningful. Mitigation: re-test on real bank partner data when available; document limitation.
3. **SR 26-2 / OCC 2026-13 documentation burden.** ~40% of POC effort is documentation, not code. This is not optional.
4. **POC scope creep.** Feature engineering alone can eat 4 weeks. Hard cap at 60 features.
5. **Reason-code mapper edge cases.** "Capacity" reasons (DSCR too low) and "credit history" reasons can overlap on a single denial. CFPB Circular 2022-03 doesn't say what to do when 4+ reasons tie. Need explicit tie-breaking rule.
6. **No public DSCR loan-level dataset.** Cannot externally benchmark our POC. Only internal validation possible.

## 8. Recommendations for Master Plan v11 §6

1. **Approve the XGBoost POC scope as written above.** 90-day scope, 40-60 features, synthetic + scraped public data, SHAP + reason codes, Aequitas bias audit, SR 26-2 documentation.
2. **Concurrently engage Scienaptic + Zest for parallel evaluation.** Use the POC to clarify what we need; use vendor sales calls to clarify pricing + DSCR-specific capability.
3. **Negotiate data sharing with 1 bank partner in Q3 2026** (Lima One or Visio — per Thread B Insula prep). This is the only path to proprietary data and a meaningful moat.
4. **Position the POC as research artifact, not production.** Investor-facing materials should say "we've built a documented POC; production deployment awaits bank partner data." This sets realistic expectations and avoids compliance risk.
5. **Reserve §1071 helpers v0.5.6 scope** to add `is_consumer_credit_transaction()` predicate for any future consumer-purpose credit decisioning product. Per Thread D, the DSCR use case is business-purpose and exempt, but if we ever extend to QM/consumer, the predicate must exist.
6. **Track SR 26-2 implementation guidance from CFPB.** The CFPB companion to OCC 2026-13 (when it lands) will be the binding rule for non-bank lenders; current guidance is supervisory letter only.

## 9. Open questions for user

1. Approve POC scope + 90-day timeline?
2. Approve bank partner outreach (Lima One / Visio / Newfi) for data sharing?
3. Engage Scienaptic + Zest in parallel as vendor shortlist warmers?
4. Reserve $200-400K engineering budget (or accept internal team time only)?
5. Accept that POC accuracy ceiling is limited without proprietary data — and design communication accordingly?

## 10. Sources cited (primary + key secondary)

**Primary regulatory:**
- OCC Bulletin 2026-13 — https://www.occ.gov/news-issuances/bulletins/2026/bulletin-2026-13.html
- OCC Bulletin 2026-13a (PDF) — https://www.occ.treas.gov/news-issuances/bulletins/2026/bulletin-2026-13a.pdf
- OCC News Release 2026-29 — https://www.occ.gov/news-issuances/news-releases/2026/nr-occ-2026-29.html
- SR 26-2 Federal Reserve — https://www.federalreserve.gov/supervisionreg/srletters/SR2602.pdf
- SR 11-7 original 2011 guidance — https://www.federalreserve.gov/frrs/guidance/supervisory-guidance-on-model-risk-management.htm
- Regulation B §1002.9 (CFPB) — https://www.consumerfinance.gov/rules-policy/regulations/1002/9
- CFPB Circular 2022-03 (adverse action for complex algorithms) — https://data.aclum.org/storage/2025/01/CFPB_www_consumerfinance_gov_compliance_circulars_circular-2022-03-adverse-action-notification-requirements-in-connection-with-credit-decisions-based-on-complex-algorithms.pdf
- CFPB Fair Lending Annual Report 2025 — https://files.consumerfinance.gov/f/documents/cfpb_fair-lending-annual-report_2025-12.pdf
- CFPB Final Rule May 2026 — https://www.consumerfinancemonitor.com/2026/05/04/cfpbs-final-rule-recalibrates-fair-lending-enforcement-a-return-to-clarity-and-core-statutory-principles/

**Vendor:**
- Scienaptic AI — https://www.scienaptic.ai/
- Zest AI — https://www.zest.ai/product/underwriting/
- Argyle — https://www.argyle.com/
- HES FinTech 2026 vendor comparison — https://hesfintech.com/blog/best-ai-credit-scoring-software/
- Aloan 2026 best AI underwriting for community banks — https://aloan.ai/guides/best-ai-underwriting-community-banks

**Implementation pattern:**
- AAAI 2020 QuickBooks XGBoost + SHAP — https://cdn.aaai.org/ojs/7055/7055-13-10284-1-10-20200526.pdf
- FinRegLab Explainability & Fairness Dec 2023 — https://finreglab.org/wp-content/uploads/2023/12/FinRegLab_2023-12-07_Research-Report_Explainability-and-Fairness-in-Machine-Learning-for-Credit-Undewriting_Policy-Analysis.pdf
- Richey paper on AAC methods — https://jeremiah-richey.com/pdfs/denials.pdf
- Pace Analytics on ECOA + XAI — https://www.paceanalyticsllc.com/post/ecoa-adverse-actions-and-explainable-ai
- ABA Nov 2023 on AI adverse action — https://www.americanbar.org/groups/business_law/resources/business-law-today/2023-november/adverse-action-notice-compliance-considerations-for-creditors-that-use-ai/
- Skadden Jan 2024 — https://www.skadden.com/insights/publications/2024/01/cfpb-applies-adverse-action-notification-requirement
- Debevoise Aug 2023 — https://www.debevoise.com/-/media/files/insights/publications/2023/08/16_adverse-action-notice-compliance-considerations.pdf

**Fair lending / bias:**
- Massachusetts AG settlement Jul 2025 — https://www.cfsreview.com/2025/07/massachusetts-ag-settles-fair-lending-action-based-upon-ai-underwriting-model/
- Algorithmic UDAP arxiv Dec 2025 — https://arxiv.org/abs/2512.17007
- Algorithmic Tradeoffs in Fair Lending arxiv May 2025 — https://arxiv.org/abs/2505.13469
- Aequitas open-source bias audit — http://aequitas.dssg.io/

**Third-party legal/practice summaries:**
- Schneider Downs — https://schneiderdowns.com/our-thoughts-on/banking-agencies-revise-model-risk-management-guidance/
- Sullivan & Cromwell — https://www.sullcrom.com/insights/memo/2026/April/OCC-Fed-FDIC-Issue-Revised-Guidance-Model-Risk-Management
- PwC — https://www.pwc.com/us/en/industries/financial-services/library/our-take/model-risk-guidance-private-fund-reporting-apr-24-2026.html

---

**End of Thread E. Linked threads: Master Plan v11 §6, Tier4_DeepDive_2026Q2, Regulatory_Front_Watch_20260620, Thread F (AGPL) for Aequitas/Fairlearn license caveats.**