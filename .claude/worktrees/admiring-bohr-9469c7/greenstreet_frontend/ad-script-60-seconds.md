# Greenstreet Finance — Explainer Video Ad Script

**Working title:** "60 Seconds"
**Format:** Hero video ad (paid social + landing-page hero)
**Runtime:** Master :90–:105 / Editable down to :30 / :15
**Voice:** Founder-led, plainspoken, technical. No sales pitch. No "Hi, I'm…" opener. Earned the room.
**Audience:** Brokers and small/mid investors evaluating DSCR tools. Scroll-stoppers, not tire-kickers.

---

## Why this structure

The 8 existing explainers (DSCR / Deal / Lender / Stress / Monte Carlo / Returns / Tax / State Laws) are *mechanics* — they show how each tool works. A paid-video ad needs three things those mechanics don't supply:

1. **A HOOK** — the pain that earns the viewer 8 seconds of attention
2. **An OUTCOME** — what the viewer's day looks like after they use Greenstreet
3. **A CTA close** — branded end card with one clear next step

This script brackets the existing reel between those three. Net runtime: **~1:45** with current clip lengths.

---

## Master script — "60 Seconds"

### SCENE 1 — HOOK (0:00–0:08) — *[needs hyperframes — does not exist]*

> **On-screen text (frame 1):** "It shouldn't take 11pm."
> **Visual:** Tight on a broker's laptop screen at night. A spreadsheet. A cursor blinking over a wrong DSCR figure. Pull back slowly to reveal the desk is the only thing lit in a dark office. Coffee cup is empty. Phone screen shows 3 missed calls from "Sarah — Borrower."
> **Audio:** No music. The sound of a clock ticking. A keystroke. The cursor's beep.

**Why this lands:** Every broker has lived this. The scene names the pain without lecturing about it. Earns attention in the first 3 seconds.

---

### SCENE 2 — TENSION (0:08–0:18) — *[reuse first 9s of existing `dscr-explainer.mp4`, then cut at 0:18]*

> **On-screen text:** "Lenders change rules. State PPPs vary. Spreadsheets rot."
> **Visual:** Hard cut into the dscr-explainer motion graphic. Stop on the calculator panel.
> **Audio:** Sub-bass pulse begins under the existing motion-graphic BGM.

**Why this works:** Tells the viewer *why* it's hard without enumerating features. Existing motion-graphic pacing carries the energy forward.

---

### SCENE 3 — SOLUTION (0:18–0:28) — *[existing dscr-explainer, second half]*

> **On-screen text:** "Greenstreet. The DSCR engine built by a broker and a quant."
> **Visual:** Existing explainer resolves on the calculator result.
> **Audio:** BGM lifts.

**Why this works:** The About page line — "founded by a broker and a quant who set out to build DSCR software so good that pricing a rental loan any other way would feel like negligence" — distilled to 10 words. Founder credibility in one line.

---

### SCENE 4 — PROOF REEL (0:28–1:30) — *[use 7 of the 8 existing explainers, 8–9s each = ~62s, light cross-dissolves]*

Reel order (narrative, not alphabetical):

| Clip | Time | On-screen caption |
|------|------|-------------------|
| `dscr-explainer` | 9s | "60-second pricing." |
| `deal-explainer` | 9s | "Defensible numbers." |
| `lender-explainer` | 9s | "19 lender programs." |
| `stress-explainer` | 9s | "120-cell stress matrix." |
| `montecarlo-explainer` | 9s | "500 rate-path simulations." |
| `returns-explainer` | 9s | "After-tax IRR." |
| `tax-explainer` | 9s | "§469 handled." |

> **Why these 7 (skip state-laws for the ad):** state-laws is regulatory and reads as compliance-deck in a paid social context. The seven above show *what the broker gets done with the tool*. Save state-laws for the in-product explainer.

> **Visual:** Cross-dissolve between clips. No new motion graphics. Reuse the explainer-reel file with a light re-edit.
> **Audio:** Single BGM bed under all clips. Subtle tick on each cross-dissolve.
> **On-screen text (top-left, persistent):** "greenstreet.finance"

---

### SCENE 5 — OUTCOME (1:30–1:42) — *[needs hyperframes — does not exist]*

> **On-screen text:** "Close before lunch."
> **Visual:** Daylight. Same broker from the hook — but at her desk, mid-morning. The deal is priced on screen. A coffee, full. She's smiling on a phone call. Pull out to a wider shot: she's at a kitchen table, not a late-night office.
> **Audio:** Music resolves. Soft tick of a clean notebook closing.

**Why this matters:** The mirror of scene 1. Same person, different time of day. The product's promise isn't a feature, it's the day back.

---

### SCENE 6 — CTA (1:42–1:55) — *[needs hyperframes — does not exist]*

> **On-screen text (frame 1):** "Greenstreet Finance"
> **On-screen text (frame 2):** "Price any DSCR deal in 60 seconds."
> **On-screen text (frame 3, two-button):**
> `[ Open the calculator → ]` &nbsp;&nbsp; ` [ Book a 15-min demo → ]`
> **Visual:** Brand card. Cream background (#eeefd3), dark teal wordmark (#003738), lemon accent (#d8d958) for the buttons. Logo animation 0.5s in. Last 2 seconds hold on the URL only.
> **Audio:** Music resolves. Logo "stamp" sound at 1:42.

---

## Cut-downs (derived from the master)

| Cut | Drop | Runtime | Use case |
|-----|------|---------|----------|
| **:15 pre-roll** | Scenes 4 + 5 | 15s | YouTube pre-roll, paid social |
| **:30 LinkedIn** | Hook + 4 reel clips + CTA | 30s | B2B LinkedIn in-feed |
| **:60 landing hero** | Hook + Solution + 4 reel clips + CTA | 60s | Website hero replacement |
| **:90 paid social** | All scenes, fade early on proof reel | 90s | Facebook/Instagram in-feed |

---

## Production notes

### What already exists
- 8 explainer videos in `public/video/` (9s each, 1920×1080, no audio)
- The explainer-reel I stitched earlier (`greenstreet_frontend/explainer-reel.mp4`, 72.5s)
- Brand palette and Outfit font from `src/design/dc.tsx`
- Voice tone documented in About page

### What needs to be generated (3 pieces, all hyperframes)
1. **Scene 1 — Hook** (8s, dark office, broker at night, clock, missed calls)
2. **Scene 5 — Outcome** (12s, daylight, same broker, priced deal, full coffee, smiling)
3. **Scene 6 — CTA** (13s, brand card, two-button close)

### What needs human
- Voiceover (if used — script works without, motion graphics carry it)
- Music bed (royalty-free or commissioned)
- Final color grade to match existing explainer palette exactly (dark teal #003738 / cream #eeefd3 / lemon #d8d958 / mint #e8e9bf / rainforest #006565)

### Voice-over optional
The script is written as on-screen text first. If you add VO, use a single male or female voice — founder tone, not announcer. Record in the 9:00am register, not the 9:00pm register. Let the visuals do the heavy lifting; VO is punctuation, not narration.

---

## Anti-patterns to avoid

- **Don't open with the logo.** Logos first lose attention.
- **Don't enumerate features.** "19 lenders, 50 states, 0 income docs" is brochure copy, not ad copy. Show, don't tell.
- **Don't use "revolutionary" / "game-changing" / "disrupt."** The brand voice explicitly avoids this register.
- **Don't use generic stock footage of "happy brokers."** Scenes 1 and 5 should look like the same person in the same apartment — different time of day.
- **Don't use AI-generated human faces for the hook/outcome.** Brand rule: no uncanny valley in marketing surfaces.

---

## Provenance

Every claim on screen is grounded in the site:

- **"Built by a broker and a quant"** — AboutPage hero (`Dave Feldman and Priya Rao, founded by a broker and a quant`)
- **"60-second pricing"** — SolutionsPage Brokers stat (`<60s to a priced deal`)
- **"19 lender programs"** — SolutionsPage Brokers stat
- **"120-cell stress matrix" / "500 rate-path simulations" / "after-tax IRR" / "§469 handled"** — SolutionsPage Investors stat panel
- **"Materially better real-estate lending"** — AboutPage vision
- **"No LLM in math"** — AboutPage commitment ("never an LLM guess")

When the ad ships, every on-screen claim must trace to a page on the site. That's the brand's promise applied to itself.

---

*Generated 2026-06-25. Hand off the 3 hyperframes assets to the in-house producer or another agent for render.*