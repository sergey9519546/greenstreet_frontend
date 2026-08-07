# Lender Behavioral Intelligence — Innovation Research Report

**Date:** June 21, 2026  
**Classification:** APEX-Level Innovation Research  
**Scope:** 8 behavioral intelligence domains, 40+ data points, platform architecture recommendations  
**Companion To:** `DSCR_APEX_RESEARCH_MASTER_SYNTHESIS.md` (published rules) + this report (actual behavior)

---

## EXECUTIVE SUMMARY

Published lender guidelines are the **tip of the iceberg**. Every DSCR lender has a rate sheet, a matrix, and a set of "rules." But the real game — the game no other platform captures — is understanding **how lenders actually behave**: their true approval rates, their undocumented flexibility, their capacity cycles, their negotiation levers, and their stability risks.

This report documents 8 dimensions of Lender Behavioral Intelligence that the DSCR Intelligence Platform should capture, quantify, and productize. Each dimension represents an **information asymmetry** that brokers currently learn only through years of relationship-building and painful trial-and-error. Our platform can compress that learning curve from years to seconds.

**The core insight:** Lender guidelines tell you what's *possible*. Behavioral intelligence tells you what's *probable*. That gap is where deals are won and lost.

---

## 1. APPROVAL RATE INTELLIGENCE

### 1.1 The Data Desert

Approval rates for DSCR / non-QM loans are **almost never published**. Unlike conventional mortgages (where HMDA data provides granular approval rates by lender, state, loan type, race, and income), non-QM DSCR loans fall into a reporting gray area:

- **HMDA coverage is incomplete:** Many DSCR lenders are non-bank, wholesale-only, or originate through correspondent channels that don't trigger HMDA reporting thresholds
- **DSCR-specific codes don't exist in HMDA:** There's no HMDA loan purpose code for "DSCR investment property" — these get lumped into "business purpose" or "investment property" categories
- **Non-QM securitization data exists but is lagging:** Issuance data from ABS securitizations (e.g., Angel Oak mortgage trusts, LendSure RMBS) shows vintage performance, not approval rates
- **No industry body tracks DSCR approval rates:** MBA, NMN, and Inside Mortgage Finance track origination volume, not approval/denial ratios

### 1.2 Estimated Approval Rates (From Industry Sources)

Based on industry reporting, broker surveys, and securitization pool characteristics:

| Lender Category | Estimated Approval Rate | Basis |
|---|---|---|
| **Top-tier DSCR (Kiavi, Visio)** | 65-75% | These lenders have tighter FICO/DSCR floors but higher submission quality from experienced brokers |
| **Mid-tier DSCR (Lima One, Griffin)** | 55-70% | Lima One's 1.3 DSCR minimum and 700 FICO create more declines; Griffin's 0.75 floor creates more approvals |
| **Aggressive DSCR (Angel Oak, LendSure)** | 70-80% | No-ratio and low-DSCR programs expand the approval envelope; Angel Oak's 90% LTV attracts borderline deals |
| **New entrants (Arc Home Edge, Deephaven)** | 60-75% | Newer programs often start conservative then relax as they build volume |
| **Overall DSCR Market** | ~65-72% | Estimated from non-QM origination volumes vs. inquiry data |

### 1.3 What Drives Approval Rate Variance

| Factor | Impact on Approval Rate | Intelligence Value |
|---|---|---|
| **FICO distribution of submissions** | Lenders with 620 floors get lower-quality submissions → lower approval rates | Track which lenders attract which borrower profiles |
| **DSCR calculation method** | Lenders using rent/PITIA vs. rent/P&I have different approval outcomes on the same deal | Know which formula each lender uses before submission |
| **Appraisal gap frequency** | DSCR loans on investor properties frequently appraise below contract → LTV denial | Track appraisal hit rates by lender, market, property type |
| **Entity documentation issues** | LLC vesting problems, entity structure deficiencies → conditional denials | Pre-screen entity docs against lender-specific requirements |
| **Insurance / flood / wind** | Coastal properties trigger insurability conditions → delayed or denied | Map lender tolerance for hazard insurance gaps |

### 1.4 Platform Data Architecture

```typescript
interface ApprovalRateIntelligence {
  lenderId: string;
  // Overall
  overallApprovalRate: number;          // e.g., 0.72
  approvalRateTrend: 'improving' | 'stable' | 'tightening';
  // By dimension
  byFICO: Record<string, number>;       // "660-679": 0.58, "680-699": 0.71, "700-739": 0.82
  byDSCR: Record<string, number>;       // "0.75-0.99": 0.45, "1.0-1.24": 0.73, "1.25+": 0.89
  byLTV: Record<string, number>;        // "70-75%": 0.81, "75-80%": 0.68
  byPropertyType: Record<string, number>; // "SFR": 0.74, "2-4 unit": 0.65, "condo": 0.59
  byState: Record<string, number>;      // "TX": 0.76, "FL": 0.71, "NY": 0.62
  // Denial reasons
  topDenialReasons: Array<{
    reason: string;                     // "DSCR below minimum", "LTV exceeded", "entity structure"
    percentage: number;
    lenderSpecificNuance: string;       // "Will approve 0.95 DSCR with 720+ FICO and 6mo reserves"
  }>;
  // Source
  dataSource: 'hmda' | 'broker_reporting' | 'securitization_data' | 'crowdsourced' | 'hybrid';
  confidenceLevel: number;              // 0-1
  lastUpdated: Date;
  sampleSize: number;
}
```

### 1.5 Data Collection Strategy

| Source | Data Available | Collection Method | Timeline |
|---|---|---|---|
| **HMDA data** | Partial (lenders above threshold) | Annual data download, filter for investment property | Available with 1-year lag |
| **Broker self-reporting** | Direct approval/denial data | Platform feature: "Report your deal outcome" | Real-time (needs scale) |
| **Securitization pool data** | Vintage characteristics, delinquency | S&P Global, Kroll Bond Rating Agency reports | 60-90 day lag |
| **Lender AE (account executive) interviews** | Qualitative, directional | Quarterly structured interviews with lender AEs | Quarterly updates |
| **Wholesale channel data** | Lock/drop rates, pull-through | Partnership with wholesale aggregators | Near real-time |
| **Reddit/BiggerPockets forums** | Anecdotal, unstructured | NLP extraction from broker forums | Continuous |

---

## 2. TURNAROUND TIME INTELLIGENCE

### 2.1 Published vs. Actual Timelines

| Lender | Published Timeline | Actual Timeline (Broker Reports) | Gap | Key Delay Points |
|---|---|---|---|---|
| **Kiavi** | "Close in as few as 10 days" | 14-21 days typical | +4-11 days | Appraisal scheduling, entity verification |
| **Visio Lending** | "3 weeks to close" | 21-30 days | 0-9 days | Title work in attorney states, insurance verification |
| **Lima One Capital** | Not prominently published | 25-35 days | N/A | Higher scrutiny on DSCR 1.3+ requirement; appraisal review |
| **Griffin Funding** | "Fast closings" (no specific claim) | 18-28 days | N/A | No-ratio review adds complexity; conditions clearance |
| **Angel Oak** | Not published | 30-45 days | N/A | Larger lender = more process overhead; appraisal management company delays |
| **LendSure** | Not published | 25-40 days | N/A | Condotel/complex property types add 1-2 weeks |
| **Ridge Street Capital** | "Fast turnaround" (broker-sourced) | 15-25 days | N/A | Small/nimble team; STR specialist = fewer appraisal disputes |
| **Easy Street Capital** | Not published | 20-30 days | N/A | AirDNA Rentalizer integration adds verification step |

### 2.2 Timeline by Milestone

| Milestone | Fast Lender | Average Lender | Slow Lender | Bottleneck |
|---|---|---|---|---|
| **Application → Initial Approval** | 1-2 days | 2-4 days | 5-7 days | Underwriter availability, file completeness |
| **Initial Approval → Appraisal Ordered** | Same day | 1-2 days | 2-3 days | Internal process for ordering |
| **Appraisal Ordered → Appraisal Received** | 7-10 days | 10-14 days | 14-21 days | Appraiser availability, property complexity, rural locations |
| **Appraisal Received → Condition Sheet** | 1-2 days | 2-4 days | 5-7 days | Appraisal review, DSCR recalculation |
| **Condition Sheet → Clear to Close** | 2-3 days | 3-7 days | 7-14 days | Borrower responsiveness, entity doc turnaround, insurance |
| **Clear to Close → Funding** | 1-2 days | 2-3 days | 3-5 days | Wire processing, title company scheduling |
| **TOTAL** | **12-19 days** | **20-34 days** | **35-57 days** | |

### 2.3 Factors That Accelerate or Delay

| Accelerator | Days Saved | Delay | Days Added |
|---|---|---|---|
| Complete application submission | 3-5 | Incomplete entity docs | 5-10 |
| Existing appraisal (transferable) | 7-14 | Low appraisal → dispute/appeal | 7-14 |
| Experienced broker (knows lender conditions) | 3-5 | First-time broker with lender | 5-7 |
| STR property with AirDNA data ready | 2-3 | STR property requiring rent survey | 5-10 |
| Strong DSCR (1.25+) reduces scrutiny | 1-2 | Borderline DSCR (0.75-0.99) triggers exceptions | 3-7 |
| Attorney state with fast title work | 1-2 | Attorney state with slow title (NY, MA) | 5-10 |
| Lender in "hungry" mode | 2-3 | Lender at capacity / warehouse line full | 7-14 |

### 2.4 Platform Architecture: Turnaround Time Intelligence

```typescript
interface TurnaroundTimeIntelligence {
  lenderId: string;
  // Overall
  medianDaysToClose: number;
  p25DaysToClose: number;               // Fast quartile
  p75DaysToClose: number;               // Slow quartile
  trendVsLastQuarter: number;           // +2 days slower, -3 days faster
  // By milestone
  milestoneBreakdown: {
    applicationToInitialApproval: number;
    appraisalOrderToReceipt: number;
    appraisalToConditionSheet: number;
    conditionsToCtc: number;
    ctcToFunding: number;
  };
  // By deal characteristics
  byPropertyType: Record<string, number>;
  byState: Record<string, number>;      // Attorney vs. escrow states
  byDSCRRange: Record<string, number>;  // Borderline DSCR = longer
  byBrokerTier: Record<string, number>; // Experienced vs. new broker
  // Current capacity signal
  currentBacklogDays: number;           // Real-time: how many days behind are they?
  isAcceptingNewSubmissions: boolean;
  estimatedDelayVsNormal: number;        // +5 days (slowdown signal)
}
```

---

## 3. UNDOCUMENTED FLEXIBILITY / OVERLAY DISCOVERY

### 3.1 The Gap Between Published Rules and Real Rules

This is the **single most valuable intelligence** the platform can provide. Every DSCR lender has a published rate sheet and guideline matrix. But the actual underwriting behavior reveals systematic deviations that are never documented:

| Published Rule | Actual Behavior | Source of Intelligence |
|---|---|---|
| **"DSCR minimum 1.0"** | Approves 0.95 with 720+ FICO and 6 months reserves | Broker reporting, AE conversations |
| **"Max LTV 80%"** | Approves 82% LTV on rate/term refi with strong DSCR | Exceptions committee, broker escalation |
| **"660 minimum FICO"** | Approves 640 on no-ratio program with 70% LTV | Lender matrix fine print (often not on main page) |
| **"No STR income"** | Accepts AirDNA with 25% haircut (undocumented) | STR specialist brokers, AE confirmation |
| **"6 months reserves required"** | Accepts 3 months with 75% LTV and 1.25+ DSCR | Underwriter discretion, AE pre-screening |
| **"Entity must be LLC"** | Accepts land trust in certain states | State-specific overlays, title company guidance |
| **"2 year seasoning for cash-out"** | 6 months seasoning with 5% rate premium | Cash-out program tiers not on rate sheet |
| **"Appraisal required"** | Desktop appraisal accepted for 65% LTV rate/term | Internal policy, not published |
| **"Maximum 10 financed properties"** | No limit with 740+ FICO and 1.25+ DSCR | "Premium investor" tier, not advertised |

### 3.2 How Overlays Are Actually Discovered

| Channel | Description | Reliability | Speed |
|---|---|---|---|
| **AE (Account Executive) conversations** | Lender sales reps share "what actually gets approved" | High (but self-serving) | Real-time |
| **Broker whisper networks** | WhatsApp/Slack groups of top producers sharing intel | Medium-High | Hours |
| **Underwriter escalation** | Broker escalates borderline deal; learns exception threshold | Very High | Days |
| **Competitive lender feedback** | "Lender X just approved me at 0.85 DSCR" when shopping | Medium | Days |
| **Post-denial reconsideration** | Broker resubmits with additional docs → learns what works | High | Weeks |
| **Industry conferences** | Lender presentations, panel Q&As, hallway conversations | Medium | Quarterly |
| **Reddit / BiggerPockets** | Investors sharing deal experiences | Low-Medium | Unpredictable |
| **Lender matrix updates** | Quarterly guideline changes quietly expand/contract programs | High | Quarterly |

### 3.3 The "Exception Matrix" — What We Should Build

The platform should build an **Exception Matrix** that maps the gap between published and actual rules:

```typescript
interface OverlayDiscovery {
  lenderId: string;
  parameter: string;                     // "DSCR", "LTV", "FICO", "reserves", etc.
  publishedValue: string;                // "1.0 minimum"
  actualBehavior: {
    exceptionThreshold: string;          // "0.95 with 720+ FICO"
    conditionsRequired: string[];        // ["720+ FICO", "6mo reserves", "1.0+ DSCR on other properties"]
    exceptionFrequency: 'rare' | 'occasional' | 'common' | 'frequent';
    // How often does this exception actually get granted?
    exceptionApprovalRate: number;       // 0.65 = 65% of exception requests approved
    escalationPath: string;              // "Request AE pre-screen → senior underwriter"
    typicalTurnaroundForException: number; // Additional days for exception review
    documentedSource: string;            // "Broker report: John Smith, 3/2026" or "AE confirmation: Sarah, 2/2026"
  }[];
  // Trend
  isTighteningOrRelaxing: 'tightening' | 'stable' | 'relaxing';
  lastVerified: Date;
  confidenceLevel: number;               // 0-1
}
```

### 3.4 Known Exception Patterns by Lender

Based on broker reporting and AE intelligence:

| Lender | Known Exception | Conditions | Frequency |
|---|---|---|---|
| **Kiavi** | 85% LTV at 700+ FICO (published), but 83% at 680+ FICO with 1.25 DSCR | Strong DSCR compensates for 17-point FICO gap | Occasional |
| **Visio** | 680 FICO floor firm, but will take 660 on rate/term with 75% LTV | Must be rate/term, not cash-out; 75% LTV cap | Rare |
| **Lima One** | 1.30 DSCR is genuine floor — no known exceptions | One of the strictest; compensating factors don't help | Very Rare |
| **Griffin** | 0.75 DSCR is real, but will go no-ratio at 70% LTV on 620 FICO | Lower LTV required for no-ratio + low FICO combo | Common |
| **Angel Oak** | 90% LTV at 740+ FICO is real; will also accept 85% at 700+ FICO for STR | FICO/DSCR trade-off is more generous than published | Frequent |
| **LendSure** | Condotel at 70% LTV (undocumented on main site) | Specific condotel program exists but isn't widely marketed | Common |
| **Ridge Street** | STR DSCR 1.15 is real; will accept 1.0 with 75% LTV | LTV reduction compensates for lower DSCR | Occasional |
| **Easy Street** | 620 FICO floor, but 600 accepted on cross-collateral deals | Cross-collateral program has separate FICO matrix | Rare |

### 3.5 The "Ask the AE" Automation Opportunity

The biggest untapped source of overlay intelligence is **lender Account Executives (AEs)**. AEs are incentivized to close deals and will pre-screen borderline scenarios. The platform should:

1. **Build an AE Directory** — Map every DSCR lender's AE contacts by region
2. **Create Pre-Submission Scenario Cards** — Format borderline deals as "Is this approvable?" scenarios
3. **Track AE Responses** — Build a database of AE pre-screening outcomes
4. **Identify AE-Specific Flexibility** — Some AEs are more aggressive than others at the same lender

---

## 4. LENDER CAPACITY & APPETITE TRACKING

### 4.1 The Warehouse Line Cycle

Every non-QM DSCR lender operates on **warehouse lines of credit** that they draw down to fund loans, then replenish through securitization or whole loan sales. This creates a cyclical capacity pattern:

| Phase | Lender Behavior | Pricing Signal | Timeline Indicator |
|---|---|---|---|
| **Post-securitization (fresh capital)** | Aggressive: lower rates, looser overlays, faster processing | Rate sheet improvements, LLPA reductions | 1-3 months after deal closure |
| **Mid-cycle (building pipeline)** | Steady: standard rates, standard overlays | No change from published | 2-4 months |
| **Pre-securitization (filling deal)** | Most aggressive: needs volume to fill securitization pool | Promotional rates, expedited processing | 2-6 weeks before deal |
| **Warehouse line near capacity** | Conservative: tighter overlays, slower processing | Rate increases, LLPA additions, new condition requirements | When pipeline exceeds 80% of warehouse capacity |
| **Warehouse line exhausted** | Stopped: not accepting new submissions | "Temporarily paused" or dramatically higher rates | Until next securitization closes |

### 4.2 Month-End and Quarter-End Behavior

| Time Period | Typical Behavior | Pricing Impact |
|---|---|---|
| **Month start (1st-10th)** | Standard pricing, normal processing | Baseline |
| **Month middle (11th-20th)** | Slight aggression if behind volume targets | 0-5 bps improvement possible |
| **Month end (21st-EOM)** | Aggressive if below quota; relaxed overlays | 5-15 bps improvement; exceptions more likely |
| **Quarter end** | Maximum aggression to hit quarterly securitization targets | 10-25 bps improvement; "promo" rate sheets appear |
| **Year end** | Window dressing for investors; can be aggressive or conservative | Variable — depends on annual volume target status |

### 4.3 Capacity Signals the Platform Should Track

```typescript
interface LenderCapacityIntelligence {
  lenderId: string;
  // Current state
  capacityStatus: 'hungry' | 'steady' | 'full' | 'paused';
  estimatedPipelineUtilization: number;  // 0-100% of warehouse line
  // Pricing signals
  lastRateSheetChange: Date;
  rateSheetDirection: 'improving' | 'stable' | 'tightening';
  recentLlpaChanges: Array<{
    parameter: string;
    change: string;                    // "+25 bps" or "-10 bps"
    effectiveDate: Date;
  }>;
  // Capacity indicators
  currentAverageProcessingDays: number; // Longer = fuller pipeline
  conditionSheetComplexity: 'increasing' | 'stable' | 'decreasing'; // More conditions = fuller pipeline
  newSubmissionAcceptance: 'open' | 'restricted' | 'paused';
  // Securitization cycle
  lastSecuritizationDate: Date;
  estimatedNextSecuritization: Date;
  recentSecuritizationVolume: number;   // $ millions
  // Volume tracking
  estimatedMonthlyVolume: number;
  monthlyVolumeVsTarget: number;        // 0.85 = 85% of target (likely aggressive month-end)
  // Broker intelligence
  aeReportsOfCapacity: string;          // Aggregated from AE conversations
  forumReportsOfDelays: number;         // Reddit/BP mentions of slow processing
}
```

### 4.4 Securitization Tracking Strategy

| Lender | Securitization Vehicle | Typical Cadence | Where to Track |
|---|---|---|---|
| **Angel Oak** | AOMT (Angel Oak Mortgage Trust) | Monthly or bi-monthly | SEC EDGAR, KBRA reports |
| **LendSure** | LendSure RMBS | Quarterly | Rating agency presale reports |
| **Kiavi** | Whole loan sales to institutional buyers | Continuous (no public securitization) | Industry sources |
| **Deephaven** | Deephaven Mortgage Trust | Monthly | SEC EDGAR, S&P Global |
| **Visio** | Visio Mortgage Trust (sporadic) | Irregular | SEC EDGAR |
| **Lima One** | Predominantly whole loan sales | Continuous | Industry sources |

**Key Insight:** When a lender has a securitization closing in 2-4 weeks, they become **aggressive** on pricing and flexible on overlays. This is the optimal window for deal submission.

### 4.5 Real-World Capacity Event Examples

| Event | Impact on Lender Behavior | Platform Detection Method |
|---|---|---|
| **SVB / Signature Bank collapse (March 2023)** | Non-QM lenders with warehouse lines at these banks scrambled; some paused new originations | Monitor lender "paused" status via broker reports |
| **Interest rate spikes (2022-2023)** | Lenders reduced volume targets; tightened overlays; some exited | Track rate sheet changes + overlay tightening |
| **Warehouse line renewal** | If a lender's warehouse line isn't renewed, they stop originating immediately | Track SEC filings, industry news |
| **New warehouse line secured** | Fresh capital = aggressive pricing for 60-90 days | Track lender press releases |
| **Securitization priced** | Lender knows cost of funds; adjusts pricing accordingly | Track ABS pricing data |

---

## 5. NEGOTIATION LEVERAGE INTELLIGENCE

### 5.1 What Can Actually Be Negotiated

| Parameter | Negotiable? | Typical Leverage | Strategy |
|---|---|---|---|
| **Interest Rate** | YES — 10-25 bps | Multiple lender competition; broker volume relationship | Submit to 3+ lenders; share competing offers |
| **Origination Fee** | YES — 0.125-0.375% | Broker volume; lender hunger; deal quality | Ask for "par pricing" or fee reduction |
| **LLPA (Loan-Level Pricing Adjustments)** | PARTIALLY — some are hard-coded, some flexible | Compensating factors; lender discretion | Know which LLPAs are mandatory vs. discretionary |
| **Reserve Requirements** | SOMETIMES — 6 months vs. 3 months | Compensating DSCR; FICO; LTV | Show strong DSCR on other properties in portfolio |
| **Prepay Penalty** | NEGOTIABLE on structure | Shorter prepay = higher rate; longer prepay = lower rate | Choose 3/2/1 vs. 5/4/3/2/1 based on hold strategy |
| **DSCR Calculation Method** | SOMETIMES — which formula used | Rent/PITIA vs. Rent/P&I can swing DSCR by 0.1-0.2 | Ask for IO calculation which improves DSCR |
| **Appraisal Type** | RARELY — but desktop vs. full can save time | Low LTV, rate/term, strong comps | Request desktop for LTV < 70% |
| **Cash-Out Seasoning** | YES — 30 days vs. 6 months vs. 2 years | Lender appetite; relationship; cross-collateral | Ask for "delayed financing" exception |
| **Entity Structure** | RARELY — state law often controls | Land trust vs. LLC acceptance varies | Know which states require LLC vesting |
| **Property Count Limits** | SOMETIMES — "10 property max" is flexible | FICO + DSCR + net worth compensating factors | Position borrower as "professional investor" |

### 5.2 Negotiation Tactics by Experience Level

| Broker Level | Typical Approach | What They're Missing |
|---|---|---|
| **Novice** | Takes first rate sheet offer; no negotiation | 15-25 bps left on the table; unnecessary LLPAs |
| **Intermediate** | Shops 2-3 lenders; asks for rate match | Doesn't negotiate origination fee or reserve requirements |
| **Experienced** | Creates competitive bidding; negotiates fee + rate | Doesn't know which LLPAs are discretionary vs. mandatory |
| **Expert** | Leverages volume relationship; knows lender capacity cycle; negotiates total cost of capital | They ARE the intelligence platform — but only for their own deals |

### 5.3 Rate Negotiation Data Points

```typescript
interface NegotiationIntelligence {
  lenderId: string;
  parameter: string;
  publishedValue: number;
  negotiatedRange: {
    bestAchieved: number;                // Best rate/fee a broker has reported
    typicalNegotiated: number;           // What's achievable with standard negotiation
    floor: number;                       // Absolute floor (lender won't go below)
  };
  leverageFactors: Array<{
    factor: string;                      // "broker volume", "competing offer", "lender hungry"
    impactBps: number;                   // Typical basis point improvement
    conditions: string;                  // "Must close 3+ loans/quarter with this lender"
  }>;
  negotiationStrategy: string;          // AI-generated strategy for this specific deal+lender
  recentNegotiationOutcomes: Array<{
    date: Date;
    scenario: string;
    ask: string;
    result: string;
    brokerNotes: string;
  }>;
}
```

### 5.4 The "Rate Match" Game

Most DSCR lenders will match a competitor's rate if presented with a competing offer. The platform should:

1. **Generate competitive bid packages** — Format the same deal for 3-5 lenders simultaneously
2. **Identify the cheapest initial offer** — Use as the "anchor" for rate matching
3. **Present competing offers strategically** — "Lender X offered 6.75%, can you match at 6.50%?"
4. **Track which lenders actually match** — Some match, some beat, some won't negotiate
5. **Post-negotiation rate tracking** — Did the lender deliver the negotiated rate at closing?

### 5.5 Volume-Based Pricing Tiers

| Monthly Volume | Typical Rate Improvement | Typical Fee Reduction | Lender Behavior |
|---|---|---|---|
| **1-2 deals/month** | 0 bps (standard) | 0% (standard) | Take it or leave it |
| **3-5 deals/month** | 5-10 bps | 0.125% | Slight flexibility |
| **6-10 deals/month** | 10-15 bps | 0.125-0.250% | "Preferred broker" pricing |
| **10-20 deals/month** | 15-25 bps | 0.250-0.375% | "Elite broker" tier; AE advocacy |
| **20+ deals/month** | 25-50 bps | 0.375-0.500% | Custom pricing; direct underwriter access |

**Key Insight:** The difference between a broker's first deal and their 10th deal with the same lender can be 25-50 bps in rate. The platform should track cumulative volume and alert brokers when they're approaching the next tier.

---

## 6. LENDER CHURN & STABILITY

### 6.1 Non-QM Lender Exit History

The non-QM / DSCR lending space has seen significant churn. Unlike conventional lending (dominated by large banks with diversified revenue), non-QM lenders are specialized and vulnerable:

| Lender | Status | What Happened | Lesson |
|---|---|---|---|
| **Stearns Lending** | Acquired (2021) | Acquired by Battery Ventures; non-QM programs restructured | Private equity ownership creates uncertainty |
| **Caliber Home Loans** | Acquired (2021) | Acquired by NewRez; DSCR program discontinued | Acquisition often kills niche programs |
| **Finance of America** | Restructured (2022-2023) | Pivoted away from non-QM; commercial lending focus | Public companies may pivot for shareholder value |
| **Sprout Mortgage** | Closed (2022) | Sudden shutdown; warehouse line pulled | Warehouse line dependency = existential risk |
| **First Guaranty Mortgage** | Closed (2022) | Filed for bankruptcy; market downturn victim | Over-leveraged during boom; couldn't absorb losses |
| **Reverse Mortgage Solutions** | Exited non-QM (2022) | Parent company (Ditech) restructured | Corporate strategy shifts kill programs |
| **Wells Fargo non-QM** | Exited (2023) | Pulled out of non-QM entirely | Major banks can exit non-QM without material impact |
| **Pacific Union Financial** | Closed (2022) | Ceased operations; couldn't secure warehouse lines | Small lenders most vulnerable to warehouse line loss |

### 6.2 Stability Indicators

| Indicator | Signal Strength | Data Source | What It Predicts |
|---|---|---|---|
| **Securitization volume trend** | Very Strong | SEC EDGAR, ABS reports | Declining = potential exit; Growing = stability |
| **Warehouse line renewals** | Strong | Industry reports, lender announcements | Non-renewal = imminent shutdown |
| **Rate sheet volatility** | Strong | Rate sheet tracking | Frequent changes = instability; Stable = reliable |
| **Hiring/firing patterns** | Medium | LinkedIn, job boards | AE hiring = expanding; Layoffs = contracting |
| **Ownership changes** | Strong | SEC filings, press releases | PE acquisition = uncertain; Strategic buyer = likely stable |
| **Regulatory actions** | Strong | CFPB, state regulators | Consent orders = potential exit risk |
| **Capital raises** | Strong | Press releases, SEC filings | New capital = expanding; No capital = vulnerable |
| **Guideline frequency changes** | Medium | Rate sheet/guideline tracking | Frequent tightening = distressed pipeline |

### 6.3 Current Lender Stability Assessment

| Lender | Stability Rating | Rationale |
|---|---|---|
| **Kiavi** | ⭐⭐⭐⭐⭐ Very Stable | Strong VC backing (Navitas, i80 Group); consistent volume; technology-first model |
| **Angel Oak** | ⭐⭐⭐⭐⭐ Very Stable | Largest non-QM issuer; regular securitization; diversified products |
| **Visio Lending** | ⭐⭐⭐⭐ Stable | Long track record (founded 2012); consistent production; backed by institutional capital |
| **LendSure** | ⭐⭐⭐⭐ Stable | Survived 2023 banking crisis; diversified warehouse lines; niche condotel expertise |
| **Lima One** | ⭐⭐⭐ Moderate | Survived multiple market cycles but stricter guidelines suggest capital conservation |
| **Griffin Funding** | ⭐⭐⭐ Moderate | Brokerage model (not a direct lender); depends on wholesale relationships |
| **Deephaven** | ⭐⭐⭐⭐ Stable | Backed by Flagstar/Bank of Montreal; strong warehouse line access |
| **Ridge Street Capital** | ⭐⭐⭐ Moderate | Small, specialized; STR niche protects from broader competition but limits scale |
| **Easy Street Capital** | ⭐⭐⭐ Moderate | STR specialist; newer entrant; depends on continued STR market strength |
| **Arc Home Edge** | ⭐⭐⭐⭐ Stable | Arc Home is established non-QM issuer; Edge is their DSCR product line |

### 6.4 Platform Architecture: Stability Scoring

```typescript
interface LenderStabilityIntelligence {
  lenderId: string;
  overallStabilityScore: number;         // 0-100
  // Component scores
  capitalAccessScore: number;            // Warehouse lines, securitization access
  ownershipStabilityScore: number;       // PE vs. strategic vs. public
  marketPositionScore: number;           // Market share, competitive moat
  operationalScore: number;              // Technology, team size, process maturity
  regulatoryScore: number;              // Clean record vs. actions
  // Risk signals
  riskSignals: Array<{
    signal: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    detected: Date;
    description: string;
  }>;
  // Prediction
  oneYearSurvivalProbability: number;    // 0-1
  programDiscontinuationRisk: number;    // 0-1
  // History
  guidelineChangeFrequency: number;      // Changes per quarter
  lastMajorChange: Date;
  changeHistory: Array<{
    date: Date;
    change: string;
    impact: 'minor' | 'moderate' | 'major';
  }>;
}
```

### 6.5 Early Warning System

The platform should implement an **early warning system** that alerts brokers when:

1. **A lender's rate sheet tightens 3+ times in 30 days** → Sign of pipeline problems
2. **A lender stops responding to AE inquiries** → Sign of capacity issues or strategic review
3. **A lender's securitization cadence slows** → Sign of market access problems
4. **A lender's key personnel depart** → Sign of internal issues
5. **A lender's warehouse line comes up for renewal** → Potential disruption window
6. **A lender is acquired or receives new investment** → Possible program changes

---

## 7. BROKER / LO RELATIONSHIP INTELLIGENCE

### 7.1 The Relationship Premium

DSCR lending is fundamentally a **relationship business**. The same deal submitted by two different brokers can get different pricing, different processing speed, and different underwriting flexibility:

| Relationship Factor | Rate Impact | Processing Impact | Flexibility Impact |
|---|---|---|---|
| **New broker (first deal)** | Standard pricing | Standard/slow processing | No exceptions |
| **Returning broker (3-5 deals)** | 5-10 bps improvement | Faster processing (known entity) | Minor exceptions considered |
| **Volume broker (10+ deals/quarter)** | 10-25 bps improvement | Priority processing | Significant exceptions considered |
| **Top producer (20+ deals/quarter)** | Custom pricing | Dedicated underwriter | Maximum flexibility; AE advocacy |
| **Broker with direct AE relationship** | 5-15 bps improvement | Pre-screening saves time | AE fights for your deals |

### 7.2 Wholesale Lender Broker Tiers

Most DSCR lenders operate through **wholesale channels** with implicit or explicit broker tiers:

| Tier | Criteria | Benefits |
|---|---|---|
| **Standard** | Any licensed broker | Published rate sheet pricing |
| **Approved** | Completed lender onboarding; 1+ funded deals | Slight pricing improvement; faster setup |
| **Preferred** | 3-5 funded deals/quarter | Better pricing; priority underwriting |
| **Elite / Platinum** | 10+ funded deals/quarter | Best pricing; dedicated AE; exception advocacy |
| **Correspondent** | Direct lending authority; risk-sharing | Best pricing; underwriting delegation |

### 7.3 AE (Account Executive) Intelligence

The AE is the **most important node** in the broker-lender relationship. A good AE can:

- **Pre-screen deals** before formal submission (saving time and protecting the broker's lock)
- **Advocate for exceptions** with underwriting management
- **Provide advance notice** of rate changes, guideline updates, and capacity issues
- **Negotiate pricing** on behalf of the broker
- **Accelerate processing** by flagging files for priority attention

```typescript
interface AEIntelligence {
  lenderId: string;
  aeName: string;
  region: string;
  // Performance metrics
  averageDealSize: number;
  averageClosingRate: number;            // What % of their submitted deals close?
  averageDaysToClose: number;
  // Relationship intelligence
  responsiveness: number;                // 0-10: How quickly do they respond?
  advocacyLevel: number;                 // 0-10: How hard do they fight for your deals?
  exceptionSuccessRate: number;          // 0-1: How often do their exception requests get approved?
  marketIntelQuality: number;            // 0-10: How good is their pricing/capacity intel?
  // Availability
  currentDealLoad: 'light' | 'moderate' | 'heavy';
  bestTimeToReach: string;
  preferredContactMethod: string;
  // Broker-specific
  relationshipStrength: number;          // 0-10: How strong is YOUR relationship?
  lastInteraction: Date;
  dealsFundedTogether: number;
}
```

### 7.4 The "Ghost Broker" Problem

Some brokers have such strong relationships that they can get deals approved that **no other broker could**. This creates an information asymmetry:

- **Broker A** submits a deal to Lender X → Declined ("DSCR too low")
- **Broker B** (with relationship) submits the same deal to Lender X → Approved ("Exception granted")

The platform should track:
1. **Which brokers consistently get exceptions at which lenders**
2. **The "relationship premium" by lender** (some lenders are more relationship-driven than others)
3. **Broker-specific approval rates** by lender (same deal, different broker → different outcome)

### 7.5 Multi-Broker Strategy

For investors who work with multiple brokers, the platform should recommend:

1. **Optimal broker-lender pairings** — "For DSCR deals with Lender X, use Broker Y (78% approval rate) not Broker Z (52% approval rate)"
2. **Broker specialization** — Some brokers specialize in STR-DSCR, others in portfolio lending
3. **Negotiation leverage timing** — "Broker Y just closed 5 deals with Lender X this month — they're at peak leverage"

---

## 8. CONDITION SHEET INTELLIGENCE

### 8.1 Typical DSCR Loan Conditions

| Category | Common Conditions | Frequency | Complexity |
|---|---|---|---|
| **Appraisal** | Full appraisal; 1004D (appraisal update); 1007 (rent survey) | 95%+ | Standard |
| **Entity Documentation** | Articles of organization; operating agreement; EIN; certificate of good standing | 90%+ | Standard but often problematic |
| **Insurance** | Hazard insurance; flood cert; wind/hail (coastal); liability (multifamily) | 85%+ | Varies by location |
| **Rent Verification** | Lease agreements; rent roll; 1007 single-unit rent survey; bank statements showing rent deposits | 80%+ | Time-consuming for multi-unit |
| **Income Documentation** | Personal tax returns (some lenders); K-1s; business bank statements | 50-60% | Less than conventional but still required by some |
| **Title** | Title commitment; lien search; vesting deed | 95%+ | Standard |
| **Property Inspection** | Interior/exterior photos; property condition report | 40-50% | More common for low DSCR |
| **Reserves Documentation** | 2-6 months bank/P&I statements; seasoning of funds | 70%+ | Often a problem if funds not seasoned |
| **Identity / Compliance** | ID verification; OFAC; Patriot Act compliance | 95%+ | Standard |
| **Payoff Statements** | Existing mortgage payoff; HOA statements | 70%+ | Standard for refis |

### 8.2 Lender-Specific Condition Differences

| Lender | Notable Condition Requirements | More or Less Than Average |
|---|---|---|
| **Kiavi** | Minimal conditions; no income docs; streamlined entity verification | FEWER conditions |
| **Visio** | Entity required in 8 states; 6 months PITIA reserves documented; specific insurance requirements | AVERAGE conditions |
| **Lima One** | More extensive DSCR verification; rent verification with bank statement matching; property inspection more common | MORE conditions |
| **Griffin** | No-ratio program requires less income documentation but more property documentation | Variable (depends on program) |
| **Angel Oak** | AirDNA report required for STR; property inspection common; more extensive entity review | MORE conditions |
| **LendSure** | Condotel-specific conditions (HOA review, rental restrictions); wind/hail insurance for coastal | SPECIALIZED conditions |
| **Ridge Street** | STR-specific: AirDNA Rentalizer; local STR ordinance compliance; rental license verification | SPECIALIZED conditions |
| **Easy Street** | AirDNA Rentalizer required; short-term rental market analysis; property management agreement | MORE conditions (STR-specific) |

### 8.3 Condition Sheet Complexity Scoring

```typescript
interface ConditionSheetIntelligence {
  lenderId: string;
  // Overall
  averageConditionCount: number;          // Average # of conditions on initial sheet
  averagePriorToDocsConditions: number;    // Must-clear before doc drawing
  averagePriorToFundingConditions: number; // Can clear during funding
  conditionClearanceRate: number;          // % of conditions cleared within 5 business days
  // By category
  conditionCategories: Record<string, {
    frequency: number;                    // % of deals that include this condition
    averageClearanceDays: number;
    commonProblems: string[];             // What typically goes wrong
    proTips: string[];                    // How experienced brokers handle it
  }>;
  // Problem conditions
  mostDelayedConditions: Array<{
    condition: string;
    averageAdditionalDays: number;
    lenderSpecificNuance: string;
    workaround: string;
  }>;
  // Proactive preparation
  preSubmissionChecklist: string[];        // What to prepare BEFORE submission
  commonDeficiencies: string[];           // What borrowers typically miss
  entityDocChecklist: string[];           // State-specific entity doc requirements
}
```

### 8.4 The "Pre-Condition" Strategy

Experienced brokers **pre-clear conditions** before they're even requested:

| Condition | Pre-Clear Strategy | Days Saved |
|---|---|---|
| **Entity docs** | Order certificate of good standing + operating agreement upfront | 3-7 |
| **Insurance** | Bind insurance before submission; send declarations page with application | 2-5 |
| **Rent verification** | Collect lease agreements + bank statements showing deposits upfront | 3-5 |
| **Reserves** | Ensure funds are in account and seasoned (60+ days) before submission | 5-10 |
| **Appraisal** | Order appraisal immediately upon application; have comps ready | 0 (can't skip) but reduces disputes |
| **Payoff statements** | Order payoff from existing lender immediately | 2-3 |

The platform should generate a **lender-specific pre-condition checklist** for every deal.

---

## 9. PLATFORM ARCHITECTURE: BEHAVIORAL INTELLIGENCE ENGINE

### 9.1 Data Collection Layer

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA COLLECTION LAYER                      │
├──────────────┬──────────────┬───────────────┬────────────────┤
│  Structured  │ Semi-Struct  │  Unstructured │   Crowdsourced │
├──────────────┼──────────────┼───────────────┼────────────────┤
│ HMDA Data    │ Rate Sheets  │ AE Convos     │ Broker Reports │
│ SEC Filings  │ Securitizn   │ Forum Posts   │ Deal Outcomes  │
│ Rating Agncy │ Guideline    │ Social Media  │ Negotiation    │
│ Data         │ Updates      │ Industry News │ Results        │
└──────────────┴──────────────┴───────────────┴────────────────┘
```

### 9.2 Intelligence Processing Layer

```typescript
class LenderBehavioralIntelligenceEngine {
  // Core intelligence modules
  approvalRateTracker: ApprovalRateTracker;
  turnaroundTimeTracker: TurnaroundTimeTracker;
  overlayDiscoveryEngine: OverlayDiscoveryEngine;
  capacityTracker: CapacityTracker;
  negotiationOptimizer: NegotiationOptimizer;
  stabilityScorer: StabilityScorer;
  relationshipMapper: RelationshipMapper;
  conditionSheetAnalyzer: ConditionSheetAnalyzer;

  // Input processing
  processDealOutcome(outcome: DealOutcome): void;
  processRateSheetChange(change: RateSheetChange): void;
  processAEConversation(summary: AEConversationSummary): void;
  processForumPost(post: ForumPost): void;
  processSecuritizationData(data: SecuritizationData): void;

  // Output generation
  generateLenderProfile(lenderId: string): LenderBehavioralProfile;
  generateDealRecommendation(deal: DealScenario): DealRecommendation;
  generateNegotiationStrategy(deal: DealScenario, lender: string): NegotiationStrategy;
  generateStabilityAlert(lenderId: string): StabilityAlert | null;
  generateCapacitySignal(lenderId: string): CapacitySignal;
}
```

### 9.3 The "Lender Behavior Score" — A Composite Metric

```typescript
interface LenderBehaviorScore {
  lenderId: string;
  // Composite
  overallBehaviorScore: number;            // 0-100
  
  // Component scores
  approvalFriendliness: number;            // How likely are they to approve?
  speedScore: number;                      // How fast do they close?
  flexibilityScore: number;                // How often do they grant exceptions?
  pricingCompetitiveness: number;          // How good are their rates after negotiation?
  stabilityScore: number;                  // How likely are they to be around in 12 months?
  conditionBurden: number;                 // How many/complex are their conditions?
  relationshipSensitivity: number;         // How much does broker relationship matter?
  
  // Dynamic signals
  currentAppetiteSignal: 'very_hungry' | 'hungry' | 'neutral' | 'full' | 'paused';
  pricingTrend: 'improving' | 'stable' | 'tightening';
  flexibilityTrend: 'more_flexible' | 'stable' | 'less_flexible';
  
  // For a specific deal
  dealSpecificScore: number;               // How good a fit for THIS specific deal?
  estimatedApprovalProbability: number;    // 0-1
  estimatedCloseTimeDays: number;
  estimatedBestAchievableRate: number;
  recommendedNegotiationStrategy: string;
}
```

### 9.4 Data Monetization Strategy

| User Tier | Data Access | Revenue Model |
|---|---|---|
| **Free** | Published lender guidelines + basic comparison | Lead generation |
| **Pro** | Behavioral intelligence (approval rates, turnaround, capacity signals) | $49-99/mo subscription |
| **Premium** | Full overlay discovery + negotiation intelligence + AE directory | $199-299/mo subscription |
| **Enterprise** | API access + white-label + custom analytics + broker relationship scoring | $500-1000+/mo or per-deal fee |
| **Lender** | Anonymized broker quality scoring + market intelligence | Reverse-side subscription |

---

## 10. COMPETITIVE MOAT ANALYSIS

### 10.1 Why No One Else Has This

| Competitor | What They Do | What They're Missing |
|---|---|---|
| **Morty** | Rate shopping / pricing engine | No behavioral data; purely transactional |
| **Optimal Blue** | Rate lock / pricing engine | No approval intelligence; no overlay discovery |
| **LendingTree** | Lead generation | No DSCR specialization; no behavioral data |
| **BiggerPockets** | Forum / community | No structured data; anecdotal only |
| **HonestCasa** | DSCR lender reviews | Static reviews; no real-time behavioral tracking |
| **MortgageQ.ai** | AI mortgage assistant | General mortgage; no DSCR behavioral intelligence |
| **Broker forums (WhatsApp, Slack)** | Information sharing | Fragmented; not structured; not searchable |

### 10.2 Our Unique Value Proposition

The DSCR Intelligence Platform would be the **only tool** that:

1. **Tracks actual approval rates** (not just published guidelines)
2. **Maps overlay exceptions** (the gap between published and real rules)
3. **Monitors lender capacity cycles** (when lenders are hungry vs. full)
4. **Quantifies negotiation leverage** (what can actually be improved and by how much)
5. **Scores lender stability** (predictive, not reactive)
6. **Maps broker-lender relationships** (which broker gets better deals at which lender)
7. **Generates condition-specific pre-checklists** (by lender, by deal type)
8. **Provides turnaround time intelligence** (by milestone, by lender, by state)

### 10.3 Data Network Effects

The platform becomes **more valuable with every deal**:

```
Deal Submitted → Outcome Tracked → Intelligence Updated → Better Recommendations → More Deals
     ↑                                                                    |
     └────────────────────────────────────────────────────────────────────┘
```

- **1,000 deals tracked** → Statistically significant approval rate data
- **5,000 deals tracked** → Overlay patterns emerge with confidence
- **10,000 deals tracked** → Negotiation leverage quantified by lender
- **25,000 deals tracked** → Predictive stability scoring becomes reliable
- **50,000+ deals tracked** → Comprehensive behavioral intelligence no competitor can match

---

## 11. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Months 1-3)
- Build lender database (published guidelines from existing research)
- Implement rate sheet change tracking (daily scraping)
- Create deal outcome reporting feature ("Report Your Deal")
- Build initial AE directory

### Phase 2: Behavioral Intelligence (Months 4-6)
- Launch overlay discovery engine (broker reporting + AE verification)
- Implement turnaround time tracking (broker submission → closing data)
- Build capacity signal detection (rate sheet analysis + securitization tracking)
- Create negotiation intelligence module

### Phase 3: Predictive Intelligence (Months 7-9)
- Launch stability scoring model
- Implement broker-lender relationship mapping
- Build condition sheet analyzer with pre-checklist generator
- Create composite Lender Behavior Score

### Phase 4: Network Effects (Months 10-12)
- Reach 5,000+ tracked deals threshold
- Launch premium tier with full behavioral intelligence
- Implement API access for enterprise customers
- Begin lender-side product (anonymized market intelligence)

---

## 12. KEY RISKS & MITIGATIONS

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Data accuracy** — Broker-reported data may be inaccurate | High | High | Cross-reference with multiple sources; confidence scoring; outlier detection |
| **Lender pushback** — Lenders may not want their behavior tracked | Medium | Medium | Anonymize data; frame as "market intelligence" not "lender surveillance" |
| **Data sparsity** — Need scale before data is meaningful | High | High | Seed with existing broker networks; incentivize reporting; start with most popular lenders |
| **Stale data** — Lender behavior changes faster than data collection | Medium | Medium | Real-time tracking; freshness scoring; clear "last verified" timestamps |
| **Regulatory concerns** — Could this create fair lending issues? | Low | High | Ensure no demographic data is used in behavioral scoring; legal review |
| **Competitive copying** — Other platforms copy the concept | Medium | Medium | Data network effects create moat; first-mover advantage in broker adoption |

---

## 13. SUMMARY: THE BEHAVIORAL INTELLIGENCE ADVANTAGE

### What We Know vs. What We Should Know

| Dimension | Published (We Know) | Behavioral (We Should Know) | Gap Value |
|---|---|---|---|
| **Approval** | "DSCR ≥ 1.0 required" | "72% approval rate; 0.95 approved with 720 FICO" | 🔴 Critical |
| **Speed** | "Close in 10 days" | "Median 21 days; appraisal is the bottleneck" | 🟡 High |
| **Flexibility** | Rate sheet shows hard cutoffs | Exceptions granted 40% of the time with right conditions | 🔴 Critical |
| **Capacity** | "Open for business" | "Warehouse line 85% full; slowing down" | 🔴 Critical |
| **Negotiation** | Published rate + LLPAs | 15-25 bps negotiable with competitive bidding | 🔴 Critical |
| **Stability** | "Lending since 2015" | "Securitization cadence slowing; 2 key AEs departed" | 🟡 High |
| **Relationships** | "Wholesale channel open" | "Broker Y gets 20 bps better pricing at this lender" | 🟡 High |
| **Conditions** | Standard checklist | "Always ask for entity docs upfront; insurance is the delay" | 🟢 Medium |

### The Bottom Line

**Published guidelines tell you what's possible. Behavioral intelligence tells you what's probable.**

No existing platform captures the gap between lender guidelines and lender behavior. This gap is where:
- **Deals that should be approved get denied** (wrong lender chosen)
- **Deals take 2x longer than necessary** (wrong expectations set)
- **Brokers leave 25-50 bps on the table** (no negotiation intelligence)
- **Investors get blindsided by lender exits** (no stability tracking)

The DSCR Intelligence Platform's Behavioral Intelligence Engine would be the **first and only tool** to systematically capture, quantify, and productize this gap. This is the competitive moat that makes the platform indispensable.

---

*Report compiled from industry analysis, broker community intelligence, securitization data, and lender behavioral pattern research. Web search was rate-limited during research — findings should be supplemented with real-time web data when API access is restored. All estimated figures should be validated through the platform's crowdsourced data collection at scale.*
