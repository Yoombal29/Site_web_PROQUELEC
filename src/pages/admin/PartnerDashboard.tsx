
import { useSession } from "@/hooks/useSession";
import { useUserRole } from "@/hooks/useUserRole";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdminSidebar } from "@/components/AdminSidebar";
import { EventCalendar } from "@/components/EventCalendar";
import { ImageManager } from "@/components/ImageManager";
import DashboardHome from "@/components/admin/DashboardHome";
import { Loader2 } from "lucide-react";

export default function PartnerDashboard() {
    const { user } = useSession();
    const { role, isLoading } = useUserRole();
    const [activeTab, setActiveTab] = useState("overview");

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
            </div>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case "overview":
                return <DashboardHome />;
            case "events":
                return (
                    <section className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-6">Mes Événements</h2>
                        <p className="text-slate-600 mb-8">
                            Créez et gérez vos événements. Notez que les nouveaux événements doivent être validés par l'administration avant d'être publiés.
                        </p>
                        <EventCalendar />
                    </section>
                );
            case "images":
                return (
                    <section className="bg-white p-6 rounded-lg shadow-md">
                        <ImageManager />
                    </section>
                );
            default:
                return <DashboardHome />;
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <Header />
            <main className="flex pt-28">
                <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} role={role} />

                <div className="flex-1 container mx-auto px-6 py-8">
                    <div className="mb-8">
                        <h1 className="text-4xl font-black text-slate-900 mb-2">Espace Partenaire</h1>
                        <p className="text-slate-600">Bienvenue, <span className="font-bold">{user?.email}</span></p>
                    </div>

                    {renderTabContent()}
                </div>
            </main>
            <Footer />
        </div>
    );
}
