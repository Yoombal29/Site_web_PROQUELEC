/**
 * 🎨 SchematicCanvas — Visualisation du schéma électrique
 * 
 * Rendu Konva 2D du graphe électrique avec :
 * - Placement/drag-drop d'objets normatifs
 * - Création de câbles (connexions graphiques)
 * - Calcul automatique des longueurs
 * - Code couleur conformité (🟢 🟠 🔴)
 * - Support multi-sélection
 * 
 * Architecture :
 * - Stage (600px hauteur)
 * - Layer (contient tous les objets)
 * - Nœuds = cercles avec symboles
 * - Arêtes = lignes proportionnelles aux sections
 */

import React, { useRef, useEffect, useState } from 'react';
import Konva from 'konva';
import { Stage, Layer, Circle, Text, Line, Group, Rect } from 'react-konva';
import { GraphNode, GraphEdge } from '@/stores/GraphStore';
import { getObjectDefinition } from '@/constants/ObjectLibrary';
import { ELECTRICAL_SYMBOLS } from '@/symbols/ElectricalSymbols';

import { appStore } from '@/app/AppStore';
import { ValidationResult } from '@/engines/ValidationEngine';
import { ChargeEditor } from '@/components/tools/ChargeEditor';
import { NodeParameterEditor } from '@/components/editors/NodeParameterEditor';

interface SchematicCanvasProps {
  graphStore: GraphStore;
  onNodeSelect?: (nodeId: string) => void;
  onEdgeSelect?: (edgeId: string) => void;
  width?: number;
  height?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  showGuides?: boolean;
  onExport?: () => void;
  onAnalyzeEdge?: (edgeId: string) => void;
}

interface NodeWithSymbol extends GraphNode {
  symbolDisplay: string;
}

/**
 * Composant principal canvas schématique
 */
export function SchematicCanvas({
  graphStore,
  onNodeSelect,
  onEdgeSelect,
  width = 1600, // Élargi par défaut
  height = 900, // Élargi par défaut
  showGrid: initialShowGrid = true,
  showAxes: initialShowAxes = true,
  showGuides: initialShowGuides = true,
  onExport,
  onAnalyzeEdge
}: SchematicCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);

  // État local
  const [nodes, setNodes] = useState<Map<string, NodeWithSymbol>>(new Map());
  const [rulerHorizontalPos, setRulerHorizontalPos] = useState<number>(0);
  const [rulerVerticalPos, setRulerVerticalPos] = useState<number>(0);
  const [edges, setEdges] = useState<Map<string, GraphEdge>>(new Map());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NodeWithSymbol | null>(null);

  // Connexion câble simplifiée
  const [connectingFromNodeId, setConnectingFromNodeId] = useState<string | null>(null);
  const [isDraggingNewEdge, setIsDraggingNewEdge] = useState(false);
  const [newEdgeStart, setNewEdgeStart] = useState<{x: number;y: number;} | null>(null);

  // Édition
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [editingEdgeValues, setEditingEdgeValues] = useState({
    section: 1.5,
    courant: 10,
    materiau: 'Cu' as 'Cu' | 'Al'
  });

  // Validation temps réel
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [voltageDropResults, setVoltageDropResults] = useState<unknown>(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [editingDistance, setEditingDistance] = useState<string>('');
  const [scale, setScale] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const [panStartPos, setPanStartPos] = useState<{x: number;y: number;} | null>(null);

  // Contrôles visuels
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showAxes, setShowAxes] = useState<boolean>(true);
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [canvasWidth, setCanvasWidth] = useState<number>(width);
  const [canvasHeight, setCanvasHeight] = useState<number>(height);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  /**
   * Sauvegarder les préférences utilisateur
   */
  function saveUserPreferences() {
    const preferences = {
      showGrid,
      showAxes,
      showGuides,
      canvasWidth,
      canvasHeight,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem('proquelec-canvas-preferences', JSON.stringify(preferences));
  }

  /**
   * Charger les préférences utilisateur
   */
  function loadUserPreferences() {
    try {
      const saved = localStorage.getItem('proquelec-canvas-preferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        setShowGrid(preferences.showGrid ?? true);
        setShowAxes(preferences.showAxes ?? true);
        setShowGuides(preferences.showGuides ?? true);
        setCanvasWidth(preferences.canvasWidth ?? width);
        setCanvasHeight(preferences.canvasHeight ?? height);
      }
    } catch (error) {
      console.warn('Erreur lors du chargement des préférences:', error);
    }
  }

  /**
   * S'abonner aux modifications du graphe
   */
  useEffect(() => {
    const unsubscribe = graphStore.subscribe((event: string) => {
      if (event === 'GRAPH_CHANGED') {
        updateCanvasState();
      }
    });

    // Initialiser l'état
    updateCanvasState();

    return unsubscribe;
  }, [graphStore]);

  /**
   * Charger les préférences au montage
   */
  useEffect(() => {
    loadUserPreferences();
    // Initialiser avec les props
    setShowGrid(initialShowGrid);
    setShowAxes(initialShowAxes);
    setShowGuides(initialShowGuides);
  }, []);

  /**
   * Sauvegarder automatiquement les préférences
   */
  useEffect(() => {
    saveUserPreferences();
  }, [showGrid, showAxes, showGuides, canvasWidth, canvasHeight]);

  /**
   * Gestionnaire d'événements clavier pour suppressions avec confirmation
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorer si on est en train d'éditer du texte
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Raccourcis pour les contrôles visuels
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'g':
            event.preventDefault();
            setShowGrid(!showGrid);
            break;
          case 'a':
            event.preventDefault();
            setShowAxes(!showAxes);
            break;
          case 'h':
            event.preventDefault();
            setShowGuides(!showGuides);
            break;
          case 'e':
            event.preventDefault();
            handleExport();
            break;
          case '+':
          case '=':
            event.preventDefault();
            setCanvasWidth(Math.min(2400, canvasWidth + 200));
            setCanvasHeight(Math.min(1800, canvasHeight + 150));
            break;
          case '-':
            event.preventDefault();
            setCanvasWidth(Math.max(800, canvasWidth - 200));
            setCanvasHeight(Math.max(600, canvasHeight - 150));
            break;
        }
        return;
      }

      // Suppression avec la touche Suppr
      if (event.key === 'Delete') {
        event.preventDefault();

        if (selectedNodeId) {
          handleDeleteNode(selectedNodeId);
        } else if (selectedEdgeId) {
          handleDeleteEdge(selectedEdgeId);
        }
      }

      // Échap pour annuler la sélection
      if (event.key === 'Escape') {
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
        setConnectingFromNodeId(null);
        setIsDraggingNewEdge(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedEdgeId, showGrid, showAxes, showGuides, canvasWidth, canvasHeight]);

  /**
   * Supprimer un nœud avec confirmation
   */
  function handleDeleteNode(nodeId: string) {
    const node = graphStore.nodes.get(nodeId);
    if (!node) return;

    const confirmed = window.confirm(
      `⚠️ Supprimer le nœud ${node.type} ?\n\n` +
      `Position: (${node.position.x}, ${node.position.y})\n` +
      `Toutes les connexions seront supprimées.\n\n` +
      `Confirmer ?`
    );

    if (confirmed) {

      appStore.removeNode(nodeId);
      setSelectedNodeId(null);
      // Forcer la mise à jour du canvas
      setTimeout(() => updateCanvasState(), 10);
    }
  }

  function handleDeleteEdge(edgeId: string) {
    const edge = graphStore.edges.get(edgeId);
    if (!edge) return;

    const confirmed = window.confirm(
      `⚠️ Supprimer le câble ?\n\n` +
      `De: ${edge.from} → À: ${edge.to}\n` +
      `Distance: ${edge.properties.length}m\n` +
      `Section: ${edge.properties.section}mm²\n\n` +
      `Confirmer ?`
    );

    if (confirmed) {

      graphStore.removeEdge(edgeId);
      setSelectedEdgeId(null);
      // Forcer la mise à jour du canvas
      setTimeout(() => updateCanvasState(), 10);
    }
  }

  /**
   * Exporter le schéma en image
   */
  function handleExport() {
    if (!stageRef.current) return;

    setIsExporting(true);

    try {
      const stage = stageRef.current;
      const dataURL = stage.toDataURL({
        pixelRatio: 2,
        mimeType: 'image/png'
      });

      const link = document.createElement('a');
      link.download = `schema-proquelec-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);


    } catch (error) {
      console.error('❌ Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export du schéma');
    } finally {
      setIsExporting(false);
    }
  }

  /**
   * Mettre à jour l'état canvas depuis le graphe
   */
  function updateCanvasState() {

    const newNodes = new Map<string, NodeWithSymbol>();

    for (const [nodeId, node] of graphStore.nodes.entries()) {
      const def = getObjectDefinition(node.params.objectId || node.type);
      const symbol = def?.symbol || '?';
      newNodes.set(nodeId, { ...node, symbolDisplay: symbol });
    }


    setNodes(newNodes);
    setEdges(new Map(graphStore.edges));

    // Validation et calculs via AppStore
    const validations = appStore.validate();
    setValidationResults(validations);

    const voltageDrops = appStore.calculateVoltageDrop();
    setVoltageDropResults(voltageDrops);
  }

  /**
   * Obtenir couleur conformité pour une arête (câble)
   */
  function getEdgeColor(edge: GraphEdge): string {
    const isSelected = selectedEdgeId === edge.id;
    if (isSelected) return '#EF4444'; // Rouge si sélectionné

    // Vérifier les erreurs de validation pour cette arête
    const edgeValidations = validationResults.filter((v) =>
    v.targetId === edge.id && v.targetType === 'edge'
    );

    if (edgeValidations.some((v) => v.severity === 'error')) {
      return '#DC2626'; // Rouge pour erreurs
    }
    if (edgeValidations.some((v) => v.severity === 'warning')) {
      return '#F59E0B'; // Orange pour avertissements
    }

    // Vérifier la conformité de chute de tension
    if (voltageDropResults) {
      const edgeResult = voltageDropResults.edges.find((e: unknown) => e.id === edge.id);
      if (edgeResult && !edgeResult.compliant) {
        return '#DC2626'; // Rouge si chute de tension non conforme
      }
    }

    return '#10B981'; // Vert par défaut (conforme)
  }

  /**
   * Obtenir couleur du nœud selon sélection et validation
   */
  function getNodeColor(nodeId: string): string {
    const isSelected = selectedNodeId === nodeId;
    if (isSelected) return '#EF4444'; // Rouge si sélectionné

    // Vérifier les erreurs de validation pour ce nœud
    const nodeValidations = validationResults.filter((v) =>
    v.targetId === nodeId && v.targetType === 'node'
    );

    if (nodeValidations.some((v) => v.severity === 'error')) {
      return '#DC2626'; // Rouge pour erreurs
    }
    if (nodeValidations.some((v) => v.severity === 'warning')) {
      return '#F59E0B'; // Orange pour avertissements
    }

    return '#4F46E5'; // Bleu par défaut
  }

  /**
   * Gérer clic simple sur un nœud
   * Logique: 1er clic = source, 2e clic = destination (crée câble)
   */
  function handleNodeClick(nodeId: string) {
    // Si on est en train de créer une connexion
    if (connectingFromNodeId) {
      // Si on clique sur un nœud différent, créer la connexion
      if (nodeId !== connectingFromNodeId) {
        const edgeId = `edge_${Date.now()}`;
        graphStore.addEdge({
          id: edgeId,
          from: connectingFromNodeId,
          to: nodeId,
          type: 'CABLE_CU',
          properties: {
            section: 1.5,
            length: 0,
            modeOfInstallation: 'B1'
          }
        });
        onEdgeSelect?.(edgeId);
      }
      // Réinitialiser la connexion
      setConnectingFromNodeId(null);
      setSelectedNodeId(null);
    } else {
      // 1er clic = marquer comme source
      setConnectingFromNodeId(nodeId);
      setSelectedNodeId(nodeId);
    }
  }

  /**
   * Gérer double-clic sur un nœud pour éditer
   */
  function handleNodeDoubleClick(nodeId: string) {
    setEditingNodeId(nodeId);
    // Réinitialiser l'état de connexion
    setConnectingFromNodeId(null);
  }

  /**
   * Gérer clic sur un edge pour le sélectionner
   */
  function handleEdgeClick(edgeId: string) {
    setSelectedEdgeId(edgeId);
    setSelectedNodeId(null);
    setConnectingFromNodeId(null);
    onEdgeSelect?.(edgeId);
  }

  /**
   * Gérer double-clic sur un edge pour éditer ses propriétés
   */
  function handleEdgeDoubleClick(edgeId: string) {
    const edge = edges.get(edgeId);
    if (edge) {
      setEditingEdgeValues({
        section: edge.properties.section || 1.5,
        courant: edge.properties.courant || 10,
        materiau: edge.properties.materiau || (edge.type === 'CABLE_CU' ? 'Cu' : 'Al')
      });
      setEditingEdgeId(edgeId);
      setConnectingFromNodeId(null);
    }
  }

  /**
   * Gérer drag d'un nœud
   */
  function handleNodeDragEnd(nodeId: string, e: Konva.KonvaEventObject<DragEvent>) {
    // e.target est le Group, récupérer sa position
    const newPos = {
      x: e.target.x(),
      y: e.target.y()
    };
    graphStore.updateNodePosition(nodeId, newPos);
  }

  /**
   * Gérer clic droit pour annuler la connexion en cours
   */
  function handleNodeContextMenu(nodeId: string, e: Konva.KonvaEventObject<PointerEvent>) {
    e.evt.preventDefault();
    // Annuler la connexion en cours
    if (connectingFromNodeId) {
      setConnectingFromNodeId(null);
      setSelectedNodeId(null);
    }
  }

  /**
   * Cliquer sur le label de distance pour l'éditer
   */
  function handleEdgeDistanceClick(edgeId: string, currentDistance: number) {
    setEditingEdgeId(edgeId);
    setEditingDistance(currentDistance.toFixed(1));
  }

  /**
   * Valider la nouvelle distance et repositionner le nœud
   */
  function handleDistanceConfirm() {
    if (!editingEdgeId) return;

    const edge = edges.get(editingEdgeId);
    if (!edge) return;

    const newDistance = parseFloat(editingDistance);
    if (isNaN(newDistance) || newDistance <= 0) {
      setEditingEdgeId(null);
      setEditingDistance('');
      return;
    }

    const fromNode = nodes.get(edge.from);
    const toNode = nodes.get(edge.to);

    if (!fromNode || !toNode) return;

    // Calculer angle et nouvelles coordonnées pour le nœud cible
    const dx = toNode.position.x - fromNode.position.x;
    const dy = toNode.position.y - fromNode.position.y;
    const angle = Math.atan2(dy, dx);

    // Conversion : 10 pixels = 1 mètre
    const pixelDistance = newDistance * 10;

    const newToPos = {
      x: fromNode.position.x + pixelDistance * Math.cos(angle),
      y: fromNode.position.y + pixelDistance * Math.sin(angle)
    };

    // Mettre à jour position du nœud et propriétés du câble
    graphStore.updateNodePosition(edge.to, newToPos);

    // Mettre à jour la longueur du câble
    edge.properties.length = newDistance;

    setEditingEdgeId(null);
    setEditingDistance('');
  }

  /**
   * Gérer mouvement souris (pour aperçu arête en cours et rulers)
   */
  function handleStageMouseMove(e: Konva.KonvaEventObject<PointerEvent>) {
    const stage = stageRef.current;
    if (stage) {
      const pos = stage.getPointerPosition();
      if (pos) {
        // Gérer le pan pendant le mouvement
        if (isDraggingPan) {
          handleStagePan(e);
        }

        // Mettre à jour les positions des rulers (coordonnées du monde, pas de l'écran)
        const worldX = (pos.x - panX) / scale;
        const worldY = (pos.y - panY) / scale;

        setRulerHorizontalPos(worldX);
        setRulerVerticalPos(worldY);
        setMousePos(pos);
      }
    }
  }

  /**
   * Gérer relâchement de la souris (fin création arête)
   */
  function handleStageMouseUp(e: Konva.KonvaEventObject<PointerEvent>) {
    // Ancienne logique (clic droit) - désactivée
    if (!isDraggingNewEdge || !newEdgeStart) return;

    setIsDraggingNewEdge(false);
    setNewEdgeStart(null);
  }

  /**
   * Gérer le zoom avec la roue de la souris
   */
  function handleStageWheel(e: Konva.KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();

    // Direction du zoom
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.max(0.5, Math.min(3, oldScale + direction * 0.1));

    if (pointer) {
      const mousePointTo = {
        x: (pointer.x - panX) / oldScale,
        y: (pointer.y - panY) / oldScale
      };

      const newPanX = pointer.x - mousePointTo.x * newScale;
      const newPanY = pointer.y - mousePointTo.y * newScale;

      setScale(newScale);
      setPanX(newPanX);
      setPanY(newPanY);

      // Appliquer au stage
      const layer = layerRef.current;
      if (layer) {
        layer.scale({ x: newScale, y: newScale });
        layer.position({ x: newPanX, y: newPanY });
      }
    }
  }

  /**
   * Démarrer le pan avec clic moyen ou Ctrl+drag
   */
  function handleStagePanStart(e: Konva.KonvaEventObject<PointerEvent>) {
    const isCtrlClick = e.evt.ctrlKey;
    const isMiddleClick = e.evt.button === 1;

    if (isCtrlClick || isMiddleClick) {
      e.evt.preventDefault();
      setIsDraggingPan(true);
      const pos = stageRef.current?.getPointerPosition();
      if (pos) {
        setPanStartPos({ x: pos.x - panX, y: pos.y - panY });
      }
    }
  }

  /**
   * Gérer le pan en cours
   */
  function handleStagePan(e: Konva.KonvaEventObject<PointerEvent>) {
    if (!isDraggingPan || !panStartPos) return;

    const stage = stageRef.current;
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const newPanX = pos.x - panStartPos.x;
    const newPanY = pos.y - panStartPos.y;

    setPanX(newPanX);
    setPanY(newPanY);

    const layer = layerRef.current;
    if (layer) {
      layer.position({ x: newPanX, y: newPanY });
    }
  }

  /**
   * Arrêter le pan
   */
  function handleStagePanEnd() {
    setIsDraggingPan(false);
    setPanStartPos(null);
  }

  /**
   * Zoomer en
   */
  function handleZoomIn() {
    const newScale = Math.min(3, scale + 0.2);
    setScale(newScale);
    const layer = layerRef.current;
    if (layer) {
      layer.scale({ x: newScale, y: newScale });
    }
  }

  /**
   * Zoomer out
   */
  function handleZoomOut() {
    const newScale = Math.max(0.5, scale - 0.2);
    setScale(newScale);
    const layer = layerRef.current;
    if (layer) {
      layer.scale({ x: newScale, y: newScale });
    }
  }

  /**
   * Réinitialiser le zoom et pan
   */
  function handleResetView() {
    setScale(1);
    setPanX(0);
    setPanY(0);
    const layer = layerRef.current;
    if (layer) {
      layer.scale({ x: 1, y: 1 });
      layer.position({ x: 0, y: 0 });
    }
  }

  /**
   * Ajouter nouvel objet au canvas
   * Centre automatiquement dans la zone de dessin (comme WinRelais)
   */
  function addNodeToCanvas(objectId: string) {
    const def = getObjectDefinition(objectId);
    if (!def) {
      console.error(`Object definition not found for ${objectId}`);
      return;
    }

    // Position centrée dans la zone de dessin (comme WinRelais)
    const centerX = width / 2;
    const centerY = height / 2;

    // Ajouter un petit décalage aléatoire pour éviter la superposition parfaite
    const offsetX = (Math.random() - 0.5) * 100; // ±50px
    const offsetY = (Math.random() - 0.5) * 100; // ±50px

    const nodeId = `node_${Date.now()}`;
    graphStore.addNode({
      id: nodeId,
      type: def.category,
      position: {
        x: Math.max(50, Math.min(width - 50, centerX + offsetX)),
        y: Math.max(50, Math.min(height - 50, centerY + offsetY))
      },
      params: {
        objectId,
        ...def.defaultParams
      },
      properties: {},
      metadata: { createdAt: Date.now(), modifiedAt: Date.now() }
    });

    // Sélectionner automatiquement le nouveau nœud
    setSelectedNodeId(nodeId);
    onNodeSelect?.(nodeId);

    return nodeId;
  }

  // ==================== RENDU ====================

  return (
    <div className="w-full h-full relative bg-slate-950 rounded-xl border border-slate-700/50 overflow-hidden flex flex-col">
      {/* ========== CANVAS PRINCIPAL ========== */}
      <div className="flex-1 relative">
        {/* Barre d'info rapide (haut-gauche du canvas) */}
        <div className="absolute top-3 left-3 z-10 text-xs text-slate-300 bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-600/50 shadow-lg">
          <div className="flex items-center gap-6">
            <div>Nœuds: <span className="text-blue-400 font-semibold">{nodes.size}</span></div>
            <div>Câbles: <span className="text-green-400 font-semibold">{edges.size}</span></div>
            <div>Souris: <span className="text-yellow-400 font-mono">({Math.round(mousePos.x)}, {Math.round(mousePos.y)})</span></div>
            <div>Zoom: <span className="text-purple-400 font-semibold">{Math.round(scale * 100)}%</span></div>
          </div>
          <div className="text-slate-400 mt-1 flex items-center gap-3">
            <span>Clic droit: menu | Suppr: supprimer | Échap: annuler</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`px-2 py-1 rounded text-xs font-mono ${showGrid ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'} hover:bg-blue-500 transition-colors`}
                title="Grille">
                
                ⬜
              </button>
              <button
                onClick={() => setShowAxes(!showAxes)}
                className={`px-2 py-1 rounded text-xs font-mono ${showAxes ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-400'} hover:bg-red-500 transition-colors`}
                title="Axes">
                
                ⊕
              </button>
              <button
                onClick={() => setShowGuides(!showGuides)}
                className={`px-2 py-1 rounded text-xs font-mono ${showGuides ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-400'} hover:bg-green-500 transition-colors`}
                title="Guides">
                
                🎯
              </button>
              <div className="w-px h-4 bg-slate-600 mx-1"></div>
              <button
                onClick={() => setCanvasWidth(Math.max(800, canvasWidth - 200))}
                className="px-2 py-1 rounded text-xs font-mono bg-slate-700 text-slate-400 hover:bg-slate-600 transition-colors"
                title="Réduire canvas">
                
                ➖
              </button>
              <span className="text-xs text-slate-500 font-mono px-1 min-w-[80px] text-center">
                {canvasWidth}×{canvasHeight}
              </span>
              <button
                onClick={() => setCanvasWidth(Math.min(2400, canvasWidth + 200))}
                className="px-2 py-1 rounded text-xs font-mono bg-slate-700 text-slate-400 hover:bg-slate-600 transition-colors"
                title="Agrandir canvas">
                
                ➕
              </button>
              <div className="w-px h-4 bg-slate-600 mx-1"></div>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-2 py-1 rounded text-xs font-mono bg-purple-600 text-white hover:bg-purple-500 transition-colors disabled:opacity-50"
                title="Exporter">
                
                💾
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Guide d'aide contextuel */}
      {nodes.size === 0 &&
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-slate-400 bg-slate-900/90 backdrop-blur-sm px-8 py-6 rounded-xl border border-slate-600/50 shadow-xl max-w-md">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Bienvenue dans PROQUELEC</h3>
            <p className="text-sm mb-4">
              Commencez par ajouter votre premier nœud électrique depuis le panneau latéral.
              Les nouveaux nœuds seront automatiquement centrés dans la zone optimale.
            </p>
            <div className="text-xs space-y-1">
              <div>🎯 Zone optimale : 60% centrale du canvas</div>
              <div>📐 Grille : 50px pour un placement précis</div>
              <div>🔧 Éditeur : Double-clic pour modifier</div>
            </div>
          </div>
        </div>
      }

      {/* Indicateur de connexion en cours */}
      {connectingFromNodeId &&
      <div className="absolute bottom-3 left-3 z-10 text-xs text-slate-300 bg-slate-900/90 backdrop-blur-sm px-4 py-3 rounded-lg border border-green-500/50 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div>
              <div className="font-semibold text-green-400">Connexion en cours</div>
              <div className="text-slate-400">Cliquez sur un nœud destination</div>
            </div>
          </div>
        </div>
      }

      {/* Indicateur de mode édition */}
      {(editingNodeId || editingEdgeId) &&
      <div className="absolute bottom-3 right-3 z-10 text-xs text-slate-300 bg-slate-900/90 backdrop-blur-sm px-4 py-3 rounded-lg border border-blue-500/50 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div>
              <div className="font-semibold text-blue-400">Mode édition</div>
              <div className="text-slate-400">
                {editingNodeId ? 'Modification du nœud' : 'Modification du câble'}
              </div>
            </div>
          </div>
        </div>
      }

      <Stage
        ref={stageRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          backgroundColor: '#0f172a',
          position: 'relative',
          width: '100%',
          height: '100%'
        }}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onMouseDown={handleStagePanStart}
        onWheel={handleStageWheel}>
        
        <Layer ref={layerRef}>
          {/* ========== GRILLE ET REPÈRES ========== */}

          {/* Grille de fond (lignes verticales) */}
          {showGrid && Array.from({ length: Math.ceil(canvasWidth / 50) + 1 }, (_, i) => {
            const x = i * 50;
            return (
              <Line
                key={`v-grid-${i}`}
                points={[x, 0, x, canvasHeight]}
                stroke="#1E293B"
                strokeWidth={0.5}
                opacity={0.3} />);


          })}

          {/* Grille de fond (lignes horizontales) */}
          {showGrid && Array.from({ length: Math.ceil(canvasHeight / 50) + 1 }, (_, i) => {
            const y = i * 50;
            return (
              <Line
                key={`h-grid-${i}`}
                points={[0, y, canvasWidth, y]}
                stroke="#1E293B"
                strokeWidth={0.5}
                opacity={0.3} />);


          })}

          {/* Axe X principal (rouge) */}
          {showAxes && <Line
            points={[0, canvasHeight / 2, canvasWidth, canvasHeight / 2]}
            stroke="#DC2626"
            strokeWidth={1}
            opacity={0.6} />
          }

          {/* Axe Y principal (rouge) */}
          {showAxes && <Line
            points={[canvasWidth / 2, 0, canvasWidth / 2, canvasHeight]}
            stroke="#DC2626"
            strokeWidth={1}
            opacity={0.6} />
          }

          {/* Centre du canvas (point rouge) */}
          {showAxes && <Circle
            x={canvasWidth / 2}
            y={canvasHeight / 2}
            radius={3}
            fill="#DC2626"
            opacity={0.8} />
          }

          {/* Repères de coordonnées (tous les 100px) */}
          {showAxes && Array.from({ length: Math.ceil(canvasWidth / 100) + 1 }, (_, i) => {
            const x = i * 100;
            return (
              <Group key={`coord-x-${i}`}>
                <Text
                  x={x - 10}
                  y={canvasHeight / 2 + 5}
                  text={x.toString()}
                  fill="#94A3B8"
                  fontSize={8}
                  fontFamily="monospace" />
                
                <Line
                  points={[x, canvasHeight / 2 - 3, x, canvasHeight / 2 + 3]}
                  stroke="#94A3B8"
                  strokeWidth={1}
                  opacity={0.7} />
                
              </Group>);

          })}

          {showAxes && Array.from({ length: Math.ceil(canvasHeight / 100) + 1 }, (_, i) => {
            const y = i * 100;
            return (
              <Group key={`coord-y-${i}`}>
                <Text
                  x={canvasWidth / 2 + 5}
                  y={y - 5}
                  text={y.toString()}
                  fill="#94A3B8"
                  fontSize={8}
                  fontFamily="monospace" />
                
                <Line
                  points={[width / 2 - 3, y, width / 2 + 3, y]}
                  stroke="#94A3B8"
                  strokeWidth={1}
                  opacity={0.7} />
                
              </Group>);

          })}

          {/* Bordure de la zone de dessin */}
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            stroke="#475569"
            strokeWidth={2}
            fill="transparent"
            opacity={0.5} />
          

          {/* Indicateur de zone de travail */}
          <Text
            x={10}
            y={10}
            text="🖼️ ZONE DE DESSIN"
            fill="#64748B"
            fontSize={10}
            fontFamily="monospace"
            fontStyle="bold" />
          

          {/* Afficher arêtes (câbles) */}
          {Array.from(edges.values()).map((edge) => {
            const fromNode = nodes.get(edge.from);
            const toNode = nodes.get(edge.to);

            if (!fromNode || !toNode) return null;

            const thickness = Math.max(1, (edge.properties.section || 1.5) / 3);
            const isSelected = selectedEdgeId === edge.id;
            const color = isSelected ? '#EF4444' : getEdgeColor(edge);

            return (
              <Group key={edge.id}>
                {/* Ligne du câble */}
                <Line
                  points={[fromNode.position.x, fromNode.position.y, toNode.position.x, toNode.position.y]}
                  stroke={color}
                  strokeWidth={isSelected ? thickness + 2 : thickness}
                  lineCap="round"
                  lineJoin="round"
                  onClick={() => handleEdgeClick(edge.id)}
                  onDblClick={() => handleEdgeDoubleClick(edge.id)}
                  onContextMenu={(e) => e.evt.preventDefault()} />
                

                {/* Étiquette longueur (au milieu du câble) */}
                <Text
                  x={(fromNode.position.x + toNode.position.x) / 2 - 15}
                  y={(fromNode.position.y + toNode.position.y) / 2 - 10}
                  text={`${edge.properties.length.toFixed(1)}m`}
                  fill="#10B981"
                  fontSize={10}
                  fontFamily="monospace"
                  onClick={() => handleEdgeDistanceClick(edge.id, edge.properties.length)}
                  style={{ cursor: 'pointer' }} />
                
              </Group>);

          })}

          {/* Afficher nœuds (objets normatifs) */}
          {Array.from(nodes.values()).map((node) => {
            // Récupérer les infos du symbole électrique associé
            const nodeDef = getObjectDefinition(node.params?.objectId);

            // Mapper le symbole de ObjectDefinition vers ElectricalSymbols
            const symbolMapping: Record<string, keyof typeof ELECTRICAL_SYMBOLS> = {
              // SOURCES
              'source_type_a': 'MAISON',
              'source_type_b': 'TRANSFORMATEUR',

              // PROTECTIONS
              'breaker_6a': 'DISJONCTEUR',
              'breaker_16a': 'DISJONCTEUR',
              'ddr_30ma': 'DDR',
              'fuse_10a': 'FUSIBLE',

              // DISTRIBUTION
              'tgbt': 'COFFRET_CCPC',
              'tableau_div': 'COFFRET_CCPI',

              // DERIVATION
              'derivation_box': 'BOITE_DERIVATION',
              'junction_box': 'BOITE_DERIVATION',

              // COUPURE
              'sectionalizer': 'SECTIONNEUR',
              'disconnector': 'SECTIONNEUR',

              // RECEPTORS
              'lighting_led': 'INTERRUPTEUR',
              'outlets_16a': 'PRISE',
              'motor_3kw': 'MOTEUR',
              'charging_point': 'BORNE_RECHARGE',

              // TRANSFORMATION
              'transformer_private': 'TRANSFORMATEUR',
              'converter_dc': 'CONVERTISSEUR',

              // PRODUCTION
              'solar_panel': 'PANNEAU_SOL',
              'generator': 'GENERATEUR',

              // GROUND
              'ground_rod': 'PIQUET_TERRE',
              'ground_loop': 'BOUCLE_TERRE',

              // CABLES
              'cable_cu_15': 'CABLE',
              'cable_cu_25': 'CABLE',
              'cable_cu_4': 'CABLE'
            };

            const symbolId = symbolMapping[node.params?.objectId as string] || 'MAISON';
            const symbol = ELECTRICAL_SYMBOLS[symbolId];
            const symbolColor = symbol?.color || '#3B82F6';

            return (
              <Group
                key={node.id}
                x={node.position.x}
                y={node.position.y}
                draggable
                onDragEnd={(e) => handleNodeDragEnd(node.id, e)}>
                
                {/* Cercle de base (fond) */}
                <Circle
                  x={0}
                  y={0}
                  radius={35}
                  fill={symbolColor}
                  opacity={0.15}
                  stroke={symbolColor}
                  strokeWidth={2}
                  onClick={() => handleNodeClick(node.id)}
                  onDblClick={() => handleNodeDoubleClick(node.id)}
                  onContextMenu={(e) => handleNodeContextMenu(node.id, e)}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: 'pointer' }} />
                

                {/* Cercle de sélection (source en attente) */}
                {connectingFromNodeId === node.id &&
                <Circle
                  x={0}
                  y={0}
                  radius={42}
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth={3}
                  dash={[4, 4]} />

                }

                {/* Cercle de sélection classique (ou destination) */}
                {selectedNodeId === node.id && connectingFromNodeId !== node.id &&
                <Circle
                  x={0}
                  y={0}
                  radius={42}
                  fill="transparent"
                  stroke="#FBBF24"
                  strokeWidth={3}
                  dash={[5, 5]} />

                }

                {/* Symbole emoji (icône) */}
                <Text
                  x={-15}
                  y={-10}
                  text={symbol?.icon || '⚙️'}
                  fill={symbolColor}
                  fontSize={28}
                  fontFamily="Arial"
                  onClick={() => handleNodeClick(node.id)}
                  onDblClick={() => handleNodeDoubleClick(node.id)}
                  style={{ cursor: 'pointer' }} />
                

                {/* Label texte (type court) */}
                <Text
                  x={-18}
                  y={30}
                  text={node.type.substring(0, 2).toUpperCase()}
                  fill="#94A3B8"
                  fontSize={8}
                  fontFamily="monospace"
                  fontStyle="bold"
                  align="center"
                  width={36} />
                

                {/* Indicateur de charges (pour RECEPTOR) */}
                {node.type === 'RECEPTOR' && node.charges && node.charges.length > 0 &&
                <Group>
                    {/* Cercle indicateur de charges */}
                    <Circle
                    x={25}
                    y={-25}
                    radius={8}
                    fill="#10B981"
                    stroke="#065F46"
                    strokeWidth={1} />
                  
                    {/* Nombre de charges */}
                    <Text
                    x={21}
                    y={-29}
                    text={node.charges.length.toString()}
                    fill="white"
                    fontSize={10}
                    fontFamily="Arial"
                    fontStyle="bold"
                    align="center"
                    width={8} />
                  
                    {/* Puissance totale (en kW) */}
                    <Text
                    x={-25}
                    y={42}
                    text={`${(node.charges.reduce((sum, c) => sum + c.puissance, 0) / 1000).toFixed(1)}kW`}
                    fill="#10B981"
                    fontSize={8}
                    fontFamily="monospace"
                    fontStyle="bold"
                    align="center"
                    width={50} />
                  
                  </Group>
                }

                {/* Tooltip au survol : nom du symbole */}
                <Text
                  x={-50}
                  y={-50}
                  text={symbol?.name || 'Unknown'}
                  fill="#E2E8F0"
                  fontSize={10}
                  fontFamily="Arial"
                  opacity={0.8} />
                

                {/* Tooltip détaillé des charges (au survol) */}
                {node.type === 'RECEPTOR' && node.charges && node.charges.length > 0 &&
                <Group opacity={0.95}>
                    <Rect
                    x={-80}
                    y={-80}
                    width={160}
                    height={node.charges.length * 18 + 50}
                    fill="#1E293B"
                    stroke="#334155"
                    strokeWidth={1}
                    cornerRadius={6} />
                  
                    <Text
                    x={-75}
                    y={-75}
                    text="📊 Charges Électriques"
                    fill="#F1F5F9"
                    fontSize={10}
                    fontFamily="Arial"
                    fontStyle="bold" />
                  
                    {node.charges.map((charge, index) => {
                    const current = charge.puissance / (charge.tension * charge.cosPhi);
                    return (
                      <Group key={charge.id}>
                          <Text
                          x={-75}
                          y={-55 + index * 18}
                          text={`• ${charge.nom.substring(0, 10)}`}
                          fill="#CBD5E1"
                          fontSize={9}
                          fontFamily="Arial"
                          fontStyle="bold" />
                        
                          <Text
                          x={-75}
                          y={-45 + index * 18}
                          text={`${charge.puissance}W • ${current.toFixed(1)}A • cosφ=${charge.cosPhi}`}
                          fill="#94A3B8"
                          fontSize={8}
                          fontFamily="Arial" />
                        
                        </Group>);

                  })}
                    {/* Total */}
                    {(() => {
                    const totalPower = node.charges.reduce((sum, c) => sum + c.puissance, 0);
                    const totalCurrent = node.charges.reduce((sum, c) => sum + c.puissance / (c.tension * c.cosPhi), 0);
                    return (
                      <Group>
                          <Text
                          x={-75}
                          y={-55 + node.charges.length * 18 + 5}
                          text={`Total: ${totalPower}W • ${totalCurrent.toFixed(1)}A`}
                          fill="#10B981"
                          fontSize={9}
                          fontFamily="Arial"
                          fontStyle="bold" />
                        
                        </Group>);

                  })()}
                  </Group>
                }
              </Group>);

          })}
        </Layer>
      </Stage>

      {/* Indicateur de zone centrale (pointillé) - CONDITIONNEL */}
      {showGuides &&
      <div className="absolute inset-0 pointer-events-none">
          <div
          className="absolute border-2 border-dashed border-blue-500/30 rounded-lg"
          style={{
            left: '20%',
            top: '20%',
            width: '60%',
            height: '60%'
          }} />
        
          <div className="absolute text-xs text-blue-400 font-mono" style={{ left: '20%', top: '18%' }}>
            ZONE OPTIMALE
          </div>
          {/* Indicateur de point d'insertion central */}
          <div
          className="absolute w-6 h-6 border-2 border-green-400 rounded-full bg-green-400/20 flex items-center justify-center"
          style={{
            left: 'calc(50% - 12px)',
            top: 'calc(50% - 12px)'
          }}>
          
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div className="absolute text-xs text-green-400 font-mono" style={{ left: 'calc(50% + 20px)', top: 'calc(50% - 8px)' }}>
            POINT CENTRAL
          </div>
        </div>
      }

      {/* ========== PANNEAUX REPOSITIONNÉS ========== */}

      {/* 1. ZOOM CONTROLS - Top-left (compact) */}
      <div className="absolute top-3 right-3 z-20 flex gap-1 bg-slate-900/85 backdrop-blur-sm p-2 rounded-lg border border-slate-600/50 shadow-lg">
        <button
          onClick={handleZoomOut}
          className="p-2 bg-slate-700/60 hover:bg-slate-600/80 text-white rounded font-bold text-sm transition-all hover:scale-105"
          title="Zoom - (Ctrl + molette)">
          
          −
        </button>
        <button
          onClick={handleResetView}
          className="p-2 bg-slate-700/60 hover:bg-slate-600/80 text-white rounded font-bold text-sm transition-all hover:scale-105"
          title="Réinitialiser">
          
          ⊙
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 bg-slate-700/60 hover:bg-slate-600/80 text-white rounded font-bold text-sm transition-all hover:scale-105"
          title="Zoom + (Ctrl + molette)">
          
          +
        </button>
      </div>

      {/* 2. HUD INFO - Bottom-right (compact) */}
      <div className="absolute bottom-3 right-3 z-20 bg-slate-900/85 backdrop-blur-sm px-3 py-2 rounded-lg border border-blue-500/30 text-xs font-mono space-y-1 shadow-lg">
        <div className="text-blue-300 flex items-center gap-1">
          <span>📍 X:</span>
          <span className="text-blue-400 font-bold">{rulerHorizontalPos.toFixed(0)}px</span>
        </div>
        <div className="text-blue-300 flex items-center gap-1">
          <span>📍 Y:</span>
          <span className="text-blue-400 font-bold">{rulerVerticalPos.toFixed(0)}px</span>
        </div>
        <div className="border-t border-slate-600/50 pt-1 mt-1 text-cyan-300 flex items-center gap-1">
          <span>🔍</span>
          <span className="text-cyan-400 font-bold">{(scale * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* 3. HELP TEXT - Top-center */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20 text-xs text-slate-300 bg-slate-900/70 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-600/50 whitespace-nowrap">
        <span className="text-cyan-400">🖱️ Clic</span> = Source → Cible |
        <span className="text-cyan-400 ml-1">🎯 2x Clic</span> = Éditer |
        <span className="text-cyan-400 ml-1">🌀 Roue</span> = Zoom
      </div>

      {/* 4. SELECTED NODE INFO - Bottom-left */}
      {selectedNodeId && nodes.has(selectedNodeId) &&
      <div className="absolute bottom-3 left-3 z-20 text-xs bg-slate-900/85 backdrop-blur-sm p-3 rounded-lg border border-slate-600/50 max-w-xs space-y-1 shadow-lg">
          <div className="font-bold text-amber-400 font-mono text-sm">{selectedNodeId}</div>
          <div className="text-slate-300 text-xs grid grid-cols-2 gap-2">
            <div><span className="text-slate-500">X:</span> <span className="text-slate-200 font-mono">{nodes.get(selectedNodeId)?.position.x.toFixed(0)}</span></div>
            <div><span className="text-slate-500">Y:</span> <span className="text-slate-200 font-mono">{nodes.get(selectedNodeId)?.position.y.toFixed(0)}</span></div>
          </div>
          <div className="text-slate-400 text-xs">
            Type: <span className="text-slate-300 font-mono">{nodes.get(selectedNodeId)?.type}</span>
          </div>
        </div>
      }

      {/* 5. SELECTED EDGE INFO - Bottom-left */}
      {selectedEdgeId && edges.has(selectedEdgeId) &&
      <div className="absolute bottom-3 left-3 z-20 text-xs bg-slate-900/85 backdrop-blur-sm p-3 rounded-lg border border-slate-600/50 max-w-xs space-y-2 shadow-lg">
          <div className="font-bold text-green-400 font-mono text-sm">Câble sélectionné</div>
          <div className="text-slate-300 text-xs grid grid-cols-2 gap-2">
            <div><span className="text-slate-500">L:</span> <span className="text-slate-200 font-mono">{edges.get(selectedEdgeId)?.properties.length?.toFixed(1) || 0} m</span></div>
            <div><span className="text-slate-500">S:</span> <span className="text-slate-200 font-mono">{edges.get(selectedEdgeId)?.properties.section || 2.5} mm²</span></div>
          </div>
          {onAnalyzeEdge &&
          <button
              onClick={() => onAnalyzeEdge(selectedEdgeId)}
              className="w-full mt-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded font-bold text-xs transition-all shadow-md">
              ⚡ Analyser Conformité
            </button>
          }
        </div>
      }

      {/* ========== PALETTE D'OBJETS - Bottom (full width) ========== */}
      <div className="flex gap-2 overflow-x-auto p-3 bg-gradient-to-t from-slate-900/95 via-slate-900/80 to-transparent backdrop-blur-sm border-t border-slate-700/50">
        <button
          onClick={() => {
            const nodeId = addNodeToCanvas('source_type_a');
            if (nodeId) handleNodeClick(nodeId);
          }}
          className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-semibold rounded-lg whitespace-nowrap transition-all shadow-lg hover:scale-105">
          
          ⚡ Source
        </button>
        <button
          onClick={() => {
            const nodeId = addNodeToCanvas('tgbt');
            if (nodeId) handleNodeClick(nodeId);
          }}
          className="px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white text-sm font-semibold rounded-lg whitespace-nowrap transition-all shadow-lg hover:scale-105">
          
          📦 TGBT
        </button>
        <button
          onClick={() => {
            const nodeId = addNodeToCanvas('breaker_6a');
            if (nodeId) handleNodeClick(nodeId);
          }}
          className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-semibold rounded-lg whitespace-nowrap transition-all shadow-lg hover:scale-105">
          
          🚨 Disjoncteur
        </button>
        <button
          onClick={() => {
            const nodeId = addNodeToCanvas('lighting_led');
            if (nodeId) handleNodeClick(nodeId);
          }}
          className="px-3 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white text-sm font-semibold rounded-lg whitespace-nowrap transition-all shadow-lg hover:scale-105">
          
          💡 Éclairage
        </button>
        <button
          onClick={() => {
            const nodeId = addNodeToCanvas('outlets_16a');
            if (nodeId) handleNodeClick(nodeId);
          }}
          className="px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white text-sm font-semibold rounded-lg whitespace-nowrap transition-all shadow-lg hover:scale-105">
          
          🔌 Prises
        </button>
      </div>

      {/* Dialog édition distance */}
      {
      editingEdgeId &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 shadow-2xl max-w-sm">
              <h3 className="text-white font-bold text-lg mb-4">Éditer distance du câble</h3>
              <input
            type="number"
            value={editingDistance}
            onChange={(e) => setEditingDistance(e.target.value)}
            placeholder="Distance en mètres"
            className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg mb-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            autoFocus
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleDistanceConfirm();
              if (e.key === 'Escape') {
                setEditingEdgeId(null);
                setEditingDistance('');
              }
            }} />
          
              <div className="flex gap-2">
                <button
              onClick={handleDistanceConfirm}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-lg transition-all">
              
                  ✓ Appliquer
                </button>
                <button
              onClick={() => {
                setEditingEdgeId(null);
                setEditingDistance('');
              }}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all">
              
                  ✕ Annuler
                </button>
              </div>
            </div>
          </div>

      }

      {/* Dialog édition de nœud */}
      {
      editingNodeId && nodes.has(editingNodeId) && (() => {
        const node = nodes.get(editingNodeId)!;
        const isReceptor = node.type === 'RECEPTOR';

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className={`bg-slate-800 p-6 rounded-xl border border-slate-600 shadow-2xl ${isReceptor ? 'max-w-4xl max-h-[90vh] overflow-y-auto' : 'max-w-sm'}`}>
                <h3 className="text-white font-bold text-lg mb-4">
                  Éditer {isReceptor ? 'charge' : 'paramètres'} du nœud
                </h3>

                {isReceptor ?
              <div className="space-y-4">
                    <ChargeEditor
                  nodeId={editingNodeId}
                  charges={graphStore.getCharges(editingNodeId)}
                  onAddCharge={graphStore.addCharge.bind(graphStore, editingNodeId)}
                  onUpdateCharge={graphStore.updateCharge.bind(graphStore, editingNodeId)}
                  onRemoveCharge={graphStore.removeCharge.bind(graphStore, editingNodeId)}
                  onClose={() => setEditingNodeId(null)} />
                
                  </div> :

              <NodeParameterEditor node={node} onClose={() => setEditingNodeId(null)} />
              }

                {!isReceptor &&
              <div className="flex gap-2">
                    <button
                  onClick={() => setEditingNodeId(null)}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-lg transition-all">
                  
                      ✓ Fermer
                    </button>
                    <button
                  onClick={() => setEditingNodeId(null)}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-semibold rounded-lg transition-all">
                  
                      Annuler
                    </button>
                  </div>
              }
              </div>
            </div>);

      })()
      }

      {/* Dialog édition de câble */}
      {
      editingEdgeId && edges.has(editingEdgeId) &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 shadow-2xl max-w-sm">
              <h3 className="text-white font-bold text-lg mb-4">Éditer paramètres du câble</h3>
              <div className="space-y-3 mb-4">
                {/* Section (mm²) */}
                <div>
                  <label className="text-slate-300 text-sm font-medium">Section (mm²)</label>
                  <input
                type="number"
                value={editingEdgeValues.section}
                onChange={(e) => setEditingEdgeValues((prev) => ({ ...prev, section: parseFloat(e.target.value) || 1.5 }))}
                placeholder="Section"
                className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" />
              
                </div>

                {/* Courant (A) */}
                <div>
                  <label className="text-slate-300 text-sm font-medium">Courant (A)</label>
                  <input
                type="number"
                value={editingEdgeValues.courant}
                onChange={(e) => setEditingEdgeValues((prev) => ({ ...prev, courant: parseFloat(e.target.value) || 10 }))}
                placeholder="Courant"
                className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" />
              
                </div>

                {/* Matériau */}
                <div>
                  <label className="text-slate-300 text-sm font-medium">Matériau</label>
                  <select title="Sélectionner une option"
              value={editingEdgeValues.materiau}
              onChange={(e) => setEditingEdgeValues((prev) => ({ ...prev, materiau: e.target.value as 'Cu' | 'Al' }))}
              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30">
                
                    <option value="Cu">Cuivre (Cu)</option>
                    <option value="Al">Aluminium (Al)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
              onClick={() => {
                // Confirmation avant sauvegarde
                const confirmed = window.confirm(
                  `Confirmer la sauvegarde des propriétés du câble ?\n\n` +
                  `Section: ${editingEdgeValues.section} mm²\n` +
                  `Courant: ${editingEdgeValues.courant} A\n` +
                  `Matériau: ${editingEdgeValues.materiau}\n\n` +
                  `Les calculs de chute de tension seront mis à jour.`
                );

                if (!confirmed) return;

                const edge = edges.get(editingEdgeId);
                if (edge) {
                  graphStore.updateEdgeProperties(editingEdgeId, {
                    ...edge.properties,
                    section: editingEdgeValues.section,
                    courant: editingEdgeValues.courant,
                    materiau: editingEdgeValues.materiau
                  });
                }
                setEditingEdgeId(null);
              }}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-lg transition-all">
              
                  💾 Sauvegarder
                </button>
                <button
              onClick={() => setEditingEdgeId(null)}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-semibold rounded-lg transition-all">
              
                  ❌ Annuler
                </button>
              </div>
            </div>
          </div>

      }
    </div>);

}

export default SchematicCanvas;