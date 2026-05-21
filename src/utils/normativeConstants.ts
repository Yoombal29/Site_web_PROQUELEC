/*
NORMATIVE CONSTANTS & UTILITIES
NS 01-001 / NFC 15-100 — Chapitre 52
*/

// Voltage drop limits according to NS 01-001 / NFC 15-100 Art 525 - Tableau 52V
export const VOLTAGE_DROP_LIMITS = {
  A: { lighting: 0.03, other: 0.05 }, // Type A: réseau public BT
  B: { lighting: 0.06, other: 0.08 }  // Type B: poste HT/BT ou TGBT
};

// Linear reactance (Ω/m) - Standard BT cables ≤ 1 kV
export const LINEAR_REACTANCE = 0.00008; // λ = 0.08 mΩ/m = 0.00008 Ω/m

// Normalized conductor sections (mm²) - NS 01-001
export const NORMALIZED_SECTIONS = [
  1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70,
  95, 120, 150, 185, 240, 300, 400, 500, 630
];

// Thermal correction factors according to NS 01-001
export const THERMAL_FACTORS = {
  // k1 — Ambient temperature (PVC 70°C)
  temperature: {
    30: 1.00,
    35: 0.94,
    40: 0.87,
    45: 0.79,
    50: 0.71,
    55: 0.61,
    60: 0.50
  },

  // k2 — Circuit grouping
  grouping: {
    1: 1.00,
    2: 0.80,
    3: 0.70
  },

  // k3 — Installation method (Tableaux 52-C à 52-G)
  installation: {
    'A1': 1.00,  // Tubes, parois, vides de construction (référence)
    'A2': 0.90,  // Tubes, parois, vides de construction (2 circuits/group)
    'B1': 0.85,  // Fixation directe mur/plafond (référence)
    'B2': 0.75,  // Fixation directe mur/plafond (2 circuits/group)
    'C': 0.80,   // Sur plaque ou dans gouttière
    'D1': 0.75,  // Dans sol ou mur (conduits enterrés)
    'D2': 0.65,  // Dans sol ou mur (conduits enterrés multiples)
    'E': 0.60,   // En saillie ou sur échelle
    'F': 0.50,   // Sans protection mécanique
    'G': 0.45    // En caniveau ou galerie
  }
};

// Base Iz values for PVC 70°C, mode B1, 30°C (simplified normative tables)
export const BASE_IZ_VALUES = {
  copper: {
    1.5: 13, 2.5: 18, 4: 25, 6: 32, 10: 44, 16: 57, 25: 76, 35: 94,
    50: 115, 70: 146, 95: 175, 120: 201, 150: 234, 185: 267, 240: 316,
    300: 361, 400: 441, 500: 513, 630: 606
  },
  aluminum: {
    16: 49, 25: 66, 35: 81, 50: 99, 70: 126, 95: 151, 120: 173,
    150: 201, 185: 228, 240: 269, 300: 310, 400: 378, 500: 437, 630: 516
  }
};

// Resistivity values according to NS 01-001 / NFC 15-100 Art 525
export const RESISTIVITY_VALUES = {
  // At 20°C: Cuivre ρ = 0.0175, Aluminium ρ = 0.028 Ω·mm²/m
  at20C: {
    copper: 0.0175,
    aluminum: 0.028
  },
  // Service conditions (normal): ρ_service = 1.25 × ρ_20°C
  service: {
    copper: 0.023,    // 0.0175 × 1.25
    aluminum: 0.037   // 0.028 × 1.25
  }
};

/**
 * Get resistivity based on conductor type and ambient temperature
 * @param conductorType - 'copper' or 'aluminum'
 * @param ambientTemp - Temperature in °C
 * @returns Resistivity in Ω·mm²/m
 */
export const getResistivity = (conductorType: string, ambientTemp: number): number => {
  const rho20C = RESISTIVITY_VALUES.at20C[conductorType as keyof typeof RESISTIVITY_VALUES.at20C];

  // Si température ambiante = 20°C, utiliser ρ_20°C directement
  // Sinon, utiliser ρ_service_normal = 1.25 × ρ_20°C
  return ambientTemp === 20 ? rho20C : rho20C * 1.25;
};

/**
 * Check thermal compliance according to NS 01-001 Section 523
 * @param I - Current in A
 * @param S - Cross section in mm²
 * @param conductorType - Conductor material
 * @param modeOfInstallation - Installation method
 * @param ambientTemp - Ambient temperature in °C
 * @param insulationType - Insulation type
 * @param numCircuits - Number of circuits
 * @returns Object with izCorrected and isCompliant
 */
export const checkThermalCompliance = (
  I: number,
  S: number,
  conductorType: string,
  modeOfInstallation: string,
  ambientTemp: number,
  insulationType: string,
  numCircuits: number
): { izCorrected: number, isCompliant: boolean } => {

  const izTable = BASE_IZ_VALUES[conductorType as keyof typeof BASE_IZ_VALUES]?.[S];
  if (!izTable) return { izCorrected: 0, isCompliant: false };

  const k1 = THERMAL_FACTORS.temperature[ambientTemp as keyof typeof THERMAL_FACTORS.temperature] || 1.00;
  const k2 = THERMAL_FACTORS.grouping[numCircuits as keyof typeof THERMAL_FACTORS.grouping] || 0.70;
  const k3 = THERMAL_FACTORS.installation[modeOfInstallation as keyof typeof THERMAL_FACTORS.installation] || 1.00;

  const izCorrected = izTable * k1 * k2 * k3;
  const isCompliant = izCorrected >= I;

  return { izCorrected, isCompliant };
};

/**
 * Validate if a section is normalized according to NS 01-001
 * @param S - Cross section in mm²
 * @returns True if normalized
 */
export const isNormalizedSection = (S: number): boolean => {
  return NORMALIZED_SECTIONS.includes(S);
};

/**
 * Get voltage drop limit according to NS 01-001 Table 52V
 * @param alimentationType - 'A' or 'B'
 * @param installationType - 'lighting' or 'other'
 * @param length - Circuit length in m
 * @returns Limit as percentage
 */
export const getVoltageDropLimit = (
  alimentationType: 'A' | 'B',
  installationType: 'lighting' | 'other',
  length: number
): number => {
  let baseLimit = VOLTAGE_DROP_LIMITS[alimentationType][installationType];

  // Correction for L > 100 m
  if (length > 100) {
    const additional = Math.min(0.005 * (length - 100) / 100, 0.005); // 0.005% per meter, max +0.5%
    baseLimit += additional;
  }

  return baseLimit;
};
