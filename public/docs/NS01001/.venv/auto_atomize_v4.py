import pdfplumber
import re
import json
import os
from statistics import mean

PDF_PATH = "NS_01_001.pdf.pdf"
OUT = "NS01001"
os.makedirs(OUT, exist_ok=True)

# Mapping des titres
titles = {
    1: "Titre 1 - Domaine d’application, objet et principes fondamentaux",
    2: "Titre 2 - Définitions",
    3: "Titre 3 - Détermination des caracteristiques générales des installations",
    4: "Titre 4 - Protection pour assurer la sécurité",
    5: "Titre 5 - Choix et mise en œuvre des matériels",
    6: "Titre 6 - Vérifications et entretien des installations",
    7: "Titre 7 - Règles pour les installations et emplacements spécifiques"
}

# ------------------ OUTILS ------------------

def clean_text(t):
    t = re.sub(r"\(cid:\d+\)", "", t)
    t = re.sub(r"(\w)-\s+(\w)", r"\1\2", t)   # mots coupés
    t = re.sub(r"\s+", " ", t)
    return t.strip()

def gen_id(article, alinea):
    a = article.replace(".", "-") if article else "X"
    al = alinea.replace(".", "-") if alinea else "0"
    return f"NS01-001-{a}-{al}-A"

def rule_type(txt):
    txt_l = txt.lower()
    if "interdit" in txt_l:
        return "interdiction"
    if "doit" in txt_l or "doivent" in txt_l:
        return "obligation"
    if "recommand" in txt_l:
        return "recommandation"
    if "peut" in txt_l:
        return "option"
    return "information"

def extract_exceptions(txt):
    kws = ["sauf", "exception", "ne s’applique pas", "à l’exception"]
    return [k for k in kws if k in txt.lower()]

def extract_values(txt):
    vals = []
    patterns = {
        "tension": r"(\d+)\s*V",
        "courant": r"(\d+)\s*mA",
        "section": r"(\d+(?:,\d+)?)\s*mm²",
        "resistance": r"(\d+(?:,\d+)?)\s*Ω"
    }
    for k, p in patterns.items():
        for m in re.findall(p, txt):
            vals.append({"type": k, "valeur": m})
    return vals

def gravity(txt):
    if any(k in txt.lower() for k in ["choc", "électrocution", "mort"]):
        return "critique"
    if "incendie" in txt.lower():
        return "majeure"
    return "mineure"

# ------------------ EXTRACTION PDF ------------------

lines = []

with pdfplumber.open(PDF_PATH) as pdf:
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        if not text:
            continue
        for l in text.split("\n"):
            cl = clean_text(l)
            if cl:
                lines.append((cl, i+1))

# ------------------ PARSING ------------------

rules = []
buf = []
cur_title = ""
cur_chap = ""
cur_art = ""
cur_ali = ""
cur_page = None

def flush():
    global buf
    if not buf or not cur_art:
        buf = []
        return

    txt = " ".join(buf)
    rtype = rule_type(txt)
    exc = extract_exceptions(txt)
    vals = extract_values(txt)
    grav = gravity(txt)

    confidence = mean([
        1.0 if len(txt) > 40 else 0.6,
        1.0 if vals else 0.7,
        1.0 if rtype != "information" else 0.6
    ])

    rule = {
        "norme": "NS 01-001",
        "version": "2009",
        "titre": cur_title,
        "chapitre": cur_chap,
        "article": cur_art,
        "alinea": cur_ali,
        "page_pdf": cur_page,
        "regle_atomique": {
            "id_unique": gen_id(cur_art, cur_ali),
            "type": rtype,
            "texte_normatif": txt,
            "exceptions": exc,
            "valeurs_normatives": vals,
            "gravite_non_conformite": grav,
            "confidence_score": round(confidence, 2),
            "liens_normatifs": re.findall(r"\b\d{3}(?:\.\d+)+\b", txt)
        }
    }
    rules.append(rule)
    buf = []

for (line, page) in lines:

    if re.match(r"TITRE\s+\d+", line, re.I):
        flush()
        cur_title = line
        continue

    if re.match(r"Partie\s+[\d\-]+", line, re.I):
        flush()
        cur_chap = line
        # Extraire le numéro de titre depuis "Partie X-"
        m = re.search(r"Partie\s+(\d+)", line, re.I)
        if m:
            titre_num = int(m.group(1))
            if titre_num in titles:
                cur_title = titles[titre_num]
        continue

    m = re.match(r"^(\d{3})(?!\.)\s+(.*)", line)
    if m:
        flush()
        cur_art = m.group(1)
        cur_ali = ""
        cur_page = page
        buf = [m.group(2)]
        continue

    m = re.match(r"^(\d{3}(?:\.\d+)+)\s+(.*)", line)
    if m:
        flush()
        cur_ali = m.group(1)
        cur_page = page
        buf = [m.group(2)]
        continue

    if buf:
        buf.append(line)

flush()

# ------------------ SORTIE ------------------

for r in rules:
    fn = os.path.join(OUT, r["regle_atomique"]["id_unique"] + ".json")
    with open(fn, "w", encoding="utf-8") as f:
        json.dump(r, f, ensure_ascii=False, indent=2)

print(f"🟢 V4 TERMINÉ — {len(rules)} règles atomisées (NIVEAU 6/6)")
