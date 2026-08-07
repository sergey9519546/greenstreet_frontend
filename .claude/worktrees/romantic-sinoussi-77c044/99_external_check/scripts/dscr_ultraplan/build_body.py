"""DSCR GODMODE ULTRAPLAN — Body PDF Generator.

Builds the body of the strategic plan via ReportLab, then merges with the
pre-rendered Playwright cover into the final deliverable PDF.
"""

import os, sys, hashlib, subprocess
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    KeepTogether, Image, Flowable, HRFlowable, ListFlowable, ListItem,
)
from reportlab.platypus.tableofcontents import TableOfContents

# Bring in font fallback engine from pdf skill
PDF_SKILL_DIR = "/home/z/my-project/skills/pdf"
sys.path.insert(0, os.path.join(PDF_SKILL_DIR, "scripts"))
from pdf import install_font_fallback  # type: ignore

# ──────────────────────────────────────────────────────────────────
# FONT REGISTRATION
# ──────────────────────────────────────────────────────────────────
pdfmetrics.registerFont(TTFont("NotoSerifSC",       "/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf"))
pdfmetrics.registerFont(TTFont("NotoSerifSC-Bold",  "/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif",         "/usr/share/fonts/truetype/freefont/FreeSerif.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif-Bold",    "/usr/share/fonts/truetype/freefont/FreeSerifBold.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif-Italic",  "/usr/share/fonts/truetype/freefont/FreeSerifItalic.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif-BoldItalic","/usr/share/fonts/truetype/freefont/FreeSerifBoldItalic.ttf"))
pdfmetrics.registerFont(TTFont("Carlito",           "/usr/share/fonts/truetype/english/Carlito-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Carlito-Bold",      "/usr/share/fonts/truetype/english/Carlito-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Carlito-Italic",    "/usr/share/fonts/truetype/english/Carlito-Italic.ttf"))
pdfmetrics.registerFont(TTFont("SarasaMono",        "/usr/share/fonts/truetype/chinese/SarasaMonoSC-Regular.ttf"))
pdfmetrics.registerFont(TTFont("SarasaMono-Bold",   "/usr/share/fonts/truetype/chinese/SarasaMonoSC-Bold.ttf"))

from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily("FreeSerif", normal="FreeSerif", bold="FreeSerif-Bold",
                   italic="FreeSerif-Italic", boldItalic="FreeSerif-BoldItalic")
registerFontFamily("Carlito", normal="Carlito", bold="Carlito-Bold", italic="Carlito-Italic")
registerFontFamily("NotoSerifSC", normal="NotoSerifSC", bold="NotoSerifSC-Bold")
registerFontFamily("SarasaMono", normal="SarasaMono", bold="SarasaMono-Bold")

install_font_fallback()

# ──────────────────────────────────────────────────────────────────
# CASCADE PALETTE (minimal mode for body)
# ──────────────────────────────────────────────────────────────────
PAGE_BG       = colors.HexColor('#ffffff')
SECTION_BG    = colors.HexColor('#f6f5f3')
CARD_BG       = colors.HexColor('#f1efea')
TABLE_STRIPE  = colors.HexColor('#f4f2ee')
HEADER_FILL   = colors.HexColor('#1f2937')   # slate-800 — strategic briefing feel
COVER_BLOCK   = colors.HexColor('#37332a')
BORDER        = colors.HexColor('#cbd1d8')
ICON          = colors.HexColor('#475569')
ACCENT        = colors.HexColor('#b45309')   # amber-700 — DSCR signal
ACCENT_2      = colors.HexColor('#0369a1')   # sky-700 — data
TEXT_PRIMARY  = colors.HexColor('#1a1c20')
TEXT_MUTED    = colors.HexColor('#6b6f76')
SEM_SUCCESS   = colors.HexColor('#15803d')
SEM_WARNING   = colors.HexColor('#b45309')
SEM_ERROR     = colors.HexColor('#b91c1c')
SEM_INFO      = colors.HexColor('#1d4ed8')

# ──────────────────────────────────────────────────────────────────
# STYLES
# ──────────────────────────────────────────────────────────────────
BODY_FONT      = "FreeSerif"
BODY_BOLD      = "FreeSerif-Bold"
BODY_ITALIC    = "FreeSerif-Italic"
SANS_FONT      = "Carlito"
SANS_BOLD      = "Carlito-Bold"
MONO_FONT      = "SarasaMono"
MONO_BOLD      = "SarasaMono-Bold"

H1 = ParagraphStyle(
    name="H1", fontName=SANS_BOLD, fontSize=20, leading=26,
    textColor=HEADER_FILL, spaceBefore=10, spaceAfter=4, alignment=TA_LEFT,
)
H1_KICKER = ParagraphStyle(
    name="H1Kicker", fontName=SANS_BOLD, fontSize=8.5, leading=12,
    textColor=ACCENT, spaceBefore=14, spaceAfter=2, alignment=TA_LEFT,
)
H2 = ParagraphStyle(
    name="H2", fontName=SANS_BOLD, fontSize=13, leading=18,
    textColor=HEADER_FILL, spaceBefore=14, spaceAfter=4, alignment=TA_LEFT,
)
H3 = ParagraphStyle(
    name="H3", fontName=SANS_BOLD, fontSize=10.5, leading=15,
    textColor=ACCENT_2, spaceBefore=10, spaceAfter=2, alignment=TA_LEFT,
)
BODY = ParagraphStyle(
    name="Body", fontName=BODY_FONT, fontSize=10, leading=15.5,
    textColor=TEXT_PRIMARY, alignment=TA_JUSTIFY, spaceAfter=6,
)
BODY_LEFT = ParagraphStyle(
    name="BodyLeft", fontName=BODY_FONT, fontSize=10, leading=15.5,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceAfter=6,
)
BULLET = ParagraphStyle(
    name="Bullet", fontName=BODY_FONT, fontSize=9.8, leading=14.5,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, leftIndent=14, bulletIndent=2,
    spaceAfter=2,
)
SMALL = ParagraphStyle(
    name="Small", fontName=BODY_FONT, fontSize=8.5, leading=11.5,
    textColor=TEXT_MUTED, alignment=TA_LEFT, spaceAfter=2,
)
CALLOUT_TITLE = ParagraphStyle(
    name="CalloutTitle", fontName=SANS_BOLD, fontSize=9, leading=12,
    textColor=ACCENT, alignment=TA_LEFT, spaceAfter=3,
)
CALLOUT_BODY = ParagraphStyle(
    name="CalloutBody", fontName=BODY_FONT, fontSize=9.5, leading=14,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceAfter=0,
)
QUOTE = ParagraphStyle(
    name="Quote", fontName=BODY_ITALIC, fontSize=11, leading=16,
    textColor=HEADER_FILL, alignment=TA_LEFT, leftIndent=20, rightIndent=20,
    spaceBefore=6, spaceAfter=6,
)
TABLE_CELL = ParagraphStyle(
    name="TableCell", fontName=BODY_FONT, fontSize=8.5, leading=11.5,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT,
)
TABLE_CELL_BOLD = ParagraphStyle(
    name="TableCellBold", fontName=SANS_BOLD, fontSize=8.5, leading=11.5,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT,
)
TABLE_HEAD = ParagraphStyle(
    name="TableHead", fontName=SANS_BOLD, fontSize=8.5, leading=11.5,
    textColor=colors.white, alignment=TA_LEFT,
)
TABLE_HEAD_CENTER = ParagraphStyle(
    name="TableHeadC", fontName=SANS_BOLD, fontSize=8.5, leading=11.5,
    textColor=colors.white, alignment=TA_CENTER,
)
TABLE_CELL_CENTER = ParagraphStyle(
    name="TableCellC", fontName=BODY_FONT, fontSize=8.5, leading=11.5,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER,
)
MONO_SM = ParagraphStyle(
    name="Mono", fontName=MONO_FONT, fontSize=8.5, leading=12,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT,
)
TOC_L0 = ParagraphStyle(
    name="TOCL0", fontName=SANS_BOLD, fontSize=11, leading=16,
    textColor=HEADER_FILL, leftIndent=0, spaceAfter=4,
)
TOC_L1 = ParagraphStyle(
    name="TOCL1", fontName=BODY_FONT, fontSize=9.8, leading=14,
    textColor=TEXT_PRIMARY, leftIndent=18, spaceAfter=2,
)

# ──────────────────────────────────────────────────────────────────
# PAGE LAYOUT — header/footer canvas
# ──────────────────────────────────────────────────────────────────
# Match cover page size exactly (cover renders at 595.92 x 842.88pt from 794x1123px)
PAGE_W, PAGE_H = 595.92, 842.88
from reportlab.lib.pagesizes import A4
LEFT_MARGIN = 22 * mm
RIGHT_MARGIN = 22 * mm
TOP_MARGIN = 26 * mm
BOTTOM_MARGIN = 22 * mm
CONTENT_W = PAGE_W - LEFT_MARGIN - RIGHT_MARGIN


def _on_page(canvas, doc):
    """Header + footer on every body page."""
    canvas.saveState()
    # Header rule
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.4)
    canvas.line(LEFT_MARGIN, PAGE_H - 18*mm, PAGE_W - RIGHT_MARGIN, PAGE_H - 18*mm)
    # Header text
    canvas.setFont(SANS_BOLD, 7.5)
    canvas.setFillColor(ACCENT)
    canvas.drawString(LEFT_MARGIN, PAGE_H - 14*mm, "DSCR GODMODE ULTRAPLAN")
    canvas.setFont(SANS_FONT, 7.5)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawRightString(PAGE_W - RIGHT_MARGIN, PAGE_H - 14*mm, "Strategic Intelligence Briefing  /  v7.0")
    # Footer rule
    canvas.setStrokeColor(BORDER)
    canvas.line(LEFT_MARGIN, 16*mm, PAGE_W - RIGHT_MARGIN, 16*mm)
    # Footer text
    canvas.setFont(SANS_FONT, 7.5)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(LEFT_MARGIN, 12*mm, "DSCR-INTEL // Operator Desk")
    canvas.drawCentredString(PAGE_W/2, 12*mm, "Internal / Build Cycle v7.0")
    canvas.drawRightString(PAGE_W - RIGHT_MARGIN, 12*mm, f"Page {doc.page}")
    canvas.restoreState()


# ──────────────────────────────────────────────────────────────────
# TOC DOC TEMPLATE
# ──────────────────────────────────────────────────────────────────
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))


def make_heading(text, style, level=0):
    key = f'h_{hashlib.md5(text.encode()).hexdigest()[:10]}'
    p = Paragraph(f'<a name="{key}"/>{text}', style)
    p.bookmark_name = key
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p


# ──────────────────────────────────────────────────────────────────
# CALLOUT / METRIC HELPERS
# ──────────────────────────────────────────────────────────────────
def callout_box(title, body_html, color=ACCENT, bg=CARD_BG):
    """Render a left-bordered callout box."""
    inner = [
        Paragraph(title.upper(), CALLOUT_TITLE),
        Paragraph(body_html, CALLOUT_BODY),
    ]
    tbl = Table([[inner]], colWidths=[CONTENT_W])
    tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg),
        ('LINEBEFORE', (0,0), (0,-1), 2.5, color),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    return tbl


def metric_strip(metrics):
    """Render a horizontal strip of N metric tiles.
    metrics: list of (value, label) tuples.
    """
    cells = []
    for v, lbl in metrics:
        cell = [
            Paragraph(f'<font name="{SANS_BOLD}" size="14" color="#{ACCENT.hexval()[2:]}">{v}</font>', BODY_LEFT),
            Spacer(0, 2),
            Paragraph(f'<font name="{SANS_FONT}" size="7.5" color="#{TEXT_MUTED.hexval()[2:]}">{lbl.upper()}</font>', BODY_LEFT),
        ]
        cells.append(cell)
    tbl = Table([cells], colWidths=[CONTENT_W/len(metrics)]*len(metrics))
    tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LINEBEFORE', (0,0), (0,-1), 0.5, BORDER),
        ('LINEBEFORE', (1,0), (-1,-1), 0.5, BORDER),
    ]))
    return tbl


def std_table(headers, rows, col_weights=None, header_align=None):
    """Build a standard striped table with header row.
    headers: list of strings (header text)
    rows: list of lists (each inner list is a row of strings)
    col_weights: list of relative widths summing to 1
    header_align: list of 'L'/'C'/'R' per column
    """
    n = len(headers)
    if col_weights is None:
        col_weights = [1.0/n]*n
    if header_align is None:
        header_align = ['L']*n
    col_widths = [w*CONTENT_W for w in col_weights]

    # Header row
    head_styles = {
        'L': TABLE_HEAD, 'C': TABLE_HEAD_CENTER, 'R': TABLE_HEAD_CENTER,
    }
    head_cells = [Paragraph(h, head_styles[header_align[i]]) for i, h in enumerate(headers)]
    data = [head_cells]
    for r in rows:
        row_cells = []
        for i, cell in enumerate(r):
            style = TABLE_CELL_CENTER if header_align[i] == 'C' else TABLE_CELL
            row_cells.append(Paragraph(str(cell), style))
        data.append(row_cells)

    tbl = Table(data, colWidths=col_widths, repeatRows=1)
    tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), HEADER_FILL),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), SANS_BOLD),
        ('FONTSIZE', (0,0), (-1,0), 8.5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, TABLE_STRIPE]),
        ('LINEBELOW', (0,0), (-1,0), 0.5, HEADER_FILL),
        ('LINEBELOW', (0,-1), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    return tbl


def hr():
    return HRFlowable(width="100%", thickness=0.4, color=BORDER, spaceBefore=4, spaceAfter=4)


def bullets(items, style=None):
    style = style or BULLET
    return ListFlowable(
        [ListItem(Paragraph(t, style), value='•', leftIndent=14) for t in items],
        bulletType='bullet', start='•', leftIndent=14,
    )


def chapter_opener(num, title, kicker):
    """Returns a list of flowables for chapter opener."""
    out = []
    out.append(Spacer(0, 4))
    out.append(Paragraph(f"CHAPTER {num:02d}", H1_KICKER))
    out.append(make_heading(title, H1, level=0))
    out.append(Paragraph(kicker, ParagraphStyle(
        name="OpenerQuote", fontName=BODY_ITALIC, fontSize=10.5, leading=15,
        textColor=TEXT_MUTED, alignment=TA_LEFT, spaceAfter=10, leftIndent=0,
    )))
    out.append(hr())
    return out
