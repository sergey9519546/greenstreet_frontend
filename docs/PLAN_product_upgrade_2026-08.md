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

## Definition of done

`tsc` 0 · full suite green · production build succeeds · browser-verified where the change
is visible · home contract still verifying · each change committed separately with its
reasoning.
