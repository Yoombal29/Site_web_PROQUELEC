
import os
import sys

# Add path
sys.path.append(os.path.join(os.path.dirname(__file__), "haystack_backend"))

from app.services.auditor_service import AuditorService
from logic_engine import LogicEngine

def test_logic():
    print("Initializing LogicEngine...")
    engine = LogicEngine(rules_path="haystack_backend/PROQUELEC_AI_NORMATIF.yaml")
    
    print("\n--- Testing DeepConcept ---")
    inputs = [
        "disjonteur", 
        "chute de tension fil 2,5mm2", 
        "courant admissible fil 1,5",
        "Le dijoncteur de la picine",
        "salam"
    ]
    
    for i in inputs:
        print(f"Input: '{i}'")
        try:
            norm = engine.deep_concept_normalize(i)
            print(f"Normalized: '{norm}'")
        except Exception as e:
            print(f"CRASH on '{i}': {e}")

    print("\n--- Testing Rules Loading ---")
    rules = engine.get_section("regles_metier")
    if rules:
        print(f"Rules Key Found. Keys: {rules.keys()}")
    else:
        print("Rules Key 'regles_metier' NOT FOUND in LogicEngine.")

if __name__ == "__main__":
    test_logic()
