/**
 * convert_to_craft_format.js
 * Convertit les pages legacy (array de blocks) vers le format Craft.js JSON
 * (objet avec noeud ROOT) pour que le rendu public utilise CraftPageRenderer
 * (qui a tous les composants) au lieu de BuilderPageRenderer (limité à 6 types).
 *
 * Usage: node server/migrations/convert_to_craft_format.js
 */
const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Reproduit le TYPE_MAP de src/utils/legacyToCraft.ts
const TYPE_MAP = {
  'hero': 'HeroBlock',
  'hero-banner': 'HeroBannerBlock',
  'herobanner': 'HeroBannerBlock',
  'hero_banner': 'HeroBannerBlock',
  'audienceoffers': 'AudienceOffersBlock',
  'audience-offers': 'AudienceOffersBlock',
  'visionmission': 'VisionMissionBlock',
  'vision-mission': 'VisionMissionBlock',
  'landingstats': 'LandingStatsBlock',
  'landing-stats': 'LandingStatsBlock',
  'latestnews': 'LatestNewsBlock',
  'latest-news': 'LatestNewsBlock',
  'partnerlogos': 'PartnerLogosBlock',
  'partner-logos': 'PartnerLogosBlock',
  'stats': 'StatsBlock',
  'statsgrid': 'StatsBlock',
  'stats-grid': 'StatsBlock',
  'html': 'HtmlBlock',
  'text': 'TextBlock',
  'text-block': 'TextBlock',
  'textimage': 'ColumnsBlock',
  'text-image': 'ColumnsBlock',
  'columns': 'ColumnsBlock',
  'column': 'ColumnsBlock',
  'mediagallery': 'GalleryBlock',
  'media-gallery': 'GalleryBlock',
  'gallery': 'GalleryBlock',
  'faq': 'FAQBlock',
  'faqblock': 'FAQBlock',
  'featurecards': 'FeatureListBlock',
  'feature-cards': 'FeatureListBlock',
  'cta': 'CallToActionBlock',
  'calltoaction': 'CallToActionBlock',
  'call-to-action': 'CallToActionBlock',
  'container': 'ContainerBlock',
  'image': 'ImageBlock',
  'card': 'CardBlock',
  'cards': 'CardBlock',
  'counter': 'CounterBlock',
  'testimonials': 'TestimonialsBlock',
  'testimonials-list': 'TestimonialsBlock',
  'testimonials_list': 'TestimonialsBlock',
};

function mapTypeToResolvedName(type) {
  if (!type) return 'ContainerBlock';
  const key = type.toLowerCase();
  if (TYPE_MAP[key]) return TYPE_MAP[key];
  const pascal = type
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (m) => m.toUpperCase());
  return pascal + 'Block';
}

function generateId(counter) {
  return `node_${counter}_${Date.now().toString(36)}`;
}

function convertBlocksToCraftGraph(blocks, pageTitle = 'Page') {
  const result = {};
  const rootNodes = [];
  let counter = 0;

  function walk(block, parentId) {
    counter++;
    const id = block.id || generateId(counter);
    const resolvedName = mapTypeToResolvedName(block.type || 'container');

    const childIds = [];
    if (Array.isArray(block.children)) {
      for (const child of block.children) {
        const childId = walk(child, id);
        if (childId) childIds.push(childId);
      }
    }

    const props = block.props || block.content || {};
    const hasCanvas = childIds.length > 0;

    result[id] = {
      type: { resolvedName },
      nodes: childIds,
      props,
      custom: {},
      hidden: false,
      parent: parentId || 'ROOT',
      isCanvas: hasCanvas,
      displayName: resolvedName,
      linkedNodes: {},
    };

    return id;
  }

  for (const b of blocks) {
    counter++;
    const id = walk(b, null);
    if (id) rootNodes.push(id);
  }

  result['ROOT'] = {
    type: { resolvedName: 'ContainerBlock' },
    nodes: rootNodes,
    props: { padding: 0, maxWidth: '100%' },
    custom: {},
    hidden: false,
    isCanvas: true,
    displayName: `Page: ${pageTitle}`,
    linkedNodes: {},
  };

  return result;
}

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Conversion des pages legacy vers le format Craft.js JSON...\n');

    const res = await client.query(
      "SELECT id, slug, title, structure_json FROM public.pages WHERE jsonb_typeof(structure_json) = 'array'"
    );

    console.log(`📋 ${res.rows.length} pages au format array trouvées.\n`);

    let converted = 0;
    let errors = 0;
    let skipped = 0;

    for (const row of res.rows) {
      try {
        const blocks = typeof row.structure_json === 'string'
          ? JSON.parse(row.structure_json)
          : row.structure_json;

        if (!Array.isArray(blocks) || blocks.length === 0) {
          skipped++;
          continue;
        }

        const craftGraph = convertBlocksToCraftGraph(blocks, row.title || row.slug || 'Page');

        await client.query(
          'UPDATE public.pages SET structure_json = $1, updated_at = NOW() WHERE id = $2',
          [JSON.stringify(craftGraph), row.id]
        );

        converted++;
        console.log(`   ✅ "${row.slug}" (${row.title}) — ${blocks.length} blocs convertis`);
      } catch (err) {
        errors++;
        console.error(`   ❌ "${row.slug}": ${err.message}`);
      }
    }

    console.log(`\n📊 Résultat : ${converted} converties, ${skipped} ignorées (vides), ${errors} erreurs`);
    console.log('✅ Migration terminée !');

  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
