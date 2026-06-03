// @ts-nocheck
/**
 * FunctionalPageBlock.tsx
 * Bloc Craft.js "design-locked" pour pages fonctionnelles.
 *
 * Dans le Builder : affiche un placeholder avec badge 🔒
 * Sur le site public : rend le composant React original
 */
import React, { lazy, Suspense } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { Lock, ExternalLink, Eye, FileCode, Loader2 } from 'lucide-react';

// ── Registry des pages fonctionnelles (lazy-loaded) ────
// Mappe chaque slug vers son composant React
// @ts-nocheck
const FUNCTIONAL_PAGE_REGISTRY: Record<
  string,
  React.LazyExoticComponent<React.ComponentType<any>> | null
> = {
  connexion: lazy(() => import('@/pages/Auth').then((m) => ({ default: m.default || m }))),
  login: lazy(() => import('@/pages/Auth').then((m) => ({ default: m.default || m }))),
  auth: lazy(() => import('@/pages/Auth').then((m) => ({ default: m.default || m }))),
  dashboard: lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.default || m }))),
  'admin/page-sections': lazy(() =>
    import('@/pages/admin/PageSectionsAdmin').then((m) => ({ default: m.default || m })),
  ),
  'admin/builder': null, // Le Builder lui-même — pas de rendu dans un bloc
  'admin/permissions': lazy(() =>
    import('@/pages/admin/PermissionsAdmin').then((m) => ({ default: m.default || m })),
  ),
  partner: lazy(() =>
    import('@/pages/admin/PartnerDashboard').then((m) => ({ default: m.default || m })),
  ),
  'admin-secondary': lazy(() =>
    import('@/pages/admin/AdminSecondaryDashboard').then((m) => ({ default: m.default || m })),
  ),
  ged: lazy(() => import('@/pages/GEDPage').then((m) => ({ default: m.default || m }))),
  'expert-kebe': lazy(() =>
    import('@/pages/InspecteurKEBE').then((m) => ({ default: m.default || m })),
  ),
  'rubrique-selector': lazy(() =>
    import('@/pages/RubriqueSelectorPage').then((m) => ({ default: m.default || m })),
  ),
  'schema-builder': lazy(() =>
    import('@/pages/SchemaBuilder').then((m) => ({ default: m.default || m })),
  ),
  'plan-du-site': lazy(() => import('@/pages/Sitemap').then((m) => ({ default: m.default || m }))),
  sitemap: lazy(() => import('@/pages/Sitemap').then((m) => ({ default: m.default || m }))),

  // Dashboards par rôle
  'dashboard-electricien': lazy(() =>
    import('@/pages/dashboards/ElectricianDashboard').then((m) => ({ default: m.default || m })),
  ),
  'dashboard-entreprise': lazy(() =>
    import('@/pages/dashboards/CompanyDashboard').then((m) => ({ default: m.default || m })),
  ),
  'dashboard-membre': lazy(() =>
    import('@/pages/dashboards/MemberDashboard').then((m) => ({ default: m.default || m })),
  ),

  // Expert Lab
  'expert-chat': lazy(() =>
    import('@/expert-lab/pages/ChatPage').then((m) => ({ default: m.default || m })),
  ),
  'expert-calculators': lazy(() =>
    import('@/expert-lab/pages/CalculatorsPage').then((m) => ({ default: m.default || m })),
  ),
  'expert-schemas': lazy(() =>
    import('@/expert-lab/pages/SchemasPage').then((m) => ({ default: m.default || m })),
  ),
  'expert-docs': lazy(() =>
    import('@/expert-lab/pages/DocsPage').then((m) => ({ default: m.default || m })),
  ),
  'expert-history': lazy(() =>
    import('@/expert-lab/pages/HistoryPage').then((m) => ({ default: m.default || m })),
  ),
  'expert-config': lazy(() =>
    import('@/expert-lab/pages/ConfigPage').then((m) => ({ default: m.default || m })),
  ),
  'expert-ai-providers': lazy(() =>
    import('@/expert-lab/pages/AIProvidersPage').then((m) => ({ default: m.default || m })),
  ),
  'expert-logs': lazy(() =>
    import('@/expert-lab/pages/LogsPage').then((m) => ({ default: m.default || m })),
  ),
  'expert-scanner': lazy(() =>
    import('@/expert-lab/pages/ComplianceScannerPage').then((m) => ({ default: m.default || m })),
  ),
  'expert-models': lazy(() =>
    import('@/expert-lab/pages/ModelsPage').then((m) => ({ default: m.default || m })),
  ),
  'expert-stats': lazy(() =>
    import('@/expert-lab/pages/StatsPage').then((m) => ({ default: m.default || m })),
  ),

  // Projects & Inspections
  projects: lazy(() =>
    import('@/pages/projects/ProjectList').then((m) => ({ default: m.default || m })),
  ),
  diagnostics: lazy(() =>
    import('@/pages/inspections/InspectionDetail').then((m) => ({ default: m.default || m })),
  ),
  observatoire: lazy(() =>
    import('@/pages/observatoire/ObservatoirePage').then((m) => ({ default: m.default || m })),
  ),

  // Analytics
  analytics: lazy(() => import('@/pages/AnalyticsPage').then((m) => ({ default: m.default || m }))),
  'demo-rbac': lazy(() =>
    import('@/pages/examples/RBACDemo').then((m) => ({ default: m.default || m })),
  ),
};

// Métadonnées descriptives pour chaque page fonctionnelle
const FUNCTIONAL_PAGE_META: Record<string, { title: string; description: string; route: string }> =
  {
    connexion: {
      title: 'Connexion',
      description: "Page de connexion et d'inscription",
      route: '/connexion',
    },
    login: { title: 'Connexion', description: 'Page de connexion', route: '/login' },
    auth: { title: 'Authentification', description: "Page d'authentification", route: '/auth' },
    dashboard: {
      title: 'Tableau de bord',
      description: 'Dashboard utilisateur',
      route: '/dashboard',
    },
    'admin/page-sections': {
      title: 'Sections de page',
      description: 'Gestion des sections admin',
      route: '/admin/page-sections',
    },
    'admin/builder': {
      title: 'God Mode Builder',
      description: 'Éditeur de pages visuel',
      route: '/admin/builder',
    },
    'admin/permissions': {
      title: 'Permissions',
      description: 'Gestion des droits RBAC',
      route: '/admin/permissions',
    },
    partner: { title: 'Dashboard Partenaire', description: 'Espace partenaire', route: '/partner' },
    'admin-secondary': {
      title: 'Admin Secondaire',
      description: 'Dashboard admin secondaire',
      route: '/admin-secondary',
    },
    ged: { title: 'GED', description: 'Gestion Électronique de Documents', route: '/ged' },
    'expert-kebe': {
      title: 'Inspecteur KEBE',
      description: "Module d'inspection KEBE",
      route: '/expert-kebe',
    },
    'rubrique-selector': {
      title: 'Sélecteur de rubriques',
      description: 'Sélection de rubriques techniques',
      route: '/rubrique-selector',
    },
    'schema-builder': {
      title: 'Schema Builder',
      description: 'Constructeur de schémas',
      route: '/schema-builder',
    },
    'plan-du-site': {
      title: 'Plan du site',
      description: 'Plan du site PROQUELEC',
      route: '/plan-du-site',
    },
    sitemap: { title: 'Sitemap', description: 'Plan du site (SEO)', route: '/sitemap' },

    // Dashboards par rôle
    'dashboard-electricien': {
      title: 'Dashboard Électricien',
      description: 'Tableau de bord pour les électriciens',
      route: '/dashboard/electricien',
    },
    'dashboard-entreprise': {
      title: 'Dashboard Entreprise',
      description: 'Tableau de bord pour les entreprises',
      route: '/dashboard/entreprise',
    },
    'dashboard-membre': {
      title: 'Dashboard Membre',
      description: 'Tableau de bord pour les membres',
      route: '/dashboard/membre',
    },

    // Expert Lab
    'expert-chat': {
      title: 'Chat Expert',
      description: 'Assistant IA conversationnel',
      route: '/expert/chat',
    },
    'expert-calculators': {
      title: 'Calculateurs Expert',
      description: "Calculateurs d'ingénierie",
      route: '/expert/calculators',
    },
    'expert-schemas': {
      title: 'Schémas Expert',
      description: 'Gestion des schémas électriques',
      route: '/expert/schemas',
    },
    'expert-docs': {
      title: 'Documentation Expert',
      description: 'Documentation technique',
      route: '/expert/docs',
    },
    'expert-history': {
      title: 'Historique Expert',
      description: 'Historique des actions',
      route: '/expert/history',
    },
    'expert-config': {
      title: 'Configuration Expert',
      description: "Configuration de l'expert lab",
      route: '/expert/config',
    },
    'expert-ai-providers': {
      title: 'Fournisseurs IA',
      description: 'Configuration des providers IA',
      route: '/expert/ai-providers',
    },
    'expert-logs': { title: 'Logs Expert', description: 'Journaux système', route: '/expert/logs' },
    'expert-scanner': {
      title: 'Scanner Conformité',
      description: 'Scanner de conformité normative',
      route: '/expert/scanner',
    },
    'expert-models': {
      title: 'Modèles IA',
      description: "Gestion des modèles d'IA",
      route: '/expert/models',
    },
    'expert-stats': {
      title: 'Statistiques Expert',
      description: "Statistiques d'utilisation",
      route: '/expert/stats',
    },

    // Projects & Inspections
    projects: { title: 'Projets', description: 'Gestion des projets', route: '/projects' },
    diagnostics: {
      title: 'Diagnostics',
      description: 'Inspections et diagnostics',
      route: '/diagnostics',
    },
    observatoire: {
      title: 'Observatoire',
      description: 'Observatoire des installations',
      route: '/observatoire',
    },

    // Analytics & Demo
    analytics: {
      title: 'Analytics',
      description: 'Tableaux de bord analytiques',
      route: '/analytics',
    },
    'demo-rbac': {
      title: 'Démo RBAC',
      description: 'Démonstration des permissions',
      route: '/demo/rbac',
    },
  };

// ── Settings Panel ────────────────────────────────────
const FunctionalPageSettings = () => {
  const {
    actions: { setProp },
    slug,
    pageTitle,
  } = useNode((node) => ({
    slug: node.data.props.slug,
    pageTitle: node.data.props.pageTitle,
  }));

  const meta = FUNCTIONAL_PAGE_META[slug];

  return (
    <div className="space-y-4 p-2">
      <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <Lock className="w-4 h-4 text-amber-400" />
        <span className="text-xs text-amber-300 font-medium">Bloc fonctionnel verrouillé</span>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Page</p>
        <p className="text-sm text-white font-bold">{pageTitle || slug}</p>
      </div>

      {meta && (
        <div className="space-y-1">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Description
          </p>
          <p className="text-sm text-slate-300">{meta.description}</p>
        </div>
      )}

      {meta && (
        <div className="space-y-1">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Route</p>
          <p className="text-sm font-mono text-indigo-400">{meta.route}</p>
        </div>
      )}

      <div className="pt-2 border-t border-slate-700">
        <p className="text-xs text-slate-500 italic">
          Ce bloc encapsule une page fonctionnelle. Pour modifier son contenu, éditez le composant
          React source directement.
        </p>
      </div>
    </div>
  );
};

// ── Block Component ────────────────────────────────────
interface FunctionalPageBlockProps {
  slug: string;
  pageTitle?: string;
}

export const FunctionalPageBlock = (props: FunctionalPageBlockProps) => {
  const { slug = 'dashboard', pageTitle } = props;
  const {
    connectors: { connect, drag },
    selected,
  } = useNode();
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));
  const meta = FUNCTIONAL_PAGE_META[slug];
  const title = pageTitle || meta?.title || slug;
  const LazyComponent = FUNCTIONAL_PAGE_REGISTRY[slug];

  // Mode Builder : affiche un placeholder
  if (enabled) {
    return (
      <div
        ref={(ref) => {
          if (ref) connect(drag(ref));
        }}
        className={`relative group transition-all duration-200 ${
          selected
            ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-slate-900'
            : 'hover:ring-1 hover:ring-amber-500/50'
        }`}
      >
        {/* Placeholder design-locked */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl overflow-hidden">
          {/* Header badge */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Fonctionnel
              </span>
            </div>
            {meta?.route && (
              <a
                href={meta.route}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded transition"
              >
                <ExternalLink className="w-3 h-3" />
                Voir
              </a>
            )}
          </div>

          {/* Content preview */}
          <div className="p-6 flex flex-col items-center justify-center min-h-[120px]">
            <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center mb-3">
              <FileCode className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-200 mb-1">{title}</p>
            {meta?.description && (
              <p className="text-xs text-slate-500 text-center max-w-xs">{meta.description}</p>
            )}
            <div className="flex items-center gap-2 mt-3">
              <Eye className="w-3 h-3 text-slate-600" />
              <span className="text-[10px] text-slate-600">
                Contenu géré par le composant React
              </span>
            </div>
          </div>

          {/* Bottom indicator */}
          <div className="px-4 py-2 bg-slate-800/50 border-t border-slate-700 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60"></div>
            <span className="text-[10px] text-slate-500">
              Bloc design-locked — non modifiable dans le Builder
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Mode public : rend le composant fonctionnel réel
  if (!LazyComponent) {
    return (
      <div className="min-h-[200px] flex items-center justify-center bg-slate-100">
        <div className="text-center p-8">
          <FileCode className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500">{title}</p>
          <a
            href={meta?.route || `/${slug}`}
            className="text-xs text-blue-500 hover:underline mt-1 inline-block"
          >
            Voir la page →
          </a>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-[200px] flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        </div>
      }
    >
      <LazyComponent />
    </Suspense>
  );
};

// ── Craft.js Metadata ──────────────────────────────────
FunctionalPageBlock.craft = {
  displayName: 'Page Fonctionnelle',
  props: {
    slug: 'dashboard',
    pageTitle: 'Tableau de bord',
  },
  related: {
    settings: FunctionalPageSettings,
  },
};

// ── Utility: build toolbox items for all functional pages ──
export function getFunctionalPageToolboxItems() {
  return Object.entries(FUNCTIONAL_PAGE_META).map(([slug, meta]) => ({
    slug,
    label: meta.title,
    description: meta.description,
    route: meta.route,
  }));
}
