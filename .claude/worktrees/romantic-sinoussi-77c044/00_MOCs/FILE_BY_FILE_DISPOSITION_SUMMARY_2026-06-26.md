# File-by-File Disposition Summary - 2026-06-26

Scope: `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE`

## Method

- Enumerated every file under the project root, including generated dependency folders.
- Opened every file and streamed all bytes through SHA-256 hashing.
- Fully decoded text/source/Markdown/JSON-like files where possible and extracted headings or code signatures.
- Inspected CSV headers/row counts, SQLite tables/counts, XLSX sheet dimensions, ZIP contents, DOCX text, and PDF first-page text where parsers were available.
- Wrote the full per-file manifest to `00_MOCs/FILE_BY_FILE_DISPOSITION_2026-06-26.csv`.

## Totals

- Files read: 32,790
- Bytes hashed: 5673.8 MB
- Exact duplicate hash groups: 2,715
- Files participating in duplicate groups: 11,340
- Runtime seconds: 76.7

## Disposition Counts

- `DELETE_REGENERATED`: 28,827
- `KEEP_IF_LIVE_ELSE_ARCHIVE`: 1,052
- `KEEP_RAW_DATA`: 779
- `MERGE_OR_ARCHIVE_DOC_CORPUS`: 712
- `ARCHIVE_OR_REVIEW_TOOL_IMPORT`: 682
- `KEEP_ACTIVE_APP`: 288
- `MERGE_OR_ARCHIVE_DOC`: 88
- `KEEP_PROCESSED_OR_REBUILD_AFTER_VALIDATION`: 87
- `KEEP_COLD_ARCHIVE`: 57
- `KEEP_DOCS`: 52
- `KEEP_REFERENCE_CODE`: 44
- `KEEP_TOOL_CONFIG`: 41
- `REVIEW`: 41
- `KEEP_BUILD_SCRIPT_REVIEW`: 15
- `MOVE_TO_DOCS_QA_OR_MARKETING`: 12
- `KEEP_ROOT`: 8
- `KEEP_ARCHIVE`: 5

## Top-Level Folder Counts

- `data`: 866 files, 3934.3 MB
- `99_attachments`: 57 files, 1072.1 MB
- `greenstreet_frontend`: 29,127 files, 512.8 MB
- `graphify-out`: 1,052 files, 102.0 MB
- `.minimax`: 344 files, 19.1 MB
- `RESEARCH`: 583 files, 11.9 MB
- `00_engine`: 88 files, 4.3 MB
- `dscr-demo_website`: 83 files, 2.6 MB
- `docs`: 57 files, 2.5 MB
- `99_external_check`: 153 files, 2.5 MB
- `output`: 50 files, 1.8 MB
- `01_research_notes`: 39 files, 1.3 MB
- `agent_outputs`: 11 files, 1.1 MB
- `00_MOCs`: 35 files, 1.0 MB
- `ANALYSIS`: 27 files, 1.0 MB
- `.agent`: 6 files, 1.0 MB
- `DSCR_SOVEREIGN_OS`: 44 files, 0.7 MB
- `99_engine_egnine`: 52 files, 0.7 MB
- `dscr-sovereign-os`: 46 files, 0.6 MB
- `99_build_scripts`: 15 files, 0.3 MB
- `.claude`: 24 files, 0.2 MB
- `00_website`: 2 files, 0.0 MB
- `ROOT_MD_INVENTORY_CATEGORIZATION.md`: 1 files, 0.0 MB
- `.obsidian`: 10 files, 0.0 MB
- `autoresearch`: 4 files, 0.0 MB
- `ORGANIZATION_PLAN.md`: 1 files, 0.0 MB
- `AGENTS.md`: 1 files, 0.0 MB
- `README.md`: 1 files, 0.0 MB
- `00_MASTER_README.md`: 1 files, 0.0 MB
- `memory`: 2 files, 0.0 MB
- `TASKS.md`: 1 files, 0.0 MB
- `CLAUDE_MEMORY.md`: 1 files, 0.0 MB
- `.obsidianignore`: 1 files, 0.0 MB
- `pyproject.toml`: 1 files, 0.0 MB
- `package.json`: 1 files, 0.0 MB
- `CLAUDE.md`: 1 files, 0.0 MB
- `.codex`: 1 files, 0.0 MB
- `turbo.json`: 1 files, 0.0 MB

## Immediate Rules

- Keep `greenstreet_frontend/` as active app source; move QA/copy reports to docs later, do not merge research into source.
- Keep `data/raw/` as immutable source data.
- Keep `data/processed/dscr_engine.db`; it was verified as readable SQLite.
- Treat `data/processed/` duplicates as prune candidates only after rebuild scripts are validated.
- Keep `DSCR_SOVEREIGN_OS/` as read-only reference code; remove only generated caches/venvs.
- Reconcile `RESEARCH/`, `ANALYSIS/`, `01_research_notes/`, `output/`, and `agent_outputs/` by content before deletion.
- `node_modules/`, build outputs, caches, logs, and `.venv` folders are regenerated dependencies/artifacts and can go when app runnability is not needed immediately.
