import json
import random
from pathlib import Path

# Chemins
BASE_DIR = Path(__file__).parent
INPUT_PATH = BASE_DIR / "sft_style_dataset_cleaned_v2.jsonl"
OUTPUT_PATH = BASE_DIR / "sft_style_dataset_persona_v3.jsonl"

def augment_with_persona():
    if not INPUT_PATH.exists():
        print(f"Erreur : {INPUT_PATH} introuvable.")
        return

    with open(INPUT_PATH, "r", encoding="utf-8") as f:
        lines = f.readlines()

    new_records = []
    
    # 1. Ajout de Salutations et Politesse (ADN Proquelec)
    salutations = [
        ("Salam alaykoum, ", "Wa alaykoum salam wa rahmatoullah. C'est un plaisir de vous assister."),
        ("Bonjour, j'aimerais savoir ", "Bonjour ! Très bonne question. Voici les détails techniques :"),
        ("Bonsoir PROQUELEC, ", "Bonsoir ! Ravi de vous accompagner dans votre projet technique."),
        ("Dites-moi, ", "Bonjour. Voici l'explication experte concernant votre demande :"),
        ("", "En tant qu'expert Proquelec, voici les prescriptions de la norme :")
    ]

    # 2. Conseils Pratiques Génériques (Pédagogie)
    conseils = [
        "Un bon serrage des connexions est essentiel pour éviter les échauffements.",
        "N'oubliez pas de tester vos dispositifs différentiels une fois par mois.",
        "L'utilisation de matériel certifié garantit la pérennité de votre installation.",
        "Prévoyez toujours une réserve de 20% dans votre tableau électrique.",
        "La sécurité des personnes passe avant tout par une mise à la terre irréprochable."
    ]

    for line in lines:
        record = json.loads(line)
        orig_q = record["question"]
        orig_r = record["reponse"]
        
        # Restructuration systématique
        if "Réponse technique :" not in orig_r:
            prefix, greeting = random.choice(salutations)
            conseil = random.choice(conseils)
            
            new_q = prefix + orig_q
            new_r = f"{greeting}\n\nRéponse technique :\n{orig_r}\n\nConseil pratique :\n{conseil}\n\nCitation normative :\nArticle {record.get('citation_article', 'N/A')} — {record.get('chapitre', 'N/A')}"
            
            record["question"] = new_q
            record["reponse"] = new_r
            
        new_records.append(record)

    # 3. Ajout de Variations Sémantiques (Compréhension Profonde)
    # On double certains concepts clés avec des formulations différentes
    key_concepts = [
        ("section câble 32A", "taille du fil pour disjoncteur 32 ampères"),
        ("prise de terre", "comment faire le piquet de terre"),
        ("salle de bain", "volume de sécurité douche et baignoire"),
        ("tableau électrique", "hauteur pose coffret répartition")
    ]
    
    for concept_q, variant_q in key_concepts:
        # On cherche un exemple existant pour copier la réponse technique
        for rec in new_records:
            if concept_q in rec["question"].lower():
                var_rec = rec.copy()
                var_rec["question"] = "Dites-moi, quelle est la " + variant_q + " ?"
                new_records.append(var_rec)
                break

    # Sauvegarde V3
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        for rec in new_records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
            
    print(f"✨ V3 Persona achevée : {len(new_records)} exemples générés.")
    print(f"💾 Fichier : {OUTPUT_PATH}")

if __name__ == "__main__":
    augment_with_persona()
