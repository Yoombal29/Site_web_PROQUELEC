import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getSupabaseClient } from '@/utils/supabaseClient';
import { PageRenderer } from '@/components/PageRenderer';
import { Helmet } from 'react-helmet-async';
import type { PageRecord } from '@/types/PageSystem';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';

/**
 * Page générique pour afficher toute page gérée par le système CMS
 * Remplace News.tsx, Trainings.tsx, etc.
 * Compatible WordPress: affiche le contenu et applique le design
 */

const DynamicPageComponent: React.FC = () => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [page, setPage] = useState<PageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      // Déterminer le slug : soit via paramètre (:slug), soit via le chemin URL (/about -> about)
      let effectiveSlug = paramSlug;

      if (!effectiveSlug) {
        // Enlève le slash initial et final éventuel
        effectiveSlug = location.pathname.replace(/^\/|\/$/g, '');
      }

      // Si racine "/" (slug vide après nettoyage), utiliser 'home' comme slug par défaut
      if (!effectiveSlug || effectiveSlug === '') {
        effectiveSlug = 'home';
      }

      console.log('Chargement page dynamique pour slug:', effectiveSlug);

      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', effectiveSlug)
          .eq('is_published', true)
          .single();

        if (error || !data) {
          setError('Page non trouvée');
          setLoading(false);
          return;
        }

        // Parse les champs JSONB si nécessaire (Supabase le fait souvent automatiquement si typé)
        const rawData = data as any;
        const pageData = {
          ...data,
          // ICE ENGINE: Use content_raw (Monaco) if available, otherwise legacy content
          content: rawData.content_raw || data.content,
          content_blocks: data.content_blocks || [],
          design_options: data.design_options || {},
          seo_options: data.seo_options || {}
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
  }, [paramSlug, location.pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Chargement de la page...</p>
        </div>
      </div>
    );
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
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <title>{page.seo_options?.og_title || page.title}</title>
        <meta name="description" content={page.seo_options?.meta_description || page.meta_description} />
      </Helmet>

      <Header />

      <main className="flex-grow">
        <PageRenderer page={page} />
      </main>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

const DynamicPage: React.FC = () => {
  return <DynamicPageComponent />;
};

export default DynamicPage;