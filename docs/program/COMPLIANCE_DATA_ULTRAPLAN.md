# GreenStreet Compliance, Data, and Model-Validation Ultraplan

Status: planning baseline only

Prepared from: repository evidence available July 28, 2026

Scope: business identity, mortgage/compliance applicability, data governance, financial-model validation, privacy/security, content substantiation, and release evidence

Implementation authority: none granted by this document

## 1. Executive decision

GreenStreet must keep every current reliability hold in place until the corresponding release dossier is complete and approved by all mandatory human reviewers. A passing automated test suite is necessary but never sufficient to release a legal, tax, pricing, program-eligibility, underwriting, or probabilistic recommendation.

The current repository already follows the correct high-level safety posture:

- the public DSCR surface is limited to labeled deterministic arithmetic;
- fourteen tool/workspace definitions in `src/components/toolReliabilityHolds.ts` explicitly withhold unverified output;
- the structure-optimizer and state-rule API routes return a `503 TOOL_RELIABILITY_HOLD`;
- the public lead route accepts a strict payload and the browser cannot write the `leads` collection directly;
- the Legal page expressly says that business identity, licensing, state availability, privacy channels, and some counterparty facts remain unverified.

This program does not authorize removing those controls. It defines the evidence required before any future removal.

## 2. Evidence boundary and anti-hallucination rules

### 2.1 Current evidence

The plan is grounded in these current repository artifacts:

- `src/components/toolReliabilityHolds.ts`
- `src/components/toolReliabilityHolds.test.ts`
- `src/App.tsx`
- `src/routes/dscr.ts`
- `src/routes/leads.ts`
- `src/routes/leads.test.ts`
- `src/routes/schemas.ts`
- `src/pages/LegalPage.tsx`
- `src/engine/`
- `src/data/dscrPrograms.ts`
- `src/firebase.ts`
- `src/services/firebaseAdmin.ts`
- `firestore.rules`
- `docs/RELEASE_AUDIT_2026-07-25.md`
- `docs/audit-2026-07-23/04-security.md`
- `docs/audit-2026-07-23/05-engine-correctness.md`
- `docs/audit-2026-07-23/07-content-compliance.md`

Historical specifications and prior audits are leads to investigate, not proof that a feature, dataset, test, legal interpretation, or operating process is current.

### 2.2 Quarantined skill content

Two mortgage-specific skills may be used only as methodology:

- `mortgage-fintech-audit`: useful for checklists covering dual-track DSCR, program matrices, ARM schedules, probabilistic modeling, fair-lending risk, and adverse-action boundaries. Its embedded file names, test counts, personas, model parameters, lender facts, legal assertions, dates, and “verified” implementation claims are not GreenStreet evidence. Every such statement is quarantined until independently reproduced against current code and primary sources.
- `mortgage-compliance`: useful as a topic checklist for TILA/Regulation Z, RESPA, ECOA/Regulation B, Fair Housing, GLBA/Regulation P, state licensing, disclosures, and privacy. It belongs to a different mortgage organization. Its company identity, licensed-state list, license numbers, role assumptions, and consumer-mortgage applicability are prohibited from GreenStreet deliverables.

No skill may establish law, licensing, a lender guideline, a tax rule, or a model calibration merely by stating it.

### 2.3 Source hierarchy

For legal and regulatory claims, use controlling primary authority first:

1. enacted statute or session law;
2. current eCFR or official agency rule/order;
3. official state code, regulator bulletin, licensing database, or attorney-general source;
4. official commentary or examination guidance;
5. signed opinion from GreenStreet's counsel;
6. secondary legal analysis only as research support.

For lender and pricing claims, use the responsible provider's authenticated, dated rate sheet, program guide, amendment, or written confirmation. Aggregator pages and remembered guidelines are not release evidence.

For tax claims, use current Code/regulations, IRS publications/forms/instructions where appropriate, state primary authority, and a signed tax-professional validation memo.

For financial and statistical models, use original datasets, official series, peer-reviewed or field-standard methods, and an independent reproducible calculation. Search method, inclusion criteria, rejected sources, retrieval date, and conflicts must be retained.

If a source cannot be independently verified, it fails the gate. “Probably current” and “difficult to verify” are not accepted statuses.

## 3. Program roles and human authorities

An agent may prepare evidence, tests, and draft findings. Only a named human can accept regulated or professional conclusions.

| Role | Accountable responsibility | Cannot delegate to an agent |
|---|---|---|
| Executive product owner | Defines GreenStreet's actual business model, products, jurisdictions, risk appetite, and final launch decision | Business identity and final go/no-go |
| Corporate counsel | Verifies legal entity, assumed names, address, contracting entity, terms, limitation language, and corporate role | Legal identity approval |
| Mortgage licensing/compliance counsel or CCO | Determines lender/broker/software/lead-generator role, NMLS and state-license obligations, advertising rules, application boundaries, disclosures, recordkeeping, and state availability | Licensing and mortgage-law approval |
| Fair-lending counsel/qualified fair-lending officer | Reviews ECOA, Fair Housing, UDAAP, protected-class/proxy use, segmentation, routing, disparate-treatment risks, and adverse-action workflow | Fair-lending approval |
| Privacy counsel or accountable privacy officer | Approves notices, consent, retention, deletion, vendor sharing, incident response, and state privacy rights | Privacy approval |
| Tax professional (CPA, EA, or tax attorney as appropriate) | Validates federal and state tax assumptions and every tax golden case | Tax-model approval |
| Head of underwriting/credit policy | Owns DSCR definitions, income hierarchy, eligibility policy, exception policy, and provider alignment | Underwriting-policy approval |
| Pricing/program data owner | Owns authenticated lender guides/rate sheets, changes, expiry, withdrawals, and production publication | Current pricing/program approval |
| Independent model validator | Recomputes formulas and challenges assumptions without being the model author | Model-validation opinion |
| Security owner | Approves Firebase architecture, access rules, secrets, logging, retention controls, threat model, and incident response | Security release approval |
| QA/release owner | Owns traceable test evidence, environment verification, rollback drill, and release dossier completeness | Release-evidence certification |
| Content substantiation owner | Holds source evidence for claims, case studies, testimonials, counts, affiliations, and “real result” language | Claim substantiation |

The final release authority is a two-key decision: the executive product owner plus the relevant domain approver. Legal/tax/security/model validators may block but may not be overruled by an agent.

## 4. Skill-to-subagent operating model

Use specialist subagents in bounded, auditable work packages. Each subagent produces evidence and a verdict; it does not silently edit production or lift a hold.

| Subagent | Required skills | Output | Human validator |
|---|---|---|---|
| Program integrator and evidence controller | `deliver-launch-checklist`, `validate-data` | Master dependency graph, artifact register, decisions, release dossiers | QA/release owner |
| Business identity and regulatory researcher | `deep-research` fact-check mode, `mortgage-compliance` methodology only, `content-quality-auditor` | Identity dossier, applicability matrix, licensing matrix, disclosure and claims registers | Corporate counsel, licensing counsel/CCO |
| Fair-lending and adverse-action reviewer | `mortgage-fintech-audit` methodology only, `mortgage-compliance` methodology only, `deep-research` | Field-purpose map, proxy-risk assessment, routing policy, adverse-action boundary decision | Fair-lending counsel/CCO |
| Pricing/program/state data steward | `analyze-data-quality`, `deep-research`, `validate-data` | Source registry, program schema, state-law registry, freshness and conflict report | Pricing owner, underwriting owner, counsel |
| Deterministic model validator | `tdd`, `validate-data`, `mortgage-fintech-audit` methodology only | Canonical calculation spec, independent reference workbook/code, golden/boundary/metamorphic tests | Independent model validator |
| Probabilistic model validator | `analyze-data-quality`, `validate-data`, `tdd`, scientific/primary-source research | Calibration dataset report, model card, backtest, uncertainty and reproducibility package | Independent model validator |
| Privacy and Firebase red team | `firebase-security-rules-auditor`, `analyze-data-quality`, `tdd` | Data map, threat model, emulator attack suite, access/retention/deletion evidence | Security owner, privacy officer |
| Content and advertising auditor | `content-quality-auditor`, `deep-research`, `mortgage-compliance` methodology only | Page-level claim ledger and publish/block verdicts | Content owner, counsel/CCO |

Execution rules:

- Read-only discovery agents may run in parallel.
- A validator must not validate their own implementation.
- Each output must identify sources, as-of dates, assumptions, unresolved contradictions, confidence, and the exact commit/data version reviewed.
- Implementation agents work only after the relevant human-approved specification exists.
- Agents that touch overlapping code or evidence files run sequentially or in isolated worktrees.
- A subagent's “pass” is advisory until the named human validator signs.

## 5. Required artifact system

The following are proposed execution artifacts. Their paths describe the future program structure; their mention here does not mean they exist or are approved.

| Artifact | Proposed path | Owner | Validator |
|---|---|---|---|
| Program charter and RACI | `docs/program/charter/RACI.md` | Program integrator | Executive owner |
| Business identity dossier | `docs/program/legal/BUSINESS_IDENTITY_DOSSIER.md` | Identity researcher | Corporate counsel |
| Regulatory applicability matrix | `docs/program/legal/REGULATORY_APPLICABILITY_MATRIX.csv` | Compliance researcher | Licensing counsel/CCO |
| Licensing/state availability matrix | `docs/program/legal/LICENSING_MATRIX.csv` | Compliance researcher | Licensing counsel/CCO |
| Disclosure register | `docs/program/legal/DISCLOSURE_REGISTER.csv` | Compliance researcher | Counsel/CCO |
| Adverse-action boundary memo | `docs/program/legal/ADVERSE_ACTION_BOUNDARY.md` | Fair-lending reviewer | Fair-lending counsel |
| Privacy data map and record inventory | `docs/program/privacy/DATA_MAP.md` | Privacy/security agent | Privacy officer |
| Retention/deletion schedule | `docs/program/privacy/RETENTION_SCHEDULE.csv` | Privacy officer | Privacy counsel |
| Claims and substantiation ledger | `docs/program/content/CLAIMS_LEDGER.csv` | Content auditor | Content owner and counsel |
| Source registry | `docs/program/data/SOURCE_REGISTRY.csv` | Data steward | Domain owners |
| Data dictionary | `docs/program/data/DATA_DICTIONARY.md` | Data steward | Underwriting/model validator |
| Program/rate change log | `docs/program/data/PROGRAM_CHANGELOG.csv` | Pricing owner | Underwriting owner |
| State-law source registry | `docs/program/data/STATE_LAW_REGISTRY.csv` | Legal researcher | Counsel |
| Model inventory | `docs/program/models/MODEL_INVENTORY.csv` | Model-validation lead | Independent validator |
| Canonical calculation specification | `docs/program/models/CANONICAL_CALCULATION_SPEC.md` | Underwriting owner | Independent validator |
| Model card per tool | `docs/program/models/cards/<tool>.md` | Model owner | Independent validator |
| Golden-case files | `tests/fixtures/golden/<tool>/*.json` | QA/model agent | Domain owner and validator |
| Independent expected results | `docs/program/models/reference/<tool>.*` | Independent validator | Domain reviewer |
| Security threat model | `docs/program/security/THREAT_MODEL.md` | Security agent | Security owner |
| Firebase rules audit | `docs/program/security/FIREBASE_RULES_AUDIT.json` | Firebase red team | Security owner |
| Release dossier per tool | `docs/program/releases/<tool>/RELEASE_DOSSIER.md` | Program integrator | All required signers |
| Release decision log | `docs/program/releases/DECISION_LOG.csv` | Release owner | Executive owner |
| Rollback/runbook | `docs/program/releases/ROLLBACK_RUNBOOK.md` | Release owner | Security/operations owner |

Every source-registry record must include:

- unique source ID and source type;
- primary URL or controlled document location;
- publisher/provider and jurisdiction;
- retrieval date, published date, effective-from date, effective-through date if known;
- document version, checksum, and superseded-by relationship;
- exact fields/claims/models that depend on it;
- named owner, reviewer, review date, next-review/expiry date;
- confidentiality/access class and redistribution limits;
- verification status, conflicts, and resolution notes.

Expired, withdrawn, contradictory, inaccessible, or incomplete sources automatically withhold the dependent output.

## 6. Phase plan and human gates

### Phase 0 — Baseline, freeze, and traceability

Work packages:

1. Record the reviewed commit, environments, route inventory, tool-hold inventory, tests, APIs, datasets, and public claims.
2. Create a model inventory separating deterministic arithmetic, policy rules, lookup data, ranking, recommendation, and probabilistic output.
3. Map every public number and conclusion to its code path, inputs, source, and owner.
4. Treat prior audits as findings to reconcile, not current truth.
5. Define severity: critical invalidates a core decision or creates legal/privacy/security exposure; high can materially mislead; medium is bounded and disclosed; low is cosmetic.

Gate 0:

- all fourteen current holds are accounted for;
- no route, API, sitemap, or metadata change exposes a held output;
- the released DSCR arithmetic baseline is captured without changing its public contract;
- every proposed work item has an owner, validator, dependency, and evidence artifact.

### Phase 1 — Business identity and legal applicability

Work packages:

1. Obtain formation records, exact legal name, DBA/brand authority, physical and mailing address, contact channels, responsible counterparty, ownership of the website, and contracting entity.
2. Have counsel classify GreenStreet's actual role for each journey: software publisher, educator, marketing service, lead generator, broker, lender, servicer, or another role.
3. Determine whether and when a visitor interaction becomes an inquiry, prequalification, application, completed application, credit decision, referral, or advertisement.
4. Determine federal and state applicability for business-purpose, investment-property, entity, individual, 1–4 unit, mixed-use, STR, and foreign-national scenarios. “Business purpose” is not a blanket exemption.
5. Verify NMLS records, responsible individual/company identifiers, state license/registration/exemption status, authorized jurisdictions, and required state-specific disclosures from official records.
6. Reconcile footer, About, Legal, intake consent, products, case studies, lender/partner language, email domains, and responsible-provider wording to one counsel-approved identity block.
7. Build the disclosure register for website, advertising, intake, estimate, privacy, electronic consent, licensing, equal housing/fair lending, and responsible-provider disclosures.

Gate 1:

- counsel-signed identity and role memo exists;
- every jurisdiction is `AUTHORIZED`, `NOT AUTHORIZED`, or `COUNSEL REVIEW REQUIRED`;
- NMLS/license claims match official records and include verification dates;
- the site makes no lender, broker, funding, partnership, state-availability, or response-time claim that exceeds the approved identity block;
- unresolved identity means no financing solicitation and no expansion of lead intake.

### Phase 2 — Fair lending, UDAAP, advertising, and adverse-action boundaries

Work packages:

1. Inventory every field, derived feature, segment, persona, ranking factor, recommendation, CTA, routing rule, and marketing audience.
2. Classify each by purpose, necessity, source, user visibility, protected-class/proxy risk, retention, and downstream consumers.
3. Review nationality/foreign-national status, geography, property location, borrower type, FICO band, experience, role, and similar fields for legitimate business need, consistent treatment, proxy risk, and advertising restrictions.
4. Prohibit collection or use of protected traits unless counsel documents the lawful purpose and controls. Non-disclosure must not create a worse score or route.
5. Test matched-pair scenarios and reason-code stability. A field that does not lawfully affect a decision must not alter eligibility, price, priority, or service.
6. Review all “qualify,” “match,” “approved,” “best,” “lowest,” “current,” “legal,” “verified,” “funded,” “real results,” rate, savings, and performance claims under UDAAP and advertising standards.
7. Define the adverse-action boundary before any eligibility/ranking tool is activated:
   - educational calculators do not approve or deny;
   - the scenario-review intake must not silently become a credit application;
   - no agent or model issues adverse action;
   - any actual application or credit decision routes to the responsible licensed provider;
   - the provider owns completeness, decision reason codes, notice timing/content, record retention, and dispute/correction procedures;
   - protected traits and unapproved proxies never appear in reason codes;
   - conditional or unsupported cases route to human review, not automatic rejection.

Gate 2:

- fair-lending counsel approves the field-purpose and routing matrix;
- matched-pair and non-disclosure tests pass;
- every material advertising claim has substantiation;
- application/adverse-action responsibility is assigned in writing;
- ambiguous behavior fails closed to education or human review.

### Phase 3 — Data provenance and change governance

Use `analyze-data-quality` for the source data and `validate-data` for every analysis or release conclusion.

Work packages:

1. Establish the intended grain and key for every dataset:
   - lender + program + purpose + occupancy + property type + state + FICO/LTV/DSCR band + term + prepay structure + effective period for program matrices;
   - jurisdiction + citation + rule type + transaction/effective period for state law;
   - series + geography + frequency + observation/release/vintage date for market data;
   - scenario + model version + input version + seed for model results.
2. Profile completeness, uniqueness, validity, consistency, referential integrity, freshness, volume, and distribution.
3. Detect duplicate matrix rows, overlapping eligibility bands, unit mismatches, impossible ranges, missing states, null effective dates, conflicting providers, stale rates, and silent schema drift.
4. Normalize percentages and basis points, monthly and annual values, dollars and ratios, timezone/cutoff rules, missing-value semantics, and `unknown` versus `not applicable`.
5. Require authenticated lender documents. Store received/effective/expiry dates, source hash, reviewer, product owner, and withdrawal status.
6. Require transaction-date-aware state-law evaluation. Future-effective law never applies early; repealed or expired law never remains current; no source/counsel review means `UNKNOWN` and no conclusion.
7. Add freshness service-level objectives by source class. Expiry disables the dependent result rather than displaying stale “current” data.
8. Require a four-eyes change process: data owner proposes, independent reviewer checks, release owner promotes, audit trail records both versions.

Gate 3:

- critical/high data-quality findings are resolved;
- every production value traces to a non-expired source record;
- schemas reject unknown enum values and unsupported jurisdictions;
- historical versions remain reproducible;
- conflict resolution is written and signed by the relevant domain owner.

### Phase 4 — Privacy, lead intake, and Firebase security

Current controls to preserve:

- strict Zod lead schema;
- body-size and origin checks;
- required contact consent;
- honeypot handling;
- generic responses;
- no browser access to `leads`;
- no SSN, bank-account, or identity-document collection;
- no full provider error or PII logging.

Work packages:

1. Map name, email, phone, state, FICO band, borrower type, experience, deal data, auth identity, deals, artifacts, and audit logs from collection through deletion.
2. Identify controller/service-provider roles, recipients, storage regions, contracts, retention, legal holds, deletion method, privacy-request channel, breach process, and access-review cadence.
3. Separate contact consent by channel. Do not infer SMS consent from an optional phone number. Record disclosure version, timestamp, source, and withdrawal.
4. Publish verified privacy/legal contacts and a monitored request process before scaling intake.
5. Confirm rate limiting, abuse controls, production delivery, failure handling, backup/recovery, authorized reviewer access, and deletion propagation.
6. Red-team `firestore.rules` with emulator tests:
   - compare create/update validation for bypasses;
   - make identity fields and original creation timestamps immutable where required;
   - constrain allowed deal fields, types, sizes, nested depth, and ownership on update;
   - constrain audit-log payloads and require server-controlled timestamps where appropriate;
   - replace or justify the broad recursive `artifacts/{appId}/users/{userId}/{document=**}` write permission;
   - test cross-user reads/writes, oversized strings/arrays/maps, unexpected fields, type changes, ownership changes, query behavior, deletion, and unauthenticated access.
7. Verify server credentials, least privilege, secret rotation, environment separation, auditability, and absence of secrets/PII in logs, analytics, URLs, or client storage.

Gate 4:

- privacy counsel approves notice, consent, retention, sharing, rights, and incident workflow;
- security owner signs the threat model and rules audit;
- the emulator attack suite passes;
- production lead delivery and authorized review are verified end to end;
- deletion/retention and access-review drills produce evidence;
- unresolved privacy or security issue keeps intake/workspace disabled.

### Phase 5 — Canonical financial calculation foundation

No advanced tool may ship until it consumes one approved foundation.

Work packages:

1. Define canonical units, rounding, day/count conventions, compounding, payment timing, amortization, interest-only transitions, remaining balance, taxes, insurance, HOA, reserves, vacancy, management, maintenance, capex, closing costs, sale costs, and prepayment penalties.
2. Keep lender qualification and investor survival separate:
   - lender DSCR uses the counsel/underwriting-approved qualifying-income and debt-service definition;
   - investor cash flow uses a separately approved operating waterfall;
   - labels must never imply that one proves the other.
3. Create an independent reference implementation or signed workbook that does not reuse production functions.
4. Validate public interfaces with vertical TDD slices. Test behavior, not private implementation; mock only external sources, time, and randomness.
5. Required test classes:
   - golden cases signed by domain experts;
   - exact-boundary cases and one-unit-below/above cases;
   - zero, missing, invalid, extreme, and unsupported inputs;
   - unit and rounding invariants;
   - amortization identities and cash-flow reconciliation;
   - monotonicity where economics requires it;
   - metamorphic tests, such as equivalent annual/monthly inputs;
   - independent recomputation;
   - fail-closed tests for stale/missing/conflicting sources;
   - deterministic replay by model/data version.

Core non-breakage invariants:

- higher rate cannot reduce payment, all else equal;
- higher rent cannot reduce DSCR, all else equal;
- adding HOA/tax/insurance cannot increase lender DSCR;
- remaining amortizing balance cannot increase absent capitalization;
- cash-flow components reconcile exactly to subtotals;
- no division by zero, `NaN`, infinity, hidden clamp, or silent default creates a favorable output;
- unsupported state/program/product returns `UNKNOWN` or a hold, never a guessed result.

Gate 5:

- underwriting owner signs the canonical specification;
- independent validator reproduces every golden result;
- all critical invariants and fail-closed tests pass;
- UI, API, export, and stored result use the same model/data version;
- no held tool can bypass the approved calculation service.

### Phase 6 — Tool-by-tool validation waves

Validate in dependency order:

1. released DSCR arithmetic and shared debt schedule;
2. stress and ARM/refinance schedules;
3. returns and tax;
4. STR and portfolio;
5. pricing/program/state-law tools;
6. recommendation, optimizer, and decision support;
7. probabilistic simulation.

Each tool must have a model card containing purpose, prohibited uses, inputs, outputs, formula/spec version, data dependencies, assumptions, limitations, uncertainty, validations, failure behavior, owner, validator, approval date, monitoring, and retirement criteria.

Gate 6:

- the tool-specific row in the release matrix below is complete;
- model validator and domain professionals sign;
- content/advertising review passes;
- the release dossier proves route/API/security/accessibility/SEO behavior;
- the hold remains if any required artifact is missing.

### Phase 7 — Content substantiation and final consumer journey

Work packages:

1. Use `content-quality-auditor` on every public page, article, FAQ, testimonial, case study, calculator label, hold page, email, and CTA.
2. Create one claim record for every rate, count, savings, funding, timeframe, customer result, lender/partner relationship, licensing, security, privacy, legal, tax, and “current/verified” statement.
3. Require documentary substantiation, permission, methodology, date range, representative-context disclosure, and expiry.
4. Reconcile estimate disclaimers with the actual journey; disclaimers cannot cure a contradictory headline, button, result, or sales process.
5. Validate that business identity, responsible provider, jurisdiction limits, source/as-of data, assumptions, uncertainty, and held outputs are visible at the decision point.
6. Block publication for contradictory data, title/body mismatch, fabricated or unsubstantiated experience, missing material disclosure, or unverifiable claims.

Gate 7:

- every material claim is `APPROVED`, `REMOVED`, or `HELD`;
- no expired claim remains public;
- content owner and counsel/CCO approve regulated claims;
- calculator and intake copy accurately describe what the system does;
- published sources and caveats are usable by a reasonable reader.

### Phase 8 — Launch, rollback, and continuous monitoring

Apply `deliver-launch-checklist` to each release candidate.

Required launch dossier:

- exact commit and deployed version;
- model, data, source, content, and rules versions;
- completed sign-off matrix;
- tests and independent recomputation;
- production smoke/e2e results;
- accessibility and security evidence;
- monitoring dashboards and alert owners;
- rollback switch and tested rollback procedure;
- customer/support/compliance escalation runbook;
- post-launch review date.

Go/no-go:

- no critical/high unresolved issue;
- no missing mandatory signature;
- no expired source;
- no unverified production environment;
- no route/API that exposes held output;
- rollback tested;
- final approval recorded by executive owner and every relevant domain approver.

Continuous controls:

- event-driven review on law, lender guide, rate sheet, tax, provider, or model change;
- scheduled freshness checks;
- model drift and outcome monitoring at a grain approved by fair-lending counsel;
- periodic matched-pair/fair-lending review;
- quarterly Firebase access/rules and privacy-retention review;
- immediate disablement on source expiry, calibration failure, material complaint, breach, or inconsistent result;
- incident review feeds new golden and regression tests.

## 7. Tool-by-tool release matrix

“Release” below means release of the named output, not merely rendering the page.

| Surface | Current posture | Required work and evidence | Owner | Mandatory validator(s) | Release gate |
|---|---|---|---|---|---|
| Public DSCR/payment calculator | Released as educational arithmetic | Freeze formula contract; reconcile P&I/PITIA; validate entered-rate use, HOA/tax/insurance, units, rounding, zero/extreme inputs, dual-track labels, and model-rate-band substantiation | Underwriting owner | Independent model validator; content owner | Golden/invariant suite passes; no program, price, approval, or legal conclusion is reintroduced |
| InvestGO workspace | Hold when auth configuration is unavailable | Production auth, recovery, token verification, user ownership, least privilege, audit logs, retention/deletion, access review, session failure tests | Product/security owner | Security owner; privacy officer | End-to-end production verification and Firebase red-team pass |
| Decision Support | Reliability hold | One canonical scenario/debt schedule; verified program inputs; normalized weights; explainable reasons; no “legal clear”; human-review routing; matched-pair tests | Product/underwriting owner | Model validator; counsel/CCO; fair-lending reviewer | All recommendations reproduce from approved inputs; unsupported cases withhold output |
| Rate Estimate/Quiz | Reliability hold | Authenticated rate sheets/program matrices; effective/expiry dates; complete adjustments; eligibility boundaries; disclosure and no rate-lock/approval implication | Pricing owner | Underwriting owner; counsel/CCO; model validator | Current source at request time; boundary tests; stale/missing data disables result |
| Deal Analyzer | Reliability hold | Keep reconciled arithmetic separate from program/pricing/state conclusions; remove or govern every external conclusion | Underwriting owner | Model validator; pricing owner; counsel | Arithmetic golden cases plus separately approved program/state modules |
| State Rules Reference | Reliability hold; API 503 | Primary citation per jurisdiction; transaction-date-aware effective periods; amendment/repeal tracking; counsel summary; expiry; `UNKNOWN` fallback | Legal-data steward | State-competent counsel | Counsel signature for each state/rule/version; incomplete or expired state stays unavailable |
| STR Underwriting | Reliability hold | Provider-approved income hierarchy; trailing/documented/market income rules; seasonality, vacancy, expenses, legality/HOA separation; missing-data behavior | Underwriting owner | Model validator; counsel for jurisdiction claims | Golden cases prove correct income selection; tool never chooses the most favorable unsupported income |
| Tax Engine | Reliability hold | Basis allocation, depreciation, cost segregation, passive activity, NIIT, recapture, capital gains, state tax, acquisition/operation/sale schedule, effective dates | Tax-model owner | Independent CPA/EA/tax attorney; model validator | Signed tax cases for representative and boundary scenarios; expired tax rules disable output |
| Refinance Tracker | Reliability hold | Current-loan amortization/payoff, IO transition, remaining term, new costs, prepay, taxes/insurance, break-even over hold periods | Underwriting owner | Model validator; pricing owner | Independent payoff/payment/break-even reconciliation across boundaries |
| Portfolio Refinance | Reliability hold | Loan-level schedules, property cash flows, reserves, cross-collateral assumptions, concentration, seasoning, correlated stresses, missing-loan handling | Portfolio owner | Model validator; underwriting owner | Portfolio totals reconcile to loan/property records; no favorable aggregation from missing data |
| ARM Reset Review | Reliability hold | Loan-specific index, source/as-of, margin, floor, initial/periodic/lifetime caps, reset dates/frequency, remaining-balance recast, IO coincidence, payment-shock disclosure | Underwriting owner | Model validator; counsel/CCO for disclosure | Reset ladder matches note terms; cap/floor/balance boundary tests pass |
| Investment Returns | Reliability hold | Acquisition-to-sale monthly/annual cash-flow schedule; capex/reserves, debt, taxes, prepay, sale costs, remaining balance; IRR/equity multiple without hidden clamps | Investment-model owner | Model validator; tax professional for after-tax results | Independent XIRR/NPV/equity reconciliation; components sum; no hidden defaults |
| Stress Matrix | Reliability hold | Canonical base scenario; explicit rent/vacancy/expense/rate shocks; Track 1/Track 2 separation; risk-zone thresholds; break-even curve | Risk-model owner | Model validator; underwriting owner | Monotonicity in every row/column; base cell exactly equals canonical scenario |
| Structure Optimizer | Reliability hold; API 503 | Structure-specific fixed/ARM/IO schedules; one rate unit; costs and prepay; lender coverage and investor cash flow as separate ranking dimensions; tie/unsupported behavior | Product/underwriting owner | Model validator; pricing owner; fair-lending reviewer | Every candidate independently reconciled; ranking is explainable and stable; missing source yields no recommendation |
| Rate-Path/Monte Carlo | Reliability hold | Purpose and horizon; official/defensible calibration data; correlation/regime/volatility assumptions; ARM remaining balance; taxes/insurance/rent/expenses; deterministic seeds; backtest; uncertainty | Risk-model owner | Independent quantitative validator; underwriting owner | Reproducible distributions, convergence/sensitivity/backtest report, no probability presented as fact |
| Public scenario-review intake | Conditionally releasable after production delivery verification | Identity/role clarity; consent version; channel-specific contact; provider/recipient map; rate limiting; authorized reviewer; retention/deletion; no automatic decision; privacy channels | Operations/privacy owner | Privacy officer; security owner; counsel/CCO | Production delivery/access/deletion tests pass; no sensitive data/logging; application boundary approved |

## 8. Probabilistic-model minimum standard

The Monte Carlo/rate-path tool requires additional evidence beyond ordinary unit tests:

1. A precise estimand: what probability is being estimated, for whom, over what horizon, and for which decision.
2. Calibration data with provenance, grain, vintages, selection criteria, missingness, survivorship bias, geography/product coverage, and license.
3. Parameter estimation that is reproducible from source data. No parameter copied from a skill or historical specification is accepted without reproduction.
4. Correlation, regime, volatility, insurance, tax, rent, vacancy, expense, reserve, ARM, refinance, and exit assumptions challenged separately.
5. Multiple deterministic seeds, convergence evidence, stability by simulation count, numerical precision tests, and invariant checks.
6. Backtesting or benchmark testing on held-out periods where fit for purpose, with explicit limits on causal/default claims.
7. Sensitivity and scenario analysis showing which assumptions dominate results.
8. Clear separation of model uncertainty, parameter uncertainty, data uncertainty, and scenario choice.
9. Human-readable disclosure that probabilities are conditional estimates, not promises or underwriting approval.
10. Monitoring thresholds approved from actual validation evidence. Generic thresholds embedded in a skill are not adopted automatically.

## 9. Non-breakage contract

Every work package must prove it did not weaken existing safeguards.

Required regression gates:

- all existing tests pass;
- `TOOL_RELIABILITY_HOLDS` remains complete and routes still render hold pages until signed release;
- held APIs continue returning explicit 503 responses;
- held routes remain excluded from indexable/search surfaces where currently intended;
- unknown states/enums fail closed;
- the DSCR calculator remains arithmetic-only unless a separate approved module is deliberately released;
- no program, rate, state-law, tax, approval, funding, or “best” conclusion appears without current provenance;
- lead schema remains strict and cannot accept client-calculated decisions, arbitrary nested data, or sensitive identity fields;
- client Firestore access to `leads` stays denied;
- no cross-user document access, ownership reassignment, privilege escalation, or update bypass;
- no PII/secrets in logs, URLs, analytics, errors, or browser persistence;
- every output displays its model/data version, as-of context, assumptions, and limitations where relevant;
- accessibility and mobile operation remain functional for holds, disclosures, inputs, errors, and consent;
- rollback restores the last signed configuration without losing audit evidence.

Removing a hold is its own reviewed change. It must not be bundled invisibly with styling, content, refactoring, dependency, or data updates.

## 10. Release-dossier decision template

Each `RELEASE_DOSSIER.md` must answer:

1. What exact user decision does this output support?
2. What is explicitly out of scope or prohibited?
3. Which business entity and responsible provider stand behind the journey?
4. Which jurisdictions and transaction types are authorized?
5. Which sources and versions drive the result, and when do they expire?
6. Which canonical formulas and model version are used?
7. Which golden, boundary, monotonicity, metamorphic, fail-closed, security, and e2e tests passed?
8. Who independently recomputed the result?
9. Which legal, tax, underwriting, fair-lending, privacy, and security reviewers are required, and where are their signatures?
10. What material uncertainty and limitations does the user see?
11. What monitoring can detect stale, inconsistent, discriminatory, insecure, or numerically invalid behavior?
12. What disables the feature, and how was rollback tested?
13. Are there unresolved findings? If yes, why is the output still withheld?

Allowed final decisions:

- `RELEASED`: all required evidence and signatures exist.
- `RELEASED_WITH_LIMITS`: counsel-approved narrow scope and explicit technical enforcement exist.
- `RELIABILITY_HOLD`: evidence is incomplete or expired.
- `RETIRED`: the feature cannot be supported safely or economically.

Agents may recommend a status. The named human authorities record it.

## 11. Dependency graph and critical path

The critical path is:

`Business identity and role`
→ `regulatory/licensing/applicability`
→ `field and adverse-action boundaries`
→ `source and data governance`
→ `canonical calculations`
→ `tool-specific validation`
→ `content/disclosure approval`
→ `production security/e2e`
→ `human go/no-go`.

Parallel work that does not depend on identity may begin read-only:

- source inventory and data-quality profiling;
- current-code model inventory;
- independent deterministic arithmetic reference cases;
- Firebase rules red-team design;
- claims-ledger inventory.

No public activation should occur in parallel with those investigations.

## 12. Definition of program completion

This program is complete only when:

- every public or planned financial surface has a recorded release status;
- every released surface has a current signed dossier;
- business identity, licensing, privacy channels, and responsible-provider roles are public and internally consistent;
- every material claim has substantiation and expiry;
- every legal, tax, lender, pricing, state, and model datum has provenance and an owner;
- all calculation paths have independent golden cases and fail-closed behavior;
- all Firebase/PII controls have adversarial evidence;
- adverse-action and fair-lending responsibilities are assigned and tested;
- monitoring, incident response, and rollback are operational;
- expired evidence automatically causes a hold;
- no required conclusion depends on a skill's embedded facts, an old audit, an unverifiable citation, or an agent's unsupported assertion.

Until then, reliability holds are product behavior, not temporary copy.
