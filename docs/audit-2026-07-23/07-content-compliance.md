# Greenstreet DSCR Platform — Marketing-Compliance & Brand-Consistency Audit

**Scope:** `src/pages/*` (29 pages), `src/data/dscrPrograms.ts`, `src/routes/narrate.ts`, `src/pages/PageShell.tsx`, `src/design/SiteShell.tsx`, `src/components/BrokersPortalPage`/`ComplianceDashboard`, and the committed `index.html` (221 KB).
**Method:** read-only. Grep + full read of the key content/legal/case-study/program files.
**Date of audit:** 2026-07-23. **No repository files were modified.**

**Regulatory framing note (read first):** DSCR loans are business-purpose, non-owner-occupied loans and are therefore *generally* exempt from TILA/Reg Z, RESPA/TRID, and the consumer provisions of ECOA. That exemption does **not** cover the exposure below: the **FTC Act / UDAAP deception standard applies regardless of loan purpose**; the **Fair Housing Act** and **ECOA anti-discrimination/adverse-action** rules apply to dwelling-secured lending; and **many states require company/MLO licensing (NMLS) to make or broker business-purpose loans secured by 1–4 residential units** and regulate mortgage advertising. An entity that publicly and repeatedly calls itself a "direct lender" that "funds in-house" is held to lender advertising norms (NMLS ID, Equal Housing, licensing) by near-universal industry practice and many state ad rules. The site also voluntarily invokes consumer-mortgage machinery in its own copy (TRID 3-day CD, Reg Z payment-shock), reinforcing that it presents as a mortgage lender.

---

## TOP 5 COMPLIANCE / CONTENT RISKS

1. **CRITICAL — Mandatory lender disclosures are entirely absent site-wide.** No NMLS ID, no state licensing statement, no Equal Housing Lender/Opportunity logo or text, no ECOA/fair-lending notice, and no physical street address appear on *any* user-facing page or in `index.html` — despite the site repeatedly branding itself a "direct lender" that "underwrites and funds in-house."
2. **CRITICAL — The company's core identity is self-contradictory.** `AboutPage.tsx:27` states "We are a software platform, **not a lender**, not a referral marketplace," while `BorrowerProfilesPage`, `SolutionsPage`, `BrokersPage`, and `BrokersPortalPage` state Greenstreet **is** "the direct lender," "the broker AND the lender," and "we are the lender." These claims are mutually exclusive; whichever is false is a misrepresentation, and the disclosure obligations turn on which is true.
3. **CRITICAL — Concealed white-label sourcing contradicts the "we fund in-house" claim.** `dscrPrograms.ts` header comment: programs are "live DSCR eligibility matrices from Greenstreet's **capital partner (caketpo.com/products)**… **Partner name is NEVER surfaced to customers** — Greenstreet underwrites and funds these in-house." Each program carries a `_src:` mapping a rebranded tree name to a third party's product (Maple←"Cup Cake DSCR," Oak←"Pound Cake," Birch←"Sponge Cake," Cedar←"Coffee Cake," Aspen←"Funnel Cake," Willow←"Cheese Cake," Magnolia←"Velvet Cake"). If loans are table-funded/resold from a wholesale partner, the public "we fund it ourselves / in-house" claim is deceptive (UDAAP/FTC).
4. **HIGH — Fabricated testimonials and customer logos.** `BrokersPortalPage.tsx:40-59` presents **named** endorsers with hard performance stats ("Alex Stickelman, CCO & COO, Vela Capital … closed in 19 days"; "Robert Hayes … I run eight loans through Greenstreet a week") and **no** illustrative disclaimer. `CaseStudiesPage.tsx` renders real `<img>` logo files for the same non-existent companies (`cs-vela-capital.png`, etc.). FTC Endorsement Guides + the 2024 fake-reviews/testimonials rule (16 CFR Part 465) prohibit invented endorsements presented as genuine.
5. **HIGH — The public SEO/social identity is still the OLD broker positioning.** `index.html:32-44` `<title>`/description/OG/Twitter tags all read "Greenstreet Finance | **The DSCR Engine for Non-QM Brokers** … match verified DSCR programs" — the marketplace/broker framing the repositioning was supposed to remove. This is the first thing Google and social shares display.

---

## FULL FINDINGS (by severity)

### CRITICAL

#### C1. Required lender disclosures missing everywhere
- **Evidence:**
  - Grep for `NMLS`, `Equal Housing`, `licensed`, `ECOA`, `fair lending` across `src/pages` and `index.html` returns **no user-facing hits**. The only `NMLS` occurrences are an *input field for the user's own broker profile* in the internal tool (`ComplianceDashboard.tsx:293,1649`) and a code comment in `BrokersPortalPage.tsx:39`.
  - `LegalPage.tsx` (Disclosures/Privacy/Terms, all three docs) contains **no** NMLS ID, licensing statement, Equal Housing notice, or physical address. Footers (`PageShell.tsx:308-321`, `SiteShell.tsx:332-339`) show only `© 2026 Greenstreet Finance`, Privacy, Terms.
  - No physical address anywhere; About shows only city/state "Austin, Texas" (`AboutPage.tsx:172-173,706`). `index.html` has no JSON-LD `Organization`, `streetAddress`, `telephone`, or Equal Housing logo.
- **What IS present (partial credit):** Privacy Policy, Terms of Service, "not a commitment to lend / not a rate lock / not a credit approval" language (`LegalPage.tsx:61,135,149`), and per-tool "Preliminary estimate — not a commitment to lend, subject to full underwriting/appraisal/credit approval" footnotes (e.g. `DSCRCalculatorPage.tsx:359,493`, `DealAnalyzerPage.tsx:392`, `PortfolioPage.tsx:687`, `StressMatrixPage.tsx:895`).
- **Regulatory impact:** Fair Housing Act (Equal Housing), ECOA anti-discrimination, state licensing/NMLS display and mortgage-advertising rules, and UDAAP. A self-described residential "direct lender" with zero licensing/EHL disclosure is a conspicuous gap.
- **Recommendation:** If Greenstreet lends: add NMLS company ID (and per-state licensing list or link), Equal Housing Opportunity logo + statement, and a physical licensed address to every footer and the legal page; add an ECOA/adverse-action reference. If it does **not** lend (see C2/C3), remove all lender claims instead. Add a JSON-LD `Organization`/`FinancialService` block to `index.html`.

#### C2. "Not a lender" vs "direct lender" — irreconcilable identity claims
- **Evidence:**
  - `AboutPage.tsx:27`: *"We are a software platform, **not a lender**, not a referral marketplace."* Also `:132-135` "Greenstreet is the software platform…," "**Founded by a broker**," and `:284,341` "die at the lender" / "**Brokers**, investors and the borrowers they serve."
  - `BorrowerProfilesPage.tsx:318`: "Greenstreet is **the direct lender**: no broker markup, no middleman, one underwriting desk." `:485` "Greenstreet underwrites it directly."
  - `SolutionsPage.tsx:368`: "Greenstreet is **the lender** — no middlemen, no broker portals" (+ code comment `:7` "We ARE the lender AND the broker").
  - `BrokersPage.tsx:145`: "Greenstreet is **the broker and the lender** — direct to you." `:134-137,148` "We underwrite and fund it … we fund it in-house."
  - `BrokersPortalPage.tsx:15`: "send it straight to underwriting … **we are the lender**." `LenderIntelPage.tsx:635` "we place your file in the best-fit program and **fund it ourselves**."
- **Impact:** UDAAP/misrepresentation; also determines disclosure duties (C1). Cannot be simultaneously "not a lender," "the broker and the lender," and "the direct lender."
- **Recommendation:** Pick one legally accurate identity and enforce it in one shared copy source. The About "software platform, not a lender" line is the sharpest residue — reconcile or delete.

#### C3. White-label sourcing concealed; "fund in-house" likely inaccurate
- **Evidence:** `src/data/dscrPrograms.ts:1-10` (partner = `caketpo.com`, "Partner name is NEVER surfaced," "funds these in-house"); `_src:` comments at lines 78, 124, 180, 234, 286, 332, 366 map every "Greenstreet" tree program to a third party's "…Cake DSCR" matrix with real effective dates. `LenderIntelPage.tsx:24` comment: "Every label shown is a Greenstreet program name — **zero outside lender names**" (i.e., the source was deliberately scrubbed).
- **Impact:** If the economics are wholesale/correspondent rather than balance-sheet, "we underwrite and fund in-house / fund it ourselves" (C2 quotes) is deceptive. Even as code comments this is discoverable (repo is public-style; `index.html` is committed and source maps can leak).
- **Recommendation:** Align public funding claims with the actual capital structure; if a partner funds/underwrites, disclose the relationship accurately ("we arrange financing," correspondent, etc.) and drop "fund in-house."

#### C4. Fabricated testimonials / customer logos
- **Evidence:**
  - `BrokersPortalPage.tsx:40-59` — three **named** individuals + companies with concrete stats ("closed in 19 days," "I run eight loans through Greenstreet a week"); **no** "illustrative/representative" disclaimer near them. "Vela Capital" here is the *same* company the case-studies page admits is **not** a verified customer.
  - `CaseStudiesPage.tsx` — 4 studies (Vela Capital, Northshore Non-QM, Quintero & Co., Aurora) with specific metrics ("$14,800 hard costs saved," "4× throughput," "$18M blanket line," "1.11x," "ITIN approval in under three minutes") and quotation-mark quotes attributed to "[Company] team." These *do* carry a disclaimer ("Illustrative composite scenarios … Company names are representative examples, not verified named customers," `:1049-1052`, also `:21,785,820,870`) — **but** the page renders **real company logo image files** (`:121-125`, `cs-vela-capital.png` etc.), which reads as proof of real clients and undercuts the disclaimer.
- **Impact:** FTC Endorsement Guides; 16 CFR Part 465 (fake/deceptive testimonials, 2024) — invented endorsements and fabricated client logos on a lending site are classic UDAAP/FTC deception. The InvestGO portal set (no disclaimer, named people, hard stats) is the more exposed of the two.
- **Recommendation:** Remove the named portal testimonials or replace with real, consented, substantiated ones. Remove fabricated company logos from case studies; keep composite scenarios only with the disclaimer and no logos. Never reuse an "illustrative" company name as a named endorser elsewhere.

### HIGH

#### H5. `index.html` metadata still sells to "Non-QM Brokers"
- **Evidence:** `index.html:32` `<title>Greenstreet Finance | The DSCR Engine for Non-QM Brokers</title>`; `:33` meta description "…deterministic DSCR engine **for non-QM brokers**. … **match verified DSCR programs**…"; identical `og:title`/`og:description` (`:37-38`) and `twitter:title`/`twitter:description` (`:43-44`).
- **Impact:** The repositioning's single most visible surface (search results, link previews) still broadcasts the old broker/marketplace identity — contradicts C2 and confuses SEO intent.
- **Recommendation:** Rewrite title/description/OG/Twitter to the direct-to-investor lender positioning; regenerate the committed `index.html`.

#### H6. Placeholder phone number shipped site-wide as the contact/quote line
- **Evidence:** `+1 (555) 010-0000` / `tel:+15550100000` appears in **14 files** — `AboutPage.tsx:845,885`, `FAQPage.tsx:534,551`, `DealAnalyzerPage.tsx:392`, `STRUnderwritingPage.tsx:991,1000`, `TaxEnginePage.tsx:894`, `DecisionSupportPage.tsx:493,593`, `StressMatrixPage.tsx:675,895`, `PortfolioPage.tsx:687`, `ReturnsPage`, `MonteCarloPage`, `RateQuizPage`, `ARMPage`, `BorrowerProfilesPage`, `ComplianceDashboard`. 555-0100 is the reserved *fictional* exchange. It appears on compliance disclaimers ("Contact Greenstreet at +1 (555) 010-0000 for a formal quote") and on "Talk to a specialist" CTAs.
- **Impact:** Trust/UDAAP — directing users to a non-working number on the very disclaimers that tell them to verify terms. Ships a fake contact channel.
- **Recommendation:** Replace with the real number in one shared constant; do not ship the 555 placeholder.

#### H7. "19 programs" claim contradicts the 7 that exist
- **Evidence:** `ProductsPage.tsx:56` "Filter **all 19** Greenstreet DSCR programs," `:63` metric "19"; `DSCRCalculatorPage.tsx:427` "See all **19** programs →". Actual data: `dscrPrograms.ts` defines **7** (`DSCR_PROGRAMS`), `LenderIntelPage.tsx` renders those 7, and `FAQPage.tsx:61` says "**7 programs verified**."
- **Impact:** Unsubstantiated ~2.7× overstatement of product breadth on a lending site — an advertising accuracy/UDAAP issue.
- **Recommendation:** State the real count (7) everywhere, sourced from `DSCR_PROGRAMS.length`.

#### H8. DSCR program-name sprawl (4–5 incompatible systems)
- **Evidence:** customers cannot map advertised products to real ones:
  1. Tree names (actual data): Maple, Oak, Birch, Cedar, Aspen, Willow, Magnolia (`dscrPrograms.ts`).
  2. Core / Flex / Premier / Global (`FAQPage.tsx:60`, `BlogPage.tsx:451`, `SolutionsPage.tsx:50,60`).
  3. DSCR 1-4 Standard / DSCR Multi / DSCR Global / DSCR Portfolio-Blanket (`CaseStudiesPage.tsx:47,69,91,115`; `BorrowerProfilesPage.tsx:361,437,534,727`).
  4. 1–4 Unit Standard / Portfolio-Blanket / Foreign National / STR-Airbnb / Sub-1.0 (`BrokersPage.tsx:214-219`).
- **Impact:** Brand incoherence + advertising accuracy: pages describe "Global," "Premier," "Core" products that don't exist in the program data. A borrower cannot verify the product they were quoted.
- **Recommendation:** Consolidate to one canonical program taxonomy (the tree names, or a customer-facing tier map) and drive all pages from `dscrPrograms.ts`.

### MEDIUM

#### M9. Stale / expiring dated content on a lending site
- **Evidence:** FAQ rate quotes "indicative as of Jun 25, 2026," sourced "Freddie Mac PMMS · wk of Jun 18, 2026" (`FAQPage.tsx:40-41`) — ~5 weeks old at audit date. "Next review **Jul 22, 2026**" (`FAQPage.tsx:460`, `BrokersPage.tsx:579`) is already **past** as of 2026-07-23. Program data `DSCR_PROGRAMS_AS_OF = "Jun 24, 2026"`; Legal "Last updated June 24, 2026."
- **Impact:** Stale rates/dates on lending pages read as neglected and heighten "current rate" accuracy risk.
- **Recommendation:** Refresh cadence + automated "as-of" stamping; move past-due review dates forward.

#### M10. Unsubstantiated corporate facts on About presented as fact (no disclaimer)
- **Evidence:** Named executives incl. `Sara López, Head of Compliance` and `Hannah Park, Compliance Counsel` (`AboutPage.tsx:6-15`); "Founded by **Dave Feldman and Priya Rao**" (`:154-156`) stated as fact; named VC backers "Greylock Bridge," "First Round West," "Mistral Capital," etc. (`:744-751`) that echo real firms (Greylock, First Round). Unlike the case-studies page, there is **no** "illustrative" disclaimer.
- **Impact:** If invented, these are misrepresentations of company/leadership/funding — worse because a fake "Head of Compliance" sits on a regulated-lending About page.
- **Recommendation:** Use only real team/investor identities, or remove. Do not fabricate a compliance officer.

#### M11. Residual broker-audience framing in body copy
- **Evidence:** `AboutPage.tsx:341` "Brokers, investors and the borrowers they serve"; `ProductsPage.tsx:493-494` "**Brokers** typically use three tools. Investors use five," `:643` "first-time investor or **broker**"; `BrokersPage.tsx:474` "Ready to **place your next file**?" (broker term); `InvestorsPage.tsx:12` "Most **brokers** only quote Track 1."
- **Impact:** Undercuts the direct-to-investor repositioning; mixed audience signals.
- **Recommendation:** Scrub broker-audience second person from investor-facing copy.

#### M12. Stale/mis-mapped nav & footer links to `/brokers`
- **Evidence:** `PageShell.tsx:270` footer "Real Estate Investors" → `href="/brokers"` / `onNavigate("brokers")`; `:273` "Private Funds" → `investors`. `index.html:714,792,870` nav dropdown "**Blog**" link → `href="/brokers"`; `index.html:1048-1064` audience items "Real Estate Investors / STR & Airbnb Hosts / Foreign Nationals" all → `href="/brokers"`. Routes `/brokers` and `/partners` still live (`router/resolve.ts:9-10,48-51,76`, `App.tsx:341-344`), and `BrokersPage`/`BrokersPortalPage` still ship.
- **Impact:** Broken IA + repositioning residue; a "Blog" link that lands on the ex-broker page.
- **Recommendation:** Repoint or retire `/brokers`+`/partners`; fix the `index.html` dropdown targets.

#### M13. Backend narrate prompt still broker-framed (reaches users)
- **Evidence:** `src/routes/narrate.ts:40` prompt "DSCR underwriting result **for a broker to explain to a borrower**"; `:44` "Track 1 (**lender qual**)"; `:54` system "Write plain, honest, **broker-to-client** language." Output is shown to the end user as the deal narrative.
- **Impact:** The AI-generated, user-visible explanation is written from a broker→client stance that contradicts "we are the lender/direct to investor."
- **Recommendation:** Reword to lender-to-investor voice; drop "broker."

#### M14. `your-firebase-app` placeholder shipped in server config
- **Evidence:** `src/serverApp.ts:16` CORS fallback allowlist includes `"https://your-firebase-app.web.app"`.
- **Impact:** Placeholder shipped to production config (the exact "your-firebase-app" pattern flagged in scope). Config hygiene / potential CORS misconfig.
- **Recommendation:** Replace with the real origin(s) via env config.

### LOW

#### L15. Cross-page numeric inconsistencies (mostly disclaimed)
- Blanket line capacity "**$18M**" (`CaseStudiesPage.tsx:103` Aurora) vs "**$25M**" (`SolutionsPage.tsx:69,79`, `BrokersPage.tsx:216`). Rate ranges differ: FAQ "6.50–7.00% strong / 6.85–7.50% typical" (`FAQPage.tsx:40`) vs BorrowerProfiles per-program "6.75–7.25% / 7.50–8.25% / 7.10–7.75%" (`:363,438,535`). Both rate sets are disclaimed "not a commitment to lend," which mitigates.
- **Recommendation:** Single source for headline figures.

#### L16. FAQ "src" citations expose internal source-code filenames
- **Evidence:** `FAQPage.tsx` cites "Greenstreet **engine.ts** DSCR calc" (`:22`), "**reserveEngine.ts**" (`:73`), "**refiTracker.ts**" (`:168`), "**taxEngine.ts**" (`:182`), "**engine.ts** · dealBreakRate + rateHeadroomBps" (`:105`) as if authoritative sources.
- **Impact:** Weak E-E-A-T / leaks implementation detail; not a legal issue.
- **Recommendation:** Cite external authorities or generic "Greenstreet underwriting model," not filenames.

#### L17. Same page carries three names ("Our DSCR Programs" / "Program Intelligence" / "Lender Intel")
- **Evidence:** Footer/nav label "Our DSCR Programs" (`PageShell.tsx:257`, `SiteShell.tsx:28`) vs `ProductsPage.tsx:55` title "Program Intelligence" with `panelTag`/navLink still "**Lender Intel**" (`:62,434`) — residue of the "Lender Intelligence → Our DSCR Programs" rename.
- **Recommendation:** One label site-wide.

#### L18. Dead/duplicated footer config
- **Evidence:** `PageShell.tsx:16-52` `FOOTER`/`NAV` consts are unused (component renders hardcoded footer); the const also duplicates "Real Estate Investors" twice (`:29-31`). Cosmetic, but indicates unreviewed copy.
- **Recommendation:** Delete dead config.

#### L19. Accessibility / trust — generally OK, with the fabrication caveat
- **Evidence:** Case-study logos have `alt` text (`CaseStudiesPage.tsx:288,446`); decorative SVGs use `aria-hidden`; footers have SR headings. Copyright present and correct: "© 2026 Greenstreet Finance. All rights reserved." (`PageShell.tsx:310`, `SiteShell.tsx:334`). The trust gap is the fabricated logos/testimonials (C4), not alt text.
- **Recommendation:** Keep alt-text discipline; fix the substance (C4) and physical-address/EHL (C1).

---

## Answers to the two required questions
- **(a) Are required lender disclosures MISSING?** **Yes — comprehensively.** No NMLS ID, no state licensing statement, no Equal Housing Lender logo/text, no ECOA/fair-lending notice, and no physical address anywhere user-facing or in `index.html`, despite repeated "direct lender / fund in-house" claims. Present: Privacy Policy, Terms of Service, and "not a commitment to lend / subject to underwriting" disclaimers.
- **(b) Do any case studies / claims look FABRICATED?** **Yes.** InvestGO-portal testimonials (`BrokersPortalPage.tsx:40-59`) are named endorsers with hard stats and **no disclaimer**. Case studies (`CaseStudiesPage.tsx`) are self-labeled "illustrative composite … not verified named customers," but ship **real company logo images** for those non-existent companies, undercutting the disclaimer. Separately, About-page executives/backers are presented as fact with no disclaimer (M10), and "19 programs" (H7) is an unsubstantiated count.

**Total findings: 19** (4 Critical, 4 High, 6 Medium, 5 Low).
