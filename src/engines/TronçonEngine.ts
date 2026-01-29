/**
 * ⚡ TronçonEngine — Calcul Normatif par Tronçon
 * 
 * Chaque tronçon = segment de câble entre deux appareils
 * Calcul automatique basé sur :
 * - Longueur (extraite du canvas)
 * - Section (mm²)
 * - Matériau (Cu/Al)
 * - Courant (A)
 * 
 * Norme : NF C 15-100 Articles 523, 525
 * 
 * Formules :
 * - Chute tension : ΔU = (2 × L × I × ρ) / S
 * - Échauffement thermique : P = I² × R
 * - Conformité : ΔU ≤ 3% pour alimentation, ≤ 5% circuit
 */

export interface Tronçon {
  id: string;
  name: string;
  from: string; // ID nœud source
  to: string;   // ID nœud destination
  
  // Paramètres physiques
  longueur: number;      // mètres
  section: number;       // mm²
  materiau: 'Cu' | 'Al'; // Cuivre ou Aluminium
  courant: number;       // Ampères (nominal)
  modeInstallation: string; // Encastré, apparent, etc.
  
  // Résultats de calcul
  resultats?: {
    chuteTension: number;      // Volts
    chuteTensionPercent: number; // % (référence 230V monophasé)
    resistance: number;        // Ohms
    puissance: number;         // Watts
    conformiteChute: boolean;
    conformiteThermique: boolean;
    conformity: 'CONFORME' | 'AVERTISSEMENT' | 'NON_CONFORME';
    issues: string[];
    message: string;
  };
}

export class TronçonEngine {
  // Résistivité à 20°C (Ω·mm²/m)
  private static RESISTIVITE = {
    'Cu': 0.0175,  // Cuivre
    'Al': 0.0280   // Aluminium
  };

  /**
   * Calculer les paramètres d'un tronçon
   * Applique les normes NF C 15-100 Article 523 & 525
   */
  static calculate(tronçon: Tronçon): Tronçon {
    const { longueur, section, materiau, courant } = tronçon;

    // ========== CALCUL CHUTE DE TENSION ==========
    const resistivite = this.RESISTIVITE[materiau];
    const resistance = (2 * longueur * resistivite) / section;
    const chuteTension = courant * resistance; // U = I × R

    // Pourcentage par rapport à 230V (standard France)
    const chuteTensionPercent = (chuteTension / 230) * 100;

    // ========== CALCUL THERMIQUE ==========
    const puissance = courant * courant * resistance;

    // Température limite selon norme (exemple: 70°C pour plastique PVC)
    const tempLimiteAdmissible = 70;

    // ========== VÉRIFICATION CONFORMITÉ NF C 15-100 ==========
    // Article 523 : Chute tension ≤ 3% entre source et tableau principal
    //              ≤ 5% entre tableau principal et point d'utilisation
    const conformiteChute = chuteTensionPercent <= 3; // On applique 3% (strict)

    // Article 525 : Protection contre surcharges
    // Le conducteur doit supporter le courant nominal sans échauffement excessif
    const conformiteThermique = puissance <= 50; // Limite arbitraire (watts)

    // Déterminer conformity globale
    let conformity: 'CONFORME' | 'AVERTISSEMENT' | 'NON_CONFORME' = 'CONFORME';
    const issues: string[] = [];

    if (!conformiteChute || !conformiteThermique) {
      conformity = 'NON_CONFORME';
      if (!conformiteChute) issues.push(`Chute ${chuteTensionPercent.toFixed(2)}% > 3%`);
      if (!conformiteThermique) issues.push(`Puissance ${puissance.toFixed(1)}W > 50W`);
    } else if (chuteTensionPercent > 2.5 || puissance > 40) {
      conformity = 'AVERTISSEMENT';
    }

    // Message de résultat
    let message = '';
    if (conformity === 'CONFORME') {
      message = `✅ CONFORME (ΔU: ${chuteTension.toFixed(2)}V, P: ${puissance.toFixed(1)}W)`;
    } else if (conformity === 'AVERTISSEMENT') {
      message = `⚠️ AVERTISSEMENT (proche des limites)`;
    } else {
      message = `❌ NON CONFORME (${issues.join(', ')})`;
    }

    tronçon.resultats = {
      chuteTension,
      chuteTensionPercent,
      resistance,
      puissance,
      conformiteChute,
      conformiteThermique,
      conformity,
      issues,
      message
    };

    return tronçon;
  }

  /**
   * Calculer multiple tronçons et retourner verdict global
   */
  static calculateAll(tronçons: Tronçon[]): {
    tronçons: Tronçon[];
    verdict: 'CONFORME' | 'NON_CONFORME' | 'AVERTISSEMENT';
    chuteMax: number;
    puissanceMax: number;
    issues: string[];
  } {
    // Calculer chaque tronçon
    const calculated = tronçons.map(t => this.calculate(t));

    // Extraire statistiques
    const chuteMax = Math.max(...calculated.map(t => t.resultats?.chuteTensionPercent ?? 0));
    const puissanceMax = Math.max(...calculated.map(t => t.resultats?.puissance ?? 0));
    const nonConformes = calculated.filter(t => 
      t.resultats?.conformity === 'NON_CONFORME'
    );

    // Déterminer verdict
    let verdict: 'CONFORME' | 'NON_CONFORME' | 'AVERTISSEMENT' = 'CONFORME';
    const issues: string[] = [];

    if (nonConformes.length > 0) {
      verdict = 'NON_CONFORME';
      nonConformes.forEach(t => {
        issues.push(...(t.resultats?.issues || []));
      });
    } else {
      const avertissements = calculated.filter(t => t.resultats?.conformity === 'AVERTISSEMENT');
      if (avertissements.length > 0) {
        verdict = 'AVERTISSEMENT';
        issues.push('Certains tronçons approchent les limites normatives');
      }
    }

    return {
      tronçons: calculated,
      verdict,
      chuteMax,
      puissanceMax,
      issues
    };
  }

  /**
   * Recommandations : quelle section minimale pour un tronçon donné ?
   */
  static recommendSection(longueur: number, courant: number, materiau: 'Cu' | 'Al'): {
    sectionMin: number;
    sections: number[]; // Sections standards disponibles
  } {
    const resistivite = this.RESISTIVITE[materiau];

    // Inverse formula : S = (2 × L × I × ρ) / ΔU
    // On applique ΔU = 3% de 230V = 6.9V
    const deltaUMax = 6.9;
    const sectionMin = (2 * longueur * courant * resistivite) / deltaUMax;

    // Sections standards (mm²) disponibles
    const sectionsStandard = [1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
    const sections = sectionsStandard.filter(s => s >= sectionMin);

    return {
      sectionMin,
      sections: sections.length > 0 ? sections : [sectionsStandard[sectionsStandard.length - 1]]
    };
  }
}
