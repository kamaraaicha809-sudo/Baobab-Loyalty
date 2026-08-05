"""
Génère des PDFs professionnels depuis des fichiers Markdown.
Utilise reportlab (compatible Windows sans dépendances système).
"""

import re
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable,
    Table, TableStyle, PageBreak
)
from reportlab.platypus.flowables import Flowable

# Baobab Loyalty brand colors
GREEN_DARK = HexColor("#166534")
GREEN_MID = HexColor("#16a34a")
GREEN_LIGHT = HexColor("#f0fdf4")
SLATE_DARK = HexColor("#0f172a")
SLATE_MID = HexColor("#1e293b")
SLATE_LIGHT = HexColor("#475569")
BORDER_COLOR = HexColor("#e2e8f0")
YELLOW_BG = HexColor("#fefce8")
YELLOW_BORDER = HexColor("#ca8a04")
YELLOW_TEXT = HexColor("#713f12")
CODE_BG = HexColor("#f1f5f9")
ROW_ALT = HexColor("#f8fafc")
HEADER_BG = HexColor("#0f172a")


def make_styles():
    base = getSampleStyleSheet()

    styles = {
        "h1": ParagraphStyle(
            "H1",
            fontName="Helvetica-Bold",
            fontSize=18,
            textColor=white,
            spaceAfter=4,
            spaceBefore=0,
            leading=24,
        ),
        "h1_sub": ParagraphStyle(
            "H1Sub",
            fontName="Helvetica",
            fontSize=10,
            textColor=HexColor("#d1fae5"),
            spaceAfter=0,
            leading=14,
        ),
        "h2": ParagraphStyle(
            "H2",
            fontName="Helvetica-Bold",
            fontSize=13,
            textColor=SLATE_DARK,
            spaceBefore=14,
            spaceAfter=6,
            leading=18,
            backColor=GREEN_LIGHT,
            leftIndent=10,
            borderPad=6,
        ),
        "h3": ParagraphStyle(
            "H3",
            fontName="Helvetica-Bold",
            fontSize=11,
            textColor=GREEN_DARK,
            spaceBefore=10,
            spaceAfter=4,
            leading=15,
        ),
        "body": ParagraphStyle(
            "Body",
            fontName="Helvetica",
            fontSize=10,
            textColor=SLATE_MID,
            spaceAfter=5,
            leading=16,
        ),
        "bold": ParagraphStyle(
            "Bold",
            fontName="Helvetica-Bold",
            fontSize=10,
            textColor=SLATE_DARK,
            spaceAfter=5,
            leading=16,
        ),
        "li": ParagraphStyle(
            "Li",
            fontName="Helvetica",
            fontSize=10,
            textColor=SLATE_MID,
            spaceAfter=3,
            leading=15,
            leftIndent=16,
            bulletIndent=6,
        ),
        "li_num": ParagraphStyle(
            "LiNum",
            fontName="Helvetica",
            fontSize=10,
            textColor=SLATE_MID,
            spaceAfter=3,
            leading=15,
            leftIndent=16,
        ),
        "code": ParagraphStyle(
            "Code",
            fontName="Courier",
            fontSize=9,
            textColor=SLATE_DARK,
            backColor=CODE_BG,
            spaceAfter=8,
            spaceBefore=4,
            leading=14,
            leftIndent=8,
            rightIndent=8,
            borderPad=6,
        ),
        "quote": ParagraphStyle(
            "Quote",
            fontName="Helvetica-Oblique",
            fontSize=10,
            textColor=YELLOW_TEXT,
            backColor=YELLOW_BG,
            leftIndent=12,
            spaceAfter=8,
            leading=15,
            borderPad=6,
        ),
        "footer": ParagraphStyle(
            "Footer",
            fontName="Helvetica",
            fontSize=8,
            textColor=HexColor("#94a3b8"),
            alignment=TA_CENTER,
        ),
    }
    return styles


class HeaderBanner(Flowable):
    def __init__(self, title, subtitle, width):
        Flowable.__init__(self)
        self.title = title
        self.subtitle = subtitle
        self.banner_width = width
        self.height = 70

    def draw(self):
        c = self.canv
        w = self.banner_width
        h = self.height

        # Gradient-like background (two rectangles)
        c.setFillColor(GREEN_DARK)
        c.roundRect(0, 0, w, h, 8, fill=1, stroke=0)

        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(w / 2, h - 28, self.title)

        c.setFillColor(HexColor("#d1fae5"))
        c.setFont("Helvetica", 10)
        c.drawCentredString(w / 2, h - 46, self.subtitle)


class SideBarH2(Flowable):
    def __init__(self, text, width):
        Flowable.__init__(self)
        self.text = text
        self.bar_width = width
        self.height = 28

    def draw(self):
        c = self.canv
        w = self.bar_width

        c.setFillColor(GREEN_LIGHT)
        c.roundRect(0, 0, w, self.height, 4, fill=1, stroke=0)

        c.setFillColor(GREEN_MID)
        c.rect(0, 0, 4, self.height, fill=1, stroke=0)

        c.setFillColor(SLATE_DARK)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(14, 9, self.text)


def inline_format(text):
    """Convert markdown inline syntax to reportlab markup."""
    # Bold **text** or __text__
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'__(.+?)__', r'<b>\1</b>', text)
    # Italic *text* or _text_ (not inside bold)
    text = re.sub(r'(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)', r'<i>\1</i>', text)
    text = re.sub(r'(?<!_)_(?!_)(.+?)(?<!_)_(?!_)', r'<i>\1</i>', text)
    # Code `text`
    text = re.sub(r'`([^`]+)`', r'<font face="Courier" size="9">\1</font>', text)
    return text


def add_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(HexColor("#94a3b8"))
    page_text = f"Baobab Loyalty — Guide WhatsApp Business  |  Page {doc.page}"
    canvas.drawCentredString(A4[0] / 2, 1.2 * cm, page_text)
    canvas.restoreState()


def md_to_story(md_text, styles, content_width):
    lines = md_text.split("\n")
    story = []
    i = 0

    # Skip first H1 (rendered in banner)
    while i < len(lines) and not lines[i].startswith("# "):
        i += 1
    if i < len(lines):
        i += 1  # skip it

    ol_counter = 0

    while i < len(lines):
        line = lines[i]

        # H2
        if line.startswith("## "):
            text = line[3:].strip()
            story.append(Spacer(1, 6))
            story.append(SideBarH2(text, content_width))
            story.append(Spacer(1, 6))
            ol_counter = 0
            i += 1
            continue

        # H3
        if line.startswith("### "):
            text = inline_format(line[4:].strip())
            story.append(Paragraph(text, styles["h3"]))
            ol_counter = 0
            i += 1
            continue

        # HR
        if line.strip() in ("---", "***", "___"):
            story.append(Spacer(1, 4))
            story.append(HRFlowable(width="100%", thickness=1, color=BORDER_COLOR))
            story.append(Spacer(1, 4))
            i += 1
            continue

        # Fenced code block
        if line.startswith("```"):
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].startswith("```"):
                code_lines.append(lines[i])
                i += 1
            i += 1  # skip closing ```
            code_text = "\n".join(code_lines)
            # Escape XML
            code_text = code_text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            code_text = code_text.replace("\n", "<br/>")
            story.append(Paragraph(code_text, styles["code"]))
            continue

        # Blockquote
        if line.startswith("> "):
            text = inline_format(line[2:].strip())
            story.append(Paragraph(text, styles["quote"]))
            i += 1
            continue

        # Unordered list
        if re.match(r'^[-*+] ', line):
            text = inline_format(line[2:].strip())
            story.append(Paragraph(f"• &nbsp; {text}", styles["li"]))
            ol_counter = 0
            i += 1
            continue

        # Ordered list
        m = re.match(r'^(\d+)\. (.+)', line)
        if m:
            ol_counter += 1
            text = inline_format(m.group(2).strip())
            story.append(Paragraph(f"{ol_counter}. &nbsp; {text}", styles["li_num"]))
            i += 1
            continue

        # Table
        if "|" in line and i + 1 < len(lines) and re.match(r'^\|[-| :]+\|', lines[i + 1]):
            rows = []
            while i < len(lines) and "|" in lines[i]:
                if re.match(r'^\|[-| :]+\|', lines[i]):
                    i += 1
                    continue
                cells = [c.strip() for c in lines[i].strip("|").split("|")]
                rows.append(cells)
                i += 1

            if rows:
                col_count = len(rows[0])
                col_width = content_width / col_count

                table_data = []
                for r_idx, row in enumerate(rows):
                    if r_idx == 0:
                        table_data.append([
                            Paragraph(f"<b>{inline_format(c)}</b>", ParagraphStyle(
                                "TH", fontName="Helvetica-Bold", fontSize=9,
                                textColor=white, leading=13
                            )) for c in row
                        ])
                    else:
                        table_data.append([
                            Paragraph(inline_format(c), ParagraphStyle(
                                "TD", fontName="Helvetica", fontSize=9,
                                textColor=SLATE_MID, leading=13
                            )) for c in row
                        ])

                style = TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), HEADER_BG),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, ROW_ALT]),
                    ("GRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ])

                t = Table(table_data, colWidths=[col_width] * col_count)
                t.setStyle(style)
                story.append(t)
                story.append(Spacer(1, 8))
            continue

        # Empty line
        if not line.strip():
            story.append(Spacer(1, 4))
            ol_counter = 0
            i += 1
            continue

        # Normal paragraph
        text = inline_format(line.strip())
        if text:
            story.append(Paragraph(text, styles["body"]))
        i += 1

    return story


def generate_pdf(md_path, pdf_path, title, subtitle):
    with open(md_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2.5 * cm,
    )

    content_width = A4[0] - 4 * cm
    styles = make_styles()

    story = []
    story.append(HeaderBanner(title, subtitle, content_width))
    story.append(Spacer(1, 16))
    story.extend(md_to_story(md_text, styles, content_width))

    doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
    print(f"PDF créé : {pdf_path}")


DOCS = [
    {
        "input": "docs/guide-whatsapp-business-hoteliers.md",
        "output": "docs/Guide_WhatsApp_Business_Hoteliers.pdf",
        "title": "Guide WhatsApp Business API",
        "subtitle": "Pour les Hôteliers Baobab Loyalty",
    }
]

base_dir = os.path.dirname(os.path.abspath(__file__))

for doc in DOCS:
    generate_pdf(
        os.path.join(base_dir, doc["input"]),
        os.path.join(base_dir, doc["output"]),
        doc["title"],
        doc["subtitle"],
    )

print("Terminé.")
