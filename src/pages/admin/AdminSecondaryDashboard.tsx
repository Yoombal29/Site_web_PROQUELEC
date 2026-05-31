
import { useSession } from "@/hooks/useSession";
import { useUserRole } from "@/hooks/useUserRole";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdminSidebar } from "@/components/AdminSidebar";
import DashboardHome from "@/components/admin/DashboardHome";
import AdminPagesPanel from "@/components/admin/AdminPagesPanel";
import AdminBlogPanel from "@/components/admin/AdminBlogPanel";
import { EventCalendar } from "@/components/EventCalendar";
import InfraDocs from '@/components/admin/InfraDocs';
import { AdminElectricalCertificationsPanel } from "@/components/admin/AdminElectricalCertificationsPanel";
import { AdminProfessionalTrainingPanel } from "@/components/admin/AdminProfessionalTrainingPanel";
import { DocumentManager } from "@/components/DocumentManager";
import ProjectList from "@/pages/projects/ProjectList"; // Import ProjectList
import { AdminFormSubmissionsPanel } from "@/components/admin/AdminFormSubmissionsPanel";
import { TemplateMarketplace } from "@/components/admin/TemplateMarketplace";
import { EcommerceAdminPanel } from "@/components/admin/EcommerceAdminPanel";
import { CustomFontsPanel } from "@/components/admin/CustomFontsPanel";
import { AdminBrandingPanel } from "@/components/admin/AdminBrandingPanel";
import { Loader2 } from "lucide-react";

export default function AdminSecondaryDashboard() {
    const { user } = useSession();
    const { role, isLoading } = useUserRole();
    const [activeTab, setActiveTab] = useState("overview");

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center font-roboto italic">
                <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
            </div>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case "overview":
                return <DashboardHome />;
            case "projects": // Integrated ProjectList Tab
                return <ProjectList />;
            case "pages":
                return <AdminPagesPanel />;
            case "blog":
                return <AdminBlogPanel />;
            case "events":
                return <EventCalendar />;
            case "certifications":
                return <AdminElectricalCertificationsPanel />;
            case "training":
                return <AdminProfessionalTrainingPanel />;
            case "media":
                return (
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                        <h2 className="text-2xl font-bold mb-6 text-slate-800">Médiathèque & Archives</h2>
                        <DocumentManager />
                    </div>
                );
            case "templates":
                return <TemplateMarketplace />;
            case "ecommerce":
                return <EcommerceAdminPanel />;
            case "form_submissions":
                return <AdminFormSubmissionsPanel />;
            case "fonts":
                return <CustomFontsPanel />;
            case "branding":
                return <AdminBrandingPanel />;
            case "infrastructure":
                return <InfraDocs />;
            default:
                return <DashboardHome />;
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <Header />
            <main className="flex pt-28">
                <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} role={role} />

                <div className="flex-1 container mx-auto px-6 py-8 font-roboto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-black text-slate-900 mb-2">Administration Adjointe</h1>
                        <p className="text-slate-600 italic">Bienvenue au sein de l'équipe de gestion, <span className="font-bold underline">{user?.email}</span></p>
                    </div>

                    {renderTabContent()}
                </div>
            </main>
            <Footer />
        </div>
    );
}
