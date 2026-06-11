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

async function setImmutableTrigger(client, enabled) {
  const action = enabled ? 'ENABLE' : 'DISABLE';
  await client.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'trg_immutable_prevent'
          AND tgrelid = 'public.pages'::regclass
      ) THEN
        EXECUTE 'ALTER TABLE public.pages ${action} TRIGGER trg_immutable_prevent';
      END IF;
    END $$;
  `);
}

async function migrate() {
  console.log('Migrating Contact page to functional CMS page...');

  const existing = await pool.query(
    'SELECT id, slug, title, immutable, structure_json::text AS structure_json, draft_json::text AS draft_json FROM public.pages WHERE slug = $1',
    ['contact'],
  );

  if (existing.rows.length === 0) {
    console.log('Contact page not found — creating new entry...');
    await pool.query(
      `INSERT INTO public.pages
       (title, slug, content, content_raw, structure_json, draft_json, design_options, immutable,
        is_published, status, workflow_status, menu_order, meta_description, hero_title, hero_subtitle,
        created_at, updated_at)
       VALUES ($1, $2, '', '', $3, $3, $4, true, true, 'published', 'published', $5, $6, $7, $8, NOW(), NOW())`,
      [
        'Contact',
        'contact',
        FUNCTIONAL_STRUCTURE,
        DESIGN_OPTIONS,
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

    const hasFunctionalStructure = String(page.structure_json || '').includes('FunctionalPageBlock');
    const hasFunctionalDraft = String(page.draft_json || '').includes('FunctionalPageBlock');
    const mustRepair = page.immutable !== true || !hasFunctionalStructure || !hasFunctionalDraft;

    if (mustRepair) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await setImmutableTrigger(client, false);
        await client.query(
          `UPDATE public.pages
           SET immutable = true,
               is_published = true,
               status = 'published',
               workflow_status = 'published',
               content = '',
               content_raw = '',
               structure_json = $1,
               draft_json = $1,
               design_options = COALESCE(design_options, '{}'::jsonb) || $2::jsonb,
               meta_description = 'Contactez PROQUELEC — formulaire de contact, téléphone, email et adresse.',
               hero_title = 'Contact',
               hero_subtitle = 'Parlons de votre projet',
               updated_at = NOW()
           WHERE slug = 'contact'`,
          [FUNCTIONAL_STRUCTURE, DESIGN_OPTIONS],
        );
        await setImmutableTrigger(client, true);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
      console.log('✅ Contact page repaired as immutable functional page.');
    } else {
      console.log('Contact page is already immutable and functional — skipping.');
    }
  }

  await pool.end();
  console.log('Done.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
