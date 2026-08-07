# DSCR Loan Office — Unified Workspace Organization Plan

> **Goal**: Transform the current fragmented 6,600+ file workspace into a clean, maintainable monorepo with clear separation of concerns.

---

## 1. CURRENT STATE — PROBLEMS IDENTIFIED

| Problem | Impact |
|---------|--------|
| 58+ markdown files dumped at root | Impossible to find anything, no narrative order |
| 3 separate engine repos (dscr-sovereign-os, DSCR_SOVEREIGN_OS, 99_engine_egnine) | Canonical source unknown, divergence risk |
| Empty dirs (00_compliance, 00_marketing, 00_MOCs) | Dead scaffolding pollutes navigation |
| Typos in dir names (99_engine_egnine) | Unprofessional, confusing |
| Data scattered across DSCR_Datasets/ and 00_engine/data/ | No clear raw vs processed boundary |
| Agent outputs mixed with source code | Generated artifacts in same tree as engine core |
| QA/debris files in frontend repo | FULL_STACK_AUDIT.md, build-output.log, .ps1 scripts |
| 900MB SQLite DB in 00_engine/data/ | Monolithic, should be in data/ not in engine source |
| Duplicate research (RESEARCH/, root MDs, ANALYSIS/) | Same content in 3+ locations |
| .git dirs consuming 22GB+ | Already cleaned — freed 22GB |

---

## 2. TARGET STRUCTURE

```
DSCR_LOAN OFFICE/
├── apps/
│   └── web/                          # Greenstreet Finance frontend (React 19 + Vite 6 + TS)
│       ├── src/
│       ├── api/
│       ├── public/
│       ├── package.json
│       └── vite.config.ts
│
├── packages/
│   ├── dscr-core/                    # Python underwriting engine (MC, scoring, GARCH)
│   │   ├── src/dscr_core/
│   │   └── tests/
│   ├── evidence-vault/               # Audit trail & compliance evidence
│   │   └── src/evidence_vault/
│   └── api/                          # FastAPI gateway (5 endpoints)
│       └── src/routes/
│
├── data/
│   ├── raw/                          # Source datasets (immutable)
│   │   └── DSCR_Datasets/            # HMDA, FHFA, FRED, Zillow, CMBS, Airbnb...
│   └── processed/                    # Engine-processed outputs
│       ├── dscr_engine.db            # SQLite (903MB)
│       ├── airbnb/
│       ├── california/
│       ├── florida/
│       ├── loan_performance/
│       ├── national/
│       └── rent_estimates/
│
├── docs/
│   ├── research/
│   │   ├── specs/                    # Canonical engine specs & blueprints
│   │   ├── deep-dives/              # Sprint reports, algorithm deep-dives
│   │   ├── analysis/                # Gap analyses, content audits
│   │   ├── sprints/                 # Sprint 0-6 findings
│   │   └── lender-intel/            # PennyMac profiles, product profiles
│   ├── knowledge-graph/             # graphify-out wiki & report
│   ├── qa/                          # QA reports, audits, fix plans
│   ├── agent-outputs/               # Generated personas, ad copy, targeting maps
│   ├── compliance/                  # FCRA, Reg B, ECOA research
│   └── ml-architecture/             # TimesFM LoRA, XGBoost blueprints
│
├── scripts/
│   ├── build/                       # Build & deploy scripts
│   ├── analysis/                    # Data analysis utilities
│   ├── migration/                   # Organization migration helpers
│   └── validation/                  # Data/model validation scripts
│
├── tools/
│   ├── external-check/              # 99_external_check → lender verification tool
│   ├── engine-audit/               # 99_engine_egnine → lender extraction tools
│   ├── autoresearch/               # Auto-research config & eval scripts
│   └── glossary.md
│
├── attachments/                     # 99_attachments → PDFs, XLSX, ZIPs (reference only)
│
├── graphify-out/                    # Source of truth for knowledge graph (live)
│   ├── GRAPH_REPORT.md
│   └── wiki/
│
├── .agent/ .claude/ .codex/ .github/ .minimax/ .obsidian/ .qodo/
│                                     # Agent/IDE configs (keep as-is)
│
├── AGENTS.md                        # Agent instructions (root-level, required)
├── CLAUDE.md                        # Claude Code instructions (root-level, required)
├── README.md                        # Project overview & architecture map
├── ORGANIZATION_PLAN.md             # This file
├── TASKS.md                         # Task tracking
├── package.json                     # npm workspaces config
├── pyproject.toml                   # uv/python workspaces config
├── turbo.json                       # Turborepo pipeline config
└── .gitignore                       # Universal ignore patterns
```

---

## 3. MIGRATION ACTIONS

### Phase 1: Directory Renames & Moves (no data loss)

| # | Action | From | To | Rationale |
|---|--------|------|----|-----------|
| 1 | MOVE | `DSCR_Datasets/` | `data/raw/DSCR_Datasets/` | ✅ DONE |
| 2 | MOVE | `00_engine/data/{airbnb,california,florida,loan_performance,national,rent_estimates}` | `data/processed/` | ✅ DONE |
| 3 | MOVE | `00_engine/data/dscr_engine.db` | `data/processed/dscr_engine.db` | Relocate 903MB DB |
| 4 | RENAME | `99_engine_egnine/` | `tools/engine-audit/` | Fix typo, categorize |
| 5 | RENAME | `99_external_check/` | `tools/external-check/` | Categorize |
| 6 | RENAME | `99_attachments/` | `attachments/` | Remove 99_ prefix |
| 7 | MERGE | `RESEARCH/` contents | `docs/research/` | Consolidate research |
| 8 | MERGE | `ANALYSIS/` contents | `docs/research/analysis/` | Consolidate analysis |
| 9 | MERGE | `agent_outputs/` | `docs/agent-outputs/` | Categorize |
| 10 | MOVE | `autoresearch/` | `tools/autoresearch/` | Categorize |
| 11 | MERGE | `00_engine/research/` | `docs/research/` | Consolidate |
| 12 | MOVE | `00_website/FRONTEND_HUB.md, INDEX.md` | `docs/` | Reference docs |
| 13 | MOVE | `output/` DSCR_* memos | `docs/research/analysis/` | Generated reports |
| 14 | MOVE | `output/build_*.py` | `scripts/build/` | Build scripts |
| 15 | MOVE | `memory/` | `tools/` or delete | Context glossary |

### Phase 2: Root-Level MD Consolidation

| Category | Files | Destination |
|----------|-------|-------------|
| **Agent Config** | AGENTS.md, CLAUDE.md, CLAUDE_MEMORY.md | Stay at root (required by tools) |
| **Operational** | README.md, ORGANIZATION_PLAN.md, TASKS.md, UNIFIED_HUB.md | Stay at root |
| **Engine Specs** | DSCR_Engine_Master_Specification.md, DSCR_Underwriting_Engine_*.md, AEGIS_*.md, DSCR_Sovereign_OS_*_Final_Canonical_Specification.md | `docs/research/specs/` |
| **Sprint Reports** | DSCR_Sovereign_OS_Sprint_*.md, DSCR_SOVEREIGN_OS_*.md | `docs/research/sprints/` |
| **Deep Dives** | SOVEREIGN_RESEARCH_REPORT.md, DSCR DUAL TRUTH ENGINE*.md, Deep Research Report*.md, frontier_dscr_strategy_guide.md | `docs/research/deep-dives/` |
| **Analysis** | dscr_sovereign_os_*_debt_*.md, 100_DSCR_BUSINESS_QUESTIONS_ANSWERED.md, DSCR_Blueprint_Verification_Corrections_Log.md, DSCR_Command_Center*.md, recheck_deep-research-report.md | `docs/research/analysis/` |
| **ML Architecture** | TimesFM*.md, six-function-doctrine.md | `docs/ml-architecture/` |
| **Lender Intel** | DSCR Lender Intelligence*.md, DSCR Loan Approval*.md, Master DSCR Knowledge*, The 2026 DSCR Master*.md, NEW_DSCR*.md | `docs/research/lender-intel/` |
| **DELETE** | DSCR_deep-research-report.md (dup of deep-research-report.md), dscr_sovereign_os_upgrade_intelligence_report (1).md (copy), DSCR_Appendix_B_Research_Resolution_Report.md, DSCR Forumals.md (typo title) | Trash |

### Phase 3: Code Consolidation

| Action | Detail |
|--------|--------|
| Resolve DSCR_SOVEREIGN_OS vs dscr-sovereign-os | Diff packages/ to find canonical; delete the fork |
| Move canonical packages to packages/ | dscr-core, evidence-vault, api |
| Move greenstreet_frontend to apps/web/ | Canonical frontend location |
| Clean QA debris from frontend repo | Move FULL_STACK_AUDIT.md, QA_*.md, ULTRA_*.md to docs/qa/ |
| Remove build artifacts | .dev-server.log, build-output.log, lint_output.txt, tscheck.log, diff-check.ps1, etc. |

### Phase 4: Empty Directory Cleanup

Remove these empty/near-empty directories:
- `00_compliance/` (empty)
- `00_marketing/` (empty)  
- `00_MOCs/` (empty)
- `01_research_notes/` (empty)
- `dscr-demo_website/` (empty)
- `docs/research/specs/` (if re-created empty)
- `docs/research/sprints/` (if re-created empty)

### Phase 5: Final Structure Validation

- [ ] All code lives in `apps/` or `packages/`
- [ ] All data lives in `data/raw/` or `data/processed/`
- [ ] All docs live in `docs/`
- [ ] All tools/scripts live in `scripts/` or `tools/`
- [ ] Root has ≤10 files (config + instructions only)
- [ ] No duplicate content across directories
- [ ] `turbo.json` + `package.json` workspaces wired
- [ ] `pyproject.toml` uv workspaces wired
- [ ] Graphify can rebuild from new structure

---

## 4. SIZE BUDGET

| Directory | Estimated Size | Notes |
|-----------|---------------|-------|
| data/raw/ | 645MB | DSCR_Datasets (HMDA, FHFA, FRED, etc.) |
| data/processed/ | ~903MB | dscr_engine.db + processed subdirs |
| apps/web/ | ~5MB | Source code only, no node_modules |
| packages/ | ~2MB | Python + TS source |
| docs/ | ~20MB | Markdown + PDFs |
| attachments/ | ~10MB | PDFs, XLSX, ZIPs |
| graphify-out/ | ~1MB | Wiki + report |
| scripts/ & tools/ | ~1MB | Utility scripts |
| **Root files** | ~3MB | Config + instructions |

---

## 5. RISK MITIGATION

1. **OneDrive sync**: All changes happen in the OneDrive-synced folder. Large files may take time to sync — avoid rapid create/delete cycles.
2. **Database integrity**: The 903MB dscr_engine.db should be moved, not copied. Verify it opens after move.
3. **Git history**: .git dirs already removed from greenstreet_frontend and DSCR_SOVEREIGN_OS. If history is needed, it should be in a remote (GitHub).
4. **Cross-references**: AGENTS.md and CLAUDE.md reference specific paths — must update after migration.
5. **Graphify mapping**: After migration, re-run `graphify` to rebuild the knowledge graph against new paths.

---

*Plan created: 2026-06-26 | Status: IN PROGRESS — awaiting subagent inventories*
