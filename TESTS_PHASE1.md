# ✅ TESTS PHASE 1 — Checklist de validation

**Date :** 25 janvier 2026  
**Objectif :** Valider que Phase 1 est fonctionnelle  

---

## 🧪 TEST 1 : GraphStore fonctionne

```bash
# Dans console VS Code (console developer)
# Ouvrir http://localhost:58599

# Teste :
import { GraphStore } from '@/stores/GraphStore';
const gs = new GraphStore();

// Créer nœud
gs.addNode({
  id: 'test-1',
  type: 'SOURCE',
  position: { x: 100, y: 100 },
  params: { voltage: 230 },
  metadata: { createdAt: Date.now(), modifiedAt: Date.now() }
});

console.log('Nœuds :', gs.nodes.size); // Doit afficher 1
console.log('Hash :', gs.getHash()); // Doit afficher hash SHA256

// ✅ Si tu vois 1 nœud et un hash → SUCCÈS
```

---

## 🎨 TEST 2 : SchematicCanvas affiche

**À faire :**
1. Ouvrir fichier App.tsx (racine du projet)
2. Remplacer contenu par :

```typescript
import { useState } from 'react';
import { GraphStore } from '@/stores/GraphStore';
import { SchematicCanvas } from '@/components/canvas/SchematicCanvas';

export function App() {
  const [graphStore] = useState(() => new GraphStore());

  return (
    <div className="p-4 bg-slate-950 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-4">
        🧭 Schéma Électrique Normatif — Phase 1
      </h1>
      <SchematicCanvas 
        graphStore={graphStore} 
        width={1200}
        height={600}
      />
    </div>
  );
}

export default App;
```

3. Sauvegarder
4. Vérifier http://localhost:58599/

**Attendu :**
- ✅ Canvas bleu foncé
- ✅ 5 boutons au bas (Source, TGBT, Disjoncteur, Éclairage, Prises)
- ✅ Info de nœuds/câbles

---

## 🖱️ TEST 3 : Ajouter objets

**Procédure :**
1. Cliquer bouton "⚡ Source"
   - ✅ Cercle bleu apparaît au centre
   - ✅ Compteur passe à "Nœuds: 1"

2. Cliquer bouton "□ TGBT"
   - ✅ Deuxième cercle apparaît
   - ✅ Compteur passe à "Nœuds: 2"

3. Cliquer bouton "💡 Éclairage"
   - ✅ Troisième cercle
   - ✅ Compteur "Nœuds: 3"

---

## ✏️ TEST 4 : Drag-drop

**Procédure :**
1. Placer 2 objets (Source + TGBT)
2. Cliquer-glisser un des cercles
   - ✅ Le cercle se déplace en temps réel
   - ✅ Hash change
   - ✅ Compteur updated

---

## 🔌 TEST 5 : Créer câbles

**Procédure :**
1. Placer Source + TGBT
2. Clic droit sur Source
   - ✅ Ligne pointillée jaune apparaît
3. Glisser vers TGBT
   - ✅ Ligne suit la souris
4. Relâcher sur TGBT
   - ✅ Câble créé (ligne bleue entre les deux)
   - ✅ Compteur "Câbles: 1"
   - ✅ Longueur affichée (ex: "12.5m")

---

## 📊 TEST 6 : Validation automatique

**Procédure :**
1. Créer 3 objets + 2 câbles
2. Vérifier info nœud en bas
   - ✅ ID s'affiche
   - ✅ Position x,y affichée
   - ✅ Type affiché

3. Glisser nœud
   - ✅ Longueurs câbles recalculées
   - ✅ Hash mis à jour
   - ✅ Info nœud actualisée

---

## 🎯 CRITÈRES DE SUCCÈS PHASE 1

| Critère | Test | État |
|---------|------|------|
| GraphStore fonctionne | TEST 1 | ✅ ou ❌ |
| Canvas affiche | TEST 2 | ✅ ou ❌ |
| Boutons palette OK | TEST 3 | ✅ ou ❌ |
| Drag-drop OK | TEST 4 | ✅ ou ❌ |
| Câbles créables | TEST 5 | ✅ ou ❌ |
| Auto-calc longueurs | TEST 6 | ✅ ou ❌ |

### Si 5/6 ✅ → **Phase 1 VALIDÉE** 🎉

---

## 🐛 Troubleshooting

### Erreur : "graphStore is not defined"
→ Vérifier import dans App.tsx : `import { GraphStore } from '@/stores/GraphStore';`

### Canvas ne s'affiche pas
→ Vérifier npm run dev est running
→ Vérifier http://localhost:58599/ se charge
→ Ouvrir console Dev (F12) pour erreurs

### Boutons ne créent pas d'objets
→ Vérifier ObjectLibrary imports dans SchematicCanvas
→ Vérifier graphStore instance est créée

### Câbles ne se créent pas
→ Clic droit doit être sur le cercle (not sur du vide)
→ Relâcher sur un autre cercle (pas sur vide)

---

## ✅ CHECKLIST FINALE PHASE 1

- [ ] npm install réussi
- [ ] npm run dev running
- [ ] GraphStore.ts créé + 0 erreurs TS
- [ ] ObjectLibrary.ts créé + 0 erreurs TS
- [ ] SchematicCanvas.tsx créé + 0 erreurs TS
- [ ] App.tsx intégré
- [ ] Canvas affiche sur http://localhost:58599/
- [ ] TEST 1 ✅ passé
- [ ] TEST 2 ✅ passé
- [ ] TEST 3 ✅ passé
- [ ] TEST 4 ✅ passé
- [ ] TEST 5 ✅ passé
- [ ] TEST 6 ✅ passé

**Si tous cochés → Phase 1 = 100% COMPLETE ✅✅✅**

---

## 📈 PROCHAINES ÉTAPES (PHASE 2)

Si Phase 1 ✅ validée :

1. Créer `src/functions/GraphParamsExtractor.ts`
   - Parser graphe → paramètres calcul
   - Appeler moteur normatif existant

2. Créer `src/constants/templateSchemas.ts`
   - 6 templates pré-schémas (éclairage, moteurs, etc.)

3. Créer UI selector template
   - Charger schéma complet en un clic

4. Tests intégration calcul

---

**Prêt pour valider ?** 🚀

*Document généré : 25 janvier 2026*  
*Phase 1 Test Plan — Plateforme Graphique Normative*
