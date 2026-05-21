#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Génère un jeu SFT massif (10k exemples) à partir de norme_structuree.json.
Sorties : train (sft_style_dataset.jsonl), val (500), test (500).
Réponse = texte normatif exact (pas de reformulation).
"""

import json
import random
import re
from collections import Counter
from pathlib import Path

BASE_DIR = Path(__file__).parent
NORME_PATH = BASE_DIR / "norme_structuree.json"
OUT_TRAIN = BASE_DIR / "sft_style_dataset.jsonl"
OUT_VAL = BASE_DIR / "sft_validation_set.jsonl"
OUT_TEST = BASE_DIR / "sft_test_set.jsonl"

TARGET_TOTAL = 10_000
VAL_SIZE = 500
TEST_SIZE = 500

random.seed(42)

# Répartition cible (ajustée ensuite par la capacité réelle)
TARGET_SHARES = {
    "factuel": 0.25,
    "reformulation": 0.25,
    "conformite": 0.20,
    "valeur": 0.20,
    "definition": 0.10,
}

TEMPLATES = {
    "factuel_with_id": [
        "Que prévoit l’article {id} ?",
        "Que dit l’article {id} de la norme NS 01-001 ?",
    ],
    "factuel_no_id": [
        "Quelle exigence s’applique concernant {focus} ?",
        "Que prévoit la norme pour {focus} ?",
    ],
    "valeur": [
        "Quelle valeur est imposée ?",
        "Quel seuil est exigé ?",
    ],
    "definition": [
        "Comment la norme définit-elle {focus} ?",
    ],
}


def clean_articles(articles):
    """Filtre minimal : texte présent et un minimum de mots."""
    clean = []
    for a in articles:
        txt = a.get("texte", "").strip()
        if len(txt.split()) < 8:
            continue
        clean.append(a)
    return clean


def has_number(text):
    return bool(re.search(r"\d", text))


def is_definition(text):
    t = text.lower()
    return "défini" in t or "définition" in t or t.startswith("est ")


def detect_focus(a):
    if a.get("titre"):
        return a["titre"][:80]
    return a["texte"][:80]


def inject_typo(text):
    """Micro-variation sur 10% des questions."""
    if len(text) < 8:
        return text
    i = random.randint(0, len(text) - 2)
    return text[:i] + text[i + 1] + text[i] + text[i + 2 :]


def generate_candidates(articles):
    candidates = []
    for a in articles:
        aid = a["article_id"]
        chap = a.get("chapitre")
        texte = a["texte"].strip()
        focus = detect_focus(a)

        # Factuel 50/50 id vs focus
        if random.random() < 0.5:
            for t in TEMPLATES["factuel_with_id"]:
                q = t.format(id=aid)
                candidates.append(("factuel", q, aid, chap, texte))
        else:
            for t in TEMPLATES["factuel_no_id"]:
                q = t.format(focus=focus)
                candidates.append(("factuel", q, aid, chap, texte))

        # Reformulation
        q = f"Quelles sont les exigences concernant {focus} selon la norme ?"
        candidates.append(("reformulation", q, aid, chap, texte))

        # Conformité
        q = f"Une situation relative à {focus} est-elle conforme à la norme ?"
        candidates.append(("conformite", q, aid, chap, texte))

        # Valeur
        if has_number(texte):
            q = random.choice(TEMPLATES["valeur"])
            candidates.append(("valeur", q, aid, chap, texte))

        # Définition
        if is_definition(texte):
            q = TEMPLATES["definition"][0].format(focus=focus)
            candidates.append(("definition", q, aid, chap, texte))
    return candidates


def balance(candidates):
    random.shuffle(candidates)

    target_counts = {k: int(TARGET_TOTAL * v) for k, v in TARGET_SHARES.items()}

    capacity = Counter([c[0] for c in candidates])
    for k in target_counts:
        target_counts[k] = min(target_counts[k], capacity[k])

    counters = Counter()
    selected = []
    seen = set()

    for ctype, q, aid, chap, texte in candidates:
        if counters[ctype] >= target_counts.get(ctype, 0):
            continue
        if (q, aid) in seen:
            continue

        q_use = inject_typo(q) if random.random() < 0.1 else q

        selected.append(
            {
                "question": q_use,
                "reponse": texte,
                "citation_article": aid,
                "chapitre": chap,
            }
        )
        counters[ctype] += 1
        seen.add((q, aid))

        if sum(counters.values()) >= TARGET_TOTAL:
            break

    # Complément si on est sous le quota global
    if len(selected) < TARGET_TOTAL:
        for ctype, q, aid, chap, texte in candidates:
            if len(selected) >= TARGET_TOTAL:
                break
            if (q, aid) in seen:
                continue
            selected.append(
                {
                    "question": q,
                    "reponse": texte,
                    "citation_article": aid,
                    "chapitre": chap,
                }
            )
            counters[ctype] += 1
            seen.add((q, aid))

    return selected, counters


def split_and_save(dataset):
    random.shuffle(dataset)
    val = dataset[:VAL_SIZE]
    test = dataset[VAL_SIZE : VAL_SIZE + TEST_SIZE]
    train = dataset[VAL_SIZE + TEST_SIZE :]

    def dump(path, rows):
        with open(path, "w", encoding="utf-8") as f:
            for r in rows:
                f.write(json.dumps(r, ensure_ascii=False) + "\n")

    dump(OUT_TRAIN, train)
    dump(OUT_VAL, val)
    dump(OUT_TEST, test)


def main():
    data = json.loads(NORME_PATH.read_text(encoding="utf-8"))
    articles = clean_articles(data["articles"])
    print("Articles retenus :", len(articles))

    candidates = generate_candidates(articles)
    dataset, counters = balance(candidates)
    print("Distribution obtenue :", counters)
    print("Total final :", len(dataset))

    split_and_save(dataset)
    print("Train:", TARGET_TOTAL - VAL_SIZE - TEST_SIZE)
    print("Val:", VAL_SIZE)
    print("Test:", TEST_SIZE)


if __name__ == "__main__":
    main()