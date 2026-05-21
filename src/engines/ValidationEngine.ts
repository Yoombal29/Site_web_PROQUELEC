/**
 * 🔍 ValidationEngine — Validation temps réel des schémas électriques
 *
 * Règles de validation automatique selon normes NF C 15-100 :
 * - Compatibilité des sections et courants
 * - Conformité des chutes de tension
 * - Sécurité des installations
 * - Cohérence des composants
 */

import { GraphNode, GraphEdge } from '@/stores/GraphStore';

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: 'electrical' | 'safety' | 'normative' | 'compatibility';
  severity: 'error' | 'warning' | 'info';
  condition: (graph: unknown, node?: unknown, edge?: unknown) => boolean;
  message: (context?: unknown) => string;
  fix?: (graph: unknown, target: unknown) => void;
  references?: string[]; // Articles NF C 15-100
}

export interface ValidationResult {
  ruleId: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  targetId?: string; // node or edge id
  targetType?: 'node' | 'edge';
  fixable: boolean;
  references?: string[];
}

export class ValidationEngine {
  private static rules: ValidationRule[] = [];

  /**
   * Enregistrer une nouvelle règle de validation
   */
  static registerRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  /**
   * Valider tout le graphe
   */
  static validateGraph(graph: unknown): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Validation globale
    for (const rule of this.rules) {
      if (rule.condition(graph)) {
        results.push({
          ruleId: rule.id,
          severity: rule.severity,
          message: rule.message(),
          fixable: !!rule.fix,
          references: rule.references
        });
      }
    }

    // Validation par nœud
    for (const [nodeId, node] of graph.nodes.entries()) {
      for (const rule of this.rules) {
        if (rule.condition(graph, node)) {
          results.push({
            ruleId: rule.id,
            severity: rule.severity,
            message: rule.message({ node }),
            targetId: nodeId,
            targetType: 'node',
            fixable: !!rule.fix,
            references: rule.references
          });
        }
      }
    }

    // Validation par arête
    for (const [edgeId, edge] of graph.edges.entries()) {
      for (const rule of this.rules) {
        if (rule.condition(graph, null, edge)) {
          results.push({
            ruleId: rule.id,
            severity: rule.severity,
            message: rule.message({ edge }),
            targetId: edgeId,
            targetType: 'edge',
            fixable: !!rule.fix,
            references: rule.references
          });
        }
      }
    }

    return results;
  }

  /**
   * Valider un composant spécifique
   */
  static validateComponent(graph: unknown, componentId: string, type: 'node' | 'edge'): ValidationResult[] {
    const results: ValidationResult[] = [];
    const component = type === 'node' ? graph.nodes.get(componentId) : graph.edges.get(componentId);

    if (!component) return results;

    for (const rule of this.rules) {
      const isValid = type === 'node' ?
      rule.condition(graph, component) :
      rule.condition(graph, null, component);

      if (!isValid) {
        results.push({
          ruleId: rule.id,
          severity: rule.severity,
          message: rule.message({ [type]: component }),
          targetId: componentId,
          targetType: type,
          fixable: !!rule.fix,
          references: rule.references
        });
      }
    }

    return results;
  }

  /**
   * Appliquer une correction automatique
   */
  static applyFix(graph: unknown, result: ValidationResult): boolean {
    const rule = this.rules.find((r) => r.id === result.ruleId);
    if (!rule?.fix || !result.targetId) return false;

    const target = result.targetType === 'node' ?
    graph.nodes.get(result.targetId) :
    graph.edges.get(result.targetId);

    if (!target) return false;

    rule.fix(graph, target);
    return true;
  }

  /**
   * Obtenir les statistiques de validation
   */
  static getValidationStats(results: ValidationResult[]): {
    errors: number;
    warnings: number;
    infos: number;
    fixable: number;
  } {
    return {
      errors: results.filter((r) => r.severity === 'error').length,
      warnings: results.filter((r) => r.severity === 'warning').length,
      infos: results.filter((r) => r.severity === 'info').length,
      fixable: results.filter((r) => r.fixable).length
    };
  }
}

// ========== RÈGLES DE VALIDATION PRÉDÉFINIES ==========

// Règle 1: Connexion à la terre obligatoire
ValidationEngine.registerRule({
  id: 'ground-connection-required',
  name: 'Connexion à la terre',
  description: 'Tout circuit doit être relié à la terre',
  category: 'safety',
  severity: 'error',
  condition: (graph) => {
    // Vérifier qu'il y a au moins un nœud de terre
    const hasGround = Array.from(graph.nodes.values()).some((node) =>
    (node as GraphNode).type === 'GROUND' || (node as GraphNode).params?.objectId?.includes('terre')
    );
    return !hasGround;
  },
  message: () => 'Aucun point de terre détecté dans le schéma',
  references: ['NF C 15-100 Article 411.1']
});

// Règle 2: Compatibilité section/courant
ValidationEngine.registerRule({
  id: 'section-current-compatibility',
  name: 'Compatibilité section/courant',
  description: 'La section doit supporter le courant nominal',
  category: 'electrical',
  severity: 'error',
  condition: (graph, node, edge) => {
    if (!edge) return false;

    const section = edge.properties.section || 1.5;
    const courant = edge.properties.courant || 10;

    // Table de compatibilité simplifiée (valeurs approximatives)
    const maxCurrents: Record<number, number> = {
      1.5: 16, // 1.5mm² → 16A
      2.5: 25, // 2.5mm² → 25A
      4: 32, // 4mm² → 32A
      6: 40, // 6mm² → 40A
      10: 63 // 10mm² → 63A
    };

    const maxCurrent = maxCurrents[section] || section * 10; // Approximation
    return courant > maxCurrent;
  },
  message: (context) => {
    const edge = context?.edge;
    const section = edge?.properties?.section || 1.5;
    const courant = edge?.properties?.courant || 10;
    return `Section ${section}mm² insuffisante pour ${courant}A`;
  },
  fix: (graph, edge) => {
    // Suggestion de section minimale
    const courant = edge.properties.courant || 10;
    let suggestedSection = 1.5;
    if (courant <= 16) suggestedSection = 1.5;else
    if (courant <= 25) suggestedSection = 2.5;else
    if (courant <= 32) suggestedSection = 4;else
    if (courant <= 40) suggestedSection = 6;else
    suggestedSection = 10;

    edge.properties.section = suggestedSection;
  },
  references: ['NF C 15-100 Article 523.3']
});

// Règle 3: Chute de tension excessive
ValidationEngine.registerRule({
  id: 'voltage-drop-excessive',
  name: 'Chute de tension excessive',
  description: 'La chute de tension ne doit pas dépasser 3%',
  category: 'normative',
  severity: 'warning',
  condition: (graph, node, edge) => {
    if (!edge) return false;

    // Calcul rapide de chute de tension
    const longueur = edge.properties.length || 0;
    const section = edge.properties.section || 1.5;
    const courant = edge.properties.courant || 10;
    const materiau = edge.properties.materiau || 'Cu';

    const resistivite = materiau === 'Cu' ? 0.0175 : 0.0280;
    const resistance = 2 * longueur * resistivite / section;
    const chuteTension = courant * resistance;
    const chutePercent = chuteTension / 230 * 100;

    return chutePercent > 3;
  },
  message: (context) => {
    const edge = context?.edge;
    const longueur = edge?.properties?.length || 0;
    const section = edge?.properties?.section || 1.5;
    const courant = edge?.properties?.courant || 10;

    const materiau = edge?.properties?.materiau || 'Cu';
    const resistivite = materiau === 'Cu' ? 0.0175 : 0.0280;
    const resistance = 2 * longueur * resistivite / section;
    const chuteTension = courant * resistance;
    const chutePercent = chuteTension / 230 * 100;

    return `Chute de tension ${chutePercent.toFixed(2)}% > 3% (limite NF C 15-100)`;
  },
  references: ['NF C 15-100 Article 523.1']
});

// Règle 4: Nœud isolé
ValidationEngine.registerRule({
  id: 'isolated-node',
  name: 'Nœud isolé',
  description: 'Tout nœud doit être connecté au réseau',
  category: 'compatibility',
  severity: 'warning',
  condition: (graph, node) => {
    if (!node) return false;

    // Vérifier si le nœud a des connexions
    const connectedEdges = Array.from(graph.edges.values()).filter((edge) =>
    (edge as GraphEdge).from === node.id || (edge as GraphEdge).to === node.id
    );

    return connectedEdges.length === 0;
  },
  message: (context) => {
    const node = context?.node;
    return `Le nœud "${node?.type || 'inconnu'}" n'est connecté à aucun câble`;
  },
  references: ['NF C 15-100 Article 411.2']
});

// Règle 5: Source sans protection
ValidationEngine.registerRule({
  id: 'source-without-protection',
  name: 'Source sans protection',
  description: 'Toute source doit être protégée',
  category: 'safety',
  severity: 'error',
  condition: (graph, node) => {
    if (!node || node.type !== 'SOURCE') return false;

    // Vérifier qu'il y a un disjoncteur en aval
    const connectedEdges = Array.from(graph.edges.values()).filter((edge) =>
    (edge as GraphEdge).from === node.id
    );

    // Pour chaque connexion, vérifier qu'il y a un nœud de protection
    for (const edge of connectedEdges) {
      const targetNode = graph.nodes.get((edge as GraphEdge).to);
      if ((targetNode as GraphNode)?.type === 'BREAKER') {
        return false; // Protégé
      }
    }

    return true; // Non protégé
  },
  message: () => 'Source électrique non protégée par un disjoncteur',
  references: ['NF C 15-100 Article 411.3']
});

export default ValidationEngine;