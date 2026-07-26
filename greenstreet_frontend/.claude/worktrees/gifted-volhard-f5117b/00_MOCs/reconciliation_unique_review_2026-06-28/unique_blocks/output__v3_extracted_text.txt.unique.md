# Unique Content Review

- Source path: output/v3_extracted_text.txt
- Archived path: 99_attachments/generated_archive_2026-06-28/p1_generated_stale_2026-06-28/output/v3_extracted_text.txt
- Replacement path: docs/research/operational/DSCR_Blueprint_Verification_Corrections_Log.md
- Coverage decision: HIGH_RISK_RESTORE_OR_EXTRACT
- Block coverage: 0
- Unique words: 6822
- Preliminary classification: GENERATED_ARTIFACT_RETAIN_ARCHIVE
- Review copy: 00_MOCs\reconciliation_unique_review_2026-06-28\restored_for_review\output\v3_extracted_text.txt

## Unique Headings
- # GUARANTEE: P(Y_new in interval) >= 1-alpha, regardless of model or distribution
- # KEY: arXiv 2405.02140 - conformal intervals upper-bound conditional entropy H(Y|X)
- # Decay mechanism (Dempster-Shafer):
- # nonconformity *= exp(-lambda * t)  where lambda is data-tier specific
- # Calibrated to KBRA-equivalent stress scenarios (from Sprint 6 + TUM research):
- #                Stable   Cyclical   Stress
- # Rent shock     +/-10%   +/-20%    +/-30-40%
- # Vacancy        +200bps  +500bps   +1000bps
- # Cap rate       +50bps   +100bps   +200bps
- # Rate shock     +/-75bps +/-150bps  +/-250bps
- # OpEx shock     +5%      +10%      +20%
- # Portfolio-level CVaR / VaR estimation
- # with backtesting + stress testing baked in
- # Svensson extension adds: + b3 * [(1 - exp(-tau/lambda2))/(tau/lambda2) - exp(-tau/lambda2)]
- # Daily fit workflow:
- # 1. Pull SOFR swap quotes at 1M, 3M, 6M, 1Y, 2Y, 3Y, 5Y, 7Y, 10Y from FRED
- # 2. Fit (b0, b1, b2, b3, lambda1, lambda2) by nonlinear least squares
- # 3. Evaluate forward rate at ARM reset maturity: f(tau) = -d/dtau [tau * y(tau)]
- # 4. Add margin (e.g., 2.50%) to get projected reset rate
- # 5. For Monte Carlo: fit Hull-White (one-factor) short-rate model for rate path uncertainty
- # Pool-level PD curves by:
- # - vintage (2022 originations highest exposure)
- # - FICO band
- # - LTV band
- # - property type
- # - geographic cluster (NY/NJ 48% of new distress!)
- # LGD model:
- # haircut accounts for distressed sale discount + foreclosure costs
- # EAD with amortization:
- # - Sponsor nodes: edges to all properties a single sponsor holds
- # - Property nodes: edges to neighboring properties in same ZIP/STR cluster
- # - Lender nodes: edges to all loans in single lender's book
- # - MSA nodes: edges to all properties in same macro market
- # Graph contagion algorithms:
- # - Spectral methods
- # - Random walk centrality
- # - Community detection
- # Implementation: GNN-derived embeddings as FEATURES into tabular champion
- # (NOT end-to-end black box — structured network risk features in interpretable model)
- # Human review MANDATORY before any LLM-generated content to final documentation

## First Unique Blocks

### Block 1
```text
--- type: research status: drafted confidence: 3 title: V3 Extracted Text summary: "[Normal] DSCR Advisor-Grade Decision Engine [Normal] Cross-Document Synthesis v3.0 — DEFINITIVE" entities: - concept/appreciation - concept/arm - concept/cap-rate - concept/dscr - concept/itia - concept/ltv - concept/pitia - data/cotality - data/fannie-mae - data/fred - data/freddie-mac - data/kbra - data/trepp - lender/angel-oak - lender/deephaven - lender/griffin-funding - lender/kiavi - lender/verus - lender/visio-lending - math/copula - math/t-copula - math/vine-copula - ml/conformal - ml/tabpfn - ml/timesfm - ml/xgboost - regulation/cfpb - regulation/ecoa - regulation/fcra - regulation/hmda - regulation/hoepa - regulation/reg-b - regulation/reg-z - slice/1 - slice/2 - slice/3 - slice/4 - sprint/2 - sprint/3 - sprint/4 - sprint/5 - sprint/6 - state/ca - state/fl - tax/1031 - tax/bonus-depreciation - tax/niit - tax/pal - tax/section-179 - topic/condo - topic/multifamily - topic/non-qm - topic/str tags: - ml/xgboost - topic/40yr-amort - topic/adverse-action - topic/after-tax - topic/apex - topic/architecture - topic/cecl - topic/compliance - topic/default-rate - topic/flood-insurance - topic/forec ... [truncated]
```

### Block 2
```text
# Calibrated to KBRA-equivalent stress scenarios (from Sprint 6 + TUM research): # Stable Cyclical Stress # Rent shock +/-10% +/-20% +/-30-40% # Vacancy +200bps +500bps +1000bps # Cap rate +50bps +100bps +200bps # Rate shock +/-75bps +/-150bps +/-250bps # OpEx shock +5% +10% +20%
```

### Block 3
```text
data = np.column_stack([rent, vacancy, cap, rate, opex]) controls = pv.FitControlsVinecop(family_set=pv.all, criterion='aic', tree_criterion='tau') # max spanning on Kendall's tau vine = pv.Vinecop(data, controls=controls) scenarios = vine.simulate(n=10000, seeds=[42]) [Normal] [ASYMMETRIC TAIL DEPENDENCE] Per-edge family selection (R-vine 10 bivariate copulas): - Rent-Vacancy edge: Clayton copula (lower-tail dependence — joint crashes correlate) - Cap-OpEx edge: Gumbel copula (upper-tail dependence — joint spikes correlate) - Rent-Cap edge: Student-t copula (symmetric — both tails matter) - R-vine structure: max spanning tree on absolute Kendall's tau Per Bundesbank: Gaussian MAY outperform at extreme stress (paradox) — hence mixed families. [Heading 3] Plus portvine (Higher-Level Wrapper for Portfolio CVaR) [Normal] import portvine # Built on pyvinecopulib # Portfolio-level CVaR / VaR estimation # with backtesting + stress testing baked in portfolio_cvar = portvine.compute_cvar( vine=vine, portfolio_positions=[deals], confidence=0.95 ) [Heading 2] 8. Debt 4 — No Forward Rate Surface (ARM Reset Uses Flat Curve) [Normal] Vulnerability: ARM reset engine uses current SOFR swap rate a ... [truncated]
```

### Block 4
```text
# Svensson extension adds: + b3 * [(1 - exp(-tau/lambda2))/(tau/lambda2) - exp(-tau/lambda2)]
```

### Block 5
```text
# Daily fit workflow: # 1. Pull SOFR swap quotes at 1M, 3M, 6M, 1Y, 2Y, 3Y, 5Y, 7Y, 10Y from FRED # 2. Fit (b0, b1, b2, b3, lambda1, lambda2) by nonlinear least squares # 3. Evaluate forward rate at ARM reset maturity: f(tau) = -d/dtau [tau * y(tau)] # 4. Add margin (e.g., 2.50%) to get projected reset rate # 5. For Monte Carlo: fit Hull-White (one-factor) short-rate model for rate path uncertainty [Normal] from scipy.optimize import minimize import numpy as np
```

### Block 6
```text
def nelson_siegel(tau, b0, b1, b2, lam): factor1 = (1 - np.exp(-tau/lam)) / (tau/lam) factor2 = factor1 - np.exp(-tau/lam) return b0 + b1 * factor1 + b2 * factor2
```

### Block 7
```text
def fit_ns(maturities, yields): def objective(params): return np.sum((nelson_siegel(maturities, *params) - yields)**2) return minimize(objective, x0=[0.05, -0.01, 0.01, 1.5], bounds=[(0.01, 0.15), (-0.10, 0.10), (-0.10, 0.10), (0.1, 5.0)]).x [Heading 2] 9. Debt 5 — No Credit Loss Model (CECL PD × LGD × EAD) [Normal] [STRATEGIC FIRST-MOVER] Live signal: DSCR delinquencies doubled in 2 years. First-mover in real expected-credit-loss model for DSCR (not just threshold qualifier but lifetime loss estimate) holds structural analytical advantage. [Normal] Engine computes PROBABILITY deal qualifies at origination. Does NOT compute expected credit loss over loan life. Different problems entirely. [Heading 3] The Fix: CECL PD × LGD × EAD (FASB ASC 326 / Basel III CRE32) [Normal] Expected_Loss = PD * LGD * EAD
```

### Block 8
```text
# Pool-level PD curves by: # - vintage (2022 originations highest exposure) # - FICO band # - LTV band # - property type # - geographic cluster (NY/NJ 48% of new distress!)
```

### Block 9
```text
# LGD model: LGD = 1 - (LTV_at_default * haircut_factor) # haircut accounts for distressed sale discount + foreclosure costs
```

### Block 10
```text
# EAD with amortization: EAD(t) = loan_balance(t) * (1 - prepayment_assumption(t)) [Heading 2] 10. Debt 6 — No Contagion Model for Portfolio-Level Risk [Normal] [MARKET CONFIRMATION] Live signal: 80% of new multifamily distress concentrated in NY/NJ (48%) + Houston (30%) = textbook geographic contagion cluster that no single-deal engine can detect because it has no portfolio network layer. [Normal] Every deal evaluated independently. No model of how deals in same sponsor's portfolio, ZIP cluster, or lender's book interact under stress. FSB May 2026 report on private credit vulnerabilities: hidden leverage at fund/investor levels, indirect exposures not in first-layer reporting, no standardized classification. [Heading 3] The Fix: Spatio-Temporal Graph Risk [Normal] # Graph nodes: # - Sponsor nodes: edges to all properties a single sponsor holds # - Property nodes: edges to neighboring properties in same ZIP/STR cluster # - Lender nodes: edges to all loans in single lender's book # - MSA nodes: edges to all properties in same macro market
```

### Block 11
```text
# Graph contagion algorithms: # - Spectral methods # - Random walk centrality # - Community detection
```

### Block 12
```text
# Implementation: GNN-derived embeddings as FEATURES into tabular champion # (NOT end-to-end black box — structured network risk features in interpretable model) [Heading 2] 11. Debt 7 — LLM Layer Has No Hallucination Firewall [Normal] [SR 26-02 IMPLICATION] SR 26-02 (April 17, 2026) places generative/agentic AI OUTSIDE MRM scope but requires broader governance. LLM-generated content influencing credit decisions needs governance chain. [Normal] Claude given engine JSON and asked to write IC memo will round, misattribute, or confabulate financial figures. Not broken — it's a text coherence system, not a numerical precision system. [Heading 3] The Fix: Deterministic Financial Fact-Checker [Normal] def verify_llm_narrative(narrative: str, engine_output: dict) -> dict: """Extract all numeric claims from narrative. Cross-reference against engine_output JSON. Any number not within 0.5% of an engine value = MISMATCH.""" numbers_in_narrative = extract_numeric_claims(narrative) engine_values = flatten_dict(engine_output) verified, mismatched, fabricated = [], [], [] for num, context in numbers_in_narrative: match = find_close_match(num, engine_values, tolerance=0.005) if match: verified.app ... [truncated]
```

### Block 13
```text
# Edges (typed): # OWNS (Person -> LLC, weight=ownership_pct) # LOCATED_AT (LLC -> Address) # CONTACTS_PHONE (Person -> Phone) # GUARANTEES (Person -> LLC, type=full_recourse)
```

### Block 14
```text
# Model architectures (Heterogeneous Graph Transformer HGT or Temporal Graph Network TGN): from torch_geometric.nn import HGTConv model = HGTConv(in_channels=node_feature_dim, out_channels=embedding_dim, num_types=5, num_relations=4) [Normal] Inference tasks: [List Bullet] Node classification: BeneficialOwner / ShellCompanyOperator / FirstTimeInvestor / HighRiskIndividual [List Bullet] Link prediction: identify hidden OWNS edges (anomaly) [List Bullet] Anomaly detection: unusual network topology (one person owning 50 LLCs across states) [Heading 3] 30.3 Data Sources [List Bullet] Secretary of State (SOS) APIs: CorpAPI, BizFile, Trulioo [List Bullet] Loan application data (1003) [List Bullet] External: public records, news mentions, social media (entity enrichment) [Heading 2] 31. Conformal Prediction Vault (Decaying Confidence) [Heading 3] 31.1 The Framework (Beyond the Rulebook #2) [Normal] from sklearn.ensemble import GradientBoostingRegressor import numpy as np
```

### Block 15
```text
def conformal_prediction_interval(new_x, calibration_X, calibration_y, base_model, alpha=0.10): # Step 1: Compute nonconformity scores on calibration set cal_pred = base_model.predict(calibration_X) scores = np.abs(calibration_y - cal_pred)
```

### Block 16
```text
# Step 2: Apply exponential decay (e^-lambda * t) # Tier 1 (county tax): lambda=low, decays 365d # Tier 3 (borrower-stated rent): lambda=high, decays 30d decay_factors = np.exp(-lambda * data_age_days) weighted_scores = scores * decay_factors
```

### Block 17
```text
# Step 3: Quantile for (1-alpha) coverage q_hat = np.quantile(weighted_scores, np.ceil((len(scores)+1)*(1-alpha))/len(scores))
```

### Block 18
```text
# Step 4: Output interval point_pred = base_model.predict([new_x])[0] return (point_pred - q_hat, point_pred + q_hat) # GUARANTEE: P(Y_new in interval) >= 1-alpha [Normal] Mondrian Conformal by data tier: [List Bullet] Tier 1 (Form 1007, county tax): narrow interval [List Bullet] Tier 2 (RentCast LTR AVM): medium interval [List Bullet] Tier 3 (AirDNA STR projection, borrower-stated rent): wide interval + human review flag [Heading 2] 32. Tabular Foundation Models (TabPFN) for Low-Data [Heading 3] 32.1 The Problem [Normal] Niche DSCR products (5-9 unit multifamily in Florida, Hobby Farms, Non-Warrantable Condos) have SPARSE historical defaults. XGBoost fails. Zero-shot TFM (TabPFN-2.5) gives credible baseline immediately. [Heading 3] 32.2 Implementation (Beyond the Rulebook #2) [Normal] # TabPFN-2.5 (Nature paper 2024 + arXiv 2511.08667): # Pre-trained on millions of diverse tabular datasets. # Zero-shot: makes predictions on new tasks without any fine-tuning. # Few-shot: 20-50 labeled examples -> fine-tune.
```

### Block 19
```text
from tabpfn import TabPFNClassifier model = TabPFNClassifier() # Pre-loaded
```

### Block 20
```text
# New product line (DSCR 5-9 unit Florida): applications = pd.DataFrame({ 'fico': [...], 'ltv': [...], 'dscr': [...], 'property_type': ['5-9_unit_mf'], 'occupancy': [...] })
```

### Block 21
```text
# Zero-shot prediction (no historical defaults needed): default_prob = model.predict_proba(applications) # Returns probability distribution per applicant
```

### Block 22
```text
# As 20-50 actual defaults accumulate: model.fit(applications_with_known_defaults) # Now uses few-shot learning for this specific niche [Heading 1] Part VII — Implementation Roadmap [Heading 2] 33. v1 → v2 → v3 Corrections Summary [Heading 2] 34. Slice-by-Slice Build Plan (Consolidated) [Heading 3] 34.1 Slice 1 — Already Shipped (Production-Ready) [List Bullet] 132 tests passing (was 122; +10 from 10x audit) [List Bullet] 94.37% coverage (was 91%; +3.37pp) [List Bullet] ruff lint + format clean; SR 26-02 status: NOT a model [List Bullet] All 4 v16 BUGs have regression tests [List Bullet] Slice 1 v1.0 quality score 100/100 (per AUDIT_20260618.md) [List Bullet] Files: payment.py / dscr.py / leverage.py / ltv.py / compliance.py [List Bullet] ECOA codes (Form C-1 verbatim) — DO NOT renumber [Heading 3] 34.2 Slice 2 — Distributional DSCR + Lender Compliance (~6 weeks, 250 hr) [Heading 3] 34.3 Slice 3 — Institutional Math + After-Tax + Lender Footprint (~10 weeks, 400 hr) [Heading 3] 34.4 Slice 4 — GNN + Conformal + TFM + Live Data (~12 weeks, 500 hr) [Heading 3] 34.5 Slice 5 — Wholesale + Multi-Product (~16 weeks, 600 hr) [List Bullet] Bank Statement Income Engine (50% expense factor, p ... [truncated]
```

### Block 23
```text
# Calibration data: historical or KBRA-scenario stress returns data = np.column_stack([rent_shocks, vacancy_shocks, cap_shocks, rate_shocks, opex_shocks]) controls = pv.FitControlsVinecop(family_set=pv.all, criterion='aic', tree_criterion='tau') vine = pv.Vinecop(data, controls=controls) scenarios = vine.simulate(n=10000, seeds=[42]) # Per-edge family selection (R-vine 10 bivariate copulas): # Rent-Vacancy: Clayton (lower-tail) # Cap-OpEx: Gumbel (upper-tail) # Rent-Cap: Student-t (symmetric) [Heading 3] B.2 Conformal Prediction Vault (DEBT 2) [Normal] import numpy as np from sklearn.ensemble import GradientBoostingRegressor
```

### Block 24
```text
def conformal_interval(new_x, cal_X, cal_y, base_model, alpha=0.10, data_age_days=0, lambda_tier=0.01): cal_pred = base_model.predict(cal_X) scores = np.abs(cal_y - cal_pred) # Decay factor (e^-lambda*t) — Tier-specific decay = np.exp(-lambda_tier * data_age_days) weighted_scores = scores * decay q_hat = np.quantile(weighted_scores, np.ceil((len(scores)+1)*(1-alpha))/len(scores)) point_pred = base_model.predict([new_x])[0] return (point_pred - q_hat, point_pred + q_hat) [Heading 3] B.3 THGNN Entity Resolution (DEBT 6 + Beyond the Rulebook #2) [Normal] from torch_geometric.nn import HGTConv # Heterogeneous graph nodes: Person, LLC, Address, Phone, Email # Edges: OWNS (Person->LLC, weight=pct), LOCATED_AT, CONTACTS_PHONE, GUARANTEES model = HGTConv(in_channels=node_dim, out_channels=embed_dim, num_types=5, num_relations=4) # Tasks: node classification (BeneficialOwner/ShellCompanyOperator/etc), # link prediction (hidden OWNS), anomaly detection (unusual topology) [Heading 3] B.4 Nelson-Siegel-Svensson + Hull-White (DEBT 4) [Normal] from scipy.optimize import minimize import numpy as np def nelson_siegel(tau, b0, b1, b2, lam): f1 = (1 - np.exp(-tau/lam)) / (tau/lam) f2 = f1 - np.exp(- ... [truncated]
```

### Block 25
```text
60+ source documents analyzed end-to-end 60+ documents / ~3MB / ~960 pages of PDF content + 1.5MB of MDs
```

### Block 26
```text
v3.0 ADDS (vs v2.0): - 8 architectural debts with institutional math fixes (R-vine, EVT, NSS, Kalman) - 5-dimensional distributional DSCR (P12, P36, lifetime, E[macro], CVaR) - Conformal Prediction Vault with e^-lambda*t decay - THGNN entity resolution for layered LLCs (HGT/TGN) - TabPFN-2.5 for zero-shot niche product underwriting - Cake Mortgage product matrix (DSCR v4.0, Bundt, Cup, Velvet, Pound) - 12 Non-QM wholesale gaps + complete vendor stack - Comprehensive SR 26-02 compliance status - Live market data March-June 2026 (CMBS 7.15%, fraud index 121)
```
