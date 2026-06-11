#!/usr/bin/env node
/**
 * Audit des pages Builder.
 *
 * Usage:
 *   node scripts/audit-builder-pages.cjs
 *   node scripts/audit-builder-pages.cjs --fix
 *
 * Le mode --fix repare uniquement les pages fonctionnelles immuables
 * dont la structure n'est pas un FunctionalPageBlock.
 */

const { Pool } = require('pg');
const path = require('path');

require('dotenv').config({
  override: true,
  path: path.resolve(__dirname, '../.env'),
});

const FIX = process.argv.includes('--fix');

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

function isCraftStructure(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value) && value.ROOT);
}

function isFunctionalStructure(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.values(value).some((node) => {
    if (!node || typeof node !== 'object') return false;
    const type = node.type;
    return (
      type === 'FunctionalPageBlock' ||
      type?.resolvedName === 'FunctionalPageBlock' ||
      node.displayName === 'FunctionalPageBlock'
    );
  });
}

function isHybrid(page) {
  return page.design_options?.page_type === 'hybrid';
}

function isSectionDriven(page) {
  return page.design_options?.page_type === 'section_driven' || page.design_options?.section_driven === true;
}

function createFunctionalStructure(page) {
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
        slug: page.slug,
        pageTitle: page.title || 'Page fonctionnelle',
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
  const client = await pool.connect();

  const report = {
    total: 0,
    content: 0,
    functional: 0,
    hybrid: 0,
    sectionDriven: 0,
    invalidCraft: [],
    functionalNeedsHeal: [],
    missingStructure: [],
    fixed: [],
  };

  try {
    const { rows } = await client.query(`
      SELECT id, slug, title, immutable, design_options, structure_json, draft_json, is_published, status
        FROM public.pages
       ORDER BY slug ASC
    `);

    report.total = rows.length;

    for (const page of rows) {
      page.design_options = parseJson(page.design_options) || {};
      const structure = parseJson(page.structure_json);
      const functional = page.immutable === true && !isHybrid(page);
      const sectionDriven = isSectionDriven(page);

      if (sectionDriven) report.sectionDriven++;
      else if (page.immutable === true && isHybrid(page)) report.hybrid++;
      else if (functional) report.functional++;
      else report.content++;

      if (sectionDriven) {
        continue;
      }

      if (!structure) {
        report.missingStructure.push(page.slug);
      } else if (!isCraftStructure(structure)) {
        report.invalidCraft.push(page.slug);
      }

      if (functional && !isFunctionalStructure(structure)) {
        report.functionalNeedsHeal.push(page.slug);
      }
    }

    if (FIX && report.functionalNeedsHeal.length > 0) {
      await client.query('BEGIN');
      await client.query("SET LOCAL session_replication_role = 'replica'");

      for (const slug of report.functionalNeedsHeal) {
        const page = rows.find((row) => row.slug === slug);
        const fixedStructure = createFunctionalStructure(page);

        await client.query(
          `
            UPDATE public.pages
               SET structure_json = $1::jsonb,
                   draft_json = $1::jsonb,
                   updated_at = NOW()
             WHERE id = $2
          `,
          [JSON.stringify(fixedStructure), page.id],
        );

        report.fixed.push(slug);
      }

      await client.query('COMMIT');
    }
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {}
    throw error;
  } finally {
    client.release();
    await pool.end();
  }

  console.log(JSON.stringify(report, null, 2));

  if (!FIX && report.functionalNeedsHeal.length > 0) {
    console.log('\nRelancez avec --fix pour reparer les pages fonctionnelles listees.');
  }
}

main().catch((error) => {
  console.error('[audit-builder-pages] Erreur:', error);
  process.exit(1);
});
