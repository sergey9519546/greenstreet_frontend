# Greenstreet Finance Release Audit

Date: 2026-07-25  
Scope: public website, React/Webflow boundary, financial tools, API validation, accessibility, SEO, performance, release process, and business-trust content.

## Executive decision

The current homepage is the accepted visual reference. It must not be redesigned, approximated, or translated into a generic “React-looking” page.

The correct target is:

- Homepage: identical visual output, interactions, type, spacing, media, and responsive behavior.
- Other pages: their own information architecture and layouts, using the same Greenstreet visual system.
- React: owns rendering and routing.
- Webflow assets: remain temporarily as a compatibility layer until every dependency is mapped and replaced without visual drift.

Removing Webflow and preserving the design are separate operations. Rewriting the homepage from memory or from a component library would lose the accepted design. The migration must be contract-driven and incremental.

## Current release status

| Area | Status | Release decision |
|---|---|---|
| Homepage visual output | Fixed and contract-protected | Release |
| React ownership of homepage DOM | Fixed | Release |
| DSCR Calculator / Deal Analyzer basis | Reconciled | Release |
| STR interest-only input | Fixed | Release |
| API enum and state validation | Fixed | Release |
| Sensitivity direction | Fixed | Release |
| Unknown-state PPP handling | Fixed, fails closed | Release |
| Booking route | Replaced broken scheduler with scenario intake | Release after intake delivery is verified in production |
| InvestGO workspace | Graceful hold when client authentication is unconfigured | Release; production sign-in still requires end-to-end verification |
| Decision Support | Unverified model | Reliability hold |
| Tax Engine | Unverified tax model | Reliability hold |
| Refinance Tracker | Unverified refinance model | Reliability hold |
| Portfolio Refinance | Unverified portfolio model | Reliability hold |
| Rate-Path / Monte Carlo | Unverified calibration | Reliability hold |
| ARM Reset | Unverified payment/reset schedule | Reliability hold |
| Returns | Unreconciled cash-flow/tax schedule | Reliability hold |
| Stress Matrix | Inconsistent base definitions | Reliability hold |
| Structure Optimizer | Unverified schedules/rate units/ranking | Reliability hold and API 503 |
| Business identity and licensing disclosures | Owner evidence missing | Must be supplied before making lender/broker claims |
| Case-study substantiation | Owner evidence missing | Relabel composites or provide source evidence |

## Corrections implemented in this release

### React/Webflow boundary

- The accepted homepage markup is stored as a frozen source artifact.
- React renders the accepted homepage through a dedicated marketing root.
- A SHA-256 contract check fails if the accepted markup changes unintentionally.
- SPA typography no longer leaks into the homepage and changes its measurements.
- Route pages no longer carry a hidden duplicate homepage DOM.
- The external Webflow CSS/runtime remains only as an explicit compatibility layer.

This preserves the accepted output while allowing React to own the page. It is not the final removal of Webflow.

### Financial correctness and fail-closed behavior

- Invalid interest-only values such as `"0"` no longer fall through to 10-year interest-only treatment.
- Loan, property, strategy, interest-only, and US state inputs use strict schemas.
- Unknown states no longer receive a favorable prepayment-penalty assumption.
- Sensitivity risk now decreases as a deal gains rent-loss cushion and becomes critical when already broken.
- Deal Analyzer and DSCR Calculator use one shared public-analysis function.
- Lender DSCR is explicitly gross rent divided by PITIA.
- Investor cash flow is explicitly Track 2 operating income less PITIA.
- Vacancy, management, and maintenance assumptions are visible and consistent across both public calculators.
- The maximum-purchase solver now includes HOA.
- Tools with unverified outputs show an honest reliability hold instead of a recommendation.
- The structure-optimizer API returns `503 TOOL_RELIABILITY_HOLD` instead of an unverified ranking.

### Website and release hygiene

- `/book-demo` is a dedicated scenario-review route.
- The dead HubSpot scheduler is no longer shown as a working calendar.
- Unknown paths render a branded no-index 404 view instead of silently showing the homepage.
- Missing workspace authentication configuration renders a reliability hold instead of crashing.
- The sitemap now contains real canonical public routes, article routes, and case-study routes.
- Held tools and stale paths are removed from the sitemap.
- `/.well-known/security.txt` is published.
- Unsafe route modules are no longer warmed in the initial idle prefetch.

## Critical business and trust issues requiring owner evidence

These cannot be truthfully invented in code.

### 1. Lending identity is contradictory

The site uses language that can make Greenstreet sound like a direct lender that underwrites and funds in-house. Other copy describes a partner or wholesale relationship. The legal entity, role, and counterparty must be consistent everywhere.

Required owner-supplied facts:

- exact legal business name;
- whether Greenstreet is a lender, broker, marketplace, software provider, or a combination;
- NMLS and relevant license identifiers, if applicable;
- business address and verified contact channels;
- state availability;
- the identity and role of any funding or brokerage partner;
- which entity issues disclosures, terms, approvals, and funding.

Recommended change:

Create one approved “business identity block” and reuse it in the footer, About, Legal, application/intake, and product disclosures. Remove every claim that cannot be supported by that block.

### 2. Case studies and “real results” need substantiation

Named clients, exact savings, exact close times, and exact portfolio figures look like factual endorsements. If they are composites, they must be labeled as composites. If they are real, retain written permission and a source file for every quantitative claim.

Recommended change:

- replace “real results” with “illustrative scenarios” until evidence is approved;
- add methodology and material assumptions;
- use anonymous ranges when client permission is unavailable;
- never use an invented logo, person, lender, or transaction.

### 3. Intake delivery is configuration-dependent

The scenario intake correctly fails closed when Firebase is not configured and does not claim a successful delivery. Production still needs an end-to-end owner test proving:

- the lead is written to the intended project;
- Firestore rules accept only the intended payload;
- an authorized person receives or monitors the request;
- privacy/deletion processes work;
- consent text matches the actual contact workflow.

### 4. Market, legal, and tax claims need versioned sources

“Current,” “verified,” or state-specific claims require a source URL, source date, review date, reviewer, jurisdiction, and effective date. A June snapshot cannot be presented as continuously current.

Recommended change:

Add a visible provenance drawer to every legal, pricing, tax, and state result. If provenance is incomplete or expired, the tool must show “verification required” and withhold the decision output.

## Financial tool findings

### Corrected

| Finding | Why it was wrong | Correction |
|---|---|---|
| STR `"0"` IO value became 10-year IO | permissive default materially improved payment and DSCR | strict enum and exhaustive IO conversion |
| Unknown state received PPP assumptions | unsupported jurisdiction could receive favorable output | strict state codes and `UNKNOWN` fail-closed result |
| Sensitivity rating reversed | larger cushion was labeled more risky | monotonic risk classification |
| Public calculators disagreed with canonical cash flow | gross-rent and operating-income bases were mixed | shared analysis function and explicit Track 1/Track 2 labels |
| Visible rate could be ignored | displayed input and model input diverged | public analysis uses the entered rate |
| Max purchase omitted HOA | understated PITIA and overstated buying power | HOA included in the solver |

### Held pending independent validation

| Tool | Non-standard or unsafe behavior found | Required correction |
|---|---|---|
| Decision Support | ignored visible rate, used proxy IRR, hard-coded Texas, presented fabricated lender terms and “legal clear” language, and used weights not totaling 100 | one canonical scenario, verified program source data, normalized scoring, no legal-clear verdict |
| Tax Engine | NIIT, recapture, cost segregation, passive-loss, and cash-invested paths were not reconciled | reviewed tax schedule with golden cases and effective-date sources |
| Returns | omitted capex, clamped equity multiple, and exposed an unverified after-tax IRR | complete acquisition-to-sale cash-flow schedule and independent IRR checks |
| Structure Optimizer | mixed rate units, amortized structures incorrectly, and ranked gross coverage as if it were investor cash flow | structure-specific schedules and dual lender/investor ranking |
| ARM Reset | reset/payment behavior did not reliably carry interest-only and contract terms | index, margin, caps, reset dates, and schedule tests |
| Stress Matrix | scenarios used inconsistent payment and income bases | one canonical base deal and explicit shock definitions |
| Refinance Tracker | could recommend a new loan smaller than payoff | payoff, costs, cash-to-close, and break-even validation |
| Portfolio Refinance | used fabricated or incomplete loan-level refinance assumptions | loan-level schedules, seasoning, costs, and concentration checks |
| Monte Carlo | probabilities looked authoritative without reviewed calibration | documented calibration, reproducible seeds, loan-specific terms, and confidence limits |

### Still open in released educational surfaces

- The Rate Quiz maps self-selected answers to static program/rate bands. It must not be described as live pricing.
- The qualification modal contains a lightweight estimate path that must stay labeled preliminary and must not conflict with the full calculator.
- State-law content includes time-sensitive summaries, including Minnesota material, that require legal review and dated primary sources.
- Reassessment, reserves, insurance, and tax assumptions are estimates, not property-specific facts.
- “NOI_PI” style internal names should be removed where the calculation is actually gross rent divided by principal and interest.

## Website, accessibility, and content findings

### P0 — trust and conversion

- Business identity and licensing are not consistently disclosed.
- The booking URL was broken and the iframe falsely appeared “ready.” The release removes it.
- Case studies read as verified customer results without visible substantiation.
- “In-house,” “partner,” “lender,” “program,” and funding language is inconsistent.
- Counts such as lender count and program count disagree across pages.
- A financial website should not claim “bank-grade security” without a defined control set and evidence.

### P1 — architecture and performance

- The homepage payload is very large and includes many scripts, images, and autoplay videos.
- The compatibility page still loads Webflow runtime, Finsweet, Swiper, analytics, consent tooling, and external media.
- The historical implementation warmed nearly every route after first paint; unsafe route modules have now been removed, but the remaining prefetch policy should become intent-based.
- Firebase remains a large lazy chunk. It should stay lazy and be replaced with a narrow server-side intake endpoint if lead delivery is the only public use.
- The project mixes component styling, injected page CSS, Tailwind utilities, Webflow classes, and token imports.
- Vite still warns about a non-module Webflow script and a chunk over 500 kB.
- The local shell currently uses Node 25 while the project contract requires Node 20.x.
- Dependency audit reports moderate transitive `uuid` findings with no safe non-breaking automated update currently offered.

Recommended change:

1. Keep the homepage fidelity contract.
2. Inventory every external script and remove it only after its exact behavior has a tested React replacement.
3. Load route chunks on navigation intent, not all at idle.
4. Move page CSS into scoped modules or a shared token/component layer.
5. Replace Firebase client intake with a small authenticated/rate-limited server endpoint.
6. Establish performance budgets for HTML, JS, images, videos, and third-party hosts.

### P1 — accessibility

The accepted homepage source contains:

- many empty image alternatives;
- duplicate IDs;
- an unnamed close control;
- placeholder-only form fields;
- a non-semantic hamburger/menu trigger.

Recommended change:

- decorative images: keep empty `alt`;
- meaningful images: use concise contextual alternatives;
- controls: use native `button` elements with accessible names and state;
- fields: use persistent labels, descriptions, and inline errors;
- IDs: enforce uniqueness in CI;
- menus/dialogs: test focus order, escape behavior, focus return, and reduced motion.

Accessibility cleanup must be done against screenshot and interaction baselines because changing Webflow structure can alter the accepted visual output.

### P1 — search and metadata

- The SPA serves the same base HTML metadata for most routes.
- Unknown routes still receive HTTP 200 from the catch-all rewrite even though the client now renders a 404 view.
- There is no route-specific JSON-LD strategy.
- Canonical, title, description, Open Graph, and Twitter metadata are not server-rendered per page.

Recommended change:

- add route-aware prerendering or SSR;
- return real HTTP 404 responses for unknown public routes;
- add Organization, WebSite, Article, FAQ, and Breadcrumb structured data where truthful;
- generate sitemap and metadata from one route/content registry;
- exclude held tools, authenticated tools, and thin aliases from indexing.

### P2 — navigation and support

- “Support” is currently an FAQ alias, not a support operation.
- Cookie navigation historically used a hash placeholder.
- Trust/security content is generic rather than a control-based trust center.
- The audience shifts among investors, brokers, partners, and internal operators without a clear hierarchy.

Recommended change:

Use an investor-first public navigation with explicit Broker and Partner branches. Keep internal underwriting/portfolio tooling behind the authenticated product boundary.

## Uniform visual system for the full site

“Uniform” must mean a shared design language, not identical page composition.

### Non-negotiable tokens

- Background: pistachio and mint surfaces.
- Primary ink: midnight green.
- Accent: lemon used sparingly for action and status.
- Secondary data color: rainforest/emerald.
- Typography: Outfit for interface/editorial type; JetBrains Mono for financial values and labels.
- Corners: 8/12/16 px system.
- Borders: thin midnight or pistachio alpha borders.
- Motion: restrained, interaction-led, reduced-motion safe.
- Layout: generous editorial whitespace, sharp hierarchy, numerics aligned and tabular.

### Page families

| Page family | Layout role | Shared identity |
|---|---|---|
| Homepage | cinematic marketing narrative | accepted output stays identical |
| Product/audience pages | editorial story with proof and CTA | same shell, type scale, colors, dividers, buttons, media treatment |
| Calculators | workbench with inputs, result hierarchy, assumptions, provenance | same shell and tokens; stronger data density |
| Legal/content | readable editorial column with navigation | same type, color, spacing, and footer |
| Reliability hold | explicit withheld output plus release requirements | same shell, calm language, no fake result |
| Authenticated workspace | dense application shell | same tokens and financial typography, not a marketing-page copy |

### Component migration order

1. Freeze homepage screenshots and interaction baselines at desktop, tablet, and mobile.
2. Extract tokens without changing computed values.
3. Replace the global shell: header, menu, footer, buttons, form controls.
4. Replace one homepage section at a time behind a visual-diff contract.
5. Replace Webflow interactions with React/GSAP equivalents.
6. Remove each external CSS/script dependency only after no remaining selector or behavior references it.
7. Delete the compatibility markup only when the final React DOM passes pixel and interaction checks.

### Never do

- Do not make every page use the homepage layout.
- Do not approximate the homepage with generic cards and a new hero.
- Do not introduce a second palette, radius system, type scale, or icon style.
- Do not use a UI kit’s default appearance as Greenstreet’s visual identity.
- Do not publish an inferred rate, law, lender term, tax result, or recommendation as verified.
- Do not treat an iframe `load` event as proof that the embedded application works.

## Design-director scorecard

Score is for the protected homepage and the new reliability/intake surfaces, not for every untouched legacy page.

| Dimension | Score | Rationale |
|---|---:|---|
| Invention | 8 | distinctive editorial-financial composition without novelty for its own sake |
| Identity | 9 | strong pistachio/midnight/lemon language and recognizable typography |
| Second Three | 8 | supporting sections preserve hierarchy after the hero |
| Signature | 9 | accepted homepage remains the unmistakable brand anchor |
| Typography | 9 | reference type sizes and line heights are contract-checked |
| Rhythm | 8 | new pages use the same generous spacing and divider cadence |
| Restraint | 9 | reliability holds avoid fake dashboards and unnecessary decoration |
| Motion | 8 | accepted motion remains; new surfaces avoid perpetual motion |
| Mobile | 9 | responsive layout preserves hierarchy and 44+ px targets |
| Gallery | 8 | visual treatment is coherent; legacy media performance still needs reduction |

No score below 8 is accepted for the released slice. The broader legacy site remains below that threshold until the component migration and accessibility work above is completed.

## Industry-standard target architecture

```text
React application
├── route/content registry
│   ├── canonical path
│   ├── metadata + JSON-LD
│   ├── indexing policy
│   └── page component
├── Greenstreet design system
│   ├── tokens
│   ├── shell/navigation/footer
│   ├── form and action primitives
│   └── financial result components
├── deterministic financial domain
│   ├── canonical scenario schema
│   ├── lender Track 1
│   ├── investor Track 2
│   ├── provenance/effective dates
│   └── golden/regression tests
├── public marketing/content
├── public preliminary calculators
├── authenticated decision workspace
└── server boundary
    ├── validated/rate-limited APIs
    ├── intake delivery
    ├── authentication/authorization
    └── audit logging without sensitive-data leakage
```

## Release acceptance criteria

- Homepage contract passes.
- Desktop and mobile screenshot comparisons show no homepage layout drift.
- TypeScript, unit tests, build, and whitespace checks pass.
- Valid DSCR requests succeed.
- Invalid enum and state requests fail with 400.
- Optimizer requests fail with an explicit 503 reliability hold.
- Deal Analyzer and DSCR Calculator show consistent Track 1 and Track 2 results.
- `/book-demo` opens the real scenario intake and contains no dead scheduler.
- Unknown client routes show the no-index 404 view.
- Preview deployment passes browser interaction checks.
- Production deployment is verified after merge.

## Remaining owner decisions

1. Supply the approved business identity/licensing block.
2. Confirm whether case studies are real, composite, or illustrative.
3. Confirm a monitored lead owner and production intake delivery.
4. Approve a source owner and review cadence for pricing, tax, legal, and state data.
5. Decide whether “Book a demo” should remain the label once a verified scheduler is available; until then, “Request a scenario review” is the truthful action.
