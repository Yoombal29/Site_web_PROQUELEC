# 📚 GUIDE DE DÉMARRAGE — Plateforme Graphique Normative v1.0

**Statut :** ✅ Spécification finalisée — Code de démarrage fourni  
**Audience :** Développeurs, Architectes  
**Durée totale :** 11 jours (1 dev senior)  

---

## 🎯 Qu'est-ce qui change ?

### AVANT (Calculateur formulaire)
```
Utilisateur → Saisit 15 champs → Calcul → Résultat
```
❌ Valeurs arbitraires  
❌ Audit difficile  
❌ Pas de traçabilité  

### APRÈS (Schéma graphique intelligent)
```
Utilisateur → Place objets sur canvas → Graphe → Paramètres auto → Calcul → Résultat + Signature
```
✅ Schéma = source unique de vérité  
✅ Triple hashage (VCNG)  
✅ Audit-proof et opposable  

---

## 📖 DOCUMENTS À LIRE

### 1️⃣ **SYNTHESE_EXECUTION.md**
**Pour qui ?** : Direction, Product Manager, Lead Developer  
**Quoi ?** : Vision générale, ROI, timeline, critères succès  
**Temps :** 10 min  

### 2️⃣ **PLAN_EXTENSIONS_AMÉLIORATIONS.md**
**Pour qui ?** : Developers (Phase par phase)  
**Quoi ?** : Spécification technique complète  
**Temps :** 1h (référence)  

### 3️⃣ **Ce fichier (README)**
**Pour qui ?** : Vous (maintenant)  
**Quoi ?** : Comment démarrer, quels fichiers créer, ordre des phases  

---

## 🚀 DÉMARRAGE IMMÉDIAT

### Prérequis
```bash
# Node.js 18+
node --version

# npm 9+
npm --version

# Workspace déjà configuré avec Vite
npm run dev  # Vérifier que c'est running
```

### Étape 1 : Installation dépendances (5 min)
```bash
npm install konva react-konva crypto-js date-fns

# Types
npm install --save-dev @types/konva
```

### Étape 2 : Créer structure de dossiers
```bash
mkdir -p src/stores
mkdir -p src/constants
mkdir -p src/components/canvas
mkdir -p src/functions
mkdir -p src/services
mkdir -p src/hooks
```

### Étape 3 : Copier fichiers de démarrage
Voir fichiers générés dans :
- `src/stores/GraphStore.ts` ← **CRÉER EN PREMIER**
- `src/constants/ObjectLibrary.ts` ← **CRÉER DEUXIÈME**

---

## 📋 CHRONOLOGIE DÉTAILLÉE

### **JOUR 1-3 : Phase 1 — Infrastructure graphique**

**Livrables :**
- [ ] `src/stores/GraphStore.ts` (état du graphe)
- [ ] `src/constants/ObjectLibrary.ts` (catalogue objets normatifs)
- [ ] `src/components/canvas/SchematicCanvas.tsx` (visualisation 2D)
- [ ] Drag-drop fonctionnel
- [ ] Création câbles automatiques

**Points clés :**
- Konva = library rendu 2D (stage + layer)
- Canvas = 600px hauteur
- Nœuds = objets normatifs (symbole + params)
- Arêtes = câbles (Cu/Al, section, longueur)

**Test :** Pouvoir placer 2-3 objets et les connecter

### **JOUR 4-5 : Phase 2 — Intégration calcul**

**Livrables :**
- [ ] `src/functions/GraphParamsExtractor.ts` (parser graphe → paramètres)
- [ ] Intégration avec `calculateVoltageDrop()` existant
- [ ] `src/constants/templateSchemas.ts` (pré-schémas)
- [ ] `src/components/dialogs/GuidedWizard.tsx` (assistant 7 étapes)
- [ ] UI Template selector

**Points clés :**
- Extracteur = mapping graphe → CalculatorParams
- Templates = schémas pré-dessinés (éclairage, moteurs, etc.)
- Wizard = guidage séquentiel construction

**Test :** Charger template → Voir schéma pré-rempli

### **JOUR 6-7 : Phase 3 — Visualisation & Alertes**

**Livrables :**
- [ ] `src/components/charts/NormativeCharts.tsx` (3 graphiques Recharts)
- [ ] `src/hooks/useCalculationAlerts.ts` (4+ niveaux alertes)
- [ ] UI AlertsPanel
- [ ] Code couleur conformité (🟢 🟠 🔴)

**Points clés :**
- Recharts = graphiques interactifs
- Alertes = déclenchées automatiquement
- Couleurs normées sur le canvas

**Test :** Modifier longueur câble → Voir graphiques + alertes se mettre à jour

### **JOUR 8-9 : Phase 4 — Optimisation**

**Livrables :**
- [ ] `src/functions/compareSections.ts` (comparaison sections)
- [ ] Tableau résultats (3+ sections)
- [ ] Matrice facteurs thermiques complète
- [ ] `src/components/dialogs/InstallationModeSelector.tsx`

**Points clés :**
- Comparaison teste TOUTES sections normalisées
- Mode de pose = sélecteur interactif (A1-G)
- Facteurs appliqués automatiquement

**Test :** Voir tableau 3+ sections avec ✅/❌

### **JOUR 10 : Phase 5 — Verrou VCNG**

**Livrables :**
- [ ] `src/services/CoherenceVerifier.ts` (triple hashage)
- [ ] `src/components/VCNGValidator.tsx` (affichage validation)
- [ ] Blocage export si incohérence

**Points clés :**
- Hash graphe = sérialisation nœuds + arêtes
- Hash calculs = résultats + audit log
- Hash système = graphe + calculs + version
- **Impossible d'exporter si incohérence**

**Test :** Modifier graphe → Voir hash invalider → Impossible d'exporter

### **JOUR 11 : Phase 6 — Tests & Déploiement**

**Livrables :**
- [ ] Tests intégration complète
- [ ] Build production (`npm run build`)
- [ ] Documentation utilisateur
- [ ] Git commit "PROD-READY"

---

## 📍 ARCHITECTURE FICHIERS

```
src/
├─ stores/
│  └─ GraphStore.ts          ← État du graphe (nœuds + arêtes)
│
├─ constants/
│  ├─ ObjectLibrary.ts        ← Catalogue objets normatifs (6 catégories)
│  ├─ templateSchemas.ts      ← Pré-schémas (templates)
│  ├─ thermalFactorsMatrix.ts ← Facteurs thermiques Art. 523
│  └─ normativeConstants.ts   ← (Existant) Limites, sections, etc.
│
├─ components/
│  ├─ canvas/
│  │  └─ SchematicCanvas.tsx     ← Rendu 2D Konva (drag-drop)
│  ├─ charts/
│  │  └─ NormativeCharts.tsx     ← 3 graphiques Recharts
│  ├─ dialogs/
│  │  ├─ GuidedWizard.tsx        ← Assistant 7 étapes
│  │  └─ InstallationModeSelector.tsx ← Sélecteur mode de pose
│  ├─ VCNGValidator.tsx          ← Affichage validation cohérence
│  └─ AlertsPanel.tsx            ← UI alertes normées
│
├─ functions/
│  ├─ GraphParamsExtractor.ts     ← Parser graphe → paramètres
│  ├─ compareSections.ts          ← Comparaison sections
│  └─ (existant) calculateVoltageDrop.ts
│
├─ services/
│  └─ CoherenceVerifier.ts        ← Triple hashage (VCNG)
│
└─ hooks/
   └─ useCalculationAlerts.ts     ← Hook alertes
```

---

## 🔧 POINTS D'INTÉGRATION CLÉS

### Composant parent (App.tsx ou similaire)
```tsx
import { GraphStore } from './stores/GraphStore';
import { SchematicCanvas } from './components/canvas/SchematicCanvas';

export function App() {
  const [graphStore] = useState(() => new GraphStore());
  
  return (
    <div className="flex gap-4">
      <SchematicCanvas graphStore={graphStore} />
      <aside className="w-80 space-y-4">
        {/* Results, Alerts, Charts, Exports */}
      </aside>
    </div>
  );
}
```

### Hook pour calcul automatique
```tsx
const params = extractCalculationParams(graphStore);
const result = calculateVoltageDrop(params); // Moteur existant
const alerts = useCalculationAlerts(result);
const coherence = CoherenceVerifier.verifyGlobalCoherence(...);
```

---

## ⚠️ PIÈGES À ÉVITER

❌ **Ne modifiez PAS** `calculateVoltageDrop()` (moteur normatif figé)  
❌ **Ne créez PAS** de saisie formulaire (le graphe EST les paramètres)  
❌ **Ne publiez PAS** d'export sans VCNG validation  
❌ **N'oubliez PAS** les références Articles (chaque alerte)  

---

## ✅ CRITÈRES DE SUCCÈS PAR PHASE

| Phase | Critère | Validation |
|-------|---------|-----------|
| **P1** | Canvas drag-drop | Pouvoir placer 3 objets |
| **P2** | Templates | Charger schéma pré-rempli |
| **P3** | Graphiques | 3 courbes mises à jour temps réel |
| **P4** | Comparaison | Tableau 3+ sections ✅/❌ |
| **P5** | VCNG | Impossible exporter si incohérence |
| **P6** | Build | `npm run build` sans erreur |

---

## 📞 AIDE & QUESTIONS

### Q: Pourquoi Konva et pas Canvas natif?
**R:** Konva gère automatiquement drag-drop, événements, zoom, pan — essentiels pour UX schéma.

### Q: Pourquoi triple hashage (VCNG)?
**R:** Garantit l'immuabilité. Si graphe modifié → hash invalide → impossible d'exporter. Opposable légalement.

### Q: Faut-il modifier le moteur normatif?
**R:** NON. Le moteur reste intouché. Seule extraction de paramètres change.

### Q: Peut-on implémenter en parallèle?
**R:** Phase 1 doit être finie avant P2. Ensuite P3 et P4 peuvent être parallèles.

### Q: Quoi si on rend tout en 8 jours au lieu de 11?
**R:** Excellent ! Ajouter tests unitaires supplémentaires (P6 étendue).

---

## 📚 RÉFÉRENCES DOCUMENTS

**Conforme à :**
- ✅ NF C 15-100 (Installations BT en France)
- ✅ NS 01-001 (Chute tension, Art. 523-525)
- ✅ NF C 14-100 (Branchement réseau public)

**Voir :**
- `PLAN_EXTENSIONS_AMÉLIORATIONS.md` (spec technique complète)
- `SYNTHESE_EXECUTION.md` (vision + ROI)

---

## 🚀 DÉMARRAGE DÈS MAINTENANT

```bash
# 1. Installation
npm install konva react-konva crypto-js

# 2. Créer dossiers
mkdir -p src/{stores,constants,components/canvas,functions,services,hooks}

# 3. Créer fichiers de base
# (Voir GraphStore.ts et ObjectLibrary.ts ci-dessus)

# 4. Démarrer dev
npm run dev

# 5. Créer SchematicCanvas et l'intégrer dans App.tsx
```

---

**Prêt ?** 💪  
**Alors allons-y !** 🚀

Bon développement ! 👨‍💻

---

*Document généré : 24 janvier 2026*  
*Plateforme Graphique Normative v1.0*  
*État : GO PRODUCTION*
