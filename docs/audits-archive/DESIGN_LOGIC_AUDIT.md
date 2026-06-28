# Greenstreet Finance — Design-Logic Audit (senior UX/UI lens)

_2026-06-27 · measured across 7+ representative routes (computed styles harvested), plus composition review of all 35. This is the **craft & systems** audit — separate from the technical QA ultraplan._

## The one-line diagnosis
**Excellent taste applied page-by-page; no system enforcing it underneath.** Almost everything is styled with inline values, so the brand drifts: the *vocabulary* of the UI is enormous where it should be tight. Individual screens look good; the product doesn't feel *engineered* the way a $5B-ambition platform must.

### Measured proof of the sprawl
| Token | Distinct values in use | A real system | 
|---|---|---|
| Letter-spacing | **74** | 3–4 |
| Font-size | **39** | 6–10 |
| Gap / spacing | **30** | 6–8 |
| Border-radius | **15** | 3–4 |
| Text color | **37** | ~10 |
| Primary-CTA: weight **500/600/700**, radius **6/8/9**, 7 paddings, 6 heights | — | one Button |

The core **palette (6 brand colors)** and **weights (500/600/700)** are disciplined — the bones are good. Everything dimensional (type, space, radius, letter-spacing, opacity) is ad-hoc.

---

## 1 · Typography logic — 🔴 no ramp
- **39 sizes.** Body is smeared across 13/14/15/16/17 (five sizes doing one or two jobs) → muddy mid-hierarchy. Display sizes come straight from `clamp()` so they resolve to arbitrary px (42/44/46/48). Tiny text bottoms out at **9–10px** (illegible, fails a11y).
- **74 letter-spacing values** — every heading is hand-tuned (`-0.0Xem`) inline. No tokens.
- **Fix:** define a **modular ramp** (e.g. `11 · 13 · 15 · 18 · 22 · 30 · 44 · 64`, display via clamp but snapping to ramp anchors) and **3 letter-spacing tokens** (display `-0.03em`, body `normal`, eyebrow `+0.04em`). Floor: body ≥13, never <11. Enforce via `<Heading>`/`<Text>` components or CSS custom props — not inline.

## 2 · Spacing & rhythm — 🔴 8pt grid broken
- **30 gap values**, including 6/9/11/13/14px that break the rhythm; section paddings are independent `clamp()`s with no shared vertical-rhythm token.
- **Fix:** one spacing scale (`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`) as tokens; a single `--section-pad` token for the big vertical gaps so every section breathes the same.

## 3 · Color logic — palette ✅, application 🟠
- **Strong:** midnight/teal/dark-teal grounds, cream text, lemon/emerald/mint accents — a genuinely distinctive, ownable palette.
- **Problem A — opacity ladder untokenized:** secondary text uses `0.5 / 0.55 / 0.56 / 0.6` (near-duplicates) and fine print `0.28 / 0.4` (fails WCAG AA). 37 text colors is mostly this. **Fix:** 3 steps — `0.85` (dim primary), `0.62` (secondary, AA-safe), `0.5` (tertiary, large only).
- **Problem B — lemon is overloaded.** It's the **primary CTA** *and* eyebrows *and* highlights *and* the brand dot *and* the "caution" state in stress tools. When the click-color is also decoration, the call-to-action stops shouting. **Fix:** reserve lemon for **primary action only**; move highlights to cream/emerald and caution to a distinct amber.
- **Problem C — per-tool hero background** (teal / dark / mint / lemon) reads as randomness, not a system. **Fix:** either unify, or make it a *deliberate, legible* per-engine color-code and surface the key.

## 4 · Components — 🔴 no primitives
- Proven: the primary CTA is re-built inline everywhere (weight 500/600/700, radius 6/8/9, 7 paddings). The hero "Get my rate" button — your money button — is `6px` on Returns and `8px` elsewhere.
- Cards lean on `border: 1px rgba(cream,0.1)` — so faint the cards barely detach from the dark ground; everything is the same `0.05–0.06` fill → flat, samey.
- **Fix:** build the real primitives — **Button** (one spec + `primary/secondary/ghost` variants), **Card** (2–3 elevation treatments with readable separation), **Input/Slider**, **Stat**, **Eyebrow**, **GaugeFrame**. This single move collapses the 39/74/30/15 sprawl.

## 5 · Layout & composition — 🟠 monotony + weak separation
- **Hero pattern fatigue:** ~13 tool pages all run *left copy · right artifact card · 3-stat row*. It's a good pattern — used 13× it becomes wallpaper and the artifacts stop earning attention. **Vary the rhythm:** some full-bleed viz, some centered single-focus (ARM/RateQuiz already do — extend the idea), some reversed.
- **The "3-stat row" is a tic** — under nearly every artifact. Keep it where it adds; drop it where it's filler.
- **Density mismatch:** marketing is airy; tool result cards are cramped at 9–11px. You're trading readability for density. Loosen tool cards one notch.
- **Empty zones** (state-laws hero right half, portal login void) — covered in the QA ultraplan; they read as "unfinished" to a design eye.

## 6 · Identity — 🟠 two products in a trench coat
- The **marketing home** (cream, photographic, Webflow) and the **app/tools** (dark teal, SVG dashboards) feel like different products. The cream→dark handoff is abrupt with no connective tissue.
- **Fix:** carry shared motifs across the seam — the **dot-grid**, the **JetBrains-Mono numerals**, the **lemon accent**, the gauge language — so entering a tool feels like going deeper into *one* product, not jumping apps. Or design an explicit "entering the engine" transition.

## 7 · Visual hierarchy — ✅ where it counts
- The **big Mono result number** (DSCR/IRR/verdict) anchoring each tool is genuinely excellent — the payoff is unmistakable.
- Weak in the **mid-range**: too many similar 13–17px texts with unclear priority, and an **eyebrow over every section** (uppercase tracked label) so the device stops signaling. Use eyebrows ~half as often; let the H2 carry it.

## 8 · Data-viz — ✅ strength, 🟠 not yet a family
- Gauges, the country→US arc, the SOFR fan cone, the ARM step-chart, the stress heatmap, the new capital flight-path — a real differentiator; most fintechs ship bar charts.
- They're each **bespoke** (different stroke weights, label fonts, color rules). **Unify a charting kit**: shared axis/label type, stroke weights, the red→amber→emerald risk ramp, dot/endpoint conventions — so they're one visual family.

## 9 · UX / IA — 🟠 discovery & guidance
- **13 tools** is a lot of surface; they're buried in a mega-menu with no "which tool, when" guidance. Consider a **tool hub** / guided path (Check buying power → Stress it → Returns → Decision → Get rate).
- The funnel CTA ("Get my rate") is consistently present ✅ — good. But tools don't hand off to each other in a designed sequence.
- Nav is doing two jobs (marketing IA + app IA) — fine for now, but as the app grows, the app needs its own chrome (the InvestGO shell is the seed).

## 10 · Motion — ✅ disciplined
- Interaction-driven CountUp, reveal-on-view, the looping flight-path, reduced-motion-safe — restrained and purposeful. Opportunity: use motion to **guide the eye input→result** in the tools (a brief pulse/trace from the slider you moved to the number that changed).

---

## Fix plan (foundation-first)
**Phase 0 — the design system (highest leverage):** define tokens (type ramp, spacing scale, 3 letter-spacings, 4 radii, 3-step opacity ladder) and build the primitives (Button, Card, Input, Stat, Eyebrow). This one structured pass dissolves the 39/74/30/15/37 sprawl, fixes contrast, and makes the money-button consistent.
**Phase 1 — color & emphasis:** un-overload lemon (action-only); apply the opacity ladder; decide the per-engine hero-color system.
**Phase 2 — composition:** break hero-pattern monotony (3–4 layout archetypes, not 1); strengthen card separation; bridge the marketing↔app seam.
**Phase 3 — viz & IA:** unify the charting kit; add a tool hub / guided sequence; halve eyebrow usage.
**Phase 4 — polish:** min-font floor (≥11), tap-target ≥44 on mobile, the QA ultraplan's P0/P1 defects.

> Sequence with `DESIGN_QA_ULTRAPLAN.md` (the defect list). This file is the *systemic* layer; that file is the *bug* layer. Do Phase 0 here **before** the per-page polish there — otherwise you polish on sand.
