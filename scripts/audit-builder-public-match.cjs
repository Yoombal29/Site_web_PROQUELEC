#!/usr/bin/env node
/**
 * Audit des ecarts entre le Builder et les pages publiques.
 *
 * Le public rend `structure_json`.
 * `draft_json` est un brouillon non publie et ne doit pas etre confondu
 * avec la version visible sur le site.
 *
 * Usage:
 *   node scripts/audit-builder-public-match.cjs
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

function parseJson(value) {
  if (!value) return null;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function pageType(page) {
  const designOptions = parseJson(page.design_options) || {};
  if (page.immutable === true && designOptions.page_type === 'hybrid') return 'hybrid';
  if (page.immutable === true) return 'functional';
  return 'content';
}

function stableJson(value) {
  return value ? JSON.stringify(parseJson(value)) : '';
}

async function main() {
  const pool = new Pool(DB_CONFIG);

  try {
    const { rows } = await pool.query(`
      SELECT id, slug, title, immutable, design_options, structure_json, draft_json, updated_at
        FROM public.pages
       ORDER BY slug ASC
    `);

    const report = {
      total: rows.length,
      content: 0,
      functional: 0,
      hybrid: 0,
      draftDiffersFromPublic: [],
      missingStructure: [],
    };

    for (const page of rows) {
      const type = pageType(page);
      report[type] += 1;

      const structureJson = stableJson(page.structure_json);
      const draftJson = stableJson(page.draft_json);

      if (!structureJson) {
        report.missingStructure.push({ slug: page.slug, title: page.title, type });
      }

      if (structureJson && draftJson && structureJson !== draftJson) {
        report.draftDiffersFromPublic.push({ slug: page.slug, title: page.title, type });
      }
    }

    console.log(JSON.stringify(report, null, 2));

    if (report.draftDiffersFromPublic.length > 0) {
      console.log(
        '\nNote: ces pages ont un brouillon different de la version publique. Publiez depuis le Builder pour mettre a jour structure_json.',
      );
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[audit-builder-public-match] Erreur:', error);
  process.exit(1);
});
