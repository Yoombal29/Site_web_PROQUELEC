
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotificationContainer } from "@/components/NotificationContainer";
import ConstructionPage from "@/components/ConstructionPage";
import { useConstructionMode } from "@/hooks/useConstructionMode";
import { useSession } from "@/hooks/useSession";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useDynamicRoutes } from "@/hooks/useDynamicRoutes";
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import About from "./pages/About";
import Activities from "./pages/Activities";
import Labels from "./pages/Labels";
import Documents from "./pages/Documents";
import Events from "./pages/Events";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import Legal from "./pages/Legal";
import Certifications from "./pages/Certifications";
import Trainings from "./pages/Trainings";
import News from "./pages/News";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import ToolsPlatform from "./pages/ToolsPlatform";
import Showroom from "./pages/Showroom";
import DynamicPage from "./pages/DynamicPage";
import PartnerDashboard from "./pages/admin/PartnerDashboard";
import AdminSecondaryDashboard from "./pages/admin/AdminSecondaryDashboard";
import SchemaBuilder from "./pages/SchemaBuilder";
import RubriqueSelectorPage from "./pages/RubriqueSelectorPage";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";

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
      </div>
    );
  }

  // Si le mode construction est activé ET l'utilisateur n'est pas admin
  // Afficher la page de construction (sauf pour /dashboard et /connexion)
  const showConstructionPage = isConstructionMode && !isAdmin;

  // Fonction pour créer les routes dynamiquement
  const createRoutes = () => {
    const routes = [
      // Routes accessibles même en mode construction
      { path: "/connexion", element: <Auth /> },
      { path: "/dashboard", element: <Dashboard /> },
    ];

    if (showConstructionPage) {
      // Mode construction : toutes les routes mènent à la page de construction
      routes.push(
        { path: "/", element: <ConstructionPage /> },
        { path: "/about", element: <ConstructionPage /> },
        { path: "/activities", element: <ConstructionPage /> },
        { path: "/labels", element: <ConstructionPage /> },
        { path: "/documents", element: <ConstructionPage /> },
        { path: "/events", element: <ConstructionPage /> },
        { path: "/certifications", element: <ConstructionPage /> },
        { path: "/formations", element: <ConstructionPage /> },
        { path: "/blog", element: <ConstructionPage /> },
        { path: "/blog/:slug", element: <ConstructionPage /> },
        { path: "/contact", element: <ConstructionPage /> },
        { path: "/legal", element: <ConstructionPage /> },
        { path: "/auth", element: <ConstructionPage /> },
        // Routes dynamiques en mode construction
        ...(dynamicRoutes?.map(route => ({ path: route.path, element: <ConstructionPage /> })) || []),
        { path: "*", element: <ConstructionPage /> }
      );
    } else {
      // Mode normal : routes complètes
      routes.push(
        // Page d'accueil HYBRIDE : CMS + Composants React
        {
          path: "/",
          element: <HomePage />,
        },
        // { path: "/about", element: <About /> }, // Migré vers CMS Dynamique
        // { path: "/activities", element: <Activities /> }, // Migré vers CMS Dynamique
        // { path: "/labels", element: <Labels /> }, // Migré vers CMS Dynamique
        // { path: "/documents", element: <Documents /> }, // Migré vers CMS Dynamique
        // { path: "/events", element: <Events /> }, // Migré vers CMS Dynamique
        // { path: "/certifications", element: <Certifications /> }, // Migré vers CMS Dynamique
        { path: "/formations", element: <DynamicPage /> },
        // { path: "/formations-proquelec", element: <Trainings /> }, // Redondance supprimée
        { path: "/actualites", element: <Blog /> },
        { path: "/blog", element: <Blog /> },
        { path: "/blog/:slug", element: <BlogPost /> },
        { path: "/contact", element: <Contact /> }, // Contact gardé en React pour le formulaire fonctionnel
        { path: "/legal", element: <Legal /> },
        { path: "/outils", element: <ToolsPlatform /> },
        { path: "/showroom", element: <Showroom /> },
        { path: "/rubrique-selector", element: <RubriqueSelectorPage /> },
        { path: "/schema-builder", element: <SchemaBuilder /> },

        // Backoffices sécurisés avec RBAC
        {
          path: "/admin",
          element: (
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <Dashboard />
            </RoleProtectedRoute>
          )
        },
        {
          path: "/admin-secondary",
          element: (
            <RoleProtectedRoute allowedRoles={["admin", "secondary_admin"]}>
              <AdminSecondaryDashboard />
            </RoleProtectedRoute>
          )
        },
        {
          path: "/partner",
          element: (
            <RoleProtectedRoute allowedRoles={["partner"]}>
              <PartnerDashboard />
            </RoleProtectedRoute>
          )
        },

        // Routes dynamiques (pages CMS)
        ...(dynamicRoutes?.map(route => ({ path: route.path, element: <DynamicPage /> })) || []),
        { path: "/auth", element: <NotFound /> },
        { path: "*", element: <NotFound /> }
      );
    }

    return routes;
  };

  // Créer le router avec les routes appropriées
  const routes = createRoutes();
  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
};

const App = () => (
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
  </ErrorBoundary>
);

export default App;
