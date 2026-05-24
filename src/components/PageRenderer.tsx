import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

import { HeroSection } from '@/components/HeroSection';
import {
  HeadingBlock,
  TextBlock,
  DividerBlock,
  SpacerBlock,
  ButtonBlock,
  AccordionBlock,
  CTABlock,
  ImageBlock,
  QuoteBlock,
  StatsBlock,
  FeatureBlock,
  PricingBlock,
  TestimonialsListBlock,
  HeroBlock,
  VideoBlock,
  TabsBlock } from
'@/components/blocks/ContentBlocks';

import { LatestNews } from '@/components/LatestNews';
import { PartnerLogos } from '@/components/PartnerLogos';
import type { PageRecord } from '@/types/PageSystem';
import type { Block } from '@/types/builder';

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
    theme_id: 'standard',
    layout: 'default',
    hero_enabled: false,
    hero_height: 'medium',
    hero_overlay: 0,
    hero_alignment: 'center',
    content_width: 'default',
    sidebar_enabled: false,
    sidebar_position: 'right',
    footer_cta_enabled: false,
    background_color: '#ffffff',
    accent_color: '#0066cc',
    text_color: '#333333',
    heading_font: 'sans-serif',
    body_font: 'sans-serif',
    custom_sections: []
  };

  const slug = (page.slug || '').toLowerCase();
  const isHome = slug === 'home' || slug === 'home_page';
  const hasHeroBlock = Array.isArray(page.content_blocks) && page.content_blocks.some((b: any) => b?.type === 'hero');
  const builderBlocks = (page as any).structure_json;
  const hasBuilderHero = Array.isArray(builderBlocks) && builderBlocks.some((b: any) => b?.type === 'hero');
  const showHero = (page as any).show_hero ?? (isHome ? (!hasHeroBlock && !hasBuilderHero) : design.hero_enabled);
  const heroTitle = (page as any).hero_title || page.title;
  const heroSubtitle = (page as any).hero_subtitle || page.excerpt || "";
  const customHeroButton = (page as any).hero_cta_text && (page as any).hero_cta_link ? {
    label: (page as any).hero_cta_text,
    href: (page as any).hero_cta_link,
    variant: "primary" as const
  } : null;

  const defaultHomeButtons = [
    { label: "Découvrir", href: "/about", variant: "secondary" as const },
    { label: "Se connecter", href: "/connexion", variant: "primary" as const }
  ];

  const heroButtons = customHeroButton 
    ? [customHeroButton] 
    : isHome ? defaultHomeButtons : undefined;

  // Déterminer un gradient premium dynamique selon le type de page (épuré et varié)
  const getHeroGradient = (slug: string) => {
    const s = slug ? slug.toLowerCase() : '';
    if (s.includes('menage')) return "bg-gradient-to-br from-rose-600 via-rose-800 to-slate-900";
    if (s.includes('pro')) return "bg-gradient-to-br from-blue-600 via-blue-800 to-indigo-900";
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
        --page-bg-color: ${design.background_color || '#ffffff'};
        --page-accent-color: ${design.accent_color || '#2376df'};
        --page-text-color: ${design.text_color || '#333333'};
        --page-heading-font: ${design.heading_font || 'sans-serif'};
        --page-body-font: ${design.body_font || 'sans-serif'};
      }

      .page-renderer {
        background-color: var(--page-bg-color);
        color: var(--page-text-color);
        font-family: var(--page-body-font);
      }
      
      .page-renderer h1, .page-renderer h2, .page-renderer h3, .page-renderer h4, .page-renderer h5, .page-renderer h6 {
        font-family: var(--page-heading-font);
      }

      .sticky-nav-active {
        background: white;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      }
    `;
  }, [design]);

  const layoutWrapperClass = design.layout === 'full-width'
    ? 'w-full'
    : design.layout === 'boxed'
      ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
      : design.layout === 'card'
        ? 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'
        : 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8';

  const contentWrapperClass = design.content_width === 'narrow'
    ? 'max-w-3xl mx-auto'
    : design.content_width === 'wide'
      ? 'max-w-6xl mx-auto'
      : design.content_width === 'full'
        ? 'max-w-full mx-auto'
        : 'max-w-5xl mx-auto';

  // Identify sections for sticky nav
  const sections = useMemo(() => {
    if (page.content_blocks && page.content_blocks.length > 0) {
      return (page.content_blocks as any[]).
      filter((b) => b.type === 'section' || b.type === 'heading').
      map((b) => ({
        id: b.id,
        label: (b as any)?.data?.title || (b as any)?.data?.label || (b as any)?.data?.content || 'Section'
      }));
    }
    return [];
  }, [page.content_blocks]);

  const renderBlocks = () => {
    // FALLBACK: Legacy content (HTML stored in `content` column)
    if (!page.content_blocks || page.content_blocks.length === 0) {
      const isFullLayout = page.content?.includes('w-full') || page.content?.includes('min-h-screen');

      return (
        <div
          className={isFullLayout ? "w-full" : "prose prose-lg max-w-none mx-auto py-12 px-4 md:py-20"}
          dangerouslySetInnerHTML={sanitizeHtml(page.content || '')} />);


    }

    // BLOCKS SYSTEM (New standard like be-builder)
    return (
      <div className="space-y-0">
        {((page.content_blocks as any) as any[]).map((block, index: number) => {
          const blockData = (block as any)?.data || {};
          return (
            <div key={block.id} id={block.id} className="scroll-mt-32">
              {(() => {
                switch (block.type) {
                  case 'section':
                    const isAlt = index % 2 === 1;
                    if (!isHome) {
                      return (
                        <section className="py-20 px-4">
                          <div className="container max-w-7xl mx-auto">
                            <div className="mb-12 border-l-4 border-blue-600 pl-8">
                              <span className="font-black uppercase tracking-widest text-sm text-blue-600">Section</span>
                              <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">{blockData?.title || blockData?.label || 'Contenu'}</h2>
                            </div>
                            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={sanitizeHtml(blockData?.content || '')} />
                          </div>
                        </section>);
                    }
                    return (
                      <section className={`px-4 ${isAlt ? 'bg-slate-50/80' : 'bg-white'} ${index === 0 && !showHero ? 'pt-16 pb-20' : 'py-20'} border-t border-slate-100`}>
                        <div className="container max-w-6xl mx-auto">
                          <div className="mb-10">
                            <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold tracking-wide text-blue-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                              {blockData?.eyebrow || 'Section'}
                            </div>
                            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">{blockData?.title || blockData?.label || 'Contenu'}</h2>
                          </div>
                          <div className="prose prose-slate prose-lg max-w-none" dangerouslySetInnerHTML={sanitizeHtml(blockData?.content || '')} />
                        </div>
                      </section>);

                  case 'hero':
                    return <HeroBlock {...blockData} />;
                  case 'video':
                    return <VideoBlock {...blockData} />;
                  case 'tabs':
                    return <TabsBlock {...blockData} />;
                  case 'heading':
                    return <HeadingBlock {...blockData} />;
                  case 'text':
                    return <TextBlock {...blockData} />;
                  case 'divider':
                    return <DividerBlock {...blockData} />;
                  case 'spacer':
                    return <SpacerBlock {...blockData} />;
                  case 'button':
                    return <ButtonBlock {...blockData} aria-label="Action" />;
                  case 'cta':
                    return <CTABlock {...blockData} />;
                  case 'accordion':
                    return <AccordionBlock {...blockData} />;
                  case 'image':
                    return <ImageBlock {...blockData} />;
                  case 'quote':
                    return <QuoteBlock {...blockData} />;
                  case 'stats':
                    return <StatsBlock {...blockData} />;
                  case 'feature':
                    return <FeatureBlock {...blockData} />;
                  case 'pricing':
                    return <PricingBlock {...blockData} />;
                  case 'testimonials_list':
                    return <TestimonialsListBlock {...blockData} />;
                  case 'latest_news':
                    return <LatestNews key={block.id} />;
                  case 'partner_logos':
                    return <PartnerLogos key={block.id} />;
                  default:
                    return (
                      <div className="p-4 bg-slate-50 border-2 border-dashed rounded text-xs text-slate-400 text-center mx-4 my-2">
                        Composant non implémenté: {block.type}
                      </div>);
                }
              })()}
            </div>
          );
        })}
      </div>);

  };

  return (
    <>
      <style>{styles}</style>
      <div className={`page-renderer min-h-screen ${!showHero ? 'pt-20' : ''} ${className}`}>
        {showHero &&
        <HeroSection
          title={heroTitle}
          subtitle={heroSubtitle}
          gradient={getHeroGradient(page.slug || '')}
          buttons={heroButtons} />

        }

        {/* Dynamic Sticky Navigation for Sections */}
        {sections.length > 1 &&
        <div className="sticky top-24 z-[40] mt-[-60px] flex justify-center px-4 w-full">
            <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-full p-1.5 max-w-full overflow-hidden">
              <div className="flex items-center gap-1 md:gap-2 overflow-x-auto max-w-[90vw] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] px-1">
                {sections.map((section) =>
              <button
                key={section.id}
                onClick={() => {
                  const el = document.getElementById(section.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap text-slate-500 hover:bg-white hover:shadow-md hover:text-blue-600" aria-label="Action">
                
                    {section.label}
                  </button>
              )}
              </div>
            </div>
          </div>
        }

        <div className="animate-in fade-in duration-700">
          <div className={`${layoutWrapperClass}`}>
            <div className={`${contentWrapperClass}`}>
              {renderBlocks()}
            </div>
          </div>
        </div>
      </div>
    </>);

};

export default PageRenderer;
