# ULTRAPLAN — DSCR Deal Desk v13.0
## Redesign for Simplicity, Power, and Competitive Dominance

**Author:** Super Z  
**Date:** June 18, 2026  
**Version target:** v13.0 (was v12.1)  
**Scope:** Engine strengthening + full UX/UI redesign

---

## 1. PROBLEM STATEMENT

### Current state (v12.1)
- **Engine:** 1,689 LOC, 38 modules, math is correct but presentation is dense
- **UI:** 968 LOC in single page.tsx, 460 LOC DealForm — works but feels like a spreadsheet
- **Audit findings:** All 124 prior findings addressed (P0/P1/P2/P3)
- **Feature set:** Comprehensive — waterfall, 1031, defeasance, sensitivity, break-even, etc.

### What's wrong
1. **Cognitive overload.** User opens page → sees 20+ sections in a vertical scroll. No hierarchy. Hard to find the answer: "Should I do this deal?"
2. **Engine answers buried.** The verdict (PROCEED/RESTRUCTURE/PASS) is at the top, but the *why* is scattered across 15 cards. User has to scroll 6 screens to find the binding constraint.
3. **Form is overwhelming.** 40+ inputs in 8 collapsible sections. No progressive disclosure. No "deal type" templates that pre-fill common scenarios.
4. **No story.** Numbers without narrative. A great underwriting tool tells a story: "Here's the deal → here's the verdict → here's why → here's what to change → here's your downside."
5. **Mobile is broken.** Sidebar + main column layout collapses awkwardly below 1024px.
6. **No comparison.** Can't compare two deals side-by-side. Can't see "what if I change rent to $3,200?"
7. **Print is ugly.** IC memo is a `<pre>` block of ASCII art. Not a real export.

### What competitors do (and where they fall short)
- **Banana® / New Silver DSCR calculators:** Simple, fast, but only compute DSCR. No investor track, no stress, no waterfall.
- **Lima One / Visio portals:** Lender-side only. Borrower sees a form, not analysis.
- **BiggerPockets calculators:** Investor-side, but DSCR is an afterthought. No lender matching.
- **Excel underwriting templates:** Powerful but slow, error-prone, no live data.

### Our wedge
**The only tool that combines institutional-grade math (waterfall, defeasance, 1031, AEY) with consumer-grade UX.** A borrower should be able to paste a deal and get a committee-grade verdict in 8 seconds, then drill into any of 12 deep analyses on demand.

---

## 2. DESIGN PRINCIPLES

1. **Verdict first, math second.** The single most important thing on the page is the answer. Everything else is supporting evidence.
2. **Progressive disclosure.** Start with the answer + 3 supporting metrics. Reveal depth on click, not on scroll.
3. **One screen, one question.** Each section answers one question: "Does it qualify?" "Does it cash flow?" "What's my downside?" "Who will lend?" "What's my exit?"
4. **Color is meaning.** Green = go, amber = caution, red = stop. No decorative color. Every metric is colored by its verdict.
5. **Numbers in context.** "$3,196 PITIA" is meaningless. "$3,196 PITIA (rent covers 1.05x, deal-break at $3,349)" is meaningful.
6. **Show the math, hide the complexity.** "DSCR 1.05x" with a hover popover explaining "rent $3,000 ÷ PITIA $2,862" — power users get depth, novices get the answer.
7. **Mobile-first.** Bottom-up layout on phone (form collapses to drawer), top-down on desktop.
8. **Print = PDF.** The IC memo should be a real PDF export, not ASCII art.

---

## 3. INFORMATION ARCHITECTURE

### Top-level navigation (3 tabs, not 20 sections)

```
┌─────────────────────────────────────────────────────┐
│  DSCR Deal Desk         [Deal] [Lenders] [Exit]  ⋯  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [VERDICT HERO — always visible]                    │
│                                                     │
│  [Tab content — switches based on active tab]       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Tab 1: Deal** (default) — "Does this deal work?"
- Verdict hero (always at top)
- Credit standard (4 metrics)
- Track 1 vs Track 2 comparison
- Kill criteria (only if any)
- Verdict narrative (1-paragraph "why")

**Tab 2: Lenders** — "Who will fund this?"
- Two-quote recommendation (flex + rate-competitive)
- Top 5 lenders with AEY, counterparty flag
- Required DSCR by lender
- Reserves required

**Tab 3: Exit** — "What's my return + downside?"
- Returns (cap rate, yield-on-cost, cash-on-cash, equity multiple)
- Hold matrix (48 cells, collapsible)
- Tornado chart (binding risk)
- After-tax IRR
- Sensitivity grid
- Stress test summary

### Drilldown drawer (advanced analysis on demand)
Click any metric → drawer slides in from right with deep analysis:
- Click DSCR → drawer with break-even table + sensitivity grid
- Click Equity Multiple → drawer with partnership waterfall
- Click Debt Yield → drawer with stress scenarios
- Click "Defeasance" → drawer with defeasance analysis
- Click "1031 Exchange" → drawer with tax deferral analysis

### Form drawer (left, collapsible)
- Default closed on mobile, open on desktop
- "Quick Presets" at top (5 deals)
- Smart defaults: as user types purchase price, auto-suggest 75% LTV loan
- Required fields only by default; "Advanced" expands opex/seasoning/docs

---

## 4. ENGINE STRENGTHENING

### 4.1 Math correctness (verify against industry standards)

**DSCR calculation:**
- ✅ Track 1: Qualifying Rent / PITIA (lender view)
- ✅ Track 2: NOI / Annual Debt Service (investor view, proper NOI with all opex)
- 🔧 **NEW:** Track 3: Stabilized DSCR (year-3 NOI / ADS) — shows deal trajectory
- 🔧 **NEW:** Breakeven occupancy % (already computed, surface it)

**LTV/CLTV:**
- ✅ LTV computed correctly
- 🔧 **NEW:** CLTV (combined LTV) — track second liens / HELOCs
- 🔧 **NEW:** Equity multiple on LTV (loan / equity)

**Debt Yield:**
- ✅ NOI / Loan
- 🔧 **NEW:** Stabilized debt yield (year-3 NOI / loan)
- 🔧 **NEW:** Debt yield at exit (exit NOI / remaining balance)

**AEY (All-In Effective Yield):**
- ✅ XIRR of borrower cash flows
- 🔧 **NEW:** Compare AEY across hold periods (3/5/7/10yr) — already in true_cost, surface in lender tab

**IRR:**
- ✅ Levered IRR with NOI growth
- 🔧 **NEW:** Unlevered IRR (no debt) — shows deal quality independent of financing
- 🔧 **NEW:** Equity multiple with timing-weighted multiple (IRR × years)

### 4.2 Algorithm improvements

**Stress testing:**
- ✅ 22 scenarios
- 🔧 **NEW:** Monte Carlo integration — show P10/P50/P90 DSCR distribution alongside discrete scenarios
- 🔧 **NEW:** "Worst plausible case" — combine top-3 stress scenarios simultaneously

**Sensitivity:**
- ✅ Tornado chart (4 variables)
- 🔧 **NEW:** 2-variable sensitivity grid (already built, surface in drilldown)
- 🔧 **NEW:** Break-even DSCR table (already built, surface prominently)

**Lender matching:**
- ✅ 5 lenders with AEY, counterparty flag
- 🔧 **NEW:** "Two-quote optimizer" — given borrower's priorities (rate vs flexibility), recommend the optimal pair
- 🔧 **NEW:** Lender continuity risk score (already in counterparty_flag, make it prominent)

### 4.3 New analyses to add

**Refinance analysis:**
- 🔧 **NEW:** "When to refi" — given current rate vs market rate, compute break-even months (already in points_recoup, generalize)
- 🔧 **NEW:** Cash-out refi analysis — max cash available at current LTV

**Partnership waterfall:**
- ✅ Built in v12.1
- 🔧 **NEW:** Surface in Exit tab (was only in drilldown)

**Tax:**
- ✅ After-tax IRR
- 🔧 **NEW:** QBI deduction (Section 199A) — 20% QBI deduction for pass-through entities
- 🔧 **NEW:** State tax by state (currently hardcoded 0% in 1031)

### 4.4 Performance
- 🔧 **NEW:** Memoize expensive calculations (hold matrix, Monte Carlo) — recompute only when inputs change
- 🔧 **NEW:** Web Worker for engine (200ms compute blocks UI)

---

## 5. UX REDESIGN

### 5.1 Verdict Hero (the most important component)

```
┌─────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════╗   │
│ ║                                               ║   │
│ ║   ✅ PROCEED                                  ║   │
│ ║   1.32x investor DSCR · 7.0% rate · 74% LTV  ║   │
│ ║                                               ║   │
│ ║   Deal qualifies at 6 lenders. Cash flow      ║   │
│ ║   $366/mo. Equity multiple 1.91x over 5yr.   ║   │
│ ║                                               ║   │
│ ╚═══════════════════════════════════════════════╝   │
│                                                     │
│  Track 1 (Lender)  │  Track 2 (Investor) │  Verdict │
│  ┌──────────────┐  │  ┌──────────────┐   │  drill   │
│  │ 1.62x ✅     │  │  │ 1.32x ✅     │   │  ↓       │
│  │ qualifies    │  │  │ +$366/mo     │   │          │
│  └──────────────┘  │  └──────────────┘   │          │
└─────────────────────────────────────────────────────┘
```

- **Always at top**, never scrolls away
- **Single verdict color** (green/amber/red) — no mixed signals
- **3 sub-cards** below: Track 1, Track 2, "Why?" drilldown
- **Click any sub-card** → drawer with deep analysis

### 5.2 Deal Cockpit (Tab 1 default content)

```
┌─────────────────────────────────────────────────────┐
│ THE DEAL                                            │
│ $245k purchase · $171.5k loan (70% LTV) · 7.0%      │
│ Two-unit OH · LTR · LLC · 740 FICO                  │
├─────────────────────────────────────────────────────┤
│ CREDIT STANDARD                                     │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│ │PITIA     │ │DSCR      │ │LTV       │ │Debt Yield││
│ │$1,141/mo │ │1.62x ✅  │ │70% ✅    │ │10.5% ✅  ││
│ │          │ │req 1.0x  │ │max 80%   │ │min 9%    ││
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘│
├─────────────────────────────────────────────────────┤
│ THE MATH (click for detail)                         │
│                                                     │
│  Qualifying rent:     $2,500/mo                     │
│  Effective rent:      $2,375/mo  (after 5% vac)     │
│  PITIA:               $1,141/mo                     │
│  NOI:                 $18,078/yr                    │
│  Debt service:        $13,692/yr                    │
│  Cash flow:           +$366/mo                      │
│                                                     │
│  Deal-break rate:     11.2%  (4.2% cushion)         │
│  Max loan @ 1.25x:    $199,400  (you're $28k under) │
│  Min rent @ 1.25x:    $1,925  (you have $575 buffer)│
├─────────────────────────────────────────────────────┤
│ KILL CRITERIA  ✅ None triggered                     │
│ (collapses to one line if clear, expands if any)    │
├─────────────────────────────────────────────────────┤
│ WHY THIS VERDICT                                    │
│ "Deal qualifies at standard DSCR lenders. Investor  │
│ cash flow is positive ($366/mo). Deal-break rate    │
│ 11.2% gives 4.2% cushion against rate shocks.       │
│ Recommended: proceed to lender matching."           │
└─────────────────────────────────────────────────────┘
```

### 5.3 Lender Tab

```
┌─────────────────────────────────────────────────────┐
│ TWO-QUOTE RECOMMENDATION                            │
│                                                     │
│  Flex lender:      Griffin Funding (90/100 score)   │
│  Rate-competitive: Deephaven (6.125% AEY 6.20%)     │
│  AEY delta:        $1,750 over 5yr                  │
│                                                     │
│  → Get both quotes. Never accept single.            │
├─────────────────────────────────────────────────────┤
│ TOP 5 LENDERS                                       │
│ ┌──────────────────────────────────────────────────┐│
│ │#1 Griffin Funding        6.000%  AEY 6.08%       ││
│ │  ✅ strong_fit · 90/100 · stable counterparty    ││
│ │  [Expand for rate sheet, reserves, restrictions] ││
│ ├──────────────────────────────────────────────────┤│
│ │#2 Deephaven Mortgage     6.125%  AEY 6.20%       ││
│ │  ✅ strong_fit · 90/100 · stable                 ││
│ └──────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────┤
│ REQUIRED BY LENDER                                  │
│  DSCR: 1.0x (you have 1.62x ✅)                     │
│  Reserves: 6mo PITIA = $6,846 (you have 9mo ✅)     │
│  FICO: 680 (you have 740 ✅)                        │
└─────────────────────────────────────────────────────┘
```

### 5.4 Exit Tab

```
┌─────────────────────────────────────────────────────┐
│ RETURNS (5-yr hold, 3% rent growth, 7% exit cap)    │
│                                                     │
│  Entry cap:        7.38%                            │
│  Yield on cost:    7.38% (no value-add)             │
│  Cash-on-cash Y1:  5.56%                            │
│  Equity multiple:  1.91x  ← click for waterfall     │
│  Levered IRR:      13.4%                            │
│  After-tax IRR:    11.8%  ← click for tax detail    │
├─────────────────────────────────────────────────────┤
│ HOLD MATRIX (click any cell for cash flow detail)   │
│                                                     │
│        rent growth →                                │
│  hold  0%    1%    2%    3%                         │
│   3yr  8%    10%   12%   14%   ← IRR by scenario    │
│   5yr  11%   13%   15%   17%                        │
│   7yr  14%   16%   18%   20%                        │
│  10yr  17%   19%   21%   23%                        │
│                                                     │
│  ↓ 3 rows for stress/bull cap scenarios             │
├─────────────────────────────────────────────────────┤
│ BINDING RISK: Rent ±20% (Δ 0.42x DSCR)              │
│  [Tornado chart — 4 horizontal bars]                │
├─────────────────────────────────────────────────────┤
│ STRESS TEST: 18/22 pass · 2 watch · 1 fail · 1 kill │
│  [4 colored boxes]                                  │
├─────────────────────────────────────────────────────┤
│ ADVANCED (click to expand)                          │
│  • Sensitivity grid (rate × LTV)                    │
│  • Break-even table                                 │
│  • Partnership waterfall                            │
│  • Defeasance analysis                              │
│  • §1031 exchange                                   │
│  • ARM reset analysis                               │
└─────────────────────────────────────────────────────┘
```

### 5.5 Form redesign

**Before:** 40+ fields in 8 collapsible sections, all visible by default.

**After:** Progressive disclosure with smart defaults.

```
┌──────────────────────┐
│ QUICK PRESETS        │  ← always visible
│ • Trap (FL SFR)      │
│ • Green (OH Duplex)  │
│ • Structuring (TX)   │
│ • Kill (NV STR)      │
│ • ARM Risk (CA)      │
├──────────────────────┤
│ THE DEAL             │  ← 6 fields, always visible
│ Purchase  $245,000   │
│ Loan     $171,500    │  (auto-suggests 70% LTV)
│ Rate     7.000%      │
│ Points   1.0%        │
│ Rent     $2,500/mo   │
│ State    OH          │
├──────────────────────┤
│ PROPERTY             │  ← 4 fields, always visible
│ Type    Two-Unit ▼   │
│ Rent    LTR ▼        │
│ Purpose Purchase ▼   │
│ FICO    740          │
├──────────────────────┤
│ EXPENSES (annual)    │  ← 4 fields, default to typical
│ Taxes    $3,600      │
│ Insurance $1,200     │
│ HOA      $0          │
│ Capex    $1,200      │
├──────────────────────┤
│ ▼ ADVANCED           │  ← collapsed by default
│   Investor opex %    │
│   Documentation      │
│   After-tax profile  │
│   Partnership        │
│   1031 exchange      │
└──────────────────────┘
```

### 5.6 Visual hierarchy

**Typography:**
- Verdict: 48px bold
- Section titles: 14px uppercase tracking-wide
- Metric values: 24px tabular-nums
- Metric labels: 10px uppercase
- Body: 14px

**Spacing:**
- Card padding: 24px
- Card gap: 16px
- Section gap: 32px
- Tight metric cards: 12px padding

**Color system:**
- Background: white / slate-950 (dark)
- Cards: slate-50 / slate-900
- Verdict green: emerald-600
- Verdict amber: amber-600
- Verdict red: rose-600
- Accent: violet-600 (for advanced/optional)
- Text: slate-900 / slate-100

### 5.7 Mobile layout

```
┌─────────────────────┐
│ ☰  DSCR Desk   ⚙   │  ← header
├─────────────────────┤
│ ╔═════════════════╗ │
│ ║ ✅ PROCEED      ║ │  ← verdict hero (full width)
│ ║ 1.32x · 7.0%    ║ │
│ ╚═════════════════╝ │
├─────────────────────┤
│ [Deal][Lenders][Exit]│  ← tab switcher
├─────────────────────┤
│ [Tab content]       │
│ ...                 │
├─────────────────────┤
│ ⬆ Edit deal inputs  │  ← FAB to open form drawer
└─────────────────────┘
```

Form opens as bottom sheet on mobile, side drawer on desktop.

---

## 6. IMPLEMENTATION PLAN

### Phase 1: Engine strengthening (estimated 30 min)
- Add Track 3 (stabilized DSCR), unlevered IRR, QBI deduction
- Add refinance analysis module
- Memoize expensive calculations
- Add `evaluateDealV13()` that returns enriched report

### Phase 2: UX architecture (estimated 20 min)
- Create new component structure:
  - `VerdictHero.tsx` — always-visible verdict
  - `DealCockpit.tsx` — Tab 1 content
  - `LenderPanel.tsx` — Tab 2 content
  - `ExitPanel.tsx` — Tab 3 content
  - `DrilldownDrawer.tsx` — slide-in for deep analysis
  - `DealFormV2.tsx` — progressive disclosure form
- Restructure page.tsx to use tabs + drawer

### Phase 3: Build components (estimated 45 min)
- VerdictHero with color-coded verdict + 3 sub-cards
- DealCockpit with credit standard + math + narrative
- LenderPanel with two-quote + top 5
- ExitPanel with returns + matrix + tornado + advanced
- DrilldownDrawer with 6 deep-analysis views
- DealFormV2 with progressive disclosure + smart defaults

### Phase 4: Polish (estimated 20 min)
- Animations (drawer slide, tab crossfade, number transitions)
- Dark mode (already supported, verify)
- Print stylesheet (clean PDF export)
- Responsive breakpoints (mobile FAB, tablet 2-col, desktop 3-col)

### Phase 5: Verify (estimated 15 min)
- Type-check
- All 5 presets render correctly
- Each drilldown works
- Mobile layout at 375px, 768px, 1024px, 1440px
- Print preview

---

## 7. SUCCESS METRICS

**UX:**
- Time to verdict: < 2 seconds from page load
- Time to find binding constraint: < 5 seconds (was ~30s in v12)
- Mobile usable at 375px width
- Print = clean 1-page summary

**Engine:**
- All v12 math preserved (no regressions)
- New: Track 3 stabilized DSCR
- New: Unlevered IRR
- New: QBI deduction
- New: Refinance break-even
- All existing verification scripts still pass

**Competitive:**
- Beats Banana/New Silver on depth (they only do DSCR)
- Beats BiggerPockets on DSCR specificity (they're general RE)
- Beats Excel on speed (instant vs minutes)
- Matches institutional tools (Lima One, Visio) on lender matching

---

## 8. RISKS & MITIGATIONS

| Risk | Mitigation |
|------|-----------|
| Engine changes break existing math | Keep v12.1 functions, add v13 alongside |
| New UI hides important info | Drilldown drawer ensures depth is 1 click away |
| Mobile layout breaks | Test at 375/768/1024/1440 before ship |
| Performance regression from new features | Memoize, web worker if needed |
| Print breaks | Dedicated print stylesheet, test with browser print preview |

---

## 9. WHAT WE'RE NOT DOING

To stay focused, explicitly out of scope:
- Multi-deal comparison (future v14)
- User accounts / saved deals (future v14)
- Lender API integrations (future v14)
- AI deal review (future v14)
- White-label / branding (future v14)

---

**END OF ULTRAPLAN.** Proceeding to Phase 1: Engine strengthening.
