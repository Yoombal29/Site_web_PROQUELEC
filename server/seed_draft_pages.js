/**
 * seed_draft_pages.js
 * Injecte le contenu HTML+CSS premium dans les 9 pages draft PROQUELEC
 * Usage: node server/seed_draft_pages.js
 */

require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ─────────────────────────────────────────────────────────────────────────────
// STYLES COMMUNS (injectés une fois dans chaque page via <style>)
// ─────────────────────────────────────────────────────────────────────────────
const COMMON_STYLE = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

:root {
  --pq-blue: #0D3C6E;
  --pq-blue-light: #1A5FA8;
  --pq-gold: #C8992A;
  --pq-gold-light: #E6B84A;
  --pq-white: #FFFFFF;
  --pq-gray-50: #F8FAFC;
  --pq-gray-100: #F1F5F9;
  --pq-gray-200: #E2E8F0;
  --pq-gray-600: #475569;
  --pq-gray-900: #0F172A;
  --pq-radius: 12px;
  --pq-shadow: 0 4px 24px rgba(13,60,110,0.10);
  --pq-shadow-lg: 0 8px 48px rgba(13,60,110,0.15);
}

.pq-page * { box-sizing: border-box; margin: 0; padding: 0; }
.pq-page { font-family: 'Inter', sans-serif; color: var(--pq-gray-900); background: var(--pq-white); }

/* Hero */
.pq-hero {
  background: linear-gradient(135deg, var(--pq-blue) 0%, var(--pq-blue-light) 60%, #1e7abf 100%);
  color: white; padding: 80px 24px 96px; position: relative; overflow: hidden;
}
.pq-hero::before {
  content: ''; position: absolute; top: -120px; right: -120px;
  width: 480px; height: 480px; border-radius: 50%;
  background: rgba(200,153,42,0.12); pointer-events: none;
}
.pq-hero::after {
  content: ''; position: absolute; bottom: -80px; left: -80px;
  width: 320px; height: 320px; border-radius: 50%;
  background: rgba(255,255,255,0.05); pointer-events: none;
}
.pq-hero-inner { max-width: 1100px; margin: 0 auto; position: relative; z-index: 1; }
.pq-badge {
  display: inline-block; background: rgba(200,153,42,0.2); border: 1px solid var(--pq-gold);
  color: var(--pq-gold-light); font-size: 11px; font-weight: 600; letter-spacing: 1.5px;
  text-transform: uppercase; padding: 6px 16px; border-radius: 20px; margin-bottom: 24px;
}
.pq-hero-title { font-size: clamp(2rem,5vw,3.2rem); font-weight: 800; line-height: 1.15; margin-bottom: 20px; }
.pq-hero-title span { color: var(--pq-gold-light); }
.pq-hero-desc { font-size: 1.1rem; color: rgba(255,255,255,0.82); max-width: 620px; line-height: 1.75; margin-bottom: 36px; }
.pq-hero-cta { display: flex; flex-wrap: wrap; gap: 12px; }
.pq-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 28px; border-radius: 8px; font-size: 15px; font-weight: 600;
  text-decoration: none; transition: all 0.25s; cursor: pointer; border: none;
}
.pq-btn-primary { background: var(--pq-gold); color: var(--pq-blue); }
.pq-btn-primary:hover { background: var(--pq-gold-light); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(200,153,42,0.4); }
.pq-btn-outline { background: transparent; border: 2px solid rgba(255,255,255,0.4); color: white; }
.pq-btn-outline:hover { border-color: white; background: rgba(255,255,255,0.1); }

/* Stats bar */
.pq-stats-bar { background: var(--pq-blue); border-top: 1px solid rgba(255,255,255,0.1); }
.pq-stats-bar-inner { max-width: 1100px; margin: 0 auto; display: flex; flex-wrap: wrap; }
.pq-stat-item { flex: 1; min-width: 140px; padding: 28px 32px; text-align: center; border-right: 1px solid rgba(255,255,255,0.1); }
.pq-stat-item:last-child { border-right: none; }
.pq-stat-value { font-size: 1.9rem; font-weight: 800; color: var(--pq-gold-light); line-height: 1; }
.pq-stat-label { font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 6px; letter-spacing: 0.5px; }

/* Sections */
.pq-section { padding: 72px 24px; }
.pq-section-alt { background: var(--pq-gray-50); }
.pq-section-inner { max-width: 1100px; margin: 0 auto; }
.pq-section-header { text-align: center; margin-bottom: 56px; }
.pq-kicker { font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--pq-gold); margin-bottom: 12px; }
.pq-section-title { font-size: clamp(1.6rem,3vw,2.4rem); font-weight: 800; color: var(--pq-blue); line-height: 1.2; margin-bottom: 16px; }
.pq-section-lead { font-size: 1.05rem; color: var(--pq-gray-600); max-width: 600px; margin: 0 auto; line-height: 1.75; }

/* Cards grid */
.pq-grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
.pq-grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
.pq-card {
  background: white; border-radius: var(--pq-radius); padding: 32px;
  box-shadow: var(--pq-shadow); border: 1px solid var(--pq-gray-200);
  transition: transform 0.25s, box-shadow 0.25s;
}
.pq-card:hover { transform: translateY(-4px); box-shadow: var(--pq-shadow-lg); }
.pq-card-icon {
  width: 52px; height: 52px; border-radius: 10px;
  background: linear-gradient(135deg, var(--pq-blue), var(--pq-blue-light));
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 20px; font-size: 22px;
}
.pq-card-title { font-size: 1.1rem; font-weight: 700; color: var(--pq-blue); margin-bottom: 10px; }
.pq-card-text { font-size: 0.92rem; color: var(--pq-gray-600); line-height: 1.7; }

/* Steps */
.pq-steps { counter-reset: step; display: flex; flex-direction: column; gap: 0; }
.pq-step { display: flex; gap: 24px; position: relative; padding-bottom: 40px; }
.pq-step:last-child { padding-bottom: 0; }
.pq-step::before {
  content: ''; position: absolute; left: 19px; top: 44px;
  width: 2px; height: calc(100% - 44px); background: var(--pq-gray-200);
}
.pq-step:last-child::before { display: none; }
.pq-step-num {
  flex-shrink: 0; width: 40px; height: 40px; border-radius: 50%;
  background: var(--pq-blue); color: white; font-weight: 800; font-size: 15px;
  display: flex; align-items: center; justify-content: center; position: relative; z-index: 1;
}
.pq-step-content { padding-top: 8px; }
.pq-step-title { font-size: 1rem; font-weight: 700; color: var(--pq-blue); margin-bottom: 6px; }
.pq-step-text { font-size: 0.92rem; color: var(--pq-gray-600); line-height: 1.65; }

/* CTA section */
.pq-cta-section {
  background: linear-gradient(135deg, var(--pq-blue) 0%, var(--pq-blue-light) 100%);
  padding: 72px 24px; text-align: center; color: white;
}
.pq-cta-title { font-size: clamp(1.6rem,3vw,2.2rem); font-weight: 800; margin-bottom: 16px; }
.pq-cta-desc { font-size: 1.05rem; color: rgba(255,255,255,0.8); margin-bottom: 36px; }

/* Split layout */
.pq-split { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.pq-split-text h2 { font-size: clamp(1.5rem,2.5vw,2.1rem); font-weight: 800; color: var(--pq-blue); margin-bottom: 16px; }
.pq-split-text p { font-size: 0.98rem; color: var(--pq-gray-600); line-height: 1.8; margin-bottom: 16px; }
.pq-visual {
  background: linear-gradient(135deg, var(--pq-gray-100), var(--pq-gray-200));
  border-radius: var(--pq-radius); padding: 48px 32px; text-align: center;
  border: 1px solid var(--pq-gray-200);
}
.pq-visual-icon { font-size: 64px; margin-bottom: 16px; }
.pq-visual-text { font-size: 0.9rem; color: var(--pq-gray-600); }

/* List items */
.pq-list { list-style: none; display: flex; flex-direction: column; gap: 12px; }
.pq-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 0.95rem; color: var(--pq-gray-600); line-height: 1.65; }
.pq-list li::before { content: '✓'; color: var(--pq-gold); font-weight: 700; flex-shrink: 0; margin-top: 2px; }

/* Highlight box */
.pq-highlight {
  background: linear-gradient(135deg, #EFF6FF, #DBEAFE); border-left: 4px solid var(--pq-blue);
  border-radius: 8px; padding: 24px 28px; margin: 24px 0;
}
.pq-highlight p { font-size: 0.97rem; color: var(--pq-blue); line-height: 1.7; font-weight: 500; }

/* Responsive */
@media (max-width: 768px) {
  .pq-split { grid-template-columns: 1fr; gap: 32px; }
  .pq-stat-item { min-width: 50%; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.1); }
}
</style>
`;

// ─────────────────────────────────────────────────────────────────────────────
// CONTENU DES PAGES
// ─────────────────────────────────────────────────────────────────────────────

const PAGES_CONTENT = {

  // 1. Utilité Publique
  'utilite-publique': {
    title: 'Utilité Publique',
    meta: 'PROQUELEC, organisme reconnu d\'utilité publique au Sénégal pour la promotion de la sécurité et de la qualité des installations électriques.',
    content: COMMON_STYLE + `
<div class="pq-page">

  <section class="pq-hero">
    <div class="pq-hero-inner">
      <div class="pq-badge">⚡ Organisme Reconnu d'Utilité Publique</div>
      <h1 class="pq-hero-title">PROQUELEC au service<br>de <span>toute la Nation</span></h1>
      <p class="pq-hero-desc">Depuis 1995, PROQUELEC œuvre pour la sécurité électrique de tous les Sénégalais — ménages, professionnels, collectivités et institutions. Un mandat d'intérêt général, reconnu par l'État.</p>
      <div class="pq-hero-cta">
        <a href="/contact" class="pq-btn pq-btn-primary">📋 Demander un diagnostic</a>
        <a href="/about" class="pq-btn pq-btn-outline">En savoir plus</a>
      </div>
    </div>
  </section>

  <div class="pq-stats-bar">
    <div class="pq-stats-bar-inner">
      <div class="pq-stat-item"><div class="pq-stat-value">1995</div><div class="pq-stat-label">Année de création</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">14</div><div class="pq-stat-label">Régions couvertes</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">500+</div><div class="pq-stat-label">Dossiers traités</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">4</div><div class="pq-stat-label">Publics servis</div></div>
    </div>
  </div>

  <section class="pq-section">
    <div class="pq-section-inner">
      <div class="pq-section-header">
        <div class="pq-kicker">Notre mission</div>
        <h2 class="pq-section-title">Un rôle d'intérêt général pour tous</h2>
        <p class="pq-section-lead">PROQUELEC intervient comme tiers de confiance indépendant pour garantir la qualité et la sécurité des installations électriques au Sénégal.</p>
      </div>
      <div class="pq-grid-2">
        <div class="pq-card">
          <div class="pq-card-icon">🏠</div>
          <h3 class="pq-card-title">Protection des ménages</h3>
          <p class="pq-card-text">Conseils de prévention, diagnostics résidentiels et orientation vers des professionnels qualifiés pour sécuriser les foyers sénégalais.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">🏭</div>
          <h3 class="pq-card-title">Encadrement professionnel</h3>
          <p class="pq-card-text">Certification des électriciens, formations techniques et délivrance de labels qualité pour structurer la profession.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">🏛️</div>
          <h3 class="pq-card-title">Appui aux institutions</h3>
          <p class="pq-card-text">Tableaux de bord territoriaux, études de conformité et conseils techniques pour les ministères, collectivités et pouvoirs publics.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">🤝</div>
          <h3 class="pq-card-title">Coopération internationale</h3>
          <p class="pq-card-text">Partenariats avec des organismes étrangers (FISUEL, etc.) pour aligner les pratiques sénégalaises aux standards internationaux de sécurité.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="pq-section pq-section-alt">
    <div class="pq-section-inner">
      <div class="pq-split">
        <div class="pq-split-text">
          <div class="pq-kicker">Cadre juridique</div>
          <h2>Reconnu par l'État sénégalais</h2>
          <p>PROQUELEC est une association à but non lucratif régie par la loi sénégalaise n° 68-08, reconnue d'utilité publique. Ce statut lui confère une légitimité nationale pour agir en faveur de la sécurité électrique.</p>
          <p>L'association regroupe des distributeurs, installateurs, bureaux d'études, contrôleurs techniques et représentants du secteur sous une gouvernance partagée et transparente.</p>
          <div class="pq-highlight"><p>🏅 Numéro NINEA : 0191403 089 — Siège : Immeuble Coumba Castel, 12 rue Saint-Michel, 4ᵉ étage, Dakar.</p></div>
        </div>
        <div class="pq-visual">
          <div class="pq-visual-icon">⚖️</div>
          <div class="pq-visual-text"><strong>Loi n° 68-08</strong><br>Association à but non lucratif<br>reconnue d'utilité publique<br><br><strong>Gouvernance</strong><br>8 administrateurs<br>Conseil d'administration indépendant</div>
        </div>
      </div>
    </div>
  </section>

  <section class="pq-cta-section">
    <h2 class="pq-cta-title">Vous avez un projet ou une question ?</h2>
    <p class="pq-cta-desc">Notre équipe vous oriente vers le bon service en moins de 24 heures.</p>
    <a href="/contact" class="pq-btn pq-btn-primary">Contactez-nous</a>
  </section>

</div>`
  },

  // 2. Espace Autorités
  'espace-autorites': {
    title: 'Espace Autorités',
    meta: 'Espace dédié aux autorités publiques, ministères et collectivités : tableaux de bord, campagnes territoriales et outils de pilotage de la sécurité électrique.',
    content: COMMON_STYLE + `
<div class="pq-page">

  <section class="pq-hero">
    <div class="pq-hero-inner">
      <div class="pq-badge">🏛️ Espace Réservé aux Autorités</div>
      <h1 class="pq-hero-title">Pilotez la sécurité<br><span>électrique nationale</span></h1>
      <p class="pq-hero-desc">Ministères, collectivités territoriales et institutions publiques : PROQUELEC met à votre disposition des données, outils de planification et appuis techniques pour une gestion efficace du risque électrique.</p>
      <div class="pq-hero-cta">
        <a href="/observatoire" class="pq-btn pq-btn-primary">📊 Accéder à l'Observatoire</a>
        <a href="/contact" class="pq-btn pq-btn-outline">Nous contacter</a>
      </div>
    </div>
  </section>

  <div class="pq-stats-bar">
    <div class="pq-stats-bar-inner">
      <div class="pq-stat-item"><div class="pq-stat-value">14</div><div class="pq-stat-label">Régions ciblées</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">ERP</div><div class="pq-stat-label">Bâtiments suivis</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">24h</div><div class="pq-stat-label">Délai de réponse</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">100%</div><div class="pq-stat-label">Données fiables</div></div>
    </div>
  </div>

  <section class="pq-section">
    <div class="pq-section-inner">
      <div class="pq-section-header">
        <div class="pq-kicker">Nos services pour les institutions</div>
        <h2 class="pq-section-title">Des outils adaptés à vos responsabilités</h2>
        <p class="pq-section-lead">PROQUELEC accompagne les pouvoirs publics dans la définition, le suivi et l'évaluation des politiques de sécurité électrique.</p>
      </div>
      <div class="pq-grid-3">
        <div class="pq-card">
          <div class="pq-card-icon">📊</div>
          <h3 class="pq-card-title">Observatoire National</h3>
          <p class="pq-card-text">Tableaux de bord territoriaux, indicateurs de conformité et statistiques régionales en temps réel.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">📋</div>
          <h3 class="pq-card-title">Audits & Expertises</h3>
          <p class="pq-card-text">Contrôles techniques des bâtiments publics (ERP, marchés, édifices administratifs) avec rapports détaillés.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">📣</div>
          <h3 class="pq-card-title">Campagnes publiques</h3>
          <p class="pq-card-text">Conception et déploiement de campagnes de sensibilisation à l'échelle nationale et régionale.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">🗺️</div>
          <h3 class="pq-card-title">Planification territoriale</h3>
          <p class="pq-card-text">Cartographie des risques, priorisation des zones d'intervention et recommandations de politique publique.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">⚖️</div>
          <h3 class="pq-card-title">Appui réglementaire</h3>
          <p class="pq-card-text">Contribution à l'élaboration des textes normatifs et accompagnement dans l'application des règlements.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">🎓</div>
          <h3 class="pq-card-title">Formation des agents</h3>
          <p class="pq-card-text">Programmes de formation spécifiques pour les agents des collectivités et personnels techniques institutionnels.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="pq-section pq-section-alt">
    <div class="pq-section-inner">
      <div class="pq-section-header">
        <div class="pq-kicker">Notre processus</div>
        <h2 class="pq-section-title">Comment nous travaillons avec les institutions</h2>
      </div>
      <div class="pq-steps">
        <div class="pq-step"><div class="pq-step-num">1</div><div class="pq-step-content"><h4 class="pq-step-title">Analyse du besoin</h4><p class="pq-step-text">Identification des priorités institutionnelles, du périmètre d'intervention et des objectifs mesurables.</p></div></div>
        <div class="pq-step"><div class="pq-step-num">2</div><div class="pq-step-content"><h4 class="pq-step-title">Déploiement technique</h4><p class="pq-step-text">Mise en œuvre des audits, formations ou campagnes avec des experts PROQUELEC certifiés.</p></div></div>
        <div class="pq-step"><div class="pq-step-num">3</div><div class="pq-step-content"><h4 class="pq-step-title">Rapport et recommandations</h4><p class="pq-step-text">Production de rapports officiels avec recommandations priorisées et plan d'action opérationnel.</p></div></div>
        <div class="pq-step"><div class="pq-step-num">4</div><div class="pq-step-content"><h4 class="pq-step-title">Suivi & évaluation</h4><p class="pq-step-text">Accompagnement dans la mise en œuvre et mesure des impacts à travers l'Observatoire national.</p></div></div>
      </div>
    </div>
  </section>

  <section class="pq-cta-section">
    <h2 class="pq-cta-title">Engager un partenariat institutionnel ?</h2>
    <p class="pq-cta-desc">Contactez notre équipe pour définir ensemble les modalités de collaboration.</p>
    <a href="/contact" class="pq-btn pq-btn-primary">Initier le partenariat</a>
  </section>

</div>`
  },

  // 3. Espace Ménages
  'espace-menages': {
    title: 'Espace Ménages',
    meta: 'Conseils, diagnostics et ressources pour sécuriser votre installation électrique à domicile. PROQUELEC protège les foyers sénégalais.',
    content: COMMON_STYLE + `
<div class="pq-page">

  <section class="pq-hero">
    <div class="pq-hero-inner">
      <div class="pq-badge">🏠 Espace Ménages & Particuliers</div>
      <h1 class="pq-hero-title">Protégez votre foyer<br><span>avant l'incident</span></h1>
      <p class="pq-hero-desc">Les accidents électriques domestiques sont évitables. PROQUELEC vous guide pour identifier les risques, comprendre vos obligations et trouver un professionnel qualifié.</p>
      <div class="pq-hero-cta">
        <a href="/contact" class="pq-btn pq-btn-primary">🔍 Demander un diagnostic</a>
        <a href="/documents" class="pq-btn pq-btn-outline">Guides pratiques</a>
      </div>
    </div>
  </section>

  <div class="pq-stats-bar">
    <div class="pq-stats-bar-inner">
      <div class="pq-stat-item"><div class="pq-stat-value">80%</div><div class="pq-stat-label">Incidents évitables</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">24h</div><div class="pq-stat-label">Délai d'orientation</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">Free</div><div class="pq-stat-label">Conseils de base</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">14</div><div class="pq-stat-label">Régions desservies</div></div>
    </div>
  </div>

  <section class="pq-section">
    <div class="pq-section-inner">
      <div class="pq-section-header">
        <div class="pq-kicker">Signaux d'alerte</div>
        <h2 class="pq-section-title">Reconnaître les risques chez soi</h2>
        <p class="pq-section-lead">Ces signes indiquent que votre installation électrique peut être dangereuse. N'attendez pas un incident pour agir.</p>
      </div>
      <div class="pq-grid-2">
        <div class="pq-card">
          <div class="pq-card-icon">🌡️</div>
          <h3 class="pq-card-title">Prises et interrupteurs chauds</h3>
          <p class="pq-card-text">Une prise qui chauffe anormalement est un signe de surcharge ou d'un câblage défectueux. C'est un risque d'incendie immédiat.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">⚡</div>
          <h3 class="pq-card-title">Disjonctions fréquentes</h3>
          <p class="pq-card-text">Un disjoncteur qui saute régulièrement indique une installation inadaptée ou un appareil défectueux. Ne bridez jamais un disjoncteur.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">💡</div>
          <h3 class="pq-card-title">Lumières qui vacillent</h3>
          <p class="pq-card-text">Des lumières instables signalent des connexions lâches ou une tension irrégulière. Problème à traiter rapidement.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">💧</div>
          <h3 class="pq-card-title">Humidité & électricité</h3>
          <p class="pq-card-text">Toute installation électrique exposée à l'eau (salle de bain, cuisine, extérieur) doit respecter des normes d'étanchéité strictes.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="pq-section pq-section-alt">
    <div class="pq-section-inner">
      <div class="pq-split">
        <div class="pq-split-text">
          <div class="pq-kicker">Demander un diagnostic</div>
          <h2>Comment ça se passe ?</h2>
          <p>Un technicien PROQUELEC certifié se déplace à votre domicile pour inspecter votre installation électrique. Il évalue la conformité aux normes en vigueur et vous remet un rapport détaillé.</p>
          <ul class="pq-list">
            <li>Inspection complète du tableau électrique</li>
            <li>Vérification des prises, interrupteurs et câblages visibles</li>
            <li>Contrôle de la mise à la terre</li>
            <li>Rapport écrit avec recommandations priorisées</li>
            <li>Orientation vers des professionnels certifiés si nécessaire</li>
          </ul>
          <br>
          <a href="/contact" class="pq-btn pq-btn-primary" style="display:inline-flex">📋 Prendre rendez-vous</a>
        </div>
        <div class="pq-visual">
          <div class="pq-visual-icon">🔌</div>
          <div class="pq-visual-text"><strong>Votre installation mérite une vérification si :</strong><br><br>• Elle a plus de 15 ans<br>• Elle n'a jamais été contrôlée<br>• Vous constatez des anomalies<br>• Vous venez d'emménager<br>• Vous avez réalisé des travaux</div>
        </div>
      </div>
    </div>
  </section>

  <section class="pq-section">
    <div class="pq-section-inner">
      <div class="pq-section-header">
        <div class="pq-kicker">Conseils pratiques</div>
        <h2 class="pq-section-title">Les bons réflexes au quotidien</h2>
      </div>
      <div class="pq-grid-3">
        <div class="pq-card">
          <div class="pq-card-icon">🔒</div>
          <h3 class="pq-card-title">Protégez les prises</h3>
          <p class="pq-card-text">Installez des cache-prises si vous avez des enfants en bas âge. Évitez les multiprises surchargées.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">🚫</div>
          <h3 class="pq-card-title">Interdits absolus</h3>
          <p class="pq-card-text">Ne jamais toucher une installation sous tension. Ne pas intervenir soi-même sur le tableau électrique.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">📞</div>
          <h3 class="pq-card-title">En cas d'urgence</h3>
          <p class="pq-card-text">Coupez le disjoncteur général et appelez immédiatement un électricien certifié ou les secours.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="pq-cta-section">
    <h2 class="pq-cta-title">Besoin d'un conseil ou d'un diagnostic ?</h2>
    <p class="pq-cta-desc">Notre équipe vous répond en moins de 24 heures et vous oriente vers le bon professionnel.</p>
    <a href="/contact" class="pq-btn pq-btn-primary">Nous contacter gratuitement</a>
  </section>

</div>`
  },

  // 4. Espace Professionnels
  'espace-professionnels': {
    title: 'Espace Professionnels',
    meta: 'Espace dédié aux électriciens, entreprises et bureaux d\'études : certifications, formations, outils métiers et documentation technique PROQUELEC.',
    content: COMMON_STYLE + `
<div class="pq-page">

  <section class="pq-hero">
    <div class="pq-hero-inner">
      <div class="pq-badge">⚡ Espace Professionnels de l'Électricité</div>
      <h1 class="pq-hero-title">Développez votre activité<br><span>avec PROQUELEC</span></h1>
      <p class="pq-hero-desc">Électriciens, installateurs, bureaux d'études, entreprises de BTP : accédez aux certifications, formations, outils métiers et ressources techniques pour exercer avec excellence et vous démarquer.</p>
      <div class="pq-hero-cta">
        <a href="/certifications" class="pq-btn pq-btn-primary">🏅 Obtenir une certification</a>
        <a href="/formations" class="pq-btn pq-btn-outline">Voir les formations</a>
      </div>
    </div>
  </section>

  <div class="pq-stats-bar">
    <div class="pq-stats-bar-inner">
      <div class="pq-stat-item"><div class="pq-stat-value">QUALI-ELEC</div><div class="pq-stat-label">Label phare</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">3 ans</div><div class="pq-stat-label">Durée de validité</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">20+</div><div class="pq-stat-label">Modules de formation</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">SN 01-015</div><div class="pq-stat-label">Norme de référence</div></div>
    </div>
  </div>

  <section class="pq-section">
    <div class="pq-section-inner">
      <div class="pq-section-header">
        <div class="pq-kicker">Nos services professionnels</div>
        <h2 class="pq-section-title">Tout ce dont vous avez besoin pour exercer</h2>
        <p class="pq-section-lead">PROQUELEC est votre partenaire de référence pour la certification, la montée en compétences et l'accès aux marchés.</p>
      </div>
      <div class="pq-grid-2">
        <div class="pq-card">
          <div class="pq-card-icon">🏅</div>
          <h3 class="pq-card-title">Certification QUALI-ELEC</h3>
          <p class="pq-card-text">Le label de référence pour les électriciens au Sénégal. Valorisez votre savoir-faire et accédez aux marchés publics et privés exigeants.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">🎓</div>
          <h3 class="pq-card-title">Formations continues</h3>
          <p class="pq-card-text">Catalogue de formations techniques : normes, sécurité, nouvelles technologies (solaire, domotique), habilitations électriques.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">🔧</div>
          <h3 class="pq-card-title">Outils métiers</h3>
          <p class="pq-card-text">Calculateurs professionnels, générateurs de schémas électriques, simulateurs de conformité et aide à la rédaction de devis.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">📚</div>
          <h3 class="pq-card-title">Documentation technique</h3>
          <p class="pq-card-text">Accès aux normes nationales (SN 01-015), guides pratiques, mémentos de sécurité et fiches techniques téléchargeables.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">🤝</div>
          <h3 class="pq-card-title">Réseau PROQUELEC</h3>
          <p class="pq-card-text">Intégrez un réseau de professionnels certifiés et bénéficiez de la visibilité sur l'annuaire officiel des électriciens qualifiés.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">📣</div>
          <h3 class="pq-card-title">Veille réglementaire</h3>
          <p class="pq-card-text">Restez informé des évolutions normatives, des nouvelles obligations légales et des actualités du secteur électrique.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="pq-section pq-section-alt">
    <div class="pq-section-inner">
      <div class="pq-section-header">
        <div class="pq-kicker">Obtenir une certification</div>
        <h2 class="pq-section-title">Le parcours de certification QUALI-ELEC</h2>
      </div>
      <div class="pq-steps">
        <div class="pq-step"><div class="pq-step-num">1</div><div class="pq-step-content"><h4 class="pq-step-title">Pré-qualification</h4><p class="pq-step-text">Vérification de l'éligibilité : agrément professionnel, assurance RC Pro, références de chantiers documentées.</p></div></div>
        <div class="pq-step"><div class="pq-step-num">2</div><div class="pq-step-content"><h4 class="pq-step-title">Audit technique</h4><p class="pq-step-text">Contrôle documentaire et inspection terrain par un auditeur PROQUELEC certifié sur un échantillon de réalisations.</p></div></div>
        <div class="pq-step"><div class="pq-step-num">3</div><div class="pq-step-content"><h4 class="pq-step-title">Commission d'évaluation</h4><p class="pq-step-text">Analyse indépendante du dossier, demandes de compléments éventuelles et décision motivée sous 15 jours.</p></div></div>
        <div class="pq-step"><div class="pq-step-num">4</div><div class="pq-step-content"><h4 class="pq-step-title">Délivrance du label</h4><p class="pq-step-text">Inscription au registre officiel, remise du certificat QUALI-ELEC valable 3 ans avec audit de suivi annuel.</p></div></div>
      </div>
    </div>
  </section>

  <section class="pq-cta-section">
    <h2 class="pq-cta-title">Prêt à vous certifier ?</h2>
    <p class="pq-cta-desc">Déposez votre dossier de candidature ou contactez notre équipe pour un accompagnement personnalisé.</p>
    <a href="/contact" class="pq-btn pq-btn-primary">Déposer mon dossier</a>
  </section>

</div>`
  },

  // 5. Nos Actions
  'nos-actions': {
    title: 'Nos Actions',
    meta: 'Les actions de terrain de PROQUELEC : sensibilisation, diagnostics électriques, mise en conformité, sécurisation des marchés et études techniques.',
    content: COMMON_STYLE + `
<div class="pq-page">

  <section class="pq-hero">
    <div class="pq-hero-inner">
      <div class="pq-badge">🎯 Actions de Terrain</div>
      <h1 class="pq-hero-title">PROQUELEC agit<br><span>partout au Sénégal</span></h1>
      <p class="pq-hero-desc">De Dakar à Ziguinchor, nos équipes interviennent sur le terrain pour diagnostiquer, former, certifier et protéger. Découvrez l'ensemble de nos programmes d'action.</p>
      <div class="pq-hero-cta">
        <a href="/projets" class="pq-btn pq-btn-primary">🗂️ Voir nos réalisations</a>
        <a href="/contact" class="pq-btn pq-btn-outline">Rejoindre un programme</a>
      </div>
    </div>
  </section>

  <div class="pq-stats-bar">
    <div class="pq-stats-bar-inner">
      <div class="pq-stat-item"><div class="pq-stat-value">5</div><div class="pq-stat-label">Axes d'intervention</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">14</div><div class="pq-stat-label">Régions couvertes</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">500+</div><div class="pq-stat-label">Dossiers traités</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">1995</div><div class="pq-stat-label">Depuis</div></div>
    </div>
  </div>

  <section class="pq-section">
    <div class="pq-section-inner">
      <div class="pq-section-header">
        <div class="pq-kicker">Nos programmes</div>
        <h2 class="pq-section-title">Cinq axes d'intervention prioritaires</h2>
        <p class="pq-section-lead">Chaque programme répond à un besoin identifié pour améliorer durablement la sécurité électrique au Sénégal.</p>
      </div>
      <div class="pq-grid-2">
        <div class="pq-card">
          <div class="pq-card-icon">📣</div>
          <h3 class="pq-card-title">Sensibilisation nationale</h3>
          <p class="pq-card-text">Campagnes de sensibilisation dans les quartiers, marchés, écoles et médias nationaux sur les risques électriques et les bons gestes à adopter. Plus de 100 000 personnes touchées chaque année.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">🔍</div>
          <h3 class="pq-card-title">Diagnostics électriques</h3>
          <p class="pq-card-text">Inspections terrain des installations résidentielles, commerciales et industrielles. Identification des non-conformités, rapports détaillés et plans de mise en conformité.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">✅</div>
          <h3 class="pq-card-title">Mise en conformité</h3>
          <p class="pq-card-text">Accompagnement des propriétaires et exploitants pour la mise aux normes de leurs installations. Coordination avec des électriciens certifiés et suivi des travaux.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">🏪</div>
          <h3 class="pq-card-title">Sécurisation des marchés</h3>
          <p class="pq-card-text">Programme spécifique pour les marchés populaires et zones commerciales : inspection électrique, mise aux normes et sensibilisation des commerçants.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">🏘️</div>
          <h3 class="pq-card-title">Collectivités locales</h3>
          <p class="pq-card-text">Appui aux communes et communautés rurales dans la sécurisation de l'éclairage public, des édifices communautaires et des équipements collectifs.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">🔬</div>
          <h3 class="pq-card-title">Études & expertises</h3>
          <p class="pq-card-text">Études techniques approfondies pour les maîtres d'ouvrage, bureaux d'études et donneurs d'ordres publics et privés sur des problématiques électriques complexes.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="pq-section pq-section-alt">
    <div class="pq-section-inner">
      <div class="pq-split">
        <div class="pq-split-text">
          <div class="pq-kicker">Impact mesurable</div>
          <h2>Des résultats concrets sur le terrain</h2>
          <p>Chaque action PROQUELEC est suivie d'indicateurs de performance permettant de mesurer l'impact réel sur la sécurité des populations et des infrastructures.</p>
          <ul class="pq-list">
            <li>Taux de conformité avant/après intervention mesuré</li>
            <li>Nombre d'incidents signalés en baisse dans les zones traitées</li>
            <li>Rapports publics annuels sur l'état de la sécurité électrique</li>
            <li>Données intégrées dans l'Observatoire national</li>
          </ul>
          <br>
          <a href="/observatoire" class="pq-btn pq-btn-primary" style="display:inline-flex">Consulter l'Observatoire</a>
        </div>
        <div class="pq-visual">
          <div class="pq-visual-icon">📈</div>
          <div class="pq-visual-text"><strong>Notre approche</strong><br><br>Diagnostic → Formation<br>Certification → Suivi<br>Évaluation → Amélioration<br><br>Un cycle continu pour une sécurité durable.</div>
        </div>
      </div>
    </div>
  </section>

  <section class="pq-cta-section">
    <h2 class="pq-cta-title">Vous souhaitez rejoindre un programme ?</h2>
    <p class="pq-cta-desc">Que vous soyez particulier, professionnel ou institution, il existe un programme adapté à votre situation.</p>
    <a href="/contact" class="pq-btn pq-btn-primary">Contacter nos équipes</a>
  </section>

</div>`
  },

  // 6. Normes & Ressources
  'normes-ressources': {
    title: 'Normes & Ressources',
    meta: 'Accédez aux normes électriques sénégalaises (SN 01-015), guides pratiques, mémento de sécurité et ressources documentaires de PROQUELEC.',
    content: COMMON_STYLE + `
<div class="pq-page">

  <section class="pq-hero">
    <div class="pq-hero-inner">
      <div class="pq-badge">📚 Centre de Ressources Normatives</div>
      <h1 class="pq-hero-title">La référence technique<br><span>électrique au Sénégal</span></h1>
      <p class="pq-hero-desc">Normes nationales, guides pratiques, mémentos de sécurité, fiches techniques : toute la documentation dont vous avez besoin pour exercer en conformité et protéger efficacement.</p>
      <div class="pq-hero-cta">
        <a href="/documents" class="pq-btn pq-btn-primary">📥 Accéder aux documents</a>
        <a href="/outils" class="pq-btn pq-btn-outline">Outils de calcul</a>
      </div>
    </div>
  </section>

  <div class="pq-stats-bar">
    <div class="pq-stats-bar-inner">
      <div class="pq-stat-item"><div class="pq-stat-value">SN 01-015</div><div class="pq-stat-label">Norme de référence</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">50+</div><div class="pq-stat-label">Documents disponibles</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">CEI</div><div class="pq-stat-label">Standards internationaux</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">Gratuit</div><div class="pq-stat-label">Accès de base</div></div>
    </div>
  </div>

  <section class="pq-section">
    <div class="pq-section-inner">
      <div class="pq-section-header">
        <div class="pq-kicker">Nos ressources</div>
        <h2 class="pq-section-title">Un centre documentaire complet</h2>
        <p class="pq-section-lead">PROQUELEC centralise les ressources normatives et pédagogiques pour tous les acteurs de l'électricité au Sénégal.</p>
      </div>
      <div class="pq-grid-3">
        <div class="pq-card">
          <div class="pq-card-icon">⚖️</div>
          <h3 class="pq-card-title">Normes nationales</h3>
          <p class="pq-card-text">La norme sénégalaise SN 01-015 et ses décrets d'application. Textes officiels, arrêtés ministériels et réglementations en vigueur.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">📘</div>
          <h3 class="pq-card-title">Guides pratiques</h3>
          <p class="pq-card-text">Guides méthodologiques pour la réalisation, le contrôle et la réception des installations électriques résidentielles, tertiaires et industrielles.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">🗒️</div>
          <h3 class="pq-card-title">Mémentos de sécurité</h3>
          <p class="pq-card-text">Fiches synthétiques sur les points essentiels de sécurité, les erreurs courantes et les bonnes pratiques d'installation.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">🌍</div>
          <h3 class="pq-card-title">Standards internationaux</h3>
          <p class="pq-card-text">Référentiels CEI (Commission Électrotechnique Internationale) et normes africaines applicables au contexte sénégalais.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">🏠</div>
          <h3 class="pq-card-title">Conseils ménages</h3>
          <p class="pq-card-text">Ressources pédagogiques accessibles à tous : comment vérifier son installation, quand appeler un professionnel, les gestes qui sauvent.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">❓</div>
          <h3 class="pq-card-title">FAQ technique</h3>
          <p class="pq-card-text">Réponses aux questions les plus fréquentes sur les normes, les obligations légales, les délais de conformité et les recours disponibles.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="pq-section pq-section-alt">
    <div class="pq-section-inner">
      <div class="pq-split">
        <div class="pq-visual">
          <div class="pq-visual-icon">📐</div>
          <div class="pq-visual-text"><strong>SN 01-015</strong><br>Norme sénégalaise pour les<br>installations électriques<br><br>Couvre : habitat, industrie,<br>ERP, éclairage public<br>Mise à jour régulière</div>
        </div>
        <div class="pq-split-text">
          <div class="pq-kicker">La norme de référence</div>
          <h2>Comprendre la SN 01-015</h2>
          <p>La norme sénégalaise SN 01-015 définit les règles de conception, de réalisation et de vérification des installations électriques. Elle est obligatoire pour tous les bâtiments neufs et les rénovations.</p>
          <p>PROQUELEC vous aide à comprendre et appliquer cette norme grâce à des guides vulgarisés, des formations pratiques et un accompagnement terrain.</p>
          <ul class="pq-list">
            <li>Applicable à tous les types de bâtiments</li>
            <li>Obligatoire depuis le décret d'application</li>
            <li>Alignée sur les standards CEI internationaux</li>
            <li>Régulièrement mise à jour par le comité technique</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="pq-cta-section">
    <h2 class="pq-cta-title">Accédez à toute la bibliothèque documentaire</h2>
    <p class="pq-cta-desc">Téléchargez gratuitement nos guides et mémentos ou abonnez-vous pour accéder aux normes complètes.</p>
    <a href="/documents" class="pq-btn pq-btn-primary">Consulter les documents</a>
  </section>

</div>`
  },

  // 7. Projets & Réalisations
  'projets': {
    title: 'Projets & Réalisations',
    meta: 'Découvrez les projets et réalisations de PROQUELEC : sécurisation des marchés, partenariat SENELEC, études territoriales et programmes de conformité.',
    content: COMMON_STYLE + `
<div class="pq-page">

  <section class="pq-hero">
    <div class="pq-hero-inner">
      <div class="pq-badge">🏗️ Projets & Réalisations</div>
      <h1 class="pq-hero-title">Des actions concrètes,<br><span>des résultats mesurables</span></h1>
      <p class="pq-hero-desc">De la sécurisation des marchés de Dakar au partenariat avec SENELEC, PROQUELEC transforme les engagements en résultats tangibles pour la sécurité électrique des Sénégalais.</p>
      <div class="pq-hero-cta">
        <a href="/contact" class="pq-btn pq-btn-primary">🤝 Proposer un projet</a>
        <a href="/nos-actions" class="pq-btn pq-btn-outline">Nos programmes</a>
      </div>
    </div>
  </section>

  <div class="pq-stats-bar">
    <div class="pq-stats-bar-inner">
      <div class="pq-stat-item"><div class="pq-stat-value">20+</div><div class="pq-stat-label">Projets réalisés</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">14</div><div class="pq-stat-label">Régions couvertes</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">SENELEC</div><div class="pq-stat-label">Partenaire stratégique</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">1995</div><div class="pq-stat-label">Depuis</div></div>
    </div>
  </div>

  <section class="pq-section">
    <div class="pq-section-inner">
      <div class="pq-section-header">
        <div class="pq-kicker">Nos réalisations phares</div>
        <h2 class="pq-section-title">Des projets qui changent la donne</h2>
        <p class="pq-section-lead">Chaque projet PROQUELEC contribue à bâtir un Sénégal plus sûr sur le plan électrique.</p>
      </div>
      <div class="pq-grid-2">
        <div class="pq-card">
          <div class="pq-card-icon">🏪</div>
          <h3 class="pq-card-title">Sécurisation des marchés populaires</h3>
          <p class="pq-card-text">Programme de mise aux normes des installations électriques dans les grands marchés de Dakar et des capitales régionales. Inspection, recommandations et suivi de la mise en conformité de plus de 200 comptoirs commerciaux.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">⚡</div>
          <h3 class="pq-card-title">Partenariat SENELEC</h3>
          <p class="pq-card-text">Collaboration stratégique avec la Société Nationale d'Électricité pour améliorer la qualité des branchements résidentiels et réduire les risques à l'interface réseau-installation intérieure.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">🏛️</div>
          <h3 class="pq-card-title">Études pour institutions</h3>
          <p class="pq-card-text">Audits techniques d'envergure réalisés pour des administrations, organisations internationales et grandes entreprises sur leurs installations électriques.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">🏘️</div>
          <h3 class="pq-card-title">Sécurisation ERP</h3>
          <p class="pq-card-text">Programme de diagnostic et mise en conformité des Établissements Recevant du Public : écoles, hôpitaux, hôtels, centres commerciaux.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">📣</div>
          <h3 class="pq-card-title">Campagnes de prévention</h3>
          <p class="pq-card-text">Campagnes nationales de sensibilisation déployées à la radio, télévision et dans les communes avec kits pédagogiques distribués aux ménages.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">🌍</div>
          <h3 class="pq-card-title">Coopération internationale</h3>
          <p class="pq-card-text">Projets menés en partenariat avec FISUEL et d'autres organisations internationales pour aligner les pratiques sénégalaises aux meilleures normes mondiales.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="pq-section pq-section-alt">
    <div class="pq-section-inner">
      <div class="pq-split">
        <div class="pq-split-text">
          <div class="pq-kicker">Galerie terrain</div>
          <h2>L'impact visible de nos interventions</h2>
          <p>Nos photos avant/après témoignent de la transformation réelle des installations traitées par nos équipes. Des câblages dangereux remplacés, des tableaux mis aux normes, des branchements sécurisés.</p>
          <ul class="pq-list">
            <li>Avant : installations vétustes et non conformes</li>
            <li>Après : câblages normalisés et protégés</li>
            <li>Délai moyen d'intervention : 15 jours</li>
            <li>Taux de satisfaction des bénéficiaires : 96%</li>
          </ul>
          <br>
          <a href="/galerie" class="pq-btn pq-btn-primary" style="display:inline-flex">📷 Voir la galerie</a>
        </div>
        <div class="pq-visual">
          <div class="pq-visual-icon">📊</div>
          <div class="pq-visual-text"><strong>Nos chiffres clés</strong><br><br>500+ diagnostics réalisés<br>200+ mises en conformité<br>100 000+ personnes sensibilisées<br>14 régions touchées<br>30 ans d'expérience</div>
        </div>
      </div>
    </div>
  </section>

  <section class="pq-cta-section">
    <h2 class="pq-cta-title">Un projet à nous soumettre ?</h2>
    <p class="pq-cta-desc">Que ce soit un audit, une campagne ou un partenariat, nous étudions toutes les propositions d'utilité publique.</p>
    <a href="/contact" class="pq-btn pq-btn-primary">Soumettre un projet</a>
  </section>

</div>`
  },

  // 8. Partenaires
  'partenaires-liste': {
    title: 'Partenaires',
    meta: 'Les partenaires institutionnels, techniques, financiers et privés de PROQUELEC pour la promotion de la sécurité électrique au Sénégal.',
    content: COMMON_STYLE + `
<div class="pq-page">

  <section class="pq-hero">
    <div class="pq-hero-inner">
      <div class="pq-badge">🤝 Nos Partenaires</div>
      <h1 class="pq-hero-title">Un réseau de partenaires<br><span>engagés pour la sécurité</span></h1>
      <p class="pq-hero-desc">PROQUELEC ne peut accomplir sa mission qu'en s'appuyant sur un réseau solide de partenaires institutionnels, techniques, financiers et privés qui partagent la même ambition : un Sénégal électrique plus sûr.</p>
      <div class="pq-hero-cta">
        <a href="/contact" class="pq-btn pq-btn-primary">🤝 Devenir partenaire</a>
        <a href="/espace-partenaires" class="pq-btn pq-btn-outline">Espace partenaires</a>
      </div>
    </div>
  </section>

  <div class="pq-stats-bar">
    <div class="pq-stats-bar-inner">
      <div class="pq-stat-item"><div class="pq-stat-value">4</div><div class="pq-stat-label">Catégories de partenaires</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">30+</div><div class="pq-stat-label">Organisations partenaires</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">FISUEL</div><div class="pq-stat-label">Partenaire international</div></div>
      <div class="pq-stat-item"><div class="pq-stat-value">SENELEC</div><div class="pq-stat-label">Partenaire stratégique</div></div>
    </div>
  </div>

  <section class="pq-section">
    <div class="pq-section-inner">
      <div class="pq-section-header">
        <div class="pq-kicker">Nos partenaires</div>
        <h2 class="pq-section-title">Quatre catégories de partenariats</h2>
        <p class="pq-section-lead">Notre réseau couvre tous les segments nécessaires à une action efficace et durable en faveur de la sécurité électrique.</p>
      </div>
      <div class="pq-grid-2">
        <div class="pq-card">
          <div class="pq-card-icon">🏛️</div>
          <h3 class="pq-card-title">Partenaires institutionnels</h3>
          <p class="pq-card-text">Ministères (Énergie, Habitat, Commerce), agences gouvernementales, collectivités territoriales et organisations internationales comme FISUEL qui légitiment notre action et co-financent nos programmes.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">🔧</div>
          <h3 class="pq-card-title">Partenaires techniques</h3>
          <p class="pq-card-text">SENELEC, bureaux d'études, fabricants d'équipements électriques, laboratoires d'essais et organismes de normalisation qui apportent leur expertise technique à nos interventions.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">💰</div>
          <h3 class="pq-card-title">Partenaires financiers</h3>
          <p class="pq-card-text">Banques de développement, fonds d'investissement et bailleurs internationaux qui soutiennent nos programmes de long terme et nos études d'envergure nationale.</p>
        </div>
        <div class="pq-card">
          <div class="pq-card-icon">🏢</div>
          <h3 class="pq-card-title">Partenaires privés</h3>
          <p class="pq-card-text">Entreprises de BTP, distributeurs de matériel électrique, compagnies d'assurance et grandes entreprises qui intègrent nos standards dans leurs pratiques professionnelles.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="pq-section pq-section-alt">
    <div class="pq-section-inner">
      <div class="pq-split">
        <div class="pq-split-text">
          <div class="pq-kicker">Devenir partenaire</div>
          <h2>Rejoignez notre réseau</h2>
          <p>Vous partagez nos valeurs de sécurité, de qualité et de service public ? Devenez partenaire PROQUELEC et contribuez à sécuriser les installations électriques au Sénégal.</p>
          <ul class="pq-list">
            <li>Visibilité sur nos supports de communication</li>
            <li>Accès à notre réseau de professionnels certifiés</li>
            <li>Participation aux événements et séminaires PROQUELEC</li>
            <li>Co-construction de programmes d'action communs</li>
            <li>Mention dans notre rapport annuel d'activité</li>
          </ul>
          <br>
          <a href="/contact" class="pq-btn pq-btn-primary" style="display:inline-flex">Nous contacter</a>
        </div>
        <div class="pq-visual">
          <div class="pq-visual-icon">🌐</div>
          <div class="pq-visual-text"><strong>Partenaires notables</strong><br><br>🔋 SENELEC<br>🌍 FISUEL<br>🏛️ Ministère de l'Énergie<br>🏛️ Ministère du Commerce<br>+ 25 partenaires actifs</div>
        </div>
      </div>
    </div>
  </section>

  <section class="pq-section">
    <div class="pq-section-inner">
      <div class="pq-section-header">
        <div class="pq-kicker">Cadre de partenariat</div>
        <h2 class="pq-section-title">Comment nous collaborons</h2>
      </div>
      <div class="pq-steps">
        <div class="pq-step"><div class="pq-step-num">1</div><div class="pq-step-content"><h4 class="pq-step-title">Prise de contact</h4><p class="pq-step-text">Envoyez-nous votre lettre d'intention décrivant votre organisation, votre domaine d'activité et vos objectifs de partenariat.</p></div></div>
        <div class="pq-step"><div class="pq-step-num">2</div><div class="pq-step-content"><h4 class="pq-step-title">Réunion d'évaluation</h4><p class="pq-step-text">Notre équipe vous rencontre pour évaluer la complémentarité et définir les modalités de collaboration envisageables.</p></div></div>
        <div class="pq-step"><div class="pq-step-num">3</div><div class="pq-step-content"><h4 class="pq-step-title">Convention de partenariat</h4><p class="pq-step-text">Signature d'une convention formalisée définissant les engagements réciproques, les livrables et la durée du partenariat.</p></div></div>
        <div class="pq-step"><div class="pq-step-num">4</div><div class="pq-step-content"><h4 class="pq-step-title">Mise en œuvre & suivi</h4><p class="pq-step-text">Démarrage des activités communes avec un point de suivi trimestriel et un bilan annuel partagé.</p></div></div>
      </div>
    </div>
  </section>

  <section class="pq-cta-section">
    <h2 class="pq-cta-title">Intéressé par un partenariat ?</h2>
    <p class="pq-cta-desc">Contactez notre responsable des partenariats pour étudier les possibilités de collaboration.</p>
    <a href="/contact" class="pq-btn pq-btn-primary">Initier un partenariat</a>
  </section>

</div>`
  },

  // 9. Mentions Légales
  'legal': {
    title: 'Mentions Légales',
    meta: 'Mentions légales et conditions d\'utilisation du site PROQUELEC Sénégal. Informations sur l\'éditeur, l\'hébergement et la protection des données.',
    content: COMMON_STYLE + `
<div class="pq-page">

  <section class="pq-hero" style="padding: 60px 24px 72px;">
    <div class="pq-hero-inner">
      <div class="pq-badge">⚖️ Informations Légales</div>
      <h1 class="pq-hero-title" style="font-size:clamp(1.8rem,4vw,2.6rem)">Mentions Légales</h1>
      <p class="pq-hero-desc">Informations légales et réglementaires relatives au site web de PROQUELEC SÉNÉGAL.</p>
    </div>
  </section>

  <section class="pq-section">
    <div class="pq-section-inner" style="max-width:800px;">

      <div class="pq-highlight">
        <p>📅 Dernière mise à jour : Juin 2026 — Ces mentions légales sont susceptibles d'être modifiées à tout moment. Nous vous invitons à les consulter régulièrement.</p>
      </div>

      <div style="margin-top: 48px;">
        <div class="pq-kicker">Éditeur du site</div>
        <h2 class="pq-section-title" style="text-align:left; font-size:1.6rem;">Informations sur l'éditeur</h2>
        <div class="pq-card" style="margin-top: 20px;">
          <ul class="pq-list">
            <li><strong>Raison sociale :</strong> PROQUELEC — Promotion de la Qualité des Installations Électriques</li>
            <li><strong>Forme juridique :</strong> Association à but non lucratif — Loi sénégalaise n° 68-08</li>
            <li><strong>NINEA :</strong> 0191403 089</li>
            <li><strong>Siège social :</strong> Immeuble Coumba Castel, 12 rue Saint-Michel, 4ᵉ étage, Dakar, Sénégal</li>
            <li><strong>Téléphone :</strong> +221 33 848 68 55</li>
            <li><strong>Email :</strong> proquelec@proquelec.sn</li>
            <li><strong>Directeur de publication :</strong> Le Président de PROQUELEC</li>
          </ul>
        </div>
      </div>

      <div style="margin-top: 48px;">
        <div class="pq-kicker">Hébergement</div>
        <h2 class="pq-section-title" style="text-align:left; font-size:1.6rem;">Hébergeur du site</h2>
        <div class="pq-card" style="margin-top: 20px;">
          <ul class="pq-list">
            <li><strong>Hébergeur :</strong> Serveur privé virtuel (VPS) dédié</li>
            <li><strong>Localisation des serveurs :</strong> Europe / Afrique</li>
            <li><strong>Infrastructure :</strong> Architecture sécurisée avec sauvegarde quotidienne</li>
          </ul>
        </div>
      </div>

      <div style="margin-top: 48px;">
        <div class="pq-kicker">Propriété intellectuelle</div>
        <h2 class="pq-section-title" style="text-align:left; font-size:1.6rem;">Droits & contenus</h2>
        <div class="pq-card" style="margin-top: 20px;">
          <p class="pq-card-text" style="margin-bottom: 16px;">L'ensemble des contenus présents sur ce site (textes, images, logos, icônes, documents téléchargeables) sont la propriété exclusive de PROQUELEC ou de ses partenaires et sont protégés par la législation sénégalaise et internationale relative à la propriété intellectuelle.</p>
          <p class="pq-card-text">Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site est interdite sans autorisation écrite préalable de PROQUELEC, sauf pour un usage strictement personnel et non commercial.</p>
        </div>
      </div>

      <div style="margin-top: 48px;">
        <div class="pq-kicker">Protection des données</div>
        <h2 class="pq-section-title" style="text-align:left; font-size:1.6rem;">Données personnelles</h2>
        <div class="pq-card" style="margin-top: 20px;">
          <p class="pq-card-text" style="margin-bottom: 16px;">PROQUELEC s'engage à protéger la confidentialité des informations personnelles que vous nous communiquez. Les données collectées via les formulaires de contact sont utilisées exclusivement pour répondre à vos demandes et ne sont jamais cédées à des tiers.</p>
          <ul class="pq-list" style="margin-top: 12px;">
            <li>Droit d'accès, de rectification et de suppression de vos données</li>
            <li>Aucune vente ou cession de données à des tiers</li>
            <li>Données conservées le temps nécessaire au traitement de votre demande</li>
            <li>Contact DPO : proquelec@proquelec.sn</li>
          </ul>
        </div>
      </div>

      <div style="margin-top: 48px;">
        <div class="pq-kicker">Responsabilité</div>
        <h2 class="pq-section-title" style="text-align:left; font-size:1.6rem;">Limitation de responsabilité</h2>
        <div class="pq-card" style="margin-top: 20px;">
          <p class="pq-card-text">PROQUELEC s'efforce de maintenir les informations publiées sur ce site exactes et à jour. Toutefois, PROQUELEC ne peut garantir l'exhaustivité et l'exactitude des informations diffusées. PROQUELEC décline toute responsabilité pour tout dommage résultant d'une intrusion frauduleuse d'un tiers ou d'une information incorrecte publiée sur son site.</p>
        </div>
      </div>

      <div style="margin-top: 48px; padding: 32px; background: var(--pq-gray-50); border-radius: var(--pq-radius); text-align: center;">
        <p style="color: var(--pq-gray-600); font-size: 0.9rem;">Pour toute question relative à ces mentions légales, contactez-nous à :<br><strong style="color: var(--pq-blue);">proquelec@proquelec.sn</strong></p>
      </div>

    </div>
  </section>

</div>`
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// INJECTION EN BASE
// ─────────────────────────────────────────────────────────────────────────────

async function seedPages() {
  const client = await pool.connect();
  try {
    let updated = 0, skipped = 0;

    for (const [slug, data] of Object.entries(PAGES_CONTENT)) {
      // Vérifie que la page existe
      const res = await client.query(`SELECT id, slug FROM pages WHERE slug = $1 LIMIT 1`, [slug]);
      if (res.rows.length === 0) {
        console.log(`  ⚠️  Page "${slug}" introuvable en base — ignorée`);
        skipped++;
        continue;
      }

      const pageId = res.rows[0].id;

      // Structure builder avec un bloc HtmlBlock
      const structureJson = {
        ROOT: {
          type: 'div',
          nodes: ['html_wrapper'],
          props: { style: {} },
          linkedNodes: {}
        },
        html_block: {
          type: { resolvedName: 'HtmlBlock' },
          nodes: [],
          props: { html: data.content, padding: 0, hideLabel: true },
          parent: 'html_wrapper',
          isCanvas: false,
          displayName: 'HtmlBlock',
          linkedNodes: {}
        },
        html_wrapper: {
          type: { resolvedName: 'ContainerBlock' },
          nodes: ['html_block'],
          props: { padding: 0, maxWidth: '100%', paddingY: 0, backgroundColor: '#ffffff' },
          parent: 'ROOT',
          isCanvas: true,
          displayName: 'ContainerBlock',
          linkedNodes: {}
        }
      };

      await client.query(
        `UPDATE pages
         SET structure_json   = $1,
             draft_json       = $1,
             content          = $2,
             content_raw      = $2,
             meta_description = $3,
             status           = 'published',
             is_published     = true,
             editor_engine    = 'visual_blocks',
             render_engine    = 'raw',
             updated_at       = NOW()
         WHERE id = $4`,
        [JSON.stringify(structureJson), data.content, data.meta, pageId]
      );

      console.log(`  ✅  Page "${slug}" mise à jour (${data.title})`);
      updated++;
    }

    console.log(`\n📊 Résumé : ${updated} pages mises à jour, ${skipped} ignorées.`);
  } finally {
    client.release();
    await pool.end();
  }
}

seedPages()
  .then(() => { console.log('\n✨ Seed terminé avec succès !'); process.exit(0); })
  .catch(err => { console.error('\n❌ Erreur :', err.message); process.exit(1); });
