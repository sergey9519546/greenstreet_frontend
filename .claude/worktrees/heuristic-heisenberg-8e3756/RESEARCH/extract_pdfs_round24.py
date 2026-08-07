"""
Extract all remaining 11 PDFs in workspace (Option D - full read).
"""
from pathlib import Path
import pdfplumber

WORKSPACE = Path(r"C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE")
OUT_DIR = WORKSPACE / "RESEARCH" / "pdf_extractions"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# The 11 PDFs NOT yet extracted (already have 9 in pdf_extractions/)
TARGETS = [
    "Beyond the Rulebook_ Building a Competitive Edge by Integrating Dynamic Data into Cake Mortgage's Underwriting Framewo.pdf",
    "Beyond the Rulebook_ Building a Probabilistic Underwriting Engine with Graphs, Conformal Prediction, and Tabular Found.pdf",
    "FCRA Adverse Action Engine for Institutional Compliance.pdf",
    "From Blueprint to Sovereign Engine_ Hardening TimesFM for Real Estate Credit Risk.pdf",
    "From Policy to Profit_ A Dynamic Decision Engine for Cake Mortgage's 2026 Non-QM and DSCR Lending Strategies.pdf",
    "From Restriction to Dominance_ A Guide to Cake Mortgage's 2026 Non-QM Arbitrage and Underwriting Advantage.pdf",
    "The DSCR Sovereign OS Upgrade_ A Blueprint for Validating TimesFM 2.5 LoRA's Impact on Forecast Accuracy, Compliance, .pdf",
    "The Future of DSCR Lending.pdf",
    "TimesFM_Architecting the DSCR Sovereign OS_ A Seven-Week Sprint to Resolve Eight Critical Gaps in TimesFM 2.5.pdf",
    "TimesFM_From Signal Processor to Institutional Simulator_ Architecting a Multi-Engine DSCR Sovereign OS for Commercial.pdf",
]

# Already-extracted ones (skip)
ALREADY = {
    "Beyond the DSCR_ A Blueprint for an Adversarially-Robust, Dual-Ledger Decision Engine for Real Estate Investment.pdf",
    "AI Algorithm Improvement Prompt2.pdf",
    "AI Algorithm Improvement Prompt.pdf",
    "From Static Snapshot to Dynamic Trajectory_ Designing an Adversarially-Hardened, Dual-Ledger DSCR Engine for True Investment Risk Assessment.pdf",
    "From Calculator to Containment_ Adversarial Hardening of the AEGIS DSCR Engine.pdf",
    "From Black Box to Glass Box_ A Blueprint for Building an Adversarially-Hardened, Regulator-Compliant DSCR Decision Engine.pdf",
    "From Calculator to Counselor_ A Blueprint for an Advisor-Grade DSCR Decision Engine Driven by Adversarial Validation.pdf",
    "From Calculation to Counsel_ Architecting an Advisor-Grade DSCR Engine Through Adversarial Validation and Quantitative Innovation.pdf",
    "Architecting the Advisor-Grade DSCR Engine_ A Blueprint for Institutional-Grade Real Estate Decision Intelligence.pdf",
}

# Find ALL PDFs and skip already-extracted
all_pdfs = sorted([p.name for p in WORKSPACE.glob("*.pdf")])
to_extract = [p for p in all_pdfs if p not in ALREADY]
print(f"Total PDFs in workspace: {len(all_pdfs)}")
print(f"Already extracted: {len(ALREADY)}")
print(f"To extract now: {len(to_extract)}")

for pdf_name in to_extract:
    pdf_path = WORKSPACE / pdf_name
    if not pdf_path.exists():
        print(f"MISSING: {pdf_name}")
        continue
    txt_path = OUT_DIR / (pdf_path.stem + ".txt")
    print(f"\nExtracting: {pdf_name[:80]}...")
    try:
        all_text = []
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages, 1):
                page_text = page.extract_text() or ""
                all_text.append(f"\n\n===== PAGE {i} =====\n\n{page_text}")
        txt_path.write_text("".join(all_text), encoding="utf-8")
        size_kb = txt_path.stat().st_size / 1024
        print(f"  -> {txt_path.name[:60]} ({size_kb:.1f} KB, {len(all_text)} pages)")
    except Exception as e:
        print(f"  ERROR: {e}")

print("\n=== DONE ===")