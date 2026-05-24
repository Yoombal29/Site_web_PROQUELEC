/**
 * seedHomepage.js
 * 
 * Script qui initialise la structure JSON de la page d'accueil dans la base de données
 * pour qu'elle soit directement éditable dans le BE Builder.
 * 
 * Architecture: BE Builder → JSON → ComponentRegistry → Composants originaux
 * 
 * Usage (depuis le serveur):
 *   node server/seedHomepage.js
 * 
 * Ou via l'API:
 *   POST /api/admin/seed-homepage  (réservé aux admins)
 */

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ─────────────────────────────────────────────────────────────────────────────
// Structure de la page d'accueil — PIXEL PERFECT
// Chaque bloc correspond à un composant React original.
// L'ordre ici = l'ordre affiché à l'écran.
// ─────────────────────────────────────────────────────────────────────────────
const HOMEPAGE_STRUCTURE = [
  {
    id: "home-hero-banner",
    type: "HeroBanner",
    version: 1,
    enabled: true,
    props: {
      parallax: true,
      autoplayInterval: 8000
    },
    metadata: {
      label: "Carrousel Hero (Accueil)",
      description: "Slides chargés depuis la base de données. Gérez les slides via l'onglet Accueil du dashboard."
    }
  },
  {
    id: "home-audience-offers",
    type: "AudienceOffers",
    version: 1,
    enabled: true,
    props: {},
    metadata: {
      label: "Offres Audience",
      description: "3 cartes — Électriciens, Professionnels, Membres. Textes configurables dans Réglages du site."
    }
  },
  {
    id: "home-vision-mission",
    type: "VisionMission",
    version: 1,
    enabled: true,
    props: {
      title: "Garantir la sécurité pour tous les sénégalais.",
      subtitle: "Depuis 1995, PROQUELEC s'engage pour la promotion de la qualité des installations électriques.",
      missionTitle: "Notre Mission",
      missionDesc: "Promouvoir la sécurité et la conformité normative à travers la sensibilisation, le diagnostic et la formation.",
      visionTitle: "Notre Vision",
      visionDesc: "Devenir la référence nationale absolue en matière de sécurité électrique et d'innovation normative.",
      image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
      badge: "L'Institution"
    },
    metadata: {
      label: "Vision & Mission",
      description: "Section bicolonne image + texte. Props modifiables directement dans le Builder."
    }
  },
  {
    id: "home-landing-stats",
    type: "LandingStats",
    version: 1,
    enabled: true,
    props: {},
    metadata: {
      label: "Statistiques Clés",
      description: "Statistiques chargées depuis la base de données. Gérez les chiffres via le dashboard."
    }
  },
  {
    id: "home-latest-news",
    type: "LatestNews",
    version: 1,
    enabled: true,
    props: {},
    metadata: {
      label: "Actualités & Blog",
      description: "Derniers articles de blog publiés. Gérez les articles via l'onglet Blog du dashboard."
    }
  },
  {
    id: "home-partner-logos",
    type: "PartnerLogos",
    version: 1,
    enabled: true,
    props: {},
    metadata: {
      label: "Logos Partenaires",
      description: "Carousel des partenaires. Gérez les logos via l'onglet Partenaires du dashboard."
    }
  }
];

async function seedHomepage() {
  const client = await pool.connect();
  try {
    console.log('[Seed] Démarrage du seed de la page d\'accueil...');

    // 1. Chercher la page home existante
    const findResult = await client.query(
      `SELECT id, title, slug, structure_json FROM pages WHERE slug IN ('home', 'home_page', '/') ORDER BY id LIMIT 1`
    );

    const structureJson = JSON.stringify(HOMEPAGE_STRUCTURE);

    if (findResult.rows.length > 0) {
      // 2a. Mettre à jour la page existante
      const existingPage = findResult.rows[0];
      await client.query(
        `UPDATE pages SET structure_json = $1, updated_at = NOW() WHERE id = $2`,
        [structureJson, existingPage.id]
      );
      console.log(`[Seed] ✅ Page d'accueil mise à jour (id=${existingPage.id}, slug="${existingPage.slug}")`);
      return { success: true, action: 'updated', pageId: existingPage.id, slug: existingPage.slug };
    } else {
      // 2b. Créer une nouvelle page d'accueil
      const insertResult = await client.query(
        `INSERT INTO pages (title, slug, structure_json, is_published, status, created_at, updated_at)
         VALUES ($1, $2, $3, true, 'published', NOW(), NOW())
         RETURNING id, slug`,
        ['Accueil', 'home', structureJson]
      );
      const newPage = insertResult.rows[0];
      console.log(`[Seed] ✅ Page d'accueil créée (id=${newPage.id}, slug="${newPage.slug}")`);
      return { success: true, action: 'created', pageId: newPage.id, slug: newPage.slug };
    }
  } catch (err) {
    console.error('[Seed] ❌ Erreur:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// Si exécuté directement
if (require.main === module) {
  seedHomepage()
    .then((result) => {
      console.log('[Seed] Terminé:', result);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Échec:', err);
      process.exit(1);
    });
}

module.exports = { seedHomepage, HOMEPAGE_STRUCTURE };
