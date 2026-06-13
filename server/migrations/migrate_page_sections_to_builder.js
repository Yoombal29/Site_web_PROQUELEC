/**
 * migrate_page_sections_to_builder.js
 * Plan de bascule : Convertit toutes les données page_sections
 * (stockées dans site_settings) en pages Builder complètes
 * dans la table public.pages.
 *
 * Chaque page_key du système sections devient une page avec
 * structure_json au format Builder (blocs Craft.js compatibles).
 *
 * Usage: node server/migrations/migrate_page_sections_to_builder.js
 */
const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Mapping des types de sections vers les types de blocs Builder
const SECTION_TO_BLOCK_TYPE = {
  hero: 'HeroBanner',
  'text-image': 'TextImage',
  'features-list': 'FeatureCards',
  stats: 'StatsGrid',
  testimonials: 'Testimonials',
  gallery: 'MediaGallery',
  faq: 'FaqBlock',
  'custom-html': 'HtmlBlock',
  custom: 'CustomBlock',
};

const FALLBACK_SLUG_MAP = {
  home_page: 'home',
  public_utility: 'utilite-publique',
  formation_certification: 'formation-certification',
  normes_ressources: 'normes-ressources',
  projets_realisations: 'projets-realisations',
  actualites_evenements: 'actualites-evenements',
  contact_premium: 'contact-premium',
  espace_partenaires: 'espace-partenaires',
  avis_clients: 'avis-clients',
  expert_lab: 'expert-lab',
  outils: 'outils',
  showroom: 'showroom',
  documents: 'documents',
  events: 'events',
  labels: 'labels',
  trainings: 'formations',
  certifications: 'certifications',
  about: 'about',
  partenaire_institutionnel: 'partenaires-institutionnels',
  partenaires: 'partenaires',
  presse: 'presse',
  social: 'social',
  legal: 'legal',
  contact: 'contact',
  advantages: 'avantages',
  activities: 'activites',
  menages: 'espace-menages',
  professionnels: 'espace-professionnels',
  autorites: 'espace-autorites',
};

function inferBlockType(section, contentType) {
  if (contentType && SECTION_TO_BLOCK_TYPE[contentType]) {
    return SECTION_TO_BLOCK_TYPE[contentType];
  }
  if (section.type && SECTION_TO_BLOCK_TYPE[section.type]) {
    return SECTION_TO_BLOCK_TYPE[section.type];
  }
  if (section.id === 'hero') return 'HeroBanner';
  if (section.id === 'stats') return 'StatsGrid';
  return 'FeatureCards';
}

function toKebabCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'section';
}

function convertFeatures(features) {
  if (!Array.isArray(features)) return [];
  return features.map((f, i) => {
    if (typeof f === 'string') {
      const parts = f.split('|').map(s => s.trim()).filter(Boolean);
      if (parts.length >= 3) {
        return { title: parts[0], icon: parts[1], description: parts.slice(2).join(' | ') };
      }
      if (parts.length === 2) {
        return { title: parts[0], description: parts[1] };
      }
      return { title: parts[0], description: '' };
    }
    if (typeof f === 'object' && f !== null) {
      return {
        title: f.title || f.label || '',
        description: f.description || f.content || '',
        icon: f.icon || 'CheckCircle2',
      };
    }
    return { title: String(f), description: '' };
  });
}

function convertSectionToBlock(section, content, index) {
  const blockType = inferBlockType(section, content?.type);
  const blockId = `${toKebabCase(section.id || section.label || `section-${index}`)}-${Date.now()}-${index}`;
  const features = convertFeatures(content?.features || section?.features);
  const stats = content?.stats || section?.stats;

  const commonProps = {
    title: content?.title || section?.label || '',
    subtitle: content?.subtitle || '',
    description: content?.description || '',
    badge: content?.badge || section?.badge || '',
  };

  if (content?.image) {
    commonProps.image = content.image;
  }
  if (content?.media?.url) {
    commonProps.image = content.media.url;
  }

  const block = {
    id: blockId,
    type: blockType,
    version: 1,
    enabled: true,
    props: { ...commonProps },
    metadata: {
      label: section?.label || content?.title || `Section ${index + 1}`,
      description: content?.subtitle || '',
    },
  };

  // Add type-specific props
  if (blockType === 'FeatureCards' || blockType === 'HeroBanner') {
    block.props.features = features;
    block.props.layout = content?.layout || (blockType === 'HeroBanner' ? 'centered' : 'grid-3');
  }

  if (blockType === 'StatsGrid') {
    block.props.stats = stats || features.map(f => ({
      value: f.title || '',
      label: f.description || f.subtitle || '',
      description: '',
    }));
  }

  if (blockType === 'TextImage') {
    block.props.layout = content?.layout || (index % 2 === 1 ? 'right-left' : 'left-right');
    block.props.features = features;
  }

  if (blockType === 'Testimonials') {
    block.props.testimonials = features.map(f => ({
      name: f.title || '',
      role: f.subtitle || '',
      company: f.description || '',
      content: f.content || '',
      avatar: f.image || '',
      rating: f.rating || 5,
    }));
  }

  if (blockType === 'MediaGallery') {
    const urls = content?.media?.urls || (content?.image ? [content.image] : []);
    block.props.images = urls.map(url => ({ url, caption: '', alt: '' }));
    block.props.layout = content?.layout || 'grid-3';
  }

  if (blockType === 'FaqBlock') {
    block.props.items = features.map(f => ({
      question: f.title || '',
      answer: f.description || '',
    }));
  }

  if (blockType === 'HtmlBlock') {
    block.props.html = content?.html || content?.customHTML || '';
  }

  // Include styles if present
  if (content?.styles && Object.keys(content.styles).length > 0) {
    block.props.styles = { ...content.styles };
  }

  return block;
}

function convertPageData(pageKey, pageData) {
  const slug = FALLBACK_SLUG_MAP[pageKey] || pageKey.replace(/_/g, '-');
  const blocks = [];
  const sections = pageData.sections || [];
  const content = pageData.content || {};

  // Create blocks from sections
  sections.forEach((section, index) => {
    const sectionContent = content[section.id] || {};
    const block = convertSectionToBlock(section, sectionContent, index);
    blocks.push(block);
  });

  // If no sections defined but content exists, create blocks from content keys
  if (sections.length === 0 && Object.keys(content).length > 0) {
    Object.entries(content).forEach(([key, sectionContent]) => {
      const block = convertSectionToBlock(
        { id: key, label: sectionContent.title || key, icon: sectionContent.icon },
        sectionContent,
        Object.keys(content).indexOf(key),
      );
      blocks.push(block);
    });
  }

  const title = pageData.hero_title?.replace(/\|/g, ' - ') || pageData.label || pageKey;
  const subtitle = pageData.hero_subtitle || '';
  const badge = pageData.badge || '';

  // If customHTML mode, add a single HTML block
  if (pageData.renderMode === 'html' && pageData.customHTML) {
    blocks.unshift({
      id: `custom-html-${pageKey}`,
      type: 'HtmlBlock',
      version: 1,
      enabled: true,
      props: { html: pageData.customHTML },
      metadata: { label: 'Contenu HTML personnalisé', description: '' },
    });
  }

  // Add hero banner if not already present
  const hasHero = blocks.some(b => b.type === 'HeroBanner');
  if (!hasHero && title) {
    blocks.unshift({
      id: `hero-${pageKey}`,
      type: 'HeroBanner',
      version: 1,
      enabled: true,
      props: {
        title,
        subtitle,
        badge,
      },
      metadata: { label: 'Bannière principale', description: subtitle },
    });
  }

  return {
    title,
    slug,
    structureJson: JSON.stringify(blocks),
    is_published: true,
    status: 'published',
    meta_description: subtitle,
  };
}

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🚀 Début de la migration page_sections → Builder pages...');
    console.log('');

    // 1. Lire les page_sections depuis site_settings
    const settingsResult = await client.query(
      'SELECT page_sections FROM public.site_settings WHERE id = 1',
    );

    if (!settingsResult.rows[0]?.page_sections) {
      console.log('⚠️  Aucune page_sections trouvée dans site_settings.');
      console.log('   Vérifiez que la colonne page_sections existe et contient des données.');
      return;
    }

    const pageSections = settingsResult.rows[0].page_sections;
    const pageKeys = Object.keys(pageSections);
    console.log(`📋 ${pageKeys.length} pages à migrer trouvées dans page_sections.\n`);

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const pageKey of pageKeys) {
      try {
        const pageData = pageSections[pageKey];
        if (!pageData || typeof pageData !== 'object') {
          console.log(`   ⏭️  Page "${pageKey}" ignorée (pas de données)`);
          continue;
        }

        const converted = convertPageData(pageKey, pageData);

        // Vérifier si une page existe déjà avec ce slug
        const existing = await client.query(
          'SELECT id, title, structure_json FROM public.pages WHERE slug = $1',
          [converted.slug],
        );

        if (existing.rows.length > 0) {
          // Mettre à jour la page existante
          await client.query(
            `UPDATE public.pages
             SET title = $1,
                 structure_json = $2,
                 is_published = $3,
                 status = $4,
                 meta_description = $5,
                 updated_at = NOW()
             WHERE slug = $6`,
            [
              converted.title,
              converted.structureJson,
              converted.is_published,
              converted.status,
              converted.meta_description,
              converted.slug,
            ],
          );
          updated++;
          console.log(`   ✅ Page "${pageKey}" (/${converted.slug}) mise à jour`);
        } else {
          // Créer une nouvelle page
          await client.query(
            `INSERT INTO public.pages (title, slug, structure_json, is_published, status, meta_description, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
            [
              converted.title,
              converted.slug,
              converted.structureJson,
              converted.is_published,
              converted.status,
              converted.meta_description,
            ],
          );
          created++;
          console.log(`   ✅ Page "${pageKey}" (/${converted.slug}) créée`);
        }
      } catch (err) {
        errors++;
        console.error(`   ❌ Erreur pour "${pageKey}": ${err.message}`);
      }
    }

    console.log('');
    console.log('══════════════════════════════════════════════');
    console.log('📊 RÉSULTAT DE LA MIGRATION');
    console.log('══════════════════════════════════════════════');
    console.log(`   Pages créées : ${created}`);
    console.log(`   Pages mises à jour : ${updated}`);
    console.log(`   Erreurs : ${errors}`);
    console.log(`   Total : ${pageKeys.length}`);
    console.log('');
    console.log('✅ Migration terminée avec succès !');
    console.log('');
    console.log('📝 Prochaines étapes :');
    console.log('   1. Vérifiez les pages migrées dans /admin/builder');
    console.log('   2. Mettez à jour DynamicPage.tsx pour charger depuis la table pages');
    console.log('   3. Supprimez les composants sections obsolètes');
    console.log('   4. Supprimez la colonne page_sections de site_settings');

  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
