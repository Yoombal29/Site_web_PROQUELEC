/**
 * Normalize public menu pages.
 *
 * Active navigation links should render either a functional page or a section-driven
 * page, never the legacy "Modifiez cette page..." migration placeholder.
 */
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const hero = (title, subtitle, badge) => ({ title, subtitle, badge });

const feature = (title, description, icon = 'CheckCircle2') => ({ title, description, icon });

const simplePage = ({ badge, heroTitle, heroSubtitle, label, featuresTitle, featuresSubtitle, features }) => ({
  badge,
  hero_title: heroTitle,
  hero_subtitle: heroSubtitle,
  label,
  renderMode: 'sections',
  sections: [
    { id: 'hero', label: 'Bannière', icon: 'Zap', type: 'hero' },
    { id: 'overview', label: 'Présentation', icon: 'LayoutGrid', type: 'features-list' },
    { id: 'cta', label: 'Orientation', icon: 'Mail', type: 'text-image' },
  ],
  content: {
    hero: hero(label, heroSubtitle, badge),
    overview: {
      title: featuresTitle,
      subtitle: featuresSubtitle,
      layout: 'grid-3',
      features,
    },
    cta: {
      title: 'Besoin d’accompagnement ?',
      subtitle: 'Contactez PROQUELEC pour qualifier votre besoin et identifier le bon service.',
      features: ['Orientation du dossier', 'Ressources adaptées', 'Réponse structurée'],
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    },
  },
});

const pageSections = {
  public_utility: simplePage({
    badge: 'UTILITÉ PUBLIQUE',
    heroTitle: 'Utilité|Publique',
    heroSubtitle: 'Services, ressources et accompagnement pour les institutions et collectivités.',
    label: 'Utilité Publique',
    featuresTitle: 'Services publics',
    featuresSubtitle: 'Des actions orientées sécurité, contrôle et conformité.',
    features: [
      feature('Autorités', 'Appui réglementaire, reporting et contrôle public.', 'Landmark'),
      feature('Collectivités', 'Programmes locaux de sécurité électrique.', 'Building2'),
      feature('Marchés publics', 'Méthodes de sécurisation et réception.', 'ShieldCheck'),
    ],
  }),
  formation_certification: simplePage({
    badge: 'FORMATION',
    heroTitle: 'Formation &|Certification',
    heroSubtitle: 'Parcours, sessions et certifications pour les professionnels de l’électricité.',
    label: 'Formation & Certification',
    featuresTitle: 'Parcours disponibles',
    featuresSubtitle: 'Des modules adaptés aux métiers, niveaux et exigences terrain.',
    features: [
      feature('Formations techniques', 'Sécurité, conformité et bonnes pratiques.', 'GraduationCap'),
      feature('Certifications', 'Reconnaissance des compétences et parcours QUALI-ELEC.', 'Award'),
      feature('Ressources pédagogiques', 'Supports, guides et exercices pratiques.', 'BookOpen'),
    ],
  }),
  normes_ressources: simplePage({
    badge: 'NORMES',
    heroTitle: 'Normes &|Ressources',
    heroSubtitle: 'Référentiels, guides pratiques et corpus documentaire PROQUELEC.',
    label: 'Normes & Ressources',
    featuresTitle: 'Bibliothèque technique',
    featuresSubtitle: 'Les ressources nécessaires pour préparer, contrôler et documenter.',
    features: [
      feature('Normes électriques', 'Repères normatifs et corpus de référence.', 'FileText'),
      feature('Guides pratiques', 'Mémentos et fiches opérationnelles.', 'BookOpen'),
      feature('Publications', 'Notes, rapports et ressources publiques.', 'Newspaper'),
    ],
  }),
  projets_realisations: {
    badge: 'RÉALISATIONS',
    hero_title: 'Projets &|Réalisations',
    hero_subtitle: 'Interventions, partenariats et actions terrain menés par PROQUELEC.',
    label: 'Projets & Réalisations',
    renderMode: 'sections',
    sections: [
      { id: 'hero', label: 'Bannière', icon: 'Briefcase', type: 'hero' },
      { id: 'gallery', label: 'Réalisations', icon: 'Images', type: 'gallery' },
      { id: 'stats', label: 'Indicateurs', icon: 'BarChart', type: 'stats' },
    ],
    content: {
      hero: hero('Projets & Réalisations', 'Une vision concrète des actions et chantiers accompagnés.', 'TERRAIN'),
      gallery: {
        title: 'Réalisations PROQUELEC',
        subtitle: 'Aperçu des contrôles, actions et projets de sécurisation.',
        layout: 'masonry',
        media: {
          type: 'gallery',
          urls: [
            'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80',
            'https://images.unsplash.com/photo-1581094288338-2314dddb7903?w=800&q=80',
            'https://images.unsplash.com/photo-1504307651254-35680f3366d4?w=800&q=80',
          ],
        },
      },
      stats: {
        stats: [
          { value: '14', label: 'Régions ciblées' },
          { value: '500', suffix: '+', label: 'Actions annuelles' },
          { value: '24', suffix: 'h', label: 'Orientation' },
          { value: '100', suffix: '%', label: 'Traçabilité' },
        ],
      },
    },
  },
  actualites_evenements: simplePage({
    badge: 'ACTUALITÉS',
    heroTitle: 'Actualités &|Événements',
    heroSubtitle: 'Publications, événements, ateliers et communiqués PROQUELEC.',
    label: 'Actualités & Événements',
    featuresTitle: 'Restez informé',
    featuresSubtitle: 'Les informations utiles pour suivre les actions PROQUELEC.',
    features: [
      feature('Actualités', 'Informations institutionnelles et techniques.', 'Newspaper'),
      feature('Événements', 'Ateliers, séminaires et conférences.', 'Calendar'),
      feature('Presse', 'Communiqués, dossiers médias et revues.', 'Mic2'),
    ],
  }),
  activities: simplePage({
    badge: 'ACTIONS',
    heroTitle: 'Nos|Actions',
    heroSubtitle: 'Les domaines d’intervention de PROQUELEC au service de la sécurité électrique.',
    label: 'Nos Actions',
    featuresTitle: 'Domaines d’action',
    featuresSubtitle: 'Des actions structurées pour chaque public et chaque contexte.',
    features: [
      feature('Sensibilisation', 'Prévention et pédagogie auprès des publics.', 'Megaphone'),
      feature('Diagnostics', 'Contrôles, constats et orientation technique.', 'Search'),
      feature('Mise en conformité', 'Suivi des réserves et amélioration des installations.', 'ClipboardCheck'),
    ],
  }),
  social: simplePage({
    badge: 'RÉSEAUX',
    heroTitle: 'Réseaux &|Social',
    heroSubtitle: 'Campagnes, communautés et canaux sociaux de PROQUELEC.',
    label: 'Réseaux & Social',
    featuresTitle: 'Communication publique',
    featuresSubtitle: 'Des canaux pour informer, sensibiliser et mobiliser.',
    features: [
      feature('Réseaux sociaux', 'Actualités et campagnes en ligne.', 'Share2'),
      feature('Communauté', 'Échanges avec les professionnels et usagers.', 'Users2'),
      feature('Campagnes', 'Prévention et sensibilisation sécurité.', 'Mic2'),
    ],
  }),
  expert_lab: simplePage({
    badge: 'EXPERT LAB',
    heroTitle: 'Expert Lab|PROQUELEC',
    heroSubtitle: 'Laboratoire d’innovation, d’analyse et d’expertise technique.',
    label: 'Expert Lab',
    featuresTitle: 'Capacités Expert Lab',
    featuresSubtitle: 'Outils avancés pour diagnostics, schémas et analyse normative.',
    features: [
      feature('Analyse technique', 'Lecture, interprétation et contrôle de conformité.', 'Microscope'),
      feature('Schémas', 'Production et revue de schémas électriques.', 'Workflow'),
      feature('Assistants IA', 'Aide documentaire et expertise augmentée.', 'Bot'),
    ],
  }),
  blog: simplePage({
    badge: 'BLOG',
    heroTitle: 'Blog|PROQUELEC',
    heroSubtitle: 'Articles, conseils, retours d’expérience et informations techniques.',
    label: 'Blog',
    featuresTitle: 'Rubriques éditoriales',
    featuresSubtitle: 'Des contenus pour comprendre, anticiper et agir.',
    features: [
      feature('Conseils', 'Bonnes pratiques et repères de sécurité.', 'BookOpen'),
      feature('Actualités', 'Nouveautés et informations institutionnelles.', 'Newspaper'),
      feature('Événements', 'Séminaires, ateliers et conférences.', 'Calendar'),
    ],
  }),
  avis_clients: {
    badge: 'CONFIANCE',
    hero_title: 'Témoignages|PROQUELEC',
    hero_subtitle: 'Retours d’expérience et preuves de confiance.',
    label: 'Témoignages',
    renderMode: 'sections',
    sections: [
      { id: 'hero', label: 'Bannière', icon: 'Star', type: 'hero' },
      { id: 'testimonials', label: 'Témoignages', icon: 'Users2', type: 'testimonials' },
      { id: 'faq', label: 'Questions', icon: 'HelpCircle', type: 'faq' },
    ],
    content: {
      hero: hero('Témoignages PROQUELEC', 'La voix des partenaires, professionnels et bénéficiaires.', 'CONFIANCE'),
      testimonials: {
        title: 'Ils nous font confiance',
        subtitle: 'Retours vérifiés de notre communauté.',
        testimonials: [
          { name: 'Client professionnel', role: 'Entreprise', content: 'PROQUELEC structure nos démarches de conformité.', rating: 5 },
          { name: 'Partenaire institutionnel', role: 'Institution', content: 'Un appui utile pour la sécurité électrique.', rating: 5 },
        ],
      },
      faq: {
        title: 'Questions fréquentes',
        subtitle: 'Les réponses aux demandes les plus courantes.',
        faq: [
          { question: 'Comment contacter PROQUELEC ?', answer: 'Utilisez le formulaire de contact pour qualifier votre demande.' },
          { question: 'Les ressources sont-elles publiques ?', answer: 'Certaines ressources sont publiques, d’autres réservées aux espaces métiers.' },
        ],
      },
    },
  },
};

const pageBindings = [
  { slug: 'utilite-publique', settingsKey: 'public_utility', title: 'Utilité Publique' },
  { slug: 'nos-actions', settingsKey: 'activities', title: 'Nos Actions' },
  { slug: 'activities', settingsKey: 'activities', title: 'Nos Activités' },
  { slug: 'formation-certification', settingsKey: 'formation_certification', title: 'Formation & Certification' },
  { slug: 'normes-ressources', settingsKey: 'normes_ressources', title: 'Normes & Ressources' },
  { slug: 'normative-corpus', settingsKey: 'normes_ressources', title: 'Normes électriques' },
  { slug: 'publications', settingsKey: 'normes_ressources', title: 'Publications' },
  { slug: 'projets-realisations', settingsKey: 'projets_realisations', title: 'Projets & Réalisations' },
  { slug: 'projets', settingsKey: 'projets_realisations', title: 'Projets' },
  { slug: 'galerie', settingsKey: 'projets_realisations', title: 'Galerie' },
  { slug: 'actualites-evenements', settingsKey: 'actualites_evenements', title: 'Actualités & Événements' },
  { slug: 'blog', settingsKey: 'blog', title: 'Blog' },
  { slug: 'social', settingsKey: 'social', title: 'Réseaux & Social' },
  { slug: 'expert-lab', settingsKey: 'expert_lab', title: 'Expert Lab' },
  { slug: 'collectivites', settingsKey: 'public_utility', title: 'Collectivités locales' },
  { slug: 'conseils-menages', settingsKey: 'menages', title: 'Conseils ménages' },
  { slug: 'ressources-pedagogiques', settingsKey: 'trainings', title: 'Ressources pédagogiques' },
  { slug: 'partenaires-liste', settingsKey: 'partenaires', title: 'Partenaires' },
  { slug: 'partenariat-senelec', settingsKey: 'partenaires', title: 'Partenariat SENELEC' },
  { slug: 'temoignages', settingsKey: 'avis_clients', title: 'Témoignages' },
  { slug: 'actions/diagnostics', settingsKey: 'activities', title: 'Diagnostics électriques' },
  { slug: 'actions/collectivites', settingsKey: 'public_utility', title: 'Collectivités locales' },
  { slug: 'evenements/anniversaire', settingsKey: 'actualites_evenements', title: 'Anniversaire PROQUELEC' },
  { slug: 'evenements/seminaires', settingsKey: 'actualites_evenements', title: 'Séminaires' },
];

const SECTION_TYPE_BY_ID = {
  hero: 'hero',
  stats: 'stats',
};

const inferSectionType = (section, content) => {
  if (section?.type) return section.type;
  if (SECTION_TYPE_BY_ID[section?.id]) return SECTION_TYPE_BY_ID[section.id];
  if (content?.stats) return 'stats';
  if (content?.testimonials) return 'testimonials';
  if (content?.faq) return 'faq';
  if (content?.media?.type === 'gallery') return 'gallery';
  if (content?.image || content?.media) return 'text-image';
  return 'features-list';
};

const mergeSectionConfig = (existing, fallback) => {
  if (!existing || typeof existing !== 'object') return fallback;

  const existingSections = Array.isArray(existing.sections) ? existing.sections : [];
  const fallbackSections = Array.isArray(fallback.sections) ? fallback.sections : [];
  const fallbackHero = fallbackSections.find((section) => section.id === 'hero');
  const hasHero = existingSections.some((section) => section?.id === 'hero' || section?.type === 'hero');
  const content = { ...(fallback.content || {}), ...(existing.content || {}) };
  const sections = existingSections.length ? existingSections : fallbackSections;
  const sectionsWithHero = hasHero || !fallbackHero ? sections : [fallbackHero, ...sections];

  return {
    ...fallback,
    ...existing,
    badge: existing.badge || fallback.badge,
    hero_title: existing.hero_title || fallback.hero_title,
    hero_subtitle: existing.hero_subtitle || fallback.hero_subtitle,
    label: existing.label || fallback.label,
    renderMode: existing.renderMode || fallback.renderMode || 'sections',
    content,
    sections: sectionsWithHero.map((section) => ({
      ...section,
      type: inferSectionType(section, content[section.id]),
    })),
  };
};

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query('SELECT page_sections FROM public.site_settings WHERE id = 1');
    const existingSections = rows[0]?.page_sections || {};
    const mergedSections = { ...existingSections };
    const added = [];

    Object.entries(pageSections).forEach(([key, value]) => {
      if (!mergedSections[key]) {
        mergedSections[key] = value;
        added.push(key);
      } else {
        mergedSections[key] = mergeSectionConfig(mergedSections[key], value);
      }
    });

    await client.query(
      `UPDATE public.site_settings
       SET page_sections = $1::jsonb, updated_at = NOW()
       WHERE id = 1`,
      [JSON.stringify(mergedSections)],
    );

    for (const binding of pageBindings) {
      const sectionData = mergedSections[binding.settingsKey] || pageSections[binding.settingsKey];
      await client.query(
        `INSERT INTO public.pages (
            slug, title, status, workflow_status, is_published,
            content_type, editor_engine, render_engine,
            design_options, meta_description, created_at, updated_at
         )
         VALUES (
            $1, $2, 'published', 'published', true,
            'html', 'sections', 'sections',
            jsonb_build_object(
              'page_type', 'section_driven',
              'section_driven', true,
              'settings_key', $3::text,
              'render_source', 'site_settings.page_sections'
            ),
            $4, NOW(), NOW()
         )
         ON CONFLICT (slug) DO UPDATE
         SET title = EXCLUDED.title,
             status = 'published',
             workflow_status = 'published',
             is_published = true,
             design_options = COALESCE(public.pages.design_options, '{}'::jsonb)
               || jsonb_build_object(
                    'page_type', 'section_driven',
                    'section_driven', true,
                    'settings_key', $3::text,
                    'render_source', 'site_settings.page_sections'
                  ),
             meta_description = COALESCE(NULLIF(public.pages.meta_description, ''), EXCLUDED.meta_description),
             updated_at = NOW()`,
        [
          binding.slug,
          binding.title,
          binding.settingsKey,
          sectionData?.hero_subtitle || `Page dynamique ${binding.title}`,
        ],
      );
    }

    await client.query('COMMIT');
    console.log(`[menu-section-pages] Seed complete. Added keys: ${added.length ? added.join(', ') : 'none'}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

main()
  .catch((error) => {
    console.error('[menu-section-pages] Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
