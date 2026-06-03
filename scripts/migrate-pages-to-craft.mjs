#!/usr/bin/env node
/**
 * migrate-pages-to-craft.mjs
 * ─────────────────────────────
 * Script de migration : insère les pages de contenu marketing dans la table `pages`
 * avec une structure Craft.js par défaut, et marque les pages fonctionnelles
 * comme immutables.
 *
 * Usage :
 *   node scripts/migrate-pages-to-craft.mjs
 *
 * Caractéristiques :
 *   - Idempotent (peut être relancé sans risque)
 *   - Préserve les pages existantes (ON CONFLICT DO NOTHING)
 *   - Génère une structure Craft.js par défaut pour chaque slug de contenu
 *   - Marque les slugs fonctionnels comme immutables
 *   - Logs détaillés de ce qui a été créé / ignoré
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ─────────────────────────────────────────────
// 1. CHARGEMENT DE LA CONFIG
// ─────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));

// Tente .env à la racine du projet
dotenv.config({ path: resolve(__dirname, '..', '.env') });
// Fallback : .env.local
dotenv.config({ path: resolve(__dirname, '..', '.env.local') });

const { Pool } = pg;

// URL de connexion : DATABASE_URL ou fallback
const DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DATABASE_URL ||
  'postgres://postgres:proquelec_secure_db_pass@localhost:5437/proquelec';

// ─────────────────────────────────────────────
// 2. LISTE DES SLUGS
// ─────────────────────────────────────────────

/**
 * Slugs « contenu » (pages marketing modifiables via le Builder).
 * Chaque entrée reçoit une structure Craft.js par défaut.
 */
const CONTENT_SLUGS = [
  { slug: 'home',                     title: 'Accueil',                  template: 'home' },
  { slug: 'about',                    title: 'À propos',                template: 'content' },
  { slug: 'utilite-publique',         title: 'Utilité Publique',        template: 'content' },
  { slug: 'formation-certification',  title: 'Formation & Certification', template: 'content' },
  { slug: 'normes-ressources',        title: 'Normes & Ressources',     template: 'content' },
  { slug: 'projets-realisations',     title: 'Projets & Réalisations',  template: 'gallery' },
  { slug: 'actualites-evenements',    title: 'Actualités & Événements', template: 'content' },
  { slug: 'partenaires',              title: 'Partenaires',             template: 'content' },
  { slug: 'contact',                  title: 'Contact',                 template: 'contact' },
  { slug: 'contact-premium',          title: 'Contact Premium',         template: 'contact' },
  { slug: 'activities',               title: 'Activités',               template: 'content' },
  { slug: 'labels',                   title: 'Labels',                  template: 'content' },
  { slug: 'legal',                    title: 'Mentions Légales',        template: 'content' },
  { slug: 'certifications',           title: 'Certifications',          template: 'content' },
  { slug: 'formations',               title: 'Formations',              template: 'content' },
  { slug: 'actualites',               title: 'Actualités',              template: 'content' },
  { slug: 'presse',                   title: 'Presse',                  template: 'content' },
  { slug: 'autorites',                title: 'Autorités',               template: 'content' },
  { slug: 'menages',                  title: 'Ménages',                 template: 'content' },
  { slug: 'professionnels',           title: 'Professionnels',          template: 'content' },
  { slug: 'social',                   title: 'Social',                  template: 'content' },
  { slug: 'espace-menages',           title: 'Espace Ménages',          template: 'content' },
  { slug: 'espace-professionnels',    title: 'Espace Professionnels',   template: 'content' },
  { slug: 'espace-autorites',         title: 'Espace Autorités',        template: 'content' },
  { slug: 'documents',                title: 'Documents',               template: 'content' },
  { slug: 'events',                   title: 'Événements',              template: 'content' },
  { slug: 'expertises-techniques',    title: 'Expertises Techniques',   template: 'content' },
  { slug: 'expert-lab',               title: 'Expert Lab',              template: 'content' },
  { slug: 'formations-proquelec',     title: 'Formations PROQUELEC',    template: 'content' },
  { slug: 'blog',                     title: 'Blog',                    template: 'content' },
  { slug: 'outils',                   title: 'Outils',                  template: 'tools' },
  { slug: 'showroom',                 title: 'Showroom',                template: 'gallery' },
  { slug: 'avantages',                title: 'Avantages',               template: 'content' },
  { slug: 'nos-actions',              title: 'Nos Actions',             template: 'content' },
  { slug: 'projets',                  title: 'Projets',                 template: 'gallery' },
  { slug: 'galerie',                  title: 'Galerie',                 template: 'gallery' },
  { slug: 'marches',                  title: 'Marchés',                 template: 'content' },
  { slug: 'collectivites',            title: 'Collectivités',           template: 'content' },
  { slug: 'publications',             title: 'Publications',            template: 'content' },
  { slug: 'faq',                      title: 'FAQ',                     template: 'content' },
  { slug: 'normative-corpus',         title: 'Corpus Normatif',         template: 'content' },
  { slug: 'conseils-menages',         title: 'Conseils Ménages',        template: 'content' },
  { slug: 'ressources-pedagogiques',  title: 'Ressources Pédagogiques', template: 'content' },
  { slug: 'partenaires-liste',        title: 'Liste des Partenaires',   template: 'content' },
  { slug: 'partenariat-senelec',      title: 'Partenariat SENELEC',     template: 'content' },
  { slug: 'temoignages',              title: 'Témoignages',             template: 'content' },
  { slug: 'espace-partenaires',       title: 'Espace Partenaires',      template: 'content' },
  { slug: 'plan-du-site',             title: 'Plan du site',            template: 'content' },
  { slug: 'sitemap',                  title: 'Sitemap',                 template: 'content' },
];

/**
 * Slugs « fonctionnels » (pages système, routes auth, dashboard, etc.).
 * Ces pages sont marquées `immutable = true` et ne reçoivent pas
 * de structure Craft.js.
 */
const FUNCTIONAL_SLUGS = [
  'connexion', 'login', 'auth', 'dashboard',
  'admin', 'rubrique-selector', 'schema-builder',
  'ged', 'expert-kebe', 'observatoire',
  'projects', 'diagnostics',
  'office', 'analytics', 'demo',
  'expert', 'apps', 'portal',
];

// ─────────────────────────────────────────────
// 3. GÉNÉRATEUR DE STRUCTURE CRAFT.JS
// ─────────────────────────────────────────────

/**
 * Génère une structure Craft.js par défaut pour une page de contenu.
 * Produit un graphe contenant un ContainerBlock racine avec un HeroBlock
 * et un bloc de contenu (HeadingBlock + TextBlock).
 *
 * @param {string} template  - Type de template (home, content, gallery, contact, tools)
 * @param {string} title     - Titre lisible de la page
 * @returns {string} JSON string de la structure Craft.js
 */
function generateDefaultStructure(template, title) {
  const ROOT = {
    type: 'ContainerBlock',
    props: {
      maxWidth: '1200px',
      padding: 32,
      backgroundColor: '#ffffff',
    },
    nodes: [],
  };

  // Hero section — adapte le texte selon le template
  const heroSubheadline =
    template === 'home'
      ? 'PROQUELEC – Sécurité, Qualité, Formation'
      : template === 'contact'
        ? 'Contactez-nous pour toute information'
        : template === 'gallery'
          ? 'Découvrez nos réalisations'
          : template === 'tools'
            ? 'Outils et ressources à votre disposition'
            : `Bienvenue sur la page ${title}`;

  const heroNode = {
    type: 'HeroBlock',
    props: {
      headline: title,
      subheadline: heroSubheadline,
      badgeText: 'PROQUELEC',
      accentColor: '#2563eb',
      showStats: false,
      autoplayInterval: 5000,
    },
    nodes: [],
  };

  // Contenu principal
  const containerContent = {
    type: 'ContainerBlock',
    props: { padding: 32, maxWidth: '900px', backgroundColor: 'transparent' },
    nodes: [
      {
        type: 'HeadingBlock',
        props: {
          text: `Contenu de la page ${title}`,
          level: 'h2',
          fontSize: '2rem',
          textAlign: 'left',
          color: '#1e293b',
        },
        nodes: [],
      },
      {
        type: 'TextBlock',
        props: {
          text: 'Cette page est en cours de configuration. Utilisez le God Mode Builder pour personnaliser son contenu.',
          fontSize: '1.125rem',
          textAlign: 'left',
          color: '#64748b',
        },
        nodes: [],
      },
    ],
  };

  ROOT.nodes = [heroNode, containerContent];

  return JSON.stringify({ ROOT });
}

// ─────────────────────────────────────────────
// 4. MIGRATION
// ─────────────────────────────────────────────

async function migrate() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();

  const startedAt = Date.now();

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     MIGRATION — Pages vers Craft.js                        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  try {
    // ── Étape 1 : Vérifier que la table `pages` existe ──
    const { rows: tableCheck } = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'pages'
      ) AS exists
    `);

    if (!tableCheck[0].exists) {
      console.error('❌ La table "public.pages" n\'existe pas dans la base de données.');
      console.error('   Exécutez d\'abord le script SQL de création de la table.');
      await client.rollback?.();
      return;
    }
    console.log('✅ Table "public.pages" trouvée.\n');

    // ── Étape 2 : Compter les pages existantes avant ──
    const { rows: countBefore } = await client.query(
      "SELECT COUNT(*)::int AS total FROM public.pages"
    );
    console.log(`📊 Pages en base avant migration : ${countBefore[0].total}\n`);

    // ── Étape 3 : Insérer les pages de contenu ──
    console.log('── Pages de contenu (marketing) ────────────────────────────');

    let contentInserted = 0;
    let contentSkipped = 0;
    let contentErrors = 0;

    for (const page of CONTENT_SLUGS) {
      const structure = generateDefaultStructure(page.template, page.title);

      try {
        const result = await client.query(
          `
          INSERT INTO public.pages (title, slug, structure_json, template, is_published, status, immutable)
          VALUES ($1, $2, $3::jsonb, $4, true, 'published', false)
          ON CONFLICT (slug) DO NOTHING
          `,
          [
            page.title,
            page.slug,
            structure,
            page.template,
          ]
        );

        if (result.rowCount && result.rowCount > 0) {
          console.log(`  ✅ [content]  ${page.slug.padEnd(28)} → "${page.title}"`);
          contentInserted++;
        } else {
          console.log(`  ⏭️  [content]  ${page.slug.padEnd(28)} → existe déjà, ignoré`);
          contentSkipped++;
        }
      } catch (err) {
        console.error(`  ❌ [content]  ${page.slug} — ERREUR : ${err.message}`);
        contentErrors++;
      }
    }

    // ── Étape 4 : Insérer / marquer les pages fonctionnelles ──
    console.log('\n── Pages fonctionnelles (immutables) ───────────────────────');

    let funcInserted = 0;
    let funcUpdated = 0;
    let funcSkipped = 0;
    let funcErrors = 0;

    for (const slug of FUNCTIONAL_SLUGS) {
      try {
        // Essaie d'abord d'insérer (si la page n'existe pas)
        const insertResult = await client.query(
          `
          INSERT INTO public.pages (title, slug, is_published, status, immutable)
          VALUES ($1, $2, false, 'draft', true)
          ON CONFLICT (slug) DO NOTHING
          `,
          [slug.charAt(0).toUpperCase() + slug.slice(1), slug]
        );

        if (insertResult.rowCount && insertResult.rowCount > 0) {
          console.log(`  ✅ [fonction] ${slug.padEnd(28)} → créée avec immutable = true`);
          funcInserted++;
        } else {
          // La page existe déjà → s'assurer qu'elle est bien immutable
          const updateResult = await client.query(
            `
            UPDATE public.pages
            SET immutable = true
            WHERE slug = $1 AND immutable = false
            `,
            [slug]
          );

          if (updateResult.rowCount && updateResult.rowCount > 0) {
            console.log(`  🔒 [fonction] ${slug.padEnd(28)} → mise à jour : immutable = true`);
            funcUpdated++;
          } else {
            console.log(`  ⏭️  [fonction] ${slug.padEnd(28)} → déjà présente et immutable`);
            funcSkipped++;
          }
        }
      } catch (err) {
        console.error(`  ❌ [fonction] ${slug} — ERREUR : ${err.message}`);
        funcErrors++;
      }
    }

    // ── Bilan final ──
    const { rows: countAfter } = await client.query(
      "SELECT COUNT(*)::int AS total FROM public.pages"
    );
    const { rows: immutableCount } = await client.query(
      "SELECT COUNT(*)::int AS total FROM public.pages WHERE immutable = true"
    );
    const { rows: contentCount } = await client.query(
      "SELECT COUNT(*)::int AS total FROM public.pages WHERE immutable = false"
    );

    const duration = ((Date.now() - startedAt) / 1000).toFixed(2);

    console.log('\n══════════════════════════════════════════════════════════════');
    console.log('  📊  RAPPORT FINAL');
    console.log('────────────────────────────────────────────────────────────');
    console.log(`  Pages totales après migration    : ${countAfter[0].total}`);
    console.log(`  Pages de contenu (modifiables)   : ${contentCount[0].total}`);
    console.log(`  Pages immutables (fonctionnelles) : ${immutableCount[0].total}`);
    console.log('');
    console.log(`  Pages de contenu créées          : ${contentInserted}`);
    console.log(`  Pages de contenu déjà existantes : ${contentSkipped}`);
    console.log(`  Erreurs (contenu)                : ${contentErrors}`);
    console.log('');
    console.log(`  Pages fonctionnelles créées      : ${funcInserted}`);
    console.log(`  Pages fonctionnelles mises à jour : ${funcUpdated}`);
    console.log(`  Pages fonctionnelles déjà ok     : ${funcSkipped}`);
    console.log(`  Erreurs (fonctionnelles)         : ${funcErrors}`);
    console.log('────────────────────────────────────────────────────────────');
    console.log(`  ⏱️  Durée : ${duration}s`);
    console.log('══════════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n❌ Erreur globale lors de la migration :', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
