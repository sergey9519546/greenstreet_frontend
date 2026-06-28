# Greenstreet — Visual Design Weaknesses (look / layout)

_2026-06-27 · critical pass on the live rendered pages: marketing home (3 sections), DSCR tool, InvestGO workspace. Ranked by visual impact._

## The one diagnosis
The product has good typography and an ambitious data-viz language, but it reads **flat and monotone** — especially the dark surfaces — and the **marketing front door looks generic** next to the engineered app. The single highest-leverage fix is an **elevation/surface system**; the second is making the marketing feel as bespoke as the tools.

---

### 🔴 W1 · Flat cards, no elevation — the #1 weakness (everywhere, worst on the dark app)
Dark cards sit on the dark ground with **hairline `0.1` borders, near-identical `0.05` fills, no shadow, no highlight** → panels barely separate; the page reads as one dark wash. Worst on the **InvestGO workspace**: the 4 KPI cards (Active Deals / Avg DSCR / Pipeline Vol / Flagged) are almost invisible as cards. Same on every tool result card + input panel.
- **Fix:** a real **elevation language** — raise card fills to a defined surface (`swatch.darkTeal` on the `midnight` ground, not 5%-cream), border `0.14–0.18`, add a top inner-highlight (`inset 0 1px 0 rgba(238,239,211,0.06)`) + a soft drop shadow for "raised" cards. The `Card` primitive I built already encodes this (`tone` + readable border) — **migrate pages onto it.** This one change lifts every screen.

### 🔴 W2 · Marketing home looks generic / stock — undersells a quant platform
- Hero photo = a **stock "two men talking outside a building"** → reads as a generic mortgage broker, not a premium engine. (The earlier architectural/atrium frame was stronger.)
- A **composite testimonial** ("David Chen, Hadley Capital" + stock headshot, captioned "Composite, based on real broker data") reads as fabricated and *undermines* trust more than it builds it.
- **Fake/illustrative client logos** (Cypress, Atlas Wealth, Heritage…) — generic.
- **Fix:** lead with a bespoke hero (an abstract of the actual engine — the gauge/flight-path/heatmap language), drop or honestly reframe the composite testimonial, and either earn or clearly label the logo wall.

### 🟠 W3 · Color-world whiplash + the dual-shell seam
Backgrounds jump **cream (hero/logos) → bright mint-green (how-it-works) → dark teal (tools)** with hard edges. Marketing and app feel like **two different products**.
- **Fix:** cut the number of background worlds; design intentional transitions; carry shared motifs (JetBrains-Mono numerals, the dot-grid, the lemon accent, the gauge kit) across the seam so entering a tool feels like going *deeper*, not switching apps.

### 🟠 W4 · Lemon is overloaded → the CTA stops shouting
Lemon is the **primary button AND eyebrows AND active tab AND brand dot AND highlights**. When the click-color is also decoration, the call-to-action loses force. Plus an outright inconsistency: the home "Learn more" button is **cream**, not lemon.
- **Fix:** reserve lemon for **primary action only**; move eyebrows/highlights to cream/emerald; make every primary CTA lemon (no cream buttons).

### 🟠 W5 · The hero "payoff" numbers are too dim
The biggest figure on a tool (e.g. DSCR `1.05x` inside the gauge) is **faint cream-on-dark** — the one number that should be the brightest thing on screen is muted.
- **Fix:** push the headline metric to full cream/white (or a saturated verdict color), and let everything else recede.

### 🟡 W6 · Sparse / empty zones
- InvestGO workspace: content fills ~the top half; the **bottom half is empty dark space**.
- A stat reads as broken data: **"+$0.0M MTD"**.
- **Fix:** rebalance the dashboard (second row: recent activity / a chart / quick actions), and hide zero-value sublabels instead of showing `$0.0M`.

### 🟡 W7 · Redundant / formulaic elements
- **Two identical "+ New deal"** CTAs in the workspace (sidebar + header).
- The **left-copy · right-artifact · 3-stat-row** hero skeleton repeats across ~13 tools → becomes wallpaper (RateQuiz/ARM already break it — extend that).
- The long, mid-phrase-wrapping home **H1** ("…— non-US investors qualify, and / so do Airbnb…").

### 🟡 W8 · Small polish
- Nav "Login" is **underlined** while sibling links aren't.
- Text-over-photo contrast on the hero is **inconsistent** (H1's lower lines drift over the lighter wall) — needs a stronger scrim/gradient.

---

## Ranked fix order
1. **W1 elevation/surface system** — migrate to the `Card` primitive + add the shadow/highlight tokens. Biggest visible lift, touches every page.
2. **W4 + W5** — un-overload lemon (action-only) and brighten the hero metric. Cheap, high-impact.
3. **W2** — rework the marketing hero + testimonial + logos.
4. **W3** — collapse the background worlds / bridge the seam.
5. **W6/W7/W8** — dashboard rebalance, dedupe CTAs, hero-pattern variety, the polish nits.

> Pairs with `DESIGN_LOGIC_AUDIT.md` (the *systemic* sprawl — type ramp / spacing / letter-spacing) and `DESIGN_QA_ULTRAPLAN.md` (defects, now largely fixed). This file is the *look & feel* layer.
