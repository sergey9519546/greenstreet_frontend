---
type: research
slice: 2
status: drafted
confidence: 3
title: DSCR Sovereign OS — Quantitative Libraries Inventory
summary: "**Scope:** Python libraries and foundation models for Slice 2 (rate path) and beyond: R-Vine copulas, GARCH/ARCH volatility, conformal prediction (MAPIE), TabPFN, TimesFM / Chronos time-series foundation models, Nelson-Siegel-Svensson yield curve fitting, Hull-White short rate, CECL PD×LGD×EAD, prepay CPR models, QuantLib ARM pricing, mortgage pipeline math."
entities:
  - concept/arm
  - concept/dscr
  - math/copula
  - math/vine-copula
  - ml/conformal
  - ml/mapie
  - ml/shap
  - ml/tabpfn
  - ml/timesfm
  - slice/2
  - topic/str
tags:
  - topic/apex
  - topic/cecl
  - topic/default-rate
  - topic/lgd
  - topic/portfolio
  - topic/yield-curve
source: output/apex3_dispatch/quant_libs/quant_libs_REPORT.md
vaulted_at: 2026-06-20
---
# DSCR Sovereign OS — Quantitative Libraries Inventory

**Scope:** Python libraries and foundation models for Slice 2 (rate path) and beyond: R-Vine copulas, GARCH/ARCH volatility, conformal prediction (MAPIE), TabPFN, TimesFM / Chronos time-series foundation models, Nelson-Siegel-Svensson yield curve fitting, Hull-White short rate, CECL PD×LGD×EAD, prepay CPR models, QuantLib ARM pricing, mortgage pipeline math.

**Working dir:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\output\apex3_dispatch\quant_libs`
**Target Python:** 3.12 (Windows x86_64)
**Library count:** 33 entries across 9 categories.

**Priority legend:**
- **HIGH** — required for Slice 2 P0-3+ delivery; mature, actively maintained, Python 3.12 wheels available.
- **MED** — strong supporting role; useful for Slice 2 or downstream slices; either lighter scope or has license caveats.
- **LOW** — niche / fallback / nice-to-have; integrate only if roadmap needs it.

---

## 1. R-Vine Copulas (Slice 2 P0-3+ dependency)

| # | Library | URL | pip install | License | Last release | Stars | Py 3.12 | DSCR fit | Priority |
|---|---------|-----|-------------|---------|--------------|-------|---------|----------|----------|
| 1 | **pyvinecopulib** (vinecopulib TUM Munich) | https://github.com/vinecopulib/pyvinecopulib | `pip install pyvinecopulib` | MIT | 0.7.6 — May 7 2026 | 124 | Y (cp312-abi3 wheel on PyPI) | C++/Eigen-backed R-Vine copula inference; required for multivariate tail dependence modeling (rent × rate × prepay × default joint). Native Windows wheel. | **HIGH** |
| 2 | **torchvinecopulib** (Cheng et al. 2025, arXiv 2506.13318) | https://github.com/TY-Cheng/torchvinecopulib | `pip install torchvinecopulib` | MIT (paper repo) | v1.1.2 (2025) | <50 (new) | Y (Python 3.10+) | GPU-accelerated differentiable vine copulas via PyTorch; differentiable DAG for vine copulas. Excellent for hybrid ML + copula pipelines. | **MED** |
| 3 | **vinecopulib** (C++ header library, VineCopula R package sibling) | https://github.com/vinecopulib/vinecopulib | (build from source; use pyvinecopulib binding) | MIT | matches pyvinecopulib | ~50 | Y | Underlying C++ core; included for reference. Use Python binding (#1) directly. | **LOW** |
| 4 | **VineCopula** (R package, tnagler) | https://github.com/tnagler/VineCopula | n/a (R) | GPL>=2 | 2.6.0 (Dec 2024) | ~80 | n/a | Reference R implementation; useful for benchmarking only. | **LOW** |

## 2. GARCH / ARCH Volatility Models

| # | Library | URL | pip install | License | Last release | Stars | Py 3.12 | DSCR fit | Priority |
|---|---------|-----|-------------|---------|--------------|-------|---------|----------|----------|
| 5 | **arch** (Kevin Sheppard / bashtage) | https://github.com/bashtage/arch | `pip install arch` | NCSA-style (free) | v8.0.0 — Oct 21 2025 | 1.5k | Y (Python 3.9+; wheels available) | Industry-standard univariate GARCH/EGARCH/GJR with Numba+Cython; required for rate-vol-of-vol modeling and stress-scenario VaR. | **HIGH** |
| 6 | **statsmodels** (GARCH submodule) | https://github.com/statsmodels/statsmodels | `pip install statsmodels` | BSD-3-Clause | active 2026 | ~10k | Y | General-purpose econometrics; GARCH available but lighter than `arch`. Use as fallback. | **MED** |
| 7 | **mgarch** / **arch-py** alternatives | (various) | `pip install arch` is canonical | varies | n/a | n/a | n/a | No compelling alternative to bashtage/arch in 2026. | **LOW** |

## 3. Conformal Prediction (Slice 2 P0-2)

| # | Library | URL | pip install | License | Last release | Stars | Py 3.12 | DSCR fit | Priority |
|---|---------|-----|-------------|---------|--------------|-------|---------|----------|----------|
| 8 | **MAPIE** (scikit-learn-contrib) | https://github.com/scikit-learn-contrib/MAPIE | `pip install mapie` | BSD-3-Clause | v1.4.1 — Jun 8 2026 | 1.6k | Y (3.9+) | Required conformal-prediction library; jackknife+, CV+, time-series conformal, risk control. Drop-in for DSCR prediction intervals and Slice 2 risk band. | **HIGH** |

## 4. Tabular Foundation Model (PD calibration)

| # | Library | URL | pip install | License | Last release | Stars | Py 3.12 | DSCR fit | Priority |
|---|---------|-----|-------------|---------|--------------|-------|---------|----------|----------|
| 9 | **TabPFN** (PriorLabs) | https://github.com/PriorLabs/TabPFN | `pip install tabpfn` | Apache-2.0 + custom non-commercial weights for v2.5/2.6/3 | v8.0.8 — Jun 10 2026 | 7.4k | Y (3.10+) | Tabular foundation model, in-context learning for small datasets (<10k–50k rows). Excellent for CECL PD calibration on small DSCR loan cohorts. NB: v2.5/2.6/3 weights are non-commercial — needs enterprise license for production. | **MED** |
| 10 | **tabpfn-extensions** (PriorLabs) | https://github.com/PriorLabs/TabPFN-extensions | `pip install tabpfn-extensions` | Apache-2.0 | active | ~150 | Y | Interpretability + embedding reuse for TabPFN. Useful for SHAP-based PD feature importance. | **MED** |

## 5. Time-Series Foundation Models (rent / rate forecasting)

| # | Library | URL | pip install | License | Last release | Stars | Py 3.12 | DSCR fit | Priority |
|---|---------|-----|-------------|---------|--------------|-------|---------|----------|----------|
| 11 | **TimesFM** (Google Research) | https://github.com/google-research/timesfm | `pip install timesfm[torch]` (v2.0.1, Jun 2026) | Apache-2.0 | TimesFM-2.0.1 — Jun 11 2026 | 23.9k | Y | 200M-param decoder-only transformer; zero-shot univariate forecast up to 16k context. Use for rent-index / SOFR trajectory forecasting. | **HIGH** |
| 12 | **Chronos** (Amazon Science) | https://github.com/amazon-science/chronos-forecasting | `pip install chronos-forecasting` | Apache-2.0 | 2.3.0 — Jun 18 2026 | 5.5k | Y | T5-based probabilistic time-series foundation models (Chronos-Bolt 9M–205M); Chronos-2 supports covariates. Pair with TimesFM for ensemble forecasting. | **HIGH** |
| 13 | **sktime** (sktime community) | https://github.com/sktime/sktime | `pip install sktime[forecasting]` | BSD-3-Clause | v1.0.1 — Jun 11 2026 | 9.8k | Y (3.10–3.14) | Unified scikit-learn-style API for classical + DL forecasting; bridge library if MAPIE needs a forecaster wrapper. | **HIGH** |
| 14 | **pytorch-forecasting** (sktime) | https://github.com/sktime/pytorch-forecasting | `pip install pytorch-forecasting` | MIT | v1.7.0 — Apr 5 2026 | 4.9k | Y | Temporal Fusion Transformer, N-BEATS, N-HiTS, DeepAR. Use for covariate-aware rent/rate forecasting when more control is needed. | **MED** |
| 15 | **darts** (Unit8) | https://github.com/unit8co/darts | `pip install u8darts[all]` | Apache-2.0 | active 2026 | ~8k | Y | Scikit-learn-style time-series library; integrates TimesFM/Chronos via wrappers. Strong for backtesting + ensembling. | **MED** |

## 6. Yield Curve & Short-Rate Models

| # | Library | URL | pip install | License | Last release | Stars | Py 3.12 | DSCR fit | Priority |
|---|---------|-----|-------------|---------|--------------|-------|---------|----------|----------|
| 16 | **nelson_siegel_svensson** (luphord) | https://github.com/luphord/nelson_siegel_svensson | `pip install nelson_siegel_svensson` | MIT | active (8 tags) | 129 | Y (3.7+) | Pure-Python NSS yield-curve fitting (NS + NSS, OLS calibration, CLI). Use for SOFR / Treasury curve bootstrapping. | **HIGH** |
| 17 | **QuantLib + QuantLib-SWIG** | https://github.com/lballabio/QuantLib-SWIG | `pip install QuantLib` | BSD-3-Clause | QuantLib 1.42.1 — Apr 17 2026 | 393 | Y (cp38-abi3 wheels; cp312 OK) | Gold standard for Hull-White 1F/2F, Vasicek, Black-Karasinski, G2++, Bermudan swaption calibration, ARM/MBS pricing, term-structure bootstrapping. Wheels for Win/amd64, macOS, Linux. | **HIGH** |
| 18 | **Dynamic_Nelson_Siegel_Svensson_Kalman_Filter** (werleycordeiro) | https://github.com/werleycordeiro/Dynamic_Nelson_Siegel_Svensson_Kalman_Filter | `pip install` (manual / clone) | MIT | active | ~40 | Y | DNS-S state-space with Kalman filter for time-varying NSS — fits evolving yield surfaces. | **MED** |
| 19 | **FinancePy** (Dominic O'Kane / domokane) | https://github.com/domokane/FinancePy | `pip install financepy` | GPL-3 (review) | active | ~3k | Y (3.10+) | Pure-Python QuantLib alternative focused on derivatives pricing (bonds, swaps, options, CDS, FX). Good fallback if QuantLib wheels are an issue. License is GPL — verify commercial compatibility. | **MED** |
| 20 | **fython51/Nelson-Siegel-Svensson** | https://github.com/fython51/Nelson-Siegel-Svensson | (clone, no PyPI) | MIT | n/a | <50 | Y | Single-file NSS reference implementation; good for tests / cross-validation. | **LOW** |
| 21 | **open-source-modelling/nelson_siegel_svansson_python** | https://github.com/open-source-modelling/nelson_siegel_svansson_python | (clone, no PyPI) | MIT | n/a | <50 | Y | Reference / educational NSS Python port. | **LOW** |

## 7. CECL / Credit Risk (PD × LGD × EAD)

| # | Library | URL | pip install | License | Last release | Stars | Py 3.12 | DSCR fit | Priority |
|---|---------|-----|-------------|---------|--------------|-------|---------|----------|----------|
| 22 | **skfolio** (skfolio.org / Hugo Delatte) | https://github.com/skfolio/skfolio | `pip install -U skfolio` | BSD-3-Clause | v0.20.1 — Apr 21 2026 | 2k | Y (3.10+) | scikit-learn-compatible portfolio + risk library; built-in Vine Copula, Factor Model, Black-Litterman, CVaR/EDaR risk measures, Entropy Pooling. Excellent for CECL stress distributions and portfolio-level credit overlay. | **HIGH** |
| 23 | **mlfinlab** (Hudson & Thames) | https://github.com/hudson-and-thames/mlfinlab | `pip install mlfinlab` | **All-rights-reserved commercial license** | active (paid) | 4.8k | Y | López de Prado's ML-for-finance toolbox; CODCPENCE measures, labeling, bet sizing, synthetic data. Useful for advanced feature engineering; commercial license required. | **MED** |
| 24 | **Riskfolio-Lib** (dcajasn) | https://github.com/dcajasn/Riskfolio-Lib | `pip install riskfolio-lib` | BSD-3-Clause | active | ~3k | Y | CVXPY-backed portfolio optimization with 13 risk measures; less modern API than skfolio but very mature. | **MED** |
| 25 | **PyPortfolioOpt** (robertmartin8 / PyPortfolio) | https://github.com/PyPortfolio/PyPortfolioOpt | `pip install PyPortfolioOpt` | MIT | v1.5.x (active) | ~4.5k | Y | MPT + Black-Litterman + HRP; widely cited, simple API for baseline CECL correlation modeling. | **MED** |
| 26 | **empyrical** (quantopian) | https://github.com/quantopian/empyrical | `pip install empyrical` | Apache-2.0 | maintenance only | ~2k | Y | Risk & performance metrics (Sharpe, Sortino, max drawdown). Use for CECL backtesting KPIs. | **MED** |
| 27 | **empyrical-reloaded** (community fork) | https://github.com/quantopian/empyrical (fork maintained by awesome-quant list) | `pip install empyrical-reloaded` | Apache-2.0 | active | ~200 | Y | Actively-maintained drop-in replacement after Quantopian shutdown. Preferred over #26. | **MED** |
| 28 | **pyfolio** (quantopian — sunset) | https://github.com/quantopian/pyfolio | `pip install pyfolio` (yanked from PyPI in places) | Apache-2.0 | discontinued 2020 | ~5.5k | Y (legacy) | Portfolio tear-sheets via empyrical; **discontinued** — only use as reference. | **LOW** |

## 8. Mortgage / Amortization / Prepay (CPR)

| # | Library | URL | pip install | License | Last release | Stars | Py 3.12 | DSCR fit | Priority |
|---|---------|-----|-------------|---------|--------------|-------|---------|----------|----------|
| 29 | **amortization** (roniemartinez) | https://pypi.org/project/amortization/ | `pip install amortization` | MIT | 3.0.0 — Apr 6 2026 | n/a (PyPI) | Y (3.10+) | Pure-Python loan amortization schedule generator with Decimal precision; CLI included. Use for clean ARM/fixed-rate cash-flow schedules. | **HIGH** |
| 30 | **jbmohler/mortgage** | https://github.com/jbmohler/mortgage | `pip install mortgage` (legacy / clone) | BSD | 14 commits, dormant | ~10 | Y | Tiny P&I mortgage calculator — useful as test fixture / reference. | **LOW** |
| 31 | **pyloan** | https://pypi.org/project/pyloan/ | `pip install pyloan` | MIT | active | n/a (PyPI) | Y | Lightweight loan calculator with multiple payment frequencies. | **MED** |
| 32 | **amortize** (ahmetserguns) | https://github.com/ahmetserguns/amortize | `pip install amortize` | MIT | active | ~10 | Y | Schedule generator; another option if #29 doesn't fit. | **LOW** |

> **Note on mortgage pipeline math (TBA/MBS servicing):** No mature, dedicated Python library exists for pipeline hedging math. QuantLib (#17) covers MBS pricing (IO/PO/PAC/TAC), but pipeline-level scenarios (lock-to-close fallout, beta-weighted delta, MSR valuation) require custom QuantLib + skfolio (#22) + arch (#5) glue. See also FHAnalytics / MCT / ALM First proprietary platforms (commercial; not open-source Python).

## 9. Foundation-Model Adjacents (cross-cutting)

| # | Library | URL | pip install | License | Last release | Stars | Py 3.12 | DSCR fit | Priority |
|---|---------|-----|-------------|---------|--------------|-------|---------|----------|----------|
| 33 | **Qlib** (Microsoft) | https://github.com/microsoft/qlib | `pip install pyqlib` | MIT | active | 44.8k | Y (3.8–3.12) | AI-oriented quant investment platform; RD-Agent integration; Alpha158/360 factors; useful for alpha research on DSCR cohorts and macro overlays, but heavy. | **LOW** |

---

## Summary by priority

**HIGH (10):** #1 pyvinecopulib, #5 arch, #8 MAPIE, #11 TimesFM, #12 Chronos, #13 sktime, #16 nelson_siegel_svensson, #17 QuantLib, #22 skfolio, #29 amortization.

**MED (14):** #2 torchvinecopulib, #6 statsmodels (GARCH), #9 TabPFN, #10 tabpfn-extensions, #14 pytorch-forecasting, #15 darts, #18 DNS-S Kalman, #19 FinancePy, #23 mlfinlab, #24 Riskfolio-Lib, #25 PyPortfolioOpt, #26/#27 empyrical(-reloaded), #31 pyloan.

**LOW (9):** #3, #4, #7, #20, #21, #28, #30, #32, #33.

---

## Slice 2 P0-3+ Implementation Note

The four Pillars of Slice 2 and their corresponding library anchors:

1. **P0-2 Conformal risk band** → **MAPIE** (#8) wrapped around an **arch** (#5) forecast
2. **P0-3 Multivariate dependence** → **pyvinecopulib** (#1) R-Vine with **TimesFM** (#11) or **Chronos** (#12) marginals
3. **P0-4 Term-structure overlay** → **nelson_siegel_svensson** (#16) + **QuantLib** (#17) Hull-White calibration
4. **P0-5 PD/LGD/EAD CECL** → **skfolio** (#22) + **empyrical-reloaded** (#27) + **TabPFN** (#9) for small-cohort calibration

---

## Alternatives / Unmaintained Watch

- **pyfolio** (#28) — discontinued 2020, do not depend.
- **empyrical** (#26) — superseded by **empyrical-reloaded** (#27).
- **QuantLib-Python build-from-source path** — modern wheels (since 1.34) cover Win/amd64 Python 3.12 cleanly via `pip install QuantLib`; no need to build.
- **TorchGARCH** — existed as research project; if revived, evaluate as GPU alternative to `arch`.

---

## Cross-Cutting Stack Snapshot (recommended)

```
# Slice 2 baseline
pip install arch mapie pyvinecopulib nelson_siegel_svensson QuantLib skfolio
pip install timesfm[torch] chronos-forecasting sktime[forecasting]
pip install tabpfn tabpfn-extensions amortization

# Optional
pip install darts pytorch-forecasting Riskfolio-Lib PyPortfolioOpt
pip install financepy  # GPL — confirm commercial OK
pip install mlfinlab   # commercial license required
```

End of report.
