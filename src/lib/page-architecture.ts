/**
 * Matrice officielle PROQUELEC : Contenu (Builder) · Hybride · Fonctionnel (TSX)
 */

export type PageArchitectureCategory = 'content' | 'hybrid' | 'functional';

export type PageArchitecturePriority = 'target' | 'legacy' | 'maintain';

export interface PageArchitectureEntry {
  route: string;
  slug: string;
  title: string;
  category: PageArchitectureCategory;
  /** Où modifier cette page */
  editor: string;
  hint: string;
  priority?: PageArchitecturePriority;
}

export const PAGE_ARCHITECTURE_LABELS: Record<
  PageArchitectureCategory,
  { label: string; emoji: string; short: string; color: string }
> = {
  content: {
    label: 'Contenu',
    emoji: '🟢',
    short: 'God Builder — édition visuelle complète',
    color: 'emerald',
  },
  hybrid: {
    label: 'Hybride',
    emoji: '🔵',
    short: 'TSX (logique) + Builder (contenu autour)',
    color: 'blue',
  },
  sections: {
    label: 'Sections',
    emoji: '🟡',
    short: 'Admin → Sections de page (legacy, à migrer)',
    color: 'amber',
  },
  functional: {
    label: 'Fonctionnel',
    emoji: '🔒',
    short: 'Code TSX — développeur uniquement',
    color: 'slate',
  },
};

/** Routes institutionnelles et publiques — référence PROQUELEC */
export const PAGE_ARCHITECTURE_MATRIX: PageArchitectureEntry[] = [
  // ── CIBLE : GOD BUILDER ──
  {
    route: '/contact',
    slug: 'contact',
    title: 'Contact',
    category: 'content',
    editor: 'God Builder',
    hint: 'Formulaire, hero et textes modifiables sans code.',
    priority: 'target',
  },
  {
    route: '/contact-premium',
    slug: 'contact-premium',
    title: 'Contact premium',
    category: 'content',
    editor: 'God Builder',
    hint: 'Landing contact avancée — templates Hero PROQUELEC.',
    priority: 'target',
  },
  {
    route: '/legal',
    slug: 'legal',
    title: 'Mentions légales',
    category: 'content',
    editor: 'God Builder',
    hint: 'Textes juridiques en blocs Craft ou HTML.',
    priority: 'target',
  },
  {
    route: '/certifications',
    slug: 'certifications',
    title: 'Certifications',
    category: 'content',
    editor: 'God Builder',
    hint: 'Page institutionnelle — privilégier templates Contenu.',
    priority: 'target',
  },
  {
    route: '/formations-proquelec',
    slug: 'formations-proquelec',
    title: 'Formations PROQUELEC',
    category: 'content',
    editor: 'God Builder',
    hint: 'Catalogue formation éditorial (hors inscription métier).',
    priority: 'target',
  },
  {
    route: '/expertises-techniques',
    slug: 'expertises-techniques',
    title: 'Expertises techniques',
    category: 'content',
    editor: 'God Builder',
    hint: 'Présentation des expertises — cartes et CTA.',
    priority: 'target',
  },

  // ── CONTENU (ex-Sections — migré vers Builder) ──
  {
    route: '/',
    slug: 'home',
    title: 'Accueil',
    category: 'content',
    editor: 'God Builder',
    hint: 'Page migrée depuis sections → Builder.',
    priority: 'target',
  },
  {
    route: '/utilite-publique',
    slug: 'utilite-publique',
    title: 'Utilité publique',
    category: 'content',
    editor: 'God Builder',
    hint: 'Page migrée depuis sections → Builder.',
    priority: 'target',
  },
  {
    route: '/formation-certification',
    slug: 'formation-certification',
    title: 'Formation & certification',
    category: 'content',
    editor: 'God Builder',
    hint: 'Page migrée depuis sections → Builder.',
    priority: 'target',
  },
  {
    route: '/normes-ressources',
    slug: 'normes-ressources',
    title: 'Normes & ressources',
    category: 'content',
    editor: 'God Builder',
    hint: 'Page migrée depuis sections → Builder.',
    priority: 'target',
  },
  {
    route: '/projets-realisations',
    slug: 'projets-realisations',
    title: 'Projets & réalisations',
    category: 'content',
    editor: 'God Builder',
    hint: 'Alias : /projets, /galerie.',
    priority: 'target',
  },
  {
    route: '/actualites-evenements',
    slug: 'actualites-evenements',
    title: 'Actualités & événements',
    category: 'content',
    editor: 'God Builder',
    hint: 'Alias : /actualites.',
    priority: 'target',
  },
  {
    route: '/partenaires',
    slug: 'partenaires',
    title: 'Partenaires',
    category: 'content',
    editor: 'God Builder',
    hint: '',
    priority: 'target',
  },
  {
    route: '/autorites',
    slug: 'autorites',
    title: 'Espace autorités',
    category: 'content',
    editor: 'God Builder',
    hint: 'Alias : /espace-autorites.',
    priority: 'target',
  },
  {
    route: '/menages',
    slug: 'menages',
    title: 'Espace ménages',
    category: 'content',
    editor: 'God Builder',
    hint: 'Alias : /espace-menages.',
    priority: 'target',
  },
  {
    route: '/professionnels',
    slug: 'professionnels',
    title: 'Espace professionnels',
    category: 'content',
    editor: 'God Builder',
    hint: 'Alias : /espace-professionnels.',
    priority: 'target',
  },
  {
    route: '/presse',
    slug: 'presse',
    title: 'Presse',
    category: 'content',
    editor: 'God Builder',
    hint: '',
    priority: 'target',
  },
  {
    route: '/social',
    slug: 'social',
    title: 'Réseaux sociaux',
    category: 'content',
    editor: 'God Builder',
    hint: '',
    priority: 'target',
  },
  {
    route: '/marches',
    slug: 'marches',
    title: 'Marchés publics',
    category: 'content',
    editor: 'God Builder',
    hint: '',
    priority: 'target',
  },
  {
    route: '/activities',
    slug: 'activities',
    title: 'Nos actions',
    category: 'content',
    editor: 'God Builder',
    hint: 'Alias : /nos-actions.',
    priority: 'target',
  },
  {
    route: '/formations',
    slug: 'formations',
    title: 'Formations (rubrique)',
    category: 'content',
    editor: 'God Builder',
    hint: 'Distinct de /formations-proquelec (CMS).',
    priority: 'target',
  },
  {
    route: '/blog',
    slug: 'blog',
    title: 'Blog (liste)',
    category: 'content',
    editor: 'God Builder + articles',
    hint: 'Liste éditoriale ; articles = /blog/:slug.',
    priority: 'target',
  },
  {
    route: '/avantages',
    slug: 'avantages',
    title: 'Avantages',
    category: 'content',
    editor: 'God Builder',
    hint: '',
    priority: 'target',
  },

  // ── HYBRIDE ──
  {
    route: '/about',
    slug: 'about',
    title: 'À propos',
    category: 'hybrid',
    editor: 'God Builder + About.tsx',
    hint: 'Composant React de base ; ajoutez hero/texte en blocs CMS.',
    priority: 'maintain',
  },
  {
    route: '/outils',
    slug: 'outils',
    title: 'Plateforme outils',
    category: 'hybrid',
    editor: 'God Builder + ToolsPlatform.tsx',
    hint: 'Logique outils en TSX ; bandeaux marketing en Builder.',
    priority: 'maintain',
  },
  {
    route: '/showroom',
    slug: 'showroom',
    title: 'Showroom',
    category: 'hybrid',
    editor: 'God Builder + Showroom.tsx',
    hint: 'Démos techniques verrouillées ; contenu éditorial autour.',
    priority: 'maintain',
  },
  {
    route: '/documents',
    slug: 'documents',
    title: 'Documents & ressources',
    category: 'hybrid',
    editor: 'God Builder + Documents.tsx',
    hint: 'Bibliothèque TSX ; intro/CTA en blocs Craft.',
    priority: 'maintain',
  },
  {
    route: '/events',
    slug: 'events',
    title: 'Événements',
    category: 'hybrid',
    editor: 'God Builder + Events.tsx',
    hint: 'Agenda métier en TSX ; mise en page éditoriale en Builder.',
    priority: 'maintain',
  },
  {
    route: '/labels',
    slug: 'labels',
    title: 'Labels & qualité',
    category: 'hybrid',
    editor: 'God Builder + Labels.tsx',
    hint: 'Label métier TSX ; storytelling en Builder.',
    priority: 'maintain',
  },
  {
    route: '/boutique-premium',
    slug: 'boutique-premium',
    title: 'Boutique premium',
    category: 'hybrid',
    editor: 'God Builder + BoutiquePremium.tsx',
    hint: 'E-commerce TSX ; pages promo en Builder.',
    priority: 'maintain',
  },

  // ── FONCTIONNEL (TSX) — échantillon public / pro ──
  {
    route: '/connexion',
    slug: 'connexion',
    title: 'Connexion',
    category: 'functional',
    editor: 'Code TSX (Auth.tsx)',
    hint: 'Authentification — ne pas redesigner dans le Builder.',
    priority: 'maintain',
  },
  {
    route: '/dashboard',
    slug: 'dashboard',
    title: 'Tableau de bord',
    category: 'functional',
    editor: 'Code TSX',
    hint: 'Espace utilisateur authentifié.',
    priority: 'maintain',
  },
  {
    route: '/admin',
    slug: 'admin',
    title: 'Administration',
    category: 'functional',
    editor: 'Code TSX',
    hint: 'Back-office — hors Builder contenu.',
    priority: 'maintain',
  },
  {
    route: '/admin/outils',
    slug: 'admin/outils',
    title: 'Outils Admin',
    category: 'functional',
    editor: 'Code TSX (Expert Dashboard)',
    hint: 'Console outils réservée aux administrateurs. /expert redirige vers cette route.',
    priority: 'maintain',
  },
  {
    route: '/ged',
    slug: 'ged',
    title: 'GED',
    category: 'functional',
    editor: 'Code TSX (GEDPage.tsx)',
    hint: 'Gestion documentaire — logique métier.',
    priority: 'maintain',
  },
  {
    route: '/expert-lab',
    slug: 'expert-lab',
    title: 'Expert Lab (portail)',
    category: 'functional',
    editor: 'Code TSX',
    hint: 'Hub IA / outils experts — routes /expert-lab/*.',
    priority: 'maintain',
  },
  {
    route: '/expert-lab/chat',
    slug: 'expert-lab/chat',
    title: 'Chat Expert IA',
    category: 'functional',
    editor: 'Code TSX',
    hint: 'Assistant conversationnel.',
    priority: 'maintain',
  },
  {
    route: '/expert-lab/calculators',
    slug: 'expert-lab/calculators',
    title: 'Calculateurs',
    category: 'functional',
    editor: 'Code TSX',
    hint: 'Calculs d\'ingénierie normative.',
    priority: 'maintain',
  },
  {
    route: '/projects',
    slug: 'projects',
    title: 'Projets (app)',
    category: 'functional',
    editor: 'Code TSX',
    hint: 'Gestion de projets chantier — distinct de /projets-realisations.',
    priority: 'maintain',
  },
  {
    route: '/office/document/new',
    slug: 'office/document/new',
    title: 'Éditeur document',
    category: 'functional',
    editor: 'Code TSX',
    hint: 'Suite bureautique intégrée.',
    priority: 'maintain',
  },
  {
    route: '/observatoire',
    slug: 'observatoire',
    title: 'Observatoire',
    category: 'functional',
    editor: 'Code TSX',
    hint: 'Tableaux de bord installations.',
    priority: 'maintain',
  },
  {
    route: '/schema-builder',
    slug: 'schema-builder',
    title: 'Schema Builder',
    category: 'functional',
    editor: 'Code TSX',
    hint: 'Schémas électriques interactifs.',
    priority: 'maintain',
  },
  {
    route: '/expert-kebe',
    slug: 'expert-kebe',
    title: 'Inspecteur KEBE',
    category: 'functional',
    editor: 'Code TSX',
    hint: 'Module inspection terrain.',
    priority: 'maintain',
  },
];

export const PAGE_ARCHITECTURE_STRATEGY = {
  title: 'Stratégie PROQUELEC — Pages du site',
  summary:
    'Contenu éditorial dans le God Builder · Outils métier en TSX · Hybride quand les deux coexistent · Sections legacy migrées vers Builder.',
  rules: [
    {
      category: 'content' as const,
      do: 'Créer toutes les nouvelles pages marketing ici (templates PROQUELEC).',
      dont: 'Ne pas coder en TSX une simple landing modifiable par la com.',
    },
    {
      category: 'hybrid' as const,
      do: 'Éditer hero, intro et CTA en Builder ; laisser la logique TSX intacte.',
      dont: 'Ne pas supprimer le composant React source.',
    },
    {
      category: 'content' as const,
      do: 'Modifier via God Builder (templates PROQUELEC). Anciennes sections migrées.',
      dont: 'Ne pas recréer le système sections legacy.',
    },
    {
      category: 'functional' as const,
      do: 'Développer en TSX ; optionnel : bloc FunctionalPageBlock pour prévisualiser.',
      dont: 'Ne pas tenter de recoder login, GED ou calculateurs en blocs Craft.',
    },
  ],
};

const slugIndex = new Map<string, PageArchitectureEntry>();
for (const entry of PAGE_ARCHITECTURE_MATRIX) {
  slugIndex.set(normalizeArchitectureSlug(entry.slug), entry);
  slugIndex.set(normalizeArchitectureSlug(entry.route.replace(/^\//, '')), entry);
}

export function normalizeArchitectureSlug(slug: string): string {
  return slug
    .replace(/^\//, '')
    .replace(/\/$/, '')
    .toLowerCase();
}

export type ResolvedPageArchitecture = PageArchitectureEntry & {
  source: 'registry' | 'database' | 'inferred';
};

type DbPageHints = {
  slug?: string;
  immutable?: boolean;
  design_options?: { page_type?: string } | null;
};

/** Résout le type d'une page (registre + métadonnées DB). */
export function resolvePageArchitecture(
  slugOrRoute: string,
  dbPage?: DbPageHints | null,
): ResolvedPageArchitecture | null {
  const normalized = normalizeArchitectureSlug(slugOrRoute);
  const fromRegistry = slugIndex.get(normalized);

  if (dbPage) {
    const pageType = dbPage.design_options?.page_type;
    if (pageType === 'hybrid') {
      return {
        ...(fromRegistry || defaultEntry(normalized, dbPage.slug || normalized)),
        category: 'hybrid',
        editor: 'God Builder + TSX',
        hint: 'Page hybride (design_options.page_type=hybrid). Éditez le contenu Craft ; la logique reste en TSX.',
        source: 'database',
      };
    }
    if (dbPage.immutable === true) {
      return {
        ...(fromRegistry || defaultEntry(normalized, dbPage.slug || normalized)),
        category: 'functional',
        editor: fromRegistry?.editor || 'Code TSX (verrouillée)',
        hint: 'Page verrouillée (immutable). Aperçu via FunctionalPageBlock uniquement.',
        source: 'database',
      };
    }
    if (!fromRegistry) {
      return {
        route: `/${normalized}`,
        slug: normalized,
        title: dbPage.slug || normalized,
        category: 'content',
        editor: 'God Builder',
        hint: 'Page CMS en base — édition visuelle complète.',
        priority: 'target',
        source: 'database',
      };
    }
  }

  if (fromRegistry) {
    return { ...fromRegistry, source: 'registry' };
  }

  return null;
}

function defaultEntry(slug: string, title: string): PageArchitectureEntry {
  return {
    route: `/${slug}`,
    slug,
    title,
    category: 'content',
    editor: 'God Builder',
    hint: '',
  };
}

export function getArchitectureBadgeClass(category: PageArchitectureCategory): string {
  const map: Record<PageArchitectureCategory, string> = {
    content: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    hybrid: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    functional: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  };
  return map[category];
}
