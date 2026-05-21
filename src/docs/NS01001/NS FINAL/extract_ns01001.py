#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extraction et structuration de la norme NS 01-001 a partir du fichier Markdown.
Genere un JSON atomise (sections + index).
"""

import json
import re
from pathlib import Path
from datetime import date

SOURCE_MD = Path(r"C:\Mes Sites Web\NF C18 YALM\scispace\NS-01-001\NS 01 001.md")
OUTPUT_JSON = Path(r"C:\Mes Sites Web\NF C18 YALM\scispace\NS-01-001\ns_01_001_atomise.json")


def extract_sections(lines):
    title_re = re.compile(r"^TITRE\s+(\d+)\s*:?\s*(.*)$", re.IGNORECASE)
    chapter_re = re.compile(r"^CHAPITRE\s+(\d+)\s*:?\s*(.*)$", re.IGNORECASE)
    section_re = re.compile(r"^(\d+(?:\.\d+)+)\s+(.+)$")
    annexe_re = re.compile(r"^ANNEXE\s+([A-Z0-9]+)\s*:?\s*(.*)$", re.IGNORECASE)

    sections = []
    current = None

    def flush():
        if current:
            current["contenu"] = "\n".join(current["contenu"]).strip()
            sections.append(current)

    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            if current:
                current["contenu"].append("")
            continue

        title_match = title_re.match(line_clean)
        chapter_match = chapter_re.match(line_clean)
        section_match = section_re.match(line_clean)
        annexe_match = annexe_re.match(line_clean)

        if annexe_match:
            flush()
            numero = annexe_match.group(1)
            titre = annexe_match.group(2).strip() if annexe_match.group(2) else ""
            current = {
                "id": f"annexe_{numero}",
                "numero": numero,
                "titre": f"ANNEXE {numero} {titre}".strip(),
                "niveau": 1,
                "type": "annexe",
                "contenu": []
            }
            continue

        if title_match:
            flush()
            numero = title_match.group(1)
            titre = title_match.group(2).strip() if title_match.group(2) else ""
            current = {
                "id": f"titre_{numero}",
                "numero": numero,
                "titre": f"TITRE {numero} {titre}".strip(),
                "niveau": 1,
                "type": "titre",
                "contenu": []
            }
            continue

        if chapter_match:
            flush()
            numero = chapter_match.group(1)
            titre = chapter_match.group(2).strip() if chapter_match.group(2) else ""
            current = {
                "id": f"chapitre_{numero}",
                "numero": numero,
                "titre": f"CHAPITRE {numero} {titre}".strip(),
                "niveau": 2,
                "type": "chapitre",
                "contenu": []
            }
            continue

        if section_match:
            flush()
            numero = section_match.group(1)
            titre = section_match.group(2).strip()
            niveau = len(numero.split("."))
            current = {
                "id": f"sec_{numero.replace('.', '_')}",
                "numero": numero,
                "titre": titre,
                "niveau": niveau,
                "type": "section",
                "contenu": []
            }
            continue

        if current:
            current["contenu"].append(line_clean)

    flush()
    return sections


def build_index(sections):
    index = []
    for sec in sections:
        index.append({
            "id": sec.get("id"),
            "numero": sec.get("numero"),
            "titre": sec.get("titre"),
            "type": sec.get("type"),
            "niveau": sec.get("niveau")
        })
    return index


def main():
    if not SOURCE_MD.exists():
        raise FileNotFoundError(SOURCE_MD)

    lines = SOURCE_MD.read_text(encoding="utf-8").splitlines()
    sections = extract_sections(lines)

    data = {
        "metadata": {
            "norme": "NS 01-001",
            "titre": "Regles des installations electriques a basse tension",
            "version": "2008",
            "date_extraction": date.today().isoformat(),
            "fichier_source": SOURCE_MD.name,
            "sections_total": len(sections)
        },
        "sections": sections,
        "index_recherche": build_index(sections)
    }

    OUTPUT_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print("OK")


if __name__ == "__main__":
    main()
