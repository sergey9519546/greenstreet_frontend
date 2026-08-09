# Design source of truth — the homepage

The homepage (`index.html`, the Webflow marketing shell) is the canonical visual
language. Every app page must read as the same product. These values were
**measured from the rendered homepage** at a ~1280px viewport on 2026-08-08, not
designed from scratch — where an app page disagrees with this table, the app page
is wrong.

---

## 1. Type — Outfit Variable, everywhere

| Role | Size | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|
| Display (band headline) | 75px | **600** | **1.00** | −0.02em |
| H1 (hero) | 57px | **600** | **1.04** | −0.04em |
| H2 (section) | 44px | **600** | **1.10** | −0.02em |
| Lead paragraph | 21px | **400** | 1.35 | −0.02em |
| H3 / card title | 18px | **600** | 1.20 | −0.02em |
| Body / small | 16px | **500** | 1.35 | −0.02em |

**The three rules the app breaks constantly:**

1. **Weight is 600 for every heading.** Never 700, never 800. Several app pages
   use `fontWeight: 800` — that is heavier than anything the homepage ships and
   it reads as a different brand.
2. **Line-height never goes below 1.00**, and only display type sits at 1.00.
   App pages use `lineHeight: 0.98`, which slices the tops of tall glyphs — this
   is the cause of the clipped `/vacation-homes` H1.
3. **Letter-spacing is −0.02em**, with −0.04em reserved for the hero H1 alone.
   App pages use −0.035em and −0.055em, tighter than the source, which crowds
   the display sizes and compounds the clipping.

---

## 2. Colour — a TWO-surface system

The homepage has exactly two surfaces:

| Surface | Background | Ink |
|---|---|---|
| Light | `#eeefd3` pistachio | `#003738` midnight |
| Dark | `#003738` midnight | `#eeefd3` pistachio |

That is the whole system. Accents (`#d8d958` lemon, `#4dbd97` emerald) are used
sparingly on top of either.

**The app invented a third and fourth surface** — `dc.teal #004041` and
`dc.mintBg #e8e9bf` — and uses them interchangeably with the real two. That is
the single biggest reason app pages don't look like the homepage. A band is
light or it is dark; there is no in-between tint.

Consequence for tool pages: a tool page ships its own **`#003738`** section, not
`#004041`.

---

## 3. Layout

- Container `max-width: 1728px` (already `dc.maxW`), side padding ~20px.
- Section vertical padding **68–92px**. Use `clamp(56px, 7vh, 92px)`.
- Grids are **symmetric**. Equal columns. Never a lazy `auto 1fr` that leaves one
  column empty halfway down.

---

## 4. Depth — the homepage is flat

A full scan of the rendered homepage found **exactly one** element with a
`box-shadow`. The design is flat by intent:

- No `box-shadow` for elevation. Use a 1px border or a surface change instead.
- No `backdrop-filter`, no `blur()`, no glow.
- No floating or pulsing motion (`gsFloat` / `gsPulse` are already neutralised to
  no-ops in `dc.tsx` — do not reintroduce them).

Any soft shadow in the app is a divergence, not a style choice.

### Property imagery — no gradients

Property illustrations sit directly on one of the two canonical surfaces. Use a
transparent asset when available, or `mix-blend-mode: multiply` so the image's
paper background takes on the cream or green beneath it. Do not add atmospheric
gradients, gradient washes, gradient transitions, or fade an image into a new
surface. When the section changes from cream to green, use a clean hard band.

---

## 5. Risk colour ramp

One restrained ramp, used only to signal risk — never decoratively:

`dc.risk.danger` `#e06363` · `dc.risk.warning` `#e6b84d` · `dc.lemon` `#d8d958`
· `dc.emerald` `#4dbd97`

`#ff6b6b` and `#f97316` are **banned**. They were removed from `StateLawsPage`
on 2026-08-08; do not reintroduce them.

---

## 6. One primitive per job

The audit on 2026-08-08 found the same control implemented many times over, and
the copies had drifted apart:

| Primitive | Implementations found | Symptom |
|---|---|---|
| Slider | 6 | two instances shared one global CSS class, so the fill showed another slider's value |
| `dscrColor` | 3, different thresholds | DSCR 1.15 read "caution" on one surface and "pass" on another, simultaneously |
| Currency formatter | 11, three behaviours | `-$1,234` vs `$-1,234`; one had no locale, so it printed `$318.750` on a European browser |
| Input field | 10 hand-rolled vs 3 shared | inconsistent borders, focus rings and adornments |
| CTA card grid | 3 | the same block rendered 20px taller depending on the page |

**Rule: if a control exists in `src/design/` or `src/components/ui/`, use it.**
Do not restyle it inline. If it cannot do what a page needs, extend the shared
component — do not fork it.

---

## 7. How to check your work

Do not eyeball it. From the running dev server:

- Compare `scrollWidth` vs `clientWidth` (horizontal overflow) and `scrollHeight`
  vs `clientHeight` (vertical clipping) on every heading you touch.
- Check at **1280 / 768 / 375px**. Most overflow only appears narrow.
- Confirm no element renders ink on a background of the same colour — that class
  of bug shipped twice this session.
