# 🏗️ ARCHITECTURE RUBRIQUES — DOCUMENTATION FINALE

## 📋 Résumé exécutif

L'application a été restructurée pour fonctionner comme une **plateforme modulaire de schématisation électrique**, organisée par **rubriques de schémas** au lieu d'être un outil monolithique.

### Objectif
Créer une base logicielle extensible comparable à **EPLAN** ou **Caneco**, permettant d'ajouter de nouvelles fonctionnalités (nouvelles rubriques) **sans refonte architecturale**.

---

## 🎯 Principes clés

### 1. **Une Rubrique = Un Moteur Métier Indépendant**

```
Rubrique = TypeSchéma + Moteur + Objets + Validations
```

Chaque rubrique :
- ✅ A son propre moteur de calcul
- ✅ Définit ses propres règles normatives
- ✅ Gère ses propres paramètres
- ✅ Est **totalement isolée** des autres rubriques

### 2. **Aucune Dépendance Circulaire**

Les rubriques **ne s'importent jamais les unes les autres**. Elles communiquent uniquement par :
- Le graphe commun (`GraphStore`)
- Les résultats de calcul génériques

### 3. **Un Même Objet, Plusieurs Comportements**

Un objet (ex: disjoncteur 6A) peut exister dans plusieurs rubriques :

```typescript
breaker_6a: {
  VOLTAGE_DROP: { params: ['section', 'courant'], calcul: true }
  UNIFILAIRE:   { params: ['calibre', 'courbe'],  calcul: false }
  PROTECTION:   { params: ['Is', 'Ii'],           calcul: true }
}
```

---

## 📁 Structure créée

### **1. Types et contrats**
```
src/types/Rubrique.ts
├─ RubriqueSchema (interface principale)
├─ CalculationEngine (contrat de moteur)
├─ ValidationResult, Report
├─ ObjectBehavior
└─ RubriqueContext
```

**Rôle :** Définir le contrat qu'une rubrique DOIT respecter. C'est un **contrat de service**, verrouillé architecturalement.

---

### **2. Services de gestion**
```
src/services/RubriqueRegistry.ts
├─ RubriqueRegistry (singleton)
│  ├─ register(rubrique)
│  ├─ get(id)
│  └─ getActive()
└─ RubriqueFactory
   ├─ create(id)
   └─ clone(rubrique)
```

**Rôle :** Enregistrer, instancier, et gérer les rubriques de façon centralisée.

---

### **3. Bootstrap et initialisation**
```
src/bootstrap/initializeRubriques.ts
└─ initializeRubriques()
   ├─ Enregistrer VOLTAGE_DROP
   ├─ Enregistrer UNIFILAIRE (future)
   ├─ Enregistrer PROTECTION (future)
   └─ Log des rubriques disponibles
```

**Rôle :** Point d'entrée unique pour initialiser le système au démarrage.

---

### **4. Implémentation : Rubrique 1**
```
src/rubriques/VoltageDropRubrique.ts
├─ VoltageDropEngine
│  ├─ validate(graph)
│  ├─ calculate(graph)
│  └─ generateReport(result)
└─ RUBRIQUE_VOLTAGE_DROP (implémentation)
   ├─ id: 'VOLTAGE_DROP'
   ├─ engine: VoltageDropEngine
   ├─ getAvailableObjects()
   ├─ validateGraph()
   └─ normativeReferences: [NF C 15-100]
```

**Rôle :** Première implémentation concrète. Servira de modèle pour les prochaines rubriques.

---

### **5. Interface utilisateur**
```
src/pages/RubriqueSelectorPage.tsx
├─ Grille de rubriques disponibles
├─ Info sur chaque rubrique
├─ Badges de statut (STABLE/BETA/ALPHA)
├─ Sélection et démarrage
└─ Affichage des références normatives
```

**Rôle :** Point d'entrée pour l'utilisateur. Il choisit le type de schéma avant de lancer l'éditeur.

---

### **6. Documentation d'architecture**
```
ARCHITECTURE_RUBRIQUES.md
├─ Principes généraux (plateforme modulaire)
├─ Catalogue des rubriques (actuelle + futures)
├─ Architecture technique obligatoire
├─ Verrous structurels
├─ Synthèse pour les IA
└─ Roadmap technique (6 phases)
```

**Rôle :** Document de référence, verrouillé et non ambigü, pour toute extension future.

---

## 🧭 Flux utilisateur (Futur)

```
┌─────────────────────────────┐
│   App démarrage             │
│   initializeRubriques()     │
└────────────┬────────────────┘
             │
             ↓
┌─────────────────────────────┐
│ RubriqueSelectorPage        │
│ Afficher rubriques dispo    │
│ L'utilisateur choisit       │
└────────────┬────────────────┘
             │ selectedRubriquId
             ↓
┌─────────────────────────────┐
│ SchematicCanvas             │
│ Charger rubrique sélectionnée
│ Charger sa BibliothèqueObj  │
│ Charger ses validations     │
└────────────┬────────────────┘
             │
             ↓
┌─────────────────────────────┐
│ Édition du schéma           │
│ Calculs métier              │
│ Rapport et export           │
└─────────────────────────────┘
```

---

## 🔒 Verrous architecturaux

### ✅ Isolement strict

```typescript
// ❌ INTERDIT
import { RUBRIQUE_UNIFILAIRE } from '@/rubriques/UnifilaireRubrique';
export class VoltageDropEngine {
  compare_with_unifilaire() { } // NON !
}

// ✅ AUTORISÉ
export class VoltageDropEngine {
  compare_with_other(other: CalculationResult) { }
  // Accepte un résultat générique, pas une rubrique spécifique
}
```

### ✅ Factory pattern obligatoire

```typescript
// Chaque rubrique DOIT être créée via la factory
const rubrique = rubriqueFactory.create('VOLTAGE_DROP');
```

### ✅ Contrat d'interface strict

Toute nouvelle rubrique DOIT implémenter le type `RubriqueSchema`.

---

## 🚀 Roadmap d'extension

### Phase 1 : RUBRIQUE 1 — Calcul de chute de tension ✅
- [x] Architecture modulaire
- [x] Canvas et interaction
- [x] Moteur de calcul basique
- [ ] Validations normatives complètes
- [ ] Rapport professionnel
- [ ] Export

### Phase 2 : Infrastructure de rubriques
- [ ] Sélecteur de rubrique
- [ ] Registry centralisée
- [ ] Factory d'instanciation

### Phase 3 : RUBRIQUE 2 — Schéma unifilaire
- [ ] Symboles normalisés NF C 15-100
- [ ] Export DWG/PDF
- [ ] Interface dédiée

### Phase 4 : RUBRIQUE 3 — Schéma de protection
- [ ] Courbes temps/courant
- [ ] Sélectivité chronométrique
- [ ] Coordination disjoncteurs

### Phase 5+ : Rubriques additionnelles
- [ ] Étude thermique
- [ ] Dossiers réglementaires
- [ ] Simulation avancée

---

## 📚 Pour ajouter une nouvelle rubrique

### Étape 1 : Créer la file
```typescript
// src/rubriques/NouvellRubrique.ts
export class NouvellEngine implements CalculationEngine { ... }
export const RUBRIQUE_NOUVELL: RubriqueSchema = {
  id: 'NOUVELLE',
  name: '...',
  engine: new NouvellEngine(),
  ...
}
```

### Étape 2 : Enregistrer
```typescript
// src/bootstrap/initializeRubriques.ts
rubriqueRegistry.register(RUBRIQUE_NOUVELLE);
```

### Étape 3 : C'est terminé ! 🎉

La rubrique est immédiatement disponible dans le sélecteur.

---

## 🎯 Résultats attendus

✅ **Pas un outil jetable**
✅ **Pas une monolithe figée**
✅ **Une plateforme métier extensible**
✅ **Comparable à EPLAN / Caneco nouvelle génération**
✅ **Prête pour 10 ans d'évolution**

---

## 📖 Documentation de référence

- [`ARCHITECTURE_RUBRIQUES.md`](ARCHITECTURE_RUBRIQUES.md) — Addendum complet
- [`src/types/Rubrique.ts`](src/types/Rubrique.ts) — Contrats d'interface (commentés)
- [`src/rubriques/VoltageDropRubrique.ts`](src/rubriques/VoltageDropRubrique.ts) — Exemple concret

---

**Statut :** 🚀 Prêt pour la phase suivante
**Audience :** Architectes / Product Owners / IA
**Date :** 25 janvier 2026
