// Seed settings — site_settings, theme_settings, site_config, menu_items, partners
'use strict';

const { upsert, getPool, closePool } = require('./seed-utils.cjs');

async function seed() {
  console.log('[seed] ⚙️  Settings...');

  // ── Site Settings ──
  await getPool().query(`
    INSERT INTO site_settings (site_name, slogan, phone_number, facebook_url, linkedin_url, twitter_url, copyright_text)
    VALUES ('PROQUELEC Sénégal', 'Sécurité · Qualité · Formation', '+221 33 800 00 00',
            'https://facebook.com/proquelec', 'https://linkedin.com/company/proquelec', 'https://twitter.com/proquelec',
            '© ${new Date().getFullYear()} PROQUELEC Sénégal. Tous droits réservés.')
    ON CONFLICT DO NOTHING
  `);
  console.log('  ✅ Site settings');

  // ── Theme Settings ──
  await getPool().query(`
    INSERT INTO theme_settings (primary_color, secondary_color, accent_color, background_color, text_color, font_family)
    VALUES ('#1e3a8a', '#f59e0b', '#06b6d4', '#f8fafc', '#1e293b', 'Inter, sans-serif')
    ON CONFLICT DO NOTHING
  `);
  console.log('  ✅ Theme settings');

  // ── Site Config ──
  await upsert('site_config', {
    id: 'default',
    schema: JSON.stringify({
      site_name: 'PROQUELEC Sénégal',
      site_url: 'https://proquelec.sn',
      contact_email: 'contact@proquelec.sn',
      contact_phone: '+221 33 800 00 00',
      address: 'Dakar, Sénégal',
      languages: ['fr', 'en', 'wo'],
      default_language: 'fr',
      timezone: 'Africa/Dakar',
      currency: 'XOF',
    }),
    updated_at: new Date(),
  }, 'id');
  console.log('  ✅ Site config');

  // ── Menu Items ──
  const menuEntries = [
    { title: 'Accueil', url: '/', menu_order: 0, menu_type: 'main' },
    { title: 'Nos Services', url: '/services', menu_order: 1, menu_type: 'main' },
    { title: 'Blog', url: '/blog', menu_order: 2, menu_type: 'main' },
    { title: 'Formation', url: '/formation', menu_order: 3, menu_type: 'main' },
    { title: 'Observatoire', url: '/observatoire', menu_order: 4, menu_type: 'main' },
    { title: 'Contact', url: '/contact', menu_order: 5, menu_type: 'main' },
    { title: 'À Propos', url: '/a-propos', menu_order: 6, menu_type: 'main' },
  ];

  for (const item of menuEntries) {
    await getPool().query(
      `INSERT INTO menu_items (title, url, menu_order, menu_type, is_active)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT DO NOTHING`,
      [item.title, item.url, item.menu_order, item.menu_type],
    );
  }
  console.log(`  ✅ ${menuEntries.length} menu items`);

  // ── Partners ──
  const partners = [
    { name: 'Ministère de l\'Énergie', logo_url: '/images/partners/energie.png', category: 'institution', display_order: 0 },
    { name: 'ASN', logo_url: '/images/partners/asn.png', category: 'institution', display_order: 1 },
    { name: 'SENELEC', logo_url: '/images/partners/senelec.png', category: 'entreprise', display_order: 2 },
    { name: 'CRSE', logo_url: '/images/partners/crse.png', category: 'institution', display_order: 3 },
  ];

  for (const p of partners) {
    await getPool().query(
      `INSERT INTO partners (name, logo_url, category, display_order, is_active)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT DO NOTHING`,
      [p.name, p.logo_url, p.category, p.display_order],
    );
  }
  console.log(`  ✅ ${partners.length} partners`);

  // ── Homepage dynamic content ──
  // Hero
  await getPool().query(`
    INSERT INTO home_hero (title, subtitle, description, cta_text, cta_link)
    VALUES ('PROQUELEC Sénégal',
            'La première plateforme dédiée aux professionnels de l''électricité',
            'Référence nationale pour les électriciens, installateurs et professionnels du secteur électrique sénégalais.',
            'Découvrir nos services', '/services')
    ON CONFLICT DO NOTHING
  `);
  console.log('  ✅ Home hero');

  // Slides
  const slides = [
    { badge: 'Nouveau', title: 'Annuaire des Électriciens', subtitle: 'Trouvez un professionnel qualifié', description: 'Accédez au plus grand réseau d\'électriciens certifiés du Sénégal.', cta_text: 'Rechercher', cta_link: '/reseau-electriciens', display_order: 0 },
    { badge: 'Formation', title: 'Formations Certifiantes', subtitle: 'Montez en compétences', description: 'Des formations agréées par l\'État pour tous les niveaux.', cta_text: 'Voir les formations', cta_link: '/formation', display_order: 1 },
    { badge: 'Observatoire', title: 'Observatoire de l\'Énergie', subtitle: 'Données et analyses', description: 'Suivez les indicateurs clés du secteur électrique sénégalais en temps réel.', cta_text: 'Explorer', cta_link: '/observatoire', display_order: 2 },
  ];

  for (const s of slides) {
    await getPool().query(
      `INSERT INTO home_slides (badge, title, subtitle, description, cta_text, cta_link, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT DO NOTHING`,
      [s.badge, s.title, s.subtitle, s.description, s.cta_text, s.cta_link, s.display_order],
    );
  }
  console.log('  ✅ Home slides');

  // Services
  const services = [
    { title: 'Annuaire des Électriciens', description: 'Trouvez un électricien qualifié près de chez vous.', icon_name: 'zap', link: '/reseau-electriciens', display_order: 0 },
    { title: 'Formations Certifiantes', description: 'Accédez à des formations agréées par l\'État.', icon_name: 'graduation-cap', link: '/formation', display_order: 1 },
    { title: 'Observatoire de l\'Énergie', description: 'Suivez les indicateurs clés du secteur électrique sénégalais.', icon_name: 'bar-chart', link: '/observatoire', display_order: 2 },
    { title: 'Bibliothèque Technique', description: 'Consultez les normes, guides et documents techniques.', icon_name: 'book-open', link: '/documentation', display_order: 3 },
  ];

  for (const svc of services) {
    await getPool().query(
      `INSERT INTO home_services (title, description, icon_name, link, display_order)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING`,
      [svc.title, svc.description, svc.icon_name, svc.link, svc.display_order],
    );
  }
  console.log('  ✅ Home services');

  // Stats
  const stats = [
    { label: 'Électriciens', value: '1 200+', icon_name: 'users', description: 'Professionnels référencés', is_warning: false, display_order: 0 },
    { label: 'Formations', value: '45', icon_name: 'book', description: 'Programmes de formation', is_warning: false, display_order: 1 },
    { label: 'Entreprises', value: '350', icon_name: 'building', description: 'Entreprises partenaires', is_warning: false, display_order: 2 },
    { label: 'Normes', value: '100%', icon_name: 'shield', description: 'Conformité aux normes', is_warning: true, display_order: 3 },
  ];

  for (const st of stats) {
    await getPool().query(
      `INSERT INTO home_stats (label, value, icon_name, description, is_warning, display_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING`,
      [st.label, st.value, st.icon_name, st.description, st.is_warning, st.display_order],
    );
  }
  console.log('  ✅ Home stats');

  // Testimonials
  const testimonials = [
    { name: 'Moussa Diallo', role: 'Électricien Indépendant', content: 'PROQUELEC m\'a permis de trouver de nouveaux clients et de me former aux dernières normes. Une plateforme indispensable.', rating: 5 },
    { name: 'Aïssatou Ndiaye', role: 'Chef d\'Entreprise', content: 'Grâce à PROQUELEC, mon entreprise a pu obtenir toutes les certifications nécessaires. Le suivi est exceptionnel.', rating: 5 },
    { name: 'Ibrahima Sarr', role: 'Technicien', content: 'Les formations PROQUELEC sont de grande qualité. J\'ai pu progresser dans ma carrière grâce à elles.', rating: 4 },
  ];

  for (const t of testimonials) {
    await getPool().query(
      `INSERT INTO testimonials (name, role, content, rating)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [t.name, t.role, t.content, t.rating],
    );
  }
  console.log('  ✅ Testimonials');

  return true;
}

module.exports = { seed };
