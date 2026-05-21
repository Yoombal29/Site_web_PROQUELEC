from crewai import Task
import agents

def create_task_calcul(prompt, mode):
    return Task(
        description=f"Effectuer le calcul électrique suivant : {prompt}. Mode : {mode}",
        expected_output="Un résultat chiffré précis avec la formule appliquée et une brève explication normative.",
        agent=agents.agent_calcul
    )

def create_task_analyse(context, mode):
    return Task(
        description=f"Analyser la situation suivante au regard de la NF C 15-100 : {context}. Mode : {mode}",
        expected_output="Une analyse détaillée des points de conformité et non-conformité avec références aux articles de la norme.",
        agent=agents.agent_normes
    )

def create_task_schema(description, mode):
    return Task(
        description=f"Générer le code Mermaid pour le schéma électrique décrit : {description}. Mode : {mode}",
        expected_output="Un bloc de code Mermaid valide représentant le schéma unifilaire.",
        agent=agents.agent_schema
    )

def create_task_rapport(data, mode):
    return Task(
        description=f"Rédiger un rapport professionnel basé sur ces données : {data}. Mode : {mode}",
        expected_output="Un rapport structuré avec introduction, corps technique, conclusion et recommandations.",
        agent=agents.agent_rapport
    )

def create_task_formation(sujet):
    return Task(
        description=f"Expliquer le sujet suivant de manière pédagogique : {sujet}",
        expected_output="Une explication claire, accessible et illustrée par des exemples concrets.",
        agent=agents.agent_formation
    )

def create_task_admin(requete):
    return Task(
        description=f"Traiter la demande administrative interne suivante : {requete}",
        expected_output="Un document administratif ou une réponse structurée pour la gestion interne.",
        agent=agents.agent_admin
    )

def create_task_strategie(indicateurs):
    return Task(
        description=f"Analyser les indicateurs suivants et proposer une stratégie : {indicateurs}",
        expected_output="Une note stratégique avec analyse des tendances et recommandations actionnables.",
        agent=agents.agent_strategie
    )
