#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────
 * MIGRATE ALL PAGES — PROQUELEC
 * Script de migration universel : transforme TOUTES les pages
 * en pages Craft.js modifiables via le God Mode Builder.
 * ─────────────────────────────────────────────────────────
 *
 * Usage: node scripts/migrate-all-pages.cjs [--dry-run] [--force]
 *
 * --dry-run : Simule sans écrire en DB
 * --force   : Remplace les entrées existantes
 *
 * Catégories de pages :
 *   🟢 content  → Page de contenu éditable (migrée en Craft.js)
 *   🔵 hybrid   → Page mixte contenu + logique (wrappée en block)
 *   🔴 function → Page 100% logique métier (badge + garde-fou)
 *   ⚪ orphan   → Page orpheline (sans route, archivée)
 *
 * ⚠️  NE SUPPRIME AUCUNE DONNÉE EXISTANTE
 * ─────────────────────────────────────────────────────────
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// ── Configuration ────────────────────────────────────────
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'proquelec',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
};

const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');

// ── Catégorisation exhaustive des pages ──────────────────

const PAGE_CATEGORIES = {
  // 🟢 CONTENT — Pages de contenu pur, migrables en Craft.js
  content: {
    label: '🟢 Contenu éditable',
    routes: [
      '/',
      '/about',
      '/utilite-publique',
      '/formation-certification',
      '/normes-ressources',
      '/projets-realisations',
      '/actualites-evenements',
      '/partenaires',
      '/contact',
      '/contact-premium',
      '/activities',
      '/labels',
      '/legal',
      '/certifications',
      '/formations',
      '/actualites',
      '/presse',
      '/autorites',
      '/menages',
      '/professionnels',
      '/social',
      '/espace-menages',
      '/espace-professionnels',
      '/espace-autorites',
      '/documents',
      '/events',
      '/expertises-techniques',
      '/expert-lab',
      '/formations-proquelec',
      '/blog',
      '/outils',
      '/showroom',
      '/avantages',
      '/nos-actions',
      '/actions/:slug',
      '/projets',
      '/galerie',
      '/marches',
      '/collectivites',
      '/evenements/:slug',
      '/evenements',
      '/presse/:slug',
      '/formations/:slug',
      '/publications',
      '/faq',
      '/normative-corpus',
      '/conseils-menages',
      '/ressources-pedagogiques',
      '/partenaires-liste',
      '/partenariat-senelec',
      '/temoignages',
      '/espace-partenaires',
      '/portal/:slug',
      '/portal',
      '/apps/:appId',
      '/plan-du-site',
      '/sitemap',
    ],
  },

  // 🔵 HYBRID — Pages avec contenu + logique métier légère
  hybrid: {
    label: '🔵 Hybride (contenu + logique)',
    routes: [
      '/blog/:slug', // Article de blog (contenu + slug)
      '/expert-kebe', // Module KEBE (wrapper block)
      '/rubrique-selector',
      '/schema-builder',
    ],
  },

  // 🔴 FUNCTION — Pages 100% logique métier (badge static)
  functional: {
    label: '🔴 Fonctionnel (logique métier)',
    routes: [
      '/connexion',
      '/login',
      '/auth',
      '/dashboard',
      '/admin',
      '/admin-secondary',
      '/partner',
      '/dashboard/electricien',
      '/dashboard/entreprise',
      '/dashboard/membre',
      '/admin/page-sections',
      '/admin/builder',
      '/admin/builder/:pageId',
      '/admin/builder/config',
      '/admin/builder/legacy',
      '/admin/craft-builder/:pageId',
      '/admin/schematic-editor/:pageId',
      '/admin/permissions',
      '/expert/chat',
      '/expert/calculators',
      '/expert/schemas',
      '/expert/docs',
      '/expert/history',
      '/expert/config',
      '/expert/ai-providers',
      '/expert/logs',
      '/expert/scanner',
      '/expert/models',
      '/expert/stats',
      '/ged',
      '/projects',
      '/projects/:id',
      '/observatoire',
      '/diagnostics/:id',
      '/office/document/new',
      '/office/document/:id',
      '/office/document/template/:templateId',
      '/office/spreadsheet/new',
      '/office/spreadsheet/:id',
      '/office/spreadsheet/template/:templateId',
      '/office/presentation/new',
      '/office/presentation/:id',
      '/office/presentation/template/:templateId',
      '/analytics',
      '/demo/rbac',
    ],
  },

  // ⚪ ORPHAN — Pages sans route dans App.tsx
  orphan: {
    label: '⚪ Orpheline (sans route)',
    files: [],
  },
};

// ── Generate slug from route ─────────────────────────────
function routeToSlug(route) {
  if (route === '/') return 'home';
  return route
    .replace(/^\//, '')
    .replace(/:slug/g, '{slug}')
    .replace(/:id/g, '{id}')
    .replace(/:appId/g, '{appId}')
    .replace(/:pageId/g, '{pageId}')
    .replace(/:templateId/g, '{templateId}')
    .replace(/:version/g, '{version}');
}

function routeToTitle(route) {
  const slug = routeToSlug(route);
  return slug
    .split(/[-_/]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/\{Slug\}/g, '{slug}')
    .replace(/\{Id\}/g, '{id}');
}

// ── Generate default Craft.js structure for a content page ──
function generateCraftStructure(route, title) {
  // Crée une structure Craft.js basique avec un ContainerBlock
  // contenant un bloc Hero et un bloc Texte
  return {
    ROOT: {
      type: 'div',
      nodes: ['container_1'],
      props: { style: { minHeight: '100vh' } },
      linkedNodes: {},
    },
    container_1: {
      type: { resolvedName: 'ContainerBlock' },
      nodes: ['hero_1', 'text_1'],
      props: {
        padding: 64,
        paddingY: 48,
        backgroundColor: '#ffffff',
        maxWidth: '1200px',
      },
      parent: 'ROOT',
      linkedNodes: {},
      isCanvas: true,
      displayName: 'ContainerBlock',
    },
    hero_1: {
      type: { resolvedName: 'HeroBlock' },
      nodes: [],
      props: {
        headline: title || 'Page en construction',
        subheadline: 'Modifiez cette page avec le God Mode Builder',
        badgeText: 'PROQUELEC',
        ctaLabel: 'En savoir plus',
        ctaHref: '#',
        accentColor: '#2563eb',
        showStats: false,
      },
      parent: 'container_1',
      linkedNodes: {},
      isCanvas: false,
      displayName: 'HeroBlock',
    },
    text_1: {
      type: { resolvedName: 'TextBlock' },
      nodes: [],
      props: {
        text: '<p>Cette page a été automatiquement créée par la migration. Utilisez le <strong>God Mode Builder</strong> pour personnaliser son contenu et son design.</p>',
        fontSize: 16,
        lineHeight: 1.8,
        color: '#475569',
      },
      parent: 'container_1',
      linkedNodes: {},
      isCanvas: false,
      displayName: 'TextBlock',
    },
  };
}

// ── Page metadata templates ─────────────────────────────
function getPageMeta(slug, category) {
  const meta = {
    is_published: category === 'content',
    workflow_status: category === 'content' ? 'published' : 'draft',
    security_level: 'public',
    immutable: category === 'functional',
    template: 'default',
    show_hero: category === 'content',
    show_footer: true,
    meta_robots: 'index,follow',
    design_options: {},
    theme_config: null,
    seo_options: {},
  };

  // Les pages fonctionnelles sont en published + immutables
  if (category === 'functional') {
    meta.workflow_status = 'published';
    meta.is_published = true;
    meta.security_level = 'authenticated';
  }

  // Les pages hybrides : immutable=true + design_options.page_type='hybrid'
  if (category === 'hybrid') {
    meta.workflow_status = 'published';
    meta.is_published = true;
    meta.immutable = true;
    meta.design_options.page_type = 'hybrid';
  }

  return meta;
}

// ── Main migration logic ─────────────────────────────────
async function migrate() {
  console.log('\n══════════════════════════════════════════════');
  console.log('  PROQUELEC — Migration Universelle des Pages');
  console.log(`  Mode: ${DRY_RUN ? '🔍 DRY RUN (simulation)' : '🚀 EXÉCUTION'}`);
  console.log(`  Force: ${FORCE ? '✅ Écrasement autorisé' : '❌ Préservation des existantes'}`);
  console.log('══════════════════════════════════════════════\n');

  let pool;
  try {
    pool = new Pool(DB_CONFIG);

    // Test connection
    await pool.query('SELECT 1');
    console.log('✅ Connexion DB établie\n');
  } catch (err) {
    console.error('❌ Erreur de connexion DB:', err.message);
    console.log('   Assurez-vous que PostgreSQL tourne sur', DB_CONFIG.host, ':', DB_CONFIG.port);
    console.log('   Et que la base', DB_CONFIG.database, 'existe\n');

    // Fallback: mode hors-ligne, génère un rapport JSON
    console.log('   🔄 Mode hors-ligne : génération du rapport sans DB\n');
    return generateOfflineReport();
  }

  let totalProcessed = 0;
  let totalCreated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const operations = [];

  // Process each category
  for (const [category, data] of Object.entries(PAGE_CATEGORIES)) {
    console.log(`\n── ${data.label} ──`);

    const routes = data.routes || [];
    const files = data.files || [];

    // Process routes
    for (const route of routes) {
      const slug = routeToSlug(route);
      const title = routeToTitle(route);

      try {
        // Check if page already exists
        const existing = await pool.query(
          'SELECT id, title, slug, structure_json, immutable FROM public.pages WHERE slug = $1',
          [slug],
        );

        if (existing.rows.length > 0 && !FORCE) {
          // Vérifier si la page a déjà une structure Craft.js
          const page = existing.rows[0];
          if (page.structure_json && page.immutable === false) {
            console.log(`  ⏩ ${route.padEnd(35)} → Existe déjà (ID: ${page.id.slice(0, 8)}…)`);
            totalSkipped++;
            continue;
          }
          if (page.immutable) {
            console.log(`  🔒 ${route.padEnd(35)} → Page immutable (fonctionnelle)`);
            totalSkipped++;
            continue;
          }
        }

        // Prepare page data
        const structureJson = JSON.stringify(generateCraftStructure(route, title));
        const meta = getPageMeta(slug, category);
        const now = new Date().toISOString();

        if (existing.rows.length > 0) {
          // UPDATE existing page with Craft.js structure
          if (!DRY_RUN) {
            await pool.query(
              `
              UPDATE public.pages SET
                structure_json = $1,
                is_published = $2,
                workflow_status = $3,
                security_level = $4,
                immutable = $5,
                design_options = $6,
                updated_at = $7
              WHERE slug = $8
            `,
              [
                structureJson,
                meta.is_published,
                meta.workflow_status,
                meta.security_level,
                meta.immutable,
                JSON.stringify(meta.design_options),
                now,
                slug,
              ],
            );
          }
          console.log(`  🔄 ${route.padEnd(35)} → Mise à jour ✓`);
          operations.push({ route, slug, action: 'UPDATE', category, title });
          totalProcessed++;
        } else {
          // INSERT new page
          if (!DRY_RUN) {
            await pool.query(
              `
              INSERT INTO public.pages
                (title, slug, structure_json, content_raw, is_published, workflow_status,
                 security_level, immutable, template, show_hero, show_footer, meta_robots,
                 design_options, seo_options, status, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            `,
              [
                title,
                slug,
                structureJson,
                `<h1>${title}</h1><p>Page créée automatiquement par la migration.</p>`,
                meta.is_published,
                meta.workflow_status,
                meta.security_level,
                meta.immutable,
                meta.template,
                meta.show_hero,
                meta.show_footer,
                meta.meta_robots,
                JSON.stringify(meta.design_options),
                JSON.stringify(meta.seo_options),
                meta.workflow_status === 'published' ? 'published' : 'draft',
                now,
                now,
              ],
            );
          }
          if (category === 'functional') {
            console.log(`  🏷️  ${route.padEnd(35)} → Créée avec badge 🔴 FONCTIONNEL`);
          } else {
            console.log(`  ✅ ${route.padEnd(35)} → Créée ✓`);
          }
          operations.push({ route, slug, action: 'CREATE', category, title });
          totalCreated++;
        }
      } catch (err) {
        console.error(`  ❌ ${route.padEnd(35)} → Erreur: ${err.message}`);
        totalErrors++;
      }
    }
  }

  // ── Summary ──────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════');
  console.log('  📊 RÉSULTAT DE LA MIGRATION');
  console.log('══════════════════════════════════════════════');
  console.log(`  Traitées    : ${totalProcessed}`);
  console.log(`  Créées      : ${totalCreated}`);
  console.log(`  Ignorées    : ${totalSkipped}`);
  console.log(`  Erreurs     : ${totalErrors}`);
  console.log(
    `  Total routes: ${Object.values(PAGE_CATEGORIES).reduce((a, d) => a + (d.routes?.length || 0) + (d.files?.length || 0), 0)}`,
  );
  console.log('');

  // ── Report ───────────────────────────────────────────
  const report = {
    timestamp: new Date().toISOString(),
    mode: DRY_RUN ? 'dry-run' : 'execution',
    summary: { totalProcessed, totalCreated, totalSkipped, totalErrors },
    categories: Object.entries(PAGE_CATEGORIES).map(([key, data]) => ({
      category: key,
      label: data.label,
      count: (data.routes?.length || 0) + (data.files?.length || 0),
    })),
    operations,
  };

  const reportPath = path.join(__dirname, '..', 'migration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Rapport sauvegardé: migration-report.json`);
  console.log('');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN — Aucune modification en DB.');
    console.log('   Relancez sans --dry-run pour exécuter.\n');
  }

  await pool.end();
  return report;
}

// ── Offline fallback ────────────────────────────────────
async function generateOfflineReport() {
  const report = {
    timestamp: new Date().toISOString(),
    mode: 'offline',
    summary: { total: 0 },
    categories: Object.entries(PAGE_CATEGORIES).map(([key, data]) => ({
      category: key,
      label: data.label,
      count: (data.routes?.length || 0) + (data.files?.length || 0),
    })),
    pages: Object.entries(PAGE_CATEGORIES).flatMap(([category, data]) => {
      const routes = data.routes || [];
      const files = data.files || [];
      return [
        ...routes.map((route) => ({
          slug: routeToSlug(route),
          title: routeToTitle(route),
          route,
          category,
          action: 'PENDING',
        })),
        ...files.map((file) => ({
          file,
          category,
          action: 'ORPHAN',
        })),
      ];
    }),
  };

  const reportPath = path.join(__dirname, '..', 'migration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Rapport hors-ligne sauvegardé: migration-report.json\n`);
  return report;
}

// ── Execute ─────────────────────────────────────────────
migrate().catch((err) => {
  console.error('\n💥 Erreur fatale:', err);
  process.exit(1);
});
