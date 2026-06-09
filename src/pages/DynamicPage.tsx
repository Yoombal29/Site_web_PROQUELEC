import React, { useEffect, useState, ComponentType, Suspense } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { PageRenderer } from '@/components/PageRenderer';
import { SEO } from '@/components/SEO';
import type { PageRecord } from '@/types/PageSystem';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { DEFAULT_PAGE_SECTIONS } from '@/data/defaultPageSections';
import UniversalSectionsPage from '@/pages/UniversalSectionsPage';
// @ts-expect-error - BuilderPageRenderer may not have full type definitions in build step
import BuilderPageRenderer from '@/components/builder/BuilderPageRenderer';
import { Block } from '@/types/builder';
import {
  getFunctionalStructureForPage,
  isDesignLockedFunctionalPage,
} from '@/lib/functional-page-structure';
import { createHtmlCraftStructure } from '@/lib/craft-html-structure';
import ToolsPlatform from './ToolsPlatform';
import Showroom from './Showroom';
import Documents from './Documents';
import Events from './Events';
import Labels from './Labels';

import { useLiveSettings } from '@/hooks/useLiveSettings';

// Craft.js read-only rendering — import lazy pour éviter d'alourdir le bundle public
const CraftPageRenderer = React.lazy(() => import('@/components/CraftPageRenderer'));

// Loading spinner pour le lazy loading Craft.js
const PageLoading = () => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
      <p className="text-sm text-gray-500">Chargement...</p>
    </div>
  </div>
);

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
  labels: Labels,
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
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const rawSlug =
    paramSlug ||
    location.pathname
      .replace(/^\//, '')
      .replace(/\/$/, '')
      .replace(/^(fr|en)\//, '');
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
        const response = await fetch('/api/pages');
        if (!response.ok) throw new Error('Failed to fetch pages');
        const allPages = await response.json();

        const findPublishedPageBySlug = (slugToFind: string) =>
          allPages.find((p: any) => {
            const pageSlug = (p.slug || '').replace(/^\//, '');
            return pageSlug === slugToFind && (p.is_published === true || p.status === 'published');
          });

        const data =
          findPublishedPageBySlug(effectiveSlug) ||
          (PAGE_ALIASES[effectiveSlug]
            ? findPublishedPageBySlug(PAGE_ALIASES[effectiveSlug])
            : null);

        if (!data) {
          // FALLBACK 1: site_settings.page_sections (Database settings)
          // FALLBACK 2: DEFAULT_PAGE_SECTIONS (Hardcoded defaults)
          const liveSection =
            (settings as any)?.page_sections?.[effectiveSlug] ||
            (settings as any)?.page_sections?.[resolvedPageKey];
          const defaultData =
            (DEFAULT_PAGE_SECTIONS as unknown)[effectiveSlug] ||
            (DEFAULT_PAGE_SECTIONS as unknown)[resolvedPageKey];

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
          content_blocks: (() => {
            const rawValue = data.content_blocks;
            if (Array.isArray(rawValue)) return rawValue;
            if (typeof rawValue === 'string') {
              try {
                const parsed = JSON.parse(rawValue);
                return Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
              } catch {
                return [];
              }
            }
            if (rawValue && typeof rawValue === 'object') return [rawValue];
            return [];
          })(),
          design_options:
            typeof data.design_options === 'string'
              ? JSON.parse(data.design_options)
              : data.design_options || {},
          seo_options:
            typeof data.seo_options === 'string'
              ? JSON.parse(data.seo_options)
              : data.seo_options || {},
          structure_json:
            typeof data.structure_json === 'string'
              ? JSON.parse(data.structure_json)
              : data.structure_json || null,
          theme_config:
            typeof data.theme_config === 'string'
              ? JSON.parse(data.theme_config)
              : data.theme_config || null,
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
      </div>
    );
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
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            ← Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  // Determine the rendering strategy based on structure_json format
  const structureJson = (page as any).structure_json;
  const themeConfig = (page as any).theme_config;

  const themeVars = themeConfig
    ? {
        '--theme-primary-color': themeConfig.primaryColor || '#2563eb',
        '--theme-secondary-color': themeConfig.secondaryColor || '#4f46e5',
        '--theme-font-family': themeConfig.fontFamily || 'Inter, sans-serif',
        '--theme-border-radius': themeConfig.borderRadius || '8px',
        '--theme-spacing-scale': themeConfig.spacingScale || '1',
      }
    : {};

  const renderPageContent = () => {
    try {
      // Functional immutable pages are design-locked: never render stale editable placeholders.
      if (isDesignLockedFunctionalPage(page as any)) {
        const { structure } = getFunctionalStructureForPage(
          page as any,
          (page as any).slug || effectiveSlug,
          page.title || 'Page fonctionnelle',
        );

        return (
          <Suspense fallback={<PageLoading />}>
            <CraftPageRenderer
              structureJson={structure}
              fallback={<RenderFallback page={page} />}
            />
          </Suspense>
        );
      }

      // Strategy 1: Legacy builder array of blocks
      if (structureJson && Array.isArray(structureJson) && structureJson.length > 0) {
        return <BuilderPageRenderer blocks={structureJson as Block[]} />;
      }

      // Strategy 2: Craft.js structure (rendu en lecture seule via Frame)
      if (structureJson && isCraftJsStructure(structureJson)) {
        return (
          <Suspense fallback={<PageLoading />}>
            <CraftPageRenderer
              structureJson={structureJson}
              fallback={<RenderFallback page={page} />}
            />
          </Suspense>
        );
      }

      // Strategy 3: HTML ou contenu brut
      const htmlContent = (page as any).content_raw || (page as any).content || '';
      const wrappedStructure = createHtmlCraftStructure(htmlContent);
      return (
        <Suspense fallback={<PageLoading />}>
          <CraftPageRenderer
            structureJson={wrappedStructure}
            fallback={<RenderFallback page={page} />}
          />
        </Suspense>
      );
    } catch (err) {
      console.error('[DynamicPage] Erreur rendu:', err);
      return <RenderFallback page={page} />;
    }
  };

  // Fallback HTML si le rendu Craft.js échoue
  const RenderFallback = ({ page }: { page: any }) => {
    const htmlContent = page?.content_raw || page?.content || '';
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        {htmlContent ? (
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        ) : (
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">{page?.title || 'Page'}</h1>
            <p className="text-slate-500">Contenu en cours de création.</p>
            <a
              href="/contact"
              className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Contacter PROQUELEC
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title={page.title}
        description={page.seo_options?.meta_description || page.meta_description || ''}
        image={(page as any).featured_image || (page as any).hero_background_image}
        keywords={(page as any).meta_keywords || (page as any).seo_options?.keywords}
        path={`/${page.slug}`}
      />

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

      {/* 🔒 Badge pour pages fonctionnelles (non modifiables via le Builder) */}
      {(page as any).immutable === true && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 text-sm text-amber-700">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            <span className="font-medium">Page fonctionnelle</span>
            <span className="text-amber-500">·</span>
            <span>
              Cette page contient de la logique métier et ne peut pas être modifiée via le Builder.
            </span>
            {(page as any).security_level === 'authenticated' && (
              <>
                <span className="text-amber-500">·</span>
                <span className="font-medium">Accès réservé aux utilisateurs connectés</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* 🔵 Badge pour pages hybrides */}
      {(page as any).immutable === true && (page as any).design_options?.page_type === 'hybrid' && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 text-sm text-blue-700">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
            <span className="font-medium">Page hybride</span>
            <span className="text-blue-500">·</span>
            <span>Contenu éditable avec blocs logiques intégrés.</span>
          </div>
        </div>
      )}

      {(page as any).immutable === true && (page as any).design_options?.page_type === 'hybrid' ? (
        <main className="flex-grow" style={themeVars as any}>
          {renderPageContent()}
        </main>
      ) : (page as any).immutable === true ? (
        <main className="flex-grow" style={themeVars as any}>
          {renderPageContent()}
        </main>
      ) : (
        <main className="flex-grow" style={themeVars as any}>
          {renderPageContent()}
        </main>
      )}

      <Footer />
      <ScrollToTopButton aria-label="Action" />
    </div>
  );
};

const DynamicPage: React.FC = () => {
  return <DynamicPageComponent />;
};

export default DynamicPage;
