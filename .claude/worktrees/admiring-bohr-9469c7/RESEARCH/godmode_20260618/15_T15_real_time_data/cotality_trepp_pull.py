"""
cotality_trepp_pull.py — Quarterly press release pull (Cotality + Trepp + KBRA)

Replaces paid Cotality subscriptions + Trepp wire + KBRA Premium for headline-level data.

Approach:
- Scrape the public newsroom pages (no auth required)
- Parse the press release titles + dates
- Persist a tidy CSV + JSON ledger of quarterly releases

Sources:
- Cotality: https://www.cotality.com/newsroom
- Trepp: https://www.trepp.com/research-and-insights (TreppTalk blog index)
- KBRA: https://www.kbra.com/search/publications

Cadence:
- Cotality Q2 2026 release expected August 2026 (mortgage fraud index)
- Trepp monthly CMBS + weekly TreppTalk
- KBRA weekly Auto Loan ABS Indices, monthly Non-QM / RMBS / CMBS

Usage:
    python cotality_trepp_pull.py
"""

import csv
import json
import datetime as dt
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
}


def pull_cotality_newsroom(output_path: str = "cotality_press_releases.csv") -> list:
    """
    Pull the first ~10 press releases from Cotality newsroom (first page only).
    Pagination URL: https://www.cotality.com/newsroom?{pagination_token}_page=N
    """
    url = "https://www.cotality.com/newsroom"
    out = []
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        for a in soup.select("a[href*='/press-releases/']"):
            title = a.get_text(strip=True)
            href = a.get("href", "")
            if not title or "press-releases" not in href:
                continue
            full_url = urljoin(url, href)
            out.append({
                "source": "Cotality",
                "title": title,
                "url": full_url,
                "scraped_at": dt.datetime.utcnow().isoformat() + "Z",
            })
    except Exception as e:
        out.append({"source": "Cotality", "error": str(e), "scraped_at": dt.datetime.utcnow().isoformat() + "Z"})

    # Dedupe on URL
    seen = set()
    deduped = []
    for item in out:
        if item.get("url") in seen:
            continue
        seen.add(item.get("url"))
        deduped.append(item)

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["source", "title", "url", "scraped_at"])
        w.writeheader()
        for row in deduped:
            w.writerow(row)
    print(f"[Cotality] Wrote {len(deduped)} rows to {output_path}")
    return deduped


def pull_trepp_treppTalk(output_path: str = "trepp_treppTalk.csv") -> list:
    """
    Pull Trepp's TreppTalk blog index (https://www.trepp.com/trepptalk).
    Latest Insights + pagination via "Load More".
    """
    url = "https://www.trepp.com/trepptalk"
    out = []
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        for a in soup.select("a[href*='/trepptalk/']"):
            title = a.get_text(strip=True)
            href = a.get("href", "")
            if not title or "/trepptalk/" not in href or "/topic/" in href or href.endswith("/trepptalk"):
                continue
            full_url = urljoin(url, href)
            out.append({
                "source": "Trepp (TreppTalk)",
                "title": title,
                "url": full_url,
                "scraped_at": dt.datetime.utcnow().isoformat() + "Z",
            })
    except Exception as e:
        out.append({"source": "Trepp (TreppTalk)", "error": str(e), "scraped_at": dt.datetime.utcnow().isoformat() + "Z"})

    seen = set()
    deduped = []
    for item in out:
        if item.get("url") in seen:
            continue
        seen.add(item.get("url"))
        deduped.append(item)

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["source", "title", "url", "scraped_at"])
        w.writeheader()
        for row in deduped:
            w.writerow(row)
    print(f"[Trepp] Wrote {len(deduped)} rows to {output_path}")
    return deduped


def pull_kbra_publications(output_path: str = "kbra_publications.csv") -> list:
    """
    Pull KBRA's public publications list (https://www.kbra.com/).
    Note: full text requires KBRA Premium subscription; titles + URLs are free.
    """
    url = "https://www.kbra.com/"
    out = []
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        for a in soup.select("a[href*='/publications/']"):
            title = a.get_text(strip=True)
            href = a.get("href", "")
            if not title or "/publications/" not in href or "/publications?" in href:
                continue
            full_url = urljoin(url, href)
            out.append({
                "source": "KBRA",
                "title": title,
                "url": full_url,
                "scraped_at": dt.datetime.utcnow().isoformat() + "Z",
            })
    except Exception as e:
        out.append({"source": "KBRA", "error": str(e), "scraped_at": dt.datetime.utcnow().isoformat() + "Z"})

    seen = set()
    deduped = []
    for item in out:
        if item.get("url") in seen:
            continue
        seen.add(item.get("url"))
        deduped.append(item)

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["source", "title", "url", "scraped_at"])
        w.writeheader()
        for row in deduped:
            w.writerow(row)
    print(f"[KBRA] Wrote {len(deduped)} rows to {output_path}")
    return deduped


def pull_all(output_dir: str = ".") -> dict:
    """Run all three pulls and write combined ledger."""
    cotality = pull_cotality_newsroom(f"{output_dir}/cotality_press_releases.csv")
    trepp = pull_trepp_treppTalk(f"{output_dir}/trepp_treppTalk.csv")
    kbra = pull_kbra_publications(f"{output_dir}/kbra_publications.csv")

    combined = {
        "pulled_at": dt.datetime.utcnow().isoformat() + "Z",
        "cotality_count": len(cotality),
        "trepp_count": len(trepp),
        "kbra_count": len(kbra),
        "cotality": cotality,
        "trepp": trepp,
        "kbra": kbra,
    }
    with open(f"{output_dir}/combined_press_release_ledger.json", "w", encoding="utf-8") as f:
        json.dump(combined, f, indent=2)
    print(f"\nWrote combined ledger to {output_dir}/combined_press_release_ledger.json")
    return combined


if __name__ == "__main__":
    pull_all(output_dir=".")