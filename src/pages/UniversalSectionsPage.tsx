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
import { SectionRenderer } from '@/components/cms/SectionRenderer';

interface SectionContent extends Record<string, unknown> {
  id?: string;
  type?: string;
  label?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  icon?: string;
  features?: unknown[];
  media?: {
    type?: string;
    url?: string;
    urls?: string[];
  };
  stats?: unknown[];
  styles?: Record<string, unknown>;
}

interface PageSectionData {
  hero_title?: string;
  hero_subtitle?: string;
  badge?: string;
  label?: string;
  renderMode?: 'sections' | 'html';
  customHTML?: string;
  sections?: SectionContent[];
  content?: Record<string, SectionContent>;
}

interface Props {
  pageKey: string;
}

const inferSectionType = (section: SectionContent, content: SectionContent): string => {
  if (content.type || section.type) return String(content.type || section.type);
  if (section.id === 'hero') return 'hero';
  if (section.id === 'stats' || content.stats || section.stats) return 'stats';
  if (content.customHTML || section.customHTML) return 'custom-html';
  if (content.image || section.image || content.media || section.media) return 'text-image';
  return 'features-list';
};

const normalizeFeature = (feature: unknown): unknown => {
  if (typeof feature !== 'string' || !feature.includes('|')) return feature;

  const parts = feature.split('|').map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return feature;

  return {
    title: parts[0],
    icon: parts.length > 2 ? parts[1] : 'CheckCircle2',
    description: parts.length > 2 ? parts.slice(2).join(' | ') : parts[1],
  };
};

const normalizeStats = (items: unknown[] | undefined): unknown[] | undefined => {
  if (!Array.isArray(items)) return undefined;

  return items.map((item) => {
    if (typeof item !== 'string' || !item.includes('|')) return item;

    const [value, label, description] = item.split('|').map((part) => part.trim());
    return {
      value,
      label,
      description,
    };
  });
};

const UniversalSectionsPage: React.FC<Props> = ({ pageKey }) => {
  const { settings } = useLiveSettings();
  const fallbackKey = pageKey === 'trainings' ? 'formations' : pageKey;
  const sectionData: PageSectionData | undefined =
    (settings as Record<string, unknown>)?.page_sections?.[pageKey] as PageSectionData ||
    (DEFAULT_PAGE_SECTIONS as Record<string, PageSectionData>)?.[pageKey] ||
    (DEFAULT_PAGE_SECTIONS as Record<string, PageSectionData>)?.[fallbackKey];

  const configuredSections = sectionData?.sections || [];
  const hasHeroSection = configuredSections.some(
    (section) => section?.id === 'hero' || section?.type === 'hero',
  );
  const sections =
    sectionData && !hasHeroSection
      ? [{ id: 'hero', label: 'Bannière', icon: 'Zap', type: 'hero' }, ...configuredSections]
      : configuredSections;
  const content = sectionData?.content || {};
  const contentHero = content.hero || {};
  const firstContentTitle = Object.values(content).find((section) => section?.title)?.title;
  const pageTitle = sectionData?.hero_title || sectionData?.label || contentHero.title || firstContentTitle || pageKey;
  const pageSubtitle = sectionData?.hero_subtitle || '';

  const normalizeSection = (section: SectionContent, index: number): SectionContent => {
    const sectionContent = content[section.id || ''] || {};
    const inferredType = inferSectionType(section, sectionContent);
    const isHero = inferredType === 'hero';
    const rawFeatures = sectionContent.features || section.features;
    const rawHeroTitle = sectionContent.title || section.title;
    const heroTitle =
      isHero && pageTitle
        ? String(pageTitle)
        : String(rawHeroTitle || section.label || '');
    const merged: SectionContent = {
      ...section,
      ...sectionContent,
      id: section.id || `section-${index}`,
      type: inferredType,
      title: isHero ? heroTitle : sectionContent.title || section.title || section.label,
      subtitle: sectionContent.subtitle || section.subtitle || (isHero ? pageSubtitle : ''),
      badge: sectionContent.badge || section.badge || (isHero ? sectionData?.badge : undefined),
      media:
        sectionContent.media ||
        section.media ||
        (sectionContent.image || section.image
          ? { type: 'image', url: String(sectionContent.image || section.image) }
          : undefined),
      features:
        inferredType === 'stats' || !Array.isArray(rawFeatures)
          ? rawFeatures
          : rawFeatures.map(normalizeFeature),
      stats:
        sectionContent.stats ||
        section.stats ||
        (inferredType === 'stats' ? normalizeStats(rawFeatures) : undefined),
    };

    return merged;
  };

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
        title={pageTitle}
        description={pageSubtitle}
      />
      <Header />
      <main className="flex-grow">
        {sectionData.renderMode === 'html' ? (
          <section className="bg-white">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: sectionData.customHTML || '' }}
            />
          </section>
        ) : (
          <div className="space-y-0">
            {sections.length > 0 ? (
              sections.map((section, index) => (
                <SectionRenderer
                  key={section.id || index}
                  section={normalizeSection(section, index) as any}
                  index={index}
                  themeColor="blue"
                />
              ))
            ) : (
              Object.entries(content).map(([key, section], index) => (
                <SectionRenderer
                  key={key}
                  section={normalizeSection({ ...section, id: key }, index) as any}
                  index={index}
                  themeColor="blue"
                />
              ))
            )}
          </div>
        )}
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default UniversalSectionsPage;
