
import { useSession } from "@/hooks/useSession";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Loader2, ShieldAlert, Menu as MenuIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminSiteSettingsPanel from "@/components/admin/AdminSiteSettingsPanel";
import AdminBlogPanel from "@/components/admin/AdminBlogPanel";
import AdminCategoryPanel from "@/components/admin/AdminCategoryPanel";



import AdminPagesPanel from "@/components/admin/AdminPagesPanel";

import { MenuManagerAdvanced } from "@/components/admin/MenuManagerAdvanced";
import AdminThemePanel from "@/components/admin/AdminThemePanel";
import AdminAnalyticsPanel from "@/components/admin/AdminAnalyticsPanel";
import AdminNewsletterPanel from "@/components/admin/AdminNewsletterPanel";
import AdminLogsPanel from "@/components/admin/AdminLogsPanel";
import AdminPerformancePanel from "@/components/admin/AdminPerformancePanel";
import { NotificationCenter } from "@/components/NotificationCenter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchGlobal } from "@/components/SearchGlobal";
import { MediaGallery } from "@/components/MediaGallery";

import AdminGalleryPanel from "@/components/admin/AdminGalleryPanel";
import { EventCalendar } from "@/components/EventCalendar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { LiveChat } from "@/components/LiveChat";
import AdminDownloadButtonsPage from "./AdminDownloadButtonsPage";
import DashboardFeaturesPage from "./DashboardFeaturesPage";

import { AdminAutoRepair } from "@/components/admin/AdminAutoRepair";
import DashboardHome from "@/components/admin/DashboardHome";
import AdminUsersPanel from "@/components/admin/AdminUsersPanel";
import AdminAuditTrailPanel from "@/components/admin/AdminAuditTrailPanel";
import AdminMonitoringPanel from "@/components/admin/AdminMonitoringPanel";
import { AdminConstructionModePanel } from "@/components/admin/AdminConstructionModePanel";
import { AdminElectricalCertificationsPanel } from "@/components/admin/AdminElectricalCertificationsPanel";
import { AdminProfessionalTrainingPanel } from "@/components/admin/AdminProfessionalTrainingPanel";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminAssetsPanel from "@/components/admin/AdminAssetsPanel";
import AdminHomePanel from "@/components/admin/AdminHomePanel";
import { AdminUniversalDashboard } from "@/components/admin/AdminUniversalDashboard";
import { AdminDatabasePanel } from "@/components/admin/AdminDatabasePanel";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import AdminInfrastructurePanel from "@/components/admin/AdminInfrastructurePanel";
import ExpertDashboard from "@/expert-lab/pages/Dashboard";
import AgentHub from "@/components/admin/agents/AgentHub";
import { AdminHeaderPanel } from "@/components/admin/AdminHeaderPanel";
import AdminPartnersPanel from "@/components/admin/AdminPartnersPanel";
import { AdminSEOPanel } from "@/components/admin/AdminSEOPanel";
import PageSectionsAdmin from "./admin/PageSectionsAdmin";
import { menuItems } from "@/components/AdminSidebar";
import AdminAcademyPanel from "@/components/admin/AdminAcademyPanel";
import AdminHelpPanel from "@/components/admin/AdminHelpPanel";
import ProjectList from "@/pages/projects/ProjectList";
import AIProvidersPage from "@/expert-lab/pages/AIProvidersPage";
import IADocumentationPage from "@/expert-lab/pages/IADocumentationPage";

export default function Dashboard() {
  const { user, isLoading } = useSession();
  const { role, isLoading: isLoadingRole } = useUserRole();
  const navigate = useNavigate();
  const { isAdmin, isLoading: isLoadingAdmin } = useIsAdmin();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    // 1. Loading checks
    if (isLoading || isLoadingRole) return;

    // 2. Token/Session validation
    if (!user) {

      navigate("/connexion");
      return;
    }

    // 3. Role-based redirection
    if (role === "partner") {
      navigate("/partner");
    } else if (role === "secondary_admin") {
      navigate("/admin-secondary");
    } else if (role === "electricien") {
      navigate("/dashboard/electricien");
    } else if (role === "entreprise") {
      navigate("/dashboard/entreprise");
    } else if (role === "membre") {
      navigate("/dashboard/membre");
    } else if (role === "admin") {
      if (window.location.pathname === "/dashboard") {
        navigate("/admin");
      }
    }
  }, [user, isLoading, isLoadingRole, role, navigate]);

  if (!user || isLoading || isLoadingRole) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
    </div>);


  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <DashboardHome />;
      case "projects":
        return <ProjectList />;
      case "construction":
        return (
          <section className="bg-card p-6 rounded-lg shadow-md animate-fade-in border border-border">
            <AdminConstructionModePanel />
          </section>);

      case "certifications":
        return (
          <section className="bg-card p-6 rounded-lg shadow-md animate-fade-in border border-border">
            <AdminElectricalCertificationsPanel />
          </section>);

      case "training":
        return (
          <section className="bg-card p-6 rounded-lg shadow-md animate-fade-in border border-border">
            <AdminProfessionalTrainingPanel />
          </section>);

      case "equipment":
        return (
          <section className="bg-card p-6 rounded-lg shadow-md animate-fade-in border border-border">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold mb-2 text-primary">Gestion des Équipements</h3>
                <p className="text-muted-foreground mb-6">Gérez le catalogue des équipements électriques proposés par PROQUELEC</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2">Ajouter un équipement</h4>
                  <p className="text-sm text-muted-foreground mb-3">Créer une nouvelle fiche d'équipement avec photos et spécifications</p>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition">
                    + Ajouter équipement
                  </button>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                  <h4 className="font-semibold text-primary mb-2">Catégories d'équipements</h4>
                  <p className="text-sm text-muted-foreground mb-3">Gérer les catégories et sous-catégories d'équipements</p>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition">
                    Gérer catégories
                  </button>
                </div>
              </div>
              <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">ℹ️ Équipements actuels</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">Vous pouvez commencer par importer des équipements depuis un fichier CSV ou en les saisissant manuellement.</p>
              </div>
            </div>
          </section>);

      case "standards":
        return (
          <section className="bg-card p-6 rounded-lg shadow-md animate-fade-in border border-border">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold mb-2 text-primary">Normes Électriques</h3>
                <p className="text-muted-foreground mb-6">Gérez la base de données des normes électriques applicables au Sénégal</p>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <h4 className="font-semibold text-primary mb-2">🔌 Normes Installation</h4>
                  <p className="text-sm text-muted-foreground mb-3">Normes pour les installations électriques fixes</p>
                  <button className="text-sm text-primary hover:underline">Gérer →</button>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <h4 className="font-semibold text-primary mb-2">⚡ Équipements & Matériel</h4>
                  <p className="text-sm text-muted-foreground mb-3">Conformité des équipements électriques</p>
                  <button className="text-sm text-primary hover:underline">Gérer →</button>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <h4 className="font-semibold text-primary mb-2">🛡️ Sécurité & Protection</h4>
                  <p className="text-sm text-muted-foreground mb-3">Normes de sécurité et protection contre les surcharges</p>
                  <button className="text-sm text-primary hover:underline">Gérer →</button>
                </div>
              </div>
              <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">📋 Références documentaires</h4>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• NFC 15-100 : Installations électriques basse tension</li>
                  <li>• CEI 61008 : Disjoncteurs différentiels</li>
                  <li>• IEC 60364 : Protection contre les chocs électriques</li>
                </ul>
              </div>
            </div>
          </section>);

      case "analytics":
        return (
          <section className="bg-card p-6 rounded-lg shadow-md animate-fade-in border border-border">
            <AdminAnalyticsPanel />
          </section>);

      case "pages":
        return (
          <section className="bg-card p-6 rounded-lg shadow-md animate-fade-in border border-border">
            <AdminPagesPanel />
          </section>);

      case "dynamic_content":
        return <PageSectionsAdmin standalone={false} />;
      case "menu":
        return (
          <section className="bg-card p-6 rounded-lg shadow-md animate-fade-in border border-border">
            <MenuManagerAdvanced />
          </section>);

      case "blog":
        return (
          <section className="bg-card p-6 rounded-lg shadow-md animate-fade-in border border-border">
            <h2 className="text-2xl font-semibold mb-4 text-primary">Gestion du Blog</h2>
            <div className="space-y-6">
              <AdminBlogPanel />
              <div className="border-t border-border pt-6">
                <AdminCategoryPanel />
              </div>
            </div>
          </section>);

      case "media":
        return (
          <section className="space-y-6 animate-fade-in">
            <MediaGallery />
          </section>);

      case "documents":
        return (
          <section className="bg-card p-6 rounded-lg shadow-md animate-fade-in border border-border">
            <AdminAssetsPanel />
          </section>);

      case "gallery":
        return (
          <section className="animate-fade-in">
            <AdminGalleryPanel />
          </section>);

      case "events":
        return (
          <section className="bg-card p-6 rounded-lg shadow-md animate-fade-in border border-border">
            <EventCalendar />
          </section>);

      case "newsletter":
        return (
          <section className="bg-card p-6 rounded-lg shadow-md animate-fade-in border border-border">
            <AdminNewsletterPanel />
          </section>);

      case "design":
        return (
          <section className="animate-fade-in">
            <AdminThemePanel />
          </section>);

      case "performance":
        return (
          <section className="bg-card p-6 rounded-lg shadow-md animate-fade-in border border-border">
            <AdminPerformancePanel />
          </section>);

      case "security":
        return (
          <section className="bg-card p-6 rounded-lg shadow-md animate-fade-in border border-border">
            <AdminLogsPanel />
          </section>);

      case "users":
        return <AdminUsersPanel />;
      case "database":
        return <AdminDatabasePanel />;
      case "audit":
        return <AdminAuditTrailPanel />;
      case "monitoring":
        return <AdminMonitoringPanel />;
      case "download_buttons":
        return <AdminDownloadButtonsPage aria-label="Action" />;
      case "features":
        return <DashboardFeaturesPage onTabChange={setActiveTab} />;
      case "admin-dashboard":
        return <AdminDashboard />;
      case "universal_control":
        return <AdminUniversalDashboard />;
      case "home_management":
        return <AdminHomePanel />;
      case "expert_lab":
        return <ExpertDashboard />;
      case "ai_providers":
        return <AIProvidersPage />;
      case "ia_docs":
        return <IADocumentationPage />;
      case "infrastructure":
        return <AdminInfrastructurePanel />;
      case "academy_ai":
        return <AdminAcademyPanel />;
      case "agents":
        return <AgentHub />;
      case "auto_repair":
        return <AdminAutoRepair />;
      case "header_settings":
        return (
          <section className="bg-card p-6 rounded-lg shadow-md animate-fade-in border border-border">
            <h2 className="text-2xl font-semibold mb-6 text-primary">Configuration du Header</h2>
            <AdminHeaderPanel />
          </section>);

      case "site_settings":
        return (
          <section className="bg-card p-6 rounded-lg shadow-md animate-fade-in border border-border">
            <h2 className="text-2xl font-semibold mb-6 text-primary">Configuration Globale du Site</h2>
            <AdminSiteSettingsPanel />
          </section>);

      case "partners":
        return (
          <section className="bg-card p-6 rounded-lg shadow-md animate-fade-in border border-border">
            <AdminPartnersPanel />
          </section>);

      case "espace_presse":
        return <PageSectionsAdmin standalone={false} defaultPage="presse" />;
      case "espace_social":
        return <PageSectionsAdmin standalone={false} defaultPage="social" />;
      case "autorites":
        return <PageSectionsAdmin standalone={false} defaultPage="autorites" />;
      case "menages":
        return <PageSectionsAdmin standalone={false} defaultPage="menages" />;
      case "professionnels":
        return <PageSectionsAdmin standalone={false} defaultPage="professionnels" />;
      case "seo":
        return (
          <section className="bg-card p-6 rounded-lg shadow-md animate-fade-in border border-border">
            <AdminSEOPanel />
          </section>);

      case "help":
        return <AdminHelpPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-background min-h-screen font-roboto text-foreground transition-colors duration-300">
      <Header solid />

      {/* Mobile Sidebar Toggle - Only visible when admin and small screen */}
      {isAdmin &&
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="h-14 w-14 rounded-full shadow-2xl bg-proqblue hover:bg-proqblue-dark text-white p-0 flex items-center justify-center border-4 border-background"
            title={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu d'administration"}>

            {isSidebarOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </Button>
        </div>
      }

      <main className="flex flex-col lg:flex-row pt-20 lg:pt-28 min-h-screen">
        {isLoadingAdmin ?
          <div className="flex flex-col items-center justify-center w-full mt-24 gap-4">
            <Loader2 className="animate-spin w-8 h-8 text-proqblue" />
            <span className="text-proqblue">Vérification des droits…</span>
          </div> :
          isAdmin ?
            <>
              {/* Sidebar with mobile overlay support */}
              <div
                className={`
                fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300
                ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
              `}
                onClick={() => setIsSidebarOpen(false)} />


              <aside
                className={`
                fixed lg:sticky top-20 lg:top-28 left-0 z-40 h-[calc(100vh-5rem)] transition-transform duration-300 lg:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              `}>

                <AdminSidebar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }} role={role} />
              </aside>

              <div className="flex-1 w-full max-w-none px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
                <AdminBreadcrumbs activeTab={activeTab} onTabChange={setActiveTab} />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3 animate-fade-in tracking-tight">
                      {menuItems.find((item) => item.id === activeTab)?.label || "Tableau de bord"}
                    </h1>
                    <p className="text-muted-foreground text-base md:text-lg animate-fade-in max-w-2xl leading-relaxed">
                      {activeTab === 'overview' ?
                        <>Bienvenue dans votre espace, <span className="font-bold text-proqblue">{user.email?.split('@')[0]}</span>. Gérez le portail PROQUELEC avec précision.</> :

                        <>Configuration de la section <strong>{menuItems.find((item) => item.id === activeTab)?.label}</strong>.</>
                      }
                    </p>
                  </div>

                  <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <div title="Recherche" className="flex-shrink-0">
                      <SearchGlobal />
                    </div>
                    <div title="Notifications" className="flex-shrink-0">
                      <NotificationCenter />
                    </div>
                    <div title="Thème" className="flex-shrink-0">
                      <ThemeToggle />
                    </div>
                  </div>
                </div>

                <div className="min-h-[60vh]">
                  {renderTabContent()}
                </div>

                <div className="text-center text-primary opacity-70 text-sm pb-8 mt-8">
                  ⚠️ Vous avez accès à tous les paramètres d'administration. Utilisez ces outils avec précaution.
                </div>
              </div>

              <LiveChat />
            </> :

            <div className="flex flex-col items-center justify-center w-full mt-24 gap-4">
              <ShieldAlert className="text-red-500 w-10 h-10" />
              <div className="text-xl text-red-700 font-semibold">
                Accès refusé
              </div>
              <div className="text-proqblue text-center">
                Vous n'avez pas les droits d'accès à cette page.<br />
                (Seuls les administrateurs du site peuvent voir ce tableau de bord.)
              </div>
            </div>
        }
      </main>
      <Footer />
    </div>);

}