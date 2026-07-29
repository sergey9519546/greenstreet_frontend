# Claim-evidence wave baseline

**Snapshot:** 2026-07-28
**Scope:** local, read-only inventory of the public claim surfaces named for this wave: static HTML and metadata, React-rendered copy, legal/about/footer disclosures, calculator and qualification modal, legacy marketing source, and lead wording. No web research, source edits, configuration changes, or claim changes were made.

## Safety boundary

This is an evidence inventory, not a legal, licensing, pricing, or underwriting determination. A source-code comment, UI label, test, or local file can show how the application behaves; it does **not** verify a business fact, license, counterparty, customer result, statute, market rate, security certification, or monitored contact channel.

The status labels below are deliberately conservative:

| Status | Meaning in this baseline |
| --- | --- |
| **Implementation-verified** | The stated behavior is visible in the checked-in code and is appropriate to retain as a description of that behavior. It is not external-business verification. |
| **Unverified** | The public-facing fact lacks a controlled source artifact, accountable owner, approval, effective date, and/or scope evidence in the repository. |
| **Conflicting** | Two public or active implementation surfaces make incompatible statements. Do not resolve by choosing one without the responsible owner. |
| **Held** | The product deliberately suppresses the conclusion or replaces it with an under-review/estimate state. A hold must remain in place until release evidence is approved. |

## Executive disposition

1. Preserve the working calculator arithmetic, lead delivery flow, authentication boundaries, routing, current reliability holds, and homepage composition. None of those are changed by this document.
2. Treat the static home-page description/social metadata as the highest-priority claim conflict. It still says Greenstreet originates loans directly and is funded through Cake, while the live legal/about/footer disclosures say the role, licensing, and counterparty are not published or verified.
3. Keep the React marketing sanitizer and its rate/state hold widgets. They actively suppress many unsupported legacy claims before the homepage is placed in the DOM.
4. Do not promote the qualification modal's illustrative rate range, policy thresholds, or state-tier behavior to a current price, eligibility, provider, or legal conclusion. Those inputs are active but lack release evidence and partially contradict the existing rate/state holds.
5. Keep the public lead endpoint's current limited acknowledgement. It confirms delivery only and intentionally does not return a quote, decision, or calculated financial result.

## Surface reconciliation map

| Surface | What is presently live or compiled | Reconciliation status |
| --- | --- | --- |
| Static head | `index.html:29-42` contains a lender/funding/Cake description and matching Open Graph/Twitter descriptions. | **Conflicting** with legal/about/footer. React updates metadata after hydration, but non-JavaScript consumers can still read the static head. |
| Runtime route metadata | `src/seo/routeMetadata.ts:21-25` defines the homepage as educational tools and explicitly says calculator results are estimates, not commitments or advice. `src/App.tsx:186-188` applies it after mount. | **Implementation-verified**, but it does not repair the static pre-hydration/social metadata by itself. |
| React marketing homepage | `src/marketing/MarketingHome.tsx:5-211` replaces unsupported claims; `:352-367` replaces the rate and state widgets with explicit holds before rendering. | **Held** at runtime for the listed legacy claims. Keep the sanitizer and its tests. |
| Legacy marketing source | `src/marketing/home-markup.html:734-1011` retains the original direct-lending, pricing, state-law, testimonial, performance, logo, and whitepaper copy. | **Unverified source artifact**. The copy is normally sanitized at runtime, but remains compiled source material and needs an ownership decision. |
| Legal, About, and footer | `src/pages/LegalPage.tsx:25-79`, `src/pages/AboutPage.tsx:303-312`, and `src/design/SiteShell.tsx:427-434` say results are estimates and identity/licensing/provider information is not published. | **Implementation-verified disclosure posture**; it must govern unsupported positive marketing claims. |
| Public calculator | `src/pages/DSCRCalculatorPage.tsx:366-394` limits the output to arithmetic and labels it an educational estimate. `src/engine/publicDealAnalysis.ts:35-119` makes the displayed calculations explicit. | **Implementation-verified arithmetic posture**; property inputs and operating assumptions remain user/model assumptions, not verified transaction facts. |
| Qualification modal | `src/components/QualifyModal.tsx:1224-1496` labels its display preliminary/illustrative, but calls `qualify()` and shows a generated rate range. | **Conflicting / unverified** where policy values are interpreted as availability, pricing, or state-informed eligibility. |
| Lead flow | `src/routes/leads.ts:36-172` accepts only raw submitted fields, validates the request, and returns `{ accepted: true }`; `src/components/QualifyModal.tsx:1789-1804` limits confirmation to delivery. | **Implementation-verified** as a delivery-only flow. Claims of security, privacy operations, or response handling still need operational evidence. |

## Claim inventory

### Identity, funding role, and availability

| Claim or behavior | Exact local evidence | Status | Required evidence / accountable owner |
| --- | --- | --- | --- |
| “Greenstreet Finance originates DSCR loans direct … funded through … Cake. Price, qualify, and close your deal.” | Static `index.html:29-42`. | **Conflicting**. The same statement is repeated in description, Open Graph, and Twitter tags. | Business owner plus mortgage/licensing counsel must supply the legal entity/DBA, role, jurisdiction scope, Cake relationship/permission, licensing basis, effective date, and approved wording. Until then, use only counsel-approved neutral metadata. |
| Greenstreet's legal role, NMLS/state licenses, address, and responsible counterparty are not published; visitors must not infer a lender role. | `src/pages/LegalPage.tsx:59-79`; `src/pages/AboutPage.tsx:298-312`; `src/design/SiteShell.tsx:427-430`. | **Implementation-verified disclosure posture**. It directly contradicts the static lender/funding assertion above. | Business/legal owner must either maintain the neutral disclosure or approve a single identity block backed by the records above. |
| Marketing copy formerly said it would “underwrite and fund in-house,” offered direct DSCR lending, and described an all-in-one non-QM/DSCR platform. | Raw `src/marketing/home-markup.html:734`; suppression mappings in `src/marketing/MarketingHome.tsx:10-31`, `:136-161`; test in `src/marketing/MarketingHome.test.ts:13-51`. | **Held** in rendered marketing; **unverified** in retained raw source. | Preserve the runtime replacements. Any future positive role claim needs the same business/counsel evidence as the static metadata. |
| Financing availability is a preliminary-review path, not proof of a product in a jurisdiction. | `src/pages/BookDemoPage.tsx:227-242`; `src/pages/LegalPage.tsx:160-168`. | **Implementation-verified safe wording**. | No release needed while the wording remains limited to a request for review. |

### Calculator, pricing, and eligibility

| Claim or behavior | Exact local evidence | Status | Required evidence / accountable owner |
| --- | --- | --- | --- |
| The DSCR calculator compares entered rent with modeled PITIA and exposes the input arithmetic. | `src/engine/publicDealAnalysis.ts:35-119`; user-facing limitations at `src/pages/DSCRCalculatorPage.tsx:366-394`. | **Implementation-verified** as deterministic educational arithmetic. | Retain existing unit/golden tests. Do not represent the user-entered rent, rate, taxes, insurance, or operating assumptions as verified facts. Model owner owns any change to formulas/defaults. |
| Calculator result does not determine qualification, program fit, pricing, or credit approval. | `src/pages/DSCRCalculatorPage.tsx:371-394`; consistent product framing in `src/pages/ProductsPage.tsx:43-45,503-508`. | **Implementation-verified safe wording**. | Keep this limitation in any calculator redesign, SEO change, or CTA experiment. |
| The modal displays an “Illustrative model range” based on FICO, purpose, state, and the visitor's inputs. | UI `src/components/QualifyModal.tsx:1224-1496`; policy constants/range builder `src/engine/qualify.ts:71-80,119-145`. | **Conflicting / unverified**. It is not labelled a current quote, but it is an active rate-like output while the dedicated Rate Quiz is held for lack of an approved rate sheet. | Pricing/underwriting owner and counsel need a versioned rate artifact, jurisdiction/product scope, review/expiry dates, approval, and test cases. Until then, retain only an unmistakably educational assumption or a neutral entered-rate view; do not call it pricing, a quote, or availability. |
| The engine includes policy labels/thresholds such as credit/program floors, eligible property types, LTV caps, “likely qualifies,” “not currently,” and references to sub-1.0 products. | `src/engine/qualify.ts:190-228,296-302`; modal calls it at `src/components/QualifyModal.tsx:676,1224`. | **Unverified**, even where the UI includes a disclaimer. Source code is not an approved lending policy or eligibility matrix. | Pricing/underwriting owner, licensed responsible provider, and model validator must approve governed policy artifacts before any label can be a decision or program conclusion. |
| “Cash-out … Pricing is slightly higher than a purchase.” | `src/components/QualifyModal.tsx:730-736`. | **Unverified pricing assertion**. | Same pricing owner/evidence as above; replace only after an approved content decision and regression capture. |
| “No credit pull” / “no obligation.” | `src/components/QualifyModal.tsx:738-740`; confirmation restates that the form is not an application at `:1802-1804`. | **Partly implementation-verified, partly unverified**. The repo path has no credit-pull integration, but source inspection alone cannot prove all deployed integrations or the legal effect of “no obligation.” | Privacy/credit-operations owner and counsel need deployment inventory, vendor confirmation, terms approval, and a periodic review date. |
| Rate Quiz has no approved rate sheet/program labels and is deliberately unavailable. | `src/components/toolReliabilityHolds.ts:36-48`; routing hold `src/App.tsx:310-311`; noindex rule `src/seo/routeMetadata.ts:155-163`. | **Held**. | Do not weaken this hold to align it with the modal. Align the modal to the hold or release both only through governed evidence. |

### State-law and jurisdiction-informed behavior

| Claim or behavior | Exact local evidence | Status | Required evidence / accountable owner |
| --- | --- | --- | --- |
| State Rules Reference is unavailable pending counsel-reviewed primary sources, effective dates, named reviewer, and expiry. | `src/components/toolReliabilityHolds.ts:60-71`; marketing hold in `src/marketing/MarketingHome.tsx:353-367`. | **Held**. | Keep it held; mortgage/state counsel owns each jurisdictional release. |
| The modal maps a selected state to `PPP_STATE_LAWS` and changes the qualification engine's `stateTier`. | `src/components/QualifyModal.tsx:86-122`; state data at `src/engine/statePppLaws.ts:1-260`; downstream result branch at `src/engine/qualify.ts:206-220`. | **Conflicting**. The active modal uses state-law/lender-matrix assertions while the dedicated state surface says those assertions cannot safely be published. Local `provenance` labels are not controlled source evidence. | State counsel plus pricing/underwriting owner must approve source artifacts, effective dates, scope, and an update process. Until then, state selection can remain intake context, but it must not yield a state-specific legal or eligibility classification. |
| Legacy homepage said state rules were mapped/updated monthly and “50-state clean.” | Raw `src/marketing/home-markup.html:734,953`; runtime replacements `src/marketing/MarketingHome.tsx:42-56,119-127`; test `src/marketing/MarketingHome.test.ts:13-51`. | **Held** at runtime; **unverified** in raw source. | Preserve the current hold and remove/reclassify source artifacts only after legal/content ownership is recorded. |

### Testimonials, performance, security, and legacy marketing materials

| Claim or behavior | Exact local evidence | Status | Required evidence / accountable owner |
| --- | --- | --- | --- |
| Customer testimonials, customer names, broker logos, users/time-saved/growth/cycle-time figures, close-time promises, and “trusted nationwide” positioning. | Legacy strings/assets in `src/marketing/home-markup.html:734-953`; replacement map `src/marketing/MarketingHome.tsx:58-135`; regression assertions `src/marketing/MarketingHome.test.ts:13-51`. | **Held** as text in the rendered homepage, but **unverified** legacy source/logo imagery remains. The replacement text alone does not prove every retained logo/image is a neutral illustration. | Marketing owner plus legal/privacy owner must provide written testimonial/logo consent, measurement methodology/data window, claim approval, and expiry—or replace retained imagery with neutral assets. |
| “Bank-grade” security/privacy and secure document-storage assertions. | Raw source at `src/marketing/home-markup.html:734`; sanitization in `src/marketing/MarketingHome.tsx:72-80`. | **Held** at runtime; **unverified** in raw source. | Security/privacy owner must provide a scoped control inventory and approved wording. Never infer certification from code or a vendor name. |
| Whitepaper form appears to promise email delivery in the legacy export. | Raw `src/marketing/home-markup.html:1009-1011`; renderer turns it into a disabled/unavailable form at `src/marketing/MarketingHome.tsx:219-250`; tested at `src/marketing/MarketingHome.test.ts:34-50`. | **Held**. | Preserve the disabled state until a real owned fulfillment path, privacy notice, consent record, and test are approved. |

### Legal, privacy, footer, and lead language

| Claim or behavior | Exact local evidence | Status | Required evidence / accountable owner |
| --- | --- | --- | --- |
| Legal/terms state that outputs are estimates, not advice, quotes, locks, approvals, or commitments; financing terms require a responsible licensed provider. | `src/pages/LegalPage.tsx:25-33,59-79,150-168`. | **Implementation-verified safe disclosure**. | Preserve verbatim intent through any content update; counsel owns substantive wording. |
| Legal disclosures list `legal@greenstreetfinance.com`, while Terms says a verified legal contact channel is pending and Privacy says a verified privacy contact channel is pending. | Email display `src/pages/LegalPage.tsx:90,504-508`; pending statements `:131-140,185-190`. | **Conflicting**. The repository cannot establish whether the inbox is owned, monitored, or the correct channel for legal/privacy requests. | Legal/privacy operations owner must either verify and publish the channel/service standard or remove/replace the address using counsel-approved copy. |
| The public scenario-review form only collects submitted contact/scenario fields, requires consent, avoids calculated-result persistence, and returns a delivery acknowledgement. | UI disclaimers `src/components/QualifyModal.tsx:1578-1586,1789-1804`; server schema/persistence `src/routes/leads.ts:36-93,161-172`; privacy wording `src/pages/LegalPage.tsx:103-118`. | **Implementation-verified** delivery-only behavior. | Keep endpoint schema, origin checks, Firestore rules, and acknowledgement semantics stable unless a separately tested privacy/lead-operations change is approved. |
| “The same secure intake” and “securely deliver your request.” | `src/pages/BookDemoPage.tsx:13-15,227-230`; `src/components/QualifyModal.tsx:2053-2058`. | **Unverified security claim**. Application controls can be inspected, but “secure” requires a deployed-system, vendor, access, retention, and incident-response assessment. | Security/privacy owner must approve precise language and evidence; do not make a certification-level claim without certification evidence. |
| Privacy policy says downstream recipients/contractual controls and a privacy-request channel are not fully identified/published. | `src/pages/LegalPage.tsx:114-140`. | **Held / transparent disclosure**. | Privacy owner must document processor inventory, retention, rights-request channel, response procedure, and jurisdictional applicability before expanding lead promotion. |

## Evidence gaps that block claim release

| Evidence package | Minimum contents | Accountable human owner |
| --- | --- | --- |
| Identity and role | Legal entity/DBA, role, address, NMLS/state-license status where applicable, jurisdiction scope, approved site language, review/expiry date. | Business owner + mortgage/licensing counsel. |
| Funding/counterparty | Executed relationship confirmation, permission to name the counterparty, role allocation, state/product scope, effective/expiry date. | Business owner + counterparty/legal owner. |
| Rate/program/eligibility | Controlled rate sheet/program matrix, artifact hash/version, owner, effective/expiry date, jurisdiction/product scope, approver, boundary/golden tests. | Pricing and underwriting owner + responsible licensed provider. |
| State-law/PPP | Primary source archive, counsel memo, jurisdiction and transaction-date scope, update cadence, named reviewer, expiry, deterministic test fixture. | Mortgage/state counsel. |
| Testimonials and performance | Customer permission, logo release, source data/sample definition, calculation method, date range, limitations, approver, expiry. | Marketing owner + legal/privacy owner. |
| Security/privacy/lead operations | Deployed architecture/control inventory, processor list, data-retention/deletion policy, access review, incident owner, tested request channel, approved wording. | Security owner + privacy/lead-operations owner. |
| Calculator/model policy | Owner/versioned assumptions, formula review, intended-use boundary, test fixtures, change control, independent validation. | Model owner + independent validator. |

## Safe remediation sequence

The order below is designed to avoid breaking a currently working flow. Each implementation slice should be separate, reversible, and gated by the existing regression suite.

1. **Freeze the evidence baseline.** Record the current homepage fidelity hash, unit-test result, build result, screenshots of the home/calculator/modal/lead success and error states, and the exact source claims above. Do not alter the raw export or visual composition in this step.
2. **Resolve identity facts before editing static metadata.** Business and counsel select the truthful legal-role/funding statement. Make one isolated static-head update only after approval; test direct-load, social/meta inspection, canonical URLs, and the existing homepage fidelity contract.
3. **Keep runtime marketing holds and expand their regression coverage before cleanup.** Preserve `publicMarketingMarkup` replacements. Add a narrow test for every high-risk raw phrase/logo class that must not appear in the rendered output. Do not delete the legacy HTML or assets until visual and route snapshots prove the accepted homepage still matches.
4. **Separate arithmetic from policy in the modal.** Snapshot current modal paths first. In a later, independently reviewed change, make any unapproved rate/program/state branch default to review-only while preserving input fields, calculator arithmetic, lead payload shape, consent behavior, and error handling. Do not connect the still-unvalidated evidence guard to this surface.
5. **Resolve contact-channel and security wording.** Verify legal/privacy inbox ownership and operating procedure, then update the smallest affected copy set. Keep the endpoint's delivery-only response; do not add CRM, SMS, scheduling, or external sharing without separate privacy/consent approval.
6. **Build governed evidence before releasing anything held.** The current `SourceEvidence` evaluator remains design-only and its independent validation is FAIL for unresolved approved-record conflicts (`docs/program/SOURCE_EVIDENCE_GUARD_VALIDATION.md`). Fix and revalidate that internal primitive before attaching it to a hold or customer-facing output.
7. **Release one claim family at a time.** For each approved family, require owner, artifact/version/hash, effective/expiry dates, scope, human approval, source-specific tests, visual/browser regression, independent review, preview evidence, and a rollback commit. An evidence absence keeps the current hold or estimate state.

## Non-negotiable regression gates for any follow-up change

- `npm run lint`
- `npm test`
- `npm run test:home-fidelity`
- `npm run build`
- `npm exec vitest run src/marketing/MarketingHome.test.ts src/routes/leads.test.ts`
- Direct-route/browser checks for `/`, `/dscr-calculator`, `/book-demo`, `/legal`, `/privacy-policy`, `/terms-of-service`, and all held routes affected by wording.
- Visual baseline checks for desktop and mobile homepage, calculator, qualification modal, and lead acknowledgement/error states.
- A post-change source scan that confirms no unapproved lender-role, current-rate, state-law, testimonial, security-certification, or response-time claim was introduced in static metadata or rendered markup.

## Handoff

**Current publish posture:** retain existing holds and educational-estimate framing; do not release new lender, counterparty, pricing, eligibility, state-law, customer-result, or security claims from this baseline.

**Next accountable decision:** business owner and mortgage/licensing counsel must decide the truthful identity/role/funding statement for the static metadata. Pricing/underwriting and state counsel should separately decide whether the active modal must be reduced to neutral, review-only behavior before any evidence release work begins.
