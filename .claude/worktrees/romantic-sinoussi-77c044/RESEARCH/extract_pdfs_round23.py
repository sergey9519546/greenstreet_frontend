"""
Extract text from 5 additional advisor-grade DSCR PDFs (Round 23, continuation).
Saves to RESEARCH/pdf_extractions/ for the Read tool to consume.
"""
from pathlib import Path
import pdfplumber

WORKSPACE = Path(r"C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE")
OUT_DIR = WORKSPACE / "RESEARCH" / "pdf_extractions"
OUT_DIR.mkdir(parents=True, exist_ok=True)

TARGETS = [
    "Beyond the DSCR_ A Blueprint for an Adversarially-Robust, Dual-Ledger Decision Engine for Real Estate Investment.pdf",
    "AI Algorithm Improvement Prompt2.pdf",
    "AI Algorithm Improvement Prompt.pdf",
    "From Static Snapshot to Dynamic Trajectory_ Designing an Adversarially-Hardened, Dual-Ledger DSCR Engine for True Investment Risk Assessment.pdf",
    "From Calculator to Containment_ Adversarial Hardening of the AEGIS DSCR Engine.pdf",
]

for pdf_name in TARGETS:
    pdf_path = WORKSPACE / pdf_name
    if not pdf_path.exists():
        print(f"MISSING: {pdf_name}")
        continue
    txt_path = OUT_DIR / (pdf_path.stem + ".txt")
    print(f"Extracting: {pdf_name}")
    try:
        all_text = []
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages, 1):
                page_text = page.extract_text() or ""
                all_text.append(f"\n\n===== PAGE {i} =====\n\n{page_text}")
        txt_path.write_text("".join(all_text), encoding="utf-8")
        size_kb = txt_path.stat().st_size / 1024
        print(f"  -> {txt_path.name} ({size_kb:.1f} KB, {len(all_text)} pages)")
    except Exception as e:
        print(f"  ERROR: {e}")

print("\nDone.")