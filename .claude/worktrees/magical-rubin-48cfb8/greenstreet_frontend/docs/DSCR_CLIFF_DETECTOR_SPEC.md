# DSCR Cliff Detector — Feature Spec

**Status:** Ready for review
**Owner:** GreenStreet Frontend
**Engine dependencies:** `armResetEngine.ts`, `monteCarloRatePath.ts`, `returnsEngine.ts`, `taxEngine.ts`
**Estimated build:** v1 = 2-3 hours direct-engine call; v2 = 1-2 days with Monte Carlo + Move Set recommendations
**Route:** `/tools/dscr-cliff`
**Sidebar:** Compliance Dashboard → "Risk" group

---

## 1. The Problem

DSCR borrowers with ARMs (5/6, 7/6, 10/6, or hybrids like 5/1, 7/1, 10/1) close their loan thinking about the *initial* rate, then forget about reset. By month 60 they're shocked when their payment jumps 30% and their DSCR crashes below 1.0.

This page answers one question:

**"What does my DSCR look like at reset, across realistic rate scenarios, and what should I do about it?"**

The user is the borrower. The output is not data — it's a **decision**.

---

## 2. User Experience

### 2.1 Entry points

- **Direct URL** `/tools/dscr-cliff` — manual visit, often via bookmark after seeing it in marketing.
- **Sidebar link** in `ComplianceDashboard` — under new "Risk" group, between "Stress Matrix" and "Decision Support".
- **Cross-link from ARMPage** — at bottom of ARM simulator, button: "See your DSCR Cliff →".
- **Alert (future)** — borrower gets email/mobile push at month 50 of 5/6 ARM: "Your reset is 16 months away. See your cliff."

### 2.2 Layout (top to bottom)

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: DSCR Cliff Detector                                 │
│  Subtitle: When does your ARM reset, and what happens?      │
├─────────────────────────────────────────────────────────────┤
│  4 KPI CARDS (one row)                                      │
│  [ARM Type]  [Months to Reset]  [Current DSCR]  [Worst DSCR]│
├─────────────────────────────────────────────────────────────┤
│  INPUT PANEL (collapsible, default open)                    │
│  Purchase Price, Loan, Rate, ARM Type, Margin, Rent,        │
│  Expenses, IO Period, Hold Period                           │
├─────────────────────────────────────────────────────────────┤
│  CLIFF CHART (full width, 420px tall, Recharts)             │
│  - X-axis: months 0-120                                     │
│  - Y-axis: DSCR                                             │
│  - 5 lines: BULLISH / BASE / BEARISH / STRESS / CRISIS      │
│  - Background bands: DEAL_BREAK (red), FRAGILE (orange),    │
│    MARGINAL (yellow), COMFORTABLE+ (green)                  │
│  - Vertical line at first reset month                       │
│  - Hover tooltip: month-by-month values                     │
│  - Annotation: "First DSCR <1.0" marker per scenario        │
├─────────────────────────────────────────────────────────────┤
│  SCENARIO TABLE (5 rows)                                    │
│  Scenario | Index | New Rate | New P&I | New DSCR | Months  │
│           |       |          |         |          | to <1.0  │
├─────────────────────────────────────────────────────────────┤
│  MOVE SET (3-5 ranked cards)                                │
│  [1] [2] [3] [4]                                            │
│  Each card: action, why, NPV impact, deadline              │
├─────────────────────────────────────────────────────────────┤
│  RENT SENSITIVITY AT RESET                                  │
│  "To keep DSCR ≥ 1.0 at reset under BEARISH, your rent      │
│   would need to be $X (currently $Y, +12%)"                 │
├─────────────────────────────────────────────────────────────┤
│  ARM vs FIXED COMPARISON                                    │
│  Side-by-side: current ARM reset DSCR vs refi to fixed today│
├─────────────────────────────────────────────────────────────┤
│  KEY DATES CALENDAR                                         │
│  Reset month, prepay penalty end, recommended action window  │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Tone

- Direct, not salesy. "Your DSCR drops to 0.97x in month 67 under BEARISH. Here's your move set."
- No fear-mongering. Show the BASE case first, then the risks.
- Acknowledge the borrower is sophisticated. They don't want hand-holding.

---

## 3. Inputs

### 3.1 Required

| Field | Type | Default | Notes |
|---|---|---|---|
| Purchase price | number | 425000 | Used for property value if current value not provided |
| Loan amount | number | 318750 | The actual financed amount |
| Initial note rate | % | 6.5 | The rate in years 1-N (N = fixed period) |
| ARM type | enum | "5/6" | Options: 5/6, 7/6, 10/6, 5/1, 7/1, 10/1, 3/1 |
| Margin | % | 2.75 | Added to SOFR index at reset. Industry standard 2.75-3.00 |
| Current monthly rent | $ | 3000 | Used for current DSCR |
| Annual taxes | $ | 5000 | PITIA component |
| Annual insurance | $ | 2000 | PITIA component |
| Monthly HOA | $ | 0 | PITIA component |
| Loan term | years | 30 | |
| IO period | enum | "NONE" | NONE, 12, 24, 36, 60, 84, 120 |

### 3.2 Optional (but enable richer recommendations)

| Field | Type | Default | Notes |
|---|---|---|---|
| Current property value | $ | = purchase price | For current LTV calc |
| Months since close | number | 0 | For seasoning calc |
| Projected rent growth | %/yr | 3.0 | Industry avg |
| Projected appreciation | %/yr | 3.5 | For refi/cash-out recommendation |
| Current reserves | $ | 0 | Months of PITIA covered |
| Expected hold period | years | 10 | For sell-vs-hold logic |
| Prepayment penalty type | enum | "NONE" | NONE, 54321, 4321, 321, 54333, FLAT_5, SIX_MONTHS_INTEREST, SIX_MONTHS_80_PCT, YIELD_MAINTENANCE, SOFT_PREPAY |
| Lender name | string | "" | For ARM-to-fixed refi cost estimates |

### 3.3 State

- **No property stored** → user enters manually
- **Property stored** (future) → pre-fill from profile
- **Multiple ARMs in portfolio** → page handles ONE ARM; multi-ARM view is a separate `/tools/portfolio-cliffs` view (out of scope for v1)

---

## 4. Engine Calls

### 4.1 v1 — Direct engine calls (build today)

```typescript
import { simulateARMResetLadder, computeMultiScenarioARMReset, computePaymentShockPct, findDSCRBreakYear, computeRefiTriggerRate, DEFAULT_ARM_PROGRAMS, ARM_SCENARIO_INDEXES, CURRENT_MARKET_SNAPSHOT } from "../engine/armResetEngine";
import { solveDSCR } from "../engine/engine";
import { buildEngineInputs } from "../engine/inputs";

// 1. Solve current deal for baseline
const inputs = buildEngineInputs({
  purchasePrice, loanAmount, monthlyRent, state, ficoScore: 740,
  propertyType: "SFR", annualTaxes, annualInsurance, hoa,
});
const currentDeal = solveDSCR(inputs.property, inputs.borrower, inputs.loan, inputs.strategy);
// currentDeal.dscr = current DSCR (Track 1)
// currentDeal.rateHeadroomBps = cushion to deal break
// currentDeal.dealBreakRate = rate at which DSCR = 1.0

// 2. Build ARM terms object
const armTerms = {
  loanAmount,
  initialRate: initialNoteRate / 100,
  margin: margin / 100,
  indexFloor: 0,
  caps: { initial: 2, periodic: 2, lifetime: 5 },  // standard 2/2/5
  fixedPeriodMonths: armType === "5/6" ? 60 : armType === "7/6" ? 84 : armType === "10/6" ? 120 : armType === "5/1" ? 60 : armType === "7/1" ? 84 : armType === "10/1" ? 120 : 36,
  resetFrequencyMonths: armType.endsWith("/6") ? 6 : 12,
  remainingTermMonths: loanTerm * 12,
  ioPeriodMonths: ioPeriod === "NONE" ? 0 : ioPeriod,
};

// 3. Run multi-scenario simulation
const scenarios = computeMultiScenarioARMReset(armTerms, CURRENT_MARKET_SNAPSHOT);
// scenarios = [
//   { name: "BULLISH", sustainedIndexPct: 2.50, ladder: [...] },
//   { name: "BASE", sustainedIndexPct: 3.60, ladder: [...] },
//   { name: "BEARISH", sustainedIndexPct: 4.50, ladder: [...] },
//   { name: "STRESS", sustainedIndexPct: 5.00, ladder: [...] },
//   { name: "CRISIS", sustainedIndexPct: 6.00, ladder: [...] },
// ]

// 4. For each scenario, find the break year
for (const scenario of scenarios) {
  const breakYear = findDSCRBreakYear(armTerms, scenario.sustainedIndexPct, qualifyingRent);
  // breakYear = null if DSCR never drops below 1.0
}

// 5. Compute payment shock under BEARISH
const shock = computePaymentShockPct(armTerms, ARM_SCENARIO_INDEXES.BEARISH);
// shock = (newPITI - oldPITI) / oldPITI as fraction
```

### 4.2 v2 — With Monte Carlo + Move Set (build after v1)

```typescript
import { runMonteCarloRatePath, DEFAULT_VASICEK_PARAMS } from "../engine/monteCarloRatePath";

// 6. Monte Carlo for probability distribution
const mc = runMonteCarloRatePath(
  armTerms,
  loanAmount,
  loanTerm * 12,
  monthlyRent,
  monthlyTaxes + monthlyInsurance + hoa,  // monthly fixed expenses
  1000,  // simulations
  120,   // horizon months (10 years)
  42,    // seed
  { ...DEFAULT_VASICEK_PARAMS, longRunMeanSOFR: 0.036, initialSOFR: 0.0359 },  // 3.6% mean, current 3.59%
  CURRENT_MARKET_SNAPSHOT,
);
// mc.pDSCRLessThan1 = probability DSCR < 1.0 at reset
// mc.fifthPctDSCR = 5th percentile DSCR (worst 5% of scenarios)
// mc.medianDSCR = median DSCR across simulations
// mc.percentiles = { p5, p10, p25, p50, p75, p90, p95 }
```

```typescript
import { computeAfterTaxIRR, computeRecaptureOnSale } from "../engine/taxEngine";

// 7. Move Set NPV calculations
// For each candidate action, compute NPV over the expected hold period.

// 7a. Sell before reset
const sellNPV = propertyValueNow - sellingCosts - taxEngine.computeRecaptureOnSale(...);
// vs hold value
const holdNPV = computeAfterTaxIRR(...);  // full hold-to-year-N

// 7b. Refi to fixed today
const refiRate = 6.5;  // current market fixed
const refiMonthly = calculatePI(loanAmount, refiRate/100, loanTerm*12);
const refiClosingCosts = 8000;
// NPV = sum of monthly savings * 12 * years - closing costs

// 7c. Build reserves
const targetReserves = 6 * currentPITIA;
const monthsToReset = armTerms.fixedPeriodMonths - monthsSinceClose;
const monthlySavingsNeeded = targetReserves / monthsToReset;
```

---

## 5. Visual Design

### 5.1 Cliff Chart (centerpiece)

**Library:** Recharts (already in stack)

**Structure:**

- `<LineChart>` with 5 `<Line>` series, one per scenario
- `<ReferenceArea>` for DSCR zones:
  - y < 0.85: red (`#ff6b6b` at 15% opacity)
  - 0.85 ≤ y < 1.0: orange (`#ff9f43` at 15% opacity)
  - 1.0 ≤ y < 1.25: yellow (`#D8D958` at 15% opacity)
  - y ≥ 1.25: green (`#4DBD97` at 10% opacity)
- `<ReferenceLine>` at x = first reset month, label "First Reset"
- `<ReferenceLine>` at y = 1.0 (DSCR minimum), dashed
- Each line has unique color: BULLISH=teal, BASE=mint, BEARISH=yellow, STRESS=orange, CRISIS=red
- `<Tooltip>` showing month, scenario, DSCR
- Y-axis domain: auto, but minimum 0.5 to show deal break
- X-axis domain: 0 to 120 (or loanTerm * 12)

**Interaction:**

- Hover anywhere on chart → tooltip shows all 5 scenarios at that month
- Click on line in legend → toggle that scenario
- Reset month highlighted with vertical band

### 5.2 KPI Cards (top row)

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ ARM TYPE     │ │ MONTHS TO    │ │ CURRENT DSCR │ │ WORST DSCR   │
│              │ │ RESET        │ │              │ │ AT RESET     │
│ 5/6          │ │              │ │              │ │              │
│              │ │ 47 months    │ │ 1.24x        │ │ 0.97x        │
│ 30-yr fixed  │ │              │ │              │ │ (BEARISH)    │
│ after year 5 │ │ Oct 2030     │ │ COMFORTABLE  │ │ FRAGILE      │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

Color of each card based on value:

- Current DSCR: green if ≥1.25, yellow if 1.0-1.25, red if <1.0
- Worst DSCR at reset: same scale, against the worst scenario
- Months to reset: green if >24, yellow if 12-24, red if <12 (urgency)

### 5.3 Scenario Table

```
┌───────────┬────────┬──────────┬─────────┬─────────┬──────────────┐
│ Scenario  │ Index   │ New Rate │ New P&I │ New DSCR│ Months to <1 │
├───────────┼────────┼──────────┼─────────┼─────────┼──────────────┤
│ BULLISH   │ 2.50%   │ 5.25%    │ $1,950  │ 1.78x   │ —            │
│ BASE      │ 3.60%   │ 6.35%    │ $2,234  │ 1.42x   │ —            │
│ BEARISH   │ 4.50%   │ 7.25%    │ $2,489  │ 1.18x   │ —            │
│ STRESS    │ 5.00%   │ 7.75%    │ $2,648  │ 1.06x   │ 84           │
│ CRISIS    │ 6.00%   │ 8.75%    │ $2,968  │ 0.92x   │ 67           │
└───────────┴────────┴──────────┴─────────┴─────────┴──────────────┘
```

DSCR cell colored: green ≥1.25, yellow 1.0-1.25, red <1.0

### 5.4 Move Set Cards

```
┌────────────────────────────────────────────────────────┐
│ MOVE 1 (highest priority)                              │
│ ▸ Refi to 30-yr fixed before reset                    │
│                                                        │
│ WHY: Current LTV is 68%, fixed rates at 6.5% today.   │
│      Refi closes 8 months before reset, locks payment,│
│      avoids the entire reset risk.                     │
│                                                        │
│ NPV IMPACT: +$32,000 over remaining term               │
│ DEADLINE: Apply by month 52 (8 months before reset)   │
│ COST: ~$8,000 closing costs                            │
│ BREAK-EVEN: 18 months                                  │
│                                                        │
│ [Get refi quotes →]                                    │
└────────────────────────────────────────────────────────┘
```

Move set cards are sorted by NPV impact (highest first). Up to 5 moves shown. If no moves are warranted, show "Hold and monitor — your deal is resilient across all 5 scenarios."

### 5.5 Rent Sensitivity at Reset

```
┌────────────────────────────────────────────────────────┐
│ RENT SENSITIVITY AT RESET                              │
│                                                        │
│ To maintain DSCR ≥ 1.0 at first reset (month 60):     │
│                                                        │
│ BULLISH: rent ≥ $2,400 (current $3,000 = ✅ 25% cushion)│
│ BASE:    rent ≥ $2,700 (current $3,000 = ✅ 11% cushion)│
│ BEARISH: rent ≥ $3,400 (current $3,000 = ❌ -13% gap)  │
│ STRESS:  rent ≥ $3,800 (current $3,000 = ❌ -27% gap)  │
│ CRISIS:  rent ≥ $4,250 (current $3,000 = ❌ -42% gap)  │
│                                                        │
│ Your rent is vulnerable in BEARISH, STRESS, CRISIS.    │
└────────────────────────────────────────────────────────┘
```

### 5.6 ARM vs Fixed Comparison

```
┌─────────────────────────┬─────────────────────────┐
│ KEEP CURRENT ARM        │ REFI TO 30-YR FIXED     │
│                         │                         │
│ First reset: month 60   │ Rate: 6.5% (today)      │
│ BASE DSCR at reset: 1.42x│ DSCR: 1.61x            │
│ WORST DSCR: 0.92x       │ DSCR stays 1.61x        │
│ Payment shock: +34%     │ No shock                │
│                         │                         │
│ RISK: High              │ COST: $8,000 closing    │
│                         │                         │
│ [Stay with ARM]         │ [Get fixed refi quotes] │
└─────────────────────────┴─────────────────────────┘
```

### 5.7 Key Dates Calendar

```
┌────────────────────────────────────────────────────────┐
│ KEY DATES                                              │
│                                                        │
│ 📅 Oct 2026  (month 0)    — Loan origination          │
│ 📅 Apr 2030  (month 47)   — Apply for refi (8mo before)│
│ 📅 Oct 2030  (month 60)   — First ARM reset           │
│ 📅 Apr 2031  (month 66)   — Second reset              │
│ 📅 Oct 2031  (month 72)   — Third reset               │
│ ...                                                      │
│ 📅 Oct 2055  (month 360)  — Loan maturity             │
│                                                        │
│ Prepayment penalty: NONE (you can refi penalty-free)  │
└────────────────────────────────────────────────────────┘
```

---

## 6. Move Set Decision Logic

The Move Set is the **action output** of this page. It's not decorative — it's the whole point.

### 6.1 Candidate actions (ranked by NPV)

#### Move A: Refi to fixed before reset

**Trigger:** Current LTV ≤ 75% AND refi rate (today's 30-yr fixed) ≤ current rate + 0.75%
**NPV formula:** `Σ (currentPayment - refiPayment) × 12 × yearsRemaining - refiClosingCosts`
**Deadline:** Apply 8 months before reset (pre-reset refi locks new rate, no shock)
**Display:** "Refi to 30-yr fixed at today's rate (6.5%) — saves $X/mo, $Y over 5 years"

#### Move B: Build reserves now

**Trigger:** Any scenario has DSCR < 1.0 AND current reserves < 6 months PITIA
**NPV formula:** `6 × PITIA` (target reserve balance) — current reserves
**Deadline:** Accumulate by month 48 (12 months before reset)
**Display:** "Stash 6 months of PITIA ($X) by reset date — needs $Y/mo savings"
**Note:** This is the most universally applicable move for non-eligible-refi borrowers

#### Move C: Sell before reset

**Trigger:** Property has appreciated > 20% AND BEARISH scenario DSCR < 1.0 AND hold period is past year 3
**NPV formula:** `currentValue - sellingCosts - taxBill` vs `holdValueToReset - taxBill - paymentShockCost`
**Display:** "Sell in year 4-5, take profits, 1031 into stabilized property"
**Caveat:** Only show if property has actually appreciated (don't recommend selling at a loss)

#### Move D: Restructure with lender

**Trigger:** DSCR < 1.0 in BEARISH AND LTV > 75% (can't refi easily)
**NPV formula:** Not directly computable; show as "contact lender" action
**Display:** "Ask lender about: extending IO period, recast, or modification"

#### Move E: Hold and monitor

**Trigger:** DSCR ≥ 1.0 in BASE AND DSCR ≥ 1.0 in BEARISH
**Display:** "No action needed. Set a rate alert at 50bps above your current rate. Re-check this page in 6 months."

### 6.2 Always-shown moves

- **Move X: "If you do nothing"** — show what happens under each scenario. This is the baseline for comparison.

### 6.3 No-move case

If all DSCR values are >1.25 across all 5 scenarios:

```
✅ YOUR DEAL IS RESILIENT
Across all 5 rate scenarios, your DSCR stays above 1.25 at reset.
No action needed. Bookmark this page and re-check quarterly.
```

---

## 7. Edge Cases

| Case | Handling |
|---|---|
| Unknown ARM type | Show "ARM type not recognized. Supported: 5/6, 7/6, 10/6, 5/1, 7/1, 10/1, 3/1" |
| IO period longer than fixed period | Show warning: "IO period extends past first reset. Payment stays IO but rate resets." |
| Cap hit (lifetime cap reached) | Show note: "Lifetime cap of 5% will bind under STRESS and CRISIS — actual rate may be lower" |
| Loan already past first reset | Show "Post-reset" mode: chart from current state, no pre-reset plateau |
| Hybrid ARM (3/1, 5/1, 7/1, 10/1) | Show annual resets after fixed period (not semi-annual like 5/6) |
| Negative amortization ARM | Show as high risk, recommend immediate refi |
| Property has no rent entered | Show "Enter your monthly rent to see DSCR scenarios" placeholder |
| Loan amount is 0 | Show "Enter your loan amount to see scenarios" |
| Property is fully paid off | Show "Loan is paid off — no ARM to analyze" |

---

## 8. Failure Modes

| Failure | Behavior |
|---|---|
| Engine returns no scenarios | Show "Could not model this ARM. Verify ARM type, margin, and caps." |
| NaN in DSCR | Show "—" in cell, tooltip "Could not calculate" |
| Margin missing | Default to 2.75% (industry standard SOFR margin) |
| Index floor > 0 | Note: "Index floor of X% means SOFR cannot drop below X% at reset" |
| Loan term shorter than fixed period + 1 year | Show "Loan matures before/at reset — no ARM analysis needed" |

---

## 9. Build Sequence

### Phase 1 — Cliff Chart + Scenario Table (v1, 2-3 hours)

- Input panel with required fields
- 4 KPI cards
- Cliff chart (5 lines, 4 zone bands, reset marker, hover tooltip)
- Scenario table (5 rows × 6 cols, color-coded)
- Key dates calendar

**Acceptance:** Borrower can see their DSCR cliff across 5 scenarios, identify the worst-case month, and understand the reset timing.

### Phase 2 — Move Set + Rent Sensitivity (v2, 1-2 days)

- Move Set cards (5 candidate actions, NPV-ranked)
- Rent sensitivity at reset
- ARM vs Fixed comparison
- "If you do nothing" baseline

**Acceptance:** Borrower gets a concrete ranked recommendation, not just data.

### Phase 3 — Monte Carlo + Alert Integration (v3, future)

- Add `runMonteCarloRatePath` results
- Show probability distribution: "P(DSCR < 1.0) = 18%"
- Integration with alerts/monitoring (out of scope for this spec)

**Acceptance:** Borrower sees probabilistic, not just deterministic, scenarios.

---

## 10. Success Criteria

The page is successful if:

1. **Time to insight:** Borrower can see their DSCR cliff within 5 seconds of landing.
2. **Worst case identification:** The "Worst DSCR" KPI card and the CRISIS line on the chart show the borrower their downside in one glance.
3. **Concrete recommendation:** At least one Move Set card has a specific NPV number and a deadline. No "you should consider" hand-waving.
4. **Viral potential:** The cliff chart is screenshot-worthy. A borrower with an ARM problem will share it in a Facebook investor group.
5. **Surfaces something they didn't know:** The rent sensitivity at reset (Move: "your rent would need to be $X") is the most likely "I didn't think of that" moment.

---

## 11. What's NOT in v1

- Multi-ARM portfolio view (separate page)
- Live SOFR rate feed (use static `CURRENT_MARKET_SNAPSHOT`)
- Historical rate path chart (only forward-looking)
- Email/SMS alert setup (separate feature)
- Refi quote integration (button goes to external broker)
- Stress test combining ARM + vacancy + appreciation shocks (already in Stress Matrix)

---

## 12. Open Questions

1. **Should this page be auth-gated?** Borrowers might want to keep their financial details private. v1: public, no PII. v2: optional save-to-profile.
2. **Live rate integration?** v1 uses static `CURRENT_MARKET_SNAPSHOT`. Should v2 pull live SOFR from FRED?
3. **Cap structure defaults?** Industry standard 2/2/5 (2% initial, 2% periodic, 5% lifetime). Hardcode for v1, expose in v2?
4. **What about IO expiration overlapping with reset?** Need to model this carefully. v1: flag as warning, v2: separate IO chart.

---

## 13. References

- **Engine source:** `src/engine/armResetEngine.ts` (lines 1-450, see `simulateARMResetLadder`, `computeMultiScenarioARMReset`, `findDSCRBreakYear`, `ARM_SCENARIO_INDEXES`)
- **Market snapshot:** `CURRENT_MARKET_SNAPSHOT` in armResetEngine.ts (treasury10Y=4.47%, sofr30Day=3.59%, fedFundsEffective=3.62%, freddieMac30YrFixed=6.53%, FRED/FRB/Northmarq verified 6/17/2026)
- **Existing ARM page:** `src/pages/ARMPage.tsx` (5 scenarios already shown, but as separate tables — this spec unifies them into one chart)
- **Lender data:** 19 lenders in `src/engine/lenders.ts` — could enrich Move Set with refi-cost estimates per lender
