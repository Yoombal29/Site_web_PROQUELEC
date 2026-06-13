import { lazy, Suspense, useEffect, useMemo } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from 'next-themes';
import { ThemeSync } from '@/components/ThemeSync';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NotificationContainer } from '@/components/NotificationContainer';
import ConstructionPage from '@/components/ConstructionPage';
import FunctionalBuilderRoute from '@/components/FunctionalBuilderRoute';
import { useConstructionMode } from '@/hooks/useConstructionMode';
import { useSession } from '@/hooks/useSession';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useDynamicRoutes, type DynamicRoute } from '@/hooks/useDynamicRoutes';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';
import { useEcommerceStore } from '@/stores/ecommerce.store';

// Lazy-loaded pages
const DynamicPage = lazy(() => import('./pages/DynamicPage'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Documents = lazy(() => import('./pages/Documents'));
const Events = lazy(() => import('./pages/Events'));
const Labels = lazy(() => import('./pages/Labels'));
const NotFound = lazy(() => import('./pages/NotFound'));

const Sitemap = lazy(() => import('./pages/Sitemap'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Auth = lazy(() => import('./pages/Auth'));
const PartnerDashboard = lazy(() => import('./pages/admin/PartnerDashboard'));
const SchemaBuilder = lazy(() => import('./pages/SchemaBuilder'));
const RubriqueSelectorPage = lazy(() => import('./pages/RubriqueSelectorPage'));
const Showroom = lazy(() => import('./pages/Showroom'));
const ToolsPlatform = lazy(() => import('./pages/ToolsPlatform'));
const ObservatoirePage = lazy(() => import('./pages/observatoire/ObservatoirePage'));
const GEDPage = lazy(() => import('./pages/GEDPage'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const BoutiquePremium = lazy(() => import('./pages/BoutiquePremium'));

// Expert Lab
const ExpertDashboard = lazy(() => import('./expert-lab/pages/Dashboard'));
const ExpertChatPage = lazy(() => import('./expert-lab/pages/ChatPage'));
const InspecteurKEBE = lazy(() => import('./pages/InspecteurKEBE'));

// Office Suite Imports
const DocumentEditorPage = lazy(() =>
  import('./pages/DocumentEditorPage').then((mod) => ({ default: mod.DocumentEditorPage })),
);
const SpreadsheetEditorPage = lazy(() =>
  import('./pages/SpreadsheetEditorPage').then((m) => ({ default: m.SpreadsheetEditorPage })),
);
const PresentationEditorPage = lazy(() =>
  import('./pages/PresentationEditorPage').then((m) => ({ default: m.PresentationEditorPage })),
);
const AnalyticsPageLazy = lazy(() =>
  import('./pages/AnalyticsPage').then((mod) => ({ default: mod.AnalyticsPage })),
);
const ExpertCalculatorsPage = lazy(() => import('./expert-lab/pages/CalculatorsPage'));
const ExpertLogsPage = lazy(() => import('./expert-lab/pages/LogsPage'));
const ExpertConfigPage = lazy(() => import('./expert-lab/pages/ConfigPage'));
const ExpertDocsPage = lazy(() => import('./expert-lab/pages/DocsPage'));
const ExpertAIProvidersPage = lazy(() => import('./expert-lab/pages/AIProvidersPage'));
const ExpertHistoryPage = lazy(() => import('./expert-lab/pages/HistoryPage'));
const ExpertSchemasPage = lazy(() => import('./expert-lab/pages/SchemasPage'));
const ExpertModelsPage = lazy(() => import('./expert-lab/pages/ModelsPage'));
const ExpertStatsPage = lazy(() => import('./expert-lab/pages/StatsPage'));
const ComplianceScannerPage = lazy(() => import('./expert-lab/pages/ComplianceScannerPage'));

const ElectricianDashboard = lazy(() => import('./pages/dashboards/ElectricianDashboard'));
const CompanyDashboard = lazy(() => import('./pages/dashboards/CompanyDashboard'));
const MemberDashboard = lazy(() => import('./pages/dashboards/MemberDashboard'));
const ProjectList = lazy(() => import('./pages/projects/ProjectList'));
const ProjectDetail = lazy(() => import('./pages/projects/ProjectDetail'));
const InspectionDetail = lazy(() => import('./pages/inspections/InspectionDetail'));

const PermissionsAdmin = lazy(() => import('./pages/admin/PermissionsAdmin'));
const ToolsManagerPage = lazy(() => import('./pages/admin/ToolsManagerPage'));
const ToolsStatsPage = lazy(() => import('./pages/admin/ToolsStatsPage'));
const AppDetailPage = lazy(() => import('./pages/AppDetailPage'));
const RBACDemo = lazy(() => import('./pages/examples/RBACDemo'));

const BuilderReleaseManagerPage = lazy(() => import('./pages/admin/BuilderReleaseManagerPage'));
const BuilderPage = lazy(() => import('./pages/admin/BuilderPage'));
const BuilderConfigPage = lazy(() => import('./pages/admin/BuilderConfigPage'));
const CraftBuilderPage = lazy(() => import('./pages/admin/CraftBuilderPage'));
const SchematicEditorPage = lazy(() => import('./pages/admin/SchematicEditorPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const AppContent = () => {
  const { isConstructionMode, isLoading } = useConstructionMode();
  const { isLoading: isLoadingSession } = useSession();
  const { isAdmin } = useIsAdmin();
  const { data: dynamicRoutes, isLoading: isLoadingRoutes } = useDynamicRoutes();

  useEffect(() => {
    void useEcommerceStore.getState().bootstrapCommerce();
  }, []);

  // Si le mode construction est activé ET l'utilisateur n'est pas admin
  // Afficher la page de construction (sauf pour /dashboard et /connexion)
  const showConstructionPage = isConstructionMode && !isAdmin;

  const router = useMemo(() => {
    // Fonction pour créer les routes dynamiquement
    const createRoutes = () => {
      const routes = [
        // Routes accessibles même en mode construction
        {
          path: '/connexion',
          element: (
            <FunctionalBuilderRoute slug="connexion" title="Connexion" fallback={<Auth />} />
          ),
        },
        {
          path: '/login',
          element: <FunctionalBuilderRoute slug="login" title="Login" fallback={<Auth />} />,
        },
        {
          path: '/auth',
          element: <FunctionalBuilderRoute slug="auth" title="Auth" fallback={<Auth />} />,
        },
        { path: '/dashboard', element: <Dashboard /> },
        {
          path: '/admin',
          element: (
            <RoleProtectedRoute allowedRoles={['admin', 'secondary_admin']}>
              <AdminDashboard />
            </RoleProtectedRoute>
          ),
        },
      ];

      if (showConstructionPage) {
        // Mode construction : toutes les routes publiques mènent à la page de construction
        routes.push(
          { path: '/', element: <ConstructionPage /> },
          { path: '/about', element: <ConstructionPage /> },
          { path: '/utilite-publique', element: <ConstructionPage /> },
          { path: '/formation-certification', element: <ConstructionPage /> },
          { path: '/activities', element: <ConstructionPage /> },
          { path: '/labels', element: <ConstructionPage /> },
          { path: '/documents', element: <ConstructionPage /> },
          { path: '/boutique', element: <ConstructionPage /> },
          { path: '/boutique-premium', element: <ConstructionPage /> },
          { path: '/events', element: <ConstructionPage /> },
          { path: '/certifications', element: <ConstructionPage /> },
          { path: '/expertises', element: <ConstructionPage /> },
          { path: '/formations', element: <ConstructionPage /> },
          { path: '/trainings', element: <ConstructionPage /> },
          { path: '/blog', element: <ConstructionPage /> },
          { path: '/blog/:slug', element: <ConstructionPage /> },
          { path: '/contact', element: <ConstructionPage /> },
          { path: '/outils', element: <ConstructionPage /> },
          { path: '/showroom', element: <ConstructionPage /> },
          { path: '/legal', element: <ConstructionPage /> },
          ...((dynamicRoutes as DynamicRoute[])?.map((route) => ({
            path: route.path,
            element: <ConstructionPage />,
          })) || []),
          { path: '*', element: <ConstructionPage /> },
        );
      } else {
        // Mode normal : routes complètes
        routes.push(
          { path: '/', element: <DynamicPage /> },
          { path: '/about', element: <DynamicPage /> },
          { path: '/utilite-publique', element: <DynamicPage /> },
          { path: '/formation-certification', element: <DynamicPage /> },
          { path: '/normes-ressources', element: <DynamicPage /> },
          { path: '/projets-realisations', element: <DynamicPage /> },
          { path: '/actualites-evenements', element: <DynamicPage /> },
          { path: '/partenaires', element: <DynamicPage /> },
          { path: '/contact', element: <DynamicPage /> },
          { path: '/contact-premium', element: <DynamicPage /> },
          { path: '/activities', element: <DynamicPage /> },
          {
            path: '/labels',
            element: (
              <FunctionalBuilderRoute
                slug="labels"
                title="Labels & Qualité"
                fallback={<Labels />}
              />
            ),
          },
          { path: '/legal', element: <DynamicPage /> },
          { path: '/certifications', element: <DynamicPage /> },
          { path: '/formations', element: <DynamicPage /> },
          { path: '/trainings', element: <DynamicPage /> },
          { path: '/actualites', element: <DynamicPage /> },
          { path: '/presse', element: <DynamicPage /> },
          { path: '/autorites', element: <DynamicPage /> },
          { path: '/menages', element: <DynamicPage /> },
          { path: '/professionnels', element: <DynamicPage /> },
          { path: '/social', element: <DynamicPage /> },
          { path: '/espace-menages', element: <DynamicPage /> },
          { path: '/espace-professionnels', element: <DynamicPage /> },
          { path: '/espace-autorites', element: <DynamicPage /> },

          // --- PAGES CMS DYNAMIQUES ---
          {
            path: '/documents',
            element: (
              <FunctionalBuilderRoute
                slug="documents"
                title="Documents & Ressources"
                fallback={<Documents />}
              />
            ),
          },
          {
            path: '/boutique-premium',
            element: (
              <FunctionalBuilderRoute
                slug="boutique-premium"
                title="Boutique premium"
                fallback={<BoutiquePremium />}
              />
            ),
          },
          {
            path: '/boutique',
            element: (
              <FunctionalBuilderRoute
                slug="boutique-premium"
                title="Boutique premium"
                fallback={<BoutiquePremium />}
              />
            ),
          },
          {
            path: '/events',
            element: (
              <FunctionalBuilderRoute
                slug="events"
                title="Évènements"
                fallback={<Events />}
              />
            ),
          },

          { path: '/expertises-techniques', element: <DynamicPage /> },
          { path: '/expertises', element: <DynamicPage /> },
          { path: '/expert-lab', element: <DynamicPage /> },
          { path: '/formations-proquelec', element: <DynamicPage /> },
          { path: '/blog', element: <DynamicPage /> },
          {
            path: '/blog/:slug',
            element: (
              <FunctionalBuilderRoute
                slug="blog/{slug}"
                title="Blog {slug}"
                fallback={<BlogPost />}
              />
            ),
          },
          {
            path: '/outils',
            element: (
              <FunctionalBuilderRoute
                slug="outils"
                title="Outils"
                fallback={<ToolsPlatform />}
              />
            ),
          },
          {
            path: '/showroom',
            element: (
              <FunctionalBuilderRoute
                slug="showroom"
                title="Showroom Technique"
                fallback={<Showroom />}
              />
            ),
          },
          {
            path: '/rubrique-selector',
            element: (
              <FunctionalBuilderRoute
                slug="rubrique-selector"
                title="Sélecteur de rubriques"
                fallback={<RubriqueSelectorPage />}
              />
            ),
          },
          {
            path: '/schema-builder',
            element: (
              <FunctionalBuilderRoute
                slug="schema-builder"
                title="Schema Builder"
                fallback={<SchemaBuilder />}
              />
            ),
          },
          { path: '/apps/:appId', element: <AppDetailPage /> },
          { path: '/avantages', element: <DynamicPage /> },
          {
            path: '/dashboard/electricien',
            element: (
              <RoleProtectedRoute allowedRoles={['admin', 'electricien']}>
                <ElectricianDashboard />
              </RoleProtectedRoute>
            ),
          },
          {
            path: '/dashboard/entreprise',
            element: (
              <RoleProtectedRoute allowedRoles={['admin', 'entreprise']}>
                <CompanyDashboard />
              </RoleProtectedRoute>
            ),
          },
          {
            path: '/dashboard/membre',
            element: (
              <RoleProtectedRoute allowedRoles={['admin', 'membre']}>
                <MemberDashboard />
              </RoleProtectedRoute>
            ),
          },

          // Backoffices sécurisés avec RBAC
          {
            path: '/admin/builder-release-manager',
            element: (
              <RoleProtectedRoute allowedRoles={['admin']}>
                <Suspense fallback={<div className="p-8">Chargement...</div>}>
                  <BuilderReleaseManagerPage />
                </Suspense>
              </RoleProtectedRoute>
            ),
          },
          {
            path: '/admin-secondary',
            element: (
              <RoleProtectedRoute allowedRoles={['admin', 'secondary_admin']}>
                <AdminDashboard />
              </RoleProtectedRoute>
            ),
          },

          {
            path: '/partner',
            element: (
              <RoleProtectedRoute allowedRoles={['partner']}>
                <PartnerDashboard />
              </RoleProtectedRoute>
            ),
          },

          // Expert Lab Routes (Souveraineté & Ingénierie)
          {
            path: '/expert',
            element: (
              <RoleProtectedRoute allowedRoles={['admin', 'secondary_admin']}>
                <ExpertDashboard />
              </RoleProtectedRoute>
            ),
          },
          {
            path: '/expert/chat',
            element: (
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ExpertChatPage />
              </RoleProtectedRoute>
            ),
          },
          {
            path: '/expert-kebe',
            element: (
              <FunctionalBuilderRoute
                slug="expert-kebe"
                title="Inspecteur KEBE"
                fallback={<InspecteurKEBE />}
              />
            ),
          },
          { path: '/expert/calculators', element: <ExpertCalculatorsPage /> },
          { path: '/expert/schemas', element: <ExpertSchemasPage /> },
          { path: '/expert/docs', element: <ExpertDocsPage /> },
          {
            path: '/expert/history',
            element: (
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ExpertHistoryPage />
              </RoleProtectedRoute>
            ),
          },
          {
            path: '/expert/config',
            element: (
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ExpertConfigPage />
              </RoleProtectedRoute>
            ),
          },
          {
            path: '/expert/ai-providers',
            element: (
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ExpertAIProvidersPage />
              </RoleProtectedRoute>
            ),
          },
          {
            path: '/expert/logs',
            element: (
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ExpertLogsPage />
              </RoleProtectedRoute>
            ),
          },
          {
            path: '/expert/scanner',
            element: (
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ComplianceScannerPage />
              </RoleProtectedRoute>
            ),
          },
          {
            path: '/expert/models',
            element: (
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ExpertModelsPage />
              </RoleProtectedRoute>
            ),
          },
          {
            path: '/expert/stats',
            element: (
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ExpertStatsPage />
              </RoleProtectedRoute>
            ),
          },

          // GED Route (Document Management)
          {
            path: '/ged',
            element: <FunctionalBuilderRoute slug="ged" title="GED" fallback={<GEDPage />} />,
          },
          {
            path: '/abonnements',
            element: (
              <FunctionalBuilderRoute
                slug="abonnements"
                title="Abonnements"
                fallback={<SubscriptionPage />}
              />
            ),
          },
          {
            path: '/subscriptions',
            element: (
              <FunctionalBuilderRoute
                slug="abonnements"
                title="Abonnements"
                fallback={<SubscriptionPage />}
              />
            ),
          },

          // ELECTRO-GED 4.0: Project Management
          { path: '/projects', element: <ProjectList /> },
          { path: '/projects/:id', element: <ProjectDetail /> },
          {
            path: '/observatoire',
            element: (
              <RoleProtectedRoute allowedRoles={['admin', 'ministere']}>
                <ObservatoirePage />
              </RoleProtectedRoute>
            ),
          },
          { path: '/diagnostics/:id', element: <InspectionDetail /> },

          // Office Suite Routes
          {
            path: '/office/document/new',
            element: (
              <Suspense
                fallback={
                  <div className="min-h-screen bg-white flex items-center justify-center text-slate-600">
                    Chargement de l'éditeur…
                  </div>
                }
              >
                <DocumentEditorPage />
              </Suspense>
            ),
          },
          {
            path: '/office/document/:id',
            element: (
              <Suspense
                fallback={
                  <div className="min-h-screen bg-white flex items-center justify-center text-slate-600">
                    Chargement de l'éditeur…
                  </div>
                }
              >
                <DocumentEditorPage />
              </Suspense>
            ),
          },
          {
            path: '/office/document/template/:templateId',
            element: (
              <Suspense
                fallback={
                  <div className="min-h-screen bg-white flex items-center justify-center text-slate-600">
                    Chargement de l'éditeur…
                  </div>
                }
              >
                <DocumentEditorPage />
              </Suspense>
            ),
          },
          { path: '/office/spreadsheet/new', element: <SpreadsheetEditorPage /> },
          { path: '/office/spreadsheet/:id', element: <SpreadsheetEditorPage /> },
          { path: '/office/spreadsheet/template/:templateId', element: <SpreadsheetEditorPage /> },
          { path: '/office/presentation/new', element: <PresentationEditorPage /> },
          { path: '/office/presentation/:id', element: <PresentationEditorPage /> },
          {
            path: '/office/presentation/template/:templateId',
            element: <PresentationEditorPage />,
          },

          {
            path: '/analytics',
            element: (
              <Suspense
                fallback={
                  <div className="min-h-screen bg-white flex items-center justify-center text-slate-600">
                    Chargement…
                  </div>
                }
              >
                <AnalyticsPageLazy />
              </Suspense>
            ),
          },
          { path: '/plan-du-site', element: <Sitemap /> },
          { path: '/sitemap', element: <Sitemap /> },

          // --- ROUTES MENU BD (slugs référencés dans menu_items) ---
          { path: '/nos-actions', element: <DynamicPage /> },
          { path: '/actions/:slug', element: <DynamicPage /> },
          { path: '/projets', element: <DynamicPage /> },
          { path: '/galerie', element: <DynamicPage /> },
          { path: '/marches', element: <DynamicPage /> },
          { path: '/collectivites', element: <DynamicPage /> },
          { path: '/evenements/:slug', element: <DynamicPage /> },
          { path: '/evenements', element: <DynamicPage /> },
          { path: '/presse/:slug', element: <DynamicPage /> },
          { path: '/formations/:slug', element: <DynamicPage /> },
          { path: '/publications', element: <DynamicPage /> },
          { path: '/faq', element: <DynamicPage /> },
          { path: '/normative-corpus', element: <DynamicPage /> },
          { path: '/conseils-menages', element: <DynamicPage /> },
          { path: '/ressources-pedagogiques', element: <DynamicPage /> },
          { path: '/partenaires-liste', element: <DynamicPage /> },
          { path: '/partenaires', element: <DynamicPage /> },
          { path: '/partenariat-senelec', element: <DynamicPage /> },
          { path: '/temoignages', element: <DynamicPage /> },
          { path: '/espace-partenaires', element: <DynamicPage /> },
          { path: '/portal/:slug', element: <DynamicPage /> },
          { path: '/portal', element: <DynamicPage /> },

          {
            path: '/admin/builder',
            element: (
              <RoleProtectedRoute allowedRoles={['admin']}>
                <BuilderPage />
              </RoleProtectedRoute>
            ),
          },
          {
            path: '/admin/builder/config',
            element: (
              <RoleProtectedRoute allowedRoles={['admin']}>
                <BuilderConfigPage />
              </RoleProtectedRoute>
            ),
          },
          {
            path: '/admin/builder/legacy',
            element: (
              <RoleProtectedRoute allowedRoles={['admin']}>
                <BuilderPage />
              </RoleProtectedRoute>
            ),
          },
          {
            path: '/admin/builder/:pageId',
            element: (
              <RoleProtectedRoute allowedRoles={['admin']}>
                <BuilderPage />
              </RoleProtectedRoute>
            ),
          },
          {
            path: '/admin/craft-builder/:pageId',
            element: (
              <RoleProtectedRoute allowedRoles={['admin']}>
                <CraftBuilderPage />
              </RoleProtectedRoute>
            ),
          },
          {
            path: '/admin/schematic-editor/:pageId',
            element: (
              <RoleProtectedRoute allowedRoles={['admin']}>
                <SchematicEditorPage />
              </RoleProtectedRoute>
            ),
          },

          {
            path: '/admin/permissions',
            element: (
              <RoleProtectedRoute allowedRoles={['admin']}>
                <PermissionsAdmin />
              </RoleProtectedRoute>
            ),
          },
          {
            path: '/admin/tools-manager',
            element: (
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ToolsManagerPage />
              </RoleProtectedRoute>
            ),
          },
          {
            path: '/admin/tools-stats',
            element: (
              <RoleProtectedRoute allowedRoles={['admin']}>
                <ToolsStatsPage />
              </RoleProtectedRoute>
            ),
          },
          { path: '/demo/rbac', element: <RBACDemo /> },

          // Routes dynamiques (pages CMS)
          ...((dynamicRoutes as DynamicRoute[])?.map((route) => ({
            path: route.path,
            element: <DynamicPage />,
          })) || []),
          // Routes legacy avec préfixe de langue → DynamicPage les redirige proprement
          { path: '/fr/*', element: <DynamicPage /> },
          { path: '/en/*', element: <DynamicPage /> },

          { path: '*', element: <NotFound /> },
        );
      }

      return routes;
    };

    const finalRoutes = [
      {
        path: '/',
        element: (
          <MainLayout>
            <Suspense
              fallback={
                <div className="min-h-screen bg-proqblue flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Chargement...</p>
                  </div>
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </MainLayout>
        ),
        children: createRoutes(),
      },
    ];

    return createBrowserRouter(finalRoutes);
  }, [showConstructionPage, dynamicRoutes]);

  // Afficher le chargement SEULEMENT APRÈS avoir appelé tous les hooks
  if (isLoading || isLoadingRoutes || isLoadingSession) {
    return (
      <div className="min-h-screen bg-proqblue flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <RouterProvider
      router={router}
      future={{
        v7_startTransition: true,
      }}
    />
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        storageKey="proquelec-ui-theme"
        enableSystem
      >
        <ThemeSync />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <NotificationContainer />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
