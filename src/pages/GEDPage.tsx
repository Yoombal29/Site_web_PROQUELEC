import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DocumentManager } from "@/components/DocumentManager";
import { useSession } from "@/hooks/useSession";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function GEDPage() {
    const { user, isLoading } = useSession();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !user) {
            navigate("/connexion");
        }
    }, [user, isLoading, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden">
            <Header />

            <main className="flex-1 w-full overflow-y-auto pt-24">
                <div className="container mx-auto px-4 pb-12 min-h-[calc(100vh-6rem)] flex flex-col">
                    <div className="mb-6 flex-none">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Gestion Électronique des Documents
                        </h1>
                        <p className="text-gray-600">
                            Gérez vos documents techniques, créez des rapports et collaborez avec votre équipe
                        </p>
                    </div>

                    <div className="flex-1">
                        <DocumentManager />
                    </div>
                </div>

                <Footer />
            </main>
        </div>
    );
}
