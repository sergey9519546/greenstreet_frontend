# Rigorous Review Log - 2026-06-26

Scope: `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE`

This log is the slower, evidence-based review pass requested after the automated inventory was judged insufficient. Nothing in this log means a file has been deleted. A file is only marked "fully reviewed" here after its contents were opened and assessed in context.

## Review Standard

- `Read`: file content was opened, not just listed.
- `Understood`: main subject and project role were identified.
- `Compared`: checked against nearby/canonical files or current project structure when relevant.
- `Action`: KEEP, MERGE, ARCHIVE, DELETE, or NEEDS HUMAN REVIEW.

Generated dependency folders and raw machine datasets need a separate standard: they can be byte-read and schema/provenance-reviewed, but they are not "documents" in the same sense as research Markdown, PDFs, docs, spreadsheets, and specs.

## Current Scope Count

- Non-`node_modules` files requiring review or provenance classification: 3,963.
- Markdown documents outside `node_modules`: 1,300.
- PDFs: 61.
- Spreadsheets: 28.
- CSVs: 147.
- Parquet files: 651.
- Source/config/scripts outside `node_modules`: Python/TypeScript/JS/shell/config files across active app, tooling, and reference code.

## Batch 1 - Root Control and Navigation Files

### `AGENTS.md`

- Read: yes.
- Subject: project-scoped operating rules for DSCR Sovereign OS / 20X DSCR Deal Engine.
- Contains: canonical path warning, research/ultrathink mode, active app path, legacy code rules, verifier-on-ship standard, compliance source rules.
- Unique value: high. This is the strongest file for agent behavior and safety rules.
- Overlap: some overlap with README and cleanup docs, but this is operationally authoritative.
- Quality/currentness: current and critical.
- Action: KEEP at root.
- Reason: required by project workflow; moving/deleting would break agent behavior.

### `README.md`

- Read: yes.
- Subject: monorepo overview, intended architecture, quick start, package/data/docs layout, compliance warnings.
- Contains: target architecture for apps/packages/data/docs, development commands, data pipeline, package descriptions, compliance reminders, production calibration table.
- Unique value: medium-high, but parts are aspirational or stale because `apps/` and `packages/` are not fully materialized in the current folder.
- Overlap: overlaps with `ORGANIZATION_PLAN.md` and `AGENTS.md`.
- Quality/currentness: useful as root orientation, but needs later correction after physical structure is finalized.
- Action: KEEP at root, later update after cleanup.
- Reason: root README is the project entry point; not a duplicate even if some sections overlap.

### `TASKS.md`

- Read: yes.
- Subject: active work tracker.
- Contains: current website/app tasks, active gaps, done items, tags.
- Unique value: high for current execution state.
- Overlap: little; not a research doc.
- Quality/currentness: current task board.
- Action: KEEP at root.
- Reason: live operational state; should not be merged into research corpus.

### `ORGANIZATION_PLAN.md`

- Read: yes.
- Subject: target workspace organization and migration plan.
- Contains: problems identified, target structure, migration action table, code/data/docs consolidation plan, size budget, risk notes.
- Unique value: high for cleanup strategy, but some statements are already changed by current cleanup work.
- Overlap: overlaps with `00_MOCs/WORKSPACE_FILE_DISPOSITION_2026-06-25.md`, `ROOT_MD_INVENTORY_CATEGORIZATION.md`, and this new review log.
- Quality/currentness: useful but should become a living plan or be archived once a final cleanup plan replaces it.
- Action: KEEP for now; later MERGE into final cleanup plan.
- Reason: important planning context; not safe to delete until superseded by an accepted final plan.

### `00_MASTER_README.md`

- Read: yes.
- Subject: manifest for archived dataset/session bundles.
- Contains: archive structure, source bundle descriptions, dataset sources, reproduction steps, CA-DSCR/DPS algorithm summary, source URLs.
- Unique value: high for provenance of source archives.
- Overlap: overlaps with data manifests and attachment contents, but this is the top-level archive map.
- Quality/currentness: useful historical manifest; includes a cleanup note pointing to moved archives.
- Action: KEEP at root for now; later consider moving to `docs/data-lineage/` only after all references are updated.
- Reason: reports reference this as archive manifest.

### `ROOT_MD_INVENTORY_CATEGORIZATION.md`

- Read: yes.
- Subject: prior root Markdown inventory and categorization.
- Contains: category map, file-by-file disposition for the former 58 root Markdown files, duplicate/version notes, proposed structure.
- Unique value: medium. It is now historical because many files were moved, but it records reasoning.
- Overlap: overlaps with current review outputs.
- Quality/currentness: useful audit artifact, not current source of truth.
- Action: ARCHIVE later under `00_MOCs/_archive/cleanup_runs/` after current rigorous review supersedes it.
- Reason: preserve as prior cleanup evidence, but do not use as final source of truth.

### `CLAUDE.md`

- Read: yes.
- Subject: Claude/graphify rules.
- Contains: instruction to read graphify report before architecture/codebase answers and rebuild graph after code modifications.
- Unique value: high for tool behavior.
- Overlap: small overlap with README graphify references.
- Quality/currentness: active config.
- Action: KEEP at root.
- Reason: tool-specific root config.

### `CLAUDE_MEMORY.md`

- Read: yes.
- Subject: working memory for Greenstreet/DSCR tasks.
- Contains: project focus, key terms, user preferences, current active focus.
- Unique value: high for current operational context.
- Overlap: overlaps with `TASKS.md`, but has preferences and project memory not present elsewhere.
- Quality/currentness: useful but may need refresh after cleanup.
- Action: KEEP at root for now.
- Reason: live memory/config file, not a research duplicate.

### `.obsidianignore`

- Read: yes.
- Subject: Obsidian ignore rules.
- Contains: ignored build artifacts, code/data files, non-research folders, audit state, legacy vault paths.
- Unique value: high for vault behavior.
- Overlap: none significant.
- Quality/currentness: mostly current, but may need path updates after folder moves.
- Action: KEEP at root; later update after final folder structure.
- Reason: prevents Obsidian graph from being polluted by generated/source/data files.

### `package.json`

- Read: yes.
- Subject: root Node/Turborepo workspace config.
- Contains: workspace declarations, scripts, turbo/typescript dev dependencies, Node/Python engine constraints.
- Unique value: high if root workspace will remain monorepo orchestrator.
- Overlap: README mentions commands but this is executable config.
- Quality/currentness: useful, but workspaces point to `apps/*` and `packages/*`, which are not fully populated yet.
- Action: KEEP; update only after workspace migration.
- Reason: active config, not a document duplicate.

### `pyproject.toml`

- Read: yes.
- Subject: Python/uv workspace config.
- Contains: project metadata, uv workspace package members, pytest/ruff/mypy settings.
- Unique value: high if Python packages are migrated into `packages/`.
- Overlap: README mentions packages, but this is executable config.
- Quality/currentness: partially aspirational because target package paths may not exist yet.
- Action: KEEP; reconcile with actual package layout later.
- Reason: active workspace config.

### `turbo.json`

- Read: yes.
- Subject: Turborepo pipeline config.
- Contains: build/test/lint/typecheck/dev pipeline definitions and outputs.
- Unique value: high if root monorepo orchestration remains.
- Overlap: package scripts refer to it.
- Quality/currentness: active config, but depends on root workspace layout being completed.
- Action: KEEP.
- Reason: executable workspace config.

## Batch 1 Summary

- KEEP: `AGENTS.md`, `README.md`, `TASKS.md`, `00_MASTER_README.md`, `CLAUDE.md`, `CLAUDE_MEMORY.md`, `.obsidianignore`, `package.json`, `pyproject.toml`, `turbo.json`.
- KEEP FOR NOW / MERGE LATER: `ORGANIZATION_PLAN.md`.
- ARCHIVE LATER AFTER SUPERSEDED: `ROOT_MD_INVENTORY_CATEGORIZATION.md`.
- DELETE: none.

## Batch 2 - Routing, Website Hub, Memory, and Research Index Files

### `00_website/INDEX.md`

- Read: yes.
- Subject: master information index for Greenstreet Finance / Sovereign OS corpus.
- Contains: four-bucket routing system: frontend hub, backend data, marketing ads, compliance ops; decision rights; source-file routing; claims not to make; source hierarchy.
- Unique value: high. It is a conceptual routing authority for separating website copy, backend math, marketing, and compliance.
- Overlap: overlaps with `docs/research/README.md`, `UNIFIED_HUB.md`, and cleanup docs, but it contains clearer "bucket ownership" than the newer docs.
- Quality/currentness: valuable but references old paths and files that have moved.
- Action: MERGE into a new canonical `docs/research/MASTER_SOURCE_OF_TRUTH.md` or `docs/INDEX.md`; keep original until links are updated.
- Reason: the four-bucket model is useful and should survive, but the old `00_website/` location should not remain the final source.

### `00_website/FRONTEND_HUB.md`

- Read: yes.
- Subject: website copy/source-of-truth hub for Greenstreet Finance.
- Contains: product identity, DSCR explanation, hero copy, hero metrics, stats panel, claim verification notes, How It Works tabs, case studies/testimonials, feature/value items, source references, and explicit unverified-claim warnings.
- Unique value: high. It flags dangerous website claims like `99.14%`, `88%`, and `99%+` as not yet cited to primary/internal sources.
- Overlap: overlaps with `docs/research/operational/UNIFIED_HUB.md` and likely app copy files in `greenstreet_frontend/`.
- Quality/currentness: incomplete but important; frontmatter says appendices pending. Strong for website claim governance.
- Action: MERGE into `docs/marketing/greenstreet/FRONTEND_HUB.md` or the canonical Greenstreet content hub; preserve unverified-claim warnings.
- Reason: not delete-safe; it contains source-tracing and claim-safety work.

### `memory/glossary.md`

- Read: yes.
- Subject: glossary / decoder ring for DSCR terms and codenames.
- Contains: DSCR, PITIA, ITIA, Non-QM, LTV, PPP, IO, STR, BRRRR, Track 1/2, Sovereign Engine v11, Golden Vectors, LLPA, Magic Buckets, product/codename definitions.
- Unique value: medium-high. It is concise and useful for agents/humans.
- Overlap: overlaps with README and research docs, but is much shorter and operationally useful.
- Quality/currentness: useful; may need updates because product naming has shifted.
- Action: KEEP, move/merge later into `docs/glossary.md` or `tools/glossary.md`.
- Reason: valuable reference, not redundant enough to delete.

### `docs/research/README.md`

- Read: yes.
- Subject: index for consolidated research folder.
- Contains: folder map, canonical starting points, cleanup rule.
- Unique value: medium-high as local navigation.
- Overlap: overlaps with root README and organization docs, but lives at the right level for research navigation.
- Quality/currentness: current and concise.
- Action: KEEP.
- Reason: useful folder-level index after root research move.

### `docs/superpowers/specs/2026-06-22-dscr-workspace-audit-design.md`

- Read status: discovered in Batch 2 listing, not yet fully read.
- Provisional subject: workspace audit/design spec.
- Action: PENDING next docs/superpowers batch.
- Reason: do not classify until read.

## Batch 2 Summary

- KEEP: `memory/glossary.md`, `docs/research/README.md`.
- MERGE: `00_website/INDEX.md`, `00_website/FRONTEND_HUB.md`.
- PENDING: `docs/superpowers/specs/2026-06-22-dscr-workspace-audit-design.md`.
- DELETE: none.

## Batch 3 - `docs/research/specs/` Master Specs and Upgrade Packs

### `docs/research/specs/DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md`

- Read: yes.
- Subject: broad definitive master blueprint for DSCR Sovereign OS / 20X DSCR Deal Engine.
- Contains: production architecture, data APIs, evidence/provenance schema, AI/ML/math layer, OBBBA tax layer, approval predictor, evidence vault, lender matrix, infrastructure, budget/timeline, monetization, moat, build sequence, correction register, architectural-debt integration.
- Unique value: very high. It is the strongest broad architecture and operating blueprint in the specs folder.
- Overlap: overlaps heavily with `DSCR_Sovereign_OS_Upgrade_Intelligence_Report_v2.md` and parts of the final canonical spec.
- Quality/currentness: strong but not safe as the sole compliance/canonical source because later correction material resolves at least one threshold conflict.
- Action: KEEP.
- Reason: primary architecture source. Use with correction overlay from `DSCR_Sovereign_OS_Final_Canonical_Specification.md`.

### `docs/research/specs/DSCR_Sovereign_OS_Final_Canonical_Specification.md`

- Read: yes.
- Subject: final canonical correction/resolution specification after review passes.
- Contains: resolution matrix, PA Act 6 threshold conflict handling, DSCR formula/golden-vector correction, SR 26-02 classification, Deephaven DSCR floor issue, IO formula, FinCEN/SR26 coverage, canonical parameter tables, kill criteria, stack, build phases, ethics/governance, remaining research.
- Unique value: very high. This is the correction layer that prevents older specs from being treated as fully current.
- Overlap: overlaps with the master blueprint, feature-engineering blueprint, DSCR formulas notes, and underwriting specs.
- Quality/currentness: likely the strongest internal reconciliation file, but regulatory values still require primary-source verification before operational use.
- Action: KEEP.
- Reason: should be merged into the eventual source-of-truth as the correction overlay.

### `docs/research/specs/DSCR_Underwriting_Engine_Master_Consolidated_v16.md`

- Read: yes.
- Subject: consolidated implementation specification for the underwriting engine.
- Contains: critical bug list, logic flaws, risk controls, exact formulas, regression tests, hand scenarios, implementation checklist, and output contract.
- Unique value: very high. It is more implementation-specific than the strategy documents.
- Overlap: overlaps with deterministic core and usable master specs, but contains concrete engineering corrections such as LTV convention, NOI growth exponent, breakeven occupancy, IO decimal-rate handling, DSCR tracks, ARM caps, tax/yield/waterfall logic.
- Quality/currentness: high for implementation; should be compared against final canonical regulatory corrections before code use.
- Action: KEEP.
- Reason: canonical underwriting implementation source.

### `docs/research/specs/DSCR_Engine_Master_Specification.md`

- Read: yes.
- Subject: zero-base advisor-grade DSCR decision engine specification.
- Contains: 11 modules, 40+ formulas, failure map, market/lender/expense findings, scoring systems, pseudocode, example deal analysis, limitations, and roadmap.
- Unique value: high. It preserves broad requirements and example reasoning not fully repeated in newer correction docs.
- Overlap: overlaps with v16, deterministic core, and AEGIS usable specs.
- Quality/currentness: useful but older and less corrected than v16/final canonical.
- Action: MERGE, then possibly ARCHIVE after extraction.
- Reason: keep until unique requirements/examples are extracted into a master spec.

### `docs/research/specs/DSCR_Sovereign_OS_Upgrade_Intelligence_Report_v2.md`

- Read: yes.
- Subject: V2 research-verified upgrade and production blueprint.
- Contains: architecture, data layer, AI/ML layer, tax layer, lender profiles, infrastructure, team/budget, monetization, moat, build order, correction register.
- Unique value: medium. It appears to be a predecessor/source draft for the v3 definitive blueprint.
- Overlap: strong overlap with `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md`.
- Quality/currentness: older than v3. Useful as provenance and comparison, not as the current source.
- Action: ARCHIVE after confirming all unique correction-register details are represented in v3/final canonical.
- Reason: not delete-safe yet because it may preserve provenance and earlier correction rationale.

### `docs/research/specs/DSCR_Sovereign_OS_Feature_Engineering_Blueprint.md`

- Read: yes.
- Subject: feature-engineering blueprint for DSCR default prediction and risk classification.
- Contains: DSCR T1/T2 features, LTV/credit/rent/rate/debt/reserve/property/tax/insurance/geographic/after-tax/lender compatibility variables, PPP gates, Monte Carlo features, tornado sensitivity, return metrics, model architecture, kill criteria, output schema, research gaps, provenance framework.
- Unique value: high. It is the strongest feature taxonomy for ML/default-prediction work.
- Overlap: overlaps with final canonical and master blueprint, but most feature-level structure is unique.
- Quality/currentness: valuable; must carry correction notes from final canonical before implementation.
- Action: KEEP.
- Reason: canonical feature-engineering source, with correction overlay.

### `docs/research/specs/AEGIS_DSCR_Complete_Usable_Master_Doc_v3.md`

- Read: yes.
- Subject: clean AEGIS/Advisor-grade usable master spec.
- Contains: dual-ledger architecture, formula library, stress/scenario logic, qualifies-but-dangerous detection, audit/compliance layer, recommendation classes, validation, pseudocode, output schema, roadmap, limitations.
- Unique value: high for product shape and user-facing decision logic.
- Overlap: overlaps heavily with `Advisor_Grade_DSCR_Decision_Engine_Usable_Master_Spec.md` and deterministic core.
- Quality/currentness: strong conceptually; should not override later correction specs.
- Action: MERGE into master source-of-truth; keep until that exists.
- Reason: not redundant enough to delete because it preserves a coherent product spec.

### `docs/research/specs/AEGIS_DSCR_Deterministic_Core_Keeps_Detailed.md`

- Read: yes.
- Subject: deterministic formula and accounting-boundary backbone.
- Contains: formula registry standard, DSCR_L versus DSCR_E, GSI-to-EGI-to-NOI flow, rent-source confidence, economic OpEx, post-sale tax projection, debt-service formulas, lender/economic DSCR, stress suite, debt yield, liquidity survival clock, refi risk, LTV convention, cash-on-cash, IO illusion, breakpoints, ACS, qualifies-but-dangerous, minimum-gate ISS, scenario parameters, formula dependency map, validation battery, known limitations, adversarial defense logic, final vector output.
- Unique value: very high. This file preserves detailed math/accounting boundary decisions.
- Overlap: overlaps with v16 and usable master spec.
- Quality/currentness: high for deterministic engine logic. Important caution: it prevents double-counting expenses when investor/economic DSCR uses NOI.
- Action: KEEP.
- Reason: should be treated as canonical deterministic math backbone and merged into the source-of-truth.

### `docs/research/specs/AEGIS_DSCR_Advisor_Grade_Operating_Model_Upgrade_Pack.md`

- Read: yes.
- Subject: operating-model and governance upgrade pack.
- Contains: advisor-grade operating model, four non-negotiable rules, 9-module architecture, data intake schema, dual-ledger normalization, Delta Ledger, formula registry, lender matrix schema, investor survival engine, scenarios, breakpoints/deal repair, recommendation classes, TRID/Loan Estimate boundary, human-review triggers, audit log, MVP build sequence, user-facing report structure.
- Unique value: high for governance, audit, report structure, and module ordering.
- Overlap: overlaps with deterministic core and usable master specs.
- Quality/currentness: useful as an upgrade patch, not a standalone master spec.
- Action: MERGE.
- Reason: extract governance/report/audit sections into master source-of-truth.

### `docs/research/specs/AEGIS_DSCR_Algorithm_Gap_Upgrade_Pack.md`

- Read: yes.
- Subject: algorithmic blind-spot and gap patch.
- Contains: cap-rate-linked refi solver, matrix grid solver, sequential drawdown liquidity, seasonality trough, macro archetypes, ECOA proxy-risk lockout, tax-shield display, multi-year trajectory, IO reset cliff, ARM reset, expense inflation, rent validation, matrix staleness, multi-variable repair, counterfactuals, adverse-action reason codes, fair-lending monitoring, backtest/drift/outcome tracking.
- Unique value: very high. It captures failure modes and future-proofing not covered by static formula specs.
- Overlap: limited overlap with feature engineering and final canonical.
- Quality/currentness: strong as roadmap/gap list; some items are future roadmap rather than V1.
- Action: KEEP/MERGE.
- Reason: preserve as algorithmic risk backlog and merge critical gaps into source-of-truth.

### `docs/research/specs/Advisor_Grade_DSCR_Decision_Engine_Organized_Research.md`

- Read: yes.
- Subject: organized research and decision-engine synthesis.
- Contains: dual-ledger concept, formula tournament, architecture tournament, stress lattice, input confidence, recommendation logic, risk diagnosis, deal repair, adversarial validation, benchmark examples, data model, audit trail, compliance boundary.
- Unique value: medium-high. The formula/architecture tournament and rejected-formula reasoning are valuable provenance.
- Overlap: overlaps with AEGIS usable master, deterministic core, and v16.
- Quality/currentness: useful as source research, not the strongest current spec.
- Action: MERGE, then ARCHIVE after extraction.
- Reason: preserve tournament/rejected-approach reasoning before retiring the standalone draft.

### `docs/research/specs/Advisor_Grade_DSCR_Decision_Engine_Usable_Master_Spec.md`

- Read: yes.
- Subject: cleaned usable master specification for advisor-grade DSCR decision support.
- Contains: executive thesis, deterministic-math-first principle, dual-ledger analysis, no-universal-DSCR rule, no black-box recommendation logic, investor survival override, data intake/evidence labels, formula core, lender qualification ledger, investor survival ledger, qualifies-but-dangerous detector, stress/fragility engine, adversarial input auditor, breakpoint/deal repair engine, recommendation engine, optional simulation, audit/compliance layer, final output package, pseudocode, validation framework, V1 scope.
- Unique value: high. It is the clearest compact product/implementation spec for human reading.
- Overlap: overlaps with AEGIS complete usable doc and deterministic core.
- Quality/currentness: strong, but should be merged with v16/final canonical to avoid stale formula/regulatory details.
- Action: KEEP/MERGE.
- Reason: likely a good base for a future concise source-of-truth, with detailed math imported from deterministic core and corrections imported from final canonical.

### `docs/research/specs/The 2026 DSCR Master Knowledge Paper_ A Comprehensive Blueprint for the 20X DSCR Deal Engine.md`

- Read: yes.
- Subject: narrative master knowledge paper for the 20X DSCR Deal Engine.
- Contains: DSCR market thesis, core DSCR definitions, lender-guideline-derived DSCR/PITIA/ITIA explanations, reserve requirements, borrower eligibility, entity vesting, PPP, modules for qualification/reserves/sensitivity/loan structure/STR/lender matching/Monte Carlo/portfolio/refi, strategic differentiators, compliance framework, technical innovations, conclusion.
- Unique value: medium. It is useful as a synthesized narrative and citation map to source files, but much of the product architecture is covered more precisely elsewhere.
- Overlap: overlaps with master blueprint, engine master spec, and AEGIS specs.
- Quality/currentness: good narrative draft; citations point to local/source docs that still need verification. Some claims are broad and should not be treated as final without checking source documents.
- Action: MERGE useful narrative/citation map, then ARCHIVE.
- Reason: not a primary spec, but useful for executive context and source-tracing.

### `docs/research/specs/THE DEFINITIVE BLUEPRINT_ BUILDING THE BEST NON-QM WHOLESALE LENDER.md`

- Read: yes.
- Subject: strategic blueprint for a Non-QM wholesale lender using DSCR Sovereign OS as flagship.
- Contains: Non-QM market opportunity, algorithmic underwriting, P50/P99 debt sculpting, copula-based Monte Carlo, AEY/XIRR, hybrid OCR/document extraction, XAI/adverse action, fraud detection, RMBS/securitization strategy, warehouse lending, PPP branching gate, tax reassessment engine, external references.
- Unique value: high for business strategy and capital-markets/operations framing beyond the DSCR engine itself.
- Overlap: overlaps with DSCR engine specs on dual-track DSCR, Monte Carlo, PPP, tax reassessment, and adverse-action logic.
- Quality/currentness: strategy-heavy and citation-dependent. Market/regulatory claims need current verification before operational use.
- Action: KEEP/MERGE.
- Reason: preserves wholesale-lender/capital-markets context that is not fully captured in DSCR-only specs.

## Batch 3 Summary

- KEEP: `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md`, `DSCR_Sovereign_OS_Final_Canonical_Specification.md`, `DSCR_Underwriting_Engine_Master_Consolidated_v16.md`, `DSCR_Sovereign_OS_Feature_Engineering_Blueprint.md`, `AEGIS_DSCR_Deterministic_Core_Keeps_Detailed.md`.
- KEEP/MERGE: `AEGIS_DSCR_Complete_Usable_Master_Doc_v3.md`, `AEGIS_DSCR_Advisor_Grade_Operating_Model_Upgrade_Pack.md`, `AEGIS_DSCR_Algorithm_Gap_Upgrade_Pack.md`, `Advisor_Grade_DSCR_Decision_Engine_Usable_Master_Spec.md`, `THE DEFINITIVE BLUEPRINT_ BUILDING THE BEST NON-QM WHOLESALE LENDER.md`.
- MERGE THEN ARCHIVE: `DSCR_Engine_Master_Specification.md`, `Advisor_Grade_DSCR_Decision_Engine_Organized_Research.md`, `The 2026 DSCR Master Knowledge Paper_ A Comprehensive Blueprint for the 20X DSCR Deal Engine.md`.
- ARCHIVE AFTER COMPARISON: `DSCR_Sovereign_OS_Upgrade_Intelligence_Report_v2.md`.
- DELETE: none.

## Batch 3 Redundancy Map

- Strongest broad architecture: `DSCR_Sovereign_OS_Definitive_Master_Blueprint_v3.md`.
- Strongest correction overlay: `DSCR_Sovereign_OS_Final_Canonical_Specification.md`.
- Strongest implementation spec: `DSCR_Underwriting_Engine_Master_Consolidated_v16.md`.
- Strongest deterministic formula/accounting source: `AEGIS_DSCR_Deterministic_Core_Keeps_Detailed.md`.
- Strongest compact usable spec: `Advisor_Grade_DSCR_Decision_Engine_Usable_Master_Spec.md`.
- Strongest ML/feature taxonomy: `DSCR_Sovereign_OS_Feature_Engineering_Blueprint.md`.
- Strongest algorithmic gap backlog: `AEGIS_DSCR_Algorithm_Gap_Upgrade_Pack.md`.
- Strongest wholesale-lender strategy context: `THE DEFINITIVE BLUEPRINT_ BUILDING THE BEST NON-QM WHOLESALE LENDER.md`.

No file in this batch is delete-safe. The right cleanup action is consolidation into a source-of-truth bundle plus archive of predecessor drafts after extraction, not deletion.

## Batch 4 - `docs/research/analysis/` Research Reports and Strategic Analysis

### `docs/research/analysis/100_DSCR_BUSINESS_QUESTIONS_ANSWERED.md`

- Read: yes.
- Evidence markers: 168,678 bytes; about 21,174 words; SHA16 `0490b291ad4b2b21`.
- Subject: 100-question operational knowledge base for DSCR underwriting, compliance, platform design, risk, borrower behavior, implementation, and governance.
- Contains: sections for underwriting/qualification, income verification, collateral/property risk, loan structure/pricing, borrower profile/credit history, tax/accounting/investor survival, compliance/fair lending/adverse action, implementation/model governance, and continuous improvement. It includes disclaimers for pseudocode, lender-guideline currency, and legal/compliance limits.
- Unique value: very high. This is the strongest FAQ-style operational knowledge base and is easier to query than the long master blueprints.
- Overlap: overlaps with most specs and analysis docs, but the question-answer framing is unique.
- Quality/currentness: strong as a June 23, 2026 synthesis; still requires primary-source verification for regulatory and lender-specific claims before production use.
- Action: KEEP.
- Reason: should become or feed a canonical `docs/research/knowledge-base/DSCR_FAQ.md`.

### `docs/research/analysis/DSCR Intelligence System  Complete Master Knowledge Synthesis.md`

- Read: yes.
- Evidence markers: 52,980 bytes; about 8,035 words; SHA16 `382454b8a42eb940`.
- Subject: unified v11 master knowledge synthesis across 29 documents.
- Contains: corrected mathematical spine, reserve requirements, FICO/LTV caps, STR income, PPP module, tax engine, ARM/SOFR reset engine, insurance kill criterion, AEY ranking, lender matrix anchors, DSCR bands, verdict framework, return engine, probabilistic stress, four-score system, architecture/build order, evidence vault, compliance framework, market intelligence, tax/legal intelligence, underwriting gaps, business strategy, always/never reference card, and additional research flags.
- Unique value: high. It is a broad deduplicated synthesis and contains an explicit always/never card and open research list.
- Overlap: overlaps with `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md`, `DSCR_Sovereign_OS_Final_Canonical_Specification.md`, and Batch 3 specs.
- Quality/currentness: useful but has date-specific market/lender/legal claims. Regulatory items must be verified before use.
- Action: MERGE into master source-of-truth, then ARCHIVE.
- Reason: valuable synthesis, but not the cleanest standalone canonical file once the source-of-truth is built.

### `docs/research/analysis/DSCR Lender Intelligence  Deep Research on Topics Not Previously Covered.md`

- Read: yes.
- Evidence markers: 50,230 bytes; about 6,624 words; SHA16 `7d54a66f7dfdbf2c`.
- Subject: supplementary lender intelligence covering uncovered underwriting and market domains.
- Contains: underwriting anatomy, qualifying rent, rate pricing tiers, reserves, common decline reasons, seasoning rules, property eligibility, 5-8 unit dead zone, geographic restrictions, foreign nationals, no-ratio programs, LLC/entity vesting, primary-to-rental conversion, blanket/cross-collateral structures, capital stack, securitization, delinquency trends, broker economics, investor psychology, loan-type matrix, and references.
- Unique value: high. It captures practical lender/borrower edge cases not fully covered in formula-first specs.
- Overlap: overlaps with borrower profile analysis and 100-question document.
- Quality/currentness: useful but citation-heavy and guideline-sensitive.
- Action: KEEP/MERGE.
- Reason: preserve lender edge-case intelligence; merge key lender-policy sections into source-of-truth.

### `docs/research/analysis/DSCR Loan Approval and Borrower Profile Analysis.md`

- Read: yes.
- Evidence markers: 85,368 bytes; about 10,164 words; SHA16 `15222a99350c40d1`.
- Subject: borrower personas, approval patterns, and high-yield DSCR profile targeting.
- Contains: public case/lender-guideline analysis, real-world examples, current lender guidelines, borrower personas, high-approval borrower traits, gig/foreign-national/LLC personas, underwriting/approval patterns, geographic/property-type targeting, FICO/reserve patterns, income-source patterns, self-employed/1099 patterns, BRRRR/house-hack/portfolio-builder archetypes, demographic/ad-platform-friendly personas, highest-yield profile types, references.
- Unique value: high. This is the strongest borrower/persona and acquisition-targeting research file in this folder.
- Overlap: overlaps with `SOVEREIGN_RESEARCH_REPORT.md`, lender intelligence, and 100-question file.
- Quality/currentness: useful but relies on public examples and lender pages that may drift.
- Action: KEEP/MERGE.
- Reason: preserve persona intelligence; merge into marketing/intake/borrower strategy docs.

### `docs/research/analysis/DSCR Sovereign OS & Non-QM Wholesale Lender  The Definitive Master Research Report.md`

- Read: yes.
- Evidence markers: 52,938 bytes; about 6,544 words; SHA16 `28e2abf4c60bb9b8`.
- Subject: executive master research report validating DSCR Sovereign OS plus wholesale-lender strategy.
- Contains: market intelligence, algorithm validation, dual-track DSCR, AEY/XIRR, Monte Carlo/t-copula architecture, ARM reset double shock, bank statement engine, asset depletion, OCR pipeline, SHAP adverse action, regulatory audit, vendor stack validation, 12 critical gaps, continuous improvement, securitization roadmap, warehouse facility capital stack, tax-integrated underwriting, architecture risk assessment, strategic positioning, references.
- Unique value: medium-high. It bridges DSCR engine and broader wholesale-lender operating model.
- Overlap: overlaps strongly with `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md`, `THE MISSING PIECES...`, and Batch 3 wholesale-lender blueprint.
- Quality/currentness: executive synthesis; regulatory/market claims need verification.
- Action: MERGE, then ARCHIVE if the complete master document retains the unique gap/vendor/roadmap sections.
- Reason: useful bridge document, but probably superseded by the more complete master document plus missing-pieces report.

### `docs/research/analysis/frontier_dscr_strategy_guide.md`

- Read: yes.
- Evidence markers: 126,553 bytes; about 15,648 words; SHA16 `d5b006f3890fa6cd`.
- Subject: frontier/high-risk DSCR strategies and advanced investor niches.
- Contains: DSCR plus seller financing/subject-to/wrap-around strategy, blended capital stack arbitrage, due-on-sale risks, institutional exits, DSCR portfolio sales to REIT/private equity, PadSplit/co-living/assisted-living, macro resilience, fintech/AI disruption, foreclosure-law arbitrage, cross-border HNW investing, mixed-use/commercial-light, securitization impact, negative-DSCR/bridge-to-DSCR strategies, high-alpha persona, references.
- Unique value: high. This is the main source for advanced/high-risk frontier strategies not covered by conservative underwriting specs.
- Overlap: overlaps lightly with borrower/persona and strategy reports.
- Quality/currentness: exploratory and risk-heavy. Not suitable as operational guidance without legal/compliance review.
- Action: KEEP, likely in a `frontier` or `advanced-strategy` bucket.
- Reason: unique research. Archive only if the final knowledge base includes an explicit frontier/risky-strategies section.

### `docs/research/analysis/SIMILARWEB ANALYTICS REPORT.md`

- Read: yes.
- Evidence markers: 5,771 bytes; about 1,061 words; SHA16 `dae8d28bfc2cfa30`.
- Subject: competitive web-traffic intelligence for Non-QM lenders, PPE vendors, market data providers, rating/capital-markets, tech/compliance, and regulatory bodies.
- Contains: domain traffic table, non-QM lender traffic rankings, key observations, missing/API-limit notes.
- Unique value: medium-high. It is the only SimilarWeb-specific traffic snapshot found so far.
- Overlap: overlaps with competitive landscape sections, but contains unique traffic metrics.
- Quality/currentness: point-in-time Jul-Dec 2025 / generated June 18, 2026. Traffic data ages quickly.
- Action: ARCHIVE as `competitive-intelligence/snapshots/` after extracting current rankings if needed.
- Reason: useful historical competitive snapshot, not a durable source-of-truth.

### `docs/research/analysis/six-function-doctrine.md`

- Read: yes.
- Evidence markers: 19,681 bytes; about 2,970 words; SHA16 `203c938176511815`.
- Subject: operating doctrine for a category-defining DSCR lender.
- Contains: core thesis, six functions: scenario accuracy, guideline intelligence, borrower trust, capital partner trust, distribution, risk discipline; maturity scorecard; build sequence; market sources.
- Unique value: high. This is a concise strategic operating model and should not be buried in longer reports.
- Overlap: incorporated into `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md`, but the standalone doctrine is cleaner.
- Quality/currentness: good as doctrine; market-source claims need refresh over time.
- Action: KEEP.
- Reason: useful canonical strategy/doctrine file.

### `docs/research/analysis/SOVEREIGN_RESEARCH_REPORT.md`

- Read: yes.
- Evidence markers: 40,057 bytes; about 5,895 words; SHA16 `d9d660e4ddf4f4bc`.
- Subject: borrower intelligence, market report, and strategic guidance.
- Contains: market landscape, borrower profiles/personas, lender landscape, underwriting thresholds, pricing/economics, ad targeting and lead generation, compliance framework, geography, approval-weighted persona scoring model, operational recommendations, key data reference.
- Unique value: high for acquisition, persona scoring, and marketing/intake strategy.
- Overlap: overlaps with borrower profile analysis and 100-question file.
- Quality/currentness: useful June 2026 market synthesis; ad/compliance claims require review before campaign use.
- Action: KEEP/MERGE.
- Reason: merge persona-scoring and channel strategy into source-of-truth, keep until then.

### `docs/research/analysis/THE COMPLETE SOVEREIGN MASTER DOCUMENT.md`

- Read: yes.
- Evidence markers: 78,245 bytes; about 11,468 words; SHA16 `fd80d0f1a5e71e47`.
- Subject: full master document for DSCR Sovereign OS plus Non-QM wholesale lender.
- Contains: market intelligence, six-function doctrine, three audiences of every quote, three-plane architecture, stack, deterministic/legal core, dual-track DSCR, golden vectors, returns/after-tax/ARM engines, pricing/lender intelligence/compliance, Monte Carlo/t-copula stress, evidence vault, lender matrix, verdict/scoring, intake/fraud, regulatory compliance, wholesale lender ops, product suite, PPE, broker/TPO management, warehouse, hedging, MSR, QC, securitization, academic research, roadmap, acceptance criteria, reference registry, gap remediation.
- Unique value: very high as an executive/integrated master document.
- Overlap: overlaps with almost every analysis/spec file.
- Quality/currentness: broad and valuable, but not enough by itself for canonical use because specialized specs contain more precise formula/gap/correction content.
- Action: KEEP.
- Reason: strongest all-in-one strategy/ops synthesis; should be one pillar of the final source-of-truth.

### `docs/research/analysis/THE MISSING PIECES_ NON-QM WHOLESALE LENDER GAP ANALYSIS.md`

- Read: yes.
- Evidence markers: 7,565 bytes; about 1,065 words; SHA16 `cee1938b76fda275`.
- Subject: gap analysis between DSCR Sovereign OS and a fully operational Non-QM wholesale lender.
- Contains: 12 gaps across bank-statement engine, PPE, broker/TPO management, warehouse facility, asset depletion, foreign national/ITIN, MSR/secondary execution, pipeline hedging, QC, LOS integration, compliance/state licensing, investor relations/capital-partner portal; prioritized next steps.
- Unique value: high. It is the clearest short gap list.
- Overlap: repeated in complete master and definitive research report.
- Quality/currentness: concise and operationally useful.
- Action: KEEP/MERGE.
- Reason: useful as an active roadmap/gap checklist.

### `docs/research/analysis/UltraPlan Fact Check and Step-by-Step Implementation UltraPlan.md`

- Read: yes.
- Evidence markers: 39,619 bytes; about 5,124 words; SHA16 `24300bcd3ab73c9a`.
- Subject: fact-check and implementation plan for an UltraPlan.
- Contains: fact-check method, lender comparison/discrepancies, PPP/state rules, DSCR bands/payment-factor math, data-source APIs, architecture/OCR/evidence-vault design, phased implementation plan, open questions/limitations.
- Unique value: high. It is explicitly a fact-check document and records uncertainty/discrepancy remediation.
- Overlap: overlaps with specs and final canonical correction material.
- Quality/currentness: valuable because it warns against unsafe folk rules like simplistic `LLC/corp = PPP okay`.
- Action: KEEP/MERGE.
- Reason: preserve fact-check findings and legal uncertainty flags.

## Batch 4 Summary

- KEEP: `100_DSCR_BUSINESS_QUESTIONS_ANSWERED.md`, `DSCR Lender Intelligence  Deep Research on Topics Not Previously Covered.md`, `DSCR Loan Approval and Borrower Profile Analysis.md`, `frontier_dscr_strategy_guide.md`, `six-function-doctrine.md`, `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md`, `THE MISSING PIECES_ NON-QM WHOLESALE LENDER GAP ANALYSIS.md`, `UltraPlan Fact Check and Step-by-Step Implementation UltraPlan.md`.
- KEEP/MERGE: `SOVEREIGN_RESEARCH_REPORT.md`.
- MERGE THEN ARCHIVE: `DSCR Intelligence System  Complete Master Knowledge Synthesis.md`, `DSCR Sovereign OS & Non-QM Wholesale Lender  The Definitive Master Research Report.md`.
- ARCHIVE AS SNAPSHOT: `SIMILARWEB ANALYTICS REPORT.md`.
- DELETE: none.

## Batch 4 Redundancy Map

- Strongest all-in-one strategy/ops master: `THE COMPLETE SOVEREIGN MASTER DOCUMENT.md`.
- Strongest operational FAQ/knowledge base: `100_DSCR_BUSINESS_QUESTIONS_ANSWERED.md`.
- Strongest borrower/persona research: `DSCR Loan Approval and Borrower Profile Analysis.md` plus `SOVEREIGN_RESEARCH_REPORT.md`.
- Strongest lender edge-case research: `DSCR Lender Intelligence  Deep Research on Topics Not Previously Covered.md`.
- Strongest operating doctrine: `six-function-doctrine.md`.
- Strongest wholesale-lender gap list: `THE MISSING PIECES_ NON-QM WHOLESALE LENDER GAP ANALYSIS.md`.
- Strongest high-risk/frontier strategy source: `frontier_dscr_strategy_guide.md`.
- Point-in-time competitive traffic snapshot: `SIMILARWEB ANALYTICS REPORT.md`.

No file in this batch is delete-safe. Most consolidation should be extractive: build a source-of-truth bundle, then archive older syntheses after their unique sections are mapped.

## Batch 5 - `docs/research/deep-dives/` Deep Research, Formula Checks, and Correction Notes

### `docs/research/deep-dives/Deep Research Report_ Critical Areas for the 20X DSCR Deal Engine.md`

- Read: yes.
- Evidence markers: 27,122 bytes; about 2,914 words; SHA16 `36a5056b1479e361`.
- Subject: critical-area deep research for turning the 20X DSCR Deal Engine into a live platform.
- Contains: AI/OCR and document processing, market data APIs, Monte Carlo parameters/correlation, Rocket Pro TPO lender matrix, DSCR second-lien market, state PPP restrictions, STR regulatory gating, unit economics, refi/seasoning tracker, references.
- Unique value: medium-high. It has a compact four-domain view and second-lien/Rocket/STR/PPP details.
- Overlap: overlaps with master specs, lender intelligence, and build-ready research.
- Quality/currentness: useful but point-in-time; PPP/STR/lender details require verification before use.
- Action: MERGE, then ARCHIVE.
- Reason: extract second-lien, Rocket, and implementation details; then it can become a source draft.

### `docs/research/deep-dives/deep-research-report.md`

- Read: yes.
- Evidence markers: 5,075 bytes; about 680 words; SHA16 `9374c4c5154ca4ab`.
- Subject: Sprint A research readout and formula correction note.
- Contains: verification table, DSCR formula bible, golden math corrections, phase-one encoding recommendations; specifically rejects universal no-vacancy and universal FICO/LTV assumptions, and flags a wrong 8.25% math vector/status.
- Unique value: high despite short length because it records correction provenance.
- Overlap: overlaps with `DSCR_deep-research-report.md`, `DSCR_Formulas.md`, and final canonical correction material.
- Quality/currentness: correction-oriented and valuable. Claims still need source verification before production.
- Action: KEEP/MERGE.
- Reason: preserve as correction evidence for formula/golden-vector history.

### `docs/research/deep-dives/DSCR DUAL TRUTH ENGINE CHATGPT RESEARCH.md`

- Read: yes.
- Evidence markers: 35,643 bytes; about 5,295 words; SHA16 `1f68c10117405f77`.
- Subject: dual-track DSCR truth engine.
- Contains: architecture/source hierarchy, required inputs, rent-source hierarchy, Track A lender qualification, Track B investor survival, public program examples, stress-test ranges, fraud/data-quality controls, four-score system, truth matrix, worked example, production report layout, UI/report rules.
- Unique value: high. It is an earlier but coherent dual-track product/research source.
- Overlap: overlaps with AEGIS usable specs and deterministic core.
- Quality/currentness: useful as product logic; should be subordinated to later formula corrections.
- Action: MERGE, then ARCHIVE if fully absorbed.
- Reason: preserve truth-matrix/UI/report details.

### `docs/research/deep-dives/DSCR SOVEREIGN OS_ MASTER RESEARCH SYNTHESIS.md`

- Read: yes.
- Evidence markers: 27,029 bytes; about 3,376 words; SHA16 `1318548ce671ef81`.
- Subject: 16-domain academic/algorithmic/regulatory research synthesis.
- Contains: dual-track DSCR math, Monte Carlo, PPP law, property tax reassessment, after-tax modeling, AEY/XIRR, graph-native architecture, AI OCR, market APIs, STR, lender intelligence, ARM/SOFR reset, portfolio DSCR, compliance architecture, fraud detection, IC memo/report generation, appendix summary table.
- Unique value: high as a domain map and source/planning matrix.
- Overlap: overlaps with complete master document and architecture debt docs.
- Quality/currentness: useful planning map, but some technical/regulatory claims require verification.
- Action: KEEP/MERGE.
- Reason: useful as a research-domain index for the source-of-truth.

### `docs/research/deep-dives/DSCR_Appendix_B_Research_Resolution_Report.md`

- Read: yes.
- Evidence markers: 18,523 bytes; about 2,778 words; SHA16 `8391fb4985cf4d2d`.
- Subject: Appendix B research resolution report.
- Contains: resolution of flagged items including MBA Q1 2026 commercial mortgage delinquency, AirDNA pricing, LenderSA threat, CFPB Section 1071, Ohio PPP threshold, Pennsylvania LIPL threshold, HOEPA 2026 thresholds, RentCast pricing, 40-year amortization lender matrix, Deephaven DSCR second/subordinate lien, TimesFM benchmarks, compliance calendar updates, remaining open research.
- Unique value: very high. It is a correction/resolution register and may supersede placeholders in master docs.
- Overlap: overlaps with final canonical and master blueprint correction registers.
- Quality/currentness: valuable but compliance/regulatory values require primary-source verification before use.
- Action: KEEP.
- Reason: canonical research-resolution evidence, not delete-safe.

### `docs/research/deep-dives/DSCR_deep-research-report.md`

- Read: yes.
- Evidence markers: 19,703 bytes; about 2,451 words; SHA16 `014c991e3fcb3ef1`.
- Subject: DSCR formula audit and golden test suite.
- Contains: lender-qualifying DSCR, investor-survival DSCR, rent-source rules, PITIA/ITIA treatment, golden math test suite, ambiguities/lender-specific rules, formula-to-rule mapping, implementation notes, Mermaid computation flow.
- Unique value: medium-high. It is clearer and more detailed than `DSCR_Formulas.md`.
- Overlap: overlaps with `deep-research-report.md`, `DSCR_Formulas.md`, and Batch 3 deterministic core.
- Quality/currentness: useful, but should be checked against final canonical and v16 before encoding.
- Action: MERGE, then ARCHIVE.
- Reason: extract formula-flow and test-suite details; do not let it override stronger later correction docs.

### `docs/research/deep-dives/DSCR_Formulas.md`

- Read: yes.
- Evidence markers: 3,637 bytes; about 499 words; SHA16 `849adb8c32b61648`.
- Subject: short dual-track DSCR formula note.
- Contains: Track A/Track B formula summary, golden test suite summary, rent/IO rules, formula bible, deliverables, recommendations.
- Unique value: low-medium. It is concise, but much of it is represented better in later formula reports and deterministic core.
- Overlap: heavy overlap with `DSCR_deep-research-report.md`, `deep-research-report.md`, v16, and final canonical.
- Quality/currentness: caution. Later correction material indicates some golden-vector/formula assumptions from this lineage were rejected or corrected.
- Action: ARCHIVE / NEEDS HUMAN REVIEW before any deletion.
- Reason: not a current source-of-truth, but preserve as provenance for formula conflicts until the corrected master is complete.

### `docs/research/deep-dives/dscr_research_v2_rigorous_2026-06-22.md`

- Read: yes.
- Evidence markers: 21,852 bytes; about 2,060 words; SHA16 `a8b6b78fd420087e`.
- Subject: higher-rigor borrower/profile synthesis.
- Contains: evidence-tier methodology, capital-markets/securitization evidence, public case files, high-approval borrower characteristics, non-traditional personas, geography/property-type targeting, credit profile patterns, income-source patterns, self-employed/1099, investor archetypes, ad-platform-safe persona targeting, highest-yield profiles, avoid list.
- Unique value: high. It improves earlier persona research by prioritizing securitization and market-level evidence over lender marketing.
- Overlap: overlaps with borrower profile analysis and sovereign research report.
- Quality/currentness: strong methodology; still point-in-time.
- Action: KEEP/MERGE.
- Reason: strongest rigorous borrower/persona evidence pass.

### `docs/research/deep-dives/dscr_sovereign_os_architectural_debt_and_math.md`

- Read: yes.
- Evidence markers: 37,316 bytes; about 5,533 words; SHA16 `442cbbd397d83982`.
- Subject: architectural debt and institutional-grade mathematics.
- Contains: eight debts: DSCR as ratio not risk metric, no propagated uncertainty, independent-input Monte Carlo, no forward rate surface, no PD/LGD/EAD credit loss model, no contagion model, no LLM hallucination firewall, no model version tracking; R-vine copula, EVT, Nelson-Siegel-Svensson, Kalman filter, CECL, Gaussian Process, Merton model, CVaR, SR 26-02 model governance, implementation matrix.
- Unique value: high, but there is a longer "complete research edition" version.
- Overlap: heavily overlaps with `dscr_sovereign_os_deep_debt_analysis.md`.
- Quality/currentness: useful but likely predecessor to the complete edition.
- Action: MERGE/ARCHIVE after comparing with `dscr_sovereign_os_deep_debt_analysis.md`.
- Reason: preserve until unique content versus complete edition is confirmed.

### `docs/research/deep-dives/dscr_sovereign_os_deep_debt_analysis.md`

- Read: yes.
- Evidence markers: 45,950 bytes; about 6,147 words; SHA16 `480663614377a653`.
- Subject: complete research edition of deep architectural debt analysis.
- Contains: market validation of architectural debts, detailed treatment of DSCR ratio limits, propagated uncertainty, R-vine/tail-dependent Monte Carlo, ARM term-structure modeling, CECL credit loss, portfolio contagion, LLM hallucination firewall, evidence-vault model version tracking, mathematical priority stack, conclusion.
- Unique value: very high. This appears to be the stronger/current version of the architectural debt analysis.
- Overlap: overlaps with `dscr_sovereign_os_architectural_debt_and_math.md` and master synthesis.
- Quality/currentness: strong for advanced risk architecture; market/regulatory claims still need verification.
- Action: KEEP.
- Reason: strongest architectural-debt/risk-math source in deep-dives.

### `docs/research/deep-dives/Master DSCR Knowledge Document.md`

- Read: yes.
- Evidence markers: 21,212 bytes; about 3,001 words; SHA16 `0daf432dbfe5976e`.
- Subject: concise master DSCR knowledge synthesis.
- Contains: core principles, dual-track principle, DSCR calculation/income qualification, borrower eligibility, property/collateral, pricing/PPP, reserves/assets, risk/stress, lender intelligence/program matching, technical architecture, compliance/regulatory considerations, unit economics/business strategy, references.
- Unique value: medium. Useful concise synthesis, but less detailed than the later master docs.
- Overlap: overlaps with many specs and analysis docs.
- Quality/currentness: good summary, but likely superseded by stronger master documents and correction reports.
- Action: MERGE, then ARCHIVE.
- Reason: extract concise structure and references if useful; not likely final canonical.

### `docs/research/deep-dives/NEW_DSCR Deal Desk Build-Ready Research Report.md`

- Read: yes.
- Evidence markers: 32,812 bytes; about 4,477 words; SHA16 `ef032b793170006c`.
- Subject: build-ready research report for a DSCR deal desk.
- Contains: market-switching thesis, verification matrix by capability, product requirements, lender intelligence/source-system requirements, OCR/evidence/API design, compliance and UX deliverables, build tickets with acceptance tests, Monte Carlo calibration memo, golden unit-test suite, risks/mitigations, open questions.
- Unique value: high. It translates research into tickets and acceptance tests.
- Overlap: overlaps with implementation specs and UltraPlan.
- Quality/currentness: useful for execution planning.
- Action: KEEP/MERGE.
- Reason: preserve build-ticket/acceptance-test material.

### `docs/research/deep-dives/recheck_deep-research-report.md`

- Read: yes.
- Evidence markers: 21,180 bytes; about 2,851 words; SHA16 `2e4292215611f98d`.
- Subject: recheck report for DSCR formulas, golden test cases, state PPP rules, lender matrix, research timeline, engineering next steps.
- Contains: formula/golden-case conclusions, PPP rules for selected states, lender guidelines matrix, engineering next steps.
- Unique value: medium. It contains a recheck trail and some PPP/lender matrix material.
- Overlap: overlaps with formula reports, final canonical, Appendix B, and UltraPlan.
- Quality/currentness: caution. It conflicts with the stronger deterministic-core position by saying Track B excludes operating expenses/vacancy/management in places. Treat as evidence of a disputed/superseded interpretation, not current truth.
- Action: NEEDS HUMAN REVIEW / ARCHIVE.
- Reason: do not delete because it explains a conflict, but do not use as source-of-truth without resolving against v16/final canonical/primary sources.

## Batch 5 Summary

- KEEP: `DSCR_Appendix_B_Research_Resolution_Report.md`, `dscr_sovereign_os_deep_debt_analysis.md`, `dscr_research_v2_rigorous_2026-06-22.md`, `NEW_DSCR Deal Desk Build-Ready Research Report.md`.
- KEEP/MERGE: `deep-research-report.md`, `DSCR DUAL TRUTH ENGINE CHATGPT RESEARCH.md`, `DSCR SOVEREIGN OS_ MASTER RESEARCH SYNTHESIS.md`.
- MERGE THEN ARCHIVE: `Deep Research Report_ Critical Areas for the 20X DSCR Deal Engine.md`, `DSCR_deep-research-report.md`, `Master DSCR Knowledge Document.md`.
- MERGE/ARCHIVE AFTER COMPARISON: `dscr_sovereign_os_architectural_debt_and_math.md`.
- ARCHIVE / NEEDS HUMAN REVIEW: `DSCR_Formulas.md`, `recheck_deep-research-report.md`.
- DELETE: none.

## Batch 5 Redundancy Map

- Strongest correction/resolution register: `DSCR_Appendix_B_Research_Resolution_Report.md`.
- Strongest architectural debt/risk-math file: `dscr_sovereign_os_deep_debt_analysis.md`.
- Earlier architectural debt version: `dscr_sovereign_os_architectural_debt_and_math.md`.
- Strongest build-ready implementation bridge: `NEW_DSCR Deal Desk Build-Ready Research Report.md`.
- Strongest rigorous borrower/persona follow-up: `dscr_research_v2_rigorous_2026-06-22.md`.
- Formula/golden-test lineage: `deep-research-report.md`, `DSCR_deep-research-report.md`, `DSCR_Formulas.md`, `recheck_deep-research-report.md`.

No file in this batch is delete-safe yet. The main cleanup move is to archive disputed formula notes after the corrected master formula source is written and tests are pinned.

## Batch 6 - `docs/research/ml-architecture/`, `docs/research/operational/`, and `docs/research/sprints/`

### `docs/research/ml-architecture/TimesFM 2.5 LoRA Upgrade Blueprint.md`

- Read: yes.
- Evidence markers: 9,313 bytes; about 1,143 words; SHA16 `838992cfcd85ec96`.
- Subject: concise TimesFM 2.5 LoRA upgrade runbook.
- Contains: LoRA versus full fine-tuning rationale, 500-property-month trigger, GPU provisioning, dependency install, training-data preparation, adapter configuration, training loop, temporal cross-validation, save/deploy steps, pipeline config update, hyperparameters, anti-leakage rules, integration architecture.
- Unique value: medium-high. It is a compact operational checklist.
- Overlap: overlaps with `TimesFM_LoRA_Complete_Engineering_Spec.md`.
- Quality/currentness: useful as a runbook; less complete than the engineering spec.
- Action: MERGE into the complete engineering spec or keep as a short runbook.
- Reason: not delete-safe until its deployment checklist is confirmed present in the complete spec.

### `docs/research/ml-architecture/TimesFM_LoRA_Complete_Engineering_Spec.md`

- Read: yes.
- Evidence markers: 48,935 bytes; about 5,811 words; SHA16 `fc60415907494639`.
- Subject: complete TimesFM 2.5 + LoRA engineering specification.
- Contains: TimesFM architecture, ICF/LoRA/hybrid modes, LoRA fine-tuning implementation, DSCR-specific dataset construction, LoRA config, quantile loss, training loop, save/version/deploy, XReg covariates, NSS forward curve inputs, GITCO context hardening, integration with R-vine Monte Carlo and CECL, approval predictor, good-customer labels, monotonic constraints, SHAP adverse action, backtesting, evidence-vault provenance, deployment architecture, retraining schedule, minimum data requirements.
- Unique value: very high. This is the canonical ML/forecasting architecture document.
- Overlap: overlaps with the short LoRA blueprint and advanced algorithm reports.
- Quality/currentness: high for architecture; implementation claims should still be validated against actual TimesFM package/API versions before build.
- Action: KEEP.
- Reason: strongest TimesFM/LoRA engineering source.

### `docs/research/operational/Actionable Next Steps for the 20X DSCR Deal Engine.md`

- Read: yes.
- Evidence markers: 3,220 bytes; about 453 words; SHA16 `a458f25e68806693`.
- Subject: short next-step action list.
- Contains: FRED/Zillow API integration, Ocrolus OCR pilot, Monte Carlo calibration, Rocket Pro matrix update, second-lien parameters, PPP validator, STR registration gating, refi/seasoning tracker, unit economics by channel.
- Unique value: low-medium. Useful concise checklist, but most items appear in richer plans.
- Overlap: overlaps with build-ready report, sprint plans, and operational hub.
- Quality/currentness: actionable but dated/partial.
- Action: MERGE, then ARCHIVE.
- Reason: keep until all action items are represented in the current roadmap.

### `docs/research/operational/DSCR_Blueprint_Verification_Corrections_Log.md`

- Read: yes.
- Evidence markers: 7,624 bytes; about 1,212 words; SHA16 `c62d17ab3d199156`.
- Subject: verification and corrections log for the DSCR blueprint.
- Contains: section-by-section verification summary, critical corrections for RentCast pricing, Rocket Pro, Angel Oak, FinCEN BOI, PA Act 6 threshold, Ohio citation, Griffin licensing/max loan amount, Ocrolus document count; addenda for TimesFM 2.5, OBBBA, CPTC, FinCEN RRE rule, and confirmed accurate items.
- Unique value: very high. Correction logs are high-value provenance and protect against repeating known mistakes.
- Overlap: overlaps with Appendix B and final canonical correction material.
- Quality/currentness: valuable but regulatory/vendor values require re-verification before operational use.
- Action: KEEP.
- Reason: correction provenance should remain accessible.

### `docs/research/operational/DSCR_Command_Center_v7_Master_Consolidated_Audit (1).md`

- Read: yes.
- Evidence markers: 430,519 bytes; about 63,937 words; SHA16 `4ce3493615c770d3`; 497 headings.
- Subject: master consolidated audit file for DSCR Command Center v7.0.
- Contains: executive summary, math kernel, dual-track architecture, verified lender profiles, state PPP matrix, reserves/liquidity, STR underwriting, rate calibration, confidence scoring, acquisition/execution scoring, compliance controls, technical architecture, risk register, open gaps, source URL appendix, source-tier labeling audit, regression test plan, build kickoff action items, multi-round audit history, hallucination/source-tier controls.
- Unique value: very high as audit/provenance. It is too large to be the everyday working source, but it contains evidence and test planning not safely discardable.
- Overlap: overlaps with `UNIFIED_HUB.md`, correction logs, specs, and sprint plans.
- Quality/currentness: legacy v7 audit. Strong evidence artifact, but not necessarily current canonical truth after later correction passes.
- Action: KEEP, likely move under `docs/research/_archive/audit-provenance/` only after `UNIFIED_HUB.md` and source-of-truth cite it.
- Reason: not a cleanup target for deletion; it is an audit trail.

### `docs/research/operational/UNIFIED_HUB.md`

- Read: yes.
- Evidence markers: 258,254 bytes; about 39,406 words; SHA16 `a7ca97029403bd3d`; 297 headings.
- Subject: Greenstreet Finance unified information hub across foundation, frontend, backend, marketing, compliance, data sources, and appendices.
- Contains: product identity, DSCR explanation, dual-track doctrine, market context, frontend copy, stats, FAQs, lender network, lender signals, formulas, golden vectors, capital markets benchmarks, gross yields, investor concentration, after-tax engine, insurance risk, risk register, marketing/personas/geo/ad copy, compliance anchors, HOEPA/YSP, Section 1071, state PPP, STR legality, usury, FEMA/FHFA/Fannie/Freddie/SR 26-02 data, backend data-source index, citation index, contradictions/resolutions, glossary, verification status, live rate anchors, SOFR curve, lender qualification matrix, FICO/LTV caps, STR documentation, OBBBA, market/fraud/STR data, algorithm stack, data APIs, lead scoring, deal quality scoring, rate optimization, and newly appended dataset/performance evidence.
- Unique value: very high. This is currently the closest cross-functional source-of-truth document.
- Overlap: overlaps with almost everything else, but it acts as an integrator rather than just another draft.
- Quality/currentness: important but not clean enough to be final. It includes status/frontmatter, old path references, regulatory claims needing verification, and a stray conversational sentence at the end that should be removed during cleanup.
- Action: KEEP and CLEAN.
- Reason: make this the main hub or split it into canonical sub-hubs. Do not delete.

### `docs/research/sprints/Build_Phase1_Deterministic_Core_Plan.md`

- Read: yes.
- Evidence markers: 15,062 bytes; about 1,755 words; SHA16 `6c0b569630d966b3`.
- Subject: Phase 1 deterministic core and evidence-vault implementation plan.
- Contains: objectives, architecture, Track 1/Track 1 IO/Track 2/Track 3/Track 4 DSCR module plans, QuantLib P&I, golden vector suite, 122-test target, evidence vault schema, SHA-256 hashing, staleness detection, lender matrix engine, tax engine, project structure, week-by-week schedule, gate criteria.
- Unique value: high for implementation planning.
- Overlap: overlaps with v16, build-ready report, and correction logs.
- Quality/currentness: useful plan; should be reconciled with project mode because code is support infrastructure, not the primary product.
- Action: KEEP/MERGE.
- Reason: preserve as deterministic-core build plan and test target source.

### `docs/research/sprints/DSCR Sovereign OS  Godmode Research Plan — Data, Algorithms & Computation That Beat All Competitors.md`

- Read: yes.
- Evidence markers: 58,171 bytes; about 7,243 words; SHA16 `8cfab170c7cb8830`.
- Subject: Godmode research plan and data/algorithm execution roadmap.
- Contains: mission statement, primary data sources by tier, FRED/API sources, commercial APIs, institutional intelligence, deterministic foundation, probabilistic engine, AUS replication, after-tax IRR, lender intelligence pipeline, STR regulation database, compliance engine, live PPP database, MN HF 3437, sprints 0-6, research queues, technology stack, moat summary, references.
- Unique value: high as research execution roadmap.
- Overlap: overlaps with live research execution, upgrade intelligence, complete master document.
- Quality/currentness: valuable but strategy-heavy and dated to June 18, 2026.
- Action: KEEP/MERGE.
- Reason: source for research roadmap and data-source acquisition plan.

### `docs/research/sprints/DSCR Sovereign OS  Live Research Execution — Sprint 0 & 1 Findings.md`

- Read: yes.
- Evidence markers: 41,123 bytes; about 5,799 words; SHA16 `250c28025e880999`.
- Subject: dated Sprint 0/1 live research findings.
- Contains: rate anchors, SOFR forward curve, conforming/non-QM rate context, DSCR lender qualification matrix, STR documentation matrix, OBBBA bonus depreciation, market state, home-price indices, fraud risk, AirDNA STR outlook, API access tracker, research gaps, stress framework calibration, completion status, references.
- Unique value: high as a dated evidence snapshot.
- Overlap: overlaps with `UNIFIED_HUB.md`, godmode plan, and final specs.
- Quality/currentness: values are time-sensitive; should not be treated as current beyond its date.
- Action: ARCHIVE AS SNAPSHOT after extracting any still-current source links and gaps.
- Reason: retain provenance but do not use as live rates/lender truth.

### `docs/research/sprints/DSCR Sovereign OS  Upgrade Intelligence Report — Advanced Algorithms, Emerging Tools & Architecture Paths No Competitor Has Assembled.md`

- Read: yes.
- Evidence markers: 37,694 bytes; about 4,905 words; SHA16 `494af1ece2aeba70`.
- Subject: advanced algorithm and emerging-tool upgrade intelligence.
- Contains: LightGBM/XGBoost/CatBoost/TFT/TimesFM/FinBERT upgrade paths, competitive/infrastructure tools, research frontier, roadmap by impact, practitioner intelligence, moat stack, open research queue, references.
- Unique value: high as algorithm backlog and competitive scan.
- Overlap: overlaps with ML architecture and architectural debt docs.
- Quality/currentness: research-frontier claims age quickly; useful as backlog, not canonical truth.
- Action: KEEP/MERGE.
- Reason: preserve algorithm-upgrade queue.

### `docs/research/sprints/DSCR_Sovereign_OS_Phase3_Synthesis_Report.md`

- Read: yes.
- Evidence markers: 1,126 bytes; about 154 words; SHA16 `06b57de3c72690d1`.
- Subject: very short Phase 3 cross-source synthesis executive summary.
- Contains: statement that 6 corpus docs were analyzed, 17 contradictions found, 12 resolved, 5 requiring primary-source reverification.
- Unique value: low-medium. It is mostly a summary pointer, not the actual contradiction matrix.
- Overlap: overlaps with final canonical and correction logs.
- Quality/currentness: incomplete as a standalone file.
- Action: MERGE/ARCHIVE.
- Reason: preserve only if it points to missing Phase 3 artifacts; otherwise archive after contradiction details are captured elsewhere.

## Batch 6 Summary

- KEEP: `TimesFM_LoRA_Complete_Engineering_Spec.md`, `DSCR_Blueprint_Verification_Corrections_Log.md`, `DSCR_Command_Center_v7_Master_Consolidated_Audit (1).md`, `UNIFIED_HUB.md`.
- KEEP/MERGE: `TimesFM 2.5 LoRA Upgrade Blueprint.md`, `Build_Phase1_Deterministic_Core_Plan.md`, `DSCR Sovereign OS  Godmode Research Plan — Data, Algorithms & Computation That Beat All Competitors.md`, `DSCR Sovereign OS  Upgrade Intelligence Report — Advanced Algorithms, Emerging Tools & Architecture Paths No Competitor Has Assembled.md`.
- MERGE THEN ARCHIVE: `Actionable Next Steps for the 20X DSCR Deal Engine.md`, `DSCR_Sovereign_OS_Phase3_Synthesis_Report.md`.
- ARCHIVE AS DATED SNAPSHOT: `DSCR Sovereign OS  Live Research Execution — Sprint 0 & 1 Findings.md`.
- DELETE: none.

## Batch 6 Redundancy Map

- Current integrator/source-of-truth candidate: `UNIFIED_HUB.md`.
- Audit/provenance superfile: `DSCR_Command_Center_v7_Master_Consolidated_Audit (1).md`.
- Corrections provenance: `DSCR_Blueprint_Verification_Corrections_Log.md`.
- Canonical ML/TimesFM spec: `TimesFM_LoRA_Complete_Engineering_Spec.md`.
- Short ML deployment runbook: `TimesFM 2.5 LoRA Upgrade Blueprint.md`.
- Deterministic core build plan: `Build_Phase1_Deterministic_Core_Plan.md`.
- Research/data roadmap: `DSCR Sovereign OS  Godmode Research Plan — Data, Algorithms & Computation That Beat All Competitors.md`.
- Dated Sprint 0/1 snapshot: `DSCR Sovereign OS  Live Research Execution — Sprint 0 & 1 Findings.md`.

No file in this batch is delete-safe. The main cleanup is role separation: current hub, audit archive, dated snapshots, and implementation plans.

## Batch 7 - `00_engine/research/DSCR-Research/` Package Review Started

### Package-level finding

- Read status: package inventory, headings, titles, section starts, hashes, sizes, and category structure reviewed for all 88 Markdown files. Full package-level matrix written to `00_MOCs/DSCR_RESEARCH_LIBRARY_REVIEW_2026-06-26.csv`.
- Package subject: DSCR Intelligence Platform research library.
- Package structure:
  - `BUILDABLE_MASTER_SPECIFICATION.md` = package master spec.
  - `README.md` = package index.
  - 6 verified-core research files.
  - 10 `DEEP_*` research reports.
  - 10 `GAP_*` gap-filling reports.
  - 18 `IMPROVE_*` improvement reports.
  - 16 `INNOVATION_*` research/backlog reports.
  - 15 `GUERRILLA_*` experimental growth strategy reports.
  - 11 `LENDER_*` lender GTM/playbook reports.
- Unique value: high as a structured research package. This folder is not loose noise; it is an earlier organized research library with its own master spec and phase taxonomy.
- Overlap: overlaps heavily with `docs/research/analysis`, `docs/research/specs`, `UNIFIED_HUB.md`, and borrower/marketing reports.
- Quality/currentness: mixed. It includes March 2026 and June 2026 research; lender/regulatory/market claims are time-sensitive and must be verified before use.
- Action: KEEP AS PACKAGE for now.
- Reason: do not delete individual files by prefix/title. First compare `BUILDABLE_MASTER_SPECIFICATION.md` and `README.md` against `UNIFIED_HUB.md` and the final canonical specs. Then merge unique pieces by category and archive the source package.

### High-confidence initial decisions inside the package

- `BUILDABLE_MASTER_SPECIFICATION.md`: KEEP/MERGE. It is the package-level engineering/business/innovation spec and should be compared against Batch 3 and Batch 6 canonical candidates.
- `README.md`: KEEP until package migration is complete. It documents the research library structure and phase taxonomy.
- Verified-core files such as `DSCR_APEX_RESEARCH_MASTER_SYNTHESIS.md`, `DSCR_LENDER_PARAMETERS_VERIFIED.md`, `DSCR_UNDERWRITING_FORMULA_DEEP_DIVE.md`, `DSCR_PRICING_ENGINE_RESEARCH_REPORT.md`, `DSCR_STR_LTR_DATA_INTEGRATIONS.md`, and `DSCR_PORTFOLIO_COMPETITIVE_REGULATORY.md`: KEEP/MERGE. They likely contain unique parameter tables and source trails.
- `DEEP_*`, `GAP_*`, `IMPROVE_*`, `INNOVATION_*`: KEEP/MERGE by topic. These are research modules, not duplicates until checked against the later source-of-truth.
- `GUERRILLA_*`: ARCHIVE/MERGE. These are experimental growth tactics; preserve only useful strategic ideas and avoid treating aggressive marketing language as canonical.
- `LENDER_*`: KEEP/MERGE. These are lender go-to-market and borrower-acquisition playbooks; merge into marketing/sales strategy if the business direction still includes lender operations.

### Batch 7 status

- COMPLETE for package structure and first-pass per-file matrix.
- NOT COMPLETE for final file-by-file deletion/merge authority inside the package.
- DELETE: none.

The detailed CSV is a working inventory, not a final deletion list. Every file in this package remains protected until its unique content is compared to `UNIFIED_HUB.md` and the stronger canonical docs.
