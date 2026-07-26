---
type: research
slice: 2
status: drafted
confidence: 3
title: "T11 Algorithm #3 — Nelson-Siegel-Svensson (NSS) Yield Curve"
summary: "**Slice Target**: Slice 2 (P2-2 ARM Reset) — foundational for DSCR rate forecasting"
entities:
  - concept/arm
  - concept/dscr
  - concept/itia
  - ml/shap
  - slice/2
  - topic/str
tags:
  - topic/default-rate
  - topic/stress-test
  - topic/yield-curve
source: RESEARCH/godmode_20260618/11_T11_hardcore_algos/03_nss_svensson_yield_curve.md
vaulted_at: 2026-06-20
---
# T11 Algorithm #3 — Nelson-Siegel-Svensson (NSS) Yield Curve

**Effort Estimate**: 4 hours
**Slice Target**: Slice 2 (P2-2 ARM Reset) — foundational for DSCR rate forecasting
**Research Date**: 2026-06-18
**Researcher**: DSCR Sovereign OS godmode

---

## 1. Problem Statement

The **NSS yield curve model** is the industry-standard parametric yield curve used by central banks (ECB, Fed, BIS) to fit the term structure of interest rates from observed bond prices or direct quotes. For DSCR Sovereign OS, it powers:

- **ARM rate reset forecast** (5/1, 7/1, 10/1 ARM loan payments)
- **Defeasance Treasury curve** (T11 #2)
- **Discount rate for option-adjusted spread (OAS)** calculations
- **Prepayment incentive model** (mortgage rate vs market rate spread)

The NSS extension of the Nelson-Siegel (1987) model adds a second hump term, allowing flexible fitting of complex curve shapes (steep, inverted, humped).

---

## 2. Algorithm Description

### 2.1 Source Documents

1. **Nelson, C. R. & Siegel, A. F. (1987)**. "Parsimonious Modeling of Yield Curves." *Journal of Business* 60(4): 473–489. — **PRIMARY**
2. **Svensson, L. E. O. (1994)**. "Estimating and Interpreting Forward Interest Rates: Sweden 1992–1994." *NBER Working Paper* 4871. — **PRIMARY EXTENSION**
3. **Diebold, F. X. & Li, C. (2006)**. "Forecasting the Term Structure of Government Bond Yields." *Journal of Econometrics* 130: 337–364. — **DYNAMIC EXTENSION**
4. **ECB (2024)**. "Yield Curve Modelling and a Conceptual Framework for Estimating the Term Structure of Interest Rates." https://www.ecb.europa.eu/pub/pdf/scpsps/ecb.sps27.en.pdf — **OFFICIAL METHODOLOGY**
5. **BIS (2005)**. "Zero-coupon yield curves estimated by central banks." https://www.bis.org/publ/bppdf/bispap25a.pdf — **SURVEY**

### 2.2 Math

**Nelson-Siegel (1987)**:
$$y(\tau) = \beta_0 + \beta_1 \frac{1 - e^{-\tau/\lambda}}{\tau/\lambda} + \beta_2 \left( \frac{1 - e^{-\tau/\lambda}}{\tau/\lambda} - e^{-\tau/\lambda} \right)$$

- $\beta_0$: long-term level (asymptotic rate as $\tau \to \infty$)
- $\beta_1$: short-term component (slope)
- $\beta_2$: medium-term hump (curvature)
- $\lambda$: decay factor (controls hump location)

**Nelson-Siegel-Svensson (1994)** adds a second hump term:
$$y(\tau) = \beta_0 + \beta_1 \frac{1 - e^{-\tau/\lambda_1}}{\tau/\lambda_1} + \beta_2 \left( \frac{1 - e^{-\tau/\lambda_1}}{\tau/\lambda_1} - e^{-\tau/\lambda_1} \right) + \beta_3 \left( \frac{1 - e^{-\tau/\lambda_2}}{\tau/\lambda_2} - e^{-\tau/\lambda_2} \right)$$

Six parameters: $\beta_0, \beta_1, \beta_2, \beta_3, \lambda_1, \lambda_2$.

### 2.3 Parameter Interpretation

| Param | Meaning | Typical Range |
|---|---|---|
| β₀ | Long rate | 0.02–0.06 |
| β₁ | Slope | -0.05 to +0.05 (negative = upward-sloping curve) |
| β₂ | First curvature | -0.05 to +0.05 |
| β₃ | Second curvature | -0.05 to +0.05 |
| λ₁ | First decay | 0.5–5.0 years |
| λ₂ | Second decay | 1.0–10.0 years |

---

## 3. Reference Python Implementation

```python
"""
Nelson-Siegel-Svensson Yield Curve Calibration
Pure numpy + scipy, no QuantLib.
"""

import numpy as np
from scipy.optimize import minimize, differential_evolution


def nss_yield(tau, beta0, beta1, beta2, beta3, lambda1, lambda2):
    """
    Compute NSS yield at maturities tau (in years).
    tau can be scalar or np.ndarray.

    Returns yield (decimal, annualized).
    """
    tau = np.asarray(tau, dtype=float)
    eps = 1e-10
    t1 = np.where(tau < eps, 1.0, (1 - np.exp(-tau / lambda1)) / (tau / lambda1))
    t2 = t1 - np.exp(-tau / lambda1)
    t3 = np.where(tau < eps, 0.0, (1 - np.exp(-tau / lambda2)) / (tau / lambda2))
    t3 = t3 - np.exp(-tau / lambda2)
    return beta0 + beta1 * t1 + beta2 * t2 + beta3 * t3


def ns_yield(tau, beta0, beta1, beta2, lambda1):
    """Plain Nelson-Siegel (3 parameters + 1 decay = 4 total)."""
    tau = np.asarray(tau, dtype=float)
    eps = 1e-10
    t1 = np.where(tau < eps, 1.0, (1 - np.exp(-tau / lambda1)) / (tau / lambda1))
    t2 = t1 - np.exp(-tau / lambda1)
    return beta0 + beta1 * t1 + beta2 * t2


def calibrate_nss(maturities, yields, initial_params=None, method='Nelder-Mead'):
    """
    Calibrate NSS parameters to observed yield curve.

    Parameters
    ----------
    maturities : array-like (years), e.g., [0.25, 0.5, 1, 2, 5, 10, 30]
    yields : array-like (decimal), same length
    initial_params : tuple (b0, b1, b2, b3, l1, l2), optional
    method : optimizer

    Returns
    -------
    dict with calibrated params, RMSE, fitted yields
    """
    maturities = np.asarray(maturities, dtype=float)
    yields = np.asarray(yields, dtype=float)

    if initial_params is None:
        initial_params = (
            yields[-1],                       # b0 = long rate
            yields[0] - yields[-1],           # b1 ≈ slope
            0.0,                              # b2
            0.0,                              # b3
            1.5,                              # l1
            5.0                               # l2
        )

    def objective(params):
        b0, b1, b2, b3, l1, l2 = params
        if l1 <= 0 or l2 <= 0:
            return 1e6
        yhat = nss_yield(maturities, b0, b1, b2, b3, l1, l2)
        return np.sum((yhat - yields) ** 2)

    bounds = [(-0.10, 0.30), (-0.30, 0.30), (-0.30, 0.30),
              (-0.30, 0.30), (0.01, 30.0), (0.01, 30.0)]

    if method == 'differential_evolution':
        result = differential_evolution(objective, bounds, seed=42, maxiter=500)
    else:
        result = minimize(objective, initial_params, method=method,
                         options={'maxiter': 5000, 'xatol': 1e-8, 'fatol': 1e-10})

    b0, b1, b2, b3, l1, l2 = result.x
    yhat = nss_yield(maturities, b0, b1, b2, b3, l1, l2)
    rmse = np.sqrt(np.mean((yhat - yields) ** 2))
    return {
        "params": {"beta0": b0, "beta1": b1, "beta2": b2,
                   "beta3": b3, "lambda1": l1, "lambda2": l2},
        "rmse": rmse,
        "fitted_yields": yhat,
        "optimizer_success": result.success,
        "objective_value": result.fun
    }


def calibrate_ns(maturities, yields):
    """Calibrate plain Nelson-Siegel (4 params)."""
    maturities = np.asarray(maturities, dtype=float)
    yields = np.asarray(yields, dtype=float)

    def objective(params):
        b0, b1, b2, l1 = params
        if l1 <= 0:
            return 1e6
        yhat = ns_yield(maturities, b0, b1, b2, l1)
        return np.sum((yhat - yields) ** 2)

    initial = (yields[-1], yields[0] - yields[-1], 0.0, 1.5)
    bounds = [(-0.10, 0.30), (-0.30, 0.30), (-0.30, 0.30), (0.01, 30.0)]
    result = minimize(objective, initial, method='Nelder-Mead',
                     options={'maxiter': 5000})
    yhat = ns_yield(maturities, *result.x)
    return {
        "params": {"beta0": result.x[0], "beta1": result.x[1],
                   "beta2": result.x[2], "lambda1": result.x[3]},
        "rmse": np.sqrt(np.mean((yhat - yields) ** 2)),
        "fitted_yields": yhat
    }


# === Validation: Fed H.15 yield curve snapshot ===
if __name__ == "__main__":
    # Sample US Treasury curve (illustrative)
    mats = np.array([0.25, 0.5, 1, 2, 3, 5, 7, 10, 20, 30])
    yields = np.array([0.0535, 0.0520, 0.0495, 0.0470, 0.0455,
                       0.0445, 0.0450, 0.0460, 0.0475, 0.0480])
    out = calibrate_nss(mats, yields)
    print(f"NSS RMSE: {out['rmse']*10000:.2f} bps")
    print(f"Params: {out['params']}")
```

---

## 4. Test Cases + Expected Outputs

| # | Test | Maturities (yr) | Yields | Expected RMSE | Source |
|---|---|---|---|---|---|
| 1 | Flat curve | 1,5,10 | 0.04,0.04,0.04 | <1 bp | Trivial |
| 2 | Upward sloping | 1,2,5,10,30 | 0.03,0.035,0.045,0.05,0.055 | <2 bps | Synthetic |
| 3 | Humped | 0.25,1,5,10,30 | 0.045,0.05,0.055,0.05,0.045 | <5 bps | Synthetic |
| 4 | Real Fed curve (2024-03) | [0.25..30] | Federal Reserve H.15 | <10 bps | Fed |
| 5 | ECB euro area curve | [0.5..30] | ECB AA curve | <8 bps | ECB |

---

## 5. Stress Test (1,000 random yield curves)

```python
def stress_nss(n=1000, seed=42):
    rng = np.random.default_rng(seed)
    rmses = []
    fails = 0
    for _ in range(n):
        # Random β parameters (realistic)
        b0 = rng.uniform(0.02, 0.08)
        b1 = rng.uniform(-0.04, 0.04)
        b2 = rng.uniform(-0.05, 0.05)
        b3 = rng.uniform(-0.05, 0.05)
        l1 = rng.uniform(0.5, 5.0)
        l2 = rng.uniform(1.0, 10.0)
        mats = np.array([0.25, 0.5, 1, 2, 3, 5, 7, 10, 20, 30])
        true_y = nss_yield(mats, b0, b1, b2, b3, l1, l2)
        # Add small noise
        noisy_y = true_y + rng.normal(0, 0.0005, len(mats))
        try:
            out = calibrate_nss(mats, noisy_y)
            rmses.append(out["rmse"])
        except Exception:
            fails += 1
    arr = np.array(rmses)
    return {"failure_rate": fails / n, "rmse_mean_bps": arr.mean() * 10000,
            "rmse_max_bps": arr.max() * 10000}
```

Expected: <1% failure, RMSE <10 bps for >95% of curves.

---

## 6. Performance Benchmark

- **Calibration latency**: ~50–200 ms per curve (10 maturities, Nelder-Mead)
- **Throughput**: ~5–20 curves/sec (single thread)
- **Yield computation**: <1 ms per curve (vectorized over maturities)
- **Memory**: O(1) per curve

---

## 7. Research Status

**RESEARCH COMPLETE** — full spec + reference implementation ready for Slice 2 P2-2.

**Implementation Effort**: 4 hours
- 1 hr: implement `models/yield_curve.py` with NSS + NS
- 1 hr: calibration harness + RMSE reporting
- 1 hr: 1,000-stress test suite
- 0.5 hr: integration with Federal Reserve H.15 live data feed
- 0.5 hr: documentation + ARM reset forecast module

---

## 8. Citations

1. **Nelson, C. R. & Siegel, A. F. (1987)**. "Parsimonious Modeling of Yield Curves." *Journal of Business* 60(4): 473–489. — **PRIMARY**
2. **Svensson, L. E. O. (1994)**. "Estimating and Interpreting Forward Interest Rates: Sweden 1992–1994." *NBER WP* 4871. — **PRIMARY EXTENSION**
3. **ECB (2024)**. "Yield Curve Modelling." Statistical Paper Series 27. https://www.ecb.europa.eu/pub/pdf/scpsps/ecb.sps27.en.pdf — **OFFICIAL METHODOLOGY**
4. **BIS (2005)**. "Zero-coupon yield curves estimated by central banks." https://www.bis.org/publ/bppdf/bispap25a.pdf — **SURVEY**
5. **Federal Reserve (2026)**. Nominal Yield Curve (Svensson methodology). https://www.federalreserve.gov/data/nominal-yield-curve.htm
6. **Diebold, F. X. & Li, C. (2006)**. "Forecasting the Term Structure of Government Bond Yields." *Journal of Econometrics* 130: 337–364.

URLs:
- Federal Reserve yield curve: https://www.federalreserve.gov/data/nominal-yield-curve.htm
- ECB yield curve: https://www.ecb.europa.eu/pub/pdf/scpsps/ecb.sps27.en.pdf
- Python impl (Polanitzer): https://medium.com/@polanitzer/nelson-siegel-svensson-in-python-estimating-the-spot-rate-curve-using-the-nelson-siegel-svensson-4753969e61c8
- R `YieldCurve` package: https://cran.r-project.org/web/packages/YieldCurve/refman/YieldCurve.html
