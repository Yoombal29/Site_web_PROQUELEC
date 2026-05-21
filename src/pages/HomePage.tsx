import React, { useEffect, useState } from 'react';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroBanner } from '@/components/HeroBanner';
import { AudienceOffers } from '@/components/AudienceOffers';
import { VisionMission } from '@/components/VisionMission';
import { LandingStats } from '@/components/LandingStats';
import { LatestNews } from '@/components/LatestNews';
import { PartnerLogos } from '@/components/PartnerLogos';
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { SEO } from '@/components/SEO';
import { homepageRegistry } from '@/services/HomepageRegistry';
import { initializeHomepageModules } from '@/bootstrap/initializeHomepage';

// Initialisation au chargement du fichier (singleton)
initializeHomepageModules();

const HomePage: React.FC = () => {
  const { settings } = useLiveSettings();
  const [modules, setModules] = useState(homepageRegistry.getActiveModules());

  const pageConfig = settings?.page_sections?.home_page;

  useEffect(() => {


    // console.log("Page vue: Accueil (Architecture Modulaire)");
  }, []);const dynamicVars = {
    '--bg-color': settings?.background_color || '#ffffff',
    '--text-color': settings?.text_color || '#333333',
    '--font-main': settings?.font_family || 'Roboto, sans-serif'
  } as React.CSSProperties;

  // Rendu en mode "Modular Page Sections" si configuré
  if (pageConfig && (pageConfig.renderMode === 'sections' || pageConfig.renderMode === 'html')) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-color)] font-[family-name:var(--font-main)]" style={dynamicVars}>
                <SEO
          title="Accueil"
          description={settings?.slogan || "Promotion de la Qualité des Installations Électriques au Sénégal"} />
        

                <Header />

                <main className="flex-grow">
                    {pageConfig.renderMode === 'html' ?
          <section className="bg-white min-h-screen">
                            <div
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: pageConfig.customHTML || '' }} />
            
                        </section> :

          <div className="space-y-0">
                            {pageConfig.sections?.map((section: unknown) => {
              const content = pageConfig.content?.[section.id];
              // Mapping intelligent vers les composants existants si possible
              if (section.id === 'hero' || section.type === 'hero') return <HeroBanner key={section.id} {...content} />;
              if (section.id === 'audience' || section.type === 'features-list') return <AudienceOffers key={section.id} {...content} />;
              if (section.id === 'mission' || section.type === 'text-image') return <VisionMission key={section.id} {...content} />;
              if (section.id === 'stats' || section.type === 'stats') return <LandingStats key={section.id} {...content} />;
              if (section.id === 'news' || section.type === 'custom') return <LatestNews key={section.id} {...content} />;
              if (section.id === 'partners' || section.type === 'gallery') return <PartnerLogos key={section.id} {...content} />;

              return null;
            })}
                        </div>
          }
                </main>

                <Footer />
                <ScrollToTopButton aria-label="Action" />
            </div>);

  }

  // Fallback vers l'ancien moteur (Registrar)
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-color)] font-[family-name:var(--font-main)]" style={dynamicVars}>
            <SEO
        title="Accueil"
        description={settings?.slogan || "Promotion de la Qualité des Installations Électriques au Sénégal"} />
      

            <Header />

            <main className="flex-grow">
                {modules.map((module) => {
          const Component = module.component;
          return (
            <div key={module.id} id={module.id} className="relative">
                            {/* Le composant est rendu ici dynamiquement */}
                            <Component />
                        </div>);

        })}
            </main>

            <Footer />
            <ScrollToTopButton aria-label="Action" />
        </div>);

};

export default HomePage;