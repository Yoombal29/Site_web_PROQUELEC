-- Update Events page with complete content and structure
UPDATE pages SET
  content = '<h2>Calendrier des Événements PROQUELEC</h2>

<p>Découvrez nos conférences, ateliers, webinaires et formations. Restez informé des dernières actualités du secteur électrique sénégalais.</p>

<h3>📅 Événements à Venir</h3>

<h4>🏛️ Salons et Conférences</h4>
<p><strong>Salon International de l''Électricité</strong> - 15 juin 2024<br>
Le plus grand rassemblement des professionnels de l''électricité en Afrique de l''Ouest. Découvrez les dernières innovations et technologies du secteur.</p>

<p><strong>Conférence Annuelle PROQUELEC</strong> - Septembre 2024<br>
Bilan annuel, perspectives et stratégies pour l''excellence électrique au Sénégal.</p>

<h4>🔧 Ateliers Pratiques</h4>
<p><strong>Atelier : Conformité NFC 15-100</strong> - 20 mai 2024<br>
Session pratique sur les dernières mises à jour de la norme NFC 15-100 et les exigences de conformité.</p>

<p><strong>Atelier : Diagnostic Électrique</strong> - Juin 2024<br>
Techniques avancées de diagnostic et maintenance préventive des installations électriques.</p>

<h4>💻 Webinaires en Ligne</h4>
<p><strong>Webinaire : Sécurité Électrique</strong> - 25 avril 2024<br>
Les bonnes pratiques de sécurité électrique pour les installations domestiques et professionnelles.</p>

<p><strong>Webinaire : Énergies Renouvelables</strong> - Mai 2024<br>
Intégration des énergies renouvelables dans les installations électriques existantes.</p>

<h4>🚪 Journées Portes Ouvertes</h4>
<p><strong>Journée Portes Ouvertes PROQUELEC</strong> - 10 juillet 2024<br>
Découvrez nos installations, rencontrez notre équipe et assistez à des démonstrations techniques.</p>

<h3>🎯 Types d''Événements</h3>

<h4>🏛️ Conférences</h4>
<p>Événements majeurs rassemblant experts, professionnels et institutionnels pour échanger sur les enjeux du secteur électrique.</p>

<h4>🔧 Ateliers</h4>
<p>Sessions pratiques et interactives pour développer vos compétences techniques et opérationnelles.</p>

<h4>💻 Webinaires</h4>
<p>Formation à distance accessible partout, avec interactions en temps réel et supports de cours numériques.</p>

<h4>🚪 Journées Portes Ouvertes</h4>
<p>Rencontres informelles pour découvrir notre organisation, nos méthodes et nos équipes.</p>

<h3>📋 Inscription et Participation</h3>

<h4>Modalités d''inscription :</h4>
<ul>
<li>📝 Formulaire en ligne sur notre site</li>
<li>📞 Contact téléphonique pour les groupes</li>
<li>📧 Confirmation par email avec convocation</li>
<li>💳 Paiement sécurisé pour les événements payants</li>
</ul>

<h4>Conditions de participation :</h4>
<ul>
<li>✅ Respect du règlement intérieur</li>
<li>⏰ Ponctualité et présence effective</li>
<li>🤝 Participation active aux échanges</li>
<li>📜 Respect de la confidentialité si nécessaire</li>
</ul>

<h3>🎓 Programme Pédagogique</h3>

<p>Nos événements sont conçus pour répondre aux besoins de formation et d''information des professionnels de l''électricité :</p>

<ul>
<li><strong>Formation technique</strong> : Mise à jour des connaissances et compétences</li>
<li><strong>Information réglementaire</strong> : Évolutions normatives et légales</li>
<li><strong>Échanges professionnels</strong> : Networking et partage d''expériences</li>
<li><strong>Innovation technologique</strong> : Découverte des nouvelles solutions</li>
</ul>

<h3>📞 Contact et Renseignements</h3>

<p>Pour toute information complémentaire ou demande spécifique concernant nos événements :</p>

<ul>
<li><strong>Service Formation</strong> : formation@proquelec.sn</li>
<li><strong>Service Événements</strong> : evenements@proquelec.sn</li>
<li><strong>Inscriptions</strong> : inscriptions@proquelec.sn</li>
</ul>

<p><strong>Téléphone</strong> : +221 XX XXX XX XX<br>
<strong>Horaires</strong> : Lundi au vendredi, 8h00 - 17h00</p>',
  meta_description = 'Découvrez nos événements : conférences, ateliers, webinaires et formations sur l''électricité au Sénégal. Calendrier complet des manifestations PROQUELEC.',
  meta_keywords = 'événements PROQUELEC, conférences électriques, ateliers formation, webinaires, calendrier événements, formation professionnelle',
  hero_title = 'Événements',
  hero_subtitle = 'Conférences, ateliers et formations professionnelles'
WHERE slug = 'events';
