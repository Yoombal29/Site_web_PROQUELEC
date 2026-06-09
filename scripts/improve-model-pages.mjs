import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODELS_DIR = path.resolve(__dirname, '../model-page');
const REGISTRY_FILE = path.resolve(__dirname, '../src/data/pqTemplates.ts');

const pages = [
  {
    slug: 'accueil',
    badge: 'Portail national',
    title: 'PROQUELEC S&eacute;n&eacute;gal',
    subtitle: 'La qualit&eacute; &eacute;lectrique, lisible et contr&ocirc;lable',
    intro:
      'Une page d&apos;accueil claire pour orienter les m&eacute;nages, les professionnels, les autorit&eacute;s et les partenaires vers les bons services de s&eacute;curit&eacute; &eacute;lectrique.',
    primary: ['Demander un contr&ocirc;le', '/contact'],
    secondary: ['Voir les services', '/expertises'],
    metrics: [
      ['1995', 'Ann&eacute;e de cr&eacute;ation'],
      ['500+', 'Dossiers suivis'],
      ['14', 'R&eacute;gions cibl&eacute;es'],
      ['24h', 'Orientation initiale'],
    ],
    sectionTitle: 'Un parcours simple pour chaque public',
    sectionIntro:
      'La page doit permettre &agrave; chaque visiteur de comprendre o&ugrave; aller, quoi pr&eacute;parer et comment PROQUELEC intervient.',
    cards: [
      ['M&eacute;nages', 'Conseils de pr&eacute;vention, demande de diagnostic logement et rep&egrave;res pour identifier les risques visibles.'],
      ['Professionnels', 'Acc&egrave;s aux formations, outils m&eacute;tiers, labels, certifications et documentation technique.'],
      ['Autorit&eacute;s', 'Tableaux de bord, campagnes publiques, planification territoriale et suivi des risques.'],
      ['Partenaires', 'Cadre de collaboration, projets communs, presse et ressources institutionnelles.'],
    ],
    steps: [
      ['Identifier le profil', 'Le visiteur choisit son espace et obtient les informations adapt&eacute;es.'],
      ['Comprendre la d&eacute;marche', 'La page r&eacute;sume les documents, d&eacute;lais et interlocuteurs.'],
      ['Passer &agrave; l&apos;action', 'Un appel clair permet de demander un contr&ocirc;le, une formation ou un partenariat.'],
      ['Suivre le dossier', 'Les pages m&eacute;tier donnent les prochaines &eacute;tapes et les crit&egrave;res de conformit&eacute;.'],
    ],
    checklist: [
      'Afficher les trois publics prioritaires au premier &eacute;cran.',
      'Rendre visibles les preuves de confiance et les chiffres utiles.',
      'Limiter les textes institutionnels longs au profit de parcours concrets.',
      'Pr&eacute;voir un lien direct vers contact, normes, formations et espace professionnel.',
    ],
    result:
      'Une page d&apos;accueil plus robuste sert de tableau d&apos;orientation, pas seulement de vitrine.',
  },
  {
    slug: 'about',
    badge: 'Institution',
    title: '&Agrave; propos de PROQUELEC',
    subtitle: 'Un tiers de confiance pour la s&eacute;curit&eacute; &eacute;lectrique',
    intro:
      'Association &agrave; but non lucratif r&eacute;gie par la loi n&deg; 68-08, PROQUELEC structure la pr&eacute;vention, le contr&ocirc;le et l&apos;accompagnement technique au service des usagers.',
    primary: ['Notre mission', '/utilite-publique'],
    secondary: ['Nous contacter', '/contact'],
    metrics: [
      ['Loi 68-08', 'Cadre associatif'],
      ['8', 'Administrateurs'],
      ['FISUEL', 'Coop&eacute;ration'],
      ['ERP', 'B&acirc;timents suivis'],
    ],
    sectionTitle: 'Ce que la page doit clarifier',
    sectionIntro:
      'Le contenu institutionnel devient utile quand il explique le r&ocirc;le exact de PROQUELEC et les garanties apport&eacute;es aux usagers.',
    cards: [
      ['Mission', 'Promouvoir la qualit&eacute; des installations &eacute;lectriques pour prot&eacute;ger les personnes et les biens.'],
      ['Gouvernance', 'Rassembler distributeurs, installateurs, contr&ocirc;leurs, bureaux d&apos;&eacute;tudes et repr&eacute;sentants du secteur.'],
      ['R&eacute;f&eacute;rences', 'Valoriser les audits men&eacute;s pour administrations, entreprises, sites industriels et organisations internationales.'],
      ['Coop&eacute;ration', 'Relier les pratiques locales aux standards internationaux de pr&eacute;vention et de conformit&eacute;.'],
    ],
    steps: [
      ['Comprendre', 'Expliquer le statut, la mission et la l&eacute;gitimit&eacute; de l&apos;organisme.'],
      ['Prouver', 'Montrer des r&eacute;f&eacute;rences, domaines d&apos;intervention et engagements mesurables.'],
      ['Orienter', 'Guider vers les pages de contr&ocirc;le, certification, formation ou partenariat.'],
      ['Actualiser', 'Maintenir &agrave; jour les contacts, membres et coop&eacute;rations.'],
    ],
    checklist: [
      'Statut juridique, ann&eacute;e de cr&eacute;ation et finalit&eacute; publique.',
      'Domaines couverts : habitat, industrie, ERP, march&eacute;s, &eacute;clairage public.',
      'R&eacute;f&eacute;rences d&apos;audit pr&eacute;sent&eacute;es avec prudence et clart&eacute;.',
      'Lien visible vers utilit&eacute; publique, contact et expertises.',
    ],
    result:
      'La page devient une preuve de confiance structur&eacute;e, utile aux institutions comme aux particuliers.',
  },
  {
    slug: 'actualites',
    badge: 'Veille et agenda',
    title: 'Actualit&eacute;s &amp; &eacute;v&eacute;nements',
    subtitle: 'Informer vite, orienter clairement',
    intro:
      'Une page con&ccedil;ue pour publier les annonces importantes, les campagnes de pr&eacute;vention et les rendez-vous techniques sans perdre le lecteur.',
    primary: ['Recevoir les annonces', '/contact'],
    secondary: ['Voir les campagnes', '/evenements-campagnes'],
    metrics: [
      ['4', 'Types de contenus'],
      ['72h', 'Compte rendu cible'],
      ['14', 'R&eacute;gions'],
      ['2026', 'Agenda en cours'],
    ],
    sectionTitle: 'Une actualit&eacute; orient&eacute;e action',
    sectionIntro:
      'Chaque information doit r&eacute;pondre &agrave; trois questions : qui est concern&eacute;, quelle d&eacute;cision prendre, quel lien suivre.',
    cards: [
      ['Alerte s&eacute;curit&eacute;', 'Messages courts pour signaler une campagne, une anomalie r&eacute;currente ou une recommandation urgente.'],
      ['Formation', 'Ouvertures de sessions, pr&eacute;requis, dates, lieux et proc&eacute;dure d&apos;inscription.'],
      ['Partenariat', 'Annonces d&apos;accords, objectifs partag&eacute;s et impacts attendus pour les usagers.'],
      ['Bilan terrain', 'R&eacute;sultats de campagnes avec chiffres, enseignements et prochaines actions.'],
    ],
    steps: [
      ['Qualifier', 'Classer chaque publication par audience et th&egrave;me.'],
      ['R&eacute;sumer', 'Afficher date, lieu, enjeu et appel &agrave; l&apos;action.'],
      ['Relier', 'Ajouter les liens vers normes, formations, contact ou dossier presse.'],
      ['Archiver', 'Conserver les anciens contenus pour la tra&ccedil;abilit&eacute;.'],
    ],
    checklist: [
      'Filtres visibles : normes, formations, campagnes, partenariats.',
      'Date, lieu et statut de chaque &eacute;v&eacute;nement.',
      'Lien d&apos;inscription ou de contact sur chaque annonce utile.',
      'R&eacute;sum&eacute; lisible en moins de cinq lignes.',
    ],
    result:
      'La page devient un centre de veille op&eacute;rationnel au lieu d&apos;une simple liste d&apos;articles.',
  },
  {
    slug: 'blog',
    badge: 'Conseils experts',
    title: 'Blog technique',
    subtitle: 'Expliquer les risques et les bonnes pratiques',
    intro:
      'Des articles p&eacute;dagogiques pour aider les m&eacute;nages, artisans, bureaux d&apos;&eacute;tudes et collectivit&eacute;s &agrave; comprendre les exigences de s&eacute;curit&eacute;.',
    primary: ['Proposer un sujet', '/contact'],
    secondary: ['Consulter la FAQ', '/faq'],
    metrics: [
      ['5 min', 'Lecture cible'],
      ['4', 'Rubriques'],
      ['SN 01-015', 'R&eacute;f&eacute;rentiel'],
      ['PDF', 'Ressources li&eacute;es'],
    ],
    sectionTitle: 'Des articles qui servent le terrain',
    sectionIntro:
      'Le blog doit traduire les normes et retours d&apos;exp&eacute;rience en recommandations concr&egrave;tes, v&eacute;rifiables et faciles &agrave; appliquer.',
    cards: [
      ['Pr&eacute;vention domestique', 'Prises qui chauffent, disjonctions, multiprises, humidit&eacute; et comportements &agrave; risque.'],
      ['Normes expliqu&eacute;es', 'Lecture simple des obligations et points de contr&ocirc;le les plus fr&eacute;quents.'],
      ['Chantiers', 'Bonnes pratiques de mise en oeuvre, documentation, essais et r&eacute;ception.'],
      ['Innovation', 'Solaire, domotique, stockage et nouveaux usages &agrave; contr&ocirc;ler.'],
    ],
    steps: [
      ['Identifier un probl&egrave;me', 'Partir d&apos;une situation terrain claire.'],
      ['Expliquer le risque', 'Dire pourquoi le point est important pour la s&eacute;curit&eacute;.'],
      ['Donner une action', 'Terminer par une v&eacute;rification ou un document &agrave; pr&eacute;parer.'],
      ['Relier au service', 'Orienter vers contact, diagnostic, formation ou norme.'],
    ],
    checklist: [
      'Un titre concret, sans jargon inutile.',
      'Une recommandation applicable par le lecteur.',
      'Une limite claire : quand appeler un professionnel.',
      'Un lien vers les ressources officielles ou pages m&eacute;tier.',
    ],
    result:
      'Le blog devient un outil de pr&eacute;vention et de conversion vers les services utiles.',
  },
  {
    slug: 'certifications',
    badge: 'QUALI-ELEC',
    title: 'Certifications',
    subtitle: 'Un label clair pour les installations et les professionnels',
    intro:
      'La certification transforme un contr&ocirc;le technique en preuve compr&eacute;hensible pour le client, l&apos;administration et les donneurs d&apos;ordre.',
    primary: ['D&eacute;poser un dossier', '/contact'],
    secondary: ['Voir les formations', '/formation-certification'],
    metrics: [
      ['4', '&Eacute;tapes'],
      ['3 ans', 'Validit&eacute; cible'],
      ['15 j', 'Commission'],
      ['Audit', 'Contr&ocirc;le terrain'],
    ],
    sectionTitle: 'Un parcours de certification tra&ccedil;able',
    sectionIntro:
      'Le visiteur doit comprendre les crit&egrave;res, le dossier attendu et le r&eacute;sultat obtenu apr&egrave;s validation.',
    cards: [
      ['Dossier', 'Agr&eacute;ment, assurance, r&eacute;f&eacute;rences chantier, identit&eacute; entreprise et engagements qualit&eacute;.'],
      ['Audit', 'V&eacute;rification documentaire et contr&ocirc;le technique sur &eacute;chantillon ou installation cible.'],
      ['Commission', 'Analyse ind&eacute;pendante, demandes de compl&eacute;ments et d&eacute;cision motiv&eacute;e.'],
      ['Registre', 'Inscription du titulaire, dur&eacute;e de validit&eacute; et conditions de renouvellement.'],
    ],
    steps: [
      ['Pr&eacute;-qualification', 'V&eacute;rifier l&apos;&eacute;ligibilit&eacute; et les documents de base.'],
      ['Audit technique', 'Contr&ocirc;ler la conformit&eacute; et les pratiques de r&eacute;alisation.'],
      ['Corrections', 'Lever les r&eacute;serves avant passage en commission.'],
      ['D&eacute;livrance', 'Publier le statut et les conditions de suivi.'],
    ],
    checklist: [
      'Pi&egrave;ces administratives &agrave; jour.',
      'R&eacute;f&eacute;rences de chantiers document&eacute;es.',
      'Assurance responsabilit&eacute; civile professionnelle.',
      'Engagement &agrave; respecter la norme et les r&egrave;gles de s&eacute;curit&eacute;.',
    ],
    result:
      'La certification devient un processus lisible, audit&eacute; et valorisable dans les appels d&apos;offres.',
  },
  {
    slug: 'contact',
    badge: 'Orientation rapide',
    title: 'Contact',
    subtitle: 'Diriger chaque demande vers le bon service',
    intro:
      'Une page contact utile qualifie la demande, annonce les d&eacute;lais de r&eacute;ponse et donne les coordonn&eacute;es officielles sans ambigu&iuml;t&eacute;.',
    primary: ['Envoyer une demande', 'mailto:proquelec@proquelec.sn'],
    secondary: ['Appeler le standard', 'tel:+221338486855'],
    metrics: [
      ['+221 33 848 68 55', 'Standard'],
      ['24h', 'Accus&eacute; cible'],
      ['Dakar', 'Si&egrave;ge'],
      ['NINEA', '0191403 089'],
    ],
    sectionTitle: 'Qualifier avant de r&eacute;pondre',
    sectionIntro:
      'Le formulaire doit demander uniquement les informations qui permettent de router correctement le dossier.',
    cards: [
      ['Contr&ocirc;le', 'Adresse du site, type de b&acirc;timent, urgence, disponibilit&eacute;s et photos si possible.'],
      ['Formation', 'Profil des participants, habilitation souhait&eacute;e, lieu et p&eacute;riode cible.'],
      ['Certification', 'Type de label vis&eacute;, statut de l&apos;entreprise, r&eacute;f&eacute;rences et documents disponibles.'],
      ['Partenariat', 'Objet, organisation, zone d&apos;intervention et livrables attendus.'],
    ],
    steps: [
      ['R&eacute;ception', 'La demande est enregistr&eacute;e et qualifi&eacute;e.'],
      ['Orientation', 'Le bon interlocuteur technique est identifi&eacute;.'],
      ['Retour', 'Une r&eacute;ponse ou une demande de compl&eacute;ment est envoy&eacute;e.'],
      ['Suivi', 'Le dossier est bascul&eacute; vers contr&ocirc;le, formation, certification ou partenariat.'],
    ],
    checklist: [
      'Email officiel : proquelec@proquelec.sn.',
      'T&eacute;l&eacute;phone officiel : +221 33 848 68 55.',
      'Si&egrave;ge : Immeuble Coumba Castel, 12 rue Saint-Michel, 4e &eacute;tage, Dakar.',
      'Objet obligatoire pour &eacute;viter les demandes non traitables.',
    ],
    result:
      'La page contact devient un outil de qualification des demandes et r&eacute;duit les allers-retours.',
  },
  {
    slug: 'espace-menages',
    badge: 'S&eacute;curit&eacute; domestique',
    title: 'Espace m&eacute;nages',
    subtitle: 'Prot&eacute;ger le foyer avant l&apos;incident',
    intro:
      'Un espace pens&eacute; pour aider les familles &agrave; rep&eacute;rer les dangers, pr&eacute;parer un diagnostic et comprendre les gestes de pr&eacute;vention.',
    primary: ['Demander un diagnostic', '/contact'],
    secondary: ['Lire la FAQ', '/faq'],
    metrics: [
      ['30 mA', 'Protection diff&eacute;rentielle'],
      ['Terre', 'Point prioritaire'],
      ['5', 'Signaux d&apos;alerte'],
      ['72h', 'Rapport cible'],
    ],
    sectionTitle: 'Les informations qui sauvent du temps',
    sectionIntro:
      'La page doit parler simplement : sympt&ocirc;mes visibles, actions imm&eacute;diates, documents utiles et moment o&ugrave; appeler un professionnel.',
    cards: [
      ['Signaux d&apos;alerte', 'Prises chaudes, odeur de br&ucirc;l&eacute;, lumi&egrave;res instables, disjonctions fr&eacute;quentes ou fils apparents.'],
      ['Diagnostic logement', 'Contr&ocirc;le du tableau, de la terre, des protections, des circuits humides et des surcharges.'],
      ['Conseils pratiques', 'Limiter les multiprises, isoler l&apos;eau, couper avant intervention et remplacer les mat&eacute;riels ab&icirc;m&eacute;s.'],
      ['Rapport', 'Liste des anomalies, niveau de priorit&eacute;, recommandations et orientation vers un installateur qualifi&eacute;.'],
    ],
    steps: [
      ['Observer', 'Rep&eacute;rer les sympt&ocirc;mes sans d&eacute;monter l&apos;installation.'],
      ['S&eacute;curiser', 'Couper le circuit concern&eacute; en cas de danger visible.'],
      ['Demander', 'Transmettre adresse, photos et description du probl&egrave;me.'],
      ['Corriger', 'Faire traiter les r&eacute;serves par un professionnel comp&eacute;tent.'],
    ],
    checklist: [
      'Photo du tableau &eacute;lectrique et des zones &agrave; risque.',
      'Liste des appareils qui provoquent une coupure.',
      'Date approximative de l&apos;installation ou de la derni&egrave;re r&eacute;novation.',
      'Adresse compl&egrave;te et disponibilit&eacute;s pour la visite.',
    ],
    result:
      'Le contenu devient compr&eacute;hensible par les familles et directement exploitable par les techniciens.',
  },
  {
    slug: 'espace-professionnels',
    badge: 'Outils m&eacute;tiers',
    title: 'Espace professionnels',
    subtitle: 'Structurer les dossiers techniques et la conformit&eacute;',
    intro:
      'Un espace pour les installateurs, bureaux d&apos;&eacute;tudes, entreprises et mainteneurs qui doivent documenter, contr&ocirc;ler et valoriser leurs travaux.',
    primary: ['Voir les outils', '/outils-metier'],
    secondary: ['Demander un label', '/labels'],
    metrics: [
      ['SN 01-015', 'R&eacute;f&eacute;rence'],
      ['BT / HTA', 'Habilitations'],
      ['PDF', 'Dossier technique'],
      ['Audit', 'Validation'],
    ],
    sectionTitle: 'Un espace orient&eacute; production',
    sectionIntro:
      'Le professionnel doit trouver rapidement ce qu&apos;il lui faut pour pr&eacute;parer un chantier, une r&eacute;ception ou une certification.',
    cards: [
      ['Dossier chantier', 'Sch&eacute;mas, notes de calcul, r&eacute;ception, essais et r&eacute;serves.'],
      ['Outils de calcul', 'Chute de tension, sections de c&acirc;bles, protections et listes de contr&ocirc;le.'],
      ['Formations', 'Habilitation &eacute;lectrique, mise &agrave; niveau normes et modules sp&eacute;cialis&eacute;s.'],
      ['Labels', 'Valorisation des entreprises respectant les exigences techniques et documentaires.'],
    ],
    steps: [
      ['Pr&eacute;parer', 'Rassembler plans, notices et hypoth&egrave;ses de calcul.'],
      ['V&eacute;rifier', 'Contr&ocirc;ler les points critiques avant demande de visa.'],
      ['Soumettre', 'Envoyer un dossier complet et lisible.'],
      ['Capitaliser', 'Archiver les retours pour am&eacute;liorer les prochains chantiers.'],
    ],
    checklist: [
      'Plan unifilaire et implantation.',
      'Note de calcul et choix des protections.',
      'PV de mesures et essais.',
      'Photos de l&apos;installation et r&eacute;serves lev&eacute;es.',
    ],
    result:
      'La page devient un poste de travail num&eacute;rique pour les dossiers de conformit&eacute;.',
  },
  {
    slug: 'espace-autorites',
    badge: 'Pilotage public',
    title: 'Espace autorit&eacute;s',
    subtitle: 'Planifier, suivre et prioriser les risques',
    intro:
      'Une page destin&eacute;e aux collectivit&eacute;s, minist&egrave;res et services publics qui doivent piloter des campagnes de pr&eacute;vention et de mise en conformit&eacute;.',
    primary: ['Demander un appui', '/contact'],
    secondary: ['Voir l&apos;observatoire', '/observatoire'],
    metrics: [
      ['ERP', 'Sites sensibles'],
      ['March&eacute;s', 'Zones prioritaires'],
      ['SIG', 'Cartographie'],
      ['Bilan', 'Suivi public'],
    ],
    sectionTitle: 'Des informations pour d&eacute;cider',
    sectionIntro:
      'Le contenu doit transformer les constats terrain en priorit&eacute;s d&apos;action : zones, risques, budgets et calendrier.',
    cards: [
      ['Cartographie des risques', 'Identifier les march&eacute;s, &eacute;coles, postes de sant&eacute; et sites publics &agrave; contr&ocirc;ler.'],
      ['Campagnes cibl&eacute;es', 'Planifier sensibilisation, diagnostics et corrections avec indicateurs de suivi.'],
      ['Appui technique', 'Accompagner la r&eacute;daction de cahiers des charges et la r&eacute;ception des travaux.'],
      ['Reporting', 'Publier des bilans lisibles pour les d&eacute;cideurs et les citoyens.'],
    ],
    steps: [
      ['Lister', 'Constituer le portefeuille de sites &agrave; suivre.'],
      ['Prioriser', 'Classer par danger, fr&eacute;quentation et impact public.'],
      ['Intervenir', 'Lancer diagnostics, corrections et sensibilisation.'],
      ['Mesurer', 'Suivre avancement, co&ucirc;ts et risques r&eacute;siduels.'],
    ],
    checklist: [
      'Inventaire des sites avec localisation.',
      'Historique d&apos;incidents ou de pannes.',
      'Plans, contrats ou rapports existants.',
      'Interlocuteur public responsable du suivi.',
    ],
    result:
      'La page aide les autorit&eacute;s &agrave; arbitrer les actions selon le risque r&eacute;el.',
  },
  {
    slug: 'evenements-campagnes',
    badge: 'Campagnes publiques',
    title: '&Eacute;v&eacute;nements &amp; campagnes',
    subtitle: 'Organiser la pr&eacute;vention sur le terrain',
    intro:
      'Un calendrier utile pour annoncer les actions, pr&eacute;ciser les publics concern&eacute;s et capitaliser les r&eacute;sultats de sensibilisation.',
    primary: ['Proposer une campagne', '/contact'],
    secondary: ['Voir les actualit&eacute;s', '/actualites'],
    metrics: [
      ['Agenda', 'Dates &agrave; venir'],
      ['Terrain', 'Actions locales'],
      ['Bilan', 'R&eacute;sultats'],
      ['Photos', 'Preuves terrain'],
    ],
    sectionTitle: 'Chaque campagne doit &ecirc;tre mesurable',
    sectionIntro:
      'La page doit afficher les objectifs, cibles, lieux, partenaires et indicateurs attendus pour chaque action.',
    cards: [
      ['March&eacute;s conformes', 'Sensibilisation et diagnostic dans les zones &agrave; forte densit&eacute; commerciale.'],
      ['Foyers s&ucirc;rs', 'Ateliers pratiques pour les familles sur les gestes de pr&eacute;vention.'],
      ['&Eacute;coles techniques', 'Rencontres avec apprenants et formateurs sur la conformit&eacute; des pratiques.'],
      ['Collectivit&eacute;s', 'Sessions de planification avec communes et services techniques.'],
    ],
    steps: [
      ['Objectif', 'D&eacute;finir le risque cibl&eacute; et le public prioritaire.'],
      ['Mobilisation', 'Confirmer lieu, partenaires, ressources et support de communication.'],
      ['Ex&eacute;cution', 'Collecter pr&eacute;sences, constats et demandes de suivi.'],
      ['Bilan', 'Publier chiffres, photos, enseignements et prochaine phase.'],
    ],
    checklist: [
      'Date, heure, lieu et public vis&eacute;.',
      'Responsable PROQUELEC et partenaire local.',
      'Objectif mesurable avant lancement.',
      'Bilan post-campagne avec actions de suivi.',
    ],
    result:
      'La page devient un outil d&apos;organisation et de redevabilit&eacute; publique.',
  },
  {
    slug: 'expertises',
    badge: 'Contr&ocirc;le technique',
    title: 'Expertises',
    subtitle: 'Transformer les exigences en contr&ocirc;les concrets',
    intro:
      'Une pr&eacute;sentation des domaines d&apos;intervention PROQUELEC, orient&eacute;e preuves, m&eacute;thodes et livrables.',
    primary: ['Demander une expertise', '/contact'],
    secondary: ['Voir les normes', '/normes'],
    metrics: [
      ['BT', 'Basse tension'],
      ['ERP', 'Recevant du public'],
      ['PV', 'Mesures'],
      ['Rapport', 'R&eacute;serves'],
    ],
    sectionTitle: 'Des expertises lisibles par les d&eacute;cideurs',
    sectionIntro:
      'Chaque prestation doit indiquer ce qui est contr&ocirc;l&eacute;, comment, avec quel livrable et quelles suites possibles.',
    cards: [
      ['Audit de conformit&eacute;', 'Analyse d&apos;installations neuves ou existantes selon les exigences applicables.'],
      ['Diagnostic s&eacute;curit&eacute;', 'Rep&eacute;rage des risques prioritaires pour personnes, biens et continuit&eacute; de service.'],
      ['Assistance technique', 'Appui aux ma&icirc;tres d&apos;ouvrage, bureaux d&apos;&eacute;tudes et collectivit&eacute;s.'],
      ['R&eacute;ception', 'Contr&ocirc;le documentaire, mesures et avis avant exploitation.'],
    ],
    steps: [
      ['Cadrage', 'Pr&eacute;ciser site, p&eacute;rim&egrave;tre, contraintes et documents disponibles.'],
      ['Inspection', 'Contr&ocirc;ler visuellement et mesurer les points critiques.'],
      ['Rapport', 'Classer les anomalies par niveau de criticit&eacute;.'],
      ['Suivi', 'Valider la lev&eacute;e des r&eacute;serves si demand&eacute;.'],
    ],
    checklist: [
      'Plans et sch&eacute;mas disponibles.',
      'Historique des incidents ou travaux.',
      'Acc&egrave;s aux locaux techniques.',
      'Interlocuteur habilit&eacute; pendant la visite.',
    ],
    result:
      'La page donne confiance parce qu&apos;elle explique le livrable et la m&eacute;thode.',
  },
  {
    slug: 'faq',
    badge: 'Centre d&apos;aide',
    title: 'Questions fr&eacute;quentes',
    subtitle: 'R&eacute;pondre vite sans noyer le visiteur',
    intro:
      'Une FAQ structur&eacute;e par parcours : m&eacute;nages, professionnels, certifications, normes, formations et contact.',
    primary: ['Poser une question', '/contact'],
    secondary: ['Voir les normes', '/normes'],
    metrics: [
      ['6', 'Rubriques'],
      ['48h', 'Question complexe'],
      ['SN 01-015', 'R&eacute;f&eacute;rence'],
      ['CTA', 'Orientation'],
    ],
    sectionTitle: 'Des r&eacute;ponses courtes et actionnables',
    sectionIntro:
      'Une bonne FAQ ne remplace pas le support : elle aide le lecteur &agrave; savoir quoi faire ensuite.',
    cards: [
      ['Contr&ocirc;le logement', 'Quand demander un diagnostic et quels documents pr&eacute;parer.'],
      ['Normes', 'Diff&eacute;rence entre recommandation, obligation et contr&ocirc;le.'],
      ['Certification', 'Conditions d&apos;&eacute;ligibilit&eacute;, validit&eacute;, audit et renouvellement.'],
      ['Formation', 'Choix du module, dur&eacute;e, public et modalit&eacute;s d&apos;inscription.'],
    ],
    steps: [
      ['Question', 'Formuler en une ligne depuis le point de vue utilisateur.'],
      ['R&eacute;ponse', 'Limiter la r&eacute;ponse &agrave; l&apos;essentiel utile.'],
      ['Action', 'Ajouter le lien ou le document &agrave; pr&eacute;parer.'],
      ['Escalade', 'Indiquer quand contacter PROQUELEC.'],
    ],
    checklist: [
      'Une rubrique par audience.',
      'Pas de jargon sans explication.',
      'Lien vers contact pour les cas particuliers.',
      'Mise &agrave; jour apr&egrave;s chaque campagne ou nouvelle proc&eacute;dure.',
    ],
    result:
      'La FAQ r&eacute;duit les demandes r&eacute;p&eacute;titives et am&eacute;liore la qualit&eacute; des dossiers entrants.',
  },
  {
    slug: 'formation-certification',
    badge: 'Acad&eacute;mie',
    title: 'Formation &amp; certification',
    subtitle: 'Former, &eacute;valuer et qualifier les comp&eacute;tences',
    intro:
      'Une page pour pr&eacute;senter les modules, pr&eacute;requis, publics, modalit&eacute;s et passerelles vers les labels ou habilitations.',
    primary: ['Demander une session', '/contact'],
    secondary: ['Voir les trainings', '/trainings'],
    metrics: [
      ['BT / HTA', 'Parcours'],
      ['2 &agrave; 5 j', 'Dur&eacute;es'],
      ['QCM', '&Eacute;valuation'],
      ['Attestation', 'Livrable'],
    ],
    sectionTitle: 'Des formations reli&eacute;es aux besoins terrain',
    sectionIntro:
      'Le visiteur doit choisir rapidement le bon module selon son m&eacute;tier, son niveau et ses responsabilit&eacute;s.',
    cards: [
      ['Habilitation', 'B0, H0, B1, B2, BR, BC, HE, HC selon missions et environnement.'],
      ['Conformit&eacute;', 'Lecture des normes, contr&ocirc;les, mesures et constitution du dossier technique.'],
      ['S&eacute;curit&eacute; chantier', 'EPI, consignation, risques d&apos;&eacute;lectrisation et organisation de travaux.'],
      ['Modules sp&eacute;cifiques', 'Compteurs, solaire, mise &agrave; la terre, tableaux et raccordements.'],
    ],
    steps: [
      ['Analyse du besoin', 'Identifier public, missions et niveau initial.'],
      ['Choix du module', 'Associer objectifs, dur&eacute;e et pr&eacute;requis.'],
      ['Session', 'Former avec cas pratiques et supports techniques.'],
      ['&Eacute;valuation', 'Mesurer les acquis et d&eacute;livrer l&apos;attestation.'],
    ],
    checklist: [
      'Nombre de participants et profils.',
      'Site de formation souhait&eacute;.',
      'Habilitations vis&eacute;es.',
      'Contraintes de calendrier et besoins mat&eacute;riels.',
    ],
    result:
      'La page devient un configurateur simple de demande de formation.',
  },
  {
    slug: 'ged-publications',
    badge: 'Documentation',
    title: 'GED &amp; publications',
    subtitle: 'Centraliser les documents utiles',
    intro:
      'Une biblioth&egrave;que publique et professionnelle pour guides, rapports, fiches pratiques, normes comment&eacute;es et supports de campagne.',
    primary: ['Demander un document', '/contact'],
    secondary: ['Voir les normes', '/normes'],
    metrics: [
      ['PDF', 'Formats'],
      ['Tags', 'Classement'],
      ['Version', 'Suivi'],
      ['Acc&egrave;s', 'Public ou pro'],
    ],
    sectionTitle: 'Une GED utile est class&eacute;e et dat&eacute;e',
    sectionIntro:
      'Chaque document doit afficher son statut, sa cible, sa version et l&apos;usage attendu.',
    cards: [
      ['Guides pratiques', 'Fiches de pr&eacute;vention et checklists pour m&eacute;nages, professionnels et collectivit&eacute;s.'],
      ['Rapports', 'Bilans de campagnes, synth&egrave;ses d&apos;observatoire et notes d&apos;orientation.'],
      ['Supports formation', 'Plans de cours, pr&eacute;requis, exercices et r&eacute;sum&eacute;s de modules.'],
      ['Documents normatifs', 'R&eacute;f&eacute;rences, extraits comment&eacute;s et liens vers les textes applicables.'],
    ],
    steps: [
      ['Classer', 'D&eacute;finir public, th&egrave;me, format et niveau d&apos;acc&egrave;s.'],
      ['Versionner', 'Ajouter date, auteur et statut de validation.'],
      ['Publier', 'Rendre le document trouvable via filtres et recherche.'],
      ['Retirer', 'Archiver les documents obsol&egrave;tes sans les perdre.'],
    ],
    checklist: [
      'Titre compr&eacute;hensible sans acronyme inutile.',
      'Date de publication et version.',
      'Public cible et contexte d&apos;usage.',
      'Lien de t&eacute;l&eacute;chargement ou demande d&apos;acc&egrave;s.',
    ],
    result:
      'La GED renforce la confiance parce que les documents sont tra&ccedil;ables et faciles &agrave; retrouver.',
  },
  {
    slug: 'labels',
    badge: 'Reconnaissance',
    title: 'Labels PROQUELEC',
    subtitle: 'Valoriser les acteurs fiables',
    intro:
      'Une page pour expliquer les labels, les crit&egrave;res d&apos;attribution, les contr&ocirc;les et les avantages pour les clients.',
    primary: ['Candidater au label', '/contact'],
    secondary: ['Voir certifications', '/certifications'],
    metrics: [
      ['Charte', 'Engagement'],
      ['Audit', 'V&eacute;rification'],
      ['Registre', 'Publication'],
      ['Suivi', 'Renouvellement'],
    ],
    sectionTitle: 'Un label doit &ecirc;tre v&eacute;rifiable',
    sectionIntro:
      'La valeur du label vient de crit&egrave;res clairs, d&apos;un contr&ocirc;le r&eacute;el et d&apos;une information publique compr&eacute;hensible.',
    cards: [
      ['&Eacute;lectricien confiance', 'Reconna&icirc;tre les artisans respectant les r&egrave;gles de s&eacute;curit&eacute; et de documentation.'],
      ['Entreprise conforme', 'Valoriser les organisations capables de produire des dossiers techniques solides.'],
      ['Mat&eacute;riel recommand&eacute;', 'Identifier les produits et &eacute;quipements compatibles avec les exigences de s&eacute;curit&eacute;.'],
      ['Partenaire technique', 'Qualifier les organismes contribuant aux campagnes, formations ou contr&ocirc;les.'],
    ],
    steps: [
      ['Candidature', 'D&eacute;poser les pi&egrave;ces et signer la charte.'],
      ['V&eacute;rification', 'Contr&ocirc;ler comp&eacute;tences, r&eacute;f&eacute;rences et pratiques.'],
      ['Attribution', 'Publier le statut et les conditions d&apos;usage du label.'],
      ['Surveillance', 'Suivre les r&eacute;clamations et renouvellements.'],
    ],
    checklist: [
      'Charte sign&eacute;e.',
      'R&eacute;f&eacute;rences techniques v&eacute;rifiables.',
      'Assurance et documents administratifs.',
      'Engagement de mise &agrave; jour annuelle.',
    ],
    result:
      'La page donne au public les moyens de comprendre et v&eacute;rifier un label.',
  },
  {
    slug: 'legal',
    badge: 'Cadre officiel',
    title: 'Mentions l&eacute;gales',
    subtitle: 'Informations d&apos;&eacute;dition et responsabilit&eacute;s',
    intro:
      'Une page l&eacute;gale claire, lisible et tenue &agrave; jour pour prot&eacute;ger l&apos;association, les usagers et les contributeurs du site.',
    primary: ['Contacter PROQUELEC', 'mailto:proquelec@proquelec.sn'],
    secondary: ['Retour accueil', '/'],
    metrics: [
      ['Loi 68-08', 'Statut'],
      ['0191403 089', 'NINEA'],
      ['32 037', 'BP Dakar'],
      ['+221 33 848 68 55', 'T&eacute;l&eacute;phone'],
    ],
    sectionTitle: 'Informations &agrave; maintenir &agrave; jour',
    sectionIntro:
      'La page l&eacute;gale ne doit pas &ecirc;tre d&eacute;corative : elle contient les preuves administratives et les r&egrave;gles d&apos;usage du site.',
    cards: [
      ['&Eacute;diteur', 'PROQUELEC, Promotion de la Qualit&eacute; et de la S&eacute;curit&eacute; des Installations &Eacute;lectriques au S&eacute;n&eacute;gal.'],
      ['Si&egrave;ge', 'Immeuble Coumba Castel, 12 rue Saint-Michel, 4e &eacute;tage, Dakar.'],
      ['Contact', 'proquelec@proquelec.sn et +221 33 848 68 55.'],
      ['Responsabilit&eacute;', 'Les contenus guident les usagers mais ne remplacent pas un contr&ocirc;le technique qualifi&eacute;.'],
    ],
    steps: [
      ['Identifier', 'Afficher clairement l&apos;&eacute;diteur et les coordonn&eacute;es.'],
      ['Encadrer', 'Pr&eacute;ciser droits d&apos;auteur, donn&eacute;es et limites d&apos;usage.'],
      ['Mettre &agrave; jour', 'Contr&ocirc;ler les informations apr&egrave;s chaque changement administratif.'],
      ['Tracer', 'Conserver date de derni&egrave;re modification et version.'],
    ],
    checklist: [
      'Statut juridique et loi applicable.',
      'NINEA, BP, adresse, email et t&eacute;l&eacute;phone.',
      'R&egrave;gles de propri&eacute;t&eacute; intellectuelle.',
      'Politique de donn&eacute;es et cookies si activ&eacute;s.',
    ],
    result:
      'La page l&eacute;gale devient claire, compacte et exploitable.',
  },
  {
    slug: 'normes',
    badge: 'R&eacute;f&eacute;rentiels',
    title: 'Normes &amp; ressources',
    subtitle: 'Comprendre ce qui est obligatoire et v&eacute;rifiable',
    intro:
      'Une page pour orienter vers les r&eacute;f&eacute;rentiels applicables, les notes explicatives et les points de contr&ocirc;le prioritaires.',
    primary: ['Demander une clarification', '/contact'],
    secondary: ['Voir la FAQ', '/faq'],
    metrics: [
      ['SN 01-015', 'Installation BT'],
      ['NS 01-001', 'R&eacute;f&eacute;rence'],
      ['Guides', 'Lecture terrain'],
      ['Contr&ocirc;le', 'Application'],
    ],
    sectionTitle: 'Rendre la norme exploitable',
    sectionIntro:
      'Le visiteur doit comprendre le statut du texte, son champ d&apos;application et les preuves attendues lors d&apos;un contr&ocirc;le.',
    cards: [
      ['Champ d&apos;application', 'B&acirc;timents neufs, r&eacute;novations, ERP, sites professionnels et installations sensibles.'],
      ['Points critiques', 'Protection diff&eacute;rentielle, mise &agrave; la terre, sections, tableaux et continuit&eacute;.'],
      ['Documents', 'Sch&eacute;mas, notes de calcul, PV de mesure et fiches de r&eacute;ception.'],
      ['Mises &agrave; jour', 'Suivi des &eacute;volutions et alertes lorsque les pratiques changent.'],
    ],
    steps: [
      ['Identifier le site', 'Type de b&acirc;timent, usage et niveau de risque.'],
      ['Relier la norme', 'D&eacute;terminer les textes et exigences applicables.'],
      ['V&eacute;rifier', 'Contr&ocirc;ler les points mesurables et la documentation.'],
      ['Documenter', 'Archiver les preuves et r&eacute;serves.'],
    ],
    checklist: [
      'Ne pas publier de texte normatif sans droits.',
      'Pr&eacute;ciser la date et le statut de chaque ressource.',
      'Relier norme, point de contr&ocirc;le et preuve attendue.',
      'Inclure une voie de contact pour les cas sp&eacute;cifiques.',
    ],
    result:
      'La page rend la norme compr&eacute;hensible sans la simplifier abusivement.',
  },
  {
    slug: 'observatoire',
    badge: 'Donn&eacute;es publiques',
    title: 'Observatoire',
    subtitle: 'Suivre les risques et la conformit&eacute;',
    intro:
      'Un tableau de bord institutionnel pour visualiser les indicateurs, prioriser les zones &agrave; risque et publier des bilans compr&eacute;hensibles.',
    primary: ['Demander un bilan', '/contact'],
    secondary: ['Espace autorit&eacute;s', '/espace-autorites'],
    metrics: [
      ['Cartes', 'Territoires'],
      ['Risques', 'Criticit&eacute;'],
      ['Campagnes', 'Suivi'],
      ['Rapports', 'Publication'],
    ],
    sectionTitle: 'Des indicateurs orient&eacute;s d&eacute;cision',
    sectionIntro:
      'L&apos;observatoire doit afficher des chiffres utiles et expliquer comment ils sont collect&eacute;s, interpr&eacute;t&eacute;s et mis &agrave; jour.',
    cards: [
      ['Conformit&eacute;', 'Taux de dossiers conformes, r&eacute;serves fr&eacute;quentes et typologies de sites.'],
      ['Accidents et incidents', 'Signalements, zones sensibles et facteurs r&eacute;currents de risque.'],
      ['Formations', 'R&eacute;partition des professionnels form&eacute;s par r&eacute;gion et par module.'],
      ['Campagnes', 'Nombre de sites visit&eacute;s, personnes sensibilis&eacute;es et corrections engag&eacute;es.'],
    ],
    steps: [
      ['Collecter', 'Centraliser donn&eacute;es de contr&ocirc;le, campagnes et formations.'],
      ['Qualifier', 'Nettoyer, classer et v&eacute;rifier la coh&eacute;rence.'],
      ['Analyser', 'Identifier tendances, priorit&eacute;s et signaux faibles.'],
      ['Publier', 'Partager des tableaux lisibles et responsables.'],
    ],
    checklist: [
      'Source et date de chaque indicateur.',
      'D&eacute;finition simple des termes techniques.',
      'Visualisation par territoire et type de site.',
      'M&eacute;thode de mise &agrave; jour document&eacute;e.',
    ],
    result:
      'L&apos;observatoire devient une base de pilotage, pas seulement une page de chiffres.',
  },
  {
    slug: 'outils-metier',
    badge: 'Bo&icirc;te &agrave; outils',
    title: 'Outils m&eacute;tier',
    subtitle: 'Calculer, v&eacute;rifier et documenter',
    intro:
      'Une page pour regrouper les calculateurs, checklists, mod&egrave;les de documents et assistants de pr&eacute;paration de dossier.',
    primary: ['Demander un outil', '/contact'],
    secondary: ['Espace professionnels', '/espace-professionnels'],
    metrics: [
      ['Calcul', 'Dimensionnement'],
      ['Checklist', 'Contr&ocirc;le'],
      ['Export', 'PDF'],
      ['IA', 'Assistance'],
    ],
    sectionTitle: 'Des outils utiles avant le contr&ocirc;le',
    sectionIntro:
      'Chaque outil doit produire une aide concr&egrave;te : calcul, liste de r&eacute;serves, document ou orientation.',
    cards: [
      ['Chute de tension', 'V&eacute;rifier sections, longueur, courant et limites acceptables.'],
      ['Prise de terre', 'Centraliser mesures, contexte et actions correctives.'],
      ['Dossier de r&eacute;ception', 'Assembler sch&eacute;mas, PV, photos et attestations.'],
      ['Assistant de conformit&eacute;', 'Aider &agrave; pr&eacute;parer les points de contr&ocirc;le selon le type de site.'],
    ],
    steps: [
      ['Choisir', 'S&eacute;lectionner l&apos;outil selon le probl&egrave;me.'],
      ['Saisir', 'Entrer des donn&eacute;es contr&ocirc;lables et document&eacute;es.'],
      ['V&eacute;rifier', 'Comparer le r&eacute;sultat avec les exigences.'],
      ['Exporter', 'Conserver une trace dans le dossier technique.'],
    ],
    checklist: [
      'Hypoth&egrave;ses visibles et modifiables.',
      'R&eacute;sultat compr&eacute;hensible avec niveau d&apos;alerte.',
      'Export ou copie dans le dossier.',
      'Avertissement lorsque les donn&eacute;es sont insuffisantes.',
    ],
    result:
      'La page devient un atelier num&eacute;rique pour pr&eacute;parer des dossiers plus fiables.',
  },
  {
    slug: 'partenaires',
    badge: 'Ecosyst&egrave;me',
    title: 'Partenaires',
    subtitle: 'Construire des actions communes mesurables',
    intro:
      'Une page pour pr&eacute;senter les types de partenaires, les formes de collaboration et les livrables attendus.',
    primary: ['Devenir partenaire', '/contact'],
    secondary: ['Voir les campagnes', '/evenements-campagnes'],
    metrics: [
      ['Public', 'Institutions'],
      ['Priv&eacute;', 'Entreprises'],
      ['Formation', 'Ecoles'],
      ['Terrain', 'Campagnes'],
    ],
    sectionTitle: 'Un partenariat doit produire un impact',
    sectionIntro:
      'La page doit &eacute;viter les logos sans contexte et expliquer ce que chaque collaboration permet de r&eacute;aliser.',
    cards: [
      ['Institutions', 'Programmes de pr&eacute;vention, appui r&eacute;glementaire et campagnes territoriales.'],
      ['Entreprises', 'M&eacute;c&eacute;nat technique, formation, &eacute;quipements et projets pilotes.'],
      ['Ecoles', 'Ateliers, supports p&eacute;dagogiques, visites et orientation m&eacute;tier.'],
      ['M&eacute;dias', 'Diffusion de messages de pr&eacute;vention et couverture des campagnes.'],
    ],
    steps: [
      ['Intention', 'D&eacute;finir objectif, public et zone d&apos;impact.'],
      ['Cadrage', 'Fixer r&ocirc;les, calendrier, budget et livrables.'],
      ['Action', 'Mettre en oeuvre avec indicateurs et preuves terrain.'],
      ['Bilan', 'Mesurer les r&eacute;sultats et d&eacute;cider de la suite.'],
    ],
    checklist: [
      'Objectif commun clairement formul&eacute;.',
      'Ressources apport&eacute;es par chaque partie.',
      'Indicateurs d&apos;impact avant lancement.',
      'Contact responsable c&ocirc;t&eacute; partenaire.',
    ],
    result:
      'La page donne envie de collaborer parce qu&apos;elle montre une logique de projet.',
  },
  {
    slug: 'presse',
    badge: 'Relations m&eacute;dias',
    title: 'Presse',
    subtitle: 'Donner aux journalistes des informations fiables',
    intro:
      'Un espace presse utile contient les communiqu&eacute;s, contacts, chiffres cl&eacute;s, visuels autoris&eacute;s et angles de sujets.',
    primary: ['Contact presse', '/contact'],
    secondary: ['Voir actualit&eacute;s', '/actualites'],
    metrics: [
      ['CP', 'Communiqu&eacute;s'],
      ['Kit', 'M&eacute;dia'],
      ['Chiffres', 'Cl&eacute;s'],
      ['48h', 'R&eacute;ponse'],
    ],
    sectionTitle: 'Un kit presse pr&ecirc;t &agrave; l&apos;emploi',
    sectionIntro:
      'Le journaliste doit trouver rapidement une information exacte, un contact et les visuels utilisables.',
    cards: [
      ['Communiqu&eacute;s', 'Annonces officielles avec date, contexte, citations et contacts.'],
      ['Chiffres cl&eacute;s', 'Donn&eacute;es v&eacute;rifi&eacute;es sur contr&ocirc;les, formations, campagnes et risques.'],
      ['Dossier th&eacute;matique', 'Angles de reportage : march&eacute;s, logements, &eacute;coles, solaire, formation.'],
      ['Ressources visuelles', 'Logo, photos autoris&eacute;es, l&eacute;gendes et droits d&apos;usage.'],
    ],
    steps: [
      ['Recevoir', 'Identifier la demande et son d&eacute;lai.'],
      ['Qualifier', 'Valider sujet, format et interlocuteur.'],
      ['R&eacute;pondre', 'Transmettre chiffres, citation ou rendez-vous.'],
      ['Archiver', 'Conserver l&apos;historique des sollicitations m&eacute;dias.'],
    ],
    checklist: [
      'Contact presse officiel.',
      'Dernier communiqu&eacute; visible.',
      'Logo et mentions d&apos;usage.',
      'Chiffres dat&eacute;s et sourc&eacute;s.',
    ],
    result:
      'La page presse renforce la cr&eacute;dibilit&eacute; et r&eacute;duit les risques d&apos;information impr&eacute;cise.',
  },
  {
    slug: 'projets-realisations',
    badge: 'R&eacute;f&eacute;rences',
    title: 'Projets &amp; r&eacute;alisations',
    subtitle: 'Montrer les interventions avec contexte et r&eacute;sultat',
    intro:
      'Une page de r&eacute;f&eacute;rences doit expliquer le probl&egrave;me initial, le p&eacute;rim&egrave;tre contr&ocirc;l&eacute;, les r&eacute;serves et le r&eacute;sultat obtenu.',
    primary: ['Soumettre un projet', '/contact'],
    secondary: ['Voir expertises', '/expertises'],
    metrics: [
      ['ERP', 'Sites publics'],
      ['Industrie', 'Process'],
      ['Habitat', 'Logements'],
      ['Rapport', 'Livrables'],
    ],
    sectionTitle: 'Des r&eacute;alisations lisibles et utiles',
    sectionIntro:
      'Le visiteur ne cherche pas seulement de belles images : il veut comprendre la valeur technique de l&apos;intervention.',
    cards: [
      ['B&acirc;timents publics', 'Contr&ocirc;le de tableaux, circuits, secours, mise &agrave; la terre et continuit&eacute;.'],
      ['Logements', 'Diagnostics de conformit&eacute;, lev&eacute;e de r&eacute;serves et pr&eacute;vention des risques domestiques.'],
      ['Industrie', 'Analyse de protections, puissances, continuit&eacute; d&apos;exploitation et s&eacute;curit&eacute; des personnes.'],
      ['Campagnes', 'Op&eacute;rations collectives de diagnostic et sensibilisation avec indicateurs.'],
    ],
    steps: [
      ['Contexte', 'Pr&eacute;senter site, enjeu et contraintes.'],
      ['Mission', 'D&eacute;crire le p&eacute;rim&egrave;tre PROQUELEC.'],
      ['R&eacute;sultat', 'Afficher livrables, r&eacute;serves et suites.'],
      ['Impact', 'Montrer le gain s&eacute;curit&eacute; ou op&eacute;rationnel.'],
    ],
    checklist: [
      'Nom du projet ou anonymisation claire.',
      'Ann&eacute;e, lieu et type de site.',
      'Mission r&eacute;alis&eacute;e et livrables.',
      'Photos ou preuves autoris&eacute;es.',
    ],
    result:
      'La page transforme les r&eacute;alisations en preuves de comp&eacute;tence.',
  },
  {
    slug: 'showroom',
    badge: 'D&eacute;monstration',
    title: 'Showroom',
    subtitle: 'Voir la conformit&eacute; en situation',
    intro:
      'Un espace pour pr&eacute;senter des maquettes, cas d&apos;usage, bonnes pratiques et visites p&eacute;dagogiques autour de la s&eacute;curit&eacute; &eacute;lectrique.',
    primary: ['R&eacute;server une visite', '/contact'],
    secondary: ['Voir outils', '/outils-metier'],
    metrics: [
      ['Maquettes', 'D&eacute;mos'],
      ['Habitat', 'Cas pratique'],
      ['Industrie', 'Armoires'],
      ['Solaire', 'Raccordement'],
    ],
    sectionTitle: 'Un showroom orient&eacute; apprentissage',
    sectionIntro:
      'Le visiteur doit repartir avec des rep&egrave;res : ce qui est conforme, ce qui est dangereux et comment le v&eacute;rifier.',
    cards: [
      ['Habitat t&eacute;moin', 'Tableau, diff&eacute;rentiel, terre, circuits humides et protections domestiques.'],
      ['Tertiaire', 'Armoires, s&eacute;lectivit&eacute;, secours, signalisation et maintenance.'],
      ['Solaire', 'Coffrets DC/AC, parafoudre, onduleur, sectionnement et mise &agrave; la terre.'],
      ['Mesures', 'D&eacute;monstrations de tellurom&egrave;tre, contr&ocirc;le continuit&eacute; et tests diff&eacute;rentiels.'],
    ],
    steps: [
      ['Choisir un parcours', 'M&eacute;nage, &eacute;tudiant, professionnel ou collectivit&eacute;.'],
      ['Observer', 'Comparer installation conforme et non conforme.'],
      ['Manipuler', 'Comprendre les mesures et les protections.'],
      ['Appliquer', 'Repartir avec une checklist adapt&eacute;e.'],
    ],
    checklist: [
      'Objectif de visite.',
      'Nombre de participants.',
      'Niveau technique du groupe.',
      'Th&egrave;mes prioritaires &agrave; traiter.',
    ],
    result:
      'Le showroom devient un outil p&eacute;dagogique et commercial &agrave; forte valeur.',
  },
  {
    slug: 'trainings',
    badge: 'Catalogue avanc&eacute;',
    title: 'Trainings',
    subtitle: 'Des parcours structur&eacute;s pour les comp&eacute;tences &eacute;lectriques',
    intro:
      'Une page catalogue pour pr&eacute;senter les packs, dur&eacute;es, objectifs p&eacute;dagogiques, options sur site et contacts de formation.',
    primary: ['Planifier une session', '/contact'],
    secondary: ['Certification', '/certifications'],
    metrics: [
      ['10 000+', 'Artisans form&eacute;s'],
      ['7', 'Modules m&eacute;tiers'],
      ['BT / HTA', 'Packs'],
      ['2-5 j', 'Dur&eacute;es'],
    ],
    sectionTitle: 'Un catalogue lisible par les responsables formation',
    sectionIntro:
      'Les packs doivent indiquer public, pr&eacute;requis, objectifs, dur&eacute;e, livrables et modalit&eacute;s.',
    cards: [
      ['Pack B0/H0', 'Sensibilisation et man&oelig;uvres simples pour personnes expos&eacute;es sans intervention technique.'],
      ['Pack B1/B2/BR/BC', 'Travaux, interventions, consignation et responsabilit&eacute;s en basse tension.'],
      ['Pack mesures', 'V&eacute;rification, mesurage, PV et interpr&eacute;tation des r&eacute;sultats.'],
      ['Pack HTA', 'R&egrave;gles de s&eacute;curit&eacute; pour postes, consignations et interventions HTA.'],
    ],
    steps: [
      ['Cadrage', 'Analyser les postes et risques r&eacute;els des participants.'],
      ['Programme', 'Choisir pack, dur&eacute;e et modalit&eacute; p&eacute;dagogique.'],
      ['Animation', 'Former avec cas pratiques et supports terrain.'],
      ['Attestation', 'Evaluer et documenter les acquis.'],
    ],
    checklist: [
      'Liste nominative des participants.',
      'Fonctions et habilitations souhait&eacute;es.',
      'Lieu : PROQUELEC ou site client.',
      'Contraintes de s&eacute;curit&eacute; et mat&eacute;riel disponible.',
    ],
    result:
      'La page permet de construire une demande de formation compl&egrave;te sans appel pr&eacute;alable.',
  },
  {
    slug: 'utilite-publique',
    badge: 'Int&eacute;r&ecirc;t g&eacute;n&eacute;ral',
    title: 'Utilit&eacute; publique',
    subtitle: 'Agir pour les usagers et les territoires',
    intro:
      'Une page qui pr&eacute;sente les actions non lucratives, les campagnes de s&eacute;curit&eacute; et l&apos;appui aux populations ou sites vuln&eacute;rables.',
    primary: ['Proposer une action', '/contact'],
    secondary: ['Voir partenaires', '/partenaires'],
    metrics: [
      ['M&eacute;nages', 'Appui'],
      ['March&eacute;s', 'Pr&eacute;vention'],
      ['Collectivit&eacute;s', 'Conseil'],
      ['Guides', 'Sensibilisation'],
    ],
    sectionTitle: 'Rendre visible l&apos;impact social',
    sectionIntro:
      'L&apos;utilit&eacute; publique doit &ecirc;tre prouv&eacute;e par des actions concr&egrave;tes, des publics cibl&eacute;s et des r&eacute;sultats suivis.',
    cards: [
      ['M&eacute;nages vuln&eacute;rables', 'Diagnostics, conseils et orientation vers corrections prioritaires.'],
      ['March&eacute;s traditionnels', 'Pr&eacute;vention incendie, contr&ocirc;le des branchements et sensibilisation des commer&ccedil;ants.'],
      ['Collectivit&eacute;s', 'Appui &agrave; la planification des travaux et &agrave; la r&eacute;ception technique.'],
      ['Guides gratuits', 'Documents simples pour pr&eacute;venir les risques domestiques et professionnels.'],
    ],
    steps: [
      ['Identifier le besoin', 'Rep&eacute;rer population, site ou risque prioritaire.'],
      ['Mobiliser', 'Associer partenaire local, ressources et calendrier.'],
      ['Intervenir', 'R&eacute;aliser diagnostic, sensibilisation ou appui technique.'],
      ['Mesurer', 'Publier impact, suites et recommandations.'],
    ],
    checklist: [
      'Public cible et justification du besoin.',
      'Partenaire local ou institution de relais.',
      'Objectif mesurable et calendrier.',
      'Bilan publiable avec recommandations.',
    ],
    result:
      'La page montre que PROQUELEC agit comme tiers de confiance au service de la s&eacute;curit&eacute; collective.',
  },
];

function svgIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z"/><path d="M9 12l2 2 4-5"/></svg>';
}

function renderMetrics(metrics) {
  return metrics
    .map(
      ([value, label]) => `
        <div class="pq-stat">
          <p class="pq-stat-value">${value}</p>
          <p class="pq-stat-label">${label}</p>
        </div>`,
    )
    .join('');
}

function renderCards(cards) {
  return cards
    .map(
      ([title, text]) => `
        <article class="pq-card pq-card-feature">
          <div class="pq-icon">
            ${svgIcon()}
          </div>
          <h3 class="pq-card-title">${title}</h3>
          <p class="pq-card-text">${text}</p>
        </article>`,
    )
    .join('');
}

function renderSteps(steps) {
  return steps
    .map(
      ([title, text], index) => `
        <li class="pq-step">
          <div class="pq-step-number">${index + 1}</div>
          <h3 class="pq-step-title">${title}</h3>
          <p class="pq-step-text">${text}</p>
        </li>`,
    )
    .join('');
}

function renderChecklist(items) {
  return items
    .map(
      (item) => `
        <li class="pq-check-item">
          <span class="pq-check-icon">&check;</span>
          <span>${item}</span>
        </li>`,
    )
    .join('');
}

function renderPage(page) {
  return `<div class="pq-model">
  <section class="pq-hero">
    <div class="pq-layout-container pq-hero-inner">
      <div class="pq-brand">
        <img src="/logo-proquelec.svg" alt="PROQUELEC" class="pq-logo" />
        <div>
          <p class="pq-eyebrow">${page.badge}</p>
          <p class="pq-brand-note">Promotion de la qualit&eacute; et de la s&eacute;curit&eacute; des installations &eacute;lectriques</p>
        </div>
      </div>

      <div class="pq-hero-copy">
        <h1 class="pq-title">${page.title}</h1>
        <p class="pq-subtitle">${page.subtitle}</p>
        <p class="pq-lead">${page.intro}</p>
      </div>

      <div class="pq-actions">
        <a href="${page.primary[1]}" class="pq-button pq-button-primary">${page.primary[0]}</a>
        <a href="${page.secondary[1]}" class="pq-button pq-button-secondary">${page.secondary[0]}</a>
      </div>

      <div class="pq-stats">
        ${renderMetrics(page.metrics)}
      </div>
    </div>
  </section>

  <section class="pq-section">
    <div class="pq-layout-container pq-section-grid">
      <div>
        <p class="pq-section-kicker">Contenu m&eacute;tier</p>
        <h2 class="pq-section-title">${page.sectionTitle}</h2>
        <p class="pq-section-text">${page.sectionIntro}</p>
      </div>
      <div class="pq-grid-2">
        ${renderCards(page.cards)}
      </div>
    </div>
  </section>

  <section class="pq-section pq-section-muted">
    <div class="pq-layout-container">
      <div class="pq-section-header">
        <p class="pq-section-kicker">Workflow recommand&eacute;</p>
        <h2 class="pq-section-title">Parcours op&eacute;rationnel</h2>
        <p class="pq-section-text">Ces &eacute;tapes donnent au visiteur une logique claire et limitent les demandes incompl&egrave;tes.</p>
      </div>
      <ol class="pq-steps">
        ${renderSteps(page.steps)}
      </ol>
    </div>
  </section>

  <section class="pq-section">
    <div class="pq-layout-container pq-grid-2">
      <div class="pq-panel">
        <h2 class="pq-panel-title">Points &agrave; pr&eacute;parer</h2>
        <ul class="pq-checklist">
          ${renderChecklist(page.checklist)}
        </ul>
      </div>
      <div class="pq-result">
        <p class="pq-result-kicker">R&eacute;sultat attendu</p>
        <h2 class="pq-result-title">Une page plus robuste et plus utile</h2>
        <p class="pq-result-text">${page.result}</p>
        <p class="pq-result-note">Ce mod&egrave;le est pens&eacute; pour &ecirc;tre coll&eacute; dans le builder, rester lisible sur mobile et conserver une hi&eacute;rarchie claire apr&egrave;s publication.</p>
      </div>
    </div>
  </section>
</div>
`;
}

function decodeHtmlLabel(value) {
  return value
    .replace(/&Agrave;/g, 'À')
    .replace(/&Eacute;/g, 'É')
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&ecirc;/g, 'ê')
    .replace(/&agrave;/g, 'à')
    .replace(/&ccedil;/g, 'ç')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&icirc;/g, 'î')
    .replace(/&ucirc;/g, 'û')
    .replace(/&amp;/g, '&')
    .replace(/&apos;/g, "'")
    .replace(/&deg;/g, '°');
}

function resolveCategory(slug) {
  if (['accueil', 'contact', 'faq', 'legal'].includes(slug)) return 'Pages';
  if (['actualites', 'blog', 'evenements-campagnes', 'presse'].includes(slug)) return 'Communication';
  if (['certifications', 'formation-certification', 'labels', 'trainings'].includes(slug)) return 'Formation et labels';
  if (slug.startsWith('espace-')) return 'Espaces';
  if (['expertises', 'ged-publications', 'normes', 'observatoire', 'outils-metier'].includes(slug)) return 'Ressources métier';
  return 'Institution';
}

function renderRegistry() {
  const templates = pages.map((page) => ({
    id: page.slug,
    name: decodeHtmlLabel(page.title),
    category: resolveCategory(page.slug),
    description: decodeHtmlLabel(page.subtitle),
    preview: `/previews/pq-${page.slug}.webp`,
    html: renderPage(page),
  }));

  return `export type PqTemplateCategory =
  | 'Pages'
  | 'Communication'
  | 'Formation et labels'
  | 'Espaces'
  | 'Ressources métier'
  | 'Institution';

export type PqTemplate = {
  id: string;
  name: string;
  category: PqTemplateCategory;
  description: string;
  preview: string;
  html: string;
};

export const pqTemplates = ${JSON.stringify(templates, null, 2)} satisfies PqTemplate[];

export const pqTemplateCategories = Array.from(
  new Set(pqTemplates.map((template) => template.category)),
) as PqTemplateCategory[];

export function getPqTemplateById(id: string): PqTemplate | undefined {
  return pqTemplates.find((template) => template.id === id);
}
`;
}

fs.mkdirSync(MODELS_DIR, { recursive: true });

for (const page of pages) {
  fs.writeFileSync(path.join(MODELS_DIR, `${page.slug}.html`), renderPage(page), 'utf8');
}

fs.writeFileSync(REGISTRY_FILE, renderRegistry(), 'utf8');

// Pages with strong content overlap get their own focused wording below.
const generated = new Set(pages.map((page) => page.slug));
const missing = fs
  .readdirSync(MODELS_DIR)
  .filter((file) => file.endsWith('.html'))
  .map((file) => file.replace(/\.html$/, ''))
  .filter((slug) => !generated.has(slug));

if (missing.length) {
  throw new Error(`Model pages without generated content: ${missing.join(', ')}`);
}

console.log(`${pages.length} model pages improved.`);
