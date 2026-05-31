export interface IndustryContent {
  id: string;
  name: string;
  hero: { title: string; subtitle: string; cta: string };
  services: { title: string; items: { icon: string; name: string; desc: string }[] };
  about: { title: string; text: string };
  stats: { value: string; label: string }[];
  testimonials: { name: string; role: string; text: string }[];
  features: { icon: string; text: string }[];
  cta: { title: string; description: string; button: string };
  footer: { company: string; tagline: string };
}

export const INDUSTRIES: IndustryContent[] = [
  {
    id: 'default', name: 'Standard',
    hero: { title: 'Nous innovons pour vous', subtitle: 'Des solutions professionnelles adaptées à vos besoins', cta: 'Découvrir' },
    services: { title: 'Nos Services', items: [
      { icon: '⚡', name: 'Service 1', desc: 'Solution complète et performante pour votre entreprise' },
      { icon: '🔧', name: 'Service 2', desc: 'Accompagnement personnalisé à chaque étape' },
      { icon: '🛡️', name: 'Service 3', desc: 'Qualité et fiabilité au meilleur niveau' },
    ]},
    about: { title: 'À Propos', text: 'Fort de 15 ans d\'expérience, notre équipe d\'experts met son savoir-faire au service de vos projets. Nous combinons innovation et tradition pour offrir des solutions sur mesure.' },
    stats: [
      { value: '500+', label: 'Clients' }, { value: '15', label: 'Années' }, { value: '99%', label: 'Satisfaction' },
    ],
    testimonials: [
      { name: 'Sophie Martin', role: 'CEO, TechCorp', text: 'Un service exceptionnel. Notre productivité a augmenté de 40%.' },
      { name: 'Thomas Dubois', role: 'Directeur, InnovPlus', text: 'L\'équipe la plus professionnelle avec qui nous avons travaillé.' },
    ],
    features: [
      { icon: '⚡', text: 'Haute performance' }, { icon: '🔒', text: 'Sécurisé' }, { icon: '🚀', text: 'Rapide' }, { icon: '💎', text: 'Premium' },
    ],
    cta: { title: 'Prêt à démarrer ?', description: 'Contactez-nous pour un devis gratuit sous 24h', button: 'Nous contacter' },
    footer: { company: 'Mon Entreprise', tagline: 'Excellence depuis 2010' },
  },
  {
    id: 'tech', name: 'Technologie',
    hero: { title: 'La tech au service de votre croissance', subtitle: 'Solutions digitales innovantes pour accélérer votre transformation', cta: 'Nos solutions' },
    services: { title: 'Expertises Tech', items: [
      { icon: '💻', name: 'Développement Web', desc: 'Applications web sur mesure, performantes et évolutives' },
      { icon: '📱', name: 'Applications Mobile', desc: 'iOS & Android — UX native, code partagé' },
      { icon: '☁️', name: 'Cloud & DevOps', desc: 'Infrastructure scalable, CI/CD, monitoring 24/7' },
    ]},
    about: { title: 'Notre Vision Tech', text: 'Nous croyons en une technologie qui simplifie la vie. Notre équipe d\'ingénieurs passionnés conçoit des solutions robustes qui transforment la façon dont les entreprises travaillent.' },
    stats: [
      { value: '200+', label: 'Projets Livrés' }, { value: '50+', label: 'Experts Tech' }, { value: '98%', label: 'Uptime' },
    ],
    testimonials: [
      { name: 'Marie Laurent', role: 'CTO, Fintech SA', text: 'Ils ont livré notre plateforme en 3 mois. Un exploit technique.' },
      { name: 'Alexandre Petit', role: 'CEO, WebStart', text: 'Leur expertise DevOps a réduit nos coûts d\'infrastructure de 60%.' },
    ],
    features: [
      { icon: '☁️', text: 'Cloud natif' }, { icon: '🔐', text: 'Sécurité renforcée' }, { icon: '⚡', text: 'Performance' }, { icon: '📊', text: 'Scalable' },
    ],
    cta: { title: 'Discutons de votre projet tech', description: 'Audit gratuit de votre infrastructure existante', button: 'Réserver un audit' },
    footer: { company: 'TechCorp Solutions', tagline: 'Innovation digitiale' },
  },
  {
    id: 'construction', name: 'Construction & BTP',
    hero: { title: 'Bâtir l\'avenir ensemble', subtitle: 'Expertise en construction depuis plus de 20 ans', cta: 'Nos réalisations' },
    services: { title: 'Nos Métiers', items: [
      { icon: '🏗️', name: 'Gros Œuvre', desc: 'Fondations, structures béton, charpentes métalliques' },
      { icon: '🔧', name: 'Second Œuvre', desc: 'Plomberie, électricité, chauffage, ventilation' },
      { icon: '🏠', name: 'Rénovation', desc: 'Rénovation complète, extension, mise aux normes' },
    ]},
    about: { title: 'Notre Histoire', text: 'Depuis 2005, notre entreprise familiale s\'est imposée comme un acteur majeur du BTP dans la région. Plus de 500 chantiers réalisés avec la même exigence de qualité et de respect des délais.' },
    stats: [
      { value: '500+', label: 'Chantiers' }, { value: '20', label: 'Années' }, { value: '120', label: 'Collaborateurs' },
    ],
    testimonials: [
      { name: 'Pierre Moreau', role: 'Promoteur Immobilier', text: 'Chantier livré en avance. Professionnalisme irréprochable.' },
      { name: 'Isabelle Roux', role: 'Architecte DPLG', text: 'Une équipe qui comprend les contraintes techniques et architecturales.' },
    ],
    features: [
      { icon: '🏗️', text: 'Gros œuvre' }, { icon: '🔨', text: 'Rénovation' }, { icon: '📐', text: 'Sur mesure' }, { icon: '📋', text: 'Devis gratuit' },
    ],
    cta: { title: 'Demandez un devis gratuit', description: 'Intervention sous 48h dans toute la région', button: 'Devis gratuit' },
    footer: { company: 'Bâtir Plus SA', tagline: 'Construction & Rénovation' },
  },
  {
    id: 'health', name: 'Santé & Bien-être',
    hero: { title: 'Votre santé, notre priorité', subtitle: 'Soins de qualité avec des professionnels dédiés', cta: 'Prendre RDV' },
    services: { title: 'Nos Soins', items: [
      { icon: '🩺', name: 'Médecine Générale', desc: 'Consultations et suivi personnalisé pour toute la famille' },
      { icon: '🦷', name: 'Soins Dentaires', desc: 'Prévention, soins et esthétique dentaire' },
      { icon: '💆', name: 'Bien-être', desc: 'Ostéopathie, kinésithérapie et médecine douce' },
    ]},
    about: { title: 'Notre Centre', text: 'Notre centre médical regroupe 15 professionnels de santé dans un cadre moderne et chaleureux. Nous plaçons le patient au cœur de nos préoccupations avec une approche pluridisciplinaire.' },
    stats: [
      { value: '15', label: 'Spécialistes' }, { value: '10K+', label: 'Patients' }, { value: '4.9★', label: 'Avis' },
    ],
    testimonials: [
      { name: 'Claire Fontaine', role: 'Patient', text: 'Un accueil chaleureux et des soins de grande qualité.' },
      { name: 'Marc Lefèvre', role: 'Patient', text: 'Je recommande vivement cette équipe de professionnels.' },
    ],
    features: [
      { icon: '🩺', text: 'Expertise médicale' }, { icon: '📅', text: 'RDV en ligne' }, { icon: '🏥', text: 'Centre moderne' }, { icon: '💊', text: 'Suivi personnalisé' },
    ],
    cta: { title: 'Prenez rendez-vous en ligne', description: 'Consultations disponibles sous 48h', button: 'Prendre RDV' },
    footer: { company: 'Centre Médical Santé+', tagline: 'Soins pour tous' },
  },
  {
    id: 'services', name: 'Services Professionnels',
    hero: { title: 'L\'excellence du conseil', subtitle: 'Accompagnement stratégique pour votre développement', cta: 'Nos expertises' },
    services: { title: 'Domaines d\'Expertise', items: [
      { icon: '📊', name: 'Conseil en Stratégie', desc: 'Diagnostic, feuille de route et accompagnement' },
      { icon: '📝', name: 'Consulting RH', desc: 'Recrutement, formation et optimisation des talents' },
      { icon: '📈', name: 'Transformation Digitale', desc: 'Modernisation des processus et adoption du numérique' },
    ]},
    about: { title: 'Qui Sommes-Nous', text: 'Cabinet de conseil fondé par des experts du secteur, nous accompagnons les PME et ETI dans leur croissance. Notre approche combine数据分析 et intelligence terrain pour des résultats concrets.' },
    stats: [
      { value: '300+', label: 'Clients' }, { value: '25', label: 'Consultants' }, { value: '92%', label: 'Recommandation' },
    ],
    testimonials: [
      { name: 'Nathalie Girard', role: 'DG, Groupe Nova', text: 'Un accompagnement stratégique qui a transformé notre organisation.' },
      { name: 'François Legrand', role: 'Fondateur, StartLab', text: 'Des consultants brillants et pragmatiques.' },
    ],
    features: [
      { icon: '📊', text: 'Stratégie' }, { icon: '👥', text: 'RH' }, { icon: '💻', text: 'Digital' }, { icon: '📈', text: 'Croissance' },
    ],
    cta: { title: 'Parlons de vos enjeux', description: 'Premier rendez-vous offert', button: 'Réserver' },
    footer: { company: 'Conseil & Stratégie', tagline: 'Votre croissance, notre mission' },
  },
  {
    id: 'education', name: 'Éducation & Formation',
    hero: { title: 'Formez-vous aux métiers de demain', subtitle: 'Des programmes certifiants pour booster votre carrière', cta: 'Voir les formations' },
    services: { title: 'Nos Formations', items: [
      { icon: '📚', name: 'Formation Continue', desc: 'Programmes courts pour professionnels en activité' },
      { icon: '💻', name: 'Digital Learning', desc: 'Cours en ligne avec suivi personnalisé' },
      { icon: '🎓', name: 'Certifications', desc: 'Diplômes reconnus par l\'État et les branches professionnelles' },
    ]},
    about: { title: 'Notre Pédagogie', text: 'Depuis 2010, notre centre de formation a formé plus de 5 000 professionnels. Nos formateurs sont des experts en activité qui transmettent leur savoir-faire avec passion.' },
    stats: [
      { value: '5000+', label: 'Apprenants' }, { value: '94%', label: 'Réussite' }, { value: '50+', label: 'Formateurs' },
    ],
    testimonials: [
      { name: 'Lucas Bernard', role: 'Apprenant 2025', text: 'Formation intensive mais très efficace. J\'ai trouvé un emploi en 2 mois.' },
      { name: 'Céline Perrot', role: 'RH, Groupe ABC', text: 'Un partenaire de confiance pour la formation de nos équipes.' },
    ],
    features: [
      { icon: '📚', text: 'Programmes certifiants' }, { icon: '💻', text: 'E-learning' }, { icon: '🏆', text: '94% réussite' }, { icon: '🎯', text: 'Insertion pro' },
    ],
    cta: { title: 'Inscrivez-vous dès maintenant', description: 'Rentrée continue — Financement CPF accepté', button: 'S\'inscrire' },
    footer: { company: 'FormaPlus', tagline: 'Savoir & Savoir-faire' },
  },
  {
    id: 'food', name: 'Restauration & Hôtellerie',
    hero: { title: 'Une expérience gustative unique', subtitle: 'Produits frais, cuisine créative, service d\'exception', cta: 'Découvrir la carte' },
    services: { title: 'Nos Prestations', items: [
      { icon: '🍽️', name: 'Restaurant Gastronomique', desc: 'Menu dégustation, produits de saison, accords mets-vins' },
      { icon: '🎉', name: 'Traiteur & Événements', desc: 'Mariages, séminaires, cocktails sur mesure' },
      { icon: '🚚', name: 'Livraison & À Emporter', desc: 'Service traiteur livré à domicile ou en entreprise' },
    ]},
    about: { title: 'Notre Philosophie', text: 'Chef étoilé et son équipe vous accueillent dans un cadre élégant pour une cuisine d\'auteur. Chaque plat raconte une histoire, chaque ingrédient est choisi avec soin chez nos producteurs locaux.' },
    stats: [
      { value: '15', label: 'Ans d\'excellence' }, { value: '⭐', label: 'Étoilé' }, { value: '4.8★', label: 'Avis clients' },
    ],
    testimonials: [
      { name: 'Sophie & Paul', role: 'Clients', text: 'Un dîner inoubliable. Chaque bouchée était une révélation.' },
      { name: 'Jean-Claude M.', role: 'Critique Gastronomique', text: 'Une maîtrise technique impressionnante au service du goût.' },
    ],
    features: [
      { icon: '🍽️', text: 'Cuisine étoilée' }, { icon: '🥗', text: 'Produits frais' }, { icon: '🍷', text: 'Cave de prestige' }, { icon: '🎉', text: 'Traiteur' },
    ],
    cta: { title: 'Réservez votre table', description: 'Ouvert du mardi au samedi, midi et soir', button: 'Réserver' },
    footer: { company: 'Le Bistrot Étoilé', tagline: 'Gastronomie française' },
  },
  {
    id: 'legal', name: 'Juridique & Notariat',
    hero: { title: 'Votre partenaire juridique de confiance', subtitle: 'Expertise juridique à votre service depuis 30 ans', cta: 'Nos domaines' },
    services: { title: 'Domaines d\'Intervention', items: [
      { icon: '📜', name: 'Droit des Affaires', desc: 'Constitution, fusion, acquisition, contentieux commercial' },
      { icon: '🏠', name: 'Droit Immobilier', desc: 'Transactions, baux, copropriété, urbanisme' },
      { icon: '👨‍👩‍👧‍👦', name: 'Droit de la Famille', desc: 'Succession, divorce, tutelle, adoption' },
    ]},
    about: { title: 'Notre Cabinet', text: 'Cabinet d\'avocats fondé en 1995, reconnu pour son excellence et sa proximité avec ses clients. Une équipe de 12 avocats spécialisés couvre l\'ensemble du droit des affaires et du droit privé.' },
    stats: [
      { value: '30', label: 'Ans d\'expertise' }, { value: '5000+', label: 'Dossiers' }, { value: '12', label: 'Avocats' },
    ],
    testimonials: [
      { name: 'Philippe Renard', role: 'CEO, Groupe Industriel', text: 'Un accompagnement juridique d\'une rare qualité et réactivité.' },
      { name: 'Mme Bernard', role: 'Particulier', text: 'Grande humanité dans le traitement de mon dossier successoral.' },
    ],
    features: [
      { icon: '📜', text: 'Droit des affaires' }, { icon: '🏠', text: 'Immobilier' }, { icon: '👨‍👩‍👧‍👦', text: 'Droit familial' }, { icon: '⚖️', text: 'Contentieux' },
    ],
    cta: { title: 'Prenez rendez-vous', description: 'Consultation initiale à 150€ — Devis gratuit', button: 'Réserver' },
    footer: { company: 'Cabinet LexPartners', tagline: 'Droit & Confiance' },
  },
  {
    id: 'creative', name: 'Créatif & Design',
    hero: { title: 'Donnez vie à vos idées', subtitle: 'Agence créative spécialisée en design graphique et digital', cta: 'Voir le portfolio' },
    services: { title: 'Notre Créativité', items: [
      { icon: '🎨', name: 'Design Graphique', desc: 'Identité visuelle, charte graphique, print, packaging' },
      { icon: '🖥️', name: 'Web Design', desc: 'Sites vitrines, e-commerce, applications, UI/UX' },
      { icon: '📸', name: 'Photographie & Vidéo', desc: 'Shooting produit, film corporate, motion design' },
    ]},
    about: { title: 'Notre Vision', text: 'Agence créative fondée par des passionnés de design. Nous croyons que la beauté et la fonctionnalité vont de pair. Chaque projet est une histoire que nous racontons visuellement.' },
    stats: [
      { value: '300+', label: 'Projets' }, { value: '12', label: 'Designers' }, { value: '35', label: 'Prix' },
    ],
    testimonials: [
      { name: 'Julie Mercier', role: 'Directrice Marketing', text: 'Ils ont complètement transformé notre image de marque. Sublime.' },
      { name: 'Antoine L.', role: 'Fondateur', text: 'Une agence créative qui comprend vraiment les enjeux business.' },
    ],
    features: [
      { icon: '🎨', text: 'Design' }, { icon: '📸', text: 'Photographie' }, { icon: '🖥️', text: 'Web' }, { icon: '🏆', text: 'Primé' },
    ],
    cta: { title: 'Parlons de votre projet', description: 'Devis gratuit sous 48h', button: 'Nous contacter' },
    footer: { company: 'CréaStudio', tagline: 'Design & Innovation' },
  },
  {
    id: 'nonprofit', name: 'Association & ONG',
    hero: { title: 'Agissons ensemble pour un monde meilleur', subtitle: 'Rejoignez notre mission — chaque geste compte', cta: 'Nous soutenir' },
    services: { title: 'Nos Actions', items: [
      { icon: '🌍', name: 'Aide Humanitaire', desc: 'Programmes d\'urgence et de développement durable' },
      { icon: '📚', name: 'Éducation', desc: 'Accès à l\'éducation pour les enfants défavorisés' },
      { icon: '🌱', name: 'Environnement', desc: 'Protection des écosystèmes et reforestation' },
    ]},
    about: { title: 'Notre Mission', text: 'ONG fondée en 2005, nous intervenons dans 15 pays pour améliorer les conditions de vie des populations vulnérables. Transparence, efficacité et respect sont nos valeurs fondamentales.' },
    stats: [
      { value: '15', label: 'Pays' }, { value: '50K+', label: 'Bénéficiaires' }, { value: '200+', label: 'Bénévoles' },
    ],
    testimonials: [
      { name: 'Dr. Aminata Diallo', role: 'Partenaire local', text: 'Une ONG exemplaire par sa transparence et son efficacité terrain.' },
      { name: 'Marie D.', role: 'Donatrice', text: 'Je suis fière de soutenir une organisation qui fait vraiment la différence.' },
    ],
    features: [
      { icon: '🌍', text: 'Aide humanitaire' }, { icon: '📚', text: 'Éducation' }, { icon: '🌱', text: 'Environnement' }, { icon: '🤝', text: 'Transparence' },
    ],
    cta: { title: 'Faites un don', description: 'Votre générosité change des vies — reçu fiscal disponible', button: 'Donner' },
    footer: { company: 'Solidarité Internationale', tagline: 'Ensemble, plus forts' },
  },
];
