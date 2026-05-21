#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script d'extraction et d'atomisation de la norme NF C18-510
Extrait le contenu complet et crée un fichier JSON structuré
"""

import json
import re
from pathlib import Path
from datetime import date

# Chemins des fichiers
SOURCE_FILE = Path(r"C:\Mes Sites Web\NF C18 YALM\scispace\projet_nf_c18_510\NF C18 510.md")
OUTPUT_FILE = Path(r"C:\Mes Sites Web\NF C18 YALM\scispace\projet_nf_c18_510\nf_c18_510_atomise.json")

def lire_fichier_complet():
    """Lit le fichier source en entier"""
    with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
        lignes = f.readlines()
    return lignes

def extraire_numero_article(titre):
    """Extrait le numéro d'article du titre"""
    match = re.match(r'#\s*(\d+(?:\.\d+)*)\s+(.*)', titre)
    if match:
        return match.group(1), match.group(2).strip()
    return None, titre.strip()

def detecter_mots_cles(texte):
    """Détecte les mots-clés dans un texte"""
    mots_cles_recherche = {
        'domaines_tension': ['TBT', 'BT', 'HTA', 'HTB', 'haute tension', 'basse tension', 'très basse tension'],
        'operations': ['hors tension', 'sous tension', 'intervention', 'travaux', 'manœuvre', 'essai', 'mesurage', 'vérification'],
        'securite': ['consignation', 'habilitation', 'EPI', 'protection', 'risque électrique', 'VAT'],
        'acteurs': ['employeur', 'chargé de travaux', 'chargé de consignation', 'exécutant', 'chargé d\'exploitation']
    }

    mots_trouves = []
    texte_lower = texte.lower()

    for categorie, termes in mots_cles_recherche.items():
        for terme in termes:
            if terme.lower() in texte_lower:
                if terme not in mots_trouves:
                    mots_trouves.append(terme)

    return mots_trouves

def detecter_domaine_tension(texte):
    """Détecte les domaines de tension mentionnés"""
    domaines = []
    texte_upper = texte.upper()

    if 'TBT' in texte_upper or 'TRÈS BASSE TENSION' in texte_upper or 'TRES BASSE TENSION' in texte_upper:
        domaines.append('TBT')
    if re.search(r'\bBT\b', texte_upper) or 'BASSE TENSION' in texte_upper:
        domaines.append('BT')
    if 'HTA' in texte_upper or 'HAUTE TENSION A' in texte_upper:
        domaines.append('HTA')
    if 'HTB' in texte_upper or 'HAUTE TENSION B' in texte_upper:
        domaines.append('HTB')

    return list(set(domaines))

def detecter_type_operation(texte):
    """Détecte les types d'opération mentionnés"""
    types = []
    texte_lower = texte.lower()

    if 'hors tension' in texte_lower:
        types.append('hors_tension')
    if 'sous tension' in texte_lower or 'tst' in texte_lower:
        types.append('sous_tension')
    if 'intervention' in texte_lower and 'bt' in texte_lower.replace('tbt', ''):
        types.append('intervention_bt')
    if 'opération spécifique' in texte_lower or 'essai' in texte_lower or 'mesurage' in texte_lower:
        types.append('operations_specifiques')

    return list(set(types))

def extraire_articles(lignes):
    """Extrait tous les articles avec leur contenu complet"""
    articles = []
    article_courant = None
    sous_article_courant = None
    contenu_buffer = []
    sous_article_buffer = []
    contenu_commence = False

    for i, ligne in enumerate(lignes, 1):
        ligne_clean = ligne.strip()

        # Ignorer tout le préambule jusqu'au début réel des articles
        if not contenu_commence:
            if re.match(r"^#\s+1\s+DOMAINE D'APPLICATION", ligne_clean, re.IGNORECASE):
                contenu_commence = True
            else:
                continue

        # Détection d'un nouvel article principal (# 1 TITRE, # 2 TITRE, etc.)
        # Mais pas # 3.1.1 (qui est une définition)
        if re.match(r'^#\s+\d+\s+[A-Z]', ligne_clean) and not re.match(r'^#\s+\d+\.\d+', ligne_clean):
            # Sauvegarder le sous-article précédent
            if sous_article_courant and article_courant:
                sous_article_courant['contenu_complet'] = '\n'.join(sous_article_buffer).strip()
                sous_article_courant['mots_cles'] = detecter_mots_cles(sous_article_courant['contenu_complet'])
                sous_article_courant['ligne_fin'] = i - 1

            # Sauvegarder l'article précédent s'il existe
            if article_courant:
                article_courant['ligne_fin'] = i - 1
                article_courant['contenu_complet'] = '\n'.join(contenu_buffer).strip()
                article_courant['mots_cles'] = detecter_mots_cles(article_courant['contenu_complet'])
                articles.append(article_courant)

            # Créer un nouvel article
            numero, titre = extraire_numero_article(ligne_clean)
            article_courant = {
                'id': f'art_{numero.replace(".", "_")}' if numero else f'art_{i}',
                'numero': numero if numero else '',
                'titre': titre,
                'niveau': 1,
                'ligne_debut': i,
                'ligne_fin': i,
                'contenu_complet': '',
                'mots_cles': [],
                'sous_articles': []
            }
            contenu_buffer = [ligne_clean]
            sous_article_courant = None
            sous_article_buffer = []

        # Détection d'un sous-article (# 1.1 TITRE, # 1.2 TITRE, etc.)
        elif article_courant and re.match(r'^#\s+\d+\.\d+\s+', ligne_clean):
            # Sauvegarder le sous-article précédent
            if sous_article_courant:
                sous_article_courant['contenu_complet'] = '\n'.join(sous_article_buffer).strip()
                sous_article_courant['mots_cles'] = detecter_mots_cles(sous_article_courant['contenu_complet'])
                sous_article_courant['ligne_fin'] = i - 1

            numero, titre = extraire_numero_article(ligne_clean)

            # Créer un nouveau sous-article
            sous_article_courant = {
                'id': f'art_{numero.replace(".", "_")}' if numero else f'art_{i}',
                'numero': numero if numero else '',
                'titre': titre,
                'niveau': 2,
                'ligne_debut': i,
                'ligne_fin': i,
                'contenu_complet': '',
                'mots_cles': []
            }
            article_courant['sous_articles'].append(sous_article_courant)
            sous_article_buffer = [ligne_clean]
            contenu_buffer.append(ligne_clean)

        elif article_courant:
            contenu_buffer.append(ligne_clean)
            if sous_article_courant:
                sous_article_buffer.append(ligne_clean)

    # Sauvegarder le dernier sous-article
    if sous_article_courant and article_courant:
        sous_article_courant['contenu_complet'] = '\n'.join(sous_article_buffer).strip()
        sous_article_courant['mots_cles'] = detecter_mots_cles(sous_article_courant['contenu_complet'])
        sous_article_courant['ligne_fin'] = len(lignes)

    # Sauvegarder le dernier article
    if article_courant:
        article_courant['ligne_fin'] = len(lignes)
        article_courant['contenu_complet'] = '\n'.join(contenu_buffer).strip()
        article_courant['mots_cles'] = detecter_mots_cles(article_courant['contenu_complet'])
        articles.append(article_courant)

    return articles

def extraire_definitions(lignes):
    """Extrait toutes les définitions de la section 3"""
    definitions = {
        'section_3': {
            'titre': 'TERMES ET DEFINITIONS',
            'categories': []
        }
    }

    dans_section_3 = False
    categorie_courante = None
    terme_courant = None
    definition_buffer = []

    for i, ligne in enumerate(lignes, 1):
        ligne_clean = ligne.strip()

        # Détection du début de la section 3
        if re.match(r'^#\s+3\s+TERMES ET DEFINITIONS', ligne_clean, re.IGNORECASE):
            dans_section_3 = True
            continue

        # Détection de la fin de la section 3 (début section 4)
        if dans_section_3 and re.match(r'^#\s+4\s+', ligne_clean):
            # Sauvegarder le dernier terme
            if terme_courant and categorie_courante:
                terme_courant['definition'] = ' '.join(definition_buffer).strip()
                categorie_courante['termes'].append(terme_courant)
            if categorie_courante:
                definitions['section_3']['categories'].append(categorie_courante)
            break

        if dans_section_3:
            # Détection d'une catégorie (# 3.1, # 3.2, etc.)
            match_cat = re.match(r'^#\s+(3\.\d+)\s+(.+)', ligne_clean)
            if match_cat:
                # Sauvegarder le terme et la catégorie précédents
                if terme_courant and categorie_courante:
                    terme_courant['definition'] = ' '.join(definition_buffer).strip()
                    categorie_courante['termes'].append(terme_courant)
                    terme_courant = None
                    definition_buffer = []

                if categorie_courante:
                    definitions['section_3']['categories'].append(categorie_courante)

                categorie_courante = {
                    'numero': match_cat.group(1),
                    'titre': match_cat.group(2).strip(),
                    'termes': []
                }
                continue

            # Détection d'un terme (# 3.1.1, # 3.1.2, etc.)
            match_terme = re.match(r'^#\s+(3\.\d+\.\d+)\s+(.+)', ligne_clean)
            if match_terme and categorie_courante:
                # Sauvegarder le terme précédent
                if terme_courant:
                    terme_courant['definition'] = ' '.join(definition_buffer).strip()
                    categorie_courante['termes'].append(terme_courant)

                terme_courant = {
                    'numero': match_terme.group(1),
                    'terme': match_terme.group(2).strip(),
                    'definition': ''
                }
                definition_buffer = []
                continue

            # Ajout du contenu à la définition
            if terme_courant and ligne_clean:
                if not ligne_clean.startswith('#') and not ligne_clean.startswith('NOTE') and ligne_clean not in ['UTE', 'NF C 18-510', '-']:
                    # Ignorer les numéros de page et autres éléments de mise en forme
                    if not re.match(r'^\d+$', ligne_clean):
                        definition_buffer.append(ligne_clean)

    # Sauvegarder le dernier terme et la dernière catégorie
    if terme_courant and categorie_courante:
        terme_courant['definition'] = ' '.join(definition_buffer).strip()
        categorie_courante['termes'].append(terme_courant)
    if categorie_courante:
        definitions['section_3']['categories'].append(categorie_courante)

    return definitions

def extraire_annexes(lignes):
    """Extrait toutes les annexes"""
    annexes = []
    annexe_courante = None
    contenu_buffer = []
    dans_annexe = False

    for i, ligne in enumerate(lignes, 1):
        ligne_clean = ligne.strip()

        # Détection d'une annexe
        match_annexe = re.match(r'^Annexe\s+([A-Z])\s+\((\w+)\)\s+(.+)', ligne_clean, re.IGNORECASE)
        if match_annexe:
            # Sauvegarder l'annexe précédente
            if annexe_courante:
                annexe_courante['ligne_fin'] = i - 1
                annexe_courante['contenu_complet'] = '\n'.join(contenu_buffer).strip()
                annexes.append(annexe_courante)

            # Créer une nouvelle annexe
            dans_annexe = True
            lettre = match_annexe.group(1).upper()
            type_annexe = match_annexe.group(2).lower()
            titre = match_annexe.group(3).strip()

            annexe_courante = {
                'id': f'annexe_{lettre.lower()}',
                'lettre': lettre,
                'titre': titre,
                'type': type_annexe,
                'ligne_debut': i,
                'ligne_fin': i,
                'contenu_complet': '',
                'sections': []
            }
            contenu_buffer = [ligne_clean]
            continue

        # Détection de la fin des annexes (Bibliographie)
        if dans_annexe and 'Bibliographie' in ligne_clean:
            if annexe_courante:
                annexe_courante['ligne_fin'] = i - 1
                annexe_courante['contenu_complet'] = '\n'.join(contenu_buffer).strip()
                annexes.append(annexe_courante)
            break

        if dans_annexe and annexe_courante:
            contenu_buffer.append(ligne_clean)

    return annexes

def creer_index_recherche(articles, definitions):
    """Crée l'index de recherche"""
    index = {
        'par_mot_cle': {},
        'par_domaine_tension': {
            'TBT': [],
            'BT': [],
            'HTA': [],
            'HTB': []
        },
        'par_type_operation': {
            'hors_tension': [],
            'sous_tension': [],
            'intervention_bt': [],
            'operations_specifiques': []
        }
    }

    # Indexer les articles
    for article in articles:
        article_id = article['id']
        contenu = article['contenu_complet']

        # Index par mots-clés
        for mot_cle in article.get('mots_cles', []):
            if mot_cle not in index['par_mot_cle']:
                index['par_mot_cle'][mot_cle] = []
            index['par_mot_cle'][mot_cle].append({
                'article_id': article_id,
                'numero': article['numero'],
                'titre': article['titre']
            })

        # Index par domaine de tension
        domaines = detecter_domaine_tension(contenu)
        for domaine in domaines:
            if domaine in index['par_domaine_tension']:
                index['par_domaine_tension'][domaine].append({
                    'article_id': article_id,
                    'numero': article['numero'],
                    'titre': article['titre']
                })

        # Index par type d'opération
        types = detecter_type_operation(contenu)
        for type_op in types:
            if type_op in index['par_type_operation']:
                index['par_type_operation'][type_op].append({
                    'article_id': article_id,
                    'numero': article['numero'],
                    'titre': article['titre']
                })

    return index

def main():
    """Fonction principale"""
    print("Lecture du fichier NF C18 510.md...")
    lignes = lire_fichier_complet()
    total_lignes = len(lignes)
    print(f"Fichier lu : {total_lignes} lignes")

    print("\nExtraction des articles...")
    articles = extraire_articles(lignes)
    print(f"Articles extraits : {len(articles)}")

    print("\nExtraction des définitions...")
    definitions = extraire_definitions(lignes)
    nb_definitions = sum(len(cat['termes']) for cat in definitions['section_3']['categories'])
    print(f"Définitions extraites : {nb_definitions}")

    print("\nExtraction des annexes...")
    annexes = extraire_annexes(lignes)
    print(f"Annexes extraites : {len(annexes)}")

    print("\nCréation de l'index de recherche...")
    index_recherche = creer_index_recherche(articles, definitions)

    # Construction du JSON final
    json_data = {
        'metadata': {
            'norme': 'NF C18-510',
            'titre': 'OPERATIONS SUR LES OUVRAGES ET INSTALLATIONS ELECTRIQUES',
            'date_extraction': date.today().isoformat(),
            'fichier_source': 'NF C18 510.md',
            'total_lignes': total_lignes,
            'nombre_articles': len(articles),
            'nombre_definitions': nb_definitions,
            'nombre_annexes': len(annexes),
            'version': 'Janvier 2012'
        },
        'articles': articles,
        'definitions': definitions,
        'annexes': annexes,
        'index_recherche': index_recherche
    }

    print(f"\nÉcriture du fichier JSON : {OUTPUT_FILE}")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(json_data, f, ensure_ascii=False, indent=2)

    print(f"\n✓ Extraction terminée avec succès!")
    print(f"  - {len(articles)} articles")
    print(f"  - {nb_definitions} définitions")
    print(f"  - {len(annexes)} annexes")
    print(f"  - Fichier JSON : {OUTPUT_FILE}")
    print(f"  - Taille du fichier : {OUTPUT_FILE.stat().st_size / 1024:.2f} KB")

if __name__ == '__main__':
    main()
