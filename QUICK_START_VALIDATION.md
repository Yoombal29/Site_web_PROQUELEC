# ⚡ QUICK START — SCHEMA BUILDER (2 MIN)

**Dernière étape de Phase 1 : Validation visuelle**

---

## 🚀 GO (30 secondes)

### 1️⃣ Ouvrir navigateur
```
http://localhost:58599/schema-builder
```

### 2️⃣ Attendre chargement
- Doit afficher header violet
- Canvas gris visible
- 5 boutons en bas

### 3️⃣ Tester un clic
- Cliquer bouton "📡 Réseau"
- Objet apparaît sur canvas

**✅ Si tu vois ça → Phase 1 WORKS !**

---

## 🎯 TESTS RAPIDES (1 MIN CHACUN)

### TEST 1: Canvas visible ✅
```
Critère: Page charge sans erreur
Visible: Header "🧭 Editeur Schéma..."
         Canvas gris clair
         Boutons palette en bas
```

### TEST 2: Add object ✅
```
Clic: Bouton "📡 Réseau"
Visible: Cercle noir + texte "Source Type A"
         Stats bottom-left: "Objets placés: 1"
```

### TEST 3: Drag object ✅
```
Drag: Glisser l'objet sur canvas
Visible: Objet suit souris
         Position changée
         Stats inchangé (toujours 1)
```

### TEST 4: Add cable ✅
```
Action: 
  1. Ajouter 2e objet (clic "⚡ Breaker" par exemple)
  2. Clic-droit sur 1er objet
  3. Drag vers 2e objet
  4. Release
Visible: 
  - Ligne pointillée jaune pendant drag
  - Ligne blanche statique = câble créé
  - Stats: "Câbles: 1"
```

### TEST 5: Hash VCNG ✅
```
Before: Hash footer = "a1b2c3d4..."
Action: Ajouter 3e objet
After: Hash footer CHANGE = "x9y8z7w6..."
```

### TEST 6: No console errors ✅
```
Action: F12 → Console tab
Visible: 
  - NO red errors
  - May see yellow warnings (OK)
Command: window.__graphStore?.nodes.size
Expected: Number > 0 (ex: 3)
```

---

## 📊 RÉSULTATS ATTENDUS

```
✅ TEST 1: Canvas visible
✅ TEST 2: Add object
✅ TEST 3: Drag object
✅ TEST 4: Add cable
✅ TEST 5: Hash updates
✅ TEST 6: No errors

= 6/6 TESTS PASS = PHASE 1 100% ✅
```

---

## 🔧 SI ERREUR

### ❌ Page blanche
```
F12 → Console → Copy error
Redémarrer: npm run dev
```

### ❌ Buttons don't work
```
Vérifier: http://localhost:58599/ (Vite running?)
Redémarrer: npm run dev
```

### ❌ Red error in console
```
F12 → Console → Copy error message
Contact: Share error in conversation
```

---

## 🎉 PHASE 1 VALIDATION

Si tu as **5/6 tests ✅**, Phase 1 est complète !

```
Phase 1 Status: 🟢 VALIDATED
Ready for: Phase 2 (Extraction + Calcul Normatif)
Timeline: Phase 2 peut démarrer MAINTENANT
```

---

**GO TESTER ! 🚀**

*5 minutes max pour valider Phase 1*
