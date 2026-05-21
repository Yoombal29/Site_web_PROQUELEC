import json
from pathlib import Path

# Chemins
BASE_DIR = Path(__file__).parent
DATASET_PATH = BASE_DIR / "sft_style_dataset_cleaned_v2.jsonl"

negative_samples = [
    {"question": "Quel est le tarif actuel de l'électricité pour un client domestique petite puissance ?", "reponse": "Réponse technique :\nLe prix de l'électricité au Sénégal est fixé par la Commission de Régulation du Secteur de l'Énergie (CRSE). La norme NS 01-001 ne traite que des aspects techniques et de sécurité des installations, pas de la tarification.\n\nCitation normative :\nInformation hors périmètre technique NS 01-001"},
    {"question": "Comment faire une demande d'abonnement auprès de la Senelec ?", "reponse": "Réponse technique :\nLes procédures administratives d'abonnement dépendent exclusivement du fournisseur d'énergie (Senelec). La norme NS 01-001 régit la conformité technique de l'installation intérieure qui est un préalable à l'abonnement.\n\nCitation normative :\nProcédure commerciale hors périmètre NS 01-001"},
    {"question": "Quelle est la prime pour l'installation de panneaux solaires au Sénégal ?", "reponse": "Réponse technique :\nIl n'existe pas de mention de primes ou de subventions dans la norme NS 01-001, celle-ci étant un document purement technique définissant les règles de sécurité.\n\nCitation normative :\nAspect financier non couvert par la norme"},
    {"question": "Peut-on installer une éolienne de 50kW sur le toit d'un immeuble ?", "reponse": "Réponse technique :\nLa norme NS 01-001 couvre les installations électriques à basse tension. Les machines tournantes de forte puissance comme une éolienne de 50kW relèvent de normes spécifiques de génie civil et de sécurité mécanique non traitées ici.\n\nCitation normative :\nNormes machines spécifiques requises"},
    {"question": "Quelles sont les taxes sur l'importation de matériel électrique ?", "reponse": "Réponse technique :\nLes droits de douane et taxes sont régis par le Code des Douanes du Sénégal. La norme NS 01-001 spécifie seulement les caractéristiques techniques de conformité du matériel.\n\nCitation normative :\nInformation fiscale hors périmètre"},
    {"question": "Quelle est la durée de vie moyenne d'une ampoule LED ?", "reponse": "Réponse technique :\nBien que la norme impose des règles sur l'installation des luminaires, la performance commerciale et la longévité des produits ne sont pas définies par la norme NS 01-001.\n\nCitation normative :\nPerformance produit non normative"},
    {"question": "Où acheter des disjoncteurs certifiés à Dakar ?", "reponse": "Réponse technique :\nLa norme définit les critères techniques de certification (NF, CE, etc.), mais ne liste pas de points de vente commerciaux spécifiques.\n\nCitation normative :\nInformation commerciale non listée"},
    {"question": "L'installation d'une box domotique nécessite-t-elle un permis de construire ?", "reponse": "Réponse technique :\nLes règles d'urbanisme et de permis de construire relèvent du Code de l'Urbanisme. La norme NS 01-001 s'occupe de la mise en œuvre technique des circuits de communication et domotique.\n\nCitation normative :\nCode de l'urbanisme hors périmètre"},
    {"question": "Quel est le salaire d'un électricien certifié Proquelec ?", "reponse": "Réponse technique :\nLa norme NS 01-001 ne régit pas les conditions sociales ou salariales du métier d'électricien.\n\nCitation normative :\nAspect socio-économique hors périmètre"},
    {"question": "Comment devenir inspecteur de conformité pour Proquelec ?", "reponse": "Réponse technique :\nL'accréditation des inspecteurs relève des statuts internes de l'organisme Proquelec et des exigences de l'ASN (Association Sénégalaise de Normalisation).\n\nCitation normative :\nProcédure organisationnelle hors périmètre"},
    {"question": "Quel est le numéro de téléphone de l'urgence Senelec ?", "reponse": "Réponse technique :\nCette information n'est pas présente dans les règles de l'art techniques de la NS 01-001.\n\nCitation normative :\nCoordonnées hors périmètre"},
    {"question": "Quelle est la couleur de peinture recommandée pour un coffret électrique ?", "reponse": "Réponse technique :\nLa norme impose des marquages de sécurité et des indices de protection (IP), mais ne définit pas de contrainte esthétique sur la couleur extérieure du coffret (hors conventions de repérage des barres).\n\nCitation normative :\nChoix esthétique non normatif"},
    {"question": "Comment déclarer un sinistre après un incendie électrique ?", "reponse": "Réponse technique :\nLa déclaration de sinistre relève de votre contrat d'assurance. La norme NS 01-001 sert de référence technique pour l'expertise afin de déterminer si l'installation était conforme.\n\nCitation normative :\nProcédure assurantielle hors périmètre"},
    {"question": "Quelle est la section du câble pour une alimentation 20kV ?", "reponse": "Réponse technique :\nLa norme NS 01-001 traite exclusivement des installations à Basse Tension (BT). Le 20kV relève de la Haute Tension (HTA/HTB).\n\nCitation normative :\nHors périmètre Basse Tension"},
    {"question": "Peut-on utiliser des câbles d'un ancien navire pour une maison ?", "reponse": "Réponse technique :\nLa norme exige que les matériels soient utilisés conformément à leur destination. Les câbles marins ont des propriétés spécifiques et doivent être validés pour un usage bâtiment pour être conformes.\n\nCitation normative :\nNS 01-001 - Article 133.1"},
    {"question": "Quel est le montant de l'amende pour une installation non conforme ?", "reponse": "Réponse technique :\nLes sanctions juridiques et administratives sont définies par le Code de l'Électricité du Sénégal et non par la norme technique elle-même.\n\nCitation normative :\nConséquences juridiques hors périmètre"},
    {"question": "Comment programmer un thermostat intelligent Wi-Fi ?", "reponse": "Réponse technique :\nLa norme NS 01-001 impose les règles de raccordement et d'alimentation du thermostat, mais le paramétrage logiciel dépend du manuel du fabricant.\n\nCitation normative :\nConfiguration logicielle hors périmètre"},
    {"question": "Quel est le meilleur fournisseur de panneaux solaires ?", "reponse": "Réponse technique :\nEn tant que référentiel technique neutre, la norme NS 01-001 ne recommande aucune marque ou fournisseur spécifique.\n\nCitation normative :\nNeutralité normative"},
    {"question": "Où se trouve le siège de l'Association Sénégalaise de Normalisation ?", "reponse": "Réponse technique :\nL'adresse géographique des institutions n'est pas un sujet traité par les articles de la norme.\n\nCitation normative :\nLocalisation institutionnelle hors périmètre"},
    {"question": "Quelle est la puissance dissipée par un onduleur de 5kVA ?", "reponse": "Réponse technique :\nCette donnée dépend de l'efficacité énergétique du modèle spécifique choisi par l'installateur et figure dans la fiche technique constructeur.\n\nCitation normative :\nDonnée constructeur spécifique"},
    {"question": "Peut-on installer une prise électrique sous un évier ?", "reponse": "Réponse technique :\nCela n'est pas recommandé. Bien que la norme n'interdise pas formellement les prises dans les meubles de cuisine (hors volumes d'eau stricts), elle impose des règles d'accessibilité et de protection contre les influences externes (Humidité AD2).\n\nCitation normative :\nNS 01-001 - Article 512.2 (Influences externes)"},
    {"question": "Comment brancher un groupe électrogène sur son réseau domestique ?", "reponse": "Réponse technique :\nL'installation doit impérativement comporter un dispositif d'inversion de source mécanique ou électrique pour empêcher tout retour de courant vers le réseau public.\n\nCitation normative :\nNS 01-001 - Article 551.1.1"},
    {"question": "Quelle est la distance minimale entre une prise et un robinet de gaz ?", "reponse": "Réponse technique :\nLa norme NS 01-001 ne traite pas des installations de gaz. Il faut se référer aux normes de sécurité gaz pour les distances d'éloignement entre électricité et gaz.\n\nCitation normative :\nHors périmètre sécurité gaz"},
    {"question": "Quel disjoncteur pour une borne de recharge de voiture électrique ?", "reponse": "Réponse technique :\nL'infrastructure de recharge pour véhicules électriques (IRVE) nécessite souvent des circuits dédiés avec une protection différentielle de type B et des protections contre les surintensités adaptées à la puissance de charge.\n\nCitation normative :\nGuide technique IRVE complémentaire"},
    {"question": "Comment isoler les combles d'une maison ?", "reponse": "Réponse technique :\nL'isolation thermique des bâtiments relève des normes de construction (DTU ou équivalent). La NS 01-001 traite uniquement de la sécurité des câbles pouvant être recouverts par cet isolant.\n\nCitation normative :\nHors périmètre isolation thermique"}
]

def add_negatives():
    if not DATASET_PATH.exists():
        print("Erreur : Dataset V2 introuvable.")
        return
        
    with open(DATASET_PATH, "a", encoding="utf-8") as f:
        for sample in negative_samples:
            # On ajoute les champs vides pour garder la cohérence du format
            sample["citation_article"] = "Info hors périmètre" if "citation_article" not in sample else sample["citation_article"]
            sample["chapitre"] = "N/A"
            f.write(json.dumps(sample, ensure_ascii=False) + "\n")
            
    print(f"✅ 25 nouveaux samples négatifs expert ajoutés à {DATASET_PATH}")

if __name__ == "__main__":
    add_negatives()
