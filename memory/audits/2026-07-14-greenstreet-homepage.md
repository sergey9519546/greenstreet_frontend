---
class: auditor-output
runbook_version: "9.9.10"
target: "index.html"
audit_date: "2026-07-14"
content_type: "Landing Page"
status: DONE_WITH_CONCERNS
objective: "Audit the Greenstreet Finance homepage against all 80 CORE-EEAT content-quality criteria."
key_findings:
  - title: "Conflicting best-tier rate claims"
    severity: veto
    evidence: "The page presents both 6.125% and 6.25%-6.75% for substantially the same 740+ FICO and up-to-75% LTV profile."
  - title: "Major financial and legal-adjacent claims lack source mapping"
    severity: high
    evidence: "No external citations were detected for rate, lender-count, closing-time, or state-rule claims."
  - title: "Accountable expertise is not visible"
    severity: high
    evidence: "The page has no named author, reviewer, credentials, licensing context, or editorial review label."
  - title: "Social proof is composite rather than independently verifiable"
    severity: high
    evidence: "Homepage testimonials are explicitly labeled as composites based on Greenstreet broker data."
  - title: "Extractable answer structure is incomplete"
    severity: medium
    evidence: "No summary box, structured FAQ, comparison table, or JSON-LD was detected."
evidence_summary: "Static analysis of local index.html: approximately 1,298 visible words, title/meta/canonical, first-fold copy, 26 headings, section text, internal/external links, images and alt text, forms, disclosures, and structured-data scripts. No live crawl, backlink tool, search-volume source, or deployed HTTPS verification was available."
open_loops:
  - "R10 failed: reconcile 6.125% and 6.25%-6.75% rate claims before publication."
  - "Add source, methodology, assumptions, and effective dates beside financial and state-law claims."
  - "Add named expert and compliance review, editorial policy, and correction/update policy."
  - "Replace composites with permissioned case evidence or publish an aggregate-testimonial methodology."
  - "Add a concise summary, FAQ, comparison table, and matching structured data."
recommended_next_skill: "seo-content-writer"
cap_applied: true
raw_overall_score: 50
final_overall_score: 50
---

# Greenstreet Homepage CORE-EEAT Audit

## Publish Verdict

BLOCK until the conflicting rate claims are reconciled. One critical consistency failure activates the trust ceiling, although the weighted score is already below that ceiling.

## Audit Setup

- Target: `index.html`
- Content type: Landing Page
- Visible word count: approximately 1,298
- Landing-page minimum: 150 words
- Evidence mode: static local-page analysis
- Unavailable evidence: live HTTPS, backlink profile, search volume, knowledge graph, and external entity consistency

## Critical Trust Check

| Check | Result | Evidence |
|---|---:|---|
| C01 Intent Alignment | 10 | The title and page both deliver DSCR lending, rent qualification, program matching, and state-rule analysis. |
| T04 Disclosure Statements | 5 | No external affiliate links were detected; positive disclosure compliance cannot be verified. |
| R10 Content Consistency | 0 | `6.125%` and `6.25%-6.75%` are both presented as best-tier rates for substantially the same borrower profile. |

## Dimension and System Scores

| Dimension | Score | Landing Weight | Weighted Contribution |
|---|---:|---:|---:|
| C - Contextual Clarity | 80 | 20% | 16.00 |
| O - Organization | 45 | 10% | 4.50 |
| R - Referenceability | 40 | 5% | 2.00 |
| E - Exclusivity | 55 | 5% | 2.75 |
| Exp - Experience | 65 | 5% | 3.25 |
| Ept - Expertise | 55 | 5% | 2.75 |
| A - Authority | 20 | 25% | 5.00 |
| T - Trust | 55 | 25% | 13.75 |
| **Weighted total** | | | **50/100** |

- GEO score: 55/100
- SEO score: 48/100
- Raw weighted score: 50/100
- Final score: 50/100

## Complete 80-Item Scorecard

### C - Contextual Clarity

| ID | Check | Result | Points | Evidence |
|---|---|---|---:|---|
| C01 | Intent Alignment | Pass | 10 | Title promise matches the DSCR lending and analysis content. |
| C02 | Direct Answer | Pass | 10 | First fold immediately explains rent-based qualification, program fit, and state-rule risk. |
| C03 | Query Coverage | Pass | 10 | Covers DSCR loans, rental financing, rates, lender matching, state rules, and buying power. |
| C04 | Definition First | Partial | 5 | DSCR, LTV, FICO, and Track 2 are not defined at first use. |
| C05 | Topic Scope | Pass | 10 | Disclosures define business-purpose, non-owner-occupied use and estimate limitations. |
| C06 | Audience Targeting | Pass | 10 | Rental investors, brokers, non-US investors, and borrower profiles are explicit. |
| C07 | Semantic Coherence | Pass | 10 | Qualification, pricing, matching, rules, proof, and conversion follow logically. |
| C08 | Use Case Mapping | Pass | 10 | Separate tools address buying power, rate preview, state rules, and full underwriting. |
| C09 | FAQ Coverage | Fail | 0 | No structured homepage FAQ is present. |
| C10 | Semantic Closure | Partial | 5 | Demo CTAs give next steps but do not summarize the opening promise. |

### O - Organization

| ID | Check | Result | Points | Evidence |
|---|---|---|---:|---|
| O01 | Heading Hierarchy | Pass | 10 | One H1 with primarily H2 sections and H3 resource/footer headings. |
| O02 | Summary Box | Fail | 0 | No key-takeaways or how-it-works summary appears. |
| O03 | Data Tables | Fail | 0 | Rates, programs, and criteria are cards/prose rather than accessible tables. |
| O04 | List Formatting | Partial | 5 | Visual card groups exist, but semantic list structure is inconsistent. |
| O05 | Schema Markup | Fail | 0 | No JSON-LD was detected. |
| O06 | Section Chunking | Pass | 10 | Sections generally have one purpose and concise copy. |
| O07 | Visual Hierarchy | Pass | 10 | Metrics, headings, callouts, and CTAs emphasize key concepts. |
| O08 | Anchor Navigation | Fail | 0 | No table of contents, breadcrumbs, or section jumps. |
| O09 | Information Density | Partial | 5 | Core copy is focused, but duplicated navigation and repeated CTAs add noise. |
| O10 | Multimedia Structure | Partial | 5 | Useful media exists, but many images lack alt text or captions. |

### R - Referenceability

| ID | Check | Result | Points | Evidence |
|---|---|---|---:|---|
| R01 | Data Precision | Pass | 10 | Includes rates, FICO/LTV limits, timing, state counts, and operational metrics. |
| R02 | Citation Density | Fail | 0 | No external citations were detected. |
| R03 | Source Hierarchy | Fail | 0 | No primary-source links support rate sheets, laws, or underwriting claims. |
| R04 | Evidence-Claim Mapping | Fail | 0 | Core claims are not immediately followed by evidence. |
| R05 | Methodology Transparency | Partial | 5 | Mentions a June 2026 rate-sheet pull and monthly updates without methods. |
| R06 | Timestamp and Versioning | Partial | 5 | June 2026 appears, but no page update date or revision history exists. |
| R07 | Entity Precision | Pass | 10 | Brand, products, personas, and testimonial organizations are named. |
| R08 | Internal Link Graph | Partial | 5 | Broad topic links exist, but several labels and destinations do not match. |
| R09 | HTML Semantics | Partial | 5 | Headings and sections exist; machine-readable content semantics are limited. |
| R10 | Content Consistency | Fail | 0 | Rate claims conflict and some navigation mappings are misleading. |

### E - Exclusivity

| ID | Check | Result | Points | Evidence |
|---|---|---|---:|---|
| E01 | Original Data | Partial | 5 | Composite broker data is claimed but no citable dataset is published. |
| E02 | Novel Framework | Partial | 5 | Track 2 and integrated analysis are differentiated but not formally defined. |
| E03 | Primary Research | Fail | 0 | No documented study design, sample size, or controls. |
| E04 | Contrarian View | Partial | 5 | Lender qualification is distinguished from investor survival without full evidence. |
| E05 | Proprietary Visuals | Pass | 10 | Interactive calculators, state maps, dashboards, and product visuals are present. |
| E06 | Gap Filling | Partial | 5 | The combined pricing, matching, state-law, and cash-flow workflow is differentiated. |
| E07 | Practical Tools | Pass | 10 | Buying-power, rate-preview, calculator, and state-rule tools are available. |
| E08 | Depth Advantage | Partial | 5 | Tool breadth is strong, but superiority over alternatives is not demonstrated. |
| E09 | Synthesis Value | Pass | 10 | Combines lending, compliance, state law, and property-investment analysis. |
| E10 | Forward Insights | Fail | 0 | No data-backed market forecast or forward rate analysis. |

### Exp - Experience

| ID | Check | Result | Points | Evidence |
|---|---|---|---:|---|
| Exp01 | First-Person Narrative | Pass | 10 | Company-action language describes pricing, structuring, and funding. |
| Exp02 | Sensory Details | Fail | 0 | Little tangible or sensory experiential language. |
| Exp03 | Process Documentation | Partial | 5 | Five checks and a general workflow appear without a reproducible timeline. |
| Exp04 | Tangible Proof | Partial | 5 | Product visuals lack timestamps, annotations, and provenance. |
| Exp05 | Usage Duration | Fail | 0 | Platform or methodology usage duration is not stated. |
| Exp06 | Problems Encountered | Pass | 10 | Addresses paperwork, portal uncertainty, compliance spreadsheets, and handoffs. |
| Exp07 | Before/After Comparison | Pass | 10 | Claims 40 minutes reduced to under five and a spreadsheet replaced by the engine. |
| Exp08 | Quantified Metrics | Pass | 10 | Multiple measurable rates, timings, volumes, and thresholds are provided. |
| Exp09 | Repeated Testing | Partial | 5 | Monthly volume implies repeated use, but no testing method is documented. |
| Exp10 | Limitations Acknowledged | Pass | 10 | Estimate, underwriting, legal, and non-commitment limitations are explicit. |

### Ept - Expertise

| ID | Check | Result | Points | Evidence |
|---|---|---|---:|---|
| Ept01 | Author Identity | Fail | 0 | No individual author or accountable content owner appears. |
| Ept02 | Credentials Display | Fail | 0 | No licenses, certifications, or professional qualifications are displayed. |
| Ept03 | Professional Vocabulary | Pass | 10 | DSCR, FICO, LTV, prepayment, reserves, and underwriting language is accurate. |
| Ept04 | Technical Depth | Pass | 10 | Thresholds, borrower tiers, assumptions, and dependencies are actionable. |
| Ept05 | Methodology Rigor | Partial | 5 | The public explanation is not reproducible. |
| Ept06 | Edge Case Awareness | Pass | 10 | State, property, reserves, non-US, STR, and underwriting exceptions appear. |
| Ept07 | Historical Context | Partial | 5 | A 2021 spreadsheet reference appears without broader field history. |
| Ept08 | Reasoning Transparency | Partial | 5 | Some why/tradeoff explanations exist; most recommendations lack visible reasoning. |
| Ept09 | Cross-Domain Integration | Pass | 10 | Lending, compliance, law, cash flow, and property analysis are connected. |
| Ept10 | Editorial Process | Fail | 0 | No reviewed-by, fact-checked-by, legal-review, or compliance-review label. |

### A - Authority

| ID | Check | Result | Points | Evidence |
|---|---|---|---:|---|
| A01 | Backlink Profile | N/A | - | Requires external backlink data. |
| A02 | Media Mentions | Fail | 0 | No identifiable media coverage or publication references appear. |
| A03 | Industry Awards | Fail | 0 | No relevant awards or independent recognition are shown. |
| A04 | Publishing Record | Fail | 0 | No conference, research, publication, or industry contribution record. |
| A05 | Brand Recognition | N/A | - | Requires market-awareness or search-volume data. |
| A06 | Social Proof | Partial | 5 | Testimonials are composites rather than independently verifiable accounts. |
| A07 | Knowledge Graph Presence | N/A | - | Requires external entity verification. |
| A08 | Entity Consistency | N/A | - | Requires cross-site verification. |
| A09 | Partnership Signals | Partial | 5 | Logos appear, but many lack labels or relationship context. |
| A10 | Community Standing | N/A | - | Requires external professional-community evidence. |

### T - Trust

| ID | Check | Result | Points | Evidence |
|---|---|---|---:|---|
| T01 | Legal Compliance | Pass | 10 | Privacy, terms, cookies, and data-security links appear. |
| T02 | Contact Transparency | Partial | 5 | Support is linked, but no address or second visible contact method appears. |
| T03 | Security Standards | N/A | - | Local analysis cannot verify live HTTPS enforcement. |
| T04 | Disclosure Statements | Partial | 5 | No affiliate links were detected; positive compliance is unverified. |
| T05 | Editorial Policy | Fail | 0 | No content standards or review policy is linked. |
| T06 | Correction and Update Policy | Fail | 0 | No correction mechanism, changelog, or revision history appears. |
| T07 | Ad Experience | Pass | 10 | No third-party advertising was detected. |
| T08 | Risk Disclaimers | Pass | 10 | Lending, estimate, legal, and non-commitment disclosures are strong. |
| T09 | Review Authenticity | Partial | 5 | Composite labeling is transparent, but testimonials are not independently attributable. |
| T10 | Customer Support | Partial | 5 | Support exists without a complaint process or response SLA. |

## Findings by Severity

### Critical

- Reconcile the two best-tier rate claims and document any differences in product, points, lock period, assumptions, source, and effective date.

### High

- Add primary-source and methodology support beside financial and state-law claims.
- Add named authorship, credentials, licensing context, and expert/compliance review.
- Replace composite testimonials with permissioned cases or publish aggregate-study methodology.
- Publish editorial, corrections, and update policies.

### Medium

- Add a summary box, structured FAQ, comparison tables, and matching JSON-LD.
- Correct mismatched navigation labels and destinations.
- Add informative alt text and captions to meaningful visuals.

## Prioritized Action Plan

1. Reconcile the `6.125%` and `6.25%-6.75%` claims before publication.
2. Add source, methodology, assumptions, and effective dates beside each major metric.
3. Add accountable author/reviewer credentials and editorial/corrections policies.
4. Replace composite social proof with verifiable case evidence.
5. Add extractable summary, FAQ, tables, and structured data.

