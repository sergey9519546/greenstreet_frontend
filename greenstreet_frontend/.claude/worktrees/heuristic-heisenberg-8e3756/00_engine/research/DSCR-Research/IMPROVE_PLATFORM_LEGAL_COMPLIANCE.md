# DSCR Intelligence Platform — Legal & Compliance Guide

> **Classification:** Internal Legal Reference | **Last Updated:** March 2026
> **Status:** Research-compiled guidance. NOT legal advice. Engage qualified counsel before implementation.

---

## Table of Contents

1. [Executive Summary & Risk Tiers](#1-executive-summary--risk-tiers)
2. [Mortgage Licensing Requirements](#2-mortgage-licensing-requirements)
3. [RESPA Compliance (Critical)](#3-respa-compliance-critical)
4. [Fair Lending Requirements](#4-fair-lending-requirements)
5. [Data Privacy Regulations](#5-data-privacy-regulations)
6. [State-Specific Licensing](#6-state-specific-licensing)
7. [Anti-Money Laundering (AML)](#7-anti-money-laundering-aml)
8. [Advertising Compliance (Reg Z)](#8-advertising-compliance-reg-z)
9. [Insurance & Bonding](#9-insurance--bonding)
10. [Compliance Framework & Checklist](#10-compliance-framework--checklist)
11. [Implementation Roadmap](#11-implementation-roadmap)
12. [Key Sources & References](#12-key-sources--references)

---

## 1. Executive Summary & Risk Tiers

### Platform Model Classification

The DSCR Intelligence Platform operates as a **mortgage comparison shopping / lead generation platform** — it provides information, rate comparisons, and lender matching for DSCR (Debt Service Coverage Ratio) investment property loans. It does NOT originate loans, fund loans, or service loans.

| Business Activity | Regulatory Risk | License Required? |
|---|---|---|
| Display rate information | Low | No |
| Compare DSCR lenders side-by-side | Low-Medium | No* |
| Match borrowers with lenders (referral) | **High** | Depends on structure |
| Collect borrower financial data | Medium | No (but privacy rules apply) |
| Receive payment from lenders | **Critical** | RESPA compliance essential |
| Originate or broker loans | **Critical** | Yes — full licensing |

*\*No mortgage license is required purely for information/comparison display. However, the moment the platform facilitates referrals or receives compensation from lenders, RESPA and potentially state licensing requirements are triggered.*

### Critical Finding: CFPB Advisory Opinion (February 2023)

The CFPB issued a formal advisory opinion specifically targeting **digital mortgage comparison-shopping platforms**. This is directly applicable to the DSCR Intelligence Platform. The CFPB warned that these platforms may violate RESPA Section 8 if they:

1. **Present lenders in a non-neutral way** (e.g., steer users toward paying lenders), AND
2. **Receive fees or compensation** from those lenders, AND
3. **The compensation is tied to referrals** rather than bona fide services

This is the single most important regulatory guidance for this platform.

---

## 2. Mortgage Licensing Requirements

### 2.1 Do We Need a Mortgage License?

**Short answer: It depends entirely on what the platform does.**

#### No License Required (Information-Only Model)
If the platform ONLY:
- Displays publicly available rate data
- Provides educational content about DSCR loans
- Offers calculators and comparison tools
- Does NOT collect borrower information for transmission to lenders
- Does NOT receive compensation from lenders for referrals

Then **no mortgage license is required**. This is a pure media/information service.

#### License MAY Be Required (Lead Generation / Referral Model)
If the platform:
- Collects borrower contact information and transmits it to lenders
- Receives compensation from lenders (per-lead or per-closed-loan)
- "Matches" or "connects" borrowers with specific lenders
- Takes applications on behalf of lenders

Then state mortgage broker licensing requirements may apply. The specific licensing needed depends on the state and the nature of the activity.

#### License IS Required (Broker/Originator Model)
If the platform:
- Negotiates loan terms on behalf of borrowers
- Takes applications for mortgages
- Presents loan offers from lenders to borrowers
- Receives compensation contingent on loan closing

Then **full mortgage broker licensing is required** in each state of operation.

### 2.2 How LendingTree and Bankrate Comply

From search research, these platforms operate under a specific model:

- **Bankrate, LLC**: "Will not make any mortgage loan commitments or fund any mortgage loans. Bankrate, LLC arranges loans with third-party providers." They maintain state licenses in many states and display them on their licenses page.
- **LendingTree**: Operates as a licensed mortgage broker in many states. "LendingTree receives compensation" from lenders — this is disclosed. They hold NMLS licenses.

**Key takeaway:** Major comparison platforms that receive lender compensation generally DO obtain mortgage broker licenses. This is the safest compliance path.

### 2.3 SAFE Act and NMLS

The Secure and Fair Enforcement for Mortgage Licensing Act (SAFE Act) requires:
- State-licensed mortgage loan originators must pass a written qualified test
- Complete pre-licensure education (minimum 20 hours federal, additional state-specific hours)
- Complete continuing education annually
- Register through the Nationwide Multistate Licensing System (NMLS)

**For the DSCR platform operating as information-only:** NMLS registration is NOT required.

**For the DSCR platform receiving referral fees:** NMLS registration MAY be required, and the platform should seek legal counsel.

---

## 3. RESPA Compliance (Critical)

### 3.1 What is RESPA?

The Real Estate Settlement Procedures Act (RESPA), 12 U.S.C. § 2601 et seq., is administered by the CFPB through Regulation X (12 CFR § 1024). Its primary purpose is to protect consumers from unnecessarily high settlement costs caused by kickbacks and referral fees.

### 3.2 Section 8 — The Core Prohibition

**Section 8(a) — Anti-Kickback Provision:**
> Prohibits giving or accepting any fee, kickback, or thing of value pursuant to an agreement or understanding that business incident to a real estate settlement service will be referred.

**Section 8(b) — Unearned Fee Provision:**
> Prohibits giving or accepting any portion, split, or percentage of any charge for a settlement service other than for services actually performed.

**Penalties:** Up to $10,000 per violation, plus potential criminal penalties (up to $25,000 fine and/or 1 year imprisonment for knowing violations).

### 3.3 CFPB Advisory Opinion on Digital Comparison Platforms (Feb 2023)

The CFPB specifically addressed digital mortgage comparison-shopping platforms. The advisory opinion established that:

**A digital comparison-shopping platform violates RESPA Section 8 when:**

1. **Non-neutral presentation**: The platform presents one or more service providers in a non-neutral way (e.g., ranking paying lenders higher, featuring them more prominently, or hiding non-paying lenders)

2. **Compensation tied to placement**: The platform receives compensation from the featured providers, AND

3. **Referral nexus**: The compensation is pursuant to an agreement or understanding that the platform will refer business to those providers

**The CFPB's key concern:** Platforms that claim to provide "neutral" comparisons but actually steer consumers toward lenders who pay them.

### 3.4 What is a "Referral" Under RESPA?

A referral includes:
- Oral or written action directing a consumer to a settlement service provider
- Endorsing or recommending a specific provider
- Providing a consumer's contact information to a provider
- Placing a provider in a position that implies endorsement

### 3.5 Referral Fee vs. Advertising Fee — The Critical Distinction

| Factor | Referral Fee (Prohibited) | Advertising Fee (Permitted) |
|---|---|---|
| **Payment basis** | Per closed loan, per lead, or per referral | Flat fee for ad placement |
| **Placement control** | Lender ranked/featured based on payment | Equal placement regardless of payment |
| **Neutrality** | Non-neutral — paying lenders get better placement | Neutral — all lenders shown objectively |
| **Volume linkage** | Payment varies with number of referrals | Payment is fixed regardless of volume |
| **Disclosure** | Often undisclosed | Clearly disclosed as advertising |

**To comply:** If the platform accepts advertising fees from lenders:
- Fees must be **bona fide advertising fees** at fair market value
- Placement must NOT be conditioned on the number of referrals
- The platform must maintain **neutrality** in presenting results
- Advertising relationships must be clearly disclosed

### 3.6 Marketing Service Agreements (MSAs)

MSAs are agreements where a party pays for marketing services (not referrals). The CFPB and state regulators have scrutinized MSAs heavily:

- **Permissible MSA**: Payment for actual marketing services at fair market value, with no condition on referrals
- **Impermissible MSA**: Payment that is essentially a disguised referral fee — where the "marketing services" are a sham and payment correlates with referrals

**Practical guidance:** The DSCR platform should avoid MSAs unless carefully structured with legal counsel, as regulators have treated many MSAs as RESPA violations.

### 3.7 RESPA-Compliant Platform Structure

For the DSCR Intelligence Platform to be RESPA-compliant:

1. **Neutral Ranking Algorithm**: Lender recommendations must be based on objective criteria (rate, DSCR requirements, LTV, fees), NOT payment status
2. **Clear Disclosure**: If lenders pay for premium placement, this must be clearly and conspicuously disclosed to users
3. **No Per-Loan Compensation**: Never accept fees contingent on loan closing
4. **No Per-Lead Compensation with Exclusivity**: Avoid arrangements where a lender pays per lead AND receives preferential treatment
5. **Advertising Fee Structure**: If accepting ad revenue, use flat-fee advertising (not tied to referral volume)
6. **Equal Access**: All qualified lenders should have the ability to be listed and compared

---

## 4. Fair Lending Requirements

### 4.1 Applicable Laws

| Law | Coverage | Key Prohibition |
|---|---|---|
| **Equal Credit Opportunity Act (ECOA)** | All creditors | Discrimination in credit transactions based on protected characteristics |
| **Fair Housing Act (FHA)** | Residential real estate | Discrimination in housing-related transactions |
| **Community Reinvestment Act (CRA)** | Banks/depositories | Not directly applicable to platform |

### 4.2 Does Fair Lending Apply to a Comparison Platform?

**Yes, potentially — especially if the platform:**
- Uses algorithms to match borrowers with lenders
- Filters or recommends lenders based on geographic or demographic criteria
- Collects information about borrower characteristics
- Influences which lenders a borrower sees

**ECOA applies to "creditors"** — entities that regularly extend credit. A pure comparison platform is arguably NOT a creditor. However:
- If the platform is deemed to be "arranging" credit, ECOA may apply
- If the platform partners with lenders in a way that creates an agency relationship, fair lending obligations may attach
- The CFPB has increasingly focused on algorithmic decision-making in lending

### 4.3 Algorithmic Bias and Disparate Impact

**Disparate impact theory** applies when a facially neutral practice has a disproportionately adverse effect on a protected class, unless the practice is justified by business necessity and there is no less discriminatory alternative.

**Risks for the DSCR platform:**
- If the algorithm consistently recommends certain lenders for borrowers in certain geographic areas, and those areas correlate with protected characteristics
- If lender availability data creates patterns that disadvantage certain neighborhoods
- If DSCR calculation methodologies or property valuation data create systematic biases

### 4.4 Fair Lending Testing Requirements

While a pure comparison platform may not have the same testing obligations as a lender, best practices include:

| Testing Type | Description | Frequency |
|---|---|---|
| **Disparate impact analysis** | Statistical analysis of recommendation patterns | Quarterly |
| **Geographic mapping** | Check if lender recommendations correlate with demographic patterns | Semi-annually |
| **Algorithmic audit** | Review recommendation algorithm for bias | At launch + annually |
| **Lender coverage review** | Ensure diverse lender coverage across geographies | Ongoing |

### 4.5 ECOA Compliance for Fintechs — Key Points

From research (InnReg ECOA guide):
- Fintechs must **design products with fair lending in mind**
- Maintain accurate records of lending/recommendation decisions
- Implement monitoring and testing programs
- Document the business justification for algorithmic decisions
- Train employees on fair lending obligations

### 4.6 DSCR-Specific Fair Lending Considerations

DSCR loans are **non-QM (non-Qualified Mortgage)** investment property loans. Fair lending risk is somewhat different than for consumer mortgages:

- **Investment property loans** have fewer fair lending protections than owner-occupied loans (ECOA still applies, but FHA has limitations)
- **DSCR qualification is based on property cash flow**, not borrower income — this reduces some bias risks
- **However**, geographic patterns in DSCR lender availability could still create fair lending concerns
- **Foreign national borrowers** are a significant DSCR market segment — ensure no national origin discrimination

---

## 5. Data Privacy Regulations

### 5.1 Regulatory Landscape

| Regulation | Applicability | Key Requirements |
|---|---|---|
| **GLBA** | Financial institutions | Privacy notices, data safeguarding, opt-out rights |
| **CCPA/CPRA** | Businesses serving CA consumers | Right to know, delete, opt-out of sale, non-discrimination |
| **State privacy laws** | Varies by state | Growing patchwork (VA, CO, CT, UT, etc.) |
| **FTC Act Section 5** | All businesses | Unfair/deceptive data practices |

### 5.2 Gramm-Leach-Bliley Act (GLBA)

**Does GLBA apply to the DSCR platform?**

GLBA applies to "financial institutions" — defined as businesses that are significantly engaged in financial activities. The DSCR platform likely qualifies if it:
- Collects financial information from borrowers
- Facilitates connections between borrowers and lenders
- Handles nonpublic personal information (NPI)

**GLBA Requirements:**

1. **Financial Privacy Rule** (Regulation P):
   - Provide initial privacy notice to consumers
   - Provide annual privacy notice (if continuing relationship)
   - Allow consumers to opt out of information sharing with non-affiliates
   - Provide opt-out notice before sharing with non-affiliates

2. **Safeguards Rule**:
   - Develop, implement, and maintain a comprehensive information security program
   - Designate a qualified individual to oversee the program
   - Conduct risk assessments
   - Implement technical and physical safeguards
   - Oversee service providers
   - Adjust the program as needed

3. **Pretexting Provisions**:
   - Prohibit obtaining financial information under false pretenses

### 5.3 CCPA/CPRA (California)

**Does CCPA apply?**

CCPA applies if the platform:
- Has annual gross revenue > $25M, OR
- Buys, sells, or shares personal information of 100,000+ consumers/households annually, OR
- Derives 50%+ of revenue from selling/sharing personal information

**Key CCPA/CPRA requirements:**
- Right to know what personal information is collected
- Right to delete personal information
- Right to opt-out of sale/sharing
- Right to non-discrimination for exercising rights
- Data minimization requirements
- Purpose limitation requirements

**GLBA Exemption:** CCPA has a partial exemption for data regulated under GLBA. Information collected and shared pursuant to GLBA requirements is exempt from some CCPA provisions. However, this exemption is narrow — data collected beyond what GLBA requires is still subject to CCPA.

### 5.4 State Privacy Law Patchwork

As of 2026, approximately 19 states have enacted comprehensive privacy laws:
- Virginia (VCDPA)
- Colorado (CPA)
- Connecticut (CTDPA)
- Utah (UCPA)
- And many more

**For a national platform**, the practical approach is to comply with the most restrictive standard (typically CCPA/CPRA) as a baseline.

### 5.5 Data the Platform Can Collect and Store

| Data Category | Collectible? | Storage Rules | Sensitivity |
|---|---|---|---|
| Property address | Yes | Standard retention | Low |
| Property value / rent data | Yes | Standard retention | Low |
| DSCR calculation inputs | Yes | Encrypted, access-controlled | Medium |
| Borrower contact information | Yes | Per privacy notice, encrypted | Medium |
| Borrower financial information | Yes (with notice/consent) | Encrypted, limited access, audit trail | **High** |
| Social Security Number | Avoid if possible | If collected: encrypted, minimum retention | **Critical** |
| Credit information | Avoid unless necessary | If collected: encrypted, limited access | **Critical** |

### 5.6 Privacy Policy Requirements

The platform MUST have a privacy policy that includes:

- **Identity and contact information** of the business
- **Categories of personal information collected**
- **Categories of sources** from which information is collected
- **Business or commercial purpose** for collecting/selling/sharing
- **Categories of third parties** with whom information is shared
- **Consumer rights** (under CCPA, GLBA, and applicable state laws)
- **Data retention periods**
- **Security measures** implemented
- **How to exercise rights** (request, delete, opt-out)
- **Effective date** and change notification procedures

---

## 6. State-Specific Licensing

### 6.1 The Multi-State Licensing Challenge

If the platform operates as a mortgage broker or receives referral fees, it may need licenses in multiple states. The SAFE Act established minimum federal standards but left licensing to individual states, creating a patchwork.

### 6.2 When State Licensing is NOT Required

If the platform is purely an information/comparison tool:
- **No state mortgage license is required** — the platform is not engaging in mortgage origination, brokerage, or lending
- This is analogous to a newspaper publishing mortgage rate tables
- However, state regulators may still investigate if the platform's activities cross into brokerage

### 6.3 When State Licensing IS Required

If the platform collects borrower information and transmits it to lenders for compensation:

| State | License Type | Typical Requirements | Typical Cost |
|---|---|---|---|
| California | Finance Lender / Broker License | NMLS, net worth, surety bond | $500-$5,000+ |
| New York | Mortgage Broker License | NMLS, surety bond, background checks | $1,500-$3,000 |
| Texas | Mortgage Broker License | NMLS, education, exam, surety bond | $500-$2,500 |
| Florida | Mortgage Broker License | NMLS, education, exam, surety bond | $350-$2,000 |
| Illinois | Mortgage Broker License | NMLS, education, exam, surety bond | $500-$3,000 |

**For all 50 states:** If operating nationally as a broker, licensing costs can range from $25,000-$100,000+ annually including surety bonds, education, and NMLS fees.

### 6.4 NMLS Registration

The Nationwide Multistate Licensing System (NMLS) is the central system for mortgage licensing:

- **Company Registration (MU1)**: Required for the business entity
- **Branch Registration (MU3)**: Required for each branch location
- **Individual Registration (MU4)**: Required for each mortgage loan originator
- **Processing fees**: $100 per company, $20 per branch, $30 per individual annually

### 6.5 Strategy Recommendation

**Phase 1 (Launch):** Operate as a pure information/comparison platform. No licensing required.

**Phase 2 (Growth):** If adding referral/lead-gen features, consult legal counsel and potentially obtain licenses in top states first.

**Phase 3 (Scale):** If operating nationally with referral fees, pursue NMLS licensing in all required states.

---

## 7. Anti-Money Laundering (AML)

### 7.1 Does AML Apply to the DSCR Platform?

**BSA/AML requirements primarily apply to "financial institutions"** as defined by the Bank Secrecy Act, including:
- Banks and credit unions
- Money services businesses
- Broker-dealers
- Mortgage companies (since FinCEN's 2012 rule)

**For a comparison/lead-gen platform:**
- If the platform does NOT handle funds, does NOT process transactions, and does NOT extend credit, AML requirements generally do NOT apply directly
- However, if the platform is deemed a "loan or finance company" under FinCEN rules, AML may apply

### 7.2 FinCEN Rule for Mortgage Companies

In 2012, FinCEN extended BSA/AML requirements to mortgage companies. This applies to:
- Mortgage lenders
- Mortgage brokers
- Mortgage loan originators

**If the DSCR platform obtains a mortgage broker license**, AML requirements would likely apply:
- Develop an AML compliance program
- File Suspicious Activity Reports (SARs)
- Implement Customer Identification Program (CIP)
- Conduct OFAC screening

### 7.3 OFAC Screening

The Office of Foreign Assets Control (OFAC) maintains lists of sanctioned individuals and entities:
- **SDN List** (Specially Designated Nationals)
- **Sectoral sanctions lists**
- **Country-based sanctions**

**Even for a comparison platform without AML obligations**, OFAC screening is recommended:
- Screen borrowers against OFAC lists before transmitting data to lenders
- Screen lenders against OFAC lists before featuring them
- Document screening procedures

### 7.4 KYC for Foreign Nationals

DSCR loans are popular with foreign national investors. The platform should:
- **If not handling funds:** KYC is not legally required but is best practice
- **If operating as a broker:** KYC/CIP is required under BSA
- **Recommended approach:** Implement basic identity verification as a trust/safety measure
  - Collect and verify name, address, date of birth
  - Verify through documentary or non-documentary methods
  - Screen against OFAC/PEP lists
  - Maintain records for 5 years

### 7.5 AML Compliance Program (If Applicable)

If AML requirements apply, the program must include:

| Component | Description |
|---|---|
| Internal policies & procedures | Written AML program approved by board/senior management |
| Compliance officer | Designated individual responsible for AML program |
| Training | Ongoing training for all relevant employees |
| Independent testing | Annual independent audit of AML program |
| CIP | Customer identification and verification procedures |
| SAR filing | File SARs for suspicious transactions (>$5,000) |
| CTR filing | File Currency Transaction Reports for cash transactions >$10,000 |
| Recordkeeping | Maintain records for 5 years |

---

## 8. Advertising Compliance (Reg Z)

### 8.1 Regulation Z (Truth in Lending Act)

Regulation Z, 12 CFR § 1026, implements the Truth in Lending Act (TILA). It applies to any advertisement for consumer credit. The question is: **do DSCR loan advertisements constitute "consumer credit"?**

**Key distinction:** DSCR loans are typically for **investment properties**, which are generally considered **business/commercial credit**, NOT consumer credit. This means:
- Regulation Z advertising requirements may NOT apply to DSCR loan ads
- The business credit exemption under Reg Z (§ 1026.3) may apply
- However, this should be confirmed with legal counsel, as some DSCR loans may be structured differently

### 8.2 If Reg Z DOES Apply — Trigger Terms and Disclosures

If any DSCR loans are classified as consumer credit, the following trigger terms and disclosures apply:

**Trigger terms that require additional disclosures:**

| Trigger Term | Required Disclosures |
|---|---|
| Amount or percentage of down payment | All terms of repayment, APR, total payments |
| Number of payments or period of repayment | Amount of each payment, APR, total payments |
| Amount of any payment | All other payments, APR, total of payments |
| Amount of any finance charge | All other finance charges, APR, total payments |
| **"Rate" or "Interest rate"** | **APR must be disclosed** |

**If you mention a specific rate, you MUST disclose:**
1. The **Annual Percentage Rate (APR)** — more prominently than other rates
2. Loan terms (amount, maturity)
3. Down payment requirements
4. Total payments
5. Total finance charges

### 8.3 DSCR-Specific Advertising Requirements

Even if Reg Z doesn't strictly apply, the following are best practices:

- **Always disclose APR** when displaying rates
- **Include representative examples** — "Rates shown are for illustrative purposes"
- **Disclose that DSCR loans are for investment properties only**
- **Note that rates and terms vary by lender and borrower qualification**
- **Include lender identification** for each quoted rate
- **Disclosure of compensation** — if the platform receives compensation from lenders
- **State-specific disclosures** — some states require additional disclosures for mortgage advertising

### 8.4 Prohibited Advertising Practices

Under FTC Act Section 5 and various state laws:
- **Bait-and-switch:** Advertising rates that are not actually available
- **Misleading claims:** Suggesting "guaranteed" approval or "no qualification" requirements
- **Hidden fees:** Not disclosing significant fees or costs
- **False urgency:** "Rates going up tomorrow" type claims without basis
- **Undisclosed paid placement:** Presenting paid lender placements as neutral recommendations

### 8.5 Recommended Disclosure Template

For each rate displayed on the platform:

```
Rate shown is [as of date]. APR: [X.XX]%. Loan amount: $[XXX,XXX].
Loan term: [XX] months. DSCR requirement: [X.XX]. LTV up to [XX]%.
Rates, terms, and conditions vary by lender and borrower qualification.
This is not a commitment to lend. [Platform Name] is not a lender.
[Platform Name] may receive compensation from lenders displayed.
```

---

## 9. Insurance & Bonding

### 9.1 Insurance Requirements by Platform Model

| Insurance Type | Information-Only | Lead-Gen / Referral | Licensed Broker |
|---|---|---|---|
| General Liability | Recommended | Required | Required |
| E&O / Professional Liability | Recommended | **Required** | **Required** |
| Cyber Liability | **Strongly Recommended** | **Required** | **Required** |
| Directors & Officers | Optional | Recommended | Required |
| Surety Bond | Not required | State-dependent | **Required** |

### 9.2 Errors & Omissions (E&O) Insurance

**What it covers:** Claims arising from professional mistakes, negligence, or failure to perform services.

**For the DSCR platform:**
- Covers claims that incorrect rate data led to financial loss
- Covers claims that lender recommendations were negligent
- Covers failure to properly disclose terms
- Typical coverage: $1M-$5M per claim

**Typical cost:** $2,000-$10,000/year for a fintech/mortgage technology company

### 9.3 Cyber Liability Insurance

**What it covers:** Data breaches, ransomware, wire fraud, and other cyber incidents.

**Critical for the DSCR platform because:**
- Platform collects and stores borrower financial data
- DSCR calculations involve sensitive property and financial information
- Cyber attacks on mortgage companies are frequent and costly

**Coverage should include:**
- First-party coverage (notification costs, credit monitoring, business interruption)
- Third-party coverage (liability to consumers, regulatory fines)
- Social engineering/wire fraud coverage

**Typical cost:** $3,000-$15,000/year depending on data volume and security posture

### 9.4 Surety Bonds

**When required:** If the platform obtains mortgage broker licenses, most states require surety bonds.

| Bond Amount | Typical States | Cost (Annual Premium) |
|---|---|---|
| $10,000-$25,000 | Smaller states | 1-3% of bond amount ($100-$750) |
| $25,000-$50,000 | Mid-size states | 1-3% ($250-$1,500) |
| $50,000-$100,000 | CA, NY, TX, FL | 1-3% ($500-$3,000) |

**Total for all 50 states:** $15,000-$50,000+ annually in bond premiums (if licensed nationally)

### 9.5 Technology E&O vs. Mortgage E&O

For the DSCR platform, consider:
- **Technology E&O**: Covers software/platform failures, coding errors, downtime claims
- **Mortgage E&O**: Covers mortgage-specific professional errors
- **Recommended:** Obtain BOTH, or a hybrid policy that covers technology services in the financial services context

---

## 10. Compliance Framework & Checklist

### 10.1 Pre-Launch Compliance Checklist

#### LEGAL STRUCTURE & LICENSING
- [ ] **Determine platform model** (information-only vs. lead-gen vs. broker)
- [ ] **Engage qualified legal counsel** with RESPA and mortgage compliance expertise
- [ ] **If lead-gen/referral model**: Determine state licensing requirements
- [ ] **If broker model**: Apply for NMLS licenses in required states
- [ ] **Register business entity** in operating states
- [ ] **Obtain NMLS company registration (MU1)** if applicable

#### RESPA COMPLIANCE
- [ ] **Design neutral ranking/recommendation algorithm** — no pay-for-placement
- [ ] **Document algorithm methodology** for regulatory examination
- [ ] **Structure lender compensation** as flat advertising fees (NOT per-referral)
- [ ] **Prepare RESPA-compliant lender agreements** with legal review
- [ ] **Disclose all lender compensation arrangements** to users
- [ ] **Implement audit trail** for all recommendations and referrals
- [ ] **Conduct RESPA risk assessment** annually

#### PRIVACY & DATA PROTECTION
- [ ] **Draft comprehensive privacy policy** (CCPA/CPRA and GLBA compliant)
- [ ] **Draft Terms of Service** with legal review
- [ ] **Implement GLBA Safeguards Rule compliance program**
- [ ] **Conduct data mapping** — know what data you collect, where it goes
- [ ] **Implement data encryption** at rest and in transit
- [ ] **Establish data retention and deletion policies**
- [ ] **Create consumer rights request process** (know, delete, opt-out)
- [ ] **Privacy notice at collection** before collecting personal information
- [ ] **Vendor/data processor agreements** with all third parties
- [ ] **Cookie consent and tracking disclosures**

#### FAIR LENDING
- [ ] **Conduct fair lending risk assessment** for platform algorithms
- [ ] **Document business justification** for recommendation criteria
- [ ] **Implement monitoring for disparate impact** in lender recommendations
- [ ] **Review geographic coverage** of lender network for bias
- [ ] **Establish fair lending policy** and training program
- [ ] **Annual fair lending testing** (statistical analysis)

#### ADVERTISING COMPLIANCE
- [ ] **Determine Reg Z applicability** (consumer vs. commercial credit)
- [ ] **Implement disclosure templates** for all rate displays
- [ ] **Include APR disclosures** where applicable
- [ ] **Add "not a lender" disclaimers** prominently
- [ ] **Disclose paid placements** clearly
- [ ] **Review all marketing copy** for prohibited claims
- [ ] **State-specific advertising disclosures** where required

#### AML / ANTI-FRAUD
- [ ] **Determine AML applicability** based on business model
- [ ] **If applicable**: Implement AML compliance program
- [ ] **Implement OFAC screening** for borrowers and lenders
- [ ] **Consider KYC procedures** for borrower verification (best practice)
- [ ] **Fraud detection procedures** for rate data and lender information

#### INSURANCE & BONDING
- [ ] **Obtain E&O / Professional Liability insurance** ($1M-$5M coverage)
- [ ] **Obtain Cyber Liability insurance** (data breach, wire fraud coverage)
- [ ] **Obtain General Liability insurance**
- [ ] **If licensed**: Obtain surety bonds per state requirements
- [ ] **Consider D&O insurance** for officers and directors

#### DATA SECURITY
- [ ] **Implement SOC 2 Type II compliance** (or equivalent)
- [ ] **Penetration testing** before launch
- [ ] **Vulnerability scanning** (ongoing)
- [ ] **Access controls** (role-based, least privilege)
- [ ] **Encryption standards** (AES-256 at rest, TLS 1.3 in transit)
- [ ] **Incident response plan** (documented and tested)
- [ ] **Business continuity / disaster recovery plan**
- [ ] **Employee security training**

#### RECORD KEEPING & AUDIT
- [ ] **Implement audit trail system** for all user interactions
- [ ] **Document all compliance decisions** and rationale
- [ ] **Retain records** per regulatory requirements (5 years typical)
- [ ] **Establish compliance calendar** for renewals, testing, training
- [ ] **Annual compliance review** with external counsel

### 10.2 Ongoing Compliance Calendar

| Activity | Frequency | Responsible |
|---|---|---|
| Privacy policy review | Annually | Legal/Compliance |
| Fair lending testing | Quarterly | Compliance/Data |
| RESPA compliance review | Annually | External Counsel |
| Algorithm audit | Semi-annually | Engineering/Compliance |
| Security penetration test | Annually | External Vendor |
| Employee compliance training | Annually | HR/Compliance |
| License renewals | Per state schedule | Legal/Operations |
| Insurance renewal | Annually | Operations |
| AML program review | Annually (if applicable) | Compliance |
| Data retention review | Semi-annually | IT/Compliance |
| Vendor compliance review | Annually | Compliance |
| OFAC list update screening | Continuous | Automated |

---

## 11. Implementation Roadmap

### Phase 1: Pre-Launch (4-6 weeks)
**Priority: Get the legal foundation right before a single user sees the platform**

1. **Engage mortgage compliance counsel** — specialist in RESPA and fintech
2. **Finalize business model** — information-only is safest for launch
3. **Draft privacy policy and terms of service** — GLBA + CCPA compliant
4. **Implement neutral algorithm** — document methodology thoroughly
5. **Build disclosure framework** — rate display templates, paid placement notices
6. **Obtain insurance** — E&O + Cyber at minimum
7. **Implement data security** — encryption, access controls, audit trails
8. **Build consumer rights request system** — CCPA compliance

### Phase 2: Soft Launch (Weeks 7-12)
**Priority: Validate compliance with real users**

1. **Monitor recommendation patterns** — check for bias
2. **Conduct initial fair lending analysis**
3. **Test consumer rights request processes**
4. **Refine disclosures based on user feedback**
5. **Document all compliance decisions**

### Phase 3: Monetization (Months 4-6)
**Priority: Revenue without RESPA violations**

1. **Design lender advertising program** — flat-fee, no pay-for-placement
2. **Draft RESPA-compliant lender agreements**
3. **Implement enhanced disclosures** for paid relationships
4. **Consider state licensing** for top markets (if referral model)
5. **Enhanced OFAC screening** if collecting borrower data for lenders

### Phase 4: Scale (Months 7-12)
**Priority: National expansion with compliance**

1. **Expand to additional states** — evaluate licensing needs
2. **Implement AML program** if required
3. **Pursue SOC 2 Type II certification**
4. **Establish compliance committee** with board reporting
5. **Annual external compliance audit**

---

## 12. Key Sources & References

### Regulatory Sources
| Source | URL | Relevance |
|---|---|---|
| CFPB RESPA Advisory Opinion (Feb 2023) | files.consumerfinance.gov | Direct guidance on comparison platforms |
| Regulation X (RESPA) | 12 CFR § 1024 | Core RESPA implementing regulation |
| Regulation Z (TILA) | 12 CFR § 1026 | Advertising and disclosure requirements |
| ECOA / Regulation B | 12 CFR § 1002 | Fair lending requirements |
| GLBA Privacy Rule | 12 CFR § 1016 | Financial data privacy |
| GLBA Safeguards Rule | 12 CFR § 1016, Subpart B | Data security requirements |
| FinCEN BSA/AML for Mortgage | FinCEN RIN 1506-AB07 | AML for mortgage companies |
| CCPA/CPRA | Cal. Civ. Code § 1798.100 et seq. | California consumer privacy |

### Industry Resources
| Resource | URL | Description |
|---|---|---|
| NMLS Resource Center | mortgage.nationwidelicensingsystem.org | State licensing requirements and checklists |
| Mayer Brown CFPB Analysis | mayerbrown.com | Analysis of CFPB RESPA advisory opinion |
| DWT RESPA Section 8 Analysis | dwt.com | Warning on digital mortgage kickback rules |
| InnReg ECOA Guide | innreg.com | Practical ECOA guide for fintechs |
| AARMR MSAs Guidance | aarmr.org | Marketing Service Agreements analysis |
| Harbor Compliance | harborcompliance.com | State-by-state mortgage licensing requirements |

### Search Research Sources (This Analysis)
- "CFPB Issues Guidance on Mortgage Comparison Shopping Platforms" — consumerfinancialserviceslawmonitor.com
- "CFPB Addresses RESPA Compliance for Digital Comparison-Shopping Platforms" — mayerbrown.com
- "CFPB Warns Mortgage Rate Comparison Sites About Anti-Kickback" — dwt.com
- "The Fair Lending Implications of Targeted Internet Marketing" — consumercomplianceoutlook.org
- "AI Lending and ECOA: Avoiding Accidental Discrimination" — UNC School of Law
- "Equal Credit Opportunity Act: A Practical Guide for Fintechs" — innreg.com
- "How To Comply with the Privacy of Consumer Financial Information Rule" — ftc.gov
- "The Mortgage Lenders' Guide to the CCPA" — sixfifty.com
- "KYC and AML Compliance for Fintechs: 2024 Guide" — castellum.ai
- "Bankrate State Licenses" — bankrate.com/licenses

---

## Appendix A: RESPA Compliance Decision Tree

```
START: Does the platform receive compensation from lenders?
│
├── NO → Platform is information-only
│   └── RESPA Section 8 does not apply
│   └── Still need: Privacy policy, Terms of service, Ad disclosures
│
└── YES → How is compensation structured?
    │
    ├── Flat advertising fee (not tied to referrals)
    │   ├── Is lender ranking/placement NEUTRAL?
    │   │   ├── YES → Likely RESPA-compliant (advertising model)
    │   │   │   └── Must: Disclose paid relationship clearly
    │   │   └── NO → RESPA VIOLATION RISK
    │   │       └── Must: Redesign algorithm for neutrality
    │   │
    │   └── Is the fee at fair market value?
    │       ├── YES → Likely compliant
    │       └── NO → Could be viewed as disguised referral fee
    │
    ├── Per-lead or per-referral fee
    │   └── HIGH RESPA RISK — Likely violation
    │       └── Consider: Restructure as flat advertising fee
    │
    └── Per-closed-loan fee
        └── RESPA VIOLATION — This IS a referral fee
            └── Must: Eliminate immediately or obtain broker license + comply
```

## Appendix B: Data Privacy Compliance Matrix

| Data Type | GLBA Notice Required | CCPA Right to Know | CCPA Right to Delete | Encryption Required | Retention Period |
|---|---|---|---|---|---|
| Property address | Yes | Yes | Yes | Recommended | Active + 3 years |
| Property value/rent | Yes | Yes | Yes | Recommended | Active + 3 years |
| DSCR calculation data | Yes | Yes | Yes | **Required** | Active + 3 years |
| Borrower name/email | Yes | Yes | Yes | **Required** | Active + 2 years |
| Borrower financial info | **Required** | Yes | Yes | **Required** | Active + 5 years |
| SSN (avoid collecting) | **Required** | Yes | Yes | **Required (AES-256)** | Minimum necessary |
| Credit data (avoid) | **Required** | Yes | Yes | **Required (AES-256)** | Minimum necessary |

## Appendix C: State Licensing Quick Reference (Top 10 States)

| State | License Type | Net Worth Req. | Surety Bond | Education Hours | Exam Required |
|---|---|---|---|---|---|
| California | Finance Lender/Broker | $25,000+ | $25,000+ | 20+8 state | Yes |
| Texas | Mortgage Broker | $25,000+ | $25,000+ | 20+3 state | Yes |
| Florida | Mortgage Broker | $25,000+ | $25,000+ | 20+2 state | Yes |
| New York | Mortgage Broker | $25,000+ | $25,000+ | 20+3 state | Yes |
| Illinois | Mortgage Broker | $25,000+ | $25,000+ | 20+3 state | Yes |
| Pennsylvania | Mortgage Broker | $25,000+ | $25,000+ | 20+2 state | Yes |
| Georgia | Mortgage Broker | $25,000+ | $25,000+ | 20+4 state | Yes |
| New Jersey | Mortgage Broker | $50,000+ | $50,000+ | 20+3 state | Yes |
| Ohio | Mortgage Broker | $25,000+ | $25,000+ | 20+2 state | Yes |
| Arizona | Mortgage Broker | $10,000+ | $10,000+ | 20+3 state | Yes |

---

## DISCLAIMER

This document is a research compilation and does not constitute legal advice. The DSCR Intelligence Platform team must engage qualified legal counsel with expertise in mortgage regulation, RESPA, and fintech compliance before implementing any business model or making compliance decisions. Regulatory requirements change frequently and vary by jurisdiction. The information herein is current as of the research date and may not reflect subsequent regulatory changes, enforcement actions, or guidance.

**Recommended Legal Counsel Specializations:**
1. RESPA / mortgage compliance attorney
2. Fintech regulatory attorney
3. Data privacy attorney (CCPA/CPRA + GLBA)
4. Fair lending compliance specialist

---

*End of DSCR Intelligence Platform Legal & Compliance Guide*
