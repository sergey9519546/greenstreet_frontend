# DSCR Sovereign OS: Upgrade Intelligence Report

## Complete updated architecture, algorithm, and research roadmap

**Classification:** Sovereign OS  
**Executed:** June 18, 2026  
**Scope:** Full update with newly verified papers, corrected citations, architectural refinements, and revised research queue

## Executive summary

The DSCR Sovereign OS should be upgraded around a simple principle: deterministic underwriting math remains the production spine, while advanced forecasting, calibrated uncertainty, and agentic orchestration sit on top as controlled augmentations rather than replacements.[cite:491][cite:485][cite:478] The strongest near-term upgrades are calibrated conformal uncertainty, faster and better-calibrated tabular approval models, zero-shot time-series forecasting for sparse markets, and multi-horizon rent forecasting for dense markets.[cite:491][cite:468][cite:479][cite:467]

The biggest corrections from earlier drafts are now clear. CPTC is real and production-relevant, but it is not a plug-in substitute for ordinary split conformal because it depends on an explicit state model.[cite:491][cite:503] TimesFM is real and strategically important, but the current generation should be described as a foundation forecaster with strong zero-shot capability rather than as a fully multivariate market engine.[cite:493][cite:485] iTransformer is real and important for high-dimensional rent panels, but its innovation is inverted attention over variates, not the absence of positional encoding.[cite:494][cite:497]

Some previously asserted claims should be downgraded. Publicly accessible evidence supports the existence and relevance of TabPFN-style tabular foundation models, but the exact “TabPFN-2.5, 50K rows, 2K features, NeurIPS 2025 D&B track” framing remains insufficiently verified from accessible primary records and should remain in the research queue until the actual paper and benchmark record are in hand.[cite:445] Earlier references to a specific May 2026 LightGBM/XGBoost/CatBoost backtest and a “Nature 2026” credit-risk paper should also be normalized to precise, verifiable sources before they are treated as settled facts.[cite:451][cite:457]

The durable moat remains unchanged. The winning architecture is proprietary deal outcome data, proprietary rent panels, conformal uncertainty, audit-grade evidence provenance, institutional validation protocol, and a compute stack that separates deterministic numerical engines from LLM-generated narrative and workflow support.[cite:449][cite:478][cite:487] That stack is much harder to copy than any individual model family.[cite:446][cite:478]

## Canonical architecture

The production system should remain a five-layer architecture.

1. **Deterministic deal engine** for DSCR, reserves, LTV/FICO gates, ARM schedules, prepay logic, after-tax IRR, and lender AEY comparison, implemented in Python with auditable functions rather than model inference.[cite:478]
2. **Forecasting layer** for rent, occupancy, and market trend projections using TFT, TimesFM, and challenger models only where they add measurable value.[cite:467][cite:479][cite:494]
3. **Uncertainty layer** using split conformal by default and CPTC only in explicitly regime-modeled submarkets.[cite:491][cite:468]
4. **Decision intelligence layer** using calibrated tabular ML for approval probability, lender fit, anomaly detection, and portfolio pattern recognition.[cite:451][cite:457]
5. **Narrative and workflow layer** using Claude-style agents or similar systems to explain outputs, draft IC memos, classify tasks, and coordinate research, while never performing the core mathematics.[cite:478][cite:480][cite:449]

This architecture matches what public financial-services AI deployments are converging toward: one data spine, one model registry, one scenario engine, one evidence trail, and one reviewable human-in-the-loop interface.[cite:478][cite:480] The practical implication is that the Sovereign OS should not chase end-to-end “AI underwriting.” It should enforce exact numerical truth at the core and only allow statistical or generative methods where the gain is measurable and governed.[cite:449][cite:478]

## Upgrade tier 1

### Calibrated uncertainty as the category-defining upgrade

The highest-value upgrade is not a new predictor but calibrated uncertainty. Standard conformal prediction already provides a distribution-free way to wrap forecasting models with valid coverage guarantees, and Nixtla documents production patterns for applying conformal intervals to forecasting outputs.[cite:468] CPTC extends this idea to time series with change points by integrating state prediction and online conformal methods, and the paper shows improved validity and adaptivity in non-stationary settings.[cite:491][cite:503]

For DSCR operations, the correct deployment pattern is two-layered. Use ordinary split conformal or hierarchical conformal calibration for most submarkets because it is simpler and operationally robust.[cite:468] Reserve CPTC for markets where a discrete state model is justified, such as wildfire-sensitive California submarkets, hurricane-exposed Florida submarkets, or heavily regulated rent-control regimes, because CPTC assumes a state representation rather than functioning as a universal drop-in wrapper.[cite:491][cite:503]

This means every major output should become interval-aware rather than point-only. Examples include projected rent, projected DSCR, projected break-even occupancy, approval probability, and possibly even forward refinance feasibility under a future rate surface.[cite:468][cite:491] The underwriting narrative gain is enormous because the system can now say not only what the deal most likely does, but what range of outcomes remains plausibly safe.[cite:468]

### Approval predictor upgrade: XGBoost plus LightGBM, then calibration

The practical tabular stack should remain gradient-boosted trees first. Public comparisons consistently show XGBoost and LightGBM as the dominant general-purpose baselines for structured financial data, while CatBoost can be useful where categorical handling is central but does not universally dominate.[cite:451] The strategic choice is therefore not “replace XGBoost,” but “ensemble XGBoost and LightGBM, then calibrate the probabilities.”[cite:451]

LightGBM’s architectural speed advantages come from Gradient-based One-Side Sampling and Exclusive Feature Bundling, which is why it frequently trains materially faster than XGBoost in large structured datasets.[cite:451] In the Sovereign stack, that speed matters because a faster model can be retrained nightly or weekly as new lender outcomes arrive, while a slower model often remains stale.[cite:451] The right operational pattern is a soft-voting or stacked ensemble followed by isotonic or Platt-style calibration, because raw probability outputs from boosted trees are often miscalibrated even when rank-ordering is strong.[cite:451]

CatBoost remains relevant as a challenger specifically for high-cardinality or awkward categorical regimes such as vesting type, entity structure, state PPP category, occupancy class, and STR legality buckets.[cite:451] But unless internal experiments prove otherwise, CatBoost should remain a challenger or feature-generator rather than the production champion.[cite:451]

### Temporal leakage firewall and promotion gates

No forecasting or approval model should ever be promoted without temporal leakage controls and explicit promotion gates. The engine should split training, validation, and testing by decision date and origination vintage rather than random row-level splits, because any leakage from post-decision information will create fictitious performance.[cite:468] The correct benchmark pack includes discrimination metrics, calibration metrics, drift metrics, and replay tests across stressed periods.[cite:471][cite:474]

A production promotion gate should require at least the following: ROC-AUC or PR-AUC for ranking, Brier score and Expected Calibration Error for probability quality, coverage error for interval methods, and crisis replay performance for 2020 and the 2022–2024 rate shock period.[cite:471][cite:474] This governance layer is not optional. It is one of the real moats because many AI-lending systems appear accurate only because they were not validated against real chronology.[cite:449]

## Upgrade tier 2

### TimesFM for sparse markets

TimesFM is a real and strategically important foundation model for time-series forecasting. Google introduced it as a decoder-only foundation model for zero-shot forecasting, originally emphasizing a corpus of 100 billion real-world time points for the first generation.[cite:479][cite:511] By late 2025, Google described the newer TimesFM line as trained on more than 400 billion real-world time points and made it available across BigQuery and AlloyDB, extending its practical relevance for production systems that already sit on Google Cloud.[cite:493]

The correct way to position TimesFM inside Sovereign OS is as the sparse-market forecaster. It is excellent when the engine lacks enough local training data to support a custom model, and BigQuery’s TimesFM integration lowers operational overhead because forecasts can be executed without bespoke model serving infrastructure.[cite:485][cite:493] That makes it especially attractive for rural markets, emerging STR corridors, or thin ZIP-code slices where there are not enough local observations to justify a dense supervised model.[cite:485]

Two important caveats must stay in the design. First, TimesFM should not be treated as a truly multivariate submarket network model; BigQuery documentation describes XReg support as exogenous regressor correction rather than native multivariate correlation modeling.[cite:485] Second, its native quantile outputs should still be wrapped or audited with conformal methods because calibration of foundation-model uncertainty remains an active problem, and zero-shot sharpness does not imply trustworthy interval coverage.[cite:465][cite:468]

### TFT for dense markets

Temporal Fusion Transformer remains the most practical high-end architecture for multi-horizon rent forecasting in dense markets. Nixtla’s implementation and related tutorials show why it is valuable: TFT handles static features, known future covariates, unknown future series, and quantile outputs in a single architecture.[cite:467] This matters directly for DSCR underwriting because rent and occupancy are not just next-step predictions. The engine needs structured 6-, 12-, and 24-month forward distributions with seasonality, macro covariates, and local panel effects.[cite:467][cite:473]

TFT’s real advantage is not just accuracy but interpretability. Variable selection networks and attention mechanisms make it easier to explain whether seasonality, macro rates, local trend, or property class are driving a forecast, which is essential in a lender or IC setting.[cite:467][cite:473] In practice, TFT should be trained on sufficiently dense zip-, tract-, or MSA-level rent panels and treated as the champion model whenever the local history is long enough and comp density is high enough.[cite:467]

The recommended decision boundary is straightforward. Use TFT when the market has enough rent history and panel breadth to support training; use TimesFM when the market is too sparse; use a simpler baseline plus conformal intervals when both are under-supported.[cite:467][cite:485] This creates a rational forecasting ladder instead of one model forced into every regime.[cite:479][cite:468]

### TimesFM vs Moirai vs Chronos benchmark

The open research queue should add a formal benchmark between TimesFM, Moirai-class models, and Chronos-class models before any permanent foundation-model decision is made.[cite:493] The architectural reason is that TimesFM remains strongest as a zero-shot univariate forecaster with exogenous support, while alternative model families may better express cross-series or panel-level dependence in adjacent markets.[cite:485][cite:493]

The benchmark should use at least three to five MSA rent panels with varying density and regulatory structure, and evaluate not only point accuracy but interval calibration, regime sensitivity, computational cost, and ease of deployment.[cite:468][cite:493] That benchmark is more important than paper prestige because the choice should be driven by DSCR-specific panel behavior rather than general leaderboard performance.[cite:493]

## Upgrade tier 3

### iTransformer for high-dimensional panel forecasting

iTransformer is now a confirmed and relevant research candidate. The paper introduces an “inverted” Transformer for time-series forecasting in which attention and feed-forward operations are applied over variates rather than over the time dimension, allowing the architecture to capture multivariate correlations more directly.[cite:494][cite:497] This is especially relevant when the Sovereign engine evolves from single-property forecasting toward large cross-property or cross-submarket rent panels.[cite:497]

The important correction is conceptual. iTransformer does not become valuable because it deletes positional encoding; it becomes valuable because it changes the axis along which attention is paid.[cite:494][cite:497] In a DSCR context, that means it may better detect that shocks in one ZIP or submarket propagate to adjacent ZIPs, sister neighborhoods, or correlated product types, which a purely time-axis model may miss.[cite:497]

This does not make iTransformer the immediate champion. It belongs in the challenger lab as a high-dimensional panel model to benchmark against TFT and foundation-model alternatives, especially once the evidence vault contains enough panel history across regions.[cite:494][cite:497]

### Spatio-temporal graph risk

A graph layer remains one of the highest-value frontier upgrades even though the current evidence for the exact implementation is architectural rather than vendor-specific. The underwriting world increasingly needs models that understand contagion and clustering across sponsors, lenders, markets, and assets.[cite:480] A graph-based layer can represent property-to-property similarity, sponsor-to-sponsor exposure, lender overlays, and MSA adjacency in a way that tabular models cannot.[cite:480]

The recommended deployment path is not an opaque end-to-end graph model replacing the champion stack. Instead, use graph embeddings or graph-derived risk features as structured inputs into the calibrated tabular champion.[cite:480] That preserves interpretability while adding network sensitivity, which is particularly important for insurance shocks, municipal regulatory change, and clustered STR policy risk.[cite:480]

### Tail-dependence engines beyond t-copula

The t-copula remains a production-worthy starting point for joint stress simulation, but it should not be treated as the last word on tail risk. The research sandbox should explore richer dependence structures such as vine copulas, EVT-enhanced tail overlays, and possibly normalizing-flow approaches when enough crisis data is available.[cite:501] The right promotion rule is empirical: only promote a challenger if it outperforms the production t-copula on historical stress replay, coverage of tail events, and expected shortfall quality.[cite:501]

That keeps the production engine disciplined. The system can still innovate aggressively without allowing elegant research models to outrun evidence.[cite:501]

## Competitive intelligence

### Profet.ai

Profet.ai remains the closest visible commercial analog on the appraisal and rental-valuation side rather than the full Sovereign stack. Public product material indicates support for lender workflows, rental intelligence, and review automation around property valuation and underwriting documentation.[cite:481][cite:484] That means Profet is best understood as a potential integration point or a competitor in a narrow slice, not as a full replacement for a DSCR decision OS.[cite:481][cite:484]

The strategic implication is to avoid rebuilding commodity appraisal-review computer vision if vendor integrations can provide it faster. The Sovereign OS moat is not generic appraisal automation; it is decision quality, calibrated uncertainty, lender fit, auditability, and the combination of tax, risk, and market intelligence in one governed stack.[cite:481][cite:484]

### Claude financial workflows and agent layer

Anthropic has publicly positioned Claude for financial services as a suite of workflows, integrations, and agent-style capabilities for analysis, due diligence, reporting, and operational tasks.[cite:478] Public reporting also indicates ongoing improvement in more complex financial research tasks.[cite:480] The right interpretation for Sovereign OS is narrow and disciplined: LLMs are excellent for drafting explanations, summarizing deal logic, creating meeting prep, synthesizing filings, and managing workflow context; they are not the computation layer.[cite:478][cite:480]

This distinction is reinforced by practitioner commentary in public finance-tool discussions: the dominant failure mode in financial LLM systems is not lack of eloquence but hallucinated or weakly grounded outputs.[cite:449] Therefore the LLM layer should consume already-computed JSON outputs from the deterministic engine and generate prose, QA checklists, borrower explanations, and IC memo language under human review.[cite:449][cite:478]

### Document intelligence vendors

Commercial lending AI platforms increasingly compete on document intelligence, policy automation, and audit trails.[cite:487] The relevant lesson is architectural rather than vendor-specific: the Sovereign evidence vault should attach extracted values to page-level evidence and preserve provenance through every approval, override, and memo statement.[cite:487] If a vendor is used for extraction, the extraction layer should be replaceable and subordinate to the evidence schema rather than embedded as a black box in the core system.[cite:487]

## Verified papers and primary sources

The following papers and primary technical sources should now be treated as canonical anchors for the roadmap.

| Topic | Primary source | Why it matters |
|---|---|---|
| CPTC | *Conformal Prediction for Time-series Forecasting with Change Points* (arXiv 2509.02844; NeurIPS 2025)[cite:491][cite:503] | Regime-aware conformal intervals for non-stationary markets |
| Baseline conformal for time series | *Conformal prediction for time series* (arXiv 2010.09107)[cite:508] | Foundational interval method baseline |
| Feature-fitted online conformal | *Feature Fitted Online Conformal Prediction for Deep Time Series* (arXiv 2505.08158)[cite:504] | Lightweight adaptive uncertainty wrapper |
| TimesFM | *A decoder-only foundation model for time-series forecasting* (arXiv 2310.10688)[cite:511] | Zero-shot sparse-market forecasting |
| TimesFM product/docs | Google Research blog and BigQuery documentation[cite:479][cite:485][cite:493] | Production deployment pathway |
| TFT implementation | Nixtla TFT documentation[cite:467] | Multi-horizon dense-market forecasting |
| iTransformer | *iTransformer: Inverted Transformers Are Effective for Time Series Forecasting* (arXiv 2310.06625; ICLR 2024)[cite:494][cite:497] | High-dimensional panel forecasting challenger |
| Tabular GBDT baseline | LightGBM/XGBoost/CatBoost comparison sources[cite:451] | Approval-model production baseline |
| Financial-service agent workflows | Anthropic finance workflows / reporting[cite:478][cite:480] | Narrative and workflow layer |

## Claims that must be normalized or downgraded

Several claims from earlier drafts should not remain in canonical materials without stronger source support.

- The exact public framing of **TabPFN-2.5** as a 50K-row, 2K-feature, benchmark-leading model remains insufficiently verified from accessible primary sources and should stay in the research queue rather than in the settled architecture.[cite:445]
- The specific **May 2026 backtest** claiming XGBoost and LightGBM were neck-and-neck, CatBoost underperformed, and a two-layer MLP won on return metrics was not confirmed from robust public primary records and should be replaced with general, source-backed statements about structured-data model trade-offs.[cite:451]
- The earlier **“Nature 2026”** label for the hybrid attention-LightGBM credit-risk paper should be replaced by its actual journal/source before it is cited as canonical.[cite:457]
- Public claims around exact performance percentages for finance-agent benchmarks or exact institutional deployment details should be marked as vendor or analyst intelligence unless linked to the benchmark owner or vendor primary announcement.[cite:478][cite:480]

## Research queue

### Immediate queue

1. Build and validate a split-conformal layer on rent, DSCR, and approval probability outputs, then test CPTC only in explicit regime markets.[cite:468][cite:491]
2. Benchmark XGBoost, LightGBM, CatBoost, and calibrated ensembles on real lender outcome data with chronological splits.[cite:451]
3. Deploy TimesFM in sparse-market forecasting pilots through BigQuery or direct model serving and compare with naive and statistical baselines.[cite:485][cite:493]
4. Train TFT on dense-market rent panels and measure improvement against static comp-driven underwriting.[cite:467]
5. Run a three-way benchmark across TimesFM, Moirai-class, and Chronos-class models on multi-MSA rent panels with calibration scoring.[cite:493]

### Medium-term queue

6. Benchmark iTransformer against TFT and foundation-model challengers for cross-market rent panels.[cite:494][cite:497]
7. Build graph-derived lender, sponsor, and market contagion features and feed them into the calibrated tabular champion.[cite:480]
8. Prototype richer tail-dependence engines and promote only when crisis replay improves materially over the t-copula baseline.[cite:501]
9. Normalize all vendor claims into evidence tiers: primary-source verified, credible secondary, market intelligence, and unverified.[cite:487][cite:478]
10. Keep TabPFN-style tabular foundation models in the challenger lab until precise version claims and benchmarks are independently verified.[cite:445]

## Operating doctrine

The upgraded Sovereign OS should adopt five permanent rules.

- **Numerical truth is deterministic.** Any number that changes a credit decision must come from explicit code or a governed statistical model, never from free-form LLM reasoning.[cite:449][cite:478]
- **Every prediction must carry uncertainty.** Point estimates without calibrated ranges are not institutional-grade underwriting artifacts.[cite:468][cite:491]
- **Every model must be time-aware.** No random train-test splits for lending, market forecasting, or approval prediction.[cite:471][cite:474]
- **Every extracted fact must preserve provenance.** The evidence vault is not a storage layer; it is the legal memory of the system.[cite:487]
- **Every frontier model starts as a challenger.** Promotion requires empirical superiority under chronology, stress replay, and calibration tests, not novelty.[cite:474][cite:501]

## Conclusion

The DSCR Sovereign OS should now be understood as an institutional decision operating system, not a mortgage calculator and not a generic AI underwriting bot.[cite:478][cite:480] Its strongest defensible upgrades are now clear: conformal uncertainty as a first-class feature, a calibrated tabular champion for lender-fit prediction, TimesFM for sparse-market forecasting, TFT for dense-market forward rent curves, and a governed LLM layer used only for explanation and workflow.[cite:491][cite:485][cite:467][cite:478]

The moat does not come from any one paper. It comes from how the stack combines proprietary deal outcomes, rent panels, calibrated uncertainty, evidence provenance, and temporal governance into a single operational system that improves with every deal while remaining auditable.[cite:446][cite:487][cite:491] That is the correct upgrade path, and it is now better grounded in primary literature and verified product evidence than earlier drafts were.[cite:491][cite:493][cite:497]
