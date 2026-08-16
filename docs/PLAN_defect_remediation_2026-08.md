# Defect remediation plan — 2026-08-15

Source: three parallel audits (gutted content, dead CTAs, palette drift) plus the
earlier a11y/perf/SEO sweep recorded in `PLAN_product_upgrade_2026-08.md`.

Branch: `feat/product-upgrade-2026-08`. Nothing pushed.

## Hard constraints — every agent obeys these

1. **Fabricated logos, testimonials, personas, About-page execs and the hero
   video STAY.** Owner re-confirmed 2026-08-15. Do not remove, restore, or make
   more convincing. `docs/REMOVED_MARKETING_CONTENT.md` records the standing
   decision; do not act on it.
2. **Flat by intent** (`DESIGN_SOURCE_OF_TRUTH.md:70-77`): no box-shadow, no
   backdrop-filter, no blur, no glow, no floating/pulsing motion.
3. **Two surfaces**: cream `#eeefd3`, dark `#003738`. Risk ramp from
   `src/theme.ts` only. `#ff6b6b` / `#f97316` are banned.
4. **No unverified stats.** If a number cannot be sourced, remove the claim —
   never invent one. The one verified figure available is: median US ZIP gross
   rental yield **5.1%**, p10 3.2 / p90 8.0, n=8,416 ZIPs, and 10.1% of ZIPs
   clear 8% (recovered dataset, see `PLAN_product_upgrade_2026-08.md`).
5. **Definition of done per agent**: `npx tsc --noEmit` clean, `npx vitest run`
   fully green, `npm run build` succeeds. Do NOT commit — the orchestrator
   reviews and commits.

## Wave 1 — four agents, partitioned by file so they cannot collide

### A · Correctness: false approvals on a lending product  *(highest severity)*
Files: `src/pages/PerfectPropertyPage.tsx`, `src/pages/NonUsInvestorsPage.tsx`

- `PerfectPropertyPage.tsx:362` hardcodes green **"✓ Clears 1.00x Lender
  Qualification Floor"** directly beneath a DSCR the page colours red when
  `track1Dscr < 1.0` (`:322-323`). Lower the rent and a red `0.73x` sits above a
  green "clears the floor".
- `:313` hardcodes "High Signal Investment Profile"; `:394` hardcodes "Florida
  5-Yr Stepdown Allowed" while the address is free text; `:316` claims "10,000
  Monte Carlo runs" for what `:68` shows is a closed-form clamp.
- `NonUsInvestorsPage.tsx:212 → :459` renders **"QUALIFIES"** in an uppercase
  pill. Lines 33-40 of that same file are an explicit rule that the page may
  never render an approval verdict. Ship defaults make it true on load.

### B · Homepage gutted containers
File: `index.html` **only**

- `:1029` "Illustrative workflow examples" + a paragraph promising "the examples
  **below**" and disclaiming client logos — with nothing beneath it.
  `testimonial_layout` has one child; the logo list was deleted.
- `:1030` `<div class="u-text-style-h1">Illustrative</div>` — a stat slot that
  read "11 lenders". Its carousel collapsed too (`swiper-slide` 9→0).
- `:1029` and `:1251` render the **identical `<h2>` twice** on one page.
- `:1267/:1269/:1271` — nine display stat slots reading "Example / Modeled /
  Planning", repeated verbatim on three cards. Originals were real numbers.
- Dead CSS for removed elements at `:70, :76, :77, :179, :666`.

### C · Marketing copy and dead tool CTAs
Files: `src/pages/AboutPage.tsx`, `SolutionsPage.tsx`, `ProductsPage.tsx`,
`RateQuizPage.tsx`

- `AboutPage.tsx:477-519` — eight ~415px square tiles each holding a two-letter
  fragment (`CE HQ HL HC SE PD AE CC`) under "The disciplines behind the engine."
- `SolutionsPage.tsx:58-63` — a stat grid whose four values are category words
  ("STR", "Cross-border", "Dual-Track", "Current") while segments 1 and 3 show
  real figures. `"Cross-border"` also overflows its tile.
- `ProductsPage.tsx:513/:527/:535` — "11 tools" / "Eleven tools" asserted three
  times over 14 `TOOLS` + 4 `SPECIAL_TOOLS`.
- `ProductsPage.tsx:433` — all four `SPECIAL_TOOLS` cards `onNavigate("portal")`,
  discarding their four distinct hrefs. "Optimize structure" never reaches
  `/tools/structure-optimizer`, which is a live route.
- `RateQuizPage.tsx:166 → :1073` — `let rate = "Not priced"` never reassigned,
  rendered at 52px in a slot built for a rate.
- `SolutionsPage.tsx:467` promises "Five questions. Real rate tier." while
  `RateQuizPage.tsx:167` states it produces no rate quote.

### D · Orphans and dead UI
Files: `src/components/ComplianceDashboard.tsx`,
`src/pages/STRUnderwritingPage.tsx`, `src/pages/PortfolioPage.tsx`,
`src/pages/MonteCarloPage.tsx`

- `ComplianceDashboard.tsx:1433-1435` — three ungated `Skeleton`s pulse forever
  inside a card headed "Structure recommendations are temporarily held."
- `STRUnderwritingPage.tsx:432-438` — hero deleted, page opens on a `borderTop`
  hairline under the nav; media queries target removed classes. Same shape at
  `PortfolioPage.tsx:311`.
- `MonteCarloPage.tsx` — `sofrY1/Y5/Y10` computed at `:369-371` and never
  rendered; `ProbCard` (`:134-171`) defined and never used.

## Wave 2 — after Wave 1 lands

- **A11y**: `aria-live` on ~17 result columns; make `ariaLabel` required on
  `ui/PremiumSlider` and add an aria prop to `PremiumUI.PremiumSlider` (fixes 32
  of 46 unnamed controls as a type change); Deal Analyzer labels at 2.96:1;
  QualifyModal verdict tiers at 2.07:1; StressMatrix keyboard trap.
- **Perf**: `warmAllRoutes` → `<link rel=prefetch>`; hero video poster; AVIF +
  real `srcset` for 15 MB of PNGs; 4.6 MB `og:image`; drop the dead 174 KB
  `home-markup.html?raw` import from the eager chunk; `Cache-Control` on
  `/assets/*`.
- **SEO**: prerender the 72 routes; `/products` buttons → anchors;
  `BreadcrumbList`; sitemap legal-URL inversion.

## Owner decisions — not agent work

- `dc.tsx:147-148` `card:"#fff"` / `panel:MINT_BG` — 90 references across 33
  files. Whether mint and white are surfaces is a design call.
- A `warningOnLight` token, needed before `#b8901f` can be retired.
- Repo visibility: `main` is public and already exposes 31 audit documents.
