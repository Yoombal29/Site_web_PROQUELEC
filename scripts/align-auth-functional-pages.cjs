#!/usr/bin/env node
/**
 * Aligne les pages d'authentification avec le modèle Builder fonctionnel.
 * Les routes /connexion, /login et /auth restent des pages DB, mais leur
 * structure est un FunctionalPageBlock verrouillé qui rend le composant Auth.
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

const AUTH_PAGES = [
  { slug: 'connexion', title: 'Connexion' },
  { slug: 'login', title: 'Login' },
  { slug: 'auth', title: 'Auth' },
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

async function main() {
  const pool = new Pool(DB_CONFIG);

  try {
    for (const page of AUTH_PAGES) {
      const structure = createFunctionalPageStructure(page.slug, page.title);
      const structureJson = JSON.stringify(structure);

      const result = await pool.query(
        `
          UPDATE public.pages
             SET title = COALESCE(NULLIF(title, ''), $2),
                 structure_json = $3::jsonb,
                 draft_json = $3::jsonb,
                 immutable = true,
                 is_published = true,
                 workflow_status = 'published',
                 status = 'published',
                 security_level = 'authenticated',
                 updated_at = NOW()
           WHERE slug = $1
           RETURNING id, slug, title
        `,
        [page.slug, page.title, structureJson],
      );

      if (result.rowCount === 0) {
        console.warn(`[auth-functional] Page introuvable: ${page.slug}`);
      } else {
        const row = result.rows[0];
        console.log(`[auth-functional] OK ${row.slug} (${row.id})`);
      }
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[auth-functional] Erreur:', error);
  process.exit(1);
});
