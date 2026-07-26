# Greenstreet Finance — QA Fix Ultraplan

Source: 4 parallel audits (homepage / routing / design-system / content), 2026-06-23.
Ordered by dependency + risk. Each phase ends with a verification gate.

Legend: 🔴 critical · 🟠 high · 🟡 med · 🟢 low

---

## PHASE 0 — Token foundation (prerequisite, low risk)
Unblocks every design fix. No visual change by itself.

- [ ] In `src/pages/PageShell.tsx`: export the token set
      `export const tokens = { PISTACHIO:"#EEEFD3", MINT_BG:"#e8e9bf", MIDNIGHT:"#003738", RAINFOREST:"#006565", LEMON:"#d8d958", FADED:"#00373880" }`
      (or individual named exports).
- [ ] Add shared styles: `export const primaryCTA` (lemon bg, midnight text, lemon border, midnight hover — mirror nav) and `export const MONO = '"JetBrains Mono", monospace'`.
**Gate:** app still builds, no visual diff.

---

## PHASE 1 — Code correctness (silent breakage, zero visual risk) 🔴
1. 🔴 **Routing round-trip** — `src/router/resolve.ts` `/tools/` block: add cases for
   `dscr-calculator, lender-intel, state-laws, deal-analyzer, borrower-profiles` → return same view.
   (They already exist in `isKnownRoute`; only `resolveRoute` omits them.)
2. 🟠 **Clean canonical paths** — add to `ROUTE_MAP` so URLs are DSCR-semantic AND round-trip:
   `/dscr-calculator, /lender-intel, /deal-analyzer, /state-laws, /borrower-profiles, /decision-support`.
   Keep old `/products/*` + `/tools/*` as aliases (back-compat). Fixes dead CTA links #10.
3. 🟠 **Dead CTA hrefs** — point to the new clean paths:
   `DealAnalyzerPage.tsx:142` (`/dscr-calculator`,`/decision-support`), `InvestorsPage.tsx:22,94,95` (`/dscr-calculator`,`/lender-intel`),
   `BorrowerProfilesPage.tsx:15-16` (was `/solutions/ria-registration`,`/solutions/broker-dealers` → `/lender-intel`,`/state-laws`).
4. 🟠 **Marketing hard-404 links** — `MarketingSite.tsx` `/book-demo`→`/rate-quiz`, `/partnerships`→`/partners` (brokers-partner) or `data-external`.
5. 🟢 **Runtime bugs** — `BlogPage.tsx:173` BlogIndex add `onNavigate` prop (used at :182);
   `LenderIntelPage.tsx:46-55` move `EMERALD` decl above `verifiedColor` (TDZ).
**Gate:** reload each tool route + deep-link `/blog/<slug>`, `/case-studies/<slug>`; no white-screen; URLs resolve back.

---

## PHASE 2 — Invisible text + design tokens 🔴
6. 🔴 **Migrate 7 dark pages to light tokens** (pistachio-on-mint = unreadable today):
   `DecisionSupportPage, PortfolioPage, ReturnsPage, StressMatrixPage, TaxEnginePage, STRUnderwritingPage` + `components/DSCRCalculatorSection`.
   - `MINT="#4DBD97"`→ RAINFOREST `#006565`; `CREAM="#EEEFD3"`→ MIDNIGHT `#003738`.
   - `rgba(255,255,255,*)` borders→ `#00373880`; fills→ `#e8e9bf` or remove.
   - dark bg `#002D2E` section → PISTACHIO page / MINT card.
7. 🟡 **Centralize tokens** — delete per-file `MINT/CREAM` consts in ~20 migrated pages, import from PageShell.
   Normalize CTA text color `#002D2E`→`#003738`.
8. 🟠 **CTA color** — apply shared `primaryCTA` (lemon) to inline primary CTAs:
   AboutPage:64, BrokersPortalPage:22/88, BrokersPage:94, FAQPage:170, BlogPage:149/218, BorrowerProfilesPage:95,
   InvestorsPage:22/94, CaseStudiesPage:127, CareersPage:52, RateQuizPage:135. (Leave rainforest text-links.)
9. 🟡 **Grey captions** `#777/#888/#aaa` → RAINFOREST/MIDNIGHT (DSCRCalculatorPage:266, DecisionSupportPage:113/126/145/146/161, PortfolioPage:69/114, etc.).
10. 🟡 **Typography** — standardize font stack to `"Outfit Variable", Outfit, sans-serif`; one mono token; cap weight at 700.
**Gate:** open all 7 migrated pages — text legible; contrast check; CTAs lemon; no leftover emerald/white-on-light.

---

## PHASE 3 — Lender data single source of truth 🟠
11. 🟠 Build ONE canonical lender module (the 11): Griffin, Defy, Easy Street, Visio, Kiavi, New Silver, Rocket Pro TPO, Angel Oak, Lima One, Deephaven, American Heritage.
    - Remove **Insula** (decision v11.2) + **UWM** from `LenderIntelPage`.
    - Fix **Kiavi minDSCR → 1.10** in `dscrData.ts:38` (was 0.8).
    - Reconcile Visio floor (0.75 flex vs 1.0) and Easy Street (0 vs 0.8 purchase) — document purchase-vs-cashout.
    - Single count source — kill the "13 shown" vs "11 of 30+" vs comment mismatch.
    - Reconcile `dscrData.ts` (18) ↔ `engine/lenders.ts` (19, missing Rocket) ↔ LenderIntel to the canonical 11 as the public set.
12. 🟡 Remove `· REVERIFY PRIORITY` from Deephaven `special` string (`LenderIntelPage.tsx:24`).
13. 🟡 **Track 2 rates** — standardize to engine (8% vacancy / 8% mgmt / 5% maintenance) in DSCRCalculatorPage:147, BlogPage:59, DealAnalyzerPage:29 docs.
14. 🟡 **Golden example** — DECISION NEEDED: calculator defaults compute **1.11x**; marketing/blog say **1.13x**.
    Recommend: make 1.11x the published figure everywhere (calculator = source of truth), OR lower default tax/ins so default = 1.13x. Pick one, apply globally.
15. 🟡 "9 wholesale lenders" (BlogPage:32,34) → 11.
**Gate:** count consistent across LenderIntel/Products/Solutions/Brokers/FAQ/HowItWorks; Kiavi 1.10 everywhere; example figure consistent.

---

## PHASE 4 — Homepage + MarketingSite rebrand (compliance → DSCR) 🟠
Applies to BOTH `marketing-page.html` (static `/`) and `src/components/MarketingSite.tsx`.
16. 🔴 Hero H1 "Make everyone a compliance champion" + garbled subhead → DSCR value prop.
17. 🟠 Step copy 01/03/04/05 (Exam-ready / 17a-4 WORM / compliance champion / supervision) → DSCR pipeline copy. Step 02 (DSCRGo) is the good model.
18. 🟠 Step tab labels (Tools/Automation/Experience/Books&Records/Privacy&Security) → DSCR stages (Run the numbers / Match lenders / Rate quiz / State rules / Lock the rate) — align with `HowItWorks.tsx`.
19. 🟠 "Who We Serve" nav+footer audiences (Financial Advisors, Private Funds, Hedge Funds, Broker Dealers, RIA Registration, Service Partners) → Brokers / Investors / Borrower Profiles / Private Lenders.
20. 🟠 Trust band: replace wealth-mgmt logos (Betterment, Kroll, Harbert, Chicago Partners, Accolade, Retirable, Compound, JMG…) with DSCR/RE brands; heading "Trusted by 500+ financial institutions" → "…brokers and lenders"; add descriptive `alt`.
21. 🟡 119 empty `alt=""` in MarketingSite → descriptive on content imgs (decorative may stay empty).
22. 🟡 Solution-menu `placeholder.60f9b1840c.svg` icons (MarketingSite:986-1006) → real icons or remove.
23. 🟡 Remove leftover compliance resource-card headings ("Why Compliance Becomes a Bottleneck", "Kroll…Investment Advisors").
**Gate:** load `/`; no compliance copy/audiences/logos; tab labels match steps; restart dev server (caches html at boot).

---

## PHASE 5 — Step animations (videos) 🔴
24. Approve proof style (Veo 3.1 Lite, lemon-on-teal dashboard). Generate remaining 4:
    Match the lenders, Rate quiz, State rules, Lock the rate (Veo 3.1 Lite, 6s, 16:9).
25. **Hosting** — download all to `greenstreet_frontend/public/anim/*.mp4`; reference `/anim/<name>.mp4` (no fragile CDN). Also re-host hero video or generate a DSCR hero loop.
26. Wire the 6 `<video src>` in `marketing-page.html` (5 steps + hero) to the local paths; keep poster `.webp` or regenerate posters.
**Gate:** load `/`; each step card plays its loop; no 404 in network.

---

## PHASE 6 — Cleanup 🟢
27. Confirm `ComplianceDashboard` + `*Tab.tsx` (Firm/Employee/ThirdParty/Communications) are unrendered; remove if dead (note: `ComplianceDashboard` IS rendered for `portal` view — keep/rename, don't delete blindly).
28. Footer emit real hrefs (SEO/no-JS) — optional.
29. Consider removing `@ts-nocheck` from PageShell to catch View drift — optional, may surface latent errors.
30. `placeholder.svg` 403 — remove reference (cosmetic).

---

## PHASE 7 — Final verification
- `npm run lint` (tsc --noEmit) clean.
- Preview every top-level route + a deep-link + a tool reload: no white-screen, no console errors.
- Contrast spot-check on migrated pages.
- Network tab on `/`: zero 403/404.

---

# ROUND 2 — Live visual QA findings (new, not in phases above)

Harness caveat: preview was unstable (Vite HMR reload loop, route drift, screenshot timeouts). Findings below are the ones confirmed from stable moments + source. "Wrong-view-under-SPA-nav" reports are likely partly harness drift but overlap real bugs below.

## 🔴 NEW CRITICAL
V1. **No error boundary anywhere** → any page-component throw unmounts the WHOLE app to a white screen. Add a top-level `<ErrorBoundary>` in `App.tsx` around the rendered page. This is the root multiplier for V2/V3.
V2. **`/blog` and `/blog/<slug>` = full white screen.** `BlogIndex` throws (`onNavigate` undefined, used at BlogPage.tsx:182). Static plan rated this 🟢; rendered it's CRITICAL (entire app blanks). Fix = Phase 1 #5 BUT promote priority.
V3. **`/tools/portfolio` (and possibly `/tools/returns`) render blank/crash.** Console: "error occurred in `<PortfolioPage>`". Likely the invisible-token migration target also throwing on mount — verify + fix when migrating (Phase 2 #6).
V4. **Clean audience routes unrouted** — `/brokers`, `/investors`, `/borrower-profiles` not in `ROUTE_MAP` → fall through to marketing homepage. Add to ROUTE_MAP (extends Phase 1 #2).

## 🟠 NEW HIGH
V5. **Same-view-different-slug doesn't re-render** → stale content:
   - `/terms-of-service` shows Privacy Policy (both resolve to `legal` view; setView same value → no remount → LegalPage reads stale pathname).
   - `/case-studies/<slug>` shows the index, not detail.
   - (Blog detail same class once V2 fixed.)
   Fix: force re-render on slug change — pass `key={pathname}` to these pages in App.tsx, or pass the live `path` prop and have App re-render on popstate path change.
V6. **Mobile nav doesn't collapse** — PageShell nav keeps all 8 links inline at 375px → ~383px horizontal overflow on every inner page. Add a responsive hamburger / wrap. (Desktop ≥1440px fine.)
V7. **Same-hue-on-tint invisible text** (distinct from cream/mint): rainforest text `#006565` on `rgba(0,101,101,0.07–0.10)` tint = contrast ~1.0. Seen on decision-support CTA, case-studies category pills, "Want the full deal?" cards. Phase 2 must also cover rainforest-on-rainforest-tint, not just the cream/mint pair.

## 🟡 NEW MEDIUM
V8. Webflow GSAP scripts from the static nav/footer re-execute on React pages → console flooded with `.nav-btn/.menu-mobile-wrap/.burger-line not found`, and crash `preview_screenshot` ("target closed"). Root cause of harness instability + dead mobile menu. Consider stripping the embedded marketing nav scripts from React pages / consolidating to the React `PageShell` nav.
V9. Homepage broken img `…69f39072e5d1496fe62a7ce5_frame-1%20(3)%201.webp` (naturalWidth 0).

## Positive confirmations (render OK)
About, FAQ (accordion works, single-open), Rate Quiz (completes → shows tier 6.600%), Privacy Policy, Case Studies index — all pistachio bg, correct h1, HIW band, logo "Greenstreet Finance". Body bg token consistent. About contrast 11.18 (good).

---

## Open decisions (need your call)
- **D1** Golden example: publish **1.11x** (match calculator) or tune defaults to **1.13x**?
- **D2** Lender set: hard-remove Insula+UWM to land on **11**, or formally bless **13**?
- **D3** Trust-band: generate placeholder DSCR/RE wordmark logos, or drop the band for now?
