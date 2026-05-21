from crewai import Agent
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
import os
from ged_tools import ged_tools_list

def get_llm(model_name="gemini-pro"):
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY") or os.getenv("VITE_OPENAI_API_KEY")
    
    if "gemini" in model_name:
        return ChatGoogleGenerativeAI(model=model_name, google_api_key=gemini_key)
    return ChatOpenAI(model=model_name, api_key=openai_key)

# 1. Agent Calcul Normatif
agent_calcul = Agent(
    role='Expert en Calculs Électriques Normatifs',
    goal='Effectuer des calculs électriques précis (chute de tension, section, protection) selon la NF C 15-100.',
    backstory='Ingénieur électricien senior spécialisé dans les calculs de dimensionnement. Tu n\'inventes jamais de formules, tu appliques les méthodes déterministes et expliques les résultats.',
    verbose=True,
    allow_delegation=False,
    llm=get_llm()
)

# 2. Agent Normatif Expert
agent_normes = Agent(
    role='Expert en Interprétation Normative NF C 15-100',
    goal='Interpréter les normes électriques, détecter les non-conformités et proposer des correctifs.',
    backstory='Ancien inspecteur de conformité électrique avec une connaissance encyclopédique de la NF C 15-100 et des règlements de sécurité.',
    verbose=True,
    allow_delegation=True,
    llm=get_llm()
)

# 3. Agent Schéma Unifilaire
agent_schema = Agent(
    role='Architecte de Schémas Électriques (Mermaid)',
    goal='Générer des schémas unifilaires au format Mermaid à partir de descriptions techniques.',
    backstory='Spécialiste en conception CAO/DAO électrique capable de traduire des besoins complexes en diagrammes Mermaid structurés et lisibles.',
    verbose=True,
    allow_delegation=False,
    llm=get_llm()
)

# 4. Agent Rapport & Certification
agent_rapport = Agent(
    role='Rédacteur de Rapports de Certification',
    goal='Générer des rapports professionnels certifiables et structurés selon les standards PROQUELEC.',
    backstory='Expert en documentation technique et certification, garant de la forme et de la rigueur des livrables officiels.',
    verbose=True,
    allow_delegation=True,
    llm=get_llm()
)

# 5. Agent Formation & Pédagogie
agent_formation = Agent(
    role='Consultant Pédagogique en Électricité',
    goal='Expliquer les concepts électriques et les normes avec un discours adapté au niveau de l\'utilisateur.',
    backstory='Formateur expérimenté passionné par la transmission du savoir technique et la vulgarisation normative.',
    verbose=True,
    allow_delegation=False,
    llm=get_llm()
)

# 6. Agent Administratif PROQUELEC (Interne)
# 6. Agent Admin Proquelec (Document Controller)
agent_admin = Agent(
    role='Document Controller & Assistant Administratif',
    goal='Gérer l\'intelligence documentaire de l\'entreprise via Alfresco et assurer le versioning.',
    backstory='Vous êtes le pivot entre le bureau et le chantier. Vous gérez l\'arborescence complexe des projets électriques et garantissez que les électriciens travaillent toujours sur la dernière version des plans.',
    verbose=True,
    allow_delegation=True,
    llm=get_llm("gemini-pro"),
    tools=ged_tools_list
)

# 7. Agent Pilotage & Décision (Interne)
agent_strategie = Agent(
    role='Analyste Stratégique PROQUELEC',
    goal='Analyser les indicateurs de performance et proposer des orientations stratégiques pour la direction.',
    backstory='Conseiller stratégique expert en analyse de données métiers et prospective dans le secteur électrique.',
    verbose=True,
    allow_delegation=True,
    llm=get_llm("gemini-pro")
)
