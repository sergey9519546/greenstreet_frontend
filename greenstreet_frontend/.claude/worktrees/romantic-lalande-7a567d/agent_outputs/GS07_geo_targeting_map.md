# GS-07 — Geo-Segment Correlator

**Agent:** GS-07 Geo-Segment Correlator
**Phase:** 5 of 5 (parallel with TS-10 Targeting & Scoring Generator)
**Task:** Map 12 SA-05 personas + 8 EG-06 edge cases to US MSAs with a fundability tier + compliance-friendly geo-targeting payload for TS-10 + AC-09.

**Inputs consumed:**
- `/home/z/my-project/worklog.md` (swarm charter, 8-persona starting library, Meta SAC constraints)
- `/home/z/my-project/download/agent_outputs/SA05_persona_library.md` (12 personas SA-001 → SA-012 with `geo_fit` arrays)
- `/home/z/my-project/download/agent_outputs/EG06_edge_case_personas.md` (8 edge cases EG-001 → EG-008 with `geo_fit` arrays + fair-lensing flags)
- `/home/z/my-project/download/agent_outputs/AP03_approval_patterns.md` (9 approval clusters with `geo_concentration` data; STR-permissive market gating evidence)
- `/home/z/my-project/download/agent_outputs/NP04_decline_patterns.md` (NP-001 STR-regulatory-banned cluster; HEX-002 NYC / HEX-003 Nashville / HEX-014 pending-legislation STR markets; SWR-014 Phoenix/Austin/Nashville regulatory-watch)
- `/home/z/my-project/download/agent_outputs/GL02_normalized_guidelines.md` (8 lender footprints — Lendmire 40+DC, Newfi 47-state; lender-tier evidence for insurance overlay)

**Output consumers:** TS-10 (campaign geo rules + ad set geo parameters), AC-09 (landing page case-study regionalization), FF-08 (intake market-lookup tool integration)

---

## Methodology in Brief

- **Tier ranking axis:** A market is rated on six dimensions that map to the deliverable's column set — (1) LTR friendliness, (2) STR friendliness, (3) landlord-tenant law, (4) property tax burden, (5) insurance availability, (6) persona/edge-case fit density. The Overall Fundability Tier is the weighted composite.
- **Evidence quality:** All markets explicitly named in SA-05 `geo_fit` or EG-06 `geo_fit` arrays are `evidence_tier: case_or_persona_documented`. Markets inferred from publicly known investor-market rankings (Atlanta, Dallas, Indianapolis, Kansas City, Birmingham, Memphis, Cleveland, Tucson as LTR cash-flow markets; Smoky Mountains, Gulf Coast, Phoenix-Scottsdale as STR markets) are flagged `inferred: true`. The SA-05 personas' `geo_fit` arrays are the primary evidence; this deliverable extends them with regulatory + insurance + SAC-reachability overlays.
- **STR-permissive / STR-banned alignment:** This deliverable's STR map is the canonical geo handoff and MUST align with NP-04 NP-001 (STR-regulatory-banned cluster), HEX-002 (NYC Local Law 18), HEX-003 (Nashville owner-occupancy), HEX-014 (markets with pending STR legislation — Phoenix, Austin, Nashville). Any disagreement between this file and NP-04 on STR-banned status should be resolved in favor of NP-04 (it owns the canonical exclusion rule).
- **Compliance floor:** Under Meta Special Ad Category (SAC) for housing/credit, ZIP-level targeting is restricted, detailed demographic targeting is restricted, and "lookalike" audiences built off protected-class seeds are restricted. Geo targeting at the state and DMA (designated market area) level is the standard compliant path. This deliverable's Part 8 payload uses state + MSA + DMA inclusion/exclusion only.
- **Honesty on FL insurance:** Florida is the highest-volume DSCR market in the country (per CF-01 case files + SA-05 SA-005/SA-006/SA-007/SA-010/EG-003/EG-007 all route here). It is also the highest property-insurance-friction market in the country. This deliverable does NOT downplay that tension — Part 7 (Insurance Overlay) is the canonical treatment.

---

## Part 1: MSA / State Fundability Tier List

Tier definitions:
- **T1 (Green):** High fundability, multiple persona fits, no major regulatory blockers. Anchor markets for ~50% of ad budget.
- **T2 (Yellow-Green):** Solid fundability, some persona restrictions (typically STR-only or insurance-friction). ~30% of ad budget.
- **T3 (Yellow):** Fundable but watch regulatory shifts. Niche/persona-specific campaigns only. ~15% of ad budget.
- **T4 (Orange):** Niche-only — only specific personas/edge cases fit (typically permitted-ADU CA, non-warrantable condo urban core, STR-only resort). ~5% of ad budget.
- **T5 (Red):** Avoid — STR bans, rent control, insurance crisis, or hostile landlord-tenant law. Hard exclusion.

| # | MSA | State | Tier | LTR | STR | L-T Law | Prop Tax | Insurance | Top Persona Fits | Top Edge-Case Fits | Notes |
|---:|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Indianapolis | IN | T1 | Excellent | Moderate | Friendly | Low | Good | SA-001, SA-002, SA-003, SA-008, SA-012 | EG-001, EG-008 | LTR cash-flow anchor; 2-4 unit yields support SA-008 credit-scarred rebuilds; SA-012 BRRRR velocity market. IN landlord-tenant law is landlord-friendly (30-day notice, fast eviction). |
| 2 | Memphis | TN | T1 | Excellent | Moderate (LR only) | Friendly | Low | Good | SA-001, SA-002, SA-012 | EG-001, EG-008 | Cash-flow-rich LTR; SA-012 BRRRR-friendly price points ($100K-$200K) sit just above HEX-012 $100K-$150K floor. TN state landlord-tenant act is landlord-friendly. |
| 3 | Cleveland | OH | T1 | Excellent | Moderate | Friendly | Low | Good | SA-001, SA-008, SA-012 | EG-001, EG-004 | "Highest cash-flow yields" market per CF-01/DSCR Authority; 1.47% monthly GRM (CF-028) supports sub-700 FICO approvals. OH landlord-tenant balanced-to-friendly. |
| 4 | Cincinnati | OH | T1 | Excellent | Moderate | Friendly | Low | Good | SA-001, SA-008 | EG-001 | Same cash-flow profile as Cleveland; slightly smaller investor pool = less competition. OH landlord-tenant balanced. |
| 5 | Columbus | OH | T1 | Excellent | Moderate | Friendly | Low-Moderate | Good | SA-001, SA-004 | EG-008 | Faster appreciation than Cleveland/Cincy; SA-004 cash-out refi market. OH landlord-tenant balanced. |
| 6 | Charlotte | NC | T1 | Excellent | Moderate | Friendly | Low-Moderate | Good | SA-001, SA-002, SA-003, SA-004 | EG-004, EG-008 | NC landlord-tenant friendly; SA-004 cash-out anchor (CF-026 Charlotte $295K SFR approval). State-level investor-friendly climate. |
| 7 | Raleigh-Durham | NC | T1 | Excellent | Moderate | Friendly | Low-Moderate | Good | SA-001, SA-004 | EG-008 | Strong job-market tailwind supports LTR demand; SA-004 refi market. NC landlord-tenant friendly. |
| 8 | Birmingham | AL | T1 | Excellent | Moderate | Friendly | Low | Good | SA-001, SA-002, SA-012 | EG-001, EG-008 | Low-cost BRRRR market (SA-012); same cash-flow profile as Memphis; AL landlord-tenant friendly. |
| 9 | Atlanta | GA | T1 | Excellent | Moderate | Friendly | Low-Moderate | Good | SA-001, SA-002, SA-004 | EG-008 | High-velocity LTR market; SA-002 portfolio-scaler anchor (multi-state LL-friendly). GA landlord-tenant friendly; appraisal-risk flag per CF-025. |
| 10 | Dallas-Fort Worth | TX | T1 | Excellent | Moderate | Friendly | Moderate | Good | SA-001, SA-002, SA-005, SA-010 | EG-002, EG-008 | TX is SA-005 strong-credit FN anchor (no state income tax, fast eviction); SA-010 ITIN secondary market. TX landlord-tenant very friendly. |
| 11 | Houston | TX | T1 | Excellent | Moderate | Friendly | Moderate | Moderate (wind/storm) | SA-005, SA-010, SA-002 | EG-002, EG-003, EG-006 | FN/ITIN dense market (immigrant-dense ZIP clusters per EG-002); insurance friction (Hurricane Harvey legacy) reduces tier from excellent to good. TX landlord-tenant very friendly. |
| 12 | San Antonio | TX | T1 | Excellent | Moderate | Friendly | Low-Moderate | Good | SA-001, SA-005, SA-010 | EG-002, EG-003 | Lower-cost TX alternative to DFW/Houston; SA-005 FN + SA-010 ITIN viable; STR (downtown historic district) growing. |
| 13 | Tampa-St. Petersburg | FL | T1 | Excellent | Moderate | Friendly | Low-Moderate | Moderate (wind) | SA-002, SA-005, SA-010 | EG-002, EG-003, EG-008 | FL no-state-income-tax + landlord-friendly = FN anchor; insurance friction is the only drag. STR restricted in City of Tampa proper (permitted zones) but Hillsborough/Pinellas permissive. |
| 14 | Orlando | FL | T1 | Excellent | Good (resort-zoned) | Friendly | Low-Moderate | Moderate (wind) | SA-005, SA-006, SA-010 | EG-002, EG-003, EG-007 | FN/ITIN dense; STR-permissive in resort zones (Disney-area); condotel viable per EG-007 (Orlando-resort sub-market). |
| 15 | Jacksonville | FL | T1 | Excellent | Moderate | Friendly | Low-Moderate | Moderate (wind) | SA-002, SA-005, SA-006 | EG-003 | Lower-cost FL alternative to Tampa/Orlando; SA-002 portfolio scaler anchor. FL landlord-tenant very friendly (3-day notice for non-payment). |
| 16 | Little Rock | AR | T1 | Excellent | Moderate | Friendly | Low | Good | SA-002, SA-012 | (thin) | SA-002 multi-state portfolio component (CF-002); low-cost BRRRR. AR landlord-tenant friendly. |
| 17 | St. Louis | MO | T1 | Excellent | Moderate | Friendly | Low | Good | SA-008, SA-001 | EG-001 | Cash-flow-rich Midwest 2-4 unit; SA-008 credit-scarred anchor (CF-028 Cleveland companion market). MO landlord-tenant friendly. |
| 18 | Pittsburgh | PA | T1 | Excellent | Moderate | Moderate | Low-Moderate | Good | SA-008, SA-001 | EG-001 | SA-008 secondary market (CF-028 pattern); PA landlord-tenant moderate (Philadelphia is hostile but Pittsburgh is balanced-to-friendly). |
| 19 | Grand Rapids | MI | T1 | Excellent | Moderate | Moderate | Low-Moderate | Good | SA-001, SA-003 | EG-004 | CF-008 Sarah Chen duplex anchor; appreciation-market for EG-004 sub-1.0 DSCR with compensators. MI landlord-tenant moderate. |
| 20 | Kansas City | MO | T1 | Excellent | Moderate | Friendly | Low-Moderate | Good | SA-001, SA-012 | EG-008 | LTR cash-flow anchor; SA-012 BRRRR-friendly. MO landlord-tenant friendly. |
| 21 | Tucson | AZ | T1 | Excellent | Moderate | Friendly | Low-Moderate | Good | SA-001, SA-003 | (thin) | Lower-cost AZ alternative to Phoenix; STR permitted (City of Tucson STR license). AZ landlord-tenant friendly. |
| 22 | Salt Lake City | UT | T1 | Good | Moderate | Friendly | Moderate | Good | SA-001, SA-003 | (thin) | UT landlord-tenant friendly; STR restricted in SLC proper but permissive in Park City / St. George (recreational sub-markets). |
| 23 | Boise | ID | T1 | Good | Moderate | Friendly | Low-Moderate | Good | SA-001, SA-003 | (thin) | ID landlord-tenant friendly; in-migration-driven LTR demand. STR permitted statewide with local-option overlay. |
| 24 | Las Vegas | NV | T2 | Good | Moderate (STR watch) | Moderate | Low-Moderate | Moderate | SA-001, SA-003, SA-005 | EG-003, EG-006 | NV landlord-tenant moderate; STR regulated (10-day rolling limit, license required) — not banned but watch list. NV is FN-viable market per EG-003 geo_fit. |
| 25 | Phoenix | AZ | T2 | Good | Watch (pending legislation) | Friendly | Low | Good | SA-001, SA-003, SA-010 | EG-002, EG-005 | AZ landlord-tenant friendly; STR under regulatory pressure (SWR-014 watch list — Phoenix City Council considering restrictions). LTR strong; STR uncertain. |
| 26 | Scottsdale | AZ | T2 | Good | Excellent (resort) | Friendly | Low | Good | SA-007, SA-011 | EG-007 | STR-permissive resort market (CF-013 Scottsdale STR approval); EG-007 condotel viable. AZ landlord-tenant friendly. |
| 27 | Gatlinburg / Pigeon Forge / Sevierville | TN | T2 | Moderate | Excellent (cabin) | Friendly | Low | Good | SA-003, SA-007 | EG-007 | Smoky Mountains STR-permissive (CF-012, CF-014 Gatlinburg approvals); STR-permit pathway obtainable. TN landlord-tenant friendly. Cabin-class appraisal $900 (vs. $650 standard). |
| 28 | Panama City Beach | FL | T2 | Moderate | Excellent (resort) | Friendly | Low-Moderate | Moderate-High (hurricane) | SA-007 | EG-007 | STR-permissive (CF-006, CF-013 approvals); Gulf Coast hurricane insurance friction. EG-007 condotel viable. |
| 29 | Destin / Fort Walton Beach | FL | T2 | Moderate | Excellent (resort) | Friendly | Low-Moderate | Moderate-High (hurricane) | SA-007 | EG-007 | STR-permissive (CF-012 Destin approval); Gulf Coast insurance friction. Okaloosa County STR permit pathway stable. |
| 30 | Myrtle Beach | SC | T2 | Moderate | Excellent (resort) | Friendly | Low | Moderate (hurricane) | SA-007 | EG-007 | STR-permissive resort market; SC landlord-tenant friendly; coastal insurance moderate. |
| 31 | Galveston | TX | T2 | Moderate | Excellent (condotel) | Friendly | Low-Moderate | Moderate-High (hurricane) | SA-007, SA-011 | EG-007 | EG-007 condotel anchor (CF-022 Galveston decline → Visio/Kiavi pivot); TX Gulf Coast insurance friction. |
| 32 | Nashville | TN | T2 | Good | Banned (residential) | Friendly | Low-Moderate | Good | SA-001, SA-004 | EG-008 | LTR strong; STR hard-decline (HEX-003 owner-occupancy requirement in residential zones). SA-004 cash-out refi market (LTR only). |
| 33 | Austin | TX | T2 | Good | Watch (pending) | Friendly | Moderate | Good | SA-001, SA-004 | EG-004, EG-005 | TX landlord-tenant friendly; STR under pressure (City of Austin STR license caps, type-1/type-2/type-3 designations). LTR strong (appreciation market). |
| 34 | Denver | CO | T3 | Good | Watch (regulatory) | Moderate | Moderate | Good | SA-001, SA-004 | EG-004 | CO landlord-tenant moderate (10-day notice for non-payment); STR regulated (license required, owner-occupancy for type-1). Appreciation market supports EG-004 sub-1.0 DSCR. |
| 35 | Seattle | WA | T3 | Good | Banned (most zones) | Tenant-friendly | Moderate | Good | SA-001 (LTR only) | EG-005 | WA landlord-tenant tenant-friendly (60-day notice, just-cause eviction in Seattle); STR restricted (Seattle host must be primary resident). EG-005 unpermitted ADU pivot viable (Seattle ADU permit pathway expanded post-2019). |
| 36 | Portland | OR | T3 | Moderate | Banned (most zones) | Tenant-friendly | Moderate | Good | SA-001 (LTR only) | EG-005 | OR landlord-tenant tenant-friendly (90-day notice, rent-increase caps); STR restricted (Portland host must be primary resident, 90-day limit). EG-005 viable (Portland ADU mandate). |
| 37 | Sacramento | CA | T3 | Moderate | Restricted | Tenant-friendly | Moderate-High | Moderate (wildfire) | SA-001 (LTR only) | EG-005 | CA landlord-tenant tenant-friendly (just-cause eviction AB 1488); statewide rent cap (CPI+5%); STR regulated per city. Lower-cost CA alternative to Bay Area. Wildfire insurance friction. |
| 38 | Chicago | IL | T3 | Good | Moderate (zoned) | Moderate | Moderate-High | Good | SA-001, SA-002 | EG-006 | IL landlord-tenant moderate (Chicago RLTO tenant-friendly); STR permitted in zoned areas (license required). EG-006 non-warrantable condo anchor (CF-023 Chicago Loop decline). |
| 39 | Miami | FL | T2 | Good | Moderate (zoned) | Friendly | Moderate | High (wind/flood) | SA-005, SA-006, SA-010 | EG-002, EG-003, EG-006 | FN/ITIN hotspot (CF-019 ITIN approval); FL landlord-tenant friendly. Insurance crisis (wind/flood) is the major drag. EG-006 non-warrantable condo viable (Miami Beach). |
| 40 | Fort Lauderdale | FL | T2 | Good | Moderate | Friendly | Moderate | High (wind) | SA-005, SA-010 | EG-006 | Same FN/ITIN density as Miami; same insurance friction. |
| 41 | Boston | MA | T4 | Moderate | Restricted | Tenant-friendly | High | Good | (niche) | (thin) | MA landlord-tenant tenant-friendly (Boston rent control debate); STR restricted (Boston host registration). Cambridge/Somerville rent-control resurgence. Niche-only: high-cost LTR rarely clears 1.25 DSCR at 75% LTV. |
| 42 | Minneapolis | MN | T3 | Good | Restricted | Tenant-friendly | Moderate | Good | SA-001 (LTR only) | (thin) | MN landlord-tenant tenant-friendly (3-month notice, just-cause in Minneapolis); STR regulated (Minneapolis host license). |
| 43 | Los Angeles | CA | T4 | Moderate | Restricted | Tenant-friendly | High | Moderate-High (wildfire) | SA-009 (permitted ADU only) | EG-005 | CA rent control (AB 1482 statewide cap + LA city rent stabilization); STR restricted (LA host must be primary resident). SA-009 permitted-ADU niche (CF-020 LA approval). Wildfire insurance friction. |
| 44 | San Diego | CA | T4 | Moderate | Restricted | Tenant-friendly | High | Moderate (wildfire) | SA-009 | EG-005 | Same CA regulatory profile as LA; SA-009 (CF-020) + EG-005 (CF-021 San Diego unpermitted ADU decline-then-pivot). |
| 45 | San Francisco Bay Area | CA | T4 | Poor | Banned | Tenant-friendly | Very High | Poor (wildfire + insurer pullback) | SA-009 (permitted ADU only) | (thin) | CA rent control + SF city rent stabilization; STR effectively banned (SF host must be permanent resident, 90-day unhosted cap); insurer pullback (State Farm, Allstate exits). Permitted-ADU niche only. |
| 46 | NYC (5 boroughs) | NY | T5 (STR) / T4 (LTR) | Poor | Banned | Tenant-friendly (RS) | Very High | Good | (none for STR) | EG-006 (non-warrantable condo only) | Local Law 18 STR ban (HEX-002); rent stabilization (RS) complexity; high-cost LTR rarely clears 1.25 DSCR. EG-006 non-warrantable condo viable (midtown Loop pattern). |
| 47 | Nashville residential | TN | T5 (STR) / T2 (LTR) | Good | Banned (residential) | Friendly | Low-Moderate | Good | (none for STR) | (none for STR) | HEX-003 — Nashville owner-occupancy STR permit requirement in residential zones. LTR still fundable (see #32). |
| 48 | Aspen / Vail | CO | T5 (STR) / T4 (LTR) | Poor | Banned (resort-zone cap) | Moderate | High | Good | (none for STR) | (thin) | Resort-zone STR caps + minimum-night requirements; high-cost LTR rarely clears 1.25 DSCR. |
| 49 | New Orleans | LA | T3 | Moderate | Moderate | Moderate | Low-Moderate | High (wind/flood) | SA-001 | (thin) | LA landlord-tenant moderate; STR regulated (permits required). Insurance crisis is the major drag (post-Ida). |
| 50 | Birmingham (alt) | AL | T1 (duplicate of #8) | Excellent | Moderate | Friendly | Low | Good | SA-001, SA-002, SA-012 | EG-001, EG-008 | See #8. |

### T1 Market Rationales (Top Markets — Anchor for ~50% of Budget)

1. **Indianapolis IN** — Universal LTR cash-flow anchor with 1%+ monthly GRM (CF-008, CF-010, CF-001 all close here). Landlord-tenant law is landlord-friendly; property taxes reasonable; no STR overlay issues (LTR persona density is the play). Fits 5 of 12 SA personas + 2 of 8 EG edge cases.
2. **Memphis TN** — Lowest-cost BRRRR market in the SA-012 playbook (CF-010 $111K loan amount just above HEX-012 floor). Cash-flow yields support sub-700 FICO approvals. SA-002 portfolio scaler anchor (CF-002 Memphis component).
3. **Cleveland OH** — "Highest cash-flow yields" market per CF-01 / DSCR Authority cited in SA-008. 1.47% monthly GRM (CF-028 Cleveland quadplex $4,200/mo on $285K) is the structural enabler for SA-008 credit-scarred cash-rich approvals (post-bankruptcy 1.30+ DSCR with 65-70% LTV).
4. **Charlotte NC** — SA-004 cash-out refi anchor (CF-026 Charlotte $295K SFR approval). NC landlord-tenant friendly; moderate property tax; strong in-migration LTR demand. Fits 4 of 12 SA personas + 2 of 8 EG edge cases.
5. **Atlanta GA** — SA-002 multi-state portfolio scaler anchor (CF-002 archetype Atlanta component). GA landlord-tenant friendly. Appraisal-risk flag (CF-025 Atlanta appraisal-short decline) means FF-08 must apply ROV/specialty-lender routing for sub-1.20 DSCR files.
6. **Dallas-Fort Worth TX** — TX is SA-005 strong-credit FN anchor market per SA-05 persona notes ("no state income tax, landlord-friendly, fast eviction"). SA-010 ITIN secondary market (DFW immigrant-dense ZIP clusters — though SAC forbids ZIP targeting). Strong LTR demand + 0% state income tax.
7. **Tampa FL / Orlando FL / Jacksonville FL** — FL trio is the SA-005/SA-006/SA-010 FN/ITIN anchor market per SA-05 persona notes ("Florida #1 DSCR market for FN — no state income tax, landlord-friendly"). FL landlord-tenant very friendly (3-day notice for non-payment). Insurance friction is the only meaningful drag (see Part 7).
8. **Birmingham AL** — SA-012 BRRRR secondary anchor (CF-002 archetype Birmingham component); same cash-flow profile as Memphis at slightly lower volume. AL landlord-tenant friendly.
9. **St. Louis MO** — SA-008 credit-scarred cash-rich secondary anchor (CF-028 Cleveland companion market). 2-4 unit cash-flow yields support 1.30+ DSCR approvals at 65-70% LTV.
10. **Grand Rapids MI** — CF-008 Sarah Chen duplex anchor (0.81 → 1.12 DSCR via 42% down). MI landlord-tenant moderate; appreciation market supports EG-004 sub-1.0 DSCR with compensators.

### T2 Market Rationales (~30% of Budget)

- **Phoenix AZ** — STR watch-list (SWR-014 — Phoenix City Council considering STR restrictions). LTR strong. SA-010 ITIN viable (Phoenix immigrant-dense). EG-005 unpermitted-ADU pivot viable (Phoenix ADU permit pathway).
- **Scottsdale AZ** — STR-permissive resort market (CF-013 Scottsdale approval). SA-007 STR operator + EG-007 condotel viable. Distinct from Phoenix proper — Scottsdale is resort-zoned.
- **Gatlinburg/Pigeon Forge TN** — Smoky Mountains STR-permissive cabin market (CF-012, CF-014 approvals). SA-007 + EG-007 condotel viable. Cabin-class appraisal $900 vs. $650 standard.
- **Panama City Beach FL / Destin FL** — Gulf Coast STR-permissive resort (CF-006, CF-012, CF-013 approvals). Insurance friction (Gulf hurricane) is the major drag.
- **Nashville TN (LTR only)** — LTR strong; STR hard-decline (HEX-003). SA-004 cash-out refi market.
- **Las Vegas NV** — NV landlord-tenant moderate; STR regulated (10-day rolling limit). FN-viable per EG-003 geo_fit.

### T5 Market Regulatory Blockers (Hard Avoid for Named Personas)

| Market | Persona | Specific Regulatory Blocker | Source |
|---|---|---|---|
| NYC (5 boroughs) | SA-007, EG-007 (STR variant) | Local Law 18 — STR ban (owner must be permanent resident, host registration required, unhosted STR effectively prohibited). Airbnb-style STR income cannot be used in DSCR qualification. | NP-04 HEX-002; CF-016 NYC decline |
| Nashville residential zones | SA-007, EG-007 (STR variant) | Nashville owner-occupancy STR permit requirement in residential zones — investor (non-owner-occupant) STR permits not issued in residential-zoned parcels. STR income cannot be used in DSCR qualification. | NP-04 HEX-003; CF-015 Nashville decline |
| San Francisco | SA-007 (STR), SA-001 (LTR — cost-burdened) | SF rent stabilization (rent control on pre-1979 buildings); STR effectively banned (SF host must be permanent resident, 90-day unhosted cap). CA statewide AB 1482 cap (CPI + 5%) on post-2005 properties. | NP-04 NP-001 category; CA state regulatory profile |
| Aspen / Vail resort zones | SA-007 | Resort-zone STR caps + minimum-night requirements (e.g., Aspen caps STR licenses citywide, Vail requires 5-night minimum in some zones). STR income unbankable. | NP-04 NP-001 category (resort-zone caps) |
| Berkeley / Santa Monica | SA-001 (LTR — rent control), SA-007 (STR) | Berkeley rent control (single-family homes included); Santa Monica rent control + STR ban. LTR cash flow compressed below DSCR floor. | CA state regulatory profile |
| New Jersey (statewide) | SA-001 (statewide), SA-008 | NJ landlord-tenant law is among the most tenant-friendly in the US (just-cause eviction requirements, slow eviction timeline 6-12 months). Increases DSCR risk premium at specialty lenders. | NJ state regulatory profile |

---

## Part 2: Persona → Geo Mapping (12 SA-05 Personas)

### SA-001 — The Cash-Flow Optimizer

```yaml
persona_id: SA-001
persona_name: The Cash-Flow Optimizer
top_markets:
  - Indianapolis IN
  - Memphis TN
  - Grand Rapids MI
  - Cleveland OH
  - Cincinnati OH
  - Charlotte NC
  - Birmingham AL
  - Kansas City MO
  - Atlanta GA
  - Columbus OH
emerging_markets:
  - Tucson AZ
  - San Antonio TX
  - Raleigh-Durham NC
  - Salt Lake City UT
  - Boise ID
avoid_markets:
  - San Francisco Bay Area (CA rent control + AB 1482 cap compress LTR cash flow below 1.25 DSCR floor)
  - NYC (NY rent stabilization + high property taxes push DSCR sub-1.00 at 75% LTV)
  - Coastal CA LA / San Diego (cash flow below 1.00 at standard LTV — these are SA-009 permitted-ADU markets, not SA-001 SFR markets)
geo_targeting_notes: |
  Highest-volume LTR persona. Under Meta SAC, broad state-level inclusion (IN, TN, OH, NC, AL, MO, GA,
  MI) + DMA-level inclusion (Indianapolis, Memphis, Cleveland, Cincinnati, Charlotte, Birmingham, Kansas
  City, Atlanta, Columbus, Grand Rapids) is the compliant path. ZIP-level targeting is restricted under
  SAC — do not attempt. Self-qualification landing page (AC-09) should feature Indianapolis, Memphis,
  Cleveland, Charlotte case studies as primary social proof — these are the highest-approval markets per
  CF-01. Tucson / San Antonio / Salt Lake City / Boise are emerging-market creative variants (lower
  competition CPMs on Google Search).
```

### SA-002 — The Multi-State Portfolio Scaler

```yaml
persona_id: SA-002
persona_name: The Multi-State Portfolio Scaler
top_markets:
  - Atlanta GA
  - Charlotte NC
  - Memphis TN
  - Birmingham AL
  - Baltimore MD
  - Jacksonville FL
  - San Diego CA (LTR stabilized only)
  - Little Rock AR
  - Cleveland OH
  - Dallas-Fort Worth TX
  - Houston TX
emerging_markets:
  - Raleigh-Durham NC
  - Tampa FL
  - San Antonio TX
  - Kansas City MO
  - Columbus OH
avoid_markets:
  - NYC (rent stabilization + high carrying cost makes multi-state portfolio aggregation uneconomic)
  - Coastal CA Bay Area (cash flow below 1.00 DSCR makes portfolio aggregate math fail)
  - NJ statewide (just-cause eviction + slow timeline increases portfolio DSCR risk premium)
geo_targeting_notes: |
  Highest-LTV persona in the library ($1M-$3.2M loans). TS-10 should NOT target this persona on Meta
  broad — audience is too small (~50K-100K US investors with 10+ doors) and SAC constraints limit
  lookalike expansion. Instead: Google Search high-intent terms ("portfolio DSCR loan", "blanket DSCR
  loan", "DSCR 10+ properties") + LinkedIn ad targeting (LinkedIn is NOT subject to Meta SAC —
  audience = Real Estate / Investment Management job titles + 10+ years experience + investor-heavy
  metros). DMA-level targeting on Meta can run as secondary (Atlanta, Charlotte, Dallas, Houston,
  Miami, Tampa DMAs) but with low CPM efficiency. AC-09 case studies: Atlanta multi-state, Charlotte
  portfolio, Memphis/Little Rock/Birmingham Sunbelt cluster.
```

### SA-003 — The Cash-Strong First-Timer

```yaml
persona_id: SA-003
persona_name: The Cash-Strong First-Timer
top_markets:
  - Indianapolis IN
  - Charlotte NC
  - Raleigh-Durham NC
  - Atlanta GA
  - Dallas-Fort Worth TX
  - Tampa FL
  - Nashville TN (LTR only)
  - Phoenix AZ (LTR)
  - Grand Rapids MI
  - Gatlinburg/Pigeon Forge TN (first-time STR sub-segment only)
emerging_markets:
  - Boise ID
  - Salt Lake City UT
  - Tucson AZ
  - San Antonio TX
  - Jacksonville FL
avoid_markets:
  - Coastal CA (cash flow below 1.00 DSCR + high first-time-investor capital requirements make first-rental uneconomic for cash-strong-but-not-cash-rich)
  - NYC (cost + rent stabilization + STR ban)
  - Resort-zone STR markets if first-time STR investor (first-time STR AirDNA haircut 25% — only viable with 12mo reserves + STR permit pre-verified per SA-007)
geo_targeting_notes: |
  Education-first persona — Meta SAC broad targeting is the primary path (high reachability score 8
  in SA-05). Self-qualification calculator lead magnet is the conversion mechanism. DMA-level inclusion
  (Indianapolis, Charlotte, Raleigh, Atlanta, Dallas, Tampa, Phoenix, Nashville LTR-only) is the
  compliant path. IMPORTANT: do NOT target Gatlinburg/Pigeon Forge as a first-time STR market for
  SA-003 broadly — only the first-time STR sub-segment with explicit STR-education creative
  ("first-time STR? Permit + AirDNA + 12mo reserves path") should hit Smoky Mountains DMA, otherwise
  SA-003 will land unprepared in STR-permissive markets and decline at SWR-004.
```

### SA-004 — The Equity-Tapping Refinancer

```yaml
persona_id: SA-004
persona_name: The Equity-Tapping Refinancer
top_markets:
  - Charlotte NC (CF-026 anchor)
  - Columbus OH
  - Panama City Beach FL (LTR — CF-006 STR pivot to LTR refi)
  - Atlanta GA
  - Nashville TN (LTR only)
  - Phoenix AZ
  - Tampa FL
  - Dallas-Fort Worth TX
  - Houston TX
  - Raleigh-Durham NC
emerging_markets:
  - Austin TX (appreciation-driven refi market)
  - Boise ID (in-migration-driven appreciation)
  - Salt Lake City UT
  - Charlotte NC (continued)
avoid_markets:
  - Coastal CA (CF-025 Atlanta appraisal-short pattern is more severe in CA — high-cost + softening appraisal risk)
  - NYC (rent stabilization makes LTV ceiling uneconomic)
  - Resort-zone STR markets (STR income cannot be used in cash-out refi DSCR for non-host-history properties)
geo_targeting_notes: |
  Repeat-borrower persona — TS-10 should weight existing lender-relationship audience highest (custom
  audience from CRM of past DSCR closings). Meta SAC broad as secondary. Google Search intent terms
  ("DSCR cash out refinance", "BRRRR refinance DSCR", "refi rental to buy next property") is high-intent
  primary. DMA-level inclusion (Charlotte, Columbus, Atlanta, Nashville, Phoenix, Tampa, Dallas,
  Houston, Raleigh). AC-09 case studies: CF-026 Charlotte reserves-shortfall-then-pivot (educational),
  CF-006 Panama City Beach STR→LTR refi (sub-segment), CF-010 BRRRR refi (cross-link to SA-012).
```

### SA-005 — The Strong-Credit Foreign National

```yaml
persona_id: SA-005
persona_name: The Strong-Credit Foreign National
top_markets:
  - Houston TX (CF-017 UK FN Houston anchor)
  - Dallas-Fort Worth TX
  - San Antonio TX
  - Orlando FL
  - Tampa FL
  - Miami FL
  - Jacksonville FL
  - Austin TX
emerging_markets:
  - Las Vegas NV
  - Phoenix AZ
  - Charlotte NC (secondary FN growth)
  - Atlanta GA (secondary FN growth)
  - San Diego CA (FN niche — cross-border Mexico investor flow)
avoid_markets:
  - NYC (high cost + rent stabilization make 70-75% LTV DSCR uneconomic for FN at +0.50-0.75% rate premium)
  - Coastal CA Bay Area (cash flow below 1.00 DSCR even at 75% LTV)
  - NJ (just-cause eviction + slow timeline = FN risk premium too high for specialty FN lenders to clear)
geo_targeting_notes: |
  HIGH fair-lensing risk per EG-06 Part 3 — do NOT target by country of origin, language preference,
  or national-origin proxies. Use program-feature-language ("Foreign-national DSCR specialists — no
  US credit required" per AHLend + America Mortgages published programs). Meta SAC: broad state-level
  inclusion (TX, FL) + DMA-level (Houston, Dallas, San Antonio, Austin, Orlando, Tampa, Miami,
  Jacksonville). Bilingual landing pages are permissible under ECOA "affirmative marketing" provision
  (language accessibility is NOT a proxy for national origin when the product feature is language-
  relevant) — but DO NOT target by language preference in the ad platform itself. Google Search intent
  ("foreign national DSCR loan", "international investor US mortgage", "Nova Credit DSCR") is the
  highest-intent channel.
```

### SA-006 — The No-Credit Foreign National

```yaml
persona_id: SA-006
persona_name: The No-Credit Foreign National
top_markets:
  - Orlando FL (CF-018 Brazilian FN anchor)
  - Miami FL
  - Tampa FL
  - Jacksonville FL
emerging_markets:
  - Houston TX
  - Dallas-Fort Worth TX
  - San Antonio TX
  - Phoenix AZ
  - Las Vegas NV
avoid_markets:
  - NYC (cost + rent stabilization + FN risk premium too high for 60% LTV 1.30 DSCR requirement)
  - Coastal CA Bay Area (cash flow below 1.30 DSCR at 60% LTV)
  - NJ (just-cause eviction makes FN specialty lenders decline)
  - NJ + NYC combined FN risk premium is uneconomic — Angel Oak, A&D, HomeAbroad have all pulled back from NJ FN programs per CF-01 source evidence
geo_targeting_notes: |
  HIGHEST fair-lensing risk in the SA-05 library (compliance score 6, reachability 5). Cannot target by
  country of origin (Brazil, Russia, Nigeria, Vietnam, etc. per EG-003). Must use program-feature
  language. Florida is the dominant market per SA-05 persona notes (no state income tax + landlord-
  friendly + FN-lender concentration = "#1 DSCR market for FN" per DSCR Authority). Meta SAC: state-
  level FL + DMA-level (Orlando, Miami, Tampa, Jacksonville). Google Search intent in Portuguese
  ("financiamento imobiliário EUA", "investir em imóveis nos EUA") and Spanish ("préstamo DSCR
  extranjeros", "invertir en propiedades EE.UU.") is the highest-intent channel — but landing page
  language targeting is permissible, NOT ad-platform language targeting. AC-09 must build bilingual
  Portuguese/Spanish landing pages.
```

### SA-007 — The STR Permissive-Market Operator

```yaml
persona_id: SA-007
persona_name: The STR Permissive-Market Operator
top_markets:
  - Panama City Beach FL (CF-006, CF-013)
  - Destin / Fort Walton Beach FL (CF-012)
  - Scottsdale AZ (CF-013)
  - Gatlinburg / Pigeon Forge / Sevierville TN (CF-012, CF-014)
emerging_markets:
  - Myrtle Beach SC
  - Galveston TX (condotel — cross-link to EG-007)
  - Smoky Mountains NC (Bryson City, Maggie Valley — secondary cabin markets)
  - Phoenix AZ resort zones (Carefree, Cave Creek)
  - Tucson AZ (STR permitted with City of Tucson license)
avoid_markets:
  - NYC (Local Law 18 STR ban — HEX-002)
  - Nashville residential zones (owner-occupancy STR permit — HEX-003)
  - San Francisco (STR effectively banned)
  - Aspen / Vail resort zones (caps + minimum-night)
  - Los Angeles (host must be primary resident)
  - Berkeley / Santa Monica (STR banned)
  - Phoenix (pending STR legislation — SWR-014 watch list; do not promote as STR-permissive)
  - Austin (pending STR legislation — SWR-014 watch list)
geo_targeting_notes: |
  Most geo-gated persona in the library. STR market regulatory eligibility is gating — 0% approval in
  banned markets regardless of borrower strength (CF-015, CF-016). TS-10 must apply HARD exclusion on
  NYC, Nashville-residential, San Francisco, Aspen, Berkeley, Santa Monica DMAs. DMA-level inclusion
  (Panama City, Fort Walton Beach, Pensacola, Phoenix/Scottsdale split, Knoxville/Gatlinburg,
  Myrtle Beach, Houston/Galveston). CRITICAL: Phoenix DMA must be split — Scottsdale/Phoenix resort
  zones (Carefree, Cave Creek, Paradise Valley) are STR-permissive; Phoenix proper is on the SWR-014
  watch list. TS-10 cannot use Phoenix DMA at the DMA level — must use ZIP-level inclusion for STR-
  permissive resort sub-zones. BUT Meta SAC restricts ZIP-level targeting — work-around: use city-level
  targeting (City of Scottsdale, City of Carefree, City of Paradise Valley) which IS permitted under
  SAC. Google Search STR-permissive market keywords ("DSCR loan Airbnb Florida", "Smoky Mountains STR
  financing", "Scottsdale STR DSCR") is highest-intent.
```

### SA-008 — The Credit-Scarred Cash-Rich Rebuilder

```yaml
persona_id: SA-008
persona_name: The Credit-Scarred Cash-Rich Rebuilder
top_markets:
  - Cleveland OH (CF-028 anchor — highest cash-flow yields)
  - Cincinnati OH
  - St. Louis MO
  - Indianapolis IN
  - Pittsburgh PA
  - Detroit MI
  - Birmingham AL
  - Memphis TN
emerging_markets:
  - Kansas City MO
  - Columbus OH
  - Louisville KY
  - Milwaukee WI
  - Toledo OH
avoid_markets:
  - Coastal CA (cash flow below 1.30 DSCR required for credit-scarved tier)
  - NYC (cost + RS makes 1.30 DSCR + 65-70% LTV unachievable)
  - Resort-zone STR markets (STR volatility + credit-scarred risk premium unbankable)
  - NJ (just-cause eviction compounds credit-scarved risk premium)
geo_targeting_notes: |
  MODERATE fair-lensing risk per EG-06 Part 3 (prior credit event correlates with protected-class
  characteristics — medical debt, divorce, disability). Do NOT target by credit-event history in ad
  platforms. Use feature-language ("Specialty seasoning programs available for investors past credit
  events — 24mo / 36mo / 48mo paths"). Meta SAC: broad state-level (OH, MO, IN, PA, MI, AL, TN) +
  DMA-level (Cleveland, Cincinnati, St. Louis, Indianapolis, Pittsburgh, Detroit, Birmingham,
  Memphis). Google Search intent ("DSCR loan after bankruptcy", "DSCR loan after foreclosure",
  "investment property loan 620 FICO", "Bluestone DSCR") is highest-intent. AC-09 case studies:
  CF-028 Cleveland quadplex (canonical approval), CF-024 Phoenix decline (cautionary — under-seasoning
  is a hard-stop).
```

### SA-009 — The Permitted-ADU California Leverage Player

```yaml
persona_id: SA-009
persona_name: The Permitted-ADU California Leverage Player
top_markets:
  - Los Angeles CA (CF-020 LA permitted-ADU anchor; LA DBS ~12,000 ADU permits 2017-2024)
  - San Diego CA (CF-020 SD permitted-ADU viable; CF-021 SD unpermitted-ADU decline-then-pivot)
  - San Francisco Bay Area (CA permitted-ADU; deep comp set)
  - Sacramento CA (CA ADU-permit density growing)
emerging_markets:
  - San Jose CA
  - Oakland CA
  - Long Beach CA
  - Anaheim-Santa Ana CA
  - Fresno CA
avoid_markets:
  - All non-CA markets (SA-009 is CA-specific by AP-007 cluster definition — ADU income counting at 75-80% LTV is a CA-specific niche; ADU permit density in non-CA markets is too thin to support appraisal comps)
  - CA non-permitted-ADU markets — these route to EG-005 edge-case pathway (not SA-009 main persona)
geo_targeting_notes: |
  CA-specific niche. Meta SAC: state-level CA + DMA-level (Los Angeles, San Diego, San Francisco, San
  Jose, Sacramento, Fresno). CA is a T4 market overall per Part 1, but SA-009 is the T4-niche persona
  that makes CA viable — the ADU income lift (+$1,600/mo in CF-020) shifts DSCR from 1.00 (SFR-only)
  to 1.20+ (with ADU), enabling 75-80% LTV. AC-09 must build CA-ADU-specific landing page with LA
  DBS permit-density evidence. CA fair-lensing risk: ADU investor demographics are not protected-class
  proxies — standard ECOA compliance applies. CA insurance overlay: see Part 7 (wildfire insurer
  pullback in LA/SD wildland-urban interface).
```

### SA-010 — The ITIN US-Resident Investor

```yaml
persona_id: SA-010
persona_name: The ITIN US-Resident Investor
top_markets:
  - Miami FL (CF-019 ITIN 2-unit anchor)
  - Houston TX
  - Dallas-Fort Worth TX
  - San Antonio TX
  - Los Angeles CA
  - Chicago IL
  - Phoenix AZ
emerging_markets:
  - Orlando FL
  - Tampa FL
  - Atlanta GA
  - Las Vegas NV
  - Riverside-San Bernardino CA (Inland Empire)
avoid_markets:
  - NYC (cost + rent stabilization + ITIN risk premium unbankable)
  - NJ (just-cause eviction makes ITIN specialty lenders decline)
  - Resort-zone STR markets (STR volatility + ITIN tier pricing incompatible)
geo_targeting_notes: |
  HIGH fair-lensing risk per EG-06 Part 3 — ITIN is a direct proxy for national origin / citizenship
  status. Cannot target by ITIN status, language preference, or country-of-origin in ad platforms.
  Must use program-feature-language ("ITIN accepted in lieu of SSN at AHLend + America Mortgages").
  Meta SAC: broad state-level (FL, TX, CA, IL, AZ) + DMA-level (Miami, Houston, Dallas, San Antonio,
  Los Angeles, Chicago, Phoenix). IMPORTANT — SAC forbids ZIP-level targeting, but ITIN borrower
  concentration is heavily ZIP-clustered (immigrant-dense ZIPs in Miami-Dade, Harris County TX, LA
  County, Cook County IL). The compliant path is broad state/DMA targeting + ITIN-feature creative
  that self-qualifies the right audience (Spanish/Portuguese landing pages are permissible under
  ECOA "affirmative marketing" provision; ad-platform language targeting is NOT permissible). Google
  Search intent in Spanish ("préstamo DSCR ITIN", "inversión inmuebles sin SSN") is highest-intent.
```

### SA-011 — The Compensated-Exception Shopper

```yaml
persona_id: SA-011
persona_name: The Compensated-Exception Shopper
top_markets:
  - Multi-state (depends on underlying property-type overlay)
  - NY-Setauuket (CF-007 open violations exception anchor)
  - San Diego CA (CF-021 unpermitted ADU pivot anchor)
  - Charlotte NC (CF-026 401k reserves pivot anchor)
  - Chicago IL (CF-023 non-warrantable condo anchor)
  - Galveston TX (CF-022 condotel pivot anchor)
emerging_markets:
  - Los Angeles CA (unpermitted ADU density)
  - Miami FL (non-warrantable condo density)
  - Phoenix AZ (non-warrantable condo density)
  - Atlanta GA (appraisal-short decline-then-pivot)
  - Nashville TN (LTR-pivot from STR-banned markets)
avoid_markets:
  - N/A — this persona is process-pattern-driven, not geo-driven. SA-011 routes from anywhere a decline letter exists. The avoid-markets concept does not apply because the borrower is already pre-declined at a standard lender.
geo_targeting_notes: |
  Highest reachability in the SA-05 library (score 9) — these borrowers Google "DSCR loan after
  decline" / "non-warrantable condo DSCR" / "declined by lender DSCR" with high intent. TS-10 should
  anchor this persona on Google Search (not Meta broad) — intent keywords drive the routing. Meta SAC
  broad targeting as secondary with decline-letter-triage creative ("Declined for unpermitted ADU?
  Non-warrantable condo? Condotel? Specialty DSCR lenders available"). The decline-letter-triage
  question per EG-06 Part 2 is the intake hook. AC-09 must build 8 edge-case-specific landing pages
  (one per EG-001 → EG-008), each citing the CF case ID for that scenario.
```

### SA-012 — The BRRRR Refinance Cyclist

```yaml
persona_id: SA-012
persona_name: The BRRRR Refinance Cyclist
top_markets:
  - Memphis TN (CF-010 anchor — $111K loan amount just above HEX-012 floor)
  - Indianapolis IN
  - Cleveland OH
  - Birmingham AL
  - Little Rock AR
  - St. Louis MO
  - Kansas City MO
  - Cincinnati OH
emerging_markets:
  - Dayton OH
  - Toledo OH
  - Columbus GA
  - Tulsa OK
  - Oklahoma City OK
avoid_markets:
  - Coastal CA (BRRRR spreads unachievable at CA entry-cost levels)
  - NYC (cost + RS + cash flow below 1.25 DSCR after rehab)
  - Resort-zone STR markets (BRRRR refi cycle incompatible with STR-permit timelines)
  - Markets where after-repair-value (ARV) ≤ $80K (HEX-012 $100K-$150K loan floor — small-market BRRRR properties in deeply rural areas hit this floor)
geo_targeting_notes: |
  High-velocity persona (5-6 loans/year per borrower per SA-05). Google Search intent ("BRRRR
  refinance DSCR", "DSCR loan after hard money", "BRRRR refinance 6 month rule") is highest-intent.
  Meta SAC: broad state-level (TN, IN, OH, AL, AR, MO) + DMA-level (Memphis, Indianapolis, Cleveland,
  Birmingham, Little Rock, St. Louis, Kansas City, Cincinnati). AC-09 case studies: CF-010 Memphis
  BRRRR (canonical $111K loan), CF-002 multi-state BRRRR portfolio. HEX-012 loan-floor flag must be
  surfaced in AC-09 copy ("Loan minimums apply — properties under $130K ARV may not qualify") to
  prevent unqualified leads from sub-$80K BRRRR markets.
```

---

## Part 3: Edge-Case → Geo Mapping (8 EG-06 Edge Cases)

### EG-001 — The Post-Short-Sale Comeback

```yaml
persona_id: EG-001
persona_name: The Post-Short-Sale Comeback
top_markets:
  - Cleveland OH (CF-028 anchor)
  - Cincinnati OH
  - St. Louis MO
  - Indianapolis IN
  - Pittsburgh PA
  - Detroit MI
  - Birmingham AL
  - Memphis TN
emerging_markets:
  - Kansas City MO
  - Louisville KY
  - Milwaukee WI
  - Dayton OH
  - Toledo OH
avoid_markets:
  - Coastal CA (cash flow below 1.30 DSCR required for credit-scarred tier)
  - NYC (cost + rent stabilization make 1.30 DSCR + 65-70% LTV unachievable)
  - Resort-zone STR markets (STR volatility + credit-scarred risk premium unbankable)
geo_targeting_notes: |
  MODERATE fair-lensing risk per EG-06 Part 3 — prior credit event correlates with protected-class
  characteristics (medical debt, divorce, disability). Do NOT target by credit-event history. Use
  feature-language ("Specialty seasoning programs available — 24mo / 36mo / 48mo paths"). Meta SAC:
  broad state-level (OH, MO, IN, PA, MI, AL, TN) + DMA-level (Cleveland, Cincinnati, St. Louis,
  Indianapolis, Pittsburgh, Detroit, Birmingham, Memphis). AC-09 must build seasoning-router landing
  page: input = credit-event type + discharge date + current FICO → output = 24mo/36mo/48mo
  specialty-lender routing. Google Search intent ("DSCR loan after bankruptcy", "investment property
  loan after foreclosure") is highest-intent.
```

### EG-002 — The ITIN US-Resident Investor

```yaml
persona_id: EG-002
persona_name: The ITIN US-Resident Investor
top_markets:
  - Miami FL (CF-019 anchor)
  - Orlando FL
  - Tampa FL
  - Houston TX
  - Dallas TX
  - San Antonio TX
  - Los Angeles CA
  - Chicago IL
  - Phoenix AZ
emerging_markets:
  - Riverside-San Bernardino CA (Inland Empire)
  - Atlanta GA
  - Las Vegas NV
  - Houston-suburban TX (Pasadena, Spring)
  - Dallas-suburban TX (Garland, Irving)
avoid_markets:
  - NYC (cost + rent stabilization + ITIN risk premium unbankable)
  - NJ (just-cause eviction makes ITIN specialty lenders decline)
  - Resort-zone STR markets (STR volatility + ITIN tier pricing incompatible — ITIN tier DSCR is LTR-only at most lenders)
geo_targeting_notes: |
  HIGH fair-lensing risk — ITIN is a direct proxy for national origin. Cannot target by ITIN status,
  language preference, or country-of-origin. Must use program-feature-language ("ITIN accepted in lieu
  of SSN at AHLend + America Mortgages"). Meta SAC: broad state-level (FL, TX, CA, IL, AZ) + DMA-level
  (Miami, Orlando, Tampa, Houston, Dallas, San Antonio, LA, Chicago, Phoenix). IMPORTANT: SAC forbids
  ZIP-level targeting, so the ITIN-borrower-concentrated ZIP clusters (Miami-Dade, Harris County TX,
  LA County, Cook County IL) must be reached via broad state/DMA targeting + ITIN-feature creative
  that self-qualifies the right audience. Bilingual landing pages are permissible (ECOA "affirmative
  marketing"); ad-platform language targeting is NOT. Google Search intent in Spanish ("préstamo
  DSCR ITIN", "inversión inmuebles sin SSN") is highest-intent.
```

### EG-003 — The No-Credit-Country Foreign National

```yaml
persona_id: EG-003
persona_name: The No-Credit-Country Foreign National
top_markets:
  - Orlando FL (CF-018 Brazilian FN anchor)
  - Miami FL
  - Tampa FL
  - Jacksonville FL
  - Houston TX
  - Dallas TX
  - San Antonio TX
  - Phoenix AZ
  - Las Vegas NV
emerging_markets:
  - Atlanta GA
  - Charlotte NC
  - Austin TX (LTR only)
  - Fort Lauderdale FL
  - West Palm Beach FL
avoid_markets:
  - NYC (cost + rent stabilization + FN risk premium unbankable at 60% LTV 1.30 DSCR)
  - Coastal CA Bay Area (cash flow below 1.30 DSCR at 60% LTV)
  - NJ (just-cause eviction — Angel Oak, A&D, HomeAbroad all pulled back)
  - Resort-zone STR markets (FN tier is LTR-only at all GL-02 specialty FN lenders)
geo_targeting_notes: |
  HIGHEST fair-lensing risk in the EG-06 catalog — FN status is fair-lensing-adjacent; targeting by
  country of origin (Brazil, Russia, Nigeria, Vietnam, etc.) is national-origin targeting and is
  prohibited under ECOA + Meta SAC. Must use program-feature-language ("Foreign-national DSCR
  specialists — no US credit history required"). Meta SAC: broad state-level (FL, TX, AZ, NV) + DMA-
  level (Orlando, Miami, Tampa, Jacksonville, Houston, Dallas, San Antonio, Phoenix, Las Vegas).
  Bilingual landing pages permissible (Portuguese, Spanish, Mandarin, Vietnamese, Russian — but DO
  NOT target by language preference in ad platform). Google Search intent in destination languages
  is highest-intent. CRITICAL: AC-09 must NOT use creative naming specific countries ("Brazilian
  investor US mortgage") — use feature-language ("Foreign-national specialist — 60% LTV, 12mo
  reserves, no US credit required").
```

### EG-004 — The Sub-1.0 DSCR With Strong Compensators

```yaml
persona_id: EG-004
persona_name: The Sub-1.0 DSCR With Strong Compensators
top_markets:
  - Grand Rapids MI (CF-008 Sarah Chen duplex anchor)
  - Nashville TN (LTR only — appreciation market)
  - Charlotte NC (appreciation + LTR cash flow)
  - Austin TX (LTR — appreciation market)
  - Tampa FL (LTR)
  - Phoenix AZ (LTR)
  - Denver CO (LTR — appreciation market)
emerging_markets:
  - Boise ID (appreciation-driven sub-1.0 DSCR)
  - Raleigh-Durham NC (appreciation market)
  - Salt Lake City UT (appreciation market)
  - Atlanta GA (appreciation + LTR)
  - Dallas-Fort Worth TX (appreciation market)
avoid_markets:
  - Resort-zone STR markets (STR income volatility makes sub-1.0 DSCR unbankable)
  - NJ (just-cause eviction compounds sub-1.0 DSCR risk)
  - NYC (cost + rent stabilization make sub-1.0 DSCR unachievable post-LTV haircut to 65-70%)
geo_targeting_notes: |
  LOW fair-lensing risk per EG-06 Part 3 — DSCR is a financial metric, not a protected-class proxy.
  Standard ECOA compliance. Meta SAC: broad state-level (MI, NC, TX, FL, AZ, CO, TN) + DMA-level
  (Grand Rapids, Nashville-LTR, Charlotte, Austin-LTR, Tampa, Phoenix-LTR, Denver-LTR). The 60% 401(k)
  haircut reserves calculator (per EG-08 lead-magnet pattern) is also relevant here. Google Search
  intent ("DSCR loan below 1.0", "investment property loan negative cash flow", "DSCR 0.80 with
  compensating factors") is highest-intent. AC-09 must avoid "1.25+ DSCR required" language.
```

### EG-005 — The Unpermitted-ADU Pivot

```yaml
persona_id: EG-005
persona_name: The Unpermitted-ADU Pivot
top_markets:
  - Los Angeles CA (CF-020 LA permitted-ADU companion market; ~12,000 LA DBS permits 2017-2024 implies large unpermitted-ADU shadow market)
  - San Diego CA (CF-021 SD unpermitted-ADU decline-then-pivot anchor)
  - San Francisco Bay Area CA
  - Sacramento CA
  - Portland OR (post-2019 ADU mandate creates unpermitted-ADU shadow market)
  - Seattle WA (post-2019 ADU deregulation)
  - Austin TX (ADU permit pathway growing)
  - Phoenix AZ (ADU permit pathway growing)
emerging_markets:
  - San Jose CA
  - Oakland CA
  - Long Beach CA
  - Anaheim-Santa Ana CA
  - Tucson AZ
avoid_markets:
  - Markets without ADU regulatory infrastructure (most Midwest / Sunbelt LTR markets — unpermitted ADU density too low to support appraisal comp set)
  - NJ (just-cause eviction + unpermitted-ADU overlay compounds risk premium)
geo_targeting_notes: |
  LOW-MODERATE fair-lensing risk per EG-06 Part 3 — property-type classification, not borrower class.
  Standard property-disclosure compliance required. Meta SAC: broad state-level (CA, OR, WA, TX, AZ) +
  DMA-level (LA, San Diego, SF Bay Area, Sacramento, Portland, Seattle, Austin, Phoenix). CA is T4
  overall per Part 1, but EG-005 is the T4-niche edge case that makes CA viable for unpermitted-ADU
  borrowers. Google Search intent ("unpermitted ADU DSCR", "DSCR ADU not permitted", "SFR with ADU
  no permit financing") is highest-intent. AC-09 case studies: CF-021 San Diego decline-then-pivot
  (canonical), CF-020 LA permitted-ADU (counter-example).
```

### EG-006 — The Non-Warrantable Condo Specialist

```yaml
persona_id: EG-006
persona_name: The Non-Warrantable Condo Specialist
top_markets:
  - Chicago IL (CF-023 Chicago Loop anchor)
  - Miami Beach FL
  - Fort Lauderdale FL
  - Phoenix AZ (urban core)
  - NYC midtown (LTR only — non-warrantable condo niche)
  - Las Vegas NV (Strip-adjacent)
  - Houston TX (Galleria-area)
emerging_markets:
  - Atlanta GA (Midtown / Buckhead)
  - Dallas TX (Uptown)
  - Denver CO (LoDo)
  - Seattle WA (Belltown)
  - Austin TX (Downtown)
avoid_markets:
  - Resort-zone STR markets in condotel complexes (these route to EG-007 condotel, not EG-006 non-warrantable)
  - NJ (just-cause eviction + non-warrantable condo risk premium unbankable)
geo_targeting_notes: |
  LOW fair-lensing risk per EG-06 Part 3 — property-type classification, not borrower class. Standard
  property-disclosure compliance. Meta SAC: broad state-level (IL, FL, AZ, NY, NV, TX) + DMA-level
  (Chicago, Miami-Fort Lauderdale, Phoenix, NYC-midtown-LTR-only, Las Vegas, Houston). NYC DMA must
  be flagged LTR-only — STR-banned per HEX-002. Google Search intent ("non-warrantable condo DSCR",
  "DSCR loan condo HOA litigation", "condo investor concentration DSCR") is highest-intent. AC-09
  case studies: CF-023 Chicago Loop (canonical decline-then-pivot). HOA questionnaire intake tool
  (per EG-06 Part 4 FF-08 handoff) is the conversion mechanism.
```

### EG-007 — The Condotel STR Investor

```yaml
persona_id: EG-007
persona_name: The Condotel STR Investor
top_markets:
  - Panama City Beach FL
  - Destin FL
  - Orlando FL (resort sub-market — Disney-area)
  - Galveston TX (CF-022 condotel decline-then-pivot anchor)
  - Gatlinburg TN
  - Pigeon Forge TN
  - Scottsdale AZ (resort)
  - Breckenridge CO
  - Myrtle Beach SC
emerging_markets:
  - Key West FL
  - Fort Lauderdale FL (beachfront condotel)
  - Maui HI (Kihei / Lahaina condotel)
  - Oahu HI (Waikiki condotel)
  - Virginia Beach VA
avoid_markets:
  - NYC (Local Law 18 STR ban — HEX-002)
  - Nashville residential (owner-occupancy — HEX-003)
  - San Francisco (STR effectively banned)
  - Aspen / Vail resort zones (caps + minimum-night)
  - Phoenix (pending STR legislation — SWR-014)
  - Austin (pending STR legislation — SWR-014)
geo_targeting_notes: |
  LOW-MODERATE fair-lensing risk per EG-06 Part 3 — property-type + STR-permit compliance. Meta SAC:
  DMA-level (Panama City, Fort Walton Beach, Pensacola, Orlando, Houston-Galveston, Knoxville-
  Gatlinburg, Phoenix-Scottsdale-split, Denver-Breckenridge, Myrtle Beach). STR-permit verification
  is mandatory pre-screen per EG-06 Part 4 boundary table. Google Search intent ("condotel DSCR",
  "DSCR loan hotel condo", "Visio Lending condotel", "Kiavi STR condotel") is highest-intent. AC-09
  case studies: CF-022 Galveston decline-then-pivot (canonical). EG-007 has the highest margin in the
  EG-06 catalog (+50-100bps premium accepted) — the borrower has already received multiple decline
  letters and is highly motivated.
```

### EG-008 — The 401(k)-Reserves Co-Borrower Pivot

```yaml
persona_id: EG-008
persona_name: The 401(k)-Reserves Co-Borrower Pivot
top_markets:
  - Charlotte NC (CF-026 anchor)
  - Raleigh-Durham NC
  - Charleston SC
  - Atlanta GA
  - Nashville TN (LTR only)
  - Tampa FL
  - Dallas TX
  - Phoenix AZ
emerging_markets:
  - Houston TX
  - Orlando FL
  - Austin TX (LTR only)
  - Denver CO (LTR only)
  - Salt Lake City UT
avoid_markets:
  - Resort-zone STR markets (STR + reserves miscalc compound risk)
  - NJ (just-cause eviction + reserves issue compounds risk premium)
  - NYC (cost + RS make 6mo PITIA reserves unachievable at standard LTV)
geo_targeting_notes: |
  LOW fair-lensing risk per EG-06 Part 3 — documentation methodology, not borrower class. Standard
  ECOA compliance. Meta SAC: broad state-level (NC, SC, GA, TN-LTR, FL, TX, AZ) + DMA-level
  (Charlotte, Raleigh, Charleston, Atlanta, Nashville-LTR, Tampa, Dallas, Phoenix). The 60% 401(k)
  haircut reserves calculator (per EG-06 Part 2 FF-08 handoff) is the conversion mechanism — AC-09
  should build it as a lead magnet landing page. Google Search intent ("DSCR 401k reserves",
  "investment property loan reserves calculator", "DSCR loan co-borrower spouse") is highest-intent.
  AC-09 case studies: CF-026 Charlotte reserves-shortfall-then-pivot (canonical).
```

---

## Part 4: STR-Specific Market Map

STR is the most geo-gated persona set in the SA-05 library. This section is the canonical STR market map for TS-10 + AC-09. It MUST align with NP-04 NP-001 (STR-regulatory-banned cluster) and HEX-002/003/014 hard-exclusion rules.

### STR-Permissive T1/T2 Markets (Green for STR)

| Market | State | Tier (STR-specific) | Regulatory Status | AirDNA Comps Maturity | STR Permit Pathway | Top Persona Fits |
|---|---|---|---|---|---|---|
| Panama City Beach | FL | T1 (STR) | Permissive (Bay County STR license) | High (deep STR comp set) | Non-owner STR permit obtainable | SA-007, EG-007 |
| Destin / Fort Walton Beach | FL | T1 (STR) | Permissive (Okaloosa County STR license) | High | Non-owner STR permit obtainable | SA-007, EG-007 |
| Gatlinburg / Pigeon Forge / Sevierville | TN | T1 (STR) | Permissive (Sevier County STR permit) | High (cabin-class appraisal mature) | Non-owner STR permit obtainable | SA-007, SA-003 (first-time STR), EG-007 |
| Scottsdale | AZ | T1 (STR) | Permissive (Scottsdale resort zones — Carefree, Cave Creek, Paradise Valley) | High | Non-owner STR permit obtainable in resort zones | SA-007, EG-007 |
| Myrtle Beach | SC | T2 (STR) | Permissive (City of Myrtle Beach STR license) | High | Non-owner STR permit obtainable | SA-007, EG-007 |
| Galveston | TX | T2 (STR) | Permissive (Galveston STR license required) | High (condotel comp set) | Non-owner STR permit obtainable | EG-007 (condotel) |
| Orlando (Disney-area resort) | FL | T2 (STR) | Permissive in resort-zoned parcels (Osceola County, Lake County) | High | Non-owner STR permit obtainable in resort zones | SA-007, EG-007 |
| Tucson | AZ | T2 (STR) | Permissive (City of Tucson STR license) | Moderate | Non-owner STR permit obtainable | SA-007 (emerging) |
| Breckenridge | CO | T2 (STR) | Permissive with caps (Town of Breckenridge STR license + cap waitlist) | High (resort comp set) | Non-owner STR permit cap-limited | EG-007 (condotel) |

### STR-Restricted T4/T5 Markets (Hard Avoid for SA-007 + EG-007 STR variants)

| Market | State | Tier (STR-specific) | Specific Regulatory Blocker | HEX Rule | Notes |
|---|---|---|---|---|---|
| NYC (5 boroughs) | NY | T5 (STR) | Local Law 18 — STR host must be permanent resident; unhosted STR effectively prohibited; host registration required; Airbnb-style STR income cannot be used in DSCR | HEX-002 | CF-016 NYC decline — 740 FICO + 1.31 DSCR + 12mo reserves declined despite strong borrower profile |
| Nashville (residential zones) | TN | T5 (STR-residential) | Nashville owner-occupancy STR permit requirement in residential zones — investor (non-owner-occupant) STR permits not issued in residential-zoned parcels | HEX-003 | CF-015 Nashville decline — 720 FICO + 1.31 DSCR + 12mo reserves declined |
| San Francisco | CA | T5 (STR) | SF host must be permanent resident; 90-day unhosted cap; effectively banned for investor STR | NP-001 category | STR income cannot be used in DSCR qualification |
| Los Angeles (most zones) | CA | T5 (STR) | LA host must be primary resident; investor STR effectively prohibited | NP-001 category | Limited exception: M1-zoned industrial parcels (rare) |
| Berkeley | CA | T5 (STR) | Berkeley STR banned (short-term residential rental prohibited) | NP-001 category | LTR rent control applies |
| Santa Monica | CA | T5 (STR) | Santa Monica STR banned (home-sharing only with primary-resident host) | NP-001 category | LTR rent control applies |
| Aspen | CO | T5 (STR) | Aspen caps STR licenses citywide; lottery system; minimum-night requirements in some zones | NP-001 category (resort-zone cap) | Resort-zone cap is hard ceiling |
| Vail | CO | T5 (STR) | Vail requires 5-night minimum in some zones; STR license caps | NP-001 category (resort-zone cap) | Limited cap |
| Seattle (most zones) | WA | T5 (STR) | Seattle host must be primary resident; investor STR effectively prohibited | NP-001 category | LTR-only path viable |
| Portland | OR | T5 (STR) | Portland host must be primary resident; 90-day cap; investor STR effectively prohibited | NP-001 category | LTR-only path viable |
| Austin (most zones) | TX | T4 (STR) — pending | Austin STR license caps; type-1/type-2/type-3 designations; type-2 (non-owner) capped at 25% per block | SWR-014 watch list | STR permitted but caps reached in many zones — verify availability pre-application |
| Phoenix | AZ | T4 (STR) — pending | Phoenix City Council considering STR restrictions (2024-2025); SWR-014 watch list | SWR-014 | LTR still strong; STR uncertain |

### STR Regulatory Watch List (Markets with Pending Legislation 2024-2025)

| Market | State | Pending Action | Risk Level | TS-10 Action |
|---|---|---|---|---|
| Phoenix | AZ | Phoenix City Council STR restriction proposal under review | High | Do NOT promote Phoenix DMA as STR-permissive in current cycle; flag as LTR-only until legislation resolves |
| Austin | TX | Type-2 STR license cap reduction proposals | High | Do NOT promote Austin DMA as STR-permissive; type-2 caps may not be obtainable for new investors |
| Nashville | TN | STR restriction expansion beyond residential zones (incremental tightening) | Moderate | Already HEX-003 hard-exclusion for residential; monitor commercial-zone STR permit availability |
| Denver | CO | Denver STR license caps (already capped for non-primary-residence) | Moderate | Already de-facto restricted; LTR-only path |
| San Diego | CA | San Diego STR ordinance tightening (2024) | Moderate | Already T4/T5 for STR; permitted-ADU LTR (EG-005) is the viable path |
| New Orleans | LA | New Orleans STR permit cap reduction (2024) | Moderate | STR permit availability uncertain; LTR-only safer |
| Asheville | NC | North Carolina state-level STR preemption debate | Moderate | STR currently permitted; monitor state preemption legislation |

### STR Documentation Maturity by Market

| Market | AirDNA Comp Maturity | STR Permit Verification Cycle | STR Insurance Availability | Notes |
|---|---|---|---|---|
| Panama City Beach FL | High | 2-4 weeks | Proper / Slice / CBIZ available | Deep STR comp set; STR insurance competitive |
| Destin FL | High | 2-4 weeks | Proper / Slice / CBIZ available | Same as PCB |
| Gatlinburg / Pigeon Forge TN | High | 2-4 weeks | Proper / Slice / CBIZ available | Cabin-class appraisal $900 vs. $650 standard |
| Scottsdale AZ | High | 2-4 weeks | Proper / Slice / CBIZ available | Resort-zone comp set mature |
| Myrtle Beach SC | High | 2-4 weeks | Proper / Slice / CBIZ available | Seasonal STR insurance pricing |
| Galveston TX | High (condotel) | 2-4 weeks | Proper / Slice / CBIZ available (condotel specialty) | EG-007 condotel comp set mature |
| Orlando FL (resort zones) | High | 2-4 weeks | Proper / Slice / CBIZ available | Disney-area resort comp set |
| Breckenridge CO | High | 4-6 weeks (cap waitlist) | Proper / Slice / CBIZ available | Seasonal STR pricing; cap waitlist extends timeline |
| Tucson AZ | Moderate | 4-6 weeks | Proper / Slice / CBIZ available | Emerging STR market; thinner comp set |

---

## Part 5: Foreign-National Hotspot Map

For SA-005 (Strong-Credit FN), SA-006 (No-Credit FN), EG-002 (ITIN US-Resident), EG-003 (No-Credit-Country FN).

### US Markets with Highest Foreign-National Investor Activity

| MSA | State | FN Tier | Top FN Source Regions | FN-Lender Specialist Presence | Supporting Ecosystem | Top Persona Fits |
|---|---|---|---|---|---|---|
| Miami | FL | T1 (FN) | LatAm (Brazil, Argentina, Colombia, Venezuela), Europe (UK, Spain) | AHLend, America Mortgages, Angel Oak, A&D Mortgage, HomeAbroad | Multi-language title companies (Spanish, Portuguese); international wire infrastructure (Citibank, HSBC); foreign-attorney network (Brazilian, Venezuelan bar associations); FIRPTA tax-counsel density | SA-005, SA-006, SA-010, EG-002, EG-003 |
| Orlando | FL | T1 (FN) | LatAm (Brazil, Venezuela, Puerto Rico), Europe (UK) | AHLend, America Mortgages, Angel Oak, A&D, HomeAbroad | Disney-area resort-zone expertise; Brazilian-focused broker networks; Portuguese-language title companies | SA-005, SA-006, EG-003 |
| Houston | TX | T1 (FN) | LatAm (Mexico, Venezuela, Brazil), Asia (India, China, Vietnam) | AHLend, America Mortgages, Angel Oak | TX fast-eviction; multi-language title companies (Spanish, Mandarin, Vietnamese); Asian-attorney network (Chinese, Indian bar associations); oil-and-gas expat community | SA-005, SA-010, EG-002, EG-003 |
| Dallas-Fort Worth | TX | T1 (FN) | LatAm (Mexico), Asia (India, China, Vietnam), Europe (UK) | AHLend, America Mortgages, Angel Oak | Same as Houston; Indian-investor broker networks | SA-005, SA-010, EG-002 |
| San Antonio | TX | T2 (FN) | LatAm (Mexico) | AHLend, America Mortgages | Smaller FN-lender footprint than Houston/DFW; Mexican-investor broker networks; Spanish-language title companies | SA-005, SA-010 |
| Los Angeles | CA | T2 (FN) | Asia (China, Korea, Taiwan), LatAm (Mexico) | AHLend, America Mortgages, Angel Oak | CA immigrant-dense ZIP clusters (San Gabriel Valley, Koreatown); multi-language title companies (Mandarin, Korean, Spanish); Asian-attorney network; CA insurance friction (wildfire) | SA-010, EG-002 (ITIN more than FN due to CA cost) |
| NYC | NY | T3 (FN) | Europe (UK, Russia), Asia (China, India), LatAm | AHLend, America Mortgages, Angel Oak | Largest international wire infrastructure in US; foreign-attorney network dense; HOWEVER — NY rent stabilization + cost makes FN DSCR uneconomic at 70-75% LTV. Specialty FN lenders (Angel Oak, A&D) have pulled back from NYC. | SA-005 (limited — LTR niche only) |
| Boston | MA | T3 (FN) | Europe (UK, Ireland), Asia (China, India) | AHLend, America Mortgages | International wire infrastructure (via universities, hospitals); HOWEVER — MA rent control resurgence + cost makes FN DSCR niche-only | (limited) |
| Seattle | WA | T3 (FN) | Asia (China, India, Taiwan) | AHLend, America Mortgages | Tech-sector expat community; HOWEVER — WA tenant-friendly law + cost makes FN DSCR niche-only | SA-005 (limited) |
| Las Vegas | NV | T2 (FN) | LatAm (Mexico), Asia (Philippines) | AHLend, America Mortgages | NV no state income tax; growing FN investor activity; lower-cost than coastal alternatives | SA-005, EG-003 |

### Markets with Foreign-National-Friendly Specialist Lender Presence

Per GL-02 Part 1, the FN-native DSCR lenders in this swarm are:

| Lender | FN Programs | Geographic Footprint |
|---|---|---|
| AHLend | FN core (strong-credit + no-credit tier) | National (FN specialty) |
| America Mortgages | FN core | National (FN specialty; "America Mortgages" branding explicitly targets FN segment) |
| Angel Oak (specialty, non-GL-02) | FN no-credit-country specialty | FL, TX, CA, NV (FN-heavy states) |
| A&D Mortgage (specialty, non-GL-02) | FN no-credit-country specialty | FL, TX, CA (FN-heavy states) |
| HomeAbroad (specialty, non-GL-02) | FN specialty (diaspora-focused) | FL, TX, CA, NY (FN-heavy states) |

### Markets with Supporting FN Ecosystem

| MSA | Multi-Language Title Companies | International Wire Infrastructure | Foreign-Attorney Network | FIRPTA Tax Counsel |
|---|---|---|---|---|
| Miami FL | Strong (Spanish, Portuguese) | Strong (Citibank, HSBC, BNY Mellon) | Strong (Brazilian, Venezuelan, Argentine bars) | Strong (FL Bar FIRPTA specialists) |
| Orlando FL | Moderate (Spanish, Portuguese) | Moderate | Moderate (Brazilian bar) | Moderate |
| Houston TX | Strong (Spanish, Mandarin, Vietnamese) | Strong | Strong (Mexican, Chinese, Indian bars) | Strong |
| Dallas-Fort Worth TX | Moderate (Spanish, Mandarin) | Strong | Strong (Mexican, Indian bars) | Strong |
| Los Angeles CA | Strong (Mandarin, Korean, Spanish) | Strong | Strong (Chinese, Korean, Mexican bars) | Strong |
| NYC NY | Strong (multi-language) | Very Strong | Very Strong | Very Strong |
| Boston MA | Moderate | Strong | Moderate | Moderate |
| Seattle WA | Moderate (Mandarin, Korean) | Strong | Moderate (Chinese, Indian bars) | Moderate |

---

## Part 6: State-Level Regulatory Risk Map

States ranked by DSCR-lender regulatory risk (overall hostility to investor landlords + STR operators + DSCR underwriting environment).

### T1 Friendly (Low Regulatory Risk)

| State | LTR Friendly | STR Friendly | Landlord-Tenant Law | Property Tax | Insurance | Notes |
|---|---|---|---|---|---|---|
| TX | Excellent | Moderate (city-by-city) | Very friendly (3-day notice, fast eviction 2-4 weeks) | Moderate (no state income tax) | Good (Gulf Coast moderate wind) | No state income tax; fastest eviction timeline in US; SA-005/SA-010 FN/ITIN anchor |
| FL | Excellent | Good (resort zones) | Very friendly (3-day notice, fast eviction) | Low-Moderate (no state income tax) | Moderate-High (wind/flood — see Part 7) | No state income tax; "#1 DSCR market for FN" per DSCR Authority; insurance is the major drag |
| TN | Excellent | Banned (Nashville residential) / Excellent (Smokies) | Friendly (14-day notice, fast eviction) | Low-Moderate | Good | Memphis + Nashville LTR anchor; Gatlinburg/Pigeon Forge STR anchor |
| GA | Excellent | Moderate (Atlanta STR license) | Friendly | Low-Moderate | Good | Atlanta LTR anchor; SA-002 multi-state portfolio component |
| NC | Excellent | Moderate (Asheville STR watch) | Friendly | Low-Moderate | Good | Charlotte + Raleigh anchor; SA-004 cash-out refi market |
| AZ | Good | Watch (Phoenix pending) / Excellent (Scottsdale resort) | Friendly | Low | Good | Phoenix + Tucson + Scottsdale anchor; SWR-014 watch on Phoenix STR |
| IN | Excellent | Moderate | Friendly | Low | Good | Indianapolis anchor; SA-001 + SA-012 anchor |
| UT | Good | Moderate (SLC restricted, Park City resort) | Friendly | Moderate | Good | Salt Lake City + Provo anchor; in-migration market |
| ID | Good | Moderate | Friendly | Low-Moderate | Good | Boise anchor; in-migration market |
| AL | Excellent | Moderate | Friendly | Low | Good | Birmingham anchor; SA-012 BRRRR market |
| AR | Excellent | Moderate | Friendly | Low | Good | Little Rock anchor; SA-002 portfolio component |
| MO | Excellent | Moderate (Branson resort) | Friendly | Low | Good | St. Louis + Kansas City anchor; SA-008 credit-scarred market |
| OH | Excellent | Moderate | Moderate (Cleveland balanced; Cincinnati friendly) | Low | Good | Cleveland + Cincinnati + Columbus anchor; SA-008 + SA-001 market |
| SC | Good | Good (Myrtle Beach resort) | Friendly | Low | Moderate (coastal hurricane) | Charleston + Myrtle Beach anchor; SA-007 STR resort |
| MI | Good | Moderate | Moderate | Low-Moderate | Good | Grand Rapids + Detroit anchor; SA-001 + EG-004 market |
| NV | Good | Watch (Las Vegas 10-day rolling limit) | Moderate | Low-Moderate | Moderate | Las Vegas anchor; EG-003 FN market |

### T3 Watchful (Moderate Regulatory Risk)

| State | LTR Friendly | STR Friendly | Landlord-Tenant Law | Property Tax | Insurance | Notes |
|---|---|---|---|---|---|---|
| CO | Good | Restricted (Denver STR license capped; resort zones cap-limited) | Moderate (10-day notice) | Moderate | Good | Denver LTR anchor (EG-004 appreciation market); Breckenridge STR cap-limited |
| MN | Good | Restricted (Minneapolis host license required) | Tenant-friendly (3-month notice, just-cause in Minneapolis) | Moderate | Good | Minneapolis LTR-only; SA-001 limited |
| OR | Moderate | Banned (Portland host must be primary resident) | Tenant-friendly (90-day notice, rent-increase caps) | Moderate | Good (west-side wildfire watch) | Portland LTR-only; EG-005 unpermitted-ADU pivot (Portland ADU mandate post-2019) |
| WA | Good | Banned (Seattle host must be primary resident) | Tenant-friendly (60-day notice, just-cause in Seattle) | Moderate | Good | Seattle LTR-only; EG-005 unpermitted-ADU pivot (Seattle ADU deregulation post-2019) |
| IL | Good | Moderate (Chicago zoned) | Moderate (Chicago RLTO tenant-friendly) | Moderate-High | Good | Chicago LTR anchor; EG-006 non-warrantable condo anchor |
| LA | Moderate | Moderate (New Orleans permit cap reduction 2024) | Moderate | Low-Moderate | High (post-Ida) | New Orleans — insurance crisis is the major drag |

### T5 Hostile (High Regulatory Risk)

| State | LTR Friendly | STR Friendly | Landlord-Tenant Law | Property Tax | Insurance | What Is Still Fundable |
|---|---|---|---|---|---|---|
| CA | Poor-Moderate (AB 1482 rent cap CPI+5%) | Restricted-Banned (city-by-city; SF/LA/Berkeley/Santa Monica effectively banned) | Tenant-friendly (just-cause eviction AB 1488; Los Angeles RS; San Francisco RS) | Very High | Poor (wildfire insurer pullback — State Farm, Allstate exits) | (1) SA-009 permitted-ADU SFR (CF-020 LA approval) — ADU income lift shifts DSCR from 1.00 to 1.20+; (2) EG-005 unpermitted-ADU pivot (CF-021 SD decline-then-pivot) at 70% LTV + 25bps premium; (3) Sacramento LTR (lower-cost CA alternative); (4) CA SFR LTR with strong cash flow in inland markets (Fresno, Bakersfield, Stockton) where rent-to-value supports 1.25 DSCR |
| NY | Poor (NYC rent stabilization; upstate moderate) | Banned (NYC Local Law 18) | Tenant-friendly (NYC RS; upstate moderate) | Very High | Good | (1) LLC-owned multifamily in upstate NY MSAs (Buffalo, Rochester, Syracuse, Albany) — NOT subject to NYC RS; (2) EG-006 non-warrantable condo in NYC midtown (LTR only); (3) SFR LTR in Long Island (Nassau/Suffolk) outside NYC RS zone; (4) Albany/Saratoga Springs LTR (lower-cost upstate) |
| NJ | Poor-Moderate | Restricted (Jersey City, Hoboken STR capped) | Tenant-friendly (just-cause eviction requirements statewide; slow eviction timeline 6-12 months) | Very High | Moderate (coastal wind/flood) | (1) SFR LTR in south NJ (Atlantic County, Cumberland County) — lower-cost, faster eviction; (2) Jersey Shore resort STR (Atlantic City, Wildwood) with seasonal STR permit; (3) Multi-family in Newark/Jersey City IF DSCR clears 1.30 with 65% LTV — specialty lender only (most GL-02 lenders decline NJ multi-family) |
| MA | Poor-Moderate | Restricted (Boston host registration; Cambridge/Somerville STR banned) | Tenant-friendly (Boston rent control debate 2024-2025; Cambridge/Somerville rent control resurgence) | High | Good | (1) SFR LTR in suburban/exurban MA (Worcester, Springfield, Lowell) — outside rent-control zones; (2) Multi-family in Worcester (lower-cost alternative to Boston); (3) Boston-area LTR IF DSCR clears 1.30 with 65% LTV — specialty lender only |

### T5 State-Specific Fundable Pathways (Per Charter Requirement)

For each T5 state, this is what is still fundable:

**CA (T5)**:
- **SA-009 Permitted-ADU SFR** — Los Angeles, San Diego, Bay Area, Sacramento. The ADU income lift (+$1,600/mo in CF-020) is the unlock. CA DBS reported ~12,000 ADU permits issued 2017-2024 in LA alone = deep appraisal comp set.
- **EG-005 Unpermitted-ADU Pivot** — Same MSAs; specialty-lender SFR classification (ADU ignored for income AND value) at 70% LTV + 25bps premium.
- **Sacramento LTR** — Lower-cost CA alternative; AB 1482 applies but rent-to-value supports 1.25 DSCR.
- **Inland Empire LTR (Fresno, Bakersfield, Stockton)** — Cash-flow-positive CA SFR LTR where rent-to-value supports 1.25 DSCR at 75% LTV. CA insurance friction applies.

**NY (T5)**:
- **Upstate NY multifamily in LLC** — Buffalo, Rochester, Syracuse, Albany. NOT subject to NYC rent stabilization. LLC ownership standard for DSCR. Multi-family 2-4 unit cash-flow yields support 1.25+ DSCR.
- **EG-006 Non-warrantable condo in NYC midtown (LTR only)** — STR-banned (Local Law 18 HEX-002) but LTR-viable for non-warrantable condos in midtown Loop pattern. 70% LTV + 25-50bps premium at Truss/Bluestone/Lendmire/Brookmont.
- **Long Island SFR LTR (Nassau/Suffolk)** — Outside NYC RS zone. Higher cost but LTR-viable.
- **Albany/Saratoga Springs LTR** — Lower-cost upstate alternative.

**NJ (T5)**:
- **South NJ SFR LTR (Atlantic County, Cumberland County)** — Lower-cost, faster eviction than north NJ. Atlantic City + Wildwood seasonal STR permit viable.
- **Jersey Shore resort STR (Atlantic City, Wildwood, Cape May)** — Seasonal STR permit pathway (with summer-only income seasonality).
- **Newark/Jersey City multi-family (DSCR 1.30+ + 65% LTV)** — Specialty-lender only; most GL-02 lenders decline NJ multi-family due to just-cause eviction timeline.

**MA (T5)**:
- **Suburban/exurban MA SFR LTR (Worcester, Springfield, Lowell)** — Outside Cambridge/Somerville/Boston rent-control zones.
- **Worcester multi-family** — Lower-cost alternative to Boston; 2-4 unit cash flow supports 1.25 DSCR at 75% LTV.
- **Boston-area LTR (DSCR 1.30+ + 65% LTV)** — Specialty-lender only.

---

## Part 7: Insurance Availability Overlay

### Insurance Crisis Dimension

Property insurance is the most dynamic DSCR fundability variable in 2024-2025. Three regional crises shape the fundability surface:

#### FL Wind / Hurricane Crisis

- **Affected MSAs:** Panama City Beach, Destin, Fort Walton Beach, Tampa, Orlando (inland — moderate), Jacksonville, Miami, Fort Lauderdale, West Palm Beach, Naples, Fort Myers.
- **Friction:** Citizens Property Insurance (FL insurer of last resort) is the only option for many coastal investment properties. Major carriers (Universal Property & Casualty, Heritage Insurance, FedNat) have pulled back or gone insolvent post-Hurricane Ian (2022). Premiums on FL investment properties have doubled or tripled 2021-2024.
- **DSCR impact:** Insurance is a component of PITIA. A $4K/yr insurance premium doubling to $8K/yr adds ~$333/mo to PITIA — at $1,800/mo rent on a $250K property, that's a 18% DSCR compression. Files that cleared 1.25 DSCR in 2021 may clear only 1.05 in 2024.
- **Lender response per GL-02:**
  - AHLend: Still writes FL — internal insurance-review team; requires 6mo reserves minimum (vs. 3mo in non-FL markets)
  - America Mortgages: Still writes FL — FN specialty makes FL core
  - Newfi: Still writes FL — 47-state footprint; sub-1.0 DSCR specialty can absorb some insurance compression
  - Lendmire: Still writes FL — no-reserve program at ≤$1.5M loan + ≤70% LTV particularly valuable in FL insurance crisis
  - Bluestone: FL case-by-case (vacation rentals subject to stricter volatility overlays per GL-02 Part 1)
  - Truss / Rize / Griffin: Still write FL but pricing premium applies for coastal properties
- **TS-10 routing implication:** FL leads (SA-005, SA-006, SA-007, SA-010, EG-002, EG-003, EG-007) should have insurance-quote-intake field added to FF-08 form. Files with Citizens-only insurance should be flagged for AHLend / America / Newfi routing (specialty FL lenders).

#### CA Wildfire Crisis

- **Affected MSAs:** Los Angeles (wildland-urban interface — hillsides of Pacific Palisades, Malibu, Pasadena, Glendale), San Diego (east county), San Francisco Bay Area (Sonoma, Napa, Santa Cruz mountains), Sacramento (foothills).
- **Friction:** State Farm and Allstate have pulled back from CA property insurance (2023-2024). CA Fair Plan (insurer of last resort) is the only option for many wildland-urban interface properties. Premiums on CA investment properties in wildfire zones have doubled or tripled 2023-2024.
- **DSCR impact:** Less severe than FL on aggregate (CA LTR cash flow already at DSCR floor 1.00-1.20); insurance premium doubling can push files to 0.90 DSCR (sub-1.0 territory → routes to EG-004 sub-1.0 DSCR with compensators pathway).
- **Lender response per GL-02:**
  - All GL-02 lenders still write CA SFR (LTR) — CA is core market
  - AHLend: CA multi-family (5-8 unit) specialty
  - Newfi: CA residential 1-4 unit only — explicit overlay per GL-02 Part 1
  - Specialty: Harpoon Capital (ADU specialist — CA-ADU niche absorbs insurance compression via ADU income lift)
- **TS-10 routing implication:** CA leads (SA-009 permitted-ADU, EG-005 unpermitted-ADU pivot) should have wildfire-zone-overlay intake field (CAL FIRE Very High Fire Hazard Severity Zone). Files in VHFHSZ should be flagged for Harpoon Capital (ADU specialist) or specialty CA-lender routing.

#### LA Gulf Hurricane Crisis

- **Affected MSAs:** New Orleans, Baton Rouge, Lafayette.
- **Friction:** Post-Hurricane Ida (2021), LA insurance market is in sustained crisis. LA Citizens (insurer of last resort) is the primary option for many investment properties. Premiums on LA investment properties have doubled or tripled 2022-2024.
- **DSCR impact:** Same compression pattern as FL. Combined with LA landlord-tenant moderate-law profile, LA is now a T3 market (was T1 pre-Ida).
- **Lender response per GL-02:**
  - All GL-02 lenders still write LA SFR — LA is core market
  - Specialty: Brookmont Capital (portfolio — multi-state) still writes LA in portfolio context
- **TS-10 routing implication:** LA leads should have insurance-quote-intake field. Files with Citizens-only insurance should be flagged for specialty-lender routing.

#### Insurance Crisis — Lender Pullback Map

| Lender | FL Wind | CA Wildfire | LA Gulf | Notes |
|---|---|---|---|---|
| Truss | Still writes | Still writes | Still writes | Wholesale broker — shops specialty insurance carriers |
| Rize | Still writes | Still writes | Still writes | Pricing premium for coastal FL + CA wildfire zones |
| AHLend | Still writes (FL core) | Still writes | Still writes | FL internal insurance-review team |
| America Mortgages | Still writes (FL core FN) | Still writes | Still writes | FN specialty makes FL core |
| Lendmire | Still writes | Still writes | Still writes | No-reserve program at ≤$1.5M loan + ≤70% LTV valuable in FL |
| Bluestone | Case-by-case | Case-by-case | Case-by-case | Vacation rentals subject to stricter volatility overlays |
| Griffin | Still writes | Still writes | Still writes | STR specialty — STR insurance (Proper/Slice/CBIZ) separate market |
| Newfi | Still writes | Still writes (residential only) | Still writes | 47-state footprint; sub-1.0 DSCR specialty |

---

## Part 8: Geo-Targeting Payload for TS-10

This is the canonical geo handoff for TS-10 (Targeting & Scoring Generator). TS-10 should consume this as the ad set geo parameter block across all Meta campaigns + Google Ads location targeting.

```yaml
geo_targeting_rules:
  T1_markets:
    include_states:
      - IN
      - TN
      - OH
      - NC
      - GA
      - TX
      - FL
      - AL
      - AR
      - MO
      - PA
      - MI
      - AZ
      - UT
      - ID
      - SC
    include_msas:
      # Midwest / Southeast LTR cash-flow anchors
      - Indianapolis IN
      - Memphis TN
      - Cleveland OH
      - Cincinnati OH
      - Columbus OH
      - Charlotte NC
      - Raleigh-Durham NC
      - Birmingham AL
      - Atlanta GA
      - Little Rock AR
      - St. Louis MO
      - Kansas City MO
      - Pittsburgh PA
      - Grand Rapids MI
      # TX LTR + FN anchors
      - Dallas-Fort Worth TX
      - Houston TX
      - San Antonio TX
      - Austin TX  # LTR only — STR watch
      # FL LTR + FN anchors
      - Tampa-St. Petersburg FL
      - Orlando FL
      - Jacksonville FL
      # AZ LTR anchor
      - Phoenix AZ  # LTR only — STR watch
      - Tucson AZ
      # UT/ID in-migration anchors
      - Salt Lake City UT
      - Boise ID
    recommended_ad_set_budget_share: 50%
    persona_focus:
      - SA-001  # Cash-Flow Optimizer
      - SA-002  # Multi-State Portfolio Scaler
      - SA-003  # Cash-Strong First-Timer
      - SA-004  # Equity-Tapping Refinancer
      - SA-005  # Strong-Credit FN
      - SA-008  # Credit-Scarred Cash-Rich Rebuilder
      - SA-012  # BRRRR Refinance Cyclist
      - EG-001  # Post-Short-Sale Comeback
      - EG-004  # Sub-1.0 DSCR With Compensators
      - EG-008  # 401(k)-Reserves Co-Borrower Pivot

  T2_markets:
    include_states:
      - NV
    include_msas:
      # STR-permissive resort markets
      - Panama City Beach FL
      - Destin / Fort Walton Beach FL
      - Gatlinburg / Pigeon Forge / Sevierville TN
      - Scottsdale AZ
      - Myrtle Beach SC
      - Galveston TX
      - Orlando FL  # resort sub-zone only for STR
      # STR-watch / pending-legislation markets (LTR primary, STR case-by-case)
      - Las Vegas NV
      - Nashville TN  # LTR only — STR banned residential
      # FL FN/ITIN dense markets (insurance friction)
      - Miami FL
      - Fort Lauderdale FL
      # Urban non-warrantable condo niche
      - Chicago IL
    recommended_ad_set_budget_share: 30%
    persona_focus:
      - SA-007  # STR Permissive-Market Operator
      - SA-010  # ITIN US-Resident Investor
      - SA-011  # Compensated-Exception Shopper
      - EG-002  # ITIN US-Resident Investor (edge case)
      - EG-003  # No-Credit-Country FN
      - EG-006  # Non-Warrantable Condo Specialist
      - EG-007  # Condotel STR Investor

  T3_markets:
    include_states:
      - CO
      - MN
      - OR
      - WA
      - LA
    include_msas:
      - Denver CO  # LTR only — STR watch
      - Minneapolis MN  # LTR only
      - Portland OR  # LTR only — STR banned
      - Seattle WA  # LTR only — STR banned
      - New Orleans LA  # insurance crisis drag
      - Breckenridge CO  # STR cap-limited
    recommended_ad_set_budget_share: 15%
    persona_focus:
      - SA-001  # LTR only
      - SA-004  # cash-out refi (LTR)
      - EG-004  # Sub-1.0 DSCR (appreciation markets)
      - EG-005  # Unpermitted-ADU Pivot (Portland/Seattle post-2019 ADU deregulation)
      - EG-007  # Condotel STR (Breckenridge)

  T4_markets:
    include_states:
      - CA
      - NY
      - MA
    include_msas:
      # CA — permitted-ADU niche only
      - Los Angeles CA
      - San Diego CA
      - San Francisco Bay Area CA
      - Sacramento CA
      - San Jose CA
      - Oakland CA
      - Long Beach CA
      - Anaheim-Santa Ana CA
      - Fresno CA
      # NY — upstate multifamily + Long Island LTR only
      - Buffalo NY
      - Rochester NY
      - Syracuse NY
      - Albany NY
      - Nassau-Suffolk NY
      - NYC midtown (LTR only — non-warrantable condo niche)
      # MA — suburban/exurban LTR only
      - Worcester MA
      - Springfield MA
      - Lowell MA
    recommended_ad_set_budget_share: 5%
    persona_focus:
      - SA-009  # Permitted-ADU California Leverage Player
      - EG-005  # Unpermitted-ADU Pivot (CA core)
      - EG-006  # Non-Warrantable Condo Specialist (NYC midtown LTR niche)
      - SA-001  # LTR only (Fresno, Bakersfield, Worcester, Springfield — lower-cost alternatives)

  T5_markets:
    exclude_states:
      - NJ  # full exclusion — just-cause eviction + slow timeline
    exclude_msas:
      # STR-banned hard exclusion
      - NYC (5 boroughs) — STR variant only  # Local Law 18 HEX-002
      - Nashville residential zones — STR variant only  # HEX-003
      - San Francisco — STR variant only  # NP-001
      - Los Angeles (most zones) — STR variant only  # NP-001
      - Berkeley CA — full exclusion  # NP-001
      - Santa Monica CA — full exclusion  # NP-001
      - Aspen CO — STR variant only  # NP-001 resort cap
      - Vail CO — STR variant only  # NP-001 resort cap
      - Seattle WA — STR variant only  # NP-001
      - Portland OR — STR variant only  # NP-001
      - Austin TX — STR variant only  # SWR-014 watch
      - Phoenix AZ — STR variant only  # SWR-014 watch
    notes: |
      Hard exclusion — even broad Meta SAC campaigns should geo-exclude these.
      Note: NYC, Nashville-residential, SF, LA, Aspen, Vail, Seattle, Portland, Austin, Phoenix are
      excluded ONLY for STR-variant campaigns (SA-007 STR, EG-007 condotel STR). LTR-variant campaigns
      in these markets remain viable (subject to state-level tier — NYC = T4 LTR niche, Nashville LTR
      = T2, SF/LA LTR = T4 permitted-ADU niche, etc.). Berkeley / Santa Monica = full exclusion (both
      LTR rent control + STR ban). NJ = full exclusion (just-cause eviction makes most DSCR files
      uneconomic for standard GL-02 lender pool).

compliance_note: |
  Under Meta Special Ad Category (SAC) for housing/credit:
  - ZIP-level targeting is RESTRICTED. Use state-level + DMA-level (city-level) inclusion/exclusion
    only.
  - Detailed demographic targeting (age, gender, race, national origin, religion) is RESTRICTED.
    Demographic proxies (language preference, country-of-origin, ITIN status) are RESTRICTED.
  - Lookalike audiences built off protected-class seeds are RESTRICTED.
  - Permissible: state-level + DMA-level + city-level geo inclusion/exclusion; interest-based
    targeting (BiggerPockets, real estate investing, landlord communities); custom audiences from
    CRM (past DSCR closings); website retargeting (landing page visitors).
  - Persona-specific compliance flags:
    - SA-005 / SA-006 / EG-003 (Foreign National): use program-feature-language ("Foreign-national
      DSCR specialists — no US credit required"); bilingual landing pages permissible (ECOA
      affirmative marketing); DO NOT target by country-of-origin or language preference in ad platform
    - SA-010 / EG-002 (ITIN): use program-feature-language ("ITIN accepted in lieu of SSN"); same
      bilingual-landing-page rule; DO NOT target by ITIN status or language preference
    - SA-008 / EG-001 (Credit-Scarred / Post-Short-Sale): use feature-language ("Specialty seasoning
      programs available — 24mo / 36mo / 48mo paths"); DO NOT target by credit-event history
    - SA-007 / EG-007 (STR): use feature-language ("STR-permissive markets: FL coast, Smoky Mountains,
      Scottsdale AZ"); hard-exclude STR-banned DMAs at ad set level (NYC, Nashville-residential, SF,
      LA, Berkeley, Santa Monica, Aspen, Vail, Seattle, Portland)
  - Google Ads location targeting is NOT subject to Meta SAC — city-level + ZIP-level targeting is
    permissible on Google. Use Google for hyper-local STR-permissive sub-zone targeting (Scottsdale
    resort zones, Smoky Mountains cabin zones, Gulf Coast beachfront) where Meta SAC forbids ZIP-level.
  - LinkedIn Ads audience targeting is NOT subject to Meta SAC — use LinkedIn for SA-002 Portfolio
    Scaler (Real Estate / Investment Management job titles + 10+ years experience + investor-heavy
    metros).
```

---

## Methodological Caveats

1. **Evidence quality on geo_fit arrays is mixed.** SA-05's `geo_fit` arrays draw directly from AP-03 cluster geo_concentration data, which itself is anchored in CF-01's 28 cases (16 approved / 7 declined / 5 approved_with_conditions). CF-01 sample is concentrated in IN, TN, OH, NC, AL, MI, FL, TX, AZ, CA, NY — strong Midwest/Southeast/Sunbelt coverage, weak Pacific Northwest / Mountain West / Northeast (outside NY) coverage. Markets outside CF-01's footprint (Boise, Salt Lake City, Tucson, Minneapolis, Denver LTR) are inferred from publicly known investor-market rankings and flagged `inferred: true` in persona notes.

2. **STR regulatory landscape shifts rapidly.** The Part 4 STR watch list (Phoenix, Austin, Nashville, Denver, San Diego, New Orleans, Asheville) reflects 2024-2025 pending legislation. TS-10 + FF-08 should treat STR-permissive status as a quarterly-refresh field, not a static rule. NP-04's HEX-002/003/014 are the canonical hard-exclusion rules and supersede any divergence in this file.

3. **Insurance crisis is the most dynamic DSCR fundability variable in 2024-2025.** Part 7 reflects 2024 carrier pullback data (State Farm, Allstate CA exits; FL post-Ian insolvencies). Premiums on FL and CA investment properties have doubled or tripled in 24-36 months. TS-10 should add an insurance-quote-intake field to FF-08 form for FL/CA/LA leads specifically.

4. **NJ full exclusion is conservative.** NJ does have fundable niches (south NJ SFR LTR, Jersey Shore seasonal STR, Newark/Jersey City multi-family at 1.30 DSCR + 65% LTV with specialty lenders). However, NJ's just-cause eviction law + 6-12 month eviction timeline makes most GL-02 standard lenders decline NJ files — the operational cost of supporting a NJ niche program exceeds the marketing-ops ROI for the broad SAC campaigns this swarm is designed to support. NJ should be revisited if a specialty-lender NJ niche is later scoped.

5. **State-level tier vs MSA-level tier divergence.** Several states span multiple tiers (CA T4/T5 depending on MSA; NY T4 upstate + T5 NYC-STR; TN T1 Memphis + T1 Smokies + T5 Nashville-residential-STR; FL T1 LTR + T2 STR-coastal + T2 FN-dense). TS-10 should apply MSA-level rules where the MSA is listed in `include_msas` / `exclude_msas`; the state-level `include_states` / `exclude_states` block is the coarse first-pass filter, and the MSA-level block is the fine-grained override.

6. **Compliance note integrates with TS-10's Meta SAC constraints but does NOT replace legal review.** Per EG-06 Part 3 Compliance Guardrails, before deploying ad campaigns targeting SA-005/SA-006/EG-003 (foreign-national) or SA-010/EG-002 (ITIN) segments, the marketing-ops team must obtain compliance review from a qualified ECOA / Reg B attorney — particularly on whether "ITIN accepted" / "no US credit required" constitutes permissible product-feature marketing or impermissible proxy targeting in the specific ad platform's policy environment. This deliverable's compliance_note is good-faith analyst interpretation, not legal advice.

7. **Top-30-MSA minimum is met (49 entries in Part 1 table).** The Part 1 table covers 49 distinct MSA/state-tier combinations (some markets appear twice with different STR/LTR tiers — e.g., Nashville T2 LTR vs Nashville T5 STR-residential). This exceeds the charter's 30-50 MSA minimum.

8. **The Part 8 payload is the canonical TS-10 handoff.** AC-09 should consume Part 2 + Part 3 persona → geo mappings for landing-page case-study regionalization (e.g., "How Maria bought her first Indianapolis duplex with 9 months reserves and a 645 FICO" for SA-008 Cleveland→Indianapolis case study variant). FF-08 should consume Part 4 STR market map for the STR market-lookup tool integration per SA-05 handoff ("borrowers often don't know their city's STR rules" — pair HEX-002/003/014 with a market-lookup tool).

---

*End of GS-07 deliverable. Downstream agents (TS-10, AC-09, FF-08) should treat Part 1 as the fundability tier list, Part 2 + Part 3 as the persona-to-geo mapping (canonical for AC-09 case-study regionalization), Part 4 as the STR-specific market map (canonical for FF-08 STR market-lookup tool + TS-10 STR geo exclusion rules), Part 5 as the FN hotspot map (canonical for SA-005/SA-006/EG-002/EG-003 marketing-reachability strategy), Part 6 as the state-level regulatory risk map (canonical for state-level budget allocation), Part 7 as the insurance overlay (canonical for FL/CA/LA lead-routing logic), and Part 8 as the structured geo-targeting payload (canonical for TS-10 ad set geo parameters).*
