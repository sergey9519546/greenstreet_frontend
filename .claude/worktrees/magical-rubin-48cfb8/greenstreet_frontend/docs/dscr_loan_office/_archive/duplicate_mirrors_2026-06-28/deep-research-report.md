# Sprint A Research Readout for DSCR Deal Engine

## Executive summary

I treated your uploaded corpus as a **claims-to-test, not source-of-truth**. The strongest parts are the dual-track concept, tax-reassessment warning, lender-specific evidence discipline, and the need for live dated rate anchors. The biggest corrections are: **do not hardcode “no vacancy haircut” as universal**, **do not hardcode one FICO/LTV matrix as universal**, and **your flagship 8.25% math vector is wrong**. The corpus itself is still useful as the build hypothesis set. fileciteturn0file0 fileciteturn0file9

## Sprint A verification table

| Target | Status | Finding | Rule to encode |
|---|---|---|---|
| Track 1 DSCR | **Verified / Software Rule** | Public lender pages from Griffin and Visio define DSCR as **monthly rent ÷ PITIA**; Lima One says 1.0 is minimum and 1.2+ improves leverage/pricing. citeturn3search4turn17search4turn10search1 | `track1 = qualifying_rent / PITIA` |
| “No vacancy haircut” as universal | **Rejected as universal** | Fannie requires lenders using lease/1007 market rents to use **75% of gross rent**, absorbing vacancy/maintenance. Some DSCR lenders still use gross-rent/PITIA, so this must be lender-specific. citeturn0search0turn3search4turn17search5 | Add `rent_basis_method` per lender |
| Track 2 DSCR | **Verified / Advisory Rule** | CRE DSCR is standardly **annual NOI less reserves ÷ annual debt service**; use this for investor survival, not lender qualification. citeturn16search1turn16search3 | `track2 = NOI / annual_debt_service` |
| Rate anchors | **Verified / Software Rule** | Freddie Mac PMMS was **6.52%** on June 11, 2026; FRED/H.15 showed the 10Y at **4.55%** on June 10; market reporting had it near **4.43%** on June 17. Date-stamp every quote. citeturn11search0turn11search3turn12news25 | Hard refresh rates daily |
| Reserves | **Market Pattern** | Six months is a common center, but published matrices vary by DSCR, loan size and FICO; Griffin ranges from **0–6** to **12** months, while Visio says most require six. citeturn3search10turn3search9 | Encode per-lender reserve matrix |
| FICO/LTV caps | **Market Pattern** | Visio publicly shows **up to 80% LTV / 680 min FICO**; Lima shows **660 FICO** floor; Griffin shows tighter LTVs at weaker tiers. Not one universal matrix. citeturn17search0turn10search1turn3search8 | Use lender-specific credit box |
| PPP branching | **Verified in principle / Human review** | OH, PA, WA and MN have state-specific official rules; NJ remains nontrivial and should stay counsel-reviewed. citeturn6search1turn6search0turn8search1turn7search23 | State+entity+lender-type branching |
| Tax reassessment | **Verified / Software Rule** | CA reassesses to fair market value on change in ownership and can issue supplemental bills; FL removes SOH cap after sale; TX appraises to market value. citeturn5search3turn5search2turn15search0turn4search0 | Never use seller tax bill blindly |
| Insurance/flood gate | **Verified / Software Rule** | FEMA requires flood insurance in SFHAs for federally related lending; CA FAIR Plan is insurer of last resort when regular coverage is unavailable. citeturn9search1turn9search3turn9search0 | If no bindable compliant quote, fail/warn |

## DSCR Formula Bible

**Track 1: lender qualification**
`qualifying_rent / PITIA`
Use a lender-level switch for rent basis: `gross_rent`, `75pct_rent`, `projected_STR`, or `historical_STR`. Griffin and Visio support gross-rent/PITIA publicly; Fannie-style treatment uses 75% of lease/1007. citeturn3search4turn17search4turn0search0

**Track 2: investor survival**
`NOI / annual debt service`
NOI should exclude financing costs; debt service includes scheduled principal and interest. This is the correct stress lens and can coexist with a Track 1 pass. citeturn16search1turn16search3

## Golden math corrections

Using the verified mortgage-payment formula and your reference deal inputs, the correct factors are **0.0060761** at 6.125%, **0.0066530** at 7.00%, and **0.0075127** at 8.25%. For a **$318,750** loan, PITIA is **$2,853.99** at 7.00% and **$3,127.99** at 8.25%. That means Track 1 is **1.0512** at 7.00% and **0.9591** at 8.25%, so the corpus line showing “0.96 ✓” is a **status error** and the 8.25% PITIA shown in the corpus is also off. Break-even rate is about **7.673%** and max price at 75% LTV is about **$454,263**. Formula basis: standard amortization + lender PITIA definition. citeturn3search4turn17search4turn0file0

## Phase one encode now

Ship now: dual-track engine, lender-specific rent-basis toggle, tax-reset engine, flood/insurance gate, dated rate anchor, and corrected golden tests. Hold for counsel/vendor validation: NJ PPP LLC logic, universal STR hierarchy, and any “approval probability” model. citeturn6search1turn6search0turn8search1turn14search0