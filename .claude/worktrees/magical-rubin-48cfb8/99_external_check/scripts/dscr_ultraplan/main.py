"""Main runner: builds body PDF and merges with cover."""

import os, sys, subprocess
sys.path.insert(0, os.path.dirname(__file__))

from build_body import (
    TocDocTemplate, _on_page, PAGE_W, PAGE_H, LEFT_MARGIN, RIGHT_MARGIN,
    TOP_MARGIN, BOTTOM_MARGIN,
    H1, H2, BODY, TOC_L0, TOC_L1,
    Paragraph, Spacer, PageBreak, HRFlowable,
    make_heading, hr, HEADER_FILL, ACCENT, SANS_BOLD, BORDER, TEXT_PRIMARY,
    BODY_BOLD,
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib import colors

from chapters_1_2 import chapter_1, chapter_2
from chapters_3_4 import chapter_3, chapter_4
from chapters_5_6 import chapter_5, chapter_6
from chapters_7_8 import chapter_7, chapter_8
from chapters_9_12 import chapter_9, chapter_10, chapter_11, chapter_12


BODY_PDF = "/home/z/my-project/scripts/dscr_ultraplan/body.pdf"
COVER_PDF = "/home/z/my-project/scripts/dscr_ultraplan/cover.pdf"
FINAL_PDF = "/home/z/my-project/download/DSCR_Godmode_Ultraplan_v7.pdf"


def build_body():
    story = []

    # ── Table of Contents ──
    toc_title_style = ParagraphStyle(
        name="TocTitle", fontName=SANS_BOLD, fontSize=22, leading=28,
        textColor=HEADER_FILL, alignment=TA_LEFT, spaceAfter=4,
    )
    toc_kicker = ParagraphStyle(
        name="TocKicker", fontName=SANS_BOLD, fontSize=8.5, leading=12,
        textColor=ACCENT, alignment=TA_LEFT, spaceAfter=2,
    )
    story.append(Spacer(0, 6))
    story.append(Paragraph("CONTENTS", toc_kicker))
    story.append(make_heading("Table of Contents", toc_title_style, level=0))
    story.append(hr())
    story.append(Spacer(0, 6))

    toc = TableOfContents()
    toc.levelStyles = [TOC_L0, TOC_L1]
    story.append(toc)
    story.append(PageBreak())

    # ── Chapters ──
    chapter_builders = [
        chapter_1, chapter_2, chapter_3, chapter_4, chapter_5, chapter_6,
        chapter_7, chapter_8, chapter_9, chapter_10, chapter_11, chapter_12,
    ]
    for builder in chapter_builders:
        story.extend(builder())

    doc = TocDocTemplate(
        BODY_PDF,
        pagesize=(PAGE_W, PAGE_H),
        leftMargin=LEFT_MARGIN, rightMargin=RIGHT_MARGIN,
        topMargin=TOP_MARGIN, bottomMargin=BOTTOM_MARGIN,
        title="DSCR Godmode Ultraplan v7.0",
        author="Operator Desk",
        subject="Strategic Intelligence Briefing — Six-Function Doctrine",
        creator="Z.ai PDF Skill",
    )
    doc.multiBuild(story, onFirstPage=_on_page, onLaterPages=_on_page)
    print(f"✓ Body PDF generated: {BODY_PDF}")


def merge_cover_body():
    """Merge cover.pdf + body.pdf -> final PDF using pypdf."""
    from pypdf import PdfWriter, PdfReader
    writer = PdfWriter()
    cover = PdfReader(COVER_PDF)
    body = PdfReader(BODY_PDF)
    for p in cover.pages:
        writer.add_page(p)
    for p in body.pages:
        writer.add_page(p)
    # Metadata
    writer.add_metadata({
        "/Title": "DSCR Godmode Ultraplan v7.0",
        "/Author": "Operator Desk",
        "/Subject": "Strategic Intelligence Briefing — Six-Function Doctrine",
        "/Creator": "Z.ai PDF Skill",
        "/Producer": "Z.ai",
    })
    os.makedirs(os.path.dirname(FINAL_PDF), exist_ok=True)
    with open(FINAL_PDF, "wb") as f:
        writer.write(f)
    print(f"✓ Final merged PDF: {FINAL_PDF}")
    print(f"  Size: {os.path.getsize(FINAL_PDF)/1024:.1f} KB")
    print(f"  Pages: {len(cover.pages) + len(body.pages)}")


if __name__ == "__main__":
    build_body()
    merge_cover_body()
