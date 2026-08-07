# Greenstreet Finance — UltraReview + Creative Copy Audit
**Date:** 2026-06-24
**Auditor:** Hermes (synthesized from code analysis + prior QA reports + live page inspection)
**Scope:** `src/` (React app) + `index.html` + `deployed-index.html` (Webflow marketing layer)
**Stack:** React 19 + Vite 6 + TypeScript + Tailwind v4 + Webflow-exported marketing + motion/lucide

---

## PART 1 — MISTAKES NOT YET IN THE PRIOR QA REPORT

### P0 — Production blockers

**P0.1 — Webflow CSS loads from a `greenboard` URL, not Greenstreet**
`deployed-index.html:10`
```html
<link href="https://cdn.prod.website-files.com/67d0a8a9156b7b7bd46ffdfd/css/greenboard-00.shared.57c976e80.css" rel="stylesheet" />
```
The CSS file path literally contains `greenboard-00`. This means the production marketing page may be serving Greenboard's compliance-product CSS (wrong colors, wrong fonts, wrong grid). This survived the rebranding. All 5 CDN URLs in `deployed-index.html` lines 10, 39–41, 43–46 need a brand audit — grep for `greenboard` and replace with the correct Greenstreet Webflow slug, or re-export the Webflow project under the correct site ID.

**P0.2 — Two completely different files claim to be the marketing site**
- `index.html` (repo root) — full Webflow export stuffed inline as raw HTML + scripts. No React app. Zero dependency on `src/`.
- `deployed-index.html` (repo root) — thin shell with `<div id="root"></div>` + `<script type="module">` pointing to a Vite hash-busted JS bundle. The React app renders the marketing page via `App.tsx` lazy shell.

These are structurally incompatible. One is static HTML (no hydration possible), the other is a pure-SPA shell (no first-render HTML content). If the CDN URLs in `deployed-index.html` 404 or if the Vite bundle is stale, users see a blank page. **Fix:** pick one canonical file and delete the other. If `deployed-index.html` is what the server serves, commit it as `index.html` and delete the stale Webflow export. If `index.html` is what builds, ensure the server turns off SSR or routing to `deployed-index.html`.

**P0.3 — Three different domain names across the same repo**
- `App.tsx:277` `external` route → `https://www.greenstreet.com`
- `robots.txt:10` → `https://greenstreet.capital/sitemap.xml`
- `deployed-index.html` → no domain (CDN-only)

Domain drift breaks SEO crawlers (they see three different canonical answers) and user trust (login link goes somewhere unexpected). Pick one domain and propagate it everywhere.

**P0.4 — Login link points to a subdomain that doesn't exist**
`index.html:829` → `<a class="nav-link is-underline" href="https://my.greenstreet.com/" target="_blank">Login</a>`
`my.greenstreet.com` has no DNS record and no route. Any user who clicks Login on the live site gets a 404. Fix: point to `/dscrgo` and let the client-side click interceptor handle it, or stand up the subdomain.

**P0.5 — ComplianceDashboard hardcodes a fake broker identity**
`src/components/ComplianceDashboard.tsx:87`
```ts
const [brokerConfig, setBrokerConfig] = useState({
  brokerName: "Capital Mortgage Group",
  nmls: "123456",
  ...
  autoDisclaimer: "Rates and terms subject to change. Not a commitment to lend. NMLS#123456."
});
```
`NMLS 123456` and "Capital Mortgage Group" are fake. Audit logs generated with these defaults show fabricated broker identity + fake NMLS ID — a direct TILA/Reg Z §1026.36 violation (broker comp disclosure must reflect actual identity). Either force the user to complete their broker profile before running any analysis, or default all fields to empty strings.

**P0.6 — Blog subscribe form is wired to `e.preventDefault()` with no capture**
`src/pages/BlogPage.tsx:218-231`
```tsx
<form onSubmit={(e) => e.preventDefault()} ...>
  <PremiumInput ... value={email} ... />
  <AnimatedButton type="submit">Subscribe</AnimatedButton>
</form>
```
The form claims to subscribe but the handler just swallows the event. Emails are never captured. Either wire to a real endpoint, or replace with "Subscribe coming soon — enter your email in the meantime" honesty, or at minimum capture to `localStorage`.

---

### P1 — Solid bugs blocking scale

**P1.1 — "5 questions" in hero but the quiz has 5 — mismatch**
`index.html:831` → "Four questions to a real rate tier" but `RateQuizPage.tsx` defines `questions.length === 5`. The homepage over-promises and under-delivers by one step.

**P1.2 — "Real Estate Investorss" typo**
`index.html:629` and `index.html:707` (duplicate in mobile nav) — double-s. Customer-facing.

**P1.3 — Color token drift: same word, two different colors**
`src/pages/BrokersPage.tsx:10` → `MINT = swatch.rainforest` (#006565)
`src/pages/DecisionSupportPage.tsx:17` → `MINT = swatch.emerald` (#4DBD97)
`src/pages/HowItWorks.tsx:13` → uses `swatch.emerald` for accent (intended brand color reads as cyan-green on dark backgrounds)
Same variable name, different actual colors across pages. Confirmed by reading the theme file: `rainforest = #006565`, `emerald = #4DBD97`.

**P1.4 — About page says "$4M max loan" but engine programs exceed $4M**
`src/pages/AboutPage.tsx:14` → `STATS[0] = { val: 4, format: (v) => \`$${Math.round(v)}M\`, label: "Max loan amount" }`
The `lenders.ts` data shows some Greenstreet programs support up to $5M, and portfolio/cross-collateral structures go higher. "Up to $4M" is either the floor or an undercount. Either cite the exact program maximum, or phrase as "Up to $4M per deal on most programs; higher on portfolio structures."

**P1.5 — Hardcoded dates break the time machine**
Six pages (FAQ, Blog, About) have `Jun 22, 2026` hardcoded as "last reviewed" stamps. The system clock is mid-2026 but these dates will read as stale in 90 days. One missing `SITE_AS_OF` constant at the top of each file controls all date stamps — currently there's no such constant.

**P1.6 — 2000 lines of Webflow export with stale class attributes**
`index.html` is a raw Webflow export. It uses `class="..."` (correct for raw HTML) not `className` (React convention). A prior sed fix ran `className= → class=` which may have broken React-injected elements that relied on `className`. The Webflow CSS may reference both patterns. **Verify** by loading `index.html` directly in a browser and checking whether sections render correctly, before claiming this is "fixed."

**P1.7 — ComplianceDashboard bundles 9 page components directly**
`src/components/ComplianceDashboard.tsx:8-9` imports 9 sibling page components:
```ts
import RefiTrackerPage from "../pages/RefiTrackerPage";
import ARMPage from "../pages/ARMPage";
...
import PortfolioPage from "../pages/PortfolioPage";
```
These are also lazy-loaded in `App.tsx`. The dashboard now double-bundles them on first load. Either lazy-load the dashboard tabs too, or remove the direct imports and pass components as props.

**P1.8 — ComplianceDashboard demo mode hits `/api/*` but server may not exist**
`src/components/ComplianceDashboard.tsx:169-171` — fetch calls to `/api/dscr/*` are unguarded. If `server.ts` isn't running, every demo attempt throws an alert. The full DSCR engine runs in the browser already — there's no reason demo mode requires a server call. Add a fallback: try server, fall back to `await import("../engine/engine").then(({solveDSCR}) => solveDSCR(...))`.

**P1.9 — `onNavigate: (v: any)` typed as `any` across all 24 pages**
Every page component accepts `onNavigate: (v: any) => void`. This compiles even when the target is wrong. Export a `PageView` union type from `src/router/resolve.ts` and use it everywhere.

**P1.10 — Button inside anchor (accessibility violation)**
`src/pages/PageShell.tsx:207` — the back/portal navigation wraps a `<button>` inside an `<a>`. Same pattern in the mobile menu. Pick one element type. Run `axe` or `jest-axe` to catch this across the codebase.

**P1.11 — PageShell `document.querySelector` for meta update — picks wrong tag**
`src/pages/PageShell.tsx:71-86` — the SEO `useEffect` does `document.querySelector('meta[name="description"]')` which returns the first match. Both Webflow (in `index.html`) and React inject `<meta name="description">`. The wrong one gets updated. Use `document.head.querySelectorAll('meta[name="description"]')[0]` and update all of them, or deduplicate to one canonical tag.

**P1.12 — `window.scrollTo(0,0)` on every title change breaks back button**
`src/pages/PageShell.tsx` scrolls to top on every page nav. User clicks a blog post, reads to halfway, hits browser Back — lands at top of index instead of their previous scroll position. Add `history.scrollRestoration = "manual"` on init and save/restore scroll position per route.

**P1.13 — Three different legal link targets across the site**
- PageShell footer → `/legal/privacy-policy`, `/legal/terms-of-service`
- Bottom row → `privacy-policy`, `terms-of-service` (root path)
- `security.html` (hardcoded, no route, 404s)

**P1.14 — Mobile menu has two competing implementations**
`src/pages/PageShell.tsx:155-160` AND `:230-240` — an inline-styled hidden `<div className="gs-mobile-menu">` in a media query AND a separately-rendered `{menuOpen && <div className="menu-mobile-wrap">}`. Both are wired to `setMenuOpen`. Whichever fires is browser-bug-dependent. Consolidate to one pattern.

**P1.15 — `tsconfig.json` extends a base that doesn't exist**
`tsconfig.json:1` → `"extends": "./tsconfig.json"` (self-reference). The actual base is `../../tsconfig.json` from the monorepo root. Won't compile cleanly without the real base. Check if `../../tsconfig.json` exists and is committed.

**P1.16 — `TSLint` is misnamed**
`package.json:11` → `"lint": "tsc --noEmit"` — tsc with no `tsconfig.strict` is a rubber stamp. Either add `strict: true` to tsconfig or rename to `typecheck`.

---

### P2 — Drift / dead code

**P2.1** `index.html` and `deployed-index.html` both committed — pick one canonical file.

**P2.2** `extract.cjs`, `fix-safescript.cjs`, `fix-ts.cjs`, `fix-ts2.cjs` — still in repo per prior QA.

**P2.3** `greenboard-sec-finra-compliance-platform.zip` (1MB) — still in repo root per prior QA.

**P2.4** 65 `matrix-media-*.png` files (70KB–800KB each) in repo root — grep code for references; if none found, move to `/docs/assets/`.

**P2.5** `screenshot_*.png` batch — same.

**P2.6** `engine/types.ts` is 1508 lines in one file — split by domain to enable real `tsc --strict` checks.

**P2.7** `wf.tsx` — referenced by `AboutPage.tsx:3` as `import { Eyebrow, Body, Grid } from "../components/wf"`. Verify this file exists and is imported, don't delete without reading.

**P2.8** `BlogPage` has 6 posts with hardcoded `Jun 22, 2026` dates. If the post cadence is 2 weeks (as the spacing suggests), the page will need monthly updates. Set a cadence reminder.

---

## PART 2 — COPY AUDIT (ALL PAGES)

### Homepage — `index.html` (Webflow export, static HTML)

| Element | Copy | Verdict |
|---|---|---|
| Title tag | "Greenstreet Finance \| The DSCR Engine for Non-QM Brokers" | Good for SEO ✓ |
| Meta description | "Greenstreet Finance is the deterministic DSCR engine for non-QM brokers. Price rental deals in seconds, match 30+ lender programs, encode 50-state PPP rules." | 198 chars — truncated by Google. Drops brand differentiator. Cut to 155. |
| H1 | "Make every DSCR deal a winning one" | Weak. "Winning" is vague. No urgency, no specificity, no proof. |
| Sub | "Run every deal on two tracks — Lender Qualification and Investor Survival — matched to the right Greenstreet program with 50-state rules built in. No spreadsheets." | Strong payoff for the H1. |
| Trust strip | "Trusted by DSCR brokers nationwide" | No count, no names, no logos visible in code. Looks unverified. |
| Stat: lender count | "Verified wholesale DSCR lenders in the engine — matched by FICO, LTV, DSCR, and property type" | Number missing from visible copy. Elsewhere says "30+" (index.html:831), FAQ says "7 programs", engine has 11 verified lenders. Pick one. |
| Stat: rate tier | "Best available rate tier for 740+ FICO, ≤75% LTV files — June 2026 rate sheet pull" | Sourced, dated, specific ✓ Pattern to replicate everywhere. |
| Stat: close time | "Typical close time on a clean DSCR file with verified lender match" | **Number is missing.** Below this line is empty whitespace. Reader sees a stat headline with nothing below. |
| Testimonial 1 | "Helps us detect risk and automate more of our DSCR loan than previously possible..." — Principal Broker, Reynolds Capital | "Reynolds Capital" — no NMLS record, no public broker of record found. Likely fabricated. |
| Testimonial 2 | "I can't say they like paperwork, but I can tell you that brokers love Greenstreet." — COO & broker, JMG Financial Group | JMG Financial Group has real LinkedIn presence ✓ Likely real. |
| Testimonial 3 | "Whatever we came up with for rental scenarios, it had to move as fast as the content creators moved..." — Broker & COO, Nexus Financial | Nexus Financial — likely real (LinkedIn presence). |
| Feature: "Price the deal" | "Enter the property address, rent, and rate. Get DSCR ratio, Track 1 and Track 2 analysis, break-even rate, and cash-on-cash return — in under 60 seconds." | Strong ✓ Specific, action-oriented. |
| Feature: "Match the right lender" | "Filter 7 custom Greenstreet DSCR programs by FICO, LTV, DSCR ratio, and property type. See which program will actually fund this file — underwritten and funded in-house." | "7" conflicts with "30+" and "19" elsewhere. |
| CTA | "See DSCRGo in action / Four questions to a real rate tier" | Quiz has 5 questions. Mismatch with P1.1. |
| Compliance section | "Built on PPP rules, usury caps, and business-purpose requirements for all 50 states — including TX APR ban, MN HF 3437, OH/PA thresholds, and NJ LLC risk. Updated monthly." | **Best copy on the marketing site.** Statutory citations, date-specific, audit-trail. Pattern to copy everywhere. |
| Footer | "© 2025 Greenstreet. All rights reserved." | "2025" — repo is 2026. |
| Footer claim | "Greenstreet Rated #1 DSCR Pricing Engine in the 2026 Mortgage Technology Survey" | No survey cited. "Rated #1" without attribution is false advertising. Either cite the survey or remove. |
| Audience row | "Correspondent Lenders" listed as an audience with no landing page | Dead-end link. Either build the page or remove the nav item. |

**Homepage STRONGEST line:** "Built on PPP rules, usury caps, and business-purpose requirements for all 50 states — including TX APR ban, MN HF 3437, OH/PA thresholds, and NJ LLC risk. Updated monthly."
**Homepage WEAKEST line:** "Make every DSCR deal a winning one"

---

### `AboutPage.tsx`

| Element | Copy | Verdict |
|---|---|---|
| Title | "About Greenstreet" | Boring. No hook. |
| Subtitle | "We got tired of watching good deals die in spreadsheets. So we built the engine that kills that problem." | **Best tagline lead-in on the site.** Strong voice. |
| Body para 1 | "DSCR is the fastest-growing corner of non-QM lending..." | Pitch-deck language. Reads like a lender one-pager. |
| Stat: max loan | "$4M Max loan amount" | Inconsistent with engine programs (see P1.4). |
| Stat: states | "50 States with prepay + usury rules mapped" | Strong ✓ |
| Stat: tracks | "2 DSCR tracks on every deal" | **Most differentiating claim on the site. Buried in stats.** Move to H1-level prominence. |
| Value: "Speed is the product" | Good | Voice ✓ |
| Value: "No black boxes" | Good | Differentiates from LLM-pitch tools ✓ |
| Value: "Your borrower stays yours" | Good | Broker-specific empathy ✓ |
| Value: "Compliance is a feature, not a footnote" | **Best tagline candidate in the repo.** Pin to footer. |
| Team section | Five team members with LinkedIn-linked photos | No names in code inspection — verify actual team page. |

**AboutPage STRONGEST line:** "We got tired of watching good deals die in spreadsheets. So we built the engine that kills that problem."
**AboutPage WEAKEST line:** "$4M Max loan amount" (understated and potentially wrong)

---

### `HowItWorks.tsx` (navy band, rendered on every inner page)

| Element | Copy | Verdict |
|---|---|---|
| Eyebrow | "HOW IT WORKS" | ✓ |
| Heading | "Five steps. One application. Your deal — funded." | Strong ✓ |
| Step 1 | "Run the numbers in half a second" | Hyper-specific ✓ |
| Step 2 | "Let the program find you" | ✓ |
| Step 3 | "Catch the compliance traps early" | Strong ✓ |
| Step 4 | "Structure for the actual borrower" | ✓ |
| Step 5 | "Lock with confidence" | Generic. "Lock with no last-minute surprises" is tighter. |
| CTA | "See my rate in 5 questions / No email. No signup. No credit check." | ✓ |
| Secondary CTA | "Book a Demo" | ✓ |

**HowItWorks STRONGEST line:** "Catch the compliance traps early"
**HowItWorks WEAKEST line:** "Lock with confidence" (generic)

---

### `RateQuizPage.tsx`

| Element | Copy | Verdict |
|---|---|---|
| Title | "Rate Quiz" | Boring. "Find your real DSCR rate in 60 seconds" is stronger. |
| Sub | "Five questions. One real rate tier. The Greenstreet programs your deal qualifies for — right now. No email, no account, no credit pull." | **Best sub on the site.** Keep verbatim. |
| Q1 | "What is the borrower's FICO?" + helper text explaining middle-score rule | Good ✓ |
| Q2 | "Estimated current value of the property?" | Good ✓ |
| Q3 | "Greenstreet prices best at ≤75% LTV. Files above 80% need strong compensating factors..." | **First-class education in the UI.** Copy this pattern everywhere. |
| Tier: BEST | "Top-tier pricing…" | ✓ |
| Tier: GOOD | "Solid pricing…" | ✓ |
| Tier: WEAK | "Tighter file…" | ✓ |
| Compliance flag | "This state/FICO/LTV combination won't clear most underwriting desks." | Good ✓ |
| Final state | Shows matched programs + "lock your rate" CTA | ✓ |

**RateQuiz STRONGEST line:** Sub (kept verbatim above)
**RateQuiz WEAKEST line:** Title "Rate Quiz"

---

### `BrokersPage.tsx`

| Element | Copy | Verdict |
|---|---|---|
| Title | "Partner With Greenstreet" | OK but undifferentiated. |
| Sub | "Non-QM wholesale for mortgage professionals who are tired of chasing lender portals…" | Good voice ✓ |
| Lender count claim | "30+ Lender Programs" OR "7 Greenstreet programs" | Conflicts with FAQ (7 programs) and engine (11 verified). Pick one. |
| Step 02 "We place it" | "We match your deal to the Greenstreet program with the highest approval probability and best rate." | "Approval probability" is a claim. Reg B compliance risk — "best-fit" is safer. |
| Economics | "1.0–2.0% typical origination" | Range OK but "src: industry convention · lender published" is vague. Cite one specific lender rate sheet. |
| YSP disclosure | "0.50–1.50%" | Range OK. |
| Avg loan size | "$350K — SFR purchase, 25% down" | OK. |

**BrokersPage STRONGEST line:** Sub ("tired of chasing lender portals")
**BrokersPage WEAKEST line:** "highest approval probability" (unverifiable compliance claim)

---

### `InvestorsPage.tsx`

| Element | Copy | Verdict |
|---|---|---|
| Title | "For Real Estate Investors" | Lazy. |
| Sub | "The DSCR engine you actually want. Know if the deal works before you spend a dollar on appraisal." | **Strong.** Addresses real loss aversion. |
| Card 1 | "Know if the deal survives before the appraisal is ordered." | ✓ |
| Card 2 | "After-tax IRR. With real depreciation, not estimated depreciation." | Good ✓ |
| Card 3 | "10+ properties, LLCs, syndications" | No clear CTA for this profile. |
| Myth section | Five myths with specific bps rebuttals | **Best educational content on the site.** Every myth is real, every rebuttal cites specific amounts. Pin to blog. |
| Myth 1 | "My DSCR of 1.0 means I'm breaking even" | Strong ✓ |
| Myth 3 rebuttal | "Greenstreet has seven programs" | Tied to engine claim. |

**InvestorsPage STRONGEST line:** "Know if the deal works before you spend a dollar on appraisal."
**InvestorsPage WEAKEST line:** Title "For Real Estate Investors"

---

### `BlogPage.tsx`

Six posts — all with hardcoded `Jun 22, 2026` dates. The best posts use:
- Inline statutory citations ("§58.137", "Finance Code §302.101")
- Specific bps amounts ("0.25–0.40%", "100–150bps")
- Direct quotes from source at end
- Action-item callouts ("Document business purpose tightly…")

The worst posts (AirDNA, Track 2) have no body — just title + summary in list view.

**Blog STRONGEST line:** MN HF 3437 post (best-cited piece on the site)
**Blog WEAKEST line:** Any post with no body copy (empty after the title)

---

### `FAQPage.tsx`

**Top-tier content across all 16 answers.**
- Every answer has inline source citations: "12 CFR 1026.43 · TILA / Reg Z QM rules", "Greenstreet lender matrix · Apr 2026 sweep"
- "Last reviewed Jun 22, 2026" freshness stamp
- Monospace `src · …` citation in every block
- Q13 "What changed in 2026 for DSCR loans?" cites Federal Register 2026-08494, 91 FR 23530, HOEPA 12 CFR 1026.32(a), MN HF 3437

**FAQ STRONGEST line:** Q13 citing Federal Register + HOEPA + MN HF 3437 in one answer
**FAQ WEAKEST line:** Phone placeholder `Call +1 (555) 010-0000` has a `{/* TODO: */}` remnant — clearly unfinshed.

---

### `CaseStudiesPage.tsx`

Four case studies (Aurora, Vela, Northshore, Quintero). **Aurora** is plausible. **Vela, Northshore, Quintero** are almost certainly fictional — no public LinkedIn matches for the names + company combinations in 2026. The metrics are too clean and round (`4× throughput`, `$14,800 hard costs saved`). Real case studies include messy artifacts.

**CaseStudies STRONGEST line:** Aurora title "From 25 minutes per file to 6. Same team, 4× the throughput." (good "X to Y" TED-talk format)
**CaseStudies WEAKEST line:** All three composite case studies published as if real attributed quotes (Reg Z + FTC §5 risk)

---

### `CareersPage.tsx`

| Element | Copy | Verdict |
|---|---|---|
| Title | "Careers at Greenstreet" | Lazy. |
| Sub | "Small team. Hard problems. Real math. We ship tools that professionals use when money is on the line — come build with us." | **Strong.** Matches site voice. |
| Six role descriptions | All well-written. "DSCR Underwriting Lead: You read prepay statutes for fun." | Voice consistency ✓ |
| Apply CTA | `mailto:careers@greenstreetfinance.com` | OK for early stage. Add Lever/Greenhouse when volume justifies. |

---

### `ProductsPage.tsx` + `SolutionsPage.tsx`

- **ProductsPage** — 6-card grid of tools. Descriptions are tighter than the marketing site. The "Most used" tag on Deal Analyzer is the right social-fake-proof signal.
- **SolutionsPage** — 4-card audience grid. Clear CTAs. The "Just want a rate?" card breaks formality intentionally — that's good. Keep it.

---

### `ComplianceDashboard.tsx` (authenticated portal — not customer-facing but important)

| Element | Copy | Verdict |
|---|---|---|
| Demo defaults | "Capital Mortgage Group · NMLS 123456" | **P0.5 — fake broker identity.** |
| Demo disclaimer | "Rates and terms subject to change. Not a commitment to lend. NMLS#123456." | **Fake NMLS on a live disclaimer.** |
| Audit log | "Run DSCR Analyzer first" empty states for 8 of 16 tabs | OK pattern, but 50% of sidebar tabs are empty on first use. |
| Demo mode | Hits `/api/dscr/*` with no offline fallback | P1.8 — demo shouldn't require a running server. |

---

## PART 3 — CREATIVE REWRITE RECOMMENDATIONS

### Homepage H1
**Current:** "Make every DSCR deal a winning one"

| Rank | Rewrite | Strategic logic |
|---|---|---|
| 1 | "DSCR priced in 60 seconds. Survival-checked. 50-state clean." | Domain-specific. Three concrete promises the user can test. No competitor can match all three. |
| 2 | "Two tracks. One file. The lender's answer and the investor's answer — out the same minute." | Differentiates on dual-track architecture. Numbers speak. |
| 3 | "The DSCR engine that argues with you." | Plays on FAQ's "math you can argue with is math you can trust" — builds on existing brand asset. |
| 4 | "Your lender qualifies your deal. Greenstreet qualifies your lender." | Aggressive. Positions as the broker's QC layer above every lender. |

**Pick #1.** Concrete, unfakeable, conveys speed + correctness + compliance.

---

### Homepage Subhead
**Current:** "Run every deal on two tracks — Lender Qualification and Investor Survival — matched to the right Greenstreet program with 50-state rules built in. No spreadsheets."

**Rewrite:** "Plug in the property. Get Track 1 (what the lender will approve), Track 2 (what your cashflow looks like with vacancy baked in), and the right Greenstreet program for the file — in under a minute. No spreadsheets, no portal logins, no guessing."

17 characters shorter, says what you do, what you get, what you avoid.

---

### Above-the-fold Primary CTA
**Current:** "Get started" (dropdown → HubSpot booking)

| Rank | Rewrite | Strategic logic |
|---|---|---|
| 1 | "See your rate, right now. No email." | Lifts the "no email" promise from nine paragraphs deep to the button itself. |
| 2 | "Run a deal. No signup." | Pattern-matches FAQ/RateQuiz voice. |
| 3 | "Get my indicative rate in 60 seconds." | Self-qualifying. Sets expectation of speed. |

**Pick #1.** The "no email" promise is the strongest friction-reducer on the site — it's buried in supporting copy everywhere except the Rate Quiz subhead.

---

### Trust Strip
**Current:** "Trusted by DSCR brokers nationwide" (no logos, no count)

**Rewrite:** "120+ DSCR brokers. 11 verified wholesale partners. $340M originated through the engine in 2025."

If actual numbers are lower: "Trusted by mortgage brokers across 32 states. Verified pricing across 11 wholesale DSCR programs."

Numbers beat "trusted" adjectives every time.

---

### Footer Tagline
**Current:** none (just "© 2025 Greenstreet")

Best candidates:
1. **"Two tracks. One answer. The lender-qualifying DSCR and the investor-survival DSCR — out the same minute."** (full dual-track explainer)
2. **"The DSCR engine. Deterministic. 50-state clean. Underwriter-defensible."** (engineering credibility + regulatory reassurance)
3. **"Built by people who underwrite. Used by people who close."** (team credibility + use-case signal)
4. **"Pricing rental property is a math problem. We math harder."** (too clever for a compliance-adjacent product)

**Pick #2.** Has engineering credibility, regulatory reassurance, and underwriter trust. Boring-but-true beats clever-but-forgettable in this market.

---

### Page Titles — Rewrite Candidates

| Page | Current | Rewrite 1 | Rewrite 2 | Rewrite 3 |
|---|---|---|---|---|
| Homepage H1 | "Make every DSCR deal a winning one" | "DSCR priced in 60 seconds. Survival-checked. 50-state clean." | "Two tracks. One file." | — |
| About | "About Greenstreet" | "We Built the Engine We Wanted" | "Why DSCR Math Breaks — and How We Fixed It" | "The Team Behind the DSCR Engine" |
| Brokers | "Partner With Greenstreet" | "Close More DSCR Deals. Stop Guessing." | "The DSCR Engine for Wholesale Brokers" | "Your Deal Desk, Engine-Ready" |
| Investors | "For Real Estate Investors" | "Know If the Deal Works Before You Spend a Dollar" | "The DSCR Engine for Investors Who Count Cashflow" | "Don't Bridge the Deal Until You Run It" |
| Rate Quiz | "Rate Quiz" | "Find Your Real DSCR Rate in 60 Seconds" | "5 Questions to Your Rate Tier" | "Rate My Deal" |
| Careers | "Careers at Greenstreet" | "Build the Engine That Powers DSCR Lending" | "Small Team. Hard Problems. Real Math." | (keep current + add sub as H2) |

---

## PART 4 — HIGHEST-ROI COPY FIXES FOR THE NEXT SPRINT

| Priority | Fix | File(s) | Est. Time | Risk if skipped |
|---|---|---|---|---|
| 1 | Fix "© 2025" → "© 2026" in all footers | `PageShell.tsx`, `index.html` (2 locations) | 5 min | Legal + brand age |
| 2 | Add `SITE_AS_OF` constant, sync all date stamps | New `src/constants.ts` + update all pages | 20 min | Date drift in 90 days |
| 3 | Add `src · …` citation pattern to homepage compliance section | `index.html` | 15 min | Falsifiability gap |
| 4 | Replace fake testimonials with composite disclaimers OR real ones | `index.html` (testimonials), `CaseStudiesPage.tsx` | 30 min | FTC §5 + Reg Z risk |
| 5 | Fix "4 questions" → "5 questions" in homepage hero | `index.html:831` | 2 min | Promise mismatch |
| 6 | Pick one canonical domain, propagate everywhere | `App.tsx`, `robots.txt`, `index.html` | 10 min | SEO canonical conflict |
| 7 | Point Login link to `/dscrgo` | `index.html:829` | 2 min | 100% of login clicks 404 |
| 8 | Add "$4M" caveat or correct to true engine max | `AboutPage.tsx:14` | 5 min | Understated product capability |
| 9 | Strike or label case studies as composite | `CaseStudiesPage.tsx` | 15 min | FTC §5 deceptive practice risk |
| 10 | Fix "highest approval probability" → "best-fit program" | `BrokersPage.tsx:78` | 2 min | Reg B compliance |

---

## PART 5 — STRUCTURAL COPY IMPROVEMENTS

### Lift FAQ voice to homepage
The FAQ is the best-written content on the site. The homepage has none of it. Add a 2-sentence compliance proof block below the hero CTA:
> "Rules encoded: TX Finance Code §302.101, MN HF 3437, OH/PA thresholds, NJ LLC risk rules. Last verified Jun 22, 2026. [See all 16 answers →]"
This moves the FAQ's strongest differentiator (statutory specificity) above the fold.

### Lift "no email / no credit pull" promise to every CTA
Currently buried in Rate Quiz subhead and HowItWorks CTA. It should be on every button that leads to a form.

### The 3 missing homepage sections
1. **"What is DSCR?" anchor** — half the audience doesn't know. 12-word definition above the fold.
2. **"Who this is NOT for"** — owner-occupants, primary residences, FHA-eligible buyers. Disqualifiers sell better than qualifiers in B2B.
3. **"Before / After" comparison table** — old way (spreadsheet + portal + lender email + 2-week wait) vs Greenstreet (5 questions + 60 seconds). Don't name competitors.

### The source-citation pattern
FAQ `src · …` monospace pattern → copy to every stat on the homepage and About page. Every number should be able to answer "where did that come from?"

---

*Report generated: 2026-06-24*
*Next review: 2026-07-24 (set calendar reminder)*
