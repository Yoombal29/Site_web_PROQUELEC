/**
 * migrate-to-craft-blocks.cjs
 * ─────────────────────────────
 * Script de migration Node.js qui convertit toutes les pages existantes
 * au format Craft.js (ROOT → ContainerBlock → HtmlBlock).
 *
 * Usage:
 *   node scripts/migrate-to-craft-blocks.cjs [--dry-run]
 *
 * Options:
 *   --dry-run   Simule la migration sans écrire en base
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ─────────────────────────────────────────────
// CRAFT.JS SERIALIZED STRUCTURE BUILDER
// ─────────────────────────────────────────────

/**
 * Crée une structure Craft.js sérialisée avec un ContainerBlock
 * contenant un unique HtmlBlock porteur du contenu HTML original.
 */
function buildCraftStructure(htmlContent) {
  const htmlNodeId = `html_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return {
    ROOT: {
      type: { resolvedName: 'ContainerBlock' },
      isCanvas: true,
      props: {
        padding: 0,
        backgroundColor: '#ffffff',
        maxWidth: '100%',
      },
      displayName: 'Conteneur',
      custom: {},
      hidden: false,
      nodes: [htmlNodeId],
      linkedNodes: {},
    },
    [htmlNodeId]: {
      type: { resolvedName: 'HtmlBlock' },
      isCanvas: false,
      props: {
        html: htmlContent || '',
        padding: 0,
      },
      displayName: 'Code HTML',
      custom: {},
      hidden: false,
      nodes: [],
      linkedNodes: {},
      parent: 'ROOT',
    },
  };
}

/**
 * Vérifie si une structure JSON est déjà au format Craft.js
 */
function isCraftJsStructure(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  return 'ROOT' in data && data.ROOT?.type?.resolvedName != null;
}

// ─────────────────────────────────────────────
// MIGRATION
// ─────────────────────────────────────────────

async function migrate() {
  const isDryRun = process.argv.includes('--dry-run');
  const client = await pool.connect();

  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   MIGRATION CRAFT.JS — Pages existantes → Blocs     ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`Mode: ${isDryRun ? '🧪 DRY RUN (pas d\'écriture)' : '🚀 PRODUCTION'}`);
  console.log('');

  try {
    // 1. Récupérer toutes les pages
    const { rows: pages } = await client.query(`
      SELECT id, slug, title, content, structure_json
      FROM public.pages
      ORDER BY id
    `);

    console.log(`📄 ${pages.length} pages trouvées en base.\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const page of pages) {
      const label = `[${page.id}] ${page.slug} — "${page.title}"`;

      // Tenter de parser structure_json si c'est une string
      let currentStructure = page.structure_json;
      if (typeof currentStructure === 'string') {
        try {
          currentStructure = JSON.parse(currentStructure);
        } catch {
          currentStructure = null;
        }
      }

      // Si déjà au format Craft.js, skip
      if (isCraftJsStructure(currentStructure)) {
        console.log(`  ⏭️  ${label} — déjà au format Craft.js, skip`);
        skipped++;
        continue;
      }

      // Déterminer le contenu HTML à encapsuler
      let htmlContent = '';

      if (currentStructure && Array.isArray(currentStructure) && currentStructure.length > 0) {
        // Legacy builder: extraire le HTML de tous les blocs
        htmlContent = currentStructure
          .map(block => {
            if (block.content?.html) return block.content.html;
            if (block.content?.text) return `<p>${block.content.text}</p>`;
            if (block.content?.title) {
              let parts = [];
              if (block.content.title) parts.push(`<h2>${block.content.title}</h2>`);
              if (block.content.subtitle) parts.push(`<p>${block.content.subtitle}</p>`);
              if (block.content.text) parts.push(`<p>${block.content.text}</p>`);
              return parts.join('\n');
            }
            return '';
          })
          .filter(Boolean)
          .join('\n\n');
      }

      // Fallback: utiliser le champ `content` (HTML brut)
      if (!htmlContent && page.content) {
        htmlContent = page.content;
      }

      if (!htmlContent) {
        console.log(`  ⚠️  ${label} — pas de contenu à migrer (vide), skip`);
        skipped++;
        continue;
      }

      // Construire la structure Craft.js
      const craftStructure = buildCraftStructure(htmlContent);

      if (isDryRun) {
        console.log(`  ✅ ${label} — PRÊT (${htmlContent.length} chars de HTML)`);
        migrated++;
        continue;
      }

      // Écriture en base
      try {
        await client.query(`
          UPDATE public.pages
          SET structure_json = $1::jsonb,
              updated_at = NOW()
          WHERE id = $2
        `, [JSON.stringify(craftStructure), page.id]);

        console.log(`  ✅ ${label} — migré avec succès (${htmlContent.length} chars)`);
        migrated++;
      } catch (err) {
        console.error(`  ❌ ${label} — ERREUR:`, err.message);
        errors++;
      }
    }

    console.log('\n────────────────────────────────────────');
    console.log(`📊 Résultat: ${migrated} migrées | ${skipped} ignorées | ${errors} erreurs`);
    console.log('────────────────────────────────────────');

    if (isDryRun) {
      console.log('\n💡 Lancez sans --dry-run pour appliquer la migration.');
    }

  } catch (err) {
    console.error('❌ Erreur globale:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
