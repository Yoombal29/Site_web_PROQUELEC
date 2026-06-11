#!/usr/bin/env node
/**
 * Audit global CMS PROQUELEC.
 *
 * Produit un rapport JSON avec:
 * - metriques de poids Builder
 * - coherence de publication
 * - signaux de securite dans les contenus stockes
 * - qualite editoriale
 * - etat des tables Builder
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

const BUILDER_TABLES = [
  'builder_pages',
  'builder_versions',
  'builder_snapshots',
  'builder_templates',
  'builder_release_events',
  'builder_release_candidates',
  'builder_page_revisions',
  'builder_components',
  'builder_exports',
  'builder_collaboration',
];

function parseMaybe(value) {
  if (!value || typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function stableJson(value) {
  return JSON.stringify(value ?? null);
}

function byteSize(value) {
  return Buffer.byteLength(stableJson(value), 'utf8');
}

function hasText(value) {
  return value !== undefined && value !== null && String(value).trim().length > 0;
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function countNodes(value) {
  if (!value) return 0;
  if (Array.isArray(value)) {
    return value.reduce((sum, item) => sum + 1 + countNodes(item?.children || item?.nodes || []), 0);
  }
  if (isPlainObject(value)) {
    if (value.ROOT) return Object.keys(value).length;
    if (Array.isArray(value.blocks)) return countNodes(value.blocks);
  }
  return 0;
}

function quantile(values, q) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const index = Math.ceil(q * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, index))];
}

function seoDescription(page) {
  const seo = parseMaybe(page.seo_options) || {};
  return page.meta_description || seo.meta_description || seo.description;
}

function hasImage(page) {
  if (hasText(page.featured_image) || hasText(page.hero_background_image)) return true;
  const blob = stableJson({
    structure_json: page.structure_json,
    content_blocks: page.content_blocks,
    html: page.content || page.content_raw || '',
  });
  return /<img\s|\b(src|image|imageUrl|backgroundImage|background_url|hero_background_image)\b/i.test(blob);
}

function securitySignals(page) {
  const blob = [
    page.content,
    page.content_raw,
    page.content_compiled,
    page.header_html,
    page.footer_html,
    page.custom_js,
    stableJson(page.structure_json),
    stableJson(page.draft_json),
    stableJson(page.content_blocks),
  ].join('\n');

  return {
    scriptTag: /<script\b/i.test(blob),
    inlineHandler: /\son[a-z]+\s*=/i.test(blob),
    javascriptUrl: /javascript\s*:/i.test(blob),
    iframe: /<iframe\b/i.test(blob),
    styleImport: /@import|expression\s*\(/i.test(blob),
  };
}

async function tableExists(client, tableName) {
  const { rows } = await client.query('SELECT to_regclass($1) AS reg', [`public.${tableName}`]);
  return Boolean(rows[0]?.reg);
}

async function columnExists(client, tableName, columnName) {
  const { rows } = await client.query(
    `
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
      LIMIT 1
    `,
    [tableName, columnName],
  );
  return rows.length > 0;
}

async function safeCount(client, tableName) {
  if (!(await tableExists(client, tableName))) return null;
  const { rows } = await client.query(`SELECT COUNT(*)::int AS count FROM public.${tableName}`);
  return rows[0].count;
}

async function readMenuUrls(client) {
  if (!(await tableExists(client, 'menu_items'))) return [];

  const hasActiveColumn = await columnExists(client, 'menu_items', 'is_active');
  const where = hasActiveColumn ? 'WHERE COALESCE(is_active, true) = true' : '';
  const { rows } = await client.query(`SELECT url FROM public.menu_items ${where}`);

  return rows
    .map((row) => String(row.url || '').replace(/^\//, '').replace(/\/$/, ''))
    .filter(Boolean);
}

async function inspectBuilderTables(client) {
  const tables = [];

  for (const table of BUILDER_TABLES) {
    const present = await tableExists(client, table);
    const detail = {
      table,
      present,
      count: present ? await safeCount(client, table) : null,
      indexes: [],
      foreignKeys: [],
    };

    if (present) {
      const { rows: indexes } = await client.query(
        `
          SELECT indexname
          FROM pg_indexes
          WHERE schemaname = 'public'
            AND tablename = $1
          ORDER BY indexname
        `,
        [table],
      );
      detail.indexes = indexes.map((row) => row.indexname);

      const { rows: foreignKeys } = await client.query(
        `
          SELECT tc.constraint_name,
                 kcu.column_name,
                 ccu.table_name AS foreign_table_name,
                 ccu.column_name AS foreign_column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
           AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
           AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
            AND tc.table_name = $1
          ORDER BY tc.constraint_name
        `,
        [table],
      );
      detail.foreignKeys = foreignKeys;
    }

    tables.push(detail);
  }

  return tables;
}

function pageStructureType(structure) {
  if (!structure) return 'empty';
  if (Array.isArray(structure)) return 'legacy-array';
  if (isPlainObject(structure) && structure.ROOT) return 'craft';
  return 'other';
}

async function main() {
  const pool = new Pool(DB_CONFIG);
  const client = await pool.connect();

  try {
    const { rows: pages } = await client.query('SELECT * FROM public.pages ORDER BY slug');
    const pageMetrics = pages.map((page) => {
      const structure = parseMaybe(page.structure_json);
      const draft = parseMaybe(page.draft_json);

      return {
        slug: page.slug,
        title: page.title,
        nodeCount: countNodes(structure),
        structureBytes: byteSize(structure),
        draftBytes: byteSize(draft),
        type: pageStructureType(structure),
      };
    });

    const nodeCounts = pageMetrics.map((page) => page.nodeCount);
    const structureSizes = pageMetrics.map((page) => page.structureBytes);
    const canonicalPublished = pages.filter(
      (page) =>
        page.status === 'published' &&
        page.workflow_status === 'published' &&
        page.is_published === true,
    );
    const nonCanonical = pages.filter(
      (page) =>
        !(
          page.status === 'published' &&
          page.workflow_status === 'published' &&
          page.is_published === true
        ),
    );
    const inconsistentVisible = nonCanonical.filter(
      (page) =>
        page.status === 'published' ||
        page.workflow_status === 'published' ||
        page.is_published === true,
    );

    const menuUrls = await readMenuUrls(client);
    const menuSet = new Set(menuUrls);
    const canonicalContentPages = canonicalPublished.filter(
      (page) =>
        !page.immutable &&
        !String(page.slug).startsWith('admin') &&
        !String(page.slug).includes('{'),
    );

    const securityRows = pages.map((page) => ({ slug: page.slug, ...securitySignals(page) }));
    const signalKeys = ['scriptTag', 'inlineHandler', 'javascriptUrl', 'iframe', 'styleImport'];
    const signalCounts = Object.fromEntries(
      signalKeys.map((key) => [key, securityRows.filter((row) => row[key]).length]),
    );

    const byStatus = pages.reduce((acc, page) => {
      const key = `${page.status || 'null'}/${page.workflow_status || 'null'}/is_published=${page.is_published}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const byEngine = pages.reduce((acc, page) => {
      const key = `${page.editor_engine || 'null'}/${page.render_engine || 'null'}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const report = {
      generatedAt: new Date().toISOString(),
      inventory: {
        pages: pages.length,
        canonicalPublished: canonicalPublished.length,
        canonicalContentPages: canonicalContentPages.length,
        byStatus,
        byEngine,
      },
      performance: {
        avgNodes: Number((nodeCounts.reduce((sum, value) => sum + value, 0) / Math.max(1, nodeCounts.length)).toFixed(1)),
        p95Nodes: quantile(nodeCounts, 0.95),
        maxNodes: Math.max(...nodeCounts),
        avgStructureKb: Number((structureSizes.reduce((sum, value) => sum + value, 0) / Math.max(1, structureSizes.length) / 1024).toFixed(1)),
        p95StructureKb: Number((quantile(structureSizes, 0.95) / 1024).toFixed(1)),
        maxStructureKb: Number((Math.max(...structureSizes) / 1024).toFixed(1)),
        topByNodes: pageMetrics
          .slice()
          .sort((a, b) => b.nodeCount - a.nodeCount)
          .slice(0, 8),
        topBySize: pageMetrics
          .slice()
          .sort((a, b) => b.structureBytes - a.structureBytes)
          .slice(0, 8)
          .map((page) => ({
            ...page,
            structureKb: Number((page.structureBytes / 1024).toFixed(1)),
          })),
        legacyArrayPages: pageMetrics.filter((page) => page.type === 'legacy-array').map((page) => page.slug),
      },
      publication: {
        nonCanonicalCount: nonCanonical.length,
        inconsistentVisibleCount: inconsistentVisible.length,
        nonCanonical: nonCanonical.map((page) => ({
          slug: page.slug,
          status: page.status,
          workflow_status: page.workflow_status,
          is_published: page.is_published,
        })),
      },
      security: {
        signalCounts,
        signalPages: securityRows.filter((row) => signalKeys.some((key) => row[key])).slice(0, 20),
      },
      contentQuality: {
        allPages: {
          pagesWithoutSeoDescription: pages.filter((page) => !hasText(seoDescription(page))).length,
          pagesWithoutImage: pages.filter((page) => !hasImage(page)).length,
          pagesWithoutAuthor: pages.filter((page) => !hasText(page.author)).length,
        },
        canonicalContentPages: {
          total: canonicalContentPages.length,
          pagesWithoutSeoDescription: canonicalContentPages.filter((page) => !hasText(seoDescription(page))).length,
          pagesWithoutSeoDescriptionSample: canonicalContentPages
            .filter((page) => !hasText(seoDescription(page)))
            .map((page) => page.slug)
            .slice(0, 20),
          pagesWithoutImage: canonicalContentPages.filter((page) => !hasImage(page)).length,
          pagesWithoutImageSample: canonicalContentPages
            .filter((page) => !hasImage(page))
            .map((page) => page.slug)
            .slice(0, 20),
          pagesWithoutAuthor: canonicalContentPages.filter((page) => !hasText(page.author)).length,
          pagesWithoutAuthorSample: canonicalContentPages
            .filter((page) => !hasText(page.author))
            .map((page) => page.slug)
            .slice(0, 20),
          orphanPublished: canonicalContentPages
            .filter((page) => page.slug !== 'home' && !menuSet.has(page.slug))
            .map((page) => page.slug)
            .slice(0, 40),
        },
      },
      builderTables: await inspectBuilderTables(client),
    };

    console.log(JSON.stringify(report, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[audit-cms-global] Erreur:', error);
  process.exit(1);
});
