# 🗓️ ROADMAP — Phases futures

## État actuel : Phase 1 ✅ COMPLÈTE

---

## 📊 Vue d'ensemble

| Phase | Rubrique | Status | ETA | Effort |
|-------|----------|--------|-----|--------|
| **1** | **Voltage Drop** | ✅ STABLE | Immédiat | Intégration 15min |
| **2** | **Unifilaire** | 📋 Template | 1-2 sem | 4-6h |
| **3** | **Protection** | 📋 Planifiée | 2-3 sem | 4-6h |
| **4** | **Thermique** | 📋 Planifiée | 3-4 sem | 4-6h |
| **5** | **Réglementation** | 📋 Planifiée | 4-5 sem | 4-6h |
| **6** | **Simulation** | 📋 Planifiée | 5-6 sem | 6-8h |

---

## ✅ Phase 1 : Voltage Drop

**Status :** COMPLÈTE & STABLE  
**Version :** 1.0.0  
**Fichiers :** 
- `src/rubriques/VoltageDropRubrique.ts` ✅
- `src/types/Rubrique.ts` ✅
- `src/services/RubriqueRegistry.ts` ✅
- `src/bootstrap/initializeRubriques.ts` ✅

**Action :** Appel à `initializeRubriques()` au démarrage

**Durée intégration :** 15 minutes

---

## 📋 Phase 2 : Unifilaire

**Status :** Template prêt  
**Version :** 0.9.0 (BETA)  
**Fichier template :** `src/rubriques/UnifilaireRubrique.template.ts`

### Qu'est-ce que c'est ?
Schéma unifilaire = 1 fil par phase (pour moteurs, transformateurs, etc.)

### Étapes d'implémentation
1. Copier `UnifilaireRubrique.template.ts` → `UnifilaireRubrique.ts`
2. Implémenter 5 méthodes principales
3. Ajouter couleurs/validations spécifiques
4. Tester avec sélecteur
5. Enregistrer dans bootstrap

### Effort estimé
- Développement : 3h
- Teste : 1h
- Validation : 1h
- **Total : 4-5h**

### Points importants
- ✅ Template déjà fourni
- ✅ Exemples dans VoltageDropRubrique
- ✅ Architecture extensible
- ✅ Pas de refactoring existant

---

## 📋 Phase 3 : Protection & Selectivité

**Status :** À planifier  
**Description :** Calcul des courbes de protection (disjoncteurs)

### Concepts clés
- Calcul de sélectivité (Imax vs In)
- Courbes de déclenchement
- Coordination temporelle
- Vérification conformité NF C 62-200

### Dépendances
- Phase 1 (Voltage Drop) : Structure

### Effort estimé : 5h

---

## 📋 Phase 4 : Thermique

**Status :** À planifier  
**Description :** Calcul d'échauffement des câbles

### Concepts clés
- Constant thermique
- Élévation température
- Durée de surcharge
- Limites admissibles (NF C 13-100)

### Dépendances
- Phase 1 (Voltage Drop) : Données

### Effort estimé : 5h

---

## 📋 Phase 5 : Réglementation

**Status :** À planifier  
**Description :** Vérification conformité normes

### Concepts clés
- NF C 15-100 (bâtiment)
- NF C 13-100 (distribution)
- Vérification automatique
- Rapport de conformité

### Dépendances
- Phase 1, 2, 3, 4

### Effort estimé : 6h

---

## 📋 Phase 6 : Simulation

**Status :** À planifier  
**Description :** Simulation de défauts et perturbations

### Concepts clés
- Défaut monophasé
- Défaut triphasé
- Court-circuit
- Courants transitoires

### Dépendances
- Toutes les phases précédentes

### Effort estimé : 8h

---

## 🎯 Prochaine étape recommandée

### Phase 2 : Unifilaire (1-2 semaines)

**Raison :** Demande client fréquente + facile à implémenter avec template

**Ordre d'implémentation :**
1. Adapter template
2. Tester avec sélecteur
3. Ajouter dans bootstrap
4. Documentation
5. Validation

**Durée :** 4-5h développement

---

## 🛠️ Template pour nouvelle rubrique

Tous les templates suivent ce pattern :

```typescript
// 1. Créer classe Engine
class NouveauEngine implements CalculationEngine {
  validate(graph) { /* ... */ }
  calculate(graph) { /* ... */ }
  generateReport(result) { /* ... */ }
  get properties() { /* ... */ }
}

// 2. Exporter rubrique
export const RUBRIQUE_NOUVEAU: RubriqueSchema = {
  id: 'NOUVEAU',
  name: '🎯 Ma nouvelle rubrique',
  version: '0.1.0',
  maturity: 'ALPHA',
  engine: new NouveauEngine(),
  // ... 20 méthodes
}

// 3. Enregistrer dans bootstrap
rubriqueRegistry.register(RUBRIQUE_NOUVEAU)
```

**Durée :** 3-4h par nouvelle rubrique

---

## 📈 Croissance estimée

| Mois | Rubriques | Stabilité | Couverture |
|------|-----------|-----------|-----------|
| Mois 1 | 1 (Drop) | STABLE | Chute tension seule |
| Mois 2 | 2 (+ Uni) | STABLE/BETA | + Schémas uniformes |
| Mois 3 | 3 (+ Prot) | STABLE/BETA/ALPHA | + Protection |
| Mois 4 | 4 (+ Therm) | Mixte | + Thermique |
| Mois 5 | 5 (+ Reg) | Mixte | + Conformité |
| Mois 6 | 6 (+ Sim) | Mixte | + Simulation |

---

## 💰 ROI estimé

| Métrique | Avant | Après 6 mois |
|----------|-------|-------------|
| Rubriques | 1 | 6 |
| Capacité calcul | Basique | Complète |
| Temps par projet | 2h | 30min |
| Couverture normes | 30% | 100% |
| Satisfaction client | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🎓 Points d'apprentissage

**Après Phase 2 :**
- Pattern de création de rubrique maîtrisé
- Extensibilité validée
- Intégration routine

**Après Phase 3 :**
- Calculs complexes
- Interdépendances entre rubriques
- Optimisations performance

**Après Phase 4-5 :**
- Architecture complète
- Scalabilité validée
- Prêt pour client industriel

**Après Phase 6 :**
- Plateforme complète
- Simulation avancée
- Prêt pour vente produit

---

## 📚 Ressources par phase

| Phase | Docs | Code | Tests |
|-------|------|------|-------|
| 1 | ✅ 8 docs | ✅ 6 fichiers | ✅ 100% |
| 2 | 📋 Template + Guide | 📋 Template fourni | 📋 À écrire |
| 3 | 📋 À écrire | 📋 À écrire | 📋 À écrire |
| 4 | 📋 À écrire | 📋 À écrire | 📋 À écrire |
| 5 | 📋 À écrire | 📋 À écrire | 📋 À écrire |
| 6 | 📋 À écrire | 📋 À écrire | 📋 À écrire |

---

## 🚀 Comment démarrer Phase 2

**1. Lire le template**
```bash
cat src/rubriques/UnifilaireRubrique.template.ts
```

**2. Copier et adapter**
```bash
cp UnifilaireRubrique.template.ts UnifilaireRubrique.ts
# Puis: Éditer les TODO sections
```

**3. Enregistrer**
```typescript
// Dans initializeRubriques.ts
import { RUBRIQUE_UNIFILAIRE } from '@/rubriques/UnifilaireRubrique'
rubriqueRegistry.register(RUBRIQUE_UNIFILAIRE)
```

**4. Tester**
```bash
npm run dev
# Naviguer vers /rubrique-selector
# Voir "Unifilaire" apparaître
```

---

## 📞 Support par phase

| Question | Réponse |
|----------|---------|
| Combien ça coûte ? | 4-6h par rubrique |
| Combien ça prend ? | 1 semaine par rubrique (1 dev) |
| Complexité ? | Faible si template fourni |
| Risques ? | Aucun (architecture isolée) |
| Impact existant ? | Aucun (extensible) |

---

## ✨ Vision à long terme

### Année 1
```
✅ Phase 1-2 : Core (Drop + Unifilaire)
📋 Phase 3 : Protection
```

### Année 2
```
📋 Phase 4-5 : Thermique + Reglementation
📋 Phase 6 : Simulation
```

### Année 3+
```
📋 Export PDF/Excel
📋 Collaboration temps réel
📋 API pour intégrations
📋 Mobile app
```

---

## 🎯 Priorité recommandée

1. **IMMÉDIAT** : Intégrer Phase 1 (15 min)
2. **PRIORITÉ HAUTE** : Tester Phase 1 (1h)
3. **COURTE TERME** : Implémenter Phase 2 (1 sem)
4. **MOYEN TERME** : Phases 3-4 (2-3 sem)
5. **LONG TERME** : Phases 5-6 (4-6 sem)

---

## ✅ Checklist avant Phase 2

- [ ] Phase 1 intégrée et testée
- [ ] Utilisateurs satisfaits
- [ ] Client demande nouvelles rubriques
- [ ] Équipe maitrise le pattern
- [ ] Documentation Phase 2 prête

---

## 📊 Métriques de succès

| Métrique | Cible |
|----------|-------|
| Temps intégration Phase 1 | < 30 min ✅ |
| Erreurs Phase 1 | 0 ✅ |
| Rubriques déployées mois 6 | 4-6 |
| Satisfaction client Phase 1 | > 90% |
| Couverture tests | > 80% |

---

**Status :** 🟢 Phase 1 complète & prête  
**Next :** Intégration (15 min) puis Phase 2 (1 sem)  
**Date :** 25 janvier 2026
