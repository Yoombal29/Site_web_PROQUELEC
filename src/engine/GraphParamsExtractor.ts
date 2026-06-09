import { GraphStore, GraphNode, GraphEdge } from '../stores/GraphStore';

export interface ExtractedPathParams {
  sourceNodeId: string;
  receptorNodeId: string;
  totalLength: number; // en mètres
  maxCurrent: number; // en ampères
  path: string[]; // tableau des IDs de nœuds traversés
  edges: string[]; // tableau des IDs des câbles traversés
  error?: string;
}

export class GraphParamsExtractor {
  
  /**
   * Parcourt le graphe à l'envers depuis un nœud cible (généralement un récepteur) 
   * pour trouver la source et cumuler les paramètres électriques (longueur, intensité).
   */
  static extractPathToSource(store: GraphStore, targetNodeId: string): ExtractedPathParams {
    const nodes = store.nodes;
    const edges = Array.from(store.edges.values());
    
    let currentNodeId = targetNodeId;
    let totalLength = 0;
    const path: string[] = [currentNodeId];
    const pathEdges: string[] = [];
    
    // Sécurité contre les boucles infinies
    let iterations = 0;
    while (iterations < 100) { 
      iterations++;
      
      const node = nodes.get(currentNodeId);
      if (!node) {
        return { 
          sourceNodeId: '', 
          receptorNodeId: targetNodeId, 
          totalLength, 
          maxCurrent: 0, 
          path, 
          edges: pathEdges, 
          error: `Nœud ${currentNodeId} introuvable` 
        };
      }
      
      if (node.type === 'SOURCE' || node.type === 'PRODUCTION') {
        // Source atteinte !
        break;
      }
      
      // Trouver le câble entrant
      const incomingEdge = edges.find(e => e.to === currentNodeId || (e.from === currentNodeId && e.type.includes('CABLE')));
      
      if (!incomingEdge) {
        return { 
          sourceNodeId: '', 
          receptorNodeId: targetNodeId, 
          totalLength, 
          maxCurrent: 0, 
          path, 
          edges: pathEdges, 
          error: `Connexion à la source introuvable pour ${currentNodeId}` 
        };
      }
      
      totalLength += (incomingEdge.properties.length || 0);
      
      // Avancer au nœud précédent
      currentNodeId = incomingEdge.from === currentNodeId ? incomingEdge.to : incomingEdge.from;
      path.unshift(currentNodeId);
      pathEdges.unshift(incomingEdge.id);
    }
    
    // Courant total tiré par le nœud récepteur (ou la ligne)
    // Dans une analyse complète, il faudrait agréger l'arborescence,
    // mais pour une chute de tension d'un terminal on prend le max.
    const maxCurrent = store.getTotalCurrent(targetNodeId) || 0;
    
    return {
      sourceNodeId: currentNodeId,
      receptorNodeId: targetNodeId,
      totalLength: parseFloat(totalLength.toFixed(2)),
      maxCurrent,
      path,
      edges: pathEdges
    };
  }
}
