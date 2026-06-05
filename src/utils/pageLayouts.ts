/**
 * Layouts/Templates disponibles (comme WordPress theme templates)
 */

import { PageDesignOptions } from '@/types/PageSystem';

export type LayoutSection = {
  id: string;
  name: string;
  component: string;
  defaultConfig: Record<string, unknown>;
  editable: boolean;
};

export type LayoutTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  premium: boolean;
  tags: string[];
  defaultDesign: Partial<PageDesignOptions>;
  sections: LayoutSection[];
};

export const DEFAULT_DESIGN_OPTIONS: PageDesignOptions = {
  layout: 'default',
  hero_enabled: true,
  hero_height: 'medium',
  hero_overlay: 0.3,
  hero_gradient: 'bg-gradient-to-br from-emerald-500 via-cyan-500 to-slate-900',
  hero_alignment: 'center',
  content_width: 'default',
  sidebar_enabled: false,
  sidebar_position: 'right',
  header_style: 'standard',
  button_style: 'solid',
  section_spacing: 'normal',
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
    description: 'Layout classique revisité premium pour une présence professionnelle',
    category: 'Business',
    premium: true,
    tags: ['corporate', 'classic', 'presentation'],
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
    }]

  },

  landing: {
    id: 'landing',
    name: '🎯 Page Atterrissage',
    description: 'Landing page premium optimisée pour conversion et storytelling',
    category: 'Marketing',
    premium: true,
    tags: ['landing', 'conversion', 'hero'],
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
    }]

  },

  blog: {
    id: 'blog',
    name: '📝 Article Blog',
    description: 'Page article premium avec lecture confortable et navigation enrichie',
    category: 'Content',
    premium: true,
    tags: ['blog', 'article', 'editorial'],
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
    }]

  },

  gallery: {
    id: 'gallery',
    name: '🖼️ Galerie',
    description: 'Galerie premium avec mise en avant visuelle et navigation fluide',
    category: 'Portfolio',
    premium: true,
    tags: ['gallery', 'portfolio', 'media'],
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
    }]

  },

  contact: {
    id: 'contact',
    name: '📧 Formulaire Contact',
    description: 'Page contact premium avec formulaire moderne et informations claires',
    category: 'Support',
    premium: true,
    tags: ['contact', 'support', 'lead'],
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
    }]

  },

  pricing: {
    id: 'pricing',
    name: '💰 Tarification',
    description: 'Page tarification premium avec structure claire et conversion optimisée',
    category: 'Sales',
    premium: true,
    tags: ['pricing', 'plans', 'conversion'],
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
    }]

  },

  services: {
    id: 'services',
    name: '⚙️ Services',
    description: 'Page services premium pour présenter offres et avantages métier',
    category: 'Business',
    premium: true,
    tags: ['services', 'offers', 'solutions'],
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
    }]

  },

  testimonials: {
    id: 'testimonials',
    name: '⭐ Témoignages',
    description: 'Section témoignages premium pour renforcer la crédibilité client',
    category: 'Trust',
    premium: true,
    tags: ['testimonials', 'reviews', 'trust'],
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
    }]

  },

  team: {
    id: 'team',
    name: '👥 Équipe',
    description: 'Page équipe premium pour présenter collaborateurs et expertise',
    category: 'Corporate',
    premium: true,
    tags: ['team', 'about', 'company'],
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
    }]

  },

  portfolio: {
    id: 'portfolio',
    name: '🎨 Portfolio',
    description: 'Portfolio premium pour mettre en valeur projets et réalisations',
    category: 'Creative',
    premium: true,
    tags: ['portfolio', 'projects', 'gallery'],
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
    }]

  },

  saas: {
    id: 'saas',
    name: '🚀 SaaS Launch',
    description: 'Template premium pour startups SaaS avec conversion rapide',
    category: 'SaaS',
    premium: true,
    tags: ['saas', 'startup', 'conversion', 'hero'],
    defaultDesign: {
      layout: 'full-width',
      hero_enabled: true,
      hero_height: 'fullscreen',
      content_width: 'full',
      sidebar_enabled: false
    },
    sections: [
    {
      id: 'hero',
      name: 'Hero Launch',
      component: 'FullscreenHero',
      defaultConfig: { height: 'fullscreen', overlay: 0.25 },
      editable: true
    },
    {
      id: 'metrics',
      name: 'Chiffres Clés',
      component: 'StatsGrid',
      defaultConfig: { columns: 4 },
      editable: true
    },
    {
      id: 'features',
      name: 'Fonctionnalités',
      component: 'FeaturesSection',
      defaultConfig: { highlights: 4 },
      editable: true
    },
    {
      id: 'cta_final',
      name: 'CTA Premium',
      component: 'CTASection',
      defaultConfig: { style: 'premium' },
      editable: true
    }]

  },

  ecommerce: {
    id: 'ecommerce',
    name: '🛒 Boutique Premium',
    description: 'Template premium e-commerce avec vitrine de produits et promos',
    category: 'E-commerce',
    premium: true,
    tags: ['ecommerce', 'shop', 'store', 'products'],
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
      name: 'Vitrine Produit',
      component: 'ProductHero',
      defaultConfig: { highlight: true },
      editable: true
    },
    {
      id: 'catalog',
      name: 'Catalogue Produits',
      component: 'ProductGrid',
      defaultConfig: { columns: 4 },
      editable: true
    },
    {
      id: 'promo',
      name: 'Offres Spéciales',
      component: 'PromoSection',
      defaultConfig: { style: 'modern' },
      editable: true
    }]

  },

  academy: {
    id: 'academy',
    name: '🎓 Académie',
    description: 'Template premium pour formations, cours et programmes éducatifs',
    category: 'Éducation',
    premium: true,
    tags: ['education', 'academy', 'training', 'course'],
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
      name: 'Académie Hero',
      component: 'SimpleHeader',
      defaultConfig: { type: 'education' },
      editable: true
    },
    {
      id: 'courses',
      name: 'Programme',
      component: 'CourseGrid',
      defaultConfig: { columns: 3 },
      editable: true
    },
    {
      id: 'testimonial',
      name: 'Avis Étudiants',
      component: 'TestimonialsSection',
      defaultConfig: { count: 2 },
      editable: true
    }]

  },

  model: {
    id: 'model',
    name: '🧪 Page Modèle',
    description: 'Template modèle de test avec hero renforcé et de nombreux modules pour vérifier le builder',
    category: 'Test',
    premium: true,
    tags: ['model', 'test', 'hero', 'modules', 'demo'],
    defaultDesign: {
      layout: 'full-width',
      hero_enabled: true,
      hero_height: 'fullscreen',
      content_width: 'full',
      sidebar_enabled: false
    },
    sections: [
    {
      id: 'hero',
      name: 'Hero Principal',
      component: 'FullscreenHero',
      defaultConfig: { overlay: 0.4, ctaText: 'Tester Maintenant' },
      editable: true
    },
    {
      id: 'overview',
      name: 'Vue d’Ensemble',
      component: 'FeaturesSection',
      defaultConfig: { highlights: 5 },
      editable: true
    },
    {
      id: 'stats',
      name: 'Chiffres Clés',
      component: 'StatsGrid',
      defaultConfig: { columns: 4 },
      editable: true
    },
    {
      id: 'services',
      name: 'Services',
      component: 'ServicesGrid',
      defaultConfig: { columns: 3 },
      editable: true
    },
    {
      id: 'testimonials',
      name: 'Témoignages',
      component: 'TestimonialsCarousel',
      defaultConfig: { itemsPerPage: 3 },
      editable: true
    },
    {
      id: 'pricing',
      name: 'Tarification',
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
    },
    {
      id: 'cta_final',
      name: 'Call to Action',
      component: 'CTASection',
      defaultConfig: { style: 'prominent' },
      editable: true
    }]

  },

  event: {
    id: 'event',
    name: '🎟️ Événement Premium',
    description: 'Template premium pour conférences, salons et événements',
    category: 'Événement',
    premium: true,
    tags: ['event', 'conference', 'agenda', 'ticket'],
    defaultDesign: {
      layout: 'full-width',
      hero_enabled: true,
      hero_height: 'large',
      content_width: 'full',
      sidebar_enabled: false
    },
    sections: [
    {
      id: 'hero',
      name: 'Événement Hero',
      component: 'EventHero',
      defaultConfig: { overlay: 0.3 },
      editable: true
    },
    {
      id: 'schedule',
      name: 'Programme',
      component: 'ScheduleSection',
      defaultConfig: { days: 2 },
      editable: true
    },
    {
      id: 'speakers',
      name: 'Intervenants',
      component: 'SpeakersGrid',
      defaultConfig: { columns: 3 },
      editable: true
    }]

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
