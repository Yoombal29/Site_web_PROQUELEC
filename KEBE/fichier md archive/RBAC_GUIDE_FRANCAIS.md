# 🇫🇷 Guide d'Utilisation du Système RBAC - Interface Française

## 📖 Vue d'Ensemble

Le système RBAC (Role-Based Access Control) permet un contrôle d'accès granulaire sur toutes les fonctionnalités de la plateforme PROQUELEC. **Toute l'interface est en français** pour une meilleure expérience utilisateur.

---

## 🎯 Fonctionnalités Incluses

### ✅ Backend (Serveur)
- **Middleware `requirePermission`** : Protège les routes API
- **Endpoint `/api/user/permissions`** : Récupère les permissions de l'utilisateur connecté
- **Endpoint `/api/admin/permissions`** : Liste toutes les permissions (admin uniquement)
- **Endpoint `/api/admin/role-permissions`** : Mapping rôles → permissions (admin uniquement)
- **Messages d'erreur en français** : Tous les messages de permission refusée sont en français

### ✅ Frontend (React)
- **Hook `usePermissions`** : Vérifie les permissions côté client
- **Composant `<RequirePermission>`** : Affiche/masque du contenu selon les permissions
- **Page `/admin/permissions`** : Interface d'administration complète en français
- **Labels traduits** : Tous les noms de permissions sont traduits en français

---

## 🔐 Permissions Disponibles

### Projets
- `projects.view` → **Voir les projets**
- `projects.create` → **Créer des projets**
- `projects.edit` → **Modifier les projets**
- `projects.delete` → **Supprimer les projets**
- `projects.transition` → **Changer le statut réglementaire**

### Inspections
- `inspections.view` → **Voir les inspections**
- `inspections.create` → **Créer des inspections**
- `inspections.edit` → **Modifier les inspections**
- `inspections.validate` → **Valider les inspections**
- `inspections.delete` → **Supprimer les inspections**

### Audit
- `audit.view` → **Consulter le journal d'audit**
- `audit.export` → **Exporter les journaux d'audit**

### Documents
- `documents.upload` → **Téléverser des documents**
- `documents.delete` → **Supprimer des documents**

###Administration
- `admin.users` → **Gérer les utilisateurs**
- `admin.settings` → **Gérer les paramètres**
- `admin.permissions` → **Gérer les permissions**

---

## 👥 Rôles et Permissions

| Rôle | Description | Permissions |
|------|-------------|-------------|
| **Administrateur** | Accès complet au système | Toutes les permissions (17/17) |
| **Installateur** | Gestion projets & inspections | 8 permissions (projects.*, inspections.create/edit, documents.upload, audit.view) |
| **Client** | Consultation en lecture seule | 4 permissions (projects.view, inspections.view, documents.upload, audit.view) |
| **Autorité Réglementaire** | Validation & transitions d'état | 6 permissions (projects.transition, inspections.validate, audit.*) |

---

## 🛠️ Utilisation Côté Frontend

### 1. Utiliser le Hook `usePermissions`

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MonComposant() {
    const { hasPermission, permissions, isLoading } = usePermissions();

    if (hasPermission('projects.create')) {
        // L'utilisateur peut créer des projets
    }

    return (
        <div>
            {hasPermission('projects.edit') && (
                <ButtonModifier />
            )}
        </div>
    );
}
```

### 2. Utiliser le Composant `<RequirePermission>`

#### a) Masquer complètement un élément

```typescript
import { RequirePermission } from '@/components/permissions/RequirePermission';

<RequirePermission permission="projects.create">
    <Button onClick={creerProjet}>
        Créer un Projet
    </Button>
</RequirePermission>
```

#### b) Afficher un message d'erreur

```typescript
<RequirePermission permission="projects.delete" showMessage>
    <Button variant="destructive">Supprimer</Button>
</RequirePermission>
// Si pas de permission, affiche : "Accès refusé - Vous n'avez pas la permission requise : Supprimer les projets"
```

#### c) Afficher un fallback personnalisé

```typescript
<RequirePermission 
    permission="admin.settings"
    fallback={<p>Accès réservé aux administrateurs</p>}
>
    <PanneauParametres />
</RequirePermission>
```

### 3. Vérifier Plusieurs Permissions

#### Au moins une permission (OR)

```typescript
import { RequireAnyPermission } from '@/components/permissions/RequirePermission';

<RequireAnyPermission permissions={['projects.edit', 'projects.delete']}>
    <MenuActions />
</RequireAnyPermission>
```

#### Toutes les permissions requises (AND)

```typescript
import { RequireAllPermissions } from '@/components/permissions/RequirePermission';

<RequireAllPermissions permissions={['projects.edit', 'inspections.create']}>
    <EditeurAvance />
</RequireAllPermissions>
```

---

## 🔧 Utilisation Côté Backend

### Protéger une Route API

```javascript
// Avant
app.post('/api/projects', authenticateToken, async (req, res) => {
    // ...
});

// Après (RBAC)
app.post('/api/projects', authenticateToken, requirePermission('projects.create'), async (req, res) => {
    // ...
});
```

### Messages d'Erreur

Si un utilisateur sans permission essaie d'accéder à une route protégée, il reçoit :

```json
{
    "error": "Permission refusée",
    "message": "Vous n'avez pas la permission requise pour effectuer cette action.",
    "required_permission": "projects.create",
    "your_role": "client"
}
```

---

## 📊 Page d'Administration

Accès : **`/admin/permissions`** (réservé aux administrateurs)

### Onglets Disponibles

1. **Par Rôle** : Vue en cartes montrant toutes les permissions de chaque rôle
2. **Par Permission** : Vue regroupée par catégorie avec les rôles autorisés
3. **Matrice Complète** : Tableau croisé rôles × permissions

---

## 🧪 Tests & Validation

### Script de Test Automatique

```bash
node server/demo_rbac_francais.js
```

**Résultat attendu :**
- ✅ Endpoints API fonctionnels
- ✅ Messages d'erreur en français
- ✅ Permissions correctement vérifiées
- ✅ Mapping rôles → permissions exact

---

## 📌 Checklist d'Intégration

Voici comment intégrer RBAC dans vos composants existants :

- [ ] **Projets** : Ajouter `<RequirePermission permission="projects.edit">` autour du bouton "Modifier"
- [ ] **Projets** : Ajouter `requirePermission('projects.create')` à la route POST `/api/projects`
- [ ] **Inspections** : Protéger le bouton "Valider" avec `permission="inspections.validate"`
- [ ] **Audit** : Ajouter `<RequirePermission permission="audit.view">` pour l'onglet Audit
- [ ] **Menu Admin** : Ajouter un lien vers `/admin/permissions`
- [ ] **Dashboard** : Afficher les permissions actuelles avec `usePermissions()`

---

## 🎯 Exemple Complet : Bouton Protégé

Voici un exemple d'intégration complète dans un composant :

```typescript
import { usePermissions, PERMISSION_LABELS } from '@/hooks/usePermissions';
import { RequirePermission } from '@/components/permissions/RequirePermission';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function ProjectActions({ projectId }: { projectId: string }) {
    const { permissions } = usePermissions();

    return (
        <div className="flex gap-2">
            {/* Lecture : toujours visible */}
            <Button variant="outline" onClick={() => viewProject(projectId)}>
                Voir
            </Button>

            {/* Modification : protégé */}
            <RequirePermission permission="projects.edit">
                <Button onClick={() => editProject(projectId)}>
                    Modifier
                </Button>
            </RequirePermission>

            {/* Suppression : protégé + message d'erreur */}
            <RequirePermission permission="projects.delete" showMessage>
                <Button variant="destructive" onClick={() => deleteProject(projectId)}>
                    Supprimer
                </Button>
            </RequirePermission>

            {/* Badge de debug (optionnel) */}
            <Badge variant="outline">
                {permissions.length} permissions actives
            </Badge>
        </div>
    );
}
```

---

## 🔥 Bonnes Pratiques

1. **Toujours protéger les actions critiques** (création, modification, suppression, validation)
2. **Utiliser `showMessage={true}`** pour les boutons destructifs afin d'expliquer le refus
3. **Vérifier les permissions côté backend ET frontend** (double sécurité)
4. **Utiliser les labels français** via `PERMISSION_LABELS` pour l'affichage
5. **Tester avec différents rôles** pour valider les accès

---

## 🎊 Résultat

Avec ce système RBAC francisé, vous avez :

- ✅ **Sécurité renforcée** : Contrôle granulaire sur chaque action
- ✅ **Interface claire** : Messages et labels en français
- ✅ **Facilité d'utilisation** : Hook et composants React prêts à l'emploi
- ✅ **Administration simple** : Page dédiée pour gérer les permissions
- ✅ **Transparence** : Les utilisateurs savent pourquoi l'accès est refusé

---

**Pour toute question, consultez la documentation technique ou contactez l'équipe de développement.** 🚀
