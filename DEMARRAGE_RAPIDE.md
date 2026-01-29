# 🚀 DÉMARRAGE RAPIDE — 4 étapes pour intégration

## Session du 25 janvier 2026

---

## ⚡ TL;DR (30 secondes)

**Tu as 18 fichiers nouveaux prêts à l'emploi.**  
**Il faut 2 étapes simples pour les activer :**

1. Appeler `initializeRubriques()` au démarrage
2. Ajouter route `/rubrique-selector`

**Durée :** 15 minutes  
**Complexité :** Très simple

---

## 📋 Checklist rapide

- [ ] Lire cette page (5 min)
- [ ] Appeler bootstrap (2 min)
- [ ] Ajouter route (5 min)
- [ ] Tester dans le navigateur (3 min)
- [ ] ✅ Prêt !

---

## 🎯 Étape 1 : Bootstrap (2 min)

### Localisation
`src/main.tsx` OU `src/App.tsx`

### Code à ajouter

**Option A : Dans main.tsx**

```typescript
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeRubriques } from '@/bootstrap/initializeRubriques'

// 👇 Ajoute cette ligne
initializeRubriques()

createRoot(document.getElementById('root')!).render(
  <App />
)
```

**Option B : Dans App.tsx (avec useEffect)**

```typescript
import { useEffect } from 'react'
import { initializeRubriques } from '@/bootstrap/initializeRubriques'

export function App() {
  useEffect(() => {
    initializeRubriques()  // 👈 Ajoute ceci
  }, [])
  
  return (
    // ... ton code
  )
}
```

### Vérification
```bash
# Démarre le dev server
npm run dev

# Ouvre la console du navigateur (F12)
# Tu devrais voir :
# ✅ 1 rubrique(s) enregistrée(s) : VOLTAGE_DROP
```

---

## 🎯 Étape 2 : Ajouter route (5 min)

### Localisation
`src/App.tsx` (là où sont tes routes)

### Code à ajouter

```typescript
// Importe le composant
import RubriqueSelectorPage from '@/pages/RubriqueSelectorPage'

// Dans ton routeur, ajoute la route
<Route path="/rubrique-selector" element={<RubriqueSelectorPage />} />
```

### Exemple complet (React Router v6)

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RubriqueSelectorPage from '@/pages/RubriqueSelectorPage'
import SchemaBuilder from '@/pages/SchemaBuilder'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* 👇 Ajoute cette route */}
        <Route 
          path="/rubrique-selector" 
          element={<RubriqueSelectorPage />} 
        />
        
        <Route 
          path="/schema-builder" 
          element={<SchemaBuilder />} 
        />
        
        {/* ... autres routes */}
      </Routes>
    </BrowserRouter>
  )
}
```

### Vérification
```bash
# Naviguer vers :
http://localhost:5173/rubrique-selector

# Tu devrais voir une page avec :
# - Titre "Sélectionner une rubrique"
# - 1 carte : "📐 Calcul de Chute de Tension"
# - Bouton "🚀 Démarrer l'éditeur"
```

---

## 🎯 Étape 3 : Adapter SchemaBuilder (optionnel pour phase 1)

### Pour plus tard (après que les 2 premières étapes fonctionnent)

Quand tu cliques "🚀 Démarrer l'éditeur" sur la page sélecteur, il navigue vers :
```
/schema-builder?rubrique=VOLTAGE_DROP
```

Pour l'instant, ton SchemaBuilder ignorera le paramètre et utilisera la rubrique par défaut.

**À faire plus tard :**
1. Lis `RUBRIQUES_INTEGRATION_CHECKLIST.md` (phase 3)
2. Ajoute extraction du paramètre `rubrique` dans SchemaBuilder
3. Passe-le au canvas pour utiliser ses couleurs et validations

---

## ✅ Étape 4 : Tester (3 min)

### Test 1 : Bootstrap enregistré

```bash
# F12 pour ouvrir console
# Cherche : "✅ 1 rubrique(s) enregistrée(s)"
# Succès ✅ si tu le vois
```

### Test 2 : Route accessible

```bash
# Va à : http://localhost:5173/rubrique-selector
# Tu devrais voir la page du sélecteur
# Succès ✅ si elle charge
```

### Test 3 : Sélection fonctionne

```bash
# Clique sur la carte "Calcul de Chute de Tension"
# Elle doit s'illuminer avec checkmark
# Succès ✅ si la sélection marche
```

### Test 4 : Navigation fonctionne

```bash
# Clique "🚀 Démarrer l'éditeur"
# Tu devrais être redirigé vers /schema-builder?rubrique=VOLTAGE_DROP
# Succès ✅ si la navigation marche
```

---

## 🎁 Bonus : Ajouter un lien dans le menu

### Localisation
`src/components/Navigation.tsx` (ou où tu as ton menu)

### Code

```typescript
<nav>
  <Link to="/">Accueil</Link>
  <Link to="/rubrique-selector">Sélectionner une rubrique</Link>  {/* 👈 Ajoute */}
  <Link to="/schema-builder">Éditeur</Link>
</nav>
```

---

## 📚 Fichiers impliqués (lire dans cet ordre)

1. **src/bootstrap/initializeRubriques.ts** (fonction simple, 40 lignes)
2. **src/pages/RubriqueSelectorPage.tsx** (composant UI, 200 lignes)
3. **src/types/Rubrique.ts** (types avancés, optionnel pour phase 1)
4. **RUBRIQUES_INTEGRATION_CHECKLIST.md** (pour phase suivante)

---

## 🐛 Si ça ne marche pas

### Erreur : "Cannot find module '@/bootstrap/initializeRubriques'"
```
❌ Problème : Chemin incorrect
✅ Solution : Vérifier tsconfig.paths (@ doit pointer vers src/)
```

### Erreur : "RubriqueSelectorPage is not defined"
```
❌ Problème : Import oublié
✅ Solution : Ajouter import au début de App.tsx
  import RubriqueSelectorPage from '@/pages/RubriqueSelectorPage'
```

### Console : Rien n'apparaît avec initializeRubriques
```
❌ Problème : fonction jamais appelée
✅ Solution : Vérifier qu'elle est appelée dans main.tsx ou App.tsx useEffect
```

### Route /rubrique-selector donne 404
```
❌ Problème : Route non enregistrée
✅ Solution : Vérifier route dans App.tsx avec bon composant
```

---

## ⏱️ Temps estimé par étape

| Étape | Temps | Difficulté |
|-------|-------|-----------|
| Lire ce guide | 5 min | Très facile |
| Bootstrap | 2 min | Très facile |
| Route | 5 min | Très facile |
| Tester | 3 min | Très facile |
| **TOTAL** | **15 min** | **Très facile** |

---

## 🎯 Après l'intégration rapide

**Phase 1 (juste intégration) :** ✅ FAIT (15 min)

**Phase 2 (adapter le canvas) :** À faire plus tard (1-2h)
- Lis : `RUBRIQUES_INTEGRATION_CHECKLIST.md` section "Phase 3"
- Ajoute : Paramètre rubrique au canvas
- Applique : Couleurs/validations de la rubrique

**Phase 3 (nouvelles rubriques) :** À faire après
- Copie : `UnifilaireRubrique.template.ts`
- Implémente : Les 5 méthodes principales
- Teste : Avec le sélecteur

---

## 📖 Références rapides

| Besoin | Document |
|--------|----------|
| Configuration complète | `ARCHITECTURE_RUBRIQUES.md` |
| Guide pratique | `RUBRIQUES_IMPLEMENTATION_GUIDE.md` |
| Checklist détaillée | `RUBRIQUES_INTEGRATION_CHECKLIST.md` |
| Exemple code | `src/rubriques/VoltageDropRubrique.ts` |
| Types | `src/types/Rubrique.ts` |
| Template | `src/rubriques/UnifilaireRubrique.template.ts` |

---

## ✨ Résumé

| Quoi | Fichier |
|------|---------|
| Bootstrap | `src/bootstrap/initializeRubriques.ts` |
| Sélecteur | `src/pages/RubriqueSelectorPage.tsx` |
| Types | `src/types/Rubrique.ts` |
| Registre | `src/services/RubriqueRegistry.ts` |
| Rubrique 1 | `src/rubriques/VoltageDropRubrique.ts` |
| Template 2 | `src/rubriques/UnifilaireRubrique.template.ts` |

**Tous les fichiers sont prêts à l'emploi.**  
**Aucune modification supplémentaire nécessaire.**  
**Juste 2 imports + 1 route à ajouter.**

---

## 🚀 Let's go !

```typescript
// 1️⃣ main.tsx
import { initializeRubriques } from '@/bootstrap/initializeRubriques'
initializeRubriques()

// 2️⃣ App.tsx
import RubriqueSelectorPage from '@/pages/RubriqueSelectorPage'
<Route path="/rubrique-selector" element={<RubriqueSelectorPage />} />

// 3️⃣ Test
http://localhost:5173/rubrique-selector

// ✅ C'est tout !
```

---

**Status :** 🟢 PRÊT POUR INTÉGRATION IMMÉDIATE  
**Durée :** 15 minutes maximum  
**Difficulté :** Très facile  
**Date :** 25 janvier 2026
