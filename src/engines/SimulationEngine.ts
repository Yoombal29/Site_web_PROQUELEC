/**
 * ⚡ SimulationEngine — Moteur de simulation avancée
 *
 * Simulations électriques spécialisées selon normes :
 * - Court-circuit : Calcul des courants de défaut (NF C 15-100)
 * - Coordination des protections : Selectivité et discrimination
 * - Analyse harmonique : Perturbations non-linéaires
 * - Flux de puissance : Répartition des charges
 *
 * Architecture modulaire avec solveurs spécialisés.
 */

import { GraphStore } from '@/stores/GraphStore';

export interface ShortCircuitResult {
  faultLocation: string;
  faultCurrent: number; // Courant de défaut (kA)
  faultVoltage: number; // Tension au point de défaut (V)
  protectionTime: number; // Temps de déclenchement (ms)
  protectionDevice: string; // Disjoncteur qui intervient
  selectivity: boolean; // Coordination respectée
  recommendations: string[];
}

export interface CoordinationResult {
  protectionChain: ProtectionDevice[];
  selectivityMatrix: boolean[][];
  criticalPoints: string[];
  recommendations: string[];
  compliance: 'CONFORME' | 'AVERTISSEMENT' | 'NON_CONFORME';
}

export interface HarmonicAnalysis {
  thd: number; // Taux de distorsion harmonique total (%)
  harmonics: { order: number; amplitude: number; phase: number }[];
  sources: string[]; // Équipements non-linéaires
  mitigation: string[]; // Solutions recommandées
  compliance: boolean;
}

export interface PowerFlowResult {
  nodeVoltages: Map<string, number>;
  branchCurrents: Map<string, number>;
  powerLosses: Map<string, number>;
  loadBalance: number; // Facteur d'équilibrage
  recommendations: string[];
}

export interface ProtectionDevice {
  id: string;
  type: 'breaker' | 'fuse' | 'relay';
  curve: 'B' | 'C' | 'D' | 'K';
  current: number; // Courant nominal (A)
  timeMultiplier: number; // Multiplicateur de temps
}

// ========== SIMULATION COURT-CIRCUIT ==========

export class ShortCircuitEngine {
  /**
   * Calcul du courant de court-circuit en un point
   */
  static calculateShortCircuit(graph: GraphStore, faultNodeId: string): ShortCircuitResult {
    const faultNode = graph.nodes.get(faultNodeId);
    if (!faultNode) {
      throw new Error(`Nœud de défaut ${faultNodeId} non trouvé`);
    }

    // Simulation simplifiée du calcul de court-circuit
    // En réalité, utiliserait des méthodes plus sophistiquées

    // Trouver la source la plus proche
    const sourcePath = this.findSourcePath(graph, faultNodeId);
    if (sourcePath.length === 0) {
      return {
        faultLocation: faultNodeId,
        faultCurrent: 0,
        faultVoltage: 0,
        protectionTime: 0,
        protectionDevice: 'Aucun',
        selectivity: false,
        recommendations: ['Aucune source trouvée pour ce circuit']
      };
    }

    // Calcul du courant de court-circuit (simplifié)
    const sourceNode = graph.nodes.get(sourcePath[sourcePath.length - 1]);
    const nominalCurrent = sourceNode?.params?.courant || 63; // A
    const faultCurrent = nominalCurrent * 10; // Approximation ×10 pour court-circuit

    // Trouver la protection la plus proche
    const protection = this.findNearestProtection(graph, faultNodeId);
    const protectionTime = protection ? this.calculateTrippingTime(protection, faultCurrent) : 0;

    // Vérifier la sélectivité
    const selectivity = this.checkSelectivity(graph, faultNodeId, protection?.id);

    const recommendations: string[] = [];
    if (faultCurrent > 1000) { // > 1kA
      recommendations.push('Risque élevé - Vérifier la tenue des équipements');
    }
    if (!selectivity) {
      recommendations.push('Problème de sélectivité détecté');
    }

    return {
      faultLocation: faultNodeId,
      faultCurrent,
      faultVoltage: 0, // Calcul simplifié
      protectionTime,
      protectionDevice: protection?.id || 'Aucun',
      selectivity,
      recommendations
    };
  }

  private static findSourcePath(graph: GraphStore, startNodeId: string): string[] {
    // Recherche BFS pour trouver le chemin vers une source
    const visited = new Set<string>();
    const queue: { nodeId: string; path: string[] }[] = [
      { nodeId: startNodeId, path: [startNodeId] }
    ];

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const node = graph.nodes.get(nodeId);
      if (node?.type === 'SOURCE') {
        return path;
      }

      // Explorer les connexions
      for (const [edgeId, edge] of graph.edges) {
        if (edge.from === nodeId && !visited.has(edge.to)) {
          queue.push({ nodeId: edge.to, path: [...path, edge.to] });
        }
        if (edge.to === nodeId && !visited.has(edge.from)) {
          queue.push({ nodeId: edge.from, path: [...path, edge.from] });
        }
      }
    }

    return [];
  }

  private static findNearestProtection(graph: GraphStore, nodeId: string): ProtectionDevice | null {
    // Recherche de la protection la plus proche en amont
    const path = this.findSourcePath(graph, nodeId);
    for (const pathNodeId of path.reverse()) {
      const node = graph.nodes.get(pathNodeId);
      if (node?.type === 'BREAKER') {
        return {
          id: pathNodeId,
          type: 'breaker',
          curve: node.params?.curve || 'C',
          current: node.params?.courant || 10,
          timeMultiplier: 1
        };
      }
    }
    return null;
  }

  private static calculateTrippingTime(protection: ProtectionDevice, faultCurrent: number): number {
    // Calcul simplifié du temps de déclenchement
    const ratio = faultCurrent / protection.current;

    if (protection.type === 'breaker') {
      // Courbe C approximative
      if (ratio < 2) return 0; // Pas de déclenchement
      if (ratio < 5) return 100; // ms
      if (ratio < 10) return 50;
      return 20; // Très rapide
    }

    return 0;
  }

  private static checkSelectivity(graph: GraphStore, faultNodeId: string, protectionId?: string): boolean {
    // Vérification simplifiée de la sélectivité
    if (!protectionId) return false;

    // Vérifier qu'il n'y a pas de protection en amont qui déclencherait plus rapidement
    const path = this.findSourcePath(graph, faultNodeId);
    for (const nodeId of path) {
      if (nodeId !== protectionId) {
        const node = graph.nodes.get(nodeId);
        if (node?.type === 'BREAKER') {
          return false; // Protection en amont détectée
        }
      }
    }

    return true;
  }
}

// ========== SIMULATION COORDINATION ==========

export class CoordinationEngine {
  /**
   * Analyse de la coordination des protections
   */
  static analyzeCoordination(graph: GraphStore): CoordinationResult {
    const protections = this.extractProtectionDevices(graph);
    const selectivityMatrix = this.buildSelectivityMatrix(protections);
    const criticalPoints = this.identifyCriticalPoints(selectivityMatrix);

    let compliance: 'CONFORME' | 'AVERTISSEMENT' | 'NON_CONFORME' = 'CONFORME';
    const recommendations: string[] = [];

    if (criticalPoints.length > 0) {
      compliance = 'NON_CONFORME';
      recommendations.push('Points de non-sélectivité détectés');
      recommendations.push('Revoir le dimensionnement des protections');
    }

    // Vérifier les ratios de courant
    protections.forEach((prot, i) => {
      const downstreamProtections = this.findDownstreamProtections(graph, prot.id);
      downstreamProtections.forEach(downstream => {
        const ratio = downstream.current / prot.current;
        if (ratio > 0.8) {
          compliance = compliance === 'CONFORME' ? 'AVERTISSEMENT' : compliance;
          recommendations.push(`Ratio de courant critique: ${ratio.toFixed(2)} entre ${prot.id} et ${downstream.id}`);
        }
      });
    });

    return {
      protectionChain: protections,
      selectivityMatrix,
      criticalPoints,
      recommendations,
      compliance
    };
  }

  private static extractProtectionDevices(graph: GraphStore): ProtectionDevice[] {
    const protections: ProtectionDevice[] = [];

    for (const [nodeId, node] of graph.nodes) {
      if (node.type === 'BREAKER') {
        protections.push({
          id: nodeId,
          type: 'breaker',
          curve: node.params?.curve || 'C',
          current: node.params?.courant || 10,
          timeMultiplier: node.params?.timeMultiplier || 1
        });
      }
    }

    return protections;
  }

  private static buildSelectivityMatrix(protections: ProtectionDevice[]): boolean[][] {
    const matrix: boolean[][] = [];

    for (let i = 0; i < protections.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < protections.length; j++) {
        if (i === j) {
          matrix[i][j] = true; // Sélectif avec lui-même
        } else {
          // Vérifier si les courbes sont sélectives
          matrix[i][j] = this.checkCurveSelectivity(protections[i], protections[j]);
        }
      }
    }

    return matrix;
  }

  private static checkCurveSelectivity(prot1: ProtectionDevice, prot2: ProtectionDevice): boolean {
    // Logique simplifiée de vérification de sélectivité
    const ratio = prot2.current / prot1.current;

    if (prot1.curve === 'B' && prot2.curve === 'C') {
      return ratio >= 1.5;
    }
    if (prot1.curve === 'C' && prot2.curve === 'D') {
      return ratio >= 2;
    }

    return ratio >= 1.2; // Règle générale
  }

  private static identifyCriticalPoints(matrix: boolean[][]): string[] {
    const criticalPoints: string[] = [];

    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (!matrix[i][j]) {
          criticalPoints.push(`${i}-${j}`);
        }
      }
    }

    return criticalPoints;
  }

  private static findDownstreamProtections(graph: GraphStore, protectionId: string): ProtectionDevice[] {
    // Trouver les protections en aval
    const downstream: ProtectionDevice[] = [];
    const visited = new Set<string>();

    const explore = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = graph.nodes.get(nodeId);
      if (node?.type === 'BREAKER' && nodeId !== protectionId) {
        downstream.push({
          id: nodeId,
          type: 'breaker',
          curve: node.params?.curve || 'C',
          current: node.params?.courant || 10,
          timeMultiplier: 1
        });
      }

      // Explorer les connexions sortantes
      for (const [edgeId, edge] of graph.edges) {
        if (edge.from === nodeId) {
          explore(edge.to);
        }
      }
    };

    explore(protectionId);
    return downstream;
  }
}

// ========== SIMULATION HARMONIQUES ==========

export class HarmonicEngine {
  /**
   * Analyse des harmoniques
   */
  static analyzeHarmonics(graph: GraphStore): HarmonicAnalysis {
    // Équipements susceptibles de générer des harmoniques
    const harmonicSources = this.identifyHarmonicSources(graph);

    let thd = 0;
    const harmonics: { order: number; amplitude: number; phase: number }[] = [];

    if (harmonicSources.length > 0) {
      // Calcul simplifié du THD
      thd = harmonicSources.length * 5; // 5% par source non-linéaire

      // Harmoniques typiques
      harmonics.push(
        { order: 3, amplitude: thd * 0.3, phase: 0 },
        { order: 5, amplitude: thd * 0.2, phase: 180 },
        { order: 7, amplitude: thd * 0.1, phase: 0 },
        { order: 9, amplitude: thd * 0.05, phase: 180 }
      );
    }

    const mitigation: string[] = [];
    if (thd > 8) {
      mitigation.push('Installer des filtres harmoniques');
      mitigation.push('Utiliser des transformateurs avec écran électrostatique');
    } else if (thd > 5) {
      mitigation.push('Surveiller l\'évolution des harmoniques');
    }

    return {
      thd,
      harmonics,
      sources: harmonicSources,
      mitigation,
      compliance: thd <= 8 // Limite NF C 15-100
    };
  }

  private static identifyHarmonicSources(graph: GraphStore): string[] {
    const sources: string[] = [];

    for (const [nodeId, node] of graph.nodes) {
      // Équipements non-linéaires courants
      if (node.type === 'RECEPTOR') {
        const equipment = node.params?.equipment;
        if (equipment?.includes('variateur') ||
            equipment?.includes('onduleur') ||
            equipment?.includes('led') ||
            equipment?.includes('chargeur')) {
          sources.push(nodeId);
        }
      }
    }

    return sources;
  }
}

// ========== SIMULATION FLUX DE PUISSANCE ==========

export class PowerFlowEngine {
  /**
   * Analyse du flux de puissance
   */
  static analyzePowerFlow(graph: GraphStore): PowerFlowResult {
    const nodeVoltages = new Map<string, number>();
    const branchCurrents = new Map<string, number>();
    const powerLosses = new Map<string, number>();

    // Simulation simplifiée du flux de puissance
    // En réalité, utiliserait des méthodes d'analyse de réseau

    // Tension nominale de référence
    const nominalVoltage = 230; // V

    // Calculer les courants dans chaque branche
    for (const [edgeId, edge] of graph.edges) {
      if (edge.type.includes('CABLE')) {
        const current = edge.properties.courant || 10;
        branchCurrents.set(edgeId, current);

        // Calcul des pertes (P = R × I²)
        const resistance = this.calculateResistance(edge);
        const losses = resistance * current * current;
        powerLosses.set(edgeId, losses);

        // Estimation de la chute de tension
        const voltageDrop = current * resistance;
        const voltage = nominalVoltage - voltageDrop;
        nodeVoltages.set(edge.to, voltage);
      }
    }

    // Calcul de l'équilibrage des charges
    const loadBalance = this.calculateLoadBalance(graph);

    const recommendations: string[] = [];
    if (loadBalance > 1.2) {
      recommendations.push('Déséquilibre de charge détecté');
      recommendations.push('Rééquilibrer les phases');
    }

    // Vérifier les tensions
    for (const [nodeId, voltage] of nodeVoltages) {
      const deviation = Math.abs(voltage - nominalVoltage) / nominalVoltage;
      if (deviation > 0.03) { // > 3%
        recommendations.push(`Tension hors tolérance au nœud ${nodeId}`);
      }
    }

    return {
      nodeVoltages,
      branchCurrents,
      powerLosses,
      loadBalance,
      recommendations
    };
  }

  private static calculateResistance(edge: any): number {
    const longueur = edge.properties.length || 0;
    const section = edge.properties.section || 1.5;
    const materiau = edge.properties.materiau || 'Cu';

    const resistivite = materiau === 'Cu' ? 0.0175 : 0.0280;
    return (2 * longueur * resistivite) / section;
  }

  private static calculateLoadBalance(graph: GraphStore): number {
    // Calcul simplifié du facteur d'équilibrage
    let totalLoad = 0;
    let maxPhaseLoad = 0;

    for (const [nodeId, node] of graph.nodes) {
      if (node.type === 'RECEPTOR') {
        const load = node.params?.puissance || 1000; // W
        totalLoad += load;
        maxPhaseLoad = Math.max(maxPhaseLoad, load);
      }
    }

    if (totalLoad === 0) return 1;

    // Facteur d'équilibrage (1 = parfait, >1 = déséquilibré)
    return maxPhaseLoad / (totalLoad / 3);
  }
}

// ========== MOTEUR PRINCIPAL ==========

export class SimulationEngine {
  /**
   * Simulation complète du court-circuit
   */
  static simulateShortCircuit(graph: GraphStore, faultNodeId: string): ShortCircuitResult {
    return ShortCircuitEngine.calculateShortCircuit(graph, faultNodeId);
  }

  /**
   * Analyse de coordination des protections
   */
  static analyzeProtectionCoordination(graph: GraphStore): CoordinationResult {
    return CoordinationEngine.analyzeCoordination(graph);
  }

  /**
   * Analyse harmonique
   */
  static analyzeHarmonics(graph: GraphStore): HarmonicAnalysis {
    return HarmonicEngine.analyzeHarmonics(graph);
  }

  /**
   * Analyse du flux de puissance
   */
  static analyzePowerFlow(graph: GraphStore): PowerFlowResult {
    return PowerFlowEngine.analyzePowerFlow(graph);
  }

  /**
   * Simulation complète du système
   */
  static runCompleteSimulation(graph: GraphStore): {
    shortCircuit: ShortCircuitResult[];
    coordination: CoordinationResult;
    harmonics: HarmonicAnalysis;
    powerFlow: PowerFlowResult;
    overallCompliance: 'CONFORME' | 'AVERTISSEMENT' | 'NON_CONFORME';
  } {
    // Simuler court-circuit sur tous les nœuds récepteurs
    const shortCircuitResults: ShortCircuitResult[] = [];
    for (const [nodeId, node] of graph.nodes) {
      if (node.type === 'RECEPTOR') {
        try {
          shortCircuitResults.push(this.simulateShortCircuit(graph, nodeId));
        } catch (error) {
          console.warn(`Simulation court-circuit échouée pour ${nodeId}:`, error);
        }
      }
    }

    const coordination = this.analyzeProtectionCoordination(graph);
    const harmonics = this.analyzeHarmonics(graph);
    const powerFlow = this.analyzePowerFlow(graph);

    // Évaluation globale
    let overallCompliance: 'CONFORME' | 'AVERTISSEMENT' | 'NON_CONFORME' = 'CONFORME';

    if (coordination.compliance === 'NON_CONFORME' ||
        !harmonics.compliance ||
        powerFlow.recommendations.length > 3) {
      overallCompliance = 'NON_CONFORME';
    } else if (coordination.compliance === 'AVERTISSEMENT' ||
               powerFlow.recommendations.length > 0) {
      overallCompliance = 'AVERTISSEMENT';
    }

    return {
      shortCircuit: shortCircuitResults,
      coordination,
      harmonics,
      powerFlow,
      overallCompliance
    };
  }
}

export default SimulationEngine;