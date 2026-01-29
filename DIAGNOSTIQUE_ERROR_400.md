# 🔍 Diagnostic Erreur 400 - Sauvegarde de Pages

## 🎯 Problème Identifié
- **Erreur**: "Failed to load resource: the server responded with a status of 400"
- **Location**: AdminPagesManagerAdvanced.tsx - handleSavePage()
- **Impact**: Impossible de créer/modifier les pages en administrateur

## 📊 Causes Possibles (Ordre de Probabilité)

### 1. 🔴 **Table ou Colonnes Manquantes** (Probabilité HAUTE)
- La table `pages` n'existe pas ou n'a pas les colonnes attendues
- Colonnes requises : `id`, `slug`, `title`, `content`, `is_published`, `meta_description`, `meta_keywords`
- **Solution**: Vérifier structure table via Supabase Dashboard

### 2. 🟠 **Politiques RLS (Row Level Security)** (Probabilité HAUTE)
- Le rôle `service_role` n'a pas les permissions INSERT/UPDATE
- RLS actif mais pas de règles pour service_role
- **Solution**: Ajouter règles RLS pour service_role ou désactiver RLS

### 3. 🟡 **Validations au niveau Base de Données** (Probabilité MOYENNE)
- Contraintes `NOT NULL` non satisfaites
- Validation `UNIQUE` sur slug échouée
- Type de donnée incompatible
- **Solution**: Vérifier les contraintes de colonne

### 4. 🔵 **Authentification/Autorisation** (Probabilité BASSE)
- Token service_role expiré ou invalide
- Clé d'API mal configurée
- **Solution**: Régénérer clés d'API dans Supabase Dashboard

## 🔧 Améliorations Effectuées

### ✅ Dans handleSavePage()
```typescript
// Ajout de logging détaillé
console.log('📝 Données à sauvegarder:', pageData);
console.log('✨ Création de page avec:', pageData);
console.log('❌ Erreur Supabase:', error);  // Affiche erreur brute
console.log('✅ Page créée:', data);
```

### ✅ Nettoyage des données
```typescript
const pageData = {
  title: editForm.title?.trim() || '',
  content: editForm.content?.trim() || '',
  is_published: Boolean(editForm.is_published),
  meta_description: editForm.meta_description?.trim() || '',
  meta_keywords: editForm.meta_keywords?.trim() || ''
};
```

### ✅ Utilisation de .select()
```typescript
const { data, error } = await supabase
  .from('pages')
  .insert([pageData])
  .select();  // ← Important pour debugging
```

## 📋 Checklist de Diagnostic

- [ ] Ouvrir Supabase Dashboard → SQL Editor
- [ ] Copier et exécuter :
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'pages';
  ```
- [ ] Vérifier résultat (table existe?)
- [ ] Si oui, afficher structure :
  ```sql
  SELECT column_name, data_type, is_nullable FROM information_schema.columns 
  WHERE table_name = 'pages';
  ```
- [ ] Vérifier politiques RLS :
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'pages';
  ```

## 🧪 Étapes de Test Recommandées

### Étape 1: Vérifier les logs
1. Ouvrir DevTools (F12)
2. Aller à Console
3. Créer/Modifier une page
4. Observer les logs `📝 Données à sauvegarder:` et `❌ Erreur Supabase:`
5. **Copier l'erreur exacte**

### Étape 2: Tester Directement
1. Ouvrir Supabase Dashboard → SQL Editor
2. Insérer un test:
```sql
INSERT INTO pages (slug, title, content, is_published, meta_description, meta_keywords)
VALUES ('test', 'Test', 'Contenu test', false, '', '')
RETURNING *;
```
3. Si erreur → c'est un problème RLS ou structure

### Étape 3: Analyser l'Erreur
- Erreur RLS : `permission denied`
- Erreur colonne : `column "..." does not exist`
- Erreur validation : `null value in column`
- Erreur unique : `duplicate key value`

## 📝 Notes Técnicas

- **Service Role Key**: Configuration correcte dans supabaseClient.ts
- **Singleton Pattern**: ✅ Implémenté pour éviter instances multiples
- **Build**: ✅ Succès (3658 modules transformés)
- **Console Warnings**: ✅ GoTrueClient warnings éliminés

## 🎯 Prochaines Actions

1. **Immédiat**: Tester en UI et copier l'erreur exacte de console
2. **Selon erreur**: Exécuter SQL test ou ajuster RLS
3. **Si besoin**: Créer migration SQL pour table/colonnes manquantes

---

**Créé**: Lors du diagnostic d'erreur 400  
**Mis à jour**: Après amélioration du logging
