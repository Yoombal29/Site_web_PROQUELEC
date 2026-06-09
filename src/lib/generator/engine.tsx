import React from 'react';
import { Element } from '@craftjs/core';
import { ContainerBlock } from '../../components/blocks/ProquelecBlocks';
import type { Theme } from './themes';
import { THEMES } from './themes';
import type { IndustryContent } from './industries';
import { INDUSTRIES } from './industries';
import { PAGE_BLUEPRINTS, type SectionTemplate } from './sections';

export interface GeneratedSite {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  theme: string;
  themeId: string;
  pageCount: number;
  pages: { name: string; factory: () => React.ReactElement }[];
  thumbnail: string;
}

export interface GeneratedPage {
  id: string;
  siteName: string;
  name: string;
  category: string;
  industry: string;
  themeName: string;
  themeId: string;
  factory: () => React.ReactElement;
}

// Wrap sections in a root container
function wrapPage(blueprint: { name: string; sections: SectionTemplate[] }, theme: Theme, content: IndustryContent): () => React.ReactElement {
  return () => (
    <Element is={ContainerBlock} canvas padding={0} maxWidth="100%">
      {blueprint.sections.map((section, i) => (
        <Element key={i} is={ContainerBlock} canvas padding={0}>
          {section(theme, content)}
        </Element>
      ))}
    </Element>
  );
}

// ── Generator ──
export function generateAllTemplates(): { sites: GeneratedSite[]; pages: GeneratedPage[] } {
  const sites: GeneratedSite[] = [];
  const pages: GeneratedPage[] = [];
  let idCounter = 0;

  // For each theme × industry combination, create pages
  for (let ti = 0; ti < Math.min(THEMES.length, 50); ti++) {
    const theme = THEMES[ti];
    for (let ii = 0; ii < Math.min(INDUSTRIES.length, 10); ii++) {
      const content = INDUSTRIES[ii];
      const siteName = content.name + ' — ' + theme.name;

      // Pick ~4-6 blueprints per site (first 5 + randomly selected)
      const selectedBlueprints = PAGE_BLUEPRINTS.slice(0, Math.min(5, PAGE_BLUEPRINTS.length));
      // Add 2-3 more from different categories for variety
      const extraIndices = [7, 10, 12, 15, 18]; // spread across blueprints
      for (let j = 5; j < Math.min(8, PAGE_BLUEPRINTS.length); j++) {
        if (extraIndices[j - 5] !== undefined && extraIndices[j - 5] < PAGE_BLUEPRINTS.length) {
          selectedBlueprints.push(PAGE_BLUEPRINTS[extraIndices[j - 5]]);
        }
      }

      const sitePages = selectedBlueprints.map((bp) => ({
        name: bp.name,
        category: bp.category,
        factory: wrapPage(bp, theme, content),
      }));

      const site: GeneratedSite = {
        id: 'template_' + String(idCounter++).padStart(4, '0'),
        name: siteName,
        description: 'Site ' + content.name.toLowerCase() + ' — thème ' + theme.name,
        category: content.name,
        industry: content.id,
        theme: theme.name,
        themeId: theme.id,
        pageCount: sitePages.length,
        pages: sitePages,
        thumbnail: '',
      };
      sites.push(site);

      sitePages.forEach((sp) => {
        pages.push({
          id: site.id + '_page_' + sp.name.toLowerCase().replace(/\s+/g, '-'),
          siteName,
          name: sp.name,
          category: sp.category,
          industry: content.id,
          themeName: theme.name,
          themeId: theme.id,
          factory: sp.factory,
        });
      });
    }
  }

  return { sites, pages };
}

// Preview helper: returns count
export function getTemplateStats() {
  const { sites, pages } = generateAllTemplates();
  return {
    totalSites: sites.length,
    totalPages: pages.length,
    themes: THEMES.length,
    industries: INDUSTRIES.length,
    blueprints: PAGE_BLUEPRINTS.length,
  };
}
