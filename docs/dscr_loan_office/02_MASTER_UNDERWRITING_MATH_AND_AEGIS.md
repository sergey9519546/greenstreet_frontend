# MASTER UNDERWRITING MATH & AEGIS DECISION LOGIC
*Consolidated Core Blueprint for DSCR Sovereign OS*

## 1. Dual-Track DSCR Math (The Non-Negotiable Core)
The system computes two entirely distinct DSCR tracks for every deal and never blends them.

**Track 1 — Lender Qualification:**
$$\text{Track1\_DSCR} = \frac{\text{Qualifying Gross Rent}}{\text{PITIA}}$$
- Qualifying rent = LOWER of (signed lease, 1007 appraisal market rent).
- If property is vacant, use 1007.
- If Interest-Only (IO) product, denominator = ITIA (no principal).
- 0% Vacancy Haircut by default for 1-4 unit long-term rentals (1007 already assumes market occupancy).

**Track 2 — Investor Survival:**
$$\text{Track2\_DSCR} = \frac{\text{Gross Rent} \times (1 - \text{Vacancy}) - \text{Management} - \text{Maintenance} - \text{CapEx}}{\text{PITIA}}$$
- Factors in 5-10% vacancy (market-specific for STR), 8-10% property management, maintenance reserves, utilities, and turnover.

**The Godmode Rule:** A deal can PASS Track 1 (e.g. 1.05x) and FAIL Track 2 (e.g. 0.88x / -$335/mo). The system forces mandatory user sign-off on negative cash flow before export.

---

## 2. Market Rate Pricing Anchors & FICO/LTV Adjustments

### Base Rate Anchor (2026 Market Baseline)
- **Primary Anchor**: 740+ FICO borrower at 75% LTV Purchase (SFR, 1.0+ DSCR) $= \mathbf{6.125\%}$ base rate.
- **Market Rate Bounds**: Practical 2026 floor is **6.00%**; ceiling is **10.75%+**.

### FICO & LTV Tier Constraints
- **740+ FICO**: Unlocks maximum LTV (up to 80%) and lowest rate tier (6.000%–6.250% for DSCR $\ge 1.25$).
- **700–739 FICO**: Standard rate tier, capped at 75% LTV max.
- **620–679 FICO**: Hard capped at 65–70% LTV max + 1.00% to 2.00% rate premium.

### Reserve Base & Escalation Thresholds
- **Standard File Base Reserve**: **6 Months PITIA** (3 months is a best-case floor, not starting base).
- **Loan Amount Escalations**:
  - Loan $> \$1,500,000 \implies$ **6 Months PITIA** minimum.
  - Loan $> \$2,500,000 \implies$ **12 Months PITIA** minimum.
- **Sub-1.00 DSCR Penalty**: DSCR $< 1.00 \implies$ **6 to 12 Months PITIA** required runway.

---

## 3. Deterministic Amortization & Golden Test Suite

### Amortization Factor Formula
$$f(r) = \frac{r(1+r)^{360}}{(1+r)^{360} - 1}, \quad \text{where } r = \frac{\text{Annual Interest Rate}}{12}$$
$$\text{Monthly P\&I Payment} = \text{Loan Amount} \times f(r)$$
$$\text{IO Payment} = \text{Loan Amount} \times \frac{\text{Annual Interest Rate}}{12}$$

### Golden Test Bench (Pinned Unit Tests)
- **Reference Deal**: Purchase Price $425,000 | 75% LTV | Loan $318,750 | Lease/1007 $3,000 | Tax $5,000/yr | Ins $2,000/yr | HOA $150/mo. Fixed Non-P&I = $733.34/mo.
1. **$318,750 Loan @ 7.00% (30-Yr Amortizing)**:
   - $f(7.00\%) = 0.0066530 \implies \text{P\&I} = \$2,120.64$
   - $\text{PITIA} = \$2,853.98 \implies \mathbf{\text{Track 1 DSCR} = 1.05x}$ (Passes 1.00x floor).
   - $\text{Track 2 DSCR (8\% vac, 8\% mgmt)} = 0.88x$ (-$334/mo negative carry).
   - Rent Break-Even ($\text{DSCR}=1.00$): $\$2,854/\text{mo}$ (-4.8% cushion).
   - Deal-Break Rate ($\text{DSCR}=1.00$): **7.67%** (+67 bps headroom).
2. **$318,750 Loan @ 8.25% (Stress Rate)**:
   - $f(8.25\%) = 0.0075127 \implies \text{P\&I} = \$2,394.67$
   - $\text{PITIA} = \$3,128.01 \implies \mathbf{\text{Track 1 DSCR} = 0.96x}$ (Sub-1.0x Flex Program Required).
3. **$318,750 Loan @ 7.00% (Interest-Only)**:
   - $\text{IO Payment} = \$1,859.38 \implies \text{ITIA} = \$2,592.72 \implies \mathbf{\text{Track 1 DSCR} = 1.157x}$.

---

## 4. Newton-Raphson Iterative Rate-DSCR Solver
Solves circular dependency between Rate $\rightarrow$ P&I $\rightarrow$ PITIA $\rightarrow$ DSCR $\rightarrow$ Pricing LLPA Tier:
```python
# Damped Fixed-Point Iteration
new_rate = 0.50 * old_rate + 0.50 * repriced_rate
```
Iterates until rate and tier converge (typically 2-3 iterations) to find exact breakeven rates for target DSCR tiers (1.00x, 1.10x, 1.25x).

---

## 5. After-Tax Engine (B′) & Financial Returns

### Property Tax Reassessment Reset
$$\text{Reassessed Tax} = \text{Purchase Price} \times \text{Effective Mill Rate}(\text{State, County})$$
PITIA uses `reassessed_tax`, NOT seller's historical bill (CA Prop 13, TX ~2-3% market value, FL, NJ, NY, IL).

### OBBBA 100% Bonus Depreciation & Cost Segregation
- 27.5-year straight line on residential building structure (excluding 10-25% land allocation).
- OBBBA permanently restored 100% bonus depreciation post-Jan 19, 2025. Cost seg reclassifies 20-40% into 5/7/15-yr components for immediate 100% deduction.
- **Tax Recapture & Stacking**: $\S1250$ max 25% federal; NIIT 3.8% stacks for MAGI $> \$200\text{k}$ Single / $\$250\text{k}$ MFJ $\implies$ Combined top recapture rate = **28.8%**.

---

## 6. Non-QM Alternative Income Calculations

### Bank Statement Income (12/24 Month)
- Business Accounts: 50% default expense factor (or 10-40% via CPA letter).
- Personal Accounts: 100% qualifying deposits used (2 mo business statements required to confirm separation).
- NSF/Overdraft Threshold: LTV $\ge 80\% \implies$ max 12 NSFs in 12 mo, max 3 in 3 mo.

### Asset Utilization & Crypto Formulas
$$\text{Monthly Income (Standard)} = \frac{\text{Net Qualified Liquid Assets}}{60}$$
$$\text{Monthly Income (Crypto - BTC/ETH Only)} = \frac{\text{Crypto Value} \times 50\%}{84}$$
*(50% haircut on crypto market value, amortized over 84 months).*

### 1099 Only Income
$$\text{Qualifying Income} = 1099 \text{ Gross Income} \times 90\% \quad (10\% \text{ expense factor})$$

---

## 7. STR 5-Point Legality Gate & AirDNA Haircut
Executes BEFORE financial modeling:
1. Municipal/County Permit Status (Open, Capped, Closed).
2. Minimum Stay Restrictions (30-day min kills STR).
3. Owner-Occupancy Mandates.
4. HOA CC&R Rental Restrictions.
5. Enforcement Intensity.
* **AirDNA Haircut**: AirDNA projected gross rent is subjected to a mandatory 20% haircut (factor 0.80) and capped by Form 1007 long-term market rent.

---

## 8. Monte Carlo Risk Engine (t-Copula)
- **10,000 Iteration Stochastic Engine**: Simulates correlated rent YoY, vacancy, insurance inflation, and exit cap rates.
- **Copula Dependency**: Mandates **t-copula (5-7 degrees of freedom)** or Clayton copula to accurately capture joint tail-risk shocks (explicitly forbids Gaussian copula).
- **5-9 Unit Commercial Multifamily**: Requires $\text{DSCR} \ge 1.00$ AND $\text{Debt Yield} = \frac{\text{NOI}}{\text{Loan Amount}} \ge 9\%$.

---

## 9. AEGIS Underwriting Hacks
1. If DSCR < 1.20x: Recommend Interest-Only (I/O) to lower debt service.
2. If LTV > 75%: Recommend 1.0 point rate buydown.
3. If High-Risk Insurance Zone (FL, CA coastal/wildfire, TX Gulf): Require bindable insurance quote before proceeding (unconfirmed = hard stop PASS).
