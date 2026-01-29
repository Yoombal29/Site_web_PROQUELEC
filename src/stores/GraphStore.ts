/**
 * 🧱 GraphStore — État du schéma électrique
 * 
 * Gère l'état global du graphe électrique :
 * - Nœuds (sources, tableaux, récepteurs, etc.)
 * - Arêtes (câbles, connexions)
 * - Hashage pour VCNG (Verrou Cohérence Normative Globale)
 * 
 * Architecture :
 * - Chaque modification notifie les listeners
 * - Distance graphique = longueur électrique (en mètres)
 * - Sérialisation complète pour audit
 */

import SHA256 from 'crypto-js/sha256';

/**
 * Interface Charge — Définition d'une charge électrique
 */
export interface Charge {
  id: string;
  nom: string;              // Nom de la charge (ex: "Éclairage bureau", "Prise informatique")
  puissance: number;        // Puissance en watts
  tension: number;          // Tension nominale en volts (230V, 400V, etc.)
  cosPhi: number;           // Facteur de puissance (0.8 à 1.0)
  type: 'MONOPHASE' | 'TRIPHASE' | 'DC';
  courantNominal: number;   // Courant calculé en ampères
  categorie: 'ECLAIRAGE' | 'FORCE' | 'SPECIALISE'; // Pour normes différentes
}

export interface GraphNode {
  id: string;
  type: 'SOURCE' | 'PROTECTION' | 'DISTRIBUTION' | 'DERIVATION' | 'COUPURE' | 'RECEPTOR' | 'TRANSFORMATION' | 'PRODUCTION' | 'GROUND' | 'CABLE';
  position: { x: number; y: number };
  params: Record<string, any>;        // Paramètres techniques (legacy)
  properties: Record<string, any>;    // Propriétés PROQUELEC (nouveau)
  charges?: Charge[];                 // Liste des charges connectées (pour RECEPTOR)
  metadata: { createdAt: number; modifiedAt: number };
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: 'CABLE_CU' | 'CABLE_AL' | 'CONNECTION';
  properties: {
    section?: number;
    length: number; // calculée automatiquement en mètres
    modeOfInstallation?: string;
    courant?: number; // courant en ampères
    materiau?: 'Cu' | 'Al'; // matériau du câble
  };
}

/**
 * Classe GraphStore — Gestion d'état du schéma
 * 
 * Responsabilités :
 * 1. Maintenir l'état nœuds/arêtes
 * 2. Calculer automatiquement longueurs câbles
 * 3. Notifier listeners de modifications
 * 4. Générer hash pour VCNG
 * 5. Sérialiser/désérialiser pour historique
 */
export class GraphStore {
  nodes: Map<string, GraphNode> = new Map();
  edges: Map<string, GraphEdge> = new Map();
  private listeners: Set<(event: string) => void> = new Set();
  private modificationHistory: Array<{ timestamp: number; action: string; graphHash: string }> = [];

  /**
   * Ajouter un nœud au graphe
   * @param node Nœud à ajouter (source, tableau, etc.)
   */
  addNode(node: GraphNode): void {
    node.metadata = {
      createdAt: Date.now(),
      modifiedAt: Date.now()
    };
    // Initialiser properties si non défini
    if (!node.properties) {
      node.properties = {};
    }
    this.nodes.set(node.id, node);
    this.recordModification(`ADD_NODE:${node.id}`);
    this.notifyListeners('GRAPH_CHANGED');
  }

  /**
   * Ajouter une arête (câble) au graphe
   * Calcule automatiquement la longueur basée sur distance graphique
   * @param edge Arête à ajouter
   */
  addEdge(edge: GraphEdge): void {
    const fromNode = this.nodes.get(edge.from);
    const toNode = this.nodes.get(edge.to);

    if (!fromNode || !toNode) {
      throw new Error(`Nodes not found: from=${edge.from}, to=${edge.to}`);
    }

    // Calcul automatique longueur = distance graphique convertie en mètres
    edge.properties.length = this.calculateDistance(fromNode.position, toNode.position);

    this.edges.set(edge.id, edge);
    this.recordModification(`ADD_EDGE:${edge.id}`);
    this.notifyListeners('GRAPH_CHANGED');
  }

  /**
   * Mettre à jour position d'un nœud (drag-drop)
   * Recalcule automatiquement les longueurs des arêtes connectées
   * @param nodeId ID du nœud
   * @param newPosition Nouvelle position {x, y}
   */
  updateNodePosition(nodeId: string, newPosition: { x: number; y: number }): void {
    const node = this.nodes.get(nodeId);
    if (!node) throw new Error(`Node not found: ${nodeId}`);

    node.position = newPosition;
    node.metadata.modifiedAt = Date.now();

    // Recalculer longueurs des arêtes connectées
    for (const edge of this.edges.values()) {
      if (edge.from === nodeId || edge.to === nodeId) {
        const fromNode = this.nodes.get(edge.from)!;
        const toNode = this.nodes.get(edge.to)!;
        edge.properties.length = this.calculateDistance(fromNode.position, toNode.position);
      }
    }

    this.recordModification(`UPDATE_POSITION:${nodeId}`);
    this.notifyListeners('GRAPH_CHANGED');
  }

  /**
   * Mettre à jour paramètres d'un nœud
   * @param nodeId ID du nœud
   * @param newParams Nouveaux paramètres
   */
  updateNodeParams(nodeId: string, newParams: Record<string, any>): void {
    const node = this.nodes.get(nodeId);
    if (!node) throw new Error(`Node not found: ${nodeId}`);

    node.params = { ...node.params, ...newParams };
    node.metadata.modifiedAt = Date.now();

    this.recordModification(`UPDATE_PARAMS:${nodeId}`);
    this.notifyListeners('GRAPH_CHANGED');
  }

  /**
   * Mettre à jour propriétés d'une arête
   * @param edgeId ID de l'arête
   * @param newProperties Nouvelles propriétés
   */
  updateEdgeProperties(edgeId: string, newProperties: Partial<GraphEdge['properties']>): void {
    const edge = this.edges.get(edgeId);
    if (!edge) throw new Error(`Edge not found: ${edgeId}`);

    edge.properties = { ...edge.properties, ...newProperties };

    this.recordModification(`UPDATE_EDGE:${edgeId}`);
    this.notifyListeners('GRAPH_CHANGED');
  }

  /**
   * Supprimer un nœud et toutes ses arêtes
   * @param nodeId ID du nœud
   */
  removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);

    // Supprimer toutes les arêtes connectées
    const edgesToRemove: string[] = [];
    for (const [edgeId, edge] of this.edges.entries()) {
      if (edge.from === nodeId || edge.to === nodeId) {
        edgesToRemove.push(edgeId);
      }
    }
    edgesToRemove.forEach(id => this.edges.delete(id));

    this.recordModification(`REMOVE_NODE:${nodeId}`);
    this.notifyListeners('GRAPH_CHANGED');
  }

  /**
   * Supprimer une arête
   * @param edgeId ID de l'arête
   */
  removeEdge(edgeId: string): void {
    this.edges.delete(edgeId);
    this.recordModification(`REMOVE_EDGE:${edgeId}`);
    this.notifyListeners('GRAPH_CHANGED');
  }

  /**
   * Calculer distance graphique entre deux points
   * Conversion : 10 pixels = 1 mètre (configurable)
   * @param p1 Point source
   * @param p2 Point destination
   * @returns Distance en mètres
   */
  private calculateDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    const PIXELS_PER_METER = 10; // 1 mètre = 10 pixels sur le canvas
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distancePixels = Math.sqrt(dx * dx + dy * dy);
    return parseFloat((distancePixels / PIXELS_PER_METER).toFixed(2)); // arrondir à 2 décimales
  }

  /**
   * Générer hash SHA256 du graphe
   * Utilisé pour VCNG (Verrou Cohérence Normative Globale)
   * @returns Hash SHA256 du graphe
   */
  getHash(): string {
    const graphData = {
      nodes: Array.from(this.nodes.entries()),
      edges: Array.from(this.edges.entries())
    };
    return SHA256(JSON.stringify(graphData)).toString();
  }

  /**
   * Enregistrer modification dans historique
   * @param action Description de l'action
   */
  private recordModification(action: string): void {
    this.modificationHistory.push({
      timestamp: Date.now(),
      action,
      graphHash: this.getHash()
    });
  }

  /**
   * S'abonner aux modifications
   * @param callback Fonction appelée à chaque modification
   */
  subscribe(callback: (event: string) => void): () => void {
    this.listeners.add(callback);
    // Retourner fonction de désabonnement
    return () => this.listeners.delete(callback);
  }

  /**
   * Notifier tous les listeners
   * @param event Type d'événement
   */
  private notifyListeners(event: string): void {
    this.listeners.forEach(callback => callback(event));
  }

  /**
   * Sérialiser le graphe en JSON
   * @returns String JSON du graphe
   */
  serialize(): string {
    return JSON.stringify({
      nodes: Array.from(this.nodes.entries()),
      edges: Array.from(this.edges.entries()),
      modificationHistory: this.modificationHistory
    });
  }

  /**
   * Désérialiser un graphe depuis JSON
   * @param data String JSON
   */
  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.nodes = new Map(parsed.nodes);
    this.edges = new Map(parsed.edges);
    this.modificationHistory = parsed.modificationHistory || [];
    this.notifyListeners('GRAPH_LOADED');
  }

  /**
   * Obtenir historique des modifications
   * Utilisé pour audit trail
   */
  getModificationHistory() {
    return [...this.modificationHistory];
  }

  /**
   * Vider le graphe (réinitialisation)
   */
  clear(): void {
    this.nodes.clear();
    this.edges.clear();
    this.modificationHistory = [];
    this.notifyListeners('GRAPH_CLEARED');
  }

  /**
   * Obtenir statistiques du graphe
   */
  getStats() {
    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size,
      totalCableLength: Array.from(this.edges.values())
        .filter(e => e.type.includes('CABLE'))
        .reduce((sum, e) => sum + (e.properties.length || 0), 0),
      hash: this.getHash()
    };
  }

  // ════════════════════════════════════════════════════════════════════════════════
  // GESTION DES CHARGES ÉLECTRIQUES
  // ════════════════════════════════════════════════════════════════════════════════

  /**
   * Ajouter une charge à un nœud récepteur
   */
  addCharge(nodeId: string, charge: Omit<Charge, 'id' | 'courantNominal'>): void {
    const node = this.nodes.get(nodeId);
    if (!node) throw new Error(`Node not found: ${nodeId}`);
    if (node.type !== 'RECEPTOR') throw new Error(`Charges can only be added to RECEPTOR nodes`);

    if (!node.charges) node.charges = [];

    // Calculer le courant nominal
    const courantNominal = (charge.puissance / charge.tension) / charge.cosPhi;

    const newCharge: Charge = {
      id: `charge_${nodeId}_${Date.now()}`,
      ...charge,
      courantNominal
    };

    node.charges.push(newCharge);
    this.recordModification(`ADD_CHARGE:${newCharge.id}`);
    this.notifyListeners('GRAPH_CHANGED');
  }

  /**
   * Modifier une charge existante
   */
  updateCharge(nodeId: string, chargeId: string, updates: Partial<Omit<Charge, 'id'>>): void {
    const node = this.nodes.get(nodeId);
    if (!node || !node.charges) throw new Error(`Node or charges not found`);

    const chargeIndex = node.charges.findIndex(c => c.id === chargeId);
    if (chargeIndex === -1) throw new Error(`Charge not found: ${chargeId}`);

    const charge = node.charges[chargeIndex];
    const updatedCharge = { ...charge, ...updates };

    // Recalculer le courant si puissance, tension ou cosPhi ont changé
    if (updates.puissance !== undefined || updates.tension !== undefined || updates.cosPhi !== undefined) {
      updatedCharge.courantNominal = (updatedCharge.puissance / updatedCharge.tension) / updatedCharge.cosPhi;
    }

    node.charges[chargeIndex] = updatedCharge;
    this.recordModification(`UPDATE_CHARGE:${chargeId}`);
    this.notifyListeners('GRAPH_CHANGED');
  }

  /**
   * Supprimer une charge
   */
  removeCharge(nodeId: string, chargeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node || !node.charges) throw new Error(`Node or charges not found`);

    node.charges = node.charges.filter(c => c.id !== chargeId);
    this.recordModification(`REMOVE_CHARGE:${chargeId}`);
    this.notifyListeners('GRAPH_CHANGED');
  }

  /**
   * Obtenir toutes les charges d'un nœud
   */
  getCharges(nodeId: string): Charge[] {
    const node = this.nodes.get(nodeId);
    return node?.charges || [];
  }

  /**
   * Calculer le courant total d'un nœud (somme de toutes ses charges)
   */
  getTotalCurrent(nodeId: string): number {
    const charges = this.getCharges(nodeId);
    return charges.reduce((sum, charge) => sum + charge.courantNominal, 0);
  }
}

// Export instance globale (singleton pattern optionnel)
export const graphStore = new GraphStore();
