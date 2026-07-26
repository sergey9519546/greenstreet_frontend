# DSCR Sovereign OS: Architectural Debt, Systemic Vulnerabilities, and Institutional-Grade Mathematics

**Classification:** Sovereign OS — Engineering Intelligence  
**Sprint:** 7.0 — Architecture Audit & Advanced Math Integration  
**Executed:** June 18, 2026

---

## Executive Summary

The DSCR market is showing the first real structural cracks. DSCR loan delinquencies have doubled over the past two years according to S&P Global Ratings (see "Consumer Pulse: The Rising Rate Of Non-QM And DSCR Mortgage Impairments", April 22, 2025, https://www.spglobal.com/ratings/en/regulatory/article/250422-the-rising-rate-of-non-qm-and-dscr-mortgage-impairments-s13477971; PAYWALLED, verbatim quote pending subscription access; metric direction corroborated by LinkedIn secondary source https://www.linkedin.com/posts/seankellyrand_dscr-activity-7371178315052638208-tIw5), with the transition rate from current to 60+ days delinquent reaching nearly 3% by end of 2024. Commercial mortgage delinquency rates reached 4.02% in Q1 2026. The CMBS office delinquency rate hit an all-time high of 12.34% in January 2026. This is not background noise — it is the market signaling that underwriting systems built on point-estimate DSCR ratios are systemically insufficient.

The Sovereign OS has eight critical architectural debts that, unresolved, leave it vulnerable to exactly the conditions that are now materializing. This report identifies all eight, explains the institutional math required to resolve each, and provides the primary source anchors for every mathematical framework referenced.

Separately, SR 11-7 — the model risk management standard that governed quantitative models in banking since 2011 — was formally replaced on April 17, 2026 by SR 26-02, issued jointly by the Fed, OCC, and FDIC. The new guidance narrows what counts as a "model," introduces formal materiality tiers, places generative and agentic AI explicitly outside the MRM perimeter, and changes the validation logic from prescriptive compliance toward risk-proportionate governance. Every claim in this report is calibrated against SR 26-02, not the superseded SR 11-7.

---

## Part I: Critical Architectural Debt

### Debt 1 — DSCR as a Ratio Is Not a Risk Metric

**The vulnerability:** The entire system currently classifies deals as PASS or FAIL based on whether DSCR clears a threshold (typically 1.20x). A deal with DSCR 1.22x passes. A deal with DSCR 1.19x fails. These two deals are treated as categorically different despite being statistically indistinguishable given the uncertainty in income estimation. Worse, a deal with DSCR 1.22x on a wildfire-exposed Airbnb property and a deal with DSCR 1.22x on a fully leased long-term rental in a supply-constrained market are treated identically.

**What is actually happening in the market:** Banks that survived 2020–2024 without catastrophic portfolio losses are now explicitly integrating "submarket vulnerability scores" and "sponsor liquidity metrics" into their risk-rating systems alongside DSCR and LTV. Commerce Bancshares and BOK Financial have both publicly disclosed overhauls of their internal risk-rating frameworks to incorporate forward-looking indicators rather than relying on point-in-time coverage ratios.

**The institutional fix:** DSCR must become a *distribution* not a *point*. The correct expression is:

- P(DSCR < 1.0) — probability of income shortfall in any single month
- P(min DSCR < 1.0 over 60-month horizon) — probability of breach at any point in the hold period
- Expected DSCR conditional on a 2-sigma rent shock — tail-scenario coverage ratio
- Conditional Value at Risk (CVaR) on annualized debt service coverage — expected shortfall in the worst 5% of scenarios

None of these is computable without a stochastic income engine. A single-scenario DSCR number is structurally incomplete as a risk signal, regardless of how precisely it is computed.

---

### Debt 2 — Income Inputs Have No Propagated Uncertainty

**The vulnerability:** RentCast returns a point estimate. AirDNA returns a projected gross revenue number. HouseCanary returns an AVM. These numbers enter the engine as certainties and produce DSCR as a certainty. The uncertainty in these inputs — which is substantial, typically ±8–15% on AVM and ±15–25% on STR revenue projections depending on market density — is never represented in the output.

**Real-world consequence:** An STR deal in a thin market where AirDNA has 12 properties as comps gets the same treatment as a long-term rental in a deep market with 500 leases in the last 6 months. The former has 3× the income estimation uncertainty, but the DSCR output looks equally confident.

**The institutional fix:** Conformal prediction wrappers on all income inputs, with hierarchical calibration:
- Level 1: ZIP code calibration (if sufficient history)
- Level 2: MSA calibration (if ZIP is thin)
- Level 3: State-level calibration (if MSA is thin)
- Level 4: National fallback with wide intervals

Every income input must carry a `[lower_90, upper_90]` interval. The DSCR computation must propagate this interval through the math. The output is not "DSCR = 1.24x." It is "DSCR = 1.24x [90% CI: 1.09x–1.39x]."

---

### Debt 3 — The Monte Carlo Assumes Independent Inputs

**The vulnerability:** The current t-copula Monte Carlo draws correlated samples of rent growth, vacancy, exit cap rate, rate shock, and OpEx shock using a single 5×5 correlation matrix calibrated to historical data. This is substantially better than independent draws. But it has a critical blind spot: the correlation structure is assumed to be *stationary*. In reality, correlations spike sharply during stress events — the joint tail behavior of rent collapse + vacancy surge + cap rate expansion + financing freeze is dramatically worse than the normal-regime correlation matrix implies.

**The Gaussian copula failure (2008):** This is the exact mechanism that caused CDO mispricing before 2008. The Gaussian copula assumed a fixed correlation structure. In stress, correlations between mortgage default events were much higher than the historical matrix suggested. The losses were catastrophic not because individual defaults were higher than expected, but because they happened simultaneously in a way the model could not reproduce.

**The DSCR parallel:** A wildfire event in a California market simultaneously causes: vacancy surge (tenants displaced), rent collapse (demand shock), property value decline (AVM shock), insurance cost spike (OpEx shock), and lender pullback (financing freeze). These five events are nearly perfectly correlated in that scenario. The t-copula with a historical correlation matrix, calibrated on normal market conditions, will not reproduce this tail dependence structure.

**The institutional fix:** R-vine copulas with asymmetric tail dependence per edge. The key academic finding: D-vine structures offer a better statistical fit to credit portfolio data than classical copulas, but R-vine structures offer the best statistical fit and the most reliable economic capital estimates when different copula families are mixed per edge. The correct implementation:

- Use a Clayton copula on the rent-vacancy edge (lower tail dependent — joint crashes are correlated)
- Use a Gumbel copula on the cap rate-OpEx edge (upper tail dependent — joint spikes are correlated)
- Use a Student t copula on the rent-cap rate edge (symmetric tail — both tails matter)
- Use R-vine structure selection (maximum spanning tree on absolute Kendall's τ) to determine which edges to model

This is not a research toy. It is the standard used in institutional credit portfolio risk systems.

---

### Debt 4 — No Forward Rate Surface; ARM Reset Uses a Flat Curve Assumption

**The vulnerability:** The ARM reset engine currently uses the current SOFR swap rate to project payments at reset. This is a point forecast of a *term structure* of rates. If the reset is 5 years away, the 5-year SOFR swap rate is a reasonable anchor, but the engine does not account for rate path uncertainty between now and reset, nor does it use the full forward curve to price the reset probability distribution.

**The institutional fix — Nelson-Siegel-Svensson rate surface:** The Nelson-Siegel model decomposes the yield curve into three components:

- β₀: long-run level of rates (the constant that does not decay)
- β₁: short-term slope component (starts at 1, decays quickly to 0)
- β₂: medium-term curvature component (starts at 0, increases, then decays to 0)
- λ: decay factor controlling the speed at which short-term effects dissipate

The Svensson extension adds a second curvature term (β₃, λ₂) for better fit at extreme maturities. Fitting this model to current SOFR swap quotes gives a complete term structure. The forward rate at any future maturity τ is then analytically available. For ARM reset pricing:

- Read the forward curve at the reset maturity (typically Month 60 for a 5/6 ARM)
- Apply the margin (2.50% over 6-month CME Term SOFR, for example)
- Run a rate path simulation using a Vasicek or Hull-White short-rate model around the forward curve as the mean-reverting level
- This gives a distribution of reset rates, not a single point

For the Sovereign OS, the minimum correct implementation is to fit Nelson-Siegel to current SOFR swap quotes daily and use the resulting forward curve for ARM reset pricing. The Monte Carlo can then draw reset rates from the simulated rate distribution rather than treating the current 5Y SOFR as a certainty.

---

### Debt 5 — No Credit Loss Model (PD × LGD × EAD)

**The vulnerability:** The engine computes the probability that a deal *qualifies* at origination. It does not compute the expected credit loss over the life of the loan. These are categorically different problems. A deal with DSCR 1.22x at origination may have a 3% probability of default at 36 months under a moderate stress scenario. A deal with DSCR 1.30x in a volatile STR market with a 9-month lease history may have a 7% probability of default at the same horizon. Without a credit loss model, the engine cannot rank order deals by expected loss, cannot compute portfolio-level CECL reserves, and cannot price risk premiums correctly.

**Why this matters now:** DSCR delinquencies have doubled in two years. The first-mover in building a real expected credit loss model for DSCR loans — not just a threshold qualifier but a lifetime loss estimate — will hold a structural analytical advantage.

**The institutional framework — CECL PD/LGD/EAD:**

Expected Loss = PD × LGD × EAD

Where:
- PD (Probability of Default): probability the loan defaults within a given horizon
- LGD (Loss Given Default): fraction of outstanding balance lost if default occurs — for DSCR, this is 1 minus recovery from collateral sale, net of foreclosure costs
- EAD (Exposure at Default): outstanding loan balance at the time of default, accounting for scheduled amortization and any prepayment

For a portfolio of DSCR loans, the correct CECL implementation uses:
- Pool-level PD curves by vintage, FICO band, LTV band, property type, and geographic cluster
- LGD modeled as (1 − LTV at default × haircut factor), where the haircut accounts for distressed sale discount and foreclosure costs
- EAD modeled with scheduled amortization (standard amortizing loans) or partial prepayment assumptions

The FASB ASC 326 (CECL) standard requires reasonable and supportable forecasts integrated into lifetime loss estimates. For DSCR loans, "reasonable and supportable" means the rent forecast is not just "current rent stays flat." It means using the TFT or TimesFM rent projection and integrating the PD curve with the income path.

The Basel III/CRE32 framework provides the canonical risk components framework for PD, LGD, EAD, and M (effective maturity), which is the institutional reference for any credit loss model built into the Sovereign OS.

---

### Debt 6 — No Contagion Model for Portfolio-Level Risk

**The vulnerability:** Every deal in the current system is evaluated independently. There is no model of how deals in the same sponsor's portfolio, the same ZIP code cluster, or the same lender's book interact under stress. Real portfolio losses do not come from randomly distributed independent defaults. They come from correlated clusters — a sponsor over-leveraged in Airbnb properties across four Sun Belt markets; a lender concentrated in 1031 exchange deals closed in late 2022 at peak valuations.

**Real market signal:** The FSB released a report in May 2026 on vulnerabilities in private credit, specifically calling out: hidden leverage at fund and investor levels limits visibility into actual risks; indirect exposures are not captured in first-layer reporting; the absence of standardized classification makes it structurally difficult to monitor contagion paths.

**The institutional fix — Spatio-temporal graph risk:** A graph-based risk layer models the network of exposures:
- Sponsor nodes: edges to all properties a single sponsor holds across the Sovereign portfolio
- Property nodes: edges to neighboring properties in the same ZIP or STR cluster
- Lender nodes: edges to all loans in a single lender's book
- MSA nodes: edges to all properties within the same macro market

Graph contagion algorithms (spectral methods, random walk centrality, community detection) identify which clusters carry the highest systemic correlation. The implementation pattern is: GNN-derived embeddings as features into the tabular champion — not an end-to-end black box, but structured network risk features in an interpretable model.

This is the upgrade that changes the Sovereign OS from a single-deal engine to a portfolio intelligence system.

---

### Debt 7 — LLM Layer Has No Hallucination Firewall

**The vulnerability:** If Claude or any LLM is given the engine's JSON output and asked to write an IC memo, there is currently no formal check that the numbers in the prose match the numbers in the computation. LLMs will round, misattribute, or confabulate financial figures — not because they are broken, but because they are generative text systems optimized for coherence, not numerical precision.

**SR 26-02 implication (April 17, 2026):** The new model risk guidance explicitly places generative AI and agentic AI *outside the scope* of the model risk perimeter but does not exempt them from broader governance requirements. The guidance notes: "for tools like generative and agentic AI models that are expressly outside the scope of the guidance, banking organizations should continue to rely on their broader risk management and governance practices to determine appropriate controls." The regulatory implication is that any LLM-generated content that influences a credit decision needs a governance chain, even though it is not formally an MRM model.

**The institutional fix:** A deterministic financial fact-checker that runs after every LLM generation:
```python
def verify_llm_narrative(narrative: str, engine_output: dict) -> dict:
    """
    Extract all numeric claims from narrative using regex/NLP.
    Cross-reference every number against the engine_output JSON.
    Return: {verified: [...], mismatched: [...], fabricated: [...]}
    """
    # Any number in narrative that is not within 0.5% of a value in engine_output
    # is flagged as MISMATCH and cannot proceed to PDF generation without human review
```

Human review is mandatory before any LLM-generated content proceeds to final documentation. This is not optional under SR 26-02's broader governance language, and it is not optional from a liability standpoint.

---

### Debt 8 — Evidence Vault Has No Model Version Tracking

**The vulnerability:** If the XGBoost approval predictor is retrained weekly and a deal was evaluated at Week 14, there is no automatic record of which model version produced which output. Six months later, when a borrower challenges an underwriting decision, the system cannot reproduce the exact inference that produced the verdict.

**SR 26-02 requirement:** The new guidance explicitly requires documentation sufficient that parties unfamiliar with a model can understand how it operates, its limitations, and its key assumptions. Model inventory must support enterprise-level visibility into model concentrations, dependencies, and aggregate risk exposure.

**The institutional fix:** Every model inference must be stamped with:
- Model name, version, and git hash
- Training data cutoff date and size
- Feature importances at inference time (not just at training time)
- Raw input vector (normalized but traceable)
- Output probability and calibration version
- Conformal interval and coverage tier

This is the model audit trail. It is not overhead — it is the legal memory that makes the system defensible.

---

## Part II: Institutional Mathematics — The Complete Upgrade Stack

### Module 1: R-Vine Copula for Tail-Dependent Joint Stress

**Primary reference:** "Application of Vine Copulas to Credit Portfolio Risk Modeling" (JRFM 2016). Key finding: R-vine copulas with mixed families achieve the best statistical fit to credit portfolio data and the most reliable economic capital estimates, outperforming both D-vine structures and classical copulas.

**Mathematical framework:**

An R-vine is defined by:
- A sequence of trees T₁, T₂, ..., T_{n-1} where each tree T_i has nodes equal to the edges of T_{i-1}
- A bivariate copula C_{e|D(e)} assigned to each edge e in the vine, where D(e) is the conditioning set

The joint density factorizes as a product of bivariate copulas over all edges. This is the pair-copula construction (PCC). For a 5-variable DSCR stress model (rent_shock, vacancy_shock, cap_rate_shock, rate_shock, OpEx_shock):

Structure selection: Use maximum spanning tree on absolute Kendall's τ pairwise dependence.
Family selection per edge: Clayton (lower tail dependence) for income-vacancy, Gumbel (upper tail dependence) for expense-rate, Student-t (symmetric) for value-rate.
Fitting: Use pyvinecopulib (Python) or VineCopula (R) with AIC/BIC family selection.
Sampling: Sequential simulation from the vine structure.

**Implementation:**
```python
import pyvinecopulib as pv
import numpy as np

# Fit R-vine to historical stress data (or calibrate to KBRA assumptions)
data = np.column_stack([rent_shocks, vacancy_shocks, cap_shocks, rate_shocks, opex_shocks])
controls = pv.FitControlsVinecop(family_set=pv.all, criterion='aic')
vine = pv.Vinecop(data, controls=controls)

# Sample 10,000 scenarios
scenarios = vine.simulate(n=10000, seeds=[42])
# scenarios[:, 0] = rent_shock draws
# scenarios[:, 1] = vacancy_shock draws, etc.
```

---

### Module 2: Extreme Value Theory for Deep Tail Calibration

**Primary references:**
- EVT conceptual overview and GEV/GPD formulas (AnalystPrep FRM reference)
- "Extreme Value Theory in Finance: Tail Risk, GEV, and GPD" (April 2026 practitioner review)
- Columbia Business School: "Tail Approximations for Portfolio Credit Risk" (Glasserman)

**The problem EVT solves:** Standard Monte Carlo with 10,000 draws gives reasonable estimates of the P5-P95 range but severely underestimates the P1 and P0.1 loss quantiles because the empirical distribution has too few extreme observations. EVT provides a principled mathematical framework for extrapolating tail behavior beyond the observed data range.

**Framework:** The Generalized Pareto Distribution (GPD) models the distribution of excess losses above a high threshold u:

G(x; ξ, β) = 1 − (1 + ξx/β)^(−1/ξ)

Where:
- ξ is the tail index (shape parameter): ξ > 0 means heavy tails (Fréchet), ξ = 0 means exponential tails (Gumbel)
- β is the scale parameter
- For real estate stress losses, ξ is typically estimated between 0.1 and 0.4 (moderate heavy tail)

**For DSCR application:**
1. Run the R-vine Monte Carlo to generate 10,000 income scenarios
2. Convert each scenario to a DSCR realization
3. For DSCR realizations below a threshold u (e.g., the 10th percentile), fit a GPD to the excess losses
4. Use the GPD to estimate the P1 and P0.1 DSCR quantiles with proper confidence intervals
5. Report: "99th percentile DSCR shock scenario: DSCR drops to X with EVT-calibrated confidence interval [Y, Z]"

**VaR formula under EVT (Fréchet, ξ > 0):**

VaR_α = μ_n − (σ_n / ξ_n) × [1 − (−n ln(α))^(−ξ_n)]

---

### Module 3: Nelson-Siegel-Svensson Rate Surface

**Primary reference:** "Estimating the Yield Curve Using the Nelson-Siegel Model" (SSRN 2054689, widely used in BIS and Fed implementations)

**The Nelson-Siegel model:**

y(τ) = β₀ + β₁ × [(1 − e^(−τ/λ)) / (τ/λ)] + β₂ × [(1 − e^(−τ/λ)) / (τ/λ) − e^(−τ/λ)]

Where:
- τ is the maturity
- β₀ is the long-run interest rate level
- β₁ controls the slope (short minus long)
- β₂ controls the curvature (medium-term hump)
- λ controls the location of the curvature maximum

The Svensson extension adds: + β₃ × [(1 − e^(−τ/λ₂)) / (τ/λ₂) − e^(−τ/λ₂)]

**Daily fit workflow for the Sovereign OS:**
1. Pull SOFR swap quotes at 1M, 3M, 6M, 1Y, 2Y, 3Y, 5Y, 7Y, 10Y from FRED or Bloomberg (FRED tickers: SOFR1 through SOFR10)
2. Fit (β₀, β₁, β₂, β₃, λ₁, λ₂) by nonlinear least squares (scipy.optimize.minimize)
3. Evaluate forward rate at the deal's ARM reset maturity: f(τ) = −d/dτ [τ × y(τ)]
4. Add the margin (e.g., 2.50%) to get the projected reset rate
5. For Monte Carlo: fit a Hull-White (one-factor) short-rate model to calibrate rate path uncertainty around the NS forward curve

**Python implementation anchor:**
```python
from scipy.optimize import minimize
import numpy as np

def nelson_siegel(tau, b0, b1, b2, lam):
    factor1 = (1 - np.exp(-tau/lam)) / (tau/lam)
    factor2 = factor1 - np.exp(-tau/lam)
    return b0 + b1 * factor1 + b2 * factor2

def fit_ns(maturities, yields):
    def objective(params):
        b0, b1, b2, lam = params
        fitted = nelson_siegel(maturities, b0, b1, b2, lam)
        return np.sum((fitted - yields)**2)
    result = minimize(objective, x0=[0.05, -0.01, 0.01, 1.5],
                      bounds=[(0.01, 0.15), (-0.10, 0.10), (-0.10, 0.10), (0.1, 5.0)])
    return result.x
```

---

### Module 4: Kalman Filter for Latent Market State Estimation

**Primary references:**
- "Kalman filter demystified: from intuition to probabilistic graphical models" (arXiv 1811.11618)
- State-space models and Kalman filter (QuantStart technical reference)
- Diebold-Li model via Kalman filter (MathWorks reference implementation)

**The problem it solves:** Rent growth and vacancy have both a *signal* component (true market trend) and a *noise* component (seasonal variation, data collection error, small-sample ZIP-level noise). Treating the raw RentCast number as the signal is incorrect — the signal needs to be filtered. The Kalman filter is the optimal linear estimator for extracting the latent state from noisy observations.

**State-space formulation for DSCR rent model:**

State equation (latent rent trend):
μ_{t+1} = μ_t + ε_t,   ε_t ~ N(0, Q)  (random walk with drift)

Observation equation (observed rent index):
y_t = μ_t + η_t,   η_t ~ N(0, R)

Where Q is process noise variance and R is observation noise variance. The Kalman filter recursively updates the posterior estimate of μ_t (true rent trend) given observed y_t (raw RentCast index).

**Why this matters for DSCR:** Without a Kalman filter, a single anomalous RentCast observation (e.g., an outlier month due to thin comps) flows through to the DSCR calculation directly. With a Kalman filter, the state estimate smooths across multiple observations and weights each new datapoint by its relative reliability. The posterior variance of the state estimate also provides the input uncertainty for the conformal wrapper.

**The Diebold-Li application:** The Nelson-Siegel β factors (β₀, β₁, β₂) can themselves be treated as latent states evolving over time, estimated jointly with a Kalman filter. This gives a dynamic yield curve model (Dynamic Nelson-Siegel, or DNS) that is the standard for Central Bank yield curve estimation — and is directly applicable to building the DSCR rate surface with propagated parameter uncertainty.

---

### Module 5: CECL-Grade PD/LGD/EAD Credit Loss Model

**Primary regulatory references:**
- FASB ASC 326 (CECL): Current Expected Credit Losses standard
- Basel III / CRE32: IRB approach risk components (PD, LGD, EAD, M)
- OCC Comptroller's Handbook: Allowances for Credit Losses

**Framework:**

Expected Loss (per loan) = PD(t, T) × LGD × EAD(t)

Where the term structure of default probability PD(t, T) is the cumulative probability of default between origination t and maturity T, conditioned on current market state.

**For DSCR loans specifically:**

PD drivers (from systematic risk factors):
- DSCR at origination and projected forward (income risk)
- LTV at origination and projected forward (collateral risk)
- Sponsor net worth / liquidity (recourse capacity)
- Market vacancy trend (systematic market risk)
- Geographic concentration (idiosyncratic + systematic)

LGD model:
LGD = 1 − (Recovery Rate × Collateral Value at Default) / EAD

Where Recovery Rate accounts for:
- Distressed sale discount: typically 15-25% below market value for forced sales
- Foreclosure costs: legal, servicing, carrying costs — typically 5-8% of balance
- Time to recovery: 12-24 months typical for non-judicial states, 24-48 months judicial

Simplified LGD estimate:
LGD ≈ max(0, 1 − (1 − haircut) × (1/LTV_at_default))

Where haircut includes distressed discount + foreclosure costs.

**EAD for amortizing DSCR loans:**

EAD(t) = Outstanding Balance(t) using scheduled amortization
       = P × [1 − ((1+r)^t − 1) / ((1+r)^N − 1)]

Where P is original balance, r is monthly rate, N is total term in months, t is months elapsed.

---

### Module 6: Gaussian Process for Rate Surface Interpolation

**Primary reference:** "Yield Curve Interpolation with Gaussian Processes" (LinkedIn/blog, March 2025); theoretical foundations in "Modeling and Forecasting Yield Curves" (academic monograph with GP implementation)

**Why GP over Nelson-Siegel:** Nelson-Siegel is a parametric model with a fixed three-factor structure. Gaussian Process regression is a non-parametric Bayesian method that interpolates the yield curve while *preserving full uncertainty*. The GP posterior gives not just a point estimate of the rate at any maturity, but a full posterior distribution — the credible interval around the rate surface.

For DSCR ARM deals with unusual reset maturities or hybrid structures, GP rate surface interpolation provides more honest rate uncertainty bounds than forcing a parametric Nelson-Siegel fit.

**Implementation:**
```python
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, WhiteKernel, Matern

# SOFR swap quotes at standard maturities
maturities = np.array([0.25, 0.5, 1, 2, 3, 5, 7, 10]).reshape(-1, 1)  # in years
yields = np.array([...])  # current SOFR swap quotes

kernel = Matern(length_scale=1.0, nu=2.5) + WhiteKernel(noise_level=0.0001)
gp = GaussianProcessRegressor(kernel=kernel, alpha=1e-6, normalize_y=True)
gp.fit(maturities, yields)

# Predict at any target maturity with full uncertainty
target_maturity = np.array([[5.0]])  # 5-year ARM reset
rate_mean, rate_std = gp.predict(target_maturity, return_std=True)
# rate_mean is the NS-equivalent; rate_std is the epistemic uncertainty
```

---

### Module 7: Structural Credit Risk — Merton Model for Sponsor Default Distance

**The problem:** The current system has no sponsor-level default risk model. A borrower's net worth or liquidity is taken as a static input. But in an institutional deal desk, the correct question is: given the sponsor's asset base and liabilities, what is the probability that the sponsor becomes unable to support a sub-1.0 DSCR property before the DSCR property self-recovers?

**Merton model for sponsor distance to default:**

In the Merton structural model, a firm (sponsor) defaults when its assets V_t fall below its liabilities D. Under geometric Brownian motion:

V_t = V_0 × exp[(μ − σ²/2)t + σW_t]

Distance to default (DD) = (ln(V/D) + (μ − σ²/2)T) / (σ√T)

Probability of default: PD = N(−DD)  where N is the standard normal CDF

For DSCR deals, a simplified version:
- V = sponsor's reported liquid net worth + equity across portfolio
- D = sponsor's total debt obligations (all DSCR loans + personal debt)
- σ = volatility estimate from portfolio property value distribution
- T = loan term

The output: sponsor-level distance to default. A sponsor with DD > 3.0 is very far from default (< 0.1% PD). A sponsor with DD < 1.0 is dangerously close (> 15% PD). This number feeds directly into the deal's CECL LGD estimate (low-DD sponsor → low recovery → high LGD).

---

### Module 8: Coherent Risk Measures — CVaR Instead of VaR

**The problem with VaR:** Value at Risk at 95% confidence tells you the loss threshold below which 95% of scenarios fall. It says nothing about *how bad* the worst 5% of scenarios are. Two portfolios with identical 95% VaR can have wildly different tail behavior — one has moderate losses slightly above the threshold, the other has catastrophic losses concentrated at the extreme.

**CVaR (Conditional Value at Risk = Expected Shortfall):** CVaR at 95% is the *expected* loss given that you are already in the worst 5% of scenarios. It is a coherent risk measure (satisfies subadditivity, monotonicity, translation invariance, and positive homogeneity — properties VaR does not satisfy).

For DSCR portfolio risk:
CVaR_α = E[Loss | Loss > VaR_α]
        = (1/(1-α)) × ∫_{VaR_α}^{∞} L × f(L) dL

**Implementation in the Monte Carlo:**
```python
import numpy as np

def cvar(losses: np.ndarray, alpha: float = 0.95) -> float:
    """
    Compute CVaR (Expected Shortfall) at confidence level alpha.
    losses: array of simulated portfolio losses (positive = loss)
    alpha: confidence level (0.95 = 95th percentile)
    """
    var_threshold = np.percentile(losses, alpha * 100)
    tail_losses = losses[losses >= var_threshold]
    return tail_losses.mean()

# Apply to DSCR Monte Carlo:
# losses = (debt_service - simulated_income) for each scenario, clipped at 0
# cvar_95 = cvar(losses, alpha=0.95)
# Report: "Expected loss in worst 5% of scenarios: $X,XXX/month"
```

---

## Part III: SR 26-02 Compliance Architecture

### What Changed on April 17, 2026

The OCC, Federal Reserve, and FDIC jointly replaced SR 11-7 with SR 26-02. The Sovereign OS architecture must be calibrated against the new guidance, not the 2011 framework.

**Key changes that directly affect the Sovereign OS:**

| Dimension | SR 11-7 (old) | SR 26-02 (new) |
|---|---|---|
| Model definition | Broad: any quantitative method | Narrow: must be complex, have theoretical underpinning, produce quantitative output |
| Threshold for primary applicability | $1B+ assets | $30B+ assets |
| Generative/agentic AI | Not addressed | Explicitly excluded from scope |
| Deterministic rule-based systems | In scope | Explicitly excluded |
| Spreadsheet arithmetic | In scope | Explicitly excluded |
| Validation independence | Strict reporting-line separation required | Rigor-based; organizational structure de-emphasized |
| Monitoring frequency | Annual default cadence | Risk-proportionate, trigger-based |
| Enforcement | Supervisory criticism expected for non-compliance | Non-binding; action only for unsafe/unsound practices |

**What this means for the Sovereign OS:**

The deterministic deal engine (DSCR computation, reserves, PITIA, LTV gates, after-tax IRR) is *explicitly excluded* from SR 26-02 as a deterministic rule-based system. This is a governance simplification.

The statistical models (XGBoost approval predictor, TFT rent forecaster, R-vine Monte Carlo) are *in scope* as SR 26-02 models. They require:
- Conceptual soundness review
- Outcomes analysis (backtesting against actual approvals and defaults)
- Ongoing monitoring with drift detection and trigger-based re-validation

The Claude/LLM narrative layer is *out of scope* per SR 26-02 (generative AI excluded), but broader governance applies. Human review is mandatory. No LLM output should influence a credit decision without human sign-off.

The evidence vault is *not a model* under SR 26-02, but it is the documentation backbone for all model governance. Every model decision must be traceable through the vault.

### Model Materiality Framework for the Sovereign OS

Under SR 26-02, model governance depth is proportional to materiality = exposure × purpose.

| Model | Exposure | Purpose | Materiality | Governance Level |
|---|---|---|---|---|
| XGBoost/LightGBM approval predictor | High (influences every deal) | Risk management | HIGH | Full validation cycle + quarterly retest |
| TFT rent forecaster | High (primary income input) | Credit decision | HIGH | Full validation + vintage backtesting |
| R-vine Monte Carlo | Medium (stress layer, not primary) | Risk management | MEDIUM | Annual conceptual review + scenario replay |
| Conformal intervals | Low (decorates outputs) | Risk communication | LOW | Coverage monitoring + calibration check |
| Nelson-Siegel rate surface | Medium (ARM reset pricing) | Credit decision | MEDIUM | Daily fit quality check + term structure audit |
| CECL PD/LGD model | High (reserve calculation) | Regulatory reporting | HIGH | Independent validation + stress testing |

---

## Part IV: The Priority Implementation Matrix

All eight architectural debts and all mathematical modules ranked by systemic risk reduction and implementation cost:

| Priority | Item | Type | Risk Reduction | Complexity | SR 26-02 Category |
|---|---|---|---|---|---|
| 1 | DSCR as distribution (conformal intervals) | Architectural debt | **Critical** | Medium | Out of scope (decorative) |
| 2 | R-vine copula tail dependence | Math module | **Critical** | High | In scope (statistical model) |
| 3 | CECL PD/LGD/EAD credit loss model | Architectural debt | **Critical** | High | In scope (statistical model) |
| 4 | LLM hallucination firewall | Architectural debt | **High** | Low | Out of scope (generative AI) |
| 5 | Evidence vault model version tracking | Architectural debt | **High** | Low | Documentation (not a model) |
| 6 | Nelson-Siegel rate surface + ARM | Math module | **High** | Medium | In scope (statistical model) |
| 7 | EVT tail calibration on Monte Carlo | Math module | **High** | Medium | In scope (statistical model) |
| 8 | Kalman filter latent rent state | Math module | **Medium** | Medium | In scope (statistical model) |
| 9 | CVaR portfolio coherent risk | Math module | **Medium** | Low | In scope (statistical model) |
| 10 | Merton sponsor distance-to-default | Math module | **Medium** | Medium | In scope (statistical model) |
| 11 | Spatio-temporal graph contagion | Architectural debt | **Medium** | High | In scope (statistical model) |
| 12 | SR 26-02 model inventory buildout | Architectural debt | **Compliance** | Medium | Governance (not a model) |

---

## Part V: The Durable Moat — What No Competitor Builds In 12 Months

The market is now telling you what matters. DSCR delinquencies doubled in two years. Lenders who relied on threshold-based DSCR qualification are now looking at impairments in precisely the coastal and Sun Belt STR-heavy markets that point-estimate underwriting cannot distinguish from durable income assets. The Sovereign OS, with these upgrades, does something no commercial DSCR platform does today:

```
1. Converts every deal from a point verdict to a probability distribution
   (R-vine Monte Carlo + EVT tails + conformal intervals)

2. Prices credit risk forward over the life of the loan
   (CECL PD/LGD/EAD with TFT/TimesFM income projections)

3. Prices the rate risk surface correctly for ARMs
   (Nelson-Siegel-Svensson daily fit + Kalman-filtered parameter dynamics)

4. Quantifies portfolio-level contagion risk
   (Spatio-temporal graph + CVaR coherent measures)

5. Governs every model under the correct 2026 regulatory framework
   (SR 26-02 materiality-tiered MRM — not the superseded SR 11-7)

6. Maintains a full audit trail from raw input to final verdict
   (Evidence vault + model version tracking + LLM hallucination firewall)
```

This is the difference between a mortgage calculator that passed the 2021 origination boom and an institutional deal intelligence system built to survive the 2026 credit tightening cycle.
