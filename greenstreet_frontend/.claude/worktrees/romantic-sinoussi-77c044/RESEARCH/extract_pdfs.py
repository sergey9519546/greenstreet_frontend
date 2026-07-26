"""
Extract text from 4 target advisor-grade DSCR blueprint PDFs.
Saves to RESEARCH/pdf_extractions/ for the Read tool to consume.
"""
import sys
from pathlib import Path
import pdfplumber

WORKSPACE = Path(r"C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE")
OUT_DIR = WORKSPACE / "RESEARCH" / "pdf_extractions"
OUT_DIR.mkdir(parents=True, exist_ok=True)

TARGETS = [
    "From Black Box to Glass Box_ A Blueprint for Building an Adversarially-Hardened, Regulator-Compliant DSCR Decision Engine.pdf",
    "From Calculator to Counselor_ A Blueprint for an Advisor-Grade DSCR Decision Engine Driven by Adversarial Validation.pdf",
    "From Calculation to Counsel_ Architecting an Advisor-Grade DSCR Engine Through Adversarial Validation and Quantitative Innovation.pdf",
    "Architecting the Advisor-Grade DSCR Engine_ A Blueprint for Institutional-Grade Real Estate Decision Intelligence.pdf",
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