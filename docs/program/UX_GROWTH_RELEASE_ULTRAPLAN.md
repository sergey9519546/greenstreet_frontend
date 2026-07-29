# GreenStreet UX, Growth, and Release Ultraplan

Status: Program plan
Created: 2026-07-28
Scope: UX, accessibility, frontend reliability, performance, technical SEO, content, analytics, launch, rollback, and post-launch learning
Change policy: This document plans work. It does not authorize application, content, infrastructure, analytics, or production changes.

## 1. Outcome and operating constraints

The outcome is a trustworthy, accessible, fast, discoverable, measurable GreenStreet site whose public claims and promoted capabilities are supported by current evidence. The plan preserves the existing GreenStreet visual identity and working behavior. It does not authorize a broad redesign, a new component system, new analytics, publication of held tools, or creative promotion of unverified capabilities.

Every implementation ticket created from this plan must:

1. Capture the current behavior with a test, screenshot, trace, crawl, benchmark, or signed manual record.
2. Make the smallest scoped change that closes the ticket.
3. Be validated by an agent or human who did not build the change.
4. Record the previous deployable artifact or commit, exact rollback action, and rollback smoke test.
5. Stop if the baseline unexpectedly fails; the ticket may not absorb unrelated repair work.
6. Preserve working public, authenticated, and held-tool behavior unless the ticket explicitly changes it and all required gates approve that change.

The program must follow [SKILL_REGISTRY.md](./SKILL_REGISTRY.md) and [SKILL_COVERAGE_LEDGER.md](./SKILL_COVERAGE_LEDGER.md). A skill name is not permission to execute an on-disk copy. Repository-local skills remain quarantined while their lock mismatch is unresolved.

## 2. Current-state facts that shape the program

The current implementation is a React 19/Vite SPA deployed through Vercel with an Express server/function surface. It includes a custom router, route-level lazy imports, Webflow-derived marketing markup, GSAP/motion behavior, Firebase client/auth integration, HubSpot booking, a public blog, public educational pages, and numerous tool routes intentionally held from release.

The baseline review must explicitly account for these known risk concentrations:

- Vercel rewrites public paths to `index.html`; route-specific status codes and metadata therefore require rendered/crawl verification. A client-side `noindex` is not a substitute for correct HTTP behavior.
- Route metadata and JSON-LD are applied at runtime. Search-engine rendering, canonical consistency, social previews, and non-JavaScript behavior must be tested rather than assumed.
- The sitemap, canonical aliases, route registry, robots policy, and actual route outcomes must be reconciled from one canonical URL inventory. Known examples to verify include case-study child URLs, legal aliases, held tools, portal routes, and unknown-route behavior.
- The application warms all lazy route modules after first paint. This may trade route-transition smoothness for avoidable bandwidth, parse, memory, and interaction cost; only measurement may decide whether to retain or change it.
- The marketing surface includes Webflow CSS/scripts, inline behavior, GSAP, Swiper-like carousels, autoplay video, generated visual assets, and booking embeds. These are accessibility and Core Web Vitals concerns, not automatic defects.
- Reduced-motion handling exists in parts of the application, but the complete surface—including autoplay video, carousels, Webflow behavior, and route transitions—needs one end-to-end reduced-motion audit.
- Some lead forms are intentionally disabled or rerouted so the site does not claim a submission succeeded when no delivery backend exists. UX work must preserve that honesty until a verified capture pipeline is approved.
- Public copy includes time-sensitive or material statements about pricing, lender/program counts, state coverage, underwriting/funding, speed, verification, deterministic behavior, and testimonials. These require a claim-evidence ledger before optimization or promotion.
- Analytics and consent behavior has been deliberately limited in the build. No tag, session replay, ad pixel, fingerprinting, de-anonymization, or marketing event may be re-enabled without a data map, lawful-purpose decision, retention rule, vendor review, and human approval.

## 3. Program organization and subagent topology

The Program Steward owns sequencing, scope control, the evidence index, and cross-workstream go/no-go. Specialist agents work in bounded tickets. Builders may not validate their own changes.

### 3.1 Core roles

| Role | Primary responsibility | Skills or methods | Independent validator |
| --- | --- | --- | --- |
| Program Steward | Backlog, dependencies, change preservation, evidence index, decision log | `deliver-launch-checklist` requirement; registry and ledger | Release Governor |
| UX and Design Auditor | Preserve the design system; audit hierarchy, responsive behavior, forms, auth, motion, and new-surface quality | `design-director` audit-only, `prototype` conditional | Accessibility/E2E QA |
| Accessibility Auditor | WCAG 2.2 AA, keyboard, screen-reader, zoom/reflow, focus, motion, forms, errors | `accessibility`, `a11y-debugging` requirements | Separate accessibility reviewer plus product owner |
| Frontend Reliability Builder | Minimal React/UI fixes, loading/error behavior, route and interaction correctness | `react-best-practices`, `frontend-testing-debugging` | E2E QA |
| E2E QA Agent | Cross-browser critical-journey suite, traces, screenshots, console/network review | `playwright`, `e2e-testing` requirement | Release Governor samples evidence |
| Performance Agent | Lab/field performance, bundle/media/font/third-party analysis | `core-web-vitals` requirement, `react-best-practices`, `media-use` conditional | E2E QA plus Product owner for exceptions |
| Technical SEO Agent | Crawl/index/render/status/canonical/sitemap/robots/schema validation | `technical-seo-checker` requirement | Content/SEO reviewer |
| Market Research Agent | Competitor set, search demand, SERP intent, content gaps | `competitor-analysis`, `keyword-research`, `serp-analysis`, `content-gap-analysis` | Marketing owner |
| Content Strategy Agent | Briefs, new drafts, refreshes, internal links, GEO structure | `seo-content-writer`, `content-refresher`, `internal-linking-optimizer`, `geo-content-optimizer` | Content Quality Auditor |
| Content Quality Auditor | Claim evidence, CORE-EEAT/publish readiness, testimonial and case-study disposition | `content-quality-auditor`, `on-page-seo-auditor` | Counsel/pricing/tax owner as applicable |
| Entity and Metadata Agent | Canonical company identity, page metadata, schema, social previews | `entity-optimizer`, `meta-tags-optimizer`, `schema-markup-generator` | Technical SEO Agent |
| Measurement Analyst | Consent-safe measurement plan, dashboards, rank and business reporting | `rank-tracker`, `performance-reporter`, `visualize-data` | Privacy owner and Marketing owner |
| Release Governor | Preview certification, go/no-go, rollback rehearsal, production observation | `deliver-launch-checklist` requirement | Designated human release approver |
| Creative Producer | Only approved, non-deceptive visual/media work after product evidence is complete | `imagegen`, `media-use`, `product-launch-video` conditional | Content Quality, Accessibility, Product, Counsel |

### 3.2 Concurrency waves

Run no more than three specialist branches concurrently so the Program Steward remains available for coordination.

- Wave A: UX/Accessibility baseline, Performance baseline, Technical SEO/URL baseline.
- Wave B: Frontend reliability remediation, SEO/content research, Analytics/consent design.
- Wave C: Content and metadata production, E2E regression build-out, launch/rollback preparation.
- Wave D: Independent certification, human approvals, controlled launch, observation.

An agent may receive a follow-up ticket only after its prior evidence is accepted. Cross-cutting defects are returned to the owning builder; validators do not silently fix them.

## 4. Mandatory program artifacts

All artifacts are versioned, dated, and linked from one release evidence index.

1. Route and surface inventory: public, alias, noindex, held, authenticated, API, external, and unknown paths.
2. Critical-journey matrix: persona, entry path, action, expected state, failure states, device/browser, data needs.
3. Design-system preservation record: current tokens, type, color, spacing, motion, components, breakpoints, and approved exceptions.
4. Accessibility conformance report: WCAG 2.2 AA criteria, automated evidence, manual evidence, defects, exceptions, owners.
5. Performance baseline and budgets: page/template lab results, available field data, asset/bundle inventory, third-party cost, budgets.
6. SEO technical baseline: crawl, rendered HTML, HTTP status, canonical, robots, sitemap, structured data, internal links.
7. Canonical entity package: exact legal/brand name, domain, description, logo, approved profiles, licensing/disclosure facts, prohibited claims.
8. Claim-evidence ledger: claim, location, source, source owner, effective/expiry date, reviewer, permitted wording, disposition.
9. Content inventory and roadmap: target audience, intent, keyword cluster, lifecycle stage, evidence owner, review/expiry date.
10. Analytics measurement plan: events, properties, purpose, consent class, data destination, retention, access, QA, deletion path.
11. Release checklist: scope, approved changes, evidence, owners, go/no-go criteria, deployment steps, rollback steps.
12. Post-launch report: production validation, incidents, performance/SEO/analytics deltas, rollback decision, follow-up backlog.

## 5. Phase plan

### Phase 0 — Program control and clean baseline

Dependencies: clean worktree, reproducible install/build/test, known preview and production origins.

Work:

- Freeze opportunistic redesign, new trackers, content publication, and held-tool promotion.
- Reconcile current docs and audits into one finding-disposition matrix: active, fixed, duplicate, obsolete, accepted risk, or needs evidence.
- Resolve skill-status conflicts before invocation. In particular, the session may expose a globally installed skill whose same-named repository copy is quarantined. The Program Steward records the exact source used.
- Establish route, page-template, asset, third-party, form, auth, and content inventories.
- Define severity: release-blocking, high, normal, observation.
- Create the release evidence index and decision log.

Artifacts: baseline manifest, finding-disposition matrix, skill provenance record, evidence index, ownership/RACI.

Gate 0:

- Build and current tests are reproducible.
- No unexplained worktree change is included.
- Critical journeys and human approvers are named.
- Baseline defects are recorded, not silently normalized.

Rollback: no product change; revert only newly created planning artifacts if rejected.

### Phase 1 — UX, responsive, forms, auth, and design-system preservation

Dependencies: Gate 0 and route/surface inventory.

Work:

- Use `design-director` only as a scored audit. Preserve the existing GreenStreet identity; do not impose a new visual thesis, component library, or signature interaction.
- Record the current design system: tokens, fonts, colors, contrast pairs, spacing, radii, container widths, breakpoints, focus style, motion grammar, z-index layers, and recurring Webflow patterns.
- Review every public template at 360×800, 390×844, 768×1024, 1280×800, and 1440×900; add landscape and 200%/400% zoom where content or controls are dense.
- Check mobile navigation, sticky elements, modals, booking embeds, long headings, carousels, video, tables, calculators, legal copy, and browser back/forward behavior.
- Treat mobile as its own composition: order, priority, reading measure, thumb reach, keyboard avoidance, and reduced motion.
- Audit all forms for programmatic labels, field purpose/autocomplete, input mode, instructions, required state, inline and summary errors, preserved input, loading, duplicate-submit prevention, accurate success/failure, privacy notice, and no PII in URLs or logs.
- Preserve disabled-form honesty until a real owned endpoint, error handling, data map, and delivery verification exist.
- Audit auth journeys: signed out, sign in, verification, recovery, invalid credentials, expired/disabled account, rate limiting, offline, server failure, token refresh, sign out, and protected-route return path. Avoid account enumeration.
- Remove ambiguous duplicate interaction semantics. Webflow patterns that layer links and buttons must expose one predictable accessible action.
- Use `prototype` only for materially new interactions, isolated from production, with usability and feasibility evidence before implementation.

Artifacts: design-system preservation record, annotated journey map, responsive mismatch ledger, form/auth state contract, prioritized UX backlog, optional disposable prototypes.

Independent validation: Accessibility Auditor and E2E QA repeat the target journeys from fresh sessions on desktop and mobile.

Gate 1:

- No critical path loses working behavior.
- All changes are traceable to an observed defect or approved requirement.
- New interaction patterns have keyboard, touch, loading, empty, error, and recovery states.
- Product/design owner approves any visible exception to the preserved design system.

Rollback: ticket-level UI revert and previous screenshot/trace comparison.

### Phase 2 — WCAG 2.2 accessibility and inclusive motion

Dependencies: Gate 1 surface inventory; implementation may proceed in small tickets alongside later phases.

Work:

- Run automated checks as discovery only; manual testing decides conformance.
- Validate landmarks, page title, language, heading hierarchy, lists, tables, labels, names/roles/values, link purpose, and status announcements.
- Test complete keyboard operation: visible focus, logical order, no traps, skip link, menu behavior, modal focus trap/escape/restore, carousel controls, iframe boundaries, and route-change focus management.
- Test NVDA + Chrome and at least one additional screen reader/browser pairing. Sample every template and fully test every critical journey.
- Verify contrast, non-text contrast, focus appearance, text spacing overrides, 320 CSS-pixel reflow, 200%/400% zoom, target size/spacing, pointer cancellation, and orientation.
- Ensure validation errors are identified in text, associated to fields, summarized, and announced without clearing valid input.
- Apply one global reduced-motion contract. With `prefers-reduced-motion: reduce`, stop autoplay carousels, decorative looping video, scroll-jacking/pinned motion, animated counts, and nonessential transitions; preserve content visibility and function.
- Provide pause/stop controls for motion that starts automatically and lasts beyond the applicable threshold. Avoid autoplay audio.
- Ensure video has an accessible name or is explicitly decorative, plus captions/transcript where it conveys information.
- Test forced colors, high contrast, data saver, zoom, and keyboard-only operation for critical paths.

Artifacts: WCAG criterion matrix, automated scan exports, manual keyboard/screen-reader scripts, defect evidence, exception register.

Independent validation: a second accessibility reviewer repeats all release-blocking findings and a risk-based sample of passes.

Gate 2:

- No known WCAG 2.2 A/AA blocker remains on a critical journey.
- Any exception has impact, workaround, owner, target date, and accessibility-owner approval.
- Reduced-motion users receive complete content and equivalent functionality.

Rollback: revert each accessibility ticket independently; never roll back to a state with a more severe barrier without human release approval.

### Phase 3 — Frontend reliability and end-to-end QA

Dependencies: journey matrix, form/auth contracts, Gate 1.

Work:

- Apply `react-best-practices` only to measured or reproducible problems: waterfalls, over-eager bundles, duplicated global listeners, expensive rendering, unstable effects, or poor transition behavior.
- Use `frontend-testing-debugging` for exact flow reproduction, console/network evidence, screenshot comparison, and minimal fixes.
- Use `playwright` for browser exploration and release evidence. The durable suite remains an `e2e-testing` requirement and must not be replaced by ad hoc screenshots.
- Cover home, navigation, every public page template, all articles, legal aliases, calculator, booking, disabled forms, held routes, authentication, portal authorization, direct deep links, refresh, back/forward, external links, offline/API failures, 404/unknown paths, and error boundaries.
- Run Chromium, Firefox, and WebKit for critical journeys; use a risk-based Chromium matrix for the full route inventory.
- Add mobile, reduced-motion, slow-network, throttled CPU, expired session, blocked third-party, and empty/error data scenarios.
- Assert page identity, meaningful content, correct URL/status outcome, no framework overlay, no unexplained console errors, no failed required assets, expected focus, and user-visible state change.
- Capture traces and screenshots on failure; keep test data non-production and deterministic.

Artifacts: E2E scenario matrix, durable test suite, browser/viewport matrix, traces/screenshots, console/network disposition log.

Independent validation: Release Governor runs the suite from a clean environment and manually samples critical paths.

Gate 3:

- Critical journeys pass in all required browsers and mobile viewports.
- No unexplained console error, broken required asset, or misleading form state remains.
- Flaky tests are quarantined only with owner, reason, expiry, and equivalent manual release check.

Rollback: revert failing UI ticket; restore previous preview; run critical smoke suite.

### Phase 4 — Core Web Vitals, React delivery, media, and third parties

Dependencies: stable page templates and Gate 0 baseline.

Budgets:

- Mobile p75 field targets: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.10.
- Lab targets are template-specific and stricter enough to protect field targets.
- No page may exceed an approved JavaScript, CSS, image, video, font, or third-party budget without a documented exception.

Work:

- Establish lab baselines for each template and field baselines where enough real data exists. Label every metric Measured, User-provided, Estimated, or N/A.
- Record LCP element, long tasks, interaction latency, layout-shift sources, TTFB, critical request chain, bundle composition, cache headers, font behavior, and third-party work.
- Measure the current all-route idle warmup. Compare it with intent-based prefetch on hover/focus, viewport/priority prefetch, and no prefetch. Choose by total transfer, memory, INP, and navigation latency—not intuition.
- Keep route and heavy-feature code conditional. Defer Firebase, markdown, analytics, booking, and other noncritical code until its owning experience needs it.
- Optimize the Webflow/GSAP layer without changing appearance: remove duplicate/dead runtime work, use passive listeners, batch DOM reads/writes, animate transform/opacity, clean up animation contexts, and avoid layout thrash.
- Give media explicit dimensions and stable aspect ratios. Use responsive modern images and real size variants. Lazy-load below-fold media.
- For decorative hero/section video: supply a poster, use the minimum preload, pause offscreen, respect reduced motion and data saver, avoid duplicate copies, and evaluate WebM/AV1/H.264 delivery by measured compatibility/weight.
- Self-host/subset/preload only critical fonts when it improves measured delivery; preserve typography and use an approved fallback/font-display strategy.
- Defer third parties until needed and consented. A blocked HubSpot or analytics origin must not break core navigation or forms.
- Add synthetic performance checks to CI and consent-reviewed RUM only after the analytics/privacy gate.

Artifacts: performance baseline, budgets, waterfall/bundle reports, media inventory, before/after comparison, exception register.

Independent validation: E2E QA verifies visual/function parity; Performance Agent reruns from a clean build and representative mobile profile.

Gate 4:

- Budgets pass or the Product owner signs a time-bounded exception.
- Improvements do not regress accessibility, content, auth, or route behavior.
- No optimization claim is based on one warm run.

Rollback: restore prior assets/chunks/configuration and rerun performance plus critical-journey smoke tests.

### Phase 5 — Technical SEO and canonical URL architecture

Dependencies: canonical entity facts, route inventory, public/held decision for every route.

Work:

- Establish one canonical route manifest that drives routing, status behavior, metadata, sitemap membership, redirects, internal links, and tests.
- Decide and implement an indexable-rendering strategy for public routes: build-time prerender or server-rendered route HTML. Client-only metadata is insufficient release evidence.
- Return true 404/410 outcomes for unknown/retired content where the platform allows; avoid a universal successful HTML response that only becomes a client-side not-found page.
- Define one preferred host and protocol. Use permanent redirects for aliases and ensure canonical, sitemap, Open Graph URL, JSON-LD URL, and internal links agree.
- Reconcile legal aliases and sitemap entries. Remove noindex, held, authenticated, nonexistent, redirect-only, and error URLs from the sitemap.
- Validate robots.txt against actual policy, including authenticated areas, APIs, previews, and an explicit human choice for AI crawler handling. Robots exclusion is not access control.
- Generate route-specific static titles, descriptions, robots directives, canonical URLs, Open Graph/Twitter tags, and social images.
- Add only visible-content-aligned schema. Candidate types: `Organization`, `WebSite`, `WebPage`, `Article`/`BlogPosting`, and `BreadcrumbList`. Use `FAQPage` only for semantic value and visible Q&A, not a rich-result promise.
- Do not add `FinancialProduct`, `LoanOrCredit`, `Offer`, `Review`, `AggregateRating`, `LocalBusiness`, rate, price, or availability properties without counsel and claim evidence.
- For articles, require approved author/publisher identity, headline, image, published/modified dates, main entity, citations, and visible disclosure alignment.
- Crawl both raw and rendered HTML. Validate response status, indexability, canonical, schema, internal links, headings, images, mobile rendering, and security/HTTPS.
- Verify preview environments are noindex and not included in canonical/sitemap signals.

Artifacts: canonical route manifest, redirect map, raw/rendered crawl reports, metadata matrix, sitemap/robots policy, schema inventory and validation results.

Independent validation: a separate SEO reviewer samples every route class and all redirect/noindex/error cases.

Gate 5:

- Every public URL has one indexation decision and one canonical outcome.
- Sitemap contains only canonical, indexable, successful URLs.
- Unknown routes and held/auth routes cannot masquerade as indexable content.
- Structured data validates and contains no unsupported fact.

Rollback: restore previous route/metadata artifact; remove newly added sitemap/schema entries; re-crawl critical route classes.

### Phase 6 — Market research, content, claims, E-E-A-T, and entity identity

Dependencies: Gate 5 URL model, approved entity package, claim-evidence owners.

Research sequence:

1. `entity-optimizer`: establish canonical GreenStreet identity before metadata, schema, GEO, or author/entity work.
2. `competitor-analysis`: select 3–5 direct, indirect, and content competitors; label metrics Measured, User-provided, Estimated, or N/A.
3. `keyword-research`: map audience, geography, intent, demand, difficulty, and pillar/cluster opportunities.
4. `serp-analysis`: verify live SERP composition and intent for priority queries; do not infer rankings from memory.
5. `content-gap-analysis`: compare GreenStreet’s approved inventory with competitors and prioritize gaps by audience, intent, evidence burden, and business value.
6. `seo-content-writer` or `content-refresher`: draft only from an approved brief and source packet.
7. `geo-content-optimizer`: add answer-first, quotable, cited structure without overstating certainty.
8. `content-quality-auditor`: run publish-readiness and veto checks.
9. `on-page-seo-auditor`, `meta-tags-optimizer`, `schema-markup-generator`, and `internal-linking-optimizer`: complete the approved page package.

Claims and content work:

- Inventory every statement about rates, lender/program counts, state coverage, close times, underwriting/funding role, eligibility, reliability, deterministic outputs, security, customer results, and regulatory/tax effects.
- Each material claim needs a versioned source, owner, effective/expiry date, scope/limitations, permitted wording, and human reviewer.
- Time-sensitive pages receive an explicit review date and fail-closed expiry treatment. Date-only refreshing is prohibited.
- Testimonials and case studies require real consent, provenance, approved attribution, substantiated outcomes, and disclosure. Composite/generated people, companies, logos, or deals may not be presented as real customer evidence.
- Content discussing state rules, tax, lending eligibility, pricing, disclosures, licensing, fair lending, or privacy cannot publish from agent research alone.
- E-E-A-T package: named qualified reviewer where appropriate, author/editor identity, methodology, limitations, primary sources, dateModified discipline, corrections/contact path, and clear educational/not-commitment boundaries.
- Internal linking connects pillar, cluster, calculator, FAQ, borrower profile, product, and conversion pages only where the target is approved, available, and relevant. Held tools are not used as conversion bait.
- `geo-content-optimizer` means generative-engine optimization, not geographic licensing permission. State/location content always requires jurisdiction-specific counsel review.

Artifacts: entity package, competitor brief, keyword/topic map, SERP evidence, gap backlog, editorial calendar, source packets, claim-evidence ledger, page packages, internal-link map, refresh calendar.

Independent validation: Content Quality Auditor plus Technical SEO Agent; counsel/pricing/tax/privacy reviewers approve their domains.

Gate 6:

- Content Quality verdict is SHIP, with no unresolved trust veto.
- Every regulated or time-sensitive claim has current human approval.
- No fictitious or composite evidence can be mistaken for a real customer, lender, program, rate, deal, or outcome.
- Metadata, schema, and social cards match visible approved content.

Rollback: unpublish or noindex affected content, remove internal links/schema/sitemap entry, restore prior approved version, and document correction.

### Phase 7 — Consent, analytics, experimentation, and reporting

Dependencies: privacy/security data map, approved business KPIs, Gate 3 stable journeys.

Work:

- Write the measurement hierarchy before selecting tools: business outcome → funnel stage → KPI → event → properties → owner → decision enabled.
- Define events for page view, CTA intent, booking start/success, lead start/success/failure, calculator start/complete, auth state, held-tool encounter, content engagement, and error/recovery only when each has a legitimate purpose.
- For every event/property record purpose, consent category, PII risk, destination, retention, access, deletion path, environment, sampling, and owner.
- Do not send raw email, phone, name, address, property details, loan values tied to identity, auth tokens, error payloads, or free text to analytics.
- Decide whether performance telemetry is essential or consented; document the legal/privacy rationale. Keep marketing analytics, advertising, session replay, fingerprinting, and de-anonymization off until explicitly approved.
- Implement consent defaults that fail closed, honor withdrawal, prevent pre-consent firing, preserve core function without consent, and support regional policy.
- Build an analytics QA suite: one event per action, correct properties, no duplicates on SPA navigation, no events in preview/test unless isolated, no PII, consent respected, booking cross-origin behavior verified.
- Define KPI formulas and denominators: qualified booking conversion, form completion/error, calculator completion, auth success/recovery, content-assisted conversion, organic landing conversion, Core Web Vitals pass rate.
- Use `rank-tracker` only after target keywords, markets, device, baseline date, and ownership are approved.
- Use `performance-reporter` for a fixed monthly cadence with comparable windows, annotations, confidence/limitations, and named decisions.
- Use `visualize-data` for decision-useful, reproducible charts; never hide small denominators, missing data, sampling, or consent bias.
- Experimentation requires a hypothesis, primary metric, guardrails, power/duration plan, audience allocation, consent compatibility, stop rule, and rollback. Do not A/B test regulated disclosures or unsupported claims.

Artifacts: data inventory, tracking plan, event dictionary, consent matrix, analytics QA evidence, KPI dictionary, dashboard/report spec, experiment template.

Independent validation: Privacy/Security reviewer inspects data flow; Measurement Analyst validates events from browser and destination; Marketing owner validates KPI decisions.

Gate 7:

- Zero unauthorized tracker request before consent.
- Zero direct identifier or sensitive loan/property payload in analytics.
- Events and KPIs reproduce from source data with documented formulas.
- Consent withdrawal and no-consent critical journeys pass E2E tests.

Rollback: disable tags/flags at the approved control point, verify network silence, preserve core flows, and document downstream deletion/containment if data was sent incorrectly.

### Phase 8 — Release candidate, rollback rehearsal, launch, and observation

Dependencies: Gates 0–7, human approvals, deployable previous artifact.

Release-candidate work:

- Freeze scope and generate a change manifest tied to evidence.
- Certify preview using the full critical-journey suite, risk-based route suite, accessibility checks, performance budgets, raw/rendered SEO crawl, schema validation, analytics/consent QA, security checks, and content approval ledger.
- Rehearse rollback before production: identify prior deployment, execute rollback in a safe environment where possible, run smoke tests, and record duration/owner.
- Prefer staged release or flags for high-risk surfaces. New financial tools and trackers default off.
- Prepare customer/support communication for actual verified changes, known limitations, and support/escalation paths.

Go criteria:

- All release-blocking findings closed with evidence.
- Required human approvals are written and linked.
- Critical E2E journeys pass on supported browsers/devices.
- WCAG blocker count is zero.
- Performance budgets pass or have signed, time-bounded exceptions.
- SEO route/status/canonical/sitemap/robots/schema checks pass.
- Analytics consent and PII checks pass.
- Production config/secrets/environment ownership is confirmed without exposing values.
- Rollback is tested, timed, and assigned.

No-go criteria:

- Unsupported lending, pricing, licensing, state-law, tax, security, customer, or performance claim.
- A held tool becomes reachable or indexable without its own model/data/human release packet.
- Auth/access-control failure, data exposure, tracker-before-consent, or PII in telemetry.
- Critical keyboard/screen-reader barrier or misleading form success.
- Unknown route returns an indexable duplicate; canonical/sitemap points to held, nonexistent, redirect-only, or noindex content.
- Unexplained regression, flaky critical test, missing previous artifact, or untested rollback.

Launch:

- Deploy in the approved window with Release Governor and rollback owner present.
- Run production smoke checks immediately: status/headers, home, top landing pages, calculator, booking/lead, auth, held routes, unknown route, consent/no-consent, analytics network, sitemap/robots, and error monitoring.
- Observe at 15 minutes, 1 hour, 4 hours, 24 hours, 72 hours, 7 days, and 30 days.

Rollback triggers:

- Security/privacy exposure or unauthorized tracking: immediate rollback/disable.
- Auth, lead, booking, calculator, or navigation failure above approved threshold.
- Material SEO status/canonical/noindex/sitemap failure.
- Severe accessibility regression on a critical path.
- Performance regression beyond budget with clear release correlation.
- Published false or expired claim.

Post-launch:

- Record production results and all deviations.
- Compare business, UX, accessibility, performance, SEO, and error metrics with annotated baselines.
- Use `performance-reporter` and `rank-tracker` only after enough comparable data exists.
- Close the release only after rollback window, incident review, evidence archive, and ownership of remaining work.

## 6. Skill invocation matrix

This matrix is intentionally conservative. `Active catalog` means callable after its trigger and full skill review. `Required unavailable` means the work remains mandatory but the named skill is not authorized. `Conditional` means do not invoke before the stated product gate. Same-named repository copies remain quarantined even if a verified global catalog version exists.

| Skill or method | Status | Trigger | Required output | Independent validation | Human gate |
| --- | --- | --- | --- | --- | --- |
| `design-director` | Active catalog; audit-only | A new/materially changed public surface reaches UX review | Preservation-focused scorecard and scoped recommendations | Accessibility/E2E QA compares baseline and result | Product/design owner |
| `frontend-testing-debugging` | Active catalog | A rendered UI defect or UI change has an exact target flow | Reproduction, minimal fix evidence, console/network/screenshot QA | E2E QA reruns flow | None |
| `playwright` | Active catalog | Browser exploration or release evidence is needed | Trace, screenshots, DOM/state assertions | Release Governor samples run | None |
| `e2e-testing` | Required unavailable | A critical journey changes or release candidate is cut | Durable cross-browser suite and scenario matrix | Release Governor clean run | None |
| `accessibility` | Required unavailable | Any user-facing route/form/auth flow changes | WCAG 2.2 audit and manual evidence | Second accessibility reviewer | Accessibility owner for exceptions |
| `a11y-debugging` | Required unavailable | A specific accessibility defect is found | Reproduction, targeted fix, regression evidence | Accessibility reviewer | None |
| `core-web-vitals` | Required unavailable | Baseline, public-template change, or performance miss | Field/lab report, budgets, before/after | Performance reviewer plus E2E parity | Product owner for exception |
| `react-best-practices` | Active catalog | React component, route, loading, listener, render, or bundle behavior changes | Scoped design note and measured/tested result | UI/E2E QA | None |
| `technical-seo-checker` | Status conflict; conservatively blocked until registry reconciliation | Public route/metadata changes and every release candidate | Raw/rendered crawl and prioritized repair plan | Independent SEO reviewer | Marketing owner |
| `competitor-analysis` | Active catalog | Annual/quarterly strategy refresh or new market entry | 3–5 competitor evidence brief with labeled metrics | Content reviewer samples evidence | Marketing owner |
| `keyword-research` | Active catalog | Topic clusters or landing-page targets are selected | Intent/volume/difficulty/topic-cluster map | Marketing owner validates demand and fit | Marketing owner |
| `serp-analysis` | Active catalog | A priority query is approved for evaluation | Live SERP composition, intent, difficulty, opportunities | Separate reviewer repeats sample | Marketing owner |
| `content-gap-analysis` | Active catalog | Own/competitor inventories are available | Competitor-relative prioritized gap backlog | Content reviewer verifies named gaps | Marketing owner |
| `seo-content-writer` | Active catalog | Approved brief, keyword, entity facts, and source packet exist | Citation-ready draft with disclosures and `[needs source]` flags | Content Quality Auditor | Counsel for regulated content |
| `content-refresher` | Active catalog | Existing page has dated claims, decay, or lifecycle review | Refresh plan, sourced changes, date treatment, next review | Content reviewer compares before/after | Content owner/counsel as applicable |
| `content-quality-auditor` | Active catalog | Any public draft, claim, testimonial, case study, rate, or legal copy is proposed | Publish verdict, claim ledger links, prioritized fixes | Independent content reviewer | Counsel/pricing/tax/privacy by subject |
| `on-page-seo-auditor` | Active catalog | Approved public page is ready for page-level review | Scored title/header/content/link/image audit | Independent SEO reviewer | Marketing owner |
| `meta-tags-optimizer` | Active catalog | Approved page intent and visible content are stable | Title/description/OG/Twitter/canonical package | Technical SEO/social-preview QA | Marketing owner |
| `schema-markup-generator` | Active catalog | Entity/page facts are approved and visible | Valid JSON-LD plus property-to-visible-content map | Schema lint + independent SEO review | Counsel for financial/review/offer implications |
| `internal-linking-optimizer` | Active catalog | Canonical inventory and approved clusters exist | Source/target/anchor map, orphan/crawl-depth report | Crawl and broken-link check | Marketing owner |
| `entity-optimizer` | Active catalog | Legal business identity must be established or reconciled | Canonical entity profile and consistency actions | Business/counsel verifies facts | Business/licensing owner |
| `geo-content-optimizer` | Active catalog | Approved content targets AI-answer queries | Quotable cited blocks, query coverage, GEO self-check | Content Quality Auditor | Counsel for regulated/state content |
| `rank-tracker` | Active catalog | Keywords/market/device and privacy ownership are approved | Versioned baseline and reporting cadence | Measurement Analyst verifies configuration | Privacy/marketing owner |
| `performance-reporter` | Active catalog | Monthly/launch review has comparable data | KPI report with sources, windows, caveats, decisions | Analytics/marketing owner | Marketing owner |
| `visualize-data` | Active catalog | A KPI, funnel, CWV, ranking, or content relationship needs a visual | Reproducible dataset and decision-useful chart | Analyst checks calculations and denominators | Data/marketing owner |
| `prototype` | Active catalog; conditional | Materially new interaction/tool is being considered | Disposable prototype plus usability/feasibility findings | UX, Accessibility, and domain reviewer | Product owner |
| `imagegen` | Active catalog; conditional | Original non-deceptive visual is approved and needed | Asset, prompt/provenance record, alt-text plan | Content Quality/Accessibility review | Marketing/legal owner |
| `media-use` | Active catalog; conditional | Owned media needs optimization, captions, poster, or transcript | Provenance, transformed media, captions/transcript, performance evidence | Accessibility/Performance review | Content owner |
| `product-launch-video` | Conditional; repository copy quarantined | All promoted capabilities have passed release evidence and video is approved | Claim-by-claim script/asset review, captions, variants | Content Quality + Accessibility | Product, counsel, marketing |
| `deliver-launch-checklist` | Required unavailable | Release candidate is proposed | Signed checklist, go/no-go, rollback rehearsal | Release Governor | Designated release approver |

## 7. Human approval matrix

Agents prepare evidence; they do not make these decisions.

| Decision | Approver | Minimum evidence |
| --- | --- | --- |
| Lending identity, licensing, advertising, disclosures, state law, TILA/RESPA/UDAAP/ECOA/Fair Housing | Mortgage/licensing counsel | Jurisdiction-specific dated sources and approved wording |
| Rates, program counts, eligibility, underwriting/funding role, close-time claims | Pricing and underwriting owners | Versioned effective source, scope, expiry, limitations |
| Tax law, depreciation, recapture, passive-loss or tax-engine statements | Tax professional | Tax-year sources, reviewed scenarios, limitations |
| Privacy, GLBA/Safeguards, CCPA/CPRA, consent, analytics, replay, retention, PII | Privacy counsel and security owner | Data map, purpose, vendor terms, retention/access/deletion, QA |
| Quantitative output or held-tool release | Independent quantitative validator and model owner | Independent reproduction, tolerances, boundaries, fail-closed tests |
| Brand identity, testimonials, case studies, creative promotion | Business/marketing owner and counsel | Identity package, consent/provenance, claim ledger |
| Performance/accessibility exception | Product owner plus domain owner | User impact, workaround, duration, owner, remediation date |
| Production release/rollback | Designated release approver | Complete release packet and rollback rehearsal |

## 8. Release evidence packet and closure rule

Each release packet contains:

- scope and change manifest;
- baseline and minimal-change evidence;
- test/build/static-analysis results;
- critical E2E traces and screenshots;
- accessibility report;
- performance report and budgets;
- raw/rendered SEO crawl, metadata/schema/sitemap/robots evidence;
- claim/content approval ledger;
- analytics/consent/PII QA;
- security/configuration sign-off;
- human approvals;
- previous artifact, rollback command/process, rehearsal evidence, and rollback smoke test;
- production observation record and open-risk owners.

A phase is not complete because an agent produced a report. It is complete only when the required artifact exists, the independent validator records a result, the human gate is satisfied where required, and rollback evidence is usable.

## 9. Program definition of done

The UX/growth/release program is complete when:

1. All canonical public routes are accessible, responsive, fast, correctly indexed, and represented consistently across status, metadata, canonical, sitemap, schema, and internal links.
2. Authenticated, held, error, and unknown routes behave and index exactly as approved.
3. Critical journeys pass supported browser, mobile, keyboard, reduced-motion, consent, and failure-state testing.
4. No known WCAG 2.2 A/AA blocker remains on a critical journey.
5. Core Web Vitals meet budgets or have approved time-bounded exceptions.
6. Every public material claim has current evidence, owner, expiry, and appropriate human approval.
7. Content has a defined audience/intent, source packet, E-E-A-T review, accurate metadata/schema, and lifecycle owner.
8. Analytics is purpose-limited, consent-correct, PII-safe, reproducible, and tied to decisions.
9. The release and rollback paths are tested, owned, timed, and documented.
10. Post-launch evidence shows no material regression, remaining risks have owners/dates, and the release record is archived.
