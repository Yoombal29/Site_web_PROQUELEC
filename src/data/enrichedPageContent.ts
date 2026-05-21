

/**
 * CONTENU PAR DÉFAUT ENRICHI - SYSTÈME ULTRA-PARAMÉTRABLE
 * 
 * Chaque page contient :
 * - Hero personnalisable
 * - Sections multiples avec composants riches
 * - Styles, animations, médias
 * - 100% éditable via l'admin ou par code
 */

export const ENRICHED_DEFAULT_PAGES: Record<string, PageDefinition> = {
  autorites: {
    key: 'autorites',
    label: 'Espace Autorités',
    icon: 'ShieldCheck',
    themeColor: 'slate',
    content: {
      hero: {
        badge: 'AUTORITÉS PUBLIQUES',
        title: 'Espace Autorités',
        subtitle: 'Partenaire stratégique des instances de régulation pour une sécurité électrique optimale',
        gradient: 'from-slate-900 via-slate-800 to-slate-900',
        buttons: [
        { text: 'Nos Services', url: '#services', variant: 'primary', icon: 'ArrowRight', iconPosition: 'right' },
        { text: 'Nous Contacter', url: '/contact', variant: 'outline' }],

        height: '600px'
      },

      navigation: {
        sticky: true,
        style: 'pills',
        items: [
        { id: 'reglementation', label: 'Réglementation', icon: 'Scale' },
        { id: 'audit', label: 'Audit & Contrôle', icon: 'ShieldCheck' },
        { id: 'formation', label: 'Formation', icon: 'GraduationCap' },
        { id: 'stats', label: 'Chiffres Clés', icon: 'TrendingUp' }]

      },

      sections: [
      {
        id: 'reglementation',
        type: 'text-image',
        layout: 'left-right',
        title: 'Cadre Réglementaire & Normes',
        subtitle: 'Expertise technique et juridique au service des autorités',
        description: 'PROQUELEC accompagne les autorités publiques dans l\'élaboration, la mise en œuvre et le suivi des politiques de sécurité électrique. Notre expertise couvre l\'ensemble du cycle réglementaire.',
        features: [
        {
          icon: 'FileText',
          title: 'Conseil en élaboration de normes',
          description: 'Support technique et méthodologique pour la création de textes réglementaires'
        },
        {
          icon: 'Globe',
          title: 'Veille réglementaire internationale',
          description: 'Analyse comparative des normes IEC, NF C, et standards internationaux'
        },
        {
          icon: 'Scale',
          title: 'Expertise juridique et technique',
          description: 'Avis d\'experts sur les projets de loi et décrets'
        },
        {
          icon: 'BookOpen',
          title: 'Bibliothèque normative',
          description: 'Accès complet aux référentiels et guides d\'application'
        }],

        media: {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80',
          alt: 'Réglementation électrique',
          aspectRatio: '16/9',
          objectFit: 'cover'
        },
        buttons: [
        { text: 'Consulter les normes', url: '/normes', variant: 'primary' },
        { text: 'Demander un avis', url: '/contact', variant: 'outline' }],

        styles: {
          backgroundColor: '#f8fafc',
          padding: '80px 0',
          borderRadius: '0'
        },
        animation: {
          type: 'fade',
          duration: 0.6,
          delay: 0.2
        }
      },

      {
        id: 'audit',
        type: 'features-list',
        layout: 'grid-3',
        title: 'Programmes d\'Audit et de Contrôle',
        subtitle: 'Outils et méthodologies pour une inspection efficace',
        badge: 'CONTRÔLE QUALITÉ',
        features: [
        {
          icon: 'ClipboardCheck',
          title: 'Protocoles d\'inspection',
          description: 'Méthodologies normalisées et check-lists standardisées pour tous types d\'installations'
        },
        {
          icon: 'Users',
          title: 'Formation des inspecteurs',
          description: 'Programmes certifiants pour les agents de contrôle et inspecteurs terrain'
        },
        {
          icon: 'Smartphone',
          title: 'Application mobile d\'audit',
          description: 'Outil numérique de reporting en temps réel avec géolocalisation'
        },
        {
          icon: 'BarChart',
          title: 'Tableau de bord analytique',
          description: 'Suivi des non-conformités, statistiques et indicateurs de performance'
        },
        {
          icon: 'AlertTriangle',
          title: 'Gestion des risques',
          description: 'Classification et priorisation des interventions selon la criticité'
        },
        {
          icon: 'Database',
          title: 'Base de données centralisée',
          description: 'Historique complet des inspections et traçabilité des actions'
        }],

        styles: {
          backgroundColor: '#ffffff',
          padding: '100px 0'
        }
      },

      {
        id: 'formation',
        type: 'text-image',
        layout: 'right-left',
        title: 'Formation Continue des Agents',
        subtitle: 'Développement des compétences et certification',
        description: 'Nos programmes de formation assurent la montée en compétence des agents de contrôle et leur adaptation aux évolutions réglementaires et technologiques.',
        features: [
        {
          icon: 'Award',
          title: 'Certifications reconnues',
          description: 'Diplômes et attestations validés par les autorités compétentes'
        },
        {
          icon: 'Calendar',
          title: 'Planification flexible',
          description: 'Sessions en présentiel, distanciel et format hybride'
        },
        {
          icon: 'Video',
          title: 'E-learning interactif',
          description: 'Plateforme LMS avec modules vidéo, quiz et simulations'
        },
        {
          icon: 'Trophy',
          title: 'Évaluations pratiques',
          description: 'Mises en situation réelles et ateliers techniques'
        }],

        media: {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80',
          alt: 'Formation agents',
          aspectRatio: '4/3'
        },
        buttons: [
        { text: 'Catalogue de formations', url: '/formations', variant: 'primary', icon: 'BookOpen' },
        { text: 'S\'inscrire', url: '/inscription', variant: 'secondary' }],

        styles: {
          backgroundColor: '#f1f5f9',
          padding: '80px 0'
        }
      },

      {
        id: 'stats',
        type: 'stats',
        layout: 'grid-4',
        title: 'Notre Impact en Chiffres',
        subtitle: 'Des résultats concrets au service de la sécurité publique',
        stats: [
        {
          value: '50000',
          suffix: '+',
          label: 'Installations auditées par an',
          icon: 'Building'
        },
        {
          value: '500',
          suffix: '+',
          label: 'Agents formés annuellement',
          icon: 'Users'
        },
        {
          value: '95',
          suffix: '%',
          label: 'Taux de conformité post-intervention',
          icon: 'CheckCircle'
        },
        {
          value: '24',
          suffix: 'h',
          label: 'Délai moyen de réponse',
          icon: 'Clock'
        }],

        styles: {
          backgroundColor: '#0f172a',
          textColor: '#ffffff',
          accentColor: '#3b82f6',
          padding: '100px 0'
        }
      },

      {
        id: 'cta',
        type: 'cta',
        layout: 'centered',
        title: 'Collaborons pour la Sécurité Électrique',
        subtitle: 'Contactez-nous pour discuter de vos besoins spécifiques',
        buttons: [
        { text: 'Prendre rendez-vous', url: '/contact', variant: 'primary', size: 'lg', icon: 'Calendar' },
        { text: 'Télécharger notre brochure', url: '/download', variant: 'outline', size: 'lg', icon: 'Download' }],

        styles: {
          backgroundColor: '#3b82f6',
          textColor: '#ffffff',
          padding: '80px 0',
          gradient: 'from-blue-600 to-indigo-700'
        }
      }],


      settings: {
        theme: 'light',
        accentColor: '#64748b',
        fontFamily: 'Inter, sans-serif',
        maxWidth: '1400px'
      }
    }
  },

  menages: {
    key: 'menages',
    label: 'Espace Ménages',
    icon: 'Home',
    themeColor: 'rose',
    content: {
      hero: {
        badge: 'PARTICULIERS',
        title: 'Votre Sécurité Électrique à la Maison',
        subtitle: 'Conseils, diagnostics et solutions pour un foyer électriquement sûr',
        gradient: 'from-rose-900 via-pink-800 to-rose-900',
        backgroundImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80',
        buttons: [
        { text: 'Diagnostic gratuit', url: '/diagnostic', variant: 'primary', size: 'lg' },
        { text: 'Conseils pratiques', url: '#conseils', variant: 'outline', size: 'lg' }],

        height: '650px'
      },

      navigation: {
        sticky: true,
        style: 'tabs',
        items: [
        { id: 'securite', label: 'Sécurité', icon: 'Shield' },
        { id: 'economies', label: 'Économies', icon: 'Zap' },
        { id: 'diagnostics', label: 'Diagnostic', icon: 'Search' },
        { id: 'faq', label: 'Questions', icon: 'HelpCircle' }]

      },

      sections: [
      {
        id: 'securite',
        type: 'text-image',
        layout: 'left-right',
        title: 'Sécurité Électrique Domestique',
        subtitle: 'Protégez votre famille avec une installation conforme',
        badge: 'PRIORITÉ N°1',
        description: 'Chaque année, les incidents électriques domestiques causent des dommages matériels et corporels. Une installation bien entretenue et conforme aux normes est essentielle.',
        features: [
        {
          icon: 'CheckCircle',
          title: 'Auto-diagnostic de votre installation',
          description: 'Check-list gratuite pour vérifier les points critiques de sécurité'
        },
        {
          icon: 'AlertTriangle',
          title: 'Signes d\'alerte à surveiller',
          description: 'Disjonctions fréquentes, prises chaudes, odeurs suspectes...'
        },
        {
          icon: 'Wrench',
          title: 'Gestes d\'urgence',
          description: 'Que faire en cas de problème électrique ? Guide pratique'
        },
        {
          icon: 'Phone',
          title: 'Numéros d\'urgence',
          description: 'Contacts d\'urgence et professionnels certifiés près de chez vous'
        }],

        media: {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
          alt: 'Sécurité électrique maison'
        },
        buttons: [
        { text: 'Télécharger le guide', url: '/guide-securite.pdf', variant: 'primary', icon: 'Download' }],

        styles: {
          padding: '80px 0'
        }
      },

      {
        id: 'economies',
        type: 'features-list',
        layout: 'grid-2',
        title: 'Économies d\'Énergie',
        subtitle: 'Réduisez votre facture et votre empreinte carbone',
        badge: 'ÉCORESPONSABLE',
        features: [
        {
          icon: 'DollarSign',
          title: 'Audit énergétique gratuit',
          description: 'Identifiez les postes de consommation excessifs et les gisements d\'économie'
        },
        {
          icon: 'Lightbulb',
          title: 'Équipements économes',
          description: 'Guide d\'achat des appareils classe A+++ et labels énergétiques'
        },
        {
          icon: 'Sun',
          title: 'Solutions solaires',
          description: 'Panneaux photovoltaïques : dimensionnement, aides et retour sur investissement'
        },
        {
          icon: 'Gift',
          title: 'Aides et subventions',
          description: 'MaPrimeRénov\', certificats d\'économie d\'énergie, crédit d\'impôt...'
        }],

        styles: {
          backgroundColor: '#fdf2f8',
          padding: '100px 0'
        }
      },

      {
        id: 'diagnostics',
        type: 'form',
        layout: 'centered',
        title: 'Diagnostic Électrique Gratuit',
        subtitle: 'Remplissez ce formulaire pour recevoir un premier diagnostic',
        formAction: '/api/diagnostic',
        formMethod: 'POST',
        formFields: [
        { name: 'nom', type: 'text', label: 'Nom complet', required: true },
        { name: 'email', type: 'email', label: 'Email', required: true },
        { name: 'telephone', type: 'tel', label: 'Téléphone', required: true },
        { name: 'adresse', type: 'text', label: 'Adresse du logement', required: true },
        { name: 'age_installation', type: 'select', label: 'Âge de l\'installation', required: true, options: ['Moins de 5 ans', '5-10 ans', '10-20 ans', 'Plus de 20 ans', 'Je ne sais pas'] },
        { name: 'probleme', type: 'textarea', label: 'Décrivez votre problème ou demande', required: false }],

        buttons: [
        { text: 'Envoyer ma demande', variant: 'primary', size: 'lg' }],

        styles: {
          backgroundColor: '#ffffff',
          padding: '80px 0',
          maxWidth: '800px'
        }
      },

      {
        id: 'faq',
        type: 'faq',
        title: 'Questions Fréquentes',
        subtitle: 'Toutes les réponses à vos interrogations',
        faq: [
        {
          question: 'À quelle fréquence dois-je faire vérifier mon installation ?',
          answer: 'Il est recommandé de faire contrôler votre installation électrique tous les 10 ans, ou lors de tout événement significatif (travaux, incident, achat d\'une maison ancienne).'
        },
        {
          question: 'Comment savoir si mon tableau électrique est aux normes ?',
          answer: 'Un tableau conforme doit comporter un disjoncteur différentiel 30mA, des protections adaptées pour chaque circuit, un repérage clair, et respecter la norme NF C 15-100 en vigueur.'
        },
        {
          question: 'Puis-je réaliser des travaux électriques moi-même ?',
          answer: 'La loi autorise les particuliers à réaliser des petits travaux simples. Cependant, toute modification importante nécessite l\'intervention d\'un électricien qualifié et une attestation de conformité CONSUEL.'
        },
        {
          question: 'Combien coûte une mise en conformité électrique ?',
          answer: 'Le coût varie fortement selon l\'état initial, la surface et les travaux nécessaires. Comptez entre 80€ et 120€/m² pour une rénovation complète. Des aides financières peuvent réduire significativement ce coût.'
        }],

        styles: {
          padding: '80px 0'
        }
      }],


      settings: {
        accentColor: '#f43f5e'
      }
    }
  }

  // Je vais continuer avec les autres pages dans un prochain fichier...
};