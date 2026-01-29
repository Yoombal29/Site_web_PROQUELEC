import json
import re

text = """Titre 1 – Domaine d’application, objet et principes fondamentaux

11 DOMAINE D’APPLICATION
12 OBJET
13 PRINCIPES FONDAMENTAUX

131 Protection pour assurer la sécurité
132 Conception des installations électriques
133 Choix des matériels électriques
134 Réalisation des installations électriques et vérifications lors de la mise en service

14 LIMITES DES INSTALLATIONS

141 Origine des installations
142 Limite aval des installations



Titre 2 – Définitions

21 TERMES RELATIFS AUX CARACTÉRISTIQUES DES INSTALLATIONS

211 Caractéristiques générales
212 Grandeurs
213 Installations diverses
214 Isolement
215 Facteurs
216 Influences externes

22 TENSIONS

222 Domaines de tensions en courant alternatif
223 Domaines de tensions en courant continu

23 TERMES RELATIFS A LA PROTECTION CONTRE LES CHOCS ÉLECTRIQUES

231.1 Généralités
231.2 Protection contre les contacts directs
231.3 Protection contre les contacts indirects
231.4 Protection contre les effets thermiques
231.5 Protection contre les surintensités
231.6 Protection contre les courants de défaut
231.7 Protection contre les surtensions

232 Termes relatifs aux parties actives et aux masses
233 Termes relatifs aux défauts
234 Termes relatifs aux tensions de contact
235 Termes relatifs aux isolations et aux enveloppes
236 Isolations
237 Classification des matériels en ce qui concerne la protection contre les chocs électriques
24 TERMES RELATIFS AUX MISES A LA TERRE
25 TERMES RELATIFS AUX CIRCUITS ÉLECTRIQUES

251 Termes généraux
252 Termes relatifs aux courants
253 Définitions relatives aux dispositifs de sectionnement, de commande et de protection
254 Définitions relatives aux caractéristiques des dispositifs de protection

26 TERMES RELATIFS AUX CANALISATIONS

261 Termes généraux
262 Modes de pose

27 TERMES RELATIFS AUX MATERIELS

270 Termes généraux
271 Termes relatifs aux possibilités de déplacement

28 SECTIONNEMENT ET COMMANDE
29 COMPÉTENCE DES PERSONNES


Titre 3 – Détermination des caractéristiques générales des Installations

30 GENERALITES
31 ALIMENTATIONS ET STRUCTURES

31.1 Puissance d'alimentation et facteur de simultanéité
31.2 Types de schémas de distribution
31.3 Alimentation
31.4 Division des installations

33 COMPATIBILITE
34 MAINTENABILITÉ
35 INSTALLATIONS DE SÉCURITÉ

35.1 Généralités
35.3 Sources de sécurité ou de remplacement

36 INSTALLATIONS TEMPORAIRES

36.1 Conditions générales
36.2 Installations de dépannage
36.3 Installations de travaux
36.4 Installations semi-permanentes



Titre 4 – Protection pour assurer la sécurité

41 PROTECTION CONTRE LES CHOCS ÉLECTRIQUES

411 Protection contre les contacts directs
412 Protection contre les contacts indirects
413 Protection contre les effets thermiques
414 Protection contre les surintensités
415 Protection contre les courants de défaut
416 Protection contre les surtensions

42 PROTECTION CONTRE LES EFFETS THERMIQUES
43 PROTECTION CONTRE LES SURINTENSITÉS
44 PROTECTION CONTRE LES SURTENSIONS
45 PROTECTION CONTRE LES DÉFAUTS
46 SECTIONNEMENT ET COMMANDE
47 INSTALLATIONS DE SÉCURITÉ


Titre 5 – Choix et mise en œuvre des matériels

51 DISPOSITIONS GÉNÉRALES
52 CANALISATIONS
53 DISPOSITIFS DE PROTECTION
54 MISES À LA TERRE
55 MATÉRIELS ÉLECTRIQUES
56 INSTALLATIONS DE SÉCURITÉ


Titre 6 – Vérifications et entretien des installations

61 VÉRIFICATIONS
62 ENTRETIEN


Titre 7 – Règles pour les installations et emplacements spécifiques

701 Salles d'eau
702 Piscines
703 Saunas
704 Chantiers
705 Établissements agricoles et horticoles
706 Enceintes conductrices
708 Caravanes et parcs pour caravanes
709 Marinas et bateaux de plaisance
711 Foires et expositions
717 Unités mobiles
752 Garages et stations-service
753 Chauffage électrique
771 Locaux d'habitation
772 Immeubles à usage d'habitation
781 Locaux de service électrique"""

def parse_gold_toc(text):
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    hierarchy = []
    
    titre_regex = re.compile(r'^Titre\s+(\d+)\s*–?\s*(.*)', re.I)
    index_regex = re.compile(r'^(\d+(\.\d+)*)\s+(.*)')
    
    current_titre = None
    current_section = None
    
    for line in lines:
        t_match = titre_regex.match(line)
        if t_match:
            num = t_match.group(1)
            label = t_match.group(2)
            current_titre = {
                "index": num,
                "label": f"Titre {num} – {label}",
                "level": 1,
                "children": []
            }
            hierarchy.append(current_titre)
            current_section = None
            continue
            
        i_match = index_regex.match(line)
        if i_match:
            index = i_match.group(1)
            label = i_match.group(3)
            
            # Determine level based on index length or dots
            if '.' in index:
                level = 3
            elif len(index) == 2:
                level = 2
            elif len(index) >= 3:
                level = 3
            else:
                level = 2
                
            node = {
                "index": index,
                "label": label,
                "level": level,
                "children": []
            }
            
            if level == 2:
                if current_titre:
                    current_titre["children"].append(node)
                    current_section = node
            elif level == 3:
                if current_section:
                    current_section["children"].append(node)
                elif current_titre:
                    current_titre["children"].append(node)
        else:
            # Lines without index (if any after title)
            pass
            
    return hierarchy

gold_hierarchy = parse_gold_toc(text)

with open(r'c:\Mes Sites Web\Site_web_PROQUELEC-main\public\docs\NS01001\sommaire_gold.json', 'w', encoding='utf-8') as f:
    json.dump(gold_hierarchy, f, ensure_ascii=False, indent=2)

print("Hierarchy generated successfully.")
