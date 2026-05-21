
import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotificationContainer } from "@/components/NotificationContainer";
import ConstructionPage from "@/components/ConstructionPage";
import { useConstructionMode } from "@/hooks/useConstructionMode";
import { useSession } from "@/hooks/useSession";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useDynamicRoutes } from "@/hooks/useDynamicRoutes";
import DynamicPage from "./pages/DynamicPage";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import ContactPremium from "./pages/ContactPremium";
import Sitemap from "./pages/Sitemap";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import PartnerDashboard from "./pages/admin/PartnerDashboard";
import AdminSecondaryDashboard from "./pages/admin/AdminSecondaryDashboard";
import PageSectionsAdmin from "./pages/admin/PageSectionsAdmin";
import SchemaBuilder from "./pages/SchemaBuilder";
import RubriqueSelectorPage from "./pages/RubriqueSelectorPage";
import ObservatoirePage from "./pages/observatoire/ObservatoirePage";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";
import GEDPage from "./pages/GEDPage";

// Expert Lab Imports
import ExpertDashboard from "./expert-lab/pages/Dashboard";
import ExpertChatPage from "./expert-lab/pages/ChatPage";
import InspecteurKEBE from "./pages/InspecteurKEBE";

// Office Suite Imports
const DocumentEditorPage = lazy(() => import("./pages/DocumentEditorPage").then((mod) => ({ default: mod.DocumentEditorPage })));
import { SpreadsheetEditorPage } from "./pages/SpreadsheetEditorPage";
import { PresentationEditorPage } from "./pages/PresentationEditorPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import ExpertCalculatorsPage from "./expert-lab/pages/CalculatorsPage";
import ExpertLogsPage from "./expert-lab/pages/LogsPage";
import ExpertConfigPage from "./expert-lab/pages/ConfigPage";
import ExpertDocsPage from "./expert-lab/pages/DocsPage";
import ExpertAIProvidersPage from "./expert-lab/pages/AIProvidersPage";
import ExpertHistoryPage from "./expert-lab/pages/HistoryPage";
import ExpertSchemasPage from "./expert-lab/pages/SchemasPage";
import ExpertModelsPage from "./expert-lab/pages/ModelsPage";
import ExpertStatsPage from "./expert-lab/pages/StatsPage";
import ComplianceScannerPage from "./expert-lab/pages/ComplianceScannerPage";


import ElectricianDashboard from "./pages/dashboards/ElectricianDashboard";
import CompanyDashboard from "./pages/dashboards/CompanyDashboard";
import MemberDashboard from "./pages/dashboards/MemberDashboard";
import ProjectList from "./pages/projects/ProjectList";
import ProjectDetail from "./pages/projects/ProjectDetail";
import InspectionDetail from "./pages/inspections/InspectionDetail";

import PermissionsAdmin from "./pages/admin/PermissionsAdmin";
import RBACDemo from "./pages/examples/RBACDemo";

// Lazy-load heavy pages
const BuilderPageLazy = lazy(() => import("./pages/admin/BuilderPage"));
const AnalyticsPageLazy = lazy(() => import("./pages/AnalyticsPage").then(mod => ({ default: mod.AnalyticsPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1
    }
  }
});

const AppContent = () => {
  const { isConstructionMode, isLoading } = useConstructionMode();
  const { user, isLoading: isLoadingSession } = useSession();
  const { isAdmin, isLoading: isLoadingAdmin } = useIsAdmin();
  const { data: dynamicRoutes, isLoading: isLoadingRoutes } = useDynamicRoutes();

  // console.log('État du mode construction:', { isConstructionMode, isLoading, isAdmin, isLoadingAdmin });

  // Attendre que le mode construction soit chargé
  if (isLoading || isLoadingRoutes) {
    return (
      <div className="min-h-screen bg-proqblue flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>);

  }

  // Si le mode construction est activé ET l'utilisateur n'est pas admin
  // Afficher la page de construction (sauf pour /dashboard et /connexion)
  const showConstructionPage = isConstructionMode && !isAdmin;

  // Fonction pour créer les routes dynamiquement
  const createRoutes = () => {
    const routes = [
      // Routes accessibles même en mode construction
      { path: "/connexion", element: <Auth /> },
      { path: "/login", element: <Auth /> },
      { path: "/auth", element: <Auth /> },
      { path: "/dashboard", element: <Dashboard /> },
      {
        path: "/admin",
        element:
          <RoleProtectedRoute allowedRoles={["admin"]}>
            <Dashboard />
          </RoleProtectedRoute>

      }];


    if (showConstructionPage) {
      // Mode construction : toutes les routes publiques mènent à la page de construction
      routes.push(
        { path: "/", element: <ConstructionPage /> },
        { path: "/about", element: <DynamicPage /> },
        { path: "/utilite-publique", element: <DynamicPage /> },
        { path: "/formation-certification", element: <DynamicPage /> },
        { path: "/activities", element: <ConstructionPage /> },
        { path: "/labels", element: <ConstructionPage /> },
        { path: "/documents", element: <ConstructionPage /> },
        { path: "/events", element: <ConstructionPage /> },
        { path: "/certifications", element: <ConstructionPage /> },
        { path: "/formations", element: <ConstructionPage /> },
        { path: "/blog", element: <ConstructionPage /> },
        { path: "/blog/:slug", element: <ConstructionPage /> },
        { path: "/contact", element: <ConstructionPage /> },
        { path: "/outils", element: <ConstructionPage /> },
        { path: "/showroom", element: <ConstructionPage /> },
        { path: "/legal", element: <DynamicPage /> },
        // Routes dynamiques en mode construction
        ...(dynamicRoutes?.map((route) => ({ path: route.path, element: <ConstructionPage /> })) || []),
        { path: "*", element: <ConstructionPage /> }
      );
    } else {
      // Mode normal : routes complètes
      routes.push(
        { path: "/", element: <DynamicPage /> },
        { path: "/about", element: <DynamicPage /> },
        { path: "/utilite-publique", element: <DynamicPage /> },
        { path: "/formation-certification", element: <DynamicPage /> },
        { path: "/normes-ressources", element: <DynamicPage /> },
        { path: "/projets-realisations", element: <DynamicPage /> },
        { path: "/actualites-evenements", element: <DynamicPage /> },
        { path: "/partenaires", element: <DynamicPage /> },
        { path: "/contact", element: <DynamicPage /> },
        { path: "/contact-premium", element: <DynamicPage /> },
        { path: "/activities", element: <DynamicPage /> },
        { path: "/labels", element: <DynamicPage /> },
        { path: "/legal", element: <DynamicPage /> },
        { path: "/certifications", element: <DynamicPage /> },
        { path: "/formations", element: <DynamicPage /> },
        { path: "/actualites", element: <DynamicPage /> },
        { path: "/presse", element: <DynamicPage /> },
        { path: "/autorites", element: <DynamicPage /> },
        { path: "/menages", element: <DynamicPage /> },
        { path: "/professionnels", element: <DynamicPage /> },
        { path: "/social", element: <DynamicPage /> },
        { path: "/espace-menages", element: <DynamicPage /> },
        { path: "/espace-professionnels", element: <DynamicPage /> },
        { path: "/espace-autorites", element: <DynamicPage /> },

        // --- PAGES CMS DYNAMIQUES ---
        { path: "/documents", element: <DynamicPage /> },
        { path: "/events", element: <DynamicPage /> },

        { path: "/expertises-techniques", element: <DynamicPage /> },
        { path: "/expert-lab", element: <DynamicPage /> },
        { path: "/formations-proquelec", element: <DynamicPage /> },
        { path: "/blog", element: <DynamicPage /> },
        { path: "/blog/:slug", element: <BlogPost /> },
        { path: "/outils", element: <DynamicPage /> },
        { path: "/showroom", element: <DynamicPage /> },
        { path: "/rubrique-selector", element: <RubriqueSelectorPage /> },
        { path: "/schema-builder", element: <SchemaBuilder /> },
        { path: "/apps/:appId", element: <DynamicPage /> },
        { path: "/avantages", element: <DynamicPage /> },
        {
          path: "/dashboard/electricien",
          element:
            <RoleProtectedRoute allowedRoles={["admin", "electricien"]}>
              <ElectricianDashboard />
            </RoleProtectedRoute>

        },
        {
          path: "/dashboard/entreprise",
          element:
            <RoleProtectedRoute allowedRoles={["admin", "entreprise"]}>
              <CompanyDashboard />
            </RoleProtectedRoute>

        },
        {
          path: "/dashboard/membre",
          element:
            <RoleProtectedRoute allowedRoles={["admin", "membre"]}>
              <MemberDashboard />
            </RoleProtectedRoute>

        },

        // Backoffices sécurisés avec RBAC
        {
          path: "/admin/page-sections",
          element:
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <PageSectionsAdmin />
            </RoleProtectedRoute>

        },
        {
          path: "/admin-secondary",
          element:
            <RoleProtectedRoute allowedRoles={["admin", "secondary_admin"]}>
              <AdminSecondaryDashboard />
            </RoleProtectedRoute>

        },
        {
          path: "/partner",
          element:
            <RoleProtectedRoute allowedRoles={["partner"]}>
              <PartnerDashboard />
            </RoleProtectedRoute>

        },

        // Expert Lab Routes (Souveraineté & Ingénierie)
        {
          path: "/expert",
          element:
            <RoleProtectedRoute allowedRoles={["admin", "secondary_admin"]}>
              <ExpertDashboard />
            </RoleProtectedRoute>

        },
        { path: "/expert/chat", element: <RoleProtectedRoute allowedRoles={["admin"]}><ExpertChatPage /></RoleProtectedRoute> },
        { path: "/expert-kebe", element: <InspecteurKEBE /> },
        { path: "/expert/calculators", element: <ExpertCalculatorsPage /> },
        { path: "/expert/schemas", element: <ExpertSchemasPage /> },
        { path: "/expert/docs", element: <ExpertDocsPage /> },
        { path: "/expert/history", element: <RoleProtectedRoute allowedRoles={["admin"]}><ExpertHistoryPage /></RoleProtectedRoute> },
        { path: "/expert/config", element: <RoleProtectedRoute allowedRoles={["admin"]}><ExpertConfigPage /></RoleProtectedRoute> },
        { path: "/expert/ai-providers", element: <RoleProtectedRoute allowedRoles={["admin"]}><ExpertAIProvidersPage /></RoleProtectedRoute> },
        { path: "/expert/logs", element: <RoleProtectedRoute allowedRoles={["admin"]}><ExpertLogsPage /></RoleProtectedRoute> },
        { path: "/expert/scanner", element: <RoleProtectedRoute allowedRoles={["admin"]}><ComplianceScannerPage /></RoleProtectedRoute> },
        { path: "/expert/models", element: <RoleProtectedRoute allowedRoles={["admin"]}><ExpertModelsPage /></RoleProtectedRoute> },
        { path: "/expert/stats", element: <RoleProtectedRoute allowedRoles={["admin"]}><ExpertStatsPage /></RoleProtectedRoute> },

        // GED Route (Document Management)
        { path: "/ged", element: <GEDPage /> },

        // ELECTRO-GED 4.0: Project Management
        { path: "/projects", element: <ProjectList /> },
        { path: "/projects/:id", element: <ProjectDetail /> },
        {
          path: "/observatoire",
          element: (
            <RoleProtectedRoute allowedRoles={["admin", "ministere"]}>
              <ObservatoirePage />
            </RoleProtectedRoute>
          )
        },
        { path: "/diagnostics/:id", element: <InspectionDetail /> },

        // Office Suite Routes
        {
          path: "/office/document/new",
          element: (
            <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-slate-600">Chargement de l'éditeur…</div>}>
              <DocumentEditorPage />
            </Suspense>
          )
        },
        {
          path: "/office/document/:id",
          element: (
            <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-slate-600">Chargement de l'éditeur…</div>}>
              <DocumentEditorPage />
            </Suspense>
          )
        },
        {
          path: "/office/document/template/:templateId",
          element: (
            <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-slate-600">Chargement de l'éditeur…</div>}>
              <DocumentEditorPage />
            </Suspense>
          )
        },
        { path: "/office/spreadsheet/new", element: <SpreadsheetEditorPage /> },
        { path: "/office/spreadsheet/:id", element: <SpreadsheetEditorPage /> },
        { path: "/office/spreadsheet/template/:templateId", element: <SpreadsheetEditorPage /> },
        { path: "/office/presentation/new", element: <PresentationEditorPage /> },
        { path: "/office/presentation/:id", element: <PresentationEditorPage /> },
        { path: "/office/presentation/template/:templateId", element: <PresentationEditorPage /> },

        { path: "/analytics", element: <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-slate-600">Chargement…</div>}><AnalyticsPageLazy /></Suspense> },
        { path: "/plan-du-site", element: <Sitemap /> },
        { path: "/sitemap", element: <Sitemap /> },

        { path: "/admin/builder/:pageId", element: <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-slate-600">Chargement du builder…</div>}><BuilderPageLazy /></Suspense> },
        {
          path: "/admin/permissions",
          element:
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <PermissionsAdmin />
            </RoleProtectedRoute>

        },
        { path: "/demo/rbac", element: <RBACDemo /> },

        // Routes dynamiques (pages CMS)
        ...(dynamicRoutes?.map((route) => ({ path: route.path, element: <DynamicPage /> })) || []),
        { path: "*", element: <NotFound /> }
      );
    }

    return routes;
  };

  const finalRoutes = [
    {
      path: "/",
      element:
        <MainLayout>
          <Outlet />
        </MainLayout>,

      children: createRoutes()
    }];


  const router = createBrowserRouter(finalRoutes);

  return (
    <RouterProvider
      router={router}
      future={{
        v7_startTransition: true
      }} />);


};

const App = () =>
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="proquelec-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <NotificationContainer />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>;


export default App;