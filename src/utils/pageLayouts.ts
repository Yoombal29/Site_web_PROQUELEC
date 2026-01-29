/**
 * Layouts/Templates disponibles (comme WordPress theme templates)
 */

import type { LayoutTemplate, PageDesignOptions } from '@/types/PageSystem';

export const DEFAULT_DESIGN_OPTIONS: PageDesignOptions = {
  layout: 'default',
  hero_enabled: true,
  hero_height: 'medium',
  hero_overlay: 0.3,
  hero_alignment: 'center',
  content_width: 'default',
  sidebar_enabled: false,
  sidebar_position: 'right',
  footer_cta_enabled: true,
  background_color: '#ffffff',
  accent_color: '#0066cc',
  text_color: '#333333',
  heading_font: 'system-ui, -apple-system, sans-serif',
  body_font: 'system-ui, -apple-system, sans-serif',
  custom_css: '',
  custom_sections: []
};

export const LAYOUT_TEMPLATES: Record<string, LayoutTemplate> = {
  standard: {
    id: 'standard',
    name: '📄 Page Standard',
    description: 'Layout classique avec hero optionnel et contenu centré',
    defaultDesign: {
      layout: 'boxed',
      content_width: 'default',
      hero_enabled: true,
      hero_height: 'medium',
      sidebar_enabled: false
    },
    sections: [
      {
        id: 'hero',
        name: 'Hero Section',
        component: 'HeroSection',
        defaultConfig: { height: 'medium', overlay: 0.3 },
        editable: true
      },
      {
        id: 'content',
        name: 'Contenu Principal',
        component: 'ContentSection',
        defaultConfig: { width: 'default' },
        editable: true
      },
      {
        id: 'cta',
        name: 'Call-to-Action',
        component: 'CTASection',
        defaultConfig: { enabled: true },
        editable: true
      }
    ]
  },

  landing: {
    id: 'landing',
    name: '🎯 Page Atterrissage',
    description: 'Layout pour landing pages avec sections multiples',
    defaultDesign: {
      layout: 'full-width',
      hero_enabled: true,
      hero_height: 'fullscreen',
      hero_alignment: 'center',
      content_width: 'full',
      sidebar_enabled: false
    },
    sections: [
      {
        id: 'hero',
        name: 'Hero Grand Format',
        component: 'FullscreenHero',
        defaultConfig: { height: 'fullscreen' },
        editable: true
      },
      {
        id: 'benefits',
        name: 'Avantages',
        component: 'BenefitsSection',
        defaultConfig: { columns: 3 },
        editable: true
      },
      {
        id: 'testimonials',
        name: 'Témoignages',
        component: 'TestimonialsSection',
        defaultConfig: { count: 3 },
        editable: true
      },
      {
        id: 'cta_final',
        name: 'CTA Final',
        component: 'CTASection',
        defaultConfig: { style: 'prominent' },
        editable: true
      }
    ]
  },

  blog: {
    id: 'blog',
    name: '📝 Article Blog',
    description: 'Layout pour articles avec sidebar optionnelle',
    defaultDesign: {
      layout: 'boxed',
      content_width: 'default',
      hero_enabled: true,
      hero_height: 'small',
      sidebar_enabled: true,
      sidebar_position: 'right'
    },
    sections: [
      {
        id: 'hero',
        name: 'En-tête Article',
        component: 'ArticleHeader',
        defaultConfig: { showMeta: true },
        editable: true
      },
      {
        id: 'toc',
        name: 'Table des Matières',
        component: 'TableOfContents',
        defaultConfig: { enabled: true },
        editable: true
      },
      {
        id: 'content',
        name: 'Contenu Article',
        component: 'ArticleContent',
        defaultConfig: { width: 'default' },
        editable: true
      },
      {
        id: 'sidebar',
        name: 'Sidebar',
        component: 'Sidebar',
        defaultConfig: { width: 'sidebar' },
        editable: false
      }
    ]
  },

  gallery: {
    id: 'gallery',
    name: '🖼️ Galerie',
    description: 'Layout pour galeries d\'images',
    defaultDesign: {
      layout: 'full-width',
      hero_enabled: true,
      hero_height: 'small',
      content_width: 'full',
      sidebar_enabled: false
    },
    sections: [
      {
        id: 'hero',
        name: 'En-tête',
        component: 'SimpleHeader',
        defaultConfig: {},
        editable: true
      },
      {
        id: 'gallery',
        name: 'Galerie d\'Images',
        component: 'ImageGallery',
        defaultConfig: { columns: 3, style: 'grid' },
        editable: true
      }
    ]
  },

  contact: {
    id: 'contact',
    name: '📧 Formulaire Contact',
    description: 'Layout pour page de contact',
    defaultDesign: {
      layout: 'boxed',
      content_width: 'narrow',
      hero_enabled: true,
      hero_height: 'small',
      sidebar_enabled: false
    },
    sections: [
      {
        id: 'hero',
        name: 'En-tête',
        component: 'SimpleHeader',
        defaultConfig: {},
        editable: true
      },
      {
        id: 'info_contact',
        name: 'Informations Contact',
        component: 'ContactInfo',
        defaultConfig: { columns: 3 },
        editable: true
      },
      {
        id: 'form',
        name: 'Formulaire Contact',
        component: 'ContactForm',
        defaultConfig: { fields: ['name', 'email', 'message'] },
        editable: true
      }
    ]
  },

  pricing: {
    id: 'pricing',
    name: '💰 Tarification',
    description: 'Layout pour page de tarification',
    defaultDesign: {
      layout: 'full-width',
      hero_enabled: true,
      hero_height: 'medium',
      content_width: 'full',
      sidebar_enabled: false
    },
    sections: [
      {
        id: 'hero',
        name: 'En-tête',
        component: 'SimpleHeader',
        defaultConfig: {},
        editable: true
      },
      {
        id: 'pricing_cards',
        name: 'Cartes Tarifaires',
        component: 'PricingCards',
        defaultConfig: { columns: 3 },
        editable: true
      },
      {
        id: 'faq',
        name: 'FAQ',
        component: 'FAQSection',
        defaultConfig: {},
        editable: true
      }
    ]
  },

  services: {
    id: 'services',
    name: '⚙️ Services',
    description: 'Layout pour page de services',
    defaultDesign: {
      layout: 'boxed',
      hero_enabled: true,
      hero_height: 'medium',
      content_width: 'default',
      sidebar_enabled: false
    },
    sections: [
      {
        id: 'hero',
        name: 'En-tête',
        component: 'SimpleHeader',
        defaultConfig: {},
        editable: true
      },
      {
        id: 'services_grid',
        name: 'Grille de Services',
        component: 'ServicesGrid',
        defaultConfig: { columns: 3 },
        editable: true
      },
      {
        id: 'features',
        name: 'Caractéristiques',
        component: 'FeaturesSection',
        defaultConfig: {},
        editable: true
      }
    ]
  },

  testimonials: {
    id: 'testimonials',
    name: '⭐ Témoignages',
    description: 'Layout pour page de témoignages',
    defaultDesign: {
      layout: 'boxed',
      hero_enabled: true,
      hero_height: 'small',
      content_width: 'default',
      sidebar_enabled: false
    },
    sections: [
      {
        id: 'hero',
        name: 'En-tête',
        component: 'SimpleHeader',
        defaultConfig: {},
        editable: true
      },
      {
        id: 'testimonials_carousel',
        name: 'Carrousel Témoignages',
        component: 'TestimonialsCarousel',
        defaultConfig: { itemsPerPage: 3 },
        editable: true
      }
    ]
  },

  team: {
    id: 'team',
    name: '👥 Équipe',
    description: 'Layout pour page d\'équipe',
    defaultDesign: {
      layout: 'boxed',
      hero_enabled: true,
      hero_height: 'small',
      content_width: 'default',
      sidebar_enabled: false
    },
    sections: [
      {
        id: 'hero',
        name: 'En-tête',
        component: 'SimpleHeader',
        defaultConfig: {},
        editable: true
      },
      {
        id: 'team_members',
        name: 'Membres de l\'Équipe',
        component: 'TeamGrid',
        defaultConfig: { columns: 3 },
        editable: true
      }
    ]
  },

  portfolio: {
    id: 'portfolio',
    name: '🎨 Portfolio',
    description: 'Layout pour portfolio/projets',
    defaultDesign: {
      layout: 'full-width',
      hero_enabled: true,
      hero_height: 'medium',
      content_width: 'full',
      sidebar_enabled: false
    },
    sections: [
      {
        id: 'hero',
        name: 'En-tête',
        component: 'SimpleHeader',
        defaultConfig: {},
        editable: true
      },
      {
        id: 'portfolio_grid',
        name: 'Grille de Projets',
        component: 'PortfolioGrid',
        defaultConfig: { columns: 3, filter: true },
        editable: true
      }
    ]
  }
};

// Helper pour obtenir un layout
export const getLayoutTemplate = (layoutType: string): LayoutTemplate => {
  return LAYOUT_TEMPLATES[layoutType] || LAYOUT_TEMPLATES.standard;
};

// Helper pour obtenir les options par défaut d'un layout
export const getDefaultDesignForLayout = (layoutType: string): PageDesignOptions => {
  const template = getLayoutTemplate(layoutType);
  return {
    ...DEFAULT_DESIGN_OPTIONS,
    ...template.defaultDesign
  };
};
