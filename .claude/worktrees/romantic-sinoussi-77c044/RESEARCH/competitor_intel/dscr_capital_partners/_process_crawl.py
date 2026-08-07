#!/usr/bin/env python3
"""
Process DSCR Capital Partners crawl JSON into structured deliverables.
Input: _full_crawl.json
Outputs:
  - INDEX.md (URL index grouped by section)
  - RAW.md (every page concatenated, for grep)
  - SUMMARY.md (structured extraction of programs, rates, contacts, etc.)
  - pages/<slug>.md (one file per page, easy to read)
"""
import json
import re
from pathlib import Path
from collections import defaultdict, Counter

ROOT = Path(r"C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\research\competitor_intel\dscr_capital_partners")
SRC = ROOT / "_full_crawl.json"
INDEX_MD = ROOT / "INDEX.md"
RAW_MD = ROOT / "RAW.md"
SUMMARY_MD = ROOT / "SUMMARY.md"
PAGES_DIR = ROOT / "pages"
PAGES_DIR.mkdir(exist_ok=True)


def load_data():
    raw = json.loads(SRC.read_text(encoding="utf-8"))
    return raw["data"]


def slugify(url: str) -> str:
    s = re.sub(r"^https?://[^/]+", "", url)
    s = s.strip("/") or "root"
    s = re.sub(r"[^a-zA-Z0-9._-]+", "_", s)
    return s[:200] or "page"


def categorize(url: str) -> str:
    path = re.sub(r"^https?://[^/]+", "", url).strip("/")
    if not path:
        return "00_homepage"
    # Top-level section
    parts = path.split("/")
    section = parts[0].lower()
    # Drop query/fragment noise for grouping
    # Map common DSCR lender sections
    mapping = {
        "loan-programs": "loan_programs",
        "loan-program": "loan_programs",
        "programs": "loan_programs",
        "products": "products",
        "about": "about",
        "about-us": "about",
        "team": "team",
        "contact": "contact",
        "apply": "apply",
        "get-started": "apply",
        "resources": "resources",
        "blog": "blog",
        "news": "blog",
        "insights": "resources",
        "faq": "faq",
        "faqs": "faq",
        "calculator": "tools",
        "tools": "tools",
        "rates": "rates",
        "states": "geo",
        "service-areas": "geo",
        "areas": "geo",
        "testimonials": "social_proof",
        "reviews": "social_proof",
        "case-studies": "social_proof",
        "partners": "partners",
        "lenders": "partners",
        "privacy-policy": "legal",
        "terms": "legal",
        "disclosures": "legal",
        "licensing": "legal",
        "sitemap.xml": "system",
        "robots.txt": "system",
    }
    if section in mapping:
        return mapping[section]
    if section.endswith(".xml") or section.endswith(".txt"):
        return "system"
    return f"other_{section}"


def detect_title(md: str, url: str) -> str:
    # First H1 or H2
    m = re.search(r"^#{1,2}\s+(.+?)$", md, re.M)
    if m:
        return m.group(1).strip()[:200]
    # First non-empty line that looks like a title
    for line in md.splitlines()[:30]:
        line = line.strip()
        if line and len(line) < 200 and not line.startswith("!") and not line.startswith("["):
            return line[:200]
    return url


def main():
    data = load_data()
    # Filter out XML/TXT (sitemap.xml, robots.txt etc.) — we still index them but no per-page md
    pages = []
    for p in data:
        url = p.get("metadata", {}).get("sourceURL") or p.get("url") or ""
        md = p.get("markdown") or ""
        ct = (p.get("metadata", {}).get("contentType") or "").lower()
        pages.append({
            "url": url,
            "markdown": md,
            "contentType": ct,
            "title": detect_title(md, url),
            "section": categorize(url),
            "statusCode": p.get("metadata", {}).get("statusCode"),
            "scrapedAt": p.get("metadata", {}).get("cachedAt"),
        })

    # ---- INDEX.md ----
    by_section = defaultdict(list)
    for p in pages:
        by_section[p["section"]].append(p)

    lines = []
    lines.append("# DSCR Capital Partners — URL Index\n")
    lines.append(f"**Source:** https://dscrcapitalpartners.com/  ")
    lines.append(f"**Crawled:** 178 pages  ")
    lines.append(f"**Sections:** {len(by_section)}  ")
    lines.append(f"**Credit usage:** 178/1000 (June 19 - July 19 billing period)\n")
    lines.append("---\n")

    for section in sorted(by_section.keys()):
        section_pages = sorted(by_section[section], key=lambda x: x["url"])
        lines.append(f"\n## {section} ({len(section_pages)} pages)\n")
        for p in section_pages:
            ct = f" `{p['contentType']}`" if p["contentType"] else ""
            sc = f" *HTTP {p['statusCode']}*" if p["statusCode"] and p["statusCode"] != 200 else ""
            lines.append(f"- [{p['title']}](pages/{slugify(p['url'])}.md) — `{p['url']}`{ct}{sc}")
    INDEX_MD.write_text("\n".join(lines), encoding="utf-8")

    # ---- RAW.md (for grep) ----
    raw_lines = ["# DSCR Capital Partners — Full Content Dump (grep-able)\n"]
    for p in sorted(pages, key=lambda x: x["url"]):
        if not p["markdown"]:
            continue
        raw_lines.append(f"\n\n---\n# {p['title']}\nURL: {p['url']}\n---\n\n")
        raw_lines.append(p["markdown"])
    RAW_MD.write_text("\n".join(raw_lines), encoding="utf-8")

    # ---- per-page files ----
    for p in pages:
        if not p["markdown"]:
            continue
        slug = slugify(p["url"])
        out = PAGES_DIR / f"{slug}.md"
        header = f"# {p['title']}\n\n**URL:** {p['url']}  \n**Section:** {p['section']}  \n**Content-Type:** {p['contentType']}  \n**HTTP:** {p['statusCode']}  \n"
        if p["scrapedAt"]:
            header += f"**Cached at:** {p['scrapedAt']}  \n"
        header += "\n---\n\n"
        out.write_text(header + p["markdown"], encoding="utf-8")

    # ---- SUMMARY.md (structured extraction) ----
    full_text = "\n\n".join(p["markdown"] for p in pages if p["markdown"])
    summary = []
    summary.append("# DSCR Capital Partners — Structured Extraction\n")
    summary.append("**Source:** https://dscrcapitalpartners.com/  ")
    summary.append(f"**Crawled pages:** {len(pages)} ({sum(1 for p in pages if p['markdown'])} with markdown content)  ")
    summary.append(f"**Date:** 2026-06-22\n")
    summary.append("---\n")

    # Contact info — emails, phones, addresses
    summary.append("\n## Contact Information\n")
    emails = sorted(set(re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", full_text)))
    phones = sorted(set(re.findall(r"(?:\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", full_text)))
    summary.append("\n**Emails found:**\n")
    for e in emails:
        summary.append(f"- {e}")
    summary.append("\n**Phone numbers found:**\n")
    for ph in phones:
        summary.append(f"- {ph}")

    # NMLS / license mentions
    summary.append("\n**NMLS / License IDs:**\n")
    nmls = sorted(set(re.findall(r"NMLS[ #:]?(\s?ID)?\s?#?\s?(\d{4,8})", full_text, re.I)))
    for n in nmls:
        summary.append(f"- NMLS #{n[1]}")
    nmls_simple = sorted(set(re.findall(r"NMLS\s*#?\s*(\d{5,8})", full_text)))
    for n in nmls_simple:
        summary.append(f"- NMLS #{n}")
    corp_nmls = sorted(set(re.findall(r"(?:NMLS\s*(?:Corporate\s*)?(?:ID|#[#]?)?\s*[:#]?\s*)(\d{4,8})", full_text, re.I)))
    for n in corp_nmls:
        summary.append(f"- NMLS Corporate #{n}")

    # Rate mentions
    summary.append("\n## Rate / Pricing Mentions\n")
    rate_patterns = [
        r"\d+\.\d{2,3}\s*%\s*(?:APR|rate|fixed|interest)",
        r"(?:rates?|APR)\s*(?:as\s*low\s*as|of|from|start(?:ing)?\s*at)\s*\d+\.\d{1,3}\s*%",
        r"\d+\.\d{1,3}\s*%\s*-\s*\d+\.\d{1,3}\s*%",
    ]
    rate_hits = set()
    for pat in rate_patterns:
        for m in re.finditer(pat, full_text, re.I):
            ctx = full_text[max(0, m.start() - 80): m.end() + 80].replace("\n", " ")
            rate_hits.add(f"> ...{ctx}...")
    for h in sorted(rate_hits)[:80]:
        summary.append(h)
        summary.append("")

    # Loan program keywords
    summary.append("\n## Loan Program Keywords\n")
    program_terms = [
        "DSCR", "30-year fixed", "40-year fixed", "Interest Only", "IO",
        "No Ratio", "No Income", "No Employment", "Asset Depletion",
        "Bank Statement", "Foreign National", "Non-QM", "NonQM",
        "Fix and Flip", "Bridge", "Ground Up", "Construction",
        "Multi-Family", "Multifamily", "SFR", "Single Family Rental",
        "2-4 Unit", "Condo", "Townhome", "Airbnb", "Short-Term Rental", "STR",
        "Vacation Rental", "Cash-Out Refinance", "Rate and Term", "Purchase",
        "ITIN", "1099", "W-2", "Self-Employed",
    ]
    term_counts = Counter()
    for t in program_terms:
        term_counts[t] = len(re.findall(r"\b" + re.escape(t) + r"\b", full_text, re.I))
    for term, n in term_counts.most_common():
        if n > 0:
            summary.append(f"- **{term}**: {n} mentions")

    # LTV / FICO / DSCR ratio ranges
    summary.append("\n## Underwriting Constraints (numeric ranges)\n")
    ltv_hits = sorted(set(re.findall(r"(?:up\s*to\s*)?(\d{2,3})\s*%\s*LTV", full_text, re.I)))
    fico_hits = sorted(set(re.findall(r"(?:min(?:imum)?\.?\s*)?(?:FICO\s*)?(?:score\s*)?(\d{3})\s*(?:FICO|credit\s*score)?", full_text, re.I)))
    dscr_hits = sorted(set(re.findall(r"\b(\d+\.\d+)\s*(?:x\s*)?DSCR\b", full_text, re.I)))
    summary.append(f"- LTV mentions (max value candidates): {sorted(set(int(x) for x in ltv_hits if int(x) <= 100), reverse=True)[:15]}")
    summary.append(f"- FICO candidates (3-digit): {sorted(set(int(x) for x in fico_hits if 300 <= int(x) <= 850))[:25]}")
    summary.append(f"- DSCR ratio mentions: {dscr_hits}")

    # Geo coverage (state list scan)
    summary.append("\n## State / Geo Coverage\n")
    us_states = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
                 "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
                 "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi",
                 "Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
                 "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
                 "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
                 "Virginia","Washington","West Virginia","Wisconsin","Wyoming"]
    state_mentions = []
    for s in us_states:
        c = len(re.findall(r"\b" + s + r"\b", full_text))
        if c > 0:
            state_mentions.append((s, c))
    for s, c in sorted(state_mentions, key=lambda x: -x[1]):
        summary.append(f"- {s}: {c} mentions")

    # Top referenced internal URLs (link analysis)
    summary.append("\n## Most-Linked Internal Pages\n")
    link_counter = Counter()
    for p in pages:
        for m in re.finditer(r"\]\((https?://dscrcapitalpartners\.com/[^)]+)\)", p["markdown"]):
            link_counter[m.group(1).rstrip("/")] += 1
    for url, n in link_counter.most_common(30):
        summary.append(f"- {n}× {url}")

    # Top outbound non-self domains (partner / social / disclosures)
    summary.append("\n## Top Outbound Domains\n")
    out_counter = Counter()
    for p in pages:
        for m in re.finditer(r"\]\((https?://(?!dscrcapitalpartners\.com)([^/)]+)[^)]*)\)", p["markdown"]):
            out_counter[m.group(2)] += 1
    for dom, n in out_counter.most_common(40):
        summary.append(f"- {n}× {dom}")

    # All internal pages list (flat)
    summary.append("\n## All Pages (flat list, by URL)\n")
    for p in sorted(pages, key=lambda x: x["url"]):
        if p["markdown"]:
            md_len = len(p["markdown"])
            summary.append(f"- {p['url']} — {md_len:,} chars — {p['title'][:80]}")

    SUMMARY_MD.write_text("\n".join(summary), encoding="utf-8")

    # Print quick stats
    print(f"Pages processed: {len(pages)}")
    print(f"With markdown: {sum(1 for p in pages if p['markdown'])}")
    print(f"Sections: {len(by_section)}")
    for s in sorted(by_section.keys()):
        print(f"  {s}: {len(by_section[s])}")
    print(f"\nWrote: {INDEX_MD.name}, {RAW_MD.name}, {SUMMARY_MD.name}, pages/ ({sum(1 for p in pages if p['markdown'])} files)")


if __name__ == "__main__":
    main()
