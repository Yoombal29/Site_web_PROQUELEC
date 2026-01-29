# 🔄 Guide de Migration des Pages Existantes

## 🎯 Objectif

Transformer vos pages existantes (codées en dur) en composants dynamiques modifiables depuis l'administration.

## 📋 Scripts à Exécuter dans l'Ordre

### 1. **Système Dynamique de Base**
```sql
-- Dans Supabase SQL Editor
\i supabase/migrations/dynamic_systems.sql
\i supabase/migrations/dynamic_systems_data.sql
```

### 2. **Migration des Composants Existants**
```sql
-- Migration des composants utilisés dans vos pages actuelles
\i supabase/migrations/migrate_existing_components.sql
```

### 3. **Système de Migration Automatique**
```sql
-- Configuration du système de sauvegarde et migration automatique
\i supabase/migrations/auto_migration_system.sql
```

## 🔄 Transformation des Pages

### **Avant (Page Codée en Dur)**
```tsx
// src/pages/Index.tsx
<HeroSection
  title="Titre codé en dur"
  subtitle="Sous-titre codé en dur"
  buttons={[...]}
  gradient="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"
/>
```

### **Après (Page Dynamique)**
```tsx
// src/pages/Index.tsx
<DynamicRenderer
  componentName="hero-index"
  fallback={<HeroSection title="Titre de secours" />}
/>
```

## 📝 Composants Migrés Automatiquement

| Page | Composant Original | Nouveau Composant Dynamique |
|------|-------------------|----------------------------|
| `Index.tsx` | `HeroSection` | `hero-index` |
| `Index.tsx` | Section "Pourquoi la qualité" | `why-quality-section` |
| `Index.tsx` | `QuickLinks` | `quick-links` |
| `Index.tsx` | `LatestNews` | `latest-news` |
| `Index.tsx` | `PartnerLogos` | `partner-logos` |
| `Index.tsx` | `NewsletterSignup` | `newsletter-signup` |
| `About.tsx` | `HeroSection` | `hero-about` |
| `About.tsx` | Section Valeurs | `about-values` |
| `About.tsx` | Section Histoire | `about-milestones` |

## 🛠️ Modification des Composants

### **Via SQL Direct**
```sql
-- Modifier le titre du hero
UPDATE dynamic_components
SET title = 'Nouveau titre dynamique'
WHERE name = 'hero-index';

-- Modifier le contenu
UPDATE dynamic_components
SET content = jsonb_set(content, '{description}', '"Nouvelle description"')
WHERE name = 'hero-index';
```

### **Via Interface Future**
Une interface d'administration permettra de :
- Modifier les textes
- Changer les images
- Réorganiser les sections
- Activer/désactiver des composants

## 🔒 Système de Sauvegarde

### **Sauvegarde Automatique**
- Chaque modification crée automatiquement une sauvegarde
- 10 sauvegardes conservées par composant
- Restauration possible à tout moment

### **Sauvegarde Manuelle**
```sql
-- Sauvegarder avant une grosse modification
SELECT backup_component('hero-index', 'Modification du design');
```

### **Restauration**
```sql
-- Restaurer la dernière sauvegarde
SELECT restore_component('hero-index');

-- Restaurer une sauvegarde spécifique
SELECT restore_component('hero-index', 'uuid-de-la-sauvegarde');
```

## 📊 Vérification de la Migration

Après exécution des scripts, vérifiez :

```sql
SELECT
  '✅ Migration réussie' as status,
  (SELECT COUNT(*) FROM dynamic_components) as composants_dynamiques,
  (SELECT COUNT(*) FROM component_backups) as sauvegardes,
  (SELECT COUNT(*) FROM dynamic_forms) as formulaires,
  (SELECT COUNT(*) FROM theme_configurations WHERE is_active = true) as themes_actifs;
```

## 🚀 Test des Modifications

### **1. Test Visuel**
- Les pages doivent s'afficher normalement
- Vérifier que tous les composants sont présents

### **2. Test de Modification**
```sql
-- Modifier un titre et vérifier qu'il change sur le site
UPDATE dynamic_components
SET title = 'TEST - Titre modifié'
WHERE name = 'hero-index';
```

### **3. Test de Restauration**
```sql
-- Remettre l'ancien titre
SELECT restore_component('hero-index');
```

## 🔧 Personnalisation Avancée

### **Ajouter un Nouveau Composant**
```sql
INSERT INTO dynamic_components (name, component_type, title, content, settings)
VALUES (
  'nouveau-composant',
  'feature',
  'Mon Nouveau Composant',
  '{"description": "Contenu du composant"}',
  '{"className": "py-8"}'
);
```

### **Modifier l'Ordre d'Affichage**
```sql
UPDATE dynamic_components
SET display_order = 1
WHERE name = 'hero-index';
```

### **Désactiver un Composant**
```sql
UPDATE dynamic_components
SET is_active = false
WHERE name = 'composant-a-cacher';
```

## 📋 Pages à Migrer

### **Pages Principales**
- ✅ `Index.tsx` → `IndexDynamic.tsx` (exemple fourni)
- 🔄 `About.tsx` → Créer `AboutDynamic.tsx`
- 🔄 `Contact.tsx` → Migrer vers formulaire dynamique
- 🔄 `Blog.tsx` → Utiliser système de pages dynamiques
- 🔄 Autres pages...

### **Stratégie de Migration**
1. **Créer la version dynamique** en parallèle
2. **Tester** que tout fonctionne
3. **Remplacer** l'ancienne version
4. **Supprimer** l'ancien fichier

## 🎨 Personnalisation du Thème

### **Couleurs Dynamiques**
```sql
UPDATE theme_configurations
SET colors = jsonb_set(colors, '{primary}', '"#ff6b6b"')
WHERE name = 'theme-proquelec' AND is_active = true;
```

### **Polices Dynamiques**
```sql
UPDATE theme_configurations
SET fonts = jsonb_set(fonts, '{heading}', '"Poppins, sans-serif"')
WHERE name = 'theme-proquelec' AND is_active = true;
```

## 🔍 Debugging

### **Composant Non Trouvé**
Si un composant n'apparaît pas :
```sql
SELECT * FROM dynamic_components WHERE name = 'nom-du-composant';
```

### **Erreur de Cache**
Le cache se vide automatiquement toutes les 5-15 minutes, ou forcez :
```javascript
// Dans la console du navigateur
localStorage.clear();
location.reload();
```

### **Problème de Thème**
Vérifiez que le thème est actif :
```sql
SELECT * FROM theme_configurations WHERE is_active = true;
```

## 🎉 Avantages de la Migration

### **✅ Modifications Instantanées**
- Plus besoin de redéployer pour changer un texte
- Modifications en temps réel depuis l'admin

### **✅ Sauvegarde Automatique**
- Chaque modification est sauvegardée
- Possibilité de revenir en arrière

### **✅ Évolutivité**
- Ajout facile de nouveaux composants
- Personnalisation par page possible

### **✅ Maintenance Simplifiée**
- Code plus propre et modulaire
- Réutilisation des composants

---

## 🚀 Prochaines Étapes

1. **Exécuter les scripts SQL** dans l'ordre indiqué
2. **Tester** que les pages s'affichent correctement
3. **Créer l'interface d'administration** pour modifier les composants
4. **Migrer les autres pages** progressivement

**Besoin d'aide ?** Les fichiers `IndexDynamic.tsx` et `AboutDynamic.tsx` montrent comment utiliser le système ! 🎯