# GreenStreet skill coverage ledger

Status: Wave 0 planning record. `Pending` means the skill has not been invoked. `Unavailable` means its work requirement remains, but no verified runnable local skill is authorized. No row closes without the stated evidence.

## Global change-preservation gate

Every row that results in a code, configuration, content, or deployment change inherits these requirements:

1. Capture the existing behavior with a baseline test, screenshot/trace, benchmark, or signed manual acceptance record.
2. Make the minimal change necessary for the ticket; avoid opportunistic refactors.
3. Use an independent validator (not the builder) to run regression checks for affected and critical journeys.
4. Record preview/production rollback steps, the previous artifact or commit, and the rollback smoke test.
5. Stop on unexpected behavior or a failed baseline; do not broaden scope to repair unrelated issues.

## Project-local lock status

The local lock uses whole-folder hashes, not individual `SKILL.md` hashes. All 11 checked-in Firebase folders are integrity-matched to their recorded values, but remain **provenance-review and inactive** until a pinned upstream revision, content review, least-privilege scope decision, and named approval are recorded. All 18 Hyperframes folders mismatch their recorded values and remain **full quarantine**. See [skill-lock forensics](./SKILL_LOCK_FORENSICS.md); no lock result overrides the architecture or human-approval gates below.

| Skill / work method | Classification | Wave and explicit trigger | Required artifact and independent validation | Human gate | Status |
| --- | --- | --- | --- | --- | --- |
| setup-matt-pocock-skills | Active catalog | 0; clean checkout is confirmed and project context must be initialized. | Context package and repository conventions; Program Steward review. | None | In progress — its required configuration decisions are pending. |
| codebase-audit | Required, unavailable | 0; historical audit findings are reconciled to the recovered checkout. | Finding disposition matrix; Architecture Agent validates samples. | Business owner accepts priorities. | Unavailable |
| deliver-launch-checklist | Required, unavailable | 0 and 7; a release candidate is proposed. | Signed launch checklist and rollback rehearsal; Release Agent validates. | Designated release approver. | Unavailable |
| agent-supply-chain | Required, unavailable | 0; any non-catalog or externally sourced skill is proposed. | Source/revision/hash/script-permission review; independent security reviewer. | Security owner accepts residual risk. | Unavailable |
| skill-creator | Active catalog | 0; a verified GreenStreet-local release-gate skill is authorized after human policies exist. | Concise skill plus validation artifact; independent forward test. | Counsel/pricing/tax owners approve included policy. | Pending |
| improve-codebase-architecture | Active catalog | 1; canonical route, API, calculation, and deployment boundaries are mapped. | Architecture map and ADRs; Program Steward review. | Architecture owner. | Pending |
| diagnose | Active catalog | Any wave; a reproducible defect, regression, or production symptom occurs. | Cause/evidence report and targeted regression; independent reviewer. | None | Pending |
| tdd | Required, unavailable | 3; any financial, auth, security, or API behavior changes. | Failing-first test, implementation, and regression run; Model/E2E Agent validates. | Model owner for financial logic. | Unavailable |
| react-best-practices | Active catalog | 1/4; a React route, component, loading path, or state boundary changes. | Scoped design note and test/benchmark result; UI Agent validates. | None | Pending |
| frontend-testing-debugging | Active catalog | 4; UI behavior, errors, forms, or responsive layouts change. | Browser reproduction and regression result; E2E QA Agent validates. | None | Pending |
| playwright | Active catalog | 4/7; a critical public/authenticated journey or preview must be tested. | Trace, screenshots, and passing run; independent E2E QA Agent. | None | Pending |
| e2e-testing | Required, unavailable | 4; auth, lead, calculator, direct-route, or failure journey is introduced/changed. | Scenario matrix, CI suite, traces; Release Agent validates. | None | Unavailable |
| github | Active catalog | 7; a scoped PR requires status checks and evidence links. | PR checklist and protected-check record; Release Agent validates. | Code owner. | Pending |
| gh-fix-ci | Active catalog | 7; CI failure is reproducible and attributable to the change. | Minimal CI repair plus full rerun; independent reviewer. | None | Pending |
| codeql | Required, unavailable | 2/7; code scanning is configured or a security-sensitive change lands. | Baseline, findings triage, and scan result; Security Agent validates. | Security owner for accepted risk. | Unavailable |
| secret-scanning | Required, unavailable | 0/7; repository or deployment configuration is assessed. | Scan configuration/result and remediation evidence; independent security reviewer. | Security owner for exceptions. | Unavailable |
| dependabot | Required, unavailable | 6; dependency update policy is established or a dependency changes. | Update policy and tested update PR; Release Agent validates. | Dependency owner. | Unavailable |
| security-review | Required, unavailable | 2/7; auth, PII, APIs, Firestore rules, or deployment permissions change. | Threat model and remediation test; independent security reviewer. | Security owner. | Unavailable |
| firebase-basics | Integrity-matched / provenance-review | 2; target Firebase project and database edition must be confirmed. | Environment/project record; Firebase Security Agent validates against console evidence. | Firebase project owner. | Inactive — provenance review |
| firebase-local-env-setup | Required, unavailable | 2; emulator-backed auth/rule tests are introduced. | Reproducible local environment instructions and passing smoke test; independent QA Agent. | None | Unavailable |
| firebase-auth-basics | Integrity-matched / provenance-review | 2; sign-up, sign-in, recovery, verification, or token propagation changes. | Auth contract and emulator/browser tests; Firebase Security Agent validates. | Privacy/security owner. | Inactive — provenance review |
| firebase-firestore-standard | Required, unavailable | 2; Firestore model, indexes, or queries are created/changed. | Data-model/index record and query tests; independent Firebase Agent. | Data owner for PII. | Unavailable |
| firebase-firestore | Integrity-matched / provenance-review | 2; legacy local mapping only; superseded by verified standard skill if adopted. | Do not execute until provenance-approved; then compare scope with standard skill. | Firebase project owner. | Inactive — provenance review |
| firestore-security-rules-auditor | Required, unavailable | 2; Firestore rules are changed or reviewed for release. | Ownership/escalation/field-validation rule-test suite; independent red-team result. | Security owner. | Unavailable |
| firebase-security-rules-auditor | Integrity-matched / provenance-review | 2; legacy local mapping only; advisory-only after provenance and scope comparison. | Do not execute until provenance-approved. | Security owner. | Inactive — provenance review |
| firebase-remote-config-basics | Integrity-matched / provenance-review | 2; held-tool release flags or gradual release controls are proposed. | Flag design, default-off proof, and rollback test; E2E QA Agent validates. | Product and release owners. | Inactive — provenance review |
| firebase-crashlytics | Conditional / integrity-matched / provenance-review | 6; mobile/native Crashlytics is explicitly approved. | Privacy review and scrubbed-error test; independent security reviewer. | Privacy owner. | Inactive — provenance review |
| mortgage-fintech-audit | Required, unavailable | 3; a DSCR/Non-QM model is proposed for release. | Sanitized audit framework, tool evidence packet, independent reproduction. | Pricing/underwriting owner and quantitative validator. | Unavailable |
| analyze-data-quality | Active catalog | 2/3; rate, program, legal, tax, or model source data is ingested/updated. | Source-quality report with owner/effective/expiry dates; Data Governance Agent validates. | Source owner. | Pending |
| validate-data | Active catalog | 2/3; governed data or model outputs are used publicly. | Type/unit/range/freshness validations and fail-closed tests; independent Model Validator. | Data/model owner. | Pending |
| visualize-data | Active catalog | 3; a chart, stress surface, or probabilistic result is shown. | Reproducible chart data and visual regression; Model Validator validates. | Model owner. | Pending |
| deep-research | Active catalog | 1/3/5; a primary source or claim needs evidence. | Source packet with dates/limits; separate reviewer confirms citations. | Counsel/tax/pricing owner as applicable. | Pending |
| mortgage-compliance | Required, unavailable | 1/5; public mortgage claims, disclosures, eligibility, or state law content changes. | Disclosure/claims matrix and source packet; independent content review. | Mortgage/licensing counsel. | Unavailable |
| content-quality-auditor | Active catalog | 1/5; public content, testimonials, rates, product claims, or legal copy changes. | Claim-evidence ledger and content disposition; independent reviewer. | Counsel for regulated claims. | Pending |
| vercel-functions | Required, unavailable | 2; server function contract, runtime, or error behavior changes. | Function contract, preview tests, logs, rollback; API/Vercel Agent validates. | Platform owner. | Unavailable |
| deployments-cicd | Required, unavailable | 2/7; CI, preview, environment, promotion, or rollback is changed. | Preview certification and rollback rehearsal; Release Agent validates. | Release owner. | Unavailable |
| verification | Required, unavailable | 2/7; browser-to-API-to-persistence path is release-critical. | End-to-end verification evidence; independent E2E QA Agent. | None | Unavailable |
| env-vars | Required, unavailable | 2; environment values or ownership change. | Environment ownership matrix and absent-secret checks; Security Agent validates. | Platform/security owner. | Unavailable |
| vercel-cli | Required, unavailable | 7; deployment state/logs/rollback must be inspected. | Deployment record and command transcript; Release Agent validates. | Release owner. | Unavailable |
| vercel-optimize | Required, unavailable | 4; measured LCP/INP/CLS or function cost misses a target. | Before/after metrics and regression evidence; Performance Agent validates. | Product owner accepts exceptions. | Unavailable |
| web-design-guidelines | Required, unavailable | 4; material UI surface or interaction is added. | UI quality review and visual regression; Design Agent validates. | Product/design owner. | Unavailable |
| design-director | Active catalog | 4; a new public surface needs a design-quality audit. | Scorecard and scoped recommendations; independent UI Agent. | Product/design owner. | Pending |
| accessibility | Required, unavailable | 4; a user-facing route, form, or auth flow changes. | WCAG 2.2 audit, keyboard and screen-reader evidence; Accessibility Agent validates. | Accessibility owner. | Unavailable |
| a11y-debugging | Required, unavailable | 4; an accessibility defect is reported or discovered. | Reproduction/fix/regression evidence; independent accessibility reviewer. | None | Unavailable |
| core-web-vitals | Required, unavailable | 4/6; performance baseline or change impacts public routes. | Mobile field/lab measurement and regression report; Performance Agent validates. | Product owner accepts exception. | Unavailable |
| competitor-analysis | Active catalog | 5; editorial strategy is refreshed. | Competitor landscape; Content Agent validates sampling. | Marketing owner. | Pending |
| keyword-research | Active catalog | 5; target topic clusters are selected. | Keyword/topic model; Marketing owner validates intent. | Marketing owner. | Pending |
| serp-analysis | Active catalog | 5; priority query intents are evaluated. | SERP evidence set; Content Agent validates. | Marketing owner. | Pending |
| content-gap-analysis | Active catalog | 5; roadmap gaps are prioritized. | Gap backlog mapped to audience/intent; independent content reviewer. | Marketing owner. | Pending |
| seo-content-writer | Active catalog | 5; approved editorial brief becomes draft content. | Draft with citations/disclosures; Content Quality Agent validates. | Counsel for regulated content. | Pending |
| content-refresher | Active catalog | 5; existing time-sensitive article requires update. | Before/after source and freshness record; independent content reviewer. | Content owner. | Pending |
| technical-seo-checker | Required, unavailable | 5/7; public routes or metadata change, and before launch. | Crawl, rendering, canonical, sitemap, robots report; SEO Agent validates. | Marketing owner. | Unavailable |
| on-page-seo-auditor | Active catalog | 5; a public page/article is approved for publishing. | On-page audit and fixes; independent SEO reviewer. | Marketing owner. | Pending |
| meta-tags-optimizer | Active catalog | 5; public page metadata changes. | Metadata matrix and social-preview evidence; SEO Agent validates. | Marketing owner. | Pending |
| schema-markup-generator | Active catalog | 5; approved entity/article/FAQ schema is added. | Validated JSON-LD and claim alignment; Content Quality Agent validates. | Counsel for offer/review implications. | Pending |
| internal-linking-optimizer | Active catalog | 5; content cluster or navigation changes. | Internal-link map and broken-link check; SEO Agent validates. | Marketing owner. | Pending |
| entity-optimizer | Active catalog | 1/5; legal business identity is approved. | Canonical entity package; counsel/business owner validates. | Business and licensing owner. | Pending |
| geo-content-optimizer | Active catalog | 5; location/state content is considered. | Jurisdiction source/evidence and no-claim review; independent content reviewer. | Mortgage/licensing counsel. | Pending |
| rank-tracker | Active catalog | 5/8; analytics consent and measurement ownership are configured. | Baseline and reporting cadence; Marketing Analyst validates. | Privacy/marketing owner. | Pending |
| performance-reporter | Active catalog | 5/8; monthly performance review occurs. | Monthly KPI report; Marketing/analytics owner validates. | Marketing owner. | Pending |
| prototype | Active catalog | Conditional; materially new calculator/tool/interaction is considered. | Disposable prototype and usability/feasibility evidence; independent UI/Model review. | Product owner. | Pending |
| imagegen | Conditional active catalog | Conditional; original non-deceptive visual is approved for production. | Prompt, provenance, accessibility text, and review; Content Quality Agent validates. | Marketing/legal owner. | Pending |
| media-use | Conditional active catalog | Conditional; owned media needs optimization, captions, or transcription. | Media provenance, captions/transcript, performance result; Accessibility Agent validates. | Content owner. | Pending |
| product-launch-video | Conditional / full quarantine | Conditional; all promoted capabilities pass release evidence and a video is approved. | Claim-by-claim video review and captions; independent Content/Accessibility review. | Product, counsel, and marketing owners. | Full quarantine |
| sentry-react-sdk | Conditional, unavailable | 6; Sentry is chosen after privacy review. | Scrubbing configuration and synthetic-event test; Security Agent validates. | Privacy owner. | Unavailable |
| sentry-create-alert | Conditional, unavailable | 6; approved Sentry observability needs an operational alert. | Alert drill and owner/route record; Incident owner validates. | Operations owner. | Unavailable |
| sentry-fix-issues | Conditional, unavailable | 6; a Sentry issue is triaged as a real defect. | Root cause/fix/regression evidence; independent reviewer. | None | Unavailable |
| Google Well-Architected Security/Reliability/Operational Excellence/Performance | Reference-only, unavailable | 6; production readiness review evaluates the Firebase/GCP surface. | Gap assessment; Architecture/Security Agents validate. | Architecture and security owners. | Unavailable |
| devops-rollout-plan | Reference-only, unavailable | 7; a missing rollout/rollback artifact is identified. | Only the missing artifact; Release Agent validates no duplication. | Release owner. | Unavailable |

## Human-only gates (not delegated)

| Decision | Required approver | Required evidence |
| --- | --- | --- |
| Mortgage licensing, advertising, disclosures, state-law summaries, TILA/RESPA/UDAAP/ECOA/Fair Housing | Mortgage/licensing counsel | Jurisdiction-specific, dated source and written approval. |
| Privacy, GLBA/FTC Safeguards, CCPA/CPRA, analytics/session replay, PII retention | Privacy counsel/security owner | Data map, vendor terms, retention/access decision. |
| Pricing, rate sheets, program eligibility, underwriting conclusions | Pricing and underwriting owners | Versioned source, effective/expiry dates, approval. |
| Tax/depreciation/passive-loss/recapture outputs | Tax professional | Tax-year-specific reviewed scenarios and limitations. |
| Quantitative model-risk release | Independent quantitative validator | Independent reproduction, tolerances, boundary/fail-closed evidence. |

## Closure evidence template

```text
Skill / method:
Trigger met:
Baseline preserved:
Minimal scope:
Required artifact:
Independent validator and result:
Rollback artifact and smoke test:
Human approval (if required):
Evidence links:
Status:
```
