
import { supabase } from '@/integrations/supabase/client';

export const seedElectricalData = async () => {
  try {
    // Certifications électriques
    const certifications = [
      {
        name: "Habilitation Électrique B1V",
        code: "B1V",
        description: "Habilitation pour travaux électriques en basse tension avec voisinage",
        validity_period: 36,
        required_training_hours: 21,
        certification_body: "AFNOR Certification",
        cost: 450,
        requirements: [
          "Avoir des compétences en électricité",
          "Être âgé d'au moins 18 ans",
          "Avoir une aptitude médicale"
        ]
      },
      {
        name: "Habilitation Électrique H0V",
        code: "H0V",
        description: "Habilitation pour personnel non électricien travaillant au voisinage de la haute tension",
        validity_period: 36,
        required_training_hours: 14,
        certification_body: "AFNOR Certification",
        cost: 350,
        requirements: [
          "Formation à la sécurité électrique",
          "Sensibilisation aux risques électriques"
        ]
      },
      {
        name: "Qualification QualiPV",
        code: "QUALIPV",
        description: "Qualification pour l'installation de systèmes photovoltaïques",
        validity_period: 48,
        required_training_hours: 35,
        certification_body: "Qualit'EnR",
        cost: 890,
        requirements: [
          "Être électricien qualifié",
          "Expérience en installations électriques",
          "Formation aux énergies renouvelables"
        ]
      }
    ];

    await supabase.from('electrical_certifications').insert(certifications);

    // Formations professionnelles
    const trainings = [
      {
        title: "Formation Habilitation Électrique B1V",
        description: "Formation complète pour obtenir l'habilitation B1V permettant de réaliser des travaux électriques en basse tension",
        duration_hours: 21,
        level: "intermédiaire",
        price: 450,
        max_participants: 8,
        instructor_name: "Jean-Pierre MARTIN",
        location: "Centre de formation PROQUELEC - Dakar",
        equipment_provided: true,
        prerequisites: [
          "Connaissances de base en électricité",
          "Expérience pratique souhaitée",
          "Aptitude médicale valide"
        ],
        learning_objectives: [
          "Identifier les risques électriques",
          "Appliquer les consignes de sécurité",
          "Utiliser les équipements de protection",
          "Réaliser des travaux hors tension",
          "Intervenir en sécurité sur installations BT"
        ]
      },
      {
        title: "Installation Photovoltaïque - Niveau Avancé",
        description: "Formation spécialisée pour l'installation et la maintenance de systèmes photovoltaïques",
        duration_hours: 35,
        level: "avancé",
        price: 890,
        max_participants: 6,
        instructor_name: "Amadou DIOP",
        location: "Site de démonstration - Thiès",
        equipment_provided: true,
        prerequisites: [
          "Habilitation électrique B2V minimum",
          "2 ans d'expérience en électricité",
          "Notions de base en énergies renouvelables"
        ],
        learning_objectives: [
          "Dimensionner une installation PV",
          "Installer les panneaux et onduleurs",
          "Configurer le système de monitoring",
          "Effectuer la mise en service",
          "Planifier la maintenance préventive"
        ]
      },
      {
        title: "Sécurité Électrique pour Non-Électriciens",
        description: "Formation de sensibilisation aux risques électriques pour personnel non spécialisé",
        duration_hours: 7,
        level: "débutant",
        price: 180,
        max_participants: 15,
        instructor_name: "Fatou KANE",
        location: "Salle de formation PROQUELEC",
        equipment_provided: false,
        prerequisites: [
          "Aucun prérequis technique",
          "Personnel travaillant à proximité d'installations électriques"
        ],
        learning_objectives: [
          "Reconnaître les dangers électriques",
          "Adopter les bons réflexes de sécurité",
          "Connaître les gestes de premier secours",
          "Utiliser les EPI appropriés"
        ]
      }
    ];

    await supabase.from('professional_training').insert(trainings);

    // Équipements électriques
    const equipment = [
      {
        name: "Multimètre Numérique Fluke 87V",
        category: "mesure",
        brand: "Fluke",
        model: "87V",
        specifications: {
          "tension_max": "1000V",
          "courant_max": "10A",
          "résistance_max": "50MΩ",
          "précision": "±0.05%"
        },
        price: 450,
        rental_price_daily: 25,
        description: "Multimètre industriel haute performance pour mesures électriques précises",
        safety_instructions: [
          "Vérifier l'état des cordons avant utilisation",
          "Respecter les catégories de mesure",
          "Porter les EPI appropriés"
        ],
        certification_standards: ["IEC 61010-1", "CAT IV 600V"],
        is_rental: true,
        stock_quantity: 5
      },
      {
        name: "Pince Ampèremétrique Chauvin Arnoux F605",
        category: "mesure",
        brand: "Chauvin Arnoux",
        model: "F605",
        specifications: {
          "ouverture_pince": "52mm",
          "courant_ac": "600A",
          "tension_max": "600V"
        },
        price: 280,
        rental_price_daily: 15,
        description: "Pince ampèremétrique pour mesures de courant sans coupure",
        safety_instructions: [
          "S'assurer de la bonne fermeture de la pince",
          "Ne pas dépasser les valeurs maximales"
        ],
        certification_standards: ["IEC 61010-1"],
        is_rental: true,
        stock_quantity: 8
      }
    ];

    await supabase.from('electrical_equipment').insert(equipment);

    // Normes électriques
    const standards = [
      {
        code: "NFC 15-100",
        title: "Installations électriques à basse tension",
        description: "Norme française définissant les règles de conception et de réalisation des installations électriques BT",
        category: "installation",
        version: "2015 + A5:2019",
        publication_date: "2015-09-01",
        effective_date: "2016-09-01",
        summary: "Règles de sécurité pour les installations électriques domestiques et tertiaires",
        key_changes: [
          "Renforcement des règles pour les locaux humides",
          "Nouvelles prescriptions pour les véhicules électriques",
          "Évolution des règles de protection"
        ],
        applicable_sectors: ["résidentiel", "tertiaire", "industriel"]
      },
      {
        code: "IEC 60364",
        title: "Installations électriques des bâtiments",
        description: "Norme internationale pour les installations électriques basse tension",
        category: "installation",
        version: "2018",
        publication_date: "2018-03-01",
        effective_date: "2018-09-01",
        summary: "Standard international harmonisé pour les installations électriques",
        key_changes: [
          "Harmonisation internationale",
          "Nouvelles technologies intégrées",
          "Règles de cybersécurité"
        ],
        applicable_sectors: ["résidentiel", "commercial", "industriel"]
      }
    ];

    await supabase.from('electrical_standards').insert(standards);

    console.log('Données de démonstration créées avec succès !');
    return { success: true };
    
  } catch (error) {
    console.error('Erreur lors de la création des données:', error);
    return { success: false, error };
  }
};
