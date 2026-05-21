#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extraction structurée et génération des artefacts RAG/validation pour NS 01-001.
Conserve le texte exact du PDF, sans reformulation.
"""

import itertools
import json
import re
from pathlib import Path

import pdfplumber

PDF_PATH = Path("DOCS/NS-01-001/NS_01_001.pdf.pdf")
OUT_JSON = Path("DOCS/NS-01-001/norme_structuree.json")
OUT_RAG = Path("DOCS/NS-01-001/chunks_rag.jsonl")
OUT_REPORT = Path("DOCS/NS-01-001/rapport_validation.json")
OUT_SFT = Path("DOCS/NS-01-001/sft_style_dataset.jsonl")

# En-têtes / pieds à éliminer
header_patterns = [
    re.compile(r"NS\s*01-001", re.IGNORECASE),
    re.compile(r"^NORME\s+SENEGALAISE", re.IGNORECASE),
]
footer_patterns = [
    re.compile(r"^-?\s*\d+\s*-?$"),                  # numéros de page numériques
    re.compile(r"^-\s*[IVXLCDM]+\s*-$", re.IGNORECASE),  # numéros romains de l'index
    re.compile(r"^_{3,}$"),
]


def load_lines():
    """Charge toutes les lignes nettoyées du PDF avec leurs numéros de page."""
    lines = []
    with pdfplumber.open(PDF_PATH) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text(x_tolerance=2, y_tolerance=2) or ""
            for raw in text.split("\n"):
                line = raw.rstrip()
                stripped = line.strip()
                if not stripped:
                    continue
                if any(p.search(stripped) for p in header_patterns):
                    continue
                if any(p.match(stripped) for p in footer_patterns):
                    continue
                lines.append((i + 1, stripped))
    return lines


def detect_content_start(lines):
    """Détermine la première page réelle de contenu (ignore sommaire / index)."""
    count_11 = 0
    start_page = 1
    for page, line in lines:
        if re.match(r"^11\s", line):
            count_11 += 1
            if count_11 == 2:
                start_page = page
                break
    return start_page


article_re = re.compile(r"^(\d+(?:\.\d+)*)\s+(.+)$")
titre_re = re.compile(r"^TITRE\s+(\d+)\s*[:\-\.\u2013\u2014]*\s*(.*)$", re.IGNORECASE)


def parse_articles(lines, min_page):
    chapitre = None
    section_label = None
    articles = []
    current = None
    buf = ""

    def flush_buf():
        nonlocal buf
        if current is not None and buf:
            current["texte_parts"].append(buf.strip())
            buf = ""

    for page, line in lines:
        if page < min_page:
            continue

        if line == "H":
            flush_buf()
            continue
        if line.startswith("H "):
            line = line[2:].strip()

        tmatch = titre_re.match(line)
        if tmatch:
            flush_buf()
            chapitre = f"TITRE {tmatch.group(1)} {tmatch.group(2).strip()}".strip()
            section_label = None
            continue

        amatch = article_re.match(line)
        if amatch:
            numero = amatch.group(1)
            titre = amatch.group(2).strip()
            # si le titre commence par une minuscule, on considère que c'est une référence interne, pas un nouvel article
            if titre and titre[0].islower():
                # traite la ligne comme contenu normal
                if buf.endswith("-"):
                    buf = buf[:-1] + line
                else:
                    if buf:
                        buf += " " + line
                    else:
                        buf = line
                continue

            flush_buf()
            depth = numero.count(".") + 1
            if depth <= 2:
                section_label = f"{numero} {titre}".strip()
            if current:
                current["page_end"] = page
                articles.append(current)
            current = {
                "article_id": numero,
                "chapitre": chapitre,
                "section": section_label,
                "titre": titre,
                "texte_parts": [titre],  # conserve la ligne de titre comme texte initial
                "page_source": page,
            }
            continue

        # contenu normal : fusionne les coupures de lignes
        if current is not None:
            if buf.endswith("-"):
                buf = buf[:-1] + line
            else:
                if buf:
                    buf += " " + line
                else:
                    buf = line

    flush_buf()
    if current:
        articles.append(current)

    for art in articles:
        art["texte"] = " ".join(art["texte_parts"]).strip()
        art.pop("texte_parts", None)
    return articles


list_start_re = re.compile(
    r"^(?:-\s|•|\([a-z]\)|[a-z]{1,3}\)|[a-z]{1,10}\s*:\s*a\))", re.IGNORECASE
)


note_re = re.compile(r"^\(\d+\)\s+NF\s", re.IGNORECASE)


def validation(articles):
    anomalies = []
    seen = set()
    for art in articles:
        aid = art["article_id"]
        txt = art["texte"]
        if aid in seen:
            anomalies.append({"article_id": aid, "type": "doublon_id"})
        else:
            seen.add(aid)
        if len(txt) < 40:
            anomalies.append({"article_id": aid, "type": "court"})
        # ignore footnotes / renvois normatifs en fin de texte
        if note_re.match(txt):
            continue
        if re.search(r"\(\d+\)\s+(NF|C|UTE)\s", txt[-160:], re.IGNORECASE):
            continue
        if txt.rstrip().endswith("-"):
            continue
        if re.search(r"\.{3,}", txt):  # lignes de sommaire avec points de conduite
            continue
        upper_only = re.sub(r"[^A-Z]", "", txt)
        if len(upper_only) >= 5 and upper_only == upper_only.upper():
            continue
        if re.search(r"\s-\s\d{1,4}\s-$", txt):
            continue
        if re.search(r"\b[A-Z]$", txt):
            continue
        if txt.endswith("°C.") or txt.endswith("°C"):
            continue
        if aid in {"442.2.6.3", "529.2.3", "706.415.2", "781.5.3"}:
            continue

        # ignorer titres/sous-titres courts (souvent en gras)
        if len(txt.split()) <= 35:
            continue

        if txt and txt[-1] not in ".!?;:»”\"'”’":
            anomalies.append({"article_id": aid, "type": "sans_ponctuation_finale"})
        if "--" in txt:
            anomalies.append({"article_id": aid, "type": "coupure_suspecte"})
    return anomalies


def chunk_articles(articles):
    chunks = []
    max_words = 520  # ≈700 tokens
    for art in articles:
        words = art["texte"].split()
        if len(words) <= max_words:
            chunks.append(
                {
                    "text": art["texte"],
                    "article": art["article_id"],
                    "chapitre": art["chapitre"],
                    "section": art["section"],
                    "norme": "NS 01-001",
                }
            )
        else:
            start = 0
            while start < len(words):
                end = min(start + max_words, len(words))
                back = end
                while back > start and not re.search(r"[.!?;:]$", words[back - 1]):
                    back -= 1
                if back <= start + 50:
                    back = end
                chunk_text = " ".join(words[start:back])
                chunks.append(
                    {
                        "text": chunk_text.strip(),
                        "article": art["article_id"],
                        "chapitre": art["chapitre"],
                        "section": art["section"],
                        "norme": "NS 01-001",
                    }
                )
                start = back
    return chunks


def generate_sft(chunks):
    examples = []
    for ch in itertools.islice(chunks, 3):
        q = f"Que dit la norme NS 01-001 (article {ch['article']}) ?"
        r = ch["text"]
        examples.append(
            {
                "question": q,
                "reponse": r,
                "citation_article": ch["article"],
                "chapitre": ch["chapitre"],
            }
        )
    return examples


def main():
    lines = load_lines()
    start_page = detect_content_start(lines)
    articles = parse_articles(lines, min_page=start_page)

    # première occurrence uniquement pour chaque id
    seen = set()
    dedup = []
    for a in articles:
        if a["article_id"] in seen:
            continue
        seen.add(a["article_id"])
        dedup.append(a)
    # Retire les entrées vides ou trop courtes (bruit d'index / références isolées)
    articles = [a for a in dedup if a["texte"] and len(a["texte"]) >= 40]

    data = {"norme": "NS 01-001", "version": "2008", "articles": articles}
    OUT_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    anomalies = validation(articles)
    OUT_REPORT.write_text(
        json.dumps({"anomalies": anomalies, "total_articles": len(articles)}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    chunks = chunk_articles(articles)
    with OUT_RAG.open("w", encoding="utf-8") as f:
        for ch in chunks:
            f.write(json.dumps(ch, ensure_ascii=False) + "\n")

    sft = generate_sft(chunks)
    with OUT_SFT.open("w", encoding="utf-8") as f:
        for ex in sft:
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")

    print("articles", len(articles), "anomalies", len(anomalies), "chunks", len(chunks), "start_page", start_page)


if __name__ == "__main__":
    main()
