
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PhotoVideoGallery } from "@/components/PhotoVideoGallery";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { Zap } from "lucide-react";

export default function Showroom() {
    return (
        <div className="min-h-screen bg-slate-50">
            <SEO
                title="Showroom Technique - PROQUELEC"
                description="Explorez nos installations électriques conformes aux normes NFC 15-100 à travers notre showroom interactif immersif."
            />

            <Header />

            <main className="pt-24">
                {/* Hero Section Minimaliste pour le Showroom */}
                <div className="bg-white border-b border-slate-200 py-16">
                    <div className="container mx-auto px-6">
                        <div className="flex items-center gap-4 mb-4 text-proqblue">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Zap className="w-6 h-6" />
                            </div>
                            <span className="font-bold tracking-widest uppercase text-sm">Excellence Technique</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">
                            Showroom <span className="text-proqblue">Interactif</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl leading-relaxed">
                            Découvrez la conformité en action. Parcourez nos projets emblématiques et
                            utilisez les points interactifs pour comprendre les spécificités techniques
                            et normatives de chaque installation.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-6 pb-20">
                    <PhotoVideoGallery />
                </div>
            </main>

            <Footer />
            <ScrollToTopButton />
        </div>
    );
}
