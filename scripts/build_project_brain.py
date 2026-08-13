import os
import json
from pathlib import Path

# Keep the checked-in index reproducible from any checkout. Optional external
# research roots retain the historical workstation layout when it is present,
# but a clone can safely run this script with only repository documentation.
REPO_ROOT = Path(__file__).resolve().parents[1]
DOCUMENTS_ROOT = REPO_ROOT.parent

# Target directories to index
TARGET_DIRS = [
    REPO_ROOT / "docs" / "dscr_loan_office",
    DOCUMENTS_ROOT / "FINANCE DATASETS",
    DOCUMENTS_ROOT / "obsidian-wiki-vault",
]

# Add one or more extra roots without baking another machine-specific path into
# source. Values use the platform path separator (";" on Windows, ":" on Unix).
TARGET_DIRS.extend(
    Path(directory).expanduser()
    for directory in os.environ.get("PROJECT_BRAIN_EXTRA_DIRS", "").split(os.pathsep)
    if directory.strip()
)

# Explicit exclusions
EXCLUDE_DIRS = {
    "node_modules", ".git", ".next", "dist", "build", "greenstreet_frontend",
    "public", "api", "scratch", ".firebase", "hf-lender", "hf-statelaws",
    "analysis_outputs", "cmbs_canonical", "cmbs_longitudinal", "cmbs_surveillance"
}
ALLOWED_EXTENSIONS = {".md", ".pdf", ".txt"}

def is_knowledge_file(filepath: Path) -> bool:
    if filepath.suffix.lower() not in ALLOWED_EXTENSIONS:
        return False
    # Check if it's inside an excluded directory
    for part in filepath.parts:
        if part in EXCLUDE_DIRS:
            return False
    return True

def generate_index():
    print("Building clean Project Brain Index...")
    documents = []
    
    for directory in TARGET_DIRS:
        if not os.path.exists(directory):
            continue
            
        for root, dirs, files in os.walk(directory):
            # Prune excluded directories
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            
            for file in files:
                filepath = Path(root) / file
                if is_knowledge_file(filepath):
                    size = filepath.stat().st_size
                    category = "Compliance/Legal" if "compliance" in filepath.name.lower() or "statelaw" in filepath.name.lower() else "Underwriting Spec" if "master" in filepath.name.lower() else "General Research"
                    
                    documents.append({
                        "title": filepath.name,
                        "path": str(filepath),
                        "size_bytes": size,
                        "category": category,
                        "keywords": ["loan", "dscr", "underwriting"] if "dscr" in filepath.name.lower() else ["finance"]
                    })
    
    out_dir = REPO_ROOT / "docs" / "project_brain"
    out_dir.mkdir(parents=True, exist_ok=True)
    
    json_path = out_dir / "MASTER_RESEARCH_INDEX.json"
    md_path = out_dir / "MASTER_KNOWLEDGE_VAULT.md"
    
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump({"documents": documents, "count": len(documents)}, f, indent=2)
        
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("# DSCR Sovereign OS - Project Brain Master Knowledge Vault\n\n")
        f.write("This vault indexes verified, core research documents strictly. Source code and fluff files are excluded.\n\n")
        f.write(f"Total documents: **{len(documents)}**\n\n")
        f.write("## Verified Knowledge Files\n\n")
        for doc in documents:
            size_kb = doc["size_bytes"] // 1024
            f.write(f"- [{doc['title']}](file:///{doc['path'].replace(chr(92), '/')}) ({size_kb} KB)\n")

    print(f"Index built successfully. Indexed {len(documents)} core knowledge files.")

if __name__ == "__main__":
    generate_index()
