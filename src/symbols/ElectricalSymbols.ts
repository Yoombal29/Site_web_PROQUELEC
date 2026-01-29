/**
 * 🏠 ElectricalSymbols — Symboles et icônes réalistes
 * 
 * Représentation visuelle des appareils électriques
 * Inspiration : Cedreo.com, normes NF C 15-100
 * 
 * Types d'appareils :
 * - Maison (habitation)
 * - Transformateur
 * - Coffret CCPC (courant continu)
 * - Coffret CCPI (courant principal)
 * - Distributeur
 * - Niche électrique
 * - Câbles/Conducteurs
 * - Prises/Points de distribution
 */

export interface ElectricalSymbol {
  id: string;
  name: string;
  icon: string; // SVG inline ou emoji
  color: string;
  category: 'source' | 'distribution' | 'protection' | 'installation' | 'component';
  description: string;
  params: {
    tension: number; // Volts
    courant?: number; // Ampères
    puissance?: number; // Watts/VA
    section?: number; // mm² (pour câbles)
  };
}

export const ELECTRICAL_SYMBOLS: Record<string, ElectricalSymbol> = {
  // ========== SOURCES ==========
  'MAISON': {
    id: 'MAISON',
    name: 'Maison (Source)',
    icon: '🏠',
    color: '#3b82f6', // Bleu
    category: 'source',
    description: 'Habitation individuelle - Point de raccordement au réseau ENEDIS',
    params: {
      tension: 230,
      puissance: 6000 // 6 kVA typique
    }
  },
  'TRANSFORMATEUR': {
    id: 'TRANSFORMATEUR',
    name: 'Transformateur',
    icon: '⚡',
    color: '#ef4444', // Rouge
    category: 'source',
    description: 'Abaisseur de tension HT/BT',
    params: {
      tension: 230,
      courant: 63
    }
  },

  // ========== DISTRIBUTION ==========
  'COFFRET_CCPC': {
    id: 'COFFRET_CCPC',
    name: 'Coffret CCPC',
    icon: '📦',
    color: '#8b5cf6', // Violet
    category: 'distribution',
    description: 'Coffret de commande et contrôle - Point collectif',
    params: {
      tension: 230,
      courant: 63
    }
  },
  'COFFRET_CCPI': {
    id: 'COFFRET_CCPI',
    name: 'Coffret CCPI',
    icon: '⚙️',
    color: '#ec4899', // Rose
    category: 'distribution',
    description: 'Coffret de contrôle principal - Point individuel',
    params: {
      tension: 230,
      courant: 45
    }
  },
  'DISTRIBUTEUR': {
    id: 'DISTRIBUTEUR',
    name: 'Distributeur',
    icon: '🔌',
    color: '#14b8a6', // Teal
    category: 'distribution',
    description: 'Point de distribution secondaire',
    params: {
      tension: 230,
      courant: 32
    }
  },

  // ========== PROTECTION ==========
  'DISJONCTEUR': {
    id: 'DISJONCTEUR',
    name: 'Disjoncteur',
    icon: '🚨',
    color: '#f59e0b', // Orange
    category: 'protection',
    description: 'Protection contre les surcharges et court-circuits',
    params: {
      tension: 230,
      courant: 16
    }
  },
  'PRISE_TERRE': {
    id: 'PRISE_TERRE',
    name: 'Prise de terre',
    icon: '⏚',
    color: '#6b7280', // Gris
    category: 'protection',
    description: 'Mise à la terre de sécurité',
    params: {
      tension: 0
    }
  },

  // ========== INSTALLATIONS ==========
  'NICHE_ELECTRIQUE': {
    id: 'NICHE_ELECTRIQUE',
    name: 'Niche électrique',
    icon: '📭',
    color: '#818181', // Gris foncé
    category: 'installation',
    description: 'Boîtier encastré pour appareillage',
    params: {
      tension: 230
    }
  },
  'ECP_3D': {
    id: 'ECP_3D',
    name: 'ECP 3D',
    icon: '📍',
    color: '#059669', // Vert
    category: 'installation',
    description: 'Embrochable pour circuits particuliers',
    params: {
      tension: 230,
      courant: 20
    }
  },
  'BOITE_DERIVATION': {
    id: 'BOITE_DERIVATION',
    name: 'Boîte de dérivation',
    icon: '📤',
    color: '#7c3aed', // Violet
    category: 'installation',
    description: 'Point de jonction de câbles',
    params: {
      tension: 230
    }
  },

  // ========== COMPOSANTS ==========
  'CABLE_CU': {
    id: 'CABLE_CU',
    name: 'Câble Cuivre',
    icon: '🧵',
    color: '#ea8c55', // Orange/Cuivre
    category: 'component',
    description: 'Conducteur cuivre - Excellent conductivité',
    params: {
      tension: 230,
      section: 2.5 // mm² par défaut
    }
  },
  'CABLE_AL': {
    id: 'CABLE_AL',
    name: 'Câble Aluminium',
    icon: '🧶',
    color: '#c0c0c0', // Argent/Aluminium
    category: 'component',
    description: 'Conducteur aluminium - Léger',
    params: {
      tension: 230,
      section: 4 // mm² par défaut
    }
  },
  'PRISE': {
    id: 'PRISE',
    name: 'Prise standard',
    icon: '🔌',
    color: '#14b8a6',
    category: 'component',
    description: 'Prise de courant 16A ou 20A',
    params: {
      tension: 230,
      courant: 16
    }
  },
  'INTERRUPTEUR': {
    id: 'INTERRUPTEUR',
    name: 'Interrupteur',
    icon: '💡',
    color: '#fbbf24', // Jaune
    category: 'component',
    description: 'Commande d\'appareil',
    params: {
      tension: 230,
      courant: 10
    }
  },

  // ========== PROTECTIONS ==========
  'DDR': {
    id: 'DDR',
    name: 'DDR (Détecteur de Défaut)',
    icon: '⚡⚠️',
    color: '#ef4444', // Rouge
    category: 'protection',
    description: 'Protection contre les défauts à la terre',
    params: {
      tension: 230,
      courant: 30
    }
  },
  'FUSIBLE': {
    id: 'FUSIBLE',
    name: 'Fusible',
    icon: '🔥',
    color: '#f97316', // Orange
    category: 'protection',
    description: 'Protection par fusion',
    params: {
      tension: 400,
      courant: 10
    }
  },

  // ========== COUPURES ==========
  'SECTIONNEUR': {
    id: 'SECTIONNEUR',
    name: 'Sectionneur',
    icon: '✂️',
    color: '#6b7280', // Gris
    category: 'protection',
    description: 'Dispositif de sectionnement visible',
    params: {
      tension: 400,
      courant: 125
    }
  },

  // ========== TRANSFORMATION ==========
  'CONVERTISSEUR': {
    id: 'CONVERTISSEUR',
    name: 'Convertisseur',
    icon: '↔️',
    color: '#8b5cf6', // Violet
    category: 'component',
    description: 'Conversion de tension ou fréquence',
    params: {
      tension: 400,
      puissance: 1000
    }
  },

  // ========== PRODUCTION ==========
  'PANNEAU_SOL': {
    id: 'PANNEAU_SOL',
    name: 'Panneau solaire',
    icon: '☀️',
    color: '#eab308', // Jaune solaire
    category: 'source',
    description: 'Production photovoltaïque',
    params: {
      tension: 48,
      puissance: 300
    }
  },
  'GENERATEUR': {
    id: 'GENERATEUR',
    name: 'Groupe électrogène',
    icon: '⚙️',
    color: '#374151', // Gris foncé
    category: 'source',
    description: 'Production de secours',
    params: {
      tension: 400,
      puissance: 5000
    }
  },

  // ========== MISES À LA TERRE ==========
  'PIQUET_TERRE': {
    id: 'PIQUET_TERRE',
    name: 'Piquet de terre',
    icon: '↓',
    color: '#16a34a', // Vert
    category: 'component',
    description: 'Électrode verticale de terre',
    params: {
      resistance: 10
    }
  },
  'BOUCLE_TERRE': {
    id: 'BOUCLE_TERRE',
    name: 'Boucle de terre',
    icon: '○',
    color: '#16a34a', // Vert
    category: 'component',
    description: 'Conducteur de terre en boucle',
    params: {
      resistance: 5
    }
  },

  // ========== RÉCEPTEURS ==========
  'MOTEUR': {
    id: 'MOTEUR',
    name: 'Moteur électrique',
    icon: '⊗',
    color: '#3b82f6', // Bleu
    category: 'component',
    description: 'Moteur asynchrone triphasé',
    params: {
      tension: 400,
      puissance: 3000
    }
  },
  'BORNE_RECHARGE': {
    id: 'BORNE_RECHARGE',
    name: 'Borne de recharge VE',
    icon: '🔋',
    color: '#10b981', // Vert émeraude
    category: 'component',
    description: 'Point de recharge véhicule électrique',
    params: {
      tension: 230,
      puissance: 7000
    }
  },

  // ========== CÂBLES ==========
  'CABLE': {
    id: 'CABLE',
    name: 'Câble électrique',
    icon: '─',
    color: '#ea8c55', // Orange cuivre
    category: 'component',
    description: 'Conducteur électrique',
    params: {
      tension: 230,
      section: 2.5
    }
  }
};

/**
 * Obtenir un symbole par son ID
 */
export function getSymbol(symbolId: string): ElectricalSymbol | undefined {
  return ELECTRICAL_SYMBOLS[symbolId];
}

/**
 * Lister les symboles par catégorie
 */
export function getSymbolsByCategory(category: ElectricalSymbol['category']): ElectricalSymbol[] {
  return Object.values(ELECTRICAL_SYMBOLS).filter(s => s.category === category);
}

/**
 * Obtenir la couleur d'un symbole
 */
export function getSymbolColor(symbolId: string): string {
  return ELECTRICAL_SYMBOLS[symbolId]?.color || '#94a3b8';
}

/**
 * Obtenir l'icône d'un symbole
 */
export function getSymbolIcon(symbolId: string): string {
  return ELECTRICAL_SYMBOLS[symbolId]?.icon || '❓';
}

/**
 * Tous les symboles disponibles
 */
export function getAllSymbols(): ElectricalSymbol[] {
  return Object.values(ELECTRICAL_SYMBOLS);
}

/**
 * Recommandation section câble selon courant et distance
 */
export function recommendCableSection(courant: number, longueur: number): {
  cu: number;
  al: number;
} {
  // Recommandations basées sur chute tension max 3%
  // ΔU% = (2 × L × I × ρ) / (U × S)
  // Résistivités : Cu = 0.0175, Al = 0.0280 Ω·mm²/m
  
  const deltaUMax = 6.9; // 3% de 230V en Volts

  // S = (2 × L × I × ρ) / ΔU
  const sectionCu = (2 * longueur * courant * 0.0175) / deltaUMax;
  const sectionAl = (2 * longueur * courant * 0.0280) / deltaUMax;

  // Arrondir aux sections standards
  const standardSections = [1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150];
  
  const findClosest = (value: number) => {
    return standardSections.find(s => s >= value) || standardSections[standardSections.length - 1];
  };

  return {
    cu: findClosest(sectionCu),
    al: findClosest(sectionAl)
  };
}
