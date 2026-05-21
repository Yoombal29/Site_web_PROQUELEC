-- Create trainings page with complete content and navigation
INSERT INTO pages (
  id,
  title,
  slug,
  content,
  custom_css,
  meta_description,
  meta_keywords,
  is_published,
  show_hero,
  hero_title,
  hero_subtitle,
  template,
  menu_order
) VALUES (
  gen_random_uuid(),
  'Formations PROQUELEC',
  'trainings',
  '<div class="training-navigation">
    <nav class="mb-8">
      <h3 class="text-lg font-semibold mb-4">Navigation rapide</h3>
      <ul class="flex flex-wrap gap-2">
        <li><a href="#debutant" class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition-colors">Débutant</a></li>
        <li><a href="#intermediaire" class="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm hover:bg-green-200 transition-colors">Intermédiaire</a></li>
        <li><a href="#avance" class="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm hover:bg-purple-200 transition-colors">Avancé</a></li>
        <li><a href="#calendrier" class="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm hover:bg-red-200 transition-colors">Calendrier</a></li>
        <li><a href="#tarifs" class="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm hover:bg-yellow-200 transition-colors">Tarifs</a></li>
        <li><a href="#contact" class="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors">Contact</a></li>
      </ul>
    </nav>
  </div>

<h2>Centre de Formation PROQUELEC</h2>

<p>Développez vos compétences avec nos formations professionnelles en électricité, du débutant à l''expert avec des équipements modernes et des formateurs certifiés.</p>

<h3 id="debutant">🎓 Niveau Débutant</h3>

<h4>Fondamentaux de l''Électricité</h4>
<p>Introduction complète aux principes de l''électricité, sécurité de base et installations simples.</p>
<ul>
<li>Principes fondamentaux (tension, intensité, résistance)</li>
<li>Sécurité électrique de base</li>
<li>Lecture de schémas électriques</li>
<li>Installation de circuits simples</li>
</ul>
<p><a href="#calendrier" class="text-blue-600 hover:text-blue-800 font-medium">Voir les dates disponibles →</a></p>

<h4>Initiation à l''Électrotechnique</h4>
<p>Découverte des composants électroniques et des systèmes électriques de base.</p>
<ul>
<li>Composants électroniques</li>
<li>Systèmes de commande</li>
<li>Protection des circuits</li>
<li>Maintenance préventive</li>
</ul>
<p><a href="#calendrier" class="text-blue-600 hover:text-blue-800 font-medium">Voir les dates disponibles →</a></p>

<h3 id="intermediaire">⚡ Niveau Intermédiaire</h3>

<h4>Installation Électrique Résidentielle</h4>
<p>Maîtrisez l''installation complète des réseaux électriques pour les bâtiments résidentiels.</p>
<ul>
<li>Normes NF C 15-100</li>
<li>Tableaux électriques</li>
<li>Éclairage et prises</li>
<li>Mise à la terre</li>
</ul>
<p><a href="#calendrier" class="text-blue-600 hover:text-blue-800 font-medium">Voir les dates disponibles →</a></p>

<h4>Électricité Industrielle</h4>
<p>Installation et maintenance des équipements électriques industriels.</p>
<ul>
<li>Équipements haute puissance</li>
<li>Protection des moteurs</li>
<li>Automatismes industriels</li>
<li>Maintenance curative</li>
</ul>
<p><a href="#calendrier" class="text-blue-600 hover:text-blue-800 font-medium">Voir les dates disponibles →</a></p>

<h3 id="avance">🔧 Niveau Avancé</h3>

<h4>Diagnostic Électrique</h4>
<p>Techniques avancées de diagnostic et rédaction de rapports de conformité.</p>
<ul>
<li>Diagnostic par thermographie</li>
<li>Mesures et analyses</li>
<li>Rédaction de rapports</li>
<li>Recommandations techniques</li>
</ul>
<p><a href="#calendrier" class="text-blue-600 hover:text-blue-800 font-medium">Voir les dates disponibles →</a></p>

<h4>Énergies Renouvelables</h4>
<p>Intégration des énergies renouvelables dans les installations électriques.</p>
<ul>
<li>Panneaux photovoltaïques</li>
<li>Éoliennes domestiques</li>
<li>Stockage d''énergie</li>
<li>Raccordement au réseau</li>
</ul>
<p><a href="#calendrier" class="text-blue-600 hover:text-blue-800 font-medium">Voir les dates disponibles →</a></p>

<h3 id="calendrier">📅 Calendrier des Formations</h3>

<div class="calendar-section">
  <p class="mb-6">Découvrez notre planning de formations pour les prochains mois. Cliquez sur les liens ci-dessous pour voir les détails de chaque session.</p>

  <div class="formation-types-grid">
    <div class="formation-type-card">
      <h4>🏠 Électricité Résidentielle</h4>
      <ul>
        <li><a href="#session-1" class="formation-link">Session 15-17 Janvier 2025</a> - Complet</li>
        <li><a href="#session-2" class="formation-link">Session 12-14 Février 2025</a> - 5 places</li>
        <li><a href="#session-3" class="formation-link">Session 10-12 Mars 2025</a> - 8 places</li>
      </ul>
    </div>

    <div class="formation-type-card">
      <h4>🏭 Électricité Industrielle</h4>
      <ul>
        <li><a href="#session-4" class="formation-link">Session 20-24 Janvier 2025</a> - 3 places</li>
        <li><a href="#session-5" class="formation-link">Session 17-21 Mars 2025</a> - 6 places</li>
        <li><a href="#session-6" class="formation-link">Session 14-18 Avril 2025</a> - 10 places</li>
      </ul>
    </div>

    <div class="formation-type-card">
      <h4>🔬 Diagnostic & Maintenance</h4>
      <ul>
        <li><a href="#session-7" class="formation-link">Session 5-7 Février 2025</a> - 4 places</li>
        <li><a href="#session-8" class="formation-link">Session 15-17 Avril 2025</a> - 7 places</li>
        <li><a href="#session-9" class="formation-link">Session 20-22 Mai 2025</a> - 9 places</li>
      </ul>
    </div>

    <div class="formation-type-card">
      <h4>☀️ Énergies Renouvelables</h4>
      <ul>
        <li><a href="#session-10" class="formation-link">Session 25-27 Février 2025</a> - 6 places</li>
        <li><a href="#session-11" class="formation-link">Session 10-12 Mai 2025</a> - 8 places</li>
        <li><a href="#session-12" class="formation-link">Session 15-17 Juin 2025</a> - 12 places</li>
      </ul>
    </div>

    <div class="formation-type-card">
      <h4>🛡️ Sécurité Électrique</h4>
      <ul>
        <li><a href="#session-13" class="formation-link">Session 8-9 Janvier 2025</a> - 2 places</li>
        <li><a href="#session-14" class="formation-link">Session 5-6 Mars 2025</a> - 5 places</li>
        <li><a href="#session-15" class="formation-link">Session 10-11 Mai 2025</a> - 7 places</li>
      </ul>
    </div>

    <div class="formation-type-card">
      <h4>📊 Automatismes</h4>
      <ul>
        <li><a href="#session-16" class="formation-link">Session 22-26 Avril 2025</a> - 4 places</li>
        <li><a href="#session-17" class="formation-link">Session 19-23 Mai 2025</a> - 6 places</li>
        <li><a href="#session-18" class="formation-link">Session 16-20 Juin 2025</a> - 8 places</li>
      </ul>
    </div>
  </div>
</div>

<h3>📋 Modalités Pédagogiques</h3>

<h4>Méthodes d''enseignement :</h4>
<ul>
<li><strong>Cours théoriques</strong> : Apports fondamentaux et réglementaires</li>
<li><strong>Travaux pratiques</strong> : Manipulation d''équipements réels</li>
<li><strong>Études de cas</strong> : Analyse de situations réelles</li>
<li><strong>Projets individuels</strong> : Mise en application des compétences</li>
</ul>

<h4>Formats disponibles :</h4>
<ul>
<li><strong>Présentiel</strong> : Formation en face à face au centre</li>
<li><strong>En ligne</strong> : Formation à distance interactive</li>
<li><strong>Hybride</strong> : Combinaison présentiel/distance</li>
<li><strong>Sur mesure</strong> : Formation adaptée à vos besoins</li>
</ul>

<h3 id="tarifs">💰 Tarifs et Financement</h3>

<h4>Grille tarifaire :</h4>
<ul>
<li><strong>Formations courtes</strong> : 50 000 - 150 000 FCFA</li>
<li><strong>Formations standards</strong> : 200 000 - 500 000 FCFA</li>
<li><strong>Formations longues</strong> : 800 000 - 2 000 000 FCFA</li>
</ul>

<h4>Options de financement :</h4>
<ul>
<li>Paiement individuel</li>
<li>Prise en charge employeur</li>
<li>Financement formation</li>
<li>CPF (sous conditions)</li>
</ul>

<h3>🎯 Certification et Validation</h3>

<h4>Attestations délivrées :</h4>
<ul>
<li><strong>Attestation de formation</strong> : Validation des acquis</li>
<li><strong>Certificat de compétences</strong> : Validation des savoir-faire</li>
<li><strong>Diplôme PROQUELEC</strong> : Reconnaissance officielle</li>
</ul>

<h4>Évaluation des compétences :</h4>
<ul>
<li>Contrôle continu des connaissances</li>
<li>Évaluation pratique des compétences</li>
<li>Projet final de synthèse</li>
<li>Jury d''experts pour validation</li>
</ul>

<h3>🏢 Infrastructures</h3>

<h4>Plateforme de formation :</h4>
<ul>
<li>Salles de cours équipées</li>
<li>Ateliers techniques complets</li>
<li>Laboratoire d''électricité</li>
<li>Équipements pédagogiques modernes</li>
</ul>

<h4>Environnement numérique :</h4>
<ul>
<li>Plateforme e-learning</li>
<li>Support de cours en ligne</li>
<li>Vidéos pédagogiques</li>
<li>Tests d''évaluation interactifs</li>
</ul>

<h3 id="contact">📞 Contact et Inscription</h3>

<p>Pour vous inscrire à nos formations ou obtenir plus d''informations :</p>

<ul>
<li><strong>Service Formation</strong> : formation@proquelec.sn</li>
<li><strong>Inscription en ligne</strong> : Via notre plateforme</li>
<li><strong>Téléphone</strong> : +221 XX XXX XX XX</li>
<li><strong>Permanence</strong> : Lundi au vendredi, 8h00 - 17h00</li>
</ul>

<p><strong>Places limitées - Inscrivez-vous dès maintenant !</strong></p>',
  '/* Navigation rapide */
.training-navigation nav ul {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.training-navigation nav ul li {
  margin: 0;
}

/* Section calendrier */
.calendar-section {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem;
  border-radius: 1rem;
  margin: 2rem 0;
}

.formation-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.formation-type-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.formation-type-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.formation-type-card h4 {
  color: #1f2937;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.formation-type-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.formation-type-card li {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  border-left: 3px solid #3b82f6;
}

.formation-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.formation-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

/* Liens vers calendrier dans les sections */
.text-blue-600 {
  color: #2563eb;
}

.text-blue-600:hover {
  color: #1d4ed8;
}

/* Responsive */
@media (max-width: 768px) {
  .formation-types-grid {
    grid-template-columns: 1fr;
  }

  .training-navigation nav ul {
    justify-content: center;
  }
}',
  'Suivez nos formations professionnelles en électricité. Cours pour débutants, intermédiaires et experts avec certification. Centre de formation PROQUELEC.',
  'formations électriques, cours électricité, formation professionnelle, PROQUELEC, certification électricien, apprentissage électricité',
  true,
  true,
  'Formations',
  'Développez vos compétences en électricité',
  'default',
  5
) ON CONFLICT (slug) DO UPDATE SET
  content = EXCLUDED.content,
  custom_css = EXCLUDED.custom_css,
  meta_description = EXCLUDED.meta_description,
  meta_keywords = EXCLUDED.meta_keywords,
  hero_title = EXCLUDED.hero_title,
  hero_subtitle = EXCLUDED.hero_subtitle;
