#!/usr/bin/env node
/*
 * Script de migration : convertit toutes les pages dont `structure_json` est un tableau
 * vers un graphe Craft.js et met à jour `structure_json` et `draft_json` en base.
 * Usage:
 *   node scripts/migrate_legacy_to_craft.cjs        # dry-run (compte et écrit aperçu)
 *   node scripts/migrate_legacy_to_craft.cjs --apply    # applique les changements
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

function generateId() {
  return `node_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function mapTypeToResolvedName(type) {
  if (!type) return 'ContainerBlock';
  const key = String(type).toLowerCase();
  const TYPE_MAP = {
    'hero': 'HeroBlock',
    'hero-banner': 'HeroBannerBlock',
    'herobanner': 'HeroBannerBlock',
    'audienceoffers': 'AudienceOffersBlock',
    'visionmission': 'VisionMissionBlock',
    'landingstats': 'LandingStatsBlock',
    'latestnews': 'LatestNewsBlock',
    'partnerlogos': 'PartnerLogosBlock',
    'stats': 'StatsBlock',
    'html': 'HtmlBlock',
    'text': 'TextBlock',
    'columns': 'ColumnsBlock',
  };
  if (TYPE_MAP[key]) return TYPE_MAP[key];
  const pascal = String(type)
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (m) => m.toUpperCase());
  return pascal + 'Block';
}

function walk(block, parentId, result) {
  const id = block.id || generateId();
  const resolvedName = mapTypeToResolvedName(block.type || 'container');
  const childIds = [];
  if (Array.isArray(block.children)) {
    for (const child of block.children) {
      const cid = walk(child, id, result);
      childIds.push(cid);
    }
  }
  const props = block.props ?? block.content ?? {};
  result[id] = {
    type: { resolvedName },
    nodes: childIds,
    props,
    custom: {},
    hidden: false,
    parent: parentId || 'ROOT',
    isCanvas: Array.isArray(childIds) && childIds.length > 0,
    displayName: resolvedName,
    linkedNodes: {},
  };
  return id;
}

function convertLegacyBlocksToCraftGraph(blocks, pageTitle) {
  const result = {};
  const rootNodes = [];
  for (const b of blocks) {
    const id = walk(b, null, result);
    rootNodes.push(id);
  }
  result['ROOT'] = {
    type: { resolvedName: 'ContainerBlock' },
    nodes: rootNodes,
    props: { padding: 0, maxWidth: '100%' },
    custom: {},
    hidden: false,
    isCanvas: true,
    displayName: `Page: ${pageTitle || 'Page'}`,
    linkedNodes: {},
  };
  return result;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const DATABASE_URL = process.env.DATABASE_URL || process.env.PG_CONN || 'postgres://postgres:proquelec_secure_db_pass@localhost:5437/proquelec';
  const pool = new Pool({ connectionString: DATABASE_URL });

  console.log('[migration] Connecting to DB:', DATABASE_URL);

  const client = await pool.connect();
  try {
    const res = await client.query("SELECT id, slug, title, structure_json FROM public.pages WHERE structure_json IS NOT NULL AND jsonb_typeof(structure_json) = 'array'");
    console.log('[migration] Found', res.rowCount, 'legacy pages (structure_json=array)');

    if (res.rowCount === 0) {
      console.log('[migration] Rien à faire.');
      return;
    }

    const backup = res.rows.map(r => ({ id: r.id, slug: r.slug, title: r.title, structure_json: r.structure_json }));
    const backupFile = path.resolve(process.cwd(), 'tmp', `legacy_pages_backup_${Date.now()}.json`);
    fs.mkdirSync(path.dirname(backupFile), { recursive: true });
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2), 'utf8');
    console.log('[migration] Backup created:', backupFile);

    const preview = [];
    for (const row of res.rows) {
      const struct = row.structure_json;
      try {
        const blocks = Array.isArray(struct) ? struct : JSON.parse(struct);
        const craft = convertLegacyBlocksToCraftGraph(blocks, row.title || row.slug);
        preview.push({ id: row.id, slug: row.slug, nodes: Object.keys(craft).length });
        if (apply) {
          const json = JSON.stringify(craft);
          try {
            await client.query('BEGIN');
            await client.query('UPDATE public.pages SET structure_json = $1::jsonb, draft_json = $1::jsonb, updated_at = NOW() WHERE id = $2', [json, row.id]);
            await client.query('COMMIT');
            console.log('[migration] Updated row', row.id, row.slug);
          } catch (innerErr) {
            await client.query('ROLLBACK');
            console.error('[migration] DB update failed for', row.id, row.slug, innerErr.message || innerErr);
          }
        }
      } catch (e) {
        console.error('[migration] Failed to convert row', row.id, row.slug, e.message || e);
      }
    }

    const previewFile = path.resolve(process.cwd(), 'tmp', `legacy_migration_preview_${Date.now()}.json`);
    fs.writeFileSync(previewFile, JSON.stringify(preview, null, 2), 'utf8');
    console.log('[migration] Preview written:', previewFile);

    if (!apply) {
      console.log('[migration] Dry-run complete. To apply changes run with --apply');
    } else {
      console.log('[migration] Applied migration to', preview.length, 'pages.');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
