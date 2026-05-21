


/**
 * VoltageDropEngine — Moteur de calcul de chute de tension NF C 15-100
 *
 * Implémente la méthode du cahier des câbles :
 * ΔU = Coef × ρ × (L/S × cosφ + X × L × sinφ) × I
 * 
 * @author PROQUELEC Team
 * @version 1.0
 * @since Migration vers PostgreSQL local Docker - l'ancien système Supabase a été supprimé
 */
export class VoltageDropEngine {

  /**
   * Calcule la chute de tension pour tout le réseau
   * 
   * @param graph - Instance de GraphStore contenant les données du réseau électrique
   * @returns CalculationResult - Résultats du calcul de chute de tension
   * 
   * @description
   * Cette méthode filtre tous les câbles dans le graphe, calcule la chute de tension
   * pour chacun, puis agrège les résultats pour produire une valeur totale.
   */
  calculate(graph: GraphStore): CalculationResult {
    const edges = Array.from(graph.edges.values());
    const cableEdges = edges.filter((edge) => edge.type.includes('CABLE'));

    const results = cableEdges.map((edge) => {
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
    const compliant = results.every((result) => result.compliant);

    return {
      edges: results,
      totalNetworkDrop,
      compliant
    };
  }

  /**
   * Calcule la chute de tension pour un câble spécifique
   * 
   * @param edge - Objet représentant un câble avec ses propriétés (longueur, section, etc.)
   * @returns number - Chute de tension en volts
   * 
   * @description
   * Applique la formule : ΔU = Coef × ρ × (L/S × cosφ + X × L × sinφ) × I
   * avec des valeurs par défaut sécurisantes pour les paramètres manquants
   */
  private calculateEdgeDrop(edge: unknown): number {
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
    const deltaU = coef * rho * (length / section * cosPhi + X * length * sinPhi) * courant;

    return parseFloat(deltaU.toFixed(2));
  }

  /**
   * Calcule le pourcentage de chute de tension par rapport à la tension nominale
   * 
   * @param deltaU - Chute de tension absolue en volts
   * @param nominalVoltage - Tension nominale du circuit (par défaut 230V)
   * @returns number - Pourcentage de chute de tension arrondi à 2 décimales
   */
  private calculatePercentageDrop(deltaU: number, nominalVoltage: number): number {
    return parseFloat((deltaU / nominalVoltage * 100).toFixed(2));
  }

  /**
   * Détermine le coefficient selon le type de réseau (monophasé/triphasé)
   * 
   * @param edge - Objet représentant un câble
   * @returns number - Coefficient de réseau (actuellement 2 pour monophasé)
   * 
   * @todo Détecter automatiquement le type de réseau depuis les nœuds connectés
   */
  private getNetworkCoef(edge: unknown): number {
    // Pour l'instant, on suppose monophasé par défaut
    // TODO: Détecter automatiquement depuis les nœuds connectés
    return 2; // Monophasé
  }

  /**
   * Obtient la résistivité d'un matériau conducteur
   * 
   * @param material - Type de matériau ('Cu' pour cuivre, 'Al' pour aluminium)
   * @returns number - Résistivité en μΩ·m
   * 
   * @description
   * Valeurs selon la norme : Cuivre = 0.0178 μΩ·m, Aluminium = 0.0282 μΩ·m
   */
  private getResistivity(material: string): number {
    const resistivities: Record<string, number> = {
      'Cu': 0.0178, // Cuivre
      'Al': 0.0282 // Aluminium
    };

    return resistivities[material] || resistivities['Cu'];
  }

  /**
   * Valide la conformité réglementaire selon la norme NF C 15-100
   * 
   * @param percentage - Pourcentage de chute de tension calculée
   * @param usage - Type d'utilisation ('lighting', 'power', 'motor', 'heating')
   * @returns boolean - True si conforme, false sinon
   * 
   * @description
   * Selon la destination d'usage, les limites sont :
   * - Éclairage : 3%
   * - Prises de courant : 5%
   * - Moteurs : 5%
   * - Chauffage : 5%
   */
  validateCompliance(percentage: number, usage: string): boolean {
    // Limites selon NF C 15-100
    const limits: Record<string, number> = {
      'lighting': 3, // Éclairage
      'power': 5, // Prises de courant
      'motor': 5, // Moteurs
      'heating': 5 // Chauffage
    };

    const limit = limits[usage] || 5;
    return percentage <= limit;
  }
}