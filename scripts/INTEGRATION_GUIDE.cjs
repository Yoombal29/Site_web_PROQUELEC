#!/usr/bin/env node

/**
 * Guide d'intégration: Remplacer AdminPageEditor par AdvancedPageEditorSync
 * 
 * ⚠️ IMPORTANT: À exécuter manuellement - PAS DE SCRIPT D'AUTO-REPLACE
 * Raison: Chaque cas d'utilisation peut être légèrement différent
 */

// ============================================================================
// ÉTAPE 1: VÉRIFIER QUE LES FICHIERS EXISTENT
// ============================================================================

/*
Checklist:
□ src/hooks/useBidirectionalSync.ts EXISTS
□ src/components/admin/AdvancedPageEditorSync.tsx EXISTS
□ src/components/admin/__tests__/AdvancedPageEditorSync.test.tsx EXISTS

Si manquants: Créer les fichiers depuis les fichiers créés dans cette session
*/

// ============================================================================
// ÉTAPE 2: IDENTIFIER LES POINTS D'INTÉGRATION
// ============================================================================

/*
Fichiers qui utilisent AdminPageEditor:

grep -r "AdminPageEditor" src/

Résultats attendus:
1. src/components/admin/AdminPagesPanel.tsx - ligne ~(chercher "AdminPageEditor")
2. Peut-être d'autres fichiers dans routes/ ou pages/

Pour chaque occurrence, exécuter les étapes 3-5 ci-dessous.
*/

// ============================================================================
// ÉTAPE 3: REMPLACER L'IMPORT (AdminPagesPanel.tsx)
// ============================================================================

/*
AVANT:
```typescript
import AdminPageEditor from './AdminPageEditor';
```

APRÈS:
```typescript
import { AdvancedPageEditorSync } from './AdvancedPageEditorSync';
```

Alternative: Si on GARDE AdminPageEditor pour autre usage
```typescript
import AdminPageEditor from './AdminPageEditor';
import { AdvancedPageEditorSync } from './AdvancedPageEditorSync';
```
*/

// ============================================================================
// ÉTAPE 4: REMPLACER LE COMPOSANT (AdminPagesPanel.tsx)
// ============================================================================

/*
Chercher la ligne qui utilise AdminPageEditor:

AVANT (Exemple):
```typescript
{editingPage && (
  <Dialog open={editingDialogOpen} onOpenChange={setEditingDialogOpen}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <AdminPageEditor 
        pageId={editingPage.id}
      />
    </DialogContent>
  </Dialog>
)}
```

APRÈS:
```typescript
{editingPage && (
  <Dialog open={editingDialogOpen} onOpenChange={setEditingDialogOpen}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <AdvancedPageEditorSync 
        pageId={editingPage.id}
        initialPage={editingPage}
        onSave={(data) => {
          console.log('Page sauvegardée:', data);
          // Optional: Analytics
          setEditingDialogOpen(false);
        }}
      />
    </DialogContent>
  </Dialog>
)}
```

Points importants:
- Remplacer "AdminPageEditor" par "AdvancedPageEditorSync"
- Ajouter prop "initialPage={editingPage}" OU le fetcher depuis usePages()
- Ajouter callback "onSave" optionnel pour fermer le dialog après save
*/

// ============================================================================
// ÉTAPE 5: TESTER L'INTÉGRATION
// ============================================================================

/*
TESTS MANUELS EN DÉVELOPPEMENT:

1. Démarrer le dev server:
   npm run dev

2. Aller à /admin/pages

3. Cliquer "Edit" sur une page
   → Voir le nouveau composant AdvancedPageEditorSync s'ouvrir

4. Tester synchronisation des onglets:
   □ Cliquer "HTML" → Modifier du texte
   □ Cliquer "JSON" → Voir le JSON mis à jour
   □ Cliquer "HTML" → Voir le HTML restauré
   □ Cliquer "Formulaire" → Voir les champs populés
   □ Cliquer "Aperçu" → Voir le rendu en live

5. Tester auto-save:
   □ Modifier le titre dans "Formulaire"
   □ Attendre 1 seconde
   □ Vérifier dans Network tab: PUT /api/pages/:id appelé
   □ Vérifier isSaving indicator a montré "Saving..." puis "Saved"

6. Tester SSE broadcast:
   □ Ouvrir un deuxième onglet avec le site public
   □ Modifier la page dans l'admin
   □ Vérifier que la page publique se met à jour <500ms

7. Tester gestion d'erreurs:
   □ Cliquer "JSON" → Entrer du JSON invalide: { invalid }
   □ Doit montrer un message d'erreur
   □ HTML ne devrait pas être affecté
   □ Corriger JSON → Erreur disparaît
*/

// ============================================================================
// ÉTAPE 6: TESTS AUTOMATISÉS
// ============================================================================

/*
Lancer les tests:

npm test -- AdvancedPageEditorSync.test.tsx

Expected output:
```
PASS  src/components/admin/__tests__/AdvancedPageEditorSync.test.tsx
  AdvancedPageEditorSync - Synchronisation Bidirectionnelle
    Convertisseurs de format
      ✓ htmlToContentBlocks: convertit HTML simple en blocs (XXms)
      ✓ htmlToContentBlocks: gère les attributs HTML (XXms)
      ✓ htmlToContentBlocks: gère les images (XXms)
      ✓ contentBlocksToHtml: convertit les blocs en HTML valide (XXms)
      ✓ Conversion symétrique: HTML → Blocs → HTML (XXms)
      ✓ jsonToContentBlocks: parse le JSON valide (XXms)
      ✓ jsonToContentBlocks: gère le JSON invalide gracieux (XXms)
      ✓ Gère le HTML vide (XXms)
      ✓ Gère le HTML complexe avec imbrication (XXms)
    Rendu du composant
      ✓ Rend tous les onglets (XXms)
      ✓ Affiche le contenu initial (XXms)
      ✓ Onglet HTML affiche le contenu HTML (XXms)
      ✓ Onglet JSON affiche le contenu JSON (XXms)
      ✓ Onglet Formulaire affiche les champs texte (XXms)
    Synchronisation HTML → JSON
      ✓ Modification du HTML met à jour le JSON (XXms)
    Synchronisation JSON → HTML
      ✓ Modification du JSON met à jour le HTML (XXms)
    ...
    Tests finished in XXms
    30 tests passed, 0 failed
```

Si tests échouent: Voir section "Dépannage" ci-dessous
*/

// ============================================================================
// ÉTAPE 7: SÉCURITÉ (AVANT PRODUCTION)
// ============================================================================

/*
Avant de déployer en production, ajouter:

1. HTML Sanitization
   
   Fichier: src/hooks/useBidirectionalSync.ts
   
   npm install dompurify
   npm install -D @types/dompurify
   
   Dans le hook:
   ```typescript
   import DOMPurify from 'dompurify';
   
   export function htmlToContentBlocks(html: string) {
     // Sanitize avant parsing
     const cleanHtml = DOMPurify.sanitize(html);
     // ... reste du parsing
   }
   ```

2. Validation côté serveur
   
   Fichier: api/pages/[id].ts ou routes/pages.ts
   
   ```typescript
   // AVANT de sauvegarder:
   
   // Valider HTML
   const sanitized = DOMPurify.sanitize(req.body.content);
   
   // Valider JSON
   try {
     const blocks = JSON.parse(req.body.content_blocks);
     if (!Array.isArray(blocks)) throw new Error('Invalid');
   } catch (e) {
     return res.status(400).json({ error: 'Invalid content' });
   }
   
   // Valider taille
   if (req.body.content.length > 10_000_000) {
     return res.status(413).json({ error: 'Content too large' });
   }
   ```

3. Rate limiting
   
   ```typescript
   // Max 1 save par 5 secondes par utilisateur
   const lastSave = cache.get(`page:save:${userId}`);
   if (lastSave && Date.now() - lastSave < 5000) {
     return res.status(429).json({ error: 'Too many requests' });
   }
   cache.set(`page:save:${userId}`, Date.now());
   ```
*/

// ============================================================================
// DÉPANNAGE DURANT L'INTÉGRATION
// ============================================================================

/*
PROBLÈME: "Les onglets ne sont pas synchronisés"
CAUSE: Hook useBidirectionalSync n'est pas importé
SOLUTION: 
  - Vérifier import: import { useBidirectionalSync } from '@/hooks/useBidirectionalSync'
  - Vérifier que le fichier hook existe
  - Vérifier no syntax errors: npm test

PROBLÈME: "Erreur: 'AdvancedPageEditorSync' is not exported"
CAUSE: Manque export dans AdvancedPageEditorSync.tsx
SOLUTION:
  - Vérifier: export const AdvancedPageEditorSync: React.FC<{...}> = (...)
  - Vérifier no syntax errors: npm run lint

PROBLÈME: "API call échoue (404 ou 500)"
CAUSE: L'API endpoint n'existe pas ou n'est pas accessible
SOLUTION:
  - Vérifier que PUT /api/pages/:id existe
  - Vérifier CORS settings si cross-origin
  - Vérifier auth headers sont envoyés
  - Check server logs

PROBLÈME: "Auto-save sauvegarde trop souvent"
CAUSE: Debounce delay trop court
SOLUTION:
  // Dans useAutoSyncToServer hook
  const debouncedSave = useCallback(
    debounce(async (data) => {
      // ...save logic...
    }, 1000), // Augmenter de 1000ms à 2000ms ou plus
    []
  );

PROBLÈME: "Performance lente lors du rendu"
CAUSE: Conversion large HTML ou trop de re-renders
SOLUTION:
  - Profiler avec React DevTools Profiler tab
  - Ajouter useMemo() autour des convertisseurs
  - Considérer Web Worker pour HTML > 1MB
*/

// ============================================================================
// ROLLBACK D'URGENCE
// ============================================================================

/*
Si le nouveau composant ne fonctionne pas et que vous devez revenir:

1. Annuler les changements:
   git checkout -- src/components/admin/AdminPagesPanel.tsx

2. Supprimer les nouveaux fichiers:
   rm src/hooks/useBidirectionalSync.ts
   rm src/components/admin/AdvancedPageEditorSync.tsx

3. Vérifier que AdminPageEditor original fonctionne toujours:
   npm run dev

4. Commiter le rollback:
   git commit -m "Rollback AdvancedPageEditorSync integration"

5. Investiguer et corriger le problème
   - Lancer tests pour identifier le problème
   - Debugger le hook / composant
   - Re-intégrer une fois fixé
*/

// ============================================================================
// APRÈS INTÉGRATION RÉUSSIE
// ============================================================================

/*
Checklist post-intégration:

□ AdminPageEditor importé nulle part ailleurs?
  grep -r "import.*AdminPageEditor" src/
  Si zéro résultats → Peut supprimer AdminPageEditor.tsx

□ Tests passent tous?
  npm test
  
□ Linter passe?
  npm run lint
  
□ Build passe?
  npm run build
  
□ Aucun warning dans console dev?
  Ouvrir DevTools → Console tab
  
□ Performances acceptables?
  DevTools → Performance tab → Recorder
  Faire une édition → Vérifier temps entre keystroke et state update
  Cible: <300ms
  
□ SSE fonctionne?
  DevTools → Network tab
  Faire une modification → Chercher "events" ou "page:updated"
  
□ Responsive sur mobile?
  DevTools → Toggle device toolbar
  Tester les 5 onglets sur mobile
  Tester tactile sur les contrôles
*/

// ============================================================================
// DOCUMENTATION UTILISATEUR
// ============================================================================

/*
Après déploiement, envoyer à l'équipe:

1. BIDIRECTIONAL_SYNC_GUIDE.md (déjà créé)
   - Explique comment ça marche
   - Exemples d'utilisation
   - Formation rapide par rôle

2. Email avec sujet: "✨ Nouvel éditeur de pages avec sync en temps réel"
   Contenu suggéré:
   
   ---
   
   Bonjour l'équipe,
   
   L'éditeur de pages admin a été entièrement refondu pour supporter 
   la synchronisation en temps réel entre les différents modes d'édition:
   
   📝 Onglet HTML: Éditez le code HTML directement
   📊 Onglet JSON: Modifiez la structure de données
   📋 Onglet Formulaire: Remplissez les métadonnées
   🎨 Onglet Visuel: Constructeur drag-and-drop
   👁 Onglet Aperçu: Rendu en temps réel
   
   Quand vous modifiez dans UN mode, les autres se mettent à jour 
   instantanément, et le site public se met à jour <500ms après save.
   
   Tout est sauvegardé automatiquement 1s après votre dernière modification.
   
   Pour plus d'infos: Voir BIDIRECTIONAL_SYNC_GUIDE.md
   
   ---
   
   Merci,
   Dev Team
*/

// ============================================================================
// MÉTRIQUES À TRACKER
// ============================================================================

/*
Une fois en production, monitorer:

1. Erreurs de synchronisation
   analytics.track('sync_error', { error, onglet })
   
2. Latence de sync
   const start = Date.now();
   // ...sync...
   const latency = Date.now() - start;
   analytics.track('sync_latency', { latency })
   
3. Taux de succès auto-save
   analytics.track('save_success', { pageId, contentSize })
   analytics.track('save_failure', { pageId, error })
   
4. Utilisation des onglets
   analytics.track('tab_viewed', { tabName })
   
5. Temps pour première modification
   analytics.track('first_edit', { timeToFirstEdit })
   
Cibles:
- Sync latency: <300ms (95th percentile)
- Save success: >99%
- Auto-save response: <500ms
*/

// ============================================================================
// FIN DU GUIDE D'INTÉGRATION
// ============================================================================

export const IntegrationGuide = {
  steps: [
    "1. Vérifier que les fichiers existent",
    "2. Identifier les points d'intégration",
    "3. Remplacer l'import AdminPageEditor",
    "4. Remplacer le composant dans le JSX",
    "5. Tester l'intégration (manuel)",
    "6. Lancer les tests automatisés",
    "7. Ajouter la sécurité (production)",
    "8. Dépanner les problèmes",
    "9. Rollback si nécessaire",
    "10. Validation post-intégration"
  ],
  requiredFiles: [
    "src/hooks/useBidirectionalSync.ts",
    "src/components/admin/AdvancedPageEditorSync.tsx",
    "src/components/admin/__tests__/AdvancedPageEditorSync.test.tsx"
  ],
  modifiedFiles: [
    "src/components/admin/AdminPagesPanel.tsx" // Importer + utiliser nouveau composant
  ],
  estimatedTime: "30 minutes (incluant tests)",
  riskLevel: "LOW - Composant self-contained, pas de breaking changes"
};
