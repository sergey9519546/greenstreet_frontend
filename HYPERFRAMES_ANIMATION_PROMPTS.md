# Greenstreet — Hyperframes Animation Prompts

Animated replacements for the **non‑home** scene images currently placed on
Case Studies, About, and Careers. Home assets (hero video, trust logos) are out
of scope and stay as‑is.

Each prompt is built so the motion is **informative** — it animates the actual
lesson of the page (the DSCR mechanic / the case outcome), not a generic loop.
Writing a distinct animation per surface also resolves the one reused still
(`office-window-team` was on both the Vela case panel and the About band → now
they are two different animations: **Velocity Engine** vs **One Desk**).

---

## 0. Global style spec (applies to every clip)

**Aesthetic.** High‑end editorial motion graphics — premium fintech illustration
(reference: Stripe, Ramp, Linear, Pitch). Cartoony but *expensive*: clean flat
shapes with subtle 2.5D / isometric depth, soft long shadows, gentle gradients,
a faint paper‑grain texture. Confident and a little witty. Never childish, never
photoreal, never corporate clip‑art, never "stock."

**Palette — locked. No colors outside this set.**
| Role | Hex |
|------|-----|
| Ground / background gradient | `#003738` → `#004041` (midnight → dark teal) |
| Surfaces, paper, ink, characters | `#eeefd3` (cream) |
| THE accent — only the *live / active / answer* element | `#d8d958` (lemon‑lime) |
| Positive · pass · funded · approved | `#4dbd97` (emerald) |
| Negative · stop · risk · drained | `#e0635f` (soft coral) |
| Muted lines / secondary text | cream at 55–62% opacity |

Rule: **at most one lemon element on screen at a time** (scarcity = it reads as
"the point"). Emerald and coral may coexist (pass vs stop).

**Motion.** Weighty, intentional easing — cubic ease‑out with a slight back /
overshoot on key reveals (stamps, snaps, needles). Nothing idles randomly;
everything moves with purpose, then a gentle ambient "breathing" so the frame
never fully freezes. Subtle slow parallax push‑in or drift on a layered scene.

**In‑scene numbers / gauges** set in a geometric mono (JetBrains Mono vibe),
cream or the active accent. Keep literal text to short labels only — no
paragraphs.

**Loop.** Seamless, **5–6 s**.

**Delivery.** Per‑asset aspect ratio below, rendered at 2× display size.
Transparent alpha *or* the midnight‑teal ground baked in. WebM/MP4 + optional
Lottie. Provide a clean **poster frame** (the resolved end‑state) for
`prefers-reduced-motion` / first paint.

**Avoid.** Real‑firm logos, photoreal humans, flicker/jitter, >2 active accent
colors, gratuitous particles, anything that reads as a screensaver.

**Composition note for the 4:3 case panels.** The UI composites the big mono
index number (top‑left) and the client wordmark (bottom‑left) over a teal
gradient. **Keep the lower‑left quadrant calm / darker** and push the focal
action to upper / center‑right.

---

## CASE STUDIES (4:3, seamless loop)

### 1 — Vela Capital · "Velocity Engine"  *(case 01 — replaces `office-window-team`)*
**Lesson:** 25 min per file → 6 min. 4× throughput, same team. Stopped running
parallel Excel models.

**Prompt:** Isometric cream "Greenstreet engine" on the midnight ground. Paper
deal‑files (cream cards, each a tiny DSCR bar) ride a conveyor *into* the engine
and exit the far side stamped emerald **"PRICED"**, then fan out into **four
parallel lanes** (the 4×). A mono stopwatch in the upper‑right sweeps **25:00 →
06:00** with a lemon hand. Two redundant "Excel" spreadsheet ghosts at the side
crumble to dust (the parallel models, killed).
*Beats —* 0–1.0s camera eases in, one file slides on (lemon active glow). 1.0–2.5s
file enters, gears turn, emerald PRICED stamp, stopwatch starts dropping.
2.5–4.0s output fans into 4 lanes, the stack multiplies ×4, the Excel ghosts
crumble. 4.0–5.5s stopwatch lands on **06:00** (single lemon flash), throughput
meter fills; ambient gear idle; loop.
*Accent —* lemon only on the active file + stopwatch hand; emerald on PRICED.

### 2 — Northshore Non‑QM · "Track 2 Catches It"  *(case 02 — replaces `desk-green-data`)*
**Lesson:** A deal passes Track 1 at 1.18x, but Track 2 catches a 12% vacancy
gap and kills it before appraisal.

**Prompt:** A cartoon house on a two‑pan balance — Pan A stacked rent coins,
Pan B the loan payment. A **TRACK 1** gauge needle swings up to **1.18x** and
flips an emerald ✓ **"FUNDS."** Beat of false confidence — then a jagged crack
labeled **"12% VACANCY"** opens beneath the house and coins drain out; the
**TRACK 2** needle sags below the **1.00** line into coral; a coral **STOP**
stamp slams. A magnifying glass (lemon rim) snaps onto the crack — *caught here.*
*Beats —* 0–1.2s house + balance settle, Track 1 rises to 1.18x → emerald ✓.
1.2–2.6s complacent hold, crack opens, coins trickle out. 2.6–4.2s Track 2 needle
drops under 1.00 → coral, lemon‑rim magnifier snaps to the crack. 4.2–5.6s coral
STOP stamp, hold; loop.
*Accent —* emerald (Track 1), coral (Track 2 + stop), lemon only the magnifier rim.

### 3 — Quintero & Co. · "Stopped Before the Toll"  *(case 03 — replaces `broker-building-dusk`)*
**Lesson:** 3 marginal deals killed pre‑appraisal = $14,800 saved. Plus an ITIN
/ Global file approved in 3 minutes.

**Prompt:** A path leads to an **"APPRAISAL"** toll booth that charges $3–7k. Three
little deal‑characters (cream folders with faces) walk toward it; a Greenstreet
gate arm (emerald) drops and a soft **coral ✗** turns the three bad ones away
*before* they pay — the coins they didn't spend pile into a lemon counter ticking
up to **$14,800**. Side vignette: a passport drops into a slot, a **03:00** timer
spins, emerald **"APPROVED"** pops.
*Beats —* 0–1.5s three folder‑characters approach, toll meter reads "$3–7k each."
1.5–3.0s gate arm drops, coral ✗ turns each away, savings counter spins. 3.0–4.5s
counter lands **$14,800** (lemon flash); cut to passport slot. 4.5–6.0s passport
in → 03:00 → emerald APPROVED; loop.
*Accent —* lemon on the savings counter, emerald on gate + approved, coral on the ✗.

### 4 — Aurora · "Forty Doors, One View"  *(case 04 — replaces `residential-townhomes`)*
**Lesson:** 40 scattered properties consolidate into one blended view → blanket
line, **$18M** approved, blended **1.11x**.

**Prompt:** 40 tiny cartoon house icons float scattered on the ground, each
blinking its own little solo DSCR bar (fragmented, busy). On a beat they
magnetically swoop and **snap into a single tidy cream ledger grid** (the blended
view); their bars merge into one blended‑DSCR meter that rises and settles on
**1.11x**, just over the 1.00 line (emerald). A long credit‑line ribbon unrolls
stamping **"BLANKET LINE — $18M"** with an emerald **APPROVED** seal.
*Beats —* 0–1.4s 40 houses drift scattered, each blinking. 1.4–3.0s magnet pulls
them into one grid, bars merge into the blended meter rising to 1.11x. 3.0–4.6s
$18M ribbon unrolls, APPROVED seal thunks. 4.6–6.0s houses breathe; loop.
*Accent —* lemon only on the blended‑meter needle, emerald on approved.

---

## BRAND BANDS (≈3:2 / 16:9, seamless loop)

### 5 — About · "One Desk"  *(replaces `office-window-team` on About)*
**Lesson:** A broker and a quant at one desk. Price → structure → fund. No
handoffs, no marketplace.

**Prompt:** Two cartoon characters at **one** long cream desk on the midnight
ground — a broker (left, warm) and a quant (right, glasses, a small gauge
floating beside them). A single deal‑file enters at the left and glides across
the desk through three inline stations — **PRICE → STRUCTURE → FUND** — earning
an emerald ✓ at each, and exits the right as a glowing emerald **"FUNDED"**
packet. For contrast, a faint dashed "marketplace" path with hop‑gaps dissolves
away (no handoffs). Warm, human, premium.
*Beats —* 0–1.5s desk + characters settle, file drops in at left (lemon glow).
1.5–3.5s file slides through PRICE/STRUCTURE/FUND, emerald ✓ at each, characters
react. 3.5–5.0s exits as FUNDED packet, the dashed hand‑off path dissolves.
5.0–6.0s ambient idle (coffee steam, a blinking cursor); loop.
*Accent —* lemon on the moving file, emerald on the checks + funded.

### 6 — Careers · "Own the Engine"  *(replaces `two-person-meeting` on Careers)*
**Lesson:** Small team, high ownership — you touch the engine, not a backlog
ticket.

**Prompt:** A glowing cartoon **DSCR engine** core (cream + emerald, gentle
pulse) at center. Three or four small characters each plug **directly** into a
distinct module/gear — underwriting, state rules, pricing, UI — and turn it;
gears mesh and the core brightens. For contrast, a sad faded **"ticket backlog"**
queue off to one side dims and empties (you build the engine, you don't push
tickets). Energetic, inviting, ownership vibe.
*Beats —* 0–1.5s core idles, characters step up to their modules. 1.5–3.5s each
plugs in and turns a gear, gears mesh, core pulses brighter (one lemon spark at
the hub). 3.5–5.0s the side backlog queue fades to nothing, engine hums at full
glow. 5.0–6.0s ambient gear breathing; loop.
*Accent —* emerald engine, lemon only the hub spark.

---

## Wiring note (when assets land)

- Swap the panel `<img>` for `<video autoplay loop muted playsinline>` with the
  same `object-fit: cover`; keep the existing teal gradient overlay + number /
  wordmark composite on the case panels.
- `prefers-reduced-motion: reduce` → render the **poster frame** instead of the
  video (mirror the existing reduced‑motion discipline in `dc.tsx`).
- Source files: replace under `public/img/generated/scenes/` (or a new
  `public/video/scenes/`), then update the `image:` fields in
  `CaseStudiesPage.tsx` and the `src` props on the About / Careers `ScenePhoto`.
