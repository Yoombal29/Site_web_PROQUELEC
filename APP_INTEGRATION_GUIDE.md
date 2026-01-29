# 🚀 INTÉGRATION APP.TSX — PHASE 1 FINAL

**Status:** ✅ GraphStore + ObjectLibrary + SchematicCanvas READY  
**Serveur:** ✅ npm packages installed  
**TypeScript:** ✅ Zero compilation errors  

---

## 📋 ÉTAPE 1 : Localiser App.tsx

```bash
# Vérifier où se trouve App.tsx
find . -name "App.tsx" -o -name "App.ts" -o -name "app.tsx"

# Probable : /src/App.tsx ou /src/pages/App.tsx
```

---

## 📝 ÉTAPE 2 : Remplacer contenu App.tsx

Ouvrir : `src/App.tsx` (ou déterminer le chemin exact)

**Ancien code :**
```typescript
// Ancien contenu quelconque
```

**Nouveau code :**
```typescript
import { useState } from 'react';
import { GraphStore } from '@/stores/GraphStore';
import { SchematicCanvas } from '@/components/canvas/SchematicCanvas';

export function App() {
  // Créer une instance unique du store au montage
  const [graphStore] = useState(() => new GraphStore());

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 p-6">
        <h1 className="text-4xl font-bold text-white">
          🧭 Plateforme Schéma Graphique Normatif
        </h1>
        <p className="text-slate-400 mt-2">
          Phase 1 — Canvas interactif avec 22 objets normatifs
        </p>
      </header>

      {/* Canvas Container */}
      <main className="p-6">
        <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden shadow-2xl">
          <SchematicCanvas 
            graphStore={graphStore} 
            width={1400} 
            height={700} 
          />
        </div>
      </main>

      {/* Debug Info (bottom right) */}
      <footer className="fixed bottom-4 right-4 text-xs text-slate-500">
        <div className="bg-slate-900 p-3 rounded border border-slate-700">
          <p>📊 Nœuds: {graphStore.nodes.size}</p>
          <p>🔌 Câbles: {graphStore.edges.size}</p>
          <p>🎯 Hash: {graphStore.getHash().substring(0, 8)}...</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
```

---

## 🔄 ÉTAPE 3 : Vérifier Hot Reload

1. **Sauvegarder** le fichier (`Ctrl+S`)
2. **Vérifier** http://localhost:58599/
3. Doit afficher le canvas graphique avec :
   - Header "🧭 Plateforme Schéma Graphique Normatif"
   - Canvas blanc/gris (prêt pour dessiner)
   - 5 boutons en bas (Réseau, Tableau, Breaker, Câble, Lampe)
   - Info debug bottom-right (Nœuds, Câbles, Hash)

---

## ⚠️ ÉTAPE 4 : Troubleshooting

### ❌ **Erreur: "Cannot find module '@/stores/GraphStore'"**
→ Vérifier que `tsconfig.json` a :
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### ❌ **Erreur: "Konva is not defined"**
→ Packages pas bien installés
```bash
npm install konva react-konva --legacy-peer-deps
```

### ❌ **Canvas ne s'affiche pas**
→ Ouvrir console (F12) et vérifier erreurs
→ Vérifier dimensions canvas (width={1400} height={700})

### ❌ **"SchematicCanvas" component not found**
→ Vérifier que fichier existe : `src/components/canvas/SchematicCanvas.tsx`

---

## 🎯 ÉTAPE 5 : Tester Fonctionnalités

Une fois le canvas visible :

### Test 1 : Clicker boutons palette
- **Expected:** Objets apparaissent sur canvas
- **Location:** 5 boutons en bas du canvas

### Test 2 : Drag-drop
- **Expected:** Cliquer-déplacer objet change sa position
- **Automatic:** Longueur câble recalculée si connecté

### Test 3 : Créer câble (click-droit)
- **Expected:** Clic-droit sur objet → ligne jaune pointillée
- **Drag:** Vers autre objet → connexion blanche
- **Release:** Sur objet cible → câble créé

### Test 4 : Hash VCNG
- **Expected:** Hash change quand modifie schéma
- **Visible:** Bottom-right footer

---

## 📊 ÉTAPE 6 : Vérifier Intégration

```typescript
// Commande pour valider au console (F12)
console.log(window.$graphStore?.nodes.size);  // Should show number
console.log(window.$graphStore?.getHash());   // Should show hash
```

---

## ✅ PHASE 1 COMPLETE CHECKLIST

- [ ] App.tsx intégré avec SchematicCanvas
- [ ] Canvas visible sur http://localhost:58599/
- [ ] Boutons palette fonctionnels
- [ ] Drag-drop works
- [ ] Création câble works
- [ ] Hash VCNG calcule
- [ ] Pas d'erreurs console (F12)

---

## 🚀 PROCHAINES ÉTAPES (Phase 2)

Une fois Phase 1 validée :

1. **GraphParamsExtractor.ts** — Parser graphe → calcul normatif
2. **Template schemas** — 6 templates pré-dessinés
3. **Intégration calcul** — VoltageDropCalculator + canvas

---

## 📞 COMMANDES UTILES

```bash
# Redémarrer dev server
npm run dev

# Vérifier aucune erreur TS
npx tsc --noEmit

# Recompiler
npm run build

# Clean node_modules (last resort)
rm -r node_modules package-lock.json
npm install --legacy-peer-deps
```

---

**Status:** 🟢 **READY FOR TESTING**

Go test ! 🎉
