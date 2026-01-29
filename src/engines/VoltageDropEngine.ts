import { GraphStore } from '@/stores/GraphStore';
import { CalculationResult } from '@/app/AppStore';

/**
 * VoltageDropEngine — Moteur de calcul de chute de tension NF C 15-100
 *
 * Implémente la méthode du cahier des câbles :
 * ΔU = Coef × ρ × (L/S × cosφ + X × L × sinφ) × I
 */
export class VoltageDropEngine {

  /**
   * Calcule la chute de tension pour tout le réseau
   */
  calculate(graph: GraphStore): CalculationResult {
    const edges = Array.from(graph.edges.values());
    const cableEdges = edges.filter(edge => edge.type.includes('CABLE'));

    const results = cableEdges.map(edge => {
      const deltaU = this.calculateEdgeDrop(edge);
      const percentage = this.calculatePercentageDrop(deltaU, 230); // Tension de référence
      const compliant = percentage <= 5; // Limite réglementaire

      return {
        id: edge.id,
        deltaU,
        percentage,
        compliant
      };
    });

    const totalNetworkDrop = results.reduce((sum, result) => sum + result.deltaU, 0);
    const compliant = results.every(result => result.compliant);

    return {
      edges: results,
      totalNetworkDrop,
      compliant
    };
  }

  /**
   * Calcule la chute de tension pour un câble spécifique
   */
  private calculateEdgeDrop(edge: any): number {
    const {
      length = 0,
      section = 1.5,
      courant = 0,
      materiau = 'Cu'
    } = edge.properties;

    if (length === 0 || section === 0 || courant === 0) {
      return 0;
    }

    // Coefficient réseau (mono/triphasé)
    const coef = this.getNetworkCoef(edge);

    // Résistivité du matériau
    const rho = this.getResistivity(materiau);

    // Facteur de puissance (cosφ ≈ 0.8 pour usages domestiques)
    const cosPhi = 0.8;
    const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);

    // Réactance (négligeable pour basses fréquences)
    const X = 0; // Pour calcul simplifié

    // Formule NF C 15-100 : ΔU = Coef × ρ × (L/S × cosφ + X × L × sinφ) × I
    const deltaU = coef * rho * ((length / section) * cosPhi + X * length * sinPhi) * courant;

    return parseFloat(deltaU.toFixed(2));
  }

  /**
   * Calcule le pourcentage de chute
   */
  private calculatePercentageDrop(deltaU: number, nominalVoltage: number): number {
    return parseFloat(((deltaU / nominalVoltage) * 100).toFixed(2));
  }

  /**
   * Coefficient selon le type de réseau
   */
  private getNetworkCoef(edge: any): number {
    // Pour l'instant, on suppose monophasé par défaut
    // TODO: Détecter automatiquement depuis les nœuds connectés
    return 2; // Monophasé
  }

  /**
   * Résistivité des matériaux (μΩ·m)
   */
  private getResistivity(material: string): number {
    const resistivities: Record<string, number> = {
      'Cu': 0.0178,  // Cuivre
      'Al': 0.0282   // Aluminium
    };

    return resistivities[material] || resistivities['Cu'];
  }

  /**
   * Valide la conformité réglementaire
   */
  validateCompliance(percentage: number, usage: string): boolean {
    // Limites selon NF C 15-100
    const limits: Record<string, number> = {
      'lighting': 3,    // Éclairage
      'power': 5,       // Prises de courant
      'motor': 5,       // Moteurs
      'heating': 5      // Chauffage
    };

    const limit = limits[usage] || 5;
    return percentage <= limit;
  }
}