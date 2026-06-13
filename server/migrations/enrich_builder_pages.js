/**
 * enrich_builder_pages.js
 * Enrichit les pages Builder converties depuis page_sections avec du contenu riche :
 * blocs FeatureCards, StatsGrid, Testimonials, TextImage, CTA, etc.
 *
 * Usage: node server/migrations/enrich_builder_pages.js
 */
const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

let blockCounter = Date.now();

function uid(prefix) {
  blockCounter++;
  return `${prefix}-${blockCounter}`;
}

function hero(title, subtitle, badge, image) {
  const props = { title, subtitle, badge: badge || 'PROQUELEC' };
  if (image) props.image = image;
  return {
    id: uid('hero'),
    type: 'HeroBanner',
    version: 1,
    enabled: true,
    props: { ...props, layout: 'centered', features: [] },
    metadata: { label: 'Bannière', description: subtitle },
  };
}

function features(title, subtitle, items, opts = {}) {
  return {
    id: uid('features'),
    type: 'FeatureCards',
    version: 1,
    enabled: true,
    props: {
      title,
      subtitle: subtitle || '',
      badge: opts.badge || '',
      layout: opts.layout || 'grid-3',
      features: items.map((f, i) => ({
        title: f.title || '',
        description: f.description || '',
        icon: f.icon || ['Shield', 'Zap', 'Award', 'BookOpen', 'Users', 'Settings'][i % 6],
        image: f.image || '',
      })),
    },
    metadata: { label: opts.label || 'Fonctionnalités', description: subtitle },
  };
}

function stats(title, subtitle, items) {
  return {
    id: uid('stats'),
    type: 'StatsGrid',
    version: 1,
    enabled: true,
    props: {
      title: title || '',
      subtitle: subtitle || '',
      stats: items.map((s) => ({
        value: s.value,
        label: s.label,
        description: s.description || '',
      })),
    },
    metadata: { label: 'Statistiques', description: subtitle },
  };
}

function testimonials(title, subtitle, items) {
  return {
    id: uid('testimonials'),
    type: 'Testimonials',
    version: 1,
    enabled: true,
    props: {
      title: title || 'Témoignages',
      subtitle: subtitle || '',
      testimonials: items.map((t) => ({
        name: t.name,
        role: t.role || '',
        company: t.company || '',
        content: t.content,
        avatar: t.avatar || '',
        rating: t.rating || 5,
      })),
    },
    metadata: { label: 'Témoignages', description: subtitle },
  };
}

function textImage(title, subtitle, body, image, layout) {
  return {
    id: uid('textimage'),
    type: 'TextImage',
    version: 1,
    enabled: true,
    props: {
      title,
      subtitle: subtitle || '',
      description: body || '',
      image: image || 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80',
      layout: layout || 'left-right',
      features: [],
    },
    metadata: { label: 'Section contenu', description: subtitle },
  };
}

function gallery(title, subtitle, images) {
  return {
    id: uid('gallery'),
    type: 'MediaGallery',
    version: 1,
    enabled: true,
    props: {
      title: title || '',
      subtitle: subtitle || '',
      layout: 'grid-3',
      images: images.map((url) => ({ url, caption: '', alt: '' })),
    },
    metadata: { label: 'Galerie', description: subtitle },
  };
}

function faq(title, subtitle, items) {
  return {
    id: uid('faq'),
    type: 'FaqBlock',
    version: 1,
    enabled: true,
    props: {
      title: title || 'Questions fréquentes',
      subtitle: subtitle || '',
      items: items.map((q) => ({ question: q.q, answer: q.a })),
    },
    metadata: { label: 'FAQ', description: subtitle },
  };
}

// ── Définition du contenu riche par page ──
const PAGE_ENRICHMENTS = {
  home: {
    after: 0,
    blocks: [
      features(
        'Des Services Sur-Mesure',
        'Que vous soyez indépendant, une entreprise ou un expert membre, PROQUELEC vous accompagne avec des outils dédiés.',
        [
          { title: 'Électriciens & Artisans', description: 'Normes gratuites, calculateurs pro et générateur de schémas pour vos dossiers techniques.', icon: 'Zap' },
          { title: 'Entreprises & Installateurs', description: 'Gérez vos chantiers, certifications et bénéficiez d\'une visibilité accrue sur l\'annuaire national.', icon: 'Building2' },
          { title: 'Membres & Experts', description: 'Participez à la vie de l\'institution, veille normative en avant-première et support prioritaire.', icon: 'Users' },
        ],
        { badge: 'PUBLICS', layout: 'grid-3' }
      ),
      stats(
        'PROQUELEC en chiffres',
        'L\'impact de notre action sur le secteur électrique sénégalais',
        [
          { value: '1500+', label: 'Professionnels certifiés', description: 'Électriciens et installateurs formés et agréés' },
          { value: '300+', label: 'Entreprises partenaires', description: 'Entreprises engagées dans la qualité électrique' },
          { value: '98%', label: 'Taux de conformité', description: 'Des installations contrôlées conformes aux normes' },
          { value: '50+', label: 'Experts techniques', description: 'Ingénieurs et techniciens à votre service' },
        ]
      ),
      textImage(
        'La Référence Nationale',
        'Sécurité, Qualité, Formation',
        "PROQUELEC est l'organisme de référence au Sénégal pour la certification des installations électriques, la formation des professionnels et la normalisation du secteur. Agréé par l'État sénégalais, nous accompagnons chaque acteur de la filière électrique vers l'excellence et la conformité.",
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
        'left-right'
      ),
    ],
  },

  'utilite-publique': {
    after: 0,
    blocks: [
      features(
        'Services aux Institutions',
        'Accompagnement des collectivités et services publics dans la sécurisation des infrastructures électriques.',
        [
          { title: 'Audit des Installations', description: 'Diagnostic complet des bâtiments et équipements publics.', icon: 'Search' },
          { title: 'Assistance Technique', description: 'Appui à la rédaction des cahiers des charges et au contrôle des travaux.', icon: 'FileText' },
          { title: 'Formation des Agents', description: 'Programmes de formation pour les techniciens des collectivités.', icon: 'GraduationCap' },
          { title: 'Normalisation', description: 'Veille normative et application des standards internationaux.', icon: 'BookOpen' },
          { title: 'Sécurisation des Réseaux', description: 'Protection des infrastructures critiques contre les risques électriques.', icon: 'Shield' },
          { title: 'Rapports & Études', description: 'Production de rapports techniques et études de conformité.', icon: 'BarChart3' },
        ],
        { badge: 'SERVICES PUBLICS' }
      ),
      stats(
        'Impact sur le secteur public',
        '',
        [
          { value: '200+', label: 'Bâtiments audités', description: '' },
          { value: '45', label: 'Collectivités accompagnées', description: '' },
          { value: '500+', label: 'Agents formés', description: '' },
          { value: '98%', label: 'Conformité', description: '' },
        ]
      ),
    ],
  },

  'formation-certification': {
    after: 0,
    blocks: [
      features(
        'Nos Programmes',
        'Parcours complets de formation et certification pour les professionnels de l\'électricité.',
        [
          { title: 'Certification Initiale', description: 'Obtention du label PROQUELEC pour les installateurs.', icon: 'Award' },
          { title: 'Formation Continue', description: 'Mise à jour des compétences et veille normative.', icon: 'RefreshCw' },
          { title: 'Habilitation Électrique', description: 'Préparation aux habilitations B0, B1, B2, BR, BC.', icon: 'Zap' },
          { title: 'Diagnostic & Contrôle', description: 'Maîtrise des techniques d\'inspection et de mesure.', icon: 'ClipboardCheck' },
          { title: 'Management Qualité', description: 'Systèmes de management de la qualité en entreprise.', icon: 'TrendingUp' },
          { title: 'Sécurité des Installations', description: 'Prévention des risques électriques et conformité NFC.', icon: 'Shield' },
        ],
        { badge: 'NOS PROGRAMMES' }
      ),
      stats('Chiffres clés', '', [
        { value: '98%', label: 'Taux de réussite', description: '' },
        { value: '15+', label: 'Années d\'expérience', description: '' },
        { value: '3000+', label: 'Professionnels formés', description: '' },
        { value: '50+', label: 'Formateurs experts', description: '' },
      ]),
    ],
  },

  'normes-ressources': {
    after: 0,
    blocks: [
      features(
        'Référentiels & Guides',
        'Accédez aux normes, guides techniques et documents de référence PROQUELEC.',
        [
          { title: 'Normes NFC', description: 'Recueil des normes françaises et européennes applicables au Sénégal.', icon: 'BookOpen' },
          { title: 'Guides Pratiques', description: 'Mémentos et guides d\'application pour les installateurs.', icon: 'FileText' },
          { title: 'Corpus Réglementaire', description: 'Textes de loi, décrets et arrêtés du secteur électrique.', icon: 'Scale' },
          { title: 'Documents Techniques', description: 'Schémas, calculs et notes techniques de référence.', icon: 'FileImage' },
          { title: 'Veille Normative', description: 'Alertes et synthèses des évolutions normatives.', icon: 'Bell' },
          { title: 'Bibliothèque PROQUELEC', description: 'Accès à l\'ensemble des ressources documentaires.', icon: 'Library' },
        ],
        { badge: 'RESSOURCES DOCUMENTAIRES' }
      ),
      stats(
        'Notre base documentaire',
        '',
        [
          { value: '500+', label: 'Documents disponibles', description: '' },
          { value: '50+', label: 'Normes référencées', description: '' },
          { value: '200+', label: 'Guides techniques', description: '' },
          { value: '1000+', label: 'Téléchargements / mois', description: '' },
        ]
      ),
    ],
  },

  'projets-realisations': {
    after: 0,
    blocks: [
      features(
        'Nos Réalisations',
        'Une sélection de projets accompagnés par PROQUELEC dans toute la sous-région.',
        [
          { title: 'Bâtiments Administratifs', description: 'Audit et sécurisation des installations électriques.', icon: 'Building2' },
          { title: 'Infrastructures Publiques', description: 'Contrôle des réseaux d\'éclairage public.', icon: 'Sun' },
          { title: 'Établissements Sanitaires', description: 'Mise aux normes des hôpitaux et cliniques.', icon: 'HeartPulse' },
          { title: 'Établissements Scolaires', description: 'Sécurisation des écoles et universités.', icon: 'School' },
          { title: 'Zones Industrielles', description: 'Audit des installations industrielles.', icon: 'Factory' },
          { title: 'Résidentiel & Tertiaire', description: 'Diagnostics et conseils pour les copropriétés.', icon: 'Home' },
        ],
        { badge: 'RÉALISATIONS' }
      ),
      stats(
        'Impact terrain',
        '',
        [
          { value: '500+', label: 'Projets réalisés', description: '' },
          { value: '200+', label: 'Bâtiments sécurisés', description: '' },
          { value: '50+', label: 'Communes accompagnées', description: '' },
          { value: '98%', label: 'Conformité', description: '' },
        ]
      ),
    ],
  },

  'actualites-evenements': {
    after: 0,
    blocks: [
      features(
        'Actualités & Événements PROQUELEC',
        'Restez informé des dernières nouvelles du secteur électrique sénégalais.',
        [
          { title: 'Actualités', description: 'Les dernières informations institutionnelles et réglementaires.', icon: 'Newspaper' },
          { title: 'Conférences', description: 'Grands rendez-vous annuels et symposiums techniques.', icon: 'Presentation' },
          { title: 'Ateliers Techniques', description: 'Sessions pratiques de formation et d\'échange.', icon: 'Wrench' },
          { title: 'Séminaires', description: 'Rencontres professionnelles et tables rondes.', icon: 'Users' },
          { title: 'Communiqués', description: 'Publications officielles et décisions importantes.', icon: 'Megaphone' },
          { title: 'Appels à Projets', description: 'Opportunités de collaboration et de financement.', icon: 'Handshake' },
        ],
        { badge: 'SUIVEZ L\'ACTUALITÉ' }
      ),
    ],
  },

  partenaires: {
    after: 0,
    blocks: [
      features(
        'Nos Partenaires',
        'Un écosystème d\'acteurs engagés pour la qualité électrique au Sénégal.',
        [
          { title: 'Institutionnels', description: 'Ministères, agences d\'État et collectivités locales.', icon: 'Landmark' },
          { title: 'Techniques', description: 'Bureaux d\'études, laboratoires et centres de recherche.', icon: 'FlaskConical' },
          { title: 'Formation', description: 'Centres de formation professionnelle et universités.', icon: 'GraduationCap' },
          { title: 'Industriels', description: 'Fabricants et distributeurs de matériel électrique.', icon: 'Building2' },
          { title: 'Associations', description: 'Organisations professionnelles et ONG du secteur.', icon: 'Handshake' },
          { title: 'Médias', description: 'Médias spécialisés et généralistes partenaires.', icon: 'Radio' },
        ],
        { badge: 'ÉCOSYSTÈME' }
      ),
    ],
  },

  'espace-autorites': {
    after: 0,
    blocks: [
      features(
        'Services aux Autorités',
        'Appui technique, réglementaire et opérationnel pour les institutions publiques.',
        [
          { title: 'Appui Réglementaire', description: 'Assistance dans l\'élaboration des textes et normes.', icon: 'Scale' },
          { title: 'Contrôle & Inspection', description: 'Missions de contrôle des installations publiques.', icon: 'ClipboardCheck' },
          { title: 'Expertise Technique', description: 'Ingénierie et conseil pour les projets d\'infrastructure.', icon: 'FlaskConical' },
          { title: 'Formation des Cadres', description: 'Programmes de formation pour les agents de l\'État.', icon: 'GraduationCap' },
          { title: 'Data & Rapports', description: 'Tableaux de bord et indicateurs du secteur électrique.', icon: 'BarChart3' },
          { title: 'Coopération Internationale', description: 'Veille et partenariats avec les organismes internationaux.', icon: 'Globe' },
        ],
        { badge: 'AUTORITÉS' }
      ),
    ],
  },

  'espace-menages': {
    after: 0,
    blocks: [
      features(
        'Services aux Ménages',
        'Prévenir les risques électriques et sécuriser votre installation.',
        [
          { title: 'Diagnostic Gratuit', description: 'Évaluez la conformité de votre installation électrique.', icon: 'Search' },
          { title: 'Guides Pratiques', description: 'Conseils pour une installation électrique sûre.', icon: 'BookOpen' },
          { title: 'Demande de Contrôle', description: 'Sollicitez une visite de contrôle à votre domicile.', icon: 'ClipboardCheck' },
          { title: 'Questions Fréquentes', description: 'Réponses aux questions courantes sur l\'électricité.', icon: 'HelpCircle' },
          { title: 'Contactez un Pro', description: 'Trouvez un électricien certifié PROQUELEC près de chez vous.', icon: 'MapPin' },
          { title: 'Urgences & Conseils', description: 'Que faire en cas d\'incident électrique ?', icon: 'Shield' },
        ],
        { badge: 'PARTICULIERS' }
      ),
    ],
  },

  'espace-professionnels': {
    after: 0,
    blocks: [
      features(
        'Services aux Professionnels',
        'Outils, formations et démarches de conformité pour les métiers de l\'électricité.',
        [
          { title: 'Certification', description: 'Obtenez votre certification PROQUELEC et votre référencement.', icon: 'Award' },
          { title: 'Formations', description: 'Accédez aux formations continues et aux habilitations.', icon: 'GraduationCap' },
          { title: 'Outils Métiers', description: 'Calculateurs, générateurs de schémas et modèles de documents.', icon: 'Wrench' },
          { title: 'Annuaire Professionnel', description: 'Inscrivez-vous et gagnez en visibilité auprès des donneurs d\'ordre.', icon: 'Users' },
          { title: 'Marchés & Appels d\'Offres', description: 'Soyez informé des opportunités de votre secteur.', icon: 'FileText' },
          { title: 'Support Technique', description: 'Assistance technique et juridique pour vos chantiers.', icon: 'Headphones' },
        ],
        { badge: 'PROFESSIONNELS' }
      ),
      stats(
        'Chiffres clés',
        '',
        [
          { value: '1500+', label: 'Professionnels certifiés', description: '' },
          { value: '300+', label: 'Entreprises référencées', description: '' },
          { value: '50+', label: 'Formations disponibles', description: '' },
          { value: '95%', label: 'Satisfaction', description: '' },
        ]
      ),
    ],
  },

  presse: {
    after: 0,
    blocks: [
      features(
        'Espace Presse',
        'Ressources médias, communiqués et informations institutionnelles.',
        [
          { title: 'Communiqués de Presse', description: 'Annonces officielles et déclarations institutionnelles.', icon: 'Megaphone' },
          { title: 'Dossier de Presse', description: 'Kit média complet : chiffres clés, biographies, photos.', icon: 'FolderOpen' },
          { title: 'Revue de Presse', description: 'Sélection d\'articles et mentions dans les médias.', icon: 'Newspaper' },
          { title: 'Contacts Médias', description: 'Interlocuteurs dédiés pour vos demandes presse.', icon: 'Phone' },
          { title: 'Photos & Vidéos', description: 'Galerie multimédia pour illustration.', icon: 'Camera' },
          { title: 'Calendrier', description: 'Événements et conférences de presse à venir.', icon: 'Calendar' },
        ],
        { badge: 'PRESSE & MÉDIAS' }
      ),
    ],
  },

  social: {
    after: 0,
    blocks: [
      features(
        'Réseaux & Social',
        'Suivez PROQUELEC sur les réseaux sociaux et engagez-vous avec notre communauté.',
        [
          { title: 'LinkedIn', description: 'Actualités professionnelles et offres d\'emploi.', icon: 'Linkedin' },
          { title: 'Facebook', description: 'Information grand public et conseils pratiques.', icon: 'Facebook' },
          { title: 'Twitter / X', description: 'Fil d\'actualités en temps réel.', icon: 'Twitter' },
          { title: 'YouTube', description: 'Tutoriels, webinaires et conférences en replay.', icon: 'Youtube' },
          { title: 'WhatsApp', description: 'Canaux d\'information et groupes professionnels.', icon: 'MessageCircle' },
          { title: 'Newsletter', description: 'Recevez chaque mois l\'essentiel de l\'actualité PROQUELEC.', icon: 'Mail' },
        ],
        { badge: 'SUIVEZ-NOUS' }
      ),
    ],
  },

  marches: {
    after: 0,
    blocks: [
      features(
        'Marchés Sécurisés',
        'Réduisez les risques techniques, documentaires et contractuels de vos projets électriques.',
        [
          { title: 'Appels d\'Offres', description: 'Consultations et marchés publics du secteur électrique.', icon: 'FileSearch' },
          { title: 'Cahiers des Charges', description: 'Modèles et référentiels pour vos soumissions.', icon: 'FileText' },
          { title: 'Conformité Technique', description: 'Vérification de la conformité aux normes en vigueur.', icon: 'ClipboardCheck' },
          { title: 'Assistance au Montage', description: 'Accompagnement dans la préparation des dossiers.', icon: 'Handshake' },
          { title: 'Suivi de Chantier', description: 'Contrôle qualité et réception des travaux.', icon: 'HardHat' },
          { title: 'Règlement des Litiges', description: 'Médiation et expertise technique pour les contentieux.', icon: 'Scale' },
        ],
        { badge: 'MARCHÉS' }
      ),
    ],
  },

  activities: {
    after: 0,
    blocks: [
      features(
        'Nos Actions',
        'Les missions et initiatives de PROQUELEC pour le développement du secteur électrique.',
        [
          { title: 'Sensibilisation', description: 'Campagnes de prévention des risques électriques auprès du grand public.', icon: 'Bell' },
          { title: 'Formation', description: 'Programmes de formation professionnelle et technique.', icon: 'GraduationCap' },
          { title: 'Contrôle & Inspection', description: 'Missions de contrôle des installations sur tout le territoire.', icon: 'Search' },
          { title: 'Normalisation', description: 'Participation à l\'élaboration des normes nationales.', icon: 'BookOpen' },
          { title: 'Innovation', description: 'Veille technologique et développement d\'outils numériques.', icon: 'Lightbulb' },
          { title: 'Coopération', description: 'Partenariats internationaux et échanges de bonnes pratiques.', icon: 'Globe' },
        ],
        { badge: 'NOS MISSIONS' }
      ),
      stats(
        'Impact de nos actions',
        '',
        [
          { value: '10000+', label: 'Personnes sensibilisées', description: '' },
          { value: '500+', label: 'Installations inspectées', description: '' },
          { value: '200+', label: 'Formations dispensées', description: '' },
          { value: '50+', label: 'Partenaires actifs', description: '' },
        ]
      ),
    ],
  },

  formations: {
    after: 0,
    blocks: [
      features(
        'Développez votre Expertise',
        'Des formations adaptées à chaque niveau d\'expertise.',
        [
          { title: 'Centre de Formation Agréé', description: 'Organisme certifié par l\'État pour la formation électrique.', icon: 'Award' },
          { title: 'Certifications d\'État', description: 'Préparation aux certifications et habilitations officielles.', icon: 'FileCheck' },
          { title: 'Experts Métiers', description: 'Formateurs issus du terrain avec une expérience reconnue.', icon: 'Users' },
          { title: 'Formation Continue', description: 'Modules de mise à niveau et perfectionnement.', icon: 'RefreshCw' },
          { title: 'E-Learning', description: 'Formations à distance accessibles 24/7.', icon: 'Monitor' },
          { title: 'Sur Site', description: 'Formations dans vos locaux adaptées à vos besoins.', icon: 'Building2' },
        ],
        { badge: 'FORMATION' }
      ),
      stats(
        'La formation en chiffres',
        '',
        [
          { value: '3000+', label: 'Apprenants formés', description: '' },
          { value: '50+', label: 'Modules disponibles', description: '' },
          { value: '98%', label: 'Taux de satisfaction', description: '' },
          { value: '15', label: 'Années d\'expertise', description: '' },
        ]
      ),
    ],
  },

  blog: {
    after: 0,
    blocks: [
      features(
        'Le Blog PROQUELEC',
        'Articles, conseils et informations techniques pour les professionnels et le grand public.',
        [
          { title: 'Conseils Techniques', description: 'Astuces et bonnes pratiques pour vos installations.', icon: 'Lightbulb' },
          { title: 'Actualités du Secteur', description: 'Les dernières évolutions réglementaires et normatives.', icon: 'Newspaper' },
          { title: 'Guides Pratiques', description: 'Tutoriels pas à pas pour les professionnels.', icon: 'BookOpen' },
          { title: 'Témoignages', description: 'Retours d\'expérience de professionnels certifiés.', icon: 'MessageSquare' },
          { title: 'Innovations', description: 'Veille technologique et innovations du secteur.', icon: 'Rocket' },
          { title: 'Vie Institutionnelle', description: 'La vie de PROQUELEC et de ses membres.', icon: 'Users' },
        ],
        { badge: 'BLOG' }
      ),
    ],
  },

  avantages: {
    after: 0,
    blocks: [
      features(
        'Pourquoi choisir PROQUELEC ?',
        'Des avantages concrets pour les professionnels de l\'électricité.',
        [
          { title: 'Exclusivités Métiers', description: 'Accès aux normes, calculateurs pro et générateur de schémas.', icon: 'Star' },
          { title: 'Outils Professionnels', description: 'Suite d\'outils numériques pour faciliter votre quotidien.', icon: 'Wrench' },
          { title: 'Réseautage', description: 'Intégrez un réseau d\'experts et de partenaires de confiance.', icon: 'Users' },
          { title: 'Visibilité', description: 'Référencement dans l\'annuaire officiel PROQUELEC.', icon: 'Search' },
          { title: 'Formation Continue', description: 'Accès prioritaire aux formations et ateliers.', icon: 'GraduationCap' },
          { title: 'Support Prioritaire', description: 'Assistance technique et juridique dédiée.', icon: 'Headphones' },
        ],
        { badge: 'AVANTAGES' }
      ),
      stats(
        'Pourquoi nous rejoindre',
        '',
        [
          { value: '1500+', label: 'Membres actifs', description: '' },
          { value: '95%', label: 'Recommandent PROQUELEC', description: '' },
          { value: '50+', label: 'Outils disponibles', description: '' },
          { value: '24/7', label: 'Support prioritaire', description: '' },
        ]
      ),
    ],
  },

  'avis-clients': {
    after: 0,
    blocks: [
      testimonials(
        'Ce qu\'ils disent de nous',
        'Témoignages de professionnels certifiés et partenaires PROQUELEC.',
        [
          { name: 'Mamadou Diallo', role: 'Électricien Indépendant', company: 'Dakar', content: 'La certification PROQUELEC a changé mon quotidien. Mes clients me font davantage confiance et j\'ai accès à des outils qui me font gagner un temps précieux.', rating: 5 },
          { name: 'Aïssatou Mbaye', role: 'Chef d\'Entreprise', company: 'ElectroTech Sénégal', content: 'Le référencement dans l\'annuaire PROQUELEC nous a apporté de nombreux contrats. La formation continue de nos équipes est un vrai plus.', rating: 5 },
          { name: 'Ousmane Sow', role: 'Ingénieur Conseil', company: 'Bureau d\'Études SEC', content: 'La veille normative PROQUELEC est indispensable pour notre cabinet. Nous sommes toujours à jour des dernières évolutions réglementaires.', rating: 5 },
          { name: 'Fatou Ndiaye', role: 'Responsable Qualité', company: 'Groupe ISSA', content: 'Les audits PROQUELEC nous ont permis d\'identifier des non-conformités critiques et d\'améliorer significativement la sécurité de nos installations.', rating: 5 },
          { name: 'Ibrahima Ka', role: 'Formateur', company: 'CFPT Dakar', content: 'Le partenariat avec PROQUELEC enrichit nos programmes de formation. Les étudiants bénéficient de contenus actualisés et pertinents.', rating: 4 },
        ]
      ),
      stats(
        'Satisfaction',
        '',
        [
          { value: '95%', label: 'Clients satisfaits', description: '' },
          { value: '4.8/5', label: 'Note moyenne', description: '' },
          { value: '500+', label: 'Avis vérifiés', description: '' },
          { value: '98%', label: 'Recommandent nos services', description: '' },
        ]
      ),
    ],
  },

  certifications: {
    after: 0,
    blocks: [
      features(
        'Certifications Professionnelles',
        'Des labels de qualité pour valoriser votre expertise.',
        [
          { title: 'Reconnaissance d\'Excellence', description: 'Le label PROQUELEC, gage de qualité et de professionnalisme.', icon: 'Award' },
          { title: 'Conformité Normative', description: 'Vérification de la conformité aux normes en vigueur.', icon: 'ClipboardCheck' },
          { title: 'Visibilité', description: 'Référencement dans l\'annuaire officiel des professionnels certifiés.', icon: 'Search' },
          { title: 'Accès aux Marchés', description: 'La certification ouvre l\'accès aux marchés publics et privés.', icon: 'FileText' },
          { title: 'Formation Continue', description: 'Maintien des compétences via des formations régulières.', icon: 'RefreshCw' },
          { title: 'Réseau d\'Experts', description: 'Intégration d\'une communauté de professionnels d\'excellence.', icon: 'Users' },
        ],
        { badge: 'CERTIFICATIONS' }
      ),
    ],
  },

  labels: {
    after: 0,
    blocks: [
      features(
        'Le Label PROQUELEC',
        'Un sceau de qualité reconnu par les institutions et les professionnels.',
        [
          { title: 'Sceau de Qualité', description: 'Garantie de conformité et de professionnalisme pour vos installations.', icon: 'Shield' },
          { title: 'Référence Nationale', description: 'Le standard de référence pour la certification électrique au Sénégal.', icon: 'Award' },
          { title: 'Expertise', description: 'Validé par un comité d\'experts techniques indépendants.', icon: 'FlaskConical' },
          { title: 'Confiance Clients', description: 'Un label qui rassure vos clients et valorise votre travail.', icon: 'HeartHandshake' },
          { title: 'Différenciation', description: 'Démarquez-vous sur un marché concurrentiel.', icon: 'Star' },
          { title: 'Engagement', description: 'Un engagement continu pour la qualité et la sécurité électrique.', icon: 'Target' },
        ],
        { badge: 'LABEL QUALITÉ' }
      ),
    ],
  },

  outils: {
    after: 0,
    blocks: [
      features(
        'Plateforme d\'Outils Électriques',
        '40 applications métiers, IA normative et souveraineté des données.',
        [
          { title: '40 Applications', description: 'Suite complète d\'outils pour les professionnels de l\'électricité.', icon: 'Grid3X3' },
          { title: 'IA Normative', description: 'Assistant intelligent pour la recherche et l\'application des normes.', icon: 'Brain' },
          { title: 'Souveraineté des données', description: 'Hébergement local et conformité RGPD.', icon: 'Shield' },
          { title: 'Générateur de Schémas', description: 'Créez des schémas électriques professionnels en quelques clics.', icon: 'FileImage' },
          { title: 'Calculateurs Techniques', description: 'Dimensionnement, sections de câbles, protection et plus.', icon: 'Calculator' },
          { title: 'GED Intégré', description: 'Gestion électronique des documents et dossiers chantiers.', icon: 'FolderOpen' },
        ],
        { badge: 'OUTILS PRO' }
      ),
      stats(
        'La plateforme en chiffres',
        '',
        [
          { value: '40+', label: 'Applications', description: '' },
          { value: '2000+', label: 'Utilisateurs actifs', description: '' },
          { value: '99.9%', label: 'Disponibilité', description: '' },
          { value: 'Sénégal', label: 'Données hébergées', description: 'Souveraineté numérique' },
        ]
      ),
    ],
  },

  showroom: {
    after: 0,
    blocks: [
      features(
        'Showroom Interactif',
        'Découvrez la conformité électrique en action.',
        [
          { title: 'Excellence Technique', description: 'Démonstrations des meilleures pratiques et équipements certifiés.', icon: 'Award' },
          { title: 'Immersion', description: 'Visites virtuelles d\'installations conformes et non conformes.', icon: 'Eye' },
          { title: 'Normes en Action', description: 'Application visuelle des normes NFC dans des cas concrets.', icon: 'BookOpen' },
          { title: 'Équipements Certifiés', description: 'Présentation des matériels conformes aux normes.', icon: 'Zap' },
          { title: 'Avant / Après', description: 'Comparaison d\'installations avant et après mise aux normes.', icon: 'SlidersHorizontal' },
          { title: 'Ressources Pédagogiques', description: 'Supports visuels pour la formation et la sensibilisation.', icon: 'GraduationCap' },
        ],
        { badge: 'SHOWROOM' }
      ),
    ],
  },

  events: {
    after: 0,
    blocks: [
      features(
        'Événements & Agenda',
        'Le carrefour de l\'expertise électrique.',
        [
          { title: 'Conférences', description: 'Grands rendez-vous annuels et symposiums techniques.', icon: 'Presentation' },
          { title: 'Ateliers', description: 'Sessions pratiques et démonstrations techniques.', icon: 'Wrench' },
          { title: 'Séminaires', description: 'Formations et tables rondes thématiques.', icon: 'Users' },
          { title: 'Webinaires', description: 'Conférences en ligne accessibles à distance.', icon: 'Monitor' },
          { title: 'Salons', description: 'Participation aux salons professionnels du secteur.', icon: 'Building2' },
          { title: 'Visites Terrain', description: 'Sorties techniques et visites de sites.', icon: 'MapPin' },
        ],
        { badge: 'AGENDA' }
      ),
      stats(
        'En 2026',
        '',
        [
          { value: '20+', label: 'Événements programmés', description: '' },
          { value: '500+', label: 'Participants attendus', description: '' },
          { value: '10', label: 'Villes concernées', description: '' },
          { value: '30+', label: 'Intervenants', description: '' },
        ]
      ),
    ],
  },

  'contact-premium': {
    after: 0,
    blocks: [
      features(
        'Contact Premium',
        'Une prise en charge personnalisée pour vos projets d\'envergure.',
        [
          { title: 'Conseil Dédié', description: 'Un expert vous accompagne tout au long de votre projet.', icon: 'Headphones' },
          { title: 'Devis Personnalisé', description: 'Une proposition adaptée à vos besoins spécifiques.', icon: 'FileText' },
          { title: 'Suivi Prioritaire', description: 'Traitement accéléré de vos demandes.', icon: 'Zap' },
          { title: 'Audit Gratuit', description: 'Évaluation préliminaire sans engagement.', icon: 'Search' },
          { title: 'Support Technique', description: 'Assistance technique pour vos projets complexes.', icon: 'Wrench' },
          { title: 'Documentation', description: 'Dossier complet avec préconisations détaillées.', icon: 'FolderOpen' },
        ],
        { badge: 'CONTACT PREMIUM' }
      ),
    ],
  },

  'espace-partenaires': {
    after: 0,
    blocks: [
      features(
        'Espace Partenaires',
        'Coordonnez vos initiatives, événements et ressources avec l\'écosystème PROQUELEC.',
        [
          { title: 'Conventions', description: 'Gestion des conventions de partenariat.', icon: 'FileSignature' },
          { title: 'Événements Communs', description: 'Organisation conjointe d\'événements.', icon: 'Calendar' },
          { title: 'Ressources Partagées', description: 'Accès aux documents et outils communs.', icon: 'FolderOpen' },
          { title: 'Visibilité', description: 'Mise en avant de vos actions et initiatives.', icon: 'Search' },
          { title: 'Rapports', description: 'Suivi et évaluation des actions partenariales.', icon: 'BarChart3' },
          { title: 'Coordination', description: 'Réunions et échanges réguliers entre partenaires.', icon: 'Users' },
        ],
        { badge: 'PARTENAIRES' }
      ),
    ],
  },

  'expert-lab': {
    after: 0,
    blocks: [
      features(
        'Expert Lab',
        'Laboratoire d\'innovation, d\'analyse et d\'expertise technique.',
        [
          { title: 'IA & Chat Expert', description: 'Assistant conversationnel pour la recherche normative.', icon: 'Brain' },
          { title: 'Calculateurs', description: 'Outils de calcul pour le dimensionnement électrique.', icon: 'Calculator' },
          { title: 'Scanner de Plans', description: 'Analyse et numérisation de schémas électriques.', icon: 'Scan' },
          { title: 'Générateur de Schémas', description: 'Créez des schémas professionnels en quelques clics.', icon: 'FileImage' },
          { title: 'Observatoire', description: 'Tableaux de bord et indicateurs du secteur.', icon: 'BarChart3' },
          { title: 'GED', description: 'Gestion documentaire avancée.', icon: 'FolderOpen' },
        ],
        { badge: 'EXPERT LAB' }
      ),
    ],
  },

  legal: {
    after: 1,
    blocks: [
      faq(
        'Questions Juridiques Fréquentes',
        '',
        [
          { q: 'Qui est l\'éditeur du site PROQUELEC ?', a: 'PROQUELEC est une association reconnue d\'utilité publique, immatriculée au registre des associations sous le numéro XXX. Siège social : Immeuble Coumba Castel, 12 rue Saint-Michel, 4e étage, Dakar. Email : proquelec@proquelec.sn — Tél : +221 33 848 68 55.' },
          { q: 'Comment sont protégées mes données personnelles ?', a: 'Conformément au RGPD et à la loi sénégalaise sur la protection des données, vos informations sont collectées uniquement dans le cadre des services proposés. Vous disposez d\'un droit d\'accès, de rectification et de suppression de vos données. Contactez notre DPO à l\'adresse du siège.' },
          { q: 'Quelle est la propriété intellectuelle des contenus ?', a: 'Tous les contenus (textes, images, normes, schémas) sont la propriété exclusive de PROQUELEC ou de ses partenaires. Toute reproduction est soumise à autorisation préalable.' },
          { q: 'Comment sont gérés les cookies ?', a: 'Notre site utilise des cookies strictement nécessaires au fonctionnement et des cookies analytiques anonymisés. Vous pouvez configurer vos préférences à tout moment via le panneau de gestion des cookies.' },
        ]
      ),
    ],
  },
};

async function enrich() {
  const client = await pool.connect();
  try {
    console.log('🚀 Enrichissement des pages Builder avec du contenu riche...\n');

    let totalEnriched = 0;
    let totalErrors = 0;

    const slugs = Object.keys(PAGE_ENRICHMENTS);

    for (const slug of slugs) {
      try {
        const config = PAGE_ENRICHMENTS[slug];
        const res = await client.query(
          'SELECT id, title, structure_json, status FROM public.pages WHERE slug = $1',
          [slug]
        );

        if (res.rows.length === 0) {
          console.log(`   ⏭️  Page "${slug}" introuvable, création...`);
          const blocks = config.blocks;
          await client.query(
            `INSERT INTO public.pages (title, slug, structure_json, is_published, status, created_at, updated_at)
             VALUES ($1, $2, $3, true, 'published', NOW(), NOW())`,
            [slug, slug, JSON.stringify(blocks)]
          );
          totalEnriched++;
          console.log(`   ✅ Page "${slug}" créée avec ${blocks.length} blocs`);
          continue;
        }

        const { id, title, structure_json: existingJson, status } = res.rows[0];

        // Parse existing blocks (array format) or initialize
        let existingBlocks = [];
        try {
          const parsed = typeof existingJson === 'string' ? JSON.parse(existingJson) : existingJson;
          if (Array.isArray(parsed)) {
            existingBlocks = parsed;
          } else if (parsed && typeof parsed === 'object' && parsed.ROOT) {
            // Craft.js format — skip enrichment (it's an existing builder page)
            console.log(`   ⏭️  Page "${slug}" (/${slug}) utilise le format Craft.js — déjà enrichie`);
            continue;
          }
        } catch {
          existingBlocks = [];
        }

        if (existingBlocks.length === 0) {
          console.log(`   ⏭️  Page "${slug}" (/${slug}) vide — ignorée`);
          continue;
        }

        // Insert new blocks after the specified index
        const insertAt = config.after !== undefined ? config.after : existingBlocks.length - 1;
        const enrichedBlocks = [
          ...existingBlocks.slice(0, insertAt + 1),
          ...config.blocks,
          ...existingBlocks.slice(insertAt + 1),
        ];

        await client.query(
          `UPDATE public.pages
           SET structure_json = $1, updated_at = NOW()
           WHERE id = $2`,
          [JSON.stringify(enrichedBlocks), id]
        );

        totalEnriched++;
        console.log(`   ✅ Page "${title || slug}" (/${slug}) enrichie : ${existingBlocks.length} → ${enrichedBlocks.length} blocs`);
      } catch (err) {
        totalErrors++;
        console.error(`   ❌ Erreur pour "${slug}": ${err.message}`);
      }
    }

    console.log('\n══════════════════════════════════════════════');
    console.log('📊 RÉSULTAT DE L\'ENRICHISSEMENT');
    console.log('══════════════════════════════════════════════');
    console.log(`   Pages enrichies : ${totalEnriched}`);
    console.log(`   Erreurs : ${totalErrors}`);
    console.log(`   Total ciblées : ${slugs.length}`);
    console.log('');
    console.log('✅ Enrichissement terminé !');

  } finally {
    client.release();
    await pool.end();
  }
}

enrich().catch((err) => {
  console.error('❌ Enrichissement failed:', err);
  process.exit(1);
});
