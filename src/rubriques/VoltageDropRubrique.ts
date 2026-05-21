/**
 * 🔴 RUBRIQUE 1 — CALCUL DE CHUTE DE TENSION
 * 
 * Moteur métier pour calcul normatif selon NF C 15-100 (Articles 523 / 525)
 * Responsable : Calcul indépendant, validations strictes, rapports précis
 */

import type {

  CalculationEngine } from







'@/types/Rubrique';
import type { GraphNode, GraphStore } from '@/stores/GraphStore';
import { OBJECT_DEFINITIONS } from '@/constants/ObjectLibrary';
import { NetworkEngine } from '@/engines/NetworkEngine';

/**
 * Génère un nom lisible pour un nœud basé sur son type
 */
function getReadableNodeName(node: GraphNode, graph: Graph): string {
  // Compteurs par type pour numéroter séquentiellement
  const typeCounters: Record<string, number> = {};

  // Compter tous les nœuds du même type avant celui-ci
  for (const [id, otherNode] of graph.nodes) {
    if (otherNode.type === node.type && id !== node.id) {
      typeCounters[node.type] = (typeCounters[node.type] || 0) + 1;
    }
  }

  const count = (typeCounters[node.type] || 0) + 1;

  // Mapping des types vers des noms lisibles
  const typeNames: Record<string, string> = {
    'SOURCE': 'Source',
    'PROTECTION': 'Protection',
    'DISTRIBUTION': 'Distribution',
    'DERIVATION': 'Dérivation',
    'COUPURE': 'Coupure',
    'RECEPTOR': 'Récepteur',
    'TRANSFORMATION': 'Transformation',
    'PRODUCTION': 'Production',
    'GROUND': 'Terre',
    'CABLE': 'Câble'
  };

  const baseName = typeNames[node.type] || 'Noeud';
  return `${baseName}${count}`;
}

/**
 * Moteur de calcul pour chute de tension
 */
class VoltageDropEngine implements CalculationEngine {
  name = 'VoltageDropCalculator';
  version = '1.0.0';

  properties = {
    supportsBatchCalculation: true,
    supportsScenarios: false,
    supportsComparison: true,
    estimatedCalculationTime: 100
  };

  /**
   * Valider le graphe avant calcul
   */
  validate(graph: Graph): ValidationResult {
    const errors = [];
    const warnings = [];

    // Au moins une source
    const sources = Array.from(graph.nodes.values()).filter((n: GraphNode) =>
    n.type === 'SOURCE' || (n.id as string).includes('source')
    );
    if (sources.length === 0) {
      errors.push({
        id: 'NO_SOURCE',
        severity: 'ERROR',
        message: 'Au moins une source est requise'
      });
    }

    // Au moins une charge
    const loads = Array.from(graph.nodes.values()).filter((n: GraphNode) =>
    n.type === 'RECEPTOR' || (n.id as string).includes('load')
    );
    if (loads.length === 0) {
      warnings.push({
        id: 'NO_LOAD',
        severity: 'WARNING',
        message: 'Aucune charge détectée'
      });
    }

    // Vérifier les paramètres des nœuds
    for (const node of graph.nodes.values() as IterableIterator<GraphNode>) {
      if (!node.params?.section || !node.params?.length) {
        warnings.push({
          id: `INCOMPLETE_NODE_${node.id}`,
          severity: 'WARNING',
          message: `Nœud ${getReadableNodeName(node, graph)} : paramètres incomplets (section/longueur)`,
          nodeId: node.id
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, 100 - errors.length * 20 - warnings.length * 10)
    };
  }

  /**
   * Effectuer les calculs selon méthodologie NF C 15-100 complète
   */
  calculate(graph: Graph): CalculationResult {
    try {
      // Utiliser le NetworkEngine pour calcul complet de réseau
      const networkResult: NetworkResult = NetworkEngine.calculateNetwork(graph as unknown as GraphStore);

      const metrics = [];
      const details = {
        chemins: networkResult.chemins,
        cheminPlusDefavorise: networkResult.cheminPlusDefavorise,
        tronçons: networkResult.tronçonsCalcules,
        chuteMax: networkResult.chuteMax,
        chuteMaxPercent: networkResult.chuteMaxPercent,
        recommandations: networkResult.recommandations,
        verdictGlobal: networkResult.verdictGlobal
      };

      // Métriques principales
      metrics.push({
        name: 'Chute de tension maximale',
        value: networkResult.chuteMaxPercent,
        unit: '%',
        status: networkResult.chuteMaxPercent <= 3 ? 'OK' : networkResult.chuteMaxPercent <= 5 ? 'WARNING' : 'ERROR',
        normative: 'NF C 15-100 Art. 523 : ≤ 3% (éclairage) / ≤ 5% (autres)'
      });

      metrics.push({
        name: 'Tension chutée maximale',
        value: networkResult.chuteMax,
        unit: 'V',
        status: networkResult.chuteMax <= 11.5 ? 'OK' : networkResult.chuteMax <= 19.2 ? 'WARNING' : 'ERROR',
        normative: '230V × 5% = 11.5V limite / 230V × 8.3% = 19.2V avertissement'
      });

      metrics.push({
        name: 'Nombre de chemins',
        value: networkResult.chemins.length,
        unit: 'chemins',
        status: 'OK'
      });

      metrics.push({
        name: 'Nombre de tronçons',
        value: networkResult.tronçonsCalcules.length,
        unit: 'tronçons',
        status: 'OK'
      });

      // Métriques par chemin critique
      if (networkResult.cheminPlusDefavorise) {
        metrics.push({
          name: 'Longueur chemin critique',
          value: networkResult.cheminPlusDefavorise.longueurTotale,
          unit: 'm',
          status: networkResult.cheminPlusDefavorise.longueurTotale <= 50 ? 'OK' : 'WARNING'
        });
      }

      return {
        rubriquId: 'VOLTAGE_DROP',
        timestamp: Date.now(),
        metrics,
        verdict: networkResult.verdictGlobal === 'AVERTISSEMENT' ? 'NON_CONFORME' : networkResult.verdictGlobal,
        details,
        graphHash: graph.getHash()
      };

    } catch (error) {
      console.error('Erreur calcul réseau:', error);

      // Retour en cas d'erreur
      return {
        rubriquId: 'VOLTAGE_DROP',
        timestamp: Date.now(),
        metrics: [{
          name: 'Erreur de calcul',
          value: 0,
          unit: 'N/A',
          status: 'ERROR',
          normative: 'Calcul impossible - vérifier la topologie du réseau'
        }],
        verdict: 'NON_CONFORME',
        details: { error: error.message },
        graphHash: graph.getHash()
      };
    }
  }

  /**
   * Générer un rapport détaillé selon cahier des câbles
   */
  generateReport(result: CalculationResult): Report {
    const details = result.details as unknown;

    // Vérifier si c'est un résultat NetworkResult
    if (details.error) {
      return {
        title: 'Rapport de calcul - Erreur',
        rubriquId: 'VOLTAGE_DROP',
        timestamp: result.timestamp,
        summary: `Erreur lors du calcul: ${details.error}`,
        verdict: 'NON_CONFORME',
        sections: [{
          title: 'Erreur',
          content: details.error
        }]
      };
    }

    const networkResult: NetworkResult = details;

    return {
      title: 'Rapport de calcul - Chute de tension (Cahier des câbles)',
      rubriquId: 'VOLTAGE_DROP',
      timestamp: result.timestamp,
      summary: `Réseau analysé: ${networkResult.chemins.length} chemins, chute max: ${networkResult.chuteMaxPercent.toFixed(2)}%`,
      verdict: networkResult.verdictGlobal === 'AVERTISSEMENT' ? 'NON_CONFORME' : networkResult.verdictGlobal,
      sections: [
      {
        title: 'Schéma logique du réseau',
        content: this.generateNetworkSchema(networkResult)
      },
      {
        title: 'Résumé exécutif',
        content: `Analyse complète du réseau selon NF C 15-100 (méthode du cahier des câbles).

**Verdict Global:** ${networkResult.verdictGlobal === 'CONFORME' ? '✅ CONFORME' : networkResult.verdictGlobal === 'AVERTISSEMENT' ? '⚠️ AVERTISSEMENT' : '❌ NON CONFORME'}

**Point le plus défavorisé:** ${networkResult.cheminPlusDefavorise.id}
- Chute totale: ${networkResult.cheminPlusDefavorise.chuteTotalePercent.toFixed(2)}%
- Longueur: ${networkResult.cheminPlusDefavorise.longueurTotale.toFixed(1)}m
- Courant: ${networkResult.cheminPlusDefavorise.courant.toFixed(1)}A

**Statistiques:**
- Nombre de chemins: ${networkResult.chemins.length}
- Nombre de tronçons: ${networkResult.tronçonsCalcules.length}
- Chute maximale: ${networkResult.chuteMaxPercent.toFixed(2)}%`
      },
      {
        title: 'Tableau "Cahier des câbles"',
        content: 'Détail de chaque tronçon avec calculs normatifs',
        data: this.generateCableBookTable(networkResult.tronçonsCalcules)
      },
      {
        title: 'Analyse par chemin',
        content: 'Chutes de tension cumulées le long de chaque chemin électrique',
        data: this.generatePathsAnalysis(networkResult.chemins)
      },
      {
        title: 'Recommandations techniques',
        content: networkResult.recommandations.length > 0 ?
        networkResult.recommandations.join('\n\n') :
        '✅ Aucune recommandation - réseau conforme'
      },
      {
        title: 'Références normatives',
        content: `- NF C 15-100 Article 523 : Chute de tension admissible
  • ≤ 3% pour circuits d'éclairage (entre source et point d'utilisation)
  • ≤ 5% pour autres circuits (entre source et point d'utilisation)
- NF C 15-100 Article 525 : Coordination des protections
- Méthodologie : Calcul aval → amont, cumul le long des chemins
- Référence tension : 230V monophasé / 400V triphasé`
      }]

    };
  }

  /**
   * Générer la description schématique du réseau
   */
  private generateNetworkSchema(networkResult: NetworkResult): string {
    let schema = 'SCHÉMA LOGIQUE DU RÉSEAU\n\n';

    for (const chemin of networkResult.chemins) {
      const nodes = chemin.nodes.map((id) => id.replace('node_', 'N')).join(' → ');
      schema += `Chemin ${chemin.id.replace('path_', '')}:\n`;
      schema += `${nodes}\n`;
      schema += `Longueur: ${chemin.longueurTotale.toFixed(1)}m | Courant: ${chemin.courant.toFixed(1)}A | Chute: ${chemin.chuteTotalePercent.toFixed(2)}%\n\n`;
    }

    return schema;
  }

  /**
   * Générer le tableau "Cahier des câbles"
   */
  private generateCableBookTable(tronçons: unknown[]): unknown[] {
    return tronçons.map((tronçon) => ({
      'Tronçon': tronçon.name,
      'Nœud départ': tronçon.from,
      'Nœud arrivée': tronçon.to,
      'L (m)': tronçon.longueur.toFixed(1),
      'S (mm²)': tronçon.section,
      'I (A)': tronçon.courant.toFixed(1),
      'ΔU (V)': tronçon.resultats?.chuteTension?.toFixed(2) || '-',
      'ΔU (%)': tronçon.resultats?.chuteTensionPercent?.toFixed(2) || '-',
      'Matériau': tronçon.materiau,
      'Conformité': tronçon.resultats?.conformity || '-'
    }));
  }

  /**
   * Générer l'analyse par chemin
   */
  private generatePathsAnalysis(chemins: unknown[]): unknown[] {
    return chemins.map((chemin) => ({
      'Chemin': chemin.id,
      'Longueur totale (m)': chemin.longueurTotale.toFixed(1),
      'Courant (A)': chemin.courant.toFixed(1),
      'ΔU total (V)': chemin.chuteTotale.toFixed(2),
      'ΔU total (%)': chemin.chuteTotalePercent.toFixed(2),
      'Conformité': chemin.conformite,
      'Nœuds': chemin.nodes.length,
      'Tronçons': chemin.edges.length
    }));
  }
}

/**
 * RUBRIQUE 1 — Calcul de chute de tension
 */
export const RUBRIQUE_VOLTAGE_DROP: RubriqueSchema = {
  // Métadonnées
  id: 'VOLTAGE_DROP',
  name: '📐 Calcul de Chute de Tension',
  description:
  'Calcul normatif de chute de tension selon NF C 15-100 Articles 523/525. Dimensionnement automatique des sections.',
  version: '1.0.0',
  displayPriority: 1,
  maturity: 'STABLE',
  icon: '📐',

  // Moteur
  engine: new VoltageDropEngine(),

  // Objets disponibles
  getAvailableObjects(): ObjectDefinition[] {
    return Array.from(OBJECT_DEFINITIONS as unknown).map((v: unknown) => v);
  },

  getObjectBehavior(objectId: string): ObjectBehavior | null {
    const def = (OBJECT_DEFINITIONS as unknown).get?.(objectId);
    if (!def) return null;

    // Comportement par catégorie
    const baseCategory = def.category || 'COMPONENT';

    let role: 'SOURCE' | 'PROTECTION' | 'LOAD' | 'CONNECTION' | 'OTHER' = 'OTHER';
    if (baseCategory === 'SOURCE') role = 'SOURCE';else
    if (baseCategory.includes('BREAKER') || baseCategory.includes('DISJONCTEUR'))
    role = 'PROTECTION';else
    if (baseCategory === 'LOAD') role = 'LOAD';

    return {
      objectId,
      rubriquId: 'VOLTAGE_DROP',
      visibleParams: [
      'section', // Section du câble
      'length', // Longueur
      'current', // Courant nominal
      'material' // Matériau (Cu/Al)
      ],
      requiredParams: ['section', 'length'],
      validators: [
      (node: GraphNode) => {
        if (!node.params?.section || node.params.section <= 0) {
          return {
            id: 'INVALID_SECTION',
            severity: 'ERROR',
            message: `Nœud ${getReadableNodeName(node, graph)} : Section invalide`,
            nodeId: node.id
          };
        }
        return null;
      }],

      contributes_to_calculation: true,
      calculation_role: role
    };
  },

  isObjectAllowed(objectId: string): boolean {
    return (OBJECT_DEFINITIONS as unknown).has?.(objectId) ?? true;
  },

  // Validations
  validateGraph(graph: Graph): ValidationResult {
    return this.engine.validate(graph);
  },

  validateNode(node: GraphNode): ValidationResult {
    const behavior = this.getObjectBehavior(node.type);
    if (!behavior) {
      return {
        isValid: false,
        errors: [
        {
          id: 'UNKNOWN_OBJECT',
          severity: 'ERROR',
          message: `Objet ${node.type} non reconnu`,
          nodeId: node.id
        }],

        warnings: []
      };
    }

    const errors = [];
    const warnings = [];

    for (const validator of behavior.validators) {
      const error = validator(node);
      if (error) errors.push(error);
    }

    for (const paramKey of behavior.requiredParams) {
      if (!node.params?.[paramKey]) {
        errors.push({
          id: `MISSING_PARAM_${paramKey}`,
          severity: 'ERROR',
          message: `Nœud ${getReadableNodeName(node, graph)} : Paramètre requis manquant : ${paramKey}`,
          nodeId: node.id
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  validateEdge(edge: GraphEdge): ValidationResult {
    if (!edge.properties?.length || edge.properties.length <= 0) {
      return {
        isValid: false,
        errors: [
        {
          id: 'INVALID_LENGTH',
          severity: 'ERROR',
          message: `Câble ${edge.id} : Longueur invalide`,
          edgeId: edge.id
        }],

        warnings: []
      };
    }
    return { isValid: true, errors: [], warnings: [] };
  },

  // Calculs
  calculate(graph: Graph): CalculationResult {
    return this.engine.calculate(graph);
  },

  // Rapport
  generateReport(result: CalculationResult, graph: Graph): Report {
    return this.engine.generateReport(result);
  },

  exportReport(report: Report, format: 'PDF' | 'HTML' | 'JSON'): Blob {
    const content = JSON.stringify(report, null, 2);
    return new Blob([content], {
      type: format === 'JSON' ? 'application/json' : 'text/plain'
    });
  },

  // Références normatives
  normativeReferences: [
  {
    standard: 'NF C 15-100',
    articles: ['523', '525'],
    description: 'Chute de tension admissible et coordination des protections'
  },
  {
    standard: 'NF C 13-100',
    articles: ['8.3'],
    description: 'Calcul de chute de tension en courant alternatif'
  }],


  // UI
  getCustomComponents() {
    return {


      // À implémenter ultérieurement
    };},
  getTheme() {
    return {
      nodeColors: {
        SOURCE: '#3B82F6',
        PROTECTION: '#F59E0B',
        LOAD: '#EF4444',
        CONNECTION: '#8B5CF6'
      },
      edgeColors: {
        CABLE_CU: '#6B7280',
        CABLE_AL: '#9CA3AF'
      },
      accentColor: '#3B82F6'
    };
  },

  supportsScenarios: false,
  supportsComparison: false
};

export default RUBRIQUE_VOLTAGE_DROP;