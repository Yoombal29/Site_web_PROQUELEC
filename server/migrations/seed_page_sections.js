const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const pageSectionsData = {
    "public_utility": {
        "sections": [
            { "id": "autorites", "label": "Pour les Autorités", "icon": "Landmark" },
            { "id": "menages", "label": "Pour les Ménages", "icon": "Home" },
            { "id": "professionnels", "label": "Pour les Professionnels", "icon": "Briefcase" },
            { "id": "collectivites", "label": "Pour les Collectivités", "icon": "Building2" },
            { "id": "marches", "label": "Marchés & Centres", "icon": "ShoppingBag" }
        ],
        "content": {
            "autorites": {
                "title": "Partenaire de l'État",
                "subtitle": "Accompagner les politiques publiques de sécurité énergétique.",
                "features": [
                    "Expertise technique pour l'élaboration de normes nationales.",
                    "Audits de sécurité pour les bâtiments administratifs.",
                    "Formation des agents de l'état aux risques électriques.",
                    "Certification des grands projets d'infrastructure."
                ],
                "image": "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80"
            },
            "menages": {
                "title": "Sécurité Domestique",
                "subtitle": "Protéger chaque foyer sénégalais contre les risques électriques.",
                "features": [
                    "Diagnostic sécurité offert pour les installations vétustes.",
                    "Conseils pour réduire la facture énergétique.",
                    "Liste d'artisans certifiés pour vos travaux.",
                    "Sensibilisation aux dangers domestiques."
                ],
                "image": "https://images.unsplash.com/photo-1581093458791-9f30224d55b9?w=800&q=80"
            },
            "professionnels": {
                "title": "Excellence Métier",
                "subtitle": "Valoriser le savoir-faire des électriciens et installateurs.",
                "features": [
                    "Formation continue et certification QUALI-ELEC.",
                    "Accès prioritaire aux nouvelles réglementations.",
                    "Outils de dimensionnement et de calcul en ligne.",
                    "Réseau d'affaires et d'opportunités."
                ],
                "image": "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80"
            },
            "collectivites": {
                "title": "Territoires Sûrs",
                "subtitle": "Sécuriser les espaces publics et l'éclairage urbain.",
                "features": [
                    "Contrôle de conformité de l'éclairage public.",
                    "Audit des bâtiments communaux et écoles.",
                    "Plan de prévention des risques pour les événements.",
                    "Assistance à la maîtrise d'ouvrage publique."
                ],
                "image": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80"
            },
            "marches": {
                "title": "Commerce Sécurisé",
                "subtitle": "Prévenir les incendies dans les lieux à forte densité.",
                "features": [
                    "Campagnes de mise en conformité des marchés.",
                    "Formation des délégués de marché.",
                    "Installation de systèmes d'alerte précoce.",
                    "Certification triennale des installations commerciales."
                ],
                "image": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80"
            }
        }
    },
    "formation_certification": {
        "sections": [
            { "id": "catalogue", "label": "Catalogue", "icon": "BookOpen" },
            { "id": "calendrier", "label": "Calendrier", "icon": "Calendar" },
            { "id": "inscription", "label": "Inscription", "icon": "PenTool" },
            { "id": "certification-elec", "label": "Certif. Électriciens", "icon": "Award" },
            { "id": "formation-collectivites", "label": "Collectivités", "icon": "Building" },
            { "id": "formation-artisans", "label": "Artisans", "icon": "Hammer" },
            { "id": "ressources", "label": "Ressources", "icon": "GraduationCap" }
        ],
        "content": {
            "catalogue": {
                "title": "Catalogue des Formations",
                "subtitle": "Des modules experts pour maîtriser les normes et la sécurité.",
                "features": ["Module 1: Maîtrise de la norme NF C 15-100 (Niveaux 1 & 2).", "Module 2: Sécurité électrique en milieu industriel.", "Module 3: Audit et Contrôle des installations.", "Module 4: Efficacité énergétique et solaire photovoltaïque."],
                "image": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80"
            },
            "calendrier": {
                "title": "Calendrier des Sessions",
                "subtitle": "Planifiez votre montée en compétence.",
                "features": ["Sessions mensuelles à Dakar et en régions.", "Formations intra-entreprise sur demande.", "Webinaires techniques trimestriels.", "Examens de certification (Juin & Décembre)."],
                "image": "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80"
            },
            "inscription": {
                "title": "Inscription en Ligne",
                "subtitle": "Rejoignez l'élite des professionnels certifiés.",
                "features": ["Processus d'inscription 100% digital.", "Paiement sécurisé ou par bon de commande.", "Suivi administratif simplifié.", "Convocation automatique par email."],
                "image": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80"
            },
            "certification-elec": {
                "title": "Certification des Électriciens",
                "subtitle": "Le label QUALI-ELEC : un gage de confiance pour vos clients.",
                "features": ["Valorisation de votre savoir-faire technique.", "Droit d'usage du logo Certifié PROQUELEC.", "Référencement prioritaire sur notre site.", "Accès aux marchés publics exigeant la certification."],
                "image": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80"
            },
            "formation-collectivites": {
                "title": "Formation des Collectivités",
                "subtitle": "Gérer la sécurité électrique des territoires.",
                "features": ["Gestion de l'éclairage public et voirie.", "Sécurité des Établissements Recevant du Public (ERP).", "Maintenance des bâtiments administratifs.", "Prévention des risques urbains."],
                "image": "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&q=80"
            },
            "formation-artisans": {
                "title": "Formation des Artisans",
                "subtitle": "Professionnaliser le secteur informel.",
                "features": ["Mise à niveau sur les fondamentaux de la sécurité.", "Apprentissage des bonnes pratiques de câblage.", "Gestion de chantier et relation client.", "Kit de démarrage professionnel offert."],
                "image": "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&q=80"
            },
            "ressources": {
                "title": "Ressources Pédagogiques",
                "subtitle": "Votre bibliothèque technique en ligne.",
                "features": ["Fiches techniques téléchargeables (PDF).", "Vidéos tutorielles et démonstrations.", "Archives des normes et réglementations.", "Quiz d'auto-évaluation."],
                "image": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80"
            }
        }
    },
    // ... Add other pages here if needed, but for demonstration of "modifiable sub-menus", this structure is key. 
    // I will include NormesRessources and ProjetsRealisations to be thorough.
    "normes_ressources": {
        "sections": [
            { "id": "normes", "label": "Normes Électriques", "icon": "ShieldCheck" },
            { "id": "guides", "label": "Guides Pratiques", "icon": "Book" },
            { "id": "mementos", "label": "Mémentos", "icon": "Download" },
            { "id": "fiches", "label": "Fiches Conseils", "icon": "Home" },
            { "id": "faq", "label": "FAQ", "icon": "HelpCircle" },
            { "id": "publications", "label": "Publications", "icon": "Newspaper" }
        ],
        "content": {
            "normes": {
                "title": "Normes Électriques",
                "subtitle": "La référence technique pour la sécurité des installations.",
                "features": ["Norme NF C 15-100 : Principes fondamentaux.", "Réglementation locale et décrets d'application.", "Normes spécifiques aux Établissements Recevant du Public (ERP).", "Mise à la terre et protection contre la foudre."],
                "image": "https://images.unsplash.com/photo-1581093588402-4fc06a3504ac?w=800&q=80"
            },
            "guides": {
                "title": "Guides Pratiques",
                "subtitle": "L'accompagnement technique pas à pas.",
                "features": ["Guide de l'installation domestique sécurisée.", "Manuel de maintenance préventive.", "Guide du choix des matériaux certifiés.", "Carnet de bord du responsable sécurité."],
                "image": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80"
            },
            "mementos": {
                "title": "Mémentos Téléchargeables",
                "subtitle": "L'essentiel à portée de main.",
                "features": ["Aide-mémoire : Sections de câbles et protections.", "Check-list de vérification avant mise sous tension.", "Symboles graphiques normalisés.", "Fiche réflexe : Que faire en cas d'accident électrique ?"],
                "image": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80"
            },
            "fiches": {
                "title": "Fiches Conseils Ménages",
                "subtitle": "Sécuriser son foyer au quotidien.",
                "features": ["Comment identifier une prise dangereuse ?", "Les bons gestes pour économiser l'énergie.", "Protéger ses enfants des risques électriques.", "Choisir ses appareils électroménagers."],
                "image": "https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=800&q=80"
            },
            "faq": {
                "title": "Foire Aux Questions",
                "subtitle": "Les réponses de nos experts à vos interrogations.",
                "features": ["Quelle est la durée de validité d'une certification ?", "Comment devenir partenaire agréé ?", "Quelles sont les obligations en cas de vente immobilière ?", "Où déposer une demande d'audit ?"],
                "image": "https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?w=800&q=80"
            },
            "publications": {
                "title": "Publications PROQUELEC",
                "subtitle": "Notre contribution au débat public et technique.",
                "features": ["Rapports annuels d'activité.", "Études statistiques sur la sécurité électrique au Sénégal.", "Livre blanc de la conformité.", "Archive des bulletins d'information."],
                "image": "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&q=80"
            }
        }
    },
    // Adding Projets & Réalisations
    "projets_realisations": {
        "sections": [
            { "id": "marches", "label": "Marchés Sécurisés", "icon": "Briefcase" },
            { "id": "senelec", "label": "Partenariat SENELEC", "icon": "Zap" },
            { "id": "etudes", "label": "Études Majeures", "icon": "FileBarChart" },
            { "id": "avant-apres", "label": "Avant / Après", "icon": "Camera" },
            { "id": "temoignages", "label": "Témoignages", "icon": "MessageSquare" }
        ],
        "content": {
            "marches": {
                "title": "Marchés Sécurisés",
                "subtitle": "Interventions majeures dans les lieux à forte affluence.",
                "features": ["Mise aux normes du Marché HLM.", "Sécurisation du Centre Commercial Touba Sandaga.", "Installation de paratonnerres sur les marchés régionaux.", "Formation des délégués de marché à la sécurité."],
                "image": "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&q=80"
            },
            "senelec": {
                "title": "Partenariat avec SENELEC",
                "subtitle": "Une alliance stratégique pour le réseau national.",
                "features": ["Contrôle de conformité des nouveaux raccordements.", "Campagnes conjointes de sensibilisation.", "Lutte contre la fraude et les branchements illicites.", "Amélioration de la qualité de service."],
                "image": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80"
            },
            "etudes": {
                "title": "Études Majeures",
                "subtitle": "Analyses techniques et recommandations sectorielles.",
                "features": ["Audit du parc immobilier administratif de Dakar.", "Étude sur la sécurité électrique dans les écoles.", "Rapport sur les risques d'incendie domestique.", "Cartographie de la vétusté des installations."],
                "image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80"
            },
            "avant-apres": {
                "title": "Photos Avant/Après",
                "subtitle": "La preuve par l'image de notre impact.",
                "features": ["Remplacement de tableaux électriques vétustes.", "Mise en conformité de colonnes montantes.", "Pose de différentiels 30mA salvateurs.", "Sécurisation de fils nus et connexions dangereuses."],
                "image": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80"
            },
            "temoignages": {
                "title": "Témoignages",
                "subtitle": "Ils nous font confiance pour leur sécurité.",
                "features": ["« Grâce à l'audit, nous avons évité un court-circuit majeur. » - Directeur d'usine.", "« L'accompagnement de PROQUELEC est indispensable. » - Maire de commune.", "« Je dors tranquille depuis la mise aux normes. » - Chef de famille.", "« Des experts rigoureux et pédagogues. » - Promoteur immobilier."],
                "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80"
            }
        }
    },
    "actualites_evenements": {
        "sections": [
            { "id": "anniversaires", "label": "Anniversaires", "icon": "PartyPopper" },
            { "id": "seminaires", "label": "Séminaires", "icon": "Users" },
            { "id": "ateliers", "label": "Ateliers", "icon": "Hammer" },
            { "id": "conferences", "label": "Conférences", "icon": "Mic2" },
            { "id": "communiques", "label": "Communiqués", "icon": "Newspaper" },
            { "id": "medias", "label": "Médiathèque", "icon": "Camera" }
        ],
        "content": {
            "anniversaires": {
                "title": "Célébrations & Jubilés",
                "subtitle": "Marquer les étapes clés de notre engagement pour le Sénégal.",
                "features": ["Célébrations des 10 ans de PROQUELEC.", "Hommages aux pionniers du secteur électrique.", "Événements de cohésion nationale.", "Remise de distinctions honorifiques."],
                "image": "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80"
            },
            "seminaires": {
                "title": "Séminaires Stratégiques",
                "subtitle": "Réfléchir ensemble aux défis énergétiques du futur.",
                "features": ["Assises nationales sur la sécurité électrique.", "Rencontres avec les bailleurs de fonds.", "Planification annuelle des activités.", "Ateliers de prospective technologique."],
                "image": "https://images.unsplash.com/photo-1505373676104-1b5768903c7e?w=800&q=80"
            },
            "ateliers": {
                "title": "Ateliers Techniques",
                "subtitle": "La pratique au cœur de la montée en compétences.",
                "features": ["Sessions de démonstration de nouveaux matériels.", "Workshops sur l'efficacité énergétique.", "Démonstrations de logiciels de calcul.", "Ateliers de mise en situation réelle."],
                "image": "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=800&q=80"
            },
            "conferences": {
                "title": "Conférences & Débats",
                "subtitle": "Sensibiliser le grand public et les experts.",
                "features": ["Conférences dans les universités techniques.", "Débats sur la transition énergétique.", "Présentation des rapports annuels.", "Interventions dans les salons professionnels."],
                "image": "https://images.unsplash.com/photo-1475721027185-40ce3225a798?w=800&q=80"
            },
            "communiques": {
                "title": "Actualités & Communiqués",
                "subtitle": "L'information officielle de PROQUELEC.",
                "features": ["Flash infos sur les nouvelles normes.", "Annonces de partenariats stratégiques.", "Alertes sécurité pour les populations.", "Nominations et vie de l'association."],
                "image": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80"
            },
            "medias": {
                "title": "Couverture Médiatique",
                "subtitle": "PROQUELEC dans les médias nationaux et internationaux.",
                "features": ["Recherche de parutions presse.", "Interviews télévisées et radios.", "Web-documentaires sur nos projets.", "Galeries photos des événements majeurs."],
                "image": "https://images.unsplash.com/photo-1523580494863-6f30312246d1?w=800&q=80"
            }
        }
    },
    "partenaires": {
        "sections": [
            { "id": "institutionnels", "label": "Institutionnels", "icon": "Landmark" },
            { "id": "techniques", "label": "Techniques", "icon": "Settings" },
            { "id": "financiers", "label": "Financiers", "icon": "Banknote" },
            { "id": "prives", "label": "Privés", "icon": "Building" }
        ],
        "content": {
            "institutionnels": {
                "title": "Partenaires Institutionnels",
                "subtitle": "L'appui de l'État et des organismes publics.",
                "features": ["Ministère de l'Énergie et du Pétrole.", "SENELEC - Opérateur historique.", "ANARE - Agence de Régulation.", "Collectivités territoriales du Sénégal."],
                "image": "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80"
            },
            "techniques": {
                "title": "Partenaires Techniques",
                "subtitle": "L'excellence au service de la sécurité.",
                "features": ["Organismes de normalisation internationaux.", "Fabricants de matériel électrique certifié.", "Bureaux de contrôle et d'inspection.", "Écoles Polytechnique et Instituts Techniques."],
                "image": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80"
            },
            "financiers": {
                "title": "Partenaires Financiers",
                "subtitle": "Soutenir la croissance et l'investissement.",
                "features": ["Banques de développement.", "Fonds d'investissement vert.", "Programmes de coopération internationale.", "Compagnies d'assurances nationales."],
                "image": "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80"
            },
            "prives": {
                "title": "Partenaires Privés",
                "subtitle": "Un réseau de confiance pour le secteur.",
                "features": ["Entreprises de BTP majeures.", "Syndicats d'électriciens professionnels.", "Promoteurs immobiliers de référence.", "Distributeurs de matériel électrique."],
                "image": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80"
            }
        }
    },
    "about": {
        "sections": [
            { "id": "presentation", "label": "Présentation", "icon": "Building2" },
            { "id": "history", "label": "Historique", "icon": "History" },
            { "id": "vision", "label": "Vision & Valeurs", "icon": "Target" },
            { "id": "team", "label": "Équipe Dirigeante", "icon": "Users2" },
            { "id": "governance", "label": "Gouvernance", "icon": "Scale" },
            { "id": "partners", "label": "Partenaires", "icon": "Handshake" },
            { "id": "reports", "label": "Rapports Annuels", "icon": "FileText" }
        ],
        "content": {
            "presentation": {
                "title": "L'Organisme National de Référence",
                "subtitle": "PROQUELEC est une association sans but lucratif reconnue d'utilité publique.",
                "features": ["28+ Années de Service", "1M+ Visites de Contrôle", "70+ Experts Certifiés", "Certifié aux normes ISO"],
                "image": "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80"
            },
            "history": {
                "title": "Notre Parcours",
                "subtitle": "Près de trois décennies au service de la sécurité électrique.",
                "features": [
                    "1995 | L'Étincelle | Création de PROQUELEC pour sécuriser le secteur électrique au Sénégal.",
                    "2005 | Expansion Normative | Adoption officielle de la norme NF C 15-100 comme base de contrôle.",
                    "2015 | Modernisation | Numérisation des processus de certification et déploiement national.",
                    "2023 | Expert Lab | Lancement de la plateforme digitale d'intelligence."
                ],
                "image": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80"
            },
            "vision": {
                "title": "Notre Vocation",
                "subtitle": "Bâtir un Sénégal où chaque foyer dispose d'une énergie sûre, pérenne et conforme.",
                "features": [
                    "Sécurité: La protection des vies et des biens est notre priorité absolue.",
                    "Indépendance: Un organisme tiers, impartial et au service de l'intérêt général.",
                    "Excellence: Le respect strict des normes de classe mondiale.",
                    "Innovation: L'utilisation du digital pour simplifier la sécurité."
                ],
                "image": "https://images.unsplash.com/photo-1504384308090-c89e959b9428?w=800&q=80"
            },
            "team": {
                "title": "Équipe Dirigeante",
                "subtitle": "Des experts engagés pour l'excellence normative et technique.",
                "features": [
                    "M. Abdoulaye DIOP | Secrétaire Exécutif | Expert en ingénierie électrique avec 30 ans d'expérience.",
                    "Dr. Fatou SOW | Directrice Technique | Spécialiste en sécurité industrielle et normes internationales.",
                    "M. Ibrahima NDIAYE | Responsable Certifications | Ancien auditeur principal à la Senelec."
                ],
                "image": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80"
            },
            "governance": {
                "title": "Schéma Décisionnel",
                "subtitle": "Une structure transparente, inclusive et rigoureuse.",
                "features": [
                    "Assemblée Générale: Composée de l'État, des électriciens et des assureurs.",
                    "Bureau Exécutif: Définit la stratégie nationale et le budget.",
                    "Secrétariat Permanent: Assure l'exploitation quotidienne et les audits."
                ],
                "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
            },
            "partners": {
                "title": "Partenaires Institutionnels",
                "subtitle": "Ils soutiennent notre mission de sécurisation nationale.",
                "features": ["Ministère de l'Énergie", "SENELEC", "ANER", "CRSE", "ASER", "COSEC", "BOS", "CCIAD"],
                "image": "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80"
            },
            "reports": {
                "title": "Rapports Annuels",
                "subtitle": "Consultez nos bilans d'activité et rapports de transparence.",
                "features": ["Rapport Annuel 2023 - 4.2 MB", "Rapport Annuel 2022 - 3.8 MB", "Rapport Annuel 2021 - 3.5 MB"],
                "image": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80"
            }
        }
    },
    "activities": {
        "sections": [
            { "id": "hero", "label": "En-tête", "icon": "Zap" },
            { "id": "groups", "label": "Groupes d'Activités", "icon": "Layers" }
        ],
        "content": {
            "hero": {
                "title": "Nos Activités & Services",
                "subtitle": "Au service de la sécurité et de la qualité électrique au Sénégal",
                "features": ["Expertise Technique", "Accompagnement", "Certification"],
                "image": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80"
            },
            "groups": {
                "title": "Domaines d'Intervention",
                "subtitle": "Une expertise multi-facettes pour répondre à tous les enjeux du secteur.",
                "features": [
                    "Contrôle & Conformité | ClipboardCheck | Vérification complète et certification des installations.",
                    "Labellisation & Certification | Award | Délivrance du label d'excellence PROQUELEC.",
                    "Formation & Conseil | BookOpen | Programmes complets pour monter en compétence."
                ]
            }
        }
    },
    "certifications": {
        "sections": [
            { "id": "hero", "label": "En-tête", "icon": "Award" },
            { "id": "benefits", "label": "Avantages", "icon": "CheckCircle2" },
            { "id": "levels", "label": "Niveaux de Certification", "icon": "Star" }
        ],
        "content": {
            "hero": {
                "title": "Certifications Professionnelles",
                "subtitle": "Valorisez votre expertise, boostez votre carrière",
                "features": ["Reconnaissance d'Excellence", "Conformité Normative", "Visibilité"],
                "image": "https://images.unsplash.com/photo-1523240715632-99045506af5b?w=800&q=80"
            },
            "benefits": {
                "title": "Pourquoi se faire certifier ?",
                "subtitle": "Un engagement pour l'excellence et la sécurité.",
                "features": [
                    "Garantie de Sécurité | ShieldCheck | Assurez la protection des biens et personnes.",
                    "Plus d'Opportunités | TrendingUp | Accédez à des marchés publics et privés.",
                    "Crédibilité Accrue | FileBadge | Démarquez-vous de la concurrence."
                ]
            },
            "levels": {
                "title": "Parcours Qualifiants",
                "subtitle": "Trois paliers pour accompagner votre évolution.",
                "features": [
                    "Électricien Qualifié | Niveau 1 | Compétences fondamentales tertiaires.",
                    "Technicien Supérieur | Niveau 2 | Expertise systèmes industriels.",
                    "Maître Électricien | Expert | Maîtrise totale de l'ingénierie."
                ]
            }
        }
    },
    "legal": {
        "sections": [
            { "id": "content", "label": "Contenu Légal", "icon": "FileText" }
        ],
        "content": {
            "content": {
                "title": "Mentions Légales & RGPD",
                "subtitle": "Informations juridiques et protection des données.",
                "features": [
                    "Éditeur: PROQUELEC, Association reconnue d'utilité publique.",
                    "Données: Aucune donnée n'est collectée sans consentement.",
                    "Hébergement: Serveurs sécurisés en Europe/Afrique."
                ]
            }
        }
    },
    "showroom": {
        "sections": [
            { "id": "hero", "label": "En-tête", "icon": "Zap" }
        ],
        "content": {
            "hero": {
                "title": "Showroom Interactif",
                "subtitle": "Découvrez la conformité en action à travers nos projets emblématiques.",
                "features": ["Excellence Technique", "Immersion", "Normes"],
                "image": "https://images.unsplash.com/photo-1558223108-630d94e6a5c2?w=800&q=80"
            }
        }
    },
    "advantages": {
        "sections": [
            { "id": "hero", "label": "En-tête", "icon": "Target" },
            { "id": "electrician", "label": "Électriciens", "icon": "Zap" },
            { "id": "company", "label": "Entreprises", "icon": "Building2" },
            { "id": "member", "label": "Membres", "icon": "Users" }
        ],
        "content": {
            "hero": {
                "title": "Vos Avantages PROQUELEC",
                "subtitle": "Plus qu'une certification, un partenaire de votre réussite.",
                "features": ["Exclusivités", "Outils Pro", "Réseautage"],
                "image": "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80"
            },
            "electrician": {
                "title": "Électriciens Indépendants",
                "subtitle": "Élevez votre expertise et sécurisez vos chantiers.",
                "features": [
                    "Accès aux Normes | BookOpen | Consultation illimitée NF C 15-100.",
                    "Calculateurs Pro | Calculator | Chute de tension et section de câbles.",
                    "Générateur de Schémas | PenTool | Éditeur intuitif de conformité."
                ]
            },
            "company": {
                "title": "Entreprises & Installateurs",
                "subtitle": "Fluidifiez vos opérations et certifiez votre qualité.",
                "features": [
                    "Gestion Documents | Briefcase | GED centralisée sécurisée.",
                    "Badges de Qualité | Award | Visibilité accrue sur l'annuaire.",
                    "Support Dédié | Handshake | Ligne directe avec nos experts."
                ]
            },
            "member": {
                "title": "Membres de l'Association",
                "subtitle": "Le cœur de l'expertise électrique au Sénégal.",
                "features": [
                    "Gouvernance | ShieldCheck | Participez aux décisions stratégiques.",
                    "Veille Normative | Lightbulb | Accès en avant-première aux révisions.",
                    "Réseautage | Users | Accès exclusif aux événements strat."
                ]
            }
        }
    },
    "contact": {
        "sections": [
            { "id": "hero", "label": "En-tête", "icon": "Mail" },
            { "id": "info", "label": "Informations", "icon": "MapPin" }
        ],
        "content": {
            "hero": {
                "title": "Contactez-nous",
                "subtitle": "Une équipe d'experts à votre entière disposition.",
                "features": ["À votre écoute", "Support", "Expertise"],
                "image": "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=800&q=80"
            },
            "info": {
                "title": "Parlons de vos projets",
                "subtitle": "Nos bureaux sont ouverts du lundi au vendredi.",
                "features": [
                    "Téléphone | +221 33 825 00 00",
                    "Email | contact@proquelec.sn",
                    "Siège | Avenue Cheikh Anta Diop, Dakar",
                    "Horaires | Lun - Ven / 08h30 - 17h30"
                ]
            }
        }
    },
    "contact_premium": {
        "sections": [
            { "id": "inquiries", "label": "Inquiries", "icon": "Mail" },
            { "id": "diagnostics", "label": "Diagnostics", "icon": "ShieldCheck" },
            { "id": "locations", "label": "Locations", "icon": "MapPin" },
            { "id": "technical", "label": "Technical", "icon": "Settings" }
        ],
        "content": {
            "inquiries": {
                "title": "Informations Générales",
                "subtitle": "Toutes vos questions sur nos activités.",
                "features": ["Demande de renseignements généraux.", "Informations sur les adhésions.", "Partenariats et presse.", "Recrutement et carrières."],
                "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"
            },
            "diagnostics": {
                "title": "Demande de Diagnostic",
                "subtitle": "Sécurisez vos installations dès aujourd'hui.",
                "features": ["Audit de sécurité domestique.", "Contrôle de conformité industriel.", "Expertise après sinistre.", "Conseils en efficacité énergétique."],
                "image": "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80"
            },
            "locations": {
                "title": "Nos Bureaux",
                "subtitle": "Où nous trouver au Sénégal.",
                "features": ["Siège social à Dakar.", "Antenne régionale de Thiès.", "Bureau de liaison à Saint-Louis.", "Prochainement à Ziguinchor."],
                "image": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
            },
            "technical": {
                "title": "Support Technique",
                "subtitle": "L'assistance d'experts pour vos projets.",
                "features": ["Assistance à la maîtrise d'ouvrage.", "Aide à l'interprétation des normes.", "Validation de schémas électriques.", "Support pour l'utilisation des outils."],
                "image": "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&q=80"
            }
        }
    },
    "labels": {
        "sections": [
            { "id": "hero", "label": "En-tête", "icon": "Award" },
            { "id": "benefits", "label": "Avantages", "icon": "CheckCircle" },
            { "id": "criteria", "label": "Critères", "icon": "ShieldCheck" }
        ],
        "content": {
            "hero": {
                "title": "Le Label PROQUELEC",
                "subtitle": "La référence de l'excellence électrique",
                "features": ["Sceau de Qualité", "Référence Nationale", "Expertise"],
                "image": "https://images.unsplash.com/photo-1517049015648-5c4bb8a27ac1?w=800&q=80"
            },
            "benefits": {
                "title": "Les Avantages du Label",
                "subtitle": "Une valeur ajoutée concrète pour votre activité professionnelle.",
                "features": [
                    "Sécurité Renforcée | ShieldCheck | Garantie d'installations électriques conformes.",
                    "Reconnaissance Officielle | Award | Label reconnu par les autorités.",
                    "Avantage Concurrentiel | BarChart3 | Différenciation claire sur le marché.",
                    "Réseau Professionnel | Users | Intégration dans un écosystème d'excellence."
                ]
            },
            "criteria": {
                "title": "Critères d'obtention",
                "subtitle": "La rigueur de nos audits garantit la valeur de notre label.",
                "features": [
                    "Conformité Normative | CheckCircle | Respect rigoureux des normes NFC 15-100.",
                    "Expertise Technique | Zap | Validation des compétences des intervenants.",
                    "Contrôle & Audit | Search | Acceptation d'audits réguliers."
                ]
            }
        }
    },
    "trainings": {
        "sections": [
            { "id": "hero", "label": "En-tête", "icon": "GraduationCap" },
            { "id": "categories", "label": "Catégories", "icon": "Layers" },
            { "id": "stats", "label": "Statistiques", "icon": "BarChart3" }
        ],
        "content": {
            "hero": {
                "title": "Développez votre Expertise",
                "subtitle": "Des formations d'élite pour les professionnels de l'électricité",
                "features": ["Centre de Formation Agréé", "Certifications d'État", "Experts Métiers"],
                "image": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80"
            },
            "categories": {
                "title": "Explorez nos parcours",
                "subtitle": "Nos formations sont structurées par domaines d'expertise.",
                "features": [
                    "Installations & Normes | Layers | Maîtrise NFC 15-100, Solaire, Mise à la terre.",
                    "Sécurité & Habilitation | ShieldCheck | Habilitation B1/B2/BR/BC, Prévention risques.",
                    "Expertise & Audit | Zap | Audit énergétique, Conformité réglementaire."
                ]
            },
            "stats": {
                "title": "Pourquoi choisir PROQUELEC ?",
                "subtitle": "Un accompagnement vers l'excellence.",
                "features": [
                    "98% | Taux de succès | Candidats certifiés.",
                    "500+ | Certifiés / an | Professionnels formés.",
                    "25 Ans | D'histoire | Expertise reconnue."
                ]
            }
        }
    },
    "outils": {
        "sections": [
            { "id": "hero", "label": "En-tête", "icon": "Zap" },
            { "id": "features", "label": "Caractéristiques", "icon": "ShieldCheck" }
        ],
        "content": {
            "hero": {
                "title": "Plateforme d'Outils Électriques",
                "subtitle": "Accédez au catalogue complet d'ingénierie souveraine.",
                "features": ["40 Applications", "IA Normative", "Souveraineté des données"],
                "image": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80"
            },
            "features": {
                "title": "Ingénierie & Conformité",
                "subtitle": "Des outils certifiés pour les professionnels du Sénégal.",
                "features": [
                    "IA Corpus | Brain | Intelligence artificielle subordonnée aux normes.",
                    "Souveraineté | Safe | Données hébergées localement au Sénégal.",
                    "Expertise | Zap | Calculs certifiés par les ingénieurs PROQUELEC."
                ]
            }
        }
    }
};

async function seed() {
    try {
        console.log('🌱 Seeding Page Sections Data...');
        await pool.query('UPDATE public.site_settings SET page_sections = $1 WHERE id = 1', [JSON.stringify(pageSectionsData)]);
        console.log('✅ Page Sections Data Seeded Successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();
