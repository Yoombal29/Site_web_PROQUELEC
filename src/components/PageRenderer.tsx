import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import type { PageRecord } from '@/types/PageSystem';
import { HeroSection } from '@/components/HeroSection';

interface PageRendererProps {
  page: PageRecord;
  className?: string;
}

// Configuration options for DOMPurify to allow rich content (futuristic design) but block scripts
const sanitizeConfig = {
  ADD_TAGS: ['iframe', 'style', 'link', 'meta', 'div', 'section', 'span', 'svg', 'path'], // Allow styles and embeds
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target', 'class', 'style', 'data-aos', 'd', 'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'],
  FORBID_TAGS: ['script'], // Strictly forbid scripts
  FORBID_ATTR: ['onmouseover', 'onclick', 'onerror'] // Forbid inline event handlers
};

const sanitizeHtml = (html: string) => {
  return {
    __html: DOMPurify.sanitize(html, sanitizeConfig)
  };
};

/**
 * Composant universel de rendu de pages (comme WordPress template system)
 * Applique les styles design et affiche le contenu formaté
 */
export const PageRenderer: React.FC<PageRendererProps> = ({ page, className = '' }) => {
  const design = page.design_options || {
    background_color: '#ffffff',
    accent_color: '#0066cc',
    text_color: '#333333',
    heading_font: 'sans-serif',
    body_font: 'sans-serif',
    layout: 'default',
    content_width: 'default',
    hero_enabled: false
  };

  const showHero = (page as any).show_hero ?? design.hero_enabled;
  const heroTitle = (page as any).hero_title || page.title;
  const heroSubtitle = (page as any).hero_subtitle || page.excerpt || "";

  // Déterminer un gradient premium dynamique selon le type de page (épuré et varié)
  const getHeroGradient = (slug: string) => {
    const s = slug.toLowerCase();
    if (s.includes('about')) return "bg-gradient-to-br from-indigo-900 via-slate-800 to-blue-900";
    if (s.includes('formation')) return "bg-gradient-to-br from-blue-600 via-blue-800 to-slate-900";
    if (s.includes('certif')) return "bg-gradient-to-br from-emerald-800 via-blue-900 to-slate-900";
    if (s.includes('expert')) return "bg-gradient-to-br from-slate-900 via-blue-900 to-black";
    if (s.includes('label')) return "bg-gradient-to-br from-orange-600 via-slate-800 to-blue-900";
    return "bg-gradient-to-br from-blue-900 via-slate-800 to-blue-900"; // Default
  };

  const styles = useMemo(() => {
    return `
      :root {
        --page-bg-color: ${design.background_color};
        --page-accent-color: ${design.accent_color};
        --page-text-color: ${design.text_color};
        --page-heading-font: ${design.heading_font};
        --page-body-font: ${design.body_font};
      }

      .page-renderer {
        background-color: var(--page-bg-color);
        color: var(--page-text-color);
      }
    `;
  }, [design]);

  const renderBlocks = () => {
    // FALLBACK: Legacy content (HTML stored in `content` column)
    if (!page.content_blocks || page.content_blocks.length === 0) {
      // Pour les designs futuristes complets, on veut éviter la contrainte "prose" et "max-w"
      // Si le contenu commence par <div class="w-full", on suppose que c'est un layout complet
      const isFullLayout = page.content?.includes('w-full') || page.content?.includes('min-h-screen');

      return (
        <div
          className={isFullLayout ? "w-full" : "prose prose-lg max-w-none mx-auto py-12 px-4 md:py-20"}
          dangerouslySetInnerHTML={sanitizeHtml(page.content || '')}
        />
      );
    }

    // BLOCKS SYSTEM (New standard)
    return page.content_blocks.map((block: any) => {
      switch (block.type) {
        case 'hero':
          return (
            <section key={block.id} className="relative w-full py-24 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-black z-0" />
              <div className="relative z-10 px-4">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  {block.data.title}
                </h1>
                <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-5 delay-200 duration-1000">
                  {block.data.subtitle}
                </p>
              </div>
            </section>
          );
        // ... (autres cas inchangés ou améliorés)
        case 'text':
          return (
            <div key={block.id} className="max-w-4xl mx-auto px-4 my-12 text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={sanitizeHtml(block.data.content)} />
          );
        case 'cta':
          return (
            <section key={block.id} className="py-16 text-center bg-gray-50">
              <a href={block.data.link} className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/30">
                {block.data.label}
              </a>
            </section>
          );
        default:
          return null;
      }
    });
  };

  return (
    <>
      <style>{styles}</style>
      {/* Suppression du padding par défaut pour permettre le Full Width */}
      {/* Compensation pour Header Fixed si pas de Hero */}
      <div className={`page-renderer min-h-screen ${!showHero ? 'pt-20' : ''} ${className}`}>
        {showHero && (
          <HeroSection
            title={heroTitle}
            subtitle={heroSubtitle}
            gradient={getHeroGradient(page.slug)}
          />
        )}
        {renderBlocks()}
      </div>
    </>
  );
};

export default PageRenderer;
