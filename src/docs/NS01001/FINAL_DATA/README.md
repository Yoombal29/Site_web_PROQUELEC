# NS 01-001 - Données Normatives Extraites

Ce dossier contient l'ensemble des données normatives extraites automatiquement du document **NS 01-001** (Norme de sécurité électrique).

## 📁 Contenu du Dossier

### Fichiers de Données (Production)

| Fichier | Description | Usage |
|---------|-------------|-------|
| **`NS01001_v2_core.json`** | Base de données complète des **1994 règles** normatives extraites. Chaque règle contient : `id`, `titre`, `article`, `content`, `page` | **Fichier principal** à charger dans l'application React pour l'Explorateur Normatif et l'IA Souveraine |
| **`sommaire_gold.json`** | Arbre hiérarchique du sommaire (Titres, Sections, Articles) au format JSON structuré | Pour la navigation dans l'interface utilisateur (TreeView, Breadcrumb) |
| **`sommaire_gold.txt`** | Version texte lisible du sommaire avec indentation | Pour référence humaine rapide |
| **`NS_01_001.pdf.pdf`** | Document PDF original de la norme | Pour téléchargement utilisateur ou consultation de référence |

---

## 📊 Statistiques d'Extraction

- **Pages traitées** : 21 à 478 (457 pages normatives)
- **Règles extraites** : 1994
- **Structure couverte** :
  - ✅ Titres (1 à 7)
  - ✅ Articles numérotés (ex: `11`, `12.1`, `131.2`)
  - ✅ **Annexes A, B, C, D** avec sous-sections (ex: `A.1`, `A.2.1`, `B.1.2`)
  - ✅ Articles préfixés `H` (ex: `H111`, `H131.2`)

---

## 🔧 Structure d'une Règle (JSON)

```json
{
  "id": "NS01-001-12.1",
  "titre": "TITRE 1 - Domaine d'application, objet et principes fondamentaux",
  "article": "12.1",
  "content": "Les installations électriques doivent être conçues et réalisées...",
  "page": 25
}
```

### Champs :
- **`id`** : Identifiant unique de la règle (format : `NS01-001-{article}`)
- **`titre`** : Titre de section parent (TITRE ou ANNEXE)
- **`article`** : Numéro d'article (peut être numérique `12.1` ou alphanumérique `A.2.1`)
- **`content`** : Texte complet de la règle
- **`page`** : Numéro de page dans le PDF original

---

## 🚀 Intégration dans l'Application

### 1. Charger les données dans React/TypeScript

```typescript
import normsData from '@/public/docs/NS01001/FINAL_DATA/NS01001_v2_core.json';
import sommaire from '@/public/docs/NS01001/FINAL_DATA/sommaire_gold.json';

// Exemple : Recherche par article
const rule = normsData.find(r => r.article === "12.1");

// Exemple : Filtrage par Titre
const titre1Rules = normsData.filter(r => r.titre.includes("TITRE 1"));

// Exemple : Recherche full-text
const searchResults = normsData.filter(r => 
  r.content.toLowerCase().includes("protection".toLowerCase())
);
```

### 2. Connexion à l'IA Souveraine

Le fichier `NS01001_v2_core.json` peut être utilisé pour :
- **RAG (Retrieval-Augmented Generation)** : Injection contextuelle dans les prompts
- **Vector Search** : Embeddings pour recherche sémantique
- **Fine-tuning** : Convertir en JSONL pour entraînement de modèle

### 3. Affichage dans l'Explorateur Normatif

Utilisez `sommaire_gold.json` pour construire une navigation hiérarchique :

```typescript
interface SommaireEntry {
  index: string;
  label: string;
  level: number;
  children?: SommaireEntry[];
}

// Afficher comme TreeView ou Accordion
```

---

## 🛠️ Scripts de Maintenance

Si vous devez régénérer les données (ex: nouvelle version du PDF), utilisez les scripts dans le dossier parent :

### `auto_atomize_v2.py`
Script principal d'extraction et d'atomisation des règles.

**Usage** :
```bash
python auto_atomize_v2.py
```

**Sortie** : Génère `NS01001_v2_core.json` dans `NS01001_extracts_v2/`

### `parse_gold.py`
Génère le sommaire hiérarchique à partir du texte brut.

**Usage** :
```bash
python parse_gold.py
```

**Sortie** : `sommaire_gold.json` et `sommaire_gold.txt`

---

## 📌 Notes Importantes

1. **Format des Article IDs** :
   - Les articles alphanumériques (Annexes) sont préfixés par une lettre : `A.1`, `B.2.3`
   - Les articles numériques standards : `11`, `12.1`, `131.2.2`
   - Les articles avec préfixe `H` : `H111`, `H131.2`

2. **Pages Ignorées** :
   - Les 20 premières pages (Table des Matières) sont automatiquement ignorées
   - L'extraction commence à la page 21 (Titre 1)

3. **Nettoyage du Texte** :
   - Les artefacts PDF (ex: `(cid:123)`) sont supprimés
   - Les mots coupés en fin de ligne sont reconstruits
   - Les espaces multiples sont normalisés

---

## 🎯 Prochaines Étapes Suggérées

1. **Intégration Frontend** : Connecter `ToolsPlatform.tsx` et `SovereignAIEngine.tsx`
2. **Base de Données** : Ingestion dans la base de données locale (PostgreSQL) pour recherche avancée
3. **Validation Schéma** : Lier les règles aux schémas électriques (`SchematicCanvas.tsx`)
4. **Export JSONL** : Créer un format d'entraînement pour l'IA

---

**Date d'extraction** : 2026-01-27  
**Version** : v2 (Avec Annexes A, B, C, D)  
**Statut** : ✅ Production Ready
