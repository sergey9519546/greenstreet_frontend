# Unique Content Review

- Source path: output/tournament_text.txt
- Archived path: 99_attachments/generated_archive_2026-06-28/p1_generated_stale_2026-06-28/output/tournament_text.txt
- Replacement path: docs/research/operational/DSCR_Blueprint_Verification_Corrections_Log.md
- Coverage decision: HIGH_RISK_RESTORE_OR_EXTRACT
- Block coverage: 0
- Unique words: 2168
- Preliminary classification: GENERATED_ARTIFACT_RETAIN_ARCHIVE
- Review copy: 00_MOCs\reconciliation_unique_review_2026-06-28\restored_for_review\output\tournament_text.txt

## Unique Headings
- None found by heading comparison.

## First Unique Blocks

### Block 1
```text
--- type: research slice: 1 status: drafted confidence: 3 title: Tournament Text summary: DSCR Algorithm Innovation Tournament Final Synthesis Report — 8-Layer Hybrid Architecture entities: - concept/arm - concept/dscr - concept/itia - concept/ltv - concept/pitia - data/cotality - data/fred - data/trepp - math/copula - math/t-copula - math/vine-copula - ml/conformal - slice/1 - slice/2 - tax/niit - tax/pal - topic/multifamily - topic/str tags: - topic/after-tax - topic/architecture - topic/cecl - topic/compliance - topic/default-rate - topic/flood-insurance - topic/insurance - topic/lgd - topic/monte-carlo - topic/portfolio - topic/stress-test - topic/tax - topic/tournament - topic/yield-curve - type/audit source: output/tournament_text.txt vaulted_at: 2026-06-20 --- DSCR Algorithm Innovation Tournament Final Synthesis Report — 8-Layer Hybrid Architecture Date: 2026-06-19 | Workspace: DSCR_LOAN OFFICE Method: Deep-research-10x + adversarial benchmarking Scope: 5 competing architectures, 6 evaluation criteria, 10 adversarial attacks, hybrid synthesis Source corpus: 60+ documents, 132 Slice 1 tests, 94.37% coverage, 100/100 quality gate §0. Why a tournament The current Slice 1 engine ... [truncated]
```

### Block 2
```text
5-dim output vector: x1 = P(DSCR_t < 1.0 | t = 12 months) # near-term breach x2 = P(DSCR_t < 1.0 | t = 36 months) # medium-term breach x3 = P(min DSCR over [0,T] < 1.0) # lifetime breach x4 = E[DSCR | macro recession scenario] # macro-conditioned x5 = CVaR_a(DSCR loss | 95th-pctile macro) # tail conditional Pseudocode: def distributional_dscr(deal, n_paths=10_000, seed=42): rng = np.random.default_rng(seed) rent = rng.lognormal(mean=0.0, sigma=0.095, size=(n_paths, 36)) vacancy = rng.beta(2, 22, size=(n_paths, 36)) rate_path = simulate_nss_hull_white(n_paths, 36) opex = rng.lognormal(mean=0.03, sigma=0.05, size=(n_paths, 36))
```

### Block 3
```text
pmt = payment_factor(deal.rate_orig, deal.term_months) * deal.loan_amount dscr_paths = np.zeros((n_paths, 36)) for t in range(36): rate_t = rate_path[:, t] if t >= deal.arm_reset_month: pmt_t = payment_factor(rate_t + deal.margin, deal.remaining_term) * deal.loan_balance(t) else: pmt_t = pmt pitia_t = pmt_t + deal.tax_monthly + deal.ins_monthly + deal.hoa_monthly noi_t = rent[:, t] * (1 - vacancy[:, t]) * 12 - opex[:, t] * 12 dscr_paths[:, t] = noi_t / pitia_t
```

### Block 4
```text
return { 'p12': np.mean(np.min(dscr_paths[:, :12], axis=1) < 1.0), 'p36': np.mean(np.min(dscr_paths[:, :36], axis=1) < 1.0), 'lifetime': np.mean(np.min(dscr_paths, axis=1) < 1.0), 'E_macro': np.mean(dscr_paths[:, 12]), 'CVaR_95': np.mean(np.min(dscr_paths, axis=1) [np.argsort(np.min(dscr_paths, axis=1))[:int(0.05*n_paths)]]) } Strengths: Builds directly on Slice 1 (132 tests still pass); SR 26-02 friendly; computational cost O(n_paths * T). Weaknesses: Still uses marginal distributions + Gaussian/t-copula. Doesn't solve attacks #2 and #5. SR 26-02 status: Monte Carlo step requires model card. B. R-Vine Copula + Conformal + CECL The 'fix all 8 debts' architecture. Mixed-family copulas, conformal prediction intervals, and FASB ASC 326 credit loss modeling. Mathematical definition: For each pair (X_i, X_j) of stress variables, select copula family: C_ij in {Gaussian, Student-t(nu), Clayton(theta), Gumbel(theta), Frank(theta)}
```

### Block 5
```text
Selection rule: - Rent <-> Vacancy: Clayton (lower-tail dependence) - Cap <-> OpEx: Gumbel (upper-tail dependence) - Rent <-> Cap: Student-t(nu=5) (symmetric) - Rate <-> Cap: Student-t(nu=7)
```

### Block 6
```text
R-vine structure: maximum spanning tree on |Kendall's tau| (TUM Munich pyvinecopulib, C++ backend)
```

### Block 7
```text
Conformal prediction (Vovk et al. 2005): R_i = |y_i - M(x_i)| # nonconformity scores q_hat = Q_{ceil((n+1)(1-a)/n)}(R) Interval: y_hat +/- q_hat Coverage guarantee: P(Y_new in interval) >= 1-a for ANY distribution
```

### Block 8
```text
Mondrian (group-conditional) conformal per ZIP-tier g: lambda_1 = 0.0027 (1-year half-life, county tax) lambda_3 = 0.023 (30-day half-life, borrower-stated)
```

### Block 9
```text
CECL expected credit loss (FASB ASC 326): EL = PD(t) * LGD * EAD(t) PD curves segmented by vintage x FICO x LTV x property_type x geo_cluster LGD = 1 - (LTV_at_default * haircut_factor) EAD(t) = loan_balance(t) * (1 - prepayment_assumption(t)) Pseudocode: import pyvinecopulib as pv
```

### Block 10
```text
def r_vine_copula_engine(deal, macro_scenario, n_sims=10_000): data = np.column_stack([rent_shocks, vacancy_shocks, cap_shocks, rate_shocks, opex_shocks]) controls = pv.FitControlsVinecop( family_set=[pv.gaussian, pv.student, pv.clayton, pv.gumbel, pv.frank], criterion='aic', tree_criterion='tau' ) vine = pv.Vinecop(data, controls=controls) scenarios = vine.simulate(n=n_sims, seeds=[42])
```

### Block 11
```text
rent_interval = conformal_interval( new_x=deal.rent_input, cal_X=historical_rent_X, cal_y=historical_rent_y, base_model=rent_model, alpha=0.10, data_age_days=deal.rent_data_age, lambda_tier=0.023 if deal.rent_source=='borrower_stated' else 0.0027 )
```

### Block 12
```text
dscr_dist = apply_scenarios(deal, scenarios, rent_interval) pd_curve = pd_curves[deal.vintage, deal.fico_bucket, deal.ltv_bucket, deal.property_type, deal.geo_cluster] el = np.trapz(pd_curve(t) * lgd * ead(t) for t in range(deal.term_months))
```

### Block 13
```text
return { 'p12': breach_probability(dscr_dist, 12), 'p36': breach_probability(dscr_dist, 36), 'lifetime': lifetime_breach(dscr_dist), 'expected_loss': el, 'conformal_interval': rent_interval, 'vine_structure': vine.structure } Strengths: Best stress robustness among competitors. Conformal gives distribution-free coverage. CECL is regulatory-aligned. Weaknesses: Data-hungry; pyvinecopulib C++ dependency. SR 26-02: All three components are models, requires three model cards. C. Spatio-Temporal Graph Neural Network Portfolio-level contagion model using Heterogeneous Graph Transformer (HGT) or Temporal Graph Network (TGN) over sponsor x property x ZIP x MSA x lender. Mathematical definition: Graph G = (V, E, tau) where V = node types, E = edge types, tau = timestamps
```

### Block 14
```text
Node types (5): v_Person, v_LLC, v_Address, v_Phone, v_Email Edge types (4): e_OWNS, e_LOCATED_AT, e_CONTACTS_PHONE, e_GUARANTEES
```

### Block 15
```text
HGT message passing: h_v^{(l+1)} = Aggregate_{u in N(v)} Attention(h_u^{(l)}, e_uv, tau) * W_message
```

### Block 16
```text
Inference tasks: 1. Node classification: BeneficialOwner / ShellOperator / FirstTimeInvestor / HighRisk 2. Link prediction: identify hidden OWNS edges 3. Anomaly detection: one person owning 50 LLCs across states Pseudocode: from torch_geometric.nn import HGTConv
```

### Block 17
```text
class DSCRPortfolioGNN(torch.nn.Module): def __init__(self, node_dims, edge_dims, hidden=256, heads=8): super().__init__() self.hgt1 = HGTConv(node_dims, hidden, num_types=5, num_relations=4, heads=heads) self.hgt2 = HGTConv(hidden, hidden, num_types=5, num_relations=4, heads=heads) self.classifier = torch.nn.Linear(hidden, 4)
```

### Block 18
```text
def forward(self, data): x = data.x_dict for hgt in [self.hgt1, self.hgt2]: x = {k: F.elu(hgt(x, data.edge_index_dict, data.edge_attr_dict)[k]) for k in x.keys()} return {k: self.classifier(v) for k, v in x.items()} Strengths: Directly attacks portfolio context (Attack #5). Catches sponsor concentration. Weaknesses: SR 26-02 hostile (black-box). Cold-start problem. SR 26-02: Full model with extensive model card. D. Regime-Switching Markov Model Hamilton (1989) filter. Four hidden macro regimes: Stable / Cyclical / Stress / Recovery. Each regime has its own parameter set for the joint distribution. Mathematical definition: State space S = {Stable, Cyclical, Stress, Recovery}
```

### Block 19
```text
Transition matrix P: Stable Cyclical Stress Recovery Stable [ 0.92 0.06 0.01 0.01 ] Cyclical [ 0.05 0.85 0.08 0.02 ] Stress [ 0.02 0.10 0.75 0.13 ] Recovery [ 0.10 0.05 0.05 0.80 ]
```

### Block 20
```text
Observation model per state: Stable: mu = [2%, 6%, 0bp, 4%] sigma = small Cyclical: mu = [0%, 8%, 50bp, 6%] sigma = medium Stress: mu = [-3%, 12%, 200bp, 10%] sigma = large Recovery: mu = [1%, 10%, 75bp, 5%] sigma = medium
```

### Block 21
```text
Hamilton filter: xi_{t|t} = P(s_t = i | observations_{1:t}) # filtered state prob xi_{t+1|t} = xi_{t|t} * P # predicted state prob
```

### Block 22
```text
DSCR conditional on regime: E[DSCR] = sum_i xi_{t|t} * E[DSCR | s_t = i] Strengths: Mathematically rigorous (Hamilton 1989 Econometrica). Captures transition probabilities. Weaknesses: Slow regime detection (~6 months). SR 26-02: Full model with model card. E. Distributionally Robust Optimization (DRO) + Wasserstein Ball Treat the stress test as a min-max problem over a Wasserstein ball of radius epsilon around the empirical distribution. Optimize for the worst-case. Mathematical definition: Empirical distribution: P_hat_n = (1/n) sum_{i=1}^n delta_{xi_i}
```

### Block 23
```text
Wasserstein ball of radius epsilon: B_epsilon(P_hat_n) = {P : W_p(P, P_hat_n) <= epsilon}
```

### Block 24
```text
Min-max objective: sup_{P in B_epsilon} E_P[L(decision, xi)]
```

### Block 25
```text
Closed-form (Mohajerin Esfahani & Kuhn 2018): sup_{P in B_epsilon} E_P[L] <= E_{P_hat_n}[L] + epsilon * Lip(L) * sqrt(2 ln(1/delta)/n)
```

### Block 26
```text
For DSCR approval: L(approve, xi) = expected loss if approve given stress realization xi approve iff sup_{P in B_epsilon} E_P[L(approve, xi)] <= threshold Pseudocode: import ot # POT library for optimal transport
```

### Block 27
```text
def wasserstein_dro_dscr(deal, empirical_scenarios, epsilon, delta=0.05): empirical_losses = np.array([ expected_loss(deal, scenario) for scenario in empirical_scenarios ]) baseline_el = np.mean(empirical_losses)
```

### Block 28
```text
loss_gradients = compute_loss_gradients(deal, empirical_scenarios) lipschitz = np.max(np.linalg.norm(loss_gradients, axis=1))
```

### Block 29
```text
n = len(empirical_scenarios) wasserstein_penalty = (epsilon * lipschitz * np.sqrt(2 * np.log(1/delta) / n))
```

### Block 30
```text
robust_el = baseline_el + wasserstein_penalty
```
