#!/usr/bin/env node
/**
 * Finalise les pages hybrides qui doivent exposer une vraie page React
 * dans le Builder/CMS sans dupliquer leur logique metier.
 *
 * Usage: node scripts/finalize-hybrid-pages.cjs
 */
const { Pool } = require('pg');
const path = require('path');

require('dotenv').config({
  override: true,
  path: path.resolve(__dirname, '../.env'),
});

const DB_CONFIG = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || process.env.PG_PORT || '5432', 10),
      database: process.env.DB_NAME || 'proquelec',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || process.env.POSTGRES_PASSWORD || 'postgres',
    };

const HYBRID_PAGES = [
  {
    slug: 'documents',
    title: 'Documents & Ressources',
    route: '/documents',
    component: 'Documents',
    description: 'Bibliotheque publique des guides, normes et ressources techniques.',
    menuOrder: 50,
  },
  {
    slug: 'events',
    title: 'Évènements',
    route: '/events',
    component: 'Events',
    description: 'Agenda public des conferences, ateliers et rencontres PROQUELEC.',
    menuOrder: 51,
  },
  {
    slug: 'labels',
    title: 'Labels & Qualité',
    route: '/labels',
    component: 'Labels',
    description: 'Page publique du label de qualite PROQUELEC.',
    menuOrder: 52,
  },
  {
    slug: 'outils',
    title: 'Outils',
    route: '/outils',
    component: 'ToolsPlatform',
    description: 'Plateforme publique des outils techniques PROQUELEC.',
    menuOrder: 53,
  },
  {
    slug: 'showroom',
    title: 'Showroom Technique',
    route: '/showroom',
    component: 'Showroom',
    description: 'Showroom public des realisations et demonstrations techniques.',
    menuOrder: 54,
  },
  {
    slug: 'blog/{slug}',
    title: 'Blog {slug}',
    route: '/blog/{slug}',
    realRoute: '/blog/:slug',
    component: 'BlogPost',
    description: "Gabarit hybride pour les articles du blog.",
    menuOrder: 90,
  },
  {
    slug: 'expert-kebe',
    title: 'Expert Kebe',
    route: '/expert-kebe',
    component: 'InspecteurKEBE',
    description: "Module hybride d'inspection KEBE.",
    menuOrder: 91,
  },
  {
    slug: 'rubrique-selector',
    title: 'Rubrique Selector',
    route: '/rubrique-selector',
    component: 'RubriqueSelectorPage',
    description: 'Module hybride de selection de rubriques techniques.',
    menuOrder: 92,
  },
  {
    slug: 'schema-builder',
    title: 'Schema Builder',
    route: '/schema-builder',
    component: 'SchemaBuilder',
    description: 'Module hybride de construction de schemas.',
    menuOrder: 93,
  },
];

function createFunctionalPageStructure(slug, title) {
  return {
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
        slug,
        pageTitle: title,
      },
      parent: 'ROOT',
      linkedNodes: {},
      isCanvas: false,
      displayName: 'FunctionalPageBlock',
    },
  };
}

async function getPageColumns(client) {
  const result = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pages'
  `);

  return new Set(result.rows.map((row) => row.column_name));
}

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

function filterKnownColumns(columns, values) {
  return Object.fromEntries(Object.entries(values).filter(([column]) => columns.has(column)));
}

function createPageValues(page) {
  const structure = createFunctionalPageStructure(page.slug, page.title);
  const designOptions = {
    page_type: 'hybrid',
    functional: true,
    locked: true,
    functional_slug: page.slug,
    route: page.route,
    real_route: page.realRoute || page.route,
    component: page.component,
  };
  const contentRaw = `<p>${page.description} La logique est rendue par le composant React ${page.component}.</p>`;

  return {
    title: page.title,
    slug: page.slug,
    content: contentRaw,
    content_raw: contentRaw,
    content_blocks: JSON.stringify([]),
    structure_json: JSON.stringify(structure),
    draft_json: JSON.stringify(structure),
    design_options: JSON.stringify(designOptions),
    seo_options: JSON.stringify({
      meta_description: page.description,
    }),
    security_level: 'public',
    immutable: true,
    locked: true,
    is_published: true,
    status: 'published',
    workflow_status: 'published',
    render_engine: 'craft',
    editor_engine: 'craft',
    template: 'hybrid-functional',
    show_hero: false,
    show_footer: true,
    meta_description: page.description,
    meta_robots: 'index,follow',
    hero_title: page.title,
    hero_subtitle: page.description,
    menu_order: page.menuOrder,
  };
}

async function upsertHybridPage(client, columns, page) {
  const values = filterKnownColumns(columns, createPageValues(page));
  const existing = await client.query('SELECT id FROM public.pages WHERE slug = $1 LIMIT 1', [
    page.slug,
  ]);

  if (existing.rowCount > 0) {
    const updateEntries = Object.entries(values).filter(([column]) => column !== 'slug');
    const assignments = updateEntries.map(([column], index) => `${column} = $${index + 1}`);
    const params = updateEntries.map(([, value]) => value);

    if (columns.has('updated_at')) {
      assignments.push('updated_at = NOW()');
    }

    const result = await client.query(
      `
        UPDATE public.pages
           SET ${assignments.join(', ')}
         WHERE slug = $${params.length + 1}
         RETURNING id, slug, title, immutable, is_published, status, workflow_status
      `,
      [...params, page.slug],
    );

    return { action: 'updated', row: result.rows[0] };
  }

  const insertEntries = Object.entries(values);
  const insertColumns = insertEntries.map(([column]) => column);
  const params = insertEntries.map(([, value]) => value);
  const placeholders = params.map((_, index) => `$${index + 1}`);

  if (columns.has('created_at')) {
    insertColumns.push('created_at');
    placeholders.push('NOW()');
  }

  if (columns.has('updated_at')) {
    insertColumns.push('updated_at');
    placeholders.push('NOW()');
  }

  const result = await client.query(
    `
      INSERT INTO public.pages (${insertColumns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING id, slug, title, immutable, is_published, status, workflow_status
    `,
    params,
  );

  return { action: 'created', row: result.rows[0] };
}

async function main() {
  const pool = new Pool(DB_CONFIG);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await setImmutableTrigger(client, false);

    const columns = await getPageColumns(client);
    const results = [];

    for (const page of HYBRID_PAGES) {
      const result = await upsertHybridPage(client, columns, page);
      results.push(result);
      console.log(`[hybrid-pages] ${result.action} ${result.row.slug} (${result.row.id})`);
    }

    await setImmutableTrigger(client, true);
    await client.query('COMMIT');

    const verification = await pool.query(
      `
        SELECT slug, title, immutable, is_published, status, workflow_status,
               design_options->>'page_type' AS page_type,
               structure_json::text LIKE '%FunctionalPageBlock%' AS has_functional_block
          FROM public.pages
         WHERE slug = ANY($1::text[])
         ORDER BY slug
      `,
      [HYBRID_PAGES.map((page) => page.slug)],
    );

    console.table(verification.rows);
    console.log(`[hybrid-pages] Finalisation terminee: ${results.length} page(s).`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[hybrid-pages] Erreur:', error);
  process.exit(1);
});
