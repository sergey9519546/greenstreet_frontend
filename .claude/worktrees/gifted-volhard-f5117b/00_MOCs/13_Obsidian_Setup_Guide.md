---
type: guide
status: drafted
title: "Obsidian Setup Guide"
summary: "How to use Obsidian for the DSCR Sovereign OS vault. Required plugins, keyboard shortcuts, graph view, dataview syntax, daily notes, mobile setup."
created: 2026-06-22
vaulted_at: 2026-06-22
author: Mavis (root session mvs_b78f9d32cd6348d6a48278d25e380ca4)
---

# Obsidian Graph Setup Guide — DSCR Sovereign OS Vault


**Vault location:** `_obsidian_vault/` (at workspace root)

---

## Step 1 — Install Obsidian

If not already installed: download from https://obsidian.md (free, ~80 MB).

## Step 2 — Open the vault

1. Launch Obsidian
2. **File → Open vault → Open folder as vault**
3. Navigate to: `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\_obsidian_vault\`
4. Click **Open**

Obsidian will recognize `.obsidian/` and load the config.

## Step 3 — Install the recommended community plugins

The vault ships with **4 plugins pre-staged** (config files written, but the actual `.js` bundles need to be installed). Obsidian will warn "Restricted mode" — click **Trust author & enable plugins**.

### Plugin 1 — Dataview (REQUIRED)
- Open Settings → Community plugins → Browse
- Search "Dataview" by blacksmithgu
- Click Install → Enable
- This makes all the queries in `12_Dataview_Query_Library.md` work

### Plugin 2 — Graph Analysis (recommended)
- Browse → search "Graph Analysis"
- Install → Enable
- Gives richer graph features (color by tag/type, link types)

### Plugin 3 — Tag Wrangler (recommended)
- Browse → search "Tag Wrangler"
- Install → Enable
- Better tag management for the 167 tags in this vault

### Plugin 4 — Excalidraw (optional)
- Browse → search "Excalidraw"
- Install → Enable
- For hand-drawing diagrams (architecture, lender matrix, etc.)

## Step 4 — Try the graph view

Press **Ctrl/Cmd + G** (or click the graph icon in the left ribbon).

You should see a graph with **363 nodes** colored by status:
- 🟢 **Green** = shipped (Sprint 1 memos, audit reports, Slice 1+2 code)
- 🔵 **Blue** = drafted (research, godmode files, sprint specs)
- 🔴 **Red** = blocked (gaps awaiting external research)
- 🟠 **Orange** = audit reports
- 🟣 **Purple** = research files

## Step 5 — Try a MOC

Open `00_Home.md` and click any of the wikilinks to navigate the graph.

Or open `11_MOC_Topics_BY_TAG.md` for tag-browsing.

Or open `02_MOC_Lenders.md` to see all 241 files mentioning any of the 20 lenders.

## Step 6 — Try a Dataview query

Open `12_Dataview_Query_Library.md`, copy any query code block, paste into a new note, and wrap with `dataview` as the language.

Example (already in the library):
````
```dataview
TABLE title AS "Topic", status AS "Status"
FROM ""
WHERE contains(entities, "lender/pennymac")
SORT title ASC
```
````

This shows every file mentioning Pennymac with its status.

---

## Graph Color Legend

Configured in `.obsidian/graph.json`:

| Group | Color | Query |
|-------|-------|-------|
| Shipped | 🟢 Green | `tag:#status/shipped` |
| Drafted | 🔵 Blue | `tag:#status/drafted` |
| Blocked | 🔴 Red | `tag:#status/blocked` |
| Audit | 🟠 Orange | `tag:#type/audit` |
| Research | 🟣 Purple | `tag:#type/research` |
| Code | 🟢 Teal | `tag:#type/code` |
| Lender | 🟡 Yellow | `tag:#entity/lender` |
| State | 🌸 Pink | `tag:#entity/state` |

---

## What's in the vault

```
_obsidian_vault/
├── .obsidian/                          (config)
│   ├── app.json                        (vault settings)
│   ├── appearance.json                 (dark theme)
│   ├── graph.json                      (graph color groups)
│   ├── editor.json                     (editor settings)
│   ├── core-plugins.json               (15 core plugins enabled)
│   ├── community-plugins.json          (4 community plugins listed)
│   └── plugins/
│       ├── dataview/data.json          (pre-staged config)
│       ├── graph-analysis/data.json
│       ├── tag-wrangler/data.json
│       └── obsidian-excalidraw-plugin/
├── README.md                           (vault overview + stats)
├── 00_MOCs/
│   ├── _manifest.json                  (machine-readable inventory of all 363 files)
│   ├── 00_Home.md                      (entry point + project status)
│   ├── 01_MOC_Code_Architecture.md     (Slice 1-4 source code)
│   ├── 02_MOC_Lenders.md               (241 files mentioning 20 lenders)
│   ├── 03_MOC_Compliance_Regulatory.md (141 files: ECOA, FCRA, HOEPA, §1071)
│   ├── 04_MOC_After_Tax_Engine.md      (204 files: OBBBA, §1031, QOZ, NIIT)
│   ├── 05_MOC_Math_Models.md           (235 files: t-copula, NSS, Vasicek)
│   ├── 06_MOC_State_Regulation.md      (107 files: STR + usury + foreclosure)
│   ├── 07_MOC_Market_Data.md           (173 files: FRED, KBRA, Zillow)
│   ├── 08_MOC_Insurance_Hazard.md      (162 files: insurance + FEMA + flood)
│   ├── 09_MOC_Portfolio_Blanket.md     (149 files: Insula, Lima One, BFF)
│   ├── 10_MOC_Deliverables.md          (7 shipped memos + audit reports)
│   ├── 11_MOC_Topics_BY_TAG.md         (167 unique tags ranked by frequency)
│   └── 12_Dataview_Query_Library.md    (ready-to-paste Dataview queries)
├── _analysis/                          (ANALYSIS/*.md)
├── _deliverables/                      (output/*.md)
├── _code/                              (DSCR_SOVEREIGN_OS/packages/* — README + audit)
├── _research/                          (RESEARCH/* — godmode + domains + sprints)
├── _root/                              (workspace root .md files)
└── _audit/                             (reserved for future audit reports)
```

---

## Common workflows

### "Show me all files about Pennymac"
- Open `02_MOC_Lenders.md`, scroll to lender section
- OR open `12_Dataview_Query_Library.md`, run the lender query
- OR in graph view, type "pennymac" in filter

### "What's been shipped vs. drafted?"
- Open `00_Home.md` for the high-level stats
- OR open `11_MOC_Topics_BY_TAG.md` and look at `status/shipped` vs `status/drafted`

### "Find a specific formula or algorithm"
- Open `05_MOC_Math_Models.md` for the math/ML inventory
- OR search Ctrl/Cmd+Shift+F for the formula name

### "What did we just build?"
- Open `10_MOC_Deliverables.md` for all shipped memos
- OR open `00_Home.md` "Recent Ships" section

### "Show me everything about a state (e.g., California)"
- Click the MOC entry for that state, OR
- Run Dataview query: `FROM "" WHERE contains(entities, "state/ca")`

---

## Rebuilding the vault

If you add new files to the workspace, re-run:

```powershell
cd C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE
& "DSCR_SOVEREIGN_OS\packages\dscr-core\.venv\Scripts\python.exe" "_build_vault.py"
& "DSCR_SOVEREIGN_OS\packages\dscr-core\.venv\Scripts\python.exe" "_build_mocs.py"
```

The vault will be rebuilt from scratch with updated frontmatter and MOCs.

---

## Troubleshooting

**Q: Graph view is empty / very dense**
A: Open the graph filter (top right of graph panel) and filter by tag like `#slice/1` or `#type/research`.

**Q: Wikilinks don't resolve**
A: Obsidian should auto-resolve on open. If not, press Ctrl/Cmd+P → "Obsidian: Reload app without saving".

**Q: Dataview queries show "Dataview: Empty query result"**
A: Make sure the file you're querying has YAML frontmatter. Check Settings → Dataview → "Enable JavaScript Queries".

**Q: OneDrive sync is slow because of vault**
A: Pause OneDrive sync for the `_obsidian_vault/` folder, OR move the vault to `C:\Users\serge\Documents\ObsidianVaults\DSCR_Sovereign_OS\` and update Obsidian's vault location. The vault folder is 8.6 MB so sync impact is minimal.

**Q: I want to add files to the vault**
A: Just drop them in the appropriate subfolder. Run `_build_vault.py` to re-add frontmatter. OR add frontmatter manually using the schema (see any existing vault file for example).

---

## Customization

**Theme:** Currently set to "moonstone" (dark). Change in Settings → Appearance → Themes.

**Vault name:** "DSCR Sovereign OS" — change in Settings → Vault name.

**Daily notes / templates:** Disabled by default. Enable in Settings → Core plugins if desired.

**Hotkeys:** Default Obsidian hotkeys work. Graph = Ctrl/Cmd+G, search = Ctrl/Cmd+Shift+F, command palette = Ctrl/Cmd+P.
