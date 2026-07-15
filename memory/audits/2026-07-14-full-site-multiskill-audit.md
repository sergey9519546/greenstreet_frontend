---
class: auditor-output
audit_date: "2026-07-14"
target: "Greenstreet Finance website and supporting application"
status: DONE_WITH_CONCERNS
release_posture: CONDITIONAL_BLOCK
validation_status: NOT_RUN
---

# Full-Site Multiskill Audit and Repair Record

## Executive status

The audit program identified material SEO, GEO, identity, compliance, evidence, routing, accessibility, performance, and measurement risks. Parallel implementation lanes applied broad defensive repairs, but no post-change re-audit, test, build, live crawl, production request, or behavior validation was run. Original scores therefore remain historical baselines; this record does **not** claim that any score improved.

Search submission and stronger lender, broker, funding, licensing, pricing, customer-result, legal, or tax claims remain blocked until the relevant facts are verified and approved.

## Skills used

- `content-quality-auditor`
- `keyword-research`
- `serp-analysis`
- `competitor-analysis`
- `content-gap-analysis`
- `content-refresher`
- `seo-content-writer`
- `geo-content-optimizer`
- `entity-optimizer`
- `on-page-seo-auditor`
- `meta-tags-optimizer`
- `internal-linking-optimizer`
- `schema-markup-generator`
- `technical-seo-checker`
- `domain-authority-auditor`
- `backlink-analyzer`
- `rank-tracker`
- `performance-reporter`

`alert-manager` was recommended for a later phase after verified instrumentation and a clean baseline; it was not used in this audit.

## Provenance labels

- **Measured locally:** Counts, strings, paths, tags, route mappings, file sizes, and source/configuration behavior reported from repository inspection.
- **Observed publicly:** Public pages, search results, competitor patterns, and route retrieval behavior reported from live web research.
- **Estimated:** Audit scores, priorities, keyword difficulty, opportunity assessments, and projected readiness.
- **Reported implemented:** Changes described by implementation workers but not independently re-read or validated by the final reporter.
- **N/A:** Data requiring analytics, Search Console, backlink tools, rank tracking, production monitoring, legal records, licensing records, or verified owner input.

## Original highest-risk findings

1. **Wrong canonical identity:** Metadata, sitemap, robots, and route SEO pointed to `greenstreet.com`, an unrelated established organization, instead of the apparent Greenstreet Finance domain.
2. **Crawler-visible route failure:** Static hosts served the homepage document for inner and unknown routes, creating shared metadata, soft 404s, weak route retrieval, duplicate aliases, and unreliable indexing.
3. **Contradictory business identity:** The site variously described Greenstreet Finance as software, lender, broker, direct funder, in-house underwriter, marketplace, and lender-shopping service.
4. **Conflicting rates and inventory:** Homepage pricing conflicted, while program counts varied among seven, nineteen, and thirty-plus. Assumptions, dates, points, terms, and ownership were not controlled by one approved source.
5. **Unsupported customer proof:** Composite names, companies, testimonials, and precise outcomes appeared near “real results” language without permissioned evidence or reproducible methodology.
6. **Unsourced financial, legal, and tax claims:** State prepayment rules, tax treatment, rate expectations, eligibility thresholds, timelines, and documentation claims lacked adequate primary citations and professional review.
7. **Overbroad documentation claims:** “No income documentation” language blurred the distinction between borrower employment-income qualification and required credit, asset, reserve, entity, property, appraisal, insurance, and funds-source documentation.
8. **Weak on-page and entity signals:** The original homepage lacked an exact-keyword H1, authoritative citations, structured data, verified author/reviewer entities, consistent destinations, and adequate accessible naming.
9. **Technical and payload risks:** The original static homepage was large, script-heavy, media-heavy, lacked route-specific raw metadata, omitted structured data, and did not expose a complete reduced-motion strategy.
10. **Untrusted measurement:** Hard-coded analytics and consent identifiers had unverified ownership; analytics could load before consent; SPA page views, lead-funnel events, Web Vitals, Search Console, rank, backlink, GEO, and reporting baselines were absent or unavailable.

## Reported implementation groups

### Canonical, routing, metadata, schema, and hosting

- Standardized reported public URLs on `https://www.greenstreet.finance`.
- Added route-aware metadata, conservative JSON-LD, canonical route records, dynamic-slug allowlists, a noindexed Not Found page, Express 404 handling, alias redirects, sitemap expansion, crawler exclusions, and static security headers.
- Restored `/how-it-works` and `/partnerships`; reduced duplicate public URL families.
- Changed-file categories: static homepage metadata, route resolver, application shell, SEO registry/head component, 404 page, sitemap, robots, Express server, Vercel configuration, and Firebase configuration.

### Homepage content and accessibility

- Replaced the H1 with a DSCR-loan intent phrase and added an answer-first definition.
- Neutralized direct-lender, funding, universal-documentation, and exact-rate claims.
- Reframed named proof and outcomes as hypothetical composites.
- Corrected several destinations, accessible names, generic anchors, image alternatives, async decoding, and stable aspect-ratio behavior.
- Changed-file category: static homepage document.

### Identity, legal, support, careers, and proof

- Removed unverified founders, team, headquarters, backers, openings, direct-lender statements, underwriting/funding responsibility, unsupported contact channels, and purported customer outcomes.
- Replaced them with role-neutral scenario-analysis boundaries, transaction-specific disclosures, hypothetical educational scenarios, and future evidence standards.
- Changed-file categories: About, Legal, Support, Careers, Case Studies, and Partnerships/Broker Portal pages.

### Programs, products, and audience pages

- Removed conflicting program counts and unsupported lender, broker, partner, pricing, documentation, remote-closing, and eligibility promises.
- Reframed program values and page outputs as illustrative scenario parameters rather than current terms or approvals.
- Changed-file categories: program data, product metadata, Products, Platform, Solutions, Investors, Borrower Profiles, Non-US Investors, STR Hosts, Vacation Homes, and Brokers pages.

### Editorial, FAQ, calculator, and process content

- Replaced unverified individual bylines with an editorial-team byline.
- Added methodology, review-status, source-scope, correction, assumption, limitation, formula, worked-example, and primary-source scaffolding.
- Removed unsupported pricing, approval, legal, tax, timeline, and universal-threshold assertions.
- Changed-file categories: blog index/data, blog article template, How It Works, FAQ, DSCR Calculator, Rate Quiz, program matcher, and Deal Analyzer.

### State, tax, and quantitative tools

- Reframed outputs as illustrative and assumption-dependent; removed recommendation, approval, forecast, and universal-threshold language.
- Added nullable provenance fields and verification prompts while preserving reported formulas and interactions.
- Changed-file categories: state-law page/data, refinance, ARM, Monte Carlo, returns, tax, stress, decision-support, STR underwriting, and portfolio tools.

### Internal links, navigation, and motion

- Converted shared navigational CTAs to crawlable anchors while preserving SPA behavior.
- Standardized paths, removed public links to private portal tabs, aligned misleading CTAs, added landmarks and labels, and introduced reduced-motion behavior.
- Changed-file categories: site shell, navigation model, shared CTA/landing components, and global CSS.

### Analytics and monitoring foundation

- Disabled analytics and advertising tags by default, removed hard-coded identifiers, and added consent-denied defaults.
- Added environment-controlled loaders, event/property allowlists, PII-like data rejection, SPA page views, privacy-safe funnel events, bucketed calculation events, native LCP/CLS/INP collection, request IDs, categorized server logging, and a source-labeled SEO reporting script.
- Changed-file categories: homepage tag bootstrap, application entry/shell, qualification modal, lead route, server app, new analytics modules, environment examples, and reporting script.

## Remaining blockers

### Business identity and licensing

- Exact legal entity, DBA relationship, verified business role, domain ownership, and relationship between the apex and `www` host.
- Whether Greenstreet Finance is a lender, broker, correspondent, marketplace, software provider, or a disclosed combination.
- NMLS identifiers, licenses, jurisdictions served, Equal Housing obligations, regulatory disclosures, registered address, phone, official email, and official profiles.
- Verified leadership, founders, authors, reviewers, credentials, headquarters, founding date, backers, and product relationships.

### Programs, pricing, and customer evidence

- One approved, dated source of truth for program inventory, rates, FICO, LTV, DSCR, reserves, terms, points, loan size, property type, lock assumptions, prepayment structure, and owner.
- Permissioned customers, logos, testimonials, case-study records, measurement periods, source documents, methodology, and typical-results disclosures.

### Legal, tax, and model review

- Counsel review of every state rule, citation, applicability condition, effective date, privacy statement, business-purpose statement, prepayment interpretation, and transaction disclosure.
- Qualified tax review of current-law assumptions, rates, classifications, depreciation, recapture, NIIT, QBI, Section 179, and professional-status logic.
- Underwriting/pricing-owner approval of program assumptions.
- Quantitative validation of Monte Carlo, returns, stress, decision-support, and related models.
- Verified provenance, geography, update cadence, and data rights for STR seasonality or third-party data.

### Hosting and crawlability

- Static Vercel and Firebase hosts still reportedly return HTTP `200` and raw homepage metadata for unknown or inner SPA routes until JavaScript runs.
- Full crawler-visible route content, route-specific raw metadata, and true static-host 404 behavior require prerendering, SSR, or equivalent edge handling.
- Production redirects, response headers, SSL, robots behavior, sitemap delivery, indexing, and Core Web Vitals remain unvalidated.

### Accounts and measurement data

- Ownership and intended use of GA4, GTM, Google Ads, Vector, CookieYes, HubSpot origins, and the production domain.
- Consent categories, retention, privacy-policy alignment, internal-traffic exclusions, conversion definitions, and backend lead lifecycle.
- Search Console access and verified analytics, ranking, GEO, backlink, conversion, and Web Vitals exports.

## Known unresolved implementation issues

- The About page reportedly contains a `Read disclosures` card whose existing destination remains `/book-demo`; it should point to `/legal` after an approved follow-up edit.
- A prior code-review task identified a test-fixture issue in `src/engineService.test.ts`: the postMessage-failure fixture queues the intended task because an initial task remains in flight. The fixture was not corrected in this work.

## Validation boundary

No tests, builds, type checks, linters, live crawls, production requests, Search Console checks, analytics checks, schema validators, accessibility tests, browser/device tests, or Git operations were run for the implementation phase. Reported repairs must be re-audited before their effectiveness can be claimed.

## Handoff Summary

- **Status:** `DONE_WITH_CONCERNS`
- **Objective:** Consolidate the full-site multiskill audit and parallel repair program into a durable record.
- **Key Findings / Output:** High-risk canonical, crawlability, identity, claims, evidence, compliance, accessibility, and measurement issues were identified; broad defensive repairs were reported across source, content, hosting, and analytics categories.
- **Evidence:** Repository findings were **Measured locally**; public/competitor findings were **Observed publicly**; scores and priorities were **Estimated**; implementation outcomes are **Reported implemented** and not validated.
- **Assumptions:** `https://www.greenstreet.finance` appears to be the intended public origin, but ownership and canonical policy still require confirmation.
- **Open Loops:** Business identity, licensing, pricing/program truth, customer evidence, legal/tax/model review, static-host rendering, account ownership, measurement baselines, the About-page destination mismatch, and the engine-service test fixture.
- **Recommended Next Skill:** Re-run `technical-seo-checker`, `content-quality-auditor`, and `performance-reporter` only after owner facts are supplied and validation is authorized.

