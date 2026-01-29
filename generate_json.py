import json
import os

# Liste des règles atomisées (exemples)
regles = [
    {
        "norme": "NS 01-001",
        "titre": "Titre 4 - Protection pour assurer la sécurité",
        "chapitre": "Protection contre les chocs électriques",
        "article": "413",
        "alinéa": "413.1.1",
        "regle_atomique": {
            "id_unique": "NS01-001-413-1-1-A",
            "type": "obligation",
            "texte_normatif": "La séparation électrique assure protection contre contacts directs par isolation principale et contre contacts indirects par séparation de protection.",
            "acteurs_concernes": ["installateur"],
            "conditions_application": {
                "schema_terre": ["TN", "TT", "IT"],
                "tension": "<=1000V",
                "lieu": ["locaux particuliers"]
            },
            "exceptions": ["limité à un seul matériel"],
            "risques_couverts": ["tension de contact dangereuse dans circuit séparé"],
            "gravite_non_conformite": "critique",
            "mesure_corrective": "Utiliser transformateur de séparation.",
            "justification": {
                "physique": "Séparation galvanique empêchant propagation de défauts",
                "biologique": "Isolation totale du circuit",
                "sécurité": "Protection pour matériels sensibles"
            },
            "verification": {
                "moyen": "Vérification isolation et séparation",
                "seuils": "Conformité NF EN 61558-2-4"
            },
            "liens_normatifs": ["413.3.2", "511.2"]
        }
    },
    {
        "norme": "NS 01-001",
        "titre": "Titre 4 - Protection pour assurer la sécurité",
        "chapitre": "Protection contre les chocs électriques",
        "article": "414",
        "alinéa": "414.1",
        "regle_atomique": {
            "id_unique": "NS01-001-414-1-A",
            "type": "obligation",
            "texte_normatif": "La très basse tension assure protection contre contacts directs par isolation principale et contre contacts indirects par limitation de tension.",
            "acteurs_concernes": ["installateur"],
            "conditions_application": {
                "schema_terre": ["TN", "TT", "IT"],
                "tension": "<=50V AC / 120V DC",
                "lieu": ["locaux humides, chantiers"]
            },
            "exceptions": [],
            "risques_couverts": ["chocs électriques par tension élevée"],
            "gravite_non_conformite": "critique",
            "mesure_corrective": "Utiliser transformateur TBTS avec isolation renforcée.",
            "justification": {
                "physique": "Tension limitée en dessous du seuil de fibrillation",
                "biologique": "Effets physiologiques négligeables",
                "sécurité": "Protection par basse tension"
            },
            "verification": {
                "moyen": "Mesure tension de sortie",
                "seuils": "≤50V AC / 120V DC"
            },
            "liens_normatifs": ["414.3", "411.7"]
        }
    },
    # Ajouter plus de règles ici
]

for regle in regles:
    filename = regle["regle_atomique"]["id_unique"] + ".json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(regle, f, ensure_ascii=False, indent=4)
    print(f"Fichier {filename} créé.")