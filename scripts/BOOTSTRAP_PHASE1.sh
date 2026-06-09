#!/bin/bash
# 🚀 BOOTSTRAP SCRIPT — Phase 1 démarrage immédiat

echo "🔧 Initialisation Plateforme Graphique Normative v1.0"
echo "=================================================="

# 1. Installation dépendances
echo "📦 Installation dépendances..."
npm install konva react-konva crypto-js --save
npm install --save-dev @types/konva @types/react

# 2. Création structure de dossiers
echo "📁 Création structure..."
mkdir -p src/stores
mkdir -p src/constants
mkdir -p src/components/canvas
mkdir -p src/functions
mkdir -p src/services
mkdir -p src/hooks
mkdir -p src/components/charts
mkdir -p src/components/dialogs

# 3. Fichiers de base
echo "📄 Création fichiers de base..."

# GraphStore
cat > src/stores/GraphStore.ts << 'EOF'
import SHA256 from 'crypto-js/sha256';

export interface GraphNode {
  id: string;
  type: 'SOURCE' | 'BREAKER' | 'CABLE' | 'RECEPTOR' | 'TABLEAU' | 'TRANSFORMER';
  position: { x: number; y: number };
  params: Record<string, any>;
  metadata: { createdAt: number; modifiedAt: number };
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: 'CABLE_CU' | 'CABLE_AL' | 'CONNECTION';
  properties: {
    section?: number;
    length: number;
    modeOfInstallation?: string;
  };
}

export class GraphStore {
  nodes: Map<string, GraphNode> = new Map();
  edges: Map<string, GraphEdge> = new Map();
  private listeners: Set<Function> = new Set();

  addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    this.notifyListeners('GRAPH_CHANGED');
  }

  addEdge(edge: GraphEdge): void {
    const fromNode = this.nodes.get(edge.from);
    const toNode = this.nodes.get(edge.to);
    
    if (!fromNode || !toNode) throw new Error('Nodes not found');
    
    edge.properties.length = this.calculateDistance(fromNode.position, toNode.position);
    this.edges.set(edge.id, edge);
    this.notifyListeners('GRAPH_CHANGED');
  }

  private calculateDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy) / 10;
  }

  getHash(): string {
    return SHA256(JSON.stringify({
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values())
    })).toString();
  }

  subscribe(callback: Function): void {
    this.listeners.add(callback);
  }

  private notifyListeners(event: string): void {
    this.listeners.forEach(cb => cb(event));
  }

  serialize(): string {
    return JSON.stringify({
      nodes: Array.from(this.nodes.entries()),
      edges: Array.from(this.edges.entries())
    });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.nodes = new Map(parsed.nodes);
    this.edges = new Map(parsed.edges);
    this.notifyListeners('GRAPH_LOADED');
  }
}
EOF

# ObjectLibrary
cat > src/constants/ObjectLibrary.ts << 'EOF'
export interface ObjectDefinition {
  id: string;
  category: 'SOURCE' | 'BREAKER' | 'TRANSFORMER' | 'TABLEAU' | 'CABLE' | 'RECEPTOR';
  name: string;
  symbol: string;
  defaultParams: Record<string, any>;
  normativeRef: string;
  editableFields: Array<{
    name: string;
    type: 'number' | 'select' | 'text';
    options?: string[];
  }>;
}

export const OBJECT_DEFINITIONS: Record<string, ObjectDefinition> = {
  SOURCE_TYPE_A: {
    id: 'source_type_a',
    category: 'SOURCE',
    name: 'Réseau public BT',
    symbol: '⚡',
    defaultParams: { voltage: 230, type: 'A', regime: 'TT' },
    normativeRef: 'NF C 14-100 Art. 5',
    editableFields: [{ name: 'voltage', type: 'select', options: ['230', '400'] }]
  },
  BREAKER_6A: {
    id: 'breaker_6a',
    category: 'BREAKER',
    name: 'Disjoncteur 6A courbe B',
    symbol: 'C',
    defaultParams: { calibre: 6, curve: 'B', pdc: 4500 },
    normativeRef: 'NF C 61-201',
    editableFields: [{ name: 'calibre', type: 'number' }]
  },
  CABLE_CU_15: {
    id: 'cable_cu_15',
    category: 'CABLE',
    name: 'Câble Cu 1,5mm²',
    symbol: '─',
    defaultParams: { section: 1.5, material: 'Cu', modeOfInstallation: 'B1' },
    normativeRef: 'NF C 61-100',
    editableFields: [
      { name: 'modeOfInstallation', type: 'select', options: ['A1', 'A2', 'B1', 'C', 'D', 'E', 'F', 'G'] }
    ]
  }
};
EOF

echo "✅ Bootstrap terminé !"
echo "=================================================="
echo "📖 Prochaines étapes :"
echo "  1. Démarrer Vite : npm run dev"
echo "  2. Créer SchematicCanvas.tsx"
echo "  3. Intégrer GraphStore dans composant"
echo "=================================================="
