import React, { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/utils/supabaseClient';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { SEO } from "@/components/SEO";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { Button } from "@/components/ui/button";
import { QuickLinks } from "@/components/QuickLinks";
import { LatestNews } from "@/components/LatestNews";
import { PartnerLogos } from "@/components/PartnerLogos";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Link } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { HeroSection } from "@/components/HeroSection";

/**
 * Page d'accueil HYBRIDE : CMS + Composants React
 * - Charge le contenu éditorial depuis la base (page 'home')
 * - Affiche les composants React dynamiques (actualités, partenaires, etc.)
 */
const HomePage: React.FC = () => {
    const { settings } = useLiveSettings();
    const [cmsContent, setCmsContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.target as HTMLImageElement;
        target.src = "https://images.unsplash.com/photo-1473341304170-971dcb06ac15?q=80&w=2070&auto=format&fit=crop"; // Fallback électricité
    };

    useEffect(() => {
        const supabase = getSupabaseClient();
        console.log("Page vue: Accueil - /", {
            url: (supabase as any).supabaseUrl,
            mode: import.meta.env.VITE_SUPABASE_URL?.includes('localhost') ? 'SOUVERAIN' : 'CLOUD'
        });

        // Charger le contenu CMS de la page 'home'
        const fetchCmsContent = async () => {
            try {
                const supabase = getSupabaseClient();
                const { data, error } = await supabase
                    .from('pages')
                    .select('*')
                    .eq('slug', 'home')
                    .eq('is_published', true)
                    .single();

                if (!error && data) {
                    const rawData = data as any;
                    setCmsContent({
                        ...data,
                        content: rawData.content_raw || data.content
                    });
                }
            } catch (err) {
                console.error('Erreur lors du chargement du contenu CMS:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCmsContent();
    }, []);

    const pageStyle = {
        backgroundColor: settings?.background_color || '#ffffff',
        color: settings?.text_color || '#333333',
        fontFamily: settings?.font_family || 'Inter, sans-serif'
    };

    return (
        <div className="min-h-screen" style={pageStyle}>
            <Helmet>
                <title>{cmsContent?.title || "Accueil - PROQUELEC Sénégal"}</title>
                <meta name="description" content={cmsContent?.meta_description || "PROQUELEC - Promotion de la Qualité des Installations Électriques au Sénégal"} />
                <meta name="keywords" content={cmsContent?.meta_keywords || "électricité, formations, certifications, qualité, Sénégal"} />
            </Helmet>

            <Header />

            <main className={`flex-grow ${!cmsContent?.show_hero ? 'pt-20' : ''}`}>
                {/* Hero Dynamique si activé */}
                {cmsContent?.show_hero && (
                    <HeroSection
                        title={cmsContent?.hero_title || cmsContent?.title}
                        subtitle={cmsContent?.hero_subtitle || ""}
                        gradient="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"
                        buttons={[
                            { label: cmsContent?.hero_cta_text || "Découvrir", href: cmsContent?.hero_cta_link || "#", variant: "primary" }
                        ]}
                    />
                )}
                {/* Contenu Principal (Hero, Features, Stats) géré par le CMS/Monaco */}
                {/* Tout le contenu est maintenant dans la base de données, modifiable via l'onglet "Code Pro" */}
                {!loading ? (
                    cmsContent?.content ? (
                        <div dangerouslySetInnerHTML={{ __html: cmsContent.content }} />
                    ) : (
                        <div className="py-20 text-center text-slate-500">
                            <p>Contenu CMS non disponible. Veuillez vérifier la connexion à l'infrastructure souveraine.</p>
                        </div>
                    )
                ) : (
                    <div className="min-h-[50vh] flex items-center justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                    </div>
                )}

                {/* Composants React Dynamiques (Actualités, Partenaires...) */}
                {/* Ces sections restent gérées par des composants React car elles nécessitent une logique complexe (fetch données) */}
                <QuickLinks />
                <LatestNews />
                <PartnerLogos />
                <NewsletterSignup />
            </main>

            <Footer />
            <ScrollToTopButton />
        </div>
    );
};

export default HomePage;
