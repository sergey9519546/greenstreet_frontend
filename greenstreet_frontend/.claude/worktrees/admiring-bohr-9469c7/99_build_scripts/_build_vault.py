"""
DSCR Sovereign OS — Obsidian Vault Builder
============================================

Reads the workspace, mirrors all .md/.txt/.csv/.json files into _obsidian_vault/
with YAML frontmatter (type, slice, sprint, status, confidence, entities, tags).

Also:
- Extracts [[wikilinks]] from content
- Adds explicit outgoing edges via frontmatter `links:` field
- Generates Map of Content (MOC) hub files
- Generates audit log

Usage: python _build_vault.py
"""

from __future__ import annotations

import json
import re
import shutil
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

WORKSPACE = Path(r"C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE")
VAULT = WORKSPACE / "_obsidian_vault"

# Knowledge file extensions
EXTS = {".md", ".txt", ".csv", ".json"}
# Skip these directories (build artifacts, caches, vault plumbing)
SKIP_DIRS = {".venv", ".pytest_cache", ".ruff_cache", "__pycache__", ".git",
             "node_modules", "site-packages", ".obsidian_vault"}

# Skip files matching these path patterns (vault config + builder scripts)
SKIP_PATH_PATTERNS = [
    ".obsidian/",          # Obsidian config (appearance, plugins, themes)
    "_obsidian_vault/",    # The vault itself (no recursive mirroring)
    "/_build_vault.py",    # This script
    "/_build_mocs.py",     # MOC builder
    "/_verify_vault.py",   # Verification script
] 


# ---------------------------------------------------------------------------
# Topic → tags mapping
# ---------------------------------------------------------------------------

# Entity normalization (case-insensitive substring → canonical tag)
ENTITY_PATTERNS = {
    # Lenders (canonical names)
    "pennymac": "lender/pennymac",
    "griffin funding": "lender/griffin-funding",
    "griffin": "lender/griffin-funding",
    "kiavi": "lender/kiavi",
    "visio": "lender/visio-lending",
    "acra": "lender/acra-lending",
    "ocmbc": "lender/ocmbc",
    "crosscountry": "lender/crosscountry",
    "a&d mortgage": "lender/ad-mortgage",
    "ad mortgage": "lender/ad-mortgage",
    "newfi": "lender/newfi",
    "angel oak": "lender/angel-oak",
    "uwm": "lender/uwm",
    "defy": "lender/defy",
    "easy street": "lender/easy-street",
    "lima one": "lender/lima-one",
    "new silver": "lender/new-silver",
    "american heritage": "lender/american-heritage",
    "rocket pro": "lender/rocket-pro",
    "insula capital": "lender/insula",
    "insula": "lender/insula",
    "deephaven": "lender/deephaven",
    "ready capital": "lender/ready-capital",
    "verus": "lender/verus",
    "crane lender": "lender/verus",
    # Regulatory
    "ecoa": "regulation/ecoa",
    "reg b": "regulation/reg-b",
    "fcra": "regulation/fcra",
    "hoepa": "regulation/hoepa",
    "reg z": "regulation/reg-z",
    "reg z": "regulation/reg-z",
    "tila": "regulation/tila",
    "section 1071": "regulation/section-1071",
    "1071": "regulation/section-1071",
    "hmda": "regulation/hmda",
    "cfpb": "regulation/cfpb",
    "obba": "tax/obba",
    "obbbba": "tax/obba",
    # Math / concepts
    "dscr": "concept/dscr",
    "pitia": "concept/pitia",
    "itia": "concept/itia",
    "ltv": "concept/ltv",
    "cltv": "concept/cltv",
    "noI": "concept/noi",
    "cap rate": "concept/cap-rate",
    "appreciation": "concept/appreciation",
    "t-copula": "math/t-copula",
    "copula": "math/copula",
    "sobol": "math/sobol",
    "merton": "math/merton-dd",
    "timesfm": "ml/timesfm",
    "tabpfn": "ml/tabpfn",
    "conformal": "ml/conformal",
    "mapie": "ml/mapie",
    "xgboost": "ml/xgboost",
    "shap": "ml/shap",
    "vine copula": "math/vine-copula",
    # Slices / sprints
    "slice 1": "slice/1",
    "slice 2": "slice/2",
    "slice 3": "slice/3",
    "slice 4": "slice/4",
    "sprint 1": "sprint/1",
    "sprint 2": "sprint/2",
    "sprint 3": "sprint/3",
    "sprint 4": "sprint/4",
    "sprint 5": "sprint/5",
    "sprint 6": "sprint/6",
    "sprint 7": "sprint/7",
    # Property types
    "str": "topic/str",
    "short-term rental": "topic/str",
    "short term rental": "topic/str",
    "sfr": "topic/sfr",
    "condo": "topic/condo",
    "condotel": "topic/condotel",
    "multifamily": "topic/multifamily",
    "2-4 unit": "topic/2-4-unit",
    # Math/funding
    "arm": "concept/arm",
    "interest-only": "concept/io",
    "io loan": "concept/io",
    "io arm": "concept/io",
    "reverse mortgage": "topic/reverse-mortgage",
    "non-qm": "topic/non-qm",
    "nonqm": "topic/non-qm",
    "1031": "tax/1031",
    "qoz": "tax/qoz",
    "niit": "tax/niit",
    "pal": "tax/pal",
    "bonus depreciation": "tax/bonus-depreciation",
    "section 179": "tax/section-179",
    # Data sources
    "fred": "data/fred",
    "zillow": "data/zillow",
    "zori": "data/zori",
    "cotality": "data/cotality",
    "core logic": "data/cotality",
    "corelogic": "data/cotality",
    "trepp": "data/trepp",
    "kbra": "data/kbra",
    "apartment list": "data/apartment-list",
    "fannie mae": "data/fannie-mae",
    "freddie mac": "data/freddie-mac",
}

# Federal Reserve state → tag
US_STATES = {
    "alabama": "state/al", "alaska": "state/ak", "arizona": "state/az",
    "arkansas": "state/ar", "california": "state/ca", "colorado": "state/co",
    "connecticut": "state/ct", "delaware": "state/de", "florida": "state/fl",
    "georgia": "state/ga", "hawaii": "state/hi", "idaho": "state/id",
    "illinois": "state/il", "indiana": "state/in", "iowa": "state/ia",
    "kansas": "state/ks", "kentucky": "state/ky", "louisiana": "state/la",
    "maine": "state/me", "maryland": "state/md", "massachusetts": "state/ma",
    "michigan": "state/mi", "minnesota": "state/mn", "mississippi": "state/ms",
    "missouri": "state/mo", "montana": "state/mt", "nebraska": "state/ne",
    "nevada": "state/nv", "new hampshire": "state/nh", "new jersey": "state/nj",
    "new mexico": "state/nm", "new york": "state/ny", "north carolina": "state/nc",
    "north dakota": "state/nd", "ohio": "state/oh", "oklahoma": "state/ok",
    "oregon": "state/or", "pennsylvania": "state/pa", "rhode island": "state/ri",
    "south carolina": "state/sc", "south dakota": "state/sd", "tennessee": "state/tn",
    "texas": "state/tx", "utah": "state/ut", "vermont": "state/vt",
    "virginia": "state/va", "washington": "state/wa", "west virginia": "state/wv",
    "wisconsin": "state/wi", "wyoming": "state/wy", "district of columbia": "state/dc",
    "washington dc": "state/dc", "washington, dc": "state/dc",
}

# Topical tags
TOPIC_TAGS = {
    "monte carlo": "topic/monte-carlo",
    "yield curve": "topic/yield-curve",
    "nss": "topic/yield-curve",
    "nelson-siegel": "topic/yield-curve",
    "svensson": "topic/yield-curve",
    "hull-white": "topic/yield-curve",
    "vasicek": "topic/yield-curve",
    "cir": "topic/short-rate",
    "cecl": "topic/cecl",
    "lgd": "topic/lgd",
    "default": "topic/default-rate",
    "cure rate": "topic/cure-rate",
    "foreclosure": "topic/foreclosure",
    "borrower demographics": "topic/borrower-demographics",
    "insurance": "topic/insurance",
    "flood": "topic/flood-insurance",
    "fema": "topic/flood-insurance",
    "fair plan": "topic/fair-plan",
    "title insurance": "topic/title-insurance",
    "reserves": "topic/reserves",
    "adverse action": "topic/adverse-action",
    "reason code": "topic/adverse-action",
    "kill criterion": "topic/kill-criteria",
    "ic memo": "topic/ic-memo",
    "usury": "topic/usury",
    "prepayment penalty": "topic/ppp",
    "ppp": "topic/ppp",
    "40-year": "topic/40yr-amort",
    "40yr": "topic/40yr-amort",
    "blanket loan": "topic/portfolio",
    "portfolio": "topic/portfolio",
    "cross-collateral": "topic/portfolio",
    "cross-default": "topic/portfolio",
    "modified dietz": "topic/portfolio",
    "epfl": "topic/portfolio",
    "concentration": "topic/portfolio",
    "xgb": "ml/xgboost",
    "llpa": "topic/llpa",
    "stress test": "topic/stress-test",
    "interest-only": "concept/io",
    "recheck": "topic/recheck",
    "architecture": "topic/architecture",
    "audit": "type/audit",
    "compliance": "topic/compliance",
    "compliance": "topic/compliance",
    "regulatory": "topic/compliance",
    "after-tax": "topic/after-tax",
    "tax": "topic/tax",
    "tournament": "topic/tournament",
    "apex": "topic/apex",
}

# Skip pattern for entity extraction (only consider in body, not filename)
ENTITY_MIN_LEN = 3


# ---------------------------------------------------------------------------
# File classification
# ---------------------------------------------------------------------------

@dataclass
class FileMeta:
    src_path: Path
    vault_path: Path
    rel_path: str
    category: str  # research/domain, research/godmode, output, analysis, root
    type: str  # research | code | deliverable | audit | data
    slice: int | None = None
    sprint: int | None = None
    status: str = "drafted"
    confidence: int = 0
    tags: list[str] = field(default_factory=list)
    entities: list[str] = field(default_factory=list)
    wikilinks_out: list[str] = field(default_factory=list)
    title: str = ""
    summary: str = ""


def classify(path: Path) -> tuple[str, str]:
    """Return (category, type) for vault placement."""
    parts = path.relative_to(WORKSPACE).parts
    if len(parts) == 1:
        # Workspace root
        return ("_root", "research")
    head = parts[0]
    if head == "ANALYSIS":
        return ("analysis", "research")
    if head == "output":
        return ("deliverables", "deliverable" if "Memo" in path.name or "Audit" in path.name else "research")
    if head == "RESEARCH":
        sub = parts[1] if len(parts) > 1 else ""
        if sub.startswith("domain_"):
            return (f"research/domains/{sub}", "research")
        if sub == "godmode_20260618":
            sub2 = parts[2] if len(parts) > 2 else ""
            return (f"research/godmode/{sub2}", "research")
        if sub == "sprint_clean":
            return ("research/sprints", "research")
        if sub == "sprint_short":
            return ("research/sprints", "research")
        if sub == "deep_research_20260618":
            return ("research/deep_research", "research")
        if sub == "pdf_extractions":
            return ("research/extractions", "research")
        if sub == "pdf_short":
            return ("research/extractions", "research")
        return ("research", "research")
    if head == "DSCR_SOVEREIGN_OS":
        return ("code", "code")
    if head == "autoresearch":
        return ("research", "research")
    return ("research", "research")


def determine_slice_sprint(path: Path, content_head: str) -> tuple[int | None, int | None]:
    """Infer slice (1-4) and sprint (1-7) from path + content."""
    rel = str(path.relative_to(WORKSPACE)).lower()
    content = content_head.lower()

    slice_num = None
    for s in (1, 2, 3, 4):
        if f"slice {s}" in rel or f"slice{s}" in rel or f"/slice{s}/" in rel:
            slice_num = s
            break
        # Content head keywords
        if f"slice {s}" in content[:500]:
            slice_num = s
            break

    sprint_num = None
    for sp in (1, 2, 3, 4, 5, 6, 7):
        if f"sprint {sp}" in rel or f"sprint{sp}" in rel or f"/sprint_{sp}" in rel or f"sprint{sp:02d}" in rel.lower():
            sprint_num = sp
            break

    return slice_num, sprint_num


def determine_status(path: Path, content_head: str) -> str:
    """Determine file status from content cues."""
    content_lower = content_head.lower()
    rel_lower = str(path.relative_to(WORKSPACE)).lower()

    # Shipped indicators
    if any(kw in rel_lower for kw in ("ship_memo", "ship ", "shipped", "v0.2.0", "v0.3.0")):
        return "shipped"
    if "ship memo" in content_lower[:500] or "shipped" in content_lower[:500]:
        return "shipped"

    # Audit indicators
    if "gap_audit" in rel_lower or "_audit_" in rel_lower:
        return "shipped"  # audit is final-state

    # Audit reports
    if "audit" in rel_lower and ("_v2" in rel_lower or "_v3" in rel_lower or "_v4" in rel_lower):
        return "shipped"

    return "drafted"


def extract_title(path: Path, content_head: str) -> str:
    """Extract title from first heading or filename."""
    # Look for first markdown heading
    for line in content_head.split("\n")[:20]:
        line = line.strip()
        if line.startswith("# "):
            return line[2:].strip()
        if line.startswith("## "):
            return line[3:].strip()
    # Fallback to filename
    return path.stem.replace("_", " ").replace("-", " ").title()


def extract_entities_and_tags(path: Path, content: str) -> tuple[set[str], set[str]]:
    """Extract entity tags and topic tags from content."""
    entities: set[str] = set()
    topics: set[str] = set()
    content_lower = content.lower()
    rel = str(path.relative_to(WORKSPACE)).lower()

    # Entity detection (case-insensitive substring)
    for pattern, tag in ENTITY_PATTERNS.items():
        if pattern in content_lower or pattern in rel:
            entities.add(tag)

    # US state detection (word boundary)
    word_pattern = re.compile(r"\b(" + "|".join(re.escape(s) for s in US_STATES) + r")\b")
    state_hits = word_pattern.findall(content_lower)
    for hit in state_hits:
        canonical = hit if hit in US_STATES else hit
        if canonical in US_STATES:
            entities.add(US_STATES[canonical])

    # Topic detection
    for pattern, tag in TOPIC_TAGS.items():
        if pattern in content_lower or pattern in rel:
            topics.add(tag)

    return entities, topics


def extract_wikilinks(content: str) -> list[str]:
    """Find existing [[wikilinks]] in content."""
    return list(set(re.findall(r"\[\[([^\]\|]+?)(?:\|[^\]]+)?\]\]", content)))


def extract_summary(content: str, max_chars: int = 500) -> str:
    """Extract first non-heading paragraph as summary."""
    lines = content.split("\n")
    summary_lines = []
    in_heading = True
    for line in lines:
        stripped = line.strip()
        if not stripped:
            if summary_lines:
                break
            continue
        if stripped.startswith("#"):
            continue
        if stripped.startswith("---"):
            continue
        if stripped.startswith("```"):
            continue
        # First non-heading paragraph
        if not summary_lines and len(stripped) > 30:
            summary_lines.append(stripped)
            in_heading = False
        elif summary_lines and len(" ".join(summary_lines)) > 50:
            break
        elif summary_lines:
            summary_lines.append(stripped)
    summary = " ".join(summary_lines)
    if len(summary) > max_chars:
        summary = summary[:max_chars].rsplit(" ", 1)[0] + "..."
    return summary


# ---------------------------------------------------------------------------
# YAML frontmatter serialization (manual to avoid PyYAML dep)
# ---------------------------------------------------------------------------

def yaml_escape(s: str) -> str:
    """Escape a string for use in YAML value."""
    if not s:
        return '""'
    # If contains special chars, quote
    if any(c in s for c in ":#{}[]&*?|>!%@`'\""):
        return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'
    return s


def make_frontmatter(meta: FileMeta) -> str:
    """Build YAML frontmatter string."""
    lines = ["---"]
    lines.append(f"type: {meta.type}")
    if meta.slice is not None:
        lines.append(f"slice: {meta.slice}")
    if meta.sprint is not None:
        lines.append(f"sprint: {meta.sprint}")
    lines.append(f"status: {meta.status}")
    if meta.confidence:
        lines.append(f"confidence: {meta.confidence}")
    if meta.title:
        lines.append(f"title: {yaml_escape(meta.title)}")
    if meta.summary:
        lines.append(f"summary: {yaml_escape(meta.summary)}")
    if meta.entities:
        lines.append("entities:")
        for e in sorted(meta.entities):
            lines.append(f"  - {e}")
    if meta.tags:
        lines.append("tags:")
        for t in sorted(meta.tags):
            lines.append(f"  - {t}")
    lines.append(f"source: {yaml_escape(meta.rel_path.replace(chr(92), '/'))}")
    lines.append(f"vaulted_at: {datetime.now().strftime('%Y-%m-%d')}")
    lines.append("---")
    lines.append("")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main build
# ---------------------------------------------------------------------------

def main():
    print(f"Workspace: {WORKSPACE}")
    print(f"Vault:     {VAULT}")
    print()

    # Collect all knowledge files
    files: list[Path] = []
    for p in WORKSPACE.rglob("*"):
        if not p.is_file():
            continue
        if p.suffix.lower() not in EXTS:
            continue
        rel = p.relative_to(WORKSPACE)
        if any(part in SKIP_DIRS for part in rel.parts):
            continue
        # Skip vault plumbing paths
        rel_str = str(rel).replace("\\", "/")
        if any(pat in rel_str for pat in SKIP_PATH_PATTERNS):
            continue
        files.append(p)

    print(f"Found {len(files)} knowledge files")
    print()

    # Process each file
    metas: list[FileMeta] = []
    ext_count = Counter()
    type_count = Counter()
    tag_counter = Counter()
    entity_counter = Counter()

    for src in files:
        try:
            # Read content
            try:
                content = src.read_text(encoding="utf-8", errors="replace")
            except Exception as e:
                print(f"  SKIP {src.name}: {e}")
                continue

            content_head = content[:2000]
            ext_count[src.suffix.lower()] += 1

            # Classify
            category, ftype = classify(src)
            slice_num, sprint_num = determine_slice_sprint(src, content_head)
            status = determine_status(src, content_head)
            title = extract_title(src, content_head)
            summary = extract_summary(content_head)

            # Vault path: preserve relative structure
            rel = src.relative_to(WORKSPACE)
            # e.g. RESEARCH\godmode_20260618\00_meta\Round19_T3_T4_T11_synthesis.md
            # -> _research\godmode\00_meta\Round19_T3_T4_T11_synthesis.md
            parts = rel.parts
            if parts[0] == "RESEARCH":
                rest = parts[1:]
                if rest[0] == "godmode_20260618":
                    cat = "_research/godmode/" + "/".join(rest[1:])
                elif rest[0].startswith("domain_"):
                    cat = "_research/domains/" + "/".join(rest)
                elif rest[0] == "sprint_clean":
                    cat = "_research/sprints/" + "/".join(rest[1:])
                elif rest[0] == "sprint_short":
                    cat = "_research/sprints/" + "/".join(rest[1:])
                elif rest[0] == "deep_research_20260618":
                    cat = "_research/deep_research/" + "/".join(rest[1:])
                elif rest[0] in ("pdf_extractions", "pdf_short"):
                    cat = "_research/extractions/" + "/".join(rest[1:])
                else:
                    cat = "_research/" + "/".join(rest)
                vault_sub = cat
            elif parts[0] == "ANALYSIS":
                vault_sub = "_analysis/" + "/".join(parts[1:])
            elif parts[0] == "output":
                vault_sub = "_deliverables/" + "/".join(parts[1:])
            elif parts[0] == "DSCR_SOVEREIGN_OS":
                vault_sub = "_code/" + "/".join(parts[1:])
            else:
                # Workspace root .md files
                vault_sub = "_root/" + src.name

            vault_path = VAULT / vault_sub

            # Extract entities + tags
            entities, topics = extract_entities_and_tags(src, content)
            # Filter entities — if too many states (>10), demote to topic
            if sum(1 for e in entities if e.startswith("state/")) > 10:
                # Probably a 50-state matrix; keep
                pass
            tag_counter.update(topics)
            entity_counter.update(entities)

            # Wikilinks
            wikilinks = extract_wikilinks(content)

            # Confidence: shallow heuristic
            if status == "shipped":
                confidence = 5
            elif "tier 1" in content_head.lower() or "5/5" in content_head[:1000]:
                confidence = 5
            elif "tier 2" in content_head.lower() or "4/5" in content_head[:1000]:
                confidence = 4
            elif status == "drafted":
                confidence = 3
            else:
                confidence = 0

            meta = FileMeta(
                src_path=src,
                vault_path=vault_path,
                rel_path=str(rel),
                category=category,
                type=ftype,
                slice=slice_num,
                sprint=sprint_num,
                status=status,
                confidence=confidence,
                tags=sorted(topics),
                entities=sorted(entities),
                wikilinks_out=wikilinks,
                title=title,
                summary=summary,
            )
            metas.append(meta)
            type_count[ftype] += 1

        except Exception as e:
            print(f"  ERROR on {src}: {e}")

    print(f"Processed {len(metas)} files")
    print(f"  By extension: {dict(ext_count)}")
    print(f"  By type: {dict(type_count)}")
    print()

    # Write each file with frontmatter
    print("Writing vault files...")
    written = 0
    for meta in metas:
        try:
            meta.vault_path.parent.mkdir(parents=True, exist_ok=True)
            original = meta.src_path.read_text(encoding="utf-8", errors="replace")
            frontmatter = make_frontmatter(meta)
            with open(meta.vault_path, "w", encoding="utf-8") as f:
                f.write(frontmatter)
                f.write(original)
                # Ensure trailing newline
                if not original.endswith("\n"):
                    f.write("\n")
            written += 1
        except Exception as e:
            print(f"  Write FAIL {meta.vault_path}: {e}")
    print(f"  Wrote {written} files")
    print()

    # Tag statistics
    print("Top 30 topic tags:")
    for tag, n in tag_counter.most_common(30):
        print(f"  {tag}: {n}")
    print()
    print("Top 30 entity tags:")
    for tag, n in entity_counter.most_common(30):
        print(f"  {tag}: {n}")
    print()

    # Save manifest for MOC generation
    manifest = {
        "generated_at": datetime.now().isoformat(),
        "total_files": len(metas),
        "by_type": dict(type_count),
        "by_extension": dict(ext_count),
        "tag_counts": dict(tag_counter.most_common()),
        "entity_counts": dict(entity_counter.most_common()),
        "files": [
            {
                "vault_path": str(m.vault_path.relative_to(VAULT)),
                "src_path": m.rel_path,
                "type": m.type,
                "slice": m.slice,
                "sprint": m.sprint,
                "status": m.status,
                "confidence": m.confidence,
                "tags": m.tags,
                "entities": m.entities,
                "title": m.title,
                "wikilinks_out": m.wikilinks_out,
            }
            for m in metas
        ],
    }
    manifest_path = VAULT / "_indexes" / "_manifest.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Manifest written: {manifest_path}")

    print()
    print("Done. Run _build_mocs.py next.")


if __name__ == "__main__":
    main()
