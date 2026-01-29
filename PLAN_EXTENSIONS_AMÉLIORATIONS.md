# 🧠 PROMPT MAÎTRE — PLATEFORME DE CALCUL ÉLECTRIQUE NORMATIVE AVEC MOTEUR GRAPHIQUE

**Date:** 24 janvier 2026  
**Version:** 2.0 MAÎTRE  
**État:** Spécification officielle produit  
**Architecture:** React + TypeScript + Moteur Graphique Normatif Structurant  
**Certifiable:** NF C 15-100 + NS 01-001 + NF C 14-100  

---

## 📋 TABLE DES MATIÈRES

1. [Objectif global](#objectif-global)
2. [Architecture générale révisée](#architecture-générale-révisée)
3. [Moteur graphique structurant](#moteur-graphique-structurant)
4. [Bibliothèque d'objets normatifs](#bibliothèque-dobjets-normatifs)
5. [Extensions fonctionnelles](#extensions-fonctionnelles)
6. [Verrou de cohérence normative](#verrou-de-cohérence-normative-vcng)
7. [Chronologie d'implémentation](#chronologie-dimpllémentation)
8. [Détail technique par phase](#détail-technique-par-phase)
9. [Points d'intégration](#points-dintégration)
10. [Checklist d'implémentation](#checklist-dimpllémentation)

---

## � OBJECTIF GLOBAL

Créer une **plateforme logicielle de calcul électrique basse tension** qui ne demande **pas une saisie formulaire traditionnelle**, mais une **construction graphique intelligente** d'un schéma électrique normatif.

**Principe fondamental :**

> **Les calculs ne sont pas saisis manuellement : ils sont STRUCTURÉS PAR UN SCHÉMA GRAPHIQUE INTELLIGENT**, composé d'objets normatifs reliés entre eux.

Le schéma devient **la source unique de vérité** :
- il définit la topologie électrique
- il génère automatiquement les paramètres de calcul
- il pilote les vérifications normatives
- il alimente les exports réglementaires
- il est hashé et signé électroniquement

---

## 🏗️ ARCHITECTURE GÉNÉRALE RÉVISÉE

```
ApplicationRoot
│
└─ ElectricalSchemaBuilder (NEW - Composant racine graphique)
   │
   ├─ 🧱 MOTEUR GRAPHIQUE STRUCTURANT (NEW)
   │   ├─ GraphStore (état du schéma / graphe orienté)
   │   ├─ ObjectLibrary (catalogue d'objets normatifs)
   │   ├─ Canvas2D (visualisation schématique)
   │   ├─ Canvas3D (visualisation pédagogique)
   │   └─ CableCalculator (longueurs automatiques)
   │
   ├─ 🔒 MOTEUR NORMATIF EXISTANT (inchangé)
   │   ├─ calculateVoltageDrop()
   │   ├─ calculateThermalLimits()
   │   ├─ generateCalculationHash()
   │   ├─ generateAuditLog()
   │   ├─ generateAuditHash()
   │   └─ generateElectronicSignature()
   │
   ├─ 📐 COUCHE PARAMÈTRES DÉRIVÉS
   │   ├─ Extraction automatique du schéma
   │   ├─ Aucune saisie libre non justifiée
   │   └─ Validation cohérence
   │
   ├─ 🧠 COUCHE D'AUDIT (AUDIT_PROOF)
   │   ├─ Journal d'actions (chaque modification)
   │   ├─ Historique multi-versions
   │   ├─ Hash cryptographique global (VCNG)
   │   └─ Signature électronique
   │
   ├─ ✨ EXTENSIONS FONCTIONNELLES
   │   ├─ [EXT-1] Templates normatifs (pré-schémas)
   │   ├─ [EXT-2] Graphiques dynamiques
   │   ├─ [EXT-3] Assistant pas-à-pas
   │   ├─ [EXT-4] Comparaison sections
   │   ├─ [EXT-5] Mode de pose optimisé
   │   └─ [EXT-6] Alertes intelligentes
   │
   └─ 📦 EXPORTS RÉGLEMENTAIRES
       ├─ Schéma électrique 2D normatif
       ├─ Vue 3D pédagogique
       ├─ Tableau des tronçons
       ├─ DOE (Dossier d'ouvrage exécuté)
       ├─ Dossier de conformité
       ├─ Identification tronçon pénalisant
       └─ Signature électronique + Hash global
```

---

## 🧱 MOTEUR GRAPHIQUE STRUCTURANT

### Concept fondamental

**Chaque objet graphique est un objet normatif actif :**
- il possède des paramètres éditables
- il influence les calculs de manière traçable
- il est justifiable par référence normative
- il ne peut jamais être "décoratif"

### Fonctionnement

1. **Placement par glisser-déposer** → objet instancié
2. **Connexion graphique** → création automatique d'un câble
3. **Distance graphique** = longueur électrique (en mètres)
4. **Toute modification** → recalcul immédiat + entrée d'audit
5. **Hashage du graphe** → cohérence garantie (VCNG)

### Visualisation

- **Mode 2D schématique** : symboles normatifs (IEC/NF C)
- **Mode 3D pédagogique** : épuré, non-réaliste, pour compréhension
- **Code couleur normatif** :
  - 🟢 conforme
  - 🟠 marge critique (< 0.5%)
  - 🔴 non conforme

---

## 📚 BIBLIOTHÈQUE D'OBJETS NORMATIFS (EXHAUSTIVE)

### **A. SOURCES & ALIMENTATION (NF C 14-100)**

| Objet | Symbole | Paramètres clés | Rôle | Ref. Normative |
|-------|---------|-----------------|------|-----------------|
| **Réseau public BT** | ⚡ (réseau) | Type A, Tension (230/400V) | Source unique | Art. 522 |
| **Branchement individuel** | 🔌 | Ampérage disponible | Entrée domicile | C14-100 |
| **Branchement collectif** | 🏘️ | Ampérage disponible | Entrée immeuble | C14-100 |
| **Poste HT/BT** | 📦 | Puissance, Tension amont/aval | Transformation | NF C 14-100 |
| **Poste de livraison** | 📮 | Type d'alimentation aval (A/B) | Raccordement public | C14-100 |

**Paramètres obligatoires :**
- Tension U (230V mono / 400V tri)
- Régime de neutre (info affichage)
- Puissance disponible (référence)
- Classification A (public) ou B (privé)

---

### **B. POSTES & TRANSFORMATION**

| Objet | Symbole | Paramètres clés | Impact | Ref. |
|-------|---------|-----------------|--------|------|
| **Transformateur privé** | T | Puissance, Uk%, ΔT(°C) | Définit Type B aval | Art. 523 |
| **Transformateur de distribution** | T | Puissance, Uk% | Récup. paramètres | Art. 525 |
| **Poste compact** | 📦 | Dimensions, Dissipation | Référence thermique | IEC 60439 |

**Paramètres obligatoires :**
- Puissance nominale (kVA)
- Impédance Uk(%)
- Échauffement ΔT(°C)
- Tension aval

**Génère automatiquement :**
- Type d'alimentation aval = B
- Courant de court-circuit

---

### **C. TABLEAUX & ENVELOPPES (NŒUDS)**

| Objet | Symbole | Paramètres clés | Rôle | Ref. |
|-------|---------|-----------------|------|------|
| **TGBT** | □ | Étiquette | Nœud principal | Art. 521 |
| **Tableau divisionnaire** | □ | Étiquette, Niveau | Nœud secondaire | Art. 522 |
| **Armoire électrique** | 🗄️ | Dimension, Usage | Nœud complet | IEC 60297 |
| **Coffret** | 📭 | Dimension, Usage | Nœud léger | IEC 61439 |
| **Tableau d'étage** | 📊 | Étiquette, Niveau | Distribution | Art. 522 |
| **Tableau de chantier** | 🏗️ | Tension, Ampérage | Temporaire | NFC 15-100 Chantier |

**Caractéristiques :**
- Jamais de chute de tension propre
- Nœud du graphe (convergence/divergence)
- Étiquetage obligatoire pour traçabilité

---

### **D. PROTECTIONS & APPAREILLAGES**

| Objet | Symbole | Paramètres clés | Impact | Ref. |
|-------|---------|-----------------|--------|------|
| **Disjoncteur** | C | Calibre, Courbe (B/C/D), Pdc | Protection thermique/mécanique | Art. 533 |
| **Fusible** | ◯ | Ampérage | Protection obsolète (info) | Art. 533 |
| **Interrupteur-sectionneur** | ⟋ | Ampérage | Sectionneur de source | Art. 534 |
| **DDR** | ⚡⚠️ | Sensibilité (mA), Type (A/AC) | Protection contact | Art. 535 |
| **Contacteur** | M | Puissance, Calibre | Commutation puissance | IEC 61095 |
| **Relais thermique** | T | Plage, Calibre | Protection surcharge | Art. 533 |
| **Inverseur de source** | ↔️ | Ampérage, Délai | Commutation sources | IEC 60947 |

**Paramètres obligatoires :**
- Calibre (A)
- Courbe de déclenchement (si disjoncteur)
- Pouvoir de coupure (kA)

**Génère automatiquement :**
- Constraint thermique (IB max ≤ In ≤ Iz)

---

### **E. CÂBLES & LIAISONS (OBJET CRITIQUE)**

**CECI EST L'OBJET LE PLUS IMPORTANT.**

| Objet | Symbole | Paramètres clés | Impact critique | Ref. |
|-------|---------|-----------------|-----------------|------|
| **Câble cuivre** | ─ (Cu) | Section S(mm²), Longueur L(m) | ΔU%, Iz, Résistance | Art. 525 |
| **Câble aluminium** | ─ (Al) | Section S(mm²), Longueur L(m) | ΔU%, Iz, Résistance | Art. 525 |
| **Liaison aérienne** | ═ (aérien) | Section, Longueur, Portée | Facteur géométrique | Art. 524 |
| **Liaison enterrée** | ≈ (enterré) | Section, Longueur, Profondeur | Facteur thermique réduit | Art. 523 |
| **Chemin de câble** | ⟨ | Type (perforé/plein), Densité | Facteur groupement | Art. 523 |
| **Gaine/Fourreau** | ( ) | Diamètre, Matériau | Facteur thermique | Art. 523 |

**Paramètres obligatoires (extraction du graphe) :**
- Longueur L (m) = distance graphique entre deux nœuds
- Section S (mm²) = choix utilisateur dans liste normalisée
- Matériau (Cu / Al)
- Mode de pose (Art. 523)

**Paramètres optionnels mais impactants :**
- Température ambiante (par défaut 30°C)
- Groupement de circuits (par défaut 1)
- Nature du sol (si enterré)
- Type de protection thermique

**Calculs automatiques générés :**
- Résistance linéique R (Ω/m) selon matériau + T°
- Réactance linéique X (Ω/m) selon géométrie
- Iz corrigé (A) = Iz_table × f_T × f_groupement × f_pose
- ΔU (%) = (√3 × I × L × (R × cosφ + X × sinφ)) / U
- Conformité : ΔU ≤ limite (3% lignes, 5% tableaux)

**Visualisation :**
- Épaisseur proportionnelle à la section
- Longueur graphique = longueur réelle (affichage en mètres)
- Code couleur conformité appliqué au câble

---

### **F. RÉCEPTEURS & CHARGES**

| Objet | Symbole | Paramètres clés | Calcul IB | Ref. |
|-------|---------|-----------------|-----------|------|
| **Éclairage LED** | 💡 | Puissance P(W), cosφ=1 | IB = P / U | Art. 525 |
| **Prises mono 16A** | 🔌 | Nombre × 16A socles | IB = N × 16A | Art. 523 |
| **Prises tri 32A** | 🔌🔌 | Nombre × 32A tri | IB = N × 32A / √3 | Art. 523 |
| **Moteur** | ⊗ | Puissance P(kW), cosφ, η | IB = P / (√3 × U × cosφ × η) | Art. 525 |
| **Climatisation** | ❄️ | Puissance frigorifique (kW) | IB = P / U (approximé) | Art. 525 |
| **Borne VE** | 🔋 | Puissance (kW) | IB = P / U (mono ou tri) | NF 15-100 Ann. |
| **UPS** | 🔋 | Puissance (kVA), cosφ | IB = S / U | Art. 525 |
| **Ascenseur** | ↕️ | Puissance nominale (kW) | IB = P / U (tri) | Art. 525 |

**Paramètres obligatoires :**
- Puissance P (W / kW / kVA)
- Facteur de puissance cosφ (par défaut selon type)
- Tension (héritée du tableau parent)

**Génère automatiquement :**
- Courant IB (A) = calcul normatif
- Contrainte : IB ≤ In ≤ Iz (via appareil de protection)

---

### **Objets spécialisés additionnels**

- **Batterie de condensateurs** (cosφ correction)
- **Variateur de fréquence** (harmoniques)
- **Éclairage secours** (secours asservi)
- **Sectionneur de mise à terre**

⚠️ **Hors scope initial** → À intégrer en Phase 2.

---

## ⏰ CHRONOLOGIE D'IMPLÉMENTATION

### **Phase 1 : Infrastructure graphique (Jours 1-3)**
- [ ] **Moteur graphique de base**
  - Bibliothèque objets normatifs (A-F catégories)
  - Canvas 2D (react-konva ou Babylon.js)
  - Placement/glisser-déposer
  - Connexion graphique = câble automatique
  - Calcul longueurs automatiques

### **Phase 2 : Intégration calcul (Jours 4-5)**
- [ ] **Extraction paramètres du graphe**
  - Parser graphe → paramètres d'entrée
  - Validation cohérence
  - Mapping objet → calcul normatif
  - Extension 1 : Templates (pré-schémas)
  - Extension 3 : Assistant pas-à-pas (guidage construction)

### **Phase 3 : Visualisation & Alertes (Jours 6-7)**
- [ ] **Extension 2 : Graphiques dynamiques**
  - Intégration Recharts
  - 3 graphiques de base
- [ ] **Extension 6 : Alertes intelligentes**
  - Logique d'alerte normée
  - UI notifications temps réel

### **Phase 4 : Optimisation (Jours 8-9)**
- [ ] **Extension 4 : Comparaison sections**
  - Logique comparative
- [ ] **Extension 5 : Mode de pose optimisé**
  - Matrice facteurs complets
  - Sélecteur interactif mode

### **Phase 5 : Audit & Exports (Jour 10)**
- [ ] **Verrou VCNG (Cohérence Normative Globale)**
  - Hash du graphe
  - Hash des calculs
  - Hash global système
  - Validation cohérence

### **Phase 6 : Déploiement (Jour 11)**
- [ ] Tests intégration complète
- [ ] Documentation
- [ ] Build production

---

## 🔒 VERROU DE COHÉRENCE NORMATIVE GLOBALE (VCNG)

### Concept

> **Le logiciel interdit toute validation si le schéma graphique, les calculs et les normes ne sont pas parfaitement cohérents.**

### Fonctionnement

**1. Triple hashage obligatoire :**

```typescript
// Niveau 1 : Hash du graphe
graphHash = SHA256(serialize({
  nodes: [...objects with params],
  edges: [...cables with properties],
  layout: {...positions}
}))

// Niveau 2 : Hash des calculs
calculationHash = SHA256(serialize({
  results: [...],
  audit_log: [...],
  timestamp: ...
}))

// Niveau 3 : Hash global système (VCNG)
systemHash = SHA256(graphHash + calculationHash + versionHash)
```

**2. Validation cohérence :**
- Aucune modification du graphe sans invalidation automatique
- Aucun calcul sans traçabilité d'audit
- Impossible de "bricoler" une valeur intermédiaire
- Modification = nouvelle version + nouvel historique

**3. Conséquences :**
- ✅ Opposable à un bureau de contrôle
- ✅ Audit-proof complet
- ✅ Signature électronique valide légalement
- ✅ Impossible de falsifier un calcul

### Implémentation technique

**Fichier : `src/services/CoherenceVerifier.ts`**

```typescript
interface CoherenceSnapshot {
  graphHash: string;
  calculationHash: string;
  systemHash: string;
  timestamp: number;
  version: number;
  isValid: boolean;
  validationErrors: string[];
}

export class CoherenceVerifier {
  /**
   * Valide la cohérence globale du système
   * Retourne false si incohérence détectée
   */
  static verifyGlobalCoherence(
    graphState: GraphState,
    calculationResult: CalculationResult,
    auditLog: AuditEntry[]
  ): CoherenceSnapshot {
    const graphHash = this.hashGraphState(graphState);
    const calculationHash = this.hashCalculations(calculationResult, auditLog);
    const systemHash = this.computeSystemHash(graphHash, calculationHash);
    
    const errors = this.detectInconsistencies(
      graphState,
      calculationResult,
      graphHash,
      calculationHash
    );
    
    return {
      graphHash,
      calculationHash,
      systemHash,
      timestamp: Date.now(),
      version: auditLog.length,
      isValid: errors.length === 0,
      validationErrors: errors
    };
  }

  /**
   * Empêche la validation si incohérence
   */
  static canValidateCalculation(snapshot: CoherenceSnapshot): boolean {
    if (!snapshot.isValid) {
      console.error('❌ VALIDATION IMPOSSIBLE — Incohérence détectée:');
      snapshot.validationErrors.forEach(err => console.error(`  - ${err}`));
      return false;
    }
    return true;
  }

  /**
   * Signature électronique = hash global
   */
  static generateElectronicSignature(snapshot: CoherenceSnapshot): string {
    return this.signWithTimestamp(snapshot.systemHash, snapshot.timestamp);
  }
}
```

### Validation UI

**Composant `VCNGValidator.tsx` :**

```tsx
export function VCNGValidator({ snapshot }: { snapshot: CoherenceSnapshot }) {
  if (!snapshot.isValid) {
    return (
      <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
        <h4 className="font-bold text-red-700">🔴 Validation impossible</h4>
        <p className="text-sm text-red-600 mt-2">Incohérence système détectée :</p>
        <ul className="text-xs text-red-600 mt-2 space-y-1">
          {snapshot.validationErrors.map((err, i) => (
            <li key={i}>• {err}</li>
          ))}
        </ul>
        <p className="text-xs text-red-500 mt-3">
          ⚠️ Modifiez le schéma ou les paramètres pour résoudre l'incohérence.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
      <h4 className="font-bold text-green-700">✅ Cohérence vérifiée</h4>
      <div className="text-xs text-green-600 mt-2 space-y-1">
        <div>Graph: {snapshot.graphHash.slice(0, 16)}...</div>
        <div>Calculs: {snapshot.calculationHash.slice(0, 16)}...</div>
        <div>Système: {snapshot.systemHash.slice(0, 16)}...</div>
      </div>
      <p className="text-xs text-green-600 mt-2">V{snapshot.version} • {new Date(snapshot.timestamp).toLocaleString()}</p>
    </div>
  );
}
```

---

## ✨ EXTENSIONS FONCTIONNELLES

### **[EXT-1] TEMPLATES NORMATIFS (Pré-schémas)**

Les templates ne sont plus de simples paramétrages : ce sont des **schémas graphiques pré-construits**.

**Fonctionnement :**

```
Utilisateur sélectionne "Éclairage"
  ↓
Schéma graphique pré-dessiné apparaît :
  - TGBT (source)
  - Disjoncteur 6A courbe B
  - Câble Cu 1,5mm²
  - Circuit LED (3 points)
  ↓
Utilisateur ajuste longueurs graphiques
  ↓
Tous les paramètres dérivés automatiquement
```

**Templates pré-définis :**
- 🔆 **Éclairage** (disjoncteur 6A, Cu 1,5mm²)
- 🔌 **Prises 16A** (disjoncteur 16A, Cu 2,5mm²)
- ⚙️ **Moteur 3kW** (disjoncteur thermique, Cu 4mm²)
- 🏭 **Tableau divisionnaire** (départ TGBT)
- 🏠 **Logement 60A** (schéma complet base)
- 🏢 **Tertiaire 125A** (multi-tableaux)

**Fichier : `src/constants/templateSchemas.ts`**

```typescript
interface TemplateSchema {
  id: string;
  name: string;
  description: string;
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  normativeRef: string;
}

const TEMPLATE_SCHEMAS: Record<string, TemplateSchema> = {
  lighting: {
    id: 'lighting',
    name: '🔆 Éclairage',
    graphNodes: [
      { id: 'source', type: 'SOURCE', params: { voltage: 230, type: 'A' } },
      { id: 'disj1', type: 'BREAKER', params: { calibre: 6, curve: 'B' } },
      { id: 'loads', type: 'RECEPTOR', params: { power: 100, cosφ: 1 } }
    ],
    graphEdges: [
      { from: 'source', to: 'disj1', type: 'CABLE_CU', section: 1.5, length: 5 },
      { from: 'disj1', to: 'loads', type: 'CABLE_CU', section: 1.5, length: 15 }
    ],
    normativeRef: 'NS 01-001 Art. 525 / Tableau 52V'
  }
};
```

---

### **[EXT-2] GRAPHIQUES DYNAMIQUES**

**3 graphiques normés :**

**Graphique 1 : Chute de tension vs longueur**
- Axe X : longueur (m)
- Axe Y : ΔU (%)
- Courbe calculée en temps réel
- Limite normative (Type A / B)

**Graphique 2 : Marge de conformité (jauge)**
- Barre horizontale = marge restante
- Code couleur : 🟢 > 1% | 🟠 0,5-1% | 🔴 < 0,5%

**Graphique 3 : Limite thermique vs courant**
- Courbe Iz(section)
- Point IB utilisateur
- Avertissement si IB → Iz

Fichier : `src/components/charts/NormativeCharts.tsx`

---

### **[EXT-3] ASSISTANT PAS-À-PAS (Mode guidé)**

**7 étapes séquentielles verrouillées :**

1. Type d'alimentation (A / B)
2. Régime électrique (mono / tri)
3. Charge / puissance
4. Longueur approximative
5. Choix matériau (Cu / Al)
6. Mode de pose (Art. 523)
7. Calcul & verdict

**Chaque étape :**
- Tooltip normatif
- Exemple concret
- Validation impossible de passer si incohérence

Fichier : `src/components/dialogs/GuidedWizard.tsx`

---

### **[EXT-4] COMPARAISON SECTIONS AUTOMATIQUE**

Affiche les **3 meilleures sections normalisées possibles** :

| Section | ΔU (%) | Marge (%) | Verdict | Note |
|---------|--------|-----------|---------|------|
| 1,5 | 8,5 | 0,0 | ❌ KO | Insuffisante |
| 2,5 | 5,1 | 3,4 | ✅ **RECOMMANDÉE** | Première conforme |
| 4,0 | 3,2 | 5,3 | ✅ OK | Meilleure marge |

Fichier : `src/functions/compareSections.ts`

---

### **[EXT-5] MODE DE POSE OPTIMISÉ (Facteurs thermiques)**

**Matrice complète Art. 523 :**

- Mode de pose (A1, A2, B1, C, D, E, F, G)
- Température ambiante (20-60°C)
- Groupement de circuits (1-6+)
- Nature du sol / air
- Enfouissement / goulotte

**Sélecteur interactif :**
- Schéma 2D simplifié du mode
- Application automatique des coefficients
- Recalcul Iz immédiat

Fichier : `src/constants/thermalFactorsMatrix.ts`

---

### **[EXT-6] ALERTES INTELLIGENTES NORMÉES**

**Alertes automatiques avec actions suggérées :**

- ⚠️ **Marge < 0,5%** → Augmenter section / Rapprocher source
- 🔥 **IB > 90% Iz** → Section insuffisante thermiquement
- ❌ **Dépassement Tableau 52V** → Impossible — choix section
- ⚡ **Cumul amont + aval critique** → Fractionner départ

Toutes accompagnées d'une **référence Article obligatoire**.

Fichier : `src/hooks/useCalculationAlerts.ts`

---

## � DÉTAIL TECHNIQUE PAR PHASE

### **PHASE 1 : INFRASTRUCTURE GRAPHIQUE (Jours 1-3)**

#### 1.1 GraphStore (État du schéma)

**Fichier : `src/stores/GraphStore.ts`**

```typescript
interface GraphNode {
  id: string;
  type: 'SOURCE' | 'BREAKER' | 'CABLE' | 'RECEPTOR' | 'TABLEAU' | 'TRANSFORMER';
  position: { x: number; y: number };
  params: Record<string, any>;
  metadata: { createdAt: number; modifiedAt: number };
}

interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: 'CABLE_CU' | 'CABLE_AL' | 'CONNECTION';
  properties: {
    section?: number;
    length: number; // calculée automatiquement
    modeOfInstallation?: string;
  };
}

export class GraphStore {
  nodes: Map<string, GraphNode> = new Map();
  edges: Map<string, GraphEdge> = new Map();

  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    this.notifyListeners('GRAPH_CHANGED');
  }

  addEdge(edge: GraphEdge): void {
    const fromNode = this.nodes.get(edge.from);
    const toNode = this.nodes.get(edge.to);
    
    if (!fromNode || !toNode) throw new Error('Nodes not found');
    
    // Calcul automatique longueur
    edge.properties.length = this.calculateDistance(fromNode.position, toNode.position);
    
    this.edges.set(edge.id, edge);
    this.notifyListeners('GRAPH_CHANGED');
  }

  private calculateDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    // Conversion pixels → mètres (exemple: 1px = 0.1m)
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy) / 10; // conversion factor
  }

  getHash(): string {
    return SHA256(JSON.stringify({
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values())
    })).toString();
  }
}
```

#### 1.2 ObjectLibrary (Catalogue d'objets normatifs)

**Fichier : `src/constants/ObjectLibrary.ts`**

```typescript
interface ObjectDefinition {
  id: string;
  category: 'SOURCE' | 'BREAKER' | 'TRANSFORMER' | 'TABLEAU' | 'CABLE' | 'RECEPTOR';
  name: string;
  symbol: string; // SVG ou icône
  defaultParams: Record<string, any>;
  normativeRef: string;
  editableFields: Array<{ name: string; type: 'number' | 'select' | 'text'; options?: string[] }>;
}

export const OBJECT_DEFINITIONS: Record<string, ObjectDefinition> = {
  SOURCE_TYPE_A: {
    id: 'source_type_a',
    category: 'SOURCE',
    name: 'Réseau public BT',
    symbol: '⚡(réseau)',
    defaultParams: { voltage: 230, type: 'A', regime: 'TT' },
    normativeRef: 'NF C 14-100 Art. 5',
    editableFields: [
      { name: 'voltage', type: 'select', options: ['230', '400'] }
    ]
  },
  BREAKER_6A: {
    id: 'breaker_6a',
    category: 'BREAKER',
    name: 'Disjoncteur 6A courbe B',
    symbol: 'C',
    defaultParams: { calibre: 6, curve: 'B', pdc: 4500 },
    normativeRef: 'NF C 61-201',
    editableFields: [
      { name: 'calibre', type: 'number' }
    ]
  },
  CABLE_CU_15: {
    id: 'cable_cu_15',
    category: 'CABLE',
    name: 'Câble Cu 1,5mm²',
    symbol: '─(Cu)',
    defaultParams: { section: 1.5, material: 'Cu', modeOfInstallation: 'B1' },
    normativeRef: 'NF C 61-100',
    editableFields: [
      { name: 'modeOfInstallation', type: 'select', options: ['A1', 'A2', 'B1', 'C', 'D', 'E', 'F', 'G'] }
    ]
  }
};
```

#### 1.3 Canvas 2D (Visualisation schématique)

**Dépendance : react-konva ou Babylon.js**

```bash
npm install konva react-konva
```

**Fichier : `src/components/canvas/SchematicCanvas.tsx`**

```typescript
import Konva from 'konva';
import { Stage, Layer, Rect, Circle, Text, Line } from 'react-konva';

export function SchematicCanvas({ graphStore, onNodeDrag, onEdgeCreate }) {
  return (
    <Stage width={window.innerWidth} height={600} onMouseUp={handleStageClick}>
      <Layer>
        {/* Render nodes */}
        {Array.from(graphStore.nodes.values()).map(node => (
          <Group key={node.id} draggable onDragEnd={(e) => onNodeDrag(node.id, e.target.position())}>
            <Circle x={node.position.x} y={node.position.y} radius={30} fill="#4F46E5" />
            <Text x={node.position.x - 15} y={node.position.y - 10} text={getSymbol(node.type)} />
          </Group>
        ))}

        {/* Render edges (cables) */}
        {Array.from(graphStore.edges.values()).map(edge => {
          const from = graphStore.nodes.get(edge.from);
          const to = graphStore.nodes.get(edge.to);
          return (
            <Line
              key={edge.id}
              points={[from.position.x, from.position.y, to.position.x, to.position.y]}
              stroke={getColorByCompliance(edge.properties)}
              strokeWidth={edge.properties.section ? edge.properties.section / 2 : 2}
            />
          );
        })}
      </Layer>
    </Stage>
  );
}
```

### **PHASE 2 : INTÉGRATION CALCUL (Jours 4-5)**

#### 2.1 Extracteur de paramètres

**Fichier : `src/functions/GraphParamsExtractor.ts`**

```typescript
export function extractCalculationParams(graphStore: GraphStore): CalculatorParams {
  // Parser le graphe → paramètres calcul

  // 1. Trouver la source (voltage, type)
  const sourceNode = Array.from(graphStore.nodes.values()).find(n => n.type === 'SOURCE');
  const voltage = sourceNode?.params.voltage || 230;

  // 2. Trouver tous les câbles critiques
  const cableEdges = Array.from(graphStore.edges.values()).filter(e => e.type.includes('CABLE'));

  // 3. Calculer courant total
  const receptors = Array.from(graphStore.nodes.values()).filter(n => n.type === 'RECEPTOR');
  const totalCurrent = receptors.reduce((sum, r) => sum + (r.params.current || 0), 0);

  return {
    voltage,
    current: totalCurrent,
    length: cableEdges[0]?.properties.length || 0,
    section: cableEdges[0]?.properties.section || 1.5,
    conductorType: cableEdges[0]?.type === 'CABLE_CU' ? 'copper' : 'aluminum',
    // ... autres paramètres
  };
}
```

### **PHASE 3 & 4 : Extensions + Alertes**

(Implémentations listées en section précédente)

---

## 🔗 POINTS D'INTÉGRATION GLOBAUX

### **Architecture composants :**

```tsx
<ApplicationRoot>
  <ElectricalSchemaBuilder>
    
    {/* Header */}
    <ToolBar
      templates={TEMPLATE_SCHEMAS}
      objectLibrary={OBJECT_LIBRARY}
      onTemplateSelect={loadTemplate}
    />

    {/* Main Canvas */}
    <div className="flex gap-4">
      <SchematicCanvas
        graphStore={graphStore}
        onNodeDrag={handleNodeDrag}
        onEdgeCreate={handleEdgeCreate}
      />

      {/* Right Panel */}
      <aside className="w-80 space-y-4">
        {/* Object Properties */}
        <ObjectPropertiesPanel selectedNode={selectedNode} />

        {/* Alerts */}
        <VCNGValidator snapshot={coherenceSnapshot} />
        {alerts.length > 0 && <AlertsPanel alerts={alerts} />}

        {/* Results */}
        {result && <ResultsPanel result={result} />}

        {/* Exports */}
        <ExportsPanel result={result} />
      </aside>
    </div>

    {/* Charts */}
    {result && <NormativeCharts result={result} />}

    {/* Modals */}
    {wizardOpen && <GuidedWizard />}
    {comparisonOpen && <ComparisonModal />}
  </ElectricalSchemaBuilder>
</ApplicationRoot>
```

---

## ✅ CHECKLIST D'IMPLÉMENTATION COMPLÈTE

### **PHASE 1 : Infrastructure graphique (Jours 1-3)**

**Infrastructure de base :**
- [ ] Créer `src/stores/GraphStore.ts` (état du graphe)
- [ ] Créer `src/constants/ObjectLibrary.ts` (catalogue objets normatifs)
- [ ] Créer `src/components/canvas/SchematicCanvas.tsx` (visualisation 2D)
- [ ] Installer dépendances : `npm install konva react-konva`
- [ ] Implémentation drag-drop (placement objets)
- [ ] Implémentation connexion câbles automatiques
- [ ] Calcul distances graphiques → longueurs

**Tests :**
- [ ] Test création nœud
- [ ] Test création arête / câble
- [ ] Test calcul distance automatique
- [ ] Test sérialisation graphe (pour hashing)

---

### **PHASE 2 : Intégration calcul (Jours 4-5)**

**Extraction paramètres :**
- [ ] Créer `src/functions/GraphParamsExtractor.ts`
- [ ] Parser graphe → paramètres calcul
- [ ] Validation cohérence graphe
- [ ] Mapping automatique

**Extensions 1 & 3 :**
- [ ] Créer `src/constants/templateSchemas.ts` (pré-schémas graphiques)
- [ ] Créer `src/components/dialogs/GuidedWizard.tsx` (7 étapes)
- [ ] UI template selector (graphe → canvas)
- [ ] Intégration wizard (construction guidée)

**Tests :**
- [ ] Test extraction paramètres
- [ ] Test application template
- [ ] Test wizard séquence

---

### **PHASE 3 : Visualisation & Alertes (Jours 6-7)**

**Extension 2 : Graphiques**
- [ ] Installer Recharts : `npm install recharts`
- [ ] Créer `src/components/charts/NormativeCharts.tsx`
- [ ] Graphique 1 : ΔU vs longueur
- [ ] Graphique 2 : Marge de conformité (jauge)
- [ ] Graphique 3 : Limite thermique
- [ ] Mise à jour temps réel

**Extension 6 : Alertes**
- [ ] Créer `src/hooks/useCalculationAlerts.ts`
- [ ] 4 niveaux alerte (marge, non-conforme, thermique, cumul)
- [ ] UI AlertsPanel avec couleurs normées
- [ ] Intégration déclenchement automatique

**Tests :**
- [ ] Test génération graphiques
- [ ] Test déclenchement alertes
- [ ] Test mise à jour en temps réel

---

### **PHASE 4 : Optimisation (Jours 8-9)**

**Extension 4 : Comparaison sections**
- [ ] Créer `src/functions/compareSections.ts`
- [ ] Logique teste sections normalisées
- [ ] Tableau résultats (3+ sections)
- [ ] Surbrillance première conforme

**Extension 5 : Mode de pose**
- [ ] Enrichir `src/constants/NormativeConstants.ts` (matrice Art. 523 complète)
- [ ] Créer `src/components/dialogs/InstallationModeSelector.tsx`
- [ ] Sélecteur interactif mode (A1-G)
- [ ] Calcul automatique facteurs thermiques

**Tests :**
- [ ] Test comparaison sections
- [ ] Test sélecteur mode installation
- [ ] Test facteurs thermiques

---

### **PHASE 5 : Verrou VCNG (Jour 10)**

**Système de cohérence global :**
- [ ] Créer `src/services/CoherenceVerifier.ts`
- [ ] Implémenter triple hashage (graphe + calculs + global)
- [ ] Créer `src/components/VCNGValidator.tsx` (affichage validation)
- [ ] Intégrer validation avant export/signature
- [ ] Impossibilité d'exporter si incohérence

**Tests :**
- [ ] Test hashage graphe
- [ ] Test hashage calculs
- [ ] Test détection incohérence
- [ ] Test blocage export

---

### **PHASE 6 : Déploiement (Jour 11)**

**Tests intégration**
- [ ] Test complet workflow (schéma → calcul → alertes → export)
- [ ] Test compatibility navigateurs
- [ ] Performance check (rendering 1000+ câbles)
- [ ] Test réactivité temps réel

**Documentation**
- [ ] Guide utilisateur schéma graphique
- [ ] Références normatives intégrées
- [ ] FAQ troubleshooting

**Build production**
- [ ] Audit linting (ESLint)
- [ ] Minification assets
- [ ] `npm run build`
- [ ] Vérification hash/signature électronique

**Déploiement**
- [ ] Git commit "PROD-READY: Plateforme graphique v1.0"
- [ ] Deployment production

---

## 📦 DÉPENDANCES COMPLÈTES

```bash
# Installation recommandée
npm install \
  konva react-konva \
  recharts \
  crypto-js \
  date-fns \
  lodash

# Dev dependencies  
npm install --save-dev \
  @types/konva \
  @types/recharts \
  vitest \
  @testing-library/react
```

---

## 🎯 POINTS CLÉS FINAUX

✅ **Aucune modification moteur normatif existant**  
✅ **Architecture modulaire et extensible**  
✅ **Graphe = source unique de vérité**  
✅ **Tous les objets normés (références Article)**  
✅ **Triple hashage (VCNG) = traçabilité absolue**  
✅ **Audit-proof et opposable à un bureau de contrôle**  
✅ **UI progressive (templates → canvas → calculs → alerts)**  
✅ **Signature électronique certifiable**  
✅ **Prêt pour NF C 15-100 + NS 01-001 compliance**  

---

## 🏁 CONCLUSIONS

Tu n'as pas demandé :
- ❌ Un calculateur formulaire
- ❌ Une UI classique

Tu as défini :
- ✅ **Une plateforme logicielle structurée normatif**
- ✅ **Basée sur un schéma graphique intelligent**
- ✅ **Avec traçabilité cryptographique garantie**
- ✅ **Et audit-proof pour contexte réglementaire**

Ce document est une **spécification officielle de produit**, exécutable par une IA d'ingénierie logicielle avancée.

**État :** 🚀 **PRÊT POUR DÉVELOPPEMENT**

---

**Document généré par :** Code Architecture Agent  
**Date:** 24 janvier 2026  
**Version:** 2.0 MAÎTRE (Fusionné + VCNG)

