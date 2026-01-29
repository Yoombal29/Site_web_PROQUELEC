# 🚀 Système Automatique de Migrations PROQUELEC

## Vue d'ensemble

Ce projet utilise un système automatique de migrations Supabase qui applique toutes les migrations SQL lors du démarrage du développement. Plus besoin d'appliquer manuellement les migrations !

## Fonctionnement

### Scripts Disponibles

#### Développement
```bash
# Démarrage automatique avec migrations (recommandé)
npm run dev

# Démarrage complet (migrations + dev)
npm run dev:full

# Configuration initiale (installation + migrations)
npm run setup
```

#### Gestion des Migrations
```bash
# Appliquer automatiquement toutes les migrations
npm run migrate:auto

# Version Windows (PowerShell)
npm run migrate:auto:win

# Migrations manuelles (si nécessaire)
npm run db:migrate
npm run db:reset
npm run db:push
```

#### Gestion de Supabase
```bash
# Contrôler Supabase
npm run db:start
npm run db:stop
npm run db:status
```

## Architecture des Migrations

### Structure des Fichiers
```
supabase/migrations/
├── 20260121_create_pages_table.sql     # Tables de base
├── 20260121_promote_first_admin.sql    # Configuration admin
├── insert_initial_pages.sql            # Données initiales
├── update_*_content.sql               # Contenu des pages
├── publish_all_pages.sql              # Publication automatique
└── ...                               # Autres migrations
```

### Types de Migrations

1. **Tables et Schémas** : Création des structures de base de données
2. **Données Initiales** : Insertion du contenu de base
3. **Mises à Jour** : Modifications du contenu existant
4. **Maintenance** : Nettoyage et optimisation

## Processus Automatique

### Au Démarrage (`npm run dev`)

1. **Vérification de Supabase** : Démarrage automatique si nécessaire
2. **Application des Migrations** :
   - Tri alphabétique des fichiers SQL
   - Application séquentielle avec gestion d'erreurs
   - Ignorance des migrations déjà appliquées
3. **Démarrage de Vite** : Serveur de développement

### Gestion d'Erreurs

- **Migrations dupliquées** : Ignorées automatiquement
- **Échecs partiels** : Continuer avec les autres migrations
- **Récupération** : Possibilité de relancer `npm run migrate:auto`

## Développement

### Ajouter une Nouvelle Migration

1. Créer un fichier SQL dans `supabase/migrations/`
2. Nommer avec le format : `YYYYMMDD_description.sql`
3. Le système l'appliquera automatiquement au prochain `npm run dev`

### Exemple de Migration
```sql
-- Migration: 20260122_add_new_feature.sql
ALTER TABLE pages ADD COLUMN new_feature TEXT;

UPDATE pages SET new_feature = 'default_value' WHERE new_feature IS NULL;
```

## Dépannage

### Problèmes Courants

#### Supabase ne démarre pas
```bash
# Vérifier Docker
docker --version

# Redémarrer Supabase manuellement
npm run db:stop
npm run db:start
```

#### Migrations en échec
```bash
# Réinitialiser complètement
npm run db:reset

# Relancer les migrations
npm run migrate:auto
```

#### Erreurs de build
```bash
# Nettoyer et reconstruire
npm run clean
npm run build
```

## Avantages

✅ **Automatisation complète** : Plus de commandes manuelles
✅ **Détection automatique** : Nouvelles migrations appliquées automatiquement
✅ **Résilience** : Gestion d'erreurs et récupération
✅ **Cross-platform** : Support Windows (PowerShell) et Unix
✅ **Développement fluide** : Démarrage rapide et fiable

---

**🎯 Résultat** : Un environnement de développement où tout fonctionne automatiquement !