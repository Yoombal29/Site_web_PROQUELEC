# Script SQL - Table Pages PROQUELEC

## Vue d'ensemble

Ce script SQL crée une table `pages` complète et évolutive pour le système de gestion de contenu PROQUELEC, avec des fonctionnalités actuelles et futures préparées.

## Fonctionnalités Actuelles ✅

### Gestion de Contenu de Base
- **CRUD complet** : Création, lecture, mise à jour, suppression
- **SEO optimisé** : Meta description, keywords, robots
- **Templates** : Support de différents layouts
- **Publication programmée** : Dates de publication/dépublication
- **Hiérarchie** : Pages parentes/enfants
- **Taxonomies** : Catégories et tags
- **Personnalisation** : CSS/JS/HTML personnalisés

### Fonctionnalités Avancées
- **Workflow d'approbation** : Statuts draft/review/approved
- **Versioning** : Numérotation automatique des versions
- **Multilingue** : Support des langues avec traductions JSON
- **Analytics** : Comptage des vues, taux de conversion
- **Sécurité granulaire** : Niveaux de sécurité (public/authentifié/admin)

## Fonctionnalités Futures Préparées 🚀

### A/B Testing
- Champs `is_ab_test_variant`, `ab_test_group`, `ab_test_weight`
- Index optimisés pour les requêtes de test

### Analytics Avancés
- `view_count`, `unique_views`, `conversion_rate`
- `engagement_score`, `seo_score`, `performance_score`
- Métriques calculées automatiquement

### Intégrations
- `webhook_urls` pour notifications automatiques
- `external_id` pour synchronisation avec autres systèmes
- `api_metadata` pour configurations d'API

### Performance et Cache
- `cache_ttl`, `is_cached`, `last_cached_at`
- Support CDN et mise en cache intelligente

### Audit et Traçabilité
- `created_by`, `updated_by` pour traçabilité complète
- `revision_history` pour historique des modifications
- Triggers automatiques de mise à jour

### Médias Avancés
- `media_gallery` pour galeries d'images/vidéos
- `featured_video` pour vidéos en vedette
- `attachments` pour documents joints

### Géolocalisation
- `geo_targeting` pour ciblage géographique
- Support des pays et régions

### Accessibilité
- `accessibility_score` calculé automatiquement
- `alt_texts` pour textes alternatifs des images

### Champs Personnalisés
- `custom_fields` et `custom_settings` en JSONB
- Extension infinie des capacités

## Installation

1. **Accédez au SQL Editor de Supabase** :
   https://supabase.com/dashboard/project/yyuhwuaqsbhwtiotyauu/sql

2. **Copiez-collez le script** `create_pages_table.sql`

3. **Cliquez sur "Run"** pour exécuter

4. **Vérifiez la création** :
   - Table `pages` créée
   - 20+ indexes pour performances
   - Politiques RLS configurées
   - Données de test insérées

## Structure de la Table

### Champs Obligatoires
- `id` : UUID primaire
- `title` : Titre de la page (requis)
- `slug` : URL propre (auto-généré, unique)

### Métadonnées SEO
- `meta_description` : Description (≤160 caractères)
- `meta_keywords` : Mots-clés
- `meta_robots` : Instructions SEO

### Contenu et Médias
- `content` : Contenu HTML
- `featured_image` : Image principale
- `template` : Layout utilisé

### Publication
- `is_published` : Statut de publication
- `publish_date` / `unpublish_date` : Programmation
- `workflow_status` : État du workflow

### Organisation
- `menu_order` : Ordre d'affichage
- `parent_id` : Page parente (hiérarchie)
- `categories` / `tags` : Taxonomies

## Sécurité (RLS)

### Niveaux d'Accès
1. **Public** : Pages publiées et publiques
2. **Authentifié** : Contenu protégé pour utilisateurs connectés
3. **Admin** : Accès complet à la gestion

### Politiques
- Lecture publique des pages publiées
- Accès authentifié au contenu protégé
- Gestion complète pour administrateurs
- Workflow de relecture pour validateurs

## Performances

### Indexes Stratégiques
- **Recherches fréquentes** : slug, publication, menu
- **Full-text** : Recherche dans titre et contenu
- **Analytics** : Vues, scores, timestamps
- **JSONB GIN** : Requêtes sur données complexes

### Optimisations
- Triggers automatiques pour métriques
- Calculs en temps réel des scores
- Mise en cache préparée

## Utilisation dans le Code

### Interface TypeScript (AdminPagesPanel.tsx)
```typescript
interface Page {
  id?: string;
  title: string;
  slug: string;
  content: string;
  // ... tous les champs de base
  // + champs futurs disponibles
}
```

### Hooks React Query
- `usePages()` : Liste des pages
- `useCreatePage()` : Création
- `useUpdatePage()` : Mise à jour
- `useDeletePage()` : Suppression

## Évolution Future

### Phase 1 : Analytics
- Implémentation du tracking des vues
- Calcul automatique des scores
- Dashboard de métriques

### Phase 2 : Multilingue
- Interface de traduction
- Détection automatique de langue
- SEO multilingue

### Phase 3 : A/B Testing
- Création de variantes
- Analyse des performances
- Optimisation automatique

### Phase 4 : Intégrations
- Webhooks pour automatisations
- APIs tierces (CRM, email, etc.)
- Synchronisation bidirectionnelle

## Maintenance

### Mise à Jour
```sql
-- Pour ajouter de nouveaux champs
ALTER TABLE pages ADD COLUMN nouveau_champ TEXT;
CREATE INDEX idx_pages_nouveau_champ ON pages(nouveau_champ);
```

### Sauvegarde
- Export régulier des données
- Versionnage des schémas
- Tests de migration

### Monitoring
- Surveillance des performances
- Alertes sur les seuils
- Logs d'audit

## Support

Ce script est conçu pour être :
- **Évolutif** : Nouveaux champs sans casser l'existant
- **Performant** : Indexes optimisés pour tous les cas d'usage
- **Sécurisé** : RLS complet et audit trail
- **Maintenable** : Commentaires et structure claire

Pour toute question ou évolution, consultez la documentation du projet PROQUELEC.