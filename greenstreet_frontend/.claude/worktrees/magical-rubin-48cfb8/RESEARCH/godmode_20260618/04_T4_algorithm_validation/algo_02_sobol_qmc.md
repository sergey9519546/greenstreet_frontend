---
type: research
status: drafted
confidence: 5
title: "Algorithm 02: Sobol Quasi-Monte Carlo (QMC)"
summary: "**TOPIC:** 7 (Multivariate Dependence & Joint Simulation)"
entities:
  - concept/dscr
  - concept/itia
  - math/copula
  - math/sobol
  - math/t-copula
  - slice/2
  - topic/str
tags:
  - topic/compliance
  - topic/default-rate
  - topic/monte-carlo
  - topic/portfolio
  - topic/reserves
  - topic/stress-test
source: RESEARCH/godmode_20260618/04_T4_algorithm_validation/algo_02_sobol_qmc.md
vaulted_at: 2026-06-20
---
# Algorithm 02: Sobol Quasi-Monte Carlo (QMC)

**TOPIC:** 7 (Multivariate Dependence & Joint Simulation)
**Slice:** 2 — Monte Carlo Foundations
**Status (pre-validation):** NOT IMPLEMENTED
**Verdict:** **PASS** | **Confidence:** 5/5 | **Implementation Effort:** 5 hours

---

## 1. Algorithm Description

The **Sobol' sequence** (Sobol', 1967) is a deterministic low-discrepancy sequence in the d-dimensional unit cube $[0,1]^d$. Unlike pseudo-random points, Sobol' points are designed to fill space uniformly, yielding **O(N⁻¹)** convergence for smooth integrands versus the O(N⁻⁰·⁵) rate of standard Monte Carlo (Koksma-Hlawka inequality).

For DSCR Sovereign OS portfolio simulation, Sobol' QMC can reduce required sample size by **5–20×** for the same accuracy when valuing derivatives or computing CVaR.

### Mathematical Foundation

Define star discrepancy:
$$
D_N^* = \sup_{B \subseteq [0,1]^d} \left|\frac{\#\{x_i \in B\}}{N} - \mathrm{Vol}(B)\right|
$$

**Koksma-Hlawka inequality:**
$$
\left|\int_{[0,1]^d} f(u)\,du - \frac{1}{N}\sum_{i=1}^N f(x_i)\right| \le V_{\mathrm{HK}}(f) \cdot D_N^*
$$

For Sobol' sequences, $D_N^* = O((\log N)^d / N)$, giving **O(N⁻¹ logᵈ N)** convergence for smooth integrands.

### Generation Algorithm (Antonov-Saleev 1979)

Sobol' points are constructed via binary direction numbers $v_{k,j}$ (one per dimension) using Gray code ordering:

```
1. Initialize x = 0 (d-dim)
2. For n = 1, 2, ..., N:
     a. Find rightmost 0 bit of (n-1):  c = bit_position
     b. XOR update:  x[:, j] ^= v[c, j]  for all dimensions j
     c. Record point: x / 2^32
```

This is **O(1) per point per dimension** after initialization — the fastest known Sobol' implementation.

---

## 2. Primary Academic Citation

**Sobol', I. M.** (1967). *Distribution of points in a cube and approximate evaluation of integrals*. Zhurnal Vychislitel'noi Matematiki i Matematicheskoi Fiziki 7(4): 784–802.
- English translation: USSR Computational Mathematics and Mathematical Physics 7: 86–112.
- Original paper introducing (t,m,s)-nets and LPτ sequences in base 2.
- Cited via Wikipedia (Sobol sequence) and Glasserman Ch. 4 as the canonical QMC reference.

## 3. Secondary Citations

1. **Joe, S., Kuo, F. Y.** (2008). *Constructing Sobol' sequences with better two-dimensional projections*. SIAM Journal on Scientific Computing 30(5): 2635–2654.
   - DOI: **10.1137/070709359**
   - URL: https://web.maths.unsw.edu.au/~fkuo/sobol/ (official direction-number table up to d=21201)
   - These direction numbers are what `scipy.stats.qmc.Sobol` uses by default.

2. **Glasserman, P.** (2003). *Monte Carlo Methods in Financial Engineering*. Springer. Chapter 4: *Quasi-Monte Carlo*.
   - PDF: https://www.bauer.uh.edu/spirrong/Monte_Carlo_Methods_In_Financial_Enginee.pdf
   - Establishes empirical convergence gain of 5–20× over MC for typical finance integrands.

3. **Owen, A. B.** (2019). *Monte Carlo Book: the Quasi-Monte Carlo parts* — referenced by SciPy stats.qmc doc.

---

## 4. Reference Python Implementation

**Do NOT reimplement Sobol' from scratch.** Use `scipy.stats.qmc.Sobol` (BSD-licensed, validated against Joe-Kuo tables up to d=21201).

```python
import numpy as np
from scipy.stats import qmc, norm

def sobol_normals(N, d, scramble=True, seed=42):
    """Generate Sobol' QMC points transformed to standard normals.

    Parameters
    ----------
    N : int
        Number of points. SHOULD BE A POWER OF 2 for best uniformity.
        Non-power-of-2 degrades performance (Owen 2020).
    d : int
        Dimension (number of random variables). SciPy supports d ≤ 21201.
    scramble : bool
        If True, apply Owen scrambling (preserves marginal U[0,1], enables
        variance estimation via independent replications).
    seed : int
        Scrambling seed for reproducibility.

    Returns
    -------
    Z : (N, d) ndarray
        Standard normal samples with low-discrepancy structure.
    """
    sampler = qmc.Sobol(d=d, scramble=scramble, seed=seed)
    # draw N points; if N not power of 2, may need to oversample and truncate
    U = sampler.random(N)  # (N, d) in [0,1]^d
    # Clip to avoid ±inf at the extremes of ppf
    eps = 1e-12
    U = np.clip(U, eps, 1.0 - eps)
    Z = norm.ppf(U)  # (N, d) standard normals
    return Z


def sobol_integration_check(N_values=(2**5, 2**7, 2**9, 2**11, 2**13)):
    """Convergence benchmark: estimate ∫_0^1 x_1*x_2*...*x_d dx = 0.5^d."""
    from scipy.stats import qmc
    d = 5
    true_value = 0.5 ** d
    print(f"{'N':>8} {'estimate':>15} {'abs error':>15} {'N^-1':>15}")
    for N in N_values:
        sampler = qmc.Sobol(d=d, scramble=False, seed=0)
        U = sampler.random(N)
        estimate = np.prod(U, axis=1).mean()
        print(f"{N:>8} {estimate:>15.8f} {abs(estimate - true_value):>15.2e} "
              f"{1.0/N:>15.2e}")
```

**Key implementation notes** (verified via SciPy v1.17 docs at https://docs.scipy.org/doc/scipy/reference/stats.qmc.html):
- Scrambled Sobol' supports random_state for reproducibility.
- Special sample sizes are **powers of 2** — adding 1 point degrades performance.
- Owen scrambling enables variance estimation via R independent replications.

---

## 5. Test Cases with Expected Outputs & Tolerances

| Test | Setup | Expected | Tolerance |
|------|-------|----------|-----------|
| **Convergence rate (smooth integrand)** | Integrate $\prod_{i=1}^5 x_i$ over $[0,1]^5$ with $N \in \{32, 128, 512, 2048, 8192\}$ | error ≈ O(N⁻¹) | slope of log-log error vs N ≈ -1.0 ± 0.2 |
| **Discrepancy (Sobol' vs MC, d=5, N=1024)** | `qmc.discrepancy(sobol_pts)` vs `discrepancy(mc_pts)` | Sobol' < MC by ≥ 3× | ratio > 3 |
| **Marginal uniformity (KS test)** | Each column vs U[0,1] | p > 0.01 (N=256, KStest) | no reject |
| **Normal-transformation accuracy** | mean(Z), std(Z), corr(Z) for N=65536 | mean≈0, std≈1, corr≈0 | std/mean errors < 0.01 |
| **scramble=True reproducibility** | Two runs same seed | identical output | exact |
| **scramble=True different seed** | Two runs different seeds | distinct, similar discrepancy | discrepancy ratio < 1.1 |
| **Power-of-2 compliance** | N=1024, N=1023 | N=1024 error < N=1023 error | true |
| **High-dim stress (d=100, N=2048)** | Runtime < 1s, no NaN | clean | — |
| **Joe-Kuo direction numbers (default)** | Compare to known first 8 points in d=2 | match published | exact |
| **Sobol' vs antithetic MC, N=10000** | Sobol' error < antithetic | Sobol' wins by ≥ 2× | ratio > 2 |

The convergence-rate test is the headline validation: it directly verifies the O(N⁻¹) theoretical claim.

---

## 6. Stress Test Methodology (Boundary Conditions)

1. **N = 1** (single point): should return [0.5, 0.5, ...] (center of cube).
2. **d = 1** (univariate): Sobol' reduces to van der Corput sequence; verify against `qmc.Sobol(d=1).random_base2(m=0)`.
3. **N not power of 2** (e.g., 1000): should still run but with suboptimal uniformity; assert discrepancy is finite but not minimal.
4. **d = 21201** (max SciPy): should run without error (large memory but valid).
5. **Extreme tail (norm.ppf at 1-1e-12)**: clip U to [1e-12, 1-1e-12] before transform to avoid ±inf.
6. **Owen scrambling variance**: compute CVaR from R=30 independent scrambled replications; assert empirical standard error of mean ≤ 0.5× raw MC standard error.
7. **Wrong-dim direction numbers**: assert ValueError when d > 21201.

---

## 7. Performance Benchmark Expectations

- **Sobol' point generation**: N=1,000,000, d=20 should take <1s in SciPy (vectorized C backend).
- **vs numpy.random**: Sobol' is 5–10× slower per point BUT achieves same accuracy with ~10× fewer points → net 5–10× speedup for portfolio simulation.
- **Memory**: O(N·d) float64 = 160 MB for N=10M, d=20.
- **Convergence**: at N=10⁴, Sobol' typically matches MC at N=10⁵ (10× sample reduction).

Reference: SciPy `qmc.Sobol` uses Joe-Kuo direction numbers up to d=21201 — verified at https://docs.scipy.org/doc/scipy/reference/stats.qmc.html.

---

## 8. 10-Point Verification

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Correctness vs primary source | ✅ | Antonov-Saleev 1979 Gray-code update matches Sobol' 1967 definition |
| 2 | Numerical stability | ✅ | SciPy validates against Joe-Kuo tables; tested in scipy CI |
| 3 | Computational efficiency | ✅ | O(1) per point per dim after init |
| 4 | Edge case handling | ✅ | Power-of-2 special sample size; clip at extremes |
| 5 | Recency (still standard) | ✅ | SciPy v1.17 (2025) ships Joe-Kuo 2008 numbers |
| 6 | Multi-source consensus | ✅ | SciPy, NLopt, QuantLib all use Sobol'; Owen 2019 review |
| 7 | Authoritative citation | ✅ | Sobol' 1967 (peer-reviewed Zh. Vych. Mat. Mat. Fiz.) |
| 8 | Test coverage | ✅ | 10 tests including convergence-rate slope verification |
| 9 | Documentation clarity | ✅ | Math + SciPy API + convergence analysis in one card |
| 10 | Production-readiness | ✅ | SciPy.stats.qmc in production since v1.7 (2020) |

---

## 9. DSCR Sovereign OS Slice 2 Integration

The Slice 2 P2-1 Monte Carlo engine should use Sobol' for:
1. **CVaR estimation** (TOPIC 7): reduce N from 100k to 10k for same accuracy.
2. **Pricing MBS tranches** with nested Monte Carlo: outer loop Sobol' for variance reduction.
3. **Stress scenario sampling**: same scramble seed → reproducible stress runs.

**Validation hook for Slice 2:** Compare t-copula MC vs t-copula Sobol' on 99% CVaR of a 20-loan portfolio. Sobol' should achieve ≤ 0.5× the standard error at equal N.

---

## 10. Verdict

**PASS** — Sobol' QMC is mathematically rigorous, has authoritative primary citation (Sobol' 1967), validated secondary references (Joe-Kuo 2008 direction numbers, Glasserman Ch. 4), and a battle-tested SciPy implementation. Confidence: **5/5**. Implementation effort for Slice 2: **5 hours** (1h integration with scipy.stats.qmc + 2h QMC-vs-MC benchmark suite + 1h scrambled replications for variance estimation + 1h CMBS portfolio validation).
