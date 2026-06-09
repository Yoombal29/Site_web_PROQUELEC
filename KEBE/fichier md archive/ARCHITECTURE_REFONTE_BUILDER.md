# Architecture Refonte Dashboard & Page Builder

## Le Concept : "Dynamic Block-Based Rendering"
Pour passer d'un CMS classique à un builder moderne (type Webflow/Elementor), le paradigme central change :
- **Avant** : `Page = HTML Statique` (stocké tel quel)
- **Après** : `Page = Arbre de Données` (JSON décrivant la structure, rendu à la volée)

---

## 1. Schéma de Base de Données (PostgreSQL)

Nous devons restructurer la base pour supporter ce paradigme.

### A. Table `pages` (Mise à jour)
Cette table stocke la "Définition" de la page.

```sql
CREATE TABLE public.pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    
    -- LE CŒUR DU SYSTÈME : Arbre des composants
    structure_json JSONB DEFAULT '[]', 
    -- Ex: [{ type: "hero", props: {...}, children: [...] }, ...]

    -- Métadonnées
    is_published BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
    version_id UUID, -- Pointe vers la dernière version stable
    
    -- SEO & Social
    seo_title VARCHAR(255),
    seo_description TEXT,
    og_image VARCHAR(255),
    
    -- Configuration Globale de la Page
    theme_config JSONB DEFAULT '{}', -- { primaryColor: "#FF0000", fontFamily: "Inter" }
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    author_id UUID REFERENCES auth.users(id)
);
```

### B. Table `page_components` (Bibliothèque de Blocs)
Stocke les "Blueprints" (modèles) de blocs réutilisables.

```sql
CREATE TABLE public.page_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,      -- "Hero V2 Dark"
    category VARCHAR(50) NOT NULL,   -- "Hero", "Features", "Pricing", "Footer"
    thumbnail_url VARCHAR(255),      -- Aperçu visuel pour le drag & drop
    
    default_structure JSONB NOT NULL,-- Structure JSON par défaut quand on drop le composant
    schema_props JSONB DEFAULT '{}', -- Définition des champs éditables (pour l'UI de droite)
    
    is_global BOOLEAN DEFAULT false, -- Si true, une modif ici se répercute partout
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### C. Table `page_versions` (Historique / Time Travel)
Permet le rollback et l'historique des modifications.

```sql
CREATE TABLE public.page_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
    
    structure_json JSONB NOT NULL,   -- Snapshot complet de la page à l'instant T
    theme_config JSONB,              -- Snapshot du thème
    
    commit_message VARCHAR(255),     -- "Ajout section équipe", "Correction header"
    author_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### D. Table `menu_items` (Synchronisation)
Lien dynamique avec les pages.

```sql
ALTER TABLE public.menu_items
ADD COLUMN linked_page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL;
-- Si linked_page_id est présent, l'URL est ignorée et calculée dynamiquement depuis la page.
```

---

## 2. Architecture React (Front-End & Admin)

### A. Le Moteur de Rendu : `<PageRenderer />`
Ce composant est **CRITIQUE**. Il est utilisé à deux endroits :
1.  **Sur le Site Public** : Pour afficher la page finale aux visiteurs.
2.  **Dans le Builder (Canvas)** : Pour afficher l'aperçu "Pixel Perfect" pendant l'édition.

```typescript
// Structure simplifiée du composant
const PageRenderer = ({ blocks }: { blocks: Block[] }) => {
  return (
    <div className="page-container">
      {blocks.map(block => {
         const Component = ComponentRegistry[block.type];
         return (
           <Component 
             key={block.id} 
             {...block.props} 
             data-block-id={block.id} // Pour le survol/sélection dans l'éditeur
           >
             {block.children && <PageRenderer blocks={block.children} />}
           </Component>
         );
      })}
    </div>
  );
};
```

### B. Le Registre de Composants : `ComponentRegistry`
Un mappage centralisé entre le "Type JSON" et le "Composant React".

```typescript
import { HeroSection } from '@/components/blocks/Hero';
import { FeatureGrid } from '@/components/blocks/Features';

export const ComponentRegistry = {
  'hero': HeroSection,
  'features': FeatureGrid,
  'text-block': TextBlock,
  'image': ImageBlock,
  // ...
};
```

### C. L'Interface Builder (Admin)
L'interface d'édition sera composée de 3 panneaux, gérés par un **Store Global (Zustand)**.

1.  **Sidebar Gauche (Bibliothèque)** :
    *   Liste les composants disponibles (depuis `page_components`).
    *   Permet le **Drag** vers le canvas.
2.  **Canvas Central (Zone d'édition)** :
    *   Affiche `<PageRenderer />` en mode "Édition".
    *   Gère le **Drop** (via `@dnd-kit`).
    *   Permet la **Sélection** au clic.
    *   Affiche les outils contextuels (Supprimer, Dupliquer, Monter/Descendre).
3.  **Sidebar Droite (Propriétés)** :
    *   Affiche les formulaires pour modifier le bloc sélectionné.
    *   **Contenu** : Textes, Images, Liens.
    *   **Style** : Couleurs, Marges (Tailwind classes builder).
    *   **Avancé** : ID, Classes CSS perso, Animation.

---

## 3. Plan d'Implémentation (4 Phases)

### Phase 1 : Fondations & Moteur (La "Base")
1.  Créer les migrations SQL pour mettre à jour `pages` et créer `page_blocks/versions`.
2.  Implémenter `PageRenderer` et le `ComponentRegistry` initial avec 2-3 blocs simples (Hero, Texte).
3.  Modifier `DynamicPage.tsx` (Front) pour utiliser `PageRenderer` si du JSON est présent.

### Phase 2 : Le Builder (L'Interface)
1.  Créer la route Admin `/admin/builder/[pageId]`.
2.  Mettre en place le Store Zustand (`useBuilderStore`) pour gérer l'arbre JSON en mémoire.
3.  Implémenter le Canvas avec `@dnd-kit` pour le Drag & Drop.
4.  Créer le panneau de propriétés droit connecté au bloc sélectionné.

### Phase 3 : Synchronisation & Menus (Le Liant)
1.  Mettre à jour l'API `/api/menu-items` pour résoudre les liens dynamiques (`linked_page_id`).
2.  Créer un Trigger BDD : Updates `menu_items` URL quand `pages.slug` change.
3.  Ajouter l'option "Lier au menu" dans les propriétés de la page du Builder.

### Phase 4 : Avancé (Templates & Versioning)
1.  Implémenter l'API `/api/pages/[id]/versions` (Save/Restore snapshots).
2.  Créer l'interface "Historique des versions" dans le Builder.
3.  Ajouter la fonction "Sauvegarder comme Template" (crée une entrée dans `page_components`).

---

## 4. Outils & Libs Recommandées
- **Drag & Drop** : `@dnd-kit/core`, `@dnd-kit/sortable` (Moderne, accessible).
- **State** : `zustand` (Léger, performant pour les arbres complexes).
- **Icones** : `lucide-react` (Déjà utilisé, parfait).
- **Forms** : `react-hook-form` (Pour le panneau de propriétés).
- **Rich Text** : `TipTap` ou conserver `Monaco` pour le code, et un éditeur léger pour le texte riche inline.
