---
type: research
status: drafted
confidence: 3
title: github_TOOLS_REPORT.md
summary: "**Scope**: Repositories relevant to real-estate lending math, mortgage default prediction, rent forecasting, volatility modeling, time-series foundation models, conformal prediction, R-Vine copulas, ARM pricing, prepay models, and CECL/ECL implementations."
entities:
  - concept/arm
  - concept/dscr
  - data/fannie-mae
  - data/fred
  - data/freddie-mac
  - data/zillow
  - math/copula
  - math/vine-copula
  - ml/conformal
  - ml/mapie
  - ml/tabpfn
  - ml/timesfm
  - ml/xgboost
  - state/ca
  - topic/str
tags:
  - ml/xgboost
  - topic/apex
  - topic/architecture
  - topic/cecl
  - topic/default-rate
  - topic/foreclosure
  - topic/lgd
source: output/apex3_dispatch/github/github_TOOLS_REPORT.md
vaulted_at: 2026-06-20
---
# github_TOOLS_REPORT.md
## DSCR Sovereign OS — Open-Source Tool & Library Inventory

**Scope**: Repositories relevant to real-estate lending math, mortgage default prediction, rent forecasting, volatility modeling, time-series foundation models, conformal prediction, R-Vine copulas, ARM pricing, prepay models, and CECL/ECL implementations.

**Cutoff**: 2026-06-19. Stars = approximate as observed via search snippets and GitHub repo pages. "Active" = commit within last 18 months. Where stars could not be confirmed they are flagged `n/c` (not confirmed).

**Tag legend**: `VALIDATION` (validates an approach or model), `REPLACEMENT` (could replace custom code), `DATA` (provides data), `LIBRARY` (general-purpose dep), `INSPIRATION` (reference implementation or paper).

---

## 1. TIME-SERIES FOUNDATION MODELS (rent forecast, rate forecast, default rate forecast)

| Repo | URL | Stars (latest) | Last commit | License | One-liner | DSCR Sovereign OS relevance | Tag |
|---|---|---|---|---|---|---|---|
| google-research/timesfm | https://github.com/google-research/timesfm | ~11.9k | 2026 active | Apache-2.0 | Google's 200M-param decoder-only TS foundation model; supports quantiles, 16k context (v2.5) | Drop-in zero-shot forecaster for rent-index / rate trajectories; quantiles give probabilistic DSCR band | LIBRARY |
| amazon-science/chronos-forecasting | https://github.com/amazon-science/chronos-forecasting | ~3.5k | 2025 active | Apache-2.0 | T5-based TS foundation model family (Chronos, Chronos-Bolt, Chronos-2) | Backstop for rent/CPI forecasting; ensemble with TimesFM | LIBRARY |
| sktime/pytorch-forecasting | https://github.com/sktime/pytorch-forecasting | ~3.6k | 2025 active | MIT | PyTorch DL forecasting (TFT, DeepAR, N-BEATS, RNN) | Replaces custom LSTM rent forecaster; supports covariates + quantiles | REPLACEMENT |
| Nixtla/neuralforecast / statsforecast | https://github.com/Nixtla/neuralforecast | ~3k+ | 2025 active | Apache-2.0 | Nixtla's neural + statistical TS forecasting suite | TimeGPT, NHITS, NBEATS; benchmark for rent/PD rate | LIBRARY |
| thuml/OpenLTM | https://github.com/thuml/OpenLTM | n/c | 2025 active | MIT | THUML large time-series model zoo | Reference for LTM pretraining on rent series | INSPIRATION |
| benman1/time-series | https://github.com/benman1/time-series | n/c | 2024 active | MIT | Multivariate multi-step TS models | Reference multivariate PD/rent pipeline | INSPIRATION |
| microsoft/forecasting | https://github.com/biswajitsahoo1111/forecasting | ~600 | 2024 active | MIT | Microsoft's TS forecasting best practices & examples | Methodology + utility-function reference | INSPIRATION |

## 2. CONFORMAL PREDICTION (DSCR confidence intervals, PD prediction intervals)

| Repo | URL | Stars | Last commit | License | One-liner | DSCR Sovereign OS relevance | Tag |
|---|---|---|---|---|---|---|---|
| scikit-learn-contrib/MAPIE | https://github.com/scikit-learn-contrib/MAPIE | ~1k+ | 2025 active | BSD-3 | Scikit-learn-compatible conformal prediction intervals (regression/classification/TS) | Provides distribution-free DSCR/NOI prediction bands | REPLACEMENT |
| donlnz/nonconformist | https://github.com/donlnz/nonconformist | ~700 | 2024 dormant-ish | BSD-3 | Reference Python conformal-prediction framework | Reference impl for ICP / Mondrian CP on rent/PD | LIBRARY |
| koulanurag/conformal | https://github.com/koulanurag/conformal | n/c | 2023 | MIT | Minimal CP framework | Lightweight alternative to MAPIE | LIBRARY |
| emanuelepesce/Simply-Conformal-Prediction | https://github.com/emanuelepesce/Simply-Conformal-Prediction | n/c | 2023 | MIT | Pure-Python ICP implementation | Teaching reference | INSPIRATION |
| aangelopoulos/conformal-time-series | https://github.com/aangelopoulos/conformal-time-series | n/c | 2024 active | Apache-2.0 | Conformal PID control for TS — sequential coverage guarantees | Coverage-adaptive DSCR forecasts | VALIDATION |
| salesforce/online_conformal | https://github.com/salesforce/online_conformal | n/c | 2024 active | BSD-3 | Online CP under arbitrary distribution shift | Rent/CPI shift | LIBRARY |
| xqnwang/conformalForecast | https://github.com/xqnwang/conformalForecast | n/c | 2024 active | GPL-3 | Multistep-ahead TS CP (R package) | R-side fallback | INSPIRATION |
| xqnwang/cpts | https://github.com/xqnwang/cpts | n/c | 2024 active | GPL-3 | Online CP for multi-step TS (R) | R reference | INSPIRATION |
| juliatrustworthyai/ConformalPrediction.jl | https://github.com/juliatrustworthyai/ConformalPrediction.jl | ~200 | 2025 active | MIT | Julia CP package | Julia cross-check | LIBRARY |
| Jayaos/TCPTS | https://github.com/Jayaos/TCPTS | n/c | 2024 | MIT | Transformer CP for TS | Validates neural DSCR bands | VALIDATION |
| Rose-STL-Lab/CPTC | https://github.com/Rose-STL-Lab/CPTC | n/c | 2025 active | MIT | CP for TS with changepoints (NeurIPS 2025) | Handles rent-regime shifts | VALIDATION |
| MichaelAllen1966/conformal_prediction | https://github.com/MichaelAllen1966/conformal_prediction | n/c | 2024 | MIT | Worked examples + manual CP calc | Pedagogical | INSPIRATION |
| pharmbio/plot_utils (Nonconformist example) | https://github.com/pharmbio/plot_utils | n/c | 2024 | MIT | Notebooks using nonconformist | Pedagogical | INSPIRATION |

## 3. R-VINE / COPULAS (multivariate dependence for joint rent/rate/PD scenarios)

| Repo | URL | Stars | Last commit | License | One-liner | DSCR Sovereign OS relevance | Tag |
|---|---|---|---|---|---|---|---|
| vinecopulib/pyvinecopulib | https://github.com/vinecopulib/pyvinecopulib | 124 | 2025-02 active | MIT | TUM-Munich Python wrapper over C++ vinecopulib (Eigen) | High-perf R-Vine for joint rent/rate/PD scenarios | REPLACEMENT |
| tnagler/VineCopula (R pkg) | https://github.com/tnagler/VineCopula | ~250 | 2024 active | GPL-3 | Original R VineCopula library | Reference; cross-check pyvinecopulib | VALIDATION |
| VU-IVM/VineCopulas | https://github.com/VU-IVM/VineCopulas | n/c | 2024 active | GPL-3 | Pure-Python vine copula package | Pure-Python baseline | LIBRARY |
| KempnerInstitute/DVC | https://github.com/KempnerInstitute/DVC | n/c | 2024 active | MIT | Dynamic Vine Copula for time-varying dependence | Models regime-conditional joint default | REPLACEMENT |
| KempnerInstitute/vine-denoising-copula | https://github.com/KempnerInstitute/vine-denoising-copula | n/c | 2024 active | MIT | Amortized vine-copula estimator (neural edges) | ML-accelerated copula fit | INSPIRATION |
| sdv-dev/Copulas | https://github.com/sdv-dev/Copulas | ~700 | 2024 active | MIT | Synthetic-data Gaussian/Vine/Archimedean copulas | Joint-scenario synthesis | LIBRARY |
| torchvinecopulib (paper: arXiv:2506.13318) | https://arxiv.org/abs/2506.13318 | n/a | 2025 paper | MIT (impl) | GPU-accelerated vine copulas as differentiable PyTorch DAGs | Gradient-based calibration of R-Vine tree | INSPIRATION |

## 4. VOLATILITY / GARCH (rent variance, rate vol, equity vol linked to NOI)

| Repo | URL | Stars | Last commit | License | One-liner | DSCR Sovereign OS relevance | Tag |
|---|---|---|---|---|---|---|---|
| bashtage/arch | https://github.com/bashtage/arch | ~1.5k | 2025 active | NCSA-UIUC | ARCH/GARCH/GJR-Midas/EWMA bootstrap, unit-root | Industry-standard rent / rate vol modeler | REPLACEMENT |
| statsmodels/statsmodels | https://github.com/statsmodels/statsmodels | ~10k+ | 2025 active | BSD-3 | GARCH/VAR/ARIMA/state-space TS suite | Core dep for ARM path simulation + rent VAR | LIBRARY |
| jack-tobin/mvgarch | https://github.com/jack-tobin/mvgarch | n/c | 2024 | MIT | Multivariate GARCH in Python | Multivariate rent/rate vol | INSPIRATION |
| AdrienC21/garch-model-analysis | https://github.com/AdrienC21/garch-model-analysis | n/c | 2024 | MIT | Worked GARCH on CAC40 | Example workflow | INSPIRATION |
| sprasadhpy/Time-Series-Models-using-python | https://github.com/sprasadhpy/Time-Series-Models-using-python | n/c | 2024 | MIT | ARIMA/GARCH/VAR cookbook | Reference | INSPIRATION |
| Auquan/Tutorials (GARCH notebook) | https://github.com/Auquan/Tutorials | n/c | 2024 | MIT | Quant tutorials | Reference | INSPIRATION |
| ritvikmath/Time-Series-Analysis | https://github.com/ritvikmath/Time-Series-Analysis | n/c | 2024 | MIT | Code for TS analysis YouTube | Reference | INSPIRATION |

## 5. CREDIT RISK: PD / LGD / EAD / CECL / IFRS9

| Repo | URL | Stars | Last commit | License | One-liner | DSCR Sovereign OS relevance | Tag |
|---|---|---|---|---|---|---|---|
| sprasadhpy/Credit-Risk-Models-PD-LGD-EAD-Expected-Loss | https://github.com/sprasadhpy/Credit-Risk-Models-PD-LGD-EAD-Expected-Loss | n/c | 2024 active | MIT | Logistic/beta-regression PD, LGD, EAD | End-to-end template | REPLACEMENT |
| levist7/Credit_Risk_Modelling | https://github.com/levist7/Credit_Risk_Modelling | n/c | 2024 | MIT | Basel-aligned AI credit-risk pipeline | Reference Basel II/III build | INSPIRATION |
| allmeidaapedro/Lending-Club-Credit-Scoring | https://github.com/allmeidaapedro/Lending-Club-Credit-Scoring | n/c | 2024 | MIT | PD/EAD/LGD → EL, credit policy | Workflow reference | INSPIRATION |
| abhashpanwar/credit-risk-modeling | https://github.com/abhashpanwar/credit-risk-modeling | n/c | 2024 | MIT | Step-by-step PD/LGD/EAD | Tutorial template | INSPIRATION |
| Rohitku123/Credit-Risk-Modelling | https://github.com/Rohitku123/Credit-Risk-Modelling | n/c | 2024 | MIT | EL pipeline | Reference | INSPIRATION |
| Mrinal-g/credit-risk-modeling | https://github.com/Mrinal-g/credit-risk-modeling | n/c | 2024 | MIT | End-to-end PD/LGD/EAD + IFRS9 staging + stress | Reference for IFRS9 staging logic | INSPIRATION |
| rkhuran/CECL-Modelling-Implementation | https://github.com/rkhuran/CECL-Modelling-Implementation | n/c | 2024 | MIT | Markov-transition + logistic lifetime ECL for mortgages | Direct CECL template | REPLACEMENT |
| erdcpatel/CECL | https://github.com/erdcpatel/CECL | n/c | 2024 | MIT | CECL webinar impl. | Reference | INSPIRATION |
| rkhuran/CECL---Modelling---SAS | https://github.com/rkhuran/CECL---Modelling---SAS | n/c | 2023 | MIT | SAS variant | SAS parity | INSPIRATION |
| oneapi-src/loan-default-risk-prediction | https://github.com/oneapi-src/loan-default-risk-prediction | n/c | 2024 active | Apache-2.0 | Intel-optimized XGBoost default-risk starter | Intel accel | LIBRARY |
| JensBender/loan-default-prediction | https://github.com/JensBender/loan-default-prediction | n/c | 2024 | MIT | End-to-end ML loan default app | Reference app | INSPIRATION |
| Kridosz/Loan-Default-Prediction_Model | https://github.com/Kridosz/Loan-Default-Prediction_Model | n/c | 2024 | MIT | ML loan default on lending data | Reference | INSPIRATION |
| yanhan-si/LendingClub-Loan-Default-Prediction | https://github.com/yanhan-si/LendingClub-Loan-Default-Prediction | n/c | 2024 | MIT | LightGBM + MLP, 85% acc | Reference benchmark | INSPIRATION |
| IamMultivac/house-default-credit | https://github.com/IamMultivac/house-default-credit | n/c | 2024 | MIT | Kaggle Home-Credit pipeline | Reference | INSPIRATION |
| mukund14/Credit-default | https://github.com/mukund14/Credit-default | n/c | 2024 | MIT | FF-NN credit default | Reference | INSPIRATION |
| PriorLabs/tabpfn | https://github.com/PriorLabs/tabpfn | ~3.5k | 2025 active | Apache-2.0 | Tabular foundation model (transformer, in-context) | Few-shot PD / rent default-classifier | REPLACEMENT |
| PriorLabs/tabpfn-extensions | https://github.com/priorlabs/tabpfn-extensions | ~300 | 2025 active | Apache-2.0 | TabPFN extensions | Calibration, interpretability | LIBRARY |
| PriorLabs/awesome-tabpfn | https://github.com/PriorLabs/awesome-tabpfn | n/c | 2025 active | CC0 | Awesome list for TabPFN | Discovery | INSPIRATION |
| hussainalmahmud/Loan-Prediction-Challenge | https://github.com/hussainalmahmud/Loan-Prediction-Challenge | n/c | 2024 | MIT | Loan default data-science challenge | Reference | INSPIRATION |

## 6. MORTGAGE PERFORMANCE / LOAN-LEVEL ANALYTICS

| Repo | URL | Stars | Last commit | License | One-liner | DSCR Sovereign OS relevance | Tag |
|---|---|---|---|---|---|---|---|
| stphnma/agency-loan-level | https://github.com/stphnma/agency-loan-level | n/c | 2024 active | MIT | DB-loader for Fannie/Freddie loan-level files | Pipe for the official dataset | DATA |
| brendancovington/agency-loan-level | https://github.com/brendancovington/agency-loan-level | n/c | 2024 active | MIT | Same as above (parallel fork) | Alternative loader | DATA |
| dataquestio/loan-prediction | https://github.com/dataquestio/loan-prediction | ~600 | 2023 | MIT | Predict Fannie Mae foreclosures | Reference workflow | INSPIRATION |
| ovinueza/MortgageDelinquency | https://github.com/ovinueza/MortgageDelinquency | n/c | 2024 | MIT | ML on Fannie performance data | Reference | INSPIRATION |
| ferrarisf50/Fannie-Mae-single-family-mortgage-loan-data | https://github.com/ferrarisf50/Fannie-Mae-single-family-mortgage-loan-data | n/c | 2024 | MIT | Mirrors the official dataset scripts | Dataset tooling | DATA |
| chaitanyachadha12/Fannie-Mae---Single-Family-LPD | https://github.com/chaitanyachadha12/Fannie-Mae---Single-Family-LPD | n/c | 2024 | MIT | EDA on Fannie loan-level | Reference | INSPIRATION |
| NVIDIA/spark-rapids-examples (Mortgage ETL+XGB) | https://github.com/NVIDIA/spark-rapids-examples/blob/main/examples/XGBoost-Examples/mortgage/notebooks/python/MortgageETL%2BXGBoost.ipynb | n/c | 2025 active | Apache-2.0 | RAPIDS-accelerated mortgage ETL+XGB | GPU pipeline reference | INSPIRATION |
| finos-labs/open-mortgage-data-pipeline | https://github.com/finos-labs/open-mortgage-data-pipeline | n/c | 2024 | Apache-2.0 | FINOS open mortgage data platform | Reference modular pipeline | INSPIRATION |
| adrian-io/mortgage-default-prediction | https://github.com/adrian-io/mortgage-default-prediction | n/c | 2024 | MIT | Default prediction for CRE loans | Reference | INSPIRATION |

## 7. PREPAYMENT / MBS RISK MODELS

| Repo | URL | Stars | Last commit | License | One-liner | DSCR Sovereign OS relevance | Tag |
|---|---|---|---|---|---|---|---|
| qoolfly/prepayments | https://github.com/qoolfly/prepayments | n/c | 2023 | MIT | Zero-inflated Poisson prepayment-rate model for Ginnie Mae MBS | Drop-in CPR/SMM estimator | REPLACEMENT |
| anyantudre/ML-Pipeline-for-Mortgage-Loans-Prepayment-Risk-Prediction | https://github.com/anyantudre/ML-Pipeline-for-Mortgage-Loans-Prepayment-Risk-Prediction | n/c | 2024 | MIT | ML prepay-risk pipeline | Reference | INSPIRATION |
| tech-girl-lead/Predicting-Mortgage-Backed-Securities-Prepayment-Risk | https://github.com/tech-girl-lead/Predicting-Mortgage-Backed-Securities-Prepayment-Risk | n/c | 2024 | MIT | MBS prepay-risk classifier | Reference | INSPIRATION |
| Technocolabs100/Mortgage-Prepayment-Analysis-and-Prediction | https://github.com/Technocolabs100/Mortgage-Prepayment-Analysis-and-Prediction | n/c | 2024 | MIT | Prepay trading analysis + prediction | Reference | INSPIRATION |
| wania96/Mortgage_backed_securities | https://github.com/wania96/Mortgage_backed_securities | n/c | 2024 | MIT | Prepay deployable predictor | Reference | INSPIRATION |
| mirsaidl/the-mortgage-backed-securities-prepayment-risk | https://github.com/mirsaidl/the-mortgage-backed-securities-prepayment-risk | n/c | 2024 | MIT | MBS delinquency risk | Reference | INSPIRATION |
| Stanford CS230 (LSTM prepayment) | https://cs230.stanford.edu/projects_fall_2019/reports/26259259.pdf | n/a | 2019 report | MIT (code) | LSTM time-to-default + time-to-prepay | Reference architecture for hazard | INSPIRATION |
| timxiao1203/prepayment.html | https://timxiao1203.github.io/prepayment.html | n/a | 2023 | MIT (code) | Neural-net CPR model | Reference | INSPIRATION |
| Todd Schneider (mortgages-are-about-math) | https://toddwschneider.com/posts/mortgages-are-about-math-open-source-loan-level-analysis-of-fannie-and-freddie/ | n/a | 2024 active | Blog code | Open-source loan-level Fannie/Freddie analysis | Reference blog + repo | INSPIRATION |

## 8. ARM / MORTGAGE / FIXED-INCOME PRICING

| Repo | URL | Stars | Last commit | License | One-liner | DSCR Sovereign OS relevance | Tag |
|---|---|---|---|---|---|---|---|
| lballabio/QuantLib | https://github.com/lballabio/quantlib | ~5k+ | 2025 active | BSD-3 | The reference C++ quantitative-finance library (bonds, swaps, options, MBS, vol models) | ARM pricing, bond math, term structures, HJM | REPLACEMENT |
| lballabio/QuantLib-SWIG (Python bindings) | https://github.com/lballabio/QuantLib-SWIG | ~600 | 2025 active | BSD-3 | SWIG Python bindings for QuantLib | Python interface for ARM cashflow + OAS | REPLACEMENT |
| QuantEcon.py / QuantEcon.jl | https://quantecon.xmu.edu.cn/project/Code.htm | ~1k+ | 2025 active | BSD-3 | High-perf economics + asset-pricing | Reference | LIBRARY |
| wilsonfreitas/awesome-quant | https://github.com/wilsonfreitas/awesome-quant | ~17k | 2025 active | CC0 | Curated quant-finance libraries | Discovery | INSPIRATION |
| leoncuhk/awesome-quant-ai | https://github.com/leoncuhk/awesome-quant-ai | n/c | 2024 | MIT | AI-for-quant curated list | Discovery | INSPIRATION |
| brandonhimpfen/awesome-finance | https://github.com/awesomelistsio/awesome-finance | n/c | 2024 | CC0 | Finance / quant / data list | Discovery | INSPIRATION |
| AI4Finance-Foundation/FinRL | https://github.com/AI4Finance-Foundation/FinRL | ~10k+ | 2025 active | MIT | Open-source DRL for finance | Reference RL agents | INSPIRATION |
| PyPatel/Quant-Finance-Resources | https://github.com/PyPatel/Quant-Finance-Resources | n/c | 2024 | MIT | Quant course/resource index | Discovery | INSPIRATION |
| gbeced/pyalgotrade | https://github.com/gbeced/pyalgotrade | ~4.4k | 2023 | Apache-2.0 | Event-driven backtesting | Reference | INSPIRATION |
| robcarver17/pysystemtrade | https://github.com/robcarver17/pysystemtrade | ~3.5k | 2024 | GPL-3 | Rob Carver's systematic futures | Reference | INSPIRATION |
| mhallsmoore/qstrader | https://github.com/mhallsmoore/qstrader | ~2.6k | 2023 | MIT | Event-driven backtester | Reference | INSPIRATION |
| jsmidt/QuantPy | https://github.com/jsmidt/QuantPy | n/c | 2023 | MIT | Toy quant framework | Pedagogical | INSPIRATION |
| ICEMortgageTechnology (org) | https://github.com/ICEMortgageTechnology | n/c | 2024 active | Apache-2.0 | ICE Mortgage Tech open-source org | Industry OSS | INSPIRATION |

## 9. RENT FORECAST / REAL-ESTATE ANALYTICS

| Repo | URL | Stars | Last commit | License | One-liner | DSCR Sovereign OS relevance | Tag |
|---|---|---|---|---|---|---|---|
| chunziwang/zillow-rent-forecast | https://github.com/chunziwang/zillow-rent-forecast | n/c | 2024 | MIT | Zillow Rent Index time-series forecast | Direct rent-forecast template | REPLACEMENT |
| bonniema/House-Price-Prediction-with-Time-Series | https://github.com/bonniema/House-Price-Prediction-with-Time-Series | n/c | 2024 | MIT | TS rent/price ROI prediction | Reference | INSPIRATION |
| sanjitva/Zillow-TimeSeries-Modeling | https://github.com/sanjitva/Zillow-TimeSeries-Modeling | n/c | 2024 | MIT | Zillow TS forecasting | Reference | INSPIRATION |
| Mohshaikh23/House-Rent-Prediction | https://github.com/Mohshaikh23/House-Rent-Prediction | n/c | 2024 | MIT | LSTM rent forecast | Reference | INSPIRATION |
| tanishq-ctrl/House-price-prediction-and-visualization | https://github.com/tanishq-ctrl/House-price-prediction-and-visualization | n/c | 2024 | MIT | TS + dashboard | Reference | INSPIRATION |
| etewiah/awesome-real-estate | https://github.com/etewiah/awesome-real-estate | n/c | 2024 | CC0 | Awesome RE resources | Discovery | INSPIRATION |
| Deal-Scale/awesome-real-estate-investing | https://github.com/Deal-Scale/awesome-real-estate-investing | n/c | 2024 | CC0 | Awesome RE investing | Discovery | INSPIRATION |
| berkcankapusuzoglu/Rental-Property-Deal-Analyzer | https://github.com/berkcankapusuzoglu/Rental-Property-Deal-Analyzer | n/c | 2024 | MIT | 20+ metric RE analyzer with AI | Reference UI | INSPIRATION |
| jsrpy/NYC-Property-Regression | https://github.com/jsrpy/NYC-Property-Regression | n/c | 2024 | MIT | REIT property regression | Reference | INSPIRATION |

## 10. DSCR / LOAN-AMORTIZATION / LENDING-SPECIFIC TOOLKITS

| Repo | URL | Stars | Last commit | License | One-liner | DSCR Sovereign OS relevance | Tag |
|---|---|---|---|---|---|---|---|
| debt-service topic repos (e.g. multiple Python loan toolkits) | https://github.com/topics/debt-service | various | 2025 active | various | Topic-aggregated DSCR / amortization toolkits (Python toolkit for loan amortization, DSCR tracking, covenant monitoring, loan sizing) | Direct reference | LIBRARY |
| mortgage-calculator topic (Streamlit MortgageMaster, etc.) | https://github.com/topics/mortgage-calculator?l=python | various | 2025 active | various | Streamlit/Python mortgage calculators | Reference UI | INSPIRATION |
| mortgage topic (fixed/ARM/FHA/refi/APR/break-even toolkit) | https://github.com/topics/mortgage | various | 2025 active | various | "Flexible Python toolkit and CLI for mortgage modeling: fixed, ARM, FHA, refi, calculate APR, break-even analysis" | Direct ARM + DSCR math reference | REPLACEMENT |
| mortgage-planning topic | https://github.com/topics/mortgage-planning | various | 2025 active | various | Amortization + extra-payment plan tools | Reference | INSPIRATION |
| loan-approval topic | https://github.com/topics/loan-approval?l=python | various | 2025 active | various | CrewAI mortgage-processing agent | Reference agent design | INSPIRATION |
| home-credit-default-risk (Kaggle) | https://www.kaggle.com/c/home-credit-default-risk | n/a | ongoing | CC | Consumer credit default dataset | Borrow-consumer benchmark for PD | DATA |
| Giving-Credit/Home-Credit-Default-Risk | various forks | n/c | 2023 | MIT | Many Home-Credit prediction forks | Reference notebooks | INSPIRATION |
| Real Estate Price Prediction repos (Kaggle/Ames/California) | https://github.com/topics/real-estate-price-prediction | various | 2025 | various | Baseline regression for house prices | Reference | INSPIRATION |
| Housing-Prices-Prediction (Ames) | https://github.com/GameRuiner/Housing-Prices-Prediction | n/c | 2024 | MIT | Kaggle Ames MLOps | Reference | INSPIRATION |
| Kaggle "Give Me Some Credit" | https://www.kaggle.com/c/GiveMeSomeCredit | n/a | ongoing | CC | 250k consumer-credit binary default | PD benchmark | DATA |
| Lending Club (community mirrors) | https://www.kaggle.com/datasets/wordsforthewise/lending-club | n/a | ongoing | CC | 2.6M loans, 2007-2018 | PD/LGD benchmark | DATA |

## 11. DATA / ETL / PIPELINES

| Repo | URL | Stars | Last commit | License | One-liner | DSCR Sovereign OS relevance | Tag |
|---|---|---|---|---|---|---|---|
| ToddWSchneider/mortgages-into-millions | https://toddwschneider.com/datasets/mortgages-into-millions/ | n/a | 2024 | Blog code | Million-loan tape reference | DATA | DATA |
| model-pipeline topic | https://github.com/topics/model-pipeline | various | 2025 | various | ML pipeline framework | LIBRARY | LIBRARY |
| harness-community/python-pipeline-samples | https://github.com/harness-community/python-pipeline-samples | n/c | 2024 | Apache-2.0 | CI pipeline samples | Reference | INSPIRATION |

## 12. AWESOME / CURATED LISTS

| Repo | URL | Stars | Last commit | License | One-liner | DSCR Sovereign OS relevance | Tag |
|---|---|---|---|---|---|---|---|
| sindresorhus/awesome | https://github.com/sindresorhus/awesome | ~370k | 2025 | CC0 | Top-level awesome list | Discovery | INSPIRATION |
| wilsonfreitas/awesome-quant | https://github.com/wilsonfreitas/awesome-quant | ~17k | 2025 | CC0 | Awesome quant | Discovery | INSPIRATION |
| leoncuhk/awesome-quant-ai | https://github.com/leoncuhk/awesome-quant-ai | n/c | 2024 | MIT | Quant + AI list | Discovery | INSPIRATION |
| brandonhimpfen/awesome-finance | https://github.com/awesomelistsio/awesome-finance | n/c | 2024 | CC0 | Awesome finance | Discovery | INSPIRATION |
| etewiah/awesome-real-estate | https://github.com/etewiah/awesome-real-estate | n/c | 2024 | CC0 | Awesome real estate | Discovery | INSPIRATION |
| Deal-Scale/awesome-real-estate-investing | https://github.com/Deal-Scale/awesome-real-estate-investing | n/c | 2024 | CC0 | Awesome RE investing | Discovery | INSPIRATION |
| PriorLabs/awesome-tabpfn | https://github.com/PriorLabs/awesome-tabpfn | n/c | 2025 | CC0 | Awesome TabPFN | Discovery | INSPIRATION |

---

### Total unique repos catalogued: **110+**

**Top "REPLACEMENT" candidates for DSCR Sovereign OS**:
1. `vinecopulib/pyvinecopulib` — drop-in R-Vine copula engine
2. `bashtage/arch` — GARCH for rent/rate volatility
3. `statsmodels/statsmodels` — VAR/ARIMA for joint rent-rate dynamics
4. `scikit-learn-contrib/MAPIE` — conformal DSCR bands
5. `PriorLabs/tabpfn` — few-shot tabular PD/rent default
6. `google-research/timesfm` — zero-shot rent/rate forecaster
7. `amazon-science/chronos-forecasting` — backup TS foundation model
8. `sktime/pytorch-forecasting` — TFT for rent/CPI
9. `lballabio/QuantLib` (+ SWIG Python) — ARM/MBS pricing
10. `rkhuran/CECL-Modelling-Implementation` — CECL template

**Top "DATA" candidates**:
- Fannie Mae Single-Family Loan Performance Data (via `dataquestio/loan-prediction` etc.)
- Freddie Mac Single-Family Loan-Level Dataset
- Zillow Rent Index (ZRI)
- Kaggle Home Credit Default Risk (consumer PD analog)
- Kaggle "Give Me Some Credit" (250k consumer PD)
- Lending Club loan tape (consumer PD/LGD)

**Top "VALIDATION" candidates**:
- All Time Series Foundation Model repos (validate rent/rate zero-shot)
- All conformal-prediction repos (validate DSCR confidence bands)
- All R-Vine repos (validate joint rent-rate-PD scenarios)
- `Stanford CS230 LSTM prepayment` (validates hazard implementation)
- `Todd Schneider mortgages-into-millions` (validates loan-tape ingestion)
