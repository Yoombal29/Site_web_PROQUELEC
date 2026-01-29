/**
 * 🎮 EditorManager — Orchestration complète de l'éditeur
 * 
 * Responsabilités :
 * 1. Gérer Undo/Redo (Ctrl+Z, Ctrl+Y)
 * 2. Gérer sélection d'objets
 * 3. Gérer suppression intelligente (objet + câbles)
 * 4. Gérer modification d'objets
 * 5. Intégrer calculs normatifs (TronçonEngine)
 * 6. Notifier UI des changements
 */

import { GraphStore, GraphNode, GraphEdge } from '@/stores/GraphStore';
import { HistoryManager, HistoryState } from '@/stores/HistoryManager';
import { TronçonEngine, Tronçon } from '@/engines/TronçonEngine';

export class EditorManager {
  private graphStore: GraphStore;
  private history: HistoryManager;
  private selectedNodeId: string | null = null;
  private selectedEdgeId: string | null = null;
  private listeners: Set<(event: string, data?: any) => void> = new Set();

  constructor(graphStore: GraphStore) {
    this.graphStore = graphStore;
    this.history = new HistoryManager();

    // S'abonner aux changements du graphe
    this.graphStore.subscribe((event) => {
      this.notifyListeners(`graph:${event}`, {
        nodeCount: this.graphStore.nodes.size,
        edgeCount: this.graphStore.edges.size
      });
    });

    // Écouter les commandes clavier
    this.setupKeyboardShortcuts();
  }

  /**
   * Configuration des raccourcis clavier
   */
  private setupKeyboardShortcuts(): void {
    window.addEventListener('keydown', (e) => {
      // Ctrl+Z : Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        this.undo();
      }

      // Ctrl+Y : Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        this.redo();
      }

      // Delete : Supprimer sélection
      if (e.key === 'Delete') {
        e.preventDefault();
        if (this.selectedNodeId) {
          this.deleteNode(this.selectedNodeId);
        } else if (this.selectedEdgeId) {
          this.deleteEdge(this.selectedEdgeId);
        }
      }

      // Ctrl+D : Dupliquer sélection
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (this.selectedNodeId) {
          this.duplicateNode(this.selectedNodeId);
        }
      }

      // Ctrl+E : Éditer sélection
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        if (this.selectedNodeId) {
          this.notifyListeners('editor:edit-node', { nodeId: this.selectedNodeId });
        }
      }
    });
  }

  /**
   * Enregistrer l'état actuel dans l'historique
   */
  private saveState(description: string): void {
    const state: HistoryState = {
      nodes: new Map(this.graphStore.nodes),
      edges: new Map(this.graphStore.edges),
      timestamp: Date.now(),
      description
    };
    this.history.push(state, description);
    this.notifyListeners('history:changed', this.history.getStats());
  }

  /**
   * Ajouter un nœud
   */
  addNode(node: GraphNode): void {
    this.saveState(`Ajouter ${node.type}`);
    this.graphStore.addNode(node);
    this.notifyListeners('editor:node-added', { nodeId: node.id });
  }

  /**
   * Ajouter une arête (câble)
   */
  addEdge(edge: GraphEdge): void {
    this.saveState(`Ajouter câble ${edge.type}`);
    this.graphStore.addEdge(edge);
    this.notifyListeners('editor:edge-added', { edgeId: edge.id });
  }

  /**
   * Mettre à jour position d'un nœud
   */
  updateNodePosition(nodeId: string, position: { x: number; y: number }): void {
    this.graphStore.updateNodePosition(nodeId, position);
    // Pas de saveState ici car drag-drop est continu
  }

  /**
   * Mettre à jour paramètres d'un nœud
   */
  updateNodeParams(nodeId: string, params: Record<string, any>): void {
    this.saveState(`Modifier ${nodeId}`);
    this.graphStore.updateNodeParams(nodeId, params);
    this.notifyListeners('editor:node-updated', { nodeId });
  }

  /**
   * Supprimer un nœud + câbles associés
   */
  deleteNode(nodeId: string): void {
    const node = this.graphStore.nodes.get(nodeId);
    if (!node) return;

    this.saveState(`Supprimer ${node.type}`);
    
    // Supprimer le nœud (qui supprime aussi ses câbles)
    this.graphStore.removeNode(nodeId);
    
    // Déselectionner
    if (this.selectedNodeId === nodeId) {
      this.selectedNodeId = null;
    }

    this.notifyListeners('editor:node-deleted', { nodeId });
  }

  /**
   * Supprimer une arête
   */
  deleteEdge(edgeId: string): void {
    this.saveState('Supprimer câble');
    this.graphStore.removeEdge(edgeId);
    
    if (this.selectedEdgeId === edgeId) {
      this.selectedEdgeId = null;
    }

    this.notifyListeners('editor:edge-deleted', { edgeId });
  }

  /**
   * Dupliquer un nœud
   */
  duplicateNode(nodeId: string): void {
    const node = this.graphStore.nodes.get(nodeId);
    if (!node) return;

    const newNode: GraphNode = {
      id: `${node.id}_copy_${Date.now()}`,
      type: node.type,
      position: { x: node.position.x + 50, y: node.position.y + 50 },
      params: { ...node.params },
      properties: { ...node.properties },
      metadata: { createdAt: Date.now(), modifiedAt: Date.now() }
    };

    this.addNode(newNode);
    this.notifyListeners('editor:node-duplicated', { oldId: nodeId, newId: newNode.id });
  }

  /**
   * Sélectionner un nœud
   */
  selectNode(nodeId: string): void {
    this.selectedNodeId = nodeId;
    this.selectedEdgeId = null;
    this.notifyListeners('editor:selection-changed', { type: 'node', id: nodeId });
  }

  /**
   * Sélectionner une arête
   */
  selectEdge(edgeId: string): void {
    this.selectedEdgeId = edgeId;
    this.selectedNodeId = null;
    this.notifyListeners('editor:selection-changed', { type: 'edge', id: edgeId });
  }

  /**
   * Désélectionner
   */
  deselect(): void {
    this.selectedNodeId = null;
    this.selectedEdgeId = null;
    this.notifyListeners('editor:selection-cleared');
  }

  /**
   * Annuler (Ctrl+Z)
   */
  undo(): void {
    const prevState = this.history.undo();
    if (!prevState) return;

    // Restaurer l'état
    this.graphStore.nodes = prevState.nodes;
    this.graphStore.edges = prevState.edges;
    this.deselect();

    this.notifyListeners('editor:undo', this.history.getStats());
  }

  /**
   * Rétablir (Ctrl+Y)
   */
  redo(): void {
    const nextState = this.history.redo();
    if (!nextState) return;

    // Restaurer l'état
    this.graphStore.nodes = nextState.nodes;
    this.graphStore.edges = nextState.edges;
    this.deselect();

    this.notifyListeners('editor:redo', this.history.getStats());
  }

  /**
   * Vérifier si undo est possible
   */
  canUndo(): boolean {
    return this.history.canUndo();
  }

  /**
   * Vérifier si redo est possible
   */
  canRedo(): boolean {
    return this.history.canRedo();
  }

  /**
   * Obtenir le nœud sélectionné
   */
  getSelectedNode(): GraphNode | null {
    return this.selectedNodeId ? this.graphStore.nodes.get(this.selectedNodeId) || null : null;
  }

  /**
   * Obtenir l'arête sélectionnée
   */
  getSelectedEdge(): GraphEdge | null {
    return this.selectedEdgeId ? this.graphStore.edges.get(this.selectedEdgeId) || null : null;
  }

  /**
   * Calculer tous les tronçons (chute de tension, conformité)
   */
  calculateTronçons(): {
    tronçons: Tronçon[];
    verdict: 'CONFORME' | 'NON_CONFORME' | 'AVERTISSEMENT';
    chuteMax: number;
    puissanceMax: number;
    issues: string[];
  } {
    // Convertir edges en tronçons
    const tronçons: Tronçon[] = Array.from(this.graphStore.edges.values())
      .filter((edge: GraphEdge) => edge.type.includes('CABLE'))
      .map((edge: GraphEdge) => {
        const fromNode = this.graphStore.nodes.get(edge.from);
        const toNode = this.graphStore.nodes.get(edge.to);

        return {
          id: edge.id,
          name: `${fromNode?.type} → ${toNode?.type}`,
          from: edge.from,
          to: edge.to,
          longueur: edge.properties.length || 0,
          section: edge.properties.section || 2.5, // Par défaut 2.5 mm²
          materiau: edge.properties.materiau || (edge.type === 'CABLE_CU' ? 'Cu' : 'Al'),
          courant: edge.properties.courant || 10, // Par défaut 10A
          modeInstallation: edge.properties.modeOfInstallation || 'Apparent'
        };
      });

    return TronçonEngine.calculateAll(tronçons);
  }

  /**
   * S'abonner aux événements
   */
  subscribe(callback: (event: string, data?: any) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notifier les listeners
   */
  private notifyListeners(event: string, data?: any): void {
    this.listeners.forEach(cb => cb(event, data));
  }

  /**
   * Obtenir statistiques
   */
  getStats() {
    return {
      ...this.graphStore.getStats(),
      historyStats: this.history.getStats(),
      selectedNodeId: this.selectedNodeId,
      selectedEdgeId: this.selectedEdgeId
    };
  }
}
