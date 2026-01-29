# 🏗️ ARCHITECTURE PAR RUBRIQUES DE SCHÉMAS

## 🗂️ Plateforme de schématisation électrique modulaire

---

## 🎯 PRINCIPE GÉNÉRAL

L'application **n'est pas limitée** à un seul type de schéma ou de calcul.

Elle est conçue comme une **plateforme de schématisation électrique modulaire**, organisée par **rubriques de schémas**, chacune ayant :

- ✅ Son moteur métier dédié
- ✅ Ses règles normatives propres
- ✅ Ses paramètres spécifiques
- ✅ Son interface graphique adaptée

---

## 🧱 RUBRIQUE DE SCHÉMA — CONCEPT CLÉ

**Définition :** Une rubrique de schéma est un type de schéma électrique associé à un objectif métier précis (calcul, vérification, étude, représentation, documentation).

```
Rubrique = TypeSchéma + MoteurMétier + BibliothèqueObjets + Validations
```

---

## 📐 CATALOGUE DES RUBRIQUES

### 🔴 **RUBRIQUE 1 — SCHÉMA DE CALCUL DE CHUTE DE TENSION**
**STATUS :** ✅ IMPLÉMENTATION EN COURS (Prioritaire)

**Objectif métier :** Calcul normatif de chute de tension selon NF C 15-100 (Articles 523 / 525)

**Capacités :**
- Placement graphique des objets (source, TGBT, disjoncteurs, circuits)
- Saisie des paramètres (longueur, section, matériau, courant)
- Calcul automatique :
  - Chute de tension par tronçon
  - Cumul global
  - Thermique associée
  - Conformité normes
- Verdict global + rapport

**Moteur :** `VoltageDropCalculator`
**Interface :** `SchematicCanvas` + `VoltageDropEngine`
**Résultat :** Rapport de conformité + graphes

---

### 🟠 **RUBRIQUE 2 — SCHÉMAS UNIFILAIRES BT**
**STATUS :** 📋 PRÉVU (Future)

**Objectif métier :** Représentation normalisée pour DOE / lecture / contrôle

**Capacités :**
- Symboles normalisés NF C 15-100
- Pas de calcul (ou partiel)
- Export DWG / PDF conforme
- Traçabilité

**Moteur :** `UnifilarDiagramEngine`

---

### ⚡ **RUBRIQUE 3 — SCHÉMAS DE PROTECTION**
**STATUS :** 📋 PRÉVU (Future)

**Objectif métier :** Sélectivité et coordination des protections

**Capacités :**
- Courbes temps/courant
- Sélectivité (chronométrique / énergétique)
- Coordination disjoncteurs
- Tableaux de sélectivité

**Moteur :** `ProtectionCoordinationEngine`

---

### 🔥 **RUBRIQUE 4 — ÉTUDES THERMIQUES**
**STATUS :** 📋 PRÉVU (Future)

**Objectif métier :** Échauffement et facteurs de correction

**Capacités :**
- Calcul d'échauffement
- Facteurs d'ambiance
- Facteurs de groupement
- Regroupement de câbles

**Moteur :** `ThermalAnalysisEngine`

---

### 🧾 **RUBRIQUE 5 — DOSSIERS RÉGLEMENTAIRES**
**STATUS :** 📋 PRÉVU (Future)

**Objectif métier :** Génération automatique de documentation

**Capacités :**
- Génération DOE
- Listes de matériel
- Conformité garantie
- Archivage

**Moteur :** `RegulatoryDocumentEngine`

---

### 🧠 **RUBRIQUE 6 — SIMULATION AVANCÉE**
**STATUS :** 📋 PRÉVU (Future)

**Objectif métier :** Scénarios et études comparatives

**Capacités :**
- Hypothèses multiples
- Comparaisons
- Optimisation
- Recommandations

**Moteur :** `AdvancedSimulationEngine`

---

## 🧩 ARCHITECTURE TECHNIQUE OBLIGATOIRE

### 1️⃣ Sélecteur de rubrique au démarrage

```
┌─────────────────────────────────┐
│   Bienvenue PROQUELEC Schema    │
├─────────────────────────────────┤
│ Choisir un type de schéma :     │
│                                 │
│ ✓ Calcul de chute de tension    │
│   Schéma unifilaire BT          │
│   Schéma de protection          │
│   Étude thermique               │
│   Dossier réglementaire         │
│   Simulation avancée            │
└─────────────────────────────────┘
```

L'utilisateur sélectionne → charge la rubrique appropriée

---

### 2️⃣ Bibliothèque d'objets CONTEXTUELLE

```typescript
// Même objet, comportement différent selon la rubrique
const breaker_6a = {
  id: 'breaker_6a',
  name: 'Disjoncteur 6A',
  rubriques: {
    VOLTAGE_DROP: { 
      params: ['section', 'longueur', 'courant'],
      calcul: true 
    },
    UNIFILAIRE: { 
      params: ['calibre', 'courbe'],
      calcul: false 
    },
    PROTECTION: { 
      params: ['Is', 'Ii', 't_I²t'],
      calcul: true 
    }
  }
}
```

---

### 3️⃣ MOTEUR DE CALCUL DÉCOUPLÉ DU DESSIN

**Architecture modulaire :**

```
┌────────────────────────────────────────────┐
│        INTERFACE UTILISATEUR COMMUNE       │
│  (Canvas Konva + UI React)                 │
└────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ↓           ↓           ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  VoltageDrop │ │  Unifilaire  │ │  Protection  │
│    Engine    │ │    Engine    │ │    Engine    │
└──────────────┘ └──────────────┘ └──────────────┘
        │           │           │
        └───────────┼───────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
   GRAPH STORE (commun)   RÉSULTATS (spécifiques)
```

---

## 🔒 VERROUS STRUCTURELS

### Principe d'isolement

> ❌ **À éviter :** Chaque rubrique qui dépend des autres
> 
> ✅ **À appliquer :** Chaque rubrique est indépendante
> 
> Aucune rubrique ne doit importer une autre.
> L'option "Chute de tension" n'est qu'une **brique modulaire**, pas le cœur unique.

---

### Contrat d'interface Rubrique

```typescript
interface RubriqueSchema {
  // Identifiant
  id: 'VOLTAGE_DROP' | 'UNIFILAIRE' | 'PROTECTION' | 'THERMAL' | 'REGULATORY' | 'SIMULATION';
  
  // Métadonnées
  name: string;
  description: string;
  version: string;
  priority: number;
  
  // Moteur métier
  engine: CalculationEngine;
  
  // Bibliothèque d'objets
  getAvailableObjects(): ObjectDefinition[];
  getObjectBehavior(objectId: string): ObjectBehavior;
  
  // Validations
  validateGraph(graph: Graph): ValidationResult;
  validateObject(node: GraphNode): ValidationResult;
  
  // Calculs
  calculate(graph: Graph): CalculationResult;
  
  // Rapport
  generateReport(): Report;
  
  // UI adaptée
  getCustomComponents(): React.ComponentType[];
}
```

---

## 🧠 SYNTHÈSE POUR LES IA

> 🎯 **Tu construis une plateforme de schémas électriques**
>
> La rubrique **"Calcul de chute de tension"** est la **première implémentation**.
>
> L'interface, la bibliothèque d'objets et le moteur doivent être **pensés pour accueillir d'autres rubriques**, même s'ils ne sont pas encore codés.
>
> **Pas un outil jetable. Une base logicielle métier extensible.**

---

## ✅ RÉSULTAT ATTENDU

- ✅ Pas un calculateur isolé
- ✅ Pas une monolithe figée
- ✅ Une **plateforme modulaire**
- ✅ Comparable à **EPLAN / Caneco nouvelle génération**
- ✅ Extensible sans refonte architecturale

---

## 📋 ROADMAP TECHNIQUE

### Phase 1 : RUBRIQUE 1 (Chute de tension) ← ACTUELLE

- [x] Architecture modulaire
- [x] Canvas et interaction
- [x] Moteur de calcul basique
- [ ] Validations normatives
- [ ] Rapport complet
- [ ] Export

### Phase 2 : Infrastructure de rubriques

- [ ] Factory de rubriques
- [ ] Sélecteur au démarrage
- [ ] Conteneurisation moteurs
- [ ] Plugin système

### Phase 3 : RUBRIQUE 2 (Unifilaire)

- [ ] Symboles normalisés
- [ ] Export DWG/PDF
- [ ] Interface dédiée

### Phase 4+ : Rubriques additionnelles

---

## 🔗 Références

- **NF C 15-100** : Installation électrique basse tension
- **EPLAN Electric P8** : Référence industrie
- **Caneco** : Référence calculs électriques
- **IEC 60445** : Identification des conducteurs

---

**Statut du document :** Addendum final architecture — Verrouillé et non ambigü
**Dernière mise à jour :** 25 janvier 2026
**Audience :** Concepteurs IA / Architectes / Product Owners
