from langchain.tools import Tool
import json

# Standalone functions for stability
def list_documents(query=""):
    """Chercher des documents dans la GED. Cette fonction retourne la liste des fichiers disponibles."""
    # Simulation
    docs = [
        {"id": "1", "name": "Plan_Unifilaire_V1.pdf", "folder": "/02_TECHNIQUE", "status": "obsolete", "version": "1.0", "project_id": "CNT-2024-001"},
        {"id": "2", "name": "Plan_Unifilaire_V2.pdf", "folder": "/02_TECHNIQUE", "status": "approved", "version": "2.0", "project_id": "CNT-2024-001"},
        {"id": "3", "name": "Facture_Siemens_Janv.pdf", "folder": "/05_FINANCIER", "status": "pending", "project_id": "CNT-2024-001"}
    ]
    return json.dumps(docs)

def read_document_content(doc_name=""):
    """Lire le contenu textuel d'un document."""
    if "Plan_Unifilaire" in doc_name:
        return "CONTENU DU PLAN: Disjoncteur Principal 32A, Circuit C1 Eclairage, Circuit C2 Prises. Norme NF C 15-100 respectée."
    if "Facture" in doc_name:
        return "FACTURE SIEMENS - Montant HT: 4500 EUR - TVA: 20% - Date: 15/01/2026"
    return "Contenu non lisible ou fichier introuvable."

def check_version(doc_name=""):
    """Vérifier si un document est à jour."""
    if "V1" in doc_name:
        return "ATTENTION: Version Obsolète (V1). Une version V2 existe."
    if "V2" in doc_name:
        return "Version Actuelle (V2). Statut: Approuvé."
    return "Version inconnue."

# Create Tool objects explicitly
search_tool = Tool(
    name="Recherche GED",
    func=list_documents,
    description="Chercher des documents."
)

read_tool = Tool(
    name="Lecture Document",
    func=read_document_content,
    description="Lire un document."
)

version_tool = Tool(
    name="Vérification Version",
    func=check_version,
    description="Vérifier la version."
)

ged_tools_list = [search_tool, read_tool, version_tool]
