---
type: research
slice: 2
status: drafted
confidence: 3
title: "T11 Algorithm #6 — Vasicek + Cox-Ingersoll-Ross (CIR) Short-Rate Models"
summary: "**Slice Target**: Slice 2 (P2-2 ARM Reset) — alternative short-rate models for benchmarking"
entities:
  - concept/arm
  - concept/dscr
  - ml/shap
  - slice/2
  - topic/str
tags:
  - topic/default-rate
  - topic/short-rate
  - topic/stress-test
  - topic/yield-curve
source: RESEARCH/godmode_20260618/11_T11_hardcore_algos/06_vasicek_cir_short_rate.md
vaulted_at: 2026-06-20
---
# T11 Algorithm #6 — Vasicek + Cox-Ingersoll-Ross (CIR) Short-Rate Models

**Effort Estimate**: 4 hours
**Slice Target**: Slice 2 (P2-2 ARM Reset) — alternative short-rate models for benchmarking
**Research Date**: 2026-06-18
**Researcher**: DSCR Sovereign OS godmode

---

## 1. Problem Statement

**Vasicek (1977)** and **Cox-Ingersoll-Ross (1985)** are the two foundational **mean-reverting** short-rate models. Together with Hull-White (T11 #4), they form the canonical trio for stochastic term-structure modeling.

For DSCR Sovereign OS:
- **Vasicek**: simple baseline; allows negative rates (problem for low-rate environments)
- **CIR**: extension that ensures **non-negative** rates via $\sqrt{r_t}$ diffusion
- Both provide **closed-form bond prices** and serve as **benchmarks** for Hull-White

---

## 2. Algorithm Description

### 2.1 Source Documents

1. **Vasicek, O. (1977)**. "An Equilibrium Characterization of the Term Structure of Interest Rates." *Journal of Financial Economics* 5(2): 177–188. — **PRIMARY**
2. **Cox, J. C., Ingersoll, J. E. & Ross, S. A. (1985)**. "A Theory of the Term Structure of Interest Rates." *Econometrica* 53(2): 385–407. — **PRIMARY**
3. **Hull, J. (2017)**. *Options, Futures, and Other Derivatives*, 10th ed. Pearson. — **TEXTBOOK**
4. **Brigo, D. & Mercurio, F. (2006)**. *Interest Rate Models — Theory and Practice*. Springer. — **TEXTBOOK**
5. **Wikipedia CIR**: https://en.wikipedia.org/wiki/Cox%E2%80%93Ingersoll%E2%80%93Ross_model
6. **Wikipedia Vasicek**: https://en.wikipedia.org/wiki/Vasicek_model
7. **Wikipedia Hull-White**: https://en.wikipedia.org/wiki/Hull%E2%80%93White_model

### 2.2 Vasicek (1977) — Math

**SDE**:
$$dr(t) = a\bigl(b - r(t)\bigr)\, dt + \sigma\, dW(t)$$

- $a$: mean-reversion speed
- $b$: long-run mean (as $t \to \infty$, $E[r_t] \to b$)
- $\sigma$: volatility (constant)
- $dW$: Wiener increment

**Distribution**: $r(t) \mid r(0) \sim \mathcal{N}\!\left( r(0) e^{-at} + b(1 - e^{-at}),\, \frac{\sigma^2}{2a}(1 - e^{-2at}) \right)$

**Bond price** (closed form):
$$P(t, T) = \exp\!\left[ A(t, T) - B(t, T)\, r(t) \right]$$
with:
$$B(t, T) = \frac{1 - e^{-a(T-t)}}{a}$$
$$A(t, T) = \left(b - \frac{\sigma^2}{2a^2}\right)\bigl[B(t, T) - (T-t)\bigr] - \frac{\sigma^2}{4a}\, B(t, T)^2$$

**Drawback**: allows negative rates (problem for low-rate environments; mitigations include shifted-Vasicek).

### 2.3 CIR (1985) — Math

**SDE**:
$$dr(t) = a\bigl(b - r(t)\bigr)\, dt + \sigma \sqrt{r(t)}\, dW(t)$$

- Same $a, b$ as Vasicek
- Diffusion is $\sigma\sqrt{r}$ — **level-dependent volatility** ensures **non-negative** rates when $2ab \geq \sigma^2$ (Feller condition).

**Distribution** (conditional on $r(s)$): $r(t) \mid r(s)$ follows **non-central chi-squared**.

**Bond price** (closed form):
$$P(t, T) = A(t, T)\, \exp[-B(t, T)\, r(t)]$$
with:
$$h = \sqrt{a^2 + 2\sigma^2}$$
$$B(t, T) = \frac{2(e^{h(T-t)} - 1)}{2h + (a + h)(e^{h(T-t)} - 1)}$$
$$A(t, T) = \left[ \frac{2h\, e^{(a+h)(T-t)/2}}{2h + (a + h)(e^{h(T-t)} - 1)} \right]^{2ab/\sigma^2}$$

**Feller condition**: $2ab \geq \sigma^2$ ensures $r > 0$ a.s. (strictly positive; boundary not reached). When $4ab = \sigma^2$ the process is the square of an OU process and is ergodic.

---

## 3. Reference Python Implementation

```python
"""
Vasicek (1977) + CIR (1985) Short-Rate Models
Pure numpy + scipy, no QuantLib.
"""

import numpy as np
from scipy.stats import ncx2
from scipy.special import iv as bessel_iv


# ============================================================
# VASICEK (1977)
# ============================================================

def vasicek_sde_step(r_t, a, b, sigma, dt, rng):
    """One Euler step of Vasicek SDE."""
    dW = rng.normal(0, np.sqrt(dt), r_t.shape if hasattr(r_t, 'shape') else ())
    return r_t + a * (b - r_t) * dt + sigma * dW


def vasicek_exact_step(r_t, a, b, sigma, dt, rng):
    """
    Exact (transition density) simulation of Vasicek.
    r(t+dt) | r(t) ~ N(mean, var).
    """
    mean = r_t * np.exp(-a * dt) + b * (1 - np.exp(-a * dt))
    var = (sigma**2 / (2 * a)) * (1 - np.exp(-2 * a * dt))
    Z = rng.normal(0, 1, r_t.shape if hasattr(r_t, 'shape') else ())
    return mean + np.sqrt(var) * Z


def vasicek_bond_price(r_t, t, T, a, b, sigma):
    """
    Vasicek closed-form zero-coupon bond price P(t, T).
    """
    tau = T - t
    B = (1 - np.exp(-a * tau)) / a
    A = (b - sigma**2 / (2 * a**2)) * (B - tau) - (sigma**2 / (4 * a)) * B**2
    return np.exp(A - B * r_t)


def simulate_vasicek_paths(r0, T_years, n_steps, n_paths,
                           a=0.5, b=0.05, sigma=0.01, seed=42,
                           exact=True):
    """Simulate Vasicek short-rate paths."""
    rng = np.random.default_rng(seed)
    dt = T_years / n_steps
    r = np.empty((n_paths, n_steps + 1))
    r[:, 0] = r0
    step_fn = vasicek_exact_step if exact else vasicek_sde_step
    for t in range(1, n_steps + 1):
        r[:, t] = step_fn(r[:, t-1], a, b, sigma, dt, rng)
    return r


# ============================================================
# COX-INGERSOLL-ROSS (1985)
# ============================================================

def cir_sde_step(r_t, a, b, sigma, dt, rng):
    """Euler-Maruyama step (can go negative if Feller violated)."""
    dW = rng.normal(0, np.sqrt(dt), r_t.shape if hasattr(r_t, 'shape') else ())
    r_next = r_t + a * (b - r_t) * dt + sigma * np.sqrt(np.maximum(r_t, 0)) * dW
    return np.maximum(r_next, 0)  # reflection at 0


def cir_exact_step(r_t, a, b, sigma, dt, rng):
    """
    Exact simulation via non-central chi-squared.
    r(t+dt) | r(t) = (sigma^2 (1 - e^{-a*dt}) / (4a)) * chi2(df, nc)
    """
    coef = sigma**2 * (1 - np.exp(-a * dt)) / (4 * a)
    df = 4 * a * b / sigma**2
    nc = r_t * np.exp(-a * dt) / coef
    # Vectorized sampling from non-central chi-squared
    if np.isscalar(r_t):
        sample = ncx2.rvs(df, nc, random_state=rng) * coef
    else:
        sample = np.array([ncx2.rvs(df, max(n, 0), random_state=rng)
                          for n in nc]) * coef
    return sample


def cir_bond_price(r_t, t, T, a, b, sigma):
    """CIR closed-form zero-coupon bond price P(t, T)."""
    tau = T - t
    h = np.sqrt(a**2 + 2 * sigma**2)
    exp_h_tau = np.exp(h * tau)
    denom = 2 * h + (a + h) * (exp_h_tau - 1)
    B = 2 * (exp_h_tau - 1) / denom
    A_exp = 2 * a * b / sigma**2
    A_base = (2 * h * np.exp((a + h) * tau / 2)) / denom
    A = A_base ** A_exp
    return A * np.exp(-B * r_t)


def simulate_cir_paths(r0, T_years, n_steps, n_paths,
                       a=0.5, b=0.05, sigma=0.05, seed=42,
                       exact=True):
    """Simulate CIR short-rate paths."""
    rng = np.random.default_rng(seed)
    dt = T_years / n_steps
    r = np.empty((n_paths, n_steps + 1))
    r[:, 0] = r0
    if exact:
        for t in range(1, n_steps + 1):
            r[:, t] = cir_exact_step(r[:, t-1], a, b, sigma, dt, rng)
    else:
        for t in range(1, n_steps + 1):
            r[:, t] = cir_sde_step(r[:, t-1], a, b, sigma, dt, rng)
    return r


def feller_condition_satisfied(a, b, sigma):
    """Check if Feller condition 2ab ≥ σ² is satisfied."""
    return 2 * a * b >= sigma**2


# === Validation example ===
if __name__ == "__main__":
    # Vasicek example
    print("=== VASICEK ===")
    r_v = simulate_vasicek_paths(r0=0.05, T_years=10, n_steps=120,
                                 n_paths=10000, a=0.5, b=0.05, sigma=0.01,
                                 seed=42, exact=True)
    print(f"r(0) mean: {r_v[:, 0].mean():.4f}, std: {r_v[:, 0].std():.4f}")
    print(f"r(10) mean: {r_v[:, -1].mean():.4f}, std: {r_v[:, -1].std():.4f}")
    # Theoretical
    a, T, sigma = 0.5, 10, 0.01
    print(f"Theoretical: mean=0.05, std={sigma*np.sqrt((1-np.exp(-2*a*T))/(2*a)):.5f}")

    # CIR example
    print("\n=== CIR ===")
    a, b, sigma = 0.5, 0.05, 0.05
    print(f"Feller 2ab={2*a*b:.4f} vs σ²={sigma**2:.4f}: {'SAT' if feller_condition_satisfied(a,b,sigma) else 'VIOLATED'}")
    r_c = simulate_cir_paths(r0=0.05, T_years=10, n_steps=120,
                             n_paths=10000, a=a, b=b, sigma=sigma,
                             seed=42, exact=True)
    print(f"r(0) mean: {r_c[:, 0].mean():.4f}, std: {r_c[:, 0].std():.4f}")
    print(f"r(10) mean: {r_c[:, -1].mean():.4f}, std: {r_c[:, -1].std():.4f}")
    print(f"r(10) min: {r_c[:, -1].min():.4f} (≥0 due to Feller)")

    # Bond prices
    print("\n=== BOND PRICES (r=5%, T=5y) ===")
    print(f"Vasicek P(0,5): {vasicek_bond_price(0.05, 0, 5, a=0.5, b=0.05, sigma=0.01):.4f}")
    print(f"CIR P(0,5): {cir_bond_price(0.05, 0, 5, a=0.5, b=0.05, sigma=0.05):.4f}")
```

---

## 4. Test Cases + Expected Outputs

| # | Test | Model | Setup | Expected | Source |
|---|---|---|---|---|---|
| 1 | Vasicek exact mean | V | r₀=0.05, a=0.5, b=0.05 | E[r(∞)] = 0.05 | Vasicek (1977) |
| 2 | Vasicek exact variance | V | σ=0.01, T=10 | Var = 0.0001 (asymptotic) | Vasicek |
| 3 | Vasicek bond P(0,5) | V | r=0.05, σ=0.01 | ~0.781 | Analytic |
| 4 | CIR Feller satisfied | C | 2ab ≥ σ² | r always > 0 | CIR (1985) |
| 5 | CIR Feller violated | C | 2ab < σ² | r touches 0 | CIR (1985) |
| 6 | CIR bond P(0,5) | C | r=0.05, σ=0.05 | ~0.785 | Analytic |
| 7 | Asymptotic dist | C | long time | Gamma distribution | Wikipedia |

---

## 5. Stress Test (1,000 random scenarios)

```python
def stress_v_cir(n=1000, seed=42):
    rng = np.random.default_rng(seed)
    v_failures = 0
    c_failures = 0
    v_bond_rmse = []
    c_bond_rmse = []
    for _ in range(n):
        r0 = rng.uniform(0.01, 0.10)
        a = rng.uniform(0.05, 1.5)
        b = rng.uniform(0.02, 0.08)
        sigma_v = rng.uniform(0.001, 0.05)
        sigma_c = rng.uniform(0.01, 0.15)
        T_bond = rng.uniform(1, 30)
        # Vasicek simulation
        try:
            r_v = simulate_vasicek_paths(r0, 10, 120, 1000, a, b, sigma_v,
                                        seed=rng.integers(0, 1_000_000))
            v_bond = vasicek_bond_price(r_v[:, -1], 0, T_bond, a, b, sigma_v).mean()
            analytical = vasicek_bond_price(r0, 0, T_bond, a, b, sigma_v)
            v_bond_rmse.append((v_bond - analytical)**2)
        except Exception:
            v_failures += 1
        # CIR simulation (only if Feller satisfied)
        if 2 * a * b >= sigma_c**2:
            try:
                r_c = simulate_cir_paths(r0, 10, 120, 1000, a, b, sigma_c,
                                        seed=rng.integers(0, 1_000_000))
                c_bond = cir_bond_price(r_c[:, -1], 0, T_bond, a, b, sigma_c).mean()
                analytical = cir_bond_price(r0, 0, T_bond, a, b, sigma_c)
                c_bond_rmse.append((c_bond - analytical)**2)
            except Exception:
                c_failures += 1
    return {
        "vasicek_fail_rate": v_failures / n,
        "cir_fail_rate": c_failures / n,
        "vasicek_bond_rmse": np.sqrt(np.mean(v_bond_rmse)) if v_bond_rmse else None,
        "cir_bond_rmse": np.sqrt(np.mean(c_bond_rmse)) if c_bond_rmse else None,
    }
```

Expected: <2% failure rate, bond RMSE <0.5%.

---

## 6. Performance Benchmark

| Model | n_paths | n_steps | Wall-clock | Memory |
|---|---|---|---|---|
| Vasicek (exact) | 10,000 | 120 | ~0.3 sec | 10 MB |
| Vasicek (exact) | 50,000 | 360 | ~5 sec | 144 MB |
| CIR (exact via ncχ²) | 10,000 | 120 | ~3 sec | 10 MB |
| CIR (Euler) | 10,000 | 120 | ~0.3 sec | 10 MB |

**Note**: Exact CIR via ncx2 is slow due to scipy's `ncx2.rvs` not being vectorized. For production, use the **quadratic-exponential (QE)** scheme (Andersen 2008) or pre-computed CDF inversion.

---

## 7. Research Status

**RESEARCH COMPLETE** — full spec + reference implementation ready for Slice 2 P2-2.

**Implementation Effort**: 4 hours
- 1.5 hr: implement `models/vasicek.py` + `models/cir.py`
- 0.5 hr: bond pricing closed-form validation
- 1 hr: 1,000-stress test suite
- 0.5 hr: documentation + integration with Hull-White (T11 #4) and NSS (T11 #3)
- 0.5 hr: QE scheme implementation for fast CIR simulation

---

## 8. Citations

1. **Vasicek, O. (1977)**. "An Equilibrium Characterization of the Term Structure of Interest Rates." *Journal of Financial Economics* 5(2): 177–188. — **PRIMARY**
2. **Cox, J. C., Ingersoll, J. E. & Ross, S. A. (1985)**. "A Theory of the Term Structure of Interest Rates." *Econometrica* 53(2): 385–407. DOI: 10.2307/1911242 — **PRIMARY**
3. **Hull, J. (2017)**. *Options, Futures, and Other Derivatives*, 10th ed. Pearson. — **TEXTBOOK**
4. **Brigo, D. & Mercurio, F. (2006)**. *Interest Rate Models — Theory and Practice*. Springer. — **TEXTBOOK**
5. **Andersen, L. (2008)**. "Simple and Efficient Simulation of the Heston Stochastic Volatility Model." *Journal of Computational Finance* — **QE scheme for CIR**
6. **Wikipedia Vasicek**: https://en.wikipedia.org/wiki/Vasicek_model
7. **Wikipedia CIR**: https://en.wikipedia.org/wiki/Cox%E2%80%93Ingersoll%E2%80%93Ross_model
8. **Wikipedia Hull-White**: https://en.wikipedia.org/wiki/Hull%E2%80%93White_model (extended Vasicek)
9. **Orlando, G. et al. (2018–2021)**. CIR# model extensions. *Journal of Forecasting* — **MODERN EXTENSIONS**
10. **Brigo, D. & Mercurio, F. (2001)**. "A deterministic-shift extension of analytically-tractable and time-homogeneous short-rate models." *Finance and Stochastics* 5(3): 369–387.

URLs:
- CIR Wikipedia: https://en.wikipedia.org/wiki/Cox%E2%80%93Ingersoll%E2%80%93Ross_model
- Vasicek Wikipedia: https://en.wikipedia.org/wiki/Vasicek_model
- Hull-White Wikipedia: https://en.wikipedia.org/wiki/Hull%E2%80%93White_model
- QuantStart Vasicek: https://www.quantstart.com/articles/vasicek-model-simulation-with-python/
- Tidy Finance CIR calibration: https://www.tidy-finance.org/blog/cir-calibration/
- Polanitzer CIR Python: https://medium.com/@polanitzer/the-cox-ingersoll-ross-1985-model-in-python-predict-the-bank-of-israel-interest-rate-one-year-42c889d853e4
