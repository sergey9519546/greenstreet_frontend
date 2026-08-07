# Tasks

> Single source of truth for active work. Updated via `/productivity:update`.

## 🔥 Today

- [ ] Lemon-lime on inline primary CTAs (currently rainforest teal) `#website`

## 📋 Active

- [ ] Wire remaining engine calculators into marketing pages `#website` #engine
- [ ] Remove dead `brokers-partner` view (unreachable; /partnerships → portal by design) `#website`

## ✅ Done (this session 2026-06-26)

- [x] Golden-vector parity test for src/engine — `src/engine/golden.test.ts` wires `verifyGoldenValues()` into CI (11 vectors locked) `#engine` #test
- [x] Close `/tools/*` reverse-route gap — verified resolveRoute parses every canonical `/tools/*` path; locked by `src/router/resolve.test.ts` (canonical round-trips + intentional aliases) `#website`
- [x] Duplicate "LONE STAR" logos — only one variant (`lone-star-capital-partners.png`) remains; 3× is marquee-loop duplication, not multi-variant `#website`
- [x] Off-theme trust-band logos — no wealth-mgmt brand strings (Betterment/Kroll/Harbert/…) remain in index.html `#website`
- [x] Rebuild graphify graph (3930 nodes / 4580 edges) `#infra`

## ⏳ Waiting

-

## ✅ Done

- [x] Fix home page lost look (CDN CSS 403 — greenboard→greenstreet asset rename) `#website`
- [x] Greenstreet Finance logo (SVG mark + wordmark, dark/light variants) in nav+footer `#website`
- [x] Rebuilt "How It Works" animation (scroll-fill rail + entrance reveal + active lift) `#website`
- [x] Blue animated "How It Works" band on all inner pages (IO scroll reveal) `#website`
- [x] Build router + page nav buttons (history-API SPA, 26+ routed pages) `#website`
- [x] Fix skinny layout (full-width PageShell padding) `#website`
- [x] Rewrite Greenstreet marketing copy → DSCR content `#website`
- [x] Light reskin all 26 inner pages (pistachio/midnight/mint tokens) `#website`
- [x] Global nav + footer in PageShell `#website`
- [x] Fix app-wide blank screen (monteCarloRatePath re-export) `#engine`
- [x] Replace LLM-math endpoints with deterministic engine (server.ts) `#engine`
- [x] Rebuild ComplianceDashboard with sensitivity/optimizer/state tabs `#website`
- [x] Verify engine APIs live (DSCR 1.16x, PITIA $2,771, 12 structures) #verify
- [x] Swap hero + stat-card copy to DSCR facts `#website`

---
_Tags: `#website` `#engine` `#infra` `#test` — `#verify` = needs verification_
