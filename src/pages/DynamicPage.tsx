import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { PageRenderer } from '@/components/PageRenderer';
import { SEO } from '@/components/SEO';
import type { PageRecord } from '@/types/PageSystem';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { DEFAULT_PAGE_SECTIONS } from '@/data/defaultPageSections';
// @ts-ignore
import BuilderPageRenderer from '@/components/builder/BuilderPageRenderer';
import { Block } from "@/types/builder";

import { useLiveSettings } from '@/hooks/useLiveSettings';

/**
 * Page générique pour afficher toute page gérée par le système CMS
 * Remplace News.tsx, Trainings.tsx, etc.
 * Compatible WordPress: affiche le contenu et applique le design
 */

const DynamicPageComponent: React.FC = () => {
  const { slug: paramSlug } = useParams<{slug: string;}>();
  const location = useLocation();
  const [page, setPage] = useState<PageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useLiveSettings();

  useEffect(() => {
    const fetchPage = async () => {
      // Déterminer le slug : soit via paramètre (:slug), soit via le chemin URL (/about -> about)
      let effectiveSlug = paramSlug;

      if (!effectiveSlug) {
        effectiveSlug = location.pathname.replace(/^\/|\/$/g, '');
      }

      if (!effectiveSlug || effectiveSlug === '') {
        effectiveSlug = 'home';
      }

      const settingsKey = effectiveSlug === 'home' ? 'home_page' : effectiveSlug;



      try {
        const response = await fetch("/api/pages");
        if (!response.ok) throw new Error("Failed to fetch pages");
        const allPages = await response.json();

        const data = allPages.find((p: unknown) => p.slug === effectiveSlug && (p.is_published === true || p.status === 'published'));

        if (!data) {
          // FALLBACK 1: site_settings.page_sections (Database settings)
          // FALLBACK 2: DEFAULT_PAGE_SECTIONS (Hardcoded defaults)
          const liveSection = settings?.page_sections?.[effectiveSlug] || settings?.page_sections?.[settingsKey];
          const defaultData = (DEFAULT_PAGE_SECTIONS as unknown)[effectiveSlug] || (DEFAULT_PAGE_SECTIONS as unknown)[settingsKey];

          const sourceData = liveSection || defaultData;

          if (sourceData) {


            // Map the old "Sections" format to the new "Blocks" format for PageRenderer
            const blocks = (sourceData.sections || []).map((s: unknown) => ({
              id: s.id,
              type: 'section',
              data: {
                title: s.label,
                content: sourceData.content?.[s.id]?.title ?
                `<h3>${sourceData.content[s.id].title}</h3><p>${sourceData.content[s.id].subtitle || ''}</p><ul>${(sourceData.content[s.id].features || []).map((f: string) => `<li>${f}</li>`).join('')}</ul>` :
                sourceData.content?.[s.id] || 'Contenu en attente...'
              }
            }));

            const fallbackPage = {
              id: `fallback-${effectiveSlug}`,
              title: sourceData.hero_title?.replace('|', ' ') || sourceData.label || effectiveSlug,
              slug: effectiveSlug,
              content: sourceData.customHTML || '',
              content_blocks: blocks,
              is_published: true,
              meta_description: sourceData.hero_subtitle || '',
              design_options: {
                hero_enabled: true,
                renderMode: sourceData.renderMode || 'sections'
              }
            } as unknown as PageRecord;

            setPage(fallbackPage);
            setLoading(false);
            return;
          }

          setError('Page non trouvée');
          setLoading(false);
          return;
        }

        // Parse les champs JSON si nécessaire
        const rawData = data;
        const pageData = {
          ...data,
          content: rawData.content_raw || data.content,
          content_blocks: typeof data.content_blocks === 'string' ? JSON.parse(data.content_blocks) : data.content_blocks || [],
          design_options: typeof data.design_options === 'string' ? JSON.parse(data.design_options) : data.design_options || {},
          seo_options: typeof data.seo_options === 'string' ? JSON.parse(data.seo_options) : data.seo_options || {}
        } as PageRecord;

        setPage(pageData);
      } catch (err) {
        console.error('Erreur lors du chargement de la page:', err);
        setError('Erreur lors du chargement de la page');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [paramSlug, location.pathname, settings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Chargement de la page...</p>
        </div>
      </div>);

  }

  if (error || !page) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
          <p className="text-gray-600 mb-8">{error || 'Page non trouvée'}</p>
          <a href="/" className="inline-block px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600">
            ← Retour à l'accueil
          </a>
        </div>
      </div>);

  }



  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title={page.title}
        description={page.seo_options?.meta_description || page.meta_description || ""}
        image={page.featured_image || (page as unknown).hero_background_image}
        keywords={page.meta_keywords || (page.seo_options as unknown)?.keywords}
        path={`/${page.slug}`} />
      

      <Header />

      <main className="flex-grow">
        {(page as unknown).structure_json && (page as unknown).structure_json.length > 0 ?
        <BuilderPageRenderer blocks={(page as unknown).structure_json as Block[]} /> :

        <PageRenderer page={page} />
        }
      </main>

      <Footer />
      <ScrollToTopButton aria-label="Action" />
    </div>);

};

const DynamicPage: React.FC = () => {
  return <DynamicPageComponent />;
};

export default DynamicPage;
