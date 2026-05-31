import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Frame, Element, useEditor } from '@craftjs/core';
import {
  ContainerBlock, HeroBlock, TextBlock, StatsBlock, SpacerBlock
} from '../blocks/ProquelecBlocks';
import {
  Trash2, Copy, ChevronUp, ChevronDown, Eye, Clipboard,
  Paintbrush, RefreshCw, Layers, Save
} from 'lucide-react';
import { toast } from 'sonner';
import { BuilderErrorBoundary } from './BuilderErrorBoundary';
import { useBuilderUiStore } from '@/stores/builder-ui.store';
import { useGlobalBlocksStore } from '@/stores/global-blocks.store';
import { useAnimateOnScroll } from '@/hooks/useAnimateOnScroll';

const VIEWPORT_WIDTHS: Record<string, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
};

// ─────────────────────────────────────────────────────────
// FLOATING ACTION BAR (appears above selected block)
// ─────────────────────────────────────────────────────────
const FloatingActionBar = () => {
  const { actions, selected, isEnabled } = useEditor((state, query) => {
    const selectedSet = state.events.selected;
    const id = selectedSet ? Array.from(selectedSet)[0] as string : null;

    if (!id || !state.nodes[id]) return { selected: null, isEnabled: state.options.enabled };

    const node = state.nodes[id];
    const parentId = node.data.parent;
    const siblings = parentId && state.nodes[parentId]?.data?.nodes || [];
    const myIndex = siblings.indexOf(id);

    return {
      selected: {
        id,
        name: node.data.displayName || node.data.name,
        isDeletable: query.node(id).isDeletable(),
        parentId,
        siblings,
        myIndex,
      },
      isEnabled: state.options.enabled,
    };
  });

  if (!selected || !isEnabled) return null;

  const canMoveUp = selected.myIndex > 0;
  const canMoveDown = selected.myIndex < selected.siblings.length - 1;

  const handleDuplicate = () => {
    window.dispatchEvent(new CustomEvent('god-duplicate-node', { detail: selected.id }));
  };

  const handleMoveUp = () => {
    if (!canMoveUp || !selected.parentId) return;
    actions.move(selected.id, selected.parentId, selected.myIndex - 1);
    toast.success('Bloc déplacé vers le haut');
  };

  const handleMoveDown = () => {
    if (!canMoveDown || !selected.parentId) return;
    actions.move(selected.id, selected.parentId, selected.myIndex + 2);
    toast.success('Bloc déplacé vers le bas');
  };

  return (
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{ top: 0, left: 0, right: 0 }}
    >
      {/* Selection outline & actions is managed natively or via custom menu */}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// BREADCRUMB
// ─────────────────────────────────────────────────────────
const Breadcrumb = () => {
  const { ancestors, selectedName, isEnabled } = useEditor((state, query) => {
    const selectedSet = state.events.selected;
    const id = selectedSet ? Array.from(selectedSet)[0] as string : null;

    if (!id || !state.nodes[id]) return { ancestors: [], selectedName: null, isEnabled: state.options.enabled };

    const ancestors: { id: string; name: string }[] = [];
    let currentId: string | null = state.nodes[id]?.data?.parent || null;
    while (currentId && state.nodes[currentId]) {
      const node = state.nodes[currentId];
      ancestors.unshift({ id: currentId, name: node.data.displayName || node.data.name });
      currentId = node.data.parent || null;
    }

    return {
      ancestors,
      selectedName: state.nodes[id]?.data?.displayName || state.nodes[id]?.data?.name,
      isEnabled: state.options.enabled,
    };
  });

  if (!selectedName || !isEnabled) return null;

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-[#12121f]/95 backdrop-blur border border-[#252538] rounded-full px-3 py-1.5 text-[11px] shadow-xl">
      <span className="text-slate-500">Page</span>
      {ancestors.map(a => (
        <React.Fragment key={a.id}>
          <span className="text-slate-600">›</span>
          <span className="text-slate-400">{a.name}</span>
        </React.Fragment>
      ))}
      <span className="text-slate-600">›</span>
      <span className="text-indigo-400 font-semibold">{selectedName}</span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// EMPTY CANVAS PLACEHOLDER
// ─────────────────────────────────────────────────────────
const EmptyCanvasHint = () => {
  const { isEmpty, isEnabled } = useEditor((state, query) => {
    const rootNodes = state.nodes['ROOT']?.data?.nodes || [];
    return {
      isEmpty: rootNodes.length === 0,
      isEnabled: state.options.enabled,
    };
  });

  if (!isEmpty || !isEnabled) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center space-y-3 p-8">
        <div className="text-5xl animate-bounce">🎨</div>
        <p className="text-slate-400 font-semibold">Page vide</p>
        <p className="text-slate-500 text-sm max-w-xs">
          Glissez des blocs depuis le panneau de gauche pour construire votre page
        </p>
      </div>
    </div>
  );
};

export const CanvasOverlays = () => {
  const hoveredNodeId = useBuilderUiStore(s => s.hoveredNodeId);
  const { selectedNodeId, query, isEnabled } = useEditor((state) => {
    const selectedSet = state.events.selected;
    const id = selectedSet ? Array.from(selectedSet)[0] as string : null;
    return {
      selectedNodeId: id,
      isEnabled: state.options.enabled
    };
  });

  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);
  const [selectedRect, setSelectedRect] = useState<DOMRect | null>(null);
  const [hoverName, setHoverName] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [paddingStyles, setPaddingStyles] = useState<any>(null);
  const [marginStyles, setMarginStyles] = useState<any>(null);

  const updateRects = useCallback(() => {
    if (!isEnabled) {
      setHoverRect(null);
      setSelectedRect(null);
      return;
    }

    let nextHoverRect: DOMRect | null = null;
    let nextSelectedRect: DOMRect | null = null;

    if (hoveredNodeId && hoveredNodeId !== 'ROOT') {
      const dom = query.node(hoveredNodeId).get().dom;
      if (dom) {
        nextHoverRect = dom.getBoundingClientRect();
        const node = query.node(hoveredNodeId).get();
        setHoverName(node.data.displayName || node.data.name);
      }
    }

    if (selectedNodeId && selectedNodeId !== 'ROOT') {
      const dom = query.node(selectedNodeId).get().dom;
      if (dom) {
        nextSelectedRect = dom.getBoundingClientRect();
        const node = query.node(selectedNodeId).get();
        setSelectedName(node.data.displayName || node.data.name);

        // Extract padding / margin computed values for visual guidelines
        const style = window.getComputedStyle(dom);
        setPaddingStyles({
          top: style.paddingTop,
          right: style.paddingRight,
          bottom: style.paddingBottom,
          left: style.paddingLeft
        });
        setMarginStyles({
          top: style.marginTop,
          right: style.marginRight,
          bottom: style.marginBottom,
          left: style.marginLeft
        });
      }
    }

    setHoverRect(nextHoverRect);
    setSelectedRect(nextSelectedRect);
  }, [hoveredNodeId, selectedNodeId, query, isEnabled]);

  // Batch updates using requestAnimationFrame
  useEffect(() => {
    let active = true;
    const tick = () => {
      if (!active) return;
      updateRects();
      requestAnimationFrame(tick);
    };

    // Trigger on scroll or resize
    window.addEventListener('scroll', updateRects, true);
    window.addEventListener('resize', updateRects);

    requestAnimationFrame(tick);

    return () => {
      active = false;
      window.removeEventListener('scroll', updateRects, true);
      window.removeEventListener('resize', updateRects);
    };
  }, [updateRects]);

  if (!isEnabled) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[999999]">
      {/* Hover Outline */}
      {hoverRect && hoveredNodeId !== selectedNodeId && (
        <div
          className="absolute border border-sky-400 bg-sky-400/5 transition-all duration-75"
          style={{
            top: hoverRect.top,
            left: hoverRect.left,
            width: hoverRect.width,
            height: hoverRect.height,
          }}
        >
          <div className="absolute -top-5 left-0 bg-sky-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1">
            <span>{hoverName}</span>
            <span className="opacity-75">{Math.round(hoverRect.width)} x {Math.round(hoverRect.height)}</span>
          </div>
        </div>
      )}

      {/* Selected Outline & Spacing Guides */}
      {selectedRect && (
        <div
          className="absolute border-2 border-indigo-500 transition-all duration-75"
          style={{
            top: selectedRect.top,
            left: selectedRect.left,
            width: selectedRect.width,
            height: selectedRect.height,
          }}
        >
          <div className="absolute -top-5.5 left-0 bg-indigo-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1.5">
            <span>{selectedName}</span>
            <span className="opacity-75">{Math.round(selectedRect.width)} x {Math.round(selectedRect.height)}</span>
          </div>

          {/* Padding Visualizer (Inside) */}
          {paddingStyles && (
            <div className="absolute inset-0 border border-emerald-400/30 bg-emerald-400/5 pointer-events-none">
              {/* Padding Indicators */}
              <div className="absolute top-0 left-0 right-0 bg-emerald-400/10" style={{ height: paddingStyles.top }} />
              <div className="absolute bottom-0 left-0 right-0 bg-emerald-400/10" style={{ height: paddingStyles.bottom }} />
              <div className="absolute top-0 bottom-0 left-0 bg-emerald-400/10" style={{ width: paddingStyles.left }} />
              <div className="absolute top-0 bottom-0 right-0 bg-emerald-400/10" style={{ width: paddingStyles.right }} />
            </div>
          )}
        </div>
      )}
    </div>,
    document.body
  );
};

// ─────────────────────────────────────────────────────────
// MAIN CANVAS
// ─────────────────────────────────────────────────────────
export const GodCanvas = () => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [zoom, setZoom] = useState(100);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
    nodeName: string;
  } | null>(null);

  const { isEnabled, actions, query } = useEditor(state => ({
    isEnabled: state.options.enabled
  }));

  const { setHoveredNodeId, hoveredNodeId } = useBuilderUiStore();

  const canvasRef = useRef<HTMLDivElement | null>(null);
  useAnimateOnScroll(canvasRef, { threshold: 0.1, once: true });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isEnabled) return;
    const target = e.target as HTMLElement;
    const allNodeIds = Object.keys(query.getSerializedNodes());
    let hoveredId: string | null = null;
    let deepestDepth = -1;

    for (const id of allNodeIds) {
      const dom = query.node(id).get().dom;
      if (dom && dom.contains(target)) {
        const depth = query.node(id).ancestors().length;
        if (depth > deepestDepth && id !== 'ROOT') {
          deepestDepth = depth;
          hoveredId = id;
        }
      }
    }

    if (hoveredId !== hoveredNodeId) {
      setHoveredNodeId(hoveredId);
    }
  };

  useEffect(() => {
    const handler = (e: CustomEvent) => setDevice(e.detail as any);
    window.addEventListener('god-viewport-change', handler as any);
    return () => window.removeEventListener('god-viewport-change', handler as any);
  }, []);

  // Close context menu on left click anywhere
  useEffect(() => {
    const handleClose = () => setContextMenu(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  // Duplicate custom event listener
  useEffect(() => {
    const handleDuplicateCustom = (e: CustomEvent) => {
      const nodeId = e.detail;
      if (nodeId) handleDuplicate(nodeId);
    };
    window.addEventListener('god-duplicate-node', handleDuplicateCustom as any);
    return () => window.removeEventListener('god-duplicate-node', handleDuplicateCustom as any);
  }, [query]);

  // Synchronize lockedNodes & hiddenNodes from Zustand to canvas DOM attributes
  const { lockedNodes, hiddenNodes } = useBuilderUiStore();
  useEffect(() => {
    if (!isEnabled) return;
    const allNodeIds = Object.keys(query.getSerializedNodes());
    allNodeIds.forEach(id => {
      try {
        const dom = query.node(id).get().dom;
        if (dom) {
          dom.setAttribute('data-locked', lockedNodes[id] ? 'true' : 'false');
          dom.setAttribute('data-hidden', hiddenNodes[id] ? 'true' : 'false');
        }
      } catch (e) {}
    });
  }, [lockedNodes, hiddenNodes, query, isEnabled]);

  const deviceLabel = {
    desktop: '🖥️ Desktop',
    tablet: '📱 Tablet — 768px',
    mobile: '📱 Mobile — 390px',
  }[device];

  // ─────────────────────────────────────────────────────────
  // CONTEXT MENU HANDLERS
  // ─────────────────────────────────────────────────────────
  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isEnabled) return;
    e.preventDefault();

    const target = e.target as HTMLElement;
    const allNodeIds = Object.keys(query.getSerializedNodes());
    let clickedNodeId: string | null = null;
    let deepestDepth = -1;

    // Find deepest node DOM element containing the target
    for (const id of allNodeIds) {
      const node = query.node(id).get();
      if (node.dom && node.dom.contains(target)) {
        const depth = query.node(id).ancestors().length;
        if (depth > deepestDepth && id !== 'ROOT') {
          deepestDepth = depth;
          clickedNodeId = id;
        }
      }
    }

    if (!clickedNodeId) {
      clickedNodeId = 'ROOT';
    }

    // Select the clicked node
    actions.selectNode(clickedNodeId);

    const nodeName = query.node(clickedNodeId).get().data.displayName || query.node(clickedNodeId).get().data.name;

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      nodeId: clickedNodeId,
      nodeName,
    });
  };

  const isNodeLocked = useCallback((id: string): boolean => {
    let currentId: string | null = id;
    while (currentId) {
      if (useBuilderUiStore.getState().lockedNodes[currentId]) return true;
      try {
        const node = query.node(currentId).get();
        currentId = node?.data?.parent || null;
      } catch (e) {
        break;
      }
    }
    return false;
  }, [query]);

  const handleCopy = async (id: string) => {
    try {
      const tree = query.node(id).toNodeTree();
      const json = JSON.stringify(tree);
      localStorage.setItem('proquelec_builder_clipboard', json);
      // Also copy to system clipboard for external use
      try {
        await navigator.clipboard.writeText(json);
      } catch (_) { /* Permission denied — ignore */ }
      toast.success(`Bloc "${query.node(id).get().data.displayName || query.node(id).get().data.name}" copié`);
    } catch (err) {
      toast.error('Erreur lors de la copie du bloc');
    }
  };

  const handlePaste = async (parentId: string) => {
    if (isNodeLocked(parentId)) {
      toast.error('Conteneur verrouillé : action impossible');
      return;
    }

    let clipboard = localStorage.getItem('proquelec_builder_clipboard');

    // Fallback: try reading from system clipboard
    if (!clipboard) {
      try {
        clipboard = await navigator.clipboard.readText();
      } catch (_) { /* Permission denied or empty */ }
    }

    if (!clipboard) {
      toast.error('Le presse-papier est vide');
      return;
    }

    try {
      const tree = JSON.parse(clipboard);

      // Generate unique IDs for all nodes (same logic as handleDuplicate)
      const idMap: Record<string, string> = {};
      const newTree: any = { rootNodeId: '', nodes: {} };
      for (const oldId of Object.keys(tree.nodes)) {
        const newId = 'paste_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
        idMap[oldId] = newId;
      }
      for (const [oldId, nodeData] of Object.entries(tree.nodes)) {
        const newId = idMap[oldId];
        const newNodeData: any = { ...(nodeData as any) };
        newNodeData.id = newId;
        if (newNodeData.parent && idMap[newNodeData.parent]) {
          newNodeData.parent = idMap[newNodeData.parent];
        }
        if (newNodeData.data) {
          newNodeData.data = { ...newNodeData.data };
        }
        newTree.nodes[newId] = newNodeData;
      }
      newTree.rootNodeId = idMap[tree.rootNodeId];

      const targetNode = query.node(parentId).get();
      let resolvedParentId = parentId;
      let resolvedIndex = undefined;

      // If pasting on a leaf block, paste as sibling
      if (parentId !== 'ROOT' && targetNode.data.name !== 'ContainerBlock' && targetNode.data.name !== 'ColumnsBlock') {
        resolvedParentId = targetNode.data.parent || 'ROOT';
        if (isNodeLocked(resolvedParentId)) {
          toast.error('Conteneur parent verrouillé : action impossible');
          return;
        }
        const siblings = query.node(resolvedParentId).childNodes();
        resolvedIndex = siblings.indexOf(parentId) + 1;
      }

      actions.addNodeTree(newTree, resolvedParentId, resolvedIndex);
      toast.success('Bloc collé avec succès');
    } catch (err) {
      console.error(err);
      toast.error('Impossible de coller le bloc');
    }
  };

  const handlePasteStyle = (targetId: string) => {
    if (isNodeLocked(targetId)) {
      toast.error('Bloc verrouillé : action impossible');
      return;
    }
    const clipboard = localStorage.getItem('proquelec_builder_clipboard');
    if (!clipboard) {
      toast.error('Presse-papier vide');
      return;
    }
    try {
      const tree = JSON.parse(clipboard);
      const sourceProps = tree.rootNode.data.props;
      const styleKeys = [
        'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
        'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'borderWidth', 'borderColor', 'borderStyle', 'borderRadius',
        'opacity', 'boxShadow', 'zIndex', 'customInlineCss', 'extraClasses'
      ];

      actions.setProp(targetId, (props: any) => {
        styleKeys.forEach(key => {
          if (sourceProps[key] !== undefined) {
            props[key] = JSON.parse(JSON.stringify(sourceProps[key]));
          }
        });
      });
      toast.success('Style collé uniquement');
    } catch (err) {
      toast.error('Impossible de coller les styles');
    }
  };

  const handleDuplicate = (id: string) => {
    if (id === 'ROOT') return;
    if (isNodeLocked(id)) {
      toast.error('Bloc verrouillé : action impossible');
      return;
    }
    try {
      const node = query.node(id).get();
      const parentId = node.data.parent || 'ROOT';
      if (isNodeLocked(parentId)) {
        toast.error('Conteneur parent verrouillé : action impossible');
        return;
      }
      const siblings = query.node(parentId).childNodes();
      const index = siblings.indexOf(id) + 1;

      // Utiliser toNodeTree + addNodeTree avec remplacement des IDs
      const tree = query.node(id).toNodeTree();
      // Remplacer les IDs dans le tree par des IDs uniques
      const idMap: Record<string, string> = {};
      const newTree: any = { rootNodeId: '', nodes: {} };
      for (const oldId of Object.keys(tree.nodes)) {
        const newId = 'dup_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
        idMap[oldId] = newId;
      }
      for (const [oldId, nodeData] of Object.entries(tree.nodes)) {
        const newId = idMap[oldId];
        const newNodeData: any = { ...(nodeData as any) };
        newNodeData.id = newId;
        // Mettre à jour le parent si c'était dans l'arbre
        if (newNodeData.parent && idMap[newNodeData.parent]) {
          newNodeData.parent = idMap[newNodeData.parent];
        }
        if (newNodeData.data) {
          newNodeData.data = { ...newNodeData.data };
        }
        newTree.nodes[newId] = newNodeData;
      }
      newTree.rootNodeId = idMap[tree.rootNodeId];
      actions.addNodeTree(newTree, parentId, index);

      toast.success('Bloc dupliqué avec succès (ID unique)');
    } catch (err) {
      console.error('Duplicate error:', err);
      toast.error('Erreur lors de la duplication');
    }
  };

  const handleResetStyle = (id: string) => {
    if (isNodeLocked(id)) {
      toast.error('Bloc verrouillé : action impossible');
      return;
    }
    try {
      const styleKeys = [
        'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
        'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'borderWidth', 'borderColor', 'borderStyle', 'borderRadius',
        'opacity', 'boxShadow', 'zIndex', 'customInlineCss', 'extraClasses'
      ];

      actions.setProp(id, (props: any) => {
        styleKeys.forEach(key => {
          delete props[key];
        });
      });
      toast.success('Style réinitialisé');
    } catch (err) {
      toast.error('Erreur lors de la réinitialisation');
    }
  };

  const handleResetBlock = (id: string) => {
    if (isNodeLocked(id)) {
      toast.error('Bloc verrouillé : action impossible');
      return;
    }
    try {
      const node = query.node(id).get();
      const ComponentType = node.data.type as any;
      const defaultProps: Record<string, any> = ComponentType?.craft?.props || {};

      actions.setProp(id, (props: any) => {
        // Remet chaque prop à sa valeur par défaut
        Object.entries(defaultProps).forEach(([key, value]) => {
          props[key] = JSON.parse(JSON.stringify(value));
        });
        // Supprime les props qui ne sont pas dans les valeurs par défaut
        Object.keys(props).forEach(key => {
          if (!(key in defaultProps)) {
            delete props[key];
          }
        });
      });

      const displayName = node.data.displayName || node.data.name || 'Bloc';
      toast.success(`"${displayName}" réinitialisé aux valeurs par défaut`);
    } catch (err) {
      console.error('ResetBlock error:', err);
      toast.error('Erreur lors de la réinitialisation du bloc');
    }
  };

  const handleMoveUp = (id: string) => {
    if (isNodeLocked(id)) {
      toast.error('Bloc verrouillé : action impossible');
      return;
    }
    const parentId = query.node(id).get().data.parent;
    if (!parentId) return;
    if (isNodeLocked(parentId)) {
      toast.error('Conteneur parent verrouillé : action impossible');
      return;
    }
    const siblings = query.node(parentId).childNodes();
    const idx = siblings.indexOf(id);
    if (idx > 0) {
      actions.move(id, parentId, idx - 1);
      toast.success('Bloc déplacé vers le haut');
    }
  };

  const handleMoveDown = (id: string) => {
    if (isNodeLocked(id)) {
      toast.error('Bloc verrouillé : action impossible');
      return;
    }
    const parentId = query.node(id).get().data.parent;
    if (!parentId) return;
    if (isNodeLocked(parentId)) {
      toast.error('Conteneur parent verrouillé : action impossible');
      return;
    }
    const siblings = query.node(parentId).childNodes();
    const idx = siblings.indexOf(id);
    if (idx < siblings.length - 1) {
      actions.move(id, parentId, idx + 2);
      toast.success('Bloc déplacé vers le bas');
    }
  };

  const handleSaveAsTemplate = async (id: string) => {
    try {
      const name = window.prompt("Nom du modèle :");
      if (!name) return;

      const tree = query.node(id).toNodeTree();
      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/page-components', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          name,
          category: 'Mes Modèles',
          default_structure: JSON.stringify(tree),
          thumbnail_url: null,
          is_global: false
        })
      });

      if (!response.ok) {
        throw new Error('Erreur réseau lors de la sauvegarde');
      }

      await response.json();
      toast.success(`Modèle "${name}" enregistré avec succès !`);
      window.dispatchEvent(new CustomEvent('god-templates-updated'));
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la sauvegarde du modèle");
    }
  };

  const handleSaveAsGlobal = (id: string) => {
    try {
      const name = window.prompt("Nom du bloc global :");
      if (!name) return;

      const tree = query.node(id).toNodeTree();
      const addBlock = useGlobalBlocksStore.getState().addBlock;
      addBlock({ name, serializedNode: tree, category: 'Général' });
      toast.success(`Bloc global "${name}" enregistré !`);
      window.dispatchEvent(new CustomEvent('god-global-blocks-updated'));
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la sauvegarde du bloc global");
    }
  };

  return (
    <div className="flex-1 bg-[#0a0a15] overflow-auto custom-scrollbar flex flex-col relative">
      {/* Top bar: device info + zoom */}
      <div className="sticky top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2 bg-[#0a0a15]/95 backdrop-blur border-b border-[#1a1a2a]">
        <span className="text-[11px] text-slate-500 font-mono">{deviceLabel}</span>

        <div className="flex items-center gap-2">
          {!isEnabled && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Eye size={10} /> MODE APERÇU
            </span>
          )}

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-[#151521] border border-[#252538] rounded-lg px-2 py-1">
            <button
              onClick={() => setZoom(z => Math.max(50, z - 25))}
              className="text-slate-400 hover:text-white text-xs w-4 text-center transition-colors"
              title="Zoom out"
            >−</button>
            <span className="text-[11px] text-slate-400 font-mono w-10 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(z => Math.min(150, z + 25))}
              className="text-slate-400 hover:text-white text-xs w-4 text-center transition-colors"
              title="Zoom in"
            >+</button>
            <button
              onClick={() => setZoom(100)}
              className="text-slate-500 hover:text-white text-[10px] ml-1 transition-colors"
              title="Reset zoom"
            >↺</button>
          </div>
        </div>
      </div>

      {/* Canvas area */}
      <div
        className="flex-1 p-6 flex justify-center min-h-full relative"
        onContextMenu={handleContextMenu}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredNodeId(null)}
      >
        <div
          data-viewport={device}
          className="canvas-viewport-wrapper"
          style={{
            '--viewport-width': VIEWPORT_WIDTHS[device],
            width: VIEWPORT_WIDTHS[device],
          }}
        >
          <div
            ref={canvasRef}
            data-builder-canvas
            className="relative bg-white shadow-2xl shadow-black/40 transition-all duration-300 ease-out"
            style={{
              width: '100%',
              minHeight: '900px',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              marginBottom: zoom < 100 ? `-${(1 - zoom / 100) * 900}px` : '0',
              outline: !isEnabled ? 'none' : '1px solid rgba(99,102,241,0.15)',
            }}
          >
            <BuilderErrorBoundary>
              <Frame>
                <Element is={ContainerBlock} canvas padding={0} backgroundColor="#ffffff" maxWidth="100%">
                  <Element is={HeroBlock} canvas />
                  <Element is={ContainerBlock} canvas padding={60} paddingY={60} backgroundColor="#f8fafc">
                    <TextBlock
                      text="🚀 GOD MODE — ÉDITEUR CENTRALISÉ"
                      fontSize={28} textAlign="center"
                      color="#0f172a" fontWeight="900"
                    />
                    <SpacerBlock height={16} />
                    <TextBlock
                      text="Glissez des blocs depuis la barre de gauche. Cliquez pour éditer leurs propriétés dans le panneau de droite."
                      fontSize={16} textAlign="center" color="#64748b"
                    />
                  </Element>
                  <Element is={StatsBlock} canvas />
                </Element>
              </Frame>
            </BuilderErrorBoundary>

            <EmptyCanvasHint />
          </div>
        </div>
      </div>

      {/* Breadcrumb overlay */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none flex justify-center pb-4">
        <Breadcrumb />
      </div>

      {/* Floating Action Bar */}
      <FloatingActionBar />

      {/* Sleek Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[99999] bg-[#0c0c14]/90 backdrop-blur-md border border-[#252538] rounded-xl p-1.5 shadow-2xl w-52 text-left animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-2.5 py-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider border-b border-[#252538] mb-1 flex items-center justify-between gap-1.5">
            <span className="flex items-center gap-1.5 truncate">
              <Layers size={10} className="text-indigo-400 shrink-0" />
              {contextMenu.nodeName}
            </span>
            {isNodeLocked(contextMenu.nodeId) && (
              <span className="text-red-400 text-[8px] font-bold bg-red-500/10 px-1 py-0.5 rounded border border-red-500/25 uppercase shrink-0">
                🔒 Verrouillé
              </span>
            )}
          </div>

          {/* Action List */}
          <div className="space-y-0.5">
            <button
              onClick={() => { handleCopy(contextMenu.nodeId); setContextMenu(null); }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors"
            >
              <Copy size={13} className="text-indigo-400 shrink-0" />
              Copier
            </button>
            <button
              onClick={() => { handlePaste(contextMenu.nodeId); setContextMenu(null); }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors"
            >
              <Clipboard size={13} className="text-emerald-400 shrink-0" />
              Coller
            </button>
            <button
              onClick={() => { handlePasteStyle(contextMenu.nodeId); setContextMenu(null); }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors"
            >
              <Paintbrush size={13} className="text-amber-400 shrink-0" />
              Coller le style uniquement
            </button>

            {contextMenu.nodeId !== 'ROOT' && (
              <>
                <div className="h-px bg-[#252538] my-1" />
                <button
                  onClick={() => { handleSaveAsTemplate(contextMenu.nodeId); setContextMenu(null); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors"
                >
                  <Layers size={13} className="text-amber-400 shrink-0" />
                  Enregistrer comme modèle
                </button>
                <button
                  onClick={() => { handleSaveAsGlobal(contextMenu.nodeId); setContextMenu(null); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors"
                >
                  <Save size={13} className="text-emerald-400 shrink-0" />
                  Enregistrer comme Global
                </button>
                <button
                  onClick={() => { handleDuplicate(contextMenu.nodeId); setContextMenu(null); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors"
                >
                  <Copy size={13} className="text-sky-400 shrink-0" />
                  Dupliquer
                </button>
                <button
                  onClick={() => { handleMoveUp(contextMenu.nodeId); setContextMenu(null); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors"
                >
                  <ChevronUp size={13} className="text-slate-400 shrink-0" />
                  Déplacer vers le haut
                </button>
                <button
                  onClick={() => { handleMoveDown(contextMenu.nodeId); setContextMenu(null); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors"
                >
                  <ChevronDown size={13} className="text-slate-400 shrink-0" />
                  Déplacer vers le bas
                </button>

                <div className="h-px bg-[#252538] my-1" />
                <button
                  onClick={() => { handleResetStyle(contextMenu.nodeId); setContextMenu(null); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors"
                >
                  <RefreshCw size={13} className="text-yellow-500 shrink-0" />
                  Réinitialiser le style
                </button>
                <button
                  onClick={() => { handleResetBlock(contextMenu.nodeId); setContextMenu(null); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1f1f35] text-xs transition-colors"
                >
                  <RefreshCw size={13} className="text-red-400 shrink-0" />
                  Réinitialiser le bloc
                </button>
                <button
                  onClick={() => {
                    if (isNodeLocked(contextMenu.nodeId)) {
                      toast.error('Bloc verrouillé : action impossible');
                      return;
                    }
                    actions.delete(contextMenu.nodeId);
                    setContextMenu(null);
                    toast.success('Bloc supprimé');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500/20 text-xs transition-colors font-semibold"
                >
                  <Trash2 size={13} className="text-rose-500 shrink-0" />
                  Supprimer
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {/* Visual Canvas Overlays (Hover Outlines & Spacing Guides) */}
      <CanvasOverlays />

      <style>{`
        /* Responsive viewport simulation */
        .canvas-viewport-wrapper {
          transition: width 0.3s ease-out;
        }

        /* Simulate media queries based on data-viewport attribute */
        .canvas-viewport-wrapper[data-viewport="mobile"] {
          --responsive-breakpoint: 390px;
        }
        .canvas-viewport-wrapper[data-viewport="tablet"] {
          --responsive-breakpoint: 768px;
        }
        .canvas-viewport-wrapper[data-viewport="desktop"] {
          --responsive-breakpoint: 100%;
        }

        /* Inside mobile viewport, force blocks to behave as on a narrow screen */
        .canvas-viewport-wrapper[data-viewport="mobile"] [data-builder-canvas] .container-block {
          --viewport-width: 390px;
        }
        .canvas-viewport-wrapper[data-viewport="tablet"] [data-builder-canvas] .container-block {
          --viewport-width: 768px;
        }

        /* Hide mobile/tablet-only indicators when not in that viewport */
        .canvas-viewport-wrapper[data-viewport="desktop"] .responsive-only-mobile,
        .canvas-viewport-wrapper[data-viewport="desktop"] .responsive-only-tablet { display: none; }
        .canvas-viewport-wrapper[data-viewport="tablet"] .responsive-only-desktop,
        .canvas-viewport-wrapper[data-viewport="tablet"] .responsive-only-mobile { display: none; }
        .canvas-viewport-wrapper[data-viewport="mobile"] .responsive-only-desktop,
        .canvas-viewport-wrapper[data-viewport="mobile"] .responsive-only-tablet { display: none; }

        /* Style for hidden nodes inside builder canvas */
        .proquelec-builder-node[data-hidden="true"] {
          opacity: 0.35 !important;
          outline: 1px dashed #f59e0b !important;
          background-image: repeating-linear-gradient(45deg, rgba(245, 158, 11, 0.05), rgba(245, 158, 11, 0.05) 10px, transparent 10px, transparent 20px) !important;
        }

        /* Style for locked nodes inside builder canvas */
        .proquelec-builder-node[data-locked="true"] {
          pointer-events: none !important;
          user-select: none !important;
        }

        /* Entrance Animations — paused by default, triggered on scroll via IntersectionObserver */
        .animate-fadeIn, .animate-fadeInUp, .animate-fadeInDown, .animate-fadeInLeft, .animate-fadeInRight,
        .animate-slideInUp, .animate-slideInDown, .animate-slideInLeft, .animate-slideInRight,
        .animate-zoomIn, .animate-zoomInUp, .animate-zoomInDown,
        .animate-bounceIn, .animate-flipInX, .animate-flipInY {
          animation-play-state: paused !important;
        }
        .animate-fadeIn.is-visible, .animate-fadeInUp.is-visible, .animate-fadeInDown.is-visible, .animate-fadeInLeft.is-visible, .animate-fadeInRight.is-visible,
        .animate-slideInUp.is-visible, .animate-slideInDown.is-visible, .animate-slideInLeft.is-visible, .animate-slideInRight.is-visible,
        .animate-zoomIn.is-visible, .animate-zoomInUp.is-visible, .animate-zoomInDown.is-visible,
        .animate-bounceIn.is-visible, .animate-flipInX.is-visible, .animate-flipInY.is-visible {
          animation-play-state: running !important;
        }
        .animate-fadeIn { animation: anim-fadeIn var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }
        .animate-fadeInUp { animation: anim-fadeInUp var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }
        .animate-fadeInDown { animation: anim-fadeInDown var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }
        .animate-fadeInLeft { animation: anim-fadeInLeft var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }
        .animate-fadeInRight { animation: anim-fadeInRight var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }
        .animate-slideInUp { animation: anim-slideInUp var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }
        .animate-slideInDown { animation: anim-slideInDown var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }
        .animate-slideInLeft { animation: anim-slideInLeft var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }
        .animate-slideInRight { animation: anim-slideInRight var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }
        .animate-zoomIn { animation: anim-zoomIn var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }
        .animate-zoomInUp { animation: anim-zoomInUp var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }
        .animate-zoomInDown { animation: anim-zoomInDown var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }
        .animate-bounceIn { animation: anim-bounceIn var(--anim-duration, 800ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }
        .animate-flipInX { animation: anim-flipInX var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }
        .animate-flipInY { animation: anim-flipInY var(--anim-duration, 600ms) var(--anim-easing, ease-out) var(--anim-delay, 0ms) both; }

        @keyframes anim-fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes anim-fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes anim-fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes anim-fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes anim-fadeInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes anim-slideInUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes anim-slideInDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
        @keyframes anim-slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes anim-slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes anim-zoomIn { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }
        @keyframes anim-zoomInUp { from { opacity: 0; transform: scale(0.6) translateY(30px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes anim-zoomInDown { from { opacity: 0; transform: scale(0.6) translateY(-30px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes anim-bounceIn { from { opacity: 0; transform: scale(0.3); } 50% { transform: scale(1.05); } 70% { transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes anim-flipInX { from { opacity: 0; transform: perspective(400px) rotateX(90deg); } to { opacity: 1; transform: perspective(400px) rotateX(0); } }
        @keyframes anim-flipInY { from { opacity: 0; transform: perspective(400px) rotateY(90deg); } to { opacity: 1; transform: perspective(400px) rotateY(0); } }
      `}</style>
    </div>
  );
};
