import json
import random
from pathlib import Path

# Chemins
BASE_DIR = Path(r"c:\Mes Sites Web\Site_web_PROQUELEC-main")
PEDAGOGICAL_DATASET = BASE_DIR / "src" / "docs" / "NS01001" / "NS FINAL" / "dataset_expert_formateur.jsonl"
FINAL_DATASET = BASE_DIR / "src" / "docs" / "NS01001" / "NS FINAL" / "sft_style_dataset_final_expert.jsonl"

def generate_habilitation_modules():
    modules = [
        {
            "titre": "B0 - Exécutant non-électricien",
            "slides": [
                "Slide 1: Introduction à la sécurité électrique et rôle du B0",
                "Slide 2: Les dangers du courant électrique (Effets sur le corps)",
                "Slide 3: Les zones d'environnement et les distances de sécurité",
                "Slide 4: Les équipements de protection collective (EPC)",
                "Slide 5: Comportement en cas d'accident ou d'incendie"
            ]
        },
        {
            "titre": "B1V - Exécutant électricien avec voisinage",
            "slides": [
                "Slide 1: Le cadre réglementaire NF C 18-510",
                "Slide 2: Analyse des risques électriques sur le chantier",
                "Slide 3: Les EPI (Gants isolants, Écran facial, Tapis)",
                "Slide 4: La procédure de VAT (Vérification d'Absence de Tension)",
                "Slide 5: Travail au voisinage des parties actives"
            ]
        },
        {
            "titre": "BC - Chargé de Consignation",
            "slides": [
                "Slide 1: Définition et rôle du Chargé de Consignation",
                "Slide 2: Les 5 étapes de la consignation électrique",
                "Slide 3: Les accessoires de condamnation (Cadenas, étiquettes)",
                "Slide 4: Les documents : Attestation de consignation",
                "Slide 5: Procédure de déconsignation en sécurité"
            ]
        },
        {
            "titre": "BR - Chargé d'Intervention Générale",
            "slides": [
                "Slide 1: Spécificités des interventions BT (Dépannage, Connexion)",
                "Slide 2: Organisation de l'intervention et périmètre de sécurité",
                "Slide 3: Utilisation des appareils de mesure (Multimètre, VAT)",
                "Slide 4: Mesures de prévention lors des essais",
                "Slide 5: Fin d'intervention et remise en service"
            ]
        }
    ]
    
    samples = []
    formats = ["PowerPoint", "Word", "PDF", "Exel"]
    
    for mod in modules:
        titre = mod["titre"]
        slides_text = "\n".join(mod["slides"])
        
        for fmt in formats:
            # Question de type formation
            samples.append({
                "chapitre": "FORMATION_EXPERT",
                "question": f"Peux-tu me créer un module de formation complet pour l'habilitation {titre} au format {fmt} ?",
                "reponse": f"En tant qu'Expert Formateur PROQUELEC, je vous ai préparé ce module de formation structuré pour l'habilitation {titre}.\n\n--- STRUCTURE DU COURS --- \n{slides_text}\n\n--- DESIGN ÉPURÉ ---\n- Couleurs : Bleu Marine et Blanc avec accent Or (PROQUELEC).\n- Typographie : Sans-serif moderne.\n- Mise en page : Diapositives aérées avec schémas techniques haute résolution.\n\nVous pouvez désormais exporter ce contenu directement.",
                "citation_article": "NF C 18-510 Chapitre 4"
            })

    # Ajout de check-lists Excel
    samples.append({
        "chapitre": "OUTILS_EXPERT",
        "question": "Génère-moi un fichier Excel de vérification de conformité pour une installation NS 01-001.",
        "reponse": "Voici la structure de votre fichier Excel de contrôle :\n\n| Article | Point de Contrôle | État (OK/Non) | Observations |\n|---------|-------------------|---------------|--------------|\n| 411.3 | Continuité de la terre | | |\n| 531.2 | Test des DDR 30mA | | |\n| 523 | Dimensionnement câbles | | |\n| 141 | Étiquetage des tableaux | | |\n\nExportation disponible au format XLSX.",
        "citation_article": "NS 01-001 Titre 6"
    })

    return samples

def merge():
    new_samples = generate_habilitation_modules()
    with open(FINAL_DATASET, "a", encoding="utf-8") as f:
        for s in new_samples:
            f.write(json.dumps(s, ensure_ascii=False) + "\n")
    print(f"✅ Ajouté {len(new_samples)} nouveaux modules 'Expert Formateur' au dataset.")

if __name__ == "__main__":
    merge()
