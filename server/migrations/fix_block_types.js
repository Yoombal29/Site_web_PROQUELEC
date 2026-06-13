/**
 * fix_block_types.js
 * Corrige les types de blocs legacy dans les pages enrichies pour qu'ils
 * correspondent au TYPE_MAP de legacyToCraft.ts et au CRAFT_RESOLVER.
 *
 * Problème : les blocs stockés ont type='FeatureCards' mais le convertisseur
 * legacy→Craft.js produit 'FeatureCardsBlock' qui n'existe pas dans le resolver.
 * Solution : normaliser les types vers les clés TYPE_MAP (lowercase).
 *
 * Usage: node server/migrations/fix_block_types.js
 */
const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Map les types "PascalCase" stockés vers les clés TYPE_MAP (lowercase)
// Ces clés sont déjà définies dans src/utils/legacyToCraft.ts → TYPE_MAP
const TYPE_NORMALIZER = {
  // Enrichissement script types → TYPE_MAP key
  'HeroBanner': 'herobanner',
  'HeroBannerBlock': 'herobanner',
  'FeatureCards': 'featurecards',
  'StatsGrid': 'statsgrid',
  'TextImage': 'textimage',
  'MediaGallery': 'mediagallery',
  'FaqBlock': 'faqblock',
  'HtmlBlock': 'html',
  'Testimonials': 'testimonials',
  'TestimonialsListBlock': 'testimonials',
  // Additional safeguards
  'HeroBlock': 'hero',
  'StatsBlock': 'stats',
  'GalleryBlock': 'gallery',
  'FAQBlock': 'faq',
  'FeatureListBlock': 'featurecards',
  'ColumnsBlock': 'columns',
  'CallToActionBlock': 'cta',
  'CardBlock': 'card',
  'ContainerBlock': 'container',
  'ImageBlock': 'image',
  'TextBlock': 'text',
  'HtmlBlockBlock': 'html',  // produced by fallback PascalCase
};

async function fix() {
  const client = await pool.connect();
  try {
    console.log('🔧 Correction des types de blocs legacy dans les pages...\n');

    // Trouver toutes les pages avec structure_json au format array (legacy)
    const res = await client.query(
      "SELECT id, slug, title, structure_json FROM public.pages WHERE jsonb_typeof(structure_json) = 'array'"
    );

    console.log(`📋 ${res.rows.length} pages au format legacy trouvées.\n`);

    let fixed = 0;
    let errors = 0;

    for (const row of res.rows) {
      try {
        const blocks = typeof row.structure_json === 'string'
          ? JSON.parse(row.structure_json)
          : row.structure_json;

        if (!Array.isArray(blocks)) continue;

        let changed = false;
        for (const block of blocks) {
          const originalType = block.type;
          if (!originalType) continue;

          const normalized = TYPE_NORMALIZER[originalType];
          if (normalized && normalized !== originalType) {
            block.type = normalized;
            changed = true;
          }
        }

        if (changed) {
          await client.query(
            'UPDATE public.pages SET structure_json = $1, updated_at = NOW() WHERE id = $2',
            [JSON.stringify(blocks), row.id]
          );
          fixed++;
          console.log(`   ✅ "${row.slug}" (${row.title}) — types corrigés`);
        } else {
          console.log(`   ⏭️  "${row.slug}" — aucun type à corriger`);
        }
      } catch (err) {
        errors++;
        console.error(`   ❌ "${row.slug}": ${err.message}`);
      }
    }

    console.log(`\n📊 Résultat : ${fixed} pages corrigées, ${errors} erreurs`);
    console.log('✅ Correction terminée !');

  } finally {
    client.release();
    await pool.end();
  }
}

fix().catch((err) => {
  console.error('❌ Fix failed:', err);
  process.exit(1);
});
