# Dossier final - NF C18-510 (IA + pedagogie)

## Fichiers principaux
- NF_C18-510_extrait_FRANCAIS.json : JSON resume conforme au guide (metadonnees, resume, normes referencees, etc.).
- nf_c18_510_atomise.json : JSON atomise (articles, definitions, annexes).
- nf_c18_510_pedagogique.yaml : YAML pedagogique.
- NF_C18-510_Original.pdf : PDF source.
- NF C18 510.md : Extraction texte (markdown).

## Index et mapping
- index_recherche.json : index compact pour recherche IA (articles, definitions, annexes).
- mapping.json : correspondance entre sommaire et articles atomises.

## Datasets pedagogiques
- datasets/questions_quiz.json : questions ouvertes a completer.
- datasets/fiches_objectifs.json : objectifs par article.
- datasets/scenarios.json : scenarios a completer par type d'operation.

## Scripts
- extract_nfc18510.py : extraction/atomisation depuis le markdown.
- convert_to_yaml.js : generation du YAML pedagogique.

## Manifest
- manifest.json : inventaire des fichiers avec hash SHA-256.
