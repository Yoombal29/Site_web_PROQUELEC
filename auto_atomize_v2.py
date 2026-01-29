import re
import json

# Lire le fichier texte
with open(r"c:\Mes Sites Web\Site_web_PROQUELEC-main\extracted_text.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Fonction pour générer ID unique
def generate_id(article, alinea):
    return f"NS01-001-{article.replace('.', '-')}-{alinea.replace('.', '-')}-A"

# Parser les règles
regles = []
current_title = ""
current_chapter = ""
current_article = ""
current_alinea = ""
current_text = []

for line in lines:
    line = line.strip()
    if not line:
        continue

    # Détecter titre (Titre X)
    title_match = re.match(r"TITRE (\d+) – (.+)", line)
    if title_match:
        current_title = f"Titre {title_match.group(1)} - {title_match.group(2)}"
        continue

    # Détecter chapitre (Partie X-XX)
    chapter_match = re.match(r"Partie (\d+-\d+) – (.+)", line)
    if chapter_match:
        current_chapter = chapter_match.group(2)
        continue

    # Détecter article (XXX Mesure...)
    article_match = re.match(r"(\d{3}) (.+)", line)
    if article_match:
        if current_article and current_text:
            # Sauvegarder la règle précédente
            texte_normatif = " ".join(current_text).strip()
            if texte_normatif:
                regle = {
                    "norme": "NS 01-001",
                    "titre": current_title,
                    "chapitre": current_chapter,
                    "article": current_article,
                    "alinéa": current_alinea,
                    "regle_atomique": {
                        "id_unique": generate_id(current_article, current_alinea),
                        "type": "obligation",
                        "texte_normatif": texte_normatif,
                        "acteurs_concernes": ["installateur", "controleur"],
                        "conditions_application": {
                            "schema_terre": ["TN", "TT", "IT"],
                            "tension": "<=1000V",
                            "lieu": ["habitation", "ERP"]
                        },
                        "exceptions": [],
                        "risques_couverts": ["électrocution", "incendie"],
                        "gravite_non_conformite": "critique",
                        "mesure_corrective": "Appliquer les prescriptions de la norme",
                        "justification": {
                            "physique": "Écoulement du courant de défaut",
                            "biologique": "Réduction tension de contact",
                            "sécurité": "Coupure automatique"
                        },
                        "verification": {
                            "moyen": "Mesure continuité PE",
                            "seuils": "Conformité selon NS 01-001"
                        },
                        "liens_normatifs": [current_article]
                    }
                }
                regles.append(regle)
        current_article = article_match.group(1)
        current_alinea = ""
        current_text = [article_match.group(2)]
        continue

    # Détecter alinéa (XXX.X Prescriptions...)
    alinea_match = re.match(r"(\d{3}\.\d+) (.+)", line)
    if alinea_match:
        if current_alinea and current_text:
            # Sauvegarder
            texte_normatif = " ".join(current_text).strip()
            if texte_normatif:
                regle = {
                    "norme": "NS 01-001",
                    "titre": current_title,
                    "chapitre": current_chapter,
                    "article": current_article,
                    "alinéa": current_alinea,
                    "regle_atomique": {
                        "id_unique": generate_id(current_article, current_alinea),
                        "type": "obligation",
                        "texte_normatif": texte_normatif,
                        "acteurs_concernes": ["installateur", "controleur"],
                        "conditions_application": {
                            "schema_terre": ["TN", "TT", "IT"],
                            "tension": "<=1000V",
                            "lieu": ["habitation", "ERP"]
                        },
                        "exceptions": [],
                        "risques_couverts": ["électrocution", "incendie"],
                        "gravite_non_conformite": "critique",
                        "mesure_corrective": "Appliquer les prescriptions de la norme",
                        "justification": {
                            "physique": "Écoulement du courant de défaut",
                            "biologique": "Réduction tension de contact",
                            "sécurité": "Coupure automatique"
                        },
                        "verification": {
                            "moyen": "Mesure continuité PE",
                            "seuils": "Conformité selon NS 01-001"
                        },
                        "liens_normatifs": [current_article]
                    }
                }
                regles.append(regle)
        current_alinea = alinea_match.group(1)
        current_text = [alinea_match.group(2)]
        continue

    # Accumuler le texte
    if current_text:
        current_text.append(line)

# Sauvegarder la dernière
if current_text:
    texte_normatif = " ".join(current_text).strip()
    if texte_normatif:
        regle = {
            "norme": "NS 01-001",
            "titre": current_title,
            "chapitre": current_chapter,
            "article": current_article,
            "alinéa": current_alinea,
            "regle_atomique": {
                "id_unique": generate_id(current_article, current_alinea),
                "type": "obligation",
                "texte_normatif": texte_normatif,
                "acteurs_concernes": ["installateur", "controleur"],
                "conditions_application": {
                    "schema_terre": ["TN", "TT", "IT"],
                    "tension": "<=1000V",
                    "lieu": ["habitation", "ERP"]
                },
                "exceptions": [],
                "risques_couverts": ["électrocution", "incendie"],
                "gravite_non_conformite": "critique",
                "mesure_corrective": "Appliquer les prescriptions de la norme",
                "justification": {
                    "physique": "Écoulement du courant de défaut",
                    "biologique": "Réduction tension de contact",
                    "sécurité": "Coupure automatique"
                },
                "verification": {
                    "moyen": "Mesure continuité PE",
                    "seuils": "Conformité selon NS 01-001"
                },
                "liens_normatifs": [current_article]
            }
        }
        regles.append(regle)

# Écrire les JSON
for regle in regles:
    filename = regle["regle_atomique"]["id_unique"] + ".json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(regle, f, ensure_ascii=False, indent=4)
    print(f"Fichier {filename} créé.")

print(f"Total règles atomisées : {len(regles)}")