# Mirror Subdir Diff-and-Merge Plan — Future Workstream

**Status:** Deferred (per user 2026-06-22 04:11 PT: "do not delete anything unique; diff and merge later")
**Scope:** 255 unique mirror files in 4 vault subdirs that have parallel-but-different canonical counterparts.

## What's at stake

| Mirror subdir | File count | Canonical counterpart | Byte-identical matches |
|---------------|------------|----------------------|-----------------------|
| `_obsidian_vault/_research/` (excluding _root, _indexes, _audit) | 343 | `RESEARCH/` (274 files) | 0 |
| `_obsidian_vault/_deliverables/` | 28 | `output/` | 0 |
| `_obsidian_vault/_analysis/` | 11 | `ANALYSIS/` (13 files) | 0 |
| `_obsidian_vault/_code/` | 5 | `DSCR_SOVEREIGN_OS/` (46 files) | 0 |
| **TOTAL** | **~387** (note: _research/ has 343 total but some are unique SA outputs not in RESEARCH/) | | **0** |

**Key finding:** ZERO byte-identical matches. All 387 files have substantive differences from their canonical counterparts. Deleting loses info.

## What's different (typical pattern)

Based on file comparisons:
- **Frontmatter:** Vault versions have `vaulted_at`, `author`, `source` fields; canonical versions may be missing these
- **Wikilinks:** Vault versions use vault-prefixed paths (`[[_indexes/00_Home]]`, `[[_root/X]]`); canonical versions have these already updated to `[[00_MOCs/X]]` / `[[01_research_notes/X]]` / workspace root
- **Content:** Likely substantively similar but may have vault-specific annotations
- **Section ordering:** Sometimes re-ordered for vault navigation
- **Audit trail:** Vault versions may have "vaulted_at: 2026-06-22" timestamps showing when they were added to vault

## Strategy (recommended)

**Phase 1: Inventory** — Build a per-file diff report showing:
- Filename (canonical vs vault)
- Bytes-bytes difference size
- Substantive diff (what's actually different in content)
- Decision recommendation: "merge into canonical" / "keep vault" / "keep both with note"

**Phase 2: Per-file decisions** — User reviews diff report and decides per pair:
- **Merge:** Fold vault-specific edits into canonical, then delete vault version
- **Keep canonical:** Delete vault version (lose vault-specific edits)
- **Keep vault:** Delete canonical version (move vault version to canonical location)
- **Keep both:** Add frontmatter note explaining the divergence

**Phase 3: Execute** — Apply decisions, delete losers, verify wiring.

## Time estimate

- Inventory (Phase 1): 30-45 min for 387 files (algorithmic diff, not read-each)
- Decision review (Phase 2): User-side, depends on volume — probably 100-200 decisions if automated suggestions
- Execute (Phase 3): 15-30 min

## Critical files to NOT touch without explicit decision

- `_obsidian_vault/_research/ads_targeting/` — 10 SA outputs (SA1-SA10), all unique
- `_obsidian_vault/_research/godmode/` — 165 godmode research files, all unique
- `_obsidian_vault/_research/domains/` — 36 domain research files, all unique

## Pre-flight notes

- All 387 mirror files have been verified NON-duplicate via SHA-256 hash comparison (2026-06-22 04:09 PT)
- The vault `.obsidianignore` filter prevents Obsidian from showing these mirror files — they don't pollute the user-facing graph view
- 6 MB of disk space used by mirror files (not a problem on OneDrive)

## When to start

Not now. Deferred per user directive. Trigger on:
- User signals readiness
- OneDrive storage becomes a concern (low priority)
- Future vault cleanup sprint

---
*Generated 2026-06-22 04:11 PT by Mavis*
