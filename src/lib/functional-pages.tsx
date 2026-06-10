import React, { lazy } from 'react';

export type FunctionalPageDefinition = {
  slug: string;
  title: string;
  description: string;
  route: string;
  securityLevel?: 'public' | 'authenticated' | 'admin';
  component: React.LazyExoticComponent<React.ComponentType<any>> | null;
  aliases?: string[];
};

const lazyDefault = (loader: () => Promise<any>) =>
  lazy(() => loader().then((module) => ({ default: module.default || module })));

export const FUNCTIONAL_PAGE_DEFINITIONS: FunctionalPageDefinition[] = [
  {
    slug: 'connexion',
    title: 'Connexion',
    description: "Page de connexion et d'inscription",
    route: '/connexion',
    securityLevel: 'public',
    component: lazyDefault(() => import('@/pages/Auth')),
  },
  {
    slug: 'login',
    title: 'Connexion',
    description: 'Page de connexion',
    route: '/login',
    securityLevel: 'public',
    component: lazyDefault(() => import('@/pages/Auth')),
  },
  {
    slug: 'auth',
    title: 'Authentification',
    description: "Page d'authentification",
    route: '/auth',
    securityLevel: 'public',
    component: lazyDefault(() => import('@/pages/Auth')),
  },
  {
    slug: 'dashboard',
    title: 'Tableau de bord',
    description: 'Dashboard utilisateur',
    route: '/dashboard',
    securityLevel: 'authenticated',
    component: lazyDefault(() => import('@/pages/Dashboard')),
  },
  {
    slug: 'admin/page-sections',
    title: 'Sections de page',
    description: 'Gestion des sections admin',
    route: '/admin/page-sections',
    securityLevel: 'admin',
    component: lazyDefault(() => import('@/pages/admin/PageSectionsAdmin')),
  },
  {
    slug: 'admin/builder',
    title: 'God Mode Builder',
    description: 'Editeur de pages visuel',
    route: '/admin/builder',
    securityLevel: 'admin',
    component: null,
  },
  {
    slug: 'admin/permissions',
    title: 'Permissions',
    description: 'Gestion des droits RBAC',
    route: '/admin/permissions',
    securityLevel: 'admin',
    component: lazyDefault(() => import('@/pages/admin/PermissionsAdmin')),
  },
  {
    slug: 'partner',
    title: 'Dashboard Partenaire',
    description: 'Espace partenaire',
    route: '/partner',
    securityLevel: 'authenticated',
    component: lazyDefault(() => import('@/pages/admin/PartnerDashboard')),
  },
  {
    slug: 'admin-secondary',
    title: 'Admin Secondaire',
    description: 'Dashboard admin secondaire',
    route: '/admin-secondary',
    securityLevel: 'admin',
    component: lazyDefault(() => import('@/pages/admin/AdminSecondaryDashboard')),
  },
  {
    slug: 'ged',
    title: 'GED',
    description: 'Gestion Electronique de Documents',
    route: '/ged',
    securityLevel: 'authenticated',
    component: lazyDefault(() => import('@/pages/GEDPage')),
  },
  {
    slug: 'expert-kebe',
    title: 'Inspecteur KEBE',
    description: "Module d'inspection KEBE",
    route: '/expert-kebe',
    securityLevel: 'public',
    component: lazyDefault(() => import('@/pages/InspecteurKEBE')),
  },
  {
    slug: 'rubrique-selector',
    title: 'Selecteur de rubriques',
    description: 'Selection de rubriques techniques',
    route: '/rubrique-selector',
    securityLevel: 'public',
    component: lazyDefault(() => import('@/pages/RubriqueSelectorPage')),
  },
  {
    slug: 'schema-builder',
    title: 'Schema Builder',
    description: 'Constructeur de schemas',
    route: '/schema-builder',
    securityLevel: 'public',
    component: lazyDefault(() => import('@/pages/SchemaBuilder')),
  },
  {
    slug: 'plan-du-site',
    title: 'Plan du site',
    description: 'Plan du site PROQUELEC',
    route: '/plan-du-site',
    securityLevel: 'public',
    component: lazyDefault(() => import('@/pages/Sitemap')),
  },
  {
    slug: 'sitemap',
    title: 'Sitemap',
    description: 'Plan du site SEO',
    route: '/sitemap',
    securityLevel: 'public',
    component: lazyDefault(() => import('@/pages/Sitemap')),
  },
  {
    slug: 'dashboard/electricien',
    aliases: ['dashboard-electricien'],
    title: 'Dashboard Electricien',
    description: 'Tableau de bord pour les electriciens',
    route: '/dashboard/electricien',
    securityLevel: 'authenticated',
    component: lazyDefault(() => import('@/pages/dashboards/ElectricianDashboard')),
  },
  {
    slug: 'dashboard/entreprise',
    aliases: ['dashboard-entreprise'],
    title: 'Dashboard Entreprise',
    description: 'Tableau de bord pour les entreprises',
    route: '/dashboard/entreprise',
    securityLevel: 'authenticated',
    component: lazyDefault(() => import('@/pages/dashboards/CompanyDashboard')),
  },
  {
    slug: 'dashboard/membre',
    aliases: ['dashboard-membre'],
    title: 'Dashboard Membre',
    description: 'Tableau de bord pour les membres',
    route: '/dashboard/membre',
    securityLevel: 'authenticated',
    component: lazyDefault(() => import('@/pages/dashboards/MemberDashboard')),
  },
  {
    slug: 'expert/chat',
    aliases: ['expert-chat'],
    title: 'Chat Expert',
    description: 'Assistant IA conversationnel',
    route: '/expert/chat',
    securityLevel: 'admin',
    component: lazyDefault(() => import('@/expert-lab/pages/ChatPage')),
  },
  {
    slug: 'expert/calculators',
    aliases: ['expert-calculators'],
    title: 'Calculateurs Expert',
    description: "Calculateurs d'ingenierie",
    route: '/expert/calculators',
    securityLevel: 'authenticated',
    component: lazyDefault(() => import('@/expert-lab/pages/CalculatorsPage')),
  },
  {
    slug: 'expert/schemas',
    aliases: ['expert-schemas'],
    title: 'Schemas Expert',
    description: 'Gestion des schemas electriques',
    route: '/expert/schemas',
    securityLevel: 'authenticated',
    component: lazyDefault(() => import('@/expert-lab/pages/SchemasPage')),
  },
  {
    slug: 'expert/docs',
    aliases: ['expert-docs'],
    title: 'Documentation Expert',
    description: 'Documentation technique',
    route: '/expert/docs',
    securityLevel: 'authenticated',
    component: lazyDefault(() => import('@/expert-lab/pages/DocsPage')),
  },
  {
    slug: 'expert/history',
    aliases: ['expert-history'],
    title: 'Historique Expert',
    description: 'Historique des actions',
    route: '/expert/history',
    securityLevel: 'admin',
    component: lazyDefault(() => import('@/expert-lab/pages/HistoryPage')),
  },
  {
    slug: 'expert/config',
    aliases: ['expert-config'],
    title: 'Configuration Expert',
    description: "Configuration de l'expert lab",
    route: '/expert/config',
    securityLevel: 'admin',
    component: lazyDefault(() => import('@/expert-lab/pages/ConfigPage')),
  },
  {
    slug: 'expert/ai-providers',
    aliases: ['expert-ai-providers'],
    title: 'Fournisseurs IA',
    description: 'Configuration des providers IA',
    route: '/expert/ai-providers',
    securityLevel: 'admin',
    component: lazyDefault(() => import('@/expert-lab/pages/AIProvidersPage')),
  },
  {
    slug: 'expert/logs',
    aliases: ['expert-logs'],
    title: 'Logs Expert',
    description: 'Journaux systeme',
    route: '/expert/logs',
    securityLevel: 'admin',
    component: lazyDefault(() => import('@/expert-lab/pages/LogsPage')),
  },
  {
    slug: 'expert/scanner',
    aliases: ['expert-scanner'],
    title: 'Scanner Conformite',
    description: 'Scanner de conformite normative',
    route: '/expert/scanner',
    securityLevel: 'admin',
    component: lazyDefault(() => import('@/expert-lab/pages/ComplianceScannerPage')),
  },
  {
    slug: 'expert/models',
    aliases: ['expert-models'],
    title: 'Modeles IA',
    description: "Gestion des modeles d'IA",
    route: '/expert/models',
    securityLevel: 'admin',
    component: lazyDefault(() => import('@/expert-lab/pages/ModelsPage')),
  },
  {
    slug: 'expert/stats',
    aliases: ['expert-stats'],
    title: 'Statistiques Expert',
    description: "Statistiques d'utilisation",
    route: '/expert/stats',
    securityLevel: 'admin',
    component: lazyDefault(() => import('@/expert-lab/pages/StatsPage')),
  },
  {
    slug: 'projects',
    title: 'Projets',
    description: 'Gestion des projets',
    route: '/projects',
    securityLevel: 'authenticated',
    component: lazyDefault(() => import('@/pages/projects/ProjectList')),
  },
  {
    slug: 'diagnostics',
    title: 'Diagnostics',
    description: 'Inspections et diagnostics',
    route: '/diagnostics',
    securityLevel: 'authenticated',
    component: lazyDefault(() => import('@/pages/inspections/InspectionDetail')),
  },
  {
    slug: 'observatoire',
    title: 'Observatoire',
    description: 'Observatoire des installations',
    route: '/observatoire',
    securityLevel: 'admin',
    component: lazyDefault(() => import('@/pages/observatoire/ObservatoirePage')),
  },
  {
    slug: 'analytics',
    title: 'Analytics',
    description: 'Tableaux de bord analytiques',
    route: '/analytics',
    securityLevel: 'authenticated',
    component: lazyDefault(() => import('@/pages/AnalyticsPage')),
  },
  {
    slug: 'demo/rbac',
    aliases: ['demo-rbac'],
    title: 'Demo RBAC',
    description: 'Demonstration des permissions',
    route: '/demo/rbac',
    securityLevel: 'public',
    component: lazyDefault(() => import('@/pages/examples/RBACDemo')),
  },
  {
    slug: 'abonnements',
    title: 'Abonnements',
    description: "Page d'abonnement avec paiement",
    route: '/abonnements',
    securityLevel: 'public',
    component: lazyDefault(() => import('@/pages/SubscriptionPage')),
  },
  {
    slug: 'contact',
    title: 'Contact',
    description: 'Page de contact avec formulaire et informations',
    route: '/contact',
    securityLevel: 'public',
    component: lazyDefault(() =>
      import('@/components/blocks/ProquelecBlocksPlus').then((m) => ({
        default: m.ContactPremiumBlock,
      })),
    ),
  },
];

const FUNCTIONAL_PAGE_LOOKUP = new Map<string, FunctionalPageDefinition>();

for (const definition of FUNCTIONAL_PAGE_DEFINITIONS) {
  FUNCTIONAL_PAGE_LOOKUP.set(definition.slug, definition);
  for (const alias of definition.aliases || []) {
    FUNCTIONAL_PAGE_LOOKUP.set(alias, definition);
  }
}

export function getFunctionalPageDefinition(slug: string | undefined) {
  if (!slug) return undefined;
  return FUNCTIONAL_PAGE_LOOKUP.get(slug);
}

export function isFunctionalPageSlug(slug: string | undefined) {
  return Boolean(getFunctionalPageDefinition(slug));
}

export function getFunctionalPageToolboxItems() {
  return FUNCTIONAL_PAGE_DEFINITIONS.map((definition) => ({
    slug: definition.slug,
    label: definition.title,
    description: definition.description,
    route: definition.route,
  }));
}
