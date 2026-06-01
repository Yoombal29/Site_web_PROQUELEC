// Seed academy — professional_training, electrical_standards
'use strict';

const { upsert, getPool, closePool } = require('./seed-utils.cjs');

async function seed() {
  console.log('[seed] 🎓 Academy...');

  // ── Professional Training ──
  const trainings = [
    { title: 'CAP Électricien', level: 'CAP', duration: '400 heures', price: 0, description: 'Formation initiale aux métiers de l\'électricité — préparatoire au métier d\'électricien bâtiment.' },
    { title: 'BTS Électrotechnique', level: 'BTS', duration: '1 200 heures', price: 0, description: 'Formation avancée en électrotechnique — conception et maintenance des systèmes électriques.' },
    { title: 'Installateur Solaire Photovoltaïque', level: 'Certification', duration: '80 heures', price: 250000, description: 'Formation spécialisée en installation de panneaux solaires et systèmes photovoltaïques.' },
    { title: 'Maintenance Électrique Industrielle', level: 'Certification', duration: '120 heures', price: 350000, description: 'Maintenance et dépannage des installations électriques industrielles.' },
    { title: 'Normes NF C 15-100', level: 'Certification', duration: '40 heures', price: 150000, description: 'Maîtrise complète des normes électriques en vigueur pour les installations basse tension.' },
    { title: 'Habilitation Électrique B1/B2', level: 'Certification', duration: '35 heures', price: 180000, description: 'Habilitation électrique pour opérateurs et techniciens — recommandé pour tous les électriciens.' },
  ];

  for (const t of trainings) {
    await getPool().query(
      `INSERT INTO professional_training (title, level, duration, price, description, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       ON CONFLICT DO NOTHING`,
      [t.title, t.level, t.duration, t.price, t.description],
    );
  }
  console.log(`  ✅ ${trainings.length} training programs`);

  // ── Electrical Standards ──
  const standards = [
    { code: 'NF C 15-100', title: 'Installations électriques basse tension', category: 'norme', description: 'Installations électriques basse tension — norme fondamentale pour tous les bâtiments', version: '2026' },
    { code: 'NF C 14-100', title: 'Installations de branchement', category: 'norme', description: 'Installations de branchement raccordement au réseau public', version: '2025' },
    { code: 'UTE C 15-712', title: 'Installations photovoltaïques', category: 'guide', description: 'Guide pratique pour les installations photovoltaïques raccordées au réseau', version: '2024' },
    { code: 'NF EN 62305', title: 'Protection contre la foudre', category: 'norme', description: 'Protection des structures et des personnes contre la foudre', version: '2023' },
    { code: 'NF C 13-200', title: 'Installations haute tension', category: 'norme', description: 'Installations électriques à haute tension — règles de conception et de sécurité', version: '2024' },
    { code: 'NF C 17-200', title: 'Alarmes et détection incendie', category: 'norme', description: 'Systèmes de détection et d\'alarme incendie — conception et installation', version: '2023' },
    { code: 'NS 01-001', title: 'Norme sénégalaise pour installations électriques', category: 'norme', description: 'Norme nationale sénégalaise pour les installations électriques basse tension', version: '2025' },
  ];

  for (const s of standards) {
    await getPool().query(
      `INSERT INTO electrical_standards (code, title, category, description, version, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       ON CONFLICT DO NOTHING`,
      [s.code, s.title, s.category, s.description, s.version],
    );
  }
  console.log(`  ✅ ${standards.length} standards`);

  return true;
}

module.exports = { seed };
