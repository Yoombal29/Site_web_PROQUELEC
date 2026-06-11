/**
 * Seed section-driven pages used by the public portal.
 *
 * These pages are rendered from site_settings.page_sections so dashboards can
 * control copy, sections and CTAs without editing stale Builder structures.
 */
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const pageSections = {
  home_page: {
    badge: 'PORTAIL PROQUELEC',
    hero_title: 'PROQUELEC|Sénégal',
    hero_subtitle:
      'Le portail national pour orienter ménages, professionnels, autorités et partenaires vers les bons services de sécurité électrique.',
    label: 'Portail PROQUELEC',
    renderMode: 'sections',
    sections: [
      { id: 'hero', label: 'Bannière', icon: 'Zap', type: 'hero' },
      { id: 'audience', label: 'Espaces publics', icon: 'Users2', type: 'features-list' },
      { id: 'mission', label: 'Mission', icon: 'Target', type: 'text-image' },
      { id: 'stats', label: 'Indicateurs', icon: 'BarChart', type: 'stats' },
    ],
    content: {
      hero: {
        title: 'PORTAIL PROQUELEC',
        subtitle: 'Sécurité, qualité et formation pour les installations électriques au Sénégal.',
        badge: 'PORTAIL OFFICIEL',
      },
      audience: {
        title: 'Un espace pour chaque public',
        subtitle: 'Accédez directement aux démarches et ressources adaptées.',
        layout: 'grid-4',
        features: [
          { title: 'Ménages', description: 'Prévention, diagnostic logement et conseils pratiques.', icon: 'Home' },
          { title: 'Professionnels', description: 'Outils, formations, labels et documentation technique.', icon: 'Briefcase' },
          { title: 'Autorités', description: 'Réglementation, audits, reporting et programmes publics.', icon: 'Landmark' },
          { title: 'Partenaires', description: 'Collaborations, événements et projets communs.', icon: 'Handshake' },
        ],
      },
      mission: {
        title: 'Une plateforme d’orientation opérationnelle',
        subtitle:
          'Le portail centralise les informations utiles et réduit les demandes incomplètes.',
        features: [
          'Comprendre les démarches',
          'Préparer les documents',
          'Identifier le bon interlocuteur',
          'Suivre les services numériques',
        ],
        image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80',
      },
      stats: {
        stats: [
          { value: '14', label: 'Régions ciblées' },
          { value: '24', suffix: 'h', label: 'Orientation initiale' },
          { value: '4', label: 'Espaces publics' },
          { value: '100', suffix: '%', label: 'Dynamique CMS' },
        ],
      },
    },
  },
  autorites: {
    badge: 'AUTORITÉS',
    hero_title: 'Espace|Autorités',
    hero_subtitle:
      'Solutions et ressources dédiées aux autorités publiques et organismes de régulation.',
    label: 'Espace Autorités',
    sections: [
      { id: 'hero', label: 'Bannière', icon: 'Landmark', type: 'hero' },
      { id: 'reglementation', label: 'Réglementation', icon: 'Scale', type: 'features-list' },
      { id: 'controle', label: 'Contrôle & Audit', icon: 'ShieldCheck', type: 'text-image' },
      { id: 'formation', label: 'Formation agents', icon: 'GraduationCap', type: 'features-list' },
    ],
    content: {
      hero: {
        title: 'Espace Autorités',
        subtitle: 'Appui technique, réglementaire et opérationnel pour sécuriser les politiques publiques.',
        badge: 'INSTITUTIONS',
      },
      reglementation: {
        title: 'Cadre réglementaire',
        subtitle: 'Accompagnement dans l’élaboration et l’application des normes électriques.',
        layout: 'grid-3',
        features: [
          { title: 'Veille réglementaire', description: 'Analyse des textes et référentiels applicables.', icon: 'BookOpen' },
          { title: 'Avis technique', description: 'Appui aux décisions publiques et projets normatifs.', icon: 'Scale' },
          { title: 'Bibliothèque', description: 'Guides, notes et documents de référence.', icon: 'FileText' },
        ],
      },
      controle: {
        title: 'Contrôle et audit',
        subtitle: 'Méthodes, checklists et reporting pour les infrastructures électriques.',
        features: ['Protocoles d’inspection', 'Suivi des non-conformités', 'Rapports sectoriels', 'Tableaux de bord'],
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
      },
      formation: {
        title: 'Formation des agents',
        subtitle: 'Programmes pour harmoniser les pratiques de contrôle.',
        layout: 'grid-2',
        features: [
          { title: 'Modules certifiants', description: 'Sécurité, conformité et inspection terrain.', icon: 'Award' },
          { title: 'Ateliers pratiques', description: 'Cas réels et mises en situation.', icon: 'Users2' },
        ],
      },
    },
  },
  menages: {
    badge: 'MÉNAGES',
    hero_title: 'Espace|Ménages',
    hero_subtitle: 'Conseils et informations pour la sécurité électrique de votre foyer.',
    label: 'Espace Ménages',
    sections: [
      { id: 'hero', label: 'Bannière', icon: 'Home', type: 'hero' },
      { id: 'securite', label: 'Sécurité domestique', icon: 'ShieldCheck', type: 'features-list' },
      { id: 'diagnostic', label: 'Diagnostic', icon: 'Search', type: 'text-image' },
      { id: 'conseils', label: 'Conseils pratiques', icon: 'HelpCircle', type: 'features-list' },
    ],
    content: {
      hero: {
        title: 'Espace Ménages',
        subtitle: 'Prévenir les risques électriques et préparer une demande de diagnostic fiable.',
        badge: 'PARTICULIERS',
      },
      securite: {
        title: 'Sécurité électrique à la maison',
        subtitle: 'Les signaux à surveiller et les bons réflexes.',
        layout: 'grid-3',
        features: [
          { title: 'Prises chaudes', description: 'Identifier les signes de surcharge ou de défaut.', icon: 'AlertTriangle' },
          { title: 'Disjonctions fréquentes', description: 'Comprendre quand demander un diagnostic.', icon: 'Zap' },
          { title: 'Protection famille', description: 'Gestes simples avant intervention d’un professionnel.', icon: 'ShieldCheck' },
        ],
      },
      diagnostic: {
        title: 'Préparer un diagnostic',
        subtitle: 'Rassemblez les informations utiles avant de contacter PROQUELEC.',
        features: ['Adresse du logement', 'Photos des points sensibles', 'Âge approximatif de l’installation', 'Description du problème'],
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
      },
      conseils: {
        title: 'Conseils pratiques',
        subtitle: 'Des repères simples pour réduire les risques au quotidien.',
        layout: 'grid-2',
        features: [
          { title: 'Ne pas surcharger', description: 'Éviter multiprises en cascade et câbles abîmés.', icon: 'Plug' },
          { title: 'Faire vérifier', description: 'Demander un contrôle en cas de doute persistant.', icon: 'CheckCircle' },
        ],
      },
    },
  },
  professionnels: {
    badge: 'PROFESSIONNELS',
    hero_title: 'Espace|Professionnels',
    hero_subtitle: 'Ressources et services pour les électriciens, bureaux d’études et entreprises.',
    label: 'Espace Professionnels',
    sections: [
      { id: 'hero', label: 'Bannière', icon: 'Briefcase', type: 'hero' },
      { id: 'certification', label: 'Certification', icon: 'Award', type: 'features-list' },
      { id: 'outils', label: 'Outils métier', icon: 'Settings', type: 'text-image' },
      { id: 'formation', label: 'Formation', icon: 'GraduationCap', type: 'features-list' },
    ],
    content: {
      hero: {
        title: 'Espace Professionnels',
        subtitle: 'Accédez aux outils, formations et démarches de conformité PROQUELEC.',
        badge: 'MÉTIERS',
      },
      certification: {
        title: 'Certification et reconnaissance',
        subtitle: 'Valorisez les compétences et la conformité de vos interventions.',
        layout: 'grid-3',
        features: [
          { title: 'QUALI-ELEC', description: 'Dossier, critères et parcours de validation.', icon: 'Award' },
          { title: 'Audit conformité', description: 'Contrôles et recommandations opérationnelles.', icon: 'ClipboardCheck' },
          { title: 'Renouvellement', description: 'Suivi des échéances et pièces à fournir.', icon: 'Calendar' },
        ],
      },
      outils: {
        title: 'Outils métier',
        subtitle: 'Calculateurs, guides, modèles et référentiels techniques.',
        features: ['Calculs électriques', 'Bibliothèque de documents', 'Modèles de rapports', 'Normes et guides'],
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
      },
      formation: {
        title: 'Formation continue',
        subtitle: 'Montez en compétence sur les exigences de sécurité et de conformité.',
        layout: 'grid-2',
        features: [
          { title: 'Sessions techniques', description: 'Modules en présentiel ou sur site.', icon: 'BookOpen' },
          { title: 'Attestation', description: 'Validation des acquis et suivi pédagogique.', icon: 'GraduationCap' },
        ],
      },
    },
  },
  presse: {
    badge: 'PRESSE',
    hero_title: 'Espace|Presse',
    hero_subtitle: 'Communiqués, dossiers médias et contacts PROQUELEC.',
    label: 'Espace Presse',
    sections: [
      { id: 'hero', label: 'Bannière', icon: 'Newspaper', type: 'hero' },
      { id: 'communiques', label: 'Communiqués', icon: 'Newspaper', type: 'features-list' },
      { id: 'dossiers', label: 'Dossiers presse', icon: 'FileText', type: 'text-image' },
      { id: 'contacts', label: 'Contacts', icon: 'Phone', type: 'features-list' },
    ],
    content: {
      hero: {
        title: 'Espace Presse',
        subtitle: 'Un accès rapide aux informations institutionnelles, chiffres clés et contacts médias.',
        badge: 'MÉDIAS',
      },
      communiques: {
        title: 'Communiqués',
        subtitle: 'Annonces officielles, campagnes et actualités.',
        layout: 'grid-3',
        features: [
          { title: 'Annonces', description: 'Informations institutionnelles publiables.', icon: 'Megaphone' },
          { title: 'Campagnes', description: 'Prévention et sensibilisation publique.', icon: 'ShieldCheck' },
          { title: 'Archives', description: 'Traçabilité des publications antérieures.', icon: 'Archive' },
        ],
      },
      dossiers: {
        title: 'Dossiers de presse',
        subtitle: 'Ressources utiles pour préparer articles, interviews et reportages.',
        features: ['Présentation PROQUELEC', 'Logos et visuels', 'Chiffres clés', 'Contacts officiels'],
        image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
      },
      contacts: {
        title: 'Contacts presse',
        subtitle: 'Orientation rapide vers l’interlocuteur communication.',
        layout: 'grid-2',
        features: [
          { title: 'Demandes médias', description: 'Interview, citation, précision technique.', icon: 'Mic2' },
          { title: 'Dossier urgent', description: 'Signalement d’un besoin prioritaire.', icon: 'Phone' },
        ],
      },
    },
  },
  marches: {
    badge: 'MARCHÉS SÉCURISÉS',
    hero_title: 'Marchés|Sécurisés',
    hero_subtitle: 'Repères, procédures et ressources pour sécuriser les marchés et projets électriques.',
    label: 'Marchés Sécurisés',
    sections: [
      { id: 'hero', label: 'Bannière', icon: 'Briefcase', type: 'hero' },
      { id: 'risques', label: 'Risques', icon: 'ShieldCheck', type: 'features-list' },
      { id: 'process', label: 'Processus', icon: 'FileBarChart', type: 'text-image' },
      { id: 'resources', label: 'Ressources', icon: 'Download', type: 'features-list' },
    ],
    content: {
      hero: {
        title: 'Marchés Sécurisés',
        subtitle: 'Réduire les risques techniques, documentaires et contractuels des projets électriques.',
        badge: 'CONFORMITÉ',
      },
      risques: {
        title: 'Points de vigilance',
        subtitle: 'Les contrôles essentiels avant attribution, exécution et réception.',
        layout: 'grid-3',
        features: [
          { title: 'Exigences techniques', description: 'CCTP, normes applicables et critères de conformité.', icon: 'FileText' },
          { title: 'Traçabilité', description: 'Documents, visas, réserves et décisions conservés.', icon: 'ClipboardCheck' },
          { title: 'Réception sécurisée', description: 'Contrôles finaux avant mise en service.', icon: 'ShieldCheck' },
        ],
      },
      process: {
        title: 'Parcours de sécurisation',
        subtitle: 'Une méthode progressive pour limiter les litiges et défauts de conformité.',
        features: ['Analyse du dossier marché', 'Contrôle des exigences électriques', 'Suivi des réserves', 'Rapport de réception'],
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
      },
      resources: {
        title: 'Ressources utiles',
        subtitle: 'Documents et modèles pour préparer un marché électrique fiable.',
        layout: 'grid-2',
        features: [
          { title: 'Checklist marché', description: 'Points à vérifier avant publication ou attribution.', icon: 'CheckCircle' },
          { title: 'Modèle de réception', description: 'Structure de rapport et réserves types.', icon: 'FileText' },
        ],
      },
    },
  },
  partenaires: {
    badge: 'PARTENAIRES',
    hero_title: 'Nos|Partenaires',
    hero_subtitle: 'Découvrez les organisations qui collaborent avec PROQUELEC.',
    label: 'Partenaires',
    sections: [
      { id: 'hero', label: 'Bannière', icon: 'Handshake', type: 'hero' },
      { id: 'institutionnels', label: 'Institutionnels', icon: 'Landmark', type: 'text-image' },
      { id: 'techniques', label: 'Techniques', icon: 'Settings', type: 'text-image' },
      { id: 'financiers', label: 'Financiers', icon: 'Banknote', type: 'text-image' },
      { id: 'prives', label: 'Privés', icon: 'Building', type: 'text-image' },
    ],
    content: {
      hero: {
        title: 'Nos Partenaires',
        subtitle: 'Un réseau institutionnel, technique et privé au service de la sécurité électrique.',
        badge: 'RÉSEAU',
      },
      institutionnels: {
        title: 'Partenaires Institutionnels',
        subtitle: "L'appui de l'État et des organismes publics.",
        features: ['Ministère de l’Énergie et du Pétrole', 'SENELEC', 'ANARE', 'Collectivités territoriales'],
        image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80',
      },
      techniques: {
        title: 'Partenaires Techniques',
        subtitle: 'L’excellence au service de la sécurité.',
        features: ['Normalisation', 'Fabricants certifiés', 'Bureaux de contrôle', 'Instituts techniques'],
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
      },
      financiers: {
        title: 'Partenaires Financiers',
        subtitle: 'Soutenir la croissance et l’investissement.',
        features: ['Banques de développement', 'Fonds verts', 'Coopération internationale', 'Assurances'],
        image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80',
      },
      prives: {
        title: 'Partenaires Privés',
        subtitle: 'Un réseau de confiance pour le secteur.',
        features: ['Entreprises BTP', 'Syndicats professionnels', 'Promoteurs immobiliers', 'Distributeurs'],
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
      },
    },
  },
  espace_partenaires: {
    badge: 'ESPACE PARTENAIRES',
    hero_title: 'Espace|Partenaires',
    hero_subtitle: 'Un espace dédié aux organisations, institutions et entreprises partenaires.',
    label: 'Espace Partenaires',
    sections: [
      { id: 'hero', label: 'Bannière', icon: 'Handshake', type: 'hero' },
      { id: 'collaboration', label: 'Collaborer', icon: 'Users2', type: 'features-list' },
      { id: 'process', label: 'Processus', icon: 'Settings', type: 'text-image' },
      { id: 'cta', label: 'Contact partenaire', icon: 'Mail', type: 'text-image' },
    ],
    content: {
      hero: {
        title: 'Espace Partenaires',
        subtitle: 'Coordonnez vos initiatives, événements et ressources avec l’écosystème PROQUELEC.',
        badge: 'RÉSEAU',
      },
      collaboration: {
        title: 'Axes de collaboration',
        subtitle: 'Des partenariats structurés pour la sécurité et la qualité électrique.',
        layout: 'grid-3',
        features: [
          { title: 'Événements communs', description: 'Conférences, ateliers et campagnes de sensibilisation.', icon: 'Calendar' },
          { title: 'Ressources techniques', description: 'Guides, supports et contenus co-produits.', icon: 'BookOpen' },
          { title: 'Projets terrain', description: 'Actions de contrôle, formation ou appui institutionnel.', icon: 'MapPin' },
        ],
      },
      process: {
        title: 'Devenir partenaire',
        subtitle: 'Un parcours clair pour qualifier le besoin et cadrer la collaboration.',
        features: ['Qualification du profil', 'Validation des objectifs', 'Convention ou plan d’action', 'Suivi des résultats'],
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
      },
      cta: {
        title: 'Proposer une collaboration',
        subtitle: 'Présentez votre organisation, votre projet et les publics concernés.',
        features: ['Contact partenariat', 'Dossier de présentation', 'Réponse sous 5 jours ouvrés'],
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
      },
    },
  },
  trainings: {
    badge: 'FORMATIONS',
    hero_title: 'Espace|Formations',
    hero_subtitle: 'Programmes, sessions et parcours certifiants pour les professionnels et partenaires.',
    label: 'Espace Formations',
    sections: [
      { id: 'hero', label: 'Bannière', icon: 'GraduationCap', type: 'hero' },
      { id: 'catalog', label: 'Catalogue', icon: 'BookOpen', type: 'features-list' },
      { id: 'certification', label: 'Certification', icon: 'Award', type: 'text-image' },
      { id: 'stats', label: 'Indicateurs', icon: 'BarChart', type: 'stats' },
    ],
    content: {
      hero: {
        title: 'Espace Formations',
        subtitle: 'Développez les compétences terrain et préparez les contrôles de conformité.',
        badge: 'APPRENTISSAGE',
      },
      catalog: {
        title: 'Catalogue de formation',
        subtitle: 'Des modules adaptés aux techniciens, installateurs, entreprises et autorités.',
        layout: 'grid-3',
        features: [
          { title: 'Habilitation électrique', description: 'Parcours sécurité et bonnes pratiques.', icon: 'ShieldCheck' },
          { title: 'Contrôle conformité', description: 'Méthodes, checklists et rapports.', icon: 'ClipboardCheck' },
          { title: 'Énergies renouvelables', description: 'Solaire, stockage et exigences techniques.', icon: 'Zap' },
        ],
      },
      certification: {
        title: 'Parcours certifiants',
        subtitle: 'Des formations structurées avec supports, exercices et attestation.',
        features: ['Sessions inter ou intra-entreprise', 'Supports pédagogiques', 'Évaluation des acquis', 'Attestation PROQUELEC'],
        image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
      },
      stats: {
        stats: [
          { value: '3', label: 'Niveaux' },
          { value: '5', suffix: 'j', label: 'Format moyen' },
          { value: '14', label: 'Régions ciblées' },
          { value: '24', suffix: 'h', label: 'Réponse inscription' },
        ],
      },
    },
  },
};

const pageBindings = [
  { slug: 'home', settingsKey: 'home_page', title: 'Portail PROQUELEC' },
  { slug: 'autorites', settingsKey: 'autorites', title: 'Espace Autorités' },
  { slug: 'espace-autorites', settingsKey: 'autorites', title: 'Espace Autorités' },
  { slug: 'menages', settingsKey: 'menages', title: 'Espace Ménages' },
  { slug: 'espace-menages', settingsKey: 'menages', title: 'Espace Ménages' },
  { slug: 'marches', settingsKey: 'marches', title: 'Marchés Sécurisés' },
  { slug: 'professionnels', settingsKey: 'professionnels', title: 'Espace Professionnels' },
  { slug: 'espace-professionnels', settingsKey: 'professionnels', title: 'Espace Professionnels' },
  { slug: 'partenaires', settingsKey: 'partenaires', title: 'Partenaires' },
  { slug: 'espace-partenaires', settingsKey: 'espace_partenaires', title: 'Espace Partenaires' },
  { slug: 'formations', settingsKey: 'trainings', title: 'Espace Formations' },
  { slug: 'presse', settingsKey: 'presse', title: 'Espace Presse' },
];

const SECTION_TYPE_BY_ID = {
  hero: 'hero',
  stats: 'stats',
  categories: 'features-list',
  catalog: 'features-list',
  partners: 'features-list',
};

const inferSectionType = (section, content) => {
  if (section?.type) return section.type;
  if (SECTION_TYPE_BY_ID[section?.id]) return SECTION_TYPE_BY_ID[section.id];
  if (content?.stats) return 'stats';
  if (content?.image || content?.media) return 'text-image';
  return 'features-list';
};

const mergeSectionConfig = (existing, fallback) => {
  if (!existing || typeof existing !== 'object') return fallback;

  const existingSections = Array.isArray(existing.sections) ? existing.sections : [];
  const fallbackSections = Array.isArray(fallback.sections) ? fallback.sections : [];
  const fallbackHero = fallbackSections.find((section) => section.id === 'hero');
  const hasHero = existingSections.some((section) => section?.id === 'hero' || section?.type === 'hero');
  const content = { ...(fallback.content || {}), ...(existing.content || {}) };
  const sections = existingSections.length ? existingSections : fallbackSections;
  const sectionsWithHero = hasHero || !fallbackHero ? sections : [fallbackHero, ...sections];

  return {
    ...fallback,
    ...existing,
    badge: existing.badge || fallback.badge,
    hero_title: existing.hero_title || fallback.hero_title,
    hero_subtitle: existing.hero_subtitle || fallback.hero_subtitle,
    label: existing.label || fallback.label,
    content,
    sections: sectionsWithHero.map((section) => ({
      ...section,
      type: inferSectionType(section, content[section.id]),
    })),
  };
};

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query('SELECT page_sections FROM public.site_settings WHERE id = 1');
    const existingSections = rows[0]?.page_sections || {};
    const mergedSections = { ...existingSections };
    const added = [];

    Object.entries(pageSections).forEach(([key, value]) => {
      if (!mergedSections[key]) {
        mergedSections[key] = value;
        added.push(key);
      } else {
        mergedSections[key] = mergeSectionConfig(mergedSections[key], value);
      }
    });

    await client.query(
      `UPDATE public.site_settings
       SET page_sections = $1::jsonb, updated_at = NOW()
       WHERE id = 1`,
      [JSON.stringify(mergedSections)],
    );

    for (const binding of pageBindings) {
      const sectionData = mergedSections[binding.settingsKey] || pageSections[binding.settingsKey];
      await client.query(
        `UPDATE public.pages
         SET title = $2,
             status = 'published',
             workflow_status = 'published',
             is_published = true,
             design_options = COALESCE(design_options, '{}'::jsonb)
               || jsonb_build_object(
                    'page_type', 'section_driven',
                    'section_driven', true,
                    'settings_key', $3::text,
                    'render_source', 'site_settings.page_sections'
                  ),
             meta_description = COALESCE(NULLIF(meta_description, ''), $4),
             updated_at = NOW()
         WHERE slug = $1`,
        [
          binding.slug,
          binding.title,
          binding.settingsKey,
          sectionData?.hero_subtitle || `Page dynamique ${binding.title}`,
        ],
      );
    }

    await client.query('COMMIT');
    console.log(
      `[section-driven-pages] Seed complete. Added keys: ${added.length ? added.join(', ') : 'none'}`,
    );
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

main()
  .catch((error) => {
    console.error('[section-driven-pages] Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
