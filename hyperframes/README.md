# Case-study animations (HyperFrames)

Editable **source** for the 4 looping motion graphics on `/case-studies`. Each
is an authored HyperFrames composition (HTML + a paused GSAP timeline) that
renders deterministically to MP4. These `.html` files are the source of truth;
the shipped clips live at `public/video/scenes/cs-*.mp4` (+ `-poster.jpg`).

| Source | Ships as | Story it animates |
|--------|----------|-------------------|
| `cs-northshore.html` | `cs-northshore.mp4` | One file, two DSCRs — Track 1 gauge **1.18x PASS** → a "12% VACANCY" crack opens → Track 2 gauge **0.98x STOP** → lemon magnifier on the crack → **CAUGHT** |
| `cs-vela.html` | `cs-vela.mp4` | Velocity engine — cream files feed in, exit emerald, fan to **four lanes out**; lemon stopwatch counts **25:00 → 06:00**; **4×** badge |
| `cs-quintero.html` | `cs-quintero.mp4` | Appraisal toll — 3 folder-characters turned away by the gate + coral ✗; lemon **$0 → $14,800** counter → passport → emerald **APPROVED** |
| `cs-aurora.html` | `cs-aurora.mp4` | 40 house icons emanate center-out into one ledger grid → blended-DSCR meter settles **1.11x** → **$18M** ribbon + emerald seal |

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

## Edit + re-render

A reusable HyperFrames project lives at the repo-root `hf_build/cs-northshore/`
(gitignored). To change a clip:

```bash
cp greenstreet_frontend/hyperframes/cs-<name>.html hf_build/cs-northshore/index.html
# edit hf_build/cs-northshore/index.html (or the saved source, then re-copy)
cd hf_build/cs-northshore
npx hyperframes lint .
npx hyperframes render . --skill=motion-graphics -q draft -o ./renders/out.mp4
# then copy the render + a poster frame into public/video/scenes/, and save the
# edited HTML back to greenstreet_frontend/hyperframes/cs-<name>.html
```

Renders are deterministic — the same source always produces the same bytes
(verified: `cs-northshore.html` → 650,590-byte MP4, matching the shipped clip).
The panels (`CaseStudiesPage.tsx`) load these as muted autoplay loops at **16:9**
with the poster as the `prefers-reduced-motion` fallback.
