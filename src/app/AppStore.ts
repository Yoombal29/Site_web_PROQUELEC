import { graphStore, GraphNode } from '@/stores/GraphStore';
import { VoltageDropEngine } from '@/engines/VoltageDropEngine';
import { ValidationEngine, ValidationResult } from '@/engines/ValidationEngine';

/**
 * AppStore — Source de vérité unique pour PROQUELEC V2
 *
 * Centralise l'état global, les calculs et la validation
 * Évite la dispersion de la logique métier
 */
export class AppStore {
  private static instance: AppStore;

  // Sources de vérité
  public readonly graph = graphStore;

  // Moteurs
  private voltageDropEngine = new VoltageDropEngine();
  private validationEngine = new ValidationEngine();

  // État calculé
  private calculations = new Map<string, any>();

  private constructor() {
    // Chargement automatique depuis localStorage
    this.loadFromLocalStorage();
  }

  static get(): AppStore {
    return this.instance || (this.instance = new AppStore());
  }

  /**
   * Valide le schéma électrique complet
   */
  validate(): ValidationResult[] {
    return ValidationEngine.validateGraph(this.graph);
  }

  /**
   * Calcule la chute de tension pour tout le réseau
   */
  calculateVoltageDrop(): CalculationResult {
    const result = this.voltageDropEngine.calculate(this.graph);
    this.calculations.set('voltage_drop', result);
    return result;
  }

  /**
   * Obtient les résultats de calcul
   */
  getCalculations(): Map<string, any> {
    return new Map(this.calculations);
  }

  /**
   * Réinitialise tous les calculs
   */
  clearCalculations(): void {
    this.calculations.clear();
  }

  /**
   * Met à jour les propriétés d'un nœud
   */
  updateNodeProperties(nodeId: string, properties: Record<string, any>): void {
    const node = this.graph.nodes.get(nodeId);
    if (!node) {
      console.warn(`Tentative de mise à jour d'un nœud inexistant: ${nodeId}`);
      throw new Error(`Node not found: ${nodeId}`);
    }

    node.properties = { ...node.properties, ...properties };
    node.metadata.modifiedAt = Date.now();

    // Sauvegarder automatiquement dans le localStorage pour la persistance
    this.saveToLocalStorage();

    // Recalculer automatiquement
    this.calculateVoltageDrop();

    this.graph.notifyListeners('GRAPH_CHANGED');
  }

  /**
   * Vérifie si un nœud existe
   */
  nodeExists(nodeId: string): boolean {
    return this.graph.nodes.has(nodeId);
  }

  /**
   * Obtient un nœud par son ID
   */
  getNode(nodeId: string): GraphNode | undefined {
    return this.graph.nodes.get(nodeId);
  }

  /**
   * Sauvegarde automatique dans localStorage
   */
  private saveToLocalStorage(): void {
    try {
      const data = this.graph.serialize();
      localStorage.setItem('proquelec_graph', data);
      localStorage.setItem('proquelec_timestamp', Date.now().toString());
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde automatique:', error);
    }
  }

  /**
   * Charge depuis localStorage
   */
  loadFromLocalStorage(): boolean {
    try {
      const data = localStorage.getItem('proquelec_graph');
      const timestamp = localStorage.getItem('proquelec_timestamp');

      if (data && timestamp) {
        this.graph.deserialize(data);
        console.log(`📁 Graph chargé depuis localStorage (${new Date(parseInt(timestamp)).toLocaleString()})`);
        return true;
      }
    } catch (error) {
      console.warn('Erreur lors du chargement depuis localStorage:', error);
    }
    return false;
  }

  /**
   * Obtient les propriétés d'un nœud
   */
  getNodeProperties(nodeId: string): Record<string, any> {
    const node = this.graph.nodes.get(nodeId);
    return node?.properties || {};
  }

  /**
   * Supprime un nœud du graphe
   */
  removeNode(nodeId: string): void {
    const node = this.graph.nodes.get(nodeId);
    if (!node) throw new Error(`Node not found: ${nodeId}`);

    // Supprimer le nœud via GraphStore
    this.graph.removeNode(nodeId);

    // Sauvegarder automatiquement
    this.saveToLocalStorage();

    // Recalculer automatiquement
    this.calculateVoltageDrop();

    this.graph.notifyListeners('GRAPH_CHANGED');
  }

  /**
   * Export du cahier des câbles (version basique)
   */
  exportCableBook(): CableBookData {
    const edges = Array.from(this.graph.edges.values());
    const cableData = edges
      .filter(edge => edge.type.includes('CABLE'))
      .map(edge => ({
        id: edge.id,
        section: edge.properties.section || 1.5,
        length: edge.properties.length || 0,
        material: edge.properties.materiau || 'Cu',
        current: edge.properties.courant || 0,
        from: edge.from,
        to: edge.to
      }));

    return {
      cables: cableData,
      totalLength: cableData.reduce((sum, cable) => sum + cable.length, 0),
      generatedAt: new Date().toISOString()
    };
  }
}

// Types
export interface CalculationResult {
  edges: Array<{
    id: string;
    deltaU: number;
    percentage: number;
    compliant: boolean;
  }>;
  totalNetworkDrop: number;
  compliant: boolean;
}

export interface CableBookData {
  cables: Array<{
    id: string;
    section: number;
    length: number;
    material: string;
    current: number;
    from: string;
    to: string;
  }>;
  totalLength: number;
  generatedAt: string;
}

// Instance globale
export const appStore = AppStore.get();