# DSCR Sovereign OS: Deep-Dive Architectural Debt Analysis — Complete Research Edition

**Classification:** Sovereign OS — Engineering Intelligence — Maximum Depth  
**Sprint:** 7.1 — Full Debt Archaeology  
**Executed:** June 18, 2026  
**Research Anchors:** Trepp, S&P Ratings, SSRN, Moody's, EPFL, Columbia Business School, OCC, Federal Reserve, TUM Munich, pyvinecopulib (vinecopulib C++ research group), Fannie Mae, MBA

---

## Preface: The Market Is Already Validating These Debts

This document is not theoretical. Every debt described below has a live market signal confirming it is activating now.

The multifamily CMBS delinquency rate hit **7.15%** in March 2026 — above its previous record of 7.12% in October 2025. One year prior it was 5.44%. Two years prior it was 1.84%. That is a 4× increase in 24 months. Critically, **80% of the new distress is concentrated in two markets** — New York/New Jersey (48%) and Houston (30%) — a textbook geographic contagion cluster that no single-deal DSCR engine can detect because it has no portfolio network layer.

The overall CMBS delinquency rate rose to **7.55%** in March 2026, +41 bps month-over-month. The office sector hit 11.71%. Lodging jumped 137 bps in a single month to 7.31% — a volatility spike that no static correlation matrix can model because correlation spiked simultaneously with the level shock.

DSCR/Investor loan 60+ delinquency rates sit at **2.92%** as of December 2025, down from peak 2025 levels but still elevated versus 2023 levels, with bank statement loans worse at 3.99%. Loans originated in **2022** show the greatest exposure, with the highest proportion of DSCR below 1.0x — the exact vintage that benefited from pandemic-era rent spikes and is now unwinding as rates are locked at peak and rents have softened.

The multifamily CMBS special servicing rate reached **8.75%** in March 2026. Most of the new delinquencies in March 2026 were term defaults — not maturity defaults. The weighted average remaining term on newly delinquent loans was **over three years**, meaning the problem is operational cash flow collapse, not refinancing inability. This is the DSCR income model failing in real time.

Each architectural debt below has a direct thread to these live failure modes.

---

## DEBT 1: DSCR as a Ratio Is Not a Risk Metric

### The Structural Flaw

The entire DSCR underwriting framework — including the Sovereign OS in its current form — treats DSCR as a classification variable. Deals above threshold pass. Deals below threshold fail. This creates a binary boundary in a continuous risk landscape.

The fundamental quantitative error: **quarterly default rates increase by approximately 50% for each 0.1x step down in DSCR once the loan crosses below 1.3x.** For balance-weighted portfolios, the increase is even more drastic after the 1.3x threshold. This relationship, documented in Trepp's probability-of-default research on CRE loans, means the distance from the threshold matters enormously — a deal at 1.22x is not equivalent to a deal at 1.45x, and they cannot be treated as two members of the same "pass" bucket.

A further structural failure: the correlation between yearly change in unemployment and yearly change in DSCR loan probability of default is **0.87 (R² = 0.76)**. This means DSCR loan default is predominantly a macro phenomenon, not an idiosyncratic property-level event. Any system that evaluates deals in isolation — without modeling the macro regime under which future income will be realized — is misspecified by construction.

### The Empirical Evidence on LTV as a Confounding Variable

Research published in the *Journal of Housing Economics* and confirmed by GARP's European CRE work reveals a structurally important finding: after controlling for DSCR, LTV, market type, and property type, **all commercial mortgages behave similarly regardless of lender type** (bank, insurance company, CMBS). The implication: there is no "secret sauce" in originator sophistication. What drives outcomes is the financial performance of the property — the DSCR and LTV dynamics over the life of the loan — not the initial qualification check.

This finding is directly actionable: the system that wins is not the one that makes the most accurate pass/fail decision at origination. It is the one that correctly prices the full lifetime DSCR distribution, including all paths where DSCR starts above threshold and crosses below it at Month 18, Month 36, or Month 54 under macro stress.

### An Additional Layer: Lender-Induced Endogeneity

Commercial mortgage underwriting research from *Journal of Real Estate Finance and Economics* uncovered a structurally important confound: **lenders respond to unmeasured risk factors through credit rationing and pricing**. Loans with notably low LTV ratios actually carry higher-than-average risks in other unmeasured dimensions, creating a paradoxical pattern where loans with superficially strong LTV have default probabilities equal to or exceeding average. The implication for DSCR: the ratio itself is endogenous to the underwriting process. A deal at 1.22x may be there precisely because the lender priced out concerns not visible in the ratio. The ratio alone cannot be the final risk signal.

### The Solution Architecture

**Level 1 — Distributional DSCR Engine:**

Replace the point-DSCR calculation with a 5-dimensional stochastic DSCR surface:

- `P(DSCR_t < 1.0 | t = 12 months)` — near-term breach probability
- `P(DSCR_t < 1.0 | t = 36 months)` — medium-term breach probability
- `P(min DSCR < 1.0 over [0, T])` — lifetime breach probability
- `E[DSCR | macro recession scenario]` — macro-conditioned expected coverage
- `CVaR(DSCR loss | 95th percentile macro stress)` — tail conditional coverage

None of these is derivable without the Monte Carlo engine described in Debt 3. But the framing must be established in the output layer first — the engine is built to serve a distributional output architecture, not to decorate a single threshold.

**Level 2 — Debt Yield Integration:**

South State Bank's analysis of the DSCR/LTV problem notes that banks should embrace **debt yield** as a third credit metric alongside DSCR and LTV. Debt yield = NOI / Loan Amount. Unlike DSCR, debt yield is not sensitive to the interest rate used in underwriting — it measures the lender's yield from the property assuming they take ownership tomorrow. A low debt yield signals that the lender is over-relying on the rate environment staying stable. For the Sovereign OS:

```
Debt Yield = Annualized NOI / Loan Balance
Minimum acceptable: 8.0%+ (conservative), 7.0% (standard), 6.0% (aggressive)
Flag: Any deal with Debt Yield below 7.0% and DSCR between 1.15x–1.25x requires enhanced stress testing
```

---

## DEBT 2: Income Inputs Have No Propagated Uncertainty

### The Primary Source of Error

Clear Capital's rental AVM benchmarked against Form 1007 rent schedules reports a **6.65% error rate**. This is for a leading institutional product in well-covered markets. In thin markets — sub-urban, secondary MSAs, markets with fewer than 50 active STR comps — error rates compound significantly.

AirDNA's market score methodology requires at least 6 comparable properties within 2 miles with 65%+ occupancy rate. Markets that fail to meet these criteria get a market score below 60, which many lenders use as a disqualifying threshold. But the score itself is not a confidence interval. A market with score 62 and score 90 produce equally "valid" AirDNA numbers in the current system, despite radically different data quality.

The STR-specific risk is structural: **rental income volatility is the biggest risk factor for STR DSCR loans**. A slow season, a platform policy change, or extended vacancy can collapse income 30–50% in 90 days. This is not captured by annual AirDNA projections, which smooth across seasonal variation and do not model platform-level tail risks.

### Conformal Prediction — The Technical Standard

Conformal prediction is a **distribution-free** uncertainty estimation framework. It constructs prediction intervals with a *guaranteed coverage probability* — meaning if 90% coverage is requested, at least 90% of future observations will fall within the interval, regardless of the underlying income distribution or model specification. This is mathematically stronger than bootstrap confidence intervals (which are asymptotically valid but not guaranteed) and stronger than Bayesian credible intervals (which require correct prior specification).

The framework works as follows:

1. **Train** the base estimator (e.g., a gradient boosting model on rent price data)
2. **Calibrate** on a held-out calibration set by computing nonconformity scores: residuals |y_actual − y_predicted| for each calibration observation
3. **At inference**, compute the (1−α)-quantile of calibration scores: q̂ = quantile({score_1, ..., score_n}, ⌈(n+1)(1−α)⌉ / n)
4. **Output interval**: [ŷ − q̂, ŷ + q̂]

The theoretical guarantee: P(Y_new ∈ [ŷ − q̂, ŷ + q̂]) ≥ 1 − α, regardless of model structure or data distribution. This is what makes conformal prediction the correct choice for financial income estimation, where over-confidence has material credit consequences.

**Mondrian Conformal Prediction** (hierarchical variant) — directly referenced in a 2024 PhD thesis applying it to a *real estate tenant debt classification problem* — stratifies the calibration set by subgroup, producing tighter intervals for well-covered groups and wider intervals for thin-data groups. For DSCR rent estimation:

- Group 1: ZIPs with 50+ AVM comps → tight intervals
- Group 2: ZIPs with 10–49 comps → medium intervals
- Group 3: ZIPs with fewer than 10 comps → wide intervals, auto-flag for enhanced human review

**The key information-theoretic result** (arXiv 2405.02140): Conformal prediction intervals upper-bound the conditional entropy H(Y|X) — meaning conformal intervals are the mathematically tightest valid uncertainty representation, not just a conservative fallback. They are optimal by information-theoretic criteria.

### Downstream Propagation Requirements

Once every income input carries a `[lower_90, upper_90]` interval, the DSCR computation must propagate this interval. For a simple ratio:

```
DSCR = Income / Debt_Service
```

If Income ~ Uniform(L, U) (a simplifying assumption for propagation):

```
DSCR_lower_90 = L / Debt_Service
DSCR_upper_90 = U / Debt_Service
```

For the full multi-input case (LTR income, vacancy, OpEx), the propagation uses the Monte Carlo engine (Debt 3), drawing income samples from the conformal interval rather than a point. The conformal intervals become the marginal distributions that the R-vine copula samples from.

---

## DEBT 3: The Monte Carlo Assumes Stationary Correlation

### Why This Is the Exact Mechanism That Caused 2008

The Gaussian copula was not incorrect because it used a normal distribution. It was incorrect because it assumed a **stationary, time-invariant correlation structure** calibrated on historical data. Under stress, correlations between mortgage default events were dramatically higher than the historical matrix suggested. Losses were catastrophic not because individual defaults exceeded expectations, but because they occurred simultaneously in a way that was mathematically impossible under the assumed dependence structure.

The Bundesbank research confirms this: the choice of copula — normal versus Student-t — has only a "modest" effect on risk in the body of the distribution. The critical difference is in the **tail behavior**. Student-t copulas correctly capture symmetric tail dependence (joint extreme events occur more frequently than normal copula implies). But they cannot capture **asymmetric tail dependence**, which is the empirically correct structure for real estate stress:

- **Lower tail dependence (joint crashes):** Rent collapse and vacancy surge are more correlated in downturns than in normal conditions → Clayton copula
- **Upper tail dependence (joint spikes):** Cap rate expansion and OpEx surge are more correlated in inflationary stress → Gumbel copula
- **Symmetric tail dependence:** Rate shocks affect both income and exit value symmetrically → Student-t copula

### R-Vine: The Mathematically Correct Solution

The Technical University of Munich (TUM) vine copula research group — which maintains both the R `VineCopula` library and the C++ `vinecopulib` library (the backend of `pyvinecopulib`) — provides the authoritative technical reference. Their research confirms:

> "R-vine copulas with mixed families achieve the best statistical fit to credit portfolio data and the most reliable economic capital estimates."

A vine copula is a **pair-copula construction (PCC)**: it factorizes the joint density of n variables as a product of n(n-1)/2 bivariate copulas, each assigned to an edge in a cascade of trees. For n=5 variables (rent shock, vacancy shock, cap rate shock, rate shock, OpEx shock):

- Tree 1: 4 edges (unconditional bivariate copulas)
- Tree 2: 3 edges (bivariate copulas conditional on 1 variable each)
- Tree 3: 2 edges (conditional on 2 variables each)
- Tree 4: 1 edge (conditional on 3 variables)

Total: 10 bivariate copulas, each independently selected and calibrated. The resulting joint distribution correctly models the asymmetric tail dependence structure that flat correlation matrices cannot represent.

**`pyvinecopulib`** — the Python interface to the TUM-developed vinecopulib C++ library — is the production implementation:

```bash
pip install pyvinecopulib
```

```python
import pyvinecopulib as pv
import numpy as np

# Calibration data: historical or KBRA-scenario stress returns on each factor
# Each column: [rent_shocks, vacancy_shocks, cap_shocks, rate_shocks, opex_shocks]
data = np.column_stack([rent_shocks, vacancy_shocks, cap_shocks, rate_shocks, opex_shocks])

# Fit R-vine with AIC-based bivariate family selection
# Family set includes: Gaussian, Student-t, Clayton, Gumbel, Frank, Joe, BB1, BB7
controls = pv.FitControlsVinecop(
    family_set=pv.all,              # all bivariate families
    criterion='aic',                # AIC for family selection
    trunc_lvl=np.inf,               # all tree levels
    tree_criterion='tau',           # maximum spanning tree on Kendall's τ
    nonparametric_mult=1.0
)
vine = pv.Vinecop(data, controls=controls)

# Sample 10,000 joint stress scenarios
scenarios = vine.simulate(n=10000, seeds=[42])
# scenarios[:, 0] = rent_shock draws (correctly tail-dependent with vacancy)
# scenarios[:, 1] = vacancy_shock draws
# etc.
```

**`portvine`** — a higher-level library built on top of pyvinecopulib — provides **conditional and unconditional portfolio-level CVaR/VaR estimation** with backtesting and stress testing baked in. This is the production wrapper for the Sovereign OS portfolio risk layer.

### Calibrating to KBRA-Equivalent Stress Scenarios

The Sovereign OS should calibrate the vine copula inputs to stress scenario distributions that match institutional underwriting standards:

| Variable | Stable Market | Cyclical Market | Stress Market |
|---|---|---|---|
| Rent shock | ±10% | ±20% | ±30–40% |
| Vacancy surge | +200 bps | +500 bps | +1000 bps |
| Cap rate expansion | +50 bps | +100 bps | +200 bps |
| Rate shock | ±75 bps | ±150 bps | ±250 bps |
| OpEx shock | +5% | +10% | +20% |
| Copula family | Gaussian (mild) | Student-t (df=5) | Clayton + Gumbel (mixed) |

---

## DEBT 4: ARM Reset Uses Flat Curve — No Term Structure

### The Real Rate Environment in 2026

Current data as of May 2026: The 30-year fixed mortgage rate averages **6.36%** (Freddie Mac, May 14, 2026). Fannie Mae's latest forecast revised rates upward to **6.3% average for the rest of 2026 and 6.2–6.3% for 2027**. This is not the declining rate environment many ARM borrowers underwrote against.

Rates jumped from 5.99% in early 2026 (a near 4-year low) back to 6.36% following a macro shock — a 37-basis-point reversal in under 3 months. For a 5/6 ARM borrower who closed at a teaser rate in 2023–2024 and assumed rates would decline, the reset rate environment is now 100–200 bps above their projection. Any DSCR engine that used a flat forward curve anchored to the 2023 or 2024 rate environment has an unmodeled reset risk liability embedded in every ARM deal in its book.

### Nelson-Siegel-Svensson: The Full Technical Implementation

The NSS model fits a smooth, analytical yield curve to the observable swap/Treasury market. The curve is parameterized by six values: β₀ (level), β₁ (slope), β₂ (curvature 1), β₃ (curvature 2), λ₁ (decay 1), λ₂ (decay 2):

```
y(τ) = β₀
      + β₁ × [(1 − e^{−τ/λ₁}) / (τ/λ₁)]
      + β₂ × [(1 − e^{−τ/λ₁}) / (τ/λ₁) − e^{−τ/λ₁}]
      + β₃ × [(1 − e^{−τ/λ₂}) / (τ/λ₂) − e^{−τ/λ₂}]
```

The instantaneous forward rate f(τ) = −d/dτ [τ × y(τ)] gives the market's implied rate at any future maturity.

**FRED data inputs (all free):**
- SOFR1: 1-month SOFR swap rate
- SOFR3: 3-month SOFR swap rate
- SOFR6: 6-month SOFR swap rate
- SOFR12: 12-month SOFR swap rate
- DGS2: 2-year Treasury
- DGS5: 5-year Treasury
- DGS7: 7-year Treasury
- DGS10: 10-year Treasury

```python
from scipy.optimize import minimize, Bounds
import numpy as np
import pandas_datareader.data as web

def nss_yield(tau, b0, b1, b2, b3, l1, l2):
    """Nelson-Siegel-Svensson yield at maturity tau."""
    f1 = (1 - np.exp(-tau/l1)) / (tau/l1)
    c1 = f1 - np.exp(-tau/l1)
    f2 = (1 - np.exp(-tau/l2)) / (tau/l2)
    c2 = f2 - np.exp(-tau/l2)
    return b0 + b1*f1 + b2*c1 + b3*c2

def nss_forward(tau, b0, b1, b2, b3, l1, l2):
    """Instantaneous forward rate via numerical differentiation."""
    dt = 0.001
    y1 = nss_yield(tau + dt, b0, b1, b2, b3, l1, l2)
    y2 = nss_yield(tau - dt, b0, b1, b2, b3, l1, l2)
    return (y1*(tau+dt) - y2*(tau-dt)) / (2*dt)

def fit_nss(maturities: np.ndarray, yields: np.ndarray):
    """Fit NSS parameters to observed swap/Treasury quotes."""
    def objective(params):
        b0, b1, b2, b3, l1, l2 = params
        fitted = nss_yield(maturities, b0, b1, b2, b3, l1, l2)
        return np.sum((fitted - yields)**2)
    
    result = minimize(
        objective,
        x0=[0.05, -0.01, 0.01, 0.005, 1.5, 4.0],
        bounds=Bounds(
            lb=[0.01, -0.15, -0.15, -0.15, 0.05, 0.5],
            ub=[0.15,  0.15,  0.15,  0.15, 5.0,  20.0]
        ),
        method='L-BFGS-B'
    )
    return result.x

# Daily workflow:
# 1. Pull FRED data
# 2. Fit NSS parameters
# 3. Compute forward rate at ARM reset maturity
# 4. Add spread: projected_reset = forward_rate(reset_tau) + margin
```

### Dynamic Nelson-Siegel via Kalman Filter (for rate path simulation)

The **Diebold-Li model** treats β₀, β₁, β₂ as latent states that evolve over time according to a VAR(1) process. The Kalman filter jointly estimates the state dynamics and the observation equations (the swap/Treasury quotes). This gives:

1. The current best estimate of the yield curve factors (filtered state)
2. Their forecast one period ahead (predicted state)
3. The uncertainty around the prediction (predicted covariance)

MathWorks documents the complete implementation of the Diebold-Li DNS model via state-space methods and Kalman filtering. The output: a **distribution** over ARM reset rates, not a single forward point. For a 5/6 ARM resetting in Month 60, the DNS-Kalman model produces `(mean_reset_rate, σ_reset_rate)` from which Monte Carlo paths draw correlated rate realizations.

### Gaussian Process Alternative for Non-Standard Maturities

For deals with non-standard reset structures (e.g., 7/1 ARM, 10/6 ARM, stepped-rate products), Gaussian Process regression over the yield curve provides **full posterior uncertainty** at any maturity:

```python
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import Matern, WhiteKernel

kernel = Matern(length_scale=1.0, nu=2.5) + WhiteKernel(noise_level=1e-4)
gp = GaussianProcessRegressor(kernel=kernel, alpha=1e-6, normalize_y=True)
gp.fit(maturities.reshape(-1,1), yields)

# Predict at non-standard reset maturity (e.g., 7.5 years)
tau_target = np.array([[7.5]])
rate_mean, rate_std = gp.predict(tau_target, return_std=True)
# rate_mean: point estimate at 7.5-year maturity
# rate_std: epistemic uncertainty (shrinks with more data; wide for non-standard maturities)
```

The GP posterior at any maturity has the correct coverage property: the 90% credible interval contains the true rate 90% of the time, given the data. This is the correct tool for pricing non-standard ARM resets.

---

## DEBT 5: No Credit Loss Model (PD × LGD × EAD)

### The Live Delinquency Data Demands This Module

Trepp's CMBS probability-of-default research provides the empirical basis for PD modeling:

- Quarterly default rates **increase approximately 50% per 0.1x step down** in DSCR below 1.3x
- The correlation between unemployment changes and DSCR loan PD changes is 0.87 (R² = 0.76)
- 2022 vintage loans have the **highest concentration of DSCR below 1.0x** among all origination years
- Most 2026 defaults are **term defaults** — operational cash flow failure — not refinancing events

For the Sovereign OS to be a risk pricing system (not just a qualification system), it needs the FASB ASC 326 CECL framework implemented at deal level.

### CECL PD Curve: The Technical Architecture

The CECL standard requires a **lifetime expected credit loss** estimate incorporating "reasonable and supportable forecasts." For DSCR loans, this means the PD curve is not a static number — it is a term structure of default probabilities conditioned on the forward income path.

**Step 1 — Risk Rating Assignment:**

```python
def assign_risk_rating(dscr: float, ltv: float, fico: int,
                       property_type: str, market_tier: int) -> int:
    """
    Map deal characteristics to risk rating 1–10 (1=strongest, 10=near-default).
    Based on CECL migration analysis methodology.
    """
    base_score = 0
    # DSCR contribution
    if dscr >= 1.40: base_score += 0
    elif dscr >= 1.25: base_score += 1
    elif dscr >= 1.15: base_score += 2
    elif dscr >= 1.05: base_score += 3
    elif dscr >= 1.00: base_score += 4
    else: base_score += 6  # sub-1.0 is high risk regardless of other factors
    # LTV contribution
    if ltv <= 0.60: base_score += 0
    elif ltv <= 0.70: base_score += 1
    elif ltv <= 0.75: base_score += 2
    elif ltv <= 0.80: base_score += 3
    else: base_score += 4
    # Property type adjustment
    str_premium = {'STR': 2, 'MF': 0, 'SFR': 0, 'CONDO': 1}.get(property_type, 1)
    base_score += str_premium
    return min(base_score, 10)
```

**Step 2 — PD Curve (per risk rating):**

Historical CMBS migration matrices give the probability that a loan rated R at origination defaults within N years. The SSRN paper "Estimating Default Probabilities Implicit in Commercial Mortgage-Backed Security Prices" provides the structural underpinning: the unobservable current LTV (updated via REIT property-type indices) is the key state variable driving default, via a first-passage-time approach:

```
PD(t, T | LTV_t, rate_t) = P(LTV_T > 1.0 or DSCR_T < threshold | current state)
```

The first passage time approach: default occurs at the first time τ when the property value falls below the loan balance. Under geometric Brownian motion for property value:

```
V_τ = V_0 × exp[(μ_V − σ_V²/2)τ + σ_V × W_τ]
Default at τ: V_τ < L_τ  (loan balance at τ)
```

PD(0, T) = P(min_{t∈[0,T]} V_t < L_t) — standard first passage time probability formula.

For the Sovereign OS, the implementation combines:
- Structural model (first-passage-time) for the property value channel
- Reduced-form model (intensity process) for the income channel (DSCR collapse)
- Both channels feed into the overall PD estimate

**Step 3 — LGD Model:**

```python
def calculate_lgd(ltv_at_default: float,
                  state: str,
                  property_type: str) -> float:
    """
    LGD for DSCR investment property loan.
    LGD = 1 - (Recovery from collateral sale) / EAD
    Recovery = Property_Value_at_Default × (1 - distressed_discount) - foreclosure_costs
    """
    # Distressed sale discount: forced sale vs. market value
    distressed_discount = {
        'judicial': 0.22,      # judicial foreclosure states: 22% average discount
        'nonjudicial': 0.15    # non-judicial: faster sale, smaller discount
    }.get('judicial' if state in JUDICIAL_STATES else 'nonjudicial', 0.18)
    
    # Foreclosure costs as % of outstanding balance
    foreclosure_cost_pct = {
        'judicial': 0.08,      # 8% for judicial: legal fees + carrying costs + servicing
        'nonjudicial': 0.05    # 5% for non-judicial
    }.get('judicial' if state in JUDICIAL_STATES else 'nonjudicial', 0.06)
    
    # At default: Property Value ≈ Loan Balance / LTV_at_default
    # (where LTV_at_default reflects any property value decline since origination)
    recovery_rate = (1 / ltv_at_default) * (1 - distressed_discount) - foreclosure_cost_pct
    lgd = max(0.0, 1.0 - recovery_rate)
    return lgd
```

**Step 4 — EAD and Lifetime Expected Loss:**

```python
def calculate_el(balance: float, rate: float, term_months: int,
                 pd_curve: list[float], lgd: float,
                 elapsed_months: int = 0) -> float:
    """
    Lifetime expected credit loss under CECL.
    pd_curve: [PD_1yr, PD_2yr, ..., PD_Nyr] — cumulative PD at each horizon
    """
    monthly_rate = rate / 12
    total_el = 0.0
    
    for year_idx, cum_pd in enumerate(pd_curve):
        # EAD at this horizon: scheduled amortization
        months_elapsed = elapsed_months + (year_idx + 1) * 12
        if months_elapsed >= term_months:
            break
        remaining_payments = term_months - months_elapsed
        ead = balance * (((1 + monthly_rate)**remaining_payments - 1) /
                         ((1 + monthly_rate)**term_months - 1))
        
        # Marginal PD for this year
        marginal_pd = cum_pd - (pd_curve[year_idx-1] if year_idx > 0 else 0)
        
        # Discount to present value (optional: use risk-free rate)
        discount = 1 / (1 + rate) ** (year_idx + 1)
        
        total_el += marginal_pd * lgd * ead * discount
    
    return total_el
```

---

## DEBT 6: No Portfolio Contagion Model

### The 80/80 Rule Is Already Visible in the Data

**80% of new multifamily CMBS distress in March 2026 is concentrated in just two geographic clusters** — NY/NJ and Houston. This is not random. It is geographic contagion: shared macro shocks (NYC rent regulation, Texas insurance cost surge), shared lender concentration, and shared sponsor leverage patterns interacting with a common macro event.

EPFL's research on measuring default contagion and systemic risk provides the formal framework. The key insight:

> "Network models provide useful insight into default contagion and systemic risk. Heterogeneity of network structure is important: homogeneous models may give wrong insights. Monitoring exposure ratios — ratio of capital to largest exposure — signals 'dangerous links.'"

A financial system is naturally modeled as a **network**: nodes are financial participants (sponsors, lenders, properties), edges are counterparty exposures. Contagion propagates through the network when a node failure triggers cascading losses through its links.

### The Contagion Index Formula (EPFL)

For a portfolio of DSCR loans, the Contagion Index of sponsor i:

```
CI(i) = E[DI(i, c + ε, l, E) | c_i + ε_i ≤ 0]
```

Where:
- DI(i, ...) = Default Impact of sponsor i: total loss cascaded through the network when i defaults
- c_i + ε_i ≤ 0: the condition that sponsor i defaults (assets plus shock fall below zero)
- ε = correlated market shocks from a factor model (the R-vine Monte Carlo outputs feed here)

The Systemic Risk Index:

```
S(i) = E[LC(i, c + ε, E) | c_i + ε_i ≤ 0]
```

Where LC(i, ...) is the loss incurred to the core portfolio by the default of i, cascaded through the exposure network.

### Implementation: Networkx + Graph Contagion Simulation

```python
import networkx as nx
import numpy as np

def build_dscr_portfolio_network(deals: list[dict]) -> nx.DiGraph:
    """
    Build network graph from DSCR portfolio.
    Nodes: sponsors, properties, MSAs, lenders
    Edges: exposure relationships with weights = exposure size
    """
    G = nx.DiGraph()
    
    for deal in deals:
        sponsor = f"sponsor_{deal['sponsor_id']}"
        prop = f"prop_{deal['property_id']}"
        msa = f"msa_{deal['msa_code']}"
        lender = f"lender_{deal['lender_id']}"
        
        G.add_node(prop, type='property', balance=deal['loan_balance'],
                   dscr=deal['dscr'], ltv=deal['ltv'])
        G.add_edge(sponsor, prop, weight=deal['loan_balance'])    # sponsor owns property
        G.add_edge(prop, msa, weight=deal['property_value'])      # property in MSA
        G.add_edge(lender, prop, weight=deal['loan_balance'])     # lender exposed to property
    
    return G

def calculate_sponsor_concentration(G: nx.DiGraph, sponsor_id: str) -> dict:
    """
    Compute concentration metrics for a single sponsor.
    """
    sponsor_node = f"sponsor_{sponsor_id}"
    properties = list(G.successors(sponsor_node))
    
    total_exposure = sum(G[sponsor_node][p]['weight'] for p in properties)
    msa_exposure = {}
    for p in properties:
        for msa in G.successors(p):
            msa_exposure[msa] = msa_exposure.get(msa, 0) + G[p][msa]['weight']
    
    herfindahl_index = sum((v/total_exposure)**2 for v in msa_exposure.values())
    
    return {
        'sponsor_id': sponsor_id,
        'total_exposure': total_exposure,
        'property_count': len(properties),
        'msa_count': len(msa_exposure),
        'herfindahl_index': herfindahl_index,     # 1.0 = perfect concentration
        'top_msa_share': max(msa_exposure.values()) / total_exposure if msa_exposure else 0
    }
```

### Spectral Risk Measures for Portfolio Concentration

The Herfindahl-Hirschman Index (HHI) measures concentration in a single portfolio:

```
HHI = Σ_i (exposure_i / total_exposure)²
```

HHI = 1.0: perfectly concentrated (one sponsor or one MSA)
HHI < 0.15: low concentration (diversified portfolio)
HHI > 0.25: high concentration (regulatory concern threshold)

For the Sovereign OS, compute HHI at three levels:
1. **Sponsor HHI**: within-sponsor property concentration across MSAs
2. **MSA HHI**: portfolio exposure concentration across MSAs
3. **Lender HHI**: portfolio exposure concentration across lenders

Flag any deal that pushes any HHI above 0.25 for enhanced review and reserve requirement.

---

## DEBT 7: LLM Layer Has No Hallucination Firewall

### The Problem Is Well-Documented and Quantified

LLM hallucinations in financial contexts are not rare edge cases. They are systematic. Financial numbers are particularly vulnerable because:
1. LLMs are trained to produce **coherent prose**, not numerically faithful output
2. Numbers in prose undergo implicit rounding, unit conversion errors, and magnitude shifts
3. The model has no internal register comparing "what I'm about to write" against "what the source data says"

Amazon Bedrock's Automated Reasoning checks (launched December 2024) represent the first mathematically sound solution: logic-based algorithmic verification using formal proof techniques to validate LLM outputs against encoded rules. The mechanism:
1. Encode the engine's output JSON as a formal logical policy
2. The LLM generates narrative
3. The automated reasoning system checks every claim in the narrative against the policy
4. Factual inaccuracies and inconsistencies are flagged with an explanation

This is the gold standard. But it requires AWS Bedrock integration. For the Sovereign OS, a deterministic in-process fact-checker achieves equivalent coverage for financial numbers.

### The Three Hallucination Types in Financial Narrative

Based on the Datadog LLM hallucination research (2025), hallucinations in financial documents fall into three categories:

**Type 1 — Magnitude Drift:** "$1.24 million" becomes "$124,000" or "$12.4 million." The relative ordering is preserved but the absolute value is wrong.

**Type 2 — Label Swap:** The DSCR value is stated but attached to the wrong field ("LTV of 1.24x" instead of "DSCR of 1.24x").

**Type 3 — Fabricated Supporting Claims:** The LLM fills in plausible but uncomputed context — "comparable properties in the area trade at cap rates of 5.5–6.0%" — when no comp analysis was performed.

### The Deterministic Financial Fact-Checker

```python
import re
import json
from dataclasses import dataclass
from typing import Optional

@dataclass
class FinancialClaim:
    value: float
    unit: str          # 'ratio', 'pct', 'dollars', 'months', 'years'
    context: str       # surrounding text
    position: int      # character position in narrative

class LLMFinancialFactChecker:
    """
    Deterministic fact-checker for LLM-generated DSCR deal narratives.
    Extracts all numeric claims and cross-references against engine output.
    """
    TOLERANCE = 0.005  # 0.5% tolerance for rounding
    
    # Patterns for financial number extraction
    PATTERNS = {
        'ratio': r'(\d+\.\d+)x',
        'pct': r'(\d+\.?\d*)\s*%',
        'dollars': r'\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)',
        'months': r'(\d+)\s*(?:month|mo)',
        'bps': r'(\d+)\s*(?:basis points?|bps)',
    }
    
    def extract_claims(self, narrative: str) -> list[FinancialClaim]:
        claims = []
        for unit, pattern in self.PATTERNS.items():
            for m in re.finditer(pattern, narrative, re.IGNORECASE):
                raw_val = m.group(1).replace(',', '')
                claims.append(FinancialClaim(
                    value=float(raw_val),
                    unit=unit,
                    context=narrative[max(0,m.start()-50):m.end()+50],
                    position=m.start()
                ))
        return claims
    
    def check_narrative(self, narrative: str, engine_output: dict) -> dict:
        """
        Main validation method.
        Returns: {
            'verified': [...claims that match engine output],
            'mismatched': [...claims with wrong values],
            'unverifiable': [...claims with no engine_output anchor],
            'pass': bool
        }
        """
        claims = self.extract_claims(narrative)
        all_values = self._flatten_engine_values(engine_output)
        
        verified, mismatched, unverifiable = [], [], []
        
        for claim in claims:
            match = self._find_matching_value(claim.value, all_values)
            if match:
                verified.append({'claim': claim, 'source': match})
            elif any(abs(claim.value - v) / max(abs(v), 1e-9) < 0.05
                     for v in all_values.values()):
                # Close but not within tolerance — flag as mismatch
                mismatched.append({'claim': claim, 'closest': min(
                    all_values.items(), key=lambda x: abs(x[1]-claim.value))})
            else:
                unverifiable.append(claim)
        
        return {
            'verified': verified,
            'mismatched': mismatched,
            'unverifiable': unverifiable,
            'pass': len(mismatched) == 0,
            'requires_human_review': len(mismatched) > 0 or len(unverifiable) > 3
        }
    
    def _flatten_engine_values(self, obj: dict, prefix: str = '') -> dict:
        """Recursively extract all numeric values from nested engine output."""
        result = {}
        for k, v in obj.items():
            key = f"{prefix}.{k}" if prefix else k
            if isinstance(v, (int, float)):
                result[key] = float(v)
            elif isinstance(v, dict):
                result.update(self._flatten_engine_values(v, key))
        return result
    
    def _find_matching_value(self, value: float, all_values: dict) -> Optional[str]:
        for key, v in all_values.items():
            if abs(value - v) / max(abs(v), 1e-9) <= self.TOLERANCE:
                return key
        return None
```

### SR 26-02 Governance Requirements for the LLM Layer

SR 26-02 issued April 17, 2026 explicitly places generative AI **outside the scope** of model risk management guidance. But the guidance is equally explicit that broader risk management and governance practices still apply. For the Sovereign OS:

- No LLM-generated content proceeds to final PDF without fact-checker `pass = True`
- Any narrative with `requires_human_review = True` is routed to a human underwriter before finalization
- The fact-checker result is logged in the Evidence Vault with timestamp, model version, and narrative hash
- LLM outputs are never used as the primary source for numerical claims in regulatory documents — only for presentation layer narrative

---

## DEBT 8: Evidence Vault Has No Model Version Tracking

### The Regulatory Standard: SR 26-02 Model Inventory

SR 26-02 (April 17, 2026) requires a **live, structured model inventory** that tracks model risk at both individual and aggregate levels, with sufficient metadata to support enterprise-wide visibility into model concentrations and dependencies. Specifically:

1. **Conceptual soundness documentation**: Documentation sufficient that parties unfamiliar with a model can understand how it operates, its limitations, and its key assumptions
2. **Outcomes analysis**: Ongoing comparison of model outputs against real-world results via backtesting and prediction-versus-actual
3. **Ongoing monitoring**: Drift detection and trigger-based re-validation rather than fixed annual cycles
4. **Model inventory**: Complete registry at enterprise level — not just individual model documentation

The ValidMind SR 26-02 analysis (April 2026) emphasizes: "a live, structured model inventory that tracks model risk at both the individual and aggregate levels, with sufficient metadata to support enterprise-wide visibility into concentrations and dependencies."

### MLflow Model Registry: The Production Implementation

MLflow Model Registry (version 2.x+) provides exactly this infrastructure:

```python
import mlflow
import mlflow.sklearn
from mlflow.tracking import MlflowClient

def log_model_inference(
    model_name: str,
    model_version: str,
    deal_id: str,
    input_features: dict,
    output: dict,
    conformal_interval: dict
):
    """
    Log every model inference with full audit trail.
    Compliant with SR 26-02 model inventory requirements.
    """
    with mlflow.start_run(run_name=f"inference_{deal_id}"):
        # Input features (normalized but traceable)
        mlflow.log_params({f"input_{k}": v for k, v in input_features.items()})
        
        # Model metadata
        mlflow.set_tags({
            'model_name': model_name,
            'model_version': model_version,
            'deal_id': deal_id,
            'inference_type': 'dscr_underwriting',
            'data_cutoff': '2026-Q1',
            'sr262_compliant': 'true'
        })
        
        # Output metrics
        for k, v in output.items():
            if isinstance(v, (int, float)):
                mlflow.log_metric(k, v)
        
        # Conformal interval coverage tier
        mlflow.log_metric('interval_lower_90', conformal_interval['lower_90'])
        mlflow.log_metric('interval_upper_90', conformal_interval['upper_90'])
        mlflow.log_metric('interval_width', 
                          conformal_interval['upper_90'] - conformal_interval['lower_90'])
        
        # Feature importances at inference time (SHAP values)
        # Critical: this is not the training-time importance — it is the instance-level explanation
        if 'shap_values' in output:
            for feat, shap_val in output['shap_values'].items():
                mlflow.log_metric(f"shap_{feat}", shap_val)
```

### Model Version Lifecycle in the Sovereign OS

```
Model Stages (MLflow + SR 26-02 mapping):
┌─────────────────────────────────────────────────────────┐
│ DEVELOPMENT   → Staging → Production → Archived         │
│                                                         │
│ Development:  Conceptual soundness review required       │
│ Staging:      Backtesting on held-out deals required    │
│ Production:   Ongoing monitoring + drift detection      │
│ Archived:     Full inference log preserved for 7 years  │
│               (regulatory retention requirement)        │
└─────────────────────────────────────────────────────────┘
```

### Drift Detection: The Third Pillar of SR 26-02 Compliance

SR 26-02 emphasizes trigger-based re-validation rather than fixed cycles. The correct implementation uses statistical process control on model output distributions:

```python
from scipy import stats
import numpy as np

class ModelDriftMonitor:
    """
    Population Stability Index (PSI) based drift detection.
    PSI < 0.10: no significant shift (stable)
    PSI 0.10–0.25: moderate shift (investigate)
    PSI > 0.25: major shift (re-validate immediately)
    """
    
    def calculate_psi(self, baseline_scores: np.ndarray,
                      current_scores: np.ndarray,
                      buckets: int = 10) -> float:
        """
        Population Stability Index for model output drift.
        Used for: XGBoost approval probability, TFT rent forecasts,
                  Monte Carlo DSCR distributions.
        """
        baseline_hist = np.histogram(baseline_scores, bins=buckets)[0]
        current_hist = np.histogram(current_scores, bins=buckets,
                                    range=(baseline_scores.min(), baseline_scores.max()))[0]
        
        # Avoid division by zero
        baseline_pct = (baseline_hist + 0.0001) / len(baseline_scores)
        current_pct = (current_hist + 0.0001) / len(current_scores)
        
        psi = np.sum((current_pct - baseline_pct) * np.log(current_pct / baseline_pct))
        return psi
    
    def check_all_models(self, model_registry: dict) -> dict:
        """Weekly drift check across all production models."""
        results = {}
        for model_name, model_data in model_registry.items():
            psi = self.calculate_psi(
                model_data['baseline_scores'],
                model_data['recent_scores']
            )
            results[model_name] = {
                'psi': psi,
                'status': 'stable' if psi < 0.10 
                          else 'investigate' if psi < 0.25 
                          else 'REVALIDATE_NOW',
                'trigger_revalidation': psi >= 0.25
            }
        return results
```

---

## Part II: The Complete Mathematical Priority Stack

| Priority | Module | Library/Method | Complexity | Time-to-Deploy |
|---|---|---|---|---|
| 1 | Conformal Prediction on income inputs | `mapie` or `crepes` (Python) | Medium | 1–2 weeks |
| 2 | R-Vine Copula Monte Carlo | `pyvinecopulib` (C++ backend) | High | 3–4 weeks |
| 3 | LLM Hallucination Firewall | In-process regex + logic checker | Low | 3–5 days |
| 4 | MLflow Model Registry + Audit Trail | `mlflow` (open-source) | Low-Medium | 1 week |
| 5 | Nelson-Siegel-Svensson Rate Surface | `scipy.optimize` + FRED API | Medium | 1–2 weeks |
| 6 | CECL PD/LGD/EAD Model | Custom Python + CMBS migration data | High | 4–6 weeks |
| 7 | EVT Tail Calibration | `scipy.stats.genpareto` | Medium | 1–2 weeks |
| 8 | PSI Drift Detection | `scipy` + `mlflow` | Low | 1 week |
| 9 | Portfolio Network / HHI | `networkx` + custom | Medium | 2–3 weeks |
| 10 | Debt Yield Integration | In-process calculation | Very Low | 1 day |
| 11 | Dynamic NS via Kalman Filter | `filterpy` or `pykalman` | High | 2–3 weeks |
| 12 | CVaR Coherent Risk Measures | In-process on Monte Carlo output | Low | 2–3 days |
| 13 | Merton Sponsor Distance-to-Default | Closed-form Python | Medium | 1 week |

---

## Conclusion: The Architecture That Survives the Cycle

Every one of these eight debts is a live failure mode visible in current market data. The 80/20 split of new multifamily CMBS distress concentrating in two MSAs is the portfolio contagion model failing. The 2022 vintage loans with the highest DSCR-below-1.0x concentration are the stationary correlation assumption failing. The 37-bps rate reversal in Q1 2026 is the flat-curve ARM pricing assumption failing. The S&P delinquency doubling is DSCR-as-a-threshold failing.

The Sovereign OS, upgraded with these modules, becomes the only DSCR system that:
1. Reports a **probability distribution** instead of a pass/fail ratio
2. Models **tail-dependent joint stress** correctly with R-vine copulas
3. Prices ARM resets from a **live rate surface** fitted daily to SOFR swap quotes
4. Computes **lifetime expected credit loss** under the CECL framework
5. Detects **geographic contagion clusters** before they become delinquency concentrations
6. Maintains a **mathematically verified** audit trail from raw input to final narrative
7. Governs every model under **SR 26-02** — the actual current standard, not the superseded SR 11-7

This is not incremental improvement. It is the structural difference between a mortgage calculator that worked in 2021 and an institutional credit intelligence system designed for the 2026 cycle.
