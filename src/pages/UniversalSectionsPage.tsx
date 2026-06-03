/**
 * UniversalSectionsPage.tsx
 * Page de rendu universelle pour les sections configurées
 * dans site_settings.page_sections ou DEFAULT_PAGE_SECTIONS.
 * Fallback utilisé quand une page n'a pas encore d'entrée DB.
 */
import React from 'react';
import { SEO } from '@/components/SEO';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { useLiveSettings } from '@/hooks/useLiveSettings';
import { DEFAULT_PAGE_SECTIONS } from '@/data/defaultPageSections';

interface Props {
  pageKey: string;
}

const UniversalSectionsPage: React.FC<Props> = ({ pageKey }) => {
  const { settings } = useLiveSettings();
  const sectionData =
    (settings as any)?.page_sections?.[pageKey] ||
    (DEFAULT_PAGE_SECTIONS as any)?.[pageKey];

  if (!sectionData) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            {sectionData?.hero_title || 'Page'}
          </h1>
          <p className="text-slate-500">Contenu en cours de configuration.</p>
        </div>
        <Footer />
        <ScrollToTopButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={sectionData.hero_title || pageKey}
        description={sectionData.hero_subtitle || ''}
      />
      <Header />
      <main className="flex-grow">
        {/* Hero section */}
        {sectionData.hero_title && (
          <section className="bg-gradient-to-br from-blue-900 via-slate-800 to-blue-900 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 text-center">
              {sectionData.badge && (
                <span className="inline-block px-4 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold mb-4 border border-white/20">
                  {sectionData.badge}
                </span>
              )}
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {sectionData.hero_title}
              </h1>
              {sectionData.hero_subtitle && (
                <p className="text-xl text-white/80 max-w-3xl mx-auto">
                  {sectionData.hero_subtitle}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Sections list */}
        {sectionData.content && (
          <div className="max-w-7xl mx-auto px-4 py-16">
            {Object.entries(sectionData.content).map(([key, section]: [string, any]) => (
              <div key={key} className="mb-12">
                {section.title && (
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">{section.title}</h2>
                )}
                {section.subtitle && (
                  <p className="text-lg text-slate-600 mb-8">{section.subtitle}</p>
                )}
                {section.features && Array.isArray(section.features) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.features.map((feature: any, idx: number) => (
                      <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        {feature.title && (
                          <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                        )}
                        {feature.description && (
                          <p className="text-slate-600 text-sm">{feature.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default UniversalSectionsPage;
