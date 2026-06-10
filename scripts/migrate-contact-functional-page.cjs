/**
 * Migrate Contact page to functional (immutable) CMS page
 * Run: node scripts/migrate-contact-functional-page.cjs
 *
 * Transforms the existing DB contact page into a design-locked functional page
 * that renders ContactPremiumBlock via the FunctionalPageBlock system.
 */
const { Pool } = require('pg');
require('dotenv').config({ override: true });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/proquelec',
});

const FUNCTIONAL_STRUCTURE = JSON.stringify({
  ROOT: {
    type: 'div',
    nodes: ['func_page_block'],
    props: { style: {} },
    linkedNodes: {},
  },
  func_page_block: {
    type: { resolvedName: 'FunctionalPageBlock' },
    nodes: [],
    props: {
      slug: 'contact',
      pageTitle: 'Contact',
    },
    parent: 'ROOT',
    linkedNodes: {},
    isCanvas: false,
    displayName: 'FunctionalPageBlock',
  },
});

const DESIGN_OPTIONS = JSON.stringify({
  locked: true,
  functional: true,
});

async function migrate() {
  console.log('Migrating Contact page to functional CMS page...');

  const existing = await pool.query('SELECT id, slug, title, immutable FROM public.pages WHERE slug = $1', ['contact']);

  if (existing.rows.length === 0) {
    console.log('Contact page not found — creating new entry...');
    await pool.query(
      `INSERT INTO public.pages
       (title, slug, content, structure_json, design_options, immutable, is_published, status, menu_order, meta_description, hero_title, hero_subtitle, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
      [
        'Contact',
        'contact',
        '',
        FUNCTIONAL_STRUCTURE,
        DESIGN_OPTIONS,
        true,
        true,
        'published',
        5,
        'Contactez PROQUELEC — formulaire de contact, téléphone, email et adresse.',
        'Contact',
        'Parlons de votre projet',
      ],
    );
    console.log('✅ Contact page created.');
  } else {
    const page = existing.rows[0];
    console.log(`Found contact page (id=${page.id}, immutable=${page.immutable})`);

    if (page.immutable === true) {
      console.log('Contact page is already immutable — skipping.');
    } else {
      await pool.query(
        `UPDATE public.pages
         SET immutable = true,
             is_published = true,
             status = 'published',
             structure_json = $1,
             design_options = $2,
             updated_at = NOW()
         WHERE slug = 'contact'`,
        [FUNCTIONAL_STRUCTURE, DESIGN_OPTIONS],
      );
      console.log('✅ Contact page updated to immutable functional page.');
    }
  }

  await pool.end();
  console.log('Done.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
