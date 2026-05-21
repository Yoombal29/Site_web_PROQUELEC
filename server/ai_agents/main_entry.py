import os
import sys
import json

# Add current directory to path for direct imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from crewai import Crew, Process
import agents
import tasks

def orchestrate(data):
    user_role = data.get("userRole", "public")
    request_type = data.get("requestType")
    mode = data.get("mode", "Gratuit")
    payload = data.get("payload")
    
    # Validation RBAC de base (déjà faite côté Node, mais double sécurité)
    if request_type in ["AdminProquelec", "Strategie"] and user_role not in ["admin", "secondary_admin"]:
        return {"error": "Accès interdit aux agents internes"}

    task = None
    # Use distinct name to avoid shadowing the 'agents' module
    agents_list = []

    if request_type == "Calcul":
        task = tasks.create_task_calcul(payload, mode)
        agents_list = [agents.agent_calcul]
    elif request_type == "Analyse":
        task = tasks.create_task_analyse(payload, mode)
        agents_list = [agents.agent_normes]
    elif request_type == "Schéma":
        task = tasks.create_task_schema(payload, mode)
        agents_list = [agents.agent_schema]
    elif request_type == "Rapport":
        task = tasks.create_task_rapport(payload, mode)
        agents_list = [agents.agent_rapport, agents.agent_normes] # Coopération possible
    elif request_type == "Formation":
        task = tasks.create_task_formation(payload)
        agents_list = [agents.agent_formation]
    elif request_type == "AdminProquelec":
        task = tasks.create_task_admin(payload)
        agents_list = [agents.agent_admin]
    elif request_type == "Strategie":
        task = tasks.create_task_strategie(payload)
        agents_list = [agents.agent_strategie, agents.agent_admin]
    else:
        return {"error": f"Type de requête inconnu : {request_type}"}

    crew = Crew(
        agents=agents_list,
        tasks=[task],
        process=Process.sequential,
        verbose=False
    )

    result = crew.kickoff()
    
    # Transformation en format standard PROQUELEC
    return {
        "mode": mode,
        "result": str(result),
        "method": f"Orchestration CrewAI - {request_type}",
        "explanation": "Analyse effectuée par les agents spécialisés PROQUELEC.",
        "valueAdded": "Justification normative incluse",
        "suggestions": ["Examiner le rapport détaillé", "Consulter un expert pour validation finale"]
    }

if __name__ == "__main__":
    try:
        # Lire les données depuis stdin (Node.js)
        input_data = sys.stdin.read().strip()
        if input_data.startswith('\ufeff'):
            input_data = input_data[1:]
            
        if not input_data:
            print(json.dumps({"error": "No input data"}))
            sys.exit(0)
            
        data = json.loads(input_data)
        response = orchestrate(data)
        print(json.dumps(response))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
