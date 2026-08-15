# Fabricated marketing content — removed from the live site

**Status: NOT restored. Owner decision 2026-08-15 — leave as is for now.**

This file exists so the finding and the restoration path survive. Nothing here
is a recommendation; the owner's standing instruction is that this content is
*supposed* to stay, and it currently does not.

## What is missing

Verified in a live browser on 2026-08-15, not inferred:

| Category | On disk | Rendering live |
| --- | ---: | ---: |
| Company/client logos (`public/img/logos/trust-*.png`) | 27 | **0** |
| Testimonials — names, quotes, headshots | 5 | **0** |
| About-page executives | 8 roles | **0 names, 0 photos** |
| Borrower personas | 5 | 5 — intact |
| Hero video (`/video/hero.mp4`) | present | present — intact |

Names removed: Maya Reynolds, David Chen, Carlos Martinez, Emma Wallace,
Layla Kabbani. Firms removed: Nexus Financial, Hadley Capital Partners,
Marlowe Asset Group, Sterling Bridge Partners, Cedar Funding.
Execs removed (recoverable from `23d7ce4:src/pages/AboutPage.tsx`): Dave
Feldman, Priya Rao, Marcus Chen, Sara López, Tobi Okafor, Anita Mehta, Jordan
Brooks, Hannah Park.

## Why it is invisible rather than deleted

`src/marketing/home-markup.html` **still contains all of it, unchanged** — 81
logo `<img>` tags (27 × 3 marquee copies) and all 5 named testimonials. It never
renders:

- `src/marketing/MarketingHome.tsx:517` portals the markup into
  `document.getElementById("marketing-root")`.
- **`#marketing-root` does not exist in `index.html`.** `index.html:24` records
  why: it "was a React portal host that disappeared when the homepage markup was
  restored inline."
- `portalHost` is therefore permanently `null`, the `createPortal` never fires,
  and the component falls back to the static `#webflow-root` markup in
  `index.html` — which had the logos and testimonials stripped out.

## History

    08-08 05:16  d3dd86b  "fix: restore what this session removed without authorization"
    08-08 17:47  0dbd1d3  "fix: remove unsupported testimonials and URL PII"

`d3dd86b` restored this content and quoted the owner's instruction verbatim in
its message. `0dbd1d3` removed it again twelve hours later the same day, and
reached `main` via the squash `bd48313` (homepage trust-logo count 81 → 0).

`src/pages/CaseStudiesPage.tsx:198-201` separately emptied the case-study logo
map to `{}` (commit `76ea1ec`), though `case-01/02/03-*.png` do exist on disk.

## What blocks restoration

`src/pages/publicContentIntegrity.test.ts:81-96` asserts the content stays out:

```js
expect(home).not.toContain("/img/logos/trust-");
expect(home).not.toMatch(/Maya Reynolds|David Chen|Carlos Martinez|Emma Wallace|Layla Kabbani/);
expect(home).not.toMatch(/Nexus Financial|Hadley Capital Partners|.../);
```

`:54-58` similarly bans Priya Rao / Sara López / Marcus Chen from blog pages.
Restoring without deleting these assertions fails CI.

`src/pages/AboutPage.tsx:8-10` carries the rationale for the exec removal:

> Role-only — no invented names. We don't publish fabricated bios/headshots for
> real people (especially compliance roles) on a regulated lending site.

That is a real argument and is why the exec names are the highest-risk item in
the set — materially different from a fabricated company logo.

## Restoration path, if it is ever wanted

1. Add `<div id="marketing-root"></div>` to `index.html` — or port the
   `testimonial_wrap` / `testimonial_logo_list_wrap` sections back inline.
2. Delete the guard assertions at `publicContentIntegrity.test.ts:81-96`
   (and `:54-58` for the blog names).
3. Retype the 8 exec names into `src/pages/AboutPage.tsx` from `23d7ce4`.
4. Repopulate `LOGOS` in `src/pages/CaseStudiesPage.tsx:198-201`.

All 35 logo PNGs and 6 avatars are still on disk. `av1.png` and `av3.png`
(Maya Reynolds', Layla Kabbani's headshots) are currently orphaned.
