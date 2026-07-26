---
type: verifier-contribution
status: drafted
date: 2026-06-22
verifier: dscr-verifier
parent_task: "SA10 Top 20 Highest-Yield DSCR Borrower Profiles for Advertising"
scope_note: "Compliance-verifier slice ONLY. Per scope finding (messageId 1712): marketing-synthesis items (yield scoring, ad-reach, conversion, saturation, budget allocation, surprising findings, product recs) are OUT OF VERIFIER SCOPE. Coordinator merges this slice with a separate marketing-strategy agent's output to produce the full SA10."
---

# SA10 — Top 20 Highest-Yield DSCR Borrower Profiles: Compliance-Verifier Slice

**Author:** dscr-verifier
**Workspace:** `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\_obsidian_vault\_research\ads_targeting\SA10_Compliance_Verifier_Slice.md`
**Generated:** 2026-06-22 (America/Los_Angeles)
**Time budget:** 60-75 min (delivered within budget)
**Scope:** Compliance-verifier slice of the SA10 synthesis. Profile inventory (20 entries), approval probability per profile (sourced to SA2 Lender Matrix), compliance friction score (1-5, sourced to SA4/Seven/SA9 + state-PPP primary sources), regulatory red flags per profile, and compliance-side ranking adjustments. **Not in scope:** ad-reach numbers, conversion rates, saturation/competition scores, yield-score formula application, ad-budget allocation, "surprising findings", product recommendations. See Section 6 for the explicit OUT OF SCOPE list.

---

## 0. Executive Summary

**20 profiles delivered**, derived from three primary sources:
- **12 personas** from `SA9_Ads_Platform_Personas.md` (lines 76-1271) — ad-platform persona specs with full ECOA audit
- **5 self-employed archetypes** from `SA7_Self_Employed_Archetypes.md` (Archetypes 4, 9, 10, 13, 14) — distinct angles NOT covered by SA9
- **3 synthesis profiles** from `domain_13/dscr_borrower_personas.csv` and `SA1_Public_Approval_Case_Files.md` Pattern #3 — ITIN Borrower, Cash-Out Scaler, BRRRR Operator

**Every regulatory number in this file is cited to a primary source** (12 CFR 1002, 15 USC 1691, 42 USC 3605, 24 CFR 100.500, MN HF 3437, PA Act 6, ORC 1343.011, RCW 19.144.040, NJ N.J.S.A. 46:10B-2, CFPB May 1 2026 §1071 Final Rule, Meta/Google/TikTok housing policies) or a corpus file:line.

**Top-level compliance findings:**
1. **Meta Special Ad Category: Housing** (per Meta Ads Policy) applies to ALL 20 profiles — this disables age, gender, and zip-code-level targeting on Meta, reducing reach by ~50% per SA9 line 1288. This is the single largest platform-level constraint.
2. **Geographic restrictions are the #1 disparate-impact risk** per SA9 line 47. Every geographic exclusion in ad campaigns must be business-justified (state PPP matrix, lender licensing footprint) — not demographic-composition-driven. Redlining trap per 24 CFR 100.500.
3. **HOEPA exposure is conditional** — DSCR loans structured as bona fide business-purpose are exempt from HOEPA per 15 USC 1602(gg)(2) and Reg Z 12 CFR 1026.3(a). But ad copy that misrepresents a personal-purpose loan as business-purpose exposes lender to Reg Z / HOEPA liability. Compliance risk noted for 4 profiles (1, 3, 4, 5).
4. **§1071 status varies by entity structure** — most self-employed DSCR borrowers (sole prop, single-member LLC, individual partner) are EXEMPT under the natural-person exception (per CFPB May 1 2026 Final Rule). Only the LLC-operating-as-real-estate-business scenario is potentially COVERED — note SA7:34 cite drift still pending fix (correct cite: §1002.105(c), not §1002.105(g)).
5. **State-level hard filters** per SA4:62-65 + T12_summary.md:73 — STR targeting prohibited in NY, HI, MA (Boston/Nantucket/Cambridge), NJ (Hoboken/Weehawken/WNY), CA (LA/SF/San Diego/Santa Monica). NJ LLC = contested per agent.md:71. WY LLC HIGH-RISK flag still unverified per SA4:107.

---

## 1. Compliance Frame (Read Before Any Profile)

| Rule | Cite | What it requires for ad targeting |
|---|---|---|
| ECOA | 15 USC 1691(a)(1) | No discrimination on race, color, religion, national origin, sex, marital status, age (18+/62+ actuarial only), familial status, disability, public-assistance income, exercise of consumer credit rights |
| Regulation B | 12 CFR 1002.6(b)(1) | Bans discouragement of applicants on a prohibited basis |
| Fair Housing Act §805 | 42 USC 3604(c) / 3605 | Bans discriminatory advertising of residential property |
| 2013 HUD Disparate-Impact Rule | 24 CFR 100.500(c) | 3-part test: disparate effect, business necessity, less discriminatory alternative |
| HOEPA | 15 USC 1602(gg)(2) | Excludes credit to entities other than natural persons — DSCR as business-purpose typically exempt |
| Reg Z | 12 CFR 1026.3(a) | Excludes credit extended to a person other than a natural person — DSCR business-purpose exempt |
| §1071 small-business lending | CFPB May 1 2026 Final Rule; 12 CFR 1002.105 (small-business exemption + natural-person exception) | DSCR for natural-person borrowers EXEMPT; covered for entity-borrowers if lender originates and entity <$5M revenue + >100 loans/year |
| Meta Special Ad Category: Housing | Meta Ads Policy | Disables age, gender, zip-code-level targeting, protected-class-skewed lookalikes |
| Google Credit-Ads | Google Ads Policy | Personalized ads for credit must toggle off personal targeting |
| TikTok Housing Policy | TikTok Ads Policy | Mortgage + real-estate ads require pre-approval |

**Universal exclusions (apply to EVERY profile below):**
- No race / ethnicity / religion targeting (Meta Housing disables; FHAct §805 per 42 USC 3604(c))
- No "first-time homebuyer" language (FHAct §805 trap — proxy for age/family-status discrimination per SA9:1299). Always say "first-time investor" or "first rental property buyer."
- No zip-code exclusion of majority-minority areas without business justification (redlining trap per 24 CFR 100.500). Mitigation: geography matched to actual lender licensing footprint with documented business reason, not demographic composition (per SA9:43-44, SA9:1300).
- No age-generation framing ("Millennial", "Boomer", "empty nester") per SA9:1304-1305, 15 USC 1691(a)(1).
- No "single mom", "divorced", "family with children", "disability/accessible" framing per SA9:1306-1310.

**Geography hard filters** (per SA4:62-65, T12_summary.md:73, T12_summary.md:147-166):
- **STR PROHIBITED:** NY (NYC Local Law 18), HI (all counties TVR phase-out), MA (Boston/Nantucket/Cambridge), NJ (Hoboken/Weehawken/WNY), CA (LA/SF/San Diego/Santa Monica)
- **STR RESTRICTED (caution):** FL (Miami Beach/Key West/Clearwater Beach), CO (Denver/Aspen), MD (Ocean City), NC (Asheville), TN (Nashville), WA (Seattle), VA (NoVA), IL (Chicago), LA (New Orleans)
- **STR CLEAR:** 24 states per T12:73 — TX, AZ, NV, GA, IN, KY, ME, TN, SC, etc.
- **Usury HIGH-risk (≤10% cap, conflicts with DSCR rates 10-12%+):** 18 jurisdictions per T13_summary.md:102-121 — AZ, CA, CO, DC, GA, IL, IA, ME, MA, MI, MN, MS, NH, ND, OK, PA, WV, WI. DSCR requires state-licensee OR federal-preempted lender path.
- **DSCR-friendliest states (T13:179-194):** TX (Tex Fin Code §302, 18% business-purpose written-contract cap); WA (RCW 19.52.110, business loans EXEMPT from usury caps).
- **NJ LLC = contested** per agent.md:71 (Arc Home LLC guideline Jul 22, 2025 + NPLA Oct 2025) — do not put NJ LLC DSCR deals into portfolio.
- **WY LLC HIGH-RISK flag** (parent claim) — NOT VERIFIED per SA4:107; corpus says LOW-risk 24% licensee per T13_summary.md:162. Recommend dropping unless another source contradicts T13.

**State PPP thresholds that affect DSCR** (per agent.md:64-71):
- **MN HF 3437** effective Aug 1, 2026 — new state PPP rules; flag any MN-targeted ad copy for legal review
- **PA Act 6 2026 threshold $329,411** — affects DSCR rate ceiling
- **OH ORC §1343.011 2025 $112,957** — affects DSCR rate ceiling; flag for OH-targeted ad copy
- **WA RCW 19.144.040** — ARM PPP 60-day notice limit
- **NJ N.J.S.A. 46:10B-2** — NJ LLC contested

---

## 2. Profile Inventory — 20 Profiles

Each profile includes: persona name, source(s) with file:line, FICO band, DSCR target, loan size band, primary lender fit, approval probability, **compliance friction (1-5)**, regulatory red flags.

**Compliance friction scale (per SA7:40-48):**
- **1 — Trivial:** Standard 2-month bank stmts + appraisal. ≥18 of 20 top DSCR lenders accept. 18-21 day close.
- **2 — Low:** + 1-year tax return for self-employed verification. 15-18 lenders. 21-25 days.
- **3 — Moderate:** + business narrative or CPA letter for K-1. 10-15 lenders. 25-30 days.
- **4 — High:** Specialty lenders only (5-10). 30-45 days. May require higher DSCR (1.2+) or 25-30% down.
- **5 — Severe:** Specialty / niche (1-5). 45-60+ days. May require compensating factors.

**Approval probability scale (derived from SA2 file:line lender matrix):**
- **HIGH (≥80%):** Profile fits standard 0.75-1.00+ DSCR, 620-720 FICO, 80% LTV matrix at 15+ lenders
- **MEDIUM (50-80%):** Profile requires 1+ lender-specific overlay (sub-1.0 DSCR, 740+ FICO for 85% LTV, FN/ITIN, etc.) at 8-15 lenders
- **LOW (<50%):** Profile requires specialty lenders only (5-8 lenders); some archetypes effectively excluded
- **VARIES:** Approval highly lender-specific (e.g., first-time investor = Griffin YES / Visio NO)

### GROUP A — SA9 Personas (12 of 20)

---

**PROFILE 1 — Side-Hustle SFR Landlord**
- **Source:** SA9_Ads_Platform_Personas.md:76-188 (Persona 1)
- **FICO band:** 680-760
- **DSCR target:** 1.0-1.4
- **Loan size:** $75K-$1M (modal $250-400K per SA1:159)
- **Primary lender fit:** Griffin Funding, Visio, Pennymac, Kiavi (per SA2:139-142, SA7:433-435)
- **Approval probability:** **HIGH** (15-18 of 20 lenders per SA2:161-162, plus modal loan band confirmed in SA1 Pattern #2)
- **Compliance friction:** **1** (standard DSCR doc stack per SA7:44)
- **Regulatory red flags:**
  - 🟡 **ECOA MEDIUM (geography):** Per SA9:181 + SA9:1300 — geography restrictions must be tied to lender licensing footprint, not demographic composition
  - 🟢 **HOEPA:** Generally exempt if structured as LLC business-purpose; ad copy must NOT imply consumer-purpose protections per SA1 Finding 5 (parent's note: "misrepresenting a personal-purpose loan as business-purpose exposes lender to Reg Z / HOEPA liability")
  - 🟢 **§1071:** EXEMPT — natural-person borrower per CFPB May 1 2026 Final Rule; SA7:34 (cite correction pending)
  - 🟢 **ECOA Reg B §1002.6(b)(1):** No discouragement language; ad copy invites all qualified applicants per SA9:182

---

**PROFILE 2 — STR / Airbnb Operator**
- **Source:** SA9_Ads_Platform_Personas.md:190-294 (Persona 2); SA1:184-190 (Easy Street + AirDNA case study, 300+ properties, AirDNA projection accuracy 0.4%)
- **FICO band:** 660-740
- **DSCR target:** 1.0+ (AirDNA-supported at Easy Street; 12-mo documented at Pennymac)
- **Loan size:** $100K-$2M
- **Primary lender fit:** Easy Street Capital (no DSCR min for STR, AirDNA-supported per SA2:151), Kiavi, Newfi (per SA2:147, 150-151)
- **Approval probability:** **MEDIUM** (Easy Street + Visio Flex accept; 18/20 require 12-mo STR history per SA2:78)
- **Compliance friction:** **2** (12-mo documented STR history for non-Easy-Street lenders; STR DSCR bifurcation per SA1 Pattern #5)
- **Regulatory red flags:**
  - 🔴 **HARD FILTER (T12 PROHIBITED):** STR targeting PROHIBITED in NY, HI, MA, NJ, CA per SA4:67-73 + T12_summary.md:147-152. Drop these states from STR persona targeting entirely.
  - 🟡 **ECOA MEDIUM (geography):** Per SA9:288, SA9:1300 — STR-heavy metros (Memphis, Atlanta, Houston, Charlotte) have higher minority populations; targeting by metro-level STR demand OK, by racial composition NOT OK
  - 🟡 **ECOA MEDIUM (FN STR):** Per SA9:289 — NJ + NY STR owners are persona-relevant but excluded for regulatory complexity (business-justified, not demographic)
  - 🟢 **§1071:** EXEMPT (natural person per CFPB May 1 2026 Final Rule)
  - 🟢 **FCRA adverse action:** Standard 30-day notice per 15 USC 1681m if denied

---

**PROFILE 3 — Portfolio Builder / Scaling Landlord**
- **Source:** SA9_Ads_Platform_Personas.md:297-402 (Persona 3); SA1:151-152 (Griffin May 2026: 67% cash-out, scaling pattern)
- **FICO band:** 700-780
- **DSCR target:** 1.0+ across portfolio
- **Loan size:** $500K-$5M (portfolio product per SA9:341-352)
- **Primary lender fit:** Insula Capital (NEW Jun 11 2026, portfolio-level Σ NOI/Σ PITIA per SA2:356, 473-474), Lima One, BFF, Verus, Angel Oak, Rocket Pro TPO (per SA2:152, 155)
- **Approval probability:** **MEDIUM** (5-10 lenders accept portfolio; 1+ specialty; portfolio product availability limited pre-2026)
- **Compliance friction:** **2-3** (Insula = portfolio-level DSCR; specialty verification needed)
- **Regulatory red flags:**
  - 🟡 **CFPB UDAAP risk:** Per SA9:397 — avoid implying "guaranteed approval" or "no-doc" without disclosing DSCR ≥ 1.0 explicitly
  - 🟡 **OH PPP exposure:** Per SA9:305 — OH PPP threshold $112,957 may require deal structuring; flag OH-targeted ad copy
  - 🟢 **§1071:** EXEMPT for natural-person; MIXED for LP/LLC entity per SA7:168 (MIXED — fund entity may be covered; individual partner taking loan personally is EXEMPT)
  - 🟢 **ECOA:** LOW per SA9:396 (portfolio builders self-select by expertise; interest/behavior targeting robust)

---

**PROFILE 4 — DSCR Second (HELOC-Equivalent) Cash-Out Refi**
- **Source:** SA9_Ads_Platform_Personas.md:405-504 (Persona 4); SA1:163-172 (cash-out refi dominance pattern)
- **FICO band:** 720-800
- **DSCR target:** 1.0+ on combined (first + second)
- **Loan size:** $50K-$500K (second-lien)
- **Primary lender fit:** Deephaven (DSCR Second product originator per SA9:407 — STALE flag per SA2:62), Plus general DSCR lenders with second-lien product
- **Approval probability:** **MEDIUM** (Deephaven primary; Deephaven data pre-2024 STALE per SA2:62)
- **Compliance friction:** **3** (second-lien requires higher combined DSCR; first-mortgage verification)
- **Regulatory red flags:**
  - 🔴 **TILA-RESPA risk:** Per SA9:499 — ads must NOT use "free", "no-cost", "low payment" without proper APR disclosure language; avoid cost-comparison headlines
  - 🟡 **HOEPA exposure:** Per SA1 Finding 5 — second-lien DSCR structured as business-purpose avoids HOEPA; if consumer-purpose, HOEPA APR-margin tests apply (per 15 USC 1602(bb) and Reg Z 12 CFR 1026.32)
  - 🟡 **Geography:** High-appreciation markets include CA, NY (NYC metro) per SA9:413 — CA STR rules apply if used as STR; verify property use before targeting
  - 🟢 **§1071:** EXEMPT (natural person per CFPB May 1 2026 Final Rule)
  - 🟢 **ECOA:** LOW per SA9:498 (cash-out refi is intent-based)

---

**PROFILE 5 — First-Time DSCR / Transitioning Investor**
- **Source:** SA9_Ads_Platform_Personas.md:507-602 (Persona 5); SA1:108 (Griffin #1: FICO 710, no prior rental experience, approved at 7.50%/80% LTV in 22 days); SA1:146-153 (Pattern #1 — first-time investor is LENDER-SPECIFIC: Griffin YES, Visio NO)
- **FICO band:** 680-760
- **DSCR target:** 1.0+ (Griffin/Acra/Easy Street/New Silver at 1.0+; Visio requires prior experience)
- **Loan size:** $100K-$500K (modal)
- **Primary lender fit:** Griffin Funding, Acra Lending, Easy Street Capital, New Silver (per SA2:79 + SA7 archetype notes); **NOT Visio** (requires 1+ rental in last 3 years per SA1:150)
- **Approval probability:** **VARIES** — Griffin/Acra/Easy Street/New Silver HIGH; Visio LOW
- **Compliance friction:** **2** (standard doc stack; lender-specific experience requirements)
- **Regulatory red flags:**
  - 🔴 **ECOA HIGH (language trap):** Per SA9:596, SA9:1325, SA9:1299 — NEVER use "first-time homebuyer" language; FHAct §805 (42 USC 3604(c)) advertising trap. Always say "first-time investor" or "first rental property buyer."
  - 🔴 **Meta age generation:** Per SA9:597 — "Millennial" or "Gen Z" targeting disallowed on housing ads (15 USC 1691(a)(1) age provision)
  - 🟡 **HOEPA exposure:** Per SA1 Finding 5 — ad copy must NOT misrepresent personal-purpose as business-purpose
  - 🟢 **§1071:** EXEMPT (natural person per CFPB May 1 2026 Final Rule)

---

**PROFILE 6 — Self-Employed RE Pro (Realtor / Contractor)**
- **Source:** SA9_Ads_Platform_Personas.md:605-702 (Persona 6); SA7 Archetypes 11 (GC) and 12 (Realtor) at SA7:311-354
- **FICO band:** 680-760
- **DSCR target:** 1.0-1.5
- **Loan size:** $200K-$800K
- **Primary lender fit:** 19 of 20 top DSCR lenders (Realtors) per SA7:346; 15 of 20 (GCs) per SA7:323
- **Approval probability:** **HIGH** (Realtor archetype: 19/20 lenders; GC archetype: 15/20)
- **Compliance friction:** **2** (Realtor) or **3** (GC) per SA7:344, 321
- **Regulatory red flags:**
  - 🟡 **ECOA MEDIUM (LinkedIn job-title targeting):** Per SA9:639, SA7:490 — job-title targeting is LinkedIn's strongest filter; must be justified as business-purpose (real estate investor = business-borrower), not as demographic proxy. Document as "self-employed borrowers have higher tax-return complexity" — legitimate underwriting concern, not demographic filter.
  - 🟢 **§1071:** EXEMPT (natural person per CFPB May 1 2026 Final Rule; SA7:145, 352)
  - 🟢 **ECOA:** LOW per SA9:696 (occupation is business-purpose filter)
  - 🟢 **HOEPA:** EXEMPT if LLC business-purpose per 15 USC 1602(gg)(2)

---

**PROFILE 7 — Multi-Family / Small Commercial (5-50 units)**
- **Source:** SA9_Ads_Platform_Personas.md:705-799 (Persona 7); SA1 Case #4 (Ridge Street Capital NYC 5-unit, $1.55M / 7.375% / 58.5% LTV, 1.16 DSCR on NOI/PITIA basis per SA1:111, 286-313); SA2:158 (Ready Capital 5-10 unit only, 1.20 multifamily DSCR, 680 FICO)
- **FICO band:** 660-740
- **DSCR target:** 1.0-1.5 (5+ unit = commercial DSCR methodology NOI/PITIA per SA1:307)
- **Loan size:** $500K-$5M
- **Primary lender fit:** Ready Capital (5-10 unit specialist per SA2:158), Insula Capital ($5M-$50M+ per SA2:356); commercial lenders per Insula portfolio product
- **Approval probability:** **MEDIUM** (specialty lenders; 5+ unit not standard DSCR product)
- **Compliance friction:** **3** (commercial docs; NOI verification; appraisal methodology)
- **Regulatory red flags:**
  - 🟡 **ECOA scope:** Per SA9:794 — multi-family >5 units is generally NOT subject to ECOA dwelling-secured rules, but FHAct advertising rules (42 USC 3604(c)) still apply if marketed for residential rental
  - 🟢 **§1071:** EXEMPT (natural person per CFPB May 1 2026 Final Rule)
  - 🟡 **Geography:** Per SA9:713 — Midwest + South (OH, IN, MI, IL, MO, KS, TX, GA, NC, TN, FL) — OH PPP threshold $112,957 may apply; flag OH-targeted ad copy
  - 🟡 **Ready Capital note:** Per SA2:158 — NOT a primary 1-4 unit DSCR lender; 5-10 unit multifamily bridge focus only

---

**PROFILE 8 — Foreign National Investor**
- **Source:** SA9_Ads_Platform_Personas.md:802-894 (Persona 8); SA2 (FN excluded at Pennymac + Kiavi; accepted at 18/20 per SA2:75, 143-144)
- **FICO band:** N/A (no U.S. credit history); international credit / asset-based
- **DSCR target:** 1.0+
- **Loan size:** $100K-$2M
- **Primary lender fit:** Angel Oak, Newfi, Verus, FN specialty lenders (per SA2:148, 147); **EXCLUDED at Pennymac + Kiavi** per SA2:142-143
- **Approval probability:** **MEDIUM** (18/20 lenders per SA2:75; Pennymac + Kiavi REJECT)
- **Compliance friction:** **3-4** (no U.S. credit; foreign-source income; international asset verification)
- **Regulatory red flags:**
  - 🟡 **ECOA MEDIUM (national origin):** Per SA9:888, SA9:1328 — national origin is protected class; FN targeting allowed ONLY because FN is credit-eligibility category (lender can't verify U.S. tax returns / credit for non-residents) — business necessity, not demographic. Document carefully.
  - 🟡 **AML/sanctions:** Foreign-source income requires BSA/OFAC screening per 31 CFR 1010 — not specifically flagged in SA9 but inherent to FN lending
  - 🟡 **CA, NY, FL, TX, AZ, NV geography:** Per SA9:810 — high foreign-buyer concentration; FN-friendly markets, no issue
  - 🟢 **§1071:** EXEMPT (FN is not a covered business; natural-person exception per CFPB May 1 2026 Final Rule)
  - 🟡 **Language targeting:** Per SA9:825 — foreign-language ad targeting requires business justification (FN is credit-eligibility category, not protected class)

---

**PROFILE 9 — 1031 Exchange Upgrader**
- **Source:** SA9_Ads_Platform_Personas.md:897-989 (Persona 9); SA9:1305 (CA, NY, NJ, FL, WA, OR geography for 1031 sellers)
- **FICO band:** 700-800
- **DSCR target:** 1.0+
- **Loan size:** $200K-$1M+
- **Primary lender fit:** Standard DSCR lenders; specialized 1031-refi DSCR lenders
- **Approval probability:** **HIGH** (standard DSCR; time-pressure accelerates close)
- **Compliance friction:** **2** (standard DSCR + 1031 intermediary coordination)
- **Regulatory red flags:**
  - 🟡 **Age-implied language:** Per SA9:1305, SA9:1329 — actuarial justification required for 62+ targeting; 1031 sellers often 50-70. Avoid age-implied language entirely; rely on interest targeting.
  - 🟡 **TILA risk:** Per SA9:985 — time-pressure messaging ("deadline approaching") is allowed but cannot create deception; always disclose DSCR ≥ 1.0 requirement
  - 🟡 **CA, NJ geography:** Per SA9:905 — strong in CA (high equity), NY, NJ, FL, WA, OR. NJ LLC contested per agent.md:71 — flag NJ-targeted 1031 DSCR for legal review
  - 🟡 **MN HF 3437:** Per SA9:1342 — MN-targeted ad copy may be affected by MN HF 3437 effective Aug 1, 2026
  - 🟢 **ECOA:** LOW per SA9:984 (1031 is transaction structure, not demographic)
  - 🟢 **§1071:** EXEMPT (natural person per CFPB May 1 2026 Final Rule)

---

**PROFILE 10 — Vacation Cabin / Hybrid STR Owner**
- **Source:** SA9_Ads_Platform_Personas.md:993-1085 (Persona 10)
- **FICO band:** 700-800
- **DSCR target:** 1.0+ (AirDNA-supported for personal-use + rental hybrid)
- **Loan size:** $400K-$1.5M
- **Primary lender fit:** Easy Street Capital (STR specialist, no DSCR min per SA2:151), Kiavi, Newfi
- **Approval probability:** **MEDIUM** (most lenders restrict to pure rental; hybrid requires specialty)
- **Compliance friction:** **3** (hybrid personal-use + rental adds doc complexity; STR 12-mo history for non-Easy-Street)
- **Regulatory red flags:**
  - 🔴 **HARD FILTER (T12):** Per SA4:67-73 — STR targeting PROHIBITED in NY, HI, MA, NJ, CA. STR RESTRICTED in FL (Panhandle), CO (ski country), NC (Smokies/Outer Banks), TN (Smokies), SC (Hilton Head), MA (Cape Cod), MO (Lake of the Ozarks), NV (Lake Tahoe). Per Persona 10:1001, target geography includes some PROHIBITED (Cape Cod MA) and RESTRICTED markets — drop or caution per SA4:133.
  - 🟡 **ECOA LOW-MEDIUM (geography demographics):** Per SA9:1080, SA9:1330 — mountain/lake/beach leisure markets can be demographic-skewed; target by market itself, not demographic (ski resort = affluent white is classic redlining trap per SA9:1080)
  - 🟢 **§1071:** EXEMPT (natural person per CFPB May 1 2026 Final Rule)
  - 🟢 **ECOA:** LOW per SA9:1079 (STR + vacation property is intent-based)

---

**PROFILE 11 — Builder / Developer (Construction-to-DSCR)**
- **Source:** SA9_Ads_Platform_Personas.md:1088-1179 (Persona 11)
- **FICO band:** 680-760
- **DSCR target:** 1.0+ at CO (certificate of occupancy)
- **Loan size:** $200K-$1M+ (construction + take-out)
- **Primary lender fit:** Construction-to-perm lenders with DSCR take-out; not standard DSCR lenders
- **Approval probability:** **MEDIUM** (construction-to-DSCR specialty; not all DSCR lenders offer)
- **Compliance friction:** **3-4** (construction loan + DSCR take-out coordination; WIP schedules; retention)
- **Regulatory red flags:**
  - 🟢 **§1071:** EXEMPT (natural person per CFPB May 1 2026 Final Rule)
  - 🟢 **ECOA:** LOW per SA9:1174 (builder/developer is business-purpose filter)
  - 🟡 **Growth-market geography:** Per SA9:1096 — TX, FL, NC, SC, GA, TN, AZ, NV. Some have STR-restricted metros (TN Nashville, FL Miami Beach); review per SA4:134

---

**PROFILE 12 — Fix-and-Flip Pivot to Rental**
- **Source:** SA9_Ads_Platform_Personas.md:1182-1272 (Persona 12); SA1:115-116, 120-124 (Easy Street multi-product: EasyFix bridge → EasyRent DSCR take-out)
- **FICO band:** 660-740
- **DSCR target:** 1.0+ at take-out
- **Loan size:** $150K-$700K
- **Primary lender fit:** Easy Street Capital (multi-product per SA1:116), bridge-to-DSCR specialty lenders
- **Approval probability:** **MEDIUM** (specialty; bridge lender + DSCR lender coordination)
- **Compliance friction:** **3** (bridge take-out requires bridge + DSCR lender coordination; some bridge lenders don't refi to DSCR)
- **Regulatory red flags:**
  - 🟢 **§1071:** EXEMPT (natural person per CFPB May 1 2026 Final Rule)
  - 🟢 **ECOA:** LOW per SA9:1267 (flip-to-rent is intent-based)
  - 🟡 **Flip-market geography:** Per SA9:1190 — TX, FL, GA, NC, AZ, NV, OH, IN, MI. OH PPP threshold $112,957 applies; IN, MI are STR CLEAR per T12:73.

---

### GROUP B — SA7 Self-Employed Archetypes NOT Covered by SA9 (5 of 20)

---

**PROFILE 13 — Gig Economy Multi-App Worker (Uber / Lyft / DoorDash / TaskRabbit / Instacart)**
- **Source:** SA7_Self_Employed_Archetypes.md:380-399 (Archetype 14)
- **FICO band:** 640-720
- **DSCR target:** 1.0-1.5
- **Loan size:** $100K-$400K
- **Primary lender fit:** 14 of 20 top DSCR lenders per SA7:392
- **Approval probability:** **MEDIUM** (14/20 lenders; some reject gig-only income for reserves)
- **Compliance friction:** **4** (fragmented income, IRS 1099-K threshold changes, algorithm risk per SA7:393)
- **Regulatory red flags:**
  - 🟡 **ECOA MEDIUM (age skew):** Per SA7:503 — gig worker demographics skew younger; protect against age targeting (Meta Special Ad Category blocks this; document business purpose)
  - 🟡 **1099-K threshold confusion:** Per SA7:71, 512 — IRS 1099-K threshold 2025 = $2,500 (phased); 2026 = $600 (scheduled); legislation pending to raise to $1,000 UNVERIFIED. Per SA7:474, do NOT promise tax-filing avoidance in ad copy.
  - 🟡 **Reserve verification:** Per SA7:73 — if 1099-K not issued (under threshold), bank statements still show deposits; 12-24 months of bank statements typically required
  - 🟢 **§1071:** EXEMPT (natural person / Schedule C per SA7:398)
  - 🟢 **HOEPA:** EXEMPT if LLC business-purpose per 15 USC 1602(gg)(2)

---

**PROFILE 14 — K-1 Partner in Real Estate Fund (Passive / Accredited)**
- **Source:** SA7_Self_Employed_Archetypes.md:151-169 (Archetype 4)
- **FICO band:** 700-780
- **DSCR target:** 1.2-2.0 (specialty lenders prefer higher DSCR per SA7:161)
- **Loan size:** $300K-$1.5M
- **Primary lender fit:** 5-8 of 20 top DSCR lenders (Angel Oak, Newfi specialty) per SA7:162
- **Approval probability:** **LOW** (5-8/20 lenders; phantom income concern; fund liquidation risk per SA7:163)
- **Compliance friction:** **4** (K-1 "phantom income" concern; fund PPM required; sometimes capital call history per SA7:158)
- **Regulatory red flags:**
  - 🟡 **§1071 MIXED:** Per SA7:168 — fund entity may be covered; individual partner taking loan personally is EXEMPT. Verify entity structure.
  - 🟡 **ECOA (high-net-worth targeting):** Per SA7:493 — exclude geography by income proxy is NOT allowed; use fund/syndication interests instead
  - 🟢 **ECOA:** LOW per SA7:169 (high-net-worth targeting is intent-based)
  - 🟢 **HOEPA:** EXEMPT if LP/LLC business-purpose per 15 USC 1602(gg)(2)

---

**PROFILE 15 — Restaurant / Franchise Owner**
- **Source:** SA7_Self_Employed_Archetypes.md:265-284 (Archetype 9)
- **FICO band:** 660-740
- **DSCR target:** 1.0-1.4
- **Loan size:** $150K-$700K
- **Primary lender fit:** 15 of 20 top DSCR lenders per SA7:277
- **Approval probability:** **MEDIUM** (15/20; restaurant income volatility concern per SA7:278)
- **Compliance friction:** **3** (high failure rate ~60% in first 3 years, thin margins, lease risk per SA7:267)
- **Regulatory red flags:**
  - 🔴 **ECOA HIGH (cuisine targeting):** Per SA7:498, SA7:522 — targeting by cuisine (Mexican, Chinese, etc.) is potential national-origin proxy; target by ownership/operator interest, not cuisine. Legal review of ad copy REQUIRED before launch per SA7:522.
  - 🟢 **§1071:** EXEMPT (natural person per SA7:283)
  - 🟢 **ECOA:** LOW per SA7:284 (occupation-based)
  - 🟢 **HOEPA:** EXEMPT if LLC business-purpose

---

**PROFILE 16 — Medical Practice Owner (Non-Physician: Dentist / Vet / PT / Optometrist)**
- **Source:** SA7_Self_Employed_Archetypes.md:286-307 (Archetype 10)
- **FICO band:** 700-780
- **DSCR target:** 1.0-1.5
- **Loan size:** $400K-$1.5M (highest $ of self-employed archetypes per SA7:436)
- **Primary lender fit:** 18 of 20 top DSCR lenders per SA7:300
- **Approval probability:** **HIGH** (18/20; medical practices have predictable revenue + clean S-Corp docs per SA7:301)
- **Compliance friction:** **2** (clean S-Corp docs; stable revenue; high income = larger loans)
- **Regulatory red flags:**
  - 🟢 **§1071:** EXEMPT (natural person per SA7:306)
  - 🟢 **ECOA:** LOW per SA7:499 (job-title targeting on healthcare is robust; protect against age targeting — older practitioners skew 50+)
  - 🟢 **HOEPA:** EXEMPT if LLC business-purpose

---

**PROFILE 17 — Insurance Agent (Captive or Independent)**
- **Source:** SA7_Self_Employed_Archetypes.md:357-376 (Archetype 13)
- **FICO band:** 660-740
- **DSCR target:** 1.0-1.4
- **Loan size:** $150K-$500K
- **Primary lender fit:** 17 of 20 top DSCR lenders per SA7:369
- **Approval probability:** **HIGH** (17/20; commission income well-understood)
- **Compliance friction:** **3** (captive = friction 2; independent = friction 3 per SA7:367; commission volatility)
- **Regulatory red flags:**
  - 🟢 **§1071:** EXEMPT (natural person per SA7:375)
  - 🟢 **ECOA:** LOW per SA7:502 (industry demographics skew 40-60; use interest targeting, not age)
  - 🟢 **HOEPA:** EXEMPT if LLC business-purpose

---

### GROUP C — Synthesis Profiles (3 of 20)

---

**PROFILE 18 — ITIN Borrower (no SSN, US-based)**
- **Source:** domain_13/dscr_borrower_personas.csv:33 (Persona 6); SA2 (ITIN rejected at Pennymac + Kiavi; accepted at 17/20 per SA2:76)
- **FICO band:** 640-720
- **DSCR target:** 1.0+
- **Loan size:** $100K-$500K
- **Primary lender fit:** CrossCountry Mortgage (ITIN-only, no FN per SA2:146), ITIN specialty lenders
- **Approval probability:** **MEDIUM** (17/20 lenders; higher default risk per domain_13)
- **Compliance friction:** **3-4** (ITIN-only verification; cross-border credit evaluation)
- **Regulatory red flags:**
  - 🔴 **ECOA HIGH (national origin):** Per SA2:76 + ITIN + national origin = protected class. Targeting ITIN borrowers requires careful business justification. Per SA9:1303, Spanish-language ad targeting requires documented business justification (e.g., Hispanic homeownership outreach with mission language). Document the credit-eligibility basis (no SSN) — not a demographic filter.
  - 🟡 **Fair lending review:** Per agent.md scope — ITIN-borrower profile triggers fair-lending review; verify with institution's compliance counsel
  - 🟡 **CA, TX, FL, AZ geography:** Per domain_13:33 — preferred states; CA is STR RESTRICTED if used as STR
  - 🟡 **Default risk tier:** Per domain_13:33 — Higher default risk tier
  - 🟢 **§1071:** EXEMPT (natural person per CFPB May 1 2026 Final Rule; SA7:34 cite correction pending)
  - 🟢 **HOEPA:** EXEMPT if LLC business-purpose

---

**PROFILE 19 — Cross-Border / High-Equity Cash-Out Refi Scaler**
- **Source:** Synthesis of SA9 Persona 4 (DSCR Second) + SA1 Pattern #3 (cash-out refi dominance, 67% Griffin May 2026) + SA1 Pattern #4 (location-based pricing 0.5-1.0% spread)
- **FICO band:** 720-800
- **DSCR target:** 1.0+ on combined (first + second) or post-refi
- **Loan size:** $200K-$1M cash-out
- **Primary lender fit:** Griffin (CA strong; +0.25% elsewhere per SA1:282), Lima One (geography-balanced per SA1:282), Visio (experienced-only per SA1:150)
- **Approval probability:** **MEDIUM** (location-based pricing; lender matching critical per SA1:282)
- **Compliance friction:** **2** (standard DSCR + cash-out)
- **Regulatory red flags:**
  - 🟡 **TILA-RESPA risk:** Per SA9:499 — no "free", "no-cost", "low payment" without proper APR disclosure
  - 🟡 **HOAPA / HOEPA exposure:** Per SA1 Finding 5 — cash-out DSCR as business-purpose avoids HOEPA; if consumer-purpose, HOEPA APR-margin tests apply (per 15 USC 1602(bb), Reg Z 12 CFR 1026.32)
  - 🟡 **CA STR rules:** Per SA4:67-73 — if CA property used as STR, T12 hard-NO applies to LA/SF/San Diego/Santa Monica
  - 🟡 **NJ LLC contested:** Per agent.md:71 — NJ LLC cash-out DSCR flagged
  - 🟢 **§1071:** EXEMPT (natural person)
  - 🟢 **ECOA:** LOW (intent-based per SA9:498)

---

**PROFILE 20 — BRRRR Operator (Bridge → Rehab → Rent → Refi)**
- **Source:** Synthesis of SA9 Persona 12 (Fix-and-Flip Pivot) + SA1:115-116, 120-124 (Easy Street multi-product: EasyFix → EasyRent); cross-cuts SA7 Archetype 11 (GC, can self-perform rehab)
- **FICO band:** 660-740
- **DSCR target:** 1.0+ post-rehab
- **Loan size:** $100K-$500K
- **Primary lender fit:** Easy Street Capital (EasyFix → EasyRent bridge-to-DSCR per SA1:116), Kiavi, Newfi
- **Approval probability:** **MEDIUM** (Easy Street multi-product flow; specialty)
- **Compliance friction:** **3** (bridge + DSCR coordination; rehab completion verification; rental 12-mo history for non-Easy-Street lenders)
- **Regulatory red flags:**
  - 🟢 **§1071:** EXEMPT (natural person per CFPB May 1 2026 Final Rule)
  - 🟢 **ECOA:** LOW (intent-based)
  - 🟡 **Flip-market geography:** Per SA1 — TX, FL, GA, NC, AZ, NV, OH, IN, MI. OH PPP threshold applies.
  - 🟢 **HOEPA:** EXEMPT if LLC business-purpose

---

## 3. Compliance-Side Ranking Adjustments (HARD FILTERS)

These are non-negotiable compliance filters that must be applied to the marketing-strategy agent's final ranking. Profiles that violate any of these must be either DROPPED, CAUTIONED, or RE-DESIGNATED for compliant targeting.

### 3.1 State-level STR prohibitions (DROP / CAUTION)

| Filter | Source | Effect |
|---|---|---|
| **STR PROHIBITED (DROP all STR personas: 2, 10)** | T12_summary.md:73, 147-152; SA4:67-73 | NY (NYC Local Law 18), HI (all counties TVR phase-out), MA (Boston/Nantucket/Cambridge), NJ (Hoboken/Weehawken/WNY), CA (LA/SF/San Diego/Santa Monica) — drop these geographies entirely from STR persona targeting |
| **STR RESTRICTED (CAUTION for STR personas: 2, 10, 11)** | T12_summary.md:155-166; SA4:134 | FL (Miami Beach/Key West/Clearwater Beach), CO (Denver/Aspen), MD (Ocean City), NC (Asheville), TN (Nashville), WA (Seattle), VA (NoVA), IL (Chicago), LA (New Orleans) — ad copy must reflect local STR rules |
| **STR CLEAR (PASS)** | T12:73 | 24 states — TX, AZ, NV, GA, IN, KY, ME, TN (outside Nashville), SC, SD, UT, VT, WA (outside Seattle), WV, WI, WY, OK, OR, PA (with PPP caveat), SC, SD |

### 3.2 State-level usury / DSCR-friendliness (ADJUST ad copy)

| Filter | Source | Effect |
|---|---|---|
| **DSCR-FRIENDLY (PASS no questions)** | T13_summary.md:179-194; SA4:135 | TX (Tex Fin Code §302, 18% business-purpose), WA (RCW 19.52.110, business loans EXEMPT) — no usury workarounds required |
| **USURY HIGH-RISK (REQUIRE license-path disclosure)** | T13_summary.md:102-121; SA4:136 | 18 jurisdictions: AZ, CA, CO, DC, GA, IL, IA, ME, MA, MI, MN, MS, NH, ND, OK, PA, WV, WI — ad copy must NOT misrepresent rate ceiling; license path required |
| **PA ACT 6 2026 THRESHOLD $329,411** | agent.md:67; SA4:121 | PA-targeted ad copy: flag deal structuring for loans above threshold |
| **OH ORC §1343.011 2025 $112,957** | agent.md:68; SA4:122; SA9:305 | OH-targeted ad copy: flag deal structuring; affects Profiles 3, 7, 12, 20 |
| **MN HF 3437 EFFECTIVE AUG 1, 2026** | agent.md:64; SA9:1342 | MN-targeted ad copy: legal review before launch |

### 3.3 LLC entity filters

| Filter | Source | Effect |
|---|---|---|
| **NJ LLC CONTESTED (DROP NJ LLC DSCR)** | agent.md:71 (Arc Home LLC Jul 22, 2025 + NPLA Oct 2025); SA4:137 | NJ LLC DSCR deals should not be in portfolio — affects all profiles that may use NJ LLC (1, 2, 3, 8, 9, 10) |
| **WY LLC HIGH-RISK FLAG — UNVERIFIED** | SA4:107 | Parent claim says WY = LLC HIGH-RISK; corpus (T13_summary.md:162) says WY = LOW-risk 24% licensee. Recommend DROPPING the HIGH-RISK flag unless another source contradicts T13. Do not put WY LLC DSCR into the LLC-contested bucket. |

### 3.4 Universal ad-copy filters (ALL 20 profiles)

| Filter | Source | Effect |
|---|---|---|
| **"FIRST-TIME HOMEBUYER" LANGUAGE — NEVER USE** | FHAct §805 (42 USC 3604(c)); SA9:1299, 1325 | Affects Profile 5. Always say "first-time investor" or "first rental property buyer." |
| **AGE-GENERATION LANGUAGE — NEVER USE** | 15 USC 1691(a)(1); SA9:1304, 1325 | "Millennial", "Gen Z", "Boomer", "empty nester" all prohibited on housing ads. Affects Profiles 5, 9, 10, 13. |
| **CUISINE-TARGETED RESTAURANT ADS** | SA7:498, 522 (legal review required); FHAct §805 (42 USC 3604(c)) | Affects Profile 15. Cuisine is potential national-origin proxy. |
| **ZIP-CODE EXCLUSION OF MAJORITY-MINORITY AREAS** | 24 CFR 100.500; SA9:43-44, 1300 | Affects all profiles. Geography restrictions must be business-justified (state PPP, lender licensing) — not demographic-composition-driven. |
| **"LOW PAYMENT" / "FREE" / COST-COMPARISON HEADLINES** | TILA-RESPA / Reg Z 12 CFR 1026; SA9:499 | Affects Profiles 4, 19. Avoid without proper APR disclosure. |
| **HOEPA / REG Z — AD COPY MUST NOT MISREPRESENT** | 15 USC 1602(gg)(2); 12 CFR 1026.3(a); SA1 Finding 5 | Affects Profiles 1, 3, 4, 5. DSCR = business-purpose exempt; misrepresentation = liability. |
| **META HOUSING SPECIAL AD CATEGORY — ALWAYS ON** | Meta Ads Policy; SA9:25-36, 1288 | Affects all 20 profiles. Disables age, gender, zip-code, protected-class-skewed lookalikes. ~50% reach reduction vs. non-housing ads. |

---

## 4. Verification Status (Summary of this Slice)

- **PASS (verbatim / citable):** ECOA cite (15 USC 1691), Reg B cite (12 CFR 1002.6), FHAct cite (42 USC 3604(c)), HUD cite (24 CFR 100.500), HOEPA cite (15 USC 1602(gg)(2)), Reg Z cite (12 CFR 1026.3(a)), §1071 cite (CFPB May 1 2026 Final Rule), state PPP cites (MN HF 3437, PA Act 6 $329,411, OH ORC §1343.011 $112,957, WA RCW 19.144.040, RCW 19.52.110), Meta Housing Special Ad Category, T12 STR tier counts (T12_summary.md:73), T13 usury HIGH-risk list (T13_summary.md:102-121), SA2 lender matrix (20 lenders × 15 criteria).
- **PARTIAL (subsection precision needed):** SA9:18 should specify §1002.6(b)(1) (not just §1002.6) — **flagged for orchestrator fix**.
- **FAIL (cite drift):** SA7:34 cites §1002.105(g) which does NOT exist in 12 CFR 1002. Correct cite: §1002.105(c) (natural-person exception). **Recommend fix in SA7**.
- **UNVERIFIED (parent to chase):** WY LLC HIGH-RISK flag (parent claim contradicts T13:162); SA7:512 1099-K legislation pending $1,000 threshold; LinkedIn job-title targeting for housing ads (less restrictive than Meta but UNVERIFIED for 2026); TikTok housing-specific ad restrictions (UNVERIFIED 2026 implementation); state-by-state DSCR ad compliance (CA, NY, MA enhanced rules UNVERIFIED); 1071 broker-exempt applicability to DSCR Deal Desk (UNVERIFIED per SA7:513).

---

## 5. Recommended Compliance-Side Next Steps (for parent / orchestrator)

1. **Fix SA7:34 cite drift** (§1002.105(g) → §1002.105(c)) — this is a real bug.
2. **Fix SA9:18 subsection precision** (§1002.6 → §1002.6(b)(1)) — minor precision improvement.
3. **Drop WY LLC HIGH-RISK flag** unless another source contradicts T13_summary.md:162 (WY = LOW-risk 24% licensee).
4. **Verify 1099-K 2026 threshold** with current IRS guidance before any ad copy mentions it.
5. **State-by-state ad-copy legal review** for CA, NY, MA, NJ, MN, OH, PA, WA, NC, FL, TN, CO, IL, MD, VA — flagged in 3.2 and 3.3 above.
6. **MN HF 3437 effective Aug 1, 2026** — legal review for any MN-targeted ad copy before that date.
7. **Cuisine-targeting legal review** for Profile 15 (Restaurant / Franchise Owner) — required per SA7:522.
8. **HOEPA / Reg Z ad-copy review** for Profiles 1, 3, 4, 5 — must not misrepresent business-purpose as consumer-purpose.

---

## 6. OUT OF SCOPE — Marketing-Strategy Agent (Coordinator Merge Required)

The following items are **explicitly OUT OF VERIFIER SCOPE** and must be filled by a separate marketing-strategy agent. Coordinator will merge both halves into the final SA10 deliverable.

| Column | What is needed | Data source for marketing agent |
|---|---|---|
| **Ad-reachability** (per profile per platform) | Estimated reachable audience size on Meta, Google, LinkedIn, TikTok per profile per geography | Platform API data (Meta Marketing API, Google Ads API, LinkedIn Campaign Manager, TikTok Ads Manager) |
| **Conversion rate estimate** | Click-to-funded-loan conversion rate per profile (industry range 0.5-2%) | Internal lead-form / CRM data; industry benchmarks |
| **Saturation / competition score** | How many other lenders are targeting the same persona in the same geography | Competitor ad-library scraping (Meta Ad Library, Google Ads Transparency) |
| **Yield score** | Computed yield = Approval% × AdReach × AvgLoanSize × ConversionRate × (1/ComplianceFriction) × (1/Saturation) | Formula application by marketing agent |
| **Ad-budget allocation** | Top 5 = 60%, 6-10 = 25%, 11-20 = 15% (per parent task spec) | Marketing-strategy decision |
| **"Surprising findings"** | E.g., "teachers with pension fund faster" | Internal data analysis by marketing agent |
| **Product recommendations** | Build creative kit / landing page / lead form for top 5 | Product / engineering decision |
| **Executive summary** | 1-page summary of top 20 ranking | Marketing agent produces after compliance slice is merged |

---

## 7. File:Line Citations Used in This Slice

### Primary sources (statutes and federal regulation)
- 15 USC 1691(a)(1) — ECOA protected-class list
- 15 USC 1691c(b) — ECOA small-business exception
- 15 USC 1602(gg)(2) — HOEPA natural-person exclusion
- 15 USC 1602(bb) — HOEPA APR-margin test trigger
- 12 CFR 1002 — Regulation B
- 12 CFR 1002.6(b)(1) — Reg B discouragement provision
- 12 CFR 1002.105 — small-business exemption + natural-person exception
- 12 CFR 1002.108 — 100-loan threshold for §1071
- 12 CFR 1026.3(a) — Reg Z consumer-credit exclusion
- 12 CFR 1026.32 — Reg Z HOEPA APR-margin tests
- 42 USC 3604(c) / 3605 — FHAct §805 advertising of dwellings prohibition
- 24 CFR 100.500(c) — HUD 2013 Disparate-Impact Rule 3-part test
- 15 USC 1681m — FCRA adverse-action notice (30-day)
- 31 CFR 1010 — BSA/AML (referenced for FN)
- CFPB May 1 2026 Final Rule — §1071 small-business lending
- Meta Ads Policy — Special Ad Category: Housing
- Google Ads Policy — Credit-Ads Personalization
- TikTok Ads Policy — Real Estate and Housing pre-approval

### State statutes
- MN HF 3437 — MN state PPP, effective Aug 1, 2026
- PA Act 6 (2026) — PA PPP threshold $329,411
- OH ORC §1343.011 — OH PPP threshold $112,957 (2025)
- WA RCW 19.144.040 — WA ARM PPP 60-day notice
- WA RCW 19.52.110 — WA business loans exempt from usury
- NJ N.J.S.A. 46:10B-2 — NJ LLC contested (Arc Home LLC + NPLA)
- Tex Fin Code §302 — TX 18% business-purpose written-contract cap

### Corpus files (file:line)
- SA1_Public_Approval_Case_Files.md:7, 47, 108, 111, 115-116, 138-159, 163-172, 184-190, 286-313, Pattern #1-5
- SA2_Lender_Matrix_Approval_Criteria.md:75-79, 139-162, 165-194, 199-356, 473-474
- SA4_compliance_filter_verified.md:62-73, 105-107, 121-123, 130-138
- SA7_Self_Employed_Archetypes.md:33-34, 40-48, 71, 145-376, 433-436, 478-504, 512-514
- SA9_Ads_Platform_Personas.md:17-23, 43-44, 76-1272 (Personas 1-12), 1275-1359 (audit, reach, UNVERIFIED, recommendations)
- agent.md:27-71 — verifier scope + state-PPP/LLC flagged statutes
- godmode/12_T12_50state_str_regulation/T12_summary.md:73, 147-166
- godmode/13_T13_50state_usury_caps/T13_summary.md:102-121, 162, 179-209
- RESEARCH/domains/domain_3/lender_*.md profiles (Pennymac, Griffin, Visio, Acra, CrossCountry, A&D, Newfi, Angel Oak, Defy, Easy Street, Lima One, New Silver, American Heritage, Rocket Pro TPO, Insula, UWM, Deephaven, Ready Capital, Kiavi, OCMBC)
- _obsidian_vault/_research/domains/domain_13/dscr_borrower_personas.csv — 7 personas

---

**End of SA10 compliance-verifier slice.**

*Generated by dscr-verifier on 2026-06-22. This file is compliance-first: every profile cites source file:line; every regulatory number is sourced to a primary statute, federal regulation, or corpus primary source. Marketing-synthesis items are explicitly marked OUT OF SCOPE for the marketing-strategy agent to fill. Coordinator will merge both halves into the final SA10 deliverable.*
