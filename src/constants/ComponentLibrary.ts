/**
 * 🧰 ComponentLibrary — Bibliothèque de composants électriques standardisés
 *
 * Catalogue complet de composants normalisés selon NF C 15-100 :
 * - Disjoncteurs et protections
 * - Câbles et sections
 * - Appareillages et récepteurs
 * - Sources et transformateurs
 *
 * Auto-configuration intelligente et compatibilité automatique.
 */

export interface ComponentDefinition {
  id: string;
  name: string;
  category: 'source' | 'protection' | 'distribution' | 'recepteur' | 'cable';
  type: string; // Type technique (breaker, cable, etc.)
  symbol: string; // Symbole électrique
  description: string;
  nfReference?: string; // Référence NF C 15-100

  // Propriétés électriques
  electrical: {
    tension?: number; // Tension nominale (V)
    courant?: number; // Courant nominal (A)
    puissance?: number; // Puissance (W/VA)
    section?: number; // Section câble (mm²)
    materiau?: 'Cu' | 'Al'; // Matériau câble
    protectionType?: string; // Type de protection
    sensitivity?: string; // Sensibilité
  };

  // Compatibilité
  compatibleWith?: string[]; // IDs de composants compatibles

  // Configuration automatique
  autoConfig?: {
    defaultSection?: number;
    defaultCourant?: number;
    recommendedProtection?: string;
  };
}

// ========== SOURCES D'ALIMENTATION ==========

export const SOURCES: ComponentDefinition[] = [
  {
    id: 'source_mono_230v',
    name: 'Source Monophasée 230V',
    category: 'source',
    type: 'SOURCE',
    symbol: '⚡',
    description: 'Alimentation monophasée standard 230V',
    nfReference: 'NF C 15-100 Article 411.1',
    electrical: {
      tension: 230,
      courant: 63, // Par défaut, extensible
      puissance: 14500 // 63A × 230V
    },
    autoConfig: {
      recommendedProtection: 'breaker_63a_c'
    }
  },
  {
    id: 'source_tri_400v',
    name: 'Source Triphasée 400V',
    category: 'source',
    type: 'SOURCE',
    symbol: '⚡⚡⚡',
    description: 'Alimentation triphasée 400V',
    nfReference: 'NF C 15-100 Article 411.2',
    electrical: {
      tension: 400,
      courant: 125,
      puissance: 86500 // 125A × 400V × √3 / √3
    },
    autoConfig: {
      recommendedProtection: 'breaker_125a_c'
    }
  },
  {
    id: 'transformateur_230_24',
    name: 'Transformateur 230V → 24V',
    category: 'source',
    type: 'TRANSFORMER',
    symbol: '🔄',
    description: 'Transformateur de séparation 230V vers 24V',
    nfReference: 'NF C 15-100 Article 551',
    electrical: {
      tension: 24,
      courant: 10,
      puissance: 240
    },
    autoConfig: {
      recommendedProtection: 'breaker_10a_b'
    }
  }
];

// ========== DISJONCTEURS ET PROTECTIONS ==========

export const BREAKERS: ComponentDefinition[] = [
  {
    id: 'breaker_6a_b',
    name: 'Disjoncteur 6A Courbe B',
    category: 'protection',
    type: 'BREAKER',
    symbol: '🚨',
    description: 'Disjoncteur 6A courbe B - Éclairage',
    nfReference: 'NF C 15-100 Article 534.2',
    electrical: {
      tension: 230,
      courant: 6,
      protectionType: 'B',
      sensitivity: 'éclairage'
    }
  },
  {
    id: 'breaker_10a_b',
    name: 'Disjoncteur 10A Courbe B',
    category: 'protection',
    type: 'BREAKER',
    symbol: '🚨',
    description: 'Disjoncteur 10A courbe B - Prises',
    nfReference: 'NF C 15-100 Article 534.2',
    electrical: {
      tension: 230,
      courant: 10,
      protectionType: 'B',
      sensitivity: 'prises'
    }
  },
  {
    id: 'breaker_16a_b',
    name: 'Disjoncteur 16A Courbe B',
    category: 'protection',
    type: 'BREAKER',
    symbol: '🚨',
    description: 'Disjoncteur 16A courbe B - Circuits spécialisés',
    nfReference: 'NF C 15-100 Article 534.2',
    electrical: {
      tension: 230,
      courant: 16,
      protectionType: 'B',
      sensitivity: 'spécialisé'
    }
  },
  {
    id: 'breaker_20a_c',
    name: 'Disjoncteur 20A Courbe C',
    category: 'protection',
    type: 'BREAKER',
    symbol: '🚨',
    description: 'Disjoncteur 20A courbe C - Moteurs',
    nfReference: 'NF C 15-100 Article 534.2',
    electrical: {
      tension: 230,
      courant: 20,
      protectionType: 'C',
      sensitivity: 'moteurs'
    }
  },
  {
    id: 'breaker_32a_c',
    name: 'Disjoncteur 32A Courbe C',
    category: 'protection',
    type: 'BREAKER',
    symbol: '🚨',
    description: 'Disjoncteur 32A courbe C - Équipements industriels',
    nfReference: 'NF C 15-100 Article 534.2',
    electrical: {
      tension: 230,
      courant: 32,
      protectionType: 'C',
      sensitivity: 'industriel'
    }
  },
  {
    id: 'breaker_63a_c',
    name: 'Disjoncteur 63A Courbe C',
    category: 'protection',
    type: 'BREAKER',
    symbol: '🚨',
    description: 'Disjoncteur 63A courbe C - Tableau principal',
    nfReference: 'NF C 15-100 Article 534.2',
    electrical: {
      tension: 230,
      courant: 63,
      protectionType: 'C',
      sensitivity: 'principal'
    }
  },
  {
    id: 'breaker_125a_c',
    name: 'Disjoncteur 125A Courbe C',
    category: 'protection',
    type: 'BREAKER',
    symbol: '🚨',
    description: 'Disjoncteur 125A courbe C - Forte puissance',
    nfReference: 'NF C 15-100 Article 534.2',
    electrical: {
      tension: 400,
      courant: 125,
      protectionType: 'C',
      sensitivity: 'forte_puissance'
    }
  }
];

// ========== CÂBLES ET CONDUCTEURS ==========

export const CABLES: ComponentDefinition[] = [
  {
    id: 'cable_cu_1_5',
    name: 'Câble Cuivre 1,5mm²',
    category: 'cable',
    type: 'CABLE_CU',
    symbol: '🧵',
    description: 'Câble cuivre 1,5mm² - Éclairage et prises',
    nfReference: 'NF C 15-100 Article 523.3',
    electrical: {
      section: 1.5,
      materiau: 'Cu',
      courant: 16 // Intensité admissible
    }
  },
  {
    id: 'cable_cu_2_5',
    name: 'Câble Cuivre 2,5mm²',
    category: 'cable',
    type: 'CABLE_CU',
    symbol: '🧵',
    description: 'Câble cuivre 2,5mm² - Circuits spécialisés',
    nfReference: 'NF C 15-100 Article 523.3',
    electrical: {
      section: 2.5,
      materiau: 'Cu',
      courant: 25
    }
  },
  {
    id: 'cable_cu_4',
    name: 'Câble Cuivre 4mm²',
    category: 'cable',
    type: 'CABLE_CU',
    symbol: '🧵',
    description: 'Câble cuivre 4mm² - Moteurs et équipements',
    nfReference: 'NF C 15-100 Article 523.3',
    electrical: {
      section: 4,
      materiau: 'Cu',
      courant: 32
    }
  },
  {
    id: 'cable_cu_6',
    name: 'Câble Cuivre 6mm²',
    category: 'cable',
    type: 'CABLE_CU',
    symbol: '🧵',
    description: 'Câble cuivre 6mm² - Forte puissance',
    nfReference: 'NF C 15-100 Article 523.3',
    electrical: {
      section: 6,
      materiau: 'Cu',
      courant: 40
    }
  },
  {
    id: 'cable_cu_10',
    name: 'Câble Cuivre 10mm²',
    category: 'cable',
    type: 'CABLE_CU',
    symbol: '🧵',
    description: 'Câble cuivre 10mm² - Distribution principale',
    nfReference: 'NF C 15-100 Article 523.3',
    electrical: {
      section: 10,
      materiau: 'Cu',
      courant: 63
    }
  },
  {
    id: 'cable_al_16',
    name: 'Câble Aluminium 16mm²',
    category: 'cable',
    type: 'CABLE_AL',
    symbol: '🧶',
    description: 'Câble aluminium 16mm² - Distribution aérienne',
    nfReference: 'NF C 15-100 Article 523.3',
    electrical: {
      section: 16,
      materiau: 'Al',
      courant: 63
    }
  }
];

// ========== RÉCEPTEURS ET APPAREILLAGES ==========

export const RECEPTEURS: ComponentDefinition[] = [
  {
    id: 'outlets_16a',
    name: 'Prises 16A',
    category: 'recepteur',
    type: 'RECEPTOR',
    symbol: '🔌',
    description: 'Prises de courant 16A - Circuits ordinaires',
    nfReference: 'NF C 15-100 Article 522.3',
    electrical: {
      tension: 230,
      courant: 16,
      puissance: 3680
    },
    autoConfig: {
      defaultCourant: 16,
      defaultSection: 1.5
    }
  },
  {
    id: 'lighting_6a',
    name: 'Éclairage 6A',
    category: 'recepteur',
    type: 'RECEPTOR',
    symbol: '💡',
    description: 'Circuit d\'éclairage - 6A maximum',
    nfReference: 'NF C 15-100 Article 522.2',
    electrical: {
      tension: 230,
      courant: 6,
      puissance: 1380
    },
    autoConfig: {
      defaultCourant: 6,
      defaultSection: 1.5
    }
  },
  {
    id: 'motor_20a',
    name: 'Moteur 20A',
    category: 'recepteur',
    type: 'RECEPTOR',
    symbol: '⚙️',
    description: 'Moteur électrique monophasé',
    nfReference: 'NF C 15-100 Article 551.3',
    electrical: {
      tension: 230,
      courant: 20,
      puissance: 4600
    },
    autoConfig: {
      defaultCourant: 20,
      defaultSection: 2.5,
      recommendedProtection: 'breaker_20a_c'
    }
  },
  {
    id: 'heater_32a',
    name: 'Chauffage 32A',
    category: 'recepteur',
    type: 'RECEPTOR',
    symbol: '🔥',
    description: 'Appareil de chauffage électrique',
    nfReference: 'NF C 15-100 Article 551.2',
    electrical: {
      tension: 230,
      courant: 32,
      puissance: 7360
    },
    autoConfig: {
      defaultCourant: 32,
      defaultSection: 4,
      recommendedProtection: 'breaker_32a_c'
    }
  }
];

// ========== DISTRIBUTION ==========

export const DISTRIBUTION: ComponentDefinition[] = [
  {
    id: 'tableau_principal',
    name: 'Tableau de Répartition Principal',
    category: 'distribution',
    type: 'TABLEAU',
    symbol: '📦',
    description: 'Tableau de répartition principal',
    nfReference: 'NF C 15-100 Article 536',
    electrical: {
      tension: 230,
      courant: 63
    }
  },
  {
    id: 'tableau_secondaire',
    name: 'Tableau Divisionnaire',
    category: 'distribution',
    type: 'TABLEAU',
    symbol: '📦',
    description: 'Tableau divisionnaire secondaire',
    nfReference: 'NF C 15-100 Article 537',
    electrical: {
      tension: 230,
      courant: 32
    }
  }
];

// ========== CATALOGUE COMPLET ==========

export const COMPONENT_LIBRARY: ComponentDefinition[] = [
  ...SOURCES,
  ...BREAKERS,
  ...CABLES,
  ...RECEPTEURS,
  ...DISTRIBUTION
];

// ========== UTILITAIRES ==========

export class ComponentLibrary {
  /**
   * Trouver un composant par ID
   */
  static findById(id: string): ComponentDefinition | undefined {
    return COMPONENT_LIBRARY.find(comp => comp.id === id);
  }

  /**
   * Trouver composants par catégorie
   */
  static findByCategory(category: ComponentDefinition['category']): ComponentDefinition[] {
    return COMPONENT_LIBRARY.filter(comp => comp.category === category);
  }

  /**
   * Trouver composants compatibles
   */
  static findCompatible(componentId: string): ComponentDefinition[] {
    const component = this.findById(componentId);
    if (!component?.compatibleWith) return [];

    return component.compatibleWith
      .map(id => this.findById(id))
      .filter(Boolean) as ComponentDefinition[];
  }

  /**
   * Recommander une protection pour un récepteur
   */
  static recommendProtection(recepteur: ComponentDefinition): ComponentDefinition | undefined {
    if (recepteur.category !== 'recepteur') return undefined;

    const courant = recepteur.electrical.courant || 10;
    const puissance = recepteur.electrical.puissance || 0;

    // Logique de recommandation basée sur NF C 15-100
    if (puissance > 2000 || courant > 10) {
      // Forte puissance → Courbe C
      return BREAKERS.find(b =>
        b.electrical.courant! >= courant &&
        b.electrical.protectionType === 'C'
      );
    } else {
      // Puissance normale → Courbe B
      return BREAKERS.find(b =>
        b.electrical.courant! >= courant &&
        b.electrical.protectionType === 'B'
      );
    }
  }

  /**
   * Recommander une section de câble
   */
  static recommendCableSection(courant: number, materiau: 'Cu' | 'Al' = 'Cu'): ComponentDefinition | undefined {
    const cables = materiau === 'Cu' ? CABLES.filter(c => c.type === 'CABLE_CU') : CABLES.filter(c => c.type === 'CABLE_AL');

    return cables.find(cable =>
      cable.electrical.courant! >= courant
    );
  }

  /**
   * Valider compatibilité entre composants
   */
  static validateCompatibility(sourceId: string, targetId: string): {
    compatible: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const source = this.findById(sourceId);
    const target = this.findById(targetId);

    if (!source || !target) {
      return {
        compatible: false,
        issues: ['Composant non trouvé'],
        recommendations: []
      };
    }

    const issues: string[] = [];
    const recommendations: string[] = [];

    // Vérifier tension
    if (source.electrical.tension && target.electrical.tension &&
        source.electrical.tension !== target.electrical.tension) {
      issues.push(`Tension incompatible: ${source.electrical.tension}V vs ${target.electrical.tension}V`);
    }

    // Vérifier courant
    if (source.electrical.courant && target.electrical.courant &&
        source.electrical.courant < target.electrical.courant) {
      issues.push(`Courant source insuffisant: ${source.electrical.courant}A vs ${target.electrical.courant}A`);
    }

    // Recommandations
    if (target.category === 'recepteur') {
      const protection = this.recommendProtection(target);
      if (protection) {
        recommendations.push(`Protection recommandée: ${protection.name}`);
      }

      const cable = this.recommendCableSection(target.electrical.courant || 10);
      if (cable) {
        recommendations.push(`Câble recommandé: ${cable.name}`);
      }
    }

    return {
      compatible: issues.length === 0,
      issues,
      recommendations
    };
  }
}

export default ComponentLibrary;
