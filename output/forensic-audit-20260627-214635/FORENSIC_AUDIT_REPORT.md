# Greenstreet Forensic UX/UI, Conversion, Copy, Compliance Audit

Date: 2026-06-27 local / 2026-06-28 UTC  
Site: http://127.0.0.1:3000  
Workspace: C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\greenstreet_frontend

## Evidence Pack

- `route-inventory.txt`: full initial route inventory, 82 URL patterns.
- `route-crawl-summary.json`: crawl findings at 320, 375, 768, 1024, 1440 widths.
- `route-template-groups.json`: rendered-template grouping for aliases/reused pages.
- `screenshots/`: 57 viewport screenshots.
- `interaction-states.json`: initial hidden/open/error state evidence.
- `interaction-screenshots/`: initial state screenshots.
- `targeted-after/`: post-fix screenshots and JSON verification.

Important caveat: the first full crawl is intentionally forensic and pre-fix. Post-fix targeted verification is recorded in `targeted-after/targeted-after-checks-2.json`, `targeted-after/products-mobile-menu-after-4.png`, and `targeted-after/home-after-headline.png`.

## Executive Diagnosis

The largest sitewide weakness was strategic focus. The homepage opened as if foreign-national STR/vacation-rental lending was the whole product, even though that is a secondary branch. The corrected product center is DSCR lending for rental-property investors.

The second largest weakness was conversion-surface conflict. A global fixed qualification widget appeared over calculators, legal pages, and mobile menus. It interrupted high-intent tool use and made compliance pages feel salesy.

The third largest weakness was factual/compliance exposure. Rate ranges, LTV/down-payment/FICO tiers, timelines, STR income rules, case-study metrics, and foreign-national claims appear as factual product promises in multiple places. Many need source tags, current product-sheet verification, or legal/compliance review.

## Full Route Inventory

Full raw inventory: `route-inventory.txt`.

Initial crawl found 82 URL patterns:

| Page family | Count | Examples | Main risk |
|---|---:|---|---|
| Homepage/Webflow shell | 1 | `/` | Strategic misframing; mobile menu invisibility; unlabeled lead controls |
| InvestGO portal aliases | 14 | `/investgo`, `/tools/deal-workspace`, `/partners` | Login trust, form labeling, many aliases landing on one portal |
| Core tools/calculators | 17 | `/dscr-calculator`, `/tools/tax-engine`, `/tools/str-underwriting` | Overlay interference, projection substantiation, mobile density |
| Audience pages | 8 | `/brokers`, `/investors`, `/non-us-investors`, `/str-airbnb` | Copy overpromises and branch boundaries |
| Product/platform pages | 3 | `/products`, `/products/platform`, `/solutions` | Strongest visual system, but proof/source modules are thin |
| Lead capture | 2 | `/rate-quiz`, `/book-demo` | Product-term claims need verification; reassurance arrives late |
| Blog/resource pages | 17 | `/blog/...` | Rate/legal/tax/STR claims need source discipline |
| Case studies | 5 | `/case-studies/...` | Metrics need attribution or representative-case framing |
| Legal/compliance | 5 | `/legal`, `/privacy-policy`, `/terms-of-service` | Legal pages need a non-promotional shell |

Rendered duplicate groups to manage intentionally:

- `/investgo`, `/partners`, `/partnerships`, `/tools/workspace`, `/tools/deal-workspace`, `/tools/sensitivity`, `/tools/structure-optimizer`, `/tools/scenario-history` all render `INVESTGO`.
- `/non-us-investors` and `/foreign-nationals` render the same secondary branch page.
- `/rate-quiz` and `/book-demo` render the same quiz-style page.
- `/privacy-policy`, `/legal/privacy-policy` and `/terms-of-service`, `/legal/terms-of-service` render legal details.
- `/dscr-calculator` and `/tools/dscr-calculator`, `/lender-intel` and `/tools/lender-intel`, `/state-laws` and `/tools/state-laws` render paired tool aliases.

## Global Diagnosis

### Global Strategic Problem

The homepage framed the company around secondary branches. Initial H1: `DSCR loans for real estate investors - non-US investors qualify, and so do Airbnb and vacation rentals.`

Implemented: changed H1 to `DSCR loans for rental-property investors.` and rewrote meta descriptions away from no-W2/no-income-doc/60-second language.

Remaining: build the page around the main DSCR platform first, then route to branches as secondary cards: Standard DSCR, Purchase/Refi, Portfolio, Broker/Partner, STR, Non-US, Vacation/Hybrid.

### Global Design Problem

The strongest design direction is the product/tool brand system: pistachio/lemon/dark-teal, serious typography, technical diagrams, dense but useful panels. The weakest direction is the inconsistency between Webflow home, React pages, generated lead widgets, and old footer/alias patterns.

### Global Attention Problem

Attention leaked into fixed CTAs, giant claims, and specialty-branch text before the user had proof. Tool users saw an overlay instead of the tool. Legal users saw a sales CTA instead of calm policy content.

### Global Copy Problem

The copy often sounds authoritative, but too many lines act like verified facts without visible substantiation. Every product term, rate, threshold, timeline, legal/tax claim, STR income rule, and outcome metric should be either sourced, product-sheet verified, qualified, or removed.

### Global Trust Problem

Missing trust modules:

- Licensing/state coverage.
- Eligibility boundaries by borrower type, property type, state, entity, and country.
- What happens after form submission.
- Data privacy and no-credit-pull explanation near forms.
- Calculator methodology and source/provenance.
- Case study evidence footnotes.
- Legal review labels for legal/tax content.

### Global Conversion Problem

The site overuses generic `qualify` language. Serious investors need context before action: what they will get, what is preliminary, whether credit is pulled, who reviews it, and what happens next.

Better CTA system:

- Tool pages: `Run the calculation`, `Save scenario`, `Request scenario review`.
- Product pages: `See the DSCR workflow`, `Book a scenario review`.
- Audience pages: `Check program fit`, `Talk to a DSCR specialist`.
- Legal pages: no sales CTA overlay.
- Blog pages: contextual CTA by article topic.

## Attention And Visual Findings

| Finding | Severity | Location | Why it hurts | Exact fix |
|---|---:|---|---|---|
| Homepage H1 made foreign-national/STR feel like the whole company | Critical | `/` hero | Wrong strategic first impression | Implemented neutral DSCR H1; next pass should add branch router below the primary thesis |
| Fixed `See if you qualify` pill covered tools and legal pages | Critical | Tools/legal/quiz | Blocks active work and lowers trust | Implemented route-aware widget suppression |
| React mobile menu rendered as a 41px sliver | Critical | React nav | Mobile navigation failure | Implemented fixed full-height `#mobile-nav` |
| Homepage mobile menu existed but opacity stayed `0` | Critical | Webflow home nav | User taps hamburger and sees no menu | Implemented visibility/accessibility shim |
| Qualification pill floated above open mobile menu | High | `/products` mobile menu | Covered nav items | Implemented nav z-index lift while menu is open |
| Auth fields relied on placeholders | High | InvestGO login | Accessibility and trust weakness | Implemented visible labels, ids, names, autocomplete |
| Default modal loan amount failed browser validity | High | Qualify modal | Broken validation before user input | Implemented loan step change from `5000` to `250` |
| Joined-word headings | High | `/brokers`, `/dscr-calculator`, `/tools/arm-reset` | Makes finance product feel unfinished | Fix strings/layout: `One deal. We underwrite and fund it.`, `Know if your rental covers the loan.`, `What happens when the fixed period ends?` |
| Tablet desktop nav overflow | High | 1024px shared nav | Menu exceeds viewport | Collapse to mobile nav earlier or reduce desktop nav footprint |
| Case study numbers lack visible proof | High | `/case-studies` | Metrics feel invented unless substantiated | Add source/methodology labels |

## Compliance-Sensitive Claims Audit

| Claim/location | Risk | Required verification | Safer rewrite |
|---|---|---|---|
| FAQ rate ranges `6.50-7.00%`, `6.85-7.50%`, `7.50-9.50%` | Rate advertising/compliance | `[VERIFY: current rate sheet]`, APR/payment assumptions, date, licensing | `Pricing changes with market conditions and file attributes. Confirm current pricing with a licensed Greenstreet rep before relying on an estimate.` |
| Rate quiz `620+ FICO, up to 80% LTV, loans to $4M` | Product-term promise | `[VERIFY: product sheet]`, eligibility and exceptions | `Typical DSCR program fit depends on credit band, leverage, property type, state, DSCR, and lender overlays. [VERIFY]` |
| Non-US `No SSN`, `No U.S. credit`, `Passport accepted` | Foreign-national/KYC/OFAC/legal | `[VERIFY: eligible countries/product sheet]`, AML/BSA, OFAC, identity policy | `Some foreign-national DSCR programs may not require a SSN or U.S. credit history. Eligibility is subject to KYC, OFAC screening, documentation, and lender overlays. [LEGAL REVIEW]` |
| STR `The number holds at closing` | Too absolute | `[VERIFY: underwriting policy]` and projection source | `The underwriting number is finalized during lender review and may differ from projections.` |
| State laws `always current`, `updated monthly` | Legal reliance risk | State-law update process, legal reviewer, effective date | `Based on Greenstreet's internal state-rule matrix as of [VERIFY DATE]. Legal review required for borrower reliance.` |
| Case studies `$14,800`, `4x`, `25 minutes to 6` | Proof/truth-in-advertising | Customer permission, source data, date, methodology | `Representative customer outcome; attach source record and date, or label as illustrative.` |
| Blog STR income hierarchy and AirDNA factors | Underwriting claim | Product/lender overlays and source | `Many DSCR lenders apply conservative STR income rules; final qualifying income depends on lender program and documentation. [VERIFY]` |
| Old homepage/form `real number in 60 seconds`, `See my rate` | Overpromising speed/quote precision | Product workflow and compliance | Implemented safer `View options`; keep `preliminary` language near outputs |

## Page-By-Page Audit

Routes are grouped by rendered page/family so aliases are not repeated without new findings. Full route list remains in `route-inventory.txt`.

### Homepage

URL: `/`

**Strategic Purpose**

- Intended purpose: establish Greenstreet as the DSCR lending/workflow platform for rental-property investors.
- Actual initial experience: positioned foreign-national and STR/vacation eligibility as the core product.
- Primary user question: Can this lender help me finance my rental-property investment without wasting time?
- Primary business goal: drive serious investors/brokers into a scenario review or InvestGO workflow.
- Main CTA: program match / book demo.
- Trust burden: prove real lender/program access, not generic calculator marketing.
- Verdict: initially strategically wrong; partially corrected with H1/meta/lead-card changes.

**Attention Architecture**

- First thing the eye saw initially: branch-heavy H1.
- What it should see first: primary DSCR investor lending proposition.
- Where attention leaked: announcement, hero video, lead card, branch H1 all competed.
- Required fix: implemented neutral H1; next pass should add explicit branch routing below the main thesis.

**Findings**

| Issue | Severity | Why it hurts | Exact fix |
|---|---:|---|---|
| H1 misframed the site | Critical | Makes a branch feel like the whole company | Implemented `DSCR loans for rental-property investors.` |
| Mobile menu invisible after tap | Critical | Navigation failure | Implemented `gs-home-menu-fix` shim and open-state CSS |
| Lead-card controls unlabeled | High | Accessibility and trust issue | Implemented aria labels on selects/email |
| CTA implied rate output | High | Possible compliance issue | Changed `See my rate` to `View options` |
| Announcement link had empty accessible text | Medium | Screen-reader and keyboard ambiguity | Give announcement link a text label or remove empty overlay link |

**Exact Rewrites**

| Current/problem | Better version |
|---|---|
| `DSCR loans for real estate investors - non-US investors qualify...` | Implemented `DSCR loans for rental-property investors.` |
| `See my rate` | Implemented `View options` |
| `No SSN` in global lead card | Implemented `Property-rent focused` |
| `Verified pricing` | `Program pricing checked against Greenstreet's current product sheet. [VERIFY DATE]` |

**Score**

Visual quality: 7 after H1 fix. Attention control: 5. UX clarity: 6. Conversion strength: 6. Copy quality: 5. Trust/credibility: 5. Originality: 7. Accessibility: 6 after fixes. Mobile quality: 6. Overall: 6.

**Priority Fixes**

1. Add product proof module above branch links.
2. Add claim source tags for pricing/state rules.
3. Replace decorative/fake trust cues with evidence-backed proof.
4. Convert Webflow mobile nav to semantic button/menu markup.

### Products / Platform

URLs: `/products`, `/products/platform`, `/solutions`

**Strategic Purpose**

- Intended purpose: explain the DSCR Engine and connected workflow.
- Actual experience: strongest product positioning on the site, but short on proof/source modules.
- Primary user question: What does the platform do that a calculator or broker cannot?
- Primary business goal: move serious visitors into demo/scenario review.
- Trust burden: prove actual lender/program intelligence.
- Verdict: visually strongest family; needs source/proof and mobile-menu cleanup, partly implemented.

**Findings**

| Issue | Severity | Why it hurts | Exact fix |
|---|---:|---|---|
| Mobile menu was clipped/underlaid | Critical | Navigation failure | Implemented fixed full-height menu |
| Qualification pill over menu | High | Covered nav items | Implemented nav z-index lift while menu is open |
| Product proof lacks source layer | High | Engine claims feel unverified | Add source badges: rate sheet, state matrix, lender overlays |
| `Book demo` competes with `See if you qualify` | Medium | CTA uncertainty | Use one primary CTA per page state |

**Safer Copy**

| Current/problem | Better version |
|---|---|
| `Verified pricing` | `Pricing checked against Greenstreet's current product sheet. [VERIFY DATE]` |
| `Every DSCR workflow` | `The core DSCR workflows investors and brokers use before submission.` |

**Score**

Visual quality: 8. Attention control: 7 after fixes. UX clarity: 7. Conversion strength: 6. Copy quality: 6. Trust/credibility: 6. Originality: 7. Accessibility: 7. Mobile quality: 7. Overall: 7.

### InvestGO / Portal Login

URLs: `/investgo`, `/investgo/analyze`, `/investgo/sensitivity`, `/investgo/optimize`, `/investgo/state`, `/investgo/history`, `/investgo/settings`, `/partners`, `/partnerships`, `/tools/workspace`, `/tools/deal-workspace`, `/tools/sensitivity`, `/tools/structure-optimizer`, `/tools/scenario-history`

**Strategic Purpose**

- Intended purpose: authenticated workspace and demo-mode entry.
- Actual experience: visually serious, but initially asked for login before enough privacy/context reassurance.
- Primary user question: Is this safe and worth signing into?
- Primary business goal: get qualified users into demo or workspace.
- Trust burden: auth, data privacy, demo vs real data separation.
- Verdict: good shell, needed form/a11y trust fixes; partly implemented.

**Findings**

| Issue | Severity | Why it hurts | Exact fix |
|---|---:|---|---|
| Inputs relied on placeholders | High | Accessibility and trust weakness | Implemented visible labels, ids, names, autocomplete |
| Back link target was 16px high | Medium | Poor touch target | Implemented 36px minimum height |
| Demo mode explanation thin | Medium | Users do not know what happens | Add helper text: `Uses sample data. No account or deal data stored.` |
| Firebase errors shown raw | Medium | Looks technical/unfriendly | Map errors to human messages and use `aria-live` |

**Safer Copy**

| Current/problem | Better version |
|---|---|
| `Try demo mode - no account needed` | `Try demo mode with sample deals - no account or saved data.` |
| `Access Engine` | `Sign in to InvestGO` |

**Score**

Visual quality: 7. Attention control: 6. UX clarity: 6. Conversion strength: 6. Copy quality: 5. Trust/credibility: 6. Originality: 6. Accessibility: 7 after fixes. Mobile quality: 7. Overall: 6.5.

### Tools / Calculators

URLs: `/dscr-calculator`, `/lender-intel`, `/state-laws`, `/decision-support`, `/tools/refi-tracker`, `/tools/arm-reset`, `/tools/monte-carlo`, `/tools/returns`, `/tools/tax-engine`, `/tools/stress-matrix`, `/tools/decision-support`, `/tools/str-underwriting`, `/tools/portfolio`, `/tools/arm`, `/tools/irr`, `/tools/dscr-calculator`, `/tools/lender-intel`, `/tools/state-laws`

**Strategic Purpose**

- Intended purpose: prove expertise through useful deal tools.
- Actual experience: strong tool concepts, but initial global widget interfered and outputs need clearer provenance.
- Primary user question: Can this tell me whether my deal works before I waste time or money?
- Primary business goal: convert high-intent users into scenario review.
- Trust burden: calculators must not imply underwriting certainty.
- Verdict: valuable product surface; needs systematic caveats and source controls.

**Findings**

| Issue | Severity | Why it hurts | Exact fix |
|---|---:|---|---|
| Fixed widget over calculators | Critical | Blocks UI and feels cheap | Implemented route-aware suppression |
| Dense mobile forms | Medium | Hard scanning | Standardize mobile input grouping and result summary |
| Calculator outputs can look final | High | Borrower may overrely | Add prominent `preliminary, subject to underwriting` output label |
| State-law tool sounds legally authoritative | High | Legal reliance risk | Add legal review/date/source matrix label |
| STR outputs use projections | High | Income expectation risk | Keep guarantee disclaimer visible near output, not only bottom |

**Exact Rewrites**

| Current/problem | Better version |
|---|---|
| `Know if yourrental coversthe loan.` | `Know if your rental covers the loan.` |
| `What happens whenthe fixed period ends?` | `What happens when the fixed period ends?` |
| `Underwritten DSCR 1.06x` | `Projected DSCR scenario: 1.06x [VERIFY: source/model]` |

**Score**

Visual quality: 7. Attention control: 6 after overlay fix. UX clarity: 6. Conversion strength: 7. Copy quality: 5. Trust/credibility: 5. Originality: 8. Accessibility: 6. Mobile quality: 6. Overall: 6.5.

### Rate Quiz / Book Demo

URLs: `/rate-quiz`, `/book-demo`

**Strategic Purpose**

- Intended purpose: lead capture through scenario/question flow.
- Actual experience: useful, but term claims are too exact without product-sheet verification.
- Primary user question: Can I get realistic program/rate direction without a hard pull?
- Primary business goal: capture qualified scenario submissions.
- Trust burden: explain no hard pull, preliminary nature, and next step.
- Verdict: promising conversion path; compliance copy needs tightening.

**Findings**

| Issue | Severity | Why it hurts | Exact fix |
|---|---:|---|---|
| Product terms stated before verification | High | Mis-set expectations | Replace with verified/current ranges or generic file-dependent language |
| Fixed widget competed with quiz | High | Two CTAs for same intent | Implemented suppression |
| Answer labels wrap awkwardly on mobile | Medium | Slows decisions | Increase answer-card height and simplify labels |
| Next-step explanation appears late | Medium | Sensitive-data hesitation | Put `what happens next` above sensitive fields |

**Exact Rewrites**

| Current/problem | Better version |
|---|---|
| `620+ FICO, up to 80% LTV, loans to $4M` | `Program fit depends on credit band, leverage, property type, DSCR, state, and lender overlays. [VERIFY]` |
| `See what you qualify for` | `Get a preliminary program match` |

**Score**

Visual quality: 7. Attention control: 7 after suppression. UX clarity: 6. Conversion strength: 7. Copy quality: 5. Trust/credibility: 5. Originality: 6. Accessibility: 6. Mobile quality: 6. Overall: 6.

### Audience And Branch Pages

URLs: `/brokers`, `/investors`, `/borrower-profiles`, `/non-us-investors`, `/foreign-nationals`, `/str-airbnb`, `/vacation-homes`

**Strategic Purpose**

- Intended purpose: route different borrower/partner types.
- Actual experience: good segmentation exists, but foreign-national and STR pages need stronger qualification and must stay secondary.
- Primary user question: Is this program for my exact situation?
- Primary business goal: qualify the lead and route to the right review path.
- Trust burden: state eligibility, documentation, and boundaries honestly.
- Verdict: useful, but branch pages require legal/product verification.

**Findings**

| Issue | Severity | Why it hurts | Exact fix |
|---|---:|---|---|
| Non-US page lacks explicit OFAC/KYC boundaries near CTA | Critical | False hope and compliance risk | Add eligible-country, KYC, OFAC, entity/funds-source note |
| Vacation page may imply personal-use financing | High | Wrong lead type | Reframe as hybrid rental-use model; say pure personal use is weak DSCR fit |
| STR page implies projections hold | High | Income expectation risk | Qualify all projection language |
| `One deal.We underwriteand fund it.` | High | Broken text damages broker trust | Fix spacing in component copy/layout |

**Exact Rewrites**

| Current/problem | Better version |
|---|---|
| `No SSN required. Passport accepted.` | `Some foreign-national DSCR programs may not require a SSN. Passport-based identity review, eligible-country screening, KYC/AML, OFAC checks, and lender overlays still apply. [LEGAL REVIEW]` |
| `The getaway that pays for itself.` | `A vacation home that is underwritten as a rental-income scenario.` |
| `The number holds at closing.` | `Final qualifying income is determined during underwriting.` |

**Score**

Visual quality: 7. Attention control: 6. UX clarity: 5. Conversion strength: 6. Copy quality: 5. Trust/credibility: 4. Originality: 6. Accessibility: 6. Mobile quality: 6. Overall: 5.5.

### Blog / Resource Library

URLs: `/blog` and all `/blog/...` routes in `route-inventory.txt`

**Strategic Purpose**

- Intended purpose: SEO education and trust-building.
- Actual experience: deep content but many claims read as final facts without source blocks.
- Primary user question: Is this lender technically competent and current?
- Primary business goal: educate and convert researching investors.
- Trust burden: source every factual legal/rate/tax/underwriting claim.
- Verdict: content depth is valuable, but source hygiene must be tightened.

**Findings**

| Issue | Severity | Why it hurts | Exact fix |
|---|---:|---|---|
| Rate/legal articles have no prominent currency date | High | Drift-prone information | Add `Updated/verified` date and disclaimer top block |
| Exact numeric claims lack source blocks | High | Authority without provenance becomes risk | Add article-level source/review pattern |
| Generic CTA not article-specific | Medium | Weak next step | Match CTA to article intent |
| Legal/tax posts can create reliance | High | User may act on content | Add legal/tax disclaimer and review status |

**Exact Rewrites**

| Current/problem | Better version |
|---|---|
| `June 2026 DSCR rate sheet: where the 6.125% specials actually are` | `June 2026 DSCR pricing notes: examples from verified rate-sheet snapshots [VERIFY]` |
| OBBBA/legal articles without visible citations | Add citation/source block per legal claim and `[LEGAL REVIEW]` where needed |

**Score**

Visual quality: 6. Attention control: 6. UX clarity: 6. Conversion strength: 5. Copy quality: 6. Trust/credibility: 4 until sourced. Originality: 6. Accessibility: 6. Mobile quality: 6. Overall: 5.5.

### Case Studies

URLs: `/case-studies`, `/case-studies/vela-capital`, `/case-studies/northshore-non-qm`, `/case-studies/quintero-co`, `/case-studies/aurora`

**Strategic Purpose**

- Intended purpose: proof and conversion trust.
- Actual experience: visually strong, but metrics need attribution.
- Primary user question: Has this actually worked for people like me?
- Primary business goal: turn skeptical visitors into demos/scenario reviews.
- Trust burden: proof must be real, sourced, and permissioned.
- Verdict: good proof shape, high substantiation burden.

**Findings**

| Issue | Severity | Why it hurts | Exact fix |
|---|---:|---|---|
| Big metrics lack visible provenance | High | Can feel invented | Add `Source: customer workflow logs/date/permission` |
| Index page stronger than evidence detail | Medium | Proof not inspectable | Add case detail proof blocks |
| Missing `how measured` | High | Skeptic doubts claim | Add methodology footnotes |

**Exact Rewrites**

| Current/problem | Better version |
|---|---|
| `$14,800 saved` | `$14,800 in avoided hard costs, based on [source/date]. [VERIFY]` |
| `4x throughput` | `Throughput increased from [baseline] to [result] in [period]. [VERIFY]` |

**Score**

Visual quality: 8. Attention control: 7. UX clarity: 6. Conversion strength: 6. Copy quality: 5. Trust/credibility: 4 until sourced. Originality: 7. Accessibility: 6. Mobile quality: 6. Overall: 6.

### Legal / Compliance Pages

URLs: `/legal`, `/privacy-policy`, `/terms-of-service`, `/legal/privacy-policy`, `/legal/terms-of-service`

**Strategic Purpose**

- Intended purpose: legal transparency, policy access, compliance trust.
- Actual experience: initially undermined by a sales qualification overlay.
- Primary user question: Is this company legitimate and careful with obligations/data?
- Primary business goal: reduce trust risk, not generate immediate CTA clicks.
- Trust burden: clarity, seriousness, no promotional interference.
- Verdict: overlay issue fixed; remaining need is policy/source completeness.

**Findings**

| Issue | Severity | Why it hurts | Exact fix |
|---|---:|---|---|
| Sales overlay on legal pages | Critical | Makes legal page feel manipulative | Implemented suppression |
| Legal content narrow on mobile | Medium | Hard reading | Give policy text a calmer document layout |
| Missing licensing/state scope | High | User cannot assess legitimacy | Add licensing/coverage page or module |

**Score**

Visual quality: 6. Attention control: 7 after suppression. UX clarity: 6. Conversion strength: not primary. Copy quality: 5. Trust/credibility: 5 pending licensing/privacy details. Originality: 4. Accessibility: 6. Mobile quality: 6. Overall: 6.

## Canonical Design-System Recommendation

| System area | Recommendation |
|---|---|
| Page shell | One shared React shell for all non-home routes; Webflow home should converge or be explicitly maintained |
| Header | Shared nav; mobile opens full-screen; nav z-index rises while menu open |
| Footer | Canonical routes only; no branch links pointing to obsolete anchors |
| Hero pattern | Primary DSCR category first; branch qualifiers only in routing modules |
| CTA hierarchy | One primary action per page state; no global overlay on tools/legal/quiz |
| Card system | 8px radius, restrained shadows, evidence-backed metrics |
| Form system | Visible labels, autocomplete, helper text, privacy/no-hard-pull note, inline errors |
| Tool/calculator system | Shared provenance bar, assumptions table, preliminary disclaimer, scenario-review CTA |
| Legal/compliance pattern | No sales overlay; source/review dates; licensing scope |
| Motion rules | Avoid motion that hides required nav/content; respect reduced motion |

## Implementation Completed In This Pass

| Priority | Component/file | Change | Verification |
|---:|---|---|---|
| 1 | `index.html` | Reframed homepage H1/meta away from foreign-national/STR branch dominance | `home-after-headline.png`, H1 DOM check |
| 2 | `src/App.tsx` | Added route-aware widget suppression for tools/legal/quiz/portal | `targeted-after-checks-2.json` empty arrays for `/tools/tax-engine`, `/legal`, `/rate-quiz` |
| 3 | `src/design/SiteShell.tsx` | Changed React mobile menu to fixed full-height overlay | `reactMenu.rect.h=804` |
| 4 | `index.html` | Added homepage menu visibility/accessibility shim | `homeMenu.opacity=1`, `aria-hidden=false` |
| 5 | `src/design/SiteShell.tsx` | Raised nav stack while mobile menu is open | `elementFromPoint` over widget resolves to menu text |
| 6 | `src/components/ComplianceDashboard.tsx` | Added auth labels, names, autocomplete, larger Back target | post-fix JSON labels/autocomplete/back height |
| 7 | `src/components/QualifyModal.tsx` | Changed loan amount step to 250 | modal input `valid=true` |
| 8 | `index.html` | Changed generated hero CTA from `See my rate` to `View options`; added aria labels | post-fix home lead JSON |
| 9 | `src/design/SiteShell.tsx` | Footer branch links pointed to canonical pages | source diff |

## Ranked Remaining Fix List

| Priority | Impact | Effort | Route/component | Exact change | How to verify |
|---:|---|---|---|---|---|
| 1 | Critical | Medium | Rate quiz, FAQ, Blog | Replace/source every rate/LTV/FICO/down-payment/timeline claim | Product-sheet/legal review checklist |
| 2 | Critical | Medium | Non-US/STR/Vacation pages | Add KYC/AML/BSA, OFAC, eligible-country, state-scope, projection caveats | Legal review + branch page screenshots |
| 3 | High | Medium | Case studies | Source or relabel every metric | Case proof ledger attached to cards |
| 4 | High | Medium | Tools | Add shared provenance/preliminary-output component | Tool output screenshot and DOM audit |
| 5 | High | Low | Copy components | Fix joined-word headings | Visual crawl at 320/1440 |
| 6 | High | Medium | Shared nav/CSS | Fix 1024px desktop nav overflow | 1024 route crawl has no nav overflow |
| 7 | Medium | Medium | InvestGO auth | Replace raw Firebase errors; add demo/data-use note | Empty/invalid auth tests |
| 8 | Medium | Medium | Blog | Add article source/update/review header | Blog route screenshots and source lint |
| 9 | Medium | Medium | Legal pages | Add licensing/state scope and privacy/credit-use modules | Legal review |
| 10 | Low | Medium | Webflow home | Convert burger div to real button in source template | Keyboard and screen-reader check |

## Testing Checklist For Next Pass

- Full route crawl after copy/compliance fixes.
- 320, 375, 768, 1024, 1440 screenshots for all page families.
- Keyboard-only navigation for home nav, React nav, dropdowns, quiz, auth, modal.
- Form validation states: empty, invalid email, partial quiz, modal required fields, success.
- Screen-reader labels for all inputs/selects/buttons.
- No horizontal overflow at 320/375/768/1024/1440.
- No fixed CTA overlapping tools, legal content, menus, forms, or modals.
- Product-sheet claim diff: every rate/LTV/FICO/down-payment/timeline claim verified or tagged.
- Legal review pass for state law, tax, STR income, foreign-national, OFAC/KYC, licensing.

## Before / After Summary

| Area | Before | After |
|---|---|---|
| Homepage strategy | Branch-heavy H1 made foreign-national/STR feel like the site | Neutral DSCR investor H1 |
| Homepage lead card | `Instant pre-qual`, `See my rate`, unlabeled controls, `No SSN` in global card | `Quick program match`, `View options`, aria labels, general property-rent language |
| Homepage mobile menu | Full-screen menu existed but opacity stayed `0` | Visible full-screen menu with aria state |
| React mobile menu | 41px clipped sliver | Full-height fixed menu |
| Mobile menu vs widget | Widget floated over menu | Menu stacks above widget |
| Tools/legal/quiz | Global widget covered serious pages | Widget suppressed on these routes |
| InvestGO auth | Placeholder-only fields, tiny back target | Visible labels, autocomplete, larger target |
| Qualify modal | Default loan amount invalid due input step mismatch | Default field validates |

## Remaining Risks

1. Product/rate terms across FAQ, Rate Quiz, Blog, and engine/lender data still need product-sheet verification before public use.
2. Legal/tax/state-law claims need legal review and source dates.
3. Foreign-national pages need explicit eligible-country, KYC/AML/BSA, OFAC, funds-source, entity, and licensing boundaries.
4. STR pages need source-date and projection caveats close to claims.
5. Case study metrics need substantiation or clear illustrative labeling.
6. The homepage still needs a deeper strategic rewrite below the H1 so branches are routed without dominating.
7. Webflow home and React pages should converge into one design-system source of truth over time.

## Second-Pass Compliance Hardening Completed

Date: 2026-06-27.

### What Changed

| Area | Files/components | Change |
|---|---|---|
| Shared compliance pattern | `src/design/ComplianceNote.tsx` | Added reusable product-sheet, legal-review, and source-methodology notice component |
| Global CTAs | `src/design/BottomCTA.tsx`, `src/components/QualifyModal.tsx`, route CTAs | Replaced instant-rate language with preliminary scenario-review language |
| Rate quiz | `src/pages/RateQuizPage.tsx` | Removed model-generated rate ranges and product conclusions; replaced with `[VERIFY: current rate sheet/product sheet]` status |
| FAQ | `src/pages/FAQPage.tsx` | Rewrote high-risk answers around rates, timelines, foreign nationals, STR income, tax/legal content, and refinance caps |
| Foreign-national branch | `src/pages/NonUsInvestorsPage.tsx`, `src/pages/SolutionsPage.tsx`, `src/pages/BorrowerProfilesPage.tsx` | Reframed as specialist branch; added KYC/AML, OFAC, eligible-country, funds-source, state-scope, and product-sheet dependencies |
| STR/vacation branch | `src/pages/STRHostsPage.tsx`, `src/pages/STRUnderwritingPage.tsx`, `src/pages/VacationHomesPage.tsx` | Replaced “qualifies/approval” copy with scenario-review language; added source and local-legality caveats |
| Tax tool | `src/pages/TaxEnginePage.tsx` | Reframed after-tax outputs as educational scenarios requiring CPA/legal review |
| Case studies | `src/pages/CaseStudiesPage.tsx` | Replaced approval/rate-lock proof claims with illustrative/source-required language |
| Blog content | `src/pages/BlogPage.tsx`, `src/pages/BlogPostPage.tsx` | Added article-level verification notice and replaced high-risk conversion CTA language |
| Core tools | `src/pages/DSCRCalculatorPage.tsx`, `src/pages/DealAnalyzerPage.tsx`, `src/pages/DecisionSupportPage.tsx`, `src/pages/LenderIntelPage.tsx` | Replaced “qualifies/approval/rate quote” labels with modeled scenario/review-range language |

### Verification

| Check | Result |
|---|---|
| `npm run lint` | Passed |
| Targeted browser smoke test | Passed 34 route/viewport checks |
| Viewports tested | Desktop 1440x1100 and mobile 390x900 |
| Routes tested | `/`, `/faq`, `/rate-quiz`, `/borrower-profiles`, `/non-us-investors`, `/str-hosts`, `/vacation-homes`, `/tools/tax-engine`, `/tools/str-underwriting`, `/solutions`, `/case-studies`, `/case-studies/quintero-co`, `/blog/what-is-dscr-how-it-works`, `/dscr-calculator`, `/deal-analyzer`, `/tools/decision-support`, `/lender-intel` |
| Browser evidence | `output/forensic-audit-20260627-214635/targeted-after/second-pass/summary.json` and screenshots in the same folder |
| Known external issue | CookieYes emits a localhost URL-registration console error; ignored as third-party environment noise |

### Remaining Risks After Second Pass

1. The blog article body corpus still contains dated examples and precise historical/rate/tax content. It now carries article-level verification warnings, but the content library still needs a full source-by-source rewrite before production.
2. Legal pages still need final licensing/state-scope/privacy/credit-use review by counsel.
3. Underlying program data and engine defaults still need connection to a real product sheet; placeholders prevent overclaiming but are not launch-ready content.
4. Case study metrics remain illustrative until a proof ledger, customer permission, measurement window, and methodology notes are attached.
