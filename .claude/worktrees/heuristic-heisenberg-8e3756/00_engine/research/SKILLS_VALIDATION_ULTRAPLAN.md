# Skills-Validation Ultraplan — cross-check the engine against all installed skills

## Premise
~30 domain skills installed this session. Pattern that's worked: cross-check each
skill's methodology against the matching engine code → fix genuine bugs/gaps.
4 already found (firestore userId, AML/KYC ×4, cap-rate NOI ×2, negative leverage).
**Key finding:** `returnsEngine.ts` is comprehensive + golden-tested (cap rate, CoC,
YOC, debt yield, equity multiple, levered IRR, hold matrix). Bugs live in **page-level
quick recomputations that bypass the engine** — those are the hunt.

## Sprints (priority order = bug-finding ROI)

### Sprint 1 — Page-metric audit + core-math spot-validation `[doing]`
Skills: `real-assets`, `time-value-of-money`, `return-calculations`, `creating-financial-models`, `cre-underwriting`.
- Audit every page that recomputes a metric inline (cap rate ✓ fixed ×2) — sweep for
  others bypassing `returnsEngine` (debt yield, cash flow, CoC, GRM, NOI).
- Surface **cash-on-cash** on the Deal Analyzer (the #1 investor return metric — in the
  engine, not on the analyzer). Uses corrected NOI − debt service ÷ cash invested.
- Spot-validate `computeXIRR` + equity-multiple vs TVM/return-calc worked examples.

### Sprint 2 — Debt & leverage `[done: negative leverage]`
Skills: `debt-tool`, `cre-financing`, `cre-capital-markets`, `covenant-analysis`.
- Negative leverage ✓ (3e12b57).
- Binding-constraint label (LTV vs DSCR) on the max-loan path.
- Day-one vs stabilized DSCR flag (lease-up risk).
- **Refi proceeds gap** (capital-markets): at maturity/reset, can the property refi
  enough to retire the existing balance? Real ARM/balloon risk → RefiTracker.
- DSCR-covenant breach warning (covenant-analysis: maintenance test).

### Sprint 3 — Credit risk
Skills: `credit-scoring-models`, `rating-methodologies`, `lending`, `debt-management`.
- Validate `ficoAdjustment` bands + default-probability-by-DSCR-tier vs methodology.
- NOTE: Altman-Z/Merton are corporate; limited transfer to residential consumer credit.
  Expect mostly "validated."

### Sprint 4 — Compliance `[done: FN engine]`
Skills: `anti-money-laundering`, `know-your-customer`, `operations:kyc-*`, `firebase-security-rules-auditor`.
- FN engine ✓ (4879f54). Re-audit firestore after this session's changes.
- Check the lead-capture flow for KYC/source-of-funds + the rules-grid.

### Sprint 5 — Code quality
Skills: `vercel-react-best-practices`, `vitest`.
- React perf review (HeroProof GSAP timeline, page memoization, re-renders).
- Test-coverage gaps (new modules: leverageCheck, secondLien, rentIntegrity, insurance).

### Out of scope (CRE-institutional workflow, not a residential DSCR engine)
`loi-generator`, `dd-tracker`, `scout`, `market-pulse`, `acq-investment-report`,
`the-gavel`, `cre-legal-reviewer`, `waterfall` (GP/LP equity), `financial-analysis:lbo/3-statement/comps`
(capital-markets). Installed as reference; not engine-validation targets.

## Method
Per sprint: read the skill's formula/rules → grep the matching engine/page code →
classify MATCH / OURS-BETTER / BUG / GAP → fix genuine ones with tests + live verify →
commit per sprint. Protect golden/flagship locks.
