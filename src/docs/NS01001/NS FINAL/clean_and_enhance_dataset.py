import json
import re
from pathlib import Path

# Chemins
BASE_DIR = Path(__file__).parent
DATASET_PATH = BASE_DIR / "sft_style_dataset.jsonl"
OUTPUT_PATH = BASE_DIR / "sft_style_dataset_cleaned_v2.jsonl"

def is_noisy(text):
    """
    Filtre les bruits OCR selon les recommandations utilisateur.
    """
    if not text or len(text) < 10:
        return True
        
    # 1. Répétition de lettres isolées (ex: g g g)
    if re.search(r"\b([a-zA-Z])\s+\1\s+\1", text):
        return True
        
    # 2. Suites de points (lignes de sommaire OCR)
    if "...." in text:
        return True
        
    # 3. Ratio symboles/lettres trop élevé
    letters = sum(c.isalpha() for c in text)
    if letters == 0:
        return True
    others = len(text) - letters
    if others / letters > 1.2:
        return True
        
    # 4. Patterns de schémas mal extraits (ex: r = r - s - s)
    if re.search(r"[a-z]\s*=\s*[a-z]\s*[-+]\s*[a-z]", text):
        return True

    return False

def clean_and_enhance():
    cleaned_count = 0
    total_count = 0
    
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    enhanced_records = []
    
    # --- 1. Filtrage et Restructuration ---
    for line in lines:
        total_count += 1
        try:
            record = json.loads(line)
        except:
            continue
            
        question = record.get("question", "")
        reponse = record.get("reponse", "")
        article = record.get("citation_article", "N/A")
        chapitre = record.get("chapitre", "N/A")
        
        # On ne garde que si la réponse n'est pas "bruyante"
        if is_noisy(reponse):
            cleaned_count += 1
            continue
            
        # Nouveau format de réponse structurée
        enhanced_reponse = (
            f"Réponse technique :\n{reponse}\n\n"
            f"Citation normative :\nArticle {article} — {chapitre}"
        )
        
        enhanced_records.append({
            "question": question,
            "reponse": enhanced_reponse,
            "citation_article": article,
            "chapitre": chapitre
        })

    # --- 2. Ajout de Samples Négatifs ---
    negative_samples = [
        {
            "question": "Quelle est la puissance maximale d’un transformateur domestique ?",
            "reponse": "La norme NS 01-001 ne définit pas de puissance maximale pour un transformateur domestique. Cette information dépend du dimensionnement du réseau et du fournisseur d’énergie (Senelec).",
            "citation_article": "Information non couverte par la norme",
            "chapitre": "N/A"
        },
        {
            "question": "Comment installer des panneaux solaires en autoconsommation ?",
            "reponse": "La norme NS 01-001 se concentre sur les règles de sécurité des installations électriques basse tension. Les spécificités de l'autoconsommation photovoltaïque font l'objet de guides techniques séparés non inclus dans ce corpus de base.",
            "citation_article": "Hors périmètre NS 01-001",
            "chapitre": "N/A"
        },
        {
            "question": "Quel est le prix du kilowattheure au Sénégal ?",
            "reponse": "La norme NS 01-001 traite exclusivement des aspects techniques et de sécurité. Les tarifs de l'électricité sont fixés par la Commission de Régulation du Secteur de l'Énergie (CRSE).",
            "citation_article": "Donnée non normative",
            "chapitre": "N/A"
        },
        {
            "question": "Peut-on utiliser du matériel d'occasion pour une installation neuve ?",
            "reponse": "La norme exige que tout matériel soit conforme aux normes en vigueur. L'utilisation de matériel d'occasion n'est pas recommandée car elle ne garantit pas la pérennité des caractéristiques de sécurité.",
            "citation_article": "NS 01-001 - Article 133.1",
            "chapitre": "TITRE 2"
        }
    ]
    
    # On structure les samples négatifs avec le même format
    for neg in negative_samples:
        enhanced_records.append({
            "question": neg["question"],
            "reponse": f"Réponse technique :\n{neg['reponse']}\n\nCitation normative :\n{neg['citation_article']}",
            "citation_article": neg["citation_article"],
            "chapitre": neg["chapitre"]
        })

    # Sauvegarde
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        for rec in enhanced_records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
            
    print(f"✅ Analyse terminée.")
    print(f"📊 Total initial : {total_count}")
    print(f"🧹 Supprimés (bruit) : {cleaned_count}")
    print(f"✨ Total final : {len(enhanced_records)}")
    print(f"💾 Sauvegardé sous : {OUTPUT_PATH}")

if __name__ == "__main__":
    clean_and_enhance()
