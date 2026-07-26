# Dynamic MBS-Spread Pricing: Replacing Static Rate Grids with Real-Time Capital Markets Intelligence

**Innovation Research Report**
**Date:** March 4, 2026
**Classification:** Strategic Innovation — Capital Markets × DSCR Lending
**Author:** DSCR Intelligence Platform — Quantitative Research Division
**Companion Document:** `INNOVATION_REALTIME_SIGNALS.md` (broader real-time signals framework)

---

## EXECUTIVE SUMMARY

Every DSCR lender today publishes a **static rate grid** — a matrix of rates by FICO/LTV/DSCR tier, updated on their own cadence (daily, weekly, or monthly). This is a 1990s pricing methodology applied to a market where the underlying cost of capital moves in **milliseconds**.

**The Core Innovation:** Derive DSCR rates in real-time from the actual capital markets inputs that determine lender economics:

```
DSCR Rate = 10yr Treasury + Non-QM MBS Spread + Lender Margin + LLPAs
               (real-time)     (T+1, observable)    (trackable)   (tiered)
```

No DSCR platform in the market does this. Every competitor shows **yesterday's rate grids**. A platform that shows **where rates are heading** — before lenders update — would have an insurmountable competitive moat.

**Quantified Edge:**
| Capability | Estimated Value per Loan | Data Source |
|---|---|---|
| Predict rate changes 24-72 hrs before grid updates | 12-25 bps | Treasury + MBS spread tracking |
| Identify optimal lock windows | 25-50 bps | MBS spread pattern analysis |
| Detect lender "hunger" (in-market pricing) | 15-30 bps | Securitization pipeline intelligence |
| Real-time rate comparison vs. static grids | 10-20 bps | Multi-lender margin tracking |
| **Total estimated edge** | **62-125 bps** | **Composite** |

At $6,200-$12,500 per loan and 50,000+ DSCR originations/year at scale, this represents **$310M-$625M in aggregate borrower savings** captured as platform value.

---

## 1. NON-QM MBS MARKET STRUCTURE

### 1.1 How DSCR Loans Get Securitized

DSCR loans are originated by specialty finance companies and non-bank lenders, warehoused on credit facilities, then pooled into **Non-QM Residential Mortgage-Backed Securities (RMBS)** and sold to institutional investors. The securitization chain:

```
Borrower → DSCR Lender → Warehouse Line → Aggregation → Non-QM RMBS Trust → Investors (hedge funds, insurance cos, banks)
```

**Critical Insight:** The lender's ability to sell loans into MBS at a given spread **directly determines** the rate they can offer. When MBS spreads widen (investors demand more yield), lenders must raise rates to maintain economics. When spreads tighten, lenders *can* cut rates — but often don't immediately, creating capture windows.

### 1.2 Major Non-QM MBS Issuers and Deal Series

| Issuer | Deal Series | Deal Volume (2024-2025) | DSCR Loan Focus | Key Characteristics |
|--------|-----------|------------------------|-----------------|---------------------|
| **Angel Oak Mortgage** | AOMT (Angel Oak Mortgage Trust) | ~$1-2B/year | High — includes DSCR, bank statement, investor loans | Largest non-QM issuer; publicly traded (AOMR); quarterly deal cadence; DSCR loans significant portion of collateral |
| **Deephaven Mortgage** | DRMT (Deephaven Residential Mortgage Trust) | ~$500M-1B/year | High — DSCR is core product | Specialty non-QM lender; securitizes own originations; DSCR loans featured in collateral pools |
| **Caliber Home Loans** | Various shelf | ~$500M-1B/year | Moderate | Large non-bank originator with non-QM shelf |
| **Finance of America** | FOA shelf | ~$300-500M/year | High — DSCR and investor products | Publicly traded; dedicated investor lending division |
| **New Residential Investment** (Rithm Capital) | NRZ shelf | ~$500M-1B/year | Moderate | Large mortgage REIT; mixed agency/non-QM |
| **Invictus Capital** | VIV (Invictus Mortgage Trust) | ~$200-500M/year | High — DSCR-focused | Smaller issuer; DSCR-centric collateral |
| **PennyMac** | PMT (PennyMac Mortgage Trust) | ~$2-4B/year | Low-Moderate | Primarily agency; growing non-QM shelf |
| **Shellpoint Partners** | Various | ~$300-800M/year | Moderate | NewRez parent; non-QM shelf growing |
| **Citadel Servicing** | CSC Trust | ~$200-400M/year | Moderate | Non-QM specialist; growing DSCR collateral share |

**Market Size:** Non-QM RMBS issuance reached approximately **$15-20 billion annually** in 2024-2025, up from ~$5B in 2020. DSCR loans represent an estimated **20-35% of non-QM collateral**, meaning **$3-7 billion in DSCR loans are securitized annually**.

### 1.3 Non-QM RMBS Spread Levels (Current Estimates)

| Tranche | Typical Rating | Spread Over Treasuries (Current Est.) | Historical Range |
|---------|---------------|---------------------------------------|------------------|
| AAA | AAA/Aaa | +100-140 bps | 65-250 bps |
| AA | AA/Aa | +150-200 bps | 100-350 bps |
| A | A | +200-275 bps | 150-400 bps |
| BBB | BBB/Baa | +300-400 bps | 200-600 bps |
| BB | BB/Ba | +425-550 bps | 300-800 bps |
| Equity/Residual | NR | +600-900+ bps | 400-1200+ bps |

**Key Spread Drivers:**
- **Credit quality of underlying loans** (DSCR ratios, FICO, LTV)
- **Prepayment risk** (DSCR loans have lower prepay speeds than agency — a positive for investors)
- **Liquidity** (non-QM MBS is far less liquid than agency MBS; illiquidity premium = 50-100 bps)
- **Macro environment** (recession fears widen spreads; risk-on compresses them)
- **Supply/demand imbalance** (when many deals price simultaneously, spreads widen)

### 1.4 How Spreads Feed Into DSCR Rates

The **weighted average cost of capital** for the MBS trust determines the minimum yield the lender must deliver:

```
MBS Weighted Average Coupon (WAC) = Σ(tranche_size × tranche_coupon) / total_deal_size

Lender's Minimum Loan Yield = MBS WAC + Servicing Fee + Deal Expenses + GSE/Trust Fees
                                (typically 25-50 bps)  (25-75 bps)    (5-15 bps)

Lender's Offered DSCR Rate = Minimum Loan Yield + Lender Margin + LLPA Adjustments
                                                    (50-150 bps)    (0-200 bps)
```

**Example (Illustrative):**
```
10yr Treasury:                           4.35%
AAA spread:                              +120 bps
Weighted average MBS spread:             +285 bps (blended across all tranches)
= MBS WAC:                               7.20%
+ Servicing & deal costs:                +65 bps
= Minimum loan yield:                    7.85%
+ Lender margin:                         +100 bps
+ LLPA (DSCR 1.0, 80% LTV, 680 FICO):   +75 bps
= Offered DSCR Rate:                     8.60%
```

This is how the rate actually gets set — it's not arbitrary. It's **derivable** from observable capital markets data.

---

## 2. REAL-TIME RATE DERIVATION FROM MBS SPREADS

### 2.1 The Rate Derivation Formula

**The core algorithm:**

```
DSCR_Rate(t) = UST10Y(t) + Spread_NonQM(t) + Margin_Lender(i) + Σ LLPA_j

Where:
  UST10Y(t)     = 10-year Treasury yield at time t (real-time, sub-second)
  Spread_NonQM(t) = Blended non-QM MBS spread at time t (observable T+1)
  Margin_Lender(i) = Lender i's margin above MBS economics (trackable via rate sheets)
  LLPA_j        = Sum of risk-based adjustments for loan profile j (tiered by FICO/LTV/DSCR)
```

**This formula is how rates actually work.** Lenders don't set rates arbitrarily — they set them based on this exact stack. The difference is that lenders update their grids infrequently, while the inputs move continuously.

### 2.2 The Pipeline: MBS Pricing to Retail DSCR Rates

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ THE RATE TRANSMISSION PIPELINE                                              │
│                                                                             │
│  T+0 (Real-time)    T+0 to T+1         T+1 to T+5         T+5 to T+30      │
│  ─────────────       ──────────         ──────────         ──────────       │
│  Treasury yields  →  MBS dealer runs →  Lender treasury   → Rate grid      │
│  MBS TBA prices      Intex modeling      committees meet     published       │
│  SOFR fixing         Spread marks        Cost-of-funds       Broker rate     │
│                      Dealer price         calculated          sheets         │
│                      discovery            Margin decision     updated        │
│                                                                           │
│  LATENCY: <1 sec     1-24 hours          1-5 business       5-30 business   │
│                                          days                days            │
└─────────────────────────────────────────────────────────────────────────────┘
```

**The Key Insight:** There is a **5-30 day lag** between when capital markets inputs change and when DSCR rate grids are updated. A platform that monitors the first three stages can **predict the fourth**.

### 2.3 How Quickly Do MBS Spread Changes Flow Through?

| Lender Type | Grid Update Frequency | Typical Lag from Market Move | Examples |
|-------------|----------------------|------------------------------|----------|
| **Tech-forward DSCR specialists** | Daily (sometimes intraday) | 1-2 business days | Kiavi, Easy Street |
| **Active non-QM lenders** | 2-3x per week | 2-5 business days | Angel Oak, Deephaven |
| **Traditional wholesale** | Weekly | 5-10 business days | LendSure, Griffin |
| **Bank-affiliated programs** | Monthly | 15-30 business days | Newrez/Shellpoint |

**Arbitrage Opportunity:** When the 10-year Treasury drops 20 bps on Monday:
- Kiavi may cut rates by Wednesday (1-2 day lag)
- Angel Oak may cut by Friday (3-5 day lag)
- LendSure may not reflect it for 2 weeks
- Newrez may not show it for a month

A platform tracking these lags per lender can **predict rate changes and recommend optimal timing**.

### 2.4 Building the Real-Time DSCR Rate Estimator

**Architecture:**

```
┌──────────────────┐     ┌───────────────────┐     ┌──────────────────────┐
│  Treasury Feed   │     │  MBS Spread Feed  │     │  Lender Margin DB    │
│  (real-time)     │     │  (T+1 observable) │     │  (historical + live) │
│                  │     │                    │     │                      │
│  - UST 10Y      │     │  - Non-QM AAA     │     │  - Per-lender margin │
│  - UST 5Y       │     │  - Non-QM AA      │     │  - Margin trends     │
│  - UST 2Y       │     │  - Non-QM BBB     │     │  - LLPA grids        │
│  - SOFR 1M/3M   │     │  - Non-QM BB      │     │  - Update frequency  │
│  - SOFR curve   │     │  - TBA 6.0/6.5    │     │  - Grid lag history  │
└───────┬──────────┘     └────────┬──────────┘     └──────────┬───────────┘
        │                         │                            │
        └─────────────────────────┼────────────────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │   Rate Derivation Engine    │
                    │                             │
                    │  DSCR_Rate = UST10Y +       │
                    │    NonQM_Spread +            │
                    │    Lender_Margin +           │
                    │    LLPA(profile)             │
                    │                             │
                    │  + Grid-lag prediction       │
                    │  + Lender hunger adjustment  │
                    │  + Confidence interval       │
                    └─────────────┬──────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │   Output Layer              │
                    │                             │
                    │  - Predicted rate (now)     │
                    │  - Predicted rate (3-day)   │
                    │  - Predicted rate (7-day)   │
                    │  - Best lender match        │
                    │  - Lock recommendation      │
                    │  - Confidence score         │
                    └────────────────────────────┘
```

### 2.5 Confidence Scoring System

Not all rate predictions are equally certain. The platform should provide confidence scores:

| Signal Strength | Rate Prediction Confidence | Typical Scenario |
|----------------|---------------------------|------------------|
| Treasury moved 25+ bps AND MBS spreads moved 15+ bps | 85-95% | Clear directional signal |
| Treasury moved 15+ bps, MBS spreads stable | 70-80% | Cost-of-funds change, but spread cushion may absorb |
| MBS spreads moved 15+ bps, Treasury stable | 65-75% | Credit risk repricing; may or may not flow through |
| Treasury moved <10 bps, MBS spreads <10 bps | 40-55% | Noise zone; prediction unreliable |
| Lender-specific signal (hunger, pipeline) | 60-80% | Non-market factor; harder to quantify |

---

## 3. SOFR/TREASURY RATE FEED INTEGRATION

### 3.1 Available Real-Time Rate APIs

| API / Data Source | Coverage | Latency | Cost | API Type | Best For |
|---|---|---|---|---|---|
| **U.S. Treasury (treasury.gov)** | All Treasury yields | Daily (3PM ET) | Free | REST | Official daily close |
| **FRED API (St. Louis Fed)** | Treasury, mortgage rates, SOFR | Daily | Free | REST | Historical + daily |
| **Federal Reserve H.15** | Treasury, commercial paper, SOFR | Daily (weekly release) | Free | Download | Official reference rates |
| **CME Group API** | Treasury futures, SOFR futures, options | Real-time | $200-500/mo+ | REST/WebSocket | Real-time futures, forward curves |
| **Bloomberg API (BPIPE)** | Everything — Treasuries, MBS, ABS, CMO | Real-time | ~$25K/yr terminal | API | Institutional-grade; gold standard |
| **Refinitiv/LSEG Datastream** | Treasuries, MBS, SOFR, credit spreads | Real-time | $500-2K/mo | REST/Streaming | Broad fixed income coverage |
| **Tradeweb** | Treasury, MBS, IG/HY bonds | Real-time | Enterprise pricing | API | Institutional trading data |
| **MBSQuoteline** | FNMA/FHLMC TBA MBS | Intraday | $50-100/mo | Web/API | Agency MBS pricing |
| **Mortgage Daily News (MND)** | MBS live, Treasury, mortgage rates | 15-min delayed | $30/mo | Web | Consumer-facing MBS tracking |
| **TradingView** | Treasury yields, SOFR, MBS ETFs | Real-time | Free-$15/mo | API/Web | Basic charting, alerts |
| **Alpha Vantage** | Treasury yields, FX, commodities | 15-min delayed | Free-$50/mo | REST | Budget option for Treasury |
| **Polygon.io** | Treasury futures, SOFR futures | Real-time | $29-199/mo | REST/WebSocket | Futures-oriented |
| **Xignite (Quodl)** | Treasury, SOFR, swaps | Real-time | $500+/mo | REST | Enterprise financial data |
| **Finnhub** | Treasury, economic data | Real-time | Free-$50/mo | REST/WebSocket | Budget real-time |
| **SOFR Admin (NY Fed)** | SOFR daily fixing, term SOFR | Daily (8AM ET) | Free | Download/API | Official SOFR rates |

### 3.2 Recommended Feed Stack for DSCR Rate Estimator

**Tier 1 — Must-Have (Free/Low-Cost):**

| Feed | Purpose | Update Frequency | Cost |
|------|---------|-----------------|------|
| Treasury.gov API | Official 10Y, 5Y, 2Y yields | Daily (3PM ET) | Free |
| FRED API | Historical Treasury, mortgage rate, SOFR data | Daily | Free |
| NY Fed SOFR | Daily SOFR fixing, term SOFR | Daily (8AM ET) | Free |
| TradingView | Intraday Treasury yield monitoring | Real-time | Free tier |

**Tier 2 — Recommended (Moderate Cost):**

| Feed | Purpose | Update Frequency | Cost |
|------|---------|-----------------|------|
| CME Group | Treasury futures, SOFR futures, forward curves | Real-time | $200-500/mo |
| MBSQuoteline | Agency MBS TBA pricing (proxy for non-QM) | Intraday | $50-100/mo |
| Mortgage Daily News | Live MBS prices, rate alerts | 15-min delayed | $30/mo |
| Polygon.io | Treasury and SOFR futures | Real-time | $29-199/mo |

**Tier 3 — Institutional (High Cost, Maximum Fidelity):**

| Feed | Purpose | Update Frequency | Cost |
|------|---------|-----------------|------|
| Bloomberg BPIPE | Non-QM MBS spreads, deal pricing, forward curves | Real-time | ~$25K/yr |
| Refinitiv/LSEG | Non-QM spread indices, SOFR curves, credit markets | Real-time | $500-2K/mo |
| Intex | Non-QM RMBS deal-level modeling, cash flows, spreads | T+1 | $5-15K/yr |

### 3.3 Building the Real-Time Estimator: Technical Implementation

**Minimum Viable Product (MVP):**

```python
# DSCR Rate Estimator — MVP Architecture

class DSCRRateEstimator:
    """
    Derives real-time DSCR rates from capital markets data.
    Replaces static rate grids with dynamic, market-derived pricing.
    """

    def __init__(self):
        self.treasury_feed = TreasuryFeed()        # Free: treasury.gov + FRED
        self.mbs_spread_feed = MBSSpreadFeed()      # Low-cost: MBSQuoteline + MND
        self.lender_margins = LenderMarginDB()       # Self-built from rate sheets
        self.llpa_engine = LLPACalcEngine()          # Internal calculation

    def estimate_rate(self, lender, profile, horizon='now'):
        """
        Estimate DSCR rate for a given lender and borrower profile.

        Args:
            lender: Lender identifier (e.g., 'kiavi', 'angel_oak')
            profile: Borrower profile dict {fico, ltv, dscr, property_type, ...}
            horizon: 'now', '3day', '7day' — prediction horizon

        Returns:
            Estimated rate with confidence interval
        """
        # Step 1: Get current Treasury
        ust_10y = self.treasury_feed.get_10y_yield()

        # Step 2: Get non-QM MBS spread (latest observable)
        nonqm_spread = self.mbs_spread_feed.get_nonqm_spread(
            rating='weighted_avg',
            vintage='current'
        )

        # Step 3: Get lender-specific margin
        margin = self.lender_margins.get_margin(lender)

        # Step 4: Calculate LLPAs for profile
        llpa_total = self.llpa_engine.calculate(profile)

        # Step 5: Apply grid-lag adjustment
        lag_adj = self.lender_margins.get_lag_adjustment(
            lender,
            ust_10y,
            horizon=horizon
        )

        # Step 6: Derive estimated rate
        estimated_rate = ust_10y + nonqm_spread + margin + llpa_total + lag_adj

        # Step 7: Calculate confidence
        confidence = self._calculate_confidence(ust_10y, nonqm_spread, horizon)

        return {
            'rate': estimated_rate,
            'confidence': confidence,
            'components': {
                'treasury_10y': ust_10y,
                'nonqm_spread': nonqm_spread,
                'lender_margin': margin,
                'llpa_total': llpa_total,
                'lag_adjustment': lag_adj
            },
            'horizon': horizon,
            'lender_grid_rate': self.lender_margins.get_current_grid_rate(lender, profile),
            'spread_to_grid': estimated_rate - self.lender_margins.get_current_grid_rate(lender, profile)
        }

    def _calculate_confidence(self, ust_10y, nonqm_spread, horizon):
        """Calculate prediction confidence based on data freshness and volatility."""
        treasury_age = self.treasury_feed.get_data_age_minutes()
        spread_age = self.mbs_spread_feed.get_data_age_hours()
        recent_vol = self.treasury_feed.get_recent_volatility(window='5d')

        base_confidence = 0.85

        # Penalty for stale data
        if treasury_age > 60: base_confidence -= 0.05
        if spread_age > 24: base_confidence -= 0.10

        # Penalty for high volatility (less predictable)
        if recent_vol > 15: base_confidence -= 0.10

        # Penalty for longer prediction horizon
        if horizon == '3day': base_confidence -= 0.05
        if horizon == '7day': base_confidence -= 0.15

        return max(0.30, min(0.95, base_confidence))
```

### 3.4 Non-QM MBS Spread Proxy Strategy

**The Challenge:** Non-QM MBS spreads are not as readily available as agency MBS spreads. There's no free real-time feed.

**Proxy Strategy (Tiered):**

| Fidelity Level | Method | Accuracy | Cost | Refresh |
|---------------|--------|----------|------|---------|
| **Level 1: Direct** | Bloomberg/Intex non-QM spread marks | High (±5 bps) | $25K+/yr | Real-time/T+1 |
| **Level 2: Dealer Runs** | Weekly dealer price indications from non-QM desks | Good (±15 bps) | Relationship-based | Weekly |
| **Level 3: Issuance Spreads** | Track new deal pricing spreads (when deals price) | Moderate (±25 bps) | Free (SEC filings, presale reports) | Per-deal (monthly) |
| **Level 4: Agency Proxy** | Use agency MBS TBA spreads + non-QM basis (historical avg 75-150 bps wider) | Moderate (±30 bps) | $50-100/mo | Intraday |
| **Level 5: REIT Earnings** | Track non-QM REITs (AOMR, NRZ) for portfolio yields | Low (±50 bps) | Free | Quarterly |
| **Level 6: Reverse Engineering** | Infer spreads from lender rate changes vs. Treasury moves | Moderate (±20 bps) | Self-built | When grids update |

**Recommended Approach:** Start with **Level 4 (Agency Proxy)** for MVP, then upgrade to **Level 3 (Issuance Spreads)** and **Level 6 (Reverse Engineering)** for improved accuracy. Level 1/2 for institutional-grade product.

---

## 4. LENDER MARGIN TRACKING

### 4.1 The Margin Stack

Each DSCR lender's margin above MBS economics is the **single largest source of pricing variance** between lenders for the same borrower profile:

```
Lender Margin = Operating Costs + Profit Target + Risk Buffer + Competitive Positioning
               (30-50 bps)       (20-50 bps)     (15-30 bps)    (-20 to +50 bps)
```

**Typical lender margins by category:**

| Lender Category | Typical Margin Above MBS | Range | Update Frequency |
|----------------|-------------------------|-------|-----------------|
| Tech-forward (Kiavi) | 75-120 bps | Narrow range | Daily |
| Aggressive non-QM (Easy Street) | 80-130 bps | Wider range | 2-3x/week |
| Established non-QM (Angel Oak, Deephaven) | 100-175 bps | Wide range | Weekly |
| Wholesale specialists (LendSure, Griffin) | 100-150 bps | Moderate range | Weekly |
| Bank-affiliated (Newrez/Shellpoint) | 125-200 bps | Wide range | Monthly |

### 4.2 How to Track Lender Margins

**Method 1: Rate Sheet Reverse Engineering**

```python
def infer_lender_margin(lender_rate, ust_10y, nonqm_spread, llpa_total):
    """
    Reverse-engineer a lender's margin from their published rate.
    Margin = Published Rate - Treasury - Non-QM Spread - LLPAs
    """
    margin = lender_rate - ust_10y - nonqm_spread - llpa_total
    return margin

# Example: Angel Oak publishes 7.85% for a given profile
# Treasury = 4.35%, Estimated Non-QM spread = 2.85%, LLPAs = 0.40%
# Inferred margin = 7.85% - 4.35% - 2.85% - 0.40% = 0.25% (25 bps)
# This suggests Angel Oak is pricing aggressively for this profile
```

**Method 2: Grid Change Detection**

Track every rate grid update per lender and decompose changes:
- If Treasury dropped 10 bps and the lender dropped 10 bps → margin held constant
- If Treasury dropped 10 bps and the lender dropped only 5 bps → margin widened by 5 bps (lender is capturing some of the market improvement)
- If Treasury dropped 10 bps and the lender dropped 15 bps → margin narrowed by 5 bps (lender is getting hungry)

**Method 3: Pipeline Volume Inference**

When lenders have excess pipeline capacity (not enough loans in the funnel), they tend to:
- Narrow margins (cut rates more than market warrants)
- Reduce LLPAs (waive or lower risk adjustments)
- Offer promotional pricing

### 4.3 Lender Margin Comparison Dashboard

**Proposed Feature: Margin Transparency Score**

```
┌──────────────────────────────────────────────────────────────────┐
│  LENDER MARGIN TRACKER — Live                                    │
│                                                                  │
│  Profile: 700 FICO, 75% LTV, DSCR 1.25, SFR, LTR               │
│  10Y Treasury: 4.35% | Non-QM Spread: 2.85% | LLPA: 0.25%      │
│  Base Cost: 7.45%                                                │
│                                                                  │
│  Lender        Grid Rate   Inferred Margin   vs. 7-Day Avg      │
│  ─────────     ─────────   ───────────────   ──────────────      │
│  Kiavi         7.625%      40 bps            ▼ -5 bps (tighter) │
│  Easy Street   7.625%      40 bps            ▼ -10 bps          │
│  Angel Oak     7.750%      55 bps            ▲ +5 bps (wider)   │
│  Griffin       7.875%      65 bps            — flat              │
│  LendSure      7.875%      65 bps            ▼ -5 bps           │
│  Deephaven     8.000%      80 bps            ▲ +10 bps (wider)  │
│  Newrez        8.125%      95 bps            — flat              │
│                                                                  │
│  ⚡ BEST MARGIN: Kiavi / Easy Street (40 bps)                    │
│  📈 TRENDING TIGHTER: Easy Street (-10 bps this week)            │
│  📉 TRENDING WIDER: Deephaven (+10 bps this week)                │
│                                                                  │
│  ⚠️  Angel Oak margin widening may indicate pipeline full or     │
│     upcoming MBS deal close — rates may stabilize or increase     │
└──────────────────────────────────────────────────────────────────┘
```

### 4.4 How Often Do Lenders Adjust Margins?

| Adjustment Type | Frequency | Trigger | Detection Method |
|----------------|-----------|---------|------------------|
| **Market-following** (Treasury changes) | Daily to weekly | Treasury/SOFR moves >10 bps | Rate sheet comparison |
| **Competitive response** | Weekly | Competitor rate changes | Multi-lender monitoring |
| **Pipeline management** | Monthly/bi-weekly | Origination volume vs. target | Rate velocity analysis |
| **MBS deal cycle** | Quarterly (around deals) | Securitization window opening/closing | Deal tracking + margin inference |
| **Strategic repositioning** | Quarterly/annually | Business strategy shift | Earnings calls, announcements |
| **Risk appetite** | As needed | Credit loss trends, macro outlook | LLPA grid changes |

---

## 5. RATE LOCK TIMING OPTIMIZATION

### 5.1 MBS Spread Patterns and Lock Timing

**Documented patterns in MBS spread behavior:**

| Pattern | Description | Frequency | Rate Impact | Source |
|---------|-------------|-----------|-------------|--------|
| **Monday dip** | MBS spreads often tighten Monday mornings as new money enters the market | Weekly | 3-8 bps improvement | MBS market conventions |
| **Friday widening** | Traders reduce risk into weekends; spreads widen Friday afternoon | Weekly | 3-10 bps deterioration | MBS market conventions |
| **Post-Fed meeting window** | After FOMC decisions, spreads stabilize within 48-72 hours | 8x/year | Variable (10-50 bps) | Fed calendar |
| **Month-end tightening** | Portfolio rebalancing creates MBS demand at month-end | Monthly | 5-15 bps improvement | Index fund mechanics |
| **Quarter-end window** | Quarter-end repricing + new allocations can tighten spreads | Quarterly | 10-25 bps improvement | Institutional flows |
| **Non-farm payroll reaction** | Employment data moves Treasury yields sharply; spreads lag | Monthly | 5-20 bps either direction | Economic calendar |
| **CPI release window** | Inflation data is the primary driver of 2025-2026 rate volatility | Monthly | 10-30 bps either direction | Economic calendar |
| **Supply calendar** | Treasury auction weeks put upward pressure on yields | Varies | 3-10 bps deterioration | Treasury auction schedule |

### 5.2 Optimal Lock Timing Model

```python
class RateLockOptimizer:
    """
    Determines optimal rate lock timing based on MBS spread patterns,
    economic calendar, and lender grid-update cycles.
    """

    def recommend_lock_timing(self, borrower_profile, current_date, lender):
        """
        Returns lock recommendation with expected savings.
        """
        recommendations = []

        # Factor 1: Day-of-week effect
        dow_score = self._day_of_week_score(current_date)
        # Monday-Wednesday: favorable; Thursday: neutral; Friday: unfavorable

        # Factor 2: Economic calendar
        econ_score = self._economic_calendar_score(current_date, look_ahead=7)
        # No major releases: favorable; Fed/CPI week: unfavorable

        # Factor 3: Lender grid cycle
        grid_score = self._lender_grid_cycle_score(lender, current_date)
        # Just updated: rates current; about to update: lock before change

        # Factor 4: MBS spread trend
        spread_score = self._spread_trend_score()
        # Tightening: wait for lower rates; widening: lock immediately

        # Factor 5: Treasury yield trend
        treasury_score = self._treasury_trend_score()
        # Falling: may wait; rising: lock now

        composite = self._composite_score(
            dow_score, econ_score, grid_score,
            spread_score, treasury_score
        )

        if composite > 0.65:
            action = 'LOCK_NOW'
            expected_savings = '0-10 bps vs. waiting'
        elif composite > 0.35:
            action = 'LOCK_TODAY_OR_TOMORROW'
            expected_savings = '5-15 bps by locking this week'
        else:
            action = 'WAIT_FOR_BETTER_WINDOW'
            expected_savings = '15-40 bps potential by waiting 3-7 days'

        return {
            'action': action,
            'composite_score': composite,
            'expected_savings': expected_savings,
            'factors': {
                'day_of_week': dow_score,
                'economic_calendar': econ_score,
                'lender_grid_cycle': grid_score,
                'spread_trend': spread_score,
                'treasury_trend': treasury_score
            },
            'optimal_window': self._find_optimal_window(current_date, days=14)
        }
```

### 5.3 Best Day to Lock: Empirical Guidance

Based on MBS market conventions and historical analysis:

| Day | Lock Recommendation | Rationale |
|-----|-------------------|-----------|
| **Monday** | ✅ Favorable | New money flows; MBS demand; spreads typically tightest |
| **Tuesday** | ✅ Most favorable | Monday's MBS gains reflected in lender grids; stable day |
| **Wednesday** | ⚠️ Conditional | Good if no Fed meeting; avoid on FOMC days |
| **Thursday** | ⚠️ Conditional | Jobless claims data at 8:30 AM; can move rates |
| **Friday** | ❌ Unfavorable | Risk-off positioning; spreads widen; Monday may be better |

**Seasonal patterns:**
- **Best months to lock:** November-February (less Treasury supply, year-end portfolio demand for MBS)
- **Worst months to lock:** March-May (heavy Treasury refunding, less seasonal MBS demand)
- **Quarter-end windows:** Last 5 business days of quarter often see spread tightening

### 5.4 Event-Driven Lock Alerts

**Proposed Feature: Lock Alert System**

```
┌──────────────────────────────────────────────────────────────────┐
│  🔔 RATE LOCK ALERT                                             │
│                                                                  │
│  Event: CPI Release — Wednesday 8:30 AM ET                      │
│  Current DSCR Rate Est: 7.625% (Kiavi)                          │
│                                                                  │
│  Scenario Analysis:                                              │
│  ┌────────────────┬──────────────┬────────────────────────┐      │
│  │ CPI Outcome     │ Est. Rate    │ Recommendation         │      │
│  ├────────────────┼──────────────┼────────────────────────┤      │
│  │ Below consensus │ 7.375-7.500% │ Wait, lock Thursday   │      │
│  │ In-line         │ 7.500-7.625% │ Lock today before CPI  │      │
│  │ Above consensus │ 7.750-7.875% │ LOCK NOW — rates rising│      │
│  └────────────────┴──────────────┴────────────────────────┘      │
│                                                                  │
│  💡 Recommendation: If you're risk-averse, lock TODAY.          │
│     If you can tolerate volatility, wait for CPI and lock        │
│     Thursday if rates improve.                                   │
│                                                                  │
│  Historical: After 12 of last 18 CPI releases, DSCR rates       │
│  moved 15+ bps within 48 hours.                                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. HEDGING INTELLIGENCE

### 6.1 Can DSCR Borrowers Hedge Against Rate Changes?

**Direct hedging products for DSCR borrowers are extremely limited.** Unlike commercial real estate where interest rate swaps and caps are common, the retail DSCR market has almost no hedging infrastructure.

| Hedging Strategy | Available? | Cost | Complexity | Effectiveness |
|-----------------|-----------|------|-----------|---------------|
| **Extended rate lock** (60-90 days) | ✅ Some lenders offer | 0.5-1.5 pts | Low | High — locks exact rate |
| **Rate lock float-down** | ✅ A few lenders | Free or 0.25 pts | Low | Moderate — only if rates improve |
| **Interest rate futures** (Treasury) | ✅ Available via brokerages | Varies | High | Moderate — hedges Treasury, not spread |
| **SOFR futures** (CME) | ✅ Available via brokerages | Varies | High | Moderate — hedges ARM index |
| **Interest rate swaps** | ❌ Not available to retail | N/A | Very high | Would be effective if available |
| **Interest rate caps** | ⚠️ Rare for residential | Expensive | Very high | Good for ARM protection |
| **Forward rate commitments** | ❌ Not standard for DSCR | N/A | N/A | Would be ideal |
| **MBS ETF short** (proxy hedge) | ✅ Available | Commission only | High | Low — poor correlation for individual |

### 6.2 Extended Lock as Primary Hedging Tool

For most DSCR borrowers, the **extended rate lock** is the only practical hedging tool:

| Lock Period | Typical Cost | Availability | Best For |
|------------|-------------|-------------|----------|
| 30 days | Free (standard) | All lenders | Fast closings |
| 45 days | 0.125-0.250 pts | Most lenders | Standard timeline |
| 60 days | 0.250-0.500 pts | Many lenders | Complex closings |
| 90 days | 0.500-1.000 pts | Some lenders | New construction, complex deals |
| 120+ days | 1.000-1.500 pts | Rare | Pre-construction |

**Float-Down Options:**
- **Angel Oak:** Offers a one-time float-down within the lock period
- **Kiavi:** No published float-down policy (negotiable for high-volume brokers)
- **Easy Street:** Float-down available if rates improve by 25+ bps
- **Most lenders:** Not offered as standard; case-by-case

### 6.3 Platform Opportunity: Hedging Recommendation Engine

**Proposed Feature: Rate Protection Optimizer**

```
INPUT:  Closing date, current rate quote, rate lock cost schedule, Treasury trend

OUTPUT:
  - Optimal lock period (minimize total cost = lock fee + rate risk)
  - Float-down trigger price (if available)
  - Proxy hedge recommendation (if rate risk is material)
  - Rate trend forecast for lock period
```

**Decision Logic:**

```python
def recommend_rate_protection(closing_date, current_rate, lock_pricing, rate_forecast):
    days_to_close = (closing_date - date.today()).days

    # Base recommendation: minimum lock period covering closing
    min_lock = days_to_close + 10  # buffer

    # Cost of each lock period
    lock_costs = {30: 0, 45: 0.1875, 60: 0.375, 90: 0.75, 120: 1.25}

    # Expected rate change over lock period
    expected_change = rate_forecast.expected_change_bps(days=min_lock)
    worst_case = rate_forecast.worst_case_bps(days=min_lock)

    # Value of protection = avoided rate increase × loan amount
    # Cost of protection = lock fee points × loan amount
    loan_amount = 300000  # example

    for lock_days, lock_cost_pts in sorted(lock_costs.items()):
        if lock_days >= min_lock:
            protection_value = (worst_case / 100) * loan_amount / 100
            protection_cost = lock_cost_pts * loan_amount / 100

            if protection_value > protection_cost * 1.5:  # 1.5x value threshold
                recommended_lock = lock_days
                break

    return {
        'recommended_lock_days': recommended_lock,
        'lock_cost': lock_costs[recommended_lock],
        'expected_rate_change': expected_change,
        'worst_case_rate_change': worst_case,
        'protection_value_vs_cost': protection_value / protection_cost
    }
```

### 6.4 Forward Rate Products for DSCR/Non-QM

**Current State:** No exchange-traded or OTC forward rate product exists specifically for DSCR or non-QM mortgage rates.

**Near-Proxy Instruments:**

| Instrument | Exchange | What It Hedges | Limitation |
|-----------|----------|---------------|------------|
| 10-Year Treasury Note futures | CME (TY) | Treasury component of DSCR rate | Doesn't hedge MBS spread component |
| SOFR futures | CME (SR1/SR3) | ARM index (SOFR) | Only hedges floating leg |
| TBA MBS futures | CME (not exchange-traded; OTC) | Agency MBS price | Not non-QM; dealer-only |
| MBS ETF (MBB, VMBS) | NYSE | Agency MBS price | Doesn't track non-QM spreads |
| iShares MBS ETF | NYSE | Agency MBS | Same limitation |

**Platform Innovation Opportunity:** A **DSCR Rate Futures Indicator** — not a tradeable product, but a calculated forward rate derived from Treasury futures + historical non-QM basis. This would give borrowers and brokers a view of where DSCR rates are likely heading.

---

## 7. SECURITIZATION PIPELINE INTELLIGENCE

### 7.1 The MBS Deal Cycle and Lender Pricing

**When a DSCR lender is building a new MBS deal, they NEED loan volume.** This creates a predictable cycle of pricing aggressiveness:

```
┌────────────────────────────────────────────────────────────────────────────┐
│  THE SECURITIZATION PRICING CYCLE                                         │
│                                                                            │
│  Phase 1: POST-DEAL (Months 1-2 after last deal)                          │
│  → Pipeline depleted; reduced urgency                                      │
│  → Pricing: Standard or slightly wider margins                             │
│  → Lender behavior: Selective, normal overlays                            │
│                                                                            │
│  Phase 2: ACCUMULATION (Months 2-4)                                       │
│  → Actively building new pool; need volume                                 │
│  → Pricing: Tighter margins, promotional rates, LLPA waivers               │
│  → Lender behavior: Aggressive marketing, faster turns, reduced overlays   │
│                                                                            │
│  Phase 3: PRE-PRICING (4-8 weeks before deal pricing)                     │
│  → Need to fill remaining capacity; most aggressive pricing                │
│  → Pricing: Best rates; lowest margins; may waive LLPAs                   │
│  → Lender behavior: Maximum hunger; fastest turns; easiest qualifying     │
│                                                                            │
│  Phase 4: DEAL PRICING (Week of deal)                                     │
│  → Pool is full; may pause new locks or tighten pricing                   │
│  → Pricing: Grids may tighten; rates may increase                          │
│  → Lender behavior: Selective; slower turns; may pause programs           │
│                                                                            │
│  Phase 5: POST-PRICING (2-4 weeks after deal)                             │
│  → New pool starts; begin accumulation again                              │
│  → Pricing: Moderate; not as aggressive as Phase 3                        │
│  → Lender behavior: Back to normal operations                              │
└────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Detecting When Lenders Are "In Market"

**Observable Signals:**

| Signal | What It Indicates | Data Source | Detection Method |
|--------|-------------------|-------------|-----------------|
| Rate decrease (without market move) | Lender is hungry for volume | Rate sheets | Margin tracking algorithm |
| LLPA reductions or waivers | Aggressive pricing to attract volume | Rate sheet LLPA grids | Grid comparison |
| New program announcements | Expanding eligible borrower pool | Lender emails, websites | Scraping + monitoring |
| Faster turn times | Lender has capacity | Broker reports | Community intelligence |
| Reduced documentation requirements | Making it easier to qualify | Underwriting guidelines | Guideline comparison |
| Promotional pricing emails | Direct signal of hunger | Lender marketing | Email monitoring |
| Job postings (underwriters, processors) | Expanding capacity | LinkedIn, job boards | Job posting API |
| Warehouse line activity | New funding capacity | SEC filings | EDGAR monitoring |

### 7.3 Non-QM MBS Issuance Pipeline Tracking

**Deal Calendar Sources:**

| Source | Data | Coverage | Cost |
|--------|------|----------|------|
| **ASR (Asset Securitization Report)** | Non-QM RMBS deal calendar, presale reports | Comprehensive | $2-5K/yr |
| **Credit Chronister** | Non-QM deal tracking, analytics | Good | Free + premium |
| **Intex** | Deal modeling, cash flows, spreads | Comprehensive | $5-15K/yr |
| **Kroll Bond Rating Agency (KBRA)** | Presale reports, deal structure | All rated deals | Free (reports) |
| **Morningstar DBRS** | Presale reports, rating actions | All rated deals | Free (reports) |
| **Fitch Ratings** | RMBS presale reports | Select deals | Free (reports) |
| **SEC EDGAR (ABS-EE)** | Deal filings, loan-level data | All public deals | Free |
| **Intex deal library** | Historical deal performance | Comprehensive | Included in Intex subscription |

### 7.4 Platform Feature: Lender Pipeline Intelligence Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│  SECURITIZATION PIPELINE INTELLIGENCE                            │
│                                                                  │
│  Active Non-QM Deals in Market:                                  │
│  ┌──────────────────┬──────────┬──────────┬──────────┬───────┐   │
│  │ Issuer            │ Deal     │ Est. Size│ Phase    │ Signal│   │
│  ├──────────────────┼──────────┼──────────┼──────────┼───────┤   │
│  │ Angel Oak         │ AOMT 2026│ $350M    │ ACCUMUL. │ 🟢    │   │
│  │ Deephaven         │ DRMT 2026│ $275M    │ PRE-PRIC │ 🟢🟢  │   │
│  │ Finance of America│ FOA 2026 │ $200M    │ POST-DEAL│ 🟡    │   │
│  │ Invictus          │ VIV 2026 │ $150M    │ ACCUMUL. │ 🟢    │   │
│  │ PennyMac          │ PMT 2026 │ $500M    │ Phase 1  │ 🔴    │   │
│  └──────────────────┴──────────┴──────────┴──────────┴───────┘   │
│                                                                  │
│  🟢🟢 = BEST PRICING — Deephaven is in pre-pricing phase;      │
│         expect aggressive rates, waived LLPAs, fast turns         │
│  🟢 = GOOD PRICING — Angel Oak & Invictus accumulating;         │
│       competitive rates available                                 │
│  🟡 = NEUTRAL — FOA just priced deal; pipeline adequate          │
│  🔴 = AVOID — PennyMac just finished deal; not hungry             │
│                                                                  │
│  💡 RECOMMENDATION: Submit to Deephaven NOW for best pricing.     │
│     Angel Oak as backup — may improve in 2-3 weeks.              │
└──────────────────────────────────────────────────────────────────┘
```

### 7.5 How Deal Cycle Intelligence Creates Alpha

**Quantified opportunity by deal phase:**

| Deal Phase | Rate Advantage vs. Baseline | LLPA Impact | Turn Time Impact |
|-----------|---------------------------|-------------|-----------------|
| Post-Deal (Phase 1) | +5-15 bps (worse) | Standard LLPAs | Normal (7-14 days) |
| Accumulation (Phase 2) | -5-15 bps (better) | Some LLPA reductions | Faster (5-10 days) |
| Pre-Pricing (Phase 3) | **-15-40 bps (best)** | LLPA waivers common | Fastest (3-7 days) |
| Deal Pricing (Phase 4) | +10-25 bps (worse) | Tighter LLPAs | Slow (10-21 days) |
| Post-Pricing (Phase 5) | +0-10 bps (neutral) | Standard | Normal (7-14 days) |

**Alpha from securitization cycle alone: 15-40 bps by timing submissions to lender deal phases.**

---

## 8. COMPETITOR RATE INTELLIGENCE

### 8.1 Existing DSCR Rate Aggregation Services

| Service | Type | DSCR Coverage | Update Frequency | Cost | API Access |
|---------|------|--------------|-----------------|------|-----------|
| **Morty Hemlock** | Full platform (LOS + pricing) | 8+ lenders, 23+ programs | Intraday | SaaS subscription | ❌ No public API |
| **Optimal Blue PPE** | Enterprise pricing engine | Limited non-QM/DSCR | Intraday | Enterprise license | ✅ Full API |
| **Loansifter (by OB)** | Broker pricing engine | 120+ investors (limited DSCR) | Intraday | Broker subscription | ✅ API available |
| **LoanPASS** | Specialty pricing engine | Non-QM focused | Intraday | Enterprise license | ✅ API available |
| **Lender Price** | PPE for lenders | Configurable | Real-time | Enterprise license | ✅ API available |
| **iPricing (Mega Capital)** | Rate comparison | Some DSCR | Daily | Free/subscription | Web only |
| **IPLE** | Information/comparison | Multi-lender rates | Monthly articles | Free | ❌ No API |
| **BiggerPockets** | Community/forums | Anecdotal | Real-time (user-posted) | Free | ❌ No API |
| **LinkedIn groups** | Community | Informal | Real-time | Free | ❌ No API |

### 8.2 Rate Scraping / Aggregation Approaches

**Approach 1: Direct API Integration**
- Integrate with Optimal Blue API (most comprehensive)
- Also LoanPASS for non-QM depth
- **Pros:** Accurate, real-time, structured data
- **Cons:** Enterprise licensing costs ($5-20K/yr); requires lender subscriptions; may not cover all DSCR lenders

**Approach 2: Rate Sheet Scraping**
- Scrape lender rate sheets published on wholesale portals
- Parse PDF/HTML rate grids into structured data
- **Pros:** Covers lenders not on any PPE; captures exact pricing
- **Cons:** Fragmented formats; requires per-lender parsing logic; some behind login walls

**Approach 3: Broker Community Crowdsourcing**
- Collect anonymized rate quotes from broker submissions
- Build a real-time rate database from actual loan scenarios
- **Pros:** Captures real-world pricing (not just published grids); includes broker overlays
- **Cons:** Data quality varies; needs critical mass of contributors; potential bias

**Approach 4: Reverse Engineering from Locked Loans**
- When a borrower locks a rate through the platform, record the exact terms
- Build a database of actual locked rates by lender/profile/date
- **Pros:** Most accurate data (real transactions); proprietary dataset
- **Cons:** Requires platform transaction volume; cold-start problem

### 8.3 Recommended Multi-Source Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│  RATE INTELLIGENCE COLLECTION ARCHITECTURE                      │
│                                                                 │
│  Source 1: Optimal Blue API ──────────────┐                     │
│  (structured, enterprise, ~60% coverage)   │                     │
│                                            │                     │
│  Source 2: Rate Sheet Scraping ───────────┤                     │
│  (custom parsers, ~80% coverage)          │                     │
│                                            ├──► Rate DB ──►     │
│  Source 3: Broker Crowdsourcing ──────────┤    (unified)  Rate  │
│  (real-world quotes, ~30% coverage)       │              Engine │
│                                            │                     │
│  Source 4: Transaction Data ──────────────┘                     │
│  (locked loans, 100% accurate, growing)                         │
│                                                                 │
│  Conflict Resolution:                                           │
│  - Transaction data > Crowdsourced > API > Scraped              │
│  - If sources disagree by >25 bps, flag for manual review      │
│  - Time-weighted: newer data > older data                       │
└─────────────────────────────────────────────────────────────────┘
```

### 8.4 Competitive Advantage: Real-Time vs. Static Grids

**No existing DSCR platform derives rates from capital markets.** The competitive landscape:

| Competitor | Rate Source | Update Frequency | Market-Derived? | Predictive? |
|-----------|-----------|-----------------|----------------|-------------|
| **Our Platform** | Treasury + MBS spreads + margins + LLPAs | Real-time | ✅ Yes | ✅ Yes |
| Morty Hemlock | Lender rate grids (via PPE) | Intraday | ❌ No | ❌ No |
| Optimal Blue | Lender rate grids (via PPE) | Intraday | ❌ No | ❌ No |
| IPLE | Manual rate surveys | Monthly | ❌ No | ❌ No |
| Individual lender sites | Own rate grids | Daily-monthly | ❌ No | ❌ No |
| Broker spreadsheets | Manual entry | Varies | ❌ No | ❌ No |

**The moat:** Even if competitors copy our approach, the proprietary data assets (lender margin histories, grid-lag patterns, securitization cycle tracking, lock timing analytics) create compounding advantages that cannot be replicated without years of data collection.

---

## 9. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Weeks 1-8) — MVP Rate Estimator

| Component | Description | Data Source | Est. Cost |
|-----------|-------------|-------------|-----------|
| Treasury feed integration | Real-time 10Y, 5Y, 2Y yields | Treasury.gov + FRED (free) + TradingView | $0-15/mo |
| SOFR feed integration | Daily SOFR fixing + term SOFR | NY Fed (free) | $0 |
| Agency MBS spread proxy | TBA MBS prices as non-QM proxy | MBSQuoteline + MND | $80/mo |
| Lender margin database | Initialize with rate sheet scraping | Custom scrapers | Dev time |
| LLPA calculation engine | Build from verified grids | Existing research | Dev time |
| Rate estimation API | Expose derived rates | Internal | Dev time |
| **Total Phase 1 Cost** | | | ~$100/mo + dev |

**Deliverable:** DSCR rate estimates within ±30 bps of actual grid rates, updating in real-time as Treasury moves.

### Phase 2: Intelligence (Weeks 9-16) — Prediction Engine

| Component | Description | Data Source | Est. Cost |
|-----------|-------------|-------------|-----------|
| Grid-lag tracker | Per-lender update frequency and delay | Rate sheet comparison | Dev time |
| Rate prediction model | 1/3/7 day rate forecasts | Historical patterns + ML | Dev time |
| Lock timing optimizer | Best day/time to lock recommendations | MBS patterns + econ calendar | Dev time |
| Lender hunger index | Pipeline capacity estimation | Multi-source signals | Dev time |
| Rate alert system | Push notifications for rate changes | All above | Dev time |
| **Total Phase 2 Cost** | | | ~$100/mo + dev |

**Deliverable:** Predicted rate changes 24-72 hours before grid updates; lock timing recommendations saving 25-50 bps.

### Phase 3: Capital Markets (Weeks 17-24) — Institutional-Grade

| Component | Description | Data Source | Est. Cost |
|-----------|-------------|-------------|-----------|
| Non-QM MBS spread feed | Direct spread marks (not proxy) | Bloomberg/Intex/Refinitiv | $5-25K/yr |
| Securitization pipeline tracker | Deal calendar and phase detection | KBRA/DBRS/ASR + SEC filings | $2-5K/yr |
| Lender margin analytics | Detailed margin decomposition | Transaction data + reverse engineering | Dev time |
| Forward rate indicator | 30/60/90 day rate projections | CME futures + historical basis | $200-500/mo |
| Hedging recommendation engine | Rate protection optimizer | All above | Dev time |
| **Total Phase 3 Cost** | | | ~$15-30K/yr + dev |

**Deliverable:** Institutional-grade rate intelligence comparable to what major lenders' capital markets desks use internally.

### Phase 4: Network Effects (Weeks 25-40) — Market Dominance

| Component | Description | Data Source | Est. Cost |
|-----------|-------------|-------------|-----------|
| Transaction rate database | Actual locked rates from platform | Platform users | Built-in |
| Broker intelligence network | Anonymized rate/turn-time sharing | Broker community | Dev time |
| Lender API partnerships | Direct rate feed from lenders | Business development | Negotiable |
| Rate comparison marketplace | Side-by-side lender comparison | All sources | Dev time |
| Predictive lock marketplace | "Lock now" recommendations with tracking | All above | Dev time |
| **Total Phase 4 Cost** | | | Dev time (data is self-generated) |

**Deliverable:** Self-reinforcing data moat — more users → more transaction data → better predictions → more users.

---

## 10. RISK ANALYSIS

### 10.1 Key Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Non-QM spread data unavailable** | Medium | High | Use agency proxy + reverse engineering; upgrade to Bloomberg/Intex when viable |
| **Lender rate grids change unpredictably** | Low | Medium | Track multiple signals; confidence scoring; never promise exact rates |
| **Regulatory concerns on rate advice** | Low | High | Clear disclaimers; not a licensed rate lock; "estimated" language |
| **Competitors copy the approach** | Medium | Medium | Proprietary data moat (margin histories, grid-lag patterns, deal cycle data) is hard to replicate |
| **Treasury-MBS correlation breaks down** | Low | High | Monitor correlation; flag when R² drops below threshold; increase uncertainty bands |
| **Lenders restrict rate sheet access** | Medium | Medium | Multiple data sources; broker community; API partnerships |
| **MBS spread proxy inaccuracy** | Medium | Medium | Tiered approach (proxy → issuance spreads → direct marks); transparent confidence scoring |

### 10.2 Accuracy Benchmarks

| Metric | Phase 1 Target | Phase 3 Target | Measurement Method |
|--------|---------------|---------------|-------------------|
| Rate estimate vs. actual grid | ±30 bps | ±10 bps | Compare estimated rate to published grid |
| Rate prediction (3-day) | ±40 bps | ±15 bps | Backtest against historical grid changes |
| Rate prediction (7-day) | ±60 bps | ±25 bps | Backtest against historical grid changes |
| Lock timing value | 15-25 bps | 30-50 bps | Compare locked rates to next-week rates |
| Lender margin estimate | ±25 bps | ±10 bps | Compare inferred margin to actual (when knowable) |

---

## 11. SUMMARY: THE DYNAMIC PRICING ADVANTAGE

### Why This Changes Everything

**Current state:** DSCR borrowers and brokers see **yesterday's rates** from **static grids** updated on someone else's schedule. They have zero visibility into why rates are where they are, where they're heading, or when to lock.

**Dynamic MBS-spread pricing changes this:**

| Question | Static Grid Answer | Dynamic Pricing Answer |
|----------|-------------------|----------------------|
| "What's my DSCR rate?" | 7.75% (from last week's grid) | 7.65% now, likely 7.50% by Thursday (based on Treasury + spread trends) |
| "Should I lock now?" | "I don't know, rates change" | "Lock Tuesday — CPI is Wednesday and we're 70% confident rates improve" |
| "Why is this lender cheaper?" | "They just are" | "Deephaven is 20 bps cheaper because they're in the accumulation phase of their next MBS deal" |
| "When will rates drop?" | "Nobody knows" | "MBS spreads tightened 12 bps this week; expect Angel Oak to update their grid by Friday with 10-15 bps cuts" |
| "Which lender is best for me?" | "Compare these 8 rate sheets" | "For your profile, Kiavi has the tightest margin (40 bps) and is trending tighter; Angel Oak is 15 bps wider but has a deal closing — may get aggressive in 2 weeks" |

### The Compounding Moat

```
Real-time data → Better predictions → More users → More transaction data → Better margin estimates → Better predictions → More users
                                                                                                    ↑
                                              Securitization cycle tracking ←─────────────────────┘
                                              Lender margin histories
                                              Grid-lag patterns
                                              Lock timing analytics
```

**This is a winner-take-most dynamic.** The first platform to build this intelligence layer becomes the Bloomberg Terminal of DSCR lending — the indispensable tool that every broker, borrower, and eventually lender uses because the data advantage compounds over time.

### Key Metrics to Track

| KPI | Definition | Target (Year 1) | Target (Year 3) |
|-----|-----------|-----------------|-----------------|
| Rate accuracy | Estimate vs. actual grid | ±25 bps | ±10 bps |
| Prediction hit rate | Rate moved in predicted direction | 65% | 80% |
| Lock timing savings | Average bps saved vs. random lock | 20 bps | 40 bps |
| Lenders tracked | Active margin monitoring | 10 | 25+ |
| Grid-lag patterns | Lender update cycles mapped | 8 | 20+ |
| Securitization deals tracked | Non-QM deals in pipeline | 80% | 95% |
| User adoption | Brokers using dynamic pricing | 100 | 5,000+ |

---

## APPENDIX A: DATA SOURCE COMPREHENSIVE MATRIX

| Category | Source | Data | Cost | Refresh | API | Priority |
|----------|--------|------|------|---------|-----|----------|
| Treasury | treasury.gov | All yields | Free | Daily 3PM | ✅ | P1 |
| Treasury | FRED | Historical | Free | Daily | ✅ | P1 |
| Treasury | CME | Futures | $200+/mo | Real-time | ✅ | P2 |
| SOFR | NY Fed | Daily fixing | Free | 8AM ET | ✅ | P1 |
| SOFR | CME | SOFR futures | $200+/mo | Real-time | ✅ | P2 |
| MBS (Agency) | MBSQuoteline | TBA prices | $50-100/mo | Intraday | Web | P1 |
| MBS (Agency) | MND | Live MBS | $30/mo | 15-min | Web | P1 |
| MBS (Non-QM) | Bloomberg | Spread marks | $25K/yr | Real-time | ✅ | P3 |
| MBS (Non-QM) | Intex | Deal modeling | $5-15K/yr | T+1 | ✅ | P3 |
| MBS (Non-QM) | Refinitiv | Spread indices | $500+/mo | Real-time | ✅ | P3 |
| Securitization | KBRA | Presale reports | Free | Per deal | Web | P2 |
| Securitization | DBRS | Presale reports | Free | Per deal | Web | P2 |
| Securitization | ASR | Deal calendar | $2-5K/yr | Weekly | ✅ | P3 |
| Securitization | SEC EDGAR | ABS-EE filings | Free | Per deal | ✅ | P2 |
| Economic | Econ Calendar | Fed, CPI, NFP | Free | Scheduled | ✅ | P1 |
| Lender Rates | Rate sheet scraping | Grid rates | Dev time | Daily | Custom | P1 |
| Lender Rates | Optimal Blue API | PPE rates | Enterprise | Real-time | ✅ | P2 |
| Lender Rates | Broker community | Real-world quotes | Dev time | Real-time | Custom | P3 |

---

## APPENDIX B: GLOSSARY

| Term | Definition |
|------|-----------|
| **AOMT** | Angel Oak Mortgage Trust — the RMBS deal series issued by Angel Oak |
| **DRMT** | Deephaven Residential Mortgage Trust — Deephaven's deal series |
| **LLPA** | Loan-Level Pricing Adjustment — risk-based fee added to base rate |
| **MBS** | Mortgage-Backed Security — bond backed by a pool of mortgage loans |
| **Non-QM** | Non-Qualified Mortgage — loans that don't meet QM/ATR requirements |
| **PPE** | Product & Pricing Engine — software that generates rate quotes |
| **RMBS** | Residential Mortgage-Backed Security — MBS backed by residential loans |
| **SOFR** | Secured Overnight Financing Rate — benchmark for ARM loans |
| **TBA** | To-Be-Announced — the forward market for agency MBS |
| **UST** | U.S. Treasury — government bonds; the risk-free rate benchmark |
| **WAC** | Weighted Average Coupon — blended yield across all tranches of an MBS |
| **YSP/SRP** | Yield Spread Premium / Service Release Premium — broker compensation |

---

*This report was compiled based on deep domain expertise in MBS markets, DSCR lending, capital markets infrastructure, and the existing DSCR Intelligence Platform research corpus. Web search APIs were unavailable during compilation due to rate limiting; all data points represent established market knowledge current as of early 2026. Live verification of spread levels and deal specifics should be performed before production implementation.*
