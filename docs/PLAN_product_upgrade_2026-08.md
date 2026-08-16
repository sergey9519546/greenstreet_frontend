# Product upgrade — 2026-08

Branch: `feat/product-upgrade-2026-08` off `3df44b2`.

## Why

The site is a lead-gen product where **the lead goes nowhere**, that ships **zero
analytics**, and that keeps its one defensible advantage — 29,533 ZIPs of real market
data — in a JSON file wired to nothing. Everything here ranks under that.

## Standing constraint

**Fabricated logos, testimonials, personas, execs and hero imagery STAY.** Re-confirmed
by the owner 2026-08-14: the real people and logos don't exist yet. Do not remove them,
do not make them more convincing, do not "fix" them.

## Design constraint

`DESIGN_SOURCE_OF_TRUTH.md:70-77` — flat by intent. No box-shadow, no backdrop-filter,
no blur, no glow, **no floating or pulsing motion**. Two surfaces only (`#eeefd3` cream /
`#003738` dark). Risk ramp from `theme.ts`; never reintroduce `#ff6b6b` / `#f97316`.

## Resolved before starting

| Concern | Resolution |
| --- | --- |
| Analytics needs an owner account | Build **env-gated**. Inert until `VITE_PLAUSIBLE_DOMAIN` is set. |
| Lead delivery needs a destination | Build **env-gated** webhook. Inert until `LEAD_DELIVERY_WEBHOOK_URL` is set. Works with Slack/Make/n8n/Zapier. |
| CSP allows no analytics host | Add to `connect-src` + `script-src` in `vercel.json`. |
| ZIP data is attribution-licensed, repo is public | Ship with attribution rendered in the UI (Zillow ZORI/ZHVI, realtor.com). Lazy-loaded, never the main bundle. Exclude the scraped Airbnb tables entirely. |
| Never implement on `main` | Feature branch created. |

## Tasks

1. **Lead delivery** — env-gated outbound webhook replacing storage-only. Retry-safe,
   never blocks the 202, never leaks PII on the failure path.
2. **Analytics** — Plausible, env-gated, CSP updated, tool-completion events.
3. **ZIP seed defaults** — lazy-loaded lookup prefilling rent + insurance as **editable
   seeds** labelled with source and date. Never asserted as fact (r=0.539 vs HUD SAFMR).
4. **Data-authority section** — the measured 5.1% median gross yield / 10.1%-clear-8%
   finding, in the existing flat language.
5. **Perf / SEO / a11y** — run the audits, fix what they find. 3.2 MB raw JS today.
6. **Engine validation** — end-to-end cases with independently hand-computed expected
   values for amortization, PITIA, DSCR, LTV.

## Audit backlog — found, measured, NOT yet fixed

Three audits ran (Core Web Vitals, SEO, WCAG 2.2 AA). The five best
impact-per-line findings are fixed in `2e860e8`. Everything below is real,
measured, and still open. Ranked within each group.

### Accessibility (largest remaining group)

1. **`aria-live` on the other ~17 result columns.** Only the shared `hp-chip`
   announces. `ARMPage:794/1156`, `CommercialDSCRPage:352`,
   `ConstructionBridgePage:328`, `DealAnalyzerPage:422`, `LenderIntelPage:495`,
   `NonUsInvestorsPage:456`, `RefiTrackerPage:690`, `ReturnsPage:555`,
   `STRUnderwritingPage:633`, `TaxEnginePage:642`, `TCOThresholdPage:309`,
   plus DecisionSupport, MonteCarlo, Portfolio, StressMatrix,
   StructureOptimizer, PerfectProperty. Scope to the verdict subtree, never the
   whole column.
2. **46 form controls with no accessible name.** Root cause is two wrappers, so
   the durable fix is a type change, not 46 edits: make `ariaLabel` required on
   `ui/PremiumSlider` (17 unnamed call sites) and give `PremiumUI.PremiumSlider`
   an aria prop at all — it currently accepts none, so callers *cannot* fix it
   (15 sites). Plus 11 `CurrencyInput`s and 3 native controls
   (`StateLawsPage:186` is labelled only by its placeholder).
3. **Deal Analyzer input labels at 2.96:1** — `rgba(0,55,56,0.5)` on white, 9
   financial fields (`DealAnalyzerPage:363-414`) and
   `TrueCostComparator.tsx:72`. `rgba(0,55,56,0.7)` = 5.22:1 on white.
4. **Qualify-modal verdict tiers**: Borderline `#b8a820` = **2.07:1**, Below
   Threshold `#c25b4e` = 3.66:1 on pistachio (`QualifyModal.tsx:270,280,1411`).
   Highest-stakes strings in the funnel.
5. **`risk.danger` as small text on dark — 30 sites at 3.83:1** (3.56:1 on
   `dangerBg`). Mechanical swap to `dangerOnDark`; full list in the audit.
   `STRHostsPage.tsx:250` already imports `RED_ON_DARK` and doesn't use it.
6. **Keyboard traps.** `StressMatrixPage:1030` — the whole matrix is mouse-only
   (`<td onClick>`, no role/tabIndex/key handler). `ComplianceDashboard:805-817`
   — `/investgo` drawer has no `role="dialog"`, name, Escape, focus trap or
   restore.
7. `QualifyModal:379` focus ring `#4dbd97` on pistachio = 1.98:1.
8. Zero `<fieldset>/<legend>` anywhere; TaxEngine's 14 controls are one flat div
   whose own helper text says it has two sections.
9. Section titles across results panels are styled `<div>`s, not headings — SC
   1.3.1, and leaves ~2 heading stops per page.

### Performance

1. **`warmAllRoutes` still `import()`s the other 37 routes** (~320 KB gzip,
   evaluated). Convert to injected `<link rel="prefetch">`: same cache warming,
   Lowest priority, and it never *executes* the module. `App.tsx:131-158`.
2. **Hero video is 3.07 MB, autoplay, above the fold, no `poster`/`preload`/
   dimensions** (`index.html:1094`). Biggest mobile LCP win on the site.
3. **11 homepage PNGs ≈ 15.1 MB**, no WebP/AVIF anywhere, and **all 18 `srcset`
   descriptors point at the same file** — a phone downloads the desktop 2 MB
   PNG.
4. **`og:image` is 4.6 MB** — over most social scrapers' limits, so link
   previews are likely blank. Ship a ≤1 MB 1200×630.
5. **174 KB of dead HTML in the render-blocking chunk.** `MarketingHome.tsx:5`
   imports `home-markup.html?raw`; its portal target `#marketing-root` does not
   exist anywhere, so it never renders. −19 KB gzip. Note `MarketingHome.test.ts`
   asserts on the export, so retire both together.
6. Supabase (134 KB gzip) ships for one component on one route.
7. GSAP loads twice — bundled *and* from CDN (`index.html:1414-1417`).
   Greenboard stylesheet is declared twice (`:52`, `:166`).
8. No `Cache-Control` on `/assets/*` in `vercel.json` — content-hashed files get
   revalidated on repeat visits. `public, max-age=31536000, immutable` is free.
9. CLS: `#gs-lead-js` (`index.html:2445-2494`) hides the server-rendered hero
   form and swaps in a different-height card after `DOMContentLoaded`.

### SEO

1. **No prerendering.** 71 of 72 URLs have 0 words inside `#root`; the static
   HTML they *do* serve is the homepage's, CSS-hidden. Googlebot renders, so
   this is not fatal there — but `robots.txt:7-19` explicitly invites GPTBot,
   ClaudeBot and PerplexityBot, none of which execute JS. The registries needed
   to prerender already exist in `src/seo/routeMetadata.ts`.
2. **`/products` emits zero anchors** — every tool CTA is `<button onClick>`
   (`ProductsPage.tsx:310,432`), and there is no `/tools` hub route at all. Five
   tool pages are true orphans: `str-underwriting`, `commercial-dscr`,
   `construction-bridge`, `tco-threshold`, `perfect-property`.
3. **`/tools/perfect-property` is broken at runtime** —
   `LiveDistressDealsFeed.tsx:205` and `InvestorsPage.tsx:114` pass
   `"tools/perfect-property"`, not a valid `PageView`, so `viewToPath` falls
   through to `/`.
4. `BreadcrumbList` missing everywhere — the one schema type that still earns
   rich results for a site with this hierarchy.
5. `FAQPage` schema ships on all 72 URLs with 3 questions that appear nowhere;
   `/faq` has 27 real ones. Low impact (FAQ rich results are unavailable to
   commercial sites since Aug 2023) — hygiene.
6. Legal URLs inverted: the sitemap submits `/privacy-policy` while the page
   canonicalizes to `/legal/privacy-policy`. No `lastmod` anywhere.
7. OG/Twitter tags are static homepage values on every route; blog posts set OG
   but not `og:image` or any `twitter:*`.
8. Two `<h1>` on `/deal-analyzer` (`:308` is a `display:none` print header);
   h1→h3 skip on `/tools/portfolio` when the table is empty.

## Definition of done

`tsc` 0 · full suite green · production build succeeds · browser-verified where the change
is visible · home contract still verifying · each change committed separately with its
reasoning.
