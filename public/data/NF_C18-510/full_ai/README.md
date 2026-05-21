# Dossier complet IA - NF C18-510

## Fichiers principaux
- nf_c18_510_full.json : resume + atomisation + sections texte complet.
- NF_C18-510_extrait_FRANCAIS.json : JSON resume conforme au guide.
- nf_c18_510_atomise.json : JSON atomise (articles, definitions, annexes).
- nf_c18_510_pedagogique.yaml : YAML pedagogique.
- NF_C18-510_Original.pdf : PDF source.
- NF C18 510.md : extraction texte (markdown).

## Entrainement / RAG
- train/chunks.jsonl : segments texte (RAG/LLM).
- datasets/questions_ouvertes.json : structure de questions ouvertes.

## Manifest
- manifest.json : inventaire + SHA-256.

## QCM et corrections
- datasets/qcm.json
- datasets/qcm_corrections.json

## Instruction tuning
- train/instruction.jsonl

## Embeddings
- embed_chunks.py (script local, a connecter a votre fournisseur)

## QCM multi-reponses
- datasets/qcm_multi.json

## Fiches cours
- datasets/fiches_cours.html
- datasets/fiches_cours.md

## SFT
- train/sft.jsonl

## PDF
- datasets/fiches_cours.pdf

## PowerPoint
- datasets/fiches_cours.pptx
