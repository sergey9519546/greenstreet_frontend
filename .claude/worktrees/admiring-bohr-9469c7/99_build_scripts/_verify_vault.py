"""
DSCR Sovereign OS — Triple-Check Verification
==============================================

Three independent checks:
1. DUPLICATE SCAN: SHA-256 of file content. Flag exact + near duplicates.
2. TAG ACCURACY: Verify each file's frontmatter entities/tags actually appear in content.
3. PROJECT FIT: Identify files that don't match any DSCR topic (random/personal/other-project noise).
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import defaultdict
from datetime import datetime
from pathlib import Path

WORKSPACE = Path(r"C:\\Users\\serge\\OneDrive\\Documents\\DSCR_LOAN OFFICE")
VAULT = WORKSPACE / "_obsidian_vault"
MANIFEST = VAULT / "_indexes" / "_manifest.json"

EXTS = {".md", ".txt", ".csv", ".json"}
SKIP_DIRS = {".venv", ".pytest_cache", ".ruff_cache", "__pycache__",
             ".git", "node_modules", "site-packages", ".obsidian_vault"}

# DSCR-distinguishing keywords — at least one must appear in content for the file
# to be considered genuinely DSCR-related
DSCR_CORE_TERMS = [
    "dscr", "pitia", "itia", "ltv", "cltv", "non-qm", "nonqm", "str",
    "investor loan", "rental", "underwriting", "lender", "borrower",
    "mortgage", "loan", "fico", "appraisal", "rate", "interest-only",
    "arm reset", "cap rate", "noi", "cash-on-cash", "irr", "xirr",
    "real estate", "residential", "1-4 unit", "sfr", "condo",
    "porperty", "piti",
]

# Lender names (canonical, case-insensitive)
LENDER_NAMES = [
    "pennymac", "griffin", "kiavi", "visio", "acra", "ocmbc",
    "crosscountry", "newfi", "angel oak", "uwm", "defy", "easy street",
    "lima one", "new silver", "american heritage", "rocket pro",
    "insula", "deephaven", "ready capital", "verus",
]

# Regulatory/code terms
REGULATORY_TERMS = [
    "ecoa", "reg b", "fcra", "hoepa", "reg z", "tila", "section 1071",
    "1071", "hmda", "cfpb", "obba", "obbbba",
]

# Math/algorithm terms
MATH_TERMS = [
    "copula", "sobol", "merton", "yield curve", "nelson-siegel",
    "svensson", "hull-white", "vasicek", "cir", "longstaff-schwartz",
    "monte carlo", "cecl", "lgd", "cure rate", "default rate",
    "timesfm", "tabpfn", "conformal", "mapie", "xgboost", "shap",
]

# Tax/after-tax terms
TAX_TERMS = [
    "1031", "qoz", "niit", "pal", "bonus depreciation", "section 179",
    "after-tax", "after tax", "tax", "depreciation", "recapture",
]

# Insurance terms
INSURANCE_TERMS = [
    "insurance", "flood", "fema", "fair plan", "title insurance",
    "hazard", "wind", "hail",
]

# US states
US_STATES = [
    "alabama", "alaska", "arizona", "arkansas", "california",
    "colorado", "connecticut", "delaware", "florida", "georgia",
    "hawaii", "idaho", "illinois", "indiana", "iowa", "kansas",
    "kentucky", "louisiana", "maine", "maryland", "massachusetts",
    "michigan", "minnesota", "mississippi", "missouri", "montana",
    "nebraska", "nevada", "new hampshire", "new jersey", "new mexico",
    "new york", "north carolina", "north dakota", "ohio", "oklahoma",
    "oregon", "pennsylvania", "rhode island", "south carolina",
    "south dakota", "tennessee", "texas", "utah", "vermont",
    "virginia", "washington", "west virginia", "wisconsin", "wyoming",
]


def hash_file(path: Path) -> str:
    """SHA-256 hash of file content."""
    h = hashlib.sha256()
    try:
        with open(path, "rb") as f:
            while True:
                chunk = f.read(8192)
                if not chunk:
                    break
                h.update(chunk)
    except Exception:
        return ""
    return h.hexdigest()


def is_dscr_related(content: str, rel_path: str) -> tuple[bool, list[str]]:
    """Check if file has at least one DSCR marker in content OR filename."""
    content_lower = content.lower()
    rel_lower = rel_path.lower()

    matches = []

    for term in DSCR_CORE_TERMS:
        if term in content_lower:
            matches.append(f"core/{term}")
            break

    for lender in LENDER_NAMES:
        if lender in content_lower:
            matches.append(f"lender/{lender}")
            break

    for term in REGULATORY_TERMS:
        if term in content_lower:
            matches.append(f"reg/{term}")
            break

    for term in MATH_TERMS:
        if term in content_lower:
            matches.append(f"math/{term}")
            break

    for term in TAX_TERMS:
        if term in content_lower:
            matches.append(f"tax/{term}")
            break

    for term in INSURANCE_TERMS:
        if term in content_lower:
            matches.append(f"ins/{term}")
            break

    for state in US_STATES:
        if state in content_lower:
            matches.append(f"state/{state}")
            break

    return (len(matches) > 0, matches)


def verify_tags(content: str, meta: dict) -> dict:
    """For each entity tag, check if it appears in content (case-insensitive)."""
    content_lower = content.lower()
    results = {"verified": [], "missing": []}
    for tag in meta.get("entities", []) + meta.get("tags", []):
        # Strip prefix for matching
        clean = tag.split("/", 1)[-1].replace("-", " ").replace("_", " ")
        # Special cases
        if tag.startswith("lender/"):
            # Check for lender name as substring
            lender_name = tag.split("/", 1)[1].replace("-", " ")
            if lender_name in content_lower:
                results["verified"].append(tag)
            else:
                results["missing"].append(tag)
        elif tag.startswith("state/"):
            state_abbr = tag.split("/", 1)[1]
            # Check for full state name (since abbr doesn't appear)
            abbr_to_name = {
                "al": "alabama", "ak": "alaska", "az": "arizona", "ar": "arkansas",
                "ca": "california", "co": "colorado", "ct": "connecticut", "de": "delaware",
                "fl": "florida", "ga": "georgia", "hi": "hawaii", "id": "idaho",
                "il": "illinois", "in": "indiana", "ia": "iowa", "ks": "kansas",
                "ky": "kentucky", "la": "louisiana", "me": "maine", "md": "maryland",
                "ma": "massachusetts", "mi": "michigan", "mn": "minnesota",
                "ms": "mississippi", "mo": "missouri", "mt": "montana", "ne": "nebraska",
                "nv": "nevada", "nh": "new hampshire", "nj": "new jersey",
                "nm": "new mexico", "ny": "new york", "nc": "north carolina",
                "nd": "north dakota", "oh": "ohio", "ok": "oklahoma", "or": "oregon",
                "pa": "pennsylvania", "ri": "rhode island", "sc": "south carolina",
                "sd": "south dakota", "tn": "tennessee", "tx": "texas", "ut": "utah",
                "vt": "vermont", "va": "virginia", "wa": "washington",
                "wv": "west virginia", "wi": "wisconsin", "wy": "wyoming",
                "dc": "district of columbia",
            }
            full_name = abbr_to_name.get(state_abbr, state_abbr)
            if state_abbr in content_lower or full_name in content_lower:
                results["verified"].append(tag)
            else:
                results["missing"].append(tag)
        elif tag.startswith("slice/") or tag.startswith("sprint/") or tag.startswith("type/"):
            results["verified"].append(tag)  # Always trust metadata-driven tags
        elif tag.startswith("topic/") or tag.startswith("concept/") or tag.startswith("math/") or \
             tag.startswith("ml/") or tag.startswith("regulation/") or tag.startswith("tax/") or \
             tag.startswith("data/"):
            # Check for the clean name in content
            if clean in content_lower or tag.split("/", 1)[1] in content_lower:
                results["verified"].append(tag)
            else:
                results["missing"].append(tag)
        else:
            # Generic tag — check clean version
            if clean in content_lower:
                results["verified"].append(tag)
            else:
                results["missing"].append(tag)

    return results


def main():
    print("=" * 70)
    print("TRIPLE-CHECK VERIFICATION REPORT")
    print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Workspace: {WORKSPACE}")
    print("=" * 70)
    print()

    # Collect all files (workspace, not vault — vault is the mirror)
    files = []
    for p in WORKSPACE.rglob("*"):
        if not p.is_file():
            continue
        if p.suffix.lower() not in EXTS:
            continue
        rel = p.relative_to(WORKSPACE)
        if any(part in SKIP_DIRS for part in rel.parts):
            continue
        files.append(p)

    print(f"Total files to verify: {len(files)}")
    print()

    # Load manifest for tag verification
    manifest_data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    manifest_files = {f["src_path"].replace("\\", "/"): f for f in manifest_data["files"]}
    # Note: manifest uses forward slashes; src_path from WORKSPACE on Windows uses backslashes
    manifest_lookup = {}
    for f in manifest_data["files"]:
        manifest_lookup[f["src_path"]] = f
        manifest_lookup[f["src_path"].replace("/", "\\")] = f
        manifest_lookup[f["src_path"].replace("\\", "/")] = f
    print(f"Manifest entries: {len(manifest_files)}")
    print()

    # ---------------------------------------------------------------------
    # CHECK 1: Duplicates (SHA-256 content hash)
    # ---------------------------------------------------------------------
    print("=" * 70)
    print("CHECK 1: DUPLICATE DETECTION")
    print("=" * 70)
    print()

    hash_to_files: dict[str, list[Path]] = defaultdict(list)
    for f in files:
        h = hash_file(f)
        if h:
            hash_to_files[h].append(f)

    exact_dupes = {h: paths for h, paths in hash_to_files.items() if len(paths) > 1}
    print(f"Unique content hashes: {len(hash_to_files)}")
    print(f"Exact duplicate groups: {len(exact_dupes)}")
    print(f"Files in duplicate groups: {sum(len(v) for v in exact_dupes.values())}")
    print()

    dupe_report = []
    for h, paths in sorted(exact_dupes.items(), key=lambda x: -len(x[1]))[:20]:
        print(f"  Duplicate group ({len(paths)} copies):")
        for p in paths[:5]:
            print(f"    - {p.relative_to(WORKSPACE)}")
        if len(paths) > 5:
            print(f"    ... and {len(paths) - 5} more")
        dupe_report.append({
            "hash": h[:16],
            "count": len(paths),
            "files": [str(p.relative_to(WORKSPACE)) for p in paths],
        })
    print()

    # Near-duplicate detection (by filename similarity for files >5KB)
    name_dupes: dict[str, list[Path]] = defaultdict(list)
    for f in files:
        if f.stat().st_size < 5000:
            continue
        # Normalize: lowercase, strip extension, strip _v2 _v3 etc
        stem = f.stem.lower()
        stem = re.sub(r"[_ ]?v\d+$", "", stem)
        stem = re.sub(r"[_ ]?\(?\d+\)?$", "", stem)
        stem = re.sub(r"[_\s\-]+", " ", stem).strip()
        # Only group if stem is meaningful (>15 chars)
        if len(stem) > 15:
            name_dupes[stem].append(f)

    near_dupes = {stem: paths for stem, paths in name_dupes.items() if len(paths) > 1 and len(stem) > 15}
    print(f"Near-duplicate name groups: {len(near_dupes)}")
    for stem, paths in sorted(near_dupes.items(), key=lambda x: -len(x[1]))[:10]:
        print(f"  '{stem}' ({len(paths)} similar files):")
        for p in paths[:3]:
            print(f"    - {p.relative_to(WORKSPACE)}")
    print()

    # ---------------------------------------------------------------------
    # CHECK 2: Empty / tiny / suspicious files
    # ---------------------------------------------------------------------
    print("=" * 70)
    print("CHECK 2: EMPTY / TINY FILES (potential garbage)")
    print("=" * 70)
    print()

    tiny = [f for f in files if f.stat().st_size < 200]
    print(f"Files under 200 bytes: {len(tiny)}")
    for f in tiny[:20]:
        rel = f.relative_to(WORKSPACE)
        size = f.stat().st_size
        print(f"  {size:6d}b  {rel}")
    if len(tiny) > 20:
        print(f"  ... and {len(tiny) - 20} more")
    print()

    # ---------------------------------------------------------------------
    # CHECK 3: Project fit (DSCR-related)
    # ---------------------------------------------------------------------
    print("=" * 70)
    print("CHECK 3: PROJECT FIT (does file belong to DSCR Sovereign OS?)")
    print("=" * 70)
    print()

    not_dscr = []
    dscr = []
    for f in files:
        try:
            content = f.read_text(encoding="utf-8", errors="replace")
        except Exception:
            continue
        rel = str(f.relative_to(WORKSPACE))
        fit, matches = is_dscr_related(content, rel)
        if fit:
            dscr.append((f, matches))
        else:
            not_dscr.append(f)

    print(f"Files matching DSCR markers: {len(dscr)} ({100*len(dscr)/len(files):.1f}%)")
    print(f"Files NOT matching DSCR markers: {len(not_dscr)} ({100*len(not_dscr)/len(files):.1f}%)")
    print()

    if not_dscr:
        print("Files with no DSCR markers (review these — could be other-project noise):")
        for f in not_dscr[:30]:
            rel = str(f.relative_to(WORKSPACE))
            size = f.stat().st_size
            print(f"  {size:7d}b  {rel}")
        if len(not_dscr) > 30:
            print(f"  ... and {len(not_dscr) - 30} more")
    print()

    # ---------------------------------------------------------------------
    # CHECK 4: Tag accuracy
    # ---------------------------------------------------------------------
    print("=" * 70)
    print("CHECK 4: TAG ACCURACY (do frontmatter tags appear in content?)")
    print("=" * 70)
    print()

    total_verified = 0
    total_missing = 0
    high_missing_files = []

    for f in files:
        try:
            content = f.read_text(encoding="utf-8", errors="replace")
        except Exception:
            continue
        rel = str(f.relative_to(WORKSPACE))
        meta = manifest_lookup.get(rel)
        if not meta:
            continue
        result = verify_tags(content, meta)
        total_verified += len(result["verified"])
        total_missing += len(result["missing"])
        if len(result["missing"]) > 3:
            high_missing_files.append((f, result))

    print(f"Total tags verified (in content): {total_verified}")
    print(f"Total tags MISSING from content: {total_missing}")
    print(f"Files with >3 missing tags: {len(high_missing_files)}")
    print()

    if high_missing_files:
        print("Files with many tags that don't appear in content (likely mis-tagged):")
        for f, result in high_missing_files[:15]:
            rel = str(f.relative_to(WORKSPACE))
            print(f"  {rel}")
            for tag in result["missing"][:5]:
                print(f"    MISSING: {tag}")
            print()
    print()

    # ---------------------------------------------------------------------
    # CHECK 5: Frontmatter consistency (only files with frontmatter)
    # ---------------------------------------------------------------------
    print("=" * 70)
    print("CHECK 5: FRONTMATTER PARSE CHECK")
    print("=" * 70)
    print()

    bad_fm = []
    good_fm = 0
    for f in files:
        if f.suffix.lower() not in {".md"}:
            continue
        try:
            content = f.read_text(encoding="utf-8", errors="replace")
        except Exception:
            continue
        if not content.startswith("---"):
            continue  # No frontmatter (acceptable for non-MOC files)
        # Try to parse the frontmatter block
        match = re.match(r"^---\n(.*?)\n---\n", content, re.DOTALL)
        if not match:
            bad_fm.append((f, "frontmatter not closed"))
            continue
        fm_block = match.group(1)
        # Basic checks
        if "type:" not in fm_block:
            bad_fm.append((f, "missing 'type:' field"))
        else:
            good_fm += 1

    print(f"Files with valid YAML frontmatter (with 'type:'): {good_fm}")
    print(f"Files with broken frontmatter: {len(bad_fm)}")
    for f, err in bad_fm[:10]:
        rel = str(f.relative_to(WORKSPACE))
        print(f"  BROKEN: {rel}: {err}")
    print()

    # ---------------------------------------------------------------------
    # CHECK 6: Source URL / citation density
    # ---------------------------------------------------------------------
    print("=" * 70)
    print("CHECK 6: SOURCE CITATION DENSITY")
    print("=" * 70)
    print()

    url_pattern = re.compile(r"https?://[^\s\)\]\"\'<>]+")
    files_with_urls = []
    files_no_urls = []
    for f in files:
        if f.suffix.lower() not in {".md", ".txt"}:
            continue
        try:
            content = f.read_text(encoding="utf-8", errors="replace")
        except Exception:
            continue
        urls = url_pattern.findall(content)
        if urls:
            files_with_urls.append((f, len(urls)))
        else:
            files_no_urls.append(f)

    files_with_urls.sort(key=lambda x: -x[1])
    print(f"Files with at least one URL citation: {len(files_with_urls)}")
    print(f"Files with NO URL citations: {len(files_no_urls)}")
    print()
    print("Top 10 most-cited files (URL count):")
    for f, n in files_with_urls[:10]:
        rel = str(f.relative_to(WORKSPACE))
        print(f"  {n:4d} URLs: {rel}")
    print()

    # ---------------------------------------------------------------------
    # CHECK 7: Claim verification (Tier 1 audit cards)
    # ---------------------------------------------------------------------
    print("=" * 70)
    print("CHECK 7: TIER-1 CLAIM AUDIT CARD INVENTORY")
    print("=" * 70)
    print()

    tier1_dir = WORKSPACE / "RESEARCH" / "godmode_20260618" / "01_T1_tier1_sweep"
    tier1_files = list(tier1_dir.glob("claim_*.md")) if tier1_dir.exists() else []
    print(f"Tier-1 claim audit cards: {len(tier1_files)}")
    for cf in tier1_files:
        content = cf.read_text(encoding="utf-8", errors="replace")
        # Look for "Confidence Score" or "TIER" verdict
        verdict = "?"
        if "TIER 1 CONFIRMED" in content:
            verdict = "TIER 1 ✅"
        elif "TIER 2" in content:
            verdict = "TIER 2 ⚠"
        elif "TIER 3" in content:
            verdict = "TIER 3 ❌"
        # Count sources
        n_sources = len(re.findall(r"\*\*Source \d+", content))
        n_urls = len(url_pattern.findall(content))
        print(f"  {verdict}  sources={n_sources}  URLs={n_urls}  {cf.name}")
    print()

    # ---------------------------------------------------------------------
    # Summary
    # ---------------------------------------------------------------------
    print("=" * 70)
    print("VERIFICATION SUMMARY")
    print("=" * 70)
    print()
    print(f"  Total files checked:        {len(files)}")
    print(f"  Unique content hashes:      {len(hash_to_files)}")
    print(f"  Exact duplicate groups:     {len(exact_dupes)}")
    print(f"  Near-duplicate name groups: {len(near_dupes)}")
    print(f"  Tiny/empty files (<200b):   {len(tiny)}")
    print(f"  Files with DSCR markers:    {len(dscr)}")
    print(f"  Files without DSCR markers: {len(not_dscr)}")
    print(f"  Tags verified in content:   {total_verified}")
    print(f"  Tags missing from content:  {total_missing}")
    print(f"  Files with >3 missing tags: {len(high_missing_files)}")
    print(f"  Valid YAML frontmatter:     {good_fm}")
    print(f"  Broken YAML frontmatter:    {len(bad_fm)}")
    print(f"  Files with URL citations:   {len(files_with_urls)}")
    print(f"  Files without URLs:         {len(files_no_urls)}")
    print(f"  Tier-1 claim cards:         {len(tier1_files)}")
    print()

    # Save report
    report = {
        "generated_at": datetime.now().isoformat(),
        "total_files": len(files),
        "unique_hashes": len(hash_to_files),
        "duplicate_groups": len(exact_dupes),
        "duplicates": dupe_report[:30],
        "near_duplicate_name_groups": {
            stem: [str(p.relative_to(WORKSPACE)) for p in paths]
            for stem, paths in sorted(near_dupes.items(), key=lambda x: -len(x[1]))[:30]
        },
        "tiny_files": [
            {"path": str(f.relative_to(WORKSPACE)), "size": f.stat().st_size}
            for f in tiny[:50]
        ],
        "not_dscr_files": [str(f.relative_to(WORKSPACE)) for f in not_dscr[:50]],
        "tags_verified": total_verified,
        "tags_missing": total_missing,
        "high_missing_tag_files": [
            {"path": str(f.relative_to(WORKSPACE)),
             "missing_tags": result["missing"]}
            for f, result in high_missing_files[:30]
        ],
        "broken_frontmatter": [
            {"path": str(f.relative_to(WORKSPACE)), "error": err}
            for f, err in bad_fm[:20]
        ],
        "files_with_urls": len(files_with_urls),
        "top_cited_files": [
            {"path": str(f.relative_to(WORKSPACE)), "url_count": n}
            for f, n in files_with_urls[:20]
        ],
        "tier1_audit_cards": len(tier1_files),
    }
    report_path = VAULT / "_indexes" / "_verification_report.json"
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"Full report: {report_path}")


if __name__ == "__main__":
    main()

