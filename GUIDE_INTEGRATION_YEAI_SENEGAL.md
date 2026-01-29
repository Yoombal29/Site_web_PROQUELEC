# 🇸🇳 Guide d'Intégration YEAI Sénégal

## 🎯 Objectif
Transformer votre IA YEAI générique en **YEAI Sénégal** : une IA qui utilise **UNIQUEMENT** la norme sénégalaise NS 01-001, avec rejet automatique de toutes les normes étrangères.

---

## 📦 Fichiers Créés

### 1. **`src/data/ns01001-loader.ts`**
**Rôle** : Gestionnaire de données NS 01-001

**Fonctionnalités** :
- ✅ Chargement des 1994 règles depuis le JSON
- ✅ Index de recherche optimisé (recherche rapide)
- ✅ Fonctions de filtrage (par Titre, Annexe, Article)
- ✅ Statistiques du corpus normatif

**API Exportée** :
```typescript
import { searchNS01001, findArticle, getStats } from '@/data/ns01001-loader';

// Recherche full-text
const results = searchNS01001("protection différentielle", 10);

// Article exact
const article = findArticle("12.1");

// Statistiques
const stats = getStats();
// { totalRules: 1994, totalTitres: 7, totalAnnexes: 1296, ... }
```

---

### 2. **`src/hooks/useSenegalAI.ts`**
**Rôle** : Hook React pour l'IA Souveraine Sénégalaise

**Fonctionnalités** :
- ✅ Recherche dans NS 01-001 uniquement
- ✅ **Détection automatique** des demandes hors-norme (NF C, IEC, IEEE)
- ✅ Refus systématique des normes étrangères
- ✅ Formatage des réponses selon le standard sénégalais
- ✅ Métadonnées (temps de traitement, nombre de règles trouvées)

**Politique de Refus** :
```typescript
// Si l'utilisateur demande :
"Quelle est la norme NF C 15-100 ?"

// Réponse automatique :
"🇸🇳 Refus de Conformité
Cette IA est strictement limitée à la Norme Sénégalaise NS 01-001.
Les normes internationales (NF C, IEC, IEEE) ne sont pas applicables..."
```

**API** :
```typescript
import { useSenegalAI } from '@/hooks/useSenegalAI';

const { querySenegalEngine, loading, error } = useSenegalAI();

const response = await querySenegalEngine("hauteur tableau électrique");
// response.status: 'accepted' | 'refused'
// response.content: texte formaté
// response.articles: règles NS 01-001 trouvées
```

---

### 3. **`src/components/tools/YEAISenegal.tsx`**
**Rôle** : Interface utilisateur complète pour YEAI Sénégal

**Design** :
- 🎨 Couleurs vertes (thème sénégalais)
- 🇸🇳 Drapeau et indicateurs visuels "100% Sénégal"
- 📊 Affichage en temps réel des statistiques (1994 articles, pages 21-478)
- ⚡ Questions suggérées adaptées à la NS 01-001

**Fonctionnalités UI** :
```typescript
// Badges affichés :
- "NS 01-001 ONLY"
- "100% Sénégal"
- "No Foreign Norms"

// Statistiques live :
- "1994 Articles • Pages 21-478 • 7 Titres"

// Métadonnées de réponse :
- "3 règle(s) • 45ms"
```

---

## 🚀 Intégration dans ToolsPlatform

### Étape 1 : Importer le nouveau composant

**Fichier** : `src/pages/ToolsPlatform.tsx`

```typescript
// Ajoutez cette ligne en haut
import YEAISenegal from '@/components/tools/YEAISenegal';
```

### Étape 2 : Remplacer l'ancien composant

**Avant** :
```typescript
<SovereignAIEngine />
```

**Après** :
```typescript
<YEAISenegal />
```

### Étape 3 : (Optionnel) Garder les deux versions

Si vous voulez permettre à l'utilisateur de choisir entre l'IA générique et l'IA sénégalisée :

```typescript
const [aiMode, setAiMode] = useState<'global' | 'senegal'>('senegal');

return (
  <div>
    <div className="flex gap-2 mb-4">
      <Button onClick={() => setAiMode('global')}>
        IA Globale (Multi-Normes)
      </Button>
      <Button onClick={() => setAiMode('senegal')}>
        🇸🇳 IA Sénégal (NS 01-001)
      </Button>
    </div>
    
    {aiMode === 'global' ? <SovereignAIEngine /> : <YEAISenegal />}
  </div>
);
```

---

## 🔐 Politique de Sécurité Normative

### Règles Strictes Implémentées

| Situation | Comportement |
|-----------|-------------|
| Requête contient "NF C" | ❌ **Refus automatique** avec message explicatif |
| Requête contient "IEC", "IEEE" | ❌ **Refus automatique** |
| Requête normale (ex: "protection") | ✅ Recherche dans NS 01-001 |
| Aucun résultat trouvé | ⚠️ Refus avec suggestions de reformulation |
| Résultats trouvés | ✅ Réponse formatée avec références exactes |

### Exemple Complet

**Question Utilisateur** : 
> "Quelle est la section minimale pour un circuit d'éclairage ?"

**Processus** :
1. ✅ Validation : Pas de mots-clés hors-norme détectés
2. 🔍 Recherche dans `NS01001_v2_core.json`
3. 📊 Trouve 3 articles pertinents (ex: Art. 523.1, 523.2, 553.1)
4. 📝 Construction de la réponse :

```markdown
## 🇸🇳 Référence Normative Sénégalaise

**Norme** : NS 01-001
**Article** : 523.1
**Section** : TITRE 5 - Choix et mise en œuvre des matériels
**Page** : 187

---

### 📖 Prescription Normative

La section minimale des conducteurs de circuits d'éclairage doit être...
[Texte complet de l'article]

---

### 📚 Articles Connexes

**2. Article 523.2** (Page 188)
Les circuits d'éclairage doivent avoir une section d'au moins...

**3. Article 553.1** (Page 205)
Pour les locaux d'habitation, les conducteurs...

---

*Extrait de la NS 01-001 - Norme Sénégalaise*
*Basé sur le corpus normatif sénégalais (1994 articles)*
```

---

## 📊 Comparaison Avant/Après

### Avant (IA Générique)
```
✅ Répond avec NF C 15-100
✅ Répond avec IEC 60364
✅ Mélange plusieurs normes
❌ Pas de traçabilité sénégalaise
```

### Après (YEAI Sénégal)
```
✅ Répond UNIQUEMENT avec NS 01-001
❌ Refuse NF C, IEC, IEEE automatiquement
✅ 1994 articles sénégalais accessibles
✅ Traçabilité complète (article, page, titre)
✅ Temps de réponse < 100ms (recherche locale)
```

---

## 🎨 Personnalisation Visuelle

### Modifier les Couleurs

**Fichier** : `src/components/tools/YEAISenegal.tsx`

```typescript
// Changer le thème vert → bleu
className="bg-green-500" → className="bg-blue-500"
className="text-green-400" → className="text-blue-400"

// Ou créer un thème personnalisé
const theme = {
  primary: 'emerald',
  secondary: 'teal',
  accent: 'yellow'
};
```

### Modifier les Questions Suggérées

```typescript
const suggestedQuestions = [
  // VOS questions personnalisées ici
  'Distance minimale entre conducteurs ?',
  'Résistance de terre maximale ?',
  'Protection contre la foudre ?',
];
```

---

## 🧪 Tester l'IA

### Test 1 : Requête Normale
**Entrée** : `"protection différentielle"`  
**Attendu** : Liste d'articles NS 01-001 avec le mot "différentielle"

### Test 2 : Refus de Norme Étrangère
**Entrée** : `"quelle est la norme NF C 15-100 ?"`  
**Attendu** : Message de refus avec explication

### Test 3 : Article Précis
**Entrée** : `"article 12.1"`  
**Attendu** : Affichage de l'article 12.1 exact

### Test 4 : Aucun Résultat
**Entrée** : `"xyzabc123"`  
**Attendu** : Message "Aucune référence trouvée" avec suggestions

---

## 🔧 Dépannage

### Erreur : "Cannot find module '@/data/ns01001-loader'"

**Solution** : Vérifiez que le fichier existe :
```
src/data/ns01001-loader.ts
```

Si le dossier `src/data/` n'existe pas, créez-le.

---

### Erreur : "Cannot read property 'length' of undefined"

**Cause** : Le fichier JSON n'est pas chargé correctement.

**Solution** : Vérifiez le chemin dans `ns01001-loader.ts` :
```typescript
import ns01001Data from '@/public/docs/NS01001/FINAL_DATA/NS01001_v2_core.json';
```

Si votre `tsconfig.json` n'accepte pas `@/public`, utilisez un chemin relatif :
```typescript
import ns01001Data from '../../../public/docs/NS01001/FINAL_DATA/NS01001_v2_core.json';
```

---

### L'IA est trop lente

**Cause** : L'index de recherche n'est pas optimisé.

**Solution** : Le `ns01001-loader.ts` construit automatiquement un index au démarrage. Assurez-vous que :
1. L'index est créé une seule fois (singleton pattern)
2. Vous utilisez `searchNS01001()` et non une recherche manuelle

---

## 📚 Ressources Supplémentaires

- **Guide Débutant** : `/public/docs/NS01001/FINAL_DATA/GUIDE_COMPLET_DEBUTANT.md`
- **Documentation Technique** : `/public/docs/NS01001/FINAL_DATA/README.md`
- **Données Sources** : `/public/docs/NS01001/FINAL_DATA/NS01001_v2_core.json`

---

## ✅ Checklist Finale

- [ ] `ns01001-loader.ts` créé dans `src/data/`
- [ ] `useSenegalAI.ts` créé dans `src/hooks/`
- [ ] `YEAISenegal.tsx` créé dans `src/components/tools/`
- [ ] Import ajouté dans `ToolsPlatform.tsx`
- [ ] Composant `<YEAISenegal />` ajouté à la page
- [ ] Testé avec une question normale
- [ ] Testé avec une demande de norme étrangère (doit refuser)
- [ ] Vérifié les métadonnées (nombre d'articles, temps de traitement)

---

**🎉 Félicitations !**  
Votre IA YEAI est maintenant **100% sénégalisée** et utilise exclusivement la NS 01-001 ! 🇸🇳

**Date de création** : 27 janvier 2026  
**Version** : 1.0 - Production Ready  
**Support** : NS 01-001 (1994 articles)
