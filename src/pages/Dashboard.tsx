
import { useSession } from "@/hooks/useSession";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Loader2, ShieldAlert } from "lucide-react";
import AdminSiteSettingsPanel from "@/components/admin/AdminSiteSettingsPanel";
import AdminBlogPanel from "@/components/admin/AdminBlogPanel";
import AdminCategoryPanel from "@/components/admin/AdminCategoryPanel";
import AdminUserManagementPanel from "@/components/admin/AdminUserManagementPanel";
import AdminStatsPanel from "@/components/admin/AdminStatsPanel";
import AdminQuickActionsPanel from "@/components/admin/AdminQuickActionsPanel";
import AdminPagesPanel from "@/components/admin/AdminPagesPanel";
import AdminPagesManagerAdvanced from "@/components/admin/AdminPagesManagerAdvanced";
import AdminMenuPanel from "@/components/admin/AdminMenuPanel";
import AdminThemePanel from "@/components/admin/AdminThemePanel";
import AdminAnalyticsPanel from "@/components/admin/AdminAnalyticsPanel";
import AdminNewsletterPanel from "@/components/admin/AdminNewsletterPanel";
import AdminLogsPanel from "@/components/admin/AdminLogsPanel";
import AdminPerformancePanel from "@/components/admin/AdminPerformancePanel";
import { NotificationCenter } from "@/components/NotificationCenter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchGlobal } from "@/components/SearchGlobal";
import { MediaGallery } from "@/components/MediaGallery";
import { DocumentManager } from "@/components/DocumentManager";
import AdminGalleryPanel from "@/components/admin/AdminGalleryPanel";
import { EventCalendar } from "@/components/EventCalendar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { LiveChat } from "@/components/LiveChat";
import AdminDownloadButtonsPage from "./AdminDownloadButtonsPage";
import DashboardFeaturesPage from "./DashboardFeaturesPage";
import { AdminAutoFixPanel } from "@/components/admin/AdminAutoFixPanel";
import DashboardHome from "@/components/admin/DashboardHome";
import AdminUsersPanel from "@/components/admin/AdminUsersPanel";
import AdminAuditTrailPanel from "@/components/admin/AdminAuditTrailPanel";
import AdminMonitoringPanel from "@/components/admin/AdminMonitoringPanel";
import { AdminConstructionModePanel } from "@/components/admin/AdminConstructionModePanel";
import { AdminElectricalCertificationsPanel } from "@/components/admin/AdminElectricalCertificationsPanel";
import { AdminProfessionalTrainingPanel } from "@/components/admin/AdminProfessionalTrainingPanel";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminContentManager from "@/components/admin/AdminContentManager";
import AdminDesignManager from "@/components/admin/AdminDesignManager";
import AdminAssetsPanel from "@/components/admin/AdminAssetsPanel";

export default function Dashboard() {
  const { user, isLoading } = useSession();
  const { role, isLoading: isLoadingRole } = useUserRole();
  const navigate = useNavigate();
  const { isAdmin, isLoading: isLoadingAdmin } = useIsAdmin();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!isLoading && !isLoadingRole) {
      if (user === null) {
        navigate("/connexion");
      } else if (role === "partner") {
        navigate("/partner");
      } else if (role === "secondary_admin") {
        navigate("/admin-secondary");
      } else if (role === "admin") {
        if (window.location.pathname === "/dashboard") {
          navigate("/admin");
        }
      }
    }
  }, [user, isLoading, isLoadingRole, role, navigate]);

  if (!user || isLoading || isLoadingRole) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <DashboardHome />;
      case "construction":
        return (
          <section className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            <AdminConstructionModePanel />
          </section>
        );
      case "certifications":
        return (
          <section className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            <AdminElectricalCertificationsPanel />
          </section>
        );
      case "training":
        return (
          <section className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            <AdminProfessionalTrainingPanel />
          </section>
        );
      case "equipment":
        return (
          <section className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold mb-2 text-proqblue">Gestion des Équipements</h3>
                <p className="text-gray-600 mb-6">Gérez le catalogue des équipements électriques proposés par PROQUELEC</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-proqblue mb-2">Ajouter un équipement</h4>
                  <p className="text-sm text-gray-700 mb-3">Créer une nouvelle fiche d'équipement avec photos et spécifications</p>
                  <button className="px-4 py-2 bg-proqblue text-white rounded hover:bg-proqblue-dark transition">
                    + Ajouter équipement
                  </button>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-proqblue mb-2">Catégories d'équipements</h4>
                  <p className="text-sm text-gray-700 mb-3">Gérer les catégories et sous-catégories d'équipements</p>
                  <button className="px-4 py-2 bg-proqblue text-white rounded hover:bg-proqblue-dark transition">
                    Gérer catégories
                  </button>
                </div>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2">ℹ️ Équipements actuels</h4>
                <p className="text-sm text-amber-800">Vous pouvez commencer par importer des équipements depuis un fichier CSV ou en les saisissant manuellement.</p>
              </div>
            </div>
          </section>
        );
      case "standards":
        return (
          <section className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold mb-2 text-proqblue">Normes Électriques</h3>
                <p className="text-gray-600 mb-6">Gérez la base de données des normes électriques applicables au Sénégal</p>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-proqblue mb-2">🔌 Normes Installation</h4>
                  <p className="text-sm text-gray-700 mb-3">Normes pour les installations électriques fixes</p>
                  <button className="text-sm text-proqblue hover:underline">Gérer →</button>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-proqblue mb-2">⚡ Équipements & Matériel</h4>
                  <p className="text-sm text-gray-700 mb-3">Conformité des équipements électriques</p>
                  <button className="text-sm text-proqblue hover:underline">Gérer →</button>
                </div>
                <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <h4 className="font-semibold text-proqblue mb-2">🛡️ Sécurité & Protection</h4>
                  <p className="text-sm text-gray-700 mb-3">Normes de sécurité et protection contre les surcharges</p>
                  <button className="text-sm text-proqblue hover:underline">Gérer →</button>
                </div>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2">📋 Références documentaires</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• NFC 15-100 : Installations électriques basse tension</li>
                  <li>• CEI 61008 : Disjoncteurs différentiels</li>
                  <li>• IEC 60364 : Protection contre les chocs électriques</li>
                </ul>
              </div>
            </div>
          </section>
        );
      case "analytics":
        return (
          <section className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            <AdminAnalyticsPanel />
          </section>
        );
      case "pages":
        return (
          <section className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            <AdminPagesPanel />
          </section>
        );
      case "menu":
        return (
          <section className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            <AdminMenuPanel />
          </section>
        );
      case "blog":
        return (
          <section className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            <h2 className="text-2xl font-semibold mb-4 text-proqblue">Gestion du Blog</h2>
            <div className="space-y-6">
              <AdminBlogPanel />
              <div className="border-t border-gray-200 pt-6">
                <AdminCategoryPanel />
              </div>
            </div>
          </section>
        );
      case "media":
        return (
          <section className="space-y-6 animate-fade-in">
            <MediaGallery />
          </section>
        );
      case "documents":
        return (
          <section className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            <AdminAssetsPanel />
          </section>
        );
      case "gallery":
        return (
          <section className="animate-fade-in">
            <AdminGalleryPanel />
          </section>
        );
      case "events":
        return (
          <section className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            <EventCalendar />
          </section>
        );
      case "newsletter":
        return (
          <section className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            <AdminNewsletterPanel />
          </section>
        );
      case "design":
        return (
          <section className="animate-fade-in">
            <AdminThemePanel />
          </section>
        );
      case "performance":
        return (
          <section className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            <AdminPerformancePanel />
          </section>
        );
      case "security":
        return (
          <section className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
            <AdminLogsPanel />
          </section>
        );
      case "users":
        return <AdminUsersPanel />;
      case "audit":
        return <AdminAuditTrailPanel />;
      case "monitoring":
        return <AdminMonitoringPanel />;
      case "download_buttons":
        return <AdminDownloadButtonsPage />;
      case "features":
        return <DashboardFeaturesPage />;
      case "admin-dashboard":
        return <AdminDashboard />;
      case "admin-content":
        return <AdminContentManager />;
      case "admin-design":
        return <AdminDesignManager />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-proqgray min-h-screen font-roboto">
      <Header />
      <main className="flex pt-28">
        {isLoadingAdmin ? (
          <div className="flex flex-col items-center justify-center w-full mt-24 gap-4">
            <Loader2 className="animate-spin w-8 h-8 text-proqblue" />
            <span className="text-proqblue">Vérification des droits…</span>
          </div>
        ) : isAdmin ? (
          <>
            <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} role={role} />

            <div className="flex-1 container max-w-none mx-auto px-6 py-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-4xl font-bold text-proqblue mb-4 animate-fade-in">
                    Tableau de bord administrateur
                  </h1>
                  <p className="text-proqblue-dark text-lg animate-fade-in">
                    Bienvenue, <span className="font-semibold">{user.email}</span> !
                    Gérez votre site PROQUELEC depuis ce panneau de contrôle complet.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <SearchGlobal />
                  <NotificationCenter />
                  <ThemeToggle />
                </div>
              </div>

              {renderTabContent()}

              <div className="text-center text-proqblue-dark opacity-500 text-sm pb-8 mt-8">
                ⚠️ Vous avez accès à tous les paramètres d'administration. Utilisez ces outils avec précaution.
              </div>
            </div>

            <LiveChat />
          </>
        ) : (
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
        )}
      </main>
      <Footer />
    </div>
  );
}
