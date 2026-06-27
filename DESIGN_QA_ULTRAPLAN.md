# Greenstreet Finance — Design QA & Fixing Ultraplan (v2, deep)

_Audit date: 2026-06-27 · 35 routes · desktop (1563px) + mobile (375px) + source grep._
_Method: per-route forensic DOM audit scoped to `#root` (home-bleed excluded) — headings & hierarchy, images, links, inputs/labels, visible-text data bugs, rebrand leftovers, overflow, font sizes, tap targets, contrast/opacity, duplicate ids — plus full-body home audit, a 25-route mobile overflow sweep, and a source grep for placeholders._

## Health snapshot
**Clean (verified, do not touch):** no JS console errors · no `undefined`/`NaN`/`[object Object]`/`$NaN` in any calculator's visible output · no rebrand ("foreign national") leftovers anywhere · **no horizontal overflow on any route at 375px or desktop** · heading hierarchy clean except 1 page · all calculators render real numbers.

**Found:** 4 broken images, 1 visible `{TODO}`, a stubbed lead endpoint, 3 pages with no `<h1>`, ~40 unlabeled form inputs across tools, low-contrast + sub-11px text, and the home-DOM bleed. Details below.

Severity: 🔴 P0 broken/visible · 🟠 P1 structure/a11y · 🟡 P2 polish.

---

## 🔴 P0 — broken or visible defects

| ID | Issue | Location | Fix |
|----|-------|----------|-----|
| P0-1 | **`{TODO: state licensing disclosures}` renders on the live page** (visible to customers in the compliance footer) | `pages/NonUsInvestorsPage.tsx:357` | Replace with the real disclosure text or remove the token |
| P0-2 | **3 broken case-study images** (404) | `/case-studies` → `img/logos/cs-vela-capital.png`, `cs-northshore-nonqm.png`, `cs-quintero-co.png` | Recover/add the 3 PNGs (same recovery path as the rebuild video — check the GitHub repo) or swap to existing assets |
| P0-3 | **Home `hero.png` broken** (404) — `/img/generated/hero.png`; the hero video covers it but it's a dead asset (and the poster/no-JS fallback) | `index.html` hero `<img>` | Recover the file or point `src`/`srcset` at a real asset |
| P0-4 | **Home DOM bleeds onto every React route** → **2 `<h1>` per page** (page H1 + the home's "DSCR loans…" H1), ~134-image home DOM, and **GTM / LinkedIn / Google-Ads / DoubleClick / Claydar scripts firing on every `/tools/*` & `/investgo` route** | `index.html` is the single Vite entry; React mounts but the Webflow markup + `<head>` scripts never unmount | Split a minimal `app.html` shell for app routes, OR have the router remove the marketing subtree + gate the tracking scripts when `view !== "marketing"`. **Verify the built `dist/index.html` first.** |
| P0-5 | **`/deal-analyzer` is byte-identical to `/lender-intel`** yet CTAs sell them as distinct | `router/resolve.ts` (alias) + CTAs in `MonteCarloPage`, `ReturnsPage`, `SiteShell` footer, nav | Build a real Deal Analyzer or relabel/remove every "Deal Analyzer" CTA |
| P0-6 | **Lead form likely captures nothing** — production CRM endpoint is a TODO | `components/QualifyModal.tsx:1933` (`// TODO: production lead endpoint / CRM`) | Wire the submit to a real endpoint (or confirm it already posts); this is the main conversion path — verify leads land somewhere |

---

## 🟠 P1 — structure & accessibility

| ID | Issue | Where | Fix |
|----|-------|-------|-----|
| P1-1 | **No `<h1>` on 3 pages** (SEO/a11y) | `STRUnderwritingPage` (`/tools/str-underwriting`), `PortfolioPage` (`/tools/portfolio` + `/portfolio-builders`), login (`/investgo` + `/partnerships`) | Promote the hero/section title to a single `<h1>` per page |
| P1-2 | **~40 unlabeled form inputs** (screen readers can't announce them) | Portfolio 20, Returns 8, Investors 6, MonteCarlo 5, DSCR-calc 2, Vacation-homes 1 | Add `aria-label` (or `<label for>`) in the shared `SliderField` / number-input helpers |
| P1-3 | **Heading skip `h1 → h3`** | `/case-studies` | Demote the skipped level or insert the `h2` |
| P1-4 | **`/state-laws` hero — right half empty** (only tool hero with no artifact) | `StateLawsPage.tsx` hero grid | Add a right-side artifact (mini US map / state card) like the other tool heroes |
| P1-5 | **`/investgo` login — large vertical void**, card floats low/plain | `ComplianceDashboard.tsx` login gate | Vertically center or split layout (value-prop left, sign-in right) |
| P1-6 | **CTA `<a>` with `href=null`** (`g_clickable` Webflow pattern) — not keyboard-focusable as links | brokers, case-studies, arm-reset, likely sitewide | Add real `href` or render as `<button>` |

---

## 🟡 P2 — polish & design system

| ID | Issue | Notes |
|----|-------|-------|
| P2-1 | **Low-contrast text** — alpha `<0.45` rgba on every page; fine print at `0.28`/`0.4` fails WCAG AA | bump tokens: secondary ≥`0.62`, fine print ≥`0.5` (one shared-helper sweep) |
| P2-2 | **Sub-11px text** widespread — **blog 34**, str-airbnb 13, portfolio-builders 10, non-us-investors 8 | raise min font for meta/captions/fine-print to ≥11px |
| P2-3 | **~23–28 tiny tap targets/route** (<30px) | mostly nav/footer text links; ensure actual buttons hit ≥44px on mobile |
| P2-4 | **"Cookies Settings" footer link dead** (`href="#"`) | wire the cookie-prefs modal or remove |
| P2-5 | **Thin pages** — support 1607, platform 1859, vacation-homes 1997, investors 1906, careers 2116 chars | flesh out content or tighten layout to not feel empty |
| P2-6 | **Editorial pages narrow column** (about/faq/legal/careers/support) — half-empty canvas | widen measure or add a right rail |
| P2-7 | **Symmetric-grid sweep** — finish auditing remaining tools/audience pages for `auto 1fr`/unequal grids + duplicate artifacts (4 tools done this session) | ref `feedback_design_symmetry` |
| P2-8 | **Per-tool hero bg colors** (teal/dark/mint/lemon) — confirm it's a documented accent map | record in design tokens |
| P2-9 | `/health` returns `version:"unknown"` | set `APP_VERSION` env (cosmetic) |

---

## Per-route findings matrix
| Route | h1 | unlabeled inputs | broken img | other |
|---|----|----|----|----|
| `/` home | 1 | — | **hero.png** | dead "Cookies Settings" link |
| `/investgo` `/partnerships` | **0** | — | — | near-empty (286 chars), login void |
| `/dscr-calculator` | 1 | 2 | — | ✅ |
| `/rate-quiz` | 1 | 0 | — | ✅ |
| `/lender-intel` | 1 | 0 | — | ✅ |
| `/deal-analyzer` | 1 | 0 | — | **dup of lender-intel** |
| `/state-laws` | 1 | 0 | — | **hero void** |
| `/tools/monte-carlo` | 1 | 5 | — | redesigned ✅ |
| `/tools/returns` | 1 | 8 | — | redesigned ✅ |
| `/tools/stress-matrix` `/decision-support` | 1 | 0 | — | redesigned ✅ |
| `/tools/str-underwriting` | **0** | 0 | — | needs h1 |
| `/tools/portfolio` `/portfolio-builders` | **0** | **20** | — | needs h1 + labels |
| `/tools/tax-engine` `/refi-tracker` | 1 | 0 | — | ✅ |
| `/tools/arm-reset` | 1 | 0 | — | href=null CTA |
| `/non-us-investors` (+`/foreign-nationals`) | 1 | 0 | — | **{TODO} visible**, 8 tiny fonts, flight animation ✅ |
| `/str-airbnb` | 1 | 0 | — | 13 tiny fonts |
| `/vacation-homes` | 1 | 1 | — | thin |
| `/borrower-profiles` | 1 | 0 | — | 9 low-op texts |
| `/brokers` | 1 | 0 | — | href=null CTA |
| `/investors` | 1 | 6 | — | thin |
| `/faq` | 1 | 0 | — | ✅ (18k chars) |
| `/blog` `/blog/:slug` | 1 | 0 | — | **34 tiny fonts** |
| `/case-studies` | 1 | 0 | **3** | h1→h3 skip, href=null CTA |
| `/about` `/products` `/solutions` | 1 | 0 | — | ✅; narrow measure |
| `/careers` `/legal` `/support` `/products/platform` | 1 | 0 | — | thin/narrow |
| _all React routes_ | +1 hidden home h1 | | | P0-4 bleed |

## Sequenced execution plan
1. **Quick wins (minutes):** P0-1 `{TODO}` · P0-2/P0-3 recover the 4 images · P2-4 cookie link · P2-9 version.
2. **P0 structural:** P0-4 shell split (kills 2×h1 + tracking-on-app-routes + payload) → P0-5 deal-analyzer → P0-6 verify/wire lead endpoint.
3. **P1 a11y/structure:** add h1 to 3 pages · label inputs in `SliderField` · case-studies heading · state-laws artifact · portal layout · href on CTA links.
4. **P2 polish:** contrast + min-font token sweep · symmetric-grid audit · editorial measure · thin-page content.
5. **Verify:** re-run this audit (1 h1/route, 0 unlabeled, 0 broken img, AA contrast) + mobile screenshots of dense pages.

## Out of scope / needs you
- Firebase `api` — enable **billing** → deploy functions.
- Vercel `/api` full features — set `ANTHROPIC_AUTH_TOKEN` + `GOOGLE_CLOUD_PROJECT`.
- `.git` 1.8 GB tracked datasets/DB — optional Git LFS / filter-repo.
