# ✅ CHECKLIST — INTÉGRATION ARCHITECTURE RUBRIQUES

## 📋 Pour que le système fonctionne end-to-end, les étapes suivantes doivent être complétées :

---

## Phase 1 : Bootstrap ✅

- [ ] **Appeler `initializeRubriques()` au démarrage**
  - Location : `src/main.tsx` ou `src/App.tsx`
  - Code :
    ```typescript
    import initializeRubriques from '@/bootstrap/initializeRubriques';
    
    // Dans useEffect(() => { ... }, [])
    initializeRubriques();
    ```

- [ ] **Vérifier les logs console**
  - Doit afficher : `✅ 1 rubrique(s) enregistrée(s)`
  - Doit lister : `📐 Calcul de Chute de Tension (STABLE)`

---

## Phase 2 : Navigation 🔄

- [ ] **Ajouter la route du sélecteur**
  - Location : `src/App.tsx`
  - Code :
    ```typescript
    import RubriqueSelectorPage from '@/pages/RubriqueSelectorPage';
    
    <Route path="/rubrique-selector" element={<RubriqueSelectorPage />} />
    ```

- [ ] **Rediriger vers le sélecteur au démarrage**
  - Location : Home page ou App default route
  - Code : `navigate('/rubrique-selector')`

- [ ] **Bouton de navigation principal**
  - Location : Header ou menu
  - Texte : "📐 Créer un schéma" → `/rubrique-selector`

---

## Phase 3 : Adapter SchematicCanvas 🎨

- [ ] **Récupérer le paramètre `rubrique` de l'URL**
  - Location : `src/pages/SchemaBuilder.tsx`
  - Code :
    ```typescript
    const searchParams = new URLSearchParams(location.search);
    const rubriqueId = searchParams.get('rubrique') || 'VOLTAGE_DROP';
    const rubrique = rubriqueRegistry.get(rubriqueId);
    ```

- [ ] **Passer la rubrique à SchematicCanvas**
  - Props : `rubrique: RubriqueSchema`

- [ ] **Charger dynamiquement la bibliothèque d'objets**
  - Location : `SchematicCanvas.tsx` - `getAvailableObjects()`
  - Code :
    ```typescript
    const availableObjects = rubrique.getAvailableObjects();
    // Utiliser pour les boutons de la palette
    ```

- [ ] **Appliquer les validations spécifiques**
  - Location : Lors de la sauvegarde/calcul
  - Code :
    ```typescript
    const validation = rubrique.validateGraph(graph);
    if (!validation.isValid) { ... }
    ```

- [ ] **Utiliser le moteur de calcul de la rubrique**
  - Location : Bouton "Calculer"
  - Code :
    ```typescript
    const result = rubrique.calculate(graph);
    const report = rubrique.generateReport(result, graph);
    ```

---

## Phase 4 : Intégration UI 🖌️

- [ ] **Afficher le nom de la rubrique active**
  - Location : Header de SchematicCanvas
  - Texte : `🔴 Calcul de Chute de Tension`

- [ ] **Afficher les références normatives**
  - Location : Sidebar ou panel info
  - Source : `rubrique.normativeReferences`

- [ ] **Afficher le statut de la rubrique**
  - Location : Badge en haut
  - Texte : `STABLE` / `BETA` / `ALPHA`

- [ ] **Bouton "Revenir au sélecteur"**
  - Location : Top-left
  - Code : `navigate('/rubrique-selector')`

---

## Phase 5 : Validations 🧪

- [ ] **Vérifier que la Rubrique 1 fonctionne**
  - Steps :
    1. Navigate to `/rubrique-selector`
    2. Click "📐 Calcul de Chute de Tension"
    3. Click "🚀 Démarrer l'éditeur"
    4. Verify SchematicCanvas loads with voltage drop colors
    5. Create some objects and cables
    6. Check console for no errors

- [ ] **Vérifier les logs de bootstrap**
  - Console : `✅ Rubrique VOLTAGE_DROP enregistrée`
  - Console : `🚀 Rubrique VOLTAGE_DROP initialisée`

- [ ] **Vérifier les imports de types**
  - No TypeScript errors in console
  - All imports resolve correctly

---

## Phase 6 : Préparer Phase 2 (Rubrique 2) 📋

- [ ] **Décommenter le template Unifilaire**
  - Location : `src/rubriques/UnifilaireRubrique.template.ts`
  - Renommer : → `UnifilaireRubrique.ts`

- [ ] **Enregistrer dans bootstrap**
  - Location : `src/bootstrap/initializeRubriques.ts`
  - Code :
    ```typescript
    import { RUBRIQUE_UNIFILAIRE } from '@/rubriques/UnifilaireRubrique';
    rubriqueRegistry.register(RUBRIQUE_UNIFILAIRE);
    ```

- [ ] **Vérifier que les 2 rubriques apparaissent**
  - Console : `✅ 2 rubrique(s) enregistrée(s)`
  - UI : Afficher 2 cartes dans le sélecteur

---

## 🚀 Commandes utiles

### Vérifier qu'il n'y a pas d'erreurs TypeScript
```bash
npm run type-check
# ou
npx tsc --noEmit
```

### Lancer le dev server
```bash
npm run dev
```

### Vérifier les logs
```
Console → Ctrl+Shift+J (DevTools)
Filter: "rubrique", "Rubrique", "✅"
```

---

## ⚠️ Problèmes courants et solutions

### Problème : "Cannot find module Rubrique"
**Solution :** Vérifier l'import path
```typescript
import type { RubriqueSchema } from '@/types/Rubrique'; // ✅
import type { RubriqueSchema } from './types/Rubrique'; // ❌
```

### Problème : "rubriqueRegistry is not defined"
**Solution :** S'assurer que `initializeRubriques()` est appelé avant utilisation
```typescript
// Dans main.tsx ou App.tsx
useEffect(() => {
  initializeRubriques(); // ✅ Appeler une seule fois
}, []);
```

### Problème : Le sélecteur n'affiche qu'une rubrique
**Solution :** Enregistrer toutes les rubriques dans bootstrap
```typescript
rubriqueRegistry.register(RUBRIQUE_VOLTAGE_DROP);
rubriqueRegistry.register(RUBRIQUE_UNIFILAIRE); // Ajouter
rubriqueRegistry.register(RUBRIQUE_PROTECTION); // Ajouter
```

### Problème : SchematicCanvas ne change pas selon la rubrique
**Solution :** Passer la rubrique en props et l'utiliser
```typescript
<SchematicCanvas rubrique={rubrique} ... />
```

---

## 📊 Checklist de validation finale

| Étape | ✅ Fait | 📝 Note |
|-------|--------|--------|
| Bootstrap appelé | [ ] | Logs : `✅ Rubrique...` |
| Route `/rubrique-selector` ajoutée | [ ] | Accessible en navigation |
| Page du sélecteur affiche rubriques | [ ] | 1+ rubriques visibles |
| SchematicCanvas reçoit rubrique | [ ] | Props passées correctement |
| Objets chargés depuis rubrique | [ ] | Palette d'objets mise à jour |
| Validations appliquées | [ ] | Errors affichées correctement |
| Calculs lancés | [ ] | Résultats affichés |
| Pas d'erreurs TypeScript | [ ] | `npm run type-check` ✅ |
| Pas d'erreurs console | [ ] | DevTools propre |
| UX fluide | [ ] | Navigation smooth |

---

## 🎯 État du déploiement

**Status ACTUEL :** 🟢 PRÊT POUR INTÉGRATION

Les fichiers sont créés et testés TypeScript. Il reste à :
1. Appeler `initializeRubriques()` au démarrage
2. Ajouter la route du sélecteur
3. Adapter SchematicCanvas pour utiliser la rubrique
4. Tester end-to-end

**Effort estimé :** 2-4 heures pour une IA ou dev junior

---

## 📞 Support

Pour toute question sur l'architecture :
- 📖 Lire [`ARCHITECTURE_RUBRIQUES.md`](ARCHITECTURE_RUBRIQUES.md)
- 🧩 Voir [`RUBRIQUES_IMPLEMENTATION_GUIDE.md`](RUBRIQUES_IMPLEMENTATION_GUIDE.md)
- 💻 Examiner [`src/rubriques/VoltageDropRubrique.ts`](src/rubriques/VoltageDropRubrique.ts) comme exemple

---

**Date :** 25 janvier 2026
**Auteur :** Architecture modulaire PROQUELEC
**Version :** 1.0.0
