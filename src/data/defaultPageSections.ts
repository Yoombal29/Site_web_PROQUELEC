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
    }
};
