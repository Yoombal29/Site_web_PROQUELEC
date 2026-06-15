// Seed blog — categories + posts
'use strict';

const { getPool, closePool } = require('./seed-utils.cjs');

async function seed() {
  console.log('[seed] 📝 Blog...');

  // — Categories —
  const categories = [
    { name: 'Actualités', slug: 'actualites' },
    { name: 'Normes et Réglementation', slug: 'normes' },
    { name: 'Innovation', slug: 'innovation' },
    { name: 'Formation', slug: 'formation' },
    { name: 'Énergie', slug: 'energie' },
  ];

  for (const cat of categories) {
    await getPool().query(
      `INSERT INTO blog_categories (name) VALUES ($1) ON CONFLICT DO NOTHING`,
      [cat.name],
    );
  }
  console.log(`  ✅ ${categories.length} categories`);

  // Get category IDs
  const catResult = await getPool().query(`SELECT id, name FROM blog_categories`);
  const catMap = {};
  for (const row of catResult.rows) {
    catMap[row.name] = row.id;
  }

  // — Posts —
  const posts = [
    {
      title: 'Nouvelle norme NS 01-001 : ce qui change en 2026',
      slug: 'nouvelle-norme-nf-c15-100-2026',
      excerpt: 'Découvrez les principales évolutions de la norme électrique pour 2026.',
      content: '<p>La norme NS 01-001 évolue en 2026 avec plusieurs changements majeurs concernant la sécurité des installations électriques. Cette mise à jour introduit de nouvelles exigences pour les installations photovoltaïques, les bornes de recharge pour véhicules électriques, et renforce les dispositifs de protection différentielle.</p><p>Les professionnels du secteur doivent se familiariser avec ces évolutions pour garantir la conformité de leurs installations.</p>',
      category_name: 'Normes et Réglementation',
    },
    {
      title: 'Le solaire photovoltaïque au Sénégal : état des lieux 2026',
      slug: 'solaire-photovoltaique-senegal-2026',
      excerpt: 'Analyse du développement de l\'énergie solaire au Sénégal et perspectives.',
      content: '<p>Le Sénégal connaît une croissance significative de sa capacité solaire installée. Avec plusieurs centrales solaires en construction et un cadre réglementaire favorable, le pays s\'affirme comme un leader régional de l\'énergie solaire.</p><p>Cet article fait le point sur les projets en cours et les opportunités pour les professionnels du secteur.</p>',
      category_name: 'Énergie',
    },
    {
      title: 'Formations aux certifications électriques obligatoires',
      slug: 'formations-certifications-electriques-obligatoires',
      excerpt: 'Guide complet des certifications requises pour exercer le métier d\'électricien au Sénégal.',
      content: '<p>Pour exercer le métier d\'électricien au Sénégal, plusieurs certifications sont obligatoires : l\'habilitation électrique, la certification NS 01-001, et l\'attestation de capacité. Cet article détaille chaque certification et les formations associées.</p>',
      category_name: 'Formation',
    },
    {
      title: 'Innovations dans le diagnostic électrique intelligent',
      slug: 'innovations-diagnostic-electrique-intelligent',
      excerpt: 'Les nouvelles technologies transforment le diagnostic électrique.',
      content: '<p>L\'intelligence artificielle et l\'Internet des Objets (IoT) révolutionnent le diagnostic électrique. Des capteurs intelligents aux plateformes d\'analyse prédictive, découvrez comment ces innovations améliorent la sécurité et l\'efficacité des installations.</p>',
      category_name: 'Innovation',
    },
  ];

  for (const [i, post] of posts.entries()) {
    const catId = catMap[post.category_name];
    await getPool().query(
      `INSERT INTO blog_posts (title, slug, excerpt, content, category_id, published_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       ON CONFLICT DO NOTHING`,
      [post.title, post.slug, post.excerpt, post.content, catId, new Date(Date.now() - (posts.length - i) * 86400000)],
    );
  }
  console.log(`  ✅ ${posts.length} posts`);

  return true;
}

module.exports = { seed };
