import React, { useEffect, useState, ComponentType } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { PageRenderer } from '@/components/PageRenderer';
import { SEO } from '@/components/SEO';
import type { PageRecord } from '@/types/PageSystem';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { DEFAULT_PAGE_SECTIONS } from '@/data/defaultPageSections';
import UniversalSectionsPage from '@/pages/UniversalSectionsPage';
// @ts-ignore
import BuilderPageRenderer from '@/components/builder/BuilderPageRenderer';
import { Block } from "@/types/builder";
import ToolsPlatform from './ToolsPlatform';
import Showroom from './Showroom';
import Documents from './Documents';
import Events from './Events';
import Labels from './Labels';

import { useLiveSettings } from '@/hooks/useLiveSettings';

// Craft.js read-only rendering
import { Editor, Frame } from '@craftjs/core';
import { CRAFT_RESOLVER } from '@/components/blocks/craftResolver';

const PAGE_ALIASES: Record<string, string> = {
  home: 'home_page',
  about: 'about',
  'utilite-publique': 'public_utility',
  'formation-certification': 'formation_certification',
  'normes-ressources': 'normes_ressources',
  'projets-realisations': 'projets_realisations',
  actualites: 'actualites_evenements',
  'actualites-evenements': 'actualites_evenements',
  'contact-premium': 'contact_premium',
  formations: 'trainings',
  'formations-proquelec': 'formations_proquelec',
  'expertises-techniques': 'expertises_techniques',
  'expert-lab': 'expert_lab',
  'espace-menages': 'menages',
  'espace-professionnels': 'professionnels',
  'espace-autorites': 'autorites',
  avantages: 'advantages',
  // Nouveaux slugs du menu BD
  'nos-actions': 'nos_actions',
  projets: 'projets',
  galerie: 'galerie',
  marches: 'marches',
  collectivites: 'collectivites',
  publications: 'publications',
  faq: 'faq',
  'normative-corpus': 'normative_corpus',
  'conseils-menages': 'conseils_menages',
  'ressources-pedagogiques': 'ressources_pedagogiques',
  'partenaires-liste': 'partenaires_liste',
  partenaires: 'partenaires',
  'partenariat-senelec': 'partenariat_senelec',
  temoignages: 'temoignages',
  'espace-partenaires': 'espace_partenaires',
};

const SPECIAL_FALLBACK_PAGES: Record<string, ComponentType> = {
  outils: ToolsPlatform,
  showroom: Showroom,
  documents: Documents,
  events: Events,
  labels: Labels
};

/**
 * Détecte si une structure JSON est un arbre de nœuds Craft.js
 * (objet avec une clé "ROOT" contenant un type et des nœuds)
 */
function isCraftJsStructure(data: unknown): data is Record<string, unknown> {
  return (
    data !== null &&
    typeof data === 'object' &&
    !Array.isArray(data) &&
    'ROOT' in (data as Record<string, unknown>)
  );
}

/**
 * Page générique pour afficher toute page gérée par le système CMS
 * Remplace News.tsx, Trainings.tsx, etc.
 * Compatible WordPress: affiche le contenu et applique le design
 */

const DynamicPageComponent: React.FC = () => {
  const { slug: paramSlug } = useParams<{slug: string;}>();
  const location = useLocation();
  const navigate = useNavigate();
  const rawSlug = paramSlug || location.pathname.replace(/^\//, '').replace(/\/$/, '').replace(/^(fr|en)\//, '');
  const effectiveSlug = rawSlug === '' || rawSlug === 'fr' || rawSlug === 'en' ? 'home' : rawSlug;
  const resolvedPageKey = PAGE_ALIASES[effectiveSlug] || effectiveSlug;
  const [page, setPage] = useState<PageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackPageKey, setFallbackPageKey] = useState<string | null>(null);
  const { settings } = useLiveSettings();

  useEffect(() => {
    const match = location.pathname.match(/^\/(fr|en)(\/.*)?$/);
    if (match) {
      const cleanPath = match[2] || '/';
      navigate(cleanPath, { replace: true });
    }
  }, [location.pathname, navigate]);

  // Réinitialiser les états lors d'un changement de page
  useEffect(() => {
    setLoading(true);
    setPage(null);
    setError(null);
    setFallbackPageKey(null);
  }, [location.pathname]);

  // Gestion du défilement vers l'ancre (ex: /partenaires#institutionnels)
  useEffect(() => {
    if (!loading && location.hash) {
      const id = decodeURIComponent(location.hash.replace('#', ''));
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [loading, location.hash, page, fallbackPageKey]);

  useEffect(() => {
    const fetchPage = async () => {
      // Toujours utiliser le pathname complet comme slug (sans le leading slash)
      // Cela gère correctement /actions/conformite, /evenements/ateliers, etc.
      let effectiveSlug = location.pathname.replace(/^\/|\/$/g, '').replace(/^(fr|en)\//, '');

      if (!effectiveSlug || effectiveSlug === '') {
        effectiveSlug = 'home';
      }

      // Supprimer les query strings et hash du slug
      effectiveSlug = effectiveSlug.split('?')[0].split('#')[0];

      const resolvedPageKey = PAGE_ALIASES[effectiveSlug] || effectiveSlug;
      const settingsKey = resolvedPageKey;



      try {
        const response = await fetch("/api/pages");
        if (!response.ok) throw new Error("Failed to fetch pages");
        const allPages = await response.json();

        const data = allPages.find((p: any) => {
  const pageSlug = (p.slug || '').replace(/^\//, '');
  const matchSlugs = effectiveSlug === 'home'
    ? ['home', 'home_page', '']
    : [effectiveSlug, ...(PAGE_ALIASES[effectiveSlug] ? [PAGE_ALIASES[effectiveSlug]] : [])];
  return matchSlugs.includes(pageSlug) && (p.is_published === true || p.status === 'published');
});

        if (!data) {
          // FALLBACK 1: site_settings.page_sections (Database settings)
          // FALLBACK 2: DEFAULT_PAGE_SECTIONS (Hardcoded defaults)
          const liveSection = settings?.page_sections?.[effectiveSlug] || settings?.page_sections?.[resolvedPageKey];
          const defaultData = (DEFAULT_PAGE_SECTIONS as unknown)[effectiveSlug] || (DEFAULT_PAGE_SECTIONS as unknown)[resolvedPageKey];

          const sourceData = liveSection || defaultData;

          if (sourceData) {
            setPage(null);
            setFallbackPageKey(settingsKey);
            setLoading(false);
            return;
          }

          const fallbackPageComponent = SPECIAL_FALLBACK_PAGES[effectiveSlug];
          if (fallbackPageComponent) {
            setFallbackPageKey(effectiveSlug);
            setPage(null);
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
          seo_options: typeof data.seo_options === 'string' ? JSON.parse(data.seo_options) : data.seo_options || {},
          structure_json: typeof data.structure_json === 'string' ? JSON.parse(data.structure_json) : data.structure_json || null,
          theme_config: typeof data.theme_config === 'string' ? JSON.parse(data.theme_config) : data.theme_config || null,
        } as PageRecord;

        // Si la page est une page spéciale (outils, showroom, etc.)
        // avec render_engine='react' en DB, utiliser le composant React
        // au lieu du rendu Craft.js (HtmlBlock)
        if (SPECIAL_FALLBACK_PAGES[effectiveSlug] && (data as any).render_engine === 'react') {
          setFallbackPageKey(effectiveSlug);
          setPage(null);
          setLoading(false);
          return;
        }

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
      </div>);

  }

  const specialFallbackPage = SPECIAL_FALLBACK_PAGES[fallbackPageKey || effectiveSlug];
  if (specialFallbackPage && !page) {
    return React.createElement(specialFallbackPage);
  }

  if (fallbackPageKey) {
    return <UniversalSectionsPage pageKey={fallbackPageKey} />;
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

  // Determine the rendering strategy based on structure_json format
  const structureJson = (page as any).structure_json;
  const themeConfig = (page as any).theme_config;

  const themeVars = themeConfig ? {
    '--theme-primary-color': themeConfig.primaryColor || '#2563eb',
    '--theme-secondary-color': themeConfig.secondaryColor || '#4f46e5',
    '--theme-font-family': themeConfig.fontFamily || 'Inter, sans-serif',
    '--theme-border-radius': themeConfig.borderRadius || '8px',
    '--theme-spacing-scale': themeConfig.spacingScale || '1',
  } : {};

  const renderPageContent = () => {
    // Strategy 1: Craft.js structure (object with ROOT key) — read-only rendering
    if (structureJson && isCraftJsStructure(structureJson)) {
      return (
        <Editor resolver={CRAFT_RESOLVER} enabled={false}>
          <Frame data={JSON.stringify(structureJson)} />
        </Editor>
      );
    }

    // Strategy 2: Legacy builder array of blocks
    if (structureJson && Array.isArray(structureJson) && structureJson.length > 0) {
      return <BuilderPageRenderer blocks={structureJson as Block[]} />;
    }

    // Strategy 3: HTML content fallback (PageRenderer)
    return <PageRenderer page={page} />;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title={page.title}
        description={page.seo_options?.meta_description || page.meta_description || ""}
        image={page.featured_image || (page as unknown).hero_background_image}
        keywords={page.meta_keywords || (page.seo_options as unknown)?.keywords}
        path={`/${page.slug}`} />

      {/* Global theme CSS variables pour HtmlBlock et autres contenus */}
      {themeConfig && (
        <style>{`
          :root {
            --theme-primary: ${themeConfig.primaryColor || '#2563eb'};
            --theme-secondary: ${themeConfig.secondaryColor || '#4f46e5'};
            --theme-font: ${themeConfig.fontFamily || 'Inter, sans-serif'};
            --theme-radius: ${themeConfig.borderRadius || '8px'};
            --theme-spacing: ${themeConfig.spacingScale || '1'};
          }
        `}</style>
      )}

      <Header />

      <main className="flex-grow" style={themeVars as any}>
        {renderPageContent()}
      </main>

      <Footer />
      <ScrollToTopButton aria-label="Action" />
    </div>);

};

const DynamicPage: React.FC = () => {
  return <DynamicPageComponent />;
};

export default DynamicPage;
