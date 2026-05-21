import json
from pathlib import Path

# Chemins
BASE_DIR = Path(r"c:\Mes Sites Web\Site_web_PROQUELEC-main")
KEBE_DATASET = BASE_DIR / "src" / "docs" / "NS01001" / "NS FINAL" / "dataset_kebe_modules.jsonl"
FINAL_DATASET = BASE_DIR / "src" / "docs" / "NS01001" / "NS FINAL" / "sft_style_dataset_final_expert.jsonl"

def generate_kebe_qa():
    qa = [
        {
            "chapitre": "FORMATION_KEBE_ANNEXE_D",
            "question": "Quels sont les modules de formation prévus dans le dossier KEBE conformément à la NF C 18-510 ?",
            "reponse": "Le dossier KEBE contient 8 modules officiels conformes à l'Annexe D : D2.4 (B0/H0 Exécutant), D2.5 (B0/H0 Chargé), D2.6 (BP Photovoltaïque), D2.9 (BS), D2.11 (BR), D2.12 (BC/HC Consignation), D2.13 (B1/B2/H1/H2 Travaux) et D2.14 (BE/HE Manœuvre). Chaque support intègre le Tronc Commun et les critères d'évaluation de la section D.3.",
            "citation_article": "NF C 18-510 Annexe D"
        },
        {
            "chapitre": "ÉVALUATION_TC",
            "question": "Quels sont les critères d'évaluation pour une habilitation B0/H0 Exécutant ?",
            "reponse": "Selon l'Annexe D.3 de la NF C 18-510, l'évaluation comprend un QCM de 15 questions minimum (seuil 70%) avec zéro erreur sur les questions fondamentales (Zones et Limites), ainsi qu'une évaluation pratique sur 2 situations (Identification et Déplacement).",
            "citation_article": "NF C 18-510 D.3.1"
        },
        {
            "chapitre": "MODULE_BS",
            "question": "Quelles sont les thèmes abordés dans le module BS des formations KEBE ?",
            "reponse": "Le module BS traite des limites de l'intervention élémentaire (400V, 32A), de la mise en sécurité via les procédures de séparation et VAT, du remplacement d'accessoires (fusibles, lampes) et du raccordement de circuits terminaux.",
            "citation_article": "NF C 18-510 D.2.9"
        },
        {
            "chapitre": "CONSIGNATION_BC",
            "question": "Expliquez les 5 étapes de la consignation présentes dans le support KEBE D2.12.",
            "reponse": "Les 5 étapes enseignées sont : 1. La Séparation (coupure omnipolaire), 2. La Condamnation (cadenassage), 3. L'Identification de l'ouvrage, 4. La VAT (Vérification d'Absence de Tension), 5. La Mise à la Terre et en Court-Circuit (MALT/CC) obligatoire en HT.",
            "citation_article": "NF C 18-510 Section 7.1"
        }
    ]
    return qa

def merge():
    qa_list = generate_kebe_qa()
    with open(FINAL_DATASET, "a", encoding="utf-8") as f:
        for item in qa_list:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")
    print(f"✅ {len(qa_list)} exemples pédagogiques KEBE ajoutés au dataset final.")

if __name__ == "__main__":
    merge()
