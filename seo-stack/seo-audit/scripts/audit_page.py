#!/usr/bin/env python3
"""
Audit SEO d'une page HTML (URL ou fichier local).
Extrait les éléments clés et signale les problèmes courants.

Usage:
    python audit_page.py https://baobabloyalty.com
    python audit_page.py ./page.html
"""
import sys
import json
import re
from pathlib import Path
from urllib.parse import urlparse

try:
    from bs4 import BeautifulSoup
except ImportError:
    print("Installe d'abord BeautifulSoup: pip install beautifulsoup4 --break-system-packages", file=sys.stderr)
    sys.exit(1)


def fetch_html(source: str) -> tuple[str, str | None]:
    """Renvoie (html, url_de_base). url_de_base = None pour un fichier local."""
    if source.startswith(("http://", "https://")):
        try:
            import urllib.request
            req = urllib.request.Request(source, headers={"User-Agent": "Mozilla/5.0 (SEO-Audit)"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                return resp.read().decode("utf-8", errors="replace"), source
        except Exception as e:
            print(f"Erreur réseau: {e}", file=sys.stderr)
            sys.exit(1)
    path = Path(source)
    if not path.exists():
        print(f"Fichier introuvable: {source}", file=sys.stderr)
        sys.exit(1)
    return path.read_text(encoding="utf-8", errors="replace"), None


def audit(html: str, base_url: str | None = None) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    issues_critical = []
    issues_important = []
    issues_minor = []
    strengths = []

    # ----- HTML lang -----
    html_tag = soup.find("html")
    lang = html_tag.get("lang") if html_tag else None
    if not lang:
        issues_important.append("Attribut <html lang=...> manquant")
    elif not lang.startswith("fr"):
        issues_minor.append(f"Lang={lang!r} — vérifier si voulu (cible FR ?)")

    # ----- Title -----
    title_tag = soup.find("title")
    title = title_tag.get_text().strip() if title_tag else ""
    if not title:
        issues_critical.append("<title> manquant")
    elif len(title) < 30:
        issues_important.append(f"<title> trop court ({len(title)} car., cible 50-60)")
    elif len(title) > 65:
        issues_important.append(f"<title> trop long ({len(title)} car., risque de troncature)")
    else:
        strengths.append(f"<title> de longueur correcte ({len(title)} car.)")

    # ----- Meta description -----
    desc_tag = soup.find("meta", attrs={"name": re.compile("^description$", re.I)})
    desc = (desc_tag.get("content") or "").strip() if desc_tag else ""
    if not desc:
        issues_critical.append("<meta name=\"description\"> manquant")
    elif len(desc) < 120:
        issues_important.append(f"Description trop courte ({len(desc)} car., cible 140-160)")
    elif len(desc) > 170:
        issues_important.append(f"Description trop longue ({len(desc)} car.)")
    else:
        strengths.append(f"Meta description de longueur correcte ({len(desc)} car.)")

    # ----- Robots -----
    robots_tag = soup.find("meta", attrs={"name": re.compile("^robots$", re.I)})
    robots = (robots_tag.get("content") or "").lower() if robots_tag else ""
    if "noindex" in robots:
        issues_critical.append("Balise robots = noindex (page exclue de l'index Google)")

    # ----- Canonical -----
    canonical = soup.find("link", attrs={"rel": "canonical"})
    canonical_href = canonical.get("href") if canonical else None
    if not canonical_href:
        issues_important.append("<link rel=\"canonical\"> manquant")
    else:
        strengths.append(f"Canonical défini: {canonical_href}")

    # ----- Open Graph -----
    og_props = ["og:title", "og:description", "og:image", "og:url", "og:type"]
    missing_og = [p for p in og_props if not soup.find("meta", attrs={"property": p})]
    if missing_og:
        issues_important.append(f"Open Graph incomplets: {', '.join(missing_og)}")
    else:
        strengths.append("Open Graph complet (title, description, image, url, type)")

    # ----- Twitter Card -----
    if not soup.find("meta", attrs={"name": "twitter:card"}):
        issues_minor.append("twitter:card manquant (recommandé: summary_large_image)")

    # ----- Headings -----
    h1s = soup.find_all("h1")
    if len(h1s) == 0:
        issues_critical.append("Aucun <h1> sur la page")
    elif len(h1s) > 1:
        issues_important.append(f"{len(h1s)} <h1> trouvés — un seul recommandé")
    else:
        strengths.append(f"Un seul <h1>: \"{h1s[0].get_text().strip()[:80]}\"")

    h2s = soup.find_all("h2")
    if h1s and not h2s:
        issues_minor.append("Aucun <h2> — structure pauvre")

    # ----- Images sans alt -----
    imgs = soup.find_all("img")
    no_alt = [i for i in imgs if not i.has_attr("alt")]
    if no_alt:
        issues_important.append(f"{len(no_alt)}/{len(imgs)} images sans attribut alt")
    elif imgs:
        strengths.append(f"Toutes les images ({len(imgs)}) ont un alt")

    # ----- JSON-LD -----
    jsonld = soup.find_all("script", attrs={"type": "application/ld+json"})
    if not jsonld:
        issues_important.append("Aucune donnée structurée JSON-LD")
    else:
        types = []
        for s in jsonld:
            try:
                data = json.loads(s.string or "{}")
                if isinstance(data, dict) and "@type" in data:
                    types.append(data["@type"])
            except Exception:
                pass
        strengths.append(f"JSON-LD présent: {', '.join(types) if types else f'{len(jsonld)} bloc(s)'}")

    # ----- Hreflang -----
    hreflangs = soup.find_all("link", attrs={"rel": "alternate", "hreflang": True})
    if hreflangs:
        strengths.append(f"Hreflang configuré ({len(hreflangs)} langue(s))")

    # ----- Score indicatif -----
    score = 100
    score -= 25 * len(issues_critical)
    score -= 7 * len(issues_important)
    score -= 2 * len(issues_minor)
    score = max(0, min(100, score))
    if any("noindex" in c for c in issues_critical):
        score = min(score, 40)

    return {
        "url": base_url,
        "score": score,
        "title": title,
        "title_length": len(title),
        "description": desc,
        "description_length": len(desc),
        "lang": lang,
        "canonical": canonical_href,
        "h1_count": len(h1s),
        "h2_count": len(h2s),
        "img_total": len(imgs),
        "img_without_alt": len(no_alt),
        "jsonld_count": len(jsonld),
        "issues_critical": issues_critical,
        "issues_important": issues_important,
        "issues_minor": issues_minor,
        "strengths": strengths,
    }


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    html, url = fetch_html(sys.argv[1])
    result = audit(html, url)
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
