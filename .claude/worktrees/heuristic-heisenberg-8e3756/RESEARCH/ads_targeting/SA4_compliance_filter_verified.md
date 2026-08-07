---
type: verifier-contribution
status: drafted
date: 2026-06-22
verifier: dscr-verifier
parent_task: "SA4 Geographic + Property-Type Targeting"
scope_note: "Compliance filter slice ONLY. Market ranking, MSA selection, property-type strategy, and lender penetration are OUT OF VERIFIER SCOPE."
---

# SA4 — Compliance Filter Verification (verifier contribution)

**Author:** dscr-verifier
**Parent task:** SA4 Geographic + Property-Type Targeting for DSCR originations
**Output target:** This file is the verifier's contribution. The orchestrator should merge this with a market-research slice (different agent) to produce `SA4_Geographic_Property_Targeting.md`.

---

## Scope flag — read this first

**What this verifier agent owns** (per `agent.md` lines 27-34):
- ECOA / DSCR extension codes
- HOEPA thresholds
- State PPP rules (MN HF 3437, PA Act 6, OH ORC §1343.011, NJ N.J.S.A. 46:10B-2, WA RCW 19.144.040)
- §1071 small-business lending
- FCRA adverse action
- 50-state compliance matrix (T12 STR, T13 usury, NJ Mansion Tax)

**What this verifier agent does NOT own** (per `agent.md` lines 36-40):
- Writing code
- Designing abstractions or APIs
- Picking strategies or making decisions  ← *this is what the parent's task asks for*
- Running tests

**The parent's SA4 ask is a strategy/decision deliverable:**
- "Top 5 metros"
- "Top 3 states"
- "3 best property-type plays"

I cannot make those calls. I am a verifier, not an origination strategist. I also do **not** have access to:
- AirDNA STR saturation index
- Zillow ZORI rent data
- FRED HPI appreciation data
- Cotality / CoreLogic foreclosure data
- Pennymac / Angel Oak lender hot sheets
- US Census MSA-level 2020-2025 series (no API hook in my tool set)
- Reddit / BiggerPockets sentiment feeds

Producing those numbers from my training data would be unverified speculation — exactly the failure mode my role exists to prevent.

**What I CAN deliver:** the verified regulatory filter layer. Whoever builds SA4 should treat my compliance data as a HARD filter (state passed = safe to underwrite; state blocked = must skip regardless of market metrics).

---

## Verified state-level regulatory filters

### 1. STR legality tier (T12)

**Source:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\_obsidian_vault\_research\godmode\12_T12_50state_str_regulation\T12_summary.md`

| Tier | Count | States (file:line) |
|---|---|---|
| **PROHIBITED** | 2 | HI, NY — `T12_summary.md:73` |
| **UNCERTAIN** | 6 | AL, CT, KS, MS, OH, RI — `T12_summary.md:73` |
| **RESTRICTED** | 18 | CA, CO, FL, GA, IL, IN, KY, ME, MD, MA, NC, NJ, NY, TN, VA — `T12_summary.md:73` |
| **CLEAR** | 24 | AK, AZ, AR, DE, ID, IA, MI, MN, MO, MT, NE, NV, NH, NM, ND, OK, OR, PA, SC, SD, UT, VT, WA, WV, WI, WY — `T12_summary.md:73` |

**T12 hard-NO list for STR DSCR** (`T12_summary.md:147-152`):
- New York (NYC) — Local Law 18
- Hawaii (all counties) — TVR phase-out
- Massachusetts (Boston, Nantucket, Cambridge)
- New Jersey (Hoboken, Weehawken, WNY)
- California (LA, SF, San Diego, Santa Monica)

**Verdict:** If the orchestrator's market ranking puts a metro in NY/MA/NJ/CA/HI for STR DSCR, that row MUST be dropped from the final SA4 table regardless of rent/price metrics.

---

### 2. Usury cap / DSCR rate-ceiling risk (T13)

**Source:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\_obsidian_vault\_research\godmode\13_T13_50state_usury_caps\T13_summary.md`

**HIGH-risk states (cap ≤10%, conflicts with DSCR rates 10-12%+):** 18 jurisdictions
- AZ, CA, CO, DC, GA, IL, IA, ME, MA, MI, MN, MS, NH, ND, OK, PA, WV, WI — `T13_summary.md:102-121`

**HIGH-risk compliance pathways** (`T13_summary.md:199-209`):
- (a) State licensee exemption (mortgage banker / supervised lender)
- (b) National Bank Act / HOLA preemption (federal savings bank, national bank)
- (c) FCUA preemption (federal credit union)
- (d) Business-purpose loan structuring with proper documentation

**DSCR-friendliest states** (`T13_summary.md:179-194`):
- **TX** — 18% business-purpose written-contract cap (Tex Fin Code §302); explicit commercial rate accommodation
- **WA** — Business loans EXEMPT from usury caps (RCW §19.52.110)

**Verdict:** TX and WA pass with no usury workarounds required. All 18 HIGH-risk states require either a state license path OR federal-preempted lender status AND proper business-purpose documentation. Do NOT rank these states as "frictionless" — they require lender-side compliance lift.

---

### 3. LLC HIGH-RISK flags — VERIFICATION REQUIRED

The parent's task description lists "NJ, ND, WY" as LLC HIGH-RISK and says this disqualifies the portfolio. **This claim is only partially verified.**

| State | LLC risk verified? | Source |
|---|---|---|
| **NJ** | ✅ VERIFIED contested | `agent.md:71` — "NJ LLC PPP contested (Arc Home LLC guideline Jul 22, 2025 + NPLA Oct 2025)" |
| **ND** | ⚠️ PARTIAL — usury HIGH, LLC-specific UNVERIFIED in corpus | `T13_summary.md:117` confirms 6% usury cap HIGH-risk, but no LLC-specific PPP restriction found in T12 or T13 corpus |
| **WY** | ❌ NOT VERIFIED — corpus says LOW risk | `T13_summary.md:162` — "Wyoming: 24% licensee" listed under LOW-risk 33 jurisdictions. No LLC-specific HIGH-risk flag found in T12 or T13 corpus |

**Action items for parent / orchestrator:**
1. NJ LLC flag: confirmed correct. Treat NJ as LLC-restricted for portfolio DSCR.
2. ND LLC flag: needs source. The 6% usury cap alone does not justify an LLC HIGH-RISK call — it affects the LENDER's licensing path, not the BORROWER's LLC eligibility.
3. WY LLC flag: appears to be WRONG per T13 corpus. WY is LOW-risk (24% licensee cap). Recommend dropping from "LLC HIGH-RISK" list unless another corpus source contradicts T13.

---

### 4. State PPP / licensing cross-cuts (already in verifier scope)

| State | PPP rule | Source |
|---|---|---|
| MN | HF 3437 effective Aug 1, 2026 | `agent.md:64` (MN House Bill Summary, Apr 23, 2026) |
| PA | Act 6 2026 threshold $329,411 | `agent.md:67` (PA Bulletin 2026) |
| OH | ORC §1343.011 2025 $112,957 | `agent.md:68` |
| WA | RCW 19.144.040 ARM PPP 60-day limit | `agent.md:70` (Sprint 2 §WA) |

**Verdict:** These four states have PPP thresholds that affect DSCR rate ceiling (OH, PA) or notice-period compliance (WA) or sunset timing (MN). MN is the critical 2026-08-01 sunset — any MSA in MN needs to be flagged with PPP timing risk.

---

## Recommended compliance-side filter to apply to SA4

If the orchestrator builds a market-side ranking and wants me to verify the regulatory viability of the final top-N:

1. **DROP rows** where the MSA sits in: NY, HI, MA, NJ, CA (T12 hard-NO list)
2. **CAUTION rows** where the MSA sits in: FL (Miami Beach / Key West / Clearwater Beach), CO (Denver / Aspen), MD (Ocean City), NC (Asheville), TN (Nashville), WA (Seattle), VA (NoVA), IL (Chicago), LA (New Orleans) — `T12_summary.md:155-166`
3. **PASS no-questions** where the state is TX or WA — T13 explicitly DSCR-friendly
4. **REQUIRE license-path disclosure** for HIGH-risk usury states (the 18-state list above)
5. **MARK NJ** as LLC-contested — do not put NJ LLC DSCR deals into the portfolio
6. **VERIFY WY LLC flag** before including — current corpus says LOW-risk, parent's claim contradicts

---

## What I did NOT verify (out of scope)

The following columns from the parent's task description are NOT in verifier scope and were NOT verified:

- ❌ Population growth (2020-2025) per MSA — requires Census API
- ❌ Median rent vs median home price (rent-to-price ratio) — requires ZORI / Census ACS
- ❌ STR saturation index per MSA — requires AirDNA subscription
- ❌ Top-3 lender penetration per MSA — requires Pennymac / Angel Oak hot sheets (not in corpus)
- ❌ Property-type mix (SFR % / 2-4 unit % / condo % / multi-family %) — requires Zillow / public records
- ❌ Cash buyer % per MSA — requires Cotality / CoreLogic

These columns should be sourced from a market-research agent with appropriate data access. A `general` agent with web search and Firecrawl can likely pull Census ACS 5-year estimates and FRED HPI; AirDNA / lender hot sheets will require either a paid subscription or community sources (Reddit / BiggerPockets sentiment).

---

## File:line citations used in this report

- `agent.md:27-40` — verifier scope (own / don't own)
- `agent.md:64-71` — state PPP / LLC flagged statutes
- `T12_summary.md:73` — STR status distribution (PROHIBITED/RESTRICTED/UNCERTAIN/CLEAR counts)
- `T12_summary.md:81-91` — Top-5 most restrictive states
- `T12_summary.md:147-166` — STR DSCR hard-NO and restricted lists
- `T13_summary.md:95-162` — DSCR risk stratification (HIGH / LOW jurisdictions)
- `T13_summary.md:179-194` — TX / WA DSCR-friendliness analysis
- `T13_summary.md:199-209` — HIGH-risk compliance pathways