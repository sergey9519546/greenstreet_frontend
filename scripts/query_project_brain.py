#!/usr/bin/env python3
"""
Project Brain CLI Query Tool for AI Agents
Searches the checked-in Project Brain research index.

Usage:
  python scripts/query_project_brain.py "prepayment penalty Florida"
  python scripts/query_project_brain.py "CQR math certainty equivalent"
"""

import sys
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
INDEX_PATH = REPO_ROOT / "docs" / "project_brain" / "MASTER_RESEARCH_INDEX.json"

if not INDEX_PATH.exists():
    print(f"Error: Master Research Index not found at {INDEX_PATH}")
    sys.exit(1)

query = " ".join(sys.argv[1:]).strip()
if not query:
    print("Usage: python scripts/query_project_brain.py <search_query>")
    sys.exit(0)

with open(INDEX_PATH, encoding="utf-8") as f:
    data = json.load(f)

docs = data.get("documents", [])
terms = query.lower().split()

matches = []

for doc in docs:
    title = doc.get("title", "").lower()
    path = doc.get("path", "").lower()
    kws = " ".join(doc.get("keywords", [])).lower()
    
    score = 0
    for term in terms:
        if term in title:
            score += 10
        if term in path:
            score += 5
        if term in kws:
            score += 3
            
    if score > 0:
        matches.append((score, doc))

matches.sort(key=lambda x: x[0], reverse=True)

print(f"=== PROJECT BRAIN KNOWLEDGE QUERY: '{query}' ===")
print(f"Found {len(matches)} relevant documents across {len(docs)} indexed research files:\n")

for score, doc in matches[:15]:
    size_kb = doc.get("size_bytes", 0) // 1024
    print(f"[{score} pts] {doc['title']} ({size_kb} KB) - Category: {doc['category']}")
    print(f"  Path: file:///{doc['path'].replace('\\', '/')}")
    print(f"  Keywords: {', '.join(doc.get('keywords', [])[:6])}")
    print()
