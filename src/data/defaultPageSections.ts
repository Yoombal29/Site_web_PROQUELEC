export const DEFAULT_PAGE_SECTIONS = {
    home_page: {
        badge: "PORTAIL",
        hero_title: "PRO|QUELEC",
        hero_subtitle: "Promotion de la Qualité des Installations Électriques au Sénégal",
        label: "Accueil (Portail)",
        renderMode: 'sections',
        sections: [
            { id: "hero", label: "Bannière Accueil", icon: "Zap", type: "hero" },
            { id: "audience", label: "Offres par Audience", icon: "Users", type: "features-list" },
            { id: "mission", label: "Vision & Mission", icon: "Target", type: "text-image" },
            { id: "stats", label: "Statistiques", icon: "BarChart", type: "stats" },
            { id: "news", label: "Dernières Actualités", icon: "Newspaper", type: "custom" },
            { id: "partners", label: "Nos Partenaires", icon: "Globe", type: "gallery" }
        ],
        content: {
            hero: {
                title: "PRO|QUELEC SÉNÉGAL",
                subtitle: "Garant de la sécurité et de la qualité électrique",
                badge: "INSCRIPTION OUVERTE",
                layout: "centered"
            },
            audience: {
                title: "Des Services Sur-Mesure",
                subtitle: "PROQUELEC vous accompagne avec des outils dédiés.",
                layout: "grid-3",
                features: [
                    { title: "Électriciens", subtitle: "Indépendants", icon: "Zap", description: "Normes gratuites et calculateurs pro." },
                    { title: "Professionnels", subtitle: "Entreprises", icon: "Building2", description: "Gestion de chantiers et certifications." },
                    { title: "Membres", subtitle: "Experts", icon: "Users", description: "Veille normative et support prioritaire." }
                ]
            }
        }
    },
    autorites: {
        badge: "AUTORITÉS",
        hero_title: "Espace|Autorités",
        hero_subtitle: "Solutions et ressources dédiées aux autorités publiques et organismes de régulation",
        label: "Autorités",
        sections: [
            { id: "reglementation", label: "Réglementation", icon: "Scale" },
            { id: "controle", label: "Contrôle & Audit", icon: "ShieldCheck" },
            { id: "formation", label: "Formation Agents", icon: "GraduationCap" }
        ],
        content: {
            reglementation: {
                title: "Cadre Réglementaire",
                subtitle: "Accompagnement dans l'élaboration et l'application des normes électriques",
                features: [
                    "Conseil en élaboration de normes",
                    "Veille réglementaire internationale",
                    "Support technique aux décisions",
                    "Expertise juridique et technique"
                ],
                image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
                icon: "Scale"
            },
            controle: {
                title: "Contrôle & Audit",
                subtitle: "Outils et méthodologies pour le contrôle des installations électriques",
                features: [
                    "Protocoles d'inspection standardisés",
                    "Formation des inspecteurs",
                    "Outils de reporting numériques",
                    "Suivi des non-conformités"
                ],
                image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
                icon: "ShieldCheck"
            },
            formation: {
                title: "Formation des Agents",
                subtitle: "Programmes de formation continue pour les agents de contrôle",
                features: [
                    "Modules de formation certifiants",
                    "Mise à jour réglementaire",
                    "Ateliers pratiques",
                    "Certification des compétences"
                ],
                image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
                icon: "GraduationCap"
            }
        }
    },
    menages: {
        badge: "MÉNAGES",
        hero_title: "Espace|Ménages",
        hero_subtitle: "Conseils et informations pour la sécurité électrique de votre foyer",
        label: "Ménages",
        sections: [
            { id: "securite", label: "Sécurité Domestique", icon: "Home" },
            { id: "economies", label: "Économies d'Énergie", icon: "Zap" },
            { id: "conseils", label: "Conseils Pratiques", icon: "HelpCircle" }
        ],
        content: {
            securite: {
                title: "Sécurité Électrique à la Maison",
                subtitle: "Protégez votre famille avec des installations conformes",
                features: [
                    "Guide de vérification des installations",
                    "Détection des risques électriques",
                    "Conseils de prévention",
                    "Numéros d'urgence et contacts"
                ],
                image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
                icon: "Home"
            },
            economies: {
                title: "Économies d'Énergie",
                subtitle: "Réduisez votre facture tout en préservant l'environnement",
                features: [
                    "Audit énergétique gratuit",
                    "Conseils d'optimisation",
                    "Équipements économes recommandés",
                    "Aides et subventions disponibles"
                ],
                image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80",
                icon: "Zap"
            },
            conseils: {
                title: "Conseils Pratiques",
                subtitle: "Tout ce qu'il faut savoir pour une installation sûre",
                features: [
                    "Choix des équipements",
                    "Entretien préventif",
                    "Gestes de sécurité",
                    "FAQ et tutoriels vidéo"
                ],
                image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
                icon: "HelpCircle"
            }
        }
    },
    professionnels: {
        badge: "PROFESSIONNELS",
        hero_title: "Espace|Professionnels",
        hero_subtitle: "Ressources et services pour les électriciens et entreprises du secteur",
        label: "Professionnels",
        sections: [
            { id: "certification", label: "Certification", icon: "Award" },
            { id: "formation", label: "Formation Continue", icon: "GraduationCap" },
            { id: "outils", label: "Outils Métier", icon: "Briefcase" }
        ],
        content: {
            certification: {
                title: "Certification Professionnelle",
                subtitle: "Obtenez la reconnaissance QUALI-ELEC",
                features: [
                    "Processus de certification simplifié",
                    "Accompagnement personnalisé",
                    "Renouvellement facilité",
                    "Badge de qualité reconnu"
                ],
                image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
                icon: "Award"
            },
            formation: {
                title: "Formation Continue",
                subtitle: "Restez à jour avec les dernières normes et techniques",
                features: [
                    "Catalogue de formations",
                    "Sessions en présentiel et en ligne",
                    "Certifications reconnues",
                    "Financement CPF possible"
                ],
                image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
                icon: "GraduationCap"
            },
            outils: {
                title: "Outils Métier",
                subtitle: "Ressources techniques pour votre activité quotidienne",
                features: [
                    "Calculateurs en ligne",
                    "Bibliothèque de schémas",
                    "Normes et réglementations",
                    "Templates de devis"
                ],
                image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
                icon: "Briefcase"
            }
        }
    },
    outils: {
        badge: "OUTILS",
        hero_title: "Outils|Métier",
        hero_subtitle: "Des calculateurs, guides et ressources pour vos installations électriques.",
        label: "Outils Métiers",
        sections: [
            { id: "hero", label: "Bannière", icon: "Zap", type: "hero" },
            { id: "catalogue", label: "Catalogue d'Outils", icon: "Briefcase", type: "features-list" },
            { id: "benefits", label: "Pourquoi choisir", icon: "ShieldCheck", type: "text-image" }
        ],
        content: {
            hero: {
                title: "Outils Métier PROQUELEC",
                subtitle: "Des assistants techniques pour dimensionner, vérifier et piloter vos installations.",
                badge: "CATALOGUE",
                layout: "centered"
            },
            catalogue: {
                title: "Applications & Calculs",
                subtitle: "Des outils pour vous aider sur chaque étape du chantier.",
                features: [
                    "Calcul de chute de tension",
                    "Dimensionnement de sections de câble",
                    "Bibliothèque de normes et schémas",
                    "Gestion de devis et rapports"
                ],
                image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80"
            },
            benefits: {
                title: "Pourquoi utiliser nos outils ?",
                subtitle: "Précision, conformité et gain de temps pour vos projets.",
                features: [
                    "Mises à jour normatives automatiques",
                    "Exports PDF prêts à l'emploi",
                    "Interface simple et accessible",
                    "Support technique dédié"],
                image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80"
            }
        }
    },
    documents: {
        badge: "DOCUMENTS",
        hero_title: "Documents|& Ressources",
        hero_subtitle: "Accédez aux guides techniques, normes et supports essentiels.",
        label: "Documents & Ressources",
        sections: [
            { id: "hero", label: "Bannière", icon: "BookOpen", type: "hero" },
            { id: "library", label: "Bibliothèque", icon: "FileText", type: "features-list" },
            { id: "download", label: "Téléchargement", icon: "Download", type: "text-image" }
        ],
        content: {
            hero: {
                title: "Documents Techniques PROQUELEC",
                subtitle: "Tout ce dont vous avez besoin pour la conformité et la sécurité électrique.",
                badge: "RÉFÉRENTIEL"
            },
            library: {
                title: "Bibliothèque de Documents",
                subtitle: "Guides, normes et modèles opérationnels disponibles en un clic.",
                features: [
                    "Fiches techniques",
                    "Normes corrigées",
                    "Modèles de rapports",
                    "Guides de sécurité"
                ],
                image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&q=80"
            },
            download: {
                title: "Téléchargement Facile",
                subtitle: "Accédez immédiatement aux fichiers nécessaires pour vos audits et projets.",
                features: [
                    "Formats PDF et DOCX",
                    "Accès sécurisé",
                    "Mises à jour régulières",
                    "Support technique inclus"
                ],
                image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80"
            }
        }
    },
    events: {
        badge: "ÉVÉNEMENTS",
        hero_title: "Événements|PROQUELEC",
        hero_subtitle: "Participez aux conférences, ateliers et webinars dédiés au secteur électrique.",
        label: "Événements & Agenda",
        sections: [
            { id: "hero", label: "Bannière", icon: "Calendar", type: "hero" },
            { id: "agenda", label: "Agenda", icon: "Clock", type: "features-list" },
            { id: "partners", label: "Partenaires", icon: "Handshake", type: "testimonials" }
        ],
        content: {
            hero: {
                title: "Agenda & Événements Techniques",
                subtitle: "Restez informé des rendez-vous incontournables du secteur électrique.",
                badge: "AGENDA"
            },
            agenda: {
                title: "Prochains Rendez-vous",
                subtitle: "Conférences, ateliers et webinaires pour les professionnels et le grand public.",
                features: [
                    "Conférences techniques",
                    "Formations pratiques",
                    "Webinaires normatifs",
                    "Rencontres réseaux"
                ],
                image: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=800&q=80"
            },
            partners: {
                title: "Nos Partenaires Événementiels",
                subtitle: "Organisations et experts qui animent notre programme.",
                testimonials: [
                    {
                        name: "EnergiTech Sénégal",
                        role: "Organisateur",
                        company: "Salon de l'énergie",
                        content: "Un événement de référence pour découvrir les innovations du secteur.",
                        rating: 5
                    },
                    {
                        name: "SmartHome Africa",
                        role: "Webinaire",
                        company: "Domotique & sécurité",
                        content: "Des sessions pratiques pour maîtriser les installations connectées.",
                        rating: 5
                    }
                ]
            }
        }
    },
    showroom: {
        badge: "SHOWROOM",
        hero_title: "Showroom|Technique",
        hero_subtitle: "Explorez nos réalisations et solutions techniques en contexte réel.",
        label: "Showroom",
        sections: [
            { id: "hero", label: "Bannière", icon: "Camera", type: "hero" },
            { id: "gallery", label: "Galerie", icon: "Images", type: "gallery" },
            { id: "cta", label: "Appel à l'action", icon: "ArrowRight", type: "text-image" }
        ],
        content: {
            hero: {
                title: "Showroom de Conformité",
                subtitle: "Nos installations, démonstrations et projets certifiés en action.",
                badge: "INSPIRATION"
            },
            gallery: {
                title: "Nos réalisations",
                subtitle: "Un aperçu des travaux les plus marquants de PROQUELEC.",
                layout: "masonry",
                media: {
                    type: "gallery",
                    urls: [
                        "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800&q=80",
                        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
                        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80"
                    ]
                }
            },
            cta: {
                title: "Découvrez notre showroom",
                subtitle: "Contactez-nous pour une visite personnalisée et une démonstration technique.",
                features: [
                    "Visite dédiée aux professionnels",
                    "Démonstrations d'installations réelles",
                    "Conseils sur mesure",
                    "Réponses aux questions normatives"
                ],
                image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80"
            }
        }
    },
    presse: {
        badge: "PRESSE",
        hero_title: "Espace|Presse",
        hero_subtitle: "Ressources médias et communiqués de presse PROQUELEC",
        label: "Presse",
        sections: [
            { id: "communiques", label: "Communiqués", icon: "Newspaper" },
            { id: "dossiers", label: "Dossiers de Presse", icon: "FileText" },
            { id: "contacts", label: "Contacts Presse", icon: "Phone" }
        ],
        content: {
            communiques: {
                title: "Communiqués de Presse",
                subtitle: "Dernières actualités et annonces officielles",
                features: [
                    "Communiqués récents",
                    "Archives consultables",
                    "Téléchargement PDF",
                    "Alerte email personnalisée"
                ],
                image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80",
                icon: "Newspaper"
            },
            dossiers: {
                title: "Dossiers de Presse",
                subtitle: "Documentation complète pour les médias",
                features: [
                    "Kit média téléchargeable",
                    "Logos et visuels HD",
                    "Chiffres clés",
                    "Historique et missions"
                ],
                image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
                icon: "FileText"
            },
            contacts: {
                title: "Contacts Presse",
                subtitle: "Votre interlocuteur dédié",
                features: [
                    "Responsable communication",
                    "Ligne directe presse",
                    "Email dédié",
                    "Disponibilité 24/7 pour urgences"
                ],
                image: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&q=80",
                icon: "Phone"
            }
        }
    },
    social: {
        badge: "RÉSEAUX SOCIAUX",
        hero_title: "Réseaux &|Social",
        hero_subtitle: "Suivez-nous et partagez l'actualité PROQUELEC",
        label: "Social",
        sections: [
            { id: "reseaux", label: "Nos Réseaux", icon: "Share2" },
            { id: "campagnes", label: "Campagnes", icon: "Mic2" },
            { id: "communaute", label: "Communauté", icon: "Users2" }
        ],
        content: {
            reseaux: {
                title: "Nos Réseaux Sociaux",
                subtitle: "Rejoignez notre communauté en ligne",
                features: [
                    "Facebook - Actualités quotidiennes",
                    "LinkedIn - Réseau professionnel",
                    "Twitter - Veille réglementaire",
                    "YouTube - Tutoriels et formations"
                ],
                image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
                icon: "Share2"
            },
            campagnes: {
                title: "Campagnes de Sensibilisation",
                subtitle: "Nos actions de communication publique",
                features: [
                    "Campagnes de prévention",
                    "Événements en direct",
                    "Concours et jeux",
                    "Témoignages clients"
                ],
                image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
                icon: "Mic2"
            },
            communaute: {
                title: "Communauté PROQUELEC",
                subtitle: "Échangez avec nos membres",
                features: [
                    "Forum de discussion",
                    "Groupes thématiques",
                    "Événements networking",
                    "Ambassadeurs PROQUELEC"
                ],
                image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
                icon: "Users2"
            }
        }
    },
    projets_realisations: {
        badge: "RÉALISATIONS",
        label: "Nos Réalisations",
        hero_title: "Nos Projets|Majeurs",
        hero_subtitle: "Découvrez l'expertise de PROQUELEC à travers nos interventions sur tout le territoire sénégalais.",
        sections: [
            { id: "intro", label: "Présentation", icon: "FileText", type: "hero" },
            { id: "gallery", label: "Galerie Photos", icon: "Images", type: "gallery" },
            { id: "stats", label: "Chiffres Projet", icon: "BarChart", type: "stats" }
        ],
        content: {
            intro: {
                title: "Excellence & Sécurité",
                subtitle: "Plus de 500 chantiers audités et certifiés chaque année.",
                badge: "QUALITÉ SÉNÉGALAISE"
            },
            gallery: {
                title: "Images de nos Chantiers",
                subtitle: "Aperçu visuel de la rigueur technique de nos experts.",
                layout: "masonry",
                media: {
                    type: "gallery",
                    urls: [
                        "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80",
                        "https://images.unsplash.com/photo-1581094288338-2314dddb7903?w=800&q=80",
                        "https://images.unsplash.com/photo-1504307651254-35680f3366d4?w=800&q=80",
                        "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
                        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
                        "https://images.unsplash.com/photo-1590674899484-d564fa055038?w=800&q=80"
                    ]
                }
            },
            stats: {
                stats: [
                    { value: "500", suffix: "+", label: "Projets/An" },
                    { value: "14", label: "Régions couvertes" },
                    { value: "100", suffix: "%", label: "Transparence" },
                    { value: "24", suffix: "h", label: "Réactivité" }
                ]
            }
        }
    },
    avis_clients: {
        badge: "CONFIANCE",
        label: "Avis Clients",
        hero_title: "Ils nous|font confiance",
        hero_subtitle: "Découvrez les retours de nos partenaires, électriciens et particuliers satisfaits.",
        sections: [
            { id: "intro", label: "Introduction", icon: "Users2", type: "hero" },
            { id: "testimonials", label: "Témoignages", icon: "Star", type: "testimonials" },
            { id: "faq", label: "Questions Fréquentes", icon: "HelpCircle", type: "faq" }
        ],
        content: {
            intro: {
                title: "La voix de nos clients",
                subtitle: "Parce que votre sécurité est notre priorité absolue.",
                badge: "ÉNERGIE SURE"
            },
            testimonials: {
                title: "Avis Récent",
                subtitle: "Retours vérifiés de notre communauté.",
                testimonials: [
                    {
                        name: "Abdoulaye Diop",
                        role: "Entrepreneur",
                        company: "Diop Élec Services",
                        content: "La certification QUALI-ELEC a radicalement changé la perception de mes clients. C'est un gage de confiance incroyable.",
                        rating: 5
                    },
                    {
                        name: "Mariama Sarr",
                        role: "Particulier",
                        content: "Grâce aux conseils de PROQUELEC, j'ai pu identifier des défauts graves dans mon installation avant qu'un incident n'arrive.",
                        rating: 5
                    },
                    {
                        name: "Jean-Pierre NDIAYE",
                        role: "Directeur Technique",
                        company: "Global Tech Sn",
                        content: "Les calculateurs et ressources de PROQUELEC sont devenus indispensables pour nos chantiers complexes.",
                        rating: 4
                    }
                ]
            },
            faq: {
                title: "Besoin d'aide ?",
                subtitle: "Réponses aux questions les plus courantes sur nos services.",
                faq: [
                    { question: "Comment obtenir la certification QUALI-ELEC ?", answer: "Vous devez être un électricien agréé et soumettre un dossier de certification via votre espace professionnel." },
                    { question: "L'audit pour les particuliers est-il payant ?", answer: "PROQUELEC propose des audits de sensibilisation gratuits, mais les audits détaillés peuvent faire l'objet d'une tarification régulée." },
                    { question: "Où trouver les dernières normes ?", answer: "Toutes les normes NS 01-001 sont disponibles gratuitement en téléchargement dans votre espace membre." }
                ]
            }
        }
    },
    about: {
        badge: "À PROPOS",
        hero_title: "À Propos|de PROQUELEC",
        hero_subtitle: "Découvrez notre histoire, nos valeurs et notre engagement.",
        label: "À Propos",
        sections: [
            { id: "hero", label: "Bannière", icon: "Landmark" },
            { id: "mission", label: "Mission & Valeurs", icon: "Target" },
            { id: "history", label: "Notre Historique", icon: "History" }
        ],
        content: {
            hero: { title: "À Propos de PROQUELEC", subtitle: "Garants de la qualité électrique depuis le Sénégal", badge: "NOTRE HISTOIRE" },
            mission: { title: "Mission & Valeurs", subtitle: "Nous œuvrons pour la sécurité et la qualité", features: ["Transparence", "Excellence", "Innovation", "Responsabilité"] },
            history: { title: "Historique", subtitle: "Une odyssée électrique vers l'excellence" }
        }
    },
    public_utility: {
        badge: "UTILITÉ",
        hero_title: "Utilité|Publique",
        hero_subtitle: "Services et ressources pour les institutions publiques.",
        label: "Utilité Publique",
        sections: [
            { id: "hero", label: "Bannière", icon: "Building" },
            { id: "services", label: "Services", icon: "Briefcase" }
        ],
        content: {
            hero: { title: "Au Service du Public", subtitle: "PROQUELEC pour les autorités publiques", badge: "INSTITUTIONS" },
            services: { title: "Nos Services Publics", subtitle: "Solutions complètes pour les collectivités" }
        }
    },
    formation_certification: {
        badge: "FORMATION",
        hero_title: "Formation &|Certification",
        hero_subtitle: "Programmes complets de certification professionnelle.",
        label: "Formation & Certification",
        sections: [
            { id: "hero", label: "Bannière", icon: "GraduationCap" },
            { id: "programs", label: "Programmes", icon: "BookOpen" }
        ],
        content: {
            hero: { title: "Formation Professionnelle", subtitle: "Obtenez vos certifications reconnues", badge: "QUALIFICATION" },
            programs: { title: "Nos Programmes", subtitle: "Formations certifiantes et reconnues" }
        }
    },
    normes_ressources: {
        badge: "NORMES",
        hero_title: "Normes &|Ressources",
        hero_subtitle: "Accès complet aux normes électriques sénégalaises.",
        label: "Normes & Ressources",
        sections: [
            { id: "hero", label: "Bannière", icon: "BookOpen" },
            { id: "standards", label: "Normes", icon: "FileText" }
        ],
        content: {
            hero: { title: "Normes Électriques", subtitle: "Références complètes et mises à jour", badge: "CONFORMITÉ" },
            standards: { title: "Consultez les Normes", subtitle: "Normes NS 01-001 et dérivées" }
        }
    },
    actualites_evenements: {
        badge: "ACTUALITÉS",
        hero_title: "Actualités &|Événements",
        hero_subtitle: "Restez informé de nos dernières actualités et événements.",
        label: "Actualités & Événements",
        sections: [
            { id: "hero", label: "Bannière", icon: "Newspaper" },
            { id: "news", label: "Actualités", icon: "Rss" },
            { id: "events", label: "Événements", icon: "Calendar" }
        ],
        content: {
            hero: { title: "Actualités & Agenda", subtitle: "Nos dernières nouvelles et événements", badge: "À JOUR" },
            news: { title: "Actualités Récentes", subtitle: "Suivez nos dernières publications" },
            events: { title: "Événements à Venir", subtitle: "Participez à nos formations et ateliers" }
        }
    },
    partenaires: {
        badge: "PARTENAIRES",
        hero_title: "Nos|Partenaires",
        hero_subtitle: "Découvrez les organisations qui nous font confiance.",
        label: "Partenaires",
        sections: [
            { id: "hero", label: "Bannière", icon: "Handshake" },
            { id: "partners", label: "Partenaires", icon: "Globe" }
        ],
        content: {
            hero: { title: "Nos Partenaires", subtitle: "Ensemble pour la sécurité électrique", badge: "RÉSEAU" },
            partners: { title: "Nos Collaborateurs", subtitle: "Les acteurs de notre succès" }
        }
    },
    contact: {
        badge: "CONTACT",
        hero_title: "Nous|Contacter",
        hero_subtitle: "Prenez contact avec nos équipes.",
        label: "Contact Principal",
        sections: [
            { id: "hero", label: "Bannière", icon: "Phone" },
            { id: "form", label: "Formulaire", icon: "Mail" }
        ],
        content: {
            hero: { title: "Parlons de Vous!", subtitle: "Laissez-nous un message et nous vous recontacterons.", badge: "RÉPONSE 24H" },
            form: { title: "Formulaire de Contact", subtitle: "Décrivez votre demande" }
        }
    },
    contact_premium: {
        badge: "PREMIUM",
        hero_title: "Contact|Premium",
        hero_subtitle: "Support prioritaire et accompagnement personnalisé.",
        label: "Contact Premium",
        sections: [
            { id: "hero", label: "Bannière", icon: "Star" },
            { id: "premium", label: "Services Premium", icon: "Award" }
        ],
        content: {
            hero: { title: "Support Premium", subtitle: "Accès prioritaire à nos experts", badge: "VIP" },
            premium: { title: "Avantages Premium", subtitle: "Services exclusifs pour nos clients privilégiés" }
        }
    },
    activities: {
        badge: "ACTIVITÉS",
        hero_title: "Nos|Activités",
        hero_subtitle: "Explorez tous les domaines d'expertise de PROQUELEC.",
        label: "Activités",
        sections: [
            { id: "hero", label: "Bannière", icon: "Zap" },
            { id: "activities", label: "Domaines", icon: "LayoutGrid" }
        ],
        content: {
            hero: { title: "Nos Activités", subtitle: "Services complètes en sécurité électrique", badge: "EXPERTISE" },
            activities: { title: "Domaines de Compétence", subtitle: "Tout ce que nous maîtrisons" }
        }
    },
    labels: {
        badge: "LABELS",
        hero_title: "Labels &|Certifications",
        hero_subtitle: "Les certifications et labels qui nous distinguent.",
        label: "Labels",
        sections: [
            { id: "hero", label: "Bannière", icon: "Award" },
            { id: "labels", label: "Labels", icon: "Trophy" }
        ],
        content: {
            hero: { title: "Nos Labels", subtitle: "Certifications de qualité et de conformité", badge: "ACCRÉDITÉ" },
            labels: { title: "Labels & Accréditations", subtitle: "Nos reconnaissances officielles" }
        }
    },
    certifications: {
        badge: "CERTIFICATIONS",
        hero_title: "Certifications|PROQUELEC",
        hero_subtitle: "Obtenez vos certifications professionnelles reconnues.",
        label: "Certifications",
        sections: [
            { id: "hero", label: "Bannière", icon: "Award" },
            { id: "quali", label: "QUALI-ELEC", icon: "ShieldCheck" }
        ],
        content: {
            hero: { title: "Certifications Reconnues", subtitle: "Validez vos compétences", badge: "QUALI-ELEC" },
            quali: { title: "Certification QUALI-ELEC", subtitle: "Le standard de qualité professionnel" }
        }
    },
    formations: {
        badge: "FORMATIONS",
        hero_title: "Formations|Continues",
        hero_subtitle: "Programmes de formation pour tous les niveaux.",
        label: "Formations",
        sections: [
            { id: "hero", label: "Bannière", icon: "GraduationCap" },
            { id: "catalog", label: "Catalogue", icon: "BookOpen" }
        ],
        content: {
            hero: { title: "Notre Catalogue Formations", subtitle: "Mises à jour continues et certifications", badge: "APPRENTISSAGE" },
            catalog: { title: "Formations Disponibles", subtitle: "Parcours professionnels complets" }
        }
    },
    actualites: {
        badge: "NEWS",
        hero_title: "Actualités|PROQUELEC",
        hero_subtitle: "Restez informé des dernières nouvelles.",
        label: "Actualités",
        sections: [
            { id: "hero", label: "Bannière", icon: "Newspaper" },
            { id: "news", label: "Articles", icon: "Rss" }
        ],
        content: {
            hero: { title: "Nos Actualités", subtitle: "Dernier articles et annonces", badge: "INFOS" },
            news: { title: "Articles Récents", subtitle: "Publications et mises à jour" }
        }
    },
    expertises_techniques: {
        badge: "EXPERTISE",
        hero_title: "Expertises|Techniques",
        hero_subtitle: "Nos domaines de spécialisation technique.",
        label: "Expertises Techniques",
        sections: [
            { id: "hero", label: "Bannière", icon: "Zap" },
            { id: "domains", label: "Domaines", icon: "LayoutGrid" }
        ],
        content: {
            hero: { title: "Nos Expertises", subtitle: "Savoir-faire techniques reconnus", badge: "SPÉCIALISTE" },
            domains: { title: "Domaines d'Expertise", subtitle: "Nos compétences fondamentales" }
        }
    },
    expert_lab: {
        badge: "EXPERT LAB",
        hero_title: "Expert Lab|PROQUELEC",
        hero_subtitle: "Notre laboratoire d'innovation et d'expertise.",
        label: "Expert Lab",
        sections: [
            { id: "hero", label: "Bannière", icon: "Beaker" },
            { id: "lab", label: "Services Lab", icon: "Microscope" }
        ],
        content: {
            hero: { title: "Expert Lab", subtitle: "Innovation au service de la qualité", badge: "R&D" },
            lab: { title: "Services Laboratoire", subtitle: "Tests et expertise technique" }
        }
    },
    formations_proquelec: {
        badge: "PROQUELEC",
        hero_title: "Formations|PROQUELEC",
        hero_subtitle: "Parcours de formation exclusifs PROQUELEC.",
        label: "Formations PROQUELEC",
        sections: [
            { id: "hero", label: "Bannière", icon: "GraduationCap" },
            { id: "courses", label: "Cours", icon: "BookOpen" }
        ],
        content: {
            hero: { title: "Formations Spécialisées", subtitle: "Programmes exclusifs PROQUELEC", badge: "PARCOURS" },
            courses: { title: "Catalogue Complet", subtitle: "Formations sur mesure et reconnues" }
        }
    },
    blog: {
        badge: "BLOG",
        hero_title: "Actualités &|Conseils",
        hero_subtitle: "Lisez nos articles et conseils techniques.",
        label: "Blog",
        sections: [
            { id: "hero", label: "Bannière", icon: "Newspaper" },
            { id: "articles", label: "Articles", icon: "BookOpen" }
        ],
        content: {
            hero: { title: "Notre Blog", subtitle: "Articles techniques et conseils pratiques", badge: "INSIGHTS" },
            articles: { title: "Articles Récents", subtitle: "Actualités du secteur électrique" }
        }
    },
    avantages: {
        badge: "AVANTAGES",
        hero_title: "Avantages|PROQUELEC",
        hero_subtitle: "Les bénéfices de nous faire confiance.",
        label: "Avantages",
        sections: [
            { id: "hero", label: "Bannière", icon: "CheckCircle" },
            { id: "benefits", label: "Bénéfices", icon: "Gift" }
        ],
        content: {
            hero: { title: "Nos Avantages", subtitle: "Pourquoi choisir PROQUELEC", badge: "EXCELLENCE" },
            benefits: { title: "Bénéfices Exclusifs", subtitle: "Services et privilèges PROQUELEC" }
        }
    }
};

