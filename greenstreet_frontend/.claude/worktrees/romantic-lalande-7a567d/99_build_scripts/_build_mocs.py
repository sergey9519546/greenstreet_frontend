"""
DSCR Sovereign OS — MOC (Map of Content) Builder
==================================================

Reads _manifest.json (output of _build_vault.py) and generates 12 MOC hub
files in _indexes/ that organize the vault by topic.

Each MOC is a Markdown file with:
- YAML frontmatter (type=moc)
- Tag chips
- Obsidian wikilinks to every related vault file
- Sub-headings by slice / sprint / category
"""

from __future__ import annotations

import json
import re
from collections import defaultdict
from datetime import datetime
from pathlib import Path

VAULT = Path(r"C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\_obsidian_vault")
MANIFEST = VAULT / "_indexes" / "_manifest.json"
MOCS_DIR = VAULT / "_indexes"


def load_manifest() -> list[dict]:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    return data["files"]


def vault_link(rel_path: str) -> str:
    """Build Obsidian wikilink from vault-relative path."""
    # Strip extension
    no_ext = re.sub(r"\.(md|txt|csv|json)$", "", rel_path)
    # Replace backslashes with forward slashes
    no_ext = no_ext.replace("\\", "/")
    return f"[[{no_ext}|{Path(no_ext).name}]]"


def by_attr(files: list[dict], key: str) -> dict[str, list[dict]]:
    """Group files by attribute."""
    out: dict[str, list[dict]] = defaultdict(list)
    for f in files:
        v = f.get(key)
        if v is None:
            out["_unspecified"].append(f)
        else:
            out[str(v)].append(f)
    return out


def render_file_list(files: list[dict], header: str, sort_key: str = "vault_path") -> str:
    if not files:
        return ""
    files = sorted(files, key=lambda x: x.get(sort_key, ""))
    lines = [f"### {header} ({len(files)})", ""]
    # Render as bullets, grouped by status
    by_status: dict[str, list[dict]] = defaultdict(list)
    for f in files:
        by_status[f.get("status", "drafted")].append(f)
    for status in ("shipped", "drafted", "blocked"):
        items = by_status.get(status, [])
        if not items:
            continue
        for f in items[:30]:
            title = f.get("title", Path(f["vault_path"]).stem)
            link = vault_link(f["vault_path"])
            tags = " ".join(f"#tag/{t}" for t in f.get("tags", [])[:4] if not t.startswith("type/"))
            slice_tag = f"#slice/{f['slice']}" if f.get("slice") else ""
            sprint_tag = f"#sprint/{f['sprint']}" if f.get("sprint") else ""
            status_icon = "✅" if status == "shipped" else "📝" if status == "drafted" else "❌"
            lines.append(f"- {status_icon} {link} {slice_tag}{sprint_tag}")
        if len(items) > 30:
            lines.append(f"- ... and {len(items) - 30} more")
    return "\n".join(lines)


def render_moc(title: str, description: str, files: list[dict], tags: list[str], filter_label: str = "") -> str:
    """Render a single MOC file body."""
    fm = ["---"]
    fm.append("type: moc")
    fm.append(f"title: {title}")
    fm.append(f"description: {description}")
    fm.append(f"created: {datetime.now().strftime('%Y-%m-%d')}")
    fm.append("tags:")
    for t in tags:
        fm.append(f"  - {t}")
    fm.append("---")
    fm.append("")

    body = [f"# {title}", "", f"_{description}_", ""]
    if filter_label:
        body.append(f"**Filter:** {filter_label}")
        body.append("")

    if not files:
        body.append("_No files matched this filter yet._")
        return "\n".join(fm + body)

    body.append(f"**Total: {len(files)} files**")
    body.append("")

    # Group by status
    by_status = by_attr(files, "status")
    body.append("## By status")
    body.append("")
    for status, items in sorted(by_status.items()):
        icon = {"shipped": "✅", "drafted": "📝", "blocked": "❌"}.get(status, "❓")
        body.append(f"- {icon} **{status.title()}**: {len(items)}")
    body.append("")

    # Group by slice
    by_slice = by_attr(files, "slice")
    body.append("## By slice")
    body.append("")
    for slice_id in sorted([s for s in by_slice if s != "_unspecified"]):
        items = by_slice[slice_id]
        body.append(f"### Slice {slice_id} ({len(items)} files)")
        body.append("")
        # Within slice, group by status
        shipped = [f for f in items if f.get("status") == "shipped"]
        drafted = [f for f in items if f.get("status") == "drafted"]
        if shipped:
            body.append(f"#### ✅ Shipped ({len(shipped)})")
            body.append("")
            for f in shipped[:20]:
                body.append(f"- {vault_link(f['vault_path'])}")
            if len(shipped) > 20:
                body.append(f"- ... and {len(shipped) - 20} more")
            body.append("")
        if drafted:
            body.append(f"#### 📝 Drafted ({len(drafted)})")
            body.append("")
            for f in drafted[:15]:
                body.append(f"- {vault_link(f['vault_path'])}")
            if len(drafted) > 15:
                body.append(f"- ... and {len(drafted) - 15} more")
            body.append("")
    if "_unspecified" in by_slice:
        items = by_slice["_unspecified"]
        body.append(f"### Cross-slice / unspecified ({len(items)} files)")
        body.append("")
        for f in items[:20]:
            body.append(f"- {vault_link(f['vault_path'])}")
        if len(items) > 20:
            body.append(f"- ... and {len(items) - 20} more")
        body.append("")

    # Top entities
    entity_counter: dict[str, int] = defaultdict(int)
    for f in files:
        for e in f.get("entities", []):
            entity_counter[e] += 1
    if entity_counter:
        body.append("## Top entities in this MOC")
        body.append("")
        for ent, n in sorted(entity_counter.items(), key=lambda x: -x[1])[:25]:
            body.append(f"- `#{ent}` — {n} files")
        body.append("")

    # Top topics
    tag_counter: dict[str, int] = defaultdict(int)
    for f in files:
        for t in f.get("tags", []):
            tag_counter[t] += 1
    if tag_counter:
        body.append("## Top topics in this MOC")
        body.append("")
        for tag, n in sorted(tag_counter.items(), key=lambda x: -x[1])[:25]:
            body.append(f"- `#{tag}` — {n} files")
        body.append("")

    return "\n".join(fm + body)


def render_readme(files: list[dict]) -> str:
    """Render the vault README with statistics + MOC index."""
    by_type = by_attr(files, "type")
    by_status = by_attr(files, "status")

    lines = [
        "---",
        "type: moc",
        "title: DSCR Sovereign OS — Knowledge Vault",
        "description: Entry point for the entire DSCR Sovereign OS knowledge graph",
        f"created: {datetime.now().strftime('%Y-%m-%d')}",
        "tags:",
        "  - type/moc",
        "  - slice/all",
        "---",
        "",
        "# DSCR Sovereign OS — Knowledge Vault",
        "",
        "_This vault graphifies the entire DSCR Sovereign OS corpus — every research file, lender profile, compliance spec, math algorithm, audit, and ship memo, with YAML frontmatter, [[wikilinks]], and topic/entity tags._",
        "",
        "## Quick Start",
        "",
        "1. **Open in Obsidian**: File → Open vault → select `_obsidian_vault/`",
        "2. **Explore the graph**: Click the graph icon (or Ctrl/Cmd+G) — color groups by status, type, lender, state",
        "3. **Browse MOCs**: Open any of the MOC files below as a hub to navigate by topic",
        "4. **Search**: Ctrl/Cmd+Shift+F for full-text, Ctrl/Cmd+T for tag pane",
        "",
        "## Vault Statistics",
        "",
        f"- **Total files**: {len(files)}",
        f"- **By type**: {', '.join(f'{k}: {len(v)}' for k, v in sorted(by_type.items()))}",
        f"- **By status**: {', '.join(f'{k}: {len(v)}' for k, v in sorted(by_status.items()))}",
        "",
        "## Map of Contents (MOCs) — Pick Your Starting Point",
        "",
        "- [[00_Home]] — Vault entry point + project status",
        "- [[01_MOC_Code_Architecture]] — Slice 1 / 2 / 3 / 4 code modules + tests",
        "- [[02_MOC_Lenders]] — 20 DSCR lender profiles + matrix",
        "- [[03_MOC_Compliance_Regulatory]] — ECOA, FCRA, HOEPA, §1071, adverse action",
        "- [[04_MOC_After_Tax_Engine]] — OBBBA, §1031, QOZ, NIIT, PAL, bonus depreciation",
        "- [[05_MOC_Math_Models]] — t-copula, NSS, Vasicek, Longstaff-Schwartz, Merton DD",
        "- [[06_MOC_State_Regulation]] — 50-state STR + usury + licensing",
        "- [[07_MOC_Market_Data]] — FRED, KBRA, Zillow, Cotality, Trepp",
        "- [[08_MOC_Insurance_Hazard]] — Insurance quotes, FEMA flood, FAIR Plan",
        "- [[09_MOC_Portfolio_Blanket]] — Portfolio DSCR (Insula, Lima One, BFF)",
        "- [[10_MOC_Deliverables]] — Shipped memos + audit reports",
        "- [[11_MOC_Topics_BY_TAG]] — Tag browser (every topic in the vault)",
        "",
        "## How the Graph Works",
        "",
        "- **Tags** in YAML frontmatter (`type/research`, `slice/2`, `topic/insurance`, etc.) auto-group in graph view",
        "- **Entities** (`lender/pennymac`, `state/ca`, `concept/dscr`) make any lender/state/concept one click away",
        "- **[[Wikilinks]]** to related files create explicit graph edges",
        "- **MOC files** are hub-spoke entry points — they have outgoing links to every file in their topic",
        "- **Files themselves** are isolated nodes — their content is readable as standalone Markdown",
        "",
        "## Color Legend (Graph View)",
        "",
        "- 🟢 **Shipped**: code shipped, audit done, deliverable finalized",
        "- 🔵 **Drafted**: research or spec complete, awaiting integration",
        "- 🔴 **Blocked**: gap requiring external research or further work",
        "- 🟠 **Audit**: gap audit, sanity check, or quality gate",
        "- 🟣 **Research**: empirical research, literature review, primary-source",
        "- 🟢 **Code**: Slice 1 / 2 / 3 / 4 source code or tests",
        "- 🟡 **Lender**: anything about a specific DSCR lender",
        "- 🌸 **State**: anything about a specific US state",
        "",
        "## Project Context",
        "",
        "DSCR Sovereign OS is a production-grade, mathematically explicit DSCR (Debt Service Coverage Ratio) underwriting engine for non-QM mortgage origination. It is built in 5 phases:",
        "",
        "1. **Slice 1 (Shipped)**: dscr-core v0.2.0 — payment math, DSCR math, LTV/reserves, ECOA compliance — 213 tests / 92% coverage / 10/10 attacks defended",
        "2. **Slice 2 (Shipped v0.3.0)**: dscr-stress — 5-dim distributional DSCR, Monte Carlo, conformal prediction vault (MAPIE), 42 tests / 90% coverage",
        "3. **Slice 3 (Spec)**: After-Tax Engine — OBBBA, §1031, QOZ, NIIT, PAL — full implementation in Sprint 6",
        "4. **Slice 4 (Deferred)**: Portfolio Analytics (Insula-style) + GNN portfolio context + TimesFM 2.5",
        "5. **Slice 5 (Production)**: Deployment, SR 26-02 model cards, Verus/Cotality partnerships",
        "",
        "## Recent Ships",
        "",
        "- **2026-06-20** Sprint 1: 16 bug fixes + 3 features (pi_io, itia, reserves_check) — dscr-core v0.2.0",
        "- **2026-06-20** Slice 2 P0-2: Conformal Prediction Vault (MAPIE SplitConformalRegressor) — dscr-stress v0.3.0",
        "- **2026-06-19** APEX 2: RENT_LOGNORMAL_SIGMA = 5% with 3-regime dispatch (stable/normal/stress)",
        "- **2026-06-19** APEX 3: 5-agent parallel discovery of 110+ opensource repos + 53 free datasets",
        "- **2026-06-20** Gap Audit v4: 14 of 20 \"external research\" gaps found in folder; ~30-50 hr effort saved",
        "",
        "## Vault Maintenance",
        "",
        f"_Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}_  ",
        f"_Source files scanned: {len(files)}_  ",
        "_Re-run `_build_vault.py` and `_build_mocs.py` after adding new files._",
        "",
    ]
    return "\n".join(lines)


def main():
    files = load_manifest()
    print(f"Loaded {len(files)} files from manifest")

    # Filter by type/category
    code_files = [f for f in files if f.get("type") == "code"]
    deliverable_files = [f for f in files if f.get("type") == "deliverable"]

    # Lender files: anything mentioning a lender entity
    lender_tags = {f"lender/{l}" for l in
                   ["pennymac", "griffin-funding", "kiavi", "visio-lending", "acra-lending",
                    "ocmbc", "crosscountry", "ad-mortgage", "newfi", "angel-oak", "uwm",
                    "defy", "easy-street", "lima-one", "new-silver", "american-heritage",
                    "rocket-pro", "insula", "deephaven", "ready-capital", "verus"]}
    lender_files = [f for f in files if any(e in lender_tags for e in f.get("entities", []))]

    # Compliance files
    compliance_tags = {"regulation/ecoa", "regulation/reg-b", "regulation/fcra",
                       "regulation/hoepa", "regulation/section-1071", "regulation/reg-z",
                       "regulation/tila", "regulation/cfpb", "regulation/hmda",
                       "topic/adverse-action", "topic/kill-criteria"}
    compliance_files = [f for f in files if any(
        t in compliance_tags
        for t in f.get("tags", []) + f.get("entities", []))]

    # After-tax files
    after_tax_tags = {"topic/after-tax", "topic/tax", "tax/obba", "tax/1031", "tax/qoz",
                      "tax/niit", "tax/pal", "tax/bonus-depreciation", "tax/section-179"}
    after_tax_files = [f for f in files if any(
        t in after_tax_tags
        for t in f.get("tags", []) + f.get("entities", []))]

    # Math model files
    math_tags = {"math/t-copula", "math/copula", "math/sobol", "math/merton-dd",
                 "math/vine-copula", "topic/yield-curve", "topic/short-rate",
                 "topic/cecl", "topic/monte-carlo", "topic/lgd", "topic/default-rate",
                 "ml/timesfm", "ml/tabpfn", "ml/conformal", "ml/mapie", "ml/xgboost",
                 "ml/shap"}
    math_files = [f for f in files if any(
        t in math_tags
        for t in f.get("tags", []) + f.get("entities", []))]

    # State files
    state_files = [f for f in files if any(
        e.startswith("state/") for e in f.get("entities", []))]

    # Market data files
    data_tags = {"data/fred", "data/zillow", "data/zori", "data/cotality", "data/trepp",
                 "data/kbra", "data/apartment-list", "data/fannie-mae", "data/freddie-mac"}
    data_files = [f for f in files if any(
        t in data_tags
        for t in f.get("tags", []) + f.get("entities", []))] 

    # Insurance files
    insurance_files = [f for f in files if any(
        t in ("topic/insurance", "topic/flood-insurance", "topic/fair-plan", "topic/title-insurance")
        for t in f.get("tags", []))]

    # Portfolio files
    portfolio_files = [f for f in files if "topic/portfolio" in f.get("tags", [])]

    # MOC definitions: (filename, title, description, files, tags)
    mocs = [
        ("00_Home.md", "00 — Home & Status",
         "Entry point + current build status + recent ships",
         files, ["type/moc", "slice/all"]),

        ("01_MOC_Code_Architecture.md", "01 — Code Architecture",
         "Slice 1 / 2 / 3 / 4 source code, tests, and architecture",
         code_files, ["type/moc", "slice/all", "topic/architecture"]),

        ("02_MOC_Lenders.md", "02 — Lender Matrix",
         "20 DSCR lenders (Pennymac, Griffin, Visio, Easy Street, Kiavi, etc.) — profiles, products, pricing",
         lender_files, ["type/moc", "topic/lender-matrix"]),

        ("03_MOC_Compliance_Regulatory.md", "03 — Compliance & Regulatory",
         "ECOA, Reg B, FCRA, HOEPA, §1071, Reg Z, adverse action, kill criteria, ECOA codes 1-40",
         compliance_files, ["type/moc", "topic/compliance"]),

        ("04_MOC_After_Tax_Engine.md", "04 — After-Tax Engine",
         "OBBBA permanent bonus, §1031 exchange, QOZ, NIIT, PAL phase-out, §179, §1250 recapture",
         after_tax_files, ["type/moc", "topic/after-tax", "topic/tax"]),

        ("05_MOC_Math_Models.md", "05 — Math Models & Algorithms",
         "t-copula, R-vine copula, NSS-Svensson, Hull-White, Vasicek-CIR, Longstaff-Schwartz, Merton DD, Sobol QMC",
         math_files, ["type/moc", "topic/math"]),

        ("06_MOC_State_Regulation.md", "06 — 50-State Regulation",
         "STR legality, usury caps, foreclosure timelines, licensing matrix, property tax",
         state_files, ["type/moc", "topic/state-regulation"]),

        ("07_MOC_Market_Data.md", "07 — Market Data Sources",
         "FRED, Zillow, Cotality, KBRA, Trepp, MBA, Apartment List, NY Fed SOFR — 12 free sources",
         data_files, ["type/moc", "topic/market-data"]),

        ("08_MOC_Insurance_Hazard.md", "08 — Insurance & Hazard",
         "Insurance quotes by state, FEMA flood, FAIR Plan, STR premium multipliers, aggregator APIs",
         insurance_files, ["type/moc", "topic/insurance", "topic/flood-insurance"]),

        ("09_MOC_Portfolio_Blanket.md", "09 — Portfolio & Blanket Loans",
         "Insula Capital portfolio DSCR, Lima One, BFF, Modified Dietz, EPFL Contagion, concentration limits",
         portfolio_files, ["type/moc", "topic/portfolio"]),

        ("10_MOC_Deliverables.md", "10 — Shipped Deliverables",
         "Ship memos, audit reports, gap audits, APEX calibration memos",
         deliverable_files, ["type/moc", "status/shipped"]),
    ]

    # Write MOC files
    for filename, title, desc, subset, tags in mocs:
        path = MOCS_DIR / filename
        body = render_moc(title, desc, subset, tags)
        path.write_text(body, encoding="utf-8")
        print(f"  Wrote {filename} ({len(subset)} files)")

    # Write README at vault root
    readme_path = VAULT / "README.md"
    readme_path.write_text(render_readme(files), encoding="utf-8")
    print(f"  Wrote README.md ({len(files)} files inventoried)")

    # Topics-by-tag MOC (11)
    tag_counter: dict[str, int] = defaultdict(int)
    for f in files:
        for t in f.get("tags", []) + f.get("entities", []):
            tag_counter[t] += 1
    # Build per-tag sub-MOC
    lines = [
        "---",
        "type: moc",
        "title: 11 — Topics by Tag",
        "description: Every tag in the vault with its file count and a link to files",
        f"created: {datetime.now().strftime('%Y-%m-%d')}",
        "tags:",
        "  - type/moc",
        "---",
        "",
        "# 11 — Topics by Tag",
        "",
        "_Every topic tag in the vault, ranked by file count. Click any tag to navigate (if Obsidian Dataview plugin is installed, or browse the MOC for that topic)._",
        "",
        f"**Total unique tags:** {len(tag_counter)}  ",
        f"**Total tag references:** {sum(tag_counter.values())}",
        "",
        "## Topics (≥5 files)",
        "",
    ]
    for tag, n in sorted(tag_counter.items(), key=lambda x: -x[1]):
        if n < 5:
            continue
        lines.append(f"### `{tag}` ({n} files)")
        lines.append("")
        # Find files with this tag
        matching = [f for f in files if tag in f.get("tags", []) + f.get("entities", [])]
        for f in matching[:15]:
            lines.append(f"- {vault_link(f['vault_path'])}")
        if len(matching) > 15:
            lines.append(f"- ... and {len(matching) - 15} more")
        lines.append("")

    lines.append("## All tags (ranked)")
    lines.append("")
    lines.append("| Tag | Count |")
    lines.append("|-----|-------|")
    for tag, n in sorted(tag_counter.items(), key=lambda x: -x[1]):
        lines.append(f"| `{tag}` | {n} |")
    lines.append("")
    lines.append(f"_Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}_")
    lines.append("")

    path = MOCS_DIR / "11_MOC_Topics_BY_TAG.md"
    path.write_text("\n".join(lines), encoding="utf-8")
    print(f"  Wrote 11_MOC_Topics_BY_TAG.md ({len(tag_counter)} unique tags)")

    print()
    print("Done. Vault is ready.")
    print(f"Open Obsidian → File → Open vault → {VAULT}")


if __name__ == "__main__":
    main()
