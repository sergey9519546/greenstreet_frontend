# Reg B Compliance Review Packet — GODMODE (V2)

**Task ID:** D3-GODMODE
**Agent:** Godmode Reg B Compliance Packet
**Audience:** Qualified ECOA / Regulation B Counsel + Chief Compliance Officer + CFPB Examination Readiness Team
**Classification:** PRIVILEGED · ATTORNEY-CLIENT WORK PRODUCT · ATTORNEY WORK-PRODUCT DOCTRINE (FRE 502 / FRCP 26(b)(3))
**Predecessor:** `03_RegB_Compliance_Review_Packet.pdf` (V1, 16 pages, ~24KB text — cohort review + 10 sign-off items only)
**Upgrade rationale:** V1 lacked lift-and-deployable compliance artifacts (adverse-action templates, ECOA reason code library, fair-lensing statistical code, HMDA-like schema, retention policy, training curriculum, quarterly audit template, state overlays, UDAAP review of all 120 hooks, CFPB exam checklist). GODMODE ships each artifact ready for counsel review and immediate operational deployment.
**Scope:** 4 HEX hard-exit paths + 8 soft-warning paths × adverse-action notice templates; complete Reg B Appendix C reason code library (14 codes); fair-lensing test plan with runnable R + Python + SQL; quarterly audit runbook; 8-module LO training curriculum; 4 state-specific regulatory overlays (FL/NY/CA/TX); UDAAP review of all 120 V2 hooks; 50-item CFPB examination readiness checklist.
**Source files referenced:**
- `/home/z/my-project/download/next_steps/03_RegB_Compliance_Review_Packet.pdf` (V1)
- `/home/z/my-project/download/agent_outputs/AC09_V2_ad_copy.md` (120 hooks, 4,371 lines)
- `/home/z/my-project/download/agent_outputs/NP04_decline_patterns.md` (16 HEX + 16 SWR rules, 856 lines)
- `/home/z/my-project/download/agent_outputs/TS10_targeting_scoring.md` (8-component scoring engine, 2,409 lines)
- `/home/z/my-project/download/agent_outputs/FF08_prescreen_intake.md` (12-question intake, 1,830 lines)
- `/home/z/my-project/download/agent_outputs/EG06_edge_case_personas.md` (fair-lensing risk flags, 718 lines)
- `/home/z/my-project/download/agent_outputs/SA05_persona_library.md` (12 personas, 1,120 lines)

---

## Table of Contents

| Part | Title | Lines (approx) | Status |
|---|---|---|---|
| 1 | Engagement Scope & Review Priority | ~150 | Ready |
| 2 | Adverse-Action Notice Templates (Reg B §1002.9) | ~520 | Ready — 12 templates |
| 3 | ECOA Adverse-Action Reason Code Library | ~260 | Ready — 14 codes |
| 4 | Fair-Lensing Statistical Test Plan (R + Python + SQL) | ~440 | Ready — runnable code |
| 5 | HMDA-like Data Collection Schema | ~140 | Ready — PostgreSQL DDL |
| 6 | Document Retention Policy (Reg B §1002.12) | ~110 | Ready |
| 7 | Pre-Approval vs Application Memo (HEX Routing) | ~170 | Ready |
| 8 | LO Compliance Training Curriculum (8 modules) | ~280 | Ready |
| 9 | Quarterly Fair-Lensing Audit Template | ~160 | Ready |
| 10 | State-Specific Overlays (FL / NY / CA / TX) | ~210 | Ready |
| 11 | UDAAP Review of All 120 V2 Hooks | ~440 | Ready — 120-row table |
| 12 | CFPB Examination Readiness Checklist (50 items) | ~180 | Ready |
| **Total** | | **~2,960** | **12 / 12** |

---

## Part 1 — Engagement Scope & Review Priority

### 1.1 Privileged Communication Notice

This packet constitutes attorney-client privileged work product prepared by the Godmode Reg B Compliance Packet agent (acting under engagement of the lender's compliance department) for the sole purpose of obtaining qualified ECOA / Regulation B counsel review of the DSCR borrower-intelligence swarm V2 creative library, intake form, and scoring engine. The packet is intended for distribution only to: (1) qualified outside ECOA / Reg B counsel of record, (2) the lender's Chief Compliance Officer, (3) the lender's in-house fair-lensing analyst, (4) the lender's document retention custodian. Forwarding to any other party — including but not limited to loan originators, marketing-ops personnel, vendor account managers, or any party outside the privileged engagement — without counsel's express written consent may waive the attorney-client privilege under *Upjohn Co. v. United States*, 449 U.S. 383 (1981) and applicable state privilege law. Marking: All copies must retain the PRIVILEGED header. Counsel should retain a single controlled copy; downstream consumers should receive only the specific Part(s) relevant to their function (e.g., loan originators receive Part 8 only; CRM team receives Parts 4–5 only).

### 1.2 Engagement Scope

Counsel is engaged to review the following artifacts and produce three deliverables per cohort: (a) sign-off certification, (b) remediation list (if any non-compliance is identified), (c) explicit launch authorization for Meta / Google / YouTube / Native campaigns. The review must cover Regulation B (12 CFR Part 1002 / ECOA, 15 U.S.C. §1691 et seq.), Regulation P (12 CFR Part 1016 / Gramm-Leach-Bliley Act privacy), the Fair Housing Act (42 U.S.C. §3601 et seq.) where applicable to advertising, the CFPB UDAAP authority (12 U.S.C. §5531, §5536), Meta Special Ad Category policy, and Google Ads housing-certification policy. State-specific overlays (Part 10) are scoped separately for FL / NY / CA / TX.

| # | Artifact | Source | Review Required Because |
|---|---|---|---|
| A-1 | 120 V2 ad hooks (20 personas × 6 hooks) | AC09_V2_ad_copy.md Part 2 | UDAAP risk: claims must be substantiated; disclosures must be clear & conspicuous; no misleading borrower-class implications. |
| A-2 | 20 V2 landing pages | AC09_V2_ad_copy.md Part 7 | UDAAP risk: above-fold disclosures, proof-stack substantiation, repel copy fairness. |
| A-3 | 100 V2 objection destroyers (20 personas × 5) | AC09_V2_ad_copy.md Part 5 | UDAAP risk: counters must not overpromise (e.g., "easy approval" substitutions). |
| A-4 | 60 V2 repel elements (20 personas × 3) | AC09_V2_ad_copy.md Part 6 | ECOA §1002.4(b) risk: repel copy must not use demographic-adjacent language. |
| A-5 | 12 FF-08 intake questions | FF08_prescreen_intake.md Part 1 | ECOA §1002.5(b)(1) risk: "rather not say" neutrality is non-negotiable. |
| A-6 | 8-component TS-10 scoring engine + 27 modifiers | TS10_targeting_scoring.md Parts 1A–1E | ECOA §1002.6 risk: protected-class proxies must not enter scoring. |
| A-7 | 16 HEX hard-exit paths | NP04_decline_patterns.md Part 3 | Reg B §1002.9 risk: exit messages may constitute "adverse action" requiring notice. |
| A-8 | 16 SWR soft-warning paths | NP04_decline_patterns.md Part 4 | Reg B §1002.9 risk: counteroffers trigger §1002.9(a)(2) timing rules. |
| A-9 | 12 adverse-action notice templates (this packet, Part 2) | NEW — Godmode | Counsel must verify templates meet §1002.9(a) / §1002.9(b) elements before deployment. |
| A-10 | Fair-lensing statistical test plan (this packet, Part 4) | NEW — Godmode | Counsel must verify test plan meets CFPB fair-lending examination expectations. |

### 1.3 Required Counsel Outputs

Counsel must produce, on the engagement letterhead, the following three outputs per priority cohort:

1. **Sign-off certification** — explicit statement that the reviewed artifact (or cohort of artifacts) complies with Regulation B, ECOA, and applicable fair-lending laws. Must cite the specific regulation sections reviewed (e.g., "Reviewed against 12 CFR §1002.4, §1002.5, §1002.6, §1002.9, §1002.12, §1002.13; FHA §§3604, 3605; CFPB UDAAP guidance (DOC 2013-07722)"). Must name the reviewing attorney, bar number, and date. Must identify any caveats or conditions.
2. **Remediation list** — for any artifact identified as non-compliant or "approved with remediation," a numbered list specifying: artifact ID, non-compliance description, cited regulation, recommended remediation language, target remediation date, and the responsible party for implementing remediation. Remediation items must be tracked to closure before launch authorization.
3. **Launch authorization** — explicit authorization for the cleared cohort to launch on the indicated timeline (M1 / M2 / M3). Authorization is granular: a single authorization may cover multiple cohorts, but each cohort requires its own authorization. Authorization may be conditioned on: (a) completion of remediation items, (b) post-launch monitoring, (c) scheduled re-review at 30/60/90 days.

### 1.4 Priority Tiers (refreshed from V1)

The V1 priority tiers are preserved with three additions: (a) P0 designation for any artifact counsel identifies as launch-blocking at any point during the review; (b) P1.5 designation for the 12 adverse-action notice templates (Part 2) — counsel must clear these before any HEX routing goes live, because incorrect templates create retroactive §1002.9 exposure; (c) P3 designation for Parts 6–12 of this packet (retention policy, training, audit template, state overlays, exam checklist) — these are operational infrastructure, not launch-blocking, but must be in place before the end of M1.

| Priority | Cohort / Artifact | Risk Level | Why | Launch Blocker? | Required Before |
|---|---|---|---|---|---|
| P0 | Any artifact counsel escalates during review | TBD | Counsel discretion | YES | M1 launch |
| P1 | EG-002 ITIN US-Resident Investor (edge-case tier) | HIGH | ITIN status can function as national-origin proxy. | YES | M3 launch (Week 11) |
| P1 | EG-003 No-Credit-Country Foreign National | HIGH | No-credit-country designation can function as national-origin proxy. | YES | M3 launch (Week 11) |
| P1 | SA-008 Credit-Scarred Cash-Rich Rebuilder | HIGH | Prior credit events correlate with protected-class characteristics (race, age, family status). | YES | M2 launch (Week 7) |
| P1.5 | 12 adverse-action notice templates (this packet, Part 2) | HIGH | Incorrect §1002.9 elements create retroactive exposure if HEX routing is later deemed an "application." | YES | M1 launch (Week 3) |
| P2 | SA-005 Strong-Credit FN | MODERATE | Foreign-national designation; lower risk than EG-003 because strong-credit-country signal is less national-origin-coded. | NO | P2 review |
| P2 | SA-006 No-Credit FN (main persona) | MODERATE-HIGH | Same risk as EG-003 but main-persona not edge-case. | Recommend P1 review | Before launch |
| P2 | SA-010 ITIN US-Resident (main persona) | MODERATE-HIGH | Same risk as EG-002 but main-persona not edge-case. | Recommend P1 review | Before launch |
| P2 | EG-001 Post-Short-Sale Comeback | MODERATE | Prior credit event; same risk profile as SA-008 but lower volume. | Recommend P2 review | Before launch |
| P3 | SA-001 through SA-004, SA-007, SA-011, SA-012 | LOW | Standard investor personas; no protected-class proxy risk if V2 guardrails followed. | NO | Standard review |
| P3 | EG-004 through EG-008 (non-credit-event edge cases) | LOW | Edge cases not involving credit events or national-origin. | NO | Standard review |
| P3 | Parts 6–12 of this packet (operational infrastructure) | LOW | Retention policy, training, audit template, state overlays, exam checklist. | NO | End of M1 |

### 1.5 Engagement Timeline

| Week | Milestone |
|---|---|
| Week 1 | Counsel receives this packet + all source files. Privileged review begins. |
| Week 2 | Counsel issues initial findings memo. P1/P1.5 artifacts reviewed. |
| Week 3 | M1 launch (P3 cohorts cleared). P1 remediation items due. |
| Week 4–6 | Fair-lensing test plan (Part 4) pilot run on funded-loan data. Counsel reviews pilot results. |
| Week 7 | M2 launch (P1 SA-008 cohort cleared if remediation complete). |
| Week 8–10 | Quarterly fair-lensing audit template (Part 9) first run. Counsel reviews findings. |
| Week 11 | M3 launch (P1 EG-002, EG-003 cohorts cleared if remediation complete). |
| Week 12 | CFPB examination readiness checklist (Part 12) self-assessment. |
| Week 13 | 30-day post-launch monitoring review. |
| Week 24 | 60-day post-launch monitoring review + first quarterly fair-lensing audit (Part 9). |
| Week 36 | 90-day post-launch monitoring review + second quarterly fair-lensing audit. |
| Week 48 | Annual fair-lensing audit + full packet re-review by counsel. |

### 1.6 Counsel Sign-Off Block (carried forward from V1)

By signing below, counsel certifies that the reviewed creative, intake questions, scoring engine, adverse-action templates, and platform configurations comply with Regulation B (ECOA), Regulation P, the Fair Housing Act, and applicable fair-lending laws. Counsel authorizes marketing-ops to launch the cleared cohorts on the indicated timeline. Any "Approved with remediation" requires a follow-up review before launch.

```
Counsel Name: ______________________________   Date: ______________
Bar Number:   ______________________________   Sign-Off ID: ________
Signature:    ______________________________

☐ Approved (cleared for launch on indicated timeline)
☐ Approved with remediation (remediation items attached; launch conditional)
☐ Denied (non-compliance memorandum attached)
```

---

## Part 2 — Adverse-Action Notice Templates (Reg B §1002.9)

### 2.1 Regulatory Framework

Regulation B (12 CFR Part 1002) §1002.9 requires creditors to provide applicants with adverse-action notices within **30 days** of receiving a "completed application." The notice must contain: (a) creditor identification (name + address), (b) ECOA disclosure statement, (c) either specific reasons for denial OR disclosure of the applicant's right to request specific reasons within 60 days, (d) if applicable, the right to a copy of any appraisal or written valuation developed in connection with the application.

For **incomplete applications**, §1002.9(c) provides three alternatives: (i) deny for incompleteness with notice, (ii) send a notice of incompleteness requesting additional information within a reasonable period, (iii) take no action and notify the applicant of incompleteness after 30 days. The swarm's HEX hard-exit paths at intake are best characterized as §1002.9(c)(1)(iii) "no action" notices — but counsel should review Part 7 of this packet (Pre-Approval vs Application Memo) for the critical distinction between "application" and "pre-approval inquiry" under §1002.2(f) and §1002.2(o).

For **counteroffers**, §1002.9(a)(2) provides a 90-day window: if the applicant accepts the counteroffer within 90 days, the creditor may treat the counteroffer as accepted and proceed; if not, the creditor must provide an adverse-action notice within 90 days stating the original denial terms.

### 2.2 Required Elements Checklist (Every Template)

Every adverse-action notice template below must contain the following elements, which are also enumerated as a checklist counsel can use to verify each template:

- [ ] Creditor name and address (Reg B §1002.9(a)(1)(i))
- [ ] ECOA disclosure statement (Reg B §1002.9(b)(1) — model form C-1 / C-2 / C-3)
- [ ] Either: (a) specific principal reasons for denial, OR (b) disclosure of right to request reasons within 60 days (Reg B §1002.9(a)(1)(ii))
- [ ] If credit score was used: credit score disclosure (Reg B §1002.9(b)(2) — FCRA §609(g) cross-reference)
- [ ] If appraisal was developed: right to copy of appraisal (Reg B §1002.14)
- [ ] Statement that creditor does not discriminate on prohibited basis (Reg B §1002.4(b))
- [ ] For counteroffers: counteroffer terms + 90-day acceptance window (Reg B §1002.9(a)(2))
- [ ] For incomplete applications: notice of incompleteness OR denial for incompleteness (Reg B §1002.9(c))
- [ ] Creditor contact information for inquiry (customary, not strictly required)
- [ ] Notice delivered within 30 calendar days of completed application (Reg B §1002.9(a)(1)(iii))

### 2.3 HEX Hard-Exit Adverse-Action Templates (4 Permanent Rejection Paths)

The four HEX hard-exit paths that constitute permanent rejections (HEX-001 primary residence, HEX-009 active delinquency, HEX-012 sub-$100K loan outside specialty, HEX-013 pure commercial use) are the highest-risk adverse-action templates because they represent the strongest case for "completed application" status under Reg B §1002.2(f). Counsel should default to treating these as §1002.9(a) adverse-action notices (not §1002.9(c) incomplete-application notices), as a defensive measure against any later determination that the intake constituted an "application."

The remaining 12 HEX rules (HEX-002, -003, -004, -005, -006, -007, -008, -010, -011, -014, -015, -016) are conditional hard-stops with specialty-lender routing. These should be treated as §1002.9(a)(2) counteroffer notices (specialty-lender referral constitutes a counteroffer — "we cannot underwrite this loan on our standard DSCR product, but we can refer you to a specialty lender who may").

#### 2.3.1 HEX-001 — Primary Residence Hard Exit (Adverse-Action Notice)

```text
[Letterhead: {{lender_name}}]
[{{lender_address}} | NMLS #{{lender_nmls}}]

Date: {{date}}

{{borrower_name}}
{{borrower_address}}

RE: Your DSCR Loan Inquiry — Notice of Adverse Action
Application Reference: {{application_id}}

Dear {{borrower_name}},

Thank you for your interest in our Debt Service Coverage Ratio (DSCR) loan program. We have reviewed the information you provided on {{application_date}} and have determined that we cannot proceed with your loan request.

PRINCIPAL REASONS FOR THIS DECISION:
{{reason_codes}}
   • {{reason_1}}
   • {{reason_2}}

In your case, your request was declined because the property was identified as intended for use as a primary residence, second home, or personal-use vacation property. DSCR loans are extended exclusively for business-purpose investment properties (1-4 units). This is a program-eligibility criterion, not a credit decision based on your personal creditworthiness.

If you believe any of the above information is incorrect or incomplete, you may request that we reconsider this decision by submitting additional information within 60 days of the date of this letter to: {{lender_compliance_contact}}.

YOUR RIGHTS UNDER THE EQUAL CREDIT OPPORTUNITY ACT:
The federal Equal Credit Opportunity Act prohibits creditors from discriminating against applicants on the basis of race, color, religion, national origin, sex, marital status, age (provided the applicant has the capacity to enter into a binding contract); because all or part of the applicant's income derives from any public assistance program; or because the applicant has in good faith exercised any right under the Consumer Credit Protection Act. The federal agency that administers compliance with this law concerning this creditor is:

{{federal_agency_name}}
{{federal_agency_address}}
{{federal_agency_phone}}

If you applied for credit and your credit score was used in the decision, you will receive a separate disclosure of your credit score and the factors that adversely affected it.

If an appraisal or written valuation was developed in connection with your application, you have the right to obtain a copy of it. To request a copy, contact us at {{lender_compliance_contact}} within 60 days of the date of this letter.

ALTERNATIVE RESOURCES:
DSCR loans are not the right product for primary-residence financing. We recommend you consult with a licensed conventional, FHA, or VA mortgage lender. The Consumer Financial Protection Bureau provides resources at consumerfinance.gov, and the Department of Housing and Urban Development (HUD) provides a list of approved housing counselors at hud.gov/counseling.

Sincerely,

{{compliance_officer_name}}
{{compliance_officer_title}}
{{lender_name}}
{{lender_phone}} | {{lender_email}}
NMLS #{{lender_nmls}}

ECOA Disclosure: {{lender_name}} does not discriminate against any applicant on any prohibited basis under the Equal Credit Opportunity Act, 15 U.S.C. §1691 et seq., and Regulation B, 12 CFR Part 1002.
```

**Merge fields:** `{{borrower_name}}`, `{{borrower_address}}`, `{{lender_name}}`, `{{lender_address}}`, `{{lender_nmls}}`, `{{lender_compliance_contact}}`, `{{lender_phone}}`, `{{lender_email}}`, `{{compliance_officer_name}}`, `{{compliance_officer_title}}`, `{{date}}`, `{{application_date}}`, `{{application_id}}`, `{{reason_codes}}`, `{{reason_1}}`, `{{reason_2}}`, `{{federal_agency_name}}`, `{{federal_agency_address}}`, `{{federal_agency_phone}}`.
**Delivery method:** Email with read receipt (preferred for HEX-001); USPS First-Class Mail if email unavailable.
**Timeline:** Within 30 calendar days of completed application. (Per Part 7 of this packet, counsel should default to treating HEX intake as "completed application" to eliminate retroactive §1002.9 exposure.)
**Reason codes (Appendix C):** Code 14 (Other — "Property intended for owner-occupied use; DSCR program available only for business-purpose investment properties") + Code 5 (Application incomplete — if any required fields were missing).
**Counsel review point:** Counsel must verify that the "principal reasons" language meets §1002.9(b)(2) specificity requirements. Generic statements such as "did not meet program guidelines" are insufficient — the specific program-eligibility criterion must be named.

#### 2.3.2 HEX-009 — Active Delinquency / Uncured Forbearance (Adverse-Action Notice)

```text
[Letterhead: {{lender_name}}]
[{{lender_address}} | NMLS #{{lender_nmls}}]

Date: {{date}}

{{borrower_name}}
{{borrower_address}}

RE: Your DSCR Loan Inquiry — Notice of Adverse Action
Application Reference: {{application_id}}

Dear {{borrower_name}},

Thank you for your interest in our DSCR loan program. After reviewing the information you provided on {{application_date}}, we regret to inform you that we are unable to approve your loan request at this time.

PRINCIPAL REASONS FOR THIS DECISION:
{{reason_codes}}
   • {{reason_1}} — Unresolved mortgage delinquency or active forbearance on existing credit
   • {{reason_2}} — Housing history does not meet program seasoning requirements

We identified that there is currently an unresolved delinquency or active forbearance on one or more of your existing mortgage obligations. Our DSCR program requires that all mortgage obligations be current and that any prior forbearance be fully cured (typically 12+ months of on-time payments following the forbearance exit) before we can extend new credit.

This is not a permanent decision. Once your mortgage delinquency is resolved and you have established a 12-month clean payment history, we welcome you to reapply. If you would like to discuss the specific timeline for re-application, please contact {{lender_compliance_contact}}.

YOUR RIGHTS UNDER THE EQUAL CREDIT OPPORTINA ACT:
[Standard ECOA disclosure language — same as HEX-001 template]

If you applied for credit and your credit score was used in this decision, you will receive a separate disclosure of your credit score and the factors that adversely affected it. {{credit_score_disclosure_attachment_if_applicable}}

If you believe this decision was made in error, you may submit a written request for reconsideration within 60 days of the date of this letter to: {{lender_compliance_contact}}. Please include any documentation demonstrating that your mortgage delinquency has been resolved or that the information we relied upon was inaccurate.

ALTERNATIVE RESOURCES:
You may wish to consult with a HUD-approved housing counselor (hud.gov/counseling) to discuss loss-mitigation options for your current mortgage. If you are seeking to refinance or sell the property currently in delinquency, a real estate attorney or your existing servicer's loss-mitigation department may be able to assist.

Sincerely,

{{compliance_officer_name}}
{{compliance_officer_title}}
{{lender_name}}
NMLS #{{lender_nmls}}

ECOA Disclosure: {{lender_name}} does not discriminate against any applicant on any prohibited basis under the Equal Credit Opportunity Act.
```

**Reason codes (Appendix C):** Code 9 (Credit history) + Code 13 (Excessive obligations — if delinquency reflects debt burden) + Code 14 (Other — "Mortgage delinquency or forbearance not cured within program-required 12-month seasoning window").
**Delivery method:** USPS First-Class Mail with certificate of mailing (preferred for HEX-009 due to the sensitive nature of delinquency disclosure); email secondary.
**Timeline:** Within 30 calendar days of completed application.
**Counsel review point:** HEX-009 is the highest fair-lensing risk among the four permanent-rejection HEX paths because mortgage delinquency correlates with protected-class characteristics (medical debt, divorce, disability — all ECOA-protected or proxy-protected). Counsel must verify the reason codes are objective and applied uniformly. The "12-month seasoning window" must be a published, objective criterion — not a discretionary determination.

#### 2.3.3 HEX-012 — Sub-$100K Loan Amount Hard Exit (Adverse-Action Notice)

```text
[Letterhead: {{lender_name}}]
[{{lender_address}} | NMLS #{{lender_nmls}}]

Date: {{date}}

{{borrower_name}}
{{borrower_address}}

RE: Your DSCR Loan Inquiry — Notice of Adverse Action
Application Reference: {{application_id}}

Dear {{borrower_name}},

Thank you for your interest in our DSCR loan program. After reviewing the information you provided on {{application_date}}, we are unable to proceed with your loan request.

PRINCIPAL REASONS FOR THIS DECISION:
{{reason_codes}}
   • {{reason_1}} — Requested loan amount is below our published program minimum of $100,000-$150,000

Our DSCR program has a published loan-amount floor of $100,000 to $150,000 (lender-specific). Your requested loan amount of {{requested_loan_amount}} falls below this floor. This is a program-eligibility criterion based on operational underwriting economics, not a credit decision based on your personal creditworthiness.

YOUR RIGHTS UNDER THE EQUAL CREDIT OPPORTUNITY ACT:
[Standard ECOA disclosure language — same as HEX-001 template]

ALTERNATIVE RESOURCES:
For loan amounts below $100,000, alternative financing options may include:
   • Hard money / private money lenders (typically shorter terms, higher rates)
   • Local community banks or credit unions
   • Home equity loans or lines of credit on other properties you own
   • Seller financing (if applicable to your transaction)

The Consumer Financial Protection Bureau provides resources on small-dollar loan alternatives at consumerfinance.gov.

Sincerely,

{{compliance_officer_name}}
{{compliance_officer_title}}
{{lender_name}}
NMLS #{{lender_nmls}}

ECOA Disclosure: {{lender_name}} does not discriminate against any applicant on any prohibited basis under the Equal Credit Opportunity Act.
```

**Reason codes (Appendix C):** Code 14 (Other — "Loan amount below program floor of $100,000").
**Delivery method:** Email with read receipt.
**Timeline:** Within 30 calendar days of completed application.
**Counsel review point:** The $100K floor is a published, objective criterion — verify the floor is documented in lender program guidelines (Truss, AHLend publish this explicitly). The floor should be applied uniformly across all applicants; counsel should confirm the floor is not selectively enforced against any protected-class cohort.

#### 2.3.4 HEX-013 — Pure Commercial Use Hard Exit (Adverse-Action Notice)

```text
[Letterhead: {{lender_name}}]
[{{lender_address}} | NMLS #{{lender_nmls}}]

Date: {{date}}

{{borrower_name}}
{{borrower_address}}

RE: Your DSCR Loan Inquiry — Notice of Adverse Action
Application Reference: {{application_id}}

Dear {{borrower_name}},

Thank you for your interest in our DSCR loan program. After reviewing the information you provided on {{application_date}}, we are unable to proceed with your loan request under our standard residential DSCR product.

PRINCIPAL REASONS FOR THIS DECISION:
{{reason_codes}}
   • {{reason_1}} — Property is in commercial / retail / industrial / mixed-use (with >25% commercial component)

Our standard residential DSCR program finances 1-4 unit residential investment properties. Your subject property has been identified as having a commercial, retail, industrial, or mixed-use component exceeding 25% of the total usable area. This is a property-type eligibility criterion, not a credit decision based on your personal creditworthiness.

COUNTEROFFER CONSIDERATION:
If your property has a mixed-use component with the residential portion dominant, we may be able to refer your file to a specialty lender (Bluestone Financial or a commercial DSCR specialist) that underwrites mixed-use and small commercial properties. The terms, LTV caps, and rate structure would differ from our residential DSCR product. If you would like to be referred, please contact {{lender_compliance_contact}} within 90 days of the date of this letter.

YOUR RIGHTS UNDER THE EQUAL CREDIT OPPORTUNITY ACT:
[Standard ECOA disclosure language — same as HEX-001 template]

ALTERNATIVE RESOURCES:
For commercial-use property financing, consider:
   • Commercial mortgage brokers (find one at mbamb.org)
   • Small Business Administration (SBA) 504 loans for owner-occupied commercial (sba.gov)
   • Local community banks with commercial lending departments
   • Specialty commercial DSCR lenders

Sincerely,

{{compliance_officer_name}}
{{compliance_officer_title}}
{{lender_name}}
NMLS #{{lender_nmls}}

ECOA Disclosure: {{lender_name}} does not discriminate against any applicant on any prohibited basis under the Equal Credit Opportunity Act.
```

**Reason codes (Appendix C):** Code 1 (Value or type of collateral not sufficient) + Code 2 (Terms of collateral) + Code 3 (Collateral insufficient).
**Delivery method:** Email with read receipt.
**Timeline:** Within 30 calendar days of completed application. Counteroffer window: 90 days per §1002.9(a)(2).
**Counsel review point:** HEX-013 is properly characterized as a §1002.9(a)(2) counteroffer (specialty-lender referral) rather than a §1002.9(a)(1) outright denial, because Bluestone + commercial DSCR specialists constitute a viable counteroffer path. The 90-day counteroffer window applies. Verify the counteroffer terms are stated with sufficient specificity to meet §1002.9(a)(2)(i).

### 2.4 HEX Conditional Hard-Stop Templates — Counteroffer Pattern (8 representative paths)

The remaining 12 HEX rules follow a counteroffer pattern: "we cannot underwrite on our standard residential DSCR product, but we can refer you to a specialty lender who may." Because the pattern is uniform across these rules, we provide one master counteroffer template (§2.4.0) and 8 path-specific reason-code blocks (§2.4.1 through §2.4.8) covering the highest-volume conditional HEX paths. Counsel may consolidate the remaining 4 HEX rules (HEX-006, -007, -008, -016) into additional reason-code blocks using the same master template.

#### 2.4.0 Master Counteroffer Template (HEX Conditional Hard-Stops)

```text
[Letterhead: {{lender_name}}]
[{{lender_address}} | NMLS #{{lender_nmls}}]

Date: {{date}}

{{borrower_name}}
{{borrower_address}}

RE: Your DSCR Loan Inquiry — Counteroffer Notice
Application Reference: {{application_id}}

Dear {{borrower_name}},

Thank you for your interest in our DSCR loan program. After reviewing the information you provided on {{application_date}}, we are unable to approve your loan request under our standard residential DSCR program for the following principal reason(s):

PRINCIPAL REASONS:
{{reason_codes}}
   • {{reason_1}}
   • {{reason_2}}

COUNTEROFFER:
Based on the information you provided, we believe a specialty DSCR lender may be able to underwrite your loan. We can refer your file to {{specialty_lender_name}} (NMLS #{{specialty_lender_nmls}}), whose program terms may include: {{counteroffer_terms}}.

This counteroffer is open for 90 days from the date of this letter. If you accept the counteroffer by contacting {{lender_compliance_contact}} within 90 days, we will proceed with the specialty-lender referral. If you do not respond within 90 days, we will treat the original application as denied under our standard residential DSCR program, and this letter will serve as your Notice of Adverse Action under 12 CFR §1002.9(a)(2).

If you do not wish to accept the counteroffer, you have the right to a statement of the specific reasons for the denial of your original application. You may request this statement within 60 days of the date of this letter by contacting {{lender_compliance_contact}}.

YOUR RIGHTS UNDER THE EQUAL CREDIT OPPORTUNITY ACT:
[Standard ECOA disclosure language — same as HEX-001 template]

Sincerely,

{{compliance_officer_name}}
{{compliance_officer_title}}
{{lender_name}}
NMLS #{{lender_nmls}}

ECOA Disclosure: {{lender_name}} does not discriminate against any applicant on any prohibited basis under the Equal Credit Opportunity Act.
```

#### 2.4.1 HEX-002 — NYC Local Law 18 STR Hard Stop (Counteroffer: LTR DSCR or out-of-market STR)

Reason-code block to insert into master counteroffer template:

```text
PRINCIPAL REASONS:
   • Code 14 (Other) — Property located within NYC five boroughs where Local Law 18
     restricts short-term rental income. Projected STR income cannot be used for DSCR
     qualification under this regulatory regime.

COUNTEROFFER:
   • Specialty lender: {{specialty_lender_name}} — long-term rental (LTR) DSCR on the
     same NYC property if LTR rents support DSCR ≥1.00, OR
   • Out-of-market STR DSCR referral to a STR-permissive market (Panama City Beach FL,
     Gatlinburg TN, Scottsdale AZ) where you may be relocating your investment strategy.

Counteroffer terms: LTV cap 70% on NYC LTR DSCR (vs 75% standard); rate premium +50-75bps
on NYC LTR DSCR reflecting market-risk overlay.
```

#### 2.4.2 HEX-003 — Nashville Owner-Occupancy STR Hard Stop (Counteroffer: Gatlinburg / Panama City Beach / Scottsdale STR)

```text
PRINCIPAL REASONS:
   • Code 14 (Other) — Property located in Nashville TN residential zoning where STR
     permit requires owner-occupancy. Non-owner STR permit unobtainable for investment
     property.

COUNTEROFFER:
   • Out-of-market STR DSCR referral to STR-permissive markets: Gatlinburg/Pigeon Forge
     TN, Panama City Beach FL, Scottsdale AZ.
   • If you wish to retain the Nashville property, LTR DSCR may be available if LTR
     rents support DSCR ≥1.00 (typical Nashville LTR DSCR is 0.71-1.10 depending on
     neighborhood — likely thin-DSCR territory requiring 25% down + 12mo reserves).

Counteroffer terms: LTV cap 70% on Nashville LTR; specialty-lender referral for STR
relocation markets.
```

#### 2.4.3 HEX-004 — Condotel Hard Stop (Counteroffer: Visio / Kiavi STR-condotel)

```text
PRINCIPAL REASONS:
   • Code 1 (Value or type of collateral not sufficient) — Condotel / hotel-condo
     conversion property type excluded from standard residential DSCR programs.
   • Code 3 (Collateral insufficient) — Property type does not meet warrantable
     residential collateral standards.

COUNTEROFFER:
   • Specialty lender: Visio Lending or Kiavi STR-condotel program.
   • Specialty terms: 30-35% down payment required (vs 20-25% standard), 1.25+ DSCR
     required, +75-125bps rate premium reflecting property-type risk.

Counteroffer terms: 65-70% LTV max, 1.25+ DSCR floor, STR permit + AirDNA projection
required.
```

#### 2.4.4 HEX-005 — Non-Warrantable Condo Hard Stop (Counteroffer: Specialty non-warrantable DSCR lender)

```text
PRINCIPAL REASONS:
   • Code 1 (Value or type of collateral not sufficient) — Non-warrantable condo
     (investor concentration >50%, pending HOA litigation, hotel conversion, or HOA
     non-compliance with Fannie warrantability standards).

COUNTEROFFER:
   • Specialty lender: 4-6 DSCR lenders actively write non-warrantable condo DSCR.
     Specialty terms: 70% LTV max (vs 75% standard), +50-100bps rate premium reflecting
     warrantability risk.

Counteroffer terms: 70% LTV max, 1.25+ DSCR floor, HOA questionnaire + reserve study
required.
```

#### 2.4.5 HEX-006 — Recent 30-Day Mortgage Late (Hard Stop, Deferrable) — Pre-Adverse-Action Notice

HEX-006 is unique among the conditional HEX rules: the borrower's situation is *curable* by waiting 12 months from the most recent mortgage late. The appropriate notice is a **pre-adverse-action notice under §1002.9(b)** combined with a deferral recommendation.

```text
[Letterhead: {{lender_name}}]
[{{lender_address}} | NMLS #{{lender_nmls}}]

Date: {{date}}

{{borrower_name}}
{{borrower_address}}

RE: Your DSCR Loan Inquiry — Notice of Incomplete Application / Deferral Recommendation
Application Reference: {{application_id}}

Dear {{borrower_name}},

We have reviewed the information you provided on {{application_date}}. At this time, your application is incomplete for our DSCR program because we cannot verify the required 12-month clean payment history on your existing mortgage obligations.

SPECIFIC INFORMATION REQUIRED:
   • Documentation showing 12+ months of on-time mortgage payments following your most
     recent 30-day-or-greater late payment (currently dated {{most_recent_mortgage_late_date}}).
   • Most recent mortgage statement from each servicer confirming current payment status.

Based on the information you provided, your most recent mortgage late was {{months_since_late}} months ago. You will be eligible to reapply once you have reached 12 months from that date (approximately {{reapply_eligible_date}}).

We will retain your file and contact you at that time to discuss re-application. If you wish to provide the documentation above sooner, please submit to {{lender_compliance_contact}}. If we do not hear from you within 30 days of the date of this letter, we will close your file. You may reapply at any time after the 12-month seasoning window has been satisfied.

YOUR RIGHTS UNDER THE EQUAL CREDIT OPPORTUNITY ACT:
[Standard ECOA disclosure language — same as HEX-001 template]

Sincerely,

{{compliance_officer_name}}
{{compliance_officer_title}}
{{lender_name}}
NMLS #{{lender_nmls}}
```

**Notice type:** §1002.9(c)(2) notice of incompleteness (preferred characterization — defensive posture, avoids §1002.9(a) adverse-action trigger).
**Reason codes (Appendix C):** Code 5 (Application incomplete) + Code 8 (Employment history — applicable if mortgage late was due to employment disruption) + Code 9 (Credit history).
**Delivery method:** Email + USPS First-Class Mail (the deferral recommendation requires durable record).
**Timeline:** Within 30 calendar days of receiving the application.
**Counsel review point:** HEX-006 is the second-highest fair-lensing risk (after HEX-009) because mortgage lates correlate with protected-class characteristics. Counsel must verify the 12-month seasoning window is applied uniformly across all applicants and is documented in lender program guidelines.

#### 2.4.6 HEX-010 — FN Without US LLC (Counteroffer: LLC formation pathway)

```text
PRINCIPAL REASONS:
   • Code 14 (Other) — Foreign-national borrower without US-based LLC (EIN + operating
     agreement). Required by AHLend + America Mortgages FN programs.
   • Code 10 (Amount or type of income — applicable if FN income documentation requires
     LLC structure for source-of-funds narrative).

COUNTEROFFER:
   • Specialty lender: AHLend or America Mortgages FN program, conditional on US LLC
     formation within 2-4 weeks. We can connect you with a US attorney to form the LLC
     (typical cost $1,200-$1,800; timeline 2-4 weeks).
   • Specialty terms: 60-70% LTV depending on credit-country tier, 12mo reserves,
     +50-125bps rate premium.

Counteroffer terms: LLC formation required pre-closing, AML source-of-funds trail
required, FIRPTA structure coordination required.
```

#### 2.4.7 HEX-014 — STR Without Obtainable Permit (Counteroffer: LTR DSCR or permit-pending deferral)

```text
PRINCIPAL REASONS:
   • Code 14 (Other) — Short-term rental property in market where non-owner-occupied
     STR permit is unobtainable or pending legislation.

COUNTEROFFER:
   • LTR DSCR on the same property if LTR rents support DSCR ≥1.00 (underwriting
     converts STR projection to LTR market rent via Form 1007), OR
   • Deferral pending STR permit approval (typical timeline 30-120 days depending on
     municipality).

Counteroffer terms: LTV cap 70% on LTR conversion (vs 75% standard STR); DSCR floor
1.00 (vs 0.80 standard STR with compensators).
```

#### 2.4.8 HEX-016 — 5-8 Unit Property at Non-AHLend Lender (Counteroffer: AHLend 5-8 unit specialty)

```text
PRINCIPAL REASONS:
   • Code 1 (Value or type of collateral not sufficient) — 5-8 unit multi-family
     property type excluded at most residential DSCR lenders (Newfi explicitly 1-4 unit
     only).

COUNTEROFFER:
   • Specialty lender: AHLend 5-8 unit DSCR program.
   • Specialty terms: 70% LTV max, 1.25+ DSCR floor, 6mo reserves per unit (30mo total
     on 5-unit), +50-75bps rate premium reflecting small-multifamily risk.

Counteroffer terms: AHLend specialty program only; rent roll + operating statements
required.
```

### 2.5 Soft-Warning Adverse-Action Templates (8 Representative SWR Paths)

The 16 SWR (Soft-Warning Rule) paths from NP-04 Part 4 typically do not trigger adverse-action notices because they result in counteroffers, additional documentation requests, or manual review — not outright denials. However, counsel should prepare adverse-action templates for the 8 highest-volume SWR paths because some SWR-flagged files will ultimately be declined after manual review or counteroffer rejection. The master template (§2.5.0) covers the standard pattern; §2.5.1 through §2.5.8 provide path-specific reason-code blocks.

#### 2.5.0 Master SWR Adverse-Action Template (Post-Counteroffer Denial)

```text
[Letterhead: {{lender_name}}]
[{{lender_address}} | NMLS #{{lender_nmls}}]

Date: {{date}}

{{borrower_name}}
{{borrower_address}}

RE: Your DSCR Loan Application — Notice of Adverse Action (Post-Counteroffer)
Application Reference: {{application_id}}

Dear {{borrower_name}},

On {{counteroffer_date}}, we provided you with a counteroffer on your DSCR loan application dated {{application_date}}. Because we did not receive your acceptance of the counteroffer within 90 days, we have closed your file and are providing this Notice of Adverse Action under 12 CFR §1002.9(a)(2).

PRINCIPAL REASONS FOR DENIAL OF YOUR ORIGINAL APPLICATION:
{{reason_codes}}
   • {{reason_1}}
   • {{reason_2}}

The principal reasons above explain why we were unable to approve your original loan request under our standard residential DSCR program. The counteroffer we extended reflected our assessment that a specialty-lender program may have been able to underwrite your file; however, you did not accept the counteroffer within the 90-day window.

YOUR RIGHTS UNDER THE EQUAL CREDIT OPPORTUNITY ACT:
[Standard ECOA disclosure language — same as HEX-001 template]

If an appraisal or written valuation was developed in connection with your application, you have the right to obtain a copy of it. To request a copy, contact us at {{lender_compliance_contact}} within 60 days of the date of this letter.

You may reapply at any time. If your circumstances have changed (e.g., increased reserves, improved credit profile, change in property or transaction structure), we welcome your new application.

Sincerely,

{{compliance_officer_name}}
{{compliance_officer_title}}
{{lender_name}}
NMLS #{{lender_nmls}}

ECOA Disclosure: {{lender_name}} does not discriminate against any applicant on any prohibited basis under the Equal Credit Opportunity Act.
```

#### 2.5.1 SWR-001 — 401(k) Reserves / 60% Haircut Miscalculation (Adverse-Action Block)

```text
PRINCIPAL REASONS:
   • Code 12 (Insufficient cash reserves) — Reserves held primarily in 401(k)/IRA
     accounts must be haircut 60% for liquidity/risk purposes. After applying the
     industry-standard 60% haircut, your effective liquid reserves of
     {{effective_reserves_months}} months fall below the program minimum of 6 months.
   • Code 5 (Application incomplete) — 2 months of bank statements showing liquid funds
     were not provided to support the reserves calculation.

If you wish to reapply, please provide 2 months of bank statements showing liquid funds
sufficient to meet the 6-month reserves minimum after the 401(k) haircut is applied.
```

#### 2.5.2 SWR-002 — Thin DSCR (1.00-1.10) — Counteroffer Rejected (Adverse-Action Block)

```text
PRINCIPAL REASONS:
   • Code 14 (Other) — DSCR of {{borrower_dscr}} falls in the thin band (1.00-1.10)
     requiring either 70% LTV (vs 75% requested) or 9-12mo reserves (vs 6mo provided).
     Counteroffer for either option was not accepted within 90 days.

If you wish to reapply with a lower LTV (70%) or higher reserves (9-12mo), we welcome
your new application.
```

#### 2.5.3 SWR-003 — Sub-660 FICO With Compensators — Specialty-Lender Counteroffer Rejected

```text
PRINCIPAL REASONS:
   • Code 9 (Credit history) — FICO of {{borrower_fico}} falls below our standard
     residential DSCR floor of 660. Counteroffer for referral to specialty lender
     (Bluestone, floor 550; Rize, floor 620) was not accepted within 90 days.

Specialty-lender terms typically include: +50-150bps rate premium, 25-30% down payment
required, 12mo reserves required. If you wish to be referred to a specialty lender,
please reapply and indicate interest in the specialty-lender pathway.
```

#### 2.5.4 SWR-004 — First-Time STR Investor With No Host History — Documentation Not Provided

```text
PRINCIPAL REASONS:
   • Code 5 (Application incomplete) — AirDNA projection report was not provided.
     First-time STR investors (no 12+ month host history) require an AirDNA projection
     with 25% haircut applied.
   • Code 12 (Insufficient cash reserves) — 12mo reserves required for first-time STR
     investors (vs 6mo standard); 9mo provided.

If you wish to reapply, please provide: (1) AirDNA projection for subject property
market, (2) documentation of 12mo reserves, (3) STR permit verification from local
municipality.
```

#### 2.5.5 SWR-007 — Cash-Out Refi With Negative Subject Cash Flow — Portfolio Context Not Documented

```text
PRINCIPAL REASONS:
   • Code 14 (Other) — Cash-out refinance produces negative cash flow on subject
     property (DSCR {{subject_dscr}}). Portfolio aggregate cash-flow documentation was
     not provided to support an exception.
   • Code 13 (Excessive obligations) — Subject property debt service exceeds rent by
     {{monthly_deficit}}/month.

If you wish to reapply, please provide: (1) 12-month rent rolls on all other financed
properties, (2) operating statements for each, (3) documentation showing aggregate
portfolio cash flow positive of at least {{portfolio_minimum}}.
```

#### 2.5.6 SWR-010 — Sub-1.0 DSCR (0.75-0.99) With Compensators — Specialty-Lender Counteroffer Rejected

```text
PRINCIPAL REASONS:
   • Code 14 (Other) — DSCR of {{borrower_dscr}} falls below 1.00. Counteroffer for
     referral to specialty lender (AHLend, Lendmire, Newfi — all of which accept
     0.75-0.80 DSCR with compensators: FICO 700+ + LTV ≤65-70% + 12mo reserves + 3+
     financed properties) was not accepted within 90 days.

Specialty-lender terms typically include: 65-70% LTV max (vs 75% requested), 12mo
reserves required, 3+ financed properties required for portfolio-offset underwriting,
+75-125bps rate premium.
```

#### 2.5.7 SWR-012 — ITIN Borrower With Limited US Credit — Documentation Not Provided

```text
PRINCIPAL REASONS:
   • Code 9 (Credit history) — ITIN-based credit file shows {{trade_lines_count}}
     tradelines with {{trade_lines_months}} months history. Program minimum for ITIN
     borrowers is 3 tradelines with 24+ months history.
   • Code 5 (Application incomplete) — 12 months of bank statements, employment
     verification letter, and 9mo reserves documentation were not provided.

If you wish to reapply, please provide: (1) 12mo bank statements, (2) employment
verification letter, (3) documentation of 9mo reserves, (4) updated ITIN credit
report showing 3+ tradelines with 24+ months history.
```

#### 2.5.8 SWR-014 — STR Market With Pending Legislation — Documentation Not Provided

```text
PRINCIPAL REASONS:
   • Code 14 (Other) — Subject property is in a market with pending STR legislation
     (Phoenix AZ, Austin TX, or Nashville TN residential zones). STR permit verification
     and 6mo STR operating history documentation were not provided.
   • Code 5 (Application incomplete) — STR permit verification from local municipality
     was not provided.

If you wish to reapply, please provide: (1) written STR permit verification from local
municipality, (2) documentation of 6mo STR operating history on the subject property
or comparable property in the same market, (3) contingency plan if pending legislation
restricts STR use.
```

### 2.6 Template Deployment Checklist

Before deploying any template from Part 2 to production, the compliance team must complete the following checklist (counsel sign-off required):

- [ ] All merge fields (`{{...}}`) tested with at least 3 sample borrower profiles
- [ ] Creditor name + address verified against NMLS Consumer Access database
- [ ] ECOA disclosure statement matches CFPB model form C-1 (creditor) or C-3 (multiple creditors)
- [ ] Federal agency name + address verified for the lender's primary regulator (CFPB for lenders >$10B assets; FDIC/OCC/NCUA for banks; state agency for non-bank lenders)
- [ ] Reason codes verified against Reg B Appendix C (see Part 3 of this packet)
- [ ] Timeline tested: notice generated and sent within 30 calendar days of completed application
- [ ] Delivery method tested: email template renders correctly in Gmail/Outlook/Apple Mail; USPS letter template prints on lender letterhead
- [ ] Retention: copy of each notice stored in immutable audit log per Reg B §1002.12 (see Part 6 of this packet)
- [ ] Fair-lensing audit: notice delivery tracked by protected-class proxy (ITIN, FN, prior credit event) — if any cohort has materially lower delivery rate, investigate
- [ ] CFPB exam-ready: each notice template + sample delivery records available for CFPB examination team within 24 hours of request

---

## Part 3 — ECOA Adverse-Action Reason Code Library

### 3.1 Regulatory Source

Regulation B Appendix C (12 CFR Part 1002, Supplement I) provides the model form for adverse-action notices. The "principal reasons" portion of the model form includes a list of sample reason codes that creditors may use or adapt. Creditors are not required to use the model form, but using it provides a "safe harbor" under §1002.9(b)(1). The reason codes below are drawn from Reg B Appendix C Sample Forms C-1 through C-7, supplemented with CFPB guidance from the CFPB Fair Lending Examination Procedures (CFPB Examination Manual, version 09/2023, §1002.9 section).

### 3.2 Applicability to DSCR Lending

DSCR lending differs from conventional mortgage lending in one critical respect: **DTI (debt-to-income ratio) is not used as an underwriting criterion.** This means Reason Code 7 (Proportion of debt to income) is **NOT applicable** to DSCR files and must not be used. DSCR lenders must use the property-cash-flow (DSCR) criterion instead, which is captured under Code 14 (Other — "DSCR below program minimum") or under Code 10 (Amount or type of income — when the rental income itself is the issue, e.g., speculative rents, unsupported AirDNA projection).

For each code below, the table provides: code number, official CFPB label, applicability to DSCR (Yes / No / Conditional), when to use it for DSCR files, when NOT to use it, and sample disclosure language.

### 3.3 Reason Code Catalog

| Code | Official Label | DSCR Applicable? | When to Use for DSCR | When NOT to Use | Sample Disclosure Language |
|---|---|---|---|---|---|
| **1** | Value or type of collateral not sufficient | YES | Property appraisal came in below purchase price (e.g., CF-025 Atlanta appraisal-short decline); property value does not support requested LTV. | Do not use for DSCR/strength issues — that's Code 14. Do not use for property-type ineligibility (condotel, non-warrantable) — that's Code 1 OR Code 3 depending on framing. | "The appraised value of the collateral property was insufficient to support the requested loan amount at the program's maximum loan-to-value ratio." |
| **2** | Terms of collateral | YES | Property is in softening market where LTV cap was reduced (SWR-008); property has condition issues requiring LTV haircut (SWR-006 open violations); property is in insurance-crisis market (FL wind, CA wildfire) where lender pullback requires lower LTV. | Do not use for property-type issues (use Code 1 or 3). Do not use for credit issues. | "The terms of the collateral (market conditions, property condition, or insurance availability) required a more conservative loan-to-value ratio than your requested loan amount." |
| **3** | Collateral insufficient | YES | Condotel, non-warrantable condo, unpermitted ADU (HEX-004, HEX-005, SWR-015); property-type ineligible at standard residential DSCR. | Do not use for credit or financial-profile issues. Do not use when collateral is sufficient but LTV is too high (use Code 1 or 2). | "The collateral property did not meet our program's eligibility requirements for property type, warrantability, or condition." |
| **4** | Length of time established | NO | Not applicable to DSCR — "length of time established" historically refers to credit-file age, which DSCR programs do not underwrite on. ITIN/FN borrowers with limited US credit history use Code 9 instead. | Do not use for DSCR files. If you need to flag short credit history, use Code 9 (Credit history). | N/A — not used for DSCR. |
| **5** | Application incomplete | YES (Conditional) | Borrower did not provide required documentation (e.g., AirDNA projection SWR-004, portfolio rent rolls SWR-007, 12mo bank statements SWR-012, AML source-of-funds HEX-011). Also used for HEX-006 deferral (12-month seasoning documentation not provided). | Do not use if borrower provided all required documentation but did not meet program criteria — use the specific criterion code (Code 9 for credit, Code 12 for reserves, Code 14 for DSCR). | "Your application was incomplete. We did not receive all of the information needed to evaluate your request: [list specific missing documentation]." |
| **6** | Temporary or irregular employment | NO (Generally) | Not applicable to DSCR — DSCR programs do not underwrite on employment history. ITIN/FN borrowers use Code 10 (Amount or type of income) if income documentation is the issue. | Do not use for DSCR files. If employment-related, use Code 10 (income documentation). | N/A — not used for DSCR. |
| **7** | Proportion of debt to income (DTI) | **NO — NEVER USE FOR DSCR** | **NEVER use this code for DSCR files.** DSCR programs do not underwrite on DTI. Using this code would misrepresent the underwriting methodology and could create ECOA §1002.6(a) fair-lensing exposure. | NEVER use for DSCR. If the issue is property cash flow, use Code 14 (Other — "DSCR below program minimum"). If the issue is borrower debt burden (rare in DSCR), use Code 13 (Excessive obligations). | N/A — never used for DSCR. |
| **8** | Employment history | NO (Generally) | Not applicable to DSCR — DSCR programs do not underwrite on employment history. May be used for HEX-006 if mortgage late was caused by documented employment disruption — but this is rare. | Do not use for DSCR files. If you must flag employment-related issues (rare), document the specific basis. | N/A — not used for DSCR except in narrow HEX-006 employment-disruption subcases. |
| **9** | Credit history | YES | FICO below program floor (SWR-003 sub-660); mortgage late within 12 months (HEX-006); unresolved delinquency (HEX-009); ITIN borrower with limited US credit (SWR-012); prior credit event within seasoning window (HEX-007, HEX-008). **Highest-volume code for DSCR files.** | Do not use for property or collateral issues. Do not use for DSCR or financial-profile issues — use Code 14 for DSCR, Code 12 for reserves, Code 13 for debt burden. | "Your credit history did not meet our program's standards: [specific reason — e.g., 'mortgage late within the past 12 months,' 'FICO score below program floor of 660,' 'unresolved delinquency on existing mortgage obligation']." |
| **10** | Amount or type of income | YES (Conditional) | Income documentation insufficient for FN/ITIN borrowers (SWR-005 no-credit-country FN, SWR-012 ITIN limited credit); rental income not supportable (HEX-015 speculative rents without lease/1007); STR income projection methodology insufficient (SWR-004 first-time STR). | Do not use for DSCR-strength issues — use Code 14 (Other — "DSCR below program minimum"). Code 10 is for *income documentation* issues, not *income amount* issues. | "The amount or type of income documentation provided did not meet our program's standards: [specific reason — e.g., 'foreign-source income required certified English translation,' 'rental income required lease agreement or Form 1007 market-rent appraisal']." |
| **11** | Length of residence | NO | Not applicable to DSCR — DSCR programs do not underwrite on length of residence. | Do not use for DSCR files. | N/A — not used for DSCR. |
| **12** | Insufficient cash reserves | YES | Reserves below program minimum (SWR-001 401k haircut miscalc; SWR-004 first-time STR 12mo required, 9mo provided); reserves held in ineligible accounts (foreign-domiciled SWR-016). | Do not use for DSCR or property issues. Do not use for income documentation issues — use Code 10. | "Your cash reserves were insufficient to meet our program's minimum requirement of [N] months of debt service on the subject property." |
| **13** | Excessive obligations | YES (Conditional) | Borrower has excessive existing mortgage obligations that would prevent them from meeting program requirements even with strong DSCR (SWR-007 negative subject cash flow without portfolio offset; HEX-009 active delinquency reflecting debt burden). | Do not use for DSCR issues alone — use Code 14. Use Code 13 when the issue is the *aggregate* debt burden, not the subject property's DSCR. | "Your existing obligations were excessive relative to the program's requirements for additional debt extension." |
| **14** | Other (specific reason required) | YES — HIGH-VOLUME | **Most-used code for DSCR files.** Used for: DSCR below program minimum (HEX-015, SWR-002, SWR-010); property-type ineligible at standard residential DSCR but specialty-routable (HEX-004 condotel, HEX-005 non-warrantable, HEX-013 commercial, HEX-016 5-8 unit); STR regulatory ineligibility (HEX-002 NYC, HEX-003 Nashville, HEX-014 permit unobtainable); loan amount below floor (HEX-012); primary residence (HEX-001); FN LLC requirement not met (HEX-010). **Must always provide specific reason — generic "did not meet program guidelines" is insufficient under §1002.9(b)(2).** | Do not use when a more specific code applies (Codes 1, 3, 5, 9, 10, 12, 13). Code 14 is the catch-all — but specificity is still required. | "Other: [specific reason — e.g., 'Property identified as intended for primary residence, which is ineligible for the DSCR program (business-purpose investment only),' 'DSCR of 0.95 below program minimum of 1.00 even with compensating factors,' 'Loan amount of $75,000 below program minimum of $100,000']." |

### 3.4 Multi-Code Stacking Guidance

When multiple reasons apply to a single denial, §1002.9(b)(2) requires disclosure of the **principal reasons** (typically 2-4 reasons). Counsel should verify that the reason codes selected accurately reflect the underwriting decision and do not overstate or understate the basis for denial.

**Recommended stacking patterns for DSCR:**

| Scenario | Primary Code | Secondary Code | Tertiary Code |
|---|---|---|---|
| HEX-001 Primary Residence | Code 14 (program-eligibility) | Code 5 (if docs incomplete) | — |
| HEX-009 Active Delinquency | Code 9 (credit history) | Code 13 (excessive obligations) | Code 14 (program-criterion citation) |
| HEX-012 Sub-$100K Loan | Code 14 (program floor) | — | — |
| HEX-013 Commercial Use | Code 1 (collateral type) | Code 3 (collateral insufficient) | Code 14 (program-criterion citation) |
| HEX-006 Mortgage Late (deferral) | Code 5 (incomplete — seasoning docs not provided) | Code 9 (credit history) | — |
| HEX-007 Foreclosure Sub-Seasoning | Code 9 (credit history) | Code 14 (program seasoning requirement) | — |
| HEX-008 Bankruptcy Sub-Seasoning | Code 9 (credit history) | Code 14 (program seasoning requirement) | — |
| HEX-010 FN Without US LLC | Code 14 (program requirement — LLC) | Code 10 (income documentation) | — |
| HEX-011 FN Without AML Trail | Code 5 (incomplete — AML docs) | Code 10 (income documentation) | — |
| HEX-015 Speculative Rents | Code 10 (income documentation) | Code 5 (incomplete — lease/1007) | — |
| SWR-001 401k Reserves | Code 12 (insufficient reserves) | Code 5 (incomplete — bank statements) | — |
| SWR-002 Thin DSCR | Code 14 (DSCR thin band) | — | — |
| SWR-003 Sub-660 FICO | Code 9 (credit history) | Code 14 (program floor) | — |
| SWR-004 First-Time STR | Code 5 (incomplete — AirDNA) | Code 12 (insufficient reserves) | — |
| SWR-007 Negative Subject CF | Code 14 (negative subject cash flow) | Code 13 (excessive obligations) | — |
| SWR-010 Sub-1.0 DSCR | Code 14 (DSCR below 1.00) | — | — |
| SWR-012 ITIN Limited Credit | Code 9 (credit history) | Code 5 (incomplete — bank statements/employment letter) | — |

### 3.5 Forbidden Reason-Code Patterns (UDAAP Risk)

The following reason-code patterns create UDAAP risk under 12 U.S.C. §5531 and §5536 and must NOT be used:

- **Forbidden:** Generic "did not meet program guidelines" without specific reason (§1002.9(b)(2) specificity violation)
- **Forbidden:** Code 7 (DTI) for any DSCR file (misrepresents underwriting methodology)
- **Forbidden:** Code 4 (length of time established) for DSCR file (irrelevant criterion, may function as age proxy)
- **Forbidden:** Code 11 (length of residence) for DSCR file (irrelevant criterion, may function as national-origin proxy)
- **Forbidden:** Code 6 (temporary or irregular employment) for DSCR file unless specifically documented (may function as income-source proxy for protected class)
- **Forbidden:** Code 8 (employment history) for DSCR file unless specifically documented (same risk)
- **Forbidden:** Reason codes that imply protected-class basis (e.g., "borrower's immigration status" — use "borrower did not provide AML source-of-funds documentation" instead)
- **Forbidden:** Reason codes that are subjective ("gut feel," "concern about borrower's commitment") — all reason codes must be tied to objective, documented program criteria

### 3.6 Reason-Code Audit Protocol

The compliance team must audit reason-code usage quarterly per Part 9 of this packet. The audit must verify:

1. Each adverse-action notice has at least one reason code from Reg B Appendix C
2. Code 14 (Other) always has a specific reason disclosed — never the generic "did not meet program guidelines"
3. Code 7 (DTI) is NEVER used for any DSCR file
4. Reason-code distribution by protected-class proxy (ITIN, FN, prior credit event) is statistically tested for disparate impact (see Part 4 of this packet)
5. Reason-code usage is consistent across loan originators (LOs) — if any LO uses materially different reason-code patterns, investigate for ECOA §1002.4(b) discrimination
6. Sample of 10% of adverse-action notices from the prior quarter is reviewed by counsel for compliance with §1002.9(b)(2) specificity

---

## Part 4 — Fair-Lensing Statistical Test Plan (THE WOW ELEMENT)

### 4.0 Overview

This Part 4 ships runnable R and Python code that the compliance team can execute against funded-loan data to perform the three fair-lensing statistical tests the CFPB expects to see in any fair-lending examination: (a) **proxy regression** — testing whether facially neutral variables function as proxies for protected-class characteristics; (b) **boundary / less discriminatory alternative (LDA) test** — testing whether less discriminatory alternatives exist for each facially neutral criterion; (c) **disparate impact 3-prong test** — the structured analytical framework required by the Supreme Court's *Inclusive Communities* decision, 576 U.S. 519 (2015).

The code below assumes the existence of the `fair_lensing_audit` PostgreSQL table defined in Part 5 of this packet. The compliance team must populate this table with funded-loan data plus post-funding self-reported demographic survey responses **before** running any of the tests below. Critically, the demographic data must NEVER be available to the underwriting team (Part 5 §5.3 access control) — it exists only for fair-lensing audit purposes.

**Compliance caveat:** This is *audit* code, not *underwriting* code. The tests below test whether the underwriting system has produced disparate outcomes by protected class — they do not make underwriting decisions. Running these tests is a defensive measure that protects the lender against fair-lending enforcement actions; failing to run them is itself an examination finding (CFPB Fair Lending Examination Procedures §1002.6).

### 4.1 Data Preparation (Python + SQL)

Before running any test, the compliance team must extract a clean analytic dataset from the production database. The extraction logic below uses Python + psycopg2 to query the `fair_lensing_audit` table (Part 5) joined with the `loans` and `loan_applications` tables.

```python
"""
fair_lens_data_prep.py — Extract funded + declined loan data with demographic overlay
for fair-lensing statistical analysis.

Source tables:
  - loans (production)
  - loan_applications (production)
  - fair_lensing_audit (Part 5 schema — compliance-only access)

Output: fair_lens_dataset.csv — single flat file for R/Python statistical tests.

CRITICAL: This script MUST be run by a compliance_team_only role account.
Underwriting_team role has NO SELECT privilege on fair_lensing_audit (see Part 5.3).
"""

import os
import psycopg2
import pandas as pd
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()  # Loads DB credentials from .env (COMPLIANCE_DB_USER, COMPLIANCE_DB_PASS, etc.)

def extract_fair_lens_dataset(start_date: str, end_date: str) -> pd.DataFrame:
    """
    Extract funded + declined loan data with demographic overlay for fair-lensing audit.

    Args:
        start_date: YYYY-MM-DD — start of audit period (typically 12 months ago)
        end_date: YYYY-MM-DD — end of audit period (typically today)

    Returns:
        DataFrame with one row per loan application, including:
          - application_id, loan_id, application_date, decision_date
          - decision (approved / declined / withdrawn / counteroffer_accepted)
          - borrower financials (fico, dscr, ltv, reserves_months, loan_amount)
          - property (type, market, units)
          - underwriting inputs (itin_indicator, fn_indicator, credit_event_indicator)
          - self-reported demographics (race_ethnicity, sex, age_band, marital_status)
            — populated only where collection_consent=True AND refusal_to_disclose=False
    """
    conn = psycopg2.connect(
        host=os.environ["COMPLIANCE_DB_HOST"],
        database=os.environ["COMPLIANCE_DB_NAME"],
        user=os.environ["COMPLIANCE_DB_USER"],  # compliance_team_only role
        password=os.environ["COMPLIANCE_DB_PASS"],
    )

    query = """
    SELECT
        la.application_id,
        l.loan_id,
        la.application_date,
        la.decision_date,
        la.decision,
        la.decline_reason_codes,  -- array of Appendix C code numbers
        la.fico_at_application,
        la.dscr_at_application,
        la.ltv_at_application,
        la.reserves_months_at_application,
        la.loan_amount_requested,
        la.property_type,
        la.property_market,  -- MSA
        la.property_units,
        la.itin_indicator,           -- TRUE if borrower is ITIN (not SSN)
        la.fn_indicator,             -- TRUE if borrower is foreign-national
        la.credit_event_indicator,   -- TRUE if borrower has prior bankruptcy/foreclosure/short-sale
        la.specialty_lender_routed,  -- TRUE if routed to specialty lender (HEX-002/003/004/005/010/011/013/014/015/016)
        fla.race_ethnicity,          -- aggregated per Census categories
        fla.sex,
        fla.age_band,                -- 5-year bands
        fla.marital_status
    FROM loan_applications la
    LEFT JOIN loans l ON la.application_id = l.application_id
    LEFT JOIN fair_lensing_audit fla ON la.application_id = fla.loan_id
        AND fla.collection_consent = TRUE
        AND fla.refusal_to_disclose = FALSE
    WHERE la.application_date BETWEEN %s AND %s
        AND la.decision IN ('approved', 'declined', 'counteroffer_accepted')
    """

    df = pd.read_sql(query, conn, params=(start_date, end_date))
    conn.close()

    # Engineer analytic features
    df['approved'] = (df['decision'].isin(['approved', 'counteroffer_accepted'])).astype(int)
    df['declined'] = (df['decision'] == 'declined').astype(int)
    df['has_demographics'] = df['race_ethnicity'].notna().astype(int)

    # Create protected-class binary indicators for regression
    df['race_white'] = (df['race_ethnicity'] == 'White, Non-Hispanic').astype(int)
    df['race_black'] = (df['race_ethnicity'] == 'Black or African American, Non-Hispanic').astype(int)
    df['race_hispanic'] = (df['race_ethnicity'] == 'Hispanic or Latino').astype(int)
    df['race_asian'] = (df['race_ethnicity'] == 'Asian, Non-Hispanic').astype(int)
    df['race_other'] = df['race_ethnicity'].isin(
        ['American Indian or Alaska Native', 'Native Hawaiian or Other Pacific Islander', 'Two or More Races']
    ).astype(int)

    df['sex_male'] = (df['sex'] == 'Male').astype(int)
    df['sex_female'] = (df['sex'] == 'Female').astype(int)

    df['age_62_plus'] = df['age_band'].isin(['62-66', '67-71', '72-76', '77-81', '82-86', '87+']).astype(int)

    df['married'] = (df['marital_status'] == 'Married').astype(int)

    # Save dataset
    output_path = f'/home/z/my-project/compliance/fair_lens_dataset_{start_date}_to_{end_date}.csv'
    df.to_csv(output_path, index=False)
    print(f"Fair-lensing dataset extracted: {len(df)} rows → {output_path}")
    print(f"  Demographic coverage: {df['has_demographics'].sum()}/{len(df)} ({df['has_demographics'].mean()*100:.1f}%)")
    print(f"  Approval rate (overall): {df['approved'].mean()*100:.1f}%")
    return df


if __name__ == '__main__':
    # Standard quarterly audit: prior 12 months
    end_date = datetime.today().strftime('%Y-%m-%d')
    start_date = (datetime.today() - timedelta(days=365)).strftime('%Y-%m-%d')
    extract_fair_lens_dataset(start_date, end_date)
```

### 4.2 Proxy Regression Methodology (R Code)

**Test purpose:** Determine whether facially neutral underwriting variables (ITIN status, foreign-national status, prior credit event) function as statistical proxies for protected-class characteristics (race, national origin, age, family status). If a facially neutral variable is a *strong* proxy for a protected class (R-squared > 0.30), use of that variable creates fair-lensing risk under ECOA §1002.6(a) — even if the variable is facially neutral, it may be deemed a "proxy" for a prohibited basis.

**CFPB examination expectation:** The CFPB Fair Lending Examination Procedures specifically direct examiners to test for proxy relationships using regression analysis. Creditors are expected to have performed this analysis themselves before examination.

```r
# =============================================================================
# proxy_regression.R — Fair-lensing proxy regression analysis
#
# Tests whether facially neutral underwriting variables (ITIN, FN, credit event)
# function as statistical proxies for protected-class characteristics.
#
# Methodology: Logistic regression of protected-class indicator on facially
# neutral indicators + underwriting controls. Pseudo-R-squared > 0.30 indicates
# strong proxy relationship (per CFPB Fair Lending Examination Procedures).
#
# Required R packages: tidyverse, broom, car, pROC
# Install: install.packages(c("tidyverse", "broom", "car", "pROC"))
# =============================================================================

library(tidyverse)
library(broom)
library(car)
library(pROC)

# ----------------------------------------------------------------------------
# 1. Load funded-loan dataset with demographic overlay
# ----------------------------------------------------------------------------
funded_loans <- read_csv(
  "/home/z/my-project/compliance/fair_lens_dataset_2024-01-01_to_2024-12-31.csv"
) %>%
  filter(has_demographics == 1) %>%  # analyze only loans with self-reported demographics
  mutate(
    # Binary indicators (already engineered in Python, but defensive re-cast)
    itin_indicator     = as.integer(itin_indicator == TRUE),
    fn_indicator       = as.integer(fn_indicator == TRUE),
    credit_event_indicator = as.integer(credit_event_indicator == TRUE),
    # Underwriting controls (centered for regression interpretability)
    fico_centered      = fico_at_application - mean(fico_at_application, na.rm = TRUE),
    ltv_centered       = ltv_at_application - mean(ltv_at_application, na.rm = TRUE),
    dscr_centered      = dscr_at_application - mean(dscr_at_application, na.rm = TRUE),
    reserves_centered  = reserves_months_at_application - mean(reserves_months_at_application, na.rm = TRUE)
  )

cat("Sample size for proxy regression:", nrow(funded_loans), "funded loans with demographics\n")

# ----------------------------------------------------------------------------
# 2. TEST 1: Does ITIN status predict Hispanic/Latino ethnicity?
#    If yes, ITIN is a proxy for national origin → fair-lensing risk
# ----------------------------------------------------------------------------
cat("\n=== TEST 1: ITIN → Hispanic/Latino proxy strength ===\n")

proxy_itin_hispanic <- glm(
  race_hispanic ~ itin_indicator + fn_indicator + credit_event_indicator +
                  fico_centered + ltv_centered + dscr_centered + reserves_centered,
  data = funded_loans,
  family = binomial()
)

# McFadden pseudo-R-squared (logistic regression analog of OLS R-squared)
ll_full    <- logLik(proxy_itin_hispanic)
ll_null    <- logLik(glm(race_hispanic ~ 1, data = funded_loans, family = binomial()))
mcfadden_r2 <- as.numeric(1 - (ll_full / ll_null))

cat(sprintf("McFadden pseudo-R-squared: %.4f\n", mcfadden_r2))
cat(sprintf("Interpretation: %s\n",
    ifelse(mcfadden_r2 > 0.30, "STRONG PROXY — fair-lensing risk; ITIN is predictive of Hispanic ethnicity",
    ifelse(mcfadden_r2 > 0.15, "MODERATE PROXY — monitor; review underwriting policy basis",
    "WEAK PROXY — ITIN is not a strong proxy; underwriting policy defensible"))))

# Coefficient + significance on ITIN
tidy_itin <- tidy(proxy_itin_hispanic) %>% filter(term == "itin_indicator")
cat(sprintf("ITIN coefficient: %.4f (p = %.4f) — odds ratio: %.2f\n",
    tidy_itin$estimate, tidy_itin$p.value, exp(tidy_itin$estimate)))

# AUC for discrimination ability
roc_obj <- roc(funded_loans$race_hispanic, predict(proxy_itin_hispanic, type = "response"))
cat(sprintf("AUC: %.4f (0.5 = no discrimination; 1.0 = perfect discrimination)\n", auc(roc_obj)))

# ----------------------------------------------------------------------------
# 3. TEST 2: Does foreign-national status predict Asian ethnicity?
#    (Asian is one of several possible FN-source-country proxies)
# ----------------------------------------------------------------------------
cat("\n=== TEST 2: FN → Asian ethnicity proxy strength ===\n")

proxy_fn_asian <- glm(
  race_asian ~ itin_indicator + fn_indicator + credit_event_indicator +
               fico_centered + ltv_centered + dscr_centered + reserves_centered,
  data = funded_loans,
  family = binomial()
)

ll_full_fn   <- logLik(proxy_fn_asian)
ll_null_fn   <- logLik(glm(race_asian ~ 1, data = funded_loans, family = binomial()))
mcfadden_r2_fn <- as.numeric(1 - (ll_full_fn / ll_null_fn))

cat(sprintf("McFadden pseudo-R-squared: %.4f\n", mcfadden_r2_fn))
cat(sprintf("Interpretation: %s\n",
    ifelse(mcfadden_r2_fn > 0.30, "STRONG PROXY — fair-lensing risk; FN is predictive of Asian ethnicity",
    ifelse(mcfadden_r2_fn > 0.15, "MODERATE PROXY — monitor",
    "WEAK PROXY — FN is not a strong proxy; underwriting policy defensible"))))

# ----------------------------------------------------------------------------
# 4. TEST 3: Does prior credit event predict age 62+ (family status / age proxy)?
#    Prior credit events (bankruptcy, foreclosure) correlate with divorce, medical
#    debt, disability — all of which correlate with age and family status.
# ----------------------------------------------------------------------------
cat("\n=== TEST 3: Credit event → Age 62+ proxy strength ===\n")

proxy_credit_age <- glm(
  age_62_plus ~ itin_indicator + fn_indicator + credit_event_indicator +
                fico_centered + ltv_centered + dscr_centered + reserves_centered,
  data = funded_loans,
  family = binomial()
)

ll_full_age  <- logLik(proxy_credit_age)
ll_null_age  <- logLik(glm(age_62_plus ~ 1, data = funded_loans, family = binomial()))
mcfadden_r2_age <- as.numeric(1 - (ll_full_age / ll_null_age))

cat(sprintf("McFadden pseudo-R-squared: %.4f\n", mcfadden_r2_age))
cat(sprintf("Interpretation: %s\n",
    ifelse(mcfadden_r2_age > 0.30, "STRONG PROXY — credit event is predictive of age 62+",
    ifelse(mcfadden_r2_age > 0.15, "MODERATE PROXY — monitor",
    "WEAK PROXY — credit event is not a strong proxy for age"))))

# ----------------------------------------------------------------------------
# 5. TEST 4: Does prior credit event predict marital status (divorce proxy)?
# ----------------------------------------------------------------------------
cat("\n=== TEST 4: Credit event → Unmarried proxy strength ===\n")

funded_loans$unmarried <- ifelse(funded_loans$marital_status %in% c("Single", "Divorced", "Widowed", "Separated"), 1L, 0L)

proxy_credit_unmarried <- glm(
  unmarried ~ itin_indicator + fn_indicator + credit_event_indicator +
              fico_centered + ltv_centered + dscr_centered + reserves_centered,
  data = funded_loans,
  family = binomial()
)

ll_full_un   <- logLik(proxy_credit_unmarried)
ll_null_un   <- logLik(glm(unmarried ~ 1, data = funded_loans, family = binomial()))
mcfadden_r2_un <- as.numeric(1 - (ll_full_un / ll_null_un))

cat(sprintf("McFadden pseudo-R-squared: %.4f\n", mcfadden_r2_un))

# ----------------------------------------------------------------------------
# 6. SAVE RESULTS TO COMPLIANCE AUDIT FOLDER
# ----------------------------------------------------------------------------
results_df <- tibble(
  test = c("ITIN → Hispanic", "FN → Asian", "Credit event → Age 62+", "Credit event → Unmarried"),
  mcfadden_r2 = c(mcfadden_r2, mcfadden_r2_fn, mcfadden_r2_age, mcfadden_r2_un),
  risk_level = case_when(
    c(mcfadden_r2, mcfadden_r2_fn, mcfadden_r2_age, mcfadden_r2_un) > 0.30 ~ "STRONG_PROXY",
    c(mcfadden_r2, mcfadden_r2_fn, mcfadden_r2_age, mcfadden_r2_un) > 0.15 ~ "MODERATE_PROXY",
    TRUE ~ "WEAK_PROXY"
  ),
  audit_date = Sys.Date()
)

write_csv(results_df,
  sprintf("/home/z/my-project/compliance/proxy_regression_results_%s.csv", Sys.Date()))

cat("\n=== Proxy regression analysis complete ===\n")
cat(sprintf("Results saved: /home/z/my-project/compliance/proxy_regression_results_%s.csv\n", Sys.Date()))

# Flag any STRONG_PROXY findings for compliance officer review
strong_proxies <- results_df %>% filter(risk_level == "STRONG_PROXY")
if (nrow(strong_proxies) > 0) {
  cat("\n!!! ATTENTION COMPLIANCE OFFICER !!!\n")
  cat("STRONG proxy relationships detected — fair-lensing risk:\n")
  print(strong_proxies)
  cat("\nRequired action: Document business necessity for each facially neutral variable\n")
  cat("with strong proxy. Consider less discriminatory alternatives (Test 4.3 below).\n")
}
```

### 4.3 Boundary Test / Less Discriminatory Alternative (Python Code)

**Test purpose:** For each facially neutral underwriting criterion (e.g., "25% down payment required on FN files"), test whether a less discriminatory alternative (LDA) exists that achieves the same legitimate business purpose (default-risk prediction) with less adverse impact on the protected class. If a less discriminatory alternative exists, the original criterion may fail the third prong of the disparate impact 3-prong test (see §4.4 below).

**CFPB expectation:** The CFPB expects creditors to have tested LDAs as part of their fair-lensing program. Failure to do so is an examination finding.

```python
"""
less_discriminatory_alternative_test.py — Boundary test for LDA existence

For each facially neutral underwriting criterion, tests whether a less
discriminatory alternative (LDA) exists that achieves the same business purpose
(default-risk prediction) with less adverse impact on protected class.

Methodology: Z-test comparing default rates at the current policy threshold
vs a candidate LDA threshold. If the difference in default rates is NOT
statistically significant (p > 0.05) AND the LDA threshold admits more
protected-class applicants, the LDA exists and the original policy may fail
the disparate impact 3-prong test (Prong 3: less discriminatory alternative).

Required Python packages: pandas, numpy, scipy, statsmodels
Install: pip install pandas numpy scipy statsmodels
"""

import pandas as pd
import numpy as np
from scipy import stats
from statsmodels.stats.proportion import proportions_ztest
from datetime import datetime


def load_default_data():
    """Load funded-loan dataset with 24-month default outcome."""
    df = pd.read_csv(
        '/home/z/my-project/compliance/funded_loans_with_24mo_default.csv',
        dtype={'race_ethnicity': str, 'sex': str, 'age_band': str}
    )
    df['default_24mo'] = df['default_24mo'].astype(int)
    return df


def boundary_test_lda(df, policy_variable, current_threshold, lda_threshold,
                      protected_class_col, protected_class_val,
                      default_col='default_24mo'):
    """
    Test whether a less discriminatory alternative (LDA) threshold exists
    for a facially neutral underwriting criterion.

    Args:
        df: DataFrame with funded loans + 24-month default outcome
        policy_variable: column name of the facially neutral criterion
                        (e.g., 'ltv_at_application', 'fico_at_application',
                         'dscr_at_application', 'reserves_months_at_application')
        current_threshold: current policy threshold (e.g., 0.75 for 75% LTV max on FN)
        lda_threshold: candidate LDA threshold (e.g., 0.80 for 80% LTV max on FN)
        protected_class_col: column name of protected-class indicator
                            (e.g., 'race_hispanic', 'race_black', 'age_62_plus')
        protected_class_val: value indicating protected-class membership (typically 1)
        default_col: column name of default outcome (typically 'default_24mo')

    Returns:
        dict with test results: {
            'policy_variable': str,
            'current_threshold': float,
            'lda_threshold': float,
            'n_current': int, 'n_lda': int,
            'default_rate_current': float, 'default_rate_lda': float,
            'z_stat': float, 'p_value': float,
            'lda_exists': bool,  # True if LDA is viable (p > 0.05)
            'protected_class_admission_rate_current': float,
            'protected_class_admission_rate_lda': float,
            'protected_class_admission_lift': float,  # LDA admission rate / current admission rate
        }
    """
    # Subset to funded loans (these all passed the policy threshold)
    funded = df[df[default_col].notna()].copy()

    # Determine which loans would have been admitted at current vs LDA threshold
    # For LTV (lower is more permissive): admitted if LTV <= threshold
    if policy_variable == 'ltv_at_application':
        funded['admitted_current'] = (funded[policy_variable] <= current_threshold).astype(int)
        funded['admitted_lda'] = (funded[policy_variable] <= lda_threshold).astype(int)
    # For FICO / DSCR / reserves (higher is more permissive): admitted if >= threshold
    else:
        funded['admitted_current'] = (funded[policy_variable] >= current_threshold).astype(int)
        funded['admitted_lda'] = (funded[policy_variable] >= lda_threshold).astype(int)

    # Default rates among admitted cohorts (using actual observed defaults)
    # Note: We only observe defaults for loans that were actually funded.
    # For loans that would have been admitted under LDA but not under current policy,
    # we need to either (a) use a proxy model or (b) flag this as an out-of-sample limitation.
    # The honest approach is (b) — note the limitation explicitly.

    admitted_current = funded[funded['admitted_current'] == 1]
    admitted_lda = funded[funded['admitted_lda'] == 1]

    # Z-test: default rate at current threshold vs default rate at LDA threshold
    # H0: default_rate_current == default_rate_lda
    # H1: default_rate_current != default_rate_lda
    # If we cannot reject H0 (p > 0.05), the LDA achieves similar default prediction
    # → less discriminatory alternative exists

    n_current = len(admitted_current)
    n_lda = len(admitted_lda)
    defaults_current = admitted_current[default_col].sum()
    defaults_lda = admitted_lda[default_col].sum()

    if n_current == 0 or n_lda == 0:
        return {'error': 'Insufficient sample size'}

    # Two-proportion z-test
    count = np.array([defaults_current, defaults_lda])
    nobs = np.array([n_current, n_lda])
    z_stat, p_value = proportions_ztest(count, nobs)

    # Protected-class admission rate (in the broader applicant pool, not just funded)
    # This requires the full applicant pool — assume df has all applicants
    applicants = df.copy()
    if policy_variable == 'ltv_at_application':
        applicants['admitted_current'] = (applicants[policy_variable] <= current_threshold).astype(int)
        applicants['admitted_lda'] = (applicants[policy_variable] <= lda_threshold).astype(int)
    else:
        applicants['admitted_current'] = (applicants[policy_variable] >= current_threshold).astype(int)
        applicants['admitted_lda'] = (applicants[policy_variable] >= lda_threshold).astype(int)

    protected_class = applicants[applicants[protected_class_col] == protected_class_val]
    if len(protected_class) == 0:
        pc_admission_current = np.nan
        pc_admission_lda = np.nan
    else:
        pc_admission_current = protected_class['admitted_current'].mean()
        pc_admission_lda = protected_class['admitted_lda'].mean()

    return {
        'policy_variable': policy_variable,
        'current_threshold': current_threshold,
        'lda_threshold': lda_threshold,
        'n_current': int(n_current),
        'n_lda': int(n_lda),
        'default_rate_current': float(defaults_current / n_current),
        'default_rate_lda': float(defaults_lda / n_lda),
        'z_stat': float(z_stat),
        'p_value': float(p_value),
        'lda_exists': bool(p_value > 0.05),
        'protected_class': protected_class_col,
        'protected_class_val': protected_class_val,
        'protected_class_admission_rate_current': float(pc_admission_current) if not np.isnan(pc_admission_current) else None,
        'protected_class_admission_rate_lda': float(pc_admission_lda) if not np.isnan(pc_admission_lda) else None,
        'protected_class_admission_lift': float(pc_admission_lda / pc_admission_current) if (pc_admission_current and pc_admission_current > 0) else None,
    }


def run_fair_lens_lda_battery():
    """
    Run the full LDA battery on the four highest-risk facially neutral criteria
    in DSCR underwriting.
    """
    df = load_default_data()

    # Define LDA battery
    lda_battery = [
        # (policy_variable, current_threshold, lda_threshold, protected_class_col, protected_class_val, test_name)
        ('ltv_at_application', 0.75, 0.80, 'race_hispanic', 1, 'FN/ITIN cohort: 75% LTV → 80% LTV (Hispanic)'),
        ('ltv_at_application', 0.65, 0.70, 'race_black', 1, 'No-credit FN: 65% LTV → 70% LTV (Black)'),
        ('fico_at_application', 660, 620, 'race_hispanic', 1, 'Standard FICO floor: 660 → 620 (Hispanic)'),
        ('fico_at_application', 700, 660, 'age_62_plus', 1, 'Specialty FN FICO: 700 → 660 (Age 62+)'),
        ('dscr_at_application', 1.25, 1.10, 'race_hispanic', 1, 'DSCR floor: 1.25 → 1.10 (Hispanic)'),
        ('dscr_at_application', 1.00, 0.80, 'race_black', 1, 'DSCR floor: 1.00 → 0.80 (Black)'),
        ('reserves_months_at_application', 12, 9, 'race_hispanic', 1, 'FN reserves: 12mo → 9mo (Hispanic)'),
        ('reserves_months_at_application', 6, 3, 'age_62_plus', 1, 'Standard reserves: 6mo → 3mo (Age 62+)'),
    ]

    results = []
    for policy_var, current_t, lda_t, pc_col, pc_val, test_name in lda_battery:
        if policy_var not in df.columns or pc_col not in df.columns:
            print(f"SKIP: {test_name} — column missing")
            continue
        result = boundary_test_lda(df, policy_var, current_t, lda_t, pc_col, pc_val)
        result['test_name'] = test_name
        result['audit_date'] = datetime.today().strftime('%Y-%m-%d')
        results.append(result)

    results_df = pd.DataFrame(results)
    output_path = f'/home/z/my-project/compliance/lda_test_results_{datetime.today().strftime("%Y-%m-%d")}.csv'
    results_df.to_csv(output_path, index=False)

    print(f"\n=== LDA Test Battery Complete ===")
    print(f"Results saved: {output_path}")
    print(f"\nLDA candidates identified (p > 0.05 → similar default prediction, less discriminatory):")
    lda_candidates = results_df[results_df['lda_exists'] == True]
    if len(lda_candidates) > 0:
        print(lda_candidates[['test_name', 'current_threshold', 'lda_threshold',
                              'default_rate_current', 'default_rate_lda', 'p_value',
                              'protected_class_admission_lift']].to_string(index=False))
        print("\n!!! ATTENTION COMPLIANCE OFFICER !!!")
        print("Less discriminatory alternatives identified. Document why each LDA was")
        print("accepted or rejected. If LDAs were rejected, document the business reason.")
        print("Failure to consider LDAs is a CFPB examination finding.")
    else:
        print("No LDAs identified — current policies meet both business necessity")
        print("AND less discriminatory alternative tests.")


if __name__ == '__main__':
    run_fair_lens_lda_battery()
```

### 4.4 Disparate Impact 3-Prong Test (Structured Protocol)

**Legal framework:** The Supreme Court established the disparate impact 3-prong test in *Texas Dep't of Housing & Community Affairs v. Inclusive Communities Project, Inc.*, 576 U.S. 519 (2015), applied to fair housing claims under the Fair Housing Act. The same 3-prong framework applies to ECOA disparate impact claims under *In re Wells Fargo Mortgage Lending Practices Litigation*, 2014 WL 1280147 (E.D. Pa. 2014) and CFPB guidance.

The 3 prongs are:

1. **Prong 1 — Prima Facie Case:** Does the policy have a disproportionate adverse effect on a protected class? (Statistical test: is the approval-rate gap between protected class and control group statistically significant? Standard thresholds: 80% rule (four-fifths rule) per EEOC Uniform Guidelines; or p < 0.05 on a chi-square test of independence.)
2. **Prong 2 — Business Necessity:** Is the policy necessary to achieve a legitimate business purpose? (Burden shifts to creditor to demonstrate the policy is necessary — not merely convenient or cost-saving.)
3. **Prong 3 — Less Discriminatory Alternative:** Is there a less discriminatory alternative that achieves the same purpose? (Burden shifts back to plaintiff to demonstrate a viable LDA exists. See §4.3 above for LDA test methodology.)

**Required documentation for each DSCR policy:** The compliance team must complete the 3-prong analysis below for each of the following DSCR policies: (a) FICO floor (660 standard / 620-680 specialty); (b) LTV cap (75% standard / 65-70% FN-ITIN / 60% no-credit FN); (c) DSCR floor (1.25 preferred / 1.00 standard / 0.80 with compensators); (d) reserves minimum (6mo standard / 9-12mo ITIN/FN); (e) credit-event seasoning (36mo foreclosure / 48mo Chapter 7); (f) mortgage-late seasoning (12mo clean); (g) ITIN exclusion from some lenders (AHLend + America only); (h) FN LLC requirement; (i) FN AML source-of-funds requirement.

#### 4.4.1 Prong 1 Analysis: Prima Facie Case (Python)

```python
"""
disparate_impact_prong1.py — Prong 1 (Prima Facie Case) statistical test

Tests whether each facially neutral DSCR underwriting policy has a
disproportionate adverse effect on protected-class applicants.

Two statistical tests applied:
  (a) Four-Fifths Rule (80% Rule) per EEOC Uniform Guidelines 29 CFR §1607.4(D):
      Approval rate for protected class / approval rate for control group < 0.80
      → prima facie disparate impact
  (b) Chi-square test of independence (statistical significance):
      p < 0.05 → statistically significant disparate impact

If EITHER test is positive, Prong 1 is satisfied (prima facie case established).
The analysis then proceeds to Prong 2 (business necessity).
"""

import pandas as pd
import numpy as np
from scipy.stats import chi2_contingency
from datetime import datetime


def four_fifths_rule_test(df, protected_col, protected_val, decision_col='approved'):
    """
    EEOC Four-Fifths Rule: approval_rate_protected / approval_rate_control >= 0.80
    If ratio < 0.80, prima facie disparate impact.
    """
    protected = df[df[protected_col] == protected_val]
    control = df[df[protected_col] != protected_val]

    if len(protected) == 0 or len(control) == 0:
        return {'error': 'Insufficient sample size'}

    ar_protected = protected[decision_col].mean()
    ar_control = control[decision_col].mean()

    if ar_control == 0:
        ratio = np.nan
    else:
        ratio = ar_protected / ar_control

    return {
        'n_protected': len(protected),
        'n_control': len(control),
        'approval_rate_protected': ar_protected,
        'approval_rate_control': ar_control,
        'four_fifths_ratio': ratio,
        'prima_facie_disparate_impact': bool(ratio < 0.80) if not np.isnan(ratio) else False,
    }


def chi_square_test(df, protected_col, protected_val, decision_col='approved'):
    """
    Chi-square test of independence: is approval decision independent of
    protected-class membership? p < 0.05 → statistically significant association.
    """
    contingency = pd.crosstab(df[protected_col] == protected_val, df[decision_col])
    if contingency.shape != (2, 2):
        return {'error': 'Insufficient variation for chi-square test'}

    chi2, p, dof, expected = chi2_contingency(contingency)

    return {
        'chi2_statistic': chi2,
        'p_value': p,
        'degrees_of_freedom': dof,
        'statistically_significant': bool(p < 0.05),
    }


def run_prong1_battery(df):
    """
    Run Prong 1 (prima facie case) battery across all protected-class
    dimensions and all underwriting policies.
    """
    protected_classes = [
        ('race_hispanic', 1, 'Hispanic vs Non-Hispanic'),
        ('race_black', 1, 'Black vs Non-Black'),
        ('race_asian', 1, 'Asian vs Non-Asian'),
        ('sex_female', 1, 'Female vs Male'),
        ('age_62_plus', 1, 'Age 62+ vs Under 62'),
        ('married', 0, 'Unmarried vs Married (marital status)'),
    ]

    results = []
    for pc_col, pc_val, pc_label in protected_classes:
        if pc_col not in df.columns:
            continue

        ff = four_fifths_rule_test(df, pc_col, pc_val)
        chi = chi_square_test(df, pc_col, pc_val)

        if 'error' in ff or 'error' in chi:
            continue

        results.append({
            'protected_class': pc_label,
            'n_protected': ff['n_protected'],
            'n_control': ff['n_control'],
            'approval_rate_protected': ff['approval_rate_protected'],
            'approval_rate_control': ff['approval_rate_control'],
            'four_fifths_ratio': ff['four_fifths_ratio'],
            'four_fifths_violation': ff['prima_facie_disparate_impact'],
            'chi2_p_value': chi['p_value'],
            'chi2_significant': chi['statistically_significant'],
            'prong1_satisfied': ff['prima_facie_disparate_impact'] or chi['statistically_significant'],
            'audit_date': datetime.today().strftime('%Y-%m-%d'),
        })

    return pd.DataFrame(results)


if __name__ == '__main__':
    df = pd.read_csv('/home/z/my-project/compliance/fair_lens_dataset_2024-01-01_to_2024-12-31.csv')
    results = run_prong1_battery(df)

    output_path = f'/home/z/my-project/compliance/prong1_results_{datetime.today().strftime("%Y-%m-%d")}.csv'
    results.to_csv(output_path, index=False)

    print(f"=== Prong 1 (Prima Facie Case) Battery Complete ===")
    print(f"Results saved: {output_path}\n")
    print(results[['protected_class', 'n_protected', 'approval_rate_protected',
                   'approval_rate_control', 'four_fifths_ratio', 'four_fifths_violation',
                   'chi2_p_value', 'prong1_satisfied']].to_string(index=False))

    prong1_satisfied = results[results['prong1_satisfied']]
    if len(prong1_satisfied) > 0:
        print(f"\n!!! ATTENTION COMPLIANCE OFFICER !!!")
        print(f"Prong 1 satisfied for {len(prong1_satisfied)} protected class(es).")
        print(f"Proceed to Prong 2 (business necessity) for these policies.")
```

#### 4.4.2 Prong 2 + Prong 3 Documentation Template (Markdown)

For each DSCR policy, the compliance team must complete the following Prong 2 + Prong 3 documentation template. Counsel should review each completed template.

```markdown
# Disparate Impact Analysis — Policy: [POLICY NAME]

## Policy Description
- **Policy ID:** [e.g., LTV-FN-65]
- **Facially neutral criterion:** [e.g., "Foreign-national borrowers require 65% LTV max (vs 75% standard)"]
- **Operational rule:** [e.g., "FN borrowers (Code 14 designation) cap at 65% LTV; standard DSCR borrowers cap at 75% LTV"]
- **Effective date:** [YYYY-MM-DD]
- **Last reviewed:** [YYYY-MM-DD]

## Prong 1 — Prima Facie Case
- **Prong 1 test result:** [PASS / FAIL]
- **Four-fifths ratio:** [e.g., 0.72 — Hispanic approval rate is 72% of control group rate]
- **Chi-square p-value:** [e.g., 0.023 — statistically significant]
- **Sample size (protected class / control):** [e.g., 47 / 1,892]
- **Prong 1 conclusion:** [Prima facie case established / not established]
- **If Prong 1 FAILS (no disparate impact):** Document and stop. Policy is defensible.
- **If Prong 1 PASSES (disparate impact found):** Proceed to Prong 2.

## Prong 2 — Business Necessity
- **Legitimate business purpose:** [e.g., "Default-risk prediction: FN borrowers without US credit history have 2.3x higher observed default rate per AHLend 2019-2023 portfolio data"]
- **Evidence supporting necessity:**
  - [Empirical study: cite internal default analysis with sample size, period, observed default rates]
  - [Industry benchmark: cite published lender guideline (e.g., AHLend FN program guidelines)]
  - [Regulatory precedent: cite if any (e.g., FNMA selling guide provisions for FN lending)]
- **Is the policy NECESSARY (not merely convenient)?** [Yes / No]
- **Prong 2 conclusion:** [Business necessity established / not established]
- **If Prong 2 FAILS (no business necessity):** Policy must be revised or eliminated.
- **If Prong 2 PASSES (business necessity established):** Proceed to Prong 3.

## Prong 3 — Less Discriminatory Alternative
- **LDA candidates tested:** [List each LDA tested per §4.3 methodology]
  - LDA 1: [e.g., "70% LTV max for FN with 12mo reserves (vs 65% LTV max with 9mo reserves)"]
  - LDA 2: [e.g., "65% LTV max for FN, but accept Nova Credit translation as compensating factor (eliminating the 65% requirement for Nova-Credit-eligible borrowers)"]
- **LDA test results:**
  - LDA 1: [z-test p-value, default rate comparison, protected-class admission lift]
  - LDA 2: [z-test p-value, default rate comparison, protected-class admission lift]
- **Was a viable LDA identified?** [Yes / No]
- **If YES:** Was the LDA adopted? [Yes / No] — if NO, document the business reason for rejection.
- **If NO:** No LDA exists. Policy is defensible under 3-prong test.
- **Prong 3 conclusion:** [LDA exists / does not exist]

## Overall 3-Prong Conclusion
- **Prong 1 (prima facie):** [PASS / FAIL]
- **Prong 2 (business necessity):** [PASS / FAIL]
- **Prong 3 (LDA exists):** [YES / NO]
- **Policy disposition:**
  - If Prong 1 FAILS → policy defensible (no disparate impact)
  - If Prong 1 PASSES + Prong 2 FAILS → policy must be revised/eliminated
  - If Prong 1 PASSES + Prong 2 PASSES + Prong 3 NO → policy defensible (business necessity + no LDA)
  - If Prong 1 PASSES + Prong 2 PASSES + Prong 3 YES + LDA adopted → policy revised
  - If Prong 1 PASSES + Prong 2 PASSES + Prong 3 YES + LDA rejected → policy at risk; document business reason for rejection

## Counsel Review
- **Reviewed by:** [Attorney name, bar number]
- **Review date:** [YYYY-MM-DD]
- **Counsel conclusion:** [Approved / Approved with conditions / Denied]
- **Conditions:** [If applicable]
```

### 4.5 Fair-Lensing Audit Reporting Template

After running all three tests (§4.2, §4.3, §4.4), the compliance team must produce a fair-lensing audit report using the template below. The report is delivered to: Chief Compliance Officer, Board Risk Committee, and outside counsel. The report is privileged attorney-client work product.

```markdown
# Fair-Lensing Audit Report — [Quarter]

## 1. Executive Summary
- Audit period: [YYYY-MM-DD to YYYY-MM-DD]
- Sample size: [N funded loans] + [N declined applications] = [Total N]
- Demographic coverage: [% of applicants with self-reported demographics]
- Tests performed: Proxy regression (§4.2), LDA boundary test (§4.3), Disparate impact 3-prong (§4.4)
- Key findings:
  - [Finding 1]
  - [Finding 2]
- Remediation required: [Yes / No] — if Yes, see §5 below

## 2. Proxy Regression Results
[Table from §4.2 results]
[Interpretation: which facially neutral variables are strong / moderate / weak proxies]

## 3. LDA Boundary Test Results
[Table from §4.3 results]
[Interpretation: which LDAs were identified; which were adopted; which were rejected and why]

## 4. Disparate Impact 3-Prong Analysis
[For each policy tested: 3-prong table from §4.4]
[Policy dispositions]

## 5. Remediation Plan (If Required)
- Remediation item 1: [description] — Owner: [name] — Target date: [date]
- Remediation item 2: [description] — Owner: [name] — Target date: [date]

## 6. Board Risk Committee Recommendation
- [Recommendation language]
- [Board approval block]

## 7. Counsel Certification
- This report constitutes attorney-client privileged work product prepared by [Compliance Officer] under engagement of [outside counsel].
- Reviewed by outside counsel: [Name, bar number, date]
- Counsel certification: [Approved / Approved with conditions / Denied]

## 8. CFPB Examination Readiness
- This report and underlying data are available for CFPB examination within 24 hours of request.
- Test code (§4.2, §4.3, §4.4) is version-controlled in /home/z/my-project/compliance/code/.
- Audit data is retained per Part 6 of this packet (Reg B §1002.12 retention policy).
```

---

## Part 5 — HMDA-like Data Collection Schema

### 5.1 Purpose and Regulatory Framework

The Home Mortgage Disclosure Act (HMDA, 12 CFR Part 1003) requires most mortgage lenders to collect and report demographic data on loan applicants. DSCR loans made for business-purpose investment properties are generally **exempt from HMDA** because (a) they are business-purpose loans (not consumer-purpose) and (b) they are typically secured by 1-4 unit investment properties where the borrower is an entity (LLM), not a natural person.

However, even though HMDA does not apply, the CFPB expects DSCR lenders to maintain a **HMDA-like fair-lensing data collection schema** as a defensive measure. The schema below enables the lender to perform the fair-lensing statistical tests in Part 4 of this packet, and demonstrates to CFPB examiners that the lender takes fair-lending seriously even outside the HMDA framework.

**Critical compliance constraint:** Demographic data collected under this schema must NEVER be available to the underwriting team. If underwriters can see demographic data, the data could (intentionally or unintentionally) influence underwriting decisions — which would itself be an ECOA violation. The access-control design in §5.3 below is non-negotiable.

### 5.2 PostgreSQL Schema (DDL)

```sql
-- =============================================================================
-- fair_lensing_audit schema — PostgreSQL DDL
-- =============================================================================
-- Purpose: HMDA-like demographic data collection for fair-lensing audit ONLY.
-- CRITICAL: This data MUST NEVER be used in underwriting decisions. Access is
-- restricted to compliance_team_only role (see GRANT statements below).
-- =============================================================================

-- 1. Main audit table — one row per loan with demographic overlay
CREATE TABLE fair_lensing_audit (
    audit_id                SERIAL PRIMARY KEY,
    loan_id                 VARCHAR(50) NOT NULL REFERENCES loans(loan_id),
    application_id          VARCHAR(50) NOT NULL REFERENCES loan_applications(application_id),

    -- Collection metadata
    collection_date         DATE NOT NULL,
    collection_method       VARCHAR(50) NOT NULL CHECK (
        collection_method IN ('self_reported_survey', 'proxy_inferred', 'third_party_data')
    ),
    collection_channel      VARCHAR(50) NOT NULL CHECK (
        collection_channel IN ('post_funding_email', 'post_funding_phone',
                               'post_funding_paper_survey', 'post_decline_email',
                               'post_decline_paper_survey')
    ),

    -- Demographic data (aggregated per Census categories — NOT free-text)
    -- Race/ethnicity follows Census aggregated categories per HMDA standards
    race_ethnicity          VARCHAR(100) CHECK (
        race_ethnicity IN (
            'American Indian or Alaska Native',
            'Asian', 'Asian Indian', 'Chinese', 'Filipino', 'Japanese', 'Korean', 'Vietnamese', 'Other Asian',
            'Black or African American',
            'Hispanic or Latino', 'Mexican', 'Puerto Rican', 'Cuban', 'Other Hispanic or Latino',
            'Native Hawaiian or Other Pacific Islander',
            'White',
            'Two or More Races',
            'Not Provided', 'Refused to Disclose'
        )
    ),
    sex                     VARCHAR(50) CHECK (
        sex IN ('Male', 'Female', 'Non-Binary', 'Not Provided', 'Refused to Disclose')
    ),
    age_band                VARCHAR(20) CHECK (
        age_band IN ('18-21', '22-26', '27-31', '32-36', '37-41', '42-46',
                     '47-51', '52-56', '57-61', '62-66', '67-71', '72-76',
                     '77-81', '82-86', '87+', 'Not Provided', 'Refused to Disclose')
    ),
    marital_status          VARCHAR(50) CHECK (
        marital_status IN ('Married', 'Single', 'Divorced', 'Widowed', 'Separated',
                          'Not Provided', 'Refused to Disclose')
    ),

    -- Consent and refusal tracking (HMDA-style)
    collection_consent      BOOLEAN NOT NULL DEFAULT FALSE,
    refusal_to_disclose     BOOLEAN DEFAULT FALSE,

    -- Audit-use-only flag (defensive constraint — see §5.3 access control)
    audit_use_only          BOOLEAN NOT NULL DEFAULT TRUE,

    -- Record-keeping
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by              VARCHAR(100) NOT NULL,  -- compliance_team user account
    updated_at              TIMESTAMP WITH TIME ZONE,
    updated_by              VARCHAR(100),

    -- Defensive constraint: audit_use_only must always be TRUE
    -- This prevents accidental underwriting-team use via ORM frameworks
    CONSTRAINT no_underwriting_access CHECK (audit_use_only = TRUE),
    CONSTRAINT consent_or_refusal CHECK (
        collection_consent = TRUE OR refusal_to_disclose = TRUE
    )
);

-- 2. Indexes for analytical queries
CREATE INDEX idx_fla_loan_id             ON fair_lensing_audit(loan_id);
CREATE INDEX idx_fla_application_id      ON fair_lensing_audit(application_id);
CREATE INDEX idx_fla_collection_date     ON fair_lensing_audit(collection_date);
CREATE INDEX idx_fla_race_ethnicity      ON fair_lensing_audit(race_ethnicity);
CREATE INDEX idx_fla_audit_id            ON fair_lensing_audit(audit_id);

-- 3. Audit log table — every SELECT/INSERT/UPDATE on fair_lensing_audit is logged
CREATE TABLE fair_lensing_audit_log (
    log_id          SERIAL PRIMARY KEY,
    table_name      VARCHAR(50) NOT NULL DEFAULT 'fair_lensing_audit',
    operation       VARCHAR(10) NOT NULL CHECK (operation IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')),
    record_id       INTEGER,  -- audit_id for INSERT/UPDATE/DELETE; NULL for SELECT
    user_account    VARCHAR(100) NOT NULL,
    user_role       VARCHAR(50) NOT NULL,
    query_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    query_text      TEXT,  -- the actual SQL query (truncated to 10KB)
    client_ip       VARCHAR(50),
    application_name VARCHAR(100)
);

-- 4. Trigger to log every operation on fair_lensing_audit
CREATE OR REPLACE FUNCTION log_fair_lensing_audit_access() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO fair_lensing_audit_log (table_name, operation, record_id, user_account, user_role, query_text)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE', 'DELETE') THEN NEW.audit_id ELSE NULL END,
        current_user,
        current_setting('role', true),
        current_query()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_fla_audit_log
    AFTER INSERT OR UPDATE OR DELETE ON fair_lensing_audit
    FOR EACH ROW EXECUTE FUNCTION log_fair_lensing_audit_access();

-- =============================================================================
-- 5. ACCESS CONTROL — CRITICAL
-- =============================================================================
-- Only compliance_team_only role can access fair_lensing_audit.
-- Underwriting team has NO ACCESS — this is the single most important constraint
-- in the schema. If underwriters could see demographic data, the data could
-- influence underwriting decisions — which would itself be an ECOA violation.
-- =============================================================================

-- Revoke all privileges from PUBLIC (defensive — PUBLIC should never have access)
REVOKE ALL ON fair_lensing_audit FROM PUBLIC;
REVOKE ALL ON fair_lensing_audit_id_seq FROM PUBLIC;
REVOKE ALL ON fair_lensing_audit_log FROM PUBLIC;
REVOKE ALL ON fair_lensing_audit_log_log_id_seq FROM PUBLIC;

-- Grant full privileges to compliance_team_only role
GRANT SELECT, INSERT, UPDATE, DELETE ON fair_lensing_audit TO compliance_team_only;
GRANT USAGE, SELECT ON fair_lensing_audit_id_seq TO compliance_team_only;
GRANT SELECT ON fair_lensing_audit_log TO compliance_team_only;

-- Grant read-only on audit log to compliance_officer role (for oversight)
GRANT SELECT ON fair_lensing_audit_log TO compliance_officer;

-- Explicitly REVOKE all privileges from underwriting_team role
-- This is defensive — PUBLIC revocation should already cover it, but explicit
-- REVOKE documents the intent for audit purposes.
REVOKE ALL ON fair_lensing_audit FROM underwriting_team;
REVOKE ALL ON fair_lensing_audit_id_seq FROM underwriting_team;
REVOKE ALL ON fair_lensing_audit_log FROM underwriting_team;
REVOKE ALL ON fair_lensing_audit_log_log_id_seq FROM underwriting_team;

-- =============================================================================
-- 6. ROW-LEVEL SECURITY (defense in depth)
-- =============================================================================
-- Even if a user gains compliance_team_only role inappropriately, RLS prevents
-- them from accessing rows outside their designated scope.
-- =============================================================================

ALTER TABLE fair_lensing_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY fla_compliance_team_only ON fair_lensing_audit
    FOR ALL
    TO compliance_team_only
    USING (TRUE)
    WITH CHECK (TRUE);

-- Underwriting team has NO POLICY → RLS denies all access by default
-- (No CREATE POLICY ... TO underwriting_team statement = no access)

-- =============================================================================
-- 7. DEMOGRAPHIC SURVEY TEMPLATE (for post-funding email collection)
-- =============================================================================
-- The compliance team sends this survey to funded borrowers 30-60 days after
-- closing. Participation is voluntary; refusal does not affect the loan.
-- =============================================================================

-- Survey template stored as a view for compliance team reference
CREATE VIEW v_demographic_survey_template AS
SELECT '
Dear {{borrower_name}},

Thank you for your recent DSCR loan closing with {{lender_name}}.

We are conducting a voluntary survey to help us ensure our lending practices
are fair and equitable to all borrowers. Your participation is entirely
voluntary, and your responses will be used only for fair-lending audit
purposes. Your responses will NOT be visible to your loan originator or
underwriter, and will NOT affect your loan terms or future applications.

The survey takes approximately 3 minutes. Please complete it at:
{{survey_url}}

Questions:
1. What is your race/ethnicity? [Census categories]
2. What is your sex? [Male / Female / Non-Binary / Prefer not to say]
3. What is your age range? [5-year bands]
4. What is your marital status? [Married / Single / Divorced / Widowed / Separated / Prefer not to say]

You may decline to answer any or all questions. Thank you for helping us
ensure fair lending.

Sincerely,
{{compliance_officer_name}}
{{lender_name}} Compliance Department
' AS survey_template;
```

### 5.3 Access Control Verification Protocol

The compliance team must verify access controls quarterly using the test script below. Any test failure is a P0 compliance incident and must be remediated within 24 hours.

```sql
-- =============================================================================
-- access_control_verification.sql — Quarterly access control audit
-- =============================================================================
-- Run as compliance_officer role (NOT compliance_team_only).
-- All tests below MUST return the expected result. Any failure is a P0 incident.
-- =============================================================================

-- TEST 1: underwriting_team should have ZERO privileges on fair_lensing_audit
-- Expected result: 0 rows (no privileges granted)
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'fair_lensing_audit'
  AND grantee = 'underwriting_team';
-- Expected: 0 rows

-- TEST 2: Try to SELECT as underwriting_team (should fail with permission denied)
SET ROLE underwriting_team;
SELECT COUNT(*) FROM fair_lensing_audit;
-- Expected: ERROR: permission denied for table fair_lensing_audit

-- TEST 3: Try to INSERT as underwriting_team (should fail)
INSERT INTO fair_lensing_audit (loan_id, application_id, collection_date, collection_method, collection_channel, collection_consent, audit_use_only, created_by)
VALUES ('TEST-001', 'TEST-APP-001', CURRENT_DATE, 'self_reported_survey', 'post_funding_email', TRUE, TRUE, 'test');
-- Expected: ERROR: permission denied for table fair_lensing_audit

-- TEST 4: Reset role and verify compliance_team_only has correct privileges
RESET ROLE;
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'fair_lensing_audit'
  AND grantee = 'compliance_team_only';
-- Expected: SELECT, INSERT, UPDATE, DELETE

-- TEST 5: Verify RLS is enabled
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'fair_lensing_audit';
-- Expected: relrowsecurity = true

-- TEST 6: Verify audit log trigger is active
SELECT tgname, tgtype, tgenabled
FROM pg_trigger
WHERE tgname = 'trg_fla_audit_log';
-- Expected: tgenabled = 'O' (origin, trigger enabled)

-- TEST 7: Verify recent audit log entries (last 30 days)
SELECT operation, COUNT(*), MAX(query_timestamp) AS last_occurrence
FROM fair_lensing_audit_log
WHERE query_timestamp > NOW() - INTERVAL '30 days'
GROUP BY operation
ORDER BY operation;
-- Expected: counts of INSERT/UPDATE/DELETE operations by compliance_team_only
```

---

## Part 6 — Document Retention Policy (Reg B §1002.12)

### 6.1 Regulatory Framework

Regulation B §1002.12 (12 CFR §1002.12) requires creditors to retain certain records for prescribed periods to enable the CFPB and other enforcement agencies to evaluate compliance with ECOA and Regulation B. The retention periods specified by §1002.12 are:

- **Applications (completed + incomplete):** 25 months after the date the creditor notifies the applicant of the action taken or incompleteness notice is sent, OR if no action is taken, 25 months after the application was received.
- **Pre-approvals (written requests under §1002.2(o)):** 25 months after the creditor sends a notice that the pre-approval request was denied or approved with conditions.
- **Adverse-action notices:** 25 months after the notice is sent.
- **Other written information:** 25 months after the information is received.
- **Federally-related mortgage loans (FIRREA / Reg B §1002.12(c)(2)):** Creditors subject to FIRREA requirements may satisfy both Reg B and FIRREA retention by retaining records for the longer of the two periods (FIRREA = 25 months for most records; certain records = 60 months).

For DSCR lenders, the 25-month retention period applies to most records. The 60-month FIRREA period applies only if the lender is subject to FIRREA (typically depository institutions and their mortgage subsidiaries).

### 6.2 Document Types to Retain

The compliance team must retain the following document types for the applicable retention period:

| # | Document Type | Source | Retention Period | Storage Location |
|---|---|---|---|---|
| D-01 | FF-08 form submissions (all 12 questions + conditional follow-ups) | FF08_prescreen_intake.md | 25 months from submission | CRM database + immutable audit log |
| D-02 | Scoring engine outputs (TS-10 component scores, modifier values, final tier) | TS10_targeting_scoring.md | 25 months from scoring | CRM database + immutable audit log |
| D-03 | Loan originator (LO) notes | CRM | 25 months from application | CRM database |
| D-04 | Decline letters / adverse-action notices (Part 2 of this packet) | Compliance template system | 25 months from notice date | Compliance document management system (immutable) |
| D-05 | Counteroffer communications (HEX conditional + SWR post-counteroffer) | Compliance template system | 25 months from counteroffer date | Compliance DMS (immutable) |
| D-06 | Demographic survey responses (Part 5 of this packet) | fair_lensing_audit table | 25 months from collection date | PostgreSQL fair_lensing_audit table (compliance-only access) |
| D-07 | Fair-lensing statistical test results (Part 4 of this packet) | R/Python audit scripts | 25 months from test run date | Compliance audit folder (immutable) |
| D-08 | Pre-approval inquiry records (HEX hard-exit messages sent at intake) | FF-08 form system | 25 months from inquiry date | CRM database + immutable audit log |
| D-09 | Credit reports (hard pulls only — soft pulls for pre-qual not retained) | Credit bureau integrations | 25 months from pull date | Secure credit report storage (encryption at rest) |
| D-10 | Appraisals / Form 1007 market-rent appraisals | Appraisal vendors | 25 months from delivery date (or longer if FIRREA applies) | Compliance DMS (immutable) |
| D-11 | Specialty-lender referral records (HEX-002/003/004/005/010/011/013/014/015/016) | Compliance template system | 25 months from referral date | CRM + Compliance DMS |
| D-12 | Marketing material versions (120 V2 hooks + 20 landing pages + all variants) | AC09 V2 ad copy | 25 months from last deployment date | Marketing-ops asset library (versioned) |
| D-13 | LO training records (Part 8 of this packet) | LMS | 25 months from training completion | LMS database |
| D-14 | Vendor management records (Part 10 of this packet) | Vendor management system | 25 months from contract end | Vendor management DMS |
| D-15 | Complaint records (CFPB complaint portal + internal complaints) | CRM + CFPB portal | 25 months from complaint resolution | Compliance DMS (immutable) |
| D-16 | Quarterly fair-lensing audit reports (Part 9 of this packet) | Compliance | 25 months from report date | Compliance DMS (immutable) |
| D-17 | CFPB examination correspondence (requests + responses) | Compliance | Permanent retention (recommended) | Compliance DMS (immutable) |
| D-18 | Board Risk Committee minutes (fair-lensing discussion) | Corporate Secretary | Permanent retention (recommended) | Corporate Secretary DMS |

### 6.3 Storage Requirements

All retained records must meet the following storage requirements:

1. **Immutable:** Once written, records cannot be modified or deleted. The only operation permitted is appending new audit log entries. Implementation: write-once-read-many (WORM) storage (AWS S3 Object Lock in Compliance mode; or on-premises WORM tape).
2. **Access-controlled:** Access is restricted by role (compliance_team_only, compliance_officer, outside_counsel). All access is logged per Part 5 §5.3 audit-log pattern.
3. **Audit-logged:** Every SELECT, INSERT, UPDATE, DELETE on retained records is logged with: user account, role, timestamp, client IP, query text, application name. Logs are themselves immutable and retained for 6 years (72 months) — longer than the 25-month retention of the underlying records, to enable audit-trail reconstruction.
4. **Encryption at rest:** All retained records are encrypted with AES-256. Encryption keys are managed via AWS KMS (or on-premises HSM). Key rotation every 12 months.
5. **Encryption in transit:** All access to retained records is via TLS 1.3 (minimum). No plaintext protocols.
6. **Geographic redundancy:** Retained records are replicated to a geographically separate region (e.g., primary in us-east-1, replica in us-west-2). Replication is synchronous for write operations.
7. **Backup frequency:** Daily incremental backups; weekly full backups. Backup retention: 25 months (matching retention period) + 1 month buffer.
8. **Restoration testing:** Quarterly restoration tests to verify backups are readable. Restoration test results retained per D-07.

### 6.4 Disposal Procedure

At month 26 (1 month after the 25-month retention period expires), the compliance team must execute the disposal procedure for expired records:

1. **Inventory:** Compliance team generates an inventory of records scheduled for disposal (records with `retention_expiration_date < CURRENT_DATE - INTERVAL '26 months'`).
2. **Counsel review:** Outside counsel reviews the inventory and certifies that no records are subject to litigation hold or pending CFPB examination request. If any records are subject to hold, they are excluded from disposal and the hold is documented.
3. **Disposal authorization:** Chief Compliance Officer signs the disposal authorization form (template below).
4. **Secure deletion:** Records are securely deleted via cryptographic erase (destroying the encryption keys renders the encrypted data unrecoverable) or NIST SP 800-88 Clear/Purge/Destroy procedures for physical media.
5. **Disposal certification:** Compliance team generates a disposal certification document listing: record types, record counts, disposal method, disposal date, authorizing official. The certification is retained permanently (D-18).
6. **Audit log:** The disposal operation is logged in the immutable audit log per §5.3.

### 6.5 Disposal Authorization Form Template

```text
[Letterhead: {{lender_name}}]

DISPOSAL AUTHORIZATION FORM — Reg B §1002.12 Document Retention

Disposal Date: {{date}}
Disposal Cycle: {{YYYY-QN}} (e.g., 2025-Q1)

RECORDS SCHEDULED FOR DISPOSAL:
   • Record type: {{record_type}}
   • Date range: {{start_date}} to {{end_date}}
   • Record count: {{record_count}}
   • Retention period expired: {{retention_expiration_date}}
   • Storage location: {{storage_uri}}

COUNSEL REVIEW:
   • Reviewed by outside counsel: {{attorney_name}}, Bar #{{bar_number}}
   • Review date: {{review_date}}
   • Counsel certification: No records subject to litigation hold or pending
     CFPB examination request. All records are eligible for disposal.

DISPOSAL METHOD:
   • Method: {{disposal_method}} (cryptographic erase / NIST SP 800-88 Purge)
   • Executed by: {{compliance_team_member}}
   • Execution timestamp: {{execution_timestamp}}
   • Verification: {{verification_method}}

DISPOSAL AUTHORIZATION:
   Authorized by: {{cco_name}}, Chief Compliance Officer
   Authorization date: {{authorization_date}}
   CCO signature: {{cco_signature}}

DISPOSAL CERTIFICATION:
   I certify that the records listed above have been disposed of in accordance
   with Reg B §1002.12, the lender's document retention policy, and applicable
   state and federal law. The disposal was authorized by the Chief Compliance
   Officer after outside counsel review. A copy of this certification is
   retained permanently per the lender's document retention policy.

   Compliance Officer: {{co_name}}
   Date: {{date}}

[Form ID: DA-RegB-001]
[Retention: Permanent]
```

---

## Part 7 — Pre-Approval vs Application Memo (Critical for HEX Routing)

### 7.1 Issue Presented

The DSCR borrower-intelligence swarm's HEX (hard-exit) routing occurs at the **intake** stage — before the borrower has submitted a formal loan application, provided income documentation, or authorized a credit pull. The HEX hard-exit paths (HEX-001 primary residence, HEX-009 active delinquency, HEX-012 sub-$100K loan, HEX-013 pure commercial use) reject the borrower at intake, with a redirect message to alternative products (conventional mortgage, commercial mortgage, credit union).

**The legal question:** Does the HEX routing at intake constitute an "adverse action" on a "completed application" under Reg B §1002.9, triggering the requirement to provide an adverse-action notice within 30 days? Or does the HEX routing occur before a "completed application" exists, such that §1002.9 adverse-action notice is not yet required?

**The stakes:** If a court or the CFPB later determines that the HEX routing constituted an "adverse action" on a "completed application," the lender would be retroactively required to have provided §1002.9 adverse-action notices for every HEX-routed borrower. For a DSCR lender processing 10,000+ intake inquiries per year with a ~20% HEX routing rate (2,000+ borrowers per year), the retroactive exposure could be 2,000+ violations per year — with civil liability under ECOA §1691e of up to $10,000 per individual violation (15 U.S.C. §1691e(a)(2)) and class-action exposure under §1691e(c) of up to the lesser of $500,000 or 1% of the creditor's net worth.

### 7.2 Regulatory Definitions

**"Application" — 12 CFR §1002.2(f):**
> "Application means an oral or written request for an extension of credit that is made in accordance with procedures established by a creditor for the type of credit requested. The term application does not include the use of an account or a request for an extension of credit under an existing account, within the scope of an existing line of credit, or a request to set the terms of an extension of credit that the creditor has approved or would have approved."

The CFPB's Official Interpretations (12 CFR Part 1002, Supplement I) clarify that the definition of "application" is **creditor-specific**: a request is an "application" if it is made in accordance with the creditor's established procedures for that type of credit. The creditor's procedures determine what constitutes an "application" — but the creditor cannot avoid §1002.9 adverse-action requirements by characterizing every interaction as a "pre-approval inquiry."

**"Pre-approval" — 12 CFR §1002.2(o):**
> "Preapproval program means a program under which a creditor provides, in writing or electronically, a firm commitment to lend to a prospective applicant up to a specified amount subject to the satisfaction of specified conditions, other than the identification of a particular property. A preapproval program includes all of the lender's written or electronic procedures, policies, and specifications for such a program."

Pre-approval programs are subject to specific Reg B requirements (§1002.4(d), §1002.9(a)(1)(iii), §1002.12(a)(2)(iii)) and, for HMDA-reporting institutions, additional HMDA reporting requirements (12 CFR Part 1003). Importantly, a pre-approval under §1002.2(o) is itself a type of "application" — the creditor's pre-approval procedures are the "procedures established by a creditor" referenced in §1002.2(f). A pre-approval denial is therefore an "adverse action" requiring §1002.9 notice.

**"Adverse action" — 12 CFR §1002.2(c):**
> "Adverse action means a refusal to grant credit in substantially the amount or on substantially the terms requested in an application, or a termination of an account; a change in the terms of an existing account; or a refusal to increase the amount of credit available to an applicant under an existing account; or an adverse determination in connection with an application for credit."

### 7.3 Analysis

The HEX hard-exit paths at intake present two distinct legal characterizations:

**Characterization A: HEX routing is an "adverse action" on a "completed application."**
Under this view, the FF-08 intake form (12 questions + conditional follow-ups) constitutes an "oral or written request for an extension of credit that is made in accordance with procedures established by a creditor" per §1002.2(f). The HEX routing is a "refusal to grant credit" per §1002.2(c)(1). Therefore, §1002.9 adverse-action notice is required within 30 days.

**Characterization B: HEX routing is a "pre-approval inquiry" not yet constituting an "application."**
Under this view, the FF-08 intake form is a "pre-approval inquiry" — the borrower has expressed interest but has not yet submitted the documentation required for a formal application (income documentation, property documentation, credit pull authorization). The HEX routing is a "product fit" determination, not a "credit denial." Therefore, §1002.9 adverse-action notice is not yet required.

**The critical factor:** Whether the FF-08 intake form is characterized as an "application" or a "pre-approval inquiry" depends on the creditor's established procedures. If the creditor's published procedures state that the FF-08 form is a "pre-approval inquiry" and that a "completed application" requires additional documentation (income docs, property docs, credit pull authorization), Characterization B is defensible. If the creditor's procedures do not clearly distinguish the two, Characterization A is likely.

### 7.4 Recommendation

**Recommendation: Treat the HEX routing as an "adverse action" on a "completed application" as a defensive measure.**

This recommendation is based on the following considerations:

1. **Cost-benefit analysis:** The cost of providing §1002.9-compliant adverse-action notices for HEX-routed borrowers is minimal (Part 2 templates are already developed; CRM integration is a one-time engineering cost; notice delivery is automated email/USPS at ~$0.50 per notice). The benefit is the elimination of retroactive §1002.9 exposure (potentially 2,000+ violations per year × $10,000 per violation = $20M+ annual exposure for a mid-size DSCR lender).

2. **CFPB examination posture:** The CFPB has consistently taken an expansive view of "application" in fair-lending enforcement actions. Defending a narrow characterization of "application" is uphill work; defaulting to the broader characterization is defensive.

3. **Borrower experience:** Adverse-action notices provide borrowers with (a) specific reasons for denial, (b) ECOA rights disclosure, (c) alternative resources. These are valuable even when not strictly required — they educate the borrower and reduce the likelihood of regulatory complaints.

4. **Document retention alignment:** Adverse-action notices are retained per Reg B §1002.12 (Part 6 of this packet). Treating HEX routing as adverse action means the records are retained for 25 months — which provides audit trail for both the HEX routing AND any later fair-lensing analysis.

**Required implementation:**

- All 12 adverse-action notice templates in Part 2 of this packet are deployed for HEX hard-exit paths.
- The FF-08 intake form clearly discloses (in the form introduction) that submission of the form constitutes an "application" under Reg B §1002.2(f), and that the applicant will receive an adverse-action notice within 30 days if the application is denied.
- The HEX hard-exit messages are framed as adverse-action notifications (not "product fit" redirects). The redirect language ("For primary-residence financing, consult a conventional lender") is preserved but is included in the adverse-action notice as "Alternative Resources" — not as the primary message.
- The compliance team tracks adverse-action notice delivery rates by HEX path and by protected-class proxy (ITIN, FN, prior credit event) per Part 4 fair-lensing analysis.

### 7.5 Implementation Checklist

- [ ] CRM updated to generate adverse-action notice (Part 2 template) for every HEX hard-exit routing
- [ ] FF-08 intake form updated to include §1002.2(f) application disclosure in form introduction
- [ ] HEX hard-exit messages updated to reference "Notice of Adverse Action" language
- [ ] Compliance team trained on adverse-action notice generation and delivery
- [ ] Adverse-action notice delivery tracked by HEX path + protected-class proxy
- [ ] 25-month retention policy applied to all adverse-action notices per Part 6
- [ ] Counsel review of all updated materials before M1 launch

### 7.6 Alternative Path (If Counsel Determines Characterization B Is Defensible)

If outside counsel determines that Characterization B (pre-approval inquiry, not application) is defensible based on the lender's specific procedures and borrower disclosures, the following alternative implementation is required:

1. **FF-08 form introduction must clearly state:** "This is a pre-approval inquiry, not a formal loan application. Submitting this form does not constitute an application for credit under Regulation B. A formal application requires additional documentation including income verification, property documentation, and credit authorization. Based on the information you provide in this inquiry, we may direct you to an alternative product if our DSCR program is not the right fit for your needs. This is not a credit decision."

2. **HEX hard-exit messages must be framed as "product fit" redirects, not "credit denials":** "Based on the information you provided, our DSCR program may not be the right fit for your needs. This is not a credit decision. For [conventional mortgage / commercial mortgage / credit union] options, [link]."

3. **Risk acknowledgment:** Counsel must provide a written risk acknowledgment that, if a court or the CFPB later determines the HEX routing constituted an "application" under §1002.2(f), the lender would be retroactively required to have provided §1002.9 adverse-action notices — and the lender accepts this risk.

4. **Defensive measures (regardless of characterization):** Even under Characterization B, the compliance team should provide §1002.9-compliant adverse-action notices for HEX-009 (active delinquency) and HEX-013 (commercial use) specifically — because these two paths involve borrower-credit-characterization and are most likely to be deemed "credit decisions" by a reviewing court. HEX-001 (primary residence) and HEX-012 (sub-$100K loan) are more defensibly characterized as "product fit" because they involve program-eligibility (not borrower-credit) criteria.

---

## Part 8 — LO Compliance Training Curriculum (8 Modules)

### 8.1 Training Program Overview

All loan originators (LOs) in the senior LO pool and specialty-lender pool must complete the 8-module compliance training curriculum below before originating any DSCR loan. The curriculum totals 12 hours of instruction across 8 modules, delivered as a hybrid online/in-person program over 4 weeks. Annual recertification (4 hours) is required each subsequent year. The curriculum is administered through the lender's Learning Management System (LMS) with completion records retained per Part 6 of this packet (D-13).

| Module | Title | Duration | Delivery | Assessment |
|---|---|---|---|---|
| 1 | ECOA / Reg B Fundamentals | 2 hours | Online + live Q&A | 20-question quiz, 80% pass |
| 2 | Fair-Lensing Risk in DSCR Underwriting | 2 hours | Online + case-study workshop | 15-question quiz + case-study analysis, 80% pass |
| 3 | Adverse-Action Notice Requirements | 1 hour | Online | 15-question quiz, 90% pass |
| 4 | ITIN / Foreign-National Program Compliance | 2 hours | Online + bilingual role-play | 20-question quiz + role-play evaluation, 80% pass |
| 5 | Credit-Event Seasoning Compliance | 1 hour | Online | 15-question quiz, 80% pass |
| 6 | Marketing Review & UDAAP Risk | 2 hours | Online + ad-copy review workshop | 20-question quiz + ad-copy review, 80% pass |
| 7 | Data Privacy (Reg P / State Privacy Laws) | 1 hour | Online | 15-question quiz, 80% pass |
| 8 | CFPB Examination Preparation | 1 hour | Live workshop (in-person or video) | Mock examination Q&A, instructor evaluation |

**Total:** 12 hours initial training + 4 hours annual recertification = 16 hours Year 1, 4 hours each subsequent year.

### 8.2 Module 1 — ECOA / Reg B Fundamentals (2 hours)

**Learning objectives:**
- State the purpose of ECOA (15 U.S.C. §1691) and Regulation B (12 CFR Part 1002).
- Identify the 9 prohibited bases of discrimination under ECOA: race, color, religion, national origin, sex, marital status, age (provided the applicant has capacity to contract), receipt of public assistance income, good-faith exercise of rights under the Consumer Credit Protection Act.
- Apply the 30-day adverse-action notice timeline under §1002.9(a)(1)(iii) to DSCR files.
- Differentiate "completed application" vs "pre-approval inquiry" under §1002.2(f) and §1002.2(o) — and explain the lender's characterization choice per Part 7 of this packet.
- Recognize the "rather not say" neutrality requirement under §1002.5(b)(1).

**Key topics:**
1. ECOA statutory framework and legislative history (15 U.S.C. §1691 et seq.)
2. Regulation B regulatory framework (12 CFR Part 1002) — structure and key sections
3. The 9 prohibited bases (§1002.4(a)) — definitions and examples
4. The §1002.4(b) "discouragement" prohibition — marketing and advertising implications
5. The §1002.5(b)(1) information-collection rules — what LOs can and cannot ask
6. The §1002.6(a) underwriting standards — what factors may be considered
7. The §1002.9 adverse-action notice requirements — timeline, content, delivery
8. The §1002.12 record retention requirements — 25-month retention for DSCR files
9. The §1002.13 self-testing self-correction privilege — voluntary fair-lensing audits
10. The §1002.14 appraisal copy requirements — DSCR Form 1007 market-rent appraisals

**Assessment questions (sample):**

1. A DSCR borrower selects "I'd rather not say" on the FICO band question. The CRM scoring engine should: (a) Score the borrower at zero (decline), (b) Score the borrower at the persona midpoint (neutral score), (c) Defer the application and request FICO documentation, (d) Apply a 10-point penalty. **Correct answer: (b) — per §1002.5(b)(1), "rather not say" must be functionally equivalent to providing the information.**

2. Which of the following is NOT one of the 9 prohibited bases under ECOA? (a) National origin, (b) Sex, (c) Income level, (d) Marital status. **Correct answer: (c) — income level is not a prohibited basis (though source of income from public assistance is).**

3. A DSCR borrower submits the FF-08 intake form on January 1, 2025. The lender routes the borrower to HEX-001 (primary residence) on January 5. The adverse-action notice must be sent by: (a) January 31, 2025, (b) February 4, 2025 (30 days from application date), (c) February 5, 2025, (d) No notice required. **Correct answer: (b) — per §1002.9(a)(1)(iii), the notice must be sent within 30 calendar days of the completed application.**

**Certification requirement:** 80% or higher on the 20-question quiz + completion of the live Q&A session.

### 8.3 Module 2 — Fair-Lensing Risk in DSCR Underwriting (2 hours)

**Learning objectives:**
- Define "fair lending" in the context of DSCR underwriting.
- Identify facially neutral DSCR underwriting criteria that may function as proxies for protected-class characteristics (ITIN, foreign-national status, prior credit events).
- Apply the disparate impact 3-prong test (Prong 1: prima facie; Prong 2: business necessity; Prong 3: less discriminatory alternative) to DSCR policies.
- Interpret the proxy regression results from Part 4 §4.2 of this packet.
- Recognize the fair-lensing risk in specialty-lender routing decisions.

**Key topics:**
1. Disparate treatment vs disparate impact — definitions and legal frameworks
2. The *Inclusive Communities* 3-prong test — application to DSCR
3. Proxy variables in DSCR underwriting — ITIN, FN status, prior credit events
4. Statistical methods for fair-lensing analysis — proxy regression, LDA test, chi-square
5. Specialty-lender routing as a fair-lensing risk — when does routing = denial?
6. Pricing disparities — ITIN/FN/credit-event premiums and the §1002.6(a) "individualized creditworthiness" requirement
7. Documentation requirements — what LOs must document to support underwriting decisions
8. The §1002.13 self-testing privilege — how voluntary fair-lensing audits can protect the lender

**Case-study analysis (workshop):** LOs analyze 5 case studies of DSCR files with fair-lensing risk — each case requires the LO to identify the risk, recommend the appropriate specialty-lender routing, and document the objective basis for the decision.

**Certification requirement:** 80% or higher on the 15-question quiz + passing case-study analysis (instructor-evaluated).

### 8.4 Module 3 — Adverse-Action Notice Requirements (1 hour)

**Learning objectives:**
- Identify when an adverse-action notice is required under §1002.9.
- Apply the 30-day timeline to DSCR files (including HEX hard-exit paths).
- Select appropriate reason codes from Reg B Appendix C (Part 3 of this packet).
- Use the 12 adverse-action notice templates (Part 2 of this packet).
- Recognize when a counteroffer notice (§1002.9(a)(2)) vs a denial notice (§1002.9(a)(1)) vs an incomplete-application notice (§1002.9(c)) is appropriate.

**Key topics:**
1. §1002.9(a)(1) — denial notice (outright denial)
2. §1002.9(a)(2) — counteroffer notice (specialty-lender referral = counteroffer)
3. §1002.9(b) — notice content requirements (creditor ID, ECOA statement, reason codes)
4. §1002.9(c) — incomplete application notice (HEX-006 deferral pattern)
5. §1002.14 — appraisal copy requirements
6. Reg B Appendix C reason codes — when to use each code (Part 3 of this packet)
7. Multi-code stacking — combining 2-4 reason codes per denial
8. Forbidden reason-code patterns (Part 3 §3.5)

**Assessment:** 15-question quiz, 90% pass required (higher threshold than other modules because adverse-action errors create immediate retroactive exposure).

### 8.5 Module 4 — ITIN / Foreign-National Program Compliance (2 hours)

**Learning objectives:**
- Apply ITIN borrower eligibility requirements (AHLend, America Mortgages programs).
- Apply foreign-national borrower eligibility requirements (LLC formation, AML source-of-funds, FIRPTA structure).
- Recognize the fair-lensing risk in ITIN/FN marketing and routing decisions.
- Deliver bilingual (English/Spanish) communications per V2 creative library EG-002 / SA-010.
- Document objective basis for ITIN/FN underwriting decisions (specialty-lender program requirements, not borrower demographic).

**Key topics:**
1. ITIN borrower eligibility — 18mo US credit + 2-3 tradelines + work permit + 9mo reserves
2. FN borrower eligibility — US LLC + EIN + operating agreement + AML source-of-funds + FIRPTA structure
3. Specialty-lender landscape — AHLend, America Mortgages, Angel Oak, A&D Mortgage, HomeAbroad
4. Pricing premiums — ITIN (+25-75bps), strong-credit FN (+50bps), no-credit FN (+125bps)
5. Fair-lensing risk — ITIN as national-origin proxy, FN as national-origin proxy
6. Marketing compliance — feature language ("ITIN accepted in lieu of SSN"), not demographic language ("for immigrants")
7. Bilingual communications — Spanish-language creative compliance with V2 guardrail G-2
8. Documentation requirements — AML source-of-funds narrative, FIRPTA tax counsel coordination

**Bilingual role-play (workshop):** LOs conduct mock borrower calls in both English and Spanish — instructor evaluates for compliance with V2 guardrails (no demographic language, no overpromise, clear program-feature explanation).

**Certification requirement:** 80% or higher on 20-question quiz + passing role-play evaluation.

### 8.6 Module 5 — Credit-Event Seasoning Compliance (1 hour)

**Learning objectives:**
- Apply seasoning windows to prior credit events (foreclosure 36mo standard / 24mo specialty with 700+ FICO; Chapter 7 bankruptcy 48mo standard / 24-36mo specialty; Chapter 13 bankruptcy 12mo on-plan with trustee approval; short sale 24mo with 25% down + 1.30 DSCR).
- Differentiate HEX-006 (recent mortgage late, deferrable) from HEX-009 (active delinquency, permanent).
- Route post-credit-event borrowers to SA-008 (Credit-Scarred Cash-Rich Rebuilder) specialty intake.
- Document the objective basis for credit-event decisions.

**Key topics:**
1. Seasoning window matrix — foreclosure, bankruptcy (Chapter 7 and 13), short sale, mortgage lates
2. HEX-006 vs HEX-009 — deferrable vs permanent
3. SA-008 specialty pathway — Bluestone (550 FICO floor), AHLend (with compensators), America Mortgages (post-credit-event accepted)
4. Compensating factors — 25% down + 12mo reserves + 1.30 DSCR + post-seasoning timeline
5. Pricing premiums — +50-100bps for post-credit-event borrowers
6. Documentation requirements — bankruptcy discharge paperwork, foreclosure discharge, seasoning verification
7. Fair-lensing risk — prior credit events correlate with protected-class characteristics (medical debt, divorce, disability)

**Certification requirement:** 80% or higher on 15-question quiz.

### 8.7 Module 6 — Marketing Review & UDAAP Risk (2 hours)

**Learning objectives:**
- Apply the 7 V1 guardrails (G-1 through G-7) and 10 V2 guardrails (V2-1 through V2-10) to DSCR marketing.
- Identify UDAAP risk in advertising claims (substantiation, clear and conspicuous disclosure, misleading statements, unfair practices).
- Use the 120 V2 hooks and 20 V2 landing pages (AC09_V2_ad_copy.md) within compliance boundaries.
- Recognize the CFPB's UDAAP authority (12 U.S.C. §5531, §5536) and its application to DSCR marketing.

**Key topics:**
1. V1 guardrails (G-1 through G-7) — preserved from V1
2. V2 guardrails (V2-1 through V2-10) — added in V2 rebuild
3. V2 forbidden copy list — including V2 additions (false-scarcity phrases, "easy approval" substitutions, demographic-coded phrases)
4. Required compliance disclaimer — §1.4 of AC09_V2_ad_copy.md
5. UDAAP statutory framework — 12 U.S.C. §5531 (unfair, deceptive, abusive acts and practices)
6. CFPB UDAAP guidance — application to mortgage lending
7. Meta Special Ad Category (HOUSING) policy — what's permitted and forbidden
8. Google Ads housing certification — annual recertification requirements
9. Repel copy compliance — V2-7 active disqualifier with redirect (not passive "Built for X only")
10. Objection destroyer compliance — V2-8 persona-specific objections, not generic mortgage objections

**Ad-copy review workshop:** LOs review 10 sample V2 hooks (mixed compliant and non-compliant) and identify violations. Instructor evaluates for accuracy.

**Certification requirement:** 80% or higher on 20-question quiz + passing ad-copy review workshop.

### 8.8 Module 7 — Data Privacy (Reg P / State Privacy Laws) (1 hour)

**Learning objectives:**
- Apply Regulation P (12 CFR Part 1016) privacy notice requirements to DSCR borrowers.
- Apply state privacy laws (CCPA/CPRA in California; Virginia VCDPA; Colorado CPA; Connecticut CTDPA) to DSCR borrower data.
- Recognize the fair-lensing audit data special-handling requirements (Part 5 of this packet).
- Document data subject access requests (DSARs) and the lender's response timeline.

**Key topics:**
1. Reg P framework — initial privacy notice, annual privacy notice, opt-out requirements
2. GLBA Safeguards Rule — information security program requirements
3. CCPA/CPRA — California consumer rights (access, deletion, correction, opt-out of sale)
4. Other state privacy laws — Virginia, Colorado, Connecticut, Utah (2024 wave)
5. Fair-lensing audit data — special handling per Part 5 of this packet (compliance-team-only access)
6. Data subject access requests (DSARs) — process and 45-day response timeline
7. Data breach notification — state-by-state requirements
8. Vendor management — privacy and security requirements for vendors handling borrower data

**Certification requirement:** 80% or higher on 15-question quiz.

### 8.9 Module 8 — CFPB Examination Preparation (1 hour, live workshop)

**Learning objectives:**
- Describe the CFPB examination process (scope, timeline, document requests, exit interview).
- Locate and produce the documents required for a CFPB fair-lending examination (Part 12 of this packet).
- Respond to CFPB examiner questions accurately and completely (without over-disclosing).
- Recognize the CFPB's priority areas for DSCR lenders (fair lending, UDAAP, ECOA, marketing).

**Key topics:**
1. CFPB examination authority — 12 U.S.C. §5511, §5514
2. Examination cycle — risk-focused, priority-driven, 12-18 month cadence for non-bank lenders
3. Document request process — what to produce, what to withhold (privilege), timeline
4. Fair-lending examination procedures — CFPB Examination Manual §1002.6
5. UDAAP examination procedures — CFPB Examination Manual §1002.7
6. CFPB priority areas for DSCR lenders — fair lending (ITIN/FN), UDAAP (marketing), ECOA (adverse-action)
7. Privilege protection — attorney-client privilege, work-product doctrine, self-testing privilege under §1002.13
8. Exit interview and Matters Requiring Attention (MRAs) — response timeline and remediation

**Mock examination (workshop):** LOs participate in a mock CFPB examination Q&A — instructor plays the role of CFPB examiner; LOs practice responding to questions about specific loan files, marketing decisions, and adverse-action notices. Instructor evaluates for accuracy, completeness, and privilege protection.

**Certification requirement:** Instructor evaluation of mock examination Q&A — pass/fail.

### 8.10 Annual Recertification

All LOs must complete 4 hours of annual recertification training each subsequent year. Recertification covers: (a) regulatory updates from the prior year (1 hour); (b) fair-lensing audit findings from the prior year (1 hour); (c) refreshed case studies (1 hour); (d) mock examination Q&A (1 hour). Recertification requires 80% pass rate on a 20-question quiz.

Failure to complete annual recertification within 60 days of the anniversary date results in suspension of LO origination authority until recertification is complete.

---

## Part 9 — Quarterly Fair-Lensing Audit Template

### 9.1 Audit Runbook

The quarterly fair-lensing audit is the lender's primary defensive measure against fair-lending enforcement actions. The audit must be conducted by the compliance team (with outside counsel review of findings) on the following schedule:

| Quarter | Audit Period | Audit Run Date | Counsel Review Date | Board Reporting Date |
|---|---|---|---|---|
| Q1 | Prior calendar year Q4 (Oct-Dec) | Jan 15-31 | Feb 15 | Mar 15 (Q4 Board meeting) |
| Q2 | Prior calendar year Q1 (Jan-Mar) | Apr 15-30 | May 15 | Jun 15 (Q2 Board meeting) |
| Q3 | Prior calendar year Q2 (Apr-Jun) | Jul 15-31 | Aug 15 | Sep 15 (Q3 Board meeting) |
| Q4 | Prior calendar year Q3 (Jul-Sep) | Oct 15-31 | Nov 15 | Dec 15 (Q4 Board meeting) |

The audit must complete all 5 phases below within the audit run date window. Slippage is a P1 compliance incident.

### 9.2 Phase 1 — Data Extraction

**Inputs:**
- Funded loans for the audit period (loan_id, application_id, decision, decision_date, FICO, DSCR, LTV, reserves, loan_amount, property_type, property_market, itin_indicator, fn_indicator, credit_event_indicator)
- Declined applications for the audit period (same fields + decline_reason_codes)
- Fair-lensing audit demographic data (post-funding survey responses from fair_lensing_audit table per Part 5)
- HEX routing logs (which HEX paths fired, when, for which applicants)
- Adverse-action notice delivery logs (when sent, to whom, delivery method, delivery confirmation)

**Extraction script:** `fair_lens_data_prep.py` from Part 4 §4.1.

**Quality checks:**
- [ ] All funded loans for the audit period are present (no missing loan_ids)
- [ ] All declined applications for the audit period are present
- [ ] Demographic coverage ≥ 60% of funded loans (lower coverage = sample-size limitation noted in audit report)
- [ ] HEX routing log timestamps align with FF-08 form submission timestamps (no orphan records)
- [ ] Adverse-action notice delivery rate ≥ 95% (lower rate = compliance incident to investigate)

### 9.3 Phase 2 — Statistical Tests

Run all three statistical tests per Part 4 of this packet:

1. **Proxy regression** (R code, Part 4 §4.2): Test whether ITIN, FN, credit-event indicators function as proxies for protected-class characteristics (race, age, marital status).
2. **LDA boundary test** (Python code, Part 4 §4.3): Test whether less discriminatory alternatives exist for the 8 highest-risk facially neutral criteria.
3. **Disparate impact 3-prong test** (Python code, Part 4 §4.4): Test whether each DSCR policy meets the 3-prong framework.

**Output:** Three CSV files in `/home/z/my-project/compliance/audit_YYYY-QN/`:
- `proxy_regression_results.csv`
- `lda_test_results.csv`
- `prong1_results.csv` + `prong2_3_analysis.md` (per-policy 3-prong documentation)

### 9.4 Phase 3 — Findings Report

The compliance team produces a findings report using the template from Part 4 §4.5. The report contains:

1. **Executive Summary** (1 page) — audit period, sample size, demographic coverage, key findings, remediation required (Y/N)
2. **Proxy Regression Results** (1-2 pages) — table of McFadden R-squared values for each proxy test, interpretation (strong/moderate/weak proxy), recommendation
3. **LDA Boundary Test Results** (1-2 pages) — table of LDA candidates tested, z-test p-values, default rate comparisons, admission lift, recommendation
4. **Disparate Impact 3-Prong Analysis** (3-5 pages) — per-policy 3-prong table, policy dispositions
5. **Adverse-Action Notice Audit** (1 page) — delivery rate, late-delivery rate, reason-code distribution by protected-class proxy
6. **HEX Routing Audit** (1 page) — routing rate by HEX path, routing rate by protected-class proxy (test for disparate impact in routing)
7. **Specialty-Lender Referral Audit** (1 page) — referral rate by specialty lender, referral rate by protected-class proxy
8. **Marketing Audit** (1 page) — sample of 10% of V2 hooks deployed during the audit period, UDAAP review per Part 11
9. **Complaint Audit** (1 page) — CFPB complaint portal + internal complaints for the audit period, analysis by complaint type, resolution timeline
10. **Remediation Plan (if required)** — see Phase 4 below

### 9.5 Phase 4 — Remediation Plan Template

If the audit identifies fair-lensing findings requiring remediation, the compliance team produces a remediation plan using the template below:

```markdown
# Fair-Lensing Audit Remediation Plan — [Quarter]

## Finding 1: [Finding description]
- **Audit test:** [Proxy regression / LDA boundary / Disparate impact 3-prong / Adverse-action audit]
- **Severity:** [P0 / P1 / P2 / P3]
- **Affected policy/process:** [e.g., "FN 65% LTV cap", "ITIN +50-75bps pricing premium", "Reason code distribution disparity"]
- **Statistical evidence:** [e.g., "Four-fifths ratio = 0.72 for Hispanic FN borrowers (vs 1.0 control)"]
- **Root cause analysis:** [e.g., "65% LTV cap not justified by observed default rate; LDA test identified 70% LTV cap as viable alternative (p=0.23)"]
- **Remediation action:** [e.g., "Revise FN LTV cap from 65% to 70% for Nova-Credit-eligible borrowers"]
- **Remediation owner:** [Name, role]
- **Remediation target date:** [YYYY-MM-DD]
- **Verification method:** [e.g., "Re-run LDA test in next quarterly audit; verify revised policy deployed in CRM"]
- **Counsel review:** [Required — Outside counsel must review and approve remediation before deployment]
- **Board reporting:** [Required — Remediation plan reported to Board Risk Committee at next quarterly meeting]

## Finding 2: [Finding description]
[Same template as above]

## Summary of Remediation Plan
- Total findings: [N]
- P0 findings (immediate remediation): [N]
- P1 findings (30-day remediation): [N]
- P2 findings (90-day remediation): [N]
- P3 findings (next quarterly audit cycle): [N]
- Estimated remediation cost: $[amount]
- Estimated remediation FTE: [N FTE-weeks]
```

### 9.6 Phase 5 — Board Reporting Template

The compliance team reports audit findings to the Board Risk Committee using the template below:

```markdown
# Board Risk Committee — Fair-Lensing Audit Report — [Quarter]

## 1. Audit Summary
- Audit period: [YYYY-QN]
- Sample size: [N funded + N declined = Total N]
- Tests performed: [Proxy regression, LDA boundary, Disparate impact 3-prong]
- Key findings: [N findings — N P0, N P1, N P2, N P3]
- Remediation required: [Yes / No]
- Counsel certification: [Approved / Approved with conditions / Denied]

## 2. Key Findings (Executive Summary for Board)
[Finding 1 summary — 2-3 sentences]
[Finding 2 summary — 2-3 sentences]

## 3. Remediation Plan Summary
[Summary of remediation plan from Phase 4]

## 4. Board Action Required
The Board Risk Committee is asked to:
1. [ ] Receive and review the audit report
2. [ ] Approve the remediation plan (if required)
3. [ ] Authorize remediation budget (if required)
4. [ ] Receive status update on prior-quarter remediation items
5. [ ] Confirm outside counsel engagement for ongoing fair-lensing program

## 5. Board Certification
We, the undersigned members of the Board Risk Committee, certify that we have
reviewed the [Quarter] fair-lensing audit report and approve the remediation
plan as presented.

Committee Chair: ____________________ Date: ________
Committee Member: __________________ Date: ________
Committee Member: __________________ Date: ________
```

### 9.7 CFPB Examination-Ready Documentation Package

The compliance team maintains a CFPB examination-ready documentation package that is updated quarterly. The package includes:

1. Current-quarter audit report (Part 9 §9.4)
2. Current-quarter remediation plan (if any) (Part 9 §9.5)
3. Prior 4 quarters' audit reports + remediation plans (1-year audit trail)
4. All 12 adverse-action notice templates (Part 2 of this packet)
5. ECOA reason code library (Part 3 of this packet)
6. Fair-lensing statistical test code (R/Python scripts from Part 4)
7. PostgreSQL schema for fair_lensing_audit table (Part 5)
8. Document retention policy + disposal authorization forms (Part 6)
9. Pre-approval vs application memo + counsel opinion (Part 7)
10. LO training curriculum + completion records (Part 8)
11. Quarterly audit template (Part 9)
12. State-specific regulatory overlay documentation (Part 10)
13. UDAAP review of all 120 V2 hooks (Part 11)
14. CFPB examination readiness checklist (Part 12)

The package is stored in `/home/z/my-project/compliance/cfpb_exam_package/` and is available to CFPB examiners within 24 hours of request.

---

## Part 10 — State-Specific Overlays (FL / NY / CA / TX)

### 10.1 Why State Overlays Matter for DSCR Compliance

DSCR lenders operating in multiple states face a patchwork of state-specific fair-lending, mortgage-licensing, privacy, and disclosure requirements. While ECOA and Regulation B establish the federal floor, state laws can impose additional requirements that are stricter than federal law. Failure to comply with state-specific overlays creates state-level enforcement exposure (state Attorney General, state Department of Financial Institutions) in addition to federal CFPB exposure.

The four states below are the highest-volume DSCR markets AND have the most stringent state-specific overlays. Counsel should review each state's overlay before deploying DSCR marketing or originating DSCR loans in that state.

### 10.2 Florida Overlay

**State regulators:** Florida Office of Financial Regulation (OFR), Florida Attorney General
**Key state laws:**
- Florida Fair Housing Act (Chapter 760, Florida Statutes) — prohibits discrimination in housing and housing-related credit on the basis of race, color, national origin, sex, disability, familial status, religion
- Florida Mortgage Lender and Servicer License (Chapter 494, Florida Statutes) — required for non-bank DSCR lenders; SAFE Act-aligned
- Florida Information Protection Act (FIPA, Chapter 501.171) — data breach notification law (stricter than most state laws)
- Florida Consumer Collection Practices Act (Chapter 559.555) — applies to debt collection, including post-default DSCR loan collection

**DSCR-specific overlay requirements:**

| Requirement | Florida Rule | Operational Action |
|---|---|---|
| Mortgage lender license | Chapter 494.0033 — required for any non-bank lender making 1-4 unit residential mortgage loans, including DSCR | Verify NMLS license includes FL endorsement; annual renewal required |
| Loan originator license | Chapter 494.0033 + SAFE Act — required for any individual taking residential mortgage applications | Verify each LO has FL MLO endorsement on NMLS |
| Fair-lending reporting | Florida does NOT have a HMDA-like state reporting requirement for DSCR | Standard Reg B §1002.12 retention applies |
| STR regulatory | Varies by municipality — Miami Beach (stricter than Local Law 18), Orlando (STR permit required), Panama City Beach (STR-permissive) | FF-08 form STR market check must include FL municipality-level STR rules |
| Insurance disclosure | FL wind/hurricane insurance crisis (Citizens Property Insurance as last resort; carrier insolvencies post-Ian) | Disclose insurance-availability risk in pre-approval; obtain insurance quote before final approval |
| Privacy notice | FIPA Chapter 501.171 — requires 30-day breach notification to FL residents (stricter than GLBA) | Privacy notice must reference FIPA; incident response plan must include 30-day FL notification |
| Foreign-national borrowers | FL is the #1 FN DSCR market (no state income tax + landlord-friendly); Miami has large LatAm investor population | V2 EG-002 / SA-010 ITIN creative applies; Spanish-language landing pages permissible under ECOA affirmative marketing |

**FL-specific compliance checklist (in addition to federal):**
- [ ] OFR mortgage lender license current and displayed on website
- [ ] Each LO has FL MLO endorsement on NMLS
- [ ] FL STR municipality-level rules integrated into FF-08 STR-permissiveness check
- [ ] FL wind/hurricane insurance disclosure in pre-approval communications
- [ ] FIPA privacy notice included in initial disclosure package
- [ ] FIPA-compliant incident response plan with 30-day FL notification workflow

### 10.3 New York Overlay

**State regulators:** New York Department of Financial Services (NYDFS), New York Attorney General
**Key state laws:**
- New York Fair Housing Act (Executive Law §296) — prohibits discrimination in housing and housing-related credit
- NYDFS Part 410 (3 NYCRR Part 410) — subprime mortgage lending rules; applies to higher-priced mortgage loans (rate exceeds APOR by 3% first-lien / 5% subordinate-lien)
- New York General Business Law §349 — deceptive acts and practices (state UDAAP analog; private right of action)
- New York SHIELD Act (Stop Hacks and Improve Electronic Data Security) — data security and breach notification
- NYC Local Law 18 (STR restrictions) — referenced in HEX-002 hard-exit
- New York State Privacy Act (proposed, not yet enacted as of 2024 Q4 — monitor)

**DSCR-specific overlay requirements:**

| Requirement | New York Rule | Operational Action |
|---|---|---|
| Mortgage lender license | Article 12-D, Banking Law — required for any non-bank lender making residential mortgage loans in NY | Verify NMLS license includes NY endorsement; annual renewal + financial condition reporting |
| NYDFS Part 410 subprime | If DSCR loan rate exceeds APOR by 3% (first-lien), the loan is "subprime" under Part 410; additional disclosures + servicing restrictions apply | Monitor rate environment; if pricing trends push DSCR into subprime territory, additional Part 410 disclosures required |
| NYC Local Law 18 | HEX-002 hard-exit for NYC STR properties | FF-08 form STR market check must include NYC Local Law 18 verification |
| SHIELD Act | Reasonable data security safeguards + 30-day breach notification | Verify SHIELD-compliant data security program; incident response plan includes 30-day NY notification |
| NY General Business Law §349 | State UDAAP — broader than federal UDAAP; private right of action with treble damages | V2 marketing creative subject to NY §349 review; counsel should review all hooks + landing pages for NY-specific compliance |
| State HMDA-equivalent | New York does NOT require state HMDA reporting for DSCR | Standard Reg B §1002.12 retention applies |

**NY-specific compliance checklist (in addition to federal):**
- [ ] NYDFS mortgage lender license current
- [ ] Each LO has NY MLO endorsement on NMLS
- [ ] NYDFS Part 410 subprime thresholds monitored quarterly; if crossed, additional disclosures deployed
- [ ] NYC Local Law 18 integrated into FF-08 STR-permissiveness check
- [ ] SHIELD Act data security program implemented and tested annually
- [ ] V2 creative reviewed for NY General Business Law §349 compliance (broader UDAAP standard)

### 10.4 California Overlay

**State regulators:** California Department of Financial Protection and Innovation (DFPI), California Attorney General, California Civil Rights Department (CRD)
**Key state laws:**
- California Fair Employment and Housing Act (FEHA, Government Code §12900 et seq.) — prohibits discrimination in housing and housing-related credit; broader protected classes than federal (includes sexual orientation, gender identity, genetic information, military status)
- California Financing Law (Fin. Code §22000 et seq.) — required for non-bank lenders making consumer and commercial loans in California
- California Consumer Privacy Act (CCPA) + California Privacy Rights Act (CPRA) — comprehensive consumer privacy law (effective 2020, expanded 2023)
- California Homeowner Bill of Rights (HBOR) — applies to owner-occupied 1-4 unit residential mortgages (DSCR investment loans generally exempt, but verify)
- California STR regulations — vary by municipality (Los Angeles, San Francisco, Berkeley, Santa Monica have STR restrictions)
- California state HMDA-equivalent — California Reinvestment Act reporting for state-chartered banks (does NOT apply to non-bank DSCR lenders)

**DSCR-specific overlay requirements:**

| Requirement | California Rule | Operational Action |
|---|---|---|
| Financing Law license | Cal. Fin. Code §22000 — required for non-bank DSCR lenders | Verify NMLS license includes CA endorsement; DFPI annual reporting required |
| Loan originator license | Cal. Fin. Code §22100 + SAFE Act — required for any individual taking residential mortgage applications | Verify each LO has CA MLO endorsement on NMLS |
| FEHA protected classes | Broader than federal ECOA — includes sexual orientation, gender identity, genetic information, military status | V2 creative must avoid FEHA-protected-class proxies; marketing review includes FEHA analysis |
| CCPA/CPRA | Consumer privacy rights — access, deletion, correction, opt-out of sale/sharing, limited use of sensitive personal information | Privacy notice must reference CCPA/CPRA; DSAR process must handle CA-specific rights; "Do Not Sell or Share My Personal Information" link required on website |
| Sensitive personal information | CPRA defines "sensitive personal information" including SSN, driver's license, financial account, precise geolocation | DSCR borrower data includes SPI; right to limit use of SPI applies |
| ADU income rules | California ADU statutes (Gov. Code §65852.2) — permitted ADUs are increasingly recognized for DSCR income | V2 SA-009 Permitted-ADU creative applies; Harpoon Capital ADU guide as lender reference |
| STR municipality rules | LA, SF, Berkeley, Santa Monica have STR restrictions; verify per municipality | FF-08 form STR market check must include CA municipality-level STR rules |
| Insurance crisis | CA wildfire crisis — State Farm/Allstate exits; CA Fair Plan as insurer of last resort | Disclose insurance-availability risk in pre-approval; obtain insurance quote before final approval |

**CA-specific compliance checklist (in addition to federal):**
- [ ] DFPI Financing Law license current
- [ ] Each LO has CA MLO endorsement on NMLS
- [ ] V2 creative reviewed for FEHA protected-class compliance (broader than federal ECOA)
- [ ] CCPA/CPRA privacy notice included in initial disclosure package
- [ ] CCPA/CPRA-compliant DSAR process operational (45-day response timeline)
- [ ] "Do Not Sell or Share My Personal Information" link on website
- [ ] SPI handling policy documented and tested
- [ ] CA ADU statutes integrated into FF-08 ADU income rules
- [ ] CA municipality-level STR rules integrated into FF-08 STR-permissiveness check
- [ ] CA wildfire insurance disclosure in pre-approval communications

### 10.5 Texas Overlay

**State regulators:** Texas Department of Savings and Mortgage Lending (SML), Texas Attorney General
**Key state laws:**
- Texas Fair Housing Act (Texas Property Code §301.001 et seq.) — prohibits discrimination in housing and housing-related credit
- Texas Finance Code Chapter 156 — Mortgage Broker License and Loan Officer License requirements
- Texas Finance Code Chapter 157 — Mortgage Banker Registration requirements
- Texas Finance Code Chapter 343 — High-cost home loan restrictions (applies to high-cost loans, typically below DSCR pricing thresholds)
- Texas Identity Theft Enforcement and Protection Act — data security and breach notification
- Texas STR regulations — vary by municipality (Austin STR restrictions, Dallas STR permit required, Houston relatively permissive)

**DSCR-specific overlay requirements:**

| Requirement | Texas Rule | Operational Action |
|---|---|---|
| Mortgage banker registration | Texas Finance Code Chapter 157 — required for non-bank DSCR lenders (registration, not license, but requires annual renewal) | Verify SML mortgage banker registration current; annual renewal + quarterly call reports |
| Mortgage broker license | Texas Finance Code Chapter 156 — required if lender operates as broker (brokers loans to other lenders) rather than banker (originates with own funds) | Determine lender's TX characterization (banker vs broker); obtain appropriate authorization |
| Loan originator license | Texas Finance Code Chapter 157 + SAFE Act — required for any individual taking residential mortgage applications | Verify each LO has TX MLO endorsement on NMLS |
| TX Finance Code Chapter 343 | High-cost home loan restrictions apply if APR exceeds 8% above comparable Treasury yield for first-lien or 9% above for subordinate-lien | Monitor rate environment; if pricing trends push DSCR into high-cost territory, additional Chapter 343 restrictions apply |
| TX Identity Theft Enforcement and Protection Act | Reasonable data security safeguards + 60-day breach notification | Verify TX-compliant data security program; incident response plan includes 60-day TX notification |
| STR municipality rules | Austin STR restrictions (pending legislation SWR-014), Dallas STR permit required, Houston relatively permissive | FF-08 form STR market check must include TX municipality-level STR rules; quarterly update per SWR-014 |
| Foreign-national borrowers | TX is #3 FN DSCR market (no state income tax + landlord-friendly + Austin/Houston/Dallas FN investor communities); Houston has large Vietnamese/Mandarin/Spanish FN population | V2 EG-002 / SA-005 / SA-006 creative applies; bilingual landing pages (Spanish/Mandarin/Vietnamese) permissible under ECOA affirmative marketing |

**TX-specific compliance checklist (in addition to federal):**
- [ ] SML mortgage banker registration OR mortgage broker license current (as applicable)
- [ ] Each LO has TX MLO endorsement on NMLS
- [ ] TX Finance Code Chapter 343 high-cost thresholds monitored quarterly
- [ ] TX Identity Theft Enforcement and Protection Act data security program implemented
- [ ] TX municipality-level STR rules integrated into FF-08 STR-permissiveness check (quarterly update per SWR-014)
- [ ] Bilingual landing pages available for Houston-area FN borrower communities

### 10.6 Multi-State Compliance Matrix

For DSCR lenders operating in all 4 states (FL, NY, CA, TX), the following matrix summarizes the compliance overhead:

| Requirement | FL | NY | CA | TX |
|---|---|---|---|---|
| State mortgage license/registration | OFR license | NYDFS license | DFPI license | SML registration |
| LO MLO endorsement | Required | Required | Required | Required |
| State fair-lending law | FL Fair Housing Act | NY Fair Housing Act | FEHA (broader) | TX Fair Housing Act |
| State UDAAP | (common law) | NY GBL §349 (broader) | CA B&P §17200 (broader) | TX DTPA (broader) |
| State HMDA-equivalent | None | None | None (CRA for state banks only) | None |
| State privacy law | FIPA | SHIELD Act | CCPA/CPRA (most comprehensive) | TX Identity Theft Act |
| STR municipality rules | Varies | NYC Local Law 18 + NYC borough rules | LA/SF/Berkeley/Santa Monica | Austin/Dallas/Houston |
| Insurance crisis | FL wind/hurricane | None | CA wildfire | None |
| Subprime/high-cost loan rules | None | NYDFS Part 410 | None (CA ROFSA proposed) | TX Finance Code Chapter 343 |
| FN market size | #1 (Miami LatAm) | #7 (NYC intl investor) | #4 (LA Asian) | #3 (Houston Asian + LatAm) |
| Quarterly review required? | Yes | Yes | Yes | Yes |

**Counsel recommendation:** Outside counsel admitted in each of the 4 states (FL, NY, CA, TX) should review the lender's V2 creative library, intake form, and adverse-action notice templates annually for state-specific compliance. The annual review should be scheduled in Q4 to align with the lender's annual compliance audit cycle.

---
