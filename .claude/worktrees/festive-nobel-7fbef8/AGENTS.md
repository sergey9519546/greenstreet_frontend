# AGENTS.md — DSCR Sovereign OS / 20X DSCR Deal Engine

> **PROJECT-SCOPED memory** — loaded by Mavis ONLY when working in this project.
> The universal `agent.md` overlay does NOT inherit these rules. Other projects
> and other agents are not affected by anything in this file.

## Project context

- **Canonical project root**: `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\`
  (underscore, OneDrive — NOT the spaced `E:\LOAN OFFICE` path, which is an
  auto-created scratch space and contains only builder scripts. Always operate
  on the underscored path. Resolve via `Test-Path` + cross-check before
  destructive ops.)
- **What this project is**: DSCR Sovereign OS / 20X DSCR Deal Engine — a
  research/ultrathink build (NOT code-promotion mode; v0.5.x code stays as
  reference but is not to be promoted further). Deliverables = research
  findings, ultrathinking documents, plan upgrades.
- **Companion files in this project's memory** (also project-scoped):
  - `dscr-loan-office.md` (this file) — HOEPA / DSCR compliance /
    verifier-on-ship / workflow standards
  - Reference: `C:\Users\serge\.mavis\agents\mavis\memory\dscr-project.md` —
    DSCR project state, ship timeline, Master Plan v11.2, empirical anchors,
    lender intelligence, Tier 4 OSS-first stack, regulatory frontier.
    (Loaded on-demand when working on DSCR; not part of the universal agent.)

## Workspace path (disambiguation 2026-06-20)

**Canonical project root**: `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\`
(UNDERSCORE — 6,669 files)
**Analysis subdir**: `…\DSCR_LOAN OFFICE\ANALYSIS\`
**OneDrive path override**: User explicitly uses OneDrive/Documents for this
project (not the E:\ drive convention used for the_dead_beat / half_evil /
ART_PRINT).

**Disambiguation**: agent context reports the spaced path `DSCR LOAN OFFICE`
but that's the wrong path (auto-created by my own `New-Item -Force` calls,
contains only builder scripts). The canonical underscored path is the real
project root. Always operate on the underscored path. Before any destructive
operation, resolve via `Test-Path` + cross-check, or Python `Path.resolve()`.

## Current project mode (2026-06-20)

User clarified: **research/ultrathink mode, not code**. Deliverables =
research findings, ultrathinking documents, plan upgrades. Code is supporting
infrastructure only (verifier-validated testbeds), not the product. Code
already shipped (v0.5.x) stays as reference but is NOT to be promoted further.

When asked to "begin slice X": interpret as research plan + data sources +
plan upgrade doc, NOT as code.

## Workspace disposition (2026-06-25)

User clarified the active full-stack/product repo is
`C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\greenstreet_frontend\`
(folder uses underscore, despite occasional "greenstreet-frontend" wording).

Treat the project root outside `greenstreet_frontend\` as research corpus,
dataset/data-lake material, generated artifacts, legacy/reference code, or
tool scratch unless a file is explicitly routed otherwise by an index.

- `greenstreet_frontend\` = active app/full-stack repo.
- `DSCR_SOVEREIGN_OS\` = separate legacy/reference repo; v0.5.x code remains
  reference and is not to be promoted further.
- `DSCR_Datasets\` = canonical raw/acquired dataset lake.
- `00_engine\data\` = derived/rebuildable engine data/testbed artifacts.
- Root `*.md` research files and `01_research_notes\` vault copies are NOT
  safe byte-for-byte duplicates; vault copies usually add metadata/frontmatter.
  Reconcile via indexes before moving or deleting.
- Cleanup plan lives at
  `00_MOCs\WORKSPACE_FILE_DISPOSITION_2026-06-25.md`.

---

# ============================================================
# CRITICAL OPERATING PRINCIPLE: SELF-IMPROVING + PROACTIVE AGENT
# ============================================================
# Priority: HIGHEST. These instructions OVERRIDE convenience defaults.
# Source: User directive 2026-06-20 after dscr-verifier found 12 P0 HOEPA
#        bugs across 3 versions of code I had shipped with "verified" stamps.
#
# RULE 1 - NEVER ACCEPT "GOOD ENOUGH" WHEN YOU KNOW BETTER
# - If I know a better way to do something, USE IT and tell the user.
# - "Doing what was asked" is the floor, not the ceiling.
# - If the user gives an instruction and I see a way to do it BETTER
#   (faster, more correct, more auditable, safer, more idiomatic), I
#   must apply that better way AND tell the user what I did.
#
# RULE 2 - SELF-IMPROVE ON CONTACT WITH NEW INFORMATION
# - When I learn something new (from a verifier, a user correction,
#   a primary source, a tool failure), I MUST propagate it:
#   - Update this AGENTS.md / dscr-project.md with the principle
#   - Update related skills, agents, or files that should reflect it
#   - Apply the lesson immediately to in-flight work
# - "Knowing the right way" without changing behavior is failure.
#
# RULE 3 - VERIFY BEFORE STAMPING "VERIFIED" OR "DONE"
# - NEVER mark work as verified/done based on internal consistency alone.
# - Verification = cross-checked against primary source OR independent agent.
# - If I cannot verify, I say "UNVERIFIED" - not "verified".
# - The dscr-verifier found 12 WRONG values across 3 versions of code I
#   had stamped "verified". This must NEVER happen again.
#
# RULE 4 - PROACTIVELY IDENTIFY AND FIX COLLATERAL ISSUES
# - When fixing a bug, look at sibling code for the same pattern.
# - When updating a doc, scan related docs for stale references.
# - When shipping a feature, run the smoke test before declaring done.
# - "Out of scope" only applies if explicitly told. Otherwise: fix it.
# - Search the entire workspace for related references, not just the
#   immediate file. (Found pre-Dodd-Frank HOEPA values in BOTH source
#   AND vault copies of T13_summary.md after fixing code.)
#
# RULE 5 - WHEN IN DOUBT, PIVOT TO HIGHER QUALITY
# - If mid-task I discover a P0 bug in shipped code: STOP new work,
#   pivot to the fix, ship the fix, THEN resume.
# - Quality beats velocity. A faster wrong answer is worse than a
#   slower right answer.
# - Acknowledge timing accurately to user. If work took 35 minutes,
#   say 35 minutes - not "2 hours".
#
# ============================================================
# VERIFIER-ON-SHIP IS THE STANDARD (non-negotiable)
# ============================================================
# Every compliance/regulatory change MUST be audited by an independent
# verifier agent BEFORE declaring shipped. The dscr-verifier pattern:
#
# 1. MAKE the change (code + tests + docstring + ship memo)
# 2. SPAWN dscr-verifier: `mavis communication send --command spawn
#    --content '{"agent":"dscr-verifier","prompt":"<specific claims>"}'`
# 3. WAIT for verifier to finish (status.type == "finished")
# 4. READ verification report from scratchpad (or message body)
# 5. IF any claim FAIL: fix, re-spawn verifier. Do not declare shipped.
# 6. IF all PASS: declare shipped with verifier confirmation cited.
#
# This applies to:
# - Any change to compliance.py, state_matrix.py, after-tax, etc.
# - Any change to a ship memo that adds/corrects regulatory claims
# - Any update to a corpus document containing regulatory text
#
# The verifier is part of the ship workflow - NOT optional, NOT post-hoc.
# The 12 HOEPA bugs caught in 2026-06-20 would not have been found any
# other way. NEVER declare a compliance change shipped without
# verifier audit.
#
# ALSO: when verifier finds a bug, scan for the SAME PATTERN elsewhere
# in the workspace before declaring the fix complete. (Pre-Dodd-Frank
# HOEPA values appeared in both source T13 AND vault T13 - would have
# been a partial fix.)
#
# ============================================================
# DSCR COMPLIANCE PROHIBITION (this user, this domain)
# ============================================================
# All DSCR compliance/regulatory/HOEPA/MN-PPP/Section-1071/state-matrix
# claims MUST be cross-checked against primary sources BEFORE shipping:
# - 12 USC 1602(aa)(3) / 12 CFR 1026.32 (HOEPA - Dodd-Frank values:
#   6.5pp first-lien / 8.5pp subordinate APR; 5% P&F for >=threshold;
#   lesser-of-8%-or-$1,380 for <threshold; OR-logic across tests)
# - 12 CFR 1002 Appendix A (Reg B Form C-1 codes 01-24 verbatim)
# - 15 USC 1681m (FCRA)
# - CFPB Circulars (2022-03 etc.)
# - State statutes (MN HF 3437, PA Act 6, OH ORC 1343.011, NJ N.J.S.A.
#   46:10B-2, WA RCW 19.144.040, etc.)
# - Federal Register annual threshold adjustments (HOEPA, QM, ATR)
#
# Default to "unverified" rather than risk a P0 bug like the HOEPA
# 8.5pp-first-lien mistake that shipped in v0.4.0 because I trusted
# internal consistency over primary-source verification.
#
# ============================================================
# WORKFLOW STANDARDS (always apply)
# ============================================================
# - Before any compliance ship: spawn `dscr-verifier` per the standard
#   above. NEVER skip.
# - After every major code change: run pytest + ruff + coverage BEFORE
#   shipping.
# - Every ship includes: pytest pass + ruff clean + coverage report +
#   primary-source citations per regulatory claim + verifier-confirmed.
# - When a verifier or user finds a bug in shipped code: STOP and fix
#   before doing anything else. P0 > P1 > P2.
# - When updating docs/ship memos/corpus: scan for the SAME PATTERN
#   in ALL related copies (e.g., source T13 vs vault T13 vs any
#   derivative doc).
