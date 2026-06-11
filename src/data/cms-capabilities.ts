import {
  Accessibility,
  BarChart3,
  BookOpen,
  Braces,
  Brush,
  ClipboardCheck,
  FileText,
  GitBranch,
  LayoutDashboard,
  LockKeyhole,
  MousePointerClick,
  Presentation,
  Sparkles,
} from 'lucide-react';
import type { ElementType } from 'react';

export type CmsCapabilityCategory =
  | 'Design'
  | 'Architecture'
  | 'Admin'
  | 'Tests'
  | 'Sécurité'
  | 'Données'
  | 'Documentation'
  | 'Workflow';

export type CmsCapabilityStatus = 'opérationnel' | 'à renforcer' | 'à connecter';

export interface CmsCapability {
  id: string;
  tools: string;
  category: CmsCapabilityCategory;
  title: string;
  benefit: string;
  freeUse: string;
  cmsImpact: string;
  currentAsset: string;
  recommendedAction: string;
  deliverables: string[];
  status: CmsCapabilityStatus;
  maturity: number;
  priority: 'Haute' | 'Moyenne' | 'Basse';
  icon: ElementType;
}

export const cmsCapabilities: CmsCapability[] = [
  {
    id: 'frontend-design',
    tools: 'frontend-design / frontend-skill',
    category: 'Design',
    title: 'Design premium Builder',
    benefit: 'Améliorer les pages Builder, les templates premium, les classes pq-* et le rendu mobile.',
    freeUse: 'Utilisable gratuitement en appliquant les conventions CSS internes, sans service externe.',
    cmsImpact:
      'Les modèles officiels restent cohérents même quand le webmaster colle du HTML dans le Builder.',
    currentAsset: 'Design system pq-* et modèles premium déjà présents.',
    recommendedAction:
      'Contrôler chaque nouveau modèle avec les classes pq-* avant publication.',
    deliverables: ['Bibliothèque pq-*', 'Templates premium', 'Checklist responsive'],
    status: 'opérationnel',
    maturity: 86,
    priority: 'Haute',
    icon: Sparkles,
  },
  {
    id: 'web-design-guidelines',
    tools: 'web-design-guidelines',
    category: 'Design',
    title: 'Audit UX et accessibilité',
    benefit: 'Auditer accessibilité, UX, cohérence visuelle et erreurs responsive.',
    freeUse: 'Audit local par règles : contrastes, labels, hiérarchie, mobile, textes qui débordent.',
    cmsImpact:
      'Réduit les pages cassées après publication et protège la lisibilité institutionnelle.',
    currentAsset: 'CSS responsive, shadcn/Radix et scripts de contrôle à ajouter.',
    recommendedAction:
      'Ajouter un audit automatique avant déploiement et une checklist webmaster.',
    deliverables: ['Rapport UX', 'Checklist accessibilité', 'Corrections prioritaires'],
    status: 'à renforcer',
    maturity: 72,
    priority: 'Haute',
    icon: Accessibility,
  },
  {
    id: 'shadcn',
    tools: 'shadcn',
    category: 'Admin',
    title: 'Admin robuste',
    benefit: 'Renforcer dialogs, tables, formulaires, alertes et modales de l’administration.',
    freeUse: 'Le projet possède déjà les composants Radix/shadcn locaux, sans achat ni SaaS.',
    cmsImpact:
      'Les workflows admin deviennent plus fiables : permissions, utilisateurs, formulaires, médias.',
    currentAsset: 'Composants UI dans src/components/ui.',
    recommendedAction:
      'Standardiser les panneaux admin complexes autour des composants Card, Table, Tabs, Alert.',
    deliverables: ['Panneaux admin homogènes', 'Tables lisibles', 'Dialogues accessibles'],
    status: 'opérationnel',
    maturity: 82,
    priority: 'Haute',
    icon: LayoutDashboard,
  },
  {
    id: 'composition-patterns',
    tools: 'composition-patterns',
    category: 'Architecture',
    title: 'Architecture React maintenable',
    benefit: 'Mieux structurer les composants React du Builder et éviter le code fragile.',
    freeUse:
      'Patrons de composition appliqués directement au code : données séparées, composants purs, helpers.',
    cmsImpact:
      'Le Builder évolue plus facilement quand les templates, panneaux et outils sont découplés.',
    currentAsset: 'Data-driven tools et registres de templates déjà amorcés.',
    recommendedAction:
      'Extraire les nouveaux blocs en composants composables au lieu de gros switchs isolés.',
    deliverables: ['Composants composables', 'Registres typés', 'Moins de duplication'],
    status: 'à renforcer',
    maturity: 68,
    priority: 'Moyenne',
    icon: Braces,
  },
  {
    id: 'react-best-practices',
    tools: 'react-best-practices',
    category: 'Architecture',
    title: 'Performance React',
    benefit: 'Optimiser performance, lazy loading, re-render et architecture React.',
    freeUse: 'Optimisations locales : useMemo utile, découpage par page, chargement différé.',
    cmsImpact:
      'L’admin et le Builder restent fluides même avec beaucoup de templates, médias et outils.',
    currentAsset: 'Vite, React Query, lazy routes et bundles déjà utilisés partiellement.',
    recommendedAction:
      'Auditer les pages lourdes du Builder et déplacer les grands panneaux en lazy imports.',
    deliverables: ['Audit bundle', 'Lazy loading', 'Réduction des re-render'],
    status: 'à renforcer',
    maturity: 70,
    priority: 'Moyenne',
    icon: Brush,
  },
  {
    id: 'webapp-testing',
    tools: 'webapp-testing',
    category: 'Tests',
    title: 'Tests Builder et admin',
    benefit: 'Tester drag/drop, Builder, admin et permissions avec Playwright et screenshots.',
    freeUse: 'Playwright est déjà dans le projet, les tests peuvent tourner localement ou en CI.',
    cmsImpact:
      'Détecte les régressions avant VPS : drag/drop bloqué, route admin cassée, page blanche.',
    currentAsset: 'Configuration Playwright existante.',
    recommendedAction:
      'Créer un parcours smoke test : login, admin, outils, Builder, publication.',
    deliverables: ['Tests e2e', 'Screenshots d’échec', 'Rapport QA'],
    status: 'à renforcer',
    maturity: 64,
    priority: 'Haute',
    icon: MousePointerClick,
  },
  {
    id: 'security-best-practices',
    tools: 'security-best-practices',
    category: 'Sécurité',
    title: 'Sécurité rôles et API',
    benefit: 'Auditer rôles, permissions, routes admin, API, tokens et accès refusés.',
    freeUse:
      'Audit statique local et contrôles de permissions sans dépendre d’un fournisseur externe.',
    cmsImpact:
      'Évite qu’un admin légitime soit bloqué ou qu’un rôle faible accède à une zone sensible.',
    currentAsset: 'RBAC, permissions admin et routes protégées existantes.',
    recommendedAction:
      'Vérifier la cohérence entre sidebar, panneaux admin, API et permissions serveur.',
    deliverables: ['Matrice RBAC', 'Audit routes', 'Correctifs accès refusé'],
    status: 'à renforcer',
    maturity: 66,
    priority: 'Haute',
    icon: LockKeyhole,
  },
  {
    id: 'data-analysis',
    tools: 'data-analysis',
    category: 'Données',
    title: 'Analyse CSV / Excel',
    benefit: 'Analyser dossiers, paiements, certifications et utilisateurs.',
    freeUse:
      'Lecture locale des exports CSV/Excel avec les dépendances déjà installées dans le projet.',
    cmsImpact:
      'Les équipes peuvent transformer les données admin en décisions : relances, conformité, formation.',
    currentAsset: 'read-excel-file, write-excel-file, sql.js et modules documents.',
    recommendedAction:
      'Ajouter des exports propres et un script d’analyse standard pour les données métier.',
    deliverables: ['Exports CSV', 'Synthèses Markdown', 'Indicateurs métier'],
    status: 'à connecter',
    maturity: 58,
    priority: 'Moyenne',
    icon: FileText,
  },
  {
    id: 'chart-visualization',
    tools: 'chart-visualization',
    category: 'Données',
    title: 'Graphiques observatoire',
    benefit: 'Créer des graphiques pour observatoire, conformité, formations et statistiques.',
    freeUse: 'Recharts est déjà inclus : aucun coût pour les graphiques du CMS.',
    cmsImpact:
      'Les pages Observatoire et Admin deviennent lisibles pour les décideurs et partenaires.',
    currentAsset: 'Recharts utilisé dans admin et observatoire.',
    recommendedAction:
      'Centraliser les jeux de données observatoire et afficher des graphiques normalisés.',
    deliverables: ['Graphiques conformité', 'KPI formations', 'Suivi campagnes'],
    status: 'opérationnel',
    maturity: 78,
    priority: 'Haute',
    icon: BarChart3,
  },
  {
    id: 'gh-cli-git-commit',
    tools: 'gh-cli / git-commit',
    category: 'Workflow',
    title: 'Workflow GitHub propre',
    benefit: 'Améliorer commits, releases, issues et PR.',
    freeUse: 'Git et GitHub CLI peuvent être utilisés sans coût pour un dépôt déjà existant.',
    cmsImpact:
      'Chaque correction CMS est traçable : quoi, pourquoi, test, déploiement.',
    currentAsset: 'Scripts npm, Husky et lint-staged présents.',
    recommendedAction:
      'Ajouter un guide de commit/release et une checklist pré-déploiement.',
    deliverables: ['Convention commit', 'Checklist release', 'Notes de version'],
    status: 'à renforcer',
    maturity: 62,
    priority: 'Moyenne',
    icon: GitBranch,
  },
  {
    id: 'doc-coauthoring',
    tools: 'doc-coauthoring',
    category: 'Documentation',
    title: 'Documentation webmaster',
    benefit: 'Produire documentation admin, procédures webmaster et guides utilisateurs.',
    freeUse: 'Markdown local dans docs/, versionné avec le code et utilisable sans Notion.',
    cmsImpact:
      'Le webmaster sait créer une page, publier un modèle, vérifier les styles et escalader un bug.',
    currentAsset: 'Dossier docs et README styles existants.',
    recommendedAction:
      'Générer un guide admin CMS relié aux capacités et aux procédures QA.',
    deliverables: ['Guide admin', 'Procédure Builder', 'FAQ support'],
    status: 'opérationnel',
    maturity: 76,
    priority: 'Haute',
    icon: BookOpen,
  },
  {
    id: 'slides',
    tools: 'slides',
    category: 'Documentation',
    title: 'Supports PowerPoint',
    benefit: 'Générer supports PROQUELEC : formations, campagnes, bilans.',
    freeUse: 'pptxgenjs est présent : génération locale de présentations sans abonnement.',
    cmsImpact:
      'Les bilans CMS et campagnes peuvent être présentés aux partenaires avec un format propre.',
    currentAsset: 'Dépendance pptxgenjs installée.',
    recommendedAction:
      'Créer un générateur de deck standard : formation, campagne, bilan CMS.',
    deliverables: ['Deck PPTX', 'Plan de formation', 'Bilan partenaire'],
    status: 'à connecter',
    maturity: 55,
    priority: 'Moyenne',
    icon: Presentation,
  },
  {
    id: 'agent-browser-dogfood',
    tools: 'agent-browser / dogfood',
    category: 'Tests',
    title: 'QA réel des parcours',
    benefit: 'Faire du QA réel : admin, création page, publication, login, permissions.',
    freeUse:
      'Les parcours peuvent être automatisés avec Playwright local et complétés par une checklist manuelle.',
    cmsImpact:
      'Les bugs visibles par le webmaster sont capturés avant mise en production.',
    currentAsset: 'Playwright, tests existants et script superadmin.',
    recommendedAction:
      'Maintenir une suite smoke-test et un rapport dogfood après chaque grosse modification.',
    deliverables: ['Parcours QA', 'Rapport bug', 'Screenshots'],
    status: 'à renforcer',
    maturity: 63,
    priority: 'Haute',
    icon: ClipboardCheck,
  },
];

export const cmsCapabilityCategories = Array.from(
  new Set(cmsCapabilities.map((capability) => capability.category)),
) as CmsCapabilityCategory[];

export const cmsCapabilityStatusLabels: Record<CmsCapabilityStatus, string> = {
  opérationnel: 'Opérationnel',
  'à renforcer': 'À renforcer',
  'à connecter': 'À connecter',
};

export const cmsCapabilitySummary = {
  total: cmsCapabilities.length,
  operational: cmsCapabilities.filter((capability) => capability.status === 'opérationnel').length,
  highPriority: cmsCapabilities.filter((capability) => capability.priority === 'Haute').length,
  averageMaturity: Math.round(
    cmsCapabilities.reduce((sum, capability) => sum + capability.maturity, 0) /
      cmsCapabilities.length,
  ),
};

export const cmsCapabilityChartData = cmsCapabilityCategories.map((category) => {
  const items = cmsCapabilities.filter((capability) => capability.category === category);
  return {
    category,
    count: items.length,
    maturity: Math.round(items.reduce((sum, item) => sum + item.maturity, 0) / items.length),
  };
});

export const cmsCapabilityRoadmap = [
  {
    phase: 'Phase 1',
    title: 'Stabiliser le Builder',
    items: ['Audit pq-*', 'QA drag/drop', 'tests permissions', 'modèles premium'],
    owner: 'Webmaster + Admin technique',
  },
  {
    phase: 'Phase 2',
    title: 'Structurer les données',
    items: ['exports CSV/Excel', 'indicateurs observatoire', 'graphiques Recharts'],
    owner: 'Admin métier',
  },
  {
    phase: 'Phase 3',
    title: 'Industrialiser la publication',
    items: ['docs admin', 'slides formation', 'checklist release', 'rapport dogfood'],
    owner: 'Direction + webmaster',
  },
];
