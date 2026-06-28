# Case-study animations (HyperFrames)

The 4 looping motion graphics on `/case-studies`. Each is an authored HyperFrames
composition (HTML + a paused GSAP timeline). **They run LIVE in the page** —
`CaseStudiesPage` embeds each `.html` in a sandboxed `<iframe srcDoc>` and plays
the composition's timeline (`window.__timelines.main`) on an infinite loop. They
are **not** baked into `.mp4`. The only other shipped asset is a poster frame
(`cs-*-poster.jpg`) used as the `prefers-reduced-motion` / loading fallback.

| Source | Scene id | Story it animates |
|--------|----------|-------------------|
| `cs-northshore.html` | `northshore` | One file, two DSCRs — Track 1 gauge **1.18x PASS** → a "12% VACANCY" crack opens → Track 2 gauge **0.98x STOP** → lemon magnifier on the crack → **CAUGHT** |
| `cs-vela.html` | `vela` | Velocity engine — cream files feed in, exit emerald, fan to **four lanes out**; lemon stopwatch counts **25:00 → 06:00**; **4×** badge |
| `cs-quintero.html` | `quintero` | Appraisal toll — 3 folder-characters turned away by the gate + coral ✗; lemon **$0 → $14,800** counter → passport → emerald **APPROVED** |
| `cs-aurora.html` | `aurora` | 40 house icons emanate center-out into one ledger grid → blended-DSCR meter settles **1.11x** → **$18M** ribbon + emerald seal |

> The scene id is the `scene:` field on each study in `CaseStudiesPage.tsx`
> (`SCENE_HTML[scene]` → the imported composition). To make these play live the
> page only adds a tiny shim to the composition: responsive `html/body/svg` + a
> `tl.repeat(-1).play(0)`. Everything else is the authored HTML unchanged.

> About / Careers bands use **photographic** scenes (`ScenePhoto`), not animation —
> motion clashed with those editorial pages. No animation source for them.

## Craft system (what makes these read high-end, not flat)

Shared across all four:
- **Depth** — gradient surfaces (`cream` / `lemonG` / `emerG` / `coralG` / `machine`),
  top inner highlights, soft *layered* drop shadows (`#drop` / `#dropS`), a radial
  `#vign` vignette ground.
- **Light** — emerald/lemon/coral **bloom** via `feGaussianBlur` glow filters
  (`#glowE` / `#glowL` / `#glowC`); the magnifier is a `#lens` radial gradient.
- **Texture** — a `feTurbulence` film-grain overlay at ~4.5% (`mix-blend-mode: overlay`).
- **Type** — real brand fonts loaded from Google Fonts (Outfit + JetBrains Mono,
  tabular figures via `font-variant-numeric`).
- **Motion** — ease everything; **overshoot-and-settle** (`back.out`); **secondary
  motion** (lagging shadows, rebound bobs); **center-emanating staggers**; **arc**
  entrances; **parallax** dot-field drift (`#par`). 16:9, ~5s, seamless-loop reset.

Palette: midnight `#003738`/`#00302e`/`#012220` grounds · cream `#eeefd3` · lemon
`#d8d958` (the one live/active accent) · emerald `#4dbd97` (pass) · coral `#e0635f`
(stop).

## Edit

The composition runs live, so just edit the `.html` in place — `npm run dev`
hot-reloads `/case-studies` and the iframe replays the timeline. **No render
step is needed for the site.** Keep the HyperFrames contract intact: a single
paused timeline registered on `window.__timelines["main"]`, deterministic
(no `Date.now()` / `Math.random()`), `class="clip"` on timed elements.

If you ever want a standalone `.mp4` (e.g. for social / an email), render it with
the HyperFrames CLI — but the site does **not** consume it:

```bash
cd greenstreet_frontend/hyperframes
npx hyperframes lint cs-<name>.html
npx hyperframes render cs-<name>.html --skill=motion-graphics -q draft -o ./out.mp4
```

To refresh a poster (the reduced-motion fallback), grab a representative frame and
save it to `public/video/scenes/cs-<name>-poster.jpg`.
