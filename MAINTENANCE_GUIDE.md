# 🎯 GUIDE DE MAINTENANCE ET BONNES PRATIQUES

## 📋 Table des Matières
1. [Maintenance Quotidienne](#maintenance-quotidienne)
2. [Gestion des Pages](#gestion-des-pages)
3. [Troubleshooting](#troubleshooting)
4. [Optimisations Recommandées](#optimisations-recommandées)
5. [Sécurité](#sécurité)

---

## Maintenance Quotidienne

### ✅ Vérifications Régulières
```bash
# Vérifier l'état du système (chaque semaine)
node scripts/system_audit.mjs

# Lancer le serveur avec npm
npm run dev

# Vérifier les erreurs TypeScript
npm run build
```

### 🔄 Mise à Jour des Pages
Les pages sont **automatiquement chargées** depuis la base de données Supabase. Aucune recompilation requise après édition.

### 📊 Monitoring
- Vérifier les logs du navigateur (F12)
- Vérifier les erreurs Supabase (Dashboard)
- Tester chaque page après modification

---

## Gestion des Pages

### ➕ Créer une Nouvelle Page

1. **Via Admin:**
   ```
   1. /dashboard
   2. Onglet "Pages"
   3. Bouton "Nouvelle Page"
   4. Remplir:
      - Slug (URL): ex: "mon-service"
      - Titre: ex: "Mon Service"
      - Contenu: HTML + Tailwind CSS
      - Métadonnées SEO (optionnel)
   5. Cocher "Publier la page"
   6. Cliquer "Sauvegarder"
   ```

2. **Résultat:**
   - Page accessible à `/mon-service`
   - Automatiquement ajoutée aux routes dynamiques
   - Rendue avec prose styling

### ✏️ Éditer une Page Existante

1. **Via Admin:**
   ```
   1. /dashboard → Pages
   2. Cliquer sur la page dans la liste
   3. Modifier le contenu HTML
   4. Ajouter/modifier métadonnées SEO
   5. Cliquer "Sauvegarder"
   ```

2. **Limitations:**
   - ⚠️ Le "numeric overflow" peut bloquer les UPDATE
   - ✅ Solution: Créer une nouvelle version de la page
   - ✅ Ou utiliser Supabase Dashboard directement

### 🗑️ Supprimer une Page

1. **Via Admin:**
   ```
   1. /dashboard → Pages
   2. Cliquer sur la page
   3. Bouton "Supprimer"
   4. Confirmer
   ```

2. **Résultat:**
   - Page supprimée de la BD
   - Route devient 404
   - Menu doit être mis à jour manuellement

### 📱 Ajouter une Page au Menu

1. **Via Supabase Dashboard:**
   ```sql
   INSERT INTO menu_items (title, url, menu_order, is_active)
   VALUES ('Mon Service', '/mon-service', 10, true);
   ```

2. **Ou via Script:**
   ```bash
   # Ajouter manuelle ment à scripts/create_menu_items.mjs
   ```

---

## Troubleshooting

### ❌ La Page ne s'Affiche Pas

**Problème:** Route retourne 404

**Solutions:**
1. Vérifier que la page est **publiée**:
   - `/dashboard` → Pages → Vérifier le statut
   
2. Vérifier l'URL du slug:
   - La page doit être accessible à `/:slug`
   - Exemple: slug="formations" → `/formations`

3. Vérifier le cache:
   - Actualiser la page (Ctrl+F5)
   - Vider le cache navigateur

4. Vérifier la console:
   - Ouvrir F12 → Console
   - Chercher les erreurs

### ❌ Impossible d'Éditer une Page

**Problème:** "numeric field overflow"

**Solution:**
1. **Créer une nouvelle version:**
   - Créer une page avec slug différent
   - Copier le contenu
   - Publier la nouvelle
   - Supprimer l'ancienne

2. **Ou utiliser Supabase:**
   - Aller au Supabase Dashboard
   - Table `pages`
   - Éditer directement le champ `content`

### ❌ Le Menu ne s'Affiche Pas

**Solutions:**
1. Vérifier que le menu est **actif** (is_active = true)
2. Vérifier que l'URL du menu pointe vers une page existante
3. Nettoyer les doublons:
   ```bash
   node scripts/fix_menu_duplicates.mjs
   ```

### ❌ Les Styles ne s'Appliquent Pas

**Solutions:**
1. Vérifier que les classes Tailwind sont correctes
2. Vérifier que les classes existent dans `tailwind.config.ts`
3. Vérifier le div contenant le contenu a bien la classe `prose prose-lg`

---

## Optimisations Recommandées

### 🚀 Performance

1. **Réduire la taille des pages:**
   - Optimiser les images (compression)
   - Éviter les vidéos lourddes
   - Minifier le HTML

2. **Caching:**
   ```typescript
   // Dans DynamicPage.tsx
   // Ajouter React Query avec cache time
   const CACHE_TIME = 1000 * 60 * 5; // 5 minutes
   ```

3. **Code Splitting:**
   - Utiliser dynamic imports pour les admin panels
   - Réduire le chunk taille de 1.7MB

### 🎨 Design

1. **Composants Réutilisables:**
   - Créer des composants pour les layouts récurrents
   - Utiliser des slots pour la flexibilité

2. **Thème Cohérent:**
   - Centraliser les couleurs dans tailwind.config.ts
   - Utiliser CSS variables pour les thèmes

### 🔍 SEO

1. **Métadonnées:**
   - Ajouter meta description pour chaque page
   - Ajouter meta keywords pertinents
   - Utiliser Helmet pour les tags dynamiques

2. **Structure:**
   - H1 par page (un seul)
   - Utiliser H2, H3 pour la hiérarchie
   - Listes ordonnées pour les énumérations

### 📱 Responsif

1. **Tester sur Mobile:**
   - DevTools → Responsive Design Mode
   - Tester sur vraiments appareils si possible

2. **Touches:**
   - Boutons > 44px x 44px
   - Espaces > 16px entre éléments
   - Police > 14px minimum

---

## Sécurité

### 🔐 Authentification Admin

1. **Service Role Key:**
   - ✅ Configurée et sécurisée
   - ✅ Utilisée pour opérations admin
   - ❌ Ne jamais exposer en front-end

2. **RLS Policies:**
   - ✅ En place pour pages
   - ✅ Contrôle l'accès par rôle
   - ⚠️ À vérifier si modification

### 🛡️ Contenu HTML

1. **Risques XSS:**
   - ✅ React protège par défaut
   - ✅ dangerouslySetInnerHTML utilisé avec attention
   - ⚠️ Valider le HTML des utilisateurs

2. **Injection SQL:**
   - ✅ Supabase protège via RLS
   - ✅ Paramètres toujours sécurisés
   - ✅ Pas de requête brute

### 🔑 Environnement

1. **Variables Secrets:**
   ```
   .env (LOCAL - JAMAIS committer)
   .env.example (PUBLIQUE - pour référence)
   ```

2. **Clés API:**
   - ✅ Service role en variables d'env
   - ✅ Public key en front-end seulement
   - ⚠️ Rotation si compromission

---

## Prochaines Améliorations

### ⭐ Court Terme (1-2 mois)
- [ ] Fix du numeric overflow trigger
- [ ] Éditeur Wysiwyg visuel
- [ ] Upload d'images intégré
- [ ] Aperçu mobile en temps réel

### 🚀 Moyen Terme (2-6 mois)
- [ ] Versioning des pages (brouillons, historique)
- [ ] Workflow de publication (draft → review → published)
- [ ] Support multilingue
- [ ] Accès multi-utilisateurs avec permissions

### 💡 Long Terme (6+ mois)
- [ ] Blog système complet (catégories, tags, commentaires)
- [ ] E-commerce intégré (produits, panier)
- [ ] Analytics avancées
- [ ] Newsletter et email marketing
- [ ] Intégration CRM

---

## 📞 Support et Ressources

### Documentation
- **Supabase:** https://supabase.com/docs
- **React:** https://react.dev
- **Tailwind:** https://tailwindcss.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs

### Scripts d'Aide
```bash
# Vérifier le système
node scripts/system_audit.mjs

# Vérification finale
node scripts/final_verification.mjs

# Nettoyer les menus
node scripts/fix_menu_duplicates.mjs
```

### Dashboard
- **Supabase:** https://app.supabase.com
- **Local Admin:** http://localhost:PORT/dashboard

---

## 📝 Checklist de Publication

Avant de mettre en production:

- [ ] Toutes les pages testées
- [ ] Menu complet et correct
- [ ] Build sans erreurs (`npm run build`)
- [ ] Performance acceptable (Lighthouse > 80)
- [ ] SEO métadonnées complètes
- [ ] Images optimisées
- [ ] Liens internes testés
- [ ] Mobile responsive testé
- [ ] SSL/HTTPS configuré
- [ ] Backups sauvegardées

---

## 🎯 Conclusion

Le projet PROQUELEC est maintenant:
- ✅ Fonctionnel et beau
- ✅ Facile à maintenir
- ✅ Prêt pour la croissance
- ✅ Bien documenté

**Bonne chance avec votre site!** 🚀

---

*Document créé le 22 janvier 2026*  
*Pour PROQUELEC Site v1.0.0*
