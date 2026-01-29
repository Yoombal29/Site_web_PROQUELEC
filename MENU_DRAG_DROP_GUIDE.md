# 🎯 Menu WordPress Avancé - Drag & Drop

## ✨ Nouvelles Fonctionnalités

### 1️⃣ Drag & Drop - Réorganiser les Menus
```
Glissez-déposez les menus pour les réordonner
La position est sauvegardée automatiquement
```

### 2️⃣ Submenus - Créer des Sous-menus
```
Glissez un menu SOUS un autre pour le transformer en sous-menu
Les sous-menus apparaissent lors du hover dans le frontend
```

### 3️⃣ Multi-type - Organiser par Catégorie
```
Menu Principal (📍)  - Menu d'en-tête
Pied de Page (🔗)    - Menu pied de page
Social (🌐)          - Liens réseaux sociaux
```

---

## 🏗️ Architecture

### Table `menu_items` Mise à Jour
```sql
-- Colonne qui supporte les submenus
parent_id UUID REFERENCES menu_items(id)

-- Colonne pour l'ordre
menu_order INTEGER DEFAULT 0
```

### Structure en Arborescence
```
Menu Principal
├─ Accueil
├─ Formations (parent_id = null)
│  ├─ Formations Proquelec (parent_id = Formations.id)
│  ├─ Certifications (parent_id = Formations.id)
│  └─ Labels (parent_id = Formations.id)
└─ Contact

Pied de Page
└─ Mentions Légales
```

---

## 🎮 Interface Utilisateur

### MenuManagerAdvanced Component
```
✅ Affichage arborescent (Tree View)
✅ Grip handles pour drag-drop
✅ Chevrons pour développer/réduire
✅ Comptage des sous-menus
✅ Zones de dépôt visibles
✅ Feedback visuel (isDragging)
```

### Drag & Drop Zones
```
┌─────────────────────────────────────────────┐
│ 📍 Menu Principal                           │
│ ├─ [Gestion] Accueil                        │
│ ├─ [Gestion] Formations (1 sous-menu)  ▼   │
│ │  └─ [Certifications]                      │
│ └─ [Gestion] Contact                        │
├─ Zone de dépôt → Glissez ici ←             │
└─────────────────────────────────────────────┘
```

---

## 🚀 Utilisation

### Accéder à l'Interface Admin
```
Importer le composant dans votre Admin Dashboard:

import { MenuManagerAdvanced } from '@/components/admin/MenuManagerAdvanced';

<Route path="/admin/menu" element={<MenuManagerAdvanced />} />
```

### Créer un Sous-menu

**Méthode 1: Depuis l'interface**
1. Cliquez "Ajouter un menu" (crée un menu racine)
2. Une fois créé, glissez-le SOUS un autre menu
3. Le menu devient automatiquement un sous-menu ✅

**Méthode 2: Drag & Drop Direct**
1. Glissez un menu existant sous un autre
2. La relation parent-child est créée
3. Le sous-menu disparaît du menu racine et se place sous le parent

### Réorganiser les Menus

```
1. Glissez-déposez les menus dans l'ordre que vous voulez
2. Les positions sont sauvegardées automatiquement
3. Cliquez le chevron ▼ pour voir les sous-menus
```

### Déplacer entre Catégories

```
Menu Principal → Pied de Page:
1. Glissez un menu du Menu Principal
2. Déposez-le dans la zone "Pied de Page"
3. Le menu change automatiquement de catégorie
```

---

## 💾 Données Stockées

### Avant (Sans Submenus)
```json
{
  "id": "menu-1",
  "title": "Formations",
  "url": "/formations",
  "menu_type": "main",
  "menu_order": 2,
  "parent_id": null
}
```

### Après (Avec Submenus)
```json
{
  "id": "menu-1",
  "title": "Formations",
  "url": "/formations",
  "menu_type": "main",
  "menu_order": 2,
  "parent_id": null
}

{
  "id": "menu-2",
  "title": "Certifications",
  "url": "/certifications",
  "menu_type": "main",
  "menu_order": 0,
  "parent_id": "menu-1"  // ← Référence au parent
}
```

---

## 🎨 Frontend - Affichage des Submenus

### DynamicMenu Met à Jour
```tsx
<DynamicMenu 
  type="main"
  className="flex gap-4"
  itemClassName="px-3 py-2 hover:bg-gray-100"
  subMenuClassName="hidden group-hover:block absolute bg-white border rounded shadow-lg"
/>
```

### Rendu HTML Généré
```html
<nav>
  <ul>
    <li class="group">
      <a href="/formations">Formations</a>
      <!-- Sous-menus visibles au hover -->
      <ul class="hidden group-hover:block">
        <li><a href="/certifications">Certifications</a></li>
        <li><a href="/labels">Labels</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

---

## 🔄 Flux de Synchronisation

```
Admin modifie menu
       ↓
React Beautiful DnD capture drag
       ↓
Mutation updateMenuItem appelée
       ↓
parent_id et menu_order mis à jour en BD
       ↓
React Query invalide cache
       ↓
Frontend recharge automatiquement
       ↓
Submenus affichés correctement ✅
```

---

## 🛠️ Configuration

### Installer les dépendances
```bash
npm install react-beautiful-dnd @types/react-beautiful-dnd
```

### Types TypeScript
```tsx
interface MenuItem {
  id: string;
  title: string;
  url: string;
  menu_type: 'main' | 'footer' | 'social';
  menu_order: number;
  is_active: boolean;
  parent_id?: string | null;  // ← Nouveau!
  target?: string;
  icon?: string;
}
```

---

## 📊 Cas d'Usage

### A. Menu de Formation Hiérarchisé
```
Formations (parent)
├─ Formations Proquelec
├─ Certifications
└─ Labels
```

**Résultat Frontend:**
```
Hover sur "Formations"
    ↓
Affiche sous-menu avec 3 liens
```

### B. Menu Produits Multi-niveaux
```
Produits (parent)
├─ Câbles (parent)
│  ├─ Câbles Électriques
│  └─ Câbles Réseaux
└─ Accessoires
```

### C. Footer Organisé
```
Pied de Page
├─ Mentions Légales
├─ Support (parent)
│  ├─ FAQ
│  ├─ Contact Support
│  └─ Tickets
└─ Politique de Confidentialité
```

---

## 🎯 Fonctionnalités Complètes

| Fonctionnalité | Avant | Après |
|---|---|---|
| **Réorganiser menus** | ❌ Code | ✅ Drag-drop |
| **Créer submenus** | ❌ SQL manuel | ✅ Drag un menu sous autre |
| **Voir hiérarchie** | ❌ Vue plate | ✅ Tree view avec chevrons |
| **Déplacer entre types** | ❌ Pas possible | ✅ Drag entre catégories |
| **Feedback visuel** | ❌ Non | ✅ Drag preview, zones actives |
| **Sauvegarde auto** | ❌ Manuel | ✅ Automatique |

---

## 🧪 Tests

### Test 1: Créer un Sous-menu
```
1. Cliquez "Ajouter un menu" → "Certifications"
2. Glissez-le sous "Formations"
3. Vérifiez qu'il s'affiche indentée sous Formations ✅
4. Rechargez la page → Data persiste ✅
```

### Test 2: Frontend Affichage
```
1. Hover sur "Formations" dans le header
2. Les sous-menus "Certifications" et "Labels" s'affichent ✅
3. Cliquez sur "Certifications" → Navigue vers page ✅
```

### Test 3: Réorganisation
```
1. Glissez "Accueil" à la place 5
2. Vérifiez que l'ordre change ✅
3. Rechargez → Ordre persiste ✅
```

---

## 🚀 Avantages par rapport à WordPress

```
WordPress:
- Drag-drop natif ✅
- Submenus en UI ✅
- Hiérarchie à N niveaux ✅

Notre Implémentation:
- TypeScript type-safe ✅
- React Query caching ✅
- Tailwind styling personnalisable ✅
- Supabase BD flexible ✅
+ Synchronisation temps réel ✅
+ Aucun page reload ✅
+ API REST propre ✅
```

---

## 📝 Prochaines Étapes

### Optionnel: Multi-niveaux Illimités
```tsx
// Supporter N niveaux de profondeur
renderMenuItems(items, parentId) {
  return items
    .filter(item => item.parent_id === parentId)
    .map(item => (
      <li>
        {renderLink(item)}
        {renderMenuItems(items, item.id)}
      </li>
    ));
}
```

### Optionnel: Drag-Drop Mobile
```tsx
// Utiliser react-dnd-touch-backend
import { TouchBackend } from 'react-dnd-touch-backend';
```

### Optionnel: Restrictions
```tsx
// Empêcher drag si >N sous-menus
canDrag = (item) => !(item.children?.length >= 5);
```

---

## ✨ Résumé

```
Avant:
- Menu statique codé en dur
- Pas de submenus
- Modifications = Code

Après:
✅ Menus dynamiques
✅ Drag-drop réorganisation
✅ Submenus hiérarchisés
✅ Interface WordPress-like
✅ Synchronisation en temps réel
✅ Type-safe TypeScript
```

**Votre site a maintenant un système de menu aussi puissant que WordPress!** 🎉
