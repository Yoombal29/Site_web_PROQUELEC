/**
 * 📚 ObjectLibrary — Catalogue d'objets normatifs
 * 
 * Bibliothèque complète des objets électriques normalisés
 * conforme à NF C 15-100, NS 01-001, NF C 14-100
 * 
 * Catégories :
 * 1. SOURCES & ALIMENTATION
 * 2. POSTES & TRANSFORMATION
 * 3. TABLEAUX & ENVELOPPES
 * 4. PROTECTIONS & APPAREILLAGES
 * 5. CÂBLES & LIAISONS
 * 6. RÉCEPTEURS & CHARGES
 */

export interface ObjectDefinition {
  /** ID unique de l'objet */
  id: string;
  /** Catégorie selon classification PROQUELEC */
  category: 'SOURCE' | 'PROTECTION' | 'DISTRIBUTION' | 'DERIVATION' | 'COUPURE' | 'RECEPTOR' | 'TRANSFORMATION' | 'PRODUCTION' | 'GROUND' | 'CABLE';
  /** Nom affiché */
  name: string;
  /** Symbole normatif (IEC/NF C) */
  symbol: string;
  /** Paramètres par défaut */
  defaultParams: Record<string, any>;
  /** Référence normative (Art. XXX) */
  normativeRef: string;
  /** Champs éditables par l'utilisateur */
  editableFields: Array<{
    name: string;
    type: 'number' | 'select' | 'text' | 'checkbox';
    label: string;
    options?: string[] | number[];
    min?: number;
    max?: number;
    unit?: string;
  }>;
  /** Description */
  description: string;
}

/**
 * 🔌 A. SOURCES & ALIMENTATION (NF C 14-100)
 */
const SOURCES: Record<string, ObjectDefinition> = {
  SOURCE_TYPE_A: {
    id: 'source_type_a',
    category: 'SOURCE',
    name: 'Réseau public BT (Type A)',
    symbol: '⚡',
    description: 'Raccordement direct au réseau public de distribution BT',
    defaultParams: {
      voltage: 230,
      type: 'A',
      regime: 'TT',
      maxCurrent: 60
    },
    normativeRef: 'NF C 14-100 Art. 5 / Art. 522',
    editableFields: [
      {
        name: 'voltage',
        type: 'select',
        label: 'Tension (V)',
        options: [230, 400]
      },
      {
        name: 'regime',
        type: 'select',
        label: 'Régime du neutre',
        options: ['TT', 'TN-S', 'TN-C-S', 'IT']
      }
    ]
  },
  SOURCE_TYPE_B: {
    id: 'source_type_b',
    category: 'SOURCE',
    name: 'Poste HT/BT privé (Type B)',
    symbol: '🔋',
    description: 'Source privée avec transformation HT → BT',
    defaultParams: {
      voltage: 400,
      type: 'B',
      regime: 'TN-S',
      maxCurrent: 125
    },
    normativeRef: 'NF C 15-100 Art. 525 / Art. 523',
    editableFields: [
      {
        name: 'voltage',
        type: 'select',
        label: 'Tension aval (V)',
        options: [230, 400]
      },
      {
        name: 'maxCurrent',
        type: 'number',
        label: 'Courant disponible (A)',
        min: 10,
        max: 630
      }
    ]
  }
};

/**
 * 🛡️ B. PROTECTIONS & APPAREILLAGES
 */
const PROTECTIONS: Record<string, ObjectDefinition> = {
  BREAKER_6A: {
    id: 'breaker_6a',
    category: 'PROTECTION',
    name: 'Disjoncteur 6A courbe B',
    symbol: 'C',
    description: 'Protection thermique/magnétique usage éclairage',
    defaultParams: {
      calibre: 6,
      curve: 'B',
      pdc: 4500,
      type: 'unipolaire'
    },
    normativeRef: 'NF C 61-201 / NF C 15-100 Art. 533',
    editableFields: [
      {
        name: 'calibre',
        type: 'select',
        label: 'Calibre (A)',
        options: [6, 10, 16, 20, 25, 32, 40, 50, 63]
      },
      {
        name: 'curve',
        type: 'select',
        label: 'Courbe de déclenchement',
        options: ['B', 'C', 'D']
      }
    ]
  },
  BREAKER_16A: {
    id: 'breaker_16a',
    category: 'PROTECTION',
    name: 'Disjoncteur 16A courbe B',
    symbol: 'C',
    description: 'Protection thermique/magnétique usage prises',
    defaultParams: {
      calibre: 16,
      curve: 'B',
      pdc: 4500,
      type: 'unipolaire'
    },
    normativeRef: 'NF C 61-201 / NF C 15-100 Art. 533',
    editableFields: [
      {
        name: 'calibre',
        type: 'select',
        label: 'Calibre (A)',
        options: [10, 16, 20, 25, 32]
      }
    ]
  },
  DDR_30MA: {
    id: 'ddr_30ma',
    category: 'PROTECTION',
    name: 'DDR 30mA type A',
    symbol: '⚡⚠️',
    description: 'Détecteur de défaut contact (protection corps)',
    defaultParams: {
      sensitivity: 30,
      type: 'A',
      curve: 'B'
    },
    normativeRef: 'NF C 61-202 / NF C 15-100 Art. 535',
    editableFields: [
      {
        name: 'sensitivity',
        type: 'select',
        label: 'Sensibilité (mA)',
        options: [10, 30, 100, 300]
      },
      {
        name: 'type',
        type: 'select',
        label: 'Type de DDR',
        options: ['A', 'AC', 'B']
      }
    ]
  },
  FUSE_10A: {
    id: 'fuse_10a',
    category: 'PROTECTION',
    name: 'Fusible 10A gG',
    symbol: 'F',
    description: 'Protection par fusible gG',
    defaultParams: {
      calibre: 10,
      type: 'gG',
      voltage: 400
    },
    normativeRef: 'NF C 61-210 / NF C 15-100 Art. 533',
    editableFields: [
      {
        name: 'calibre',
        type: 'select',
        label: 'Calibre (A)',
        options: [2, 4, 6, 10, 16, 20, 25, 32, 40, 50, 63]
      }
    ]
  }
};

/**
 * 📊 C. DISTRIBUTION & TABLEAUX
 */
const DISTRIBUTIONS: Record<string, ObjectDefinition> = {
  TGBT: {
    id: 'tgbt',
    category: 'DISTRIBUTION',
    name: 'TGBT (Tableau Général Basse Tension)',
    symbol: '□',
    description: 'Nœud principal de distribution électrique',
    defaultParams: {
      label: 'TGBT-01',
      amperage: 125,
      enclosureType: 'IP54'
    },
    normativeRef: 'NF C 15-100 Art. 521-522',
    editableFields: [
      {
        name: 'label',
        type: 'text',
        label: 'Étiquette'
      },
      {
        name: 'amperage',
        type: 'number',
        label: 'Ampérage (A)',
        min: 20,
        max: 630,
        unit: 'A'
      }
    ]
  },
  TABLEAU_DIV: {
    id: 'tableau_div',
    category: 'DISTRIBUTION',
    name: 'Tableau divisionnaire',
    symbol: '◆',
    description: 'Sous-répartition locale',
    defaultParams: {
      label: 'TD-01',
      amperage: 63,
      enclosureType: 'IP54'
    },
    normativeRef: 'NF C 15-100 Art. 522',
    editableFields: [
      {
        name: 'label',
        type: 'text',
        label: 'Étiquette'
      },
      {
        name: 'amperage',
        type: 'number',
        label: 'Ampérage (A)',
        min: 16,
        max: 125
      }
    ]
  }
};

/**
 * 🔀 D. DÉRIVATIONS & BRANCHEMENTS
 */
const DERIVATIONS: Record<string, ObjectDefinition> = {
  DERIVATION_BOX: {
    id: 'derivation_box',
    category: 'DERIVATION',
    name: 'Boîte de dérivation',
    symbol: '⊞',
    description: 'Point de dérivation pour branchement secondaire',
    defaultParams: {
      label: 'BD-01',
      enclosureType: 'IP55',
      maxCurrent: 32
    },
    normativeRef: 'NF C 15-100 Art. 522',
    editableFields: [
      {
        name: 'label',
        type: 'text',
        label: 'Étiquette'
      },
      {
        name: 'maxCurrent',
        type: 'number',
        label: 'Courant max (A)',
        min: 10,
        max: 100
      }
    ]
  },
  JUNCTION_BOX: {
    id: 'junction_box',
    category: 'DERIVATION',
    name: 'Boîte de jonction',
    symbol: '⊠',
    description: 'Jonction de conducteurs',
    defaultParams: {
      label: 'BJ-01',
      enclosureType: 'IP55',
      conductorCount: 4
    },
    normativeRef: 'NF C 15-100 Art. 522',
    editableFields: [
      {
        name: 'label',
        type: 'text',
        label: 'Étiquette'
      },
      {
        name: 'conductorCount',
        type: 'number',
        label: 'Nombre de conducteurs',
        min: 2,
        max: 8
      }
    ]
  }
};

/**
 * ✂️ E. COUPURES & SECTIONNEMENTS
 */
const COUPURES: Record<string, ObjectDefinition> = {
  SECTIONALIZER: {
    id: 'sectionalizer',
    category: 'COUPURE',
    name: 'Sectionneur',
    symbol: 'S',
    description: 'Appareil de sectionnement visible',
    defaultParams: {
      label: 'SEC-01',
      voltage: 400,
      maxCurrent: 125
    },
    normativeRef: 'NF C 15-100 Art. 537',
    editableFields: [
      {
        name: 'label',
        type: 'text',
        label: 'Étiquette'
      },
      {
        name: 'maxCurrent',
        type: 'number',
        label: 'Courant max (A)',
        min: 16,
        max: 630
      }
    ]
  },
  DISCONNECTOR: {
    id: 'disconnector',
    category: 'COUPURE',
    name: 'Séparateur',
    symbol: 'D',
    description: 'Séparation visible pour maintenance',
    defaultParams: {
      label: 'SEP-01',
      voltage: 400,
      maxCurrent: 125
    },
    normativeRef: 'NF C 15-100 Art. 537',
    editableFields: [
      {
        name: 'label',
        type: 'text',
        label: 'Étiquette'
      },
      {
        name: 'maxCurrent',
        type: 'number',
        label: 'Courant max (A)',
        min: 16,
        max: 630
      }
    ]
  }
};

/**
 * ⚙️ F. TRANSFORMATION & CONVERSION
 */
const TRANSFORMATIONS: Record<string, ObjectDefinition> = {
  TRANSFORMER_PRIVATE: {
    id: 'transformer_private',
    category: 'TRANSFORMATION',
    name: 'Transformateur privé',
    symbol: 'T',
    description: 'Transformation HT/BT privée (définit Type B aval)',
    defaultParams: {
      power: 100,
      uk: 4.0,
      dT: 55,
      coolingType: 'AN'
    },
    normativeRef: 'NF C 15-100 Art. 523 / CEI 60076',
    editableFields: [
      {
        name: 'power',
        type: 'number',
        label: 'Puissance (kVA)',
        min: 10,
        max: 1000,
        unit: 'kVA'
      },
      {
        name: 'uk',
        type: 'number',
        label: 'Impédance Uk (%)',
        min: 2,
        max: 10,
        unit: '%'
      },
      {
        name: 'dT',
        type: 'number',
        label: 'Échauffement (°C)',
        min: 30,
        max: 100,
        unit: '°C'
      }
    ]
  },
  CONVERTER_DC: {
    id: 'converter_dc',
    category: 'TRANSFORMATION',
    name: 'Convertisseur DC/DC',
    symbol: '↔',
    description: 'Conversion de tension continue',
    defaultParams: {
      inputVoltage: 48,
      outputVoltage: 24,
      power: 500,
      efficiency: 0.9
    },
    normativeRef: 'NF C 15-100 Annexe G',
    editableFields: [
      {
        name: 'power',
        type: 'number',
        label: 'Puissance (W)',
        min: 50,
        max: 5000,
        unit: 'W'
      },
      {
        name: 'efficiency',
        type: 'number',
        label: 'Rendement',
        min: 0.7,
        max: 0.95
      }
    ]
  }
};

/**
 * 🔋 G. PRODUCTION & GÉNÉRATION
 */
const PRODUCTIONS: Record<string, ObjectDefinition> = {
  SOLAR_PANEL: {
    id: 'solar_panel',
    category: 'PRODUCTION',
    name: 'Panneau solaire',
    symbol: '☀️',
    description: 'Production photovoltaïque',
    defaultParams: {
      power: 300,
      voltage: 48,
      efficiency: 0.2,
      area: 1.6
    },
    normativeRef: 'NF C 15-100 Annexe G / NFC 15-100-1',
    editableFields: [
      {
        name: 'power',
        type: 'number',
        label: 'Puissance (W)',
        min: 100,
        max: 500,
        unit: 'W'
      },
      {
        name: 'area',
        type: 'number',
        label: 'Surface (m²)',
        min: 0.5,
        max: 3.0,
        unit: 'm²'
      }
    ]
  },
  GENERATOR: {
    id: 'generator',
    category: 'PRODUCTION',
    name: 'Groupe électrogène',
    symbol: '⚙️',
    description: 'Production de secours',
    defaultParams: {
      power: 5000,
      voltage: 400,
      fuelType: 'diesel',
      autonomy: 8
    },
    normativeRef: 'NF C 15-100 Art. 551',
    editableFields: [
      {
        name: 'power',
        type: 'number',
        label: 'Puissance (kVA)',
        min: 5,
        max: 100,
        unit: 'kVA'
      },
      {
        name: 'fuelType',
        type: 'select',
        label: 'Type de carburant',
        options: ['diesel', 'essence', 'gaz']
      }
    ]
  }
};

/**
 * ⚡ H. MISES À LA TERRE
 */
const GROUNDS: Record<string, ObjectDefinition> = {
  GROUND_ROD: {
    id: 'ground_rod',
    category: 'GROUND',
    name: 'Piquet de terre',
    symbol: '↓',
    description: 'Électrode de terre verticale',
    defaultParams: {
      resistance: 10,
      length: 2.5,
      material: 'Cu'
    },
    normativeRef: 'NF C 15-100 Art. 541-542',
    editableFields: [
      {
        name: 'resistance',
        type: 'number',
        label: 'Résistance (Ω)',
        min: 1,
        max: 100,
        unit: 'Ω'
      },
      {
        name: 'length',
        type: 'number',
        label: 'Longueur (m)',
        min: 1.5,
        max: 3.0,
        unit: 'm'
      }
    ]
  },
  GROUND_LOOP: {
    id: 'ground_loop',
    category: 'GROUND',
    name: 'Boucle de terre',
    symbol: '○',
    description: 'Conducteur de terre en boucle',
    defaultParams: {
      resistance: 5,
      perimeter: 20,
      material: 'Cu'
    },
    normativeRef: 'NF C 15-100 Art. 541-542',
    editableFields: [
      {
        name: 'resistance',
        type: 'number',
        label: 'Résistance (Ω)',
        min: 1,
        max: 50,
        unit: 'Ω'
      },
      {
        name: 'perimeter',
        type: 'number',
        label: 'Périmètre (m)',
        min: 10,
        max: 50,
        unit: 'm'
      }
    ]
  }
};

/**
 * 🔌 E. CÂBLES & LIAISONS (OBJET CRITIQUE)
 */
const CABLES: Record<string, ObjectDefinition> = {
  CABLE_CU_15: {
    id: 'cable_cu_15',
    category: 'CABLE',
    name: 'Câble Cu 1,5 mm²',
    symbol: '─(Cu)',
    description: 'Conducteur cuivre 1,5 mm² - usage éclairage',
    defaultParams: {
      section: 1.5,
      material: 'Cu',
      modeOfInstallation: 'B1',
      temperatureAmbient: 30,
      grouping: 1
    },
    normativeRef: 'NF C 15-100 Art. 523-525 / Tableau 52C',
    editableFields: [
      {
        name: 'modeOfInstallation',
        type: 'select',
        label: 'Mode de pose (Art. 523)',
        options: ['A1', 'A2', 'B1', 'C', 'D', 'E', 'F', 'G']
      },
      {
        name: 'temperatureAmbient',
        type: 'number',
        label: 'Température ambiante (°C)',
        min: 10,
        max: 60,
        unit: '°C'
      },
      {
        name: 'grouping',
        type: 'select',
        label: 'Groupement de circuits',
        options: [1, 2, 3, 4, 6, 9]
      }
    ]
  },
  CABLE_CU_25: {
    id: 'cable_cu_25',
    category: 'CABLE',
    name: 'Câble Cu 2,5 mm²',
    symbol: '─(Cu)',
    description: 'Conducteur cuivre 2,5 mm² - usage prises',
    defaultParams: {
      section: 2.5,
      material: 'Cu',
      modeOfInstallation: 'B1',
      temperatureAmbient: 30,
      grouping: 1
    },
    normativeRef: 'NF C 15-100 Art. 523-525 / Tableau 52C',
    editableFields: [
      {
        name: 'modeOfInstallation',
        type: 'select',
        label: 'Mode de pose',
        options: ['A1', 'A2', 'B1', 'C', 'D', 'E', 'F', 'G']
      }
    ]
  },
  CABLE_CU_4: {
    id: 'cable_cu_4',
    category: 'CABLE',
    name: 'Câble Cu 4 mm²',
    symbol: '─(Cu)',
    description: 'Conducteur cuivre 4 mm² - usage moteurs/distributionI',
    defaultParams: {
      section: 4.0,
      material: 'Cu',
      modeOfInstallation: 'B1',
      temperatureAmbient: 30,
      grouping: 1
    },
    normativeRef: 'NF C 15-100 Art. 523-525 / Tableau 52C',
    editableFields: [
      {
        name: 'modeOfInstallation',
        type: 'select',
        label: 'Mode de pose',
        options: ['A1', 'A2', 'B1', 'C', 'D', 'E', 'F', 'G']
      }
    ]
  }
};

/**
 * 💡 F. RÉCEPTEURS & CHARGES
 */
const RECEPTORS: Record<string, ObjectDefinition> = {
  LIGHTING_LED: {
    id: 'lighting_led',
    category: 'RECEPTOR',
    name: 'Éclairage LED',
    symbol: '💡',
    description: 'Circuit(s) éclairage LED (cosφ ≈ 1)',
    defaultParams: {
      power: 100,
      cosφ: 1.0,
      usageFactor: 1.0,
      voltage: 230
    },
    normativeRef: 'NF C 15-100 Art. 525 / Tableau 52V',
    editableFields: [
      {
        name: 'power',
        type: 'number',
        label: 'Puissance (W)',
        min: 50,
        max: 5000,
        unit: 'W'
      },
      {
        name: 'cosφ',
        type: 'number',
        label: 'Facteur de puissance (cosφ)',
        min: 0.5,
        max: 1.0,
        unit: ''
      }
    ]
  },
  OUTLETS_16A: {
    id: 'outlets_16a',
    category: 'RECEPTOR',
    name: 'Prises de courant 16A',
    symbol: '🔌',
    description: 'Circuit(s) prises de courant usuelles',
    defaultParams: {
      power: 3680,
      cosφ: 0.8,
      voltage: 230,
      socketCount: 2
    },
    normativeRef: 'NF C 15-100 Art. 525 / Tableau 52V',
    editableFields: [
      {
        name: 'socketCount',
        type: 'number',
        label: 'Nombre de prises',
        min: 1,
        max: 10
      }
    ]
  },
  MOTOR_3KW: {
    id: 'motor_3kw',
    category: 'RECEPTOR',
    name: 'Moteur 3 kW triphasé',
    symbol: '⊗',
    description: 'Moteur asynchrone triphasé 3 kW (cosφ ≈ 0.8)',
    defaultParams: {
      power: 3000,
      cosφ: 0.8,
      efficiency: 0.85,
      voltage: 400
    },
    normativeRef: 'NF C 15-100 Art. 525 / CEI 60034',
    editableFields: [
      {
        name: 'power',
        type: 'number',
        label: 'Puissance (W)',
        min: 500,
        max: 50000,
        unit: 'W'
      },
      {
        name: 'efficiency',
        type: 'number',
        label: 'Rendement',
        min: 0.5,
        max: 0.95
      }
    ]
  },
  CHARGING_POINT: {
    id: 'charging_point',
    category: 'RECEPTOR',
    name: 'Borne de recharge VE',
    symbol: '🔋',
    description: 'Point de recharge pour véhicule électrique',
    defaultParams: {
      power: 7000,
      cosφ: 1.0,
      voltage: 230,
      type: 'wallbox'
    },
    normativeRef: 'NF C 15-100 Annexe G / NFC 15-100-1',
    editableFields: [
      {
        name: 'power',
        type: 'select',
        label: 'Puissance (W)',
        options: [3680, 7000, 11000, 22000]
      },
      {
        name: 'type',
        type: 'select',
        label: 'Type de borne',
        options: ['wallbox', 'pedestal', 'ground']
      }
    ]
  }
};

/**
 * 📦 CATALOGUE COMPLET
 * Groupement de toutes les catégories
 */
// Flatten all objects and index by their 'id' property
export const OBJECT_DEFINITIONS: Record<string, ObjectDefinition> = {};

// Build the flat definitions indexed by object.id (not by key)
[...Object.values(SOURCES), ...Object.values(PROTECTIONS), ...Object.values(DISTRIBUTIONS),
 ...Object.values(DERIVATIONS), ...Object.values(COUPURES), ...Object.values(RECEPTORS),
 ...Object.values(TRANSFORMATIONS), ...Object.values(PRODUCTIONS), ...Object.values(GROUNDS),
 ...Object.values(CABLES)]
  .forEach(obj => {
    OBJECT_DEFINITIONS[obj.id] = obj;
  });

/**
 * Grouper par catégorie pour UI
 */
export const OBJECTS_BY_CATEGORY = {
  SOURCE: Object.values(SOURCES),
  PROTECTION: Object.values(PROTECTIONS),
  DISTRIBUTION: Object.values(DISTRIBUTIONS),
  DERIVATION: Object.values(DERIVATIONS),
  COUPURE: Object.values(COUPURES),
  RECEPTOR: Object.values(RECEPTORS),
  TRANSFORMATION: Object.values(TRANSFORMATIONS),
  PRODUCTION: Object.values(PRODUCTIONS),
  GROUND: Object.values(GROUNDS),
  CABLE: Object.values(CABLES)
};

/**
 * Helper : obtenir définition par ID
 */
export function getObjectDefinition(id: string): ObjectDefinition | undefined {
  return OBJECT_DEFINITIONS[id];
}

/**
 * Helper : lister objets par catégorie
 */
export function getObjectsByCategory(category: string): ObjectDefinition[] {
  return Object.values(OBJECT_DEFINITIONS).filter(obj => obj.category === category);
}
