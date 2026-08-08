# MASTER LENDER INTELLIGENCE & COMPLIANCE
*Consolidated Core Blueprint for DSCR Sovereign OS*

## 1. State Prepayment Penalty (PPP) Statutory Branching Gate

### Branching Gate Logic
```
Branch 1: Business-Purpose + Entity-Vested (LLC/Corp) -> Consumer protection statutes exempt in most states -> PPP allowed per lender matrix.
Branch 2: Individual Vesting OR Consumer Purpose -> Enforce state statutory caps & indexed thresholds.
```

### State-Specific Statutory Overrides (2026 Benchmarks)
- **Minnesota (MN)**: HF 3437 (Enacted April 23, 2026, Effective Aug 1, 2026) restricts §58.137 to personal/family/household loans, confirming business-purpose DSCR is outside scope.
- **Ohio (OH)**: PPP permitted on 1-2 units only if loan $> \$116,356$ (2026 indexed threshold); **Penalty Base = ORIGINAL Principal** (ORC §1343.011), max 1%, max 5 years.
- **Pennsylvania (PA)**: Banned on 1-2 units below $\$329,411$ (2026 indexed threshold; §406 LIPL). Allowed above threshold or on 3-4 units.
- **New Jersey & Illinois**: Individuals barred; entities allowed (NJ splits LLC vs C/S-Corp; IL subject to APR tests).
- **Mississippi (MS)**: Declining structures only; banned $> 1$ year (Miss. Code §75-17-31 caps 5%/4%/3%/2%/1% for Years 1–5).
- **Arkansas (AR)**: Penalty base = **REMAINING Balance** ($\le 3/2/1\%$).
- **Washington (WA)**: Prohibits PPPs on ARM products (fixed-rate only).
- **Texas DSCR Overrides**: Article XVI Section 50(a)(6) restricts combined LTV to 80% max; no cash-out refi above 80% LTV; non-homestead affidavit required to prove business purpose.
- **PPP Legal Ban States**: NM, MN, AK ban PPPs on residential investment DSCR loans; auto-prices as No-PPP (+0.50–0.80% rate bump).

---

## 2. All-In Effective Yield (AEY) Solver & Two-Quote Rule

### AEY XIRR Equation
Calculates true dollar cost of capital over the borrower's exact hold period:
$$0 = \sum_{t=0}^{N} \frac{C_t}{(1 + \text{AEY})^{t/365}}$$
- $C_0 = +(\text{Loan Amount} - \text{Points} - \text{Lender/Broker Fees})$
- $C_{1 \dots N-1} = -(\text{Monthly Debt Service})$
- $C_N = -(\text{Monthly Debt Service} + \text{Remaining Balance}_N + \text{Prepayment Penalty}_N)$

### Two-Quote Rule
Every quote MUST present two options:
1. **Rate-Competitive Option**: Lowest AEY (e.g., Defy, CoreVest, Newrez).
2. **Flexible Option**: Maximum credit tolerance (e.g., Griffin Funding, Easy Street, Kiavi).

---

## 3. Rate vs. Prepayment Penalty (PPP) Economics & Buydown Solver

### Rate-vs-PPP Tradeoff Grid
- **5-Year PPP (5-4-3-2-1)**: Par Rate (Base anchor `6.125%` @ 740 FICO / 75% LTV).
- **3-Year PPP (3-2-1)**: +0.25% to +0.50% rate add (`6.375%–6.625%`).
- **1-Year PPP (1-0-0)**: +0.65% rate add.
- **No PPP (0-Year)**: +0.50% to +0.80% rate add (up to +1.00% at select lenders).

### Refi-Horizon Solver
Compare: `[High Rate with 0 PPP × Hold Months]` vs `[Low Rate with 3-Yr PPP × Hold Months + Exit Penalty % × Loan Balance]`.
*Example:* On a $300,000 loan held for 24 months, paying a 1% exit penalty ($3,000) on a 6.25% rate costs $40,500 total interest + penalty, whereas taking a 7.00% No-PPP rate costs $42,000 total interest. Taking the penalty is **$1,500 cheaper**.

### Discount Points Buydown Economics
- **Rule of Thumb**: 1.00 point (1% of loan amount) buys down interest rate by **~0.25%**.
- **Breakeven Formula**: $\text{Breakeven Months} = \frac{\text{Upfront Point Cost}}{\text{Monthly Interest Savings}}$.
*Example:* $300,000 loan at 7.875%. Paying 2 points ($6,000) lowers rate to 7.375% ($103/mo savings). Breakeven = $6,000 / $103 = **58 months (4.8 years)**. If hold horizon is >5 years, buy down points; if <5 years, do not.

---

## 4. National 10-Lender Wholesale Matrix

| Lender | Max LTV | Min FICO | Min DSCR | Reserve Rule | STR Policy | Prepay Penalty Stance | Key Niche / Overlay |
|---|---|---|---|---|---|---|---|
| **Kiavi** | 80% | 660 | 1.10 (1.00 flex) | 3-6 Mos | AirDNA accepted (110% 1007 rule) | 3-2-1 soft standard | Fast close (7-14d), SSN required (**No ITIN**) |
| **Lima One** | 80% (85% w/ res) | 660 | 0.75 | 3-6 Mos | AirDNA accepted | No-PPP option to 3/5/7-yr | Portfolio loans to $5M; strong rates 720+ FICO |
| **Visio** | 80% | 680 | 0.75 (Flex) | 3-6 Mos | Broad STR coverage (A-frames/cabins) | 5-4-3-2-1 base (+0.625% No-PPP) | **No vacancy haircut on Track 1**; $75K-$2M |
| **Griffin Funding** | 80% (Jumbo $4M) | 640 | 0.75 / No-Ratio | 3-12 Mos | Market rent; 400 sq ft condo min | ARMs no PPP; Fixed 0-5 yr | 50 states + DC; Sub-1.0 & No-Ratio specialist |
| **Easy Street** | 80% | 640 | No Minimum | 3-6 Mos | AirDNA (100% pro STR) | Flexible terms | AirBnBRRRR specialist; **Waives 12-mo STR refi seasoning** |
| **theLender (NONI)**| 80% | 620 | 0.99 (NearNONI) | 6 Mos | 3 STR methods (1007, AirDNA, STR analysis) | Flexible; fee-free options available | 3 STR income calculation pathways |
| **Angel Oak** | 85% | 620 | 1.00 | 6 Mos | Market rent; non-warrantable condos | 5-4-3-2-1 standard; No-PPP (+0.625%) | 85% LTV purchase; non-warrantable condos |
| **LendingOne** | 80% | 620 | 0.75 | 6 Mos | STR eligible | 3-5 yr declining stepdown | Broad nationwide footprint; 0.75 DSCR flex |
| **RCN Capital** | 80% | 660 | ~1.00 | 3-6 Mos | STR eligible | Delayed financing ok | BRRRR delayed financing specialist |
| **CoreVest** | 75-80% | 680 | ~1.00 | 3-6 Mos | STR eligible | Portfolio DSCR | 5-10 props under single portfolio loan |

---

## 5. Underwriting Deal Rescue Hierarchy (When DSCR < 1.00)
1. **Lever 1 (Interest-Only Switch)**: Flip term to 10-year IO. Cuts monthly P&I by 15–22%, boosting DSCR by +0.10–0.20. (Cheapest/fastest fix).
2. **Lever 2 (Rate Buydown via Seller Concessions)**: Negotiate 2% seller credit to buy down rate by 0.50%, lowering P&I.
3. **Lever 3 (Tax / Insurance Contestation)**: Re-shop hazard insurance quote (DP-3 fire policy required; HO-3 homeowner policy ineligible) or appeal property tax assessment.
4. **Lever 4 (Down Payment Top-Up)**: Increase down payment to reach 70–75% LTV tier to lower debt service.
5. **Lever 5 (Lender/Income Switch)**: Switch from LTR appraiser comp to AirDNA projection (if STR) or switch to No-Ratio lender.

---

## 6. CAKE Mortgage Master Program Matrix

| Program | Max Loan | Max LTV (Primary) | Max LTV (Investment) | Min FICO | Max DTI | Reserves | Seasoning (BK/FC) | Key Rule / Overlay |
|---|---|---|---|---|---|---|---|---|
| **Bundt Cake NOO** | $3.0M | N/A | 85% | 660 | 50% (55% w/ overlay) | 6 - 12 Mo | 12 - 35 Mo | Reduced reserves option (5% LTV cut) |
| **Bundt Cake NQM** | $3.0M | 90% | N/A | 620 | 50% (55% w/ overlay) | 6 - 12 Mo | 12 - 35 Mo | FTHB without rental history allowed |
| **Cheese Cake Full Doc** | $3.0M | 85% | 85% | 660 | 50% (45% FTHB) | 0 - 9 Mo | 36 Mo | 0 reserves at <=65% LTV on R/T |
| **Coffee Cake Full Doc** | $2.5M | 80% | 75% | 680 | 45% | 6 - 9 Mo | 48 Mo | Strict 0x30x12 & 45% DTI cap |
| **Cup Cake Non-QM** | $4.0M | 90% | N/A | 620 | 50.49% (55% w/ overlay) | 0 - 6 Mo | 12 - 35 Mo | ITIN, 1-Yr Self-Emp, $4M Max Loan |
| **Cup Cake Non-QM NOO** | $3.0M | N/A | 80% | 620 | 50.49% (55% w/ overlay) | 0 - 6 Mo | 12 - 35 Mo | Vacant property refi rules |
| **DSCR 4.0 Manual** | $3.0M | N/A | Per Matrix | Per Matrix | N/A (DSCR) | 0 - 12 Mo | Per Matrix | Debt Yield >=9% on $2M+ 5-9 units |
| **Funnel Cake Alt Doc** | $3.0M | 90% | 85% | 660 | 55% | 6 - 12 Mo | 48 Mo | 55% DTI standard cap |
| **Funnel Cake Lite Alt Doc**| $2.0M | 80% | 75% | 620 | 50% (43% if <660) | 3 Mo | Settled / Discharged | 1x120x12 housing late allowed |
| **NON-QM 4.0 Manual** | $4.0M | Per Matrix | Per Matrix | Per Matrix | 50% | 0 - 12 Mo | Per Matrix | Asset/60 vs Crypto/84 formulas |
| **Pound Cake Lite Alt Doc** | $3.0M | 90% | 85% | 660 | 50% (55% w/ overlay) | 3 - 12 Mo | 24 - 48 Mo | 3x30 housing lates allowed w/ LTV cut |
| **Sponge Cake Super Prime**| $3.0M | 90% | 80% | 620 | 50% (55% w/ overlay) | 3 - 12 Mo | 48 Mo | Super prime 90% LTV primary SFR |
| **Sponge Cake Lite Non-QM** | $1.5M | 80% | 80% | 620 | 50% (55% w/ overlay) | 3 - 6 Mo | 12 Mo | 12-month credit event recovery |
| **Velvet Cake Non-QM** | $3.0M | 85% | 80% | 660 | 50% | 6 - 12 Mo | 7+ Years | Strict 7-yr credit event seasoning |
